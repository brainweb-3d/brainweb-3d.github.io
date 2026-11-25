// MOLECULE level: neurotransmitters, drugs and toxins as real 3D molecules (PubChem 3D conformers, every atom
// including hydrogens), and a lock-and-key demo with a real receptor structure (RCSB PDB 3SN6).
import * as THREE from 'three';
import { bilayer, helixGeo, lumpGeo, meshOf } from '../proteins.js';
import { V, sphere, textSprite, mat, rod } from '../build.js';
import { moleculeData, buildMolecule, setMoleculeStyle, proteinData, buildProtein, uprightQuaternion } from '../data.js';
import { MESSENGERS, messengerColors } from '../../../content/chemistry.js';

const B = (en, he) => ({ en, he });
const SCALE = 0.42; // scene units per ångström

const INFO = {
  glutamate: [B('Glutamate', 'גלוטמט'), B('The brain\'s main EXCITATORY neurotransmitter (an amino acid). Acts on AMPA and NMDA receptors; key for learning (LTP).', 'המוליך העצבי המעורר העיקרי במוח (חומצת אמינו). פועל על קולטני AMPA ו-NMDA; חיוני ללמידה (LTP).'), [4, 12]],
  gaba: [B('GABA', 'GABA'), B('The brain\'s main INHIBITORY neurotransmitter. Alcohol and benzodiazepines boost its effect.', 'המוליך העצבי המעכב העיקרי במוח. אלכוהול ובנזודיאזפינים מגבירים את השפעתו.'), [4]],
  glycine: [B('Glycine', 'גליצין'), B('Inhibitory neurotransmitter, especially in the spinal cord. The smallest amino acid.', 'מוליך עצבי מעכב, במיוחד בחוט השדרה. חומצת האמינו הקטנה ביותר.'), [3, 4]],
  acetylcholine: [B('Acetylcholine (ACh)', 'אצטילכולין (ACh)'), B('Makes skeletal muscles contract; in the brain supports attention and memory. Note the nitrogen carrying three methyl groups.', 'גורם לשרירי השלד להתכווץ; במוח תומך בקשב ובזיכרון. שימו לב לחנקן הנושא שלוש קבוצות מתיל.'), [4, 8]],
  dopamine: [B('Dopamine', 'דופמין'), B('A catecholamine (ring with two OH groups + amine tail). Movement, reward and motivation; lost in Parkinson\'s.', 'קטכולאמין (טבעת עם שתי קבוצות OH + זנב אמין). תנועה, תגמול ומוטיבציה; אובד בפרקינסון.'), [4, 8, 14, 16]],
  norepinephrine: [B('Norepinephrine', 'נוראפינפרין'), B('Dopamine with one extra OH — made from dopamine. Arousal and vigilance (locus coeruleus).', 'דופמין עם OH נוסף — מיוצר מדופמין. עוררות ודריכות (הלוקוס צרולאוס).'), [4]],
  serotonin: [B('Serotonin (5-HT)', 'סרוטונין (5-HT)'), B('An indolamine (two fused rings). Mood, sleep, appetite and aggression; SSRIs increase it.', 'אינדולאמין (שתי טבעות מאוחות). מצב רוח, שינה, תיאבון ותוקפנות; SSRI מגבירים אותו.'), [4, 16]],
  histamine: [B('Histamine', 'היסטמין'), B('Promotes wakefulness — which is why antihistamines make you sleepy.', 'מקדם ערות — ולכן אנטי-היסטמינים מרדימים.'), [4, 11]],
  adenosine: [B('Adenosine', 'אדנוזין'), B('A neuromodulator that builds up while we are awake and makes us sleepy.', 'נוירומודולטור שמצטבר בזמן הערות וגורם לישנוניות.'), [4, 11]],
  amphetamine: [B('Amphetamine', 'אמפטמין'), B('Looks like dopamine without the OH groups — so dopamine transporters take it in, and it makes neurons release dopamine.', 'נראה כמו דופמין בלי קבוצות ה-OH — ולכן מובילי הדופמין קולטים אותו, והוא גורם לנוירונים לשחרר דופמין.'), [4]],
  nicotine: [B('Nicotine', 'ניקוטין'), B('Fits nicotinic acetylcholine receptors (an agonist); releases dopamine indirectly — highly addictive.', 'מתאים לקולטני אצטילכולין ניקוטיניים (אגוניסט); משחרר דופמין בעקיפין — ממכר מאוד.'), [4]],
  caffeine: [B('Caffeine', 'קפאין'), B('Blocks adenosine receptors (an antagonist), so the "sleepy" signal is silenced.', 'חוסם קולטני אדנוזין (אנטגוניסט), וכך אות ה"ישנוניות" מושתק.'), [4, 11]],
  cocaine: [B('Cocaine', 'קוקאין'), B('Blocks the dopamine (and serotonin, norepinephrine) transporters, so these transmitters stay in the synapse.', 'חוסם את מובילי הדופמין (וגם הסרוטונין והנוראפינפרין), ולכן המוליכים נשארים בסינפסה.'), [4, 14]],
  morphine: [B('Morphine', 'מורפין'), B('An opioid from the poppy: activates opioid receptors, the receptors for the body\'s own endorphins. Strong pain relief.', 'אופיואיד מצמח הפרג: מפעיל קולטני אופיואידים, הקולטנים של האנדורפינים של הגוף. משכך כאב חזק.'), [4, 7]],
  thc: [B('THC (cannabis)', 'THC (קנאביס)'), B('The main active compound of cannabis: activates CB1 cannabinoid receptors, the receptors for the brain\'s own endocannabinoids.', 'החומר הפעיל העיקרי בקנאביס: מפעיל קולטני קנבינואידים CB1, הקולטנים של האנדוקנבינואידים של המוח.'), [4]],
  diazepam: [B('Diazepam (Valium)', 'דיאזפאם (ואליום)'), B('A benzodiazepine: binds the GABA-A receptor and makes GABA work more strongly — calming.', 'בנזודיאזפין: נקשר לקולטן GABA-A וגורם ל-GABA לפעול חזק יותר — מרגיע.'), [4, 16]],
  ldopa: [B('L-DOPA', 'L-DOPA'), B('Dopamine plus a carboxyl group. It crosses the blood–brain barrier and is turned into dopamine — a treatment for Parkinson\'s.', 'דופמין ועוד קבוצת קרבוקסיל. חוצה את מחסום הדם-מוח והופך לדופמין — טיפול בפרקינסון.'), [4, 8, 15]],
  tubocurarine: [B('Tubocurarine (curare)', 'טובוקורארין (קורארה)'), B('The active part of curare arrow poison: blocks nicotinic ACh receptors on muscles → paralysis. Notice how big it is compared with ACh.', 'החלק הפעיל ברעל החיצים קורארה: חוסם קולטני ACh ניקוטיניים בשרירים ← שיתוק. שימו לב כמה הוא גדול לעומת ACh.'), [4, 8]],
  ttx: [B('Tetrodotoxin (TTX)', 'טטרודוטוקסין (TTX)'), B('Pufferfish poison: plugs voltage-gated Na⁺ channels, so nerves cannot fire.', 'רעל דג הנפוחית: פוקק תעלות Na⁺ תלויות מתח, ולכן עצבים לא יכולים לירות.'), [3]],
};
// Transmitter names and colours come from the shared list (content/chemistry.js), so every place uses the same ones.
for (const m of Object.values(MESSENGERS)) if (m.molecule && INFO[m.molecule]) INFO[m.molecule][0] = m.name;
const COLOR = { glutamate: '#ef4444', gaba: '#3b82f6', glycine: '#60a5fa', acetylcholine: '#ec4899', dopamine: '#f59e0b', norepinephrine: '#fb923c', serotonin: '#8b5cf6', histamine: '#14b8a6', adenosine: '#64748b', amphetamine: '#f97316', nicotine: '#84cc16', caffeine: '#a16207', cocaine: '#e2e8f0', morphine: '#c084fc', thc: '#22c55e', diazepam: '#38bdf8', ldopa: '#fbbf24', tubocurarine: '#b45309', ttx: '#0ea5e9', ...messengerColors() };

