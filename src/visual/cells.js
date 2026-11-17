// Textbook-style cell pieces (owner, 2026-11-15: make the interactive models LOOK better). Used by the cell body,
// vesicle release, blood–brain barrier, neuromuscular junction and nerve scenes. Like proteins.js, every builder
// makes its own materials (the stage dims and highlights a part by changing its materials).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { V, mat } from './build.js';
import { lumpGeo, meshOf, tone } from './proteins.js';

const ball = (at, r, w = 10, h = 7) => { const g = new THREE.SphereGeometry(r, w, h); g.translate(at.x, at.y, at.z); return g; };

/**
 * A mitochondrion: a see-through outer membrane, the matrix inside it, and the folded inner membrane (cristae) as
 * shelves reaching in from alternate sides. Long axis = y.
 */
export function mitochondrion({ len = 1.0, r = 0.26, color = '#ef4444', seed = 1 } = {}) {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 10, 28), mat(color, { opacity: 0.42, rough: 0.3 }));
  outer.material.depthWrite = false;
  const matrix = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.84, len * 0.98, 8, 24), mat(tone(color, 0.55), { opacity: 0.5 }));
  matrix.material.depthWrite = false;
  const n = Math.max(4, Math.round(len / 0.16)), cr = [];
  for (let i = 0; i < n; i++) {
    const y = -len / 2 - r * 0.4 + ((i + 0.5) / n) * (len + r * 0.8), side = i % 2 ? 1 : -1;
    const shelf = new THREE.SphereGeometry(r * 0.78, 18, 8);
    shelf.scale(1, 0.09, 0.95);
    shelf.translate(side * r * 0.22, y, 0);
    cr.push(shelf);
  }
  const cristae = meshOf(cr, mat(tone(color, -0.15), { rough: 0.5 }));
  g.add(cristae, matrix, outer);
  return g;
}

/** A vesicle: a thin membrane bubble with its cargo (small beads) inside and a few proteins on its surface. */
export function vesicle(r = 0.3, { color = '#f08a7a', cargo = '#ff5fa2', seed = 1, beads = 14 } = {}) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), mat(color, { opacity: 0.5, rough: 0.25 }));
  shell.material.depthWrite = false;
  const rim = new THREE.Mesh(new THREE.SphereGeometry(r * 0.9, 24, 16), mat(tone(color, 0.5), { opacity: 0.25, side: THREE.BackSide }));
  rim.material.depthWrite = false;
  let s = seed * 9301;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const inner = [], knobs = [];
  for (let i = 0; i < beads; i++) { const d = Math.cbrt(rnd()) * r * 0.62, a = rnd() * Math.PI * 2, b = Math.acos(2 * rnd() - 1); inner.push(ball(V(Math.sin(b) * Math.cos(a) * d, Math.cos(b) * d, Math.sin(b) * Math.sin(a) * d), r * 0.11, 6, 4)); }
  for (let i = 0; i < 4; i++) { const a = rnd() * Math.PI * 2, b = Math.acos(2 * rnd() - 1), n = V(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)); knobs.push(ball(n.multiplyScalar(r * 1.04), r * 0.13, 8, 6)); }
  g.add(meshOf(inner, mat(cargo, { emissive: tone(cargo, -0.6) })), meshOf(knobs, mat('#a78bfa')), rim, shell);
  return g;
}

/** A surface from fn(u, v) → Vector3 over the unit square (sheets of ER, patches of membrane). */
export function sheetGeo(fn, nu = 40, nv = 6) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = fn(i / nu, j / nv); pos.push(p.x, p.y, p.z); uv.push(i / nu, j / nv); }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A red blood cell: the biconcave disc (thin in the middle, a thick rim). Axis = y. */
export function rbcGeo(R = 0.3) {
  const h = (x) => { const s = Math.min(1, x / R); return R * Math.sqrt(Math.max(0, 1 - s * s)) * (0.207 + 2.002 * s * s - 1.123 * s ** 4) * 0.5; };
  const pts = [], n = 18;
  for (let i = 0; i <= n; i++) { const x = R * Math.sin((i / n) * Math.PI / 2); pts.push(new THREE.Vector2(x, h(x) + 0.002)); }
  for (let i = n; i >= 0; i--) { const x = R * Math.sin((i / n) * Math.PI / 2); pts.push(new THREE.Vector2(x, -h(x) - 0.002)); }
  return new THREE.LatheGeometry(pts, 32);
}

