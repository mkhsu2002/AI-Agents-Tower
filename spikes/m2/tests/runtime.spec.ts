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
async function allow(page: Page, phase?: string) {
  await expect(page.locator('#consent')).toBeVisible();
  if (phase) await expect(page.locator('#request')).toContainText(`"phase": "${phase}"`);
  await page.locator('#allow').click();
}
async function allowAll(page: Page) { await allow(page, 'call'); await allow(page, 'discover'); await allow(page, 'call'); }

test('patched nsdeploy runtime runs two peer agents inside caller browser and calls local validator with mock inference', async ({ page }, info) => {
  const requests: Request[] = [];
  page.on('request', req => requests.push(req));
  await start(page);
  await expect(page.locator('#request')).toContainText('127.0.0.1:4181');
  expect(requests.filter(req => req.url().startsWith(B))).toHaveLength(0);
  await allowAll(page); await finish(page);
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
  // Each boundary has an independent explicit approval, even on the same peer origin.
  expect(await page.evaluate('window.m2Spike.consentRequests')).toEqual([
    { kind: 'network', phase: 'call', peerOrigin: B },
    { kind: 'mcp', phase: 'discover', peerOrigin: B },
    { kind: 'mcp', phase: 'call', peerOrigin: B },
  ]);
  await info.attach('consent-sequence', { body: JSON.stringify(await page.evaluate('window.m2Spike.consentRequests')), contentType: 'application/json' });
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
    expect((await page.locator('#result').innerText()) + (await page.locator('#status').innerText())).toMatch(/Error|failed/);
  });
}
test('invalid generated bundle is rejected by shared deterministic validator', async ({ page }) => {
  await start(page, 'invalid-bundle'); await allowAll(page); await finish(page);
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
  await page.locator('#run').click(); await allowAll(page); await finish(page);
  const bearer = requests.filter(req => req.headers().authorization?.includes('SYNTHETIC-ROUTER-CANARY'));
  expect(bearer).toHaveLength(6); expect(bearer.every(req => req.url().startsWith(`${A}/router/`))).toBe(true);
  expect(requests.every(req => !req.url().includes('SYNTHETIC-ROUTER-CANARY') && !req.postData()?.includes('SYNTHETIC-ROUTER-CANARY'))).toBe(true);
  expect(JSON.stringify(await events(page))).not.toContain('SYNTHETIC-ROUTER-CANARY');
});
test('consent accepts only explicit allow and recovers its queue after hook errors', async ({ page }) => {
  await page.goto('');
  const observed = await page.evaluate<{ decisions: string[]; recovered: string }>(`(async () => {
    const { Engine } = await import('/spikes/m2/vendor/runtime/engine.js');
    const e = new Engine({originUrl:location.origin});
    const info = {peerOrigin:'http://example.invalid'};
    const decisions = [await e.requestConsent(info)];
    for (const value of [undefined, null, false, true, '', 'always', 'cancel', 'ALLOW', 'decline']) {
      e.onConsent = async () => value; decisions.push(await e.requestConsent(info));
    }
    e.onConsent = async () => { throw new Error('Private hook details must not escape'); };
    decisions.push(await e.requestConsent(info));
    e.onConsent = async () => 'allow';
    return {decisions, recovered:await e.requestConsent(info)};
  })()`);
  expect(observed.decisions).toEqual(Array(11).fill('decline')); expect(observed.recovered).toBe('allow');
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

for (const mode of ['absent', 'empty', 'error']) {
  test(`network consent ${mode} hook causes no peer contact`, async ({ page }) => {
    const peers: string[] = []; page.on('request', req => { if (req.url().startsWith(B)) peers.push(req.url()); });
    await page.goto('?scenario=valid');
    await page.evaluate(`(() => { const e = window.m2Spike.engine; e.onConsent = ${mode === 'absent' ? 'null' : mode === 'empty' ? 'async () => undefined' : 'async () => { throw new Error("Consent UI unavailable"); }'}; })()`);
    await page.locator('#run').click(); await finish(page);
    expect(peers).toEqual([]); await expect(page.locator('#result')).toContainText('declined');
  });
}
test('peer MCP discovery requires fresh consent and denial sends no MCP request', async ({ page }) => {
  const calls: Request[] = []; page.on('request', req => { if (req.url().endsWith('/mcp')) calls.push(req); });
  await start(page); await allow(page, 'call');
  await expect(page.locator('#request')).toContainText('"phase": "discover"');
  await expect(page.locator('#request')).toContainText(`${B}/valid/mcp`);
  expect(calls).toEqual([]);
  await page.locator('#deny').click(); await finish(page);
  expect(calls).toEqual([]);
  expect((await events(page)).some(e => e.kind === 'consent' && e.phase === 'discover' && e.decision === 'declined')).toBe(true);
});
test('peer MCP tool call requires separate consent with exact payload; denial prevents tools/call', async ({ page }) => {
  const calls: Request[] = []; page.on('request', req => { if (req.url().endsWith('/mcp') && req.method() === 'POST') calls.push(req); });
  await start(page); await allow(page, 'call'); await allow(page, 'discover');
  await expect(page.locator('#request')).toContainText('"phase": "call"');
  const review = JSON.parse(await page.locator('#request').innerText());
  expect(review.origin).toBe(B); expect(review.endpoint).toBe(`${B}/valid/mcp`);
  const payload = JSON.parse(review.request);
  expect(payload.tool).toBe('validate_home_bundle'); expect(JSON.parse(payload.arguments.bundleJson).schemaVersion).toBe('0.1');
  expect(calls.map(req => req.postDataJSON().method)).toEqual(['initialize', 'notifications/initialized', 'tools/list']);
  await page.locator('#deny').click(); await finish(page);
  expect(calls.some(req => req.postDataJSON().method === 'tools/call')).toBe(false);
  await expect(page.locator('#result')).toContainText('declined');
});
test('cached peer session still requires a new network grant on the next run', async ({ page }) => {
  const peers: Request[] = []; page.on('request', req => { if (req.url().startsWith(B)) peers.push(req); });
  await start(page); await allowAll(page); await finish(page);
  const count = peers.length;
  await page.locator('#run').click(); await expect(page.locator('#request')).toContainText('"purpose": "network"');
  expect(peers).toHaveLength(count);
  await page.locator('#deny').click(); await finish(page); expect(peers).toHaveLength(count);
});
for (const scenario of ['duplicate-front', 'duplicate-helper', 'duplicate-top']) {
  test(`${scenario} agent names are rejected before ambiguous execution`, async ({ page }) => {
    const models: Request[] = []; page.on('request', req => { if (req.url().endsWith('/chat/completions')) models.push(req); });
    await start(page, scenario);
    if (scenario !== 'duplicate-top') await allow(page, 'call');
    await finish(page);
    const trace = await events(page);
    expect(trace.some(e => e.status === 'error' && e.error?.includes('Duplicate agent names'))).toBe(true);
    const agents = trace.filter(e => e.kind === 'agent' && e.phase === 'start').map(e => e.agent);
    expect(agents).toEqual(scenario === 'duplicate-top' ? [] : ['caller']);
    if (scenario === 'duplicate-top') expect(models).toEqual([]);
    expect(trace.some(e => e.kind === 'mcp_call')).toBe(false);
  });
}
test('MCP consent boundary uses actual browser origin, including relative peer URLs', async ({ page }) => {
  await page.goto('');
  const checks = await page.evaluate<boolean[]>(`(async () => {
    const { requiresThirdPartyApproval } = await import('/spikes/m2/vendor/runtime/runner.js');
    const browser = '${A}', peer = '${B}/valid';
    return [requiresThirdPartyApproval('/mcp', peer, browser), requiresThirdPartyApproval('${B}/valid/mcp', peer, browser), requiresThirdPartyApproval('${A}/mcp', peer, browser), requiresThirdPartyApproval('/ext-mcp/service', browser, browser), requiresThirdPartyApproval('javascript:alert(1)', browser, browser)];
  })()`);
  expect(checks).toEqual([true, true, false, true, true]);
});

test('normalized duplicate names also fail instead of shadowing another agent', async ({ page }) => {
  await page.goto('');
  const observed = await page.evaluate<string[]>(`(async () => {
    const { AgentNetwork } = await import('/spikes/m2/vendor/runtime/kernel.js');
    const configs = [
      {tools:[{name:'builder',instructions:'one'},{name:' builder ',instructions:'two'}]},
      {commondefs:{replacement_values:{ALIAS:'builder'}},tools:[{name:'ALIAS',instructions:'one'},{name:'builder',instructions:'two'}]},
      {tools:[{name:' ',instructions:'blank'}]}
    ];
    return configs.map(config => {try {new AgentNetwork(config,'invalid');return 'unexpected success';}catch(error){return error.message;}});
  })()`);
  expect(observed[0]).toContain('Duplicate agent names'); expect(observed[1]).toContain('Duplicate agent names');
  expect(observed[2]).toContain('non-empty name');
});

for (const scenario of ['unknown-network', 'executable-network', 'bad-invocation', 'deep-network', 'oversized-network', 'unknown-manifest', 'manifest-duplicate', 'front-mismatch', 'malformed-network', 'duplicate-json', 'hocon-network', 'cross-artifact', 'response-oversized', 'ambiguous-tools', 'invalid-encoding']) {
  test(`strict artifact profile rejects ${scenario} before peer execution`, async ({ page }) => {
    const targets: string[] = []; page.on('request', request => { if (request.url().includes('redirect-target')) targets.push(request.url()); });
    await start(page, scenario); await allow(page, 'call'); await finish(page);
    const trace = await events(page);
    expect(trace.some(event => event.kind === 'remote_fetch' && event.status === 'error')).toBe(true);
    expect(trace.filter(event => event.kind === 'agent' && event.phase === 'start').map(event => event.agent)).toEqual(['caller']);
    expect(trace.some(event => event.kind === 'mcp_call')).toBe(false); expect(targets).toEqual([]);
    await expect(page.locator('#status')).toContainText('failed');
    expect(trace.filter(event => event.kind === 'model_call' && event.phase === 'start')).toHaveLength(1);
  });
}
for (const scenario of ['redirect-manifest', 'redirect-same', 'redirect-network', 'redirect-model', 'redirect-mcp']) {
  test(`redirect authorization rejects ${scenario} without contacting its target`, async ({ page }) => {
    const targets: Request[] = []; page.on('request', request => { if (request.url().includes('redirect-target')) targets.push(request); });
    await start(page, scenario);
    if (scenario !== 'redirect-model') await allow(page, 'call');
    if (scenario === 'redirect-mcp') await allow(page, 'discover');
    await finish(page);
    expect(targets).toEqual([]); expect((await events(page)).some(event => event.status === 'error')).toBe(true);
    if (scenario === 'redirect-model') await expect(page.locator('#status')).toContainText('failed');
  });
}
for (const scenario of ['slow-headers', 'slow-manifest', 'slow-model', 'slow-mcp']) {
  test(`deadline aborts stalled ${scenario} response body without automatic retry`, async ({ page }) => {
    const calls: Request[] = []; const failed: string[] = [];
    page.on('request', request => calls.push(request)); page.on('requestfailed', request => failed.push(request.url()));
    await page.goto(`?scenario=${scenario}`); await page.evaluate('window.m2Spike.engine.timeoutMs = 3000');
    await page.locator('#run').click();
    if (scenario === 'slow-manifest' || scenario === 'slow-headers') await allow(page, 'call');
    if (scenario === 'slow-mcp') await allowAll(page);
    await finish(page); await expect(page.locator('#status')).toContainText('deadline exceeded');
    await expect(page.locator('#status')).toContainText('outcomes may be unknown');
    await expect(page.locator('#consent')).toBeHidden();
    expect((await events(page)).some(event => event.kind === 'runtime_stopped')).toBe(true);
    expect(failed.length).toBeGreaterThan(0);
    if (scenario === 'slow-mcp') expect(calls.filter(request => request.url().endsWith('/mcp') && request.method() === 'POST' && request.postDataJSON().method === 'tools/call')).toHaveLength(1);
    const count = calls.length; await page.waitForTimeout(150); expect(calls).toHaveLength(count);
  });
}
test('deadline also closes pending consent without peer contact', async ({ page }) => {
  const peers: Request[] = []; page.on('request', request => { if (request.url().startsWith(B)) peers.push(request); });
  await page.goto('?scenario=valid'); await page.evaluate('window.m2Spike.engine.timeoutMs = 2000'); await page.locator('#run').click();
  await expect(page.locator('#consent')).toBeVisible(); await finish(page);
  await expect(page.locator('#status')).toContainText('deadline exceeded'); await expect(page.locator('#consent')).toBeHidden();
  expect(peers).toEqual([]);
});
test('cancel during consent closes its UI and a fresh run succeeds with new approvals', async ({ page }) => {
  const peers: Request[] = []; page.on('request', request => { if (request.url().startsWith(B)) peers.push(request); });
  await start(page); await expect(page.locator('#consent')).toBeVisible(); await page.locator('#cancel-run').click(); await finish(page);
  await expect(page.locator('#status')).toContainText('cancelled'); await expect(page.locator('#consent')).toBeHidden(); expect(peers).toEqual([]);
  await page.locator('#run').click(); await allowAll(page); await finish(page);
  await expect(page.locator('#result')).toContainText('MOCK ONLY');
});
test('late approval after cancellation cannot resume the old turn', async ({ page }) => {
  const peers: Request[] = []; page.on('request', request => { if (request.url().startsWith(B)) peers.push(request); });
  await page.goto('?scenario=valid');
  await page.evaluate('window.m2Spike.engine.onConsent = () => new Promise(resolve => { window.lateApproval = resolve; })');
  await page.locator('#run').click(); await page.waitForFunction('typeof window.lateApproval === "function"');
  await page.locator('#cancel-run').click(); await finish(page);
  await page.evaluate('window.lateApproval("allow")'); await page.waitForTimeout(150);
  expect(peers).toEqual([]); await expect(page.locator('#status')).toContainText('cancelled'); await expect(page.locator('#result')).toHaveText('');
});
test('cancelling a started MCP request reports uncertainty and never retries it', async ({ page }) => {
  const calls: Request[] = []; page.on('request', request => { if (request.url().endsWith('/mcp') && request.method() === 'POST' && request.postDataJSON().method === 'tools/call') calls.push(request); });
  await start(page, 'slow-mcp'); await allowAll(page);
  await expect.poll(() => calls.length).toBe(1); await page.locator('#cancel-run').click(); await finish(page);
  await expect(page.locator('#status')).toContainText('outcomes may be unknown');
  await page.waitForTimeout(150); expect(calls).toHaveLength(1); await expect(page.locator('#result')).toHaveText('');
});
test('bounded transport rejects oversized requests and invalid timeout configuration', async ({ page }) => {
  await page.goto('');
  const failures = await page.evaluate<string[]>(`(async () => {
    const { Operation } = await import('/spikes/m2/safety.js'); const results = [];
    for (const value of [0, -1, Infinity, 30001, '100']) { try {new Operation(value);results.push('unexpected success');}catch(error){results.push(error.message);} }
    const operation = new Operation(1000);
    try {await operation.fetch(location.origin+'/redirect-target',{method:'POST',body:'x'.repeat(262145)});results.push('unexpected success');}catch(error){results.push(error.message);}finally{operation.dispose();}
    return results;
  })()`);
  expect(failures).toHaveLength(6); expect(failures.every(message => !message.includes('unexpected success'))).toBe(true);
});
