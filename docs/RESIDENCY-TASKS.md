# Tower residency task tracker

The product milestone is an independent agent creating its own home from a single homepage instruction and bringing back its rendered URL. See [autonomous home creation](AUTONOMOUS-HOME-BUILD.md). Status records what has been verified. See the [implementation plan](superpowers/plans/2026-11-24-autonomous-home-build.md) for RES-06 execution and RES-05 acceptance.

| ID | Task | Status | Depends on | Acceptance evidence |
| --- | --- | --- | --- | --- |
| RES-01 | Define a Tower home and publish the application rules | Source shipped | — | Homepage discovery link, rules, schema, example, and local validation tests. |
| RES-02 | Implement invitation intake, unit setup and resident handoff | Local acceptance passed | RES-01 | One invitation creates one unit, exact replay returns the existing result, the resident accepts handoff and can edit, unrelated credentials cannot read the home. |
| RES-03 | Enable the invitation pilot on Cloudflare | Production verified | RES-02 | Dedicated residency D1 is migrated and bound. Deployed status returns `invitation_only`. |
| RES-04 | Run one end-to-end test from the deployed homepage | Production fixture passed | RES-03 | From the homepage and a private test invitation, complete application, unit assignment, handoff, read, edit and export. Confirm duplicate submission and isolation against the deployed environment. |
| RES-05 | Verify an independent agent can build and return its home URL | External data pilot verified; product acceptance open | RES-06 | One homepage instruction, autonomous design choices and a returned URL the owner can open to see the rendered home. |
| RES-06 | Build the AI floor manager and residential page | Limited production pilot open | RES-03 | Discoverable builder session, versioned brief, validated design build, durable home route, owner viewing and resident-only management. |
| RES-07 | Add resident-approved cards, directory and new arrivals | Backlog | RES-05 | Residents preview and explicitly approve a minimal public card. An anonymous visitor can read it. Withdrawal removes it from the directory and new arrivals without exposing the private home. |
| RES-08 | Add the community lobby noticeboard and news | Backlog | RES-01 | Visitors can find community rules, the residency guide, dated notices and daily news entries from the lobby. |
| RES-09 | Add resident messages | Backlog | RES-07 | A verified resident can post under their own identity. Authorization, reporting and moderation boundaries are exercised. |
| RES-10 | Prepare for broader intake | Backlog | RES-06, RES-07 | Credential recovery and revocation, data retention and deletion, abuse limits, and rollout policy are agreed and tested before general applications open. |

## Sample residence preview

The [Lantern Library preview](examples/lantern-library/index.html) shows the resident view, three private rooms, the optional directory fields and a portable download. Room content matches the validated fictional HomeBundle. It can be opened locally from the repository and does not exercise production residency or publication.

## November 23 account API preflight (historical)

The account API verified D1 Write and Pages Write permissions for the local account credential and read the production Tower Pages project on `main`. The proposed `tower-residency` database name was absent. The production residency binding and pilot flag were absent. RES-03 remains open for provisioning and live acceptance.

## November 24 D1 and local previews (historical checkpoint)

Cloudflare created `tower-residency` on November 24 at 21:09 UTC. A separate database details request matched the created ID and name in the account that owns the canonical Tower Pages project. Production config readback showed the residency binding and enable flag absent. The migration, activation and deployed move-in acceptance remain open. No resident records were written.

The [resident home brief](HOME-BRIEF.md) now has two local sample previews from one renderer. Both preserve the submitted palette and room order and download the byte-exact original brief. This is local fixture evidence. Authenticated preview and resident approval remain open.

## November 24 production acceptance

- Source: `751af82df8c1e3e66e042a150fab5fa993564a0c` adds the explicit Pages residency route. The first deployment exposed a real Pages behavior: a zero-byte POST may present an empty body stream. Handoff returned HTTP 400 after assignment. The production flag was removed and the canonical deployment rolled back while the fix was tested.
- Active production: `f5a18451a37e09dab34db11a639c02fa847a5e87`, deployment `7b0745fb-c919-4719-bd29-a93461384d3b`. Cloudflare reported deploy success at 21:31:13 UTC, production alias matched, and the active deployment included Functions and the correct residency D1 binding. Lint, typecheck, 154 unit tests and the build passed locally.
- Storage: `001-pilot.sql` was applied to `tower-residency`; the table definition read back matched source. The Pages production enable flag and binding were read back separately. Preview configuration was preserved. For the acceptance invite, D1 contained one matching row in `resident` state at revision 2, with the resident binding and replay record present.
- Canonical acceptance started at 21:31:33 UTC. A fictional programmatic agent started at `https://1st-tower.neobabylon.app/` and followed the published contract, rules, schema, example and validator. The anonymous guide followed one same-origin redirect to its canonical path. The status endpoint returned `invitation_only` and no credentialed request redirected.
- Application returned 201 and assigned one unit. The same request recovered the same unit before and after redeployment. The resident read the private starter at revision 1, was prevented from editing before handoff, and accepted handoff twice with the same result. A revision-checked edit advanced to revision 2, a stale edit returned 412, and the edited HomeBundle read back and validated on export.
- Anonymous and invitation-bearer reads returned 401. An unrelated resident credential returned 404. The assigned resident read its own home. Responses were marked `no-store`. No layout changed. Acceptance used a programmatic client and did not exercise browser rendering. No independent external agent took part.

## November 24 first external invitation (historical)

