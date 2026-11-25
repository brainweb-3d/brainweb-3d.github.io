// The chemical messengers behind every pathway and effect, in one place.
// Used by the "Neurotransmitters involved" card in Explore (src/explore/chemCard.js) and by the molecule scene
// (names and colours of the transmitters there come from MESSENGERS).
//
// MESSENGERS: id → { kind: 'nt' (neurotransmitter / neuromodulator) | 'hormone', name, color, short, molecule? }
//   `molecule` = the part id in the molecule scene "molecule/transmitters" (for "See the molecule").
// A list item: [messengerId, role, note]  role ∈ ROLES. The note says what the messenger does HERE (EN + HE);
// the card shows it first and the general sentence (MESSENGERS.short) after. tools/check-chemistry.mjs checks it.
// PATHWAY_CHEM[pathwayId] = { list, steps }: `steps[i]` = the messengers active in step i (lit up on the card).
// EFFECT_CHEM[effectId] = list. A pathway or effect without an entry shows no card.
// Book: Freberg, Discovering Biological Psychology, ch. 4 (transmitters, drug actions), 6–7 (photoreceptors and hair
// cells release glutamate; substance P and pain), 9 (ghrelin, NPY, AgRP, orexins, ADH), 14 (stress hormones).
const B = (en, he) => ({ en, he });

