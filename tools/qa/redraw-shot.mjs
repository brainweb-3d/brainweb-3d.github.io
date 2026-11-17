// node redraw-shot.mjs <out.jpg> <place> [mode: real|interactive|default] [buttonLabelSubstring[,another]] [waitAfterMs]
import { chromium } from 'playwright';
const [out, place, mode = 'default', btns = '', after = '2500'] = process.argv.slice(2);
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
await ctx.addInitScript(() => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); } catch {} });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(`http://localhost:5173/#/explore/${place}`); await p.waitForTimeout(8000);
await p.evaluate(() => { const i = [...document.querySelectorAll('button')].find((x) => /About this/.test(x.textContent)); i?.click(); });
await p.waitForTimeout(1200);
const st = await p.evaluate(async ({ mode, btns }) => {
  const res = {};
  if (mode !== 'default') { const m = [...document.querySelectorAll('[data-mode]')].find((x) => x.dataset.mode === mode); res.mode = !!m; m?.click(); await new Promise((r) => setTimeout(r, 800)); }
  for (const s of btns.split(',').filter(Boolean)) { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.includes(s)); res[s] = !!x; x?.click(); await new Promise((r) => setTimeout(r, 300)); }
  res.realOn = document.querySelector('[data-mode="real"]')?.classList.contains('on') ?? null;
  return res;
}, { mode, btns });
await p.waitForTimeout(+after);
await p.screenshot({ path: out, type: 'jpeg', quality: 80 });
console.log(place, JSON.stringify(st), errs.length ? 'ERRORS: ' + errs.join(' | ').slice(0, 600) : 'no errors');
await b.close();
