// "Test yourself": premade tests (by chapter & subsection), AI test from a lecture, flashcards, progress.
import './test.css';
import { chapters, chapterByN, lessonById, allLessons } from '../../content/index.js';
import { buildTest, availability, TYPES, TYPE_NAMES } from './questionBank.js';
import { runTest, disposeRunner } from './Runner.js';
import { renderAiTest } from './aiTest.js';
import { renderFlashcards, dueCount } from '../practice/Flashcards.js';
import { getQuizResults, getLessonStats, getStreak, resetAll, load, save } from '../store.js';
import { ui, t, getLang } from '../i18n.js';
import { esc, tt } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const COUNTS = [5, 10, 15, 20, 30, 50];
const TIMERS = [0, 5, 10, 20, 30];

export function cleanupTest() { disposeRunner(); }

export function renderTestPage(app, tab = 'premade', arg) {
  const tabs = [
    ['premade', '📝', L('Tests', 'מבחנים')],
    ['ai', '✨', L('From a lecture', 'מהרצאה')],
    ['cards', '🃏', ui('flashcards')],
    ['progress', '📈', L('Progress', 'התקדמות')],
  ];
  // A running flashcard deck gets the whole page (no tabs) so it stays calm and focused.
  if (tab === 'cards' && arg) {
    app.innerHTML = '<div class="tv" id="tabBody"></div>';
    renderFlashcards(app.querySelector('#tabBody'), arg);
    return;
  }
  app.innerHTML = `<div class="tv">
    <header class="tv-head"><h1>${esc(L('Test yourself', 'בחנו את עצמכם'))}</h1></header>
    <nav class="tv-tabs" aria-label="${esc(L('Test yourself', 'בחנו את עצמכם'))}">${tabs.map(([id, icon, name]) => `<a href="#/test${id === 'premade' ? '' : '/' + id}" class="${tab === id ? 'on' : ''}" ${tab === id ? 'aria-current="page"' : ''}><span class="ic" aria-hidden="true">${icon}</span><span>${esc(name)}</span></a>`).join('')}</nav>
    <div id="tabBody" class="tv-body"></div></div>`;
  const body = app.querySelector('#tabBody');
  if (tab === 'premade') renderPremade(body, app);
  else if (tab === 'ai') renderAiTest(body, app);
  else if (tab === 'cards') renderDeckChooser(body);
  else if (tab === 'progress') renderProgress(body, app);
}

