// Configuration presence only, not credential validity, a provider call or spending authority.
import { META_MODEL } from './meta-policy.ts';
export interface ReviewerBindings { META_API_KEY?: unknown }
export function reviewerReadiness(request: Request, bindings?: ReviewerBindings): Response {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' };
  if (request.method !== 'GET') return Response.json({ error: 'Use GET for configuration status.' }, { status: 405, headers: { ...headers, Allow: 'GET' } });
  let credentialConfigured: boolean | null = null;
  try { credentialConfigured = typeof bindings?.META_API_KEY === 'string' && bindings.META_API_KEY.trim().length > 0; } catch { /* No exception detail or binding value is disclosed. */ }
  return Response.json({ enabled: false, credentialConfigured, connectionVerified: false, model: META_MODEL, trialReady: false }, { headers });
}
