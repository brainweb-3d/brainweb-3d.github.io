// CELL level: the neuron, glia (overview + one place per kind), neuron types, the sensory cells, and a synapse "drug lab".
import * as THREE from 'three';
import { V, mat, sphere, tube, cyl, capsule, blob, dotTexture, flow, rand, textSprite, taperTube, spindle, slab, molecule, voltageTrace } from '../build.js';
import { neuronData, buildNeuron, loadModelGLB, fitModel } from '../data.js';
import { makeNeuron, dendriteTree, seeded } from '../neuron.js';
import { ionChannel, pentamer, transporter as transporterModel } from '../proteins.js';
import { vesicle as vesicleModel, mitochondrion, sheetGeo, meshOf, lumpGeo, rbcGeo, astrocyteModel, neuronModel, microgliaModel, myelinSegmentGeo } from '../cells.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries as mergeGeos } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const B = (en, he) => ({ en, he });
const glowSprite = (color, size) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size);
  return s;
};

// ---------------------------------------------------------------- scene 1: the neuron
function neuronScene(stage, { say, readout, L }) {
  const n = makeNeuron({ axonLength: 6.2 });
  stage.add(n.group);
  const P = (id, en, he, den, dhe, color, extra = {}) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3], ...extra });
  P('dendrites', 'Dendrites', 'דנדריטים', 'Branches that receive messages from other neurons at synapses. Their tiny bumps are dendritic spines.', 'שלוחות שמקבלות מסרים מנוירונים אחרים בסינפסות. הבליטות הזעירות עליהן הן קוצים דנדריטיים.', '#e7a094');
  P('spines', 'Dendritic spines', 'קוצים דנדריטיים', 'Tiny protrusions where most excitatory synapses form; they change shape with learning (LTP).', 'בליטות זעירות שבהן נוצרות רוב הסינפסות המעוררות; צורתן משתנה עם הלמידה (LTP).', '#f3b6a8', { chapters: [3, 12] });
  P('soma', 'Cell body (soma)', 'גוף התא (סומה)', 'Contains the nucleus and the machinery that makes proteins and energy; it adds up incoming signals.', 'מכיל את הגרעין ואת המנגנונים שמייצרים חלבונים ואנרגיה; מסכם את האותות הנכנסים.', '#e8a598', { link: { href: '#/explore/organelle', label: B('Zoom in: organelles inside', 'זום פנימה: האברונים שבפנים') } });
  P('nucleus', 'Nucleus', 'גרעין', 'Holds the DNA — the recipes for all the neuron\'s proteins.', 'מחזיק את ה-DNA — המתכונים לכל החלבונים של הנוירון.', '#7c5cbf', { link: { href: '#/explore/macromolecule/dna', label: B('Zoom in: DNA → protein', 'זום פנימה: DNA ← חלבון') } });
  P('hillock', 'Axon hillock', 'גבעת האקסון', 'Where the decision to fire is made: if the voltage here reaches threshold (−65 mV), an action potential starts.', 'כאן מתקבלת ההחלטה לירות: אם המתח כאן מגיע לסף (‎−65 מ"ו), מתחיל פוטנציאל פעולה.', '#e19083');
  P('axon', 'Axon', 'אקסון', 'The long fibre that carries the action potential away from the cell body.', 'הסיב הארוך שמוליך את פוטנציאל הפעולה הרחק מגוף התא.', '#e19083', { link: { href: '#/explore/atom', label: B('Zoom in: the ions that make the signal', 'זום פנימה: היונים שיוצרים את האות') } });
  P('myelin', 'Myelin sheath', 'מעטפת מיאלין', 'Fatty insulation made by glia (oligodendrocytes in the CNS). It makes signals jump between nodes — up to about 120 m/s.', 'בידוד שומני שמייצרות תאי גליה (אוליגודנדרוציטים במערכת המרכזית). הוא גורם לאות לקפוץ בין צמתים — עד כ-120 מ\'/שנ\'.', '#f4eee0');
  P('nodes', 'Nodes of Ranvier', 'צמתי רנבייה', 'Bare gaps between myelin segments, packed with Na⁺ channels; the action potential is regenerated here.', 'מרווחים חשופים בין מקטעי המיאלין, עמוסים בתעלות Na⁺; כאן פוטנציאל הפעולה נוצר מחדש.', '#ffd166');
  P('terminals', 'Axon terminals', 'כפתורי האקסון', 'Endings that release neurotransmitter onto the next cell at synapses.', 'קצוות שמשחררים מוליך עצבי אל התא הבא בסינפסות.', '#f08a7a', { link: { href: '#/explore/cell/synapse', label: B('Open the synapse', 'פתיחת הסינפסה') } });
  stage.tag(n.dendrites, 'dendrites'); stage.tag(n.spines, 'spines'); stage.tag(n.soma, 'soma');
  stage.tag(n.nucleus, 'nucleus'); stage.tag(n.nucleolus, 'nucleus'); stage.tag(n.hillock, 'hillock');
  stage.tag(n.axon, 'axon'); stage.tag(n.collateral, 'axon'); stage.tag(n.myelin, 'myelin'); stage.tag(n.nodes, 'nodes'); stage.tag(n.terminals, 'terminals');

  // ---- simulation state ----
  let V_m = -70, firing = null, refractory = 0, myelinOn = true;
  let ttx = false, inhib = false, seizure = false, seizureT = 0; // effects
  const pulse = glowSprite('#ffe066', 0.7);
  pulse.visible = false;
  stage.root.add(pulse);
  const epsps = [];
  const trace = voltageTrace(); // live graph of the hillock voltage: EPSPs climb, IPSPs dip, a spike shoots up
  let spikes = 0;
  const show = () => readout(`${L('Voltage at the axon hillock', 'מתח בגבעת האקסון')}: <b>${V_m.toFixed(0)} mV</b> ${V_m >= -65 ? '⚡' : ''} · ${L('spikes', 'ספייקים')}: <b>${spikes}</b>${trace.svg()}<small>${L('red dashes = threshold (−65 mV), grey = rest (−70 mV)', 'קו אדום = סף (‎−65 מ"ו), אפור = מנוחה (‎−70 מ"ו)')}</small><br>${L('Conduction', 'הולכה')}: ${myelinOn ? L('saltatory (myelinated) ≈ 120 m/s', 'מדלגת (עם מיאלין) ≈ 120 מ\'/שנ\'') : L('continuous (no myelin) ≈ 5 m/s', 'רציפה (בלי מיאלין) ≈ 5 מ\'/שנ\'')}`);
  const fire = () => {
    if (ttx) { V_m = -65; say(B('Threshold is reached, but tetrodotoxin (TTX) blocks the voltage-gated Na⁺ channels — no action potential can start.', 'הסף הושג, אבל טטרודוטוקסין (TTX) חוסם את תעלות ה-Na⁺ תלויות המתח — פוטנציאל פעולה לא יכול להתחיל.')); return; }
    if (firing || refractory > 0) return;
    firing = { t: 0, node: 0 };
    V_m = 40; spikes++;
    say(B('Threshold reached! Na⁺ rushes in at the hillock and the action potential travels down the axon. All-or-none: it never gets smaller.', 'הסף הושג! Na⁺ נכנס בגבעה ופוטנציאל הפעולה נע לאורך האקסון. הכול או לא כלום: הוא לא נחלש.'));
  };
  stage.onUpdate((dt) => {
    // EPSPs travelling from dendrite tips to the soma
    for (let i = epsps.length - 1; i >= 0; i--) {
      const e = epsps[i];
      e.t += dt * 0.9;
      e.sprite.visible = e.t > 0;
      e.sprite.position.copy(e.curve.getPointAt(Math.min(1, Math.max(0, e.t))));
      if (e.t >= 1) {
        stage.root.remove(e.sprite);
        epsps.splice(i, 1);
        if (e.ipsp) V_m -= 5; // an IPSP (GABA opens Cl⁻ channels) pushes the hillock away from threshold
        else V_m += inhib ? 0.5 : 2; // extra GABA inhibition (IPSPs) cancels most of each EPSP
        if (V_m >= -65) fire();
      }
    }
    if (seizure) { seizureT -= dt; if (seizureT <= 0) { seizureT = 0.5; sendEpsp(3); } }
    if (!firing) { V_m += (-70 - V_m) * Math.min(1, dt * 0.18); if (refractory > 0) refractory -= dt; }
    if (firing) {
      pulse.visible = true;
      if (myelinOn) {
        firing.t += dt * 2.2;
        const k = Math.min(n.nodeTs.length - 1, Math.floor(firing.t * 3));
        pulse.position.copy(n.axonCurve.getPointAt(k < 0 ? 0 : n.nodeTs[k]));
        pulse.scale.setScalar(0.7 + 0.3 * Math.sin(firing.t * 40));
        if (firing.t * 3 >= n.nodeTs.length + 1) firing = null;
      } else {
        firing.t += dt * 0.28;
        pulse.position.copy(n.axonCurve.getPointAt(Math.min(1, firing.t)));
        if (firing.t >= 1) firing = null;
      }
      if (!firing) { pulse.visible = false; V_m = -80; refractory = 0.6; }
    }
    // the trace shows the brief spike (+40 mV) even though the model keeps V_m there only for one moment
    trace.push(firing && firing.t < 0.25 ? 40 : V_m, dt);
    show();
  });
  show();
  const sendEpsp = (count, ipsp = false) => {
    for (let k = 0; k < count; k++) {
      // From a dendrite tip back to the cell body
      const curve = new THREE.CatmullRomCurve3([...n.dCurves[Math.floor(Math.random() * n.dCurves.length)].points].reverse().concat([V(0, 0, 0)]));
      const s = glowSprite(ipsp ? '#ff6b6b' : '#7ee0ff', 0.35);
      stage.root.add(s);
      epsps.push({ curve, t: -k * 0.25, sprite: s, ipsp });
    }
  };
  return {
    home: { pos: V(2.6, 1.6, 8.2), target: V(2.4, 0, 0) },
    actions: [
      { icon: '➕', label: B('Excitatory input (EPSPs)', 'קלט מעורר (EPSP)'), caption: B('Signals from other neurons arrive at the dendrites as small EPSPs. They add up in the cell body (summation). Press again until the hillock reaches −65 mV.', 'אותות מנוירונים אחרים מגיעים לדנדריטים כ-EPSP קטנים. הם מצטברים בגוף התא (סכימה). לחצו שוב עד שהגבעה מגיעה ל-‎−65 מ"ו.'), run: () => sendEpsp(2) },
      { icon: '➖', label: B('Inhibitory input (IPSPs)', 'קלט מעכב (IPSP)'), caption: B('Inhibitory synapses (mostly GABA) send IPSPs (red): each one pulls the hillock about 5 mV further from threshold. The neuron fires only if excitation beats inhibition — watch the graph.', 'סינפסות מעכבות (בעיקר GABA) שולחות IPSP (אדום): כל אחד מרחיק את הגבעה בכ-5 מ"ו מהסף. הנוירון יורה רק אם העירור גובר על העיכוב — הסתכלו בגרף.'), run: () => sendEpsp(2, true) },
      { icon: '⚡', label: B('Fire an action potential', 'ירי פוטנציאל פעולה'), run: () => { V_m = -65; fire(); } },
      { icon: '🧈', label: B('Remove myelin (as in MS)', 'הסרת מיאלין (כמו בטרשת נפוצה)'), toggle: true, run: (on) => {
        myelinOn = !on;
        n.myelin.visible = myelinOn;
        say(myelinOn ? B('Myelin is back: the signal jumps from node to node (saltatory conduction) — fast and energy-saving.', 'המיאלין חזר: האות קופץ מצומת לצומת (הולכה מדלגת) — מהר וחסכוני באנרגיה.')
          : B('Without myelin (as in multiple sclerosis) the signal must regenerate along every point of the axon — much slower, and it can fail.', 'בלי מיאלין (כמו בטרשת נפוצה) האות חייב להיווצר מחדש בכל נקודה לאורך האקסון — איטי הרבה יותר, ועלול להיכשל.'));
      } },
      { icon: '🐡', label: B('Block Na⁺ channels (TTX)', 'חסימת תעלות Na⁺ ‏(TTX)'), toggle: true, caption: B('Tetrodotoxin (pufferfish poison) blocks voltage-gated Na⁺ channels, so no action potentials can fire.', 'טטרודוטוקסין (רעל דג הנפוחית) חוסם תעלות Na⁺ תלויות מתח, ולכן לא נורים פוטנציאלי פעולה.'), run: (on) => { ttx = on; } },
      { icon: '🛑', label: B('Extra inhibition (GABA boost)', 'עיכוב נוסף (חיזוק GABA)'), toggle: true, caption: B('Alcohol and benzodiazepines strengthen GABA-A inhibition: each excitatory input moves the neuron much less, so it rarely reaches threshold.', 'אלכוהול ובנזודיאזפינים מחזקים את העיכוב של GABA-A: כל קלט מעורר מזיז את הנוירון הרבה פחות, ולכן הוא כמעט לא מגיע לסף.'), run: (on) => { inhib = on; } },
      { icon: '🌩️', label: B('Over-excitation (seizure)', 'עירור יתר (התקף)'), toggle: true, caption: B('In epilepsy, neurons are bombarded with excitation and fire again and again in bursts.', 'באפילפסיה נוירונים מופגזים בעירור ויורים שוב ושוב בפרצים.'), run: (on) => { seizure = on; seizureT = 0; } },
    ],
  };
}

// ---------------------------------------------------------------- scene 2: glia (owner, 2026-11-15: organised, and each
// kind has its own place to zoom into, with its own animations). The overview shows the four glia of the brain and
// spinal cord, each in its own corner with a label; Schwann cells (the body's nerves) live inside "A nerve, cut across".
/** A simple neuron (background cells in the glia scenes): drawn by cells.js (owner, 2026-11-15: better-looking models). */
function smallNeuron(color, rnd, size = 1) { return neuronModel(rnd, { size, color }); }
/** A star-shaped astrocyte: lumpy soma with nucleus and a bush of branching processes (cells.js). */
function astrocyteBody(rnd, scale = 1) { return astrocyteModel(rnd, { scale }); }
/** An axon with myelin segments and bare nodes between them; returns { group, nodes: [x…] }. */
function myelinatedAxon(x0, x1, y, z, { seg = 1.1, gap = 0.16, color = '#f4eee0', axonColor = '#e19083', r = 0.17 } = {}) {
  const group = new THREE.Group(), myelin = new THREE.Group(), nodes = [];
  group.add(tube([V(x0, y, z), V(x1, y, z)], 0.06, axonColor, undefined, 24));
  for (let x = x0 + 0.2; x + seg < x1; x += seg + gap) {
    const m = new THREE.Mesh(myelinSegmentGeo(seg, r), mat(color, { opacity: 0.88, rough: 0.3 })); m.rotation.z = Math.PI / 2; m.position.set(x + seg / 2, y, z); myelin.add(m);
    nodes.push(x + seg + gap / 2);
  }
  return { group, myelin, nodes };
}

function gliaScene(stage, { L }) {
  const rnd = seeded(11);
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3] });
  D('astrocyte', 'Astrocyte', 'אסטרוציט', 'Star-shaped glia: feeds neurons, controls the chemical environment, helps form the blood–brain barrier and cleans up neurotransmitters.', 'גליה בצורת כוכב: מזינה נוירונים, שולטת בסביבה הכימית, עוזרת ליצור את מחסום הדם-מוח ומפנה מוליכים עצביים.', '#62b6cb');
  D('oligo', 'Oligodendrocyte', 'אוליגודנדרוציט', 'Makes myelin in the brain and spinal cord; one cell wraps segments of several axons.', 'מייצר מיאלין במוח ובחוט השדרה; תא אחד עוטף מקטעים של כמה אקסונים.', '#a78bfa');
  D('microglia', 'Microglia', 'מיקרוגליה', 'The brain\'s immune cells: they patrol with moving branches, move to injuries and swallow debris and dead cells.', 'תאי מערכת החיסון של המוח: הם מסיירים בעזרת שלוחות נעות, נעים לאזורי פגיעה ובולעים פסולת ותאים מתים.', '#3cb37a');
  D('ependymal', 'Ependymal cells', 'תאי אפנדימה', 'A lining of cells around the brain\'s fluid-filled ventricles. Their beating cilia keep the cerebrospinal fluid moving.', 'שכבת תאים שמרפדת את חדרי המוח המלאים בנוזל. הריסים המכים שלהם מניעים את נוזל המוח והשדרה.', '#f59e0b');
  D('capillary', 'Capillary (blood vessel)', 'נימה (כלי דם)', 'A tiny blood vessel. Astrocyte endfeet wrap it.', 'כלי דם זעיר. רגלי האסטרוציטים עוטפות אותו.', '#d94b4b');
  D('neurons', 'Neurons', 'נוירונים', 'The cells the glia look after.', 'התאים שהגליה דואגת להם.', '#e8a598');
  // four corners: astrocyte (top left, by a capillary), oligodendrocyte (top right, on axons),
  // microglia (bottom left, among neurons), ependymal cells (bottom right, lining a ventricle)
  const A = V(-3.4, 1.9, 0), O = V(3.4, 1.9, 0), M = V(-3.4, -2.2, 0), E = V(3.4, -2.4, 0);
  stage.add(tube([V(-6, 0.4, -0.4), V(-4.9, 1.2, -0.3), V(-4.7, 3.6, -0.3)], 0.3, '#d94b4b', { opacity: 0.85 }), 'capillary');
  const astro = astrocyteBody(rnd, 0.9); astro.position.copy(A); stage.add(astro, 'astrocyte');
  for (const y of [0.9, 2.6]) { const foot = sphere(0.2, '#62b6cb'); foot.scale.set(0.6, 1.2, 1.2); foot.position.set(-4.75, y, -0.15); stage.add(foot, 'astrocyte'); stage.add(tube([A, V(-4.1, y, -0.1), V(-4.7, y, -0.15)], 0.07, '#62b6cb', undefined, 12), 'astrocyte'); }
  const n1 = smallNeuron('#e8a598', rnd, 0.8); n1.position.set(-1.6, 2.6, -0.3); stage.add(n1, 'neurons');
  // oligodendrocyte: one cell, three axons
  const oligo = new THREE.Group(); oligo.add(new THREE.Mesh(lumpGeo(V(), 0.32, { seed: 9, amp: 0.15 }), mat('#a78bfa', { rough: 0.5 })), new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 9).translate(0, 0, 0.18), mat('#5b21b6'))); oligo.position.copy(O).add(V(0, 0.9, 0)); stage.add(oligo, 'oligo');
  for (let k = 0; k < 3; k++) {
    const y = O.y - 0.4 + k * 0.5, z = -0.5 + k * 0.5;
    stage.add(tube([V(1.2, y, z), V(5.8, y, z)], 0.06, '#e19083', undefined, 24), 'neurons');
    const seg = new THREE.Mesh(myelinSegmentGeo(1.0, 0.16), mat('#d9cdf7', { rough: 0.3 })); seg.rotation.z = Math.PI / 2; seg.position.set(O.x + (k - 1) * 0.6, y, z); stage.add(seg, 'oligo');
    stage.add(tube([O.clone().add(V(0, 0.9, 0)), V(O.x + (k - 1) * 0.35, (y + O.y + 0.9) / 2, z * 0.6), V(O.x + (k - 1) * 0.6, y + 0.14, z)], 0.045, '#a78bfa', undefined, 12), 'oligo');
  }
  // microglia among neurons
  for (const p of [V(-5, -1.4, -0.4), V(-1.8, -3.2, -0.3)]) { const n = smallNeuron('#e8a598', rnd, 0.7); n.position.copy(p); stage.add(n, 'neurons'); }
  const micro = microgliaModel(rnd, { scale: 0.75 }).g;
  micro.position.copy(M); stage.add(micro, 'microglia');
  // ependymal cells: a row of cube-like cells with cilia, the ventricle (fluid) above them
  const ep = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const x = E.x - 1.8 + i * 0.6;
    const c = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.6, 0.8, 2, 0.1), mat('#f59e0b', { rough: 0.5 })); c.position.set(x, E.y, 0); ep.add(c); const nu = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8).scale(1, 0.8, 1), mat('#92400e')); nu.position.set(x, E.y - 0.12, 0.38); ep.add(nu);
    for (let k = 0; k < 4; k++) ep.add(tube([V(x - 0.12 + k * 0.08, E.y + 0.3, 0.1), V(x - 0.1 + k * 0.08 + 0.05, E.y + 0.55, 0.1), V(x - 0.05 + k * 0.08 + 0.12, E.y + 0.72, 0.1)], 0.012, '#fde68a', undefined, 8));
  }
  stage.add(ep, 'ependymal');
  const csf = slab(4.6, 0.9, 1, '#bfdbfe', 0.25); csf.position.set(E.x, E.y + 1.05, 0); stage.add(csf);
  for (const [p, en, he] of [[A.clone().add(V(0, -1.9, 0)), 'Astrocyte', 'אסטרוציט'], [O.clone().add(V(0, -1.4, 0)), 'Oligodendrocyte', 'אוליגודנדרוציט'], [M.clone().add(V(0, -1.4, 0)), 'Microglia', 'מיקרוגליה'], [E.clone().add(V(0, -0.8, 0)), 'Ependymal cells', 'תאי אפנדימה']]) {
    const t = textSprite(L(en, he), { size: 0.36 }); t.position.copy(p); stage.add(t);
  }
  const vent = textSprite(L('ventricle (fluid)', 'חדר (נוזל)'), { size: 0.28 }); vent.position.set(E.x, E.y + 1.1, 0.6); stage.add(vent);
  const nutrients = flow(stage, new THREE.CatmullRomCurve3([V(-4.75, 0.9, -0.15), V(-4.1, 1.4, 0), A, V(-2.4, 2.3, -0.1), V(-1.6, 2.6, -0.3)]), { color: '#ffd166', count: 12, speed: 0.3, size: 0.14 });
  nutrients.setActive(false);
  let micT = 0;
  stage.onUpdate((dt) => { micT += dt; micro.rotation.z = Math.sin(micT * 0.8) * 0.15; ep.children.forEach((c, i) => { if (c.geometry?.type === 'TubeGeometry') c.rotation.z = Math.sin(micT * 6 + i) * 0.05; }); });
  return {
    home: { pos: V(0, 0, 13), target: V(0, -0.1, 0) },
    actions: [
      { icon: '🍞', label: B('Feed the neurons', 'הזנת הנוירונים'), toggle: true, caption: B('Glucose and oxygen pass from the blood through astrocyte endfeet toward neurons.', 'גלוקוז וחמצן עוברים מהדם דרך רגלי האסטרוציט אל הנוירונים.'), run: (on) => { nutrients.setActive(on); stage.focus(on ? ['astrocyte', 'capillary', 'neurons'] : []); } },
    ],
  };
}

