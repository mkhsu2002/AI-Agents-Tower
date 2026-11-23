// Data canonicalization only; no service, model or publisher-specific branch.
export function canonical(value) { return JSON.stringify(sort(value)); }
function sort(v) { return Array.isArray(v) ? v.map(sort) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k,sort(v[k])])) : v; }