export const MESSENGERS = {
  // ---- neurotransmitters and neuromodulators
  glutamate: { kind: 'nt', molecule: 'glutamate', color: '#ef4444', name: B('Glutamate', 'גלוטמט'), short: B('The main excitatory transmitter: it carries most fast signals between neurons.', 'המוליך המעורר העיקרי: נושא את רוב האותות המהירים בין נוירונים.') },
  gaba: { kind: 'nt', molecule: 'gaba', color: '#3b82f6', name: B('GABA', 'GABA'), short: B('The main inhibitory transmitter: it makes neurons less likely to fire.', 'המוליך המעכב העיקרי: מקטין את הסיכוי שנוירונים יירו.') },
  glycine: { kind: 'nt', molecule: 'glycine', color: '#60a5fa', name: B('Glycine', 'גליצין'), short: B('An inhibitory transmitter, especially in the spinal cord.', 'מוליך מעכב, במיוחד בחוט השדרה.') },
  acetylcholine: { kind: 'nt', molecule: 'acetylcholine', color: '#ec4899', name: B('Acetylcholine (ACh)', 'אצטילכולין (ACh)'), short: B('Makes muscles contract; in the brain it supports attention and memory.', 'גורם לשרירים להתכווץ; במוח תומך בקשב ובזיכרון.') },
  dopamine: { kind: 'nt', molecule: 'dopamine', color: '#f59e0b', name: B('Dopamine', 'דופמין'), short: B('Movement, reward and motivation.', 'תנועה, תגמול ומוטיבציה.') },
  norepinephrine: { kind: 'nt', molecule: 'norepinephrine', color: '#fb923c', name: B('Norepinephrine', 'נוראפינפרין'), short: B('Arousal and vigilance, from the locus coeruleus; also the sympathetic nerves\' transmitter.', 'עוררות ודריכות, מהלוקוס צרולאוס; גם המוליך של העצבים הסימפתטיים.') },
  serotonin: { kind: 'nt', molecule: 'serotonin', color: '#8b5cf6', name: B('Serotonin (5-HT)', 'סרוטונין (5-HT)'), short: B('Mood, sleep, appetite and pain control, from the raphe nuclei.', 'מצב רוח, שינה, תיאבון ובקרת כאב, מגרעיני הרפה.') },
  histamine: { kind: 'nt', molecule: 'histamine', color: '#14b8a6', name: B('Histamine', 'היסטמין'), short: B('Promotes wakefulness.', 'מקדם ערות.') },
  adenosine: { kind: 'nt', molecule: 'adenosine', color: '#64748b', name: B('Adenosine', 'אדנוזין'), short: B('A neuromodulator that builds up while we are awake and makes us sleepy.', 'נוירומודולטור שמצטבר בזמן הערות וגורם לישנוניות.') },
  endorphins: { kind: 'nt', color: '#c084fc', name: B('Endorphins', 'אנדורפינים'), short: B('The body\'s own opioids ("endogenous morphines"): they dampen pain.', 'האופיואידים של הגוף עצמו ("מורפינים פנימיים"): מחלישים כאב.') },
  substanceP: { kind: 'nt', color: '#f43f5e', name: B('Substance P', 'חומר P'), short: B('A neuropeptide released by pain fibres, together with glutamate.', 'נוירופפטיד שמשחררים סיבי כאב, יחד עם גלוטמט.') },
  npy: { kind: 'nt', color: '#84cc16', name: B('NPY and AgRP', 'NPY ו-AgRP'), short: B('Neuropeptides of the hypothalamus that start eating.', 'נוירופפטידים בהיפותלמוס שמתחילים אכילה.') },
  // ---- hormones (carried by the blood; shown in their own section)
  crh: { kind: 'hormone', color: '#f97316', name: B('CRH', 'CRH'), short: B('From the hypothalamus: tells the pituitary to release ACTH.', 'מההיפותלמוס: אומר לבלוטת יותרת המוח לשחרר ACTH.') },
  acth: { kind: 'hormone', color: '#fdba74', name: B('ACTH', 'ACTH'), short: B('From the pituitary: tells the adrenal cortex to release cortisol.', 'מבלוטת יותרת המוח: אומר לקליפת יותרת הכליה לשחרר קורטיזול.') },
  cortisol: { kind: 'hormone', color: '#eab308', name: B('Cortisol', 'קורטיזול'), short: B('The stress hormone from the adrenal cortex: it mobilises energy.', 'הורמון הלחץ מקליפת יותרת הכליה: מגייס אנרגיה.') },
  epinephrine: { kind: 'hormone', color: '#fb7185', name: B('Epinephrine (adrenaline)', 'אפינפרין (אדרנלין)'), short: B('From the adrenal medulla: heart races, energy rises.', 'מליבת יותרת הכליה: הלב דוהר, האנרגיה עולה.') },
  adh: { kind: 'hormone', color: '#38bdf8', name: B('ADH (vasopressin)', 'ADH (וזופרסין)'), short: B('From the posterior pituitary: the kidneys keep more water.', 'מהאונה האחורית של יותרת המוח: הכליות שומרות יותר מים.') },
  ghrelin: { kind: 'hormone', color: '#a3e635', name: B('Ghrelin', 'גרלין'), short: B('From the stomach: signals hunger to the hypothalamus.', 'מהקיבה: מאותת רעב להיפותלמוס.') },
  melatonin: { kind: 'hormone', color: '#a78bfa', name: B('Melatonin', 'מלטונין'), short: B('From the pineal gland at night: tells the body it is time to sleep.', 'מבלוטת האצטרובל בלילה: אומר לגוף שהגיע זמן לישון.') },
};

/** What happens to a messenger in a pathway or effect. */
export const ROLES = {
  active: { icon: '⚡', name: B('carries the signal', 'נושא את האות') },
  up: { icon: '↑', name: B('more', 'יותר') },
  down: { icon: '↓', name: B('less', 'פחות') },
  blocked: { icon: '⛔', name: B('blocked', 'חסום') },
  mimic: { icon: '🔑', name: B('copied', 'מחקים אותו') },
};

const N = (en, he) => B(en, he);

