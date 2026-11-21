# Tower local runtime patches

Modified 2026-11-21 by AI Agents Tower. This directory is now a **locally patched subset**, not an unmodified nsdeploy release. Original upstream comments and [Apache-2.0 license](LICENSE.txt) remain in place. No change here claims upstream endorsement or a project-wide license.

Upstream: https://github.com/cognizant-ai-lab/nsdeploy at commit `4e4cb36731ae71cbbb905d3fe98f26299ac3b4f2`. Repository baseline `d4eb3ff1a3bbb0c3e82cb799f9e859c7268220ae` preserves the original bytes of all 21 modules and license. `provenance.json` retains every original Git blob SHA; the seven modified files also record `patchedGitBlob`. `verify-vendor.mjs` checks exact expected bytes and syntax-checks each patched module. Updating a source file requires an intentional provenance update and tests; verification never rewrites hashes.

| File | Local changes |
| --- | --- |
| runtime/engine.js | Exact named top-network selection and explicit host-injected mock adapter for Studio (never instantiated by imported JSON). Strict JSON compilation, manifest front-agent validation, bounded operations/cancel API, disabled dynamic links/alternate runners/automatic router probing. Missing hook, rejected hook and every response except literal `allow` decline consent. Remove remembered origin-wide approvals; serialize decisions without poisoning the queue on errors. Supply actual browser origin to every peer context. |
| runtime/kernel.js | Reject missing/empty agent names, invalid tools array and duplicate names after the existing configuration normalization, before indexing can overwrite any agent. |
| runtime/runner.js | Propagate cancellation to agent/model/MCP calls, enforce descriptor tool allowlists and terminate on policy failures. Resolve destinations against the publishing base but compare them with the actual browser origin. Gate peer MCP discovery and each call independently; require explicit allow at all peer/MCP gates. Show full origin, MCP endpoint, tool name and exact call arguments in review. |
| runtime/remote.js | Bounded UTF-8 JSON artifact reads with strict manifest validation and no redirect following. |
| runtime/llm.js | Require bounded transport for model calls; reject redirects and fatal streamed-body failures. |
| runtime/cruse.js | Preserve opaque JSON content and literal protocol tags/fences; unwrap complete protocol envelopes only. |
| runtime/mcp.js | Propagate operation scope through discovery/invocation; reject redirects and abort stalled transport/body reads. |

Application-owned safety.js and standalone schemas/validators are outside the vendor directory. No generated upstream kernel module, inference funding path, sandbox or license file was modified. The original spike's all-unchanged source claim is historical; use the current provenance and this patch record for review. The supported strict local subset, all-redirect rejection and bounded cancellation are documented in docs/M2-RUNTIME-BOUNDARIES.md. General official-profile interoperability, server-side rollback and hard real-time deadlines remain outside this slice. The patched Engine is also bundled into Home Studio for a mock-only draft proposal flow. Real inference and full official-profile support remain unimplemented; see docs/STUDIO-AGENTS.md.
