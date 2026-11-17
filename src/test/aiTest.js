// "AI test from a lecture": drop a lecture file, and the connected AI (Claude, ChatGPT or Gemini) writes a test about it.
// With Claude Desktop (the BrainWeb extension) the site gives a ready-to-paste prompt, and Claude creates the
// test through its tools. Without any AI, a test can still be built from the matching textbook subsections.
// Also the store used by the Claude Desktop extension: saved AI tests and the lectures shared with it.
import { extractText } from '../upload/extractText.js';
import { matchTopics } from '../upload/matchTopics.js';
import { hasAI, activeLabel } from '../ai/providers.js';
import { bridgeState, bridgeWanted } from '../ai/claudeBridge.js';
import { generateLectureTest, testFromModel, MAX_LECTURE_CHARS } from '../ai/features.js';
import { buildTest, shuffleOptions, TYPE_NAMES } from './questionBank.js';
import { runTest } from './Runner.js';
import { shuffle } from '../../content/index.js';
import { load, save } from '../store.js';
import { ui, t, getLang } from '../i18n.js';
import { esc, tt } from '../util.js';
import '../ai/connect.css';

const L = (en, he) => (getLang() === 'he' ? he : en);
const getHistory = () => load('aiTests', []);
const newId = () => Math.random().toString(36).slice(2, 9);

// ------------------------------------------------------------------ store (also used by the Claude Desktop bridge)
/** Save a test written by an AI (TEST_SCHEMA JSON) and return the stored entry. */
export function saveTestFromModel(json, name = '') {
  const res = testFromModel(json || {});
  if (!res.questions.length) throw new Error('The test has no valid questions. Check the question format (options, correct_index, labeling regionId).');
  return saveAiTest({ name: name || t(res.title), title: res.title, summary: res.summary, questions: res.questions, related: res.related, truncated: false });
}
export function saveAiTest(e) {
  const entry = { id: newId(), createdAt: Date.now(), name: 'Lecture', ...e };
  save('aiTests', [entry, ...getHistory()].slice(0, 20));
  return entry;
}
/** Open a saved AI test (navigates to #/test/ai/<id>, which starts it). */
export function openAiTest(id) {
  const target = `#/test/ai/${id}`;
  if (location.hash === target) { const app = document.getElementById('app'); if (app) takeAiTest(app, getHistory().find((h) => h.id === id)); }
  else location.hash = target;
}

// Lectures the student added on this page; shared with Claude Desktop so it can read them.
const LECT_KEY = 'aiLectures';
const lectures = new Map(load(LECT_KEY, []).map((l) => [l.id, l]));
export function shareLecture(name, text) {
  const existing = [...lectures.values()].find((l) => l.name === name && l.text.length === text.length);
  if (existing) return existing;
  const l = { id: newId(), name: name || 'Lecture', text: text.slice(0, MAX_LECTURE_CHARS), addedAt: Date.now() };
  lectures.set(l.id, l);
  const recent = [...lectures.values()].sort((a, b) => b.addedAt - a.addedAt);
  [...recent.slice(5)].forEach((x) => lectures.delete(x.id));
  // Keep the last 3 across reloads (shortened so they fit in browser storage)
  save(LECT_KEY, recent.slice(0, 3).map((x) => ({ ...x, text: x.text.slice(0, 150000) })));
  return l;
}
export const listLectures = () => [...lectures.values()].sort((a, b) => b.addedAt - a.addedAt).map((l) => ({ id: l.id, name: l.name, characters: l.text.length, addedAt: new Date(l.addedAt).toISOString() }));
export function getLectureText(id, offset = 0, length = 40000) {
  const l = lectures.get(id) || [...lectures.values()].find((x) => x.name === id);
  if (!l) throw new Error(`No lecture with id "${id}". Use brainweb_list_lectures.`);
  const text = l.text.slice(offset, offset + length);
  return { id: l.id, name: l.name, offset, characters: l.text.length, text, more: offset + length < l.text.length };
}

