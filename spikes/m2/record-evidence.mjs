// Record only an explicitly supplied successful local Playwright JSON report.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const input = process.argv[2];
if (!input) throw new Error('Usage: node spikes/m2/record-evidence.mjs <playwright-json-report>');
const report = JSON.parse(fs.readFileSync(input, 'utf8'));
if (report.stats.unexpected || report.stats.flaky || report.stats.skipped || report.stats.expected !== 22) throw new Error('Unexpected M2 hardening result; refusing to record success.');
const specs = report.suites.flatMap(suite => suite.specs);
const results = specs.flatMap(spec => spec.tests.flatMap(test => test.results.map(result => ({ title: spec.title, status: result.status, attachments: result.attachments }))));
const attachments = results.flatMap(result => result.attachments);
const decode = name => JSON.parse(Buffer.from(attachments.find(item => item.name === name).body, 'base64').toString('utf8'));
const trace = decode('mock-only-runtime-trace');
const sourceHashes = {};
for (const path of ['server.mjs', 'site/spike.js', 'site/index.html', 'tests/runtime.spec.ts', 'vendor/runtime/engine.js', 'vendor/runtime/kernel.js', 'vendor/runtime/runner.js', 'vendor/provenance.json']) sourceHashes[path] = createHash('sha256').update(fs.readFileSync(new URL(path, import.meta.url))).digest('hex');
const summary = {
  recordedAt: report.stats.startTime, scope: 'Local consent and network-validation hardening with scripted inference only; no deployment',
  node: process.version, chromium: process.env.CHROMIUM_PATH ? execFileSync(process.env.CHROMIUM_PATH, ['--version'], { encoding: 'utf8' }).trim() : 'Not recorded; set CHROMIUM_PATH to the tested browser', upstreamCommit: '4e4cb36731ae71cbbb905d3fe98f26299ac3b4f2',
  sourceHashes, stats: report.stats, tests: results.map(({ title, status }) => ({ title, status })),
  runtimePatch: JSON.parse(fs.readFileSync(new URL('./vendor/provenance.json', import.meta.url))).towerPatch,
  consentSequence: decode('consent-sequence'),
  webgpu: decode('webgpu-capability-only'),
  traceSummary: trace.filter(event => (event.kind === 'agent' && event.phase === 'start') || (event.kind === 'model_call' && event.phase === 'end') || (event.kind === 'mcp_call' && event.phase === 'end') || (event.kind === 'remote_fetch' && event.phase === 'end')).map(event => Object.fromEntries(['phase', 'kind', 'origin', 'peerOrigin', 'agent', 'network', 'method', 'model', 'mock', 'verifiedReal', 'routerHost', 'respModel', 'routeKind', 'status'].filter(key => event[key] !== undefined).map(key => [key, event[key]]))),
};
fs.mkdirSync(new URL('./evidence/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./evidence/consent-validation-results.json', import.meta.url), JSON.stringify(summary, null, 2) + '\n');
fs.copyFileSync('test-results/m2/runtime-mock-only.png', new URL('./evidence/runtime-consent-validation.png', import.meta.url));
console.log(`Recorded ${results.length} test results and ${summary.traceSummary.length} runtime boundary events.`);
