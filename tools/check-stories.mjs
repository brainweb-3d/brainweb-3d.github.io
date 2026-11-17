// Checks the guided stories (content/stories.js): every step's page exists, every button it presses or asks the
// learner to press exists in that scene, and every choice / next leads to a step. Usage: node tools/check-stories.mjs
import fs from 'node:fs';
import { STORIES } from '../content/stories.js';
import { PLACES } from '../src/explore/graph.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const STR = String.raw`'((?:[^'\\]|\\.)*)'`; // a single-quoted JS string
const labels = {};
for (const level of ['atom', 'molecule', 'macromolecule', 'organelle', 'cell', 'tissue', 'system', 'organism', 'methods']) {
  const s = read(level === 'methods' ? 'src/visual/methods/methods.js' : `src/visual/levels/${level}.js`);
  const fns = [...s.matchAll(/\nfunction (\w+)\(/g)].map((m) => [m[1], m.index]);
  const bodies = [];
  if (level === 'methods') {
    for (const m of s.matchAll(/\nM\(\{\s*id: '(\w+)'/g)) { const next = s.indexOf('\nM({', m.index + 5); bodies.push([m[1], s.slice(m.index, next < 0 ? undefined : next)]); }
  } else {
    for (const m of s.matchAll(/\{ id: '(\w+)',[^\n]*build: (\w+)/g)) {
      const i = fns.findIndex((x) => x[0] === m[2]);
      if (i >= 0) bodies.push([m[1], s.slice(fns[i][1], fns[i + 1]?.[1])]);
    }
  }
  for (const [id, body] of bodies) {
    const found = [
      ...[...body.matchAll(new RegExp(String.raw`label: B\(` + STR, 'g'))].map((m) => m[1]),
      // helpers like act('key', '📌', 'Label', …), M('id', '🟢', 'Label', …), real(…), k(…)
      ...[...body.matchAll(new RegExp(String.raw`\b(?:act|sense|real|k|M)\('\w+', '[^']*', (?:B\()?` + STR, 'g'))].map((m) => m[1]),
    ];
    if (level === 'methods') { // a method's tasks (PET / fMRI share the TASKS list)
      found.push(...[...body.matchAll(new RegExp(String.raw`name: B\(` + STR, 'g'))].map((m) => m[1]));
      if (/taskActions\(/.test(body)) { const t = s.slice(s.indexOf('const TASKS = {'), s.indexOf('function taskActions')); found.push(...[...t.matchAll(new RegExp(String.raw`name: B\(` + STR, 'g'))].map((m) => m[1])); }
    }
    if (level === 'tissue' && id === 'taste') found.push(...[...s.matchAll(/k: '\w+', icon: '[^']*', en: '(\w+)'/g)].map((m) => m[1]));
    labels[`${level}/${id}`] = found.map((l) => l.replace(/\\'/g, "'"));
  }
}
const regions = new Set([...read('src/brain/brainParts.js').matchAll(/^\s+(\w+): '#/gm)].map((m) => m[1]));
const paths = new Set([...read('src/brain/pathways.js').matchAll(/id: '(\w+)', group/g)].map((m) => m[1]));

let errors = 0;
const err = (m) => { errors++; console.log('ERROR:', m); };
for (const st of STORIES) {
  const ids = new Set(st.steps.map((x) => x.id).filter(Boolean));
  st.steps.forEach((step, k) => {
    const where = `${st.id} step ${k + 1}`;
    const m = step.href.match(/^#\/explore\/(\w+)(?:\/(\w+))?(?:\/([\w,]+))?$/);
    if (!m) { err(`${where}: bad href ${step.href}`); return; }
    const [, level, a, b] = m;
    let key = null;
    if (level === 'organ') {
      if (a === 'path' ? !paths.has(b) : a && !a.split(',').every((r) => regions.has(r))) err(`${where}: unknown brain ${a === 'path' ? 'pathway' : 'region'} in ${step.href}`);
    } else {
      key = `${level}/${a}`;
      if (!PLACES[key]) err(`${where}: no place ${key}`);
    }
    const want = [...(step.acts || []), ...(step.task?.act ? [step.task.act] : [])];
    for (const w of want) if (key && !(labels[key] || []).some((l) => l.includes(w))) err(`${where}: no button "${w}" in ${key} (has: ${(labels[key] || []).join(' | ')})`);
    for (const c of step.choices || []) if (!ids.has(c.go)) err(`${where}: choice leads to unknown step "${c.go}"`);
    if (step.next && !ids.has(step.next)) err(`${where}: next leads to unknown step "${step.next}"`);
    for (const t of [step.text, step.task?.prompt, ...(step.choices || []).map((c) => c.label)].filter(Boolean)) if (!t.en || !t.he || !/[֐-׿]/.test(t.he)) err(`${where}: missing English or Hebrew text`);
  });
}
console.log(`${STORIES.length} stories, ${STORIES.reduce((n, s) => n + s.steps.length, 0)} steps`);
console.log(errors ? `${errors} error(s)` : 'OK: stories are valid');
process.exit(errors ? 1 : 0);
