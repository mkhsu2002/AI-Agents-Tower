// Offline preparation only. Imported by tests/offline modules, never a public route or UI.
import { strictJson } from '../../spikes/m2/safety.js';
import { META_ENDPOINT, META_MODEL } from '../meta-policy.ts';
export const OFFLINE_POLICY = Object.freeze({
  mode: 'scripted-offline', endpoint: META_ENDPOINT, model: META_MODEL,
  origin: 'https://1st-tower.neobabylon.app', network: 'https://1st-tower.neobabylon.app/agents/tower-home-builder',
  action: 'https://1st-tower.neobabylon.app/agents/tower-home-builder#validate_home_bundle',
  tools: Object.freeze(['home_builder', 'validate_home_bundle']),
  calls: 3, dailyReservedCalls: 60, inputTokens: 8192,
  outputTokens: Object.freeze([256, 1024, 1024]), requestBytes: 8192, responseBytes: 32768,
  callTimeoutMs: 10000, runTimeoutMs: 30000, lifetimeMs: 60000,
} as const);
export type BriefCode = 'INPUT_INVALID' | 'INPUT_TOO_LARGE' | 'DESTINATION_DENIED' | 'CONSENT_REQUIRED' | 'STALE_PREVIEW' | 'EXPIRED' | 'BUSY' | 'DAILY_LIMIT' | 'PAYLOAD_TOO_LARGE' | 'PROVIDER_FAILED' | 'OUTPUT_REJECTED' | 'CANCELLED' | 'TIMEOUT' | 'NO_PROPOSAL' | 'REVISION_CONFLICT';
export class BriefError extends Error {
  readonly code: BriefCode;
  constructor(code: BriefCode) { super('Offline brief preparation stopped: ' + code + '.'); this.code = code; }
}
export const fail = (code: BriefCode): never => { throw new BriefError(code); };
export const bytes = (text: string) => new TextEncoder().encode(text).length;
export const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export interface BriefInput { version: '0.1'; brief: string }
function wellFormed(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    if (unit >= 0xd800 && unit <= 0xdbff) { const next = text.charCodeAt(++i); if (!(next >= 0xdc00 && next <= 0xdfff)) return false; }
    else if (unit >= 0xdc00 && unit <= 0xdfff) return false;
  }
  return true;
}
export function parseBrief(raw: unknown): Readonly<BriefInput> {
  if (typeof raw !== 'string') return fail('INPUT_INVALID');
  if (raw.length > 8192 || bytes(raw) > 8192) return fail('INPUT_TOO_LARGE');
  let value: unknown; try { value = strictJson(raw); } catch { return fail('INPUT_INVALID'); }
  if (!object(value) || Object.keys(value).length !== 2 || !Object.hasOwn(value, 'version') || !Object.hasOwn(value, 'brief') || value.version !== '0.1' || typeof value.brief !== 'string' || !value.brief.trim() || !wellFormed(value.brief)) return fail('INPUT_INVALID');
  if ([...value.brief].length > 1500 || bytes(value.brief) > 6000) return fail('INPUT_TOO_LARGE');
  return Object.freeze({ version: '0.1', brief: value.brief });
}
// Local test coordination, not durable/shared production quota authority. Never refunds uncertain calls.
export class OfflineAdmission {
  #day = ''; #days = new Map<string, number>();
  reserve(now: number) {
    if (!Number.isFinite(now) || now < 0 || now > 8.64e15 - OFFLINE_POLICY.lifetimeMs) fail('INPUT_INVALID');
    const day = new Date(now).toISOString().slice(0, 10);
    this.#day = day; const reserved = this.#days.get(day) ?? 0;
    if (reserved + OFFLINE_POLICY.calls > OFFLINE_POLICY.dailyReservedCalls) fail('DAILY_LIMIT');
    this.#days.set(day, reserved + OFFLINE_POLICY.calls);
  }
  get reserved() { return this.#days.get(this.#day) ?? 0; }
}
