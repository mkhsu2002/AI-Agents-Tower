import { Engine } from '../vendor/runtime/engine.js';
import { TraceBus } from '../vendor/runtime/trace.js';
const scenario = new URLSearchParams(location.search).get('scenario') || 'valid';
if (!/^[a-z-]+$/.test(scenario)) throw new Error('Invalid local fixture scenario.');
const trace = new TraceBus();
const consentRequests = [];
const engine = new Engine({ originUrl: `${location.origin}/caller/${scenario}`, trace, byokKey: 'demo' });
engine.onConsent = info => new Promise(resolve => {
  consentRequests.push({ kind: info.kind, phase: info.phase || 'call', peerOrigin: info.peerOrigin });
  const panel = document.querySelector('#consent');
  document.querySelector('#request').textContent = JSON.stringify({ origin: info.peerOrigin, purpose: info.kind, phase: info.phase || 'call', request: info.requestText, inference: 'SCRIPTED MOCK ONLY' }, null, 2);
  panel.hidden = false;
  function finish(decision) { panel.hidden = true; resolve(decision); }
  document.querySelector('#allow').onclick = () => finish('allow');
  document.querySelector('#deny').onclick = () => finish('decline');
});
const status = document.querySelector('#status');
const result = document.querySelector('#result');
document.querySelector('#run').addEventListener('click', async event => {
  event.currentTarget.disabled = true; status.textContent = 'Running scripted fixture. No real inference.';
  try {
    const output = await engine.runTurn('Prepare and validate a synthetic draft.', { slyData: { private_canary: 'SYNTHETIC-PRIVATE-CONTEXT' } });
    result.textContent = output.text;
    status.textContent = 'Mock run finished. Inspect tool results and trace for errors; no home was saved.';
  } catch (error) { status.textContent = `Mock run failed: ${error.message}`; }
  finally { document.querySelector('#trace').textContent = JSON.stringify(trace.export(), null, 2); document.querySelector('#run').disabled = false; }
});
// Test-only visibility. No production integration, persistent storage or credential UI.
window.m2Spike = { engine, trace, consentRequests };