/** A button that lights up one group of molecules and explains what they share in the readout. */
const groupActions = (stage, readout, L, list) => list.map(([icon, en, he, ids, den, dhe]) => ({ icon, label: B(en, he), radio: true, caption: B(den, dhe), run: () => { stage.focus(ids); readout(`<b>${L(en, he)}</b>: ${ids.map((id) => L(INFO[id][0].en, INFO[id][0].he)).join(' · ')}`); } }));

const LEGEND = B('Grey = carbon, white = hydrogen, blue = nitrogen, red = oxygen, green = chlorine. Real 3D shapes from PubChem.', 'אפור = פחמן, לבן = מימן, כחול = חנקן, אדום = חמצן, ירוק = כלור. צורות תלת-ממדיות אמיתיות מ-PubChem.');

/**
 * A grid of molecules: each part = a holder group (the molecule + its name tag), laid out by real size.
 * Returns { ready, style actions }.
 */
function showcase(stage, ids, cols, L) {
  ids.forEach((id) => { const [name, desc, chapters] = INFO[id]; stage.definePart({ id, name, desc, color: COLOR[id], chapters }); });
  const view = { style: 'ball', hydrogens: true };
  const mols = [];
  const ready = moleculeData().then((data) => {
    ids.forEach((id, i) => {
      const m = buildMolecule(data[id], { scale: SCALE, ...view });
      const holder = new THREE.Group();
      holder.add(m);
      const box = new THREE.Box3().setFromObject(m);
      const label = textSprite(L(INFO[id][0].en, INFO[id][0].he), { size: 0.42, color: '#ffffff', bg: 'rgba(30,40,60,.78)' });
      label.position.set(0, box.min.y - 0.45, 0);
      holder.add(label);
      stage.add(holder, id);
      mols.push(m);
      stage.onUpdate((dt, t) => { m.rotation.y = Math.sin(t * 0.45 + i) * 0.6; });
    });
    stage.arrange(ids, { cols, gap: 1.1 });
    stage.resetView();
  });
  const restyle = () => mols.forEach((m) => setMoleculeStyle(m, view));
  const styleActions = [
    { icon: '⚪', label: B('Space-filling view', 'תצוגת מילוי חלל'), toggle: true, caption: B('Space-filling shows each atom at its real size (van der Waals radius) — this is the shape a receptor "feels".', 'תצוגת מילוי חלל מראה כל אטום בגודלו האמיתי (רדיוס ואן דר ואלס) — זו הצורה שהקולטן "מרגיש".'), run: (on) => { view.style = on ? 'space' : 'ball'; restyle(); } },
    { icon: '🫧', label: B('Hide hydrogens', 'הסתרת מימנים'), toggle: true, caption: B('Textbooks usually leave hydrogens out to make the skeleton clearer.', 'ספרי לימוד בדרך כלל משמיטים את המימנים כדי שהשלד יהיה ברור יותר.'), run: (on) => { view.hydrogens = !on; restyle(); } },
  ];
  return { ready, styleActions };
}

function transmittersScene(stage, { L, readout }) {
  const ids = ['glutamate', 'gaba', 'glycine', 'acetylcholine', 'dopamine', 'norepinephrine', 'serotonin', 'histamine', 'adenosine'];
  const s = showcase(stage, ids, 3, L);
  stage.definePart({ id: 'legend', name: B('Colour key', 'מקרא צבעים'), desc: LEGEND, color: '#4b5563' });
  return {
    ready: s.ready,
    home: { pos: V(0, 0, 18), target: V(0, 0, 0) },
    actions: [
      ...s.styleActions,
      { icon: '⚖️', label: B('Compare dopamine & norepinephrine', 'השוואה: דופמין ונוראפינפרין'), caption: B('Norepinephrine is made from dopamine by adding one OH group.', 'נוראפינפרין מיוצר מדופמין על ידי הוספת קבוצת OH אחת.'), run: () => stage.compare('dopamine', 'norepinephrine', { layout: 'side' }) },
      { icon: '⚖️', label: B('Compare glutamate & GABA', 'השוואה: גלוטמט ו-GABA'), caption: B('GABA is made from glutamate by removing one carboxyl group — yet one excites and the other inhibits.', 'GABA מיוצר מגלוטמט על ידי הסרת קבוצת קרבוקסיל אחת — ובכל זאת אחד מעורר והשני מעכב.'), run: () => stage.compare('glutamate', 'gaba', { layout: 'side' }) },
      ...groupActions(stage, readout, L, [
        ['🟢', 'Excitatory: push toward firing', 'מעוררים: דוחפים לירי', ['glutamate', 'acetylcholine'], 'They open channels that let positive ions in, so the next neuron gets closer to threshold.', 'הם פותחים תעלות שמכניסות יונים חיוביים, והנוירון הבא מתקרב לסף.'],
        ['🔴', 'Inhibitory: hold firing back', 'מעכבים: מרסנים את הירי', ['gaba', 'glycine'], 'They open Cl⁻ channels, so the next neuron moves away from threshold. Without them the brain would seize.', 'הם פותחים תעלות Cl⁻, והנוירון הבא מתרחק מהסף. בלעדיהם המוח היה נכנס להתקף.'],
        ['🎚️', 'Modulators: change the mood of a whole area', 'מווסתים: משנים את "מצב הרוח" של אזור שלם', ['dopamine', 'norepinephrine', 'serotonin', 'histamine', 'adenosine'], 'Made by small groups of neurons whose axons spread over large parts of the brain. They mostly act on slow GPCRs, tuning attention, reward, mood, wakefulness and sleep.', 'מיוצרים בקבוצות קטנות של נוירונים שהאקסונים שלהן מתפשטים על חלקים גדולים מהמוח. הם פועלים בעיקר על קולטני GPCR איטיים, ומכווננים קשב, תגמול, מצב רוח, ערות ושינה.'],
      ]),
    ],
  };
}

