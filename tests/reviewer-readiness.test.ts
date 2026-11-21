import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/reviewer/[[path]].ts';
import type { ReviewerBindings } from '../server/reviewer-readiness.ts';
const origin = 'https://tower.example';
test('Pages configuration presence never returns credential value or claims valid/live inference', async () => {
  for (const [value, expected] of [[undefined, false], ['', false], ['  ', false], [123, false], ['SYNTHETIC-NOT-A-REAL-KEY', true]] as const) {
    const response = onRequest({ request: new Request(origin + '/api/reviewer/readiness'), env: { META_API_KEY: value } });
    assert.equal(response.status, 200); assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const raw = await response.text(); assert.ok(!raw.includes('SYNTHETIC-NOT-A-REAL-KEY'));
    assert.deepEqual(JSON.parse(raw), { enabled: false, credentialConfigured: expected, connectionVerified: false, model: 'muse-spark-1.3', trialReady: false });
  }
});
test('unsupported readiness methods and all inference routes read no bindings and stay closed', async () => {
  const env: ReviewerBindings = { get META_API_KEY() { throw new Error('SYNTHETIC-PRIVATE-ERROR'); } };
  for (const path of ['/api/reviewer/start', '/api/reviewer/cancel', '/api/reviewer/v1/chat/completions', '/api/reviewer/unknown']) {
    for (const method of ['GET', 'POST']) assert.equal(onRequest({ request: new Request(origin + path, { method }), env }).status, 503);
  }
  assert.equal(onRequest({ request: new Request(origin + '/api/reviewer/readiness', { method: 'POST' }), env }).status, 405);
  const result = await onRequest({ request: new Request(origin + '/api/reviewer/readiness'), env }).json();
  assert.equal(result.credentialConfigured, null); assert.equal(result.enabled, false);
});
