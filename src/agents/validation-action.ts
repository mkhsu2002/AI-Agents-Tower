import { parseBundle } from '../domain/homebundle.ts';
import type { HomeBundle } from '../domain/homebundle.ts';
import type { Operation } from '../../spikes/m2/safety.js';

export const validationDefinition = {
  name: 'validate_home_bundle', description: 'Validate HomeBundle text in this browser. Read-only; no storage or publication.',
  effect: 'read', availability: 'local-only', timeoutMs: 10000,
  inputSchema: { type: 'object', properties: { bundleJson: { type: 'string', maxLength: 65536 } }, required: ['bundleJson'], additionalProperties: false },
  outputSchema: { type: 'object', properties: { valid: { type: 'boolean' } }, required: ['valid'], additionalProperties: false },
};
export interface ValidationExecution { raw: string; bundle?: HomeBundle }
export async function executeValidation(args: Record<string, unknown>, operation: Operation, scenario: string, record: (execution: ValidationExecution) => void): Promise<{ valid: boolean }> {
  operation.assert();
  if (Object.keys(args).length !== 1 || typeof args.bundleJson !== 'string') throw new Error('Invalid validation arguments.');
  if (scenario === 'action-error') throw new Error('Validation tool failed.');
  if (scenario === 'slow-validation') await operation.wait(new Promise<never>(() => {}));
  const parsed = parseBundle(args.bundleJson);
  operation.assert(); record({ raw: args.bundleJson, ...(parsed.ok ? { bundle: parsed.value } : {}) });
  return { valid: parsed.ok };
}
export function actionPresentation(action: string, raw: string, scenario: string): string {
  if (scenario === 'missing-action') return '';
  const args = scenario === 'invalid-action-args' ? { bundleJson: raw, unknown: true } : { bundleJson: scenario === 'substituted-action' ? '{}' : raw };
  return '\n```cruse-ui\n' + JSON.stringify({ version: 1, components: [{ kind: 'action', id: 'validate-draft', action, label: 'Validate draft', arguments: args }] }) + '\n```';
}