// ---- Astrocyte up close: the tripartite synapse and the endfeet on a capillary
function astrocyteScene(stage, { L, readout }) {
  const rnd = seeded(5);
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3] });
  D('astro', 'Astrocyte', 'אסטרוציט', 'One astrocyte touches up to two million synapses (in humans) and several blood vessels. It links the two: it takes up what neurons release and hands them fuel from the blood.', 'אסטרוציט אחד נוגע בעד שני מיליון סינפסות (באדם) ובכמה כלי דם. הוא מקשר בין השניים: קולט את מה שהנוירונים משחררים ומעביר להם דלק מהדם.', '#62b6cb');
  D('endfeet', 'Endfeet on the capillary', 'רגליות על הנימה', 'Flattened ends of the astrocyte\'s processes that wrap almost the whole capillary. They help keep the blood–brain barrier tight and take up glucose.', 'קצוות שטוחים של שלוחות האסטרוציט שעוטפים כמעט את כל הנימה. הם עוזרים לשמור על מחסום הדם-מוח הדוק וקולטים גלוקוז.', '#38a3bd');
  D('vessel', 'Capillary', 'נימה', 'A brain capillary with red blood cells.', 'נימה במוח עם תאי דם אדומים.', '#d94b4b');
  D('synapse', 'A synapse (two neurons)', 'סינפסה (שני נוירונים)', 'An axon terminal (top) and a dendrite (bottom). An astrocyte process wraps them: the "tripartite synapse".', 'כפתור אקסון (למעלה) ודנדריט (למטה). שלוחה של אסטרוציט עוטפת אותם: "הסינפסה המשולשת".', '#e8a598');
  const astro = astrocyteBody(rnd, 1.2); stage.add(astro, 'astro');
  // capillary on the left with red cells; endfeet wrapping it
  const vessel = new THREE.Group();
  vessel.add(cyl(0.55, 0.55, 6, '#d94b4b', { opacity: 0.4 }), cyl(0.45, 0.45, 6, '#fca5a5', { opacity: 0.25, side: THREE.BackSide }));
  for (const [y, a] of [[-1.8, 0.4], [0.6, 2.6], [2.2, 4.2]]) { const nu = new THREE.Mesh(lumpGeo(V(), 0.16, { seed: y * 3, amp: 0.1, stretch: [0.6, 1.8, 1] }), mat('#7f1d1d')); nu.position.set(Math.cos(a) * 0.5, y, Math.sin(a) * 0.5); vessel.add(nu); } // endothelial nuclei
  for (let i = 0; i < 6; i++) { const rbc = new THREE.Mesh(rbcGeo(0.24), mat('#b91c1c', { rough: 0.4 })); rbc.position.set((rnd() - 0.5) * 0.4, -2.5 + i * 1, (rnd() - 0.5) * 0.3); rbc.rotation.set(rnd() * 3, rnd() * 3, 0); vessel.add(rbc); }
  vessel.position.set(-3.6, 0, -0.2); stage.add(vessel, 'vessel');
  const feet = new THREE.Group();
  for (const y of [-1.6, -0.3, 1.0, 2.2]) {
    feet.add(taperTube([V(0, 0, 0), V(-1.5, y * 0.6, 0), V(-2.95, y, -0.1)], 0.1, (t) => 1 - t * 0.4, '#62b6cb', undefined, 16, 8));
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 24, 3, true, -Math.PI * 0.6, Math.PI * 1.2), mat('#38a3bd', { opacity: 0.85, side: THREE.DoubleSide, rough: 0.4 })); { const fp = f.geometry.attributes.position; for (let k = 0; k < fp.count; k++) { const yy = fp.getY(k), sc = 1 + 0.06 * Math.sin(fp.getX(k) * 9 + yy * 7); fp.setXYZ(k, fp.getX(k) * sc, yy * (1 - 0.15 * Math.abs(Math.sin(fp.getZ(k) * 4))), fp.getZ(k) * sc); } f.geometry.computeVertexNormals(); } f.position.set(-3.6, y, -0.2); f.rotation.y = Math.PI; feet.add(f);
  }
  stage.add(feet, 'endfeet');
  // the synapse on the right, wrapped by a process
  const S = V(3.2, 0.4, 0);
  const syn = new THREE.Group();
  syn.add(tube([S.clone().add(V(0.6, 2.4, 0)), S.clone().add(V(0.1, 1.2, 0)), S.clone().add(V(0, 0.55, 0))], 0.08, '#e19083'));
  const pre = sphere(0.42, '#e8a598'); pre.scale.set(1, 0.8, 1); pre.position.copy(S).add(V(0, 0.35, 0)); syn.add(pre);
  const post = sphere(0.4, '#f3b6a8'); post.scale.set(1.1, 0.7, 1); post.position.copy(S).add(V(0, -0.4, 0)); syn.add(post);
  pre.material.transparent = true; pre.material.opacity = 0.55; pre.material.depthWrite = false;
  syn.add(meshOf([[-0.18, 0.4, 0.1], [0.05, 0.48, -0.1], [0.2, 0.36, 0.12], [-0.05, 0.25, 0.2], [0.15, 0.2, -0.15], [-0.2, 0.22, -0.12]].map(([x, y, z]) => new THREE.SphereGeometry(0.075, 10, 8).translate(S.x + x, S.y + y, S.z + z)), mat('#f9a8d4')));
  const psd = cyl(0.3, 0.3, 0.05, '#7f1d1d', { opacity: 0.8 }); psd.position.copy(S).add(V(0, -0.14, 0)); syn.add(psd);
  syn.add(tube([S.clone().add(V(0, -0.6, 0)), S.clone().add(V(0.4, -1.6, 0)), S.clone().add(V(1.2, -2.6, 0))], 0.1, '#f3b6a8'));
  stage.add(syn, 'synapse');
  const wrap = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 16, 0, Math.PI * 2, Math.PI * 0.25, Math.PI * 0.5), mat('#62b6cb', { opacity: 0.4, side: THREE.DoubleSide })); wrap.position.copy(S); stage.add(wrap, 'astro');
  stage.add(taperTube([V(0, 0, 0), V(1.4, 0.4, 0.1), S.clone().add(V(-0.7, 0, 0))], 0.1, (t) => 1 - t * 0.4, '#62b6cb', undefined, 16, 8), 'astro');
  const glucose = flow(stage, new THREE.CatmullRomCurve3([V(-3.6, 1.0, -0.2), V(-2.9, 1.0, -0.1), V(-1.5, 0.6, 0), V(0, 0, 0), V(1.4, 0.4, 0.1), S.clone().add(V(-0.3, 0.3, 0)), S.clone().add(V(0, 0.35, 0))]), { color: '#ffd166', count: 14, speed: 0.25, size: 0.18 });
  const gluRelease = flow(stage, new THREE.CatmullRomCurve3([S.clone().add(V(0, 0.05, 0.1)), S.clone().add(V(-0.3, 0, 0.3)), S.clone().add(V(-0.75, 0.05, 0.2)), S.clone().add(V(-1.4, 0.4, 0.1)), V(0.2, 0.1, 0)]), { color: '#f472b6', count: 12, speed: 0.35, size: 0.16 });
  const gln = flow(stage, new THREE.CatmullRomCurve3([V(0.2, -0.2, 0.2), V(1.4, 0.1, 0.25), S.clone().add(V(-0.6, 0.2, 0.25)), S.clone().add(V(0, 0.35, 0.2))]), { color: '#a3e635', count: 8, speed: 0.3, size: 0.14 });
  [glucose, gluRelease, gln].forEach((f) => f.setActive(false));
  // calcium wave: a glow that travels out along the processes
  let wave = -1;
  stage.onUpdate((dt) => {
    if (wave < 0) return;
    wave += dt * 0.6;
    const k = Math.max(0, Math.sin(Math.min(Math.PI, wave * Math.PI)));
    astro.traverse((o) => { if (o.isMesh && o.material.emissive) o.material.emissive.set('#a5f3fc').multiplyScalar(k * 0.6); });
    if (wave >= 1) { wave = -1; astro.traverse((o) => { if (o.isMesh && o.material.emissive) o.material.emissive.set('#000000'); }); }
  });
  const only = (on, ...fs) => { [glucose, gluRelease, gln].forEach((f) => f.setActive(false)); if (on) fs.forEach((f) => f.setActive(true)); };
  return {
    home: { pos: V(0, 0.2, 11), target: V(0, 0.2, 0) },
    actions: [
      { icon: '🍞', label: B('Feed the neuron', 'הזנת הנוירון'), toggle: true, caption: B('Endfeet take glucose from the blood; the astrocyte turns some into lactate and hands it to the busy neuron as fuel.', 'הרגליות קולטות גלוקוז מהדם; האסטרוציט הופך חלק ממנו ללקטט ומעביר אותו לנוירון העסוק כדלק.'), run: (on) => { only(on, glucose); stage.focus(on ? ['astro', 'endfeet', 'vessel', 'synapse'] : []); } },
      { icon: '🧹', label: B('Clear away glutamate', 'פינוי גלוטמט'), toggle: true, caption: B('After the synapse fires, the astrocyte pumps the glutamate (pink) out of the gap, turns it into glutamine (green) and sends it back to the neuron to be reused. Too much glutamate left in the gap would over-excite and kill neurons.', 'אחרי שהסינפסה יורה, האסטרוציט שואב את הגלוטמט (ורוד) מהמרווח, הופך אותו לגלוטמין (ירוק) ושולח אותו חזרה לנוירון לשימוש חוזר. יותר מדי גלוטמט שנשאר במרווח היה מעורר יתר על המידה והורג נוירונים.'), run: (on) => { only(on, gluRelease, gln); stage.focus(on ? ['astro', 'synapse'] : []); } },
      { icon: '⚡', label: B('Calcium wave', 'גל סידן'), caption: B('Astrocytes don\'t fire action potentials, but they do signal: a rise of Ca²⁺ spreads through the cell (and to its neighbours) and makes it release its own messengers.', 'אסטרוציטים לא יורים פוטנציאלי פעולה, אבל הם כן מאותתים: עלייה של Ca²⁺ מתפשטת בתא (ולשכניו) וגורמת לו לשחרר שליחים משלו.'), run: () => { wave = 0; readout(L('Ca²⁺ wave spreading through the astrocyte…', 'גל Ca²⁺ מתפשט באסטרוציט…')); } },
    ],
  };
}

// ---- Oligodendrocyte: one cell myelinates several axons; with and without myelin
function oligoScene(stage, { L, readout }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3] });
  D('oligo', 'Oligodendrocyte', 'אוליגודנדרוציט', 'Its cell body sends out a few flat processes; each one wraps around a stretch of a different axon many times, making a myelin segment.', 'גוף התא שולח כמה שלוחות שטוחות; כל אחת נכרכת פעמים רבות סביב קטע של אקסון אחר, ויוצרת מקטע מיאלין.', '#a78bfa');
  D('myelin', 'Myelin', 'מיאלין', 'Up to 100 tight layers of fatty membrane: an insulator. The signal can only be renewed at the gaps between segments.', 'עד 100 שכבות הדוקות של ממברנה שומנית: מבודד. האות יכול להתחדש רק ברווחים בין המקטעים.', '#ede9fe');
  D('axon', 'Axons', 'אקסונים', 'Top: a myelinated axon. Bottom: a thin unmyelinated one, for comparison.', 'למעלה: אקסון עם מיאלין. למטה: אקסון דק בלי מיאלין, להשוואה.', '#e19083');
  D('nodes', 'Nodes of Ranvier', 'צמתי רנבייה', 'Bare gaps packed with Na⁺ channels. The action potential jumps from node to node.', 'רווחים חשופים מלאים בתעלות Na⁺. פוטנציאל הפעולה קופץ מצומת לצומת.', '#ffd166');
  const top = myelinatedAxon(-5.5, 5.5, 0.6, 0, { color: '#ede9fe' });
  stage.add(top.group, 'axon'); stage.add(top.myelin, 'myelin');
  for (const x of top.nodes) { const n = cyl(0.075, 0.075, 0.12, '#ffd166'); n.rotation.z = Math.PI / 2; n.position.set(x, 0.6, 0); stage.add(n, 'nodes'); }
  const second = myelinatedAxon(-5.5, 5.5, 2.4, -0.8, { color: '#ede9fe' }); stage.add(second.group, 'axon'); stage.add(second.myelin, 'myelin');
  const bare = tube([V(-5.5, -1.6, 0.3), V(5.5, -1.6, 0.3)], 0.045, '#e19083', undefined, 24); stage.add(bare, 'axon');
  // the oligodendrocyte above, with processes down to one segment on each axon
  const cell = new THREE.Group(); cell.add(new THREE.Mesh(lumpGeo(V(), 0.45, { seed: 9, amp: 0.16, stretch: [1.1, 0.95, 0.9] }), mat('#a78bfa', { rough: 0.5 }))); const nuc = new THREE.Mesh(lumpGeo(V(0.05, 0.02, 0.28), 0.2, { seed: 3, amp: 0.08 }), mat('#5b21b6')); cell.add(nuc);
  for (const d of [V(-1.4, 0.6, -1.2), V(1.6, 0.4, -1.4), V(-0.6, 1.3, -0.9), V(1.0, -0.6, -1.8)]) cell.add(taperTube([V(), d.clone().multiplyScalar(0.5).add(V(0.1, 0.1, 0)), d], 0.07, (t) => 1 - t * 0.55, '#a78bfa', undefined, 12, 6)); // processes to other axons, out of view
  cell.position.set(0.3, 4.1, -0.4); stage.add(cell, 'oligo');
  const seg1 = top.myelin.children[Math.floor(top.myelin.children.length / 2)], seg2 = second.myelin.children[Math.floor(second.myelin.children.length / 2) - 1];
  for (const s of [seg1, seg2]) stage.add(taperTube([cell.position.clone(), cell.position.clone().lerp(s.position, 0.5).add(V(0.3, 0, 0.2)), s.position.clone().add(V(0, 0.15, 0))], 0.08, (t) => 1 - t * 0.5, '#a78bfa', undefined, 16, 8), 'oligo');
  for (const lb of [[V(-6.3, 0.6, 0), L('myelinated', 'עם מיאלין')], [V(-6.3, -1.6, 0), L('no myelin', 'בלי מיאלין')]]) { const t = textSprite(lb[1], { size: 0.3 }); t.position.copy(lb[0]); stage.add(t); }
  const pulse = glowSprite('#ffe066', 0.7), slow = glowSprite('#ffe066', 0.6);
  pulse.visible = slow.visible = false; stage.root.add(pulse, slow);
  let race = null, ms = false;
  stage.onUpdate((dt) => {
    if (!race) return;
    race.t += dt;
    const nodesX = [-5.5, ...top.nodes, 5.5];
    if (ms) { // demyelinated: slow and the signal fades out halfway
      const x = -5.5 + race.t * 1.2; pulse.position.set(x, 0.6, 0); pulse.material.opacity = Math.max(0, 1 - Math.max(0, x) / 2.5); pulse.visible = x < 5.5;
    } else { const k = Math.min(nodesX.length - 1, Math.floor(race.t * 6)); pulse.position.set(nodesX[k], 0.6, 0); pulse.material.opacity = 1; pulse.visible = race.t * 6 < nodesX.length + 1; }
    const xs = -5.5 + race.t * 1.0; slow.position.set(xs, -1.6, 0.3); slow.visible = xs < 5.5;
    readout(`${L('Myelinated axon', 'אקסון עם מיאלין')}: ${ms ? L('demyelinated: slow, fails', 'ללא מיאלין: איטי, נכשל') : '≈ 100 m/s'} · ${L('unmyelinated', 'בלי מיאלין')}: ≈ 1 m/s`);
    if (race.t > 12) race = null;
  });
  return {
    home: { pos: V(0, 1.2, 12), target: V(0, 1, 0) },
    actions: [
      { icon: '🏁', label: B('Race the two axons', 'מרוץ בין שני האקסונים'), caption: B('The same action potential on both: on the myelinated axon it jumps from node to node (saltatory conduction) and arrives long before the one creeping along the bare axon.', 'אותו פוטנציאל פעולה בשניהם: באקסון עם המיאלין הוא קופץ מצומת לצומת (הולכה מדלגת) ומגיע הרבה לפני זה שזוחל לאורך האקסון החשוף.'), run: () => { race = { t: 0 }; stage.focus(['axon', 'nodes']); } },
      { icon: '🧈', label: B('Multiple sclerosis', 'טרשת נפוצה'), toggle: true, caption: B('In MS the immune system strips myelin from axons in the brain and spinal cord. The signal leaks out between the bare segments: it slows down and can fail.', 'בטרשת נפוצה מערכת החיסון מקלפת את המיאלין מאקסונים במוח ובחוט השדרה. האות דולף בין המקטעים החשופים: הוא מאט ועלול להיכשל.'), run: (on) => { ms = on; top.myelin.children.forEach((m, i) => { m.visible = !on || i % 3 === 0; }); race = { t: 0 }; } },
    ],
  };
}

