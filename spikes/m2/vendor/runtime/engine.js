// Tower local patch, 2026-11-17: strict JSON profile, bounded operations and cancellation.
// Tower local patch, 2026-11-17: default-deny consent and browser-origin context.
// Derived from nsdeploy; original attribution/license retained. See ../PATCHES.md.
// engine.js — top-level orchestration: load a published network from an origin,
// compile it (HOCON -> filter chain -> validate -> AgentNetwork), and run it. Owns
// the intrinsics (LLM client, sandbox, trace) and implements resolveRemote, the
// fetch-and-run-locally bridge that turns a peer URL into a runnable Session.

import { Operation, strictJson, validateDefinition, checkedUrl, policyError } from "../../safety.js";
import { AgentNetwork, validateNetwork, parseExternalAgent, redactSlyData, ChatMessageType } from "./kernel.js";
import { LlmClient } from "./llm.js";
import { ToolSandbox } from "./sandbox.js";
import { TraceBus } from "./trace.js";
import { fetchManifest, fetchText, resolveUrl, RemoteRegistry } from "./remote.js";
import { runAgent } from "./runner.js";
import { McpClient } from "./mcp.js";
import { fallbackModel, normalizeModelName } from "./model.js";
import { interactionMessage } from "./cruse.js";
import { createTurnEventStream } from "./execution-stream.js";
import { TurnControl } from "./turn-control.js";
import { ActionRegistry, actionBindings, cloneData } from "./actions.js";
import { loadActionModule, registerRemoteActions } from "./action-transport.js";
import { randomUuid } from "./web-crypto.js";

function normOrigin(url) {
  try { return new URL(url).origin; } catch { return String(url || ""); }
}

function sameRouter(left, right) {
  try {
    const normalize = (value) => {
      const url = new URL(value);
      const loopback = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
      const host = loopback ? "loopback" : url.hostname.toLowerCase();
      return `${url.protocol}//${host}:${url.port}${url.pathname.replace(/\/$/, "")}${url.search}`;
    };
    return normalize(left) === normalize(right);
  } catch {
    return String(left || "").replace(/\/$/, "") === String(right || "").replace(/\/$/, "");
  }
}

export async function isPublishedMockRouter() {
  throw new Error("Automatic router discovery is unsupported by the strict local profile.");
}

export function selectTopRouter(manifest, routerOverride, byokKey, modelOverride = "") {
  const declared = manifest?.llm_router || {};
  const hasRealKey = !!(byokKey && byokKey !== "demo");
  const hasExplicitModel = !!String(modelOverride || "").trim();
  let requested = String(routerOverride || "").replace(/\/$/, "");
  const requestedMock = requested && declared.mock === true && sameRouter(requested, declared.base_url);

  if ((hasRealKey || hasExplicitModel) && (!requested || requestedMock)) {
    if (!declared.byok_router) {
      throw new Error("A real API key is configured, but this site publishes no AI provider route.");
    }
    requested = declared.byok_router;
    return { baseUrl: requested, mock: false, upgradedToByok: true };
  }
  if (requested) {
    return { baseUrl: requested, mock: declared.mock === true && sameRouter(requested, declared.base_url), upgradedToByok: false };
  }
  return { baseUrl: declared.base_url || "", mock: declared.mock === true, upgradedToByok: false };
}

export function manifestAllowsPeer(target, manifest, runtimeAllowedPeers = new Set()) {
  const targetOrigin = normOrigin(target);
  const policy = manifest?.peer_policy || manifest?.web_policy;
  if (policy?.mode === "open") {
    let parsed;
    try { parsed = new URL(target); } catch { return false; }
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const denied = (policy.deny_origins || policy.denied_origins || []).map(normOrigin);
    if (denied.includes(targetOrigin)) return false;
    return true;
  }
  const declared = (manifest?.allowed_peers || []).map(normOrigin);
  return declared.includes(targetOrigin) || runtimeAllowedPeers.has(targetOrigin);
}

export function selectPeerRouter(callerRouter) {
  if (!callerRouter?.baseUrl) {
    throw new Error("The caller has no active LLM router to use for this peer network.");
  }
  return { baseUrl: callerRouter.baseUrl, mock: callerRouter.mock === true };
}

