// TISSUE level: cortex layers, a nerve in cross-section, the blood–brain barrier, the retina,
// the organ of Corti (uncoiled cochlea) and the neuromuscular junction.
import * as THREE from 'three';
import { V, mat, sphere, box, cyl, torus, tube, blob, rod, flow, textSprite, rand, timeline, taperTube, spindle, slab, molecule } from '../build.js';
import { seeded } from '../neuron.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { pentamer, helixGeo } from '../proteins.js';
import { vesicle as vesicleModel, striationTexture, rbcGeo, arcWallGeo, cutFaceGeo, ringFaceGeo, ballsGeo, lumpGeo, meshOf } from '../cells.js';

const B = (en, he) => ({ en, he });
const P = (stage, id, en, he, den, dhe, color, chapters) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters });

// ---------------- Cortex: six layers ----------------
// Redrawn like the textbook figure (owner, 2026-11-15: better-looking models): the back and left walls of the block
// are a Nissl-stained section (dots for cell bodies, dense where each layer is dense), and the cells inside are drawn
// as neurons: pyramidal cells with a triangular body, a long apical dendrite with side branches and a tuft in layer I,
// basal dendrites and a thin axon; star-shaped granule (stellate) cells; a penetrating artery from the pia above.
/** A Nissl-stained wall for the cortex block: dot density and size follow the layers (y from top to bottom). */
function nisslTexture(layers, total) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 640;
  const g = c.getContext('2d');
  g.fillStyle = '#f3e8f7'; g.fillRect(0, 0, 512, 640);
  const R = seeded(31);
  const look = { l1: [20, 2, 2], l2: [520, 2.2, 3], l3: [260, 3, 5], l4: [620, 1.8, 2.6], l5: [110, 3.5, 8], l6: [300, 2.5, 4], white: [60, 1.4, 2] };
  let y = 0;
  for (const [id, t] of layers) {
    const h = (t / total) * 640, [n, r0, r1] = look[id];
    const per = n * (h / 100);
    for (let k = 0; k < per; k++) {
      const x = R() * 512, yy = y + R() * h, rr = r0 + R() * (r1 - r0);
      g.fillStyle = id === 'white' ? 'rgba(120,90,160,0.35)' : `rgba(${88 + R() * 40},${40 + R() * 30},${140 + R() * 40},0.85)`;
      g.beginPath();
      if ((id === 'l3' || id === 'l5') && rr > 3.5) { g.moveTo(x, yy - rr * 1.4); g.lineTo(x + rr, yy + rr * 0.8); g.lineTo(x - rr, yy + rr * 0.8); g.closePath(); } // pyramids
      else g.arc(x, yy, rr, 0, Math.PI * 2);
      g.fill();
    }
    y += h;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
// Made easier to read (owner, 2026-11-22: "too messy… hard to understand the layers"):
//  · a thin slice (like a textbook section), not a deep cube, so cells do not hide behind each other;
//  · clearly tinted layer bands with border lines;
//  · a few typical cells per layer in a tidy row (about 17); "Show the real density" adds the crowd back;
//  · thalamic axons, the signal and the artery appear only when an animation or toggle needs them;
//  · a layer ruler: real HTML buttons I–VI beside the slice, with names; hover/tap lights a layer and says what it does.
function cortexScene(stage, { readout, L }) {
  const R = seeded(7);
  const r = (a, b) => a + R() * (b - a);
  // id, numeral, thickness, colour, full name EN/HE, role EN/HE (short, for the ruler), description EN/HE
  const LAYERS = [
    ['l1', 'I', 0.35, '#fde68a', 'Layer I — molecular layer', 'שכבה I — השכבה המולקולרית', 'Molecular', 'מולקולרית', 'Very few cell bodies: mostly dendrites from cells below and axons running sideways.', 'מעט מאוד גופי תאים: בעיקר דנדריטים של תאים מלמטה ואקסונים שרצים לרוחב.'],
    ['l2', 'II', 0.35, '#fdba74', 'Layer II — external granular', 'שכבה II — גרגירית חיצונית', 'External granular', 'גרגירית חיצונית', 'Small, densely packed neurons that connect with other cortical areas.', 'נוירונים קטנים וצפופים שמתחברים לאזורים אחרים בקליפה.'],
    ['l3', 'III', 0.7, '#fca5a5', 'Layer III — external pyramidal', 'שכבה III — פירמידלית חיצונית', 'External pyramidal', 'פירמידלית חיצונית', 'Medium pyramidal cells whose axons go to other cortical areas (including across the corpus callosum).', 'תאים פירמידליים בינוניים שהאקסונים שלהם הולכים לאזורי קליפה אחרים (כולל דרך הגוף המיוזע).'],
    ['l4', 'IV', 0.45, '#86efac', 'Layer IV — internal granular', 'שכבה IV — גרגירית פנימית', 'Input from the thalamus', 'קלט מהתלמוס', 'The main INPUT layer: receives sensory information from the thalamus. Thick in sensory areas such as the primary visual cortex.', 'שכבת הקלט העיקרית: מקבלת מידע חושי מהתלמוס. עבה באזורים חושיים כמו קליפת הראייה הראשונית.'],
    ['l5', 'V', 0.65, '#93c5fd', 'Layer V — internal pyramidal', 'שכבה V — פירמידלית פנימית', 'Output to the body', 'פלט אל הגוף', 'The main OUTPUT layer: large pyramidal cells send axons to the brainstem and spinal cord. Thick in the motor cortex.', 'שכבת הפלט העיקרית: תאים פירמידליים גדולים שולחים אקסונים לגזע המוח ולחוט השדרה. עבה בקליפה המוטורית.'],
    ['l6', 'VI', 0.6, '#c4b5fd', 'Layer VI — multiform', 'שכבה VI — רב-צורנית', 'Feedback to the thalamus', 'משוב לתלמוס', 'Varied cells that send feedback back to the thalamus.', 'תאים מגוונים ששולחים משוב חזרה לתלמוס.'],
  ];
  const W = 3.4, D = 1.3; // a slice: wide and tall, but thin front to back
  const FRONT = D / 2 - 0.3; // the row the cells stand in
  let y = 1.6;
  const mids = {};
  const lineMat = new THREE.LineBasicMaterial({ color: '#64748b', transparent: true, opacity: 0.7 });
  // the outline of one level (a border between two layers) on the front, left and right faces of the slice
  const border = (yy) => {
    const pts = [V(-W / 2, yy, -D / 2), V(-W / 2, yy, D / 2), V(W / 2, yy, D / 2), V(W / 2, yy, -D / 2)];
    const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
    ln.raycast = () => {};
    stage.root.add(ln);
  };
  border(y);
  for (const [id, , t, color, en, he, , , den, dhe] of LAYERS) {
    P(stage, id, en, he, den, dhe, color, [2]);
    const slab = box(W, t, D, color, { opacity: 0.26 });
    slab.material.depthWrite = false;
    slab.position.y = y - t / 2;
    stage.add(slab, id);
    mids[id] = y - t / 2;
    y -= t;
    border(y);
  }
  const bottom = y;
  P(stage, 'white', 'White matter', 'חומר לבן', 'Below the cortex: bundles of myelinated axons. Myelin is fatty, so this tissue looks white — the cortex (cell bodies) looks gray.', 'מתחת לקליפה: צרורות של אקסונים עטופי מיאלין. המיאלין שומני, ולכן הרקמה נראית לבנה — הקליפה (גופי תאים) נראית אפורה.', '#e5e7eb', [2]);
  const wm = box(W, 0.9, D, '#f1f5f9', { opacity: 0.35 });
  wm.material.depthWrite = false;
  wm.position.y = bottom - 0.45;
  stage.add(wm, 'white');
  // the Nissl-stained back wall (a picture, not a part: hovering passes through to the cells)
  const tex = nisslTexture([...LAYERS.map((l) => [l[0], l[2]]), ['white', 0.9]], 1.6 - bottom + 0.9);
  const H = 1.6 - bottom + 0.9, yMid = 1.6 - H / 2;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
  wall.position.set(0, yMid, -D / 2 - 0.005); wall.raycast = () => {};
  stage.root.add(wall);
  // the pia on top; its vessels and the artery diving down are shown with "Show blood vessels"
  P(stage, 'vessels', 'Blood vessels', 'כלי דם', 'Arteries run over the surface in the pia and dive straight down into the cortex, branching into capillaries in every layer: the brain uses a fifth of the body\'s oxygen.', 'עורקים עוברים על פני השטח בקרום הרך וצוללים ישר למטה לתוך הקליפה, ומתפצלים לנימים בכל שכבה: המוח צורך חמישית מהחמצן של הגוף.', '#dc2626', [2]);
  const pia = box(W, 0.03, D, '#f5c2d6', { opacity: 0.5 }); pia.material.depthWrite = false; pia.position.y = 1.62; stage.root.add(pia);
  const vg = [];
  vg.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-W / 2, 1.68, -0.3), V(-0.4, 1.7, -0.2), V(0.6, 1.68, 0.05), V(W / 2, 1.7, 0.2)]), 40, 0.06, 8, false));
  const dive = [V(-0.55, 1.68, -0.25), V(-0.6, 0.6, -0.3), V(-0.5, -0.4, -0.3), V(-0.58, bottom, -0.28)];
  vg.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dive), 40, 0.04, 6, false));
  for (let k = 0; k < 9; k++) { const p = new THREE.CatmullRomCurve3(dive).getPointAt(0.08 + k * 0.1), d = V(r(-1, 1), r(-0.4, 0.2), r(-0.4, 0.4)).normalize(); vg.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p, p.clone().addScaledVector(d, 0.25).add(V(0, -0.05, 0)), p.clone().addScaledVector(d, 0.5).add(V(r(-0.1, 0.1), -0.12, r(-0.05, 0.05)))]), 10, 0.014, 4, false)); }
  const vessels = meshOf(vg, mat('#dc2626', { rough: 0.35 }));
  vessels.visible = false;
  stage.add(vessels, 'vessels');

  const cells = [];
  // a pyramidal neuron, one mesh for its body and dendrites (and one for its axon), soma at the origin
  const pyramidal = (layer, x, z, s, group = null) => {
    const g = new THREE.Group();
    const top = 1.6 - mids[layer] - 0.06, geos = [];
    const soma = new THREE.LatheGeometry([[0, -0.11], [0.1, -0.09], [0.11, -0.03], [0.065, 0.08], [0.028, 0.17], [0, 0.2]].map(([a, b]) => new THREE.Vector2(a * s, b * s)), 10);
    geos.push(soma);
    const ap = [V(0, 0.18 * s, 0)];
    for (let k = 1; k <= 5; k++) ap.push(V(r(-0.03, 0.03), 0.18 * s + (top - 0.18 * s) * (k / 5), r(-0.02, 0.02)));
    geos.push(taperTube(ap, 0.024 * s, (t) => 1 - 0.6 * t, '#e11d48', undefined, 24, 6).geometry);
    const apC = new THREE.CatmullRomCurve3(ap);
    // side branches mostly sideways in the plane of the slice (they used to fan out front-to-back and tangle)
    for (let k = 0; k < 3; k++) { const p = apC.getPointAt(0.25 + k * 0.2), d = V((k % 2 ? 1 : -1) * r(0.6, 1), 0.7, r(-0.25, 0.25)).normalize(), L1 = r(0.16, 0.28) * Math.min(1.3, s); geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p, p.clone().addScaledVector(d, L1 * 0.5), p.clone().addScaledVector(d, L1).add(V(0, 0.04, 0))]), 8, 0.008 * s + 0.004, 4, false)); }
    const tip = ap[ap.length - 1];
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([tip, tip.clone().add(V(Math.cos(a) * 0.12, 0.02, Math.sin(a) * 0.06)), tip.clone().add(V(Math.cos(a) * 0.24, r(-0.06, 0.03), Math.sin(a) * 0.1))]), 8, 0.007, 4, false)); } // the tuft in layer I
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.6, d = V(Math.cos(a), r(-0.7, -0.3), Math.sin(a) * 0.5).normalize(), p0 = V(0, -0.08 * s, 0), p1 = p0.clone().addScaledVector(d, 0.16 * s); geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, p1, p1.clone().addScaledVector(d, 0.12 * s).add(V(0, -0.03, 0))]), 8, 0.011 * s, 4, false)); }
    const body = meshOf(geos, mat('#be123c', { rough: 0.45 }));
    g.add(body);
    const ax = [V(0, -0.11 * s, 0), V(0, -0.4, 0), V(r(-0.03, 0.03), (bottom - mids[layer]) * 0.6, 0), V(0, bottom - mids[layer] - 0.8, 0)];
    g.add(meshOf([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ax), 30, 0.009, 4, false)], mat('#f59e0b', { rough: 0.5 })));
    g.position.set(x, mids[layer], z);
    stage.add(g, layer, group || stage.root); cells.push({ g, layer });
    return body;
  };
  // a granule (stellate) cell: a round body and short branching dendrites all round it
  const stellate = (layer, x, z, group = null, dy = 0) => {
    const g = new THREE.Group();
    const geos = [new THREE.SphereGeometry(0.065, 12, 9)];
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2, d = V(Math.cos(a), r(-0.5, 0.5), Math.sin(a) * 0.5).normalize(), p1 = d.clone().multiplyScalar(0.14); geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(), d.clone().multiplyScalar(0.06), p1]), 6, 0.009, 4, false)); const f = d.clone().add(V(r(-0.5, 0.5), r(-0.5, 0.5), 0)).normalize(); geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p1, p1.clone().addScaledVector(f, 0.09)]), 4, 0.007, 4, false)); }
    g.add(meshOf(geos, mat('#16a34a', { rough: 0.45 })));
    g.position.set(x, mids[layer] + dy, z);
    stage.add(g, layer, group || stage.root); cells.push({ g, layer });
  };
  // the typical cells, one tidy row: what each layer is known for (the two zoom-in dots stay on the same two cells:
  // a big layer-V cell at the front right and a layer-III cell at the front left)
  pyramidal('l5', 1.25, FRONT, 1.6).userData.dot = true;
  pyramidal('l3', -1.3, FRONT, 0.9).userData.dot = true;
  pyramidal('l3', -0.2, FRONT - 0.15, 0.85);
  pyramidal('l3', 0.65, FRONT, 0.8);
  pyramidal('l2', -0.75, FRONT - 0.1, 0.55);
  pyramidal('l2', 0.2, FRONT, 0.5);
  stellate('l2', 1.0, FRONT - 0.1);
  stellate('l1', -0.3, FRONT - 0.2, null, 0.05); // layer I: almost no cell bodies
  [-1.15, -0.45, 0.25, 0.95].forEach((x, i) => stellate('l4', x, FRONT - (i % 2) * 0.2, null, (i % 2 ? 0.07 : -0.07)));
  pyramidal('l5', -0.85, FRONT - 0.1, 1.35);
  pyramidal('l6', -0.25, FRONT, 0.7);
  pyramidal('l6', 0.55, FRONT - 0.15, 0.65);
  stellate('l6', 1.3, FRONT - 0.1);
  // "Show the real density": the crowd that the real cortex has (hidden at first)
  const crowd = new THREE.Group(); crowd.visible = false; stage.root.add(crowd);
  const rx = () => r(-1.5, 1.5), rz = () => r(-D / 2 + 0.1, D / 2 - 0.1);
  for (let i = 0; i < 8; i++) pyramidal('l3', rx(), rz(), 0.8, crowd);
  for (let i = 0; i < 5; i++) pyramidal('l2', rx(), rz(), 0.5, crowd);
  for (let i = 0; i < 5; i++) pyramidal('l5', rx(), rz(), 1.3, crowd);
  for (let i = 0; i < 5; i++) pyramidal('l6', rx(), rz(), 0.65, crowd);
  for (let i = 0; i < 16; i++) stellate('l4', rx(), rz(), crowd, r(-0.12, 0.12));
  for (let i = 0; i < 10; i++) stellate('l2', rx(), rz(), crowd, r(-0.1, 0.1));
  // thalamic axons rising into layer IV, where they branch (shown with the signal and input/output animations)
  const thal = [];
  for (const x of [-1.2, -0.4, 0.4, 1.2]) { const z = FRONT - 0.35, top4 = V(x, mids.l4, z); thal.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x + 0.1, bottom - 0.85, z), V(x, bottom, z), top4]), 20, 0.014, 4, false)); for (let j = 0; j < 4; j++) { const a = j * 1.57 + x; thal.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([top4, top4.clone().add(V(Math.cos(a) * 0.18, 0.08, Math.sin(a) * 0.08)), top4.clone().add(V(Math.cos(a) * 0.34, r(-0.08, 0.1), Math.sin(a) * 0.12))]), 8, 0.008, 4, false)); } }
  const thalamic = meshOf(thal, mat('#0ea5e9', { rough: 0.5 }));
  thalamic.visible = false;
  stage.add(thalamic, 'l4');
  const showThalamic = (on) => { thalamic.visible = on; stage.needsRender = true; };

  // Signal flow: thalamus → IV → II/III → V → out (drawn in front of the cells)
  const zf = D / 2 - 0.05;
  const curves = [
    [V(-0.3, bottom - 1.2, zf), V(-0.3, bottom, zf), V(-0.2, mids.l4, zf)],
    [V(-0.2, mids.l4, zf), V(0, mids.l3, zf), V(0.2, mids.l2, zf)],
    [V(0.2, mids.l2, zf), V(0.4, mids.l3, zf), V(0.5, mids.l5, zf)],
    [V(0.5, mids.l5, zf), V(0.6, bottom, zf), V(0.7, bottom - 1.2, zf)],
  ].map((pts) => flow(stage, new THREE.CatmullRomCurve3(pts), { color: '#f97316', count: 8, size: 0.2, speed: 0.5 }));
  curves.forEach((c) => c.setActive(false));
  const tl = timeline(stage);
  // a cortical column: a narrow cylinder of cells through all six layers that work as one unit (e.g. all respond to one
  // whisker, or one line orientation). Its own cells appear with it, so every layer has some.
  const COL = { x: 0.25, z: 0, r: 0.55 };
  const colCells = new THREE.Group(); colCells.visible = false; stage.root.add(colCells);
  [['l4', 'st', 0.1], ['l4', 'st', 0.45], ['l2', 'st', 0.35], ['l3', 'py', 0.3], ['l5', 'py', 0.2], ['l6', 'py', 0.3]].forEach(([ly, k, x]) => (k === 'st' ? stellate(ly, x, -0.1, colCells) : pyramidal(ly, x, -0.15, 1, colCells)));
  const colCyl = cyl(COL.r, COL.r, 1.6 - bottom, '#f97316', { opacity: 0.1 }); colCyl.material.depthWrite = false; colCyl.position.set(COL.x, (1.6 + bottom) / 2, COL.z); colCyl.visible = false; stage.root.add(colCyl);
  const inCol = cells.filter((c) => Math.abs(c.g.position.x - COL.x) < COL.r && (c.g.parent === colCells || c.g.parent === stage.root));
  const ORDER = ['l4', 'l3', 'l2', 'l5', 'l6'];
  let colT = -1, lastLayer = '';
  const glow = (c, k) => c.g.traverse((o) => { if (o.isMesh) o.material.emissive.set('#fb923c').multiplyScalar(k); });

  // ---------------------------------------------------------------- the layer ruler (HTML, beside the slice)
  const ruler = document.createElement('div');
  ruler.className = 'cx-ruler';
  ruler.innerHTML = LAYERS.map(([id, rom, , color, , , ren, rhe]) => `<button class="cx-l" data-l="${id}" style="--c:${color}"><b>${rom}</b><span>${L(ren, rhe)}</span></button>`).join('');
  stage.addHtml(ruler);
  const tip = document.createElement('div');
  tip.className = 'cx-tip'; tip.hidden = true;
  stage.addHtml(tip);
  let picked = null; // a layer picked from the ruler (stays lit until picked again or another one)
  const info = (id) => { const l = LAYERS.find((x) => x[0] === id); return l && `<b>${L(l[4], l[5])}</b><br>${L(l[8], l[9])}`; };
  const light = (id) => {
    stage.focus(id ? [id] : []);
    ruler.querySelectorAll('.cx-l').forEach((b) => b.classList.toggle('on', b.dataset.l === id));
    tip.hidden = !id;
    if (id) { tip.innerHTML = info(id); tip.dataset.l = id; }
  };
  ruler.querySelectorAll('.cx-l').forEach((b) => {
    const id = b.dataset.l;
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !picked) light(id); });
    b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !picked) light(null); });
    b.addEventListener('focus', () => { if (!picked) light(id); });
    b.addEventListener('blur', () => { if (!picked) light(null); });
    b.addEventListener('click', () => { picked = picked === id ? null : id; light(picked); readout(picked ? info(picked) : ''); });
  });
  const v3 = new THREE.Vector3();
  const place = () => {
    const show = !stage.realShown && !stage.isolated && !stage.comparing;
    ruler.hidden = !show; if (!show) { tip.hidden = true; return; }
    const w = stage.container.clientWidth, h = stage.container.clientHeight;
    // each button sits level with its layer, just left of the slice's front-left edge; with too little room (phones)
    // the buttons show only the numeral, and the name comes in the tip
    let left = Infinity;
    const ys = LAYERS.map(([id]) => { v3.set(-W / 2, mids[id], D / 2).project(stage.camera); left = Math.min(left, (v3.x + 1) / 2 * w); return (1 - v3.y) / 2 * h; });
    const narrow = left < 190;
    ruler.classList.toggle('narrow', narrow);
    const x = `${Math.max(narrow ? 40 : 4, left - 8)}px`;
    ruler.style.setProperty('--x', x); tip.style.setProperty('--x', x);
    ruler.querySelectorAll('.cx-l').forEach((b, i) => { b.style.top = `${ys[i].toFixed(1)}px`; });
    if (!tip.hidden) { const i = LAYERS.findIndex((l) => l[0] === tip.dataset.l); tip.style.top = `${ys[i].toFixed(1)}px`; }
  };

  stage.onUpdate((dt) => {
    place();
    if (colT < 0) return;
    colT += dt;
    const step = Math.floor(colT / 0.9);
    cells.forEach((c) => glow(c, 0));
    const ly = ORDER[step];
    if (ly) { inCol.filter((c) => c.layer === ly || (ly === 'l3' && c.layer === 'l2' && colT % 0.9 > 0.45)).forEach((c) => glow(c, 0.9)); if (ly !== lastLayer) { lastLayer = ly; stage.focus([ly]); } }
    const names = { l4: L('IV: input from the thalamus', 'IV: קלט מהתלמוס'), l3: L('II/III: talk to neighbouring columns', 'II/III: מדברים עם עמודות שכנות'), l2: L('II/III: talk to neighbouring columns', 'II/III: מדברים עם עמודות שכנות'), l5: L('V: output to the brainstem and spinal cord', 'V: פלט לגזע המוח ולחוט השדרה'), l6: L('VI: feedback to the thalamus', 'VI: משוב לתלמוס') };
    readout(ly ? `${L('Column active, layer', 'העמודה פעילה, שכבה')} ${names[ly]}` : L('The column has finished: input in, processed, sent out.', 'העמודה סיימה: קלט נכנס, עובד ונשלח החוצה.'));
    if (!ly && colT > ORDER.length * 0.9 + 2) { colT = -1; cells.forEach((c) => glow(c, 0)); stage.focus([]); readout(''); }
  });
  return {
    // nearly face-on, like the book's figure (a little from the right and above, so it still reads as 3D)
    home: { pos: V(1.6, 0.9, 7.4), target: V(0, -0.35, 0) },
    actions: [
      { icon: '📥', label: B('Follow a signal through the layers', 'מעקב אחר אות דרך השכבות'), caption: B('Sensory input from the thalamus (blue axons) arrives in layer IV → passes up to layers II/III → then down to layer V, whose big pyramidal cells send the output out of the cortex.', 'קלט חושי מהתלמוס (אקסונים כחולים) מגיע לשכבה IV ← עולה לשכבות II/III ← ואז יורד לשכבה V, שהתאים הפירמידליים הגדולים שלה שולחים את הפלט אל מחוץ לקליפה.'), run: () => {
        curves.forEach((c) => c.setActive(false));
        showThalamic(true);
        const seq = [['l4'], ['l2', 'l3'], ['l5'], ['white']];
        curves.forEach((c, i) => tl.later(i * 1.3, () => { c.setActive(true); stage.focus(seq[i]); }));
        tl.later(6.5, () => { curves.forEach((c) => c.setActive(false)); stage.focus([]); showThalamic(false); });
      } },
      { icon: '🎯', label: B('Input vs output layers', 'שכבות קלט ופלט'), caption: B('Layer IV (green) receives input from the thalamus (blue axons); layer V (blue) sends output. Sensory cortex has a thick layer IV; motor cortex has a thick layer V. The stained wall shows it too: layer IV is a dense band of small cells, layer V has scattered big ones.', 'שכבה IV (ירוק) מקבלת קלט מהתלמוס (אקסונים כחולים); שכבה V (כחול) שולחת פלט. בקליפה החושית שכבה IV עבה; בקליפה המוטורית שכבה V עבה. גם הקיר הצבוע מראה זאת: שכבה IV היא פס צפוף של תאים קטנים, ובשכבה V יש תאים גדולים ופזורים.'), run: () => { showThalamic(true); stage.focus(['l4', 'l5']); } },
      { icon: '🏛️', label: B('Fire one cortical column', 'הפעלת עמודה אחת'), toggle: true, caption: B('The cortex is built of thin columns (about 0.5 mm wide) running through all six layers. The cells in one column respond to the same thing, for example one whisker of a mouse or one line angle in vision. Watch the column light up layer by layer: IV → II/III → V → VI.', 'הקליפה בנויה מעמודות דקות (ברוחב של כ-0.5 מ"מ) שעוברות דרך כל שש השכבות. התאים בעמודה אחת מגיבים לאותו דבר, למשל לשפם אחד של עכבר או לזווית קו אחת בראייה. צפו בעמודה נדלקת שכבה אחרי שכבה: IV ← II/III ← V ← VI.'), run: (on) => { colCyl.visible = on; colCells.visible = on; colT = on ? 0 : -1; lastLayer = ''; if (!on) { cells.forEach((c) => glow(c, 0)); stage.focus([]); readout(''); } } },
      { icon: '🧫', label: B('Show the real density', 'הצגת הצפיפות האמיתית'), toggle: true, caption: B('Only a few typical cells are drawn so the layers are easy to see. Real cortex is packed: tens of thousands of neurons in every cubic millimetre, their branches woven together. This adds a crowd of cells.', 'רק כמה תאים טיפוסיים מצוירים כדי שהשכבות יהיו ברורות. הקליפה האמיתית צפופה: עשרות אלפי נוירונים בכל מילימטר מעוקב, והענפים שלהם שזורים זה בזה. זה מוסיף המון תאים.'), run: (on) => { crowd.visible = on; stage.needsRender = true; } },
      { icon: '🩸', label: B('Show blood vessels', 'הצגת כלי הדם'), toggle: true, caption: B('Arteries run over the surface and dive straight down, branching into capillaries in every layer: the brain uses about a fifth of the body\'s oxygen.', 'עורקים עוברים על פני השטח וצוללים ישר למטה, ומתפצלים לנימים בכל שכבה: המוח צורך כחמישית מהחמצן של הגוף.'), run: (on) => { vessels.visible = on; stage.needsRender = true; } },
    ],
  };
}

