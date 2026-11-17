// ⚙ Settings: "Connect your AI" — Claude (Claude Desktop extension), ChatGPT (Sign in with ChatGPT),
// Gemini (Google sign-in) — plus an advanced option: Claude with your own Anthropic API key.
import { MODELS, getAiSettings, saveAiSettings, clearAiKey, testClaude } from '../ai/claude.js';
import { onAiChange, providerStatus, activeProvider, usableProviders, setPreferredProvider, PROVIDER_NAMES, refreshAiStatus } from '../ai/providers.js';
import { wantBridge, stopBridge, bridgeWanted } from '../ai/claudeBridge.js';
import { OPENAI_AVAILABLE, openaiLogin, openaiLogout, listOpenAIModels, getOpenAIModel, setOpenAIModel } from '../ai/openai.js';
import { getGoogleConfig, saveGoogleConfig, preloadGis, geminiLogin, geminiLogout, listGeminiModels, getGeminiModel, setGeminiModel } from '../ai/gemini.js';
import { ui, t, getLang } from '../i18n.js';
import { esc } from '../util.js';
import '../ai/connect.css';

const L = (en, he) => (getLang() === 'he' ? he : en);
const MCPB_URL = './brainweb-claude.mcpb';

/** Checks the shape of a pasted key and returns a problem description, or null if it looks right. */
export function keyProblem(raw) {
  const key = raw.replace(/\s+/g, '');
  if (!key) return L('Paste your key first.', 'הדביקו קודם את המפתח.');
  if (!key.startsWith('sk-ant-')) return L('An Anthropic API key starts with "sk-ant-". Copy it again from console.anthropic.com.', 'מפתח API של Anthropic מתחיל ב-"sk-ant-". העתיקו אותו שוב מ-console.anthropic.com.');
  if (key.length < 80) return L(`This key is only ${key.length} characters long — a full key is about 100. Part of it was probably cut off when copying. Create a new key and use its Copy button.`, `המפתח הזה באורך ${key.length} תווים בלבד — מפתח מלא הוא באורך של כ-100. כנראה שחלק ממנו נחתך בהעתקה. צרו מפתח חדש והשתמשו בכפתור ההעתקה שלו.`);
  return null;
}

let selected = ''; // which tile's details are open: claude | chatgpt | gemini
let unsubscribe = null;

export function renderSettings(app) {
  const q = new URLSearchParams((location.hash.split('?')[1] || ''));
  if (q.get('connect')) selected = q.get('connect');
  app.innerHTML = `
    <h1>⚙ ${esc(ui('settings'))}</h1>
    <div class="card notebook-card connect-card" style="max-width:760px">
      <h2>✨ ${esc(L('Connect your AI', 'חברו את ה-AI שלכם'))}</h2>
      <p>${esc(L('With an AI connected, the search box answers real questions and your lectures become custom tests. Pick the one you already use — no key to paste.', 'כש-AI מחובר, תיבת החיפוש עונה על שאלות אמיתיות וההרצאות שלכם הופכות למבחנים מותאמים. בחרו את מה שאתם כבר משתמשים בו — בלי להדביק מפתח.'))}</p>
      <div id="connect"></div>
    </div>
    <details class="card notebook-card adv-key" id="adv">
      <summary>🔑 ${esc(L('Advanced: Claude API key', 'מתקדם: מפתח API של Claude'))}</summary>
      <div id="advBody"></div>
    </details>
    <p class="small muted" style="max-width:760px;margin-top:14px">🔒 ${esc(L('Sign-ins stay on your computer: ChatGPT tokens are kept by the local BrainWeb server (npm run dev), Google tokens only in this tab, and the Claude extension talks only to this page on your computer.', 'ההתחברויות נשארות במחשב שלכם: אסימוני ChatGPT נשמרים בשרת המקומי של BrainWeb (npm run dev), אסימוני Google רק בלשונית הזו, ותוסף Claude מדבר רק עם הדף הזה במחשב שלכם.'))}</p>`;

  const box = app.querySelector('#connect');
  drawConnect(box);
  renderKey(app.querySelector('#advBody'));
  if (getAiSettings().key) app.querySelector('#adv').open = true;

  // Keep the connection status live while this page is open
  unsubscribe?.();
  unsubscribe = onAiChange(() => {
    if (!document.body.contains(box)) { unsubscribe?.(); unsubscribe = null; return; }
    if (box.contains(document.activeElement) && document.activeElement.matches('input, select, textarea')) return; // don't disturb typing
    drawConnect(box);
  });
  refreshAiStatus();
  // Fetch Google's sign-in script early so the sign-in window opens straight from the click (popup blockers)
  if (getGoogleConfig().clientId) preloadGis();
}

