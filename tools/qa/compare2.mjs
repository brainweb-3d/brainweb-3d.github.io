// node compare.mjs <dir> : one before/after sheet per place, from before_opens-on_*, before_*, after_* shots
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import fs from 'fs';
const dir = process.argv[2];
const places = JSON.parse(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 2090, height: 540 } });
for (const [k, name, model] of places) {
  const img = (f, cap) => `<figure><div class="crop"><img src="data:image/jpeg;base64,${fs.readFileSync(`${dir}/${f}`).toString("base64")}"></div><figcaption>${cap}</figcaption></figure>`;
  const html = `<html><body style="margin:0;background:#0b1020;font:600 20px system-ui;color:#e2e8f0">
  <style>figure{margin:0;display:inline-block;vertical-align:top;width:670px;margin-right:8px}.crop{width:670px;height:440px;overflow:hidden;position:relative;border-radius:8px}.crop img{position:absolute;left:0;top:-45px;width:910px;height:auto;clip-path:inset(0 0 0 0)}
  figcaption{padding:6px 4px;font-size:17px;color:#cbd5e1} h1{font-size:24px;margin:10px 10px 8px}</style>
  <h1>${name}</h1><div style="padding-left:10px">
  ${model ? img(`before_opens-on_${k}.jpg`, 'BEFORE: what the place opened on (downloaded model)') : ''}${img(`before_${k}.jpg`, 'BEFORE: the old interactive drawing')}${img(`after_${k}.jpg`, model ? 'AFTER: the redrawn interactive model (now opens first)' : 'AFTER: the redrawn interactive model')}
  </div></body></html>`;
  await p.setViewportSize({ width: model ? 2090 : 1380, height: 540 }); await p.setContent(html); await p.waitForTimeout(400);
  await p.screenshot({ path: `${dir}/compare_${k}.jpg`, type: 'jpeg', quality: 82 });
}

await b.close();
console.log('done');
