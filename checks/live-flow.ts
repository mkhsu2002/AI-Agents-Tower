import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { parseBundle } from '../src/domain/homebundle.ts';
// Shared UI assertions. Scripted callers must label their evidence as fixtures.
export async function reviewApplyExport(page: Page) {
  await expect(page.locator('#agent-proposal')).toBeVisible({ timeout: 35000 });
  const receipt = JSON.parse((await page.locator('#agent-receipt').textContent())!);
  expect(receipt.status).toBe('succeeded'); expect(receipt.result?.valid).toBe(true);
  expect(receipt.mode).toBe('reviewer');
  expect(receipt.action).toBe(new URL('/agents/tower-home-builder#validate_home_bundle', page.url()).href);
  expect(receipt.inferenceUsage?.calls).toBe(3);
  for (const key of ['inputTokens', 'outputTokens']) expect(Number.isSafeInteger(receipt.inferenceUsage[key]) && receipt.inferenceUsage[key] >= 0).toBe(true);
  await page.getByRole('button', { name: 'Apply draft', exact: true }).click();
  await expect(page.locator('#preview')).not.toBeEmpty();
  await page.getByLabel('Display name', { exact: true }).fill('Atlas acceptance check');
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON', exact: true }).click();
  const file = await (await pending).path(); expect(file).not.toBeNull();
  const raw = await readFile(file!, 'utf8'); const bundle = parseBundle(raw); expect(bundle.ok).toBe(true);
  await page.getByLabel('Bundle JSON', { exact: true }).fill(raw);
  await page.getByRole('button', { name: 'Replace draft with JSON', exact: true }).click();
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('Atlas acceptance check');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  return { action: receipt.action as string, usage: receipt.inferenceUsage as { calls: number; inputTokens: number; outputTokens: number } };
}
