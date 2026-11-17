// Press every scene button (animation) of the given places, one after another; report errors, screenshot each.
// Usage: node actions.mjs <outDir> <place> [place…]
import { chromium } from 'playwright';
import fs from 'node:fs';
const [OUT, ...places] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
await ctx.addInitScript(() => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); } catch {} });
const p = await ctx.newPage();
let errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
let bad = 0;
for (const place of places) {
  errs = [];
  await p.goto(`http://localhost:5173/#/explore/${place}`); await p.waitForTimeout(300); await p.reload(); await p.waitForTimeout(7000);
  const open = async () => {
    if (await p.evaluate(() => document.getElementById('xwSheet').getAttribute('aria-hidden') !== 'false')) { await p.click('#xwInfo'); await p.waitForTimeout(500); }
    await p.evaluate(() => document.querySelectorAll('#xwSheet details').forEach((d) => { d.open = true; }));
  };
  await open();
  const n = await p.$$eval('#xwSheet [data-act]', (xs) => xs.length);
  const names = [];
  for (let i = 0; i < n; i++) {
    await open();
    const btn = (await p.$$('#xwSheet [data-act]'))[i];
    if (!btn) break;
    names.push((await btn.innerText()).trim());
    await btn.evaluate((x) => x.click());
    await p.waitForTimeout(2600);
    await p.screenshot({ path: `${OUT}/${place.replace('/', '_')}-${i}.jpg`, type: 'jpeg', quality: 65 });
  }
  if (errs.length) bad++;
  console.log(`${errs.length ? 'ERR' : 'ok '} ${place.padEnd(24)} ${n} actions: ${names.join(' · ')}${errs.length ? '\n    ' + errs.join(' | ').slice(0, 400) : ''}`);
}
await b.close();
console.log(bad ? `${bad} place(s) with errors` : 'no errors');
