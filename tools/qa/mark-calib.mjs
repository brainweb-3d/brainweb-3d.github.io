import { chromium } from 'playwright';
const [px, py] = process.argv.slice(2).map(Number);
const b = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 760 } });
await ctx.addInitScript(() => { try { localStorage.setItem('brainweb.hintSeen', 'true'); localStorage.setItem('brainweb.theme', '"dark"'); localStorage.removeItem('brainweb.effect'); } catch {} });
const p = await ctx.newPage();
await p.goto('http://localhost:5173/#/explore/' + (process.env.KEY || 'cell/synapse')); await p.waitForTimeout(300); await p.reload(); await p.waitForTimeout(7000);
if (await p.evaluate(() => document.getElementById('xwSheet')?.getAttribute('aria-hidden') !== 'false')) { await p.click('#xwInfo'); await p.waitForTimeout(500); }
await p.evaluate(() => document.querySelector('#xwSheet [data-mode="real"]')?.click()); await p.waitForTimeout(4500);
console.log(await p.evaluate(([px, py]) => {
  const v = window.__bwWorld().current;
  const h = v.homeView();
  const camDiff = v.camera.position.distanceTo(h.position);
  const cam = v.camera.clone(); cam.position.copy(h.position); cam.lookAt(h.target); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  let box = null;
  for (const m of v.model.meshes) { m.updateMatrixWorld(true); if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld); box = box ? box.union(bb) : bb; }
  let x0 = 1, x1 = -1, y0 = 1, y1 = -1;
  for (let i = 0; i < 8; i++) { const c = box.min.clone().set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(cam); x0 = Math.min(x0, c.x); x1 = Math.max(x1, c.x); y0 = Math.min(y0, c.y); y1 = Math.max(y1, c.y); }
  const canvas = [...document.querySelectorAll('#xwLayers canvas')].find((c) => c.offsetParent && getComputedStyle(c.parentElement).opacity !== '0') || document.querySelector('#xwLayers canvas');
  const r = canvas.getBoundingClientRect();
  const nx = ((px - r.left) / r.width) * 2 - 1, ny = -(((py - r.top) / r.height) * 2 - 1);
  // the model point under the pixel (in the CURRENT camera): the vertex closest to the ray
  const cc = v.camera; cc.updateMatrixWorld(true);
  const o = cc.position.clone(), dir = o.clone().set(nx, ny, 0.5).unproject(cc).sub(o).normalize();
  let best = null, bd = Infinity; const q = o.clone();
  for (const m of v.model.meshes) { const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i += 3) { q.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); const t = q.clone().sub(o).dot(dir); const d = q.clone().sub(o.clone().add(dir.clone().multiplyScalar(t))).lengthSq(); if (d < bd) { bd = d; best = q.clone(); } } }
  const hp = best.clone().project(cam); // ...seen from the home view, as the site places marks
  return JSON.stringify({ camDiff: +camDiff.toFixed(3), fx: +((hp.x - x0) / (x1 - x0)).toFixed(3), fy: +((y1 - hp.y) / (y1 - y0)).toFixed(3) });
}, [px, py]));
await b.close();
