# Runtime compatibility reconciliation (T01)

Reviewed 2026-11-21. This records supported boundaries, not full interoperability certification.

## Version distinction

The [rules](https://cognizant-agenticweb.devpost.com/rules) still select the submission-start specification. Retain the recovered Profile 0.2 baseline and its historical-authority caveat from SPEC-BASELINE.md.

The current [Profile 0.3 file](https://github.com/cognizant-ai-labs/agentic-web/blob/a0ceda34e4f2e653223e13e63282abc9b60eaf7c/docs/worldwide_agentic_web_mvp_spec.md) is dated 18 November 2026; its path commit is a0ceda34e4f2e653223e13e63282abc9b60eaf7c (19 November 03:32:01Z), blob b72fcdf433e323e30a6052e9e0c0718b835672c1. GitHub compare against fd872b9 reports five added/five removed lines: version/date, two references and two wording corrections. This is not a reason to silently change the competition baseline.

The corrected [Neuro SAN reference](https://github.com/cognizant-ai-lab/neuro-san/blob/main/docs/agent_hocon_reference.md) exposes broader configuration than Tower's local subset. Its current reference/schema are useful for future fixtures; they are not a pinned substitute for the applicable historical profile.

## Compatibility contract and tests

| Surface | Current behavior | Evidence / remaining gap |
| --- | --- | --- |
| Published two-agent JSON graph | Accepted | compatibility.test.ts checks real checked-in assets |
| HOCON includes/substitutions | Rejected at runtime | Build-time resolution and general HOCON loading not implemented |
| Optional commondefs, sly_data_schema, max_iterations, temperature | Rejected explicitly | Curated negative fixtures; full-profile acceptance remains open |
| Executable class/tool code | Rejected | No imported script execution |
| Extra manifest action modules | Rejected | Host registration can supply trusted local capabilities separately |
| Relocated/cross-origin artifacts and redirects | Rejected conservatively | Stronger local restriction; authorized relocation interoperability unsupported |
| browser://mock router | Mock-only development extension | Rejected without explicit mock label; no real inference claim |

Curated boundary tests prevent unsupported fields from being silently stripped or represented as accepted. They do not validate the complete official schema. Real default inference, portable registered capabilities, deployed peer execution and organizer-confirmed baseline remain separate gates.

## Invocation enforcement checkpoint — 2026-11-21

The existing flat string-parameter profile is now enforced on selected tool calls, not merely advertised to the model. Strict JSON parsing rejects duplicate/malformed/nonobject/oversized arguments; no raw-text fallback occurs. Whole batches reject undeclared fields, wrong types, missing required values, unsupported schema keywords, unknown tools and duplicate IDs before any sibling dispatch. Single empty request/input strings and multiple declared fields are preserved. Runtime browser negatives verify zero peer contact for invalid caller invocations. This improves enforcement consistency; it does not add general JSON Schema, commondefs, typed/nested parameters, max_iterations, temperature or arbitrary HOCON support. Those compatibility gaps remain explicit.
