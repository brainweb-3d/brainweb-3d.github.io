// BrainWeb for Claude Desktop — an MCP server (stdio) packaged as an MCPB bundle.
// Claude calls the tools below; they are carried out by the open BrainWeb page, which connects to this
// server over a local WebSocket (ws://127.0.0.1:47321): only from allowed page origins AND with a pairing token.
// Logs go to stderr: stdout is the MCP channel.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WebSocketServer } from 'ws';
import { z } from 'zod';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SCENES } from '../../../content/catalog.js';
import { regions } from '../../../content/regions.js';

const VERSION = '1.0.0';
const PORT = +(process.env.BRAINWEB_PORT || 47321);
const ORIGINS = new Set([
  'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173',
  ...String(process.env.BRAINWEB_ORIGIN || '').split(/[,\s]+/).map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean),
]);
const log = (...a) => console.error('[brainweb]', ...a);

// Labelable structures in the 3D brain (same list as src/ai/features.js)
const LABELABLE = ['frontal', 'motor', 'somatosensory', 'parietal', 'temporal', 'occipital', 'broca', 'wernicke', 'insula', 'cingulate',
  'thalamus', 'hypothalamus', 'pituitary', 'amygdala', 'hippocampus', 'basalGanglia', 'corpusCallosum', 'ventricles', 'fornix',
  'midbrain', 'pons', 'medulla', 'cerebellum', 'opticChiasm', 'spinalCord', 'pineal'];

const STATIC_PLACES = [
  { key: 'organ/brain', name: { en: 'The brain', he: 'המוח' }, route: '#/explore/organ' },
  ...SCENES.map((s) => ({ key: `${s.level}/${s.id}`, name: s.name, route: `#/explore/${s.level}/${s.id}` })),
];

// ------------------------------------------------------------------ pairing
// The origin check alone would let ANY page served on an allowed origin (e.g. another local dev project on
// :5173) talk to this server. So a page must also prove it was paired, with a secret token:
//  - The token lives in the user's config folder (%APPDATA%\BrainWeb\claude-bridge.json, ~/.config/brainweb/…).
//    BrainWeb's own dev server (tools/vite-ai-bridge.mjs) reads it and hands it to the page: no step for the user.
//  - Elsewhere (a deployed site, vite preview) the page shows a short code; the user tells Claude
//    "pair BrainWeb with code ABC-123", Claude calls brainweb_pair, and the page receives the token once.
const configDir = process.platform === 'win32'
  ? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'BrainWeb')
  : path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'brainweb');
const tokenFile = path.join(configDir, 'claude-bridge.json');
function loadToken() {
  try { const t = JSON.parse(fs.readFileSync(tokenFile, 'utf8')).token; if (typeof t === 'string' && t.length >= 32) return t; } catch { /* create below */ }
  const t = crypto.randomBytes(32).toString('base64url');
  try {
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(tokenFile, JSON.stringify({ token: t, note: 'BrainWeb and Claude Desktop pairing secret. Delete this file to unpair every browser.' }, null, 2), { mode: 0o600 });
  } catch (e) { log('could not save the pairing token:', e.message); }
  return t;
}
const TOKEN = loadToken();
const tokenOk = (t) => {
  if (typeof t !== 'string') return false;
  const a = Buffer.from(t);
  const b = Buffer.from(TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// ------------------------------------------------------------------ the page connection
const pages = new Set(); // paired BrainWeb tabs; the most recently focused one is used
const unpaired = new Map(); // socket → pairing code shown on that page ('' until it asks to pair)
let current = null;
const calls = new Map();
let seq = 0;
let wss = null;

const helloMsg = () => JSON.stringify({ type: 'hello', server: 'brainweb-claude', version: VERSION, sampling: canSample() });

function startSocket() {
  wss = new WebSocketServer({
    host: '127.0.0.1',
    port: PORT,
    maxPayload: 16 * 1024 * 1024,
    verifyClient: ({ origin }) => {
      const ok = !!origin && ORIGINS.has(origin.replace(/\/+$/, ''));
      if (!ok) log('refused connection from origin', origin || '(none)');
      return ok;
    },
  });
  wss.on('listening', () => log(`waiting for BrainWeb on ws://127.0.0.1:${PORT}`));
  wss.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      log(`port ${PORT} is busy (another BrainWeb connector running?) — retrying in 5 s`);
      wss = null;
      setTimeout(startSocket, 5000);
    } else log('socket error', e.message);
  });
  wss.on('connection', (sock) => {
    unpaired.set(sock, '');
    // A page must say hello (with the token) or ask to pair within 15 s, else it is dropped.
    const timer = setTimeout(() => { if (unpaired.has(sock) && !unpaired.get(sock)) sock.close(4001, 'no hello'); }, 15000);
    sock.on('message', (data) => onPageMessage(sock, data));
    sock.on('close', () => {
      clearTimeout(timer);
      unpaired.delete(sock);
      pages.delete(sock);
      if (current === sock) current = [...pages].pop() || null;
    });
  });
}

