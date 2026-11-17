// MACROMOLECULE level: channel and receptor proteins, the Na⁺/K⁺ pump, DNA → protein, and actin–myosin.
import * as THREE from 'three';
import { V, mat, sphere, tube, cyl, box, flow, rand, dotTexture, rod, textSprite, blob, taperTube, voltageTrace } from '../build.js';
import { uprightProtein, moleculeData, buildMolecule } from '../data.js';
import { bilayer, ionChannel, pentamer, gpcr as gpcrModel, gProtein, adenylylCyclase, naKPump, atpModel, transporter as transporterModel, dopamineGeo, lumpGeo, loopGeo, meshOf } from '../proteins.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { dnaHelix, nucleosome, ribosome, BASE_COLORS } from '../cells.js';

const B = (en, he) => ({ en, he });

/** The lipid bilayer: phospholipid heads with two tails each; `holes` ({ x, z, r }) leave room for the proteins. */
function membrane(stage, w = 9, d = 5, holes = [], id = 'membrane') {
  stage.definePart({ id, name: B('Cell membrane (lipid bilayer)', 'קרום התא (דו-שכבה ליפידית)'), desc: B('Two layers of fat molecules (phospholipids): water-loving heads face the water on each side, and their oily tails meet in the middle. Ions cannot cross it except through proteins.', 'שתי שכבות של מולקולות שומן (פוספוליפידים): הראשים, שאוהבים מים, פונים למים משני הצדדים, והזנבות השומניים נפגשים באמצע. יונים אינם יכולים לחצות אותו אלא דרך חלבונים.'), color: '#e7a98f', chapters: [3] });
  const { group } = bilayer({ w, d, holes, front: 0.3 }); // cut just in front of the proteins (textbook cutaway)
  stage.add(group, id);
  return group;
}

/** Simple particles that move from a to b repeatedly (ions crossing a pore). */
function ionStream(stage, a, b, color, n = 8) {
  return flow(stage, new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.5), b]), { color, count: n, speed: 0.5, size: 0.22 });
}

/**
 * Real protein structures (RCSB PDB) shown in place of the simple shapes, with a switch back to the simple model.
 * add(real, simple) pairs them; action is the toolbar switch.
 */
function realAndSimple() {
  const pairs = [];
  let simple = true; // the drawn (textbook) model shows first; the real PDB ribbons are one tap away (owner, 2026-11-15)
  const apply = () => pairs.forEach((p) => { if (p.real) p.real.visible = !simple; if (p.simple) p.simple.visible = simple; });
  return {
    add(real, simpleObj) { pairs.push({ real, simple: simpleObj }); apply(); },
    action: { icon: '🧬', label: B('Real protein data (PDB)', 'נתוני חלבון אמיתיים (PDB)'), toggle: true, caption: B('The drawn model shows each protein the way textbooks draw it: coiled α-helices crossing the membrane, joined by loops, with folded domains as rounded lumps. This switch shows the real backbones from the Protein Data Bank instead (each ribbon follows the chain of amino acids).', 'המודל המצויר מראה כל חלבון כמו בספרי הלימוד: סלילי α שחוצים את הקרום, מחוברים בלולאות, ותחומים מקופלים כגושים מעוגלים. המתג הזה מראה במקומם את השלדים האמיתיים ממאגר החלבונים PDB (כל סרט עוקב אחרי שרשרת חומצות האמינו).'), run: (on) => { simple = !on; apply(); } },
  };
}

