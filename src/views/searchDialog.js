// 🔍 Search (top bar): one box that finds brain parts, pathways, 3D places, effects, research methods, guided
// stories, book sections and key terms. With an AI connected, a question can be sent to the AI instead.
import { search, searchMore } from '../search/searchIndex.js';
import { regionById, lessonById, chapterByN } from '../../content/index.js';
import { PATHWAYS } from '../brain/pathways.js';
import { REGION_COLORS } from '../brain/brainParts.js';
import { hasAI } from '../explore/ai.js';
import { ui, t, getLang } from '../i18n.js';
import { esc, tt } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const shortName = (r) => t(r.name).replace(/\s*\([^)]*\)\s*$/, '');
const swatch = (c) => `<span class="swatch" style="background:${c}"></span>`;
const looksLikeQuestion = (q) => q.trim().split(/\s+/).length >= 3 || /[?？]$/.test(q.trim());

function resultsHtml(q) {
  const res = search(q);
  const more = searchMore(q);
  const ql = q.trim().toLowerCase();
  const paths = PATHWAYS.filter((p) => (t(p.name) + ' ' + p.name.en + ' ' + (p.stimulus ? p.stimulus.en : '')).toLowerCase().includes(ql)).slice(0, 3);
  const head = (title) => `<h4>${title}</h4>`;
  const link = (href, title, sub = '') => `<a class="result" href="${href}"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</a>`;
  const group = (list, title, href) => (list.length ? head(title) + list.map((x) => link(href(x), `${x.icon} ${tt(x.title)}`)).join('') : '');
  let html = hasAI() ? `<button class="result ask-claude" data-ask>✨ <b>${esc(L('Ask the AI:', 'לשאול את ה-AI:'))}</b> “${esc(q)}”<small>${esc(ui('askClaudeHint'))}</small></button>` : '';
  const total = res.regions.length + res.lessons.length + res.terms.length + paths.length + more.scenes.length + more.effects.length + more.methods.length + more.stories.length;
  if (!total) html += `<p class="muted small sd-empty">${esc(ui('noResults'))}</p>`;
  if (res.regions.length) html += head(`🧠 ${esc(ui('regions'))}`) + res.regions.map((r) => { const reg = regionById[r.id]; return link(`#/explore/organ/${r.id}`, `${swatch(REGION_COLORS[r.id])} ${esc(shortName(reg))}`, esc(t(reg.functions).slice(0, 3).join(' · '))); }).join('');
  html += group(more.stories, '📖 ' + esc(L('Guided stories', 'סיפורים מודרכים')), (x) => `#/story/${x.id}`);
  html += group(more.scenes, '🔭 ' + esc(L('3D places', 'מקומות בתלת-ממד')), (x) => `#/explore/${x.id}`);
  if (paths.length) html += head(`⚡ ${esc(ui('pathways'))}`) + paths.map((p) => link(`#/explore/organ/path/${p.id}`, `${p.icon} ${tt(p.name)}`, tt(p.desc))).join('');
  html += group(more.effects, '🧪 ' + esc(L('Effects to apply', 'השפעות להפעלה')), (x) => `#/effect/${x.id}`);
  html += group(more.methods, '🔬 ' + esc(L('Research methods', 'שיטות מחקר')), (x) => `#/explore/${x.id}`);
  if (res.lessons.length) html += head(`📚 ${esc(L('Book sections (test yourself)', 'פרקים בספר (בחנו את עצמכם)'))}`) + res.lessons.map((r) => { const l = lessonById[r.id]; return link(`#/test/sub/${l.id}`, `${esc(l.id)} · ${tt(l.title)}`, tt(chapterByN[l.chapter].title)); }).join('');
  if (res.terms.length) html += head(`🔑 ${esc(ui('terms'))}`) + res.terms.map((r) => { const l = lessonById[r.lessonId]; const card = l.cards.find((c) => c.id === r.id); return link(`#/test/sub/${l.id}`, tt(card.front), tt(card.back)); }).join('');
  return html;
}

export function openSearch() {
  document.querySelector('dialog.search-dialog')?.remove();
  const d = document.createElement('dialog');
  d.className = 'search-dialog card';
  d.setAttribute('aria-label', L('Search', 'חיפוש'));
  d.innerHTML = `<div class="sd-head">
      <input class="search-input" type="search" autocomplete="off" placeholder="${esc(hasAI() ? L('Search, or ask a question…', 'חפשו, או שאלו שאלה…') : L('Search brain parts, topics, stories…', 'חפשו חלקי מוח, נושאים, סיפורים…'))}" />
      <button class="icon-btn" data-close aria-label="${esc(L('Close', 'סגירה'))}">✕</button></div>
    <div class="sd-results search-results"><p class="muted small sd-empty">${esc(L('Try “fear”, “memory”, “coffee”, “MRI”…', 'נסו "פחד", "זיכרון", "קפה", "MRI"…'))}</p></div>`;
  document.body.appendChild(d);
  const input = d.querySelector('input'), box = d.querySelector('.sd-results');
  const ask = async (q) => { d.close(); (await import('../explore/index.js')).exploreAsk(q); };
  let timer = null;
  const run = () => {
    const q = input.value;
    if (q.trim().length < 2) return;
    box.innerHTML = resultsHtml(q);
    box.querySelector('[data-ask]')?.addEventListener('click', () => ask(q));
    box.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => d.close()));
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 150); });
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (hasAI() && looksLikeQuestion(input.value)) ask(input.value);
    else box.querySelector('a.result')?.click();
  });
  d.querySelector('[data-close]').addEventListener('click', () => d.close());
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  d.addEventListener('close', () => d.remove());
  d.showModal();
  input.focus();
}
