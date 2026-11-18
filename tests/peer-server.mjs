// Test-only independent origin. No user content or request bodies are stored/logged.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const manifest = JSON.parse(await readFile(new URL('../public/agents/agent-manifest.json', import.meta.url), 'utf8'));
const network = JSON.parse(await readFile(new URL('../public/agents/tower-home-builder.network.json', import.meta.url), 'utf8'));
const server = createServer((req, res) => {
  const pathname = new URL(req.url, 'http://127.0.0.1:4182').pathname;
  const scenario = pathname.split('/')[1];
  if (scenario !== 'no-cors') res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:4173');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (pathname === '/health') return res.end('{}');
  if (pathname.endsWith('/agent-manifest.json')) return res.end(JSON.stringify(manifest));
  if (!pathname.endsWith('/tower-home-builder.network.json')) { res.statusCode = 404; return res.end('{}'); }
  if (scenario === 'redirect') { res.statusCode = 302; res.setHeader('Location', 'http://127.0.0.1:4173/unauthorized-redirect'); return res.end('{}'); }
  const definition = structuredClone(network);
  if (scenario === 'unknown') definition.unknownAuthority = true;
  if (scenario === 'duplicate') definition.tools.push(structuredClone(definition.tools[0]));
  if (scenario === 'mcp') definition.tools[0].tools.push({ url: 'http://127.0.0.1:4182/mcp', tools: ['validate_home_bundle'] });
  res.end(JSON.stringify(definition));
});
server.listen(4182, '127.0.0.1');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