// ---------------------------------------------------------------- pathways (src/brain/pathways.js)
// Every item has a note: what this messenger does in THIS pathway (the card shows it first, the general fact after).
const GLU_RELAY = (en, he) => ['glutamate', 'active', N(en, he)];
export const PATHWAY_CHEM = {
  dopamine: {
    list: [['dopamine', 'active', N('The messenger of all four routes: movement in the striatum, reward in the nucleus accumbens, planning in the prefrontal cortex, and holding back prolactin at the pituitary.', 'השליח של כל ארבעת המסלולים: תנועה בסטריאטום, תגמול בגרעין האקומבנס, תכנון בקליפה הקדם-מצחית, ועיכוב הפרולקטין ביותרת המוח.')]],
    steps: [['dopamine'], ['dopamine'], ['dopamine'], ['dopamine']],
  },
  serotonin: {
    list: [['serotonin', 'active', N('Raphe neurons release it upward into the forebrain (mood, sleep, appetite) and downward into the spinal cord (dampening pain).', 'נוירוני הרפה משחררים אותו כלפי מעלה אל המוח הקדמי (מצב רוח, שינה, תיאבון) וכלפי מטה אל חוט השדרה (החלשת כאב).')]],
    steps: [['serotonin'], ['serotonin'], ['serotonin']],
  },
  norepinephrine: {
    list: [['norepinephrine', 'active', N('Locus coeruleus neurons fire at a surprise or threat and release it all over the brain, raising alertness; they fall silent in REM sleep.', 'נוירוני הלוקוס צרולאוס יורים בהפתעה או באיום ומשחררים אותו בכל המוח, ומעלים ערנות; הם משתתקים בשנת REM.')]],
    steps: [['norepinephrine'], ['norepinephrine'], ['norepinephrine']],
  },
  acetylcholine: {
    list: [['acetylcholine', 'active', N('Basal forebrain neurons release it in the cortex to sharpen attention, and in the hippocampus to help store new memories.', 'נוירוני המוח הקדמי הבסיסי משחררים אותו בקליפה כדי לחדד קשב, ובהיפוקמפוס כדי לעזור לאחסן זיכרונות חדשים.')]],
    steps: [['acetylcholine'], ['acetylcholine']],
  },
  vision: {
    list: [GLU_RELAY('Photoreceptors release it onto the next retinal cells, and every relay after that (the LGN in the thalamus, then V1) passes the image on with it.', 'קולטני האור משחררים אותו על התאים הבאים ברשתית, וכל תחנת ממסר אחר כך (ה-LGN בתלמוס, ואז V1) מעבירה את התמונה הלאה איתו.')],
    steps: [['glutamate'], ['glutamate'], ['glutamate'], ['glutamate'], ['glutamate']],
  },
  hearing: {
    list: [GLU_RELAY('Most hair cells release it onto the auditory nerve, and each relay up to the auditory cortex passes the sound on with it.', 'רוב תאי השערה משחררים אותו על עצב השמיעה, וכל תחנת ממסר עד קליפת השמע מעבירה את הצליל הלאה איתו.')],
    steps: [['glutamate'], ['glutamate'], ['glutamate'], ['glutamate']],
  },
  touch: {
    list: [GLU_RELAY('The touch neurons release it at their first relay in the medulla, and each relay up to the somatosensory cortex passes the signal on with it.', 'נוירוני המגע משחררים אותו בתחנת הממסר הראשונה בגזע המוח (המדולה), וכל תחנה עד קליפת התחושה מעבירה את האות הלאה איתו.')],
    steps: [['glutamate'], ['glutamate'], ['glutamate'], ['glutamate']],
  },
  pain: {
    list: [GLU_RELAY('Pain fibres release it in the spinal cord to start the reflex and send the pain signal up to the brain.', 'סיבי הכאב משחררים אותו בחוט השדרה כדי להפעיל את הרפלקס ולשלוח את אות הכאב למעלה למוח.'),
      ['substanceP', 'active', N('Pain fibres release it together with glutamate in the spinal cord, strengthening the pain signal.', 'סיבי הכאב משחררים אותו יחד עם גלוטמט בחוט השדרה, ומחזקים את אות הכאב.')],
      ['endorphins', 'active', N('The periaqueductal gray (PAG) sets off their release: the brain\'s own painkillers close the pain "gate" in the spinal cord.', 'החומר האפור סביב אמת המים (PAG) מפעיל את שחרורם: משככי הכאבים של המוח עצמו סוגרים את "שער" הכאב בחוט השדרה.')],
      ['serotonin', 'active', N('Fibres running down from the brainstem release it in the spinal cord, helping dampen pain.', 'סיבים שיורדים מגזע המוח משחררים אותו בחוט השדרה ועוזרים להחליש כאב.')]],
    steps: [['glutamate', 'substanceP'], ['glutamate', 'substanceP'], ['endorphins', 'serotonin']],
  },
  smell: {
    list: [GLU_RELAY('Smell receptor neurons release it onto the olfactory bulb, which passes the smell straight on to the amygdala and piriform cortex.', 'נוירוני קולטני הריח משחררים אותו על פקעת הריח, שמעבירה את הריח ישר לאמיגדלה ולקליפה הפירפורמית.')],
    steps: [['glutamate'], ['glutamate']],
  },
  reward: {
    list: [GLU_RELAY('Carries the sweet taste from the tongue through the brainstem and thalamus to the taste cortex in the insula.', 'נושא את הטעם המתוק מהלשון דרך גזע המוח והתלמוס אל קליפת הטעם באינסולה.'),
      ['dopamine', 'active', N('Better than expected: VTA neurons release a burst of it in the nucleus accumbens, teaching "I want that again".', 'טוב מהצפוי: נוירוני ה-VTA משחררים פרץ שלו בגרעין האקומבנס, ומלמדים "אני רוצה את זה שוב".')]],
    steps: [['glutamate'], ['dopamine'], ['dopamine']],
  },
  fear: {
    list: [GLU_RELAY('Carries the image from the thalamus to the amygdala, both on the fast "low road" and through the cortex on the slow "high road".', 'נושא את התמונה מהתלמוס לאמיגדלה, גם ב"דרך הנמוכה" המהירה וגם דרך הקליפה ב"דרך הגבוהה" האיטית.'),
      ['norepinephrine', 'active', N('The amygdala drives the locus coeruleus and the sympathetic nerves: alertness rises and the heart speeds up.', 'האמיגדלה מפעילה את הלוקוס צרולאוס ואת העצבים הסימפתטיים: הערנות עולה והלב מאיץ.')],
      ['crh', 'active', N('The hypothalamus releases it to start the stress hormone chain.', 'ההיפותלמוס משחרר אותו כדי להתחיל את שרשרת הורמוני הלחץ.')],
      ['epinephrine', 'active', N('The adrenal medulla releases it into the blood: the heart races and energy rises.', 'ליבת יותרת הכליה משחררת אותו לדם: הלב דוהר והאנרגיה עולה.')],
      ['cortisol', 'active', N('The adrenal cortex releases it a little later, freeing energy for the emergency.', 'קליפת יותרת הכליה משחררת אותו קצת אחר כך, ומשחררת אנרגיה למצב החירום.')]],
    steps: [['glutamate'], ['glutamate'], ['glutamate'], ['norepinephrine', 'crh', 'epinephrine', 'cortisol']],
  },
  motor: {
    list: [['dopamine', 'active', N('In the basal ganglia it helps select the movement and get it started (missing in Parkinson\'s).', 'בגרעיני הבסיס הוא עוזר לבחור את התנועה ולהתחיל אותה (חסר בפרקינסון).')],
      GLU_RELAY('The motor cortex sends its commands down the spinal cord with it, to the motor neurons.', 'קליפת התנועה שולחת איתו את הפקודות במורד חוט השדרה, אל נוירוני התנועה.'),
      ['acetylcholine', 'active', N('Motor neurons release it at the neuromuscular junction, and the muscle contracts.', 'נוירוני התנועה משחררים אותו בצומת העצב-שריר, והשריר מתכווץ.')]],
    steps: [['dopamine'], ['glutamate'], ['glutamate'], ['acetylcholine']],
  },
  memory: {
    list: [GLU_RELAY('In the hippocampus, glutamate at NMDA receptors strengthens the synapses that store the new memory (LTP).', 'בהיפוקמפוס, גלוטמט בקולטני NMDA מחזק את הסינפסות ששומרות את הזיכרון החדש (LTP).'),
      ['acetylcholine', 'active', N('From the basal forebrain it helps the hippocampus form new memories; these neurons are lost early in Alzheimer\'s.', 'מהמוח הקדמי הבסיסי הוא עוזר להיפוקמפוס ליצור זיכרונות חדשים; הנוירונים האלה אובדים מוקדם באלצהיימר.')]],
    steps: [['glutamate', 'acetylcholine'], ['glutamate'], ['glutamate']],
  },
  language: {
    list: [GLU_RELAY('Each step of the route (auditory cortex, Wernicke\'s area, the arcuate fasciculus, Broca\'s area, motor cortex) passes the word on with it.', 'כל שלב במסלול (קליפת השמע, אזור ורניקה, הצרור הקשתי, אזור ברוקה, קליפת התנועה) מעביר את המילה הלאה איתו.')],
    steps: [['glutamate'], ['glutamate'], ['glutamate'], ['glutamate']],
  },
  stress: {
    list: [['crh', 'active', N('The hypothalamus releases it into the pituitary\'s blood vessels: the first hormone of the stress chain.', 'ההיפותלמוס משחרר אותו לכלי הדם של יותרת המוח: ההורמון הראשון בשרשרת הלחץ.')],
      ['acth', 'active', N('The pituitary releases it into the blood, and it travels to the adrenal glands.', 'יותרת המוח משחררת אותו לדם, והוא נוסע לבלוטות יותרת הכליה.')],
      ['cortisol', 'active', N('The adrenal cortex releases it to free energy; it then returns to the brain and switches the response off.', 'קליפת יותרת הכליה משחררת אותו כדי לשחרר אנרגיה; אחר כך הוא חוזר למוח ומכבה את התגובה.')]],
    steps: [['crh'], ['acth'], ['cortisol'], ['cortisol']],
  },
  attention: {
    list: [['norepinephrine', 'active', N('Alerting: after a warning, locus coeruleus neurons release it in the thalamus and the right frontal and parietal cortex, so you are ready to respond.', 'עוררות: אחרי אזהרה, נוירוני הלוקוס צרולאוס משחררים אותו בתלמוס ובקליפה המצחית והקודקודית הימנית, כדי שתהיו מוכנים להגיב.')],
      ['acetylcholine', 'active', N('Orienting: basal forebrain neurons release it in the parietal cortex, helping move your focus to a new place.', 'התמצאות: נוירוני המוח הקדמי הבסיסי משחררים אותו בקליפה הקודקודית, ועוזרים להזיז את המיקוד למקום חדש.')],
      ['dopamine', 'active', N('Executive control: dopamine from the VTA reaches the frontal cortex and takes part in planning and other higher functions.', 'שליטה ניהולית: דופמין מה-VTA מגיע לקליפה המצחית ומשתתף בתכנון ובתפקודים גבוהים אחרים.')]],
    steps: [['norepinephrine'], [], ['acetylcholine'], [], ['dopamine']],
  },
};

