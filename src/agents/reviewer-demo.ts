import { strictJson } from '../../spikes/m2/safety.js';
import type { Operation } from '../../spikes/m2/safety.js';
import { decodeCompletion } from './keyless-inference.ts';
import type { ModelAdapter } from './model.ts';
import { REVIEWER_BRIEF, REVIEWER_PROTOCOL } from './reviewer-contract.ts';
export { REVIEWER_BRIEF } from './reviewer-contract.ts';
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
// Host-only route: visitors supply neither provider parameters nor credentials.
export async function reviewerAdapter(operation: Operation, origin: string): Promise<ModelAdapter> {
  const response = await operation.fetch(new URL('/reviewer/status.json', origin).href, { cache: 'no-store' });
  if (!response.ok) throw new Error('The live demo service is unavailable. No simulation was substituted.');
  const status: unknown = strictJson(await operation.read(response.text()));
  if (!object(status)) throw new Error('Invalid live demo configuration.');
  if (status.enabled === false && Object.keys(status).length === 1) throw new Error('The live demo is not available yet. You can choose Simulation separately.');
  if (status.enabled !== true || Object.keys(status).length !== 2 || status.protocol !== REVIEWER_PROTOCOL) throw new Error('Invalid live demo configuration.');
  const start = await operation.fetch(new URL('/api/reviewer/start', origin).href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consent: true }) });
  if (!start.ok) throw new Error(`Demo could not start (${start.status}). No simulation was substituted.`);
  const grant: unknown = strictJson(await operation.read(start.text()));
  if (!object(grant) || Object.keys(grant).length !== 2 || typeof grant.ticket !== 'string' || !/^[a-f0-9]{48}$/.test(grant.ticket) || grant.step !== 0) throw new Error('Invalid demo run authority.');
  const ticket = grant.ticket; let step = 0; let active = false; let stopped = false;
  const cancel = () => {
    if (stopped) return; stopped = true;
    // Best effort remote cancellation, bounded independently after the turn signal aborts.
    void fetch(new URL('/api/reviewer/cancel', origin).href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket }), credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(1000) }).catch(() => {});
  };
  const usageTotals = { calls: 0, inputTokens: 0, outputTokens: 0 };
  return {
    get usageTotals() { return { ...usageTotals }; },
    mode: 'real', mock: false, baseUrl: origin,
    async chat({ messages, tools, operation: turn }) {
      turn.assert();
      const reception = tools.some(tool => tool.function.name === 'home_builder');
      if (stopped || active || step > 2 || reception !== (step !== 1) || messages.find(message => message.role === 'user')?.content !== REVIEWER_BRIEF) { cancel(); throw new Error('The demo role sequence or fixed input changed.'); }
      active = true; turn.signal.addEventListener('abort', cancel, { once: true });
      try {
        const response = await turn.fetch(new URL('/api/reviewer/v1/chat/completions', origin).href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket, step }) });
        if (!response.ok) throw new Error(`Demo service failed (${response.status}). No retry or simulation was sent.`);
        const data: unknown = strictJson(await turn.read(response.text()));
        if (!object(data) || data.step !== step + 1) throw new Error('Invalid demo response sequence.');
        const result = decodeCompletion(data, tools, 'muse-spark-1.3');
        turn.assert(); if (result.usage) { usageTotals.calls++; usageTotals.inputTokens += result.usage.inputTokens; usageTotals.outputTokens += result.usage.outputTokens; } step++; if (step === 3) stopped = true;
        return result;
      } catch (error) { cancel(); throw error; }
      finally { active = false; turn.signal.removeEventListener('abort', cancel); }
    },
  };
}
