// Cloudflare Pages: the public fixed-example gateway requires both server bindings.
import reviewer from '../../../api/reviewer.ts';
import { reviewerReadiness } from '../../../server/reviewer-readiness.ts';
import type { ReviewerBindings } from '../../../server/reviewer-readiness.ts';
import { createLiveReviewer } from '../../../server/live-reviewer.ts';
import { liveConfigured } from '../../../server/live-reviewer.ts';
const liveReviewer = createLiveReviewer({ transport: fetch });
export function onRequest(context: { request: Request; env?: ReviewerBindings }): Response | Promise<Response> {
  if (new URL(context.request.url).pathname === '/api/reviewer/readiness') return reviewerReadiness(context.request, context.env);
  if (liveConfigured(context.env)) return liveReviewer(context.request, context.env);
  return reviewer.fetch();
}
