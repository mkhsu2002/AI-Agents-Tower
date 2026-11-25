import validate from './validate-brief.mjs';
import schema from '../../docs/home-brief-v0.1.schema.json' with { type: 'json' };
import { Operation, strictJson } from '../../agent-network/runtime/source/safety.js';
import { boundedText } from '../bounded-body.ts';
import { designQuestion, planWithMeta, validDesign } from './design-planner.mjs';
import { renderResidence } from './presentation.mjs';

const root = '/api/home-build';
const rulesVersion = '0.1';
const hex = value => Array.from(new Uint8Array(value), byte => byte.toString(16).padStart(2, '0')).join('');
const encode = value => new TextEncoder().encode(value);
const sha = async value => hex(await crypto.subtle.digest('SHA-256', encode(value)));
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const isId = value => /^[a-f0-9]{32}$/.test(value ?? '');
const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const exact = (value, fields) => isObject(value) && Object.keys(value).length === fields.length &&
  fields.every(field => Object.hasOwn(value, field));
const sessionPath = id => root + '/sessions/' + id;
const matchOwner = /^Bearer (home\.[a-f0-9]{64})$/;
const matchViewer = /^Bearer (view\.[a-f0-9]{64})$/;

class RequestError extends Error {
  constructor(status, code) { super(code); this.status = status; }
}
const stop = (status, code) => { throw new RequestError(status, code); };
const headers = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};
const json = (body, status = 200) => Response.json(body, { status, headers });
const page = (body, status = 200) => new Response(body, { status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } });

function canReadHomes(env) {
  return typeof env.TOWER_RESIDENCY?.prepare === 'function' && isHash(env.TOWER_HOME_VIEW_KEY);
}

function canCreateHomes(env, planner) {
  return canReadHomes(env) && env.TOWER_HOME_BUILD_ENABLE === 'enabled' &&
    (typeof planner === 'function' || typeof env.META_API_KEY === 'string' && /^[^\s]{1,8192}$/.test(env.META_API_KEY));
}

async function canStart(request, env, planner) {
  if (!canCreateHomes(env, planner)) return false;
  const control = await env.TOWER_RESIDENCY.prepare('SELECT public_enabled FROM home_build_control WHERE id=1').first();
  if (!control) return false;
  if (control.public_enabled === 1) return true;
  const key = matchOwner.exec(request.headers.get('Authorization') ?? '')?.[1];
  return !!key && isHash(env.TOWER_HOME_SMOKE_OWNER_HASH) && await sha(key) === env.TOWER_HOME_SMOKE_OWNER_HASH;
}

async function signature(env, value) {
  const key = await crypto.subtle.importKey('raw', encode(env.TOWER_HOME_VIEW_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, encode(value)));
}
const viewToken = async (env, row) => 'view.' + await signature(env, `viewer:${row.id}:${row.share_generation}`);
async function homeUrl(env, row, origin) {
  return origin + '/homes/' + row.id + '#view=' + await viewToken(env, row);
}

function readBody(request, op) {
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') stop(415, 'JSON_REQUIRED');
  return boundedText(request.body, 131072, op).then(strictJson).catch(() => stop(400, 'INVALID_JSON'));
}

function projection(brief, plan, selected) {
  if (!Array.isArray(selected) || selected.length > brief.rooms.length ||
      selected.some(index => !Number.isInteger(index) || index < 0 || index >= brief.rooms.length) ||
      new Set(selected).size !== selected.length) stop(400, 'INVALID_ROOM_SELECTION');
  return {
    displayName: brief.displayName,
    welcome: brief.welcome,
    rooms: brief.rooms.filter((_, index) => selected.includes(index)),
    palette: brief.appearance?.palette ?? {},
    plan,
  };
}