// ---------------- Nerve cross-section ----------------
function nerveScene(stage, { readout, L }) {
  const R = seeded(3);
  P(stage, 'epineurium', 'Epineurium (outer sheath)', 'אפינאוריום (מעטפת חיצונית)', 'Tough connective tissue wrapping the whole nerve.', 'רקמת חיבור חזקה שעוטפת את העצב כולו.', '#f1d6c4', [2]);
  P(stage, 'fascicle', 'Fascicle (bundle)', 'פסיקול (צרור)', 'A bundle of axons wrapped in its own sheath (perineurium).', 'צרור של אקסונים עטוף במעטפת משלו (פרינאוריום).', '#fbcfe8', [2]);
  P(stage, 'myelinated', 'Myelinated axon', 'אקסון עטוף מיאלין', 'An axon wrapped by a Schwann cell\'s myelin (this is a peripheral nerve). Fast conduction.', 'אקסון שעטוף במיאלין של תא שוואן (זהו עצב היקפי). הולכה מהירה.', '#fef3c7', [2, 3]);
  P(stage, 'unmyelinated', 'Unmyelinated axons', 'אקסונים ללא מיאלין', 'Thin axons without myelin — slow, e.g. some pain and temperature fibres.', 'אקסונים דקים בלי מיאלין — איטיים, למשל חלק מסיבי הכאב והטמפרטורה.', '#94a3b8', [2, 7]);
  P(stage, 'vessel', 'Blood vessel', 'כלי דם', 'Nerves have their own blood supply.', 'לעצבים יש אספקת דם משלהם.', '#dc2626', [2]);
  const g = new THREE.Group();
  g.rotation.x = Math.PI / 2;
  stage.root.add(g);
  const LEN = 3, TOP = LEN / 2; // the cut face (toward the viewer) is at y = TOP in this group
  // drawn the way histology textbooks draw a nerve in cross-section (src/visual/cells.js): an opaque cable whose cut
  // face shows the connective tissue (with fat cells), each fascicle ringed by its layered perineurium, and inside it
  // myelinated axons (an orange axon in a thick white ring of myelin, some with their Schwann-cell nucleus) and
  // Remak bundles (several thin bare axons sunk into one Schwann cell)
  const axons = [], slow = [];
  const fas = [[-0.95, -0.7, 0.85], [1.0, -0.6, 0.8], [0, 1.1, 0.85], [-1.4, 0.9, 0.5], [1.45, 0.95, 0.5]];
  const VES = [[0, -1.6], [-1.9, -0.2], [2.0, 0.1]];
  // epineurium: the outside wall, and its cut face with holes for the fascicles and vessels, dotted with fat cells
  // the wall runs a little past the far ends of the fascicles and is closed there, so the nerve looks solid from behind too
  const side = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, LEN + 0.12, 64, 1, true).translate(0, -0.06, 0), mat('#eccbb6', { rough: 0.85 }));
  stage.add(side, 'epineurium', g);
  stage.add(new THREE.Mesh(new THREE.CircleGeometry(2.5, 64).rotateX(Math.PI / 2).translate(0, -TOP - 0.12, 0), mat('#eccbb6', { rough: 0.85 })), 'epineurium', g);
  stage.add(new THREE.Mesh(cutFaceGeo(2.5, [...fas.map(([x, z, r]) => ({ x, z, r: r + 0.02 })), ...VES.map(([x, z]) => ({ x, z, r: 0.2 }))]).translate(0, TOP, 0), mat('#f3d9c8', { rough: 0.9 })), 'epineurium', g);
  const fat = [];
  for (let i = 0; i < 160 && fat.length < 26; i++) {
    const a = R() * Math.PI * 2, d = 0.4 + Math.sqrt(R()) * 1.9, x = Math.cos(a) * d, z = Math.sin(a) * d, r = 0.08 + R() * 0.08;
    if (d + r > 2.42 || fas.some(([fx, fz, fr]) => Math.hypot(x - fx, z - fz) < fr + r + 0.05) || VES.some(([vx, vz]) => Math.hypot(x - vx, z - vz) < 0.3 + r) || fat.some((f) => Math.hypot(x - f.x, z - f.z) < f.r + r + 0.02)) continue;
    fat.push({ x, z, r });
  }
  stage.add(meshOf(fat.map((f) => ringFaceGeo(f.x, TOP + 0.004, f.z, 0, f.r, 20)), mat('#fffbeb', { rough: 0.6 })), 'epineurium', g);
  stage.add(meshOf(fat.map((f) => ringFaceGeo(f.x, TOP + 0.006, f.z, f.r - 0.012, f.r, 20)), mat('#d6a98f')), 'epineurium', g);
  fas.forEach(([x, z, rr]) => {
    // place the axons without overlaps: myelinated (various sizes) and Remak bundles
    const items = [];
    for (let tries = 0; tries < 900 && items.length < rr * rr * 26; tries++) {
      const myel = R() < 0.78, r = myel ? 0.08 + R() * 0.07 : 0.11;
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * (rr - 0.12 - r);
      const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
      if (items.some((o) => Math.hypot(px - o.x, pz - o.z) < o.r + r + 0.025)) continue;
      items.push({ x: px, z: pz, r, myel });
    }
    // perineurium (two layers) and the endoneurium face between the axons
    const per = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, LEN + 0.05, 48, 1, true), mat('#f9a8d4'));
    per.position.set(x, 0, z);
    stage.add(per, 'fascicle', g);
    stage.add(meshOf([ringFaceGeo(x, TOP + 0.025, z, rr - 0.07, rr, 48), ringFaceGeo(x, TOP + 0.027, z, rr - 0.035, rr - 0.025, 48)], mat('#f472b6')), 'fascicle', g);
    stage.add(new THREE.Mesh(cutFaceGeo(rr - 0.07, items.map((o) => ({ x: o.x - x, z: o.z - z, r: o.r + 0.006 }))).translate(x, TOP + 0.015, z), mat('#f2c6d8', { rough: 0.9 })), 'fascicle', g);
    const sheath = [], lamellae = [], nuclei = [], remak = [];
    for (const o of items) {
      if (o.myel) {
        const ar = o.r * 0.55;
        const s = new THREE.CylinderGeometry(o.r, o.r, LEN + 0.1, 20, 1, true); s.translate(o.x, 0, o.z); sheath.push(s);
        sheath.push(ringFaceGeo(o.x, TOP + 0.05, o.z, ar, o.r, 24));
        lamellae.push(ringFaceGeo(o.x, TOP + 0.052, o.z, ar + (o.r - ar) * 0.33, ar + (o.r - ar) * 0.33 + 0.006, 24), ringFaceGeo(o.x, TOP + 0.052, o.z, ar + (o.r - ar) * 0.66, ar + (o.r - ar) * 0.66 + 0.006, 24));
        if (R() < 0.3) { const a = R() * Math.PI * 2; nuclei.push(lumpGeo(V(o.x + Math.cos(a) * (o.r + 0.02), TOP + 0.03, o.z + Math.sin(a) * (o.r + 0.02)), 0.035, { stretch: [1.4, 0.6, 0.7], rot: [0, -a + Math.PI / 2, 0], seed: a })); }
        const ax = cyl(ar, ar, LEN + 0.16, '#f59e0b', undefined, 16);
        ax.position.set(o.x, 0, o.z);
        stage.add(ax, 'myelinated', g);
        axons.push(ax);
      } else {
        const s = new THREE.CylinderGeometry(o.r, o.r, LEN + 0.06, 20); s.translate(o.x, 0, o.z); remak.push(s);
        for (let k = 0; k < 4; k++) { const a = k * 1.6 + R(); const u = cyl(0.026, 0.026, LEN + 0.12, '#94a3b8', undefined, 8); u.position.set(o.x + Math.cos(a) * 0.055, 0, o.z + Math.sin(a) * 0.055); stage.add(u, 'unmyelinated', g); slow.push(u); }
      }
    }
    if (sheath.length) stage.add(meshOf(sheath, mat('#fef9ee', { rough: 0.45 })), 'myelinated', g);
    if (lamellae.length) stage.add(meshOf(lamellae, mat('#e7dcc6')), 'myelinated', g);
    if (nuclei.length) stage.add(meshOf(nuclei, mat('#6d28d9')), 'myelinated', g);
    if (remak.length) stage.add(meshOf(remak, mat('#e2e8f0', { rough: 0.6 })), 'unmyelinated', g);
  });
  // small arteries: a thick red wall, a dark lumen and a red blood cell inside
  VES.forEach(([x, z]) => {
    const wall = new THREE.CylinderGeometry(0.2, 0.2, LEN + 0.04, 24, 1, true); wall.translate(x, 0, z);
    stage.add(meshOf([wall, ringFaceGeo(x, TOP + 0.02, z, 0.12, 0.2, 24)], mat('#b91c1c')), 'vessel', g);
    stage.add(new THREE.Mesh(ringFaceGeo(x, TOP + 0.005, z, 0, 0.12, 24), mat('#450a0a')), 'vessel', g);
    const rbc = new THREE.Mesh(rbcGeo(0.075), mat('#dc2626', { side: THREE.DoubleSide })); rbc.position.set(x + 0.02, TOP + 0.01, z); rbc.rotation.x = 0.6; stage.add(rbc, 'vessel', g);
  });
  // A signal is shown as a bright ring sliding along each axon (the nerve runs toward the viewer). Myelinated rings
  // jump in big steps (node to node) and arrive fast; unmyelinated rings creep. Lidocaine stops both.
  const ringFor = (a, r, color) => { const ring = torus(r, r * 0.35, color, { emissive: color }); ring.rotation.x = Math.PI / 2; ring.position.copy(a.position); ring.visible = false; g.add(ring); return ring; };
  const fastRings = axons.map((a) => ringFor(a, a.geometry.parameters.radiusTop * 1.9, '#fde047'));
  const slowRings = slow.filter((_, i) => i % 3 === 0).map((a) => ringFor(a, 0.06, '#e2e8f0'));
  let firing = 0, ft = 0, lido = false, mode = 'all', arrivedFast = 0, arrivedSlow = 0;
  stage.onUpdate((dt, t) => {
    if (firing <= 0) { fastRings.concat(slowRings).forEach((r) => { r.visible = false; }); return; }
    firing -= dt; ft += dt;
    const blocked = lido;
    const fastOn = !blocked && mode !== 'slow', slowOn = !blocked && mode !== 'fast';
    // along the local y axis of g: −L/2 (far end) … +L/2 (the cut face, toward the viewer); one sweep = one signal
    const fastY = -LEN / 2 + (Math.floor((ft * 2.2 % 1) * 6) / 5) * LEN; // 6 jumps per sweep, about 2 sweeps a second
    const slowY = -LEN / 2 + ((ft * 0.25) % 1) * LEN; // smooth, ten times slower
    if (fastOn && ft * 2.2 % 1 < dt * 2.2) arrivedFast++;
    if (slowOn && ft * 0.25 % 1 < dt * 0.25) arrivedSlow++;
    fastRings.forEach((r, i) => { r.visible = fastOn; r.position.y = fastY; });
    slowRings.forEach((r) => { r.visible = slowOn; r.position.y = slowY; });
    axons.forEach((a, i) => { const on = fastOn && Math.sin(t * 9 + i * 1.7) > 0.6; a.material.emissive.set(on ? '#f59e0b' : '#000000').multiplyScalar(on ? 0.9 : 0); });
    readout(blocked ? `🦷 ${L('Lidocaine blocks the Na⁺ channels: no signal gets through, fast or slow', 'לידוקאין חוסם את תעלות ה-Na⁺: שום אות לא עובר, לא מהיר ולא איטי')}`
      : `${L('Myelinated (touch, muscle): ~50–120 m/s', 'עם מיאלין (מגע, שריר): ~50–120 מ\'/שנ\'')} · ${L('arrived', 'הגיעו')} <b>${arrivedFast}</b><br>${L('Unmyelinated (dull pain, warmth): ~1 m/s', 'בלי מיאלין (כאב עמום, חום): ~1 מ\'/שנ\'')} · ${L('arrived', 'הגיעו')} <b>${arrivedSlow}</b>`);
  });
  const go = (m) => { mode = m; firing = 8; ft = 0; arrivedFast = arrivedSlow = 0; };
  return {
    home: { pos: V(2.6, 3.0, 7.2), target: V(0, -0.2, 0) }, // from above and to the side, so the cut face and the cable both show
    actions: [
      { icon: '⚡', label: B('Send signals', 'שליחת אותות'), caption: B('Each axon carries its own signals independently — a nerve is like a cable with thousands of separate wires. The rings show signals running along the axons toward you.', 'כל אקסון מוליך את האותות שלו באופן עצמאי — עצב הוא כמו כבל עם אלפי חוטים נפרדים. הטבעות מראות אותות שרצים לאורך האקסונים לכיוונכם.'), run: () => { go('all'); stage.focus([]); } },
      { icon: '🏎️', label: B('Fast fibres vs slow fibres', 'סיבים מהירים מול איטיים'), radio: true, caption: B('Myelinated axons (yellow rings) jump from node to node and are fast; thin unmyelinated axons (grey rings) creep. That is why, when you stub a toe, you feel a sharp pain first and a dull ache a second later.', 'אקסונים עם מיאלין (טבעות צהובות) קופצים מצומת לצומת ומהירים; אקסונים דקים בלי מיאלין (טבעות אפורות) זוחלים. לכן כשנתקלים בבוהן מרגישים קודם כאב חד ושנייה אחר כך כאב עמום.'), run: () => { go('all'); stage.focus(['myelinated', 'unmyelinated']); } },
      { icon: '🦷', label: B('Local anaesthetic (lidocaine)', 'הרדמה מקומית (לידוקאין)'), toggle: true, caption: B('The dentist\'s injection: lidocaine blocks the Na⁺ channels of the axons in the nerve, so no signal can pass that point. The tooth is fine, but the message "pain" never reaches the brain.', 'הזריקה אצל רופא השיניים: לידוקאין חוסם את תעלות ה-Na⁺ של האקסונים בעצב, ולכן שום אות לא עובר את הנקודה. השן בסדר, אבל המסר "כאב" לא מגיע למוח.'), run: (on) => { lido = on; if (firing <= 0) go('all'); } },
      { icon: '⚪', label: B('Why is white matter white?', 'למה החומר הלבן לבן?'), caption: B('Myelin is fatty and pale. Where myelinated axons dominate (white matter, nerves) tissue looks white; where cell bodies dominate (cortex, nuclei) it looks gray.', 'המיאלין שומני ובהיר. היכן שאקסונים עטופי מיאלין שולטים (חומר לבן, עצבים) הרקמה נראית לבנה; היכן שגופי תאים שולטים (קליפה, גרעינים) היא נראית אפורה.'), run: () => stage.focus(['myelinated']) },
    ],
  };
}

