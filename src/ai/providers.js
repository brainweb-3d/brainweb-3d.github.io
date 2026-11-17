// Contract 2 — one entry point for every AI feature on the site.
//   askJSON({ system, user, schema, maxTokens, effort }) → parsed JSON from whichever AI is connected
//   hasAI(), onAiChange(fn), activeProvider()
// Providers (in default order of preference):
//   'claude-key'  Claude with the user's own Anthropic API key (Settings → Advanced)
//   'chatgpt'     Sign in with ChatGPT (only when the site runs locally with `npm run dev`)
//   'gemini'      Google sign-in
//   'claude-mcp'  Claude Desktop through the BrainWeb extension — only if Claude Desktop supports
//                 MCP "sampling"; otherwise Claude Desktop drives the site through its tools instead.
import { askClaudeJSON, hasClaudeKey, getAiSettings, MODELS } from './claude.js';
import { askOpenAIJSON, openaiStatus, refreshOpenAI, OPENAI_AVAILABLE } from './openai.js';
import { askGeminiJSON, geminiUsable, geminiStatus } from './gemini.js';
import { bridgeState, sampleJSON, startBridge } from './claudeBridge.js';
import { load, save } from '../store.js';
import { onAiChange, emitAiChange } from './bus.js';

export { onAiChange };

export const PROVIDER_NAMES = {
  'claude-key': { en: 'Claude (API key)', he: 'Claude (מפתח API)' },
  chatgpt: { en: 'ChatGPT', he: 'ChatGPT' },
  gemini: { en: 'Gemini', he: 'Gemini' },
  'claude-mcp': { en: 'Claude Desktop', he: 'Claude Desktop' },
};
const ORDER = ['claude-key', 'chatgpt', 'gemini', 'claude-mcp'];

/** Which providers can answer askJSON right now. */
function usable(id) {
  switch (id) {
    case 'claude-key': return hasClaudeKey();
    case 'chatgpt': return OPENAI_AVAILABLE && openaiStatus().connected;
    case 'gemini': return geminiUsable();
    case 'claude-mcp': { const b = bridgeState(); return b.status === 'connected' && b.sampling; }
    default: return false;
  }
}

export const getPreferredProvider = () => load('aiPrefs', {}).provider || '';
export function setPreferredProvider(id) { save('aiPrefs', { ...load('aiPrefs', {}), provider: id }); emitAiChange(); }

/** The provider askJSON will use, or null. */
export function activeProvider() {
  const pref = getPreferredProvider();
  if (pref && usable(pref)) return pref;
  return ORDER.find(usable) || null;
}
export const usableProviders = () => ORDER.filter(usable);
export const hasAI = () => !!activeProvider();

/** A short "Claude Opus 5.5" / "ChatGPT" / … label for the active provider. */
export function activeLabel(lang = 'en') {
  const id = activeProvider();
  if (!id) return '';
  if (id === 'claude-key') return MODELS.find((m) => m.id === getAiSettings().model)?.en.split(' —')[0] || 'Claude';
  return PROVIDER_NAMES[id][lang] || PROVIDER_NAMES[id].en;
}

/** Snapshot of every connection, for the settings page. */
export function providerStatus() {
  return {
    'claude-key': { connected: hasClaudeKey() },
    chatgpt: { ...openaiStatus() },
    gemini: { ...geminiStatus() },
    'claude-mcp': { ...bridgeState() },
  };
}

export function noProviderError() {
  const e = new Error('No AI is connected. Connect Claude, ChatGPT or Gemini in ⚙ Settings.');
  e.code = 'NO_PROVIDER';
  return e;
}

/** Ask the connected AI for a JSON answer that follows `schema`. */
export async function askJSON({ system, user, schema, maxTokens = 16000, effort = 'medium' }) {
  const id = activeProvider();
  const args = { system, user, schema, maxTokens, effort };
  switch (id) {
    case 'claude-key': return askClaudeJSON(args);
    case 'chatgpt': return askOpenAIJSON(args);
    case 'gemini': return askGeminiJSON(args);
    case 'claude-mcp': return sampleJSON(args);
    default: throw noProviderError();
  }
}

/** Re-check connections that live outside the browser (ChatGPT dev server, Claude Desktop bridge). */
export function refreshAiStatus() {
  refreshOpenAI();
  startBridge();
}

// Start-up: check the ChatGPT dev-server session and reconnect to Claude Desktop if the user set it up before.
if (typeof window !== 'undefined') setTimeout(refreshAiStatus, 0);
