import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
async function settings(page: Page, scenario: string, extra = {}) {
  await page.route('**/development/mock-settings.json', route => route.fulfill({ json: { mode: 'mock', scenario, timeoutMs: 5000, delayMs: 5, ...extra } }));
}
async function run(page: Page, brief = 'A quiet library for agents') {
  await page.getByLabel('Your brief').fill(brief);
  await page.locator('#agent-approve').check();
  await page.getByRole('button', { name: 'Create a draft' }).click();
}
test.beforeEach(async ({ page }) => { await page.goto('/'); });
test('two mock roles produce a validated proposal, review/apply/edit/export round-trip without content writes', async ({ page, context }) => {
  const errors: string[] = []; const writes: string[] = []; const bodies: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.method() !== 'GET') writes.push(r.url()); if (r.postData()) bodies.push(r.postData()!); });
  await settings(page, 'success');
  const brief = '<script>window.pwned=1</script> A calm library';
  await run(page, brief);
  await expect(page.locator('#agent-status')).toContainText('Draft ready. Review');
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
  await expect(page.locator('#agent-result')).toContainText(brief);
  await expect(page.locator('#agent-result script')).toHaveCount(0);
  await page.getByRole('button', { name: 'Apply draft' }).click();
  await expect(page.locator('#preview')).toContainText(brief);
  await expect(page.locator('#preview script')).toHaveCount(0);
  await page.getByLabel('Display name').fill('Reviewed library');
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON' }).click();
  const downloaded = await pending; const result = JSON.parse(await readFile((await downloaded.path())!, 'utf8'));
  expect(result.displayName).toBe('Reviewed library'); expect(result.blocks[0].text).toBe(brief);
  await page.getByLabel('Bundle JSON').fill(JSON.stringify(result));
  await page.getByRole('button', { name: 'Replace draft with JSON' }).click();
  await expect(page.getByLabel('Display name')).toHaveValue('Reviewed library');
  expect(writes).toEqual([]); expect(bodies).toEqual([]); expect(errors).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, pwned: 'pwned' in window }))).toEqual({ local: 0, session: 0, pwned: false });
  expect(await context.cookies()).toEqual([]);
  await page.screenshot({ path: 'test-results/agent-round-trip.png', fullPage: true });
});
test('default-deny and invalid/oversized brief contact no network and preserve draft', async ({ page }) => {
  const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await expect(page.locator('#agent-approve')).not.toBeChecked();
  for (const [brief, error] of [[' ', 'Enter a brief'], ['x'.repeat(1501), '1500 Unicode'], ['Valid', 'Permission declined']]) {
    await page.getByLabel('Your brief').fill(brief);
    await page.getByRole('button', { name: 'Create a draft' }).click();
    await expect(page.locator('#agent-status')).toContainText(error!);
    await expect(page.locator('#agent-proposal')).toBeHidden();
  }
  expect(requests).toEqual([]); await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
});
for (const [scenario, message] of [['model-error', 'Draft generation failed'], ['tool-error', 'Home builder'], ['invalid-bundle', 'failed validation'], ['slow-model', 'deadline exceeded']]) {
  test(`${scenario} is an explicit failure, retains edits, then restart succeeds`, async ({ page }) => {
    await settings(page, scenario!, scenario === 'slow-model' ? { timeoutMs: 250 } : {});
    await page.getByLabel('Display name').fill('Keep my draft');
    await run(page);
    await expect(page.locator('#agent-status')).toContainText('Generation stopped');
    await expect(page.locator('#agent-status')).toContainText(message!);
    await expect(page.locator('#agent-proposal')).toBeHidden();
    await expect(page.getByLabel('Display name')).toHaveValue('Keep my draft');
    await settings(page, 'success'); await run(page);
    await expect(page.locator('#agent-proposal')).toBeVisible();
  });
}
test('cancel stops a pending run, never reveals late output, restart works', async ({ page }) => {
  await settings(page, 'slow-model'); await run(page);
  await expect(page.locator('#agent-status')).toContainText('Reception');
  await page.getByRole('button', { name: 'Cancel generation' }).click();
  await expect(page.locator('#agent-status')).toContainText('cancel');
  await expect(page.locator('#agent-proposal')).toBeHidden();
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
  await settings(page, 'success'); await run(page);
  await expect(page.locator('#agent-proposal')).toBeVisible();
});
test('intervening edits and imports are guarded; source changes revoke consent; no real mode fallback', async ({ page }) => {
  await settings(page, 'success', { delayMs: 150 }); await run(page);
  await page.getByLabel('Display name').fill('Edited while running');
  await expect(page.locator('#agent-proposal')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply draft' })).toBeDisabled();
  await expect(page.getByLabel('Display name')).toHaveValue('Edited while running');
  await page.getByRole('button', { name: 'Discard draft' }).click();
  await run(page); await expect(page.locator('#agent-proposal')).toBeVisible();
  await page.getByLabel('Display name').fill('Edited after proposal');
  await page.getByRole('button', { name: 'Apply draft' }).click();
  await expect(page.getByLabel('Display name')).toHaveValue('Edited after proposal');
  await page.getByText('Public network source', { exact: true }).click();
  await page.getByLabel('Network URL').fill('http://127.0.0.1:4182/agents/tower-home-builder');
  await expect(page.locator('#agent-approve')).not.toBeChecked();
  await settings(page, 'success', { mode: 'real' }); await run(page);
  await expect(page.locator('#agent-status')).toContainText('Real inference is not configured');
  await expect(page.locator('#agent-proposal')).toBeHidden();
});
async function peerSource(page: Page, scenario: string) {
  await page.getByText('Public network source', { exact: true }).click();
  await page.getByLabel('Network URL').fill(`http://127.0.0.1:4182/${scenario}/tower-home-builder`);
}
test('second origin loads exact named network in caller browser after approval, no content/key forwarding', async ({ page }) => {
  const requests: { url: string; method: string; body: string | null; headers: Record<string, string> }[] = [];
  page.on('request', r => { if (r.url().startsWith('http://127.0.0.1:4182')) requests.push({ url: r.url(), method: r.method(), body: r.postData(), headers: r.headers() }); });
  await settings(page, 'success'); await peerSource(page, 'agents');
  await page.getByLabel('Your brief').fill('A private local brief');
  await page.getByRole('button', { name: 'Create a draft' }).click();
  await expect(page.locator('#agent-status')).toContainText('Permission declined'); expect(requests).toEqual([]);
  await run(page, 'A private local brief');
  await expect(page.locator('#agent-proposal')).toBeVisible();
  expect(requests.map(r => new URL(r.url).pathname)).toEqual(['/agents/agent-manifest.json', '/agents/tower-home-builder.network.json']);
  for (const request of requests) { expect(request.method).toBe('GET'); expect(request.body).toBeNull(); expect(request.headers.authorization).toBeUndefined(); expect(request.headers.cookie).toBeUndefined(); }
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
});
for (const scenario of ['no-cors', 'redirect', 'unknown', 'duplicate']) {
  test(`second origin ${scenario} fails closed and retains draft`, async ({ page }) => {
    const redirected: string[] = []; page.on('request', r => { if (r.url().includes('unauthorized-redirect')) redirected.push(r.url()); });
    await settings(page, 'success'); await peerSource(page, scenario); await run(page);
    await expect(page.locator('#agent-status')).toContainText('Generation stopped');
    await expect(page.locator('#agent-proposal')).toBeHidden();
    await expect(page.getByLabel('Display name')).toHaveValue('Atlas'); expect(redirected).toEqual([]);
  });
}
test('peer MCP discovery requires separate consent; deny/cancel never contact its endpoint', async ({ page }) => {
  const mcp: string[] = []; page.on('request', r => { if (new URL(r.url()).pathname === '/mcp') mcp.push(r.url()); });
  await settings(page, 'success'); await peerSource(page, 'mcp'); await run(page);
  await expect(page.locator('#agent-contact')).toBeVisible();
  await expect(page.locator('#agent-contact-details')).toContainText('http://127.0.0.1:4182');
  await page.getByRole('button', { name: 'Deny connection' }).click();
  await expect(page.locator('#agent-status')).toContainText('Generation stopped');
  await expect(page.locator('#agent-proposal')).toBeHidden(); expect(mcp).toEqual([]);
  await run(page); await expect(page.locator('#agent-contact')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel generation' }).click();
  await expect(page.locator('#agent-contact')).toBeHidden();
  await expect(page.locator('#agent-status')).toContainText('cancel'); expect(mcp).toEqual([]);
});
test('configuration failure and cancelled preparation do not contact a network; retry is explicit', async ({ page }) => {
  const network: string[] = []; page.on('request', r => { if (r.url().includes('/agents/')) network.push(r.url()); });
  await settings(page, 'unknown'); await run(page);
  await expect(page.locator('#agent-status')).toContainText('Generation settings are invalid'); expect(network).toEqual([]);
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/development/mock-settings.json', async route => { await waiting; await route.fulfill({ json: { mode: 'mock', scenario: 'success', timeoutMs: 5000, delayMs: 5 } }).catch(() => {}); });
  await run(page); await expect(page.locator('#agent-status')).toContainText('Loading');
  await page.getByRole('button', { name: 'Cancel generation' }).click();
  await expect(page.locator('#agent-status')).toContainText('cancel'); release();
  await expect(page.locator('#agent-proposal')).toBeHidden(); expect(network).toEqual([]);
  await settings(page, 'success'); await run(page); await expect(page.locator('#agent-proposal')).toBeVisible();
});
test('importing a different draft after generation prevents stale proposal replacement', async ({ page }) => {
  await settings(page, 'success'); await run(page); await expect(page.locator('#agent-proposal')).toBeVisible();
  await page.getByLabel('Bundle JSON').fill(JSON.stringify({ schemaVersion: '0.1', displayName: 'New imported draft', introduction: 'Imported brief', blocks: [] }));
  await page.getByRole('button', { name: 'Replace draft with JSON' }).click();
  await page.getByRole('button', { name: 'Apply draft' }).click();
  await expect(page.locator('#agent-status')).toContainText('no edits were replaced');
  await expect(page.getByLabel('Display name')).toHaveValue('New imported draft');
});