// ---- Microglia: patrolling, then reacting to an injury
function microgliaScene(stage, { L, readout }) {
  const rnd = seeded(23);
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3] });
  D('micro', 'Microglia', 'מיקרוגליה', 'Resting microglia are anything but resting: their thin branches move all the time, checking every synapse around them a few times an hour.', 'מיקרוגליה "במנוחה" אינה נחה כלל: השלוחות הדקות שלה זזות כל הזמן ובודקות כל סינפסה סביבה כמה פעמים בשעה.', '#3cb37a');
  D('cells', 'Neurons', 'נוירונים', 'Healthy neurons around the microglia.', 'נוירונים בריאים סביב המיקרוגליה.', '#e8a598');
  D('debris', 'Damaged cell', 'תא פגוע', 'A dying neuron releases "eat me" signals (like ATP); microglia sense them and come.', 'נוירון גוסס משחרר אותות "תאכלו אותי" (כמו ATP); המיקרוגליה חשה אותם ומגיעה.', '#6b4f3a');
  for (const p of [V(-3, 1.8, -0.5), V(3.2, 2, -0.6), V(-2.6, -2, -0.4), V(0.4, -2.6, -0.8)]) { const n = smallNeuron('#e8a598', rnd, 1); n.position.copy(p); stage.add(n, 'cells'); }
  const { g: micro, body, arms } = microgliaModel(rnd, { n: 11, scale: 1.25 });
  stage.add(micro, 'micro');
  const debris = new THREE.Mesh(mergeGeos([lumpGeo(V(), 0.4, { seed: 7, amp: 0.35 }), lumpGeo(V(0.35, 0.2, 0.1), 0.18, { seed: 3, amp: 0.3 }), lumpGeo(V(-0.3, -0.25, 0), 0.15, { seed: 9, amp: 0.3 })]), mat('#6b4f3a', { rough: 0.7 })); debris.position.set(3, -1.2, 0.3); debris.visible = false; stage.add(debris, 'debris');
  const atp = flow(stage, new THREE.CatmullRomCurve3([V(3, -1.2, 0.3), V(1.5, -0.6, 0.3), V(0, 0, 0.3)]), { color: '#fde047', count: 10, size: 0.16, speed: 0.4 }); atp.setActive(false);
  let state = 'patrol', t = 0;
  const home = V(0, 0, 0);
  stage.onUpdate((dt) => {
    t += dt;
    const retract = state === 'patrol' ? 0 : Math.min(1, (t - 1) / 1.5);
    arms.forEach((a) => { a.rotation.z = Math.sin(t * 0.9 + a.userData.phase) * 0.25 * (1 - retract); a.scale.setScalar(1 - 0.7 * Math.max(0, retract)); });
    if (state === 'injury') {
      atp.setActive(t < 3);
      const go = Math.min(1, Math.max(0, (t - 2.2) / 2.5));
      micro.position.lerpVectors(home, debris.position.clone().add(V(-0.35, 0.2, 0)), go * go * (3 - 2 * go));
      body.scale.setScalar(1 + 0.4 * go);
      if (t > 5) debris.scale.setScalar(Math.max(0.01, 1 - (t - 5) / 2));
      if (t > 7.2) { debris.visible = false; }
      readout(t < 2.2 ? L('ATP from the damaged cell: the microglia pull in their branches…', 'ATP מהתא הפגוע: המיקרוגליה מקפלת את השלוחות…') : t < 5 ? L('…turn round (amoeboid) and crawl toward the injury…', '…הופכת עגולה (אמבואידית) וזוחלת אל הפגיעה…') : L('…and swallow the debris (phagocytosis).', '…ובולעת את הפסולת (פגוציטוזה).'));
    }
  });
  return {
    home: { pos: V(0, 0, 10), target: V(0, 0, 0) },
    actions: [
      { icon: '👀', label: B('Patrol', 'סיור'), radio: true, caption: B('The branches keep moving, sampling the space around neurons and synapses.', 'השלוחות ממשיכות לזוז ודוגמות את המרחב סביב נוירונים וסינפסות.'), run: () => { state = 'patrol'; t = 0; atp.setActive(false); micro.position.copy(home); body.scale.setScalar(1); debris.visible = false; debris.scale.setScalar(1); readout(''); } },
      { icon: '🩹', label: B('An injury', 'פגיעה'), radio: true, caption: B('A neuron is damaged. The microglia sense its distress signals, change shape and move in to clean up.', 'נוירון נפגע. המיקרוגליה חשה את אותות המצוקה שלו, משנה צורה ונעה פנימה כדי לנקות.'), run: () => { state = 'injury'; t = 0; debris.visible = true; debris.scale.setScalar(1); micro.position.copy(home); stage.focus(['micro', 'debris']); } },
    ],
  };
}

// ---- Ependymal cells: the lining of the ventricles, beating cilia, cerebrospinal fluid
function ependymalScene(stage, { L }) {
  const rnd = seeded(41);
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [2, 3] });
  D('ependyma', 'Ependymal cells', 'תאי אפנדימה', 'Cube-shaped cells lining the ventricles and the central canal of the spinal cord. Their cilia beat together and push the fluid along.', 'תאים דמויי קובייה שמרפדים את חדרי המוח ואת התעלה המרכזית של חוט השדרה. הריסים שלהם מכים יחד ודוחפים את הנוזל.', '#f59e0b');
  D('csf', 'Cerebrospinal fluid (CSF)', 'נוזל המוח והשדרה', 'Clear fluid that cushions the brain, carries nutrients and washes away waste. About 500 ml is made every day.', 'נוזל צלול שמרפד את המוח, נושא חומרי מזון ושוטף פסולת. כ-500 מ"ל מיוצרים בכל יום.', '#93c5fd');
  D('choroid', 'Choroid plexus', 'מקלעת כורואידית', 'A tuft of capillaries covered by special ependymal cells. It filters blood plasma into CSF.', 'ציצה של נימים המכוסה בתאי אפנדימה מיוחדים. היא מסננת פלזמת דם לנוזל המוח והשדרה.', '#e11d48');
  D('tissue', 'Brain tissue', 'רקמת המוח', 'Neurons and glia under the lining.', 'נוירונים וגליה מתחת לריפוד.', '#e8a598');
  const cilia = [];
  for (let i = 0; i < 12; i++) {
    const x = -4.4 + i * 0.8;
    const c = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.85, 1.4, 3, 0.14), mat('#f59e0b', { rough: 0.5 })); c.position.set(x, -0.62, 0); stage.add(c, 'ependyma');
    const n = new THREE.Mesh(lumpGeo(V(), 0.15, { seed: i, amp: 0.08, stretch: [1, 0.8, 1] }), mat('#92400e')); n.position.set(x, -0.82, 0.62); stage.add(n, 'ependyma');
    stage.add(meshOf(Array.from({ length: 10 }, (_, k) => new THREE.SphereGeometry(0.035, 6, 5).translate(x - 0.3 + (k % 5) * 0.15, -0.19, k < 5 ? 0.35 : -0.35)), mat('#fcd34d')), 'ependyma'); // microvilli
    for (let k = 0; k < 9; k++) {
      const pivot = new THREE.Group(); pivot.position.set(x - 0.28 + (k % 5) * 0.14, -0.2, (k < 5 ? 0.15 : -0.15) + 0.04 * (k % 3));
      pivot.add(tube([V(0, 0, 0), V(0.04, 0.3, 0), V(0.12, 0.55, 0)], 0.016, '#fde68a', undefined, 8));
      pivot.userData.phase = i * 0.6 + k * 0.15; stage.add(pivot, 'ependyma'); cilia.push(pivot);
    }
  }
  const tissue = slab(10.4, 2.2, 1.8, '#f3c5b8', 0.4); tissue.position.set(0, -2.1, 0); stage.add(tissue, 'tissue');
  for (const [x, y, k] of [[-3.6, -2.0, 'n'], [-1.2, -2.4, 'a'], [1.4, -1.9, 'n'], [3.7, -2.3, 'a']]) { const c = k === 'n' ? neuronModel(rnd, { size: 0.55 }) : astrocyteModel(rnd, { scale: 0.45 }); c.position.set(x, y, 0.95); stage.add(c, 'tissue'); }
  const csf = slab(10.4, 3, 1.8, '#bfdbfe', 0.18); csf.position.set(0, 1.4, 0); stage.add(csf, 'csf');
  // the choroid plexus: fronds, each a capillary loop covered by a cobbled layer of epithelial cells
  const plexus = new THREE.Group();
  const caps = [], cob = [];
  for (let i = 0; i < 5; i++) {
    const base = V(-4.6 + i * 0.45, 3.0 - i * 0.12, (rnd() - 0.5) * 0.4), tip = base.clone().add(V(0.3 + rnd() * 0.3, -0.9 - rnd() * 0.4, (rnd() - 0.5) * 0.4));
    const loop = new THREE.CatmullRomCurve3([base.clone().add(V(-0.08, 0, 0)), tip.clone().add(V(-0.08, 0.1, 0)), tip, tip.clone().add(V(0.08, 0.1, 0)), base.clone().add(V(0.08, 0, 0))]);
    caps.push(new THREE.TubeGeometry(loop, 30, 0.05, 6, false));
    for (let k = 0; k < 26; k++) { const p = loop.getPointAt(k / 25), off = V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(0.16); cob.push(lumpGeo(p.clone().add(off), 0.1, { seed: i * 30 + k, amp: 0.1 })); }
  }
  caps.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-5.4, 3.3, 0), V(-4.4, 3.05, 0), V(-2.7, 2.6, 0)]), 30, 0.1, 8, false));
  plexus.add(meshOf(caps, mat('#e11d48', { rough: 0.4 })));
  const cobM = meshOf(cob, mat('#fb7185', { opacity: 0.8, rough: 0.5 })); cobM.material.depthWrite = false; plexus.add(cobM);
  stage.add(plexus, 'choroid');
  const t1 = textSprite(L('ventricle: cerebrospinal fluid', 'חדר: נוזל המוח והשדרה'), { size: 0.32 }); t1.position.set(1.4, 2.6, 0.5); stage.add(t1);
  const flowCsf = flow(stage, new THREE.CatmullRomCurve3([V(-5, 0.6, 0.3), V(-2, 0.8, 0.4), V(1, 0.6, 0.3), V(4, 0.8, 0.4), V(5.2, 0.7, 0.3)]), { color: '#60a5fa', count: 24, size: 0.18, speed: 0.15 });
  const make = flow(stage, new THREE.CatmullRomCurve3([V(-5.2, 3.4, 0), V(-3.6, 2.4, 0.3), V(-3, 1.4, 0.4), V(-2, 0.9, 0.4)]), { color: '#93c5fd', count: 12, size: 0.2, speed: 0.3 });
  make.setActive(false);
  let beat = 1, t = 0;
  stage.onUpdate((dt) => { t += dt; for (const c of cilia) c.rotation.z = -0.5 * beat * (0.5 + 0.5 * Math.sin(t * 7 - c.userData.phase)); });
  return {
    home: { pos: V(0, 0.4, 11), target: V(0, 0.3, 0) },
    actions: [
      { icon: '🌊', label: B('Cilia beat', 'הריסים מכים'), toggle: true, caption: B('The cilia beat in waves, all in the same direction, and keep the fluid flowing through the ventricles.', 'הריסים מכים בגלים, כולם באותו כיוון, ומשאירים את הנוזל זורם בחדרים.'), run: (on) => { beat = on ? 1 : 0.05; flowCsf.setSpeed?.(on ? 0.15 : 0.02); flowCsf.setActive(on); stage.focus(on ? ['ependyma', 'csf'] : []); } },
      { icon: '🫧', label: B('Make CSF', 'יצירת נוזל'), toggle: true, caption: B('In the choroid plexus, fluid from the blood is filtered through a layer of ependymal cells: new cerebrospinal fluid.', 'במקלעת הכורואידית נוזל מהדם מסונן דרך שכבת תאי אפנדימה: נוזל מוח ושדרה חדש.'), run: (on) => { make.setActive(on); stage.focus(on ? ['choroid', 'csf'] : []); } },
    ],
  };
}

// ---- Schwann cells: myelin in the body's nerves (one cell, one segment), and repair after a cut
function schwannScene(stage, { L, readout }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [2, 3] });
  D('schwann', 'Schwann cells', 'תאי שוואן', 'The myelin-makers of the body\'s nerves. Unlike an oligodendrocyte, each Schwann cell wraps just one segment of one axon; its nucleus sits on the outside.', 'יוצרי המיאלין של עצבי הגוף. בניגוד לאוליגודנדרוציט, כל תא שוואן עוטף מקטע אחד בלבד של אקסון אחד; הגרעין שלו יושב מבחוץ.', '#f2c14e');
  D('axon', 'Axon', 'אקסון', 'A motor or sensory axon in a peripheral nerve.', 'אקסון מוטורי או תחושתי בעצב היקפי.', '#e19083');
  D('nodes', 'Nodes of Ranvier', 'צמתי רנבייה', 'The gaps between two Schwann cells, where the signal is renewed.', 'הרווחים בין שני תאי שוואן, שבהם האות מתחדש.', '#ffd166');
  const ax = myelinatedAxon(-6, 6, 0, 0, { seg: 1.7, gap: 0.22, color: '#fde68a', r: 0.3 });
  stage.add(ax.group, 'axon');
  const cells = new THREE.Group();
  ax.myelin.children.forEach((m) => { const n = new THREE.Mesh(lumpGeo(V(), 0.16, { seed: m.position.x, amp: 0.08, stretch: [2.2, 0.55, 1] }), mat('#b45309', { rough: 0.5 })); n.position.copy(m.position).add(V(0, 0.33, 0.1)); const sk = new THREE.Mesh(myelinSegmentGeo(1.7, 0.335, 0.08), mat('#fef3c7', { opacity: 0.28, rough: 0.3 })); sk.material.depthWrite = false; sk.rotation.z = Math.PI / 2; sk.position.copy(m.position); cells.add(m.clone(), sk, n); });
  const lamina = cyl(0.37, 0.37, 12, '#e2e8f0', { opacity: 0.12 }); lamina.material.depthWrite = false; lamina.rotation.z = Math.PI / 2; cells.add(lamina); // the basal lamina round the whole chain
  stage.add(cells, 'schwann');
  for (const x of ax.nodes) { const n = cyl(0.08, 0.08, 0.18, '#ffd166'); n.rotation.z = Math.PI / 2; n.position.set(x, 0, 0); stage.add(n, 'nodes'); }
  // a cutaway at one segment shows the layers (a spiral of membrane)
  { const sp = []; for (let i = 0; i <= 300; i++) { const a = (i / 300) * Math.PI * 2 * 6, rr = 0.075 + (i / 300) * 0.24; sp.push(V(0, Math.cos(a) * rr, Math.sin(a) * rr)); } const spiral = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp), 600, 0.011, 5, false), mat('#fef3c7', { rough: 0.4 })); spiral.position.set(ax.myelin.children[1].position.x - 0.86, 0, 0); stage.add(spiral, 'schwann'); } // the cut end shows the membrane wound round as a spiral
  const pulse = glowSprite('#ffe066', 0.8); pulse.visible = false; stage.root.add(pulse);
  let run = null, cut = false;
  stage.onUpdate((dt) => {
    if (run?.kind === 'fire') {
      run.t += dt; const xs = [-6, ...ax.nodes, 6]; const k = Math.floor(run.t * 5);
      pulse.visible = k < xs.length && !(cut && xs[k] > 0.5); pulse.position.set(xs[Math.min(k, xs.length - 1)], 0, 0.1);
      if (k >= xs.length + 2) run = null;
    }
    if (run?.kind === 'cut') {
      run.t += dt;
      // the cut end of the axon withers, the Schwann cells line up into a tube, and the axon regrows along it
      ax.group.children[0].scale.x = run.t < 3 ? 1 - 0.5 * Math.min(1, run.t / 2) : 0.5 + 0.5 * Math.min(1, (run.t - 3) / 4);
      ax.group.children[0].position.x = (1 - ax.group.children[0].scale.x) * -6;
      readout(run.t < 3 ? L('Cut! The part beyond the cut breaks down…', 'חתך! החלק שמעבר לחתך מתפרק…') : run.t < 7 ? L('…the Schwann cells stay, line up into a tube and guide the regrowing axon (about 1 mm a day)…', '…תאי השוואן נשארים, מסתדרים לצינור ומכוונים את האקסון שצומח מחדש (כמילימטר ביום)…') : L('…and the nerve works again. (In the brain and spinal cord this repair mostly fails.)', '…והעצב עובד שוב. (במוח ובחוט השדרה תיקון כזה בדרך כלל נכשל.)'));
      if (run.t > 9) { run = null; cut = false; }
    }
  });
  return {
    home: { pos: V(0, 1, 10), target: V(0, 0, 0) },
    actions: [
      { icon: '⚡', label: B('Send a signal', 'שליחת אות'), caption: B('The action potential jumps from node to node between the Schwann cells: fast and energy-saving.', 'פוטנציאל הפעולה קופץ מצומת לצומת בין תאי השוואן: מהיר וחסכוני באנרגיה.'), run: () => { run = { kind: 'fire', t: 0 }; stage.focus(['axon', 'nodes']); } },
      { icon: '✂️', label: B('Cut and repair', 'חיתוך ותיקון'), caption: B('Peripheral nerves can regrow after a cut, thanks to Schwann cells.', 'עצבים היקפיים יכולים לצמוח מחדש אחרי חתך, בזכות תאי שוואן.'), run: () => { cut = true; run = { kind: 'cut', t: 0 }; stage.focus(['schwann', 'axon']); } },
    ],
  };
}