// ---------------------------------------------------------------- premade tests
function renderPremade(body, app) {
  const saved = load('testSetup', {});
  let chapter = saved.chapter ?? 'all';
  if (chapter !== 'all' && !chapterByN[chapter]) chapter = 'all';
  let selected = new Set(saved.lessons || []);
  let count = saved.count || 10;
  let types = new Set(saved.types || ['mc', 'match', 'order', 'label']);
  let timer = saved.timer || 0;
  let open = null; // which panel is expanded: 'chapter' | 'subs' | 'opts' | null

  const lessonsOf = (c) => (c === 'all' ? allLessons : chapterByN[c].lessons);
  if (!selected.size || ![...selected].every((id) => lessonById[id])) selected = new Set(lessonsOf(chapter).map((l) => l.id));

  const chapterLabel = () => (chapter === 'all'
    ? `📚 ${esc(L('Whole book', 'כל הספר'))}`
    : `${chapterByN[chapter].icon} ${chapter}. ${tt(chapterByN[chapter].title)}`);

  function draw() {
    const av = availability([...selected]);
    const best = getQuizResults();
    const useTypes = [...types].filter((ty) => av[ty]);
    const canStart = selected.size && useTypes.length;
    const subs = chapter === 'all' ? [] : chapterByN[chapter].lessons;
    const subsSummary = selected.size === subs.length
      ? L(`All ${subs.length} subsections`, `כל ${subs.length} תת-הפרקים`)
      : selected.size ? [...selected].join(', ') : L('None chosen', 'לא נבחר דבר');
    const optsSummary = [
      `${count} ${L('questions', 'שאלות')}`,
      useTypes.length === TYPES.filter((ty) => av[ty]).length ? L('all types', 'כל הסוגים') : `${useTypes.length} ${L('types', 'סוגים')}`,
      timer ? `⏱ ${timer} ${L('min', 'דק׳')}` : L('no timer', 'ללא טיימר'),
    ].join(' · ');
    const bestKey = chapter === 'all' ? 'all' : 'ch' + chapter;

    body.innerHTML = `
      <section class="tv-panel quick-panel">
        <button class="tv-primary tv-quick" id="quick">⚡ ${esc(L('Start a quick test', 'התחלת מבחן מהיר'))}</button>
        <p class="small muted center">${esc(L('10 questions from the whole book', '10 שאלות מכל הספר'))}</p>
      </section>
      <section class="tv-panel setup-panel">
        <h2 class="tv-title">${esc(L('Or choose what to practise', 'או בחרו על מה להתאמן'))}</h2>

        <div class="pick-row ${open === 'chapter' ? 'open' : ''}">
          <button class="pick-head" data-open="chapter" aria-expanded="${open === 'chapter'}">
            <span class="pick-label">${esc(L('Topic', 'נושא'))}</span>
            <span class="pick-value">${chapterLabel()}${best[bestKey] ? ` <span class="best">🏅 ${best[bestKey].best}%</span>` : ''}</span>
            <span class="pick-change">${esc(open === 'chapter' ? L('Close', 'סגירה') : L('Change', 'שינוי'))}</span>
          </button>
          ${open === 'chapter' ? `<div class="pick-body ch-list" role="listbox">
            <button class="ch-opt ${chapter === 'all' ? 'on' : ''}" data-ch="all" role="option" aria-selected="${chapter === 'all'}"><span class="ic">📚</span><span class="nm">${esc(L('Whole book', 'כל הספר'))}</span>${best.all ? `<span class="best">${best.all.best}%</span>` : ''}</button>
            ${chapters.map((c) => `<button class="ch-opt ${chapter === c.n ? 'on' : ''}" data-ch="${c.n}" role="option" aria-selected="${chapter === c.n}"><span class="ic">${c.icon}</span><span class="nm"><b>${c.n}.</b> ${tt(c.title)}</span>${best['ch' + c.n] ? `<span class="best">${best['ch' + c.n].best}%</span>` : ''}</button>`).join('')}
          </div>` : ''}
        </div>

        ${chapter === 'all' ? '' : `<div class="pick-row ${open === 'subs' ? 'open' : ''}">
          <button class="pick-head" data-open="subs" aria-expanded="${open === 'subs'}">
            <span class="pick-label">${esc(L('Subsections', 'תת-פרקים'))}</span>
            <span class="pick-value">${esc(subsSummary)}</span>
            <span class="pick-change">${esc(open === 'subs' ? L('Close', 'סגירה') : L('Change', 'שינוי'))}</span>
          </button>
          ${open === 'subs' ? `<div class="pick-body">
            <div class="check-list">${subs.map((l) => `<label class="check"><input type="checkbox" data-l="${l.id}" ${selected.has(l.id) ? 'checked' : ''}/><span><b>${l.id}</b> ${tt(l.title)}</span></label>`).join('')}</div>
            <button class="link-btn" id="toggleAll">${esc(selected.size === subs.length ? L('Clear all', 'ניקוי הכול') : L('Select all', 'בחירת הכול'))}</button>
          </div>` : ''}
        </div>`}

        <div class="pick-row ${open === 'opts' ? 'open' : ''}">
          <button class="pick-head" data-open="opts" aria-expanded="${open === 'opts'}">
            <span class="pick-label">${esc(L('Options', 'אפשרויות'))}</span>
            <span class="pick-value">${esc(optsSummary)}</span>
            <span class="pick-change">${esc(open === 'opts' ? L('Close', 'סגירה') : L('Change', 'שינוי'))}</span>
          </button>
          ${open === 'opts' ? `<div class="pick-body">
            <div class="opt-group"><div class="opt-name">${esc(L('Number of questions', 'מספר שאלות'))}</div>
              <div class="seg" role="radiogroup">${COUNTS.map((n) => `<button role="radio" aria-checked="${n === count}" class="${n === count ? 'on' : ''}" data-count="${n}">${n}</button>`).join('')}</div></div>
            <div class="opt-group"><div class="opt-name">${esc(L('Timer', 'טיימר'))}</div>
              <div class="seg" role="radiogroup">${TIMERS.map((n) => `<button role="radio" aria-checked="${n === timer}" class="${n === timer ? 'on' : ''}" data-timer="${n}">${n ? `${n} ${esc(L('min', 'דק׳'))}` : esc(L('Off', 'ללא'))}</button>`).join('')}</div></div>
            <div class="opt-group"><div class="opt-name">${esc(L('Question types', 'סוגי שאלות'))}</div>
              <div class="check-list">${TYPES.map((ty) => `<label class="check ${av[ty] ? '' : 'off'}"><input type="checkbox" data-ty="${ty}" ${types.has(ty) && av[ty] ? 'checked' : ''} ${av[ty] ? '' : 'disabled'}/><span>${tt(TYPE_NAMES[ty])} <span class="muted small">(${av[ty]})</span></span></label>`).join('')}</div></div>
          </div>` : ''}
        </div>

        <button class="tv-primary" id="start" ${canStart ? '' : 'disabled'}>${esc(L('Start test', 'התחלת מבחן'))}</button>
        ${canStart ? '' : `<p class="small muted center">${esc(selected.size ? L('Choose at least one question type.', 'בחרו לפחות סוג שאלה אחד.') : L('Choose at least one subsection.', 'בחרו לפחות תת-פרק אחד.'))}</p>`}
      </section>`;

    body.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => { open = open === b.dataset.open ? null : b.dataset.open; draw(); }));
    body.querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => {
      chapter = b.dataset.ch === 'all' ? 'all' : +b.dataset.ch;
      selected = new Set(lessonsOf(chapter).map((l) => l.id));
      open = null;
      draw();
      body.querySelector('#start')?.focus();
    }));
    body.querySelectorAll('[data-l]').forEach((c) => c.addEventListener('change', () => { c.checked ? selected.add(c.dataset.l) : selected.delete(c.dataset.l); draw(); }));
    body.querySelector('#toggleAll')?.addEventListener('click', () => {
      const all = chapterByN[chapter].lessons.map((l) => l.id);
      selected = selected.size === all.length ? new Set() : new Set(all);
      draw();
    });
    body.querySelectorAll('[data-ty]').forEach((c) => c.addEventListener('change', () => { c.checked ? types.add(c.dataset.ty) : types.delete(c.dataset.ty); draw(); }));
    body.querySelectorAll('[data-count]').forEach((b) => b.addEventListener('click', () => { count = +b.dataset.count; draw(); }));
    body.querySelectorAll('[data-timer]').forEach((b) => b.addEventListener('click', () => { timer = +b.dataset.timer; draw(); }));
    body.querySelector('#start').addEventListener('click', start);
    body.querySelector('#quick').addEventListener('click', quick);
  }

  /** One click: 10 mixed questions from the whole book (does not change the saved setup). */
  function quick() {
    const ids = allLessons.map((l) => l.id);
    const av = availability(ids);
    const useTypes = TYPES.filter((ty) => av[ty]);
    const go = () => runTest(app, buildTest(ids, 10, useTypes), { title: L('Quick test', 'מבחן מהיר'), key: 'all', back: '#/test', retry: go, timerMinutes: 0 });
    go();
  }

  function start() {
    save('testSetup', { chapter, lessons: [...selected], count, types: [...types], timer });
    const av = availability([...selected]);
    const useTypes = [...types].filter((ty) => av[ty]);
    const go = () => {
      const qs = buildTest([...selected], count, useTypes);
      const title = chapter === 'all' ? L('Whole-book test', 'מבחן על כל הספר') : `${chapterByN[chapter].icon} ${L('Chapter', 'פרק')} ${chapter}: ${t(chapterByN[chapter].title)}`;
      runTest(app, qs, { title, key: chapter === 'all' ? 'all' : 'ch' + chapter, back: '#/test', retry: go, timerMinutes: timer });
    };
    go();
  }
  draw();
}

