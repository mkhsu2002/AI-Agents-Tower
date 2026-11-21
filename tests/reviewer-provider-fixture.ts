// Scripted Meta Responses protocol fixture; no network, key, credit balance or inference.
import { META_MODEL } from '../server/reviewer-gateway.ts';
import type { RunBudgetReservation, OfflineProvider, ProviderRequest } from '../server/reviewer-gateway.ts';
import { REVIEWER_BRIEF } from '../src/agents/reviewer-contract.ts';
import { actionPresentation } from '../src/agents/validation-action.ts';
export function fixtureProvider(origin: string, failure?: number | 'invalid' | 'refused' | 'wrong-model' | 'redirect' | 'huge') {
  const calls: ProviderRequest[] = [];
  let reservation: RunBudgetReservation | null = { project: 'ai-agents-tower', syntheticOnly: true, calls: 3, expiresAt: Date.now() + 60000, inputTokensPerCall: 8192, outputTokens: 2304 };
  const provider: OfflineProvider = {
    async reserveRunBudget() { return reservation; },
    async send(request) {
      calls.push(request);
      if (typeof failure === 'number') return new Response('Private upstream details', { status: failure });
      if (failure === 'redirect') return new Response(null, { status: 302, headers: { Location: 'https://unapproved.invalid' } });
      if (failure === 'huge') return new Response('x'.repeat(32769));
      let output: unknown[];
      const instructions = String(request.body.instructions);
      if (instructions.includes('Call home_builder')) output = [{ type: 'function_call', name: 'home_builder', call_id: 'scripted_handoff', arguments: JSON.stringify({ request: REVIEWER_BRIEF }) }];
      else {
        const raw = JSON.stringify({ schemaVersion: failure === 'invalid' ? 'wrong' : '0.1', displayName: 'Atlas synthetic demo', introduction: REVIEWER_BRIEF, blocks: [] });
        const content = instructions.includes('You are Home builder') ? raw + actionPresentation(origin + '/agents/tower-home-builder#validate_home_bundle', raw, 'success') : request.body.input;
        output = [{ type: 'message', role: 'assistant', content: failure === 'refused' ? [{ type: 'refusal', refusal: 'Synthetic refusal' }] : [{ type: 'output_text', text: content }] }];
      }
      return Response.json({ id: 'SCRIPTED-NOT-INFERENCE', model: failure === 'wrong-model' ? 'unapproved-model' : META_MODEL, status: 'completed', output, usage: { input_tokens: 120, output_tokens: 150 } });
    },
  };
  return { calls, provider, setReservation(value: RunBudgetReservation | null) { reservation = value; } };
}