// ------------------------------------------------------------------ page
export function renderAiTest(body, app) {
  const opts = load('aiTestOpts', { count: 15, types: ['mc', 'match', 'order', 'label'] });
  const ai = hasAI();
  const bridge = bridgeState();
  const desktop = !ai && (bridge.status === 'connected' || bridgeWanted());
  const label = ai ? activeLabel(getLang()) : desktop ? 'Claude' : '';
  const history = getHistory();
  let text = '';
  let fileName = '';

  const connectBox = ai
    ? `<div class="note-card ok">✅ ${esc(L('AI connected', 'AI מחובר'))}: <b>${esc(label)}</b> · <a href="#/settings">⚙ ${esc(L('change', 'שינוי'))}</a></div>`
    : desktop
      ? `<div class="note-card ${bridge.status === 'connected' ? 'ok' : ''}">${bridge.status === 'connected' ? '✅' : '⏳'} ${esc(bridge.status === 'connected'
        ? L('Claude Desktop is connected. Press "Create test" to get a prompt to paste into Claude.', 'Claude Desktop מחובר. לחצו "יצירת מבחן" כדי לקבל הנחיה להדבקה ב-Claude.')
        : bridge.status === 'pairing'
          ? L(`Almost connected: in Claude Desktop, write "Pair BrainWeb with code ${bridge.pairCode}".`, `כמעט מחובר: ב-Claude Desktop כתבו "Pair BrainWeb with code ${bridge.pairCode}".`)
          : L('Waiting for Claude Desktop… (open Claude Desktop with the BrainWeb extension installed)', 'ממתין ל-Claude Desktop… (פתחו את Claude Desktop עם תוסף BrainWeb מותקן)'))} · <a href="#/settings?connect=claude">⚙ ${esc(ui('settings'))}</a></div>`
      : `<p class="small">${esc(L('Connect an AI to write tests from your lectures — no key needed:', 'חברו AI כדי לכתוב מבחנים מההרצאות שלכם — בלי מפתח:'))}</p>
        <div class="connect-mini">
          <a class="btn secondary" href="#/settings?connect=claude">Claude</a>
          <a class="btn secondary" href="#/settings?connect=chatgpt">ChatGPT</a>
          <a class="btn secondary" href="#/settings?connect=gemini">Gemini</a>
        </div>`;

  body.innerHTML = `
    <div class="card setup">
      <h3>1. ${esc(L('Connect an AI', 'חיבור ל-AI'))}</h3>
      ${connectBox}
      <h3>2. ${esc(L('Add your lecture', 'הוסיפו את ההרצאה'))}</h3>
      <label class="dropzone" id="drop"><div class="big">📄</div><div><b>${esc(ui('chooseFile'))}</b> · PDF · DOCX · PPTX · TXT</div><input type="file" id="file" accept=".pdf,.docx,.pptx,.txt,.md" hidden/><div class="small muted" id="fileInfo"></div></label>
      <details style="margin-top:8px"><summary class="small">${esc(ui('orPaste'))}</summary><textarea id="paste" placeholder="…"></textarea></details>
      <h3>3. ${esc(L('Test options', 'אפשרויות המבחן'))}</h3>
      <div class="sub-pick">${['mc', 'match', 'order', 'label'].map((ty) => `<label class="sub-item"><input type="checkbox" data-ty="${ty}" ${opts.types.includes(ty) ? 'checked' : ''}/> ${tt(TYPE_NAMES[ty])}</label>`).join('')}</div>
      <div class="row" style="margin-top:10px">
        <label>${esc(L('Questions', 'שאלות'))} <select id="count" class="text-input">${[10, 15, 20, 30].map((n) => `<option ${n === opts.count ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <span class="spacer"></span>
        <button class="btn secondary" id="bookTest">📚 ${esc(L('Test from matching book sections (no AI)', 'מבחן מתת-פרקים מתאימים בספר (ללא AI)'))}</button>
        <button class="btn" id="aiGo" ${ai || desktop ? '' : 'disabled'}>✨ ${esc(label ? L(`Create test with ${label}`, `יצירת מבחן עם ${label}`) : L('Create test with AI', 'יצירת מבחן עם AI'))}</button>
      </div>
      <div id="status" class="note-card" hidden aria-live="polite"></div>
    </div>
    ${history.length ? `<div class="card" style="margin-top:14px"><h3>${esc(L('My AI tests', 'מבחני ה-AI שלי'))}</h3>
      ${history.map((h) => `<div class="row sub-row"><span style="flex:1"><b>${tt(h.title)}</b> <span class="small muted">· ${esc(h.name)} · ${new Date(h.createdAt).toLocaleDateString(getLang() === 'he' ? 'he-IL' : undefined)}${h.best != null ? ` · 🏅 ${h.best}%` : ''}</span></span>
        <button class="btn sm" data-take="${h.id}">▶ ${esc(L('Take', 'התחלה'))}</button><button class="btn ghost sm" data-del="${h.id}" aria-label="${esc(L('Delete', 'מחיקה'))}">🗑</button></div>`).join('')}</div>` : ''}`;

  const status = body.querySelector('#status');
  const say = (html, kind = '') => { status.hidden = false; status.className = `note-card ${kind}`; status.innerHTML = html; };
  const getTypes = () => [...body.querySelectorAll('[data-ty]')].filter((c) => c.checked).map((c) => c.dataset.ty);
  const getCount = () => +body.querySelector('#count').value;
  const saveOpts = () => save('aiTestOpts', { count: getCount(), types: getTypes() });

  // ---- file ----
  const drop = body.querySelector('#drop');
  const fileInput = body.querySelector('#file');
  async function readFile(f) {
    body.querySelector('#fileInfo').innerHTML = `<span class="spinner"></span> ${esc(ui('reading'))}`;
    try {
      text = await extractText(f);
      fileName = f.name.replace(/\.[^.]+$/, '');
      shareLecture(fileName, text);
      body.querySelector('#fileInfo').textContent = `✅ ${f.name} — ${text.split(/\s+/).length.toLocaleString()} ${L('words', 'מילים')}`;
    } catch (e) {
      body.querySelector('#fileInfo').textContent = '⚠️ ' + e.message;
    }
  }
  fileInput.addEventListener('change', () => fileInput.files[0] && readFile(fileInput.files[0]));
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => e.dataTransfer.files[0] && readFile(e.dataTransfer.files[0]));
  const lectureText = () => {
    const pasted = body.querySelector('#paste').value.trim();
    if (pasted.length > 20) { if (!fileName) fileName = pasted.split('\n')[0].slice(0, 40); return pasted; }
    return text;
  };

  // ---- build test from the book (no AI) ----
  body.querySelector('#bookTest').addEventListener('click', () => {
    const txt = lectureText();
    if (!txt) return say(`⚠️ ${esc(L('Add a lecture file or paste text first.', 'הוסיפו קודם קובץ הרצאה או הדביקו טקסט.'))}`, 'warn');
    const m = matchTopics(txt);
    if (!m.lessons.length) return say(`⚠️ ${esc(ui('noMatch'))}`, 'warn');
    saveOpts();
    const ids = m.lessons.map((x) => x.lesson.id);
    const go = () => runTest(app, buildTest(ids, getCount(), getTypes()), { title: `📄 ${fileName}`, back: '#/test/ai', retry: go });
    go();
  });

  // ---- AI test ----
  function counts(types) {
    const n = getCount();
    const share = { mc: 0.55, match: 0.15, order: 0.15, label: 0.15 };
    const total = types.reduce((s, ty) => s + share[ty], 0);
    return Object.fromEntries(['mc', 'match', 'order', 'label'].map((ty) => [ty, types.includes(ty) ? Math.max(1, Math.round((n * share[ty]) / total)) : 0]));
  }

  /** Claude Desktop without sampling: a prompt the student pastes into Claude, which then uses the BrainWeb tools. */
  function showPrompt(lectureName, c) {
    const typesEn = [c.mc && `${c.mc} multiple-choice/true-false`, c.match && `${c.match} matching sets`, c.order && `${c.order} put-in-order`, c.label && `${c.label} label-the-brain`].filter(Boolean).join(', ');
    const prompt = L(
      `Using the BrainWeb tools: read my lecture "${lectureName}" (brainweb_list_lectures, then brainweb_get_lecture_text until the end), then create a test about it with brainweb_create_test: ${typesEn} questions. Test understanding, not trivia, and write every field in English and Hebrew.`,
      `בעזרת הכלים של BrainWeb: קרא את ההרצאה שלי "${lectureName}" (brainweb_list_lectures ואז brainweb_get_lecture_text עד הסוף), ואז צור עליה מבחן עם brainweb_create_test: ${typesEn} questions. בדוק הבנה ולא פרטים שוליים, וכתוב כל שדה באנגלית ובעברית.`,
    );
    say(`<b>${esc(L('Paste this into Claude Desktop:', 'הדביקו את זה ב-Claude Desktop:'))}</b>
      <textarea class="copy-prompt" readonly rows="5">${esc(prompt)}</textarea>
      <div class="row"><button class="btn sm" id="copyPrompt">📋 ${esc(L('Copy', 'העתקה'))}</button>
      <span class="small muted">${esc(L('Keep this tab open — the test will open here when Claude has written it.', 'השאירו את הלשונית פתוחה — המבחן ייפתח כאן כש-Claude יסיים לכתוב אותו.'))}</span></div>`, 'ok');
    const ta = status.querySelector('textarea');
    status.querySelector('#copyPrompt').addEventListener('click', async (e) => {
      try { await navigator.clipboard.writeText(prompt); } catch { ta.select(); document.execCommand('copy'); }
      e.target.textContent = '✅ ' + L('Copied', 'הועתק');
    });
  }

  body.querySelector('#aiGo').addEventListener('click', async () => {
    const txt = lectureText();
    if (!txt) return say(`⚠️ ${esc(L('Add a lecture file or paste text first.', 'הוסיפו קודם קובץ הרצאה או הדביקו טקסט.'))}`, 'warn');
    const types = getTypes();
    if (!types.length) return say(`⚠️ ${esc(L('Choose at least one question type.', 'בחרו לפחות סוג שאלה אחד.'))}`, 'warn');
    saveOpts();
    const c = counts(types);
    if (!hasAI()) { const l = shareLecture(fileName || 'Lecture', txt); return showPrompt(l.name, c); }
    body.querySelector('#aiGo').disabled = true;
    say(`<span class="spinner"></span> ${esc(L(`${label} is reading your lecture and writing the test… (about a minute)`, `${label} קורא את ההרצאה וכותב את המבחן… (כדקה)`))}`);
    try {
      const res = await generateLectureTest(txt, c);
      if (!res.questions.length) throw new Error(L('The AI could not find enough material for a test in this file.', 'ה-AI לא מצא מספיק חומר למבחן בקובץ הזה.'));
      const entry = saveAiTest({ name: fileName || 'Lecture', title: res.title, summary: res.summary, questions: res.questions, related: res.related, truncated: res.truncated });
      takeAiTest(app, entry);
    } catch (e) {
      body.querySelector('#aiGo').disabled = false;
      say(`⚠️ ${esc(e.message)} <a href="#/settings">⚙ ${esc(ui('settings'))}</a><br><span class="small">${esc(L('You can still use "Test from matching book sections".', 'עדיין אפשר להשתמש ב"מבחן מתת-פרקים מתאימים בספר".'))}</span>`, 'warn');
    }
  });

  body.querySelectorAll('[data-take]').forEach((b) => b.addEventListener('click', () => takeAiTest(app, getHistory().find((h) => h.id === b.dataset.take))));
  body.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { save('aiTests', getHistory().filter((h) => h.id !== b.dataset.del)); renderAiTest(body, app); }));

  // #/test/ai/<id> opens that saved test straight away (used by Claude Desktop's brainweb_create_test)
  const direct = location.hash.match(/^#\/test\/ai\/([a-z0-9]+)/);
  if (direct) takeAiTest(app, getHistory().find((h) => h.id === direct[1]));
}

function takeAiTest(app, entry) {
  if (!entry) return;
  const go = () => runTest(app, shuffle(entry.questions).map(shuffleOptions), {
    title: `✨ ${t(entry.title)}`,
    back: '#/test/ai',
    retry: go,
    intro: entry.truncated ? L('Note: the lecture was very long, so only its first part was used.', 'שימו לב: ההרצאה הייתה ארוכה מאוד, ולכן רק החלק הראשון שלה שימש.') : '',
    onFinish: (pct) => save('aiTests', getHistory().map((h) => (h.id === entry.id ? { ...h, best: Math.max(h.best || 0, pct) } : h))),
  });
  go();
}
