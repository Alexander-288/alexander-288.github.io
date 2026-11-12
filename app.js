const USER = 'Alexander-288';
const me = `https://github.com/${USER}.png?size=80`;

// where each repo goes, plus its preview and a better blurb
// cat: big | exp ; anything not listed lands in "Code projects" (or "Big" if it has Pages)
const MAP = {
  fold:        { cat: 'big', img: 'previews/fold.webp', blurb: 'Gradient and fold generator on the GPU, with image, video and shader export.' },
  Tessera:     { cat: 'big', img: 'previews/tessera.webp', blurb: 'Color library in your browser. Find colors by describing them.' },
  bluntCMS:    { cat: 'big' },
  'ai-racing-gdot-thing': { cat: 'big', title: 'AI Racing' },
  'burnt-fighters':       { cat: 'big' },
  informatica: { cat: 'exp', img: 'previews/informatica.webp', blurb: 'Informatics coursework and experiments, with a gallery.' },
  factorial2:  { cat: 'exp', img: 'previews/factorial2.webp', blurb: 'Area between x² and cos x: bisection, trapezoids and Simpson.' },
  'hypocycloid-explainer': { cat: 'exp', blurb: 'How a hypocycloid is drawn, step by step.' },
};

// sites on organisations I'm part of
const ORGS = [
  { name: 'Cord', cat: 'big', url: 'https://cord-note.github.io/', repo: 'https://github.com/cord-note/cord-note.github.io',
    img: 'previews/cord.webp', who: 'https://github.com/cord-note.png?size=80', sub: 'Linked notes that stay on your computer.' },
  { name: 'KNF ULO', cat: 'big', url: 'https://knf-ulo.github.io/', repo: 'https://github.com/knf-ulo/knf-ulo.github.io',
    img: 'previews/knf.webp', who: 'https://github.com/knf-ulo.png?size=80', sub: 'Physics club building a Formula Student car.' },
];

// repos never shown
const HIDE = new Set([USER.toLowerCase(), `${USER.toLowerCase()}.github.io`]);

// used when the GitHub API can't be reached
const SNAPSHOT = [
  ['fold', 1, 'JavaScript', '2026-11-12', ''],
  ['factorial2', 1, 'HTML', '2026-10-16', ''],
  ['informatica', 1, 'HTML', '2026-09-24', ''],
  ['Tessera', 1, 'HTML', '2026-08-26', ''],
  ['bluntCMS', 0, 'JavaScript', '2026-10-05', 'Stupid simple flat-file CMS: edit your static HTML site right on the page. A few PHP + JS files, no database, no build step.'],
  ['ai-racing-gdot-thing', 0, 'GDScript', '2026-09-09', '3D AI racing competition in Godot 4: build a car\'s brain as a node graph, then race it on tracks it has never seen.'],
  ['burnt-fighters', 0, 'Java', '2026-08-20', 'Makes Create and Create: FireFighting Additions actually put out Burnt Basic fires. NeoForge 1.21.1.'],
  ['hypocycloid-explainer', 0, 'HTML', '2026-07-28', ''],
  ['portfolio', 0, 'TypeScript', '2026-07-28', ''],
  ['html-arcade', 0, 'JavaScript', '2026-07-28', ''],
  ['html-mini-games', 0, 'HTML', '2026-07-28', ''],
  ['GameEngineProject', 0, 'C++', '2026-07-28', ''],
  ['Create-Foundation', 0, 'Java', '2026-07-28', ''],
  ['connect-four-python', 0, 'Python', '2026-07-28', ''],
  ['triangle-geometry-cpp', 0, 'C++', '2026-07-28', ''],
  ['cpp-project-template', 0, 'C++', '2026-07-28', ''],
  ['wizytowka-business-card', 0, 'JavaScript', '2026-07-28', ''],
  ['not-so-simple-Roulette', 0, 'C++', '2025-11-02', 'My in progress making of a roulette game in terminal using C++'],
  ['Tetris-in-JS', 0, 'HTML', '2025-03-14', 'This is my go at making playable tetris on a website with JavaScript'],
].map(([name, pages, language, pushed_at, description]) => ({
  name, has_pages: !!pages, language, pushed_at, description, fork: false, archived: false,
  html_url: `https://github.com/${USER}/${name}`,
}));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pagesUrl = (name) => `https://${USER.toLowerCase()}.github.io/${name}/`;

