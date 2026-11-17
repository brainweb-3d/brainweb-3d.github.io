// Textbook-style membrane and membrane-protein models (owner, 2026-11-15: make the interactive models LOOK better).
// Used by the membrane-potential, ion-channel, receptor, Na⁺/K⁺ pump, NMDA and transporter scenes.
// Proteins are drawn the way biology textbooks draw them: α-helices as coils that cross the bilayer, joined by loops
// above and below it, and folded (globular) domains as rounded lumps. Every builder returns plain Groups that the scene
// adds with stage.add(obj, partId). Pieces that move are kept as separate meshes and posed by the builder.
// Each builder makes its own materials, because the stage dims and highlights a part by changing its materials.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { V, mat } from './build.js';

const LITE = window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768 || (navigator.deviceMemory || 8) <= 4;
const Q = LITE ? 0.6 : 1; // geometry detail
const UP = V(0, 1, 0);
const WHITE = new THREE.Color('#ffffff');

/** A lighter (t > 0) or darker (t < 0) version of a colour. */
export const tone = (c, t) => { const col = new THREE.Color(c); return t >= 0 ? col.lerp(WHITE, t) : col.multiplyScalar(1 + t); };
const P = (p) => (p.isVector3 ? p : V(...p));
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
/** 0 → 1 between a and b, back to 0 after (soft edges of width e). */
const bump = (x, a, b, e = 0.08) => ease((x - a) / e) * ease((b - x) / e);

// ------------------------------------------------------------------ pieces
/** A coil around the straight line a → b; its radius shrinks to 0 at both ends so it closes onto the axis. */
class Coil extends THREE.Curve {
  constructor(a, b, r, turns) {
    super();
    this.a = a.clone(); this.r = r; this.turns = turns;
    const ax = b.clone().sub(a); this.len = ax.length(); this.dir = ax.normalize();
    const ref = Math.abs(this.dir.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
    this.u = ref.cross(this.dir).normalize(); this.w = this.dir.clone().cross(this.u);
  }
  getPoint(t, out = new THREE.Vector3()) {
    const ang = t * this.turns * Math.PI * 2, k = Math.min(1, t * 10, (1 - t) * 10);
    return out.copy(this.a).addScaledVector(this.dir, t * this.len).addScaledVector(this.u, Math.cos(ang) * this.r * k).addScaledVector(this.w, Math.sin(ang) * this.r * k);
  }
}

/** An α-helix from a to b: a coiled tube wound round a solid core (geometries, to merge). */
export function helixGeo(a, b, { r = 0.085, tube = 0.042, pitch = 0.16 } = {}) {
  a = P(a); b = P(b);
  const len = a.distanceTo(b), turns = Math.max(1, len / pitch);
  const coil = new THREE.TubeGeometry(new Coil(a, b, r, turns), Math.ceil(turns * 10 * Q), tube, LITE ? 5 : 6, false);
  const core = new THREE.CylinderGeometry(r * 0.75, r * 0.75, len, LITE ? 6 : 8, 1, false);
  core.applyMatrix4(new THREE.Matrix4().compose(a.clone().lerp(b, 0.5), new THREE.Quaternion().setFromUnitVectors(UP, b.clone().sub(a).normalize()), V(1, 1, 1)));
  return [coil, core];
}
/** A loop (a stretch of chain with no fixed shape) through the given points. */
export function loopGeo(points, tube = 0.032) {
  const curve = new THREE.CatmullRomCurve3(points.map(P));
  return new THREE.TubeGeometry(curve, Math.max(8, Math.ceil(curve.getLength() * 16 * Q)), tube, 5, false);
}
/** A folded (globular) domain: a lumpy, rounded body. */
export function lumpGeo(at, r, { stretch = [1, 1, 1], seed = 1, amp = 0.1, rot = [0, 0, 0] } = {}) {
  const geo = new THREE.SphereGeometry(r, Math.round(28 * Q), Math.round(20 * Q));
  const p = geo.attributes.position, v = V();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const x = v.x / r, y = v.y / r, z = v.z / r;
    const n = Math.sin(x * 3.1 + seed) * Math.sin(y * 2.7 + seed * 1.7) * Math.sin(z * 3.3 + seed * 2.3) + 0.45 * Math.sin(x * 6.3 + seed * 3) * Math.sin(z * 5.9 + seed) * Math.cos(y * 5.1 + seed * 0.5);
    v.multiplyScalar(1 + amp * n);
    p.setXYZ(i, v.x * stretch[0], v.y * stretch[1], v.z * stretch[2]);
  }
  geo.computeVertexNormals();
  geo.applyMatrix4(new THREE.Matrix4().compose(P(at), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), V(1, 1, 1)));
  return geo;
}
const ballGeo = (at, r) => { const g = new THREE.SphereGeometry(r, 12, 9); g.translate(...P(at).toArray()); return g; };
/** One mesh from many geometries (one draw call). */
export function meshOf(geos, material) {
  const list = geos.flat(Infinity);
  const m = new THREE.Mesh(mergeGeometries(list, false), material);
  list.forEach((g) => g.dispose());
  return m;
}
/** Small branched sugar chains (glycosylation) rising from `at`. */
function glycanGeo(at, dir, rnd) {
  const out = [];
  let p = P(at).clone();
  const d = dir.clone().normalize();
  for (let i = 0; i < 4; i++) {
    p = p.clone().addScaledVector(d, 0.11).add(V((rnd() - 0.5) * 0.06, 0, (rnd() - 0.5) * 0.06));
    out.push(ballGeo(p, 0.05));
    if (i === 2) { const side = p.clone().add(V(0.09, 0.05, 0.03)); out.push(ballGeo(side, 0.045), ballGeo(side.clone().add(V(0.08, 0.06, 0)), 0.045)); }
  }
  return out;
}

// ------------------------------------------------------------------ the lipid bilayer
/**
 * Two layers of phospholipids, each a round head with two fatty-acid tails (one straight, one bent at a double bond)
 * pointing into the middle. `holes` ({ x, z, r }) leave room for proteins. `front` cuts the sheet off at that z, the
 * textbook cutaway: proteins standing on the cut edge show their whole height. Returns { group, heads, tails }.
 */
