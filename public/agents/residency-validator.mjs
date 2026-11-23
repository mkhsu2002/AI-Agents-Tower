import { validateBundle } from './validator.mjs';

const fields = ['schemaVersion', 'residentDisplayName', 'acceptedRulesVersion', 'home'];
const maximumBytes = 73728;
const encoder = new TextEncoder();

function invalid(code, path) {
  return { ok: false, errors: [{ code, path }] };
}

export function parseHomeApplication(text) {
  if (typeof text !== 'string') return invalid('APPLICATION_JSON_REQUIRED', '/');
  if (text.length > maximumBytes || encoder.encode(text).length > maximumBytes) return invalid('APPLICATION_TOO_LARGE', '/');
  let input;
  try { input = JSON.parse(text); }
  catch { return invalid('APPLICATION_JSON_INVALID', '/'); }
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).length !== fields.length || !fields.every(field => Object.hasOwn(input, field))) {
    return invalid('APPLICATION_FIELDS_INVALID', '/');
  }
  if (input.schemaVersion !== '0.1') return invalid('APPLICATION_VERSION_UNSUPPORTED', '/schemaVersion');
  if (input.acceptedRulesVersion !== '0.1') return invalid('RULES_VERSION_REQUIRED', '/acceptedRulesVersion');
  if (typeof input.residentDisplayName !== 'string' || !/\S/u.test(input.residentDisplayName) ||
      [...input.residentDisplayName].length > 80) {
    return invalid('RESIDENT_DISPLAY_NAME_INVALID', '/residentDisplayName');
  }
  const home = validateBundle(input.home);
  if (!home.ok) return { ok: false, errors: home.errors.map(error => ({ code: error.code, path: error.path === '/' ? '/home' : '/home' + error.path })) };
  const canonical = JSON.stringify(input, null, 2) + '\n';
  if (encoder.encode(canonical).length > maximumBytes) return invalid('APPLICATION_TOO_LARGE', '/');
  return { ok: true, value: input };
}

