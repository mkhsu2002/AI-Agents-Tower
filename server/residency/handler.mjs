import { parseHomeApplication } from '../../public/agents/residency-validator.mjs';
import { parseBundle } from '../../public/agents/validator.mjs';
import { Operation } from '../../agent-network/runtime/source/safety.js';
import { boundedText } from '../bounded-body.ts';

const root = '/api/residency';
const encoder = new TextEncoder();
const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
const digest = async text => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text))));

function reply(status, data) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

function residentView(row) {
  return {
    status: row.state,
    unitAddress: row.unit_address,
    residentDisplayName: row.resident_name,
    revision: row.revision,
    home: JSON.parse(row.home_json)
  };
}

export async function handleResidency(request, env = {}) {
  const url = new URL(request.url);
  const route = url.pathname;
  const db = env.TOWER_RESIDENCY;
  const enabled = env.TOWER_RESIDENCY_ENABLE === 'invitation-pilot' && typeof db?.prepare === 'function';
  if (url.search || request.headers.has('Cookie')) return reply(400, { code: 'REQUEST_REJECTED' });
  if (route === root + '/status' && request.method === 'GET') {
    if (!enabled) return reply(200, { availability: 'prepare_only' });
    try {
      await db.prepare('SELECT state FROM residency_pilot LIMIT 1').first();
      return reply(200, { availability: 'invitation_only', submit: root + '/applications', home: root + '/home', accept: root + '/handoff' });
    } catch { return reply(503, { availability: 'prepare_only', code: 'RESIDENCY_UNAVAILABLE' }); }
  }
  if (!enabled) return reply(503, { code: 'RESIDENCY_DISABLED' });
  const applying = route === root + '/applications' && request.method === 'POST';
  const reading = route === root + '/home' && request.method === 'GET';
  const accepting = route === root + '/handoff' && request.method === 'POST';
  const editing = route === root + '/home' && request.method === 'PUT';
  if (!applying && !reading && !accepting && !editing) return reply(404, { code: 'NOT_FOUND' });
  const kind = applying ? 'invite' : 'resident';
  const credential = request.headers.get('Authorization') ?? '';
  const match = /^Bearer (invite|resident)\.([a-f0-9]{64})$/.exec(credential);
  if (!match || match[1] !== kind) return reply(401, { code: 'CREDENTIAL_REQUIRED' });

  const op = new Operation(8000);
  try {
    const hash = await op.wait(digest(match[0].slice(7)));
    const now = Date.now();
    if (applying) {
      const prior = await op.wait(db.prepare('SELECT expires_at, state, request_hash, unit_address FROM residency_pilot WHERE invite_hash=?').bind(hash).first());
      if (!prior || prior.expires_at <= now) return reply(404, { code: 'INVITATION_UNAVAILABLE' });
      if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') return reply(415, { code: 'JSON_REQUIRED' });
      const residentHash = request.headers.get('X-Tower-Resident-Key-SHA256');
      if (!/^[a-f0-9]{64}$/.test(residentHash ?? '')) return reply(400, { code: 'RESIDENT_KEY_HASH_REQUIRED' });
      let text;
      try { text = await boundedText(request.body, 73728, op); }
      catch { return reply(400, { code: 'APPLICATION_BODY_INVALID' }); }
      const application = parseHomeApplication(text);
      if (!application.ok) return reply(400, { code: 'APPLICATION_INVALID', errors: application.errors });
      const requestHash = await op.wait(digest(residentHash + '\n' + text));
      // One statement consumes this invitation and persists the assigned private unit.
      if (prior.state === 'invited') {
        const unit = 'Tower-' + hex(crypto.getRandomValues(new Uint8Array(12)));
        try {
          const created = await op.wait(db.prepare(`
            UPDATE residency_pilot SET resident_hash=?, request_hash=?, unit_address=?, resident_name=?,
              home_json=?, state='ready_for_handoff', revision=1
            WHERE invite_hash=? AND state='invited' AND expires_at>? RETURNING unit_address
          `).bind(residentHash, requestHash, unit, application.value.residentDisplayName, JSON.stringify(application.value.home), hash, Date.now()).first());
          if (created) return reply(201, { status: 'ready_for_handoff', unitAddress: created.unit_address });
        } catch (error) {
          if (!String(error?.message).includes('UNIQUE constraint failed: residency_pilot.resident_hash')) throw error;
          return reply(409, { code: 'RESIDENT_KEY_UNAVAILABLE' });
        }
      }
      const stored = await op.wait(db.prepare('SELECT state, request_hash, unit_address FROM residency_pilot WHERE invite_hash=?').bind(hash).first());
      return stored?.request_hash === requestHash
        ? reply(200, { status: stored.state, unitAddress: stored.unit_address })
        : reply(409, { code: 'INVITATION_ALREADY_USED' });
    }

    const row = await op.wait(db.prepare('SELECT state, unit_address, resident_name, revision, home_json FROM residency_pilot WHERE resident_hash=?').bind(hash).first());
    if (!row) return reply(404, { code: 'NOT_FOUND' });
    if (reading) return reply(200, residentView(row));
    if (accepting) {
      if (request.body) return reply(400, { code: 'EMPTY_BODY_REQUIRED' });
      if (row.state === 'resident') return reply(200, { status: row.state, unitAddress: row.unit_address });
      const change = await op.wait(db.prepare("UPDATE residency_pilot SET state='resident' WHERE resident_hash=? AND state='ready_for_handoff' RETURNING unit_address").bind(hash).first());
      if (change) return reply(200, { status: 'resident', unitAddress: change.unit_address });
      const current = await op.wait(db.prepare("SELECT unit_address FROM residency_pilot WHERE resident_hash=? AND state='resident'").bind(hash).first());
      return current ? reply(200, { status: 'resident', unitAddress: current.unit_address }) : reply(409, { code: 'HANDOFF_STATE_CHANGED' });
    }
    if (row.state !== 'resident') return reply(409, { code: 'HANDOFF_REQUIRED' });
    const revision = request.headers.get('If-Match') ?? '';
    if (!/^"[1-9][0-9]{0,8}"$/.test(revision)) return reply(428, { code: 'REVISION_REQUIRED' });
    if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') return reply(415, { code: 'JSON_REQUIRED' });
    let body;
    try { body = parseBundle(await boundedText(request.body, 65536, op)); }
    catch { return reply(400, { code: 'HOME_BODY_INVALID' }); }
    if (!body.ok) return reply(400, { code: 'HOME_INVALID', errors: body.errors });
    const change = await op.wait(db.prepare(`
      UPDATE residency_pilot SET home_json=?, revision=revision+1
      WHERE resident_hash=? AND state='resident' AND revision=? RETURNING revision
    `).bind(JSON.stringify(body.value), hash, Number(revision.slice(1, -1))).first());
    return change ? reply(200, { status: 'resident', revision: change.revision }) : reply(412, { code: 'REVISION_CHANGED' });
  } catch { return reply(503, { code: 'RESIDENCY_UNAVAILABLE' }); }
  finally { op.dispose(); }
}
