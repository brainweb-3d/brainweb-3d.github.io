// RESEARCH METHODS (book chapter 1): for each method, a 3D scene showing how it is used, a live simulated
// output ("what it looks like") in the info panel, and what it can (and cannot) test.
import * as THREE from 'three';
import { V, mat, sphere, box, cyl, torus, capsule, blob, tube, rod, flow, timeline } from '../build.js';
import { seeded, makeNeuron } from '../neuron.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { meshOf } from '../proteins.js';
import { METHOD_IMAGES } from './images.js';

const B = (en, he) => ({ en, he });
const CH = [1];

// ---------------------------------------------------------------- 3D helpers
/** A sphere whose surface is pushed in and out by fn(unit direction) → radius factor (cortex folds, folia, a skull). */
function shapedSphere(r, fn, stretch = [1, 1, 1], w = 72, h = 48) {
  const g = new THREE.SphereGeometry(r, w, h), p = g.attributes.position, v = V();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const k = fn(v); p.setXYZ(i, v.x * r * k * stretch[0], v.y * r * k * stretch[1], v.z * r * k * stretch[2]); }
  g.computeVertexNormals();
  return g;
}
/** Gyri: ridges along wandering lines (the folds), and the deep cleft between the hemispheres along the top. */
const folds = (v) => {
  const a = Math.sin(v.x * 9.5 + Math.sin(v.y * 4.1) * 1.7) + Math.sin(v.y * 10.3 + Math.sin(v.z * 3.7) * 2.1) + Math.sin(v.z * 8.9 + Math.sin(v.x * 4.6) * 1.9);
  const ridge = 1 - Math.abs(Math.sin(a * 1.6)); // sharp grooves between rounded ridges
  const fissure = v.y > -0.1 ? Math.exp(-(v.x * v.x) / 0.004) * 0.18 * Math.min(1, (v.y + 0.1) * 3) : 0; // between the hemispheres
  const lateral = Math.exp(-((v.y + 0.12 - v.z * 0.25) ** 2) / 0.003) * (Math.abs(v.x) > 0.55 ? 0.08 : 0); // the lateral sulcus above the temporal lobe
  return 1 + 0.045 * ridge - fissure - lateral;
};
/** A see-through head (face toward +z, subject's LEFT = +x) with a pickable brain. */
function head(stage, { skinOpacity = 0.2, brainColor = '#f2b8c6', brainOpacity = 1 } = {}) {
  stage.definePart({ id: 'brain', name: B('Brain', 'מוח'), desc: B('The organ being studied.', 'האיבר הנחקר.'), color: brainColor, chapters: CH });
  const g = new THREE.Group();
  stage.root.add(g);
  // the skin: a cranium, a face (brow, cheeks, jaw and chin), a nose, ears and a tapering neck, as one see-through mesh
  const parts = [
    shapedSphere(1.25, (v) => 1 + 0.04 * Math.max(0, v.z) * Math.max(0, v.y), [0.9, 1.08, 1.06]),                                   // cranium
    shapedSphere(0.78, (v) => 1 - 0.18 * Math.max(0, -v.y) * Math.abs(v.x), [0.95, 1.05, 0.9], 32, 24).translate(0, -0.55, 0.52),   // face and jaw
    new THREE.ConeGeometry(0.15, 0.42, 4).rotateX(Math.PI / 2 + 0.25).translate(0, -0.25, 1.38),                                       // nose
    new THREE.CylinderGeometry(0.42, 0.55, 1.2, 24).translate(0, -1.65, -0.1),                                                         // neck
  ];
  for (const sx of [-1, 1]) parts.push(new THREE.TorusGeometry(0.17, 0.06, 8, 16, Math.PI * 1.3).rotateY(Math.PI / 2).rotateX(-0.6).translate(sx * 1.13, -0.15, -0.05)); // ears
  const skinGeo = mergeGeometries(parts.map((x) => { const y = x.index ? x.toNonIndexed() : x; y.deleteAttribute('uv'); return y; }), false);
  skinGeo.computeVertexNormals();
  const skin = new THREE.Mesh(skinGeo, mat('#e9c6ad', { opacity: skinOpacity, rough: 0.6 }));
  skin.material.depthWrite = false;
  g.add(skin);
  // the brain: a folded cerebrum with its hemispheres and temporal lobes, a cerebellum with fine folia, the brainstem
  const brain = new THREE.Group();
  const cerGeo = shapedSphere(0.95, (v) => folds(v) * (1 + 0.1 * Math.exp(-((v.y + 0.35) ** 2) / 0.04) * Math.min(1, Math.abs(v.x) * 1.6) * (v.z > -0.3 ? 1 : 0.4)), [0.86, 0.78, 1.1]);
  const cer = new THREE.Mesh(cerGeo, mat(brainColor, { opacity: brainOpacity, rough: 0.55 }));
  cer.position.set(0, 0.2, 0.02);
  const cb = new THREE.Mesh(shapedSphere(0.38, (v) => 1 + 0.05 * Math.abs(Math.sin(v.y * 22)) - (Math.exp(-(v.x * v.x) / 0.01) * 0.08), [1.4, 0.7, 1], 48, 40), mat('#e59bb0', { opacity: brainOpacity, rough: 0.55 }));
  cb.position.set(0, -0.45, -0.62);
  const stemG = new THREE.LatheGeometry([[0.0, -0.4], [0.11, -0.38], [0.13, -0.1], [0.17, 0.1], [0.2, 0.3], [0.16, 0.38], [0, 0.4]].map(([x, y]) => new THREE.Vector2(x, y)), 20);
  const stem = new THREE.Mesh(stemG, mat('#e59bb0', { opacity: brainOpacity, rough: 0.55 })); stem.position.set(0, -0.7, -0.3); stem.rotation.x = 0.25;
  brain.add(cer, cb, stem);
  stage.add(brain, 'brain', g);
  return { group: g, brain, cortex: cer };
}
/** A scanner's ring housing: a thick rounded doughnut (radius r, opening ri, depth d) on a stand. Axis = y. */
function gantry(r, ri, d, color, { opacity = 0.85 } = {}) {
  const g = new THREE.Group();
  const prof = [], n = 10, c = 0.18;
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; prof.push(new THREE.Vector2(cx + Math.cos(a) * c, cy + Math.sin(a) * c)); } };
  corner(ri + c, -d / 2 + c, Math.PI); corner(r - c, -d / 2 + c, -Math.PI / 2); corner(r - c, d / 2 - c, 0); corner(ri + c, d / 2 - c, Math.PI / 2);
  prof.push(prof[0].clone());
  const ring = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), mat(color, { opacity, rough: 0.35 }));
  if (opacity < 1) ring.material.depthWrite = false;
  g.add(ring);
  const stripe = new THREE.Mesh(new THREE.TorusGeometry((r + ri) / 2, 0.05, 8, 64), mat('#3b82f6', { rough: 0.4 })); stripe.rotation.x = Math.PI / 2; stripe.position.y = d / 2 + 0.01; g.add(stripe); // a coloured band on its face
  return g;
}
/** A glowing spot on/in the brain (activity, lesion, target…). */
function spot(stage, pos, color, r = 0.22, partId = null) {
  const s = sphere(r, color, { emissive: color, opacity: 0.85 });
  s.material.emissive.multiplyScalar(0.6);
  s.position.copy(pos);
  if (partId) stage.add(s, partId); else stage.root.add(s);
  return s;
}
const BROCA = V(0.62, 0.0, 0.55), MOTOR_L = V(0.5, 0.75, 0.1), OCCIPITAL = V(0, 0.2, -0.85), TEMPORAL_L = V(0.75, -0.1, 0.1), FUSIFORM = V(0.45, -0.35, -0.45), PREFRONTAL = V(0.15, 0.45, 0.75), HIPPO = V(0.42, -0.2, -0.05), STN = V(0.12, -0.25, 0.05), ACCUMBENS = V(0.12, -0.05, 0.4);

/** An MRI scanner around the head: a rounded housing (see-through, so the head stays visible) with the bore running
 *  through it along z, a coloured trim ring at the front, a patient table and a head coil. Returns the glowing bore. */
function mriScanner(stage, part, { glow = 0.25 } = {}) {
  const sh = new THREE.Shape();
  const W = 3.3, H = 3.1, R = 0.9;
  sh.moveTo(-W + R, -H); sh.lineTo(W - R, -H); sh.quadraticCurveTo(W, -H, W, -H + R); sh.lineTo(W, H - R); sh.quadraticCurveTo(W, H, W - R, H);
  sh.lineTo(-W + R, H); sh.quadraticCurveTo(-W, H, -W, H - R); sh.lineTo(-W, -H + R); sh.quadraticCurveTo(-W, -H, -W + R, -H);
  const hole = new THREE.Path(); hole.absarc(0, 0.2, 2.15, 0, Math.PI * 2, true); sh.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 3.4, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 3, curveSegments: 48 });
  geo.translate(0, 0, -1.9);
  const housing = new THREE.Mesh(geo, mat('#e5e9f0', { opacity: 0.42, rough: 0.35 }));
  housing.material.depthWrite = false; stage.add(housing, part);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.07, 12, 72), mat('#3b82f6', { rough: 0.3 }));
  trim.position.set(0, 0.2, 1.64); stage.add(trim, part);
  const b = bore(2.12, 3.6, '#93c5fd', glow); b.rotation.x = Math.PI / 2; b.position.set(0, 0.2, -0.2); stage.add(b, part);
  // the patient table, sliding out of the bore at the front, on its pedestal
  const table = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.16, 6.2, 3, 0.07), mat('#cbd5e1', { rough: 0.5 }));
  table.position.set(0, -1.62, 1.6); stage.add(table, part);
  const pad = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.12, 5.8, 3, 0.06), mat('#64748b', { rough: 0.8 }));
  pad.position.set(0, -1.48, 1.6); stage.add(pad, part);
  const ped = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.3, 1.6, 3, 0.1), mat('#e2e8f0', { rough: 0.45 }));
  ped.position.set(0, -2.35, 4.0); stage.add(ped, part);
  // the head coil: a cage of bars around the head (it picks up the radio signal)
  const coil = [];
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; coil.push(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 6).rotateX(Math.PI / 2).translate(Math.cos(a) * 1.62, Math.sin(a) * 1.62 + 0.15, 0)); }
  for (const z of [-1, 1]) coil.push(new THREE.TorusGeometry(1.62, 0.05, 8, 48).translate(0, 0.15, z));
  stage.add(meshOf(coil, mat('#94a3b8', { opacity: 0.7, rough: 0.4 })), part);
  return b;
}

/** Open tube (scanner bore). */
function bore(r, len, color, opacity = 0.35) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 48, 1, true), mat(color, { opacity, side: THREE.DoubleSide }));
  m.material.depthWrite = false;
  return m;
}

// ---------------------------------------------------------------- 2D drawing helpers
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function hot(v) { v = clamp01(v); return [Math.min(255, v * 3 * 255), Math.min(255, Math.max(0, v * 3 - 1) * 255), Math.min(255, Math.max(0, v * 3 - 2) * 255)]; }
function bg(ctx, w, h, c = '#05070c') { ctx.fillStyle = c; ctx.fillRect(0, 0, w, h); }
function label(ctx, text, x, y, { color = '#e2e8f0', size = 13, align = 'left', weight = '' } = {}) { ctx.fillStyle = color; ctx.font = `${weight} ${size}px Rubik, sans-serif`; ctx.textAlign = align; ctx.fillText(text, x, y); }
/** Axial brain slice (looking down; nose at the top). mode: 'ct' | 't1' | 't2' | 'pet' (mask only). */
function axial(ctx, cx, cy, rx, ry, mode) {
  const wob = (a, k = 1) => 1 + k * (0.018 * Math.sin(a * 17) + 0.014 * Math.sin(a * 29 + 1) + 0.012 * Math.sin(a * 7 + 2));
  const shape = (scale, k, fill) => {
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const a = (i / 200) * Math.PI * 2; const r = scale * wob(a, k); ctx.lineTo(cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r); }
    ctx.fillStyle = fill; ctx.fill();
  };
  const C = {
    ct: { scalp: '#3a3a3a', skull: '#f5f5f5', csf: '#1c1c1c', gray: '#6e6e6e', white: '#7a7a7a', vent: '#202020' },
    t1: { scalp: '#d9d9d9', skull: '#151515', csf: '#141414', gray: '#7d7d7d', white: '#c9c9c9', vent: '#111' },
    t2: { scalp: '#9a9a9a', skull: '#101010', csf: '#f0f0f0', gray: '#9b9b9b', white: '#4f4f4f', vent: '#f7f7f7' },
  }[mode];
  shape(1.12, 0, C.scalp); shape(1.06, 0, C.skull); shape(1.0, 0.2, C.csf); shape(0.96, 1, C.gray); shape(0.8, 2.2, C.white);
  // midline fissure
  ctx.strokeStyle = C.csf; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - ry * 0.98); ctx.lineTo(cx, cy - ry * 0.3); ctx.moveTo(cx, cy + ry * 0.45); ctx.lineTo(cx, cy + ry * 0.98); ctx.stroke();
  // lateral ventricles
  ctx.fillStyle = C.vent;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * rx * 0.1, cy - ry * 0.08, rx * 0.045, ry * 0.2, -s * 0.18, 0, Math.PI * 2); ctx.fill(); }
}
function trace(ctx, x, y, w, h, f, color = '#22d3ee', lw = 1.5) {
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
  for (let i = 0; i <= w; i++) { const v = f(i / w); ctx.lineTo(x + i, y + h / 2 - v * h / 2); }
  ctx.stroke();
}
const noise = (x) => Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;
/** Paint a low-resolution field (for PET / MEG / fMRI) and scale it up smoothly. */
function field(ctx, x, y, w, h, fn, res = 4) {
  const W = Math.ceil(w / res), H = Math.ceil(h / res);
  const img = ctx.createImageData(W, H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const c = fn(i / W, j / H);
    if (!c) continue;
    const k = (j * W + i) * 4;
    img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = c[3] ?? 255;
  }
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  off.getContext('2d').putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, x, y, w, h);
}
const gauss = (x, y, cx, cy, s) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s));

// ---------------------------------------------------------------- the methods
const METHODS = [];
const M = (def) => METHODS.push(def);

