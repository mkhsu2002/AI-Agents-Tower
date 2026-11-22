// Real public static Studio only. Does not generate, authorize or substitute model responses.
import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { parseBundle } from '../src/domain/homebundle.ts';
test.skip(process.env.TOWER_PUBLIC_STUDIO_ACCEPTANCE !== '1' && process.env.TOWER_STUDIO_LOCAL_FIXTURE !== '1', 'Explicit public Studio opt-in required; this check never starts inference.');
test('public Studio edits, downloads, validates and reimports without model calls or persistent browser content', async ({ page, context }, testInfo) => {
  let blocked = 0; const writes: string[] = [];
  await page.route('**/api/reviewer/**', route => { blocked++; return route.abort(); });
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(new URL(request.url()).pathname); });
  await page.goto('/');
  await expect(page.locator('#agent-approve')).not.toBeChecked();
  await page.getByLabel('Display name', { exact: true }).fill('Atlas public Studio acceptance');
  await expect(page.locator('#preview')).toContainText('Atlas public Studio acceptance');
  const downloadEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON', exact: true }).click();
  const file = await (await downloadEvent).path(); expect(file).not.toBeNull();
  const raw = await readFile(file!, 'utf8'); const result = parseBundle(raw); expect(result.ok).toBe(true);
  await page.getByLabel('Display name', { exact: true }).fill('Temporary editor change');
  await page.getByLabel('Bundle JSON', { exact: true }).fill(raw);
  await page.getByRole('button', { name: 'Replace draft with JSON', exact: true }).click();
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('Atlas public Studio acceptance');
  for (const invalid of ['{', '{"schemaVersion":"unsupported","displayName":"x","introduction":"","blocks":[]}']) {
    await page.getByLabel('Bundle JSON', { exact: true }).fill(invalid);
    await page.getByRole('button', { name: 'Replace draft with JSON', exact: true }).click();
    await expect(page.locator('#transfer-status')).toContainText('Import rejected');
    await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('Atlas public Studio acceptance');
  }
  await page.getByLabel('Bundle JSON', { exact: true }).fill(raw);
  await page.getByRole('button', { name: 'Replace draft with JSON', exact: true }).click();
  expect(blocked).toBe(0); expect(writes).toEqual([]);
  expect(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, databases: await indexedDB.databases(), caches: await caches.keys() }))).toEqual({ local: 0, session: 0, databases: [], caches: [] });
  expect(await context.cookies()).toEqual([]);
  const summary = { origin: new URL(page.url()).origin, mode: process.env.TOWER_STUDIO_LOCAL_FIXTURE === '1' ? 'local-no-inference-static-studio' : 'public-no-inference-static-studio', downloadSha256: createHash('sha256').update(raw).digest('hex'), downloadBytes: Buffer.byteLength(raw), downloadParsed: true, reimported: true, invalidImportsPreservedDraft: true, modelRequests: 0, persistentBrowserContent: false };
  await writeFile(testInfo.outputPath('summary.json'), JSON.stringify(summary, null, 2));
  await testInfo.attach('public-studio-summary', { contentType: 'application/json', body: JSON.stringify(summary) });
});
