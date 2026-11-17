// ATOM / ION level: the ions that make neurons electrical, the resting & action potential across a membrane,
// and the Mg²⁺ block of the NMDA receptor.
import * as THREE from 'three';
import { V, mat, sphere, box, cyl, torus, textSprite, rand, flow, timeline, voltageTrace } from '../build.js';
import { bilayer, ionChannel, naKPump, iGluR } from '../proteins.js';

const B = (en, he) => ({ en, he });

const ION = {
  na: { sym: 'Na⁺', color: '#f5b301', r: 0.102, name: B('Sodium ion (Na⁺)', 'יון נתרן (Na⁺)'), desc: B('Positive. About 10× more concentrated OUTSIDE the neuron. When Na⁺ channels open it rushes in and makes the inside positive — the rising phase of the action potential.', 'חיובי. ריכוזו מחוץ לנוירון גבוה פי 10 בערך. כשתעלות Na⁺ נפתחות הוא נכנס בשטף והופך את הפנים לחיובי — שלב העלייה של פוטנציאל הפעולה.'), chapters: [3] },
  k: { sym: 'K⁺', color: '#8b5cf6', r: 0.138, name: B('Potassium ion (K⁺)', 'יון אשלגן (K⁺)'), desc: B('Positive. Much more concentrated INSIDE the neuron. K⁺ leaking out is the main reason the inside rests at about −70 mV; its exit also ends the action potential.', 'חיובי. מרוכז הרבה יותר בתוך הנוירון. דליפת K⁺ החוצה היא הסיבה העיקרית שהפנים נח בכ-‎−70 מ"ו; יציאתו גם מסיימת את פוטנציאל הפעולה.'), chapters: [3] },
  cl: { sym: 'Cl⁻', color: '#22c55e', r: 0.181, name: B('Chloride ion (Cl⁻)', 'יון כלוריד (Cl⁻)'), desc: B('Negative, concentrated outside. GABA-A receptors let Cl⁻ in, making the inside more negative (an inhibitory IPSP).', 'שלילי, מרוכז בחוץ. קולטני GABA-A מכניסים Cl⁻, וכך הפנים נעשה שלילי יותר (IPSP מעכב).'), chapters: [3, 4] },
  ca: { sym: 'Ca²⁺', color: '#f97316', r: 0.1, name: B('Calcium ion (Ca²⁺)', 'יון סידן (Ca²⁺)'), desc: B('Two positive charges, very low inside the cell. Its entry at the axon terminal triggers neurotransmitter release; through NMDA receptors it triggers learning (LTP).', 'שני מטענים חיוביים, ריכוז נמוך מאוד בתוך התא. כניסתו לטרמינל האקסון מפעילה שחרור מוליך עצבי; דרך קולטני NMDA הוא מפעיל למידה (LTP).'), chapters: [3, 4, 12] },
  mg: { sym: 'Mg²⁺', color: '#94a3b8', r: 0.072, name: B('Magnesium ion (Mg²⁺)', 'יון מגנזיום (Mg²⁺)'), desc: B('Plugs the NMDA receptor channel at rest. It only pops out when the membrane is already depolarized.', 'פוקק את תעלת קולטן ה-NMDA במנוחה. הוא יוצא רק כשהממברנה כבר עברה דה-פולריזציה.'), chapters: [12] },
  anion: { sym: 'A⁻', color: '#64748b', r: 0.3, name: B('Large negative proteins (A⁻)', 'חלבונים שליליים גדולים (A⁻)'), desc: B('Big negatively charged proteins trapped inside the neuron. They help keep the inside negative.', 'חלבונים גדולים בעלי מטען שלילי הכלואים בתוך הנוירון. הם עוזרים לשמור על פנים שלילי.'), chapters: [3] },
};

function definedIon(stage, id) { const d = ION[id]; stage.definePart({ id, name: d.name, desc: d.desc, color: d.color, chapters: d.chapters }); }

