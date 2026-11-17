import { Engine } from '../vendor/runtime/engine.js';
import { TraceBus } from '../vendor/runtime/trace.js';
const scenario = new URLSearchParams(location.search).get('scenario') || 'valid';
if (!/^[a-z-]+$/.test(scenario)) throw new Error('Invalid local fixture scenario.');
const trace = new TraceBus();
const consentRequests = [];
const engine = new Engine({ originUrl: `${location.origin}/caller/${scenario}`, trace, byokKey: 'demo' });
engine.onConsent = info => new Promise(resolve => {
  let settled = false;
  consentRequests.push({ kind: info.kind, phase: info.phase || 'call', peerOrigin: info.peerOrigin });
  const panel = document.querySelector('#consent');
  document.querySelector('#request').textContent = JSON.stringify({ origin: info.peerOrigin, purpose: info.kind, endpoint: info.url, phase: info.phase || 'call', request: info.requestText, inference: 'SCRIPTED MOCK ONLY' }, null, 2);
  panel.hidden = false;
  function finish(decision) { if (settled) return; settled = true; info.signal?.removeEventListener('abort', cancelled); panel.hidden = true; resolve(decision); }
  function cancelled() { finish('decline'); }
  info.signal?.addEventListener('abort', cancelled, { once: true });
  if (info.signal?.aborted) cancelled();
  document.querySelector('#allow').onclick = () => finish('allow');
  document.querySelector('#deny').onclick = () => finish('decline');
});
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const cancel = document.querySelector('#cancel-run');
cancel.addEventListener('click', () => engine.cancel());
window.addEventListener('pagehide', () => engine.cancel());
document.querySelector('#run').addEventListener('click', async event => {
  event.currentTarget.disabled = true; cancel.disabled = false; result.textContent = ''; status.textContent = 'Running scripted fixture. No real inference.';
  try {
    const output = await engine.runTurn('Prepare and validate a synthetic draft.', { slyData: { private_canary: 'SYNTHETIC-PRIVATE-CONTEXT' } });
    result.textContent = output.text;
    status.textContent = 'Mock run finished. Inspect tool results and trace for errors; no home was saved.';
  } catch (error) { status.textContent = `Mock run failed: ${error.message}`; }
  finally { cancel.disabled = true; document.querySelector('#trace').textContent = JSON.stringify(trace.export(), null, 2); document.querySelector('#run').disabled = false; }
});
// Test-only visibility. No production integration, persistent storage or credential UI.
window.m2Spike = { engine, trace, consentRequests };
