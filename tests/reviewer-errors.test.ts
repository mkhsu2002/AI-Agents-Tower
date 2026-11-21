import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_ERRORS, demoErrorMessage } from '../src/agents/reviewer-errors.ts';
test('only allowlisted demo error codes become visible messages', () => {
  for (const code of Object.keys(DEMO_ERRORS)) assert.equal(typeof demoErrorMessage(code), 'string');
  for (const value of ['SYNTHETIC-PRIVATE-PROVIDER-ERROR', '__proto__', 'constructor', 'toString', null, {}, 503]) assert.equal(demoErrorMessage(value), undefined);
});
