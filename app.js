const USER = 'Alexander-288';
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// where each repo goes; order sets the order on the page
// cat: big | exp ; anything else with Pages lands in "big", without Pages in "code"
const MAP = {
  fold: { cat: 'big', order: 2, img: 'previews/fold.webp', logo: 'logos/fold.svg', lbg: '#111', lsize: '62%',
    blurb: 'Gradient and fold generator on the GPU, with image, video and shader export.' },
  Tessera: { cat: 'big', order: 3, img: 'previews/tessera.webp', logo: 'logos/tessera.svg',
    blurb: 'Color library in your browser. Find colors by describing them.' },
  'graass-studio': { cat: 'big', order: 5, title: 'graass studio', img: 'previews/graass.webp', logo: 'logos/graass.svg',
    blurb: 'Stylized GPU grass field with steerable wind, colors, light and camera.' },
  bluntCMS: { cat: 'big' },
  'ai-racing-gdot-thing': { cat: 'big', title: 'AI Racing' },
  'burnt-fighters': { cat: 'big' },
  informatica: { cat: 'exp', img: 'previews/informatica.webp', blurb: 'Informatics coursework and experiments, with a gallery.' },
  factorial2: { cat: 'exp', img: 'previews/factorial2.webp', blurb: 'Area between x² and cos x: bisection, trapezoids and Simpson.' },
  'hypocycloid-explainer': { cat: 'exp', blurb: 'How a hypocycloid is drawn, step by step.' },
  canvaskit: { cat: 'big', order: 6, title: 'CanvasKit', img: 'previews/canvaskit.webp', logo: 'logos/canvaskit.svg',
    blurb: 'Clean, glassy whiteboard built on Excalidraw.' },
};
const MAPL = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [k.toLowerCase(), v]));

// Cord gets its own folder: the site plus every repo in the cord-note org
const CORD = {
  org: 'cord-note',
  site: { title: 'Cord', url: 'https://cord-note.github.io/', repo: 'https://github.com/cord-note/cord-note.github.io',
    img: 'previews/cord.webp', logo: 'logos/cord.png', sub: 'Linked notes that stay on your computer.' },
  skip: new Set(['.github', 'cord-note.github.io']),
  meta: {
    cord: { order: 1, icon: 'app', blurb: 'The desktop app. Vaults, notes, links and tags as a graph.' },
    shuttle: { order: 2, icon: 'text', blurb: 'Rich-text editor for note apps, on Tiptap 3. On npm as shuttle-editor.' },
    'cord-mcp': { order: 3, icon: 'plug', blurb: 'Lets Claude and other MCP clients read and write your notes.' },
    'cord-themes': { order: 4, icon: 'palette', blurb: 'Nine colour themes: Catppuccin, Nord, Gruvbox and more.' },
  },
  snapshot: [
    ['cord', 'TypeScript', '2026-11-10'],
    ['shuttle', 'TypeScript', '2026-11-08'],
    ['cord-mcp', 'JavaScript', '2026-11-05'],
    ['cord-themes', 'CSS', '2026-11-01'],
  ].map(([name, language, pushed_at]) => ({ name, language, pushed_at, html_url: `https://github.com/cord-note/${name}` })),
};

// sites on organisations I'm part of
const ORGS = [
  { title: 'KNF ULO', cat: 'big', order: 4, live: true, url: 'https://knf-ulo.github.io/', repo: 'https://github.com/knf-ulo/knf-ulo.github.io',
    img: 'previews/knf.webp', logo: 'logos/knf.png', sub: 'Physics club building a Formula Student car.' },
];

// repos never shown
const HIDE = new Set([
  USER, `${USER}.github.io`, 'cpp-project-template', 'wizytowka-business-card', 'portfolio',
  'GameEngineProject', 'Create-Foundation',
].map((s) => s.toLowerCase()));