// ---------------- Blood–brain barrier ----------------
function bbbScene(stage, { readout, L }) {
  P(stage, 'endothelium', 'Endothelial cells', 'תאי אנדותל', 'The cells lining the capillary. In the brain they are sealed together by tight junctions — the core of the barrier.', 'התאים שמצפים את הנימים. במוח הם צמודים זה לזה בצמתים הדוקים — לב המחסום.', '#fca5a5', [2]);
  P(stage, 'tight', 'Tight junctions', 'צמתים הדוקים', 'Protein seals between endothelial cells. Elsewhere in the body capillaries have gaps; in the brain they do not.', 'אטמים חלבוניים בין תאי האנדותל. במקומות אחרים בגוף יש בנימים פערים; במוח אין.', '#b91c1c', [2]);
  P(stage, 'endfeet', 'Astrocyte end-feet', 'רגליות של אסטרוציטים', 'Astrocytes wrap the capillaries and help build and maintain the barrier.', 'אסטרוציטים עוטפים את הנימים ועוזרים לבנות ולתחזק את המחסום.', '#a78bfa', [2, 3]);
  P(stage, 'blood', 'Blood (capillary lumen)', 'דם (חלל הנים)', 'Red blood cells and everything dissolved in the blood.', 'כדוריות דם אדומות וכל מה שמומס בדם.', '#ef4444', [2]);
  const g = new THREE.Group();
  g.rotation.z = Math.PI / 2;
  stage.root.add(g);
  const segs = [], tjs = [];
  P(stage, 'glut', 'Glucose transporters (GLUT1)', 'מובילי גלוקוז (GLUT1)', 'Doors in the endothelial cells made only for glucose. The brain cannot store fuel, so these carry about 100 g of glucose into it every day.', 'דלתות בתאי האנדותל שמיועדות רק לגלוקוז. המוח לא יכול לאגור דלק, ולכן הן מעבירות אליו כ-100 גרם גלוקוז בכל יום.', '#facc15', [2]);
  // drawn the textbook way (src/visual/cells.js): the capillary cut open along its length, so the wall shows its
  // thickness; endothelial cells with their nuclei, beaded tight-junction strands at the seams, the basement
  // membrane, a pericyte, and astrocyte end-feet on stalks from an astrocyte above. (Angles: x = r·sin a, z = r·cos a;
  // in this group x is up and z is toward the viewer, so the window a ∈ (OPEN0, OPEN1) faces the camera.)
  const OPEN0 = Math.PI / 4 - 0.95, OPEN1 = Math.PI / 4 + 0.95, A0 = OPEN1, A1 = OPEN0 + Math.PI * 2;
  const at = (r, a, y) => V(r * Math.sin(a), y, r * Math.cos(a));
  const R = seeded(8);
  for (let i = 0; i < 4; i++) {
    const y = (i - 1.5) * 1.5;
    const seg = new THREE.Group();
    // two endothelial cells per ring, meeting along a seam at the back
    const mid = (A0 + A1) / 2;
    seg.add(new THREE.Mesh(arcWallGeo(1.08, 1.2, A0, mid - 0.012, 1.45), mat(i % 2 ? '#fca5a5' : '#f8b4b4', { rough: 0.6 })));
    seg.add(new THREE.Mesh(arcWallGeo(1.08, 1.2, mid + 0.012, A1, 1.45), mat(i % 2 ? '#f8b4b4' : '#fca5a5', { rough: 0.6 })));
    // each cell's nucleus bulges into the lumen
    for (const a of [mid - 1.1 + (i % 2) * 0.5, mid + 1.0 - (i % 2) * 0.4]) {
      const n = new THREE.Mesh(lumpGeo(V(0, 0, 0), 0.2, { stretch: [0.45, 1.5, 1], seed: i * 2 + a, amp: 0.08 }), mat('#9d4f7a'));
      n.position.copy(at(1.06, a, (R() - 0.5) * 0.5)); n.rotation.y = a; seg.add(n);
    }
    seg.position.y = y;
    stage.add(seg, 'endothelium', g); segs.push(seg);
    if (i) { // tight junctions: rows of beads sealing the seam between this ring of cells and the last
      const pts = [];
      for (let k = 0; k <= 70; k++) { const a = A0 + 0.04 + ((A1 - A0 - 0.08) * k) / 70; for (const dy of [-0.035, 0.035]) pts.push(at(1.14, a, (i - 2) * 1.5 + dy + Math.sin(k * 1.7) * 0.012)); }
      const tj = new THREE.Mesh(ballsGeo(pts, 0.032, 7, 5), mat('#b91c1c', { emissive: '#450a0a' }));
      stage.add(tj, 'tight', g); tjs.push(tj);
    }
    // GLUT1 transporters on both faces of the cells (a small bundle of helices each)
    for (const a of [2.4, 3.5, 4.6, 5.7]) for (const r of [1.06, 1.22]) {
      const gl = meshOf([0, 1, 2, 3].map((k) => helixGeo(V(Math.cos(k * 1.57) * 0.05, -0.09, Math.sin(k * 1.57) * 0.05), V(Math.cos(k * 1.57) * 0.05, 0.09, Math.sin(k * 1.57) * 0.05), { r: 0.025, tube: 0.013, pitch: 0.05 })), mat('#facc15', { emissive: '#713f12' }));
      gl.position.copy(at(r, a + (i % 2) * 0.3, y + 0.35)); gl.quaternion.setFromUnitVectors(V(0, 1, 0), at(1, a + (i % 2) * 0.3, 0));
      stage.add(gl, 'glut', g);
    }
  }
  // basement membrane: a thin sheet round the outside of the endothelium
  P(stage, 'basal', 'Basement membrane', 'קרום בסיסי', 'A thin mat of proteins (collagen, laminin) that the endothelial cells, the pericyte and the astrocyte end-feet all hold on to.', 'מחצלת דקה של חלבונים (קולגן, למינין) שתאי האנדותל, הפריציט ורגליות האסטרוציטים נאחזים בה.', '#e9d5ff', [2]);
  const basal = new THREE.Mesh(arcWallGeo(1.21, 1.25, A0, A1, 6), mat('#e9d5ff', { opacity: 0.45 }));
  basal.material.depthWrite = false; stage.add(basal, 'basal', g);
  // pericyte: a flat cell with long arms that wrap the capillary, under the basement membrane, beside the window
  P(stage, 'pericyte', 'Pericyte', 'פריציט', 'A cell wrapped round the capillary under the basement membrane. Pericytes help seal the barrier and can squeeze the capillary to control blood flow.', 'תא שעוטף את הנים מתחת לקרום הבסיסי. פריציטים עוזרים לאטום את המחסום ויכולים לכווץ את הנים כדי לווסת את זרימת הדם.', '#fb923c', [2]);
  const PA = OPEN0 - 0.35;
  const peri = [lumpGeo(at(1.27, PA, 0.3), 0.2, { stretch: [0.6, 1.4, 1], seed: 5, rot: [0, PA, 0] })];
  for (const [dy, da] of [[1.4, -0.5], [-1.2, -0.7], [0.9, 0.3], [-0.8, 0.25]]) peri.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([0, 0.33, 0.66, 1].map((t) => at(1.25, PA + da * t, 0.3 + dy * t))), 24, 0.05 * 0.9, 6, false));
  stage.add(meshOf(peri, mat('#fb923c')), 'pericyte', g);
  for (let i = 0; i < 6; i++) { const rbc = new THREE.Mesh(rbcGeo(0.32), mat('#dc2626', { side: THREE.DoubleSide, rough: 0.4 })); rbc.position.set(rand(-0.5, 0.5), (i - 2.5) * 1, rand(-0.5, 0.5)); rbc.rotation.set(rand(0, 3), rand(0, 3), 0); stage.add(rbc, 'blood', g); }
  // astrocyte end-feet: curved pads pressed on the outside of the wall, each on a stalk from one astrocyte above
  const ASTRO = at(2.9, Math.PI * 0.75, 0.2);
  const feet = [], stalks = [lumpGeo(ASTRO, 0.42, { seed: 3, amp: 0.15 })];
  [[A0 + 0.7, -1.5], [A0 + 0.7, 1.5], [Math.PI * 0.95, 0], [Math.PI * 1.25, -1.6], [Math.PI * 1.3, 1.4], [Math.PI * 1.55, 0.1]].forEach(([a, y], i) => {
    const pad = arcWallGeo(1.26, 1.38, a - 0.42, a + 0.42, 1.25); pad.translate(0, y, 0); feet.push(pad);
    // each stalk runs round the outside of the capillary (never through the open lumen)
    stalks.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([0, 0.25, 0.5, 0.75, 1].map((t) => at(2.9 + (1.42 - 2.9) * Math.sqrt(t), Math.PI * 0.75 + (a - Math.PI * 0.75) * t, 0.2 + (y - 0.2) * t))), 32, 0.08, 6, false));
  });
  stage.add(meshOf(feet, mat('#a78bfa', { opacity: 0.9 })), 'endfeet', g);
  stage.add(meshOf(stalks, mat('#8b5cf6')), 'endfeet', g);
  // Molecules trying to cross
  const KINDS = {
    o2: { color: '#60a5fa', r: 0.08, pass: true, msg: B('O₂ and CO₂ are tiny and dissolve in membranes — they pass freely.', 'O₂ ו-CO₂ זעירים ומתמוססים בממברנות — הם עוברים בחופשיות.') },
    glucose: { color: '#facc15', r: 0.13, pass: true, slow: true, msg: B('Glucose is needed by the brain, so special transporter proteins carry it across.', 'המוח זקוק לגלוקוז, ולכן חלבוני הובלה מיוחדים מעבירים אותו.') },
    fat: { color: '#22c55e', r: 0.14, pass: true, msg: B('Fat-soluble drugs (e.g. alcohol, nicotine, heroin) slip through the cell membranes — that is why they affect the brain so quickly.', 'סמים מסיסים בשומן (למשל אלכוהול, ניקוטין, הרואין) חומקים דרך ממברנות התאים — ולכן הם משפיעים על המוח כל כך מהר.') },
    big: { color: '#f43f5e', r: 0.26, pass: false, msg: B('Large or charged molecules (many toxins, most proteins, bacteria) are blocked — the barrier protects the brain. (It also blocks many useful medicines.)', 'מולקולות גדולות או טעונות (רעלנים רבים, רוב החלבונים, חיידקים) נחסמות — המחסום מגן על המוח. (הוא גם חוסם תרופות שימושיות רבות.)') },
  };
  const mols = [];
  let stats = { pass: 0, blocked: 0 }, leaky = false;
  const send = (kind) => {
    const k = KINDS[kind];
    for (let i = 0; i < 10; i++) {
      const s = sphere(k.r, k.color, { emissive: k.color });
      s.material.emissive.multiplyScalar(0.3);
      const a = rand(0, Math.PI * 2);
      const dir = V(Math.cos(a), 0, Math.sin(a));
      s.position.set(rand(-0.3, 0.3), rand(-2.5, 2.5), rand(-0.3, 0.3));
      g.add(s);
      mols.push({ s, k, dir, d: 0, delay: i * 0.12, state: 'out' });
    }
  };
  stage.onUpdate((dt) => {
    for (let i = mols.length - 1; i >= 0; i--) {
      const m = mols[i];
      if (m.delay > 0) { m.delay -= dt; continue; }
      const sp = m.k.slow ? 0.9 : 1.6;
      if (m.state === 'out') {
        m.d += dt * sp;
        if (!m.k.pass && !leaky && m.d > 1.0) { m.state = 'back'; stats.blocked++; }
        if (m.d > 3.2) { g.remove(m.s); m.s.geometry.dispose(); m.s.material.dispose(); mols.splice(i, 1); stats.pass++; continue; }
      } else {
        m.d -= dt * sp;
        if (m.d < 0.1) { g.remove(m.s); m.s.geometry.dispose(); m.s.material.dispose(); mols.splice(i, 1); continue; }
      }
      const base = V(m.s.position.x, m.s.position.y, m.s.position.z);
      m.s.position.set(m.dir.x * m.d, base.y, m.dir.z * m.d);
    }
    segs.forEach((sg, i) => { sg.scale.y += ((leaky ? 0.9 : 1) - sg.scale.y) * Math.min(1, dt * 3); });
    readout(`${leaky ? '⚠️ ' + L('Leaky capillary (like the rest of the body)', 'נים דולף (כמו בשאר הגוף)') + '<br>' : ''}${L('Crossed into the brain', 'עברו למוח')}: <b>${stats.pass}</b> &nbsp; ${L('Blocked', 'נחסמו')}: <b>${stats.blocked}</b>`);
  });
  const act = (kind, icon, en, he) => ({ icon, label: B(en, he), caption: KINDS[kind].msg, run: () => send(kind) });
  return {
    home: { pos: V(0, 3, 9), target: V(0, 0, 0) },
    actions: [
      act('o2', '🔵', 'Oxygen', 'חמצן'),
      act('glucose', '🟡', 'Glucose', 'גלוקוז'),
      act('fat', '🟢', 'Fat-soluble drug', 'סם מסיס בשומן'),
      act('big', '🔴', 'Large molecule / toxin', 'מולקולה גדולה / רעלן'),
      { icon: '🕳️', label: B('Compare: a body capillary', 'השוואה: נים בגוף'), toggle: true, caption: B('In a muscle or the gut, capillary cells have gaps between them and no tight seals, so large molecules leak straight out. Send the large molecule again: in the brain it is stopped, here it gets through. Inflammation, strokes and some infections can make brain capillaries leaky like this.', 'בשריר או במעי יש רווחים בין תאי הנימים ואין אטמים הדוקים, ולכן מולקולות גדולות דולפות החוצה ישר. שלחו שוב את המולקולה הגדולה: במוח היא נעצרת, וכאן היא עוברת. דלקת, שבץ וחלק מהזיהומים יכולים להפוך נימים במוח לדולפים כך.'), run: (on) => { leaky = on; tjs.forEach((t) => { t.visible = !on; }); } },
    ],
  };
}

