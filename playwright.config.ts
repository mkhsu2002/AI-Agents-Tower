import { defineConfig } from '@playwright/test';
export default defineConfig({
  outputDir: './test-results/studio',
  testDir: './tests', testMatch: '**/*.spec.ts', fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}, trace: 'retain-on-failure' },
  webServer: [{ command: 'npm run preview -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: false }, { command: 'node tests/peer-server.mjs', url: 'http://127.0.0.1:4182/health', reuseExistingServer: false }],
});
