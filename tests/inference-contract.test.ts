// Real HTTP transport, scripted response fixture; NO real inference or provider claim.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createKeylessInference } from '../src/agents/keyless-inference.ts';
import { Operation } from '../spikes/m2/safety.js';
async function fixture(handler: (req: IncomingMessage, res: ServerResponse) => void) {
  const server = createServer(handler); await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('Fixture unavailable');
  const origin = `http://127.0.0.1:${address.port}`;
  return { origin, adapter: createKeylessInference({ endpoint: origin + '/v1/chat/completions', model: 'contract-fixture', approvedOrigin: origin }), async close() { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); } };
}
const answer = (message: unknown = { role: 'assistant', content: 'Fixture text' }, finish_reason = 'stop') => ({ model: 'scripted-contract-fixture-not-inference', choices: [{ message, finish_reason }] });
const request = (operation: Operation) => ({ messages: [{ role: 'user', content: 'Synthetic test brief' }], tools: [{ function: { name: 'home_builder' } }], operation });
test('keyless route requires exact origin authorization and rejects credentials, query and unknown configuration', () => {
  for (const endpoint of ['https://user:secret@example.test/v1/chat/completions', 'https://example.test/v1/chat/completions?q=x', 'https://other.test/v1/chat/completions']) assert.throws(() => createKeylessInference({ endpoint, model: 'test', approvedOrigin: 'https://example.test' }));
  assert.throws(() => createKeylessInference({ endpoint: 'https://example.test/v1/chat/completions', model: 'test', approvedOrigin: 'https://example.test', apiKey: 'synthetic' } as never));
});
test('transport contract emits bounded nonstreaming requests with no credentials and decodes text/tools', async () => {
  const headers: IncomingMessage['headers'][] = []; let tool = false;
  const f = await fixture((req, res) => { headers.push(req.headers); let body = ''; req.on('data', chunk => { body += chunk; }); req.on('end', () => { const doc = JSON.parse(body); assert.equal(doc.stream, false); assert.equal(doc.max_tokens, 2048); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(tool ? answer({ role: 'assistant', content: null, tool_calls: [{ id: 'call1', type: 'function', function: { name: 'home_builder', arguments: '{"request":"Library"}' } }] }, 'tool_calls') : answer())); }); });
  const operation = new Operation(2000);
  try {
    assert.equal((await f.adapter.chat(request(operation))).content, 'Fixture text'); tool = true;
    assert.equal((await f.adapter.chat(request(operation))).toolCalls[0]!.function.name, 'home_builder');
    for (const entry of headers) { assert.equal(entry.authorization, undefined); assert.equal(entry.cookie, undefined); }
  } finally { operation.dispose(); await f.close(); }
});
test('response errors, truncation, unknown tools, malformed and oversized data fail without retries', async () => {
  const responses = [answer({ role: 'assistant', content: 'partial' }, 'length'), answer({ role: 'assistant', content: null, tool_calls: [{ id: 'x', type: 'function', function: { name: 'unlisted', arguments: '{}' } }] }, 'tool_calls'), '{', 'x'.repeat(262145), { choices: [] }];
  for (const value of responses) {
    let calls = 0; const f = await fixture((_req, res) => { calls++; res.end(typeof value === 'string' ? value : JSON.stringify(value)); }); const operation = new Operation(2000);
    try { await assert.rejects(f.adapter.chat(request(operation))); assert.equal(calls, 1); }
    finally { operation.dispose(); await f.close(); }
  }
});
test('redirects, HTTP failure and cancellation/deadline never become a successful model result', async () => {
  for (const mode of ['redirect', 'error', 'deadline', 'cancel']) {
    let target = 0; const f = await fixture((req, res) => {
      if (req.url === '/unexpected') { target++; res.end('unexpected'); return; }
      if (mode === 'redirect') { res.writeHead(302, { Location: '/unexpected' }); res.end(); }
      else if (mode === 'error') { res.writeHead(503); res.end('private provider detail not exposed'); }
    });
    const operation = new Operation(mode === 'deadline' ? 100 : 2000);
    try { const pending = f.adapter.chat(request(operation)); if (mode === 'cancel') operation.cancel(); await assert.rejects(pending); assert.equal(target, 0); }
    finally { operation.dispose(); await f.close(); }
  }
});
