// Live pathway animations shown in the 3D brain.
//
// Each pathway is a sequence of STAGES. A stage has a caption and one or more PATHS. A path is a list of points;
// signals (glowing particles) flow along it. Points are given relative to brain parts so they work on any model:
//   'thalamus'                         → centre of the part (both sides)
//   ['thalamus', 'L']                  → centre of the left thalamus ('R' = right)
//   ['frontal', 'L', [0, 0.2, 0.8]]    → left frontal lobe, offset by fractions of its half-size (x, y, z)
//   { v: 'eyeL' }                      → a point outside the brain (eyes, ears, nose, tongue, hand, adrenal)
// Coordinates: x = left(-)/right(+), y = down(-)/up(+), z = back(-)/front(+).
// To add a pathway: copy one below, change the points and captions. `regions` lists the parts to highlight.

const P = (r, s, off) => (s || off ? [r, s || '', off || [0, 0, 0]] : r);

// Several pathways fan out from one source to many cortical targets
const fan = (src, side, targets) => targets.map(([r, s, off, via]) => [P(src, side), ...(via ? [via] : []), P(r, s, off)]);

export const PATHWAY_GROUPS = {
  transmitters: { en: 'Neurotransmitter systems', he: 'מערכות מוליכים עצביים' },
  senses: { en: 'Senses (try a stimulus)', he: 'חושים (נסו גירוי)' },
  action: { en: 'Movement, memory & emotion', he: 'תנועה, זיכרון ורגש' },
};

