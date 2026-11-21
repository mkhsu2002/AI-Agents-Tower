// Cloudflare Pages: configuration presence is observable, inference remains hard disabled.
import reviewer from '../../../api/reviewer.ts';
import { reviewerReadiness } from '../../../server/reviewer-readiness.ts';
import type { ReviewerBindings } from '../../../server/reviewer-readiness.ts';
export function onRequest(context: { request: Request; env?: ReviewerBindings }): Response {
  if (new URL(context.request.url).pathname === '/api/reviewer/readiness') return reviewerReadiness(context.request, context.env);
  return reviewer.fetch();
}
