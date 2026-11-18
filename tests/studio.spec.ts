import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import example from '../public/examples/welcome.homebundle.json' with { type: 'json' };

async function importJson(page: Page, value: unknown) {
  await page.getByLabel('Bundle JSON').fill(typeof value === 'string' ? value : JSON.stringify(value));
  await page.getByRole('button', { name: 'Replace draft with JSON' }).click();
}
async function download(page: Page) {
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON' }).click();
  const file = await pending; const path = await file.path(); expect(path).not.toBeNull();
  return JSON.parse(await readFile(path!, 'utf8'));
}
test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('import/edit/export repeated round-trip preserves content and absent optional theme', async ({ page }) => {
  const bundle = { schemaVersion: '0.1', displayName: 'Nova', introduction: '  Hello\nworld ', blocks: [{ type: 'text', title: 'Ideas', text: 'one\ntwo' }] };
  await importJson(page, bundle); await expect(page.locator('#preview h3')).toHaveText('Nova');
  expect(await download(page)).toEqual(bundle);
  for (let i = 0; i < 3; i++) {
    bundle.displayName = `Nova ${i}`; await page.getByLabel('Display name').fill(bundle.displayName);
    const exported = await download(page); expect(exported).toEqual(bundle); await importJson(page, exported);
  }
  await page.getByLabel('Preview theme').selectOption('midnight');
  expect(await download(page)).toEqual({ ...bundle, theme: 'midnight' });
});
test('script-like text renders literally, creates no executable nodes or remote requests', async ({ page }) => {
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  const script = '<script>globalThis.pwned=1</script><img src="https://example.invalid/x" onerror="alert(1)">';
  await importJson(page, { ...example, displayName: '<svg onload=alert(1)>', introduction: script, blocks: [{ type: 'text', title: '<b>Title</b>', text: 'javascript:alert(1) & <iframe srcdoc=x>' }] });
  await expect(page.locator('#preview')).toContainText(script);
  await expect(page.locator('#preview script, #preview img, #preview svg, #preview iframe, #preview a')).toHaveCount(0);
  expect(await page.evaluate(() => 'pwned' in globalThis)).toBe(false); expect(requests).toEqual([]);
  expect((await download(page)).introduction).toBe(script);
});
test('rejected imports preserve both current draft and raw import text', async ({ page }) => {
  await page.getByLabel('Display name').fill('Keep my edits');
  for (const raw of ['{', JSON.stringify({ ...example, ownerId: 'forged' }), JSON.stringify({ ...example, schemaVersion: '0.2' }), ' '.repeat(65537)]) {
    await importJson(page, raw); await expect(page.locator('#transfer-status')).toContainText('Import rejected');
    await expect(page.getByLabel('Display name')).toHaveValue('Keep my edits');
    await expect(page.getByLabel('Bundle JSON')).toHaveValue(raw);
    expect((await download(page)).displayName).toBe('Keep my edits');
  }
});
test('invalid edits pause preview/export, add and remove blocks recover explicitly', async ({ page }) => {
  await page.getByLabel('Display name').fill(' ');
  await expect(page.getByRole('button', { name: 'Download JSON' })).toBeDisabled();
  await expect(page.locator('#preview')).toContainText('Fix the draft errors');
  await page.getByLabel('Display name').fill('Recovered');
  await page.getByRole('button', { name: '+ Add text block' }).click();
  await expect(page.getByRole('button', { name: 'Download JSON' })).toBeDisabled();
  const block = page.getByRole('group', { name: 'Block 3' });
  await block.getByLabel('Title', { exact: true }).fill('A new block'); await block.getByLabel('Text', { exact: true }).fill('A new idea');
  await expect(page.locator('#preview')).toContainText('A new idea');
  await block.getByRole('button').click(); expect((await download(page)).blocks).toHaveLength(2);
});
test('file staging, read error, oversized file, cancellation and stale completion never replace drafts', async ({ page }) => {
  await page.getByLabel('Bundle JSON').fill('Keep staged text');
  await page.locator('#file').setInputFiles({ name: 'oversized.json', mimeType: 'application/json', buffer: Buffer.alloc(65537) });
  await expect(page.locator('#transfer-status')).toContainText('File rejected');
  await expect(page.getByLabel('Bundle JSON')).toHaveValue('Keep staged text');
  await page.locator('#file').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from([0xff]) });
  await expect(page.locator('#transfer-status')).toContainText('File read failed');
  await page.locator('#file').setInputFiles({ name: 'bundle.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...example, displayName: 'File name' })) });
  await expect(page.locator('#transfer-status')).toContainText('File loaded');
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
  await page.getByRole('button', { name: 'Replace draft with JSON' }).click(); await expect(page.getByLabel('Display name')).toHaveValue('File name');
  // Delay file I/O at the browser boundary to exercise interrupted reads deterministically.
  await page.evaluate(() => {
    const original = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () { await new Promise(resolve => setTimeout(resolve, 350)); return original.call(this); };
  });
  for (const action of ['cancel', 'clear', 'edit'] as const) {
    await page.getByLabel('Bundle JSON').fill('Existing import text');
    await page.locator('#file').setInputFiles({ name: 'slow.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(example)) });
    await expect(page.getByRole('button', { name: 'Replace draft with JSON' })).toBeDisabled();
    if (action === 'cancel') await page.getByRole('button', { name: 'Cancel file read' }).click();
    if (action === 'clear') await page.getByRole('button', { name: 'Clear import text' }).click();
    if (action === 'edit') await page.getByLabel('Bundle JSON').fill('New import text');
    await page.waitForTimeout(450);
    await expect(page.getByLabel('Bundle JSON')).toHaveValue(action === 'cancel' ? 'Existing import text' : action === 'clear' ? '' : 'New import text');
    await expect(page.getByLabel('Display name')).toHaveValue('File name');
  }
});
test('reload warns about edits and no browser storage or content network writes occur', async ({ page, context }) => {
  const writes: string[] = []; page.on('request', request => { if (request.method() !== 'GET') writes.push(request.url()); });
  await page.getByLabel('Display name').fill('Ephemeral draft');
  const pending = page.waitForEvent('dialog');
  await page.evaluate(() => { setTimeout(() => location.reload(), 0); });
  const dialog = await pending; expect(dialog.type()).toBe('beforeunload'); await dialog.dismiss();
  await expect(page.getByLabel('Display name')).toHaveValue('Ephemeral draft');
  page.once('dialog', dialog => dialog.accept()); await page.reload();
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
  expect(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, databases: await indexedDB.databases(), caches: await caches.keys() }))).toEqual({ local: 0, session: 0, databases: [], caches: [] });
  expect(await context.cookies()).toEqual([]); expect(writes).toEqual([]);
});
test('mobile layout stays within viewport with explicit draft status', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Build a home for your AI agent.' })).toBeVisible();
  await expect(page.locator('#execution-mode')).toContainText('simulated');
  await expect(page.locator('#draft-storage')).toContainText('lost on reload');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/home-studio-mobile.png', fullPage: true });
});

test('desktop layout and initial console are healthy', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Download JSON' })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/home-studio-desktop.png', fullPage: true });
});
