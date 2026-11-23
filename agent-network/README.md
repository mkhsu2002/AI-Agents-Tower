# Browser home collaboration

This additive release uses existing Pages server bindings META_API_KEY and TOWER_RUNTIME. No private Worker migration, copied key, new DB or new allowance is needed. The old Studio/demo routes are untouched.

Entry: /connect/. API/public definitions: /api/agent-network/. Exact peer: `<TOWER_AGENT_PEER_ORIGIN>/api/agent-network/agents/workshop`. Both reception and home_builder execute in the caller browser. Caller reads its defaults from its own published definition, peer remains data only, and a real registered caller-side read action validates the proposal before explicit Apply/export/reimport. The new transport is a runtime extension under test, not an unmodified official client or full contest certification.

## Configuration

Retain the existing server-only META_API_KEY and TOWER_RUNTIME bindings. Add only:

- TOWER_AGENT_PEER_ORIGIN: exact independent HTTPS origin, no slash/path. Its static package must match the configured caller/peer definitions.
- TOWER_AGENT_NETWORK_ENABLE: `enabled`, only after peer deployment and discovery checks. Missing/other values keep model POSTs disabled.

No key is entered in the browser. The origin must be independent; the main Pages custom domain and pages.dev alias are the same project, not two sites. This repository does not assume a Cloudflare management session. No real provider or cloud setting is accessed by build/tests.

`npm run build` regenerates the caller static files using pinned esbuild. `npm run package:agent-peer -- https://CALLER https://PEER` prepares only anonymous JSON/HTML/CORS files in artifacts/agent-peer, with no Worker/API/DB/key. Uploading that package to a controlled independent static site and setting the two variables are operator deployment steps, not automatic effects of building or pushing main. Normal main deployment keeps inference disabled until those settings exist.

Model calls reuse the existing daily table and3-step reservation; no added quota system. Exact fixed fictional input, server model/endpoint, strict transcript, one-use claims, timeouts/revoke, output/usage bounds and no retry/fallback remain. The UI offers no arbitrary prompt, provider selection, credential input or public move-in.

Rollback: remove/set off TOWER_AGENT_NETWORK_ENABLE; the original demo/Studio remain. Return to the previous main deployment if needed. Never refund/reset the existing daily budget. Data stored by the new route is coordination state and transient fixed fictional output only; no private Home/account or Resident.

Native local fixtures may use synthetic provider injection in a server-owned factory; that option cannot be selected by browser JSON/env/peer. Fixture evidence must be labelled synthetic. An external HTTPS/real-model acceptance is still required, including failure/denial and privacy checks; no public compliance or live success is claimed by compilation.

Attribution: retained runtime source/vendor includes upstream Apache-2.0 LICENSE.txt, patch notes and provenance. This is a Tower-patched runtime, not an untouched upstream copy. Build output contains a per-file hash manifest; preserve the vendor records.