// ------------------------------------------------------------------ the three connect buttons
function drawConnect(box) {
  const st = providerStatus();
  const b = st['claude-mcp'];
  const g = st.gemini;
  const c = st.chatgpt;
  const claudeState = b.status === 'connected' ? 'on' : bridgeWanted() ? 'wait' : '';
  const tiles = [
    { id: 'claude', name: 'Claude', sub: L('Through the Claude Desktop app (free extension)', 'דרך אפליקציית Claude Desktop (תוסף חינמי)'),
      state: claudeState, label: claudeState === 'on' ? L('Claude connected ✓', 'Claude מחובר ✓') : b.status === 'pairing' ? L(`Pair code: ${b.pairCode}`, `קוד צימוד: ${b.pairCode}`) : claudeState === 'wait' ? L('Waiting for Claude Desktop…', 'ממתין ל-Claude Desktop…') : L('Not connected', 'לא מחובר') },
    { id: 'chatgpt', name: 'ChatGPT', sub: L('Sign in with your ChatGPT account', 'התחברות עם חשבון ChatGPT'), disabled: !OPENAI_AVAILABLE,
      state: c.connected ? 'on' : c.pending ? 'wait' : '', label: !OPENAI_AVAILABLE ? L('Only when run locally', 'רק בהרצה מקומית') : c.connected ? L('Connected ✓', 'מחובר ✓') : c.pending ? L('Signing in…', 'מתחבר…') : L('Not connected', 'לא מחובר') },
    { id: 'gemini', name: 'Gemini', sub: L('Sign in with your Google account', 'התחברות עם חשבון Google'),
      state: g.connected ? 'on' : g.expired ? 'wait' : '', label: g.connected ? L('Connected ✓', 'מחובר ✓') : g.expired ? L('Click to sign in again', 'לחצו להתחברות מחדש') : g.configured ? L('Not connected', 'לא מחובר') : L('Needs a one-time setup', 'דורש הגדרה חד-פעמית') },
  ];
  const usable = usableProviders();
  const active = activeProvider();
  box.innerHTML = `
    <div class="connect-grid" role="group" aria-label="${esc(L('AI services', 'שירותי AI'))}">
      ${tiles.map((x) => `<button type="button" class="connect-tile ${selected === x.id ? 'sel' : ''}" data-tile="${x.id}" ${x.disabled ? 'aria-disabled="true"' : ''} aria-expanded="${selected === x.id}">
        <span class="ct-name">${esc(x.name)}</span><span class="ct-sub">${esc(x.sub)}</span>
        <span class="ct-status ${x.state}"><span class="ct-dot"></span>${esc(x.label)}</span></button>`).join('')}
    </div>
    ${selected ? `<div class="connect-detail" id="detail">${detailHtml(selected, st)}</div>` : ''}
    ${usable.length > 1 ? `<div class="connect-active row"><label for="activeP"><b>${esc(L('Use for AI features:', 'להשתמש לתכונות AI:'))}</b></label>
      <select id="activeP" class="text-input">${usable.map((id) => `<option value="${id}" ${id === active ? 'selected' : ''}>${esc(t(PROVIDER_NAMES[id]))}</option>`).join('')}</select></div>` : ''}`;

  box.querySelectorAll('[data-tile]').forEach((el) => el.addEventListener('click', () => onTile(el.dataset.tile, box)));
  box.querySelector('#activeP')?.addEventListener('change', (e) => setPreferredProvider(e.target.value));
  wireDetail(box);
}

function onTile(id, box) {
  selected = id;
  const st = providerStatus();
  if (id === 'claude' && st['claude-mcp'].status !== 'connected' && !bridgeWanted()) {
    downloadExtension();
    wantBridge();
  } else if (id === 'chatgpt' && OPENAI_AVAILABLE && !st.chatgpt.connected && !st.chatgpt.pending) {
    openaiLogin();
  } else if (id === 'gemini' && getGoogleConfig().clientId && getGoogleConfig().projectId && !st.gemini.connected) {
    signInGoogle(box);
    return;
  }
  drawConnect(box);
}

