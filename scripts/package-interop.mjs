// Build a caller that owns its runtime, with a separate explicitly selected network source.
import { readFile, writeFile, cp, rm, mkdir } from 'node:fs/promises';
const index = process.argv.indexOf('--source');
const source = new URL(index < 0 ? 'https://1st-tower.neobabylon.app/agents/tower-home-builder' : process.argv[index + 1]);
if ((!['https:', 'http:'].includes(source.protocol)) || (source.protocol === 'http:' && !['127.0.0.1', 'localhost'].includes(source.hostname)) || source.username || source.password || source.search || source.hash || !source.pathname.endsWith('/tower-home-builder')) throw new Error('Use a credential-free exact named HTTPS (or loopback) network URL.');
const root = new URL('../artifacts/interop-caller/', import.meta.url); const dist = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', dist), 'utf8');
const entry = html.match(/<script type="module"[^>]*src="(\/assets\/[^"<>]+\.js)"[^>]*><\/script>/);
if (!entry) throw new Error('Build the app first; exactly one bundled module entry is required.');
await rm(root, { recursive: true, force: true }); await mkdir(root, { recursive: true }); await cp(dist, root, { recursive: true });
// A caller owns its UI/runtime, not a copy of the Tower's network or live-server contract.
for (const name of ['agents', 'reviewer', '_routes.json', '_headers', '_worker.js']) await rm(new URL(name, root), { recursive: true, force: true });
await writeFile(new URL('index.html', root), html.replace(entry[0], '<script type="module" src="/interop-bootstrap.js"></script>'));
await writeFile(new URL('interop-bootstrap.js', root), `import ${JSON.stringify('.' + entry[1])};\nconst source=document.querySelector('#agent-source');\nsource.value=${JSON.stringify(source.href)};\nsource.dispatchEvent(new Event('input'));\ndocument.querySelector('#reviewer-demo').remove();\ndocument.querySelector('#agent-mode option[value=\"reviewer\"]').remove();\nconst notice=document.createElement('p');\nnotice.id='interop-notice';notice.className='hint';notice.textContent='Independent caller · Simulation. Network source: '+new URL(source.value).origin+'. Approve loading its public data to continue.';\ndocument.querySelector('.agent-panel').prepend(notice);\n`);
await writeFile(new URL('INTEROP-README.txt', root), `MOCK ONLY. Independent caller package.\nServe this complete directory on an authorized HTTPS origin different from ${source.origin}.\nCaller owns its runtime and configuration; only public network artifacts are loaded from ${source.origin}.\nThe user must approve the exact displayed source. No real inference, credentials, persistent homes or conformance claim.\nThe source must allow credential-free public-artifact CORS for this caller. This package contains no Tower network copy, reviewer status/route files or backend Worker. It cannot enable the Tower live gateway from this origin. No deployment was performed by packaging.\n`);
console.log('Prepared artifacts/interop-caller; deployment/HTTPS evidence remains separate.');