// ---------------------------------------------------------------- channels
function channelsScene(stage, { readout, L }) {
  membrane(stage, 13, 5, [{ x: -4, r: 1.3 }, { x: 0, r: 1.3 }, { x: 3.6, r: 0.95 }]);
  const D = (id, en, he, den, dhe, color, extra = {}) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3], ...extra });
  D('nav', 'Voltage-gated Na⁺ channel', 'תעלת Na⁺ תלוית-מתח', 'Four linked domains form a pore that snaps open when the membrane depolarizes to threshold, letting Na⁺ rush in (the rising phase of the action potential). Blocked by local anaesthetics and puffer-fish poison (TTX).', 'ארבעה תחומים מקושרים יוצרים נקבובית שנפתחת כשהקרום מגיע לסף, ומאפשרת ל-Na⁺ להיכנס (שלב העלייה בפוטנציאל הפעולה). נחסמת על ידי חומרי הרדמה מקומית ורעל דג הנפוחית (TTX).', '#e98f2e');
  D('kv', 'Voltage-gated K⁺ channel', 'תעלת K⁺ תלוית-מתח', 'Opens a little later and lets K⁺ flow out, bringing the voltage back down (repolarization).', 'נפתחת מעט מאוחר יותר ומאפשרת ל-K⁺ לצאת, ומחזירה את המתח למטה (רה-פולריזציה).', '#5b8def');
  D('leak', 'K⁺ leak channel', 'תעלת דליפת K⁺', 'Always open; K⁺ leaking out is the main reason the inside rests at about −70 mV.', 'פתוחה תמיד; דליפת K⁺ החוצה היא הסיבה העיקרית שהפנים נמצא במנוחה בכ-‎−70 מ"ו.', '#93c5fd');
  // drawn the textbook way: four domains of coiled helices round a pore (src/visual/proteins.js)
  const chan = (x, color, id, kind) => { const c = ionChannel(stage, { kind, color }); c.g.position.x = x; stage.add(c.g, id); return c; };
  const na = chan(-4, '#e98f2e', 'nav', 'nav');
  const k = chan(0, '#5b8def', 'kv', 'kv');
  const leak = chan(3.6, '#93c5fd', 'leak', 'leak');
  leak.now(true);
  const rs = realAndSimple();
  const glowOn = (g, on, color) => g?.traverse((o) => { if (!o.isMesh) return; if (on) o.material.emissive.set(color).multiplyScalar(0.45); else if (o.userData.baseEmissive) o.material.emissive.copy(o.userData.baseEmissive); else o.material.emissive.set('#000000'); });
  let realNa = null, realK = null;
  const ready = Promise.all([
    uprightProtein('3RVY', { orient: { mode: 'sym' }, height: 1.45, at: V(-4, 0, 0), colors: ['#e98f2e', '#f2b36b', '#e98f2e', '#f2b36b'] })
      .then(({ group }) => { stage.add(group, 'nav'); rs.add(group, na.g); realNa = group; }),
    uprightProtein('2A79', { chains: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'], orient: { mode: 'sym', chains: ['A1', 'A2', 'A3', 'A4'], down: ['B1', 'B2', 'B3', 'B4'] }, height: 4.4, at: V(0, -1.35, 0), colors: (id) => (id[0] === 'A' ? '#5b8def' : '#a5b4fc') })
      .then(({ group }) => { stage.add(group, 'kv'); rs.add(group, k.g); realK = group; }),
  ]).then(() => stage.resetView());
  const naFlow = ionStream(stage, V(-4, 2.2, 0), V(-4, -2.2, 0), '#f59e0b');
  const kFlow = ionStream(stage, V(0, -2.2, 0), V(0, 2.2, 0), '#60a5fa');
  const leakFlow = ionStream(stage, V(3.6, -2.2, 0), V(3.6, 2.2, 0), '#93c5fd', 3);
  leakFlow.setSpeed(0.15);
  naFlow.setActive(false); kFlow.setActive(false);
  // the inactivation gate: a ball on a chain under the Na⁺ channel that swings into the pore and keeps it shut for a
  // moment after each spike (the refractory period), so the signal can only travel forward
  stage.definePart({ id: 'inact', name: B('Inactivation gate (ball and chain)', 'שער השבתה (כדור ושרשרת)'), desc: B('A loop of the Na⁺ channel that plugs the pore from inside about a millisecond after it opens. Until it lets go the channel cannot open again: the refractory period.', 'לולאה של תעלת ה-Na⁺ שפוקקת את הנקבובית מבפנים כאלפית שנייה אחרי שנפתחה. עד שהיא משתחררת התעלה לא יכולה להיפתח שוב: התקופה הרפרקטורית.'), color: '#7c2d12', chapters: [3] });
  const ball = sphere(0.22, '#7c2d12'); stage.add(ball, 'inact');
  const chain = rod(V(-3.4, -1.0, 0.4), V(-3.4, -1.6, 0.4), 0.03, '#7c2d12'); stage.add(chain, 'inact');
  stage.definePart({ id: 'ttx', name: B('Tetrodotoxin (TTX)', 'טטרודוטוקסין (TTX)'), desc: B('Pufferfish poison. It sits in the outer mouth of the Na⁺ channel like a cork.', 'רעל דג הנפוחית. הוא יושב בפתח החיצוני של תעלת ה-Na⁺ כמו פקק.'), color: '#6b7280', chapters: [3, 4] });
  const cork = new THREE.Group(); [[-0.12, 0], [0.12, 0.05], [0, 0.18]].forEach(([x, y]) => { const d = sphere(0.14, '#e5e7eb'); d.position.set(x, y, 0); cork.add(d); }); cork.position.set(-4, 1.1, 0); cork.visible = false; stage.add(cork, 'ttx');
  let seq = null, ttx = false, Vm = -70, inactT = 0;
  const trace = voltageTrace();
  stage.onUpdate((dt) => {
    // ball: hangs below the channel, swings up into the pore while inactivated
    inactT += ((seq && seq.t > 1.4 && seq.t < 3.0 ? 1 : 0) - inactT) * Math.min(1, dt * 6);
    ball.position.set(-3.4 - inactT * 0.6, -1.8 + inactT * 0.75, 0.4 - inactT * 0.4);
    { const A = V(-3.72, -0.98, 0.3), Bp = ball.position, len = A.distanceTo(Bp); // the chain: from the channel's inner side to the ball
      chain.position.copy(A).lerp(Bp, 0.5); chain.scale.set(1, len / 0.6, 1); chain.quaternion.setFromUnitVectors(V(0, 1, 0), Bp.clone().sub(A).normalize()); }
    cork.visible = ttx;
    const target = !seq ? -70 : ttx ? -70 : seq.t < 0.3 ? -65 : seq.t < 1.2 ? 40 : seq.t < 2.4 ? -80 : -70;
    Vm += (target - Vm) * Math.min(1, dt * 8);
    trace.push(Vm, dt);
    readout(`${L('Membrane voltage', 'מתח הממברנה')}: <b>${Math.round(Vm)} mV</b>${trace.svg()}${ttx ? '🐡 ' + L('TTX corks the Na⁺ channel: no rise, no spike', 'TTX פוקק את תעלת ה-Na⁺: אין עלייה, אין ספייק') : inactT > 0.5 ? '🔒 ' + L('Na⁺ channel inactivated (refractory)', 'תעלת ה-Na⁺ מושבתת (רפרקטורית)') : ''}`);
    if (!seq) return;
    seq.t += dt;
    const naOpen = !ttx && seq.t > 0.3 && seq.t < 1.4;
    const kOpen = !ttx && seq.t > 1.2 && seq.t < 3.2;
    na.set(naOpen); k.set(kOpen);
    glowOn(realNa, naOpen, '#f59e0b'); glowOn(realK, kOpen, '#60a5fa');
    glowOn(na.g, naOpen, '#f59e0b'); glowOn(k.g, kOpen, '#60a5fa');
    naFlow.setActive(naOpen); kFlow.setActive(kOpen);
    if (seq.t > 3.6) seq = null;
  });
  return {
    ready,
    home: { pos: V(0, 1.5, 10), target: V(0, -0.6, 0) },
    actions: [
      rs.action,
      { icon: '⚡', label: B('Depolarize to threshold', 'דה-פולריזציה לסף'), caption: B('First the Na⁺ channel opens and Na⁺ (orange) flows IN; a moment later it closes and the K⁺ channel opens, letting K⁺ (blue) flow OUT. That is one action potential. Inside of the cell = bottom.', 'קודם תעלת ה-Na⁺ נפתחת ו-Na⁺ (כתום) נכנס פנימה; רגע אחר כך היא נסגרת ותעלת ה-K⁺ נפתחת, ו-K⁺ (כחול) יוצא החוצה. זה פוטנציאל פעולה אחד. פנים התא = למטה.'), run: () => { seq = { t: 0 }; } },
      { icon: '🔒', label: B('Why the signal only goes forward', 'למה האות נע רק קדימה'), caption: B('Watch the brown ball under the Na⁺ channel: right after opening, it swings into the pore and plugs it (inactivation). For about a millisecond the channel cannot open again, so the spike cannot run backwards along the axon.', 'הסתכלו בכדור החום מתחת לתעלת ה-Na⁺: מיד אחרי הפתיחה הוא נכנס לנקבובית ופוקק אותה (השבתה). במשך כאלפית שנייה התעלה לא יכולה להיפתח שוב, ולכן הספייק לא יכול לרוץ אחורה לאורך האקסון.'), run: () => { seq = { t: 0 }; stage.focus(['nav', 'inact']); } },
      { icon: '🐡', label: B('Block the Na⁺ channel (TTX)', 'חסימת תעלת ה-Na⁺ (TTX)'), toggle: true, caption: B('Tetrodotoxin from the pufferfish corks the Na⁺ channel from outside (white dots). Press "Depolarize" again: nothing opens and the voltage stays flat. That is why badly prepared fugu can paralyse.', 'טטרודוטוקסין מדג הנפוחית פוקק את תעלת ה-Na⁺ מבחוץ (נקודות לבנות). לחצו שוב על "דה-פולריזציה": שום דבר לא נפתח והמתח נשאר שטוח. לכן פוגו שהוכן לא נכון יכול לשתק.'), run: (on) => { ttx = on; } },
    ],
  };
}

// ---------------------------------------------------------------- receptors
function receptorsScene(stage, { readout, L }) {
  membrane(stage, 10, 5, [{ x: -2.8, r: 1.2 }, { x: 1.6, r: 0.95 }, { x: 3.8, r: 0.95 }]);
  const D = (id, en, he, den, dhe, color, extra = {}) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [3, 4], ...extra });
  D('iono', 'Ionotropic receptor (ligand-gated channel)', 'קולטן יונוטרופי (תעלה תלוית-ליגנד)', 'The receptor IS a channel: when neurotransmitter binds (e.g. ACh at nicotinic, glutamate at AMPA), it opens within milliseconds. Fast signals.', 'הקולטן הוא תעלה: כשמוליך עצבי נקשר (למשל ACh לניקוטיני, גלוטמט ל-AMPA), הוא נפתח בתוך אלפיות שנייה. אותות מהירים.', '#3cb37a');
  D('gpcr', 'Metabotropic receptor (GPCR)', 'קולטן מטבוטרופי (GPCR)', 'Seven coils crossing the membrane. Binding activates a G-protein inside, which triggers second messengers (like cAMP) — slower but longer-lasting effects. Dopamine and serotonin receptors are mostly of this type.', 'שבעה סלילים שחוצים את הקרום. הקישור מפעיל חלבון G בפנים, שמפעיל שליחים שניים (כמו cAMP) — השפעות איטיות יותר אבל ממושכות. קולטני דופמין וסרוטונין הם ברובם מסוג זה.', '#8b5cf6');
  D('gprotein', 'G-protein', 'חלבון G', 'Switch protein that splits off when the receptor is activated and turns on enzymes.', 'חלבון מתג שמתנתק כשהקולטן מופעל ומפעיל אנזימים.', '#f472b6');
  D('enzyme', 'Enzyme (adenylyl cyclase)', 'אנזים (אדנילט ציקלאז)', 'Makes the second messenger cAMP, which changes the cell\'s activity and even gene expression.', 'מייצר את השליח השני cAMP, שמשנה את פעילות התא ואפילו ביטוי גנים.', '#f59e0b');
  // drawn the textbook way (src/visual/proteins.js)
  // Ionotropic: five subunits round a pore, each with a tall outer domain, four membrane helices and an inner helix
  const ionoM = pentamer(stage, { colors: ['#3cb37a', '#6ee7b7', '#3cb37a', '#34d399', '#a7f3d0'] });
  const iono = ionoM.g;
  iono.position.x = -2.8;
  stage.add(iono, 'iono');
  // GPCR: seven helices joined by loops; TM6 swings out when it is switched on
  const gpcrM = gpcrModel(stage, { color: '#8b5cf6' });
  const gpcr = gpcrM.g;
  gpcr.position.x = 1.6;
  stage.add(gpcr, 'gpcr');
  // G-protein: α (travels to the enzyme, GDP → GTP) and βγ (stays at the receptor)
  const gprot = gProtein();
  const gp = gprot.alpha;
  gp.position.set(1.6, -1.2, 0.3);
  stage.add(gp, 'gprotein');
  gprot.bg.position.set(0.88, -1.32, 0.25);
  stage.add(gprot.bg, 'gprotein');
  const enz = adenylylCyclase({ color: '#f59e0b' }); enz.position.set(3.8, 0, 0);
  stage.add(enz, 'enzyme');
  const rs = realAndSimple();
  let realG = null;
  const gHome = V();
  const ready = Promise.all([
    uprightProtein('2BG9', { orient: { mode: 'sym' }, height: 3.4, at: V(-2.8, 0.5, 0), colors: ['#3cb37a', '#6ee7b7', '#3cb37a', '#34d399', '#a7f3d0'] })
      .then(({ group }) => { stage.add(group, 'iono'); rs.add(group, iono); }),
    uprightProtein('3SN6', { chains: ['R', 'A', 'B', 'G'], orient: { mode: 'long', chains: ['R'], down: ['A', 'B', 'G'] }, height: 4.6, at: V(1.6, -1.1, 0), colors: (id) => ({ R: '#8b5cf6', A: '#f472b6', B: '#f9a8d4', G: '#fbcfe8' }[id] || '#ccc') })
      .then(({ group }) => {
        // the G-protein chains go into their own group so they can travel to the enzyme
        stage.root.add(group);
        group.updateMatrixWorld(true);
        const g = new THREE.Group();
        stage.root.add(g);
        const list = [];
        group.traverse((o) => { if (o.isMesh && 'ABG'.includes(o.userData.chain)) list.push(o); });
        list.forEach((m) => g.attach(m));
        stage.root.remove(group);
        stage.add(group, 'gpcr');
        stage.root.remove(g);
        stage.add(g, 'gprotein');
        rs.add(group, gpcr); rs.add(g, gp); rs.add(null, gprot.bg);
        realG = g; gHome.copy(g.position);
      }),
  ]).then(() => stage.resetView());
  const ligand = (color) => { const s = sphere(0.18, color); s.position.set(0, 3, 0); stage.root.add(s); return s; };
  const ach = ligand('#ff5fa2');
  const da = ligand('#fbbf24');
  ach.visible = da.visible = false;
  const ions = ionStream(stage, V(-2.8, 2.2, 0), V(-2.8, -2.2, 0), '#f59e0b');
  ions.setActive(false);
  const camp = { pos: new Float32Array(30 * 3).fill(-100), list: [] };
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(camp.pos, 3));
  stage.root.add(new THREE.Points(cg, new THREE.PointsMaterial({ color: '#fde047', size: 0.18, map: dotTexture(), transparent: true, depthWrite: false })));
  let ia = null, ga = null, block = false, ionsIn = 0;
  // an antagonist: white dots that sit in the binding sites of both receptors, so the transmitter cannot get in
  D('antagonist', 'Antagonist (blocker)', 'אנטגוניסט (חוסם)', 'A drug that fits the binding site but does not switch the receptor on. It just takes the place, so the real transmitter cannot bind. Examples: curare (nicotinic), haloperidol (dopamine D2).', 'תרופה שמתאימה לאתר הקישור אבל לא מפעילה את הקולטן. היא רק תופסת את המקום, ולכן המוליך האמיתי לא יכול להיקשר. דוגמאות: קורארה (ניקוטיני), הלופרידול (דופמין D2).', '#e5e7eb');
  const blockers = [V(-2.8, 1.45, 0.55), V(1.6, 1.0, 0)].map((p) => { const g = new THREE.Group(); [[-0.1, 0], [0.1, 0.04], [0, 0.16]].forEach(([x, y]) => { const d = sphere(0.11, '#f8fafc'); d.position.set(x, y, 0); g.add(d); }); g.position.copy(p); g.visible = false; stage.add(g, 'antagonist'); return g; });
  stage.onUpdate((dt) => {
    blockers.forEach((b) => { b.visible = block; });
    if (ia) {
      ia.t += dt;
      ach.visible = true;
      ach.position.lerpVectors(V(-2.8, 3, 0), V(-2.8, block ? 2.1 : 1.35, block ? 0.3 : 0.55), Math.min(1, ia.t));
      const open = !block && ia.t > 1 && ia.t < 3;
      if (open) ionsIn += dt * 40;
      ionoM.set(open);
      ions.setActive(open);
      if (ia.t > 3.4) { ia = null; ach.visible = false; }
    }
    if (ga) {
      ga.t += dt;
      da.visible = true;
      da.position.lerpVectors(V(1.6, 3, 0), V(1.6, block ? 1.9 : 1.0, 0), Math.min(1, ga.t));
      gpcrM.set(!block && ga.t > 0.9 && ga.t < 5.2); // switched on: TM6 swings out
      gprot.setGTP(!block && ga.t > 0.95);          // α swaps GDP for GTP and lets go of βγ
      if (ga.t > 1 && !block) gp.position.lerpVectors(V(1.6, -1.2, 0.3), V(3.6, -1.2, 0.3), Math.min(1, (ga.t - 1) / 1.2));
      if (realG) realG.position.copy(gHome).add(gp.position.clone().sub(V(1.6, -1.2, 0.3)));
      if (!block && ga.t > 2.2 && ga.t < 5 && Math.random() < 0.3) camp.list.push({ p: V(3.8, -1, 0), v: V(rand(-0.6, 0.6), -rand(0.2, 0.8), rand(-0.6, 0.6)), life: 0 });
      if (ga.t > 6) { ga = null; da.visible = false; gp.position.set(1.6, -1.2, 0.3); gprot.setGTP(false); gpcrM.set(false); if (realG) realG.position.copy(gHome); }
    }
    camp.list = camp.list.filter((d) => (d.life += dt) < 3);
    camp.list.forEach((d) => d.p.addScaledVector(d.v, dt));
    for (let k = 0; k < 30; k++) { const d = camp.list[k]; camp.pos[k * 3] = d ? d.p.x : 0; camp.pos[k * 3 + 1] = d ? d.p.y : -100; camp.pos[k * 3 + 2] = d ? d.p.z : 0; }
    cg.attributes.position.needsUpdate = true;
    readout(`${L('Ions through the ionotropic receptor', 'יונים דרך הקולטן היונוטרופי')}: <b>${Math.round(ionsIn)}</b> (${L('in ms', 'באלפיות שנייה')})<br>${L('Second messenger (cAMP) molecules', 'מולקולות שליח שני (cAMP)')}: <b>${camp.list.length}</b> (${L('one dopamine → many cAMP, for seconds', 'דופמין אחד ← הרבה cAMP, לשניות')})${block ? '<br>⛔ ' + L('Antagonist in the sites: neither receptor responds', 'אנטגוניסט באתרים: אף קולטן לא מגיב') : ''}`);
  });
  return {
    ready,
    home: { pos: V(0.5, 1.5, 11), target: V(0.5, -0.3, 0) },
    actions: [
      rs.action,
      { icon: '⚡', label: B('Fast: ACh opens an ionotropic receptor', 'מהיר: ACh פותח קולטן יונוטרופי'), caption: B('The neurotransmitter binds and the channel itself opens — ions flow in at once. Over in milliseconds.', 'המוליך העצבי נקשר והתעלה עצמה נפתחת — יונים זורמים פנימה מיד. נגמר תוך אלפיות שנייה.'), run: () => { ia = { t: 0 }; } },
      { icon: '🐢', label: B('Slow: dopamine activates a GPCR', 'איטי: דופמין מפעיל GPCR'), caption: B('Dopamine binds the 7-coil receptor → the G-protein (pink) moves to the enzyme (orange) → cAMP (yellow) spreads inside the cell. Slower, longer, and amplified.', 'דופמין נקשר לקולטן בעל 7 הסלילים ← חלבון ה-G (ורוד) נע לאנזים (כתום) ← cAMP (צהוב) מתפשט בתוך התא. איטי יותר, ממושך ומוגבר.'), run: () => { ga = { t: 0 }; } },
      { icon: '⛔', label: B('Add an antagonist', 'הוספת אנטגוניסט'), toggle: true, caption: B('The white dots fill the binding sites. Send ACh or dopamine again: the transmitter arrives but cannot dock, so nothing opens and no cAMP is made. Many medicines work this way (antipsychotics block dopamine D2 receptors).', 'הנקודות הלבנות ממלאות את אתרי הקישור. שלחו שוב ACh או דופמין: המוליך מגיע אבל לא יכול להיקשר, ולכן שום דבר לא נפתח ולא נוצר cAMP. הרבה תרופות פועלות כך (תרופות אנטי-פסיכוטיות חוסמות קולטני דופמין D2).'), run: (on) => { block = on; } },
    ],
  };
}

