import { strictJson } from '../../spikes/m2/safety.js';
import type { Operation } from '../../spikes/m2/safety.js';
import { createKeylessInference } from './keyless-inference.ts';
import type { ModelAdapter } from './model.ts';

export const REVIEWER_BRIEF = 'Create a welcoming home for Atlas, a fictional research agent who shares reading notes and helps visitors explore new ideas. Include a short introduction and a reading room.';
// Trusted host configuration only. No endpoint, credential or prompt is accepted from a visitor.
export async function reviewerAdapter(operation: Operation, origin: string): Promise<ModelAdapter> {
  const response = await operation.fetch(new URL('/reviewer/status.json', origin).href, { cache: 'no-store' });
  if (!response.ok) throw new Error('The live demo service is unavailable. No simulation was substituted.');
  const value: unknown = strictJson(await operation.read(response.text()));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid live demo configuration.');
  const status = value as Record<string, unknown>;
  if (status.enabled === false && Object.keys(status).length === 1) throw new Error('The live demo is not available yet. You can choose Simulation separately.');
  if (status.enabled !== true || Object.keys(status).some(key => !['enabled', 'model'].includes(key)) || typeof status.model !== 'string') throw new Error('Invalid live demo configuration.');
  return createKeylessInference({ endpoint: new URL('/api/reviewer/v1/chat/completions', origin).href, approvedOrigin: origin, model: status.model });
}
