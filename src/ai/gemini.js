// Gemini through Google sign-in (Google Identity Services token client, OAuth in the browser).
// Needs a one-time setup by the site owner: an OAuth "Web" client ID and a Google Cloud project ID
// (from .env as VITE_GOOGLE_CLIENT_ID / VITE_GOOGLE_PROJECT_ID, or typed into ⚙ Settings).
// Access tokens last about an hour and are kept only in this tab's memory (never in browser storage).
import { load, save } from '../store.js';
import { emitAiChange, parseJSONLoose, jsonInstruction } from './bus.js';

const SCOPES = 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/generative-language.retriever';
const API = 'https://generativelanguage.googleapis.com/v1beta';
const ENV_CLIENT = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const ENV_PROJECT = import.meta.env.VITE_GOOGLE_PROJECT_ID || '';

export function getGoogleConfig() {
  const s = load('aiPrefs', {});
  return {
    clientId: (s.googleClientId || ENV_CLIENT).trim(),
    projectId: (s.googleProjectId || ENV_PROJECT).trim(),
    fromEnv: { clientId: !!ENV_CLIENT, projectId: !!ENV_PROJECT },
  };
}
export function saveGoogleConfig({ clientId, projectId }) {
  save('aiPrefs', { ...load('aiPrefs', {}), googleClientId: clientId?.trim() || '', googleProjectId: projectId?.trim() || '' });
  tokenClient = null;
  emitAiChange();
}
export const geminiConfigured = () => { const c = getGoogleConfig(); return !!(c.clientId && c.projectId); };

// ---- token: memory only (a reload needs one click on Gemini to sign in again) ----
let token = null; // { access_token, exp }
try { sessionStorage.removeItem('brainweb.gemini'); } catch { /* left over from an earlier version */ }
const tokenValid = () => {
  if (token && token.exp <= Date.now() + 60e3) token = null; // drop expired tokens
  return !!token;
};
const wasConnected = () => !!load('aiPrefs', {}).geminiConnected;

export const geminiStatus = () => ({
  configured: geminiConfigured(),
  connected: tokenValid(),
  expired: !tokenValid() && wasConnected(),
});
/** Usable for AI requests: a valid token, or an earlier sign-in that can be renewed with one click. */
export const geminiUsable = () => geminiConfigured() && (tokenValid() || wasConnected());

let gisPromise = null;
function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  gisPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { gisPromise = null; reject(new Error('Could not load Google sign-in. Check your internet connection.')); };
    document.head.appendChild(s);
  });
  return gisPromise;
}

/** Start loading Google's script ahead of the click (errors are reported on the click instead). */
export const preloadGis = () => { loadGis().catch(() => {}); };

let tokenClient = null;
let pending = null; // callbacks of the one sign-in in flight
let inFlight = null; // a second request while one is open reuses it instead of overwriting its callbacks
function requestToken(prompt) {
  if (inFlight) return inFlight;
  const { clientId } = getGoogleConfig();
  if (!clientId) return Promise.reject(new Error('Add your Google OAuth client ID in ⚙ Settings first.'));
  inFlight = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending = null; reject(new Error('Google sign-in did not finish. Please try again.')); }, 5 * 60e3);
    pending = { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } };
    tokenClient ||= window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp) => {
        const p = pending; pending = null;
        if (resp.error) return p?.reject(new Error(googleError(resp.error, resp.error_description)));
        if (!window.google.accounts.oauth2.hasGrantedAllScopes(resp, ...SCOPES.split(' '))) {
          return p?.reject(new Error('Please allow all the requested Google permissions — Gemini needs them.'));
        }
        token = { access_token: resp.access_token, exp: Date.now() + (+resp.expires_in || 3600) * 1000 };
        save('aiPrefs', { ...load('aiPrefs', {}), geminiConnected: true });
        emitAiChange();
        p?.resolve(token.access_token);
      },
      error_callback: (err) => {
        const p = pending; pending = null;
        p?.reject(new Error(err?.type === 'popup_closed' ? 'The Google sign-in window was closed.'
          : err?.type === 'popup_failed_to_open' ? 'The browser blocked the Google sign-in window. Click "Gemini" in ⚙ Settings to sign in again.'
            : 'Google sign-in failed.'));
      },
    });
    tokenClient.requestAccessToken({ prompt });
  }).finally(() => { inFlight = null; });
  return inFlight;
}

function googleError(code, desc) {
  if (code === 'access_denied') return 'Google sign-in was cancelled or not allowed. If you see "access blocked", add your Google account as a test user (setup step 3).';
  return `Google sign-in error: ${desc || code}`;
}

