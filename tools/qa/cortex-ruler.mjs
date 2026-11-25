import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const errs = [];
async function open(w, h, lang = 'en') {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500 });
  await ctx.addInitScript((lang) => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); localStorage.setItem('brainweb.lang', JSON.stringify(lang)); localStorage.removeItem('brainweb.effect'); localStorage.setItem('brainweb.chemFolded', 'true'); } catch {} }, lang);
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:5173/#/explore/tissue/cortex'); await p.waitForTimeout(300); await p.reload(); await p.waitForTimeout(7000);
  await p.evaluate(() => { const s = document.getElementById('xwSheet'); if (s?.getAttribute('aria-hidden') === 'false') document.getElementById('xwInfo')?.click(); });
  await p.waitForTimeout(900);
  return p;
}
const act = (p, label) => p.evaluate((label) => { const v = window.__bwWorld().current; const i = v.built.actions.findIndex((a) => a.label.en.includes(label)); v.built.actions[i].run(true); }, label);
const p = await open(1200, 760);
await p.screenshot({ path: `${OUT}/cx-home.png` });
console.log('ruler:', await p.evaluate(() => [...document.querySelectorAll('.cx-l')].map((b) => b.textContent.trim() + '@' + Math.round(parseFloat(b.style.top))).join(' | ')));
await p.hover('.cx-l[data-l="l4"]'); await p.waitForTimeout(500);
console.log('hover IV tip:', await p.evaluate(() => document.querySelector('.cx-tip:not([hidden])')?.innerText.replace(/\s+/g, ' ')));
await p.screenshot({ path: `${OUT}/cx-hover.png` });
await p.mouse.move(600, 700); await p.waitForTimeout(300);
await act(p, 'Follow a signal'); await p.waitForTimeout(1600); await p.screenshot({ path: `${OUT}/cx-signal.png` }); await p.waitForTimeout(6000);
await act(p, 'real density'); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/cx-density.png` });
await p.evaluate(() => { const v = window.__bwWorld().current; v.built.actions.find((a) => a.label.en.includes('real density')).run(false); });
await act(p, 'blood vessels'); await act(p, 'cortical column'); await p.waitForTimeout(1500); await p.screenshot({ path: `${OUT}/cx-column.png` });
const m = await open(375, 740, 'he');
await m.screenshot({ path: `${OUT}/cx-phone-he.png` });
await m.tap('.cx-l[data-l="l5"]'); await m.waitForTimeout(500);
console.log('phone tap V tip:', await m.evaluate(() => document.querySelector('.cx-tip:not([hidden])')?.innerText.replace(/\s+/g, ' ')));
await m.screenshot({ path: `${OUT}/cx-phone-tap.png` });
// the real model hides the ruler
await p.evaluate(() => document.querySelector('[data-mode="real"]')?.click()); await p.click('#xwInfo').catch(() => {}); await p.waitForTimeout(500);
await p.evaluate(() => document.querySelector('#xwSheet [data-mode="real"]')?.click()); await p.waitForTimeout(4000);
console.log('real view:', await p.evaluate(() => { const v = window.__bwWorld().current; return JSON.stringify({ realMode: v.realMode, realShown: v.stage.realShown, rulerHidden: getComputedStyle(document.querySelector('.cx-ruler')).visibility, hasModel: !!v.model, btn: !!document.querySelector('#xwSheet [data-mode=real]') }); }));
console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
await b.close();
