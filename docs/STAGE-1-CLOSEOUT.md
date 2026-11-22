# Stage one: fixed draft workflow closeout

## Acceptance scope

Stage one closes the fixed-demo stabilization/evidence package. It combines K's reported normal public real-model draft/apply observation with isolated real-file export/reimport and repeatable scripted safety regressions. It does not claim a single independently recorded production generation-to-reimport trace, unrestricted custom-brief inference, all P0/P1 work or full competition conformance.

| Item | Result | Evidence boundary |
| --- | --- | --- |
| Public fixed Live demo → Draft ready → explicit Apply → Draft applied | Passed, reported by K | Active application b6006d1a19e1b2d181c9e091711acef22ca3c7f2; one standard UI run, no simulation/retry; exact timestamp and raw receipt/network/usage not supplied |
| Public download control available | Passed, reported by K | Actual public downloaded bytes/reimport were not observed in that report |
| Actual JSON download, file read, code validation and reimport | Passed locally | Isolated browser, built app, fixed fictional editor sample; real download event/file/parse/reimport, not a fake response |
| Invalid imports preserve editor/raw input; valid restart works | Passed locally | Static Studio acceptance and M1 browser regressions |
| Model/tool failure, invalid output, timeout and cancellation preserve draft; explicit restart | Passed locally | Scripted Studio/runtime tests; no remote rollback guarantee |
| Consent/origin/redirect/peer-tool isolation and no hidden persistence | Passed within local tested profile | Studio/runtime and wholly intercepted Cloudflare/D1 suites |
| Additional public static-file verification from this workspace | Blocked before app access | ERR_TUNNEL_CONNECTION_FAILED; cloud tab creation also failed before navigation; no bypass or model request |
| Complete public generated-file round-trip, production cancel/error recovery and repeated availability | Unverified | Not substituted by local passes; optional independent follow-up needs no re-run merely to check static controls |

See [reported public evidence](evidence/production-live-demo-b6006d1.json) and [local closeout evidence](evidence/stage-1-closeout.json). Error-response marker/body delivery remains a historical unresolved observation; failures preserve the draft and never become simulated success.

## Repeatable checks

Use the current README commands. `npm run test:public:studio` is opt-in: TOWER_PUBLIC_STUDIO_ACCEPTANCE=1 targets the fixed public origin; TOWER_STUDIO_LOCAL_FIXTURE=1 serves the local build and labels output local. It never activates consent/generation, blocks reviewer API routes defensively, and asserts no API request was attempted. The passing check writes a safe summary including downloaded-file SHA-256/byte count to its ignored output directory; no private content, key, ticket or raw model response is attached.

The public failure was a navigation failure, not evidence of a product failure, bot block or provider outage. No new credentials, account, setting, model route, budget, D1 schema, production execution rule or real-model request was introduced by this closeout. Application source is unchanged from b6006d1. Existing upstream attribution remains intact.

## Actual validation results

Lint, typecheck and build passed; 122 unit tests, 48 Studio browser tests, 61 runtime browser tests, 27 wholly intercepted native Cloudflare/D1 cases and one isolated real-file acceptance passed. The file summary includes its actual SHA-256 and byte count in the linked evidence. The additional public static check failed at navigation and remains explicitly blocked, not passed. No live inference was repeated.

## Handoff

K owns independent production readback/reporting. The next minimum package is [stage-two offline brief-contract work](STAGE-2-WORK-PACKAGE.md). That package does not itself enable user briefs at the live gateway. Private Home persistence, authentication, public snapshots, additional HTTPS hosting and broader official-profile support remain separate milestones.
