import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
// Official pinned local test runtime; no account login, secret loading or remote Worker.
const cache = process.env.TOWER_TEST_NPM_CACHE || join(tmpdir(), 'tower-npm-cache');
const child = spawn('npm', ['--cache', cache, 'exec', '--yes', '--package=wrangler@4.166.0', '--', 'node', '--experimental-strip-types', 'scripts/test-edge-live.mjs'], { stdio: 'inherit' });
child.once('error', () => { process.exitCode = 1; });
child.once('exit', code => { process.exitCode = code ?? 1; });
