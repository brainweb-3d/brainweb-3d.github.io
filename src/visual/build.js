// Small helpers to build 3D shapes for the zoom levels.
import * as THREE from 'three';

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function mat(color, { opacity = 1, emissive = null, rough = 0.55, side = THREE.FrontSide, metal = 0 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: rough, metalness: metal, clearcoat: 0.25, clearcoatRoughness: 0.5,
    transparent: opacity < 1, opacity, side,
    emissive: emissive ? new THREE.Color(emissive) : new THREE.Color(0x000000),
  });
}

export const sphere = (r, color, o) => new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), mat(color, o));
export const box = (w, h, d, color, o) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, o));
export const cyl = (rt, rb, h, color, o, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, o));
export const torus = (r, t, color, o) => new THREE.Mesh(new THREE.TorusGeometry(r, t, 16, 64), mat(color, o));
export const capsule = (r, len, color, o) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 24), mat(color, o));

export function tube(points, r, color, o, seg = 64) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => (p.isVector3 ? p : V(...p))));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, 12, false), mat(color, o));
  m.userData.curve = curve;
  return m;
}

/** A cylinder between two points (bonds, rods). */
export function rod(a, b, r, color, o) {
  const A = a.isVector3 ? a : V(...a), B = b.isVector3 ? b : V(...b);
  const m = cyl(r, r, A.distanceTo(B), color, o, 12);
  m.position.copy(A).lerp(B, 0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), B.clone().sub(A).normalize());
  return m;
}

export function group(...children) { const g = new THREE.Group(); children.forEach((c) => c && g.add(c)); return g; }

/** Deform a sphere with smooth noise (for organic shapes like cell bodies and organelles). */
export function blob(r, color, { seed = 1, amp = 0.15, freq = 2.2, stretch = [1, 1, 1], o } = {}) {
  const geo = new THREE.SphereGeometry(r, 64, 48);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = V(p.getX(i), p.getY(i), p.getZ(i));
    const n = Math.sin(v.x * freq * 3 + seed) * Math.sin(v.y * freq * 2.7 + seed * 2) * Math.sin(v.z * freq * 3.1 + seed * 3);
    v.multiplyScalar(1 + amp * n);
    p.setXYZ(i, v.x * stretch[0], v.y * stretch[1], v.z * stretch[2]);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat(color, o));
}

/** A glowing dot texture for particles. */
let dot;
export function dotTexture() {
  if (dot) return dot;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,.7)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return (dot = new THREE.CanvasTexture(c));
}

/**
 * Particles that move along a curve (signals, ions, vesicles…).
 * Returns { points, setSpeed, setActive }.
 */
export function flow(stage, curve, { color = '#ffffff', count = 16, size = 0.08, speed = 0.3, parent } = {}) {
  const pos = new Float32Array(count * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  (parent || stage.root).add(pts);
  const state = { speed, active: true, phase: Math.random() };
  stage.onUpdate((dt, t) => {
    pts.visible = state.active;
    if (!state.active) return;
    for (let k = 0; k < count; k++) {
      const v = curve.getPointAt((t * state.speed + state.phase + k / count) % 1);
      pos[k * 3] = v.x; pos[k * 3 + 1] = v.y; pos[k * 3 + 2] = v.z;
    }
    g.attributes.position.needsUpdate = true;
  });
  return { points: pts, setSpeed: (s) => { state.speed = s; }, setActive: (a) => { state.active = a; } };
}

/** A simple text label sprite (used sparingly, e.g. ion symbols). */
export function textSprite(text, { color = '#ffffff', bg = undefined, size = 0.4, font = 'bold 64px Rubik, sans-serif' } = {}) {
  // Dark text gets a light rounded "pill" so it reads on both the light and the dark theme
  if (bg === undefined) bg = /^#(0|1|2|3|4|5)/i.test(color) ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.75)';
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 24;
  c.width = w; c.height = 96;
  g.font = font;
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 4, w, 88, 30); g.fill(); }
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, w / 2, 50);
  const tex = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  s.scale.set(size * (w / 96), size, 1);
  s.renderOrder = 20;
  return s;
}

export const rand = (a, b) => a + Math.random() * (b - a);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);