/** Sign in with Google (call from a click). */
export async function geminiLogin() {
  await loadGis();
  return requestToken(wasConnected() ? '' : 'consent');
}

export function geminiLogout() {
  if (token && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(token.access_token, () => {});
  token = null;
  save('aiPrefs', { ...load('aiPrefs', {}), geminiConnected: false });
  modelCache = null;
  emitAiChange();
}

async function accessToken() {
  if (tokenValid()) return token.access_token;
  // Expired: try to renew quietly (works while the click that started this is still "fresh" for the popup blocker)
  try {
    await loadGis();
    return await requestToken('');
  } catch (e) {
    const err = new Error('Your Google sign-in has expired (it lasts an hour). Click "Gemini" in ⚙ Settings to sign in again. ' + (e.message || ''));
    err.code = 'REAUTH';
    throw err;
  }
}

async function gfetch(path, init = {}) {
  const t = await accessToken();
  const r = await fetch(`${API}/${path}`, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${t}`, 'x-goog-user-project': getGoogleConfig().projectId, 'Content-Type': 'application/json' },
  });
  if (r.status === 401) { token = null; emitAiChange(); }
  return r;
}

async function apiError(r) {
  const j = await r.json().catch(() => ({}));
  const msg = j.error?.message || r.statusText;
  if (r.status === 403 && /SERVICE_DISABLED|has not been used|is disabled/i.test(msg)) return new Error('The Generative Language API is not enabled in your Google Cloud project (setup step 2).');
  if (r.status === 403) return new Error('Google refused the request: ' + msg);
  if (r.status === 429) return new Error('Gemini rate limit reached — wait a minute and try again.');
  const e = new Error(`Gemini error ${r.status}: ${msg}`);
  e.status = r.status;
  return e;
}

// ---- models ----
let modelCache = null;
export async function listGeminiModels() {
  if (modelCache) return modelCache;
  const r = await gfetch('models?pageSize=200');
  if (!r.ok) throw await apiError(r);
  const j = await r.json();
  modelCache = (j.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent') && /gemini/i.test(m.name) && !/embedding|image|tts|audio|live/i.test(m.name))
    .map((m) => ({ id: m.name.replace(/^models\//, ''), name: m.displayName || m.name }));
  return modelCache;
}
export const getGeminiModel = () => load('aiPrefs', {}).geminiModel || '';
export function setGeminiModel(id) { save('aiPrefs', { ...load('aiPrefs', {}), geminiModel: id }); }

async function pickModel() {
  const saved = getGeminiModel();
  if (saved) return saved;
  const models = await listGeminiModels();
  // Prefer the newest "pro" model, then any non-preview model
  const score = (m) => (/pro/i.test(m.id) ? 4 : 0) + (/flash/i.test(m.id) ? 2 : 0) + (/preview|exp/i.test(m.id) ? -1 : 0) + (parseFloat(m.id.match(/(\d+(?:\.\d+)?)/)?.[1]) || 0) / 10;
  const best = [...models].sort((a, b) => score(b) - score(a))[0];
  if (!best) throw new Error('No Gemini models are available for this project.');
  return best.id;
}

/** Ask Gemini for JSON that follows `schema` (JSON-schema output; falls back to JSON instructions). */
export async function askGeminiJSON({ system, user, schema, maxTokens = 16000 }) {
  const model = await pickModel();
  const call = async (structured) => {
    const body = {
      systemInstruction: { parts: [{ text: structured ? system : system + jsonInstruction(schema) }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: Math.max(maxTokens, 8192), responseMimeType: 'application/json', ...(structured ? { responseJsonSchema: schema } : {}) },
    };
    const r = await gfetch(`models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', body: JSON.stringify(body) });
    if (!r.ok) throw await apiError(r);
    const j = await r.json();
    const c = j.candidates?.[0];
    if (!c) throw new Error('Gemini gave no answer' + (j.promptFeedback?.blockReason ? ` (blocked: ${j.promptFeedback.blockReason}).` : '.'));
    if (c.finishReason === 'MAX_TOKENS') throw new Error('The Gemini answer was too long. Try a shorter file or question.');
    if (c.finishReason === 'SAFETY') throw new Error('Gemini declined this request. Try rephrasing it.');
    return parseJSONLoose((c.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join(''));
  };
  try {
    return await call(true);
  } catch (e) {
    if (e.status === 400) return call(false); // schema feature not accepted by this model
    throw e;
  }
}
