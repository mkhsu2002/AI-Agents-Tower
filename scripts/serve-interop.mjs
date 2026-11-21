// Test-only static caller host, not a production/auth/persistence server.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const index = process.argv.indexOf('--port');
const port = index < 0 ? 4190 : Number(process.argv[index + 1]);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Use a valid loopback test port.');
const root = resolve('artifacts/interop-caller');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    const url = new URL(req.url, `http://127.0.0.1:${port}`); const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!path.startsWith(root + sep)) { res.writeHead(404); res.end(); return; }
    const bytes = await readFile(path); res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(bytes);
  } catch { res.writeHead(404); res.end(); }
});
server.listen(port, '127.0.0.1');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
