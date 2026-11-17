// ORGAN SYSTEM level, on the real body (BodyParts3D skin, skeleton and organs + the anatomical brain model):
// the nervous system (CNS + PNS), the autonomic nervous system, and the endocrine stress axis (HPA).
// Peripheral nerves are drawn along the real skeleton (vertebrae, ribs, limb joints); the route follows standard
// anatomy (brachial and lumbosacral plexuses, intercostal nerves, sciatic nerve, vagus, sympathetic chain).
import * as THREE from 'three';
import { V, mat, sphere, flow, timeline, torus, voltageTrace } from '../build.js';
import { setupRealBody, nerveTube } from '../realbody.js';

const B = (en, he) => ({ en, he });
const P = (stage, id, en, he, den, dhe, color, chapters) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters });
const curve = (pts) => new THREE.CatmullRomCurve3(pts);
const sideKey = (s) => (s > 0 ? 'L' : 'R'); // +x = the body's left

/** Box of one body mesh (e.g. 'eye|left'). */
const meshBox = (rb, name) => { const m = rb.body.meshes[name]; return m ? new THREE.Box3().setFromObject(m) : null; };

/** Exit point of spinal nerve k (1–31) at the vertebral canal. */
function spinalExit(rb, k) {
  const v = rb.verts;
  if (k <= 7) return v[k - 1].clone().add(V(0, 0.12, 0));
  if (k === 8) return v[6].clone().lerp(v[7], 0.5);
  if (k <= 20) return v[k - 2].clone().add(V(0, -0.1, 0)); // T1..T12 → index 7..18
  if (k <= 25) return v[k - 2].clone().add(V(0, -0.15, 0)); // L1..L5 → 19..23
  const s = v[v.length - 1];
  return s.clone().add(V(0, -0.18 * (k - 26) - 0.1, 0.1)); // sacral and coccygeal
}