function drugsScene(stage, { L, readout }) {
  const s = showcase(stage, ['dopamine', 'amphetamine', 'acetylcholine', 'nicotine', 'adenosine', 'caffeine'], 2, L);
  return {
    ready: s.ready,
    home: { pos: V(0, 0, 18), target: V(0, 0, 0) },
    actions: [
      { icon: '🔍', label: B('Compare dopamine & amphetamine', 'השוואה: דופמין ואמפטמין'), caption: B('Same ring + 2-carbon chain + nitrogen. Amphetamine lacks the two OH groups and has an extra methyl — close enough to fool the dopamine transporter.', 'אותה טבעת + שרשרת של 2 פחמנים + חנקן. לאמפטמין חסרות שתי קבוצות ה-OH ויש לו מתיל נוסף — קרוב מספיק כדי "לרמות" את מוביל הדופמין.'), run: () => stage.compare('dopamine', 'amphetamine', { layout: 'side' }) },
      { icon: '🔍', label: B('Compare ACh & nicotine', 'השוואה: ACh וניקוטין'), caption: B('Both carry a nitrogen at a similar distance from an oxygen/ring — so nicotine fits nicotinic ACh receptors and activates them.', 'בשניהם יש חנקן במרחק דומה מחמצן/טבעת — ולכן ניקוטין מתאים לקולטני ACh ניקוטיניים ומפעיל אותם.'), run: () => stage.compare('acetylcholine', 'nicotine', { layout: 'side' }) },
      { icon: '🔍', label: B('Compare adenosine & caffeine', 'השוואה: אדנוזין וקפאין'), caption: B('Caffeine looks like the double ring (purine) part of adenosine — it sits in the adenosine receptor without switching it on.', 'קפאין דומה לחלק הטבעת הכפולה (פורין) של אדנוזין — הוא יושב בקולטן האדנוזין בלי להפעיל אותו.'), run: () => stage.compare('adenosine', 'caffeine', { layout: 'side' }) },
      ...groupActions(stage, readout, L, [
        ['🔑', 'The real keys (transmitters)', 'המפתחות האמיתיים (מוליכים)', ['dopamine', 'acetylcholine', 'adenosine'], 'The body’s own messengers. Each drug in this room copies one of them.', 'השליחים של הגוף עצמו. כל סם בחדר הזה מעתיק אחד מהם.'],
        ['🗝️', 'Look-alikes that turn the lock', 'חיקויים שמסובבים את המנעול', ['amphetamine', 'nicotine'], 'Agonists and look-alikes: nicotine switches ACh receptors on; amphetamine is taken in as if it were dopamine and pushes dopamine out.', 'אגוניסטים וחיקויים: ניקוטין מפעיל קולטני ACh; אמפטמין נקלט כאילו היה דופמין ודוחף דופמין החוצה.'],
        ['⛔', 'Look-alikes that only block', 'חיקויים שרק חוסמים', ['caffeine'], 'An antagonist: caffeine sits in the adenosine receptor without switching it on, so the tiredness signal cannot get through.', 'אנטגוניסט: קפאין יושב בקולטן האדנוזין בלי להפעיל אותו, ולכן אות העייפות לא עובר.'],
      ]),
      ...s.styleActions,
    ],
  };
}

function toxinsScene(stage, { L, readout }) {
  const s = showcase(stage, ['cocaine', 'morphine', 'thc', 'diazepam', 'dopamine', 'ldopa', 'acetylcholine', 'tubocurarine', 'ttx'], 3, L);
  return {
    ready: s.ready,
    home: { pos: V(0, 0, 20), target: V(0, 0, 0) },
    actions: [
      { icon: '🔍', label: B('Compare dopamine & L-DOPA', 'השוואה: דופמין ו-L-DOPA'), caption: B('L-DOPA is dopamine with an extra carboxyl group — that lets transporters carry it into the brain, where it becomes dopamine.', 'L-DOPA הוא דופמין עם קבוצת קרבוקסיל נוספת — זה מאפשר לחלבוני הובלה להכניס אותו למוח, שם הוא הופך לדופמין.'), run: () => stage.compare('dopamine', 'ldopa', { layout: 'side' }) },
      { icon: '🔍', label: B('Compare ACh & curare', 'השוואה: ACh וקורארה'), caption: B('Tubocurarine is far bigger than ACh. It plugs the receptor\'s binding site but cannot switch it on — an antagonist.', 'טובוקורארין גדול בהרבה מ-ACh. הוא פוקק את אתר הקישור בקולטן אבל לא יכול להפעיל אותו — אנטגוניסט.'), run: () => stage.compare('acetylcholine', 'tubocurarine', { layout: 'stack' }) },
      ...groupActions(stage, readout, L, [
        ['🚪', 'Jam the recycling (transporters)', 'תוקעים את המיחזור (מובילים)', ['cocaine'], 'Cocaine blocks the transporters that take dopamine back, so dopamine piles up in the synapse.', 'קוקאין חוסם את המובילים שמחזירים דופמין, ולכן הדופמין מצטבר בסינפסה.'],
        ['🗝️', 'Switch on the body’s own receptors', 'מפעילים את הקולטנים של הגוף', ['morphine', 'thc', 'diazepam'], 'Morphine uses the endorphin receptors, THC the endocannabinoid receptors, and diazepam makes GABA receptors work harder. The brain already had these locks for its own keys.', 'מורפין משתמש בקולטני האנדורפינים, THC בקולטני האנדוקנבינואידים, ודיאזפאם גורם לקולטני GABA לעבוד חזק יותר. למוח כבר היו המנעולים האלה בשביל המפתחות שלו.'],
        ['💊', 'Medicine: replace what is missing', 'תרופה: להחזיר את מה שחסר', ['ldopa', 'dopamine'], 'Dopamine cannot cross the blood–brain barrier, but L-DOPA can, and the brain turns it into dopamine. Used in Parkinson’s disease.', 'דופמין לא יכול לחצות את מחסום הדם-מוח, אבל L-DOPA יכול, והמוח הופך אותו לדופמין. משמש בפרקינסון.'],
        ['☠️', 'Poisons that block the signal', 'רעלים שחוסמים את האות', ['tubocurarine', 'ttx'], 'Curare blocks the ACh receptors on muscles; TTX corks the Na⁺ channels of nerves. Either way the message stops and the muscles are paralysed.', 'קורארה חוסמת את קולטני ה-ACh בשרירים; TTX פוקק את תעלות ה-Na⁺ של העצבים. בשני המקרים המסר נעצר והשרירים משותקים.'],
      ]),
      ...s.styleActions,
    ],
  };
}

