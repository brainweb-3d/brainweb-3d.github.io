// Page side of the "BrainWeb for Claude Desktop" extension (mcp/brainweb-claude).
// The extension runs a small WebSocket server on this computer (127.0.0.1:47321). While this page is
// open it connects to it, and Claude's tool calls (show a place, read a lecture, create a test…) are
// carried out here. The page only connects after the user clicked "Connect Claude" once (so visitors
// who never installed the extension get no connection attempts), and retries with a growing delay.
// Pairing: the extension only accepts pages that know its secret token. When BrainWeb runs with `npm run dev`
// the dev server hands the token over automatically; otherwise the page shows a short code that the user gives
// to Claude once ("pair BrainWeb with code ABC-123"), and the token is then remembered in this browser.
import { load, save } from '../store.js';
import { emitAiChange, parseJSONLoose, jsonInstruction } from './bus.js';

export const BRIDGE_PORT = 47321;
const URL_ = `ws://127.0.0.1:${BRIDGE_PORT}`;
const DELAYS = [1, 2, 4, 8, 15, 30, 60]; // seconds between reconnect attempts

let ws = null;
let state = { status: 'off', sampling: false, version: '', pairCode: '' }; // off | connecting | waiting | pairing | connected
let attempt = 0;
let timer = null;
let lastSelection = null; // filled by the optional 'brainweb:select' event from Explore
const pending = new Map(); // page → server requests (sampling)
let seq = 0;

export const bridgeState = () => state;
export const bridgeWanted = () => !!load('aiPrefs', {}).claudeBridge;

function setState(next) {
  const changed = next.status !== state.status || (next.sampling ?? state.sampling) !== state.sampling || (next.pairCode ?? state.pairCode) !== state.pairCode;
  state = { ...state, ...next };
  if (changed) emitAiChange();
}

/** Remember that the user wants Claude Desktop, and connect now. */
export function wantBridge() {
  save('aiPrefs', { ...load('aiPrefs', {}), claudeBridge: true });
  attempt = 0;
  startBridge();
}
/** Fail every request still waiting for Claude Desktop (so nothing hangs until its timeout). */
function rejectPending(msg) {
  for (const [, p] of pending) p.reject(new Error(msg));
  pending.clear();
}

/** Forget Claude Desktop (the extension itself stays installed in Claude Desktop). */
export function stopBridge() {
  save('aiPrefs', { ...load('aiPrefs', {}), claudeBridge: false });
  clearTimeout(timer);
  if (ws) { ws.onclose = null; ws.close(); ws = null; }
  rejectPending('Claude Desktop was disconnected.');
  setState({ status: 'off', sampling: false, pairCode: '' });
}

export function startBridge() {
  if (!bridgeWanted() || typeof WebSocket === 'undefined') return;
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  clearTimeout(timer);
  setState({ status: attempt ? 'waiting' : 'connecting' });
  let sock;
  try { sock = new WebSocket(URL_); } catch { return schedule(); }
  ws = sock;
  sock.onopen = async () => {
    attempt = 0;
    sayHello(await pairingToken());
  };
  sock.onmessage = (ev) => onMessage(ev.data);
  sock.onclose = () => {
    if (ws === sock) ws = null;
    rejectPending('Claude Desktop disconnected.');
    setState({ status: 'waiting', sampling: false });
    schedule();
  };
  sock.onerror = () => { /* onclose follows */ };
}

function schedule() {
  clearTimeout(timer);
  if (!bridgeWanted()) return;
  // While the tab is hidden, wait until it is visible again instead of retrying in the background.
  if (document.hidden) return;
  const d = DELAYS[Math.min(attempt, DELAYS.length - 1)];
  attempt++;
  timer = setTimeout(startBridge, d * 1000);
}