// ---------------- Nervous system ----------------
function nervousScene(stage) {
  P(stage, 'brain', 'Brain', 'מוח', 'Part of the central nervous system (CNS). Click "Zoom in" to explore it in detail.', 'חלק ממערכת העצבים המרכזית. לחצו "זום פנימה" כדי לחקור אותו לעומק.', '#f2b8c6', [2]);
  P(stage, 'cord', 'Spinal cord', 'חוט השדרה', 'The other half of the CNS, inside the vertebral canal. It carries messages between brain and body and runs simple reflexes by itself. It ends at about the first–second lumbar vertebra; below that, nerve roots hang down (cauda equina).', 'החצי השני של מערכת העצבים המרכזית, בתוך תעלת עמוד השדרה. מעביר מסרים בין המוח לגוף ומפעיל רפלקסים פשוטים בעצמו. הוא מסתיים בערך בחוליה המותנית הראשונה-שנייה; מתחת לזה תלויים שורשי עצבים (זנב הסוס).', '#facc15', [2, 8]);
  P(stage, 'cranial', 'Cranial nerves (12 pairs)', 'עצבים גולגולתיים (12 זוגות)', 'Leave the brain directly — e.g. the optic nerve (vision) and the vagus nerve, which wanders down to the heart and gut.', 'יוצאים ישירות מהמוח — למשל עצב הראייה והעצב התועה (וָגוּס), שיורד עד הלב והמעיים.', '#fb923c', [2]);
  P(stage, 'cervical', 'Cervical nerves (8 pairs) & brachial plexus', 'עצבים צוואריים (8 זוגות) ומקלעת הזרוע', 'Serve the neck, shoulders, arms and hands. C5–T1 join in the brachial plexus, which gives the nerves of the arm.', 'משרתים את הצוואר, הכתפיים, הזרועות והידיים. C5–T1 מתחברים במקלעת הזרוע, שממנה יוצאים עצבי היד.', '#22c55e', [2]);
  P(stage, 'thoracic', 'Thoracic nerves (12 pairs)', 'עצבים חזיים (12 זוגות)', 'Run under each rib (intercostal nerves) around the chest and belly.', 'רצים מתחת לכל צלע (עצבים בין-צלעיים) סביב החזה והבטן.', '#3b82f6', [2]);
  P(stage, 'lumbar', 'Lumbar, sacral & coccygeal nerves (11 pairs)', 'עצבים מותניים, עצתיים וזנביים (11 זוגות)', 'Serve the hips, legs and pelvic organs. The sciatic nerve (L4–S3), down the back of the thigh, is the largest nerve in the body.', 'משרתים את הירכיים, הרגליים ואיברי האגן. העצב הסיאטי (L4–S3), לאורך גב הירך, הוא העצב הגדול בגוף.', '#a855f7', [2]);
  // sense organs: where sensory neurons pick up the world (each has a dot that zooms into its sensory neurons)
  P(stage, 'eye', 'Eyes', 'עיניים', 'Sight: the retina at the back of each eye holds light-sensing neurons (rods and cones). Their signal leaves through the optic nerve, a cranial nerve.', 'ראייה: הרשתית בחלק האחורי של כל עין מכילה נוירונים חשי-אור (קנים ומדוכים). האות שלהם יוצא דרך עצב הראייה, עצב גולגולתי.', '#38bdf8', [2, 6]);
  P(stage, 'ear', 'Inner ears', 'אוזניים פנימיות', 'Hearing: in the cochlea, hair cells turn sound vibrations into nerve signals that travel along the auditory nerve.', 'שמיעה: בשבלול, תאי שיער הופכים את רעידות הקול לאותות עצביים שנעים לאורך עצב השמיעה.', '#f472b6', [2, 7]);
  P(stage, 'nose', 'Nose (smell)', 'אף (ריח)', 'Smell: high in the roof of the nose, olfactory neurons catch odour molecules. Their axons pass straight through the skull to the olfactory bulb (cranial nerve I).', 'ריח: גבוה בתקרת האף, נוירוני ריח לוכדים מולקולות ריח. האקסונים שלהם עוברים ישר דרך הגולגולת לפקעת הריח (עצב גולגולתי I).', '#22c55e', [2, 7]);
  P(stage, 'tongue', 'Tongue (taste)', 'לשון (טעם)', 'Taste: taste buds on the tongue hold taste receptor cells. Their signal travels to the brainstem in cranial nerves VII, IX and X.', 'טעם: פקעיות טעם על הלשון מכילות תאי קולטני טעם. האות שלהם עובר לגזע המוח בעצבים גולגולתיים VII, ‏IX ו-X.', '#14b8a6', [2, 7]);
  P(stage, 'skin', 'Skin of the fingertip', 'עור קצה האצבע', 'Touch, heat and pain: the endings of sensory neurons lie in the skin. Their cell bodies sit beside the spinal cord (dorsal root ganglia), and the signal enters the cord and climbs to the brain.', 'מגע, חום וכאב: הקצוות של נוירונים תחושתיים נמצאים בעור. גופי התא שלהם יושבים ליד חוט השדרה (גנגליוני השורש הגבי), והאות נכנס לחוט השדרה ועולה למוח.', '#fbbf24', [2, 7]);
  P(stage, 'intercostal', 'An intercostal nerve', 'עצב בין-צלעי', 'A peripheral nerve running under a rib, from the spinal cord around the chest. Like every nerve, it is a cable of thousands of axons, motor and sensory together.', 'עצב היקפי שרץ מתחת לצלע, מחוט השדרה סביב בית החזה. כמו כל עצב, הוא כבל של אלפי אקסונים, מוטוריים ותחושתיים יחד.', '#3b82f6', [2]);
  P(stage, 'skull', 'Skull', 'גולגולת', 'Protects the brain; the eyes sit in its orbits, the inner ear deep in its temporal bone, and the nose and mouth below.', 'מגינה על המוח; העיניים יושבות בארובות שלה, האוזן הפנימית עמוק בעצם הרקה שלה, והאף והפה מתחת.', '#efe6d2', [2]);
  P(stage, 'skeleton', 'Skeleton (for orientation)', 'שלד (להתמצאות)', 'The spinal cord and nerves are protected by the skull and the vertebral column.', 'חוט השדרה והעצבים מוגנים על ידי הגולגולת ועמוד השדרה.', '#efe6d2', [2]);
  let motor = null, sense = null;
  const ready = setupRealBody(stage, { skin: 0.12, skeleton: 0.32, organs: ['eye'], brain: 'whole' }).then((rb) => {
    stage.tag(rb.brain, 'brain');
    Object.entries(rb.body.meshes).forEach(([k, m]) => { if (k.startsWith('eye')) stage.tag(m, 'eye'); else if (k.startsWith('skull')) stage.tag(m, 'skull'); else if (!k.startsWith('skin')) stage.tag(m, 'skeleton'); });
    // the head (owner, 2026-11-15: lay it out properly): the skull stays faintly visible over the sourced model, and
    // each sense organ has a recognisable shape at its real place — eyes in the orbits (with iris and pupil), the
    // cochlea inside the skull beside the ear, the nose with the smell patch in its roof, the tongue in the mouth
    const eyeL = meshBox(rb, 'eye|left'), eyeR = meshBox(rb, 'eye|right');
    if (eyeL && eyeR) {
      const cL = eyeL.getCenter(V()), cR = eyeR.getCenter(V()), d = cL.distanceTo(cR);
      const mid = cL.clone().lerp(cR, 0.5), r = eyeL.getSize(V()).y / 2;
      const fwd = 1; // the face looks toward +z (the eyes are in front of the spinal cord)
      for (const c of [cL, cR]) {
        const iris = new THREE.Mesh(new THREE.CircleGeometry(r * 0.48, 32), new THREE.MeshPhysicalMaterial({ color: '#3b82f6', roughness: 0.3, clearcoat: 1 }));
        iris.position.copy(c).add(V(0, 0, fwd * r * 1.01)); stage.add(iris, 'eye');
        const pupil = new THREE.Mesh(new THREE.CircleGeometry(r * 0.22, 24), new THREE.MeshPhysicalMaterial({ color: '#0b0b0f', roughness: 0.2, clearcoat: 1 }));
        pupil.position.copy(c).add(V(0, 0, fwd * r * 1.02)); stage.add(pupil, 'eye');
      }
      // one cochlea, on the side that faces the home view (+x), deep in the skull level with the eyes
      const side = Math.sign(cL.x - mid.x) || 1;
      const spiral = [];
      for (let i = 0; i <= 60; i++) { const a = i * 0.27, rr = d * 0.17 * (1 - i / 75); spiral.push(V(0, Math.sin(a) * rr, Math.cos(a) * rr).add(V(i * d * 0.0025, 0, 0))); }
      const cochlea = new THREE.Group();
      const sp = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral), 160, d * 0.045, 10), mat('#f472b6'));
      cochlea.add(sp);
      cochlea.position.set(mid.x + side * d * 1.0, mid.y - d * 0.2, mid.z - d * 1.1);
      stage.add(cochlea, 'ear');
      // the nose: a soft nose shape, and the green olfactory patch high in the roof of the nasal cavity
      const nose = new THREE.Mesh(new THREE.ConeGeometry(d * 0.2, d * 0.55, 24), mat('#e9a58e', { opacity: 0.85 }));
      nose.rotation.x = fwd * 0.45; nose.position.set(mid.x, mid.y - d * 0.45, mid.z + fwd * d * 0.2); stage.add(nose, 'nose');
      const patch = sphere(d * 0.11, '#22c55e'); patch.scale.set(1, 0.45, 1.4); patch.position.set(mid.x, mid.y - d * 0.12, mid.z - fwd * d * 0.15); stage.add(patch, 'nose');
      // the tongue, lying in the mouth
      const tongue = sphere(d * 0.3, '#ef7f95'); tongue.scale.set(0.85, 0.32, 1.25); tongue.position.set(mid.x, mid.y - d * 0.88, mid.z - fwd * d * 0.05); stage.add(tongue, 'tongue');
    }
    // a fingertip: where touch receptors (sensory neuron endings) are densest
    { const tip = sphere(0.09, '#fbbf24'); tip.position.copy(rb.pt('handL')); stage.add(tip, 'skin'); } // one hand: its dot sits on it
    stage.add(nerveTube(rb.cord, 0.11, '#facc15'), 'cord');
    const conus = rb.cord[rb.cord.length - 1];
    for (const s of [1, -1]) {
      const K = sideKey(s);
      const sh = rb.pt(`shoulder${K}`), hip = rb.pt(`hip${K}`);
      const brachial = V(s * Math.abs(sh.x) * 0.62, sh.y - 0.35, sh.z + 0.15);
      const lumbosacral = V(s * Math.abs(hip.x) * 0.55, hip.y + 0.3, hip.z - 0.35);
      const ribs = meshBox(rb, `ribs|${s > 0 ? 'left' : 'right'}`);
      const rx = ribs ? Math.max(Math.abs(ribs.max.x), Math.abs(ribs.min.x)) * 0.98 : 1.6;
      const zc = ribs ? (ribs.min.z + ribs.max.z) / 2 : 0, rz = ribs ? (ribs.max.z - ribs.min.z) / 2 : 1;
      for (let k = 1; k <= 31; k++) {
        const ex = spinalExit(rb, k);
        const root = k <= 22 ? ex : conus.clone().lerp(ex, 0.15); // below the cord the roots start at the conus (cauda equina)
        const out = ex.clone().add(V(s * 0.35, -0.08, 0.05));
        if (k <= 4) stage.add(nerveTube([root, out, V(s * 0.75, ex.y + 0.1, ex.z + 0.45)], 0.025, '#22c55e'), 'cervical');
        else if (k <= 9) stage.add(nerveTube([root, out, brachial], 0.03, '#22c55e'), 'cervical');
        else if (k <= 20) {
          const pts = [root, out];
          for (let i = 1; i <= 8; i++) { const f = (i / 8) * Math.PI * 0.95; pts.push(V(s * rx * Math.sin(f), ex.y - 0.55 * (i / 8), zc - rz * Math.cos(f))); }
          stage.add(nerveTube(pts, 0.022, '#3b82f6'), s > 0 && k === 15 ? 'intercostal' : 'thoracic'); // one intercostal nerve (left, 7th) has its own part: the "a nerve, cut across" dot sits on it. Not drawn over the real model and no thicker than the others (owner, 2026-11-15: only the dot)
        } else {
          const mid = V(ex.x + s * 0.15, (root.y + ex.y) / 2, ex.z);
          stage.add(nerveTube(k <= 22 ? [root, out, lumbosacral] : [root, mid, ex, out, lumbosacral], 0.028, '#a855f7'), 'lumbar');
        }
      }
      // arm nerves (median/ulnar/radial run together here) and the sciatic nerve
      stage.add(nerveTube([brachial, rb.pt(`shoulder${K}`).add(V(0, -0.3, 0.1)), rb.pt(`elbow${K}`).add(V(0, 0, 0.1)), rb.pt(`wrist${K}`), rb.pt(`hand${K}`)], 0.05, '#22c55e'), 'cervical');
      stage.add(nerveTube([lumbosacral, hip.clone().add(V(0, -0.25, -0.45)), rb.pt(`knee${K}`).add(V(0, 0.2, -0.35)), rb.pt(`ankle${K}`).add(V(0, 0, -0.2)), rb.pt(`foot${K}`)], 0.07, '#a855f7'), 'lumbar');
      // optic nerve and vagus
      const eye = meshBox(rb, `eye|${s > 0 ? 'left' : 'right'}`);
      if (eye) { const ec = eye.getCenter(V()); stage.add(nerveTube([ec, ec.clone().add(V(-s * 0.15, -0.05, -0.4)), V(0, ec.y - 0.12, ec.z - 0.75)], 0.035, '#fb923c'), 'cranial'); }
      const c1 = rb.vertebra('C1'), t4 = rb.vertebra('T4'), t10 = rb.vertebra('T10');
      stage.add(nerveTube([c1.clone().add(V(s * 0.2, 0.4, 0.3)), rb.vertebra('C5').add(V(s * 0.45, 0, 0.6)), t4.clone().add(V(s * 0.3, 0, 1.0)), t10.clone().add(V(s * 0.2, 0, 1.1))], 0.03, '#fb923c'), 'cranial');
    }
    // signals: motor command (brain → cord → left arm) and sensation (left foot → cord → brain)
    const top = rb.cord[0], cervCord = rb.vertebra('C7');
    const brainTop = top.clone().add(V(0.35, 1.2, 0.2));
    motor = flow(stage, curve([brainTop, top, rb.vertebra('C4'), cervCord, cervCord.clone().add(V(0.4, -0.1, 0.05)), V(Math.abs(rb.pt('shoulderL').x) * 0.62, rb.pt('shoulderL').y - 0.35, rb.pt('shoulderL').z + 0.15), rb.pt('shoulderL').add(V(0, -0.3, 0.1)), rb.pt('elbowL').add(V(0, 0, 0.1)), rb.pt('wristL'), rb.pt('handL')]), { color: '#ef4444', count: 10, size: 0.5, speed: 0.22 });
    sense = flow(stage, curve([rb.pt('footL'), rb.pt('ankleL').add(V(0, 0, -0.2)), rb.pt('kneeL').add(V(0, 0.2, -0.35)), rb.pt('hipL').add(V(0, -0.25, -0.45)), V(Math.abs(rb.pt('hipL').x) * 0.55, rb.pt('hipL').y + 0.3, rb.pt('hipL').z - 0.35), conus, ...rb.cord.slice().reverse().slice(1), brainTop]), { color: '#06b6d4', count: 12, size: 0.5, speed: 0.18 });
    motor.setActive(false); sense.setActive(false);
    stage.resetView();
  });
  return {
    ready,
    home: { pos: V(9, 11, 22), target: V(0, 9, 0) },
    actions: [
      { icon: '🧠', label: B('Central nervous system', 'מערכת העצבים המרכזית'), caption: B('The CNS = brain + spinal cord, protected by bone (skull and vertebrae).', 'מערכת העצבים המרכזית = מוח + חוט שדרה, מוגנים בעצם (גולגולת וחוליות).'), run: () => stage.focus(['brain', 'cord']) },
      { icon: '🕸️', label: B('Peripheral nervous system', 'מערכת העצבים ההיקפית'), caption: B('The PNS = all nerves outside the CNS: 12 pairs of cranial nerves and 31 pairs of spinal nerves.', 'מערכת העצבים ההיקפית = כל העצבים מחוץ למערכת המרכזית: 12 זוגות עצבים גולגולתיים ו-31 זוגות עצבי שדרה.'), run: () => stage.focus(['cranial', 'cervical', 'thoracic', 'lumbar']) },
      { icon: '✋', label: B('Move your hand (motor)', 'הזזת היד (מוטורי)'), toggle: true, caption: B('Motor commands travel DOWN: motor cortex → spinal cord → out through the brachial plexus → arm muscles. (Efferent = going away from the CNS.)', 'פקודות מוטוריות נעות למטה: קליפה מוטורית ← חוט השדרה ← החוצה דרך מקלעת הזרוע ← שרירי הזרוע. (אפרנטי = מתרחק מהמערכת המרכזית.)'), run: (on) => motor?.setActive(on) },
      { icon: '🦶', label: B('Feel your foot (sensory)', 'הרגשת כף הרגל (תחושתי)'), toggle: true, caption: B('Sensory messages travel UP: skin receptors → sciatic nerve → dorsal root → spinal cord → brain. (Afferent = arriving at the CNS.)', 'מסרים תחושתיים נעים למעלה: קולטנים בעור ← העצב הסיאטי ← השורש הגבי ← חוט השדרה ← המוח. (אפרנטי = מגיע אל המערכת המרכזית.)'), run: (on) => sense?.setActive(on) },
    ],
  };
}

