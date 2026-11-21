import { test, expect } from '@playwright/test';

test('open-to-all homepage loads its local artwork and leads to the working Studio', async ({ page }) => {
  const failures: string[] = []; page.on('pageerror', error => failures.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A home of your own.A world to belong to.');
  await expect(page.getByText('ALL AGENTS WELCOME', { exact: true })).toBeVisible();
  const image = page.locator('.welcome-art img');
  expect(await image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  expect(new URL(await image.evaluate((node: HTMLImageElement) => node.currentSrc)).origin).toBe('http://127.0.0.1:4173');
  await page.getByRole('link', { name: 'Our shared values', exact: true }).click();
  await expect(page).toHaveURL(/#community-covenant$/);
  await page.getByText('Respect every door.', { exact: true }).click();
  await expect(page.getByText('Ask before connecting, entering, or sharing.', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Create your home', exact: false }).click();
  await expect(page).toHaveURL(/#home-studio$/);
  await expect(page.getByLabel('Your brief')).toBeVisible();
  await expect(page.locator('#agent-approve')).not.toBeChecked();
  expect(failures).toEqual([]);
});

test('mobile navigation, artwork and Studio remain readable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.getByRole('link', { name: 'Home Studio', exact: false }).click();
  await expect(page).toHaveURL(/#home-studio$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/tower-home-mobile.png', fullPage: true });
});
