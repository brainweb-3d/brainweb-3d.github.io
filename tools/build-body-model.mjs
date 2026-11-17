// One-time tool: builds public/models/body.glb (+ public/data/body-landmarks.json) from BodyParts3D meshes.
//
// Data: BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International.
// Usage: node tools/build-body-model.mjs <partof_BP3D_4.0_obj_99 folder> [<isa_BP3D_4.0_obj_99 folder>]
//
// Output coordinates (same convention as the procedural body in src/visual/body.js):
//   units = decimetres, +y up (feet at y ≈ 0), +z = front of the body, +x = the body's LEFT side.
// Mesh names: "<part>|<side>" (side = left / right / mid), e.g. "humerus|left", "liver|mid".

import fs from 'fs';
import path from 'path';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, dedup, prune } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

// part id → regular expressions on the English name (side words are handled separately)
const PARTS = {
  skin: [/^skin$/],
  skull: [/^(frontal|occipital|sphenoid|ethmoid|vomer)( bone)?$/, /^(parietal|temporal|zygomatic|nasal|lacrimal|palatine) bone$/, /^maxilla$/, /^mandible$/, /^inferior nasal concha$/],
  spine: [/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) (cervical|thoracic|lumbar) vertebra$/, /^atlas$/, /^axis$/, /^sacrum$/, /^coccyx$/],
  ribs: [/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib$/, /costal cartilage$/, /^manubrium$/, /^body of sternum$/, /^xiphoid process$/],
  shoulder: [/^clavicle$/, /^scapula$/],
  humerus: [/^humerus$/],
  forearm: [/^radius$/, /^ulna$/],
  hand: [/^(scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate)( bone)?$/, /metacarpal bone$/, /phalanx of .*(finger|thumb|hand)/],
  pelvis: [/^hip bone$/],
  femur: [/^femur$/, /^patella$/],
  leg: [/^tibia$/, /^fibula$/],
  foot: [/^(talus|calcaneus|cuboid bone)$/, /^navicular bone of foot$/, /cuneiform bone$/, /metatarsal bone$/, /phalanx of .*(toe|foot)/],
  heart: [/^cavity of (left|right)? ?(atrium|ventricle)$/],
  lungs: [/bronchial tree$/, /main bronchus( proper)?$/, /^trachea$/],
  liver: [/^hepatovenous segment [ivx]+$/, /^caudate lobe of liver$/],
  stomach: [/^stomach$/],
  gut: [/^duodenum$/, /(proximal|middle|distal) part of (jejunum|ileum)$/, /^(ascending|transverse|descending|sigmoid) colon$/, /^cecum$/, /^rectum$/],
  esophagus: [/^esophagus$/],
  kidney: [/^kidney$/],
  adrenal: [/^adrenal gland$/],
  bladder: [/^urinary bladder$/],
  spleen: [/^spleen$/],
  pancreas: [/^pancreas$/],
  diaphragm: [/^diaphragm$/],
  eye: [/^sclera$/],
};
// Bones used to compute the joint pivots for posing (and the spine path)
const LANDMARK_PARTS = new Set(['humerus', 'forearm', 'femur', 'leg', 'spine', 'skull']);

function readHeader(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(1500);
  fs.readSync(fd, buf, 0, 1500, 0);
  fs.closeSync(fd);
  return (buf.toString('utf8').match(/English name : (.*)/) || [])[1]?.trim().toLowerCase() || '';
}
function parseObj(file) {
  const v = [], idx = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (line.startsWith('v ')) { const [, x, y, z] = line.trim().split(/\s+/).map(Number); v.push(x, y, z); }
    else if (line.startsWith('f ')) { const f = line.trim().split(/\s+/).slice(1).map((s) => parseInt(s, 10) - 1); for (let i = 1; i < f.length - 1; i++) idx.push(f[0], f[i], f[i + 1]); }
  }
  return { v, idx };
}

const dirs = process.argv.slice(2);
if (!dirs.length) { console.error('Usage: node tools/build-body-model.mjs <partof dir> [<isa dir>]'); process.exit(1); }

// ---- 1. pick files ----
const picked = new Map(); // "part|side" → [{file, name}]
const seenNames = new Set();
for (const d of dirs) {
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.obj')) continue;
    const name = readHeader(path.join(d, f));
    if (!name || seenNames.has(name)) continue;
    const side = /\bleft\b/.test(name) ? 'left' : /\bright\b/.test(name) ? 'right' : 'mid';
    const base = name.replace(/\b(left|right) ?/g, '').replace(/\s+/g, ' ').trim();
    for (const [part, res] of Object.entries(PARTS)) {
      if (!res.some((re) => re.test(base))) continue;
      seenNames.add(name);
      const key = `${part}|${side}`;
      if (!picked.has(key)) picked.set(key, []);
      picked.get(key).push({ file: path.join(d, f), name });
      break;
    }
  }
}

