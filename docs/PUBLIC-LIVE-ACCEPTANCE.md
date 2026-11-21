# Public live demo acceptance

## Current verified boundary — 2026-11-21

The owner completed Production D1 binding and redeployment. Fresh public GET readiness returned enabled true, credentialConfigured true and trialReady true. Status enabled means configuration is present; connectionVerified intentionally remains false because a GET never calls the model. No real inference success has been verified from this environment.

The cloud browser failed before opening a tab (Browser Use could not read requirements). The normal production Playwright attempt failed at initial navigation with ERR_TUNNEL_CONNECTION_FAILED; an ordinary command-line public GET returned HTTP 403. No provider request was submitted, no security setting was changed and no alternate network/protection bypass was attempted. Public GET extraction remains available and is used only for configuration/delivery checks.

## One deliberate browser run

Use an environment that can open the normal public site. No account key, secret file or provider override is needed:

```sh
npm ci
TOWER_LIVE_ACCEPTANCE=1 CHROMIUM_PATH=/usr/bin/chromium npm run test:live
```

Omit CHROMIUM_PATH for Playwright's installed Chromium. Without TOWER_LIVE_ACCEPTANCE=1 the test skips before opening the site. It has one worker, one run and zero retries. It may consume one admission and up to three Meta calls; an uncertain outcome is not rerun automatically. Generic production tests do not start this live flow, and the older disabled-service test skips when live status is enabled.

The test uses only https://1st-tower.neobabylon.app/ through the normal public UI, with no routed responses, injected provider, credential, alternate endpoint or protection bypass. It verifies fixed Atlas input, initially denied consent, one start, exactly three ticket/step-only chats, no browser authorization/cookies, actual registered validator receipt, provider-reported usage, explicit Apply, editor modification, valid JSON download/reimport and no local/session storage.

A successful sanitized JSON attachment contains public origin, counts, validation action and aggregate usage. The screenshot/download artifacts remain ignored local evidence. Network traces are off to avoid retaining run tickets. Do not publish tickets, prompt/provider bodies, credentials or private drafts. Test flags/model labels alone do not attest inference; distinguish fixture execution from this unrouted production run. A failed navigation, enabled status or READY deployment is not a model pass.

The same review/apply/edit/export assertions are exercised by explicitly scripted local browser fixtures. Those verify test mechanics and application behavior without establishing actual Meta health or judging availability.

## Manual acceptance

1. Open https://1st-tower.neobabylon.app/#demo directly, or use the homepage Try the demo button. Execution should show Live demo and the fixed fictional Atlas brief.
2. Give the displayed consent and select Create a draft once. Watch Reception and Home builder status. If it fails, retain the displayed code/message and stop; do not repeatedly restart.
3. Review the proposal and Validation receipt: status succeeded, result valid true, three usage-reported calls. The editor must not change before Apply.
4. Apply, edit, preview, Download JSON and reimport. This creates no private Home, account, resident identity or publication.

Record source SHA, public origin, timestamp, the successful receipt/usage or sanitized failure, and the browser used. A human-observed run is evidence only for the observed scope. Independent deployed HTTPS composition and portable live-router compatibility remain separate requirements.

## Safe failure diagnosis

The server returns a short code from a fixed allowlist. Browser copy comes from that same allowlist; arbitrary server/provider error strings never become UI text. Unknown codes receive a generic status-only message. No prompt/key/ticket/raw upstream body is logged.

| Code | Meaning / next step |
| --- | --- |
| CONSENT_REQUIRED / REQUEST_REJECTED | No accepted authorized command; start from the public demo controls. |
| NOT_CONFIGURED | Required backend configuration unavailable; inspect binding names/environment. |
| DAILY_LIMIT | All 20 admissions for the UTC day reserved; wait until the next UTC day. No refund/retry bypass. |
| BUSY | Local request capacity reached; the rejected request did not start another model call. |
| RUN_STOPPED | Expired, consumed, cancelled or otherwise stopped ticket. Never replay a role step. |
| PROVIDER_LIMIT / PROVIDER_UNAVAILABLE | Provider quota/service/transport failure; this run stops with no fallback. |
| OUTPUT_REJECTED | Provider output failed model/status/usage/shape/HomeBundle/action checks. No success proposal. |
| STORAGE_UNAVAILABLE | D1 operation failed; there is no unmetered or memory-only fallback. |
| TIMEOUT / CANCELLED | Local acceptance stopped; remote computation may still finish and allowance is not refunded. |

