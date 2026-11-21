# T06/T07: server-only private/public domain core

This is tested implementation preparation, not a deployed private Home service. server/home-service.ts is not imported by the frontend, has no HTTP route and is absent from the production client bundle. SQLite is used as a local reference durable store, not provisioned on Vercel or represented as a production database decision. Only synthetic test identities/content are written into disposable local files.

## Boundaries and behavior

- HomeService requires a trusted server-owned authenticator. Missing configuration returns AUTH_NOT_CONFIGURED; absent identity returns UNAUTHENTICATED; verifier errors become AUTH_UNAVAILABLE without forwarding provider details. The module does not verify JWTs, run OAuth or implement a login session. Synthetic verifier tests are not production authentication proof.
- Owner/tenant scope is derived from verified issuer+subject. Caller bodies cannot supply owner authority. Portable HomeBundle schema remains unchanged and rejects authority fields.
- All mutations are bounded typed commands with strict unknown-field rejection. Private reads/updates and receipt recovery require the authenticated owner; another owner receives non-disclosing NOT_FOUND/rejected results.
- A request key is bound to owner, operation and canonical input hash. Successful and known rejected results are stored durably. Reusing it with another payload or operation fails. A receipt is historical operation evidence, not an assertion about current publication state.
- BEGIN IMMEDIATE transaction/savepoint and durable SQLite receipts bind home mutation plus receipt atomically. Revision guards prevent stale or concurrent lost updates. Unexpected storage failure returns STORAGE_UNAVAILABLE_CHECK_RECEIPT, never an automatic retry or a success guess.
- Explicit publication requires the selected current revision and its reviewed content digest. Content goes into a separately identified snapshot. Later private edits cannot mutate it. Republishing uses a new public ID; old active snapshots are withdrawn atomically.
- Unpublish is owner-scoped. Replaying an old publish receipt never reactivates a withdrawn snapshot. Public lookup returns active snapshots only and a no-store policy descriptor, without owner/home IDs. This descriptor is not CDN header/purge proof: no HTTP/CDN integration is deployed, and downloaded copies cannot be recalled.

## Actual tests

Nine local server-core tests pass: unconfigured/failed auth and rejected authority, two-tenant read/write/receipt isolation, key/hash idempotency, stale revisions and durable rejection, reviewed snapshots/private-public separation, withdrawal/replay, transaction rollback on receipt-write failure, actual close/reopen recovery and two database clients competing for one revision. Two client instances use synthetic test authentication; they are not two live external OAuth/MCP clients. Rollback injection tests database atomicity, not every process-crash or network-commit failure.

## Remaining production gates

Choose/authorize the identity verifier and persistent hosting/store, retention/deletion/capacity policy, session/CSRF and cross-origin client authorization, migrations, encryption/backup operations, real two-client integration and HTTP error/cache behavior. Then connect an explicitly reviewed save/publish UI to an authenticated API and test real tenant isolation and withdrawal. No save, login, residency or publish control is added to the public Studio by this core. Current visitor content remains memory-only until exported.
