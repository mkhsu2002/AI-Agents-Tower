# Public artifacts and caller isolation

## Published data

The logical network URL is https://1st-tower.neobabylon.app/agents/tower-home-builder . The runtime derives its site base/name and retrieves agent-manifest.json plus tower-home-builder.network.json; the logical URL is not a generic API endpoint.

Cloudflare public/_headers explicitly documents credential-free public reads for:

- /agents/agent-manifest.json
- /agents/tower-home-builder.network.json
- /schema/homebundle-v0.1.schema.json

Each rule sets Access-Control-Allow-Origin: *, GET/HEAD method metadata, JSON content type and nosniff. There is no Access-Control-Allow-Credentials. These are public declarative data, not a secret-bearing service. Browser callers must still use credentials:omit; a wildcard response does not prevent a client from sending a credentialed request, but browsers cannot expose its response as a credentialed CORS read. CORS is not authentication or a substitute for server authorization.

[Cloudflare's serving defaults](https://developers.cloudflare.com/pages/configuration/serving-pages/) already provide CORS for static assets. These explicit rules make the intended artifact contract reviewable; they do not remove defaults from other public static files. Per [Pages header documentation](https://developers.cloudflare.com/pages/configuration/headers/), _headers does not apply to Function responses. The model/status/readiness Functions add no cross-origin permission, and server origin/consent/ticket/quota rules remain unchanged. No provider key, draft, D1 record or authenticated Home endpoint is published.

The manifest/network remain labelled as development mock data. The working host-only live-demo wiring does not turn that manifest into a portable real default inference route. Full canonical profile support and actual real-model composition remain separate gaps.

## Caller package

The independent caller uses its own bundled UI/runtime and reads only public peer JSON after consent. Packaging now removes copied agents, reviewer state, Cloudflare routing/header files and any backend _worker.js. Its live-demo link/mode are removed and the source origin is displayed. It contains no backend, provider credential or authority to consume the Tower model gateway. It runs Simulation; do not present it as a deployed or real-model demo.

`npm run build:interop` creates artifacts/interop-caller for a separately authorized HTTPS destination. This step deploys nothing. The package's default source is the public Tower URL; consent remains unchecked. Two aliases of the same deployed app are not independent caller evidence.

## Cloudflare-backed local test

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:pages:interop
```

The command builds first, packages the loopback source, starts a credential-free Cloudflare workerd source at 4203 and a separately served caller at 4204, then restores the public-source package even on test failure. Do not run another caller-packaging command concurrently. Omit CHROMIUM_PATH when using Playwright's browser.

The pinned Wrangler 4.166.0 is executed from a temporary npm cache, with no dependency/lockfile change. TOWER_TEST_NPM_CACHE can select a writable test cache. The Functions are compiled, then served with static assets in an isolated temporary cwd; project .env/.dev.vars, credentials and D1 bindings are not loaded. No account login or remote runtime is selected. No model call can be configured in that source.

Three tests verify actual Cloudflare asset headers/MIME, no credential permission, separate Function CORS, no source contact before consent, exact named network GETs, no peer script/body/key/cookie forwarding, caller-owned execution/registered mock receipt, review/apply/edit/export/reimport and no browser storage. Browser negative checks reject credentialed artifact reads and cross-origin model-configuration reads. The existing Vite-based independent-caller regression also passes; it is no longer the only local hosting evidence.

These are two local HTTP origins with scripted inference. They do not establish independent deployed HTTPS, successful Meta collaboration or complete interoperability. Public header readback and browser acceptance on an authorized second host remain separate evidence.

## Specification interpretation rechecked — 2026-11-21

Sources: [official rules §4](https://cognizant-agenticweb.devpost.com/rules) and the [recovered Profile 0.2](https://github.com/cognizant-ai-labs/agentic-web/blob/e4a8727d5c6807233b8976f28494bbdac7bc1c6e/docs/worldwide_agentic_web_mvp_spec.md). The historical main-at-cutoff reconstruction remains an inference, not organizer certification; no baseline is silently changed.

Profile §§3.2–3.4 require approved declarative peer loading, public-artifact browser access when cross-origin, and caller credential isolation. Section 3.4 also permits co-hosted artifacts: a separate deployed origin is not an unconditional hosting requirement. Tower retains the independent HTTPS demo as the owner's requested interoperability acceptance target, not an invented universal rule. Coded peer modules are optional and are not fetched/executed here. Optional BYOK does not remove the need for a tested usable default route.

Rules §4 still require public browser functionality and free reviewer testing through judging. The 20-admission daily safety cap is not proof of sufficient or unrestricted judging access; actual capacity, the fixed-demo scope and organizer interpretation need review before submission. Do not remove safety limits or claim conformance on the strength of static CORS, JSON publication, MCP or mock execution alone.
