# T04/T05 evidence harnesses

## Independent caller package

`npm run build:interop` produces ignored artifacts/interop-caller using the production app's own browser runtime/assets. The bootstrap selects the exact public Tower network URL but leaves approval unchecked. No executable code is imported from the peer. Deploy the complete directory on an authorized independent HTTPS origin; publishing this package is a separate action and was not performed here. Public-artifact CORS must be intentionally configured for that origin. No deployment protection, credentials or private endpoints are weakened by packaging.

`CHROMIUM_PATH=/usr/bin/chromium npm run test:interop` first packages a loopback source and runs an independent caller at 4190 loading Tower artifacts at 4173. The test passed: zero peer contact on refusal, exact named manifest/network GETs after approval, no user brief forwarded in bodies, browser-local mock collaboration and registered validation, and no editor replacement before apply. This is distinct from the older 4173→4182 network fixture. It is still HTTP/local/mock evidence, not the required independent deployed HTTPS real-model demonstration.

After local testing, run `node scripts/package-interop.mjs` to restore the package's default public HTTPS source. The initial real-model route must be configured in the caller rather than sent to a peer. No credential input is added by this harness.

## Production verification

`CHROMIUM_PATH=/usr/bin/chromium npm run test:production` targets the existing public site only, with no service creation, session, key or bypass. Tests cover real UI round-trip/download/reimport, denied approval, invalid import, and explicitly labelled client fault-injection model/action/validation/deadline/cancel/restart cases. Fault injection is a test technique, not evidence of actual provider failures or real inference.

Actual attempt: the first production round-trip test failed before page interaction with net::ERR_TUNNEL_CONNECTION_FAILED. The remaining production cases were prepared but not run. Cloud Browser selection succeeded, but tab creation returned "Browser Use could not read requirements." No site sign-in or CAPTCHA was encountered; this is not reported as bot detection. Earlier remote Firecrawl HTTP 200 content extraction remains separate evidence, not an interaction pass.

T04 is locally verified/packaged and blocked for deployed HTTPS evidence; T05 is prepared but blocked on browser/environment access. Neither is marked complete. No aliases of one deployment are presented as an independent second-site proof.

Reviewer checkpoint 2026-11-21: the independent local caller check passed again with the trusted-adapter changes, then its package was restored to the public HTTPS source. No second HTTPS site was created. The normal production reviewer-entry test failed before interaction at page.goto with ERR_TUNNEL_CONNECTION_FAILED. Separate fresh public content extraction verified HTTP 200 and disabled reviewer status, not a public interaction pass. See DEPLOYMENT.md and evidence/reviewer-deployment-readback.json. A future independent caller's live router policy must be configured by that caller; the restricted reviewer entry intentionally does not accept arbitrary peer URLs.
