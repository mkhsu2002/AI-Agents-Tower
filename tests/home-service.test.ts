// Server-core tests use only synthetic identities/content in disposable local databases.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { HomeStore, HomeService, HomeError } from '../server/home-service.ts';
import type { Receipt } from '../server/home-service.ts';
import example from '../public/examples/welcome.homebundle.json' with { type: 'json' };
const auth = async (context: unknown) => context === 'synthetic-a' || context === 'synthetic-b' ? { issuer: 'https://test-identity.example', subject: String(context) } : null;
async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'tower-store-')); const path = join(dir, 'homes.sqlite'); const store = new HomeStore(path);
  return { path, store, service: new HomeService(store, auth), async close() { store.close(); await rm(dir, { recursive: true }); } };
}
const homeId = (receipt: Receipt) => { assert.equal(receipt.status, 'succeeded'); return String(receipt.result!.homeId); };
const rejects = (code: string) => (error: unknown) => error instanceof HomeError && error.code === code;

test('unconfigured auth, unauthenticated requests and authority/unknown bundle fields fail closed', async () => {
  const f = await fixture();
  try {
    await assert.rejects(new HomeService(f.store, async () => { throw new Error('synthetic secret must not escape'); }).create('synthetic-a', { requestKey: 'create-0001', bundle: example }), rejects('AUTH_UNAVAILABLE'));
    await assert.rejects(new HomeService(f.store).create('synthetic-a', { requestKey: 'create-0001', bundle: example }), rejects('AUTH_NOT_CONFIGURED'));
    await assert.rejects(f.service.create({ subject: 'synthetic-a' }, { requestKey: 'create-0001', bundle: example }), rejects('UNAUTHENTICATED'));
    await assert.rejects(f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: example, owner: 'synthetic-b' }), rejects('INVALID_COMMAND'));
    await assert.rejects(f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: { ...example, ownerId: 'synthetic-b' } }), rejects('INVALID_BUNDLE'));
  } finally { await f.close(); }
});
test('two authenticated clients cannot read/update/recover the other tenant content', async () => {
  const f = await fixture();
  try {
    const created = await f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: example }); const id = homeId(created);
    await assert.rejects(f.service.get('synthetic-b', id), rejects('NOT_FOUND'));
    const denied = await f.service.update('synthetic-b', { requestKey: 'update-0001', homeId: id, expectedRevision: 1, bundle: { ...example, displayName: 'Wrong tenant' } });
    assert.equal(denied.status, 'rejected'); assert.equal(denied.error, 'NOT_FOUND');
    assert.equal(await f.service.receipt('synthetic-b', 'create-0001'), null);
    assert.equal((await f.service.get('synthetic-a', id)).bundle.displayName, example.displayName);
  } finally { await f.close(); }
});
test('durable requestKey/hash receipts prevent duplicates and changed-payload reuse across clients/restart', async () => {
  const f = await fixture();
  try {
    const input = { requestKey: 'create-0001', bundle: example }; const receipt = await f.service.create('synthetic-a', input);
    assert.deepEqual(await f.service.create('synthetic-a', input), receipt);
    await assert.rejects(f.service.create('synthetic-a', { ...input, bundle: { ...example, displayName: 'Changed' } }), rejects('IDEMPOTENCY_CONFLICT'));
    const secondStore = new HomeStore(f.path);
    try { const second = new HomeService(secondStore, auth); assert.deepEqual(await second.receipt('synthetic-a', input.requestKey), receipt); assert.deepEqual(await second.create('synthetic-a', input), receipt); }
    finally { secondStore.close(); }
    assert.notEqual(homeId(await f.service.create('synthetic-b', input)), homeId(receipt));
  } finally { await f.close(); }
});
test('optimistic revisions reject stale writes; rejected receipts are durable and payload-bound', async () => {
  const f = await fixture();
  try {
    const id = homeId(await f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: example }));
    const input = { requestKey: 'update-0001', homeId: id, expectedRevision: 1, bundle: { ...example, displayName: 'Revision two' } };
    assert.equal((await f.service.update('synthetic-a', input)).result!.revision, 2);
    const stale = { ...input, requestKey: 'update-stale', bundle: example };
    const rejected = await f.service.update('synthetic-a', stale); assert.equal(rejected.error, 'REVISION_CONFLICT');
    assert.deepEqual(await f.service.update('synthetic-a', stale), rejected);
    await assert.rejects(f.service.update('synthetic-a', { ...stale, expectedRevision: 2 }), rejects('IDEMPOTENCY_CONFLICT'));
    assert.equal((await f.service.get('synthetic-a', id)).bundle.displayName, 'Revision two');
  } finally { await f.close(); }
});
test('snapshot publication binds reviewed revision/content; private edits never mutate public content', async () => {
  const f = await fixture();
  try {
    const id = homeId(await f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: example })); const reviewed = await f.service.get('synthetic-a', id);
    const bad = await f.service.publish('synthetic-a', { requestKey: 'publish-bad', homeId: id, expectedRevision: 1, reviewedDigest: '0'.repeat(64) }); assert.equal(bad.error, 'REVIEW_MISMATCH');
    const publish = { requestKey: 'publish-0001', homeId: id, expectedRevision: 1, reviewedDigest: reviewed.digest };
    const published = await f.service.publish('synthetic-a', publish); const snapshotId = String(published.result!.snapshotId);
    assert.deepEqual(f.service.publicSnapshot(snapshotId), { id: snapshotId, bundle: example, cacheControl: 'no-store' });
    await f.service.update('synthetic-a', { requestKey: 'update-0001', homeId: id, expectedRevision: 1, bundle: { ...example, introduction: 'Private revision' } });
    assert.deepEqual(f.service.publicSnapshot(snapshotId)!.bundle, example);
    const stale = await f.service.publish('synthetic-a', { ...publish, requestKey: 'publish-stale' }); assert.equal(stale.error, 'REVISION_CONFLICT');
    assert.equal(JSON.stringify(f.service.publicSnapshot(snapshotId)).includes('owner'), false);
  } finally { await f.close(); }
});
test('withdrawal is owner-only; replayed publish receipts do not reactivate withdrawn snapshots', async () => {
  const f = await fixture();
  try {
    const id = homeId(await f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: example })); const reviewed = await f.service.get('synthetic-a', id);
    const input = { requestKey: 'publish-0001', homeId: id, expectedRevision: 1, reviewedDigest: reviewed.digest };
    const published = await f.service.publish('synthetic-a', input); const snapshotId = String(published.result!.snapshotId);
    assert.equal((await f.service.unpublish('synthetic-b', { requestKey: 'unpublish-bad', snapshotId })).error, 'NOT_FOUND');
    await f.service.unpublish('synthetic-a', { requestKey: 'unpublish-0001', snapshotId }); assert.equal(f.service.publicSnapshot(snapshotId), null);
    assert.deepEqual(await f.service.publish('synthetic-a', input), published); assert.equal(f.service.publicSnapshot(snapshotId), null);
    const republished = await f.service.publish('synthetic-a', { ...input, requestKey: 'publish-again' }); assert.notEqual(republished.result!.snapshotId, snapshotId);
    assert.equal(f.service.publicSnapshot(snapshotId), null);
  } finally { await f.close(); }
});
test('receipt persistence failure rolls back the home write atomically; recovery finds no fabricated result', async () => {
  const f = await fixture(); const db = new DatabaseSync(f.path);
  try {
    db.exec("CREATE TRIGGER fail_receipt BEFORE INSERT ON receipts BEGIN SELECT RAISE(ABORT,'synthetic disk failure'); END;");
    await assert.rejects(f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: example }), rejects('STORAGE_UNAVAILABLE_CHECK_RECEIPT'));
    assert.equal(Number(db.prepare('SELECT count(*) AS count FROM homes').get()!.count), 0);
    assert.equal(await f.service.receipt('synthetic-a', 'create-0001'), null);
    db.exec('DROP TRIGGER fail_receipt');
    assert.equal((await f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: example })).status, 'succeeded');
  } finally { db.close(); await f.close(); }
});
test('successful content and receipts survive closing and reopening the store', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tower-restart-')); const path = join(dir, 'homes.sqlite');
  const first = new HomeStore(path); const client = new HomeService(first, auth);
  const original = await client.create('synthetic-a', { requestKey: 'create-restart', bundle: example }); first.close();
  const second = new HomeStore(path);
  try { const recovered = new HomeService(second, auth); assert.deepEqual(await recovered.receipt('synthetic-a', 'create-restart'), original); assert.deepEqual((await recovered.get('synthetic-a', homeId(original))).bundle, example); }
  finally { second.close(); await rm(dir, { recursive: true }); }
});
test('concurrent clients with the same expected revision have exactly one accepted update', async () => {
  const f = await fixture(); const secondStore = new HomeStore(f.path);
  try {
    const second = new HomeService(secondStore, auth); const id = homeId(await f.service.create('synthetic-a', { requestKey: 'create-0001', bundle: example }));
    const results = await Promise.all([
      f.service.update('synthetic-a', { requestKey: 'update-first', homeId: id, expectedRevision: 1, bundle: { ...example, displayName: 'First writer' } }),
      second.update('synthetic-a', { requestKey: 'update-second', homeId: id, expectedRevision: 1, bundle: { ...example, displayName: 'Second writer' } }),
    ]);
    assert.equal(results.filter(result => result.status === 'succeeded').length, 1);
    assert.equal(results.filter(result => result.error === 'REVISION_CONFLICT').length, 1);
    assert.equal((await f.service.get('synthetic-a', id)).revision, 2);
  } finally { secondStore.close(); await f.close(); }
});
