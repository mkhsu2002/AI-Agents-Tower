# Deploy this repository with Cloudflare Pages

The owner will perform the Cloudflare dashboard deployment. This repository is prepared for Pages Git integration; no Cloudflare account, project, token, secret or DNS setting was created or changed by this preparation. Existing Vercel hosting is retained until a separate decision to remove it. Cloudflare deployment and public interaction are not verified yet.

## Dashboard setup

1. Open Cloudflare's **Workers & Pages** dashboard. Select **Create application → Pages → Connect to Git** (wording may vary with the dashboard version).
2. Choose GitHub and select **mkhsu2002/AI-Agents-Tower**. If it is missing, configure the existing Cloudflare GitHub app to allow this repository; use the repository selection, not broader access than needed. Do not copy a token from another project or post it in chat.
3. Select these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Leave empty (repository root) |
| Node.js | `24`, pinned by the repository's `.node-version`; `NODE_VERSION=24` may also be set in build variables if the dashboard requires an override |
| API/model secrets | None required for this release |

4. Select **Save and Deploy**. Use Git integration rather than manually dragging only dist files: the root functions directory must be compiled too.
5. Open the exact `pages.dev` URL returned by Cloudflare. Keep the deployment's source commit and build log available. Do not assume a hostname before Cloudflare assigns it.

The Cloudflare GitHub integration handles repository access. A GitHub Actions Cloudflare API token is not needed for this dashboard path. No GitHub Actions workflow is added. No Meta key, paid plan, database, custom domain or real inference is needed to deploy this draft Studio.

Official references checked 2026-11-21: [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Node build version](https://developers.cloudflare.com/pages/configuration/build-image/), [function routing](https://developers.cloudflare.com/pages/functions/routing/).

## What the Pages adapter does

Cloudflare does not use Vercel's api routing or vercel.json rewrites. `functions/api/reviewer/[[path]].ts` exports a Pages onRequest handler and delegates to the same unconditionally disabled reviewer response. It reads no bindings, secrets or request body and makes no provider calls. The committed `public/_routes.json`, copied into dist during Vite build, restricts Function execution to `/api/reviewer` and its children; homepage and public assets stay static.

The current function only returns HTTP 503 with `{"error":"Live reviewer inference is disabled."}`. This is the expected release behavior, not a failed model request. `/reviewer/status.json` remains `{"enabled":false}`. Adding a Meta key by itself cannot enable inference. The Node-only offline gateway is not imported into the Pages function and is not represented as a production Cloudflare runtime integration.

## Checks after the owner deploys

- Homepage/artwork load on desktop and mobile; Home Studio navigation works.
- A Simulation run with explicit consent produces a proposal; review, Apply, edit, preview, Download JSON and reimport work.
- `/reviewer/status.json` returns JSON with enabled false.
- GET or POST `/api/reviewer/start`, `/api/reviewer/cancel` and `/api/reviewer/v1/chat/completions` return the disabled JSON with HTTP 503, rather than SPA HTML. These checks must not trigger a provider call.
- Live demo remains unavailable and does not silently fall back to Simulation. Draft content is not saved to browser storage or a server.

Send back the assigned public URL and deployment commit (no secrets). Public verification follows on that exact deployment. READY/successful build alone is not an interaction pass or competition conformance evidence. Independent deployed HTTPS composition is still a separate gate; keeping two hosting aliases does not automatically satisfy it.

## Later Meta setup

The earlier Vercel Preview key instructions are superseded by the owner's Cloudflare hosting choice. Do not add a key to Vercel for this deployment. After the runtime/quota integration is ready, an authorized key would belong only in the appropriate Cloudflare environment's encrypted server secret, never a VITE_* variable, public file, browser input or chat message. No key is consumed by the current adapter, so there is no reason to create or transfer one for this release.

A new official billing check found that Meta's [Spend Limit is an alert, not a hard usage cap](https://dev.meta.ai/help/billing/spend-limit-alert). It cannot prove paid overage is disabled. Free-credit amount/expiry, team scope and an enforceable credit reservation boundary remain unverified; no live model trial is authorized by merely deploying Pages or setting an alert.

## Preparation verification — 2026-11-21

Lint, typecheck, Vite build and all 51 unit tests passed. Wrangler 4.166.0 was run from an isolated temporary npm cache (no dependency or lockfile change) and compiled the Pages Function successfully. Its local Pages runtime at 127.0.0.1 passed homepage/status checks and eight GET/POST reviewer route checks, all returning the expected disabled JSON with no-store. A real local Chromium run completed simulated generation, review/apply, preview and JSON download with no page errors. No model call was made.

The initial local command could not write Wrangler's default home config/cache; it was rerun with isolated temporary config/log paths. Request.cf metadata lookup was unavailable and Wrangler used its documented local placeholder. These are local checks, not Cloudflare account authorization, deployment or public acceptance. No Cloudflare login/token/account/zone/project API was used.

Once the owner returns the actual Pages URL, update production verification targets and final sharing metadata as appropriate. The current og:image still points to the existing Vercel-hosted public artwork; no unknown Pages hostname is guessed. The production test and independent-caller package still default to the known Vercel source until a verified replacement is available.
