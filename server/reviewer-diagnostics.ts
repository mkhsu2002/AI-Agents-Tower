// Operational metadata only. Never accept request bodies, credentials or provider error text.
import { TurnValidationError } from './turn-rejection.ts';
export type GatewayEvent = 'request-start' | 'provider-start' | 'provider-response' | 'request-end' | 'handler-error' | 'output-rejected';
export function gatewayDiagnostic(request: Request, event: GatewayEvent, status?: number) {
  let ray: string | null = null; let path = '';
  try { ray = request.headers.get('cf-ray'); path = new URL(request.url).pathname; } catch { /* Diagnostics cannot interrupt the safe error response. */ }
  return {
    service: 'tower-reviewer', event,
    route: path === '/api/reviewer/start' ? 'start' : path === '/api/reviewer/cancel' ? 'cancel' : path === '/api/reviewer/v1/chat/completions' ? 'turn' : path === '/api/reviewer/readiness' ? 'readiness' : 'other',
    ...(ray && /^[a-f0-9]{16,32}-[A-Z]{3}$/.test(ray) ? { ray } : {}),
    ...(Number.isInteger(status) && Number(status) >= 100 && Number(status) <= 599 ? { status } : {}),
  };
}
export function logGatewayEvent(request: Request, event: GatewayEvent, status?: number) {
  try { console.info(JSON.stringify(gatewayDiagnostic(request, event, status))); } catch { /* Logging must not change execution or error handling. */ }
}

export function turnFailureDiagnostic(request: Request, error: unknown, step: number) {
  const { service, event, route } = gatewayDiagnostic(request, 'output-rejected');
  // New validation records contain no dynamic identifier, including no Ray value.
  return { service, event, route,
    ...(Number.isInteger(step) && step >= 0 && step <= 2 ? { step } : {}),
    reason: error instanceof TurnValidationError ? error.reason : 'OUTPUT_BODY_OR_PROCESSING_FAILED',
    ...(error instanceof TurnValidationError ? { structure: error.structure } : {}),
  };
}
export function logTurnFailure(request: Request, error: unknown, step: number) {
  try { console.info(JSON.stringify(turnFailureDiagnostic(request, error, step))); } catch { /* Diagnostics cannot alter validation or error handling. */ }
}