// ---------------------------------------------------------------- lock and key with a real receptor
// ---------------------------------------------------------------- lock and key (owner, 2026-11-15: redo it the way
// textbooks draw it). The receptor's binding site is a shaped slot; each molecule is a key. The right key (the
// transmitter, or a drug that mimics it) fits AND turns the lock: the receptor changes shape and its channel opens.
// A partial agonist turns it part-way. An antagonist fits the slot but does not turn it, and blocks the real key.
// A molecule of the wrong shape cannot bind at all. The real receptor protein (PDB 3SN6) is one toggle away.
const extrude = (shape, depth = 1.2, bevel = 0.05) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel * 2, bevelSize: bevel, bevelSegments: 5, curveSegments: 24 }); g.translate(0, 0, -depth / 2); return g; };
const physical = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.45, clearcoat: 0.4, ...o });
/** Key shapes: the bottom is what goes into the slot, the top is the "handle" of the molecule. */
const KEYS = {
  natural: (s) => { s.moveTo(-0.38, 0); s.lineTo(-0.1, -0.47); s.absarc(0, -0.47, 0.1, Math.PI, 0, true); s.lineTo(0.38, 0); s.absarc(0, 0.25, 0.46, -0.57, Math.PI + 0.57, false); },
  partial: (s) => { s.moveTo(-0.38, 0); s.lineTo(-0.2, -0.3); s.absarc(0, -0.3, 0.2, Math.PI, 0, true); s.lineTo(0.38, 0); s.absarc(0, 0.25, 0.46, -0.57, Math.PI + 0.57, false); },
  antagonist: (s) => { s.moveTo(-0.38, 0); s.lineTo(-0.1, -0.47); s.absarc(0, -0.47, 0.1, Math.PI, 0, true); s.lineTo(0.38, 0); s.lineTo(0.75, 0); s.lineTo(0.75, 0.7); s.lineTo(-0.75, 0.7); s.lineTo(-0.75, 0); s.lineTo(-0.38, 0); },
  wrong: (s) => { s.moveTo(-0.5, -0.45); s.lineTo(0.5, -0.45); s.lineTo(0.5, 0.45); s.lineTo(-0.5, 0.45); s.lineTo(-0.5, -0.45); },
};
function bindingScene(stage, { readout, L }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [4] });
  D('receptor', 'Receptor (the lock)', 'קולטן (המנעול)', 'A protein in the membrane of the next neuron. Its binding site is a pocket with a precise shape and charge pattern: only molecules that match it can bind. Binding changes the receptor\'s shape — here it opens a channel for ions.', 'חלבון בממברנה של הנוירון הבא. אתר הקישור שלו הוא כיס בעל צורה ודפוס מטענים מדויקים: רק מולקולות שמתאימות לו יכולות להיקשר. הקישור משנה את צורת הקולטן — כאן הוא פותח תעלה ליונים.', '#3cb37a');
  D('key', 'The molecule (the key)', 'המולקולה (המפתח)', 'Transmitters and drugs are keys of different shapes. Fit decides whether they bind; what they do once inside decides whether they turn the lock.', 'מוליכים עצביים ותרופות הם מפתחות בצורות שונות. ההתאמה קובעת אם הם נקשרים; מה שהם עושים בפנים קובע אם הם מסובבים את המנעול.', '#f59e0b');
  D('membraneB', 'Cell membrane', 'קרום התא', 'The receptor crosses the membrane: the binding site faces the synapse, the channel opens into the cell.', 'הקולטן חוצה את הממברנה: אתר הקישור פונה לסינפסה, והתעלה נפתחת אל תוך התא.', '#f6dccf');
  D('realReceptor', 'The real receptor protein (PDB 3SN6)', 'חלבון הקולטן האמיתי (PDB 3SN6)', 'What a receptor really looks like: the β2-adrenergic receptor, 7 helices across the membrane, with a G-protein (purple) inside the cell. Its binding pocket works exactly like the slot in the drawing.', 'כך נראה קולטן באמת: הקולטן ה-β2-אדרנרגי, 7 סלילים שחוצים את הממברנה, עם חלבון G (סגול) בתוך התא. כיס הקישור שלו פועל בדיוק כמו החריץ בציור.', '#3cb37a');
  // the membrane: a real lipid bilayer (src/visual/proteins.js), open where the receptor sits (owner, 2026-11-15)
  const { group: memb } = bilayer({ w: 11.4, d: 2.4, keep: (x) => Math.abs(x) > 1.62, y: 0.48 });
  memb.position.y = -1.1;
  stage.add(memb, 'membraneB');
  // the receptor: two subunits with a channel (pore) between them; the slot is cut into the left subunit's top
  // the slot: a V with a round bottom, cut into the left subunit's top (centred at x = −0.8)
  const L0 = new THREE.Shape(); L0.moveTo(-1.5, -2.3); L0.lineTo(-0.12, -2.3); L0.lineTo(-0.12, 0.6); L0.lineTo(-0.38, 0.6); L0.lineTo(-0.68, 0.1); L0.absarc(-0.8, 0.1, 0.12, 0, Math.PI, true); L0.lineTo(-1.22, 0.6); L0.lineTo(-1.5, 0.6); L0.lineTo(-1.5, -2.3);
  const R0 = new THREE.Shape(); R0.moveTo(0.12, -2.3); R0.lineTo(1.5, -2.3); R0.lineTo(1.5, 0.6); R0.lineTo(0.12, 0.6); R0.lineTo(0.12, -2.3);
  const recMat = physical('#3cb37a');
  const subL = new THREE.Mesh(extrude(L0, 1.0, 0.1), recMat), subR = new THREE.Mesh(extrude(R0, 1.0, 0.1), recMat.clone());
  // the helices that carry each subunit across the membrane, standing proud of its front face, and a lumpy surface
  for (const [sub, xs] of [[subL, [-1.25, -0.82, -0.4]], [subR, [0.4, 0.82, 1.25]]]) {
    const hx = xs.map((x, i) => helixGeo(V(x, -1.95, 0.7 - (i % 2) * 0.08), V(x + (i % 2 ? 0.06 : -0.06), -0.35, 0.7 - (i % 2) * 0.08), { r: 0.11, tube: 0.05, pitch: 0.2 })).flat();
    sub.add(meshOf(hx, physical('#22915a')));
    const bumps = []; for (let k = 0; k < 14; k++) bumps.push(lumpGeo(V(xs[0] + ((k * 0.37) % 1) * (xs[2] - xs[0]), -2.25 + (k % 4) * 0.06, -0.45 + (k % 3) * 0.45), 0.16, { seed: k, amp: 0.15 }));
    sub.add(meshOf(bumps, physical('#2fa36b'))); // the folded loops hanging inside the cell
  }
  const rec = new THREE.Group(); rec.add(subL, subR); stage.add(rec, 'receptor');
  const pore = textSprite(L('channel', 'תעלה'), { size: 0.26 }); pore.position.set(0, -2.7, 0.8); stage.add(pore);
  const outside = textSprite(L('synapse (outside)', 'סינפסה (בחוץ)'), { size: 0.3 }); outside.position.set(-3.6, 1.6, 0.8); stage.add(outside);
  const inside = textSprite(L('inside the cell', 'בתוך התא'), { size: 0.3 }); inside.position.set(-3.6, -2.6, 0.8); stage.add(inside);
  // the key in play
  const KEYCOL = { natural: '#f59e0b', agonist: '#fb923c', partial: '#facc15', antagonist: '#ef4444', wrong: '#3b82f6' };
  let key = null, kind = null, t = 0, open = 0, second = null;
  // a key: its shape, glossy, with a few atoms on its face (a molecule, not a plastic token)
  const makeKey = (k) => {
    const sh = new THREE.Shape(); KEYS[k === 'agonist' ? 'natural' : k](sh);
    const m = new THREE.Mesh(extrude(sh, 0.6, 0.08), physical(KEYCOL[k], { clearcoat: 0.8, roughness: 0.3 }));
    const pts = sh.getSpacedPoints(10).slice(0, 10), atoms = [], bonds = [];
    const at = pts.map((p) => V(p.x * 0.72, p.y * 0.72 + 0.07, 0.42));
    at.forEach((p, i) => { atoms.push(new THREE.SphereGeometry(i % 3 === 0 ? 0.09 : 0.07, 12, 9).translate(p.x, p.y, p.z)); const q = at[(i + 1) % at.length]; bonds.push(new THREE.CylinderGeometry(0.025, 0.025, p.distanceTo(q), 6).applyMatrix4(new THREE.Matrix4().compose(p.clone().lerp(q, 0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), q.clone().sub(p).normalize()), V(1, 1, 1)))); });
    m.add(meshOf(bonds, mat('#f8fafc', { rough: 0.4 })), meshOf(atoms, mat(k === 'wrong' ? '#dbeafe' : '#fff7ed', { rough: 0.35 })));
    return m;
  };
  const SLOT = V(-0.8, 0.6, 0); // the slot's top centre
  const ions = Array.from({ length: 10 }, () => { const s = sphere(0.09, '#a855f7'); s.visible = false; stage.root.add(s); return s; });
  const drop = (k) => {
    [key, second].forEach((o) => o && stage.root.remove(o)); second = null;
    key = makeKey(k); stage.add(key, 'key'); kind = k; t = 0;
  };
  stage.onUpdate((dt) => {
    if (!key || realGroup.visible) return;
    t += dt;
    const fall = Math.min(1, t / 1.6), ease = fall * fall * (3 - 2 * fall);
    const depth = kind === 'wrong' ? 0.1 : kind === 'partial' ? 0.2 : 0; // how far it can go in
    const y = SLOT.y + 3.2 * (1 - ease) + depth;
    if (kind === 'wrong' && fall >= 1) { key.position.set(SLOT.x + Math.min(1.6, (t - 1.6) * 1.5), y + Math.min(1.2, (t - 1.6) * 1.3), 0); key.rotation.z = (t - 1.6) * 1.5; }
    else key.position.set(SLOT.x, y, 0);
    const want = fall < 1 ? 0 : kind === 'natural' || kind === 'agonist' ? 1 : kind === 'partial' ? 0.4 : 0;
    open += (want - open) * Math.min(1, dt * 3);
    subR.position.x = open * 0.35; subR.rotation.z = -open * 0.12; subL.rotation.z = open * 0.04;
    recMat.emissive.set(open > 0.05 ? '#3cb37a' : '#000000').multiplyScalar(open * 0.4);
    ions.forEach((s, i) => { const ph = (t * 0.8 + i / ions.length) % 1; s.visible = open > 0.2 && (i / ions.length) < open; s.position.set(0.17 * open + (i % 2 ? 0.04 : -0.04), 1.2 - ph * 4, (i % 3 - 1) * 0.15); });
    // the antagonist sits in the slot; then the real transmitter arrives and cannot get in
    if (kind === 'antagonist' && t > 2.4) {
      if (!second) { second = makeKey('natural'); stage.add(second, 'key'); }
      const u = Math.min(1, (t - 2.4) / 1.2);
      second.position.set(SLOT.x + 0.9 * (u >= 1 ? Math.min(1, (t - 3.6) * 1.2) : 0), SLOT.y + 3.4 - 1.6 * u + (u >= 1 ? Math.min(0.8, (t - 3.6)) : 0), 0.05);
      second.rotation.z = u >= 1 ? (t - 3.6) * -1.2 : 0;
    }
    readout({
      natural: fall < 1 ? '…' : `✅ ${L('The transmitter fits the slot and turns the lock: the receptor changes shape, the channel opens and ions flow in.', 'המוליך מתאים לחריץ ומסובב את המנעול: הקולטן משנה צורה, התעלה נפתחת ויונים זורמים פנימה.')}`,
      agonist: fall < 1 ? '…' : `✅ ${L('An agonist drug has the same key shape: it fits and turns the lock just like the transmitter.', 'לתרופה אגוניסטית יש אותה צורת מפתח: היא מתאימה ומסובבת את המנעול בדיוק כמו המוליך.')}`,
      partial: fall < 1 ? '…' : `🔸 ${L('A partial agonist fits loosely: it turns the lock only part-way — the channel opens a little.', 'אגוניסט חלקי מתאים באופן רופף: הוא מסובב את המנעול רק חלקית — התעלה נפתחת מעט.')}`,
      antagonist: fall < 1 ? '…' : t < 3.6 ? `⛔ ${L('The antagonist fits the slot but does not turn the lock: the channel stays shut…', 'האנטגוניסט מתאים לחריץ אבל לא מסובב את המנעול: התעלה נשארת סגורה…')}` : `⛔ ${L('…and the real transmitter cannot get in: the slot is taken. (More transmitter can sometimes push it out.)', '…והמוליך האמיתי לא יכול להיכנס: החריץ תפוס. (יותר מוליך יכול לפעמים לדחוק אותו החוצה.)')}`,
      wrong: fall < 1 ? '…' : `❌ ${L('Wrong shape: it cannot fit the slot, so it does not bind at all. Each receptor recognises only its own keys.', 'צורה לא מתאימה: היא לא נכנסת לחריץ, ולכן לא נקשרת בכלל. כל קולטן מזהה רק את המפתחות שלו.')}`,
    }[kind]);
  });
  // the real receptor protein, hidden until asked for
  const realGroup = new THREE.Group(); realGroup.visible = false; stage.root.add(realGroup);
  const ready = proteinData('3SN6').then((d) => {
    const s = 0.07;
    const r = buildProtein(d, { scale: s, chains: ['R'], colors: ['#3cb37a'] });
    const gp = buildProtein(d, { scale: s, chains: ['A', 'B', 'G'], colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'] });
    const turn = new THREE.Group(); turn.quaternion.copy(uprightQuaternion(d, ['R'], ['A', 'B', 'G'])); turn.add(r, gp); turn.updateMatrixWorld(true);
    const c = new THREE.Box3().setFromObject(r).getCenter(new THREE.Vector3()); turn.position.sub(c).add(V(0, -1.1, 0));
    turn.remove(r, gp); stage.add(r, 'realReceptor', turn); stage.add(gp, 'realReceptor', turn);
    realGroup.add(turn);
  }).catch((e) => console.warn('Receptor structure not loaded:', e));
  const k = (id, icon, en, he, cen, che) => ({ icon, label: B(en, he), caption: B(cen, che), radio: true, run: () => { realGroup.visible = false; rec.visible = true; drop(id); stage.focus(['receptor', 'key']); } });
  return {
    ready,
    home: { pos: V(-0.4, 0.6, 9.5), target: V(-0.4, -0.2, 0) },
    actions: [
      k('natural', '🔑', 'The transmitter (the right key)', 'המוליך (המפתח הנכון)', 'The natural neurotransmitter fits the binding site and switches the receptor on.', 'המוליך העצבי הטבעי מתאים לאתר הקישור ומפעיל את הקולטן.'),
      k('agonist', '💊', 'An agonist drug', 'תרופה אגוניסטית', 'Agonists mimic the transmitter\'s shape (e.g. nicotine at acetylcholine receptors, morphine at opioid receptors).', 'אגוניסטים מחקים את צורת המוליך (למשל ניקוטין בקולטני אצטילכולין, מורפין בקולטני אופיואידים).'),
      k('partial', '🔸', 'A partial agonist', 'אגוניסט חלקי', 'A key that fits loosely and turns the lock only part-way (e.g. the smoking-cessation drug varenicline).', 'מפתח שמתאים באופן רופף ומסובב את המנעול רק חלקית (למשל התרופה לגמילה מעישון וארניקלין).'),
      k('antagonist', '🧱', 'An antagonist (blocker)', 'אנטגוניסט (חוסם)', 'Fits but does not turn it — and keeps the real key out (e.g. curare at muscle receptors, antipsychotics at dopamine receptors).', 'מתאים אבל לא מסובב — ומשאיר את המפתח האמיתי בחוץ (למשל קורארה בקולטני השריר, תרופות אנטי-פסיכוטיות בקולטני דופמין).'),
      k('wrong', '🚫', 'The wrong molecule', 'המולקולה הלא נכונה', 'A transmitter meant for a different receptor: wrong shape, so it cannot bind here.', 'מוליך שמיועד לקולטן אחר: צורה לא מתאימה, ולכן הוא לא יכול להיקשר כאן.'),
      { icon: '🔬', label: B('Show the real receptor protein', 'הצגת חלבון הקולטן האמיתי'), toggle: true, caption: B('The real structure behind the drawing (PDB 3SN6): 7 helices across the membrane, the binding pocket open to the synapse, the G-protein inside.', 'המבנה האמיתי שמאחורי הציור (PDB 3SN6): 7 סלילים שחוצים את הממברנה, כיס הקישור פתוח לסינפסה, חלבון ה-G בפנים.'), run: (on) => { realGroup.visible = on; rec.visible = !on; [key, second].forEach((o) => { if (o) o.visible = !on; }); ions.forEach((s) => { s.visible = false; }); stage.focus(on ? ['realReceptor'] : []); } },
    ],
  };
}

// ---------------------------------------------------------------- what DNA is made of (owner, 2026-11-15: deeper DNA levels)
// A short stretch of DNA unwound into a flat ladder, the way textbooks draw it: two sugar–phosphate backbones (the
// rails) and the four bases as rungs. A pairs only with T (2 hydrogen bonds), G only with C (3). Purines (A, G) have
// two rings, pyrimidines (T, C) one, so every rung is the same width.
function nucleotidesScene(stage, { readout, L }) {
  const D = (id, en, he, den, dhe, color) => stage.definePart({ id, name: B(en, he), desc: B(den, dhe), color, chapters: [5] });
  D('phosphate', 'Phosphate group', 'קבוצת פוספט', 'A phosphorus atom with four oxygens. It links the sugar of one nucleotide to the next, and its negative charge makes DNA an acid.', 'אטום זרחן עם ארבעה חמצנים. הוא מקשר בין הסוכר של נוקלאוטיד אחד לבא, והמטען השלילי שלו הופך את ה-DNA לחומצה.', '#f97316');
  D('sugar', 'Deoxyribose (sugar)', 'דאוקסיריבוז (סוכר)', 'A five-carbon sugar ring. Sugar and phosphate alternate to form each strand\'s backbone; RNA uses ribose, which has one more oxygen.', 'טבעת סוכר של חמישה פחמנים. סוכר ופוספט מתחלפים ויוצרים את שלד כל גדיל; ב-RNA יש ריבוז, עם חמצן אחד נוסף.', '#94a3b8');
  D('adenine', 'Adenine (A)', 'אדנין (A)', 'A purine (two rings). Pairs only with thymine, by 2 hydrogen bonds.', 'פורין (שתי טבעות). מתחבר רק לתימין, בשני קשרי מימן.', '#ef4444');
  D('thymine', 'Thymine (T)', 'תימין (T)', 'A pyrimidine (one ring). Pairs only with adenine. In RNA it is replaced by uracil (U).', 'פירימידין (טבעת אחת). מתחבר רק לאדנין. ב-RNA הוא מוחלף באורציל (U).', '#f2c14e');
  D('guanine', 'Guanine (G)', 'גואנין (G)', 'A purine (two rings). Pairs only with cytosine, by 3 hydrogen bonds — a G–C pair holds tighter than A–T.', 'פורין (שתי טבעות). מתחבר רק לציטוזין, בשלושה קשרי מימן — זוג G–C מחזיק חזק יותר מ-A–T.', '#3cb37a');
  D('cytosine', 'Cytosine (C)', 'ציטוזין (C)', 'A pyrimidine (one ring). Pairs only with guanine. A methyl tag on a cytosine can switch a gene off (see epigenetics).', 'פירימידין (טבעת אחת). מתחבר רק לגואנין. תג מתיל על ציטוזין יכול לכבות גן (ראו אפיגנטיקה).', '#5b8def');
  D('hbonds', 'Hydrogen bonds', 'קשרי מימן', 'Weak attractions that hold the two strands together: easy to unzip for copying or reading a gene, strong in their millions.', 'משיכות חלשות שמחזיקות את שני הגדילים יחד: קל לפתוח אותם להעתקה או לקריאת גן, אבל במיליונים הם חזקים.', '#e2e8f0');
  const BASE = { A: ['adenine', '#ef4444', 2], T: ['thymine', '#f2c14e', 1], G: ['guanine', '#3cb37a', 2], C: ['cytosine', '#5b8def', 1] };
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const SEQ = ['A', 'G', 'T', 'C', 'G'];
  const ring = (r, n, color) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, n), mat(color, { rough: 0.4 })); m.rotation.x = Math.PI / 2;
    const atoms = [];
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + Math.PI / n; atoms.push(new THREE.SphereGeometry(r * 0.2, 10, 8).translate(Math.cos(a) * r * 0.82, 0.07, Math.sin(a) * r * 0.82)); } // ring corners (carbon)
    m.add(meshOf(atoms, mat('#e5e7eb', { rough: 0.35 })));
    const het = new THREE.Mesh(new THREE.SphereGeometry(r * 0.24, 10, 8), mat(n === 5 && color === '#94a3b8' ? '#ef4444' : '#3b82f6', { rough: 0.35 })); // the ring's O (sugar) or N (base)
    het.position.set(Math.cos(Math.PI / n) * r * 0.82, 0.075, Math.sin(Math.PI / n) * r * 0.82); m.add(het);
    return m;
  };
  const phosphateModel = () => { const g = new THREE.Group(); g.add(sphere(0.15, '#f97316')); for (const d of [V(0, 0.2, 0), V(0.19, -0.07, 0), V(-0.19, -0.07, 0), V(0, -0.05, 0.19)]) { const o = sphere(0.075, '#ef4444'); o.position.copy(d); g.add(o); } return g; };
  const reach = (l) => (BASE[l][2] === 2 ? 1.12 : 0.72); // how far a base reaches toward the middle
  // one base, as a flat ring (or two) pointing from its sugar (x = 0) along +x
  const baseMesh = (letter) => {
    const [id, color, rings] = BASE[letter];
    const g = new THREE.Group();
    const h = ring(0.27, 6, color); h.position.x = 0.45; g.add(h);
    if (rings === 2) { const p = ring(0.22, 5, color); p.position.x = 0.9; g.add(p); }
    g.add(rod(V(0, 0, 0), V(0.2, 0, 0), 0.05, color));
    return { g, id, color };
  };
  const letterAt = (letter, x, y, parent) => { const t = textSprite(letter, { size: 0.3, color: '#1f2937' }); t.position.set(x, y, 0.15); parent.add(t); };
  const strands = [new THREE.Group(), new THREE.Group()];
  const bonds = [];
  const STEP = 0.95, X = 1.85; // sugars sit at x = ±X; a purine + a pyrimidine always fill the gap between them
  SEQ.forEach((letter, i) => {
    const y = 2.2 - i * STEP;
    [letter, PAIR[letter]].forEach((l, side) => {
      const sgn = side ? 1 : -1;
      const sg = ring(0.24, 5, '#94a3b8'); sg.position.set(sgn * X, y, 0); stage.add(sg, 'sugar', strands[side]);
      if (i < SEQ.length - 1) {
        const ph = phosphateModel(); ph.position.set(sgn * (X + 0.45), y - STEP / 2, 0); stage.add(ph, 'phosphate', strands[side]);
        stage.add(rod(V(sgn * X, y, 0), ph.position, 0.04, '#cbd5e1'), 'phosphate', strands[side]);
        stage.add(rod(ph.position, V(sgn * X, y - STEP, 0), 0.04, '#cbd5e1'), 'phosphate', strands[side]);
      }
      const b = baseMesh(l);
      b.g.position.set(sgn * (X - 0.15), y, 0);
      if (sgn > 0) b.g.rotation.z = Math.PI; // the right strand's bases point left, toward the middle
      stage.add(b.g, b.id, strands[side]);
      letterAt(l, sgn * (X - 0.6), y, strands[side]);
    });
    // hydrogen bonds: 2 for A–T, 3 for G–C, in the small gap where the two bases meet
    const n = letter === 'A' || letter === 'T' ? 2 : 3;
    const gL = -(X - 0.15) + reach(letter), gR = X - 0.15 - reach(PAIR[letter]);
    const hb = new THREE.Group();
    for (let k = 0; k < n; k++) { const yy = y + (k - (n - 1) / 2) * 0.12; hb.add(rod(V(gL - 0.05, yy, 0.02), V(gR + 0.05, yy, 0.02), 0.018, '#e2e8f0')); }
    stage.add(hb, 'hbonds'); bonds.push(hb);
  });
  strands.forEach((s) => stage.root.add(s));
  for (const [x, txt] of [[-X - 0.2, "5'"], [X + 0.2, "3'"]]) { const t = textSprite(txt, { size: 0.28, color: '#475569' }); t.position.set(x, 3.15, 0); stage.root.add(t); }
  // one free nucleotide (phosphate + sugar + base) that can be pulled apart into its three pieces
  const free = new THREE.Group(); free.position.set(4.4, 0.3, 0);
  const fPh = phosphateModel(), fSg = ring(0.24, 5, '#94a3b8'), fB = baseMesh('C');
  stage.add(fPh, 'phosphate', free); stage.add(fSg, 'sugar', free); stage.add(fB.g, 'cytosine', free);
  const flbl = textSprite(L('one nucleotide', 'נוקלאוטיד אחד'), { size: 0.28, color: '#475569' }); flbl.position.set(0.3, 1.2, 0); free.add(flbl);
  const pieceLbls = [[L('phosphate', 'פוספט'), fPh], [L('sugar', 'סוכר'), fSg], [L('base', 'בסיס'), fB.g]].map(([txt, o]) => { const t = textSprite(txt, { size: 0.22, color: '#475569' }); t.visible = false; free.add(t); return [t, o]; });
  stage.root.add(free);
  let apart = 0, apartT = 0, unzip = 0, unzipT = 0;
  stage.onUpdate((dt) => {
    apart += (apartT - apart) * Math.min(1, dt * 3);
    fPh.position.set(-0.45 - apart * 0.5, 0.35 + apart * 0.6, 0); fSg.position.set(0, 0, 0); fB.g.position.set(0.2 + apart * 0.5, -apart * 0.7, 0);
    pieceLbls.forEach(([t, o]) => { t.visible = apart > 0.5; t.position.copy(o.position).add(V(0.35, -0.38, 0)); });
    unzip += (unzipT - unzip) * Math.min(1, dt * 1.5);
    strands[0].position.x = -unzip * 1.2; strands[1].position.x = unzip * 1.2;
    bonds.forEach((b) => { b.visible = unzip < 0.15; });
  });
  readout(L('Sugar + phosphate + base = one nucleotide · A–T and G–C', 'סוכר + פוספט + בסיס = נוקלאוטיד אחד · A–T ו-G–C'));
  return {
    home: { pos: V(1.1, 0.6, 18), target: V(1.1, 0.5, 0) },
    actions: [
      { icon: '🧩', label: B('Take a nucleotide apart', 'פירוק נוקלאוטיד'), toggle: true, caption: B('Every letter of DNA is a nucleotide: a phosphate (orange), a deoxyribose sugar (grey) and one of four bases. DNA is a chain of millions of them.', 'כל אות ב-DNA היא נוקלאוטיד: פוספט (כתום), סוכר דאוקסיריבוז (אפור) ואחד מארבעה בסיסים. DNA הוא שרשרת של מיליוני נוקלאוטידים.'), run: (on) => { apartT = on ? 1 : 0; } },
      { icon: '🤝', label: B('Show the base pairs', 'הצגת זוגות הבסיסים'), radio: true, caption: B('A always faces T (2 hydrogen bonds), G always faces C (3). A two-ring base always pairs with a one-ring base, so the ladder is the same width all along, and each strand is the complement of the other.', 'A תמיד מול T (שני קשרי מימן), G תמיד מול C (שלושה). בסיס עם שתי טבעות תמיד מתחבר לבסיס עם טבעת אחת, כך שהסולם באותו רוחב לכל אורכו, וכל גדיל משלים את השני.'), run: () => { unzipT = 0; stage.focus(['hbonds']); } },
      { icon: '🤐', label: B('Unzip the two strands', 'פתיחת הרוכסן'), radio: true, caption: B('The hydrogen bonds let go and the two strands separate, as they do before a cell copies its DNA or reads a gene. Each strand is the template for a new partner.', 'קשרי המימן משתחררים ושני הגדילים נפרדים, כמו לפני שתא מעתיק את ה-DNA שלו או קורא גן. כל גדיל הוא תבנית לבן-זוג חדש.'), run: () => { unzipT = 1; stage.focus([]); } },
    ],
  };
}

