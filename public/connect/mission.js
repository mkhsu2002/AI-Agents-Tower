// src/domain/homebundle-validator.js
var ucs2length = (value) => [...value].length;
var homebundle_validator_default = validate10;
var schema11 = { "$schema": "http://json-schema.org/draft-07/schema#", "$id": "urn:ai-agents-tower:homebundle:0.1", "title": "HomeBundle v0.1", "description": "Portable text content only. No identity, authorization, persistence or publication authority. JSON input and canonical export must each fit 65536 UTF-8 bytes.", "type": "object", "additionalProperties": false, "required": ["schemaVersion", "displayName", "introduction", "blocks"], "properties": { "schemaVersion": { "const": "0.1" }, "displayName": { "type": "string", "minLength": 1, "maxLength": 80, "pattern": "\\S" }, "introduction": { "type": "string", "minLength": 1, "maxLength": 2e3, "pattern": "\\S" }, "blocks": { "type": "array", "maxItems": 12, "items": { "type": "object", "additionalProperties": false, "required": ["type", "title", "text"], "properties": { "type": { "const": "text" }, "title": { "type": "string", "minLength": 1, "maxLength": 120, "pattern": "\\S" }, "text": { "type": "string", "minLength": 1, "maxLength": 4e3, "pattern": "\\S" } } } }, "theme": { "type": "string", "enum": ["paper", "midnight", "sage"] } } };
var func2 = ucs2length;
var pattern0 = new RegExp("\\S", "u");
function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.schemaVersion === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "schemaVersion" }, message: "must have required property 'schemaVersion'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.displayName === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "displayName" }, message: "must have required property 'displayName'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.introduction === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "introduction" }, message: "must have required property 'introduction'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.blocks === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "blocks" }, message: "must have required property 'blocks'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "schemaVersion" || key0 === "displayName" || key0 === "introduction" || key0 === "blocks" || key0 === "theme")) {
        const err4 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.schemaVersion !== void 0) {
      if ("0.1" !== data.schemaVersion) {
        const err5 = { instancePath: instancePath + "/schemaVersion", schemaPath: "#/properties/schemaVersion/const", keyword: "const", params: { allowedValue: "0.1" }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.displayName !== void 0) {
      let data1 = data.displayName;
      if (typeof data1 === "string") {
        if (func2(data1) > 80) {
          const err6 = { instancePath: instancePath + "/displayName", schemaPath: "#/properties/displayName/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (func2(data1) < 1) {
          const err7 = { instancePath: instancePath + "/displayName", schemaPath: "#/properties/displayName/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (!pattern0.test(data1)) {
          const err8 = { instancePath: instancePath + "/displayName", schemaPath: "#/properties/displayName/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = { instancePath: instancePath + "/displayName", schemaPath: "#/properties/displayName/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.introduction !== void 0) {
      let data2 = data.introduction;
      if (typeof data2 === "string") {
        if (func2(data2) > 2e3) {
          const err10 = { instancePath: instancePath + "/introduction", schemaPath: "#/properties/introduction/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (func2(data2) < 1) {
          const err11 = { instancePath: instancePath + "/introduction", schemaPath: "#/properties/introduction/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        if (!pattern0.test(data2)) {
          const err12 = { instancePath: instancePath + "/introduction", schemaPath: "#/properties/introduction/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      } else {
        const err13 = { instancePath: instancePath + "/introduction", schemaPath: "#/properties/introduction/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.blocks !== void 0) {
      let data3 = data.blocks;
      if (Array.isArray(data3)) {
        if (data3.length > 12) {
          const err14 = { instancePath: instancePath + "/blocks", schemaPath: "#/properties/blocks/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
            if (data4.type === void 0) {
              const err15 = { instancePath: instancePath + "/blocks/" + i0, schemaPath: "#/properties/blocks/items/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data4.title === void 0) {
              const err16 = { instancePath: instancePath + "/blocks/" + i0, schemaPath: "#/properties/blocks/items/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property 'title'" };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (data4.text === void 0) {
              const err17 = { instancePath: instancePath + "/blocks/" + i0, schemaPath: "#/properties/blocks/items/required", keyword: "required", params: { missingProperty: "text" }, message: "must have required property 'text'" };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
            for (const key1 in data4) {
              if (!(key1 === "type" || key1 === "title" || key1 === "text")) {
                const err18 = { instancePath: instancePath + "/blocks/" + i0, schemaPath: "#/properties/blocks/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data4.type !== void 0) {
              if ("text" !== data4.type) {
                const err19 = { instancePath: instancePath + "/blocks/" + i0 + "/type", schemaPath: "#/properties/blocks/items/properties/type/const", keyword: "const", params: { allowedValue: "text" }, message: "must be equal to constant" };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data4.title !== void 0) {
              let data6 = data4.title;
              if (typeof data6 === "string") {
                if (func2(data6) > 120) {
                  const err20 = { instancePath: instancePath + "/blocks/" + i0 + "/title", schemaPath: "#/properties/blocks/items/properties/title/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
                  if (vErrors === null) {
                    vErrors = [err20];
                  } else {
                    vErrors.push(err20);
                  }
                  errors++;
                }
                if (func2(data6) < 1) {
                  const err21 = { instancePath: instancePath + "/blocks/" + i0 + "/title", schemaPath: "#/properties/blocks/items/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  if (vErrors === null) {
                    vErrors = [err21];
                  } else {
                    vErrors.push(err21);
                  }
                  errors++;
                }
                if (!pattern0.test(data6)) {
                  const err22 = { instancePath: instancePath + "/blocks/" + i0 + "/title", schemaPath: "#/properties/blocks/items/properties/title/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                  if (vErrors === null) {
                    vErrors = [err22];
                  } else {
                    vErrors.push(err22);
                  }
                  errors++;
                }
              } else {
                const err23 = { instancePath: instancePath + "/blocks/" + i0 + "/title", schemaPath: "#/properties/blocks/items/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
            if (data4.text !== void 0) {
              let data7 = data4.text;
              if (typeof data7 === "string") {
                if (func2(data7) > 4e3) {
                  const err24 = { instancePath: instancePath + "/blocks/" + i0 + "/text", schemaPath: "#/properties/blocks/items/properties/text/maxLength", keyword: "maxLength", params: { limit: 4e3 }, message: "must NOT have more than 4000 characters" };
                  if (vErrors === null) {
                    vErrors = [err24];
                  } else {
                    vErrors.push(err24);
                  }
                  errors++;
                }
                if (func2(data7) < 1) {
                  const err25 = { instancePath: instancePath + "/blocks/" + i0 + "/text", schemaPath: "#/properties/blocks/items/properties/text/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                  if (vErrors === null) {
                    vErrors = [err25];
                  } else {
                    vErrors.push(err25);
                  }
                  errors++;
                }
                if (!pattern0.test(data7)) {
                  const err26 = { instancePath: instancePath + "/blocks/" + i0 + "/text", schemaPath: "#/properties/blocks/items/properties/text/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                  if (vErrors === null) {
                    vErrors = [err26];
                  } else {
                    vErrors.push(err26);
                  }
                  errors++;
                }
              } else {
                const err27 = { instancePath: instancePath + "/blocks/" + i0 + "/text", schemaPath: "#/properties/blocks/items/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }
                errors++;
              }
            }
          } else {
            const err28 = { instancePath: instancePath + "/blocks/" + i0, schemaPath: "#/properties/blocks/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err28];
            } else {
              vErrors.push(err28);
            }
            errors++;
          }
        }
      } else {
        const err29 = { instancePath: instancePath + "/blocks", schemaPath: "#/properties/blocks/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
    }
    if (data.theme !== void 0) {
      let data8 = data.theme;
      if (typeof data8 !== "string") {
        const err30 = { instancePath: instancePath + "/theme", schemaPath: "#/properties/theme/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
      if (!(data8 === "paper" || data8 === "midnight" || data8 === "sage")) {
        const err31 = { instancePath: instancePath + "/theme", schemaPath: "#/properties/theme/enum", keyword: "enum", params: { allowedValues: schema11.properties.theme.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      }
    }
  } else {
    const err32 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err32];
    } else {
      vErrors.push(err32);
    }
    errors++;
  }
  validate10.errors = vErrors;
  return errors === 0;
}

// src/domain/homebundle.ts
var MAX_BYTES = 65536;
var size = (text) => new TextEncoder().encode(text).length;
var fail = (code, message) => ({ ok: false, errors: [{ code, path: "/", message }] });
function validateBundle(input) {
  if (!homebundle_validator_default(input)) {
    return { ok: false, errors: (homebundle_validator_default.errors ?? []).map((error) => ({
      code: error.keyword === "const" && error.instancePath === "/schemaVersion" ? "UNSUPPORTED_VERSION" : "SCHEMA_INVALID",
      path: error.instancePath || "/",
      // Do not echo unknown field names or user content into errors.
      message: error.keyword === "additionalProperties" ? "Unknown fields are not allowed." : `Value ${error.message ?? "is invalid"}.`
    })) };
  }
  const canonical = JSON.stringify(input, null, 2) + "\n";
  if (size(canonical) > MAX_BYTES) return fail("TOO_LARGE", "Canonical JSON must not exceed 65536 UTF-8 bytes.");
  return { ok: true, value: structuredClone(input) };
}
function parseBundle(text) {
  if (text.length > MAX_BYTES || size(text) > MAX_BYTES) return fail("TOO_LARGE", "JSON input must not exceed 65536 UTF-8 bytes.");
  let input;
  try {
    input = JSON.parse(text);
  } catch {
    return fail("MALFORMED_JSON", "Invalid JSON. Check syntax; the draft has not been replaced.");
  }
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|[{}[\]:,]|[^\s{}[\]:,]+/g) ?? [];
  const scopes = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "{") scopes.push(/* @__PURE__ */ new Set());
    else if (token === "[") scopes.push(null);
    else if (token === "}" || token === "]") scopes.pop();
    else if (token.startsWith('"') && tokens[i + 1] === ":") {
      const key = JSON.parse(token);
      const keys = scopes.at(-1);
      if (keys?.has(key)) return fail("DUPLICATE_KEY", "Duplicate JSON object keys are not allowed.");
      keys?.add(key);
    }
  }
  return validateBundle(input);
}
function exportBundle(input) {
  const result = validateBundle(input);
  return result.ok ? { ok: true, value: JSON.stringify(result.value, null, 2) + "\n" } : result;
}

// src/agents/validation-action.ts
var validationDefinition = {
  name: "validate_home_bundle",
  description: "Validate HomeBundle text in this browser. Read-only; no storage or publication.",
  effect: "read",
  availability: "local-only",
  timeoutMs: 1e4,
  inputSchema: { type: "object", properties: { bundleJson: { type: "string", maxLength: 65536 } }, required: ["bundleJson"], additionalProperties: false },
  outputSchema: { type: "object", properties: { valid: { type: "boolean" } }, required: ["valid"], additionalProperties: false }
};

// agent-network/runtime/source/schema/validators.js
var pattern02 = new RegExp("^[\\s\\S]{1,4000}$", "u");
var pattern1 = new RegExp("^[A-Za-z][A-Za-z0-9_-]{0,79}$", "u");
var pattern6 = new RegExp("^[\\s\\S]{1,8000}$", "u");
var pattern7 = new RegExp("^[\\s\\S]{1,2048}$", "u");
var pattern10 = new RegExp("^[\\s\\S]{1,128}$", "u");

// agent-network/runtime/source/safety.js
var policyError = (message) => Object.assign(new Error(message), { code: "RUNTIME_POLICY" });
var LIMITS = Object.freeze({ artifactBytes: 131072, responseBytes: 262144, depth: 16, nodes: 1e4 });
function checkedUrl(value, base) {
  let url;
  try {
    url = new URL(value, base);
  } catch {
    throw policyError("Invalid destination URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.hash) throw policyError("Only credential-free HTTP(S) destinations without fragments are supported.");
  if (url.protocol === "http:" && !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) throw policyError("HTTP is supported only for loopback development.");
  return url;
}
function strictJson(text) {
  if (text.length > LIMITS.artifactBytes || new TextEncoder().encode(text).length > LIMITS.artifactBytes) throw policyError("Artifact exceeds 131072 bytes.");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw policyError("Artifact must be valid JSON; HOCON and executable definitions are unsupported.");
  }
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|[{}[\]:,]|[^\s{}[\]:,]+/g) || [];
  const scopes = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "{" || token === "[") {
      scopes.push(token === "{" ? /* @__PURE__ */ new Set() : null);
      if (scopes.length > LIMITS.depth) throw policyError("Artifact nesting limit exceeded.");
    } else if (token === "}" || token === "]") scopes.pop();
    else if (token.startsWith('"') && tokens[i + 1] === ":") {
      const key = JSON.parse(token);
      const keys = scopes.at(-1);
      if (keys?.has(key)) throw policyError("Duplicate JSON keys are not allowed.");
      keys?.add(key);
    }
  }
  let nodes = 0;
  const pending = [value];
  while (pending.length) {
    const item = pending.pop();
    if (++nodes > LIMITS.nodes) throw policyError("Artifact node limit exceeded.");
    if (item && typeof item === "object") pending.push(...Object.values(item));
  }
  return value;
}
var Operation = class {
  constructor(timeoutMs = 1e4) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 3e4) throw policyError("Runtime timeout must be 100\u201330000 milliseconds.");
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    this.deadline = performance.now() + timeoutMs;
    this.timer = setTimeout(() => this.cancel("Runtime deadline exceeded. Remote outcomes may be unknown; do not retry automatically."), timeoutMs);
  }
  assert() {
    if (performance.now() >= this.deadline && !this.signal.aborted) this.cancel("Runtime deadline exceeded. Remote outcomes may be unknown; do not retry automatically.");
    this.signal.throwIfAborted();
  }
  cancel(message = "Runtime cancelled. Remote outcomes may be unknown; do not retry automatically.") {
    this.controller.abort(new Error(message));
  }
  dispose() {
    clearTimeout(this.timer);
    this.cancel("Runtime operation closed.");
  }
  async wait(promise) {
    if (this.signal.aborted) {
      Promise.resolve(promise).catch(() => {
      });
      this.assert();
    }
    let listener;
    try {
      const result = await Promise.race([promise, new Promise((_, reject) => {
        listener = () => reject(this.signal.reason);
        this.signal.addEventListener("abort", listener, { once: true });
      })]);
      this.assert();
      return result;
    } finally {
      this.signal.removeEventListener("abort", listener);
    }
  }
  async read(promise) {
    try {
      return await this.wait(promise);
    } catch {
      this.assert();
      throw policyError("Response body is invalid, interrupted or exceeds the supported byte limit.");
    }
  }
  async fetch(url, options = {}) {
    this.assert();
    checkedUrl(url);
    if (options.body !== void 0 && (typeof options.body !== "string" || new TextEncoder().encode(options.body).length > LIMITS.responseBytes)) throw policyError("Request exceeds the supported JSON byte limit.");
    const signal = options.signal ? AbortSignal.any([this.signal, options.signal]) : this.signal;
    let response;
    try {
      response = await this.wait(fetch(url, { ...options, signal, redirect: "error", credentials: "omit" }));
    } catch {
      this.assert();
      throw policyError("Request failed or redirected; redirect destinations are not authorized.");
    }
    const length = Number(response.headers.get("content-length"));
    if (length > LIMITS.responseBytes) throw policyError("Response exceeds the supported byte limit.");
    let bytes = 0;
    const body = response.body?.pipeThrough(new TransformStream({ transform(chunk, controller) {
      bytes += chunk.byteLength;
      if (bytes > LIMITS.responseBytes) throw policyError("Response exceeds the supported byte limit.");
      controller.enqueue(chunk);
    } }));
    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
  }
};

// agent-network/client/mission.mjs
var callerNetworkPath = "/api/agent-network/agents/caller";
var task = "homebundle.collaborate.fixed";
async function inspectHomeTask() {
  const operation = new Operation(1e4);
  try {
    const response = await operation.fetch(location.origin + "/api/agent-network/config?entry=entry-a");
    if (!response.headers.get("content-type")?.includes("application/json")) throw Error("TASK_CONFIG_UNAVAILABLE");
    const config = strictJson(await operation.read(response.text()));
    if (!response.ok || config.enabled !== true) throw Error(["PEER_NOT_CONFIGURED", "NETWORK_DISABLED"].includes(config.code) ? config.code : "TASK_CONFIG_UNAVAILABLE");
    const runtime = await operation.read(import("/connect/runtime/index.js"));
    const networkUrl = location.origin + callerNetworkPath;
    const defaults = await runtime.readPublishedDefaults(networkUrl);
    const peer = new URL(config.peer);
    if (peer.origin !== config.peer || peer.origin === location.origin || !["http:", "https:"].includes(peer.protocol)) throw Error("PEER_SCOPE_REJECTED");
    const scope = Object.freeze({
      task,
      caller: location.origin,
      peer: peer.origin,
      network: peer.origin + "/api/agent-network/agents/workshop",
      input: config.input,
      model: defaults.model,
      router: defaults.endpoint,
      maximumModelCalls: 3,
      action: "validate_home_bundle",
      executionMode: config.executionLabel
    });
    return { scope, config, defaults, runtime, networkUrl };
  } finally {
    operation.dispose();
  }
}
async function previewHomeTask() {
  return (await inspectHomeTask()).scope;
}
async function runHomeTask({ authorize } = {}) {
  if (typeof authorize !== "function") throw Error("USER_AUTHORIZATION_REQUIRED");
  const { scope, config, defaults, runtime, networkUrl } = await inspectHomeTask();
  if (await authorize(scope) !== true) throw Error("CONSENT_DENIED");
  const run = await runtime.prepareRuntime({
    enabled: true,
    networkUrl,
    executionNetworkUrl: scope.network,
    input: scope.input,
    maxCalls: scope.maximumModelCalls,
    authorization: config.authorization,
    approve: async (origin, _purpose, selected) => (origin === scope.caller || origin === scope.peer) && (!selected || selected.endpoint === defaults.endpoint && selected.model === defaults.model && selected.source === defaults.source),
    actions: [{ definition: validationDefinition, execute: async ({ bundleJson }) => ({ valid: parseBundle(bundleJson).ok }) }]
  });
  const output = await run.run(scope.input);
  const parsed = parseBundle(output.text);
  if (!parsed.ok) throw Error("BUNDLE_INVALID");
  const exported = exportBundle(parsed.value);
  if (!exported.ok) throw Error("BUNDLE_EXPORT_FAILED");
  const action = networkUrl + "#" + validationDefinition.name;
  const plan = run.engine.actions.prepare({
    kind: "action",
    id: "validate-homebundle",
    action,
    arguments: { bundleJson: exported.value }
  }, {});
  const receipts = await run.engine.actions.execute(
    plan,
    async (steps) => steps.length === 1 && steps[0].origin === scope.caller && steps[0].effect === "read" && steps[0].action === validationDefinition.name && steps[0].arguments.bundleJson === exported.value,
    crypto.randomUUID()
  );
  const receipt = receipts?.[0];
  if (receipt?.status !== "succeeded" || receipt.result?.valid !== true) throw Error("VALIDATION_FAILED");
  const bytes = new TextEncoder().encode(exported.value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const roles = run.engine.trace.events.filter(
    (event) => event.kind === "agent" && event.phase === "start" && event.agent
  ).map(({ agent, network: network2, origin }) => ({ agent, network: network2, origin }));
  const expectedHost = new URL(scope.peer).host;
  if (run.calls !== scope.maximumModelCalls || roles.length !== 2 || roles[0].agent !== "reception" || roles[1].agent !== "home_builder" || roles.some((role) => role.network !== "workshop" || role.origin !== expectedHost)) throw Error("ROLE_EXECUTION_UNCONFIRMED");
  return {
    task,
    bundleJson: exported.value,
    receipt: {
      status: "schema_valid",
      executionMode: scope.executionMode,
      schemaVersion: parsed.value.schemaVersion,
      canonicalUtf8Bytes: bytes.byteLength,
      canonicalSHA256: [...new Uint8Array(hash)].map((n) => n.toString(16).padStart(2, "0")).join(""),
      action: receipt.action,
      actionStatus: receipt.status,
      actionRequestId: receipt.requestId,
      network: scope.network,
      model: scope.model,
      modelCalls: run.calls,
      roles
    }
  };
}
export {
  previewHomeTask,
  runHomeTask
};
