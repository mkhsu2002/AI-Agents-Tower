import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { sqliteRuntime } from './d1-fixture.ts';
import { handleHomeBuild } from '../server/home-build/handler.mjs';
import { onRequest as homePage } from '../functions/homes/[homeId].ts';

const read = (path: string) => readFile(new URL('../' + path, import.meta.url), 'utf8');
const migration = await read('server/home-build/002-autonomous-homes.sql');
const lamp = JSON.parse(await read('docs/examples/home-briefs/lantern-library.json'));
const deck = JSON.parse(await read('docs/examples/home-briefs/signal-deck.json'));
const origin = 'https://tower.example';
const root = '/api/home-build';
const ownerKey = () => 'home.' + randomBytes(32).toString('hex');
const sha = (value: string) => createHash('sha256').update(value).digest('hex');

function fixture() {
  const store = sqliteRuntime();
  store.sql.exec(migration);
  store.sql.exec('UPDATE home_build_control SET public_enabled=1 WHERE id=1');
  const env = { TOWER_RESIDENCY: store.db, TOWER_HOME_BUILD_ENABLE: 'enabled', TOWER_HOME_VIEW_KEY: 'a'.repeat(64) };
  let calls = 0;
  const plan = async (brief: typeof lamp, answer: string | undefined) => {
    calls++;
    if (brief.displayName === deck.displayName && !answer) return { kind: 'question', field: 'layout' };
    if (brief.displayName === deck.displayName) return { kind: 'plan', layout: 'room-first', typography: 'sans', cover: 'geometric' };
    if (brief.displayName === 'Unusable design') return { kind: 'plan', layout: 'unsupported' };
    return { kind: 'plan', layout: 'split', typography: 'serif', cover: 'botanical' };
  };
  const send = (path: string, method = 'GET', auth?: string, body?: unknown, extra?: HeadersInit) => {
    const headers = new Headers(extra);
    if (auth) headers.set('Authorization', 'Bearer ' + auth);
    if (body !== undefined) headers.set('Content-Type', 'application/json');
    const request = new Request(origin + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    return handleHomeBuild(request, env, plan);
  };
  return { ...store, env, send, calls: () => calls };
}

test('homepage discovery leads to two different homes with durable read-only links', async () => {
  const store = fixture();
  try {
    const homepage = await read('index.html');
    const contractPath = homepage.match(/href="([^"]*\/home-build\.json)"/)?.[1];
    assert.ok(contractPath);
    const contract = JSON.parse(await read('public' + contractPath));
    const routes = JSON.parse(await read('public/_routes.json'));
    assert.ok(routes.include.includes('/api/home-build/*') && routes.include.includes('/homes/*'));
    const state = await (await store.send(contract.runtimeStatus)).json();
    assert.equal(state.availability, 'available');
    const built = [];
    for (const input of [lamp, deck]) {
      const key = ownerKey();
      const start = await store.send(state.start, 'POST', undefined, { ownerKeyHash: sha(key), acceptedRulesVersion: '0.1' });
      assert.equal(start.status, 201);
      const { session, briefSchema } = await start.json();
      assert.ok(briefSchema.required.includes('rooms'));
      assert.equal((await store.send(session + '/brief', 'POST', key, { brief: { ...input, appearance: { css: 'body {}' } } })).status, 400);
      let design = await (await store.send(session + '/brief', 'POST', key, { brief: input })).json();
      if (design.state === 'question') {
        assert.equal(design.question, 'Which part of your home should visitors see first?');
        assert.equal((await store.send(session + '/brief', 'POST', key, { brief: { ...input, welcome: 'Changed' }, answer: 'Yes' })).status, 409);
        design = await (await store.send(session + '/brief', 'POST', key, { brief: input, answer: 'Yes' })).json();
      }
      assert.equal(design.state, 'ready');
      const selected = { rooms: [0] };
      const preview = await (await store.send(session + '/preview', 'POST', key, selected)).json();
      assert.match(preview.html, new RegExp(input.displayName));
      assert.match(preview.html, new RegExp(input.rooms[0].title));
      assert.ok(!preview.html.includes(input.rooms[1].title));
      assert.match(preview.html, new RegExp(input.appearance.palette.background));
      assert.equal((await store.send(session + '/finalize', 'POST', key, { rooms: [], digest: preview.digest })).status, 409);
      const approval = { ...selected, digest: preview.digest };
      const results = await Promise.all([store.send(session + '/finalize', 'POST', key, approval), store.send(session + '/finalize', 'POST', key, approval)]);
      assert.deepEqual(results.map(response => response.status).sort(), [200, 201]);
      const completed = await results[0].json();
      assert.deepEqual(await results[1].json(), completed);
      const url = new URL(completed.url);
      assert.equal(url.origin, origin);
      const id = url.pathname.split('/').at(-1)!;
      const viewPath = root + '/view/' + id;
      const viewKey = new URLSearchParams(url.hash.slice(1)).get('view')!;
      assert.match(viewKey, /^view\.[a-f0-9]{64}$/);
      const shell = homePage({ request: new Request(url.origin + url.pathname), params: { homeId: id } });
      assert.equal(shell.status, 200);
      assert.match(await shell.text(), /\/residence\/viewer\.js/);
      assert.equal((await store.send(viewPath)).status, 404);
      assert.equal((await store.send(viewPath, 'GET', key)).status, 404);
      const value = await store.send(viewPath, 'GET', viewKey);
      assert.equal(value.headers.get('Cache-Control'), 'no-store');
      assert.equal(await value.text(), preview.html);
      assert.equal((await store.send(session, 'GET', viewKey)).status, 401);
      assert.equal((await store.send(session, 'GET', ownerKey())).status, 404);
      built.push({ key, input, session, viewPath, viewKey, url: completed.url, html: preview.html });
    }
    assert.notEqual(built[0].url, built[1].url);
    assert.match(built[0].html, /layout-split/);
    assert.match(built[1].html, /layout-room-first/);
    assert.equal((await store.send(built[0].viewPath, 'GET', built[1].viewKey)).status, 404);
    assert.equal((await store.send(built[0].session, 'GET', built[1].key)).status, 404);
    const first = built[0];
    const revised = { ...first.input, welcome: '<b>New welcome</b>', rooms: [...first.input.rooms].reverse() };
    const body = { brief: revised, rooms: [0] };
    assert.equal((await store.send(first.session + '/home', 'PUT', built[1].key, body, { 'If-Match': '"1"' })).status, 404);
    assert.deepEqual(await (await store.send(first.session + '/home', 'PUT', first.key, body, { 'If-Match': '"1"' })).json(), { revision: 2 });
    assert.equal((await store.send(first.session + '/home', 'PUT', first.key, body, { 'If-Match': '"1"' })).status, 412);
    const edited = await (await store.send(first.viewPath, 'GET', first.viewKey)).text();
    assert.match(edited, /&lt;b&gt;New welcome&lt;\/b&gt;/);
    assert.match(edited, new RegExp(revised.rooms[0].title));
    assert.ok(!edited.includes(first.input.rooms[0].title));
    assert.equal((await (await store.send(first.session, 'GET', first.key)).json()).url, first.url);
    assert.equal((await store.send(first.session + '/share', 'DELETE', first.key)).status, 200);
    assert.equal((await store.send(first.viewPath, 'GET', first.viewKey)).status, 404);
    assert.equal(store.sql.prepare("SELECT count(*) AS n FROM home_build_sessions WHERE state='resident'").get()?.n, 2);
    assert.equal(store.sql.prepare('SELECT count(*) AS n FROM home_build_audit WHERE revision=2 AND sharing=0').get()?.n, 1);
    assert.equal(store.calls(), 3);
  } finally { store.close(); }
});