function ago(date) {
  if (!date) return '';
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d < 1) return 'updated today';
  if (d < 30) return `updated ${d}d ago`;
  if (d < 365) return `updated ${Math.floor(d / 30)}mo ago`;
  return `updated ${Math.floor(d / 365)}y ago`;
}

const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';

function preview(it) {
  const pic = it.img
    ? `<img class="cover" src="${esc(it.img)}" alt="" loading="lazy">`
    : `<div class="noimg">${esc(it.title[0])}</div>`;
  return `<div class="shot">
    ${pic}
    <a class="hit" href="${esc(it.url)}" aria-label="Open ${esc(it.title)}"></a>
    <span class="chip"><span class="dot"></span>Live</span>
    <a class="code-link" href="${esc(it.repo)}">Code</a>
    <div class="bar">
      <img class="who" src="${esc(it.who || me)}" alt="">
      <span class="txt"><span class="name">${esc(it.title)}</span><span class="sub">${esc(it.sub || 'Live on GitHub Pages')}</span></span>
      <a class="open" href="${esc(it.url)}">${ARROW}Open</a>
    </div>
  </div>`;
}

function tile(it) {
  return `<a class="tile glass" href="${esc(it.repo)}">
    <div class="tile-top"><span class="lang">${esc(it.lang || 'Repo')}</span><span class="arrow">${ARROW}</span></div>
    <h3>${esc(it.title)}</h3>
    ${it.sub ? `<p>${esc(it.sub)}</p>` : ''}
    <span class="when">${esc(it.when)}</span>
  </a>`;
}

function render(repos) {
  const items = repos
    .filter((r) => !r.fork && !r.archived && !HIDE.has(r.name.toLowerCase()))
    .map((r) => {
      const m = MAP[r.name] || {};
      return {
        title: m.title || r.name,
        cat: m.cat || (r.has_pages ? 'big' : 'other'),
        live: r.has_pages,
        img: m.img,
        url: r.homepage || pagesUrl(r.name),
        repo: r.html_url,
        sub: m.blurb || r.description || '',
        lang: r.language,
        when: ago(r.pushed_at),
      };
    });

  const orgs = ORGS.map((o) => ({ ...o, title: o.name, live: true }));
  const pick = (cat, live) => [...items, ...orgs].filter((i) => i.cat === cat && i.live === live);

  document.getElementById('big-live').innerHTML = pick('big', true).map(preview).join('');
  document.getElementById('big-code').innerHTML = pick('big', false).map(tile).join('');
  document.getElementById('exp-live').innerHTML = pick('exp', true).map(preview).join('');
  document.getElementById('exp-code').innerHTML = pick('exp', false).map(tile).join('');
  document.getElementById('other').innerHTML = items.filter((i) => i.cat === 'other').map(tile).join('');

  const live = items.filter((i) => i.live).length + orgs.length;
  document.getElementById('tally').textContent = `${live} live · ${items.length + orgs.length} total`;
}

// hero fan uses three previews
document.getElementById('fan').innerHTML = ['previews/cord.webp', 'previews/fold.webp', 'previews/knf.webp']
  .map((src) => `<img src="${src}" alt="">`).join('');

render(SNAPSHOT);

// refresh from GitHub so new sites show up without editing this file
fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`)
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((repos) => { if (Array.isArray(repos) && repos.length) render(repos); })
  .catch(() => {});

// theme toggle
document.getElementById('theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
});
