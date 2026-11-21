# Competition conformance matrix

Baseline checked 2026-11-18; current-version delta rechecked 2026-11-21 (see RUNTIME-COMPATIBILITY.md). This is engineering evidence, **not a conformance declaration**. Status vocabulary: Verified (the stated bounded check passed), Partial (some local evidence only), Not implemented, Unverified. A verified local safety test does not establish the corresponding full competition requirement.

## Applicable sources and version

- [Official rules, sections 1 and 4](https://cognizant-agenticweb.devpost.com/rules): applicability is the specification at submission-period start, 2026-11-12T04:00:00Z, not automatically today's main.
- [Recovered baseline](https://github.com/cognizant-ai-labs/agentic-web/blob/e4a8727d5c6807233b8976f28494bbdac7bc1c6e/docs/worldwide_agentic_web_mvp_spec.md): Profile 0.2, dated 6 November 2026. File blob `7a09be795cc3eee47f601f1a6bc7dc26d408f7a9`, 36,225 bytes. Historical main reconstruction remains best effort; see SPEC-BASELINE.md.
- Historical 2026-11-18 repository head observed: `a39df2b7376ccf4a0dbe1c7dc411d04189838979`, 2026-11-18T06:18:08Z. The specification-path commit at that observation was `fd872b9221aeb8ff762b75a5badbf84b23c133cc`, 2026-11-10T15:50:31Z. The tree at that historical observation had the same specification blob; later Profile 0.3 is tracked separately below. No silent baseline change is made.

| Source area | Requirement / check | Current bounded status | Evidence or next verification |
| --- | --- | --- | --- |
| Rules §4 | Public browser product and access for reviewers | Partial | Integrated application `d2d3da6` reported production READY on 2026-11-18; environment blocked public UI checks. READY alone is not functionality evidence. |
| Spec §2, §6 | Portable two-agent network in canonical data model | Partial | Two agents execute in local spike; local-1 JSON is deliberately restricted. Publish/review artifacts against full Neuro SAN model; JSON existence alone is insufficient. |
| Spec §3.1 | Browser execution and collaboration | Partial | 51-case runtime suite plus integrated Studio mock workflow; inference is scripted. No real-model collaboration verified. |
| Spec §3.1, §6 | Grounded MCP or registered site capability | Partial | Real local read-only MCP transport in isolated spike. Studio now executes a host-registered read-only validation action via runtime receipts (T02); portable capability discovery and real-model proof remain open. |
| Spec §3.2, §6 | Exact named peer loaded in caller browser after approval | Partial | Two loopback origins in spike, no deployed second-origin evidence. Studio 4173→4182 exact named loading and refusal tests now pass; independently hosted HTTPS origins remain open. |
| Spec §3.3–3.4 | Manifest, network files, origin policies and CORS | Partial | Fixture routes work locally; Studio bundles the patched Engine and serves static development manifest/network files; local 4173→4182 loading/CORS negative tests pass. Real router, deployed HTTPS interoperability and full profile remain open. |
| Spec §4, §6 | Working default inference; optional BYOK | Partial | Bounded Pages Meta gateway and shared D1 quota/session adapter implemented; scripted fixtures and local workerd/D1 admission tested. Production binding readiness is confirmed. Real inference, portable live-router metadata and judging capacity remain unverified. No visitor credential UI. |
| Spec §4, §6 | Caller router and key isolation | Partial | Synthetic key routing tests only. No real credential or live provider evidence; never infer that a mock label proves real inference. |
| Spec §2.1, §5, §6 | Private-context filtering | Partial | Synthetic undeclared context denied in local peer tests. Full schema/allow-rule interoperability remains unverified. |
| Spec §3.1, §5 | Reject invalid/ambiguous networks | Partial | Local profile rejects unknown/executable data, duplicate keys/names and unsafe destinations. Full-profile acceptance/rejection coverage is not established. |
| Spec §3.2, §5 | Origin consent and redirect controls | Partial | Explicit default-deny and separate MCP prompts verified locally; all redirects are conservatively rejected. Authorized redirect-following interoperability unsupported. |
| Spec §3.1, §5, §6 | Finite execution, cycles, failure and uncertainty | Partial | Invocation budget primitives, stalled HTTP/SSE/MCP, cancel and no-retry tests. Browser suspension and remote rollback cannot be enforced. Full cycle/depth matrix and deployment behavior remain to test. |
| Spec §5 | Observable execution without secret disclosure | Partial | Local synthetic traces; Studio exposes role/status-only progress and drops prompt/result trace payloads; network-write/storage assertions pass. Real-model/router observability unverified. |
| Product contract | HomeBundle validation and text-only round-trip | Verified locally | 12 domain/adapter unit tests and 24 Studio browser tests after integration; this is product evidence, not a substitute for spec §6. |
| Rules submission | English description, screenshots and browser video | Partial | English project copy and local screenshots exist. Final video/submission package and judging access are not completed. |
| Product M3/M4 | Identity, private storage, publication/unpublish | Not implemented | Explicitly outside this stage; no database, account or public residency claims. |

## Questions that remain explicit

1. Can the organizer confirm an immutable submission-start revision? Commit-date ancestry does not prove historical branch state after possible rewrites.
2. Which exact full Neuro SAN schema/reference revision should acceptance tests target, including optional fields? The current local profile rejects some otherwise compatible features and cannot be represented as full support.
3. How should fail-closed all-redirect refusal be assessed against cross-origin artifact interoperability? No redirect is followed without authorization; authorized cross-origin relocation is currently unsupported.
4. What tested default real inference route can remain free to reviewers throughout judging? No credit balance, free quota or provider authorization is assumed.
5. Spec §3.4 permits co-bundling, while §6 lists a second-origin demonstration. We retain that demonstration as an acceptance gate instead of treating same-origin execution as sufficient evidence.

Proceed with the clear browser/data/consent/product requirements while these questions remain unresolved. No question authorizes a paid service, credential creation, weaker browser controls or a conformance claim.

## Integration checkpoint — 2026-11-18

See [STUDIO-AGENTS.md](STUDIO-AGENTS.md) for the implemented state machine, mock-only adapter, explicit review/apply, conflict protection and reproducible second-origin evidence. Studio stops the entire run on a denied additional contact; upstream optional-tool skipping is not presented as success. The independent-origin fixture remains local HTTP, the grounded MCP remains in the separate spike, and actual real-model/default reviewer inference remains Not implemented. Deployment metadata and actual public UI verification are recorded separately in DEPLOYMENT.md.

## T01 reconciliation

Current Profile 0.3 path commit a0ceda34e4f2e653223e13e63282abc9b60eaf7c changes version/date, links and wording relative to the recovered baseline; the submission-start baseline is retained. See [runtime compatibility](RUNTIME-COMPATIBILITY.md) and tests/compatibility.test.ts for explicit accepted/unsupported fixtures. Reconciliation is implemented; full schema compatibility and organizer historical confirmation remain open.

## P0/P1 execution checkpoint

T02 now requires actual registered-action execution receipts in the Studio; this replaces the older host-validation-only limitation. T03 has a disabled keyless transport preparation tested against scripted local HTTP, not actual weights. T04 has a separately served caller package and local browser evidence, not deployed independent HTTPS. T05 production navigation failed at the tunnel before interaction. T06/T07 have a local server-only SQLite/authenticator-boundary core, not deployed authentication/private/public Home services. T08 drafts/inventory/mock footage exist; license, actual inference, judging capacity and final submission remain unverified. No success badge is substituted for these gates.

## Historical restricted reviewer checkpoint — 2026-11-21

Re-read the official [rules](https://cognizant-agenticweb.devpost.com/rules) and the [immutable Profile 0.2 file](https://github.com/cognizant-ai-labs/agentic-web/blob/fd872b9221aeb8ff762b75a5badbf84b23c133cc/docs/worldwide_agentic_web_mvp_spec.md). The rules still require the submission-start specification and free judging access. The historical branch reconstruction remains an inference, not organizer-certified pinning. Profile 0.3 does not silently replace it.

| Requirement | Current status | Evidence / remaining gate |
| --- | --- | --- |
| Normal public reviewer entry without visitor key | Partial | Public Live demo entry is wired but shipped disabled. Scripted HTTP fixtures exercise three calls through the browser loop. No live gateway or weights were used. |
| Two collaborating agents and grounded local action | Verified locally for scripted execution only | Both roles complete; actual dispatcher receipt and HomeBundle validation gate the proposal. Review/apply/export remain separate. Real-model behavior unverified. |
| Bounded consent/origin/private-context behavior | Verified for the stated fixtures | Fresh explicit consent, exact synthetic brief/local source, same-origin host adapter gate, no editor content/keys/cookies, redirects/errors/cancel/deadline fail closed. This is not server-side public proxy abuse protection. |
| Default real inference free throughout judging | Not implemented | Provider research identifies candidates, not authorization, account quota or public capacity. A restricted gateway and live acceptance are still required. |
| Full canonical data/runtime interoperability | Partial | Restricted JSON subset, nonstreaming adapter, development manifest and unsupported optional fields remain gaps. Neither fixture model labels nor MCP/JSON publication close these gaps. |
| Second independent deployed HTTPS caller | Unverified | Reproducible independent local caller package/test exists; no second site created or deployed. |
| Production interaction | Unverified | Readback/deployment status are separate from a public interaction pass; see DEPLOYMENT.md. |

See REVIEWER-DEMO.md for exact shipped state and future gateway policy. No new full-conformance or P0-complete claim is made.

## Historical Meta gateway preparation checkpoint — 2026-11-21

Owner selected Meta Model API instead of OpenRouter. [META-REVIEWER-GATEWAY.md](META-REVIEWER-GATEWAY.md) pins the read-only Muse reference and official protocol/pricing sources. Offline Request/Response fixtures now enforce server-owned synthetic prompts and three stages, bounded tickets/steps and a trusted Tower-only free-run reservation boundary. Browser tests reuse the real validation action/receipt and review/apply separation. This strengthens local safety evidence only. The production handler is hard disabled; no model, credit balance, account entitlement, expiry, overage protection, judging-period capacity or deployed independent HTTPS run was verified. Model API usage is metered even if free credits offset it. No competition requirement is closed merely by the gateway's existence; P0/full conformance remain incomplete.

Cloudflare public checkpoint (2026-11-21): a successful Git-linked Pages check and fresh HTTP 200 homepages at the Pages/custom hostnames are now recorded; status remains false and reviewer API 503. The custom domain is reachable from the readback source. Public browser interaction is still unverified because navigation failed with ERR_TUNNEL_CONNECTION_FAILED. No real inference or independent second-site composition requirement is closed by these two hostnames. Evidence: cloudflare-public-readback.json and DEPLOYMENT.md.

Saved-secret checkpoint (2026-11-21): Pages-only configuration presence diagnostics and an injected server HTTP sender are implemented/tested. Neither is inference evidence. Public enabled/connectionVerified/trialReady remain false, and actual credit/expiry/quota authority is unverified. Only a successful authorized provider trial can advance the real-model requirement; a configured key does not do so.

## Public-demo resource checkpoint — 2026-11-21

The fixed Atlas gateway now uses atomic D1 admission (60 reserved calls/day), single-use steps and shared cancellation; tests remain scripted and local. This advances the technical implementation, not conformance. The host-only live adapter does not establish portable default-router interoperability. No actual Meta inference or independent second HTTPS live composition has passed. Operational quota/session storage is separate from M3/M4 Home persistence.

## Enabled configuration and acceptance checkpoint — 2026-11-21

After owner redeployment, fresh public readiness returned enabled/credentialConfigured/trialReady true. This closes the binding-presence setup step only. A normal public Playwright live acceptance attempt failed before UI at ERR_TUNNEL_CONNECTION_FAILED, with no start/model request. The explicit single-run harness, shared scripted round-trip assertions and allowlisted error diagnostics improve reproducibility; none establish actual model execution. Full portable default-router/profile, independent deployed HTTPS composition and judging availability remain open.