/**
 * Cross-striations of skeletal muscle, as drawn in textbooks: each sarcomere a dark A band (with a paler H zone and
 * an M line) between pale I bands split by a Z line, plus faint lengthwise lines (the myofibrils). Pattern along v.
 */
export function striationTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#fde2e2'; g.fillRect(0, 0, 128, 64);            // I band
  g.fillStyle = '#d9585b'; g.fillRect(0, 14, 128, 36);           // A band
  g.fillStyle = '#e88a8a'; g.fillRect(0, 26, 128, 12);           // H zone
  g.fillStyle = '#9f1d24'; g.fillRect(0, 31, 128, 2);            // M line
  g.fillStyle = '#7f1d1d'; g.fillRect(0, 0, 128, 2); g.fillRect(0, 62, 128, 2); // Z lines
  g.globalAlpha = 0.18; g.fillStyle = '#ffffff';
  for (let x = 0; x < 128; x += 8) g.fillRect(x, 0, 1, 64);       // myofibrils
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * Strands twisted round the line a → b (a SNARE complex: three helices zipped into one rope). One mesh per strand,
 * so each strand has its own colour. Returns a Group whose .mats lists the materials.
 */
export function coiledCoil(a, b, colors, { r = 0.03, tube = 0.02, turns = 1.5 } = {}) {
  const g = new THREE.Group();
  g.mats = [];
  const ax = b.clone().sub(a), len = ax.length(), dir = ax.clone().normalize();
  const u = (Math.abs(dir.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0)).cross(dir).normalize(), w = dir.clone().cross(u);
  colors.forEach((col, k) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24, ang = t * turns * Math.PI * 2 + (k * Math.PI * 2) / colors.length; pts.push(a.clone().addScaledVector(dir, t * len).addScaledVector(u, Math.cos(ang) * r).addScaledVector(w, Math.sin(ang) * r)); }
    const m = mat(col);
    g.mats.push(m);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, tube, 6, false), m));
  });
  return g;
}

/**
 * The flat face of a cut (a cross-section): a disc of radius r, with round holes ({ x, z, r }) for the things that
 * pass through it. Lies in the xz plane facing +y (the cut end of a cylinder whose axis is y).
 */
export function cutFaceGeo(r, holes = [], seg = 64) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, r, 0, Math.PI * 2, false);
  for (const h of holes) { const p = new THREE.Path(); p.absarc(h.x, -h.z, h.r, 0, Math.PI * 2, true); shape.holes.push(p); }
  const g = new THREE.ShapeGeometry(shape, seg / 4);
  g.rotateX(-Math.PI / 2);
  return g;
}
/** A flat ring (annulus) in the xz plane, facing +y, centred on (x, y, z). */
export function ringFaceGeo(x, y, z, r0, r1, seg = 32) {
  const g = new THREE.RingGeometry(r0, r1, seg);
  g.rotateX(-Math.PI / 2);
  g.translate(x, y, z);
  return g;
}

/** A curved wall: part of a thick tube (radius r0…r1, angle a0…a1 measured as x = r·sin a, z = r·cos a), axis y. */
export function arcWallGeo(r0, r1, a0, a1, len, seg = 28) {
  const s = new THREE.Shape();
  const P = (r, a) => [r * Math.sin(a), -r * Math.cos(a)];
  s.moveTo(...P(r1, a0));
  for (let i = 1; i <= seg; i++) s.lineTo(...P(r1, a0 + ((a1 - a0) * i) / seg));
  for (let i = seg; i >= 0; i--) s.lineTo(...P(r0, a0 + ((a1 - a0) * i) / seg));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false, curveSegments: 4 });
  g.rotateX(-Math.PI / 2); // extrusion depth (z) becomes +y; shape (x, y) becomes (x, −z)… with the sign chosen above, z = r·cos a
  g.translate(0, -len / 2, 0);
  g.computeVertexNormals();
  return g;
}

/** Many small balls merged into one geometry (ribosomes, beads, fat droplets). */
export const ballsGeo = (points, r, w = 6, h = 4) => mergeGeometries(points.map((p) => ball(p, r, w, h)), false);
export { lumpGeo, meshOf, tone };

// ------------------------------------------------------------------ DNA, nucleosomes, ribosomes
/** Base colours as textbooks use them; pairs A–T and G–C. */
export const BASE_COLORS = { A: '#ef4444', T: '#f2c14e', G: '#22c55e', C: '#a855f7', U: '#38bdf8' };
const pairOf = { A: 'T', T: 'A', G: 'C', C: 'G' };

