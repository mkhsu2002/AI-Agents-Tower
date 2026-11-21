import { test } from 'node:test';
import assert from 'node:assert/strict';
import { executeValidation, actionPresentation, validationDefinition } from '../src/agents/validation-action.ts';
import { Operation } from '../spikes/m2/safety.js';
import example from '../public/examples/welcome.homebundle.json' with { type: 'json' };

test('registered capability validates real content and exposes a bounded read-only contract', async () => {
  const operation = new Operation(1000); const records: unknown[] = [];
  try {
    assert.equal(validationDefinition.effect, 'read'); assert.equal(validationDefinition.inputSchema.additionalProperties, false);
    assert.deepEqual(await executeValidation({ bundleJson: JSON.stringify(example) }, operation, 'success', value => records.push(value)), { valid: true });
    assert.equal(records.length, 1);
    assert.deepEqual(await executeValidation({ bundleJson: '{"schemaVersion":"unknown"}' }, operation, 'success', value => records.push(value)), { valid: false });
    for (const args of [{ bundleJson: '{}', unknown: true }, {}, { bundleJson: 42 }]) await assert.rejects(executeValidation(args, operation, 'success', () => {}));
  } finally { operation.dispose(); }
});
test('validator errors, cancellation and deadlines are not positive results', async () => {
  const operation = new Operation(1000); let executed = false;
  await assert.rejects(executeValidation({ bundleJson: '{}' }, operation, 'action-error', () => { executed = true; }));
  operation.cancel(); await assert.rejects(executeValidation({ bundleJson: '{}' }, operation, 'success', () => { executed = true; })); operation.dispose();
  const deadline = new Operation(100);
  try { await assert.rejects(executeValidation({ bundleJson: '{}' }, deadline, 'slow-validation', () => { executed = true; }), /deadline/); }
  finally { deadline.dispose(); }
  assert.equal(executed, false);
});
test('model proposals carry exact action references and data rather than executable code', () => {
  const raw = JSON.stringify(example); const action = 'https://tower.example/agents/tower-home-builder#validate_home_bundle';
  const presentation = JSON.parse(actionPresentation(action, raw, 'success').split('\n')[2]!);
  assert.equal(presentation.components[0].action, action); assert.deepEqual(presentation.components[0].arguments, { bundleJson: raw });
});
