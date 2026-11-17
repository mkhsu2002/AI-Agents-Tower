# HomeBundle v0.1 contract and local workflow

The [JSON Schema](../public/schema/homebundle-v0.1.schema.json) is the structural source of truth; the [domain module](../src/domain/homebundle.ts) also applies byte limits and duplicate-key rejection. The [synthetic example](../public/examples/welcome.homebundle.json) is safe to edit.

| Field | Requirement |
| --- | --- |
| schemaVersion | Exactly the string `0.1` |
| displayName | Required visible text, 1–80 Unicode code points |
| introduction | Required visible text, 1–2,000 Unicode code points |
| blocks | Required ordered array, 0–12 items |
| block.type | Exactly `text` |
| block.title | Required visible text, 1–120 Unicode code points |
| block.text | Required visible text, 1–4,000 Unicode code points |
| theme | Optional; `paper`, `midnight` or `sage` |

No other fields at either object level. Whitespace is preserved, but required text must contain a non-whitespace character. Unicode limits follow JSON Schema code points, not bytes or JavaScript UTF-16 length. Input JSON and pretty-printed canonical export must **each** fit 65,536 UTF-8 bytes, including syntax/escaping. The file picker checks bytes before reading and rejects invalid UTF-8. Pasted JSON uses the same byte cap. Duplicate keys, including escaped equivalent keys, are rejected rather than accepting JSON.parse's last-value behavior.

The functions return `{ok:true,value}` or `{ok:false,errors:[{code,path,message}]}`. Codes include MALFORMED_JSON, DUPLICATE_KEY, TOO_LARGE, UNSUPPORTED_VERSION and SCHEMA_INVALID. Paths use JSON Pointer (`/` for root); messages are English and do not echo user content. Syntax errors do not include raw exception text. No values are silently truncated or removed.

## Workflow and retention

Edit the fields and blocks, inspect the text-only preview and explicitly download JSON. To reimport, paste JSON or choose a file, review the staged text and select **Replace draft with JSON**. Replacement is complete, including removal of previous blocks; it is not a merge. Import text stays available for correction. A selected file never directly changes the current draft. Invalid edits disable export/preview until corrected or the invalid block is removed. A download request does not prove the OS retained the file; check Downloads.

The app keeps content in memory only. Closing/reloading loses edits; browser beforeunload prompts are best effort. File reads can be cancelled; clearing/editing import text cancels pending results. No auth, network content submission, browser storage, server save or public listing. Do not paste secrets. Scripts, markup and links are literal text, never interpreted or fetched. The app does not verify identity, provenance, eligibility or legal ownership. Homes are not registered by importing a bundle.