// ---------------- Autonomic nervous system ----------------
function ansScene(stage, { readout, L }) {
  P(stage, 'brain', 'Brain & hypothalamus', 'מוח והיפותלמוס', 'The hypothalamus and brainstem control the autonomic nervous system.', 'ההיפותלמוס וגזע המוח שולטים במערכת העצבים האוטונומית.', '#f2b8c6', [2, 9]);
  P(stage, 'cord', 'Spinal cord', 'חוט השדרה', 'Sympathetic neurons leave from the thoracic and lumbar cord; parasympathetic ones from the brainstem and sacral cord.', 'נוירונים סימפתטיים יוצאים מהחלק החזי והמותני של חוט השדרה; פאראסימפתטיים מגזע המוח ומהחלק העצתי.', '#facc15', [2]);
  P(stage, 'sympathetic', 'Sympathetic system ("fight or flight")', 'המערכת הסימפתטית ("הילחם או ברח")', 'A chain of ganglia running beside the vertebral bodies. Uses mostly norepinephrine at the organs. Prepares the body for action.', 'שרשרת של גנגליונים לאורך גופי החוליות. משתמשת בעיקר בנוראפינפרין באיברים. מכינה את הגוף לפעולה.', '#ef4444', [2, 14]);
  P(stage, 'para', 'Parasympathetic system ("rest and digest")', 'המערכת הפאראסימפתטית ("מנוחה ועיכול")', 'Mainly the vagus nerve plus sacral nerves. Uses acetylcholine at the organs. Saves and restores energy.', 'בעיקר העצב התועה (וגוס) ועצבים עצתיים. משתמשת באצטילכולין באיברים. חוסכת ומשקמת אנרגיה.', '#3b82f6', [2]);
  P(stage, 'eyes', 'Pupils', 'אישונים', 'Sympathetic: pupils widen (let in more light). Parasympathetic: pupils narrow.', 'סימפתטי: האישונים מתרחבים (מכניסים יותר אור). פאראסימפתטי: האישונים מצטמצמים.', '#2563eb', [2]);
  P(stage, 'heart', 'Heart', 'לב', 'Sympathetic: beats faster and harder. Parasympathetic (vagus): slows down. (The four chambers are shown.)', 'סימפתטי: פועם מהר וחזק יותר. פאראסימפתטי (וגוס): מאט. (מוצגים ארבעת החדרים.)', '#c0262d', [2, 14]);
  P(stage, 'lungs', 'Airways (bronchial tree)', 'דרכי האוויר (העץ הסמפונאי)', 'Sympathetic: airways widen and breathing speeds up.', 'סימפתטי: דרכי האוויר מתרחבות והנשימה מואצת.', '#f4a6b5', [2]);
  P(stage, 'gut', 'Stomach & intestines', 'קיבה ומעיים', 'Parasympathetic: digestion active. Sympathetic: digestion paused (energy goes to muscles).', 'פאראסימפתטי: העיכול פעיל. סימפתטי: העיכול מושהה (האנרגיה מופנית לשרירים).', '#e8916b', [2, 9]);
  P(stage, 'adrenal', 'Adrenal medulla', 'לשד יותרת הכליה', 'Sympathetic nerves make it release adrenaline (epinephrine) into the blood, spreading the alarm through the whole body.', 'עצבים סימפתטיים גורמים לו לשחרר אדרנלין (אפינפרין) לדם, וכך האזעקה מתפשטת בכל הגוף.', '#eab308', [2, 14]);
  P(stage, 'bladder', 'Bladder', 'שלפוחית השתן', 'Parasympathetic (sacral) nerves contract it; sympathetic nerves relax it.', 'עצבים פאראסימפתטיים (עצתיים) מכווצים אותה; סימפתטיים מרפים אותה.', '#f5d78e', [2]);
  let k = 0, beat = 0, breath = 0, mode = 'calm', beta = false, atropine = false, slowBreath = false, bpmNow = 65;
  const hrTrace = voltageTrace({ min: 40, max: 170, rest: 65, threshold: 100, color: '#dc2626', every: 0.1 });
  const live = { heart: null, lungs: null, gut: null, adrenal: null, pupils: [], symFlows: [], paraFlows: [] };
  const apply = () => { live.symFlows.forEach((f) => f.setActive(mode === 'fight')); live.paraFlows.forEach((f) => f.setActive(mode === 'calm')); };
  const ready = setupRealBody(stage, { skin: 0.12, skeleton: 0.22, organs: ['heart', 'lungs', 'stomach', 'gut', 'adrenal', 'kidney', 'bladder', 'eye', 'liver', 'esophagus'], brain: 'whole', brainOpacity: 0.85 }).then((rb) => {
    stage.tag(rb.brain, 'brain');
    stage.add(nerveTube(rb.cord, 0.1, '#facc15'), 'cord');
    const O = (n) => rb.organ(n);
    const heart = O('heart'), lungs = O('lungs'), stomach = O('stomach'), gut = O('gut'), adrenal = O('adrenal'), bladder = O('bladder');
    stage.tag(heart.pivot, 'heart'); stage.tag(lungs.pivot, 'lungs'); stage.tag(stomach.pivot, 'gut'); stage.tag(gut.pivot, 'gut'); stage.tag(adrenal.pivot, 'adrenal'); stage.tag(bladder.pivot, 'bladder');
    // pupils on the real eyes
    for (const side of ['left', 'right']) {
      const b = meshBox(rb, `eye|${side}`);
      if (!b) continue;
      const c = b.getCenter(V());
      const r = (b.max.x - b.min.x) / 2;
      const iris = new THREE.Mesh(new THREE.CircleGeometry(r * 0.55, 24), new THREE.MeshPhysicalMaterial({ color: '#2563eb' }));
      iris.position.set(c.x, c.y, b.max.z + 0.005);
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(r * 0.22, 24), new THREE.MeshPhysicalMaterial({ color: '#0f172a' }));
      pupil.position.set(c.x, c.y, b.max.z + 0.01);
      rb.group.add(iris, pupil);
      stage.tag(rb.body.meshes[`eye|${side}`], 'eyes'); stage.tag(iris, 'eyes'); stage.tag(pupil, 'eyes');
      live.pupils.push(pupil);
    }
    Object.assign(live, { heart, lungs, gut, adrenal });
    // sympathetic chain: ganglia in front of / beside the vertebral bodies from the upper neck to L2
    const chainLevels = ['C2', 'C5', 'C7', ...Array.from({ length: 12 }, (_, i) => `T${i + 1}`), 'L1', 'L2'];
    const chainPt = (lv, s) => rb.vertebra(lv)?.add(V(s * 0.32, 0, 0.42));
    for (const s of [1, -1]) {
      const pts = chainLevels.map((lv) => chainPt(lv, s)).filter(Boolean);
      pts.forEach((p) => { const g = sphere(0.06, '#ef4444'); g.position.copy(p); stage.add(g, 'sympathetic'); });
      stage.add(nerveTube(pts, 0.022, '#ef4444'), 'sympathetic');
    }
    const S = (pts) => { stage.add(nerveTube(pts, 0.026, '#ef4444'), 'sympathetic'); live.symFlows.push(flow(stage, curve(pts), { color: '#ef4444', count: 6, size: 0.32, speed: 0.6 })); };
    const Pp = (pts) => { stage.add(nerveTube(pts, 0.03, '#3b82f6'), 'para'); live.paraFlows.push(flow(stage, curve(pts), { color: '#60a5fa', count: 6, size: 0.32, speed: 0.4 })); };
    const eyeL = meshBox(rb, 'eye|left')?.getCenter(V()), eyeR = meshBox(rb, 'eye|right')?.getCenter(V());
    const brainstem = rb.cord[0];
    S([chainPt('C2', 1), chainPt('C2', 1).add(V(0.1, 0.6, 0.3)), eyeL]);                          // superior cervical ganglion → eye
    S([chainPt('T2', 1), chainPt('T2', 1).add(V(0, -0.2, 0.4)), heart.center]);                      // cardiac nerves
    S([chainPt('T3', -1), lungs.center.clone().add(V(-0.6, 0, 0))]);                                // pulmonary
    S([chainPt('T7', 1), chainPt('T9', 1).add(V(0, 0, 0.5)), stomach.center]);                       // greater splanchnic → celiac
    S([chainPt('T11', -1), adrenal.center]);                                                          // adrenal medulla (direct)
    S([chainPt('T12', 1), chainPt('L1', 1).add(V(0, 0, 0.6)), gut.center]);                          // gut
    Pp([brainstem.clone().add(V(0.05, 0.25, 0.25)), eyeR]);                                           // oculomotor (III) → eye
    const vagus = [brainstem.clone().add(V(-0.2, 0, 0.2)), rb.vertebra('C5').add(V(-0.45, 0, 0.6)), rb.vertebra('T2').add(V(-0.3, 0, 0.9))];
    Pp([...vagus, heart.center]);
    Pp([...vagus, lungs.center.clone().add(V(0.4, 0, 0))]);
    Pp([...vagus, rb.vertebra('T8').add(V(-0.2, 0, 1.0)), stomach.center, gut.center]);
    const s3 = rb.verts[rb.verts.length - 1];
    Pp([s3.clone().add(V(0, -0.2, 0.2)), s3.clone().add(V(0, -0.4, 0.8)), bladder.center]);          // pelvic splanchnic (S2–S4)
    apply();
    stage.resetView();
  });
  stage.onUpdate((dt) => {
    k += ((mode === 'fight' ? 1 : 0) - k) * Math.min(1, dt * 1.5);
    // the heart's own pacemaker runs at ~100/min; the vagus slows it to ~65, sympathetic nerves speed it up.
    // atropine blocks the vagus (no brake), a beta-blocker blocks the sympathetic push; slow breathing boosts the vagus
    const brake = atropine ? 0 : slowBreath ? 45 : 35, push = beta ? 10 : 65 * k;
    const bpmT = 100 - brake * (1 - k * 0.8) + push, breT = slowBreath ? 6 : 12 + 18 * k;
    bpmNow += (bpmT - bpmNow) * Math.min(1, dt * 0.8);
    const bpm = bpmNow, bre = breT;
    hrTrace.push(bpm, dt);
    beat += (dt * bpm) / 60 * Math.PI * 2;
    breath += (dt * bre) / 60 * Math.PI * 2;
    if (live.heart) live.heart.pivot.scale.setScalar(1 + 0.1 * Math.max(0, Math.sin(beat)) ** 4);
    if (live.lungs) live.lungs.pivot.scale.set(1 + 0.04 * (1 + k) * Math.sin(breath), 1 + 0.06 * (1 + k) * Math.sin(breath), 1 + 0.04 * (1 + k) * Math.sin(breath));
    live.pupils.forEach((p) => p.scale.setScalar(1 + 1.2 * k));
    if (live.gut) live.gut.pivot.scale.setScalar(1 + 0.012 * (1 - k) * Math.sin(beat * 0.3));
    live.adrenal?.meshes.forEach((m) => m.material.emissive.set('#eab308').multiplyScalar(0.7 * k));
    readout(`❤️ ${Math.round(bpm)} ${L('beats/min', 'פעימות/דקה')}${hrTrace.svg()}🫁 ${Math.round(bre)} ${L('breaths/min', 'נשימות/דקה')}<br>👁️ ${L('pupils', 'אישונים')}: ${k > 0.5 ? L('wide', 'רחבים') : L('narrow', 'צרים')} · 🍽️ ${L('digestion', 'עיכול')}: ${k > 0.5 ? L('paused', 'מושהה') : L('active', 'פעיל')}${beta ? '<br>💊 ' + L('beta-blocker: the sympathetic push on the heart is blocked', 'חוסם בטא: הדחיפה הסימפתטית על הלב חסומה') : ''}${atropine ? '<br>🌿 ' + L('atropine: the vagus brake is gone', 'אטרופין: הבלם של הווגוס נעלם') : ''}`);
  });
  return {
    ready,
    home: { pos: V(5, 13, 13), target: V(0, 12, 0) },
    actions: [
      { icon: '🐻', label: B('Fight or flight!', 'הילחם או ברח!'), radio: true, caption: B('A threat! The sympathetic system takes over: heart and breathing speed up, pupils widen, digestion stops, and the adrenal medulla pours out adrenaline.', 'איום! המערכת הסימפתטית משתלטת: הלב והנשימה מואצים, האישונים מתרחבים, העיכול נעצר, ולשד יותרת הכליה משחרר אדרנלין.'), run: () => { mode = 'fight'; apply(); } },
      { icon: '🛋️', label: B('Rest and digest', 'מנוחה ועיכול'), radio: true, caption: B('Safe again. The parasympathetic system (mostly the vagus nerve) slows the heart, narrows the pupils and restarts digestion.', 'שוב בטוח. המערכת הפאראסימפתטית (בעיקר העצב התועה) מאטה את הלב, מצמצמת את האישונים ומפעילה מחדש את העיכול.'), run: () => { mode = 'calm'; apply(); } },
      { icon: '🌬️', label: B('Slow breathing', 'נשימה איטית'), toggle: true, caption: B('Breathing slowly (about 6 breaths a minute, long out-breaths) strengthens the brake that the vagus nerve puts on the heart, so the heart rate drops. That is why slow breathing calms you down.', 'נשימה איטית (כ-6 נשימות בדקה, עם נשיפות ארוכות) מחזקת את הבלם של העצב התועה על הלב, וקצב הלב יורד. לכן נשימה איטית מרגיעה.'), run: (on) => { slowBreath = on; } },
      { icon: '💊', label: B('Beta-blocker', 'חוסם בטא'), toggle: true, caption: B('Beta-blockers (e.g. propranolol) block the receptors for noradrenaline and adrenaline on the heart. Press "Fight or flight": the pupils and gut still react, but the heart barely speeds up. Some performers take one for stage fright.', 'חוסמי בטא (למשל פרופרנולול) חוסמים את הקולטנים לנוראדרנלין ואדרנלין בלב. לחצו "הילחם או ברח": האישונים והמעי עדיין מגיבים, אבל הלב כמעט לא מאיץ. יש אמנים שלוקחים אותו נגד פחד במה.'), run: (on) => { beta = on; } },
      { icon: '🌿', label: B('Atropine', 'אטרופין'), toggle: true, caption: B('Atropine (from deadly nightshade) blocks the muscarinic ACh receptors the vagus uses. Even at rest the heart runs at its own pacemaker speed, about 100 a minute. Doctors use it when a heart beats too slowly.', 'אטרופין (מצמח הבלדונה) חוסם את קולטני ה-ACh המוסקריניים שהווגוס משתמש בהם. גם במנוחה הלב פועם בקצב הקוצב שלו, כ-100 בדקה. רופאים משתמשים בו כשהלב פועם לאט מדי.'), run: (on) => { atropine = on; } },
    ],
  };
}

