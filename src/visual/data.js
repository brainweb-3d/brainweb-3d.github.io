// Loaders that turn the real scientific data (public/data, public/models) into three.js objects.
//   molecules: PubChem 3D conformers   proteins: RCSB PDB backbones   neurons: NeuroMorpho reconstructions
//   body: BodyParts3D skeleton, skin and organs (see docs/data-credits.md)
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { mat } from './build.js';

const BASE = import.meta.env?.BASE_URL || '/';
const cache = new Map();
export function loadJSON(rel) {
  if (!cache.has(rel)) cache.set(rel, fetch(BASE + rel).then((r) => { if (!r.ok) throw new Error(`${rel}: ${r.status}`); return r.json(); }));
  return cache.get(rel);
}

// ---------------------------------------------------------------- molecules
/** CPK colours (the usual chemistry colours). */
export const CPK = { H: '#f1f5f9', C: '#4b5563', N: '#3b82f6', O: '#ef4444', S: '#eab308', P: '#f97316', Cl: '#22c55e', F: '#84cc16' };
/** van der Waals radii in Å (for space-filling). */
const VDW = { H: 1.2, C: 1.7, N: 1.55, O: 1.52, S: 1.8, P: 1.8, Cl: 1.75, F: 1.47 };
const sphereGeo = new THREE.SphereGeometry(1, 20, 14);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 10);

export const moleculeData = () => loadJSON('data/molecules.json').then((d) => d.molecules);

// ---------------------------------------------------------------- sourced cell models (public/models)
const LITE = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768);
const glbCache = new Map();
/**
 * A sourced model from public/models (phones get the "-lite" file), as a fresh copy; cached per file.
 * Used for the parts of a scene that have a real model (e.g. the sensory cells), each fitted with `fitModel`.
 */
export function loadModelGLB(file) {
  if (!glbCache.has(file)) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    glbCache.set(file, loader.loadAsync(`${BASE}models/${file}${LITE ? '-lite' : ''}.glb`).catch((e) => { glbCache.delete(file); throw e; }));
  }
  return glbCache.get(file).then((g) => g.scene.clone(true));
}

/** Scale `obj` so its height is `height`, and centre it on `at` (a Vector3). Returns `obj`. */
export function fitModel(obj, height, at) {
  obj.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(obj);
  const h = b.max.y - b.min.y || 1;
  const g = new THREE.Group();
  obj.position.sub(b.getCenter(new THREE.Vector3()));
  g.add(obj);
  g.scale.setScalar(height / h);
  g.position.copy(at);
  return g;
}

/**
 * Build a molecule. style: 'ball' (ball-and-stick) or 'space' (space-filling). scale: scene units per Å.
 * Returns a Group with children tagged userData.el / userData.h (hydrogen) so styles can be switched.
 */
export function buildMolecule(m, { scale = 0.42, style = 'ball', hydrogens = true } = {}) {
  const g = new THREE.Group();
  const mats = {};
  const matFor = (el) => (mats[el] ||= mat(CPK[el] || '#a855f7', { rough: 0.35 }));
  const bondMat = mat('#cbd5e1', { rough: 0.4 });
  const P = m.atoms.map((a) => new THREE.Vector3(a[1], a[2], a[3]).multiplyScalar(scale));
  m.atoms.forEach((a, i) => {
    const s = new THREE.Mesh(sphereGeo, matFor(a[0]));
    s.position.copy(P[i]);
    s.userData = { el: a[0], h: a[0] === 'H', ball: (a[0] === 'H' ? 0.22 : 0.34) * scale * 1.9, space: (VDW[a[0]] || 1.7) * scale };
    g.add(s);
  });
  for (const [i, j, o] of m.bonds) {
    const a = P[i], b = P[j];
    const h = m.atoms[i][0] === 'H' || m.atoms[j][0] === 'H';
    const dir = b.clone().sub(a);
    const len = dir.length();
    const side = dir.clone().cross(new THREE.Vector3(0, 0, 1)).normalize();
    if (side.lengthSq() < 0.1) side.set(1, 0, 0);
    const offs = o === 2 ? [-1, 1] : o === 3 ? [-1.6, 0, 1.6] : [0];
    for (const k of offs) {
      const c = new THREE.Mesh(cylGeo, bondMat);
      const r = (o > 1 ? 0.06 : 0.09) * scale * 1.9;
      c.scale.set(r, len, r);
      c.position.copy(a).add(b).multiplyScalar(0.5).add(side.clone().multiplyScalar(k * 0.11 * scale * 1.9));
      c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      c.userData = { bond: true, h };
      g.add(c);
    }
  }
  setMoleculeStyle(g, { style, hydrogens });
  return g;
}
export function setMoleculeStyle(g, { style = 'ball', hydrogens = true } = {}) {
  g.children.forEach((o) => {
    const u = o.userData;
    if (u.bond) { o.visible = style === 'ball' && (hydrogens || !u.h); return; }
    o.visible = hydrogens || !u.h;
    o.scale.setScalar(style === 'space' ? u.space : u.ball);
  });
  g.userData.style = style;
  g.userData.hydrogens = hydrogens;
}