// ---------------------------------------------------------------- scene 3: types of neurons
function typesScene(stage, { L, readout }) {
  // drawn more carefully (owner, 2026-11-15): soma with nucleus, tapered dendrites, myelinated axons with terminals,
  // a label under each, and the direction a signal travels through each shape
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3] });
  D('unipolar', 'Unipolar (sensory) neuron', 'נוירון חד-קוטבי (תחושתי)', 'One process that splits in two: one branch from the skin, one into the spinal cord. Typical of touch and pain neurons; the cell body sits off to the side, in a ganglion.', 'שלוחה אחת שמתפצלת לשתיים: ענף אחד מהעור ואחד לחוט השדרה. אופייני לנוירוני מגע וכאב; גוף התא יושב בצד, בגנגליון.', '#e98f2e');
  D('bipolar', 'Bipolar neuron', 'נוירון דו-קוטבי', 'One dendrite and one axon on opposite sides of the cell body. Found in the retina, the nose and the inner ear.', 'דנדריט אחד ואקסון אחד בצדדים מנוגדים של גוף התא. נמצא ברשתית, באף ובאוזן הפנימית.', '#14b8a6');
  D('multipolar', 'Multipolar (motor) neuron', 'נוירון רב-קוטבי (מוטורי)', 'Many dendrites and one long axon — the most common shape, e.g. the motor neurons that drive muscles.', 'דנדריטים רבים ואקסון אחד ארוך — הצורה הנפוצה ביותר, למשל הנוירונים המוטוריים שמפעילים שרירים.', '#5b8def');
  D('pyramidal', 'Pyramidal cell', 'תא פירמידה', 'A triangular cell body with one long apical dendrite reaching toward the surface and basal dendrites around its base; the main output neuron of the cortex.', 'גוף תא משולש עם דנדריט אפיקלי ארוך אחד שמגיע לכיוון פני השטח ודנדריטים בסיסיים סביב הבסיס; נוירון הפלט העיקרי של הקליפה.', '#8b5cf6');
  const soma = (color, r, stretch = [1, 1, 1]) => { const g = new THREE.Group(); const b = new THREE.Mesh(lumpGeo(V(), r, { seed: 3, amp: 0.1, stretch }), mat(color, { opacity: 0.7, rough: 0.45 })); b.material.depthWrite = false; g.add(b); g.add(new THREE.Mesh(lumpGeo(V(), r * 0.42, { seed: 5, amp: 0.05 }), mat('#3b2a5a'))); const nl = sphere(r * 0.13, '#0f0a1e'); nl.position.set(r * 0.1, r * 0.08, r * 0.3); g.add(nl); return g; };
  const axonTo = (g, pts, color, myelin = true) => {
    g.add(taperTube(pts, 0.05, () => 1, color, undefined, 48, 8));
    const c = new THREE.CatmullRomCurve3(pts);
    if (myelin) for (let k = 0.18; k < 0.86; k += 0.14) { const a = c.getPointAt(k), b = c.getPointAt(k + 0.09); const m = new THREE.Mesh(myelinSegmentGeo(a.distanceTo(b), 0.12, 0.05), mat('#f4eee0', { rough: 0.3 })); m.position.copy(a).lerp(b, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); g.add(m); }
    const end = pts[pts.length - 1], dir = end.clone().sub(pts[pts.length - 2]).normalize();
    for (let i = -1; i <= 1; i++) {
      const side = V(-dir.y, dir.x, 0).multiplyScalar(i * 0.28), tip = end.clone().add(dir.clone().multiplyScalar(0.35)).add(side);
      g.add(taperTube([end, end.clone().lerp(tip, 0.5).add(side.clone().multiplyScalar(0.3)), tip], 0.03, () => 1, color, undefined, 10, 6));
      const b = new THREE.Mesh(lumpGeo(V(), 0.085, { seed: i + 4, amp: 0.1, stretch: [1.2, 1, 1] }), mat(color, { rough: 0.4 })); b.position.copy(tip); g.add(b);
    }
    return c;
  };
  const tree = (g, from, dir, color, seed, length = 0.9, depth = 2) => dendriteTree(from, dir, { length, depth, color, spines: false, radius: 0.05, rnd: seeded(seed) }).meshes.forEach((m) => g.add(m));
  const curves = {};
  const mk = (x, id, build) => { const g = new THREE.Group(); g.position.x = x; curves[id] = build(g).points.map((p) => p.clone().add(V(x, 0, 0.1))); stage.add(g, id); return g; };
  mk(-5.1, 'unipolar', (g) => {
    const s = soma('#e98f2e', 0.34); s.position.set(-0.6, 0.9, 0); g.add(s);
    g.add(taperTube([V(-0.6, 0.6, 0), V(-0.4, 0.15, 0), V(0, 0, 0)], 0.05, () => 1, '#e98f2e', undefined, 12, 8)); // the stalk to the cell body
    for (let i = 0; i < 4; i++) { const a = -0.6 + i * 0.4; g.add(taperTube([V(-1.7, -2.4, 0), V(-1.7 + Math.sin(a) * 0.35, -2.75, 0), V(-1.7 + Math.sin(a) * 0.6, -3.0, 0.05)], 0.03, (t) => 1 - t * 0.5, '#f97316', undefined, 10, 6)); }
    g.add(taperTube([V(-1.7, -2.4, 0), V(-1.0, -1.0, 0), V(0, 0, 0)], 0.05, () => 1, '#e98f2e', undefined, 24, 8)); // the branch from the skin
    const c = axonTo(g, [V(0, 0, 0), V(0.6, 1.0, 0), V(1.0, 2.2, 0), V(1.1, 3.0, 0)], '#e98f2e', true);
    return new THREE.CatmullRomCurve3([V(-1.7, -2.9, 0), V(-1.7, -2.4, 0), V(-1.0, -1.0, 0), ...c.points]);
  });
  mk(-1.7, 'bipolar', (g) => {
    g.add(soma('#14b8a6', 0.32, [0.85, 1.35, 0.85]));
    g.add(taperTube([V(0, -0.42, 0), V(0.05, -1.4, 0), V(0, -2.3, 0)], 0.06, (t) => 1 - t * 0.4, '#14b8a6', undefined, 20, 8));
    tree(g, V(0, -2.3, 0), V(0, -1, 0), '#14b8a6', 7, 0.6, 1);
    const c = axonTo(g, [V(0, 0.42, 0), V(0.05, 1.4, 0), V(0, 2.4, 0), V(0, 3.0, 0)], '#14b8a6', false);
    return new THREE.CatmullRomCurve3([V(0, -2.8, 0), V(0, -1.4, 0), ...c.points]);
  });
  mk(1.6, 'multipolar', (g) => {
    const s = soma('#5b8def', 0.42); s.position.y = -0.6; g.add(s);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + 0.3; if (Math.abs(a - Math.PI / 2) < 0.4) continue; tree(g, V(Math.cos(a) * 0.38, -0.6 + Math.sin(a) * 0.38, 0), V(Math.cos(a), Math.sin(a) - 0.2, 0), '#5b8def', i + 2, 0.9, 2); }
    const c = axonTo(g, [V(0, -0.15, 0), V(0.1, 0.8, 0), V(-0.05, 2.0, 0), V(0, 3.0, 0)], '#5b8def', true);
    return new THREE.CatmullRomCurve3([V(-1.2, -1.6, 0), V(-0.3, -0.7, 0), ...c.points]);
  });
  mk(4.9, 'pyramidal', (g) => {
    { const pyr = new THREE.LatheGeometry([[0, -0.42], [0.36, -0.4], [0.44, -0.3], [0.32, 0.0], [0.16, 0.28], [0.08, 0.42], [0, 0.44]].map(([r, y]) => new THREE.Vector2(r, y)), 3); pyr.computeVertexNormals(); const b = new THREE.Mesh(pyr, mat('#8b5cf6', { opacity: 0.75, rough: 0.45 })); b.material.depthWrite = false; g.add(b); } // a rounded pyramid
    const n = new THREE.Mesh(lumpGeo(V(), 0.16, { seed: 6, amp: 0.05 }), mat('#3b2a5a')); n.position.y = -0.1; g.add(n);
    g.add(taperTube([V(0, 0.4, 0), V(0.05, 1.6, 0), V(0, 2.7, 0)], 0.07, (t) => 1 - t * 0.5, '#8b5cf6', undefined, 24, 8));
    tree(g, V(0, 2.7, 0), V(0, 1, 0), '#8b5cf6', 9, 0.6, 2);
    for (const sd of [-1, 1]) {
      tree(g, V(sd * 0.3, -0.35, 0), V(sd, -0.5, 0), '#8b5cf6', sd > 0 ? 4 : 5, 0.7, 1);
      g.add(taperTube([V(0, 1.2, 0), V(sd * 0.5, 1.5, 0.1), V(sd * 0.9, 1.6, 0)], 0.03, (t) => 1 - t * 0.5, '#8b5cf6', undefined, 10, 6));
    }
    const c = axonTo(g, [V(0, -0.42, 0), V(0, -1.4, 0), V(0.05, -2.4, 0), V(0, -3.0, 0)], '#8b5cf6', true);
    return new THREE.CatmullRomCurve3([V(0, 3.1, 0), V(0, 1.6, 0), V(0, 0.2, 0), ...c.points]);
  });
  for (const [x, en, he] of [[-5.1, 'Unipolar', 'חד-קוטבי'], [-1.7, 'Bipolar', 'דו-קוטבי'], [1.6, 'Multipolar', 'רב-קוטבי'], [4.9, 'Pyramidal', 'פירמידה']]) { const t = textSprite(L(en, he), { size: 0.38 }); t.position.set(x, -3.8, 0); stage.add(t); }
  // the signal travels one way through each shape: dendrites → cell body → axon → terminals
  const flows = Object.values(curves).map((pts) => { const f = flow(stage, new THREE.CatmullRomCurve3(pts), { color: '#fde047', count: 10, size: 0.28, speed: 0.3 }); f.setActive(false); return f; });
  return {
    home: { pos: V(0, 0, 12.5), target: V(0, -0.3, 0) },
    actions: [
      { icon: '⚡', label: B('Show the signal flow', 'הצגת זרימת האות'), toggle: true, caption: B('In every shape the signal goes one way: in through the dendrites (or the skin branch), past the cell body, out along the axon to the terminals.', 'בכל צורה האות הולך בכיוון אחד: נכנס דרך הדנדריטים (או הענף מהעור), עובר ליד גוף התא, ויוצא לאורך האקסון אל הכפתורים.'), run: (on) => { flows.forEach((f) => f.setActive(on)); readout(on ? L('Yellow = the direction a signal travels', 'צהוב = הכיוון שבו האות נע') : ''); } },
    ],
  };
}

// ---------------------------------------------------------------- sensory cells (owner, 2026-11-15: each sense in its
// own place on the body). Touch & pain (fingertip skin), rods & cones (under the retina), the hair cell (under the
// cochlea). Smell and taste are tissue places (tissue.js). Real models are Sketchfab CC BY (docs/data-credits.md).

/** Swap a part's drawn meshes for a loaded model (materials cloned: highlighting must not touch the cached file). */
function replacePart(stage, id, obj) {
  for (const r of stage.roots.get(id) || []) r.removeFromParent();
  stage.meshes = stage.meshes.filter((m) => m.userData.partId !== id);
  stage.roots.delete(id);
  obj.traverse((o) => { if (o.isMesh) o.material = o.material.clone(); });
  stage.add(obj, id);
}
const worldBox = (o) => { o.updateWorldMatrix(true, true); return new THREE.Box3().setFromObject(o); };
/** Split one mesh's triangles in two by a test on each triangle's centre (in the mesh's own space). */
function splitMesh(mesh, test) {
  const g = mesh.geometry, pos = g.attributes.position, idx = g.index ? g.index.array : [...Array(pos.count).keys()];
  const parts = [[], []], c = new THREE.Vector3(), p = new THREE.Vector3();
  for (let i = 0; i < idx.length; i += 3) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) c.add(p.fromBufferAttribute(pos, idx[i + k]));
    parts[test(c.divideScalar(3)) ? 0 : 1].push(idx[i], idx[i + 1], idx[i + 2]);
  }
  return parts.map((tris) => { const ng = g.clone(); ng.setIndex(tris); const m = new THREE.Mesh(ng, mesh.material); m.matrix.copy(mesh.matrixWorld); m.matrix.decompose(m.position, m.quaternion, m.scale); return m; });
}
/** Nerve impulses as bright dots running along a fibre: fire() sends one now, setRate(hz) keeps a steady train. */
function spikeTrain(stage, getCurve, color, { speed = 0.45, size = 0.3 } = {}) {
  const live = [];
  let rate = 0, acc = 0, count = 0;
  const fire = () => { const s = glowSprite(color, size); s.position.copy(getCurve().getPointAt(0)); stage.root.add(s); live.push({ s, t: 0 }); count++; };
  stage.onUpdate((dt) => {
    if (rate > 0) { acc += dt * rate; while (acc >= 1) { acc -= 1; fire(); } }
    const c = getCurve();
    for (let i = live.length - 1; i >= 0; i--) {
      const k = live[i];
      k.t += dt * speed;
      if (k.t >= 1) { k.s.removeFromParent(); live.splice(i, 1); } else k.s.position.copy(c.getPointAt(k.t));
    }
  });
  return { fire, setRate: (r) => { rate = r; if (!r) acc = 0; }, get count() { return count; }, reset() { count = 0; } };
}

