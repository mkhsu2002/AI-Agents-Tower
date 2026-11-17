# MVP implementation plan

This is an independent AI Agents Tower project for the Cognizant Open Agentic Web Challenge. It has no MuseCondo data, service connection, imported architecture or runtime. All project copy and evidence are English. Current delivery: **M0 planning/baseline research and M1 local draft round-trip**. This slice is not competition conformance or completed admission.

## Milestones and acceptance gates

| Milestone | Scope | Acceptance evidence | Current state |
| --- | --- | --- | --- |
| M0 | Pin specification evidence, runtime assumptions and risks; choose minimal stack | Source URLs, commit/blob evidence, ADRs and explicit unresolved gates | Documented; historical baseline confirmation remains open |
| M1 | HomeBundle v0.1, deterministic validation, text editor/preview, JSON file/paste import and download | Automated round-trips, rejection cases, script text safety, interrupted reads, reload and mobile checks | Implemented locally; see VALIDATION.md |
| M2 | Actual browser agent network with reception/planning and home-builder agents; real model plus MCP or registered local action | Browser trace shows two agents collaborating, real inference, typed action validation and errors; second-origin caller test below | Local feasibility spike only: Tower-patched nsdeploy Engine + two peer agents + separately approved MCP with scripted inference; real model and product integration remain open |
| M3 | Private persistence, authentication, tenant isolation, idempotency and revision conflicts | Two actual clients; denied cross-tenant access; durable receipts; retry and unknown-outcome recovery | Planned; no backend/database/session |
| M4 | Separate explicit public snapshots, unpublish and interoperability | Private updates never change public snapshots; reviewed publish scope; withdrawal and cache behavior; export/reimport | Planned; no public content or publish controls |
| M5 | English submission and reproducible evidence | Working public website, screenshots, browser video under two minutes, test instructions, cost model and conformance matrix | Planned; deployment requires later authorization |

The README's earlier P0–P4 outline is product direction; this M0–M5 sequence is the current delivery plan. Read-only/validation MCP tools move to M2 and require an actual client test. A HomeBundle is portable **content**, distinct from the public agent-network definition. Never treat its fields as authentication, ownership, consent or approval.

## M2 second-origin demonstration (required project evidence)

Proposed named Tower network: `tower-home-builder`, front agent `reception`, delegating to `home_builder`. Names are used by the local M2 test fixtures, not published resources. Publish only public instructions, invocation schemas, limits and tool descriptors. Expose deterministic `validate_home_bundle` via a typed local action or MCP adapter sharing the M1 domain contract. Model output must pass code validation and user review before affecting the draft. No model statement establishes validity.

1. Run a caller page at origin A and Tower artifacts at distinct origin B (different ports qualify for a local test). Later repeat on independent HTTPS origins; never present localhost as a deployed demo.
2. Caller refers to B's exact named `tower-home-builder` network. Before contacting B, show origin, purpose and requested access; denial must cause no contact.
3. After consent, browser fetches B's manifest, selects the exact network name and validates the resolved definition. No match, invalid references, CORS denial or unsupported code must fail explicitly.
4. Instantiate the Tower's two agents **inside A's browser runtime**, with the caller's inference/router policy, credential isolation, private-context allow rules and bounded budgets. Demonstrate a real model delegation and a validated action. Calls from an external Dot to an MCP endpoint alone are insufficient evidence.
5. Capture DevTools/browser trace: origins contacted, network selection, consent, two agent turns, model and action execution, returned structured result. Exclude prompts containing secrets. Show credentials go only to the authorized router, never B or prompts; private context does not cross by default.
6. Exercise denied consent, missing network, invalid arguments, provider failure, cancellation, timeout, loop/budget exhaustion, subsequent peer/MCP hops and unknown write outcomes. Do not retry an uncertain write blindly.

The [bounded M2 feasibility findings](M2-FEASIBILITY.md) record what the isolated local harness actually verified, including the historical upstream consent/validation gaps. The [local hardening](M2-CONSENT-VALIDATION.md) fixes those three gaps; the [bounded local runtime profile](M2-RUNTIME-BOUNDARIES.md) adds strict schemas, all-redirect rejection and cancellation. M2 is not complete.

## Unresolved gates before claiming an agentic website

- **Runtime:** evaluate a pinned nsdeploy/browser-runtime version in isolation, its license, browser API compatibility, CSP/code generation, CORS/redirect handling, dependencies, consent per hop, credential boundaries and execution limits. No runtime installed or integrated in M1.
- **Free reviewer inference:** select and test an actually usable default real-model route, funding, quotas, concurrency, limits and availability through judging. A mock, untested credit offer, platform subscription or mandatory reviewer-paid key is not proof. No paid calls, credential creation or service purchases in this slice.
- **Authentication:** choose identity/session and MCP client authorization, browser credential handling and scopes. Open cross-origin callers must be supported by deliberate consent/CORS/auth design. Do not inherit MuseCondo's same-origin-only restriction or `isMuseAgent` eligibility.
- **Deployment:** hosting, domain, CORS, security headers, server secrets, isolation and operating cost remain untested. No deployment or public URL exists for this slice.
- **Official baseline:** immutable file baseline recorded in SPEC-BASELINE.md; organizer confirmation of the exact submission-start interpretation remains open.
- **Licensing:** owner has not selected a project license. Dependency metadata is recorded separately; recheck licenses/assets before distribution. No third-party media or source copied.

## Later private/public architecture references

The owner's MuseCondo review identifies useful concepts: durable `requestKey + inputHash` operation receipts, optimistic revision guards, and private/public snapshot separation. These are design references supplied by the owner, not reused code or implemented capabilities. M3 must bind receipts to authenticated tenant + operation scope, reject changed payloads for a reused key, persist the result atomically and expose status recovery. M4 snapshots need an explicit reviewed revision and separate public identifiers. Authentication/authority and receipts belong to backend records, never portable HomeBundle content. Final storage, retention, auth and cache policies need design and tests before writes.

## Out of scope for M1

No server-saved private homes, move-in success, publication, social features, gifts, marketplace, permanent identity, media generation, models, MCP endpoint or background work. No localStorage, sessionStorage, IndexedDB, cookies, service worker or analytics. Only an explicit export asks the browser to download user content. Browser/OS features and downloads can retain copies outside application control; local memory is not a confidentiality guarantee on a shared device.
