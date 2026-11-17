// Vite dev-server plugin: "Sign in with ChatGPT" (ChatGPT plan usage for open-source / local apps).
// Docs: https://developers.openai.com/siwc/token-sharing-open-source
//
//   GET  /api/openai/login      → starts the OAuth (PKCE, dynamic client registration) and redirects to OpenAI
//   GET  /api/openai/status     → { connected, email, pending, error }
//   POST /api/openai/logout     → revokes the refresh token and forgets the tokens
//   GET  /api/openai/models     → models this ChatGPT account may use (visibility "list")
//   POST /api/openai/responses  → streaming proxy to POST https://api.openai.com/v1/responses (adds the token)
//   GET  /api/claude/token      → the Claude Desktop extension's pairing token, so our own page pairs automatically
//
// The OAuth callback arrives on a loopback listener at http://127.0.0.1:1455/auth/callback (OpenAI requires
// 127.0.0.1, not localhost). Tokens are stored outside the project (which may be synced to OneDrive), in a per-user
// config folder: %APPDATA%BrainWebopenai-auth.json on Windows, ~/.config/brainweb/openai-auth.json elsewhere.
// They are never sent to the page.
// Only active in `npm run dev`; the static build has no server, so ChatGPT is unavailable there.
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const ISSUER = 'https://auth.openai.com';
const AUTHORIZE = `${ISSUER}/api/accounts/authorize`;
const TOKEN = `${ISSUER}/api/accounts/oauth/token`;
const RESOURCE = 'https://api.openai.com/v1';
const SCOPES = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const PLAN_SCOPE = 'chatgpt.tokens.use.direct';
const LOOPBACK_PORT = 1455;
const CALLBACK_PATH = '/auth/callback';
const APP_NAME = 'BrainWeb';
// Responses fields this flow rejects (preview limitations)
const UNSUPPORTED = ['background', 'conversation', 'max_output_tokens', 'max_tool_calls', 'metadata', 'moderation', 'multi_agent', 'prompt',
  'prompt_cache_retention', 'safety_identifier', 'temperature', 'top_logprobs', 'top_p', 'truncation', 'user', 'previous_response_id'];

const b64url = (buf) => Buffer.from(buf).toString('base64url');
const rand = (n = 32) => b64url(crypto.randomBytes(n));

/** Per-user config folder (not inside the project, so cloud-synced project folders never hold tokens). */
export function userConfigDir() {
  if (process.platform === 'win32') return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'BrainWeb');
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'brainweb');
}

