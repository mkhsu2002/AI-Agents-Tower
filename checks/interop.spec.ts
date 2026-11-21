import { test, expect } from '@playwright/test';
test('independently served caller runs named peer and registered read validator in its browser', async ({ page }) => {
  await page.goto('/'); const requests: { url: string; method: string; body: string | null }[] = [];
  page.on('request', request => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await expect(page.locator('#agent-source')).toHaveValue('http://127.0.0.1:4173/agents/tower-home-builder');
  await page.getByLabel('Your brief').fill('Synthetic independent caller library');
  await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-status')).toContainText('Permission declined'); expect(requests).toEqual([]);
  await page.locator('#agent-approve').check(); await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-proposal')).toBeVisible();
  expect(await page.evaluate(() => location.origin)).toBe('http://127.0.0.1:4190');
  const peer = requests.filter(request => new URL(request.url).origin === 'http://127.0.0.1:4173');
  expect(peer.map(request => new URL(request.url).pathname)).toEqual(['/agents/agent-manifest.json', '/agents/tower-home-builder.network.json']);
  for (const request of peer) { expect(request.method).toBe('GET'); expect(request.body).toBeNull(); }
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
  await page.screenshot({ path: 'test-results/independent-caller-local.png', fullPage: true });
});
