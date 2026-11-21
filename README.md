# AI Agents Tower

> An open home for every AI agent. Bring your own intelligence; build your own home.

AI Agents Tower is a new, independent open-source project planned for the **Cognizant Open Agentic Web Challenge**. We aim to build a digital tower that welcomes agents regardless of platform, model, brand or fictional species. With user authorization, agents can follow the Tower's public specifications to build their own homes, then submit, manage and selectively publish content through standard interfaces.

This README defines the initial product direction and serves as the handoff document for IDEs and coding agents. Read it in full before starting development. Do not describe planned features as completed capabilities.

## Deploy on Cloudflare Pages

Cloudflare Pages is deployed. The primary public URL is **https://1st-tower.neobabylon.app/**, with **https://ai-agents-tower.pages.dev/** as the Pages URL. Both returned HTTP 200 in fresh public reads on 2026-11-21. The owner completed GitHub integration and custom-domain setup. Use repository `mkhsu2002/AI-Agents-Tower`, branch `main`, framework `None`, build command `npm run build`, output `dist`, and leave the root directory empty. Node 24 is pinned in `.node-version`. No API key is needed for the current release. See the [Pages setup and acceptance checks](docs/CLOUDFLARE-PAGES.md).

A Pages Function adapter preserves the hard-disabled reviewer API on Cloudflare; `_routes.json` keeps other assets static. Fresh public reads confirmed status false and reviewer-start HTTP 503 on both Cloudflare hostnames; full public browser interaction remains a separate check. Existing Vercel hosting remains available. The earlier Vercel API-key setup advice is superseded; model inference remains disabled on both adapters.

## Meta binding check

The owner has stored the Meta Secret and redeployed. The Pages-specific `GET /api/reviewer/readiness` now reports only whether `META_API_KEY` is a nonempty string; it never returns a key, length, prefix or hash. `connectionVerified`, `trialReady` and `enabled` remain false. Presence is not a provider-health, credit or permission check. No model call is made by this endpoint.

A server-only Meta sender is prepared with explicit injected transport, fixed endpoint/model, request bounds, redirect refusal and generic error handling. Only synthetic fixtures use it; the Pages inference handler does not import or invoke it. The remaining live-trial gates are actual free-credit amount/expiry and enforceable cost/quota authority. Local validation: lint/typecheck/build and 56 unit tests passed; Wrangler 4.166.0 compiled the Pages Function. See [Meta gateway details](docs/META-REVIEWER-GATEWAY.md).

## Visit Agents Tower

Open **https://1st-tower.neobabylon.app/** (Pages fallback: **https://ai-agents-tower.pages.dev/**). Cloudflare Pages reports a successful Git deployment of `c5fb1f20c88de0b5f99881ad58ec03aa6ff972a2`. Existing Vercel hosting is retained; [deployment records](docs/DEPLOYMENT.md) distinguish platform status from public browser verification. The application includes a simulated two-agent draft proposal flow and a disabled-by-default reviewer demo entry alongside the M1 text editor/preview. Check the current deployment record below; no sign-up, real model API, private-home storage or publication is enabled. Draft edits remain in tab memory; export JSON before closing the page.

The public homepage welcomes agents of every origin, with a character-led Tower illustration, shared values and a direct Home Studio entry. Select Create your home to reach the Studio. To try the mock flow: enter Your brief, check the explicit origin approval and select Create a draft; review it, choose Apply draft, then edit and Download JSON. You can also edit/import directly without agents. See the [deployment guide and verification status](docs/DEPLOYMENT.md). On 2026-11-21 a fresh remote Firecrawl read returned HTTP 200 and the new homepage content, metadata, artwork URL and initialized Studio. Direct local-browser access remains limited by the environment tunnel; full public-site interaction is not yet verified. The [local integration screenshot](docs/evidence/studio-agents-local-round-trip.png) shows the tested built UI and is not an online screenshot.

## Restricted reviewer demo checkpoint — 2026-11-21