// ---------------- Endocrine: the HPA stress axis ----------------
function hpaScene(stage, { readout, L }) {
  P(stage, 'hypothalamus', 'Hypothalamus', 'היפותלמוס', 'Senses stress and releases CRH (corticotropin-releasing hormone) to the pituitary.', 'חש בלחץ ומשחרר CRH (הורמון משחרר קורטיקוטרופין) אל בלוטת יותרת המוח.', '#f97316', [9, 14]);
  P(stage, 'pituitary', 'Pituitary gland', 'בלוטת יותרת המוח (היפופיזה)', 'The "master gland". In response to CRH it releases ACTH into the blood. Its back part also releases ADH (vasopressin), which makes the kidneys keep water.', '"הבלוטה השולטת". בתגובה ל-CRH היא משחררת ACTH לדם. החלק האחורי שלה משחרר גם ADH (וזופרסין), שגורם לכליות לשמור מים.', '#a855f7', [9, 14]);
  P(stage, 'adrenal', 'Adrenal glands', 'בלוטות יותרת הכליה', 'Sit on top of the kidneys. ACTH makes their cortex release cortisol, which raises blood sugar and helps the body cope with longer-lasting stress.', 'יושבות על הכליות. ה-ACTH גורם לקליפה שלהן לשחרר קורטיזול, שמעלה את רמת הסוכר בדם ועוזר לגוף להתמודד עם לחץ ממושך.', '#eab308', [14]);
  P(stage, 'hippocampus', 'Hippocampus', 'היפוקמפוס', 'Has many cortisol receptors and helps switch the stress response off. Long-lasting high cortisol can damage it.', 'יש בו קולטני קורטיזול רבים והוא עוזר לכבות את תגובת הלחץ. קורטיזול גבוה לאורך זמן עלול לפגוע בו.', '#22c55e', [12, 14]);
  P(stage, 'pineal', 'Pineal gland', 'בלוטת האצטרובל', 'Releases melatonin at night (controlled by the SCN clock) — part of the sleep–wake cycle.', 'משחררת מלטונין בלילה (בשליטת השעון ב-SCN) — חלק ממחזור השינה-ערות.', '#14b8a6', [11]);
  P(stage, 'thyroid', 'Thyroid gland', 'בלוטת התריס', 'In front of the windpipe. Its hormones set the body\'s metabolic rate; also controlled by the pituitary.', 'מלפני קנה הנשימה. ההורמונים שלה קובעים את קצב חילוף החומרים בגוף; גם היא בשליטת יותרת המוח.', '#c026d3', [9]);
  P(stage, 'kidney', 'Kidneys', 'כליות', 'The adrenal glands sit on them; they also respond to ADH by saving water.', 'בלוטות יותרת הכליה יושבות עליהן; הן גם מגיבות ל-ADH בחיסכון במים.', '#7f1d1d', [9]);
  P(stage, 'brain', 'Brain', 'מוח', 'The brain both controls hormone release and is affected by hormones.', 'המוח גם שולט בשחרור ההורמונים וגם מושפע מהם.', '#f2b8c6', [9]);
  const flows = {};
  const tl = timeline(stage);
  let level = 0.15, target = 0.15, chronic = false, adr = null, day = -1;
  const cTrace = voltageTrace({ min: 0, max: 100, rest: 15, threshold: 60, color: '#ca8a04', every: 0.1 });
  const ready = setupRealBody(stage, { skin: 0.1, skeleton: 0.2, organs: ['adrenal', 'kidney'], brain: 'regions', regions: ['hypothalamus', 'pituitary', 'hippocampus', 'pineal'], brainOpacity: 0.25 }).then((rb) => {
    ['hypothalamus', 'pituitary', 'hippocampus', 'pineal'].forEach((r) => rb.regionMeshes[r]?.forEach((m) => stage.tag(m, r)));
    rb.regionMeshes._rest?.forEach((m) => stage.tag(m, 'brain'));
    adr = rb.organ('adrenal'); stage.tag(adr.pivot, 'adrenal');
    stage.tag(rb.organ('kidney').pivot, 'kidney');
    const c6 = rb.vertebra('C6');
    const thy = torus(0.22, 0.09, '#c026d3'); thy.geometry = new THREE.TorusGeometry(0.22, 0.09, 10, 24, Math.PI * 1.2);
    thy.position.set(0, c6.y - 0.1, c6.z + 0.85); thy.rotation.set(Math.PI / 2, 0, Math.PI * 0.9);
    stage.add(thy, 'thyroid');
    const hyp = rb.region('hypothalamus').center, pit = rb.region('pituitary').center, hip = rb.region('hippocampus').center;
    const aL = meshBox(rb, 'adrenal|left').getCenter(V()), aR = meshBox(rb, 'adrenal|right').getCenter(V());
    flows.crh = flow(stage, curve([hyp, hyp.clone().lerp(pit, 0.5).add(V(0, 0, 0.05)), pit]), { color: '#f97316', count: 5, size: 0.16, speed: 0.6 });
    flows.acth = flow(stage, curve([pit, rb.vertebra('C3').add(V(0.25, 0, 0.6)), rb.vertebra('T4').add(V(0.15, 0, 0.7)), rb.vertebra('T11').add(V(0.2, 0, 0.5)), aL]), { color: '#a855f7', count: 14, size: 0.3, speed: 0.25 });
    flows.cort = flow(stage, curve([aR, rb.vertebra('T10').add(V(-0.2, 0, 0.5)), rb.vertebra('T3').add(V(-0.15, 0, 0.7)), rb.vertebra('C3').add(V(-0.25, 0, 0.6)), hip]), { color: '#eab308', count: 14, size: 0.3, speed: 0.25 });
    Object.values(flows).forEach((f) => f.setActive(false));
    stage.resetView();
  });
  stage.onUpdate((dt) => {
    // the daily rhythm: low around midnight, a big rise just before waking (peak ~8:00), falling through the day
    if (day >= 0) {
      day += dt;
      const hr = (day % 24 + 0) % 24;
      const d = Math.min(Math.abs(hr - 8), 24 - Math.abs(hr - 8));
      target = 0.12 + 0.55 * Math.exp(-(d * d) / 10) + (hr > 8 && hr < 20 ? 0.1 * (20 - hr) / 12 : 0);
      flows.acth?.setActive(hr > 4 && hr < 10); flows.cort?.setActive(hr > 5 && hr < 12);
      if (day > 24) { day = -1; target = 0.15; all(false); }
    }
    level += (target - level) * Math.min(1, dt * 0.8);
    cTrace.push(level * 100, dt);
    adr?.meshes.forEach((m) => m.material.emissive.set('#eab308').multiplyScalar(level * 0.8));
    const pct = Math.round(level * 100);
    const clock = day >= 0 ? `🕒 <b>${String(Math.floor(day % 24)).padStart(2, '0')}:00</b> ${Math.floor(day % 24) >= 23 || Math.floor(day % 24) < 7 ? '😴' : '🙂'} · ` : '';
    readout(`${clock}${L('Cortisol in the blood', 'קורטיזול בדם')}: <b>${pct}%</b>${cTrace.svg()}${chronic ? `⚠️ ${L('Chronic stress: feedback fails, cortisol stays high (weaker immunity, hippocampus at risk)', 'לחץ כרוני: המשוב נכשל, הקורטיזול נשאר גבוה (חיסון מוחלש, סיכון להיפוקמפוס)')}` : ''}`);

  });
  const all = (on) => Object.values(flows).forEach((f) => f.setActive(on));
  const stress = () => {
    tl.clear(); day = -1;
    flows.crh?.setActive(true); stage.focus(['hypothalamus']);
    tl.later(1.5, () => { flows.acth?.setActive(true); stage.focus(['pituitary']); });
    tl.later(3.5, () => { flows.cort?.setActive(true); target = 0.85; stage.focus(['adrenal']); });
    if (!chronic) {
      tl.later(7, () => { stage.focus(['hypothalamus', 'pituitary', 'hippocampus']); });
      tl.later(8.5, () => { flows.crh?.setActive(false); flows.acth?.setActive(false); target = 0.15; });
      tl.later(11, () => { flows.cort?.setActive(false); stage.focus([]); });
    }
  };
  return {
    ready,
    home: { pos: V(6, 13, 11), target: V(0, 12.5, 0) },
    actions: [
      { icon: '⚠️', label: B('A stressor appears', 'מופיע גורם לחץ'), caption: B('Hypothalamus → CRH → pituitary → ACTH (through the blood) → adrenal cortex → cortisol. Then cortisol reaches the brain and switches the system off again (negative feedback).', 'היפותלמוס ← CRH ← יותרת המוח ← ACTH (דרך הדם) ← קליפת יותרת הכליה ← קורטיזול. אז הקורטיזול מגיע למוח ומכבה שוב את המערכת (משוב שלילי).'), run: stress },
      { icon: '⏳', label: B('Chronic stress', 'לחץ כרוני'), toggle: true, caption: B('When stress never ends, the axis stays on. Long-term high cortisol suppresses the immune system and may harm the hippocampus.', 'כשהלחץ לא נגמר, הציר נשאר פעיל. קורטיזול גבוה לאורך זמן מדכא את מערכת החיסון ועלול לפגוע בהיפוקמפוס.'), run: (on) => { chronic = on; if (on) stress(); else { target = 0.15; all(false); stage.focus([]); } } },
      { icon: '🌅', label: B('A day of cortisol', 'יום של קורטיזול'), caption: B('Cortisol is not only for stress. Each morning, just before you wake, the axis fires on its own and cortisol peaks (helping you get up). It falls through the day and is lowest around midnight. One second here is one hour. Night shifts and jet lag scramble this rhythm.', 'קורטיזול לא קיים רק בשביל לחץ. כל בוקר, רגע לפני שמתעוררים, הציר מופעל מעצמו והקורטיזול מגיע לשיא (ועוזר לקום). הוא יורד במשך היום ונמוך ביותר סביב חצות. שנייה אחת כאן היא שעה אחת. משמרות לילה וג׳ט לג משבשים את הקצב הזה.'), run: () => { tl.clear(); all(false); day = 0; stage.focus(['hypothalamus', 'adrenal']); } },
    ],
  };
}