// ---- 2. load + convert coordinates ----
// BodyParts3D (mm): +x = patient's left, -y = front, +z = up.  Output: +x = left, +y = up, +z = front (×0.01 → dm).
const meshes = [];
const gmin = [Infinity, Infinity, Infinity], gmax = [-Infinity, -Infinity, -Infinity];
const landmarkBoxes = {}; // name → {min,max} in output coords (before centring)
for (const [key, list] of picked) {
  const [part, side] = key.split('|');
  const out = { part, side, v: [], idx: [] };
  for (const { file, name } of list) {
    const { v, idx } = parseObj(file);
    const base = out.v.length / 3;
    const bmin = [Infinity, Infinity, Infinity], bmax = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < v.length; i += 3) {
      const X = v[i] * 0.01, Y = v[i + 2] * 0.01, Z = -v[i + 1] * 0.01;
      out.v.push(X, Y, Z);
      [X, Y, Z].forEach((c, k) => { gmin[k] = Math.min(gmin[k], c); gmax[k] = Math.max(gmax[k], c); bmin[k] = Math.min(bmin[k], c); bmax[k] = Math.max(bmax[k], c); });
    }
    for (const i of idx) out.idx.push(i + base);
    if (LANDMARK_PARTS.has(part)) landmarkBoxes[name] = { min: bmin, max: bmax };
  }
  meshes.push(out);
}
// Feet on the floor (y = 0), body centred on x and z
const shift = [-(gmin[0] + gmax[0]) / 2, -gmin[1], -(gmin[2] + gmax[2]) / 2];
const S = (p) => p.map((c, k) => +(c + shift[k]).toFixed(3));

// ---- 3. landmarks (joint pivots, spine path) ----
const box = (n) => landmarkBoxes[n];
const centre = (b) => [0, 1, 2].map((k) => (b.min[k] + b.max[k]) / 2);
const topOf = (b, f = 0.05) => { const c = centre(b); return [c[0], b.max[1] - (b.max[1] - b.min[1]) * f, c[2]]; };
const botOf = (b, f = 0.05) => { const c = centre(b); return [c[0], b.min[1] + (b.max[1] - b.min[1]) * f, c[2]]; };
const lm = { joints: {}, vertebrae: [] };
for (const side of ['left', 'right']) {
  const s = side === 'left' ? 'L' : 'R';
  const h = box(`${side} humerus`), r = box(`${side} radius`), u = box(`${side} ulna`), fe = box(`${side} femur`), ti = box(`${side} tibia`);
  if (h) { lm.joints[`shoulder${s}`] = S(topOf(h, 0.04)); lm.joints[`elbow${s}`] = S(botOf(h, 0.03)); }
  if (r && u) lm.joints[`wrist${s}`] = S(botOf({ min: r.min.map((v, k) => Math.min(v, u.min[k])), max: r.max.map((v, k) => Math.max(v, u.max[k])) }, 0.02));
  if (fe) { lm.joints[`hip${s}`] = S(topOf(fe, 0.05)); lm.joints[`knee${s}`] = S(botOf(fe, 0.03)); }
  if (ti) lm.joints[`ankle${s}`] = S(botOf(ti, 0.02));
}
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const seq = [['atlas', 'C1'], ['axis', 'C2'], ...ORD.slice(2, 7).map((o, i) => [`${o} cervical vertebra`, `C${i + 3}`]), ...ORD.map((o, i) => [`${o} thoracic vertebra`, `T${i + 1}`]), ...ORD.slice(0, 5).map((o, i) => [`${o} lumbar vertebra`, `L${i + 1}`]), ['sacrum', 'S']];
for (const [n, label] of seq) {
  const b = box(n);
  if (!b) continue;
  const c = centre(b);
  // the vertebral canal lies behind the vertebral body: use the back third of the bone
  lm.vertebrae.push({ label, p: S([c[0], c[1], b.min[2] + (b.max[2] - b.min[2]) * 0.35]) });
}
const sk = Object.keys(landmarkBoxes).filter((n) => /frontal bone|occipital bone|parietal bone/.test(n)).map(box);
if (sk.length) lm.skullTop = S([0, Math.max(...sk.map((b) => b.max[1])), 0]);
lm.height = +(gmax[1] - gmin[1]).toFixed(2);

// ---- 4. glTF ----
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene('body');
for (const m of meshes) {
  const pos = new Float32Array(m.v.length);
  for (let i = 0; i < m.v.length; i += 3) { pos[i] = m.v[i] + shift[0]; pos[i + 1] = m.v[i + 1] + shift[1]; pos[i + 2] = m.v[i + 2] + shift[2]; }
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(m.idx)).setBuffer(buffer));
  const name = `${m.part}|${m.side}`;
  scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
}
await doc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0.4, error: 0.0008 }), prune());
doc.createExtension(KHRMeshQuantization).setRequired(true);
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await doc.transform(quantize({ quantizePosition: 14 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));

const outFile = path.resolve('public/models/body.glb');
await new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder }).write(outFile, doc);
fs.mkdirSync(path.resolve('public/data'), { recursive: true });
fs.writeFileSync(path.resolve('public/data/body-landmarks.json'), JSON.stringify(lm, null, 1));
console.log(`Wrote ${outFile} (${(fs.statSync(outFile).size / 1e6).toFixed(2)} MB), ${meshes.length} meshes; height ${lm.height} dm.`);
console.log('Parts:', [...new Set(meshes.map((m) => m.part))].join(', '));
console.log('Missing:', Object.keys(PARTS).filter((p) => !meshes.some((m) => m.part === p)).join(', ') || 'none');
console.log('Joints:', Object.keys(lm.joints).join(' '), '| vertebrae:', lm.vertebrae.length);