function downloadExtension() {
  const a = document.createElement('a');
  a.href = MCPB_URL;
  a.download = 'brainweb-claude.mcpb';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function signInGoogle(box) {
  drawConnect(box);
  const note = box.querySelector('#gNote');
  if (note) note.innerHTML = `<span class="spinner"></span> ${esc(L('A Google window is open — choose your account and allow access.', 'נפתח חלון של Google — בחרו חשבון ואשרו גישה.'))}`;
  try {
    await geminiLogin();
    drawConnect(box);
  } catch (e) {
    drawConnect(box);
    const n = box.querySelector('#gNote');
    if (n) { n.className = 'note-card warn'; n.textContent = '⚠️ ' + e.message; }
  }
}

function detailHtml(id, st) {
  if (id === 'claude') {
    const on = st['claude-mcp'].status === 'connected';
    return `<h3>Claude · Claude Desktop</h3>
      ${on ? `<div class="note-card ok">✅ ${esc(L('Claude connected. In Claude Desktop, ask for example: "Show me the hippocampus in BrainWeb" or "Make a BrainWeb test from my lecture".', 'Claude מחובר. ב-Claude Desktop בקשו למשל: "הראה לי את ההיפוקמפוס ב-BrainWeb" או "צור מבחן ב-BrainWeb מההרצאה שלי".'))}
        ${st['claude-mcp'].sampling ? '' : `<br><span class="small muted">${esc(L('On this site, "Create test" gives you a prompt to paste into Claude.', 'באתר, "יצירת מבחן" נותן הנחיה להדבקה ב-Claude.'))}</span>`}</div>` : ''}
      ${st['claude-mcp'].status === 'pairing' ? `<div class="note-card ok pair-box"><b>${esc(L('Last step (once): tell Claude this code', 'שלב אחרון (פעם אחת): אמרו ל-Claude את הקוד הזה'))}</b>
        <div class="pair-code" dir="ltr">${esc(st['claude-mcp'].pairCode)}</div>
        <span class="small">${esc(L(`In Claude Desktop, write: "Pair BrainWeb with code ${st['claude-mcp'].pairCode}"`, `ב-Claude Desktop כתבו: "Pair BrainWeb with code ${st['claude-mcp'].pairCode}"`))}</span>
        <div class="row" style="margin-top:6px"><button class="btn sm" id="copyPair">📋 ${esc(L('Copy', 'העתקה'))}</button></div></div>` : ''}
      <ol>
        <li>${esc(L('Open the downloaded file', 'פתחו את הקובץ שהורד'))} <b>brainweb-claude.mcpb</b> — <a href="${MCPB_URL}" download>${esc(L('download again', 'הורדה מחדש'))}</a>.
          <span class="small muted">${esc(L('Need the app? Get Claude Desktop from claude.ai/download.', 'צריכים את האפליקציה? הורידו את Claude Desktop מ-claude.ai/download.'))}</span></li>
        <li>${esc(L('Claude Desktop opens it: click "Install".', 'Claude Desktop פותח אותו: לחצו "Install" (התקנה).'))}</li>
        <li>${esc(L('Keep BrainWeb open in this browser. This button turns into "Claude connected ✓" by itself.', 'השאירו את BrainWeb פתוח בדפדפן הזה. הכפתור יהפוך ל-"Claude מחובר ✓" מעצמו.'))}</li>
      </ol>
      <p class="small muted">${esc(L('Using BrainWeb from a website (not localhost)? In Claude Desktop → Settings → Extensions → BrainWeb, enter its address.', 'משתמשים ב-BrainWeb מאתר (לא localhost)? ב-Claude Desktop ← Settings ← Extensions ← BrainWeb, הזינו את הכתובת שלו.'))}</p>
      <div class="row">${bridgeWanted() || on ? `<button class="btn ghost sm" id="claudeOff">${esc(L('Disconnect', 'ניתוק'))}</button>` : `<button class="btn sm" id="claudeOn">${esc(L('Connect Claude', 'חיבור Claude'))}</button>`}</div>`;
  }
  if (id === 'chatgpt') {
    const c = st.chatgpt;
    if (!OPENAI_AVAILABLE) {
      return `<h3>ChatGPT</h3><p>${esc(L('Sign in with ChatGPT works when BrainWeb runs on your own computer: open a terminal in the BrainWeb folder, run npm run dev, and open http://localhost:5173.', 'ההתחברות עם ChatGPT עובדת כש-BrainWeb רץ על המחשב שלכם: פתחו טרמינל בתיקיית BrainWeb, הריצו npm run dev ופתחו את http://localhost:5173.'))}</p>`;
    }
    return `<h3>ChatGPT</h3>
      ${c.connected ? `<div class="note-card ok">✅ ${esc(L('Signed in', 'מחובר'))}${c.email ? ` · <b>${esc(c.email)}</b>` : ''}. ${esc(L('Uses your ChatGPT plan.', 'משתמש בתוכנית ה-ChatGPT שלכם.'))}</div>
        <div class="field"><label for="oaModel"><b>${esc(L('Model', 'מודל'))}</b></label><select id="oaModel" class="text-input"><option>${esc(L('Loading…', 'טוען…'))}</option></select></div>
        <div class="row"><button class="btn ghost sm" id="oaOut">${esc(L('Sign out', 'התנתקות'))}</button></div>`
    : `<p>${esc(L('A ChatGPT sign-in tab opens. Sign in, give the app a name if asked, and allow BrainWeb to use your ChatGPT plan. Then come back here.', 'נפתחת לשונית התחברות של ChatGPT. התחברו, תנו שם לאפליקציה אם מתבקש, ואשרו ל-BrainWeb להשתמש בתוכנית ה-ChatGPT שלכם. אחר כך חזרו לכאן.'))}</p>
        ${c.pending ? `<div class="note-card"><span class="spinner"></span> ${esc(L('Waiting for the sign-in to finish…', 'ממתין לסיום ההתחברות…'))}</div>` : ''}
        ${c.error ? `<div class="note-card warn">⚠️ ${esc(c.error)}</div>` : ''}
        <div class="row"><button class="btn sm" id="oaIn">${esc(c.pending ? L('Open the sign-in again', 'פתיחת ההתחברות שוב') : L('Continue with ChatGPT', 'המשך עם ChatGPT'))}</button></div>`}`;
  }
  // gemini
  const g = st.gemini;
  const cfg = getGoogleConfig();
  const origin = location.origin;
  return `<h3>Gemini · Google</h3>
    ${g.connected ? `<div class="note-card ok">✅ ${esc(L('Signed in with Google. The sign-in lasts an hour; after that, click Gemini again.', 'מחובר עם Google. ההתחברות תקפה לשעה; אחר כך לחצו שוב על Gemini.'))}</div>
      <div class="field"><label for="gModel"><b>${esc(L('Model', 'מודל'))}</b></label><select id="gModel" class="text-input"><option>${esc(L('Loading…', 'טוען…'))}</option></select></div>
      <div class="row"><button class="btn ghost sm" id="gOut">${esc(L('Sign out', 'התנתקות'))}</button></div>`
    : g.configured ? `<div class="row"><button class="btn sm" id="gIn">${esc(L('Sign in with Google', 'התחברות עם Google'))}</button></div>` : ''}
    <div id="gNote" class="small" aria-live="polite"></div>
    <details ${g.configured ? '' : 'open'} style="margin-top:8px"><summary class="small"><b>${esc(L('One-time Google setup (about 5 minutes)', 'הגדרה חד-פעמית ב-Google (כ-5 דקות)'))}</b></summary>
      <ol class="small">
        <li>${esc(L('Open', 'פתחו את'))} <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener">console.cloud.google.com</a> ${esc(L('and create a project. Copy its Project ID.', 'וצרו פרויקט. העתיקו את ה-Project ID שלו.'))}</li>
        <li>${esc(L('Enable the "Generative Language API":', 'הפעילו את "Generative Language API":'))} <a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com" target="_blank" rel="noopener">${esc(L('API library', 'ספריית ה-API'))}</a>.</li>
        <li>${esc(L('Google Auth Platform → Branding/Audience: choose "External", keep it in "Testing", and add your own Google account under "Test users".', 'Google Auth Platform ← Branding/Audience: בחרו "External", השאירו במצב "Testing", והוסיפו את חשבון ה-Google שלכם תחת "Test users".'))}</li>
        <li>${esc(L('Clients → Create client → "Web application". Under "Authorized JavaScript origins" add', 'Clients ← Create client ← "Web application". תחת "Authorized JavaScript origins" הוסיפו'))} <code>http://localhost:5173</code>${origin !== 'http://localhost:5173' ? ` ${esc(L('and', 'וגם'))} <code>${esc(origin)}</code>` : ''}. ${esc(L('Copy the Client ID.', 'העתיקו את ה-Client ID.'))}</li>
        <li>${esc(L('Paste both below and save (or put them in a .env.local file as VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_PROJECT_ID).', 'הדביקו את שניהם למטה ושמרו (או שימו אותם בקובץ .env.local בשם VITE_GOOGLE_CLIENT_ID ו-VITE_GOOGLE_PROJECT_ID).'))}</li>
      </ol>
      <div class="field"><label for="gClient"><b>OAuth Client ID</b></label><input id="gClient" class="text-input" spellcheck="false" autocomplete="off" placeholder="1234…apps.googleusercontent.com" value="${esc(cfg.clientId)}" ${cfg.fromEnv.clientId ? 'readonly' : ''}/></div>
      <div class="field"><label for="gProject"><b>Project ID</b></label><input id="gProject" class="text-input" spellcheck="false" autocomplete="off" placeholder="my-brainweb-123" value="${esc(cfg.projectId)}" ${cfg.fromEnv.projectId ? 'readonly' : ''}/></div>
      <div class="row"><button class="btn sm secondary" id="gSave">${esc(ui('saveKey'))}</button></div>
    </details>`;
}

function wireDetail(box) {
  const $ = (s) => box.querySelector(s);
  $('#claudeOn')?.addEventListener('click', () => { downloadExtension(); wantBridge(); drawConnect(box); });
  $('#claudeOff')?.addEventListener('click', () => { stopBridge(); drawConnect(box); });
  $('#copyPair')?.addEventListener('click', async (e) => {
    const code = providerStatus()['claude-mcp'].pairCode;
    try { await navigator.clipboard.writeText(`Pair BrainWeb with code ${code}`); e.target.textContent = '✅ ' + L('Copied', 'הועתק'); } catch { /* clipboard blocked: the code is on screen */ }
  });
  $('#oaIn')?.addEventListener('click', () => { openaiLogin(); drawConnect(box); });
  $('#oaOut')?.addEventListener('click', async () => { await openaiLogout(); drawConnect(box); });
  $('#gIn')?.addEventListener('click', () => signInGoogle(box));
  $('#gOut')?.addEventListener('click', () => { geminiLogout(); drawConnect(box); });
  $('#gSave')?.addEventListener('click', () => {
    const clientId = $('#gClient').value.trim();
    const projectId = $('#gProject').value.trim();
    const note = $('#gNote');
    if (clientId && !/\.apps\.googleusercontent\.com$/.test(clientId)) { note.className = 'note-card warn'; note.textContent = '⚠️ ' + L('A Google OAuth client ID ends with ".apps.googleusercontent.com".', 'מזהה לקוח OAuth של Google מסתיים ב-".apps.googleusercontent.com".'); return; }
    saveGoogleConfig({ clientId, projectId });
    if (clientId) preloadGis();
    drawConnect(box);
  });
  fillModels($('#oaModel'), listOpenAIModels, getOpenAIModel, setOpenAIModel, (m) => [m.slug, m.name]);
  fillModels($('#gModel'), listGeminiModels, getGeminiModel, setGeminiModel, (m) => [m.id, m.name]);
}

async function fillModels(sel, list, get, set, pick) {
  if (!sel) return;
  try {
    const models = await list();
    const cur = get();
    sel.innerHTML = `<option value="">${esc(L('Automatic (recommended)', 'אוטומטי (מומלץ)'))}</option>` + models.map((m) => { const [id, name] = pick(m); return `<option value="${esc(id)}" ${id === cur ? 'selected' : ''}>${esc(name)}</option>`; }).join('');
    sel.addEventListener('change', () => set(sel.value));
  } catch (e) {
    sel.innerHTML = `<option>${esc(e.message)}</option>`;
    sel.disabled = true;
  }
}

// ------------------------------------------------------------------ advanced: Claude API key
function renderKey(el) {
  const s = getAiSettings();
  const masked = s.key ? `${s.key.slice(0, 12)}…${s.key.slice(-4)} (${s.key.length} ${L('characters', 'תווים')})` : '';
  const savedProblem = s.key ? keyProblem(s.key) : null;
  el.innerHTML = `
      <p class="small">${esc(L('For people who have an Anthropic API account (pay per use). Most people should use the Claude button above instead.', 'למי שיש חשבון API של Anthropic (תשלום לפי שימוש). לרוב האנשים עדיף כפתור Claude למעלה.'))}</p>
      <ol class="small">
        <li>${esc(ui('claudeStep1'))} <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a></li>
        <li>${esc(ui('claudeStep2'))}</li>
        <li>${esc(L('Paste the key below and press Save.', 'הדביקו את המפתח למטה ולחצו שמירה.'))}</li>
      </ol>
      ${s.key ? `<div class="note-card ${savedProblem ? 'warn' : 'ok'}"><b>${esc(L('Saved key', 'מפתח שמור'))}:</b> <code>${esc(masked)}</code>${savedProblem ? `<br>⚠️ ${esc(savedProblem)}` : ''}</div>` : ''}
      <label for="apiKey"><b>${esc(s.key ? L('Replace with a new key', 'החלפה במפתח חדש') : ui('apiKey'))}</b></label>
      <div class="row" style="margin:6px 0 4px">
        <input id="apiKey" class="text-input" type="password" autocomplete="off" spellcheck="false" placeholder="sk-ant-api03-…" style="flex:1;min-width:min(220px,100%);font-family:monospace" />
        <button class="btn ghost sm" id="showKey" type="button">👁 ${esc(L('Show', 'הצג'))}</button>
        <button class="btn" id="saveKey">${esc(ui('saveKey'))}</button>
      </div>
      <div class="small muted" id="keyInfo" style="min-height:1.4em;margin-bottom:10px"></div>
      <label for="model"><b>${esc(ui('model'))}</b></label>
      <div style="margin:6px 0 12px"><select id="model" class="text-input" style="max-width:100%">${MODELS.map((m) => `<option value="${m.id}" ${m.id === s.model ? 'selected' : ''}>${esc(t(m))}</option>`).join('')}</select></div>
      <div class="row">
        <button class="btn secondary" id="test" ${s.key ? '' : 'disabled'}>🔌 ${esc(ui('testKey'))}</button>
        <button class="btn ghost" id="clear" ${s.key ? '' : 'disabled'}>🗑 ${esc(ui('removeKey'))}</button>
      </div>
      <div id="status" class="note-card" aria-live="polite" hidden></div>
      <p class="small muted" style="margin-top:12px">🔒 ${esc(ui('keyPrivacy'))}</p>`;

  const input = el.querySelector('#apiKey');
  const info = el.querySelector('#keyInfo');
  const status = el.querySelector('#status');
  const showStatus = (html, kind = '') => { status.hidden = false; status.className = `note-card ${kind}`; status.innerHTML = html; };

  input.addEventListener('input', () => {
    const v = input.value.replace(/\s+/g, '');
    if (!v) { info.textContent = ''; return; }
    const p = keyProblem(v);
    info.innerHTML = p ? `⚠️ ${esc(p)}` : `✅ ${esc(L(`Looks like a complete key (${v.length} characters).`, `נראה כמו מפתח מלא (${v.length} תווים).`))}`;
  });
  el.querySelector('#showKey').addEventListener('click', () => { input.type = input.type === 'password' ? 'text' : 'password'; });

  async function runTest() {
    showStatus(`<span class="spinner"></span> ${esc(ui('testing'))}`);
    try {
      const ok = await testClaude();
      showStatus(ok ? `✅ ${esc(ui('keyWorks'))}` : '⚠️ ?', ok ? 'ok' : 'warn');
    } catch (e) {
      showStatus(`⚠️ ${esc(e.message)}`, 'warn');
    }
  }

  el.querySelector('#saveKey').addEventListener('click', () => {
    const key = input.value.replace(/\s+/g, '');
    const p = keyProblem(key);
    if (p) { info.innerHTML = `⚠️ ${esc(p)}`; input.focus(); return; }
    saveAiSettings({ key });
    renderKey(el);
    el.querySelector('#test')?.click(); // test straight away
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') el.querySelector('#saveKey').click(); });
  el.querySelector('#model').addEventListener('change', (e) => { saveAiSettings({ model: e.target.value }); showStatus('✅ ' + esc(ui('saved')), 'ok'); });
  el.querySelector('#clear').addEventListener('click', () => { clearAiKey(); renderKey(el); });
  el.querySelector('#test').addEventListener('click', runTest);
}
