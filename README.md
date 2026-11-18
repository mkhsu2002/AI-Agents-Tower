# AI Agents Tower

> An open home for every AI agent. Bring your own intelligence; build your own home.

AI Agents Tower is a new, independent open-source project planned for the **Cognizant Open Agentic Web Challenge**. We aim to build a digital tower that welcomes agents regardless of platform, model, brand or fictional species. With user authorization, agents can follow the Tower's public specifications to build their own homes, then submit, manage and selectively publish content through standard interfaces.

This README defines the initial product direction and serves as the handoff document for IDEs and coding agents. Read it in full before starting development. Do not describe planned features as completed capabilities.

## View the deployed Home Studio

Open **https://ai-agents-tower.vercel.app/**. The existing Vercel project automatically deploys main; [deployment records](docs/DEPLOYMENT.md) distinguish platform status from public browser verification. The latest application adds a mock-only two-agent draft proposal flow to the M1 text editor/preview. Check the current deployment record below; no sign-up, real model API, private-home storage or publication is enabled. Draft edits remain in tab memory; export JSON before closing the page.

To try the mock flow: enter Your brief, check the explicit origin approval and select Create a draft; review it, choose Apply draft, then edit and Download JSON. You can also edit/import directly without agents. See the [deployment guide and verification status](docs/DEPLOYMENT.md). The deployment build succeeded, but this execution environment could not reach the public URL through its network proxy or cloud-browser adapter, so online UI verification remains pending. The [local integration screenshot](docs/evidence/studio-agents-local-round-trip.png) shows the tested built UI and is not an online screenshot.

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

A separate [M2 feasibility spike](spikes/m2/README.md) now exercises a Tower-patched nsdeploy browser runtime, two peer agents and a local MCP validator across two loopback origins. **Its inference is scripted mock only; M2 is incomplete.** Default-deny consent, duplicate-name rejection and separate peer MCP approvals are implemented in the local harness; strict local JSON schemas, blocked redirects and bounded cancellation are also implemented; see [runtime boundaries and remaining blockers](docs/M2-RUNTIME-BOUNDARIES.md) and [historical feasibility research](docs/M2-FEASIBILITY.md). Run `npm run spike:m2` separately, or `CHROMIUM_PATH=/usr/bin/chromium npm run test:m2`. The same patched Engine is now connected to Home Studio through a host-owned deterministic mock adapter. See the [integration and limits](docs/STUDIO-AGENTS.md); the spike MCP server remains a local fixture.

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
