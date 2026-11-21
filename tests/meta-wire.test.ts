// Offline contract regression derived from Meta's documented tool_choice restriction.
// No credential, network request or claim of provider conformance beyond this checked field.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { turnPayload, checkedTurn } from '../server/reviewer-turn.ts';
import { createMetaSender } from '../server/meta-sender.ts';
import { META_ENDPOINT } from '../server/meta-policy.ts';
import type { ProviderRequest } from '../server/reviewer-gateway.ts';
import { fixtureProvider } from './reviewer-provider-fixture.ts';
const origin = 'https://tower.example';
test('all server-owned turns use documented auto tool choice, including text-only turns', () => {
  for (let step = 0; step < 3; step++) {
    const payload = turnPayload(step, origin, 'SCRIPTED-BUILDER');
    assert.equal(payload.tool_choice, 'auto');
    assert.equal((payload.tools as unknown[]).length, step === 0 ? 1 : 0);
    assert.equal(payload.parallel_tool_calls, step === 0 ? false : undefined);
    assert.equal(payload.store, false);
    assert.equal(payload.max_output_tokens, step === 0 ? 256 : 1024);
  }
});
test('unsupported tool choices cannot reach the HTTP transport', async () => {
  let calls = 0;
  const send = createMetaSender('SYNTHETIC-NOT-REAL', async () => { calls++; return Response.json({}); });
  for (const tool_choice of ['none', 'required', { type: 'function', name: 'home_builder' }]) {
    await assert.rejects(send({ endpoint: META_ENDPOINT, redirect: 'error', signal: new AbortController().signal, body: { ...turnPayload(0, origin), tool_choice } }));
  }
  await assert.rejects(send({ endpoint: META_ENDPOINT, redirect: 'error', signal: new AbortController().signal, body: { ...turnPayload(0, origin), parallel_tool_calls: true } }));
  assert.equal(calls, 0);
});
test('auto choice does not authorize a plain-text Reception response or altered arguments', async () => {
  const f = fixtureProvider(origin);
  const request: ProviderRequest = { endpoint: META_ENDPOINT, redirect: 'error' as const, signal: new AbortController().signal, body: turnPayload(0, origin) };
  const raw = await (await f.provider.send(request)).text();
  const text = JSON.parse(raw); text.output = [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'A fabricated success.' }] }];
  assert.throws(() => checkedTurn(JSON.stringify(text), 0, origin));
  const multiple = JSON.parse(raw); multiple.output.push({ ...multiple.output[0], call_id: 'extra-call' });
  assert.throws(() => checkedTurn(JSON.stringify(multiple), 0, origin));
  const external = JSON.parse(raw); external.output[0].name = 'unapproved_tool';
  assert.throws(() => checkedTurn(JSON.stringify(external), 0, origin));
  const altered = JSON.parse(raw); altered.output[0].arguments = '{"request":"A different brief"}';
  assert.throws(() => checkedTurn(JSON.stringify(altered), 0, origin));
});
