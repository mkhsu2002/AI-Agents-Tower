# M2 browser runtime feasibility spike — MOCK ONLY

This is a bounded local experiment, separate from the M1 Home Studio. It uses a pinned, locally patched nsdeploy Engine in a real Chromium browser. **All inference is deterministic scripted SSE. No real model was called. M2 is not complete.** The local MCP validator executes real deterministic domain code; it is not a production endpoint.

## Run

From the repository root, using Node >=22.12 and the existing npm dependencies:

```sh
npm ci
npm run spike:m2
# Open http://127.0.0.1:4180/spikes/m2/site/
# Stop with Ctrl+C.
CHROMIUM_PATH=/usr/bin/chromium npm run test:m2
```

Stop the manual server before running the test command. Tests own ports 4180/4181 and refuse to reuse an existing server. No new package, account, model, credential or service installation is required. For a Playwright-managed Chromium, omit CHROMIUM_PATH. The Node strip-types flag supports importing the existing domain validator without a separate server build.

## What actually runs

Origin A (`127.0.0.1:4180`) serves application-owned harness code and the recorded Tower-patched runtime modules. Its caller agent contacts origin B (`127.0.0.1:4181`) only after an explicit Allow click. B supplies a manifest entry named `tower-home-builder` and resolved JSON network data. The Engine instantiated in A's browser runs B's `reception` agent, which delegates to `home_builder`. That agent uses the runtime's MCP client to initialize, discover and call B's read-only `validate_home_bundle`. The MCP fixture calls the M1 `parseBundle` validator. All agent decisions are supplied by A's **scripted mock** SSE endpoint, not LLM inference. The peer's deliberately unusable router URL must never be called.

The two Node servers provide artifacts, canned inference and validation; they do not orchestrate agents. Test requests to B originate from A's browser frame. These are real distinct local origins, not separate production HTTPS sites. No HomeBundle is applied to the M1 editor or saved. No public artifacts are published. See [feasibility findings](../../docs/M2-FEASIBILITY.md).

## Upstream source boundary

21 ES modules, plus upstream Apache-2.0 LICENSE.txt, are under `vendor/`. Seven modules now have documented Tower patches; see [PATCHES.md](vendor/PATCHES.md). `vendor/provenance.json` retains each original blob SHA and records a patched blob SHA for modified modules. `verify-vendor.mjs` checks the expected bytes and syntax of each patched module before running. The original comments and attribution remain intact. Root project licensing remains undecided; this third-party subset retains its own license.

Only the Engine's static dependency closure is included. The upstream UI, boot/BYOK storage helpers, launcher, automatic tool/dependency installers, LangChain bundle and executable-tool worker are not installed or used. Optional `enableLangChain()` and coded-tool invocation are unsupported in this subset. The fixture's network never declares executable tools, action modules or link slots. Do not treat this packaging as a complete nsdeploy installation.

An initial Vite experiment tried to resolve an unused dynamic LangChain bundle at transform time. The final harness serves native ES modules from a small explicit static whitelist, requiring no multi-megabyte optional bundle. The later consent and validation patches are documented separately. This is feasibility evidence for the manual browser loop; production bundler/CSP/packaging decisions remain open.

## Tests and boundaries

The 51-test Chromium suite covers two peer agents plus caller, consent before contact and decline, exact network mismatch, missing tool references, CORS refusal, invalid generated HomeBundle, provider error, synthetic credential routing/private-context isolation, default-deny decisions, hook errors, duplicate-name rejection, normalized name collisions, independent MCP discovery/call consent and cache reapproval, keyless real-route refusal, and budget primitives. Every browser request is limited by the test harness to the two loopback origins. Real credentials are never read or used. Synthetic canaries are test strings, not generated credentials.

Historical characterization results are preserved at the original spike commit. Current tests verify the three documented local fixes. Strict local schemas, all-redirect rejection and bounded cancellation are now implemented; see [runtime boundaries and enforcement limits](../../docs/M2-RUNTIME-BOUNDARIES.md). No real inference, production MCP/auth, hard real-time guarantee, HTTPS deployment, cross-browser support or competition certification is provided. The UI and trace explicitly label mock execution, and model traces report `mock:true`, `verifiedReal:false`.

Historical [spike results](evidence/local-results.json) include test status, source hashes, mock-only boundary events and WebGPU capability. The [screenshot](evidence/runtime-mock-only.png) is from this local scripted fixture. Historical [hardening results](evidence/consent-validation-results.json) and [updated screenshot](evidence/runtime-consent-validation.png) are separate snapshots. Current [boundary results](evidence/runtime-boundaries-results.json) and [screenshot](evidence/runtime-boundaries.png) are separate. Evidence regeneration is explicit; see docs/M2-RUNTIME-BOUNDARIES.md.

The 2026-11-21 reviewer checkpoint adds a host-only trusted same-origin keyless adapter injection gate in the patched Engine. This does not grant authority through imported network data and does not enable a provider. Public Studio ships with live reviewer status disabled. Seven patched modules remain attributed in vendor/provenance.json; the Engine's modified blob was updated. See ../../docs/REVIEWER-DEMO.md for fixture scope and activation gates.
