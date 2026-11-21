# Development log

## 2026-11-18 — baseline and compliance review

- Read README.md, AGENTS.md, latest runtime-boundary and deployment records, Home Studio and runtime sources.
- Working tree was clean on main at `60be3d8c5032e53d2bdbe369653c5b7fc1c9345e`, equal to origin/main after fetch. No competing Vite, Playwright, spike server or Git write process was found; no process was stopped.
- Existing Vercel deployment `dpl_AmybLfRKnCWjXqGASVwmC6t3rkAk` reports production READY for the same commit. Public browser verification remains separate from this metadata.
- Rechecked official rules/current specification and retained the recovered submission-start baseline. Added CONFORMANCE-MATRIX.md with bounded evidence, unanswered interpretation questions and real-inference gaps.
- Validation for this documentation stage: source/version lookup and git diff --check. Earlier test results are historical, not fresh runs.
- Next stage: integrate the patched Engine with Studio using a replaceable mock-only model adapter, deterministic result validation, explicit review/apply, failure/cancel handling and independent-origin tests. No new service, credential or product direction is required.

## 2026-11-18 — Studio and patched browser Engine integration

- Connected Home Studio to the existing attributed Engine, exact named public development network and deterministic mock adapter. Both reception/planning and Home builder execute before host schema validation and explicit proposal review/apply.
- Added strict brief/settings bounds, default-deny per-run public-origin approval, separate contact review, error/timeout/cancel/restart handling, content-safe status tracing and editor revision protection across edits/imports.
- Negative testing exposed upstream optional-tool denial continuing the run. Studio now aborts the entire run on refusal so denied capability access cannot appear as a successful proposal. Separate MCP discovery denial and cancellation are tested without contacting MCP.
- Added a test-only second-origin artifact server at 4182; built caller UI at 4173 loads the exact named network after approval. Verified CORS refusal, all-redirect rejection, duplicate/unknown-field rejection, no brief/body/key/cookie forwarding and no contact on refusal. This is local HTTP evidence, not a deployed HTTPS interoperability claim.
- Fresh results: lint, typecheck and production build passed; 12 Node domain/adapter tests passed; 24 Studio browser tests passed (16 integration + 8 M1 regression); existing 51 runtime browser tests passed, including MCP transport, synthetic router isolation, schema/size negatives, redirects, deadlines and cancellation. No tests skipped. Chromium is the only browser tested.
- Initial UI launch used Playwright's absent managed browser and failed before execution; reran using the documented system Chromium. Early assertions were corrected to the actual status text and a valid import fixture. Final full suites passed. No paid service, new dependency, credentials or real inference was used. Headless WebGPU API was present but adapter unavailable, and no model was downloaded.
- Visually reviewed the local round-trip screenshot at docs/evidence/studio-agents-local-round-trip.png; it shows synthetic script-like text rendered literally. This is local evidence, not a public deployment screenshot.
- README, integration boundaries, attribution patch notes and conformance matrix updated. Deployment outcome is recorded separately after the main push. Real inference, full-profile compatibility, model-selected grounded capability in Studio, deployed second-origin proof, final submission materials, identity and persistence remain open.

## 2026-11-18 — integration delivery and deployment verification

- Implementation commit `d2d3da6a23bfef598eb43e1069afe594482cffc5` pushed directly to main; remote main SHA matched. Baseline/matrix stage `5594949` was separately committed and pushed first. No force push or overwritten concurrent changes.
- Existing Vercel Git-linked production build `dpl_6enJWAjtUm5HeyiHgrszinxrfr1F` reached READY for the implementation commit. Public URL remains https://ai-agents-tower.vercel.app/ .
- Public browser navigation was attempted with system Chromium and failed at the environment tunnel (`net::ERR_TUNNEL_CONNECTION_FAILED`); online UI behavior could not be verified. READY and successful local tests are recorded separately. No credentials or security changes were introduced.
- Updated README, deployment instructions and matrix to describe the integrated mock app rather than the old M1-only deployment. This final documentation stage uses diff review and git diff --check; no unnecessary application retest is claimed.
- No decision is required to use the mock draft workflow. A real default inference route still needs a separately authorized provider/local-model plan with demonstrable zero paid fallback and judging capacity. Full-profile and historical-version questions need official clarification; a deployed independent HTTPS demo and final submission evidence remain future gates.

