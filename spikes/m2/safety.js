// Tower's deliberately narrow, data-only runtime profile; not a complete HOCON implementation.
import { network, manifest } from './schema/validators.js';
export const policyError = message => Object.assign(new Error(message), { code: 'RUNTIME_POLICY' });
export const LIMITS = Object.freeze({ artifactBytes: 131072, responseBytes: 262144, depth: 16, nodes: 10000 });
export function checkedUrl(value, base) {
  let url; try { url = new URL(value, base); } catch { throw policyError('Invalid destination URL.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash) throw policyError('Only credential-free HTTP(S) destinations without fragments are supported.');
  if (url.protocol === 'http:' && !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw policyError('HTTP is supported only for loopback development.');
  return url;
}
export function strictJson(text) {
  if (text.length > LIMITS.artifactBytes || new TextEncoder().encode(text).length > LIMITS.artifactBytes) throw policyError('Artifact exceeds 131072 bytes.');
  let value;
  try { value = JSON.parse(text); } catch { throw policyError('Artifact must be valid JSON; HOCON and executable definitions are unsupported.'); }
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|[{}[\]:,]|[^\s{}[\]:,]+/g) || [];
  const scopes = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '{' || token === '[') { scopes.push(token === '{' ? new Set() : null); if (scopes.length > LIMITS.depth) throw policyError('Artifact nesting limit exceeded.'); }
    else if (token === '}' || token === ']') scopes.pop();
    else if (token.startsWith('"') && tokens[i + 1] === ':') { const key = JSON.parse(token); const keys = scopes.at(-1); if (keys?.has(key)) throw policyError('Duplicate JSON keys are not allowed.'); keys?.add(key); }
  }
  let nodes = 0; const pending = [value];
  while (pending.length) { const item = pending.pop(); if (++nodes > LIMITS.nodes) throw policyError('Artifact node limit exceeded.'); if (item && typeof item === 'object') pending.push(...Object.values(item)); }
  return value;
}
export function validateManifest(value, base) {
  if (!manifest(value)) throw policyError('Manifest does not match the supported strict schema.');
  const names = new Set();
  for (const entry of value.networks) {
    if (names.has(entry.name)) throw policyError('Duplicate manifest network names are not allowed.'); names.add(entry.name);
    if (checkedUrl(entry.hocon, `${base}/`).origin !== checkedUrl(base).origin) throw policyError('Network artifacts must stay on their authorized publishing origin.');
  }
  for (const peer of value.allowed_peers) if (checkedUrl(peer).origin !== peer) throw policyError('Peer policy must list exact origins.');
  if (!(value.llm_router.mock === true && value.llm_router.base_url === "browser://mock")) checkedUrl(value.llm_router.base_url);
  return value;
}
export function validateDefinition(value) {
  if (!network(value)) throw policyError('Network does not match the supported strict schema.');
  const names = new Set(value.tools.map(agent => agent.name));
  if (names.size !== value.tools.length) throw policyError('Duplicate agent names are not allowed.');
  for (const agent of value.tools) {
    const properties = agent.function.parameters.properties;
    if ((agent.function.parameters.required || []).some(name => !Object.hasOwn(properties, name))) throw policyError('Invocation schema requires an undefined property.');
    const aliases = new Set();
    const addAlias = name => {
      const alias = name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^_+/, '').slice(0, 60) || 'tool';
      if (aliases.has(alias)) throw policyError('Ambiguous duplicate tool references are not allowed.'); aliases.add(alias);
    };
    for (const ref of agent.tools) {
      if (typeof ref === 'object') { checkedUrl(ref.url); for (const name of ref.tools) addAlias(`mcp_${name}`); }
      else if (names.has(ref)) addAlias(ref);
      else addAlias(checkedUrl(ref).pathname.replace(/^\//, ''));
    }
  }
  return value;
}
export class Operation {
  constructor(timeoutMs = 10000) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30000) throw policyError('Runtime timeout must be 100–30000 milliseconds.');
    this.controller = new AbortController(); this.signal = this.controller.signal;
    this.deadline = performance.now() + timeoutMs;
    this.timer = setTimeout(() => this.cancel('Runtime deadline exceeded. Remote outcomes may be unknown; do not retry automatically.'), timeoutMs);
  }
  assert() { if (performance.now() >= this.deadline && !this.signal.aborted) this.cancel('Runtime deadline exceeded. Remote outcomes may be unknown; do not retry automatically.'); this.signal.throwIfAborted(); }
  cancel(message = 'Runtime cancelled. Remote outcomes may be unknown; do not retry automatically.') { this.controller.abort(new Error(message)); }
  dispose() { clearTimeout(this.timer); this.cancel('Runtime operation closed.'); }
  async wait(promise) {
    if (this.signal.aborted) { Promise.resolve(promise).catch(() => {}); this.assert(); }
    let listener;
    try { const result = await Promise.race([promise, new Promise((_, reject) => { listener = () => reject(this.signal.reason); this.signal.addEventListener('abort', listener, { once: true }); })]); this.assert(); return result; }
    finally { this.signal.removeEventListener('abort', listener); }
  }
  async read(promise) {
    try { return await this.wait(promise); }
    catch { this.assert(); throw policyError('Response body is invalid, interrupted or exceeds the supported byte limit.'); }
  }
  async fetch(url, options = {}) {
    this.assert(); checkedUrl(url);
    if (options.body !== undefined && (typeof options.body !== 'string' || new TextEncoder().encode(options.body).length > LIMITS.responseBytes)) throw policyError('Request exceeds the supported JSON byte limit.');
    const signal = options.signal ? AbortSignal.any([this.signal, options.signal]) : this.signal;
    // Blocking every redirect avoids contacting a destination before consent and
    // forwarding POST arguments, router credentials or MCP headers to a new hop.
    let response;
    try { response = await this.wait(fetch(url, { ...options, signal, redirect: 'error', credentials: 'omit' })); }
    catch { this.assert(); throw policyError('Request failed or redirected; redirect destinations are not authorized.'); }
    const length = Number(response.headers.get('content-length'));
    if (length > LIMITS.responseBytes) throw policyError('Response exceeds the supported byte limit.');
    let bytes = 0;
    const body = response.body?.pipeThrough(new TransformStream({ transform(chunk, controller) { bytes += chunk.byteLength; if (bytes > LIMITS.responseBytes) throw policyError('Response exceeds the supported byte limit.'); controller.enqueue(chunk); } }));
    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
  }
}
