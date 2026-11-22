# Stage two: minimum offline custom-brief contract

## Goal and boundary

Prepare the smallest reviewable contract/test package for custom briefs without changing public model execution. Preserve the working fixed Atlas demo and all existing endpoint/model/quota/token/deadline/consent rules. No new provider request, credential, D1 schema, model selection, deployment setting, private Home persistence, login or publication is required.

## Immediate implementation package

1. Define an internal versioned brief input contract with one untrusted brief string. Reuse the existing 1,500 Unicode-code-point / 6,000 UTF-8-byte limits from src/agents/model.ts; explicitly reject blank/malformed/oversized/duplicate/unknown/authority-bearing input. Do not silently trim or drop data. This is separate from portable HomeBundle.
2. Specify the exact outgoing-data preview and consent transition: denied by default; edits revoke approval; user private editor content is never implicitly included. Provider destination, data scope and lack of private Home storage must be clear. Model text cannot grant consent or ownership.
3. Implement only an offline request builder and local session-binding tests. Server owns instructions, model, tools and budgets; the brief is untrusted data, not configuration. A client cannot add a model/router/tool/key, approval flag or reusable authority. Define brief-binding and cancellation/expiry behavior without persisting raw custom text or changing production D1.
4. Exercise adversarial/instruction-like text, Unicode byte/character edges, repeated edits, forged fields, source changes, no-consent/no-dispatch, malformed provider output, timeout/cancel/restart and editor-revision conflicts using scripted transport. Preserve exact tool arguments, actual code validation receipt and explicit review/apply.

## Completion gate

Deliver the English contract, offline implementation/test evidence, privacy/data-flow notes and a minimal proposed integration diff. Tests must show zero actual provider traffic and no change to fixed live-demo behavior. Mark mocks explicitly. K reviews the package before any production input-scope expansion; no silent activation is authorized by this document. If integration requires a larger request envelope, retention/storage change or different consumption limit, record that as an explicit next gate rather than changing it here.
