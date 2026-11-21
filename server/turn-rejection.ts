// Safe structural observations only. No provider strings, IDs, arguments, content or usage values.
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export type TurnRejection = 'JSON_INVALID' | 'ENVELOPE_INVALID' | 'MODEL_MISMATCH' | 'STATUS_NOT_COMPLETED' | 'PROVIDER_ERROR_PRESENT' | 'OUTPUT_ARRAY_INVALID' | 'USAGE_INVALID' | 'HANDOFF_SHAPE_INVALID' | 'HANDOFF_ARGUMENTS_JSON_INVALID' | 'HANDOFF_ARGUMENTS_INVALID' | 'MESSAGE_SHAPE_INVALID' | 'DRAFT_OR_ACTION_INVALID';
const kind = (item: unknown) => !object(item) ? 'missing' : item.type === 'function_call' ? 'function_call' : item.type === 'message' ? 'message' : item.type === 'reasoning' ? 'reasoning' : 'other';
export class TurnValidationError extends Error {
  readonly reason: TurnRejection;
  readonly structure;
  constructor(reason: TurnRejection, data?: unknown) {
    super('Model response validation failed: ' + reason);
    this.reason = reason;
    const envelope = object(data) ? data : undefined;
    const outputs = Array.isArray(envelope?.output) ? envelope.output : undefined;
    const items = outputs?.filter(item => !object(item) || item.type !== 'reasoning');
    const first = items?.[0]; const content = object(first) && Array.isArray(first.content) ? first.content : undefined;
    const usage = object(envelope?.usage) ? envelope.usage : undefined;
    const detail = object(envelope?.incomplete_details) ? envelope.incomplete_details : undefined;
    this.structure = Object.freeze({
      completion: envelope?.status === 'completed' ? 'completed' : envelope?.status === 'incomplete' ? 'incomplete' : envelope?.status === 'failed' ? 'failed' : 'other',
      incompleteReason: detail?.reason === 'max_output_tokens' ? 'max_output_tokens' : detail?.reason === 'content_filter' ? 'content_filter' : detail ? 'other' : 'absent',
      outputArray: !!outputs,
      outputCountCapped: Math.min(outputs?.length ?? 0, 5),
      actionableCountCapped: Math.min(items?.length ?? 0, 5),
      firstItem: kind(first),
      handoffNameMatches: object(first) && first.name === 'home_builder',
      callIdAcceptedShape: object(first) && typeof first.call_id === 'string' && /^[\w-]{1,100}$/.test(first.call_id),
      argumentsString: object(first) && typeof first.arguments === 'string',
      firstContent: !content?.length ? 'missing' : object(content[0]) && content[0].type === 'output_text' ? 'output_text' : object(content[0]) && content[0].type === 'refusal' ? 'refusal' : 'other',
      usageObject: !!usage,
      inputUsageInteger: Number.isSafeInteger(usage?.input_tokens),
      outputUsageInteger: Number.isSafeInteger(usage?.output_tokens),
      inputUsageInRange: Number.isSafeInteger(usage?.input_tokens) && Number(usage?.input_tokens) >= 0 && Number(usage?.input_tokens) <= 8192,
      outputWithinReceptionCap: Number.isSafeInteger(usage?.output_tokens) && Number(usage?.output_tokens) >= 0 && Number(usage?.output_tokens) <= 256,
      outputWithinBuilderCap: Number.isSafeInteger(usage?.output_tokens) && Number(usage?.output_tokens) >= 0 && Number(usage?.output_tokens) <= 1024,
    });
  }
}