// ---------------------------------------------------------------- Na/K pump
function pumpScene(stage, { readout, L }) {
  membrane(stage, 9, 5, [{ x: 0.05, z: -0.05, r: 1.3 }]); // wide enough that the camera steps back and the whole pump fits
  stage.definePart({ id: 'pump', name: B('Sodium-potassium pump', 'משאבת נתרן-אשלגן'), desc: B('Uses one ATP to push 3 Na⁺ out and bring 2 K⁺ in, keeping the gradients that make the resting potential possible. Its α subunit has ten membrane helices and three parts inside the cell: N binds ATP, P takes its phosphate, A turns to reset the pump. The β subunit outside carries sugar chains (green).', 'משתמשת ב-ATP אחד כדי לדחוף 3 Na⁺ החוצה ולהכניס 2 K⁺, ושומרת על המפלים שמאפשרים את פוטנציאל המנוחה. ליחידת α שלה עשרה סלילים בקרום ושלושה חלקים בתוך התא: N קושר ATP, P מקבל את הפוספט שלו, ו-A מסתובב ומאפס את המשאבה. יחידת β שבחוץ נושאת שרשראות סוכר (ירוקות).'), color: '#f2c14e', chapters: [3] });
  stage.definePart({ id: 'atp', name: B('ATP', 'ATP'), desc: B('The cell\'s energy currency, made by mitochondria: adenine (blue rings), ribose (yellow ring) and three phosphates (orange). The pump takes the last phosphate.', 'מטבע האנרגיה של התא, מיוצר במיטוכונדריה: אדנין (טבעות כחולות), ריבוז (טבעת צהובה) ושלושה פוספטים (כתומים). המשאבה לוקחת את הפוספט האחרון.'), color: '#fde047', chapters: [3] });
  // drawn the textbook way (src/visual/proteins.js); pose(phase) runs its domains through the cycle
  const pumpM = naKPump(stage);
  const pump = pumpM.g;
  stage.add(pump, 'pump');
  const atp = atpModel(); atp.scale.setScalar(1.3);
  stage.add(atp, 'atp');
  const ATP_ON_N = V(0.36, -0.42, 0.45); // where ATP sits on the N domain (in the domain's own frame)
  // the ion path: in from the cytoplasm at one side (Na⁺ left, K⁺ right, clear of the inner domains), through the
  // helices, out above on the same side
  const ionAt = (x, u, side) => {
    const pts = [V(x + side * 1.55, -1.45, 0.85), V(x * 0.4, -0.55, 0.55), V(x * 0.4, 0.6, 0.55), V(x + side * 1.75, 1.4, 0.7)];
    const f = Math.max(0, Math.min(0.9999, u)) * 3, i = Math.floor(f), s = f - i;
    return pts[i].clone().lerp(pts[i + 1], s * s * (3 - 2 * s));
  };
  const rs = realAndSimple();
  const ready = uprightProtein('3B8E', { chains: ['A', 'B', 'G'], orient: { mode: 'long', chains: ['A'], up: ['B'] }, height: 4.4, at: V(0, -0.9, 0), colors: (id) => ({ A: '#f2c14e', B: '#e0b13c', G: '#fde68a' }[id]), opacity: 0.85 })
    .then(({ group }) => { stage.add(group, 'pump'); rs.add(group, pump); stage.resetView(); });
  const na = [0, 1, 2].map(() => { const s = sphere(0.2, '#f59e0b'); stage.root.add(s); return s; });
  const k = [0, 1].map(() => { const s = sphere(0.24, '#60a5fa'); stage.root.add(s); return s; });
  let t = 0, cycles = 0, running = false, ouabain = false, grad = 1;
  stage.definePart({ id: 'ouabain', name: B('Ouabain', 'אואבאין'), desc: B('A plant poison (once put on arrow tips) that jams the pump. Its cousin digoxin, in small doses, is a heart medicine.', 'רעל צמחי (שנמרח פעם על חיצים) שתוקע את המשאבה. בן דודו דיגוקסין, במינונים קטנים, הוא תרופה ללב.'), color: '#e5e7eb', chapters: [3, 4] });
  const ou = new THREE.Group(); [[-0.12, 0], [0.12, 0.05], [0, 0.18]].forEach(([x, y]) => { const d = sphere(0.14, '#f8fafc'); d.position.set(x, y, 0); ou.add(d); }); ou.position.set(0, 1.35, 0.5); ou.visible = false; stage.add(ou, 'ouabain');
  const bar = (pct, color) => `<div class="vbar"><span style="width:${Math.round(pct)}%;background:${color}"></span></div>`;
  stage.onUpdate((dt) => {
    // ions leak back all the time; only the pump undoes it. grad = how much of the normal gradient is left (1 = full)
    grad = Math.max(0, Math.min(1, grad + (ouabain ? -dt / 18 : running ? dt / 6 : 0)));
    ou.visible = ouabain;
    const naIn = 15 + (1 - grad) * 60, kIn = 140 - (1 - grad) * 60, rest = -70 * grad - 10 * (1 - grad);
    const info = `<br>Na⁺ ${L('inside', 'בפנים')} ${Math.round(naIn)} mM${bar(naIn / 1.45, '#f59e0b')}K⁺ ${L('inside', 'בפנים')} ${Math.round(kIn)} mM${bar(kIn / 1.45, '#60a5fa')}${L('Resting potential', 'פוטנציאל מנוחה')}: <b>${Math.round(rest)} mV</b>${ouabain ? ' ⚠️ ' + L('pump jammed: gradients run down, the neuron can no longer fire', 'המשאבה תקועה: המפלים נשחקים, הנוירון כבר לא יכול לירות') : ''}`;
    const placeAtp = (show) => { atp.visible = show; atp.position.copy(pumpM.nDom.localToWorld(ATP_ON_N.clone())); };
    if (!running || ouabain) {
      pumpM.pose(0); placeAtp(true);
      readout(`${L('Pump cycles', 'מחזורי שאיבה')}: <b>${cycles}</b>${info}`); na.forEach((s, i) => s.position.copy(ionAt(-0.6 + i * 0.6, 0, -1))); k.forEach((s, i) => s.position.copy(ionAt(-0.3 + i * 0.6, 1, 1))); return; }
    t += dt * 0.6;
    const ph = t % 1;
    if (Math.floor(t) > cycles) cycles = Math.floor(t);
    na.forEach((s, i) => s.position.copy(ionAt(-0.6 + i * 0.6, Math.min(1, ph * 2), -1)));
    k.forEach((s, i) => s.position.copy(ionAt(-0.3 + i * 0.6, 1 - Math.max(0, Math.min(1, ph * 2 - 1)), 1)));
    pumpM.pose(ph);
    placeAtp(ph < 0.4);
    readout(`${L('Pump cycles', 'מחזורי שאיבה')}: <b>${cycles}</b> → ${cycles * 3} Na⁺ ${L('out', 'החוצה')}, ${cycles * 2} K⁺ ${L('in', 'פנימה')}, ${cycles} ATP ${L('used', 'נוצלו')}${info}`);
  });
  return {
    ready,
    home: { pos: V(0.2, 0.9, 10), target: V(0.2, -0.1, 0) },
    actions: [rs.action, { icon: '🔄', label: B('Run the pump', 'הפעלת המשאבה'), toggle: true, caption: B('Each cycle: 3 Na⁺ (orange) are pushed OUT (top) and 2 K⁺ (blue) brought IN (bottom), using one ATP. More positive charge leaves than enters, helping keep the inside negative.', 'בכל מחזור: 3 Na⁺ (כתום) נדחפים החוצה (למעלה) ו-2 K⁺ (כחול) מוכנסים פנימה (למטה), בעזרת ATP אחד. יותר מטען חיובי יוצא משנכנס, וזה עוזר לשמור על הפנים שלילי.'), run: () => { running = !running; return running; } },
      { icon: '🏹', label: B('Jam the pump (ouabain)', 'תקיעת המשאבה (אואבאין)'), toggle: true, caption: B('With the pump jammed, Na⁺ keeps leaking in and K⁺ out, and nothing puts them back. Watch the bars: the gradients run down and the resting potential drifts toward 0 mV, so the neuron can no longer fire. Turn it off and run the pump to recover. This is also what happens in a stroke, when there is no ATP.', 'כשהמשאבה תקועה, Na⁺ ממשיך לדלוף פנימה ו-K⁺ החוצה, ושום דבר לא מחזיר אותם. הסתכלו בפסים: המפלים נשחקים ופוטנציאל המנוחה זז לכיוון 0 מ"ו, ולכן הנוירון כבר לא יכול לירות. כבו והפעילו את המשאבה כדי להתאושש. זה גם מה שקורה בשבץ, כשאין ATP.'), run: (on) => { ouabain = on; } }],
  };
}

// ---------------------------------------------------------------- DNA → protein
function dnaScene(stage, { readout, L }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [5] });
  D('dna', 'DNA double helix', 'סליל ה-DNA הכפול', 'Two strands twisted together: their backbones (blue ribbons, a bead for each phosphate) on the outside, the bases paired inside: A with T (red–yellow), G with C (green–purple). The strands are offset, leaving a wide and a narrow groove. The order of bases spells out the genes. Humans have 23 pairs of chromosomes.', 'שני גדילים מלופפים יחד: השלדים שלהם (סרטים כחולים, חרוז לכל פוספט) בחוץ, והבסיסים מזווגים בפנים: A עם T (אדום–צהוב), G עם C (ירוק–סגול). הגדילים מוסטים זה מזה, ומשאירים חריץ רחב וחריץ צר. סדר הבסיסים "מאיית" את הגנים. לבני אדם 23 זוגות כרומוזומים.', '#5b8def');
  D('polymerase', 'RNA polymerase', 'RNA פולימראז', 'The enzyme that reads one strand of the gene and builds the matching RNA, one letter at a time (transcription).', 'האנזים שקורא גדיל אחד של הגן ובונה את ה-RNA התואם, אות אחר אות (שעתוק).', '#0ea5a4');
  D('mrna', 'Messenger RNA', 'RNA שליח', 'A single-stranded copy of one gene made by transcription (with U, light blue, where DNA has T); it carries the recipe out of the nucleus.', 'עותק חד-גדילי של גן אחד שנוצר בשעתוק (עם U, תכלת, במקום שבו ב-DNA יש T); הוא נושא את המתכון החוצה מהגרעין.', '#f59e0b');
  D('ribosome', 'Ribosome', 'ריבוזום', 'Two subunits clamp the mRNA between them. It reads the mRNA three letters (one codon) at a time and links the matching amino acids: translation. The new chain leaves through a tunnel in the large subunit.', 'שתי תת-יחידות מחזיקות את ה-RNA השליח ביניהן. הריבוזום קורא אותו שלוש אותיות (קודון אחד) בכל פעם ומחבר את חומצות האמינו המתאימות: תרגום. השרשרת החדשה יוצאת דרך מנהרה בתת-היחידה הגדולה.', '#8b5cf6');
  D('protein', 'Protein (amino-acid chain)', 'חלבון (שרשרת חומצות אמינו)', 'The finished chain folds into a working protein — an enzyme, receptor, channel or structural part.', 'השרשרת המוגמרת מתקפלת לחלבון פעיל — אנזים, קולטן, תעלה או חלק מבני.', '#10b981');
  // the double helix, drawn the textbook way (src/visual/cells.js)
  const dna = dnaHelix({ n: 60, rise: 0.13, r: 0.8, y0: -4 });
  dna.position.x = -2.5;
  stage.add(dna, 'dna');
  D('nucleosomes', 'DNA packed on histones', 'DNA דחוס על היסטונים', 'In the nucleus DNA is wound on spools of eight histone proteins (nucleosomes), 1.65 turns each. Their tails stick out, and chemical tags on them switch genes on and off: epigenetics.', 'בגרעין ה-DNA מלופף על סלילים של שמונה חלבוני היסטון (נוקלאוזומים), 1.65 סיבובים על כל אחד. הזנבות שלהם בולטים החוצה, ותגים כימיים עליהם מדליקים ומכבים גנים: אפיגנטיקה.', '#a78bfa');
  const nucAt = [V(-4.6, -3.35, 0), V(-4.55, -2.05, 0)];
  const nucs = nucAt.map((p, i) => { const n = nucleosome({ seed: i * 5 + 1 }); n.g.position.copy(p); n.g.rotation.z = i * 0.9; stage.add(n.g, 'nucleosomes'); return n; });
  const W = (n, p) => n.g.localToWorld(p.clone());
  stage.root.updateMatrixWorld(true);
  const linker = (pts) => stage.add(tube(pts, 0.06, '#5b8def', undefined, 48), 'nucleosomes');
  const e0 = W(nucs[0], nucs[0].entry), x0 = W(nucs[0], nucs[0].exit), e1 = W(nucs[1], nucs[1].entry), x1 = W(nucs[1], nucs[1].exit);
  linker([V(-2.5, -4.05, 0), V(-3.4, -4.25, 0), e0.clone().add(V(0.25, -0.2, -0.1)), e0]);
  linker([x0, x0.clone().add(V(-0.35, 0.15, 0.1)), e1.clone().add(V(-0.3, -0.25, -0.1)), e1]);
  linker([x1, x1.clone().add(V(-0.25, 0.3, 0.1)), V(-5.0, -1.2, 0.2)]);
  // RNA polymerase sits on the gene; the new mRNA comes out of it
  const pol = meshOf([lumpGeo(V(0, 0, 0), 0.62, { stretch: [1.05, 0.9, 0.85], seed: 3, amp: 0.14 }), lumpGeo(V(0.38, 0.32, 0.18), 0.26, { seed: 8, amp: 0.1 })], mat('#0ea5a4', { opacity: 0.88, rough: 0.45 }));
  pol.position.set(-2.15, 2.0, 0.55);
  stage.add(pol, 'polymerase');
  const mrnaPts = [V(-1.7, 2.1, 0.45), V(-1.4, 2.05, 0.2)];
  for (let i = 2; i <= 30; i++) mrnaPts.push(V(-1.2 + i * 0.12, 2 - Math.sin(i * 0.4) * 0.3, 0));
  const mrna = tube(mrnaPts, 0.055, '#f59e0b', undefined, 100);
  mrna.geometry.setDrawRange(0, 0);
  stage.add(mrna, 'mrna');
  // the mRNA's bases: one short stub per letter, coloured by base (U in light blue)
  const NB = 34, mSeq = 'AUGCGUACCUGAGCUUAACGGAUCCAUGCAAUGG';
  const bases = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 6), mat('#ffffff', { rough: 0.45 }), NB);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < NB; i++) {
    const u = (i + 0.5) / NB, p = mrna.userData.curve.getPointAt(u), tng = mrna.userData.curve.getTangentAt(u);
    const out = V(0, 0, 1).cross(tng).normalize().multiplyScalar(-1); // pointing down, off the backbone
    q.setFromUnitVectors(V(0, 1, 0), out);
    m4.compose(p.clone().addScaledVector(out, 0.13), q, V(1, 1, 1));
    bases.setMatrixAt(i, m4);
    bases.setColorAt(i, new THREE.Color(BASE_COLORS[mSeq[i]]));
  }
  bases.count = 0;
  stage.add(bases, 'mrna');
  const rib = ribosome();
  rib.position.set(-1.2, 1.9, 0); rib.visible = false;
  stage.add(rib, 'ribosome');
  const chain = new THREE.Group();
  const beads = [];
  for (let i = 0; i < 16; i++) { const b = sphere(0.14, ['#10b981', '#34d399', '#059669', '#6ee7b7'][i % 4]); b.visible = false; chain.add(b); beads.push(b); }
  stage.add(chain, 'protein');
  D('realdna', 'Real DNA structure (PDB 1BNA)', 'מבנה DNA אמיתי (PDB 1BNA)', 'X-ray structure of 12 base pairs of B-DNA, the first full turn of DNA ever solved (Drew & Dickerson, 1981). One turn = about 10 base pairs, 3.4 nm.', 'מבנה רנטגן של 12 זוגות בסיסים של B-DNA, הסיבוב השלם הראשון של DNA שפוענח (דרו ודיקרסון, 1981). סיבוב אחד = כ-10 זוגות בסיסים, 3.4 ננומטר.', '#38bdf8');
  const ready = uprightProtein('1BNA', { orient: { mode: 'long' }, height: 3.2, at: V(3, -1.5, 0), colors: ['#38bdf8', '#0ea5e9'], radius: 1.6 })
    .then(({ group }) => { stage.add(group, 'realdna'); stage.resetView(); });
  let phase = null, fold = 0, foldT = 0, mut = false, made = 0;
  const BEAD_COLORS = ['#10b981', '#34d399', '#059669', '#6ee7b7'];
  const lineAt = []; // where each bead sat when it was made; folding moves it into a compact ball
  const ballAt = beads.map((_, i) => { const a = i * 2.4, r = 0.38 + 0.12 * Math.sin(i * 1.3); return V(Math.cos(a) * r, Math.sin(i * 0.9) * 0.35, Math.sin(a) * r); });
  stage.onUpdate((dt) => {
    fold += (foldT - fold) * Math.min(1, dt * 1.5);
    if (made && !phase) beads.forEach((b, i) => { if (!lineAt[i]) return; const c = lineAt[Math.floor(made / 2)] || lineAt[0]; b.position.lerpVectors(lineAt[i], c.clone().add(ballAt[i]), fold); });
    pol.material.emissive.set(phase?.kind === 'tx' ? '#0f766e' : '#000000');
    if (!phase) return;
    phase.t += dt;
    if (phase.kind === 'tx') {
      const f = Math.min(1, phase.t / 3);
      mrna.geometry.setDrawRange(0, Math.floor(mrna.geometry.index.count * f / 6) * 6);
      bases.count = Math.floor(f * NB);
      readout(`${L('Transcription', 'שעתוק')}: ${(f * 100).toFixed(0)}%`);
      if (f >= 1) phase = null;
    } else {
      rib.visible = true;
      const f = Math.min(1, phase.t / 5);
      const p = mrna.userData.curve.getPointAt(0.08 + f * 0.92);
      rib.position.copy(p);
      // with the mutation one letter change turns codon 7 into STOP: the ribosome lets go and the protein is cut short
      const n = Math.min(mut ? 6 : beads.length, Math.floor(f * beads.length));
      beads.forEach((b, i) => { b.visible = i < n; if (i < n && !lineAt[i]) lineAt[i] = V(p.x - 0.3 - Math.sin(i * 0.8) * 0.3, p.y + 0.9 + i * 0.22, Math.cos(i * 0.8) * 0.3); if (lineAt[i]) b.position.copy(lineAt[i]); b.material.color.set(mut && i === 5 ? '#ef4444' : BEAD_COLORS[i % 4]); });
      made = n;
      readout(`${L('Amino acids linked', 'חומצות אמינו שחוברו')}: <b>${n}</b>${mut && n >= 6 ? ' · ⛔ ' + L('STOP codon: the protein is cut short and cannot work', 'קודון STOP: החלבון נקטע ולא יכול לעבוד') : ''}`);
      if (f >= 1 || (mut && n >= 6 && f > 0.5)) { phase = null; rib.visible = false; }
    }
  });
  return {
    ready,
    home: { pos: V(0, 0, 11), target: V(0, 0, 0) },
    actions: [
      { icon: '📝', label: B('1. Transcription', '1. שעתוק'), caption: B('RNA polymerase (teal) reads one gene on the DNA and builds a matching messenger RNA strand (orange, its letters sticking out).', 'RNA פולימראז (טורקיז) קורא גן אחד על ה-DNA ובונה גדיל RNA שליח תואם (כתום, והאותיות שלו בולטות ממנו).'), run: () => { phase = { kind: 'tx', t: 0 }; } },
      { icon: '🧶', label: B('2. Translation', '2. תרגום'), caption: B('In the cytoplasm a ribosome (purple) clamps the mRNA and moves along it, adding one amino acid per codon — the green chain is the new protein.', 'בציטופלזמה ריבוזום (סגול) נצמד ל-RNA השליח ונע לאורכו, ומוסיף חומצת אמינו אחת לכל קודון — השרשרת הירוקה היא החלבון החדש.'), run: () => { lineAt.length = 0; made = 0; foldT = 0; fold = 0; mrna.geometry.setDrawRange(0, Infinity); bases.count = NB; phase = { kind: 'tl', t: 0 }; } },
      { icon: '🌀', label: B('3. Folding', '3. קיפול'), caption: B('A new chain folds by itself into a compact 3D shape, guided by how its amino acids attract and repel each other. The shape is what lets it work: a channel, a receptor, an enzyme. Run translation first.', 'השרשרת החדשה מתקפלת מעצמה לצורה תלת-ממדית קומפקטית, לפי האופן שבו חומצות האמינו שלה נמשכות ונדחות זו מזו. הצורה היא מה שמאפשר לה לעבוד: תעלה, קולטן, אנזים. הריצו קודם תרגום.'), run: () => { if (!made) { readout(L('Run 2. Translation first.', 'הריצו קודם את 2. תרגום.')); return; } foldT = foldT ? 0 : 1; readout(foldT ? L('Folded: the protein has its working shape', 'מקופל: לחלבון יש את הצורה שבה הוא עובד') : L('Unfolded chain', 'שרשרת לא מקופלת')); } },
      { icon: '🧬', label: B('A mutation', 'מוטציה'), toggle: true, caption: B('Change one letter in the gene: here it turns codon 7 into a STOP signal. Run translation again: the ribosome stops early and the protein is cut short. One wrong letter like this causes diseases such as some forms of Duchenne muscular dystrophy.', 'שנו אות אחת בגן: כאן היא הופכת את קודון 7 לאות STOP. הריצו שוב תרגום: הריבוזום עוצר מוקדם והחלבון נקטע. אות שגויה אחת כזו גורמת למחלות, למשל לחלק מהמקרים של ניוון שרירים מסוג דושן.'), run: (on) => { mut = on; } },
    ],
  };
}

