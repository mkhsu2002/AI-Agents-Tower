// Test-only Cloudflare source. Isolated cwd prevents loading project .env/.dev.vars or bindings.
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(new URL('../', import.meta.url));
const scratch = await mkdtemp(join(tmpdir(), 'tower-pages-interop-'));
const site = join(scratch, 'site'); const worker = join(scratch, 'worker');
const env = { ...process.env, npm_config_cache: process.env.TOWER_TEST_NPM_CACHE || join(tmpdir(), 'tower-npm-cache'), XDG_CONFIG_HOME: join(scratch, 'config'), WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: join(scratch, 'wrangler.log') };
const args = ['--cache', env.npm_config_cache, 'exec', '--yes', '--package=wrangler@4.166.0', '--', 'wrangler'];
function command(tail) {
  return spawn('npm', [...args, ...tail], { cwd: scratch, env, stdio: 'inherit' });
}
let dev;
const clean = async () => { dev?.kill('SIGTERM'); await rm(scratch, { recursive: true, force: true }); };
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void clean().then(() => process.exit(0)); });
try {
  await mkdir(site); await cp(join(repo, 'dist'), site, { recursive: true });
  const build = command(['pages', 'functions', 'build', join(repo, 'functions'), '--outdir', worker]);
  const code = await new Promise(resolve => build.once('exit', resolve));
  if (code !== 0 || (await readdir(worker)).join() !== 'index.js') throw Error('Expected one compiled Pages Worker.');
  await cp(join(worker, 'index.js'), join(site, '_worker.js'));
  // No API credential, D1 binding, account selection or remote runtime is configured.
  dev = command(['pages', 'dev', site, '--ip', '127.0.0.1', '--port', '4203', '--compatibility-date=2026-11-19']);
  process.exitCode = Number(await new Promise(resolve => dev.once('exit', resolve))) || 0;
} finally { await clean(); }
