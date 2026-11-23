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

// agent-network/client/transfer.mjs
var element = (id) => document.getElementById(id);
var section = document.createElement("section");
section.className = "panel file-panel";
section.id = "files";
section.innerHTML = '<p class="eyebrow">03 \xB7 TAKE IT WITH YOU</p><h2>Keep your home. Bring it back.</h2><p class="muted">Download the current draft, or review a file before replacing it.</p><button id="save-home" disabled>Download HomeBundle</button><label>HomeBundle file <input id="home-file" type="file" accept=".json,application/json"></label><button id="apply-file" disabled>Replace draft with reviewed file</button><button id="discard-file">Discard selected file</button><p id="file-status" role="status">Select a file to review. Your current draft is unchanged.</p><pre id="file-review"></pre>';
element("file-slot").append(section);
var pending;
var revision = 0;
var show = (id, text) => {
  element(id).textContent = text;
};
function refreshExport() {
  const parsed = parseBundle(element("draft").textContent);
  element("save-home").disabled = !parsed.ok;
  if (!parsed.ok) return;
  const preview = element("home-preview");
  preview.replaceChildren();
  const add = (tag, value) => {
    const node = document.createElement(tag);
    node.textContent = value;
    preview.append(node);
  };
  add("h2", parsed.value.displayName);
  add("p", parsed.value.introduction);
  for (const block of parsed.value.blocks) {
    add("h3", block.title);
    add("p", block.text);
  }
}
function showScope() {
  try {
    const scope = JSON.parse(element("scope").textContent);
    element("caller-origin").textContent = new URL(scope.rootDeclaration.rootUrl).origin;
    element("peer-origin").textContent = new URL(scope.peer).origin;
    element("peer-network").textContent = new URL(scope.peer).pathname.split("/").at(-1);
    element("selected-model").textContent = scope.defaults.model;
  } catch {
  }
}
function showOutcome() {
  const value = element("out").textContent;
  show("human-status", value.startsWith("{") ? "Validation receipt received. Review the proposal before you apply it." : value);
  element("receipt-card").hidden = true;
  try {
    const result = JSON.parse(value);
    if (result.receipt?.status === "succeeded" && result.receipt.result?.valid === true) {
      element("receipt-card").hidden = false;
      show("executed-agents", (result.roleCalls || []).map((role) => role.agent).join(" / ") + " \xB7 " + result.calls + " model calls");
      show("receipt-id", result.receipt.requestId || "See the program receipt in execution details.");
    }
  } catch {
  }
}
new MutationObserver(showScope).observe(element("scope"), { childList: true, subtree: true, characterData: true });
new MutationObserver(showOutcome).observe(element("out"), { childList: true, subtree: true, characterData: true });
showScope();
showOutcome();
new MutationObserver(refreshExport).observe(element("draft"), { childList: true, subtree: true, characterData: true });
element("save-home").addEventListener("click", () => {
  const parsed = parseBundle(element("draft").textContent);
  if (!parsed.ok) {
    show("file-status", "Export stopped: current draft is invalid.");
    return;
  }
  const exported = exportBundle(parsed.value);
  if (!exported.ok) {
    show("file-status", "Export stopped: canonical output rejected.");
    return;
  }
  const url = URL.createObjectURL(new Blob([exported.value], { type: "application/json" })), link = document.createElement("a");
  link.href = url;
  link.download = "atlas.homebundle.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  show("file-status", "HomeBundle downloaded. Nothing was saved online.");
});
function discard() {
  revision++;
  pending = void 0;
  element("apply-file").disabled = true;
  element("home-file").value = "";
  show("file-review", "");
  show("file-status", "File discarded. Current draft is unchanged.");
}
element("discard-file").addEventListener("click", discard);
element("home-file").addEventListener("change", async () => {
  const generation = ++revision;
  pending = void 0;
  element("apply-file").disabled = true;
  show("file-review", "");
  const file = element("home-file").files?.[0];
  if (!file) {
    show("file-status", "No file selected. Current draft is unchanged.");
    return;
  }
  if (file.size > MAX_BYTES) {
    show("file-status", "Import stopped: file exceeds 65,536 bytes. Current draft is unchanged.");
    return;
  }
  try {
    const text = await file.text();
    if (generation !== revision) return;
    const parsed = parseBundle(text);
    if (!parsed.ok) {
      show("file-status", "Import stopped: " + parsed.errors.map((error) => error.code + ": " + error.message).join(" ") + ". Current draft is unchanged.");
      return;
    }
    const exported = exportBundle(parsed.value);
    if (!exported.ok) throw Error("CANONICAL_OUTPUT_REJECTED");
    pending = { text: exported.value, generation };
    show("file-review", exported.value);
    show("file-status", "Schema validated. Review the file, then explicitly replace the draft.");
    element("apply-file").disabled = false;
  } catch {
    if (generation === revision) show("file-status", "Import stopped: file could not be read. Current draft is unchanged.");
  }
});
element("apply-file").addEventListener("click", () => {
  if (!pending || pending.generation !== revision) return;
  const parsed = parseBundle(pending.text);
  if (!parsed.ok) {
    discard();
    return;
  }
  show("draft", pending.text);
  discard();
  refreshExport();
  show("file-status", "Reviewed file applied to this local draft.");
});
refreshExport();
