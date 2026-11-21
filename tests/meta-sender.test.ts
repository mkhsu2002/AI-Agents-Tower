// Scripted HTTP boundary tests only. No actual key or network/provider request.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMetaSender } from '../server/meta-sender.ts';
import { META_ENDPOINT, META_MODEL } from '../server/meta-policy.ts';
import { REVIEWER_BRIEF } from '../src/agents/reviewer-contract.ts';
import type { ProviderRequest } from '../server/reviewer-gateway.ts';
const key = 'SYNTHETIC-NOT-A-REAL-KEY';
const request = (): ProviderRequest => ({ endpoint: META_ENDPOINT, redirect: 'error', signal: new AbortController().signal, body: { model: META_MODEL, store: false, max_output_tokens: 256, reasoning: { effort: 'minimal' }, instructions: 'Synthetic Reception fixture', input: REVIEWER_BRIEF, tools: [], tool_choice: 'none' } });
test('prepared sender uses exact Meta endpoint, server-only authorization and bounded nonstoring payload', async () => {
  let calls = 0;
  const send = createMetaSender(key, async (url, init) => { calls++; assert.equal(url, META_ENDPOINT); assert.equal(init?.redirect, 'manual'); assert.equal(init?.credentials, 'omit'); assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer ' + key); return Response.json({ scripted: true }); });
  assert.deepEqual(await (await send(request())).json(), { scripted: true }); assert.equal(calls, 1);
});
test('missing credentials, extra fields, paid/model route changes and oversized payload cannot dispatch', async () => {
  let calls = 0; const transport: typeof fetch = async () => { calls++; return Response.json({}); };
  for (const invalid of ['', ' ', 'x\nheader', 'x'.repeat(8193)]) assert.throws(() => createMetaSender(invalid, transport));
  const send = createMetaSender(key, transport);
  for (const patch of [{ model: 'other-model' }, { store: true }, { max_output_tokens: 4096 }, { models: ['fallback'] }, { apiKey: key }, { input: 'x'.repeat(8193) }]) await assert.rejects(send({ ...request(), body: { ...request().body, ...patch } }));
  await assert.rejects(send({ ...request(), endpoint: 'https://unapproved.invalid' } as never));
  const aborted = new AbortController(); aborted.abort(); await assert.rejects(send({ ...request(), signal: aborted.signal }));
  assert.equal(calls, 0);
});
test('transport failures and redirect/quota responses do not leak raw details or retry', async () => {
  for (const scenario of ['throw', 'redirect', 'quota'] as const) {
    let calls = 0;
    const send = createMetaSender(key, async () => { calls++; if (scenario === 'throw') throw Error(key); if (scenario === 'redirect') return new Response(null, { status: 302 }); return new Response(key, { status: 429 }); });
    if (scenario === 'quota') { const response = await send(request()); assert.equal(response.status, 429); assert.ok(!(await response.text()).includes(key)); }
    else await assert.rejects(send(request()), error => error instanceof Error && !error.message.includes(key));
    assert.equal(calls, 1);
  }
});
