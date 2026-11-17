import { test, expect } from '@playwright/test';
import type { Page, Request } from '@playwright/test';
const A = 'http://127.0.0.1:4180';
const B = 'http://127.0.0.1:4181';
const pageErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = []; pageErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const origin = new URL(route.request().url()).origin;
    return origin === A || origin === B ? route.continue() : route.abort('blockedbyclient');
  });
});
test.afterEach(async ({ page }) => { expect(pageErrors.get(page)).toEqual([]); });
type TraceEvent = { kind: string; phase: string; agent?: string; mock?: boolean; verifiedReal?: boolean; method?: string; error?: string; [key: string]: unknown };
const events = (page: Page): Promise<TraceEvent[]> => page.evaluate('window.m2Spike.trace.events');
async function finish(page: Page) {
  await expect(page.locator('#status')).toContainText(/Mock run (finished|failed)/);
  await expect(page.locator('#run')).toBeEnabled();
}
async function start(page: Page, scenario = 'valid') {
  await page.goto(`?scenario=${scenario}`);
  await page.locator('#run').click();
}
async function allow(page: Page) { await expect(page.locator('#consent')).toBeVisible(); await page.locator('#allow').click(); }

test('official runtime runs two peer agents inside caller browser and calls real local validator with mock inference', async ({ page }, info) => {
  const requests: Request[] = [];
  page.on('request', req => requests.push(req));
  await start(page);
  await expect(page.locator('#request')).toContainText('127.0.0.1:4181');
  expect(requests.filter(req => req.url().startsWith(B))).toHaveLength(0);
  await allow(page); await finish(page);
  await expect(page.locator('#result')).toContainText('MOCK ONLY');
  await expect(page.locator('#result')).toContainText('valid');
  const trace = await events(page);
  expect(trace.filter(e => e.kind === 'agent' && e.phase === 'start').map(e => e.agent)).toEqual(['caller', 'reception', 'home_builder']);
  const model = trace.filter(e => e.kind === 'model_call' && e.phase === 'end');
  expect(model.length).toBe(6); expect(model.every(e => e.mock === true && e.verifiedReal === false)).toBe(true);
  expect(trace.some(e => e.kind === 'mcp_call' && e.method === 'tools/call' && e.phase === 'end')).toBe(true);
  expect(requests.filter(req => req.url().includes('/chat/completions')).every(req => req.url().startsWith(A))).toBe(true);
  expect(requests.some(req => req.url().includes('must-not-run'))).toBe(false);
  expect(requests.filter(req => req.url().startsWith(B)).every(req => req.frame().url().startsWith(A))).toBe(true);
  const calls = requests.filter(req => req.url().endsWith('/mcp') && req.method() === 'POST');
  expect(calls.map(req => req.postDataJSON().method)).toEqual(['initialize', 'notifications/initialized', 'tools/list', 'tools/call']);
  expect(requests.filter(req => req.url().startsWith(B)).every(req => !req.postData()?.includes('SYNTHETIC-PRIVATE-CONTEXT'))).toBe(true);
  // Characterize the peer-own-MCP consent gap: only network consent is requested.
  expect(await page.evaluate('window.m2Spike.consentRequests')).toEqual([{ kind: 'network', phase: 'call', peerOrigin: '127.0.0.1:4181' }]);
  const webgpu = await page.evaluate(`(async () => ({api:!!navigator.gpu, adapter:!!(navigator.gpu && await navigator.gpu.requestAdapter()), realInference:'not-attempted'}))()`);
  await info.attach('webgpu-capability-only', { body: JSON.stringify(webgpu), contentType: 'application/json' });
  console.log('WebGPU capability only (no model):', JSON.stringify(webgpu));
  expect(await page.evaluate('({local:localStorage.length, session:sessionStorage.length})')).toEqual({ local: 0, session: 0 });
  await info.attach('mock-only-runtime-trace', { body: JSON.stringify(trace, null, 2), contentType: 'application/json' });
  await page.screenshot({ path: 'test-results/m2/runtime-mock-only.png', fullPage: true });
});
test('denying network consent makes zero requests to peer', async ({ page }) => {
  const peers: string[] = []; page.on('request', req => { if (req.url().startsWith(B)) peers.push(req.url()); });
  await start(page); await expect(page.locator('#consent')).toBeVisible(); await page.locator('#deny').click(); await finish(page);
  expect(peers).toEqual([]); expect((await events(page)).filter(e => e.kind === 'agent' && e.phase === 'start').map(e => e.agent)).toEqual(['caller']);
  await expect(page.locator('#result')).toContainText('declined');
});
for (const scenario of ['missing', 'invalid', 'no-cors']) {
  test(`${scenario} peer fails explicitly before peer model execution`, async ({ page }) => {
    await start(page, scenario); await allow(page); await finish(page);
    const trace = await events(page);
    expect(trace.some(e => e.kind === 'remote_fetch' && e.phase === 'end' && e.status === 'error')).toBe(true);
    expect(trace.filter(e => e.kind === 'agent' && e.phase === 'start').map(e => e.agent)).toEqual(['caller']);
    await expect(page.locator('#result')).toContainText('Error');
  });
}
test('invalid generated bundle is rejected by shared deterministic validator', async ({ page }) => {
  await start(page, 'invalid-bundle'); await allow(page); await finish(page);
  await expect(page.locator('#result')).toContainText('MCP tool error');
  await expect(page.locator('#result')).toContainText('UNSUPPORTED_VERSION');
});
test('scripted provider failure stays a failure with no peer contact', async ({ page }) => {
  const peers: string[] = []; page.on('request', req => { if (req.url().startsWith(B)) peers.push(req.url()); });
  await start(page, 'provider-error'); await finish(page);
  await expect(page.locator('#status')).toContainText('Mock run failed'); expect(peers).toEqual([]);
});
test('synthetic router canary goes only to caller router, never peer artifacts, MCP or prompts', async ({ page }) => {
  const requests: Request[] = []; page.on('request', req => requests.push(req));
  await page.goto('?scenario=valid');
  await page.evaluate(`(async () => { const e = window.m2Spike.engine; await e.loadTop(); e.byokKey = 'SYNTHETIC-ROUTER-CANARY'; e.top.llm.apiKey = e.byokKey; })()`);
  await page.locator('#run').click(); await allow(page); await finish(page);
  const bearer = requests.filter(req => req.headers().authorization?.includes('SYNTHETIC-ROUTER-CANARY'));
  expect(bearer).toHaveLength(6); expect(bearer.every(req => req.url().startsWith(`${A}/router/`))).toBe(true);
  expect(requests.every(req => !req.url().includes('SYNTHETIC-ROUTER-CANARY') && !req.postData()?.includes('SYNTHETIC-ROUTER-CANARY'))).toBe(true);
  expect(JSON.stringify(await events(page))).not.toContain('SYNTHETIC-ROUTER-CANARY');
});
test('runtime characterization: no consent hook defaults to allow; duplicate names are not rejected', async ({ page }) => {
  await page.goto('');
  const observed = await page.evaluate<{ consent: string; errors: string[] }>(`(async () => {
    const { Engine } = await import('/spikes/m2/vendor/runtime/engine.js');
    const { AgentNetwork, validateNetwork } = await import('/spikes/m2/vendor/runtime/kernel.js');
    const e = new Engine({originUrl:location.origin});
    const consent = await e.requestConsent({peerOrigin:'example.invalid'});
    const validation = validateNetwork(new AgentNetwork({tools:[{name:'duplicate',instructions:'one',tools:[]},{name:'duplicate',instructions:'two',tools:[]}]},'duplicates'));
    return {consent, errors:validation.errors};
  })()`);
  expect(observed.consent).toBe('allow'); expect(observed.errors).toEqual([]);
});
test('runtime characterization: keyless non-mock local inference is rejected before HTTP', async ({ page }) => {
  await page.goto('');
  const message = await page.evaluate(`(async () => {
    const { LlmClient } = await import('/spikes/m2/vendor/runtime/llm.js');
    try { await new LlmClient({baseUrl:location.origin+'/not-an-inference-route',mock:false}).chat({model:'local-model',messages:[]}); return 'unexpected success'; }
    catch (error) { return error.message; }
  })()`);
  expect(message).toContain('key is required');
});
test('runtime budget primitives stop exhausted invocation, remote count and deadline', async ({ page }) => {
  await page.goto('');
  const observed = await page.evaluate<{ agent: string; remote: string; deadline: string }>(`(async () => {
    const { consumeAgentBudget, consumeRemoteBudget } = await import('/spikes/m2/vendor/runtime/runner.js');
    const budget = {agentCalls:1,maxAgentCalls:1,remoteCalls:1,maxRemoteCalls:1,peerCalls:new Map(),maxCallsPerPeer:1,deadline:Date.now()+1000};
    const agent = consumeAgentBudget(budget); const remote = consumeRemoteBudget(budget,'peer');
    budget.deadline=0; const deadline = consumeAgentBudget(budget);
    return {agent,remote,deadline};
  })()`);
  expect(observed.agent).toContain('limit'); expect(observed.remote).toContain('limit'); expect(observed.deadline).toContain('deadline');
});