/**
 * B-DNA drawn the textbook way: two sugar–phosphate backbones (ribbons with a bead per phosphate) wound round each
 * other, offset so the major and minor grooves show, and between them the base pairs as flat slabs, each half
 * coloured by its base (A–T, G–C). Axis = y, from y0 upward; 10.5 base pairs per turn. Returns a Group.
 */
export function dnaHelix({ n = 60, rise = 0.13, r = 0.8, y0 = 0, seq = 'ATGCGTACCTGAGCTTAACGGATCCATGCAATGGCTAGCATTGCCAGTACGGATCTGAC', colors = ['#5b8def', '#2f55c9'], phosphate = '#c7d2fe' } = {}) {
  const g = new THREE.Group();
  const turn = (Math.PI * 2) / 10.5, groove = 2.35; // the second strand trails by 2.35 rad: a wide and a narrow groove
  const s1 = [], s2 = [];
  for (let i = 0; i < n; i++) { const a = i * turn, y = y0 + i * rise; s1.push(V(Math.cos(a) * r, y, Math.sin(a) * r)); s2.push(V(Math.cos(a + groove) * r, y, Math.sin(a + groove) * r)); }
  [s1, s2].forEach((pts, k) => {
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 4, r * 0.085, 8, false), mat(colors[k], { rough: 0.4 })));
  });
  g.add(new THREE.Mesh(ballsGeo([...s1, ...s2], r * 0.085 * 1.55, 10, 7), mat(phosphate, { rough: 0.35 })));
  const byColor = {};
  const slab = new THREE.BoxGeometry(1, 1, 1);
  const q = new THREE.Quaternion(), m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const b1 = seq[i % seq.length], b2 = pairOf[b1];
    const a = s1[i], b = s2[i], len = a.distanceTo(b) * 0.5 - r * 0.08;
    const dir = b.clone().sub(a).normalize();
    q.setFromUnitVectors(V(1, 0, 0), dir);
    for (const [base, from, sgn] of [[b1, a, 1], [b2, b, -1]]) {
      const geo = slab.clone();
      const c = from.clone().addScaledVector(dir, sgn * (r * 0.08 + len / 2));
      m4.compose(c, q, V(len - 0.015, rise * 0.42, r * 0.2));
      geo.applyMatrix4(m4);
      (byColor[base] ||= []).push(geo);
    }
  }
  for (const [base, geos] of Object.entries(byColor)) g.add(new THREE.Mesh(mergeGeometries(geos, false), mat(BASE_COLORS[base], { rough: 0.45 })));
  g.userData.strands = [s1, s2];
  return g;
}

/**
 * A nucleosome: eight histone proteins (two layers of four, as a squat drum of lumps) with DNA wrapped round them
 * 1.65 times, and the histones' tails sticking out (where the chemical tags of epigenetics go). Axis = z (faces the
 * viewer). Returns { g, entry, exit } (where the DNA comes in and goes out, local).
 */
export function nucleosome({ r = 0.36, color = '#a78bfa', dna = '#5b8def', seed = 1 } = {}) {
  const g = new THREE.Group();
  const lumps = [], tails = [];
  for (let layer = 0; layer < 2; layer++) for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + layer * 0.4;
    lumps.push(lumpGeo(V(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, (layer - 0.5) * r * 0.5), r * 0.42, { seed: seed + k + layer * 4, amp: 0.12, stretch: [1, 1, 0.75] }));
    const tip = V(Math.cos(a) * r * 1.9, Math.sin(a) * r * 1.9, (layer - 0.5) * r * 1.2);
    tails.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, (layer - 0.5) * r * 0.5), V(Math.cos(a + 0.3) * r * 1.4, Math.sin(a + 0.3) * r * 1.4, (layer - 0.5) * r * 0.9), tip]), 10, r * 0.045, 5, false));
  }
  g.add(meshOf(lumps, mat(color, { rough: 0.5 })), meshOf(tails, mat(tone(color, 0.3))));
  const wrap = [], R = r * 1.08, turns = 1.65;
  for (let i = 0; i <= 80; i++) { const t = i / 80, a = -Math.PI / 2 + t * turns * Math.PI * 2; wrap.push(V(Math.cos(a) * R, Math.sin(a) * R, (t - 0.5) * r * 1.1)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wrap), 140, r * 0.17, 8, false), mat(dna, { rough: 0.4 })));
  return { g, entry: wrap[0], exit: wrap[wrap.length - 1] };
}

