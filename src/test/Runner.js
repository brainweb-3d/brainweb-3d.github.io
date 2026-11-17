// Runs a test: one question per screen, instant feedback, results by subsection at the end.
import './test.css';
import { BrainScene } from '../brain/BrainScene.js';
import { lessonById, chapterByN, regionById, shuffle } from '../../content/index.js';
import { recordQuiz, recordLessonStats } from '../store.js';
import { ui, t, getLang } from '../i18n.js';
import { esc, tt } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
let brain = null; // one 3D brain shared by all "label" questions of a test

export function disposeRunner() {
  brain?.dispose();
  brain = null;
}

/** Link to the 3D view for a question's subsection. */
export function exploreLink(q) {
  if (q.regionId) return `#/explore/organ/${q.regionId}`;
  const regions = lessonById[q.lessonId]?.regions || [];
  return regions.length ? `#/explore/organ/${regions.slice(0, 4).join(',')}` : '#/explore';
}

/**
 * @param app        container
 * @param questions  from questionBank.buildTest or an AI test
 * @param opts       { title, key (for saving scores), back, retry(), timerMinutes }
 */
export function runTest(app, questions, opts) {
  disposeRunner();
  let idx = 0;
  const results = []; // { q, correct }
  const started = Date.now();
  const deadline = opts.timerMinutes ? started + opts.timerMinutes * 60000 : null;
  let tick = null;

  function header() {
    return `<div class="run-head">
      <a href="${opts.back}" class="run-close" aria-label="${esc(L('Leave test', 'יציאה מהמבחן'))}" title="${esc(L('Leave test', 'יציאה מהמבחן'))}">✕</a>
      <div class="run-meta"><div class="run-title">${esc(opts.title)}</div>
        <div class="run-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="${idx}"><span style="width:${(idx / questions.length) * 100}%"></span></div></div>
      ${deadline ? `<span class="run-pill" id="timer"></span>` : ''}
      <span class="run-pill" aria-label="${esc(ui('questionOf'))} ${idx + 1} ${esc(ui('of'))} ${questions.length}">${idx + 1}/${questions.length}</span></div>
      ${idx === 0 && opts.intro ? `<div class="note-card">${esc(opts.intro)}</div>` : ''}`;
  }

  function updateTimer() {
    const el = app.querySelector('#timer');
    if (!deadline || !el) return;
    const left = Math.max(0, deadline - Date.now());
    el.textContent = `⏱ ${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`;
    if (!left) finish();
  }

  function show() {
    if (idx >= questions.length) return finish();
    const q = questions[idx];
    const lesson = lessonById[q.lessonId];
    app.innerHTML = `<div class="tv run">${header()}
      <article class="q-card2">
        <div class="q-ctx">${lesson ? `${esc(ui('chapter'))} ${lesson.chapter} · ${lesson.id} ${tt(lesson.title)}` : esc(q.topic ? t(q.topic) : '')}</div>
        <p class="q-text2">${tt(q.q)}</p>
        <div id="qBody"></div>
        <div class="feedback2" hidden aria-live="polite"></div>
        <div class="run-actions"><button class="tv-primary" id="check" hidden>${esc(ui('checkAnswers'))}</button><button class="tv-primary" id="nextQ" hidden>${esc(idx + 1 < questions.length ? ui('next') : L('See results', 'לתוצאות'))} <span class="dir-arrow" aria-hidden="true">→</span></button></div>
      </article></div>`;
    const body = app.querySelector('#qBody');
    const check = app.querySelector('#check');
    const next = app.querySelector('#nextQ');
    const done = (correct, extra = '') => {
      results.push({ q, correct });
      const fb = app.querySelector('.feedback2');
      fb.hidden = false;
      fb.classList.add(correct ? 'ok' : 'bad');
      fb.innerHTML = `<div class="fb-title">${correct ? '✓' : '✗'} ${esc(correct ? ui('correct') : ui('wrong'))}</div>${extra || q.why ? `<div class="fb-text">${extra}${q.why ? ' ' + tt(q.why) : ''}</div>` : ''}
        <a class="fb-link" href="${exploreLink(q)}" target="_blank">🔭 ${esc(L('See it in Explore', 'צפייה בחקירה התלת-ממדית'))} ↗</a>`;
      check.hidden = true;
      next.hidden = false;
      next.focus();
    };
    next.addEventListener('click', () => { idx++; show(); });
    ({ mc: renderMc, match: renderMatch, order: renderOrder, label: renderLabel })[q.type](body, q, check, done);
    updateTimer();
  }

  function finish() {
    clearInterval(tick);
    disposeRunner();
    // Questions not reached (timer ran out) count as wrong
    for (let k = results.length; k < questions.length; k++) results.push({ q: questions[k], correct: false });
    const score = results.filter((r) => r.correct).length;
    const pct = Math.round((score / questions.length) * 100);
    const bySub = new Map();
    for (const r of results) {
      const key = r.q.lessonId || 'ai';
      const s = bySub.get(key) || { right: 0, total: 0 };
      s.total++; if (r.correct) s.right++;
      bySub.set(key, s);
    }
    if (opts.key) recordQuiz(opts.key, pct, [...new Set(results.filter((r) => !r.correct).map((r) => r.q.lessonId).filter(Boolean))]);
    recordLessonStats([...bySub].filter(([k]) => lessonById[k]));
    opts.onFinish?.(pct);
    const msg = pct >= 90 ? L('Excellent!', 'מצוין!') : pct >= 70 ? L('Well done!', 'כל הכבוד!') : pct >= 50 ? L('Getting there', 'בדרך הנכונה') : L('Keep practising', 'כדאי להמשיך לתרגל');
    const tone = pct >= 70 ? 'good' : pct >= 50 ? 'warn' : 'bad';
    const wrongCount = results.length - score;
    app.innerHTML = `<div class="tv run">
      <div class="run-head"><a href="${opts.back}" class="run-close" aria-label="${esc(L('Close', 'סגירה'))}" title="${esc(L('Close', 'סגירה'))}">✕</a>
        <div class="run-meta"><div class="run-title">${esc(opts.title)}</div></div></div>
      <section class="result-hero">
        <div class="ring ${tone}" style="--p:${pct}" role="img" aria-label="${esc(ui('yourScore'))} ${pct}%"><span>${pct}%</span></div>
        <div class="result-msg">${esc(msg)}</div>
        <div class="muted">${score} / ${questions.length} ${esc(L('correct', 'נכונות'))}</div>
        <div class="result-actions">
          ${opts.retry ? `<button class="tv-primary" id="retry">↻ ${esc(ui('tryAgain'))}</button>` : ''}
          <a class="tv-secondary" href="${opts.back}">${esc(L('New test', 'מבחן חדש'))}</a>
        </div>
      </section>
      ${bySub.size > 1 ? `<section class="tv-panel">
        <h3 class="tv-sub">${esc(L('By subsection', 'לפי תת-פרק'))}</h3>
        ${[...bySub].map(([k, s]) => { const l = lessonById[k]; return `<div class="sub-line"><span class="nm">${l ? `<b>${l.id}</b> ${tt(l.title)}` : esc(opts.title)}</span>
          <span class="bar"><span style="width:${(s.right / s.total) * 100}%"></span></span><span class="pct muted">${s.right}/${s.total}</span></div>`; }).join('')}
      </section>` : ''}
      <section class="tv-panel">
        <h3 class="tv-sub">${esc(L('Review your answers', 'סקירת התשובות'))}${wrongCount ? ` <span class="muted small">· ${wrongCount} ${esc(L('to review', 'לחזרה'))}</span>` : ''}</h3>
        <div class="acc">${results.map((r, i) => `<details class="acc-item review2 ${r.correct ? 'ok' : 'bad'}"><summary><span class="mark" aria-label="${esc(r.correct ? ui('correct') : ui('wrong'))}">${r.correct ? '✓' : '✗'}</span><span class="nm">${i + 1}. ${tt(r.q.q)}</span><span class="chev" aria-hidden="true">›</span></summary>${reviewAnswer(r.q)}</details>`).join('')}</div>
      </section></div>`;
    app.querySelector('#retry')?.addEventListener('click', opts.retry);
  }

  if (deadline) tick = setInterval(updateTimer, 1000);
  show();
}

