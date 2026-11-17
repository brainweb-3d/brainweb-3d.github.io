// node orbit.mjs <outDir> <place> [place…]  — env MODE=interactive|real|both (default both when a model exists)
// For each place: 8 views (front, right, back, left, above, below, 3/4 close, 3/4 high) at the home distance,
// sheet per place+mode: <outDir>/<place>_<mode>.jpg (4×2 tiles). Reports page errors.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { createRequire } from 'node:module'; const sharp = createRequire('C:/Users/libon/OneDrive/שולחן העבודה/BrainWeb/package.json')('sharp');
const [OUT, ...places] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 960, height: 600 } });
await ctx.addInitScript(() => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); } catch {} });
const p = await ctx.newPage();
let errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const VIEWS = [['front', 0, 0, 1], ['right', 90, 0, 1], ['back', 180, 0, 1], ['left', -90, 0, 1], ['above', 0, 80, 1], ['below', 0, -80, 1], ['close', 35, 15, 0.45], ['high', -40, 40, 0.8]];
for (const place of places) {
  errs = [];
  await p.goto(`http://localhost:5173/#/explore/${place}`); await p.waitForTimeout(300); await p.reload(); await p.waitForTimeout(8000);
  if (await p.evaluate(() => document.getElementById('xwSheet')?.getAttribute('aria-hidden') !== 'false')) { await p.click('#xwInfo').catch(() => {}); await p.waitForTimeout(600); }
  const hasModel = await p.evaluate(() => !!document.querySelector('[data-mode="real"]'));
  const modes = process.env.MODE === 'interactive' ? ['interactive'] : process.env.MODE === 'real' ? ['real'] : hasModel ? ['interactive', 'real'] : ['interactive'];
  for (const mode of modes) {
    if (hasModel && await p.evaluate(() => document.getElementById('xwSheet')?.getAttribute('aria-hidden') !== 'false')) { await p.click('#xwInfo').catch(() => {}); await p.waitForTimeout(600); }
    if (hasModel) { await p.evaluate((mode) => { document.querySelector(`[data-mode="${mode}"]`)?.click(); }, mode); await p.waitForTimeout(2500); }
    // close the info sheet so it doesn't cover the view
    await p.evaluate(() => { const s = document.getElementById('xwSheet'); if (s && s.getAttribute('aria-hidden') === 'false') document.querySelector('#xwSheet [aria-label*="Close"], #xwSheet .xw-close, #xwClose')?.click(); });
    await p.waitForTimeout(600);
    const tiles = [];
    for (const [name, az, el, k] of VIEWS) {
      await p.evaluate(({ az, el, k }) => {
        const w = window.__bwWorld(); const v = w.current; const h = v.homeView();
        const d = h.position.distanceTo(h.target) * k;
        const base = h.position.clone().sub(h.target).normalize();
        const yaw0 = Math.atan2(base.x, base.z);
        const a = yaw0 + az * Math.PI / 180, e = el * Math.PI / 180;
        v.engine.tween = null;
        v.controls.target.copy(h.target);
        v.camera.position.set(h.target.x + d * Math.cos(e) * Math.sin(a), h.target.y + d * Math.sin(e), h.target.z + d * Math.cos(e) * Math.cos(a));
        v.camera.up.set(0, 1, 0); v.camera.lookAt(h.target);
        v.settleControls(); v.engine.needsRender = true;
      }, { az, el, k });
      await p.waitForTimeout(700);
      const buf = await p.screenshot({ type: 'jpeg', quality: 70, clip: { x: 0, y: 56, width: 960, height: 544 } });
      tiles.push(await sharp(buf).resize(320, 181).composite([{ input: Buffer.from(`<svg width="320" height="181"><rect width="70" height="18" fill="#000a"/><text x="4" y="13" font-size="12" fill="#fff" font-family="sans-serif">${name}</text></svg>`), top: 0, left: 0 }]).jpeg().toBuffer());
    }
    const sheet = sharp({ create: { width: 1280, height: 362, channels: 3, background: '#000' } }).composite(tiles.map((t, i) => ({ input: t, left: (i % 4) * 320, top: Math.floor(i / 4) * 181 })));
    await sheet.jpeg({ quality: 72 }).toFile(`${OUT}/${place.replace('/', '_')}_${mode}.jpg`);
  }
  console.log(`${errs.length ? 'ERR' : 'ok '} ${place} ${hasModel ? '(model)' : ''} ${errs.join(' | ').slice(0, 300)}`);
}
await b.close();
