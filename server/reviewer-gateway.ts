// Offline preparation only. No fetch default, environment access, credential or production activation.
import { randomBytes } from 'node:crypto';
import { Operation, strictJson } from '../spikes/m2/safety.js';
import { parseAgentResponse } from '../spikes/m2/vendor/runtime/cruse.js';
import { parseBundle } from '../src/domain/homebundle.ts';
import { REVIEWER_BRIEF } from '../src/agents/reviewer-contract.ts';
import schema from '../public/schema/homebundle-v0.1.schema.json' with { type: 'json' };
import { META_ENDPOINT, META_MODEL } from './meta-policy.ts';
export { META_ENDPOINT, META_MODEL } from './meta-policy.ts';
export const LIMITS = Object.freeze({ starts: 3, calls: 9, sessions: 2, requests: 4, bodyBytes: 512, outputBytes: 32768, inputTokens: 8192, lifetimeMs: 60000 });
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const size = (v: string) => new TextEncoder().encode(v).length;
export interface FreeRunReservation { project: 'ai-agents-tower'; syntheticOnly: true; calls: 3; expiresAt: number; overageDisabled: true }
export interface ProviderRequest { endpoint: typeof META_ENDPOINT; body: Record<string, unknown>; signal: AbortSignal; redirect: 'error' }
export interface OfflineProvider {
  // Trusted server-side atomic reservation. A boolean from the client is never evidence of quota.
  reserveFreeRun(limits: { calls: 3; inputTokensPerCall: 8192; outputTokens: 2304 }): Promise<FreeRunReservation | null>;
  send(request: ProviderRequest): Promise<Response>;
}
interface Session { timer?: ReturnType<typeof setTimeout>; step: number; expires: number; busy: boolean; operation?: Operation; builder?: string }
class Rejected extends Error { status: number; constructor(status: number, message: string) { super(message); this.status = status; } }
const reply = (status: number, body: unknown) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
function reject(status: number, message: string): never { throw new Rejected(status, message); }
function proposal(content: string, action: string): string {
  const parsed = parseAgentResponse(content);
  const components = parsed.presentation?.components;
  const c = components?.[0];
  if (!parseBundle(parsed.text).ok || components?.length !== 1 || !object(c) || c.kind !== 'action' || c.action !== action || !object(c.arguments) || Object.keys(c.arguments).length !== 1 || c.arguments.bundleJson !== parsed.text) reject(502, 'Model output failed draft validation.');
  return parsed.text;
}
export function createOfflineReviewerGateway(options: { origin: string; provider?: OfflineProvider; timeoutMs?: number; now?: () => number }) {
  const url = new URL(options.origin);
  if (url.origin !== options.origin || url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('Offline reviewer gateway requires a loopback origin.');
  const timeout = options.timeoutMs ?? 10000;
  if (!Number.isInteger(timeout) || timeout < 100 || timeout > 10000) throw new Error('Invalid gateway timeout.');
  const now = options.now ?? Date.now; const sessions = new Map<string, Session>(); let starts = 0; let calls = 0; let pendingStarts = 0; let inflight = 0;
  const action = options.origin + '/agents/tower-home-builder#validate_home_bundle';
  function drop(ticket: string) { const session = sessions.get(ticket); if (session?.timer) clearTimeout(session.timer); session?.operation?.cancel(); sessions.delete(ticket); }
  function prune() { for (const [ticket, s] of sessions) if (s.expires <= now()) drop(ticket); }
  return {
    dispose() { for (const ticket of sessions.keys()) drop(ticket); },
    async handle(request: Request): Promise<Response> {
      if (inflight >= LIMITS.requests) return reply(429, { error: 'Reviewer request concurrency limit reached.' });
      inflight++;
      let detachAbort = () => {};
      let operation: Operation | undefined; let ticket: string | undefined; let session: Session | undefined;
      try {
        prune(); const target = new URL(request.url);
        if (target.origin !== options.origin || target.search || request.headers.get('origin') !== options.origin || request.headers.has('authorization') || request.headers.has('cookie')) reject(403, 'Reviewer origin or credentials rejected.');
        if (request.method !== 'POST' || request.headers.get('content-type')?.split(';')[0] !== 'application/json') reject(415, 'Use a JSON POST request.');
        if (!['/api/reviewer/start', '/api/reviewer/cancel', '/api/reviewer/v1/chat/completions'].includes(target.pathname)) reject(404, 'Unknown reviewer route.');
        if (!options.provider) reject(503, 'Reviewer provider is not configured.');
        operation = new Operation(timeout);
        const abort = () => operation?.cancel(); request.signal.addEventListener('abort', abort, { once: true }); detachAbort = () => request.signal.removeEventListener('abort', abort);
        if (request.signal.aborted) operation.cancel();
        // Cancel also covers body reads; never buffer an arbitrary request before applying a cap.
        const reader = request.body?.getReader(); let raw = '';
        if (!reader) reject(400, 'Missing request body.');
        const decoder = new TextDecoder('utf-8', { fatal: true }); let length = 0;
        try { for (;;) { const part = await operation.wait(reader.read()); if (part.done) break; length += part.value.length; if (length > LIMITS.bodyBytes) { void reader.cancel(); reject(413, 'Reviewer request is too large.'); } raw += decoder.decode(part.value, { stream: true }); } raw += decoder.decode(); }
        finally { void reader.cancel().catch(() => {}); reader.releaseLock(); }
        let body: unknown; try { body = strictJson(raw); } catch { reject(400, 'Invalid reviewer request.'); }
        if (!object(body)) reject(400, 'Invalid reviewer request.');
        const provider = options.provider!;
        if (target.pathname === '/api/reviewer/start') {
          if (Object.keys(body).length !== 1 || body.consent !== true) reject(403, 'Explicit demo consent is required.');
          if (starts >= LIMITS.starts || sessions.size + pendingStarts >= LIMITS.sessions) reject(429, 'Reviewer run limit reached.');
          starts++; // Failed starts consume the local budget too; no retry loophole.
          pendingStarts++;
          let grant; try { grant = await operation.wait(provider.reserveFreeRun({ calls: 3, inputTokensPerCall: 8192, outputTokens: 2304 })); } finally { pendingStarts--; }
          if (!grant || grant.project !== 'ai-agents-tower' || grant.syntheticOnly !== true || grant.calls !== 3 || grant.overageDisabled !== true || !Number.isFinite(grant.expiresAt) || grant.expiresAt <= now()) reject(503, 'Tower-only free quota and overage protection are not confirmed.');
          ticket = randomBytes(24).toString('hex');
          const expires = Math.min(now() + LIMITS.lifetimeMs, grant.expiresAt);
          const runTicket = ticket; const timer = setTimeout(() => drop(runTicket), expires - now()); timer.unref();
          sessions.set(ticket, { step: 0, busy: false, expires, timer });
          return reply(200, { ticket, step: 0 });
        }
        if (typeof body.ticket !== 'string' || !/^[a-f0-9]{48}$/.test(body.ticket)) reject(400, 'Invalid run ticket.');
        ticket = body.ticket;
        if (target.pathname === '/api/reviewer/cancel') {
          if (Object.keys(body).length !== 1) reject(400, 'Invalid cancellation request.');
          drop(ticket); return reply(200, { cancelled: true });
        }
        if (Object.keys(body).length !== 2 || !Number.isInteger(body.step)) reject(400, 'Only the run ticket and step are accepted.');
        session = sessions.get(ticket);
        if (!session || session.expires <= now()) reject(409, 'The demo run expired or stopped. Start again with permission.');
        if (session.busy || session.step !== body.step || session.step >= 3) reject(409, 'Duplicate or out-of-order demo step.');
        if (calls >= LIMITS.calls) { drop(ticket); reject(429, 'Reviewer call limit reached.'); }
        const remaining = session.expires - now(); if (remaining < 100) reject(409, 'The demo authorization is expiring.');
        operation.dispose(); operation = new Operation(Math.min(timeout, remaining)); if (request.signal.aborted) operation.cancel();
        session.busy = true; session.operation = operation; const step = session.step++; calls++;
        const maxTokens = step === 0 ? 256 : 1024;
        const handoff = { type: 'function', name: 'home_builder', description: 'Build the fixed synthetic Atlas draft.', parameters: { type: 'object', properties: { request: { type: 'string', const: REVIEWER_BRIEF } }, required: ['request'], additionalProperties: false }, strict: true };
        const instructions = step === 0 ? 'You are Reception. Call home_builder exactly once with the supplied request unchanged. Do not return prose.' : step === 1 ? `You are Home builder. Return only a HomeBundle JSON followed by a cruse-ui fenced presentation containing one action: ${action}, id validate-draft, arguments {bundleJson: the exact JSON text}. Do not invent validation receipts, publish, use tools or include authority fields. Schema: ${JSON.stringify(schema)}` : 'You are Reception. Return the supplied Home builder output exactly, including its validation action. Do not claim validation, publication or persistence.';
        const payload = { model: META_MODEL, store: false, max_output_tokens: maxTokens, reasoning: { effort: 'minimal' }, instructions, input: step === 2 ? session.builder! : REVIEWER_BRIEF, ...(step === 0 ? { tools: [handoff], tool_choice: { type: 'function', name: 'home_builder' } } : { tools: [], tool_choice: 'none' }) };
        if (size(JSON.stringify(payload)) > 8192) reject(500, 'Trusted request exceeded its limit.');
        const response = await operation.wait(provider.send({ endpoint: META_ENDPOINT, body: payload, signal: operation.signal, redirect: 'error' }));
        if (response.status >= 300 && response.status < 400 || response.redirected) reject(502, 'Provider redirect rejected.');
        if (!response.ok) reject(response.status === 429 ? 429 : 502, response.status === 429 ? 'Model quota exhausted. No retry was sent.' : 'Model service rejected the request.');
        // The port must return a streaming Response; cap bytes while reading, including stalled bodies.
        const stream = response.body?.getReader(); if (!stream) reject(502, 'Empty model response.');
        let output = ''; let total = 0; const decode = new TextDecoder('utf-8', { fatal: true });
        try { for (;;) { const part = await operation.wait(stream.read()); if (part.done) break; total += part.value.length; if (total > LIMITS.outputBytes) { void stream.cancel(); reject(502, 'Model response is too large.'); } output += decode.decode(part.value, { stream: true }); } output += decode.decode(); } finally { void stream.cancel().catch(() => {}); stream.releaseLock(); }
        const data = strictJson(output);
        if (!object(data) || data.model !== META_MODEL || data.status !== 'completed' || data.error || !Array.isArray(data.output) || !object(data.usage) || !Number.isSafeInteger(data.usage.input_tokens) || Number(data.usage.input_tokens) < 0 || Number(data.usage.input_tokens) > LIMITS.inputTokens || !Number.isSafeInteger(data.usage.output_tokens) || Number(data.usage.output_tokens) < 0 || Number(data.usage.output_tokens) > maxTokens) reject(502, 'Model completion, usage or identity was not accepted.');
        const items = data.output.filter(item => !object(item) || item.type !== 'reasoning');
        let message: Record<string, unknown>; let finish: string;
        if (step === 0) {
          const call = items[0];
          if (items.length !== 1 || !object(call) || call.type !== 'function_call' || call.name !== 'home_builder' || typeof call.call_id !== 'string' || !/^[\w-]{1,100}$/.test(call.call_id) || typeof call.arguments !== 'string') reject(502, 'Reception did not make the required handoff.');
          const args = strictJson(call.arguments);
          if (!object(args) || Object.keys(args).length !== 1 || args.request !== REVIEWER_BRIEF) reject(502, 'Reception changed the fixed request.');
          message = { role: 'assistant', content: '', tool_calls: [{ id: call.call_id, type: 'function', function: { name: 'home_builder', arguments: call.arguments } }] }; finish = 'tool_calls';
        } else {
          const item = items[0];
          if (items.length !== 1 || !object(item) || item.type !== 'message' || item.role !== 'assistant' || !Array.isArray(item.content) || item.content.length !== 1 || !object(item.content[0]) || item.content[0].type !== 'output_text' || typeof item.content[0].text !== 'string') reject(502, 'Model refused or returned unsupported content.');
          const content = item.content[0].text; proposal(content, action);
          if (step === 2 && content !== session.builder) reject(502, 'Reception changed the reviewed builder result.');
          if (step === 1) session.builder = content;
          message = { role: 'assistant', content }; finish = 'stop';
        }
        operation.assert(); if (session.expires <= now() || sessions.get(ticket) !== session) reject(409, 'The demo run expired or stopped.');
        session.busy = false; session.operation = undefined;
        if (step === 2) drop(ticket);
        return reply(200, { model: META_MODEL, choices: [{ message, finish_reason: finish }], step: step + 1 });
      } catch (error) {
        if (ticket && session) drop(ticket);
        return reply(error instanceof Rejected ? error.status : 502, { error: error instanceof Rejected ? error.message : 'Demo stopped. The remote outcome may be unknown; no retry was sent.' });
      } finally { inflight--; detachAbort(); operation?.dispose(); }
    },
  };
}
