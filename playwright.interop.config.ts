import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './checks', outputDir: './test-results/interop', testMatch: 'interop.spec.ts', workers: 1,
  use: { baseURL: 'http://127.0.0.1:4190', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}, trace: 'retain-on-failure' },
  webServer: [{ command: 'npm run preview -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: false }, { command: 'node scripts/serve-interop.mjs', url: 'http://127.0.0.1:4190', reuseExistingServer: false }],
});
