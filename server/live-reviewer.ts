// Public fixed-example gateway. D1 owns cross-instance admission and consumed step state.
import { Operation, strictJson } from '../spikes/m2/safety.js';
import { boundedText } from './bounded-body.ts';
import { turnPayload, checkedTurn } from './reviewer-turn.ts';
import { createMetaSender } from './meta-sender.ts';
import { META_ENDPOINT } from './meta-policy.ts';
export interface Statement { bind(...values: unknown[]): Statement; first<T = Record<string, unknown>>(): Promise<T | null>; run(): Promise<{ meta: { changes: number } }> }
export interface RuntimeDatabase { exec(sql: string): Promise<unknown>; prepare(sql: string): Statement }
export interface LiveBindings { META_API_KEY?: unknown; TOWER_RUNTIME?: RuntimeDatabase }
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function liveConfigured(env?: LiveBindings): boolean { try { return typeof env?.META_API_KEY === 'string' && !!env.META_API_KEY.trim() && typeof env?.TOWER_RUNTIME?.prepare === 'function' && typeof env?.TOWER_RUNTIME?.exec === 'function'; } catch { return false; } }
export const DAILY_CALL_LIMIT = 60; // 20 admitted runs, three reserved calls each; no refund/retry loophole.
const schema = `CREATE TABLE IF NOT EXISTS tower_runtime_budget(day TEXT PRIMARY KEY,reserved INTEGER NOT NULL CHECK(reserved BETWEEN 0 AND 60)); CREATE TABLE IF NOT EXISTS tower_runtime_runs(ticket_hash TEXT PRIMARY KEY,origin TEXT NOT NULL,step INTEGER NOT NULL,state TEXT NOT NULL,expires INTEGER NOT NULL,builder TEXT);`;
const reply = (status: number, data: unknown) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
class Stop extends Error { status: number; constructor(status: number, message: string) { super(message); this.status = status; } }
function stop(status: number, message: string): never { throw new Stop(status, message); }
const hash = async (ticket: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ticket)))].map(b => b.toString(16).padStart(2, '0')).join('');
export function createLiveReviewer(options: { transport: typeof fetch; timeoutMs?: number; now?: () => number }) {
  const now = options.now ?? Date.now; const timeout = options.timeoutMs ?? 10000; const initialized = new WeakMap<RuntimeDatabase, Promise<unknown>>(); let inflight = 0;
  if (!Number.isInteger(timeout) || timeout < 100 || timeout > 10000) throw Error('Invalid reviewer deadline.');
  return async (request: Request, env?: LiveBindings): Promise<Response> => {
    if (inflight >= 4) return reply(429, { error: 'Reviewer request limit reached.' }); inflight++;
    const op = new Operation(timeout); let db: RuntimeDatabase | undefined; let ticketHash: string | undefined; let claimed = false; let claimedStep: number | undefined; let callOp: Operation | undefined;
    const abort = () => op.cancel(); request.signal.addEventListener('abort', abort, { once: true });
    try {
      const url = new URL(request.url);
      if (request.method !== 'POST' || request.headers.get('origin') !== url.origin || url.search || request.headers.has('authorization') || request.headers.has('cookie') || request.headers.get('content-type')?.split(';')[0] !== 'application/json') stop(403, 'Reviewer request origin or format rejected.');
      if (!['/api/reviewer/start', '/api/reviewer/cancel', '/api/reviewer/v1/chat/completions'].includes(url.pathname)) stop(404, 'Unknown reviewer route.');
      if (!liveConfigured(env)) stop(503, 'Reviewer runtime is not configured.'); db = env!.TOWER_RUNTIME!;
      if (request.signal.aborted) op.cancel();
      let setup = initialized.get(db); if (!setup) { setup = db.exec(schema); initialized.set(db, setup); setup.catch(() => initialized.delete(db!)); } await op.wait(setup);
      const body = strictJson(await boundedText(request.body, 512, op)); if (!object(body)) stop(400, 'Invalid reviewer request.');
      if (url.pathname === '/api/reviewer/start') {
        if (Object.keys(body).length !== 1 || body.consent !== true) stop(403, 'Explicit consent is required.');
        const day = new Date(now()).toISOString().slice(0, 10);
        await op.wait(db.prepare('INSERT INTO tower_runtime_budget(day,reserved) VALUES(?,0) ON CONFLICT(day) DO NOTHING').bind(day).run());
        const allowance = await op.wait(db.prepare('UPDATE tower_runtime_budget SET reserved=reserved+3 WHERE day=? AND reserved<=57 RETURNING reserved').bind(day).first());
        if (!allowance) stop(429, 'Daily demo capacity reached. No model request was sent.');
        const ticket = [...crypto.getRandomValues(new Uint8Array(24))].map(b => b.toString(16).padStart(2, '0')).join(''); const expires = now() + 60000;
        await op.wait(db.prepare('DELETE FROM tower_runtime_runs WHERE expires<?').bind(now()).run());
        await op.wait(db.prepare('DELETE FROM tower_runtime_budget WHERE day<?').bind(new Date(now() - 2 * 86400000).toISOString().slice(0, 10)).run());
        await op.wait(db.prepare("INSERT INTO tower_runtime_runs(ticket_hash,origin,step,state,expires) VALUES(?,?,0,'ready',?)").bind(await hash(ticket), url.origin, expires).run());
        return reply(200, { ticket, step: 0 });
      }
      if (typeof body.ticket !== 'string' || !/^[a-f0-9]{48}$/.test(body.ticket)) stop(400, 'Invalid run ticket.'); ticketHash = await hash(body.ticket);
      if (url.pathname === '/api/reviewer/cancel') {
        if (Object.keys(body).length !== 1) stop(400, 'Invalid cancellation.');
        await op.wait(db.prepare("UPDATE tower_runtime_runs SET state='cancelled',builder=NULL WHERE ticket_hash=? AND origin=?").bind(ticketHash, url.origin).run());
        return reply(200, { cancelled: true });
      }
      if (Object.keys(body).length !== 2 || !Number.isInteger(body.step) || Number(body.step) < 0 || Number(body.step) > 2) stop(400, 'Only a valid ticket and step are accepted.');
      const step = Number(body.step);
      const row = await op.wait(db.prepare("UPDATE tower_runtime_runs SET state='running',step=step+1 WHERE ticket_hash=? AND origin=? AND state='ready' AND step=? AND expires>? RETURNING builder,expires").bind(ticketHash, url.origin, step, now()).first<{ builder: string | null; expires: number }>());
      if (!row) stop(409, 'Run expired, stopped or step already consumed.'); claimed = true; claimedStep = step + 1;
      if (row.expires - now() < 100) stop(409, 'Run authorization expired.');
      callOp = new Operation(Math.min(timeout, row.expires - now()));
      const send = createMetaSender(env!.META_API_KEY as string, options.transport);
      const payload = turnPayload(step, url.origin, row.builder ?? undefined);
      op.assert();
      const response = await op.wait(callOp.wait(send({ endpoint: META_ENDPOINT, redirect: 'error', signal: AbortSignal.any([op.signal, callOp.signal]), body: payload })));
      if (!response.ok) stop(response.status === 429 ? 429 : 502, 'Model service rejected the request. No retry was sent.');
      const checked = checkedTurn(await op.wait(boundedText(response.body, 32768, callOp)), step, url.origin, row.builder ?? undefined);
      const completion = await op.wait(db.prepare("UPDATE tower_runtime_runs SET state=?,builder=? WHERE ticket_hash=? AND origin=? AND state='running' AND step=? AND expires>?").bind(step === 2 ? 'complete' : 'ready', step === 1 ? checked.content : null, ticketHash, url.origin, step + 1, now()).run());
      if (completion.meta.changes !== 1) stop(409, 'Run stopped before the response was accepted. Remote outcome may be unknown.');
      return reply(200, checked.response);
    } catch (error) {
      if (claimed && db && ticketHash) { const cleanup = new Operation(250); try { await cleanup.wait(db.prepare("UPDATE tower_runtime_runs SET state='error',builder=NULL WHERE ticket_hash=? AND state='running' AND step=?").bind(ticketHash, claimedStep).run()); } catch { /* Consumed running step is never retried, even if storage is unavailable. */ } finally { cleanup.dispose(); } }
      return reply(error instanceof Stop ? error.status : 502, { error: error instanceof Stop ? error.message : 'Generation stopped without a verified result. Remote outcome may be unknown; no retry was sent.' });
    } finally { inflight--; request.signal.removeEventListener('abort', abort); callOp?.dispose(); op.dispose(); }
  };
}
