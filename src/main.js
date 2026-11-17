// App start-up and page navigation ("router").
// The site has two parts:
//   🔭 Explore        #/explore/<level>[/<scene>]   (the brain: #/explore/organ[/<parts> | /path/<pathway>])
//                     one continuous 3D drill-down (src/explore/), plus #/effect/<id> and #/story/<id>
//   🧪 Test yourself  #/test[/ai | /cards[/<deck>] | /progress]   (#/test/sub/<subsection>, #/test/ch/<chapter>)
// plus ⚙ Settings (#/settings).
// Pages are loaded only when first opened (dynamic import), so the first visit downloads less.
import './styles.css';
import { getLang, setLang, onLangChange, applyDocumentDirection } from './i18n.js';
import { load, save } from './store.js';
import { openTour } from './views/tour.js';

const app = document.getElementById('app');
const NAV = [
  ['#/explore', '🔭', { en: 'Explore', he: 'חקירה' }],
  ['#/test', '🧪', { en: 'Test yourself', he: 'בחנו את עצמכם' }],
];

// ---- lazily loaded pages (each module is downloaded once, the first time it is needed) ----
const mods = {};
const loaders = {
  explore: () => import('./explore/index.js'),
  test: () => import('./test/TestView.js'),
  settings: () => import('./views/settings.js'),
};
const get = (name) => (mods[name] ? Promise.resolve(mods[name]) : loaders[name]().then((m) => (mods[name] = m)));
/** Call fn(module) only if that page was already loaded (used to hide/clean up pages). */
const ifLoaded = (name, fn) => { if (mods[name]) fn(mods[name]); };

function renderNav() {
  const hash = location.hash || '#/explore';
  const links = NAV.map(([href, icon, name]) => `<a href="${href}" class="${hash.startsWith(href) ? 'active' : ''}">${icon} ${name[getLang()]}</a>`).join('');
  document.getElementById('nav').innerHTML = links;
  document.getElementById('menuNav').innerHTML = links;
  const he = getLang() === 'he';
  document.getElementById('langBtn').textContent = he ? '🌐 English' : '🌐 עברית';
  document.getElementById('themeBtn').textContent = he ? '🌓 בהיר / כהה' : '🌓 Light / dark';
  document.getElementById('helpBtn').textContent = he ? '❓ איך משתמשים' : '❓ How to use';
  document.getElementById('settingsBtn').textContent = he ? '⚙ הגדרות' : '⚙ Settings';
}

/** Show a small "loading" note in the page while a page module downloads. */
function pageLoading(on) { document.body.classList.toggle('page-loading', on); }