if (typeof document !== 'undefined') {
  const wake = () => {
    if (!document.hidden && bridgeWanted() && !ws) { attempt = Math.min(attempt, 1); clearTimeout(timer); startBridge(); }
    if (ws?.readyState === WebSocket.OPEN) send({ type: 'focus', focused: document.hasFocus() && !document.hidden });
  };
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('focus', wake);
  window.addEventListener('brainweb:select', (e) => { lastSelection = e.detail || null; });
}

const send = (obj) => { try { ws?.send(JSON.stringify(obj)); } catch { /* closed */ } };
const sayHello = (token) => send({ type: 'hello', page: 'brainweb', token, href: location.origin + location.pathname, focused: document.hasFocus() });

// ---- pairing ----
const storedToken = () => load('aiPrefs', {}).claudeToken || '';
const storeToken = (t) => save('aiPrefs', { ...load('aiPrefs', {}), claudeToken: t });
/** In `npm run dev`, the dev server can read the extension's token; elsewhere use the one saved by pairing. */
async function devToken() {
  if (!import.meta.env.DEV) return '';
  try {
    const r = await fetch('/api/claude/token', { headers: { 'X-BrainWeb': '1' } });
    return r.ok ? (await r.json()).token || '' : '';
  } catch { return ''; }
}
async function pairingToken() {
  const saved = storedToken();
  if (saved) return saved;
  const t = await devToken();
  if (t) storeToken(t);
  return t;
}
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
function newPairCode() {
  const r = crypto.getRandomValues(new Uint32Array(6));
  const c = [...r].map((n) => CODE_CHARS[n % CODE_CHARS.length]).join('');
  return `${c.slice(0, 3)}-${c.slice(3)}`;
}
let triedDevToken = false;
async function onPairRequired() {
  // The saved token may be stale (e.g. the extension was reinstalled): in dev, try the current one once.
  if (!triedDevToken) {
    triedDevToken = true;
    const t = await devToken();
    if (t && t !== storedToken()) { storeToken(t); sayHello(t); return; }
  }
  storeToken('');
  const code = state.pairCode || newPairCode();
  send({ type: 'pair-request', code });
  setState({ status: 'pairing', pairCode: code });
}

async function onMessage(raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }
  if (msg.type === 'hello') { triedDevToken = false; setState({ status: 'connected', sampling: !!msg.sampling, version: msg.version || '', pairCode: '' }); return; }
  if (msg.type === 'pair-required') { onPairRequired(); return; }
  if (msg.type === 'paired') { if (typeof msg.token === 'string') storeToken(msg.token); return; }
  if (msg.type === 'reply') {
    const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); msg.ok ? p.resolve(msg.result) : p.reject(new Error(msg.error || 'Claude Desktop error')); }
    return;
  }
  if (msg.type === 'call') {
    try {
      const fn = HANDLERS[msg.tool];
      if (!fn) throw new Error(`Unknown tool: ${msg.tool}`);
      const result = await fn(msg.args || {});
      send({ type: 'result', id: msg.id, ok: true, result });
    } catch (e) {
      send({ type: 'result', id: msg.id, ok: false, error: e.message || String(e) });
    }
  }
}

/** Ask the connected Claude Desktop to write JSON (MCP sampling; only if Claude Desktop supports it). */
export function sampleJSON({ system, user, schema, maxTokens = 16000 }) {
  if (state.status !== 'connected' || !state.sampling) return Promise.reject(new Error('Claude Desktop is not connected.'));
  const id = ++seq;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { if (pending.delete(id)) reject(new Error('Claude Desktop did not answer in time.')); }, 10 * 60e3);
    pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    send({ type: 'sample', id, system: system + jsonInstruction(schema), user, maxTokens });
  }).then((text) => parseJSONLoose(text));
}

// ------------------------------------------------------------------ what Claude can do on the page
const graphMod = import.meta.glob('../explore/graph.js');