function reviewAnswer(q) {
  let a = '';
  if (q.type === 'mc') a = `<b>${esc(L('Answer', 'תשובה'))}:</b> ${esc(t(q.options)[q.answer])}`;
  if (q.type === 'match') a = `<ul>${q.pairs.map((p) => `<li><b>${tt(p.a)}</b> — ${tt(p.b)}</li>`).join('')}</ul>`;
  if (q.type === 'order') a = `<ol>${q.steps.map((s) => `<li>${tt(s)}</li>`).join('')}</ol>`;
  if (q.type === 'label') a = `<b>${esc(L('Answer', 'תשובה'))}:</b> ${tt(regionById[q.regionId]?.name)}`;
  return `<div class="review-body">${a}${q.why ? `<p class="muted">${tt(q.why)}</p>` : ''}<a href="${exploreLink(q)}" target="_blank">🔭 ${esc(L('See it in Explore', 'צפייה בחקירה התלת-ממדית'))} ↗</a></div>`;
}

// ---------------------------------------------------------------- multiple choice / true-false
function renderMc(body, q, check, done) {
  body.innerHTML = `<div class="options">${t(q.options).map((o, k) => `<button class="option" data-k="${k}"><span class="opt-key">${String.fromCharCode(65 + k)}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  body.querySelectorAll('.option').forEach((b) => b.addEventListener('click', () => {
    const k = +b.dataset.k;
    body.querySelectorAll('.option').forEach((o) => { o.disabled = true; if (+o.dataset.k === q.answer) o.classList.add('correct'); });
    if (k !== q.answer) b.classList.add('wrong');
    done(k === q.answer);
  }));
}