// ---------------------------------------------------------------- proteins
export const proteinData = (id) => loadJSON(`data/proteins/${id}.json`);
/** A ribbon-like smooth tube through the Cα backbone, one colour per chain. */
export function buildProtein(d, { scale = 0.04, radius = 1.3, colors = null, chains = null, opacity = 1 } = {}) {
  const g = new THREE.Group();
  const pal = colors || ['#3cb37a', '#5b8def', '#f59e0b', '#e11d48', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16'];
  d.chains.forEach((ch, ci) => {
    if (chains && !chains.includes(ch.id) && !chains.includes(ch.id[0])) return;
    const color = typeof pal === 'function' ? pal(ch.id, ci) : pal[ci % pal.length];
    const geos = [];
    if (ch.segments) {
      for (const seg of ch.segments) {
        if (seg.length < 4) continue;
        const curve = new THREE.CatmullRomCurve3(seg.map((p) => new THREE.Vector3(p[0], p[1], p[2]).multiplyScalar(scale)));
        geos.push(new THREE.TubeGeometry(curve, Math.min(1200, seg.length * 3), radius * scale, 6, false));
      }
    } else if (ch.backbone) {
      const curve = new THREE.CatmullRomCurve3(ch.backbone.map((p) => new THREE.Vector3(p[0], p[1], p[2]).multiplyScalar(scale)));
      geos.push(new THREE.TubeGeometry(curve, ch.backbone.length * 6, radius * 1.4 * scale, 8, false));
      for (const b of ch.bases || []) {
        // a base pair "rung" pointing to the helix axis
        const p = new THREE.Vector3(...b.p).multiplyScalar(scale);
        const toAxis = new THREE.Vector3(-p.x, 0, -p.z).normalize().multiplyScalar(4.5 * scale);
        const c = new THREE.CylinderGeometry(0.7 * scale, 0.7 * scale, toAxis.length(), 6);
        c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), toAxis.clone().normalize()));
        c.translate(p.x + toAxis.x / 2, p.y, p.z + toAxis.z / 2);
        geos.push(c);
      }
    }
    if (!geos.length) return;
    const merged = mergeGeometries(geos.map((x) => x.index ? x.toNonIndexed() : x), false);
    const mesh = new THREE.Mesh(merged, mat(color, { rough: 0.45, opacity }));
    mesh.userData.chain = ch.id;
    g.add(mesh);
  });
  if (d.ligands?.length) {
    const lg = new THREE.Group();
    for (const a of d.ligands) {
      const s = new THREE.Mesh(sphereGeo, mat(CPK[a[0]] || '#f472b6', { emissive: '#f472b6' }));
      s.material.emissive.multiplyScalar(0.25);
      s.scale.setScalar(1.1 * scale);
      s.position.set(a[1], a[2], a[3]).multiplyScalar(scale);
      lg.add(s);
    }
    lg.userData.ligand = true;
    g.add(lg);
  }
  return g;
}

/** All Cα points of some chains (Å). */
export function chainPoints(d, ids) {
  return d.chains.filter((c) => !ids || ids.includes(c.id) || ids.includes(c.id[0])).flatMap((c) => (c.segments ? c.segments.flat() : c.backbone || []));
}
/** Main (longest) axis of a point cloud — power iteration on the covariance matrix. */
export function principalAxis(pts) {
  const n = pts.length;
  const m = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / n);
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of pts) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += (p[i] - m[i]) * (p[j] - m[j]);
  let v = [0.3, 1, 0.2];
  for (let it = 0; it < 50; it++) {
    const w = [0, 1, 2].map((i) => C[i][0] * v[0] + C[i][1] * v[1] + C[i][2] * v[2]);
    const l = Math.hypot(...w) || 1;
    v = w.map((x) => x / l);
  }
  return { axis: new THREE.Vector3(...v), centre: new THREE.Vector3(...m) };
}
/**
 * Rotation that stands a membrane protein upright: its `axisChains` main axis → +y, with the `downChains`
 * (e.g. the G-protein inside the cell) pointing down. Apply to a group built with the same data.
 */
