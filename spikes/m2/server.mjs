// Local, deterministic test infrastructure. This is not an inference service or production MCP server.
import { createServer as createHttpServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { parseBundle } from '../../src/domain/homebundle.ts';
import example from '../../public/examples/welcome.homebundle.json' with { type: 'json' };

const A = 'http://127.0.0.1:4180';
const B = 'http://127.0.0.1:4181';
const provenance = JSON.parse(await readFile(new URL('./vendor/provenance.json', import.meta.url), 'utf8'));
const vendorPaths = new Set(provenance.files.map(file => file.path));
const json = (res, body, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
async function body(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (Buffer.byteLength(data) > 262144) throw new Error('Fixture request too large.');
  }
  return JSON.parse(data);
}
const fn = description => ({ description, parameters: { type: 'object', properties: { request: { type: 'string' } }, required: ['request'] } });
function caller(scenario) {
  return { metadata: { description: 'Local scripted caller fixture' }, max_steps: 4, llm_config: { model_name: 'neuro-san-mock-spike' }, tools: [{ name: 'caller', function: fn('Caller fixture'), instructions: '[CALLER] Delegate to the Tower network. This is a scripted test.', tools: [`${B}/${scenario}/tower-home-builder`] }] };
}
function tower(scenario) {
  return { metadata: { description: 'Local two-agent Tower feasibility fixture, not a released network' }, max_steps: 4, llm_config: { model_name: 'neuro-san-mock-spike' }, tools: [
    { name: 'reception', function: fn('Organize the home request'), instructions: '[RECEPTION] Delegate the request to home_builder and return its validation result.', tools: [scenario === 'invalid' ? 'missing_builder' : 'home_builder'] },
    { name: 'home_builder', function: fn('Prepare and validate portable home text'), instructions: '[BUILDER] Use the read-only validator. Do not claim persistence or publication.', tools: [{ url: `${B}/${scenario}/mcp`, tools: ['validate_home_bundle'] }] },
  ] };
}
function manifest(scenario, isCaller) {
  return {
    networks: [{ name: isCaller ? 'caller' : scenario === 'missing' ? 'another-network' : 'tower-home-builder', front_man: isCaller ? 'caller' : 'reception', hocon: isCaller ? 'caller.network.json' : 'tower.network.json' }],
    llm_router: { base_url: isCaller ? `${A}/router/${scenario}/v1` : `${B}/must-not-run`, mock: true },
    allowed_peers: [B], deployment: { mode: 'static' },
    metadata: { warning: 'MOCK ONLY. No model inference. Local test fixture.' },
  };
}
async function router(req, res, scenario) {
  const input = await body(req);
  if (scenario === 'provider-error') return json(res, { error: 'Scripted provider failure, no model called.' }, 503);
  const final = input.messages.at(-1)?.role === 'tool';
  const tool = input.tools?.[0]?.function?.name;
  const isBuilder = input.messages[0]?.content?.includes('[BUILDER]');
  const args = isBuilder ? { bundleJson: scenario === 'invalid-bundle' ? '{"schemaVersion":"9"}' : JSON.stringify(example) } : { request: 'Validate a synthetic local HomeBundle.' };
  const delta = !final && tool
    ? { tool_calls: [{ index: 0, id: `fixture_${tool}`, type: 'function', function: { name: tool, arguments: JSON.stringify(args) } }] }
    : { content: `MOCK ONLY — scripted result: ${input.messages.at(-1)?.content ?? 'No tool result'}` };
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'X-Nsdeploy-LLM-Route': 'mock' });
  res.end(`data: ${JSON.stringify({ model: 'neuro-san-mock-spike', choices: [{ index: 0, delta, finish_reason: null }] })}\n\ndata: ${JSON.stringify({ model: 'neuro-san-mock-spike', choices: [{ index: 0, delta: {}, finish_reason: !final && tool ? 'tool_calls' : 'stop' }] })}\n\ndata: [DONE]\n\n`);
}
async function mcp(req, res) {
  const rpc = await body(req);
  if (rpc.method === 'notifications/initialized') { res.writeHead(202); res.end(); return; }
  let result;
  if (rpc.method === 'initialize') result = { protocolVersion: '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'tower-local-spike-validator', version: '0.0.0-spike' } };
  else if (rpc.method === 'tools/list') result = { tools: [{ name: 'validate_home_bundle', description: 'Read-only local validation. No persistence or publication.', inputSchema: { type: 'object', additionalProperties: false, properties: { bundleJson: { type: 'string', maxLength: 65536 } }, required: ['bundleJson'] } }] };
  else if (rpc.method === 'tools/call') {
    const args = rpc.params?.arguments;
    if (rpc.params?.name !== 'validate_home_bundle' || !args || typeof args.bundleJson !== 'string' || Object.keys(args).some(key => key !== 'bundleJson')) return json(res, { jsonrpc: '2.0', id: rpc.id, error: { code: -32602, message: 'Invalid validator arguments.' } });
    const validation = parseBundle(args.bundleJson);
    result = { content: [{ type: 'text', text: JSON.stringify(validation.ok ? { valid: true, persistence: 'none', public: false } : { valid: false, errors: validation.errors }) }], isError: !validation.ok };
  } else return json(res, { jsonrpc: '2.0', id: rpc.id, error: { code: -32601, message: 'Unsupported fixture method.' } });
  json(res, { jsonrpc: '2.0', id: rpc.id, result });
}
const peer = createHttpServer(async (req, res) => {
  try {
    const path = new URL(req.url, B).pathname;
    const [, scenario, resource] = path.split('/');
    if (scenario !== 'no-cors') {
      res.setHeader('Access-Control-Allow-Origin', A);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept,MCP-Protocol-Version,Mcp-Session-Id');
    }
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    if (resource === 'agent-manifest.json') return json(res, manifest(scenario, false));
    if (resource === 'tower.network.json') return json(res, tower(scenario));
    if (resource === 'links.json') return json(res, {});
    if (resource === 'mcp' && req.method === 'POST') return await mcp(req, res);
    json(res, { error: 'Not a fixture route.' }, 404);
  } catch { json(res, { error: 'Invalid fixture request.' }, 400); }
});
const callerServer = createHttpServer(async (req, res) => {
  try {
    const path = new URL(req.url, A).pathname;
    const match = path.match(/^\/caller\/([a-z-]+)\/([^/]+)$/);
    if (match) {
      const [, scenario, resource] = match;
      if (resource === 'agent-manifest.json') return json(res, manifest(scenario, true));
      if (resource === 'caller.network.json') return json(res, caller(scenario));
      if (resource === 'links.json') return json(res, {});
    }
    const route = path.match(/^\/router\/([a-z-]+)\/v1\/chat\/completions$/);
    if (route && req.method === 'POST') return await router(req, res, route[1]);
    const vendor = path.replace('/spikes/m2/vendor/', '');
    if (vendorPaths.has(vendor)) {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      return res.end(await readFile(new URL(`./vendor/${vendor}`, import.meta.url)));
    }
    if (['/spikes/m2/site/', '/spikes/m2/site/index.html', '/spikes/m2/site/spike.js'].includes(path)) {
      const script = path.endsWith('.js');
      res.writeHead(200, { 'Content-Type': script ? 'text/javascript' : 'text/html' });
      return res.end(await readFile(new URL(script ? './site/spike.js' : './site/index.html', import.meta.url)));
    }
    json(res, { error: 'Not a local fixture route.' }, 404);
  } catch { json(res, { error: 'Invalid fixture request.' }, 400); }
});
await new Promise(resolve => peer.listen(4181, '127.0.0.1', resolve));
await new Promise(resolve => callerServer.listen(4180, '127.0.0.1', resolve));
console.log(`MOCK ONLY M2 spike: ${A}/spikes/m2/site/ (peer ${B}). No real inference.`);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { peer.close(); callerServer.close(); process.exit(0); });