// ---------------------------------------------------------------- effects (content/effects.js)
export const EFFECT_CHEM = {
  caffeine: [['adenosine', 'blocked', N('It normally builds up while you are awake and makes you sleepy. Caffeine sits on its receptors without switching them on, so the "tired" signal cannot land.', 'בדרך כלל הוא מצטבר בזמן הערות וגורם לישנוניות. קפאין יושב על הקולטנים שלו בלי להפעיל אותם, ולכן אות ה"עייפות" לא נקלט.')]],
  alcohol: [['gaba', 'up', N('Alcohol makes GABA-A receptors respond more strongly: more inhibition, so the brain slows down.', 'אלכוהול גורם לקולטני GABA-A להגיב חזק יותר: יותר עיכוב, ולכן המוח מאט.')],
    ['glutamate', 'down', N('Alcohol makes NMDA receptors work less, which may explain the memory problems it causes.', 'אלכוהול מחליש את פעולת קולטני NMDA, וייתכן שזה מסביר את בעיות הזיכרון שהוא גורם.')]],
  nicotine: [['acetylcholine', 'mimic', N('Nicotine copies it at nicotinic receptors and opens them, as ACh would.', 'ניקוטין מחקה אותו בקולטנים הניקוטיניים ופותח אותם, כמו ש-ACh היה עושה.')],
    ['dopamine', 'up', N('Nicotine also stimulates dopamine neurons in the nucleus accumbens (the reward pathway), which drives addiction.', 'ניקוטין מעורר גם נוירוני דופמין בגרעין האקומבנס (מסלול התגמול), וזה מניע את ההתמכרות.')]],
  cocaine: [['dopamine', 'up', N('Cocaine blocks its transporter, so it stays in the synapse and keeps stimulating: the "high", and addiction.', 'קוקאין חוסם את המוביל שלו, ולכן הוא נשאר בסינפסה וממשיך לגרות: ה"היי", וההתמכרות.')],
    ['norepinephrine', 'up', N('Cocaine blocks its transporter too: a racing heart and raised blood pressure.', 'קוקאין חוסם גם את המוביל שלו: לב דוהר ולחץ דם גבוה.')],
    ['serotonin', 'up', N('Cocaine also blocks the serotonin transporter, so serotonin lingers in the synapse as well.', 'קוקאין חוסם גם את מוביל הסרוטונין, ולכן גם סרוטונין נשאר בסינפסה.')]],
  amphetamine: [['dopamine', 'up', N('Amphetamine enters dopamine terminals and makes them release it, and blocks its reuptake: dopamine floods the synapse.', 'אמפטמין נכנס לקצוות של נוירוני הדופמין, גורם להם לשחרר אותו וחוסם את הקליטה החוזרת: דופמין מציף את הסינפסה.')],
    ['norepinephrine', 'up', N('Released the same way: strong arousal and a racing heart.', 'משתחרר באותה דרך: עוררות חזקה ולב דוהר.')]],
  ssri: [['serotonin', 'up', N('The drug blocks its reuptake, so it stays longer in the synapse; the mood benefit usually takes weeks.', 'התרופה חוסמת את הקליטה החוזרת שלו, ולכן הוא נשאר יותר זמן בסינפסה; השיפור במצב הרוח לוקח בדרך כלל שבועות.')]],
  opioids: [['endorphins', 'mimic', N('Opioids act on the endorphins\' own receptors: strong pain relief and euphoria, but also slowed breathing.', 'אופיואידים פועלים על הקולטנים של האנדורפינים עצמם: שיכוך כאב חזק ואופוריה, אבל גם נשימה מואטת.')]],
  benzodiazepines: [['gaba', 'up', N('The drug binds its own site on the GABA-A receptor, so the receptor responds more strongly to GABA: calm, less anxiety.', 'התרופה נקשרת לאתר משלה בקולטן GABA-A, ולכן הקולטן מגיב חזק יותר ל-GABA: רוגע, פחות חרדה.')]],
  ldopa: [['dopamine', 'up', N('The brain turns L-DOPA into dopamine, helping the surviving substantia nigra neurons in Parkinson\'s.', 'המוח הופך L-DOPA לדופמין, ועוזר לנוירונים שנותרו בחומר השחור בפרקינסון.')]],
  antipsychotics: [['dopamine', 'blocked', N('The drug blocks its D2 receptors: this eases psychosis, but in movement pathways it can cause Parkinson-like side effects.', 'התרופה חוסמת את קולטני ה-D2 שלו: זה מקל על הפסיכוזה, אבל במסלולי התנועה עלול לגרום לתופעות לוואי דמויות פרקינסון.')]],
  curare: [['acetylcholine', 'blocked', N('Curare blocks its receptors on the muscles: ACh is released but cannot act, so the muscles are paralysed.', 'קורארה חוסם את הקולטנים שלו בשרירים: ACh משתחרר אבל לא יכול לפעול, ולכן השרירים משותקים.')]],
  botox: [['acetylcholine', 'blocked', N('Botulinum toxin stops its release: the vesicles cannot empty, so the muscle relaxes.', 'רעלן הבוטולינום עוצר את השחרור שלו: השלפוחיות לא יכולות להתרוקן, ולכן השריר נרפה.')]],
  parkinsons: [['dopamine', 'down', N('Substantia nigra neurons die, so too little reaches the striatum: tremor, rigidity and slow movement.', 'נוירונים בחומר השחור מתים, ולכן מעט מדי מגיע לסטריאטום: רעד, נוקשות ותנועה איטית.')]],
  alzheimers: [['acetylcholine', 'down', N('The basal forebrain neurons that release it are lost early, weakening attention and memory.', 'נוירוני המוח הקדמי הבסיסי שמשחררים אותו אובדים מוקדם, והקשב והזיכרון נחלשים.')]],
  stroke: [['glutamate', 'up', N('Dying cells release far too much; NMDA channels let in too much Ca²⁺, which kills more neurons (excitotoxicity).', 'תאים גוססים משחררים הרבה יותר מדי; תעלות NMDA מכניסות יותר מדי Ca²⁺, וזה הורג עוד נוירונים (אקסיטוטוקסיות).')]],
  epilepsy: [['glutamate', 'up', N('Too much excitation makes groups of neurons fire together in bursts…', 'יותר מדי עירור גורם לקבוצות של נוירונים לירות יחד בפרצים…')],
    ['gaba', 'down', N('…or too little inhibition lets the burst spread to neighbouring cortex.', '…או מעט מדי עיכוב מאפשר לפרץ להתפשט לקליפה הסמוכה.')]],
  myasthenia: [['acetylcholine', 'down', N('Antibodies destroy its receptors on the muscles, so the same ACh gives a weaker response: weakness that worsens with use.', 'נוגדנים הורסים את הקולטנים שלו בשרירים, ולכן אותה כמות ACh נותנת תגובה חלשה יותר: חולשה שמחמירה עם השימוש.')]],
  stress: [['norepinephrine', 'up', N('The sympathetic nerves and the locus coeruleus release it: the alarm in body and brain.', 'העצבים הסימפתטיים והלוקוס צרולאוס משחררים אותו: האזעקה בגוף ובמוח.')],
    ['crh', 'up', N('The hypothalamus releases it to start the stress hormone chain.', 'ההיפותלמוס משחרר אותו כדי להתחיל את שרשרת הורמוני הלחץ.')],
    ['acth', 'up', N('The pituitary releases it into the blood, telling the adrenal glands to act.', 'יותרת המוח משחררת אותו לדם, ואומרת לבלוטות יותרת הכליה לפעול.')],
    ['cortisol', 'up', N('The adrenal cortex releases it: blood sugar rises and energy is mobilised.', 'קליפת יותרת הכליה משחררת אותו: רמת הסוכר בדם עולה ואנרגיה מגויסת.')],
    ['epinephrine', 'up', N('The adrenal medulla releases it: the heart races and breathing speeds up.', 'ליבת יותרת הכליה משחררת אותו: הלב דוהר והנשימה מואצת.')]],
  chronicStress: [['cortisol', 'up', N('It stays high because feedback fails: immunity weakens and the hippocampus may be harmed.', 'הוא נשאר גבוה כי המשוב נכשל: מערכת החיסון נחלשת וההיפוקמפוס עלול להיפגע.')]],
  sleepLoss: [['adenosine', 'up', N('It keeps building up while you stay awake, so you feel sleepier and sleepier.', 'הוא ממשיך להצטבר כל עוד נשארים ערים, ולכן מרגישים ישנוניים יותר ויותר.')],
    ['melatonin', 'down', N('Light at night holds it back, pushing sleep later.', 'אור בלילה מעכב אותו, ודוחה את השינה.')]],
  dehydration: [['adh', 'up', N('Salty blood makes the hypothalamus release it from the posterior pituitary: the kidneys keep more water.', 'דם מלוח גורם להיפותלמוס לשחרר אותו מהאונה האחורית של יותרת המוח: הכליות שומרות יותר מים.')]],
  hunger: [['ghrelin', 'up', N('An empty stomach releases it; it tells the hypothalamus (arcuate nucleus) that you are hungry.', 'קיבה ריקה משחררת אותו; הוא אומר להיפותלמוס (הגרעין הקשתי) שאתם רעבים.')],
    ['npy', 'up', N('Hunger signals switch these hypothalamus neurons on, and they start eating.', 'אותות רעב מפעילים את נוירוני ההיפותלמוס האלה, והם מתחילים אכילה.')]],
  light: [['glutamate', 'active', N('Photoreceptors pass the light signal on to the rest of the retina with it.', 'קולטני האור מעבירים איתו את אות האור לשאר הרשתית.')],
    ['melatonin', 'down', N('Light reaching the body clock (SCN) stops the pineal gland from releasing it.', 'אור שמגיע לשעון הביולוגי (SCN) עוצר את בלוטת האצטרובל מלשחרר אותו.')]],
  sound: [['glutamate', 'active', N('Bent hair cells release it onto the auditory nerve.', 'תאי שערה שהתכופפו משחררים אותו על עצב השמיעה.')]],
  touch: [['glutamate', 'active', N('The touch neurons pass the signal on with it at each relay up to the cortex.', 'נוירוני המגע מעבירים איתו את האות בכל תחנת ממסר עד הקליפה.')]],
  pain: [['glutamate', 'active', N('Pain fibres release it in the spinal cord: the reflex first, then the signal to the brain.', 'סיבי הכאב משחררים אותו בחוט השדרה: קודם הרפלקס, ואז האות למוח.')],
    ['substanceP', 'active', N('Released with glutamate in the spinal cord, strengthening the pain signal.', 'משתחרר עם גלוטמט בחוט השדרה, ומחזק את אות הכאב.')],
    ['endorphins', 'active', N('The PAG sets off their release to dampen the pain: the brain\'s own pain control.', 'ה-PAG מפעיל את שחרורם כדי להחליש את הכאב: בקרת הכאב של המוח עצמו.')]],
  threat: [['glutamate', 'active', N('Carries the snake\'s image from the thalamus to the amygdala: fast, before you even think.', 'נושא את תמונת הנחש מהתלמוס לאמיגדלה: מהר, עוד לפני שחושבים.')],
    ['norepinephrine', 'up', N('The amygdala sounds the alarm through the locus coeruleus and sympathetic nerves: alertness up, pupils wide.', 'האמיגדלה מפעילה את האזעקה דרך הלוקוס צרולאוס והעצבים הסימפתטיים: ערנות עולה, אישונים מתרחבים.')],
    ['epinephrine', 'up', N('The adrenal medulla releases it: the heart races, ready to act.', 'ליבת יותרת הכליה משחררת אותו: הלב דוהר, מוכן לפעולה.')],
    ['cortisol', 'up', N('Released a little later by the adrenal cortex: energy for the emergency.', 'משתחרר קצת אחר כך מקליפת יותרת הכליה: אנרגיה למצב החירום.')]],
};

