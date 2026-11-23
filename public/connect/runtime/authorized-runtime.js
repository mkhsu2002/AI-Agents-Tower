import { canonical } from './canonical.mjs';
const hash = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(n => n.toString(16).padStart(2, '0')).join('');
// Generic caller policy: no publisher, agent role, provider protocol adapter or network-specific branch.
import { Engine } from './source/vendor/runtime/engine.js';
import { Operation, strictJson, validateDefinition, validateManifest } from './source/safety.js';
import { AgentNetwork, validateNetwork, parseExternalAgent } from './source/vendor/runtime/kernel.js';
import { consumeRemoteBudget } from './source/vendor/runtime/runner.js';
import { safeName } from './source/vendor/runtime/runner.js';
function publishedDefaults(manifest, definition, source) {
  const endpoint = manifest?.llm_router?.base_url;
  const model = definition?.llm_config?.model_name;
  if (typeof endpoint !== 'string' || manifest.llm_router.mock !== false) throw Error('MISSING_PUBLISHED_ROUTER');
  if (typeof model !== 'string' || !model.trim()) throw Error('MISSING_PUBLISHED_MODEL');
  const route = new URL(endpoint);
  if (route.origin !== location.origin || route.username || route.password || route.search || route.hash) throw Error('PUBLISHED_ROUTER_SCOPE_REJECTED');
  validateDefinition(definition);
  if (definition.tools.some(agent => agent.llm_config?.model_name && agent.llm_config.model_name !== model)) throw Error('AMBIGUOUS_PUBLISHED_MODEL');
  return Object.freeze({ endpoint, model, source });
}
export async function readPublishedDefaults(networkUrl) {
  const url = new URL(networkUrl); if (url.origin !== location.origin) throw Error('CALLER_SOURCE_REQUIRED');
  const base = new URL('./', url).href.replace(/\/$/, ''); const name = url.pathname.split('/').at(-1);
  const op = new Operation(10000);
  try {
    const read = async path => { const r = await op.fetch(path); if (!r.ok) throw Error('PUBLIC_ARTIFACT_UNAVAILABLE'); return strictJson(await op.read(r.text())); };
    const manifest = validateManifest(await read(base + '/agent-manifest.json'), base);
    const entry = manifest.networks.find(n => n.name === name); if (!entry) throw Error('EXACT_NETWORK_REQUIRED');
    const source = new URL(entry.hocon, base + '/').href;
    return publishedDefaults(manifest, await read(source), source);
  } finally { op.dispose(); }
}
export async function prepareRuntime(options) {
  if (!options || Object.keys(options).some(k => !['enabled','networkUrl','input','maxCalls','actions','approve','authorization','executionNetworkUrl'].includes(k))) throw Error('UNKNOWN_CALLER_POLICY_FIELD');
  const { enabled = false, networkUrl, input, maxCalls, actions, approve, authorization, executionNetworkUrl } = options;
  if (!enabled) throw Error('KEYLESS_DISABLED');
  const caller = location.origin;
  if (typeof approve !== 'function' || !Array.isArray(actions) || actions.length > 4 || !Number.isSafeInteger(maxCalls) || maxCalls < 1 || maxCalls > 8 || typeof input !== 'string' || input.length > 1500 || actions.some(a => a.definition.effect !== 'read')) throw Error('KEYLESS_POLICY_REJECTED');
  const artifacts = new Map(), toolNames = new Set(), visited = new Set(), visiting = new Set();
  const op = new Operation(10000); let root, defaults;
  try {
    async function inspect(url, depth = 0, allowed) {
      if (visiting.has(url)) throw Error('PREFLIGHT_CYCLE');
      if (visited.has(url)) return;
      if (depth > 3 || visited.size >= 4) throw Error('PREFLIGHT_BUDGET_EXCEEDED');
      const named = new URL(url); const origin = named.origin;
      if (origin !== caller && (!allowed?.includes(origin) || await approve(origin, 'public network') !== true)) throw Error('PEER_NOT_APPROVED');
      visited.add(url); visiting.add(url);
      const name = named.pathname.split('/').at(-1), base = new URL('./', named).href.replace(/\/$/, '');
      const get = async url => { const r = await op.fetch(url); if (!r.ok) throw Error('PUBLIC_ARTIFACT_UNAVAILABLE'); const text = await op.read(r.text()); artifacts.set(url, text); return strictJson(text); };
      const manifest = validateManifest(await get(base + '/agent-manifest.json'), base);
      const matches = manifest.networks.filter(n => n.name === name); if (matches.length !== 1) throw Error('EXACT_NETWORK_REQUIRED');
      const entry = matches[0]; const source = new URL(entry.hocon, base + '/').href;
      const rawDefinition = await get(source);
      if (!root) {
        if (origin !== caller) throw Error('CALLER_SOURCE_REQUIRED');
        defaults = publishedDefaults(manifest, rawDefinition, source);
        if (await approve(caller, 'model', defaults) !== true) throw Error('CONSENT_DENIED');
      }
      const definition = validateDefinition(rawDefinition);
      const parsed = new AgentNetwork(definition, name); if (validateNetwork(parsed).errors.length || parsed.findFrontMan() !== entry.front_man) throw Error('INVALID_NETWORK');
      if (!root) root = { base, name };
      for (const agent of definition.tools) {
        toolNames.add(agent.name);
        for (const ref of agent.tools) {
          if (typeof ref !== 'string') throw Error('CAPABILITY_NOT_APPROVED');
          if (/^https?:/.test(ref)) { toolNames.add(safeName(parseExternalAgent(ref, base).agentName)); await inspect(ref, depth + 1, manifest.allowed_peers); }
          else if (!definition.tools.some(a => a.name === ref)) throw Error('UNKNOWN_TOOL');
        }
      }
      visiting.delete(url);
    }
    await inspect(networkUrl);
  } finally { op.dispose(); }
  if(executionNetworkUrl && (!visited.has(executionNetworkUrl) || new URL(executionNetworkUrl).origin===caller))throw Error('SELECTED_NETWORK_NOT_APPROVED');
  const issuer = new URL(authorization?.issuer), revokeUrl = new URL(authorization?.revoke);
  if ([issuer, revokeUrl].some(u => u.origin !== caller || u.search || u.hash || u.username || u.password)) throw Error('AUTHORITY_SCOPE_REJECTED');
  const scope = { ...(executionNetworkUrl?{executionNetworkUrl}:{}), callerOrigin: caller, router: defaults.endpoint, model: defaults.model, inputHash: await hash(input), artifacts: await Promise.all([...artifacts].sort(([a],[b]) => a.localeCompare(b)).map(async ([url,text]) => ({ url, hash: await hash(text) }))), operations: actions.map(a => ({ name: a.definition.name, effect: a.definition.effect })), maxCalls };
  const scopeHash = await hash(canonical(scope));
  if (await approve(caller, 'model', defaults) !== true) throw Error('CONSENT_DENIED');
  const authOp = new Operation(10000); let token = '', expires = 0;
  try {
    const request = async (url, body, bearer) => { const response = await authOp.fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}) }, body: JSON.stringify(body) }); if (!response.ok) throw Error('AUTHORIZATION_HTTP_' + response.status); return strictJson(await authOp.read(response.text())); };
    const challenge = await request(issuer.href, { scope, acknowledgement: scopeHash });
    if (typeof challenge.challenge !== 'string' || !/^[a-f0-9]{48}$/.test(challenge.challenge)) throw Error('CHALLENGE_INVALID');
    if (await approve(caller, 'model', defaults) !== true) throw Error('CONSENT_DENIED');
    const offer = await request(issuer.href, { scope, acknowledgement: scopeHash, challenge: challenge.challenge, consent: true });
    if (offer.token_type !== 'Bearer' || typeof offer.access_token !== 'string' || !/^[a-f0-9]{48}$/.test(offer.access_token) || !Number.isInteger(offer.expires_in) || offer.expires_in < 1 || offer.expires_in > 30) throw Error('AUTHORIZATION_INVALID');
    token = offer.access_token; expires = Date.now() + offer.expires_in * 1000;
  } finally { authOp.dispose(); }
  const { endpoint, model } = defaults;
  let remaining = maxCalls, used = false, closed = false;
  const policy = {
    artifacts, defaultModel: model,
    async authorization(base, activeModel) {
      if (base !== endpoint || activeModel !== model || closed || !token || Date.now() >= expires || await approve(caller, 'model', defaults) !== true) throw Error('AUTHORIZATION_UNAVAILABLE');
      return token;
    },
    async claim(base, activeModel, messages, tools) {
      if (await approve(caller, 'model', defaults) !== true) throw Error('CONSENT_DENIED');
      if (base !== endpoint) throw Error('KEYLESS_ROUTE_REJECTED');
      if (activeModel !== model) throw Error('KEYLESS_MODEL_REJECTED');
      if (closed || remaining <= 0) throw Error('KEYLESS_BUDGET_REJECTED');
      if (!Array.isArray(messages) || messages.length > 24 || !messages.some(m => m.role === 'user') || messages.some(m => m.role === 'user' && m.content !== input)) throw Error('KEYLESS_INPUT_REJECTED');
      if ((tools ?? []).some(t => !toolNames.has(t.function?.name))) throw Error('KEYLESS_TOOL_REJECTED');
      if (JSON.stringify({ messages, tools }).length > 12000) throw Error('KEYLESS_SIZE_REJECTED');
      remaining--;
    },
  };
  const engine = new Engine({ originUrl: root.base, networkName: root.name, keylessPolicy: policy, timeoutMs: 10000 });
  engine.onConsent = async info => { if (await approve(info.peerOrigin, info.kind) === true) return 'allow'; engine.cancel(); return 'decline'; };
  for (const action of actions) engine.actions.register({ base: root.base, network: root.name }, action.definition, action.execute);
  const cancel = async () => {
    closed = true; engine.cancel(); const revoked = token; token = '';
    if (!revoked) return;
    const cancelOp = new Operation(1000);
    try { const response = await cancelOp.fetch(revokeUrl.href, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + revoked }, body: '{}' }); if (!response.ok) throw Error('REVOCATION_FAILED'); }
    finally { cancelOp.dispose(); }
  };
  return { engine, defaults, cancel,
    async run(text, options) {
      if (used || text !== input) throw Error('FIXED_INPUT_REQUIRED'); used = true;
      try {
        if(!executionNetworkUrl)return await engine.runTurn(text, options);
        return await engine._bounded(async()=>{
          await engine.loadTop();
          const decision=await engine.requestConsent({kind:'network',phase:'invoke',peerOrigin:new URL(executionNetworkUrl).origin,url:executionNetworkUrl,requestText:text});
          if(decision!=='allow')throw Error('SELECTED_NETWORK_DENIED');
          const chain=[`${engine.top.base}::${engine.top.network.name}`];
          const composition={remoteCalls:0,peerCalls:new Map(),maxRemoteCalls:4,maxCallsPerPeer:1,agentCalls:0,maxAgentCalls:24,deadline:Date.now()+90000};
          const target=new URL(executionNetworkUrl),peerBase=new URL('./',target).href.replace(/\/$/,'');
          if(consumeRemoteBudget(composition,peerBase+'::'+target.pathname.split('/').at(-1)))throw Error('SELECTED_NETWORK_BUDGET');
          const span=engine.trace.start('run',{selectedNetwork:executionNetworkUrl});
          const session=await engine.resolveRemote(executionNetworkUrl,chain,span,engine.top.manifest);
          // No private/context field is forwarded by this explicit selection API.
          const result=await session.invoke({user_message:{type:'HUMAN',text},sly_data:{},chat_filter:{chat_filter_type:'MINIMAL'}},{parentSpan:span,chain,composition,operation:engine.operation});
          engine.operation.assert();if(!result||typeof result!=='object'||typeof result.text!=='string')throw Error('SELECTED_NETWORK_FAILED');
          result.turnId=span;engine.rememberActionPresentation(result);engine.trace.end(span,{selectedNetwork:executionNetworkUrl});return result;
        });
      }
      catch (e) { try { await cancel(); } catch { throw Error('RUN_FAILED_REVOCATION_UNCONFIRMED'); } throw e; }
      finally { closed = true; token = ''; }
    }, get calls() { return maxCalls - remaining; }
  };
}
