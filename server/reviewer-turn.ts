import { META_MODEL } from './meta-policy.ts';
import { strictJson } from '../spikes/m2/safety.js';
import { parseAgentResponse } from '../spikes/m2/vendor/runtime/cruse.js';
import { parseBundle } from '../src/domain/homebundle.ts';
import { REVIEWER_BRIEF } from '../src/agents/reviewer-contract.ts';
import { homeBundleSchema as schema } from '../src/domain/homebundle-validator.js';
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function turnPayload(step: number, origin: string, builder?: string): Record<string, unknown> {
  const action = origin + '/agents/tower-home-builder#validate_home_bundle';
  const presentation = JSON.stringify({ components: [{ id: 'validate-draft', kind: 'action', action, arguments: { bundleJson: 'EXACT_PRECEDING_JSON_TEXT' } }] });
  const instructions = step === 0 ? 'You are Reception. Call home_builder exactly once with the supplied request unchanged. Do not return prose.' : step === 1 ? `You are Home builder. Return a compact HomeBundle JSON on one line without a Markdown fence, with one short text block. Follow it with a newline and a cruse-ui fenced JSON block shaped exactly as ${presentation}. Replace EXACT_PRECEDING_JSON_TEXT with the properly JSON-escaped identical preceding HomeBundle text. Include kind: action and the components array. Return no other prose. Do not invent receipts or publish. Schema: ${JSON.stringify(schema)}` : 'You are Reception. Return the supplied Home builder output exactly, including its validation action. Do not claim validation, publication or persistence.';
  return { model: META_MODEL, store: false, max_output_tokens: step === 0 ? 256 : 1024, reasoning: { effort: 'minimal' }, instructions, input: step === 2 ? builder : REVIEWER_BRIEF, ...(step === 0 ? { tools: [{ type: 'function', name: 'home_builder', description: 'Build the fixed synthetic Atlas draft.', strict: true, parameters: { type: 'object', properties: { request: { type: 'string', const: REVIEWER_BRIEF } }, required: ['request'], additionalProperties: false } }], tool_choice: 'auto', parallel_tool_calls: false } : { tools: [], tool_choice: 'auto' }) };
}
export function checkedTurn(raw: string, step: number, origin: string, builder?: string) {
  const data = strictJson(raw);
  if (!object(data) || data.model !== META_MODEL || data.status !== 'completed' || data.error || !Array.isArray(data.output) || !object(data.usage) || !Number.isSafeInteger(data.usage.input_tokens) || Number(data.usage.input_tokens) < 0 || Number(data.usage.input_tokens) > 8192 || !Number.isSafeInteger(data.usage.output_tokens) || Number(data.usage.output_tokens) < 0 || Number(data.usage.output_tokens) > (step === 0 ? 256 : 1024)) throw Error('Model completion or usage was not accepted.');
  const items = data.output.filter(item => !object(item) || item.type !== 'reasoning'); const item = items[0];
  let message: Record<string, unknown>; let content = '';
  if (step === 0) {
    if (items.length !== 1 || !object(item) || item.type !== 'function_call' || item.name !== 'home_builder' || typeof item.call_id !== 'string' || !/^[\w-]{1,100}$/.test(item.call_id) || typeof item.arguments !== 'string') throw Error('Required handoff missing.');
    const args = strictJson(item.arguments); if (!object(args) || Object.keys(args).length !== 1 || args.request !== REVIEWER_BRIEF) throw Error('Fixed request changed.');
    message = { role: 'assistant', content, tool_calls: [{ id: item.call_id, type: 'function', function: { name: 'home_builder', arguments: item.arguments } }] };
  } else {
    if (items.length !== 1 || !object(item) || item.type !== 'message' || item.role !== 'assistant' || !Array.isArray(item.content) || item.content.length !== 1 || !object(item.content[0]) || item.content[0].type !== 'output_text' || typeof item.content[0].text !== 'string') throw Error('Model refused or returned unsupported content.');
    content = item.content[0].text; const parsed = parseAgentResponse(content); const components = parsed.presentation?.components; const c = components?.[0];
    if (!parseBundle(parsed.text).ok || components?.length !== 1 || !object(c) || c.kind !== 'action' || c.action !== origin + '/agents/tower-home-builder#validate_home_bundle' || !object(c.arguments) || Object.keys(c.arguments).length !== 1 || c.arguments.bundleJson !== parsed.text || step === 2 && content !== builder) throw Error('Draft or validation action did not match.');
    message = { role: 'assistant', content };
  }
  return { content, response: { model: META_MODEL, usage: { prompt_tokens: data.usage.input_tokens, completion_tokens: data.usage.output_tokens }, choices: [{ message, finish_reason: step === 0 ? 'tool_calls' : 'stop' }], step: step + 1 } };
}
