import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { sqliteRuntime } from './d1-fixture.ts';
import { onRequest } from '../functions/api/residency/[[path]].ts';

const migration = await readFile(new URL('../server/residency/001-pilot.sql', import.meta.url), 'utf8');
const application = JSON.parse(await readFile(new URL('../public/examples/home-application-v0.1.json', import.meta.url), 'utf8'));
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const key = (type: string) => type + '.' + randomBytes(32).toString('hex');
const call = (env: Record<string, unknown>, path: string, method = 'GET', auth?: string, body?: unknown, extra?: HeadersInit) => {
  const headers = new Headers(extra);
  if (auth) headers.set('Authorization', 'Bearer ' + auth);
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  return onRequest({ request: new Request('https://tower.example/api/residency/' + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }), env });
};

test('private invitation provisions one home, survives replay and gives only the resident management after acceptance', async () => {
  const store = sqliteRuntime();
  try {
    const env = { TOWER_RESIDENCY_ENABLE: 'invitation-pilot', TOWER_RESIDENCY: store.db };
    const invite = key('invite'), resident = key('resident'), stranger = key('resident');
    const credentials = { 'X-Tower-Resident-Key-SHA256': digest(resident) };
    assert.equal((await call(env, 'status')).status, 503);
    await store.db.exec(migration);
    await store.db.prepare('INSERT INTO residency_pilot (invite_hash, expires_at) VALUES (?, ?)').bind(digest(invite), Date.now() + 60000).run();
    assert.equal((await (await call({}, 'status')).json()).availability, 'prepare_only');
    assert.equal((await call({}, 'applications', 'POST', invite, application, credentials)).status, 503);
    const discovered = await (await call(env, 'status')).json();
    assert.equal(discovered.availability, 'invitation_only');
    assert.equal((await call(env, 'applications', 'POST', invite, { ...application, owner: stranger }, credentials)).status, 400);
    const responses = await Promise.all([1, 2].map(() => call(env, 'applications', 'POST', invite, application, credentials)));
    assert.deepEqual(responses.map(r => r.status).sort(), [200, 201]);
    const [first, firstReplay] = await Promise.all(responses.map(r => r.json()));
    assert.deepEqual(first, firstReplay);
    assert.equal(first.status, 'ready_for_handoff');
    assert.equal((await call(env, 'applications', 'POST', invite, application, { 'X-Tower-Resident-Key-SHA256': digest(stranger) })).status, 409);
    assert.equal((await call(env, 'home')).status, 401);
    assert.equal((await call(env, 'home', 'GET', invite)).status, 401);
    assert.equal((await call(env, 'home', 'GET', stranger)).status, 404);
    assert.equal((await call(env, 'handoff', 'POST', stranger)).status, 404);
    assert.equal((await call(env, 'home', 'PUT', resident, application.home, { 'If-Match': '"1"' })).status, 409);
    const nonemptyHandoff = await call(env, 'handoff', 'POST', resident, {});
    assert.equal(nonemptyHandoff.status, 400);
    assert.deepEqual(await nonemptyHandoff.json(), { code: 'EMPTY_BODY_REQUIRED' });
    // Pages can expose a body stream for a POST that contains zero bytes.
    const request = new Request('https://tower.example/api/residency/handoff', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + resident },
      body: ''
    });
    assert.ok(request.body);
    const accepted = await (await onRequest({ request, env })).json();
    assert.deepEqual(accepted, { status: 'resident', unitAddress: first.unitAddress });
    assert.deepEqual(await (await call(env, 'handoff', 'POST', resident)).json(), accepted);
    const home = { ...application.home, displayName: 'Juniper Library' };
    assert.equal((await call(env, 'home', 'PUT', resident, home, { 'If-Match': '"1"' })).status, 200);
    assert.equal((await call(env, 'home', 'PUT', resident, application.home, { 'If-Match': '"1"' })).status, 412);
    const view = await (await call(env, 'home', 'GET', resident)).json();
    assert.equal(view.revision, 2);
    assert.deepEqual(view.home, home);
    assert.equal(store.sql.prepare('SELECT count(*) n FROM residency_pilot').get()?.n, 1);
  } finally { store.close(); }
});

test('an expired invitation cannot create a home', async () => {
  const store = sqliteRuntime();
  try {
    await store.db.exec(migration);
    const invite = key('invite');
    await store.db.prepare('INSERT INTO residency_pilot (invite_hash, expires_at) VALUES (?, ?)').bind(digest(invite), 1).run();
    const env = { TOWER_RESIDENCY_ENABLE: 'invitation-pilot', TOWER_RESIDENCY: store.db };
    const result = await call(env, 'applications', 'POST', invite, application, { 'X-Tower-Resident-Key-SHA256': digest(key('resident')) });
    assert.equal(result.status, 404);
    assert.equal(store.sql.prepare('SELECT state FROM residency_pilot').get()?.state, 'invited');
  } finally { store.close(); }
});
