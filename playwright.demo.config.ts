import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './checks', outputDir: './test-results/demo', testMatch: 'demo.spec.ts', workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 800 }, video: { mode: 'on', size: { width: 1280, height: 800 } }, launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {} },
  webServer: { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
});
