import { test } from 'node:test';
import assert from 'node:assert/strict';
import example from '../public/examples/welcome.homebundle.json' with { type: 'json' };
import { exportBundle, MAX_BYTES, parseBundle, validateBundle } from '../src/domain/homebundle.ts';

function valid(input: unknown) {
  const result = validateBundle(input); assert.equal(result.ok, true, JSON.stringify(result));
  if (!result.ok) throw new Error('Expected valid bundle');
  return result.value;
}
function rejected(input: unknown) { assert.equal(validateBundle(input).ok, false); }

test('example and minimal bundle round-trip without mutation, including optional theme absence', () => {
  for (const bundle of [example, { schemaVersion: '0.1', displayName: 'A', introduction: 'Hi', blocks: [] }]) {
    const original = structuredClone(bundle);
    const output = exportBundle(bundle); assert.ok(output.ok);
    const parsed = parseBundle(output.value); assert.ok(parsed.ok);
    assert.deepEqual(parsed.value, original); assert.deepEqual(bundle, original);
  }
});
test('script-like content, whitespace, Unicode and property order survive repeated edits and exports', () => {
  let bundle = valid({ ...example, displayName: '🪴 Atlas', introduction: '  <script>globalThis.pwned=1</script>\n& <img src=x onerror=alert(1)>', blocks: [{ type: 'text', title: 'javascript:alert(1)', text: 'line 1\nline 2\t\\ <b>not bold</b>' }] });
  for (let i = 0; i < 10; i++) {
    bundle.blocks[0].text += `\nEdit ${i}`;
    const output = exportBundle(bundle); assert.ok(output.ok);
    const parsed = parseBundle(output.value); assert.ok(parsed.ok); assert.deepEqual(parsed.value, bundle); bundle = parsed.value;
  }
  assert.equal(bundle.introduction.startsWith('  <script>'), true);
});
test('missing, wrong types, unsupported versions, invalid themes and whitespace-only values fail', () => {
  for (const input of [null, [], 'text', {}, { ...example, schemaVersion: '0.2' }, { ...example, schemaVersion: 0.1 }, { ...example, blocks: {} }, { ...example, displayName: 12 }, { ...example, introduction: '\n  ' }, { ...example, theme: '#123456' }, { ...example, theme: null }, { ...example, blocks: [{ type: 'html', title: 'X', text: '<b>X</b>' }] }]) rejected(input);
  const result = parseBundle(JSON.stringify({ ...example, schemaVersion: '1.0' }));
  assert.ok(!result.ok); assert.ok(result.errors.some(e => e.code === 'UNSUPPORTED_VERSION'));
});
test('unknown fields at every level, authority and credential fields are rejected, never stripped', () => {
  for (const key of ['token', 'ownerId', 'approved', 'published', '__proto__', 'constructor']) {
    rejected(JSON.parse(JSON.stringify(example).replace('"schemaVersion"', `"${key}":true,"schemaVersion"`)));
    rejected({ ...example, blocks: [{ type: 'text', title: 'X', text: 'Y', [key]: true }] });
  }
});
test('field and count boundaries are enforced with Unicode code point lengths', () => {
  valid({ ...example, displayName: '🪴'.repeat(80), introduction: 'a'.repeat(2000), blocks: [{ type: 'text', title: 'a'.repeat(120), text: 'a'.repeat(4000) }] });
  rejected({ ...example, displayName: 'a'.repeat(81) }); rejected({ ...example, introduction: 'a'.repeat(2001) });
  rejected({ ...example, blocks: [{ type: 'text', title: 'a'.repeat(121), text: 'a' }] });
  rejected({ ...example, blocks: [{ type: 'text', title: 'a', text: 'a'.repeat(4001) }] });
  const block = { type: 'text', title: 'X', text: 'Y' };
  valid({ ...example, blocks: Array(12).fill(block) }); rejected({ ...example, blocks: Array(13).fill(block) });
});
test('malformed JSON, duplicate keys (including escaped names), oversized UTF-8 and pretty export overflow fail', () => {
  for (const raw of ['', '{', 'null', '[]', '{"schemaVersion":', '{"x":1,}', JSON.stringify(example) + ' trailing']) assert.equal(parseBundle(raw).ok, false);
  for (const raw of ['{"x":1,"x":2}', '{"blocks":[{"title":"a","ti\\u0074le":"b"}]}']) {
    const result = parseBundle(raw); assert.ok(!result.ok); assert.equal(result.errors[0].code, 'DUPLICATE_KEY');
  }
  const huge = parseBundle(' '.repeat(MAX_BYTES + 1)); assert.ok(!huge.ok); assert.equal(huge.errors[0].code, 'TOO_LARGE');
  const unicode = { ...example, blocks: Array.from({ length: 12 }, () => ({ type: 'text', title: 'X', text: '🪴'.repeat(4000) })) }; rejected(unicode);
  const compact = JSON.stringify({ ...example, blocks: Array.from({ length: 12 }, () => ({ type: 'text', title: 'X', text: 'a'.repeat(4000) })) });
  assert.ok(parseBundle(compact).ok);
  const escaped = { ...example, blocks: Array.from({ length: 9 }, () => ({ type: 'text', title: 'X', text: '\n'.repeat(3900) + 'a' })) };
  rejected(escaped);
});
test('returned data is detached and invalid export never creates partial content', () => {
  const result = valid(example); result.blocks[0].text = 'edited'; assert.notEqual(result.blocks[0].text, example.blocks[0].text);
  const output = exportBundle({ ...example, privateMemory: 'no' }); assert.equal(output.ok, false);
});

test('input byte cap is inclusive, and compact input cannot bypass the canonical export cap', () => {
  const compact = JSON.stringify(example);
  assert.ok(parseBundle(compact + ' '.repeat(MAX_BYTES - Buffer.byteLength(compact))).ok);
  assert.equal(parseBundle(compact + ' '.repeat(MAX_BYTES - Buffer.byteLength(compact) + 1)).ok, false);
  const nearLimit = { ...example, introduction: 'x', blocks: Array.from({ length: 12 }, (_, i) => ({ type: 'text', title: 'X', text: (i < 4 ? 'é' : 'a').repeat(4000) })) };
  const remaining = MAX_BYTES - 10 - Buffer.byteLength(JSON.stringify(nearLimit));
  assert.ok(remaining > 0 && remaining < 2000);
  nearLimit.introduction += 'x'.repeat(remaining);
  assert.ok(Buffer.byteLength(JSON.stringify(nearLimit)) <= MAX_BYTES);
  const result = parseBundle(JSON.stringify(nearLimit)); assert.ok(!result.ok); assert.equal(result.errors[0].code, 'TOO_LARGE');
});