// 1. Histology
M({
  id: 'histology', icon: '🔬', name: B('Histology: staining neurons', 'היסטולוגיה: צביעת נוירונים'),
  intro: B('Thin slices of brain tissue are stained and studied under a microscope. Different stains reveal different things.', 'פרוסות דקות של רקמת מוח נצבעות ונבדקות במיקרוסקופ. צבענים שונים חושפים דברים שונים.'),
  facts: { measures: B('Cell shape, size and density (dead tissue)', 'צורה, גודל וצפיפות של תאים (רקמה מתה)'), spatial: B('Micrometres (single cells)', 'מיקרומטרים (תאים בודדים)'), temporal: B('None — a snapshot after death', 'אין — תמונת מצב לאחר המוות'), invasive: B('Post-mortem tissue only', 'רק רקמה לאחר המוות') },
  tests: [B('What do neurons look like, and how are they connected?', 'איך נוירונים נראים ואיך הם מחוברים?'), B('How are cells arranged in layers (e.g. the six cortical layers)?', 'איך תאים מסודרים בשכבות (למשל שש שכבות הקליפה)?'), B('Has a disease killed cells in a region?', 'האם מחלה הרגה תאים באזור מסוים?')],
  example: B('Golgi\'s silver stain colours only a few whole neurons — which let Cajal show that neurons are separate cells (the neuron doctrine). Nissl stains colour every cell body, showing layers and density.', 'צביעת הכסף של גולג\'י צובעת רק מעט נוירונים שלמים — מה שאפשר לקחאל להראות שנוירונים הם תאים נפרדים (דוקטרינת הנוירון). צביעת ניסל צובעת כל גוף תא ומראה שכבות וצפיפות.'),
  limits: B('Only dead tissue, so no information about activity or behaviour.', 'רק רקמה מתה, ולכן אין מידע על פעילות או התנהגות.'),
  scene(stage) {
    stage.definePart({ id: 'microscope', name: B('Light microscope', 'מיקרוסקופ אור'), desc: B('Magnifies the stained slice up to about 1000×.', 'מגדיל את הפרוסה הצבועה עד כ-1000 פעמים.'), color: '#94a3b8', chapters: CH });
    stage.definePart({ id: 'slice', name: B('Stained brain slice', 'פרוסת מוח צבועה'), desc: B('A slice only a few micrometres thick, mounted on a glass slide.', 'פרוסה בעובי של מיקרומטרים ספורים, מונחת על זכוכית נושאת.'), color: '#a855f7', chapters: CH });
    const scope = new THREE.Group();
    const base = box(2.4, 0.3, 1.8, '#475569'); base.position.y = -1.8;
    const arm = box(0.4, 3, 0.5, '#64748b'); arm.position.set(0, -0.3, -0.7); arm.rotation.x = 0.15;
    const stageP = box(1.8, 0.12, 1.4, '#334155'); stageP.position.y = -0.6;
    const obj = cyl(0.18, 0.12, 0.7, '#cbd5e1'); obj.position.y = 0.0;
    const tubeM = cyl(0.22, 0.22, 1.3, '#94a3b8'); tubeM.position.set(0, 0.9, -0.2); tubeM.rotation.x = -0.3;
    const eye = cyl(0.16, 0.16, 0.4, '#1f2937'); eye.position.set(0, 1.65, -0.45); eye.rotation.x = -0.3;
    scope.add(base, arm, stageP, obj, tubeM, eye);
    stage.add(scope, 'microscope');
    const glass = box(1.6, 0.03, 0.6, '#e0f2fe', { opacity: 0.5 }); glass.position.y = -0.52; stage.root.add(glass);
    const slice = cyl(0.25, 0.25, 0.02, '#a855f7', undefined, 32); slice.scale.set(1.3, 1, 1); slice.position.y = -0.5;
    stage.add(slice, 'slice');
    const state = { mode: 'nissl' };
    const set = (m) => { state.mode = m; slice.material.color.set(m === 'golgi' ? '#d6b36a' : m === 'immuno' ? '#b45309' : '#a855f7'); };
    return {
      home: { pos: V(3, 1.5, 5), target: V(0, -0.3, 0) }, state,
      actions: [
        { icon: '🟣', label: B('Nissl stain', 'צביעת ניסל'), radio: true, caption: B('Nissl stains colour the cell bodies of ALL neurons — great for seeing layers and counting cells.', 'צביעת ניסל צובעת את גופי התאים של כל הנוירונים — מצוין לראות שכבות ולספור תאים.'), run: () => set('nissl') },
        { icon: '⚫', label: B('Golgi stain', 'צביעת גולג\'י'), radio: true, caption: B('The Golgi stain colours only a few neurons, but completely — dendrites, spines and axon — so single cells stand out.', 'צביעת גולג\'י צובעת רק מעט נוירונים, אבל במלואם — דנדריטים, קוצים ואקסון — כך שתאים בודדים בולטים.'), run: () => set('golgi') },
        { icon: '🟤', label: B('Immunostain (one protein)', 'צביעה חיסונית (חלבון אחד)'), radio: true, caption: B('An antibody that sticks to just one protein carries the dye. Here it finds tyrosine hydroxylase, the enzyme that makes dopamine, so only dopamine neurons turn brown. In Parkinson’s disease most of these cells are gone.', 'נוגדן שנדבק לחלבון אחד בלבד נושא את הצבע. כאן הוא מוצא את טירוזין הידרוקסילאז, האנזים שמייצר דופמין, ולכן רק נוירוני הדופמין נצבעים בחום. במחלת פרקינסון רוב התאים האלה נעלמו.'), run: () => set('immuno') },
      ],
    };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h, '#f4ecdc');
    const R = seeded(st.mode === 'golgi' ? 5 : 9);
    if (st.mode === 'immuno') {
      // faint counterstain everywhere, a cluster of brown dopamine neurons with their processes
      for (let k = 0; k < 260; k++) { ctx.fillStyle = 'rgba(148,163,184,.35)'; ctx.beginPath(); ctx.arc(R() * w, R() * h, 1.5 + R() * 1.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#78350f'; ctx.fillStyle = '#92400e';
      for (let n = 0; n < 14; n++) {
        const x = w * (0.25 + R() * 0.5), y = h * (0.3 + R() * 0.4);
        for (let k = 0; k < 3; k++) { const a = R() * Math.PI * 2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14 + 6, x + Math.cos(a) * 30, y + Math.sin(a) * 30); ctx.stroke(); }
        ctx.beginPath(); ctx.ellipse(x, y, 6, 4.5, R() * 3, 0, Math.PI * 2); ctx.fill();
      }
    } else if (st.mode === 'nissl') {
      const bands = [0.04, 0.18, 0.06, 0.26, 0.14, 0.22, 0.12];
      let y0 = 0;
      bands.forEach((d, i) => {
        const bh = h * d / 1.02, n = [10, 120, 50, 160, 50, 90, 60][i];
        for (let k = 0; k < n; k++) { ctx.fillStyle = `rgba(${90 + R() * 40},${40 + R() * 30},${150 + R() * 40},${0.6 + R() * 0.4})`; ctx.beginPath(); ctx.ellipse(R() * w, y0 + R() * bh, 2 + R() * (i === 5 ? 6 : 3), 2 + R() * 3, R() * 3, 0, Math.PI * 2); ctx.fill(); }
        label(ctx, ['I', 'II', 'III', 'IV', 'V', 'VI', ''][i], 6, y0 + bh / 2 + 4, { color: '#6b21a8', size: 11 });
        y0 += bh;
      });
    } else {
      ctx.strokeStyle = '#1c1206'; ctx.fillStyle = '#1c1206';
      const branch = (x, y, a, len, wdt, depth) => {
        if (depth <= 0 || len < 4) return;
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        for (let k = 0; k < 2; k++) branch(x2, y2, a + (R() - 0.5) * 1.2, len * (0.6 + R() * 0.2), wdt * 0.7, depth - 1);
      };
      for (let n = 0; n < 4; n++) {
        const x = w * (0.15 + n * 0.23 + R() * 0.05), y = h * (0.45 + R() * 0.3);
        ctx.beginPath(); ctx.moveTo(x - 6, y + 5); ctx.lineTo(x + 6, y + 5); ctx.lineTo(x, y - 9); ctx.fill();
        branch(x, y - 8, -Math.PI / 2 + (R() - 0.5) * 0.2, 50, 2.2, 5);
        for (let k = 0; k < 3; k++) branch(x, y + 4, Math.PI / 2 + (R() - 0.5) * 2.2, 18, 1.4, 3);
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x + (R() - 0.5) * 20, h); ctx.stroke();
      }
    }
    label(ctx, st.mode === 'immuno' ? L('Immunostain for tyrosine hydroxylase (simulated)', 'צביעה חיסונית לטירוזין הידרוקסילאז (הדמיה)') : st.mode === 'nissl' ? L('Nissl stain (simulated)', 'צביעת ניסל (הדמיה)') : L('Golgi stain (simulated)', 'צביעת גולג\'י (הדמיה)'), w - 8, h - 8, { color: '#57534e', size: 12, align: 'right' });
  },
});

// 2. Autopsy & lesions
const LESIONS = {
  broca: { pos: BROCA, name: B('Broca\'s area (left frontal lobe)', 'אזור ברוקה (האונה המצחית השמאלית)'), deficit: B('Speech production lost: Broca\'s patient "Tan" understood speech but could only say "tan". Autopsy showed damage here.', 'אובדן הפקת דיבור: המטופל של ברוקה, "טאן", הבין דיבור אבל יכול היה לומר רק "טאן". הנתיחה הראתה פגיעה כאן.') },
  gage: { pos: PREFRONTAL, name: B('Prefrontal cortex', 'קליפת המצח הקדמית'), deficit: B('Phineas Gage survived an iron rod through his frontal lobes, but his personality, planning and self-control changed.', 'פיניאס גייג\' שרד מוט ברזל שחדר לאונות המצח שלו, אבל אישיותו, יכולת התכנון והשליטה העצמית שלו השתנו.') },
  wernicke: { pos: TEMPORAL_L, name: B('Wernicke’s area (left temporal lobe)', 'אזור ורניקה (האונה הרקתית השמאלית)'), deficit: B('Fluent speech that makes little sense, and poor understanding: the opposite of Broca’s patients. Together the two cases are a double dissociation: two different areas for two different parts of language.', 'דיבור שוטף אבל עם מעט משמעות, והבנה חלשה: ההפך מהמטופלים של ברוקה. שני המקרים יחד הם דיסוציאציה כפולה: שני אזורים שונים לשני חלקים שונים של השפה.') },
  hippo: { pos: HIPPO, name: B('Hippocampus (both sides)', 'היפוקמפוס (בשני הצדדים)'), deficit: B('Patient H.M. had both hippocampi removed to stop seizures — afterwards he could not form new long-term declarative memories.', 'למטופל ה.מ. הוסרו שני ההיפוקמפוסים כדי לעצור התקפים — לאחר מכן לא יכול היה ליצור זיכרונות דקלרטיביים חדשים לטווח ארוך.') },
};
M({
  id: 'lesion', icon: '🩹', name: B('Autopsy & lesion studies', 'נתיחה ומחקרי פגיעה'),
  intro: B('Link a damaged brain area to a lost ability: study patients with brain damage (later confirmed at autopsy), or make precise lesions in animals.', 'קישור בין אזור מוח פגוע ליכולת שאבדה: חקר מטופלים עם נזק מוחי (שאומת מאוחר יותר בנתיחה), או יצירת פגיעות מדויקות בבעלי חיים.'),
  facts: { measures: B('Which behaviour is lost when an area is damaged', 'איזו התנהגות אובדת כשאזור נפגע'), spatial: B('Millimetres to centimetres', 'מילימטרים עד סנטימטרים'), temporal: B('Weeks to years (before vs after)', 'שבועות עד שנים (לפני מול אחרי)'), invasive: B('Yes in animals; natural damage in humans', 'כן בבעלי חיים; נזק טבעי בבני אדם') },
  tests: [B('Is an area NECESSARY for a behaviour?', 'האם אזור מסוים הכרחי להתנהגות?'), B('Where in the brain is language, memory, planning…?', 'היכן במוח נמצאים שפה, זיכרון, תכנון…?')],
  example: B('Broca (1861) linked the left frontal lobe to speech production after the autopsy of his patient "Tan".', 'ברוקה (1861) קישר את האונה המצחית השמאלית להפקת דיבור לאחר נתיחת המטופל שלו "טאן".'),
  limits: B('Natural damage is rarely neat; the brain may reorganise; damage can also cut fibres passing through.', 'נזק טבעי לעיתים רחוקות מסודר; המוח עשוי להתארגן מחדש; הנזק יכול גם לנתק סיבים שעוברים באזור.'),
  scene(stage) {
    head(stage);
    stage.definePart({ id: 'lesionSite', name: B('Damaged area', 'אזור פגוע'), desc: B('Choose a famous case with the buttons below.', 'בחרו מקרה מפורסם בכפתורים למטה.'), color: '#1f2937', chapters: CH });
    const les = spot(stage, BROCA, '#1f2937', 0.24, 'lesionSite');
    const state = { site: 'broca' };
    const set = (k) => { state.site = k; les.position.copy(LESIONS[k].pos); };
    return {
      home: { pos: V(3.2, 1, 3.2), target: V(0, 0, 0) }, state,
      actions: Object.entries(LESIONS).map(([k, v]) => ({ icon: '🎯', label: v.name, radio: true, caption: v.deficit, run: () => set(k) })),
    };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h, '#0f172a');
    // side view brain outline (face to the left)
    const cx = w * 0.36, cy = h * 0.5;
    ctx.fillStyle = '#f2b8c6'; ctx.beginPath(); ctx.ellipse(cx, cy - 10, w * 0.27, h * 0.33, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e59bb0'; ctx.beginPath(); ctx.ellipse(cx + w * 0.17, cy + h * 0.25, w * 0.09, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#be7c8f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - w * 0.05, cy - h * 0.35); ctx.quadraticCurveTo(cx, cy - h * 0.05, cx - w * 0.02, cy + h * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - w * 0.22, cy + h * 0.05); ctx.quadraticCurveTo(cx, cy, cx + w * 0.12, cy - h * 0.02); ctx.stroke();
    const pos = { broca: [-0.17, 0.02], gage: [-0.22, -0.15], hippo: [0.02, 0.1], wernicke: [0.06, 0.04] }[st.site];
    const pulse = 0.7 + 0.3 * Math.sin(t * 4);
    ctx.fillStyle = `rgba(20,20,30,${pulse})`; ctx.beginPath(); ctx.arc(cx + pos[0] * w, cy + pos[1] * h, 16, 0, Math.PI * 2); ctx.fill();
    label(ctx, '◀ ' + L('front', 'קדימה'), 10, 20, { color: '#94a3b8', size: 12 });
    const lines = L(LESIONS[st.site].name.en, LESIONS[st.site].name.he);
    label(ctx, lines, w * 0.68, h * 0.3, { color: '#fca5a5', size: 13, weight: 'bold' });
    label(ctx, L('damaged → ability lost', 'פגוע ← יכולת אבדה'), w * 0.68, h * 0.3 + 20, { color: '#e2e8f0', size: 12 });
  },
});

// 3. CT
M({
  id: 'ct', icon: '🌀', name: B('CT scan', 'סריקת CT'),
  intro: B('Computerized tomography: an X-ray tube spins around the head and a computer combines the images into slices.', 'טומוגרפיה ממוחשבת: שפופרת רנטגן מסתובבת סביב הראש ומחשב מצרף את התמונות לפרוסות.'),
  facts: { measures: B('Structure (density of tissue)', 'מבנה (צפיפות הרקמה)'), spatial: B('About 1 mm', 'כ-1 מ"מ'), temporal: B('No activity — structure only', 'אין פעילות — מבנה בלבד'), invasive: B('No surgery, but uses X-rays (radiation)', 'ללא ניתוח, אבל משתמש בקרני רנטגן (קרינה)') },
  tests: [B('Is there a tumour, bleed or stroke?', 'האם יש גידול, דימום או שבץ?'), B('Are the ventricles enlarged (e.g. in schizophrenia)?', 'האם החדרים מוגדלים (למשל בסכיזופרניה)?')],
  example: B('CT scans showed enlarged ventricles in many people with schizophrenia.', 'סריקות CT הראו חדרים מוגדלים אצל אנשים רבים עם סכיזופרניה.'),
  limits: B('Poor contrast between gray and white matter; radiation; no information about activity.', 'ניגודיות חלשה בין חומר אפור ללבן; קרינה; אין מידע על פעילות.'),
  scene(stage) {
    head(stage);
    stage.definePart({ id: 'gantry', name: B('CT gantry with X-ray tube', 'טבעת ה-CT עם שפופרת רנטגן'), desc: B('The X-ray tube and detectors rotate around the head, taking hundreds of images from different angles.', 'שפופרת הרנטגן והגלאים מסתובבים סביב הראש ומצלמים מאות תמונות מזוויות שונות.'), color: '#94a3b8', chapters: CH });
    const ring = gantry(3.0, 2.05, 0.9, '#e2e8f0', { opacity: 0.55 }); ring.position.y = 0.2; stage.add(ring, 'gantry');
    const rot = new THREE.Group(); rot.position.y = 0.2; stage.root.add(rot);
    const tubeX = box(0.5, 0.5, 0.5, '#f59e0b'); tubeX.position.set(0, 0, 2.4); stage.add(tubeX, 'gantry', rot);
    const det = box(1.6, 0.4, 0.2, '#334155'); det.position.set(0, 0, -2.4); stage.add(det, 'gantry', rot);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.9, 4.6, 24, 1, true), mat('#fde047', { opacity: 0.18, side: THREE.DoubleSide })); beam.rotation.x = Math.PI / 2; beam.position.z = 0.05; beam.material.depthWrite = false; rot.add(beam);
    const state = { scanning: true, bleed: false, stroke: false, prog: 0 };
    stage.onUpdate((dt) => { if (state.scanning) { rot.rotation.y += dt * 3; state.prog = Math.min(1, state.prog + dt * 0.25); } beam.visible = state.scanning; });
    return {
      home: { pos: V(4, 3, 5), target: V(0, 0, 0) }, state,
      actions: [
        { icon: '▶️', label: B('Scan', 'סריקה'), toggle: true, caption: B('The slice builds up from many X-ray projections. Dense tissue (bone) absorbs more X-rays and looks white.', 'הפרוסה נבנית מהרבה הקרנות רנטגן. רקמה צפופה (עצם) בולעת יותר קרינה ונראית לבנה.'), run: (on) => { state.scanning = on; if (on) state.prog = 0; } },
        { icon: '🩸', label: B('Show a bleed', 'הצגת דימום'), toggle: true, caption: B('Fresh blood is denser than brain tissue, so a bleed looks bright on CT — why CT is used first in emergencies.', 'דם טרי צפוף יותר מרקמת המוח, ולכן דימום נראה בהיר ב-CT — זו הסיבה ש-CT משמש ראשון במצבי חירום.'), run: (on) => { state.bleed = on; } },
        { icon: '🧊', label: B('Show a stroke (blocked artery)', 'הצגת שבץ (עורק חסום)'), toggle: true, caption: B('When an artery is blocked, the tissue it feeds swells and dies and looks DARK on CT, but only hours later. A bleed looks bright at once. Telling the two apart matters: clot-busting drugs help a blocked artery but make a bleed worse.', 'כשעורק נחסם, הרקמה שהוא מזין מתנפחת ומתה ונראית כהה ב-CT, אבל רק כעבור שעות. דימום נראה בהיר מיד. חשוב להבחין ביניהם: תרופות ממיסות קרישים עוזרות לעורק חסום אבל מחמירות דימום.'), run: (on) => { state.stroke = on; } },
      ],
    };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const cx = w * 0.5, cy = h * 0.5, rx = h * 0.38, ry = h * 0.44;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, w, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (st.prog ?? 1)); ctx.closePath(); ctx.clip();
    axial(ctx, cx, cy, rx, ry, 'ct');
    if (st.stroke) { ctx.fillStyle = 'rgba(40,40,40,.85)'; ctx.beginPath(); ctx.moveTo(cx - rx * 0.1, cy - ry * 0.05); ctx.arc(cx - rx * 0.1, cy - ry * 0.05, rx * 0.62, Math.PI * 0.85, Math.PI * 1.25); ctx.closePath(); ctx.fill(); }
    if (st.bleed) { ctx.fillStyle = '#e5e5e5'; ctx.beginPath(); ctx.ellipse(cx + rx * 0.45, cy - ry * 0.15, rx * 0.16, ry * 0.12, 0.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    label(ctx, L('CT slice (simulated) — bone white, brain gray', 'פרוסת CT (הדמיה) — עצם לבנה, מוח אפור'), 10, h - 10, { color: '#94a3b8', size: 12 });
  },
});

