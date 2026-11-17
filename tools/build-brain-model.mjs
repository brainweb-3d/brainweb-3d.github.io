// One-time tool: builds public/models/brain.glb from BodyParts3D anatomical meshes.
//
// Data: BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International.
// Download (from https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) and unzip:
//   partof_BP3D_4.0_obj_99.zip and isa_BP3D_4.0_obj_99.zip
// Usage:
//   node tools/build-brain-model.mjs <folder with partof_BP3D_4.0_obj_99> [<folder with isa_BP3D_4.0_obj_99>]
//
// Each OBJ file has a header with its English anatomical name. We pick the brain parts, group them into the
// region ids used by the website (content/regions.js), convert coordinates, simplify, and compress.

import fs from 'fs';
import path from 'path';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, dedup, prune } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

// region id → anatomical names (without "left"/"right"; a name starting with left/right only matches that side)
const REGIONS = {
  frontal: ['superior frontal gyrus', 'middle frontal gyrus', 'orbital gyrus', 'right inferior frontal gyrus'],
  broca: ['left inferior frontal gyrus'],
  motor: ['precentral gyrus'],
  somatosensory: ['postcentral gyrus'],
  parietal: ['superior parietal lobule', 'supramarginal gyrus', 'angular gyrus'],
  temporal: ['middle temporal gyrus', 'inferior temporal gyrus', 'fusiform gyrus', 'parahippocampal gyrus',
    'anterior part of superior temporal gyrus', 'right posterior part of superior temporal gyrus'],
  wernicke: ['left posterior part of superior temporal gyrus'],
  occipital: ['occipital lobe'],
  insula: ['insula'],
  cingulate: ['cingulate gyrus'],
  hippocampus: ['hippocampus'],
  amygdala: ['amygdala'],
  thalamus: ['thalamus'],
  hypothalamus: ['hypothalamus', 'tuber cinereum', 'mammillary body'],
  pituitary: ['pituitary gland'],
  pineal: ['pineal body'],
  basalGanglia: ['caudate nucleus', 'putamen', 'globus pallidus'],
  corpusCallosum: ['corpus callosum'],
  fornix: ['fornix of forebrain'],
  ventricles: ['lateral ventricle', 'third ventricle', 'fourth ventricle', 'cerebral aqueduct'],
  midbrain: ['midbrain'],
  pons: ['pons'],
  medulla: ['medulla oblongata'],
  cerebellum: ['cerebellum'],
  superiorColliculus: ['superior colliculus'],
  inferiorColliculus: ['inferior colliculus'],
  opticChiasm: ['optic chiasm'],
  whiteMatter: ['white matter of cerebral hemisphere'],
};

function readHeader(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(1500);
  fs.readSync(fd, buf, 0, 1500, 0);
  fs.closeSync(fd);
  const h = buf.toString('utf8');
  return (h.match(/English name : (.*)/) || [])[1]?.trim().toLowerCase() || '';
}

function parseObj(file) {
  const v = [];
  const idx = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (line.startsWith('v ')) {
      const [, x, y, z] = line.trim().split(/\s+/).map(Number);
      v.push(x, y, z);
    } else if (line.startsWith('f ')) {
      const f = line.trim().split(/\s+/).slice(1).map((s) => parseInt(s, 10) - 1);
      for (let i = 1; i < f.length - 1; i++) idx.push(f[0], f[i], f[i + 1]);
    }
  }
  return { v, idx };
}

// ---- 1. Index all files by name ----
const dirs = process.argv.slice(2);
if (!dirs.length) { console.error('Usage: node tools/build-brain-model.mjs <partof dir> [<isa dir>]'); process.exit(1); }
// Names put the side anywhere ("left hippocampus", "posterior part of left superior temporal gyrus"),
// so index by the name with "left"/"right" removed, remembering the side.
const byName = new Map(); // "left|base name" → [file paths]
const seen = new Set();
for (const d of dirs) {
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.obj') || seen.has(f)) continue;
    const name = readHeader(path.join(d, f));
    if (!name) continue;
    seen.add(f);
    const side = /\bleft\b/.test(name) ? 'left' : /\bright\b/.test(name) ? 'right' : '';
    const base = name.replace(/\b(left|right) /, '');
    const key = side ? `${side} ${base}` : base;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(path.join(d, f));
  }
}

// ---- 2. Pick files for each region/side ----
const groups = []; // { region, side, files: [] }
const used = new Set();
for (const [region, names] of Object.entries(REGIONS)) {
  for (const side of ['left', 'right', 'mid']) {
    const files = [];
    for (const n of names) {
      const sided = /^(left|right) /.test(n);
      if (sided && !n.startsWith(side + ' ')) continue;
      const base = sided ? n.replace(/^(left|right) /, '') : n;
      let cand = side === 'mid' ? [] : byName.get(`${side} ${base}`) || [];
      // Unsided parts (e.g. "midbrain", "third ventricle") — split by position later; take them in the "mid" pass
      if (!cand.length && side === 'mid' && !sided) cand = byName.get(base) || [];
      for (const c of cand) if (!used.has(c)) { files.push(c); used.add(c); }
    }
    if (files.length) groups.push({ region, side, files });
  }
}

