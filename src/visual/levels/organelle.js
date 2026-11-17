// ORGANELLE level: inside the neuron's cell body, and vesicle release at the axon terminal.
import * as THREE from 'three';
import { V, mat, sphere, tube, cyl, blob, capsule, torus, flow, rand, dotTexture, rod, timeline } from '../build.js';
import { seeded } from '../neuron.js';
import { bilayer, ionChannel, pentamer } from '../proteins.js';
import { mitochondrion, vesicle as vesicleModel, coiledCoil, sheetGeo, ballsGeo, lumpGeo, meshOf, tone } from '../cells.js';

const B = (en, he) => ({ en, he });

function somaScene(stage, { say, readout, L }) {
  const D = (id, en, he, den, dhe, color, extra = {}) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3], ...extra });
  D('membrane', 'Cell membrane', 'קרום התא', 'A double layer of fat molecules (lipid bilayer) studded with channels, pumps and receptors. Cut open here so you can see inside.', 'שכבה כפולה של מולקולות שומן (דו-שכבה ליפידית) עם תעלות, משאבות וקולטנים. חתוכה כאן כדי לראות פנימה.', '#e8a598', { link: { href: '#/explore/atom/membrane', label: B('Zoom in: ions crossing the membrane', 'זום פנימה: יונים חוצים את הקרום') } });
  D('nucleus', 'Nucleus', 'גרעין', 'Holds the chromosomes (DNA). Genes are copied here into messenger RNA, which leaves through nuclear pores.', 'מכיל את הכרומוזומים (DNA). גנים מועתקים כאן ל-RNA שליח, שיוצא דרך נקבוביות הגרעין.', '#7c5cbf', { link: { href: '#/explore/macromolecule/dna', label: B('Inside the nucleus: DNA → protein', 'בתוך הגרעין: DNA ← חלבון') } });
  D('nucleolus', 'Nucleolus', 'גרעינון', 'A dense region in the nucleus where ribosomes are assembled.', 'אזור צפוף בגרעין שבו מורכבים הריבוזומים.', '#3b2a73');
  D('er', 'Rough endoplasmic reticulum', 'רשתית תוך-פלזמית מחוספסת', 'Folded membranes covered with ribosomes that build proteins (in neurons called Nissl bodies — what the Nissl stain colours).', 'קרומים מקופלים המכוסים בריבוזומים שבונים חלבונים (בנוירונים נקראים גופיפי ניסל — מה שצביעת ניסל צובעת).', '#5b8def');
  D('golgi', 'Golgi apparatus', 'מערכת גולג\'י', 'Stacks that package and label proteins and send them off in vesicles.', 'ערימות שאורזות ומסמנות חלבונים ושולחות אותם בשלפוחיות.', '#f2c14e');
  D('mito', 'Mitochondria', 'מיטוכונדריה', 'The power plants: they turn glucose and oxygen into ATP. The brain uses about 20% of the body\'s energy.', 'תחנות הכוח: הופכות גלוקוז וחמצן ל-ATP. המוח משתמש בכ-20% מהאנרגיה של הגוף.', '#ef4444');
  D('lysosome', 'Lysosomes', 'ליזוזומים', 'Little sacs of enzymes that break down waste.', 'שקיקים קטנים של אנזימים שמפרקים פסולת.', '#10b981');
  D('microtubules', 'Microtubules', 'מיקרוטובולים', 'Part of the cytoskeleton: the "rail tracks" that carry materials down the axon. Stabilised by tau protein (tangled in Alzheimer\'s).', 'חלק מהשלד התאי: "מסילות הרכבת" שמובילות חומרים לאורך האקסון. מיוצבים בחלבון טאו (מסתבך באלצהיימר).', '#94a3b8', { chapters: [3, 5] });
  // parts that only the real cell model shows (hover them in "Real model")
  D('cytoplasm', 'Cytoplasm', 'ציטופלזמה', 'The jelly-like fluid that fills the cell, around the organelles. Proteins, salts and sugars float in it.', 'הנוזל הג׳לי שממלא את התא סביב האברונים. חלבונים, מלחים וסוכרים צפים בו.', '#d9bd86');
  D('ribosomes', 'Ribosomes', 'ריבוזומים', 'Tiny protein factories. Many sit on the rough ER (that is what makes it "rough"); they read messenger RNA and link amino acids into a protein.', 'מפעלי חלבון זעירים. רבים יושבים על הרשתית המחוספסת (זה מה שהופך אותה ל"מחוספסת"); הם קוראים RNA שליח ומחברים חומצות אמינו לחלבון.', '#d10600');
  D('centrosome', 'Centrosome (centrioles)', 'צנטרוזום (צנטריולים)', 'Two small barrels near the nucleus that organise the microtubules — the cell’s rail tracks.', 'שתי חביות קטנות ליד הגרעין שמארגנות את המיקרוטובולים — מסילות הרכבת של התא.', '#8300e7');
  D('vesicle', 'Transport vesicles', 'שלפוחיות הובלה', 'Bubbles that carry proteins from the Golgi to the membrane or down the axon.', 'בועות שמובילות חלבונים ממערכת הגולג\'י לקרום או לאורך האקסון.', '#f08a7a');

  const rnd = seeded(21);
  // drawn the textbook way (src/visual/cells.js): every organelle cut open or shown with its inner structure
  // The membrane: the back of a cut-open cell, its cut edges showing the two layers of the membrane
  const PHI0 = 0.6, PHI1 = 0.6 + Math.PI * 1.6;
  const mem = new THREE.Mesh(new THREE.SphereGeometry(3.2, 64, 48, PHI0, PHI1 - PHI0), mat('#e8a598', { opacity: 0.5, side: THREE.DoubleSide }));
  mem.material.depthWrite = false;
  stage.add(mem, 'membrane');
  const meridian = (r, phi) => Array.from({ length: 33 }, (_, i) => { const th = (i / 32) * Math.PI; return V(-r * Math.cos(phi) * Math.sin(th), r * Math.cos(th), r * Math.sin(phi) * Math.sin(th)); });
  for (const phi of [PHI0, PHI1]) for (const r of [3.2, 3.08]) stage.add(tube(meridian(r, phi), 0.045, '#e7a98f', undefined, 64), 'membrane');
  const axonHill = cyl(0.5, 1.1, 1.6, '#e8a598', { opacity: 0.4, side: THREE.DoubleSide });
  axonHill.material.depthWrite = false;
  axonHill.rotation.z = -Math.PI / 2; axonHill.position.set(3.6, 0, 0);
  stage.add(axonHill, 'membrane');
  // Nucleus: a double envelope dotted with pores, cut open like the cell to show the chromatin and the nucleolus
  const NUC = V(-0.6, 0.2, 0);
  const NP0 = 1.35 + 0.9, NP1 = 1.35 + Math.PI * 2 - 0.9; // the nucleus is cut open toward the viewer
  const envOut = new THREE.Mesh(new THREE.SphereGeometry(1.1, 48, 32, NP0, NP1 - NP0), mat('#7c5cbf', { side: THREE.DoubleSide }));
  const envIn = new THREE.Mesh(new THREE.SphereGeometry(1.03, 48, 32, NP0, NP1 - NP0), mat('#a78bda', { side: THREE.BackSide }));
  envOut.position.copy(NUC); envIn.position.copy(NUC);
  stage.add(envOut, 'nucleus'); stage.add(envIn, 'nucleus');
  const pores = [];
  for (let i = 0; i < 70; i++) { // nuclear pores: little rings spread evenly over the envelope (not on the cut)
    const y = 1 - (2 * (i + 0.5)) / 70, rr = Math.sqrt(1 - y * y), th = i * 2.39996;
    let phi = Math.atan2(Math.sin(th), -Math.cos(th)); if (phi < 0) phi += Math.PI * 2;
    if (!((phi > NP0 + 0.08 && phi < NP1 - 0.08) || (phi + Math.PI * 2 > NP0 + 0.08 && phi + Math.PI * 2 < NP1 - 0.08))) continue;
    const n = V(-Math.cos(phi) * rr, y, Math.sin(phi) * rr);
    const t = new THREE.TorusGeometry(0.055, 0.02, 6, 14);
    t.applyMatrix4(new THREE.Matrix4().compose(NUC.clone().addScaledVector(n, 1.1), new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n), V(1, 1, 1)));
    pores.push(t);
  }
  stage.add(meshOf(pores, mat('#c4b5fd')), 'nucleus');
  const chrom = [];
  for (let k = 0; k < 7; k++) { // chromatin: loose threads inside the nucleus
    let p = NUC.clone().add(V((rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.9));
    const pts = [p.clone()];
    for (let i = 0; i < 9; i++) { p = p.clone().add(V((rnd() - 0.5) * 0.45, (rnd() - 0.5) * 0.45, (rnd() - 0.5) * 0.45)); if (p.distanceTo(NUC) > 0.85) p.sub(NUC).multiplyScalar(0.8).add(NUC); pts.push(p.clone()); }
    chrom.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.035, 5, false));
  }
  stage.add(meshOf(chrom, mat('#4c1d95')), 'nucleus');
  const nl = new THREE.Mesh(lumpGeo(V(0, 0, 0), 0.33, { seed: 4, amp: 0.18 }), mat('#3b2a73')); nl.position.set(-0.4, 0.4, 0.45);
  stage.add(nl, 'nucleolus');
  // Rough ER: flattened sacs (cisternae) curving round the nucleus, both faces studded with ribosomes
  const erGeos = [], ribs = [];
  for (let k = 0; k < 4; k++) {
    const sheet = (u, v) => { const a = -1.2 + u * 2.6, r = 1.45 + k * 0.24 + 0.05 * Math.sin(u * 13 + k), z = (v - 0.5) * 1.1 + 0.18 * Math.sin(a * 3 + k); return V(-0.6 + Math.cos(a) * r, 0.2 + Math.sin(a) * r, z); };
    erGeos.push(sheetGeo(sheet, 60, 8));
    for (const v of [0, 1]) erGeos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 31 }, (_, i) => sheet(i / 30, v))), 60, 0.045, 6, false)); // swollen rims
    for (let i = 0; i < 90; i++) { const u = rnd(), v = rnd(), p = sheet(u, v), q = sheet(Math.min(1, u + 0.01), v), w = sheet(u, Math.min(1, v + 0.01)); const n = q.sub(p).cross(w.sub(p)).normalize(); ribs.push(p.addScaledVector(n, (i % 2 ? 1 : -1) * 0.045)); }
  }
  const erM = meshOf(erGeos, mat('#5b8def', { side: THREE.DoubleSide }));
  stage.add(erM, 'er');
  stage.add(new THREE.Mesh(ballsGeo(ribs, 0.032), mat('#1d3f8f')), 'er');
  // free ribosomes in the cytoplasm
  const free = [];
  for (let i = 0; i < 120; i++) { const p = V((rnd() - 0.5) * 5.2, (rnd() - 0.5) * 5.2, (rnd() - 0.5) * 4); if (p.length() < 2.9 && p.distanceTo(NUC) > 1.3) free.push(p); }
  stage.add(new THREE.Mesh(ballsGeo(free, 0.03), mat('#d10600')), 'ribosomes');
  // Golgi: a curved stack of flat sacs with swollen rims, vesicles budding from its edges
  const golgi = new THREE.Group();
  const gGeos = [], gVes = [];
  for (let k = 0; k < 5; k++) {
    const R = 0.62 - k * 0.05, cap = new THREE.SphereGeometry(R, 32, 6, 0, Math.PI * 2, 0, 0.75);
    cap.scale(1.5, 0.32, 0.85); cap.translate(0, k * 0.15 - cap.parameters.radius * 0.32 * Math.cos(0.75), 0);
    gGeos.push(cap);
    const rim = new THREE.TorusGeometry(R * Math.sin(0.75), 0.05, 6, 40); rim.rotateX(Math.PI / 2); rim.scale(1.5, 1, 0.85); rim.translate(0, k * 0.15, 0);
    gGeos.push(rim);
    for (const sd of [-1, 1]) gVes.push(V(sd * (R * Math.sin(0.75) * 1.5 + 0.1), k * 0.15 + 0.04, (rnd() - 0.5) * 0.4));
  }
  golgi.add(meshOf(gGeos, mat('#f2c14e', { side: THREE.DoubleSide })), new THREE.Mesh(ballsGeo(gVes, 0.07, 10, 7), mat('#f8d77a')));
  golgi.position.set(1.85, -1.45, 0.45); golgi.rotation.set(0.35, 0.2, 0.75);
  stage.add(golgi, 'golgi');
  // Centrosome: two barrels (centrioles) at right angles, each nine triplets of short tubes
  const cen = [];
  for (const [rot, off] of [[[0, 0, 0], V(0, 0, 0)], [[Math.PI / 2, 0, 0], V(0.16, 0.05, 0)]]) {
    for (let i = 0; i < 9; i++) for (let t = 0; t < 3; t++) {
      const a = (i / 9) * Math.PI * 2 + t * 0.14, c = new THREE.CylinderGeometry(0.014, 0.014, 0.26, 5);
      c.translate(Math.cos(a) * (0.075 + t * 0.012), 0, Math.sin(a) * (0.075 + t * 0.012));
      c.applyMatrix4(new THREE.Matrix4().compose(off, new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), V(1, 1, 1)));
      cen.push(c);
    }
  }
  const cent = meshOf(cen, mat('#8300e7')); cent.position.set(0.85, 1.25, 1.0); stage.add(cent, 'centrosome');
  // Mitochondria: outer membrane, matrix and the folded inner membrane (cristae)
  const mitos = [];
  for (const [x, y, z, r] of [[0.7, 2.45, 0.6, 0.5], [-2.0, -1.5, 1.0, 1.2], [0.5, -2.35, -0.6, 2], [2.4, 1.0, -0.9, 2.6]]) {
    const g = mitochondrion({ len: 0.7, r: 0.24, seed: x });
    g.position.set(x, y, z); g.rotation.set(r, r * 0.7, r * 0.3);
    stage.add(g, 'mito');
    mitos.push(g);
  }
  // Lysosomes: membrane sacs holding dark, half-digested material
  const lysos = [];
  for (const [x, y, z] of [[-1.6, 1.6, 1.2], [0.3, 2.0, -1.0], [2.0, -1.4, 1.0]]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16), mat('#10b981', { opacity: 0.7 }));
    l.add(new THREE.Mesh(ballsGeo([V(0.05, 0.03, 0), V(-0.06, -0.02, 0.04), V(0, -0.05, -0.05), V(-0.02, 0.07, 0.02)], 0.055, 8, 6), mat('#065f46')));
    l.position.set(x, y, z); stage.add(l, 'lysosome'); lysos.push(l);
  }
  // Microtubules heading into the axon
  const mt = new THREE.Group();
  const mtCurves = [];
  for (let k = 0; k < 5; k++) { const y = -0.4 + k * 0.2, z = -0.3 + (k % 3) * 0.3; const m = tube([V(-0.2, y * 2, z * 2), V(1.6, y, z), V(3, y * 0.4, z * 0.4), V(4.6, y * 0.3, z * 0.3)], 0.035, '#cbd5e1', undefined, 48); mt.add(m); mtCurves.push(m.userData.curve); }
  stage.add(mt, 'microtubules');
  const ves = new THREE.Group();
  for (let i = 0; i < 5; i++) { const v = vesicleModel(0.12, { seed: i + 3, beads: 6, cargo: '#ffd166' }); v.position.set(2.5 + rnd() * 0.4, -0.9 + rnd() * 0.6, 0.7 + rnd() * 0.4); ves.add(v); }
  stage.add(ves, 'vesicle');

  const protein = flow(stage, new THREE.CatmullRomCurve3([V(-0.6, 0.2, 0.9), V(0.2, 1.1, 0.5), V(0.9, 1.6, 0.3), V(1.6, 0.1, 0.4), V(1.4, -0.5, 0.4), V(2.2, -0.6, 0.6), V(2.9, -0.4, 0.7)]), { color: '#ffd166', count: 18, speed: 0.12, size: 0.14 });
  protein.setActive(false);
  const transport = mtCurves.map((c) => flow(stage, c, { color: '#f08a7a', count: 5, speed: 0.2, size: 0.18 }));
  transport.forEach((f) => f.setActive(false));
  const atp = mitos.map((m) => flow(stage, new THREE.CatmullRomCurve3([m.position.clone(), m.position.clone().add(V(rand(-1, 1), rand(-1, 1), rand(0, 1)))]), { color: '#fde047', count: 8, speed: 0.6, size: 0.1 }));
  atp.forEach((f) => f.setActive(false));
  // waste: worn-out bits (grey) drift to the nearest lysosome, which glows as it digests them
  const waste = lysos.map((l) => flow(stage, new THREE.CatmullRomCurve3([l.position.clone().add(V(1.1, -0.6, 0.3)), l.position.clone().add(V(0.5, -0.1, 0.2)), l.position.clone()]), { color: '#9ca3af', count: 6, speed: 0.35, size: 0.12 }));
  waste.forEach((f) => f.setActive(false));
  let digesting = 0, tau = false;
  // Alzheimer's: tau falls off the microtubules and clumps into tangles; the tracks break up and transport stops
  const tangles = new THREE.Group();
  for (let i = 0; i < 4; i++) { const t = blob(0.22, '#7c2d12', { seed: i + 11, amp: 0.45, freq: 4 }); t.position.set(1.4 + i * 0.75, -0.25 + (i % 2) * 0.35, 0.2); tangles.add(t); }
  tangles.visible = false;
  stage.add(tangles, 'microtubules');
  stage.onUpdate((dt, t) => {
    digesting = Math.max(0, digesting - dt);
    lysos.forEach((l, i) => l.material.emissive.set('#10b981').multiplyScalar(digesting > 0 ? 0.35 + 0.3 * Math.sin(t * 6 + i) : 0));
    mt.children.forEach((m, i) => { m.visible = !tau || i % 2 === 0; });
    if (tau) transport.forEach((f) => f.setActive(false));
    readout(tau ? `⚠️ ${L('Tau tangles: the tracks fall apart, nothing reaches the axon', 'סבכי טאו: המסילות מתפרקות, דבר לא מגיע לאקסון')}` : '');
  });
  const off = () => { protein.setActive(false); transport.forEach((f) => f.setActive(false)); atp.forEach((f) => f.setActive(false)); waste.forEach((f) => f.setActive(false)); };
  return {
    home: { pos: V(1.2, 1.5, 9), target: V(0.6, 0, 0) },
    actions: [
      { icon: '🏭', label: B('Make a protein', 'ייצור חלבון'), caption: B('Follow the yellow dots: a gene is copied in the nucleus → ribosomes on the rough ER build the protein → the Golgi packages it → a vesicle carries it to the membrane.', 'עקבו אחרי הנקודות הצהובות: גן מועתק בגרעין ← ריבוזומים על הרשתית המחוספסת בונים את החלבון ← הגולג\'י אורז אותו ← שלפוחית מובילה אותו לקרום.'), run: () => { off(); protein.setActive(true); stage.focus(['nucleus', 'er', 'golgi', 'vesicle']); } },
      { icon: '🚂', label: B('Axonal transport', 'הובלה אקסונלית'), caption: B('Motor proteins walk vesicles along microtubules down the axon — like trains on tracks.', 'חלבונים מוטוריים "מצעידים" שלפוחיות לאורך המיקרוטובולים במורד האקסון — כמו רכבות על מסילות.'), run: () => { off(); transport.forEach((f) => f.setActive(true)); stage.focus(['microtubules', 'vesicle']); } },
      { icon: '🔋', label: B('Make energy (ATP)', 'הפקת אנרגיה (ATP)'), caption: B('Mitochondria produce ATP, which powers pumps like the Na⁺/K⁺ pump — the brain\'s biggest energy cost.', 'המיטוכונדריה מייצרות ATP, שמפעיל משאבות כמו משאבת Na⁺/K⁺ — ההוצאה האנרגטית הגדולה ביותר של המוח.'), run: () => { off(); atp.forEach((f) => f.setActive(true)); stage.focus(['mito']); } },
      { icon: '♻️', label: B('Clear out waste', 'פינוי פסולת'), caption: B('Worn-out proteins and old organelles (grey) are delivered to lysosomes, whose enzymes break them into parts the cell can reuse. Neurons live for a lifetime and cannot divide, so this clean-up matters a lot.', 'חלבונים בלויים ואברונים ישנים (אפור) מועברים לליזוזומים, שהאנזימים שלהם מפרקים אותם לחלקים שהתא יכול לנצל שוב. נוירונים חיים כל החיים ולא מתחלקים, ולכן הניקיון הזה חשוב מאוד.'), run: () => { off(); waste.forEach((f) => f.setActive(true)); digesting = 6; stage.focus(['lysosome']); } },
      { icon: '🧶', label: B("Alzheimer's: tau tangles", 'אלצהיימר: סבכי טאו'), toggle: true, caption: B("Tau normally holds the microtubules together. In Alzheimer's disease tau comes loose and clumps into tangles (brown). The tracks break up, transport down the axon stops, and the neuron slowly starves.", 'טאו מחזיק בדרך כלל את המיקרוטובולים יחד. במחלת אלצהיימר הטאו מתנתק ומתגבש לסבכים (חום). המסילות מתפרקות, ההובלה לאורך האקסון נעצרת, והנוירון נחלש לאט.'), run: (on) => { tau = on; tangles.visible = on; if (on) { off(); stage.focus(['microtubules']); } else stage.focus([]); } },
    ],
  };
}

