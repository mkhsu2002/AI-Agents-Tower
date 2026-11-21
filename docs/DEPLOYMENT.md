# First Home Studio deployment

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