export function uprightQuaternion(d, axisChains, downChains = null) {
  const { axis, centre } = principalAxis(chainPoints(d, axisChains));
  if (downChains) {
    const dc = principalAxis(chainPoints(d, downChains)).centre;
    if (dc.clone().sub(centre).dot(axis) > 0) axis.negate();
  }
  return new THREE.Quaternion().setFromUnitVectors(axis.normalize(), new THREE.Vector3(0, 1, 0));
}

/**
 * Orientation for a membrane protein. mode 'sym': the pore axis of a symmetric channel = normal of the plane through
 * the subunit centres (chains); mode 'long': the longest axis. `down` chains (inside the cell) end up below,
 * `up` chains (outside) above.
 */
export function orientQuaternion(d, { mode = 'long', chains = null, down = null, up = null } = {}) {
  let axis, centre;
  if (mode === 'sym') {
    const cs = d.chains.filter((c) => !chains || chains.includes(c.id) || chains.includes(c.id[0])).map((c) => principalAxis(chainPoints(d, [c.id])).centre);
    centre = cs.reduce((s, c) => s.add(c), new THREE.Vector3()).divideScalar(cs.length);
    const n = cs.length;
    axis = new THREE.Vector3().crossVectors(cs[Math.floor(n / 2)].clone().sub(cs[0]), cs[Math.floor((3 * n) / 4) % n].clone().sub(cs[Math.floor(n / 4)])).normalize();
    if (axis.lengthSq() < 0.5) axis = principalAxis(chainPoints(d, chains)).axis;
  } else ({ axis, centre } = principalAxis(chainPoints(d, chains)));
  const side = (ids, sign) => { if (!ids) return; const c = principalAxis(chainPoints(d, ids)).centre; if (c.clone().sub(centre).dot(axis) * sign < 0) axis.negate(); };
  side(down, -1);
  side(up, 1);
  return new THREE.Quaternion().setFromUnitVectors(axis.normalize(), new THREE.Vector3(0, 1, 0));
}

/**
 * Load a PDB structure as an upright group of a given height (scene units), centred at `at`.
 * opts: { chains, colors, orient: {mode, chains, down, up}, height, at, opacity, radius }
 * Resolves to { group, model, scale } — `model` is the inner group (add it to the stage as a part).
 */
export async function uprightProtein(id, { chains = null, colors = null, orient = {}, height = 3, at = new THREE.Vector3(), opacity = 1, radius = 1.4 } = {}) {
  const d = await proteinData(id);
  const pts = chainPoints(d, chains);
  const q = orientQuaternion(d, { chains, ...orient });
  // height of the structure along its new vertical axis (Å)
  let ymin = Infinity, ymax = -Infinity;
  const v = new THREE.Vector3();
  for (const p of pts) { v.set(p[0], p[1], p[2]).applyQuaternion(q); ymin = Math.min(ymin, v.y); ymax = Math.max(ymax, v.y); }
  const scale = height / (ymax - ymin);
  const model = buildProtein(d, { scale, chains, colors, opacity, radius });
  const turn = new THREE.Group();
  turn.quaternion.copy(q);
  turn.add(model);
  turn.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3());
  const group = new THREE.Group();
  group.add(turn);
  turn.position.sub(c);
  group.position.copy(at);
  return { group, model, scale, data: d };
}

// ---------------------------------------------------------------- neurons (SWC)
export const neuronData = (name) => loadJSON(`data/neurons/${name}.json`);
const SWC_COLORS = { 1: '#e11d48', 2: '#f59e0b', 3: '#5b8def', 4: '#8b5cf6' }; // soma, axon, dendrite, apical dendrite
/**
 * Build a neuron from its reconstruction: tapered cylinders between points, merged per compartment type.
 * scale: scene units per µm. Returns { group, byType: {1: mesh, 2: mesh, 3: mesh, 4: mesh} }.
 */