## 2026-11-18 — public product copy review

- Read current README, AGENTS and latest integration records. Started on clean main, synchronized with origin/main at 519d598; no existing changes were overwritten.
- Rewrote the full Home Studio surface: headline/subtitle, brief instructions, actions, permission wording, role/status messages, proposal review/apply, editor/preview, import/export, default example and page metadata. Product copy targets the enduring public goal and available user actions.
- Consolidated simulated-execution and memory-only data status in the footer. Removed repeated development badges, disclaimer paragraphs and a selector with no usable alternative. Retained precise authorization, replacement/conflict and failure information at the relevant action. No false save/publish/real-inference behavior was introduced.
- Proposal review now renders safe text headings/paragraphs with textContent instead of requiring users to inspect raw JSON. Import/export contracts and execution safety remain unchanged.
- Updated existing browser assertions for new labels and footer information. Final results: lint, typecheck, 12 unit tests, production build and all 24 Studio browser tests passed. An initial assertion used the wrong capitalization for a tool error; the resulting duplicate error phrasing was also shortened before the final successful full run.
- Visually reviewed desktop and mobile output; no horizontal overflow. Evidence: docs/evidence/public-copy-desktop.png and public-copy-mobile.png. Existing runtime safety code was unchanged; no fresh result is claimed for the separate 51-case runtime suite.
- Updated README and standing public-copy instructions in AGENTS.md. Commit/push uses authorized main workflow and the existing Git-linked deployment. No new dependency, service, credentials or paid action.

## 2026-11-21 — open Agents Tower homepage

- Read current project instructions, README, development history and code; clean main at c02dbff matched origin/main after fetch. No prior changes were overwritten or processes interrupted.
- Inspected the reference homepage's live document and reported design tokens through the Firecrawl design skill. Captured structure includes the welcome, broad illustration, community sections and covenant. The returned reference screenshot could not be downloaded/opened through this environment's tunnel; no pixel-level fidelity claim. DESIGN.md records observed versus chosen values and limitations.
- Used the owner's attached character concept as an image-generation reference to produce the derivative default hero; optimized WebP assets served locally. The original attached file was not mounted. docs/ASSETS.md records provenance and sizes; the generated source remains preserved outside the repository. No Muse resident data or artwork imported.
- Implemented an English public homepage with authored Tower logo, explicit all-agent welcome, warm editorial hero, three inclusive principles, native shared-values accordion, responsive navigation and Studio introduction. Existing default-deny generation/review/edit/preview/import/export workflow remains intact. No fake neighbors, residency, feeds, persistent content or paid service added.
- Fresh validation: lint/typecheck/build passed; 12 unit tests passed; all 26 browser tests passed, including 2 new homepage checks for real local artwork, anchor navigation, accordion, consent default and mobile overflow. Existing 24 Studio regression tests passed. Runtime sources/fixtures were unchanged, so no fresh result is claimed for the separate 51-case suite.
- Visually reviewed full desktop and mobile screenshots. Replaced unsupported arrow glyphs with inline SVG before the final complete browser run. Evidence: docs/evidence/tower-home-desktop.png and tower-home-mobile.png.
- README, DESIGN.md and asset provenance updated. Main push uses existing authorization and the configured Vercel Git integration; deployment metadata and any public-browser result are checked separately.

## 2026-11-21 — homepage production content verification

- Pushed implementation 9feef36 to main and verified matching remote SHA. Existing automatic Vercel deployment dpl_J5NUcRniKFxh2W5c4EL6wsS62Wh8 reported production READY.
- Followed the Vercel deployment inspection skill using connected read-only metadata; no deployment API, credential or plan/security changes.
- Fresh Firecrawl read of https://ai-agents-tower.vercel.app/ returned HTTP 200 and current homepage title, all-agent welcome, hero image URL, shared-values copy and initialized Studio. This is public content verification, not public interactive or screenshot-pixel verification. Local browsers/screenshot download still face proxy limits.
- Updated obsolete public-read limitation in README and recorded bounded evidence in DEPLOYMENT.md. This documentation-only completion uses diff review/git diff --check; application tests are the successful implementation-stage runs rather than invented fresh results.