// ---------------------------------------------------------------- actin & myosin
function muscleScene(stage, { readout, L }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [8] });
  D('actin', 'Actin (thin filaments)', 'אקטין (חוטים דקים)', 'Thin filaments anchored in the Z-discs: two strands of bead-like actin proteins twisted round each other. Myosin heads grab and pull them.', 'חוטים דקים המעוגנים בדיסקות ה-Z: שני גדילים של חלבוני אקטין דמויי חרוזים שמלופפים זה על זה. ראשי המיוזין תופסים ומושכים אותם.', '#ef4444');
  D('myosin', 'Myosin (thick filaments)', 'מיוזין (חוטים עבים)', 'Thick filaments made of hundreds of myosin molecules: their tails bundle into the shaft, and their paired heads stick out on levers. When Ca²⁺ is present the heads bind actin and swing (the power stroke), using ATP: the sliding filament model. The heads point opposite ways on the two halves, meeting at the M-line in the middle.', 'חוטים עבים שבנויים ממאות מולקולות מיוזין: הזנבות שלהן מתאגדים לפיר, והראשים הזוגיים בולטים על זרועות. כשיש Ca²⁺ הראשים נקשרים לאקטין ומתנדנדים (מכת הכוח), בעזרת ATP: מודל החוטים המחליקים. בשני החצאים הראשים פונים לכיוונים הפוכים, ונפגשים בקו ה-M שבאמצע.', '#5b8def');
  D('zline', 'Z-discs', 'דיסקות Z', 'The ends of one contracting unit (sarcomere): a zig-zag lattice of α-actinin that holds the thin filaments. They move closer as the muscle shortens.', 'הקצוות של יחידת התכווצות אחת (סרקומר): סריג זיגזג של אלפא-אקטינין שמחזיק את החוטים הדקים. הן מתקרבות כשהשריר מתקצר.', '#94a3b8');
  D('titin', 'Titin', 'טיטין', 'The largest protein in the body: a molecular spring from the Z-disc to the thick filament. It keeps the thick filament centred and springs back when a stretched muscle relaxes.', 'החלבון הגדול ביותר בגוף: קפיץ מולקולרי מדיסקת ה-Z אל החוט העבה. הוא שומר את החוט העבה במרכז וקופץ בחזרה כששריר מתוח נרפה.', '#facc15');
  D('tropomyosin', 'Tropomyosin (with troponin)', 'טרופומיוזין (עם טרופונין)', 'The dark strand in each actin groove, with troponin (small knobs) along it. At rest it covers the spots where myosin would grab. When Ca²⁺ binds troponin, the strand rolls aside and uncovers them.', 'הגדיל הכהה בכל חריץ של האקטין, ועליו טרופונין (גבשושיות קטנות). במנוחה הוא מכסה את המקומות שבהם המיוזין היה נתפס. כשה-Ca²⁺ נקשר לטרופונין, הגדיל מתגלגל הצידה וחושף אותם.', '#334155');
  // (owner, 2026-11-15: the sourced "real" model and the PDB structure are removed; the drawn sarcomere does it all)
  // drawn the textbook way: front rows of thin filaments at y = −1.5, 0, 1.5 with thick filaments between (y = ±0.75);
  // a back row of thin filaments (z = −1) shows the lattice in depth
  const LEN = 2.4, THICK = 1.6;
  const ROWS = [[-1.5, 0], [0, 0], [1.5, 0], [-0.75, -1], [0.75, -1]];
  const zDisc = () => {
    const g = new THREE.Group();
    // a thin slab just as deep as the filament lattice (z = 0 … −1), so it doesn't stand out as a big disc from the side or above
    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.05, 4.1, 1.7, 2, 0.02), mat('#94a3b8', { opacity: 0.28 }));
    plate.material.depthWrite = false; plate.position.z = -0.5; g.add(plate);
    const zig = [];
    for (const z of [0.25, -0.75]) { const pts = []; for (let i = 0; i <= 20; i++) pts.push(V(i % 2 ? 0.09 : -0.09, -1.95 + i * 0.195, z)); zig.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05), 80, 0.03, 5, false)); }
    g.add(meshOf(zig, mat('#cbd5e1', { rough: 0.4 })));
    return g;
  };
  const zl = zDisc(), zr = zDisc();
  stage.add(zl, 'zline'); stage.add(zr, 'zline');
  // a thin filament, local +x from its Z-disc toward the middle: two strands of actin beads, half a twist every 7
  const filament = (back) => {
    const beads = [];
    for (const s of [0, 1]) for (let i = 0; i * 0.11 + s * 0.055 < LEN; i++) {
      const x = i * 0.11 + s * 0.055, f = x / 0.11 * (Math.PI / 7) + s * Math.PI;
      beads.push(new THREE.SphereGeometry(0.062, 10, 8).translate(x, Math.cos(f) * 0.05, Math.sin(f) * 0.05));
    }
    return meshOf(beads, mat(back ? '#c2413b' : '#ef4444', { rough: 0.45 }));
  };
  const strand = () => { // tropomyosin in the groove, troponin knobs every 7 actins
    const pts = [];
    for (let i = 0; i <= 48; i++) { const x = (i / 48) * LEN, f = x / 0.11 * (Math.PI / 7) + Math.PI / 2; pts.push(V(x, Math.cos(f) * 0.085, Math.sin(f) * 0.085)); }
    const geos = [new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.018, 5, false)];
    for (let x = 0.35; x < LEN; x += 0.77) { const f = x / 0.11 * (Math.PI / 7) + Math.PI / 2; geos.push(lumpGeo(V(x, Math.cos(f) * 0.11, Math.sin(f) * 0.11), 0.035, { seed: x * 10, amp: 0.1, stretch: [1.6, 1, 1] })); }
    return meshOf(geos, mat('#334155', { rough: 0.5 }));
  };
  const actL = new THREE.Group(), actR = new THREE.Group();
  const tropo = [];
  for (const [grp, flip] of [[actL, false], [actR, true]]) {
    for (const [y, z] of ROWS) {
      const f = filament(z < 0); f.position.set(0, y, z); if (flip) f.rotation.y = Math.PI; grp.add(f);
      const tm = strand(); tm.position.copy(f.position); tm.rotation.y = f.rotation.y; tm.userData.flip = flip; grp.add(tm); tropo.push(tm);
    }
  }
  stage.add(actL, 'actin'); stage.add(actR, 'actin');
  tropo.forEach((tm) => stage.add(tm, 'tropomyosin', tm.parent));
  // thick filaments: a shaft of bundled tails, bare in the middle, with the M-line joining them; heads on levers
  const myo = new THREE.Group();
  const shaft = [], heads = [];
  const headMat = mat('#93c5fd', { rough: 0.4 }), leverMat = mat('#60a5fa', { rough: 0.5 });
  // the cross-bridge geometry: the motor domain sits REACH from the filament when bound to actin; it binds PRE away from
  // the M-line (cocked) and is carried STROKE toward it by the actin it holds; detached, it lifts by LIFT
  const REACH = 0.5, PRE = 0.17, LIFT = 0.13, LEVER_GEO = new THREE.CylinderGeometry(0.026, 0.032, 1, 6);
  for (const yF of [-0.75, 0.75]) {
    for (let k = 0; k < 3; k++) {
      const pts = [];
      for (let i = 0; i <= 40; i++) { const x = -THICK + (i / 40) * THICK * 2, a = x * 5 + (k * Math.PI * 2) / 3; pts.push(V(x, yF + Math.cos(a) * 0.045, Math.sin(a) * 0.045)); }
      shaft.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.04, 6, false));
    }
    for (let x = 0.3; x <= 1.51; x += 0.2) for (const side of [-1, 1]) for (const dirY of [1, -1]) {
      const hx = side * x, zOff = (Math.round(x * 10) % 4 < 2 ? 0.06 : -0.06);
      const geos = [];
      for (const tw of [-1, 1]) { // two heads per myosin molecule, on one lever
        geos.push(lumpGeo(V(tw * 0.035, 0, tw * 0.05), 0.085, { stretch: [0.8, 1.45, 0.85], seed: tw + x * 7, amp: 0.12 }));
      }
      const h = new THREE.Group();
      h.position.set(hx, yF + dirY * 0.04, zOff);
      const motor = meshOf(geos, headMat), lever = new THREE.Mesh(LEVER_GEO, leverMat);
      h.add(motor, lever);
      const cd = -Math.sign(hx);
      h.userData = { cd, dirY, motor, lever, group: (Math.round(x * 5) + (dirY > 0 ? 0 : 1) + (yF > 0 ? 1 : 0)) % 2, x: -cd * PRE, y: dirY * (REACH - LIFT), attached: false, from: 0, at: 0 };
      myo.add(h); heads.push(h);
    }
  }
  myo.add(meshOf(shaft, mat('#5b8def', { rough: 0.5 })));
  const mline = []; for (const z of [0.2, -0.2]) mline.push(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 6).translate(0, 0, z));
  myo.add(meshOf(mline, mat('#1e3a8a')));
  stage.add(myo, 'myosin');
  // titin: a spring from each Z-disc to the end of each thick filament
  const coil = (() => { const pts = []; for (let i = 0; i <= 120; i++) { const t = i / 120, a = t * 18 * Math.PI; pts.push(V(t, Math.cos(a) * 0.035, Math.sin(a) * 0.035)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.012, 4, false); })();
  const titins = [];
  for (const side of [-1, 1]) for (const yF of [-0.75, 0.75]) { const t = new THREE.Mesh(coil, mat('#facc15', { rough: 0.5 })); t.position.set(0, yF + 0.1, 0.12); if (side > 0) t.rotation.y = Math.PI; t.userData.side = side; stage.add(t, 'titin'); titins.push(t); }
  let mode = 'rest'; // rest (no Ca²⁺) | contract | rigor (no ATP)
  let c = 0, roll = 0, cycleT = 0;
  const HALF_P = 0.9; // each group holds on for this long, then lets go while the other group pulls
  const up = V(0, 1, 0), m = V(), dir = V();
  const poseHead = (h) => { // lever from the filament to the motor domain; the motor domain upright when bound
    const u = h.userData;
    m.set(u.x, u.y, 0); const len = m.length(); dir.copy(m).divideScalar(len);
    u.lever.position.copy(dir).multiplyScalar((len - 0.1) / 2); u.lever.scale.set(1, Math.max(0.05, len - 0.1), 1); u.lever.quaternion.setFromUnitVectors(up, dir);
    u.motor.position.copy(m);
    if (u.attached) u.motor.quaternion.identity(); // planted on the actin: the lever swings, the head stays put
    else u.motor.quaternion.setFromUnitVectors(up, dir); // free: in line with its lever (the head is symmetric end to end)
  };
  const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  stage.onUpdate((dt, t) => {
    const held = mode === 'contract' && c >= 1; // fully shortened: every head grips and holds still (owner, 2026-11-16)
    if (mode === 'contract' && !held) { c = Math.min(1, c + dt * 0.22); cycleT += dt; } // the filaments slide while heads pull
    else if (mode === 'rest') c += (0 - c) * Math.min(1, dt * 1.2); // relaxed: they slide back
    // (rigor: the sarcomere stays where it locked)
    const half = 2.6 - c * 0.9, slid = c * 0.9; // how far each thin filament has moved toward the M-line
    zl.position.x = -half; zr.position.x = half;
    actL.position.x = -half; actR.position.x = half;
    titins.forEach((ti) => { ti.position.x = ti.userData.side * half; ti.scale.x = Math.max(0.05, half - THICK - 0.02); });
    // the cross-bridge cycle: grab, power stroke (the lever swings toward the M-line), let go, re-cock;
    // at rest the heads are cocked but cannot reach; in rigor they stay stuck at the end of the stroke
    heads.forEach((h) => {
      const u = h.userData;
      if (held) { // the lifted heads come down onto the actin where they are; nothing else moves
        if (!u.attached) { u.attached = true; }
        u.y += (u.dirY * REACH - u.y) * Math.min(1, dt * 6);
      } else if (mode === 'contract') {
        const turn = Math.floor(cycleT / HALF_P), p = (cycleT % HALF_P) / HALF_P;
        const bound = (turn + u.group) % 2 === 0;
        if (bound && !u.attached) { u.attached = true; u.at = slid; } // lands on an actin site, cocked
        if (!bound && u.attached) { u.attached = false; u.from = u.x; } // ATP binds: it lets go where its stroke ended
        if (u.attached) { u.x = u.cd * (-PRE + (slid - u.at)); u.y = u.dirY * REACH; } // carried with the actin: the power stroke
        else { const k = ease(p); u.x = u.from + (-u.cd * PRE - u.from) * k; u.y = u.dirY * (REACH - LIFT * Math.sin(Math.PI * Math.min(1, p * 1.15))); } // lifts, re-cocks, comes back down
      } else if (mode === 'rigor') { // no ATP: every head stays bound at the end of its stroke
        if (!u.attached) { u.attached = true; }
        u.x += (u.cd * 0.12 - u.x) * Math.min(1, dt * 6); u.y += (u.dirY * REACH - u.y) * Math.min(1, dt * 6);
      } else { // at rest: cocked, held off the actin (tropomyosin covers the sites), a little thermal jiggle
        u.attached = false;
        u.x += (-u.cd * PRE + 0.012 * Math.sin(t * 3 + h.position.x * 9) - u.x) * Math.min(1, dt * 6); u.y += (u.dirY * (REACH - LIFT) - u.y) * Math.min(1, dt * 6);
      }
      poseHead(h);
    });
    headMat.emissive.set(mode === 'rigor' ? '#7f1d1d' : '#000');
    roll += ((mode === 'rest' ? 0 : 0.7) - roll) * Math.min(1, dt * 3);
    tropo.forEach((tm) => { tm.rotation.x = tm.userData.flip ? -roll : roll; });
    readout(`${L('Sarcomere length', 'אורך הסרקומר')}: <b>${(half * 2 * 0.45).toFixed(2)} µm</b> ${mode === 'contract' ? '— ' + L('contracting', 'מתכווץ') : mode === 'rigor' ? '— ' + L('locked (no ATP)', 'נעול (בלי ATP)') : ''}`);
  });
  heads.forEach(poseHead);
  const act = (key, icon, en, he, cen, che) => ({ icon, label: B(en, he), caption: B(cen, che), radio: true, run: () => { if (key === 'contract' && mode !== 'contract') cycleT = 0; mode = key; } });
  return {
    home: { pos: V(0.9, 1.1, 9.6), target: V(0, -0.05, -0.3) },
    actions: [
      act('contract', '💪', 'Ca²⁺ arrives: contract', 'Ca²⁺ מגיע: התכווצות', 'Calcium binds troponin and tropomyosin (dark strands) rolls aside. A myosin head binds to actin and holds on while its lever swings toward the middle (the power stroke): it pulls the actin along, squeezing the filaments past each other. Then ATP makes it let go; it re-cocks and binds again further along. Half the heads pull while the others re-cock, like hands climbing a rope, so the filaments never slip back and the Z-discs come closer. Titin (yellow springs) shortens.', 'סידן נקשר לטרופונין והטרופומיוזין (הגדילים הכהים) מתגלגל הצידה. ראש מיוזין נקשר לאקטין ומחזיק בו בזמן שהזרוע שלו מתנופפת לכיוון האמצע (מכת הכוח): הוא מושך את האקטין איתו ודוחק את החוטים זה על פני זה. אחר כך ATP גורם לו לשחרר; הוא נדרך מחדש ונקשר שוב קצת הלאה. חצי מהראשים מושכים בזמן שהאחרים נדרכים, כמו ידיים שמטפסות על חבל, כך שהחוטים אף פעם לא מחליקים אחורה ודיסקות ה-Z מתקרבות. הטיטין (קפיצים צהובים) מתקצר.'),
      act('rest', '😌', 'Relax (no Ca²⁺)', 'הרפיה (בלי Ca²⁺)', 'Calcium is pumped away: tropomyosin covers the binding sites again, the heads stay cocked but cannot grab, and the filaments slide back.', 'הסידן נשאב החוצה: הטרופומיוזין מכסה שוב את אתרי הקישור, הראשים נשארים דרוכים אבל לא יכולים לתפוס, והחוטים מחליקים חזרה.'),
      act('rigor', '🪨', 'No ATP: rigor', 'בלי ATP: קשיחות', 'A myosin head needs a new ATP to let go of actin. Without ATP every head stays stuck at the end of its stroke (dark red): the muscle locks (rigor mortis after death).', 'ראש מיוזין צריך ATP חדש כדי לשחרר את האקטין. בלי ATP כל ראש נשאר תקוע בסוף המכה שלו (אדום כהה): השריר ננעל (קשיחות המוות).'),
    ],
  };
}

