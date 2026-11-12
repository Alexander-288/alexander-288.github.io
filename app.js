const USER = 'Alexander-288';

// hand-written blurbs that win over the GitHub description
const BLURBS = {
  Tessera: 'A color library in your browser. Save colors and gradients, then find them by describing them.',
  fold: 'Gradient and fold generator that runs on the GPU, with image, video and shader export.',
  informatica: 'Informatics coursework and experiments, with a gallery.',
  factorial2: 'Area between y=x² and y=cos(x): bisection, trapezoids and Simpson, in 5 modules.',
};

// repos never shown in the lists
const HIDE = new Set([USER.toLowerCase(), `${USER.toLowerCase()}.github.io`]);

// sites on organisations I'm part of
const ORGS = [
  { name: 'Cord', url: 'https://cord-note.github.io/', repo: 'https://github.com/cord-note/cord-note.github.io',
    desc: 'Desktop notes app. Link notes with [[, tag paragraphs, quote blocks. Everything stays on your computer.' },
  { name: 'KNF ULO', url: 'https://knf-ulo.github.io/', repo: 'https://github.com/knf-ulo/knf-ulo.github.io',
    desc: 'Physics club site. Designing our first Formula Student car from scratch.' },
];

// snapshot used if the GitHub API can't be reached
const SNAPSHOT = [
  ['fold', true, 'JavaScript', '2026-11-12', ''],
  ['factorial2', true, 'HTML', '2026-10-16', ''],
  ['informatica', true, 'HTML', '2026-09-24', ''],
  ['Tessera', true, 'HTML', '2026-08-26', ''],
  ['bluntCMS', false, 'JavaScript', '2026-10-05', 'Stupid simple flat-file CMS: edit your static HTML site right on the page. A few PHP + JS files, no database, no build step.'],
  ['ai-racing-gdot-thing', false, 'GDScript', '2026-09-09', '3D AI racing competition in Godot 4: build a car\'s brain as a node graph, then race it on tracks it has never seen.'],
  ['burnt-fighters', false, 'Java', '2026-08-20', 'Makes Create and Create: FireFighting Additions actually put out Burnt Basic fires. NeoForge 1.21.1.'],
  ['portfolio', false, 'TypeScript', '2026-07-28', ''],
  ['html-arcade', false, 'JavaScript', '2026-07-28', ''],
  ['html-mini-games', false, 'HTML', '2026-07-28', ''],
  ['hypocycloid-explainer', false, 'HTML', '2026-07-28', ''],
  ['GameEngineProject', false, 'C++', '2026-07-28', ''],
  ['Create-Foundation', false, 'Java', '2026-07-28', ''],
  ['connect-four-python', false, 'Python', '2026-07-28', ''],
  ['triangle-geometry-cpp', false, 'C++', '2026-07-28', ''],
  ['cpp-project-template', false, 'C++', '2026-07-28', ''],
  ['wizytowka-business-card', false, 'JavaScript', '2026-07-28', ''],
  ['not-so-simple-Roulette', false, 'C++', '2025-11-02', 'My in progress making of a roulette game in terminal using C++'],
  ['Tetris-in-JS', false, 'HTML', '2025-03-14', 'This is my go at making playable tetris on a website with JavaScript'],
].map(([name, has_pages, language, pushed_at, description]) => ({
  name, has_pages, language, pushed_at, description, fork: false, archived: false,
  html_url: `https://github.com/${USER}/${name}`,
}));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pagesUrl = (name) => `https://${USER.toLowerCase()}.github.io/${name}/`;
const shortUrl = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

function card({ name, url, repo, desc }) {
  return `<div class="card">
    <a class="cover" href="${esc(url)}" aria-label="Open ${esc(name)}"></a>
    <h3>${esc(name)}</h3>
    <p>${esc(desc || 'No description yet.')}</p>
    <div class="meta">
      <span class="url"><span class="dot"></span>${esc(shortUrl(url))}</span>
      <a class="code-link" href="${esc(repo)}">code</a>
    </div>
  </div>`;
}

function render(repos) {
  const mine = repos.filter((r) => !r.fork && !r.archived && !HIDE.has(r.name.toLowerCase()));
  const live = mine.filter((r) => r.has_pages);
  const rest = mine.filter((r) => !r.has_pages);

  document.getElementById('live').innerHTML = live.map((r) => card({
    name: r.name,
    url: r.homepage || pagesUrl(r.name),
    repo: r.html_url,
    desc: BLURBS[r.name] || r.description,
  })).join('');
  document.getElementById('live-count').textContent = live.length;

  document.getElementById('projects').innerHTML = rest.map((r) => `<li><a href="${esc(r.html_url)}">
    <span class="name">${esc(r.name)}</span>
    <span class="desc">${esc(BLURBS[r.name] || r.description || '')}</span>
    <span class="lang">${esc(r.language || '')}</span>
  </a></li>`).join('');
  document.getElementById('proj-count').textContent = rest.length;
}

document.getElementById('orgs').innerHTML = ORGS.map(card).join('');
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