// ---------------------------------------------------------------- dives into the molecule scene with one transmitter
// A dot in another place that leads to molecule/transmitters about ONE transmitter (src/explore/graph.js `alone`):
// what it does in the place you came from. The card shows it on arrival, with that transmitter on its own.
export const DIVE_CHEM = {
  'system/ans>ne': ['norepinephrine', 'active', N('In fight or flight, sympathetic nerves release it onto the heart, lungs and blood vessels: the heart speeds up and the airways open.', 'בהילחם או ברח, העצבים הסימפתטיים משחררים אותו על הלב, הריאות וכלי הדם: הלב מאיץ ודרכי האוויר נפתחות.')],
  'organism/day>adenosine': ['adenosine', 'active', N('It builds up in the brain the longer you are awake, making you sleepier; sleep clears it away.', 'הוא מצטבר במוח ככל שנשארים ערים יותר, ומגביר את הישנוניות; השינה מפנה אותו.')],
  'organism/memory>dopamine': ['dopamine', 'active', N('In the basal ganglia it strengthens actions that paid off, so with repetition they become habits.', 'בגרעיני הבסיס הוא מחזק פעולות שהשתלמו, וכך עם החזרה הן הופכות להרגלים.')],
};

/** Names and colours for the molecule scene, so both places use the same ones. */
export const messengerColors = () => Object.fromEntries(Object.entries(MESSENGERS).filter(([, m]) => m.molecule).map(([, m]) => [m.molecule, m.color]));
