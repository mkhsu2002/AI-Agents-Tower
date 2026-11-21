# Restricted reviewer demo wiring — 2026-11-21

## Implemented, disabled by default

The public Home Studio has a normal **Try the demo** entry and an explicit **Simulation / Live demo** selector. Simulation remains the default. Live demo uses one fixed fictional Atlas brief and the exact local tower-home-builder network. It does not accept the editor, imported content, a visitor URL, a key, or a free-form prompt. Mode changes revoke consent and discard pending proposals; returning to Simulation restores the visitor's brief and source in tab memory.

After fresh explicit consent, Studio reads `/reviewer/status.json` without cache or credentials. The shipped file is exactly `{"enabled":false}`. This stops before loading a network or sending a model request. No live provider, relay, credential, environment variable or production switch was added. Choosing Live demo does not turn on inference.

The prepared host contract accepts only `{enabled:true,model:<validated identifier>}`. There is no configurable endpoint: the existing bounded keyless transport targets the caller's `/api/reviewer/v1/chat/completions`. Unknown fields, credentials, invalid identifiers, redirects and errors stop the run. There is no fallback to Simulation and no automatic retry. This contract is not a running server endpoint.

The patched Engine permits a non-mock custom adapter only through an explicit trusted host option whose origin equals the browser's origin, the top network's origin, adapter origin and router override. Published network metadata cannot grant that option. Existing mock injection remains available for development. This is a Tower extension, not a new upstream compatibility claim; provenance records the modified Engine blob and preserves the upstream Apache license.

The same Reception → Home builder → Reception loop and registered local validate_home_bundle action are reused. A proposal requires a matching action, an actual successful dispatcher receipt and a valid HomeBundle. The receipt is available under **Validation receipt**. Review, explicit Apply, conflict protection, editor preview and JSON download remain separate. A validation receipt proves local validation, **not that model weights ran**. The manifest still advertises the development mock router; updating and verifying the default live inference metadata remains an activation gate.

## Verified fixture scope

`tests/reviewer-demo.spec.ts` intercepts the same-origin service with an explicitly named SCRIPTED-FIXTURE-NOT-INFERENCE response generator. The successful fixture performs three HTTP-interface calls while actual orchestration, agent delegation, action dispatch, schema validation and review/apply/export run in the browser. Fixtures cover disabled service, absent consent, 429, 503, provider refusal, invalid bundle, network failure, cancellation, enforced deadline, restart and tampered brief/source. Requests contain no editor sentinel, authorization header or cookie. No browser storage is written. Fixture status or the adapter's real-mode label is not model attestation.

Unit HTTP fixtures reject disabled/unknown/credential-bearing status and redirects without contacting the target. The runtime suite rejects missing, mismatched, peer-origin and mock-router live injection authority. Existing M1 and runtime safety regressions remain required. The optional screenshot at `artifacts/evidence/reviewer-SCRIPTED-FIXTURE.png` is local synthetic evidence, not a production or real-model screenshot.

## Gates before activation

Do **not** enable status by itself. The same-origin gateway does not exist yet. Client-side fixed input is a user-experience guard, **not server authorization or abuse prevention**. Before a provider-backed endpoint becomes public:

1. Obtain owner authorization for one provider and confirm its actual account/region terms, tool support, remaining free quota and provider-enforced no-paid-fallback policy. Keep any provider credential server-only and out of logs and browser bundles.
2. Implement and test a gateway which reconstructs only the fixed synthetic role requests. It must reject arbitrary prompts, models, endpoints and client-supplied transcript substitutions; use bounded run/phase authority and expiry. Do not expose a general keyed chat proxy or rely on browser restrictions as its policy.
3. Enforce request/output/call/time bounds and anonymous abuse/quota protection. No durable global quota guarantee can be made from process-local counters on serverless instances. Quota exhaustion must stop visibly rather than buy capacity, retry indefinitely or switch models outside the free allowlist.
4. Verify live tool calling, both browser-executed roles, exact validation receipt and review/apply/export using the public normal route. Retain sanitized provider/model/time/call-count evidence separately from local validation receipts, with no credentials or private prompts.
5. Keep the public manifest accurate. Verify the independent HTTPS caller and artifacts' CORS through normal access; the local caller package is not deployed HTTPS proof. Do not use an alias of this deployment as that second-site evidence.

No private login, DB, public Home listing, publication, license change, second-site deployment or competition submission was added in this round. P0 remains incomplete until real inference and the remaining applicable conformance gates are actually verified.
