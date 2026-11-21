import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInvocation, validateInvocation, validateCallBatch } from '../spikes/m2/invocation.js';
const schema = { type: 'object', properties: { request: { type: 'string', minLength: 0, maxLength: 4 } }, required: ['request'], additionalProperties: false };
test('invocation values retain literal script text, empty strings and Unicode code point lengths', () => {
  const value = parseInvocation('{"request":"😀😀😀😀"}'); validateInvocation(schema, value);
  assert.deepEqual(value, { request: '😀😀😀😀' }); validateInvocation(schema, { request: '' });
  validateInvocation({ ...schema, properties: { request: { type: 'string' } } }, { request: '<script>literal()</script>' });
  assert.throws(() => validateInvocation(schema, { request: '😀'.repeat(5) }));
});
test('malformed, duplicated, nonobject and oversized arguments never become fallback text', () => {
  for (const raw of ['', '{', '[]', 'null', '{"request":"a","request":"b"}', '{"request":"x","\\u0072equest":"y"}', JSON.stringify({ request: 'x'.repeat(65537) })]) assert.throws(() => parseInvocation(raw));
  for (const value of [{}, { request: 1 }, { request: null }, { request: 'ok', extra: 'field' }, JSON.parse('{"constructor":"x","request":"ok"}')]) assert.throws(() => validateInvocation(schema, value));
});
test('unsupported or ambiguous invocation schema constraints fail rather than being ignored', () => {
  for (const candidate of [{ ...schema, oneOf: [] }, { ...schema, additionalProperties: true }, { ...schema, required: ['missing'] }, { ...schema, required: ['request', 'request'] }, { ...schema, properties: { request: { type: 'string', pattern: '.*' } } }, { ...schema, properties: { request: { type: 'number' } } }, { ...schema, properties: { request: { type: 'string', maxLength: -1 } } }]) assert.throws(() => validateInvocation(candidate, { request: 'ok' }));
});
test('whole batches reject invalid siblings, unknown targets, duplicate IDs and excess calls', () => {
  const good = { id: 'one', name: 'builder', args: { request: 'ok' }, entry: { parameters: schema } };
  validateCallBatch([good]);
  for (const calls of [[good, { ...good, id: 'two', args: { request: 1 } }], [{ ...good, entry: undefined }], [good, good], Array.from({ length: 13 }, (_, i) => ({ ...good, id: String(i) }))]) assert.throws(() => validateCallBatch(calls));
});
