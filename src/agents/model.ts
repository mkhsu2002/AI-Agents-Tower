import type { Operation } from '../../spikes/m2/safety.js';
export interface Message { role: string; content?: string | null; name?: string }
export interface Completion { content: string; toolCalls: { id: string; type: 'function'; function: { name: string; arguments: string } }[]; finishReason: string; model: string; usage: null }
export interface ModelRequest { messages: Message[]; tools: { function: { name: string } }[]; operation: Operation }
export interface ModelAdapter { mode: 'mock' | 'real'; mock: boolean; baseUrl: string; chat(request: ModelRequest): Promise<Completion> }
export interface MockSettings { mode: 'mock'; scenario: 'success' | 'model-error' | 'tool-error' | 'invalid-bundle' | 'slow-model'; timeoutMs: number; delayMs: number }
export function validateSettings(input: unknown): MockSettings {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid mock configuration.');
  const value = input as Record<string, unknown>;
  if (value.mode !== 'mock') throw new Error('Real inference is not configured. No model request was sent.');
  if (Object.keys(value).some(key => !['mode', 'scenario', 'timeoutMs', 'delayMs'].includes(key)) ||
    !['success', 'model-error', 'tool-error', 'invalid-bundle', 'slow-model'].includes(String(value.scenario)) ||
    !Number.isInteger(value.timeoutMs) || Number(value.timeoutMs) < 100 || Number(value.timeoutMs) > 10000 ||
    !Number.isInteger(value.delayMs) || Number(value.delayMs) < 0 || Number(value.delayMs) > 1000) throw new Error('Invalid mock configuration.');
  return value as unknown as MockSettings;
}
export function validateBrief(brief: string): void {
  if (!brief.trim()) throw new Error('Enter a brief before running the mock agents.');
  if ([...brief].length > 1500 || new TextEncoder().encode(brief).length > 6000) throw new Error('The brief must fit 1500 Unicode characters and 6000 UTF-8 bytes.');
}
export function createModelAdapter(settings: MockSettings): ModelAdapter { return new MockModelAdapter(settings); }
export class MockModelAdapter implements ModelAdapter {
  readonly mode = 'mock' as const; readonly mock = true; readonly baseUrl = 'browser://mock';
  private settings: MockSettings;
  constructor(settings: MockSettings) { this.settings = settings; }
  async chat({ messages, tools, operation }: ModelRequest): Promise<Completion> {
    operation.assert();
    if (this.settings.scenario === 'slow-model') await operation.wait(new Promise<never>(() => {}));
    await operation.wait(new Promise(resolve => setTimeout(resolve, this.settings.delayMs)));
    if (this.settings.scenario === 'model-error') throw new Error('The mock model failed. No real provider was contacted.');
    const result = (content: string): Completion => ({ content, toolCalls: [], finishReason: 'stop', model: 'neuro-san-mock-studio', usage: null });
    const builder = tools.find(tool => tool.function.name === 'home_builder');
    const last = messages.at(-1);
    if (builder && last?.role !== 'tool') {
      const brief = messages.find(message => message.role === 'user')?.content || '';
      validateBrief(brief);
      return { ...result(''), finishReason: 'tool_calls', toolCalls: [{ id: 'mock_home_builder', type: 'function', function: { name: 'home_builder', arguments: JSON.stringify({ request: brief }) } }] };
    }
    if (builder) {
      let returned: unknown;
      try { returned = JSON.parse(last?.content || ''); } catch { throw new Error('The home builder tool failed. The current draft is unchanged.'); }
      if (!returned || typeof returned !== 'object' || typeof (returned as Record<string, unknown>).text !== 'string') throw new Error('The home builder returned an unsupported result.');
      return result((returned as { text: string }).text);
    }
    if (this.settings.scenario === 'tool-error') throw new Error('The mock home builder tool failed.');
    const brief = messages.find(message => message.role === 'user')?.content || '';
    validateBrief(brief);
    return result(JSON.stringify({
      schemaVersion: this.settings.scenario === 'invalid-bundle' ? 'unsupported' : '0.1',
      displayName: 'Draft from your brief', introduction: `Mock draft: ${brief}`,
      blocks: [{ type: 'text', title: 'Your brief', text: brief }, { type: 'text', title: 'Next steps', text: 'This deterministic mock preserves your brief as text. Review and edit this proposal before applying it. Nothing is saved to the Tower.' }], theme: 'paper',
    }));
  }
}
