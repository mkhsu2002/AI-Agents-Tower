import { Engine } from '../../spikes/m2/vendor/runtime/engine.js';
import type { ConsentInfo } from '../../spikes/m2/vendor/runtime/engine.js';
import { Operation, checkedUrl, strictJson } from '../../spikes/m2/safety.js';
import { parseBundle } from '../domain/homebundle.ts';
import type { HomeBundle } from '../domain/homebundle.ts';
import { createModelAdapter, validateBrief, validateSettings } from './model.ts';
export type Progress = (message: string) => void;
// Drop user input, prompt bodies, tool arguments/results and exception detail from runtime tracing.
class StatusTrace {
  private spans = new Map<string, { kind: string; agent?: string }>(); private sequence = 0;
  readonly completed = new Set<string>();
  constructor(private progress: Progress) {}
  start(kind: string, fields: Record<string, unknown> = {}) {
    const id = `studio-${this.sequence++}`; const agent = typeof fields.agent === 'string' ? fields.agent : undefined;
    this.spans.set(id, { kind, agent });
    if (kind === 'agent' && agent === 'reception') this.progress('Reception is planning your home…');
    if (kind === 'agent' && agent === 'home_builder') this.progress('Home builder is preparing your draft…');
    return id;
  }
  end(id: string, fields: Record<string, unknown> = {}) { const span = this.spans.get(id); if (span?.kind === 'agent' && span.agent && fields.status !== 'error') this.completed.add(span.agent); this.spans.delete(id); }
  fail(id: string) { this.spans.delete(id); }
  note() {} update() {}
}
export function networkLocation(input: string, callerOrigin: string): { base: string; origin: string; name: string } {
  const url = checkedUrl(input, callerOrigin);
  if (url.search) throw new Error('Network URLs must not contain query parameters.');
  const name = url.pathname.split('/').at(-1);
  if (name !== 'tower-home-builder') throw new Error('Select the exact tower-home-builder network URL.');
  return { name, base: new URL('./', url).href.replace(/\/$/, ''), origin: url.origin };
}
export class StudioAgent {
  private engine?: Engine; private preparation?: Operation; private active = false; private sequence = 0;
  cancel() { this.sequence++; this.engine?.cancel(); this.preparation?.cancel(); }
  async generate(brief: string, source: string, approved: boolean, progress: Progress, consent: (info: ConsentInfo) => Promise<string>): Promise<HomeBundle> {
    if (this.active) throw new Error('Generation is already in progress. Cancel it to start again.');
    validateBrief(brief);
    const target = networkLocation(source, location.origin);
    if (!approved) throw new Error('Permission declined. No agent network was contacted.');
    const sequence = ++this.sequence; this.active = true;
    this.preparation = new Operation(10000);
    let permissionDeclined = false;
    try {
      progress('Loading the agent network…');
      const response = await this.preparation.fetch(new URL('/development/mock-settings.json', location.origin).href);
      if (!response.ok) throw new Error('Generation settings could not be loaded. Try again.');
      const settings = validateSettings(strictJson(await this.preparation.read(response.text())));
      this.preparation.dispose(); this.preparation = undefined;
      if (sequence !== this.sequence) throw new Error('Generation cancelled.');
      const trace = new StatusTrace(progress);
      this.engine = new Engine({ originUrl: target.base, networkName: target.name, routerOverride: 'browser://mock', modelAdapter: createModelAdapter(settings), trace, timeoutMs: settings.timeoutMs });
      this.engine.onConsent = async info => {
        const decision = await consent(info);
        // Upstream may skip an optional denied contact. Studio stops the whole run
        // so a denied capability cannot be presented as a successful proposal.
        if (decision !== 'allow' && !info.signal?.aborted) { permissionDeclined = true; this.engine?.cancel(); }
        return decision;
      };
      const output = await this.engine.runTurn(brief);
      if (sequence !== this.sequence) throw new Error('Generation cancelled.');
      if (!trace.completed.has('reception') || !trace.completed.has('home_builder')) throw new Error('The agent team could not complete your draft. Try again.');
      progress('Checking your draft…');
      const parsed = parseBundle(output.text);
      if (!parsed.ok) throw new Error('Generated bundle failed validation. ' + parsed.errors.map(issue => `${issue.code} ${issue.path}: ${issue.message}`).join(' '));
      return parsed.value;
    } catch (error) {
      if (permissionDeclined) throw new Error('Permission declined. Generation stopped.');
      throw error;
    } finally { this.preparation?.dispose(); this.preparation = undefined; this.engine = undefined; this.active = false; }
  }
}