export function bilayer({ w = 9, d = 5, front = Infinity, keep = null, holes = [], y = 0.5, head = '#e7a98f', tail = '#f1cf86', spacing = LITE ? 0.27 : 0.21, seed = 3 } = {}) {
  const rnd = rng(seed);
  const spots = [];
  const dz = spacing * 0.866;
  for (const side of [1, -1]) for (let r = 0, z = -d / 2; z <= d / 2 + 1e-6; r++, z += dz) {
    for (let x = -w / 2 + (r % 2) * spacing * 0.5; x <= w / 2 + 1e-6; x += spacing) {
      const jx = x + (rnd() - 0.5) * spacing * 0.3, jz = z + (rnd() - 0.5) * spacing * 0.3;
      if (jz > front || (keep && !keep(jx, jz)) || holes.some((h) => (jx - h.x) ** 2 + (jz - (h.z || 0)) ** 2 < h.r * h.r)) continue;
      spots.push({ x: jx, z: jz, side, k: rnd(), turn: rnd() * Math.PI * 2, tint: rnd() });
    }
  }
  const n = spots.length, hr = spacing * 0.5;
  const heads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(hr, 1), mat(head, { rough: 0.5 }), n);
  const L = y - hr * 0.6 + 0.03, tr = spacing * 0.105; // the two leaflets' tails just meet: no dark slit when the cut edge is seen from the side
  const tailGeo = mergeGeometries([
    loopGeo([V(-0.035, -hr * 0.6, 0), V(-0.042, -L * 0.4, 0.012), V(-0.03, -L * 0.72, -0.01), V(-0.036, -L, 0)], tr),
    loopGeo([V(0.035, -hr * 0.6, 0), V(0.04, -L * 0.42, 0), V(0.085, -L * 0.62, 0.02), V(0.07, -L, 0.01)], tr),
  ], false);
  const tails = new THREE.InstancedMesh(tailGeo, mat(tail, { rough: 0.7 }), n);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  spots.forEach((s, i) => {
    q.setFromEuler(e.set(s.side > 0 ? 0 : Math.PI, s.turn, 0));
    m4.compose(V(s.x, s.side * y, s.z), q, V(1, 0.9 + s.k * 0.2, 1));
    tails.setMatrixAt(i, m4);
    const hs = 0.9 + s.k * 0.18;
    m4.compose(V(s.x, s.side * (y + (s.k - 0.5) * 0.03), s.z), q, V(hs, hs, hs));
    heads.setMatrixAt(i, m4);
    // a few lipids of other kinds, and a little shading, so the sheet does not look machine-made
    if (s.tint > 0.94) c.setRGB(0.78, 0.86, 1.08); else if (s.tint > 0.88) c.setRGB(1.06, 0.92, 0.8); else c.setScalar(0.86 + s.k * 0.2);
    heads.setColorAt(i, c);
  });
  tails.raycast = () => {}; // the heads take the pointer; thousands of thin tails would make hovering slow
  const group = new THREE.Group();
  group.add(heads, tails);
  return { group, heads, tails };
}

// ------------------------------------------------------------------ voltage-gated and leak channels
/**
 * An ion channel: four domains round a central pore. Each domain has the pore helices (S5 and S6) with a short
 * pore helix and the selectivity-filter loop dipping in between, and, in voltage-gated channels, a voltage sensor of
 * four more helices (S1–S4) whose S4 carries + charges (yellow beads) and slides up when the membrane depolarizes.
 * kind: 'nav' (one long chain: the domains are joined by loops inside), 'kv' (four separate subunits, with the T1
 * domain hanging below), 'leak' (two-pore K⁺ channel: pore helices only, with a cap over the pore).
 * Returns { g, parts: [{ c, a, s4, s6 }], set(open), now(open), tint(color | null) }; it animates itself.
 */
