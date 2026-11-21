import { test, expect } from '@playwright/test';
import { parseBundle } from '../src/domain/homebundle.ts';
import { readdir, readFile } from 'node:fs/promises';
const source = 'http://127.0.0.1:4203';
const caller = 'http://127.0.0.1:4204';
test('Cloudflare serves public data with explicit noncredentialed CORS; APIs remain isolated', async ({ request }) => {
  for (const path of ['/agents/agent-manifest.json', '/agents/tower-home-builder.network.json', '/schema/homebundle-v0.1.schema.json']) {
    const r = await request.get(source + path, { headers: { Origin: caller } }); expect(r.status()).toBe(200);
    expect(r.headers()['access-control-allow-origin']).toBe('*');
    expect(r.headers()['access-control-allow-methods']).toBe('GET, HEAD');
    expect(r.headers()['access-control-allow-credentials']).toBeUndefined();
    expect(r.headers()['content-type']).toContain('application/json'); expect(r.headers()['x-content-type-options']).toBe('nosniff');
    expect(await r.json()).toBeTruthy();
  }
  for (const path of ['/reviewer/status.json', '/api/reviewer/readiness']) {
    const r = await request.get(source + path, { headers: { Origin: caller } }); expect(r.status()).toBe(200);
    expect(r.headers()['access-control-allow-origin']).toBeUndefined();
    expect((await r.json()).enabled).toBe(false);
  }
  const denied = await request.post(source + '/api/reviewer/start', { headers: { Origin: caller }, data: { consent: true } });
  expect(denied.status()).toBe(503); // No bindings: the public adapter is unconditionally off.
  expect(denied.headers()['access-control-allow-origin']).toBeUndefined();
});
test('independent caller owns its runtime, contacts no peer before consent, and imports no peer code', async ({ page }) => {
  const files = await readdir('artifacts/interop-caller');
  for (const name of ['agents', 'reviewer', '_routes.json', '_headers', '_worker.js']) expect(files).not.toContain(name);
  expect(await readFile('artifacts/interop-caller/INTEROP-README.txt', 'utf8')).toContain('MOCK ONLY');
  await page.goto('/#demo'); await expect(page.locator('#interop-notice')).toContainText(source);
  await expect(page.locator('#reviewer-demo')).toHaveCount(0); await expect(page.locator('#hero-demo')).toHaveCount(0);
  await expect(page.locator('#agent-mode')).toHaveValue('mock');
  expect(await page.locator('#agent-mode option').allTextContents()).toEqual(['Simulation']);
  const requests: { url: string; method: string; body: string | null; credentials: boolean }[] = [];
  page.on('request', r => requests.push({ url: r.url(), method: r.method(), body: r.postData(), credentials: !!r.headers().authorization || !!r.headers().cookie }));
  await page.getByLabel('Your brief').fill('Synthetic independent Cloudflare reading room');
  await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-status')).toContainText('Permission declined'); expect(requests).toEqual([]);
  await page.locator('#agent-approve').check(); await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  await expect(page.locator('#agent-proposal')).toBeVisible();
  const peer = requests.filter(r => new URL(r.url).origin === source);
  expect(peer.map(r => new URL(r.url).pathname)).toEqual(['/agents/agent-manifest.json', '/agents/tower-home-builder.network.json']);
  for (const r of peer) { expect(r.method).toBe('GET'); expect(r.body).toBeNull(); expect(r.credentials).toBe(false); }
  expect(requests.some(r => r.method !== 'GET' || /\/api\/reviewer\//.test(r.url))).toBe(false);
  expect(await page.evaluate(() => location.origin)).toBe(caller);
  await expect(page.locator('#agent-receipt')).toContainText('succeeded');
  await expect(page.locator('#agent-receipt')).toContainText('"mode": "mock"');
  await expect(page.getByLabel('Display name')).toHaveValue('Atlas');
  await page.getByRole('button', { name: 'Apply draft', exact: true }).click();
  await page.getByLabel('Display name').fill('Independent reading room');
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON', exact: true }).click();
  const raw = await readFile((await (await pending).path())!, 'utf8'); expect(parseBundle(raw).ok).toBe(true);
  await page.getByLabel('Bundle JSON').fill(raw); await page.getByRole('button', { name: 'Replace draft with JSON', exact: true }).click();
  await expect(page.getByLabel('Display name')).toHaveValue('Independent reading room');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});
test('browser CORS rejects credentialed artifact reads and cross-origin model API reads', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(async origin => {
    const attempt = async (path: string, credentials: RequestCredentials) => {
      try { await fetch(origin + path, { credentials, redirect: 'error' }); return 'readable'; } catch { return 'blocked'; }
    };
    return [await attempt('/agents/agent-manifest.json', 'omit'), await attempt('/agents/agent-manifest.json', 'include'), await attempt('/api/reviewer/readiness', 'omit')];
  }, source);
  expect(results).toEqual(['readable', 'blocked', 'blocked']);
});
