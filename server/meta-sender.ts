// Prepared HTTP boundary only. No default fetch, environment access or public route.
import { META_ENDPOINT, META_MODEL } from './meta-policy.ts';
import type { ProviderRequest } from './reviewer-gateway.ts';
const fail = () => new Error('Meta transport configuration or request was rejected.');
export function createMetaSender(key: string, transport: typeof fetch) {
  if (typeof key !== 'string' || !key.trim() || key.length > 8192 || /\s/.test(key) || typeof transport !== 'function') throw fail();
  return async (request: ProviderRequest): Promise<Response> => {
    const body = request.body;
    if (request.endpoint !== META_ENDPOINT || request.redirect !== 'error' || body.model !== META_MODEL || body.store !== false || ![256, 1024].includes(Number(body.max_output_tokens)) || !Number.isInteger(body.max_output_tokens) || typeof body.instructions !== 'string' || typeof body.input !== 'string' || Object.keys(body).some(name => !['model', 'store', 'max_output_tokens', 'reasoning', 'instructions', 'input', 'tools', 'tool_choice'].includes(name))) throw fail();
    const encoded = JSON.stringify(body);
    if (new TextEncoder().encode(encoded).length > 8192) throw fail();
    request.signal.throwIfAborted();
    let response: Response;
    try {
      response = await transport(META_ENDPOINT, { method: 'POST', credentials: 'omit', redirect: 'error', signal: request.signal, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: encoded });
    } catch { throw new Error('Meta transport failed. Remote outcome may be unknown; no retry was sent.'); }
    if (response.redirected || response.status >= 300 && response.status < 400) throw new Error('Meta redirect rejected.');
    if (!response.ok) {
      void response.body?.cancel().catch(() => {});
      return Response.json({ error: 'Meta service rejected the request.' }, { status: response.status });
    }
    // Gateway owns bounded body reading, schema/usage checks and quota authority.
    return response;
  };
}