The gateway keeps the existing endpoint/model, input/output caps, 20-run daily admission, three-call sequence and timeouts. Failed runs require a deliberate new attempt; this guide is not authorization for repeated unattended trials or higher limits.

## After the reported 502

A public owner-run attempt failed; it is not a live success. The local workerd reproduction exposed an unsupported server redirect mode and the repair preserves no-follow behavior. The next normal-path attempt should be a single refreshed #demo run after the repaired deployment is confirmed. No binding/key reset is required by this repair. If it fails, copy the displayed allowlisted code and stage, not secrets or raw provider data. Do not repeatedly restart.

PROVIDER_AUTHORIZATION denotes a provider 401/403; PROVIDER_REQUEST_REJECTED denotes 400/404/422. GATEWAY_UNAVAILABLE is a caught handler failure; client-generated GATEWAY_RESPONSE_INVALID means the response lacked a recognized safe service code. Start/Reception/Home builder/Review show the stopped phase. The generic 502 report alone cannot identify the full production cause.

## Unrecognized 502 at Reception — diagnostic procedure

The owner's refreshed public attempt returned `[GATEWAY_RESPONSE_INVALID; Reception]`. Admission succeeded, but the first turn did not provide a readable recognized gateway error. This does not establish whether Meta was contacted or whether Cloudflare, a proxy, body delivery or application execution failed. A fresh public GET of that exact turn path returns 403 / REQUEST_REJECTED as expected; this checks route delivery, not POST/model behavior.

The native fixture now compiles and runs the actual Pages Functions router using both pinned modern Wrangler 4.166.0 and legacy 2.20.2, in addition to the direct gateway. All outbound Meta traffic is intercepted; this cannot reproduce production network/platform behavior or attest inference. Valid three-role completion and redirect/401/400/429/503/invalid-output paths remain explicit tests.

Application responses now carry `X-Tower-Gateway: tower-synthetic-v1`. This is a diagnostic marker, never an authority token. On an unrecognized error only, the browser states whether it received that marker and displays a strictly validated Cloudflare Ray value if supplied. Untrusted headers/body text remain hidden. Marker absence suggests a response outside the wrapper, but an intermediary can remove headers, so absence alone does not prove the cause.

Server logs contain only fixed service/event/route categories, HTTP status and a validated Ray value. Events are request-start, provider-start, provider-response, request-end and handler-error. No full URL/query, request body, ticket, credentials, prompts, provider output or raw exception is passed to these logs. Logging failure cannot interrupt the response. A provider-start event means dispatch was attempted, not that inference completed; provider-response likewise precedes output validation.

For the next **single** diagnostic trial, open Cloudflare **Workers & Pages → ai-agents-tower → production deployment → View details → Functions**, start the live log stream, then use the normal #demo UI once. Capture only `outcome`, exception message/error code (redact any secret if present), and the custom `service: tower-reviewer` event lines. Do not share the complete request object, headers, body, key, ticket or HAR file. Match the displayed Ray where available. Stop after that attempt; do not retry automatically or change API/D1 configuration without evidence. Logs are a live stream, so open them before the attempt. See [Cloudflare's official Pages logging guide](https://developers.cloudflare.com/pages/functions/debugging-and-logging/).

This workspace has no authorized Cloudflare log access and cannot complete normal public browser navigation; public GETs alone cannot resolve the remaining production failure. No key transfer, additional credential or security-setting change is requested. Real-model acceptance and P0 completion remain open.
