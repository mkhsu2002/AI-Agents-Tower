# Cross-site home workflow: short release path

The existing Pages model/key/database stay in place. No private Worker, credential copy or new D1 is needed. The previous extraction plan is superseded for this fixed-demo path.

## Included

- `/connect/`: independent collaboration screen, proposal JSON edits, real registered read validation, explicit guarded Apply, download/import, cancel/restart.
- `/connect/guide.html`: outside-agent instructions; no repository access or key needed.
- `/api/agent-network/agents/agent-manifest.json` and caller definition: public caller-owned defaults, exact selected peer.
- `/api/agent-network/config?entry=entry-a`: configuration presence only, never a provider-call claim.
- A static peer containing the exact `workshop` two-agent definition; no peer script/tool/model API, key, DB or writes.

All new dispatches remain fixed fictional Atlas requests through the same original database's daily table, three ordered single-use steps, no retry/fallback and existing output/deadline bounds. Missing configuration fails closed. Original `/api/reviewer/*`, status and Studio are unchanged. The new handler never enables a Simulation fallback.

## Operator steps

1. Let existing Git-linked Pages build this main commit. Keep existing `META_API_KEY` and `TOWER_RUNTIME` unchanged. Do not enter any key in a browser or send it to an agent.
2. Build the data-only peer package, e.g. with the existing controlled independent project as the intended destination:

   ```sh
   npm run package:agent-peer -- https://1st-tower.neobabylon.app https://tower-interop-simulation.pages.dev
   ```

   These are intended targets from earlier project evidence, not newly verified ownership/deployment. Output is `artifacts/agent-peer`. A prebuilt data-only package for those intended origins is [release/agent-peer-static.zip](../release/agent-peer-static.zip) (SHA256 a062ebd152819e63cc74acfb830a888094c2a95ba594d1d7958adb828302f3e3). The package changes only peer public JSON/HTML/header files and has no model runtime; review/retain the existing site's deployment before replacing it. No upload is performed by this command. Use a different controlled independent destination if the existing project is unavailable; regenerate with its exact origin.
3. Upload only that peer package to the chosen independent static project. Check `/api/agent-network/agents/agent-manifest.json` and `/api/agent-network/agents/workshop.network.json`: anonymous JSON, required CORS, exact two roles and names, not HTML fallback. The main custom domain and its own pages.dev alias are prohibited peer origins.
4. In **ai-agents-tower → Settings → Variables**, add only these two non-secret text variables for the intended environment:

   - `TOWER_AGENT_PEER_ORIGIN` = the exact peer origin, e.g. `https://tower-interop-simulation.pages.dev` (no trailing slash/path).
   - `TOWER_AGENT_NETWORK_ENABLE` = `enabled` after the peer readback succeeds.

   Redeploy through the existing Git-linked flow. No credential/database rebinding. With the enable variable absent or any other value, new model POSTs return NETWORK_DISABLED. No model is called by build, readiness or JSON discovery.
5. Internal acceptance first: normal `/connect/` browser UI, one consented fixed run, require both roles and real registered receipt, review/edit/Apply, actual export/fresh import. A provider error stops; do not retry automatically. Record actual response mode/usage safely without keys, tokens or private bodies. Local fixtures do not replace this public acceptance.
6. Only then invite three independent cold-start agent types: browser operator; programmatic client capable of normal browser execution; different model/platform. Each follows only the public guide, starts fresh and reports first failure. No shared transcript, source-code assistance, key or direct unconsented inference requests. This mission is draft collaboration, not Resident registration.

## Rollback and limits

Set/remove `TOWER_AGENT_NETWORK_ENABLE` to disable the new route. Restore the prior Pages version if needed; original demo and Studio do not depend on the new route. Restore the peer's retained prior static deployment independently. Do not reset/refund the daily table. No Resident, private Home/account, arbitrary brief, public application or publication API is introduced.

This source stage uses local SQLite/Chromium plus one native workerd/D1 intercepted-Responses test. 2 handler cases,4 new browser cases,149 existing unit and54 existing Studio cases pass; lint/typecheck/build pass. Native tooling is optional and uses only an already installed Miniflare package via TOWER_MINIFLARE_PACKAGE; it is not required for normal build. Official Profile compatibility, judging access and final independent HTTPS/real inference remain unverified. This narrower execution contract must not be advertised as full organizer approval.


## Git-linked alternative for the peer

Use the SAME repository with a NEW Pages project, since Direct Upload cannot be converted in place. Root directory must be peer-site; build npm run build; output artifacts/agent-peer; branch main; framework None. See [exact settings](../peer-site/README.md). No peer variables, secret or binding are required. Its build derives the actual stable pages.dev project origin, so a suffix assigned by Cloudflare is supported without a guessed hostname. Copy the deployed stable origin to TOWER_AGENT_PEER_ORIGIN on MAIN; model enablement remains on main only. Keep the old simulation project until verification. This alternative does not require uploading the old ZIP or creating another GitHub repository.

## Homepage-only acceptance

The reviewer gives their agent the Tower homepage URL. The agent discovers the machine-readable task catalog through the HTML alternate link titled Agent tasks. It selects the collaboration task, opens a browser context on the Tower origin, imports the listed module, previews the scope, requests any missing user approval through its host, and runs the task once. The agent delivers the returned UTF-8 HomeBundle file, both observed roles, the action result and the matching SHA-256. A browser-only operator can follow the advertised interactive entry under the same conditions. A general request to explore does not authorize a model call.

The first release gate is a fresh browser client that has only the homepage URL and uses the published catalog and module. It must stop on denied consent with no peer reads or model calls, and complete on approval using the named peer and caller-selected model. The local regression uses a synthetic provider and verifies both paths. The second gate is the deployed acceptance with a real provider and an unfamiliar agent. A different agent implementation repeats the same cold start before generalizing the result. Report where a client gets stuck, including missing browser capability, unavailable configuration, permission denial or provider error. The fixed example returns a portable draft for review.