/** Start a test on given subsections straight away (used by Progress → "practice"). */
export function quickTest(app, lessonIds, title) {
  const go = () => runTest(app, buildTest(lessonIds, 10, TYPES), { title, key: null, back: '#/test/progress', retry: go });
  go();
}

// ---------------------------------------------------------------- flashcards
function renderDeckChooser(body) {
  const allDue = dueCount(allLessons);
  body.innerHTML = `
    <section class="tv-panel deck-hero">
      <div class="deck-hero-txt">
        <h2 class="tv-title">${esc(L('Review flashcards', 'חזרה עם כרטיסיות'))}</h2>
        <p class="muted">${allDue ? `<b class="due-num">${allDue}</b> ${esc(ui('cardsDue'))}` : esc(L('Nothing due right now.', 'אין כרגע כרטיסיות לחזרה.'))}</p>
      </div>
      <a class="tv-primary" href="#/test/cards/all">${esc(L('Start review', 'התחלת חזרה'))}</a>
    </section>
    <h3 class="tv-sub">${esc(L('Or pick a chapter', 'או בחרו פרק'))}</h3>
    <div class="list">${chapters.map((c) => { const d = dueCount(c.lessons); return `<a class="list-row" href="#/test/cards/${c.n}">
      <span class="ic">${c.icon}</span><span class="nm"><b>${c.n}.</b> ${tt(c.title)}</span>
      <span class="due ${d ? '' : 'zero'}" title="${esc(ui('cardsDue'))}">${d}</span><span class="chev" aria-hidden="true">›</span></a>`; }).join('')}</div>`;
}