export function buildNeuron(d, { scale = 0.01, minRadius = 0.6, colors = SWC_COLORS, glia = false } = {}) {
  const pts = d.points;
  const byType = {};
  const geos = {};
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < pts.length; i++) {
    const [x, y, z, r, type, parent] = pts[i];
    const t = type === 1 ? 1 : type;
    if (parent < 0) continue;
    const q = pts[parent];
    const a = new THREE.Vector3(q[0], q[1], q[2]), b = new THREE.Vector3(x, y, z);
    const len = a.distanceTo(b);
    if (len < 1e-3) continue;
    const ra = Math.max(minRadius, q[3]) * scale, rb = Math.max(minRadius, r) * scale;
    const c = new THREE.CylinderGeometry(rb, ra, len * scale, 6, 1, true);
    c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, b.clone().sub(a).normalize()));
    c.translate((a.x + b.x) / 2 * scale, (a.y + b.y) / 2 * scale, (a.z + b.z) / 2 * scale);
    (geos[t] ||= []).push(c);
  }
  // soma: a sphere sized from the soma points
  const soma = pts.filter((p) => p[4] === 1);
  const somaR = soma.length ? Math.max(...soma.map((p) => p[3])) : 6;
  const sg = new THREE.SphereGeometry(Math.max(somaR, 4) * scale * (glia ? 1.3 : 1.15), 20, 14);
  (geos[1] ||= []).push(sg);
  const group = new THREE.Group();
  for (const [t, list] of Object.entries(geos)) {
    const merged = mergeGeometries(list.map((x) => (x.index ? x.toNonIndexed() : x)), false);
    merged.computeVertexNormals();
    const m = new THREE.Mesh(merged, mat(colors[t] || '#94a3b8', { rough: 0.5, side: THREE.DoubleSide }));
    byType[t] = m;
    group.add(m);
  }
  return { group, byType };
}

// ---------------------------------------------------------------- body (BodyParts3D)
let bodyPromise = null;
/** Loads public/models/body.glb once; resolves to { scene, parts: Map("part|side" → Mesh), landmarks }. */
export function loadBody() {
  if (!bodyPromise) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    bodyPromise = Promise.all([
      new Promise((res, rej) => loader.load(BASE + 'models/body.glb', res, undefined, rej)),
      loadJSON('data/body-landmarks.json'),
    ]).then(([gltf, landmarks]) => {
      const parts = new Map();
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        // quantized positions → plain floats, with the node's dequantization transform baked in (body coordinates)
        const pos = o.geometry.attributes.position;
        if (pos.normalized || !(pos.array instanceof Float32Array)) {
          const arr = new Float32Array(pos.count * 3);
          for (let i = 0; i < pos.count; i++) { arr[i * 3] = pos.getX(i); arr[i * 3 + 1] = pos.getY(i); arr[i * 3 + 2] = pos.getZ(i); }
          o.geometry.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        }
        o.geometry.deleteAttribute('normal');
        o.geometry.applyMatrix4(o.matrixWorld);
        o.geometry.computeVertexNormals();
        o.geometry.computeBoundingBox();
        parts.set(o.name, o);
      });
      return { parts, landmarks };
    });
  }
  return bodyPromise;
}

const BODY_COLORS = {
  skin: '#e9c6ad', skull: '#efe6d2', spine: '#efe6d2', ribs: '#efe6d2', shoulder: '#efe6d2', humerus: '#efe6d2', forearm: '#efe6d2', hand: '#efe6d2',
  pelvis: '#efe6d2', femur: '#efe6d2', leg: '#efe6d2', foot: '#efe6d2', heart: '#c0262d', lungs: '#f4a6b5', liver: '#8b3a2b', stomach: '#e8916b',
  gut: '#f0a07a', esophagus: '#e8916b', kidney: '#7f1d1d', adrenal: '#eab308', bladder: '#f5d78e', spleen: '#6b2142', pancreas: '#f2c38f',
  diaphragm: '#b4534a', eye: '#f8fafc',
};
const BONES = ['skull', 'spine', 'ribs', 'shoulder', 'humerus', 'forearm', 'hand', 'pelvis', 'femur', 'leg', 'foot'];
export { BONES };

/**
 * A posable real body. options: { skin: opacity (0 hides), skeleton: bool|opacity, organs: [part names] }.
 * Returns { group, meshes: {name → clone}, limbs: { L/R: {shoulder, elbow, hip, knee} pivots }, pt(name), landmarks }.
 */