export function ionChannel(stage, { kind = 'kv', color = '#5b8def', alt, sensor, H = 0.85, filter = '#fff7d6' } = {}) {
  const mBody = mat(color), mAlt = mat(alt || tone(color, -0.2)), mS4 = mat(sensor || tone(color, 0.35)), mPlus = mat('#fde047', { emissive: '#a16207' }), mRing = mat(filter, { emissive: '#3f2f00' });
  const voltage = kind !== 'leak';
  const g = new THREE.Group();
  const parts = [];
  const S6TOP = V(0.36, H, 0.17), S1B = V(0.98, -H, 0.3);
  const shut = -0.12, wide = 0.03; // S6 tilt: its bottom crosses the pore (closed) or swings out (open)
  for (let k = 0; k < 4; k++) {
    const a = (k + 0.5) * Math.PI / 2; // on the diagonals, so the pore shows between the two front domains
    const c = new THREE.Group(); c.rotation.y = -a; g.add(c);
    const m = k % 2 ? mAlt : mBody;
    const st = [];
    const S5t = V(0.47, H, -0.2), S5b = V(0.43, -H, -0.25);
    st.push(helixGeo(S5b, S5t));
    st.push(helixGeo(V(0.44, H * 0.86, -0.12), V(0.24, H * 0.42, -0.02), { r: 0.06, tube: 0.032, pitch: 0.12 })); // pore helix
    st.push(loopGeo([S5t, V(0.5, H * 1.1, -0.15), V(0.44, H * 0.86, -0.12)]));
    st.push(loopGeo([V(0.24, H * 0.42, -0.02), V(0.17, H * 0.6, 0.05), V(0.22, H * 0.92, 0.12), V(0.34, H * 1.13, 0.16), S6TOP])); // filter loop
    const s6 = new THREE.Group(); s6.position.copy(S6TOP); c.add(s6);
    s6.add(meshOf(helixGeo(V(0, 0, 0), V(0, -2 * H, 0)), m));
    let s4 = null;
    if (voltage) {
      const S1 = [S1B, V(1.0, H, 0.22)], S2 = [V(1.2, H, -0.08), V(1.16, -H, -0.02)], S3 = [V(0.95, -H, -0.38), V(0.9, H, -0.42)];
      st.push(helixGeo(...S1), helixGeo(...S2), helixGeo(...S3));
      st.push(loopGeo([S1[1], V(1.14, H + 0.22, 0.1), S2[0]]));        // S1–S2, outside
      st.push(loopGeo([S2[1], V(1.1, -H - 0.2, -0.22), S3[0]]));       // S2–S3, inside
      st.push(loopGeo([V(0.72, -H, 0.02), V(0.6, -H - 0.18, -0.14), S5b])); // S4–S5 linker, inside (pulls the gate)
      s4 = new THREE.Group(); c.add(s4);
      s4.add(meshOf([helixGeo(V(0.72, -H, 0.02), V(0.7, H, 0.04)), loopGeo([S3[1], V(0.84, H + 0.26, -0.2), V(0.7, H, 0.04)])], mS4));
      const beads = [];
      for (let i = 0; i < 4; i++) { const t = i * 1.9 + k; beads.push(ballGeo(V(0.71 + Math.cos(t) * 0.12, -H * 0.55 + i * H * 0.36, 0.03 + Math.sin(t) * 0.12), 0.05)); }
      s4.add(meshOf(beads, mPlus));
      if (kind === 'kv') { // T1: each subunit's own folded domain under the membrane, holding the four together
        st.push(lumpGeo(V(0.36, -H - 0.6, 0.08), 0.2, { stretch: [1.25, 0.8, 1.1], seed: k + 2 }));
        st.push(loopGeo([S1B, V(0.82, -H - 0.3, 0.3), V(0.55, -H - 0.55, 0.14)]));
        st.push(loopGeo([V(0.3, -H - 0.75, 0.1), V(0.42, -H - 0.98, 0.25), V(0.25, -H - 1.12, 0.32)], 0.026)); // N-terminal ball
      }
    } else if (k % 2 === 0) { // K2P cap: a helix from each half rises over the pore and they meet in an arch
      st.push(helixGeo(V(0.5, H + 0.08, -0.05), V(0.1, H + 0.72, 0.0), { r: 0.07, tube: 0.036, pitch: 0.13 }));
      st.push(loopGeo([S5t, V(0.54, H + 0.04, -0.12), V(0.5, H + 0.08, -0.05)]));
      st.push(loopGeo([V(0.1, H + 0.72, 0), V(0.04, H + 0.68, 0.12), V(0.3, H + 0.3, 0.2), V(0.36, H, 0.17)]));
    }
    c.add(meshOf(st, m));
    parts.push({ c, a, s4, s6 });
  }
  // the selectivity filter: the narrowest ring of the pore, which picks the ion
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 8, 28), mRing);
  ring.rotation.x = Math.PI / 2; ring.position.y = H * 0.56; g.add(ring);
  if (kind === 'nav') { // one chain: domain I → II → III (→ IV through the inactivation loop, drawn by the scene)
    const at = (k, p) => p.clone().applyAxisAngle(UP, -(k + 0.5) * Math.PI / 2);
    const st = [];
    for (const k of [0, 1]) {
      const from = at(k, V(0.36 + Math.sin(shut) * 2 * H, -H, 0.17)), to = at(k + 1, S1B);
      const mid = from.clone().lerp(to, 0.5).multiplyScalar(1.35); mid.y = -H - 0.7;
      st.push(loopGeo([from, from.clone().add(V(0, -0.35, 0)), mid, to.clone().add(V(0, -0.3, 0)), to], 0.03));
    }
    g.add(meshOf(st, mBody));
  }
  let open = 0, target = 0;
  const pose = () => parts.forEach((p) => {
    p.s6.rotation.z = THREE.MathUtils.lerp(shut, wide, open);
    if (p.s4) p.s4.position.y = open * 0.18;
    p.c.position.set(Math.cos(p.a) * open * 0.05, 0, Math.sin(p.a) * open * 0.05);
  });
  stage.onUpdate((dt) => { if (Math.abs(target - open) < 1e-3) return; open += (target - open) * Math.min(1, dt * 7); pose(); });
  pose();
  const mats = [mBody, mAlt, mS4], base = mats.map((x) => x.color.clone());
  return {
    g, parts,
    set(o) { target = o ? 1 : 0; },
    now(o) { target = open = o ? 1 : 0; pose(); },
    tint(col) { mats.forEach((x, i) => x.color.copy(col ? new THREE.Color(col) : base[i])); },
  };
}

// ------------------------------------------------------------------ ionotropic (pentameric) receptor
/**
 * A nicotinic-type receptor: five subunits round a pore. Each has a tall extracellular domain (a β-sandwich, drawn
 * as a rounded lump) with its N-terminal helix on top, four membrane helices (M2 lines the pore and tilts open), and
 * a helix that hangs inside the cell. Binding sites sit between subunits; one faces the viewer (+z, y ≈ 1.35).
 * Returns { g, subs, set(open) }; it animates itself.
 */