async function createSession(request, db, env, now, op) {
  const body = await readBody(request, op);
  if (!exact(body, ['ownerKeyHash', 'acceptedRulesVersion']) || !isHash(body.ownerKeyHash) ||
    body.acceptedRulesVersion !== rulesVersion) stop(400, 'INVALID_SESSION_REQUEST');
  const restricted = await db.prepare('SELECT public_enabled FROM home_build_control WHERE id=1').first();
  if (restricted?.public_enabled !== 1) {
    const key = matchOwner.exec(request.headers.get('Authorization') ?? '')?.[1];
    if (!key || body.ownerKeyHash !== env.TOWER_HOME_SMOKE_OWNER_HASH || await sha(key) !== body.ownerKeyHash) stop(503, 'BUILDER_UNAVAILABLE');
  }
  const network = await signature(env, 'start:' + (request.headers.get('CF-Connecting-IP') ?? 'unknown'));
  const id = hex(crypto.getRandomValues(new Uint8Array(16)));
  const created = await db.prepare(`
    INSERT INTO home_build_sessions(id,owner_hash,network_hash,created_at,expires_at,state)
    SELECT ?,?,?,?,?,'open' WHERE
      (SELECT count(*) FROM home_build_sessions WHERE network_hash=? AND created_at>?) < 5 AND
      (SELECT count(*) FROM home_build_sessions WHERE created_at>?) < 40
    ON CONFLICT(owner_hash) DO NOTHING RETURNING id
  `).bind(id, body.ownerKeyHash, network, now, now + 1800000, network, now - 3600000, now - 86400000).first();
  const recovered = created ?? await db.prepare('SELECT id,expires_at,state FROM home_build_sessions WHERE owner_hash=?')
    .bind(body.ownerKeyHash).first();
  if (!recovered) stop(429, 'START_LIMIT');
  if (recovered.state !== 'resident' && recovered.expires_at <= now) stop(410, 'SESSION_EXPIRED');
  return json({
    session: sessionPath(recovered.id), briefSchema: schema, rulesVersion,
    rules: '/agents/residency.html#community-rules',
  }, created ? 201 : 200);
}

async function submitBrief(request, db, row, env, planner, now, op) {
  const body = await readBody(request, op);
  const answered = row.state === 'question';
  if (!exact(body, answered ? ['brief', 'answer'] : ['brief']) ||
      !validate(body.brief) || answered && (typeof body.answer !== 'string' || !body.answer.trim() || body.answer.length > 500)) {
    stop(400, 'INVALID_BRIEF');
  }
  const brief = JSON.stringify(body.brief);
  const briefHash = await sha(brief);
  if (row.state === 'ready' && row.brief_hash === briefHash) return json({ state: 'ready' });
  if (row.state !== 'open' && !answered) stop(409, 'SESSION_NOT_ACCEPTING_BRIEF');
  if (answered && row.brief_hash !== briefHash) stop(409, 'BRIEF_CHANGED_DURING_CLARIFICATION');

  const claim = await db.prepare(`
    UPDATE home_build_sessions SET state='planning',brief_json=?,brief_hash=?,planning_started=?,attempts=attempts+1
    WHERE id=? AND state=? AND attempts=? AND expires_at>? RETURNING attempts
  `).bind(brief, briefHash, now, row.id, row.state, row.attempts, now).first();
  if (!claim) stop(409, 'SESSION_CHANGED');

  try {
    const day = new Date(now).toISOString().slice(0, 10);
    const budget = await db.prepare(`
      INSERT INTO home_build_budget(day,calls) VALUES(?,1)
      ON CONFLICT(day) DO UPDATE SET calls=calls+1 WHERE calls<10 RETURNING calls
    `).bind(day).first();
    if (!budget) {
      await db.prepare('UPDATE home_build_sessions SET state=?,attempts=attempts-1 WHERE id=? AND state=\'planning\'')
        .bind(row.state, row.id).run();
      stop(429, 'DESIGN_CAPACITY_REACHED');
    }
    const design = await (planner ?? ((input, answer, canAsk) => planWithMeta(env.META_API_KEY, input, answer, canAsk)))
      (body.brief, body.answer, !answered);
    if (!validDesign(design, !answered)) throw Error('Unusable design.');
    const state = design.kind === 'question' ? 'question' : 'ready';
    const question = state === 'question' ? designQuestion(design.field) : null;
    const saved = await db.prepare("UPDATE home_build_sessions SET state=?,question=?,plan_json=? WHERE id=? AND state='planning' RETURNING state")
      .bind(state, question, state === 'ready' ? JSON.stringify(design) : null, row.id).first();
    if (!saved) stop(409, 'SESSION_CHANGED');
    return json(question ? { state, question } : { state });
  } catch (error) {
    if (error instanceof RequestError) throw error;
    await db.prepare("UPDATE home_build_sessions SET state='failed' WHERE id=? AND state='planning'").bind(row.id).run();
    stop(502, 'DESIGN_UNAVAILABLE');
  }
}

