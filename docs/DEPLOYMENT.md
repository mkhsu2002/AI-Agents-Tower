# Deployment status

The owner supplied the final error excerpt from the failed Pages Functions build. A local legacy Wrangler 2.20.2 / esbuild 0.16.3 build reproduced the ES2023 warning plus a fatal unsupported JSON import-attributes error. The repair changes the TypeScript output target to ES2022 and imports prompt schema data from the checked build-generated JavaScript module. Both legacy and modern Wrangler compile the repaired source; Cloudflare successfully deployed repaired application b11f65d2e351c18afa59f141d92f8d59332cd050, deployment c88ccf37-e681-4cd1-b99d-6a317bead92a. Fresh ordinary public GETs of status and readiness both returned HTTP 200: status enabled false; readiness credentialConfigured true with enabled/connectionVerified/trialReady false. This verifies successful delivery and disabled configuration only. It does not verify provider health or public interaction. Evidence: evidence/pages-legacy-bundler-repair.json.

The earlier e28a5dd / 1863547 Pages checks failed. No real Meta call occurred. Production still requires the dedicated TOWER_RUNTIME D1 binding before the fixed demo can activate. Configuration status and a successful deployment do not verify Meta or browser interaction. See the historical records below and the latest development log for exact tests and readback.

## Enabled configuration and acceptance tools — 2026-11-21

After the owner redeployed Production bindings, fresh public readiness returned enabled/credentialConfigured/trialReady true. No further binding setup is requested. Public live interaction still failed before navigation in this environment (ERR_TUNNEL_CONNECTION_FAILED), without a start/model request. A separate no-retry, explicitly opted-in acceptance harness and allowlisted diagnostics now cover the locally testable portion. Local final checks: lint/typecheck/build, 72 unit and 43 Studio browser tests passed; legacy Functions compilation passed; opt-in default returned one skip. Application e96c9ccb5bd6c49f982206c6be24d42960a23e57 deployed successfully (98aa0502-de40-4cee-89f6-1166c131846c), with origin/main SHA verified. Fresh status/readiness GETs returned HTTP 200 and enabled true; GET /api/reviewer/start returned expected HTTP 403 with REQUEST_REJECTED. This verifies the new safe failure contract before admission/provider dispatch, not actual D1/model health or live flow. No real inference pass is claimed.

## Public-data header policy and caller preparation — 2026-11-21

The static public manifest/network/schema now carry explicit CORS/JSON/nosniff rules. Function origin/credential behavior remains separate. A dedicated credential-free local workerd/caller check passes all three cases, including browser credential refusal and M1 round-trip; the existing Vite caller regression also passes. Caller packaging is Simulation-only and carries no backend or Tower network copy. No second site was deployed. Cloudflare deployed fdbf8fbc83a4640176c405d59994b2d5b7e62b24 successfully (724dadc9-f9e7-4113-8b6b-b8546df97d02), with local/origin main SHA matched. Fresh manifest/network GETs returned HTTP 200 and application/json; charset=utf-8. Readiness remained enabled/credentialConfigured/trialReady true and connectionVerified false. The extraction tool does not expose full CORS response headers; local header tests and public body/MIME readback are not a public cross-origin browser pass.

## Demo discovery and invocation enforcement — 2026-11-21

Homepage demo CTA and #demo direct/hash/reload entry select the fictional live example without automatic consent/model calls. Caller packaging strips both demo links and remains Simulation-only. Browser runtime strictly validates an entire tool-call batch before any downstream execution; invalid JSON is not converted into text and multiple/empty argument values are preserved. Fresh lint/typecheck/build, 76 unit, 44 Studio, 61 runtime and 3 Cloudflare caller tests passed, with a final 3-case landing rerun after hash-navigation handling. Cloudflare deployed faf506165d761a07d3cc49d321c146b7b53fba7e successfully (8edcbbc2-b248-4307-b406-7000252f24be), and origin/main matched. Fresh public GET /#demo returned HTTP 200 with homepage Try the demo and the correct direct link. The owner was given that verified entry for one normal-path model run. Actual interaction/provider success remains unverified; no assistant real-model call occurred.

## Reported 502 and native fetch repair — 2026-11-21

Owner's normal public live attempt failed with generic 502. Native workerd reproduced an unsupported redirect:error pre-provider failure. Server transport now uses manual mode and rejects/cancels all redirects; the live adapter preserves fatal child error codes/stages. No API/D1 setup or limit expansion is needed. Fresh 83 unit/46 Studio/8 intercepted edge cases plus lint/typecheck/build passed; actual public provider success remains pending. Cloudflare deployed d96fd0b0f21451047eb1222a6818c75f87d9aaf0 successfully (f7080ab8-7f01-42e6-b935-6b189810537e), with origin/main SHA matched. Fresh /#demo raw HTML contained index-_nsYDWN5.js and returned HTTP 200; readiness returned enabled/credentialConfigured/trialReady true, connectionVerified false. No generation was submitted in those GET checks. Owner was asked for one refreshed normal-path trial; actual real-model success is still unverified.