let routeToken = 0;
async function route() {
  const token = ++routeToken;
  let hash = location.hash || '#/explore';
  // Old addresses from earlier versions
  if (hash === '#/' || hash === '#') hash = '#/explore';
  if (hash.startsWith('#/brain')) { location.replace(hash.replace('#/brain', '#/explore/organ')); return; }
  // #/test/sub/<subsection id> and #/test/ch/<chapter> (and the old #/learn/…): open the test setup with that part chosen
  const sub = hash.match(/^#\/test\/sub\/(\d+)\.(\d+)/) || hash.match(/^#\/test\/ch\/(\d+)$/) || hash.match(/^#\/learn\/(\d+)(?:\/(\d+))?/);
  if (sub) {
    const { chapterByN } = await import('../content/index.js');
    if (token !== routeToken) return;
    const c = chapterByN[+sub[1]];
    if (c) save('testSetup', { ...load('testSetup', {}), chapter: c.n, lessons: sub[2] ? [`${c.n}.${sub[2]}`] : c.lessons.map((l) => l.id) });
    location.replace('#/test');
    return;
  }
  if (/^#\/(learn|practice|quiz|cards|upload|session|ai|progress)/.test(hash)) { location.replace('#/test'); return; }
  // #/effect/<id>: apply an effect (from the search) and go to the best level to see it
  const eff = hash.match(/^#\/effect\/([A-Za-z]+)/);
  if (eff) {
    const [E, { effectById }] = await Promise.all([import('./visual/effects.js'), import('../content/effects.js')]);
    if (token !== routeToken) return;
    const e = effectById[eff[1]];
    if (e) { E.setEffect(e.id); location.replace(E.bestTarget(e, 'organ') || '#/explore'); } else location.replace('#/explore');
    return;
  }
  const story = hash.match(/^#\/story\/([a-z]+)/);
  if (story) {
    const st = await import('./visual/stories.js');
    if (token === routeToken && !st.storyGo(story[1], 0, { replace: true })) location.replace('#/explore'); // unknown story
    return;
  }

  const parts = hash.slice(1).split('?')[0].split('/').filter(Boolean);
  renderNav();
  ifLoaded('test', (m) => m.cleanupTest());

  if (parts[0] === 'explore') {
    app.innerHTML = '';
    app.hidden = true;
    pageLoading(true);
    let m;
    try { m = await get('explore'); } catch (e) { pageLoading(false); if (token === routeToken) showLoadError(e); return; }
    pageLoading(false);
    if (token !== routeToken) return;
    m.showExplore(parts.slice(1));
    return;
  }
  ifLoaded('explore', (m) => m.hideExplore());
  app.hidden = false;
  window.scrollTo(0, 0);
  if (parts[0] === 'test' || parts[0] === 'settings') {
    app.innerHTML = '<p class="muted" style="padding:24px"><span class="spinner"></span></p>';
    let m;
    try { m = await get(parts[0]); } catch (e) { if (token === routeToken) showLoadError(e); return; }
    if (token !== routeToken) return;
    if (parts[0] === 'test') m.renderTestPage(app, parts[1] || 'premade', parts[2]);
    else m.renderSettings(app);
  } else location.replace('#/explore');
}

/** A page module failed to download (offline, or the site was updated): say so, with a Retry button. */
function showLoadError(e) {
  console.error(e);
  const he = getLang() === 'he';
  app.hidden = false;
  app.innerHTML = `<div class="card" style="margin:24px auto;max-width:480px;text-align:center">
    <p>⚠️ ${he ? 'לא ניתן היה לטעון את הדף. בדקו את החיבור לאינטרנט ונסו שוב.' : 'This page could not be loaded. Check your internet connection and try again.'}</p>
    <button class="btn" id="retryLoad">${he ? 'ניסיון חוזר' : 'Retry'}</button></div>`;
  app.querySelector('#retryLoad').addEventListener('click', () => location.reload());
}

// ---- Theme (light / dark) ----
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  save('theme', theme);
}
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
applyTheme(load('theme', prefersDark ? 'dark' : 'light'));
document.getElementById('themeBtn').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

// ---- Language ----
applyDocumentDirection();
document.getElementById('langBtn').addEventListener('click', () => setLang(getLang() === 'he' ? 'en' : 'he'));
const inExplore = () => (location.hash || '#/explore').startsWith('#/explore');
onLangChange(() => {
  if (inExplore()) {
    renderNav();
    ifLoaded('explore', (m) => m.refreshExplore());
  } else route();
});

// ---- Top bar: 🔍 search + one ☰ menu (language, theme, help, settings; the page links too on phones) ----
const menu = document.getElementById('topMenu'), menuBtn = document.getElementById('menuBtn');
function setMenu(open) { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); }
menuBtn.addEventListener('click', (e) => { e.stopPropagation(); setMenu(menu.hidden); });
menu.addEventListener('click', (e) => { if (e.target.closest('button, a')) setMenu(false); });
document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target)) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
document.getElementById('searchBtn').addEventListener('click', async () => (await import('./views/searchDialog.js')).openSearch());
document.getElementById('settingsBtn').addEventListener('click', () => { location.hash = '#/settings'; });
document.getElementById('helpBtn')?.addEventListener('click', () => openTour());
window.addEventListener('hashchange', route);
/** Height of the top bar → CSS var, so the 3D page fills exactly the rest of the window. */
function measureChrome() {
  const h = document.querySelector('.topbar')?.getBoundingClientRect().height || 57;
  document.documentElement.style.setProperty('--chrome-h', `${Math.ceil(h)}px`);
}
new ResizeObserver(measureChrome).observe(document.querySelector('.topbar')); // also after the web fonts load
measureChrome();
renderNav();
route();