export default {
  id: 'system',
  scenes: [
    { id: 'nervous', icon: '🕸️', name: B('The nervous system', 'מערכת העצבים'), chapters: [2], intro: B('The whole nervous system on a real skeleton: the central part (brain and spinal cord) and the peripheral nerves reaching every part of the body.', 'מערכת העצבים כולה על שלד אמיתי: החלק המרכזי (מוח וחוט שדרה) והעצבים ההיקפיים שמגיעים לכל חלק בגוף.'), build: nervousScene },
    { id: 'ans', icon: '🫀', name: B('Autonomic nervous system', 'מערכת העצבים האוטונומית'), chapters: [2, 14], intro: B('The automatic control of your organs, on the real organs. Switch between "fight or flight" and "rest and digest".', 'השליטה האוטומטית באיברים, על האיברים האמיתיים. עברו בין "הילחם או ברח" לבין "מנוחה ועיכול".'), build: ansScene },
    { id: 'hpa', icon: '⚗️', name: B('Hormones & stress (HPA axis)', 'הורמונים ולחץ (ציר HPA)'), chapters: [9, 14], intro: B('The endocrine system sends slower messages through the blood. Follow the stress hormones from the brain to the adrenal glands and back.', 'המערכת האנדוקרינית שולחת מסרים איטיים יותר דרך הדם. עקבו אחרי הורמוני הלחץ מהמוח לבלוטות יותרת הכליה ובחזרה.'), build: hpaScene },
  ],
};