export class Engine {
  constructor({ originUrl, trace, sandboxWorkerUrl, byokKey, routerOverride } = {}) {
    this.originUrl = (originUrl || (typeof location !== "undefined" ? location.origin : "")).replace(/\/$/, "");
    this.trace = trace || new TraceBus();
    this.timeoutMs = arguments[0]?.timeoutMs ?? 10000;
    this.operation = null;
    this.networkName = arguments[0]?.networkName;
    this.modelAdapter = arguments[0]?.modelAdapter;
    if (this.modelAdapter) {
      const trustedOrigin = arguments[0]?.trustedAdapterOrigin;
      const liveAllowed = this.modelAdapter.mode === "real" && this.modelAdapter.mock === false &&
        typeof trustedOrigin === "string" && trustedOrigin === globalThis.location?.origin &&
        new URL(this.originUrl).origin === trustedOrigin && this.modelAdapter.baseUrl === trustedOrigin && routerOverride === trustedOrigin;
      if (typeof this.modelAdapter.chat !== "function" || (this.modelAdapter.mock !== true && !liveAllowed)) throw new Error("Custom inference requires an explicitly mock adapter or a trusted same-origin keyless adapter.");
    }
    this.sandboxWorkerUrl = sandboxWorkerUrl || "/runtime/sandbox-worker.js";
    this.byokKey = byokKey || "";
    this.routerOverride = routerOverride || "";
    this.modelOverride = normalizeModelName(arguments[0] && arguments[0].modelOverride);
    this.registry = new RemoteRegistry({ trace: this.trace });
    this.sandbox = new ToolSandbox({ workerUrl: this.sandboxWorkerUrl, trace: this.trace });
    this.top = null; // {network, base, bundleUrl, manifest, llm}
    this.agentRunner = null; // set by enableLangChain(); neuro-san-web owns the loop
    this.history = []; // top-level conversation turns ([{role,content}]) across runs
    this.consentTail = Promise.resolve(); // serialize modal decisions for parallel tools
    this.onConsent = null; // UI hook: async (info) => "allow"|"decline"; no remembered grants
    this.onLinkRequired = null; // UI hook: async ({reference,...}) => peer URL|null
    this.runtimeAllowedPeers = new Set(); // user-entered, validated link origins
    this.streamSequence = 0;
    this.actions = new ActionRegistry();
    this.actionPresentations = new Map();
    this.actionSubmissions = new Map();
    this.onActionConfirm = async () => false;
  }

  // Clear the multi-turn conversation history (start a new chat).
  resetHistory() {
    this.history = [];
    this.actionPresentations.clear();
    this.actionSubmissions.clear();
  }

  // Only explicit approval permits this contact. Hook errors, cancellation,
  // absent UI and unsupported decisions all fail closed. Grants are not cached.
  async requestConsent(info) {
    const operation = this.operation;
    const decide = async () => {
      operation?.assert();
      if (typeof this.onConsent !== "function") return "decline";
      try {
        const decision = this.onConsent({ ...info, signal: operation?.signal });
        return await (operation ? operation.wait(decision) : decision) === "allow" ? "allow" : "decline";
      } catch {
        operation?.assert();
        this.trace.note("consent_error", { decision: "declined", reason: "Consent interface unavailable." });
        return "decline";
      }
    };
    const pending = this.consentTail.then(decide, decide);
    this.consentTail = pending.then(() => undefined, () => undefined);
    return operation ? operation.wait(pending) : pending;
  }

  cancel() { this.operation?.cancel(); }

  async _bounded(work) {
    if (this.operation) throw new Error("A runtime operation is already active.");
    const operation = new Operation(this.timeoutMs);
    this.operation = operation;
    try { return await operation.wait(Promise.resolve().then(work)); }
    catch (error) {
      this.top = null; this.history = []; this.registry.cache.clear(); this._mcpClients?.clear();
      this.trace.note("runtime_stopped", { reason: operation.signal.aborted ? "cancelled_or_timed_out" : "failed" });
      throw error;
    } finally { operation.dispose(); this.operation = null; }
  }

