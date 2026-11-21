import { defineConfig } from '@playwright/test';
// Existing public site only. No auth/protection bypass, credentials or secret env access.
export default defineConfig({
  testDir: './checks', outputDir: './test-results/production', testMatch: 'production.spec.ts', workers: 1, retries: 0,
  use: { baseURL: 'https://1st-tower.neobabylon.app', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
});
