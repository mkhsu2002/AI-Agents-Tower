// Synthetic mixed-output responses only; no actual inference or provider credentials.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkedTurn, turnPayload } from '../server/reviewer-turn.ts';
import { discardableReceptionText } from '../server/reception-output.ts';
import { TurnValidationError } from '../server/turn-rejection.ts';
import { fixtureProvider } from './reviewer-provider-fixture.ts';
import { META_ENDPOINT } from '../server/meta-policy.ts';
const origin = 'https://tower.example';
const sentinel = 'UNTRUSTED-NARRATION-DO-NOT-FORWARD';
const narration = () => ({ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: sentinel + '\n```cruse-ui\n{"components":[{"kind":"action","action":"https://unapproved.invalid"}]}\n```' }] });
async function response(step = 0, builder?: string) {
  return (await fixtureProvider(origin).provider.send({ endpoint: META_ENDPOINT, redirect: 'error', signal: new AbortController().signal, body: turnPayload(step, origin, builder) })).json();
}
test('one inert narration with a real handoff normalizes to the exact original result in either order', async () => {
  const base = await response(); const expected = checkedTurn(JSON.stringify(base), 0, origin);
  for (const reverse of [false, true]) {
    const message = { ...narration(), id: 'SYNTHETIC-ID', status: 'completed', phase: 'commentary', content: [{ ...narration().content[0], annotations: [], logprobs: [] }] };
    const mixed = { ...base, output: [{ type: 'reasoning', summary: [] }, ...(reverse ? [base.output[0], message] : [message, base.output[0]])] };
    const result = checkedTurn(JSON.stringify(mixed), 0, origin);
    assert.deepEqual(result, expected); assert.equal(result.content, ''); assert.ok(!JSON.stringify(result).includes(sentinel)); assert.ok(!JSON.stringify(result).includes('unapproved.invalid'));
  }
});
const badMessages: [string, unknown][] = [
  ['refusal', { ...narration(), content: [{ type: 'refusal', refusal: sentinel }] }],
  ['mixed refusal', { ...narration(), content: [...narration().content, { type: 'refusal', refusal: sentinel }] }],
  ['unknown message field', { ...narration(), tool_calls: [] }],
  ['unknown part field', { ...narration(), content: [{ ...narration().content[0], tool: sentinel }] }],
  ['nonassistant', { ...narration(), role: 'user' }],
  ['incomplete message', { ...narration(), status: 'incomplete' }],
  ['unknown phase', { ...narration(), phase: sentinel }],
  ['nontext value', { ...narration(), content: [{ type: 'output_text', text: {} }] }],
  ['nonarray annotations', { ...narration(), content: [{ ...narration().content[0], annotations: {} }] }],
  ['nonarray logprobs', { ...narration(), content: [{ ...narration().content[0], logprobs: {} }] }],
  ['empty content', { ...narration(), content: [] }],
  ['foreign output item', { type: 'computer_call', action: sentinel }],
];
for (const [name, message] of badMessages) test(`narration compatibility rejects ${name} alongside a valid tool`, async () => {
  assert.equal(discardableReceptionText(message), false);
  const base = await response(); base.output.unshift(message);
  assert.throws(() => checkedTurn(JSON.stringify(base), 0, origin), e => e instanceof TurnValidationError && e.reason === 'HANDOFF_SHAPE_INVALID');
});
test('text alone, two narrations, extra tools and unknown output cannot stand in for the single handoff', async () => {
  const base = await response(); const call = base.output[0];
  for (const output of [[narration()], [narration(), narration(), call], [narration(), call, { ...call, call_id: 'second' }], [narration(), { ...call, name: 'foreign_tool' }], [narration(), call, { type: 'unknown', value: sentinel }]]) {
    assert.throws(() => checkedTurn(JSON.stringify({ ...base, output }), 0, origin), e => e instanceof TurnValidationError && e.reason === 'HANDOFF_SHAPE_INVALID');
  }
});
test('narration cannot bypass original ID, exact arguments, model, completion or usage guards', async () => {
  const base = await response(); const call = base.output[0];
  for (const patch of [{ call_id: '' }, { call_id: 'x'.repeat(101) }, { call_id: 'bad/id' }, { arguments: sentinel }, { arguments: JSON.stringify({ request: sentinel }) }, { arguments: '{"request":"x","request":"x"}' }, { arguments: JSON.stringify({ request: sentinel, approved: true }) }]) {
    assert.throws(() => checkedTurn(JSON.stringify({ ...base, output: [narration(), { ...call, ...patch }] }), 0, origin));
  }
  for (const patch of [{ model: 'unapproved-model' }, { status: 'incomplete' }, { usage: { input_tokens: 1, output_tokens: 257 } }, { usage: { input_tokens: 8193, output_tokens: 1 } }]) assert.throws(() => checkedTurn(JSON.stringify({ ...base, ...patch, output: [narration(), call] }), 0, origin));
});
test('later-turn draft/action/exact-copy rules do not gain narration tolerance', async () => {
  const builder = await response(1); const accepted = checkedTurn(JSON.stringify(builder), 1, origin);
  const final = await response(2, accepted.content); assert.equal(checkedTurn(JSON.stringify(final), 2, origin, accepted.content).response.step, 3);
  for (const [step, value] of [[1, builder], [2, final]] as const) {
    assert.throws(() => checkedTurn(JSON.stringify({ ...value, output: [narration(), ...value.output] }), step, origin, accepted.content), e => e instanceof TurnValidationError && e.reason === 'MESSAGE_SHAPE_INVALID');
  }
});
test('rejected mixed items expose only enum counts, never narration or dynamic identifiers', async () => {
  const base = await response(); base.output = [narration(), base.output[0], { type: 'unknown', id: sentinel }];
  assert.throws(() => checkedTurn(JSON.stringify(base), 0, origin), e => {
    assert.ok(e instanceof TurnValidationError); const s = e.structure;
    assert.equal(s.functionCallCountCapped, 1); assert.equal(s.discardableTextCountCapped, 1); assert.equal(s.otherNonReasoningCountCapped, 1);
    assert.ok(!JSON.stringify(e).includes(sentinel)); return true;
  });
});
