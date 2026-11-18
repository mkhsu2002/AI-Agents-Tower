# Development log

## 2026-11-18 — baseline and compliance review

- Read README.md, AGENTS.md, latest runtime-boundary and deployment records, Home Studio and runtime sources.
- Working tree was clean on main at `60be3d8c5032e53d2bdbe369653c5b7fc1c9345e`, equal to origin/main after fetch. No competing Vite, Playwright, spike server or Git write process was found; no process was stopped.
- Existing Vercel deployment `dpl_AmybLfRKnCWjXqGASVwmC6t3rkAk` reports production READY for the same commit. Public browser verification remains separate from this metadata.
- Rechecked official rules/current specification and retained the recovered submission-start baseline. Added CONFORMANCE-MATRIX.md with bounded evidence, unanswered interpretation questions and real-inference gaps.
- Validation for this documentation stage: source/version lookup and git diff --check. Earlier test results are historical, not fresh runs.
- Next stage: integrate the patched Engine with Studio using a replaceable mock-only model adapter, deterministic result validation, explicit review/apply, failure/cancel handling and independent-origin tests. No new service, credential or product direction is required.

## 2026-11-18 — Studio and patched browser Engine integration

- Connected Home Studio to the existing attributed Engine, exact named public development network and deterministic mock adapter. Both reception/planning and Home builder execute before host schema validation and explicit proposal review/apply.
- Added strict brief/settings bounds, default-deny per-run public-origin approval, separate contact review, error/timeout/cancel/restart handling, content-safe status tracing and editor revision protection across edits/imports.
- Negative testing exposed upstream optional-tool denial continuing the run. Studio now aborts the entire run on refusal so denied capability access cannot appear as a successful proposal. Separate MCP discovery denial and cancellation are tested without contacting MCP.
- Added a test-only second-origin artifact server at 4182; built caller UI at 4173 loads the exact named network after approval. Verified CORS refusal, all-redirect rejection, duplicate/unknown-field rejection, no brief/body/key/cookie forwarding and no contact on refusal. This is local HTTP evidence, not a deployed HTTPS interoperability claim.
- Fresh results: lint, typecheck and production build passed; 12 Node domain/adapter tests passed; 24 Studio browser tests passed (16 integration + 8 M1 regression); existing 51 runtime browser tests passed, including MCP transport, synthetic router isolation, schema/size negatives, redirects, deadlines and cancellation. No tests skipped. Chromium is the only browser tested.
- Initial UI launch used Playwright's absent managed browser and failed before execution; reran using the documented system Chromium. Early assertions were corrected to the actual status text and a valid import fixture. Final full suites passed. No paid service, new dependency, credentials or real inference was used. Headless WebGPU API was present but adapter unavailable, and no model was downloaded.
- Visually reviewed the local round-trip screenshot at docs/evidence/studio-agents-local-round-trip.png; it shows synthetic script-like text rendered literally. This is local evidence, not a public deployment screenshot.
- README, integration boundaries, attribution patch notes and conformance matrix updated. Deployment outcome is recorded separately after the main push. Real inference, full-profile compatibility, model-selected grounded capability in Studio, deployed second-origin proof, final submission materials, identity and persistence remain open.

## 2026-11-18 — integration delivery and deployment verification

- Implementation commit `d2d3da6a23bfef598eb43e1069afe594482cffc5` pushed directly to main; remote main SHA matched. Baseline/matrix stage `5594949` was separately committed and pushed first. No force push or overwritten concurrent changes.
- Existing Vercel Git-linked production build `dpl_6enJWAjtUm5HeyiHgrszinxrfr1F` reached READY for the implementation commit. Public URL remains https://ai-agents-tower.vercel.app/ .
- Public browser navigation was attempted with system Chromium and failed at the environment tunnel (`net::ERR_TUNNEL_CONNECTION_FAILED`); online UI behavior could not be verified. READY and successful local tests are recorded separately. No credentials or security changes were introduced.
- Updated README, deployment instructions and matrix to describe the integrated mock app rather than the old M1-only deployment. This final documentation stage uses diff review and git diff --check; no unnecessary application retest is claimed.
- No decision is required to use the mock draft workflow. A real default inference route still needs a separately authorized provider/local-model plan with demonstrable zero paid fallback and judging capacity. Full-profile and historical-version questions need official clarification; a deployed independent HTTPS demo and final submission evidence remain future gates.
