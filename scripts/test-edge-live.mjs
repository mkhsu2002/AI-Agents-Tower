// Real workerd + D1, entirely scripted outbound transport. No model/network/real credential.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, realpathSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureProvider } from '../tests/reviewer-provider-fixture.ts';
import { META_ENDPOINT } from '../server/meta-policy.ts';
const bin = (process.env.PATH || '').split(delimiter).map(dir => join(dir, 'wrangler')).find(existsSync);
if (!bin) throw Error('Run through the pinned Wrangler package runner.');
const require = createRequire(realpathSync(bin));
const { build } = require('esbuild'); const { Miniflare, convertV4MiniflareOptions } = require('miniflare');
const compiled = await build({ entryPoints: [fileURLToPath(new URL('../checks/fixtures/edge-live-worker.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022' });
const script = compiled.outputFiles[0].text; const origin = 'https://tower.example';
const cases = [{ date: '2026-01-01' }, { date: '2026-11-19' }, ...[302, 401, 400, 429, 503, 'invalid'].map(failure => ({ date: '2026-11-19', failure }))];
for (const { date, failure } of cases) {
  const f = fixtureProvider(origin, failure === 302 ? 'redirect' : failure); let dispatched = 0;
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script, compatibilityDate: date, cf: false, d1Databases: ['TOWER_RUNTIME'], bindings: { META_API_KEY: 'SYNTHETIC-NOT-REAL' }, outboundService: async request => {
    assert.equal(request.url, META_ENDPOINT); assert.equal(request.headers.get('Authorization'), 'Bearer SYNTHETIC-NOT-REAL'); dispatched++;
    return f.provider.send({ endpoint: META_ENDPOINT, redirect: 'error', signal: request.signal, body: await request.json() });
  } }));
  try {
    const modes = await (await mf.dispatchFetch(origin + '/fixture/request-modes')).json(); assert.deepEqual(modes, { errorRejected: true, manualAccepted: true });
    const start = await mf.dispatchFetch(origin + '/api/reviewer/start', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{"consent":true}' });
    const grant = await start.json();
    assert.equal(start.status, 200);
    for (let step = 0; step < 3; step++) {
      const response = await mf.dispatchFetch(origin + '/api/reviewer/v1/chat/completions', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: grant.ticket, step }) });
      const result = await response.json();
      if (failure !== undefined && !response.ok) {
        const expected = failure === 401 ? 'PROVIDER_AUTHORIZATION' : failure === 400 ? 'PROVIDER_REQUEST_REJECTED' : failure === 429 ? 'PROVIDER_LIMIT' : failure === 'invalid' ? 'OUTPUT_REJECTED' : 'PROVIDER_UNAVAILABLE';
        assert.equal(result.code, expected); assert.ok(!JSON.stringify(result).includes('Private upstream'));
        const before = dispatched; const replay = await mf.dispatchFetch(origin + '/api/reviewer/v1/chat/completions', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: grant.ticket, step }) });
        assert.equal(replay.status, 409); assert.equal(dispatched, before); break;
      }
      assert.equal(response.status, 200);
    }
    assert.equal(dispatched, failure === undefined ? 3 : failure === 'invalid' ? 2 : 1);
    console.log('PASS scripted workerd/D1', date, failure ?? 'three-role success', 'outbound calls', dispatched);
  } finally { await mf.dispose(); }
}