// 4. MRI
M({
  id: 'mri', icon: '🧲', name: B('MRI', 'MRI (תהודה מגנטית)'),
  intro: B('Magnetic resonance imaging: a strong magnet lines up hydrogen atoms; radio pulses knock them over, and the signals they give off as they realign form a detailed picture.', 'דימות תהודה מגנטית: מגנט חזק מיישר את אטומי המימן; פולסים של גלי רדיו מטים אותם, והאותות שהם פולטים כשהם חוזרים יוצרים תמונה מפורטת.'),
  facts: { measures: B('Structure in fine detail', 'מבנה בפירוט רב'), spatial: B('Under 1 mm', 'פחות מ-1 מ"מ'), temporal: B('Structure only', 'מבנה בלבד'), invasive: B('Non-invasive, no radiation (no metal allowed!)', 'לא פולשני, ללא קרינה (אסור מתכת!)') },
  tests: [B('Size of brain structures (e.g. hippocampus, ventricles)', 'גודל מבני מוח (למשל היפוקמפוס, חדרים)'), B('Gray vs white matter, tumours, multiple sclerosis lesions', 'חומר אפור מול לבן, גידולים, נגעי טרשת נפוצה')],
  example: B('MRI studies found that London taxi drivers have a larger posterior hippocampus — linked to spatial memory.', 'מחקרי MRI מצאו שלנהגי מוניות בלונדון יש היפוקמפוס אחורי גדול יותר — קשור לזיכרון מרחבי.'),
  limits: B('Expensive, noisy, claustrophobic; shows structure, not activity.', 'יקר, רועש, גורם לקלסטרופוביה; מראה מבנה, לא פעילות.'),
  scene(stage) {
    head(stage);
    stage.definePart({ id: 'magnet', name: B('MRI magnet (bore)', 'מגנט ה-MRI (המנהרה)'), desc: B('A superconducting magnet tens of thousands of times stronger than Earth\'s magnetic field.', 'מגנט על-מוליך חזק פי עשרות אלפים משדה המגנטי של כדור הארץ.'), color: '#93c5fd', chapters: CH });
    const b = mriScanner(stage, 'magnet');
    const state = { mode: 't1', pulse: 0, ms: false };
    stage.onUpdate((dt, t) => { b.material.emissive.set('#3b82f6').multiplyScalar(0.3 + 0.3 * Math.max(0, Math.sin(t * 8))); });
    return {
      home: { pos: V(3.5, 2.5, 6.5), target: V(0, 0, 0) }, state,
      actions: [
        { icon: '⚪', label: B('T1 image', 'תמונת T1'), radio: true, caption: B('In a T1 image white matter (fatty myelin) is bright and fluid is dark — good for anatomy.', 'בתמונת T1 החומר הלבן (מיאלין שומני) בהיר והנוזל כהה — טוב לאנטומיה.'), run: () => { state.mode = 't1'; } },
        { icon: '⚫', label: B('T2 image', 'תמונת T2'), radio: true, caption: B('In a T2 image fluid is bright — good for spotting swelling and lesions.', 'בתמונת T2 הנוזל בהיר — טוב לזיהוי בצקת ונגעים.'), run: () => { state.mode = 't2'; } },
        { icon: '⚪', label: B('Multiple sclerosis lesions', 'נגעי טרשת נפוצה'), toggle: true, caption: B('In MS the immune system strips myelin from patches of white matter. The patches hold extra water, so they shine bright on T2 and look dark on T1. Doctors count them on MRI to follow the disease.', 'בטרשת נפוצה מערכת החיסון מסירה מיאלין מכתמים בחומר הלבן. בכתמים יש יותר מים, ולכן הם בוהקים ב-T2 ונראים כהים ב-T1. רופאים סופרים אותם ב-MRI כדי לעקוב אחרי המחלה.'), run: (on) => { state.ms = on; } },
      ],
    };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    axial(ctx, w * 0.5, h * 0.5, h * 0.38, h * 0.44, st.mode);
    if (st.ms) { const R = seeded(12); ctx.fillStyle = st.mode === 't2' ? 'rgba(255,255,255,.95)' : 'rgba(60,60,60,.9)'; for (let i = 0; i < 9; i++) { const a = R() * Math.PI * 2, d = 0.25 + R() * 0.25; ctx.beginPath(); ctx.ellipse(w * 0.5 + Math.cos(a) * h * 0.38 * d, h * 0.5 + Math.sin(a) * h * 0.44 * d, 3 + R() * 4, 2 + R() * 3, a, 0, Math.PI * 2); ctx.fill(); } }
    label(ctx, `${st.mode.toUpperCase()} — ${L('MRI slice (simulated)', 'פרוסת MRI (הדמיה)')}`, 10, h - 10, { color: '#94a3b8', size: 12 });
  },
});

