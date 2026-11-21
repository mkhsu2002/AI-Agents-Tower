// Real workerd + D1, entirely scripted outbound transport. No model/network/real credential.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, realpathSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureProvider } from '../tests/reviewer-provider-fixture.ts';
import { META_ENDPOINT } from '../server/meta-policy.ts';
const bin = (process.env.PATH || '').split(delimiter).map(dir => join(dir, 'wrangler')).find(existsSync);
if (!bin) throw Error('Run through the pinned Wrangler package runner.');
const require = createRequire(realpathSync(bin));
const { build } = require('esbuild'); const { Miniflare, convertV4MiniflareOptions } = require('miniflare');
const compiled = await build({ entryPoints: [fileURLToPath(new URL('../checks/fixtures/edge-live-worker.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022' });
const scratch = await mkdtemp(join(tmpdir(), 'tower-pages-gateway-'));
let pagesScript; let legacyScript;
try {
  execFileSync(process.execPath, [realpathSync(bin), 'pages', 'functions', 'build', fileURLToPath(new URL('../functions', import.meta.url)), '--outdir', join(scratch, 'worker')], { cwd: scratch, env: { ...process.env, WRANGLER_SEND_METRICS: 'false', XDG_CONFIG_HOME: join(scratch, 'config') }, stdio: 'pipe' });
  execFileSync('npm', ['--cache', process.env.TOWER_TEST_NPM_CACHE || join(tmpdir(), 'tower-npm-cache'), 'exec', '--yes', '--package=wrangler@2.20.2', '--', 'wrangler', 'pages', 'functions', 'build', fileURLToPath(new URL('../functions', import.meta.url)), '--outdir', join(scratch, 'legacy')], { cwd: scratch, env: { ...process.env, WRANGLER_SEND_METRICS: 'false', XDG_CONFIG_HOME: join(scratch, 'config') }, stdio: 'pipe' });
  legacyScript = await readFile(join(scratch, 'legacy/index.js'), 'utf8');
  pagesScript = await readFile(join(scratch, 'worker/index.js'), 'utf8');
} finally { await rm(scratch, { recursive: true, force: true }); }
const origin = 'https://tower.example';
const cases = [{ date: '2026-01-01' }, { date: '2026-11-19' }, { date: '2026-11-19', receptionNarration: true }, ...[302, 401, 400, 429, 503, 'invalid'].map(failure => ({ date: '2026-11-19', failure }))];
for (const [surface, script] of [['gateway', compiled.outputFiles[0].text], ['pages-router', pagesScript], ['legacy-pages-router', legacyScript]]) {
for (const { date, failure, receptionNarration } of cases) {
  const f = fixtureProvider(origin, failure === 302 ? 'redirect' : failure, receptionNarration); let dispatched = 0;
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script, compatibilityDate: date, cf: false, d1Databases: ['TOWER_RUNTIME'], bindings: { META_API_KEY: 'SYNTHETIC-NOT-REAL' }, outboundService: async request => {
    assert.equal(request.url, META_ENDPOINT); assert.equal(request.headers.get('Authorization'), 'Bearer SYNTHETIC-NOT-REAL'); dispatched++;
    return f.provider.send({ endpoint: META_ENDPOINT, redirect: 'error', signal: request.signal, body: await request.json() });
  } }));
  try {
    if (surface === 'gateway') { const modes = await (await mf.dispatchFetch(origin + '/fixture/request-modes')).json(); assert.deepEqual(modes, { errorRejected: true, manualAccepted: true }); }
    const denied = await mf.dispatchFetch(origin + '/api/reviewer/start', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{"consent":false}' });
    assert.equal(denied.status, 403); assert.equal((await denied.json()).code, 'CONSENT_REQUIRED'); assert.equal(dispatched, 0);
    const start = await mf.dispatchFetch(origin + '/api/reviewer/start', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{"consent":true}' });
    const grant = await start.json();
    assert.equal(start.status, 200);
    if (surface !== 'gateway') assert.equal(start.headers.get('x-tower-gateway'), 'tower-synthetic-v1');
    for (let step = 0; step < 3; step++) {
      const response = await mf.dispatchFetch(origin + '/api/reviewer/v1/chat/completions', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: grant.ticket, step }) });
      if (surface !== 'gateway') assert.equal(response.headers.get('x-tower-gateway'), 'tower-synthetic-v1');
      const result = await response.json();
      assert.ok(!JSON.stringify(result).includes('SCRIPTED-NARRATION-MUST-BE-DISCARDED'));
      if (failure !== undefined && !response.ok) {
        const expected = failure === 401 ? 'PROVIDER_AUTHORIZATION' : failure === 400 ? 'PROVIDER_REQUEST_REJECTED' : failure === 429 ? 'PROVIDER_LIMIT' : failure === 'invalid' ? 'OUTPUT_REJECTED' : 'PROVIDER_UNAVAILABLE';
        assert.equal(result.code, expected); assert.ok(!JSON.stringify(result).includes('Private upstream'));
        const before = dispatched; const replay = await mf.dispatchFetch(origin + '/api/reviewer/v1/chat/completions', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: grant.ticket, step }) });
        assert.equal(replay.status, 409); assert.equal(dispatched, before); break;
      }
      assert.equal(response.status, 200);
    }
    assert.equal(dispatched, failure === undefined ? 3 : failure === 'invalid' ? 2 : 1);
    console.log('PASS scripted workerd/D1', surface, date, failure ?? (receptionNarration ? 'mixed-output three-role success' : 'three-role success'), 'outbound calls', dispatched);
  } finally { await mf.dispose(); }
}
}
