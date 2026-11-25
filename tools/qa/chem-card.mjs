import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const errs = [];
async function newPage(w, h, lang = 'en') {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((lang) => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); localStorage.setItem('brainweb.lang', JSON.stringify(lang)); } catch {} }, lang);
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  return p;
}
const card = (p) => p.evaluate(() => { const c = document.getElementById('xwChem'); if (c.hidden) return 'HIDDEN'; const pill = c.querySelector('.cc-pill'); if (pill) return 'PILL: ' + pill.textContent.replace(/\s+/g, ' ').trim(); return [...c.querySelectorAll('.cc-head b, .cc-sub, h5, li')].map((e) => (e.tagName === 'LI' ? (e.classList.contains('now') ? '[NOW] ' : e.classList.contains('dim') ? '[dim] ' : '') : '') + e.textContent.replace(/\s+/g, ' ').trim()).join(' | '); });
const step = (p, i) => p.evaluate((i) => { const pw = window.__bwWorld().current.scene.pathways; pw.showStage(i); pw.time = i * 4.5 + 2.2; pw.playing = false; }, i);

const p = await newPage(1200, 760);
await p.goto('http://localhost:5173/#/explore/organ/path/attention'); await p.waitForTimeout(9000);
for (const i of [0, 1, 2, 4]) { await step(p, i); await p.waitForTimeout(400); console.log(`attention step ${i + 1}:`, await card(p)); }
await step(p, 0); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/chem-attention.png` });
await p.evaluate(() => { location.hash = '#/explore/organ/path/stress'; }); await p.waitForTimeout(2000);
console.log('stress:', await card(p));
await p.evaluate(() => { location.hash = '#/explore/organ/path/vision'; }); await p.waitForTimeout(2000);
console.log('vision:', await card(p));
// effect: cocaine follows across levels
await p.evaluate((id) => localStorage.setItem('brainweb.effect', JSON.stringify(id)), 'cocaine'); await p.reload(); await p.waitForTimeout(7000);
await p.evaluate(() => { location.hash = '#/explore/organ/path/reward'; }); await p.waitForTimeout(2500);
console.log('cocaine @ brain (reward path):', await card(p));
await p.evaluate(() => { location.hash = '#/explore/organ/path/attention'; }); await p.waitForTimeout(2500);
console.log('cocaine on, but attention path:', await card(p));
await p.evaluate(() => { location.hash = '#/explore/cell/synapse'; }); await p.waitForTimeout(6000);
console.log('cocaine @ cell/synapse:', await card(p));
await p.screenshot({ path: `${OUT}/chem-cocaine-synapse.png` });
// open the dopamine row and press "See the molecule"
await p.click('#xwChem [data-cc="dopamine"]'); await p.waitForTimeout(300);
console.log('row open:', await p.evaluate(() => document.querySelector('#xwChem .cc-more')?.textContent.replace(/\s+/g, ' ').trim()));
await p.screenshot({ path: `${OUT}/chem-row.png` });
await p.click('#xwChem [data-ccmol="dopamine"]'); await p.waitForTimeout(8000);
console.log('after See the molecule:', await p.evaluate(() => location.hash + ' isolated=' + JSON.stringify(window.__bwWorld().current.stage?.isolated)));
await p.screenshot({ path: `${OUT}/chem-molecule.png` });
// effect with no list
await p.evaluate((id) => localStorage.setItem('brainweb.effect', JSON.stringify(id)), 'ms'); await p.reload(); await p.waitForTimeout(7000);
await p.evaluate(() => { location.hash = '#/explore/cell/neuron'; }); await p.waitForTimeout(4000);
console.log('ms @ cell:', await card(p));
// fold, survives reload
await p.evaluate((id) => localStorage.setItem('brainweb.effect', JSON.stringify(id)), 'alcohol'); await p.reload(); await p.waitForTimeout(7000);
console.log('alcohol:', await card(p));
await p.click('#xwChem [data-ccfold="1"]'); await p.waitForTimeout(300);
console.log('folded:', await card(p));
await p.reload(); await p.waitForTimeout(6000);
console.log('after reload:', await card(p));
await p.click('#xwChem .cc-pill'); await p.waitForTimeout(300);
console.log('unfolded:', (await card(p)).slice(0, 60));
await p.evaluate((id) => localStorage.setItem('brainweb.effect', JSON.stringify(id)), null); await p.reload(); await p.waitForTimeout(7000);
// phone, Hebrew: starts folded
const m = await newPage(375, 740, 'he');
await m.goto('http://localhost:5173/#/explore/organ/path/pain'); await m.waitForTimeout(9000);
console.log('phone he pain:', await card(m));
await m.screenshot({ path: `${OUT}/chem-phone-folded.png` });
await m.click('#xwChem .cc-pill'); await m.waitForTimeout(400);
await m.evaluate(() => { const pw = window.__bwWorld().current.scene.pathways; pw.showStage(2); pw.time = 2 * 4.5 + 2.2; pw.playing = false; }); await m.waitForTimeout(500);
console.log('phone he pain open, step 3:', await card(m));
await m.screenshot({ path: `${OUT}/chem-phone-open.png` });
console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
await b.close();