  // Load the prebuilt LangChain.js AgentRunner bundle and use it as the loop.
  async enableLangChain() {
    throw new Error("Alternate runners are unsupported by the bounded local profile.");
  }

  // Compile the origin's own published front network.
  async loadTop() {
    if (!this.operation) return this._bounded(() => this._loadTop());
    return this._loadTop();
  }

  async _loadTop() {
    const span = this.trace.start("compile", { origin: hostOf(this.originUrl), what: "top network" });
    try {
      const { manifest, base } = await fetchManifest(this.originUrl, this.operation);
      const entry = this.networkName ? manifest.networks.find(item => item.name === this.networkName) : manifest.networks[0];
      if (!entry) throw new Error("The requested named network is not published by this manifest.");
      // Set manifest early so resolveRemote/resolveMcp policy checks have it.
      this.top = { manifest, base };
      const { network, bundleUrl, integrity, llm, validation: v } = await this._compile(base, manifest, entry, { isTop: true });
      this.top = { network, base, bundleUrl, integrity, manifest, llm };
      const loadActions = typeof location !== "undefined" && new URL(base).origin !== location.origin
        ? registerRemoteActions : loadActionModule;
      await loadActions(this.actions, { base, network: network.name }, manifest);
      this.trace.note("action_catalog", { count: this.actions.catalog({ base, network: network.name }).length,
        issues: this.actions.discoveryIssues });
      this.mockLLM = llm.mock; // true when using the deterministic mock router
      this.byokRouter = manifest.llm_router?.byok_router || ""; // real-LLM proxy for BYOK keys
      this.trace.end(span, {
        network: network.name,
        frontMan: network.findFrontMan(),
        errors: v.errors,
        warnings: v.warnings,
        peers: v.externals || [],
      });
      return { network, manifest, validation: v };
    } catch (err) {
      this.trace.fail(span, err);
      throw err;
    }
  }

  async _compile(base, manifest, entry, { isTop = false } = {}) {
    const hoconUrl = resolveUrl(base, entry.hocon);
    const text = await fetchText(hoconUrl, this.operation);
    const config = validateDefinition(strictJson(text));
    const network = new AgentNetwork(config, entry.name || entry.hocon);
    // Validation gate: a network with structural errors must never run. (Warnings
    // are non-fatal and surfaced in the trace/UI.) This applies to the top network
    // AND to every fetched-and-run peer network compiled below.
    if (!network.getAgentSpec(entry.front_man) || network.findFrontMan() !== entry.front_man) throw policyError("Manifest front agent does not match the supported network entry point.");
    const validation = validateNetwork(network);
    if (validation.errors && validation.errors.length) {
      throw new Error(`Network '${network.name}' (${hostOf(base)}) failed validation: ${validation.errors.join("; ")}`);
    }
    const bundleUrl = manifest.coded_tools?.bundle ? resolveUrl(base, manifest.coded_tools.bundle) : null;
    const integrity = manifest.coded_tools?.integrity || null; // optional SRI digest
    // LLM routing boundary. The top site chooses the active router. Peer manifests
    // contribute network definitions only and can never redirect execution or keys.
    let routerBase;
    let mock;
    if (isTop) {
      const selected = selectTopRouter(manifest, this.routerOverride, this.byokKey, this.modelOverride);
      routerBase = selected.baseUrl;
      mock = selected.mock;
      this.routerOverride = selected.upgradedToByok ? routerBase : this.routerOverride;
      this.userRouter = { baseUrl: routerBase, mock };
    } else {
      // A peer contributes its network definition, not its execution environment.
      // It always runs in this browser with the top caller's active router, even
      // for keyless/mock sessions. Never send execution or a BYOK key to the peer.
      const selected = selectPeerRouter(this.userRouter);
      routerBase = selected.baseUrl;
      mock = selected.mock;
    }
    const llm = this.modelAdapter || new LlmClient({ baseUrl: routerBase, apiKey: this.byokKey, trace: this.trace, mock });
    return { network, bundleUrl, integrity, llm, hoconUrl, validation };
  }