function acceptPage(sock) {
  unpaired.delete(sock);
  pages.add(sock);
  current = sock;
  sock.send(helloMsg());
}

function broadcastHello() {
  for (const p of pages) p.send(helloMsg());
}

async function onPageMessage(sock, data) {
  let msg;
  try { msg = JSON.parse(String(data)); } catch { return; }
  if (!pages.has(sock)) {
    // Not paired yet: only "hello with the token" or "pair me with this code" are accepted.
    if (msg.type === 'hello' && tokenOk(msg.token)) { acceptPage(sock); return; }
    if (msg.type === 'hello') { sock.send(JSON.stringify({ type: 'pair-required' })); return; }
    if (msg.type === 'pair-request') {
      const code = normCode(msg.code);
      if (code.length >= 6 && code.length <= 12) unpaired.set(sock, code);
    }
    return;
  }
  if (msg.type === 'hello' || msg.type === 'focus') { if (msg.focused !== false) current = sock; return; }
  if (msg.type === 'result') {
    const c = calls.get(msg.id);
    if (c) { calls.delete(msg.id); clearTimeout(c.timer); msg.ok ? c.resolve(msg.result) : c.reject(new Error(msg.error || 'BrainWeb error')); }
    return;
  }
  if (msg.type === 'sample') {
    // The page asks Claude to write something (MCP sampling), e.g. the "Create test" button on the site
    try {
      if (!canSample()) throw new Error('This Claude app does not support sampling.');
      const out = await mcp.server.createMessage({
        systemPrompt: String(msg.system || ''),
        messages: [{ role: 'user', content: { type: 'text', text: String(msg.user || '') } }],
        maxTokens: Math.min(+msg.maxTokens || 16000, 64000),
        includeContext: 'none',
      }, { timeout: 10 * 60e3 });
      const text = Array.isArray(out.content) ? out.content.map((c) => c.text || '').join('') : out.content?.text || '';
      sock.send(JSON.stringify({ type: 'reply', id: msg.id, ok: true, result: text }));
    } catch (e) {
      sock.send(JSON.stringify({ type: 'reply', id: msg.id, ok: false, error: e.message }));
    }
  }
}

/** Pair the waiting page that shows this code: it receives the token and becomes a normal connection. */
function pairWithCode(code) {
  const want = normCode(code);
  if (!want) throw new Error('Give the code shown on the BrainWeb page (Settings → Claude).');
  for (const [sock, c] of unpaired) {
    if (c && c === want && sock.readyState === 1) {
      sock.send(JSON.stringify({ type: 'paired', token: TOKEN }));
      acceptPage(sock);
      return { paired: true, message: 'BrainWeb is now connected to Claude. / BrainWeb מחובר עכשיו ל-Claude.' };
    }
  }
  throw new Error([...unpaired.values()].some(Boolean)
    ? 'That code does not match the open BrainWeb page. Check the code in BrainWeb (Settings → Claude) and try again.'
    : 'No BrainWeb page is waiting to pair. Open BrainWeb → ⚙ Settings → Claude to see the code.');
}

