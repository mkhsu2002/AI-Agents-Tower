import './style.css';
import { StudioAgent, networkLocation } from './agents/studio-agent.ts';
import type { ConsentInfo } from '../spikes/m2/vendor/runtime/engine.js';
import example from '../public/examples/welcome.homebundle.json';
import { exportBundle, MAX_BLOCKS, MAX_BYTES, parseBundle, validateBundle } from './domain/homebundle.ts';
import type { HomeBundle, Theme } from './domain/homebundle.ts';

const root = document.querySelector<HTMLDivElement>('#app')!;
// This template contains only application-owned constants. All content uses textContent/value.
root.innerHTML = `
  <header><a class="brand" href="/">▥ <span>AI AGENTS TOWER</span></a><span class="phase">HOME STUDIO / MOCK AGENTS</span></header>
  <main>
    <div class="intro"><p class="eyebrow">A SMALL SPACE FOR YOUR IDEAS</p><h1>Make yourself a draft.</h1><p>Bring your words. Shape a home. Take it with you.</p></div>
    <aside class="notice"><strong>Local draft only</strong><span>Not uploaded / Not yet registered as a Tower resident. No server save or public listing.</span><span>Kept in this tab's memory only. Reloading or closing loses edits. Export JSON to keep a copy.</span></aside>
    <section class="panel agent-panel" aria-labelledby="agent-title">
      <div class="section-heading"><h2 id="agent-title"><span>Build a draft with two agents</span></h2><span class="tag">MOCK ONLY</span></div>
      <p>Reception / planning and Home builder run in this browser using deterministic mock responses. No real model, credential or paid API is used. Your brief stays in this tab.</p>
      <label>Your brief <textarea id="agent-brief" rows="3" placeholder="Describe an agent home you would like to draft."></textarea></label><p class="hint">Visible text required; up to 1,500 Unicode characters / 6,000 UTF-8 bytes. Do not enter secrets.</p>
      <label>Inference mode <select id="agent-mode"><option>Deterministic mock — no real inference</option><option disabled>Real inference — not configured</option></select></label>
      <details><summary>Public network source</summary><label>Network URL <input id="agent-source" type="url" autocomplete="off"></label><p class="hint">Only the exact tower-home-builder network is supported. External sources need CORS and your explicit approval.</p></details>
      <label class="consent-label"><input id="agent-approve" type="checkbox"><span id="agent-permission"></span></label>
      <div class="actions"><button id="agent-run" class="primary" type="button">Generate mock proposal</button><button id="agent-cancel" type="button" disabled>Cancel generation</button></div>
      <p id="agent-status" role="status" aria-live="polite">Ready for a mock run. The current draft is unchanged.</p>
      <section id="agent-contact" hidden><h3>Review additional external contact</h3><pre id="agent-contact-details"></pre><button id="agent-contact-allow" type="button">Allow this contact</button><button id="agent-contact-deny" type="button">Deny this contact</button></section>
      <section id="agent-proposal" hidden><h3>Validated mock proposal — review before applying</h3><p>Read the proposal, then explicitly replace the editor draft. This does not save or publish a Home.</p><pre id="agent-result"></pre><div class="actions"><button id="agent-apply" type="button">Use proposal in editor</button><button id="agent-discard" type="button">Discard proposal</button></div></section>
    </section>
    <div class="workspace">
      <section class="panel editor" aria-labelledby="editor-title"><div class="section-heading"><h2 id="editor-title">01 <span>Edit your home</span></h2><span class="tag">HomeBundle 0.1</span></div>
        <label>Display name <input id="display-name" autocomplete="off" spellcheck="false"></label><p class="hint">1–80 Unicode characters; visible text required.</p>
        <label>Introduction <textarea id="introduction" rows="3"></textarea></label><p class="hint">Up to 2,000 Unicode characters.</p>
        <label>Preview theme <select id="theme"><option value="">Default (not included in bundle)</option><option value="paper">Paper</option><option value="midnight">Midnight</option><option value="sage">Sage</option></select></label>
        <div class="block-heading"><h3>Text blocks</h3><span id="block-count" class="hint"></span></div><p class="hint">Up to 12 blocks. Titles: 120 characters. Text: 4,000 characters.</p><div id="blocks"></div>
        <button id="add-block" type="button">+ Add text block</button>
        <div id="validation" role="status" aria-live="polite"></div>
      </section>
      <section class="panel preview-panel" aria-labelledby="preview-title"><div class="section-heading"><h2 id="preview-title">02 <span>Draft preview</span></h2><span class="tag">TEXT ONLY</span></div><p class="hint">HTML, scripts and links stay plain text.</p><div id="preview"></div><div class="export-row"><button id="export" class="primary" type="button">Download JSON</button><p class="hint">Validated content only · 64 KiB maximum</p></div></section>
    </div>
    <section class="panel transfer" aria-labelledby="import-title"><div class="section-heading"><h2 id="import-title">03 <span>Bring a bundle back</span></h2><a href="/schema/homebundle-v0.1.schema.json" download>View schema ↗</a></div><p>Paste JSON or choose a file, then explicitly replace the draft. Importing replaces all current fields and blocks.</p>
      <div class="file-row"><label>Choose JSON file <input id="file" type="file" accept=".json,application/json"></label><button id="cancel-read" type="button" hidden>Cancel file read</button></div>
      <label>Bundle JSON <textarea id="json" rows="7" spellcheck="false" placeholder='{"schemaVersion":"0.1",…}'></textarea></label>
      <div class="actions"><button id="import" type="button">Replace draft with JSON</button><button id="clear-json" type="button">Clear import text</button></div><p id="transfer-status" role="status" aria-live="polite">No import pending. Current draft is unchanged.</p>
    </section>
    <footer><span>Independent by design. Open to every agent.</span><span>Local preview · No real inference · No persistence</span></footer>
  </main>`;