/** A ribosome: the large subunit above, the small one below, with a groove between them where the mRNA runs (along x). */
export function ribosome({ big = '#8b5cf6', small = '#c4b5fd', s = 1 } = {}) {
  const g = new THREE.Group();
  g.add(meshOf([lumpGeo(V(0, 0.36 * s, 0), 0.5 * s, { stretch: [1.25, 0.82, 1], seed: 4, amp: 0.13 }), lumpGeo(V(-0.32 * s, 0.62 * s, 0.1 * s), 0.2 * s, { seed: 7, amp: 0.1 })], mat(big, { rough: 0.5 })));
  g.add(meshOf([lumpGeo(V(0.05 * s, -0.24 * s, 0), 0.34 * s, { stretch: [1.35, 0.62, 1], seed: 9, amp: 0.14 }), lumpGeo(V(0.35 * s, -0.3 * s, 0.12 * s), 0.13 * s, { seed: 2, amp: 0.1 })], mat(small, { rough: 0.5 })));
  return g;
}

// ------------------------------------------------------------------ glia and small neurons
const taperGeo = (pts, r, k0 = 1, k1 = 0.3, seg = 12, radial = 6) => {
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(curve, seg, r, radial, false);
  const pos = g.attributes.position, c = V(), p = V();
  for (let i = 0; i <= seg; i++) { curve.getPointAt(i / seg, c); const k = k0 + (k1 - k0) * (i / seg); for (let j = 0; j <= radial; j++) { const n = i * (radial + 1) + j; p.fromBufferAttribute(pos, n).sub(c).multiplyScalar(k).add(c); pos.setXYZ(n, p.x, p.y, p.z); } }
  g.computeVertexNormals();
  return g;
};
/** A branch that forks `depth` times from p0 along d; pushes tapered tube geometries into `out`. */
function branchGeo(out, p0, d, len, r, depth, rnd, { spread = 0.9, flat = 1, twigs = 0 } = {}) {
  const wob = () => V(rnd() - 0.5, rnd() - 0.5, (rnd() - 0.5) * flat).multiplyScalar(0.35);
  const p1 = p0.clone().addScaledVector(d, len * 0.5).add(wob().multiplyScalar(len * 0.4)), p2 = p0.clone().addScaledVector(d, len).add(wob().multiplyScalar(len * 0.5));
  out.push(taperGeo([p0, p1, p2], r, 1, depth > 0 ? 0.7 : 0.25, 10, 6));
  if (depth > 0) for (let b = 0; b < 2; b++) { const nd = d.clone().add(V(rnd() - 0.5, rnd() - 0.5, (rnd() - 0.5) * flat).multiplyScalar(spread * 2)).normalize(); branchGeo(out, p2, nd, len * 0.62, r * 0.68, depth - 1, rnd, { spread, flat, twigs }); }
  else for (let k = 0; k < twigs; k++) { const q = p1.clone().lerp(p2, rnd()), nd = V(rnd() - 0.5, rnd() - 0.5, (rnd() - 0.5) * flat).normalize(); out.push(new THREE.CylinderGeometry(r * 0.25, r * 0.4, len * 0.25, 4).applyMatrix4(new THREE.Matrix4().compose(q.clone().addScaledVector(nd, len * 0.12), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), nd), V(1, 1, 1)))); }
}
/**
 * A protoplasmic astrocyte: a lumpy body with its nucleus, and a dense bush of branching processes, the finest ending
 * in short twigs (the "spongy" look of a real astrocyte). One mesh for the cell, one for the nucleus. Returns a Group.
 */