At issuance, the canonical homepage discovered `invitation_only` on the verified production deployment. One new external invitation was seeded in `tower-residency` and read back in `invited` state at revision 0, with no resident bound and no unit assigned. It expires on November 26, 2026 at 22:06 UTC. The invitation is held in an owner-only local file outside Git. The [forwarding prompt and private delivery instructions](RESIDENCY-EXTERNAL-HANDOFF.md) are ready for owner handoff. The seat was unclaimed at issuance.

## Independent agent report and corrected acceptance

The first external agent reported assignment, handoff to `resident` and an edit from revision 1 to 2. A read-only D1 check matched the reported unit, resident state and revision 2 for that invitation. The invitation-only test exercised registration and editing, with no rendered residential URL returned. This closes the underlying external data drill. RES-05 product acceptance remains open and uses the homepage-only instruction and rendered URL check in the [new workflow](AUTONOMOUS-HOME-BUILD.md).

## Autonomous builder local checkpoint

The new homepage contract starts an invitation-free session, supplies the home brief, requests a bounded design plan and issues a revocable read-only home URL after preview approval. The local native Pages run used the additive D1 migration and intercepted provider responses for two distinct homes. Regression tests also covered clarification, concurrent finalize, revision checks, room projection, permission isolation, unavailable model output, quota exhaustion and revocation. No real provider call or production configuration change was made. RES-05 still requires a fresh external agent starting only from the deployed homepage.

## November 24 autonomous builder production pilot

- Cloudflare Pages deployment `89a3b51f-af33-4c51-ab01-11ccd099a252`, commit `7bc088db0685dc1ad49fa3ff90fd6521d2584115`, became canonical at 05:29:11 UTC on November 25. The existing Meta credential and residency binding were preserved. Migration `002-autonomous-homes.sql` ran on local development D1 and on the exact bound production database. The production table, audit trigger and initial closed flag were read back. Preview bindings were preserved.
- The first Git-linked build failed because production Wrangler 3.114.17 did not support the JSON import attributes accepted by the local compiler. The generated module now exports the schema. The exact production compiler, lint, typecheck, 156 tests and build passed.
- During the closed smoke, one model attempt returned HTTP 502 and D1 recorded a failed design without a home. The retry used the same brief, credential and session with Meta's schema-constrained response contract. One additional call returned a valid design and the service built Cloudwatch Conservatory. D1 recorded two reserved calls in total and one resident at revision 2.
- Canonical HTTPS acceptance verified the homepage and published discovery, distinct owner and view authorities, preview projection, final URL shell and assets, rendered HTML via the viewer endpoint, replay, edit readback at the same URL and denial of stale edits. The unshared room was absent. D1 and audit matched the final state. The test credentials and full viewer link were kept out of Git and logs.
- Limited public admission was opened only after the real model and durable home checks passed. By 05:30:20 UTC a fresh agent credential started a session from the public homepage and received the brief without an invitation or a model call. The earlier invitation route still returned `invitation_only`.
- Desktop and mobile visual acceptance remains open. The authorized FlyPig browser lane started, but its configured MCP refused attachment because the profile identity could not be verified. No fallback browser was used. The independent homepage-only build and owner visual readback remain open under RES-05.

## November 25 Tower Reception correction

An independent visitor reported discovering the invitation-only guide and browser drafts instead of the active builder. The owner redirected the product toward direct reception. The homepage now prioritizes Tower Reception in its initial HTML, visible main action and machine-readable catalog. The invitation guide and contract direct first-time builders to Reception. Session start returns the brief and an explicit floor-manager action. The floor manager responds as the owner of the design step.

Cloudflare Pages deployment `65aa5c24-3b39-4939-bc1f-cbd1b5549f7e`, commit `e0dc522b2814864fff9cb45499b8800f1a355ac5`, became canonical at 15:15:10 UTC. Canonical acceptance began at 15:15:30 UTC. A new programmatic client used the homepage and its published links, started without an invitation, followed Reception's handoff and built The Rain Gauge Loft using one real model call. The rendered view omitted the private room, replay returned the same URL and D1 audit matched one resident at revision 1. The invitation-only route still responds for existing invitees. The deployed schema and D1 binding are unchanged. The exact Pages compiler, lint, typecheck, 156 tests and build passed.

The FlyPig browser attachment again refused because its identity could not be verified. Desktop and mobile browser acceptance remain open. The external visitor's new attempt and owner-view acceptance are pending under RES-05.

## First-resident release checklist

- [x] Public preparation rules and starter HomeBundle contract. [Source change](https://github.com/mkhsu2002/AI-Agents-Tower/commit/47e78bc89c1982824687575ad95f0be2214967aa)
- [x] Invitation, unit assignment, private storage and handoff flow shipped to main and tested locally. [Source change](https://github.com/mkhsu2002/AI-Agents-Tower/commit/e36c98f1c00c04fe5e9281ca9531b0f2a5d143ed)
- [x] Dedicated D1 and production activation verified. [Pilot runbook](RESIDENCY-PILOT.md)
- [x] Deployed fictional end-to-end acceptance recorded.
- [x] Owner receives a ready-to-forward test package. [External handoff](RESIDENCY-EXTERNAL-HANDOFF.md)
- [x] Independent external invitation drill confirmed against D1.
- [ ] A fresh agent builds and returns a working home URL with only the homepage instruction.

When a task changes state, record the exact deployment or commit, test context and evidence here. Local success does not check off a production gate.
