import validate from './homebundle-validator.js';

export const MAX_BYTES = 65_536;
export const MAX_BLOCKS = 12;
export type Theme = 'paper' | 'midnight' | 'sage';
export interface TextBlock { type: 'text'; title: string; text: string }
export interface HomeBundle {
  schemaVersion: '0.1'; displayName: string; introduction: string;
  blocks: TextBlock[]; theme?: Theme;
}
export interface Issue { code: string; path: string; message: string }
export type Result<T> = { ok: true; value: T } | { ok: false; errors: Issue[] };
const size = (text: string) => new TextEncoder().encode(text).length;
const fail = (code: string, message: string): Result<never> => ({ ok: false, errors: [{ code, path: '/', message }] });

// No coercion, default insertion, field removal, trimming or content sanitization.
export function validateBundle(input: unknown): Result<HomeBundle> {
  if (!validate(input)) {
    return { ok: false, errors: (validate.errors ?? []).map(error => ({
      code: error.keyword === 'const' && error.instancePath === '/schemaVersion' ? 'UNSUPPORTED_VERSION' : 'SCHEMA_INVALID',
      path: error.instancePath || '/',
      // Do not echo unknown field names or user content into errors.
      message: error.keyword === 'additionalProperties' ? 'Unknown fields are not allowed.' : `Value ${error.message ?? 'is invalid'}.`,
    })) };
  }
  const canonical = JSON.stringify(input, null, 2) + '\n';
  if (size(canonical) > MAX_BYTES) return fail('TOO_LARGE', 'Canonical JSON must not exceed 65536 UTF-8 bytes.');
  return { ok: true, value: structuredClone(input) };
}

export function parseBundle(text: string): Result<HomeBundle> {
  if (text.length > MAX_BYTES || size(text) > MAX_BYTES) return fail('TOO_LARGE', 'JSON input must not exceed 65536 UTF-8 bytes.');
  let input: unknown;
  try { input = JSON.parse(text); }
  catch { return fail('MALFORMED_JSON', 'Invalid JSON. Check syntax; the draft has not been replaced.'); }
  // JSON.parse silently keeps the last duplicate key. Reject ambiguous input instead.
  // Syntax is already checked, so string tokens followed by ':' are object keys.
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|[{}[\]:,]|[^\s{}[\]:,]+/g) ?? [];
  const scopes: (Set<string> | null)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '{') scopes.push(new Set());
    else if (token === '[') scopes.push(null);
    else if (token === '}' || token === ']') scopes.pop();
    else if (token.startsWith('"') && tokens[i + 1] === ':') {
      const key: string = JSON.parse(token);
      const keys = scopes.at(-1);
      if (keys?.has(key)) return fail('DUPLICATE_KEY', 'Duplicate JSON object keys are not allowed.');
      keys?.add(key);
    }
  }
  return validateBundle(input);
}

export function exportBundle(input: unknown): Result<string> {
  const result = validateBundle(input);
  return result.ok ? { ok: true, value: JSON.stringify(result.value, null, 2) + '\n' } : result;
}
