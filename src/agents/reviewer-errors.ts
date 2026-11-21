// Public, allowlisted messages only. Never display provider error bodies or arbitrary server text.
export const DEMO_ERRORS = {
  REQUEST_REJECTED: 'The demo request was rejected. Start again from the demo entry.',
  CONSENT_REQUIRED: 'Approve the displayed permissions before starting the demo.',
  NOT_CONFIGURED: 'The live demo is not configured yet.',
  DAILY_LIMIT: 'Today’s demo capacity is used. Try again after midnight UTC.',
  BUSY: 'The demo is busy. No new model request was started.',
  RUN_STOPPED: 'This run expired or stopped. Start a new run when ready.',
  PROVIDER_LIMIT: 'The model service reached its usage limit. This run has stopped.',
  PROVIDER_UNAVAILABLE: 'The model service could not complete this run.',
  OUTPUT_REJECTED: 'The generated result failed validation. Your draft was kept.',
  STORAGE_UNAVAILABLE: 'The demo coordination service is unavailable. This run has stopped.',
  TIMEOUT: 'The demo timed out. Remote work may still finish; this run will not retry.',
  CANCELLED: 'The demo was cancelled. Remote work may still finish.',
} as const;
export type DemoErrorCode = keyof typeof DEMO_ERRORS;
export function demoErrorMessage(code: unknown): string | undefined {
  return typeof code === 'string' && Object.hasOwn(DEMO_ERRORS, code) ? DEMO_ERRORS[code as DemoErrorCode] : undefined;
}
