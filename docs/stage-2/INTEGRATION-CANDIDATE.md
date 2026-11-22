# Minimal integration candidate and release gates

## Implemented offline seam

server/offline-brief/contract.ts validates the internal brief and fixed policy; turns.ts builds bounded server-owned requests and validates scripted Responses; session.ts binds preview/consent, execution, validation and apply to private in-memory revisions. Existing production/UI modules do not import them. The public fixed-demo behavior and public input scope remain unchanged.

A local host can call: construct a scripted session with a validated editor → edit internal JSON → obtain the explicit outgoing-data preview → approve that exact preview → run scripted turns → inspect proposal/validation receipt → explicitly apply. This is the smallest runnable candidate, without inventing a public endpoint or a credentials path.

## Proposed integration locations — not applied

| Touchpoint | Minimum future change | Gate before activation |
| --- | --- | --- |
| src/main.ts | Render exact outgoing data with textContent; edit/source changes revoke consent; retain explicit review/apply | Product/privacy review of what leaves the browser, including generated draft in final review |
| src/agents/studio-agent.ts and model adapter | Add a separate reviewed mode; retain fixed demo and reject implicit fallback | Existing mode guard remains unchanged until new scope is approved; no client-selected provider/tools |
| Server admission and turn boundary | Validate the versioned envelope; bind exact brief, origin, sequence and expiry; reconstruct every prompt/tool server-side | Current 512-byte public envelope cannot carry custom briefs; protocol/limit changes are not included here |
| D1 coordination | Durable shared quota and brief binding without treating client flags as authority | No migration/storage change here. Existing builder column would contain private generated text if reused; retention/privacy must be decided before reuse |
| Real transport | Reuse reviewed fixed Meta sender only after explicit integration approval | ScriptedPort is not a production adapter, authentication mechanism or permission to call Meta |
| Browser acceptance | Verify actual validation receipt, conflicts, cancel/errors and export with scripted integration first | A separate controlled real-input trial only after privacy/scope review; no new model request in this package |

## Deliberate omissions

No public custom-input control, route, credential, account, DB persistence, new provider/model, quota increase, site deployment configuration, portal, publication or permanent identity. No claim that all prompt injection is solved; only the fixed policy and resulting output authority are enforced. No cross-origin custom inference or full competition-profile claim.

K can review this package without MK intervention. The next implementation decision is a reviewed data/retention and binding protocol for real custom input; until then the production Atlas example remains the only live input. There is no unchecked patch that turns a runtime flag on.

Review evidence: 27 new offline cases / 149 total unit passes; 48 Studio browser and 27 intercepted native passes; lint/typecheck/build passed. The immediately preceding stage's 61 runtime browser/file-acceptance evidence is preserved but not rerun for this unimported offline package. No live model, public request, credential access or production input expansion occurred.
