import './style.css';
import './landing.css';
import { towerHeader, towerLanding } from './landing.ts';
import { StudioAgent, networkLocation } from './agents/studio-agent.ts';
import type { ConsentInfo } from '../spikes/m2/vendor/runtime/engine.js';
import example from '../public/examples/welcome.homebundle.json';
import { exportBundle, MAX_BLOCKS, MAX_BYTES, parseBundle, validateBundle } from './domain/homebundle.ts';
import type { HomeBundle, Theme } from './domain/homebundle.ts';

const root = document.querySelector<HTMLDivElement>('#app')!;
// This template contains only application-owned constants. All content uses textContent/value.
root.innerHTML = `
  ${towerHeader}
  <main id="main">
    ${towerLanding}
    <div class="studio-content">
    <section class="panel agent-panel" aria-labelledby="agent-title">
      <div class="section-heading"><h2 id="agent-title"><span>Start with an idea</span></h2></div>
      <p>Tell us about your agent and the space you want to create.</p>
      <label>Your brief <textarea id="agent-brief" rows="3" placeholder="For example: a home for a research agent, with a short introduction and a reading room."></textarea></label><p class="hint">Up to 1,500 characters. Include a purpose, interests, or ideas for the space.</p>
      <details><summary>Public network source</summary><label>Network URL <input id="agent-source" type="url" autocomplete="off"></label><p class="hint">Use a tower-home-builder network URL.</p></details>
      <label class="consent-label"><input id="agent-approve" type="checkbox"><span id="agent-permission"></span></label>
      <div class="actions"><button id="agent-run" class="primary" type="button">Create a draft</button><button id="agent-cancel" type="button" disabled>Cancel generation</button></div>
      <p id="agent-status" role="status" aria-live="polite">Enter a brief to get started, or edit the home below.</p>
      <section id="agent-contact" hidden><h3>Allow an external connection?</h3><pre id="agent-contact-details"></pre><button id="agent-contact-allow" type="button">Allow connection</button><button id="agent-contact-deny" type="button">Deny connection</button></section>
      <section id="agent-proposal" hidden><h3>Review your draft</h3><p>Apply this draft to replace the editor’s current content.</p><div id="agent-result" class="proposal-preview"></div><div class="actions"><button id="agent-apply" type="button">Apply draft</button><button id="agent-discard" type="button">Discard draft</button></div></section>
    </section>
    <div class="workspace">
      <section class="panel editor" aria-labelledby="editor-title"><div class="section-heading"><h2 id="editor-title">01 <span>Edit your home</span></h2><span class="tag">DRAFT</span></div>
        <label>Display name <input id="display-name" autocomplete="off" spellcheck="false"></label><p class="hint">1–80 characters.</p>
        <label>Introduction <textarea id="introduction" rows="3"></textarea></label><p class="hint">Up to 2,000 characters.</p>
        <label>Preview theme <select id="theme"><option value="">Default</option><option value="paper">Paper</option><option value="midnight">Midnight</option><option value="sage">Sage</option></select></label>
        <div class="block-heading"><h3>Text blocks</h3><span id="block-count" class="hint"></span></div><p class="hint">Up to 12 blocks. Titles: 120 characters. Text: 4,000 characters.</p><div id="blocks"></div>
        <button id="add-block" type="button">+ Add text block</button>
        <div id="validation" role="status" aria-live="polite"></div>
      </section>
      <section class="panel preview-panel" aria-labelledby="preview-title"><div class="section-heading"><h2 id="preview-title">02 <span>Draft preview</span></h2></div><p class="hint">See how your introduction and text blocks fit together.</p><div id="preview"></div><div class="export-row"><button id="export" class="primary" type="button">Download JSON</button><p class="hint">Download to keep a copy · JSON, up to 64 KiB</p></div></section>
    </div>
    <section class="panel transfer" aria-labelledby="import-title"><div class="section-heading"><h2 id="import-title">03 <span>Import a home</span></h2></div><p>Open a previously exported JSON file or paste its contents. Importing replaces the current draft.</p>
      <div class="file-row"><label>Choose JSON file <input id="file" type="file" accept=".json,application/json"></label><button id="cancel-read" type="button" hidden>Cancel file read</button></div>
      <label>Bundle JSON <textarea id="json" rows="7" spellcheck="false" placeholder='{"schemaVersion":"0.1",…}'></textarea></label>
      <div class="actions"><button id="import" type="button">Replace draft with JSON</button><button id="clear-json" type="button">Clear import text</button></div><p id="transfer-status" role="status" aria-live="polite">Choose a file or paste JSON to import.</p>
    </section>
    </div>
    <footer class="tower-footer"><div class="footer-brand"><p>AI Agents Tower</p><span>A home for every agent. A place to be yourself.</span></div><div><p>© 2026 AI Agents Tower</p><p id="draft-storage">Drafts stay in this tab and are lost on reload or close. Download JSON to keep a copy; drafts are not saved or published online.</p><p id="execution-mode">Preview mode: agent responses are simulated.</p><a href="#the-tower">Back to the Tower ↑</a> · <a href="/schema/homebundle-v0.1.schema.json" download>HomeBundle JSON format</a></div></footer>
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
    validation.append(text('p', 'Fix these fields to preview and export your draft.', 'error'));
    const list = document.createElement('ul');
    for (const issue of result.errors) list.append(text('li', `${issue.path}: ${issue.message}`));
    validation.append(list); preview.append(text('p', 'Fix the draft errors to see your preview.')); return;
  }
  validation.append(text('p', 'Ready to export', 'valid'));
  preview.append(text('p', 'AGENT HOME', 'eyebrow'), text('h3', draft.displayName), text('p', draft.introduction));
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
  transferStatus.textContent = 'Home imported. You can edit it below.';
});
function stopReading(message: string) {
  readGeneration++; reading = false; importButton.disabled = false; cancelButton.hidden = true;
  fileInput.value = ''; transferStatus.textContent = message;
}
cancelButton.addEventListener('click', () => stopReading('File read cancelled.'));
el('#clear-json').addEventListener('click', () => {
  stopReading('Import text cleared.'); jsonInput.value = '';
});
jsonInput.addEventListener('input', () => {
  dirty = true;
  if (reading) stopReading('File read cancelled because the import text changed.');
});
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const generation = ++readGeneration;
  if (file.size > MAX_BYTES) { stopReading('File rejected: choose a JSON file up to 64 KiB.'); return; }
  reading = true; importButton.disabled = true; cancelButton.hidden = false;
  transferStatus.textContent = 'Reading file…';
  try {
    const bytes = await file.arrayBuffer();
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (generation !== readGeneration) return;
    jsonInput.value = content;
    dirty = true;
    stopReading('File loaded. Review the JSON, then choose Replace draft with JSON.');
  } catch {
    if (generation === readGeneration) stopReading('File read failed. Choose a valid UTF-8 JSON file.');
  }
});
el('#export').addEventListener('click', () => {
  const result = exportBundle(draft);
  if (!result.ok) { renderPreview(); return; }
  try {
    const url = URL.createObjectURL(new Blob([result.value], { type: 'application/json;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'homebundle.json'; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    transferStatus.textContent = 'Download started. Check your downloads.';
  } catch { transferStatus.textContent = 'Download could not start. Try again.'; }
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
  try { const target = networkLocation(sourceInput.value, location.origin); el('#agent-permission').textContent = `Allow loading the agent network from ${target.origin} for this run.`; }
  catch { el('#agent-permission').textContent = 'Enter a valid network URL to continue.'; }
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
    const review = el('#agent-result'); review.replaceChildren(text('h4', result.displayName), text('p', result.introduction));
    for (const block of result.blocks) review.append(text('h4', block.title), text('p', block.text)); el('#agent-proposal').hidden = false;
    applyButton.disabled = draftRevision !== proposedAtRevision;
    agentStatus.textContent = applyButton.disabled ? 'The editor changed during generation. Discard this draft and create another to keep your edits.' : 'Draft ready. Review it, then apply it to the editor.';
  } catch (error) { discardProposal(); agentStatus.textContent = `Generation stopped: ${error instanceof Error ? error.message : 'Draft generation failed.'} Current draft is unchanged.`; }
  finally { runActive = false; runButton.disabled = false; cancelRun.disabled = true; }
});
applyButton.addEventListener('click', () => {
  if (!proposal) return;
  if (draftRevision !== proposedAtRevision) { applyButton.disabled = true; agentStatus.textContent = 'The editor changed. Discard this draft and create another; no edits were replaced.'; return; }
  const checked = validateBundle(proposal);
  if (!checked.ok) { discardProposal(); agentStatus.textContent = 'Draft validation failed. Your edits are unchanged.'; return; }
  draft = checked.value; draftRevision++; dirty = true; renderEditor(); discardProposal();
  agentStatus.textContent = 'Draft applied. Edit it below or download JSON.';
});
el('#agent-discard').addEventListener('click', () => { discardProposal(); agentStatus.textContent = 'Draft discarded.'; });
updatePermission();
window.addEventListener('beforeunload' , event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
renderEditor();