## Historical deployment records

### First Home Studio deployment

This deployment serves the M1 static Home Studio from main. It does not deploy the separate mock runtime servers, create residents, save private homes, publish user bundles or enable real model calls. Draft content remains in tab memory. The app needs no environment variables, database, credentials or paid API.

## Repository import settings

Use the existing connected Vercel Hobby workspace and import `mkhsu2002/AI-Agents-Tower`:

| Setting | Value |
| --- | --- |
| Production branch | main |
| Root directory | Repository root |
| Framework | Vite |
| Install command | npm ci |
| Build command | npm run build |
| Output directory | dist |
| Node runtime | Node 24 recommended; locally verified |
| Environment variables | None |

The checked-in vercel.json records framework/build/output settings. Only the generated dist directory is served; spikes/m2/server.mjs is not a deployment entry point. The initial Git-linked project creation may produce a protected preview; open it using the connected owner's Vercel account. Do not remove deployment protection or upgrade the plan just to view the preview.

## What to verify in the browser

1. Open the returned deployment URL. The page title is Home Studio and its heading is Make yourself a draft.
2. Confirm the Local draft only notice. Edit Display name and Introduction and inspect the preview.
3. Download JSON, paste it into Bundle JSON and select Replace draft with JSON.
4. Try invalid JSON; the existing draft must remain intact with an explicit error.
5. Reload after an edit and confirm the memory-only behavior. No Tower residency or publication result is expected.

Build success alone is not proof that the page is reachable. Record the actual deployment status, URL and browser verification separately. A preview is a UI review link; it does not establish competition conformance or free judging inference availability.

Official setup reference: https://vercel.com/docs/frameworks/frontend/vite

## Initial deployment result

- Project: ai-agents-tower, linked to mkhsu2002/AI-Agents-Tower, production branch main.
- Workspace: the owner's existing Vercel Hobby workspace; no plan upgrade, paid service or new credential was created.
- Production URL returned by Vercel: https://ai-agents-tower.vercel.app/
- Initial source commit: 69b656331fd87aff54fd9ced4c3bb10b5d5e15ac.
- Initial deployment: dpl_e6Tmp4ts1SimwaQqL9m6UtsqyaN4; target production; READY with no alias error.
- Local verification in this stage: npm run build passed and produced the same M1 JS/CSS hashes. Documentation diff checks passed. The existing 51 runtime tests and 8+8 M1 tests are historical validation; they were not rerun for these deployment configuration/docs changes.
- Online UI verification: blocked in this execution environment. Headless Chromium returned ERR_TUNNEL_CONNECTION_FAILED. The cloud browser could not read its requirements and did not navigate to the site. The web fetch path also could not access the URL. No login/protection/network setting was weakened to work around these errors.
- The local screenshot at docs/evidence/home-studio-local-preview.png is the same built UI, not proof of an online visit. The owner should open the production URL and perform the steps above. A site availability or product failure cannot be inferred solely from these environment errors.

The Git-linked project now automatically builds main pushes. Later documentation commits may create a subsequent deployment of the same application assets. Use Vercel's deployment view for the current source commit/state; do not assume that a Git push itself proves successful deployment.


## Studio integration deployment checkpoint — 2026-11-18

This section supersedes the initial application/version description above; the initial result remains historical.

- Application source: `d2d3da6a23bfef598eb43e1069afe594482cffc5`, pushed to main and verified against origin/main.
- Existing Git-linked automatic production deployment: `dpl_6enJWAjtUm5HeyiHgrszinxrfr1F`, Vercel state **READY**. No direct deploy API, new service, environment variable, credential or plan change was used.
- Public alias: https://ai-agents-tower.vercel.app/ ; deployment URL: https://ai-agents-tower-p8opizqrc-mkhsus-projects.vercel.app/ . The public alias is the intended entry point; deployment-specific protection has not been changed.
- Application now includes the two-role deterministic mock proposal flow and static development network artifacts. The local MCP fixture is not deployed. Real inference, identity, private persistence and public residency remain unavailable.
- Fresh local checks before push: lint, typecheck, build, 12 unit, 24 Studio browser and 51 runtime browser tests passed. Only local loopback cross-origin tests were executed.
- Public browser check after the push: system Chromium navigation to the public alias failed with `net::ERR_TUNNEL_CONNECTION_FAILED`. It could not inspect the page or exercise the public mock flow. READY is platform metadata, **not** online functionality verification. No protection bypass/share token or network/security weakening was used.
- Subsequent documentation-only main commits can create additional deployments with the same client assets; the source above is the verified application checkpoint, not an assertion that no later build exists.