export function pentamer(stage, { colors = ['#3cb37a'], H = 0.85 } = {}) {
  const g = new THREE.Group();
  const subs = [];
  const off = Math.PI / 2 - Math.PI / 5;
  for (let k = 0; k < 5; k++) {
    const a = off + (k * 2 * Math.PI) / 5;
    const m = mat(colors[k % colors.length]);
    const c = new THREE.Group(); c.rotation.y = -a; g.add(c);
    const st = [];
    st.push(helixGeo(V(0.6, -H, -0.24), V(0.62, H, -0.2)));   // M1
    st.push(helixGeo(V(0.62, H, 0.24), V(0.65, -H, 0.2)));    // M3
    st.push(helixGeo(V(0.93, -H, 0.02), V(0.9, H, 0.0)));     // M4 (faces the lipids)
    st.push(lumpGeo(V(0.5, 1.6, 0), 0.31, { stretch: [1, 1.75, 1.15], seed: k + 1, amp: 0.14, rot: [0, 0, 0.12] }));
    st.push(helixGeo(V(0.78, 2.08, 0.12), V(0.45, 2.32, -0.08), { r: 0.065, tube: 0.034, pitch: 0.12 })); // N-terminal helix
    st.push(loopGeo([V(0.55, 1.05, -0.1), V(0.6, 0.98, -0.18), V(0.62, H, -0.2)]));               // into M1
    st.push(loopGeo([V(0.34, H, 0), V(0.47, H + 0.14, 0.14), V(0.62, H, 0.24)]));                // M2–M3
    st.push(loopGeo([V(0.42, 1.04, 0.12), V(0.4, H + 0.12, 0.08), V(0.47, H + 0.14, 0.14)]));    // Cys loop
    st.push(loopGeo([V(0.6, -H, -0.24), V(0.45, -H - 0.15, -0.12), V(0.3, -H, 0)]));             // M1–M2, inside
    st.push(loopGeo([V(0.65, -H, 0.2), V(0.74, -H - 0.2, 0.18), V(0.7, -H - 0.35, 0.1)]));
    st.push(helixGeo(V(0.7, -H - 0.35, 0.1), V(0.4, -1.78, 0.02), { r: 0.07, tube: 0.036, pitch: 0.13 })); // MA helix, inside
    st.push(loopGeo([V(0.4, -1.78, 0.02), V(0.8, -1.62, -0.05), V(0.93, -H, 0.02)]));
    c.add(meshOf(st, m));
    const m2 = new THREE.Group(); m2.position.set(0.3, -H, 0); c.add(m2);
    m2.add(meshOf(helixGeo(V(0, 0, 0), V(0.04, 2 * H, 0)), m));
    subs.push({ c, a, m2 });
  }
  let open = 0, target = 0;
  const pose = () => subs.forEach((s) => { s.m2.rotation.z = THREE.MathUtils.lerp(0.05, -0.08, open); s.c.position.set(Math.cos(s.a) * open * 0.06, 0, Math.sin(s.a) * open * 0.06); });
  stage.onUpdate((dt) => { if (Math.abs(target - open) < 1e-3) return; open += (target - open) * Math.min(1, dt * 8); pose(); });
  pose();
  return { g, subs, set(o) { target = o ? 1 : 0; } };
}

// ------------------------------------------------------------------ GPCR, G-protein, adenylyl cyclase
/**
 * A G-protein-coupled receptor: seven helices in a ring (TM1…TM7), joined by three loops outside and three inside,
 * the N-terminus outside, helix 8 and the C-terminal tail inside. The transmitter pocket is in the middle, at the top.
 * When activated, TM6 swings its inner end outward (opening a groove for the G-protein). Returns { g, set(active) }.
 */
export function gpcr(stage, { color = '#8b5cf6', H = 0.8 } = {}) {
  const m = mat(color), ml = mat(tone(color, 0.3));
  const g = new THREE.Group();
  const ends = [], radial = [];
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * 0.62 - (i * 2 * Math.PI) / 7;
    const tilt = (i % 2 ? 1 : -1) * 0.12;
    const x = Math.cos(a) * 0.62, z = Math.sin(a) * 0.5;
    const top = V(x * (1 + tilt), H, z * (1 + tilt)), bot = V(x * (1 - tilt), -H, z * (1 - tilt));
    ends.push(i % 2 === 0 ? [top, bot] : [bot, top]); // TM1 runs outside → in, TM2 in → out, …
    radial.push(V(Math.cos(a), 0, Math.sin(a)));
  }
  const st = [], lp = [];
  ends.forEach(([s, e], i) => { if (i !== 5) st.push(helixGeo(s, e)); });
  for (let i = 0; i < 6; i++) {
    if (i === 4) continue; // ICL3 (TM5 → TM6) is rebuilt as TM6 moves
    const p = ends[i][1], q = ends[i + 1][0];
    const mid = p.clone().lerp(q, 0.5);
    if (p.y > 0) { mid.y += i === 3 ? 0.42 : 0.26; if (i === 3) mid.multiplyScalar(0.55).setY(H + 0.42); } // ECL2 is a lid over the pocket
    else { mid.y -= 0.26; mid.multiplyScalar(1.15).setY(-H - 0.26); }
    lp.push(loopGeo([p, mid, q]));
  }
  const n0 = ends[0][0], r0 = radial[0];
  lp.push(loopGeo([n0, n0.clone().addScaledVector(r0, 0.15).add(V(0, 0.32, 0)), n0.clone().addScaledVector(r0, 0.42).add(V(0.05, 0.6, 0.1)), n0.clone().addScaledVector(r0, 0.3).add(V(0.1, 0.92, 0))])); // N-terminus
  const c7 = ends[6][1], r7 = radial[6];
  const h8a = c7.clone().add(V(0, -0.1, 0)), h8b = h8a.clone().addScaledVector(r7, 0.62).add(V(0.12, 0, 0.1));
  st.push(helixGeo(h8a, h8b, { r: 0.07, tube: 0.036, pitch: 0.13 })); // helix 8, lying along the inner surface
  lp.push(loopGeo([c7, h8a]), loopGeo([h8b, h8b.clone().add(V(0.15, -0.3, 0.05)), h8b.clone().add(V(-0.05, -0.6, 0.12)), h8b.clone().add(V(0.1, -0.85, 0.05))], 0.028)); // C-tail
  g.add(meshOf(st, m), meshOf(lp, ml));
  // TM6 on a pivot at its outer end
  const [b6, t6] = ends[5];
  const tm6 = new THREE.Group(); tm6.position.copy(t6); g.add(tm6);
  tm6.add(meshOf(helixGeo(b6.clone().sub(t6), V(0, 0, 0)), m));
  const axis = radial[5].clone().cross(UP).normalize();
  // ICL3 (TM5 → TM6): a long loop that follows TM6; its vertices are recomputed in place (same mesh, same count)
  const icl3Geo = (bot) => {
    const p = ends[4][1], mid = p.clone().lerp(bot, 0.5).multiplyScalar(1.2).setY(-H - 0.55);
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p, p.clone().add(V(0, -0.3, 0)), mid, bot.clone().add(V(0, -0.25, 0)), bot]), 40, 0.032, 5, false);
  };
  const icl3 = new THREE.Mesh(icl3Geo(b6), ml); g.add(icl3);
  let act = 0, target = 0;
  const pose = () => {
    tm6.quaternion.setFromAxisAngle(axis, -0.26 * act);
    const bot = b6.clone().sub(t6).applyQuaternion(tm6.quaternion).add(t6);
    const ng = icl3Geo(bot);
    for (const k of ['position', 'normal']) { icl3.geometry.attributes[k].array.set(ng.attributes[k].array); icl3.geometry.attributes[k].needsUpdate = true; }
    icl3.geometry.computeBoundingSphere();
    ng.dispose();
  };
  stage.onUpdate((dt) => { if (Math.abs(target - act) < 1e-3) return; act += (target - act) * Math.min(1, dt * 4); pose(); });
  return { g, set(on) { target = on ? 1 : 0; } };
}

