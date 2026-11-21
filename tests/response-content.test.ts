import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAgentResponse } from '../spikes/m2/vendor/runtime/cruse.js';
test('JSON strings preserve literal tool envelopes and presentation-like fences', () => {
  for (const introduction of ['<tool_response>keep</tool_response> <tool_call>literal</tool_call>', 'before ```cruse-ui null``` after', '```cruse-ui {"kind":"info","fields":{"text":"literal"}}```']) {
    const raw = JSON.stringify({ schemaVersion: '0.1', displayName: 'Literal', introduction, blocks: [] });
    assert.equal(parseAgentResponse(raw).text, raw);
  }
  const malformed = '{"introduction":"before ```cruse-ui {"kind":"info","fields":{}}``` after"}';
  assert.equal(parseAgentResponse(malformed).text, malformed);
  assert.throws(() => JSON.parse(parseAgentResponse(malformed).text));
});
test('real presentation after an opaque JSON body is parsed without changing its content', () => {
  const raw = JSON.stringify({ text: '<tool_response>literal</tool_response> ```cruse-ui null```' });
  const proposal = { version: 1, components: [{ kind: 'action', id: 'validate', action: 'https://tower.example/#validate', arguments: { bundleJson: raw } }] };
  const parsed = parseAgentResponse(raw + '\n```cruse-ui\n' + JSON.stringify(proposal) + '\n```');
  assert.equal(parsed.text, raw); assert.equal(parsed.presentation!.components.length, 1);
});
test('complete protocol envelopes still unwrap their real response', () => {
  const raw = '<tool_response>' + JSON.stringify({ Mode: 'final', Name: 'agent', Response: 'A response' }) + '</tool_response>';
  assert.equal(parseAgentResponse(raw).text, 'A response');
});