// ---------------- Retina ----------------
function retinaScene(stage, { L }) {
  // a layered section through the retina, drawn like the textbook figure (owner, 2026-11-15: better versions; redrawn
  // the same day for a better look). Light comes in from the top (the side facing the lens) and passes every layer
  // before reaching the rods and cones at the back; the signal then travels forward again: photoreceptor → bipolar →
  // ganglion → optic nerve.
  const R = seeded(11);
  const r = (a, b) => a + R() * (b - a);
  P(stage, 'ganglion', 'Ganglion cells', 'תאי גנגליון', 'The output cells of the retina; their dendrites spread in the inner synaptic layer and their axons run along the inner surface and leave the eye as the optic nerve. They sit at the FRONT, so light passes through them first.', 'תאי הפלט של הרשתית; הדנדריטים שלהם מתפרשים בשכבה הסינפטית הפנימית, והאקסונים שלהם רצים לאורך הפנים ויוצאים מהעין כעצב הראייה. הם יושבים בחזית, כך שהאור עובר דרכם קודם.', '#10b981', [6]);
  P(stage, 'bipolar', 'Bipolar cells', 'תאים דו-קוטביים', 'Carry signals from the photoreceptors to the ganglion cells.', 'מעבירים אותות מקולטני האור לתאי הגנגליון.', '#3b82f6', [6]);
  P(stage, 'horizontal', 'Horizontal & amacrine cells', 'תאים אופקיים ואמקריניים', 'Connect neighbouring cells sideways — they sharpen contrast (lateral inhibition).', 'מחברים תאים שכנים לרוחב — הם מחדדים ניגודיות (עיכוב צידי).', '#a855f7', [6]);
  P(stage, 'rods', 'Rods', 'קנים', 'About 120 million per eye. Very sensitive — work in dim light — but see no colour. Mostly in the periphery. The long outer segment is a stack of about 1,000 membrane discs full of rhodopsin.', 'כ-120 מיליון בכל עין. רגישים מאוד — פועלים באור עמום — אבל לא רואים צבע. בעיקר בפריפריה. המקטע החיצוני הארוך הוא ערימה של כאלף דיסקיות קרום מלאות רודופסין.', '#94a3b8', [6]);
  P(stage, 'cones', 'Cones', 'מדוכים', 'About 6 million per eye, packed in the fovea. Need bright light; three types give colour vision and sharp detail. The outer segment tapers to a point.', 'כ-6 מיליון בכל עין, דחוסים בגומית (פוביאה). צריכים אור חזק; שלושה סוגים מאפשרים ראיית צבעים ופרטים חדים. המקטע החיצוני מתחדד לחוד.', '#f59e0b', [6]);
  P(stage, 'pigment', 'Pigment epithelium', 'אפיתל פיגמנטרי', 'A row of dark cells behind the photoreceptors, full of melanin granules, whose fingers wrap the outer segments. They absorb stray light, recycle the light-catching pigment and eat the worn-out tips of the discs.', 'שורה של תאים כהים מאחורי קולטני האור, מלאים בגרגירי מלנין, שאצבעותיהם עוטפות את המקטעים החיצוניים. הם בולעים אור עודף, ממחזרים את הפיגמנט לוכד-האור ואוכלים את הקצוות הבלויים של הדיסקיות.', '#3f2a1d', [6]);
  P(stage, 'muller', 'Müller glia', 'תאי גליה של מולר', 'Tall glial cells that span the whole retina, from the photoreceptors to its inner surface, where their end-feet form the inner limiting membrane. They hold the layers together and guide light toward the photoreceptors.', 'תאי גליה גבוהים שמשתרעים לאורך כל הרשתית, מקולטני האור ועד פני השטח הפנימיים שלה, שם רגלי-הקצה שלהם יוצרות את הקרום הגבולי הפנימי. הם מחזיקים את השכבות יחד ומכוונים את האור אל קולטני האור.', '#67e8f9', [6]);
  P(stage, 'retvessels', 'Retinal capillaries', 'נימי הרשתית', 'Blood vessels run among the ganglion cells and feed the inner retina; the photoreceptors are fed from behind, through the pigment epithelium.', 'כלי דם עוברים בין תאי הגנגליון ומזינים את הרשתית הפנימית; קולטני האור מוזנים מאחור, דרך האפיתל הפיגמנטרי.', '#dc2626', [6]);
  const W = 4;
  // background bands: outer nuclear layer, inner nuclear layer, ganglion layer (pale, see-through)
  for (const [y, h, c] of [[-0.45, 0.65, '#f1e4d8'], [0.85, 0.5, '#e9e2f5'], [1.95, 0.42, '#e2f3ea']]) { const band = slab(W * 2, h, 2.2, c, 0.1); band.position.y = y; stage.root.add(band); }
  // pigment epithelium: a row of dark cells with melanin granules and fingers reaching up between the outer segments
  const rpe = [], mel = [], fingers = [];
  for (let i = 0; i < 16; i++) {
    const x = -W + 0.25 + i * ((2 * W - 0.5) / 15);
    rpe.push(new RoundedBoxGeometry(0.46, 0.34, 2.0, 2, 0.08).translate(x, -2.42, 0));
    for (let k = 0; k < 10; k++) mel.push(new THREE.SphereGeometry(0.035, 6, 5).translate(x + r(-0.18, 0.18), -2.3 + r(-0.04, 0.06), r(-0.9, 0.9)));
    for (const z of [-0.55, 0.55]) for (const dx of [-0.12, 0.12]) fingers.push(new THREE.CylinderGeometry(0.018, 0.026, 0.38, 5).translate(x + dx, -2.08, z + r(-0.1, 0.1)));
  }
  stage.add(meshOf(rpe, mat('#5b3a26', { rough: 0.7 })), 'pigment');
  stage.add(meshOf([...mel, ...fingers], mat('#2a1a10', { rough: 0.6 })), 'pigment');
  // photoreceptors: each one merged into a body mesh and a mesh of discs (both glow when it responds)
  const rods = [], cones = [];
  const discsGeo = (y0, y1, rOf, step) => { const out = []; for (let y = y0; y <= y1; y += step) { const t = (y - y0) / Math.max(1e-6, y1 - y0); out.push(new THREE.CylinderGeometry(rOf(t), rOf(t), step * 0.55, 10).translate(0, y, 0)); } return out; };
  for (let i = 0; i < 22; i++) {
    const x = -W + 0.25 + i * ((2 * W - 0.5) / 21);
    for (const z of [-0.55, 0.55]) {
      const cone = (i + (z > 0 ? 1 : 0)) % 4 === 0;
      const g = new THREE.Group();
      if (cone) {
        const body = [
          taperTube([V(0, -1.75, 0), V(0, -1.2, 0)], 0.15, spindle, '#fbbf24', undefined, 10, 10).geometry,      // inner segment (ellipsoid)
          new THREE.CylinderGeometry(0.03, 0.03, 0.82, 6).translate(0, -0.71, 0),                                // fibre
          new THREE.SphereGeometry(0.1, 12, 9).translate(0, -0.42, 0),                                            // nucleus
          new THREE.SphereGeometry(0.09, 12, 9).scale(1.5, 0.6, 1.5).translate(0, -0.1, 0),                        // pedicle
        ];
        g.add(meshOf(body, mat('#f59e0b', { rough: 0.45 })));
        g.add(meshOf(discsGeo(-2.18, -1.76, (t) => 0.045 + 0.085 * t, 0.035), mat('#fcd34d', { rough: 0.4 }))); // tapering stack of folds
        stage.add(g, 'cones'); cones.push(g);
      } else {
        const ny = -0.6 + (i % 3) * 0.13;
        const body = [
          new THREE.CylinderGeometry(0.06, 0.06, 0.42, 8).translate(0, -1.26, 0),                                 // inner segment
          new THREE.CylinderGeometry(0.022, 0.022, 1.0, 6).translate(0, -0.6, 0),                                // fibre
          new THREE.SphereGeometry(0.08, 10, 8).translate(0, ny, 0),                                              // nucleus
          new THREE.SphereGeometry(0.05, 10, 8).translate(0, -0.12, 0),                                           // spherule
          new THREE.CylinderGeometry(0.012, 0.012, 0.1, 4).translate(0.03, -1.5, 0),                              // connecting cilium
        ];
        g.add(meshOf(body, mat('#94a3b8', { rough: 0.45 })));
        g.add(meshOf(discsGeo(-2.16, -1.56, () => 0.062, 0.028), mat('#cbd5e1', { rough: 0.4 })));           // the disc stack
        stage.add(g, 'rods'); rods.push(g);
      }
      g.position.set(x + (z > 0 ? 0.08 : 0), 0, z);
    }
  }
  // the outer limiting membrane (a line of junctions) and the inner limiting membrane (Müller end-feet)
  const olm = box(W * 2, 0.015, 2.0, '#67e8f9', { opacity: 0.3 }); olm.position.y = -1.05; stage.add(olm, 'muller');
  const ilm = box(W * 2, 0.03, 2.0, '#67e8f9', { opacity: 0.35 }); ilm.material.depthWrite = false; ilm.position.y = 2.28; stage.add(ilm, 'muller');
  // Müller glia: tall see-through cells spanning the layers, with side branches and a foot at the inner surface
  const mg = [];
  for (const x of [-3.1, -1.4, 0.3, 2.0, 3.5]) {
    const z = -0.85;
    mg.push(taperTube([V(x, -1.05, z), V(x + 0.05, 0.0, z), V(x - 0.04, 0.85, z), V(x, 1.7, z), V(x, 2.22, z)], 0.07, (t) => 0.5 + 0.5 * Math.sin(Math.PI * t) + (t > 0.9 ? (t - 0.9) * 12 : 0), '#67e8f9', undefined, 24, 8).geometry);
    mg.push(new THREE.SphereGeometry(0.09, 10, 8).scale(1, 1.4, 1).translate(x - 0.04, 0.85, z)); // its nucleus, in the inner nuclear layer
    for (let k = 0; k < 6; k++) { const y = -0.8 + k * 0.5, s = k % 2 ? 1 : -1; mg.push(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 4).rotateZ(Math.PI / 2 - s * 0.4).translate(x + s * 0.14, y, z)); }
  }
  const mull = meshOf(mg, mat('#67e8f9', { opacity: 0.45, rough: 0.4 })); mull.material.depthWrite = false; stage.add(mull, 'muller');
  // horizontal cells (at the photoreceptor synapses) and amacrine cells (at the ganglion synapses)
  for (const [x, y, seed] of [[-2, 0.05, 1], [1.6, 0.05, 2]]) { const hz = blob(0.14, '#a855f7', { seed, stretch: [1.2, 0.7, 1] }); hz.position.set(x, y, 0.2); stage.add(hz, 'horizontal'); stage.add(tube([V(x - 1.6, -0.05, 0.2), V(x - 0.8, 0.0, 0.3), V(x, y, 0.2), V(x + 0.8, 0.0, 0.1), V(x + 1.6, -0.05, 0.2)], 0.022, '#a855f7', undefined, 32), 'horizontal'); }
  for (const [x, seed] of [[-0.6, 3], [2.8, 4]]) { const am = blob(0.13, '#c084fc', { seed }); am.position.set(x, 1.15, -0.2); stage.add(am, 'horizontal'); const arb = []; for (let k = 0; k < 6; k++) { const a = k * 1.05; arb.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x, 1.2, -0.2), V(x + Math.cos(a) * 0.4, 1.4, -0.2 + Math.sin(a) * 0.3), V(x + Math.cos(a) * 0.9, 1.45 + (k % 2) * 0.08, -0.2 + Math.sin(a) * 0.5)]), 10, 0.014, 4, false)); } stage.add(meshOf(arb, mat('#c084fc')), 'horizontal'); }
  // bipolar cells: dendrites down to the photoreceptors, axon up to the ganglion cells, ending in a small bouton
  for (let i = 0; i < 11; i++) {
    const x = -W + 0.5 + i * ((2 * W - 1) / 10), z = r(-0.4, 0.4);
    const b = new THREE.Group();
    const geos = [taperTube([V(0, 0.55, 0), V(0, 0.85, 0), V(0, 1.15, 0)], 0.13, spindle, '#3b82f6', undefined, 10, 10).geometry];
    for (const dx of [-0.18, 0, 0.18]) { geos.push(taperTube([V(0, 0.6, 0), V(dx * 0.6, 0.3, 0), V(dx, -0.05, 0)], 0.025, () => 1, '#60a5fa', undefined, 8, 5).geometry); geos.push(new THREE.SphereGeometry(0.03, 6, 5).translate(dx, -0.06, 0)); }
    geos.push(taperTube([V(0, 1.1, 0), V(0.05, 1.4, 0), V(r(-0.1, 0.1), 1.6, 0)], 0.03, () => 1, '#3b82f6', undefined, 8, 5).geometry);
    geos.push(new THREE.SphereGeometry(0.055, 8, 6).translate(0, 1.62, 0));
    b.add(meshOf(geos, mat('#3b82f6', { rough: 0.45 })));
    b.position.set(x, 0, z);
    stage.add(b, 'bipolar');
  }
  // ganglion cells: a lumpy body with a dendritic arbor below it, and an axon that joins the nerve-fibre layer on top
  for (let i = 0; i < 8; i++) {
    const x = -W + 0.6 + i * ((2 * W - 1.2) / 7), z = r(-0.4, 0.4);
    const geos = [lumpGeo(V(x, 1.95, z), 0.19, { seed: i + 2, amp: 0.1 })];
    for (let k = 0; k < 4; k++) { const a = k * 1.6 + i, p1 = V(x + Math.cos(a) * 0.22, 1.72, z + Math.sin(a) * 0.15); geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x, 1.85, z), p1, p1.clone().add(V(Math.cos(a) * 0.2, -0.08, Math.sin(a) * 0.15))]), 8, 0.02, 4, false)); geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p1, p1.clone().add(V(Math.cos(a + 1) * 0.16, -0.1, Math.sin(a + 1) * 0.12))]), 4, 0.014, 4, false)); }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x, 2.1, z), V(x + 0.3, 2.35, z * 0.5), V(W + 0.6, 2.45, 0)]), 30, 0.03, 5, false));
    stage.add(meshOf(geos, mat('#10b981', { rough: 0.45 })), 'ganglion');
  }
  // retinal capillaries among the ganglion cells, with a red cell in each
  const cap = [new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-W, 1.75, 0.75), V(-1.5, 1.85, 0.65), V(1, 1.7, 0.8), V(W, 1.8, 0.7)]), 60, 0.07, 8, false)];
  stage.add(meshOf(cap, mat('#ef4444', { opacity: 0.55, rough: 0.35 })), 'retvessels');
  stage.add(meshOf([-2.6, 0.2, 2.8].map((x) => new THREE.SphereGeometry(0.06, 10, 8).scale(1, 0.5, 1).translate(x, 1.8, 0.72)), mat('#b91c1c')), 'retvessels');
  const lbl = textSprite(L('→ optic nerve', 'עצב הראייה ←'), { size: 0.3 }); lbl.position.set(W + 0.9, 2.8, 0); stage.root.add(lbl);
  const lightLbl = textSprite(L('☀ light from the lens ↓', '☀ אור מהעדשה ↓'), { size: 0.3 }); lightLbl.position.set(-1.6, 2.95, 0.8); stage.root.add(lightLbl);
  for (const [y, en, he] of [[-2.35, 'pigment', 'פיגמנט'], [-1.6, 'rods & cones', 'קנים ומדוכים'], [0.85, 'bipolar', 'דו-קוטביים'], [1.95, 'ganglion', 'גנגליון']]) { const t = textSprite(L(en, he), { size: 0.24 }); t.position.set(-W - 0.45, y, 1.2); stage.root.add(t); }
  const photons = flow(stage, new THREE.CatmullRomCurve3([V(-1, 4, 0.7), V(-0.6, 0, 0.7), V(-0.4, -1.7, 0.7)]), { color: '#fde047', count: 16, size: 0.3, speed: 0.6 });
  const photons2 = flow(stage, new THREE.CatmullRomCurve3([V(1.5, 4, 0.8), V(1.6, 0, 0.8), V(1.7, -1.7, 0.8)]), { color: '#fde047', count: 16, size: 0.3, speed: 0.6 });
  const signal = flow(stage, new THREE.CatmullRomCurve3([V(-0.4, -1.4, 0.7), V(-0.3, -0.1, 0.7), V(-0.2, 0.85, 0.7), V(-0.1, 1.95, 0.7), V(0.5, 2.35, 0.7), V(W + 0.6, 2.45, 0.7)]), { color: '#22c55e', count: 12, size: 0.25, speed: 0.4 });
  [photons, photons2, signal].forEach((f) => f.setActive(false));
  let mode = null;
  stage.onUpdate((dt, t) => {
    const glow = 0.4 + 0.3 * Math.sin(t * 6);
    rods.forEach((c) => c.children.forEach((m) => m.material.emissive?.set(mode === 'dim' ? '#94a3b8' : '#000').multiplyScalar(mode === 'dim' ? glow : 0)));
    cones.forEach((c) => c.children.forEach((m) => m.material.emissive?.set(mode === 'bright' ? '#f59e0b' : '#000').multiplyScalar(mode === 'bright' ? glow : 0)));
  });
  const run = (m) => { mode = m; photons.setActive(true); photons2.setActive(m === 'bright'); signal.setActive(true); };
  return {
    home: { pos: V(0, 0.6, 10.5), target: V(0, 0.1, 0) },
    actions: [
      { icon: '🌙', label: B('Dim light', 'אור עמום'), radio: true, caption: B('Light passes through the ganglion and bipolar layers to the photoreceptors at the back. In dim light only the rods respond — so at night we see in shades of gray.', 'האור עובר דרך שכבות הגנגליון והתאים הדו-קוטביים אל קולטני האור מאחור. באור עמום רק הקנים מגיבים — ולכן בלילה אנחנו רואים בגווני אפור.'), run: () => run('dim') },
      { icon: '☀️', label: B('Bright light', 'אור חזק'), radio: true, caption: B('In bright light the cones take over, giving colour and sharp detail. The signal travels back: photoreceptor → bipolar → ganglion → optic nerve.', 'באור חזק המדוכים לוקחים פיקוד ומעניקים צבע ופרטים חדים. האות חוזר אחורה: קולטן אור ← תא דו-קוטבי ← גנגליון ← עצב הראייה.'), run: () => run('bright') },
    ],
  };
}