// ---- Touch & pain: five kinds of skin receptor, each on its own sensory neuron
const SKIN = { x0: -7, x1: 4.6, top: 2.45 };
const RX = { free: -5.8, meissner: -4.52, merkel: -2.56, ruffini: -0.6, pacinian: 2.2 };
const RC = { free: '#f97316', meissner: '#ec4899', merkel: '#a855f7', ruffini: '#22c55e', pacinian: '#eab308' };
function sensoryScene(stage, { L, readout }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [6, 7] });
  D('skin', 'Skin of the fingertip', 'עור קצה האצבע', 'Epidermis on top (with ridges below it), then the dermis, then fat. Each kind of receptor sits at its own depth: the deeper it is, the bigger the patch of skin it feels.', 'אפידרמיס למעלה (עם רכסים מתחתיו), אחריו הדרמיס ואז שומן. כל סוג קולטן יושב בעומק משלו: ככל שהוא עמוק יותר, כך שטח העור שהוא מרגיש גדול יותר.', '#f5c6a5');
  D('free', 'Free nerve endings: pain & temperature', 'קצות עצב חופשיים: כאב וטמפרטורה', 'Bare branching tips that reach into the epidermis. Their channels (e.g. TRPV1 for heat, Na⁺ channels) open with heat, cold or damage. Thin, slow fibres (Aδ and C). They keep firing as long as the harm lasts.', 'קצוות חשופים ומסועפים שמגיעים לאפידרמיס. התעלות שלהם (למשל TRPV1 לחום) נפתחות בחום, בקור או בנזק. סיבים דקים ואיטיים (Aδ ו-C). הם ממשיכים לירות כל עוד הנזק נמשך.', RC.free);
  D('meissner', 'Meissner corpuscle: light touch', 'גופיף מייסנר: מגע קל', 'A stack of flattened cells with a coiled ending, in the dermal ridges just under the epidermis. Very sensitive to light, moving touch (a stroke, slipping). Fast-adapting: it fires when touch starts and stops, not while it holds still.', 'ערימה של תאים שטוחים עם קצה עצב מפותל, ברכסי הדרמיס ממש מתחת לאפידרמיס. רגיש מאוד למגע קל ונע (ליטוף, החלקה). מסתגל מהר: יורה כשהמגע מתחיל ונגמר, לא כשהוא קבוע.', RC.meissner);
  D('merkel', 'Merkel discs: pressure & shape', 'דיסקיות מרקל: לחץ וצורה', 'Merkel cells at the base of the epidermis, each touching a disc-shaped nerve ending. They feel steady pressure, edges and texture (reading Braille). Slow-adapting: they keep firing while you press.', 'תאי מרקל בבסיס האפידרמיס, כל אחד נוגע בקצה עצב בצורת דיסקית. הם חשים לחץ קבוע, קצוות ומרקם (קריאת ברייל). מסתגלים לאט: ממשיכים לירות כל עוד לוחצים.', RC.merkel);
  D('ruffini', 'Ruffini ending: skin stretch', 'קצה רופיני: מתיחת העור', 'A spindle-shaped capsule deep in the dermis, its nerve branches woven between collagen fibres. Stretching the skin pulls the fibres and squeezes the ending: it tells the brain how the fingers bend. Slow-adapting.', 'קופסית בצורת פלך עמוק בדרמיס, שענפי העצב שלה שזורים בין סיבי קולגן. מתיחת העור מושכת את הסיבים ולוחצת על הקצה: היא מספרת למוח איך האצבעות מתכופפות. מסתגל לאט.', RC.ruffini);
  D('pacinian', 'Pacinian corpuscle: vibration', 'גופיף פאצ׳יני: רטט', 'A big onion of up to 60 layers around one ending, deep in the skin. The layers filter out steady pressure, so it only fires at changes: vibration (best around 250 Hz). Fast-adapting.', 'בצל גדול של עד 60 שכבות סביב קצה עצב אחד, עמוק בעור. השכבות מסננות לחץ קבוע, ולכן הוא יורה רק בשינויים: רטט (הכי טוב בסביבות 250 הרץ). מסתגל מהר.', RC.pacinian);
  D('drg', 'Sensory neuron (cell body in the dorsal root ganglion)', 'נוירון תחושתי (גוף התא בגנגליון השורש הגבי)', 'Each receptor is the ending of its own sensory neuron. All of them are pseudo-unipolar: the cell body sits on a side stalk in a ganglion beside the spinal cord, and one fibre runs from the skin straight into the cord.', 'כל קולטן הוא הקצה של נוירון תחושתי משלו. כולם פסאודו-חד-קוטביים: גוף התא יושב על גבעול צדדי בגנגליון ליד חוט השדרה, וסיב אחד רץ מהעור ישר לחוט השדרה.', '#e98f2e');
  const rnd = seeded(31);
  const mk = (id, build) => { const g = new THREE.Group(); build(g); stage.add(g, id); return g; };
  const cx = (SKIN.x0 + SKIN.x1) / 2, w = SKIN.x1 - SKIN.x0;
  const skin = mk('skin', (g) => {
    const dermis = slab(w, 2.95, 1.3, '#f4b9a0', 0.42); dermis.position.set(cx, 0.15, 0); g.add(dermis);
    const epi = slab(w, 0.8, 1.3, '#e3906f', 0.55, { wave: -0.18, freq: 1.6 }); epi.position.set(cx, 2.02, 0); g.add(epi);
    const horn = slab(w, 0.1, 1.3, '#f4dcc4', 0.55); horn.position.set(cx, 2.47, 0); g.add(horn);
    const fat = slab(w, 0.45, 1.3, '#fde9a8', 0.45); fat.position.set(cx, -1.57, 0); g.add(fat);
    // collagen fibres in the dermis (Ruffini endings are woven into them)
    for (let i = 0; i < 9; i++) { const y = -1.1 + rnd() * 2.3, x = SKIN.x0 + 0.4 + rnd() * (w - 0.8); g.add(tube([V(x - 0.9, y, -0.45), V(x, y + 0.08, -0.45), V(x + 0.9, y - 0.05, -0.45)], 0.025, '#fde7d9', { opacity: 0.6 }, 16)); }
    // the epidermis as textbooks draw it, behind the receptors: a row of basal cells on the wavy border, rounded
    // spiny cells above, flattened granular cells, then thin dead scales (owner, 2026-11-15: better-looking models)
    const base = (x) => 1.62 - 0.18 * Math.cos((x - cx) * 1.6 + Math.PI); // the epidermis' lower border (its ridges)
    const ecells = { basal: [], spiny: [], gran: [], horn: [] };
    for (const z of [-0.55, -0.3]) for (let x = SKIN.x0 + 0.08; x < SKIN.x1; x += 0.17) {
      const b = base(x);
      ecells.basal.push(lumpGeo(V(x, b + 0.08, z), 0.08, { seed: x * 7 + z, amp: 0.1, stretch: [0.8, 1.2, 0.8] }));
      for (let k = 0; k < 3; k++) { const y = b + 0.22 + k * 0.15; if (y < 2.2) ecells.spiny.push(lumpGeo(V(x + (k % 2) * 0.08, y, z), 0.085, { seed: x * 3 + k, amp: 0.15 })); }
      ecells.gran.push(lumpGeo(V(x + 0.04, 2.27, z), 0.085, { seed: x * 5, amp: 0.1, stretch: [1.3, 0.45, 1] }));
      ecells.horn.push(new THREE.BoxGeometry(0.2, 0.025, 0.24).translate(x, 2.38 + (Math.round(x * 6) % 3) * 0.03, z));
    }
    g.add(meshOf(ecells.basal, mat('#c9765a', { rough: 0.55 })), meshOf(ecells.spiny, mat('#e8a084', { rough: 0.6 })), meshOf(ecells.gran, mat('#b4846c', { rough: 0.6 })), meshOf(ecells.horn, mat('#f6e7d6', { rough: 0.8 })));
    // capillary loops rising into the dermal papillae (red up, blue down), and the arteries/veins below them
    const caps = [], veins = [];
    for (let x = SKIN.x0 + 0.5; x < SKIN.x1 - 0.3; x += 1.96) { const b = base(x); caps.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x - 0.1, 0.5, -0.12), V(x - 0.08, b - 0.25, -0.12), V(x, b - 0.12, -0.12), V(x + 0.08, b - 0.25, -0.12), V(x + 0.1, 0.5, -0.12)]), 24, 0.03, 5, false)); }
    caps.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(SKIN.x0, 0.5, -0.12), V(cx, 0.45, -0.12), V(SKIN.x1, 0.52, -0.12)]), 60, 0.05, 6, false));
    veins.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(SKIN.x0, -1.15, -0.35), V(cx, -1.2, -0.35), V(SKIN.x1, -1.1, -0.35)]), 60, 0.07, 6, false));
    g.add(meshOf(caps, mat('#dc2626', { rough: 0.4 })), meshOf(veins, mat('#2563eb', { rough: 0.4 })));
    // a sweat gland: a coiled tube in the fat, its duct winding up through the epidermis to a pore
    const SX = 3.5, coil = [];
    for (let i = 0; i <= 60; i++) { const a = i * 0.55; coil.push(V(SX + Math.cos(a) * 0.22, -1.45 + Math.sin(a * 0.5) * 0.12 + i * 0.002, Math.sin(a) * 0.2 - 0.2)); }
    const duct = [coil[coil.length - 1], V(SX + 0.1, -0.6, -0.2), V(SX - 0.05, 0.6, -0.2)];
    for (let k = 0; k <= 8; k++) { const y = 0.9 + k * 0.19, a = k * 1.4; duct.push(V(SX + Math.cos(a) * 0.08, y, -0.2 + Math.sin(a) * 0.08)); }
    g.add(meshOf([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 240, 0.05, 6, false), new THREE.TubeGeometry(new THREE.CatmullRomCurve3(duct), 120, 0.035, 6, false)], mat('#38bdf8', { rough: 0.4 })));
    // fat cells in the layer under the dermis
    g.add(meshOf(Array.from({ length: 26 }, (_, i) => lumpGeo(V(SKIN.x0 + 0.25 + i * 0.44, -1.57 + (i % 2) * 0.08, -0.35 + (i % 3) * 0.2), 0.2, { seed: i, amp: 0.06 })), mat('#fde68a', { opacity: 0.75, rough: 0.4 })));
  });
  // every receptor's fibre: down out of the skin, then right along the nerve under it, to the ganglion
  const NERVE_Y = -2.35, E = V(5.3, NERVE_Y, 0);
  const fibre = (id, from, dz) => [from, V(from.x + 0.05, -1.2, dz), V(from.x + 0.55, NERVE_Y + 0.1, dz), V(from.x + 1.4, NERVE_Y + dz * 0.25, dz), V(4.6, NERVE_Y + dz * 0.2, dz * 0.4), E];
  const paths = {};
  const addFibre = (g, id, from, dz) => { paths[id] = fibre(id, from, dz); g.add(taperTube(paths[id], 0.042, () => 1, RC[id], undefined, 48, 8)); };
  mk('free', (g) => {
    const trunk = V(RX.free, 1.0, 0.1);
    for (let i = 0; i < 6; i++) {
      const tx = RX.free - 0.65 + i * 0.26 + (rnd() - 0.5) * 0.08, ty = 2.1 + rnd() * 0.2, z = (rnd() - 0.5) * 0.5;
      g.add(taperTube([trunk, trunk.clone().lerp(V(tx, ty, z), 0.5).add(V((rnd() - 0.5) * 0.2, 0, 0)), V(tx, ty, z)], 0.03, (t) => 1 - t * 0.6, '#fb923c', undefined, 20, 8));
      const bead = sphere(0.04, '#fdba74'); bead.position.set(tx, ty, z); g.add(bead);
    }
    addFibre(g, 'free', trunk, 0.35);
  });
  mk('meissner', (g) => {
    const C = V(RX.meissner, 1.42, 0);
    const cap = sphere(0.22, '#f9a8d4', { opacity: 0.45 }); cap.scale.set(0.95, 1.7, 0.95); cap.position.copy(C); g.add(cap);
    for (let i = 0; i < 6; i++) { const d = cyl(0.17 - Math.abs(i - 2.5) * 0.02, 0.17 - Math.abs(i - 2.5) * 0.02, 0.035, '#fbcfe8', { opacity: 0.85 }); d.position.copy(C).add(V(0, -0.27 + i * 0.11, 0)); g.add(d); }
    const coil = []; for (let i = 0; i <= 24; i++) { const a = i * 0.9; coil.push(V(C.x + Math.cos(a) * 0.12, C.y - 0.3 + i * 0.025, Math.sin(a) * 0.12)); }
    g.add(tube(coil, 0.018, RC.meissner, undefined, 80));
    addFibre(g, 'meissner', V(C.x, C.y - 0.32, 0), 0.18);
  });
  mk('merkel', (g) => {
    for (let i = 0; i < 4; i++) {
      const x = RX.merkel - 0.33 + i * 0.22;
      const cell = blob(0.075, '#e9d5ff', { seed: i + 2, amp: 0.1 }); cell.scale.set(1.2, 0.8, 1); cell.position.set(x, 1.53, 0); g.add(cell);
      const disc = cyl(0.08, 0.06, 0.03, RC.merkel); disc.position.set(x, 1.44, 0); g.add(disc);
      g.add(taperTube([V(x, 1.43, 0), V(x * 0.5 + RX.merkel * 0.5, 1.1, 0), V(RX.merkel, 0.85, 0)], 0.022, () => 1, RC.merkel, undefined, 12, 6));
    }
    addFibre(g, 'merkel', V(RX.merkel, 0.85, 0), 0.0);
  });
  mk('ruffini', (g) => {
    const C = V(RX.ruffini, 0.2, 0);
    const cap = sphere(0.2, '#bbf7d0', { opacity: 0.4 }); cap.scale.set(3.4, 1, 1); cap.position.copy(C); g.add(cap);
    for (let i = 0; i < 7; i++) { const x = C.x - 0.5 + i * 0.16; g.add(tube([V(C.x, C.y - 0.05, 0), V(x, C.y + (i % 2 ? 0.08 : -0.06), (rnd() - 0.5) * 0.15), V(x + 0.08, C.y + (i % 2 ? -0.04 : 0.07), 0)], 0.014, RC.ruffini, undefined, 12)); }
    for (const s of [-1, 1]) g.add(tube([C.clone().add(V(s * 0.6, 0, 0)), C.clone().add(V(s * 1.2, 0.04, -0.2))], 0.03, '#fde7d9', undefined, 8)); // collagen through its ends
    addFibre(g, 'ruffini', V(C.x, C.y - 0.15, 0), -0.18);
  });
  const PAC = V(RX.pacinian, -0.75, 0);
  mk('pacinian', (g) => {
    for (let k = 0; k < 6; k++) { const s = sphere(0.1 + k * 0.07, '#fde68a', { opacity: k ? 0.5 - k * 0.06 : 1 }); s.scale.set(0.75, 1.9, 0.75); s.position.copy(PAC); g.add(s); }
    addFibre(g, 'pacinian', PAC.clone().add(V(0, -0.85, 0)), -0.35);
  });
  // the ganglion neuron (drawn; replaced by the real model)
  let right = V(9.6, NERVE_Y - 0.3, 0);
  mk('drg', (g) => {
    g.add(tube([E, V(6.5, NERVE_Y, 0), V(8, NERVE_Y - 0.1, 0), right], 0.06, '#e98f2e'));
    const soma = sphere(0.32, '#e98f2e'); soma.position.set(7.2, NERVE_Y + 0.75, 0); g.add(soma);
    g.add(tube([V(7.2, NERVE_Y + 0.45, 0), V(7.2, NERVE_Y + 0.05, 0)], 0.04, '#e98f2e'));
  });
  const cordLbl = textSprite(L('→ spinal cord', 'חוט השדרה ←'), { size: 0.34 }); cordLbl.position.set(10.3, NERVE_Y + 0.5, 0); stage.add(cordLbl);
  const skinLbl = textSprite(L('Skin of a fingertip', 'עור של קצה אצבע'), { size: 0.36 }); skinLbl.position.set(cx, 3.05, 0); stage.add(skinLbl);

  // ---- stimuli: a pin, a heat source, a soft probe
  const pin = new THREE.Group();
  { const shaft = cyl(0.03, 0.03, 1.2, '#cbd5e1', { metal: 0.6, rough: 0.3 }); shaft.position.y = 0.75; const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 16), mat('#e2e8f0', { metal: 0.7, rough: 0.25 })); tip.rotation.x = Math.PI; pin.add(shaft, tip); const head = sphere(0.09, '#ef4444'); head.position.y = 1.4; pin.add(head); }
  const probe = new THREE.Group();
  { const c = capsule(0.22, 0.6, '#93c5fd', { rough: 0.35 }); c.position.y = 0.52; probe.add(c); }
  const heat = glowSprite('#f97316', 1.6);
  [pin, probe, heat].forEach((o) => { o.visible = false; stage.root.add(o); });
  // ---- spikes: one train per receptor, along its fibre and on through the neuron into the cord
  const curves = {};
  const setCurves = () => { for (const id of Object.keys(RC)) curves[id] = new THREE.CatmullRomCurve3([...paths[id], E.clone().lerp(right, 0.5).add(V(0, 0.05, 0)), right]); };
  setCurves();
  const trains = Object.fromEntries(Object.keys(RC).map((id) => [id, spikeTrain(stage, () => curves[id], RC[id], { speed: 0.32 })]));
  // ---- what each action does over time (t in seconds); `rate` is the firing rate the receptor's neuron reports
  const STIM = {
    prick: { id: 'free', dur: 3.2, tool: pin, at: RX.free + 0.1, rate: (t) => (t > 0.4 && t < 2.6 ? 14 : 0), pose: (t) => SKIN.top + 0.05 - 0.28 * smoothstep(t, 0.2, 0.45) * (1 - smoothstep(t, 2.6, 2.9)), type: B('slow-adapting: keeps firing while it hurts', 'מסתגל לאט: ממשיך לירות כל עוד כואב') },
    heat: { id: 'free', dur: 3.8, rate: (t) => (t < 3.3 ? Math.max(0, (t - 0.4) * 6) : 0), type: B('fires faster as it gets hotter', 'יורה מהר יותר ככל שחם יותר') },
    stroke: { id: 'meissner', dur: 3, tool: probe, rate: (t) => (t > 0.5 && t < 2.4 ? 9 : 0), pose: () => SKIN.top + 0.02, slide: (t) => RX.meissner - 1.4 + 2.8 * smoothstep(t, 0.3, 2.6), type: B('fast-adapting: fires while the touch moves', 'מסתגל מהר: יורה כל עוד המגע זז') },
    press: { id: 'merkel', dur: 3.6, tool: probe, at: RX.merkel, rate: (t) => (t > 0.45 && t < 3 ? 16 - 5 * smoothstep(t, 0.5, 1.5) : 0), pose: (t) => SKIN.top + 0.25 - 0.32 * smoothstep(t, 0.15, 0.45) * (1 - smoothstep(t, 3, 3.4)), type: B('slow-adapting: keeps firing while you press', 'מסתגל לאט: ממשיך לירות כל עוד לוחצים') },
    stretch: { id: 'ruffini', dur: 3.4, rate: (t) => (t > 0.5 && t < 2.9 ? 8 : 0), stretch: (t) => smoothstep(t, 0.2, 0.7) * (1 - smoothstep(t, 2.8, 3.3)), type: B('slow-adapting: reports the stretch the whole time', 'מסתגל לאט: מדווח על המתיחה כל הזמן') },
    vibrate: { id: 'pacinian', dur: 4.6, tool: probe, at: RX.pacinian, rate: (t) => (t > 0.3 && t < 0.55 ? 10 : t > 1.8 && t < 4 ? 18 : 0), pose: (t) => SKIN.top + 0.25 - 0.3 * smoothstep(t, 0.1, 0.35) * (1 - smoothstep(t, 4, 4.4)) + (t > 1.8 && t < 4 ? 0.05 * Math.sin(t * 60) : 0), type: B('fast-adapting: silent under steady pressure, fires at every vibration', 'מסתגל מהר: שקט תחת לחץ קבוע, יורה בכל רטט') },
  };
  let cur = null, t = 0;
  const start = (key) => {
    Object.values(trains).forEach((tr) => { tr.setRate(0); tr.reset(); });
    [pin, probe, heat].forEach((o) => { o.visible = false; });
    cur = STIM[key]; t = 0;
    stage.focus([cur.id, 'skin']);
  };
  stage.onUpdate((dt) => {
    if (!cur) return;
    t += dt;
    const tr = trains[cur.id];
    tr.setRate(cur.rate(t));
    if (cur.tool) { cur.tool.visible = true; cur.tool.position.set(cur.slide ? cur.slide(t) : cur.at, cur.pose(t), 0.1); }
    if (cur === STIM.heat) { heat.visible = true; heat.position.set(RX.free, SKIN.top + 0.7, 0.2); heat.material.opacity = 0.5 + 0.4 * smoothstep(t, 0, 1) * (1 - smoothstep(t, 3.2, 3.8)); }
    if (cur.stretch) skin.scale.x = 1 + 0.05 * cur.stretch(t);
    readout(`${L(stage.parts.get(cur.id).name.en, stage.parts.get(cur.id).name.he)}<br>${L(cur.type.en, cur.type.he)}<br>${L('Impulses sent', 'דחפים שנשלחו')}: <b>${tr.count}</b>`);
    if (t > cur.dur) { tr.setRate(0); [pin, probe, heat].forEach((o) => { o.visible = false; }); skin.scale.x = 1; cur = null; }
  });

  const ready = loadModelGLB('sensory-neuron').then((obj) => {
    let axon = null;
    obj.traverse((o) => { if (o.isMesh && o.material.name === 'material_0') o.visible = false; if (o.isMesh && o.name === 'Object_4') axon = o; });
    obj.traverse((o) => { if (o.isMesh && !o.visible) o.removeFromParent(); });
    const b0 = worldBox(obj), bw = b0.max.x - b0.min.x, bh = b0.max.y - b0.min.y;
    const g = fitModel(obj, 4.6 * bh / bw, V(0, 0, 0));
    const a0 = axon ? worldBox(axon) : worldBox(g);
    g.position.add(E.clone().sub(V(a0.min.x + 0.45, (a0.min.y + a0.max.y) / 2, 0)));
    replacePart(stage, 'drg', g);
    const a = axon ? worldBox(axon) : worldBox(g);
    right = V(a.max.x - 0.05, (a.min.y + a.max.y) / 2, 0);
    setCurves();
    cordLbl.position.set(right.x + 0.9, right.y + 0.5, 0);
    return loadModelGLB('pacinian-corpuscle').then((p) => {
      const keep = (stage.roots.get('pacinian') || []).flatMap((r) => r.children.filter((c) => c.geometry?.type === 'TubeGeometry'));
      replacePart(stage, 'pacinian', fitModel(p, 1.75, PAC));
      keep.forEach((tb) => stage.add(tb, 'pacinian'));
    });
  }).catch((e) => console.warn('Touch models not loaded:', e));
  const act = (key, icon, en, he, cen, che) => ({ icon, label: B(en, he), caption: B(cen, che), run: () => start(key) });
  return {
    ready,
    home: { pos: V(1.6, 0.6, 14), target: V(1.6, 0, 0) },
    actions: [
      act('prick', '📌', 'Prick (pain)', 'דקירה (כאב)', 'A pin damages a few cells: free nerve endings fire and keep firing while it hurts. Their thin fibres are slow, which is why pain can arrive a moment late.', 'סיכה פוגעת בכמה תאים: קצות העצב החופשיים יורים וממשיכים לירות כל עוד כואב. הסיבים הדקים שלהם איטיים, ולכן הכאב יכול להגיע רגע מאוחר.'),
      act('heat', '🔥', 'Heat', 'חום', 'Heat opens TRPV1 channels (the same ones chili pepper opens) in the free endings: the hotter it gets, the faster they fire.', 'חום פותח תעלות TRPV1 (אותן תעלות שפלפל חריף פותח) בקצות החופשיים: ככל שחם יותר, הם יורים מהר יותר.'),
      act('stroke', '🪶', 'Light stroke', 'ליטוף קל', 'A light, moving touch bends the Meissner corpuscles in the ridges just under the surface. They fire only while the touch moves.', 'מגע קל ונע מכופף את גופיפי מייסנר ברכסים שממש מתחת לפני השטח. הם יורים רק כל עוד המגע זז.'),
      act('press', '👆', 'Press and hold', 'לחיצה והחזקה', 'Steady pressure squeezes the Merkel cells: their neuron keeps firing (a little slower) for as long as you press. That is how you feel shapes and Braille.', 'לחץ קבוע לוחץ על תאי מרקל: הנוירון שלהם ממשיך לירות (קצת לאט יותר) כל עוד לוחצים. כך מרגישים צורות וברייל.'),
      act('stretch', '↔️', 'Stretch the skin', 'מתיחת העור', 'Stretching the skin pulls the collagen fibres through the Ruffini ending, which fires steadily: it tells the brain how your fingers and joints bend.', 'מתיחת העור מושכת את סיבי הקולגן שעוברים דרך קצה רופיני, והוא יורה בקביעות: הוא מספר למוח איך האצבעות והמפרקים מתכופפים.'),
      act('vibrate', '📳', 'Vibration', 'רטט', 'First steady pressure: the Pacinian corpuscle fires once and goes quiet, because its layers absorb a steady push. Then vibration: it fires at every shake.', 'קודם לחץ קבוע: גופיף פאצ׳יני יורה פעם אחת ושותק, כי השכבות שלו בולעות דחיפה קבועה. אחר כך רטט: הוא יורה בכל טלטול.'),
    ],
  };
}
const smoothstep = (t, a, b) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };

