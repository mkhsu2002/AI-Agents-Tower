# Meta Muse reviewer preparation — 2026-11-21

## Provider identification and authority

The owner replaced the proposed OpenRouter path with **Meta Muse API** during this round. OpenRouter work stopped before any code edit or API request: only public documentation had been read. No OpenRouter account, key, relay, free or paid call, fallback or spend occurred. OpenRouter is not an active implementation option in this checkpoint.

Read-only reference: [MuseCondo source](https://github.com/mkhsu2002/MuseCondo/tree/26f884fdf3247fbaf6767d113641d1f6c3fe8aa4) main at `26f884fdf3247fbaf6767d113641d1f6c3fe8aa4`. Reviewed its public README, docs/META-API.md, docs/META-HOME-TRANSPORT.md, docs/TOWER-MANAGER-META-MUSE-OPERATIONS.md and selected server/live provider code. No Muse working tree, deployment, secret, stored resident record or live endpoint was changed or called; no architecture or source code was copied. A no-checkout reference clone is outside this project in /tmp and is not a new execution environment.

The public reference identifies **Meta Model API**, `muse-spark-1.3` Standard mode, server-side Bearer authentication, `https://api.meta.ai/v1/responses`, `store:false`, and separate configuration/authorization/budget checks. Muse's historical successful response records concern Muse operations, not Tower authorization, current account credits, or provider invoices. We did not use Muse's production endpoint or borrow its credentials or quota.

Official sources rechecked 2026-11-21: [Meta overview](https://dev.meta.ai/docs/overview), [Muse Spark](https://dev.meta.ai/docs/muse-spark), [Responses protocol](https://dev.meta.ai/docs/protocols/responses), [pricing/rate limits](https://dev.meta.ai/docs/pricing-rate-limits). Responses supports text/function calls and bounded output including reasoning. The chosen Standard model is pay-as-you-go; free account credits would offset metered usage, not turn it into a zero-price model. Standard pricing observed: USD 1.25/M input and 4.25/M output tokens. No Contributor-mode, paid alternative, search, image or shell fallback is used. Availability/terms for the owner's actual account and this new project have not been established by reading public documentation.

| Account-specific question | Evidence this round |
| --- | --- |
| Remaining free credits | Owner reports credits remain; amount independently unverified. No balance/account/credential API accessed. |
| Credit expiry | Unknown. No judging-period coverage can be promised. |
| Permission to use those credits for this independent Tower | Owner intends Meta; provider entitlement/project scope and an existing Tower-specific server binding are unverified. Muse configuration is not transferred. |
| Automatic paid overage / recharge disabled | Unknown. Existing Muse application budgets and paid-call flags are not proof of provider zero-overage enforcement. No billing/security settings changed. |
| Dedicated zero-new-cost test environment | None confirmed. No real single-call trial was attempted. |

One necessary next step: the account owner/operator must confirm an **existing, appropriately authorized Tower-only server binding**, with a reservable free-credit amount, expiry and enforceable no-paid-overage policy for the synthetic trial. Supply a secret-free confirmation; do not paste, copy or transfer credentials. If no such binding exists, it remains blocked rather than silently reusing Muse's key or buying capacity. Public access requires a separate later authorization/acceptance step.

## Implemented gateway and browser contract

`server/reviewer-gateway.ts` is a new independent **offline-only** gateway core. Its factory rejects non-loopback origins, requires an explicitly supplied provider port and has no default network transport or environment access. The port is exercised only by scripted fixtures. It is not a connected Meta client or a deployed live gateway.

The browser reads disabled status after consent. The offline enabled contract is `{enabled:true,protocol:"tower-synthetic-v1"}`; it no longer accepts a client-selected model. POST start accepts exactly `{consent:true}` and returns an opaque short-lived ticket and step zero. Each inference request accepts exactly `{ticket,step}`. No browser messages, tools, URL, model, API key or arbitrary prompt are forwarded. The existing bounded completion decoder still checks tool names and response shape.

The core reconstructs three requests: Reception's exact fixed-brief handoff; Home builder's schema/action proposal; Reception's exact relay of the stored builder output. It pins Meta's Responses endpoint and model, minimal reasoning and store:false. It does not execute provider-suggested tools. Both server proposal checks and the actual browser-local registered validation action must succeed; a gateway response does not replace the actual dispatcher receipt, user review, explicit Apply or export.

A trusted free-quota port must atomically reserve the three-call run for this Tower, request input allowance of 8,192 tokens per call and total output allowance of 2,304 tokens, with a non-expired grant explicitly refusing paid overage. Missing, wrong-project, insufficient, expired or unprotected grants reject before provider dispatch. The fixture grant is synthetic, not account evidence. Before any live implementation, the port must verify actual token counts/pricing, reserve monetary credit across all workers and prevent dispatch after credit expiry. Post-response usage checks alone cannot prevent billing.

Current local caps: three starts and nine provider calls for the core instance's lifetime, two concurrent sessions including pending quota reservations, four concurrent requests, 60-second maximum run lifetime, 512-byte request body, 8-KiB trusted provider request, 32-KiB provider response, 256/1,024/1,024 output tokens. Per-call deadlines are at most 10 seconds and never later than the run authorization deadline. Output/usage/model identity/refusals/schema/action matches are checked. Unexpected content, 429, other provider errors, redirects, duplicate/out-of-order steps, cancellation and deadline stop the run, invalidate its ticket and never automatically retry or switch provider/model. Unknown remote cancellation/billing outcomes stay unknown.

All counters and synthetic transcript state are memory-only, bounded and expire or disappear on restart. They are **not** a durable cross-instance quota ledger, general anonymous abuse protection or evidence of free capacity throughout judging. An actual atomic quota implementation and public service policy remain gates. Application code emits no prompt/body/ticket/provider-error logging, no private content and no keys. Platform retention and provider policies are separate and unverified.

## Production remains hard OFF

`api/reviewer.ts` always returns HTTP 503 with a fixed disabled error. It imports no provider or gateway, reads no environment variables or request body, and offers no activation switch. Three exact Vercel rewrites route start/chat/cancel to this disabled handler on the existing project; no new site, provider service or security setting was created. The public static `/reviewer/status.json` remains exactly `{"enabled":false}`. Even an accidental client status change would encounter the disabled server handler. Neither handler nor status enables public inference.

See [Vercel's supported Node fetch handler](https://vercel.com/docs/functions/runtimes/node-js). Production Git deployment is metadata evidence only; normal public readback and interaction results are recorded in DEPLOYMENT.md. No account/key read or creation, secret transfer, payment, recharge, real external inference, Muse/Apart modification or second-site deployment occurred.

## Evidence and remaining gaps

The unit tests exercise actual Request/Response parsing and the scripted Meta protocol port, not weights or provider HTTP. Browser fixtures route the existing Studio's same-origin requests through this gateway core and scripted port: actual two-role browser orchestration, real local validation receipt, review/apply/export, quota/error/refusal/schema/cancel/deadline/restart behavior. No visitor key or editor sentinel is sent to the gateway. Fixtures are explicitly labelled and no adapter mode/model string is treated as inference attestation.

M1 regressions, shared transport checks, runtime safety and independent local caller checks remain required. The screenshot in ignored artifacts/evidence is local scripted evidence. Real Meta request health, exact account quotas/expiry/terms, provider overage stop, public judging capacity, full canonical schema/streaming support and an independent deployed HTTPS composition demonstration remain unverified. P0 remains incomplete.

## Saved-binding diagnostics and HTTP preparation — 2026-11-21

Following the owner's report that the Secret was saved and redeployed, a Pages-only GET /api/reviewer/readiness now checks whether context.env.META_API_KEY is a nonblank string and returns credentialConfigured true/false/null. It never returns the value, format, length, prefix, digest or binding errors. Enabled, connectionVerified and trialReady remain false; no outbound provider request, credit query or credential health probe occurs. Inference routes still return the original hard-disabled response without reading bindings.

server/meta-sender.ts adds a prepared server-only HTTP boundary with explicit injected transport and credential. There is no default fetch, environment read or production caller. It pins the Meta endpoint/model, disallows unknown fields/fallbacks and oversized/nonstoring policy violations, forwards the caller's bounded signal with redirect error/credentials omit, suppresses raw network/provider error bodies and never retries. This is a reusable transport, not quota authority, token-count preflight or a live connection. The offline gateway's trusted quota reservation boundary remains required before any future caller can authorize a request. Public handlers do not import this sender.

Five new scripted tests cover secret presence/non-disclosure, method separation/inference remaining off, exact endpoint/authorization construction, forbidden request mutations/abort, and generic failures/redirect/quota without retries. Only synthetic credential strings and injected callback responses are used. No real key was retrieved by the assistant and no real provider request was made.