export async function makeRealBody({ skin = 0.18, skeleton = 0.9, organs = [] } = {}) {
  const { parts, landmarks } = await loadBody();
  const J = landmarks.joints;
  const group = new THREE.Group();
  const meshes = {};
  const v = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  // pivot groups for posing: shoulder → elbow, hip → knee (positions from the real bones)
  const limbs = {};
  for (const s of ['L', 'R']) {
    const shoulder = new THREE.Group(); shoulder.position.copy(v(J[`shoulder${s}`])); group.add(shoulder);
    const elbow = new THREE.Group(); elbow.position.copy(v(J[`elbow${s}`]).sub(v(J[`shoulder${s}`]))); shoulder.add(elbow);
    const hip = new THREE.Group(); hip.position.copy(v(J[`hip${s}`])); group.add(hip);
    const knee = new THREE.Group(); knee.position.copy(v(J[`knee${s}`]).sub(v(J[`hip${s}`]))); hip.add(knee);
    limbs[s] = { shoulder, elbow, hip, knee };
  }
  const want = new Set([...(skin > 0 ? ['skin'] : []), ...(skeleton ? BONES : []), ...organs]);
  for (const [name, src] of parts) {
    const [part, side] = name.split('|');
    if (!want.has(part)) continue;
    const isSkin = part === 'skin', isBone = BONES.includes(part);
    const op = isSkin ? skin : isBone ? (typeof skeleton === 'number' ? skeleton : 0.9) : 1;
    const m = new THREE.Mesh(src.geometry, mat(BODY_COLORS[part] || '#cbd5e1', { opacity: op, rough: isSkin ? 0.7 : 0.5, side: isSkin ? THREE.FrontSide : THREE.DoubleSide }));
    if (isSkin) { m.material.depthWrite = false; m.renderOrder = 5; }
    m.name = name;
    // attach moving bones to the right pivot (positions converted into the pivot's local space)
    const s = side === 'left' ? 'L' : 'R';
    let parent = group;
    if (side !== 'mid' && (part === 'humerus')) parent = limbs[s].shoulder;
    else if (side !== 'mid' && (part === 'forearm' || part === 'hand')) parent = limbs[s].elbow;
    else if (side !== 'mid' && part === 'femur') parent = limbs[s].hip;
    else if (side !== 'mid' && (part === 'leg' || part === 'foot')) parent = limbs[s].knee;
    if (parent !== group) {
      group.updateMatrixWorld(true);
      const inv = parent.matrixWorld.clone().invert();
      m.applyMatrix4(inv);
    }
    parent.add(m);
    meshes[name] = m;
  }
  /** World position of a joint/landmark in the current pose (e.g. 'handL', 'elbowR', 'shoulderL'). */
  const pt = (name) => {
    group.updateMatrixWorld(true);
    const s = name.slice(-1), k = name.slice(0, -1);
    const L = limbs[s];
    const rel = (piv, a, b) => piv.localToWorld(v(J[a]).sub(v(J[b])));
    switch (k) {
      case 'shoulder': return L.shoulder.getWorldPosition(new THREE.Vector3());
      case 'elbow': return L.elbow.getWorldPosition(new THREE.Vector3());
      case 'wrist': return rel(L.elbow, `wrist${s}`, `elbow${s}`);
      case 'hand': return rel(L.elbow, `wrist${s}`, `elbow${s}`).add(new THREE.Vector3(0, -0.8, 0.1).applyQuaternion(L.elbow.getWorldQuaternion(new THREE.Quaternion())));
      case 'hip': return L.hip.getWorldPosition(new THREE.Vector3());
      case 'knee': return L.knee.getWorldPosition(new THREE.Vector3());
      case 'ankle': return rel(L.knee, `ankle${s}`, `knee${s}`);
      case 'foot': return rel(L.knee, `ankle${s}`, `knee${s}`).add(new THREE.Vector3(0, -0.5, 0.9));
      default: return new THREE.Vector3();
    }
  };
  return { group, meshes, limbs, pt, landmarks };
}

/** Points along the vertebral canal (C1 → sacrum), from the real vertebrae. */
export function spinePath(landmarks) {
  return landmarks.vertebrae.map((x) => new THREE.Vector3(x.p[0], x.p[1], x.p[2]));
}
