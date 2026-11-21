// Cross-instance runtime tests use SQLite and scripted Meta responses, not real inference.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLiveReviewer } from '../server/live-reviewer.ts';
import { META_ENDPOINT } from '../server/meta-policy.ts';
import { fixtureProvider } from './reviewer-provider-fixture.ts';
import { sqliteRuntime } from './d1-fixture.ts';
const origin = 'https://tower.example';
const request = (path: string, body: unknown, extra: RequestInit = {}) => new Request(origin + '/api/reviewer/' + path, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body), ...extra });
function fixture(failure?: Parameters<typeof fixtureProvider>[1]) {
  const storage = sqliteRuntime(); const f = fixtureProvider(origin, failure); let calls = 0;
  const transport: typeof fetch = async (url, init) => { calls++; assert.equal(url, META_ENDPOINT); assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer SYNTHETIC-NOT-REAL'); return f.provider.send({ endpoint: META_ENDPOINT, redirect: 'error', signal: init?.signal as AbortSignal, body: JSON.parse(String(init?.body)) }); };
  const env = { META_API_KEY: 'SYNTHETIC-NOT-REAL', TOWER_RUNTIME: storage.db };
  return { ...storage, env, transport, get calls() { return calls; } };
}
async function start(gateway: ReturnType<typeof createLiveReviewer>, env: Parameters<ReturnType<typeof createLiveReviewer>>[1]) { const r = await gateway(request('start', { consent: true }), env); assert.equal(r.status, 200); return (await r.json()).ticket as string; }
test('D1 state survives a different worker for every role and exact replay never repeats a call', async () => {
  const f = fixture();
  try {
    const ticket = await start(createLiveReviewer({ transport: f.transport }), f.env);
    for (let step = 0; step < 3; step++) {
      const g = createLiveReviewer({ transport: f.transport }); const r = await g(request('v1/chat/completions', { ticket, step }), f.env); assert.equal(r.status, 200); assert.equal((await r.json()).step, step + 1);
      assert.equal((await createLiveReviewer({ transport: f.transport })(request('v1/chat/completions', { ticket, step }), f.env)).status, 409);
    }
    assert.equal(f.calls, 3); assert.equal(f.sql.prepare('SELECT reserved FROM tower_runtime_budget').get()!.reserved, 3);
    assert.notEqual(f.sql.prepare('SELECT ticket_hash FROM tower_runtime_runs').get()!.ticket_hash, ticket);
  } finally { f.close(); }
});
test('cross-worker admission never exceeds 60 reserved calls per UTC day', async () => {
  const f = fixture();
  try {
    const results = await Promise.all(Array.from({ length: 30 }, () => createLiveReviewer({ transport: f.transport })(request('start', { consent: true }), f.env)));
    assert.equal(results.filter(r => r.status === 200).length, 20); assert.equal(results.filter(r => r.status === 429).length, 10);
    assert.equal(f.sql.prepare('SELECT reserved FROM tower_runtime_budget').get()!.reserved, 60); assert.equal(f.calls, 0);
  } finally { f.close(); }
});
test('no consent, missing binding, unknown fields, private input and unauthorized origin dispatch nothing', async () => {
  const f = fixture(); const g = createLiveReviewer({ transport: f.transport });
  try {
    assert.equal((await g(request('start', { consent: true }), { META_API_KEY: 'synthetic' })).status, 503);
    for (const body of [{ consent: false }, { consent: true, prompt: 'Private sentinel' }, '{"consent":true,"consent":true}', 'x'.repeat(513)]) assert.notEqual((await g(request('start', body), f.env)).status, 200);
    const bad = request('start', { consent: true }); bad.headers.set('origin', 'https://unapproved.invalid'); assert.equal((await g(bad, f.env)).status, 403);
    const ticket = await start(g, f.env);
    assert.equal((await g(request('v1/chat/completions', { ticket, step: 0, model: 'paid-other' }), f.env)).status, 400); assert.equal(f.calls, 0);
  } finally { f.close(); }
});
for (const failure of [400, 401, 403, 404, 422, 429, 503, 'invalid', 'refused', 'wrong-model', 'redirect', 'huge'] as const) {
  test(`scripted provider ${failure} consumes its step and cannot be retried on another worker`, async () => {
    const f = fixture(failure); const g = createLiveReviewer({ transport: f.transport });
    try {
      const ticket = await start(g, f.env); let r = await g(request('v1/chat/completions', { ticket, step: 0 }), f.env);
      if (r.ok) r = await g(request('v1/chat/completions', { ticket, step: 1 }), f.env);
      assert.equal(r.ok, false); const error = await r.json(); assert.equal(error.code, failure === 429 ? 'PROVIDER_LIMIT' : [401, 403].includes(failure as number) ? 'PROVIDER_AUTHORIZATION' : [400, 404, 422].includes(failure as number) ? 'PROVIDER_REQUEST_REJECTED' : [503, 'redirect'].includes(failure) ? 'PROVIDER_UNAVAILABLE' : 'OUTPUT_REJECTED'); assert.ok(!JSON.stringify(error).includes('Private upstream')); const n = f.calls;
      assert.equal((await createLiveReviewer({ transport: f.transport })(request('v1/chat/completions', { ticket, step: 0 }), f.env)).status, 409); assert.equal(f.calls, n);
      assert.equal(f.sql.prepare('SELECT reserved FROM tower_runtime_budget').get()!.reserved, 3);
    } finally { f.close(); }
  });
}
test('cross-worker cancellation, expiry and duplicate concurrency never accept late success', async () => {
  const f = fixture(); let began!: () => void; let release!: () => void;
  const started = new Promise<void>(resolve => { began = resolve; }); const waiting = new Promise<void>(resolve => { release = resolve; });
  const transport: typeof fetch = async (url, init) => { began(); await waiting; return f.transport(url, init); };
  const g = createLiveReviewer({ transport });
  try {
    const ticket = await start(g, f.env); const pending = g(request('v1/chat/completions', { ticket, step: 0 }), f.env); await started;
    const other = createLiveReviewer({ transport: f.transport });
    assert.equal((await other(request('v1/chat/completions', { ticket, step: 0 }), f.env)).status, 409);
    assert.equal((await other(request('cancel', { ticket }), f.env)).status, 200); release(); assert.equal((await pending).status, 409); assert.equal(f.calls, 1);
    let clock = Date.now(); const expiry = createLiveReviewer({ transport: f.transport, now: () => clock }); const expired = await start(expiry, f.env); clock += 60001;
    assert.equal((await expiry(request('v1/chat/completions', { ticket: expired, step: 0 }), f.env)).status, 409); assert.equal(f.calls, 1);
  } finally { release(); f.close(); }
});
test('stalled provider deadline never refunds or redispatches a consumed step', async () => {
  const f = fixture(); let calls = 0; const g = createLiveReviewer({ timeoutMs: 100, transport: async () => { calls++; return new Promise<Response>(() => {}); } });
  try {
    const ticket = await start(g, f.env); const timeout = await g(request('v1/chat/completions', { ticket, step: 0 }), f.env); assert.equal(timeout.status, 504); assert.equal((await timeout.json()).code, 'TIMEOUT');
    assert.equal((await createLiveReviewer({ transport: f.transport })(request('v1/chat/completions', { ticket, step: 0 }), f.env)).status, 409); assert.equal(calls, 1); assert.equal(f.calls, 0);
  } finally { f.close(); }
});
test('database failure and stalled initialization fail closed without dispatch', async () => {
  const f = fixture();
  try {
    for (const exec of [async () => { throw Error('SYNTHETIC-PRIVATE-DB-ERROR'); }, async () => new Promise(() => {})]) {
      const g = createLiveReviewer({ transport: f.transport, timeoutMs: 100 });
      const r = await g(request('start', { consent: true }), { ...f.env, TOWER_RUNTIME: { ...f.db, exec } });
      assert.ok([503, 504].includes(r.status)); const error = await r.json(); assert.equal(error.code, r.status === 503 ? 'STORAGE_UNAVAILABLE' : 'TIMEOUT'); assert.ok(!JSON.stringify(error).includes('SYNTHETIC-PRIVATE')); assert.equal(f.calls, 0);
    }
  } finally { f.close(); }
});
test('request abort ends a stalled dispatched call and its step cannot be replayed', async () => {
  const f = fixture(); let began!: () => void; const started = new Promise<void>(r => { began = r; });
  const g = createLiveReviewer({ transport: async () => { began(); return new Promise<Response>(() => {}); } });
  try {
    const ticket = await start(g, f.env); const control = new AbortController();
    const pending = g(request('v1/chat/completions', { ticket, step: 0 }, { signal: control.signal }), f.env);
    await started; control.abort(); const cancelled = await pending; assert.equal(cancelled.status, 499); assert.equal((await cancelled.json()).code, 'CANCELLED');
    assert.equal((await createLiveReviewer({ transport: f.transport })(request('v1/chat/completions', { ticket, step: 0 }), f.env)).status, 409); assert.equal(f.calls, 0);
  } finally { f.close(); }
});
test('unavailable incoming signal does not crash admission or leak per-worker request slots', async () => {
  const f = fixture(); const g = createLiveReviewer({ transport: f.transport });
  try {
    for (let i = 0; i < 5; i++) {
      const req = request('start', { consent: true }); Object.defineProperty(req, 'signal', { get() { throw Error('SYNTHETIC-PRIVATE-SIGNAL-ERROR'); } });
      const r = await g(req, f.env); assert.equal(r.status, 200); assert.ok(!(await r.text()).includes('SYNTHETIC-PRIVATE'));
    }
    assert.equal(f.calls, 0);
  } finally { f.close(); }
});