// ---- Rods & cones: the two photoreceptors, outer segments up against the pigment epithelium, light from below
function photoreceptorScene(stage, { L, readout }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [6] });
  D('rod', 'Rod (dim light)', 'קנה (אור עמום)', 'Its long outer segment is a stack of about 1000 discs packed with rhodopsin, a G-protein receptor. One photon is enough to change its signal. About 120 million per eye; no colour.', 'המקטע החיצוני הארוך שלו הוא ערימה של כ-1000 דיסקים מלאים ברודופסין, קולטן מצומד-חלבון-G. פוטון אחד מספיק כדי לשנות את האות שלו. כ-120 מיליון בכל עין; בלי צבע.', '#60a5fa');
  D('cone', 'Cone (colour, bright light)', 'מדוך (צבע, אור חזק)', 'A shorter, tapering outer segment with one of three opsins (red, green or blue light). Cones need bright light and give colour and sharp detail; they crowd the fovea.', 'מקטע חיצוני קצר ומתחדד עם אחד משלושה אופסינים (אור אדום, ירוק או כחול). מדוכים צריכים אור חזק ונותנים צבע ופרטים חדים; הם צפופים בגומית.', '#a78bfa');
  D('rpe', 'Pigment epithelium', 'אפיתל פיגמנטרי', 'The dark layer at the very back of the retina. It absorbs stray light and recycles the used-up retinal from the outer segments.', 'השכבה הכהה בחלק האחורי של הרשתית. היא בולעת אור תועה וממחזרת את הרטינל המשומש מהמקטעים החיצוניים.', '#3f2a1d');
  D('bipolarCells', 'Bipolar cells', 'תאים דו-קוטביים', 'The next cells in line. They read how much glutamate the rod or cone releases, and pass the result on to ganglion cells and the optic nerve.', 'התאים הבאים בתור. הם קוראים כמה גלוטמט הקנה או המדוך משחררים, ומעבירים את התוצאה לתאי הגנגליון ולעצב הראייה.', '#3b82f6');
  const rpe = new THREE.Group(); // a row of pigment cells (melanin granules, fingers reaching down round the outer segments)
  rpe.add(meshOf([-2, -1, 0, 1, 2].map((x) => new RoundedBoxGeometry(0.96, 0.5, 1.1, 2, 0.1).translate(x, 3.0, 0)), mat('#5b3a26', { rough: 0.7 })));
  const melF = [];
  for (let k = 0; k < 60; k++) melF.push(new THREE.SphereGeometry(0.04, 6, 5).translate(-2.4 + (k / 60) * 4.8, 2.82 + (k % 3) * 0.04, -0.45 + (k % 5) * 0.2));
  for (const x of [-1.05, -0.45, 0.45, 1.05]) melF.push(new THREE.CylinderGeometry(0.03, 0.045, 0.55, 5).translate(x, 2.5, 0.05));
  rpe.add(meshOf(melF, mat('#2a1a10', { rough: 0.6 })));
  stage.add(rpe, 'rpe');
  const photo = (g, color, cone) => { // the drawn cell, replaced by the real model below
    for (let i = 0; i < 10; i++) { const r = cone ? 0.32 - i * 0.025 : 0.2; const d = cyl(r, r, 0.08, color); d.position.y = 1.2 + i * 0.13; g.add(d); }
    const inner = cyl(0.22, 0.22, 0.9, color, { opacity: 0.8 }); inner.position.y = 0.6; g.add(inner);
    const n = sphere(0.24, color); n.position.y = -0.2; g.add(n);
    g.add(tube([V(0, -0.4, 0), V(0, -1.4, 0), V(0, -2, 0)], 0.05, color));
  };
  for (const [id, x, cone] of [['cone', -0.75, true], ['rod', 0.75, false]]) { const g = new THREE.Group(); photo(g, stage.parts.get(id).color, cone); g.position.x = x; stage.add(g, id); }
  const bip = new THREE.Group();
  for (const x of [-0.75, 0.75]) {
    const geos = [lumpGeo(V(x + 0.1, -2.85, 0), 0.2, { seed: x > 0 ? 3 : 4, amp: 0.1, stretch: [0.8, 1.35, 0.8] })];
    for (const d of [-0.16, 0, 0.16]) geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x + 0.1, -2.6, 0), V(x + d * 0.6, -2.42, 0.03), V(x + d, -2.27, 0)]), 8, 0.02, 5, false)); // dendrites up to the pedicle
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x + 0.1, -3.1, 0), V(x + 0.15, -3.4, 0), V(x + 0.2, -3.7, 0)]), 10, 0.03, 5, false), new THREE.SphereGeometry(0.06, 8, 6).translate(x + 0.2, -3.72, 0));
    bip.add(meshOf(geos, mat('#3b82f6', { rough: 0.45 })));
  }
  stage.add(bip, 'bipolarCells');
  const lbl = textSprite(L('↑ light enters from below', '↑ האור נכנס מלמטה'), { size: 0.3 }); lbl.position.set(2.4, -3.2, 0); stage.add(lbl);
  // light (photons) and glutamate (released at the synapse: a lot in the dark, less in light)
  const photons = flow(stage, new THREE.CatmullRomCurve3([V(0, -3.9, 0.5), V(0, 0, 0.5), V(0, 2.5, 0.5)]), { color: '#fde047', count: 14, size: 0.28, speed: 0.5 });
  photons.setActive(false);
  const glu = { cone: flow(stage, new THREE.CatmullRomCurve3([V(-0.75, -2.3, 0.1), V(-0.7, -2.6, 0.2), V(-0.65, -2.85, 0.1)]), { color: '#f472b6', count: 10, size: 0.14, speed: 0.6 }), rod: flow(stage, new THREE.CatmullRomCurve3([V(0.75, -2.3, 0.1), V(0.8, -2.6, 0.2), V(0.85, -2.85, 0.1)]), { color: '#f472b6', count: 10, size: 0.14, speed: 0.6 }) };
  let light = 'dark';
  const show = () => {
    // in the dark both release glutamate; light makes a cell release less (dim: only rods react; bright: both)
    photons.setActive(light !== 'dark');
    glu.rod.setActive(light === 'dark');
    glu.cone.setActive(light !== 'bright');
    stage.focus(light === 'dim' ? ['rod'] : light === 'bright' ? ['cone', 'rod'] : []);
    readout({ dark: L('Darkness: both cells are depolarised (about −40 mV) and release glutamate all the time — the "dark current".', 'חושך: שני התאים במצב דה-פולריזציה (כ-‎−40 מ"ו) ומשחררים גלוטמט כל הזמן — "זרם החושך".'), dim: L('Dim light: only the rods react. Rhodopsin catches the photons, the cell hyperpolarises and releases LESS glutamate — that drop is the signal.', 'אור עמום: רק הקנים מגיבים. רודופסין לוכד את הפוטונים, התא עובר היפר-פולריזציה ומשחרר פחות גלוטמט — הירידה הזאת היא האות.'), bright: L('Bright light: the cones react too (the rods are saturated). Both release less glutamate; the cones also tell colour apart.', 'אור חזק: גם המדוכים מגיבים (הקנים רוויים). שניהם משחררים פחות גלוטמט; המדוכים גם מבדילים בין צבעים.') }[light]);
  };
  const ready = loadModelGLB('sensory-cells').then((obj) => {
    const g = fitModel(obj, 4.8, V(0, 0.15, 0));
    g.updateMatrixWorld(true);
    let mesh = null; g.traverse((o) => { if (o.isMesh) mesh = o; });
    if (!mesh) return;
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox, mid = (bb.min.x + bb.max.x) / 2;
    const [cone, rod] = splitMesh(mesh, (c) => c.x < mid);
    replacePart(stage, 'cone', cone);
    replacePart(stage, 'rod', rod);
  }).catch((e) => console.warn('Photoreceptor model not loaded:', e)).then(() => show());
  return {
    ready,
    home: { pos: V(0, -0.3, 10), target: V(0, -0.3, 0) },
    actions: [
      { icon: '🌑', label: B('Darkness', 'חושך'), radio: true, run: () => { light = 'dark'; show(); } },
      { icon: '🌙', label: B('Dim light', 'אור עמום'), radio: true, run: () => { light = 'dim'; show(); } },
      { icon: '☀️', label: B('Bright light', 'אור חזק'), radio: true, run: () => { light = 'bright'; show(); } },
    ],
  };
}

// ---- The hair cell: an inner hair cell of the cochlea, its hair bundle, and the auditory nerve fibres under it
function hairCellScene(stage, { L, readout }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [7] });
  D('hair', 'Inner hair cell', 'תא שיער פנימי', 'The sensor of hearing. Not a neuron: it has no axon, but it releases glutamate onto the auditory nerve fibres below it. About 3500 in each cochlea, in one row.', 'החיישן של השמיעה. אינו נוירון: אין לו אקסון, אבל הוא משחרר גלוטמט על סיבי עצב השמיעה שמתחתיו. כ-3500 בכל שבלול, בשורה אחת.', '#f472b6');
  D('bundle', 'Hair bundle (stereocilia)', 'צרור השערות (סטריאוציליה)', 'Rows of stiff "hairs" in a staircase, joined at their tips by tip links. Bending toward the tallest row pulls the tip links and opens channels; K⁺ flows in.', 'שורות של "שערות" נוקשות בצורת מדרגות, מחוברות בקצותיהן בקשרי קצה. כיפוף לכיוון השורה הגבוהה מושך את קשרי הקצה ופותח תעלות; K⁺ נכנס.', '#f5c451');
  D('auditory', 'Auditory nerve fibres', 'סיבי עצב השמיעה', 'Each fibre touches one inner hair cell at a ribbon synapse. When the cell releases glutamate the fibre fires, and the auditory nerve carries the sound to the brainstem.', 'כל סיב נוגע בתא שיער פנימי אחד בסינפסת סרט. כשהתא משחרר גלוטמט הסיב יורה, ועצב השמיעה מוביל את הצליל לגזע המוח.', '#fbbf24');
  D('support', 'Supporting cells', 'תאים תומכים', 'They hold the hair cell in place in the organ of Corti, and keep the K⁺-rich fluid above apart from the fluid below.', 'הם מחזיקים את תא השיער במקומו באיבר קורטי, ומפרידים בין הנוזל העשיר ב-K⁺ שמעל לנוזל שמתחת.', '#fde7d9');
  const HX = 0;
  const sup = new THREE.Group();
  for (const s of [-1, 1]) {
    const col = taperTube([V(HX + s * 1.1, -2.6, 0), V(HX + s * 1.05, -1.5, 0.05), V(HX + s * 1.0, -0.5, 0), V(HX + s * 0.92, 0.7, -0.05), V(HX + s * 0.9, 1.65, 0)], 0.42, (t) => 0.75 + 0.2 * Math.sin(Math.PI * t) + 0.06 * Math.sin(t * 19), '#f8c9b8', { opacity: 0.62, rough: 0.5 }, 24, 14);
    col.material.depthWrite = false; sup.add(col);
    const nu = new THREE.Mesh(lumpGeo(V(), 0.2, { seed: s + 3, amp: 0.08, stretch: [0.9, 1.3, 0.9] }), mat('#a16207', { opacity: 0.8 })); nu.position.set(HX + s * 1.08, -1.85, 0.12); sup.add(nu);
    for (let k = 0; k < 3; k++) { const mi = capsule(0.04, 0.14, '#fdba74', { opacity: 0.8 }); mi.position.set(HX + s * (1.0 + (k - 1) * 0.12), -0.7 + k * 0.5, 0.15); mi.rotation.z = s * 0.4; sup.add(mi); }
  }
  const plateTop = new THREE.Mesh(new RoundedBoxGeometry(3.4, 0.1, 1.3, 2, 0.04), mat('#fbcfe8', { opacity: 0.6, rough: 0.4 })); plateTop.material.depthWrite = false; plateTop.position.set(HX, 1.72, 0); sup.add(plateTop);
  sup.add(meshOf([-1.5, -1.1, 1.1, 1.5].map((x) => new THREE.CylinderGeometry(0.012, 0.012, 0.1, 4).translate(HX + x, 1.8, 0.3)), mat('#fde68a'))); // microvilli on the supporting cells' tops
  stage.add(sup, 'support');
  // drawn hair cell (replaced by the real model below)
  { const g = new THREE.Group(); const body = sphere(0.5, '#f472b6'); body.scale.set(0.8, 1.5, 0.8); body.position.y = 0.4; g.add(body); g.position.x = HX; stage.add(g, 'hair'); }
  let bundle = new THREE.Group();
  for (let i = 0; i < 6; i++) { const h = 0.35 + i * 0.12; const c = cyl(0.035, 0.035, h, '#fde68a'); c.position.set(HX - 0.3 + i * 0.12, 1.2 + h / 2, 0); bundle.add(c); }
  stage.add(bundle, 'bundle');
  const boutons = [V(HX - 0.28, -0.95, 0.12), V(HX + 0.05, -1.05, 0.2), V(HX + 0.3, -0.92, 0.08)];
  const audPaths = boutons.map((b, i) => [b, b.clone().add(V((i - 1) * 0.1, -0.5, 0)), V(HX + (i - 1) * 0.35, -1.9, 0.1), V(HX + (i - 1) * 0.5 + 0.2, -2.9, 0)]);
  { const g = new THREE.Group(); for (const [i, p] of audPaths.entries()) { g.add(taperTube(p, 0.045, (t) => 0.7 + t * 0.3, '#fbbf24', undefined, 32, 10)); const b = sphere(0.11, '#facc15'); b.scale.set(1, 0.7, 1); b.position.copy(boutons[i]); g.add(b); } stage.add(g, 'auditory'); }
  const lbl = textSprite(L('↓ auditory nerve', '↓ עצב השמיעה'), { size: 0.3 }); lbl.position.set(HX + 1.9, -2.4, 0); stage.add(lbl);
  // K⁺ entering the tips, glutamate at the base, spikes on the middle fibre
  const kIn = flow(stage, new THREE.CatmullRomCurve3([V(HX + 0.1, 2.9, 0.15), V(HX + 0.05, 2.2, 0.15), V(HX, 1.3, 0.1), V(HX, 0.4, 0.1)]), { color: '#a855f7', count: 12, size: 0.2, speed: 0.5 });
  const gluF = flow(stage, new THREE.CatmullRomCurve3([V(HX + 0.05, -0.8, 0.25), V(HX + 0.05, -1.0, 0.3), V(HX + 0.05, -1.15, 0.25)]), { color: '#f472b6', count: 8, size: 0.14, speed: 0.7 });
  kIn.setActive(false); gluF.setActive(false);
  const train = spikeTrain(stage, () => new THREE.CatmullRomCurve3(audPaths[1]), '#fde047', { speed: 0.6, size: 0.3 });
  let mode = 'rest', t = 0, pivot = null;
  stage.onUpdate((dt) => {
    t += dt;
    const angle = mode === 'sound' ? 0.22 * Math.sin(t * 7) : mode === 'toward' ? 0.25 : mode === 'away' ? -0.25 : 0;
    if (pivot) pivot.rotation.z += (-angle - pivot.rotation.z) * Math.min(1, dt * 8); // + toward the tall row
    const open = mode === 'sound' ? Math.max(0, Math.sin(t * 7)) : mode === 'toward' ? 1 : mode === 'away' ? 0 : 0.1;
    kIn.setActive(open > 0.3); gluF.setActive(open > 0.3);
    train.setRate(mode === 'rest' ? 1 : mode === 'away' ? 0 : open * 16);
  });
  const ready = loadModelGLB('inner-hair-cell').then((obj) => {
    const g = fitModel(obj, 3.0, V(HX, 0.5, 0));
    g.updateMatrixWorld(true);
    const wb = new THREE.Box3().setFromObject(g), y0 = wb.min.y, hh = wb.max.y - wb.min.y || 1, HAIR = 0.86;
    const base = new THREE.Color('#d1588a'), body = new THREE.Color('#f6a9c6'), plate = new THREE.Color('#fbd6e3'), hair = new THREE.Color('#f5c451'), tip = new THREE.Color('#fff1c1');
    const c = new THREE.Color(), p = new THREE.Vector3();
    let mesh = null;
    g.traverse((o) => {
      if (!o.isMesh) return;
      mesh = o;
      o.geometry = o.geometry.clone();
      const pos = o.geometry.attributes.position, col = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const f = (p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).y - y0) / hh;
        if (f > HAIR) c.copy(hair).lerp(tip, Math.min(1, (f - HAIR) / (1 - HAIR)));
        else if (f > HAIR - 0.05) c.copy(body).lerp(plate, (f - HAIR + 0.05) / 0.05);
        else c.copy(base).lerp(body, Math.min(1, f / 0.45));
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      o.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
      o.material = mat('#ffffff', { rough: 0.5 });
      o.material.vertexColors = true;
      o.material.sheen = 0.6; o.material.sheenRoughness = 0.5; o.material.sheenColor = new THREE.Color('#ffd1e1');
    });
    if (!mesh) return;
    // cut the hair bundle off the cell body, so it can bend on its own (pivot at the top of the cell)
    const cut = y0 + hh * HAIR, q = new THREE.Vector3();
    const [hairs, cell] = splitMesh(mesh, (ctr) => q.copy(ctr).applyMatrix4(mesh.matrixWorld).y > cut);
    cell.material = mesh.material.clone(); cell.material.transparent = true; cell.material.opacity = 0.82;
    hairs.material = mesh.material.clone();
    replacePart(stage, 'hair', cell);
    pivot = new THREE.Group(); pivot.position.set(HX, cut, 0);
    hairs.position.sub(pivot.position); pivot.add(hairs);
    replacePart(stage, 'bundle', pivot);
    const inner = new THREE.Group();
    const nuc = sphere(0.3, '#8b5cf6'); nuc.position.set(HX, -0.15, 0); inner.add(nuc);
    for (let i = 0; i < 6; i++) { const m = capsule(0.05, 0.16, '#fb923c'); m.position.set(HX - 0.3 + i * 0.12, 1.15 + (i % 2) * 0.15, (i % 3 - 1) * 0.12); m.rotation.z = (i % 2 ? 1 : -1) * 0.6; inner.add(m); }
    for (const b of boutons) { const r = capsule(0.025, 0.1, '#7c2d12'); r.position.copy(b).add(V(0, 0.16, -0.05)); inner.add(r); for (let k = 0; k < 4; k++) { const v = sphere(0.025, '#fde68a'); v.position.copy(r.position).add(V(Math.cos(k * 1.6) * 0.07, Math.sin(k * 1.6) * 0.05 + 0.02, 0)); inner.add(v); } }
    stage.add(inner, 'hair');
  }).catch((e) => console.warn('Hair cell model not loaded:', e));
  const say = (k) => readout({ rest: L('At rest a few channels are open: the fibre fires slowly.', 'במנוחה כמה תעלות פתוחות: הסיב יורה לאט.'), sound: L('A sound wave rocks the bundle back and forth: channels open on every push toward the tall row, so the fibre fires in time with the sound.', 'גל קול מנדנד את הצרור הלוך ושוב: התעלות נפתחות בכל דחיפה לכיוון השורה הגבוהה, ולכן הסיב יורה בקצב הצליל.'), toward: L('Bent toward the tallest row: tip links pull the channels open, K⁺ rushes in, glutamate is released, the fibre fires fast.', 'כיפוף לכיוון השורה הגבוהה: קשרי הקצה מושכים את התעלות ונפתחות, K⁺ נכנס, גלוטמט משתחרר, הסיב יורה מהר.'), away: L('Bent the other way: the tip links go slack, even the resting channels close, and the fibre falls silent.', 'כיפוף לכיוון השני: קשרי הקצה מתרפים, גם התעלות שהיו פתוחות נסגרות, והסיב משתתק.') }[k]);
  say('rest');
  const set = (k) => () => { mode = k; t = 0; say(k); stage.focus(k === 'rest' ? [] : ['bundle', 'hair', 'auditory']); };
  return {
    ready,
    home: { pos: V(0, 0, 8.5), target: V(0, -0.1, 0) },
    actions: [
      { icon: '🎵', label: B('Play a sound', 'השמעת צליל'), radio: true, run: set('sound') },
      { icon: '➡️', label: B('Bend toward the tall row', 'כיפוף לכיוון השורה הגבוהה'), radio: true, run: set('toward') },
      { icon: '⬅️', label: B('Bend the other way', 'כיפוף לכיוון השני'), radio: true, run: set('away') },
      { icon: '⏸️', label: B('Rest', 'מנוחה'), radio: true, run: set('rest') },
    ],
  };
}