export function astrocyteModel(rnd, { scale = 1, color = '#62b6cb', n = 13, flat = 0.6 } = {}) {
  const g = new THREE.Group(), geos = [lumpGeo(V(), 0.38 * scale, { seed: 4, amp: 0.22, stretch: [1.1, 1, 0.9] })];
  for (let i = 0; i < n; i++) { const d = V(rnd() - 0.5, rnd() - 0.5, (rnd() - 0.5) * flat).normalize(); branchGeo(geos, d.clone().multiplyScalar(0.25 * scale), d, 0.95 * scale, 0.085 * scale, 2, rnd, { flat, twigs: 3 }); }
  g.add(meshOf(geos, mat(color, { rough: 0.5 })));
  g.add(new THREE.Mesh(lumpGeo(V(0.05 * scale, 0, 0.12 * scale), 0.17 * scale, { seed: 2, amp: 0.06 }), mat(tone(color, -0.55), { rough: 0.5 })));
  return g;
}
/** A small neuron: lumpy body with its nucleus, branching dendrites and an axon. One mesh (plus the nucleus). */
export function neuronModel(rnd, { size = 1, color = '#e8a598', dendrites = 5, flat = 0.4 } = {}) {
  const g = new THREE.Group(), geos = [lumpGeo(V(), 0.26 * size, { seed: Math.floor(rnd() * 9) + 1, amp: 0.12, stretch: [1, 1.15, 0.9] })];
  for (let i = 0; i < dendrites; i++) { const a = (i / dendrites) * Math.PI * 2 + rnd(); const d = V(Math.cos(a), Math.sin(a), (rnd() - 0.5) * flat).normalize(); branchGeo(geos, d.clone().multiplyScalar(0.18 * size), d, 0.75 * size, 0.06 * size, 1, rnd, { flat }); }
  geos.push(taperGeo([V(0, -0.24 * size, 0), V(0.05, -0.7 * size, 0.05), V(-0.05, -1.3 * size, 0)], 0.035 * size, 1.4, 0.8, 12, 5));
  g.add(meshOf(geos, mat(color, { rough: 0.5 })));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.11 * size, 12, 9).translate(0, 0.02, 0.12 * size), mat(tone(color, -0.45))));
  return g;
}
/**
 * A myelin segment (axis y, length len, outer radius r): a sheath that narrows at both ends where its last turns
 * (the paranodal loops, faint rings) hug the axon. Returns a geometry.
 */
export function myelinSegmentGeo(len, r, ax = 0.06) {
  const pts = [], n = 24;
  for (let i = 0; i <= n; i++) { const t = i / n, y = -len / 2 + t * len, e = Math.min(1, Math.min(t, 1 - t) * len / (r * 1.3)); pts.push(new THREE.Vector2(ax + (r - ax) * Math.sqrt(Math.max(0, e * (2 - e))), y)); }
  const g = new THREE.LatheGeometry(pts, 28);
  const rings = [];
  const nr = len > r * 7 ? 4 : len > r * 2.5 ? 2 : 0; // short sheaths get fewer rings, or none
  for (const s of [-1, 1]) for (let k = 0; k < nr; k++) { const y = s * (len / 2 - r * 0.25 - k * r * 0.22), t = (y + len / 2) / len, e = Math.min(1, Math.min(t, 1 - t) * len / (r * 1.3)), rr = ax + (r - ax) * Math.sqrt(Math.max(0, e * (2 - e))); rings.push(new THREE.TorusGeometry(rr * 1.01, r * 0.035, 5, 24).rotateX(Math.PI / 2).translate(0, y, 0)); }
  return mergeGeometries([g.toNonIndexed(), ...rings.map((x) => x.toNonIndexed())].map((x) => { x.deleteAttribute('uv'); return x; }), false);
}
/** A microglial cell: a small, elongated body with thin, highly branched processes. Returns { g, body, arms }. */
export function microgliaModel(rnd, { color = '#3cb37a', n = 9, scale = 1 } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  body.add(new THREE.Mesh(lumpGeo(V(), 0.3 * scale, { seed: 2, amp: 0.25, stretch: [1.4, 0.85, 0.8] }), mat(color, { rough: 0.5 })));
  body.add(new THREE.Mesh(lumpGeo(V(0.04, 0, 0.1), 0.17 * scale, { seed: 5, amp: 0.15, stretch: [1.5, 0.8, 0.8] }), mat(tone(color, -0.55))));
  g.add(body);
  const arms = [];
  for (let i = 0; i < n; i++) {
    const d = V(rnd() - 0.5, rnd() - 0.5, (rnd() - 0.5) * 0.4).normalize(), geos = [];
    branchGeo(geos, d.clone().multiplyScalar(0.2 * scale), d, 0.9 * scale, 0.05 * scale, 2, rnd, { flat: 0.4, spread: 1.1, twigs: 2 });
    const arm = new THREE.Group(); arm.add(meshOf(geos, mat(color, { rough: 0.5 }))); arm.userData.phase = rnd() * 6;
    g.add(arm); arms.push(arm);
  }
  return { g, body, arms };
}