// 5. DTI
M({
  id: 'dti', icon: '🧶', name: B('Diffusion tensor imaging (DTI)', 'דימות טנזור דיפוזיה (DTI)'),
  intro: B('A type of MRI that tracks how water diffuses along axons, so it can trace the brain\'s white-matter "wiring".', 'סוג של MRI שעוקב אחרי האופן שבו מים מתפזרים לאורך אקסונים, וכך יכול לשרטט את "החיווט" של החומר הלבן במוח.'),
  facts: { measures: B('Direction and integrity of fibre tracts', 'כיוון ושלמות של מסלולי סיבים'), spatial: B('About 2 mm', 'כ-2 מ"מ'), temporal: B('Structure only', 'מבנה בלבד'), invasive: B('Non-invasive', 'לא פולשני') },
  tests: [B('Which areas are connected, and how strongly?', 'אילו אזורים מחוברים, ובאיזו עוצמה?'), B('Damaged white matter after injury or disease', 'חומר לבן פגוע אחרי פציעה או מחלה')],
  example: B('Colours show direction: red = left–right (corpus callosum), green = front–back, blue = up–down (the motor pathway).', 'הצבעים מראים כיוון: אדום = שמאל–ימין (הגוף המיוזע), ירוק = קדימה–אחורה, כחול = מעלה–מטה (המסלול המוטורי).'),
  limits: B('Crossing fibres are hard to resolve; it shows wiring, not activity.', 'קשה להבחין בסיבים מצטלבים; מראה חיווט, לא פעילות.'),
  scene(stage) {
    head(stage, { brainOpacity: 0.25 });
    stage.definePart({ id: 'cc', name: B('Corpus callosum (red)', 'הגוף המיוזע (אדום)'), desc: B('Fibres running left–right, connecting the two hemispheres.', 'סיבים שרצים משמאל לימין ומחברים את שתי ההמיספרות.'), color: '#ef4444', chapters: [2] });
    stage.definePart({ id: 'cst', name: B('Corticospinal tract (blue)', 'המסלול הקורטיקו-ספינלי (כחול)'), desc: B('Fibres running up–down from the motor cortex to the spinal cord.', 'סיבים שרצים מלמעלה למטה מהקליפה המוטורית לחוט השדרה.'), color: '#3b82f6', chapters: [8] });
    stage.definePart({ id: 'slf', name: B('Longitudinal fasciculi (green)', 'צרורות אורכיים (ירוק)'), desc: B('Long front–back bundles linking the frontal lobe with the rest of the cortex (including language areas).', 'צרורות ארוכים מקדימה לאחור שמחברים את האונה המצחית לשאר הקליפה (כולל אזורי שפה).'), color: '#22c55e', chapters: [13] });
    for (let i = 0; i < 9; i++) { const z = -0.5 + i * 0.12; stage.add(tube([V(-0.7, 0.45, z), V(-0.3, 0.3, z), V(0, 0.25, z), V(0.3, 0.3, z), V(0.7, 0.45, z)], 0.025, '#ef4444'), 'cc'); }
    for (const s of [1, -1]) for (let i = 0; i < 5; i++) stage.add(tube([V(s * (0.35 + i * 0.05), 0.85, 0.1 - i * 0.05), V(s * 0.25, 0.3, 0.0), V(s * 0.12, -0.2, -0.15), V(s * 0.08, -1.0, -0.35)], 0.02, '#3b82f6'), 'cst');
    for (const s of [1, -1]) for (let i = 0; i < 4; i++) stage.add(tube([V(s * 0.55, 0.3 + i * 0.05, 0.75), V(s * 0.62, 0.35 + i * 0.05, 0.1), V(s * 0.6, 0.2 + i * 0.05, -0.5), V(s * 0.5, 0.05, -0.8)], 0.02, '#22c55e'), 'slf');
    const dtiState = { injury: false };
    const ccTubes = []; stage.root.traverse((o) => { if (o.userData.partId === 'cc') ccTubes.push(o); });
    return { home: { pos: V(2.8, 1.4, 3.2), target: V(0, 0.1, 0) }, state: dtiState, actions: [
      { icon: '🔴', label: B('Left–right fibres', 'סיבים שמאל–ימין'), run: () => stage.focus(['cc']) },
      { icon: '🤕', label: B('A head injury', 'פגיעת ראש'), toggle: true, caption: B('In a hard knock to the head the brain shifts inside the skull and long axons stretch and tear (diffuse axonal injury). A normal MRI can look fine, but DTI shows the broken tracts, here in the corpus callosum.', 'במכה חזקה בראש המוח זז בתוך הגולגולת, ואקסונים ארוכים נמתחים ונקרעים (פגיעה אקסונלית מפושטת). MRI רגיל יכול להיראות תקין, אבל DTI מראה את המסלולים השבורים, כאן בגוף המיוזע.'), run: (on) => { dtiState.injury = on; ccTubes.forEach((t, i) => { t.visible = !on || i % 3 === 0; }); if (on) stage.focus(['cc']); } },
      { icon: '🔵', label: B('Up–down fibres', 'סיבים מעלה–מטה'), run: () => stage.focus(['cst']) },
      { icon: '🟢', label: B('Front–back fibres', 'סיבים קדימה–אחורה'), run: () => stage.focus(['slf']) },
    ] };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const cx = w * 0.5, cy = h * 0.5, rx = h * 0.38, ry = h * 0.44;
    axial(ctx, cx, cy, rx, ry, 't1');
    ctx.globalAlpha = 0.85;
    const R = seeded(3);
    for (let i = 0; i < 260; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 0.74;
      const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
      const centre = Math.abs(x - cx) < rx * 0.35 && Math.abs(y - cy) < ry * 0.5 && Math.abs(y - cy) > ry * 0.36;
      const lateral = Math.abs(x - cx) > rx * 0.38;
      const col = centre ? '#ef4444' : lateral ? '#22c55e' : '#3b82f6';
      if (centre && st.injury && R() < 0.7) continue;
      const ang = centre ? 0 : lateral ? Math.PI / 2 : 0;
      if (col === '#3b82f6') { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * 5, y - Math.sin(ang) * 5); ctx.lineTo(x + Math.cos(ang) * 5, y + Math.sin(ang) * 5); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    label(ctx, L('red L–R · green front–back · blue up–down', 'אדום שמאל–ימין · ירוק קדימה–אחורה · כחול מעלה–מטה'), 10, h - 10, { color: '#94a3b8', size: 12 });
  },
});

// shared "task" activity for PET / fMRI
const TASKS = {
  rest: { name: B('Rest', 'מנוחה'), at: null, xy: null },
  see: { name: B('Look at pictures', 'צפייה בתמונות'), at: OCCIPITAL, xy: [[0.5, 0.86]] },
  hear: { name: B('Listen to music', 'האזנה למוזיקה'), at: TEMPORAL_L, xy: [[0.12, 0.5], [0.88, 0.5]] },
  words: { name: B('Think of words', 'חשיבה על מילים'), at: BROCA, xy: [[0.8, 0.3]] },
  tap: { name: B('Tap your fingers', 'תיפוף אצבעות'), at: MOTOR_L, xy: [[0.75, 0.42]] },
  faces: { name: B('Look at faces', 'צפייה בפרצופים'), at: FUSIFORM, xy: [[0.72, 0.75]] },
  dopa: { name: B('Dopamine tracer (receptors)', 'סמן דופמין (קולטנים)'), at: ACCUMBENS, xy: [[0.4, 0.42], [0.6, 0.42]] },
};
function taskActions(stage, state, ids, glow) {
  return ids.map((k) => ({ icon: { rest: '😌', see: '👁️', hear: '🎵', words: '💬', tap: '✋', faces: '🙂', dopa: '🧪' }[k], label: TASKS[k].name, radio: true, run: () => { state.task = k; state.since = 0; if (TASKS[k].at) { glow.position.copy(TASKS[k].at); glow.visible = true; } else glow.visible = false; } }));
}

// 6. PET
M({
  id: 'pet', icon: '☢️', name: B('PET scan', 'סריקת PET'),
  intro: B('Positron emission tomography: a slightly radioactive tracer (often a glucose look-alike) is injected; the most active areas use the most and "light up".', 'טומוגרפיית פליטת פוזיטרונים: מוזרק חומר סמן מעט רדיואקטיבי (לעיתים קרובות דומה לגלוקוז); האזורים הפעילים ביותר צורכים הכי הרבה ו"נדלקים".'),
  facts: { measures: B('Activity (glucose use, blood flow, receptors)', 'פעילות (צריכת גלוקוז, זרימת דם, קולטנים)'), spatial: B('About 4–5 mm', 'כ-4–5 מ"מ'), temporal: B('Tens of seconds to minutes', 'עשרות שניות עד דקות'), invasive: B('Needs an injection of a radioactive tracer', 'דורש הזרקת חומר סמן רדיואקטיבי') },
  tests: [B('Which areas are active during a task?', 'אילו אזורים פעילים בזמן משימה?'), B('Where are particular receptors (e.g. dopamine) in the living brain?', 'היכן נמצאים קולטנים מסוימים (למשל דופמין) במוח החי?')],
  example: B('PET showed reduced glucose use in the frontal lobes of some people with schizophrenia (hypofrontality).', 'PET הראה ירידה בצריכת גלוקוז באונות המצח אצל חלק מהאנשים עם סכיזופרניה (היפו-פרונטליות).'),
  limits: B('Radiation limits repeat scans; slow; blurry compared with MRI.', 'הקרינה מגבילה סריקות חוזרות; איטי; מטושטש בהשוואה ל-MRI.'),
  scene(stage) {
    const hd = head(stage);
    stage.definePart({ id: 'scanner', name: B('Ring of detectors', 'טבעת גלאים'), desc: B('Detects pairs of gamma rays given off when positrons from the tracer meet electrons.', 'מזהה זוגות של קרני גמא שנפלטים כשפוזיטרונים מהסמן פוגשים אלקטרונים.'), color: '#a78bfa', chapters: CH });
    const ring = gantry(2.9, 1.95, 1.0, '#ddd6fe', { opacity: 0.5 }); ring.position.y = 0.2; stage.add(ring, 'scanner');
    { const det = []; for (let k = 0; k < 48; k++) { const a = (k / 48) * Math.PI * 2; det.push(new THREE.BoxGeometry(0.16, 0.6, 0.12).translate(0, 0, 0).rotateY(-a).translate(Math.sin(a) * 2.05, 0, Math.cos(a) * 2.05)); } const dm = new THREE.Mesh(mergeGeometries(det), mat('#7c3aed', { rough: 0.4 })); dm.position.y = 0.2; stage.add(dm, 'scanner'); } // the ring of detector blocks
    const glow = spot(stage, OCCIPITAL, '#f97316', 0.35); glow.visible = false;
    const tracer = flow(stage, new THREE.CatmullRomCurve3([V(0.4, -2.8, 0.3), V(0.3, -1.6, 0.2), V(0.1, -0.6, 0.0), V(0, 0.2, 0)]), { color: '#fde047', count: 12, size: 0.12, speed: 0.4 });
    void tracer; void hd;
    const state = { task: 'rest', since: 0 };
    stage.onUpdate((dt, t) => { state.since += dt; glow.scale.setScalar(1 + 0.15 * Math.sin(t * 3)); });
    return { home: { pos: V(3.5, 2.2, 4.5), target: V(0, 0, 0) }, state, actions: taskActions(stage, state, ['rest', 'see', 'hear', 'words', 'dopa'], glow).map((a, i) => (i === 4 ? { ...a, caption: B('A different tracer sticks to dopamine D2 receptors instead of measuring glucose use. The two striatum spots light up: PET can map receptors in a living brain, for example the loss of dopamine signalling in Parkinson’s disease.', 'סמן אחר נדבק לקולטני דופמין D2 במקום למדוד צריכת גלוקוז. שני כתמי הסטריאטום נדלקים: PET יכול למפות קולטנים במוח חי, למשל את אובדן אותות הדופמין בפרקינסון.') } : a)) };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const cx = w * 0.5, cy = h * 0.5, rx = h * 0.38, ry = h * 0.44;
    const spots = TASKS[st.task].xy || [];
    const ramp = clamp01((st.since || 0) / 3);
    field(ctx, cx - rx, cy - ry, rx * 2, ry * 2, (u, v) => {
      const dx = (u - 0.5) * 2, dy = (v - 0.5) * 2;
      if (dx * dx + dy * dy > 0.96) return null;
      const ring = Math.exp(-((Math.sqrt(dx * dx + dy * dy) - 0.82) ** 2) / 0.01) * 0.35;
      let val = 0.18 + ring + 0.04 * Math.sin(u * 17) * Math.sin(v * 13);
      for (const [sx, sy] of spots) val += 0.75 * ramp * gauss(u, v, sx, sy, 0.08);
      return hot(val);
    }, 5);
    label(ctx, `${L('PET (simulated)', 'PET (הדמיה)')} — ${L(TASKS[st.task].name.en, TASKS[st.task].name.he)}`, 10, h - 10, { color: '#94a3b8', size: 12 });
  },
});

// 7. fMRI
M({
  id: 'fmri', icon: '🟧', name: B('Functional MRI (fMRI)', 'MRI תפקודי (fMRI)'),
  intro: B('fMRI measures the BOLD signal: active neurons get extra oxygen-rich blood a few seconds later, and oxygenated blood looks different to the magnet.', 'fMRI מודד את אות ה-BOLD: נוירונים פעילים מקבלים תוספת דם עשיר בחמצן כמה שניות מאוחר יותר, ודם מחומצן נראה שונה למגנט.'),
  facts: { measures: B('Activity, indirectly (blood oxygen)', 'פעילות, בעקיפין (חמצן בדם)'), spatial: B('About 1–3 mm', 'כ-1–3 מ"מ'), temporal: B('Seconds (the blood response is slow)', 'שניות (תגובת הדם איטית)'), invasive: B('Non-invasive, no radiation', 'לא פולשני, ללא קרינה') },
  tests: [B('Which areas become more active during a task?', 'אילו אזורים נעשים פעילים יותר בזמן משימה?'), B('Networks that work together', 'רשתות שפועלות יחד')],
  example: B('fMRI showed that the fusiform face area responds strongly when people look at faces.', 'fMRI הראה שאזור הפנים הפוזיפורמי מגיב חזק כשאנשים מסתכלים על פרצופים.'),
  limits: B('Measures blood flow, not neurons directly; the response lags 4–6 s; correlation ≠ cause.', 'מודד זרימת דם, לא נוירונים ישירות; התגובה מאחרת ב-4–6 שניות; מתאם ≠ סיבתיות.'),
  scene(stage) {
    head(stage);
    stage.definePart({ id: 'magnet', name: B('MRI magnet', 'מגנט ה-MRI'), desc: B('The same scanner as MRI, taking a fast image every 1–2 seconds.', 'אותו סורק כמו ב-MRI, שמצלם תמונה מהירה כל 1–2 שניות.'), color: '#93c5fd', chapters: CH });
    const b = mriScanner(stage, 'magnet', { glow: 0.22 });
    const glow = spot(stage, MOTOR_L, '#f97316', 0.3); glow.visible = false;
    const state = { task: 'rest', since: 0, hist: [] };
    stage.onUpdate((dt, t) => { state.since += dt; glow.material.opacity = 0.4 + 0.4 * clamp01((state.since - 2) / 3); });
    return { home: { pos: V(3.5, 2.5, 6), target: V(0, 0, 0) }, state, actions: taskActions(stage, state, ['rest', 'tap', 'faces', 'see', 'words', 'hear'], glow) };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const sw = Math.min(w * 0.5, h * 0.95);
    const cx = sw * 0.5 + 6, cy = h * 0.5, rx = sw * 0.4, ry = h * 0.42;
    axial(ctx, cx, cy, rx, ry, 't1');
    // BOLD response: rises ~2 s after onset, peaks ~5 s
    const resp = st.task === 'rest' ? 0 : clamp01((st.since - 1.5) / 3.5);
    const spots = TASKS[st.task].xy || [];
    field(ctx, cx - rx, cy - ry, rx * 2, ry * 2, (u, v) => {
      let val = 0;
      for (const [sx, sy] of spots) val += gauss(u, v, sx, sy, 0.05) * resp;
      return val > 0.25 ? [...hot(0.4 + val * 0.6), Math.min(255, val * 400)] : null;
    }, 3);
    // time course
    st.hist.push(resp); if (st.hist.length > 240) st.hist.shift();
    const gx = sw + 24, gw = w - gx - 10, gy = 30, gh = h - 70;
    ctx.strokeStyle = '#334155'; ctx.strokeRect(gx, gy, gw, gh);
    trace(ctx, gx, gy, gw, gh, (x) => { const i = Math.floor(x * (st.hist.length - 1)); return (st.hist[i] ?? 0) * 1.6 - 0.8 + 0.04 * Math.sin(i * 1.7); }, '#f97316', 2);
    label(ctx, L('BOLD signal', 'אות BOLD'), gx, gy - 8, { color: '#cbd5e1', size: 12 });
    label(ctx, L('lags by ~5 s', 'מאחר בכ-5 שניות'), gx, gy + gh + 16, { color: '#94a3b8', size: 10 });
  },
});

// 8. EEG / ERP
const EEG = {
  alert: { name: B('Alert (beta)', 'ער וממוקד (בטא)'), f: 20, a: 0.25 },
  relaxed: { name: B('Relaxed, eyes closed (alpha)', 'רגוע, עיניים עצומות (אלפא)'), f: 10, a: 0.6 },
  sleep: { name: B('Deep sleep (delta)', 'שינה עמוקה (דלתא)'), f: 2, a: 0.9 },
  rem: { name: B('REM sleep (dreaming)', 'שנת REM (חלומות)'), f: 16, a: 0.3 },
  seizure: { name: B('Epileptic seizure', 'התקף אפילפטי'), f: 3, a: 1 },
};
M({
  id: 'eeg', icon: '〰️', name: B('EEG & evoked potentials', 'EEG ופוטנציאלים מעוררים'),
  intro: B('Electrodes on the scalp record the summed electrical activity of millions of cortical neurons. Averaging many responses to a stimulus gives an event-related (evoked) potential.', 'אלקטרודות על הקרקפת רושמות את הפעילות החשמלית המצטברת של מיליוני נוירונים בקליפה. מיצוע של תגובות רבות לגירוי נותן פוטנציאל מעורר (ERP).'),
  facts: { measures: B('Electrical activity of the cortex', 'פעילות חשמלית של הקליפה'), spatial: B('Poor (centimetres)', 'חלשה (סנטימטרים)'), temporal: B('Excellent — milliseconds', 'מצוינת — אלפיות שנייה'), invasive: B('Non-invasive, cheap', 'לא פולשני, זול') },
  tests: [B('Stages of sleep and states of arousal', 'שלבי שינה ומצבי עוררות'), B('Seizures in epilepsy', 'התקפים באפילפסיה'), B('How fast the brain responds to a stimulus (ERP)', 'כמה מהר המוח מגיב לגירוי (ERP)')],
  example: B('EEG defines the sleep stages: fast low waves when awake, alpha when relaxed, large slow delta waves in deep sleep.', 'EEG מגדיר את שלבי השינה: גלים מהירים ונמוכים בערות, אלפא ברגיעה, גלי דלתא גדולים ואיטיים בשינה עמוקה.'),
  limits: B('Hard to tell exactly where the signal comes from; mostly sees the surface of the cortex.', 'קשה לדעת בדיוק מאיפה האות מגיע; רואה בעיקר את פני הקליפה.'),
  scene(stage) {
    head(stage);
    stage.definePart({ id: 'electrodes', name: B('Scalp electrodes', 'אלקטרודות על הקרקפת'), desc: B('Usually 19 or more, placed in a standard pattern (the 10–20 system).', 'בדרך כלל 19 או יותר, ממוקמות בתבנית קבועה (שיטת 10–20).'), color: '#e2e8f0', chapters: CH });
    const g = new THREE.Group();
    for (let i = 0; i < 21; i++) {
      const phi = Math.acos(1 - (i + 0.5) / 21 * 0.9), th = i * 2.4;
      const p = V(Math.sin(phi) * Math.cos(th) * 1.13, Math.cos(phi) * 1.38, Math.sin(phi) * Math.sin(th) * 1.18);
      const e = sphere(0.07, '#e2e8f0'); e.position.copy(p); g.add(e);
      // each wire leaves its electrode outward, runs over the scalp and down the back of the head (the face is at +z), so no
      // wire cuts through the head
      const over = V(p.x * 1.15, Math.max(p.y * 1.2, 1.2) + 0.35, (p.z - 1.0) * 0.5);
      g.add(tube([p, p.clone().multiplyScalar(1.18), ...(p.z > -0.6 ? [over] : []), V(p.x * 0.8, 0.6, -1.6), V(p.x * 0.4, -0.9, -1.5), V(0.2, -2.0, -1.15)], 0.008, '#64748b'));
    }
    stage.add(g, 'electrodes');
    const state = { mode: 'alert', erp: 0 };
    stage.onUpdate((dt) => { if (state.mode === 'erp') state.erp += dt * 4; });
    return {
      home: { pos: V(3, 2.4, 3.4), target: V(0, 0.2, 0) }, state,
      actions: [
        ...Object.entries(EEG).map(([k, v]) => ({ icon: '〰️', label: v.name, radio: true, caption: k === 'rem' ? B('In REM sleep the EEG looks almost like being awake (fast, small waves), yet the person is deeply asleep and the body is paralysed. That is why REM is called “paradoxical sleep”.', 'בשנת REM ה-EEG נראה כמעט כמו בערות (גלים מהירים וקטנים), אבל האדם ישן עמוק והגוף משותק. לכן שנת REM נקראת "שינה פרדוקסלית".') : undefined, run: () => { state.mode = k; } })),
        { icon: '⚡', label: B('ERP: flash a light many times', 'ERP: הבהוב אור פעמים רבות'), radio: true, caption: B('One response is buried in noise, but averaging dozens of trials reveals the evoked potential — e.g. the P300 wave about 300 ms after a meaningful stimulus.', 'תגובה אחת קבורה ברעש, אבל מיצוע של עשרות ניסיונות חושף את הפוטנציאל המעורר — למשל גל ה-P300 כ-300 אלפיות שנייה אחרי גירוי משמעותי.'), run: () => { state.mode = 'erp'; state.erp = 1; } },
      ],
    };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    if (st.mode === 'erp') {
      const n = Math.max(1, Math.floor(st.erp));
      const erp = (x) => -0.35 * gauss(x, 0, 0.1, 0, 0.03) + 0.7 * gauss(x, 0, 0.3, 0, 0.06) - 0.2 * gauss(x, 0, 0.2, 0, 0.03);
      const gy = 30, gh = h - 70, gx = 30, gw = w - 50;
      ctx.strokeStyle = '#334155'; ctx.strokeRect(gx, gy, gw, gh);
      const nz = (x, k) => (Math.sin(x * 97 + k * 13.7) * 0.5 + Math.sin(x * 211 + k * 3.1) * 0.5);
      trace(ctx, gx, gy, gw, gh, (x) => erp(x * 0.6) + nz(x, n) * 0.6, 'rgba(148,163,184,.5)', 1);
      trace(ctx, gx, gy, gw, gh, (x) => erp(x * 0.6) + nz(x, n) * 0.6 / Math.sqrt(n), '#facc15', 2.2);
      const px = gx + gw * (0.3 / 0.6);
      ctx.strokeStyle = 'rgba(250,204,21,.4)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px, gy + gh); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, 'P300', px + 4, gy + 16, { color: '#facc15', size: 12 });
      label(ctx, `${L('Trials averaged', 'ניסיונות שמוצעו')}: ${n}`, gx, gy - 10, { color: '#e2e8f0', size: 13 });
      label(ctx, L('gray = single trial · yellow = average', 'אפור = ניסיון בודד · צהוב = ממוצע'), gx, h - 12, { color: '#94a3b8', size: 11 });
      return;
    }
    const m = EEG[st.mode];
    const rows = ['Fp1', 'C3', 'O1', 'T4'];
    rows.forEach((name, r) => {
      const y = 12 + r * ((h - 30) / rows.length), hh = (h - 30) / rows.length;
      label(ctx, name, 6, y + hh / 2 + 4, { color: '#94a3b8', size: 11 });
      trace(ctx, 40, y, w - 50, hh, (x) => {
        const tt = x * 2 + t;
        let v = m.a * Math.sin(tt * m.f * Math.PI * 2 + r) * (0.7 + 0.3 * Math.sin(tt * 1.3 + r));
        v += 0.12 * Math.sin(tt * 53 + r * 7) + 0.08 * Math.sin(tt * 31 + r);
        if (st.mode === 'seizure') v = Math.sign(Math.sin(tt * m.f * Math.PI * 2)) * 0.6 + (Math.sin(tt * m.f * Math.PI * 2) > 0.95 ? 0.4 : 0) + 0.1 * Math.sin(tt * 40);
        if (st.mode === 'relaxed' && r === 2) v *= 1.4;
        return v * 0.8;
      }, '#22d3ee', 1.4);
    });
    label(ctx, L(m.name.en, m.name.he), w - 8, h - 6, { color: '#cbd5e1', size: 12, align: 'right' });
  },
});

// 9. MEG
M({
  id: 'meg', icon: '🧲', name: B('Magnetoencephalography (MEG)', 'מגנטואנצפלוגרפיה (MEG)'),
  intro: B('Very sensitive sensors (SQUIDs) in a helmet pick up the tiny magnetic fields produced by electrical currents in the brain.', 'חיישנים רגישים מאוד (SQUID) בקסדה קולטים את השדות המגנטיים הזעירים שנוצרים מזרמים חשמליים במוח.'),
  facts: { measures: B('Brain activity (magnetic fields)', 'פעילות מוחית (שדות מגנטיים)'), spatial: B('A few millimetres (better than EEG)', 'כמה מילימטרים (טוב יותר מ-EEG)'), temporal: B('Milliseconds', 'אלפיות שנייה'), invasive: B('Non-invasive, but very expensive and needs a shielded room', 'לא פולשני, אבל יקר מאוד ודורש חדר ממוגן') },
  tests: [B('Exactly when AND roughly where the brain responds', 'מתי בדיוק, ובערך איפה, המוח מגיב'), B('Locating the source of seizures before surgery', 'איתור מקור ההתקפים לפני ניתוח')],
  example: B('Touching the right hand produces a field pattern over the LEFT somatosensory cortex within about 20–50 ms.', 'נגיעה ביד ימין יוצרת תבנית שדה מעל הקליפה הסומטו-סנסורית השמאלית תוך כ-20–50 אלפיות שנייה.'),
  limits: B('Best for sources near the surface; huge, costly equipment.', 'הכי טוב למקורות קרובים לפני השטח; ציוד ענק ויקר.'),
  scene(stage) {
    head(stage);
    stage.definePart({ id: 'helmet', name: B('MEG helmet with SQUID sensors', 'קסדת MEG עם חיישני SQUID'), desc: B('Around 300 sensors, cooled with liquid helium.', 'כ-300 חיישנים, מקוררים בהליום נוזלי.'), color: '#cbd5e1', chapters: CH });
    const helm = new THREE.Mesh(new THREE.SphereGeometry(1.55, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), mat('#cbd5e1', { opacity: 0.35, side: THREE.DoubleSide }));
    helm.material.depthWrite = false; helm.position.y = 0.15; stage.add(helm, 'helmet');
    const dewarG = new THREE.LatheGeometry([[0, 4.6], [0.9, 4.55], [1.05, 4.3], [1.05, 2.6], [1.45, 2.1], [1.6, 1.4], [1.62, 0.9]].map(([x, y]) => new THREE.Vector2(x, y)), 48);
    const dewar = new THREE.Mesh(dewarG, mat('#e2e8f0', { opacity: 0.75, rough: 0.3, side: THREE.DoubleSide })); dewar.material.depthWrite = false; stage.add(dewar, 'helmet');
    { const sq = []; for (let k = 0; k < 90; k++) { const t = Math.acos(1 - (k / 90) * 1.0), a = k * 2.399; const p = V(Math.sin(t) * Math.cos(a), Math.cos(t), Math.sin(t) * Math.sin(a)).multiplyScalar(1.5); if (p.y < 0.2) continue; sq.push(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8).applyMatrix4(new THREE.Matrix4().compose(p.clone().add(V(0, 0.15, 0)), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), p.clone().normalize()), V(1, 1, 1)))); } stage.add(new THREE.Mesh(mergeGeometries(sq), mat('#64748b', { rough: 0.4 })), 'helmet'); } // the SQUID sensors, all over the helmet
    const glow = spot(stage, V(0.55, 0.65, 0), '#38bdf8', 0.25);
    const state = { stim: 'touch' };
    return { home: { pos: V(3.5, 2.6, 4.2), target: V(0, 0.5, 0) }, state, actions: [
      { icon: '✋', label: B('Touch the right hand', 'נגיעה ביד ימין'), radio: true, run: () => { state.stim = 'touch'; glow.position.set(0.55, 0.65, 0); } },
      { icon: '🔔', label: B('Play a tone', 'השמעת צליל'), radio: true, run: () => { state.stim = 'tone'; glow.position.copy(TEMPORAL_L); } },
      { icon: '🖼️', label: B('Show a picture', 'הצגת תמונה'), radio: true, caption: B('About 100 ms after a picture appears, a field pattern rises over the back of the head (the visual cortex). MEG times it to the millisecond and places it within a few millimetres.', 'כ-100 אלפיות שנייה אחרי שתמונה מופיעה, תבנית שדה עולה מעל אחורי הראש (קליפת הראייה). MEG מתזמן אותה לאלפית השנייה וממקם אותה בדיוק של כמה מילימטרים.'), run: () => { state.stim = 'see'; glow.position.copy(OCCIPITAL); } },
    ] };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const s = Math.min(w, h) * 0.86, x0 = (w - s) / 2, y0 = (h - s) / 2 + 6;
    const dip = st.stim === 'touch' ? [[0.33, 0.42, 0.42, 0.52]] : st.stim === 'see' ? [[0.4, 0.82, 0.6, 0.82]] : [[0.18, 0.45, 0.22, 0.6], [0.82, 0.45, 0.78, 0.6]];
    const k = Math.sin(t * 4) * 0.5 + 0.5;
    field(ctx, x0, y0, s, s, (u, v) => {
      const dx = u - 0.5, dy = v - 0.5;
      if (dx * dx + dy * dy > 0.23) return null;
      let val = 0;
      for (const [ax, ay, bx, by] of dip) val += gauss(u, v, ax, ay, 0.08) - gauss(u, v, bx, by, 0.08);
      val *= 0.3 + 0.7 * k;
      return val > 0 ? [255, 255 * (1 - val), 255 * (1 - val)] : [255 * (1 + val), 255 * (1 + val), 255];
    }, 4);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w / 2, y0 + s / 2, s * 0.48, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2 - 10, y0 + s * 0.03); ctx.lineTo(w / 2, y0 - 10); ctx.lineTo(w / 2 + 10, y0 + s * 0.03); ctx.stroke();
    label(ctx, L('L', 'ש'), x0 + 6, y0 + s / 2, { color: '#94a3b8', size: 12 });
    label(ctx, L('red = field out, blue = field in (top view, nose up)', 'אדום = שדה החוצה, כחול = שדה פנימה (מבט מלמעלה, אף למעלה)'), 8, h - 6, { color: '#94a3b8', size: 11 });
  },
});

