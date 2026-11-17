// Advanced option: Claude through the user's own Anthropic API key (⚙ Settings → Advanced).
// The key is stored only in this browser (localStorage) and sent only to api.anthropic.com.
// The Anthropic SDK is loaded only when Claude is first used, so the site itself stays fast.
let Anthropic = null;
const loadSdk = async () => (Anthropic ||= (await import('@anthropic-ai/sdk')).default);
import { load, save } from '../store.js';
import { emitAiChange } from './bus.js';
// Old names kept so existing imports keep working: hasClaude = any AI connected, onAiChange = connection changes.
export { hasAI as hasClaude, onAiChange } from './providers.js';

export const MODELS = [
  { id: 'claude-opus-5-5', en: 'Claude Opus 5.5 — best quality (default)', he: 'Claude Opus 5.5 — האיכות הטובה ביותר (ברירת מחדל)' },
  { id: 'claude-sonnet-5-5', en: 'Claude Sonnet 5.5 — faster, about half the cost', he: 'Claude Sonnet 5.5 — מהיר יותר, כמחצית מהעלות' },
  { id: 'claude-haiku-5-5', en: 'Claude Haiku 5.5 — fastest, cheapest', he: 'Claude Haiku 5.5 — המהיר והזול ביותר' },
];

export function getAiSettings() {
  const s = load('ai', {});
  return { key: s.key || '', model: MODELS.some((m) => m.id === s.model) ? s.model : MODELS[0].id };
}
export function saveAiSettings(s) { save('ai', { ...getAiSettings(), ...s }); notify(); }
export function clearAiKey() { save('ai', { ...getAiSettings(), key: '' }); notify(); }
/** True when an Anthropic API key is saved (the advanced Claude option). */
export const hasClaudeKey = () => !!getAiSettings().key;
const notify = () => emitAiChange();

async function client() {
  await loadSdk();
  const { key } = getAiSettings();
  if (!key) throw new Error('No Claude API key. Add one in ⚙ Settings.');
  // The user's own key, used directly from their browser (this site has no server).
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 2 });
}

/**
 * Ask Claude for a JSON answer that follows `schema` (structured outputs).
 * Streams under the hood so long answers don't time out; returns the parsed object.
 */
export async function askClaudeJSON({ system, user, schema, maxTokens = 16000, effort = 'medium', model }) {
  const c = await client();
  const m = model || getAiSettings().model;
  const params = {
    model: m,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { effort, format: { type: 'json_schema', schema } },
  };
  // Opus/Sonnet: if a safety classifier declines, let the API retry on a suitable fallback model.
  const useFallback = m !== 'claude-haiku-5-5';
  let msg;
  try {
    msg = useFallback
      ? await c.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }).finalMessage()
      : await c.messages.stream(params).finalMessage();
  } catch (e) {
    // If the optional fallback feature isn't available for this account, retry once without it
    if (useFallback && e instanceof Anthropic.BadRequestError && /fallback|beta/i.test(e.message || '')) {
      try { msg = await c.messages.stream(params).finalMessage(); } catch (e2) { throw friendlyError(e2); }
    } else {
      throw friendlyError(e);
    }
  }
  if (msg.stop_reason === 'refusal') throw new Error('Claude declined this request. Try rephrasing it.');
  if (msg.stop_reason === 'max_tokens') throw new Error('The answer was too long. Try a shorter file or question.');
  const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return JSON.parse(text);
}

/** Quick check that the saved key works. */
export async function testClaude() {
  const out = await askClaudeJSON({
    system: 'You are a connection test.',
    user: 'Reply with ok=true.',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false },
    maxTokens: 2000,
    effort: 'low',
  });
  return out.ok === true;
}

function friendlyError(e) {
  if (!Anthropic) return e;
  const detail = e?.error?.error?.message || e?.message || '';
  if (e instanceof Anthropic.AuthenticationError) return new Error('Anthropic rejected this API key — it may be incomplete, deleted, or mistyped. In ⚙ Settings, paste the full key again (about 100 characters, starting with "sk-ant-").');
  if (e instanceof Anthropic.PermissionDeniedError) return new Error('This API key is not allowed to use that model. Try another model in ⚙ Settings. (' + detail + ')');
  if (e instanceof Anthropic.RateLimitError) return new Error('Too many requests right now — wait a moment and try again.');
  if (e instanceof Anthropic.BadRequestError && /credit|balance|billing/i.test(detail)) return new Error('Your Anthropic account has no credit yet. Add credit at console.anthropic.com → Settings → Billing, then try again.');
  if (e instanceof Anthropic.NotFoundError) return new Error('This model is not available for your account. Choose another model in ⚙ Settings.');
  if (e instanceof Anthropic.BadRequestError) return new Error('Claude could not process this request: ' + detail);
  if (e instanceof Anthropic.APIConnectionError) return new Error('Could not reach Claude. Check your internet connection.');
  if (e instanceof Anthropic.APIError) return new Error(`Claude error ${e.status}: ${e.message}`);
  return e;
}
