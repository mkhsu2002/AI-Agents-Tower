# M2 local runtime boundaries

Date: 2026-11-17. Continues `018b950f47aedf81d614f8a0a461d6262f6b50b3` on `feat/m2-runtime-boundaries`. This is still an isolated **scripted mock** harness. No real inference, public deployment, private home persistence or completed M2 conformance is claimed.

## Supported strict profile

The checked-in [network schema](../spikes/m2/schema/network.schema.json) and [manifest schema](../spikes/m2/schema/manifest.schema.json) define Tower's **local-1 subset**, not the entire official HOCON specification. Ajv compiles these trusted schemas into a standalone browser module. Incoming data never becomes a schema or executable code. `generate-schema.mjs --check` verifies generated schema/validator bytes before the M2 test and manual server commands.

Only resolved UTF-8 JSON is accepted. The profile supports a bounded list of named agents, public instructions, local agent references, absolute peer URLs, allowlisted MCP descriptors, simple string-argument invocation schemas, model-name hints, finite steps and explicit origin policies. It rejects unknown fields at each object/schema level; malformed/duplicate-key JSON; wrong types; undefined required invocation properties; duplicate agent/network names; normalized tool-name collisions; a mismatched manifest front agent; executable classes/toolboxes/action modules; substitutions/includes/link slots; and unsupported HOCON syntax. Unsupported features fail instead of being stripped or silently downgraded.

Limits: 128 KiB per artifact, depth 16, 10,000 parsed nodes, up to 24 agents, 12 references per agent and eight manifest networks. Individual instructions/descriptions/IDs and invocation schemas also have closed limits. Request/response bodies are capped at 256 KiB, counting streamed response bytes after browser decompression. Oversized or interrupted body reads terminate the operation rather than becoming a model-visible tool error followed by further model calls. Invocation count/remote count budgets from the earlier runtime remain in place.

Network definitions must be on the same origin as their authorized publishing manifest. URLs require HTTP(S), no embedded credentials or fragments, and HTTP only on loopback hosts. Peer policies list exact origins. The profile deliberately excludes dynamic link discovery/persistence and alternate runners, preventing those dormant APIs from bypassing transport controls. It is intentionally narrower than the competition profile; compatible features can be expanded only with schema and boundary tests. This is not a claim of general Neuro SAN interoperability.

## Redirect origin authorization

All enabled artifact, model and MCP fetches use `redirect: error`. **Every redirect is refused, including same-origin redirects.** Cross-origin artifact URLs in manifests are rejected before fetch, even when another origin appears in allowed_peers. Metadata does not authorize contacting a new artifact origin.

This conservative policy avoids relying on unreadable cross-origin Location headers or inspecting Response.url after a destination has already been contacted. The user can run an explicitly selected, final named URL through the normal consent flow; automatic redirect following is not supported. No router Authorization header, MCP header, POST arguments or cookies are forwarded to a redirected destination. Browser cookies are omitted from enabled transport requests; explicitly supplied endpoint-scoped headers remain separate.

The tests serve real 302/307 responses from both loopback origins and observe zero requests to the redirect target. Coverage includes manifest, definition, model and MCP transports and same-origin redirects. Browser CORS enforcement remains active; no proxy or security bypass is added.

## Bounded operations and cancellation

An operation covers initial manifest/definition compilation, consent, all model/MCP requests, response bodies and the final turn result. It has one AbortController and a default 10-second deadline, configurable by trusted host code from 100 to 30,000 milliseconds. Limits cannot be changed by network data. Monotonic deadline checks run before requests/agent dispatch and when awaited results return, in addition to the timer.

A timeout or the UI's **Cancel runtime operation** button aborts in-flight fetches and stops awaiting stalled consent or streams. The consent UI receives the signal and closes. Late approval or late results cannot resume the old turn. Failure/cancellation clears compiled peer/client caches and conversation state before another run. Only one operation per Engine may be active. No automatic retry is performed; a fresh run must fetch/validate again and obtain fresh approvals. Dynamic link APIs and alternate runners are explicitly disabled for this profile.

