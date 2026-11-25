import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const errs = [];
async function newPage(w, h, lang = 'en') {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((lang) => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); localStorage.setItem('brainweb.lang', JSON.stringify(lang)); localStorage.setItem('brainweb.chemFolded', 'false'); } catch {} }, lang);
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  return p;
}
const card = (p) => p.evaluate(() => { const c = document.getElementById('xwChem'); if (c.hidden) return 'HIDDEN'; return [...c.querySelectorAll('.cc-sub, li')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).join('\n   '); });
const p = await newPage(1200, 760);
await p.goto('http://localhost:5173/#/explore/organ/path/attention'); await p.waitForTimeout(9000);
console.log('ATTENTION:\n  ', await card(p));
await p.screenshot({ path: `${OUT}/roles-attention.png` });
await p.click('#xwChem [data-cc="norepinephrine"]'); await p.waitForTimeout(300);
await p.click('#xwChem [data-ccmol="norepinephrine"]'); await p.waitForTimeout(8000);
console.log('SEE THE MOLECULE (from attention):', await p.evaluate(() => location.hash + ' isolated=' + JSON.stringify(window.__bwWorld().current.stage?.isolated)), '\n  ', await card(p));
await p.screenshot({ path: `${OUT}/roles-molecule.png` });
await p.evaluate(() => { location.hash = '#/explore/organ'; }); await p.waitForTimeout(3000);
console.log('BACK AT BRAIN (no pathway):', await card(p));
// Hebrew: pain pathway
const h = await newPage(1200, 760, 'he');
await h.goto('http://localhost:5173/#/explore/organ/path/pain'); await h.waitForTimeout(9000);
console.log('HE PAIN:\n  ', await card(h));
await h.screenshot({ path: `${OUT}/roles-he.png` });
console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
await b.close();
