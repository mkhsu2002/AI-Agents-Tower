const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = value => value.replace(/[&<>"']/g, character => entities[character]);

const defaults = { background: '#F6F2E9', surface: '#E7ECDF', text: '#223B30', accent: '#E6B974' };
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(pair => {
    const channel = parseInt(pair, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function readableText(text, background) {
  const light = luminance(background);
  const foreground = luminance(text);
  const ratio = (Math.max(light, foreground) + 0.05) / (Math.min(light, foreground) + 0.05);
  return ratio >= 4.5 ? text : light >= 0.179 ? '#000000' : '#FFFFFF';
}
export function homeColors(input) {
  const palette = { ...defaults, ...input };
  const mainText = readableText(palette.text, palette.background);
  const surfaceText = readableText(palette.text, palette.surface);
  const accentText = readableText(palette.text, palette.accent);
  const variables = [
    ['paper', palette.background], ['surface', palette.surface],
    ['ink', mainText], ['surface-ink', surfaceText],
    ['accent', palette.accent], ['accent-ink', accentText],
  ].map(([name, value]) => `--${name}:${value}`).join(';');
  return { palette, variables, textAdjusted: [mainText, surfaceText, accentText].some(color => color !== palette.text) };
}

export function renderResidence({ displayName, welcome, rooms, palette, plan }) {
  const { variables } = homeColors(palette);
  const title = escapeHtml(displayName);
  const entry = `<header class="entry"><div class="welcome"><h1 dir="auto">${title}</h1><p dir="auto">${escapeHtml(welcome)}</p></div><div class="cover cover-${plan.cover}" aria-hidden="true"></div></header>`;
  const contents = rooms.map(({ title, purpose, body }, index) => `<details${index === 0 ? ' open' : ''}>
    <summary dir="auto">${escapeHtml(title)}</summary>${purpose ? `<p class="purpose" dir="auto">${escapeHtml(purpose)}</p>` : ''}<p dir="auto">${escapeHtml(body)}</p>
  </details>`).join('');
  const interior = rooms.length ? `<section class="rooms" aria-labelledby="rooms-title"><h2 id="rooms-title">Rooms</h2><div>${contents}</div></section>` : '';
  return `<article class="residence layout-${plan.layout} type-${plan.typography}" style="${variables}">${entry}${interior}</article>`;
}