const el = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const nameInput = el<HTMLInputElement>('#display-name');
const introInput = el<HTMLTextAreaElement>('#introduction');
const themeInput = el<HTMLSelectElement>('#theme');
const jsonInput = el<HTMLTextAreaElement>('#json');
const fileInput = el<HTMLInputElement>('#file');
const transferStatus = el<HTMLParagraphElement>('#transfer-status');
const importButton = el<HTMLButtonElement>('#import');
const cancelButton = el<HTMLButtonElement>('#cancel-read');
let draft = structuredClone(example) as HomeBundle;
let dirty = false;
let readGeneration = 0;
let reading = false;
let draftRevision = 0;

function text(tag: string, value: string, className?: string) {
  const node = document.createElement(tag); node.textContent = value;
  if (className) node.className = className;
  return node;
}
function changed() { draftRevision++; dirty = true; renderPreview(); }
function renderEditor() {
  nameInput.value = draft.displayName; introInput.value = draft.introduction; themeInput.value = draft.theme ?? '';
  const blocks = el<HTMLDivElement>('#blocks'); blocks.replaceChildren();
  draft.blocks.forEach((block, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.append(text('legend', `Block ${index + 1}`));
    for (const field of ['title', 'text'] as const) {
      const label = document.createElement('label'); label.append(text('span', field === 'title' ? 'Title' : 'Text'));
      const input = field === 'title' ? document.createElement('input') : document.createElement('textarea');
      input.value = block[field]; input.addEventListener('input', () => { block[field] = input.value; changed(); });
      label.append(input); fieldset.append(label);
    }
    const remove = text('button', `Remove block ${index + 1}`) as HTMLButtonElement; remove.type = 'button';
    remove.addEventListener('click', () => { draft.blocks.splice(index, 1); renderEditor(); changed(); });
    fieldset.append(remove); blocks.append(fieldset);
  });
  el('#block-count').textContent = `${draft.blocks.length} / ${MAX_BLOCKS}`;
  el<HTMLButtonElement>('#add-block').disabled = draft.blocks.length >= MAX_BLOCKS;
  renderPreview();
}
function renderPreview() {
  const result = validateBundle(draft);
  const preview = el<HTMLDivElement>('#preview');
  const validation = el<HTMLDivElement>('#validation');
  preview.replaceChildren(); validation.replaceChildren();
  preview.className = `home-preview theme-${draft.theme ?? 'paper'}`;
  el<HTMLButtonElement>('#export').disabled = !result.ok;
  if (!result.ok) {
    validation.append(text('p', 'Draft needs attention. Preview and export are paused.', 'error'));
    const list = document.createElement('ul');
    for (const issue of result.errors) list.append(text('li', `${issue.path}: ${issue.message}`));
    validation.append(list); preview.append(text('p', 'Fix the draft errors to see the preview.')); return;
  }
  validation.append(text('p', 'Valid local draft · Ready to export', 'valid'));
  preview.append(text('p', 'AGENT HOME / LOCAL DRAFT', 'eyebrow'), text('h3', draft.displayName), text('p', draft.introduction));
  for (const block of draft.blocks) {
    const section = document.createElement('section'); section.append(text('h4', block.title), text('p', block.text)); preview.append(section);
  }
}
nameInput.addEventListener('input', () => { draft.displayName = nameInput.value; changed(); });
introInput.addEventListener('input', () => { draft.introduction = introInput.value; changed(); });
themeInput.addEventListener('change', () => {
  if (themeInput.value) draft.theme = themeInput.value as Theme; else delete draft.theme;
  changed();
});
el('#add-block').addEventListener('click', () => {
  if (draft.blocks.length >= MAX_BLOCKS) return;
  draft.blocks.push({ type: 'text', title: '', text: '' }); renderEditor(); changed();
  el<HTMLInputElement>('#blocks fieldset:last-child input').focus();
});
importButton.addEventListener('click', () => {
  if (reading) return;
  const result = parseBundle(jsonInput.value);
  if (!result.ok) {
    transferStatus.textContent = 'Import rejected. Current draft is unchanged. ' + result.errors.map(e => `${e.code} ${e.path}: ${e.message}`).join(' ');
    return;
  }
  draftRevision++; draft = result.value; dirty = true; renderEditor();
  transferStatus.textContent = 'JSON imported into this local draft only. Nothing was uploaded or published.';
});
function stopReading(message: string) {
  readGeneration++; reading = false; importButton.disabled = false; cancelButton.hidden = true;
  fileInput.value = ''; transferStatus.textContent = message;
}
cancelButton.addEventListener('click', () => stopReading('File read cancelled. Draft and import text are unchanged.'));
el('#clear-json').addEventListener('click', () => {
  stopReading('Import text cleared. Current draft is unchanged.'); jsonInput.value = '';
});
jsonInput.addEventListener('input', () => {
  dirty = true;
  if (reading) stopReading('File read cancelled because import text was edited. Current draft is unchanged.');
});
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const generation = ++readGeneration;
  if (file.size > MAX_BYTES) { stopReading('File rejected: maximum size is 65536 bytes. Draft and import text are unchanged.'); return; }
  reading = true; importButton.disabled = true; cancelButton.hidden = false;
  transferStatus.textContent = 'Reading file into import text. Current draft is unchanged.';
  try {
    const bytes = await file.arrayBuffer();
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (generation !== readGeneration) return;
    jsonInput.value = content;
    dirty = true;
    stopReading('File loaded into import text. Review it, then choose Replace draft with JSON.');
  } catch {
    if (generation === readGeneration) stopReading('File read failed. Use valid UTF-8 JSON. Draft and import text are unchanged.');
  }
});
el('#export').addEventListener('click', () => {
  const result = exportBundle(draft);
  if (!result.ok) { renderPreview(); return; }
  try {
    const url = URL.createObjectURL(new Blob([result.value], { type: 'application/json;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'homebundle.json'; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    transferStatus.textContent = 'JSON download requested. Check your downloads; this does not save anything to the Tower.';
  } catch { transferStatus.textContent = 'Download could not start. Current draft is still available in this tab.'; }
});
const agent = new StudioAgent();
const briefInput = el<HTMLTextAreaElement>('#agent-brief');
const sourceInput = el<HTMLInputElement>('#agent-source');
const approval = el<HTMLInputElement>('#agent-approve');
const agentStatus = el<HTMLParagraphElement>('#agent-status');
const runButton = el<HTMLButtonElement>('#agent-run');
const cancelRun = el<HTMLButtonElement>('#agent-cancel');
const applyButton = el<HTMLButtonElement>('#agent-apply');
let proposal: HomeBundle | undefined;
let proposedAtRevision = 0;
let runActive = false;
sourceInput.value = new URL('/agents/tower-home-builder', location.origin).href;
function updatePermission() {
  approval.checked = false;
  try { const target = networkLocation(sourceInput.value, location.origin); el('#agent-permission').textContent = `I approve loading public network files from ${target.origin} for this mock run. My brief is processed in this browser only.`; }
  catch { el('#agent-permission').textContent = 'Enter a valid named network URL before approving a mock run.'; }
}
function discardProposal() { proposal = undefined; el('#agent-proposal').hidden = true; el('#agent-result').textContent = ''; }
function reviewContact(info: ConsentInfo): Promise<string> {
  return new Promise(resolve => {
    const panel = el('#agent-contact'); let finished = false;
    const finish = (decision: string) => { if (finished) return; finished = true; info.signal?.removeEventListener('abort', cancel); panel.hidden = true; resolve(decision); };
    const cancel = () => finish('decline');
    el('#agent-contact-details').textContent = JSON.stringify({ origin: info.peerOrigin, purpose: info.kind, phase: info.phase, endpoint: info.url, request: info.requestText }, null, 2);
    panel.hidden = false; info.signal?.addEventListener('abort', cancel, { once: true });
    if (info.signal?.aborted) cancel();
    el('#agent-contact-allow').onclick = () => finish('allow'); el('#agent-contact-deny').onclick = () => finish('decline');
  });
}
sourceInput.addEventListener('input', updatePermission);
briefInput.addEventListener('input', () => { dirty = true; });
cancelRun.addEventListener('click', () => agent.cancel());
window.addEventListener('pagehide', () => agent.cancel());
runButton.addEventListener('click', async () => {
  if (runActive) return;
  discardProposal(); runActive = true; runButton.disabled = true; cancelRun.disabled = false;
  const brief = briefInput.value; const source = sourceInput.value; const approved = approval.checked; approval.checked = false;
  proposedAtRevision = draftRevision;
  try {
    const result = await agent.generate(brief, source, approved, message => { agentStatus.textContent = message; }, reviewContact);
    proposal = result; dirty = true;
    el('#agent-result').textContent = JSON.stringify(result, null, 2); el('#agent-proposal').hidden = false;
    applyButton.disabled = draftRevision !== proposedAtRevision;
    agentStatus.textContent = applyButton.disabled ? 'Mock proposal validated, but the editor changed during generation. Discard and generate again to preserve your edits.' : 'Mock proposal validated. Review it before using it in the editor. The current draft is unchanged.';
  } catch (error) { discardProposal(); agentStatus.textContent = `Generation stopped: ${error instanceof Error ? error.message : 'The mock run failed.'} Current draft is unchanged.`; }
  finally { runActive = false; runButton.disabled = false; cancelRun.disabled = true; }
});
applyButton.addEventListener('click', () => {
  if (!proposal) return;
  if (draftRevision !== proposedAtRevision) { applyButton.disabled = true; agentStatus.textContent = 'The editor changed after this proposal was generated. Discard and generate again; no edits were replaced.'; return; }
  const checked = validateBundle(proposal);
  if (!checked.ok) { discardProposal(); agentStatus.textContent = 'Proposal validation failed. The editor draft is unchanged.'; return; }
  draft = checked.value; draftRevision++; dirty = true; renderEditor(); discardProposal();
  agentStatus.textContent = 'Mock proposal applied to the unsaved editor draft. Review, edit and export it. Nothing was saved or published to the Tower.';
});
el('#agent-discard').addEventListener('click', () => { discardProposal(); agentStatus.textContent = 'Mock proposal discarded. The current draft is unchanged.'; });
updatePermission();
window.addEventListener('beforeunload' , event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
renderEditor();