// 10. Single-cell recording
M({
  id: 'singlecell', icon: '📍', name: B('Single-cell recording', 'רישום מתא בודד'),
  intro: B('A microelectrode placed next to (or inside) one neuron records its action potentials while a stimulus is shown.', 'מיקרו-אלקטרודה הממוקמת ליד נוירון אחד (או בתוכו) רושמת את פוטנציאלי הפעולה שלו בזמן שמוצג גירוי.'),
  facts: { measures: B('Action potentials of one neuron', 'פוטנציאלי פעולה של נוירון אחד'), spatial: B('Micrometres (one cell)', 'מיקרומטרים (תא אחד)'), temporal: B('Under a millisecond', 'פחות מאלפית שנייה'), invasive: B('Very — mostly animals, or patients already in surgery', 'מאוד — בעיקר בבעלי חיים, או במטופלים שכבר עוברים ניתוח') },
  tests: [B('What exact stimulus makes a neuron fire?', 'איזה גירוי בדיוק גורם לנוירון לירות?'), B('How neurons code features like orientation or location', 'איך נוירונים מקודדים תכונות כמו כיוון או מיקום')],
  example: B('Hubel and Wiesel found neurons in the visual cortex that fire most for a bar at one particular orientation.', 'הובל ויזל מצאו נוירונים בקליפת הראייה שיורים הכי הרבה לפס בכיוון מסוים אחד.'),
  limits: B('Only one (or a few) cells at a time; invasive.', 'רק תא אחד (או מעטים) בכל פעם; פולשני.'),
  scene(stage) {
    stage.definePart({ id: 'neuron', name: B('Neuron in visual cortex', 'נוירון בקליפת הראייה'), desc: B('Its "preferred" stimulus is a bar tilted at 45°.', 'הגירוי "המועדף" שלו הוא פס מוטה ב-45°.'), color: '#e11d48', chapters: [6] });
    stage.definePart({ id: 'electrode', name: B('Microelectrode', 'מיקרו-אלקטרודה'), desc: B('A glass or metal tip less than 1 µm wide.', 'קצה מזכוכית או מתכת ברוחב של פחות ממיקרומטר.'), color: '#cbd5e1', chapters: CH });
    stage.definePart({ id: 'screen', name: B('Stimulus screen', 'מסך הגירוי'), desc: B('Bars of light at different orientations are shown to the animal.', 'מוצגים לבעל החיים פסי אור בכיוונים שונים.'), color: '#0f172a', chapters: [6] });
    const n = makeNeuron({ axonLength: 3, myelin: false, seed: 4, dendriteCount: 6, scale: 0.6 });
    stage.add(n.group, 'neuron');
    const el = new THREE.Mesh(new THREE.ConeGeometry(0.06, 3, 12), mat('#cbd5e1', { metal: 0.6 })); el.position.set(0.45, 1.6, 0.2); el.rotation.z = -0.25; el.rotation.x = Math.PI;
    stage.add(el, 'electrode');
    const scr = box(2.4, 1.8, 0.1, '#0f172a'); scr.position.set(-3.2, 1, 0); scr.rotation.y = 0.6; stage.add(scr, 'screen');
    const bar = box(0.25, 1.3, 0.02, '#fef9c3', { emissive: '#fef9c3' }); bar.position.set(-3.15, 1, 0.08); bar.rotation.y = 0.6; stage.root.add(bar);
    const state = { ori: 45, spikes: [] };
    const setOri = (o) => { state.ori = o; bar.visible = o >= 0; if (o < 0) return; bar.rotation.set(0, 0.6, 0); bar.rotateZ(THREE.MathUtils.degToRad(-o)); };
    setOri(45);
    stage.onUpdate((dt, t) => { n.soma.material.emissive.set('#e11d48').multiplyScalar(state.flash > 0 ? 0.8 : 0); state.flash = Math.max(0, (state.flash || 0) - dt * 6); });
    return { home: { pos: V(0, 1.5, 7), target: V(-1, 0.5, 0) }, state, actions: [0, 45, 90, 135].map((o) => ({ icon: '📏', label: B(`Bar at ${o}°`, `פס ב-${o}°`), radio: true, caption: o === 45 ? B('The preferred orientation: the neuron fires rapidly.', 'הכיוון המועדף: הנוירון יורה בקצב מהיר.') : B('Far from the preferred orientation, the neuron fires little.', 'רחוק מהכיוון המועדף, הנוירון יורה מעט.'), run: () => setOri(o) })).concat([{ icon: '⬛', label: B('Blank screen', 'מסך ריק'), radio: true, caption: B('With nothing on the screen the neuron still fires now and then (spontaneous activity, a few spikes a second). A response only counts if it rises above this baseline.', 'כשאין כלום על המסך הנוירון עדיין יורה מדי פעם (פעילות ספונטנית, כמה ספייקים בשנייה). תגובה נחשבת רק אם היא עולה מעל קו הבסיס הזה.'), run: () => setOri(-1) }]) };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const tune = (o) => o < 0 ? 3 : 2 + 38 * Math.exp(-(((((o - 45) % 180) + 270) % 180 - 90) ** 2) / (2 * 22 ** 2));
    const rate = tune(st.ori);
    // spike train trace
    const gx = 10, gw = w * 0.6, gh = h * 0.6, gy = 20;
    const win = 2; // seconds shown
    const spikeAt = (k) => { const r = noise(k * 1.37 + st.ori); return r < rate / 200; };
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= gw; i++) {
      const k = Math.floor((t - win + (i / gw) * win) * 200);
      const v = spikeAt(Math.abs(k)) ? -0.9 : 0.05 * Math.sin(k * 0.7);
      ctx.lineTo(gx + i, gy + gh / 2 + v * gh / 2);
    }
    ctx.stroke();
    if (spikeAt(Math.abs(Math.floor(t * 200)))) st.flash = 1;
    label(ctx, `${L('Firing rate', 'קצב ירי')}: ~${Math.round(rate)} ${L('spikes/s', 'ספייקים/שנ\'')}`, gx, h - 14, { color: '#e2e8f0', size: 13 });
    // tuning curve
    const tx = w * 0.66, tw = w * 0.31, ty = 24, th = h * 0.62;
    ctx.strokeStyle = '#334155'; ctx.strokeRect(tx, ty, tw, th);
    trace(ctx, tx, ty, tw, th, (x) => tune(x * 180) / 20 - 1, '#f472b6', 2);
    if (st.ori < 0) { label(ctx, L('no stimulus: baseline only', 'אין גירוי: קו בסיס בלבד'), tx, ty + th + 30, { color: '#94a3b8', size: 10 }); return; }
    const mx = tx + (st.ori / 180) * tw, my = ty + th / 2 - (tune(st.ori) / 20 - 1) * th / 2;
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
    label(ctx, L('tuning curve', 'עקומת כוונון'), tx, ty - 8, { color: '#cbd5e1', size: 12 });
    label(ctx, '0°            90°           180°', tx, ty + th + 14, { color: '#94a3b8', size: 10 });
  },
});

// 11. TMS
const TMS = {
  motor: { at: MOTOR_L, name: B('Over the left motor cortex', 'מעל הקליפה המוטורית השמאלית'), cap: B('A pulse over the hand area makes the RIGHT hand twitch — measured as a motor evoked potential (MEP).', 'פולס מעל אזור היד גורם ליד ימין להתעוות — נמדד כפוטנציאל מעורר מוטורי (MEP).') },
  visual: { at: OCCIPITAL, name: B('Over the visual cortex', 'מעל קליפת הראייה'), cap: B('People see brief flashes of light that are not really there (phosphenes).', 'אנשים רואים הבזקי אור קצרים שלא באמת קיימים (פוספנים).') },
  dlpfc: { at: PREFRONTAL, name: B('Over the prefrontal cortex (rTMS)', 'מעל קליפת המצח הקדמית (rTMS)'), cap: B('Thousands of pulses a day over the left prefrontal cortex, for 4–6 weeks, lift depression in many people for whom medicines did not work. Nothing is felt at the moment of the pulse; the change builds up over weeks.', 'אלפי פולסים ביום מעל קליפת המצח הקדמית השמאלית, במשך 4–6 שבועות, מקלים על דיכאון אצל אנשים רבים שתרופות לא עזרו להם. ברגע הפולס לא מרגישים דבר; השינוי מצטבר לאורך שבועות.') },
  broca: { at: BROCA, name: B('Over Broca\'s area', 'מעל אזור ברוקה'), cap: B('Repeated pulses can briefly interrupt speech — a temporary "virtual lesion".', 'פולסים חוזרים יכולים לקטוע לרגע את הדיבור — "פגיעה וירטואלית" זמנית.') },
};
M({
  id: 'tms', icon: '➰', name: B('Transcranial magnetic stimulation (TMS)', 'גירוי מגנטי טרנס-גולגולתי (TMS)'),
  intro: B('A coil held over the head produces a brief, strong magnetic pulse that induces electrical current in the cortex underneath.', 'סליל שמוחזק מעל הראש יוצר פולס מגנטי קצר וחזק שמשרה זרם חשמלי בקליפה שמתחתיו.'),
  facts: { measures: B('Causes activity (or a temporary disruption)', 'גורם לפעילות (או להפרעה זמנית)'), spatial: B('About 1 cm of cortex', 'כ-1 ס"מ של קליפה'), temporal: B('Milliseconds', 'אלפיות שנייה'), invasive: B('Non-invasive (small risk of seizures)', 'לא פולשני (סיכון קטן להתקפים)') },
  tests: [B('Is an area NEEDED for a task? (a reversible "lesion")', 'האם אזור נחוץ למשימה? ("פגיעה" הפיכה)'), B('Treatment: repeated TMS (rTMS) for depression', 'טיפול: TMS חוזר (rTMS) לדיכאון')],
  example: B('Repeated TMS produces long-lasting changes in cortical activity and is used to treat depression.', 'TMS חוזר יוצר שינויים ארוכי טווח בפעילות הקליפה ומשמש לטיפול בדיכאון.'),
  limits: B('Reaches only the surface of the cortex; the effects spread a little.', 'מגיע רק לפני השטח של הקליפה; ההשפעות מתפשטות מעט.'),
  scene(stage) {
    head(stage);
    stage.definePart({ id: 'coil', name: B('Figure-8 coil', 'סליל בצורת 8'), desc: B('The strongest field is under the centre, where the two loops meet.', 'השדה החזק ביותר נמצא מתחת למרכז, היכן ששתי הלולאות נפגשות.'), color: '#3b82f6', chapters: CH });
    const coil = new THREE.Group();
    const a = torus(0.42, 0.09, '#3b82f6'); a.position.x = -0.44; const b = torus(0.42, 0.09, '#3b82f6'); b.position.x = 0.44;
    const handle = cyl(0.08, 0.08, 1.2, '#1e3a8a'); handle.rotation.x = Math.PI / 2; handle.position.z = -0.8;
    coil.add(a, b, handle);
    stage.add(coil, 'coil');
    const glow = spot(stage, MOTOR_L, '#facc15', 0.22); glow.visible = false;
    const rings = [0, 1, 2].map(() => { const r = torus(0.2, 0.015, '#93c5fd', { opacity: 0.8 }); stage.root.add(r); return r; });
    const state = { site: 'motor', pulse: -1 };
    const place = (k) => {
      state.site = k;
      const p = TMS[k].at.clone();
      const n = p.clone().normalize();
      coil.position.copy(p.clone().add(n.clone().multiplyScalar(0.75)));
      coil.lookAt(p);
      glow.position.copy(p);
      rings.forEach((r) => { r.position.copy(coil.position); r.quaternion.copy(coil.quaternion); });
    };
    place('motor');
    stage.onUpdate((dt) => {
      if (state.pulse >= 0) state.pulse += dt;
      const k = state.pulse;
      glow.visible = k >= 0 && k < 1.2;
      rings.forEach((r, i) => { const s = k >= 0 ? (k * 3 + i * 0.3) % 1.5 : 0; r.visible = k >= 0 && k < 1; r.scale.setScalar(1 + s * 2); r.material.opacity = 0.8 * (1 - s / 1.5); });
    });
    return { home: { pos: V(3, 2.5, 3.5), target: V(0, 0.3, 0) }, state, actions: [
      ...Object.entries(TMS).map(([k, v]) => ({ icon: '📍', label: v.name, radio: true, caption: v.cap, run: () => place(k) })),
      { icon: '⚡', label: B('Fire a pulse', 'שליחת פולס'), run: () => { state.pulse = 0; return undefined; }, caption: null },
    ].map((x) => (x.caption === null ? { ...x, caption: undefined } : x)) };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const k = st.pulse;
    const gx = 20, gy = 30, gw = w - 40, gh = h - 80;
    ctx.strokeStyle = '#334155'; ctx.strokeRect(gx, gy, gw, gh);
    if (st.site === 'motor') {
      trace(ctx, gx, gy, gw, gh, (x) => {
        const ms = x * 100; // 0–100 ms after pulse
        if (k < 0 || k > 6) return 0.02 * Math.sin(x * 90);
        let v = ms < 2 ? 0.9 : 0;
        v += 0.7 * gauss(ms, 0, 22, 0, 2.5) - 0.6 * gauss(ms, 0, 28, 0, 3);
        return v + 0.02 * Math.sin(x * 90);
      }, '#22d3ee', 2);
      label(ctx, L('Muscle response in the right hand (MEP), 0–100 ms after the pulse', 'תגובת השריר ביד ימין (MEP), ‏0–100 אלפיות שנייה אחרי הפולס'), gx, gy - 10, { color: '#e2e8f0', size: 12 });
    } else if (st.site === 'visual') {
      const on = k >= 0 && k < 1;
      if (on) { const g = ctx.createRadialGradient(w * 0.55, h * 0.45, 2, w * 0.55, h * 0.45, 60); g.addColorStop(0, 'rgba(255,255,220,1)'); g.addColorStop(1, 'rgba(255,255,220,0)'); ctx.fillStyle = g; ctx.fillRect(gx, gy, gw, gh); }
      label(ctx, on ? L('“I see a flash of light!”', '"אני רואה הבזק אור!"') : L('Fire a pulse to see what the person reports', 'שלחו פולס כדי לראות מה האדם מדווח'), w / 2, h / 2 + 50, { color: '#fde68a', size: 14, align: 'center' });
    } else if (st.site === 'dlpfc') {
      // illustrative: depression score over 6 weeks of daily sessions
      const wk = [24, 22, 19, 16, 13, 11, 10];
      const shown = k < 0 ? 1 : Math.min(wk.length, 1 + Math.floor(k / 0.6));
      ctx.fillStyle = '#a78bfa';
      for (let i = 0; i < shown; i++) { const bh = (wk[i] / 26) * gh; ctx.fillRect(gx + 10 + i * (gw - 20) / wk.length, gy + gh - bh, (gw - 20) / wk.length - 8, bh); }
      label(ctx, L('Depression score, week 0 → 6 of daily rTMS (illustrative)', 'ציון דיכאון, שבוע 0 ← 6 של rTMS יומי (להמחשה)'), gx, gy - 10, { color: '#e2e8f0', size: 12 });
    } else {
      const on = k >= 0 && k < 2;
      const words = L('The quick brown fox jumps over…', 'השועל החום המהיר קופץ מעל…');
      label(ctx, on ? words.slice(0, 12) + '… ' + L('(speech stops)', '(הדיבור נעצר)') : words, w / 2, h / 2, { color: on ? '#fca5a5' : '#e2e8f0', size: 15, align: 'center' });
    }
  },
});