/**
 * The G-protein: α (a Ras-like domain plus a helical domain, with GDP or GTP in the cleft and a lipid anchor in the
 * membrane), and β (a seven-bladed propeller) with γ (a helix with its own lipid anchor). α travels; βγ stays.
 * Returns { alpha, bg, setGTP(on) }.
 */
export function gProtein({ a = '#f472b6', b = '#f9a8d4', gc = '#fbcfe8' } = {}) {
  const alpha = new THREE.Group();
  alpha.add(meshOf([
    lumpGeo(V(0, 0, 0), 0.3, { stretch: [1.15, 0.9, 1], seed: 4, amp: 0.12 }),
    lumpGeo(V(0.24, 0.24, -0.2), 0.22, { stretch: [1, 1.1, 0.9], seed: 6 }),
    helixGeo(V(-0.12, 0.2, 0.12), V(-0.5, 0.5, 0.18), { r: 0.06, tube: 0.032, pitch: 0.12 }),
    loopGeo([V(-0.5, 0.5, 0.18), V(-0.55, 0.62, 0.2), V(-0.56, 0.74, 0.2)], 0.022),
  ], mat(a)));
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), mat('#94a3b8', { emissive: '#000000' }));
  nuc.position.set(0.1, 0.18, 0.22); alpha.add(nuc);
  const bg = new THREE.Group();
  const blades = [];
  for (let i = 0; i < 7; i++) { const t = (i / 7) * Math.PI * 2; blades.push(lumpGeo(V(Math.cos(t) * 0.22, Math.sin(t) * 0.22, 0), 0.115, { stretch: [1.25, 0.7, 1.4], seed: i + 3, amp: 0.08, rot: [0, 0, t] })); }
  blades.push(helixGeo(V(0.05, 0.28, 0.05), V(-0.25, 0.58, 0.08), { r: 0.055, tube: 0.03, pitch: 0.11 }));
  const prop = meshOf(blades, mat(b)); prop.rotation.x = -0.35; bg.add(prop);
  bg.add(meshOf([helixGeo(V(0.16, 0.3, 0.14), V(-0.14, 0.6, 0.16), { r: 0.05, tube: 0.028, pitch: 0.11 }), loopGeo([V(-0.14, 0.6, 0.16), V(-0.22, 0.7, 0.14), V(-0.24, 0.8, 0.12)], 0.022)], mat(gc)));
  return { alpha, bg, setGTP(on) { nuc.material.color.set(on ? '#a3e635' : '#94a3b8'); nuc.material.emissive.set(on ? '#3f6212' : '#000000'); } };
}

/** Adenylyl cyclase: two bundles of six helices in the membrane and two catalytic domains (C1, C2) inside. */
export function adenylylCyclase({ color = '#f59e0b', H = 0.8 } = {}) {
  const st = [], cat = [];
  for (const cx of [-0.42, 0.42]) {
    const ends = [];
    for (let i = 0; i < 6; i++) {
      const t = (i / 6) * Math.PI * 2 + 0.3, x = cx + Math.cos(t) * 0.3, z = Math.sin(t) * 0.3;
      const top = V(x, H, z), bot = V(x, -H, z);
      const pair = i % 2 ? [bot, top] : [top, bot];
      st.push(helixGeo(pair[0], pair[1], { r: 0.07, tube: 0.036, pitch: 0.13 }));
      ends.push(pair);
    }
    for (let i = 0; i < 5; i++) { const p = ends[i][1], q = ends[i + 1][0], mid = p.clone().lerp(q, 0.5); mid.y += p.y > 0 ? 0.18 : -0.18; st.push(loopGeo([p, mid, q], 0.028)); }
    st.push(helixGeo(V(cx, -H, 0), V(cx * 0.62, -1.02, 0.08), { r: 0.07, tube: 0.036, pitch: 0.13 })); // signalling helix
    cat.push(lumpGeo(V(cx * 0.7, -1.32, 0.1), 0.3, { stretch: [1.1, 0.85, 1.05], seed: cx > 0 ? 7 : 9, amp: 0.12 }));
  }
  const g = new THREE.Group();
  g.add(meshOf(st, mat(color)), meshOf(cat, mat(tone(color, -0.15))));
  return g;
}

// ------------------------------------------------------------------ Na⁺/K⁺ pump
/**
 * The Na⁺/K⁺-ATPase. α: ten membrane helices and three domains inside the cell: N (binds ATP), P (gets the
 * phosphate) and A (the actuator that turns to reset it). β: one helix and a large sugar-coated domain outside.
 * γ (FXYD): one small helix. pose(phase 0…1) moves the domains through one cycle: N closes on P (ATP → phosphate),
 * A turns (E1 → E2), the helices open to the outside, then back.
 */