// ---------------------------------------------------------------- matching
function renderMatch(body, q, check, done) {
  const defs = shuffle(q.pairs.map((p, i) => ({ i, b: p.b })));
  const picks = {}; // term index → def index
  let active = null;
  body.innerHTML = `<p class="small muted">${esc(L('Tap a term, then the definition that fits it.', 'הקישו על מושג ואז על ההגדרה שמתאימה לו.'))}</p>
    <div class="match-grid">
      <div>${q.pairs.map((p, i) => `<button class="match-item term" data-t="${i}"><span class="tag"></span>${tt(p.a)}</button>`).join('')}</div>
      <div>${defs.map((d) => `<button class="match-item def" data-d="${d.i}"><span class="tag"></span>${tt(d.b)}</button>`).join('')}</div>
    </div>`;
  const letters = 'ABCDEFG';
  const paint = () => {
    body.querySelectorAll('[data-t]').forEach((el) => { const i = +el.dataset.t; el.classList.toggle('sel', active === i); el.querySelector('.tag').textContent = letters[i]; });
    body.querySelectorAll('[data-d]').forEach((el) => {
      const d = +el.dataset.d;
      const owner = Object.keys(picks).find((k) => picks[k] === d);
      el.querySelector('.tag').textContent = owner != null ? letters[owner] : '';
      el.classList.toggle('paired', owner != null);
    });
    check.hidden = Object.keys(picks).length < q.pairs.length;
  };
  body.querySelectorAll('[data-t]').forEach((el) => el.addEventListener('click', () => { active = +el.dataset.t; paint(); }));
  body.querySelectorAll('[data-d]').forEach((el) => el.addEventListener('click', () => {
    if (active == null) return;
    const d = +el.dataset.d;
    Object.keys(picks).forEach((k) => { if (picks[k] === d) delete picks[k]; });
    picks[active] = d;
    active = q.pairs.findIndex((_, i) => picks[i] == null);
    if (active < 0) active = null;
    paint();
  }));
  check.addEventListener('click', () => {
    let all = true;
    body.querySelectorAll('[data-d]').forEach((el) => {
      const d = +el.dataset.d;
      const owner = Object.keys(picks).find((k) => picks[k] === d);
      const ok = +owner === d;
      el.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) all = false;
      el.disabled = true;
    });
    body.querySelectorAll('[data-t]').forEach((el) => { el.disabled = true; });
    done(all, all ? '' : esc(L('Letters show your pairs; the review lists the correct ones.', 'האותיות מראות את ההתאמות שלכם; בסקירה מופיעות ההתאמות הנכונות.')));
  });
  paint();
}

