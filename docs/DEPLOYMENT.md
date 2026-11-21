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
