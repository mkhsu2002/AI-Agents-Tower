# Reception mixed-output compatibility correction

## Evidence and contract

K's controlled Production observation on 61458bacec9da17e3fecef62282f6f026f582da8 at 2026-11-21 22:30:56 UTC reported Meta 200, step 0 HANDOFF_SHAPE_INVALID, completed status, no incomplete reason, three output items, two non-reasoning items, and first item message/output_text. Usage checks passed. The other non-reasoning item's type was not observed; this note does not identify it as a tool or assert that the candidate resolves the actual failure.

[Meta Responses schemas](https://dev.meta.ai/docs/api-reference/responses/schemas), checked 2026-11-21, models output as an array of union item types, including assistant messages, function calls and reasoning items. Output messages have content parts including output_text or refusal, with optional status/phase. The [tool-calling guide](https://dev.meta.ai/docs/tool-calling) inspects function_call items in that output array. This supports mixed-item representation; it does not guarantee a call was present in K's observed response.

## Narrow adaptation

Only initial Reception gains tolerance for at most one inert assistant message alongside exactly one actual valid home_builder function call. The discarded message must have exactly one output_text string part; message/part keys are allowlisted, role must be assistant, status must be absent or completed, optional phase must be a documented enum/null, and optional metadata must have the expected outer types. Refusal parts, mixed content, unknown keys/items, nonassistant roles and incomplete messages are rejected. Existing reasoning-item handling is unchanged.

Narration is never parsed as an action, displayed, forwarded to the browser/next model turn, stored in D1, or logged. Even action-like text is discarded. The normalized result must exactly equal the original tool-only result, including empty assistant content and the real validated call ID/arguments. No tool is invented from text. Text alone, two narrations, extra tools, unknown items or an invalid handoff still fail.

Original model/status/usage checks, home_builder name, ID check, exact fixed brief/arguments, strict JSON, response size, deadlines, quotas and consent remain unchanged. Builder/final Reception still require their original single-message draft/action/exact-copy shape and gain no tolerance for extra narration. No prompt, model or runtime vendor changes.

## Diagnostics and tests

If rejection continues, the new structure fields contain only capped counts for function_call, discardable text and other non-reasoning items. They reveal neither content nor dynamic identifiers; existing failure classification remains intact.

New unit tests cover accepted orderings with reasoning, exact result equivalence/no text forwarding, refusal and arbitrary-field rejection, extra tools/messages, invalid IDs/arguments, original completion/usage guards, unchanged later turns and safe counters. A scripted browser three-role flow verifies actual local validation, review/apply/export and no narration in UI or browser request bodies. Native workerd/D1 cases include mixed output on direct, modern and legacy compiled Pages gateways, with all outbound traffic intercepted.

The owner has authorized this tested correction for release through existing main Git integration. The fetched release baseline remains 61458bacec9da17e3fecef62282f6f026f582da8 with no divergence. Active Production verification and real-model acceptance are pending with K. No new real model request was made. K remains the sole authorized public UI operator after the authorized release. Synthetic passes do not establish the actual second item's type, live success, or full competition compliance.

Fresh candidate validation passed: lint/typecheck/build; 122/122 unit tests (including 17 new mixed-output cases), 48/48 Studio browser tests and 27/27 fully intercepted workerd/D1 cases. The added native success scenario runs once per direct/modern/legacy gateway surface. These are local synthetic results; no real-provider request or production acceptance was performed. git diff --check passed.