  // Every hop is constrained by the immediate caller's published manifest. The
  // user still approves each remote call, so a peer cannot silently expand access.
  _assertAllowedPeer(target, sourceManifest) {
    const manifest = sourceManifest || this.top?.manifest;
    if (!manifestAllowsPeer(target, manifest, this.runtimeAllowedPeers)) {
      const source = manifest?.networks?.[0]?.name || "calling network";
      throw new Error(`Policy: ${hostOf(target)} is not in ${source}'s allowed_peers; refusing to contact it.`);
    }
  }

  async _loadPublishedLinks() { throw new Error("Dynamic links are unsupported by the strict local profile."); }
  async _persistLink() { throw new Error("Dynamic links are unsupported by the strict local profile."); }
  async _normalizeLinkTarget() { throw new Error("Dynamic links are unsupported by the strict local profile."); }
  async resolveLink() { throw new Error("Dynamic links are unsupported by the strict local profile."); }

  _makeCtx({ network, base, bundleUrl, integrity, manifest, llm, slyData, chain, composition, isTop, history, turnControl }) {
    const self = this;
    const ctx = {
      network,
      operation: this.operation,
      manifest,
      actions: this.actions,
      baseOrigin: base,
      // A peer's publishing base does not become the visitor's browser origin.
      browserOrigin: typeof location !== "undefined" ? location.origin : new URL(self.originUrl).origin,
      displayOrigin: hostOf(base),
      codedToolBundleUrl: bundleUrl,
      codedToolIntegrity: integrity || null,
      llm,
      sandbox: this.sandbox,
      trace: this.trace,
      slyData,
      composition,
      // Prior conversation turns ([{role,content}]), only for the top front-man.
      history: history || [],
      turnControl: turnControl || null,
      defaultModel: fallbackModel(network.config.llm_config?.model_name),
      isTop: !!isTop,
      frontMan: network.findFrontMan(),
      onAnswerDelta: isTop ? (t) => self.onAnswerDelta?.(t) : undefined,
      resolveRemote: (ref, callChain, parentSpan) => self.resolveRemote(ref, callChain || chain, parentSpan, manifest),
      resolveMcp: (ref, parentSpan) => self.resolveMcp(ref, parentSpan, slyData, manifest),
      resolveLink: (ref, parentSpan) => self.resolveLink(ref, network, base, parentSpan),
      requestConsent: (info) => self.requestConsent(info),
      // LangChain.js AgentRunner intrinsic (neuro-san-web owns the loop)
      // The bundled LangChain runner expects an HTTP OpenAI-compatible endpoint.
      // Static bundles use the dependency-free manual loop for browser://mock.
      externalRunner: llm.baseUrl === "browser://mock" ? null : self.agentRunner,
      routerBaseUrl: llm.baseUrl,
      mock: llm.mock,
      apiKey: self.byokKey,
      modelOverride: self.modelOverride,
    };
    return ctx;
  }

  // fetch-and-run-locally: turn a peer URL into a runnable Session.
  async resolveRemote(ref, chain, parentSpan, sourceManifest) {
    const target = new URL(ref, `${this.top.base}/`);
    const origin = new URL("./", target).href.replace(/\/$/, "");
    this._assertAllowedPeer(origin, sourceManifest); // per-hop publish-time policy gate
    const lastSeg = target.pathname.split("/").filter(Boolean).pop();
    this.registry.checkCycle(chain, origin, lastSeg);

    const cached = this.registry.get(origin, lastSeg);
    if (cached) return cached;

    const fetchSpan = this.trace.start("remote_fetch", {
      parent: parentSpan,
      origin: hostOf(this.top.base),
      peerOrigin: hostOf(origin),
      url: ref,
    });
    let session;
    try {
      const { manifest, base } = await fetchManifest(origin, this.operation);
      // Fail closed: only run the exact published network that was requested —
      // never silently fall back to a different (e.g. networks[0]) network.
      const entry = manifest.networks.find((n) => n.name === lastSeg);
      if (!entry) {
        throw new Error(`No published network named '${lastSeg}' at ${hostOf(origin)}; refusing to run a different network.`);
      }
      const fetchedUrls = {
        manifest: `${base}/agent-manifest.json`,
        hocon: resolveUrl(base, entry.hocon),
        toolBundle: manifest.coded_tools?.bundle ? resolveUrl(base, manifest.coded_tools.bundle) : null,
      };
      const { network, bundleUrl, integrity, llm } = await this._compile(base, manifest, entry);
      await registerRemoteActions(this.actions, { base, network: network.name }, manifest);
      this.trace.end(fetchSpan, { network: network.name, fetchedUrls, peerOrigin: hostOf(origin), brand: manifest.brand });
      session = new Session(this, { network, base, bundleUrl, integrity, manifest, llm, fetchedUrls, brand: manifest.brand });
      this.registry.set(origin, lastSeg, session);
      return session;
    } catch (err) {
      this.trace.fail(fetchSpan, err);
      throw err;
    }
  }

