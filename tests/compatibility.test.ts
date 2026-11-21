import { test } from 'node:test';
import assert from 'node:assert/strict';
import network from '../public/agents/tower-home-builder.network.json' with { type: 'json' };
import manifest from '../public/agents/agent-manifest.json' with { type: 'json' };
import { strictJson, validateDefinition, validateManifest } from '../spikes/m2/safety.js';

test('published development graph and manifest fit the declared local subset', () => {
  assert.deepEqual(validateDefinition(strictJson(JSON.stringify(network))), network);
  assert.deepEqual(validateManifest(manifest, 'https://tower.example/agents'), manifest);
});
test('official optional constructs outside the local subset fail explicitly instead of being stripped', () => {
  for (const extension of [{ commondefs: { replacement_strings: { task: 'draft' } } }, { sly_data_schema: { type: 'object', properties: {} } }, { max_iterations: 4 }]) {
    assert.throws(() => validateDefinition({ ...structuredClone(network), ...extension }), /strict schema/);
  }
  const configured = structuredClone(network) as unknown as Record<string, unknown>;
  configured.llm_config = { model_name: 'model', temperature: 0.2 };
  assert.throws(() => validateDefinition(configured), /strict schema/);
});
test('unresolved HOCON and executable agent constructs are deliberately unsupported', () => {
  assert.throws(() => strictJson('include "common.hocon"\ntools=[]'), /valid JSON/);
  const executable = structuredClone(network); Object.assign(executable.tools[1]!, { class: 'untrusted.Execute' });
  assert.throws(() => validateDefinition(executable), /strict schema/);
});
test('optional manifest features and relocated artifacts are not silently accepted as interoperable', () => {
  assert.throws(() => validateManifest({ ...manifest, actions: { module: '/untrusted.js' } }, 'https://tower.example/agents'), /strict schema/);
  const relocated = structuredClone(manifest); relocated.networks[0]!.hocon = 'https://other.example/network.json';
  assert.throws(() => validateManifest(relocated, 'https://tower.example/agents'), /authorized publishing origin/);
});
test('development browser router never masquerades as a real default router', () => {
  const unlabelled = structuredClone(manifest); unlabelled.llm_router.mock = false;
  assert.throws(() => validateManifest(unlabelled, 'https://tower.example/agents'), /HTTP/);
});
