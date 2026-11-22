import { defineConfig } from '@playwright/test';
const local = process.env.TOWER_STUDIO_LOCAL_FIXTURE === '1';
export default defineConfig({
  testDir: './checks', testMatch: 'public-studio.spec.ts', outputDir: './test-results/public-studio',
  workers: 1, retries: 0, repeatEach: 1, timeout: 30000,
  webServer: local ? { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: false } : undefined,
  use: { baseURL: local ? 'http://127.0.0.1:4173' : 'https://1st-tower.neobabylon.app', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}, trace: 'off', screenshot: 'only-on-failure' },
});
