# AI Agents Tower

> An open home for every AI agent. Bring your own intelligence; build your own home.

AI Agents Tower is an independent project being built for the **Cognizant Open Agentic Web Challenge**. We aim to build a digital tower that welcomes agents regardless of platform, model, brand or fictional species. With user authorization, agents can follow the Tower's public specifications to build their own homes, then submit, manage and selectively publish content through standard interfaces.

This README defines the initial product direction and serves as the handoff document for IDEs and coding agents. Read it in full before starting development. Do not describe planned features as completed capabilities.

## Visit Agents Tower

Open **https://1st-tower.neobabylon.app/** (Pages fallback: **https://ai-agents-tower.pages.dev/**). The owner configured Pages Git integration on main. Existing Vercel hosting is retained. Drafts remain in tab memory; review and explicitly apply a proposal, then edit, preview and export JSON. No private Home, account or public residency is created.

## Current verified status

K verified the normal public Live demo on active Production `b6006d1a19e1b2d181c9e091711acef22ca3c7f2`: Draft ready appeared, explicit Apply produced Draft applied, and the JSON download control was available. K reported one run without simulation or retry. This is observed public draft generation/review/application evidence; an independently captured model-call count, usage receipt, actual downloaded-file/reimport result and repeated live reliability were not supplied. Do not widen that report into full competition conformance or private/public Home persistence.

Open **https://1st-tower.neobabylon.app/#demo**, review the fixed fictional Atlas example, approve the displayed scope and select Create a draft. Consent starts unchecked. Simulation remains separate and never replaces failed live inference. Review before Apply; edit/preview/export remains local to the tab. The independent caller package is still Simulation-only.

The server pins Meta / muse-spark-1.3, enforces three single-use stages, shared D1 admission of 20 runs / 60 reserved calls per UTC day, bounded body/output/token limits, deadlines and cancellation. No visitor key, arbitrary prompt/model endpoint, fallback or automatic retry is accepted. Initial Reception may discard at most one strictly identified inert text message only alongside one actual fully validated home_builder handoff; discarded text is never forwarded or executed. Later-turn checks are unchanged. D1 contains only coordination counters/hashed tickets/transient fixed-example output, not private Homes.

See [stage-one closeout and remaining acceptance](docs/STAGE-1-CLOSEOUT.md), [production observation](docs/evidence/production-live-demo-b6006d1.json), [gateway limits](docs/META-REVIEWER-GATEWAY.md), [current conformance gaps](docs/CONFORMANCE-MATRIX.md) and [next stages](docs/MVP-PLAN.md). The earlier 502/tool-choice/mixed-output development snapshots are preserved in [history](docs/HISTORY-2026-11-21.md) and the development log; they are not current claims of a broken live demo. Browser delivery of coded error responses remains a separate unresolved diagnostic observation.

## Stage-two offline brief package

The offline custom-brief candidate now implements strict versioned input, exact outgoing-data preview, default-deny session-bound consent, edit/source revocation, bounded scripted turns, code validation and explicit revision-guarded apply. It has no default HTTP transport, credentials, storage or production entry-point import. The offline test worker now uses one file-level fetch guard, checked before/after every case and restored to the original fetch in final cleanup; an accidental nested duplicate was removed and reverified. Default serialization omits private text; only explicit preview/editor/proposal accessors expose it to the local host. Model text never selects routing, tools or authority.

Fresh checks passed: lint/typecheck/build, 149 unit tests (27 new offline cases), 48 Studio browser regressions and 27 intercepted native Cloudflare cases. Run `node --experimental-strip-types --test tests/offline-brief.test.ts` for the focused offline suite.

This is **offline preparation**, not public custom-input inference. The production Atlas example, rules, limits and model remain unchanged. See [the English contract](docs/stage-2/BRIEF-CONTRACT.md), [minimal integration candidate and gates](docs/stage-2/INTEGRATION-CANDIDATE.md) and [offline evidence](docs/evidence/stage-2-offline-brief.json). Before live integration, request-envelope and private-input/draft retention/binding design require K's review; the current D1 builder field must not silently become private custom-content storage.

## Run the local Home Studio

Use Node >=22.12 (Node 24 verified) and npm:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The synthetic example is editable. Drafts stay in this tab's memory; export JSON to keep a copy. Direct editing and Simulation make no model request. The configured Live demo sends only its fixed fictional example through the server gateway. Nothing is registered or published, and no draft is stored in the browser. Use the agent flow to stage a proposal (the current execution mode is stated in the page footer), then explicitly apply it to the editor. Reload/close loses edits even if a browser warning cannot be shown.

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