// used when the GitHub API can't be reached
const SNAPSHOT = [
  ['fold', 1, 'JavaScript', '2026-11-12', ''],
  ['graass-studio', 1, 'JavaScript', '2026-11-12', ''],
  ['factorial2', 1, 'HTML', '2026-10-16', ''],
  ['informatica', 1, 'HTML', '2026-09-24', ''],
  ['Tessera', 1, 'HTML', '2026-08-26', ''],
  ['bluntCMS', 0, 'JavaScript', '2026-10-05', 'Stupid simple flat-file CMS: edit your static HTML site right on the page. A few PHP + JS files, no database, no build step.'],
  ['ai-racing-gdot-thing', 0, 'GDScript', '2026-09-09', '3D AI racing competition in Godot 4: build a car\'s brain as a node graph, then race it on tracks it has never seen.'],
  ['burnt-fighters', 0, 'Java', '2026-08-20', 'Makes Create and Create: FireFighting Additions actually put out Burnt Basic fires. NeoForge 1.21.1.'],
  ['hypocycloid-explainer', 0, 'HTML', '2026-07-28', ''],
  ['html-arcade', 0, 'JavaScript', '2026-07-28', ''],
  ['html-mini-games', 0, 'HTML', '2026-07-28', ''],
  ['connect-four-python', 0, 'Python', '2026-07-28', ''],
  ['triangle-geometry-cpp', 0, 'C++', '2026-07-28', ''],
  ['not-so-simple-Roulette', 0, 'C++', '2025-11-02', 'My in progress making of a roulette game in terminal using C++'],
  ['Tetris-in-JS', 0, 'HTML', '2025-03-14', 'This is my go at making playable tetris on a website with JavaScript'],
].map(([name, pages, language, pushed_at, description]) => ({
  name, has_pages: !!pages, language, pushed_at, description, fork: false, archived: false,
  html_url: `https://github.com/${USER}/${name}`,
}));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pagesUrl = (name) => `https://${USER.toLowerCase()}.github.io/${name}/`;
const short = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

function ago(date) {
  if (!date) return '';
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d < 1) return 'updated today';
  if (d < 30) return `updated ${d}d ago`;
  if (d < 365) return `updated ${Math.floor(d / 30)}mo ago`;
  return `updated ${Math.floor(d / 365)}y ago`;
}

const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';

// cards that already played their entrance stay put when the list refreshes
const shown = new Set();
const rv = (it) => (shown.has(it.title) ? 'reveal in done' : 'reveal');

function card(it, i) {
  const pic = it.img
    ? `<img src="${esc(it.img)}" alt="Preview of ${esc(it.title)}" loading="lazy">`
    : `<div class="noimg">${esc(it.title[0])}</div>`;
  const logo = it.logo
    ? `<span class="logo" style="${it.lbg ? `--lbg:${it.lbg};` : ''}${it.lsize ? `--lsize:${it.lsize};` : ''}"><img src="${esc(it.logo)}" alt=""></span>`
    : '';
  return `<article class="card rim ${rv(it)} tilt" data-key="${esc(it.title)}" style="--i:${i}">
    <a class="window" href="${esc(it.url)}" aria-label="Open ${esc(it.title)}">
      <span class="window-bar"><i></i><i></i><i></i><span>${esc(short(it.url))}</span></span>
      ${pic}
      <span class="sheen"></span>
    </a>
    <div class="info">
      ${logo}
      <span class="txt"><span class="name">${esc(it.title)}</span><span class="sub">${esc(it.sub || 'Live on GitHub Pages')}</span></span>
      <a class="btn code" href="${esc(it.repo)}">Code</a>
      <a class="btn open" href="${esc(it.url)}">${ARROW}Open</a>
    </div>
  </article>`;
}

function tile(it, i) {
  return `<a class="tile rim ${rv(it)} tilt" data-key="${esc(it.title)}" href="${esc(it.repo)}" style="--i:${i}">
    <span class="sheen"></span>
    <div class="tile-top"><span class="lang">${esc(it.lang || 'Repo')}</span><span class="arrow">${ARROW}</span></div>
    <h3>${esc(it.title)}</h3>
    ${it.sub ? `<p>${esc(it.sub)}</p>` : ''}
    <span class="when">${esc(it.when)}</span>
  </a>`;
}

