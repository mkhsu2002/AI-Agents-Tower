# Competition conformance matrix

Rechecked 2026-11-18. This is engineering evidence, **not a conformance declaration**. Status vocabulary: Verified (the stated bounded check passed), Partial (some local evidence only), Not implemented, Unverified. A verified local safety test does not establish the corresponding full competition requirement.

## Applicable sources and version

- [Official rules, sections 1 and 4](https://cognizant-agenticweb.devpost.com/rules): applicability is the specification at submission-period start, 2026-11-12T04:00:00Z, not automatically today's main.
- [Recovered baseline](https://github.com/cognizant-ai-labs/agentic-web/blob/e4a8727d5c6807233b8976f28494bbdac7bc1c6e/docs/worldwide_agentic_web_mvp_spec.md): Profile 0.2, dated 6 November 2026. File blob `7a09be795cc3eee47f601f1a6bc7dc26d408f7a9`, 36,225 bytes. Historical main reconstruction remains best effort; see SPEC-BASELINE.md.
- Current repository head observed: `a39df2b7376ccf4a0dbe1c7dc411d04189838979`, 2026-11-18T06:18:08Z. Latest specification-path commit is still `fd872b9221aeb8ff762b75a5badbf84b23c133cc`, 2026-11-10T15:50:31Z. Current tree has the same specification blob. No silent baseline change is made.

| Source area | Requirement / check | Status before Studio integration | Evidence or next verification |
| --- | --- | --- | --- |
| Rules §4 | Public browser product and access for reviewers | Partial | Vercel main `60be3d8` reported READY; environment blocked public UI checks. READY alone is not functionality evidence. |
| Spec §2, §6 | Portable two-agent network in canonical data model | Partial | Two agents execute in local spike; local-1 JSON is deliberately restricted. Publish/review artifacts against full Neuro SAN model; JSON existence alone is insufficient. |
| Spec §3.1 | Browser execution and collaboration | Partial | 51-case local runtime suite; inference is scripted. No real-model collaboration verified. |
| Spec §3.1, §6 | Grounded MCP or registered site capability | Partial | Real local read-only MCP transport in isolated spike. Studio currently only has host validation; integrated capability and real-model proof remain open. |
| Spec §3.2, §6 | Exact named peer loaded in caller browser after approval | Partial | Two loopback origins in spike, no deployed second-origin evidence. Add Studio-to-peer tests; later use independently hosted HTTPS origins. |
| Spec §3.3–3.4 | Manifest, network files, origin policies and CORS | Partial | Fixture routes work locally; initial static Studio does not publish a usable production network/runtime surface. Test actual public files and cross-origin fetch behavior. |
| Spec §4, §6 | Working default inference; optional BYOK | Not implemented | No authorized real provider route or reviewer capacity verified. No credential UI/registration permitted in this stage. |
| Spec §4, §6 | Caller router and key isolation | Partial | Synthetic key routing tests only. No real credential or live provider evidence; never infer that a mock label proves real inference. |
| Spec §2.1, §5, §6 | Private-context filtering | Partial | Synthetic undeclared context denied in local peer tests. Full schema/allow-rule interoperability remains unverified. |
| Spec §3.1, §5 | Reject invalid/ambiguous networks | Partial | Local profile rejects unknown/executable data, duplicate keys/names and unsafe destinations. Full-profile acceptance/rejection coverage is not established. |
| Spec §3.2, §5 | Origin consent and redirect controls | Partial | Explicit default-deny and separate MCP prompts verified locally; all redirects are conservatively rejected. Authorized redirect-following interoperability unsupported. |
| Spec §3.1, §5, §6 | Finite execution, cycles, failure and uncertainty | Partial | Invocation budget primitives, stalled HTTP/SSE/MCP, cancel and no-retry tests. Browser suspension and remote rollback cannot be enforced. Full cycle/depth matrix and deployment behavior remain to test. |
| Spec §5 | Observable execution without secret disclosure | Partial | Local synthetic traces; Studio must expose role/status-only progress without user-content logging. Real-model/router observability unverified. |
| Product contract | HomeBundle validation and text-only round-trip | Verified locally | 8 domain + 8 Studio UI tests at previous milestone. Re-run after integration; this is product evidence, not a substitute for spec §6. |
| Rules submission | English description, screenshots and browser video | Partial | English project copy and local screenshots exist. Final video/submission package and judging access are not completed. |
| Product M3/M4 | Identity, private storage, publication/unpublish | Not implemented | Explicitly outside this stage; no database, account or public residency claims. |

## Questions that remain explicit

1. Can the organizer confirm an immutable submission-start revision? Commit-date ancestry does not prove historical branch state after possible rewrites.
2. Which exact full Neuro SAN schema/reference revision should acceptance tests target, including optional fields? The current local profile rejects some otherwise compatible features and cannot be represented as full support.
3. How should fail-closed all-redirect refusal be assessed against cross-origin artifact interoperability? No redirect is followed without authorization; authorized cross-origin relocation is currently unsupported.
4. What tested default real inference route can remain free to reviewers throughout judging? No credit balance, free quota or provider authorization is assumed.
5. Spec §3.4 permits co-bundling, while §6 lists a second-origin demonstration. We retain that demonstration as an acceptance gate instead of treating same-origin execution as sufficient evidence.

Proceed with the clear browser/data/consent/product requirements while these questions remain unresolved. No question authorizes a paid service, credential creation, weaker browser controls or a conformance claim.
