import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('production draft round-trip uses the registered validator and preserves imported edits', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your home', exact: false }).click();
  await page.getByLabel('Your brief').fill('Synthetic production check: a quiet library');
  await page.locator('#agent-approve').check(); await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-proposal')).toBeVisible();
  await page.getByRole('button', { name: 'Apply draft', exact: true }).click();
  await page.getByLabel('Display name').fill('Production check library');
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON' }).click();
  const downloaded = await pending; const data = JSON.parse(await readFile((await downloaded.path())!, 'utf8'));
  expect(data.displayName).toBe('Production check library');
  await page.getByLabel('Bundle JSON').fill(JSON.stringify(data)); await page.getByRole('button', { name: 'Replace draft with JSON' }).click();
  await expect(page.getByLabel('Display name')).toHaveValue('Production check library');
});
test('production denied approval and malformed import do not replace the editor', async ({ page }) => {
  await page.goto('/#home-studio'); await page.getByLabel('Display name').fill('Keep this draft');
  await page.getByLabel('Your brief').fill('Synthetic denial check');
  await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-status')).toContainText('Permission declined');
  await expect(page.locator('#agent-proposal')).toBeHidden();
  await page.getByLabel('Bundle JSON').fill('{'); await page.getByRole('button', { name: 'Replace draft with JSON' }).click();
  await expect(page.locator('#transfer-status')).toContainText('Import rejected');
  await expect(page.getByLabel('Display name')).toHaveValue('Keep this draft');
});
for (const [scenario, message] of [['model-error', 'Draft generation failed'], ['action-error', 'Validation tool failed'], ['invalid-bundle', 'failed validation'], ['slow-validation', 'deadline exceeded']]) {
  test(`production client fault injection: ${scenario} preserves the draft`, async ({ page }) => {
    await page.route('**/development/mock-settings.json', route => route.fulfill({ json: { mode: 'mock', scenario, timeoutMs: scenario === 'slow-validation' ? 500 : 10000, delayMs: 5 } }));
    await page.goto('/#home-studio'); await page.getByLabel('Your brief').fill('Synthetic failure check');
    await page.locator('#agent-approve').check(); await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
    await expect(page.locator('#agent-status')).toContainText(message!);
    await expect(page.locator('#agent-proposal')).toBeHidden(); await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
  });
}
test('production client fault injection: cancellation and explicit restart', async ({ page }) => {
  await page.route('**/development/mock-settings.json', route => route.fulfill({ json: { mode: 'mock', scenario: 'slow-model', timeoutMs: 10000, delayMs: 5 } }));
  await page.goto('/#home-studio'); await page.getByLabel('Your brief').fill('Synthetic cancellation check');
  await page.locator('#agent-approve').check(); await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-status')).toContainText('Reception'); await page.getByRole('button', { name: 'Cancel generation' }).click();
  await expect(page.locator('#agent-status')).toContainText('cancel'); await expect(page.locator('#agent-proposal')).toBeHidden();
  await page.route('**/development/mock-settings.json', route => route.fulfill({ json: { mode: 'mock', scenario: 'success', timeoutMs: 10000, delayMs: 5 } }));
  await page.locator('#agent-approve').check(); await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-proposal')).toBeVisible();
});

test('production reviewer entry fails closed while the live service is disabled', async ({ page }) => {
  await page.goto('/');
  const status = await page.request.get('/reviewer/status.json');
  test.skip((await status.json()).enabled === true, 'Live service is enabled; use the explicitly opted-in single-run acceptance test.');
  await page.locator('#reviewer-demo').click();
  const calls: string[] = [];
  page.on('request', request => { if (request.method() !== 'GET') calls.push(request.url()); });
  await expect(page.locator('#agent-approve')).not.toBeChecked();
  await page.locator('#agent-approve').check();
  await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-status')).toContainText('live demo is not available yet');
  await expect(page.locator('#agent-proposal')).toBeHidden();
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
  expect(calls).toEqual([]);
});