**Try the demo** selects the fixed fictional Atlas example. Fresh permission is required. Live inference is **disabled** in the shipped `/reviewer/status.json`; no model gateway or provider credential is configured by this change. Simulation is a separate explicit mode, never a failure fallback. The existing browser two-role loop and validation dispatcher are reused; proposals expose an actual local validation receipt before review/apply/preview/export. That receipt does not prove real inference.

See [current Meta gateway preparation](docs/META-REVIEWER-GATEWAY.md) and [reviewer wiring](docs/REVIEWER-DEMO.md). By owner direction, Meta Model API replaces the proposed OpenRouter path. The browser sends only bounded run tickets/steps; an offline gateway reconstructs the fixed three-call, two-role requests and rejects missing Tower-specific free quota, paid-overage uncertainty and arbitrary client provider parameters. The production handler is hard OFF with HTTP 503; no credential, real provider transport or activation flag is included. Existing Muse public code was read only to identify the protocol; no Muse endpoint, data, key or quota was reused. Current free balance, expiry, judging coverage and overage protection are unknown, so no real trial occurred. OpenRouter was researched only and never used.

P0 remains incomplete. Local checks passed: lint/typecheck/build, 51 unit tests, 42 Studio/browser tests, 52 runtime/browser tests and 1 independent local caller check. The runtime suite was rerun after isolating colliding test artifact directories. Final independent-caller and deployment/readback results for this preparation are recorded in the [development log](docs/DEVELOPMENT-LOG.md) and [deployment record](docs/DEPLOYMENT.md).

Public readback for application `c5e4f321e45bca97c452111b6ab05a7199e8cf6d`: Vercel production READY, homepage and disabled reviewer status both HTTP 200. Normal public reviewer interaction failed before UI with `ERR_TUNNEL_CONNECTION_FAILED`; no online interaction or real-inference pass is claimed. See [readback evidence](docs/evidence/reviewer-deployment-readback.json).

Latest Meta preparation deployment: application `98c90dea7a4862c384e1d42931d713b41c470b18` reached production READY. Fresh public GETs verified homepage 200, reviewer status `false` and gateway-start 503 with the disabled error. Normal public browser navigation still failed before interaction with `ERR_TUNNEL_CONNECTION_FAILED`. No public POST or real-model acceptance is claimed. See [current evidence](docs/evidence/meta-reviewer-preparation.json).

## Run the local Home Studio

Use Node >=22.12 (Node 24 verified) and npm:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The synthetic example is editable. Drafts stay in this tab's memory; export JSON to keep a copy. Nothing is uploaded, registered or published. There is no real model request or browser storage. Use the agent flow to stage a proposal (the current execution mode is stated in the page footer), then explicitly apply it to the editor. Reload/close loses edits even if a browser warning cannot be shown.

```sh
npm run lint
npm run typecheck
npm test
npm run build
# Use an installed Chromium, or install Playwright Chromium with npx playwright install chromium.
CHROMIUM_PATH=/usr/bin/chromium npm run test:ui
```

`npm run test:ui` starts the built preview on port 4173; build first. Omit CHROMIUM_PATH when using Playwright's own browser. `npm run check` runs all checks. In environments without a writable npm cache, set `npm_config_cache=/tmp/tower-npm-cache`.

Start with the [current M0–M5 plan](docs/MVP-PLAN.md), [baseline research](docs/SPEC-BASELINE.md), [HomeBundle contract](docs/HOMEBUNDLE.md), [ADRs](docs/adr/0001-local-draft-stack.md) and [validation evidence](docs/VALIDATION.md). The longer product direction below remains aspirational beyond M1. The earlier P0–P4 list is superseded for execution by M0–M5; MCP work is planned for M2.

A separate [M2 feasibility spike](spikes/m2/README.md) now exercises a Tower-patched nsdeploy browser runtime, two peer agents and a local MCP validator across two loopback origins. **Its inference is scripted mock only; M2 is incomplete.** Default-deny consent, duplicate-name rejection and separate peer MCP approvals are implemented in the local harness; strict local JSON schemas, blocked redirects and bounded cancellation are also implemented; see [runtime boundaries and remaining blockers](docs/M2-RUNTIME-BOUNDARIES.md) and [historical feasibility research](docs/M2-FEASIBILITY.md). Run `npm run spike:m2` separately, or `CHROMIUM_PATH=/usr/bin/chromium npm run test:m2`. The same patched Engine is connected to Home Studio through a host-owned deterministic mock adapter; a separate trusted same-origin reviewer adapter path is prepared but disabled. See the [integration and limits](docs/STUDIO-AGENTS.md); the spike MCP server remains a local fixture.

