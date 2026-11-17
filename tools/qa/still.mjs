// node still.mjs <place> <button> <waitMs> : press a button, wait, then take two PNG shots 1 s apart in the SAME page
// and report how many pixels differ (0 = nothing in the scene moved)
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
const [place, btn, wait = '7000'] = process.argv.slice(2);
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await (await b.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await p.addInitScript(() => { try { localStorage.setItem('brainweb.hintSeen', 'true'); } catch {} });
await p.goto(`http://localhost:5173/#/explore/${place}`); await p.waitForTimeout(8000);
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /About this/.test(x.textContent))?.click());
await p.waitForTimeout(800);
await p.evaluate((s) => [...document.querySelectorAll('button')].find((y) => y.textContent.includes(s))?.click(), btn);
await p.waitForTimeout(+wait);
const clip = { x: 0, y: 120, width: 1000, height: 560 };
const a = PNG.sync.read(await p.screenshot({ clip }));
await p.waitForTimeout(1000);
const c = PNG.sync.read(await p.screenshot({ clip }));
let diff = 0;
for (let i = 0; i < a.data.length; i += 4) if (Math.abs(a.data[i] - c.data[i]) + Math.abs(a.data[i + 1] - c.data[i + 1]) + Math.abs(a.data[i + 2] - c.data[i + 2]) > 30) diff++;
console.log(place, btn, 'pixels changed in 1 s:', diff);
await b.close();
