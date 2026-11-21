// Reuse installed Linux FFmpeg/Chromium; no binary download or package modification.
import { readFile, mkdir, mkdtemp, symlink, rm, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
if (process.platform !== 'linux') throw new Error('Use the demo Playwright config with your installed browser/FFmpeg on this platform.');
const ffmpeg = process.env.TOWER_FFMPEG_PATH || '/usr/bin/ffmpeg'; await access(ffmpeg, constants.X_OK);
const metadata = JSON.parse(await readFile(new URL('../node_modules/playwright-core/browsers.json', import.meta.url), 'utf8'));
const revision = metadata.browsers.find(browser => browser.name === 'ffmpeg')?.revision;
if (!/^\d+$/.test(revision || '')) throw new Error('Pinned Playwright FFmpeg metadata unavailable.');
const cache = await mkdtemp(join(tmpdir(), 'tower-demo-tools-'));
try {
  const directory = join(cache, `ffmpeg-${revision}`); await mkdir(directory); await symlink(ffmpeg, join(directory, 'ffmpeg-linux'));
  const cli = new URL('../node_modules/@playwright/test/cli.js', import.meta.url);
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli.pathname, 'test', '--config', 'playwright.demo.config.ts'], { stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: cache, CHROMIUM_PATH: process.env.CHROMIUM_PATH || '/usr/bin/chromium' } });
    child.on('error', reject); child.on('exit', code => resolve(code ?? 1));
  });
  process.exitCode = Number(result);
} finally { await rm(cache, { recursive: true, force: true }); }
