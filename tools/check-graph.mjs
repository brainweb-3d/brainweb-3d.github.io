// Checks the Explore place graph (src/explore/graph.js) against content/catalog.js and the scene sources.
// Usage: node tools/check-graph.mjs   (exit code 1 on any error)
import fs from 'node:fs';
import { SCENES } from '../content/catalog.js';
import { ROOT, PLACES, UNKNOWN_KEYS, METHOD_GROUP, pathTo, placeFromRoute, hotspotTo, dotsOf, WATCH_ONLY } from '../src/explore/graph.js';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const errors = [];
const warn = [];
const err = (m) => errors.push(m);
const KINDS = new Set(['in', 'out', 'method', 'side']);

// ---- part ids per scene, from the sources (static scan) ----------------------------------------------------
const ident = /'([A-Za-z][A-Za-z0-9]*)'/g;
const tokens = (s) => new Set([...s.matchAll(ident)].map((m) => m[1]));
const partsByScene = {};

function levelFile(level) {
  const src = read(`src/visual/levels/${level}.js`);
  const fnBody = (name) => {
    const i = src.indexOf(`function ${name}(`);
    if (i < 0) return '';
    const j = src.indexOf('\nfunction ', i + 1);
    return src.slice(i, j < 0 ? undefined : j);
  };
  // module-level arrays/objects used by a scene (e.g. REAL in cell.js, ION in atom.js)
  const consts = [...src.matchAll(/^const ([A-Z][A-Z_]*) = [[{]/gm)].map((m) => m[1]);
  for (const m of src.matchAll(/\{ id: '([\w]+)',[^\n]*build: (\w+)/g)) {
    const body = fnBody(m[2]);
    const ids = tokens(body);
    for (const c of consts) {
      if (new RegExp(`\\b${c}\\b`).test(body)) {
        const start = src.indexOf(`const ${c} =`);
        const end = src.slice(start).search(/\n[\]}];/);
        const block = src.slice(start, end < 0 ? undefined : start + end);
        for (const t of tokens(block)) ids.add(t);
        for (const k of block.matchAll(/^\s+(\w+): /gm)) ids.add(k[1]); // object keys like `na: {` (ION)
      }
    }
    if (/\bmembrane\(stage/.test(body)) ids.add('membrane');
    partsByScene[`${level}/${m[1]}`] = ids;
  }
}
for (const l of ['atom', 'molecule', 'macromolecule', 'organelle', 'cell', 'tissue', 'system', 'organism']) levelFile(l);

{ // methods: one M({ id: … }) block per scene
  const src = read('src/visual/methods/methods.js');
  const blocks = src.split(/\nM\(\{/).slice(1);
  for (const b of blocks) {
    const id = b.match(/id: '(\w+)'/)?.[1];
    const ids = tokens(b);
    if (/\bhead\(stage/.test(b)) ids.add('brain');
    if (id) partsByScene[`methods/${id}`] = ids;
  }
}
{ // the brain: region ids that buildBrain() / the hemisphere classifier actually create
  const src = read('src/brain/brainParts.js');
  const colors = src.slice(src.indexOf('REGION_COLORS'), src.indexOf('};'));
  const regions = new Set([...colors.matchAll(/^\s+(\w+): '#/gm)].map((m) => m[1]));
  const built = new Set([...src.matchAll(/(?:\(|return )'(\w+)'/g)].map((m) => m[1]).filter((r) => regions.has(r)));
  partsByScene[ROOT] = built;
}

// ---- checks -----------------------------------------------------------------------------------------------
const keys = Object.keys(PLACES);
for (const s of SCENES) if (!PLACES[`${s.level}/${s.id}`]) err(`catalog scene ${s.level}/${s.id} is not a place`);
for (const k of UNKNOWN_KEYS) err(`graph entry ${k} has no catalog scene`);
if (!PLACES[ROOT]) err('ROOT is not a place');
if (keys.length !== SCENES.length + 1) err(`expected ${SCENES.length + 1} places, got ${keys.length}`);

const reached = new Set([ROOT]);
for (const [key, p] of Object.entries(PLACES)) {
  if (key !== `${p.level}/${p.scene}`) err(`${key}: level/scene mismatch`);
  if (!p.name?.en || !p.name?.he || !p.icon) err(`${key}: missing name/icon`);
  if (key === ROOT ? p.parent !== null : !PLACES[p.parent]) err(`${key}: bad parent ${p.parent}`);
  if (p.level === 'organ' && key !== ROOT) err(`${key}: only the root may be an organ place`);
  const n = p.hotspots?.length || 0;
  if (n > 8) err(`${key}: has ${n} hotspots (max 8)`); // 0 = a leaf of the tree
  const ids = new Set();
  const parts = partsByScene[key];
  if (!parts) err(`${key}: could not find its scene source to check parts`);
  for (const h of p.hotspots || []) {
    const where = `${key} › ${h.id}`;
    if (ids.has(h.id)) err(`${where}: duplicate hotspot id`);
    ids.add(h.id);
    if (!PLACES[h.to]) err(`${where}: 'to' ${h.to} is not a place`);
    if (h.to === key) err(`${where}: leads to itself`);
    if (!KINDS.has(h.kind)) err(`${where}: bad kind ${h.kind}`);
    if (!h.label?.en || !h.label?.he) err(`${where}: missing en/he label`);
    if (!/[֐-׿]/.test(h.label?.he || '')) err(`${where}: Hebrew label has no Hebrew`);
    if (h.side !== undefined && h.side !== -1 && h.side !== 1) err(`${where}: side must be -1 or 1`);
    if (h.kind === 'method' && h.group !== METHOD_GROUP) warn.push(`${where}: method hotspot without METHOD_GROUP`);
    if (parts && !parts.has(h.part)) err(`${where}: part '${h.part}' is not defined in ${key}`);
    reached.add(h.to);
  }
  for (const m of p.more || []) {
    if (!PLACES[m]) err(`${key}: 'more' ${m} is not a place`);
    if (m === key) err(`${key}: 'more' lists itself`);
    if (p.hotspots.some((h) => h.to === m)) warn.push(`${key}: ${m} is both a hotspot and in 'more'`);
    reached.add(m);
  }
}
// the tree rule (owner, 2026-11-15): by dots, every place is reached in exactly one way — one dot, on its parent
{
  const ways = {};
  for (const k of keys) for (const h of dotsOf(k)) {
    (ways[h.to] ||= []).push(k);
    if (PLACES[h.to].parent !== k) err(`${k} › ${h.id}: a dot to ${h.to}, whose parent is ${PLACES[h.to].parent} (dots may lead only to children)`);
  }
  for (const k of keys) {
    if (k === ROOT) continue;
    const n = (ways[k] || []).length;
    if (WATCH_ONLY(k)) { if (n) err(`${k}: ▶ Watch-only, but dots lead to it from ${ways[k].join(', ')}`); if (dotsOf(k).length) err(`${k}: ▶ Watch-only, but it shows dots`); }
    else if (n !== 1) err(`${k}: reached by ${n} dots (need exactly 1)`);
  }
}
// every child must be reachable from its parent (hotspot or 'more'), so the drill-down can get there
for (const [key, p] of Object.entries(PLACES)) {
  if (key === ROOT) continue;
  const par = PLACES[p.parent];
  if (par && !par.hotspots.some((h) => h.to === key) && !(par.more || []).includes(key)) err(`${key}: its parent ${p.parent} has no hotspot or 'more' entry for it`);
}
for (const k of keys) if (!reached.has(k)) err(`${k}: unreachable (no hotspot or 'more' points to it)`);

// parents: no cycles, pathTo works
for (const k of keys) {
  const seen = new Set();
  for (let c = k; c; c = PLACES[c]?.parent) { if (seen.has(c)) { err(`${k}: parent cycle at ${c}`); break; } seen.add(c); }
  const path = pathTo(k);
  if (path[0] !== ROOT || path[path.length - 1] !== k) err(`${k}: pathTo gives ${JSON.stringify(path)}`);
}
// helpers
if (placeFromRoute('organ') !== ROOT || placeFromRoute('organ', 'hippocampus') !== ROOT) err('placeFromRoute(organ) should be ROOT');
if (placeFromRoute('cell', 'neuron') !== 'cell/neuron') err('placeFromRoute(cell, neuron)');
if (placeFromRoute('atom') !== 'atom/ions') err('placeFromRoute(atom) should be the first atom scene');
if (placeFromRoute('methods') !== 'methods/histology') err('placeFromRoute(methods) should be the first method');
if (placeFromRoute('cell', 'nope') !== null || placeFromRoute('nope') !== null) err('placeFromRoute should return null for unknown routes');
for (const [k, p] of Object.entries(PLACES)) for (const h of p.hotspots) if (hotspotTo(k, h.to)?.to !== h.to) err(`hotspotTo(${k}, ${h.to}) failed`);
if (hotspotTo(ROOT, 'atom/ions') !== null) err('hotspotTo should be null when there is no such hotspot');

// ---- report ----------------------------------------------------------------------------------------------
const depth = (k) => pathTo(k).length - 1;
const print = (k, ind = '') => {
  const p = PLACES[k];
  console.log(`${ind}${p.icon} ${k}  (${p.hotspots.length} hotspots${p.more ? `, ${p.more.length} more` : ''})`);
  for (const c of keys.filter((c) => PLACES[c].parent === k)) print(c, ind + '  ');
};
if (process.argv.includes('--tree')) print(ROOT);
if (process.argv.includes('--parts')) for (const [k, v] of Object.entries(partsByScene)) console.log(k, [...v].length, 'tokens');
console.log(`${keys.length} places, ${keys.reduce((a, k) => a + PLACES[k].hotspots.length, 0)} hotspots, max depth ${Math.max(...keys.map(depth))}`);
console.log(`breadcrumb example: ${pathTo('molecule/transmitters').map((k) => PLACES[k].name.en).join(' › ')}`);
for (const w of warn) console.log('warning:', w);
if (errors.length) {
  for (const e of errors) console.log('ERROR:', e);
  console.log(`${errors.length} error(s)`);
  process.exit(1);
}
console.log('OK: graph is valid');