// small line icons for the files in the Cord folder
const ICONS = {
  app: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18M9 9v10"/>',
  text: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
  plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  palette: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor"/>',
  file: '<path d="M7 3h7l5 5v13H7zM14 3v5h5"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[k] || ICONS.file}</svg>`;

function renderCord(repos) {
  const files = repos
    .filter((r) => !r.fork && !r.archived && !CORD.skip.has(r.name))
    .map((r) => ({ ...(CORD.meta[r.name] || {}), name: r.name, lang: r.language, when: ago(r.pushed_at), url: r.html_url, desc: r.description }))
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  const key = JSON.stringify(files.map((f) => [f.name, f.when]));
  if (key === renderCord.last) return;
  renderCord.last = key;

  const s = CORD.site;
  const el = document.getElementById('cord');
  const done = el.firstElementChild?.classList.contains('in');
  el.innerHTML = `<div class="cf ${done ? 'reveal in done' : 'reveal'}">
    <div class="cf-shape">
      <a class="cf-tab" href="https://github.com/${CORD.org}">
        <span class="logo" style="--lbg:#111;--lsize:72%"><img src="${esc(s.logo)}" alt=""></span>
        <span class="cf-org">${CORD.org}</span>
        <span class="cf-count">${files.length + 1} repos</span>
      </a>
      <div class="cf-body">
        <article class="cf-site tilt">
          <a class="window" href="${esc(s.url)}" aria-label="Open ${esc(s.title)}">
            <span class="window-bar"><i></i><i></i><i></i><span>${esc(short(s.url))}</span></span>
            <img src="${esc(s.img)}" alt="Preview of ${esc(s.title)}" loading="lazy">
            <span class="sheen"></span>
          </a>
          <div class="info">
            <span class="txt"><span class="name">${esc(s.title)}</span><span class="sub">${esc(s.sub)}</span></span>
            <a class="btn code" href="${esc(s.repo)}">Code</a>
            <a class="btn open" href="${esc(s.url)}">${ARROW}Open</a>
          </div>
        </article>
        <div class="cf-files">
          ${files.map((f, i) => `<a class="cf-file" href="${esc(f.url)}" style="--i:${i}">
            <span class="cf-ico">${icon(f.icon)}</span>
            <span class="cf-txt">
              <span class="cf-name">${esc(f.name)}</span>
              <span class="cf-desc">${esc(f.blurb || f.desc || '')}</span>
              <span class="cf-meta">${esc([f.lang, f.when].filter(Boolean).join(' · '))}</span>
            </span>
            <span class="arrow">${ARROW}</span>
          </a>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
  wire();
}

function render(repos) {
  const items = repos
    .filter((r) => !r.fork && !r.archived && !HIDE.has(r.name.toLowerCase()))
    .map((r) => {
      const m = MAP[r.name] || MAPL[r.name.toLowerCase()] || {};
      return {
        ...m,
        title: m.title || r.name,
        cat: m.cat || (r.has_pages ? 'big' : 'code'),
        order: m.order || 99,
        live: r.has_pages,
        url: r.homepage || pagesUrl(r.name),
        repo: r.html_url,
        sub: m.blurb || r.description || '',
        lang: r.language,
        when: ago(r.pushed_at),
      };
    });

  // skip if nothing changed, so cards don't replay their entrance
  const key = JSON.stringify(items.map((i) => [i.title, i.cat, i.live, i.sub, i.when]));
  if (key === render.last) return;
  render.last = key;

  const all = [...items, ...ORGS];
  const pick = (cat, live) => all.filter((i) => i.cat === cat && i.live === live).sort((a, b) => a.order - b.order);

  document.getElementById('big-live').innerHTML = pick('big', true).map(card).join('');
  document.getElementById('big-code').innerHTML = pick('big', false).map(tile).join('');
  document.getElementById('exp-live').innerHTML = pick('exp', true).map(card).join('');
  document.getElementById('exp-code').innerHTML = pick('exp', false).map(tile).join('');
  document.getElementById('other').innerHTML = items.filter((i) => i.cat === 'code').map(tile).join('');

  wire();
}

// ---------- hero ----------
document.getElementById('papers').innerHTML = ['previews/fold.webp', 'previews/cord.webp', 'previews/knf.webp']
  .map((src) => `<img src="${src}" alt="">`).join('');

const title = document.querySelector('.title span');
title.innerHTML = [...title.textContent].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join('');

// folder leans toward the pointer, light follows it
(() => {
  const folder = document.getElementById('folder');
  const box = folder.querySelector('.folder-3d');
  const front = folder.querySelector('.f-front');
  if (still) return;
  const t = { x: 0, y: 0 }, c = { x: 0, y: 0 };
  let raf = 0;
  const loop = () => {
    c.x += (t.x - c.x) * 0.08;
    c.y += (t.y - c.y) * 0.08;
    box.style.setProperty('--ry', `${(c.x * 10).toFixed(2)}deg`);
    box.style.setProperty('--rx', `${(-c.y * 8).toFixed(2)}deg`);
    raf = Math.abs(t.x - c.x) + Math.abs(t.y - c.y) > 0.001 ? requestAnimationFrame(loop) : 0;
  };
  folder.addEventListener('pointermove', (e) => {
    const b = folder.getBoundingClientRect();
    t.x = (e.clientX - b.left) / b.width - 0.5;
    t.y = (e.clientY - b.top) / b.height - 0.5;
    const f = front.getBoundingClientRect();
    front.style.setProperty('--sx', `${e.clientX - f.left}px`);
    front.style.setProperty('--sy', `${e.clientY - f.top}px`);
    if (!raf) raf = requestAnimationFrame(loop);
  });
  folder.addEventListener('pointerleave', () => { t.x = 0; t.y = 0; if (!raf) raf = requestAnimationFrame(loop); });
})();

// ---------- cards: tilt, light, press, reveal ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('in');
    if (el.dataset.key) shown.add(el.dataset.key);
    io.unobserve(el);
    // hand transform over to the tilt once the reveal has played
    setTimeout(() => el.classList.add('done'), 1300 + (parseInt(el.style.getPropertyValue('--i')) || 0) * 70);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function wire() {
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => (still ? el.classList.add('in', 'done') : io.observe(el)));
  if (still) return;
  document.querySelectorAll('.tilt:not([data-wired])').forEach((el) => {
    el.dataset.wired = '1';
    const sheens = el.querySelectorAll('.sheen');
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5;
      const y = (e.clientY - b.top) / b.height - 0.5;
      const k = el.classList.contains('tile') ? 7 : 4;
      el.style.setProperty('--ry', `${(x * k).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-y * k).toFixed(2)}deg`);
      sheens.forEach((s) => {
        const sb = s.getBoundingClientRect();
        s.style.setProperty('--sx', `${e.clientX - sb.left}px`);
        s.style.setProperty('--sy', `${e.clientY - sb.top}px`);
      });
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
      el.classList.remove('pressing');
    });
    el.addEventListener('pointerdown', () => el.classList.add('pressing'));
    el.addEventListener('pointerup', () => el.classList.remove('pressing'));
  });
}
document.querySelectorAll('.block-head.reveal').forEach((el) => io.observe(el));

