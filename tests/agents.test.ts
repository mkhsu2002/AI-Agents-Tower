import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBrief, validateSettings, createModelAdapter } from '../src/agents/model.ts';
import { Operation } from '../spikes/m2/safety.js';
import { parseBundle } from '../src/domain/homebundle.ts';
const settings = { mode: 'mock', scenario: 'success', timeoutMs: 5000, delayMs: 0 } as const;
test('brief and configuration limits reject unknown fields and unconfigured real inference', () => {
  for (const brief of ['', ' \n', 'x'.repeat(1501), '😀'.repeat(1501)]) assert.throws(() => validateBrief(brief));
  validateBrief('😀'.repeat(1500));
  assert.deepEqual(validateSettings(settings), settings);
  for (const input of [null, {}, { ...settings, endpoint: 'https://invalid' }, { ...settings, timeoutMs: 99 }, { ...settings, delayMs: 1001 }, { ...settings, mode: 'real' }, { ...settings, scenario: 'unknown' }]) assert.throws(() => validateSettings(input));
});
test('mock adapter delegates and returns a program-validated exact text bundle', async () => {
  const adapter = createModelAdapter(settings); const operation = new Operation(5000);
  try {
    const brief = '<script>alert(1)</script>\nA library';
    const messages = [{ role: 'user', content: brief }]; const tools = [{ function: { name: 'home_builder' } }];
    const reception = await adapter.chat({ messages, tools, operation });
    assert.equal(reception.toolCalls[0]!.function.name, 'home_builder');
    assert.deepEqual(JSON.parse(reception.toolCalls[0]!.function.arguments), { request: brief });
    const builder = await adapter.chat({ messages, tools: [], operation });
    const final = await adapter.chat({ messages: [...messages, { role: 'tool', content: JSON.stringify({ text: builder.content }) }], tools, operation });
    const bundle = parseBundle(final.content); assert.ok(bundle.ok);
    assert.equal(bundle.value.blocks[0]!.text, brief); assert.equal(adapter.mode, 'mock');
    await assert.rejects(adapter.chat({ messages: [...messages, { role: 'tool', content: '{"error":"failure"}' }], tools, operation }));
  } finally { operation.dispose(); }
});
test('mock invalid output is rejected by schema and failures are not converted to content', async () => {
  const operation = new Operation(5000);
  try {
    const request = { messages: [{ role: 'user', content: 'Library' }], tools: [], operation };
    const invalid = await createModelAdapter({ ...settings, scenario: 'invalid-bundle' }).chat(request);
    assert.equal(parseBundle(invalid.content).ok, false);
    for (const scenario of ['model-error', 'tool-error'] as const) await assert.rejects(createModelAdapter({ ...settings, scenario }).chat(request));
  } finally { operation.dispose(); }
});
test('pending mock inference obeys cancellation and an enforced deadline', async () => {
  const adapter = createModelAdapter({ ...settings, scenario: 'slow-model' });
  const cancelled = new Operation(5000);
  const pending = adapter.chat({ messages: [], tools: [], operation: cancelled }); cancelled.cancel();
  await assert.rejects(pending, /cancelled/); cancelled.dispose();
  const deadline = new Operation(100);
  try { await assert.rejects(adapter.chat({ messages: [], tools: [], operation: deadline }), /deadline exceeded/); }
  finally { deadline.dispose(); }
});