A started remote operation can have an **unknown outcome**. Errors say so and instruct against automatic retry. The fixture validator is read-only; a future MCP service could commit a change despite an HTTP abort. No successful business receipt is synthesized from a cancelled operation.

## What this runtime cannot enforce

- Abort stops this browser's wait/transport; it cannot revoke a request already received, roll back a server transaction or stop provider-side computation/billing. Later writes need server authorization, idempotency and status recovery.
- Browser timers can be throttled/suspended, and JavaScript cannot preempt synchronous code on the same event loop. Bounded parsing reduces work; monotonic checks prevent accepting an expired result once execution resumes. This is not a hard real-time/OS process deadline or a browser memory quota.
- A trusted page can import low-level modules or call fetch itself. These checks are an execution policy for the supported Engine path, not a sandbox for arbitrary same-page JavaScript, browser extensions or compromised host code. Optional executable tools/action bridges are not enabled.
- Instructions can still be misleading or contain prompt injection. Structural validation does not prove benign intent, model correctness, provenance or MCP server effects. Tool allowlists constrain discovery, not server trust. No real model behavior has been tested.
- General HOCON, full official schemas, cross-origin redirected artifacts, authenticated MCP/OAuth, write recovery, multi-browser behavior and production HTTPS/cost/availability remain unverified or unsupported. Declining these features is not competition certification.

## Verification and evidence

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `CHROMIUM_PATH=/usr/bin/chromium npm run test:ui`, and `CHROMIUM_PATH=/usr/bin/chromium npm run test:m2` from the repository root. No new package or credential is required. Six upstream modules have recorded Tower patches; original comments, license and source hashes remain in [PATCHES.md](../spikes/m2/vendor/PATCHES.md) and provenance.

The M2 suite has 51 cases covering the earlier consent/duplicate checks plus strict schema/type/size/depth/encoding failures, unknown and executable fields, duplicate JSON/manifest names, invocation and tool alias ambiguity, rejected redirect targets, stalled response headers/bodies, model SSE and MCP deadlines, pending-consent timeout, explicit cancel, fresh-run recovery, late approval and no retry after a started MCP call. Failure injection is local; all browser requests remain restricted by the tests to the two loopback origins.

The oversized-response test initially exposed that the native Response API can surface a stream-limit error as a generic read failure. The fix treats failed body reads as fatal policy failures before another model call. This negative test now requires an explicit failed status and only the original caller model request, with no peer agent execution.

Current [machine-readable results](../spikes/m2/evidence/runtime-boundaries-results.json) and [screenshot](../spikes/m2/evidence/runtime-boundaries.png) are separate from the preserved 11-test spike and 22-test consent-hardening snapshots. Generate a new snapshot only after the full suite passes:

```sh
CHROMIUM_PATH=/usr/bin/chromium node node_modules/@playwright/test/cli.js test --config spikes/m2/playwright.config.ts --reporter=json > /tmp/tower-runtime-boundaries.json
CHROMIUM_PATH=/usr/bin/chromium node spikes/m2/record-evidence.mjs /tmp/tower-runtime-boundaries.json
```

The recorder requires all 51 cases with no skipped, flaky or unexpected result. It records source hashes, per-test durations, consent sequence and mock-only model boundary events. These are local verification records, not an independent inference/security attestation. No credential, paid service, push, publication, PR or deployment is involved.

## Final observed result

All **51 M2 browser tests passed**, with zero skipped/flaky/unexpected results. M1 regression also passed: **8 domain tests and 8 UI tests**, plus lint, TypeScript and production build. M1 retained the same `index-Bf11-T4K.js` and `index-DLi3SecT.css` asset hashes. Schema generation checks, the 16 unchanged upstream file hashes, six recorded patched-module hashes/syntax checks and `git diff --check` passed. The updated mock-only screenshot was visually inspected.

The standalone validators use the existing Ajv 8.20.0 dependency; its MIT notice is retained in schema/AJV-LICENSE.txt. No dependency was installed or upgraded. Earlier evidence JSON and screenshots remain unchanged. This delivery remains local and memory-only; the work does not add inference funding, resident registration or public/private server storage.
