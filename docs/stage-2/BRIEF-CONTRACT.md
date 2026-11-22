# Offline custom-brief contract v0.1

## Status and nonactivation

This is an in-memory scripted integration candidate, not an exposed API or a new Home Studio mode. No production entry imports server/offline-brief. The existing fixed Atlas live handler, 512-byte admission/chat envelopes, D1 schema, model, credentials, prompts, consent controls and consumption limits are unchanged. The candidate has no default fetch, credential/environment lookup, HTTP route or persistence adapter. Its explicit ScriptedPort is a trusted local test seam, not a production transport or network sandbox. Tests disable default fetch and require zero network attempts.

## Input

The only accepted internal JSON object is `{ "version": "0.1", "brief": "Exact user text" }`. This is distinct from portable HomeBundle. Exactly these two fields are required. The version is fixed; brief must be a nonblank, well-formed Unicode string of at most 1,500 code points and 6,000 UTF-8 bytes. The raw envelope is limited to 8,192 UTF-8 bytes. Unknown/authority/configuration fields, duplicate or escaped-duplicate keys, malformed JSON, lone surrogates and unsupported versions fail with fixed English codes. No coercion, trimming, property removal or truncation occurs.

Overreach written inside the brief remains untrusted literal data; it does not become a destination, model, tool, key, instruction policy or approval. No keyword filter is claimed to solve prompt injection. Enforceable boundaries are fixed request construction, exact handoff arguments, tool/action allowlists and code validation.

## Preview and consent

The host calls edit(raw, source), then preview(). The preview provides explicit access to the exact brief, fixed Meta endpoint/model, exact named Tower network, permitted home_builder/local validation functions and existing limits. It states that brief and generated draft are used in the three-turn workflow; current editor content, files, credentials and account data are excluded. Server-owned prompt/schema context is fixed, and the same brief also appears as a structured strict-tool constraint. The preview is a data contract for a future text-only view, not a shipped screen.

Only approve(the exact preview object issued by this session, true) grants one run. A clone, manually constructed object, other session's object or stale preview is invalid. Every edit, including A→B→A, source change, denial, revoke or cancel clears authority; an edit during execution aborts acceptance. A changed source is rejected rather than silently retaining old approval. The model cannot invoke these host methods. The input is snapshotted/frozen, and a private revision binds consent, execution and proposal.

This object-identity capability exists only in memory; it is not a portable token, cryptographic signature, server session or authentication/ownership proof. It must not be serialized as authority. Approval expires after the unchanged 60-second lease, is consumed before an attempted run and cannot be reused following failure/uncertainty. A new run requires a fresh preview/explicit approval. No automatic retry/fallback/refund occurs.

## Execution and review

The request builder fixes endpoint/model, no-follow policy, tools, auto tool choice, no parallel handoff, store false and three output caps 256/1024/1024. Input/output boundaries stay 8 KiB/32 KiB, reported input usage at most 8,192, calls at most three, per-call deadline at most 10 seconds and overall deadline at most 30 seconds. Test deadlines may only be reduced. The brief is encoded as untrusted JSON input, never interpolated into system instructions.

Known first/second-turn payload-size failures are rejected before local reservation/dispatch. A domain-valid 6 KiB brief can exceed the unchanged 8 KiB encoded request cap when repeated/escaped in input and tool schema: PAYLOAD_TOO_LARGE is explicit, with no truncation or increased allowance. The third-turn draft may also fail that existing cap. These are integration gates, not permission to enlarge production requests.

The local admission object reserves three calls up to 60 per UTC day and retains consumed reservations after failure/cancel. It is ephemeral process-local test coordination, not durable global production quota authority. Production must continue using reviewed D1 coordination if integration is later authorized; this local object is not a fallback.

Responses must match fixed model, completed status, usage/caps and exact sequence. Reception requires one real home_builder call with exactly the original brief; only the existing bounded inert-narration allowance is tolerated. Builder output must pass HomeBundle/action checks, and final Reception must copy it exactly. Only the existing executeValidation function can create the harness's successful validation receipt. A model-provided receipt/approval does nothing. This receipt proves local validator execution in a scripted harness, not a browser Engine or production inference receipt.

No result changes the editor before apply(). Proposals bind both input and editor revisions; concurrent edits or imports reject stale apply. Getter results are cloned. Cancellation/expiry/timeout prevent late acceptance even if the scripted port ignores abort; remote rollback is not guaranteed by this design.

## Privacy and errors

Modules emit no logs. Default session/preview serialization omits brief/editor/generated text and authority; explicit data/editor/proposal accessors return sensitive content only for authorized rendering. Caller code must not log those accessor values or port payloads. Errors contain only fixed codes; raw provider/exception strings are discarded. There is no DB/browser storage, key, telemetry or file write. Private fields and transient local response strings remain in memory until references are released; this is not secure erasure.

All new tests use fictional sentinels and scripted responses. No actual provider traffic, entitlement, judging capacity, public custom-input availability or production privacy/authentication guarantee is established by this package.

## Verified test boundary

Focused tests cover 27 offline cases; the complete unit suite passes 149 cases. Existing Studio regressions pass 48 cases and native scripted Cloudflare/D1 regressions pass 27 cases. Lint/typecheck/build pass. Default fetch is disabled inside the new test worker and its final guard asserts zero attempts. Production/UI entry points do not import these modules, the fixed production request remains pinned to REVIEWER_BRIEF in a regression assertion, and the frontend build retains index-D5Gw9J4L.js. This is not a new real-provider or public-interaction run.
