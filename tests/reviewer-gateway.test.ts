import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOfflineReviewerGateway, LIMITS, META_ENDPOINT, META_MODEL } from '../server/reviewer-gateway.ts';
import type { RunBudgetReservation } from '../server/reviewer-gateway.ts';
import disabled from '../api/reviewer.ts';
import { fixtureProvider } from './reviewer-provider-fixture.ts';
const origin = 'http://127.0.0.1:4173';
const req = (path: string, body: unknown, headers: Record<string, string> = {}, signal?: AbortSignal) => new Request(origin + '/api/reviewer/' + path, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body), signal });
async function start(g: ReturnType<typeof createOfflineReviewerGateway>) {
  const response = await g.handle(req('start', { consent: true })); assert.equal(response.status, 200); return (await response.json()).ticket as string;
}
test('production endpoint is unconditionally disabled; offline gateway requires loopback and configured provider', async () => {
  assert.equal(disabled.fetch().status, 503);
  assert.throws(() => createOfflineReviewerGateway({ origin: 'https://ai-agents-tower.vercel.app' }));
  const g = createOfflineReviewerGateway({ origin });
  assert.equal((await g.handle(req('start', { consent: true }))).status, 503);
});
test('gateway reconstructs three Meta requests; tickets/steps contain no caller prompt, model, route or key', async () => {
  const f = fixtureProvider(origin); const g = createOfflineReviewerGateway({ origin, provider: f.provider });
  const ticket = await start(g);
  try {
    for (let step = 0; step < 3; step++) {
      const response = await g.handle(req('v1/chat/completions', { ticket, step })); assert.equal(response.status, 200); assert.equal((await response.json()).step, step + 1);
    }
    assert.equal(f.calls.length, 3);
    for (const [index, call] of f.calls.entries()) {
      assert.equal(call.endpoint, META_ENDPOINT); assert.equal(call.redirect, 'error');
      assert.equal(call.body.model, META_MODEL); assert.equal(call.body.store, false);
      assert.equal(call.body.max_output_tokens, index === 0 ? 256 : 1024);
      assert.deepEqual(call.body.reasoning, { effort: 'minimal' });
      assert.ok(Buffer.byteLength(JSON.stringify(call.body)) <= 8192);
      assert.equal('apiKey' in call.body, false); assert.equal('models' in call.body, false);
    }
    assert.equal((await g.handle(req('v1/chat/completions', { ticket, step: 2 }))).status, 409);
    assert.equal(f.calls.length, 3);
  } finally { g.dispose(); }
});
test('unknown fields, duplicate keys, missing consent, private input, origins and credentials reject before dispatch', async () => {
  const f = fixtureProvider(origin); const g = createOfflineReviewerGateway({ origin, provider: f.provider });
  try {
    for (const body of [{ consent: false }, { consent: true, prompt: 'Private sentinel' }, { consent: true, model: 'paid-model' }, { consent: true, apiKey: 'synthetic-not-real' }, '{"consent":true,"consent":true}', 'x'.repeat(LIMITS.bodyBytes + 1)]) assert.notEqual((await g.handle(req('start', body))).status, 200);
    for (const headers of [{ Origin: 'https://unapproved.invalid' }, { Authorization: 'synthetic' }, { Cookie: 'synthetic' }] as Record<string, string>[]) assert.equal((await g.handle(req('start', { consent: true }, headers))).status, 403);
    const ticket = await start(g);
    for (const field of ['model', 'messages', 'endpoint', 'apiKey', 'provider', 'models']) assert.equal((await g.handle(req('v1/chat/completions', { ticket, step: 0, [field]: 'private sentinel' }))).status, 400);
    assert.equal(f.calls.length, 0);
  } finally { g.dispose(); }
});
test('missing, expired, wrong-project or insufficient execution budgets never dispatch a model', async () => {
  for (const patch of [null, { inputTokensPerCall: 0 }, { expiresAt: 0 }, { project: 'muse-tower' }, { calls: 2 }]) {
    const f = fixtureProvider(origin);
    f.setReservation(patch === null ? null : { project: 'ai-agents-tower', syntheticOnly: true, calls: 3, expiresAt: Date.now() + 60000, inputTokensPerCall: 8192, outputTokens: 2304, ...patch } as RunBudgetReservation);
    const g = createOfflineReviewerGateway({ origin, provider: f.provider });
    assert.equal((await g.handle(req('start', { consent: true }))).status, 503); assert.equal(f.calls.length, 0); g.dispose();
  }
});
for (const failure of [429, 503, 'invalid', 'refused', 'wrong-model', 'redirect', 'huge'] as const) {
  test(`scripted provider ${failure} stops the run without retry or fallback`, async () => {
    const f = fixtureProvider(origin, failure); const g = createOfflineReviewerGateway({ origin, provider: f.provider }); const ticket = await start(g);
    try {
      let response = await g.handle(req('v1/chat/completions', { ticket, step: 0 }));
      if (response.ok) response = await g.handle(req('v1/chat/completions', { ticket, step: 1 }));
      assert.equal(response.ok, false); assert.ok(!(await response.text()).includes('Private upstream details'));
      const count = f.calls.length;
      assert.equal((await g.handle(req('v1/chat/completions', { ticket, step: 0 }))).status, 409); assert.equal(f.calls.length, count);
    } finally { g.dispose(); }
  });
}
test('session expiry, duplicate/out-of-order steps, run caps and cancellation remain bounded', async () => {
  const f = fixtureProvider(origin); let clock = Date.now(); const g = createOfflineReviewerGateway({ origin, provider: f.provider, now: () => clock });
  try {
    const ticket = await start(g);
    assert.equal((await g.handle(req('v1/chat/completions', { ticket, step: 1 }))).status, 409);
    const expired = await start(g); clock += 60001;
    assert.equal((await g.handle(req('v1/chat/completions', { ticket: expired, step: 0 }))).status, 409);
    f.setReservation({ project: 'ai-agents-tower', syntheticOnly: true, calls: 3, expiresAt: clock + 60000, inputTokensPerCall: 8192, outputTokens: 2304 });
    const cancelled = await start(g);
    assert.equal((await g.handle(req('cancel', { ticket: cancelled }))).status, 200);
    assert.equal((await g.handle(req('v1/chat/completions', { ticket: cancelled, step: 0 }))).status, 409);
    assert.equal((await g.handle(req('start', { consent: true }))).status, 429); assert.equal(f.calls.length, 0);
  } finally { g.dispose(); }
});
test('pending dispatch obeys request abort, explicit cancel and deadline; duplicate dispatch cannot cause two calls', async () => {
  for (const mode of ['abort', 'cancel', 'deadline', 'duplicate']) {
    const f = fixtureProvider(origin); let calls = 0; let began!: () => void; const started = new Promise<void>(resolve => { began = resolve; });
    let signal: AbortSignal | undefined;
    f.provider.send = async request => { calls++; signal = request.signal; began(); return new Promise<Response>(() => {}); };
    const g = createOfflineReviewerGateway({ origin, provider: f.provider, timeoutMs: mode === 'deadline' ? 100 : 1000 }); const ticket = await start(g); const abort = new AbortController();
    try {
      const pending = g.handle(req('v1/chat/completions', { ticket, step: 0 }, {}, abort.signal)); await started;
      if (mode === 'abort') abort.abort();
      if (mode === 'cancel') await g.handle(req('cancel', { ticket }));
      if (mode === 'duplicate') assert.equal((await g.handle(req('v1/chat/completions', { ticket, step: 0 }))).status, 409);
      assert.equal((await pending).ok, false); assert.equal(signal?.aborted, true); assert.equal(calls, 1);
    } finally { g.dispose(); }
  }
});

