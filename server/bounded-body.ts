import type { Operation } from '../spikes/m2/safety.js';
export async function boundedText(body: ReadableStream<Uint8Array> | null, max: number, op: Operation): Promise<string> {
  if (!body) throw Error('Empty body');
  const reader = body.getReader(); const decoder = new TextDecoder('utf-8', { fatal: true }); let count = 0; let value = '';
  try { for (;;) { const part = await op.wait(reader.read()); if (part.done) break; count += part.value.length; if (count > max) throw Error('Body limit exceeded'); value += decoder.decode(part.value, { stream: true }); } return value + decoder.decode(); }
  finally { void reader.cancel().catch(() => {}); reader.releaseLock(); }
}
