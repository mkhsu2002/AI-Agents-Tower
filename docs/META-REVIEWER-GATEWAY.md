# Meta reviewer gateway — 2026-11-21

## Provider and scope

The project uses Meta Model API with pinned `https://api.meta.ai/v1/responses`, `muse-spark-1.3` Standard and `store:false`. The server reads only this Tower's encrypted Pages META_API_KEY binding. No credential is returned, logged or sent through the browser; no other Tower endpoint, key or data is reused. OpenRouter was researched only and never implemented or called.

Protocol reference: read-only public MuseCondo documentation at [26f884fdf3247fbaf6767d113641d1f6c3fe8aa4](https://github.com/mkhsu2002/MuseCondo/tree/26f884fdf3247fbaf6767d113641d1f6c3fe8aa4). No source architecture, production service or credential was copied. Official protocol references checked 2026-11-21: [overview](https://dev.meta.ai/docs/overview), [Muse Spark](https://dev.meta.ai/docs/muse-spark), [Responses](https://dev.meta.ai/docs/protocols/responses), [pricing and rate limits](https://dev.meta.ai/docs/pricing-rate-limits). Provider availability and model behavior remain subject to an actual test; no pricing or account-state guarantee is inferred from documentation.

## Public fixed-example boundary

Cloudflare's functions/api/reviewer/[[path]].ts calls server/live-reviewer.ts only when both META_API_KEY and TOWER_RUNTIME D1 bindings are present. Its dynamic status route then advertises tower-synthetic-v1. Missing bindings fail closed. Vercel's api/reviewer.ts and static status remain disabled. See CLOUDFLARE-PAGES.md for the one remaining D1 binding step.

Fresh explicit consent precedes POST start `{consent:true}`. The server issues a random 48-hex-character ticket valid for 60 seconds, stores only its SHA-256 hash and binds it to the request origin. Chat accepts exactly `{ticket,step}` and cancel exactly `{ticket}`. Unknown/duplicate fields, extra client prompts/models/tools/routes/credentials, query parameters, cookies, unauthorized origins and oversized bodies are rejected. Browser requests omit credentials and reject redirects. There is no arbitrary prompt proxy, cross-origin public inference permission, automatic retry or model fallback.

The server reconstructs Reception → Home builder → Reception from the fixed fictional Atlas example. Home builder must emit strict HomeBundle JSON and its exact registered validation action; Reception must copy the builder output unchanged. Program validation runs on the server and the browser; a successful browser dispatcher receipt is still required before proposal review. Explicit Apply, revision guard, safe preview and export remain separate. No private Home, account, publication or resident identity is created.

## Shared resource limits

- D1 atomically reserves three calls per start, with a global limit of 60 reserved calls / 20 admitted runs per UTC admission day across workers. No refund is issued for refusal, cancellation, error or unknown outcome. Across-midnight in-flight tickets can last at most 60 seconds; this is not an exact rolling-window or currency cap.
- Each role step is atomically consumed before dispatch. Different workers/restarts cannot replay a consumed step. Provider rejection, timeout or storage uncertainty never makes it retryable. New attempts require a new explicit run and allowance.
- Fixed endpoint/model; output caps 256, 1024 and 1024 tokens; maximum serialized provider request 8 KiB; response 32 KiB; browser command 512 bytes; ten-second server request/call deadline, thirty-second browser run deadline and sixty-second ticket expiry. Four in-flight requests per worker add local protection, not a global concurrency guarantee.
- Provider-reported usage must fit 8192 input tokens per call and the output cap. This post-response input check does not prevent billing for an unexpected provider count; request size/fixed content and reserved call/output ceilings provide pre-dispatch limits. This is no monetary price guarantee.
- Cancellation is shared across workers and blocks acceptance of late responses. Client abort/deadline aborts local fetch; remote cancellation cannot guarantee provider rollback. A stuck/erroring D1 fails closed. Cleanup attempts are independently time-bounded; consumed running steps stay non-retryable if cleanup fails.

D1 holds only UTC admission counters, hashed tickets, origin, state, expiry and transient validated fixed-example output. Completed/cancelled/error sessions clear output. Expired sessions are removed on the next admitted start, and older budget rows after two days; idle expired metadata may remain until that cleanup runs. This is operational coordination, not Home persistence. It contains no visitor brief, private editor content, provider key or identity. Application logging emits no prompt, body, ticket or provider error details; provider/platform retention is separate.

Successful receipts expose only aggregate provider-reported input/output tokens and call count alongside the actual local validation result. Fixture reports and model labels never attest real inference. The fixed small example, minimal reasoning, no retries and caps prioritize predictable consumption; raising limits requires a deliberate code change and tests.

## Edge compatibility and evidence

HomeBundle uses a checked-in Ajv standalone validator generated at build time by scripts/generate-homebundle-validator.mjs; `npm run build` checks it against the schema. Runtime schema compilation/new Function is removed for Cloudflare compatibility, preserving existing strict validation and unknown-field rejection. Vendor runtime attribution and patches are unchanged.

Tests use scripted Meta responses and real SQLite behind the narrow D1 port. They cover cross-worker admission/replay/cancel, origin/body/consent failures, missing configuration, malformed/refused/oversized/redirected responses, model/quota errors, stalled storage/provider, abort and no retry. Browser fixtures exercise the actual gateway, native two-role Engine, validation receipt, review/apply/export and M1 regressions. Local workerd/D1 additionally verifies actual Cloudflare SQL admission and quota rejection without a provider request.

No real Meta call has passed. Public activation needs the owner D1 binding and actual public live acceptance; configured status is not provider-health evidence. The manifest still advertises the development mock router, full canonical/streaming compatibility is incomplete, and independent deployed HTTPS composition remains unverified. P0 is not complete.
