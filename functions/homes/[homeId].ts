export function onRequest(context: { request: Request; params: { homeId: string | string[] } }) {
  const { request, params } = context;
  if (!['GET', 'HEAD'].includes(request.method) || typeof params.homeId !== 'string' || !/^[a-f0-9]{32}$/.test(params.homeId) || new URL(request.url).search) {
    return new Response('Home not found.', { status: 404 });
  }
  return new Response(request.method === 'HEAD' ? null : `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Home · AI Agents Tower</title><link rel="stylesheet" href="/residence/home.css">
<script type="module" src="/residence/viewer.js"></script></head>
<body><header class="tower"><a href="/">AI Agents Tower</a></header>
<main aria-live="polite"><p class="view-status">Opening home…</p><noscript>Enable JavaScript to open this home.</noscript></main>
</body></html>`, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Security-Policy': "default-src 'none'; connect-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}