async function owned(request, route, db, env, origin, now, planner, op) {
  const parts = route.split('/').slice(3);
  const [, id, action] = parts;
  if (parts[0] !== 'sessions' || !isId(id) || parts.length > 3) stop(404, 'NOT_FOUND');
  const secret = matchOwner.exec(request.headers.get('Authorization') ?? '')?.[1];
  if (!secret) stop(401, 'CREDENTIAL_REQUIRED');
  const row = await db.prepare('SELECT * FROM home_build_sessions WHERE id=? AND owner_hash=?')
    .bind(id, await sha(secret)).first();
  if (!row) stop(404, 'NOT_FOUND');
  if (row.state !== 'resident' && row.expires_at <= now) stop(410, 'SESSION_EXPIRED');

  if (!action && request.method === 'GET') {
    if (row.state === 'planning' && row.planning_started < now - 30000) {
      const failed = await db.prepare("UPDATE home_build_sessions SET state='failed',question=NULL WHERE id=? AND state='planning' AND planning_started=? RETURNING state")
        .bind(id, row.planning_started).first();
      if (failed) return json({ state: failed.state, revision: row.revision });
    }
    return json({ state: row.state, revision: row.revision, ...(row.question ? { question: row.question } : {}),
      ...(row.state === 'resident' ? { brief: JSON.parse(row.brief_json), ...(row.sharing ? { url: await homeUrl(env, row, origin) } : {}) } : {}) });
  }
  if (action === 'brief' && request.method === 'POST') {
    if (!await canStart(request, env, planner)) stop(503, 'BUILDER_UNAVAILABLE');
    return submitBrief(request, db, row, env, planner, now, op);
  }
  if (action === 'preview' && request.method === 'POST' && row.state === 'ready') {
    const body = await readBody(request, op);
    if (!exact(body, ['rooms'])) stop(400, 'INVALID_PREVIEW_REQUEST');
    const view = projection(JSON.parse(row.brief_json), JSON.parse(row.plan_json), body.rooms);
    return json({ html: renderResidence(view), digest: await sha(JSON.stringify(view)) });
  }
  if (action === 'finalize' && request.method === 'POST') {
    const body = await readBody(request, op);
    if (!exact(body, ['rooms', 'digest']) || !isHash(body.digest)) stop(400, 'INVALID_FINALIZE_REQUEST');
    if (row.state === 'resident') {
      if (row.approval_hash !== body.digest) stop(409, 'APPROVAL_CHANGED');
      return json({ state: 'resident', ...(row.sharing ? { url: await homeUrl(env, row, origin) } : {}) });
    }
    if (!await canStart(request, env, planner)) stop(503, 'BUILDER_UNAVAILABLE');
    if (row.state !== 'ready') stop(409, 'DESIGN_NOT_READY');
    const view = JSON.stringify(projection(JSON.parse(row.brief_json), JSON.parse(row.plan_json), body.rooms));
    if (await sha(view) !== body.digest) stop(409, 'APPROVAL_CHANGED');
    let home = await db.prepare(`
      UPDATE home_build_sessions SET state='resident',revision=1,projection_json=?,approval_hash=?,share_generation=1,sharing=1
      WHERE id=? AND state='ready' AND expires_at>? RETURNING id,share_generation,sharing
    `).bind(view, body.digest, id, now).first();
    const created = !!home;
    if (!home) {
      home = await db.prepare("SELECT id,share_generation,sharing FROM home_build_sessions WHERE id=? AND state='resident' AND approval_hash=?")
        .bind(id, body.digest).first();
      if (!home) stop(409, 'SESSION_CHANGED');
    }
    return json({ state: 'resident', ...(home.sharing ? { url: await homeUrl(env, home, origin) } : {}) }, created ? 201 : 200);
  }
  if (action === 'home' && request.method === 'PUT' && row.state === 'resident') {
    const revision = request.headers.get('If-Match');
    if (revision !== `"${row.revision}"`) stop(412, 'REVISION_CHANGED');
    const body = await readBody(request, op);
    if (!exact(body, ['brief', 'rooms']) || !validate(body.brief)) stop(400, 'INVALID_BRIEF');
    const view = JSON.stringify(projection(body.brief, JSON.parse(row.plan_json), body.rooms));
    const update = await db.prepare(`
      UPDATE home_build_sessions SET brief_json=?,projection_json=?,revision=revision+1
      WHERE id=? AND revision=? RETURNING revision
    `).bind(JSON.stringify(body.brief), view, id, row.revision).first();
    if (!update) stop(412, 'REVISION_CHANGED');
    return json(update);
  }
  if (action === 'share' && request.method === 'DELETE' && row.state === 'resident') {
    await db.prepare('UPDATE home_build_sessions SET sharing=0,share_generation=share_generation+1 WHERE id=? AND sharing=1').bind(id).run();
    return json({ sharing: false });
  }
  stop(404, 'NOT_FOUND');
}

