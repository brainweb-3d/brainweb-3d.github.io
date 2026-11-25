// "Try it": a short version of the Attention Network Test (ANT; Fan, McCandliss, Sommer, Raz & Posner, 2002).
// Each trial: a fixation cross, sometimes a cue (*) for 100 ms, 400 ms later a row of five arrows above or below
// the cross. The user answers which way the MIDDLE arrow points (← / → keys or the two buttons).
// Cue types: none, center, double (both places), spatial (the place where the arrows will appear; always right).
// Flankers: congruent (→ → → → →) or incongruent (← ← → ← ←). Scores, from median correct reaction times:
//   alerting  = no cue − double cue        (being warned)
//   orienting = center cue − spatial cue   (knowing where)
//   executive = incongruent − congruent    (ignoring the distracting arrows)
// 4 practice trials with feedback, then 32 test trials (each cue × flanker × place × direction once): about 2 minutes.
// Afterwards each score has a "Show in 3D" button that plays that step of the attention networks animation.
import { getLang } from '../i18n.js';
import { esc } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const CUES = ['none', 'center', 'double', 'spatial'];
const FIX = [400, 1200], CUE_MS = 100, GAP_MS = 400, MAX_RT = 1700, BLANK_MS = 500;

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function median(xs) { if (!xs.length) return NaN; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

function makeTrials() {
  const out = [];
  for (const cue of CUES) for (const congruent of [true, false]) for (const up of [true, false]) for (const right of [true, false]) out.push({ cue, congruent, up, right });
  return shuffle(out);
}
const practiceTrials = () => shuffle(makeTrials()).slice(0, 4);

/** Network scores from the test trials (correct answers only, 150–1700 ms). */
export function scores(results) {
  const ok = results.filter((r) => r.correct && r.rt >= 150);
  const med = (f) => median(ok.filter(f).map((r) => r.rt));
  return {
    alerting: med((r) => r.cue === 'none') - med((r) => r.cue === 'double'),
    orienting: med((r) => r.cue === 'center') - med((r) => r.cue === 'spatial'),
    executive: med((r) => !r.congruent) - med((r) => r.congruent),
    rt: med(() => true),
    accuracy: results.length ? results.filter((r) => r.correct).length / results.length : 0,
  };
}

export function openAttentionTask() {
  document.querySelector('dialog.attn-dialog')?.remove();
  const d = document.createElement('dialog');
  d.className = 'attn-dialog card';
  d.setAttribute('aria-label', L('Attention test', 'מבחן קשב'));
  document.body.appendChild(d);
  let timers = [];
  let onKey = null, onVis = null;
  const later = (ms, fn) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const stopAll = () => {
    timers.forEach(clearTimeout); timers = [];
    if (onKey) document.removeEventListener('keydown', onKey);
    if (onVis) document.removeEventListener('visibilitychange', onVis);
    onKey = null; onVis = null;
  };
  d.addEventListener('close', () => { stopAll(); d.remove(); });

  const head = (title) => `<div class="attn-head"><h3>🔦 ${esc(title)}</h3><span class="spacer"></span><button class="icon-btn" data-close aria-label="${esc(L('Close', 'סגירה'))}">✕</button></div>`;
  const bindClose = () => d.querySelector('[data-close]')?.addEventListener('click', () => d.close());

  // ---------------------------------------------------------------- intro
  function intro() {
    stopAll();
    d.innerHTML = `${head(L('Test your attention networks', 'בדקו את רשתות הקשב שלכם'))}
      <p>${esc(L('Look at the + in the middle. A row of five arrows will appear above or below it. Answer which way the MIDDLE arrow points, as fast as you can without mistakes.', 'הסתכלו על ה-+ באמצע. שורה של חמישה חיצים תופיע מעליו או מתחתיו. ענו לאיזה כיוון מצביע החץ האמצעי, מהר ככל האפשר ובלי טעויות.'))}</p>
      <div class="attn-example" dir="ltr"><span>→ → <b>←</b> → →</span><small>${esc(L('Answer: ← (only the middle arrow counts)', 'תשובה: ← (רק החץ האמצעי קובע)'))}</small></div>
      <p>${esc(L('Sometimes a * flashes first: in the middle, in both places, or exactly where the arrows will appear. Use the ← and → keys, or tap the buttons.', 'לפעמים מהבהבת קודם *: באמצע, בשני המקומות, או בדיוק איפה שהחיצים יופיעו. השתמשו במקשי ← ו-→, או הקישו על הכפתורים.'))}</p>
      <p class="small muted">${esc(L('4 practice trials, then 32 real ones (about 2 minutes). Nothing is saved or sent anywhere.', '4 ניסיונות תרגול, ואז 32 אמיתיים (כ-2 דקות). שום דבר לא נשמר או נשלח.'))}</p>
      <div class="row"><button class="btn" data-start>${esc(L('Start practice', 'להתחיל תרגול'))}</button></div>`;
    bindClose();
    d.querySelector('[data-start]').addEventListener('click', () => run(practiceTrials(), true));
  }

  // ---------------------------------------------------------------- trials
  function run(trials, practice, prior = []) {
    stopAll();
    d.innerHTML = `${head(practice ? L('Practice', 'תרגול') : L('Attention test', 'מבחן קשב'))}
      <div class="attn-progress" aria-hidden="true"><i style="width:0%"></i></div>
      <div class="attn-stage" dir="ltr" aria-live="off">
        <div class="attn-slot up"></div><div class="attn-fix">+</div><div class="attn-slot down"></div>
        <div class="attn-cue c"></div>
      </div>
      <div class="attn-feedback" aria-live="polite"></div>
      <div class="attn-keys" dir="ltr"><button class="btn secondary" data-ans="left" aria-label="${esc(L('Left', 'שמאלה'))}">←</button><button class="btn secondary" data-ans="right" aria-label="${esc(L('Right', 'ימינה'))}">→</button></div>`;
    bindClose();
    const up = d.querySelector('.attn-slot.up'), down = d.querySelector('.attn-slot.down'), center = d.querySelector('.attn-cue.c');
    const fb = d.querySelector('.attn-feedback'), bar = d.querySelector('.attn-progress i');
    const results = [...prior];
    let i = 0, waiting = null; // waiting = { trial, t0 } while the arrows are on screen

    const answer = (right) => {
      if (!waiting) return;
      const { trial, t0, timeout } = waiting;
      waiting = null;
      clearTimeout(timeout);
      const rt = performance.now() - t0;
      done(trial, right === trial.right, rt);
    };
    onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); answer(e.key === 'ArrowRight'); }
    };
    document.addEventListener('keydown', onKey);
    // Switching tabs mid-test would spoil the timing: pause, and redo the interrupted trial on return.
    onVis = () => { if (document.hidden) paused(() => run(trials.slice(i), practice, results)); };
    document.addEventListener('visibilitychange', onVis);
    d.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); answer(b.dataset.ans === 'right'); }));

    const clearSlots = () => { up.textContent = ''; down.textContent = ''; center.textContent = ''; };
    function next() {
      if (i >= trials.length) return practice ? afterPractice(results) : showResults(results);
      const trial = trials[i];
      clearSlots();
      fb.textContent = '';
      bar.style.width = `${(i / trials.length) * 100}%`;
      const fix = FIX[0] + Math.random() * (FIX[1] - FIX[0]);
      later(fix, () => {
        if (trial.cue === 'center') center.textContent = '*';
        if (trial.cue === 'double') { up.textContent = '*'; down.textContent = '*'; }
        if (trial.cue === 'spatial') (trial.up ? up : down).textContent = '*';
        later(CUE_MS, () => {
          clearSlots();
          later(GAP_MS, () => {
            const mid = trial.right ? '→' : '←';
            const side = trial.congruent ? mid : (trial.right ? '←' : '→');
            (trial.up ? up : down).textContent = `${side} ${side} ${mid} ${side} ${side}`;
            // Start the clock now (never wait for a frame: a hidden tab gets none), then move it to the moment the
            // arrows are painted if a frame comes before the answer.
            const w = { trial, t0: performance.now(), timeout: later(MAX_RT, () => { if (waiting === w) { waiting = null; done(trial, false, MAX_RT, true); } }) };
            waiting = w;
            requestAnimationFrame(() => { if (waiting === w) w.t0 = performance.now(); });
          });
        });
      });
    }
    function done(trial, correct, rt, slow = false) {
      clearSlots();
      results.push({ ...trial, correct, rt });
      if (practice) fb.textContent = slow ? L('Too slow, try to answer faster', 'איטי מדי, נסו לענות מהר יותר') : correct ? L('✓ Correct', '✓ נכון') : L('✗ Wrong: look only at the middle arrow', '✗ טעות: הסתכלו רק על החץ האמצעי');
      i++;
      later(practice ? 900 : BLANK_MS, next);
    }
    next();
  }

  function paused(resume) {
    stopAll();
    d.innerHTML = `${head(L('Paused', 'מושהה'))}
      <p>${esc(L('The test paused because you left this page. Your answers so far are kept.', 'המבחן הושהה כי עזבתם את הדף. התשובות עד עכשיו נשמרו.'))}</p>
      <div class="row"><button class="btn" data-start>${esc(L('Continue', 'להמשיך'))}</button></div>`;
    bindClose();
    d.querySelector('[data-start]').addEventListener('click', resume);
  }

  function afterPractice(results) {
    stopAll();
    const ok = results.filter((r) => r.correct).length;
    d.innerHTML = `${head(L('Practice done', 'התרגול הסתיים'))}
      <p>${esc(L(`You got ${ok} of ${results.length} right.`, `ענית נכון על ${ok} מתוך ${results.length}.`))} ${esc(L('Now 32 real trials, without feedback. Keep your eyes on the +.', 'עכשיו 32 ניסיונות אמיתיים, בלי משוב. השאירו את העיניים על ה-+.'))}</p>
      <div class="row"><button class="btn" data-start>${esc(L('Start the test', 'להתחיל את המבחן'))}</button><button class="btn ghost" data-again>${esc(L('Practise again', 'לתרגל שוב'))}</button></div>`;
    bindClose();
    d.querySelector('[data-start]').addEventListener('click', () => run(makeTrials(), false));
    d.querySelector('[data-again]').addEventListener('click', () => run(practiceTrials(), true));
  }

  // ---------------------------------------------------------------- results
  function showResults(results) {
    stopAll();
    const s = scores(results);
    const ms = (x) => (Number.isFinite(x) ? `${Math.round(x)} ms` : '—');
    const row = (key, icon, color, name, what, step) => {
      const v = s[key];
      const w = Number.isFinite(v) ? Math.max(0, Math.min(100, (v / 150) * 100)) : 0;
      return `<div class="attn-score">
        <div class="row"><b>${icon} ${esc(name)}</b><span class="spacer"></span><b dir="ltr">${ms(v)}</b></div>
        <div class="attn-bar"><i style="width:${w}%;background:${color}"></i></div>
        <p class="small">${esc(what)}</p>
        <button class="btn ghost sm" data-step="${step}">🧠 ${esc(L('Show this network in 3D', 'להראות את הרשת בתלת-ממד'))}</button>
      </div>`;
    };
    const tooFew = s.accuracy < 0.6;
    d.innerHTML = `${head(L('Your attention networks', 'רשתות הקשב שלכם'))}
      <p class="small">${esc(L(`Accuracy ${Math.round(s.accuracy * 100)}% · typical answer time ${ms(s.rt)}. Each score is how many milliseconds a condition saved or cost you.`, `דיוק ${Math.round(s.accuracy * 100)}% · זמן תגובה אופייני ${ms(s.rt)}. כל ציון הוא כמה אלפיות שנייה מצב מסוים חסך לכם או עלה לכם.`))}</p>
      ${tooFew ? `<p class="attn-warn">⚠️ ${esc(L('Many answers were wrong or too slow, so these scores are not reliable. Try again, looking only at the middle arrow.', 'הרבה תשובות היו שגויות או איטיות מדי, ולכן הציונים לא אמינים. נסו שוב והסתכלו רק על החץ האמצעי.'))}</p>` : ''}
      ${row('alerting', '🔔', '#facc15', L('Alerting', 'עוררות'), L('How much faster you were after a warning (* in both places) than with no warning. Norepinephrine from the locus coeruleus.', 'כמה הייתם מהירים יותר אחרי אזהרה (* בשני המקומות) מאשר בלי אזהרה. נוראפינפרין מהלוקוס צרולאוס.'), 0)}
      ${row('orienting', '👀', '#22d3ee', L('Orienting', 'התמצאות'), L('How much faster you were when the * showed where the arrows would appear, compared with a * in the middle. The parietal and frontal eye field network.', 'כמה הייתם מהירים יותר כשה-* הראתה איפה החיצים יופיעו, לעומת * באמצע. הרשת הקודקודית ושדה העין המצחי.'), 1)}
      ${row('executive', '🧩', '#f472b6', L('Executive control', 'שליטה ניהולית'), L('How much the opposite-pointing arrows slowed you down. Smaller means you ignored them better. The anterior cingulate and the prefrontal cortex.', 'כמה החיצים שהצביעו לכיוון ההפוך האטו אתכם. מספר קטן יותר אומר שהתעלמתם מהם טוב יותר. קליפת החגורה הקדמית והקליפה הקדם-מצחית.'), 3)}
      <p class="small muted">${esc(L('In adults, each score is usually some tens of milliseconds, and the executive (conflict) score is usually the largest. A 2-minute test is noisy: this is for learning, not a diagnosis. Based on the Attention Network Test (Fan et al., 2002).', 'אצל מבוגרים כל ציון הוא בדרך כלל כמה עשרות אלפיות שנייה, וציון השליטה הניהולית (הקונפליקט) בדרך כלל הגדול ביותר. מבחן של 2 דקות רועש: זה ללמידה, לא לאבחון. מבוסס על מבחן רשתות הקשב (Fan ועמיתים, 2002).'))}</p>
      <div class="row"><button class="btn" data-again>${esc(L('Try again', 'לנסות שוב'))}</button><button class="btn ghost" data-close2>${esc(L('Close', 'סגירה'))}</button></div>`;
    bindClose();
    d.querySelector('[data-again]').addEventListener('click', intro);
    d.querySelector('[data-close2]').addEventListener('click', () => d.close());
    d.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
      const step = +b.dataset.step;
      d.close();
      window.dispatchEvent(new CustomEvent('brainweb:pathStep', { detail: { id: 'attention', step } }));
      if (location.hash !== '#/explore/organ/path/attention') location.hash = '#/explore/organ/path/attention';
    }));
  }

  intro();
  d.showModal();
}