// ---------------- Organ of Corti (uncoiled cochlea) ----------------
// Redrawn like the textbook cross-section, run along the unrolled cochlea (owner, 2026-11-15: better-looking models):
// on the basilar membrane, the arch of the pillar cells (the tunnel of Corti), one row of flask-shaped inner hair cells
// and three rows of tall outer hair cells on Deiters' cells, Hensen's cells beyond, the spiral limbus holding the
// tectorial membrane over the hair bundles, and the auditory nerve fibres running to the spiral ganglion. Every piece
// that sits on the membrane rides its travelling wave.
function cortiScene(stage, { readout, L }) {
  P(stage, 'basilar', 'Basilar membrane', 'הממברנה הבזילרית', 'Narrow and stiff at the base, wide and floppy at the apex. Each frequency makes it vibrate most at one place — place coding of pitch.', 'צרה וקשיחה בבסיס, רחבה וגמישה בקודקוד. כל תדר גורם לה לרטוט בעיקר במקום אחד — קידוד מקום של גובה הצליל.', '#f9a8d4', [7]);
  P(stage, 'inner', 'Inner hair cells', 'תאי שיער פנימיים', 'One row of flask-shaped cells, each with a straight row of stereocilia in steps. They send almost all the auditory information to the brain through the auditory nerve.', 'שורה אחת של תאים דמויי בקבוק, לכל אחד שורה ישרה של סטריאוצִיליה במדרגות. הם שולחים כמעט את כל המידע השמיעתי למוח דרך עצב השמיעה.', '#2563eb', [7]);
  P(stage, 'outer', 'Outer hair cells', 'תאי שיער חיצוניים', 'Three rows of tall cells with V-shaped bundles, standing in the cups of Deiters\' cells. They change length with each wave and so amplify and fine-tune the vibration of the membrane.', 'שלוש שורות של תאים גבוהים עם צרורות בצורת V, העומדים בגביעים של תאי דייטרס. הם משנים את אורכם עם כל גל, וכך מגבירים ומכווננים את רטט הממברנה.', '#60a5fa', [7]);
  P(stage, 'tectorial', 'Tectorial membrane', 'הממברנה הטקטוריאלית', 'A soft gel flap anchored on the spiral limbus that lies over the hair cells. When the basilar membrane moves, the hairs (stereocilia) bend against it, opening ion channels.', 'דש ג׳לי רך המעוגן בלימבוס הספירלי ומונח מעל תאי השיער. כשהממברנה הבזילרית זזה, השערות (סטריאוצִיליה) מתכופפות כנגדה ופותחות תעלות יונים.', '#e9d5ff', [7]);
  P(stage, 'support', 'Supporting cells', 'תאים תומכים', 'The pillar cells, leaning together into an arch (the tunnel of Corti); Deiters\' cells holding the outer hair cells; Hensen\'s cells beyond them; and the spiral limbus that anchors the tectorial membrane.', 'תאי העמוד, הנשענים זה על זה לקשת (מנהרת קורטי); תאי דייטרס המחזיקים את תאי השיער החיצוניים; תאי הנסן שמעבר להם; והלימבוס הספירלי שמעגן את הממברנה הטקטוריאלית.', '#fbcfe8', [7]);
  P(stage, 'cochnerve', 'Auditory nerve fibres', 'סיבי עצב השמיעה', 'Each inner hair cell is contacted by about ten nerve fibres, whose cell bodies form the spiral ganglion; together they make the auditory nerve.', 'כל תא שיער פנימי מקבל כעשרה סיבי עצב, שגופי התא שלהם יוצרים את הגנגליון הספירלי; יחד הם עצב השמיעה.', '#f59e0b', [7]);
  const Lx = 9, NX = 140, NZ = 6;
  const width = (x) => 0.45 + ((x + Lx / 2) / Lx) * 1.1;
  const geo = new THREE.PlaneGeometry(Lx, 1, NX, NZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const base = Float32Array.from(pos.array);
  for (let i = 0; i < pos.count; i++) pos.setZ(i, base[i * 3 + 2] * width(base[i * 3]));
  const memb = new THREE.Mesh(geo, mat('#f9a8d4', { side: THREE.DoubleSide }));
  stage.add(memb, 'basilar');
  const zs = Float32Array.from(pos.array);
  // a cross-section (z, y; z in units of the membrane's width) run along the whole length; its vertices ride the wave
  const riders = [];
  const along = (pts, holes, color, part, o) => {
    const s = new THREE.Shape(); s.moveTo(...pts[0]); pts.slice(1).forEach((p) => s.lineTo(...p)); s.closePath();
    for (const h of holes || []) { const p = new THREE.Path(); p.moveTo(...h[0]); h.slice(1).forEach((q) => p.lineTo(...q)); p.closePath(); s.holes.push(p); }
    const g = new THREE.ExtrudeGeometry(s, { depth: Lx, steps: NX, bevelEnabled: false, curveSegments: 4 });
    const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) { const x = a.getZ(i) - Lx / 2; a.setXYZ(i, x, a.getY(i), a.getX(i) * width(x)); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat(color, o)); stage.add(m, part);
    riders.push({ m, base: Float32Array.from(a.array) });
    return m;
  };
  // the pillar cells' arch (an inverted V with the tunnel inside) and the cells around it
  along([[-0.14, 0.005], [-0.04, 0.33], [0.06, 0.005], [0.03, 0.005], [-0.04, 0.25], [-0.11, 0.005]], null, '#fbcfe8', 'support', { rough: 0.6 });
  along([[0.06, 0.005], [0.45, 0.005], [0.45, 0.09], [0.4, 0.07], [0.33, 0.1], [0.26, 0.07], [0.19, 0.1], [0.12, 0.07], [0.06, 0.09]], null, '#f5d0e6', 'support', { rough: 0.6 }); // Deiters' cells, with cups
  along([[0.45, 0.005], [0.72, 0.005], [0.7, 0.1], [0.6, 0.2], [0.5, 0.21], [0.45, 0.14]], null, '#fce7f3', 'support', { rough: 0.6 }); // Hensen's cells
  along([[-0.5, 0.005], [-0.26, 0.005], [-0.27, 0.12], [-0.33, 0.2], [-0.45, 0.42], [-0.5, 0.42]], null, '#f9c6dd', 'support', { rough: 0.6 }); // inner sulcus cells and the limbus
  // the tectorial membrane: a gel flap from the limbus, thick at its root, lying on the tips of the outer hair bundles
  along([[-0.5, 0.42], [-0.45, 0.5], [-0.1, 0.56], [0.2, 0.56], [0.42, 0.53], [0.48, 0.49], [0.3, 0.47], [-0.05, 0.47], [-0.3, 0.44]], null, '#e9d5ff', 'tectorial', { opacity: 0.55, rough: 0.3 });
  // hair cells: one body mesh and one hair-bundle mesh each (both glow when the cell is excited)
  const cells = [];
  const cilia = (rows, vShape) => { const geos = []; rows.forEach((h, row) => { for (let k = -2; k <= 2; k++) { const zOff = vShape ? Math.abs(k) * 0.012 - row * 0.012 : -row * 0.012; geos.push(new THREE.CylinderGeometry(0.0065, 0.008, h, 5).translate(k * 0.016, 0.17 + h / 2, zOff)); } }); return geos; };
  for (let i = 0; i < 36; i++) {
    const x = -Lx / 2 + 0.2 + i * ((Lx - 0.4) / 35);
    [[-0.2, 'inner'], [0.08, 'outer'], [0.22, 'outer'], [0.36, 'outer']].forEach(([z, id]) => {
      const inner = id === 'inner', col = inner ? '#2563eb' : '#60a5fa', c = new THREE.Group();
      const body = inner
        ? [taperTube([V(0, -0.16, 0), V(0, 0.0, 0), V(0, 0.16, 0)], 0.06, (t) => 0.62 + 0.38 * Math.sin(Math.PI * (0.25 + t * 0.6)), col, undefined, 10, 10).geometry, new THREE.SphereGeometry(0.03, 8, 6).translate(0, -0.06, 0.045)]
        : [new THREE.CylinderGeometry(0.035, 0.035, 0.3, 10).translate(0, 0.02, 0), new THREE.SphereGeometry(0.035, 10, 8).translate(0, -0.13, 0), new THREE.SphereGeometry(0.022, 8, 6).translate(0, -0.08, 0.03)];
      c.add(meshOf(body, mat(col, { rough: 0.45 })));
      c.add(meshOf(cilia(inner ? [0.1, 0.07, 0.045] : [0.13, 0.09, 0.06], !inner), mat('#fde68a', { rough: 0.4 })));
      stage.add(c, id);
      cells.push({ c, x, z: z * width(x) });
    });
  }
  // auditory nerve fibres from the inner hair cells to the spiral ganglion (beside the membrane, at the modiolus side)
  const nf = [], sg = [];
  for (let i = 0; i < 36; i += 1) { const x = -Lx / 2 + 0.2 + i * ((Lx - 0.4) / 35), z0 = -0.2 * width(x); nf.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x, 0.02, z0), V(x, -0.12, z0 - 0.12), V(x + 0.03, -0.32, -0.62 * width(x) - 0.1), V(x + 0.05, -0.5, -0.62 * width(x) - 0.3)]), 12, 0.012, 4, false)); if (i % 2 === 0) sg.push(new THREE.SphereGeometry(0.06, 10, 8).translate(x + 0.05, -0.52, -0.62 * width(x) - 0.32)); }
  sg.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-Lx / 2, -0.62, -0.62 * width(-Lx / 2) - 0.45), V(Lx / 2, -0.62, -0.62 * width(Lx / 2) - 0.45)]), 30, 0.07, 8, false));
  stage.add(meshOf(nf, mat('#f59e0b', { rough: 0.5 })), 'cochnerve');
  stage.add(meshOf(sg, mat('#d97706', { rough: 0.5 })), 'cochnerve');
  const t1 = textSprite(L('BASE — high pitch', 'בסיס — צליל גבוה'), { size: 0.3, color: '#334155' }); t1.position.set(-Lx / 2 + 1, -0.9, 0); stage.root.add(t1);
  const t2 = textSprite(L('APEX — low pitch', 'קודקוד — צליל נמוך'), { size: 0.3, color: '#334155' }); t2.position.set(Lx / 2 - 1, -0.9, 0); stage.root.add(t2);
  let peak = null, amp = 0, hz = 0;
  const disp = (x, t) => {
    if (peak == null) return 0;
    const env = Math.exp(-Math.pow((x - peak) / 1.1, 2)) * (x < peak ? 1 : Math.exp(-(x - peak) * 2));
    return amp * env * Math.sin(x * 4 - t * 10) * 0.45;
  };
  let still = false;
  stage.onUpdate((dt, t) => {
    amp += ((peak == null ? 0 : 1) - amp) * Math.min(1, dt * 2);
    const quiet = amp < 1e-3 && peak == null; if (quiet && still) return; still = quiet;
    for (let i = 0; i < pos.count; i++) pos.setY(i, disp(zs[i * 3], t));
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    for (const rd of riders) { const a = rd.m.geometry.attributes.position; for (let i = 0; i < a.count; i++) a.setY(i, rd.base[i * 3 + 1] + disp(rd.base[i * 3], t)); a.needsUpdate = true; rd.m.geometry.computeVertexNormals(); }
    for (const k of cells) {
      const y = disp(k.x, t);
      k.c.position.set(k.x, y + 0.2, k.z);
      k.c.rotation.z = -y * 0.8;
      const e = Math.min(1, Math.abs(y) * 4);
      k.c.children.forEach((m) => m.material.emissive.set('#fde047').multiplyScalar(e * 0.8));
    }
    readout(peak == null ? L('Silence', 'שקט') : `${L('Tone', 'צליל')}: <b>${hz} Hz</b> → ${L('peak vibration at', 'שיא הרטט ב')} ${peak < -1.5 ? L('the base', 'בסיס') : peak > 1.5 ? L('the apex', 'קודקוד') : L('the middle', 'אמצע')}`);
  });
  const tone = (h, p) => () => { hz = h; peak = p; };
  return {
    home: { pos: V(-6.4, 3.3, 5.0), target: V(-0.6, 0.1, 0) },
    actions: [
      { icon: '🔈', label: B('Low tone (200 Hz)', 'צליל נמוך (200 הרץ)'), radio: true, caption: B('Low frequencies travel far along the membrane and peak near the wide apex.', 'תדרים נמוכים מתקדמים רחוק לאורך הממברנה ומגיעים לשיא ליד הקודקוד הרחב.'), run: tone(200, 3) },
      { icon: '🔉', label: B('Middle tone (1000 Hz)', 'צליל בינוני (1000 הרץ)'), radio: true, caption: B('A middle frequency peaks near the middle of the membrane.', 'תדר בינוני מגיע לשיא ליד אמצע הממברנה.'), run: tone(1000, 0) },
      { icon: '🔊', label: B('High tone (8000 Hz)', 'צליל גבוה (8000 הרץ)'), radio: true, caption: B('High frequencies peak near the narrow, stiff base. The hair cells that bend the most tell the brain which pitch it is.', 'תדרים גבוהים מגיעים לשיא ליד הבסיס הצר והקשיח. תאי השיער שמתכופפים הכי הרבה מספרים למוח מה גובה הצליל.'), run: tone(8000, -3) },
      { icon: '🔇', label: B('Silence', 'שקט'), radio: true, run: () => { peak = null; } },
    ],
  };
}