// ---------------------------------------------------------------- progress
function renderProgress(body, app) {
  const stats = getLessonStats();
  const quiz = getQuizResults();
  const tested = allLessons.filter((l) => stats[l.id]);
  const weak = tested.filter((l) => stats[l.id].right / stats[l.id].total < 0.7).sort((a, b) => stats[a.id].right / stats[a.id].total - stats[b.id].right / stats[b.id].total).slice(0, 8);
  const pct = (s) => Math.round((s.right / s.total) * 100);
  body.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="stat-num">${tested.length}<span class="muted">/${allLessons.length}</span></div><div class="stat-lbl">${esc(L('subsections tested', 'תת-פרקים שנבחנו'))}</div></div>
      <div class="stat"><div class="stat-num">${getStreak()}</div><div class="stat-lbl">🔥 ${esc(ui('streak'))}</div></div>
      <a class="stat link" href="#/test/cards/all"><div class="stat-num">${dueCount(allLessons)}</div><div class="stat-lbl">🃏 ${esc(ui('cardsDue'))}</div></a>
    </div>
    <section class="tv-panel">
      <h2 class="tv-title">${esc(ui('weakTopics'))}</h2>
      ${weak.length ? `<div class="list flat">${weak.map((l) => `<div class="list-row">
        <span class="nm"><b>${l.id}</b> ${tt(l.title)}</span><span class="pct bad">${pct(stats[l.id])}%</span>
        <button class="tv-btn" data-practice="${l.id}">${esc(L('Practise', 'תרגול'))}</button></div>`).join('')}</div>` : `<p class="muted">${esc(ui('noWeak'))}</p>`}
    </section>
    <section class="tv-panel">
      <h2 class="tv-title">${esc(ui('chapters'))}</h2>
      <div class="acc">${chapters.map((c) => `<details class="acc-item"><summary><span class="ic">${c.icon}</span><span class="nm"><b>${c.n}.</b> ${tt(c.title)}</span>${quiz['ch' + c.n] ? `<span class="pct">🏅 ${quiz['ch' + c.n].best}%</span>` : ''}<span class="chev" aria-hidden="true">›</span></summary>
        ${c.lessons.map((l) => { const s = stats[l.id]; return `<div class="sub-line"><span class="nm"><b>${l.id}</b> ${tt(l.title)}</span>
          <span class="bar"><span style="width:${s ? pct(s) : 0}%"></span></span><span class="pct muted">${s ? pct(s) + '%' : '—'}</span>
          <button class="icon-round" data-practice="${l.id}" aria-label="${esc(L('Practise', 'תרגול'))} ${l.id}" title="${esc(L('Practise', 'תרגול'))}">▶</button></div>`; }).join('')}</details>`).join('')}</div>
    </section>
    <div class="center"><button class="link-btn danger" id="reset">${esc(ui('resetProgress'))}</button></div>`;
  body.querySelectorAll('[data-practice]').forEach((b) => b.addEventListener('click', () => {
    const l = lessonById[b.dataset.practice];
    quickTest(app, [l.id], `${l.id} ${t(l.title)}`);
  }));
  body.querySelector('#reset').addEventListener('click', () => { if (confirm(ui('confirmReset'))) { resetAll(); renderProgress(body, app); } });
}