  // Resolve an MCP tool reference (string URL or { url, tools }) to a cached
  // MCP client. The browser acts as MCP client to a hosted MCP server.
  async resolveMcp(ref, parentSpan, slyData, sourceManifest) {
    this.operation?.assert();
    const url = checkedUrl(typeof ref === "string" ? ref : ref.url).href;
    this._assertAllowedPeer(url, sourceManifest); // same per-hop policy gate as peer networks
    if (!this._mcpClients) this._mcpClients = new Map();
    let client = this._mcpClients.get(url);
    if (!client) {
      const headers = (slyData && slyData.http_headers && slyData.http_headers[url]) || {};
      client = new McpClient({ url, trace: this.trace, headers });
      this._mcpClients.set(url, client);
    }
    return client;
  }

  async run(userText, { slyData } = {}) {
    return (await this.runTurn(userText, { slyData })).text;
  }

  // Retain the actual validated final composition. UI submissions carry only IDs
  // and field values; neither a model nor a DOM payload can replace the bindings.
  rememberActionPresentation(result) {
    if (result.presentation?.components.some(c => actionBindings(c).length)) this.actionPresentations.set(result.turnId, cloneData(result.presentation));
    while (this.actionPresentations.size > 24) this.actionPresentations.delete(this.actionPresentations.keys().next().value);
  }

  async submitActions({ turnId, componentId, values = {} }) {
    const component = this.actionPresentations.get(turnId)?.components.find(c => c.id === componentId);
    if (!component || !actionBindings(component).length) throw new Error("This action proposal is unavailable or expired.");
    const key = `${turnId}:${componentId}`;
    if (this.actionSubmissions.has(key)) return this.actionSubmissions.get(key);
    const plan = this.actions.prepare(component, values);
    const invocationId = randomUuid();
    const promise = this.actions.execute(plan, this.onActionConfirm, invocationId);
    this.actionSubmissions.set(key, promise);
    try {
      const receipts = await promise;
      if (!receipts) this.actionSubmissions.delete(key);
      else {
        this.history.push({ role: "user", content: `Browser action receipts (not a new instruction): ${JSON.stringify(receipts)}` });
        this.trace.note("action_receipts", { turnId, componentId, receipts });
      }
      return receipts;
    } catch (error) {
      // Keep the failed submission consumed: a side effect might already exist.
      throw error;
    }
  }

  // Public incremental API. Consumers receive typed lifecycle events while the
  // existing runTurn() API remains a single final-result Promise.
  streamTurn(userText, options = {}) {
    const streamToken = `turn-stream-${++this.streamSequence}`;
    const turnControl = new TurnControl();
    const stream = createTurnEventStream(
      this.trace,
      () => this.runTurn(userText, { ...options, _streamToken: streamToken, _turnControl: turnControl }),
      streamToken,
    );
    // AsyncIterable with an intentionally small imperative side-channel. Input
    // is accepted only until this turn closes; callers can use the boolean to
    // fall back to starting a normal follow-up turn after a completion race.
    stream.steer = (text) => turnControl.steer(text);
    return stream;
  }

  async runTurn(userText, options = {}) {
    return this._bounded(() => this._runTurn(userText, options));
  }