// ---------------------------------------------------------------- dopamine transporter (reuptake)
function transporterScene(stage, { readout, L }) {
  membrane(stage, 9, 5, [{ x: 0.05, r: 1.25 }]);
  stage.definePart({ id: 'dat', name: B('Dopamine transporter (DAT)', 'מוביל הדופמין (DAT)'), desc: B('A protein that carries dopamine back into the terminal after it has been released (reuptake), ending the signal. Twelve helices cross the membrane: a fixed "scaffold" (darker) and a "bundle" of four (lighter) that rocks against it, so the pocket in the middle opens to the outside, closes, then opens to the inside (alternating access). Each dopamine travels with two Na⁺ and one Cl⁻: the Na⁺ gradient made by the Na⁺/K⁺ pump powers it. Green: sugar chains outside. The switch shows the real structure (PDB 4XP1).', 'חלבון שמחזיר דופמין לטרמינל אחרי שהשתחרר (קליטה מחדש), וכך מסיים את האות. שנים-עשר סלילים חוצים את הקרום: "פיגום" קבוע (כהה) ו"צרור" של ארבעה (בהיר) שמתנדנד מולו, כך שהכיס שבאמצע נפתח החוצה, נסגר, ואז נפתח פנימה (גישה מתחלפת). כל דופמין עובר יחד עם שני Na⁺ ו-Cl⁻ אחד: מפל ה-Na⁺ שיוצרת משאבת Na⁺/K⁺ מספק את האנרגיה. בירוק: שרשראות סוכר בחוץ. המתג מראה את המבנה האמיתי (PDB 4XP1).'), color: '#14b8a6', chapters: [4] });
  stage.definePart({ id: 'ions', name: B('Na⁺ and Cl⁻ (carried along)', 'Na⁺ ו-Cl⁻ (מועברים יחד)'), desc: B('Two sodium ions (orange) and one chloride ion (green) ride in with every dopamine. Sodium flowing down its gradient is what drives dopamine in against its own.', 'שני יוני נתרן (כתומים) ויון כלוריד אחד (ירוק) נכנסים יחד עם כל דופמין. הנתרן שזורם במורד המפל שלו הוא שמניע את הדופמין פנימה נגד המפל שלו עצמו.'), color: '#f97316', chapters: [4] });
  stage.definePart({ id: 'blocker', name: B('Blocking drug', 'תרופה/סם חוסם'), desc: B('Cocaine (or an SSRI at the serotonin transporter) sits in the transporter\'s pocket while it is open to the outside, and jams it there.', 'קוקאין (או SSRI במוביל הסרוטונין) יושב בכיס של המוביל כשהוא פתוח החוצה, ותוקע אותו במצב הזה.'), color: '#e2e8f0', chapters: [4] });
  const lblOut = textSprite(L('synapse (outside)', 'הסינפסה (בחוץ)'), { size: 0.32, color: '#475569' }); lblOut.position.set(-3.2, 2.2, 0); stage.root.add(lblOut);
  const lblIn = textSprite(L('inside the terminal', 'בתוך הטרמינל'), { size: 0.32, color: '#475569' }); lblIn.position.set(-3.2, -2.2, 0); stage.root.add(lblIn);
  // drawn the textbook way (src/visual/proteins.js): pose(s) rocks it from open-outside (0) to open-inside (1)
  const tr = transporterModel();
  tr.g.scale.setScalar(1.15);
  stage.add(tr.g, 'dat');
  const SITE = V(0, 0.05, 0.12), MOUTH = V(0.05, 1.45, 0.25), EXIT = V(0.1, -1.65, 0.3);
  const rs = realAndSimple();
  const ready = uprightProtein('4XP1', { chains: ['A'], orient: { mode: 'long', chains: ['A'] }, height: 2.6, at: V(0, 0, 0), colors: ['#14b8a6'] })
    .then(({ group }) => { stage.add(group, 'dat'); rs.add(group, tr.g); stage.resetView(); });
  // cocaine: a small cluster of white dots in the pocket (owner, 2026-11-15: not the full molecule)
  const blocker = new THREE.Group();
  for (const [x, y, z] of [[0, 0.12, 0], [0.16, -0.05, 0.08], [-0.15, -0.07, -0.06], [0.02, -0.18, 0.12]]) { const d = sphere(0.12, '#f8fafc'); d.position.set(x, y, z); blocker.add(d); }
  blocker.position.set(0.02, 0.55, 0.3);
  blocker.visible = false;
  stage.add(blocker, 'blocker');
  // the ions that ride along (two Na⁺, one Cl⁻); they wait near the outer mouth
  const ions = [sphere(0.1, '#f97316'), sphere(0.1, '#f97316'), sphere(0.12, '#22c55e')];
  const ionWait = [V(-0.55, 1.75, 0.4), V(0.6, 1.8, 0.2), V(0.35, 2.05, 0.55)], ionSite = [V(-0.18, 0.1, 0.2), V(0.2, -0.05, 0.2), V(0.05, 0.3, 0.05)];
  ions.forEach((s2, i) => { s2.position.copy(ionWait[i]); stage.add(s2, 'ions'); });
  // dopamine in the synapse, each drawn as the molecule's outline (a ring with two OH and its amine tail)
  const N = 26;
  const daMesh = new THREE.InstancedMesh(dopamineGeo(0.85), mat('#fbbf24', { emissive: '#7c4a03', rough: 0.4 }), N);
  daMesh.raycast = () => {};
  stage.root.add(daMesh);
  const P = Array.from({ length: N }, (_, i) => ({ p: V(rand(-3.5, 3.5), rand(1.2, 2.6), rand(-1.5, 1.5)), v: V(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.5), state: 'free', spin: V(rand(0, 6), rand(0, 6), rand(0, 6)), w: rand(0.6, 1.6) * (i % 2 ? 1 : -1) }));
  let cleared = 0, mode = 'normal', cyc = null, s = 0, rest = 0;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = V(1, 1, 1);
  const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const resetIons = () => ions.forEach((s2, i) => { s2.visible = true; s2.position.copy(ionWait[i]); });
  stage.onUpdate((dt) => {
    // one transport cycle (3.2 s): into the pocket (open outside) → rock shut → out to the inside → rock back empty
    if (cyc) {
      cyc.t += dt;
      const t = cyc.t, d = cyc.d;
      if (t < 0.8) { s = 0; d.p.lerpVectors(cyc.from, SITE, ease(t / 0.8)); ions.forEach((s2, i) => s2.position.lerpVectors(ionWait[i], ionSite[i], ease(t / 0.8))); }
      else if (t < 1.6) { s = ease((t - 0.8) / 0.8); d.p.copy(SITE); }
      else if (t < 2.4) { s = 1; const u = ease((t - 1.6) / 0.8); d.p.lerpVectors(SITE, EXIT, u); ions.forEach((s2, i) => s2.position.lerpVectors(ionSite[i], EXIT.clone().add(V((i - 1) * 0.35, -0.1 - i * 0.1, 0)), u)); }
      else {
        s = 1 - ease((t - 2.4) / 0.8);
        if (d.state === 'in') { d.state = 'done'; cleared++; d.p.set(rand(-3, 3), rand(-2.6, -1.6), rand(-1.4, 1.4)); }
        ions.forEach((s2) => { s2.visible = false; });
      }
      if (t >= 3.2) { cyc = null; rest = 0.4; resetIons(); }
    } else {
      s += (0 - s) * Math.min(1, dt * 4);
      rest -= dt;
    }
    tr.pose(s);
    for (const d of P) {
      if (d.state !== 'free') continue;
      d.p.addScaledVector(d.v, dt);
      if (d.p.y < 1.15 || d.p.y > 2.8) d.v.y *= -1;
      if (Math.abs(d.p.x) > 3.8) d.v.x *= -1;
      if (Math.abs(d.p.z) > 1.8) d.v.z *= -1;
      d.v.add(MOUTH.clone().sub(d.p).multiplyScalar(dt * 0.15)).clampLength(0, 0.9); // gently drawn to the mouth
      if (!cyc && rest <= 0 && mode !== 'blocked' && d.p.distanceTo(MOUTH) < 0.75) { d.state = 'in'; cyc = { t: 0, d, from: d.p.clone() }; }
    }
    // keep the synapse "topped up" so the demo keeps running
    if (P.filter((d) => d.state === 'free').length < 6) P.filter((d) => d.state === 'done').slice(0, 4).forEach((d) => { d.state = 'free'; d.p.set(rand(-3.5, 3.5), rand(1.5, 2.6), rand(-1.5, 1.5)); });
    P.forEach((d, i) => { d.spin.y += dt * d.w; d.spin.x += dt * d.w * 0.6; q.setFromEuler(e.set(d.spin.x, d.spin.y, d.spin.z)); m4.compose(d.p, q, one); daMesh.setMatrixAt(i, m4); });
    daMesh.instanceMatrix.needsUpdate = true;
    blocker.visible = mode === 'blocked';
    const inSynapse = P.filter((d) => d.state === 'free').length;
    const st = s < 0.2 ? L('open to the outside', 'פתוח החוצה') : s > 0.8 ? L('open to the inside', 'פתוח פנימה') : L('closed (occluded)', 'סגור');
    readout(`${L('Dopamine in the synapse', 'דופמין בסינפסה')}: <b>${inSynapse}</b> · ${L('taken back in', 'נקלט מחדש')}: <b>${cleared}</b><br>${L('Transporter', 'המוביל')}: ${mode === 'blocked' ? '⛔ ' + L('jammed open to the outside', 'תקוע פתוח החוצה') : st}`);
  });
  return {
    ready,
    home: { pos: V(0, 1, 10), target: V(0, 0.3, 0) },
    actions: [
      rs.action,
      { icon: '🔁', label: B('Normal reuptake', 'קליטה מחדש רגילה'), radio: true, caption: B('Dopamine (yellow) with two Na⁺ and one Cl⁻ enters the pocket from the synapse; the transporter rocks shut, opens to the inside and lets them go; then it rocks back, empty, for the next one. So the signal ends and the dopamine can be reused.', 'דופמין (צהוב), שני Na⁺ ו-Cl⁻ אחד נכנסים לכיס מהסינפסה; המוביל מתנדנד ונסגר, נפתח פנימה ומשחרר אותם; ואז חוזר, ריק, לבא בתור. כך האות נגמר והדופמין יכול לשמש שוב.'), run: () => { mode = 'normal'; } },
      { icon: '❄️', label: B('Cocaine blocks the transporter', 'קוקאין חוסם את המוביל'), radio: true, caption: B('Cocaine (the white dots) sits in the pocket and jams the transporter open to the outside. Dopamine is no longer cleared, so it piles up in the synapse and keeps stimulating receptors. SSRIs do the same at the serotonin transporter.', 'קוקאין (הנקודות הלבנות) יושב בכיס ותוקע את המוביל פתוח החוצה. הדופמין כבר לא מפונה, ולכן מצטבר בסינפסה וממשיך לגרות קולטנים. SSRI עושים אותו דבר במוביל הסרוטונין.'), run: () => { mode = 'blocked'; if (cyc && cyc.t < 0.8) { cyc.d.state = 'free'; cyc.d.p.copy(MOUTH).add(V(0, 0.3, 0)); cyc = null; resetIons(); } } },
    ],
  };
}

