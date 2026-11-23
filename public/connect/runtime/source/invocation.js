// Tower's bounded string-parameter invocation profile. Unsupported schemas fail explicitly.
import { policyError, strictJson } from './safety.js';
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const unsafe = key => ['__proto__', 'prototype', 'constructor'].includes(key);
export function parseInvocation(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 65536) throw policyError('Tool arguments must be bounded JSON text.');
  const value = strictJson(text);
  if (!object(value)) throw policyError('Tool arguments must be a JSON object.');
  return value;
}
export function validateInvocation(schema, value) {
  const reject = () => { throw policyError('Tool arguments do not match the supported invocation schema.'); };
  if (!object(schema) || schema.type !== 'object' || !object(schema.properties) || Object.keys(schema.properties).length > 12 || Object.keys(schema).some(key => !['type', 'properties', 'required', 'additionalProperties', 'description', 'title'].includes(key)) || schema.additionalProperties !== undefined && schema.additionalProperties !== false) reject();
  const required = schema.required ?? [];
  if (!Array.isArray(required) || required.some(key => typeof key !== 'string' || !Object.hasOwn(schema.properties, key)) || new Set(required).size !== required.length) reject();
  for (const [key, field] of Object.entries(schema.properties)) {
    if (unsafe(key) || !object(field) || field.type !== 'string' || Object.keys(field).some(name => !['type', 'description', 'title', 'minLength', 'maxLength', 'enum'].includes(name))) reject();
    for (const name of ['minLength', 'maxLength']) if (field[name] !== undefined && (!Number.isSafeInteger(field[name]) || field[name] < 0 || field[name] > 65536)) reject();
    if ((field.minLength ?? 0) > (field.maxLength ?? 65536)) reject();
    if (field.enum !== undefined && (!Array.isArray(field.enum) || field.enum.length < 1 || field.enum.length > 32 || field.enum.some(v => typeof v !== 'string'))) reject();
  }
  if (!object(value)) reject();
  const encoded = JSON.stringify(value);
  if (!encoded || new TextEncoder().encode(encoded).length > 65536 || required.some(key => !Object.hasOwn(value, key))) reject();
  for (const [key, content] of Object.entries(value)) {
    if (unsafe(key) || !Object.hasOwn(schema.properties, key) || typeof content !== 'string') reject();
    const field = schema.properties[key]; const length = [...content].length;
    if (length < (field.minLength ?? 0) || length > (field.maxLength ?? 65536) || field.enum && !field.enum.includes(content)) reject();
  }
}
export function validateCallBatch(calls) {
  if (!Array.isArray(calls) || calls.length > 12) throw policyError('Tool call batch exceeds the supported limit.');
  const ids = new Set();
  for (const call of calls) {
    if (!object(call) || typeof call.id !== 'string' || !/^[\w-]{1,100}$/.test(call.id) || ids.has(call.id) || !call.entry || typeof call.name !== 'string') throw policyError('Unknown, malformed or duplicate tool call.');
    ids.add(call.id); validateInvocation(call.entry.parameters, call.args);
  }
}