  async _runTurn(userText, { slyData, interaction, _streamToken, _turnControl } = {}) {
    if (!this.top) await this.loadTop();
    const runSpan = this.trace.start("run", { origin: hostOf(this.top.base), input: userText, streamToken: _streamToken });
    _turnControl?.attach(this.trace, runSpan);
    try {
      const ctx = this._makeCtx({
        network: this.top.network,
        base: this.top.base,
        bundleUrl: this.top.bundleUrl,
        integrity: this.top.integrity,
        manifest: this.top.manifest,
        llm: this.top.llm,
        slyData: { ...(slyData || {}) },
        chain: [`${this.top.base}::${this.top.network.name}`],
        isTop: true,
        history: this.history,
        turnControl: _turnControl,
        composition: {
          remoteCalls: 0,
          peerCalls: new Map(),
          maxRemoteCalls: 4,
          maxCallsPerPeer: 1,
          agentCalls: 0,
          maxAgentCalls: 24,
          deadline: Date.now() + 90_000,
        },
      });
      const message = interactionMessage(userText, interaction);
      const result = await runAgent(ctx, this.top.network.findFrontMan(), message, runSpan, ctx_chain(ctx, this.top));
      ctx.operation.assert();
      _turnControl?.close();
      result.turnId = runSpan;
      this.rememberActionPresentation(result);
      // Persist this turn so the next turn has conversation context.
      this.history.push({ role: "user", content: message });
      for (const input of _turnControl?.accepted || []) {
        this.history.push({ role: "user", content: input.text });
      }
      this.history.push({ role: "assistant", content: result.text + (result.presentation ? `\n\nCRUSE presentation turn: ${runSpan}\n\`\`\`cruse-ui\n${JSON.stringify(result.presentation)}\n\`\`\`` : "") });
      if (this.history.length > 24) this.history = this.history.slice(-24); // bound tokens
      this.trace.end(runSpan, { answerPreview: result.text.slice(0, 300) });
      return result;
    } catch (err) {
      _turnControl?.close();
      this.trace.fail(runSpan, err);
      throw err;
    }
  }
}

function ctx_chain(ctx, top) {
  return [`${top.base}::${top.network.name}`];
}

// A peer network made runnable locally, exposed through the uniform Session API.
class Session {
  constructor(engine, { network, base, bundleUrl, integrity, manifest, llm, fetchedUrls, brand }) {
    this.engine = engine;
    this.network = network;
    this.brand = brand;
    this.base = base;
    this.bundleUrl = bundleUrl;
    this.integrity = integrity || null;
    this.manifest = manifest;
    this.llm = llm;
    this.fetchedUrls = fetchedUrls;
  }

  async func() {
    const front = this.network.getAgentSpec(this.network.findFrontMan());
    return front?.function || { description: this.network.name };
  }

  async invoke(request, { parentSpan, chain = [], composition, operation } = {}) {
    operation?.assert();
    const trace = this.engine.trace;
    const span = trace.start("remote_call", {
      parent: parentSpan,
      origin: hostOf(this.engine.top.base),
      peerOrigin: hostOf(this.base),
      method: "fetch-and-run-locally",
      fetchedUrls: this.fetchedUrls,
      requestPayload: { ...request, sly_data: redactSlyData(request.sly_data) },
      network: this.network.name,
      brand: this.brand,
    });
    try {
      const invocationChain = [...chain, `${this.base}::${this.network.name}`];
      const ctx = this.engine._makeCtx({
        network: this.network,
        base: this.base,
        bundleUrl: this.bundleUrl,
        integrity: this.integrity,
        manifest: this.manifest,
        llm: this.llm,
        slyData: { ...(request.sly_data || {}) },
        chain: invocationChain,
        composition,
        isTop: false,
      });
      const result = await runAgent(ctx, this.network.findFrontMan(), request.user_message.text, span, invocationChain);
      trace.end(span, { responsePreview: result.text.slice(0, 300), type: ChatMessageType.AGENT });
      return result;
    } catch (err) {
      trace.fail(span, err);
      operation?.assert();
      if (err.code === "RUNTIME_POLICY") throw err;
      return `Error from ${hostOf(this.base)}: ${err.message}`;
    }
  }
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
