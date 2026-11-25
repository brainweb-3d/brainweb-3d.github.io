// Headless check of the attention test: a bot answers with known delays per condition, then we read the scores.
// Expected: alerting ≈ 40 ms, orienting ≈ 30 ms, executive ≈ 80 ms (+ timer noise).
import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 760 } });
await ctx.addInitScript(() => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); } catch {} });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('http://localhost:5173/#/explore/organ/path/attention'); await p.waitForTimeout(9000);
await p.click('[data-bt="tryIt"]'); await p.waitForTimeout(500);
await p.screenshot({ path: process.argv[2] + '/attn-1-intro.png' });
await p.evaluate(() => {
  // cue seen this trial: none | center | double | spatial ; delay = 420 base −40 if warned −30 more if spatial +80 if incongruent
  let cue = 'none', seenStars = 0;
  window.__bot = setInterval(() => {
    const d = document.querySelector('dialog.attn-dialog'); if (!d) return;
    const go = d.querySelector('[data-start]'); if (go && !go.__clicked) { go.__clicked = true; setTimeout(() => go.click(), 200); return; }
    const up = d.querySelector('.attn-slot.up')?.textContent || '', dn = d.querySelector('.attn-slot.down')?.textContent || '', c = d.querySelector('.attn-cue.c')?.textContent || '';
    if (c === '*') cue = 'center';
    else if (up === '*' && dn === '*') cue = 'double';
    else if ((up === '*') !== (dn === '*')) cue = 'spatial';
    const txt = up.length === 9 ? up : dn.length === 9 ? dn : '';
    if (txt && !window.__busy) {
      window.__busy = true;
      const mid = txt[4], inc = txt[0] !== mid;
      const delay = 420 - (cue !== 'none' ? 40 : 0) - (cue === 'spatial' ? 30 : 0) + (inc ? 80 : 0);
      // center cue alerts too: in the ANT, alerting = none − double, orienting = center − spatial
      setTimeout(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: mid === '→' ? 'ArrowRight' : 'ArrowLeft' })); window.__busy = false; cue = 'none'; }, delay);
    }
  }, 5);
});
await p.waitForTimeout(2500);
await p.screenshot({ path: process.argv[2] + '/attn-2-trial.png' });
await p.waitForSelector('.attn-score', { timeout: 180000 });
await p.waitForTimeout(400);
await p.screenshot({ path: process.argv[2] + '/attn-3-results.png', fullPage: false });
console.log(await p.evaluate(() => [...document.querySelectorAll('.attn-score .row')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()).join(' | ') + ' || ' + document.querySelector('.attn-dialog p.small').textContent));
// Show in 3D → executive step
await p.click('.attn-score [data-step="3"]'); await p.waitForTimeout(2500);
console.log('after Show in 3D:', await p.evaluate(() => document.querySelector('.xs-player .caption')?.textContent.slice(0, 60)));
await p.screenshot({ path: process.argv[2] + '/attn-4-3d.png' });
console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
await b.close();