export function naKPump(stage, { a = '#f2c14e', H = 0.8 } = {}) {
  const g = new THREE.Group();
  const mTM = mat(a), mN = mat('#f59e0b'), mP = mat('#eab308'), mA = mat('#d97706'), mB = mat('#e0b13c'), mG = mat('#fde68a'), mSug = mat('#86efac');
  const TM = [[-0.62, 0.12], [-0.48, -0.28], [-0.2, -0.42], [-0.18, 0.1], [0.12, -0.12], [0.2, 0.3], [0.5, -0.36], [0.5, 0.08], [0.78, 0.34], [0.84, -0.1]];
  const end = TM.map(([x, z], i) => { const top = V(x + (i % 3 - 1) * 0.04, H, z), bot = V(x - (i % 3 - 1) * 0.04, -H, z); return i % 2 ? [top, bot] : [bot, top]; });
  const loopTop = (i) => { const p = end[i][1], q = end[i + 1][0]; return loopGeo([p, p.clone().lerp(q, 0.5).add(V(0, 0.2, 0)), q], 0.03); };
  const loopBot = (i) => { const p = end[i][1], q = end[i + 1][0]; return loopGeo([p, p.clone().lerp(q, 0.5).add(V(0, -0.2, 0)), q], 0.03); };
  // M1–M4 move as one block (they open the ion path to one side or the other)
  const tmL = new THREE.Group(); tmL.position.set(-0.4, 0, 0); g.add(tmL);
  const shiftL = (geo) => { geo.translate(0.4, 0, 0); return geo; };
  tmL.add(meshOf([...[0, 1, 2, 3].map((i) => helixGeo(...end[i])), loopTop(0), loopTop(2)].flat().map(shiftL), mTM));
  g.add(meshOf([...[4, 5, 6, 7, 8, 9].map((i) => helixGeo(...end[i])), loopTop(4), loopBot(5), loopTop(6), loopBot(7), loopTop(8)], mTM));
  // P domain, hung from the M4 and M5 stalks
  g.add(meshOf([lumpGeo(V(0.05, -1.32, -0.05), 0.4, { stretch: [1.15, 0.85, 1.05], seed: 11, amp: 0.12 }),
    helixGeo(V(-0.18, -H, 0.1), V(-0.06, -1.02, 0.05), { r: 0.07, tube: 0.036, pitch: 0.13 }), helixGeo(V(0.12, -H, -0.12), V(0.12, -1.02, -0.05), { r: 0.07, tube: 0.036, pitch: 0.13 })], mP));
  // N domain on a hinge at the side of P
  const nDom = new THREE.Group(); nDom.position.set(0.4, -1.32, 0); g.add(nDom);
  nDom.add(meshOf([lumpGeo(V(0.42, -0.45, 0.05), 0.33, { stretch: [1, 1.05, 1.1], seed: 13, amp: 0.13 }), loopGeo([V(0.05, 0.02, 0), V(0.2, -0.15, 0.1), V(0.3, -0.25, 0.06)], 0.04)], mN));
  // A domain: turns about the vertical, linked to M1, M2 and M3
  const aDom = new THREE.Group(); aDom.position.set(-0.45, -1.02, 0.05); g.add(aDom);
  aDom.add(meshOf([lumpGeo(V(-0.35, -0.35, 0.05), 0.33, { stretch: [1.1, 0.95, 1.05], seed: 17, amp: 0.13 }),
    loopGeo([V(-0.07, 0.22, -0.33), V(-0.15, 0.0, -0.2), V(-0.25, -0.15, -0.1)], 0.035), loopGeo([V(0.25, 0.22, -0.47), V(0.1, -0.05, -0.3), V(-0.1, -0.25, -0.12)], 0.035),
    loopGeo([V(-0.17, 0.22, 0.07), V(-0.3, 0.05, 0.12), V(-0.4, -0.1, 0.12)], 0.035)], mA));
  // β subunit outside, with its sugar chains
  const rnd = rng(5);
  g.add(meshOf([helixGeo(V(1.12, -H, -0.42), V(1.06, H, -0.46)), lumpGeo(V(0.86, 1.32, -0.42), 0.38, { stretch: [1.3, 0.85, 1.1], seed: 21, amp: 0.13 }), loopGeo([V(1.06, H, -0.46), V(1.1, 1.0, -0.45), V(1.05, 1.1, -0.42)])], mB));
  g.add(meshOf([glycanGeo(V(0.62, 1.58, -0.25), V(-0.3, 1, 0.3), rnd), glycanGeo(V(1.2, 1.55, -0.3), V(0.4, 1, 0.2), rnd), glycanGeo(V(0.95, 1.5, -0.1), V(0.1, 1, 0.6), rnd)], mSug));
  // γ (FXYD)
  g.add(meshOf(helixGeo(V(-0.95, -H, -0.32), V(-0.92, H, -0.38), { r: 0.07, tube: 0.036, pitch: 0.13 }), mG));
  const pose = (ph) => {
    nDom.rotation.z = 0.5 * bump(ph, 0.1, 0.45);   // N closes on P: ATP hands its phosphate over
    aDom.rotation.y = 0.65 * bump(ph, 0.38, 0.9);   // A turns: E1P → E2P, and back when the phosphate is removed
    tmL.rotation.z = 0.07 * Math.cos(ph * Math.PI * 2); // open to the inside (E1), then to the outside (E2)
  };
  pose(0);
  return { g, pose, tmL, nDom, aDom };
}

/** ATP drawn as textbooks do: adenine (two rings), ribose (one ring) and a chain of three phosphates. */
export function atpModel() {
  const g = new THREE.Group();
  const ring = (n, r, at) => { const c = new THREE.CylinderGeometry(r, r, 0.05, n); c.rotateX(Math.PI / 2); c.translate(...at); return c; };
  g.add(meshOf([ring(6, 0.1, [-0.32, 0.06, 0]), ring(5, 0.085, [-0.17, 0.08, 0])], mat('#60a5fa')));
  g.add(meshOf([ring(5, 0.09, [-0.02, -0.04, 0])], mat('#fde047')));
  g.add(meshOf([0, 1, 2].map((i) => ballGeo([0.13 + i * 0.13, -0.02 + (i % 2) * 0.03, 0], 0.06)), mat('#fb923c')));
  return g;
}

