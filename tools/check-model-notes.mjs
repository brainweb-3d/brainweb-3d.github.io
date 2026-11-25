// Checks that every place with a downloaded (🔬 real) model in src/explore/models.js has a "What you're seeing"
// note in content/modelNotes.js (English and Hebrew), and that no note points at a place without a model.
// Usage: node tools/check-model-notes.mjs
import fs from 'node:fs';
import { REAL_NOTES } from '../content/modelNotes.js';

const src = fs.readFileSync(new URL('../src/explore/models.js', import.meta.url), 'utf8');
const start = src.indexOf('export const MODELS'), end = src.indexOf('\n};', start);
const keys = [...src.slice(start, end).matchAll(/^\s+'([a-z]+\/[a-z0-9-]+)':\s*\{\s*file:/gm)].map((m) => m[1]);
const bad = [];
for (const k of keys) {
  const n = REAL_NOTES[k];
  if (!n) bad.push(`${k}: no note`);
  else if (!n.note?.en || !n.note?.he) bad.push(`${k}: note needs English and Hebrew`);
  if (n?.mark && (!Array.isArray(n.mark.at) || !n.mark.label?.en || !n.mark.label?.he)) bad.push(`${k}: mark needs at [x, y] and a label`);
}
for (const k of Object.keys(REAL_NOTES)) if (!keys.includes(k)) bad.push(`${k}: note, but no real model there`);
console.log(bad.length ? bad.join('\n') : `OK: ${keys.length} real models, each with a "What you're seeing" note`);
process.exitCode = bad.length ? 1 : 0;
