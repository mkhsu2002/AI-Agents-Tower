# Tower local runtime patches

Modified 2026-11-17 by AI Agents Tower. This directory is now a **locally patched subset**, not an unmodified nsdeploy release. Original upstream comments and [Apache-2.0 license](LICENSE.txt) remain in place. No change here claims upstream endorsement or a project-wide license.

Upstream: https://github.com/cognizant-ai-lab/nsdeploy at commit `4e4cb36731ae71cbbb905d3fe98f26299ac3b4f2`. Repository baseline `d4eb3ff1a3bbb0c3e82cb799f9e859c7268220ae` preserves the original bytes of all 21 modules and license. `provenance.json` retains every original Git blob SHA; the three modified files also record `patchedGitBlob`. `verify-vendor.mjs` checks exact expected bytes and syntax-checks each patched module. Updating a source file requires an intentional provenance update and tests; verification never rewrites hashes.

| File | Local changes |
| --- | --- |
| runtime/engine.js | Missing hook, rejected hook and every response except literal `allow` decline consent. Remove remembered origin-wide approvals; serialize decisions without poisoning the queue on errors. Supply actual browser origin to every peer context. |
| runtime/kernel.js | Reject missing/empty agent names, invalid tools array and duplicate names after the existing configuration normalization, before indexing can overwrite any agent. |
| runtime/runner.js | Resolve destinations against the publishing base but compare them with the actual browser origin. Gate peer MCP discovery and each call independently; require explicit allow at all peer/MCP gates. Show full origin, MCP endpoint, tool name and exact call arguments in review. |

No generated kernel module, model adapter, inference funding path, MCP transport, sandbox or license file was modified. The original spike's all-unchanged source claim is historical; use the current provenance and this patch record for review. Broader network schema/resource bounds, redirect authorization and hard in-flight deadlines remain unresolved. This is still a scripted-only local harness, not a production browser runtime integration.