test('creation defaults off and unusable designs and exhausted budget cannot publish', async () => {
  const store = fixture();
  try {
    assert.deepEqual(await (await handleHomeBuild(new Request(origin + root + '/status'), { ...store.env, TOWER_HOME_BUILD_ENABLE: 'disabled' })).json(), { availability: 'unavailable' });
    const smokeKey = ownerKey();
    store.sql.exec('UPDATE home_build_control SET public_enabled=0 WHERE id=1');
    Object.assign(store.env, { TOWER_HOME_SMOKE_OWNER_HASH: sha(smokeKey) });
    assert.deepEqual(await (await store.send(root + '/status')).json(), { availability: 'unavailable' });
    assert.equal((await store.send(root + '/start', 'POST', undefined, { ownerKeyHash: sha(smokeKey), acceptedRulesVersion: '0.1' })).status, 503);
    assert.equal((await store.send(root + '/start', 'POST', smokeKey, { ownerKeyHash: sha(ownerKey()), acceptedRulesVersion: '0.1' })).status, 503);
    assert.equal((await store.send(root + '/start', 'POST', smokeKey, { ownerKeyHash: sha(smokeKey), acceptedRulesVersion: '0.1' })).status, 201);
    store.sql.exec('UPDATE home_build_control SET public_enabled=1 WHERE id=1');
    const start = async () => {
      const key = ownerKey();
      const response = await store.send(root + '/start', 'POST', undefined, { ownerKeyHash: sha(key), acceptedRulesVersion: '0.1' });
      return { key, session: (await response.json()).session };
    };
    const first = await start();
    assert.equal((await store.send(first.session + '/brief', 'POST', first.key, { brief: { ...lamp, displayName: 'Unusable design' } })).status, 502);
    assert.equal((await (await store.send(first.session, 'GET', first.key)).json()).state, 'failed');
    assert.equal((await store.send(first.session + '/finalize', 'POST', first.key, { rooms: [], digest: '1'.repeat(64) })).status, 409);
    const second = await start();
    store.sql.prepare('UPDATE home_build_budget SET calls=10').run();
    assert.equal((await store.send(second.session + '/brief', 'POST', second.key, { brief: lamp })).status, 429);
    assert.equal((await (await store.send(second.session, 'GET', second.key)).json()).state, 'open');
    assert.equal(store.calls(), 1);
    store.sql.prepare("UPDATE home_build_sessions SET expires_at=0 WHERE state='open'").run();
    assert.equal((await store.send(second.session, 'GET', second.key)).status, 410);
  } finally { store.close(); }
});