test('concurrent quota reservation cannot exceed session capacity and stalled request bodies release slots', async () => {
  const f = fixtureProvider(origin); let release!: () => void; const waiting = new Promise<void>(resolve => { release = resolve; });
  const reserve = f.provider.reserveRunBudget; f.provider.reserveRunBudget = async limits => { await waiting; return reserve(limits); };
  const g = createOfflineReviewerGateway({ origin, provider: f.provider, timeoutMs: 100 });
  try {
    const one = g.handle(req('start', { consent: true })); const two = g.handle(req('start', { consent: true }));
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal((await g.handle(req('start', { consent: true }))).status, 429);
    release(); assert.equal((await one).status, 200); assert.equal((await two).status, 200);
  } finally { release(); g.dispose(); }
  const bodies = createOfflineReviewerGateway({ origin, provider: f.provider, timeoutMs: 100 });
  const stalled = () => new Request(origin + '/api/reviewer/start', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: new ReadableStream(), duplex: 'half' } as RequestInit);
  try {
    const pending = Array.from({ length: LIMITS.requests }, () => bodies.handle(stalled()));
    assert.equal((await bodies.handle(stalled())).status, 429);
    for (const response of await Promise.all(pending)) assert.equal(response.ok, false);
    assert.equal((await bodies.handle(req('start', { consent: true }))).status, 200);
  } finally { bodies.dispose(); }
});
