import { handleHomeBuild } from '../../../server/home-build/handler.mjs';

export function onRequest(context: { request: Request; env?: Record<string, unknown> }) {
  return handleHomeBuild(context.request, context.env);
}