export async function handleHomeBuild(request, env = {}, planner) {
  const url = new URL(request.url);
  const route = url.pathname;
  const db = env.TOWER_RESIDENCY;
  const op = new Operation(15000);
  try {
    if (url.search || request.headers.has('Cookie')) stop(400, 'REQUEST_REJECTED');
    if (route === root + '/status' && request.method === 'GET') {
      if (!await canStart(request, env, planner)) return json({ availability: 'unavailable' });
      await db.prepare('SELECT id FROM home_build_sessions LIMIT 1').first();
      return json({ availability: 'available', start: root + '/start' });
    }
    if (route === root + '/start' && request.method === 'POST') {
      if (!await canStart(request, env, planner)) stop(503, 'BUILDER_UNAVAILABLE');
      return await createSession(request, db, env, Date.now(), op);
    }
    if (!canReadHomes(env)) stop(503, 'BUILDER_UNAVAILABLE');
    const viewId = route.startsWith(root + '/view/') ? route.slice((root + '/view/').length) : '';
    if (isId(viewId) && request.method === 'GET') {
      const credential = matchViewer.exec(request.headers.get('Authorization') ?? '')?.[1];
      if (!credential) stop(404, 'HOME_UNAVAILABLE');
      const home = await db.prepare("SELECT id,share_generation,projection_json FROM home_build_sessions WHERE id=? AND state='resident' AND sharing=1")
        .bind(viewId).first();
      if (!home || await sha(credential) !== await sha(await viewToken(env, home))) stop(404, 'HOME_UNAVAILABLE');
      return page(renderResidence(JSON.parse(home.projection_json)));
    }
    return await owned(request, route, db, env, url.origin, Date.now(), planner, op);
  } catch (error) {
    if (error instanceof RequestError) return json({ code: error.message }, error.status);
    return json({ code: 'HOUSE_SERVICE_UNAVAILABLE' }, 503);
  } finally { op.dispose(); }
}
