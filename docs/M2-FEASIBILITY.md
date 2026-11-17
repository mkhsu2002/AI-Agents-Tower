# M2 feasibility findings (historical baseline)

Date: 2026-11-17. M1 baseline commit remains `4eff2a7354eaed106f2bb7f0d3af37f67d80b4dc`. Work is isolated on `spike/m2-runtime-feasibility`. **M2 remains incomplete: no real inference and no deployment.**

> This document records the original spike at `d4eb3ff1a3bbb0c3e82cb799f9e859c7268220ae`. The subsequent [consent and validation hardening](M2-CONSENT-VALIDATION.md) fixes the first three observed gaps in a documented local runtime fork. The original 11-test evidence remains preserved; current source is no longer all unchanged upstream.

## Decision

The pinned nsdeploy manual browser Engine is technically feasible for Tower's two-agent, named cross-origin workflow. Adopt it only after boundary fixes, inference selection and additional tests. This spike adds no runtime or model connection to the M1 editor. The separate [local harness](../spikes/m2/README.md) can be reproduced without accounts, new dependencies or credentials.

Source: [nsdeploy at 4e4cb36731ae71cbbb905d3fe98f26299ac3b4f2](https://github.com/cognizant-ai-lab/nsdeploy/tree/4e4cb36731ae71cbbb905d3fe98f26299ac3b4f2/nsdeploy/runtime). The 21 statically imported Engine modules are unchanged, Apache-2.0 licensed and verified against upstream Git blob hashes. The license is included and hash-verified too. This runtime candidate remains separate from the [submission-start specification baseline](SPEC-BASELINE.md).

## Observed browser behavior

| Check | Actual result | Evidence limit |
| --- | --- | --- |
| Two origins | A port 4180 fetches B port 4181 from A's browser frame | Local HTTP origins only; no production HTTPS/CORS deployment |
| Consent before peer contact | Zero B requests while dialog is pending; Deny produces zero B requests | Harness attaches an explicit hook; upstream default is unsafe for unattended use |
| Named network | Exact `tower-home-builder` entry loaded; a manifest containing only another name fails | No full manifest schema/version/integrity validation proof |
| Two collaborating peer agents | Trace order: caller → reception → home_builder; six model transport rounds | Routing and delegation are driven by scripted SSE, not real reasoning |
| Grounded capability | Real browser MCP initialization/list/call reaches local shared HomeBundle validator | Minimal read-only stateless fixture; no production auth, session or write endpoint |
| Validation errors | Invalid generated bundle yields MCP tool error/UNSUPPORTED_VERSION | UI says run finished/inspect errors, never home created |
| Peer inference isolation | Every model request goes to caller A; peer's router never used | No real provider/network credential was involved |
| Synthetic key isolation | Canary bearer appears only on six A router requests, never B or prompt bodies/trace | Transport regression proof with synthetic strings only |
| Private context | Undeclared synthetic private context does not reach B | Not a comprehensive sly_data or prompt-injection audit |
| Failure paths | Wrong name, invalid reference, CORS and scripted provider error are explicit | Broader redirect, malformed manifest and resource-limit matrix remains open |
| Budgets | Invocation/count/deadline helper checks stop exhausted budgets | Does not prove hard timeout/cancellation of an in-flight fetch |
| Real inference | Not attempted | No model weights, account, credentials, paid call or external provider request |
| WebGPU capability | API present; requestAdapter returned null in default headless Chromium | No usable GPU adapter here; no WebLLM model downloaded or run |

The local test server is a fixture, not an external Dot executing the network. Agent orchestration runs in the browser using upstream Engine/runAgent; the Node processes only return artifacts, scripted SSE and validator results. That verifies the execution mechanism while leaving the real-model requirement open. The pinned [rules](https://cognizant-agenticweb.devpost.com/rules) still require a working public product and free reviewer access. This local experiment is not submission evidence of those outcomes.

## Runtime gaps that block direct production adoption

1. **Consent defaults to allow.** `Engine.requestConsent` permits contact when no hook is installed, and falsey hook results also permit it. Attach a mandatory, fail-closed Tower adapter before any run; only explicit Allow may proceed. Add cancel/unmount/error tests. The spike UI always resolves an explicit Allow or Decline.
2. **Peer-own MCP gets no fresh consent.** The successful test sees one network consent; the runtime compares MCP origin against the peer network base B and skips MCP prompts for B's own MCP, even though execution is in browser A. Inspect/clarify the intended policy and enforce browser-origin/per-hop discovery and call consent before a production integration. Do not broaden remembered approvals silently.
3. **Duplicate names pass validation.** An actual browser test supplies two agents named `duplicate`; `validateNetwork` returns no errors. Tower needs a strict data-only network/manifest preflight, duplicate/reference/front-agent checks and size/depth limits before calling the Engine. No upstream patch was made in this spike.
4. **Keyless real routes are blocked.** `LlmClient.chat` refuses a non-mock route without a non-demo key before HTTP, including a local keyless inference server. A tested adapter is needed for site-funded or local inference; do not supply an owner provider secret to the browser or relabel a mock as real.
5. **Boundaries remain unproven.** Source has cooperative budget checks between calls; this does not establish an in-flight network deadline. Redirect consent, executable-definition rejection, artifact/schema bounds, response limits, prompt-context isolation, MCP authorization, hard cancellation and a full cross-origin budget matrix need tests. Avoid dynamic links/storage and executable peer code initially.
6. **Trace flags are evidence aids only.** Mock header/model checks correctly label this fixture. Conversely, `verifiedReal` derived from a non-mock label/model name cannot independently attest that a backend executed a model. Real-inference evidence must include a controlled provider/local-model run and usage/model/timing records without secrets.

## Realistic free judging inference paths — research only

No path is activated or guaranteed. Public documentation was checked on 2026-11-17; future availability and terms may change. Do not require judges to buy credits or expose their keys.

| Candidate | Why plausible | Blocker and next proof |
| --- | --- | --- |
| Publisher-managed free-model API route | OpenRouter documents `openrouter/free` and free model variants, including selection for tool calling. A future Tower server could keep an owner-authorized key private and allow reviewers to use a bounded default route without their own account. | Requires owner-approved credential/service setup later, server hosting, zero-price allowlist/no paid fallback, quota and privacy controls; no key or calls tested. Free capacity is rate-limited/variable and may be insufficient for judging. |
| Organizer Otari credits | Rules say access information is provided upon registration; could fund reviewer use if terms and balance permit. | No registration, balance, eligibility, expiry or ongoing availability verified. Credits are not proof of a free default route. Do not infer entitlement from marketing. |
| Browser-local WebLLM | WebGPU inference avoids per-token provider billing and reviewer API credentials. | Headless browser has no adapter here. Model download, memory, model license, tool-calling quality, cache design/consent and cold-start accessibility remain untested. Requires a separate inference adapter; API shape similarity is not drop-in integration. |
| Owner-hosted local open-weight model | Could offer a free reviewer-facing route backed by existing hardware, independent of reviewer GPU. | No hardware/model/service provided or tested. Hosting, capacity and uptime have real resource costs; owner authorization and actual end-to-end tests required. |

Sources: [OpenRouter free router](https://openrouter.ai/docs/guides/routing/routers/free-router), [API authentication](https://openrouter.ai/docs/api_reference/authentication), [rate limits](https://openrouter.ai/docs/api_reference/limits); [rules on Otari access](https://cognizant-agenticweb.devpost.com/rules); [WebLLM overview](https://webllm.mlc.ai/), [first-load download behavior](https://webllm.mlc.ai/docs/user/basic_usage.html). These support candidate research, not an inference availability claim.

Planning estimate from the fixture: one caller handoff + two Tower agents + one validation tool uses six model requests (tool-selection and return round for each agent). A real model can use more; budget for an explicit maximum, failures and concurrent reviewers rather than dividing a daily free quota by one happy path. No precise live quota is assumed. Most credible next route to evaluate is an owner-managed, strictly free-model-only server route; it still needs explicit service authorization and capacity proof. Browser-local inference remains an optional fallback investigation, not today's default.

## Next bounded implementation steps

1. Add strict network/manifest parsing and a mandatory browser-origin consent adapter; test the three observed gaps without modifying M1 persistence or import semantics.
2. Choose an inference path with the owner, then test one actual model on the same two-agent/MCP workflow. Retain exact model/version, usage, latency, failure and zero-cost evidence; prohibit paid fallbacks. Do not create credentials or connect a service in this spike.
3. Add finite request sizes and actual abort/deadline propagation, cancellation/unmount behavior, per-hop policy, redirects, error-to-UI mapping and a two-origin conformance matrix.
4. Only after those pass, connect validated, user-reviewed output to M1 as an unsaved draft. Authentication, private persistence and public snapshots remain M3/M4 work.
5. Deployment/HTTPS/free judging availability, project licensing and official historical baseline confirmation remain separate gates. No push, PR, deployment or publication was performed.

## Reproducible verification record

Final local verification: **11/11 M2 browser tests passed**, no skipped/flaky/unexpected results; **8/8 M1 domain tests and 8/8 M1 UI tests passed**. ESLint and TypeScript checks passed, including the spike TypeScript test/config files. Vite built the unchanged M1 JS/CSS asset hashes (`index-Bf11-T4K.js`, `index-DLi3SecT.css`); no spike runtime is included in that product build. `git diff --check` passed. No npm dependencies were added or upgraded.

Committed evidence: [machine-readable results and boundary trace summary](../spikes/m2/evidence/local-results.json), [mock-only screenshot](../spikes/m2/evidence/runtime-mock-only.png), and [upstream source provenance](../spikes/m2/vendor/provenance.json). The result file includes source SHA-256 values, browser version, WebGPU capability, each test title/status and selected runtime events. It is a local verification snapshot, not a production or real-inference receipt. Full synthetic traces are available through Playwright attachments/JSON reporter when rerunning.

To regenerate the evidence explicitly after a successful run from the repository root:

```sh
CHROMIUM_PATH=/usr/bin/chromium node node_modules/@playwright/test/cli.js test --config spikes/m2/playwright.config.ts --reporter=json > /tmp/tower-m2-results.json
CHROMIUM_PATH=/usr/bin/chromium node spikes/m2/record-evidence.mjs /tmp/tower-m2-results.json
```

The recorder refuses reports with unexpected, flaky or missing tests. `npm run check` remains the M1 check command; run `npm run test:m2` separately for the isolated spike. The upstream files are excluded from Tower lint because they are unchanged third-party source and instead checked byte-for-byte; no lint exclusion was added for Tower's own spike files.