export const PATHWAYS = [
  // ===================== Neurotransmitter systems =====================
  {
    id: 'dopamine', group: 'transmitters', color: '#f5b301', icon: '⚡',
    name: { en: 'Dopamine pathways', he: 'מסלולי הדופמין' },
    desc: { en: 'Four dopamine routes: movement (nigrostriatal), reward (mesolimbic), thinking (mesocortical) and hormones (tuberoinfundibular).', he: 'ארבעה מסלולי דופמין: תנועה (ניגרוסטריאטלי), תגמול (מזולימבי), חשיבה (מזוקורטיקלי) והורמונים (טוברואינפונדיבולרי).' },
    lessons: ['4.1', '8.4', '14.3', '16.1'],
    stages: [
      { regions: ['substantiaNigra', 'basalGanglia'], caption: { en: 'Nigrostriatal pathway: the substantia nigra sends dopamine to the basal ganglia to start and smooth movement. It degenerates in Parkinson\'s disease.', he: 'המסלול הניגרוסטריאטלי: החומר השחור שולח דופמין לגרעינים הבסיסיים כדי להתחיל ולהחליק תנועה. הוא מתנוון במחלת פרקינסון.' },
        paths: [[P('substantiaNigra', 'L'), P('basalGanglia', 'L', [0, 0.1, 0.3])], [P('substantiaNigra', 'R'), P('basalGanglia', 'R', [0, 0.1, 0.3])]] },
      { regions: ['vta', 'nucleusAccumbens', 'amygdala', 'hippocampus'], caption: { en: 'Mesolimbic pathway: the VTA releases dopamine in the nucleus accumbens — the core of reward, motivation and addiction.', he: 'המסלול המזולימבי: ה-VTA משחרר דופמין בגרעין האקומבנס — לב התגמול, המוטיבציה וההתמכרות.' },
        paths: [[P('vta'), P('nucleusAccumbens', 'L')], [P('vta'), P('nucleusAccumbens', 'R')], [P('vta'), P('amygdala', 'L')], [P('vta'), P('amygdala', 'R')]] },
      { regions: ['vta', 'frontal'], caption: { en: 'Mesocortical pathway: from the VTA to the prefrontal cortex — planning, attention and working memory. Linked to negative symptoms of schizophrenia.', he: 'המסלול המזוקורטיקלי: מה-VTA לקליפה הקדם-מצחית — תכנון, קשב וזיכרון עבודה. קשור לתסמינים השליליים בסכיזופרניה.' },
        paths: [[P('vta'), P('frontal', 'L', [0.2, -0.2, 0.6])], [P('vta'), P('frontal', 'R', [-0.2, -0.2, 0.6])]] },
      { regions: ['hypothalamus', 'pituitary'], caption: { en: 'Tuberoinfundibular pathway: hypothalamic dopamine controls the pituitary (it holds back prolactin release).', he: 'המסלול הטוברואינפונדיבולרי: דופמין מההיפותלמוס שולט בבלוטת יותרת המוח (מעכב הפרשת פרולקטין).' },
        paths: [[P('hypothalamus'), P('pituitary')]] },
    ],
  },
  {
    id: 'serotonin', group: 'transmitters', color: '#38bdf8', icon: '🌊',
    name: { en: 'Serotonin system', he: 'מערכת הסרוטונין' },
    desc: { en: 'The raphe nuclei in the brainstem spread serotonin almost everywhere — mood, sleep, appetite and pain.', he: 'גרעיני הרפה בגזע המוח מפיצים סרוטונין כמעט לכל מקום — מצב רוח, שינה, תיאבון וכאב.' },
    lessons: ['4.1', '16.2'],
    stages: [
      { regions: ['raphe'], caption: { en: 'Serotonin is made by the raphe nuclei along the midline of the brainstem.', he: 'סרוטונין מיוצר בגרעיני הרפה לאורך קו האמצע של גזע המוח.' }, paths: [[P('raphe', '', [0, -1, 0]), P('raphe', '', [0, 1, 0])]] },
      { regions: ['raphe', 'frontal', 'parietal', 'occipital', 'thalamus', 'hippocampus', 'amygdala', 'hypothalamus'], caption: { en: 'Ascending fibres reach the cortex, thalamus, hypothalamus and limbic system — mood, sleep and appetite. SSRIs boost this signal.', he: 'סיבים עולים מגיעים לקליפה, לתלמוס, להיפותלמוס ולמערכת הלימבית — מצב רוח, שינה ותיאבון. תרופות SSRI מגבירות אות זה.' },
        paths: fan('raphe', '', [['frontal', 'L', [0, 0.4, 0.5]], ['frontal', 'R', [0, 0.4, 0.5]], ['parietal', 'L'], ['occipital', 'R'], ['thalamus', 'L'], ['hippocampus', 'R'], ['amygdala', 'L'], ['hypothalamus']]) },
      { regions: ['raphe', 'cerebellum', 'spinalCord'], caption: { en: 'Descending fibres go to the cerebellum and down the spinal cord, where serotonin helps dampen pain.', he: 'סיבים יורדים מגיעים למוח הקטן ולחוט השדרה, שם הסרוטונין עוזר להחליש כאב.' },
        paths: [[P('raphe'), P('cerebellum', 'L')], [P('raphe'), P('cerebellum', 'R')], [P('raphe'), P('spinalCord', '', [0, -0.9, 0])]] },
    ],
  },
  {
    id: 'norepinephrine', group: 'transmitters', color: '#2563eb', icon: '🔔',
    name: { en: 'Norepinephrine system', he: 'מערכת הנוראפינפרין' },
    desc: { en: 'The locus coeruleus in the pons wakes up the whole brain when something important happens.', he: 'הלוקוס צרולאוס בגשר "מעיר" את כל המוח כשקורה משהו חשוב.' },
    lessons: ['4.1', '11.3', '16.3'],
    stages: [
      { regions: ['locusCoeruleus'], caption: { en: 'A surprise or threat activates the locus coeruleus ("blue spot") in the pons.', he: 'הפתעה או איום מפעילים את הלוקוס צרולאוס ("הנקודה הכחולה") בגשר.' }, paths: [[P('locusCoeruleus', 'L'), P('locusCoeruleus', 'R')]] },
      { regions: ['locusCoeruleus', 'frontal', 'parietal', 'temporal', 'occipital', 'thalamus', 'hippocampus', 'amygdala', 'cerebellum'], caption: { en: 'Norepinephrine spreads to the cortex, thalamus, limbic system and cerebellum, raising alertness and focus. It falls silent during REM sleep.', he: 'נוראפינפרין מתפשט לקליפה, לתלמוס, למערכת הלימבית ולמוח הקטן ומגביר ערנות וריכוז. הוא משתתק בשנת REM.' },
        paths: [...fan('locusCoeruleus', 'L', [['frontal', 'L', [0, 0.5, 0.4]], ['parietal', 'L'], ['temporal', 'L'], ['thalamus', 'L'], ['hippocampus', 'L'], ['cerebellum', 'L']]),
          ...fan('locusCoeruleus', 'R', [['frontal', 'R', [0, 0.5, 0.4]], ['occipital', 'R'], ['amygdala', 'R'], ['cerebellum', 'R']])] },
      { regions: ['locusCoeruleus', 'spinalCord'], caption: { en: 'Fibres down the spinal cord prepare the body for action.', he: 'סיבים במורד חוט השדרה מכינים את הגוף לפעולה.' }, paths: [[P('locusCoeruleus', 'L'), P('spinalCord', '', [0, -0.9, 0])]] },
    ],
  },
  {
    id: 'acetylcholine', group: 'transmitters', color: '#a855f7', icon: '🎯',
    name: { en: 'Acetylcholine system', he: 'מערכת האצטילכולין' },
    desc: { en: 'The basal forebrain sends acetylcholine to the cortex and hippocampus for attention and memory.', he: 'המוח הקדמי הבסיסי שולח אצטילכולין לקליפה ולהיפוקמפוס לקשב ולזיכרון.' },
    lessons: ['4.1', '5.4', '12.3'],
    stages: [
      { regions: ['basalForebrain', 'frontal', 'parietal', 'temporal', 'occipital'], caption: { en: 'The nucleus basalis sprays acetylcholine across the cortex, sharpening attention.', he: 'הגרעין הבסיסי מפזר אצטילכולין על פני הקליפה ומחדד את הקשב.' },
        paths: fan('basalForebrain', 'L', [['frontal', 'L', [0, 0.5, 0.5]], ['parietal', 'L'], ['temporal', 'L'], ['occipital', 'L']]).concat(fan('basalForebrain', 'R', [['frontal', 'R', [0, 0.5, 0.5]], ['parietal', 'R'], ['occipital', 'R']])) },
      { regions: ['basalForebrain', 'hippocampus'], caption: { en: 'Septal fibres reach the hippocampus to support forming memories. These neurons are lost early in Alzheimer\'s disease.', he: 'סיבים מהספטום מגיעים להיפוקמפוס ותומכים ביצירת זיכרונות. נוירונים אלה אובדים מוקדם במחלת אלצהיימר.' },
        paths: [[P('basalForebrain', 'L'), P('hippocampus', 'L')], [P('basalForebrain', 'R'), P('hippocampus', 'R')]] },
    ],
  },

  // ===================== Senses (stimulus scenarios) =====================
  {
    id: 'vision', group: 'senses', color: '#e0607e', icon: '👁️',
    name: { en: 'See a face: visual pathway', he: 'רואים פנים: מסלול הראייה' },
    stimulus: { en: 'Show a face', he: 'הצגת פנים' },
    desc: { en: 'Light → retina → optic chiasm → thalamus (LGN) → V1 → "what" and "where" streams.', he: 'אור ← רשתית ← מצטלבת הראייה ← תלמוס (LGN) ← V1 ← זרמי "מה" ו"איפה".' },
    lessons: ['6.2', '6.3'],
    stages: [
      { regions: ['opticChiasm'], caption: { en: 'Light hits the retinas. Signals leave each eye along the optic nerves and meet at the optic chiasm, where half the fibres cross.', he: 'אור פוגע ברשתיות. האותות יוצאים מכל עין בעצבי הראייה ונפגשים במצטלבת הראייה, שם מחצית מהסיבים חוצים.' },
        paths: [[{ v: 'eyeL' }, P('opticChiasm')], [{ v: 'eyeR' }, P('opticChiasm')]] },
      { regions: ['opticChiasm', 'thalamus'], caption: { en: 'From the chiasm the optic tracts reach the lateral geniculate nucleus (LGN) of each thalamus.', he: 'מהמצטלבת מגיעים מסלולי הראייה לגרעין הברכי הצידי (LGN) של כל תלמוס.' },
        paths: [[P('opticChiasm'), P('thalamus', 'L', [-0.4, -0.4, -0.5])], [P('opticChiasm'), P('thalamus', 'R', [0.4, -0.4, -0.5])]] },
      { regions: ['thalamus', 'occipital'], caption: { en: 'Optic radiations carry the signal back to the primary visual cortex (V1) in the occipital lobe: edges and orientations.', he: 'הקרינה האופטית מעבירה את האות לקליפת הראייה הראשונית (V1) באונה העורפית: קווים וכיוונים.' },
        paths: [[P('thalamus', 'L', [-0.4, -0.4, -0.5]), P('temporal', 'L', [0.3, 0.6, -0.6]), P('occipital', 'L', [0.3, 0, -0.3])], [P('thalamus', 'R', [0.4, -0.4, -0.5]), P('temporal', 'R', [-0.3, 0.6, -0.6]), P('occipital', 'R', [-0.3, 0, -0.3])]] },
      { regions: ['occipital', 'temporal'], caption: { en: 'Ventral "what" stream → temporal lobe (fusiform face area): "That is my friend\'s face!"', he: 'הזרם הגחוני "מה" ← האונה הרקתית (אזור הפנים הפוזיפורמי): "אלה הפנים של החבר שלי!"' },
        paths: [[P('occipital', 'L'), P('temporal', 'L', [0, -0.5, 0.3])], [P('occipital', 'R'), P('temporal', 'R', [0, -0.5, 0.3])]] },
      { regions: ['occipital', 'parietal', 'superiorColliculus'], caption: { en: 'Dorsal "where/how" stream → parietal lobe: where the face is and how to reach toward it. A side route to the superior colliculus turns the eyes.', he: 'הזרם הגבי "איפה/איך" ← האונה הקודקודית: היכן הפנים ואיך לפנות אליהן. מסלול צדדי לגבעון העליון מפנה את העיניים.' },
        paths: [[P('occipital', 'L'), P('parietal', 'L', [0, 0.3, 0])], [P('occipital', 'R'), P('parietal', 'R', [0, 0.3, 0])], [P('opticChiasm'), P('superiorColliculus', 'L')]] },
    ],
  },
  {
    id: 'hearing', group: 'senses', color: '#14b8a6', icon: '👂',
    name: { en: 'Hear a sound: auditory pathway', he: 'שומעים צליל: מסלול השמיעה' },
    stimulus: { en: 'Play a sound', he: 'השמעת צליל' },
    desc: { en: 'Cochlea → brainstem → inferior colliculus → thalamus (MGN) → auditory cortex.', he: 'שבלול ← גזע המוח ← גבעון תחתון ← תלמוס (MGN) ← קליפת השמע.' },
    lessons: ['7.1'],
    stages: [
      { regions: ['medulla'], caption: { en: 'Hair cells in each cochlea fire; the auditory nerve enters the brainstem (cochlear nuclei).', he: 'תאי השערה בכל שבלול יורים; עצב השמע נכנס לגזע המוח (גרעיני השבלול).' }, paths: [[{ v: 'earL' }, P('medulla', 'L', [0, 0.8, 0])], [{ v: 'earR' }, P('medulla', 'R', [0, 0.8, 0])]] },
      { regions: ['medulla', 'pons', 'inferiorColliculus'], caption: { en: 'Signals from both ears are compared (superior olive) to locate the sound, then rise to the inferior colliculi.', he: 'האותות משתי האוזניים מושווים (הזית העליון) לאיתור הצליל, ועולים לגבעונים התחתונים.' }, paths: [[P('medulla', 'L', [0, 0.8, 0]), P('pons', 'R'), P('inferiorColliculus', 'R')], [P('medulla', 'R', [0, 0.8, 0]), P('pons', 'L'), P('inferiorColliculus', 'L')]] },
      { regions: ['inferiorColliculus', 'thalamus'], caption: { en: 'Next stop: the medial geniculate nucleus (MGN) of the thalamus.', he: 'התחנה הבאה: הגרעין הברכי האמצעי (MGN) של התלמוס.' }, paths: [[P('inferiorColliculus', 'L'), P('thalamus', 'L', [-0.2, -0.4, -0.7])], [P('inferiorColliculus', 'R'), P('thalamus', 'R', [0.2, -0.4, -0.7])]] },
      { regions: ['thalamus', 'temporal', 'wernicke'], caption: { en: 'The primary auditory cortex in the temporal lobe analyses pitch (organised by frequency). Speech continues to Wernicke\'s area.', he: 'קליפת השמע הראשונית באונה הרקתית מנתחת גובה צליל (מאורגנת לפי תדירות). דיבור ממשיך לאזור ורניקה.' }, paths: [[P('thalamus', 'L', [-0.2, -0.4, -0.7]), P('temporal', 'L', [0.2, 0.9, 0.2])], [P('thalamus', 'R', [0.2, -0.4, -0.7]), P('temporal', 'R', [-0.2, 0.9, 0.2])], [P('temporal', 'L', [0.2, 0.9, 0.2]), P('wernicke', 'L')]] },
    ],
  },
  {
    id: 'touch', group: 'senses', color: '#e98f2e', icon: '✋',
    name: { en: 'Touch the right hand', he: 'מגע ביד ימין' },
    stimulus: { en: 'Touch hand', he: 'מגע ביד' },
    desc: { en: 'Skin receptors → spinal cord → medulla (crossing) → thalamus → left somatosensory cortex.', he: 'קולטני עור ← חוט השדרה ← המוח המוארך (הצטלבות) ← תלמוס ← הקליפה הסומטו-סנסורית השמאלית.' },
    lessons: ['7.2'],
    stages: [
      { regions: ['spinalCord'], caption: { en: 'Mechanoreceptors in the right hand fire. The signal enters the spinal cord through a dorsal root and rises on the same side.', he: 'קולטנים מכניים ביד ימין יורים. האות נכנס לחוט השדרה דרך שורש גבי ועולה באותו צד.' }, paths: [[{ v: 'handR' }, P('spinalCord', 'R', [0.4, -0.6, -0.3]), P('spinalCord', 'R', [0.3, 0.8, -0.3])]] },
      { regions: ['medulla'], caption: { en: 'In the medulla the pathway crosses to the left side — that is why each hemisphere feels the opposite side of the body.', he: 'במוח המוארך המסלול חוצה לצד שמאל — ולכן כל המיספרה חשה את הצד הנגדי של הגוף.' }, paths: [[P('spinalCord', 'R', [0.3, 0.8, -0.3]), P('medulla', 'R', [0.3, -0.5, -0.2]), P('medulla', 'L', [-0.3, 0.4, 0])]] },
      { regions: ['thalamus'], caption: { en: 'It rises through the brainstem to the thalamus (VPL nucleus).', he: 'הוא עולה דרך גזע המוח לתלמוס (גרעין VPL).' }, paths: [[P('medulla', 'L', [-0.3, 0.4, 0]), P('pons', 'L'), P('midbrain', 'L'), P('thalamus', 'L', [-0.3, -0.2, -0.2])]] },
      { regions: ['thalamus', 'somatosensory'], caption: { en: 'The left primary somatosensory cortex (hand area) registers the touch — where and what it feels like.', he: 'הקליפה הסומטו-סנסורית הראשונית השמאלית (אזור היד) רושמת את המגע — היכן ואיך הוא מרגיש.' }, paths: [[P('thalamus', 'L', [-0.3, -0.2, -0.2]), P('somatosensory', 'L', [-0.4, 0.2, 0])]] },
    ],
  },
  {
    id: 'pain', group: 'senses', color: '#ef4444', icon: '🔥',
    name: { en: 'Touch a hot stove: pain & reflex', he: 'נוגעים בכיריים חמות: כאב ורפלקס' },
    stimulus: { en: 'Touch hot stove', he: 'מגע בכיריים חמות' },
    desc: { en: 'Withdrawal reflex in the spinal cord, pain to the cortex, and the brain\'s own pain control.', he: 'רפלקס נסיגה בחוט השדרה, כאב לקליפה ושליטת המוח בכאב.' },
    lessons: ['7.3', '8.2'],
    stages: [
      { regions: ['spinalCord'], caption: { en: 'Nociceptors fire. Before the brain even knows, a spinal reflex pulls the hand away (withdrawal reflex).', he: 'נוסיצפטורים יורים. עוד לפני שהמוח יודע, רפלקס שדרתי מושך את היד (רפלקס נסיגה).' }, paths: [[{ v: 'handR' }, P('spinalCord', 'R', [0.4, -0.6, -0.3])], [P('spinalCord', 'R', [0.4, -0.6, -0.3]), P('spinalCord', 'R', [0.4, -0.5, 0.4]), { v: 'handR' }]] },
      { regions: ['spinalCord', 'thalamus', 'somatosensory', 'cingulate', 'insula'], caption: { en: 'Pain signals cross in the spinal cord and rise to the thalamus → somatosensory cortex (where, how strong) and cingulate & insula (how unpleasant).', he: 'אותות כאב חוצים בחוט השדרה ועולים לתלמוס ← קליפה סומטו-סנסורית (איפה, כמה חזק) וחגורה ואינסולה (כמה לא נעים).' },
        paths: [[P('spinalCord', 'L', [-0.3, -0.6, 0]), P('medulla', 'L'), P('pons', 'L'), P('thalamus', 'L')], [P('thalamus', 'L'), P('somatosensory', 'L', [-0.4, 0.2, 0])], [P('thalamus', 'L'), P('cingulate', 'L')], [P('thalamus', 'L'), P('insula', 'L')]] },
      { regions: ['pag', 'raphe', 'spinalCord'], caption: { en: 'The periaqueductal gray (PAG) releases endorphins and sends signals down the spinal cord that close the pain "gate".', he: 'החומר האפור סביב אמת המים (PAG) משחרר אנדורפינים ושולח אותות במורד חוט השדרה שסוגרים את "שער" הכאב.' }, paths: [[P('pag'), P('raphe'), P('spinalCord', '', [0, -0.6, 0])]], color: '#3cb37a' },
    ],
  },
  {
    id: 'smell', group: 'senses', color: '#a78bfa', icon: '☕',
    name: { en: 'Smell coffee: olfactory pathway', he: 'מריחים קפה: מסלול הריח' },
    stimulus: { en: 'Smell coffee', he: 'ריח קפה' },
    desc: { en: 'Nose → olfactory bulb → amygdala & piriform cortex — without passing the thalamus.', he: 'אף ← פקעת הריח ← אמיגדלה וקליפה פיריפורמית — בלי לעבור בתלמוס.' },
    lessons: ['7.4'],
    stages: [
      { regions: ['olfactoryBulb'], caption: { en: 'Odour molecules bind receptors in the nose; signals pass straight to the olfactory bulbs.', he: 'מולקולות ריח נקשרות לקולטנים באף; האותות עוברים ישירות לפקעות הריח.' }, paths: [[{ v: 'nose' }, P('olfactoryBulb', 'L')], [{ v: 'nose' }, P('olfactoryBulb', 'R')]] },
      { regions: ['olfactoryBulb', 'amygdala', 'temporal', 'hippocampus'], caption: { en: 'Smell is the only sense that skips the thalamus: it goes directly to the amygdala and piriform cortex — and from there to memory. That is why a smell can bring back a memory instantly.', he: 'הריח הוא החוש היחיד שמדלג על התלמוס: הוא מגיע ישירות לאמיגדלה ולקליפה הפיריפורמית — ומשם לזיכרון. לכן ריח יכול להחזיר זיכרון ברגע.' },
        paths: [[P('olfactoryBulb', 'L'), P('amygdala', 'L')], [P('olfactoryBulb', 'R'), P('amygdala', 'R')], [P('amygdala', 'L'), P('hippocampus', 'L')], [P('olfactoryBulb', 'L'), P('frontal', 'L', [0, -0.8, 0.3])]] },
    ],
  },
  {
    id: 'reward', group: 'senses', color: '#10b981', icon: '🍫',
    name: { en: 'Eat chocolate: reward circuit', he: 'אוכלים שוקולד: מעגל התגמול' },
    stimulus: { en: 'Taste chocolate', he: 'טעימת שוקולד' },
    desc: { en: 'Taste → insula, then the dopamine reward circuit learns "I want that again".', he: 'טעם ← אינסולה, ואז מעגל התגמול של הדופמין לומד "אני רוצה את זה שוב".' },
    lessons: ['7.4', '14.3', '4.3'],
    stages: [
      { regions: ['medulla', 'thalamus', 'insula'], caption: { en: 'Taste buds signal sweetness: medulla → thalamus → gustatory cortex in the insula.', he: 'בלוטות הטעם מאותתות על מתיקות: מוח מוארך ← תלמוס ← קליפת הטעם באינסולה.' }, paths: [[{ v: 'tongue' }, P('medulla', 'L'), P('thalamus', 'L'), P('insula', 'L')]] },
      { regions: ['vta', 'nucleusAccumbens'], caption: { en: 'It is better than expected — VTA dopamine neurons fire (reward prediction error) and flood the nucleus accumbens.', he: 'זה טוב מהצפוי — נוירוני הדופמין ב-VTA יורים (שגיאת ניבוי תגמול) ומציפים את גרעין האקומבנס.' }, paths: [[P('vta'), P('nucleusAccumbens', 'L')], [P('vta'), P('nucleusAccumbens', 'R')]] },
      { regions: ['nucleusAccumbens', 'frontal'], caption: { en: 'The orbitofrontal / prefrontal cortex stores the value: next time you will "want" chocolate.', he: 'הקליפה האורביטו-פרונטלית / הקדם-מצחית שומרת את הערך: בפעם הבאה "תרצו" שוקולד.' }, paths: [[P('vta'), P('frontal', 'L', [0, -0.6, 0.6])], [P('nucleusAccumbens', 'L'), P('frontal', 'L', [0, -0.6, 0.6])]] },
    ],
  },
  {
    id: 'fear', group: 'senses', color: '#dc2626', icon: '🐍',
    name: { en: 'See a snake: fear circuit', he: 'רואים נחש: מעגל הפחד' },
    stimulus: { en: 'Show a snake', he: 'הצגת נחש' },
    desc: { en: 'The fast "low road" and slower "high road" to the amygdala, then the body\'s alarm response.', he: 'ה"דרך הנמוכה" המהירה וה"דרך הגבוהה" האיטית לאמיגדלה, ואז תגובת האזעקה של הגוף.' },
    lessons: ['12.2', '14.2', '14.4'],
    stages: [
      { regions: ['thalamus'], caption: { en: 'The image reaches the thalamus.', he: 'התמונה מגיעה לתלמוס.' }, paths: [[{ v: 'eyeL' }, P('opticChiasm'), P('thalamus', 'L')], [{ v: 'eyeR' }, P('opticChiasm'), P('thalamus', 'R')]] },
      { regions: ['thalamus', 'amygdala'], caption: { en: 'Low road: a quick, rough signal goes straight to the amygdala — you jump before you know why.', he: 'הדרך הנמוכה: אות מהיר וגס עובר ישירות לאמיגדלה — אתם קופצים לפני שאתם יודעים למה.' }, paths: [[P('thalamus', 'L'), P('amygdala', 'L')], [P('thalamus', 'R'), P('amygdala', 'R')]] },
      { regions: ['thalamus', 'occipital', 'frontal', 'amygdala'], caption: { en: 'High road: the cortex analyses the details ("is it a stick or a snake?") and updates the amygdala; the prefrontal cortex can calm it down.', he: 'הדרך הגבוהה: הקליפה מנתחת את הפרטים ("זה מקל או נחש?") ומעדכנת את האמיגדלה; הקליפה הקדם-מצחית יכולה להרגיע אותה.' }, paths: [[P('thalamus', 'L'), P('occipital', 'L'), P('temporal', 'L'), P('amygdala', 'L')], [P('frontal', 'L', [0, -0.6, 0.4]), P('amygdala', 'L')]] },
      { regions: ['amygdala', 'hypothalamus', 'pag', 'pituitary'], caption: { en: 'The amygdala triggers the hypothalamus (heart racing, stress hormones) and the PAG (freezing).', he: 'האמיגדלה מפעילה את ההיפותלמוס (לב דוהר, הורמוני לחץ) ואת ה-PAG (קיפאון).' }, paths: [[P('amygdala', 'L'), P('hypothalamus')], [P('amygdala', 'R'), P('hypothalamus')], [P('hypothalamus'), P('pag')], [P('hypothalamus'), P('pituitary')]] },
    ],
  },

  // ===================== Movement, memory & emotion =====================
  {
    id: 'motor', group: 'action', color: '#2f55c9', icon: '🦵',
    name: { en: 'Move the right hand: corticospinal tract', he: 'מזיזים את יד ימין: המסלול הקורטיקו-ספינלי' },
    stimulus: { en: 'Decide to move', he: 'החלטה לזוז' },
    desc: { en: 'Planning in frontal cortex → left motor cortex → crossing in the medulla → spinal motor neurons → muscles.', he: 'תכנון בקליפה המצחית ← קליפה מוטורית שמאלית ← הצטלבות במוח המוארך ← נוירונים מוטוריים בחוט השדרה ← שרירים.' },
    lessons: ['8.3'],
    stages: [
      { regions: ['frontal', 'motor', 'basalGanglia', 'cerebellum'], caption: { en: 'Premotor and supplementary motor areas plan the movement; the basal ganglia help select it and the cerebellum prepares its timing.', he: 'האזורים הקדם-מוטוריים והמשלימים מתכננים את התנועה; הגרעינים הבסיסיים עוזרים לבחור בה והמוח הקטן מכין את התזמון.' }, paths: [[P('frontal', 'L', [-0.3, 0.5, -0.4]), P('motor', 'L', [-0.3, 0.3, 0])], [P('basalGanglia', 'L'), P('thalamus', 'L'), P('motor', 'L', [-0.3, 0.3, 0])]] },
      { regions: ['motor', 'midbrain', 'pons', 'medulla'], caption: { en: 'The left primary motor cortex sends commands down the corticospinal tract through the internal capsule and brainstem.', he: 'הקליפה המוטורית הראשונית השמאלית שולחת פקודות במסלול הקורטיקו-ספינלי דרך הקופסית הפנימית וגזע המוח.' }, paths: [[P('motor', 'L', [-0.3, 0.3, 0]), P('thalamus', 'L', [-0.6, 0, 0]), P('midbrain', 'L', [0, 0, 0.4]), P('pons', 'L', [0, 0, 0.5]), P('medulla', 'L', [0, 0.4, 0.4])]] },
      { regions: ['medulla', 'spinalCord'], caption: { en: 'In the medulla (the pyramids) most fibres cross to the right side, then descend in the spinal cord.', he: 'במוח המוארך (הפירמידות) רוב הסיבים חוצים לצד ימין, ואז יורדים בחוט השדרה.' }, paths: [[P('medulla', 'L', [0, 0.4, 0.4]), P('medulla', 'R', [0, -0.6, 0.2]), P('spinalCord', 'R', [0.3, -0.5, 0])]] },
      { regions: ['spinalCord'], caption: { en: 'Alpha motor neurons release acetylcholine at the muscles — the right hand moves.', he: 'נוירונים מוטוריים אלפא משחררים אצטילכולין בשרירים — יד ימין זזה.' }, paths: [[P('spinalCord', 'R', [0.3, -0.5, 0]), { v: 'handR' }]] },
    ],
  },
  {
    id: 'memory', group: 'action', color: '#facc15', icon: '🧠',
    name: { en: 'Memory circuit (Papez)', he: 'מעגל הזיכרון (פפז)' },
    desc: { en: 'Hippocampus → fornix → mammillary bodies → thalamus → cingulate → back to the hippocampus.', he: 'היפוקמפוס ← פורניקס ← גופים פטמתיים ← תלמוס ← חגורה ← חזרה להיפוקמפוס.' },
    lessons: ['12.3', '2.4'],
    stages: [
      { regions: ['hippocampus', 'fornix', 'hypothalamus'], caption: { en: 'A new experience is bound together in the hippocampus and sent along the fornix to the mammillary bodies.', he: 'חוויה חדשה "נקשרת" בהיפוקמפוס ונשלחת לאורך הפורניקס אל הגופים הפטמתיים.' }, paths: [[P('hippocampus', 'L', [0, 0, -0.6]), P('fornix', 'L', [0, 0.5, -0.3]), P('fornix', 'L', [0, 0.3, 0.6]), P('hypothalamus', 'L', [0, -0.2, -0.4])]] },
      { regions: ['hypothalamus', 'thalamus', 'cingulate'], caption: { en: 'From the mammillary bodies to the anterior thalamus, then up to the cingulate cortex. (Damage here — e.g. Korsakoff\'s syndrome — causes amnesia.)', he: 'מהגופים הפטמתיים לתלמוס הקדמי, ואז למעלה לקליפת החגורה. (פגיעה כאן — למשל תסמונת קורסקוף — גורמת לאמנזיה.)' }, paths: [[P('hypothalamus', 'L', [0, -0.2, -0.4]), P('thalamus', 'L', [0, 0.3, 0.6]), P('cingulate', 'L', [0, 0.3, 0.2])]] },
      { regions: ['cingulate', 'temporal', 'hippocampus'], caption: { en: 'The cingulate returns the loop through the parahippocampal cortex to the hippocampus. Over time memories are consolidated into the cortex.', he: 'החגורה סוגרת את המעגל דרך הקליפה הפרה-היפוקמפלית בחזרה להיפוקמפוס. עם הזמן הזיכרונות מתקבעים בקליפה.' }, paths: [[P('cingulate', 'L', [0, 0.3, 0.2]), P('cingulate', 'L', [0, 0, -0.8]), P('temporal', 'L', [0.5, -0.3, -0.3]), P('hippocampus', 'L', [0, 0, -0.6])]] },
    ],
  },
  {
    id: 'language', group: 'action', color: '#8b5cf6', icon: '💬',
    name: { en: 'Repeat a word: language circuit', he: 'חוזרים על מילה: מעגל השפה' },
    stimulus: { en: 'Say a word', he: 'אמירת מילה' },
    desc: { en: 'The Wernicke–Geschwind model: hearing → Wernicke\'s area → arcuate fasciculus → Broca\'s area → motor cortex.', he: 'מודל ורניקה-גשווינד: שמיעה ← אזור ורניקה ← האלומה הקשתית ← אזור ברוקה ← קליפה מוטורית.' },
    lessons: ['13.3'],
    stages: [
      { regions: ['temporal'], caption: { en: 'You hear a word: auditory cortex in the left temporal lobe.', he: 'שומעים מילה: קליפת השמע באונה הרקתית השמאלית.' }, paths: [[{ v: 'earL' }, P('temporal', 'L', [0.2, 0.9, 0.2])]] },
      { regions: ['wernicke'], caption: { en: 'Wernicke\'s area finds the word\'s meaning.', he: 'אזור ורניקה מוצא את משמעות המילה.' }, paths: [[P('temporal', 'L', [0.2, 0.9, 0.2]), P('wernicke', 'L')]] },
      { regions: ['wernicke', 'parietal', 'broca'], caption: { en: 'The arcuate fasciculus carries it forward to Broca\'s area, which plans the speech sounds.', he: 'האלומה הקשתית מעבירה אותה קדימה לאזור ברוקה, שמתכנן את צלילי הדיבור.' }, paths: [[P('wernicke', 'L'), P('parietal', 'L', [-0.6, -0.6, 0.4]), P('broca', 'L')]] },
      { regions: ['broca', 'motor'], caption: { en: 'The face area of the motor cortex moves the lips, tongue and larynx — you say the word.', he: 'אזור הפנים בקליפה המוטורית מזיז את השפתיים, הלשון והגרון — ואתם אומרים את המילה.' }, paths: [[P('broca', 'L'), P('motor', 'L', [-0.5, -0.6, 0])]] },
    ],
  },
  {
    id: 'stress', group: 'action', color: '#f97316', icon: '⏱️',
    name: { en: 'Stress: the HPA axis', he: 'לחץ: ציר ה-HPA' },
    stimulus: { en: 'Exam tomorrow!', he: 'מבחן מחר!' },
    desc: { en: 'Hypothalamus (CRH) → pituitary (ACTH) → adrenal cortex (cortisol) → feedback to the brain.', he: 'היפותלמוס (CRH) ← יותרת המוח (ACTH) ← קליפת יותרת הכליה (קורטיזול) ← משוב למוח.' },
    lessons: ['14.4'],
    stages: [
      { regions: ['amygdala', 'hypothalamus'], caption: { en: 'A stressor activates the amygdala, which drives the hypothalamus to release CRH.', he: 'גורם לחץ מפעיל את האמיגדלה, שמניעה את ההיפותלמוס להפריש CRH.' }, paths: [[P('amygdala', 'L'), P('hypothalamus')], [P('amygdala', 'R'), P('hypothalamus')]] },
      { regions: ['hypothalamus', 'pituitary'], caption: { en: 'CRH reaches the pituitary, which releases ACTH into the blood.', he: 'CRH מגיע לבלוטת יותרת המוח, שמשחררת ACTH לדם.' }, paths: [[P('hypothalamus'), P('pituitary')]] },
      { regions: ['pituitary'], caption: { en: 'ACTH travels in the blood to the adrenal glands, which release cortisol.', he: 'ACTH עובר בדם לבלוטות יותרת הכליה, שמשחררות קורטיזול.' }, paths: [[P('pituitary'), { v: 'adrenal' }]] },
      { regions: ['hippocampus', 'hypothalamus'], caption: { en: 'Cortisol returns to the brain: the hippocampus and hypothalamus detect it and switch the response off (negative feedback). Chronic stress can damage the hippocampus.', he: 'קורטיזול חוזר למוח: ההיפוקמפוס וההיפותלמוס מזהים אותו ומכבים את התגובה (משוב שלילי). לחץ כרוני עלול לפגוע בהיפוקמפוס.' }, paths: [[{ v: 'adrenal' }, P('spinalCord', '', [0, 0, 0.8]), P('hippocampus', 'L')], [{ v: 'adrenal' }, P('hypothalamus')]], color: '#3cb37a' },
    ],
  },
];

export const pathwayById = Object.fromEntries(PATHWAYS.map((p) => [p.id, p]));
