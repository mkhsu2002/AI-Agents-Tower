# Local output-validation diagnostics candidate

## Observed boundary

K verified Production b1c4bdc8e1cad0c228c8d66cedd13b558f41979e, deployment 04615368-88d0-4311-8d0d-9a61d97f7ddf. One normal UI attempt at 2026-11-21 22:21:26.929 UTC recorded provider-response 200 followed by request-end 502 on Reception, while the browser still showed GATEWAY_RESPONSE_INVALID and an unconfirmed marker. No validated proposal or later model turn was observed. This is K's handed-off evidence, not another assistant provider request.

The tool-choice correction removed the previous observed 400 for this attempt. HTTP 200 alone does not identify the body shape, completion state or rejection reason. It is not evidence of a valid handoff or successful collaboration. The response-delivery discrepancy remains separate.

## Schema comparison

[Meta Responses schemas](https://dev.meta.ai/docs/api-reference/responses/schemas), checked 2026-11-21, defines function_call output with string arguments/call_id and usage.input_tokens/output_tokens integers. These match the parser's expected core field names. The published response schema allows several statuses and treats status/usage as optional; Tower deliberately requires completed plus bounded usage and exactly one fixed handoff for this demo. A legal provider response may therefore remain unacceptable to this product workflow. Auto also permits plain text; that remains rejected, not converted to a fabricated handoff.

The documented call_id is a string of length 1–64; Tower's existing ASCII 1–100 check is a separate bounded-profile difference. No actual ID or missing field was observed in this attempt. This diagnostic patch changes none of these acceptance conditions, model, prompts or limits. Available evidence does not establish a production schema mismatch to repair directly.

## Minimal diagnostic behavior

A server-only output-rejected event carries only fixed service/event/route categories, a trusted turn index, a fixed reason and bounded structural observations. It contains no dynamic identifier, including no Ray; K can use the platform invocation grouping and unchanged pre-existing lifecycle records to correlate the event. No response text, arguments, tool name, model string, ID, request body, ticket, prompt, credential, raw exception, property-name list or actual token count is logged. Unknown statuses/types/reasons become other; counts cap at five. Logging failures cannot escape the error response.

| Signal | Distinguishes |
| --- | --- |
| HANDOFF_SHAPE_INVALID + completed/message/output_text | Completed text without required tool, still rejected |
| STATUS_NOT_COMPLETED + incomplete | Unfinished response; only allowlisted incomplete reasons are reported |
| HANDOFF_ARGUMENTS_JSON_INVALID | Malformed tool-arguments JSON |
| HANDOFF_ARGUMENTS_INVALID | Parsed arguments differ from the fixed request |
| ENVELOPE_INVALID / MODEL_MISMATCH / OUTPUT_ARRAY_INVALID / USAGE_INVALID | Envelope/model/output/usage guard; integer/range flags distinguish usage shape from caps |
| JSON_INVALID | Body read, but strict JSON parse failed |
| OUTPUT_BODY_OR_PROCESSING_FAILED | Nonclassified output read/processing exception; does not assert a specific network cause |
| MESSAGE_SHAPE_INVALID / DRAFT_OR_ACTION_INVALID | Later-turn message or unchanged bundle/action/exact-copy checks |

Provider-error presence also has its own fixed category. Public code/status remains OUTPUT_REJECTED / 502; no internal diagnostic object is sent to the browser. Cancellation, timeout, consumed-step behavior and no-retry policy are unchanged.

## Verification boundary

Local unit cases exercise classification, bounded safe metadata, adversarial sentinel non-disclosure, logging failure, valid handoff/reasoning preservation and a complete gateway 200-without-tool rejection with replay refusal. No production model request is performed by the implementation agent during this release. The owner has authorized this diagnostic-only release through existing main Git integration following the local review. K remains the sole public UI operator; production activation and the actual failure classification remain pending. Following a separately authorized release, K can correlate one normal UI attempt's output-rejected event to the same Ray without reading or sharing provider content. No MK action is needed.

Candidate checks passed: lint/typecheck/build; 105/105 unit, 47/47 Studio browser and 24/24 intercepted workerd/D1 cases, including modern and legacy compiled Pages routers. The additional 18 unit tests use synthetic data only. The reviewed release baseline is b1c4bdc8e1cad0c228c8d66cedd13b558f41979e; no actual provider call or full live acceptance is claimed.