const NOT_OPEN = 'BrainWeb is not open. Ask the user to open BrainWeb in their browser (for example http://localhost:5173 after `npm run dev`) and keep the tab open, then try again. '
  + '/ BrainWeb לא פתוח: פתחו את BrainWeb בדפדפן והשאירו את הלשונית פתוחה, ונסו שוב.';
const NOT_PAIRED = 'BrainWeb is open but not paired yet. Ask the user for the pairing code shown in BrainWeb (⚙ Settings → Claude), then call brainweb_pair with it. '
  + '/ BrainWeb פתוח אבל עדיין לא מצומד: בקשו את קוד הצימוד שמופיע ב-BrainWeb (הגדרות ← Claude).';

function callPage(tool, args = {}, timeoutMs = 30000) {
  const sock = current && current.readyState === 1 ? current : [...pages].find((p) => p.readyState === 1);
  if (!sock) return Promise.reject(new Error([...unpaired.values()].some(Boolean) ? NOT_PAIRED : NOT_OPEN));
  const id = ++seq;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { calls.delete(id); reject(new Error('BrainWeb did not answer in time.')); }, timeoutMs);
    calls.set(id, { resolve, reject, timer });
    sock.send(JSON.stringify({ type: 'call', id, tool, args }));
  });
}

// ------------------------------------------------------------------ MCP tools
const mcp = new McpServer(
  { name: 'brainweb-claude', title: 'BrainWeb', version: VERSION },
  { instructions: 'BrainWeb is an interactive 3D neuroscience learning site (English + Hebrew) open in the user\'s browser. '
    + 'Use these tools to see where the user is, navigate the 3D drill-down (brain → region → cell → molecule), read lectures the user uploaded, '
    + 'and create practice tests that open on the site. Write every test field in both English and natural Hebrew.' },
);
const canSample = () => !!mcp.server.getClientCapabilities()?.sampling;
mcp.server.oninitialized = () => { log('client connected; sampling:', canSample()); broadcastHello(); };

const ok = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] });
const fail = (e) => ({ content: [{ type: 'text', text: e.message || String(e) }], isError: true });
const wrap = (fn) => async (args) => { try { return ok(await fn(args || {})); } catch (e) { return fail(e); } };

mcp.registerTool('brainweb_get_context', {
  title: 'Where is the user in BrainWeb?',
  description: 'Get the current BrainWeb page: route, current place (e.g. "cell/neuron"), the selected part if any, the site language (en/he), and the keys of all places. '
    + 'Call this first to understand what the student is looking at. / מה פתוח כרגע ב-BrainWeb.',
  inputSchema: {},
  annotations: { readOnlyHint: true },
}, wrap(() => callPage('context')));

mcp.registerTool('brainweb_pair', {
  title: 'Pair with the BrainWeb page',
  description: 'Connect the open BrainWeb page to Claude, once per browser. Use when a BrainWeb tool says the page is not paired, '
    + 'or when the user gives a BrainWeb pairing code (shown in BrainWeb under Settings → Claude, like "K7P-2QX"). / צימוד לדף BrainWeb עם הקוד שמוצג בו.',
  inputSchema: { code: z.string().describe('The pairing code shown on the BrainWeb page') },
}, wrap(({ code }) => pairWithCode(code)));

mcp.registerTool('brainweb_list_places', {
  title: 'List BrainWeb places',
  description: 'List every place you can show in the 3D drill-down (key "<level>/<scene>", English and Hebrew name, route, and where it leads), '
    + 'plus the ids of brain parts that can be highlighted in the 3D brain. Works even when the page is closed (static list). / רשימת כל המקומות באתר.',
  inputSchema: {},
  annotations: { readOnlyHint: true },
}, wrap(async () => {
  try { return await callPage('list_places'); } catch {
    return { places: STATIC_PLACES, brainParts: regions.map((r) => ({ id: r.id, name: r.name })), note: 'BrainWeb page not open; this is the built-in list.' };
  }
}));