// 12. Deep brain stimulation
M({
  id: 'dbs', icon: '🔌', name: B('Deep brain stimulation (DBS)', 'גירוי מוחי עמוק (DBS)'),
  intro: B('An electrode is implanted deep in the brain and connected to a pacemaker-like stimulator under the collarbone.', 'אלקטרודה מושתלת עמוק במוח ומחוברת לממריץ דמוי קוצב לב מתחת לעצם הבריח.'),
  facts: { measures: B('Changes activity in a deep target', 'משנה פעילות במטרה עמוקה'), spatial: B('Millimetres', 'מילימטרים'), temporal: B('Continuous (on/off)', 'רציף (מופעל/כבוי)'), invasive: B('Yes — brain surgery', 'כן — ניתוח מוח') },
  tests: [B('Treats movement disorders such as Parkinson\'s disease tremor', 'טיפול בהפרעות תנועה כמו רעד במחלת פרקינסון'), B('Shows which circuits control a symptom', 'מראה אילו מעגלים שולטים בסימפטום')],
  example: B('Stimulating the subthalamic nucleus can reduce tremor and rigidity in Parkinson\'s disease within seconds.', 'גירוי הגרעין התת-תלמי יכול להפחית רעד ונוקשות במחלת פרקינסון תוך שניות.'),
  limits: B('Surgery risks; it treats symptoms rather than curing the disease.', 'סיכוני ניתוח; מטפל בסימפטומים ולא מרפא את המחלה.'),
  scene(stage) {
    head(stage, { brainOpacity: 0.45 });
    stage.definePart({ id: 'lead', name: B('Electrode lead', 'מוביל האלקטרודה'), desc: B('Its tip sits in the subthalamic nucleus.', 'הקצה שלו נמצא בגרעין התת-תלמי.'), color: '#94a3b8', chapters: [8] });
    stage.definePart({ id: 'stn', name: B('Subthalamic nucleus (target)', 'הגרעין התת-תלמי (המטרה)'), desc: B('Part of the basal ganglia circuit that goes wrong in Parkinson\'s disease.', 'חלק ממעגל הגרעינים הבסיסיים שמשתבש במחלת פרקינסון.'), color: '#f59e0b', chapters: [8] });
    stage.definePart({ id: 'ipg', name: B('Stimulator (pulse generator)', 'ממריץ (מחולל פולסים)'), desc: B('Battery-powered, implanted under the skin of the chest.', 'מופעל בסוללה, מושתל מתחת לעור החזה.'), color: '#64748b', chapters: [8] });
    const target = spot(stage, STN, '#f59e0b', 0.1, 'stn');
    stage.add(tube([V(0.3, 1.5, 0.15), V(0.22, 0.6, 0.12), STN], 0.025, '#94a3b8'), 'lead');
    stage.add(tube([V(0.3, 1.5, 0.15), V(0.9, 1.2, -0.3), V(1.0, -0.5, -0.6), V(0.9, -2.2, 0.2), V(0.9, -2.6, 0.35)], 0.02, '#94a3b8'), 'lead');
    const ipg = box(0.6, 0.45, 0.15, '#64748b'); ipg.position.set(0.9, -2.75, 0.4); stage.add(ipg, 'ipg');
    const chest = capsule(1.5, 1.5, '#e9c6ad', { opacity: 0.15 }); chest.material.depthWrite = false; chest.scale.set(1.2, 1, 0.6); chest.position.y = -3.6; stage.root.add(chest);
    const state = { on: false, low: false };
    stage.onUpdate((dt, t) => { target.material.emissive.set('#f59e0b').multiplyScalar(state.on ? 0.5 + 0.5 * Math.sin(t * 30) : 0.1); });
    return { home: { pos: V(3.5, 0, 5.5), target: V(0, -0.8, 0) }, state, actions: [
      { icon: '🔋', label: B('Stimulator ON', 'הפעלת הממריץ'), toggle: true, caption: B('With stimulation on, the tremor almost disappears; switch it off and it returns.', 'כשהגירוי מופעל, הרעד כמעט נעלם; כשמכבים, הוא חוזר.'), run: (on) => { state.on = on; } },
      { icon: '🎚️', label: B('Slow pulses (20 Hz)', 'פולסים איטיים (20 הרץ)'), toggle: true, caption: B('The rate matters: about 130 pulses a second calms the tremor, but slow pulses (20 a second) do almost nothing. Doctors tune the rate, strength and contact for each patient.', 'הקצב חשוב: כ-130 פולסים בשנייה מרגיעים את הרעד, אבל פולסים איטיים (20 בשנייה) כמעט לא עושים דבר. רופאים מכווננים את הקצב, העוצמה ונקודת המגע לכל מטופל.'), run: (on) => { state.low = on; } },
    ] };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const gx = 20, gy = 30, gw = w - 40, gh = h - 80;
    ctx.strokeStyle = '#334155'; ctx.strokeRect(gx, gy, gw, gh);
    const amp = st.on ? (st.low ? 0.65 : 0.08) : 0.8;
    trace(ctx, gx, gy, gw, gh, (x) => amp * Math.sin((x * 3 + t) * 5 * Math.PI * 2) * (0.8 + 0.2 * Math.sin(x * 7 + t)) + 0.03 * Math.sin(x * 211), st.on ? '#22c55e' : '#f97316', 1.8);
    label(ctx, L('Hand tremor (accelerometer), about 5 shakes per second', 'רעד ביד (מד תאוצה), כ-5 רעידות בשנייה'), gx, gy - 10, { color: '#e2e8f0', size: 12 });
    label(ctx, st.on && st.low ? L('DBS ON at 20 Hz — barely helps', 'DBS מופעל ב-20 הרץ — כמעט לא עוזר') : st.on ? L('DBS ON (130 Hz) — tremor suppressed', 'DBS מופעל (130 הרץ) — הרעד מדוכא') : L('DBS OFF — Parkinsonian tremor', 'DBS כבוי — רעד פרקינסוני'), gx, h - 14, { color: st.on ? '#86efac' : '#fdba74', size: 13 });
  },
});

// 13. Microdialysis
M({
  id: 'microdialysis', icon: '🧪', name: B('Microdialysis', 'מיקרודיאליזה'),
  intro: B('A thin probe with a semi-permeable tip is placed in a brain area. Fluid flowing through it collects chemicals from around the tip for analysis.', 'מחדירים לאזור במוח בדיקה דקה עם קצה חדיר למחצה. נוזל שזורם בה אוסף כימיקלים מסביב לקצה לצורך ניתוח.'),
  facts: { measures: B('Neurotransmitter levels in one small area', 'רמות מוליכים עצביים באזור קטן אחד'), spatial: B('About 1 mm around the tip', 'כ-1 מ"מ סביב הקצה'), temporal: B('Minutes (one sample every 10–20 min)', 'דקות (דגימה כל 10–20 דקות)'), invasive: B('Yes — mostly in animals', 'כן — בעיקר בבעלי חיים') },
  tests: [B('Does a drug or behaviour change the release of a neurotransmitter?', 'האם סם או התנהגות משנים את שחרור המוליך העצבי?')],
  example: B('Drugs of abuse such as cocaine and amphetamine raise dopamine in the nucleus accumbens.', 'סמים כמו קוקאין ואמפטמין מעלים את רמת הדופמין בגרעין האקומבנס.'),
  limits: B('Slow; one location only; the probe damages a little tissue.', 'איטי; מיקום אחד בלבד; הבדיקה פוגעת מעט ברקמה.'),
  scene(stage) {
    head(stage, { brainOpacity: 0.45 });
    stage.definePart({ id: 'probe', name: B('Microdialysis probe', 'בדיקת מיקרודיאליזה'), desc: B('Fluid goes in, picks up molecules through the membrane at the tip, and comes out into a collecting vial.', 'נוזל נכנס, אוסף מולקולות דרך הממברנה שבקצה, ויוצא אל מבחנת איסוף.'), color: '#cbd5e1', chapters: CH });
    stage.definePart({ id: 'nacc', name: B('Nucleus accumbens', 'גרעין האקומבנס'), desc: B('A key reward area, rich in dopamine terminals.', 'אזור תגמול מרכזי, עשיר בטרמינלים של דופמין.'), color: '#f59e0b', chapters: [4, 14] });
    spot(stage, ACCUMBENS, '#f59e0b', 0.12, 'nacc');
    stage.add(tube([V(0.15, 1.6, 0.5), V(0.13, 0.7, 0.45), ACCUMBENS], 0.03, '#cbd5e1'), 'probe');
    stage.add(tube([V(0.15, 1.6, 0.5), V(0.5, 2.1, 0.6), V(1.6, 2.2, 0.6), V(2.1, 1.2, 0.6)], 0.02, '#38bdf8'), 'probe');
    const vial = cyl(0.18, 0.18, 0.6, '#e0f2fe', { opacity: 0.6 }); vial.position.set(2.1, 0.85, 0.6); stage.add(vial, 'probe');
    flow(stage, new THREE.CatmullRomCurve3([V(0.15, 1.6, 0.5), V(0.13, 0.7, 0.45), ACCUMBENS, V(0.17, 0.7, 0.45), V(0.5, 2.1, 0.6), V(1.6, 2.2, 0.6), V(2.1, 1.2, 0.6)]), { color: '#38bdf8', count: 14, size: 0.1, speed: 0.15 });
    const state = { inj: -1, drug: 'cocaine' };
    stage.onUpdate((dt) => { if (state.inj >= 0) state.inj += dt; });
    return { home: { pos: V(3.5, 1.8, 4.5), target: V(0.6, 0.6, 0.3) }, state, actions: [
      { icon: '💉', label: B('Inject cocaine', 'הזרקת קוקאין'), caption: B('Cocaine blocks dopamine reuptake, so dopamine piles up outside the cells — each sample shows a higher level.', 'קוקאין חוסם את הקליטה מחדש של דופמין, ולכן הדופמין מצטבר מחוץ לתאים — כל דגימה מראה רמה גבוהה יותר.'), run: () => { state.inj = 0; state.drug = 'cocaine'; } },
      { icon: '💊', label: B('Inject amphetamine', 'הזרקת אמפטמין'), caption: B('Amphetamine does more than block reuptake: it makes the transporters run backwards and push dopamine out, so the rise is bigger and lasts longer.', 'אמפטמין עושה יותר מחסימת קליטה מחדש: הוא גורם למובילים לפעול הפוך ולדחוף דופמין החוצה, ולכן העלייה גדולה וארוכה יותר.'), run: () => { state.inj = 0; state.drug = 'amph'; } },
      { icon: '💧', label: B('Inject salt water (control)', 'הזרקת מי מלח (ביקורת)'), caption: B('The control: the same injection with no drug. The level stays near 100%, which shows the rise came from the drug, not from the stress of the injection.', 'הביקורת: אותה הזרקה בלי סם. הרמה נשארת סביב 100%, וזה מראה שהעלייה באה מהסם ולא מהלחץ של ההזרקה.'), run: () => { state.inj = 0; state.drug = 'saline'; } },
    ] };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h);
    const gx = 44, gy = 24, gw = w - 60, gh = h - 70;
    ctx.strokeStyle = '#334155'; ctx.strokeRect(gx, gy, gw, gh);
    const n = 12; // samples, every 20 min → 0–240 min; injection after sample 3
    const shown = st.inj < 0 ? 3 : Math.min(n, 3 + Math.floor(st.inj / 0.8));
    const peak = { cocaine: [330, 6], amph: [370, 14], saline: [12, 1] }[st.drug || 'cocaine'];
    const level = (i) => (i < 3 ? 100 + 6 * Math.sin(i * 2) : 100 + peak[0] * Math.exp(-((i - 4.5) ** 2) / peak[1]) + (st.drug === 'saline' ? 5 * Math.sin(i * 2) : 0));
    for (let i = 0; i < shown; i++) {
      const v = level(i), bh = (v / 480) * gh, bw = gw / n - 6;
      ctx.fillStyle = i < 3 ? '#64748b' : st.drug === 'saline' ? '#38bdf8' : st.drug === 'amph' ? '#ef4444' : '#f59e0b';
      ctx.fillRect(gx + i * (gw / n) + 3, gy + gh - bh, bw, bh);
    }
    const y100 = gy + gh - (100 / 480) * gh;
    ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(gx, y100); ctx.lineTo(gx + gw, y100); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, '100%', 6, y100 + 4, { color: '#94a3b8', size: 11 });
    label(ctx, L('Dopamine in the nucleus accumbens (% of baseline), one bar = one 20-min sample', 'דופמין בגרעין האקומבנס (% מקו הבסיס), עמודה = דגימה של 20 דקות'), gx, gy - 8, { color: '#e2e8f0', size: 11 });
    label(ctx, L('▲ injection', '▲ הזרקה'), gx + 3 * (gw / n), gy + gh + 16, { color: '#fbbf24', size: 11 });
    label(ctx, L('illustrative data', 'נתונים להמחשה'), w - 8, h - 6, { color: '#64748b', size: 10, align: 'right' });
  },
});