// ---------------------------------------------------------------- scene: real reconstructed neurons (NeuroMorpho.Org)
const REAL = [
  ['pyramidal', 'Pyramidal neuron (human cortex)', 'נוירון פירמידלי (קליפת מוח אנושית)', 'A real layer-5 pyramidal cell from the human frontal cortex: a triangular soma, a long apical dendrite reaching toward the surface and basal dendrites around the soma.', 'תא פירמידלי אמיתי משכבה 5 בקליפה המצחית של אדם: גוף תא משולש, דנדריט אפיקלי ארוך שמגיע לכיוון פני השטח ודנדריטים בסיסיים סביב גוף התא.', '#8b5cf6'],
  ['purkinje', 'Purkinje cell (cerebellum)', 'תא פורקינייה (מוח קטן)', 'A huge, flat fan of dendrites that receives input from up to ~200,000 parallel fibres — the only output neuron of the cerebellar cortex.', 'מניפה ענקית ושטוחה של דנדריטים שמקבלת קלט מעד כ-200,000 סיבים מקבילים — נוירון הפלט היחיד של קליפת המוח הקטן.', '#e11d48'],
  ['granule', 'Granule cell (hippocampus)', 'תא גרגיר (היפוקמפוס)', 'A small neuron of the dentate gyrus — one of the few places where new neurons are still born in adults.', 'נוירון קטן של הגירוס המשונן — אחד המקומות הבודדים שבהם נוירונים חדשים עדיין נולדים אצל מבוגרים.', '#14b8a6'],
  ['motor', 'Motor neuron (spinal cord)', 'נוירון מוטורי (חוט השדרה)', 'An alpha motor neuron with very long dendrites spreading through the spinal grey matter; its axon (not shown) runs all the way to a muscle.', 'נוירון מוטורי אלפא עם דנדריטים ארוכים מאוד שמתפשטים בחומר האפור של חוט השדרה; האקסון שלו (לא מוצג) רץ עד לשריר.', '#5b8def'],
  ['basket', 'Basket cell (inhibitory interneuron)', 'תא סל (נוירון ביניים מעכב)', 'An inhibitory GABA interneuron whose axon (orange) wraps "baskets" around the cell bodies of other neurons.', 'נוירון ביניים מעכב (GABA) שהאקסון שלו (כתום) עוטף "סלים" סביב גופי התאים של נוירונים אחרים.', '#f59e0b'],
  ['astrocyte', 'Astrocyte (glial cell)', 'אסטרוציט (תא גליה)', 'A real star-shaped glial cell: its fine processes touch synapses and blood vessels.', 'תא גליה אמיתי בצורת כוכב: השלוחות הדקות שלו נוגעות בסינפסות ובכלי דם.', '#a78bfa'],
];
function realNeuronsScene(stage, { L, readout }) {
  const SHORT_NAMES = { pyramidal: ['Pyramidal', 'פירמידלי'], purkinje: ['Purkinje', 'פורקינייה'], granule: ['Granule', 'גרגיר'], motor: ['Motor neuron', 'נוירון מוטורי'], basket: ['Basket', 'סל'], astrocyte: ['Astrocyte', 'אסטרוציט'] };
  const CHOICES = REAL.map(([id]) => ({ id, label: B(...SHORT_NAMES[id]) }));
  const nameOf = (id) => { const p = stage.parts.get(id); return p ? L(p.name.en, p.name.he) : id; };
  REAL.forEach(([id, en, he, den, dhe, color]) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3] }));
  const items = [];
  const SIZE = 3.4; // display height of each cell when normalised
  const TRUE = 0.006; // scene units per micrometre in "true relative size" mode
  const ready = Promise.all(REAL.map(([id]) => neuronData(id))).then((all) => {
    all.forEach((d, i) => {
      const [id, en, he, , , color] = REAL[i];
      const glia = id === 'astrocyte';
      // branches must stay visible after the cell is shrunk to the display size: minimum radius ∝ cell size
      const ext = Math.max(...[0, 1].map((k) => Math.max(...d.points.map((p) => p[k])) - Math.min(...d.points.map((p) => p[k]))));
      const { group } = buildNeuron(d, { scale: 1, minRadius: Math.max(0.5, ext / 260), glia, colors: glia ? { 1: '#a78bfa', 2: '#a78bfa', 3: '#a78bfa', 4: '#a78bfa', 7: '#a78bfa' } : { 1: color, 2: '#f59e0b', 3: color, 4: color } });
      const box = new THREE.Box3().setFromObject(group);
      const size = box.getSize(new THREE.Vector3());
      const c = box.getCenter(new THREE.Vector3());
      group.position.sub(c); // centre the cell in its holder
      const cell = new THREE.Group();
      cell.add(group);
      const norm = SIZE / Math.max(size.x, size.y);
      cell.scale.setScalar(norm);
      const holder = new THREE.Group();
      holder.add(cell);
      // a short name tag (the full name shows when the cell is tapped): long tags were wider than the cells and
      // overlapped in "true relative size" and were cut off in "compare"
      const SHORT = SHORT_NAMES[id] || [en, he];
      const label = textSprite(L(SHORT[0], SHORT[1]), { size: 0.4, color: '#ffffff', bg: 'rgba(30,40,60,.85)' });
      label.position.y = -SIZE / 2 - 0.45;
      holder.add(label);
      stage.add(holder, id);
      items.push({ id, cell, label, norm, size: size.clone() });
    });
    stage.arrange(REAL.map((r) => r[0]), { cols: 3, gap: 0.9 });
    stage.resetView();
  });
  let trueSize = false;
  // True size: a grid gives every cell a slot as wide as the biggest one (the motor neuron), which threw the small
  // cells out to the edges of the screen (owner, 2026-11-15). Instead they stand in one row, biggest to smallest,
  // each taking only its own width, bottoms on one line, and the camera frames the whole row.
  const lineup = () => {
    const GAP = 0.35;
    const row = items.map((it) => ({ it, roots: stage.partRoots(it.id), box: stage.partBox(it.id, true) }))
      .filter((x) => !x.box.isEmpty())
      .sort((a, b) => b.box.getSize(V()).y - a.box.getSize(V()).y);
    const total = row.reduce((s, x) => s + x.box.getSize(V()).x, 0) + GAP * (row.length - 1);
    let x = -total / 2;
    const all = new THREE.Box3();
    row.forEach((r, i) => {
      // tags under the row, on two alternating heights so neighbours do not overlap
      r.it.label.position.set(0, -(r.it.size.y * TRUE) / 2 - 0.45 - (i % 2) * 0.7, 0);
    });
    for (const r of row) {
      const sz = r.box.getSize(V());
      const target = V(x + sz.x / 2, sz.y / 2 - 1, 0); // bottoms on y = −1
      const delta = target.sub(r.box.getCenter(V()));
      r.roots.forEach((o) => o.position.add(o.parent.worldToLocal(o.getWorldPosition(V()).add(delta)).sub(o.position)));
      all.union(r.box.clone().translate(delta));
      x += sz.x + GAP;
    }
    all.min.y -= 1.6; // room for the name tags under the row
    const f = stage.frameBox(all, V(0, 0, 1), 1.3);
    stage.animateCamera(f.target, f.position, 0.9);
  };
  const setTrue = (on) => {
    trueSize = on;
    for (const it of items) {
      const k = on ? TRUE : it.norm;
      it.cell.scale.setScalar(k);
      it.label.position.y = -(it.size.y * k) / 2 - 0.45;
    }
    if (on) { lineup(); return; }
    stage.arrange(REAL.map((r) => r[0]), { cols: 3, gap: 0.9 });
    stage.resetView();
  };
  return {
    ready,
    home: { pos: V(0, 0, 16), target: V(0, 0, 0) },
    actions: [
      { icon: '📏', label: B('True relative size', 'גודל יחסי אמיתי'), toggle: true, caption: B('All cells drawn at the same scale: the motor neuron\'s dendrites span about 1–2 mm, while a granule cell is only about 0.2 mm tall.', 'כל התאים מצוירים באותו קנה מידה: הדנדריטים של הנוירון המוטורי משתרעים על פני כ-1–2 מ"מ, בעוד שתא גרגיר גבוה רק כ-0.2 מ"מ.'), run: (on) => setTrue(on) },
      // owner, 2026-11-15: let the user choose which cell to see, and which two to compare (a row of choices opens)
      { icon: '🔍', label: B('See one cell alone', 'תא אחד לבד'), caption: B('Choose a cell from the list to see it on its own. (You can also tap any cell, then "More about it".)', 'בחרו תא מהרשימה כדי לראות אותו לבד. (אפשר גם להקיש על תא ואז "עוד על זה".)'), choose: { n: 1, options: CHOICES, run: (id) => { stage.isolate(id); readout(`🔍 ${nameOf(id)}`); } } },
      { icon: '⚖️', label: B('Compare two cells', 'השוואה בין שני תאים'), caption: B('Choose any two cells to put them side by side. Interesting pairs: pyramidal and Purkinje, motor neuron and granule cell, basket cell and astrocyte. Turn on "True relative size" first to compare their real sizes.', 'בחרו שני תאים כלשהם כדי להציב אותם זה לצד זה. זוגות מעניינים: פירמידלי ופורקינייה, נוירון מוטורי ותא גרגיר, תא סל ואסטרוציט. הפעילו קודם "גודל יחסי אמיתי" כדי להשוות את הגדלים האמיתיים.'), choose: { n: 2, options: CHOICES, run: ([x, y]) => { stage.compare(x, y, { layout: 'side' }); readout(`⚖️ ${nameOf(x)} · ${nameOf(y)}`); } } },
    ],
  };
}

