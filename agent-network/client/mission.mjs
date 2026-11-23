import { validationDefinition } from '../../src/agents/validation-action.ts';
import { exportBundle, parseBundle } from '../../src/domain/homebundle.ts';
import { Operation, strictJson } from '../runtime/source/safety.js';

const callerNetworkPath = '/api/agent-network/agents/caller';
const task = 'homebundle.collaborate.fixed';

async function inspectHomeTask() {
  const operation = new Operation(10000);
  try {
    const response = await operation.fetch(location.origin + '/api/agent-network/config?entry=entry-a');
    if (!response.headers.get('content-type')?.includes('application/json')) throw Error('TASK_CONFIG_UNAVAILABLE');
    const config = strictJson(await operation.read(response.text()));
    if (!response.ok || config.enabled !== true) throw Error(['PEER_NOT_CONFIGURED', 'NETWORK_DISABLED'].includes(config.code) ? config.code : 'TASK_CONFIG_UNAVAILABLE');
    const runtime = await operation.read(import('/connect/runtime/index.js'));
    const networkUrl = location.origin + callerNetworkPath;
    const defaults = await runtime.readPublishedDefaults(networkUrl);
    const peer = new URL(config.peer);
    if (peer.origin !== config.peer || peer.origin === location.origin || !['http:', 'https:'].includes(peer.protocol)) throw Error('PEER_SCOPE_REJECTED');
    const scope = Object.freeze({
      task,
      caller: location.origin,
      peer: peer.origin,
      network: peer.origin + '/api/agent-network/agents/workshop',
      input: config.input,
      model: defaults.model,
      router: defaults.endpoint,
      maximumModelCalls: 3,
      action: 'validate_home_bundle',
      executionMode: config.executionLabel
    });
    return { scope, config, defaults, runtime, networkUrl };
  } finally { operation.dispose(); }
}

export async function previewHomeTask() {
  return (await inspectHomeTask()).scope;
}

export async function runHomeTask({ authorize } = {}) {
  if (typeof authorize !== 'function') throw Error('USER_AUTHORIZATION_REQUIRED');
  const { scope, config, defaults, runtime, networkUrl } = await inspectHomeTask();
  // The host mediates real user consent. Approval stays in this invocation only.
  if (await authorize(scope) !== true) throw Error('CONSENT_DENIED');
  const run = await runtime.prepareRuntime({
    enabled: true,
    networkUrl,
    executionNetworkUrl: scope.network,
    input: scope.input,
    maxCalls: scope.maximumModelCalls,
    authorization: config.authorization,
    approve: async (origin, _purpose, selected) =>
      (origin === scope.caller || origin === scope.peer) &&
      (!selected || (selected.endpoint === defaults.endpoint && selected.model === defaults.model && selected.source === defaults.source)),
    actions: [{ definition: validationDefinition, execute: async ({ bundleJson }) => ({ valid: parseBundle(bundleJson).ok }) }]
  });
  const output = await run.run(scope.input);
  const parsed = parseBundle(output.text);
  if (!parsed.ok) throw Error('BUNDLE_INVALID');
  const exported = exportBundle(parsed.value);
  if (!exported.ok) throw Error('BUNDLE_EXPORT_FAILED');
  const action = networkUrl + '#' + validationDefinition.name;
  const plan = run.engine.actions.prepare({
    kind: 'action',
    id: 'validate-homebundle',
    action,
    arguments: { bundleJson: exported.value }
  }, {});
  const receipts = await run.engine.actions.execute(plan, async steps =>
    steps.length === 1 &&
    steps[0].origin === scope.caller &&
    steps[0].effect === 'read' &&
    steps[0].action === validationDefinition.name &&
    steps[0].arguments.bundleJson === exported.value,
  crypto.randomUUID());
  const receipt = receipts?.[0];
  if (receipt?.status !== 'succeeded' || receipt.result?.valid !== true) throw Error('VALIDATION_FAILED');
  const bytes = new TextEncoder().encode(exported.value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  const roles = run.engine.trace.events.filter(event =>
    event.kind === 'agent' && event.phase === 'start' && event.agent
  ).map(({ agent, network, origin }) => ({ agent, network, origin }));
  const expectedHost = new URL(scope.peer).host;
  if (run.calls !== scope.maximumModelCalls || roles.length !== 2 ||
      roles[0].agent !== 'reception' || roles[1].agent !== 'home_builder' ||
      roles.some(role => role.network !== 'workshop' || role.origin !== expectedHost)) throw Error('ROLE_EXECUTION_UNCONFIRMED');
  return {
    task,
    bundleJson: exported.value,
    receipt: {
      status: 'schema_valid',
      executionMode: scope.executionMode,
      schemaVersion: parsed.value.schemaVersion,
      canonicalUtf8Bytes: bytes.byteLength,
      canonicalSHA256: [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2, '0')).join(''),
      action: receipt.action,
      actionStatus: receipt.status,
      actionRequestId: receipt.requestId,
      network: scope.network,
      model: scope.model,
      modelCalls: run.calls,
      roles
    }
  };
}
