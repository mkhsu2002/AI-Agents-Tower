# M2 consent and network-validation hardening

Date: 2026-11-17. This continues the local spike at `d4eb3ff1a3bbb0c3e82cb799f9e859c7268220ae`; M1 remains at `4eff2a7354eaed106f2bb7f0d3af37f67d80b4dc`. **M2 is still incomplete. Inference is scripted mock only.** The M1 Home Studio is not connected to this runtime and retains its memory-only draft behavior.

## Implemented behavior

- **Explicit default-deny consent.** Only the literal `allow` decision permits a peer/MCP contact. Missing hooks, empty/null/boolean responses, cancellation, unsupported `always` responses and rejected hooks all decline. A failed hook does not poison later queued decisions; its private exception detail is not copied to the trace. There are no remembered origin-wide grants in this local fork.
- **Duplicate names fail before indexing or execution.** AgentNetwork rejects duplicate names after upstream configuration normalization, including whitespace trimming and configured name substitutions. It also rejects an invalid tools array and empty names. A duplicate front agent or helper in a fetched peer stops that peer before any peer model/MCP call; a duplicate in the top network stops before any model call. Unique valid names still execute the two-agent flow.
- **Peer MCP access requires separate approvals.** Relative references resolve against the publishing base, while permission checks compare the target with the actual browser origin. A service owned by peer B remains external when its agents run in caller browser A. Network approval does not approve MCP discovery or invocation. Discovery approval precedes initialization/tools-list HTTP; tool-call approval then shows the full origin, endpoint, exact tool name and argument JSON. Declining discovery sends no MCP request; declining invocation sends no tools/call.
- **Cached sessions do not carry consent forward.** A subsequent run needs a fresh network grant even if the peer session/client is already cached. The UI displays each phase independently. Each prompt has explicit Allow and Deny controls; no grant is saved in browser storage.

These are localized changes to the vendored runtime's engine.js, kernel.js and runner.js. They do not modify upstream generated modules or add a provider, credentials or browser persistence. See [patch notice and attribution](../spikes/m2/vendor/PATCHES.md) and [original/patched source hashes](../spikes/m2/vendor/provenance.json). The Apache-2.0 license and original source comments remain. This is a Tower-patched subset, not an unmodified official release or upstream-endorsed patch.

## Automated checks

The focused tests exercise real Chromium network requests across ports 4180 and 4181, with all outbound browser requests restricted to those loopback origins. The deterministic mock still drives delegation; the shared HomeBundle validator executes through a real local MCP transport. No external inference request is made.

Coverage includes missing/empty/error consent hooks with zero peer contact; strict decision normalization and recovery after rejection; pending/denied peer MCP discovery with zero MCP requests; separate call review and denied tools/call; renewed approval after cache reuse; duplicate top/front/helper names before ambiguous execution; normalized collisions; browser-origin comparison; plus the original named-network/CORS/error, mock-label, synthetic-key isolation and budget-primitive tests. Passing tests document these exact paths, not complete runtime conformance.

Run from the repository root:

```sh
npm run lint
npm run typecheck
npm test
npm run build
CHROMIUM_PATH=/usr/bin/chromium npm run test:ui
CHROMIUM_PATH=/usr/bin/chromium npm run test:m2
```

The M2 command checks 19 unchanged upstream files and three intentionally patched modules against recorded blob hashes. It also syntax-checks the three patched modules. Tower's own harness, tests and recorder are linted; the vendor subtree retains its existing lint exclusion because it contains third-party source. M1 tests/build and the independent M2 server run separately; no new npm dependency was added.

## Evidence snapshots

The original [11-test feasibility record](../spikes/m2/evidence/local-results.json) and [original screenshot](../spikes/m2/evidence/runtime-mock-only.png) remain unchanged as historical evidence. Current hardening evidence is recorded separately in [consent-validation-results.json](../spikes/m2/evidence/consent-validation-results.json), with [updated screenshot](../spikes/m2/evidence/runtime-consent-validation.png). It includes source hashes, test outcomes, the three-step consent sequence and mock-only runtime boundary events.

To explicitly regenerate the hardening snapshot after a successful full run:

```sh
CHROMIUM_PATH=/usr/bin/chromium node node_modules/@playwright/test/cli.js test --config spikes/m2/playwright.config.ts --reporter=json > /tmp/tower-m2-hardening-results.json
CHROMIUM_PATH=/usr/bin/chromium node spikes/m2/record-evidence.mjs /tmp/tower-m2-hardening-results.json
```

The recorder expects all 22 current tests and rejects skipped, flaky, unexpected or missing results. It does not overwrite the historical spike evidence. Source hashes and trace flags aid review; they are not an independent inference or security attestation.

## Remaining gates

Real model execution and a tested free reviewer route remain unimplemented. The [inference research](M2-FEASIBILITY.md) is historical planning, not an activated service. Full manifest/network schema and size/depth bounds, redirect authorization, cancellation of a stalled consent UI, hard in-flight deadlines, broader MCP authentication/credential handling, cross-browser and HTTPS interoperability still need implementation/tests. Direct low-level runtime methods are not a capability security boundary against arbitrary same-page JavaScript; production must expose a deliberate host API and retain strict validation. No arbitrary executable peer tools or dynamic link workflow is enabled by this harness.

The observed duplicate-name gap is closed, but that is not a claim that every malformed or malicious network is rejected. The demonstrated separate MCP prompts do not establish redirect/per-hop policy for every transport variant. Before connecting generated content to M1, retain user review and deterministic validation and map denial/failure accurately to the UI. M3 authentication/private persistence and M4 public snapshots remain planned. No service was purchased, credential created, remote branch pushed, PR opened, deployment or publication performed.

## Observed final results

- M2 Chromium suite: **22 passed**, zero skipped/flaky/unexpected results.
- M1 regression: **8 domain tests and 8 UI tests passed**.
- ESLint, TypeScript, patched-module syntax checks, recorded source hash verification and `git diff --check`: passed.
- Vite production build: passed with the same M1 asset hashes, `index-Bf11-T4K.js` and `index-DLi3SecT.css`. Runtime fixes remain isolated from the Home Studio bundle.
- Captured sequence: `network/call` → `mcp/discover` → `mcp/call`, each naming `http://127.0.0.1:4181` and requiring an independent Allow.
- Every model transport result in the successful run remains `mock:true`, `verifiedReal:false`. No real inference, deployment or browser persistence was added.
