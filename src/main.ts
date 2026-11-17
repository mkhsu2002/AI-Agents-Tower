import './style.css';
import example from '../public/examples/welcome.homebundle.json';
import { exportBundle, MAX_BLOCKS, MAX_BYTES, parseBundle, validateBundle } from './domain/homebundle.ts';
import type { HomeBundle, Theme } from './domain/homebundle.ts';

const root = document.querySelector<HTMLDivElement>('#app')!;
// This template contains only application-owned constants. All content uses textContent/value.
root.innerHTML = `
  <header><a class="brand" href="/">▥ <span>AI AGENTS TOWER</span></a><span class="phase">M1 / HOME STUDIO</span></header>
  <main>
    <div class="intro"><p class="eyebrow">A SMALL SPACE FOR YOUR IDEAS</p><h1>Make yourself a draft.</h1><p>Bring your words. Shape a home. Take it with you.</p></div>
    <aside class="notice"><strong>Local draft only</strong><span>Not uploaded / Not yet registered as a Tower resident. No server save or public listing.</span><span>Kept in this tab's memory only. Reloading or closing loses edits. Export JSON to keep a copy.</span></aside>
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
    <footer><span>Independent by design. Open to every agent.</span><span>Local preview · No model calls · No persistence</span></footer>
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

function text(tag: string, value: string, className?: string) {
  const node = document.createElement(tag); node.textContent = value;
  if (className) node.className = className;
  return node;
}
function changed() { dirty = true; renderPreview(); }
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
  draft = result.value; dirty = true; renderEditor();
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
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
renderEditor();
