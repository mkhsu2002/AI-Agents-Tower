import { liveConfigured } from '../../server/live-reviewer.ts';
import type { LiveBindings } from '../../server/live-reviewer.ts';
import { REVIEWER_PROTOCOL } from '../../src/agents/reviewer-contract.ts';
export function onRequest(context: { env?: LiveBindings }): Response {
  return Response.json(liveConfigured(context.env) ? { enabled: true, protocol: REVIEWER_PROTOCOL } : { enabled: false }, { headers: { 'Cache-Control': 'no-store' } });
}