/** A tiny scheduler tied to the stage clock (cleared automatically when the scene is cleared). */
export function timeline(stage) {
  const jobs = [];
  let now = 0;
  stage.onUpdate((dt) => {
    now += dt;
    for (let i = jobs.length - 1; i >= 0; i--) if (jobs[i].at <= now) { const j = jobs.splice(i, 1)[0]; j.fn(); }
  });
  return { later: (sec, fn) => jobs.push({ at: now + sec, fn }), clear: () => { jobs.length = 0; } };
}

/**
 * A live voltage trace for a readout (an oscilloscope line). push(v) every frame; svg() returns a small inline SVG
 * with dashed lines at rest and threshold. Samples are kept every `every` seconds.
 */
export function voltageTrace({ min = -90, max = 50, rest = -70, threshold = -65, n = 120, every = 0.04, color = '#2563eb' } = {}) {
  const pts = new Array(n).fill(rest);
  let acc = 0;
  const y = (v) => (34 - ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 32).toFixed(1);
  return {
    push(v, dt) { acc += dt; while (acc >= every) { acc -= every; pts.shift(); pts.push(v); } },
    svg() {
      const line = pts.map((v, i) => `${((i / (n - 1)) * 200).toFixed(1)},${y(v)}`).join(' ');
      return `<svg viewBox="0 0 200 36" width="100%" height="44" style="display:block;margin:4px 0" aria-hidden="true">`
        + `<line x1="0" x2="200" y1="${y(threshold)}" y2="${y(threshold)}" stroke="#ef4444" stroke-dasharray="3 3" stroke-width="0.6"/>`
        + `<line x1="0" x2="200" y1="${y(rest)}" y2="${y(rest)}" stroke="#94a3b8" stroke-dasharray="2 3" stroke-width="0.6"/>`
        + `<polyline points="${line}" fill="none" stroke="${color}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
    },
  };
}

// ---- soft-tissue helpers (sensory scenes, glia, spinal cord) ----
/** A tube whose radius follows profile(t) (t = 0…1 along the path): tapered fibres and spindle-shaped cells. */
export function taperTube(points, r, profile, color, o, seg = 40, radial = 14) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, seg, r, radial, false);
  const pos = geo.attributes.position, c = new THREE.Vector3(), p = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    curve.getPointAt(i / seg, c);
    const k = Math.max(0.04, profile(i / seg));
    for (let j = 0; j <= radial; j++) { const n = i * (radial + 1) + j; p.fromBufferAttribute(pos, n).sub(c).multiplyScalar(k).add(c); pos.setXYZ(n, p.x, p.y, p.z); }
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat(color, o));
  m.userData.curve = curve;
  return m;
}
export const spindle = (t) => Math.pow(Math.sin(Math.PI * t), 0.55); // fat in the middle, pointed at both ends
/**
 * A slab of tissue, drawn like a textbook cutaway: a solid back wall in the tissue's colour behind the cells, and only
 * a faint see-through volume in front (a fully see-through block reads as grey glass on the dark background).
 * `wave` ripples its top (or, negative, its bottom) edge.
 */
export function slab(w, h, d, color, opacity, { wave = 0, freq = 6 } = {}) {
  const make = (depth, op) => {
    const geo = new THREE.BoxGeometry(w, h, depth, 40, 1, 1);
    if (wave) {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (wave > 0 ? y > 0 : y < 0) p.setY(i, y + Math.abs(wave) * Math.sin(p.getX(i) * freq + 0.6)); }
      geo.computeVertexNormals();
    }
    const m = new THREE.Mesh(geo, mat(color, { opacity: op, rough: 0.85 }));
    m.material.emissive = new THREE.Color(color).multiplyScalar(0.22);
    if (op < 1) m.material.depthWrite = false;
    return m;
  };
  const g = new THREE.Group();
  const back = make(0.1, Math.min(1, opacity * 2.2)); back.position.z = -d / 2 + 0.05; g.add(back);
  g.add(make(d, opacity * 0.45));
  return g;
}
/** A few small atoms stuck together (an odour or sugar molecule floating near the receptors). */
export function molecule(at, color, rnd) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) { const s = sphere(0.045, i ? color : '#ffffff'); s.position.set((rnd() - 0.5) * 0.12, (rnd() - 0.5) * 0.12, (rnd() - 0.5) * 0.12); g.add(s); }
  g.position.copy(at);
  return g;
}

