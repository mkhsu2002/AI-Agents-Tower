# Deploy this repository with Cloudflare Pages

The owner completed the Cloudflare dashboard deployment and custom-domain setup. Fresh public reads on 2026-11-21 returned HTTP 200 at https://ai-agents-tower.pages.dev/ and https://1st-tower.neobabylon.app/. The custom domain is now the primary project URL. This repository is prepared for Pages Git integration; no Cloudflare account, project, token, secret or DNS setting was created or changed by this preparation. Existing Vercel hosting is retained until a separate decision to remove it. GitHub reports the Cloudflare Pages check successful for c5fb1f20c88de0b5f99881ad58ec03aa6ff972a2; public content/disabled API readback is verified separately from browser interaction.

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

Cloudflare does not use Vercel's api routing or vercel.json rewrites. `functions/api/reviewer/[[path]].ts` exports a Pages onRequest handler and delegates to the same unconditionally disabled reviewer response. Inference routes read no bindings or request body and make no provider calls. The separate GET /api/reviewer/readiness reports only binding presence, without a provider call or secret disclosure. The committed `public/_routes.json`, copied into dist during Vite build, restricts Function execution to `/api/reviewer` and its children; homepage and public assets stay static.

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

After the owner supplied the deployed URL, production verification, default independent-caller source and og:image were switched to the reachable custom domain https://1st-tower.neobabylon.app/. Historical Vercel evidence remains preserved; two hostnames of this deployment are not independent interoperability proof.

## One-time variables and model setup

For the owner-selected Meta preparation, use **Workers & Pages → ai-agents-tower → Settings → Variables and Secrets → Add**. Select the environment explicitly. Cloudflare stores Production and Preview bindings separately.

| Name / setting | Value | Type / environment | Current behavior |
| --- | --- | --- | --- |
| `META_API_KEY` | A Meta Model API team key designated for this independent project; enter it directly in Cloudflare | Secret: select Encrypt; add separately to Production and Preview if preparing both | Reserved binding name for the next server integration. Readiness reports presence only; inference remains hard disabled and cannot call Meta. |
| `NODE_VERSION` | `24` | Plain build variable, Production/Preview; optional because `.node-version` already selects 24 | Build configuration only; not a model permission. |
| Model | `muse-spark-1.3` Standard | Pinned server constant; no dashboard variable required | Offline/scripted contract only until the real server adapter is implemented and authorized. |
| Provider endpoint | `https://api.meta.ai/v1/responses` | Pinned server constant; no dashboard variable required | No live request is sent by this release. |

Do not create META_MODEL, provider-URL or live-enable flags for the current release; none is consumed. No CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, GitHub token, database binding or VITE_* model variable is required for Pages Git integration. Store no actual key in a public config, repo, browser input or chat. Local .dev.vars files are ignored as an additional guard; the owner is being directed to Cloudflare's encrypted dashboard entry, not asked to transfer a secret here.

[Cloudflare's secret instructions](https://developers.cloudflare.com/pages/functions/bindings/#secrets) specify Encrypt and Save. A new deployment is needed for a Function that consumes a binding; the current release remains off even after a redeploy. The next server release must read context.env.META_API_KEY rather than a Vite build-time variable, keep credentials out of responses/logs, enforce the fixed synthetic scope and quota/cost policy, and undergo a separately bounded trial. Saving the key does not prove validity, account credit/expiry or permission for unlimited public usage.

## Confirm the saved Secret

After the readiness release deploys, open `https://1st-tower.neobabylon.app/api/reviewer/readiness`. Expected fields: enabled false, credentialConfigured true if the runtime binding exists and is nonblank, connectionVerified false, trialReady false, and the pinned model. A false credentialConfigured means absent/blank/wrong-type runtime binding; null means the presence check could not read the binding. Neither true nor a successful deployment validates the credential with Meta. The response is no-store/noindex; POST is rejected and the endpoint never calls a provider. Vercel does not expose this Pages-specific diagnostic.

Actual Meta credentials are consumed only by a future authorized provider connection, not by the current disabled inference routes. Do not treat presence as spending approval; the owner still needs to report free balance/expiry and establish the credit boundary before a real trial.