// 14. Twin & adoption studies
M({
  id: 'twins', icon: '👯', name: B('Twin & adoption studies', 'מחקרי תאומים ואימוץ'),
  intro: B('Identical (monozygotic, MZ) twins share all their genes; fraternal (dizygotic, DZ) twins share about half. Comparing how often both twins have a trait (the concordance rate) shows how heritable it is.', 'תאומים זהים (חד-ביציים, MZ) חולקים את כל הגנים; תאומים לא זהים (דו-ביציים, DZ) חולקים כמחצית. השוואה של כמה פעמים לשני התאומים יש את התכונה (שיעור ההתאמה) מראה עד כמה היא תורשתית.'),
  facts: { measures: B('Contribution of genes vs environment', 'תרומת הגנים מול הסביבה'), spatial: B('—', '—'), temporal: B('Years (life histories)', 'שנים (סיפורי חיים)'), invasive: B('No — questionnaires and records', 'לא — שאלונים ורשומות') },
  tests: [B('How heritable is a disorder or trait?', 'עד כמה הפרעה או תכונה תורשתית?'), B('Adoption studies: does a child resemble the biological or the adoptive parents?', 'מחקרי אימוץ: האם הילד דומה להורים הביולוגיים או למאמצים?')],
  example: B('From the book: schizophrenia ~50% concordance in MZ vs ~17% in DZ twins; bipolar disorder 71–77% in MZ twins; major depressive disorder ~33% in MZ twins.', 'מהספר: סכיזופרניה — כ-50% התאמה ב-MZ לעומת כ-17% ב-DZ; הפרעה דו-קוטבית — 71–77% ב-MZ; דיכאון מז\'ורי — כ-33% ב-MZ.'),
  limits: B('Twins also share environments; concordance below 100% shows the environment matters too.', 'תאומים חולקים גם סביבה; התאמה מתחת ל-100% מראה שגם לסביבה יש חשיבות.'),
  scene(stage) {
    stage.definePart({ id: 'mz', name: B('Identical twins (MZ)', 'תאומים זהים (MZ)'), desc: B('From one fertilised egg — 100% of genes shared.', 'מביצית מופרית אחת — 100% מהגנים משותפים.'), color: '#8b5cf6', chapters: [1, 16] });
    stage.definePart({ id: 'dz', name: B('Fraternal twins (DZ)', 'תאומים לא זהים (DZ)'), desc: B('From two eggs — about 50% of genes shared, like ordinary siblings.', 'משתי ביציות — כ-50% מהגנים משותפים, כמו אחים רגילים.'), color: '#22c55e', chapters: [1, 16] });
    const person = (x, color, sc = 1, hair = '#3f2a1d') => {
      const g = new THREE.Group();
      const torso = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.55], [0.3, 0.6], [0.36, 0.9], [0.4, 1.3], [0.36, 1.45], [0.12, 1.52], [0, 1.53]].map(([a, b]) => new THREE.Vector2(a, b)), 24), mat(color, { rough: 0.6 })); torso.scale.set(1, 1, 0.7); g.add(torso);
      for (const sx of [-1, 1]) { const leg = capsule(0.12, 0.5, '#334155'); leg.position.set(sx * 0.15, 0.3, 0); g.add(leg); const arm = capsule(0.085, 0.6, color); arm.position.set(sx * 0.46, 1.08, 0); arm.rotation.z = sx * 0.18; g.add(arm); const hand = sphere(0.09, '#e9c6ad'); hand.position.set(sx * 0.53, 0.68, 0); g.add(hand); }
      const neck = cyl(0.08, 0.09, 0.12, '#e9c6ad'); neck.position.y = 1.58; g.add(neck);
      const hh = sphere(0.27, '#e9c6ad'); hh.scale.set(0.92, 1.05, 0.95); hh.position.y = 1.86; g.add(hh);
      const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.29, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(hair, { rough: 0.8 })); hairM.position.set(0, 1.89, -0.02); hairM.rotation.x = -0.25; g.add(hairM);
      for (const sx of [-1, 1]) { const eye = sphere(0.03, '#1e293b'); eye.position.set(sx * 0.09, 1.88, 0.24); g.add(eye); }
      g.scale.setScalar(sc); g.position.x = x; return g;
    };
    stage.add(person(-1.9, '#8b5cf6'), 'mz'); stage.add(person(-0.95, '#8b5cf6'), 'mz');
    stage.add(person(0.95, '#22c55e'), 'dz'); stage.add(person(1.85, '#16a34a', 0.9, '#b45309'), 'dz'); // fraternal: a different build and hair
    const twinState = { view: 'twins' };
    return { home: { pos: V(0, 1.8, 10.5), target: V(0, 1.0, 0) }, state: twinState, actions: [
      { icon: '🟣', label: B('Identical twins', 'תאומים זהים'), run: () => stage.focus(['mz']) },
      { icon: '🟢', label: B('Fraternal twins', 'תאומים לא זהים'), run: () => stage.focus(['dz']) },
      { icon: '⚖️', label: B('Compare the two pairs', 'השוואת שני הזוגות'), run: () => { twinState.view = 'twins'; stage.compare('mz', 'dz', { layout: 'side' }); } },
      { icon: '🏠', label: B('Adoption study', 'מחקר אימוץ'), toggle: true, caption: B('Children adopted at birth share genes with their biological parents and a home with their adoptive parents. In classic studies, children of a parent with schizophrenia, raised by other families, still developed it far more often than other adopted children: evidence for genes.', 'ילדים שאומצו בלידה חולקים גנים עם ההורים הביולוגיים ובית עם ההורים המאמצים. במחקרים קלאסיים, ילדים להורה עם סכיזופרניה שגדלו במשפחות אחרות עדיין פיתחו אותה הרבה יותר מילדים מאומצים אחרים: עדות לגנים.'), run: (on) => { twinState.view = on ? 'adopt' : 'twins'; } },
    ] };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h, '#0f172a');
    if (st.view === 'adopt') {
      const gx = 40, gy = 30, gw = w - 60, gh = h - 90;
      ctx.strokeStyle = '#334155'; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
      const rows = [[L('biological parent HAS schizophrenia', 'להורה הביולוגי יש סכיזופרניה'), 10, '#f472b6'], [L('biological parent does not', 'להורה הביולוגי אין'), 1, '#94a3b8']];
      const grow = clamp01(t / 1.5);
      rows.forEach(([name, v, c], i) => { const bw = gw * 0.25, x = gx + gw * (0.15 + i * 0.45), bh = (v / 12) * gh * grow; ctx.fillStyle = c; ctx.fillRect(x, gy + gh - bh, bw, bh); label(ctx, `~${v}%`, x + bw / 2, gy + gh - bh - 6, { color: '#e2e8f0', size: 12, align: 'center' }); label(ctx, name, x + bw / 2, gy + gh + 16, { color: '#cbd5e1', size: 10, align: 'center' }); });
      label(ctx, L('Adopted children who later developed schizophrenia (approximate, classic adoption studies)', 'ילדים מאומצים שפיתחו בהמשך סכיזופרניה (בקירוב, מחקרי אימוץ קלאסיים)'), gx, gy - 12, { color: '#e2e8f0', size: 11 });
      return;
    }
    const data = [
      [L('Schizophrenia', 'סכיזופרניה'), 50, 17],
      [L('Bipolar', 'דו-קוטבית'), 74, null],
      [L('Major depression', 'דיכאון מז\'ורי'), 33, null],
    ];
    const gx = 40, gy = 26, gw = w - 60, gh = h - 80, grp = gw / data.length;
    ctx.strokeStyle = '#334155'; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    [0, 25, 50, 75, 100].forEach((p) => label(ctx, `${p}%`, gx - 6, gy + gh - (p / 100) * gh + 4, { color: '#64748b', size: 10, align: 'right' }));
    const grow = clamp01(t / 1.5);
    data.forEach(([name, mz, dz], i) => {
      const x = gx + i * grp + grp * 0.18, bw = grp * 0.28;
      const bar = (v, xx, c) => { const bh = (v / 100) * gh * grow; ctx.fillStyle = c; ctx.fillRect(xx, gy + gh - bh, bw, bh); label(ctx, `${v}%`, xx + bw / 2, gy + gh - bh - 4, { color: '#e2e8f0', size: 11, align: 'center' }); };
      bar(mz, x, '#8b5cf6');
      if (dz != null) bar(dz, x + bw + 4, '#22c55e');
      label(ctx, name, x + bw, gy + gh + 16, { color: '#cbd5e1', size: 11, align: 'center' });
    });
    label(ctx, L('■ MZ (identical)  ■ DZ (fraternal) — concordance rates from the book', '■ MZ (זהים)  ■ DZ (לא זהים) — שיעורי התאמה מהספר'), gx, h - 8, { color: '#94a3b8', size: 11 });
  },
});

// 15. Knockout animals
M({
  id: 'knockout', icon: '🐭', name: B('Knockout animals', 'בעלי חיים "נוקאאוט"'),
  intro: B('Mice are bred with a particular gene disabled ("knocked out"). Comparing them with normal mice shows what that gene\'s protein does.', 'עכברים מגודלים כשגן מסוים מושבת ("נוקאאוט"). השוואה לעכברים רגילים מראה מה תפקידו של החלבון שהגן מקודד.'),
  facts: { measures: B('The role of one gene / protein in behaviour', 'תפקידו של גן / חלבון אחד בהתנהגות'), spatial: B('Whole animal (or one brain area, in newer methods)', 'החיה כולה (או אזור מוח אחד, בשיטות חדשות)'), temporal: B('Lifetime', 'לאורך החיים'), invasive: B('Genetic modification of animals', 'שינוי גנטי של בעלי חיים') },
  tests: [B('Is this receptor or enzyme needed for learning, feeding, aggression…?', 'האם הקולטן או האנזים הזה נחוצים ללמידה, אכילה, תוקפנות…?')],
  example: B('Mice missing a gene for one type of glutamate (NMDA) receptor in the hippocampus learn a water maze more slowly.', 'עכברים שחסר להם גן לסוג מסוים של קולטן גלוטמט (NMDA) בהיפוקמפוס לומדים מבוך מים לאט יותר.'),
  limits: B('Other genes may compensate; a missing gene can affect development in many ways.', 'גנים אחרים עשויים לפצות; גן חסר יכול להשפיע על ההתפתחות בדרכים רבות.'),
  scene(stage) {
    stage.definePart({ id: 'wt', name: B('Normal ("wild-type") mouse', 'עכבר רגיל ("פרא")'), desc: B('Has the normal gene.', 'יש לו את הגן התקין.'), color: '#9ca3af', chapters: CH });
    stage.definePart({ id: 'ko', name: B('Knockout mouse', 'עכבר נוקאאוט'), desc: B('The gene is replaced by a non-working version, so the protein is missing.', 'הגן הוחלף בגרסה לא פעילה, ולכן החלבון חסר.'), color: '#f5f5f4', chapters: CH });
    // a lab mouse, drawn properly: a pear-shaped body, a tapering snout with a pink nose, dark eyes, thin round ears,
    // whiskers, four small pink feet and a long tapering tail (head toward +x)
    const mouse = (x, color) => {
      const g = new THREE.Group();
      const body = blob(0.55, color, { stretch: [1.45, 0.82, 0.86], amp: 0.04, seed: 5 }); body.position.y = 0.05;
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24).scale(1.45, 0.92, 0.95), mat(color, { rough: 0.7 })); hd.position.set(0.86, 0.17, 0);
      const nose = sphere(0.055, '#f472b6'); nose.position.set(1.29, 0.14, 0);
      const eyes = [0.14, -0.14].map((z) => { const e = sphere(0.05, '#111827', { rough: 0.15 }); e.position.set(1.0, 0.29, z); return e; });
      const ears = [0.2, -0.2].map((z) => { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.025, 28), mat('#fbcfe8', { rough: 0.6 })); e.rotation.set(Math.PI / 2 - 0.15, 0, z > 0 ? -0.4 : 0.4); e.rotation.order = 'YXZ'; e.position.set(0.74, 0.47, z); return e; });
      const wh = []; for (const z of [1, -1]) for (let k = 0; k < 3; k++) wh.push(new THREE.CylinderGeometry(0.006, 0.006, 0.42, 4).rotateZ(Math.PI / 2).rotateY(z * (0.35 + k * 0.18)).translate(1.24, 0.13 + (k - 1) * 0.03, z * 0.12));
      const feet = [[0.5, 0.2], [0.5, -0.2], [-0.45, 0.25], [-0.45, -0.25]].map(([fx, fz]) => { const ft = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 10).scale(1.6, 0.5, 1), mat('#f9a8d4', { rough: 0.6 })); ft.position.set(fx, -0.38, fz); return ft; });
      const tailPts = [V(-0.75, -0.05, 0), V(-1.25, -0.25, 0.18), V(-1.75, -0.32, -0.1), V(-2.15, -0.2, 0.15)];
      const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPts), 48, 0.045, 8, false), mat('#f9a8d4', { rough: 0.6 }));
      { const p = tail.geometry.attributes.position, c = new THREE.CatmullRomCurve3(tailPts), v = V(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); let best = 0, bd = 1e9; for (let k = 0; k <= 48; k++) { const d = c.getPointAt(k / 48).distanceToSquared(v); if (d < bd) { bd = d; best = k / 48; } } const q = c.getPointAt(best); v.sub(q).multiplyScalar(1 - best * 0.75).add(q); p.setXYZ(i, v.x, v.y, v.z); } tail.geometry.computeVertexNormals(); }
      g.add(body, hd, nose, ...eyes, ...ears, meshOf(wh, mat('#e5e7eb')), ...feet, tail); g.position.set(x, 0.38, 0); return g;
    };
    stage.add(mouse(-2.1, '#9ca3af'), 'wt'); stage.add(mouse(2.1, '#f5f5f4'), 'ko');
    const koState = { since: 0 };
    stage.onUpdate((dt) => { koState.since += dt; });
    return { home: { pos: V(0, 2.5, 7), target: V(0, 0, 0) }, state: koState, actions: [
      { icon: '🏊', label: B('Run the water maze', 'הרצת מבוך המים'), caption: B('Each day both mice swim to find a platform hidden under cloudy water. The normal mouse learns where it is and gets faster. The mouse without hippocampal NMDA receptors barely improves: those receptors are needed for spatial learning.', 'בכל יום שני העכברים שוחים כדי למצוא משטח מוסתר מתחת למים עכורים. העכבר הרגיל לומד איפה הוא ונעשה מהיר יותר. העכבר בלי קולטני NMDA בהיפוקמפוס כמעט לא משתפר: הקולטנים האלה נחוצים ללמידה מרחבית.'), run: () => { koState.since = 0; stage.focus(['wt', 'ko']); } },
      { icon: '🐭', label: B('Normal mouse', 'עכבר רגיל'), run: () => stage.focus(['wt']) },
      { icon: '🧬', label: B('Knockout mouse', 'עכבר נוקאאוט'), run: () => stage.focus(['ko']) },
    ] };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h, '#0f172a');
    const gx = 44, gy = 26, gw = w - 60, gh = h - 80;
    ctx.strokeStyle = '#334155'; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    const wt = [60, 42, 28, 20, 15], ko = [60, 55, 50, 46, 44];
    const grow = clamp01((st.since ?? t) / 2);
    const line = (arr, c) => { ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.beginPath(); arr.forEach((v, i) => { const x = gx + (i / 4) * gw, y = gy + gh - (v / 65) * gh; const p = i / 4 <= grow; if (p) ctx.lineTo(x, y); }); ctx.stroke(); arr.forEach((v, i) => { if (i / 4 > grow) return; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(gx + (i / 4) * gw, gy + gh - (v / 65) * gh, 4, 0, Math.PI * 2); ctx.fill(); }); };
    line(wt, '#9ca3af'); line(ko, '#f472b6');
    for (let d = 1; d <= 5; d++) label(ctx, `${L('day', 'יום')} ${d}`, gx + ((d - 1) / 4) * gw, gy + gh + 16, { color: '#94a3b8', size: 10, align: 'center' });
    label(ctx, L('Time to find the hidden platform (s)', 'זמן למציאת המשטח הנסתר (שנ\')'), gx, gy - 8, { color: '#e2e8f0', size: 12 });
    label(ctx, L('gray = normal · pink = knockout (illustrative)', 'אפור = רגיל · ורוד = נוקאאוט (להמחשה)'), gx, h - 6, { color: '#94a3b8', size: 11 });
  },
});

