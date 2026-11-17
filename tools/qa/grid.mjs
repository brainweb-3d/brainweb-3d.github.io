// node grid.mjs <out.jpg> <cols> <img...> : a contact sheet of screenshots (scene area only), each captioned by file name
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const [out, cols, ...files] = process.argv.slice(2);
const b = await chromium.launch();
const W = 440, H = 300;
const p = await b.newPage({ viewport: { width: cols * (W + 6) + 6, height: Math.ceil(files.length / cols) * (H + 26) + 6 } });
const cell = (f) => `<figure style="margin:0;display:inline-block;width:${W}px;margin:3px;vertical-align:top"><div style="width:${W}px;height:${H}px;overflow:hidden;position:relative"><img style="position:absolute;left:0;top:-18px;width:${W * 1366 / 1000}px" src="data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}"></div><figcaption style="font:600 14px system-ui;color:#e2e8f0">${path.basename(f, '.jpg')}</figcaption></figure>`;
await p.setContent(`<html><body style="margin:0;background:#0b1020">${files.map(cell).join('')}</body></html>`);
await p.waitForTimeout(500);
await p.screenshot({ path: out, type: 'jpeg', quality: 80, fullPage: true });
await b.close();
console.log('done');
