// ChatGPT through "Sign in with ChatGPT" (uses the visitor's own ChatGPT plan).
// The OAuth tokens never reach the browser: they live in the local dev server (tools/vite-ai-bridge.mjs),
// which signs in, refreshes and forwards Responses API calls. So this works only when the site runs
// locally with `npm run dev`; in the static build the ChatGPT button is shown disabled.
import { load, save } from '../store.js';
import { emitAiChange, parseJSONLoose, jsonInstruction } from './bus.js';

export const OPENAI_AVAILABLE = !!import.meta.env.DEV;
const H = { 'X-BrainWeb': '1' };

let status = { available: OPENAI_AVAILABLE, connected: false, email: '', pending: false, error: '', checked: false };
export const openaiStatus = () => status;

function setStatus(next) {
  const changed = ['connected', 'email', 'pending', 'error'].some((k) => next[k] !== status[k]);
  status = { ...status, ...next, checked: true };
  if (changed) emitAiChange();
}

/** Ask the local dev server whether ChatGPT is signed in. */
export async function refreshOpenAI() {
  if (!OPENAI_AVAILABLE) return status;
  try {
    const r = await fetch('/api/openai/status', { headers: H });
    if (!r.ok) throw new Error(String(r.status));
    const s = await r.json();
    setStatus({ connected: !!s.connected, email: s.email || '', pending: !!s.pending, error: s.error || '' });
  } catch {
    setStatus({ connected: false, pending: false, error: '' });
  }
  return status;
}

let pollTimer = null;
/** Open the ChatGPT sign-in in a new tab and watch for it to finish (polls only while a sign-in is pending). */
export function openaiLogin() {
  if (!OPENAI_AVAILABLE) return;
  window.open('/api/openai/login', '_blank', 'noopener');
  setStatus({ pending: true, error: '' });
  clearInterval(pollTimer);
  const started = Date.now();
  pollTimer = setInterval(async () => {
    await refreshOpenAI();
    if (status.connected || status.error || !status.pending || Date.now() - started > 5 * 60e3) {
      clearInterval(pollTimer);
      if (!status.connected && status.pending) setStatus({ pending: false });
    }
  }, 2000);
}

export async function openaiLogout() {
  if (!OPENAI_AVAILABLE) return;
  try {
    const r = await fetch('/api/openai/logout', { method: 'POST', headers: H });
    const out = await r.json().catch(() => ({}));
    setStatus({ connected: false, email: '', pending: false, error: '' });
    return out;
  } finally {
    await refreshOpenAI();
  }
}

// ---- models ----
let modelCache = null;
/** Models the signed-in ChatGPT account may use: [{ slug, name }]. */
export async function listOpenAIModels() {
  if (modelCache) return modelCache;
  const r = await fetch('/api/openai/models', { headers: H });
  if (!r.ok) throw new Error(`Could not load the ChatGPT model list (${r.status}).`);
  const j = await r.json();
  modelCache = (j.models || []).map((m) => ({ slug: m.slug, name: m.display_name || m.slug }));
  return modelCache;
}
export const getOpenAIModel = () => load('aiPrefs', {}).openaiModel || '';
export function setOpenAIModel(slug) { save('aiPrefs', { ...load('aiPrefs', {}), openaiModel: slug }); }

async function pickModel() {
  const saved = getOpenAIModel();
  const models = await listOpenAIModels().catch(() => []);
  if (saved && (!models.length || models.some((m) => m.slug === saved))) return saved;
  if (!models.length) throw new Error('No ChatGPT models are available for this account.');
  return models[0].slug; // the server's own order puts the recommended model first
}

// ---- inference ----
/** Read the Responses API event stream until response.completed; returns the output text. */
async function readStream(res) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let text = '';
  let done = false;
  const handle = (ev) => {
    if (ev.type === 'response.output_text.delta') text += ev.delta || '';
    else if (ev.type === 'response.completed') {
      done = true;
      // Prefer the final full text if present
      const full = (ev.response?.output || []).flatMap((o) => o.content || []).filter((c) => c.type === 'output_text').map((c) => c.text).join('');
      if (full) text = full;
    } else if (ev.type === 'response.failed' || ev.type === 'error') {
      const code = ev.response?.error?.code || ev.error?.code || ev.code || 'unknown_error';
      const err = new Error(friendlyCode(code, ev.response?.error?.message || ev.message));
      err.code = code;
      throw err;
    } else if (ev.type === 'response.incomplete') {
      throw new Error('The ChatGPT answer was cut off (too long). Try a shorter file or question.');
    }
  };
  for (;;) {
    const { value, done: end } = await reader.read();
    if (end) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const data = chunk.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n');
      if (!data || data === '[DONE]') continue;
      let ev;
      try { ev = JSON.parse(data); } catch { continue; }
      handle(ev);
    }
  }
  if (!done) throw new Error('The connection to ChatGPT ended before the answer was complete. Please try again.');
  return text;
}

function friendlyCode(code, msg) {
  if (/usage_limit_exceeded/.test(code)) return 'You have reached your ChatGPT plan\'s usage limit for now. Try again later or connect another AI.';
  if (/usage_unavailable/.test(code)) return 'ChatGPT plan usage is not available for this account right now.';
  return `ChatGPT error: ${msg || code}`;
}

async function post(body) {
  const r = await fetch('/api/openai/responses', { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    const err = new Error(j.error || `ChatGPT request failed (${r.status}).`);
    err.status = r.status;
    if (r.status === 401) { setStatus({ connected: false }); err.message = 'ChatGPT sign-in expired. Sign in again in ⚙ Settings.'; }
    throw err;
  }
  return readStream(r);
}

/** Ask ChatGPT for JSON that follows `schema` (structured outputs; falls back to plain JSON instructions). */
export async function askOpenAIJSON({ system, user, schema, effort = 'medium' }) {
  if (!OPENAI_AVAILABLE) throw new Error('ChatGPT works only when BrainWeb runs on your computer (npm run dev).');
  const model = await pickModel();
  const base = { model, instructions: system, input: [{ role: 'user', content: user }] };
  try {
    const text = await post({ ...base, reasoning: { effort }, text: { format: { type: 'json_schema', name: 'brainweb_answer', schema, strict: true } } });
    return parseJSONLoose(text);
  } catch (e) {
    if (e.status !== 400) throw e;
    // Some models don't accept strict schemas or reasoning effort: ask for JSON in the instructions instead.
    const text = await post({ ...base, instructions: system + jsonInstruction(schema) });
    return parseJSONLoose(text);
  }
}
