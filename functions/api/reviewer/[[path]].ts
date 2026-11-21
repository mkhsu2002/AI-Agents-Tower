// Cloudflare Pages: the public fixed-example gateway requires both server bindings.
import { logGatewayEvent } from '../../../server/reviewer-diagnostics.ts';
import { DEMO_ERRORS } from '../../../src/agents/reviewer-errors.ts';
import reviewer from '../../../api/reviewer.ts';
import { reviewerReadiness } from '../../../server/reviewer-readiness.ts';
import type { ReviewerBindings } from '../../../server/reviewer-readiness.ts';
import { createLiveReviewer } from '../../../server/live-reviewer.ts';
import { liveConfigured } from '../../../server/live-reviewer.ts';
const liveReviewer = createLiveReviewer({ transport: fetch });
export async function onRequest(context: { request: Request; env?: ReviewerBindings }): Promise<Response> {
  logGatewayEvent(context.request, 'request-start');
  let response: Response;
  try {
    if (new URL(context.request.url).pathname === '/api/reviewer/readiness') response = reviewerReadiness(context.request, context.env);
    else if (liveConfigured(context.env)) response = await liveReviewer(context.request, context.env);
    else response = reviewer.fetch();
  } catch {
    logGatewayEvent(context.request, 'handler-error');
    response = Response.json({ code: 'GATEWAY_UNAVAILABLE', error: DEMO_ERRORS.GATEWAY_UNAVAILABLE }, { status: 502, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  }
  // Distinguishes application responses from platform-generated errors. Not an authority token.
  const headers = new Headers(response.headers); headers.set('X-Tower-Gateway', 'tower-synthetic-v1');
  logGatewayEvent(context.request, 'request-end', response.status);
  return new Response(response.body, { status: response.status, headers });
}