// ---------------------------------------------------------------- RNA (owner, 2026-11-15: deeper DNA levels)
// One short gene, letter by letter: RNA polymerase reads the template strand and builds the matching messenger RNA
// (U where DNA has T); then a transfer RNA whose anticodon fits the first codon brings its amino acid.
// Drawn like the textbook figure (owner, 2026-11-15: better-looking models): each letter is a nucleotide (a base
// plate, long for A and G, short for T, C and U, on a sugar with its phosphate), the backbones run through the
// phosphates, paired bases are joined by hydrogen bonds (2 for A–T, 3 for G–C), and the polymerase opens a bubble.
function rnaScene(stage, { readout, L }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [5] });
  D('dnaStrands', 'DNA (a short gene)', 'DNA (גן קצר)', 'Two strands: the coding strand (top) and the template strand (below it), which the enzyme reads. Each letter is a nucleotide: a base (the coloured plate) on a sugar (the pentagon) with a phosphate (the bead); the bases pair across, joined by hydrogen bonds.', 'שני גדילים: הגדיל המקודד (למעלה) וגדיל התבנית (מתחתיו), שהאנזים קורא. כל אות היא נוקלאוטיד: בסיס (הלוח הצבעוני) על סוכר (המחומש) עם פוספט (החרוז); הבסיסים מזדווגים זה מול זה, מחוברים בקשרי מימן.', '#5b8def');
  D('polymerase', 'RNA polymerase', 'RNA פולימראז', 'The enzyme that opens the DNA (the "bubble"), reads the template strand and links RNA nucleotides into a matching strand: transcription.', 'האנזים שפותח את ה-DNA (ה"בועה"), קורא את גדיל התבנית ומחבר נוקלאוטידים של RNA לגדיל תואם: שעתוק.', '#a855f7');
  D('mrna', 'Messenger RNA (mRNA)', 'RNA שליח (mRNA)', 'A single-stranded copy of the gene. It differs from DNA in three ways: one strand, ribose sugar (with an extra OH, the small red bead), and uracil (U) in place of thymine (T). It leaves the nucleus and is read in threes (codons).', 'עותק חד-גדילי של הגן. הוא שונה מ-DNA בשלושה דברים: גדיל אחד, סוכר ריבוז (עם OH נוסף, החרוז האדום הקטן), ואורציל (U) במקום תימין (T). הוא יוצא מהגרעין ונקרא בשלשות (קודונים).', '#f59e0b');
  D('uracil', 'Uracil (U)', 'אורציל (U)', 'RNA\'s fourth base, used instead of thymine. It pairs with adenine.', 'הבסיס הרביעי של RNA, במקום תימין. הוא מתחבר לאדנין.', BASE_COLORS.U);
  D('trna', 'Transfer RNA (tRNA)', 'RNA מעביר (tRNA)', 'A small RNA folded on itself into a cloverleaf: paired stems (the rungs) end in loops. The bottom loop here holds three letters (the anticodon) that fit one codon; the top stem carries the matching amino acid on its CCA tail.', 'RNA קטן שמתקפל על עצמו לתלתן: גבעולים מזווגים (השלבים) שמסתיימים בלולאות. הלולאה התחתונה כאן מחזיקה שלוש אותיות (האנטי-קודון) שמתאימות לקודון אחד; הגבעול העליון נושא את חומצת האמינו המתאימה על זנב ה-CCA שלו.', '#14b8a6');
  D('aminoacid', 'Amino acid', 'חומצת אמינו', 'The building block of proteins. Each codon of the mRNA stands for one of 20 amino acids (AUG = methionine, the start).', 'אבן הבניין של חלבונים. כל קודון ב-mRNA מייצג אחת מ-20 חומצות אמינו (AUG = מתיונין, ההתחלה).', '#10b981');
  const COL = BASE_COLORS;
  const COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const CODING = 'ATGCCTAAGTGA'.split('');
  const N = CODING.length, SP = 0.62, X0 = -((N - 1) * SP) / 2;
  const xAt = (i) => X0 + i * SP;
  const TOP = 2.82, BOT = 1.63, RNA_Y = 1.02; // backbone heights
  const purine = (l) => l === 'A' || l === 'G';
  const sugarGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 5); sugarGeo.rotateX(Math.PI / 2);
  // one nucleotide: base plate pointing `dir` (+1 up, −1 down) from its sugar; children[0] is the base (it flashes)
  const nucleotide = (l, x, y, dir, part, ribose = false) => {
    const g = new THREE.Group();
    const len = purine(l) ? 0.5 : 0.36;
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.42, len, 0.12, 2, 0.04), mat(COL[l], { rough: 0.45 }));
    base.position.y = dir * (0.1 + len / 2); g.add(base);
    const t = textSprite(l, { size: 0.24, color: '#1f2937' }); t.position.set(0, dir * (0.1 + len / 2), 0.1); g.add(t);
    const sug = new THREE.Mesh(sugarGeo, mat(ribose ? '#fcd34d' : '#cbd5e1', { rough: 0.5 })); g.add(sug);
    const ph = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 9), mat('#f97316', { rough: 0.4 })); ph.position.set(-SP / 2, -dir * 0.02, 0); g.add(ph);
    if (ribose) { const oh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat('#ef4444')); oh.position.set(0.1, -dir * 0.1, 0.06); g.add(oh); }
    g.position.set(x, y, 0);
    stage.add(g, part);
    return g;
  };
  // the two DNA strands: bases pointing in, hydrogen bonds between them
  const top = CODING.map((l, i) => nucleotide(l, xAt(i), TOP, -1, 'dnaStrands'));
  const bot = CODING.map((l, i) => nucleotide(COMP[l], xAt(i), BOT, 1, 'dnaStrands'));
  const hb = CODING.map((l, i) => { const n = l === 'G' || l === 'C' ? 3 : 2; const geos = []; for (let k = 0; k < n; k++) geos.push(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 4).translate((k - (n - 1) / 2) * 0.1, 0, 0.04)); const m = meshOf(geos, mat('#f8fafc', { opacity: 0.8 })); m.position.set(xAt(i), (TOP - 0.1 - (purine(l) ? 0.5 : 0.36) + BOT + 0.1 + (purine(COMP[l]) ? 0.5 : 0.36)) / 2, 0); stage.add(m, 'dnaStrands'); return m; });
  // the backbones run through the phosphates; rebuilt while the bubble opens and closes
  const rails = [TOP, BOT].map((y) => { const m = new THREE.Mesh(new THREE.BufferGeometry(), mat('#94a3b8', { rough: 0.4 })); stage.add(m, 'dnaStrands'); return m; });
  const setRail = (m, nts, dir) => { const pts = [V(xAt(0) - SP, nts[0].position.y - dir * 0.02, 0)]; nts.forEach((g) => pts.push(V(g.position.x - SP / 2, g.position.y - dir * 0.02, 0), V(g.position.x, g.position.y, 0))); pts.push(V(xAt(N - 1) + SP / 2, nts[N - 1].position.y, 0)); m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.035, 6, false); };
  for (const [y, en, he] of [[2.5, 'coding strand', 'הגדיל המקודד'], [1.95, 'template strand', 'גדיל התבנית'], [0.85, 'mRNA', 'mRNA']]) { const t = textSprite(L(en, he), { size: 0.24, color: '#475569' }); t.position.set(xAt(0) - 1.35, y, 0); stage.root.add(t); }
  // the mRNA, built under the template as the polymerase moves (U where the coding strand has T)
  const rnaBack = rod(V(xAt(0) - 0.3, RNA_Y, 0), V(xAt(N - 1) + 0.3, RNA_Y, 0), 0.035, '#f59e0b'); rnaBack.scale.y = 0.001; stage.add(rnaBack, 'mrna');
  const rna = CODING.map((l, i) => { const r = l === 'T' ? 'U' : l; const g = nucleotide(r, xAt(i), RNA_Y, -1, r === 'U' ? 'uracil' : 'mrna', true); g.visible = false; g.userData.l = r; return g; });
  // codon brackets, under the mRNA
  for (let c = 0; c < N / 3; c++) { const br = box(SP * 3 - 0.08, 0.04, 0.04, '#f59e0b', { opacity: 0.6 }); br.position.set(xAt(c * 3 + 1), RNA_Y + 0.17, 0); stage.add(br, 'mrna'); }
  // RNA polymerase: a big two-jawed enzyme clamped round the DNA, see-through so the letters show
  const pol = meshOf([lumpGeo(V(0, 0.25, -0.1), 0.62, { stretch: [1.1, 1.05, 0.8], seed: 4, amp: 0.13 }), lumpGeo(V(0.35, -0.45, 0.05), 0.4, { stretch: [1.1, 0.8, 0.9], seed: 9, amp: 0.12 })], mat('#a855f7', { opacity: 0.42, rough: 0.4 }));
  pol.material.depthWrite = false;
  pol.position.set(xAt(0) - 1.2, 1.75, 0.15); stage.add(pol, 'polymerase');
  // a tRNA: the cloverleaf (stems with paired rungs, three loops) with its anticodon at the bottom (here facing up, to
  // meet the mRNA) and the amino acid on its CCA tail
  const trna = new THREE.Group();
  const tg = [], rungs = [];
  const stem = (a, b, w, n) => { const d = b.clone().sub(a).normalize(), side = V(-d.y, d.x, 0).multiplyScalar(w / 2); tg.push(loopGeo([a.clone().add(side), b.clone().add(side)], 0.045), loopGeo([a.clone().sub(side), b.clone().sub(side)], 0.045)); for (let k = 1; k < n; k++) { const p = a.clone().lerp(b, k / n); rungs.push(new THREE.CylinderGeometry(0.02, 0.02, w, 5).applyMatrix4(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), side.clone().normalize()), V(1, 1, 1)))); } };
  const loopAt = (c, r, a0) => { const pts = []; for (let k = 0; k <= 16; k++) { const a = a0 + (k / 16) * Math.PI * 1.6; pts.push(V(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, 0)); } tg.push(loopGeo(pts, 0.045)); };
  stem(V(0, -0.05, 0), V(0, -0.5, 0), 0.18, 5);                // anticodon stem
  tg.push(loopGeo([V(-0.09, -0.05, 0), V(-0.4, 0.12, 0), V(-SP, 0.22, 0), V(0, 0.27, 0), V(SP, 0.22, 0), V(0.4, 0.12, 0), V(0.09, -0.05, 0)], 0.045)); // anticodon loop
  stem(V(-0.15, -0.62, 0), V(-0.62, -0.5, 0), 0.18, 4); loopAt(V(-0.8, -0.47, 0), 0.2, -0.6); // D arm
  stem(V(0.15, -0.62, 0), V(0.62, -0.5, 0), 0.18, 4); loopAt(V(0.8, -0.47, 0), 0.2, Math.PI - 1.0 + Math.PI); // T arm
  stem(V(0, -0.72, 0), V(0, -1.1, 0), 0.18, 5);                // acceptor stem
  tg.push(loopGeo([V(0.09, -1.1, 0), V(0.14, -1.2, 0), V(0.05, -1.24, 0)], 0.04)); // CCA tail
  trna.add(meshOf(tg, mat('#14b8a6', { rough: 0.45 })), meshOf(rungs, mat('#99f6e4', { rough: 0.5 })));
  'UAC'.split('').forEach((l, k) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.32, 0.12, 2, 0.04), mat(COL[l]))); const t = textSprite(l, { size: 0.22, color: '#1f2937' }); t.position.z = 0.1; g.add(t); g.position.set((k - 1) * SP, 0.45, 0); trna.add(g); });
  stage.add(trna, 'trna');
  const aa = sphere(0.24, '#10b981'); aa.position.set(0, -1.45, 0); stage.add(aa, 'aminoacid', trna);
  const aaLbl = textSprite('Met', { size: 0.22, color: '#1f2937' }); aaLbl.position.set(0.55, -1.45, 0); trna.add(aaLbl);
  const TRNA_HOME = V(xAt(N - 1) + 1.9, -1.6, 0), TRNA_DOCK = V(xAt(1), RNA_Y - 1.32, 0);
  trna.position.copy(TRNA_HOME);
  let phase = null, built = 0, polX = pol.position.x, bubbleK = 0;
  // the bubble: near the polymerase the strands part (coding up, template down toward the new RNA)
  const placeDNA = () => {
    top.forEach((g, i) => { const k = bubbleK * Math.exp(-(((xAt(i) - polX) / 0.75) ** 2)); g.position.y = TOP + k * 0.38; hb[i].visible = k < 0.25; });
    bot.forEach((g, i) => { const k = bubbleK * Math.exp(-(((xAt(i) - polX) / 0.75) ** 2)); g.position.y = BOT - k * 0.3; });
    setRail(rails[0], top, -1); setRail(rails[1], bot, 1);
  };
  placeDNA();
  stage.onUpdate((dt, t) => {
    pol.position.y = 1.75 + Math.sin(t * 3) * 0.03;
    if (phase?.kind === 'tx') {
      phase.t += dt;
      const f = Math.min(1, phase.t / 5);
      const x = xAt(0) - 0.6 + f * ((N - 1) * SP + 1.2);
      pol.position.x = polX = x;
      bubbleK = Math.min(1, phase.t * 2) * (f < 1 ? 1 : 0);
      placeDNA();
      built = Math.max(built, Math.min(N, Math.floor((x - xAt(0) + 0.3) / SP) + 1));
      rna.forEach((g, i) => { g.visible = i < built; });
      rnaBack.scale.y = Math.max(0.001, built / N); rnaBack.position.x = xAt(0) - 0.3 + ((N - 1) * SP + 0.6) * (built / N) / 2;
      readout(`${L('mRNA', 'mRNA')}: <b>${rna.slice(0, built).map((g) => g.userData.l).join('')}</b>`);
      if (f >= 1) { phase = null; bubbleK = 0; placeDNA(); }
    } else if (phase?.kind === 'trna') {
      phase.t += dt;
      const f = Math.min(1, phase.t / 2.5), e = f * f * (3 - 2 * f);
      trna.position.lerpVectors(TRNA_HOME, TRNA_DOCK, e);
      if (f >= 1) { readout(L('Anticodon UAC fits codon AUG → the first amino acid, methionine (Met)', 'האנטי-קודון UAC מתאים לקודון AUG ← חומצת האמינו הראשונה, מתיונין (Met)')); phase = null; }
    }
    rna.forEach((g) => { if (g.userData.l === 'U') g.children[0].material.emissive.set(COL.U).multiplyScalar(phase?.kind === 'u' ? 0.4 + 0.4 * Math.sin(t * 6) : 0); });
  });
  const showAll = () => { built = N; rna.forEach((g) => { g.visible = true; }); rnaBack.scale.y = 1; rnaBack.position.x = xAt(0) - 0.3 + ((N - 1) * SP + 0.6) / 2; pol.position.x = polX = xAt(N - 1) + 0.9; bubbleK = 0; placeDNA(); };
  return {
    home: { pos: V(0.2, 0.4, 13.5), target: V(0.2, 0.5, 0) },
    actions: [
      { icon: '📝', label: B('Transcribe the gene', 'שעתוק הגן'), radio: true, caption: B('RNA polymerase (purple) slides along the DNA, opening a bubble as it goes; it reads the template strand letter by letter and builds the matching mRNA below it. The mRNA reads like the coding strand, except that every T becomes U.', 'ה-RNA פולימראז (סגול) מחליק לאורך ה-DNA ופותח בועה בדרכו; הוא קורא את גדיל התבנית אות אחר אות ובונה מתחתיו את ה-mRNA התואם. ה-mRNA נקרא כמו הגדיל המקודד, חוץ מזה שכל T הופך ל-U.'), run: () => { built = 0; rna.forEach((g) => { g.visible = false; }); phase = { kind: 'tx', t: 0 }; trna.position.copy(TRNA_HOME); } },
      { icon: '🔍', label: B('DNA vs RNA', 'DNA מול RNA'), radio: true, caption: B('Three differences: RNA has one strand, not two; its sugar is ribose (yellow, with an extra OH: the red bead), not deoxyribose (grey); and it uses uracil (U, flashing light blue) in place of thymine. RNA is also short-lived: a message, not an archive.', 'שלושה הבדלים: ל-RNA גדיל אחד, לא שניים; הסוכר שלו ריבוז (צהוב, עם OH נוסף: החרוז האדום) ולא דאוקסיריבוז (אפור); והוא משתמש באורציל (U, מהבהב בתכלת) במקום תימין. RNA גם קצר-חיים: הודעה, לא ארכיון.'), run: () => { showAll(); phase = { kind: 'u' }; readout(L('T in DNA → U in RNA', 'T ב-DNA ← U ב-RNA')); } },
      { icon: '🚚', label: B('A tRNA brings an amino acid', 'tRNA מביא חומצת אמינו'), radio: true, caption: B('The mRNA is read three letters (one codon) at a time. A transfer RNA whose anticodon (UAC) fits the first codon (AUG) docks there and delivers methionine, the first amino acid of every protein. In the cell this happens inside a ribosome.', 'ה-mRNA נקרא שלוש אותיות (קודון אחד) בכל פעם. RNA מעביר שהאנטי-קודון שלו (UAC) מתאים לקודון הראשון (AUG) נעגן שם ומוסר מתיונין, חומצת האמינו הראשונה של כל חלבון. בתא זה קורה בתוך ריבוזום.'), run: () => { showAll(); trna.position.copy(TRNA_HOME); phase = { kind: 'trna', t: 0 }; } },
    ],
  };
}