function vesicleScene(stage, { say, readout, L }) {
  const D = (id, en, he, den, dhe, color, extra = {}) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3], ...extra });
  D('terminal', 'Axon terminal membrane', 'קרום כפתור האקסון', 'The membrane facing the synaptic cleft, where vesicles dock and fuse.', 'הקרום שפונה אל המרווח הסינפטי, שבו השלפוחיות נצמדות ומתמזגות.', '#e8a598');
  D('vesicles', 'Synaptic vesicles', 'שלפוחיות סינפטיות', 'Each holds thousands of neurotransmitter molecules. Docked vesicles are ready to release.', 'כל אחת מכילה אלפי מולקולות של מוליך עצבי. שלפוחיות שנצמדו מוכנות לשחרור.', '#f08a7a');
  D('cachannel', 'Voltage-gated Ca²⁺ channels', 'תעלות Ca²⁺ תלויות-מתח', 'Open when the action potential arrives; calcium entry is the trigger for release.', 'נפתחות כשפוטנציאל הפעולה מגיע; כניסת סידן היא הטריגר לשחרור.', '#22d3ee', { link: { href: '#/explore/macromolecule/channels', label: B('Zoom in: channel proteins', 'זום פנימה: חלבוני תעלה') } });
  D('mito', 'Mitochondrion', 'מיטוכונדריון', 'Supplies ATP to refill and recycle vesicles.', 'מספק ATP למילוי ומיחזור השלפוחיות.', '#ef4444');
  // drawn the textbook way (src/visual/proteins.js, src/visual/cells.js): the bouton cut in half, its back wall a
  // membrane with a visible double edge; the release face a real lipid bilayer; the cleft and the next cell below
  const FACE_Y = -1.6, S = 0.3; // the release face, and the scale of its bilayer (thin, so the vesicles look big)
  const CA_AT = [-1.6, 0, 1.6];
  const face = bilayer({ w: 21, d: 21, spacing: 0.36, front: 1.25 / S, keep: (x, z) => x * x + z * z < (2.95 / S) ** 2, holes: CA_AT.map((x) => ({ x: x / S, z: 0.9 / S, r: 0.42 / S })) });
  face.group.scale.setScalar(S); face.group.position.y = FACE_Y;
  stage.add(face.group, 'terminal');
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3, 48, 24, Math.PI, Math.PI, 0, Math.PI / 2), mat('#e8a598', { opacity: 0.55, side: THREE.DoubleSide }));
  dome.material.depthWrite = false; dome.position.y = FACE_Y;
  stage.add(dome, 'terminal');
  const rimPts = (r) => Array.from({ length: 41 }, (_, i) => V(Math.cos((i / 40) * Math.PI) * r, FACE_Y + Math.sin((i / 40) * Math.PI) * r, 0));
  stage.add(tube(rimPts(3), 0.05, '#e7a98f', undefined, 80), 'terminal'); // the cut edge shows the two layers of the membrane
  stage.add(tube(rimPts(2.86), 0.05, '#e7a98f', undefined, 80), 'terminal');
  // the cleft and the receiving cell: its membrane, the dense layer of scaffold under it, and its receptors
  D('postsyn', 'Postsynaptic membrane', 'הממברנה הפוסט-סינפטית', 'The membrane of the next cell, across a cleft about 20 nm wide. Its receptors sit right opposite the release sites, held by a dense protein scaffold (the postsynaptic density).', 'הממברנה של התא הבא, מעבר למרווח ברוחב של כ-20 ננומטר. הקולטנים שלה יושבים בדיוק מול אתרי השחרור, ומוחזקים בפיגום חלבוני צפוף (הצפיפות הפוסט-סינפטית).', '#c4b5fd');
  const POST_Y = -2.85;
  const post = bilayer({ w: 21, d: 21, spacing: 0.36, front: 1.25 / S, keep: (x, z) => x * x + z * z < (2.95 / S) ** 2, head: '#c9b8f0', tail: '#e6dcf8', seed: 9 });
  post.group.scale.setScalar(S); post.group.position.y = POST_Y;
  stage.add(post.group, 'postsyn');
  const psd = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.12, 48), mat('#4c1d95', { opacity: 0.55 }));
  psd.scale.set(2, 1, 1.1); psd.material.depthWrite = false; psd.position.set(0, POST_Y - 0.26, 0); stage.add(psd, 'postsyn');
  [[-1.3, 0.5], [-0.4, 0.8], [0.5, 0.5], [1.4, 0.8], [-0.9, -0.4], [0.9, -0.3]].forEach(([x, z], i) => { const r = pentamer(stage, { colors: ['#8b5cf6', '#a78bfa'] }); r.g.scale.setScalar(0.2); r.g.rotation.y = i; r.g.position.set(x, POST_Y + 0.05, z); stage.add(r.g, 'postsyn'); });
  // voltage-gated Ca²⁺ channels: four domains in one chain, like the Na⁺ channel
  const chans = CA_AT.map((x) => { const c = ionChannel(stage, { kind: 'nav', color: '#22d3ee' }); c.g.scale.setScalar(0.22); c.g.position.set(x, FACE_Y, 0.9); stage.add(c.g, 'cachannel'); return c; });
  const m = mitochondrion({ len: 0.9, r: 0.32 }); m.position.set(-1.5, 0.6, -0.8); m.rotation.z = 1.2; stage.add(m, 'mito');
  const vesicles = [];
  for (let i = 0; i < 8; i++) {
    const v = vesicleModel(0.3, { seed: i + 1 });
    const home = V(-1.8 + (i % 4) * 1.2, i < 4 ? -1.1 : 0.0, i % 2 ? 0.4 : -0.3);
    v.position.copy(home);
    stage.add(v, 'vesicles');
    vesicles.push({ m: v, home, state: 'docked', t: 0 });
  }
  // Released neurotransmitter + calcium particles
  const mk = (color, n, size) => { const pos = new Float32Array(n * 3).fill(-100); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ color, size, map: dotTexture(), transparent: true, depthWrite: false })); stage.root.add(p); return { pos, g, list: [] }; };
  const nt = mk('#ff5fa2', 300, 0.14);
  const ca = mk('#22d3ee', 60, 0.16);
  let ap = 0, caBlock = false, botox = false, released = 0;
  D('snare', 'SNARE proteins', 'חלבוני SNARE', 'Protein ropes that tie a vesicle to the membrane. When Ca²⁺ arrives they zip up and pull the two membranes together until they fuse. Botulinum toxin cuts them.', 'חבלים חלבוניים שקושרים שלפוחית לקרום. כשמגיע Ca²⁺ הם נרכסים ומושכים את שני הקרומים זה לזה עד שהם מתמזגים. רעלן הבוטולינום חותך אותם.', '#a3e635');
  // each docked vesicle is held by two SNARE complexes: three helices zipped into a rope (synaptobrevin from the
  // vesicle, blue; syntaxin, red, and SNAP-25, green, from the membrane)
  const snares = [];
  vesicles.filter((v) => v.home.y < -0.5).forEach((v) => [-1, 1].forEach((sd) => {
    const s = coiledCoil(V(v.home.x + sd * 0.13, v.home.y - 0.26, v.home.z), V(v.home.x + sd * 0.2, FACE_Y + 0.14, v.home.z), ['#3b82f6', '#ef4444', '#22c55e'], { r: 0.028, tube: 0.022, turns: 1.2 });
    s.base = s.mats.map((x) => x.color.clone());
    stage.add(s, 'snare'); snares.push(s);
  }));
  stage.onUpdate((dt) => {
    // the reserve row (upper) moves down to fill an empty docking site
    for (const v of vesicles) {
      if (v.home.y > -0.5 && v.state === 'docked') {
        const free = vesicles.find((w) => w.home.y < -0.5 && w.state === 'recycling' && !w.refilled);
        if (free) { free.refilled = true; const h = free.home; free.home = v.home; v.home = h; v.state = 'moving'; }
      }
      if (v.state === 'moving') { v.m.position.lerp(v.home, Math.min(1, dt * 2.5)); if (v.m.position.distanceTo(v.home) < 0.03) { v.state = 'docked'; v.refilled = false; } }
    }
    // botulinum toxin cuts the ropes: they turn grey and fall short
    snares.forEach((s) => { s.mats.forEach((m, k) => m.color.copy(botox ? new THREE.Color('#57534e') : s.base[k])); s.children.forEach((c) => { c.visible = !botox || c !== s.children[0]; }); });
    chans.forEach((c) => { c.tint(caBlock ? '#475569' : null); c.set(ap > 0 && !caBlock); });
    if (ap > 0) {
      ap -= dt;
      if (!caBlock && Math.random() < 0.5) chans.forEach((c) => ca.list.push({ p: c.g.position.clone().add(V(0, -0.6, 0)), v: V(rand(-0.2, 0.2), 0.9, rand(-0.2, 0.2)), life: 0 }));
    }
    ca.list = ca.list.filter((d) => (d.life += dt) < 1.4);
    ca.list.forEach((d) => d.p.addScaledVector(d.v, dt));
    for (const v of vesicles) {
      if (v.state === 'fusing') {
        v.t += dt;
        v.m.position.y = v.home.y - Math.min(1, v.t * 1.5) * (v.home.y + 1.55);
        v.m.scale.setScalar(Math.max(0.05, 1 - Math.max(0, v.t - 0.6) * 1.5));
        if (v.t > 0.6 && !v.released) { v.released = true; released++; for (let k = 0; k < 30; k++) nt.list.push({ p: V(v.m.position.x, -1.75, v.m.position.z), v: V(rand(-0.6, 0.6), -rand(0.3, 1.2), rand(-0.6, 0.6)), life: 0 }); }
        if (v.t > 1.3) { v.state = 'recycling'; v.t = 0; }
      } else if (v.state === 'recycling') {
        v.t += dt * 0.5;
        v.m.scale.setScalar(Math.min(1, v.t));
        v.m.position.lerp(v.home, Math.min(1, dt * 2));
        if (v.t >= 1) { v.state = 'docked'; v.released = false; v.refilled = false; }
      }
    }
    nt.list = nt.list.filter((d) => (d.life += dt) < 2.5);
    nt.list.forEach((d) => { d.p.addScaledVector(d.v, dt); if (d.p.y < POST_Y + 0.22) { d.p.y = POST_Y + 0.22; d.v.y = 0; d.v.x *= 0.9; d.v.z *= 0.9; } }); // lands on the next cell
    for (const s of [nt, ca]) { for (let k = 0; k < s.pos.length / 3; k++) { const d = s.list[k]; s.pos[k * 3] = d ? d.p.x : 0; s.pos[k * 3 + 1] = d ? d.p.y : -100; s.pos[k * 3 + 2] = d ? d.p.z : 0; } s.g.attributes.position.needsUpdate = true; }
    const why = caBlock ? ` · ⛔ ${L('no Ca²⁺ enters → no release', 'סידן לא נכנס ← אין שחרור')}` : botox ? ` · ⛔ ${L('SNAREs cut → vesicles cannot fuse', 'ה-SNARE חתוכים ← השלפוחיות לא מתמזגות')}` : '';
    readout(`${L('Docked vesicles', 'שלפוחיות מוכנות')}: <b>${vesicles.filter((v) => v.state === 'docked' && v.home.y < -0.5).length}/4</b> · ${L('reserve', 'מאגר')}: ${vesicles.filter((v) => v.state === 'docked' && v.home.y > -0.5).length} · ${L('released', 'שוחררו')}: <b>${released}</b> · Ca²⁺: ${ca.list.length ? '⬆' : '—'}${why}`);
  });
  const tl = timeline(stage);
  const fire = (n) => {
    ap = 0.4;
    if (caBlock || botox) return;
    tl.later(0.3, () => vesicles.filter((v) => v.state === 'docked' && v.home.y < -0.5).slice(0, n).forEach((v) => { v.state = 'fusing'; v.t = 0; }));
  };
  return {
    home: { pos: V(0, 1.5, 8), target: V(0, -0.6, 0) },
    actions: [
      { icon: '⚡', label: B('Action potential arrives', 'פוטנציאל פעולה מגיע'), caption: B('Ca²⁺ channels open (blue), calcium rushes in, and docked vesicles fuse with the membrane, spilling neurotransmitter (pink) into the cleft — exocytosis. Then the vesicle membrane is recycled.', 'תעלות Ca²⁺ נפתחות (כחול), סידן נכנס, ושלפוחיות שנצמדו מתמזגות עם הקרום ושופכות מוליך עצבי (ורוד) למרווח — אקסוציטוזה. אחר כך קרום השלפוחית ממוחזר.'), run: () => fire(2) },
      { icon: '⚡⚡', label: B('Fast firing', 'ירי מהיר'), caption: B('More action potentials → more calcium → more vesicles released. If firing continues, docked vesicles run out until they are refilled.', 'יותר פוטנציאלי פעולה ← יותר סידן ← יותר שלפוחיות משתחררות. אם הירי נמשך, השלפוחיות המוכנות נגמרות עד שהן מתמלאות מחדש.'), run: () => fire(4) },
      { icon: '🐌', label: B('Block the Ca²⁺ channels', 'חסימת תעלות ה-Ca²⁺'), toggle: true, caption: B('Some cone-snail venoms (ω-conotoxin) plug these calcium channels. The action potential still arrives, but without calcium nothing is released — electricity can no longer become chemistry. A drug made from it (ziconotide) treats severe pain.', 'ארס של חלזונות קונוס (ω-קונוטוקסין) פוקק את תעלות הסידן. פוטנציאל הפעולה עדיין מגיע, אבל בלי סידן שום דבר לא משתחרר — החשמל לא הופך לכימיה. תרופה שעשויה ממנו (זיקונוטיד) מטפלת בכאב קשה.'), run: (on) => { caBlock = on; } },
      { icon: '✂️', label: B('Botulinum toxin (cuts SNAREs)', 'רעלן בוטולינום (חותך SNARE)'), toggle: true, caption: B('Calcium comes in, but the toxin has cut the SNARE ropes (green), so the vesicles cannot fuse. At the muscle this means paralysis; in tiny doses it is "Botox".', 'הסידן נכנס, אבל הרעלן חתך את חבלי ה-SNARE (ירוק), ולכן השלפוחיות לא מתמזגות. בשריר זה אומר שיתוק; במינונים זעירים זה "בוטוקס".'), run: (on) => { botox = on; } },
    ],
  };
}

export default {
  id: 'organelle',
  scenes: [
    { id: 'soma', icon: '🏭', name: B('Inside the cell body', 'בתוך גוף התא'), chapters: [3, 5], intro: B('The cell body is a factory: the nucleus holds the instructions, the rough ER and Golgi build and package proteins, mitochondria supply energy, and microtubules carry products down the axon.', 'גוף התא הוא מפעל: הגרעין מחזיק את ההוראות, הרשתית המחוספסת והגולג\'י בונים ואורזים חלבונים, המיטוכונדריה מספקות אנרגיה, והמיקרוטובולים מובילים את המוצרים לאורך האקסון.'), build: somaScene },
    { id: 'vesicles', icon: '🫧', name: B('Vesicle release', 'שחרור שלפוחיות'), chapters: [3], intro: B('Inside the axon terminal: how an electrical signal becomes a chemical one.', 'בתוך כפתור האקסון: איך אות חשמלי הופך לאות כימי.'), build: vesicleScene },
  ],
};