// ---------------------------------------------------------------- ordering
function renderOrder(body, q, check, done) {
  let items = shuffle(q.steps.map((s, i) => ({ i, s })));
  if (items.every((x, k) => x.i === k)) items.reverse();
  const draw = () => {
    body.innerHTML = `<p class="small muted">${esc(L('Use the arrows to put the steps in order (first at the top).', 'השתמשו בחצים כדי לסדר את השלבים (הראשון למעלה).'))}</p>
      <ol class="order-list">${items.map((x, k) => `<li data-i="${x.i}"><span class="num">${k + 1}</span><span class="txt">${tt(x.s)}</span>
        <button class="icon-btn" data-up="${k}" ${k === 0 ? 'disabled' : ''} aria-label="up">▲</button>
        <button class="icon-btn" data-down="${k}" ${k === items.length - 1 ? 'disabled' : ''} aria-label="down">▼</button></li>`).join('')}</ol>`;
    body.querySelectorAll('[data-up]').forEach((b) => b.addEventListener('click', () => { const k = +b.dataset.up; [items[k - 1], items[k]] = [items[k], items[k - 1]]; draw(); }));
    body.querySelectorAll('[data-down]').forEach((b) => b.addEventListener('click', () => { const k = +b.dataset.down; [items[k + 1], items[k]] = [items[k], items[k + 1]]; draw(); }));
  };
  draw();
  check.hidden = false;
  check.addEventListener('click', () => {
    let all = true;
    body.querySelectorAll('.order-list li').forEach((li, k) => {
      const ok = +li.dataset.i === k;
      li.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) all = false;
      li.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    });
    done(all, all ? '' : `<ol class="small">${q.steps.map((s) => `<li>${tt(s)}</li>`).join('')}</ol>`);
  });
}

// ---------------------------------------------------------------- label the 3D brain
function renderLabel(body, q, check, done) {
  body.innerHTML = `<p class="small muted">${esc(L('Rotate the brain and click the structure. Tip: "See-through" shows the deep parts.', 'סובבו את המוח ולחצו על המבנה. טיפ: "שקוף" מראה את החלקים העמוקים.'))}</p>
    <div class="row" style="margin-bottom:6px"><button class="toggle" id="see">👁 ${esc(ui('seeThrough'))}</button></div>
    <div class="label3d-stage" id="stage"></div><div class="small muted" id="hoverName" style="min-height:1.4em"></div>`;
  const holder = body.querySelector('#stage');
  if (!brain) {
    brain = new BrainScene(holder, { mini: true });
  } else {
    holder.appendChild(brain.renderer.domElement);
    brain.container = holder;
    brain.resizeObserver.disconnect();
    brain.resizeObserver.observe(holder);
    brain.resize();
  }
  brain.setActive(true);
  brain.stopPathway();
  brain.focus([], { fly: false });
  brain.select(null);
  brain.resetView();
  let see = false;
  body.querySelector('#see').addEventListener('click', (e) => { see = !see; e.currentTarget.classList.toggle('on', see); brain.setSeeThrough(see); });
  brain.setSeeThrough(false);
  let answered = false;
  brain.on('hover', (id) => { if (!answered) body.querySelector('#hoverName').textContent = id ? '…' : ''; });
  brain.on('select', (id) => {
    if (answered || !id) return;
    answered = true;
    const ok = id === q.regionId;
    brain.focus([q.regionId]);
    brain.select(q.regionId);
    body.querySelector('#hoverName').textContent = ok ? '' : `${L('You clicked', 'לחצתם על')}: ${t(regionById[id]?.name || { en: id })}`;
    done(ok, ok ? '' : `${esc(L('The highlighted part is the', 'החלק המודגש הוא'))} <b>${tt(regionById[q.regionId].name)}</b>.`);
  });
}
