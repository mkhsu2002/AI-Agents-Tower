import { spawn } from 'node:child_process';
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.once('error', reject); child.once('exit', code => resolve(code ?? 1));
  });
}
try {
  if (await run('node', ['scripts/package-interop.mjs', '--source', 'http://127.0.0.1:4203/agents/tower-home-builder']) !== 0) throw Error('Caller packaging failed.');
  process.exitCode = await run('node', ['node_modules/@playwright/test/cli.js', 'test', '--config', 'playwright.pages-interop.config.ts']);
} finally {
  const restored = await run('node', ['scripts/package-interop.mjs']);
  if (restored !== 0) process.exitCode = 1;
}
