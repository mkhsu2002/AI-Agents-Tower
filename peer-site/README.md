# Git-linked static peer

Use the same mkhsu2002/AI-Agents-Tower repository in a NEW Cloudflare Pages Git-integrated project. The old Direct Upload project cannot be converted into Git integration; retain it until the new peer passes readback. Do not delete it to reuse its name.

| Setting | Value |
| --- | --- |
| Suggested new project name | tower-agent-peer (if available) |
| Repository | mkhsu2002/AI-Agents-Tower |
| Production branch | main |
| Framework preset | None |
| Root directory | peer-site |
| Build command | npm run build |
| Build output directory | artifacts/agent-peer |

There are NO API keys, DB/service bindings, model flags or other mandatory variables for this peer project. It has no functions directory and builds public JSON/HTML/header files only. Root directory matters: do not use the repository root and accidentally include the main application's Functions. Output is relative to peer-site.

The build derives the stable project.pages.dev origin from Cloudflare's CF_PAGES_URL, including hashed or branch deployment URLs. It does not hardcode an unverified project name. TOWER_PEER_ORIGIN is an optional exact HTTPS override for a deliberately configured custom domain; TOWER_CALLER_ORIGIN optionally overrides the main canonical caller. These values are public URLs, not secrets. Inference remains on the original main site's server, never on this static peer.

After deployment, copy the actual stable peer origin into TOWER_AGENT_PEER_ORIGIN on the MAIN ai-agents-tower project. TOWER_AGENT_NETWORK_ENABLE=enabled belongs only to main, after JSON/CORS readback. Main META_API_KEY/TOWER_RUNTIME are unchanged. Actual public two-origin/model acceptance must pass before outside agents are invited.

Local checks from this directory: npm test; CF_PAGES_URL=https://abc123.tower-agent-peer.pages.dev npm run build. No dependency installation, external request, provider call or deployment is performed by those commands.

Cloudflare sources read2026-11-23: [Direct Upload conversion limit](https://developers.cloudflare.com/pages/get-started/direct-upload/), [same-repository projects](https://developers.cloudflare.com/pages/configuration/monorepos/), [Functions project-root location](https://developers.cloudflare.com/pages/functions/get-started/). These document the platform design, not this account's actual deployment or permissions.