// ---------------- Spinal cord, cut across (owner, 2026-11-15: replaces "a nerve" on the body's spinal cord dot) ----------------
// Redrawn like a textbook cross-section (owner, 2026-11-15: better-looking models): a short segment of cord whose cut
// face (z = FACE) shows the grey-matter butterfly with its neurons, the white matter speckled with axons and tinted by
// its main tracts, the fissure and septum, the meninges in rings, the spinal arteries, and the rootlets fanning into
// the roots. The flows run in front of the face (z = 0.8).
const SC_FACE = 0.5, SC_BACK = -1.0, SC_A = 2.35, SC_B = 1.85, SC_K = 1.15;
/** The butterfly of grey matter, half outline (x ≥ 0, y up = dorsal), in the cord's units before scaling by SC_K. */
const BUTTERFLY = [[0, 0.17], [0.25, 0.22], [0.45, 0.5], [0.55, 1.0], [0.62, 1.4], [0.72, 1.62], [0.84, 1.57], [0.82, 1.28], [0.75, 0.95], [0.8, 0.58], [1.06, 0.45], [0.96, 0.2], [1.2, -0.05], [1.33, -0.45], [1.2, -0.9], [0.95, -1.08], [0.65, -1.0], [0.42, -0.55], [0.25, -0.22], [0, -0.16]];
const butterflyOutline = () => { const h = BUTTERFLY.map(([x, y]) => [x * SC_K, y * SC_K]); return [...h, ...h.slice(1, -1).reverse().map(([x, y]) => [-x, y])]; };
function inPoly([px, py], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside; }
  return inside;
}
/** A flat outline (points [x, y]) extruded from z0 to z1, its front face at z1. */
function slabOf(pts, z0, z1, smooth = true) {
  const s = new THREE.Shape();
  if (smooth) s.splineThru(pts.map(([x, y]) => new THREE.Vector2(x, y))); else { s.moveTo(...pts[0]); pts.slice(1).forEach((p) => s.lineTo(...p)); }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false, curveSegments: 6, steps: 1 });
  g.translate(0, 0, z0);
  return g;
}
/** The cord's outline: an oval, wider than tall, with the deep ventral median fissure cut into its front (bottom). */
function cordOutline(a = SC_A, b = SC_B, n = 72) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = -Math.PI / 2 + 0.05 + (i / n) * (Math.PI * 2 - 0.1); pts.push([Math.cos(t) * a, Math.sin(t) * b * (1 - 0.06 * Math.cos(t * 2))]); }
  pts.push([-0.04, -b + 0.55], [0.04, -b + 0.55]); // the fissure
  return pts;
}
function spinalCordScene(stage, { L, readout }) {
  P(stage, 'grey', 'Grey matter (the "butterfly")', 'חומר אפור ("הפרפר")', 'Cell bodies of neurons. The back horns (dorsal) receive sensory input, capped by the paler substantia gelatinosa where pain fibres end; the front horns (ventral) hold the big motor neurons (purple) that drive muscles; the small side horns hold the neurons of the autonomic system.', 'גופי התא של הנוירונים. הקרניים האחוריות (הגביות) מקבלות קלט תחושתי, ובקצה שלהן החומר הג׳לטיני החיוור שבו מסתיימים סיבי הכאב; הקרניים הקדמיות (הבטניות) מכילות את הנוירונים המוטוריים הגדולים (סגולים) שמפעילים שרירים; הקרניים הצדדיות הקטנות מכילות את הנוירונים של מערכת העצבים האוטונומית.', '#c7a17a', [2, 8]);
  P(stage, 'white', 'White matter', 'חומר לבן', 'Myelinated axons (the speckles) running up and down the cord in columns. Tinted here as textbooks colour them: touch to the brain in the dorsal columns (blue), pain and temperature in the spinothalamic tract (orange), motor commands down the corticospinal tract (red).', 'אקסונים עם מיאלין (הנקודות) שרצים למעלה ולמטה בעמודות. כאן הם צבועים כמו בספרי לימוד: מגע למוח בעמודות הגביות (כחול), כאב וטמפרטורה במסלול הספינו-תלמי (כתום), ופקודות מוטוריות למטה במסלול הקורטיקו-ספינלי (אדום).', '#f1ece2', [2, 8]);
  P(stage, 'dorsalRoot', 'Dorsal root & its ganglion', 'השורש הגבי והגנגליון שלו', 'Sensory fibres come IN through the back root, fanning out into rootlets as they enter. The swelling on it is the dorsal root ganglion, packed with the round cell bodies of the sensory neurons.', 'סיבים תחושתיים נכנסים דרך השורש האחורי, ומתפצלים לשורשונים כשהם נכנסים. הנפיחות עליו היא גנגליון השורש הגבי, מלא בגופי התא העגולים של הנוירונים התחושתיים.', '#f59e0b', [2, 8]);
  P(stage, 'ventralRoot', 'Ventral root', 'השורש הבטני', 'Motor fibres leave the front horn in rootlets that join into the front root, out to the muscles.', 'סיבים מוטוריים יוצאים מהקרן הקדמית בשורשונים שמתאחדים לשורש הקדמי, החוצה אל השרירים.', '#ef4444', [2, 8]);
  P(stage, 'canal', 'Central canal', 'התעלה המרכזית', 'A thin channel of cerebrospinal fluid down the middle, lined by ependymal cells.', 'תעלה דקה של נוזל מוח ושדרה לאורך האמצע, מרופדת בתאי אפנדימה.', '#93c5fd', [2]);
  P(stage, 'meninges', 'Meninges', 'קרומי המוח', 'Three protective layers around the cord: the tough dura (outside), the thin arachnoid, and the pia stuck to the cord. Cerebrospinal fluid fills the space under the arachnoid.', 'שלוש שכבות מגן סביב חוט השדרה: הדורה הקשיחה (בחוץ), העכבישי הדק, והרך שצמוד לחוט השדרה. נוזל מוח ושדרה ממלא את המרווח שמתחת לעכבישי.', '#e2c6d6', [2]);
  P(stage, 'arteries', 'Spinal arteries', 'עורקי השדרה', 'One anterior spinal artery runs in the front fissure and two posterior ones behind; they feed the cord.', 'עורק שדרה קדמי אחד עובר בחריץ הקדמי ושניים אחוריים מאחור; הם מזינים את חוט השדרה.', '#dc2626', [2]);
  // white matter: the cord segment, then its tract tints and axon speckles on the cut face
  const white = new THREE.Mesh(slabOf(cordOutline(), SC_BACK, SC_FACE, false), mat('#f1ece2', { rough: 0.75 }));
  stage.add(white, 'white');
  const tint = (pts, color) => { const s = new THREE.Shape(); s.splineThru(pts.map(([x, y]) => new THREE.Vector2(x, y))); s.closePath(); const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 16), mat(color, { opacity: 0.55, rough: 0.8 })); m.position.z = SC_FACE + 0.006; m.material.depthWrite = false; return m; };
  for (const sx of [1, -1]) {
    const S = (pts) => pts.map(([x, y]) => [x * sx, y]);
    stage.add(tint(S([[0.06, 1.8], [0.55, 1.75], [0.66, 1.3], [0.55, 0.75], [0.3, 0.55], [0.06, 0.6]]), '#93c5fd'), 'white');           // dorsal column
    stage.add(tint(S([[1.15, 1.45], [1.75, 1.25], [2.15, 0.75], [2.2, 0.25], [1.4, 0.35], [1.0, 0.8]]), '#fca5a5'), 'white');            // lateral corticospinal
    stage.add(tint(S([[1.75, -0.1], [2.25, -0.25], [2.05, -0.95], [1.55, -1.35], [1.45, -0.75]]), '#fdba74'), 'white');                  // spinothalamic
  }
  const grey0 = butterflyOutline();
  const speck = [];
  for (let k = 0; k < 700; k++) { const x = rand(-SC_A, SC_A), y = rand(-SC_B, SC_B); if ((x / (SC_A - 0.08)) ** 2 + (y / (SC_B - 0.08)) ** 2 > 1 || inPoly([x, y], grey0) || (Math.abs(x) < 0.07 && y < -1.2)) continue; const r = rand(0.018, 0.04); const c = new THREE.RingGeometry(r * 0.45, r, 7); c.translate(x, y, SC_FACE + 0.012); speck.push(c); }
  const speckM = meshOf(speck, mat('#b8ad97', { rough: 0.9 })); speckM.raycast = () => {}; stage.add(speckM, 'white');
  stage.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 6).translate(0, 1.2, SC_FACE + 0.01), mat('#a8a29e')), 'white'); // dorsal median septum
  // grey matter: the butterfly, a little proud of the face, with its neurons and the pale substantia gelatinosa
  const grey = new THREE.Mesh(slabOf(grey0, SC_BACK + 0.05, SC_FACE + 0.03), mat('#c7a17a', { rough: 0.6 }));
  stage.add(grey, 'grey');
  const gel = []; for (const sx of [1, -1]) { const e = new THREE.CircleGeometry(0.2, 20); e.scale(0.9, 0.55, 1); e.rotateZ(sx * -0.5); e.translate(sx * 0.78 * SC_K, 1.5 * SC_K, SC_FACE + 0.035); gel.push(e); }
  stage.add(meshOf(gel, mat('#e7d3b5', { rough: 0.7 })), 'grey');
  const cells = [], small = [];
  const starGeo = (x, y, r) => { const s = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 2 + x * 3, rr = i % 2 ? r * 0.45 : r * (1 + 0.5 * Math.sin(i * 1.7 + y)); s[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } const g = new THREE.ShapeGeometry(s); g.translate(0, 0, SC_FACE + 0.04); return g; };
  for (const sx of [1, -1]) {
    for (const [x, y] of [[1.05, -0.45], [1.25, -0.75], [0.85, -0.8], [1.2, -0.2], [0.95, -0.15], [0.7, -0.55]]) cells.push(starGeo(sx * x * SC_K * 0.95, y * SC_K, 0.075));
    for (let k = 0; k < 14; k++) { const x = sx * rand(0.5, 0.78) * SC_K, y = rand(0.7, 1.45) * SC_K; small.push(new THREE.CircleGeometry(0.026, 8).translate(x, y, SC_FACE + 0.04)); }
    cells.push(starGeo(sx * 0.95 * SC_K, 0.36 * SC_K, 0.045));
  }
  stage.add(meshOf(cells, mat('#7c3aed', { rough: 0.5 })), 'grey');
  stage.add(meshOf(small, mat('#8b6b4a', { rough: 0.6 })), 'grey');
  // the central canal, lined by a ring of ependymal cells
  const canal = cyl(0.08, 0.08, SC_FACE - SC_BACK + 0.1, '#60a5fa'); canal.rotation.x = Math.PI / 2; canal.position.z = (SC_FACE + SC_BACK) / 2 + 0.04; stage.add(canal, 'canal');
  const epend = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 16), mat('#a5b4fc')); epend.position.z = SC_FACE + 0.06; stage.add(epend, 'canal');
  // meninges: pia (tight), arachnoid, dura (outside), each a ring on the cut and a see-through wall behind it
  const ring = (r0, r1, sx, sy, color, o) => { const g = new THREE.RingGeometry(r0, r1, 72); g.scale(sx, sy, 1); const m = new THREE.Mesh(g, mat(color, { opacity: o, side: THREE.DoubleSide })); m.position.z = SC_FACE + 0.01; m.material.depthWrite = false; return m; };
  const wall = (r, sx, sy, color, o) => { const g = new THREE.CylinderGeometry(r, r, SC_FACE - SC_BACK, 72, 1, true); g.rotateX(Math.PI / 2); g.scale(sx, sy, 1); g.translate(0, 0, (SC_FACE + SC_BACK) / 2); const m = new THREE.Mesh(g, mat(color, { opacity: o, side: THREE.DoubleSide })); m.material.depthWrite = false; return m; };
  stage.add(ring(1.0, 1.02, SC_A + 0.03, SC_B + 0.03, '#d8a7c0', 0.9), 'meninges');                  // pia
  stage.add(ring(1.0, 1.02, SC_A + 0.3, SC_B + 0.3, '#e2c6d6', 0.75), 'meninges');                   // arachnoid
  stage.add(ring(1.0, 1.06, SC_A + 0.48, SC_B + 0.48, '#cfa8bd', 0.85), 'meninges');                 // dura
  stage.add(wall(1, SC_A + 0.48, SC_B + 0.48, '#e2c6d6', 0.22), 'meninges');
  const trab = []; for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2 + 0.1; trab.push(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 4).rotateZ(-a + Math.PI / 2).translate(Math.cos(a) * (SC_A + 0.17), Math.sin(a) * (SC_B + 0.17), SC_FACE + 0.01)); }
  stage.add(meshOf(trab, mat('#e2c6d6', { opacity: 0.8 })), 'meninges');
  // the spinal arteries: one in the front fissure, two behind, running along the cord
  const art = (x, y, r) => { const m = cyl(r, r, SC_FACE - SC_BACK + 0.05, '#dc2626', { rough: 0.35 }); m.rotation.x = Math.PI / 2; m.position.set(x, y, (SC_FACE + SC_BACK) / 2); return m; };
  stage.add(art(0, -SC_B - 0.1, 0.09), 'arteries'); stage.add(art(0.55, SC_B - 0.02, 0.05), 'arteries'); stage.add(art(-0.55, SC_B - 0.02, 0.05), 'arteries');
  // the roots: rootlets fan into the cord's sides and join; the ganglion holds the sensory cell bodies
  for (const s of [1, -1]) {
    const dr = [V(s * 0.75, 1.75, 0), V(s * 1.8, 2.3, 0), V(s * 3.0, 2.0, 0), V(s * 4.2, 1.0, 0)];
    stage.add(tube(dr.slice(1), 0.16, '#f59e0b'), 'dorsalRoot');
    for (const [dx, dz] of [[0, 0.25], [0.05, -0.05], [-0.04, -0.35], [0.1, -0.65]]) stage.add(tube([V(s * (0.82 + dx), 1.72, dz), V(s * 1.3, 2.15, dz * 0.6), V(s * 1.8, 2.3, 0)], 0.045, '#f59e0b', undefined, 24), 'dorsalRoot');
    const drg = blob(0.42, '#f59e0b', { seed: 3, amp: 0.1, stretch: [1.4, 1, 1], o: { opacity: 0.75 } }); drg.position.set(s * 3.0, 2.0, 0); drg.material.depthWrite = false; stage.add(drg, 'dorsalRoot');
    const somas = []; for (let k = 0; k < 16; k++) { const a = rand(0, Math.PI * 2), b = rand(-1, 1), rr = rand(0.1, 0.3); somas.push(new THREE.SphereGeometry(rand(0.05, 0.075), 10, 8).translate(s * 3.0 + Math.cos(a) * rr * 1.3, 2.0 + b * 0.22, Math.sin(a) * rr)); }
    stage.add(meshOf(somas, mat('#b45309', { rough: 0.5 })), 'dorsalRoot');
    stage.add(tube([V(s * 1.6, -1.45, 0), V(s * 2.2, -1.6, 0), V(s * 3.4, -0.9, 0), V(s * 4.2, 0.9, 0)], 0.15, '#ef4444'), 'ventralRoot');
    for (const [dx, dz] of [[0, 0.25], [0.08, -0.1], [-0.05, -0.45]]) stage.add(tube([V(s * (1.2 + dx), -1.2, dz), V(s * 1.45, -1.42, dz * 0.6), V(s * 1.7, -1.5, 0)], 0.045, '#ef4444', undefined, 24), 'ventralRoot');
    stage.add(tube([V(s * 4.2, 1.0, 0), V(s * 4.6, 0.4, 0), V(s * 5.6, -0.4, 0)], 0.22, '#d97706'), 'dorsalRoot'); // the spinal nerve (both roots joined)
  }
  // labels
  for (const [p, en, he] of [[V(0, 2.95, 0.6), 'back (dorsal)', 'גב (גבי)'], [V(0, -2.85, 0.6), 'front (ventral)', 'קדימה (בטני)'], [V(4.6, 2.4, 0.4), 'dorsal root ganglion', 'גנגליון השורש הגבי']]) { const t = textSprite(L(en, he), { size: 0.3 }); t.position.copy(p); stage.add(t); }
  // three pathways through the cord, on the right half (the body's left)
  const C = (pts) => new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => V(x, y, z === 0.5 ? 0.8 : z))); // in front of the grey matter
  const paths = {
    reflex: C([[5.6, -0.4, 0.5], [4.2, 1.0, 0.5], [3.0, 2.0, 0.5], [1.8, 2.3, 0.5], [0.8, 1.6, 0.5], [0.7, 0.4, 0.5], [0.95, -0.6, 0.5], [1.15, -1.0, 0.5], [2.2, -1.6, 0.5], [3.4, -0.9, 0.5], [4.2, 0.9, 0.5], [5.6, -0.4, 0.6]]),
    touch: C([[5.6, -0.4, 0.5], [4.2, 1.0, 0.5], [3.0, 2.0, 0.5], [1.8, 2.3, 0.5], [0.6, 1.9, 0.5], [0.35, 1.95, 0.5], [0.35, 1.95, 3.5]]),
    pain: C([[5.6, -0.4, 0.5], [4.2, 1.0, 0.5], [3.0, 2.0, 0.5], [1.8, 2.3, 0.5], [0.75, 1.5, 0.5], [0.2, 0.0, 0.5], [-1.0, -0.4, 0.5], [-1.85, -0.5, 0.5], [-1.85, -0.5, 3.5]]),
  };
  const flows = Object.fromEntries(Object.entries(paths).map(([k, c]) => { const f = flow(stage, c, { color: { reflex: '#facc15', touch: '#38bdf8', pain: '#f97316' }[k], count: 16, size: 0.45, speed: 0.25 }); f.setActive(false); return [k, f]; }));
  const show = (k) => () => {
    Object.entries(flows).forEach(([n, f]) => f.setActive(n === k));
    stage.focus({ reflex: ['dorsalRoot', 'grey', 'ventralRoot'], touch: ['dorsalRoot', 'white'], pain: ['dorsalRoot', 'grey', 'white'] }[k]);
    readout({ reflex: L('Reflex: in by the dorsal root → a connection in the grey matter → out by the ventral root to the muscle. The brain is not needed.', 'רפלקס: פנימה בשורש הגבי ← חיבור בחומר האפור ← החוצה בשורש הבטני לשריר. אין צורך במוח.'), touch: L('Fine touch: the fibre turns straight UP in the dorsal column (blue) on the SAME side, toward the brainstem.', 'מגע עדין: הסיב פונה ישר למעלה בעמודה הגבית (כחול) באותו צד, לכיוון גזע המוח.'), pain: L('Pain & temperature: a synapse in the dorsal horn, then the next neuron CROSSES to the other side and goes up the spinothalamic tract (orange).', 'כאב וטמפרטורה: סינפסה בקרן הגבית, ואז הנוירון הבא חוצה לצד השני ועולה במסלול הספינו-תלמי (כתום).') }[k]);
  };
  return {
    home: { pos: V(2.8, 2.6, 10.9), target: V(0.4, 0, 0) },
    actions: [
      { icon: '🦵', label: B('A reflex', 'רפלקס'), radio: true, run: show('reflex') },
      { icon: '✋', label: B('Touch to the brain', 'מגע אל המוח'), radio: true, run: show('touch') },
      { icon: '🔥', label: B('Pain to the brain', 'כאב אל המוח'), radio: true, run: show('pain') },
    ],
  };
}

