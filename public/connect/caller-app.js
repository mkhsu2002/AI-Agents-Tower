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

// agent-network/client/app.mjs
var el = (id) => document.getElementById(id);
var active;
var pending;
var epoch = 0;
var actionExecutions = 0;
var entry = location.pathname.endsWith("/entry-b") ? "entry-b" : "entry-a";
var config;
var defaults;
var networkUrl;
var rootDeclaration;
var prepareRuntime;
try {
  const rootUrl = location.origin + "/api/agent-network/agents/agent-manifest.json";
  const root = await (await fetch(rootUrl, { credentials: "omit", redirect: "error" })).json();
  const declared = document.querySelector('link[rel="agent-network"]');
  networkUrl = new URL(declared.href).href;
  if (new URL(networkUrl).origin !== location.origin) throw Error("CALLER_SOURCE_REQUIRED");
  const name = new URL(networkUrl).pathname.split("/").at(-1);
  const matches = root.networks.filter((n) => n.name === name);
  if (matches.length !== 1 || declared.dataset.networkName !== name) throw Error("EXACT_NETWORK_REQUIRED");
  if (root.llm_router?.mock !== false || root.llm_router?.base_url === "browser://mock") throw Error("PUBLISHED_DEFAULT_IS_SIMULATION");
  const runtimeUrl = location.origin + "/connect/runtime/index.js";
  const runtime = await import(
    /* @vite-ignore */
    runtimeUrl
  );
  prepareRuntime = runtime.prepareRuntime;
  defaults = await runtime.readPublishedDefaults(networkUrl);
  rootDeclaration = { rootUrl, name, frontAgent: matches[0].front_man, definition: new URL(matches[0].hocon, rootUrl).href, router: root.llm_router.base_url, runtimeUrl, networkUrl };
  const manifestUrl = new URL("./", networkUrl).href + "agent-manifest.json";
  const published = await (await fetch(manifestUrl, { credentials: "omit", redirect: "error" })).json();
  const exact = published.networks.filter((n) => n.name === name);
  if (rootDeclaration.definition !== defaults.source || rootDeclaration.router !== defaults.endpoint || exact.length !== 1 || exact[0].front_man !== rootDeclaration.frontAgent) throw Error("ROOT_DECLARATION_MISMATCH");
  config = await (await fetch("/api/agent-network/config?entry=" + entry, { credentials: "omit", redirect: "error" })).json();
  if (!config.enabled) throw Error(config.code || "NETWORK_DISABLED");
  el("execution-note").textContent = config.executionLabel;
  el("scope").textContent = JSON.stringify({ rootDeclaration, defaults, input: config.input, peer: config.peer + "/api/agent-network/agents/workshop", maxCalls: 3, operations: ["model.chat", "action.read"] });
  el("run").disabled = false;
} catch (e) {
  el("out").textContent = "Setup stopped: " + e.message + ". You can still import and review a HomeBundle below.";
}
el("run").addEventListener("click", async () => {
  const generation = ++epoch, baseDraft = el("draft").textContent;
  el("run").disabled = true;
  el("out").textContent = "Running";
  try {
    const approve = async (origin, purpose, selected) => generation === epoch && el("approve").checked && [location.origin, config.peer].includes(origin) && (!selected || JSON.stringify(selected) === JSON.stringify(defaults));
    active = await prepareRuntime({ enabled: true, networkUrl, executionNetworkUrl: config.peer + "/api/agent-network/agents/workshop", input: config.input, maxCalls: 3, approve, authorization: config.authorization, actions: [{ definition: validationDefinition, execute: async (args) => {
      actionExecutions++;
      el("validation-count").value = String(actionExecutions);
      return { valid: parseBundle(args.bundleJson).ok };
    } }] });
    if (generation !== epoch || !el("approve").checked) {
      await active.cancel();
      throw Error("CANCELLED");
    }
    const result = await active.run(config.input, { slyData: {} });
    if (generation !== epoch) throw Error("CANCELLED");
    const parsed = parseBundle(result.text);
    if (!parsed.ok) throw Error("BUNDLE_INVALID");
    const component = { kind: "action", id: "caller-validate", action: networkUrl + "#" + validationDefinition.name, arguments: { bundleJson: result.text } };
    pending = { result, component, generation, baseDraft };
    el("bundle-edit").value = result.text;
    el("bundle-edit").disabled = false;
    el("proposal").textContent = result.text;
    el("validate").disabled = false;
    el("out").textContent = "Review proposal";
  } catch (e) {
    if (generation === epoch) el("out").textContent = "Stopped: " + e.message;
  }
});
el("validate").addEventListener("click", async () => {
  el("validate").disabled = true;
  try {
    if (!pending || pending.generation !== epoch || !el("approve").checked) throw Error("READ_APPROVAL_REQUIRED");
    const reviewedText = el("bundle-edit").value;
    if (!parseBundle(reviewedText).ok) throw Error("BUNDLE_INVALID");
    const component = { kind: "action", id: "caller-validate", action: networkUrl + "#" + validationDefinition.name, arguments: { bundleJson: reviewedText } };
    active.engine.onActionConfirm = async (plan2) => pending.generation === epoch && el("approve").checked && plan2.length === 1 && plan2[0].effect === "read" && plan2[0].origin === location.origin && plan2[0].action === validationDefinition.name && plan2[0].arguments.bundleJson === reviewedText && el("bundle-edit").value === reviewedText;
    const plan = active.engine.actions.prepare(component, {});
    const receipts = await active.engine.actions.execute(plan, active.engine.onActionConfirm, crypto.randomUUID());
    if (!receipts || receipts[0]?.status !== "succeeded" || receipts[0]?.result?.valid !== true) throw Error("VALIDATION_FAILED");
    el("out").textContent = JSON.stringify({ mode: config.executionLabel, rootDeclaration, calls: active.calls, defaults: active.defaults, overrides: { router: active.engine.routerOverride, model: active.engine.modelOverride }, receipt: receipts[0], actionExecutions, selectedNetwork: config.peer + "/api/agent-network/agents/workshop", roleCalls: active.engine.trace.events.filter((event) => event.kind === "agent" && event.phase === "start" && event.agent).map((event) => ({ agent: event.agent, network: event.network, origin: event.origin })) });
    if (el("bundle-edit").value !== reviewedText) throw Error("REVIEW_CHANGED");
    pending.approvedText = reviewedText;
    el("apply").disabled = false;
    el("replay").disabled = false;
  } catch (e) {
    el("out").textContent = "Stopped: " + e.message;
  }
});
el("apply").addEventListener("click", () => {
  if (pending?.generation === epoch && el("approve").checked) {
    if (el("draft").textContent !== pending.baseDraft) {
      el("out").textContent = "Stopped: DRAFT_CHANGED. Review again before replacing it.";
      return;
    }
    if (!pending.approvedText || el("bundle-edit").value !== pending.approvedText) {
      el("out").textContent = "Stopped: REVIEW_CHANGED";
      return;
    }
    el("draft").textContent = pending.approvedText;
    el("apply").disabled = true;
  }
});
el("replay").addEventListener("click", async () => {
  try {
    await active.run(config.input);
    el("out").textContent = "UNSAFE_REPLAY";
  } catch {
    el("out").textContent += "\nReplay refused";
  }
});
async function cancel() {
  epoch++;
  pending = void 0;
  el("validate").disabled = true;
  el("apply").disabled = true;
  el("proposal").textContent = "";
  el("out").textContent = "Stopped: CANCELLED";
  try {
    await active?.cancel();
  } catch {
    el("out").textContent = "Stopped: CANCELLED; revocation unconfirmed";
  }
}
el("cancel").addEventListener("click", cancel);
el("approve").addEventListener("change", () => {
  if (!el("approve").checked && active) void cancel();
});
el("bundle-edit").addEventListener("input", () => {
  if (pending) pending.approvedText = void 0;
  el("apply").disabled = true;
  el("validate").disabled = !pending;
  el("out").textContent = "Edits need validation before Apply.";
});
el("restart").addEventListener("click", async () => {
  await cancel();
  el("approve").checked = false;
  el("run").disabled = false;
  el("bundle-edit").disabled = true;
  el("out").textContent = "Ready for a new run. Review scope and approve again.";
});
