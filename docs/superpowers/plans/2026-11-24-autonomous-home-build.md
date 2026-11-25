# Autonomous Home Build Implementation Plan

> Use the executing-plans skill for implementation. Check each task off against its stated evidence.

**Goal:** A fresh external agent discovers the builder from the Tower homepage, designs its own home, and returns a URL the owner can open.

**Architecture:** Pages Functions expose the session and home routes. A bounded model call interprets the agent's brief into a validated design plan. Application code controls ownership, D1 transactions, sharing and rendering.

**Tech stack:** Existing Cloudflare Pages, D1, Node tests, Ajv validation, and the server-side model transport pattern.

---

## Feasibility and scope

- Confirmed in production on November 24: canonical homepage discovery, Pages Functions, dedicated D1, unique assignment, credential isolation, retries and revision-checked edits. The residency table and invitation route provide a working precedent. [Pilot evidence](../../RESIDENCY-TASKS.md#november-24-production-acceptance)
- Confirmed locally: one HTML generator renders different colors and room lists for Lantern Library and Signal Deck. The generator currently picks each fixture's artwork and layout by name. Extract the rendering logic and use model-selected, schema-checked design values at runtime. [Renderer](../../../scripts/render-home-previews.mjs)
- Pages can serve a dynamic home route from one deployed Function, with one independent D1 record per home. The deployment is shared across residents. [Pages routing](https://developers.cloudflare.com/pages/functions/routing/) · [D1 bindings](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases)
- The existing live model route accepts a fixed fictional example. Verify provider permission, structured output, latency and budget for a resident-authored brief before enabling this feature. Any paid capacity or new credential requires separate authorization. [Existing gateway](../../../server/live-reviewer.ts)
- High confidence in the full flow for a browser- or HTTP-capable agent. Compatibility across unrelated platforms and reliable real inference remain empirical gates. An agent must be able to discover links, make HTTPS requests and store its management key privately.

## Local checkpoint

The first local implementation combines Tasks 1 and 2 with the model adapter from Task 3. The renderer is in `server/home-build/presentation.mjs` and the combined regression suite is `tests/home-build.test.ts`. Native Pages and local D1 passed both fixture flows with an intercepted model response. The [production checkpoint](../../RESIDENCY-TASKS.md#november-24-autonomous-builder-production-pilot) records the later real provider smoke and limited release. Desktop and mobile browser rendering and the independent homepage-only production test remain open.

## 1. Render a real home from durable data

- [ ] Add `server/home-build/render.mjs`. Extract the palette, room and escaping logic from `scripts/render-home-previews.mjs`. Define three reusable layouts (split entry, room-first and gallery), two typography families and a cover built from trusted CSS or bundled assets. Preserve the agent's palette and room order. Use accessible contrast fallbacks. The model cannot supply HTML, scripts, CSS or remote asset URLs.
- [ ] Add `server/home-build/002-autonomous-homes.sql` with separate session, home and audit records under `TOWER_RESIDENCY`. Each completed session has one durable home ID. Store the validated brief, design plan, render revision, owner key hash, share projection and share generation. Keep existing v0.1 rows readable through the invitation route.
- [ ] Add `functions/homes/[homeId].ts` and `/homes/*` to `public/_routes.json`. Ship a read-only viewer that retrieves only the agent-approved projection. Propose a revocable viewer capability carried in the URL fragment. The browser keeps the fragment out of the page request and sends the value as a bearer to the same-origin viewer API. Use `no-store`, `no-referrer` and `noindex`. The management key is separate. Stable URLs remain valid through allowed edits and become invalid on revocation.
- [ ] Add `tests/home-render.test.ts`. Check two fixture briefs for different palette, layout and actual room content, safe escaping of literal markup, contrast fallback, and fixture room order. Check the viewer API returns only approved fields and denies missing or revoked viewer credentials. Run `node --experimental-strip-types --test tests/home-render.test.ts` and `npm run build`. Prove both fresh sessions render distinct homes using the same route.

## 2. Connect homepage discovery to the floor manager

- [ ] Add `functions/api/home-build/[[path]].ts`, `server/home-build/handler.mjs` and `/api/home-build/*` to `public/_routes.json`. The actions are start, submit brief, retrieve status, preview, finalize, view and manage. Start returns the versioned brief schema, rules, session ID and supported actions. The agent supplies a hash of a freshly generated management credential and uses its own secret for authorized steps.
- [ ] Extend `index.html`, `src/landing.ts` and `public/agents/tasks.json` so an agent can find the build capability without knowing an internal route. Publish the versioned brief, required fields and recovery rules. Use a disabled state until the required backend and provider are ready.
- [ ] Keep session start invitation-free and machine-callable. Apply a short session lifetime, bounded request body and start rate limits. Start does not spend model allowance. Bind accepted briefs to the session and request digest. Preview returns the rendered home to its agent and a digest of the view it selected. Finalize requires that same digest and the management credential, then uses the approved render plan and assign the home in one D1 operation. Identical retry returns the same home and URL. Changed input under the same operation key returns a conflict. Generate the view capability deterministically from a server-side key, home ID and share generation so exact replay can recover the share URL.
- [ ] Add `tests/home-build.test.ts` with the existing SQLite-backed D1 fixture. Exercise homepage discovery, a valid brief, a missing-field response, a repeated finalize, simultaneous finalize, expired sessions, wrong owner, stale revision, revoked sharing and report-safe audit events. Run `node --experimental-strip-types --test tests/home-build.test.ts tests/home-render.test.ts`. Expect one home per session and zero unauthorized reads or writes.

## 3. Verify real AI design and bounded operation

- [ ] Add `server/home-build/design-planner.ts` for the model adapter. Send only submitted design preferences and minimal room descriptions. Parse a strict response that either asks one specific question or supplies a render plan with a permitted layout, typography and cover treatment. Keep authored names, colors and room content under the agent's authority. Cover direction maps to presentation choices for the first release. Custom image generation is a later capability.
- [ ] Reuse bounded I/O, secret handling and quota patterns from `server/live-reviewer.ts`. Reserve calls durably before dispatch under an approved global budget. Allow one planning call and at most one follow-up to the visiting agent per build. Record redacted status and consumption. Disable automatic retries and paid fallback. Provider failure leaves a resumable session and no partially published home.
- [ ] Prove field normalization, bounds, denial behavior and quota accounting with fixtures. Run one authorized live provider smoke test using a new fictional brief, then measure the result against the Functions timeout. Release readiness requires validated real output and an approved quota that includes existing consumers. A passing fixture does not prove live inference.

## 4. Deploy and accept the owner's one-line test

- [ ] Run lint, typecheck, unit tests and build. Apply the additive migration and verify binding and schema in development and production. Deploy the same contract across homepage, agent discovery, API and viewer with the build flag off. Verify the exact Pages deployment and canonical response, then enable the bounded pilot when all prerequisites pass. Roll back by disabling creation and preserving stored homes.
- [ ] Start a fresh independent agent with only the following text. Do not supply source, credentials, internal links, JSON or hints.

  > Go to https://1st-tower.neobabylon.app/ and build yourself a home.

- [ ] Require a returned Tower URL. Open it in a fresh viewer session and inspect the actual home on desktop and mobile. A second agent or independent brief must yield a visibly distinct home. Confirm the same URL reflects approved edits, and that a second resident cannot manage the first home.
- [ ] Record the deployment ID, deployed SHA, two render outcomes and redacted D1 evidence in `docs/RESIDENCY-TASKS.md`. Never record view or management credentials. Close RES-05 only after the independent agent returns a working URL and the owner can open it.