// ---------------------------------------------------------------- scene 4: synapse drug lab
function synapseScene(stage, { say, readout, L }) {
  const D = (id, en, he, den, dhe, color, extra = {}) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3, 4], ...extra });
  D('terminal', 'Presynaptic terminal', 'כפתור פרה-סינפטי', 'The end of the axon. An arriving action potential opens Ca²⁺ channels (purple, in the active zone), triggering release. Dense projections (dark pegs) line up the vesicles at the active zone; mitochondria supply the ATP.', 'קצה האקסון. פוטנציאל פעולה שמגיע פותח תעלות Ca²⁺ (סגולות, באזור הפעיל) ומפעיל שחרור. בליטות צפופות (יתדות כהות) מסדרות את השלפוחיות באזור הפעיל; המיטוכונדריות מספקות את ה-ATP.', '#e8a598');
  D('vesicles', 'Synaptic vesicles', 'שלפוחיות סינפטיות', 'Little bubbles full of neurotransmitter, released by exocytosis.', 'בועות קטנות מלאות מוליך עצבי, המשתחררות באקסוציטוזה.', '#f08a7a', { link: { href: '#/explore/organelle/vesicles', label: B('Zoom in: exocytosis', 'זום פנימה: אקסוציטוזה') } });
  D('receptors', 'Receptors', 'קולטנים', 'Proteins on the next cell that the neurotransmitter binds to, creating EPSPs or IPSPs. Here, ion-channel receptors of five subunits, held in the postsynaptic density.', 'חלבונים בתא הבא שהמוליך העצבי נקשר אליהם ויוצר EPSP או IPSP. כאן, קולטנים שהם תעלות יונים בנויות מחמש יחידות, המוחזקים בצפיפות הפוסט-סינפטית.', '#3cb37a', { link: { href: '#/explore/macromolecule/receptors', label: B('Zoom in: receptor proteins', 'זום פנימה: חלבוני קולטן') } });
  D('transporter', 'Reuptake transporter', 'מוביל לספיגה חוזרת', 'Pumps neurotransmitter back into the terminal to end the signal. Blocked by SSRIs and cocaine.', 'שואב את המוליך העצבי בחזרה לכפתור כדי לסיים את האות. נחסם על ידי SSRI וקוקאין.', '#f2c14e');
  D('astro', 'Astrocyte process', 'שלוחת אסטרוציט', 'A thin sheet of an astrocyte (a glial cell) that wraps the synapse: it soaks up neurotransmitter that spills out of the cleft and recycles it, so the signal stays short and local. Together with the two neurons it forms the "tripartite synapse".', 'יריעה דקה של אסטרוציט (תא גליה) שעוטפת את הסינפסה: היא סופגת מוליך עצבי שגולש מהמרווח וממחזרת אותו, כך שהאות נשאר קצר ומקומי. יחד עם שני הנוירונים היא יוצרת את "הסינפסה המשולשת".', '#62b6cb');
  D('postsyn', 'Postsynaptic cell', 'התא הפוסט-סינפטי', 'The receiving neuron (or muscle). When transmitter opens its receptors, Na⁺ ions (yellow) rush in, the spine lights up and a small voltage change (an EPSP) spreads along the dendrite toward the cell body. Inside the spine: the dense scaffold under the receptors (postsynaptic density), actin (thin red threads) and the stacked spine apparatus in the neck.', 'הנוירון (או השריר) המקבל. כשהמוליך פותח את הקולטנים שלו, יוני Na⁺ (צהובים) נכנסים פנימה, הקוץ נדלק ושינוי מתח קטן (EPSP) מתפשט לאורך הדנדריט אל גוף התא. בתוך הקוץ: הפיגום הצפוף שמתחת לקולטנים (הצפיפות הפוסט-סינפטית), אקטין (חוטים אדומים דקים) ומנגנון הקוץ המדורג בצוואר.', '#9fd3b5');
  D('adhesion', 'Adhesion proteins', 'חלבוני הידבקות', 'Pairs of proteins (neurexin on the terminal, neuroligin on the spine) that reach across the cleft and hold the two cells together, lining up release sites with receptors.', 'זוגות חלבונים (נאורקסין בכפתור, נאורוליגין בקוץ) שמושטים מעל המרווח ומחזיקים את שני התאים יחד, כך שאתרי השחרור מתיישרים מול הקולטנים.', '#c084fc');
  // ---- drawn like a textbook synapse (owner, 2026-11-15: better-looking models; no usable model exists online). The
  // cleft runs from y = 0.45 (presynaptic membrane) down to y = −0.4 (postsynaptic membrane).
  const lathe = (pts, color, o) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64), mat(color, o));
  // presynaptic terminal: a bulb at the end of the axon, flat where it faces the cleft (the active zone); an inner
  // skin, a shade lighter, gives the membrane its thickness
  const termPts = [[0.01, 0.45], [1.1, 0.45], [1.75, 0.6], [2.05, 1.1], [2.0, 1.8], [1.6, 2.5], [0.9, 3.0], [0.45, 3.4], [0.36, 4.6]];
  const term = lathe(termPts, '#e8a598', { opacity: 0.32, side: THREE.DoubleSide, rough: 0.35 });
  term.material.depthWrite = false;
  stage.add(term, 'terminal');
  const termIn = lathe(termPts.map(([r, y]) => [Math.max(0.01, r - 0.06), y + (y < 0.5 ? 0.05 : 0)]), '#f6cfc5', { opacity: 0.18, side: THREE.BackSide });
  termIn.material.depthWrite = false;
  stage.add(termIn, 'terminal');
  const az = cyl(1.05, 1.05, 0.04, '#7c2d12', { opacity: 0.55 }); az.position.y = 0.48; stage.add(az, 'terminal'); // the active zone
  const pegs = [];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3, r = i % 2 ? 0.55 : 0.85; const c = new THREE.ConeGeometry(0.09, 0.22, 6); c.translate(Math.cos(a) * r, 0.62, Math.sin(a) * r); pegs.push(c); }
  stage.add(meshOf(pegs, mat('#7c2d12', { rough: 0.6 })), 'terminal'); // dense projections
  const caCh = [[-0.95, 0.3], [0.95, -0.3], [0, 0.95], [0.1, -0.95]].map(([x, z]) => { const ch = ionChannel(stage, { kind: 'nav', color: '#a855f7' }); ch.g.scale.setScalar(0.13); ch.g.position.set(x, 0.47, z); stage.add(ch.g, 'terminal'); return ch; }); // Ca²⁺ channels
  for (const [x, y, rz] of [[-0.95, 2.15, 0.5], [0.75, 2.55, -0.8]]) { const mi = mitochondrion({ len: 0.6, r: 0.22, color: '#f97316' }); mi.position.set(x, y, 0.1); mi.rotation.z = rz; stage.add(mi, 'terminal'); }
  // microtubules bring vesicles down the axon
  stage.add(meshOf([0.12, -0.12].map((dx) => new THREE.CylinderGeometry(0.025, 0.025, 1.7, 6).translate(dx, 3.55, dx)), mat('#fde68a', { opacity: 0.7 })), 'terminal');
  // vesicles: a reserve pool above and a few docked at the active zone (these fuse at each release)
  const ves = new THREE.Group();
  const docked = [];
  for (let i = 0; i < 22; i++) {
    const dock = i < 5;
    const p = dock ? V(-0.8 + i * 0.4, 0.73, (i % 2 ? 0.25 : -0.25)) : V(rand(-1.3, 1.3), rand(1.0, 2.0), rand(-0.9, 0.9));
    const v = vesicleModel(0.2, { color: '#f9a8d4', cargo: '#ff5fa2', seed: i + 1, beads: 9 });
    v.position.copy(p); ves.add(v);
    if (dock) docked.push(v);
  }
  stage.add(ves, 'vesicles');
  // postsynaptic side: a mushroom-shaped dendritic spine on a dendrite
  const spinePts = [[0.01, -0.4], [1.2, -0.4], [1.75, -0.6], [1.7, -1.05], [1.0, -1.35], [0.38, -1.6], [0.32, -2.4], [0.5, -2.75]];
  const spine = lathe(spinePts, '#9fd3b5', { opacity: 0.4, side: THREE.DoubleSide, rough: 0.35 });
  spine.material.depthWrite = false;
  stage.add(spine, 'postsyn');
  const spineIn = lathe(spinePts.map(([r, y]) => [Math.max(0.01, r - 0.06), y - (y > -0.45 ? 0.05 : 0)]), '#d1fae5', { opacity: 0.16, side: THREE.BackSide });
  spineIn.material.depthWrite = false;
  stage.add(spineIn, 'postsyn');
  const dend = tube([V(-3.4, -3.15, 0), V(0, -3.0, 0), V(3.4, -3.2, 0)], 0.6, '#9fd3b5', { opacity: 0.45 });
  dend.material.depthWrite = false; stage.add(dend, 'postsyn');
  // postsynaptic density: a dense mat of scaffold proteins under the receptors (under 0.5 opacity: it must not hide
  // the receptors' zoom-in dot)
  const psd = [];
  for (let k = 0; k < 46; k++) { const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 1.1; psd.push(new THREE.SphereGeometry(rand(0.05, 0.08), 8, 6).translate(Math.cos(a) * r, -0.55 - rand(0, 0.08), Math.sin(a) * r)); }
  stage.add(meshOf(psd, mat('#14532d', { opacity: 0.45 })), 'postsyn');
  // actin in the spine head, and the spine apparatus (stacked sacs) in its neck
  const act = [];
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; act.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(Math.cos(a) * 0.25, -2.3, Math.sin(a) * 0.15), V(Math.cos(a) * 0.6, -1.3, Math.sin(a) * 0.5), V(Math.cos(a + 0.4) * 1.1, -0.75, Math.sin(a + 0.4) * 0.9)]), 16, 0.012, 4, false)); }
  stage.add(meshOf(act, mat('#dc2626', { opacity: 0.6 })), 'postsyn');
  stage.add(meshOf([-1.75, -1.95, -2.15].map((y) => new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16).translate(0, y, 0)), mat('#a7f3d0', { opacity: 0.8 })), 'postsyn');
  // receptors: five-subunit ion channels in the postsynaptic membrane (src/visual/proteins.js)
  const recPos = [-1.2, -0.4, 0.4, 1.2].map((x) => V(x, -0.5, rand(-0.5, 0.5)));
  const recs = recPos.map((p, i) => { const rc = pentamer(stage, { colors: ['#3cb37a', '#6ee7b7', '#3cb37a', '#22c55e', '#a7f3d0'] }); rc.g.scale.setScalar(0.19); rc.g.position.set(p.x, -0.42, p.z); rc.g.rotation.y = i * 1.3; rc.mats = []; rc.g.traverse((o) => { if (o.isMesh) rc.mats.push(o.material); }); stage.add(rc.g, 'receptors'); return rc; });
  // adhesion proteins bridging the cleft
  const adh = [];
  for (const [x, z] of [[-1.55, 0.35], [1.55, -0.25], [-0.2, 1.05], [0.6, -1.0]]) { adh.push(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6).translate(x, 0.24, z), new THREE.CylinderGeometry(0.035, 0.035, 0.42, 6).translate(x + 0.03, -0.19, z), new THREE.SphereGeometry(0.06, 8, 6).translate(x + 0.015, 0.03, z)); }
  stage.add(meshOf(adh, mat('#c084fc', { rough: 0.45 })), 'adhesion');
  // reuptake transporters, in the presynaptic membrane beside the active zone (the drawn transporter, small)
  const transG = new THREE.Group();
  const trs = [1, -1].map((s) => { const tr = transporterModel({ color: '#f2c14e' }); tr.g.scale.setScalar(0.24); tr.g.position.set(s * 1.75, 0.62, 0); tr.g.rotation.z = s * 0.6; tr.pose(1); if (s > 0) tr.g.traverse((o) => { if (o.isMesh) o.userData.dot = true; }); transG.add(tr.g); return tr; }); // the zoom-in dot sits on the right one, not between the two
  stage.add(transG, 'transporter');
  const trans = transG.children[0];
  // an astrocyte process wraps the synapse (the "tripartite synapse"): a thin curved sheet beside the cleft
  const astro = new THREE.Mesh(sheetGeo((u, v) => { const y = 2.2 - u * 4.3, a = -1.0 + v * 1.55, r = 2.45 + 0.25 * Math.cos(u * Math.PI * 2) - 0.35 * Math.exp(-((y - 0.0) ** 2) * 2); return V(Math.cos(a) * r, y, Math.sin(a) * r * 0.8 - 0.55); }, 40, 10), mat('#62b6cb', { opacity: 0.42, side: THREE.DoubleSide, rough: 0.4 }));
  astro.material.depthWrite = false; stage.add(astro, 'astro');
  // the blocking drug: a small cluster of white dots plugging the transporter's mouth (owner: simple dots, not a molecule)
  const block = new THREE.Group();
  for (const [x, y, z] of [[0, 0.1, 0], [0.12, -0.04, 0.06], [-0.1, -0.06, -0.05]]) { const d = sphere(0.1, '#f8fafc'); d.position.set(x, y, z); block.add(d); }
  block.position.copy(trans.position).add(V(-0.12, -0.12, 0.15));
  block.visible = false;
  stage.root.add(block);
  const block2 = block.clone(); block2.position.copy(transG.children[1].position).add(V(0.12, -0.12, 0.15)); stage.root.add(block2);
  // labels
  for (const [p, en, he] of [[V(-2.9, 2.6, 0), 'axon terminal', 'כפתור האקסון'], [V(-2.9, 0.05, 0), 'synaptic cleft', 'המרווח הסינפטי'], [V(-2.9, -1.4, 0), 'dendritic spine', 'קוץ דנדריטי']]) { const tl = textSprite(L(en, he), { size: 0.3 }); tl.position.copy(p); stage.root.add(tl); }
  let fuse = 0; // 1 → 0 after each release: the docked vesicles merge into the membrane, then refill
  stage.onUpdate((dt) => { fuse = Math.max(0, fuse - dt * 1.4); docked.forEach((v) => { const k = mode === 'release' ? 1 : 1 - Math.sin(Math.min(1, fuse) * Math.PI) * 0.9; v.scale.setScalar(Math.max(0.1, k)); }); block2.visible = block.visible; caCh.forEach((ch) => ch.set(fuse > 0.55)); });

  // Neurotransmitter particles
  const N = 160;
  const pos = new Float32Array(N * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dots = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ff5fa2', size: 0.13, map: dotTexture(), transparent: true, depthWrite: false }));
  stage.root.add(dots);
  const drugGeo = new THREE.BufferGeometry();
  const drugPos = new Float32Array(40 * 3);
  drugGeo.setAttribute('position', new THREE.BufferAttribute(drugPos, 3));
  const drugDots = new THREE.Points(drugGeo, new THREE.PointsMaterial({ color: '#f59e0b', size: 0.16, map: dotTexture(), transparent: true, depthWrite: false }));
  stage.root.add(drugDots);
  // the postsynaptic response: Na⁺ ions (yellow) pour in through open receptors, the spine glows, and EPSP pulses
  // run down the spine neck and along the dendrite toward the cell body (owner, 2026-11-15: show what the cell does)
  const NA = 90, naPos = new Float32Array(NA * 3).fill(-100);
  const naGeo = new THREE.BufferGeometry(); naGeo.setAttribute('position', new THREE.BufferAttribute(naPos, 3));
  stage.add(new THREE.Points(naGeo, new THREE.PointsMaterial({ color: '#fde047', size: 0.1, map: dotTexture(), transparent: true, depthWrite: false })), 'postsyn');
  let na = [];
  const pulses = [];
  for (let k = 0; k < 6; k++) { const g = glowSprite('#4ade80', 0.9); g.visible = false; stage.root.add(g); pulses.push({ g, t: 1, dir: k % 2 ? 1 : -1 }); }
  let pulseClock = 0, astroGlow = 0, transGlow = 0;
  let mode = 'normal';
  let parts = [];
  let t = 0, activation = 0;
  const release = () => { if (mode === 'release') return; fuse = 1; for (let k = 0; k < 18; k++) parts.push({ p: V(rand(-0.9, 0.9), 0.45, rand(-0.6, 0.6)), v: V(rand(-0.3, 0.3), -rand(0.4, 0.8), rand(-0.3, 0.3)), bound: 0, life: 0 }); };
  stage.onUpdate((dt) => {
    t += dt;
    if (Math.floor(t / 1.6) !== Math.floor((t - dt) / 1.6)) release();
    let active = 0;
    const life = mode === 'reuptake' ? 9 : 3.2;
    parts = parts.filter((d) => d.life < life);
    for (const d of parts) {
      d.life += dt;
      if (d.bound > 0) { d.bound -= dt; active++; if (d.bound <= 0) d.v.set(rand(-0.3, 0.3), 0.5, rand(-0.3, 0.3)); continue; }
      d.p.addScaledVector(d.v, dt);
      // reuptake: near a transporter's mouth the transmitter is pulled back into the terminal (unless blocked)
      if (mode !== 'reuptake' && d.life > 0.9 && Math.abs(d.p.x) > 1.45 && d.p.y > 0.15) { d.life = 99; transGlow = 1; continue; }
      // spill-over toward the astrocyte side is soaked up by the astrocyte
      if (d.p.x > 2.0 && d.life > 0.6 && mode !== 'reuptake') { d.life = 99; astroGlow = 1; continue; }
      if (d.p.y < -0.4) {
        const near = recPos.some((r) => Math.abs(r.x - d.p.x) < 0.3);
        if (near && mode !== 'antagonist') { d.bound = 0.8; d.p.y = -0.3; } else d.v.y = Math.abs(d.v.y) * 0.6;
      }
      if (d.p.y > 0.45) d.v.y = -Math.abs(d.v.y) * 0.6;
      if (Math.abs(d.p.x) > 2.2) d.v.x *= -1;
      if (Math.abs(d.p.z) > 1.3) d.v.z *= -1;
    }
    for (let k = 0; k < N; k++) {
      const d = parts[k];
      if (d) { pos[k * 3] = d.p.x; pos[k * 3 + 1] = d.p.y; pos[k * 3 + 2] = d.p.z; } else { pos[k * 3 + 1] = -100; }
    }
    geo.attributes.position.needsUpdate = true;
    // Agonist molecules sit on receptors and activate them too
    for (let k = 0; k < 40; k++) {
      const r = recPos[k % recPos.length];
      const on = (mode === 'agonist' || mode === 'antagonist') && k < 8;
      drugPos[k * 3] = on ? r.x + Math.sin(t * 3 + k) * 0.08 : 0;
      drugPos[k * 3 + 1] = on ? r.y + 0.28 : -100;
      drugPos[k * 3 + 2] = on ? r.z : 0;
    }
    drugGeo.attributes.position.needsUpdate = true;
    if (mode === 'agonist') active += 6;
    activation += (Math.min(100, active * 6) - activation) * Math.min(1, dt * 3);
    recs.forEach((rc) => { rc.set(mode !== 'antagonist' && activation > 25); rc.mats.forEach((m) => m.emissive.set(mode === 'antagonist' ? '#000' : '#3cb37a').multiplyScalar(activation / 140)); });
    block.visible = mode === 'reuptake';
    // Na⁺ influx through the open receptors, in proportion to how many are activated
    const want = (activation / 100) * 40 * dt;
    for (let k = 0; k < want + (Math.random() < want % 1 ? 1 : 0) && na.length < NA; k++) { const r = recPos[(Math.random() * 4) | 0]; na.push({ p: V(r.x + rand(-0.1, 0.1), -0.1, r.z + rand(-0.1, 0.1)), v: V(rand(-0.25, 0.25), -rand(0.7, 1.1), rand(-0.25, 0.25)) }); }
    na = na.filter((q) => q.p.y > -1.5);
    for (let k = 0; k < NA; k++) { const q = na[k]; if (q) { q.p.addScaledVector(q.v, dt); naPos.set([q.p.x, q.p.y, q.p.z], k * 3); } else naPos[k * 3 + 1] = -100; }
    naGeo.attributes.position.needsUpdate = true;
    // the spine lights up, and EPSP pulses travel down the neck and along the dendrite
    spine.material.emissive.set('#22c55e').multiplyScalar(activation / 160);
    dend.material.emissive.set('#22c55e').multiplyScalar(activation / 400);
    pulseClock += dt;
    if (activation > 15 && pulseClock > 0.5) { pulseClock = 0; for (const dir of [1, -1]) { const q = pulses.find((x) => x.t >= 1); if (q) { q.t = 0; q.dir = dir; q.k = activation / 100; } } }
    for (const q of pulses) {
      q.t = Math.min(1, q.t + dt * 0.55); q.g.visible = q.t < 1;
      if (!q.g.visible) continue;
      const a = q.t < 0.3 ? q.t / 0.3 : 1; // down the neck first, then sideways along the dendrite
      q.g.position.set(q.t < 0.3 ? 0 : q.dir * (q.t - 0.3) / 0.7 * 3.3, q.t < 0.3 ? -1.2 - a * 1.8 : -3.05, 0.2);
      q.g.material.opacity = (0.35 + 0.65 * q.k) * (1 - q.t * 0.7); q.g.scale.setScalar(0.5 + q.k * 0.7);
    }
    astroGlow = Math.max(0, astroGlow - dt * 1.5); transGlow = Math.max(0, transGlow - dt * 2);
    astro.material.emissive.set('#62b6cb').multiplyScalar(astroGlow * 0.6);
    trs.forEach((tr) => tr.mats.forEach((m) => m.emissive.set('#f2c14e').multiplyScalar(mode === 'reuptake' ? 0 : transGlow * 0.6)));
    const mv = (activation / 100) * 18;
    readout(`${L('Receptor activation', 'הפעלת קולטנים')}: <b>${activation.toFixed(0)}%</b> ${'▮'.repeat(Math.round(activation / 10))} · ${L('EPSP in the next cell', 'EPSP בתא הבא')}: <b>+${mv.toFixed(1)} mV</b>`);
  });
  const M = (id, icon, en, he, cen, che) => ({ icon, label: B(en, he), radio: true, caption: B(cen, che), run: () => { mode = id; } });
  return {
    home: { pos: V(0.4, 0.9, 11.5), target: V(0, 0.4, 0) },
    actions: [
      M('normal', '🟢', 'Normal', 'רגיל', 'Neurotransmitter (pink) is released, binds the receptors briefly — Na⁺ (yellow) rushes into the spine and a small EPSP (green pulses) runs toward the cell body — then the transporters (yellow, they flash) and the astrocyte (blue) clear it away.', 'מוליך עצבי (ורוד) משתחרר ונקשר לקולטנים לזמן קצר — Na⁺ (צהוב) נכנס לקוץ ו-EPSP קטן (פולסים ירוקים) רץ אל גוף התא — ואז המובילים (צהובים, מהבהבים) והאסטרוציט (כחול) מפנים אותו.'),
      M('agonist', '🟠', 'Agonist (nicotine)', 'אגוניסט (ניקוטין)', 'The drug (orange) itself activates the receptors — a stronger signal.', 'הסם (כתום) עצמו מפעיל את הקולטנים — אות חזק יותר.'),
      M('antagonist', '🔴', 'Antagonist (curare)', 'אנטגוניסט (קורארה)', 'The drug sits on the receptors and blocks them; neurotransmitter bounces off — no signal.', 'הסם יושב על הקולטנים וחוסם אותם; המוליך העצבי ניתז — אין אות.'),
      M('reuptake', '🟡', 'Reuptake blocker (SSRI, cocaine)', 'חוסם ספיגה חוזרת (SSRI, קוקאין)', 'The drug (white dots) plugs the transporters, so neurotransmitter lingers in the cleft and keeps the receptors busy — a longer, stronger response in the next cell.', 'הסם (נקודות לבנות) פוקק את המובילים, ולכן המוליך העצבי נשאר במרווח וממשיך להפעיל את הקולטנים — תגובה ארוכה וחזקה יותר בתא הבא.'),
      M('release', '⚫', 'Release blocker (Botox)', 'חוסם שחרור (בוטוקס)', 'Vesicles cannot release their contents — no neurotransmitter, no signal (paralysis).', 'השלפוחיות לא מצליחות לשחרר — אין מוליך עצבי, אין אות (שיתוק).'),
    ],
  };
}

export default {
  id: 'cell',
  scenes: [
    { id: 'neuron', icon: '🌿', name: B('The neuron', 'הנוירון'), chapters: [3], intro: B('A neuron receives signals on its dendrites, adds them up in the cell body, and — if the axon hillock reaches threshold — sends an all-or-none action potential down its axon. Try the buttons below; click any part to learn about it.', 'נוירון מקבל אותות בדנדריטים, מסכם אותם בגוף התא, ו — אם גבעת האקסון מגיעה לסף — שולח פוטנציאל פעולה מסוג "הכול או לא כלום" לאורך האקסון. נסו את הכפתורים למטה; לחצו על כל חלק כדי ללמוד עליו.'), build: neuronScene },
    { id: 'glia', icon: '⭐', name: B('Glia', 'תאי גליה'), chapters: [3], intro: B('The four kinds of glia in the brain and spinal cord, each in its own corner: astrocytes, oligodendrocytes, microglia and ependymal cells. Tap a dot to zoom into one of them.', 'ארבעת סוגי הגליה במוח ובחוט השדרה, כל אחד בפינה משלו: אסטרוציטים, אוליגודנדרוציטים, מיקרוגליה ותאי אפנדימה. הקישו על נקודה כדי להתקרב לאחד מהם.'), build: gliaScene },
    { id: 'astrocyte', icon: '✳️', name: B('An astrocyte', 'אסטרוציט'), chapters: [3], intro: B('One astrocyte, between a blood vessel and a synapse: it feeds neurons, clears away glutamate and signals with calcium waves.', 'אסטרוציט אחד, בין כלי דם לסינפסה: הוא מזין נוירונים, מפנה גלוטמט ומאותת בגלי סידן.'), build: astrocyteScene },
    { id: 'oligo', icon: '🌀', name: B('An oligodendrocyte', 'אוליגודנדרוציט'), chapters: [3], intro: B('One oligodendrocyte myelinates segments of several axons. Race a myelinated axon against a bare one, then see what multiple sclerosis does.', 'אוליגודנדרוציט אחד יוצר מיאלין על מקטעים של כמה אקסונים. ערכו מרוץ בין אקסון עם מיאלין לאקסון חשוף, ואז ראו מה טרשת נפוצה עושה.'), build: oligoScene },
    { id: 'microglia', icon: '🛡️', name: B('Microglia', 'מיקרוגליה'), chapters: [3], intro: B('The brain\'s own immune cell: watch it patrol, then respond to an injury.', 'תא החיסון של המוח עצמו: צפו בו מסייר, ואז מגיב לפגיעה.'), build: microgliaScene },
    { id: 'ependymal', icon: '🌊', name: B('Ependymal cells', 'תאי אפנדימה'), chapters: [2, 3], intro: B('The lining of the brain\'s ventricles: beating cilia move the cerebrospinal fluid, and the choroid plexus makes it.', 'הריפוד של חדרי המוח: ריסים מכים מניעים את נוזל המוח והשדרה, והמקלעת הכורואידית מייצרת אותו.'), build: ependymalScene },
    { id: 'schwann', icon: '🧈', name: B('Schwann cells', 'תאי שוואן'), chapters: [2, 3], intro: B('The myelin of the body\'s nerves: each Schwann cell wraps one segment of one axon, and helps a cut nerve regrow.', 'המיאלין של עצבי הגוף: כל תא שוואן עוטף מקטע אחד של אקסון אחד, ועוזר לעצב חתוך לצמוח מחדש.'), build: schwannScene },
    { id: 'real', icon: '🔬', name: B('Real neurons', 'נוירונים אמיתיים'), chapters: [3], intro: B('Real neurons traced under the microscope. Use the buttons below to see one cell alone or to compare two (or tap a cell, then "More about it").', 'נוירונים אמיתיים ששורטטו תחת מיקרוסקופ. השתמשו בכפתורים למטה כדי לראות תא אחד לבד או להשוות בין שניים (או הקישו על תא ואז "עוד על זה").'), build: realNeuronsScene },
    { id: 'sensory', icon: '🖐️', name: B('Touch & pain', 'מגע וכאב'), chapters: [6, 7], intro: B('A slice of fingertip skin with its five kinds of receptor, each the ending of its own sensory neuron: free nerve endings (pain and temperature), Meissner (light touch), Merkel (pressure), Ruffini (stretch) and Pacinian (vibration). Try each one below and watch how its neuron fires.', 'פרוסה של עור קצה האצבע עם חמשת סוגי הקולטנים שלו, כל אחד הקצה של נוירון תחושתי משלו: קצות עצב חופשיים (כאב וטמפרטורה), מייסנר (מגע קל), מרקל (לחץ), רופיני (מתיחה) ופאצ׳יני (רטט). נסו כל אחד למטה וצפו איך הנוירון שלו יורה.'), build: sensoryScene },
    { id: 'photoreceptors', icon: '🔦', name: B('Rods & cones', 'קנים ומדוכים'), chapters: [6], intro: B('The two light-sensing cells of the retina, up close. Surprisingly, they are most active in the dark: light makes them release LESS glutamate.', 'שני התאים חשי-האור של הרשתית, מקרוב. באופן מפתיע, הם הכי פעילים בחושך: האור גורם להם לשחרר פחות גלוטמט.'), build: photoreceptorScene },
    { id: 'haircell', icon: '🎵', name: B('A hair cell', 'תא שיער'), chapters: [7], intro: B('One inner hair cell of the cochlea, with its bundle of stiff hairs and the auditory nerve fibres under it. Bend the bundle and see the fibre fire.', 'תא שיער פנימי אחד של השבלול, עם צרור השערות הנוקשות שלו וסיבי עצב השמיעה שמתחתיו. כופפו את הצרור וראו את הסיב יורה.'), build: hairCellScene },
    { id: 'types', icon: '🔀', name: B('Types of neurons', 'סוגי נוירונים'), chapters: [3], intro: B('Neurons come in different shapes that suit their jobs: unipolar, bipolar, multipolar and pyramidal.', 'לנוירונים צורות שונות שמתאימות לתפקידם: חד-קוטבי, דו-קוטבי, רב-קוטבי ותא פירמידה.'), build: typesScene },
    { id: 'synapse', icon: '💊', name: B('Synapse drug lab', 'מעבדת סמים בסינפסה'), chapters: [3, 4], intro: B('A chemical synapse up close. Choose a drug type below and watch what happens to the neurotransmitter (pink) and the receptors.', 'סינפסה כימית מקרוב. בחרו סוג סם למטה וצפו מה קורה למוליך העצבי (ורוד) ולקולטנים.'), build: synapseScene },
  ],
};