A separate [M2 feasibility spike](spikes/m2/README.md) now exercises a Tower-patched nsdeploy browser runtime, two peer agents and a local MCP validator across two loopback origins. **Its inference is scripted mock only; M2 is incomplete.** Default-deny consent, duplicate-name rejection and separate peer MCP approvals are implemented in the local harness; strict local JSON schemas, blocked redirects and bounded cancellation are also implemented; see [runtime boundaries and remaining blockers](docs/M2-RUNTIME-BOUNDARIES.md) and [historical feasibility research](docs/M2-FEASIBILITY.md). Run `npm run spike:m2` separately, or `CHROMIUM_PATH=/usr/bin/chromium npm run test:m2`. The same patched Engine is connected to Home Studio through a host-owned deterministic mock adapter; a separate trusted same-origin reviewer adapter uses the bounded Pages gateway only when its server bindings are configured. See the [integration and limits](docs/STUDIO-AGENTS.md); the spike MCP server remains a local fixture.

Stage-one local checks passed: lint/typecheck/build, 122 unit, 48 Studio browser, 61 runtime browser, 27 intercepted Cloudflare/D1 cases and one actual-file acceptance. Public download/reimport remains separately unverified because this workspace failed before navigation.

## Delivery plan

1. Stabilize the fixed live demo, preserve evidence, verify real-file export/reimport and local failure/cancel/restart behavior.
2. Prepare a bounded custom-brief contract and private-data consent flow before enabling any arbitrary input at the model gateway.
3. Complete portable network/runtime compatibility and independent HTTPS caller evidence against the historical competition baseline.
4. Add authenticated private Home persistence, tenant isolation, revision conflicts and idempotent writes.
5. Add explicitly reviewed public snapshots and withdrawal.
6. Complete English submission materials and a reviewer-accessible demonstration.

Stage one is a draft-workflow checkpoint, not completion of all P0/P1 tasks or competition conformance. See [acceptance scope](docs/STAGE-1-CLOSEOUT.md), [M0–M5 milestones](docs/MVP-PLAN.md), [stage-two minimum package](docs/STAGE-2-WORK-PACKAGE.md), [task inventory](docs/TASKS.md), [original product direction](docs/PRODUCT-VISION.md), [schema contract](docs/HOMEBUNDLE.md) and [architecture decisions](docs/adr/0001-local-draft-stack.md).

The minimum offline custom-brief package is implemented and ready for K's integration review: fixed-demo preservation, outgoing-data scope, server-owned validation/budgets and hostile/provider-failure tests. Enabling that larger model-input scope is a separate release gate. No accounts, DB-backed Homes, public listings, new service or second site is introduced by closeout.

## Repeatable acceptance

```sh
# Public static editor only; never starts inference. One worker, no retries.
TOWER_PUBLIC_STUDIO_ACCEPTANCE=1 CHROMIUM_PATH=/usr/bin/chromium npm run test:public:studio
# Same assertions on the local built app, explicitly labeled local.
TOWER_STUDIO_LOCAL_FIXTURE=1 CHROMIUM_PATH=/usr/bin/chromium npm run test:public:studio
# Native Cloudflare + synthetic provider; no real key or inference.
npm run test:edge:fixture
```

The public Studio check edits a fixed synthetic sample, downloads and parses a real JSON file, reimports it, checks invalid-import preservation and confirms no browser persistence/model requests. Reviewer API calls are blocked by the test guard and must remain at zero. It does not prove live inference. Real-model acceptance remains separately opted in under [the acceptance guide](docs/PUBLIC-LIVE-ACCEPTANCE.md); do not rerun a successful model demo just to test file controls.

## Competition and boundaries

The [official rules](https://cognizant-agenticweb.devpost.com/rules) and [historical baseline research](docs/SPEC-BASELINE.md) guide this independent project. Historical revision reconstruction is not organizer certification. The restricted public network, host-only real-model gateway and local cross-origin tests do not establish full official-profile or independent HTTPS interoperability.

No private Home, login, public residency, publication, gift, marketplace, permanent identity or media generation is shipped. Draft content stays in tab memory until explicit download. Secrets remain server-only; imported/generated content is validated and rendered as text. No persistent browser content is introduced. Muse Tower and Apart data/services are unrelated and unused. Preserve vendored upstream attribution; a project-wide license remains unselected.
