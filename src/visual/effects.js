// "Apply an effect" engine: one active effect (drug, disease, body state or stimulus) that follows the user
// across all zoom levels. Each level shows its own part of the story (see content/effects.js).
import { EFFECTS, CATEGORIES, effectById } from '../../content/effects.js';
import { LEVELS } from './levels/index.js';
import { load, save } from '../store.js';
import { getLang } from '../i18n.js';
import { esc } from '../util.js';
import { storyListHtml } from './stories.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const T = (b) => (b ? L(b.en, b.he) : '');
let active = load('effect', null);
if (active && !effectById[active]) active = null;
const listeners = new Set();

export const getEffect = () => (active ? effectById[active] : null);
let justSet = false;
/** True once after an effect was chosen (Explore then opens its info sheet to explain it). */
export const takeJustSet = () => { const j = justSet; justSet = false; return j; };
export function setEffect(id) {
  active = id && effectById[id] ? id : null;
  justSet = !!active;
  save('effect', active);
  listeners.forEach((fn) => fn(getEffect()));
}
export const onEffectChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const effectAt = (levelId) => getEffect()?.at?.[levelId] || null;

/** Where to go to see the effect at a level. */
export function effectHref(levelId, entry) {
  if (levelId === 'organ') {
    if (entry.path) return `#/explore/organ/path/${entry.path}`;
    return `#/explore/organ/${(entry.regions || []).join(',')}`;
  }
  return `#/explore/${levelId}/${entry.s}`;
}

/** The levels (in zoom order) where the active effect shows something. */
export function effectTrail() {
  const e = getEffect();
  if (!e) return [];
  return LEVELS.filter((l) => e.at[l.id]).map((l) => ({ level: l, entry: e.at[l.id], href: effectHref(l.id, e.at[l.id]) }));
}

/** Best place to show an effect: the current level if it has an entry, otherwise the nearest level that does. */
export function bestTarget(e, currentLevel) {
  if (e.at[currentLevel]) return effectHref(currentLevel, e.at[currentLevel]);
  const idx = LEVELS.findIndex((l) => l.id === currentLevel);
  const withEntry = LEVELS.map((l, i) => ({ l, i })).filter(({ l }) => e.at[l.id]);
  if (!withEntry.length) return null;
  withEntry.sort((a, b) => Math.abs(a.i - idx) - Math.abs(b.i - idx));
  return effectHref(withEntry[0].l.id, e.at[withEntry[0].l.id]);
}

/** Effect info block for the info dock (or '' when no effect). */
export function effectBoxHtml(levelId, sceneId) {
  const e = getEffect();
  if (!e) return '';
  const entry = e.at[levelId];
  const here = entry && (levelId === 'organ' || entry.s === sceneId);
  const trail = effectTrail();
  const note = here ? `<p class="effect-note">${esc(T(entry.note))}</p>`
    : entry ? `<p class="effect-note muted">${esc(L('At this level the effect is shown in another scene:', 'ברמה הזו ההשפעה מוצגת בסצנה אחרת:'))} <a href="${effectHref(levelId, entry)}">${esc(L('show me', 'הראו לי'))} →</a></p>`
    : `<p class="effect-note muted">${esc(L('No visible change at this level — see it at:', 'אין שינוי נראה ברמה הזו — ראו אותו ב:'))}</p>`;
  return `<div class="effect-box">
      <div class="effect-head"><span class="effect-icon">${e.icon}</span><b>${esc(T(e.name))}</b><span class="spacer"></span>
        <button class="icon-btn" data-effect-clear title="${esc(L('Remove the effect', 'הסרת ההשפעה'))}">✕</button></div>
      <p class="small">${esc(T(e.desc))}</p>
      ${note}
      <div class="effect-trail">${trail.map((x) => `<a class="chip ${x.level.id === levelId ? 'on' : ''}" href="${x.href}">${x.level.icon} ${esc(T(x.level.name))}</a>`).join('')}</div>
    </div>`;
}

/** Wire the ✕ button inside an effect box. */
export function bindEffectBox(root) {
  root.querySelectorAll('[data-effect-clear]').forEach((b) => b.addEventListener('click', () => setEffect(null)));
}

/** A dialog listing all effects by category. `onPick(effect)` is called with the choice. */
export function openEffectPicker(onPick) {
  document.querySelector('dialog.effect-dialog')?.remove();
  const d = document.createElement('dialog');
  d.className = 'effect-dialog card';
  const cur = getEffect();
  d.innerHTML = `
    <div class="row"><h3 style="margin:0">🧪 ${esc(L('Apply an effect', 'הפעלת השפעה'))}</h3><span class="spacer"></span><button class="icon-btn" data-close>✕</button></div>
    <p class="small muted">${esc(L('Choose something that acts on the body. It stays on while you zoom between levels, and each level shows what it does there.', 'בחרו משהו שפועל על הגוף. הוא נשאר פעיל בזמן המעבר בין הרמות, וכל רמה מראה מה הוא עושה שם.'))}</p>
    <h4>📖 ${esc(L('Guided stories', 'סיפורים מודרכים'))}</h4>${storyListHtml()}
    ${CATEGORIES.map((c) => `<h4>${c.icon} ${esc(T(c.name))}</h4><div class="effect-grid">${EFFECTS.filter((e) => e.cat === c.id).map((e) => `
      <button class="effect-opt ${cur?.id === e.id ? 'on' : ''}" data-eff="${e.id}" title="${esc(T(e.desc))}"><span>${e.icon}</span> ${esc(T(e.name))}</button>`).join('')}</div>`).join('')}
    ${cur ? `<div class="row" style="margin-top:12px"><button class="btn ghost sm" data-none>✕ ${esc(L('No effect', 'ללא השפעה'))}</button></div>` : ''}`;
  document.body.appendChild(d);
  const close = () => { d.close(); d.remove(); };
  d.querySelector('[data-close]').addEventListener('click', close);
  d.querySelectorAll('a.effect-opt').forEach((a) => a.addEventListener('click', close));
  d.addEventListener('click', (ev) => { if (ev.target === d) close(); });
  d.querySelector('[data-none]')?.addEventListener('click', () => { setEffect(null); close(); });
  d.querySelectorAll('[data-eff]').forEach((b) => b.addEventListener('click', () => {
    const e = effectById[b.dataset.eff];
    setEffect(e.id);
    close();
    onPick?.(e);
  }));
  d.showModal();
}

/** The toolbar button (shows the active effect's name). */
export function effectButtonHtml() {
  const e = getEffect();
  return `<button class="toggle effect-btn ${e ? 'on' : ''}" data-effect-open>🧪 ${e ? `${e.icon} ${esc(T(e.name))}` : esc(L('Apply an effect', 'הפעלת השפעה'))}</button>`;
}