export default {
  id: 'molecule',
  scenes: [
    { id: 'transmitters', icon: '🧪', name: B('Neurotransmitters', 'מוליכים עצביים'), chapters: [4], intro: B('The chemical messengers of the brain as real 3D molecules, atom by atom. Click one to see it alone, or compare two.', 'השליחים הכימיים של המוח כמולקולות תלת-ממדיות אמיתיות, אטום אחר אטום. לחצו על אחת כדי לראות אותה לבד, או השוו בין שתיים.'), build: transmittersScene },
    { id: 'drugs', icon: '💊', name: B('Drugs that mimic them', 'סמים שמחקים אותם'), chapters: [4], intro: B('Many drugs work because their shape resembles a natural transmitter. Compare the pairs side by side.', 'סמים רבים פועלים כי הצורה שלהם דומה למוליך טבעי. השוו את הזוגות זה לצד זה.'), build: drugsScene },
    { id: 'toxins', icon: '☠️', name: B('More drugs & toxins', 'עוד סמים ורעלים'), chapters: [4], intro: B('Cocaine, morphine, THC, a benzodiazepine, L-DOPA and two deadly toxins — with the transmitters they act on.', 'קוקאין, מורפין, THC, בנזודיאזפין, L-DOPA ושני רעלים קטלניים — עם המוליכים שעליהם הם פועלים.'), build: toxinsScene },
    { id: 'binding', icon: '🔑', name: B('Lock and key', 'מנעול ומפתח'), chapters: [4], intro: B('A receptor is a lock and each molecule is a key. Try the right key, a drug that mimics it, a partial key, a blocker and a wrong one — and see which turn the lock.', 'קולטן הוא מנעול וכל מולקולה היא מפתח. נסו את המפתח הנכון, תרופה שמחקה אותו, מפתח חלקי, חוסם ומפתח לא נכון — וראו אילו מסובבים את המנעול.'), build: bindingScene },
    { id: 'nucleotides', icon: '🔤', name: B('What DNA is made of', 'ממה עשוי ה-DNA'), chapters: [5], intro: B('A short stretch of DNA unwound into a flat ladder: sugar and phosphate make the rails, the four bases A, T, G and C make the rungs. Take a nucleotide apart, see which bases pair, and unzip the strands.', 'קטע קצר של DNA שנפרש לסולם שטוח: סוכר ופוספט יוצרים את המסילות, ארבעת הבסיסים A, ‏T, ‏G ו-C יוצרים את השלבים. פרקו נוקלאוטיד, ראו אילו בסיסים מתחברים, ופתחו את הגדילים.'), build: nucleotidesScene },
  ],
};
