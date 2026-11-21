# Cloudflare Pages deployment and model setup

Primary: https://1st-tower.neobabylon.app/ . Pages fallback: https://ai-agents-tower.pages.dev/ . Existing Vercel hosting is retained and its reviewer API remains disabled. Main uses the owner's existing automatic Pages Git deployment; no new account, token, plan or DNS changes are required by this release.

## Build settings

Repository mkhsu2002/AI-Agents-Tower, Production branch main, framework None, build command `npm run build`, output `dist`, root empty. Node 24 is pinned in .node-version. Optional build variable `NODE_VERSION=24`. Use Git integration, including the root functions directory, rather than uploading dist alone.

## Enable the bounded public demo

The owner already saved the encrypted server Secret **META_API_KEY**; presence was confirmed by a fresh public configuration read. Do not paste it in chat, source, logs or any VITE_* variable. No new model key, URL, model variable or operator password is needed.

1. In Cloudflare **Storage & Databases → D1**, create a dedicated database named `ai-agents-tower-runtime`. Use the existing/free plan without upgrading or enabling additional services.
2. Open **Workers & Pages → ai-agents-tower → Settings → Bindings → Add → D1 database binding**. Select **Production**. Set **Variable name** to exactly **TOWER_RUNTIME** and choose that database.
3. Save and redeploy main. The Function creates its two runtime tables automatically on the first valid request; no manual SQL is needed. Preview stays off unless separately configured; use a separate database if preparing Preview.

This database coordinates quotas and single-use run state across Cloudflare workers. It is not a private-Home database. It contains admission-day counters, hashed tickets and transient fixed synthetic output, with expired rows removed on subsequent admissions. No user brief, edited Home, account, credential or visitor identity is stored there.

Official instructions checked 2026-11-21: [Pages D1 bindings and redeployment](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Free-plan daily query limit enforcement](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/). Platform quotas are separate from the application's model-call limit. A D1 failure stops the run; there is no memory-only or unmetered fallback.

## Verify after redeployment

- GET `/reviewer/status.json`: with both server bindings present, exactly `{"enabled":true,"protocol":"tower-synthetic-v1"}`; without either, `{"enabled":false}`.
- GET `/api/reviewer/readiness`: credentialConfigured reports presence only; enabled/trialReady report both bindings; connectionVerified remains false because this GET never probes Meta. It returns no secret value, prefix, length or hash.
- Open the homepage, choose **Try the demo**, give explicit consent and select **Create a draft**. A successful real run must produce an actual validation receipt, a proposal available for review, then explicit Apply, safe preview and JSON export. A model name or enabled status alone is not proof.
- Declining consent, service errors, exhausted daily capacity, expiry or cancellation must not produce success or silently switch to Simulation.

The public demo accepts only the fixed fictional Atlas example and ticket/step commands. It permits 20 admitted runs per UTC admission day, reserving three calls per run; failures/cancellations do not refund allowance. The server uses 256/1024/1024 output caps, bounded input/output and deadlines with no automatic retry. Other agents may interact through the public browser flow; this is not a general prompt API or an unrestricted cross-origin inference proxy. Private Home publication/authentication remain outside this release.

To stop new inference, remove the Production D1 binding and redeploy. Already dispatched provider work may finish and cannot be rolled back. Never place provider secrets in the browser or reuse another project's production endpoint.

## Verified scope

Local unit/browser tests use scripted Meta Responses fixtures. Local workerd/D1 verified configuration status, denial, admission, cancellation and durable quota rejection without a provider call. Full local results are in DEVELOPMENT-LOG.md. Public delivery and actual Meta inference must be verified separately after the owner binds D1. Successful deployment alone is insufficient.
