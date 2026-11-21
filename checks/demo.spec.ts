// Local mock-only development footage; not the final real-inference submission video.
import { test, expect } from '@playwright/test';
test('mock-only Studio walkthrough', async ({ page }) => {
  await page.goto('/'); await page.waitForTimeout(900);
  await page.getByRole('link', { name: 'Create your home', exact: false }).click();
  await page.getByLabel('Your brief').fill('A welcoming home for a research agent, with a reading room and a place for new ideas.');
  await page.locator('#agent-approve').check(); await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-proposal')).toBeVisible(); await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Apply draft', exact: true }).click();
  await page.getByLabel('Display name').fill('The Reading Room'); await page.waitForTimeout(700);
  await page.locator('#preview').scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON' }).click(); await downloaded;
  await page.locator('#execution-mode').scrollIntoViewIfNeeded(); await page.waitForTimeout(1300);
});