// ---------------- Smell: the olfactory epithelium and the bulb above it (owner, 2026-11-15: the nose dot) ----------------
// Two receptor types (green, violet): every neuron with the same receptor sends its axon to the same glomerulus.
function smellScene(stage, { L, readout }) {
  const rnd = seeded(7);
  P(stage, 'smell', 'Olfactory neurons', 'נוירוני ריח', 'Bipolar neurons. Each one makes just ONE kind of odour receptor, carried on the cilia at its tip (the course book, after Buck & Axel: about 1,000 kinds; today: about 400 work in humans). They are replaced every four to six weeks — some of the few neurons that renew in adults.', 'נוירונים דו-קוטביים. כל אחד מייצר רק סוג אחד של קולטן ריח, הנמצא על הריסים בקצה שלו (ספר הקורס, לפי באק ואקסל: כ-1,000 סוגים; כיום: כ-400 פעילים אצל בני אדם). הם מתחלפים כל ארבעה עד שישה שבועות — מהנוירונים הבודדים שמתחדשים אצל מבוגרים.', '#22c55e', [7]);
  P(stage, 'nasal', 'Olfactory epithelium & mucus', 'אפיתל הריח והריר', 'A patch of lining in the roof of the nose with supporting cells; mucus on its surface dissolves odour molecules, and the cilia lie in it.', 'כתם רירית בתקרת האף עם תאים תומכים; הריר על פניו ממיס מולקולות ריח, והריסים שוכבים בתוכו.', '#bef264', [7]);
  P(stage, 'plate', 'Cribriform plate (skull)', 'הלוח המנוקב (גולגולת)', 'A thin bone full of holes; the axons pass straight through it into the skull.', 'עצם דקה מלאה בחורים; האקסונים עוברים ישר דרכה אל תוך הגולגולת.', '#e7e5e4', [7]);
  P(stage, 'bulb', 'Olfactory bulb (glomeruli)', 'פקעת הריח (גלומרולי)', 'The first stop in the brain. Axons with the same receptor all meet in one glomerulus, so each odour lights up its own pattern of glomeruli. From here, mitral cells carry the smell on — the only sense that skips the thalamus.', 'התחנה הראשונה במוח. אקסונים עם אותו קולטן נפגשים כולם בגלומרולוס אחד, כך שכל ריח מדליק דפוס משלו של גלומרולי. מכאן תאי מיטרל ממשיכים את הריח — החוש היחיד שמדלג על התלמוס.', '#4ade80', [7]);
  const W = 5;
  const epi = slab(W, 2.4, 1.2, '#dcefb8', 0.4); epi.position.set(0, -0.45, 0); stage.add(epi, 'nasal');
  const mucus = slab(W, 0.55, 1.2, '#a5e3fb', 0.4, { wave: -0.05, freq: 5 }); mucus.position.set(0, -1.93, 0); stage.add(mucus, 'nasal');
  { // supporting (sustentacular) cells: tall columns with their nuclei near the surface; basal (stem) cells at the bottom
    const sup = [], nuc = [], bas = [];
    for (let i = 0; i < 11; i++) { const x = -2.3 + i * 0.46; for (const z of [-0.35, 0.42]) { sup.push(taperTube([V(x, 0.72, z), V(x + 0.02, -0.4, z), V(x - 0.02, -1.66, z)], 0.16, (t) => 0.75 + 0.25 * Math.sin(Math.PI * t) + 0.05 * Math.sin(t * 17 + i), '#c9e59f', undefined, 16, 10).geometry); nuc.push(lumpGeo(V(x, -1.25, z + 0.1), 0.09, { seed: i + z * 5, amp: 0.08, stretch: [0.8, 1.4, 0.8] })); }
      bas.push(lumpGeo(V(x + 0.2, 0.62, 0.0), 0.11, { seed: i * 3, amp: 0.12, stretch: [1.2, 0.8, 1] })); }
    const supM = meshOf(sup, mat('#c9e59f', { opacity: 0.55, rough: 0.5 })); supM.material.depthWrite = false; stage.add(supM, 'nasal');
    stage.add(meshOf(nuc, mat('#65a30d', { opacity: 0.85 })), 'nasal'); stage.add(meshOf(bas, mat('#a3a35a', { rough: 0.5 })), 'nasal');
    // a Bowman's gland: a coiled tube in the tissue above, its duct opening onto the surface (it makes the mucus)
    const coil = []; for (let i = 0; i <= 40; i++) { const a = i * 0.6; coil.push(V(2.15 + Math.cos(a) * 0.15, 0.95 + i * 0.002, -0.2 + Math.sin(a) * 0.15)); }
    stage.add(meshOf([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 160, 0.05, 6, false), new THREE.TubeGeometry(new THREE.CatmullRomCurve3([coil[0], V(2.2, 0.2, -0.2), V(2.15, -0.9, -0.15), V(2.2, -1.68, -0.1)]), 40, 0.04, 6, false)], mat('#38bdf8', { rough: 0.4 })), 'nasal');
  }
  // the cribriform plate: bone with holes where the bundles of axons go through
  const plateShape = new THREE.Shape(); plateShape.moveTo(-W / 2, -0.6); plateShape.lineTo(W / 2, -0.6); plateShape.lineTo(W / 2, 0.6); plateShape.lineTo(-W / 2, 0.6); plateShape.closePath();
  for (const x of [-1.5, -0.45, 0.6, 1.6]) { const h = new THREE.Path(); h.absellipse(x, 0.05, 0.22, 0.3, 0, Math.PI * 2, true); plateShape.holes.push(h); }
  const plateG = new THREE.ExtrudeGeometry(plateShape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }); plateG.rotateX(Math.PI / 2); plateG.translate(0, 1.31, 0);
  const plate = new THREE.Mesh(plateG, mat('#e7e5e4', { rough: 0.85 })); stage.add(plate, 'plate');
  const GL = { a: V(-1.1, 2.9, 0), b: V(1.2, 2.9, 0) };
  const glomeruli = {};
  for (const [k, c] of Object.entries({ a: '#22c55e', b: '#a855f7' })) {
    // a glomerulus: a round knot where the axons' endings tangle with the mitral cell's dendrite tuft
    const g = blob(0.42, c, { seed: k === 'a' ? 5 : 8, amp: 0.12, o: { opacity: 0.28 } }); g.material.depthWrite = false; g.position.copy(GL[k]); stage.add(g, 'bulb'); glomeruli[k] = g;
    const tangle = []; for (let i = 0; i < 14; i++) { const pts = []; let p = V((rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.4); for (let j = 0; j < 5; j++) { pts.push(GL[k].clone().add(p)); p = p.clone().add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.25)).clampLength(0, 0.36); } tangle.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.014, 4, false)); }
    stage.add(meshOf(tangle, mat(c, { rough: 0.5 })), 'bulb');
  }
  const mitral = []; for (const k of ['a', 'b']) {
    const M = GL[k].clone().add(V(0.1, 1.0, 0)), geos = [new THREE.ConeGeometry(0.2, 0.42, 7).translate(M.x, M.y, M.z)]; // a triangular mitral cell body
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([M.clone().add(V(0, -0.2, 0)), GL[k].clone().add(V(0.05, 0.45, 0)), GL[k].clone().add(V(0, 0.2, 0))]), 12, 0.035, 5, false)); // its dendrite down into the glomerulus
    for (const d of [-1, 1]) geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([M.clone().add(V(d * 0.15, -0.1, 0)), M.clone().add(V(d * 0.6, -0.05, 0.1)), M.clone().add(V(d * 1.0, 0.1, 0.1))]), 10, 0.02, 4, false)); // side dendrites
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([M.clone().add(V(0, 0.2, 0)), GL[k].clone().add(V(0.6, 1.7, 0)), GL[k].clone().add(V(1.4, 2.0, 0))]), 16, 0.03, 5, false)); // the axon, toward the olfactory tract
    const m = meshOf(geos, mat('#16a34a', { rough: 0.45 })); stage.add(m, 'bulb'); mitral.push(m);
  }
  stage.add(meshOf(Array.from({ length: 10 }, (_, i) => lumpGeo(V(-2.2 + i * 0.5, 2.25 + (i % 2) * 0.2, 0.3), 0.08, { seed: i, amp: 0.15 })), mat('#86efac')), 'bulb'); // small periglomerular cells
  const lb = textSprite(L('olfactory bulb (brain)', 'פקעת הריח (מוח)'), { size: 0.3 }); lb.position.set(0, 4.4, 0.4); stage.add(lb);
  const ln = textSprite(L('← air in the nose', 'אוויר באף →'), { size: 0.3 }); ln.position.set(3.6, -1.95, 0.4); stage.add(ln);
  const neurons = [];
  [['a', -1.9], ['b', -1.1], ['a', -0.2], ['b', 0.6], ['a', 1.4], ['b', 2.1]].forEach(([k, x]) => {
    const color = k === 'a' ? '#22c55e' : '#a855f7', z = 0.12, knob = V(x + 0.04, -1.72, z);
    const g = new THREE.Group();
    g.add(taperTube([V(x, 0.15, z), V(x + 0.02, -0.35, z), V(x + 0.03, -0.85, z)], 0.24, spindle, color, { opacity: 0.9 }, 20, 14));
    g.add(taperTube([V(x + 0.03, -0.75, z), knob], 0.055, (t) => 1 - t * 0.3, color, undefined, 12, 8));
    const kn = sphere(0.09, color); kn.position.copy(knob); g.add(kn);
    for (let i = 0; i < 7; i++) { const d = (i % 2 ? 1 : -1) * (0.3 + rnd() * 0.4); g.add(tube([knob, knob.clone().add(V(d * 0.3, -0.12, 0)), knob.clone().add(V(d * 0.8, -0.2 - rnd() * 0.1, (rnd() - 0.5) * 0.4))], 0.01, '#d9f99d', undefined, 10)); }
    const ax = [V(x, 0.15, z), V(x * 0.85 + GL[k].x * 0.15, 0.8, z), V(x * 0.5 + GL[k].x * 0.5, 1.2, 0.05), V(GL[k].x + (rnd() - 0.5) * 0.3, GL[k].y - 0.3, 0)];
    g.add(taperTube(ax, 0.03, () => 1, color, undefined, 24, 6));
    stage.add(g, 'smell');
    neurons.push({ k, knob, ax, color });
  });
  // odours: rose molecules fit receptor A, coffee fits B
  const odours = [];
  for (let i = 0; i < 8; i++) { const m = molecule(V(-2 + rnd() * 4, -2.4 - rnd() * 0.3, 0.3), '#f472b6', rnd); m.visible = false; stage.add(m); odours.push(m); }
  let fl = [];
  const smell = (k, color) => () => {
    fl.forEach((f) => f.setActive(false));
    fl = neurons.filter((n) => n.k === k).map((n) => { const f = flow(stage, new THREE.CatmullRomCurve3([n.knob.clone().add(V(0, -0.4, 0.2)), n.knob, ...n.ax]), { color: '#fde047', count: 8, speed: 0.4, size: 0.2 }); return f; });
    odours.forEach((m) => { m.visible = true; m.children.slice(1).forEach((s) => s.material.color.set(color)); });
    Object.entries(glomeruli).forEach(([g, m]) => { m.material.emissive.set(g === k ? (k === 'a' ? '#22c55e' : '#a855f7') : '#000').multiplyScalar(g === k ? 0.7 : 0); });
    stage.focus(['smell', 'bulb']);
    readout(L(`Only the neurons with the matching receptor (${k === 'a' ? 'green' : 'violet'}) fire, and all of them end in the same glomerulus. A real smell activates a mix of receptors: the brain reads the pattern.`, `רק הנוירונים עם הקולטן המתאים (${k === 'a' ? 'ירוק' : 'סגול'}) יורים, וכולם מסתיימים באותו גלומרולוס. ריח אמיתי מפעיל תערובת של קולטנים: המוח קורא את הדפוס.`));
  };
  return {
    home: { pos: V(0, 0.9, 11), target: V(0, 0.9, 0) },
    actions: [
      { icon: '🌹', label: B('Smell a rose', 'הרחת ורד'), radio: true, run: smell('a', '#f472b6') },
      { icon: '☕', label: B('Smell coffee', 'הרחת קפה'), radio: true, run: smell('b', '#92400e') },
    ],
  };
}

// ---------------- Taste: one taste bud in the tongue lining (owner, 2026-11-15: the tongue dot) ----------------
const TASTES = [
  { k: 'sweet', icon: '🍬', en: 'Sweet', he: 'מתוק', color: '#f472b6', cells: [0, 5, 10], how: B('Sugar binds the sweet receptor (T1R2+T1R3), a G-protein receptor on type II cells.', 'סוכר נקשר לקולטן המתוק (T1R2+T1R3), קולטן מצומד-חלבון-G על תאים מסוג II.') },
  { k: 'umami', icon: '🍅', en: 'Umami', he: 'אומאמי', color: '#f97316', cells: [2, 7], how: B('Glutamate (as in tomato or parmesan) binds T1R1+T1R3 on type II cells.', 'גלוטמט (כמו בעגבנייה או בפרמזן) נקשר ל-T1R1+T1R3 על תאים מסוג II.') },
  { k: 'bitter', icon: '☕', en: 'Bitter', he: 'מר', color: '#84cc16', cells: [4, 9, 13], how: B('About 25 kinds of T2R receptor on type II cells catch bitter (often poisonous) molecules.', 'כ-25 סוגים של קולטני T2R על תאים מסוג II לוכדים מולקולות מרות (לעיתים קרובות רעילות).') },
  { k: 'sour', icon: '🍋', en: 'Sour', he: 'חמוץ', color: '#facc15', cells: [3, 11], how: B('Acid: H⁺ ions flow straight into type III cells through a proton channel (OTOP1).', 'חומצה: יוני H⁺ זורמים ישר לתוך תאים מסוג III דרך תעלת פרוטונים (OTOP1).') },
  { k: 'salty', icon: '🧂', en: 'Salty', he: 'מלוח', color: '#e2e8f0', cells: [6, 12], how: B('Na⁺ flows in through sodium channels (ENaC) on some of the cells.', 'Na⁺ זורם פנימה דרך תעלות נתרן (ENaC) בחלק מהתאים.') },
];
function tasteScene(stage, { L, readout }) {
  const rnd = seeded(31);
  P(stage, 'tongue', 'Tongue lining with a taste pore', 'רירית הלשון עם נקבובית טעם', 'Taste buds sit in the lining of the tongue, mostly on its papillae. Only a tiny pore at the surface lets dissolved food molecules reach the receptor cells.', 'פקעיות הטעם יושבות ברירית הלשון, בעיקר על הפטמות שלה. רק נקבובית זעירה בפני השטח מאפשרת למולקולות מזון מומסות להגיע לתאי הקולטן.', '#f9a8b8', [7]);
  P(stage, 'taste', 'Taste receptor cells', 'תאי קולטני טעם', '50–150 long cells packed like an onion, their tips at the pore. Each cell senses one taste quality; they live only about 10 days and are constantly replaced from the basal cells.', '50–150 תאים ארוכים דחוסים כמו בצל, הקצוות שלהם בנקבובית. כל תא חש איכות טעם אחת; הם חיים רק כ-10 ימים ומתחדשים כל הזמן מתאי הבסיס.', '#14b8a6', [7]);
  P(stage, 'gustatory', 'Taste nerve fibres', 'סיבי עצב הטעם', 'Fibres of cranial nerves VII, IX and X wrap the cells, receive their signal and carry it to the brainstem.', 'סיבים של עצבים גולגולתיים VII, ‏IX ו-X עוטפים את התאים, מקבלים את האות שלהם ומובילים אותו לגזע המוח.', '#fbbf24', [7]);
  const TOP = 1.3, PORE = V(0, TOP, 0);
  const lining = slab(3.4, 2.6, 1.6, '#f6a7b8', 0.3); stage.add(lining, 'tongue');
  { // the lining around the bud: stratified epithelium, flatter toward the surface, drawn behind and beside the bud
    const ep = [];
    for (let y = -1.1; y < TOP; y += 0.2) for (let x = -1.6; x <= 1.6; x += 0.2) { const z = -0.65; const fl = Math.max(0.35, 1 - (y + 1.1) / 3); ep.push(lumpGeo(V(x + (Math.round(y * 5) % 2) * 0.1, y, z), 0.1, { seed: x * 13 + y * 7, amp: 0.12, stretch: [0.8 + (1 - fl) * 0.9, fl, 0.9] })); }
    for (let x = -1.6; x <= 1.6; x += 0.2) for (const z of [-0.4, 0.4]) if (Math.abs(x) > 0.75) ep.push(lumpGeo(V(x, TOP - 0.08, z), 0.1, { seed: x * 3 + z, amp: 0.1, stretch: [1.5, 0.4, 1.2] }));
    stage.add(meshOf(ep, mat('#f7b3c2', { rough: 0.6 })), 'tongue');
    stage.add(meshOf([new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-1.7, -1.6, -0.3), V(-0.8, -1.4, -0.2), V(0, -1.5, -0.3), V(0.8, -1.35, -0.2), V(1.7, -1.55, -0.3)]), 40, 0.05, 6, false)], mat('#dc2626', { rough: 0.4 })), 'tongue'); // a capillary under the bud
  }
  const shape = new THREE.Shape(); shape.moveTo(-1.7, -0.8); shape.lineTo(1.7, -0.8); shape.lineTo(1.7, 0.8); shape.lineTo(-1.7, 0.8); shape.lineTo(-1.7, -0.8);
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.14, 0, Math.PI * 2, true); shape.holes.push(hole);
  const surf = new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), mat('#fb7185', { opacity: 0.45, side: THREE.DoubleSide, rough: 0.7 }));
  surf.material.depthWrite = false; surf.rotation.x = -Math.PI / 2; surf.position.set(0, TOP + 0.01, 0); stage.add(surf, 'tongue');
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 10, 32), mat('#e11d48')); rim.rotation.x = Math.PI / 2; rim.position.copy(PORE); stage.add(rim, 'tongue');
  const cells = [];
  const N = 15, base = ['#5eead4', '#2dd4bf', '#14b8a6', '#0d9488'];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (rnd() - 0.5) * 0.2, c = Math.cos(a), s = Math.sin(a), j = 0.9 + rnd() * 0.2;
    const pts = [V(c * 0.42 * j, -1.05, s * 0.42 * j), V(c * 0.6 * j, -0.4, s * 0.6 * j), V(c * 0.6 * j, 0.25, s * 0.6 * j), V(c * 0.36, 0.85, s * 0.36), V(c * 0.06, TOP - 0.05, s * 0.06)];
    const m = taperTube(pts, 0.17, (t) => 0.35 + 0.65 * spindle(Math.min(1, t * 1.15)), base[i % base.length], undefined, 32, 12);
    stage.add(m, 'taste'); cells.push(m);
  }
  for (let i = 0; i < 9; i++) { const a = rnd() * Math.PI * 2, r = rnd() * 0.07; const x = Math.cos(a) * r, z = Math.sin(a) * r; stage.add(tube([V(x, TOP - 0.06, z), V(x * 2.5, TOP + 0.08, z * 2.5), V(x * 3.5, TOP + 0.2, z * 3.5)], 0.012, '#99f6e4', undefined, 8), 'taste'); }
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3; const b = blob(0.12, '#0f766e', { seed: i + 1, amp: 0.1 }); b.position.set(Math.cos(a) * 0.32, -1.12, Math.sin(a) * 0.32); stage.add(b, 'taste'); }
  stage.add(meshOf(Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return lumpGeo(V(Math.cos(a) * 0.55, -0.3 + (i % 3) * 0.18, Math.sin(a) * 0.55), 0.075, { seed: i, amp: 0.08, stretch: [0.8, 1.4, 0.8] }); }), mat('#115e59', { rough: 0.5 })), 'taste'); // the cells' nuclei
  const gust = [-1, 0, 1].map((k) => [V(k * 0.55 + 0.1, -2.6, 0.1), V(k * 0.4, -1.7, 0.15), V(k * 0.3, -1.1, 0.35), V(k * 0.25, -0.5, 0.5), V(k * 0.15, 0.1, 0.45)]);
  for (const p of gust) stage.add(taperTube(p, 0.04, (t) => 1 - t * 0.5, '#fbbf24', undefined, 32, 8), 'gustatory');
  { const pl = []; for (let i = 0; i < 10; i++) { const a = i * 0.63, y0 = -0.9 + (i % 4) * 0.35; pl.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(Math.cos(a) * 0.2, y0 - 0.3, Math.sin(a) * 0.2 + 0.2), V(Math.cos(a + 0.4) * 0.66, y0, Math.sin(a + 0.4) * 0.66), V(Math.cos(a + 0.9) * 0.62, y0 + 0.35, Math.sin(a + 0.9) * 0.62)]), 12, 0.014, 4, false)); } stage.add(meshOf(pl, mat('#fbbf24', { rough: 0.5 })), 'gustatory'); } // fibres winding between the cells
  const lbl = textSprite(L('↓ to the brainstem', '↓ אל גזע המוח'), { size: 0.3 }); lbl.position.set(1.9, -2.2, 0.3); stage.add(lbl);
  const food = []; for (let i = 0; i < 6; i++) { const m = molecule(V(-0.6 + rnd() * 1.2, TOP + 0.5 + rnd() * 0.6, rnd() * 0.3), '#ffffff', rnd); m.visible = false; stage.add(m); food.push(m); }
  const signal = flow(stage, new THREE.CatmullRomCurve3([PORE.clone().add(V(0, 0.5, 0.1)), PORE, V(0, 0.4, 0.45), ...gust[1].slice().reverse().slice(1)]), { color: '#fde047', count: 10, size: 0.22, speed: 0.35 });
  signal.setActive(false);
  let t = 0, active = null;
  stage.onUpdate((dt) => { if (!active) return; t += dt; food.forEach((m, i) => { const k = ((t * 0.4 + i / food.length) % 1); m.position.lerpVectors(m.userData.from, PORE, k); }); });
  const taste = (T) => () => {
    active = T; t = 0;
    cells.forEach((m, i) => { const on = T.cells.includes(i); m.material.emissive.set(on ? T.color : '#000').multiplyScalar(on ? 0.6 : 0); });
    food.forEach((m) => { m.visible = true; m.userData.from = m.position.clone(); m.children.slice(1).forEach((s) => s.material.color.set(T.color)); });
    signal.setActive(true);
    readout(`${T.icon} <b>${L(T.en, T.he)}</b>: ${L(T.how.en, T.how.he)}`);
  };
  return {
    home: { pos: V(0, 0.2, 9.5), target: V(0, -0.2, 0) },
    actions: TASTES.map((T) => ({ icon: T.icon, label: B(T.en, T.he), radio: true, run: taste(T) })),
  };
}