// ---------------------------------------------------------------- epigenetics (owner, 2026-11-15: deeper DNA levels)
// DNA is wound around histone spools (nucleosomes) like thread on beads. Chemical tags decide how tightly: acetyl
// tags on the histone tails loosen the beads so RNA polymerase can reach a gene (on); methyl tags on the DNA's
// cytosines pack them tight (off). The DNA letters never change; experience can change the tags.
function epigeneticsScene(stage, { readout, L }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [5] });
  D('histones', 'Histones (nucleosomes)', 'היסטונים (נוקלאוזומים)', 'Spool proteins. About 1.7 turns of DNA wind around each group of eight histones; their tails stick out and carry the tags.', 'חלבוני סליל. כ-1.7 סיבובים של DNA מתלפפים סביב כל קבוצה של שמונה היסטונים; הזנבות שלהם בולטים החוצה ונושאים את התגים.', '#a78bfa');
  D('chromatin', 'DNA wound on the histones', 'DNA מלופף על ההיסטונים', 'The two metres of DNA in each cell fit in the nucleus only because they are wound and packed. Packed tight, a gene cannot be read.', 'שני המטרים של DNA בכל תא נכנסים לגרעין רק כי הם מלופפים ודחוסים. כשהם דחוסים, אי אפשר לקרוא גן.', '#5b8def');
  D('gene', 'A gene', 'גן', 'The stretch of DNA (green) that RNA polymerase must reach to make its RNA.', 'קטע ה-DNA (ירוק) שה-RNA פולימראז צריך להגיע אליו כדי לייצר את ה-RNA שלו.', '#22c55e');
  D('acetyl', 'Acetyl tags', 'תגי אצטיל', 'Small chemical groups added to histone tails. They loosen the grip of the histones on the DNA, opening it: the gene turns on. Memory formation needs this.', 'קבוצות כימיות קטנות שנוספות לזנבות ההיסטונים. הן משחררות את אחיזת ההיסטונים ב-DNA ופותחות אותו: הגן נדלק. היווצרות זיכרון זקוקה לזה.', '#facc15');
  D('methyl', 'Methyl tags', 'תגי מתיל', 'A methyl group (CH₃) on cytosines of the DNA. It draws proteins that pack the DNA tight: the gene turns off. Some of these tags can last for life.', 'קבוצת מתיל (CH₃) על ציטוזינים ב-DNA. היא מושכת חלבונים שדוחסים את ה-DNA: הגן נכבה. חלק מהתגים האלה יכולים להחזיק לכל החיים.', '#ef4444');
  D('polymerase', 'RNA polymerase', 'RNA פולימראז', 'The enzyme that reads a gene into RNA, if it can reach it.', 'האנזים שקורא גן ל-RNA, אם הוא מצליח להגיע אליו.', '#a855f7');
  D('rna', 'RNA made from the gene', 'RNA שנוצר מהגן', 'Only an open gene is transcribed; the more RNA, the more of its protein the cell makes.', 'רק גן פתוח משועתק; ככל שיש יותר RNA, התא מייצר יותר מהחלבון שלו.', '#f59e0b');
  const NUC = 7, R = 0.5, MID = 3; // the gene runs between nucleosomes 3 and 4
  // DNA drawn as its two twisted strands with base-pair rungs (owner, 2026-11-15: better-looking models)
  const duplexGeo = (pts, r, turns) => { const c = new THREE.CatmullRomCurve3(pts), n = 90, A = [], Bs = [], rungs = []; const fr = c.computeFrenetFrames(n, false); for (let k = 0; k <= n; k++) { const t = k / n, p = c.getPointAt(t), a = t * turns * Math.PI * 2, nn = fr.normals[k], bb = fr.binormals[k]; const off = nn.clone().multiplyScalar(Math.cos(a) * r).addScaledVector(bb, Math.sin(a) * r); A.push(p.clone().add(off)); Bs.push(p.clone().sub(off)); if (k % 4 === 2) rungs.push(new THREE.CylinderGeometry(r * 0.28, r * 0.28, r * 2, 4).applyMatrix4(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), off.clone().normalize()), V(1, 1, 1)))); } return { strands: [new THREE.TubeGeometry(new THREE.CatmullRomCurve3(A), n * 2, r * 0.42, 5, false), new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Bs), n * 2, r * 0.42, 5, false)], rungs }; };
  const unitRod = (color, r) => { const d = duplexGeo([V(0, -0.5, 0), V(0, 0, 0), V(0, 0.5, 0)], r, 2.2); const g = new THREE.Group(); g.add(meshOf(d.strands, mat(color, { rough: 0.4 })), meshOf(d.rungs, mat('#e2e8f0', { rough: 0.5 }))); return g; };
  const setRod = (m, a, b) => { m.position.copy(a).lerp(b, 0.5); m.scale.set(1, Math.max(0.001, a.distanceTo(b)), 1); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); };
  const wrapAt = (t) => { const a = -Math.PI / 2 - 0.7 - t * 1.65 * Math.PI * 2; return V(Math.cos(a) * R, Math.sin(a) * R, -0.22 + t * 0.44); };
  const nucs = [], methyls = [], acetyls = [];
  for (let i = 0; i < NUC; i++) {
    const g = new THREE.Group();
    const lumps = []; for (let layer = 0; layer < 2; layer++) for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + layer * 0.4 + i; lumps.push(lumpGeo(V(Math.cos(a) * 0.19, Math.sin(a) * 0.19, (layer - 0.5) * 0.22), 0.19, { seed: i * 8 + k + layer * 4, amp: 0.12, stretch: [1, 1, 0.8] })); }
    const core = meshOf(lumps, mat(['#a78bfa', '#c4b5fd'][i % 2], { rough: 0.5 })); stage.add(core, 'histones', g);
    const pts = Array.from({ length: 40 }, (_, k) => wrapAt(k / 39));
    const wd = duplexGeo(pts, 0.075, 7); const wrapG = new THREE.Group(); wrapG.add(meshOf(wd.strands, mat('#5b8def', { rough: 0.4 })), meshOf(wd.rungs, mat('#e2e8f0', { rough: 0.5 }))); stage.add(wrapG, 'chromatin', g);
    for (const [a, len] of [[0.6, 0.45], [2.3, 0.4], [4.0, 0.5]]) {
      const tip = V(Math.cos(a) * (R + len), Math.sin(a) * (R + len), 0.2);
      stage.add(new THREE.Mesh(loopGeo([V(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.2), V(Math.cos(a + 0.35) * (R + len * 0.45), Math.sin(a + 0.35) * (R + len * 0.45), 0.32), tip], 0.028), mat('#c4b5fd', { rough: 0.5 })), 'histones', g);
      const ac = sphere(0.08, '#facc15'); ac.position.copy(tip); ac.visible = false; stage.add(ac, 'acetyl', g); acetyls.push(ac);
    }
    for (const t of [0.25, 0.6, 0.9]) { const me = sphere(0.075, '#ef4444'); me.position.copy(wrapAt(t)).multiplyScalar(1.18).setZ(wrapAt(t).z + 0.05); me.visible = false; stage.add(me, 'methyl', g); methyls.push(me); }
    stage.root.add(g); nucs.push(g);
  }
  // linker DNA between the spools (straight rods, re-aimed every frame as the spools move); the gene is the green one
  const linkers = [];
  for (let i = 0; i < NUC - 1; i++) { const m = unitRod(i === MID - 1 ? '#22c55e' : '#5b8def', i === MID - 1 ? 0.085 : 0.065); stage.add(m, i === MID - 1 ? 'gene' : 'chromatin'); linkers.push(m); }
  const geneMeth = [0.3, 0.7].map(() => { const me = sphere(0.08, '#ef4444'); me.visible = false; stage.add(me, 'methyl'); methyls.push(me); return me; });
  const pol = meshOf([lumpGeo(V(0, 0, 0), 0.36, { seed: 6, amp: 0.14, stretch: [1.15, 0.95, 0.9] }), lumpGeo(V(0.25, -0.2, 0.08), 0.2, { seed: 2, amp: 0.1 })], mat('#a855f7', { opacity: 0.85, rough: 0.45 })); stage.add(pol, 'polymerase');
  const rnaPts = Array.from({ length: 24 }, (_, k) => V(Math.sin(k * 0.6) * 0.25, k * 0.11, 0.1));
  const rnaTube = tube(rnaPts, 0.05, '#f59e0b', undefined, 96); stage.add(rnaTube, 'rna');
  rnaTube.geometry.setDrawRange(0, 0);
  const geneLbl = textSprite(L('gene', 'גן'), { size: 0.26, color: '#15803d' }); stage.root.add(geneLbl);
  let open = 0.35, openT = 0.35, made = 0, state = 'neutral', story = null;
  stage.onUpdate((dt, t) => {
    if (story) { // "experience": a stressed, tagged gene is opened step by step
      story.t += dt;
      if (story.t > 1.5 && state !== 'open') setState('open');
      if (story.t > 6) story = null;
    }
    open += (openT - open) * Math.min(1, dt * 1.6);
    const gap = 1.0 + open * 0.75; // centre-to-centre distance; the gene's own gap opens most
    let x = 0;
    const xs = nucs.map((_, i) => { const v = x; x += i === MID - 1 ? gap + open * 0.9 : gap; return v; });
    const off = xs[NUC - 1] / 2;
    nucs.forEach((g, i) => { g.position.set(xs[i] - off, Math.sin(i * 1.3) * 0.25 * (1 - open), 0); g.rotation.z = Math.sin(i * 2.1) * 0.25; });
    for (let i = 0; i < NUC - 1; i++) {
      nucs[i].updateMatrixWorld(); nucs[i + 1].updateMatrixWorld();
      const a = nucs[i].localToWorld(wrapAt(1)), b = nucs[i + 1].localToWorld(wrapAt(0));
      setRod(linkers[i], a, b);
      if (i === MID - 1) { geneMeth.forEach((m, k) => m.position.copy(a).lerp(b, [0.3, 0.7][k])); geneLbl.position.copy(a).lerp(b, 0.5).add(V(0, -0.55, 0)); }
    }
    // the polymerase reaches the gene only when it is open; otherwise it hovers above, shut out
    const gm = linkers[MID - 1].position;
    const canRead = open > 0.75;
    const want = canRead ? gm.clone().add(V(0, 0.42, 0.15)) : gm.clone().add(V(Math.sin(t * 2) * 0.4, 1.7, 0.4));
    pol.position.lerp(want, Math.min(1, dt * 2.5));
    made = Math.max(0, Math.min(1, made + (canRead && pol.position.distanceTo(want) < 0.2 ? dt * 0.3 : -dt * 0.4)));
    rnaTube.position.copy(pol.position).add(V(0.1, 0.25, 0));
    rnaTube.geometry.setDrawRange(0, Math.floor(rnaTube.geometry.index.count * made / 6) * 6);
    readout(`${L('Gene', 'הגן')}: <b>${canRead ? L('ON', 'פעיל') : L('OFF', 'כבוי')}</b> · ${L('RNA made', 'RNA שנוצר')}: ${'▮'.repeat(Math.round(made * 10))}${'▯'.repeat(10 - Math.round(made * 10))}`);
  });
  const setState = (s) => {
    state = s;
    acetyls.forEach((a) => { a.visible = s === 'open'; });
    methyls.forEach((m) => { m.visible = s === 'closed'; });
    openT = s === 'open' ? 1 : s === 'closed' ? 0 : 0.35;
  };
  return {
    home: { pos: V(0, 0.8, 14), target: V(0, 0.3, 0) },
    actions: [
      { icon: '🟡', label: B('Acetylation: open the gene', 'אצטילציה: פתיחת הגן'), radio: true, caption: B('Acetyl tags (yellow) on the histone tails loosen their grip. The spools slide apart, RNA polymerase reaches the gene and starts making RNA: the gene is on.', 'תגי אצטיל (צהובים) על זנבות ההיסטונים משחררים את האחיזה. הסלילים מתרחקים, ה-RNA פולימראז מגיע לגן ומתחיל לייצר RNA: הגן פעיל.'), run: () => { story = null; setState('open'); } },
      { icon: '🔴', label: B('Methylation: close the gene', 'מתילציה: סגירת הגן'), radio: true, caption: B('Methyl tags (red) on the DNA pull the spools tight together. The polymerase cannot get in, and the gene falls silent — though its DNA letters have not changed at all.', 'תגי מתיל (אדומים) על ה-DNA מהדקים את הסלילים זה לזה. הפולימראז לא מצליח להיכנס, והגן משתתק — אף שאותיות ה-DNA שלו לא השתנו כלל.'), run: () => { story = null; setState('closed'); } },
      { icon: '🐀', label: B('Experience rewrites the tags', 'חוויה משכתבת את התגים'), radio: true, caption: B('In rats, pups whose mothers licked and groomed them a lot lose methyl tags on the stress-hormone receptor gene in the hippocampus (Weaver et al., 2004). The gene opens, and they grow up calmer under stress. Learning works this way too: a new memory needs histone acetylation.', 'בחולדות, גורים שאמם ליקקה וטיפחה אותם הרבה מאבדים תגי מתיל על הגן של קולטן הורמון הלחץ בהיפוקמפוס (Weaver ועמיתים, 2004). הגן נפתח, והם גדלים רגועים יותר במצבי לחץ. גם למידה עובדת כך: זיכרון חדש זקוק לאצטילציה של היסטונים.'), run: () => { setState('closed'); open = 0; story = { t: 0 }; } },
    ],
  };
}