mcp.registerTool('brainweb_show', {
  title: 'Show something in BrainWeb',
  description: 'Navigate the open BrainWeb page. Give ONE of: place (a key from brainweb_list_places, e.g. "cell/neuron", "organ/brain", "methods/fmri"); '
    + 'parts (brain part ids to highlight in the 3D brain, e.g. ["hippocampus","amygdala"]); pathway (an animated pathway id); '
    + 'or route (a site route such as "#/explore/tissue/cortex", "#/story/coffee", "#/effect/caffeine", "#/test"). / ניווט באתר.',
  inputSchema: {
    place: z.string().optional().describe('Place key "<level>/<scene>"'),
    parts: z.array(z.string()).optional().describe('Brain part ids for the 3D brain'),
    pathway: z.string().optional().describe('Animated pathway id'),
    route: z.string().optional().describe('Site route starting with #/'),
  },
}, wrap((args) => callPage('show', args)));

mcp.registerTool('brainweb_list_lectures', {
  title: 'List uploaded lectures',
  description: 'List the lecture files the student added on the "AI test from a lecture" page (id, name, length in characters). / רשימת ההרצאות שהועלו.',
  inputSchema: {},
  annotations: { readOnlyHint: true },
}, wrap(() => callPage('list_lectures')));

mcp.registerTool('brainweb_get_lecture_text', {
  title: 'Read a lecture',
  description: 'Read the text of an uploaded lecture, in chunks. Call again with a larger offset while "more" is true. / קריאת טקסט ההרצאה.',
  inputSchema: {
    id: z.string().describe('Lecture id from brainweb_list_lectures'),
    offset: z.number().int().min(0).optional().describe('Character offset (default 0)'),
    length: z.number().int().min(1000).max(100000).optional().describe('Characters to read (default 40000)'),
  },
  annotations: { readOnlyHint: true },
}, wrap((args) => callPage('get_lecture_text', args)));

const S = z.string();
const testSchema = z.object({
  title_en: S, title_he: S, summary_en: S, summary_he: S,
  multipleChoice: z.array(z.object({
    question_en: S, question_he: S,
    options_en: z.array(S).min(2).max(6), options_he: z.array(S).min(2).max(6),
    correct_index: z.number().int().min(0).describe('0-based index of the correct option'),
    explanation_en: S, explanation_he: S,
  })).describe('Multiple-choice questions (4 options) or true/false (exactly 2 options: True/False, נכון/לא נכון)'),
  matching: z.array(z.object({ pairs: z.array(z.object({ term_en: S, term_he: S, definition_en: S, definition_he: S })).min(2).max(5) })).describe('Sets of 4 term–definition pairs'),
  ordering: z.array(z.object({ title_en: S, title_he: S, steps: z.array(z.object({ en: S, he: S })).min(3).max(7).describe('Steps in the CORRECT order'), explanation_en: S, explanation_he: S })),
  labeling: z.array(z.object({ regionId: z.enum(LABELABLE), explanation_en: S, explanation_he: S })).describe('Brain structures to find in the 3D brain'),
  relatedLessonIds: z.array(S).optional().describe('Textbook subsection ids like "3.2", if known'),
});

mcp.registerTool('brainweb_create_test', {
  title: 'Create a BrainWeb test',
  description: 'Create a practice test on the BrainWeb site; it is saved under "My AI tests" and opens right away in the browser. '
    + 'Every text field needs English (_en) and natural Hebrew (_he, with the English scientific term in brackets the first time). '
    + 'Use the question types: multipleChoice, matching, ordering, labeling (brain regions). Test understanding, not trivia. '
    + 'For a lecture, read it first with brainweb_get_lecture_text. / יצירת מבחן באתר.',
  inputSchema: {
    test: testSchema,
    lectureName: z.string().optional().describe('Name to show in "My AI tests" (e.g. the lecture file name)'),
  },
}, wrap((args) => callPage('create_test', args, 60000)));

// ------------------------------------------------------------------ start
startSocket();
const transport = new StdioServerTransport();
mcp.connect(transport).then(() => log(`BrainWeb MCP server ${VERSION} ready (allowed page origins: ${[...ORIGINS].join(', ')})`));
// Exit when Claude Desktop closes the connection
const quit = () => { try { wss?.close(); } catch { /* ignore */ } process.exit(0); };
process.stdin.on('end', quit);
process.stdin.on('close', quit);
mcp.server.onclose = quit;
