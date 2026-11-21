// Bounded transport and shared completion decoder; the host controls live availability.
import { checkedUrl, strictJson } from '../../spikes/m2/safety.js';
import type { Completion, ModelAdapter, ModelRequest } from './model.ts';
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const bytes = (value: string) => new TextEncoder().encode(value).length;
export interface KeylessRoute { endpoint: string; model: string; approvedOrigin: string }
export function createKeylessInference(route: KeylessRoute): ModelAdapter {
  if (Object.keys(route).some(key => !['endpoint', 'model', 'approvedOrigin'].includes(key))) throw new Error('Unsupported inference configuration.');
  const endpoint = checkedUrl(route.endpoint);
  if (endpoint.origin !== route.approvedOrigin || endpoint.search || !endpoint.pathname.endsWith('/v1/chat/completions') || !/^[a-zA-Z0-9._:/-]{1,128}$/.test(route.model)) throw new Error('Inference route is not explicitly authorized.');
  const model = route.model; const url = endpoint.href;
  return {
    mode: 'real', mock: false, baseUrl: endpoint.origin,
    async chat({ messages, tools, operation }: ModelRequest): Promise<Completion> {
      operation.assert();
      if (!messages.length || messages.length > 32 || tools.length > 12) throw new Error('Inference request limits exceeded.');
      const body = JSON.stringify({ model, messages, tools, stream: false, max_tokens: 2048 });
      if (bytes(body) > 131072) throw new Error('Inference request is too large.');
      const response = await operation.fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (!response.ok) throw new Error(`Inference service failed (${response.status}).`);
      const doc = strictJson(await operation.read(response.text()));
      const result = decodeCompletion(doc, tools, model);
      operation.assert();
      return result;
    },
  };
}

export function decodeCompletion(doc: unknown, tools: ModelRequest['tools'], model: string): Completion {
  if (!object(doc) || !Array.isArray(doc.choices) || doc.choices.length !== 1 || !object(doc.choices[0])) throw new Error('Unsupported inference response.');
  const choice = doc.choices[0]; const message = choice.message;
  if (!object(message) || message.role !== 'assistant' || message.refusal || !['stop', 'tool_calls'].includes(String(choice.finish_reason))) throw new Error('Inference refused, was truncated or did not finish.');
  if (message.content !== null && typeof message.content !== 'string') throw new Error('Unsupported inference content.');
  const content = typeof message.content === 'string' ? message.content : '';
  if (bytes(content) > 65536) throw new Error('Inference content is too large.');
  const calls = message.tool_calls === undefined ? [] : message.tool_calls;
  if (!Array.isArray(calls) || calls.length > 12) throw new Error('Invalid inference tool calls.');
  const names = new Set(tools.map(tool => tool.function.name)); const ids = new Set<string>();
  const toolCalls: Completion['toolCalls'] = calls.map(call => {
    if (!object(call) || typeof call.id !== 'string' || !/^[\w-]{1,100}$/.test(call.id) || ids.has(call.id) || call.type !== 'function' || !object(call.function) || typeof call.function.name !== 'string' || !names.has(call.function.name) || typeof call.function.arguments !== 'string' || bytes(call.function.arguments) > 65536 || !object(strictJson(call.function.arguments))) throw new Error('Invalid or unauthorized inference tool call.');
    ids.add(call.id);
    return { id: call.id, type: 'function', function: { name: call.function.name, arguments: call.function.arguments } };
  });
  if ((choice.finish_reason === 'tool_calls') !== (toolCalls.length > 0)) throw new Error('Inference completion state does not match its tool calls.');
  let usage: Completion['usage'] = null;
  if (object(doc.usage) && Number.isSafeInteger(doc.usage.prompt_tokens) && Number(doc.usage.prompt_tokens) >= 0 && Number.isSafeInteger(doc.usage.completion_tokens) && Number(doc.usage.completion_tokens) >= 0) usage = { inputTokens: Number(doc.usage.prompt_tokens), outputTokens: Number(doc.usage.completion_tokens) };
  return { content, toolCalls, finishReason: String(choice.finish_reason), model: typeof doc.model === 'string' ? doc.model : model, usage };
}
