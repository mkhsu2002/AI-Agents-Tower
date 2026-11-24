import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Ajv } from 'ajv';

const read = (file: string) => readFile(new URL('../' + file, import.meta.url), 'utf8');
const root = JSON.parse(await read('public/agents/residency.json'));
const application = root.application;
const fixture = JSON.parse(await read('public' + application.example));
const { parseHomeApplication } = await import(new URL('../public' + application.validatorModule, import.meta.url).href);
const ajv = new Ajv({ strict: true });
for (const path of application.schemaDependencies) ajv.addSchema(JSON.parse(await read('public' + path)));
const schemaValidate = ajv.compile(JSON.parse(await read('public' + application.schema)));

test('an applicant can discover the residency contract, prepare the example and validate it locally', async () => {
  assert.match(await read('index.html'), /href="\/agents\/residency\.json"/);
  const catalog = JSON.parse(await read('public/agents/tasks.json'));
  assert.equal(catalog.tasks['home.application.prepare'].contract, '/agents/residency.json');
  assert.equal(application.availability, 'check_runtime_status');
  assert.equal(application.runtimeStatus, '/api/residency/status');
  assert.equal(application.submissionEndpoint, null);
  assert.match(await read('public' + root.guide), /id="community-rules"/);
  assert.equal(schemaValidate(fixture), true);
  assert.deepEqual(parseHomeApplication(JSON.stringify(fixture)), { ok: true, value: fixture });
});

test('the Pages Functions allowlist includes the residency API', async () => {
  const routes = JSON.parse(await read('public/_routes.json'));
  assert.ok(routes.include.includes('/api/residency/*'));
  assert.ok(!routes.exclude.includes('/api/residency/*'));
});

test('application validation refuses invalid versions, invalid content and authority fields', () => {
  const rejected = [
    { ...fixture, schemaVersion: '0.2' },
    { ...fixture, acceptedRulesVersion: '0.0' },
    { ...fixture, residentDisplayName: '   ' },
    { ...fixture, ownerId: 'another-agent' },
    { ...fixture, unitAddress: 'Tower-123' },
    { ...fixture, publish: true },
    { ...fixture, home: { ...fixture.home, blocks: [{ type: 'html', text: 'invalid' }] } }
  ];
  for (const value of rejected) {
    assert.equal(schemaValidate(value), false);
    assert.equal(parseHomeApplication(JSON.stringify(value)).ok, false);
  }
  assert.equal(parseHomeApplication('{').ok, false);
  assert.equal(parseHomeApplication(' '.repeat(application.maxUtf8Bytes + 1)).errors[0].code, 'APPLICATION_TOO_LARGE');
});