// ---------- dock: lens springs to the section you're in ----------
(() => {
  const dock = document.getElementById('dock');
  const lens = dock.querySelector('.dock-lens');
  const btns = [...dock.querySelectorAll('.dock-btn')];
  const L = { p: 0, v: 0, t: 0 }, R = { p: 0, v: 0, t: 0 };
  let toRight = true, raf = 0, active = null, hover = null, placed = false;

  const spring = (e, k) => { e.v = (e.v + (e.t - e.p) * k) * 0.64; e.p += e.v; };
  const paint = () => { lens.style.transform = `translateX(${L.p}px)`; lens.style.width = `${R.p - L.p}px`; };
  function tick() {
    spring(L, toRight ? 0.09 : 0.2);
    spring(R, toRight ? 0.2 : 0.09);
    paint();
    const busy = Math.abs(L.t - L.p) + Math.abs(R.t - R.p) + Math.abs(L.v) + Math.abs(R.v) > 0.05;
    raf = busy ? requestAnimationFrame(tick) : 0;
  }
  function moveTo(btn) {
    btns.forEach((b) => b.classList.toggle('on', b === btn));
    const l = btn.offsetLeft, r = l + btn.offsetWidth;
    toRight = l > L.t;
    L.t = l; R.t = r;
    if (still || !placed) { placed = true; L.p = l; R.p = r; L.v = R.v = 0; paint(); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // which section holds the line 35% down the screen
  const secs = btns.map((b) => document.getElementById(b.dataset.sec));
  function current() {
    const line = innerHeight * 0.35;
    let pick = btns[0];
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) pick = btns[i]; });
    return pick;
  }
  function sync() {
    const c = current();
    if (c !== active) { active = c; if (!hover) moveTo(c); }
  }

  btns.forEach((b) => {
    b.addEventListener('pointerenter', () => { hover = b; moveTo(b); });
    b.addEventListener('pointerdown', () => dock.classList.add('pressed'));
  });
  addEventListener('pointerup', () => dock.classList.remove('pressed'));
  dock.addEventListener('pointerleave', () => { hover = null; moveTo(active || current()); });
  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', () => { placed = false; moveTo(hover || active || current()); });
  document.fonts?.ready.then(() => { placed = false; moveTo(active || current()); });
  sync();
})();

// ---------- data ----------
render(SNAPSHOT);
renderCord(CORD.snapshot);

// refresh from GitHub so new sites and repos show up without editing this file
const gh = (path, fn) => fetch(`https://api.github.com/${path}`)
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((repos) => { if (Array.isArray(repos) && repos.length) fn(repos); })
  .catch(() => {});
gh(`users/${USER}/repos?per_page=100&sort=pushed`, render);
gh(`orgs/${CORD.org}/repos?per_page=100`, renderCord);

// ---------- theme ----------
document.getElementById('theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  document.dispatchEvent(new Event('site:theme'));
});
