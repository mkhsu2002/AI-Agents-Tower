// All enabled-service responses below are SCRIPTED FIXTURES, not model inference.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createModelAdapter } from '../src/agents/model.ts';
import type { ModelRequest } from '../src/agents/model.ts';
import { Operation } from '../spikes/m2/safety.js';
import { REVIEWER_BRIEF } from '../src/agents/reviewer-demo.ts';
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
  await page.route('**/reviewer/status.json', route => route.fulfill({ json: { enabled: true, model: 'SCRIPTED-FIXTURE-NOT-INFERENCE' } }));
  await page.route('**/api/reviewer/v1/chat/completions', async route => {
    calls.push({ headers: route.request().headers(), body: route.request().postData() || '' });
    if (typeof failure === 'number') return route.fulfill({ status: failure, body: 'Private upstream detail must not appear' });
    if (failure === 'refused') return route.fulfill({ json: { choices: [{ finish_reason: 'stop', message: { role: 'assistant', refusal: 'Refused', content: null } }] } });
    const operation = new Operation(5000);
    try {
      const adapter = createModelAdapter({ mode: 'mock', scenario: failure === 'invalid' ? 'invalid-bundle' : 'success', timeoutMs: 5000, delayMs: 0 }, new URL('/agents/tower-home-builder#validate_home_bundle', page.url()).href);
      const request = route.request().postDataJSON() as ModelRequest;
      const result = await adapter.chat({ ...request, operation });
      await route.fulfill({ json: { model: 'SCRIPTED-FIXTURE-NOT-INFERENCE', choices: [{ finish_reason: result.finishReason, message: { role: 'assistant', content: result.content, tool_calls: result.toolCalls } }] } });
    } finally { operation.dispose(); }
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
test('scripted keyless three-call collaboration produces a real local validation receipt and review/apply/export', async ({ page }) => {
  await selectDemo(page); const calls = await scriptedService(page);
  await page.getByLabel('Display name').fill('Private editor sentinel');
  await start(page);
  await expect(page.locator('#agent-proposal')).toBeVisible();
  expect(calls).toHaveLength(3);
  for (const call of calls) { expect(call.headers.authorization).toBeUndefined(); expect(call.headers.cookie).toBeUndefined(); expect(call.body).not.toContain('Private editor sentinel'); }
  await expect(page.getByLabel('Display name')).toHaveValue('Private editor sentinel');
  await expect(page.locator('#agent-receipt')).toContainText('succeeded');
  await expect(page.locator('#agent-receipt')).toContainText('"valid": true');
  await page.locator('#agent-receipt').evaluate(node => { (node.parentElement as HTMLDetailsElement).open = true; });
  await page.locator('.agent-panel').screenshot({ path: 'artifacts/evidence/reviewer-SCRIPTED-FIXTURE.png' });
  await page.getByRole('button', { name: 'Apply draft' }).click();
  await expect(page.locator('#preview')).toContainText(REVIEWER_BRIEF);
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON' }).click();
  expect((await pending).suggestedFilename()).toMatch(/\.json$/);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});
for (const failure of [429, 503, 'refused', 'invalid'] as const) {
  test(`scripted ${failure} stops without simulation fallback; explicit restart succeeds`, async ({ page }) => {
    await selectDemo(page); const calls = await scriptedService(page, failure);
    await start(page);
    await expect(page.locator('#agent-status')).toContainText('Generation stopped');
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