// ---------------- Neuromuscular junction ----------------
function nmjScene(stage, { readout, L }) {
  P(stage, 'motorAxon', 'Motor neuron axon terminal', 'טרמינל האקסון של נוירון מוטורי', 'The end of a motor neuron from the spinal cord. It is full of vesicles of acetylcholine (ACh).', 'הקצה של נוירון מוטורי מחוט השדרה. הוא מלא בשלפוחיות של אצטילכולין (ACh).', '#f59e0b', [8]);
  P(stage, 'ach', 'Acetylcholine (ACh)', 'אצטילכולין (ACh)', 'The neurotransmitter at every neuromuscular junction.', 'המוליך העצבי בכל צומת עצב-שריר.', '#ec4899', [4, 8]);
  P(stage, 'receptors', 'Nicotinic ACh receptors', 'קולטני ACh ניקוטיניים', 'Ion channels on the muscle fibre. When ACh binds, Na⁺ enters and the muscle fibre fires.', 'תעלות יונים על סיב השריר. כש-ACh נקשר, Na⁺ נכנס וסיב השריר יורה.', '#22c55e', [4, 8]);
  P(stage, 'fiber', 'Skeletal muscle fibre', 'סיב שריר שלד', 'A long cell with stripes (sarcomeres). Its action potential triggers actin and myosin to slide → contraction.', 'תא ארוך עם פסים (סרקומרים). פוטנציאל הפעולה שלו מפעיל את האקטין והמיוזין להחליק ← כיווץ.', '#f87171', [8]);
  const fiber = new THREE.Group();
  stage.root.add(fiber);
  // drawn the textbook way (src/visual/cells.js, src/visual/proteins.js): a striated fibre with its nuclei at the
  // edge; a myelinated motor axon whose terminal branches lie in a groove on the fibre, under a Schwann-cell cap;
  // ACh vesicles inside the boutons; receptor channels on the folds below; AChE tethered in the gap
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 10, 48, 1), mat('#ffffff', { rough: 0.5 }));
  const stripes = striationTexture(); stripes.repeat.set(1, 34);
  body.material.map = stripes; body.material.color.set('#ffd9d9'); body.material.needsUpdate = true;
  body.rotation.z = Math.PI / 2;
  stage.add(body, 'fiber', fiber);
  const rings = []; // the fibre's nuclei: flattened, at the edge under the membrane (they ride along as it shortens)
  [[-3.9, 2.4], [-2.6, 4.2], [-1.6, 1.1], [1.5, 0.6], [2.4, 3.9], [3.6, 2.0], [-0.2, 3.6], [4.3, 5.2]].forEach(([x, a]) => {
    const n = new THREE.Mesh(lumpGeo(V(0, 0, 0), 0.22, { stretch: [2.0, 0.42, 0.8], seed: x, amp: 0.06 }), mat('#7e3a8f'));
    n.position.set(x, Math.cos(a) * 1.07, Math.sin(a) * 1.07); n.rotation.x = a; stage.add(n, 'fiber', fiber); rings.push({ t: n, x0: x, a });
  });
  // the endplate groove: a darker, folded patch of the fibre's membrane under the terminal
  const gutter = new THREE.Mesh(lumpGeo(V(0, 0, 0), 0.6, { stretch: [1.9, 0.12, 0.85], seed: 7, amp: 0.05 }), mat('#b4535a'));
  gutter.position.set(0, 1.12, 0); stage.add(gutter, 'fiber', fiber);
  const folds = [];
  for (let i = 0; i < 9; i++) { const f = new THREE.BoxGeometry(0.03, 0.05, 0.9); f.translate(-0.96 + i * 0.24, 1.19, 0); folds.push(f); }
  stage.add(meshOf(folds, mat('#7f1d1d')), 'fiber', fiber);
  // motor axon: myelin segments (white) with gaps (nodes), then bare just before the terminal
  const path = [V(-3, 5, 0), V(-1.5, 3.5, 0), V(-0.3, 2.4, 0), V(0, 1.85, 0)];
  const axon = tube(path, 0.16, '#f59e0b');
  stage.add(axon, 'motorAxon');
  const curve = axon.userData.curve, myel = [];
  for (const [t0, t1] of [[0, 0.24], [0.27, 0.51], [0.54, 0.74]]) myel.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => curve.getPointAt(t0 + ((t1 - t0) * i) / 8))), 24, 0.3, 14, false));
  stage.add(meshOf(myel, mat('#fef3c7', { rough: 0.45 })), 'motorAxon');
  // the terminal: three boutons, see-through so the vesicles inside show, under a Schwann-cell cap
  const term = new THREE.Mesh(meshOf([lumpGeo(V(-0.62, 1.55, 0.05), 0.38, { stretch: [1.15, 0.55, 0.95], seed: 2 }), lumpGeo(V(0.05, 1.6, -0.05), 0.42, { stretch: [1.1, 0.58, 1], seed: 3 }), lumpGeo(V(0.7, 1.55, 0.08), 0.36, { stretch: [1.2, 0.55, 0.9], seed: 4 })], mat('#fbbf24')).geometry, mat('#fbbf24', { opacity: 0.55 }));
  term.material.depthWrite = false; stage.add(term, 'motorAxon');
  const cap = new THREE.Mesh(lumpGeo(V(0, 1.78, 0), 0.75, { stretch: [1.55, 0.35, 0.85], seed: 6, amp: 0.08 }), mat('#fef9c3', { opacity: 0.3 }));
  cap.material.depthWrite = false; stage.add(cap, 'motorAxon');
  const vesicles = [];
  for (let i = 0; i < 12; i++) { const v = vesicleModel(0.1, { seed: i + 1, beads: 5, color: '#f9a8d4', cargo: '#ec4899' }); v.position.set(rand(-0.8, 0.8), rand(1.5, 1.75), rand(-0.3, 0.3)); stage.add(v, 'ach'); vesicles.push({ v, home: v.position.clone() }); }
  const recs = [];
  for (let i = 0; i < 9; i++) {
    const rc = pentamer(stage, { colors: ['#22c55e', '#4ade80', '#22c55e', '#16a34a', '#86efac'] });
    rc.g.scale.setScalar(0.11); rc.g.position.set(-0.96 + i * 0.24, 1.2, rand(-0.25, 0.25)); rc.g.rotation.y = i;
    rc.g.mats = []; rc.g.traverse((o) => { if (o.isMesh) rc.g.mats.push(o.material); });
    stage.add(rc.g, 'receptors'); recs.push(rc.g);
  }
  P(stage, 'ache', 'Acetylcholinesterase (AChE)', 'אצטילכולין-אסטרז (AChE)', 'An enzyme in the gap that chops ACh in half within about a millisecond, so each impulse gives exactly one twitch. Nerve agents and some insecticides block it.', 'אנזים במרווח שחותך את ה-ACh לשניים בתוך כאלפית שנייה, כך שכל דחף נותן עווית אחת בדיוק. גזי עצבים וחלק מחומרי ההדברה חוסמים אותו.', '#38bdf8', [4, 8]);
  const enzymes = [];
  for (let i = 0; i < 7; i++) { // four enzyme units on a short collagen tail, anchored in the gap
    const e = meshOf([lumpGeo(V(-0.035, 0.03, 0), 0.035, { seed: i }), lumpGeo(V(0.035, 0.03, 0), 0.035, { seed: i + 1 }), lumpGeo(V(0, 0.03, 0.04), 0.033, { seed: i + 2 }), lumpGeo(V(0, 0.075, 0.01), 0.033, { seed: i + 3 }), new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 0, 0), V(0.01, -0.05, 0.01), V(0, -0.1, 0)]), 8, 0.01, 4, false)], mat('#38bdf8'));
    e.position.set(-0.8 + i * 0.27, 1.32, rand(-0.3, 0.3)); stage.add(e, 'ache'); enzymes.push(e);
  }
  // the muscle action potential: a bright band that spreads both ways from the junction along the fibre
  const waves = [-1, 1].map(() => { const w = torus(1.14, 0.07, '#fde047', { emissive: '#fde047', opacity: 0.85 }); w.rotation.y = Math.PI / 2; w.visible = false; stage.add(w, 'fiber', fiber); return w; });
  let waveT = -1;
  const ach = [];
  let curare = false, botox = false, nerveAgent = false, contract = 0, active = 0, twitches = 0;
  const fire = () => {
    if (botox) { readout(`🚫 ${L('Botulinum toxin: no ACh released → no contraction (paralysis)', 'רעלן בוטולינום: לא משתחרר ACh ← אין כיווץ (שיתוק)')}`); return; }
    vesicles.forEach(({ v }) => { v.userData.go = rand(0, 0.3); });
    for (let i = 0; i < 30; i++) { const a = sphere(0.04, '#ec4899', { emissive: '#ec4899' }); a.position.set(rand(-0.8, 0.8), 1.45, rand(-0.3, 0.3)); stage.root.add(a); ach.push({ a, t: rand(-0.3, 0) }); }
  };
  stage.onUpdate((dt, t) => {
    vesicles.forEach(({ v, home }) => {
      if (v.userData.go == null) return;
      v.userData.go += dt;
      const k = Math.min(1, v.userData.go * 2);
      v.position.copy(home).setY(home.y - k * 0.3);
      v.scale.setScalar(1 - k * 0.9);
      if (v.userData.go > 1.4) { v.userData.go = null; v.position.copy(home); v.scale.setScalar(1); }
    });
    for (let i = ach.length - 1; i >= 0; i--) {
      const p = ach[i];
      p.t += dt;
      if (p.t < 0) continue;
      p.a.position.y = 1.45 - Math.min(1, p.t * 2) * 0.25;
      if (p.t > 0.5 && !p.hit) { p.hit = true; if (!curare) { active = 1; if (waveT < 0 || waveT > 1) waveT = 0; } }
      // AChE breaks ACh down quickly; with a nerve agent ACh lingers and keeps hitting the receptors
      if (nerveAgent && p.t > 0.5) { p.a.position.x += rand(-0.02, 0.02); if (!curare) active = 1; if (p.t > 4) p.t = 4.5; else continue; }
      if (p.t > 1.2) { stage.root.remove(p.a); p.a.geometry.dispose(); p.a.material.dispose(); ach.splice(i, 1); }
    }
    recs.forEach((rc) => rc.mats.forEach((m) => m.emissive.set(curare ? '#64748b' : '#22c55e').multiplyScalar(active * 0.9)));
    if (waveT >= 0) { waveT += dt * 1.2; waves.forEach((w, i) => { w.visible = waveT < 1; w.position.x = (i ? 1 : -1) * waveT * 4.8; }); if (waveT >= 1 && nerveAgent && ach.length && !curare) waveT = 0; }
    enzymes.forEach((e, i) => e.material.emissive.set(nerveAgent ? '#000000' : '#38bdf8').multiplyScalar(!nerveAgent && ach.length ? 0.6 + 0.3 * Math.sin(t * 10 + i) : 0));
    enzymes.forEach((e) => e.material.color.set(nerveAgent ? '#475569' : '#38bdf8'));
    if (active > 0.99 && contract < 0.05) twitches++;
    contract += ((active > 0.5 ? 1 : 0) - contract) * Math.min(1, dt * 5);
    active = Math.max(0, active - dt * 0.9);
    rings.forEach(({ t: r, x0, a }) => { r.position.x = x0 * (1 - 0.12 * contract); const rr = 1.07 * (1 + 0.06 * contract); r.position.y = Math.cos(a) * rr; r.position.z = Math.sin(a) * rr; }); // nuclei ride on the thickening fibre
    body.scale.y = 1 - 0.12 * contract;
    body.scale.x = body.scale.z = 1 + 0.06 * contract;
    body.material.emissive.set('#ef4444').multiplyScalar(contract * 0.35);
    if (!botox) readout(nerveAgent && ach.length && !curare ? `⚠️ ${L('AChE is blocked: ACh stays in the gap and the muscle cannot relax (spasm)', 'ה-AChE חסום: ה-ACh נשאר במרווח והשריר לא יכול להרפות (עווית)')}` : curare ? `⛔ ${L('Curare blocks the ACh receptors — ACh is released but the muscle cannot respond', 'קורארה חוסמת את קולטני ה-ACh — ה-ACh משתחרר אבל השריר לא יכול להגיב')}` : `${L('Muscle twitches', 'עוויתות שריר')}: <b>${twitches}</b>`);
  });
  return {
    home: { pos: V(2.5, 2.5, 8), target: V(0, 0.8, 0) },
    actions: [
      { icon: '⚡', label: B('Send a nerve impulse', 'שליחת דחף עצבי'), caption: B('The impulse reaches the terminal → vesicles release ACh → ACh crosses the gap and binds nicotinic receptors → the muscle fibre fires and contracts.', 'הדחף מגיע לטרמינל ← השלפוחיות משחררות ACh ← ה-ACh חוצה את המרווח ונקשר לקולטנים ניקוטיניים ← סיב השריר יורה ומתכווץ.'), run: fire },
      { icon: '🏹', label: B('Curare (blocks receptors)', 'קורארה (חוסמת קולטנים)'), toggle: true, caption: B('Curare, a South American arrow poison, is an ACh-receptor ANTAGONIST: it blocks the receptors, causing paralysis.', 'קורארה, רעל חיצים דרום-אמריקאי, היא אנטגוניסט לקולטני ACh: היא חוסמת את הקולטנים וגורמת לשיתוק.'), run: (on) => { curare = on; } },
      { icon: '💉', label: B('Botulinum toxin (blocks release)', 'רעלן בוטולינום (חוסם שחרור)'), toggle: true, caption: B('Botulinum toxin ("Botox") stops ACh from being released at all — the muscle relaxes. Used in small doses to smooth wrinkles.', 'רעלן הבוטולינום ("בוטוקס") מונע לגמרי את שחרור ה-ACh — השריר מרפה. משמש במינונים קטנים להחלקת קמטים.'), run: (on) => { botox = on; } },
      { icon: '☠️', label: B('Nerve agent (blocks AChE)', 'גז עצבים (חוסם AChE)'), toggle: true, caption: B('Nerve agents (like sarin) and organophosphate insecticides block acetylcholinesterase (blue). ACh is not cleared, so the receptors stay on and the muscle locks in spasm. The antidote atropine blocks the other, muscarinic ACh receptors (in glands and the heart); doctors add a drug that frees the enzyme.', 'גזי עצבים (כמו סארין) וחומרי הדברה אורגנו-זרחניים חוסמים את האצטילכולין-אסטרז (כחול). ה-ACh לא מפונה, הקולטנים נשארים פעילים והשריר ננעל בעווית. התרופה אטרופין חוסמת את קולטני ה-ACh האחרים, המוסקריניים (בבלוטות ובלב); רופאים מוסיפים תרופה שמשחררת את האנזים.'), run: (on) => { nerveAgent = on; } },
    ],
  };
}

export default {
  id: 'tissue',
  scenes: [
    { id: 'cortex', icon: '🧱', name: B('Six layers of cortex', 'שש שכבות הקליפה'), chapters: [2], intro: B('A small block of cerebral cortex about 3 mm thick, organised in six layers. Click a layer, or follow a signal through it.', 'גוש קטן של קליפת המוח בעובי של כ-3 מ"מ, מאורגן בשש שכבות. לחצו על שכבה, או עקבו אחר אות שעובר בה.'), build: cortexScene },
    { id: 'nerve', icon: '🧵', name: B('A nerve, cut across', 'עצב בחתך רוחב'), chapters: [2, 3], intro: B('A peripheral nerve is a cable of many axons, grouped in bundles and wrapped in sheaths.', 'עצב היקפי הוא כבל של הרבה אקסונים, מקובצים בצרורות ועטופים במעטפות.'), build: nerveScene },
    { id: 'bbb', icon: '🛡️', name: B('Blood–brain barrier', 'מחסום דם-מוח'), chapters: [2], intro: B('A brain capillary, sealed by tight junctions and wrapped by astrocytes. Send different molecules from the blood and see which get through.', 'נים במוח, אטום בצמתים הדוקים ועטוף באסטרוציטים. שלחו מולקולות שונות מהדם ובדקו אילו עוברות.'), build: bbbScene },
    { id: 'retina', icon: '👁️', name: B('Retina', 'רשתית'), chapters: [6], intro: B('The retina is "inside-out": light passes through the ganglion and bipolar cells before reaching the rods and cones at the back.', 'הרשתית "הפוכה": האור עובר דרך תאי הגנגליון והתאים הדו-קוטביים לפני שהוא מגיע לקנים ולמדוכים מאחור.'), build: retinaScene },
    { id: 'corti', icon: '👂', name: B('Cochlea & hair cells', 'שבלול ותאי שיער'), chapters: [7], intro: B('The cochlea unrolled: play tones and watch where the basilar membrane vibrates most.', 'השבלול פרוש: השמיעו צלילים וראו היכן הממברנה הבזילרית רוטטת הכי הרבה.'), build: cortiScene },
    { id: 'spinalcord', icon: '🦋', name: B('Spinal cord, cut across', 'חוט השדרה בחתך רוחב'), chapters: [2, 8], intro: B('A slice through the spinal cord: grey matter shaped like a butterfly, white matter around it, and the roots where nerves come in and go out. Follow a reflex, a touch and a pain signal through it.', 'פרוסה של חוט השדרה: חומר אפור בצורת פרפר, חומר לבן סביבו, והשורשים שבהם עצבים נכנסים ויוצאים. עקבו אחרי רפלקס, מגע ואות כאב שעוברים דרכו.'), build: spinalCordScene },
    { id: 'smell', icon: '👃', name: B('Smell', 'ריח'), chapters: [7], intro: B('The roof of the nose: olfactory neurons in their lining, their axons through the skull to the olfactory bulb. Smell a rose or coffee and see which neurons fire.', 'תקרת האף: נוירוני ריח ברירית שלהם, והאקסונים שלהם דרך הגולגולת אל פקעת הריח. הריחו ורד או קפה וראו אילו נוירונים יורים.'), build: smellScene },
    { id: 'taste', icon: '👅', name: B('A taste bud', 'פקעית טעם'), chapters: [7], intro: B('One taste bud in the lining of the tongue. Try the five tastes and see which cells respond.', 'פקעית טעם אחת ברירית הלשון. נסו את חמשת הטעמים וראו אילו תאים מגיבים.'), build: tasteScene },
    { id: 'nmj', icon: '💪', name: B('Neuromuscular junction', 'צומת עצב-שריר'), chapters: [8], intro: B('Where a motor neuron meets a muscle fibre. Send an impulse — then try two poisons that block it in different ways.', 'המקום שבו נוירון מוטורי פוגש סיב שריר. שלחו דחף — ואז נסו שני רעלים שחוסמים אותו בדרכים שונות.'), build: nmjScene },
  ],
};