async function places() {
  const { SCENES } = await import('../../content/catalog.js');
  const out = [{ key: 'organ/brain', level: 'organ', scene: 'brain', name: { en: 'The brain', he: 'המוח' }, route: '#/explore/organ' }];
  for (const s of SCENES) out.push({ key: `${s.level}/${s.id}`, level: s.level, scene: s.id, name: s.name, route: `#/explore/${s.level}/${s.id}` });
  const loadGraph = graphMod['../explore/graph.js'];
  if (loadGraph) {
    try {
      const { PLACES } = await loadGraph();
      for (const p of out) {
        const g = PLACES?.[p.key];
        if (g) { p.parent = g.parent || null; p.next = (g.hotspots || []).map((h) => ({ to: h.to, part: h.part, kind: h.kind, label: h.label })); }
      }
    } catch { /* graph not ready yet — the plain list is enough */ }
  }
  return out;
}

function currentRoute() {
  const hash = location.hash || '#/explore';
  const parts = hash.slice(1).split('?')[0].split('/').filter(Boolean);
  let place = null;
  if (parts[0] === 'explore') {
    const level = parts[1] || 'organ';
    place = level === 'organ' ? 'organ/brain' : parts[2] ? `${level}/${parts[2]}` : level;
  }
  return { hash, parts, place };
}

async function context() {
  const r = currentRoute();
  const hook = typeof window.brainweb?.context === 'function' ? await window.brainweb.context() : null;
  const { getLang } = await import('../i18n.js');
  const organParts = r.parts[0] === 'explore' && r.parts[1] === 'organ' && r.parts[2] && r.parts[2] !== 'path' ? decodeURIComponent(r.parts[2]).split(',') : [];
  return {
    route: r.hash,
    page: r.parts[0] || 'explore',
    place: r.place,
    organParts,
    pathway: r.parts[2] === 'path' ? r.parts[3] : null,
    selectedPart: hook?.selectedPart ?? lastSelection ?? null,
    details: hook || null,
    language: getLang(),
    pageTitle: document.querySelector('h1')?.textContent?.trim() || document.title,
    availablePlaces: (await places()).map((p) => p.key),
  };
}

async function show({ place, route, parts, pathway }) {
  let hash = '';
  if (route) {
    hash = route.startsWith('#') ? route : `#${route.startsWith('/') ? '' : '/'}${route}`;
    if (!/^#\/(explore|test|settings|effect|story)(\/|$|\?)/.test(hash)) throw new Error('Route must start with #/explore, #/test, #/effect, #/story or #/settings.');
  } else if (parts?.length) {
    hash = `#/explore/organ/${parts.map(encodeURIComponent).join(',')}`;
  } else if (pathway) {
    hash = `#/explore/organ/path/${encodeURIComponent(pathway)}`;
  } else if (place) {
    const list = await places();
    const p = list.find((x) => x.key === place) || list.find((x) => x.scene === place);
    if (!p) throw new Error(`Unknown place "${place}". Use brainweb_list_places to see the keys.`);
    hash = p.route;
  } else throw new Error('Give a place, route, parts or pathway.');
  location.hash = hash;
  await new Promise((r) => setTimeout(r, 700));
  return { shown: hash, now: await context() };
}

const HANDLERS = {
  context,
  list_places: async () => {
    const { regions } = await import('../../content/regions.js');
    return { places: await places(), brainParts: regions.map((r) => ({ id: r.id, name: r.name })) };
  },
  show,
  list_lectures: async () => (await import('../test/aiTest.js')).listLectures(),
  get_lecture_text: async ({ id, offset = 0, length = 40000 }) => (await import('../test/aiTest.js')).getLectureText(id, offset, length),
  create_test: async ({ test, lectureName }) => {
    const m = await import('../test/aiTest.js');
    const entry = await m.saveTestFromModel(test, lectureName);
    m.openAiTest(entry.id);
    return { saved: true, id: entry.id, questions: entry.questions.length, route: `#/test/ai/${entry.id}` };
  },
};
