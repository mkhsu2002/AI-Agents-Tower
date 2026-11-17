# Dependency and asset notes

Observed from installed package metadata and package-lock.json on 2026-11-17. Exact transitive versions and license metadata are in the lockfile; this is not a project license grant or legal review.

| Direct dependency | Installed version | Declared license | Role |
| --- | --- | --- | --- |
| ajv | 8.20.0 | MIT | Runtime validation of trusted JSON Schema |
| vite | 8.3.8 | MIT | Local dev/static build |
| typescript | 6.0.3 | Apache-2.0 | Type checks |
| @playwright/test | 1.65.1 | Apache-2.0 | Browser verification |
| @types/node | See lockfile | MIT | Node types for tests/config |
| eslint | 10.15.0 | MIT | Lint |
| typescript-eslint | 8.73.0 | MIT | TypeScript lint rules |

Ajv's production dependency tree: fast-deep-equal 3.1.3 (MIT), fast-uri 3.1.9 (BSD-3-Clause), json-schema-traverse 1.0.0 (MIT), require-from-string 2.0.2 (MIT). Keep applicable notices when distributing. Ajv compiles a fixed checked-in schema; imported bundles never define schemas or code.

No external images, fonts, media, MuseCondo code or runtime source were copied. UI uses system fonts, CSS and text. Project license is still an owner decision; there is no LICENSE file. A complete redistribution/license review remains a pre-publication gate. npm audit (all dependencies and production-only) reported 0 known vulnerabilities on the verification date; this does not guarantee absence of vulnerabilities.
