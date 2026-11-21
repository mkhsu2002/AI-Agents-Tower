import { test, expect } from '@playwright/test';
import { reviewApplyExport } from './live-flow.ts';
import { REVIEWER_BRIEF, REVIEWER_PROTOCOL } from '../src/agents/reviewer-contract.ts';
test.skip(process.env.TOWER_LIVE_ACCEPTANCE !== '1', 'Explicit TOWER_LIVE_ACCEPTANCE=1 is required; this test can consume one three-call run.');
// Deliberate single public run. No test routes, credentials, provider overrides or automatic retry.
test('one public live demo collaborates, validates, reviews and round-trips', async ({ page }, testInfo) => {
  const chat: { fields: string[]; origin: string; credentials: boolean }[] = []; let starts = 0;
  page.on('request', request => {
    const url = new URL(request.url());
    if (request.method() !== 'POST') return;
    if (url.pathname === '/api/reviewer/start') starts++;
    if (url.pathname === '/api/reviewer/v1/chat/completions') chat.push({ fields: Object.keys(JSON.parse(request.postData() || '{}')).sort(), origin: url.origin, credentials: !!request.headers().authorization || !!request.headers().cookie });
  });
  await page.goto('/');
  const status = await page.request.get('/reviewer/status.json'); expect(status.ok()).toBe(true);
  expect(await status.json()).toEqual({ enabled: true, protocol: REVIEWER_PROTOCOL });
  await page.locator('#reviewer-demo').click();
  await expect(page.getByLabel('Your brief', { exact: true })).toHaveValue(REVIEWER_BRIEF);
  await expect(page.locator('#agent-approve')).not.toBeChecked();
  await page.locator('#agent-approve').check();
  await page.getByRole('button', { name: 'Create a draft', exact: true }).click();
  const result = await reviewApplyExport(page);
  expect(starts).toBe(1); expect(chat).toHaveLength(3);
  for (const call of chat) { expect(call.fields).toEqual(['step', 'ticket']); expect(call.credentials).toBe(false); expect(call.origin).toBe(new URL(page.url()).origin); }
  // No ticket, key, prompt or raw provider response in the evidence summary.
  await testInfo.attach('live-acceptance-summary', { contentType: 'application/json', body: JSON.stringify({ publicOrigin: new URL(page.url()).origin, fixedExample: 'Atlas', runStarts: starts, modelCalls: chat.length, validation: 'succeeded', ...result }) });
  await page.screenshot({ path: 'artifacts/evidence/public-live-round-trip.png', fullPage: true });
});
