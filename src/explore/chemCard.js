// "Neurotransmitters involved": a small card over the 3D view while a pathway plays or an effect is applied.
// Each messenger shows what happens to it (⚡ carries the signal, ↑ more, ↓ less, ⛔ blocked, 🔑 copied); in a
// pathway the ones active in the current step light up. Hormones get their own section. Tapping a row shows one
// sentence and, for small-molecule transmitters, "See the molecule". The lists live in content/chemistry.js.
// The card can be folded into a pill (remembered); on phones it starts folded.
import { MESSENGERS, ROLES, PATHWAY_CHEM, EFFECT_CHEM } from '../../content/chemistry.js';
import { load, save } from '../store.js';
import { getLang } from '../i18n.js';
import { esc } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const T = (b) => (b ? L(b.en, b.he) : '');
const isPhone = () => window.innerWidth <= 720;
/** A messenger's name as HTML; in Hebrew, Latin bits like '5-HT' keep their own order (else they show as 'HT-5'). */
function nameHtml(m, short = false) {
  let n = T(m.name);
  if (short) n = n.replace(/\s*\(.*\)$/, '');
  n = esc(n);
  return getLang() === 'he' ? n.replace(/[A-Za-z0-9][A-Za-z0-9\-⁺]*/g, (x) => `<bdi>${x}</bdi>`) : n;
}

/**
 * What the card shows now, or null.
 * `context` (one transmitter, after 'See the molecule' or a dot that leads to it) wins while you stay where it led.
 * Then an applied effect, at every level, except on the brain while a different pathway plays (then: that pathway).
 */
export function chemNow({ atBrain, pathway, stage, effect, context }) {
  if (context) return { title: context.title, icon: context.icon, list: [context.item], active: null, from: true };
  if (effect && EFFECT_CHEM[effect.id] && (!atBrain || !pathway || effect.at?.organ?.path === pathway.id)) {
    return { title: effect.name, icon: effect.icon, list: EFFECT_CHEM[effect.id], active: null };
  }
  const p = atBrain && pathway && PATHWAY_CHEM[pathway.id];
  if (p) {
    const act = p.steps[stage] || [];
    return { title: pathway.name, icon: pathway.icon, list: p.list, active: act.length ? new Set(act) : null };
  }
  return null;
}

let openRow = null; // the messenger whose details are open

function rowHtml([id, role, note], active) {
  const m = MESSENGERS[id], r = ROLES[role];
  const dim = active && !active.has(id);
  const open = openRow === id;
  return `<li class="${dim ? 'dim' : ''} ${active?.has(id) ? 'now' : ''}">
    <button class="cc-row" data-cc="${id}" aria-expanded="${open}">
      <span class="cc-dot" style="background:${m.color}"></span>
      <span class="cc-name">${nameHtml(m)}${note ? `<small class="cc-why">${esc(T(note))}</small>` : ''}</span>
      <span class="cc-role" title="${esc(T(r.name))}"><span aria-hidden="true">${r.icon}</span>${role === 'active' ? `<span class="sr-only">${esc(T(r.name))}</span>` : ` ${esc(T(r.name))}`}</span>
    </button>
    ${open ? `<div class="cc-more">
      <p><span class="cc-gen">${esc(L('In general:', 'באופן כללי:'))}</span> ${esc(T(m.short))}</p>
      ${m.molecule && !current?.from ? `<button class="btn ghost sm" data-ccmol="${m.molecule}">🔬 ${esc(L('See the molecule', 'לראות את המולקולה'))}</button>` : ''}
    </div>` : ''}
  </li>`;
}

let current = null; // what the card shows (for 'See the molecule': the role note goes along)

/** Card HTML ('' when there is nothing to show). */
export function chemCardHtml(info) {
  current = info;
  if (!info) return '';
  if (info.from && openRow === null) openRow = info.list[0][0];
  const nts = info.list.filter(([id]) => MESSENGERS[id].kind === 'nt');
  const hormones = info.list.filter(([id]) => MESSENGERS[id].kind === 'hormone');
  const folded = load('chemFolded', null) ?? isPhone();
  const all = [...nts, ...hormones];
  if (folded) {
    const pill = all.map(([id, role]) => `<span class="cc-chip"><span class="cc-dot" style="background:${MESSENGERS[id].color}"></span>${nameHtml(MESSENGERS[id], true)} ${ROLES[role].icon}</span>`).join('');
    return `<button class="cc-pill" data-ccfold="0" aria-expanded="false" aria-label="${esc(L('Show the chemical messengers involved', 'הצגת השליחים הכימיים המעורבים'))}"><span aria-hidden="true">🧪</span>${pill}</button>`;
  }
  const sec = (title, list) => (list.length ? `${title ? `<h5>${esc(title)}</h5>` : ''}<ul>${list.map((x) => rowHtml(x, info.active)).join('')}</ul>` : '');
  return `<section class="cc-card" aria-label="${esc(L('Chemical messengers involved', 'שליחים כימיים מעורבים'))}">
    <div class="cc-head"><b>🧪 ${esc(nts.length ? L('Neurotransmitters involved', 'מוליכים עצביים מעורבים') : L('Hormones involved', 'הורמונים מעורבים'))}</b>
      <button class="icon-btn" data-ccfold="1" aria-label="${esc(L('Fold', 'קיפול'))}" aria-expanded="true">–</button></div>
    <div class="cc-sub">${info.from ? esc(L('In: ', 'ב: ')) : ''}${info.icon || ''} ${esc(T(info.title))}${info.active ? ` · <span class="cc-step">${esc(L('lit: this step', 'מודגש: השלב הזה'))}</span>` : ''}</div>
    ${sec('', nts)}
    ${sec(nts.length ? L('Hormones (carried by the blood)', 'הורמונים (נישאים בדם)') : '', hormones)}
  </section>`;
}

/** Wire the card's buttons. `onMolecule(id, context)` opens the molecule scene with that transmitter on its own;
 *  `context` = { title, icon, item } so the card there still says what it does in the place you came from. */
export function bindChemCard(el, { rerender, onMolecule }) {
  el.querySelectorAll('[data-ccfold]').forEach((b) => b.addEventListener('click', () => { save('chemFolded', b.dataset.ccfold === '1'); rerender(); }));
  el.querySelectorAll('[data-cc]').forEach((b) => b.addEventListener('click', () => { openRow = openRow === b.dataset.cc ? null : b.dataset.cc; rerender(); }));
  el.querySelectorAll('[data-ccmol]').forEach((b) => b.addEventListener('click', () => {
    const id = b.closest('li')?.querySelector('[data-cc]')?.dataset.cc;
    const item = current?.list.find((x) => x[0] === id);
    onMolecule(b.dataset.ccmol, item && current && !current.from ? { title: current.title, icon: current.icon, item } : null);
  }));
}
