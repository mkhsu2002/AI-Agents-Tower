# T03: real inference preparation

Implemented a keyless OpenAI-compatible transport adapter in src/agents/keyless-inference.ts. It accepts only an exact host-approved origin/model/endpoint, has no credential field/header, bounds requests and outputs, supports text and declared tool calls, rejects truncation/malformed results/unknown tools/redirects, propagates cancellation and deadlines, and never retries automatically.

Four contract tests use actual local HTTP with scripted responses. They are **not real inference**. The model name or adapter mode cannot attest that weights ran. No installed/configured authorized model route was identified, no weights downloaded and no real provider request made. The adapter remains disconnected from public Studio; the Engine's mock-only injection gate and public settings are unchanged. Enabling this module alone is not a deployable reviewer inference path or a guarantee of zero billing.

[Ollama's official compatibility documentation](https://docs.ollama.com/api/openai-compatibility) supports a possible existing local keyless route. Using local hardware does not establish public reviewer availability or capacity. An actual tool-capable model, authorized endpoint, privacy/cost limits and public default judging access still need a separately approved integration and measured run. No paid fallback is permitted by this preparation.

Verified transport cases: exact origin/no credentials, JSON text/tools, output limits, malformed/oversized output, unknown tools, incomplete response, service error, redirects with zero target contact, cancellation and deadline. At this checkpoint lint/typecheck and all 24 domain/adapter/capability unit tests passed. Broader subsequent server-core tests are recorded separately.
