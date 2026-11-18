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