## Inventory and backlog reconciliation

- Reviewed current main, README, milestone plan, conformance matrix and delivery history in response to the owner's inventory/planning request. Working tree was clean at 0f5c8b0.
- Corrected stale milestone statements that product integration/deployment had not occurred. Added docs/TASKS.md with bounded completed evidence, T01–T09 priorities, acceptance criteria and genuine owner authorization gates.
- No implementation, service, model call, credential, persistence or publication added. Existing test counts are historical verified runs, not fresh checks for this documentation-only stage.
- Validation: reviewed documentation against implementation history and git diff --check. Authorized completion workflow remains main commit/push without force.

## T01 — runtime compatibility reconciliation

Rechecked rules/current specification, pinned the Profile 0.3 path commit/blob, and compared its five-line delta with the retained submission-start baseline. Added explicit local-subset acceptance/rejection tests and compatibility documentation; updated matrix/README. Historical authority and full official schema acceptance remain unresolved, not falsely completed. Started from clean synchronized main 6aed49a.

T01 validation passed: lint, typecheck, all 17 unit tests and git diff --check. No browser or real-inference run was needed/claimed for this boundary-test checkpoint.

## T02 — native runtime validation action

Registered the pure read validator using the existing attributed ActionRegistry and Engine.submitActions APIs. The builder proposes and reception relays a schema-bound action; the controller requires exact candidate equality, actual successful receipt/execution and final HomeBundle parsing. Added malformed/missing/substituted/denied/error/timeout/cancel tests. Initial run permission now describes local validation; external permissions remain separate. No vendor JS, credentials, storage or service change. Fresh lint/typecheck/build passed; 20 unit and 33 browser tests passed. Inference remains mock and full capability interoperability is not asserted.

## T03 — keyless transport preparation

Added a bounded exact-origin keyless OpenAI-compatible adapter, kept disconnected from public Studio and its mock-only runtime gate. Four actual-local-HTTP fixture tests cover format/tools/no credentials, errors, truncation, unknown calls, redirect refusal, cancellation and deadline. Scripted responses do not establish real inference. Lint/typecheck and 24 unit tests passed at this checkpoint. No installed/configured authorized model route, weights download, credential or provider request; T03 actual-inference acceptance remains blocked.

## T04/T05/T08 preparation — independent caller and evidence tooling

- Packaged the existing browser runtime as an independent static caller, preserving default-deny source consent. Local 4190 caller→4173 source test passed, including exact named files, zero contact on refusal and no content POSTs to the source. Restored default package target to public HTTPS after local testing. No second origin deployed or CORS/security setting changed.
- Added production-specific tests. Attempted the first live round-trip: failed before UI with ERR_TUNNEL_CONNECTION_FAILED. Other production cases not run. Cloud Browser could select Chrome but tab creation failed with "Browser Use could not read requirements." Marked T04 deployed evidence and T05 as blocked, not passed.
- Added a local package-license metadata inventory (149 entries), English submission draft, under-two-minute final video plan and explicit license/rights gates. No license grant, registration, upload or submission.
- Recorded local MOCK-only silent walkthrough; 1 recording test passed, duration 8.28 seconds, sampled 2/5/8-second frames visually inspected. It is not a real-inference/final narrated submission clip. Initial Playwright FFmpeg download was blocked (403 Domain forbidden); reused the existing system FFmpeg through an isolated temporary cache, with no installed-package or system/security changes.
- Generated artifacts are ignored by Git and ESLint, like dist; authored source remains linted. No actual private user data, keys, service purchases or production persistence added.

## T06/T07 — local private/public persistence core

Implemented a server-only SQLite domain reference with a mandatory trusted authenticator boundary (unconfigured/failed verification fails closed), derived owner scope, strict commands, durable owner/key/operation/input-hash receipts, atomic rollback, revision guards and separate reviewed public snapshots/unpublish. No frontend import, API route, production auth/database or UI save/publish capability. Nine synthetic local tests passed, including two tenant/client instances, concurrent stale-write protection, receipt rollback and actual close/reopen recovery. Production identity, storage hosting, retention, sessions/CSRF and HTTP/CDN behavior remain gated; no credentials or services were created.

## P0/P1 verification checkpoint

