// All enabled-service responses below are SCRIPTED FIXTURES, not model inference.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createLiveReviewer } from '../server/live-reviewer.ts';
import { reviewApplyExport } from '../checks/live-flow.ts';
import { sqliteRuntime } from './d1-fixture.ts';
import { META_ENDPOINT } from '../server/meta-policy.ts';
import { fixtureProvider } from './reviewer-provider-fixture.ts';
import { REVIEWER_BRIEF, REVIEWER_PROTOCOL } from '../src/agents/reviewer-contract.ts';
async function selectDemo(page: Page) {
  await page.goto('/');
  await page.locator('#reviewer-demo').click();
  await expect(page.locator('#agent-mode')).toHaveValue('reviewer');
  await expect(page.getByLabel('Your brief')).toHaveValue(REVIEWER_BRIEF);
}
async function start(page: Page) {
  await page.locator('#agent-approve').check();
  await page.getByRole('button', { name: 'Create a draft' }).click();
}
async function scriptedService(page: Page, failure?: number | 'invalid' | 'refused') {
  const calls: { headers: Record<string, string>; body: string }[] = [];
  const origin = new URL(page.url()).origin;
  const f = fixtureProvider(origin, failure);
  const storage = sqliteRuntime();
  const gateway = createLiveReviewer({ transport: async (_url, init) => f.provider.send({ endpoint: META_ENDPOINT, redirect: 'error', signal: init?.signal as AbortSignal, body: JSON.parse(String(init?.body)) }) });
  page.on('close', () => storage.close());
  await page.route('**/reviewer/status.json', route => route.fulfill({ json: { enabled: true, protocol: REVIEWER_PROTOCOL } }));
  await page.route('**/api/reviewer/**', async route => {
    const request = route.request();
    if (request.url().endsWith('/v1/chat/completions')) calls.push({ headers: request.headers(), body: request.postData() || '' });
    const response = await gateway(new Request(request.url(), { method: request.method(), headers: request.headers(), body: request.postData() }), { META_API_KEY: 'SYNTHETIC-NOT-REAL', TOWER_RUNTIME: storage.db });
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() }).catch(() => {});
  });
  return calls;
}
test('public entry defaults to no consent; disabled live service sends no model request and never falls back', async ({ page }) => {
  await selectDemo(page);
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await page.getByRole('button', { name: 'Create a draft' }).click();
  await expect(page.locator('#agent-status')).toContainText('Permission declined'); expect(requests).toEqual([]);
  await start(page);
  await expect(page.locator('#agent-status')).toContainText('live demo is not available yet');
  expect(requests.every(url => url.endsWith('/reviewer/status.json'))).toBe(true);
  await expect(page.locator('#agent-proposal')).toBeHidden();
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
});
test('scripted gateway keyless three-call collaboration produces a real local validation receipt and review/apply/export', async ({ page }) => {
  await selectDemo(page); const calls = await scriptedService(page);
  await page.getByLabel('Display name').fill('Private editor sentinel');
  await start(page);
  await expect(page.locator('#agent-proposal')).toBeVisible();
  expect(calls).toHaveLength(3);
  await expect(page.locator('#agent-receipt')).toContainText('inferenceUsage');
  await expect(page.locator('#agent-receipt')).toContainText('450');
  for (const call of calls) { expect(call.headers.authorization).toBeUndefined(); expect(call.headers.cookie).toBeUndefined(); expect(call.body).not.toContain('Private editor sentinel'); expect(Object.keys(JSON.parse(call.body)).sort()).toEqual(['step', 'ticket']); }
  await expect(page.getByLabel('Display name')).toHaveValue('Private editor sentinel');
  await expect(page.locator('#agent-receipt')).toContainText('succeeded');
  await expect(page.locator('#agent-receipt')).toContainText('"valid": true');
  await page.locator('#agent-receipt').evaluate(node => { (node.parentElement as HTMLDetailsElement).open = true; });
  await page.locator('.agent-panel').screenshot({ path: 'artifacts/evidence/reviewer-SCRIPTED-FIXTURE.png' });
  await reviewApplyExport(page);
  await expect(page.locator('#preview')).toContainText(REVIEWER_BRIEF);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});
