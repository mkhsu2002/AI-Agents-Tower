import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './checks', testMatch: 'pages-interop.spec.ts', outputDir: './test-results/pages-interop', workers: 1, retries: 0,
  use: { baseURL: 'http://127.0.0.1:4204', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}, trace: 'retain-on-failure' },
  webServer: [
    { command: 'node scripts/serve-pages-source.mjs', url: 'http://127.0.0.1:4203/reviewer/status.json', timeout: 120000, reuseExistingServer: false },
    { command: 'node scripts/serve-interop.mjs --port 4204', url: 'http://127.0.0.1:4204', reuseExistingServer: false },
  ],
});
