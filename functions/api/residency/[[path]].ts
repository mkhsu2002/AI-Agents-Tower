import { handleResidency } from '../../../server/residency/handler.mjs';

export function onRequest(context: { request: Request; env?: Record<string, unknown> }) {
  return handleResidency(context.request, context.env);
}