When the page is reachable, enter a synthetic brief, approve the displayed origin, select Generate mock proposal, review/apply, edit and download JSON. Refusing origin approval must leave the current draft unchanged. A successfully validated mock proposal is still an unsaved browser draft, not real inference or a saved Home.

## Open Tower homepage checkpoint — 2026-11-21

- Implementation commit: `9feef36142e2eca4f2f61180d045d097235d6ba2`, pushed to main and matched against remote.
- Existing Vercel production deployment: `dpl_J5NUcRniKFxh2W5c4EL6wsS62Wh8`, state READY for that commit; Vite build, no new service/configuration/credential.
- Public URL: https://ai-agents-tower.vercel.app/ . A fresh Firecrawl read with maxAge=0 returned HTTP 200, updated title and welcome copy, all-agent eligibility, local artwork URL, covenant and initialized Home Studio/Atlas preview. This is current public content delivery evidence and supersedes the older claim that no remote public read succeeded.
- Direct local-browser tunneling and reference-screenshot downloading remain constrained. No public screenshot pixels or end-to-end live generation/apply/export interaction were inspected in this stage. Those claims are not inferred from READY or from page extraction, which can include hidden DOM text.
- Local production-build evidence: lint/typecheck/build and 12 unit / 26 browser tests passed; actual desktop/mobile screenshots visually reviewed. No real inference or saved/public residency exists.
- The following documentation-only commit may trigger another automatic build of the same application assets. Application checkpoint and later documentation deployment are distinguished deliberately.

## Restricted reviewer checkpoint — 2026-11-21

- Application commit `c5e4f321e45bca97c452111b6ab05a7199e8cf6d` was committed/pushed on main and origin/main readback matched exactly. The existing Git integration produced `dpl_6K6ik3nCEcRaG2R8TaDKhXCiR4fZ`, production READY, aliased to https://ai-agents-tower.vercel.app/. No direct deployment, new service, environment setting, credential or plan was created.
- Fresh ordinary public Firecrawl reads returned HTTP 200 for the homepage (new Try the demo, mode selector and validation receipt markup) and `/reviewer/status.json` (`{"enabled":false}`). No credential or protection bypass was used. Extraction can include hidden DOM text and does not prove controls were clicked.
- One normal public Playwright reviewer check was attempted. It failed at page.goto with `net::ERR_TUNNEL_CONNECTION_FAILED`, before any interaction. No live/model UI acceptance is claimed; no bypass or alternate origin was used to evade that failure.
- [Compact readback evidence](evidence/reviewer-deployment-readback.json) records the application SHA, platform metadata, public statuses and failed interaction attempt. A following documentation-only commit records this evidence without changing application assets; its Git-triggered deployment must be checked separately.
- This release exposes prepared UI wiring with live status OFF. It does not supply a model gateway, real inference, free judging capacity or second deployed HTTPS proof. Those remain explicit gates in REVIEWER-DEMO.md.

## Meta gateway preparation — 2026-11-21

- Application `98c90dea7a4862c384e1d42931d713b41c470b18` was committed/pushed to main; origin/main readback matched. Existing Git deployment `dpl_H9iDLvYxhjsewheSqoDjXbMjdXmW` reached production READY with the normal alias. No manual deploy, provider/account/credential, paid feature, billing/security change or new site was created.
- Public status remains `{"enabled":false}` (fresh HTTP 200). Fresh GET `/api/reviewer/start` returned HTTP 503 and exactly `{"error":"Live reviewer inference is disabled."}`. The homepage returned HTTP 200 with the demo entry. These ordinary public extractions verify disabled delivery, not model inference, POST acceptance or UI interactions.
- The single normal public reviewer browser test failed at initial page.goto with ERR_TUNNEL_CONNECTION_FAILED. No protection bypass, alternate security settings or private data was used. Public interactive acceptance and independent deployed HTTPS composition remain unverified.
- [Compact Meta preparation evidence](evidence/meta-reviewer-preparation.json) contains exact SHA, local test totals, public readback, the repaired trace-artifact collision and unknown provider-credit gates. A subsequent documentation-only main commit records this result and triggers the same disabled deployment; its metadata is checked separately. No real Meta or OpenRouter inference occurred.

## Cloudflare Pages handoff — 2026-11-21

Owner selected Cloudflare Pages and will perform dashboard Git integration manually. Source preparation adds a Pages onRequest adapter for the same hard-disabled reviewer API, explicit _routes.json, Node 24 build selection and a setup guide in CLOUDFLARE-PAGES.md. No Cloudflare project, live URL, credential, permission, DNS setting or deployment was created/changed. Existing Vercel hosting remains intact; no claim of a completed migration is made.

