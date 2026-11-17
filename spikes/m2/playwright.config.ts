import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: true,
  outputDir: '../../test-results/m2',
  use: { baseURL: 'http://127.0.0.1:4180/spikes/m2/site/', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}, trace: 'retain-on-failure' },
  webServer: { command: 'node --experimental-strip-types spikes/m2/server.mjs', cwd: '../..', url: 'http://127.0.0.1:4180/spikes/m2/site/', reuseExistingServer: false },
});
