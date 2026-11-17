// Procedural neurons, reused by several zoom levels.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { V, mat, sphere, group } from './build.js';
import { lumpGeo, myelinSegmentGeo } from './cells.js';

/** Deterministic random numbers (same shape every time). */
export function seeded(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A tube along `pts` whose radius shrinks from r·k0 to r·k1 (geometry). */
function taperGeo(pts, r, k0 = 1, k1 = 0.6, seg = 24, radial = 7) {
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(curve, seg, r, radial, false);
  const pos = g.attributes.position, c = V(), p = V();
  for (let i = 0; i <= seg; i++) { curve.getPointAt(i / seg, c); const k = k0 + (k1 - k0) * (i / seg); for (let j = 0; j <= radial; j++) { const n = i * (radial + 1) + j; p.fromBufferAttribute(pos, n).sub(c).multiplyScalar(k).add(c); pos.setXYZ(n, p.x, p.y, p.z); } }
  g.computeVertexNormals();
  return { g, curve };
}

/**
 * A branching dendrite tree from `start` in direction `dir`, drawn the textbook way (owner, 2026-11-15: better-looking
 * models): smoothly curving branches that taper and fork (sometimes in three), studded with mushroom-shaped spines
 * (a thin neck and a round head). Returns { meshes, tips, curves, spineMeshes }: one mesh for the branches, one for
 * the spines.
 */
export function dendriteTree(start, dir, { length = 1.8, radius = 0.06, depth = 2, rnd = seeded(3), color = '#e7a094', spines = true } = {}) {
  const geos = [], spineGeos = [], tips = [], curves = [];
  const grow = (p0, d, len, r, level) => {
    const pts = [p0.clone()];
    let p = p0.clone(), dd = d.clone();
    for (let k = 0; k < 4; k++) {
      dd.add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.38)).normalize();
      p = p.clone().add(dd.clone().multiplyScalar(len / 4));
      pts.push(p);
    }
    const { g, curve } = taperGeo(pts, r, 1, 0.72);
    geos.push(g); curves.push(curve);
    if (spines) {
      for (let s = 0.12; s < 0.98; s += 0.07 + rnd() * 0.05) {
        const q = curve.getPointAt(s), out = V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), rr = r * (1 - 0.28 * s);
        const neck = new THREE.CylinderGeometry(rr * 0.18, rr * 0.22, rr * 1.4, 5);
        neck.applyMatrix4(new THREE.Matrix4().compose(q.clone().addScaledVector(out, rr * 1.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), out), V(1, 1, 1)));
        const head = new THREE.SphereGeometry(rr * (0.38 + rnd() * 0.2), 7, 5); head.translate(...q.clone().addScaledVector(out, rr * 2.3).toArray());
        spineGeos.push(neck, head);
      }
    }
    if (level < depth) {
      const n = level === 0 && rnd() < 0.4 ? 3 : 2;
      for (let b = 0; b < n; b++) {
        const nd = dd.clone().add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.15)).normalize();
        grow(p, nd, len * (0.55 + rnd() * 0.15), r * 0.72, level + 1);
      }
    } else tips.push(p);
  };
  grow(start, dir.clone().normalize(), length, radius, 0);
  const meshes = [new THREE.Mesh(mergeGeometries(geos, false), mat(color, { rough: 0.5 }))];
  geos.forEach((g) => g.dispose());
  const spineMeshes = spineGeos.length ? [new THREE.Mesh(mergeGeometries(spineGeos, false), mat('#f3b6a8', { rough: 0.5 }))] : [];
  return { meshes, tips, curves, spineMeshes };
}

/**
 * A multipolar neuron along +x. Returns named groups so levels can register them as parts, and the axon curve.
 * soma at origin, axon to x ≈ axonLength. Drawn the textbook way (owner, 2026-11-15): a lumpy see-through cell body
 * with its nucleus, nucleolus and Nissl bodies; a smooth hillock narrowing into a tapering axon with one collateral;
 * myelin segments that narrow at their ends; branching terminals ending in boutons.
 */
