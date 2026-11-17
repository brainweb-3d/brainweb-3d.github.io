// "▶ Watch": one calm picker for everything you can play, instead of long lists in the info panel.
// First screen: five big cards (guided stories, brain pathways, effects, research methods, all places); a card
// opens its list. "All places" is the map of every 3D place by size, so the levels themselves need no long lists.
import { PATHWAYS, PATHWAY_GROUPS } from '../brain/pathways.js';
import { STORIES } from '../../content/stories.js';
import { PLACES } from './graph.js';
import { LEVELS } from '../visual/levels/index.js';
import { getLang } from '../i18n.js';
import { esc, tt } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);

/** `onEffect()` opens the existing effect picker (it needs Explore's current level). */
export function openWatch({ onEffect } = {}) {
  document.querySelector('dialog.watch-dialog')?.remove();
  const d = document.createElement('dialog');
  d.className = 'watch-dialog card';
  document.body.appendChild(d);
  const methods = Object.keys(PLACES).filter((k) => k.startsWith('methods/')).map((k) => ({ k, p: PLACES[k] }));

  const CARDS = [
    ['stories', '📖', L('Guided stories', 'סיפורים מודרכים'), L('Step by step through the levels', 'צעד אחר צעד בין הרמות')],
    ['paths', '⚡', L('Brain pathways', 'מסלולים במוח'), L('Watch a signal travel through the brain', 'צפו באות עובר במוח')],
    ['effects', '🧪', L('Effects', 'השפעות'), L('Drugs, diseases, body states', 'סמים, מחלות, מצבי גוף')],
    ['methods', '🔬', L('How scientists see the brain', 'איך מדענים רואים את המוח'), L('MRI, EEG, PET and more', 'MRI‏, EEG‏, PET ועוד')],
    ['places', '🗺️', L('All places', 'כל המקומות'), L('Every 3D place, from the body to the atom', 'כל המקומות בתלת-ממד, מהגוף ועד האטום')],
  ];
  const item = (href, icon, name, sub = '') => `<a class="wt-item" href="${href}"><span class="ic" aria-hidden="true">${icon}</span><span><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</span></a>`;

  function draw(view) {
    let body;
    if (!view) {
      body = `<div class="wt-cards">${CARDS.map(([id, ic, name, sub]) => `<button class="wt-card" data-v="${id}"><span class="ic" aria-hidden="true">${ic}</span><b>${esc(name)}</b><small>${esc(sub)}</small></button>`).join('')}</div>`;
    } else if (view === 'stories') {
      body = `<div class="wt-list">${STORIES.map((s) => item(`#/story/${s.id}`, s.icon, tt(s.title), `${s.steps.length} ${esc(L('steps', 'שלבים'))}`)).join('')}</div>`;
    } else if (view === 'paths') {
      body = Object.entries(PATHWAY_GROUPS).map(([g, label]) => `<h4>${tt(label)}</h4><div class="wt-list">${PATHWAYS.filter((p) => p.group === g).map((p) => item(`#/explore/organ/path/${p.id}`, p.icon, tt(p.name))).join('')}</div>`).join('');
    } else if (view === 'places') {
      // biggest first: body → organs → … → atoms (the way a learner zooms in)
      body = [...LEVELS].reverse().map((lv) => {
        const keys = Object.keys(PLACES).filter((k) => PLACES[k].level === lv.id);
        return keys.length ? `<h4>${lv.icon} ${tt(lv.name)}${lv.size ? ` · ${esc(lv.size)}` : ''}</h4><div class="wt-list">${keys.map((k) => item(`#/explore/${k === 'organ/brain' ? 'organ' : k}`, PLACES[k].icon || lv.icon, tt(PLACES[k].name))).join('')}</div>` : '';
      }).join('');
    } else if (view === 'methods') {
      body = `<div class="wt-list">${methods.map(({ k, p }) => item(`#/explore/${k}`, p.icon || '🔬', tt(p.name))).join('')}</div>`;
    }
    const title = view ? CARDS.find((c) => c[0] === view) : null;
    d.innerHTML = `<div class="wt-head">
        ${view ? `<button class="icon-btn" data-back aria-label="${esc(L('Back', 'חזרה'))}">${getLang() === 'he' ? '→' : '←'}</button>` : ''}
        <h3>${title ? `${title[1]} ${esc(title[2])}` : `▶ ${esc(L('Watch', 'צפייה'))}`}</h3><span class="spacer"></span>
        <button class="icon-btn" data-close aria-label="${esc(L('Close', 'סגירה'))}">✕</button></div>${body}`;
    d.querySelector('[data-close]').addEventListener('click', () => d.close());
    d.querySelector('[data-back]')?.addEventListener('click', () => draw(null));
    d.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.v === 'effects') { d.close(); onEffect?.(); } else draw(b.dataset.v);
    }));
    d.querySelectorAll('a.wt-item').forEach((a) => a.addEventListener('click', () => d.close()));
  }
  draw(null);
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); }); // click outside closes
  d.showModal();
}