// ------------------------------------------------------------------ glutamate receptors (NMDA, AMPA)
/**
 * An ionotropic glutamate receptor: four subunits, each with three membrane helices (M1, M3, M4) and the M2 loop that
 * dips in from inside (where Mg²⁺ sticks), a clam-shell ligand-binding domain that closes on its transmitter, and a
 * second clam shell (the amino-terminal domain) on top. NMDA: GluN2 subunits (glutamate) at ±x, GluN1 (glycine,
 * already bound) at ±z. Glutamate sites: (±0.9, 1.28, 0) × scale. pose(bound 0…1, open 0…1).
 */
export function iGluR({ c1 = '#2f9e6a', c2 = '#5ccf94', glycine = true, H = 0.85 } = {}) {
  const g = new THREE.Group();
  const subs = [], mats = [];
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, n2 = k % 2 === 0;
    const m = mat(n2 ? c2 : c1); mats.push(m);
    const c = new THREE.Group(); c.rotation.y = -a; g.add(c);
    const st = [];
    st.push(helixGeo(V(0.55, -H, -0.22), V(0.58, H, -0.2)));                       // M1
    st.push(helixGeo(V(0.8, H, 0.16), V(0.78, -H, 0.12)));                         // M4
    st.push(helixGeo(V(0.44, -H + 0.05, 0.1), V(0.2, -0.05, 0.02), { r: 0.06, tube: 0.032, pitch: 0.12 })); // M2 (pore loop)
    st.push(loopGeo([V(0.55, -H, -0.22), V(0.48, -H - 0.15, -0.05), V(0.44, -H + 0.05, 0.1)]));
    st.push(loopGeo([V(0.2, -0.05, 0.02), V(0.26, -0.4, 0.12), V(0.36, -H, 0.16)]));
    st.push(lumpGeo(V(0.66, 1.0, 0.04), 0.26, { stretch: [1.25, 0.85, 1.1], seed: k * 3 + 2, amp: 0.12 })); // LBD lower lobe
    st.push(loopGeo([V(0.55, 0.82, -0.1), V(0.6, 0.95, -0.18), V(0.58, H, -0.2)]));
    st.push(loopGeo([V(0.45, 0.86, 0.06), V(0.3, H + 0.12, 0.1), V(0.24, H, 0.1)]));
    st.push(loopGeo([V(0.76, 0.84, 0.12), V(0.82, 0.95, 0.16), V(0.8, H, 0.16)]));
    st.push(lumpGeo(V(0.5, 2.55, 0.02), 0.24, { stretch: [1.2, 0.85, 1.1], seed: k * 3 + 5, amp: 0.12 })); // ATD upper lobe
    st.push(lumpGeo(V(0.58, 2.12, 0.06), 0.23, { stretch: [1.2, 0.85, 1.1], seed: k * 3 + 7, amp: 0.12 })); // ATD lower lobe
    st.push(loopGeo([V(0.55, 1.92, 0.06), V(0.6, 1.84, 0.02), V(0.62, 1.76, 0)]));
    st.push(loopGeo([V(0.78, -H, 0.12), V(0.92, -1.15, 0.2), V(0.75, -1.45, 0.05), V(0.95, -1.78, 0.1)], 0.028)); // C-terminal tail
    c.add(meshOf(st, m));
    const m3 = new THREE.Group(); m3.position.set(0.36, -H, 0.16); c.add(m3); // M3: lines the upper pore, the gate
    m3.add(meshOf(helixGeo(V(0, 0, 0), V(-0.12, 2 * H, -0.06)), m));
    const d1 = new THREE.Group(); d1.position.set(0.42, 1.28, 0); c.add(d1); // LBD upper lobe, hinged
    d1.add(meshOf([lumpGeo(V(0.24, 0.28, 0), 0.27, { stretch: [1.25, 0.85, 1.1], seed: k * 3 + 1, amp: 0.12 })], m));
    if (glycine && !n2) { const gly = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 9), mat('#f8fafc')); gly.position.set(0.86, 1.3, 0); c.add(gly); }
    subs.push({ c, a, m3, d1, n2: glycine ? n2 : true });
  }
  const pose = (bound, open) => subs.forEach((s) => { s.d1.rotation.z = s.n2 ? 0.4 * (1 - bound) : 0; s.m3.rotation.z = -0.12 * open; });
  pose(0, 0);
  return { g, subs, mats, pose };
}

// ------------------------------------------------------------------ neurotransmitter transporter (DAT, SERT, NET)
/**
 * A sodium-coupled neurotransmitter transporter (LeuT fold), drawn the textbook way: twelve membrane helices. A
 * "scaffold" of helices (left, darker) stays put; a "bundle" of four (TM1, TM2, TM6, TM7; right, lighter) rocks
 * against it, so the central binding site opens to the outside, closes (occluded), then opens to the inside:
 * alternating access. TM1 and TM6 are unwound in the middle, where dopamine and its two Na⁺ bind. On top, the
 * EL4 lid (a helix hairpin) closes over the outer vestibule; EL2 carries sugar chains. The binding site is at (0, 0, 0);
 * the outer mouth at (0, H + 0.3, 0); the inner mouth at (0, −H − 0.3, 0).
 * pose(s): 0 = open to the outside, 0.5 = occluded, 1 = open to the inside. Returns { g, bundle, lid, pose, mats }.
 */
