# ADR 0001: A small local draft application

Status: accepted for M0/M1, 2026-11-17.

## Context and decision

The repository began with one planning README and no application, AGENTS.md or local .agents skills. Use TypeScript, Vite and browser DOM APIs. Ajv is the single direct production dependency and compiles the application-owned JSON Schema; imported content never becomes a schema or executable code. Node's built-in test runner covers the domain, Playwright covers the built UI, and ESLint/TypeScript check source. Use a lockfile and Node >=22.12 (Node 24 verified). TypeScript 6.0.3 is compatible with the current typescript-eslint peer range; latest TypeScript 7 was not forced past that range.

Avoid a framework, backend, model SDK, auth service and database for this reversible slice. JSON Schema is both the downloadable contract and executable validation source, with transport byte and duplicate-key checks in the parser. Tests assert semantic round-trips, preserving text, field absence and block order; formatting of JSON is not retained.

## Consequences

The app builds to static files; this is not a deployment decision. Draft and import text live in tab memory. No content is sent to a server, persisted in browser storage or auto-restored. Explicit JSON downloads are user-controlled copies; browser download completion cannot be guaranteed. Reload/close warns when draft has changed, but browser shutdown, crash or ignored dialogs can still lose content. UI states must say so. Authentication and server-side validation must be designed independently before M3.

The only innerHTML assignment is an application-owned static template. Every user value uses DOM textContent or form value. No HTML/Markdown interpretation, URL embedding, external fonts, imported styles, eval of user content or arbitrary script support. Theme maps to a fixed class enum. Ajv's internal code generation uses trusted checked-in schema only.