- Final local checks: lint, typecheck and build passed; 33 unit tests passed, including nine server-core cases. Earlier in this same execution stage all 33 current Studio browser tests passed, the independent-caller test passed, the mock recording test passed, and the complete 51-case runtime browser suite was rerun and passed. No real model was invoked.
- Confirmed node:sqlite/server code is absent from the client build. Generated artifacts are excluded from lint/Git; production source remains checked. Project dependencies were not expanded.
- The one attempted public round-trip failed before interaction at ERR_TUNNEL_CONNECTION_FAILED; other prepared production cases were not run. Cloud Browser tab creation also failed. These are explicit failed/blocked checks, not green tests.
- T01–T08 status now distinguishes implemented software/local evidence from actual external acceptance gates. Full P0/P1 is not declared complete. No product replanning, credentials, service creation, project license, additional deployment/origin or final publication was invented.

## Literal JSON/protocol-marker preservation

- Reproduced parseAgentResponse changing literal tool_response tags inside a valid HomeBundle JSON string. This violated content preservation even though script execution was already blocked.
- Patched the attributed parser to preserve opaque JSON, recognize fenced presentation JSON with quote/escape-aware boundaries, unwrap only complete outer protocol envelopes, and leave malformed JSON-shaped data unrepaired for host rejection. An initial focused test also exposed inner backticks prematurely closing a real presentation fence; the final parser handles that case.
- Added three unit tests plus a full Studio agent/action round-trip test. Updated source provenance to seven recorded Tower patches, without changing the upstream baseline SHA or license.
- This is a runtime/content fix, not real inference, private persistence activation, publication or conformance certification. Final validation follows below.

Literal-preservation final verification: lint/typecheck/build and all 36 unit / 34 Studio browser / 51 runtime browser tests passed; independent-caller browser check also passed on the final parser. Restored the ignored interop package to its public HTTPS source. The earlier mock development clip remains preserved separately; no final/real video claim. All production/auth/model/license gates remain unchanged.

### Restricted reviewer entry and trusted adapter wiring — 2026-11-21

- Started on clean main at d5db85edc0d0929489a035cd6718ecd1f3becb5c. Fetched origin/main; no intervening remote commits or pre-existing worktree edits were found. Continued in the same checkout, without another worker or environment.
- Added the public Try the demo entry, explicit Simulation/Live demo selection, fixed fictional brief, fresh consent, exact local source guard and memory-only restoration of the visitor's brief/source. Shipped reviewer/status.json remains disabled. No server gateway, provider activation, key, account or environment change was added.
- Reused the existing keyless transport, two-role browser loop and actual validation dispatcher. Added a strict trusted caller-origin injection gate and visible validation receipt; review/apply/export remain separate. Updated upstream patch provenance and attribution. A local validation receipt does not attest model execution.
- Added one unit test, eight Studio browser tests and one runtime browser test. Successful scripted service fixture performs three calls; refusal, absent consent, disabled service, HTTP 429/503, malformed generated schema, transport failure, deadline/cancel/restart and tampered fixed input/source fail explicitly. Fixtures send no editor sentinel/key/cookie and persist no browser content. They are not real inference.
- Re-read official rules and immutable Profile 0.2; retain the historical-version inference caveat. Updated conformance matrix, tasks and provider research. OpenRouter free-only routing is a candidate, not a confirmed authorized account/quota/capacity. Gemini unpaid global judging limitations and owner-operated Ollama gaps remain explicit. Vercel metadata-only environment listing returned 403; no CLI is installed, no secret-value read or bypass was attempted.
- Validation: lint/typecheck/build passed; 37 unit, 42 full Studio/browser, 52 runtime/browser and 1 independent local caller checks passed. After the small control-alignment styling adjustment, build and all 10 affected reviewer/landing browser checks passed again. Local scripted screenshot was visually inspected; it is neither production nor real-model evidence. Interop package restored to the public HTTPS source; no second site deployed. Existing mock recording preserved.
- Public normal-path acceptance is prepared for the disabled reviewer entry. Deployment and public readback follow separately; READY must not be equated with interaction acceptance. No inference weights were run. P0 remains incomplete, pending the one provider authorization decision plus secure gateway/real acceptance and other applicable interoperability gates. Private auth/DB, licensing and submission are untouched.
