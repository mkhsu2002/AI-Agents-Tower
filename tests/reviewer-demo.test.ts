// Configuration/HTTP fixtures only; no real inference is performed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { REVIEWER_PROTOCOL } from '../src/agents/reviewer-contract.ts';
import { reviewerAdapter } from '../src/agents/reviewer-demo.ts';
import { Operation } from '../spikes/m2/safety.js';
test('reviewer configuration fails closed for disabled, unknown, credential-bearing and redirected status', async () => {
  let value: unknown = { enabled: false }; let redirect = false; let targetCalls = 0;
  const server = createServer((req, res) => {
    if (req.url === '/api/reviewer/start') { res.end(JSON.stringify({ ticket: 'a'.repeat(48), step: 0 })); return; }
    if (req.url !== '/reviewer/status.json') { targetCalls++; res.end('{}'); return; }
    if (redirect) { res.writeHead(302, { Location: '/unexpected' }); res.end(); return; }
    res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('Fixture unavailable');
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    for (value of [{ enabled: false }, null, {}, { enabled: 'true' }, { enabled: true, model: 'fixture', apiKey: 'synthetic-never-real' }, { enabled: true, model: 'fixture', endpoint: 'https://unapproved.invalid' }, { enabled: true, model: 'bad model' }]) {
      const operation = new Operation(1000);
      try { await assert.rejects(reviewerAdapter(operation, origin)); } finally { operation.dispose(); }
    }
    value = { enabled: true, protocol: REVIEWER_PROTOCOL };
    const operation = new Operation(1000);
    try { const adapter = await reviewerAdapter(operation, origin); assert.equal(adapter.baseUrl, origin); assert.equal(adapter.mock, false); } finally { operation.dispose(); }
    redirect = true; const redirected = new Operation(1000);
    try { await assert.rejects(reviewerAdapter(redirected, origin)); } finally { redirected.dispose(); }
    assert.equal(targetCalls, 0);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
