import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gatewayDiagnostic } from '../server/reviewer-diagnostics.ts';
test('gateway diagnostics retain operational metadata without authority or arbitrary request data', () => {
  const request = new Request('https://tower.example/api/reviewer/v1/chat/completions?private=PRIVATE', { method: 'POST', headers: { 'cf-ray': '0123456789abcdef-YVR', Authorization: 'Bearer PRIVATE', Cookie: 'PRIVATE' }, body: 'PRIVATE' });
  assert.deepEqual(gatewayDiagnostic(request, 'provider-response', 502), { service: 'tower-reviewer', event: 'provider-response', route: 'turn', ray: '0123456789abcdef-YVR', status: 502 });
  const untrusted = new Request('https://tower.example/PRIVATE', { headers: { 'cf-ray': 'PRIVATE' } });
  assert.deepEqual(gatewayDiagnostic(untrusted, 'request-start', NaN), { service: 'tower-reviewer', event: 'request-start', route: 'other' });
  Object.defineProperty(untrusted, 'url', { get() { throw Error('PRIVATE'); } });
  assert.equal(gatewayDiagnostic(untrusted, 'handler-error').route, 'other');
});
