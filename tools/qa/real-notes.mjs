import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const errs = [];
async function newPage(lang = 'en') {
  const ctx = await b.newContext({ viewport: { width: 1200, height: 760 } });
  await ctx.addInitScript((lang) => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); localStorage.setItem('brainweb.lang', JSON.stringify(lang)); localStorage.removeItem('brainweb.effect'); } catch {} }, lang);
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  return p;
}
const sheetOpen = (p) => p.evaluate(() => document.getElementById('xwSheet')?.getAttribute('aria-hidden') === 'false');
async function visit(p, key, shot) {
  await p.goto(`http://localhost:5173/#/explore/${key}`); await p.waitForTimeout(300); await p.reload(); await p.waitForTimeout(7000);
  if (!(await sheetOpen(p))) { await p.click('#xwInfo'); await p.waitForTimeout(500); }
  const before = await p.evaluate(() => !!document.querySelector('#xwSheet .xs-real'));
  await p.evaluate(() => document.querySelector('#xwSheet [data-mode="real"]')?.click()); await p.waitForTimeout(4500);
  const note = await p.evaluate(() => document.querySelector('#xwSheet .xs-real')?.innerText.replace(/\s+/g, ' ').slice(0, 110));
  const mark = await p.evaluate(() => { const m = document.querySelector('.xw-hot.mark'); return m ? (m.classList.contains('hidden') ? 'mark hidden' : 'mark shown: ' + m.textContent.trim()) : 'no mark'; });
  const goMark = await p.evaluate(() => [...document.querySelectorAll('#xwSheet [data-go]')].some((b) => b.dataset.go === 'mark'));
  if (shot) await p.screenshot({ path: `${OUT}/${shot}` });
  await p.evaluate(() => document.querySelector('#xwSheet .xs-real [data-mode="interactive"]')?.click()); await p.waitForTimeout(2500);
  const after = await p.evaluate(() => ({ real: !!window.__bwWorld().current.realMode, note: !!document.querySelector('#xwSheet .xs-real'), mark: document.querySelector('.xw-hot.mark')?.classList.contains('hidden') ?? 'none' }));
  console.log(`${key}: drawn-before note=${before} | real note="${note}" | ${mark} | mark in sheet buttons=${goMark} | after "Show the drawn view": ${JSON.stringify(after)}`);
}
const p = await newPage();
await visit(p, 'cell/synapse', 'real-note-synapse.png');
await visit(p, 'atom/nmda', 'real-note-nmda.png');
await visit(p, 'macromolecule/channels');
await visit(p, 'methods/pet');
// cell/real opens on the real model by default
await p.goto('http://localhost:5173/#/explore/cell/real'); await p.waitForTimeout(300); await p.reload(); await p.waitForTimeout(8000);
if (!(await sheetOpen(p))) { await p.click('#xwInfo'); await p.waitForTimeout(500); }
console.log('cell/real (opens real):', await p.evaluate(() => document.querySelector('#xwSheet .xs-real')?.innerText.replace(/\s+/g, ' ').slice(0, 80)));
const h = await newPage('he');
await visit(h, 'cell/synapse', 'real-note-he.png');
console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
await b.close();
