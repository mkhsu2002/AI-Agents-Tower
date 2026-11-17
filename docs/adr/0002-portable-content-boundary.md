# ADR 0002: Content has no authority

Status: accepted for HomeBundle v0.1, 2026-11-17.

## Decision

HomeBundle has exactly schemaVersion, displayName, introduction, blocks and optional constrained theme. Each block has exactly type, title and text. Reject unknown fields, unsupported versions, wrong types, empty/whitespace-only required strings, duplicate JSON keys and oversized data. Never coerce, trim, insert defaults or strip fields. Script-like text is valid literal content and is rendered safely; validation is not a claim that words are benign.

A valid import atomically replaces the draft on the explicit Replace button. File selection stages JSON text without replacing the draft. Invalid imports keep draft and raw input; invalid edits pause preview and download so an old valid preview cannot masquerade as current. Cancelled, failed and superseded reads cannot overwrite newer input. Optional theme absence survives a round-trip; default rendering does not inject a theme into export.

## Consequences

No credential, owner ID, approval flag, private-memory field, executable block, asset URL, permanent identity or publication state can travel in v0.1. Reject incompatible versions rather than guessing migrations. An exported file is not an operation receipt or proof of tenancy. Future backend records and public snapshots will remain separate from this portable content. See MVP-PLAN.md for M3/M4 references and unresolved identity decisions.