export default function aiBridge({ dir = userConfigDir() } = {}) {
  let root = process.cwd();
  let file = '';
  let appUrl = 'http://localhost:5173/';
  let pendingLogin = null; // { state, nonce, verifier, redirectUri, clientId, isNew, server, timer }
  let lastError = '';
  let refreshing = null;
  let oidc = null;
  let jose = null;

  // ---------------------------------------------------------------- storage
  const read = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; } };
  const write = (data) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };
  function hostId() {
    const d = read();
    if (!d.ext_agent_host_id) { d.ext_agent_host_id = `urn:uuid:${crypto.randomUUID()}`; write(d); }
    return d.ext_agent_host_id;
  }
  /** Earlier versions kept the tokens in <project>/.local/ — move them to the per-user folder and delete the old copy. */
  function migrateOldFile(old) {
    try {
      if (!fs.existsSync(old)) return;
      if (!fs.existsSync(file)) write(JSON.parse(fs.readFileSync(old, 'utf8')));
      fs.rmSync(old, { force: true });
      try { fs.rmdirSync(path.dirname(old)); } catch { /* folder not empty — leave it */ }
      console.log('[ai-bridge] moved ChatGPT sign-in to', file);
    } catch (e) { console.warn('[ai-bridge] could not move the old ChatGPT sign-in file:', e.message); }
  }
  const connected = (d = read()) => !!(d.account?.access_token && d.account?.refresh_token && (d.account.scopes || []).includes(PLAN_SCOPE));

  async function discovery() {
    if (oidc) return oidc;
    const r = await fetch(`${ISSUER}/.well-known/openid-configuration`);
    if (!r.ok) throw new Error(`OpenID configuration ${r.status}`);
    return (oidc = await r.json());
  }

  // ---------------------------------------------------------------- login
  function closeLoopback() {
    if (!pendingLogin) return;
    clearTimeout(pendingLogin.timer);
    pendingLogin.server?.close();
    pendingLogin = null;
  }

  function listen(port) {
    return new Promise((resolve, reject) => {
      const srv = http.createServer(onCallback);
      srv.once('error', reject);
      srv.listen(port, '127.0.0.1', () => resolve(srv));
    });
  }

  async function startLogin() {
    closeLoopback();
    lastError = '';
    const d = read();
    const saved = d.registration; // { client_id, email } — kept after sign-out so the same registration is reused
    let server;
    try { server = await listen(LOOPBACK_PORT); } catch {
      if (!saved?.client_id) throw new Error(`Port ${LOOPBACK_PORT} is busy (is Codex or another ChatGPT sign-in running?). Close it and try again.`);
      server = await listen(0); // later sign-ins may use another port
    }
    const redirectUri = `http://127.0.0.1:${server.address().port}${CALLBACK_PATH}`;
    const verifier = rand(48);
    const p = {
      state: rand(), nonce: rand(), verifier, redirectUri, server,
      clientId: saved?.client_id || '', isNew: !saved?.client_id,
      timer: setTimeout(() => { lastError = 'Sign-in timed out.'; closeLoopback(); }, 10 * 60e3),
    };
    pendingLogin = p;
    const q = new URLSearchParams({
      client_id: p.isNew ? 'dynamic_agent_client' : p.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: SCOPES,
      resource: RESOURCE,
      state: p.state,
      nonce: p.nonce,
      code_challenge_method: 'S256',
      code_challenge: b64url(crypto.createHash('sha256').update(verifier).digest()),
      ext_agent_host_id: hostId(),
    });
    if (p.isNew) q.set('agent_name_hint', APP_NAME);
    else {
      if (d.account?.id_token) q.set('id_token_hint', d.account.id_token);
      if (saved.email) q.set('login_hint', saved.email);
    }
    return `${AUTHORIZE}?${q.toString().replace(/\+/g, '%20')}`;
  }

  async function onCallback(req, res) {
    const u = new URL(req.url, 'http://127.0.0.1');
    if (u.pathname !== CALLBACK_PATH) { res.writeHead(404).end(); return; }
    const p = pendingLogin;
    const done = (ok, msg, finish = true) => {
      res.writeHead(ok ? 200 : 400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(page(ok, msg));
      if (finish) setTimeout(closeLoopback, 500);
    };
    // A wrong state never ends the real attempt (so a stray request can't cancel it)
    if (!p || u.searchParams.get('state') !== p.state) { done(false, 'This sign-in link is out of date. Start again from BrainWeb ⚙ Settings.', false); return; }
    const err = u.searchParams.get('error');
    if (err) {
      lastError = err === 'access_denied' ? 'Sign-in was cancelled, or ChatGPT plan use was not allowed.' : `Sign-in error: ${u.searchParams.get('error_description') || err}`;
      done(false, lastError);
      return;
    }
    try {
      let clientId = p.clientId;
      const cbClient = u.searchParams.get('client_id');
      if (p.isNew) {
        if (!cbClient || cbClient === 'dynamic_agent_client') throw new Error('Registration did not complete (no client id was returned).');
        clientId = cbClient;
      } else if (cbClient && cbClient !== clientId) throw new Error('The sign-in returned a different registration. Please sign out and try again.');
      const tok = await tokenRequest({
        grant_type: 'authorization_code', client_id: clientId, code: u.searchParams.get('code') || '',
        code_verifier: p.verifier, redirect_uri: p.redirectUri, resource: RESOURCE,
      });
      const claims = await verifyIdToken(tok.id_token, clientId, p.nonce);
      const scopes = String(tok.scope || '').split(/\s+/).filter(Boolean);
      if (!scopes.includes(PLAN_SCOPE)) throw new Error('ChatGPT plan use was not allowed for this sign-in, so BrainWeb cannot use ChatGPT. Sign in again and allow it.');
      const d = read();
      if (!p.isNew && d.registration?.subject && d.registration.subject !== claims.sub) throw new Error('A different ChatGPT account signed in than the one registered. Sign out first to switch accounts.');
      d.registration = { client_id: clientId, email: claims.email || '', subject: claims.sub };
      d.account = {
        email: claims.email || '', issuer: ISSUER, subject: claims.sub, client_id: clientId, ext_agent_host_id: hostId(),
        id_token: tok.id_token, access_token: tok.access_token, refresh_token: tok.refresh_token, token_type: tok.token_type,
        expires_in: tok.expires_in, scopes, saved_at: new Date().toISOString(),
      };
      write(d);
      lastError = '';
      done(true, `Signed in${claims.email ? ` as ${claims.email}` : ''}.`);
    } catch (e) {
      lastError = e.message;
      done(false, e.message);
    }
  }

  async function tokenRequest(params) {
    const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams(params) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const e = new Error(j.error_description || j.error || `Token request failed (${r.status})`);
      e.oauth = j.error;
      throw e;
    }
    return j;
  }

  async function verifyIdToken(idToken, clientId, nonce) {
    jose ||= await import('jose');
    const conf = await discovery();
    const jwks = jose.createRemoteJWKSet(new URL(conf.jwks_uri));
    const { payload } = await jose.jwtVerify(idToken, jwks, { issuer: conf.issuer || ISSUER, audience: clientId });
    if (nonce && payload.nonce !== nonce) throw new Error('ID token nonce mismatch.');
    return payload;
  }

  // ---------------------------------------------------------------- tokens
  async function freshToken(force = false) {
    const d = read();
    const a = d.account;
    if (!a?.access_token) throw Object.assign(new Error('Not signed in to ChatGPT.'), { status: 401 });
    const exp = Date.parse(a.saved_at) + (a.expires_in || 3600) * 1000;
    if (!force && exp - Date.now() > 120e3) return a.access_token;
    // Refresh tokens rotate: serialize refreshes so two requests don't race the same token.
    refreshing ||= (async () => {
      try {
        const tok = await tokenRequest({ grant_type: 'refresh_token', client_id: a.client_id, refresh_token: a.refresh_token, resource: RESOURCE });
        const cur = read();
        cur.account = {
          ...cur.account, access_token: tok.access_token, refresh_token: tok.refresh_token || cur.account.refresh_token,
          expires_in: tok.expires_in, scopes: tok.scope ? String(tok.scope).split(/\s+/) : cur.account.scopes,
          ...(tok.id_token ? { id_token: tok.id_token } : {}), saved_at: new Date().toISOString(),
        };
        write(cur);
        return cur.account.access_token;
      } catch (e) {
        if (e.oauth === 'invalid_grant') {
          const cur = read();
          delete cur.account; // keep the registration and host id for the next sign-in
          write(cur);
          lastError = 'Your ChatGPT sign-in has ended. Please sign in again.';
          throw Object.assign(new Error(lastError), { status: 401 });
        }
        throw e;
      } finally { refreshing = null; }
    })();
    return refreshing;
  }

  async function logout() {
    closeLoopback();
    const d = read();
    const a = d.account;
    let revoked = true;
    if (a?.refresh_token) {
      try {
        const conf = await discovery();
        const r = await fetch(conf.revocation_endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: a.refresh_token, token_type_hint: 'refresh_token', client_id: a.client_id }) });
        revoked = r.ok;
      } catch { revoked = false; }
    }
    delete d.account;
    write(d);
    return { ok: true, revoked };
  }

  // ---------------------------------------------------------------- HTTP helpers
  const json = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); };
  const readBody = (req) => new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => { size += c.length; if (size > 8e6) { reject(new Error('Request too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
  /** Only our own page may call the API endpoints (blocks other websites from using the session). */
  function sameOrigin(req) {
    if (req.headers['x-brainweb'] !== '1') return false;
    const origin = req.headers.origin;
    if (!origin) return true; // same-origin GET requests carry no Origin header
    try { return new URL(origin).host === req.headers.host; } catch { return false; }
  }

  function sanitize(body) {
    const b = { ...body };
    for (const k of UNSUPPORTED) delete b[k];
    // No system-role items: move them into `instructions`
    if (Array.isArray(b.input)) {
      const sys = b.input.filter((m) => m?.role === 'system');
      if (sys.length) {
        b.instructions = [b.instructions, ...sys.map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)))].filter(Boolean).join('\n\n');
        b.input = b.input.filter((m) => m?.role !== 'system');
      }
    } else if (typeof b.input === 'string') b.input = [{ role: 'user', content: b.input }];
    b.store = false;
    b.stream = true;
    return b;
  }

  async function proxyResponses(req, res) {
    const body = sanitize(JSON.parse((await readBody(req)) || '{}'));
    // Abort the upstream request as soon as the page goes away (tab closed, request cancelled).
    const ac = new AbortController();
    res.on('close', () => ac.abort());
    const call = (token) => fetch(`${RESOURCE}/responses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(body),
      signal: ac.signal,
    });
    let r = await call(await freshToken());
    if (r.status === 401) { await r.body?.cancel().catch(() => {}); r = await call(await freshToken(true)); }
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      json(res, r.status, { error: j.error?.message || `OpenAI error ${r.status}`, code: j.error?.code || '' });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    try {
      // pipeline() forwards errors and cleans up both sides; an upstream reset only ends this response.
      await pipeline(Readable.fromWeb(r.body), res);
    } catch (e) {
      if (!ac.signal.aborted) console.warn('[ai-bridge] ChatGPT stream ended early:', e.code || e.message);
      res.destroy();
    }
  }

  async function models(res) {
    const token = await freshToken();
    let r = await fetch(`${RESOURCE}/models`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 401) r = await fetch(`${RESOURCE}/models`, { headers: { Authorization: `Bearer ${await freshToken(true)}` } });
    if (!r.ok) { json(res, r.status, { error: `Could not list models (${r.status})` }); return; }
    const j = await r.json();
    const list = (j.models || j.data || []).filter((m) => m.visibility === 'list').map((m) => ({ slug: m.slug || m.id, display_name: m.display_name || m.slug || m.id }));
    json(res, 200, { models: list });
  }

  // ---------------------------------------------------------------- plugin
  return {
    name: 'brainweb-ai-bridge',
    apply: 'serve',
    configResolved(cfg) {
      root = cfg.root;
      file = path.join(dir, 'openai-auth.json');
      migrateOldFile(path.resolve(root, '.local', 'openai-auth.json'));
    },
    configureServer(server) {
      server.httpServer?.once('listening', () => { appUrl = server.resolvedUrls?.local?.[0] || appUrl; });
      server.httpServer?.once('close', closeLoopback);
      // Claude Desktop extension pairing: hand our own page the extension's secret so it pairs without a code.
      // (The extension writes it to the same per-user folder; see mcp/brainweb-claude/src/server.js.)
      server.middlewares.use('/api/claude/token', (req, res) => {
        if (!sameOrigin(req)) { json(res, 403, { error: 'Forbidden' }); return; }
        let token = '';
        try { token = JSON.parse(fs.readFileSync(path.join(dir, 'claude-bridge.json'), 'utf8')).token || ''; } catch { /* extension not run yet */ }
        json(res, 200, { token });
      });
      server.middlewares.use('/api/openai', async (req, res) => {
        const route = (req.url || '/').split('?')[0];
        try {
          if (route === '/login' && req.method === 'GET') {
            // Opened as a new tab from the settings page; a top-level navigation, so no custom header.
            const site = req.headers['sec-fetch-site'];
            if (site && site !== 'same-origin' && site !== 'none') { json(res, 403, { error: 'Forbidden' }); return; }
            const url = await startLogin();
            res.writeHead(302, { Location: url, 'Cache-Control': 'no-store' });
            res.end();
            return;
          }
          if (!sameOrigin(req)) { json(res, 403, { error: 'Forbidden' }); return; }
          if (route === '/status') json(res, 200, { available: true, connected: connected(), email: read().account?.email || '', pending: !!pendingLogin, error: lastError });
          else if (route === '/logout' && req.method === 'POST') json(res, 200, await logout());
          else if (route === '/models') await models(res);
          else if (route === '/responses' && req.method === 'POST') await proxyResponses(req, res);
          else json(res, 404, { error: 'Not found' });
        } catch (e) {
          if (!res.headersSent) json(res, e.status || 500, { error: e.message || String(e) });
          else res.end();
        }
      });
    },
  };

  function page(ok, msg) {
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const back = `${appUrl.replace(/\/$/, '')}/#/settings`;
    return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BrainWeb · ChatGPT</title>
<body style="font-family:system-ui,sans-serif;background:#f4efe3;color:#22304a;display:grid;place-items:center;min-height:90vh;margin:0">
<div style="max-width:460px;background:#fffdf7;border:1px solid #d8cdb6;border-radius:14px;padding:24px;text-align:center">
<h2>${ok ? '✅ ChatGPT connected' : '⚠️ ChatGPT not connected'}</h2><p>${esc(msg)}</p>
<p dir="rtl">${ok ? 'ChatGPT מחובר. אפשר לסגור את הלשונית הזו ולחזור ל-BrainWeb.' : 'ההתחברות ל-ChatGPT לא הצליחה. נסו שוב מההגדרות ב-BrainWeb.'}</p>
<p><a href="${esc(back)}">← BrainWeb</a></p></div>
${ok ? '<script>setTimeout(()=>window.close(),1500)</script>' : ''}</body>`;
  }
}
