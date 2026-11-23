import { validationDefinition } from '../../src/agents/validation-action.ts';
import { parseBundle } from '../../src/domain/homebundle.ts';
const el = id => document.getElementById(id);
let active, pending, epoch = 0, actionExecutions = 0;
const entry = location.pathname.endsWith('/entry-b') ? 'entry-b' : 'entry-a';
let config, defaults, networkUrl, rootDeclaration, prepareRuntime;
try {
  const rootUrl = location.origin + '/api/agent-network/agents/agent-manifest.json';
  const root = await (await fetch(rootUrl, { credentials: 'omit', redirect: 'error' })).json();
  const declared = document.querySelector('link[rel="agent-network"]');
  networkUrl = new URL(declared.href).href;
  if (new URL(networkUrl).origin !== location.origin) throw Error('CALLER_SOURCE_REQUIRED');
  const name = new URL(networkUrl).pathname.split('/').at(-1);
  const matches = root.networks.filter(n => n.name === name); if (matches.length !== 1 || declared.dataset.networkName !== name) throw Error('EXACT_NETWORK_REQUIRED');
  if (root.llm_router?.mock !== false || root.llm_router?.base_url === 'browser://mock') throw Error('PUBLISHED_DEFAULT_IS_SIMULATION');
  const runtimeUrl = location.origin + '/connect/runtime/index.js';
  const runtime = await import(/* @vite-ignore */ runtimeUrl); prepareRuntime = runtime.prepareRuntime;
  defaults = await runtime.readPublishedDefaults(networkUrl);
  rootDeclaration = { rootUrl, name, frontAgent: matches[0].front_man, definition: new URL(matches[0].hocon, rootUrl).href, router: root.llm_router.base_url, runtimeUrl, networkUrl };
  const manifestUrl = new URL('./', networkUrl).href + 'agent-manifest.json';
  const published = await (await fetch(manifestUrl, { credentials: 'omit', redirect: 'error' })).json();
  const exact = published.networks.filter(n => n.name === name);
  if (rootDeclaration.definition !== defaults.source || rootDeclaration.router !== defaults.endpoint || exact.length !== 1 || exact[0].front_man !== rootDeclaration.frontAgent) throw Error('ROOT_DECLARATION_MISMATCH');
  config = await (await fetch('/api/agent-network/config?entry=' + entry, { credentials: 'omit', redirect: 'error' })).json();
  if(!config.enabled)throw Error(config.code||'NETWORK_DISABLED');
  el('execution-note').textContent = config.executionLabel;
  el('scope').textContent = JSON.stringify({ rootDeclaration, defaults, input: config.input, peer: config.peer + '/api/agent-network/agents/workshop', maxCalls: 3, operations: ['model.chat','action.read'] }); el('run').disabled = false;
} catch (e) { el('out').textContent = 'Setup stopped: ' + e.message + '. You can still import and review a HomeBundle below.'; }
el('run').addEventListener('click', async () => {
  const generation = ++epoch, baseDraft=el('draft').textContent; el('run').disabled = true; el('out').textContent = 'Running';
  try {
    const approve = async (origin, purpose, selected) => generation === epoch && el('approve').checked && [location.origin,config.peer].includes(origin) && (!selected || JSON.stringify(selected) === JSON.stringify(defaults));
    active = await prepareRuntime({ enabled: true, networkUrl, executionNetworkUrl: config.peer + '/api/agent-network/agents/workshop', input: config.input, maxCalls: 3, approve, authorization: config.authorization, actions: [{ definition: validationDefinition, execute: async args => { actionExecutions++; el('validation-count').value=String(actionExecutions); return { valid: parseBundle(args.bundleJson).ok }; } }] });
    if (generation !== epoch || !el('approve').checked) { await active.cancel(); throw Error('CANCELLED'); }
    const result = await active.run(config.input, { slyData: {} });
    if (generation !== epoch) throw Error('CANCELLED');
    const parsed=parseBundle(result.text);if(!parsed.ok)throw Error('BUNDLE_INVALID');
    // Trusted caller UI proposes its own registered read; peer output conveys no action authority.
    const component={kind:'action',id:'caller-validate',action:networkUrl+'#'+validationDefinition.name,arguments:{bundleJson:result.text}};
    pending = { result, component, generation, baseDraft }; el('bundle-edit').value=result.text;el('bundle-edit').disabled=false; el('proposal').textContent = result.text; el('validate').disabled = false; el('out').textContent = 'Review proposal';
  } catch (e) { if (generation === epoch) el('out').textContent = 'Stopped: ' + e.message; }
});
el('validate').addEventListener('click', async () => {
  el('validate').disabled = true;
  try {
    if (!pending || pending.generation !== epoch || !el('approve').checked) throw Error('READ_APPROVAL_REQUIRED');
    const reviewedText=el('bundle-edit').value;if(!parseBundle(reviewedText).ok)throw Error('BUNDLE_INVALID');
    const component={kind:'action',id:'caller-validate',action:networkUrl+'#'+validationDefinition.name,arguments:{bundleJson:reviewedText}};
    active.engine.onActionConfirm = async plan => pending.generation === epoch && el('approve').checked && plan.length === 1 && plan[0].effect === 'read' && plan[0].origin === location.origin && plan[0].action === validationDefinition.name && plan[0].arguments.bundleJson === reviewedText && el('bundle-edit').value===reviewedText;
    const plan=active.engine.actions.prepare(component,{});
    const receipts = await active.engine.actions.execute(plan,active.engine.onActionConfirm,crypto.randomUUID());
    if (!receipts || receipts[0]?.status !== 'succeeded' || receipts[0]?.result?.valid !== true) throw Error('VALIDATION_FAILED');
    el('out').textContent = JSON.stringify({ mode: config.executionLabel, rootDeclaration, calls: active.calls, defaults: active.defaults, overrides: { router: active.engine.routerOverride, model: active.engine.modelOverride }, receipt: receipts[0], actionExecutions, selectedNetwork: config.peer + '/api/agent-network/agents/workshop', roleCalls: active.engine.trace.events.filter(event => event.kind === 'agent' && event.phase === 'start' && event.agent).map(event => ({ agent: event.agent, network: event.network, origin: event.origin })) });
    if(el('bundle-edit').value!==reviewedText)throw Error('REVIEW_CHANGED');pending.approvedText=reviewedText;
    el('apply').disabled = false; el('replay').disabled = false;
  } catch(e) { el('out').textContent = 'Stopped: ' + e.message; }
});
el('apply').addEventListener('click', () => { if (pending?.generation === epoch && el('approve').checked) { if(el('draft').textContent!==pending.baseDraft){el('out').textContent='Stopped: DRAFT_CHANGED. Review again before replacing it.';return;}if(!pending.approvedText||el('bundle-edit').value!==pending.approvedText){el('out').textContent='Stopped: REVIEW_CHANGED';return;}el('draft').textContent = pending.approvedText; el('apply').disabled = true; } });
el('replay').addEventListener('click', async () => { try { await active.run(config.input); el('out').textContent = 'UNSAFE_REPLAY'; } catch { el('out').textContent += '\nReplay refused'; } });
async function cancel() { epoch++; pending = undefined; el('validate').disabled = true; el('apply').disabled = true; el('proposal').textContent = ''; el('out').textContent = 'Stopped: CANCELLED'; try { await active?.cancel(); } catch { el('out').textContent = 'Stopped: CANCELLED; revocation unconfirmed'; } }
el('cancel').addEventListener('click', cancel); el('approve').addEventListener('change', () => { if (!el('approve').checked && active) void cancel(); });

el('bundle-edit').addEventListener('input',()=>{if(pending)pending.approvedText=undefined;el('apply').disabled=true;el('validate').disabled=!pending;el('out').textContent='Edits need validation before Apply.';});
el('restart').addEventListener('click',async()=>{await cancel();el('approve').checked=false;el('run').disabled=false;el('bundle-edit').disabled=true;el('out').textContent='Ready for a new run. Review scope and approve again.';});
