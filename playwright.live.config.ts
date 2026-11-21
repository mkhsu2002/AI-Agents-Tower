import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './checks', testMatch: 'live-reviewer.spec.ts', outputDir: './test-results/live-acceptance',
  workers: 1, retries: 0, repeatEach: 1, timeout: 60000,
  // No network trace: run tickets need not be retained in acceptance artifacts.
  use: { baseURL: 'https://1st-tower.neobabylon.app', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}, trace: 'off', screenshot: 'only-on-failure' },
});
