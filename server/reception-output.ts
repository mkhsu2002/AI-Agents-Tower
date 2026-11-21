// A single inert narration may accompany a real Reception handoff. Never parse or forward its text.
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function discardableReceptionText(value: unknown): boolean {
  if (!object(value) || value.type !== 'message' || value.role !== 'assistant' || Object.keys(value).some(key => !['type', 'role', 'content', 'id', 'status', 'phase'].includes(key))) return false;
  if (value.id !== undefined && typeof value.id !== 'string' || value.status !== undefined && value.status !== 'completed' || value.phase !== undefined && value.phase !== null && value.phase !== 'commentary' && value.phase !== 'final_answer') return false;
  if (!Array.isArray(value.content) || value.content.length !== 1) return false;
  const part = value.content[0];
  return object(part) && part.type === 'output_text' && typeof part.text === 'string' && !Object.keys(part).some(key => !['type', 'text', 'annotations', 'logprobs'].includes(key)) && (part.annotations === undefined || Array.isArray(part.annotations)) && (part.logprobs === undefined || Array.isArray(part.logprobs));
}