// ---- 3. Load geometry, transform to website coordinates ----
// BodyParts3D (mm): +x = patient's left, -y = front, +z = up.  Website: +x = right, +z = front, +y = up.
const meshes = [];
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (const g of groups) {
  // Unsided files can hold one half each (e.g. two "midbrain" files): split them by position into left/right
  const perSide = { left: { v: [], idx: [] }, right: { v: [], idx: [] }, mid: { v: [], idx: [] } };
  for (const file of g.files) {
    const { v, idx } = parseObj(file);
    let cx = 0;
    for (let i = 0; i < v.length; i += 3) cx += v[i];
    cx /= v.length / 3;
    let side = g.side;
    if (side === 'mid' && Math.abs(cx) > 2) side = cx > 0 ? 'left' : 'right';
    const out = perSide[side];
    const base = out.v.length / 3;
    for (let i = 0; i < v.length; i += 3) {
      const X = -v[i], Y = v[i + 2], Z = -v[i + 1];
      out.v.push(X, Y, Z);
      min[0] = Math.min(min[0], X); min[1] = Math.min(min[1], Y); min[2] = Math.min(min[2], Z);
      max[0] = Math.max(max[0], X); max[1] = Math.max(max[1], Y); max[2] = Math.max(max[2], Z);
    }
    for (const i of idx) out.idx.push(i + base);
  }
  for (const [side, data] of Object.entries(perSide)) if (data.idx.length) meshes.push({ region: g.region, side, ...data });
}

// Scale so the brain is ~1.75 units long (front to back), centred at the origin like the old coded brain
const scale = 1.75 / (max[2] - min[2]);
const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2 + 0.06 / scale, (min[2] + max[2]) / 2];

// ---- 4. Build glTF ----
const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene('brain');
for (const m of meshes) {
  const pos = new Float32Array(m.v.length);
  for (let i = 0; i < m.v.length; i += 3) {
    pos[i] = (m.v[i] - center[0]) * scale;
    pos[i + 1] = (m.v[i + 1] - center[1]) * scale;
    pos[i + 2] = (m.v[i + 2] - center[2]) * scale;
  }
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(m.idx)).setBuffer(buffer));
  const name = `${m.region}|${m.side}`;
  const mesh = doc.createMesh(name).addPrimitive(prim);
  scene.addChild(doc.createNode(name).setMesh(mesh));
}

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
await doc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0.85, error: 0.0004 }), prune());
doc.createExtension(KHRMeshQuantization).setRequired(true);
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await doc.transform(quantize({ quantizePosition: 14 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));

const outFile = path.resolve('public/models/brain.glb');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
await new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder }).write(outFile, doc);

// ---- 5. Extras in the SAME frame as the brain: cranium bones, the tentorium (a fold of dura), and the
//         arteries of the circle of Willis → public/models/brain-extras.glb (names "part|side")
const EXTRAS = {
  skull: [/^(frontal|occipital|sphenoid|ethmoid)( bone)?$/, /^(parietal|temporal) bone$/],
  tentorium: [/^tentorium cerebelli$/],
  arteries: [/cerebral artery$/, /communicating artery$/, /^basilar artery$/, /^internal carotid artery$/, /^vertebral artery$/, /^(sphenoid|insular|precommunicating|postcommunicating) part of .*cerebral artery$/],
};
const extraFiles = new Map();
const seenExtra = new Set();
for (const d of dirs) {
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.obj')) continue;
    const name = readHeader(path.join(d, f));
    if (!name || seenExtra.has(name)) continue;
    const side = /\bleft\b/.test(name) ? 'left' : /\bright\b/.test(name) ? 'right' : 'mid';
    const base = name.replace(/\b(left|right) ?/g, '').replace(/\s+/g, ' ').trim();
    for (const [part, res] of Object.entries(EXTRAS)) {
      if (!res.some((re) => re.test(base))) continue;
      seenExtra.add(name);
      const key = `${part}|${side}`;
      if (!extraFiles.has(key)) extraFiles.set(key, []);
      extraFiles.get(key).push(path.join(d, f));
      break;
    }
  }
}
const xdoc = new Document();
const xbuf = xdoc.createBuffer();
const xscene = xdoc.createScene('extras');
for (const [key, files] of extraFiles) {
  const v = [], idx = [];
  for (const file of files) {
    const o = parseObj(file);
    const base = v.length / 3;
    for (let i = 0; i < o.v.length; i += 3) v.push((-o.v[i] - center[0]) * scale, (o.v[i + 2] - center[1]) * scale, (-o.v[i + 1] - center[2]) * scale);
    for (const i of o.idx) idx.push(i + base);
  }
  const prim = xdoc.createPrimitive()
    .setAttribute('POSITION', xdoc.createAccessor().setType('VEC3').setArray(new Float32Array(v)).setBuffer(xbuf))
    .setIndices(xdoc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(xbuf));
  xscene.addChild(xdoc.createNode(key).setMesh(xdoc.createMesh(key).addPrimitive(prim)));
}
await xdoc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0.3, error: 0.0008 }), prune());
xdoc.createExtension(KHRMeshQuantization).setRequired(true);
xdoc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await xdoc.transform(quantize({ quantizePosition: 14 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
const xFile = path.resolve('public/models/brain-extras.glb');
await new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder }).write(xFile, xdoc);
console.log(`Wrote ${xFile} (${(fs.statSync(xFile).size / 1e6).toFixed(2)} MB): ${[...extraFiles.keys()].join(', ')}`);

const missing = Object.keys(REGIONS).filter((r) => !meshes.some((m) => m.region === r));
console.log(`Wrote ${outFile} (${(fs.statSync(outFile).size / 1e6).toFixed(2)} MB), ${meshes.length} meshes.`);
console.log('Regions:', [...new Set(meshes.map((m) => m.region))].join(', '));
if (missing.length) console.log('Not found:', missing.join(', '));