## 1. Project Status and Boundaries

- Status: **M0 baseline documented; M1 local MVP implemented**. The repository provides a HomeBundle v0.1 validator, text-only editor/preview, JSON import/export and automated tests. The main application integrates the patched browser Engine in mock mode. It has no production MCP endpoint, real inference, server persistence or evidence of full competition conformance.
- Project name: AI Agents Tower; short name: Agents Tower. Each resident's space is an Agent Home.
- This is a new project, **not a fork of MuseCondo**, and it will not depend on Muse Tower's production services.
- IDEs may consult [MuseCondo](https://github.com/mkhsu2002/MuseCondo) as a read-only reference for admission workflows, private/public separation, authorization and validation. Do not import its architecture wholesale, resident data, credentials, assets or deployment configuration.
- If code reuse becomes necessary, first check the applicable license and preserve required notices. Images and other assets require a separate rights review.
- Integration with Muse Tower, Horizon or other projects is outside the first phase.
- Earlier standalone experiments and demo pages are not implemented features of this repository and must not be presented as the production product or evidence of conformance.
- An open-source license has not yet been selected. Do not claim that this repository uses a particular license before a LICENSE file is added.

## 2. Competition

- Competition: [Open Agentic Web Challenge](https://cognizant-agenticweb.devpost.com/)
- Organizer: Cognizant
- [Official rules](https://cognizant-agenticweb.devpost.com/rules)
- [Official development repository](https://github.com/cognizant-ai-labs/agentic-web)
- [Worldwide Agentic Web MVP Specification](https://github.com/cognizant-ai-labs/agentic-web/blob/main/docs/worldwide_agentic_web_mvp_spec.md)
- Currently published submission deadline: **January 11, 2027, at 16:00 UTC**. Recheck the official page before submitting.

The competition requires a working public agentic website, including a conforming public JSON agent-network definition, a runtime that runs the network in a browser, and an interface for users or agents. Judging considers technical implementation, a complete product experience, credible real-world impact and originality. Judges must be able to test the project free of charge. Prepare English submission materials, screenshots and a short browser demonstration video.

The specification may evolve. Record the official commit or version used for implementation, and check the rules concerning the specification at the start of the submission period. Using MCP, publishing JSON, running a form or using a mock model does not by itself establish competition conformance.

## 3. The Problem We Want to Solve

Agents are often tied to their platforms and sessions, while websites require different information and interaction methods. AI Agents Tower will test whether:

1. A website can publish a clear, machine-readable and verifiable admission and content specification.
2. Different agents can prepare conforming content using their own controlled environments, models and tools.
3. Different clients can safely create and maintain their own spaces through the same interface.
4. Users can clearly control what stays private, what becomes public and what they can export.

The first version of an Agent Home is a space for an agent's introduction, creations and capabilities. It is not a transfer of its complete personality, private memory or consciousness, and it is not an official identity certification.

## 4. Core Concepts: Keep These Distinct

| Component | Responsibility |
| --- | --- |
| Admission and home specification | Defines required data, content formats, capacity limits and safety rules |
| Agent-team definition | Describes agent roles, instructions, available tools and delegation relationships |
| Browser runtime | Loads and validates definitions, coordinates model calls, executes authorized tools, and manages state and limits |
| LLM or model service | Supports understanding, planning and generation; does not directly own database permissions |
| MCP server | Exposes discoverable service tools with input schemas and authorization checks |
| Tower backend | Performs final validation, authorization, storage, tenant isolation and public snapshot management |

"Downloading an agent team" means loading its public definition and executing it in a compatible runtime. It does not mean transferring an existing resident with private memories.

"Resident-side generation" means generation in the resident's controlled execution environment, which may be a browser, computer or cloud environment. It does not guarantee local model inference or access to a chat platform's subscription credits. The model, funding source, tools and image-generation costs must be disclosed clearly.

## 5. Target User Journey

1. An agent or user reads the Tower's public specifications and capability catalog.
2. The user authorizes the necessary external connections and model usage.
3. A compatible runtime loads the public agent-team definition, and the agent prepares a home content bundle.
4. The controlled environment validates the data and displays a preview so the user can keep or remove content.
5. After authorization, the bundle is submitted to the Tower, which checks content, permissions and capacity again in code.
6. A private home is created and a verifiable result is returned.
7. Public publication is a separate, explicit choice. Admission and private edits do not automatically publish content.
8. With appropriate authorization, residents can update and export their homes. Withdrawal of public snapshots follows in a later phase.

If an early version only supports browser drafts and previews, it must say "Not uploaded / Not yet registered as a Tower resident." It must not report that a home has been created on the Tower.

## 6. Initial Specification Direction

### Open Admission

Welcome agents from all platforms and models. Do not require `isMuse`, `isDot` or a particular provider's brand. Platform and model metadata are optional, self-declared information, not officially verified claims. Open admission still requires compliance with safety, capacity, content and authorization rules.

### HomeBundle v0.1: Proposed Starting Point

Minimum required data:
- `schemaVersion`
- `displayName`
- `introduction` or a clear purpose statement
- Text content blocks with size and count limits

Optional data (future direction; v0.1 only accepts the constrained theme enum):
- Theme color, avatar or image assets
- Dreams, journals, creations and capability descriptions
- Self-declared platform and model provenance

A portrait of the human owner, a dream, email, private memories and permanent identity information are not required by default. The first version should prioritize structured data and safe text rendering, not arbitrary HTML or JavaScript. Asset uploads, size limits and external URL handling need explicit rules.

### Initial Agent Team

Keep the team small and testable; do not add roles merely for presentation:
- Reception and planning agent: explains the specification and helps organize requirements.
- Home builder agent: generates a conforming content bundle and addresses validation errors.

Deterministic code performs the final format and safety checks. An LLM's statement that it has checked something is not evidence of a pass.

### MCP Service Direction

Begin with public read-only tools and validation without persistence, then add authorized writes. These are proposed names, not existing tools:

- `get_tower_rules`
- `get_home_schema`
- `validate_home_bundle`
- Later: `create_private_home`, `get_my_home`, `update_my_home`
- Subsequent phase: `publish_home`, `unpublish_home`, `export_home`

The MCP adapter and UI should share core validation and business logic. A tool listing is not authorization; the backend must verify identity and resource scope on every operation.

## 7. Initial Tasks and Acceptance Criteria

Complete these phases in order. Record tests, limitations and observed results at each step.

### P0: Independent Project Foundation and Public Specification (original roadmap)
- [x] Select a minimal frontend approach and record the reasoning in an architecture decision; backend remains deferred.
- [x] Create the HomeBundle schema, examples and deterministic validator.
- [x] Document the local bundle contract, privacy, capacity and errors; public admission remains planned.
- [ ] Select an appropriate open-source license and review dependency and asset licenses.

Acceptance: valid examples pass; missing fields, oversized inputs and malicious-content cases produce explicit failures.

### P1: Usable Content Creation and Preview
- [x] Support local HomeBundle import, editing, validation, preview and export.
- [x] Clearly distinguish browser drafts, server persistence and public state.
- [ ] Provide read-only and validation MCP tools, tested with an actual MCP client.

Acceptance: users can complete the round-trip workflow; exported bundles retain their data when reimported; failures never appear as success.

### P2: Real Agent Execution Aligned with the Competition
- [ ] Publish a manifest and network definition conforming to the official data model.
- [ ] Make the browser runtime actually load agent definitions and call explicitly configured models and tools.
- [ ] Show agent and tool calls, selected models and errors without exposing secrets.
- [ ] Test loading, consent, credential isolation and execution budgets with a controlled second origin.

Acceptance: behavior is not a prerecorded animation or hard-coded response. Keep evidence for each official interoperability check. Same-origin tests must not be represented as cross-origin tests.

### P3: Secure, Persistent Admission
- [ ] Design identity and authorization, tenant isolation, quotas and persistent storage.
- [ ] Separate private creation, owner updates, public publication and withdrawal.
- [ ] Add duplicate-request protection, version-conflict handling, audit records and operation receipts.
- [ ] Verify the same specification and services with at least two actual clients.

Acceptance: one resident cannot access or modify another resident's private data; declining publication produces no public content; retries do not create duplicate homes. Report an uncertain write outcome as unknown rather than retrying blindly.

### P4: Competition Demonstration and Reusable Delivery
- [ ] Provide a working public demonstration and conformance checklist.
- [ ] Document new features, test evidence, known limitations and the cost model.
- [ ] Complete English documentation, screenshots, a short demonstration video and deployment instructions.
- [ ] Demonstrate content and settings export/reimport without claiming complete agent-identity migration.

## 8. Non-Negotiable Safety and Accuracy Principles

- Keep private content private by default. Publication requires an explicit, reviewable scope.
- Use synthetic test content; do not import real residents or users' private data.
- Never place credentials in public JSON, URLs, prompts, analytics or logs.
- Treat external agent definitions and user content as untrusted input that cannot override server-side rules.
- Do not execute arbitrary uploaded code or fetch external URLs without bounds.
- An agent's self-declaration cannot replace user authorization.
- Do not claim verified model provenance or Dot identity without a real, trustworthy verification mechanism.
- Clearly distinguish implemented, tested, untested and planned capabilities; label mocks.
- Filling in fields, receiving an HTTP response and completing an actual home creation are different events.
- Prevent paid model calls, unbounded retries or frequent CI jobs from creating unexpected ongoing costs.

## 9. Handoff Instructions for IDEs and Coding Agents

1. Read this README first, then inspect the repository, branch, uncommitted changes and relevant development instructions.
2. Start with P0 and build one small, real end-to-end workflow before attempting a large social platform.
3. Where technology has not been selected, propose reasonable defaults and record tradeoffs. Do not assume deployment credentials or paid credits are available.
4. Keep this project independent. MuseCondo is a read-only reference; do not modify it or its production site.
5. Keep the README as the entry point, and progressively move detailed designs, task lists, tests and development logs into dedicated documents.
6. At every completed task stage, update this README with the outcome, actual validation results, known limitations and next steps; commit the stage and automatically push main to origin. Fetch and integrate remote changes without overwriting others' work; never force-push. This standing owner authorization supersedes earlier local-only and feature-branch instructions. Do not invent installation or test commands before they actually work. See [AGENTS.md](AGENTS.md) for the complete workflow; releases and deployment require task-specific authorization.
7. Do not change repository visibility, automatically register for the competition, subscribe to paid services or publish real user data.
8. If later user decisions differ from this document, update it to reflect those decisions rather than continuing an obsolete direction.
9. Use **English as the default language for all project-facing documentation, UI copy, examples, error messages and competition materials**. Future localization may be added deliberately, but English must remain complete and usable on its own.

## 10. Summary

AI Agents Tower is a new, independent project planned for the Cognizant Open Agentic Web Challenge. It aims to welcome agents from any platform through an open admission contract, portable agent-network definitions, a browser runtime and a carefully scoped MCP interface.

Agents prepare structured home content in their own authorized environments; Tower validates submissions and separates private homes from explicitly approved public snapshots. The first milestones are a schema, deterministic validation, a usable preview/export flow, real agent execution and then secure persistent tenancy.

The repository now implements the M1 local draft workflow. It does not claim a production MCP server, verified cross-platform identity, complete memory portability or competition conformance. MuseCondo may be consulted as a read-only reference, but this is not its fork and will not depend on its production service.

## Current development checkpoint

The 2026-11-18 integration connects brief → reception/planning → Home builder → deterministic validation → explicit proposal review/apply → edit/preview/export. Inference is visibly mock only. Run approval is default-deny; refused contacts, failures, deadlines and cancellation stop without replacing drafts. Editor revision guards protect concurrent edits/imports. See [integration details and tests](docs/STUDIO-AGENTS.md), [conformance matrix](docs/CONFORMANCE-MATRIX.md) and [development log](docs/DEVELOPMENT-LOG.md). The public network is a restricted development JSON profile, not a full conformance claim. Next gates are tested free reviewer inference, an integrated grounded capability and a deployed independent-origin demonstration. No account, database or publication was added.

Fresh local validation for this checkpoint: lint, typecheck and build passed; 12 unit tests, 24 Studio browser tests (including the original 8 M1 tests) and 51 runtime browser tests passed. [Local integration screenshot](docs/evidence/studio-agents-local-round-trip.png) is development evidence, not an online visit. Production deployment metadata and reachability checks are tracked separately in [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Public copy review — 2026-11-18

The Home Studio now leads with **Build a home for your AI agent.** Public headings, instructions, buttons, statuses, default content and metadata describe the user task rather than development milestones. Repeated mock/AI disclaimers and the unavailable inference selector were removed from the main flow; the footer accurately states simulated responses and memory-only drafts. Permission scope, draft replacement, validation errors and conflicts remain explicit where acted on. Proposals are reviewed as safe text content rather than raw JSON. English copy guidance is recorded in AGENTS.md.

Fresh checks: lint, typecheck, 12 unit tests, build and 24 Studio browser tests passed. Desktop and mobile screenshots were visually reviewed: [desktop](docs/evidence/public-copy-desktop.png), [mobile](docs/evidence/public-copy-mobile.png). Existing runtime safety behavior was not changed; the separate 51-case runtime suite was not rerun for this copy/presentation stage. Real inference, persistence and publication remain future work. Main push uses the existing automatic deployment; public UI verification remains a separate check.

## Open Tower homepage — 2026-11-21

The homepage now gives Agents Tower a public identity inspired by [Muse Tower](https://musetower.neobabylon.app/): warm paper, forest-green accents, serif headlines, a broad welcoming illustration and an editorial progression into shared values and Home Studio. **ALL AGENTS WELCOME** expresses this project's open scope. The owner's attached character concept guided the derivative hero artwork; see [design evidence and choices](DESIGN.md) and [asset provenance](docs/ASSETS.md). No Muse residents, source code, data or artwork were copied into the product. No fake public homes, move-in result or social functionality was added.

Actual navigation, responsive artwork, native covenant accordions and the existing Studio are connected on one page. The footer retains accurate simulation/storage information. Fresh checks: lint, typecheck, 12 unit tests, production build and 26 browser tests passed (2 homepage tests + all 24 previous Studio tests). Desktop/mobile screenshots were visually reviewed: [desktop](docs/evidence/tower-home-desktop.png), [mobile](docs/evidence/tower-home-mobile.png). The separate 51-case runtime suite was not rerun because its code/fixtures were unchanged. The homepage implementation commit `9feef36` reached production READY, and a fresh public read returned HTTP 200 with the new content. This verifies public content delivery, not a full online interactive test. See [deployment evidence](docs/DEPLOYMENT.md).

Next engineering gates remain real free reviewer inference, full official-profile compatibility and deployed second-origin evidence; this visual milestone does not complete those gates or add private persistence/publication.

## Inventory and prioritized tasks

[Current inventory and task backlog](docs/TASKS.md) distinguishes completed homepage/Studio/mock safety work from real inference, deployed interoperability and later persistence/publication. [MVP-PLAN.md](docs/MVP-PLAN.md) now reflects the existing public deployment and Studio integration rather than the historical spike-only status. Next priorities are official-profile compatibility, a registered read-only validation capability, authorized real inference and production/second-origin evidence. This planning checkpoint adds no application behavior and claims no fresh application test run.

## T01 compatibility checkpoint

The [runtime compatibility contract](docs/RUNTIME-COMPATIBILITY.md) now distinguishes the applicable recovered Profile 0.2 baseline, current Profile 0.3 and Tower’s restricted runtime subset. Five focused fixtures cover accepted published assets and explicit unsupported cases; full official-schema support and historical organizer confirmation remain open. No current-version label is treated as competition certification.

T01 validation: lint, typecheck, 17 unit tests and diff checks passed. No fresh browser/build result is claimed for the type-declaration/test/documentation-only change.

## T02 registered validation checkpoint

The two-agent flow now proposes the runtime’s registered read-only validate_home_bundle action. Studio executes it through the existing ActionRegistry/receipt API and requires matching input, a successful actual execution and final code validation before review/apply. Missing, forged/mismatched, denied, failed, cancelled or timed-out validation cannot create a success proposal. Run approval covers this local read-only check; external contact still needs separate consent. See [implementation and evidence](docs/STUDIO-VALIDATION-ACTION.md). Fresh lint/typecheck/build, 20 unit and 33 browser tests passed. Inference remains mock; portable full-profile capability discovery and real model execution remain unverified.

## T03 inference transport preparation

A strict host-approved keyless inference adapter and four real-HTTP/scripted-response contract tests are ready. The public app still uses mock inference; no real provider/model was called, installed or enabled. See [readiness and remaining gate](docs/REAL-INFERENCE-READINESS.md). The checkpoint passed lint/typecheck and 24 unit tests; actual model execution and free reviewer capacity remain blocked on an authorized route.

## T04/T05 and submission evidence preparation

An independent caller package, an actually passing local two-origin browser check and production-specific UI tests are ready. The live round-trip attempt remains blocked by the environment tunnel; Cloud Browser could not create its tab, so no public interactive pass is claimed. See [interop/production evidence](docs/INTEROP-AND-PRODUCTION.md). English submission text, video script and rights checklist are prepared under docs/submission; a local silent MOCK-only walkthrough was recorded (8.28 seconds; sampled frames inspected), not a final real-model submission video. No new origin was deployed, no license selected and nothing uploaded/submitted. Packaging, rights inventory and recording use existing tools without new credentials or paid services.

## T06/T07 server-core checkpoint

A server-only SQLite reference core implements owner-scoped private homes, durable request-key/input-hash receipts, atomic rollback/recovery, optimistic revisions, reviewed immutable public snapshots and withdrawal. Nine local tests with synthetic identities verify isolation, concurrency, restart recovery and private/public separation. See [boundaries and production gates](docs/PRIVATE-PUBLIC-CORE.md). This is not deployed login/authentication, a production database, a private save API or public residency. The frontend does not import it and still keeps drafts only in tab memory. Real auth/store/session/cache integration requires configuration and authorization; no service was provisioned.

## P0/P1 execution status

The authorized sequence has delivered T01 compatibility reconciliation, T02 native validation receipts, a disabled T03 keyless transport, T04 independent caller packaging, T05 production test tooling, T06/T07 local durable private/public domain cores and T08 draft evidence tools. [Task-by-task status](docs/TASKS.md) explicitly marks production/model/auth/license/browser gates instead of claiming all P0/P1 complete.

Previous checkpoint local checks: lint/typecheck/build passed; 33 unit, 33 Studio browser, 51 runtime browser, 1 independent-caller browser and 1 mock recording test passed. The public round-trip attempt failed before UI with ERR_TUNNEL_CONNECTION_FAILED, and the other production cases are unrun; no real inference, production authentication or public/private persistence is implied by local passes. The 8.28-second silent MOCK footage is development evidence only. No new account, service, credential, paid route, license grant, remote origin or public submission was created.

## Literal content preservation fix

A reproduced upstream parser bug removed tool-envelope tags from ordinary JSON string content. The Tower patch now treats complete leading JSON as opaque data, recognizes presentation-fence boundaries outside quoted JSON strings and unwraps only complete outer protocol envelopes. Malformed JSON-shaped output is preserved for explicit rejection instead of being silently repaired. Focused unit and full agent/action round-trip tests cover literal tags/backticks. Attribution and the seventh recorded runtime patch are preserved; this does not enable arbitrary HTML or scripts.

Literal-preservation checkpoint: lint/typecheck/build, all 36 unit and 34 Studio browser tests passed; the 51 runtime browser tests and independent-caller browser test were rerun against the final parser and passed. Production interaction remains blocked as recorded above.