export function transporter({ color = '#14b8a6', H = 0.85 } = {}) {
  const g = new THREE.Group();
  const mS = mat(tone(color, -0.18)), mB = mat(tone(color, 0.22)), mLid = mat(tone(color, 0.05)), mSug = mat('#86efac');
  const rnd = rng(17);
  const st = [];
  // scaffold: TM3, TM4, TM5, TM8, TM9, TM10, TM11, TM12 (left half and behind), with the loops between them
  const SC = [[-0.3, -0.05, 0.2], [-0.62, 0.32, 0.1], [-0.92, 0.0, -0.1], [-0.36, -0.42, -0.1], [-0.72, -0.48, 0.12], [-1.05, -0.38, 0.05], [0.12, -0.72, -0.08], [0.55, -0.62, 0.1]];
  const ends = [];
  SC.forEach(([x, z, tilt], i) => {
    const up = i % 2 === 0;
    const a = V(x - tilt * 0.5, up ? -H : H, z), b = V(x + tilt * 0.5, up ? H : -H, z + (rnd() - 0.5) * 0.08);
    st.push(helixGeo(a, b));
    ends.push([a, b]);
  });
  for (let i = 0; i + 1 < ends.length; i++) { // short loops, alternately outside and inside
    const p = ends[i][1], q = ends[i + 1][0], mid = p.clone().lerp(q, 0.5); mid.y += Math.sign(p.y) * 0.22;
    st.push(loopGeo([p, mid, q]));
  }
  // EL2: a long loop outside with sugar chains (DAT is glycosylated here)
  st.push(loopGeo([V(-0.62, H, 0.32), V(-0.85, H + 0.3, 0.55), V(-0.45, H + 0.42, 0.6), V(-0.2, H + 0.25, 0.35)]));
  const sugars = [];
  for (const [x, z] of [[-0.85, 0.55], [-0.45, 0.62]]) sugars.push(glycanGeo(V(x, H + 0.32, z), V(0.1, 1, 0.2), rnd));
  g.add(meshOf(sugars, mSug));
  // the C-terminal tail hangs inside
  st.push(loopGeo([V(0.55, -H, -0.62), V(0.72, -H - 0.3, -0.4), V(0.5, -H - 0.55, -0.1), V(0.7, -H - 0.75, 0.15)], 0.028));
  g.add(meshOf(st, mS));
  // the bundle: TM1 and TM6 broken in the middle (the unwound stretch holds the substrate), TM2 and TM7 whole
  const bundle = new THREE.Group(); bundle.position.set(0.5, 0, 0); g.add(bundle);
  const bs = [];
  for (const [x, z] of [[-0.22, 0.22], [-0.2, -0.24]]) { // TM1 (front), TM6 (back), in the bundle's own frame
    bs.push(helixGeo(V(x + 0.04, -H, z), V(x - 0.03, -0.14, z)));
    bs.push(helixGeo(V(x - 0.02, 0.14, z), V(x + 0.06, H, z)));
    bs.push(loopGeo([V(x - 0.03, -0.14, z), V(x - 0.16, -0.05, z * 0.6), V(x - 0.15, 0.06, z * 0.6), V(x - 0.02, 0.14, z)], 0.03));
  }
  bs.push(helixGeo(V(0.22, H, 0.32), V(0.26, -H, 0.26)));  // TM2
  bs.push(helixGeo(V(0.24, -H, -0.22), V(0.2, H, -0.3)));  // TM7
  bs.push(loopGeo([V(-0.16, H, 0.22), V(0.02, H + 0.2, 0.3), V(0.22, H, 0.32)]));
  bs.push(loopGeo([V(0.26, -H, 0.26), V(0.12, -H - 0.22, 0.05), V(0.04, -H, -0.24)]));
  bs.push(loopGeo([V(-0.14, H, -0.24), V(0.05, H + 0.18, -0.3), V(0.2, H, -0.3)]));
  // the N-terminus: the inner gate, a short helix lying under the bundle
  bs.push(helixGeo(V(-0.45, -H - 0.18, 0.18), V(0.1, -H - 0.12, 0.35), { r: 0.065, tube: 0.034, pitch: 0.12 }));
  bs.push(loopGeo([V(-0.18, -H, 0.22), V(-0.4, -H - 0.1, 0.2), V(-0.45, -H - 0.18, 0.18)]));
  bundle.add(meshOf(bs, mB));
  // EL4: the outer lid, a helix hairpin hinged on the scaffold's top
  const lid = new THREE.Group(); lid.position.set(-0.45, H + 0.08, 0.05); g.add(lid);
  lid.add(meshOf([
    helixGeo(V(0, 0.05, 0.1), V(0.55, 0.22, 0.15), { r: 0.065, tube: 0.034, pitch: 0.12 }),
    helixGeo(V(0.55, 0.3, -0.08), V(0.02, 0.15, -0.12), { r: 0.065, tube: 0.034, pitch: 0.12 }),
    loopGeo([V(0.55, 0.22, 0.15), V(0.68, 0.28, 0.04), V(0.55, 0.3, -0.08)]),
  ], mLid));
  const pose = (s) => {
    const k = Math.max(0, Math.min(1, s));
    bundle.rotation.z = THREE.MathUtils.lerp(-0.22, 0.22, k); // top swings out (open outside) … bottom swings out (open inside)
    lid.rotation.z = THREE.MathUtils.lerp(0.55, 0, Math.min(1, k * 2)); // the lid lifts while open to the outside
  };
  pose(0);
  return { g, bundle, lid, pose, mats: [mS, mB, mLid, mSug] };
}

/** Dopamine as textbooks draw it: a benzene ring with two OH groups (a catechol) and a short chain ending in NH₂. */
export function dopamineGeo(s = 1) {
  const ring = new THREE.TorusGeometry(0.09 * s, 0.026 * s, 6, 6);
  const out = [ring];
  const oh = (a) => { const p = V(Math.cos(a) * 0.17 * s, Math.sin(a) * 0.17 * s, 0); return ballGeo(p, 0.035 * s); };
  out.push(oh(Math.PI * 0.5), oh(Math.PI * 0.83));
  const chain = loopGeo([V(0.09 * s, -0.05 * s, 0), V(0.18 * s, -0.12 * s, 0), V(0.26 * s, -0.08 * s, 0), V(0.34 * s, -0.15 * s, 0)], 0.02 * s);
  out.push(chain, ballGeo(V(0.36 * s, -0.16 * s, 0), 0.04 * s));
  return mergeGeometries(out.map((x) => x.index ? x.toNonIndexed() : x), false);
}