export function makeNeuron({ axonLength = 6, myelin = true, seed = 7, dendriteCount = 6, scale = 1 } = {}) {
  const rnd = seeded(seed);
  const g = new THREE.Group();
  const soma = new THREE.Mesh(lumpGeo(V(), 0.55, { seed, amp: 0.1, stretch: [1.1, 0.95, 0.95] }), mat('#e8a598', { opacity: 0.55, rough: 0.45 }));
  soma.material.depthWrite = false;
  const nissl = []; for (let k = 0; k < 26; k++) { const d = V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(0.3 + rnd() * 0.15); nissl.push(new THREE.SphereGeometry(0.03 + rnd() * 0.02, 6, 5).scale(1.6, 0.6, 1).translate(d.x, d.y, d.z)); }
  soma.add(new THREE.Mesh(mergeGeometries(nissl, false), mat('#6d28d9', { opacity: 0.7 }))); // Nissl bodies (rough ER)
  const nucleus = new THREE.Mesh(lumpGeo(V(), 0.24, { seed: seed + 1, amp: 0.05 }), mat('#7c5cbf', { rough: 0.4 }));
  const nucleolus = sphere(0.08, '#3b2a73');
  nucleolus.position.set(0.06, 0.05, 0.1);
  const dendrites = new THREE.Group(), spines = new THREE.Group();
  const tips = [], dCurves = [];
  for (let i = 0; i < dendriteCount; i++) {
    const a = (i / dendriteCount) * Math.PI * 2;
    const dir = V(-0.6 - rnd() * 0.6, Math.cos(a) * 1.1, Math.sin(a) * 1.1).normalize();
    const tree = dendriteTree(dir.clone().multiplyScalar(0.42), dir, { length: 1.9 + rnd() * 0.6, rnd, depth: 2, radius: 0.08 });
    tree.meshes.forEach((m) => dendrites.add(m));
    tree.spineMeshes.forEach((m) => spines.add(m));
    tips.push(...tree.tips);
    dCurves.push(...tree.curves);
  }
  // the hillock: a smooth cone from the cell body into the axon
  const hillock = new THREE.Mesh(new THREE.LatheGeometry([[0.26, 0], [0.2, 0.1], [0.12, 0.24], [0.075, 0.38], [0.065, 0.46]].map(([r, y]) => new THREE.Vector2(r, y)), 20), mat('#e19083', { rough: 0.45 }));
  hillock.rotation.z = -Math.PI / 2;
  hillock.position.set(0.44, 0, 0);
  const axonPts = [];
  for (let k = 0; k <= 12; k++) { const x = 0.88 + (k / 12) * (axonLength - 0.88); axonPts.push(V(x, Math.sin(k * 0.7) * 0.12, Math.cos(k * 0.5) * 0.1)); }
  const ax = taperGeo(axonPts, 0.065, 1, 0.75, 128, 8);
  const axon = new THREE.Mesh(ax.g, mat('#e19083', { rough: 0.45 }));
  axon.userData.curve = ax.curve;
  axon.userData.dot = true; // the part's dot sits on the axon itself, not between it and the collateral
  const axonCurve = ax.curve;
  const p0c = axonCurve.getPointAt(0.04), collateral = new THREE.Mesh(taperGeo([p0c, p0c.clone().add(V(0.3, -0.35, 0.1)), p0c.clone().add(V(0.5, -0.9, 0.15)), p0c.clone().add(V(0.45, -1.3, 0.1))], 0.03, 1, 0.6, 20, 5).g, axon.material); // a collateral (its own mesh: the axon dot stays on the axon)
  // Myelin segments with gaps (nodes of Ranvier)
  const myelinG = new THREE.Group(), nodesG = new THREE.Group();
  const nodeTs = [];
  const segLen = 0.55, gap = 0.1;
  const L = axonCurve.getLength();
  let s = 0.5;
  while (s + segLen < L - 0.5) {
    const t0 = s / L, t1 = (s + segLen) / L;
    const p0 = axonCurve.getPointAt(t0), p1 = axonCurve.getPointAt(t1);
    const seg = new THREE.Mesh(myelinSegmentGeo(p0.distanceTo(p1), 0.17, 0.065), mat('#f4eee0', { rough: 0.3 }));
    seg.position.copy(p0).lerp(p1, 0.5);
    seg.quaternion.setFromUnitVectors(V(0, 1, 0), p1.clone().sub(p0).normalize());
    myelinG.add(seg);
    const nodeT = (s + segLen + gap / 2) / L;
    if (nodeT < 1) {
      const np = axonCurve.getPointAt(nodeT);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.025, 8, 24), mat('#ffd166'));
      ring.position.copy(np);
      ring.quaternion.setFromUnitVectors(V(0, 0, 1), axonCurve.getTangentAt(nodeT));
      nodesG.add(ring);
      nodeTs.push(nodeT);
    }
    s += segLen + gap;
  }
  myelinG.visible = myelin;
  // Axon terminals: the axon splits into fine branches, each ending in a bouton
  const terminals = new THREE.Group();
  const end = axonCurve.getPointAt(1);
  const termTips = [], tg = [], bg = [];
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    const tip = end.clone().add(V(0.5, Math.cos(a) * 0.45, Math.sin(a) * 0.45));
    const mid = end.clone().lerp(tip, 0.5).add(V(0, 0.05, 0));
    tg.push(taperGeo([end, mid, tip], 0.04, 1, 0.7, 16, 6).g);
    bg.push(lumpGeo(tip, 0.12, { seed: k + 3, amp: 0.08, stretch: [1.2, 0.95, 0.95] }));
    const side = mid.clone().add(V(0.22, Math.cos(a + 0.8) * 0.2, Math.sin(a + 0.8) * 0.2)); // a second, smaller ending off each branch
    tg.push(taperGeo([mid, mid.clone().lerp(side, 0.5), side], 0.025, 1, 0.7, 8, 5).g);
    bg.push(lumpGeo(side, 0.07, { seed: k + 9, amp: 0.08 }));
    termTips.push(tip);
  }
  terminals.add(new THREE.Mesh(mergeGeometries(tg, false), mat('#e19083', { rough: 0.45 })), new THREE.Mesh(mergeGeometries(bg, false), mat('#f08a7a', { rough: 0.4 })));
  g.add(soma, nucleus, nucleolus, dendrites, spines, hillock, axon, collateral, myelinG, nodesG, terminals);
  g.scale.setScalar(scale);
  return { group: g, soma, nucleus, nucleolus, dendrites, spines, hillock, axon, collateral, axonCurve, myelin: myelinG, nodes: nodesG, nodeTs, terminals, termTips, tips, dCurves };
}

export { group };