for (const failure of [400, 401, 429, 503, 'refused', 'invalid'] as const) {
  test(`scripted ${failure} stops without simulation fallback; explicit restart succeeds`, async ({ page }) => {
    await selectDemo(page); const calls = await scriptedService(page, failure);
    await start(page);
    await expect(page.locator('#agent-status')).toContainText('Generation stopped');
    await expect(page.locator('#agent-status')).toContainText(typeof failure === 'number' ? '; Reception]' : '; Home builder]');
    if (failure === 400) await expect(page.locator('#agent-status')).toContainText('PROVIDER_REQUEST_REJECTED');
    if (failure === 401) await expect(page.locator('#agent-status')).toContainText('PROVIDER_AUTHORIZATION');
    await expect(page.locator('#agent-status')).not.toContainText('Private upstream detail');
    await expect(page.locator('#agent-proposal')).toBeHidden();
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.length).toBeLessThanOrEqual(3);
    await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
    await scriptedService(page); await start(page);
    await expect(page.locator('#agent-proposal')).toBeVisible();
  });
}
test('cancel and enforced deadline do not expose late responses; execution mode restores the visitor brief', async ({ page }) => {
  await page.goto('/'); await page.getByLabel('Your brief').fill('My private idea');
  await page.locator('#reviewer-demo').click();
  await scriptedService(page);
  await page.route('**/api/reviewer/v1/chat/completions', route => route.abort('timedout'));
  await start(page); await expect(page.locator('#agent-status')).toContainText('Generation stopped');
  await page.unroute('**/api/reviewer/v1/chat/completions');
  await page.route('**/api/reviewer/v1/chat/completions', () => {});
  await start(page); await expect(page.locator('#agent-status')).toContainText('Reception');
  await expect(page.locator('#agent-mode')).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel generation' }).click();
  await expect(page.locator('#agent-status')).toContainText('cancel');
  await expect(page.locator('#agent-proposal')).toBeHidden();
  await page.clock.install(); await start(page);
  await expect(page.locator('#agent-status')).toContainText('Reception');
  await page.clock.runFor(30001);
  await expect(page.locator('#agent-status')).toContainText('deadline exceeded');
  await expect(page.locator('#agent-proposal')).toBeHidden();
  await page.locator('#agent-mode').selectOption('mock');
  await expect(page.getByLabel('Your brief')).toHaveValue('My private idea');
  await expect(page.locator('#agent-approve')).not.toBeChecked();
});

test('tampered synthetic brief or network cannot contact the service or peers', async ({ page }) => {
  await selectDemo(page); const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.locator('#agent-brief').evaluate((node: HTMLTextAreaElement) => { node.value = 'A private replacement'; });
  await start(page); await expect(page.locator('#agent-status')).toContainText('only accepts the fixed synthetic example');
  await page.locator('#agent-brief').evaluate((node: HTMLTextAreaElement, brief) => { node.value = brief; }, REVIEWER_BRIEF);
  await page.locator('#agent-source').evaluate((node: HTMLInputElement) => { node.value = 'http://127.0.0.1:4182/agents/tower-home-builder'; });
  await start(page); await expect(page.locator('#agent-status')).toContainText('only accepts the fixed synthetic example');
  expect(requests).toEqual([]);
});

test('service error codes are allowlisted; arbitrary server text never reaches the page', async ({ page }) => {
  await selectDemo(page); await scriptedService(page);
  await page.route('**/api/reviewer/start', route => route.fulfill({ status: 429, json: { code: 'DAILY_LIMIT', error: 'PRIVATE-SERVER-SENTINEL' } }));
  await start(page); await expect(page.locator('#agent-status')).toContainText('Today’s demo capacity');
  await expect(page.locator('body')).not.toContainText('PRIVATE-SERVER-SENTINEL');
  await page.route('**/api/reviewer/start', route => route.fulfill({ status: 502, json: { code: 'PRIVATE-SERVER-SENTINEL', error: '<script>PRIVATE-SERVER-SENTINEL</script>' } }));
  await start(page); await expect(page.locator('#agent-status')).toContainText('Demo service failed (502)');
  await expect(page.locator('#agent-status')).toContainText('[GATEWAY_RESPONSE_INVALID; Start]');
  await expect(page.locator('body')).not.toContainText('PRIVATE-SERVER-SENTINEL');
  await expect(page.locator('#agent-proposal')).toBeHidden();
});
