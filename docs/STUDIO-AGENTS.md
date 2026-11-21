# Home Studio two-agent integration

Implemented 2026-11-18. **Development mock only. M2 is not complete and competition conformance is not claimed.**

## Actual flow and state

1. User enters a visible brief (at most 1,500 Unicode code points / 6,000 UTF-8 bytes), selects the exact public `tower-home-builder` source and explicitly approves its origin. The checkbox starts unchecked, is consumed for each run and is reset on source changes. Invalid input or missing approval causes no network request.
2. The caller loads bounded, strict mock settings from its own `/development/mock-settings.json`. It constructs the Tower-patched nsdeploy Engine with a host-owned model adapter, safe status-only tracing and a finite operation scope.
3. Engine fetches the manifest and exact named network, validates the strict local JSON profile and executes `reception` → `home_builder` → `reception`. The deterministic mock adapter emits a real runtime tool call; this is not model reasoning or a progress animation. Both roles must complete.
4. Host code uses the shared HomeBundle parser/schema to validate the final result. Invalid versions, fields, size, malformed JSON or incomplete roles stop the run. Model claims of validity are ignored.
5. The validated proposal is staged separately from the editor. The user explicitly chooses **Apply draft**, then can edit, preview and export/import with the original M1 controls. Applying revalidates and checks the editor revision. Edits/imports made during or after generation cannot be silently overwritten; discard and regenerate after a conflict.
6. Failure, refused permission, timeout or cancellation clears the proposal, retains the editor and requires an explicit restart. No automatic retries or success fallback. Cancel also aborts pending settings/network/consent work; stale completion cannot restore a cancelled proposal.

Only public files are fetched in the normal flow. Briefs, proposals and drafts remain in tab memory; no browser storage, account, database, Tower save or publication is added. Export creates a user-requested local file. Reload/close/crash loses in-memory content. Text and contact-review details use `textContent`/form values, never imported HTML. Runtime trace callbacks discard prompts, tool arguments/results and exception details; the Studio shows role/status messages only. No credentials, provider endpoints or private context are accepted by the model configuration.

## Model boundary and deliberate limits

`src/agents/model.ts` defines request/completion and ModelAdapter contracts. Only the deterministic `mock` implementation is enabled. The Engine's injected-adapter path requires an explicit mock flag; neither choosing a non-mock name nor changing settings enables real inference. The page footer states that responses are simulated; there is no real-provider selector, and `mode: real` settings produce an explicit unconfigured error without a provider request.

Mock configuration accepts only mode/scenario/timeoutMs/delayMs. Default is success, 10-second runtime scope and 120ms per completion; configuration loading has its own 10-second scope. Tests override the static JSON response to exercise model-error, tool-error, unsupported bundle and stalled-model cases. These scenarios are test fixtures, not public query flags or arbitrary endpoint configuration.

No existing authorized, zero-cost model route was identified. No provider request, registration, key creation, secret transfer, model weight download or paid action was attempted. The current runtime regression again found WebGPU API present but no usable headless adapter. Existing [inference research](M2-FEASIBILITY.md) remains candidate research: browser-local models need actual device/license/download/tool tests; an owner-funded or free-tier server route still needs explicit service authorization, private key handling and capacity/privacy proof. This stage does not promise reviewer inference availability.

Future adapter acceptance requires real tool-calling evidence, cancellation/deadline propagation, output bounds, deliberate model/download caching consent where relevant, no paid fallback, secret-safe routing, and full end-to-end review. The shared interface is preparation, not proof of a working real provider.

## Origins and runtime safety

The default manifest and network are static assets under `public/agents/`. The `browser://mock` manifest router is a clearly marked Tower development extension, only allowed when mock=true; it is not a real default router or general official-profile implementation. Application code supplies the adapter; remote JSON cannot instantiate code or select a provider. Same-origin artifact enforcement, strict schema/duplicate-name validation, allowlisted references, limits, redirect rejection and caller-router isolation remain active.

The Studio's separate contact panel delegates to Engine's default-deny consent hook and shows exact origin, phase, endpoint and proposed request. Each peer MCP discovery/call still needs fresh approval. Studio additionally stops the entire run on refusal, even where the upstream engine would skip an optional tool. Cancellation dismisses the prompt and late consent cannot resume execution.

All redirects are rejected, including same-origin ones, rather than following an unapproved hop. This is conservative and does not implement authorized redirect relocation. Deadlines/cancel bound awaited operations and abort HTTP reads; browser suspension, forced process termination and undoing an already received remote action cannot be guaranteed. Remote effects can be uncertain; no retry is automatic. See [runtime boundaries](M2-RUNTIME-BOUNDARIES.md).

## Independent-origin evidence

`tests/peer-server.mjs` serves the checked-in public manifest/network at B `http://127.0.0.1:4182`. Root UI tests use built caller A `http://127.0.0.1:4173`. The test runs the exact named network inside caller A after approval, checks B receives only public artifact GETs with no brief/body/Authorization/Cookie, and checks no contact on refusal. CORS refusal, unknown fields, duplicate names, redirects and separate MCP discovery denial/cancel fail closed. The fixture never stores or logs brief bodies.

This proves bounded local second-origin loading, not independently deployed HTTPS interoperability. The existing 51-case spike separately proves nested caller → peer two-agent composition and real local MCP initialization/list/call, with scripted SSE and synthetic key isolation. The default Studio network uses host validation; it does **not** expose a model-selected registered site action or deployed MCP endpoint. Combining these bounded results does not establish real-model competition compliance.

Next gates: agree full official-profile compatibility tests, test a genuinely available default real model, integrate an explicitly scoped grounded capability, host a second independent HTTPS caller/source with intentional CORS, then record browser video and reviewer-access evidence. M3 identity/private persistence and M4 public snapshots remain separate later work.

## T02 update

The earlier host-validation-only description is superseded by [STUDIO-VALIDATION-ACTION.md](STUDIO-VALIDATION-ACTION.md): the host registers a native runtime read action, the mock agents propose/relay it, and a matching successful execution receipt is required before final host validation. No real model or general remote action discovery is claimed.