Local checks: lint/typecheck/build, 51 unit tests, Wrangler 4.166.0 Function compilation, homepage/status and eight GET/POST API checks under Wrangler's local Pages runtime, plus a local Chromium simulated review/apply/preview/download round-trip. All passed after isolating the tool's writable cache/config paths. Cloudflare public verification awaits the owner's actual deployed URL/SHA. Model status remains false and both host adapters return 503 for reviewer inference.

## Owner Cloudflare deployment and custom domain readback — 2026-11-21

The owner reported Pages deployment and configured 1st-tower.neobabylon.app. Fresh public reads returned HTTP 200 for **https://ai-agents-tower.pages.dev/** and **https://1st-tower.neobabylon.app/**. Both status endpoints returned enabled false; both reviewer-start GETs returned HTTP 503 with the fixed disabled JSON. The custom domain is reachable from the extraction source; global DNS propagation and dashboard TLS state are not inferred.

The GitHub Cloudflare Pages check for c5fb1f20c88de0b5f99881ad58ec03aa6ff972a2 is completed/success, check 136951997708, deployment 1eca5a34-9c40-4a03-b3c0-4cb294a961ee. This ties the recorded deploy check to the prepared source without asserting interactive acceptance. A normal production browser round-trip attempt at the custom domain failed at page.goto with ERR_TUNNEL_CONNECTION_FAILED; two other selected cases did not run. See evidence/cloudflare-public-readback.json.

Primary URLs, production test default, default independent-caller source and sharing image metadata now use the reachable custom domain. Vercel remains retained; no DNS, account, access, billing, key or model activation was changed. The owner-requested one-time Cloudflare variable table is in CLOUDFLARE-PAGES.md; META_API_KEY is only a reserved server binding at this checkpoint, not consumed by the hard-disabled Function.

## Meta binding presence confirmed — 2026-11-21

Cloudflare Pages check succeeded for application 0ec985ca58f920fa0e10ccaeff656731f813e08d, deployment 54af4471-df9b-4f1f-afc5-1e1ab5ba4d57. Fresh GET https://1st-tower.neobabylon.app/api/reviewer/readiness returned HTTP 200 with credentialConfigured true; enabled, connectionVerified and trialReady all remain false. Static status remains false and reviewer start remains 503. This confirms the Production runtime can see a nonempty named Secret, not its value, validity, model health, credits or spend authority. No provider request occurred. See evidence/meta-binding-readback.json. A following documentation-only commit preserves the result without changing that application code.

## Public fixed-demo gateway preparation — 2026-11-21

Cloudflare now has an edge-compatible gateway gated by both META_API_KEY and TOWER_RUNTIME D1 bindings. Vercel/static builds remain disabled. Owner setup is limited to a dedicated Production D1 binding and redeployment; model secrets remain server-only. D1 coordinates 20 starts / 60 reserved calls per UTC admission day and single-use origin-bound execution state, not private Home storage.

Fresh local checks: lint/typecheck/build, 71 unit, 42 Studio browser, 52 runtime browser and one independent local caller test passed. Wrangler compiled the Functions and actual local workerd/D1 verified consent denial, admission, cancellation and quota exhaustion without any provider call. Fixtures are not real inference. Production deployment/readback is recorded after push; a configured/READY deployment does not verify Meta, public interaction or competition conformance.


## Unrecognized first-turn 502 diagnostic release — 2026-11-21

The owner still observes GATEWAY_RESPONSE_INVALID at Reception after admission. Fresh exact turn-path GET returns the expected 403 JSON; no model POST was attempted by the assistant. The next release adds safe lifecycle logging, gateway response marker/Ray display and actual modern/legacy compiled Pages router fixtures. Lint/typecheck/build, 84 unit, 47 Studio and 24 intercepted native cases pass. This is diagnostic work; public live acceptance remains failed/unresolved. No binding, key, billing/security setting or new deployment service is changed. See [evidence](evidence/cloudflare-first-turn-diagnostics.json) and [the one-attempt live-log procedure](PUBLIC-LIVE-ACCEPTANCE.md#unrecognized-502-at-reception--diagnostic-procedure). Main Git integration remains the existing release path; application `a001c9d0c83f6cd38e96f1369b1bda14e0932fc6` completed Cloudflare success (3e7621ec-a247-42e5-81c4-902fc071c190). Fresh public /#demo GET returned HTTP 200 and the exact asset /assets/index-D5Gw9J4L.js; readiness returned HTTP 200 with enabled/credentialConfigured/trialReady true and connectionVerified false. No model run occurred in these GET checks. A documentation-only follow-up records this readback without changing application behavior.