// 16. Stem cells
M({
  id: 'stemcells', icon: '🌱', name: B('Stem cells', 'תאי גזע'),
  intro: B('Stem cells can divide and become many cell types — including neurons and glia. Researchers hope to use them to replace damaged brain or spinal-cord tissue.', 'תאי גזע יכולים להתחלק ולהפוך לסוגי תאים רבים — כולל נוירונים ותאי גליה. החוקרים מקווים להשתמש בהם כדי להחליף רקמת מוח או חוט שדרה פגועה.'),
  facts: { measures: B('A tool for repair (and for studying development)', 'כלי לתיקון (ולחקר ההתפתחות)'), spatial: B('Cells', 'תאים'), temporal: B('Weeks to months', 'שבועות עד חודשים'), invasive: B('Transplants require surgery', 'השתלה דורשת ניתוח') },
  tests: [B('Can new neurons replace lost ones (e.g. dopamine cells in Parkinson\'s)?', 'האם נוירונים חדשים יכולים להחליף כאלה שאבדו (למשל תאי דופמין בפרקינסון)?'), B('How does a neuron develop from an unspecialised cell?', 'איך נוירון מתפתח מתא לא מתמחה?')],
  example: B('Stem cells are being studied for repairing spinal cord injuries and Parkinson\'s disease.', 'תאי גזע נחקרים לתיקון פגיעות בחוט השדרה ולמחלת פרקינסון.'),
  limits: B('Controlling what the cells become and connecting them correctly is hard; ethical debates.', 'קשה לשלוט במה שהתאים הופכים אליו ולחבר אותם נכון; ויכוחים אתיים.'),
  scene(stage) {
    stage.definePart({ id: 'stem', name: B('Stem cell', 'תא גזע'), desc: B('Unspecialised; can keep dividing.', 'לא מתמחה; יכול להמשיך להתחלק.'), color: '#a3e635', chapters: [5] });
    stage.definePart({ id: 'neuronK', name: B('New neuron', 'נוירון חדש'), desc: B('One possible fate.', 'גורל אפשרי אחד.'), color: '#e11d48', chapters: [5] });
    stage.definePart({ id: 'gliaK', name: B('New glial cells', 'תאי גליה חדשים'), desc: B('Astrocytes and oligodendrocytes are other possible fates.', 'אסטרוציטים ואוליגודנדרוציטים הם גורלות אפשריים אחרים.'), color: '#8b5cf6', chapters: [5] });
    // a neurosphere: the stem cell (see-through, with its big nucleus) among a few sister cells, as they grow in a dish
    const stem = new THREE.Group(); stage.add(stem, 'stem');
    const cellAt = (p, r, seed) => { const c = blob(r, '#a3e635', { seed, amp: 0.07, o: { opacity: 0.55, rough: 0.35 } }); c.material.depthWrite = false; c.position.copy(p); const nu = sphere(r * 0.5, '#4d7c0f', { rough: 0.5 }); nu.position.copy(p).add(V(r * 0.08, r * 0.05, r * 0.1)); const nl = sphere(r * 0.14, '#365314'); nl.position.copy(nu.position).add(V(r * 0.15, r * 0.12, r * 0.38)); stem.add(c, nu, nl); };
    cellAt(V(0, 0, 0), 0.7, 3);
    [[-0.75, 0.55, -0.35, 0.42], [-0.85, -0.45, 0.2, 0.4], [-0.1, 0.85, -0.5, 0.36], [0.05, -0.85, -0.4, 0.38], [-1.35, 0.05, -0.3, 0.34]].forEach(([x, y, z, r], i) => cellAt(V(x, y, z), r, 10 + i));
    // the culture dish they grow in: a glass floor with a rim and a layer of pink growth medium (it also sets the view's
    // frame, so the neuron and glia that grow later fit in it)
    const dish = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 0.08, 72), mat('#e0f2fe', { opacity: 0.35, rough: 0.1 })); glass.material.depthWrite = false; dish.add(glass);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 0.7, 72, 1, true), mat('#e0f2fe', { opacity: 0.22, rough: 0.1, side: THREE.DoubleSide })); rim.material.depthWrite = false; rim.position.y = 0.35; dish.add(rim);
    const medium = new THREE.Mesh(new THREE.CylinderGeometry(3.86, 3.86, 0.3, 72), mat('#f9a8d4', { opacity: 0.25, rough: 0.2 })); medium.material.depthWrite = false; medium.position.y = 0.2; dish.add(medium);
    dish.position.set(1.2, -3.3, 0); stage.add(dish, 'stem');
    const n = makeNeuron({ axonLength: 2, myelin: false, seed: 2, dendriteCount: 5, scale: 0.45 });
    n.group.position.set(3, 0.5, 0); stage.add(n.group, 'neuronK');
    const astro = new THREE.Group(); astro.add(sphere(0.3, '#8b5cf6')); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; astro.add(rod(V(), V(Math.cos(a) * 0.9, Math.sin(a) * 0.9, (i % 2 - 0.5) * 0.4), 0.04, '#8b5cf6')); }
    astro.position.set(3, -2, 0); stage.add(astro, 'gliaK');
    // the paths to the two fates, with arrowheads; they appear once the cell starts to develop
    const arrow = (p0, p1) => { const g = new THREE.Group(); g.add(tube([p0, p1], 0.035, '#94a3b8')); const d = p1.clone().sub(p0).normalize(); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 12), mat('#94a3b8')); tip.position.copy(p1).addScaledVector(d, 0.12); tip.quaternion.setFromUnitVectors(V(0, 1, 0), d); g.add(tip); stage.root.add(g); return g; };
    const arrows = [arrow(V(0.85, 0.2, 0), V(2.1, 0.48, 0)), arrow(V(0.85, -0.3, 0), V(2.2, -1.5, 0))];
    const state = { grow: 0, go: false, ips: false };
    const nBase = n.group.scale.x; // makeNeuron's own scale (0.45): growing multiplies it, never replaces it
    n.group.scale.setScalar(0.01 * nBase); astro.scale.setScalar(0.01);
    stage.onUpdate((dt) => { if (state.go) state.grow = Math.min(1, state.grow + dt * 0.5); const s = 0.01 + state.grow; n.group.scale.setScalar(s * nBase); astro.scale.setScalar(s); stem.children[0].scale.setScalar(1 + 0.05 * Math.sin(state.grow * 20)); arrows.forEach((a) => { a.visible = state.grow > 0.02; }); });
    return { home: { pos: V(1.0, 0.3, 9), target: V(1.0, -0.4, 0) }, state, actions: [
      { icon: '🌱', label: B('Let it develop', 'לתת לו להתפתח'), caption: B('Chemical signals guide the stem cell\'s daughters to become neurons or glia.', 'אותות כימיים מכוונים את תאי הבת של תא הגזע להפוך לנוירונים או לתאי גליה.'), run: () => { state.go = true; state.grow = 0; state.ips = false; stem.traverse((o) => { if (o.material?.transparent) o.material.color.set('#a3e635'); }); } },
      { icon: '🧫', label: B('Start from a skin cell (iPS)', 'להתחיל מתא עור (iPS)'), caption: B('Since 2006 (Yamanaka, Nobel Prize 2012), adding four genes can turn an ordinary skin cell back into a stem cell (an induced pluripotent stem cell). From a patient’s own skin, labs grow that patient’s neurons in a dish to study their disease.', 'מאז 2006 (יאמאנקה, פרס נובל 2012), הוספת ארבעה גנים יכולה להחזיר תא עור רגיל להיות תא גזע (תא גזע פלוריפוטנטי מושרה). מהעור של מטופל, מעבדות מגדלות את הנוירונים של אותו מטופל בצלחת כדי לחקור את המחלה שלו.'), run: () => { state.go = true; state.grow = 0; state.ips = true; stem.traverse((o) => { if (o.material?.transparent) o.material.color.set('#fbbf24'); }); } },
    ] };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h, '#0f172a');
    const node = (x, y, text, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); label(ctx, text, x, y + 34, { color: '#e2e8f0', size: 12, align: 'center' }); };
    const arrow = (x1, y1, x2, y2) => { ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    const g = clamp01(st.grow ?? 0);
    node(w * 0.15, h * 0.45, st.ips ? L('skin cell → iPS', 'תא עור ← iPS') : L('stem cell', 'תא גזע'), st.ips ? '#fbbf24' : '#a3e635');
    if (g > 0.15) { arrow(w * 0.2, h * 0.45, w * 0.36, h * 0.45); node(w * 0.42, h * 0.45, L('progenitor', 'תא אב'), '#facc15'); }
    if (g > 0.5) {
      arrow(w * 0.47, h * 0.4, w * 0.7, h * 0.2); arrow(w * 0.47, h * 0.45, w * 0.7, h * 0.47); arrow(w * 0.47, h * 0.5, w * 0.7, h * 0.74);
      node(w * 0.76, h * 0.18, L('neuron', 'נוירון'), '#e11d48'); node(w * 0.76, h * 0.45, L('astrocyte', 'אסטרוציט'), '#8b5cf6'); node(w * 0.76, h * 0.72, L('oligodendrocyte', 'אוליגודנדרוציט'), '#60a5fa');
    }
    if (g === 0) label(ctx, L('Press “Let it develop”', 'לחצו "לתת לו להתפתח"'), w / 2, h - 12, { color: '#94a3b8', size: 12, align: 'center' });
  },
});

// 17. Compare all methods
const CHART = [
  // name, log10 spatial (m), log10 temporal (s) ranges, invasive
  ['EEG', [-2.3, -1.3], [-3, 0], false], ['MEG', [-2.7, -1.7], [-3, 0], false], ['fMRI', [-3, -2.3], [0, 2], false], ['PET', [-2.6, -1.9], [1.5, 3], true],
  ['TMS', [-2.3, -1.7], [-3, 1], false], ['Single cell', [-5.5, -4.5], [-3.5, 1], true], ['Lesion', [-3.3, -1.5], [5, 7.5], true], ['Microdialysis', [-3.3, -2.7], [2.5, 3.5], true],
  ['CT / MRI', [-3.3, -2.7], [6.8, 7.8], false], ['Histology', [-6, -4], [7.8, 8.5], true],
];
M({
  id: 'compare', icon: '📊', name: B('Compare the methods', 'השוואת השיטות'),
  intro: B('Every method trades off WHERE (spatial resolution), WHEN (temporal resolution) and how invasive it is. No single method does everything — researchers combine them.', 'כל שיטה מתפשרת בין איפה (רזולוציה מרחבית), מתי (רזולוציה זמנית) ועד כמה היא פולשנית. אין שיטה אחת שעושה הכול — חוקרים משלבים ביניהן.'),
  facts: { measures: B('Overview', 'סקירה'), spatial: B('From micrometres (single cells) to centimetres (EEG)', 'ממיקרומטרים (תאים בודדים) עד סנטימטרים (EEG)'), temporal: B('From milliseconds (EEG/MEG) to structure only (CT/MRI)', 'מאלפיות שנייה (EEG/MEG) ועד מבנה בלבד (CT/MRI)'), invasive: B('Orange = invasive, blue = non-invasive', 'כתום = פולשני, כחול = לא פולשני') },
  tests: [B('Need WHEN? → EEG, MEG, single cells', 'צריכים מתי? ← EEG, ‏MEG, תאים בודדים'), B('Need WHERE? → fMRI, MRI, single cells', 'צריכים איפה? ← fMRI, ‏MRI, תאים בודדים'), B('Need CAUSE? → lesions, TMS, DBS, knockouts', 'צריכים סיבה? ← פגיעות, TMS, ‏DBS, נוקאאוט')],
  example: B('Combining fMRI (where) with EEG (when) gives a fuller picture of brain activity.', 'שילוב fMRI (איפה) עם EEG (מתי) נותן תמונה מלאה יותר של פעילות המוח.'),
  limits: B('Positions on the chart are approximate.', 'המיקומים בתרשים משוערים.'),
  scene(stage) {
    head(stage);
    const cmp = { need: null };
    const NEED = [['⏱️', 'I need WHEN', 'אני צריך מתי', 'when', 'Milliseconds matter (the order of brain events): EEG, MEG, single cells.', 'אלפיות שנייה חשובות (סדר האירועים במוח): EEG, ‏MEG, תאים בודדים.'], ['📍', 'I need WHERE', 'אני צריך איפה', 'where', 'Exact location: fMRI, MRI/CT, single cells and histology.', 'מיקום מדויק: fMRI, ‏MRI/CT, תאים בודדים והיסטולוגיה.'], ['🎯', 'I need CAUSE', 'אני צריך סיבה', 'cause', 'To show an area is NEEDED, change it and watch behaviour: lesions and TMS (also DBS and knockouts).', 'כדי להראות שאזור נחוץ, משנים אותו ובודקים התנהגות: פגיעות ו-TMS (וגם DBS ונוקאאוט).']];
    return { home: { pos: V(2.8, 1.2, 3.6), target: V(0, 0, 0) }, state: cmp, actions: NEED.map(([icon, en, he, k, den, dhe]) => ({ icon, label: B(en, he), radio: true, caption: B(den, dhe), run: () => { cmp.need = k; } })) };
  },
  draw(ctx, w, h, t, st, L) {
    bg(ctx, w, h, '#0f172a');
    const gx = 56, gy = 14, gw = w - 66, gh = h - 56;
    const X = (v) => gx + ((v + 4) / 13) * gw, Y = (v) => gy + gh - ((v + 6.2) / 5.4) * gh;
    ctx.strokeStyle = '#334155'; ctx.strokeRect(gx, gy, gw, gh);
    [['1 ms', -3], ['1 s', 0], ['1 hr', 3.56], ['1 day', 4.94], ['1 yr', 7.5]].forEach(([s, v]) => label(ctx, s, X(v), gy + gh + 14, { color: '#94a3b8', size: 10, align: 'center' }));
    [['1 µm', -6], ['1 mm', -3], ['1 cm', -2]].forEach(([s, v]) => label(ctx, s, gx - 6, Y(v) + 4, { color: '#94a3b8', size: 10, align: 'right' }));
    const PICK = { when: ['EEG', 'MEG', 'Single cell'], where: ['fMRI', 'CT / MRI', 'Single cell', 'Histology'], cause: ['Lesion', 'TMS'] }[st.need];
    for (const [name, sp, tm, inv] of CHART) {
      ctx.globalAlpha = PICK && !PICK.includes(name) ? 0.2 : 1;
      const x1 = X(tm[0]), x2 = X(tm[1]), y1 = Y(sp[1]), y2 = Y(sp[0]);
      ctx.fillStyle = inv ? 'rgba(249,115,22,.35)' : 'rgba(59,130,246,.35)'; ctx.strokeStyle = inv ? '#f97316' : '#3b82f6';
      ctx.beginPath(); ctx.roundRect(x1, y1, x2 - x1, y2 - y1, 6); ctx.fill(); ctx.stroke();
      label(ctx, name, (x1 + x2) / 2, (y1 + y2) / 2 + 4, { color: '#f8fafc', size: 10, align: 'center' });
    }
    ctx.globalAlpha = 1;
    label(ctx, L('← faster      time      slower →', '← מהיר      זמן      איטי →'), gx + gw / 2, h - 6, { color: '#cbd5e1', size: 11, align: 'center' });
    ctx.save(); ctx.translate(12, gy + gh / 2); ctx.rotate(-Math.PI / 2); label(ctx, L('size of what is seen', 'גודל מה שנראה'), 0, 0, { color: '#cbd5e1', size: 11, align: 'center' }); ctx.restore();
  },
});

// ---------------------------------------------------------------- dock: output + facts
const escA = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** Real example images (Wikimedia Commons) with caption and credit. */
function realImages(id, L) {
  const list = METHOD_IMAGES[id];
  if (!list?.length) return '';
  const base = import.meta.env?.BASE_URL || '/';
  const link = (href, text) => `<a href="${escA(href)}" target="_blank" rel="noopener">${escA(text)}</a>`;
  return `<h4 class="method-h">📷 ${L('Real examples', 'דוגמאות אמיתיות')}</h4>` + list.map((im) => {
    const cap = escA(L(im.caption.en, im.caption.he));
    const src = `${base}methods/${im.file}`;
    return `<figure class="method-photo">
      <a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${cap}" loading="lazy"></a>
      <figcaption>${cap}<br><span class="credit">${escA(im.author)} · ${im.licenseUrl ? link(im.licenseUrl, im.license) : escA(im.license)} · ${link(im.source, 'Wikimedia Commons')}</span></figcaption>
    </figure>`;
  }).join('');
}
function dockFor(m, state, L) {
  const tt = (b) => L(b.en, b.he);
  return (el) => {
    el.innerHTML = `
      <h4 class="method-h">🖥️ ${L('What it looks like', 'איך זה נראה')}</h4>
      <canvas class="method-canvas" width="560" height="300"></canvas>
      <p class="muted small">${L('Simulated output, generated live from the model — not a real recording.', 'פלט מדומה, שנוצר בזמן אמת מהמודל — לא רישום אמיתי.')}</p>
      <h4 class="method-h">🔎 ${L('What it can test', 'מה אפשר לבדוק בעזרתה')}</h4>
      <ul class="method-tests">${m.tests.map((x) => `<li>${tt(x)}</li>`).join('')}</ul>
      <table class="method-facts">
        <tr><th>${L('Measures', 'מודד')}</th><td>${tt(m.facts.measures)}</td></tr>
        <tr><th>${L('Where (spatial)', 'איפה (מרחבי)')}</th><td>${tt(m.facts.spatial)}</td></tr>
        <tr><th>${L('When (temporal)', 'מתי (זמני)')}</th><td>${tt(m.facts.temporal)}</td></tr>
        <tr><th>${L('Invasive?', 'פולשני?')}</th><td>${tt(m.facts.invasive)}</td></tr>
      </table>
      <p><b>📖 ${L('Example', 'דוגמה')}:</b> ${tt(m.example)}</p>
      <p><b>⚠️ ${L('Limits', 'מגבלות')}:</b> ${tt(m.limits)}</p>${realImages(m.id, L)}`;
    const cv = el.querySelector('canvas');
    const ctx = cv.getContext('2d');
    // Draw at the real on-screen size so text stays readable in a narrow panel.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.max(260, cv.clientWidth || 340), ch = Math.round(cw * 0.62);
    cv.width = cw * dpr; cv.height = ch * dpr;
    cv.style.aspectRatio = `${cw} / ${ch}`;
    ctx.scale(dpr, dpr);
    const t0 = performance.now();
    const loop = () => {
      if (!cv.isConnected) return;
      try { m.draw(ctx, cw, ch, (performance.now() - t0) / 1000, state, L); } catch (e) { console.error(e); return; }
      requestAnimationFrame(loop);
    };
    loop();
  };
}

export default {
  id: 'methods',
  scenes: METHODS.map((m) => ({
    id: m.id, icon: m.icon, name: m.name, intro: m.intro, chapters: CH,
    build(stage, api) {
      const r = m.scene(stage, api) || {};
      return { home: r.home, actions: r.actions || [], dock: dockFor(m, r.state || {}, api.L) };
    },
  })),
};
