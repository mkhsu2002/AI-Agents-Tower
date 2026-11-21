// Cloudflare Pages: the public fixed-example gateway requires both server bindings.
import { DEMO_ERRORS } from '../../../src/agents/reviewer-errors.ts';
import reviewer from '../../../api/reviewer.ts';
import { reviewerReadiness } from '../../../server/reviewer-readiness.ts';
import type { ReviewerBindings } from '../../../server/reviewer-readiness.ts';
import { createLiveReviewer } from '../../../server/live-reviewer.ts';
import { liveConfigured } from '../../../server/live-reviewer.ts';
const liveReviewer = createLiveReviewer({ transport: fetch });
export async function onRequest(context: { request: Request; env?: ReviewerBindings }): Promise<Response> {
  try {
  if (new URL(context.request.url).pathname === '/api/reviewer/readiness') return reviewerReadiness(context.request, context.env);
  if (liveConfigured(context.env)) return await liveReviewer(context.request, context.env);
  return reviewer.fetch();
  } catch { return Response.json({ code: 'GATEWAY_UNAVAILABLE', error: DEMO_ERRORS.GATEWAY_UNAVAILABLE }, { status: 502, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }); }
}