export default {
  id: 'macromolecule',
  scenes: [
    { id: 'channels', icon: '🚪', name: B('Ion channels', 'תעלות יונים'), chapters: [3], intro: B('Ion channels are proteins with a pore. Voltage-gated channels open when the voltage changes — together they produce the action potential.', 'תעלות יונים הן חלבונים עם נקבובית. תעלות תלויות-מתח נפתחות כשהמתח משתנה — יחד הן יוצרות את פוטנציאל הפעולה.'), build: channelsScene },
    { id: 'receptors', icon: '🔑', name: B('Receptors', 'קולטנים'), chapters: [3, 4], intro: B('Two kinds of neurotransmitter receptors: ionotropic (fast — the receptor is a channel) and metabotropic (slower — works through G-proteins and second messengers).', 'שני סוגים של קולטנים למוליכים עצביים: יונוטרופיים (מהירים — הקולטן הוא תעלה) ומטבוטרופיים (איטיים יותר — פועלים דרך חלבוני G ושליחים שניים).'), build: receptorsScene },
    { id: 'transporter', icon: '🔁', name: B('Reuptake transporter', 'מוביל לקליטה מחדש'), chapters: [4], intro: B('A real dopamine transporter protein in the membrane. Watch it clear dopamine from the synapse — then block it with cocaine.', 'חלבון מוביל דופמין אמיתי בממברנה. צפו בו מפנה דופמין מהסינפסה — ואז חסמו אותו בקוקאין.'), build: transporterScene },
    { id: 'pump', icon: '🔄', name: B('Na⁺/K⁺ pump', 'משאבת Na⁺/K⁺'), chapters: [3], intro: B('This protein machine keeps Na⁺ outside and K⁺ inside — the "charged battery" behind the resting potential.', 'מכונת חלבון זו שומרת Na⁺ בחוץ ו-K⁺ בפנים — "הסוללה הטעונה" שמאחורי פוטנציאל המנוחה.'), build: pumpScene },
    { id: 'dna', icon: '🧬', name: B('DNA → protein', 'DNA ← חלבון'), chapters: [5], intro: B('How a gene becomes a protein: transcription in the nucleus, translation at the ribosome.', 'איך גן הופך לחלבון: שעתוק בגרעין, תרגום בריבוזום.'), build: dnaScene },
    { id: 'rna', icon: '📜', name: B('RNA', 'RNA'), chapters: [5], intro: B('How a gene is copied into RNA, letter by letter, how RNA differs from DNA, and how a transfer RNA reads the code.', 'איך גן מועתק ל-RNA אות אחר אות, במה RNA שונה מ-DNA, ואיך RNA מעביר קורא את הקוד.'), build: rnaScene },
    { id: 'epigenetics', icon: '🏷️', name: B('Epigenetics', 'אפיגנטיקה'), chapters: [5], intro: B('The same DNA, switched on or off: DNA is wound on histone spools, and chemical tags loosen or tighten them. Open a gene, close it, and see how experience rewrites the tags.', 'אותו DNA, מופעל או כבוי: ה-DNA מלופף על סלילי היסטונים, ותגים כימיים משחררים או מהדקים אותם. פתחו גן, סגרו אותו, וראו איך חוויה משכתבת את התגים.'), build: epigeneticsScene },
    { id: 'muscle', icon: '💪', name: B('Actin & myosin', 'אקטין ומיוזין'), chapters: [8], intro: B('Inside a muscle fibre: the proteins that make movement possible.', 'בתוך סיב שריר: החלבונים שמאפשרים תנועה.'), build: muscleScene },
  ],
};