// ---------- Scene 1: the ions + a sodium atom becoming an ion ----------
function ionsScene(stage, { L }) {
  const order = ['na', 'k', 'cl', 'ca', 'mg'];
  // Scale: 1 Å = 0.6 units. Each ion is surrounded by its first shell of water molecules (hydration shell):
  // water's oxygen (slightly negative) faces cations; its hydrogens (slightly positive) face anions.
  const A = 0.6;
  const COORD = { na: 6, k: 7, cl: 6, ca: 7, mg: 6 }; // typical first-shell water numbers
  const waterShells = [], holders = {};
  const fib = (n, i) => { const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * 2.399963; return V(Math.cos(a) * r, y, Math.sin(a) * r); };
  order.forEach((id) => {
    definedIon(stage, id);
    const d = ION[id];
    const holder = new THREE.Group();
    const ion = sphere(d.r * 10 * A, d.color, { rough: 0.3 });
    holder.add(ion);
    const shell = new THREE.Group();
    const cation = id !== 'cl';
    const dist = (d.r * 10 + 1.4) * A; // ion radius + water radius (Å → units)
    for (let i = 0; i < COORD[id]; i++) {
      const dir = (COORD[id] === 6 ? [V(1, 0, 0), V(-1, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0, 0, 1), V(0, 0, -1)][i] : fib(COORD[id], i)).normalize();
      const w = new THREE.Group();
      const o = sphere(0.36 * A * 1.6, '#ef4444', { rough: 0.35 });
      w.add(o);
      // the two hydrogens, 104.5° apart, pointing away from (cation) or toward (anion) the ion
      const out = cation ? dir.clone() : dir.clone().negate();
      const perp = new THREE.Vector3().crossVectors(out, Math.abs(out.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0)).normalize();
      for (const sgn of [1, -1]) {
        const h = sphere(0.22 * A * 1.6, '#f1f5f9', { rough: 0.35 });
        h.position.copy(out.clone().multiplyScalar(Math.cos(0.912)).add(perp.clone().multiplyScalar(sgn * Math.sin(0.912))).multiplyScalar(0.96 * A));
        w.add(h);
      }
      w.position.copy(dir.multiplyScalar(dist));
      shell.add(w);
    }
    holder.add(shell);
    waterShells.push(shell);
    const t = textSprite(d.sym, { size: 0.5, color: '#1f2937' });
    t.position.y = -dist - 0.9;
    holder.add(t);
    holder.position.y = -1.6;
    const pm = textSprite(`${Math.round(d.r * 1000)} pm`, { size: 0.36, color: '#475569' }); pm.position.y = -dist - 1.45; pm.visible = false; holder.add(pm);
    holders[id] = { holder, pm, ion, sym: t };
    stage.add(holder, id);
  });
  stage.arrange(order, { cols: 5, gap: 0.5, center: V(0, -2.4, 0) });

  // Bohr model of sodium: 11 protons, shells 2 / 8 / 1
  stage.definePart({ id: 'nucleus', name: B('Sodium nucleus', 'גרעין הנתרן'), desc: B('11 protons (+) and 12 neutrons. The protons give the atom 11 positive charges.', '11 פרוטונים (+) ו-12 נויטרונים. הפרוטונים נותנים לאטום 11 מטענים חיוביים.'), color: '#ef4444', chapters: [3] });
  stage.definePart({ id: 'electrons', name: B('Electrons', 'אלקטרונים'), desc: B('11 negative electrons in shells of 2, 8 and 1. The lonely outer electron is easily lost — leaving Na⁺.', '11 אלקטרונים שליליים בקליפות של 2, 8 ו-1. האלקטרון הבודד בקליפה החיצונית הולך לאיבוד בקלות — וכך נוצר Na⁺.'), color: '#3b82f6', chapters: [3] });
  const atom = new THREE.Group();
  atom.position.set(0, 1.5, 0);
  stage.root.add(atom);
  const nuc = new THREE.Group();
  for (let i = 0; i < 23; i++) { const p = sphere(0.09, i < 11 ? '#ef4444' : '#cbd5e1'); p.position.set(rand(-0.15, 0.15), rand(-0.15, 0.15), rand(-0.15, 0.15)); nuc.add(p); }
  stage.add(nuc, 'nucleus', atom);
  const SHELLS = [[0.5, 2], [0.95, 8], [1.45, 1]];
  // electron "clouds": where each shell's electrons are likely to be found (a fuzzy sphere of dots)
  const clouds = SHELLS.map(([r, n], si) => {
    const N = 260 + n * 40, arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const dir = V(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize(); const rr = r * (0.82 + Math.random() * 0.36); arr.set([dir.x * rr, dir.y * rr, dir.z * rr], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color: ['#93c5fd', '#60a5fa', '#3b82f6'][si], size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
    p.visible = false;
    return p;
  });
  const shells = SHELLS;
  const electrons = [];
  shells.forEach(([r, n], si) => {
    const ring = torus(r, 0.008, '#94a3b8', { opacity: 0.5 });
    atom.add(ring);
    for (let k = 0; k < n; k++) {
      const e = sphere(0.06, '#3b82f6', { emissive: '#1d4ed8' });
      e.userData.orbit = { r, a: (k / n) * Math.PI * 2, speed: 1.6 / (si + 1) };
      stage.add(e, 'electrons', atom);
      electrons.push(e);
    }
  });
  clouds.forEach((c) => atom.add(c));
  const outer = electrons[electrons.length - 1];
  const chargeLbl = textSprite('Na', { size: 0.55, color: '#1f2937' });
  chargeLbl.position.set(1.9, 2.6, 0);
  stage.root.add(chargeLbl);
  let ionized = false, leave = 0;
  const setLabel = (txt) => {
    const nl = textSprite(txt, { size: 0.55, color: '#1f2937' });
    chargeLbl.material.map.dispose();
    chargeLbl.material.map = nl.material.map;
    chargeLbl.scale.copy(nl.scale);
  };
  stage.onUpdate((dt) => {
    for (const e of electrons) {
      const o = e.userData.orbit;
      if (e === outer && ionized) { leave += dt; e.position.x += dt * 2.2; e.position.y += dt * 0.6; e.visible = leave < 2.5; continue; }
      o.a += dt * o.speed;
      e.position.set(Math.cos(o.a) * o.r, Math.sin(o.a) * o.r, 0);
    }
    atom.rotation.y += dt * 0.15;
  });
  // (fixed 2026-11-15: it only highlighted the ions, so nothing seemed to happen) the bare ions, without their water,
  // line up from smallest to largest in the middle of the view, twice as big, each with its radius in picometres
  const saved = {};
  const compareSizes = (on) => {
    const sorted = [...order].sort((a, b) => ION[a].r - ION[b].r);
    let x = 0;
    const xs = sorted.map((id) => { const r = ION[id].r * 10 * A * 1.3; const c = x + r; x += 2 * r + 0.5; return c; });
    const mid = x / 2 - 0.25;
    sorted.forEach((id, k) => {
      const { holder, pm, ion, sym } = holders[id];
      const r = ION[id].r * 10 * A * 1.3;
      saved[id] ??= { p: holder.position.clone(), y: sym.position.y };
      if (on) { holder.position.set(xs[k] - mid, 0.6, 0); ion.scale.setScalar(1.3); sym.position.y = -r - 0.55; pm.position.y = -r - 1.05; }
      else { holder.position.copy(saved[id].p); ion.scale.setScalar(1); sym.position.y = saved[id].y; }
      pm.visible = on;
    });
    waterShells.forEach((sh) => { sh.visible = !on; });
    atom.visible = !on; chargeLbl.visible = !on;
  };
  return {
    home: { pos: V(0, 0, 10), target: V(0, 0.2, 0) },
    actions: [
      { icon: '⚡', label: B('Sodium loses an electron', 'הנתרן מאבד אלקטרון'), caption: B('Na has 11 protons and 11 electrons (neutral). Losing its single outer electron leaves 11+ and 10− → one extra positive charge: Na⁺. Ions are atoms with an unequal number of protons and electrons.', 'לנתרן 11 פרוטונים ו-11 אלקטרונים (ניטרלי). כשהוא מאבד את האלקטרון החיצוני הבודד נשארים 11+ ו-10− → מטען חיובי אחד עודף: Na⁺. יונים הם אטומים שמספר הפרוטונים והאלקטרונים בהם אינו שווה.'), run: () => { ionized = true; leave = 0; outer.visible = true; setLabel('Na⁺'); } },
      { icon: '↺', label: B('Make it neutral again', 'החזרה למצב ניטרלי'), run: () => { ionized = false; outer.visible = true; setLabel('Na'); } },
      { icon: '☁️', label: B('Electron clouds', 'ענני אלקטרונים'), toggle: true, caption: B('Electrons do not really circle like planets. Quantum physics says we can only know where they are LIKELY to be — a fuzzy cloud. The rings are a simplified picture.', 'אלקטרונים לא באמת מסתובבים כמו כוכבי לכת. פיזיקה קוונטית אומרת שאפשר לדעת רק היכן הם צפויים להיות — ענן מטושטש. הטבעות הן תמונה פשוטה.'), run: (on) => { clouds.forEach((c, i) => { c.visible = on && !(i === 2 && ionized); }); electrons.forEach((e) => { e.visible = !on && !(e === outer && ionized); }); atom.children.filter((c) => c.geometry?.type === 'TorusGeometry').forEach((r) => { r.visible = !on; }); } },
      { icon: '💧', label: B('Hide water shells', 'הסתרת מעטפות המים'), toggle: true, caption: B('In the body every ion is wrapped in water molecules. To pass through a channel it must shed this shell — the channel\'s pore is shaped to replace the water exactly, which is why a K⁺ channel lets K⁺ through but not Na⁺.', 'בגוף כל יון עטוף במולקולות מים. כדי לעבור בתעלה הוא חייב להשיל את המעטפת — הנקבובית של התעלה בנויה כך שתחליף בדיוק את המים, ולכן תעלת K⁺ מעבירה K⁺ אבל לא Na⁺.'), run: (on) => waterShells.forEach((sh) => { sh.visible = !on; }) },
      { icon: '📏', label: B('Compare ion sizes', 'השוואת גודל היונים'), toggle: true, caption: B('Sizes are drawn to scale (ionic radius: Mg²⁺ 72 pm … Cl⁻ 181 pm). Channels select ions by size and charge — a K⁺ channel lets K⁺ through but not the smaller Na⁺.', 'הגדלים בקנה מידה (רדיוס יוני: Mg²⁺ ‏72 פיקומטר … Cl⁻ ‏181 פיקומטר). תעלות בוחרות יונים לפי גודל ומטען — תעלת K⁺ מעבירה K⁺ אבל לא את ה-Na⁺ הקטן יותר.'), run: (on) => compareSizes(on) },
    ],
  };
}

// ---------- Scene 2: membrane potential ----------
function membraneScene(stage, { readout, L, say }) {
  const tl = timeline(stage);
  const W = 6.5, Dz = 2;
  // Bilayer: two sheets of phospholipid heads
  stage.definePart({ id: 'membrane', name: B('Cell membrane (lipid bilayer)', 'קרום התא (שכבה כפולה של שומנים)'), desc: B('Two layers of phospholipids. Ions cannot cross it on their own — only through channels and pumps.', 'שתי שכבות של פוספוליפידים. יונים לא יכולים לחצות אותו בעצמם — רק דרך תעלות ומשאבות.'), color: '#e8b4a0', chapters: [3] });
  // phospholipids (a head and two tails each), with room left for the proteins (src/visual/proteins.js)
  stage.add(bilayer({ w: 2 * W, d: 2 * Dz, front: 0.3, holes: [{ x: -3, r: 1.3 }, { x: 0, r: 1.3 }, { x: 3.05, z: -0.05, r: 1.15 }] }).group, 'membrane');

  // Channels and pump, drawn the textbook way: coiled helices round a pore
  const chan = (id, x, color, kind, name, desc) => {
    stage.definePart({ id, name, desc, color, chapters: [3] });
    const ch = ionChannel(stage, { kind, color });
    ch.g.position.x = x;
    stage.add(ch.g, id);
    return { ch, target: 0 };
  };
  const naCh = chan('naChannel', -3, '#d99a00', 'nav', B('Voltage-gated Na⁺ channel', 'תעלת Na⁺ תלוית מתח'), B('Opens when the membrane reaches threshold (about −65 mV), letting Na⁺ rush in.', 'נפתחת כשהממברנה מגיעה לסף (כ-‎−65 מ"ו), ומאפשרת ל-Na⁺ להיכנס בשטף.'));
  const kCh = chan('kChannel', 0, '#6d28d9', 'kv', B('Voltage-gated K⁺ channel', 'תעלת K⁺ תלוית מתח'), B('Opens a little later than the Na⁺ channel; K⁺ flows out and brings the inside back down (repolarization).', 'נפתחת מעט אחרי תעלת ה-Na⁺; K⁺ יוצא ומחזיר את הפנים למטה (רה-פולריזציה).'));
  stage.definePart({ id: 'pump', name: B('Sodium–potassium pump', 'משאבת נתרן–אשלגן'), desc: B('Uses energy (ATP) to push 3 Na⁺ out and bring 2 K⁺ in, keeping the concentration gradients ready for the next signal.', 'משתמשת באנרגיה (ATP) כדי להוציא 3 Na⁺ ולהכניס 2 K⁺, וכך שומרת על מפלי הריכוז מוכנים לאות הבא.'), color: '#0ea5e9', chapters: [3] });
  const pumpM = naKPump(stage, { a: '#0ea5e9' });
  pumpM.g.position.x = 3; pumpM.g.scale.setScalar(0.85);
  stage.add(pumpM.g, 'pump');
  let pumpPh = 0;

  // Side labels
  const out = textSprite(L('OUTSIDE', 'בחוץ'), { size: 0.4, color: '#475569' }); out.position.set(-W + 0.8, 2.9, 0); stage.root.add(out);
  const ins = textSprite(L('INSIDE the neuron', 'בתוך הנוירון'), { size: 0.4, color: '#475569' }); ins.position.set(-W + 1.6, -2.9, 0); stage.root.add(ins);

  // Ions
  const ions = [];
  const spawn = (kind, side, count) => {
    for (let i = 0; i < count; i++) {
      const d = ION[kind];
      const s = sphere(Math.max(0.1, d.r * 1.25), d.color, { rough: 0.35 });
      const y = side > 0 ? rand(0.9, 2.6) : rand(-2.6, -0.9);
      s.position.set(rand(-W + 0.3, W - 0.3), y, rand(-Dz + 0.2, Dz - 0.2));
      stage.add(s, kind);
      ions.push({ mesh: s, kind, side, path: null, vel: V(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.25) });
    }
  };
  ['na', 'k', 'cl', 'anion'].forEach((id) => definedIon(stage, id));
  spawn('na', 1, 26); spawn('na', -1, 4);
  spawn('k', 1, 4); spawn('k', -1, 26);
  spawn('cl', 1, 12); spawn('cl', -1, 3);
  spawn('anion', -1, 7);
  const count = (kind, side) => ions.filter((i) => i.kind === kind && i.side === side && !i.path).length;

  const transfer = (kind, num, toSide, x) => {
    const cand = ions.filter((i) => i.kind === kind && i.side === -toSide && !i.path)
      .sort((a, b) => Math.abs(a.mesh.position.x - x) - Math.abs(b.mesh.position.x - x)).slice(0, num);
    cand.forEach((ion, k) => {
      const dest = V(rand(-W + 0.3, W - 0.3), toSide > 0 ? rand(0.9, 2.6) : rand(-2.6, -0.9), rand(-Dz + 0.2, Dz - 0.2));
      ion.path = { pts: [V(x, -toSide * 1.1, 0), V(x, toSide * 1.1, 0), dest], i: 0, delay: k * 0.07 };
      ion.side = toSide;
    });
  };

  let Vm = -70, Vtarget = -70, relaxTo = -70;
  const trace = voltageTrace();
  stage.onUpdate((dt) => {
    for (const ion of ions) {
      const p = ion.mesh.position;
      if (ion.path) {
        if (ion.path.delay > 0) { ion.path.delay -= dt; continue; }
        const goal = ion.path.pts[ion.path.i];
        const d = goal.clone().sub(p);
        const sp = ion.path.i === 1 ? 5 : 3.2;
        if (d.length() < sp * dt) { p.copy(goal); if (++ion.path.i >= ion.path.pts.length) ion.path = null; }
        else p.add(d.normalize().multiplyScalar(sp * dt));
        continue;
      }
      ion.vel.add(V(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(dt * 1.2)).clampLength(0, 0.4);
      p.addScaledVector(ion.vel, dt);
      const ylo = ion.side > 0 ? 0.9 : -2.6, yhi = ion.side > 0 ? 2.6 : -0.9;
      if (p.y < ylo || p.y > yhi) { ion.vel.y *= -1; p.y = THREE.MathUtils.clamp(p.y, ylo, yhi); }
      if (Math.abs(p.x) > W - 0.2) { ion.vel.x *= -1; p.x = THREE.MathUtils.clamp(p.x, -W + 0.2, W - 0.2); }
      if (Math.abs(p.z) > Dz - 0.1) { ion.vel.z *= -1; p.z = THREE.MathUtils.clamp(p.z, -Dz + 0.1, Dz - 0.1); }
    }
    for (const c of [naCh, kCh]) c.ch.set(c.target > 0.5);
    if (pumping || pumpPh % 1 > 0.01) { pumpPh += dt * 1.4; pumpM.pose(pumpPh % 1); } // finishes its cycle, then rests
    Vm += (Vtarget - Vm) * Math.min(1, dt * 3);
    if (Math.abs(Vm - Vtarget) < 1 && Vtarget !== relaxTo) Vtarget += (relaxTo - Vtarget) * Math.min(1, dt * 0.8);
    trace.push(Vm, dt);
    const pct = ((Vm + 90) / 140) * 100;
    readout(`<b>${L('Membrane potential', 'פוטנציאל הממברנה')}: ${Math.round(Vm)} mV</b>
      <div class="vbar"><span style="width:${Math.max(0, Math.min(100, pct)).toFixed(0)}%;background:${Vm > -65 ? '#ef4444' : '#3b82f6'}"></span></div>${trace.svg()}
      <small>${L('Inside', 'בפנים')}: Na⁺ ${count('na', -1)} · K⁺ ${count('k', -1)} &nbsp; | &nbsp; ${L('Outside', 'בחוץ')}: Na⁺ ${count('na', 1)} · K⁺ ${count('k', 1)}</small>`);
  });

  let pumping = false, ttx = false;
  const openNa = () => {
    if (ttx) { naCh.target = 0; say(B('Tetrodotoxin (TTX) plugs the Na⁺ channels: no Na⁺ can enter, so there is no action potential.', 'טטרודוטוקסין (TTX) פוקק את תעלות ה-Na⁺: Na⁺ לא יכול להיכנס, ולכן אין פוטנציאל פעולה.')); return; } naCh.target = 1; transfer('na', 16, -1, -3); Vtarget = 40; relaxTo = 40; tl.later(1.4, () => { naCh.target = 0; }); };
  const openK = () => { kCh.target = 1; transfer('k', 16, 1, 0); Vtarget = -80; relaxTo = -70; tl.later(1.6, () => { kCh.target = 0; }); };
  const pumpCycle = () => {
    const extraNa = count('na', -1) - 4, missingK = 26 - count('k', -1);
    if (extraNa <= 0 && missingK <= 0) { pumping = false; say(B('Gradients restored: lots of Na⁺ outside, lots of K⁺ inside — ready to fire again.', 'מפלי הריכוז שוחזרו: הרבה Na⁺ בחוץ, הרבה K⁺ בפנים — מוכן לירות שוב.')); return; }
    if (extraNa > 0) transfer('na', Math.min(3, extraNa), 1, 3);
    if (missingK > 0) transfer('k', Math.min(2, missingK), -1, 3);
    tl.later(0.7, pumpCycle);
  };
  return {
    home: { pos: V(0, 1.2, 12), target: V(0, 0, 0) },
    actions: [
      { icon: '🟡', label: B('Open Na⁺ channels', 'פתיחת תעלות Na⁺'), caption: B('Na⁺ is pushed inward by two forces: its concentration gradient AND the negative inside attracting it. The inside swings to about +40 mV (depolarization).', 'שני כוחות דוחפים את ה-Na⁺ פנימה: מפל הריכוז והפנים השלילי שמושך אותו. הפנים קופץ לכ-‎+40 מ"ו (דה-פולריזציה).'), run: openNa },
      { icon: '🟣', label: B('Open K⁺ channels', 'פתיחת תעלות K⁺'), caption: B('K⁺ leaves the cell down its concentration gradient, so the inside becomes negative again — briefly even below rest (hyperpolarization, ≈ −80 mV).', 'K⁺ יוצא מהתא לפי מפל הריכוז שלו, והפנים נעשה שוב שלילי — לרגע אפילו מתחת למנוחה (היפר-פולריזציה, כ-‎−80 מ"ו).'), run: openK },
      { icon: '⚡', label: B('Fire an action potential', 'ירי פוטנציאל פעולה'), caption: B('An action potential = Na⁺ channels open (rise to +40 mV), then K⁺ channels open (fall back below −70 mV). It takes about 1–2 ms in a real neuron.', 'פוטנציאל פעולה = תעלות Na⁺ נפתחות (עלייה ל-‎+40 מ"ו), ואז תעלות K⁺ נפתחות (ירידה מתחת ל-‎−70 מ"ו). בנוירון אמיתי זה לוקח כ-1–2 מילישניות.'), run: () => { openNa(); tl.later(1.1, openK); } },
      { icon: '🐡', label: B('Block Na⁺ channels (TTX)', 'חסימת תעלות Na⁺ ‏(TTX)'), toggle: true, caption: B('Tetrodotoxin, the pufferfish poison, sits in the mouth of the Na⁺ channel and blocks it.', 'טטרודוטוקסין, רעל דג הנפוחית, יושב בפתח תעלת ה-Na⁺ וחוסם אותה.'), run: (on) => { ttx = on; naCh.ch.tint(on ? '#475569' : null); } },
      { icon: '🔄', label: B('Run the Na⁺/K⁺ pump', 'הפעלת משאבת Na⁺/K⁺'), caption: B('Each cycle: 3 Na⁺ out, 2 K⁺ in, using one ATP. Only a few ions cross in each spike, so the pump keeps up easily.', 'בכל מחזור: 3 Na⁺ החוצה, 2 K⁺ פנימה, תוך שימוש ב-ATP אחד. בכל ספייק עוברים רק מעט יונים, ולכן המשאבה עומדת בקצב בקלות.'), run: () => { if (!pumping) { pumping = true; pumpCycle(); } } },
    ],
  };
}

// ---------- Scene 3: NMDA receptor Mg²⁺ block ----------
function nmdaScene(stage, { readout, L }) {
  stage.definePart({ id: 'nmda', name: B('NMDA glutamate receptor', 'קולטן גלוטמט מסוג NMDA'), desc: B('A "coincidence detector": it opens only if glutamate is bound AND the membrane is already depolarized (which removes the Mg²⁺ plug). Its Ca²⁺ triggers long-term potentiation — a basis of learning.', '"גלאי צירופים": נפתח רק אם גלוטמט קשור וגם הממברנה כבר עברה דה-פולריזציה (מה שמסלק את פקק ה-Mg²⁺). הסידן שנכנס דרכו מפעיל חיזוק ארוך טווח (LTP) — בסיס ללמידה.'), color: '#3cb37a', chapters: [12] });
  stage.definePart({ id: 'membrane', name: B('Postsynaptic membrane', 'ממברנה פוסט-סינפטית'), desc: B('The membrane of the receiving neuron. When it is depolarized (e.g. by AMPA receptors), its inside becomes less negative.', 'הממברנה של הנוירון המקבל. כשהיא עוברת דה-פולריזציה (למשל על ידי קולטני AMPA), הפנים שלה פחות שלילי.'), color: '#e8b4a0', chapters: [3] });
  ['mg', 'ca', 'na'].forEach((id) => definedIon(stage, id));
  stage.definePart({ id: 'glutamate', name: B('Glutamate', 'גלוטמט'), desc: B('Released by the presynaptic neuron; binds to the NMDA receptor.', 'משתחרר מהנוירון הפרה-סינפטי; נקשר לקולטן ה-NMDA.'), color: '#ef4444', chapters: [4, 12] });

  const AMPA_AT = [[-2.6, 0.9], [2.6, -0.8], [-2.2, -1.4], [2.2, 1.3], [-3.6, 0.1], [3.6, 0.2], [-1.6, 1.8], [1.5, -1.9]];
  // phospholipids with room for the receptors (src/visual/proteins.js); the heads glow when depolarized
  const memb = bilayer({ w: 10, d: 5, holes: [{ x: 0, r: 1.15 }, ...AMPA_AT.map(([x, z]) => ({ x, z, r: 0.66 }))] });
  stage.add(memb.group, 'membrane');
  // drawn the textbook way: four subunits, each with membrane helices and two clam-shell domains on top. The lower
  // clam (ligand-binding domain) of the two GluN2 subunits closes on glutamate; GluN1 already holds glycine (white).
  const recM = iGluR();
  const rec = recM.g;
  stage.add(rec, 'nmda');
  const sites = [V(-0.9, 1.28, 0), V(0.9, 1.28, 0)];
  const glus = sites.map((s) => { const g = sphere(0.16, '#ef4444'); g.position.copy(s).add(V(0, 3, 0)); stage.add(g, 'glutamate'); return g; });
  let bound = 0, gate = 0;
  const mg = sphere(0.28, ION.mg.color, { rough: 0.3 });
  stage.add(mg, 'mg');
  const mgLbl = textSprite('Mg²⁺', { size: 0.35, color: '#1f2937' });
  stage.root.add(mgLbl);
  const pore = new THREE.CatmullRomCurve3([V(0, 3.2, 0), V(0, 1.2, 0), V(0, -0.6, 0), V(0.4, -2.6, 0.3)]);
  const caFlow = flow(stage, pore, { color: ION.ca.color, count: 14, size: 0.35, speed: 0.45 });
  const naFlow = flow(stage, pore, { color: ION.na.color, count: 10, size: 0.3, speed: 0.55 });
  caFlow.setActive(false); naFlow.setActive(false);
  const ins = textSprite(L('INSIDE', 'בפנים'), { size: 0.4, color: '#475569' }); ins.position.set(-4, -2, 0); stage.root.add(ins);

  stage.definePart({ id: 'ampa', name: B('AMPA receptors', 'קולטני AMPA'), desc: B('The everyday glutamate receptors: no Mg²⁺ plug, they open whenever glutamate binds. Calcium through NMDA makes the cell insert more of them, so the same input gives a bigger response: the synapse has learned (LTP).', 'קולטני הגלוטמט היומיומיים: אין להם פקק Mg²⁺, והם נפתחים בכל פעם שגלוטמט נקשר. הסידן שנכנס דרך NMDA גורם לתא להכניס עוד מהם, וכך אותו קלט נותן תגובה גדולה יותר: הסינפסה למדה (LTP).'), color: '#60a5fa', chapters: [12] });
  // AMPA receptors: the same four-subunit build, smaller and blue, with no Mg²⁺ plug and no glycine
  const ampas = AMPA_AT.map(([x, z], i) => { const m = iGluR({ c1: '#3b82f6', c2: '#7cb4fb', glycine: false }); const a = m.g; a.userData.m = m; a.scale.setScalar(0.62); a.rotation.y = i * 0.7; a.position.set(x, 0, z); a.visible = i < 2; stage.add(a, 'ampa'); return a; });
  // an AMPA slot with no receptor yet is filled with lipids, so the membrane has no empty holes (seen from above or below)
  const plugs = AMPA_AT.map(([x, z], i) => { const p = bilayer({ w: 1.4, d: 1.4, keep: (px, pz) => px * px + pz * pz < 0.6 * 0.6, seed: 11 + i }).group; p.position.set(x, 0, z); stage.add(p, 'membrane'); return p; });
  let nAmpa = 2, openFor = 0;
  let glu = false, depol = false, gT = 0, mgY = 0.3;
  stage.onUpdate((dt) => {
    gT = THREE.MathUtils.clamp(gT + (glu ? dt : -dt) * 1.2, 0, 1);
    glus.forEach((g, i) => { g.position.copy(sites[i]).add(V(0, 3 * (1 - gT), 0)); g.visible = gT > 0.01 || glu; });
    const targetY = depol ? 3.6 : 0.3;
    mgY += (targetY - mgY) * Math.min(1, dt * 2.5);
    // Mg²⁺ leaves up the middle of the pore, then out between two subunits (toward the viewer)
    const s = depol ? Math.max(0, mgY - 1.9) * 0.62 : 0;
    mg.position.set(s, mgY, s);
    mgLbl.position.copy(mg.position).add(V(0.55, 0.35, 0));
    memb.heads.material.emissive.set(depol ? '#f59e0b' : '#000000').multiplyScalar(depol ? 0.35 : 0);
    const open = gT > 0.95 && depol && mgY > 2.5;
    caFlow.setActive(open); naFlow.setActive(open);
    // the clam shells close on glutamate; the gate helices (M3) splay apart while the channel is open
    bound += ((gT > 0.95 ? 1 : 0) - bound) * Math.min(1, dt * 5);
    gate += ((open ? 1 : 0) - gate) * Math.min(1, dt * 5);
    recM.pose(bound, gate);
    // every 1.5 s of Ca²⁺ entry the cell inserts one more AMPA receptor (they pop up from below)
    if (open) { openFor += dt; if (openFor > 1.5 && nAmpa < ampas.length) { openFor = 0; nAmpa++; } }
    ampas.forEach((a, i) => { a.visible = i < nAmpa; plugs[i].visible = !a.visible; if (a.visible && a.position.y < 0) a.position.y = Math.min(0, a.position.y + dt * 2); if (!a.visible) a.position.y = -1.8; a.userData.m.pose(glu ? 1 : 0, glu ? 1 : 0); a.userData.m.mats.forEach((m) => m.emissive.set('#60a5fa').multiplyScalar(glu ? 0.5 : 0)); });
    const strength = `<br>${L('AMPA receptors at this synapse', 'קולטני AMPA בסינפסה')}: <b>${nAmpa}</b> → ${L('response to glutamate', 'תגובה לגלוטמט')} ×${(nAmpa / 2).toFixed(1)}`;
    readout((open ? `✅ <b>${L('Channel OPEN', 'התעלה פתוחה')}</b> — ${L('Ca²⁺ and Na⁺ flow in → LTP signal', 'Ca²⁺ ו-Na⁺ זורמים פנימה ← אות ל-LTP')}`
      : glu && !depol ? `🔒 ${L('Glutamate is bound, but Mg²⁺ still plugs the pore', 'גלוטמט קשור, אבל Mg²⁺ עדיין פוקק את התעלה')}`
      : depol && !glu ? `🔒 ${L('Mg²⁺ has left, but without glutamate the channel stays shut', 'ה-Mg²⁺ יצא, אבל בלי גלוטמט התעלה נשארת סגורה')}`
      : `🔒 ${L('Resting: no glutamate, Mg²⁺ in the pore', 'מנוחה: אין גלוטמט, Mg²⁺ בתוך התעלה')}`) + strength);
  });
  return {
    home: { pos: V(3.5, 2.5, 9), target: V(0, 0.6, 0) },
    actions: [
      { icon: '🔴', label: B('Release glutamate', 'שחרור גלוטמט'), toggle: true, caption: B('Glutamate binds — but on its own that is not enough while Mg²⁺ blocks the pore.', 'גלוטמט נקשר — אבל לבדו זה לא מספיק כל עוד Mg²⁺ חוסם את התעלה.'), run: (on) => { glu = on ?? !glu; } },
      { icon: '⚡', label: B('Depolarize the membrane', 'דה-פולריזציה של הממברנה'), toggle: true, caption: B('Strong input (many AMPA receptors at once) makes the inside less negative, which repels the positive Mg²⁺ out of the pore.', 'קלט חזק (קולטני AMPA רבים בבת אחת) הופך את הפנים לפחות שלילי, וזה דוחה את ה-Mg²⁺ החיובי מהתעלה.'), run: (on) => { depol = on ?? !depol; } },
      { icon: '📈', label: B('What learning changes', 'מה הלמידה משנה'), caption: B('Turn on both glutamate and depolarization and keep them on. Every moment of Ca²⁺ entry adds another AMPA receptor (blue). Afterwards the same glutamate opens more channels: a stronger synapse. This is long-term potentiation (LTP), a basis of memory.', 'הפעילו גם גלוטמט וגם דה-פולריזציה והשאירו אותם. כל רגע של כניסת סידן מוסיף קולטן AMPA (כחול). אחר כך אותו גלוטמט פותח יותר תעלות: סינפסה חזקה יותר. זה חיזוק ארוך טווח (LTP), בסיס לזיכרון.'), run: () => stage.focus(['ampa', 'nmda']) },
      { icon: '↺', label: B('Reset the synapse', 'איפוס הסינפסה'), run: () => { nAmpa = 2; openFor = 0; } },
    ],
  };
}

export default {
  id: 'atom',
  scenes: [
    { id: 'ions', icon: '⚛️', name: B('Atoms & ions', 'אטומים ויונים'), chapters: [3], intro: B('Neurons run on ions — atoms that gained or lost electrons. Watch sodium become Na⁺ and compare the important ions.', 'נוירונים פועלים בעזרת יונים — אטומים שקיבלו או איבדו אלקטרונים. צפו בנתרן הופך ל-Na⁺ והשוו את היונים החשובים.'), build: ionsScene },
    { id: 'membrane', icon: '🔋', name: B('Membrane potential', 'פוטנציאל הממברנה'), chapters: [3], intro: B('A patch of neuron membrane with ions on both sides. At rest the inside is about −70 mV. Open channels and watch the voltage change.', 'פיסת ממברנה של נוירון עם יונים משני הצדדים. במנוחה הפנים בכ-‎−70 מ"ו. פתחו תעלות וצפו במתח משתנה.'), build: membraneScene },
    { id: 'nmda', icon: '🧲', name: B('NMDA & the Mg²⁺ block', 'NMDA וחסימת ה-Mg²⁺'), chapters: [12], intro: B('Why does learning need two things at once? Try glutamate, depolarization, and both together.', 'למה למידה צריכה שני דברים בבת אחת? נסו גלוטמט, דה-פולריזציה, ושניהם יחד.'), build: nmdaScene },
  ],
};
