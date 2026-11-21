// Synthetic Responses envelopes only, never live inference or raw provider diagnostics.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TurnValidationError } from '../server/turn-rejection.ts';
import type { TurnRejection } from '../server/turn-rejection.ts';
import { checkedTurn, turnPayload } from '../server/reviewer-turn.ts';
import { turnFailureDiagnostic, logTurnFailure } from '../server/reviewer-diagnostics.ts';
import { createLiveReviewer } from '../server/live-reviewer.ts';
import { META_ENDPOINT } from '../server/meta-policy.ts';
import { fixtureProvider } from './reviewer-provider-fixture.ts';
import { sqliteRuntime } from './d1-fixture.ts';
const origin = 'https://tower.example';
const sentinel = 'PRIVATE-PROMPT-KEY-TICKET-CONTENT';
async function envelope(): Promise<Record<string, any>> { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (await fixtureProvider(origin).provider.send({ endpoint: META_ENDPOINT, redirect: 'error', signal: new AbortController().signal, body: turnPayload(0, origin) })).json();
}
const mutations: [string, TurnRejection, (value: Awaited<ReturnType<typeof envelope>>) => unknown][] = [
  ['nonobject', 'ENVELOPE_INVALID', () => null],
  ['wrong model', 'MODEL_MISMATCH', v => ({ ...v, model: sentinel })],
  ['incomplete', 'STATUS_NOT_COMPLETED', v => ({ ...v, status: 'incomplete', incomplete_details: { reason: 'max_output_tokens', extra: sentinel } })],
  ['missing status', 'STATUS_NOT_COMPLETED', v => ({ ...v, status: undefined })],
  ['provider error', 'PROVIDER_ERROR_PRESENT', v => ({ ...v, error: { message: sentinel } })],
  ['missing output', 'OUTPUT_ARRAY_INVALID', v => ({ ...v, output: sentinel })],
  ['missing usage', 'USAGE_INVALID', v => ({ ...v, usage: undefined })],
  ['over-limit output', 'USAGE_INVALID', v => ({ ...v, usage: { input_tokens: 10, output_tokens: 257 } })],
  ['negative usage', 'USAGE_INVALID', v => ({ ...v, usage: { input_tokens: -1, output_tokens: 1 } })],
  ['completed text without handoff', 'HANDOFF_SHAPE_INVALID', v => ({ ...v, output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: sentinel }] }] })],
  ['foreign tool', 'HANDOFF_SHAPE_INVALID', v => ({ ...v, output: [{ ...v.output[0], name: sentinel }] })],
  ['multiple calls', 'HANDOFF_SHAPE_INVALID', v => ({ ...v, output: [v.output[0], { ...v.output[0], call_id: 'second' }] })],
  ['malformed arguments', 'HANDOFF_ARGUMENTS_JSON_INVALID', v => ({ ...v, output: [{ ...v.output[0], arguments: sentinel }] })],
  ['changed arguments', 'HANDOFF_ARGUMENTS_INVALID', v => ({ ...v, output: [{ ...v.output[0], arguments: JSON.stringify({ request: sentinel }) }] })],
];
for (const [name, reason, mutate] of mutations) test(`safe turn classification: ${name} remains rejected`, async () => {
  const value = mutate(await envelope());
  assert.throws(() => checkedTurn(JSON.stringify(value), 0, origin), error => {
    assert.ok(error instanceof TurnValidationError); assert.equal(error.reason, reason);
    const record = turnFailureDiagnostic(new Request(origin + '/api/reviewer/v1/chat/completions?private=' + sentinel, { headers: { 'cf-ray': '0123456789abcdef-YVR', Authorization: sentinel } }), error, 0);
    const serialized = JSON.stringify(record); assert.ok(!serialized.includes(sentinel)); assert.ok(serialized.length < 1600);
    assert.ok(!('ray' in record));
    assert.equal(record.event, 'output-rejected'); assert.equal(record.step, 0);
    if (name === 'completed text without handoff') { assert.equal(record.structure?.firstItem, 'message'); assert.equal(record.structure?.firstContent, 'output_text'); }
    if (name === 'over-limit output') { assert.equal(record.structure?.outputWithinReceptionCap, false); assert.equal(record.structure?.outputWithinBuilderCap, true); }
    if (name === 'incomplete') assert.equal(record.structure?.incompleteReason, 'max_output_tokens');
    return true;
  });
});
test('invalid JSON and unreadable output have separate safe classifications', () => {
  assert.throws(() => checkedTurn(sentinel, 0, origin), e => e instanceof TurnValidationError && e.reason === 'JSON_INVALID');
  const record = turnFailureDiagnostic(new Request(origin), new Error(sentinel), NaN);
  assert.equal(record.reason, 'OUTPUT_BODY_OR_PROCESSING_FAILED'); assert.ok(!JSON.stringify(record).includes(sentinel)); assert.ok(!('step' in record));
});
test('valid handoff and reasoning items retain accepted output; structure enums/counts are bounded', async () => {
  const v = await envelope(); v.output.unshift({ type: 'reasoning', summary: [{ type: 'summary_text', text: sentinel }] });
  assert.equal(checkedTurn(JSON.stringify(v), 0, origin).response.step, 1);
  const error = new TurnValidationError('HANDOFF_SHAPE_INVALID', { status: sentinel, incomplete_details: { reason: sentinel }, output: Array.from({ length: 50 }, () => ({ type: sentinel, name: sentinel, arguments: sentinel, content: [{ type: sentinel, text: sentinel }] })), model: sentinel });
  assert.equal(error.structure.outputCountCapped, 5); assert.equal(error.structure.actionableCountCapped, 5);
  assert.equal(error.structure.firstItem, 'other'); assert.equal(error.structure.firstContent, 'other'); assert.ok(!JSON.stringify(error).includes(sentinel));
});
test('logging failures cannot escape or expose an arbitrary exception', () => {
  const original = console.info; console.info = () => { throw Error(sentinel); };
  try { assert.doesNotThrow(() => logTurnFailure(new Request(origin), new Error(sentinel), 0)); } finally { console.info = original; }
});
test('200 without required tool logs only safe structure, preserves coded 502 and consumes the step once', async () => {
  const storage = sqliteRuntime(); const logs: string[] = []; const original = console.info; let calls = 0;
  console.info = line => { logs.push(String(line)); };
  const req = (path: string, body: unknown) => new Request(origin + '/api/reviewer/' + path, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const gateway = createLiveReviewer({ transport: async () => { calls++; const v = await envelope(); v.output = [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: sentinel }] }]; return Response.json(v); } });
    const env = { META_API_KEY: 'SYNTHETIC-NOT-REAL', TOWER_RUNTIME: storage.db };
    const grant = await (await gateway(req('start', { consent: true }), env)).json();
    const failed = await gateway(req('v1/chat/completions', { ticket: grant.ticket, step: 0 }), env);
    assert.equal(failed.status, 502); assert.equal((await failed.json()).code, 'OUTPUT_REJECTED');
    assert.equal((await gateway(req('v1/chat/completions', { ticket: grant.ticket, step: 0 }), env)).status, 409); assert.equal(calls, 1);
    const events = logs.map(line => JSON.parse(line)); const rejection = events.filter(e => e.event === 'output-rejected');
    assert.equal(rejection.length, 1); assert.equal(rejection[0].reason, 'HANDOFF_SHAPE_INVALID');
    assert.ok(!logs.join().includes(sentinel)); assert.ok(!logs.join().includes(grant.ticket)); assert.ok(!logs.join().includes('SYNTHETIC-NOT-REAL'));
  } finally { console.info = original; storage.close(); }
});
