# Meta tool-choice compatibility correction

## Evidence and source

K's normal public UI attempt on main 4858ad791467ccdd0ddc8f745c32d8ca2578fd0e at 2026-11-21 22:10:57.434 UTC recorded request-start → provider-start → provider-response 400 → request-end 502, Functions outcome ok and no exceptions. The browser showed GATEWAY_RESPONSE_INVALID at Reception and an unconfirmed gateway marker; its draft stayed unchanged. This is K's observed production evidence, separate from the earlier attempt with no observed request.

[Meta's official tool-calling guide](https://dev.meta.ai/docs/tool-calling), checked 2026-11-21, accepts only auto for tool_choice and documents HTTP 400 for named/none/required choices. The deployed payload used named/none choices. This identifies a concrete incompatible field; the exact upstream rejection body was not retained, and complete production resolution still requires normal-path acceptance.

## Change

Reception keeps one unchanged strict home_builder tool, with tool_choice auto and parallel_tool_calls false. The other two turns keep empty tool arrays and use auto. The sender rejects unsupported choices and explicit parallel true before transport. The offline gateway and scripted fixture enforce the same request constraint.

The existing result validator still requires exactly one actual handoff with the fixed request. Plain text, multiple/foreign tools and altered arguments stop the run; no handoff is fabricated. Schema, model, prompt, token/call limits, consent, deadlines, redirects, receipt and review/apply behavior are unchanged.

## Verification and release boundary

Before the correction, two of three new contract regressions failed as expected. The candidate then passed lint/typecheck/build, 87 unit tests, 47 Studio browser tests and 24 intercepted workerd/D1 cases, including modern/legacy compiled Pages routers. These are synthetic tests, not real inference evidence.

The owner subsequently authorized committing and pushing this minimal correction through the existing main Git integration. No direct upload, settings/credential/model/quota change or model request is part of this release work. K alone will verify the deployed SHA, open safe logs and operate the normal consented public UI. The browser response-marker/delivery discrepancy remains a separate unresolved observation; deployment readiness alone is not an acceptance pass.
