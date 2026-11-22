// In-memory, scripted-only integration candidate. No fetch, route, environment or credential access.
import { Operation } from '../../spikes/m2/safety.js';
import { validateBundle } from '../../src/domain/homebundle.ts';
import type { HomeBundle } from '../../src/domain/homebundle.ts';
import { executeValidation } from '../../src/agents/validation-action.ts';
import type { ValidationExecution } from '../../src/agents/validation-action.ts';
import { BriefError, fail, OFFLINE_POLICY, OfflineAdmission, parseBrief } from './contract.ts';
import type { BriefInput, BriefCode } from './contract.ts';
import { checkedOfflineTurn, offlineRequest } from './turns.ts';
import type { OfflineRequest } from './turns.ts';
function checkedEditor(value: unknown): HomeBundle {
  try { const checked = validateBundle(value); if (checked.ok) return checked.value; } catch { /* No dynamic input or exception text leaves this boundary. */ }
  return fail('INPUT_INVALID');
}
export interface ScriptedPort {
  readonly mode: 'scripted-offline';
  respond(request: OfflineRequest, signal: AbortSignal): Promise<{ status: number; body: string }>;
}
// Deliberate data accessor for a future text-only preview. Default serialization contains no brief.
export class BriefPreview {
  #input: Readonly<BriefInput>;
  constructor(input: Readonly<BriefInput>) { this.#input = input; Object.freeze(this); }
  get data() { return Object.freeze({ ...this.#input }); }
  get destination() { return OFFLINE_POLICY.endpoint; }
  get model() { return OFFLINE_POLICY.model; }
  get network() { return OFFLINE_POLICY.network; }
  get permissions() { return OFFLINE_POLICY.tools; }
  get dataScope() { return Object.freeze(['Your exact brief', 'The generated draft returned for final review']); }
  get excludedData() { return Object.freeze(['Current editor content', 'Files', 'Credentials', 'Account data']); }
  get limits() { return Object.freeze({ calls: OFFLINE_POLICY.calls, outputTokens: OFFLINE_POLICY.outputTokens, lifetimeMs: OFFLINE_POLICY.lifetimeMs }); }
  toJSON() { return { mode: 'scripted-offline', scope: 'brief-and-generated-draft', destination: OFFLINE_POLICY.endpoint, editorContentIncluded: false }; }
}
type State = 'empty' | 'editing' | 'invalid' | 'approved' | 'running' | 'review' | 'applied' | 'cancelled' | 'failed';
export class OfflineBriefSession {
  #input?: Readonly<BriefInput>; #preview?: BriefPreview;
  #grant?: { revision: number; expires: number }; #revision = 0; #running = false;
  #editor: HomeBundle; #editorRevision = 0;
  #proposal?: { bundle: HomeBundle; inputRevision: number; editorRevision: number };
  #receipt?: { mode: 'scripted-offline'; action: string; status: 'succeeded'; result: { valid: true }; calls: number };
  #operation?: Operation; #state: State = 'empty'; #dispatches = 0;
  #respond: ScriptedPort['respond']; #now: () => number; #budget: OfflineAdmission; #callTimeout: number;
  constructor(options: { port: ScriptedPort; editor: unknown; admission?: OfflineAdmission; now?: () => number; callTimeoutMs?: number }) {
    if (options.port?.mode !== 'scripted-offline' || typeof options.port.respond !== 'function') fail('INPUT_INVALID');
    this.#editor = checkedEditor(options.editor); this.#respond = options.port.respond.bind(options.port);
    this.#now = options.now ?? Date.now; this.#budget = options.admission ?? new OfflineAdmission();
    this.#callTimeout = options.callTimeoutMs ?? OFFLINE_POLICY.callTimeoutMs;
    if (!Number.isInteger(this.#callTimeout) || this.#callTimeout < 100 || this.#callTimeout > OFFLINE_POLICY.callTimeoutMs) fail('INPUT_INVALID');
  }
  #time() { const now = this.#now(); if (!Number.isFinite(now) || now < 0 || now > 8.64e15 - OFFLINE_POLICY.lifetimeMs) return fail('INPUT_INVALID'); return now; }
  #invalidate(state: State) {
    this.#revision++; this.#grant = undefined; this.#preview = undefined; this.#proposal = undefined; this.#receipt = undefined;
    this.#operation?.cancel(); this.#state = state;
  }
  edit(raw: unknown, source: unknown = OFFLINE_POLICY.network) {
    this.#invalidate('invalid'); this.#input = undefined;
    if (source !== OFFLINE_POLICY.network) return fail('DESTINATION_DENIED');
    this.#input = parseBrief(raw); this.#state = 'editing';
  }
  preview(): BriefPreview {
    if (this.#running) return fail('BUSY');
    if (!this.#input) return fail('INPUT_INVALID');
    return this.#preview ??= new BriefPreview(this.#input);
  }
  approve(preview: unknown, decision: unknown) {
    if (this.#running) return fail('BUSY');
    this.#grant = undefined; this.#state = this.#proposal ? 'review' : this.#input ? 'editing' : 'empty';
    if (decision !== true) { this.#invalidate(this.#input ? 'editing' : 'empty'); return fail('CONSENT_REQUIRED'); }
    if (!this.#preview || preview !== this.#preview) return fail('STALE_PREVIEW');
    this.#grant = { revision: this.#revision, expires: this.#time() + OFFLINE_POLICY.lifetimeMs }; this.#state = 'approved';
  }
  revoke() { this.#invalidate(this.#input ? 'editing' : 'empty'); }
  cancel() { this.#invalidate('cancelled'); }
  get status() { return Object.freeze({ mode: 'scripted-offline', state: this.#state, consent: !!this.#grant && this.#grant.expires > this.#time(), calls: this.#dispatches, hasProposal: !!this.#proposal }); }
  toJSON() { return this.status; }
  editor() { return structuredClone(this.#editor); }
  editEditor(value: unknown) {
    this.#editor = checkedEditor(value); this.#editorRevision++;
  }
  proposal() { return this.#proposal ? structuredClone(this.#proposal.bundle) : undefined; }
  receipt() { return this.#receipt ? structuredClone(this.#receipt) : undefined; }
  apply() {
    const proposal = this.#proposal; if (!proposal || this.#running) return fail('NO_PROPOSAL');
    if (proposal.inputRevision !== this.#revision || proposal.editorRevision !== this.#editorRevision) return fail('REVISION_CONFLICT');
    const checked = validateBundle(proposal.bundle); if (!checked.ok) return fail('OUTPUT_REJECTED');
    this.#editor = checked.value; this.#editorRevision++; this.#proposal = undefined; this.#state = 'applied';
  }
  async run(): Promise<void> {
    if (this.#running) return fail('BUSY');
    const grant = this.#grant; const input = this.#input;
    if (!grant || !input || grant.revision !== this.#revision) return fail('CONSENT_REQUIRED');
    this.#grant = undefined; this.#preview = undefined; this.#proposal = undefined; this.#receipt = undefined;
    const remaining = grant.expires - this.#time(); if (remaining < 100) { this.#state = 'failed'; return fail('EXPIRED'); }
    const revision = this.#revision; const editorRevision = this.#editorRevision;
    const op = new Operation(Math.min(OFFLINE_POLICY.runTimeoutMs, remaining)); this.#operation = op;
    this.#running = true; this.#state = 'running'; this.#dispatches = 0; let call: Operation | undefined;
    const check = () => { op.assert(); if (this.#revision !== revision) fail('CANCELLED'); if (this.#time() >= grant.expires) fail('EXPIRED'); };
    try {
      // Detect already-known size failures before reserving calls or contacting even a fixture port.
      offlineRequest(input, 0); offlineRequest(input, 1);
      this.#budget.reserve(this.#time()); let builder: string | undefined; let finalRaw: string | undefined;
      for (let step = 0; step < OFFLINE_POLICY.calls; step++) {
        check(); const request = offlineRequest(input, step, builder);
        const deadline = Math.min(this.#callTimeout, grant.expires - this.#time()); if (deadline < 100) fail('EXPIRED');
        call = new Operation(deadline); this.#dispatches++;
        const response = await op.wait(call.wait(this.#respond(request, AbortSignal.any([op.signal, call.signal])))); check();
        if (response.status !== 200) fail('PROVIDER_FAILED');
        const checked = checkedOfflineTurn(response.body, input, step, builder);
        if (step === 1) builder = checked.content;
        if (step === 2) finalRaw = checked.bundleJson;
        call.dispose(); call = undefined;
      }
      check(); if (typeof finalRaw !== 'string') fail('OUTPUT_REJECTED');
      let execution: ValidationExecution | undefined;
      const validation = await executeValidation({ bundleJson: finalRaw }, op, 'success', value => { execution = value; });
      check(); if (!validation.valid || !execution?.bundle || execution.raw !== finalRaw) return fail('OUTPUT_REJECTED');
      this.#proposal = { bundle: execution.bundle, inputRevision: revision, editorRevision };
      this.#receipt = { mode: 'scripted-offline', action: OFFLINE_POLICY.action, status: 'succeeded', result: { valid: true }, calls: this.#dispatches };
      this.#state = 'review';
    } catch (error) {
      const code: BriefCode = op.signal.aborted || call?.signal.aborted ? this.#revision !== revision ? 'CANCELLED' : 'TIMEOUT' : error instanceof BriefError ? error.code : 'PROVIDER_FAILED';
      if (this.#revision === revision) { this.#proposal = undefined; this.#receipt = undefined; this.#state = 'failed'; }
      throw new BriefError(code);
    } finally { call?.dispose(); op.dispose(); if (this.#operation === op) this.#operation = undefined; this.#running = false; }
  }
}
