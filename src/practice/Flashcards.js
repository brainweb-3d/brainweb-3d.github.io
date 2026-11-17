// Flashcards with spaced repetition (a simple "Leitner box" system):
// cards you know well come back after longer and longer gaps; cards you miss come back soon.
import { load, save, touchStreak } from '../store.js';
import { resolveDeck } from './decks.js';
import '../test/test.css';
import { ui, getLang } from '../i18n.js';
import { esc, tt } from '../util.js';
import { shuffle } from '../../content/index.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const DAY = 864e5;
const INTERVALS = [0, 1, 2, 4, 8, 16, 32]; // days for boxes 0..6

const getSched = () => load('cards', {});
const isDue = (sched, id) => !sched[id] || sched[id].due <= Date.now();

export function dueCount(lessons) {
  const sched = getSched();
  return lessons.flatMap((l) => l.cards).filter((c) => isDue(sched, c.id)).length;
}

export function renderFlashcards(app, deck, { all = false } = {}) {
  const { lessons, title, back } = resolveDeck(deck);
  const sched = getSched();
  const pool = lessons.flatMap((l) => l.cards);
  let queue = shuffle(all ? pool : pool.filter((c) => isDue(sched, c.id)));
  let doneCount = 0;
  const total = queue.length;

  function show() {
    if (!queue.length) {
      app.innerHTML = `<div class="tv run fc-run">
        <div class="run-head"><a href="${back}" class="run-close" aria-label="${esc(L('Close', 'סגירה'))}" title="${esc(L('Close', 'סגירה'))}">✕</a>
          <div class="run-meta"><div class="run-title">${esc(title)}</div></div></div>
        <section class="result-hero">
          <div class="done-ic" aria-hidden="true">🎉</div>
          <p class="result-msg">${esc(ui('deckDone'))}</p>
          <div class="result-actions">
            <a class="tv-primary" href="${back}">${esc(L('Done', 'סיום'))}</a>
            <button class="tv-secondary" id="again">${esc(ui('practiceAll'))}</button>
          </div>
          <a class="small" href="#/test">📝 ${esc(L('Take a test instead', 'או לעשות מבחן'))}</a>
        </section></div>`;
      app.querySelector('#again').addEventListener('click', () => renderFlashcards(app, deck, { all: true }));
      return;
    }
    const card = queue[0];
    app.innerHTML = `<div class="tv run fc-run">
      <div class="run-head"><a href="${back}" class="run-close" aria-label="${esc(L('Close', 'סגירה'))}" title="${esc(L('Close', 'סגירה'))}">✕</a>
        <div class="run-meta"><div class="run-title">${esc(title)}</div>
          <div class="run-bar"><span style="width:${total ? (doneCount / total) * 100 : 0}%"></span></div></div>
        <span class="run-pill">${doneCount}/${total}</span></div>
      <div class="flashcard fc2" id="fc" tabindex="0" role="button" aria-label="${esc(ui('showAnswer'))}">
        <div class="flashcard-inner">
          <div class="flash-face"><b>${tt(card.front)}</b><span class="hint">${esc(L('Tap to see the answer', 'הקישו כדי לראות את התשובה'))}</span></div>
          <div class="flash-face back"><div><b>${tt(card.front)}</b><p>${tt(card.back)}</p></div></div>
        </div>
      </div>
      <div class="fc-actions">
        <button class="tv-primary" id="flipBtn">${esc(ui('showAnswer'))}</button>
        <div class="rate2" id="rate" hidden>
          <div class="rate-q">${esc(L('How well did you know it?', 'עד כמה ידעתם?'))}</div>
          <div class="rate-btns">
            <button class="r-again" data-r="0">${esc(ui('again'))}</button>
            <button class="r-hard" data-r="1">${esc(ui('hard'))}</button>
            <button class="r-good" data-r="2">${esc(ui('good'))}</button>
            <button class="r-easy" data-r="3">${esc(ui('easy'))}</button>
          </div>
        </div>
      </div>
      <p class="kbd-hint small muted">${esc(L('Keyboard: Space flips · 1–4 rates', 'מקלדת: רווח הופך · 1–4 דירוג'))}</p>
    </div>`;
    const fc = app.querySelector('#fc');
    const rate = app.querySelector('#rate');
    const flipBtn = app.querySelector('#flipBtn');
    const flip = () => { fc.classList.toggle('flipped'); rate.hidden = false; rate.style.visibility = 'visible'; flipBtn.hidden = true; };
    flipBtn.addEventListener('click', flip);
    fc.addEventListener('click', flip);
    fc.focus();
    rate.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => grade(card, +b.dataset.r)));
    keyHandler = (e) => {
      if (e.key === ' ') { e.preventDefault(); flip(); }
      if (['1', '2', '3', '4'].includes(e.key) && rate.style.visibility === 'visible') grade(card, +e.key - 1);
    };
  }

  function grade(card, r) {
    const s = getSched();
    const cur = s[card.id]?.box ?? 0;
    let box;
    if (r === 0) box = 0;
    else if (r === 1) box = Math.max(1, cur);
    else if (r === 2) box = Math.min(6, cur + 1);
    else box = Math.min(6, cur + 2);
    s[card.id] = { box, due: r === 0 ? Date.now() : Date.now() + INTERVALS[box] * DAY * (r === 1 ? 0.5 : 1) };
    save('cards', s);
    touchStreak();
    queue.shift();
    if (r === 0) queue.splice(Math.min(3, queue.length), 0, card); // see it again soon
    else doneCount++;
    show();
  }

  show();
}

// One keyboard handler at a time
let keyHandler = null;
document.addEventListener('keydown', (e) => {
  if (location.hash.startsWith('#/test/cards') && keyHandler) keyHandler(e);
});
