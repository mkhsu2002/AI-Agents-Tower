# Competition baseline and runtime research

Researched 2026-11-17. These are source observations and implementation planning, not a conformance certification.

## Rules and historical baseline

[Official rules, sections 1 and 4](https://cognizant-agenticweb.devpost.com/rules) place submission start at November 11, 2026, 8:00 pm Pacific: **2026-11-12T04:00:00Z**. They require conformance to the specification at submission start, a public browser product, free testing access and English materials (or translations). Deadline currently shown: 2027-01-11T16:00:00Z. Recheck rules before submission.

Read-only GitHub API lookup:

- [Latest reachable main commit at/before cutoff](https://api.github.com/repos/cognizant-ai-labs/agentic-web/commits?sha=main&until=2026-11-12T04:00:00Z&per_page=1): `e4a8727d5c6807233b8976f28494bbdac7bc1c6e`, committed `2026-11-12T03:57:53Z`.
- [Latest specification-path commit at/before cutoff](https://api.github.com/repos/cognizant-ai-labs/agentic-web/commits?path=docs/worldwide_agentic_web_mvp_spec.md&until=2026-11-12T04:00:00Z&per_page=1): `fd872b9221aeb8ff762b75a5badbf84b23c133cc`, committed `2026-11-10T15:50:31Z`.
- [Tree at main cutoff](https://api.github.com/repos/cognizant-ai-labs/agentic-web/git/trees/e4a8727d5c6807233b8976f28494bbdac7bc1c6e?recursive=1) and the path commit's tree both identify `docs/worldwide_agentic_web_mvp_spec.md` as blob **`7a09be795cc3eee47f601f1a6bc7dc26d408f7a9`**, size **36,225 bytes**. Responses were not truncated.
- [Immutable working specification link](https://github.com/cognizant-ai-labs/agentic-web/blob/e4a8727d5c6807233b8976f28494bbdac7bc1c6e/docs/worldwide_agentic_web_mvp_spec.md). Header: MVP Profile 0.2, 6 November 2026.

**Pin status:** use this immutable commit + blob as a best-effort recovered engineering baseline. Date-filtered current ancestry cannot prove what `main` pointed to at the historical instant (e.g. history rewrites or later merges). No organizer-certified historical tag/snapshot was established. Exact authoritative submission-start revision therefore remains an unresolved gate; request organizer clarification before claiming compliance. Do not silently update this pin to today's main.

## Implications for Tower

The baseline is a browser-executed portable network profile. HomeBundle JSON only carries home text; it does not implement that network. M2 must prove named peer loading, browser execution, user consent and credential isolation with a real second origin. The plan in MVP-PLAN.md is Tower's intended test strategy, not current evidence.

## nsdeploy candidate, research only

[nsdeploy README](https://github.com/cognizant-ai-lab/nsdeploy/blob/4e4cb36731ae71cbbb905d3fe98f26299ac3b4f2/README.md), inspected at commit `4e4cb36731ae71cbbb905d3fe98f26299ac3b4f2` (2026-11-13T19:15:30Z). It describes HOCON resolution, generated web artifacts, browser ES modules and hosted MCP tools. Its build/launcher can fetch tool sources and install dependencies automatically; defaults include a mock inference route. Those behaviors require an isolated review before adoption. At the M1 baseline, it was not installed, executed, vendored or connected. A later isolated [M2 spike](M2-FEASIBILITY.md) vendors and tests only the pinned Engine dependency closure; the launcher is still not installed or run. This is a candidate runtime pin for evaluation, separate from the rules baseline, and not a selected production runtime.

Before M2, inspect exact runtime files and licenses, dependency resolution, outbound fetches, route defaults, inference funding and all consent/credential/budget behavior. A generated chat page or working external MCP facade is not evidence that peer agents executed in the caller browser.
