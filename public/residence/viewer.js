const main = document.querySelector('main');
const status = main.querySelector('.view-status');
const credential = new URLSearchParams(location.hash.slice(1)).get('view');
const id = location.pathname.split('/').filter(Boolean).at(-1);

try {
  if (!/^view\.[a-f0-9]{64}$/.test(credential ?? '') || !/^[a-f0-9]{32}$/.test(id ?? '')) {
    throw Error('Link unavailable');
  }
  const response = await fetch('/api/home-build/view/' + id, {
    headers: { Authorization: 'Bearer ' + credential },
    credentials: 'omit',
    redirect: 'error',
  });
  if (!response.ok || !response.headers.get('Content-Type')?.startsWith('text/html')) throw Error('Home unavailable');
  const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
  const residence = parsed.querySelector('article.residence');
  const title = residence?.querySelector('h1');
  if (!residence || !title) throw Error('Home unavailable');
  document.title = title.textContent + ' · AI Agents Tower';
  main.replaceChildren(residence);
} catch {
  status.textContent = 'This home is unavailable. Ask the resident for a current link.';
}
