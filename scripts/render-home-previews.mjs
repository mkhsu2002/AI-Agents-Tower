import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import Ajv from 'ajv';
import { escapeHtml as escape, homeColors } from '../server/home-build/presentation.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root));
const ajv = new Ajv({ strict: true });
const validate = ajv.compile(JSON.parse(await read('docs/home-brief-v0.1.schema.json')));
const stylesheet = await read('docs/examples/home-briefs/preview.css');

const houses = [
  {
    name: 'lantern-library',
    composition: 'library',
    artwork: 'docs/examples/lantern-library/lantern-library.webp',
    alt: 'A lantern lights walnut shelves beside a curved window at rainy dusk.',
  },
  {
    name: 'signal-deck',
    composition: 'observatory',
    artwork: 'docs/examples/home-briefs/signal-deck.webp',
    alt: 'A telescope looks out through an open observatory dome above a city at night.',
  },
];

function renderHome(brief, house, artwork, source) {
  const appearance = brief.appearance ?? {};
  const { palette, variables, textAdjusted } = homeColors(appearance.palette);

  const [firstRoom, ...remainingRooms] = brief.rooms;
  const room = ({ title, purpose, body }, featured = false) => `
    <details${featured ? ' open' : ''}>
      <summary>${escape(title)}</summary>
      <div class="room-copy">
        ${purpose ? `<p class="purpose">${escape(purpose)}</p>` : ''}
        <p>${escape(body)}</p>
      </div>
    </details>`;
  const choices = [
    ['Style', appearance.style],
    ['Layout', appearance.layout],
    ['Cover', appearance.coverImageBrief],
  ].filter(([, value]) => value);
  const download = `data:application/json;base64,${source.toString('base64')}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">
  <title>${escape(brief.displayName)} · AI Agents Tower</title>
  <style>${stylesheet}</style>
</head>
<body class="${house.composition}" style="${variables}">
  <header class="masthead">
    <div class="frame bar">
      <strong><span class="mark" aria-hidden="true">✦</span> AI Agents Tower</strong>
      <span>Private preview</span>
    </div>
  </header>
  <main class="frame">
    <div class="home-grid">
      <section class="entry" aria-labelledby="home-title">
        <div class="entry-copy">
          <h1 id="home-title" dir="auto">${escape(brief.displayName)}</h1>
          <p class="welcome" dir="auto">${escape(brief.welcome)}</p>
          ${firstRoom ? '<a class="button" href="#rooms">Explore the rooms <span aria-hidden="true">↓</span></a>' : ''}
        </div>
        <img src="data:image/webp;base64,${artwork.toString('base64')}" width="1200" height="800" alt="${escape(house.alt)}">
      </section>
      <section id="rooms" aria-labelledby="rooms-title">
        <div class="section-heading">
          <h2 id="rooms-title">Rooms</h2>
          <span>${brief.rooms.length}</span>
        </div>
        ${firstRoom ? [room(firstRoom, true), ...remainingRooms.map(value => room(value))].join('') : '<p>No rooms yet.</p>'}
      </section>
    </div>
    <aside class="choices" aria-labelledby="choices-title">
      <h2 id="choices-title">Design choices</h2>
      ${choices.length ? `<dl>${choices.map(([label, value]) => `<div><dt>${label}</dt><dd dir="auto">${escape(value)}</dd></div>`).join('')}</dl>` : ''}
      <ul class="palette" aria-label="Color palette">
        ${Object.entries(palette).map(([role, hex]) => `<li><span style="--swatch:${hex}" aria-hidden="true"></span>${role} <code>${hex}</code></li>`).join('')}
      </ul>
      ${textAdjusted ? '<p class="adjustment">Text color was adjusted for readability on one or more surfaces.</p>' : ''}
    </aside>
    <footer>
      <span>Fictional residence</span>
      <a href="${download}" download="${house.name}.json">Download home brief <span aria-hidden="true">↓</span></a>
    </footer>
  </main>
</body>
</html>
`;
}

const output = resolve(process.argv[2] ?? 'artifacts/home-previews');
const previews = await Promise.all(houses.map(async house => {
  const source = await read(`docs/examples/home-briefs/${house.name}.json`);
  const brief = JSON.parse(source);
  if (!validate(brief)) throw new Error(`${house.name}: ${ajv.errorsText(validate.errors)}`);
  return { house, html: renderHome(brief, house, await read(house.artwork), source) };
}));
await mkdir(output, { recursive: true });
await Promise.all(previews.map(({ house, html }) => writeFile(join(output, `${house.name}.html`), html)));
console.log(`Rendered ${previews.length} home previews to ${output}`);
