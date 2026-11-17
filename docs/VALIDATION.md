# M0/M1 validation evidence

Verified locally 2026-11-17 on Node v24.22.1, npm 11.9.0 and system Chromium 156.0.8078.79 (Debian Linux). Feature branch: `feat/m0-m1-homebundle`. Base commit: `d789f2c`. No remote writes or deployment performed.

## Reproduce

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
CHROMIUM_PATH=/usr/bin/chromium npm run test:ui
npm audit
```

For a Playwright-managed browser, install its Chromium separately and omit CHROMIUM_PATH. Browser tests serve the production build at 127.0.0.1:4173; no paid APIs, model routes or credentials are used. In a restricted environment, use `npm_config_cache=/tmp/tower-npm-cache` for npm. The build produces ignored `dist/`; test screenshots/traces are ignored under `test-results/`.

## Results

| Check | Observed result |
| --- | --- |
| ESLint | Passed |
| TypeScript noEmit | Passed |
| Node domain suite | 8 tests passed |
| Vite production build | Passed; JS approximately 130.55 kB / 40.32 kB gzip, CSS approximately 4.55 kB |
| Playwright built-UI suite | 8 tests passed |
| npm audit, all dependencies | 0 known vulnerabilities |
| npm audit, production dependencies | 0 known vulnerabilities |
| git diff --check | Passed |

Domain coverage: valid and optional-theme-absent round-trips; repeated import/edit/export; preserved whitespace/Unicode/script-like text; no mutation; missing/wrong fields; unknown authority and credential fields; version/theme rejection; per-field/count bounds; malformed/duplicate JSON keys; inclusive 64 KiB byte limit; Unicode bytes; canonical export overflow; invalid export has no partial result.

Browser coverage: repeated actual downloads/reimports; literal markup without script/image/link nodes or external requests; rejected import retains edited draft and raw input; invalid edit pauses preview/export and recovers; add/remove blocks; file staging, malformed UTF-8, oversize and delayed cancellation/clear/edit races; reload dialog cancel preserves draft and accept resets to example; empty cookies/localStorage/sessionStorage/IndexedDB/cache storage and no content write requests; desktop 1440px and mobile 390px without horizontal overflow; initial page has no uncaught errors. Desktop and mobile screenshots were visually reviewed locally.

An initial reload test waited for a navigation that the test intentionally cancelled, causing a harness timeout. It was corrected to observe/dismiss the beforeunload dialog and assert that the draft remains; the complete suite then passed. An initial browser JSON import needed a native JSON import attribute; fixed before the successful run. TypeScript 7 conflicted with the lint plugin peer range; version 6.0.3 was selected and installed normally.

## Practical limits

Only Chromium was tested. Accessibility has labels, landmarks, keyboard focus and status announcements but no formal audit. No server private-home creation, publication, auth, tenant isolation, real model, browser agent runtime, MCP client or cross-origin conformance was tested or implemented. No claim of admission, residency or competition compliance is made. Memory-only drafts can be lost after crashes or a browser discards unload prompts. The browser/OS may retain exported files; no browser persistence or automatic recovery is implemented. Production security headers and licensing are later gates.

See SPEC-BASELINE.md for the immutable best-effort baseline and unresolved authoritative historical pin. See MVP-PLAN.md for M2–M5 acceptance gates and the second-origin plan.

## Subsequent M2 spike

The original M1 evidence above remains historical. See [M2-FEASIBILITY.md](M2-FEASIBILITY.md) for the separate pinned runtime experiment, scripted-only inference, local MCP and two-origin tests, observed adoption blockers and inference research. M2 is not complete.
