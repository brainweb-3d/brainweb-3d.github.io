// "Apply an effect" — drugs & toxins, diseases & damage, body states and stimuli.
// For each effect, `at` says what happens at each zoom level:
//   s     = scene id to show            acts = buttons to press in that scene (matched on their English label)
//   alone = part to show on its own     cmp  = [partA, partB, 'side' | 'stack'] to compare
//   show  = parts to highlight          note = what is happening at this level (EN + HE)
// The organ level (anatomical brain) uses { path: pathway id, regions: [...] }.
const B = (en, he) => ({ en, he });

export const CATEGORIES = [
  { id: 'drug', icon: '💊', name: B('Drugs & toxins', 'סמים ורעלים') },
  { id: 'disease', icon: '🩺', name: B('Diseases & damage', 'מחלות ופגיעות') },
  { id: 'state', icon: '🌡️', name: B('Body states', 'מצבי גוף') },
  { id: 'stimulus', icon: '✨', name: B('Stimuli', 'גירויים') },
];

const E = (id, cat, icon, name, desc, chapters, at) => ({ id, cat, icon, name, desc, chapters, at });

export const EFFECTS = [
  // ---------------------------------------------------------------- drugs & toxins
  E('caffeine', 'drug', '☕', B('Caffeine', 'קפאין'), B('Blocks adenosine receptors, so the "I\'m tired" signal is silenced.', 'חוסם קולטני אדנוזין, וכך אות ה"אני עייף" מושתק.'), [4, 11], {
    molecule: { s: 'drugs', cmp: ['adenosine', 'caffeine', 'side'], note: B('Caffeine\'s ring structure resembles adenosine, so it fits adenosine receptors without activating them (an antagonist).', 'מבנה הטבעות של הקפאין דומה לאדנוזין, ולכן הוא נכנס לקולטני אדנוזין בלי להפעיל אותם (אנטגוניסט).') },
    macromolecule: { s: 'receptors', acts: ['Slow: dopamine'], show: ['gpcr'], note: B('Adenosine receptors are metabotropic (G-protein) receptors like this one; caffeine occupies them so adenosine cannot switch them on.', 'קולטני אדנוזין הם קולטנים מטבוטרופיים (חלבון G) כמו זה; קפאין תופס אותם ולכן אדנוזין לא יכול להפעיל אותם.') },
    system: { s: 'ans', acts: ['Fight or flight'], note: B('Caffeine raises alertness and can speed the heart a little.', 'קפאין מעלה ערנות ויכול להאיץ מעט את הלב.') },
    organism: { s: 'day', acts: ['Jump to 2 a.m.'], note: B('Adenosine builds up during waking and makes us sleepy; blocking it delays sleep.', 'אדנוזין מצטבר בזמן הערות וגורם לישנוניות; חסימתו דוחה את השינה.') },
  }),
  E('alcohol', 'drug', '🍷', B('Alcohol', 'אלכוהול'), B('Boosts GABA inhibition and blocks NMDA glutamate receptors — a depressant.', 'מחזק את העיכוב של GABA וחוסם קולטני גלוטמט NMDA — מדכא.'), [4], {
    atom: { s: 'nmda', acts: ['Release glutamate'], show: ['nmda'], note: B('Alcohol reduces NMDA receptor activity — one reason heavy drinking blocks new memories ("blackouts").', 'אלכוהול מפחית את פעילות קולטני NMDA — אחת הסיבות ששתייה כבדה חוסמת זיכרונות חדשים ("בלאקאאוט").') },
    molecule: { s: 'transmitters', alone: 'gaba', note: B('Alcohol makes GABA (the main inhibitory transmitter) more effective at GABA-A receptors.', 'אלכוהול הופך את GABA (המוליך המעכב העיקרי) ליעיל יותר בקולטני GABA-A.') },
    cell: { s: 'neuron', acts: ['Extra inhibition', 'Excitatory input'], note: B('With extra inhibition the same input moves the neuron less — it fires less often.', 'עם עיכוב נוסף אותו קלט מזיז את הנוירון פחות — הוא יורה לעיתים רחוקות יותר.') },
    tissue: { s: 'bbb', acts: ['Fat-soluble drug'], note: B('Alcohol is small and fat-soluble, so it crosses the blood–brain barrier within minutes.', 'אלכוהול קטן ומסיס בשומן, ולכן חוצה את מחסום הדם-מוח תוך דקות.') },
    system: { s: 'ans', acts: ['Rest and digest'], note: B('As a depressant, alcohol slows reactions and coordination.', 'כמדכא, אלכוהול מאט תגובות וקואורדינציה.') },
    organism: { s: 'memory', acts: ['Learn a fact'], note: B('Heavy drinking disrupts the hippocampus, so new memories may not form.', 'שתייה כבדה משבשת את ההיפוקמפוס, ולכן זיכרונות חדשים עלולים לא להיווצר.') },
  }),
  E('nicotine', 'drug', '🚬', B('Nicotine', 'ניקוטין'), B('An agonist at nicotinic acetylcholine receptors; releases dopamine — highly addictive.', 'אגוניסט בקולטני אצטילכולין ניקוטיניים; משחרר דופמין — ממכר מאוד.'), [4, 14], {
    molecule: { s: 'drugs', cmp: ['acetylcholine', 'nicotine', 'side'], note: B('Nicotine shares key features with acetylcholine, so nicotinic receptors accept it.', 'לניקוטין יש תכונות מפתח משותפות עם אצטילכולין, ולכן קולטנים ניקוטיניים מקבלים אותו.') },
    macromolecule: { s: 'receptors', acts: ['Fast: ACh opens'], show: ['iono'], note: B('The nicotinic receptor is an ionotropic channel: nicotine opens it just like ACh.', 'הקולטן הניקוטיני הוא תעלה יונוטרופית: ניקוטין פותח אותה בדיוק כמו ACh.') },
    cell: { s: 'synapse', acts: ['Agonist'], note: B('An agonist activates the receptors directly.', 'אגוניסט מפעיל את הקולטנים ישירות.') },
    tissue: { s: 'bbb', acts: ['Fat-soluble drug'], note: B('Nicotine crosses into the brain within seconds of inhaling.', 'ניקוטין חוצה למוח תוך שניות מהשאיפה.') },
    organ: { path: 'reward', regions: ['vta', 'nucleusAccumbens'], note: B('Nicotine makes VTA neurons release dopamine in the nucleus accumbens — the reward pathway.', 'ניקוטין גורם לנוירונים ב-VTA לשחרר דופמין בגרעין האקומבנס — מסלול התגמול.') },
    system: { s: 'ans', acts: ['Fight or flight'], note: B('Nicotine also stimulates the sympathetic system: heart rate rises.', 'ניקוטין גם מגרה את המערכת הסימפתטית: קצב הלב עולה.') },
  }),
  E('cocaine', 'drug', '❄️', B('Cocaine', 'קוקאין'), B('Blocks the dopamine transporter, so dopamine stays in the synapse.', 'חוסם את מוביל הדופמין, ולכן הדופמין נשאר בסינפסה.'), [4, 14], {
    molecule: { s: 'toxins', alone: 'cocaine', note: B('Cocaine does not look like dopamine — it blocks the transporter that would clear dopamine away.', 'קוקאין לא דומה לדופמין — הוא חוסם את המוביל שאמור לפנות את הדופמין.') },
    macromolecule: { s: 'transporter', acts: ['Cocaine blocks the transporter'], note: B('Cocaine plugs the dopamine transporter protein, so dopamine is not cleared from the synapse.', 'קוקאין פוקק את חלבון מוביל הדופמין, ולכן הדופמין לא מפונה מהסינפסה.') },
    cell: { s: 'synapse', acts: ['Reuptake blocker'], note: B('With reuptake blocked, dopamine piles up and keeps stimulating the receptors.', 'כשהקליטה מחדש חסומה, הדופמין מצטבר וממשיך לגרות את הקולטנים.') },
    tissue: { s: 'bbb', acts: ['Fat-soluble drug'], note: B('Cocaine reaches the brain quickly.', 'קוקאין מגיע למוח במהירות.') },
    organ: { path: 'reward', regions: ['vta', 'nucleusAccumbens'], note: B('Extra dopamine in the nucleus accumbens produces the "high" and drives addiction.', 'עודף דופמין בגרעין האקומבנס יוצר את ה"היי" ומניע התמכרות.') },
    system: { s: 'ans', acts: ['Fight or flight'], note: B('Cocaine also boosts norepinephrine: racing heart, raised blood pressure.', 'קוקאין מגביר גם נוראפינפרין: לב דוהר, לחץ דם גבוה.') },
  }),
  E('amphetamine', 'drug', '⚡', B('Amphetamine', 'אמפטמין'), B('Enters dopamine terminals and makes them release dopamine.', 'נכנס לטרמינלים של דופמין וגורם להם לשחרר דופמין.'), [4, 14], {
    molecule: { s: 'drugs', cmp: ['dopamine', 'amphetamine', 'side'], note: B('Amphetamine looks like dopamine, so the dopamine transporter carries it into the terminal.', 'אמפטמין דומה לדופמין, ולכן מוביל הדופמין מכניס אותו לטרמינל.') },
    cell: { s: 'synapse', acts: ['Reuptake blocker'], note: B('Amphetamine both releases dopamine and blocks its reuptake — dopamine floods the synapse.', 'אמפטמין גם משחרר דופמין וגם חוסם את קליטתו מחדש — הדופמין מציף את הסינפסה.') },
    organ: { path: 'dopamine', regions: ['nucleusAccumbens', 'basalGanglia'], note: B('Dopamine pathways are over-activated.', 'מסלולי הדופמין מופעלים יתר על המידה.') },
    system: { s: 'ans', acts: ['Fight or flight'], note: B('Strong sympathetic activation.', 'הפעלה סימפתטית חזקה.') },
  }),
  E('ssri', 'drug', '💊', B('SSRI antidepressants', 'נוגדי דיכאון SSRI'), B('Block serotonin reuptake, so serotonin stays longer in the synapse.', 'חוסמים את הקליטה מחדש של סרוטונין, ולכן הוא נשאר זמן רב יותר בסינפסה.'), [4, 16], {
    molecule: { s: 'transmitters', alone: 'serotonin', note: B('SSRIs act on serotonin, the transmitter shown here.', 'SSRI פועלים על סרוטונין, המוליך המוצג כאן.') },
    macromolecule: { s: 'transporter', acts: ['Cocaine blocks the transporter'], note: B('SSRIs block the serotonin transporter, a close relative of the dopamine transporter shown here.', 'SSRI חוסמים את מוביל הסרוטונין, קרוב משפחה של מוביל הדופמין המוצג כאן.') },
    cell: { s: 'synapse', acts: ['Reuptake blocker'], note: B('Selective serotonin reuptake inhibitors keep serotonin in the cleft longer.', 'מעכבי קליטה מחדש סלקטיביים של סרוטונין שומרים אותו בחריץ זמן רב יותר.') },
    organ: { path: 'serotonin', regions: ['raphe'], note: B('Serotonin from the raphe nuclei reaches much of the brain. The mood benefit usually takes weeks, suggesting slower changes are involved.', 'סרוטונין מגרעיני הרפה מגיע לחלקים רבים במוח. השיפור במצב הרוח לוקח בדרך כלל שבועות — סימן לשינויים איטיים יותר.') },
  }),
  E('opioids', 'drug', '🌸', B('Opioids (morphine, heroin)', 'אופיואידים (מורפין, הרואין)'), B('Activate opioid receptors: strong pain relief and euphoria.', 'מפעילים קולטני אופיואידים: שיכוך כאב חזק ואופוריה.'), [4, 7], {
    molecule: { s: 'toxins', alone: 'morphine', note: B('Morphine, from the opium poppy, mimics the body’s own endorphins.', 'מורפין, מפרג האופיום, מחקה את האנדורפינים של הגוף.') },
    cell: { s: 'synapse', acts: ['Agonist'], note: B('Opioids are agonists at the body\'s own endorphin (opioid) receptors.', 'אופיואידים הם אגוניסטים בקולטני האנדורפינים (אופיואידים) של הגוף עצמו.') },
    tissue: { s: 'bbb', acts: ['Fat-soluble drug'], note: B('Heroin is more fat-soluble than morphine, so it enters the brain faster.', 'הרואין מסיס בשומן יותר ממורפין, ולכן נכנס למוח מהר יותר.') },
    organ: { path: 'pain', regions: ['pag', 'thalamus'], note: B('Opioids act in the periaqueductal gray and spinal cord to block pain signals.', 'אופיואידים פועלים בחומר האפור סביב אמת המים ובחוט השדרה כדי לחסום אותות כאב.') },
    organism: { s: 'stove', acts: ['Touch the hot stove'], note: B('The reflex still works, but the pain is felt much less.', 'הרפלקס עדיין פועל, אבל הכאב מורגש הרבה פחות.') },
    system: { s: 'ans', acts: ['Rest and digest'], note: B('Opioids slow breathing — the main danger of an overdose.', 'אופיואידים מאטים את הנשימה — הסכנה העיקרית במנת יתר.') },
  }),
  E('benzodiazepines', 'drug', '😴', B('Benzodiazepines (e.g. Valium)', 'בנזודיאזפינים (למשל ואליום)'), B('Make GABA-A receptors respond more strongly to GABA — calming, anti-anxiety.', 'גורמים לקולטני GABA-A להגיב חזק יותר ל-GABA — מרגיע, נוגד חרדה.'), [4, 16], {
    molecule: { s: 'toxins', alone: 'diazepam', note: B('Benzodiazepines bind to a separate site on the GABA-A receptor and boost GABA\'s effect.', 'בנזודיאזפינים נקשרים לאתר נפרד בקולטן GABA-A ומגבירים את השפעת ה-GABA.') },
    macromolecule: { s: 'receptors', acts: ['Fast: ACh opens'], show: ['iono'], note: B('GABA-A is an ionotropic receptor like this one; benzodiazepines make its Cl⁻ channel open more often.', 'GABA-A הוא קולטן יונוטרופי כמו זה; בנזודיאזפינים גורמים לתעלת ה-Cl⁻ שלו להיפתח לעיתים קרובות יותר.') },
    cell: { s: 'neuron', acts: ['Extra inhibition', 'Excitatory input'], note: B('Neurons become harder to excite.', 'קשה יותר לעורר את הנוירונים.') },
    organ: { path: 'fear', regions: ['amygdala'], note: B('Reduced activity in fear circuits such as the amygdala.', 'פעילות מופחתת במעגלי פחד כמו האמיגדלה.') },
  }),
  E('ldopa', 'drug', '💊', B('L-DOPA', 'L-DOPA'), B('The precursor of dopamine, used to treat Parkinson\'s disease.', 'החומר המקדים של דופמין, משמש לטיפול במחלת פרקינסון.'), [4, 8, 15], {
    molecule: { s: 'toxins', cmp: ['dopamine', 'ldopa', 'side'], note: B('L-DOPA is converted into dopamine inside the brain.', 'L-DOPA הופך לדופמין בתוך המוח.') },
    tissue: { s: 'bbb', acts: ['Glucose'], note: B('Dopamine itself cannot cross the blood–brain barrier, but L-DOPA is carried across by transporter proteins (like glucose here).', 'דופמין עצמו לא יכול לחצות את מחסום הדם-מוח, אבל L-DOPA מועבר דרכו בחלבוני הובלה (כמו הגלוקוז כאן).') },
    organ: { path: 'dopamine', regions: ['substantiaNigra', 'basalGanglia'], note: B('Extra dopamine helps the surviving substantia nigra pathway to the striatum.', 'דופמין נוסף עוזר למסלול השרוד מהחומר השחור לסטריאטום.') },
  }),
  E('antipsychotics', 'drug', '🧩', B('Antipsychotics', 'תרופות אנטי-פסיכוטיות'), B('Block dopamine (D2) receptors; used for schizophrenia.', 'חוסמות קולטני דופמין (D2); משמשות לטיפול בסכיזופרניה.'), [4, 16], {
    molecule: { s: 'binding', acts: ['An antagonist'], note: B('An antagonist fits the dopamine receptor but does not switch it on.', 'אנטגוניסט נכנס לקולטן הדופמין אבל לא מפעיל אותו.') },
    cell: { s: 'synapse', acts: ['Antagonist'], note: B('Receptors are blocked, so dopamine has less effect.', 'הקולטנים חסומים, ולכן לדופמין יש פחות השפעה.') },
    organ: { path: 'dopamine', regions: ['nucleusAccumbens', 'basalGanglia'], note: B('Blocking dopamine in movement pathways can cause Parkinson-like side effects.', 'חסימת דופמין במסלולי תנועה יכולה לגרום לתופעות לוואי דמויות פרקינסון.') },
  }),
  E('curare', 'drug', '🏹', B('Curare', 'קורארה'), B('Blocks nicotinic ACh receptors on muscles — paralysis.', 'חוסמת קולטני ACh ניקוטיניים בשרירים — שיתוק.'), [4, 8], {
    molecule: { s: 'toxins', cmp: ['acetylcholine', 'tubocurarine', 'stack'], note: B('Curare is an antagonist: it occupies the receptor without opening it.', 'קורארה היא אנטגוניסט: היא תופסת את הקולטן בלי לפתוח אותו.') },
    cell: { s: 'synapse', acts: ['Antagonist'], note: B('ACh is released but cannot activate the blocked receptors.', 'ACh משתחרר אבל לא יכול להפעיל את הקולטנים החסומים.') },
    tissue: { s: 'nmj', acts: ['Curare', 'Send a nerve impulse'], note: B('At the neuromuscular junction the muscle cannot respond — paralysis.', 'בצומת עצב-שריר השריר לא יכול להגיב — שיתוק.') },
  }),
  E('botox', 'drug', '💉', B('Botulinum toxin (Botox)', 'רעלן בוטולינום (בוטוקס)'), B('Prevents the release of acetylcholine.', 'מונע את שחרור האצטילכולין.'), [4, 8], {
    organelle: { s: 'vesicles', acts: ['Action potential arrives'], show: ['vesicles'], note: B('Botulinum toxin destroys proteins that let vesicles fuse with the membrane, so they cannot empty.', 'רעלן הבוטולינום הורס חלבונים שמאפשרים לשלפוחיות להתמזג עם הממברנה, ולכן הן לא יכולות להתרוקן.') },
    cell: { s: 'synapse', acts: ['Release blocker'], note: B('No release → no signal.', 'אין שחרור ← אין אות.') },
    tissue: { s: 'nmj', acts: ['Botulinum toxin', 'Send a nerve impulse'], note: B('Muscles relax — used in tiny doses to smooth wrinkles or treat muscle spasms.', 'השרירים מרפים — משמש במינונים זעירים להחלקת קמטים או לטיפול בעוויתות שרירים.') },
  }),
  E('ttx', 'drug', '🐡', B('Tetrodotoxin (pufferfish poison)', 'טטרודוטוקסין (רעל דג הנפוחית)'), B('Blocks voltage-gated Na⁺ channels — nerves cannot fire.', 'חוסם תעלות Na⁺ תלויות מתח — עצבים לא יכולים לירות.'), [3], {
    molecule: { s: 'toxins', alone: 'ttx', note: B('A small, rigid molecule with a positively charged group that fits the mouth of the Na⁺ channel like a cork.', 'מולקולה קטנה וקשיחה עם קבוצה טעונה חיובית שנכנסת לפתח תעלת ה-Na⁺ כמו פקק.') },
    atom: { s: 'membrane', acts: ['Block Na⁺ channels', 'Fire an action potential'], note: B('Na⁺ cannot enter, so the membrane cannot depolarize.', 'Na⁺ לא יכול להיכנס, ולכן הממברנה לא יכולה לעבור דה-פולריזציה.') },
    macromolecule: { s: 'channels', alone: 'nav', note: B('TTX plugs the outer mouth of this voltage-gated Na⁺ channel.', 'TTX פוקק את הפתח החיצוני של תעלת ה-Na⁺ תלוית המתח הזו.') },
    cell: { s: 'neuron', acts: ['Block Na⁺ channels', 'Fire an action potential'], note: B('No action potential can start or travel.', 'פוטנציאל פעולה לא יכול להתחיל או להתקדם.') },
    system: { s: 'nervous', acts: ['Peripheral nervous system'], note: B('Nerves stop conducting: numbness, then paralysis — including the breathing muscles.', 'העצבים מפסיקים להוליך: חוסר תחושה ואז שיתוק — כולל שרירי הנשימה.') },
  }),
  // ---------------------------------------------------------------- diseases & damage
  E('parkinsons', 'disease', '🫨', B('Parkinson\'s disease', 'מחלת פרקינסון'), B('Loss of dopamine neurons in the substantia nigra: tremor, rigidity, slow movement.', 'אובדן נוירוני דופמין בחומר השחור: רעד, נוקשות, תנועה איטית.'), [8, 15], {
    molecule: { s: 'transmitters', alone: 'dopamine', note: B('The missing transmitter is dopamine.', 'המוליך החסר הוא דופמין.') },
    cell: { s: 'synapse', acts: ['Release blocker'], note: B('Too little dopamine is released onto the striatum.', 'משתחרר מעט מדי דופמין אל הסטריאטום.') },
    organ: { path: 'dopamine', regions: ['substantiaNigra', 'basalGanglia'], note: B('The nigrostriatal pathway fails; symptoms appear after most of these neurons are lost.', 'המסלול הניגרו-סטריאטלי כושל; התסמינים מופיעים לאחר שרוב הנוירונים האלה אבדו.') },
    organism: { s: 'memory', acts: ['Learn to ride a bike'], note: B('The basal ganglia circuits for starting and smoothing movement are affected.', 'מעגלי הגרעינים הבסיסיים שמתחילים ומחליקים תנועה נפגעים.') },
  }),
  E('alzheimers', 'disease', '🧓', B('Alzheimer\'s disease', 'מחלת אלצהיימר'), B('Plaques and tangles kill neurons, starting in memory areas.', 'פלאקים וסבכים הורגים נוירונים, החל באזורי זיכרון.'), [12, 15], {
    cell: { s: 'neuron', alone: 'soma', note: B('Amyloid plaques form between neurons and tau tangles inside them, until the cells die.', 'פלאקים של עמילואיד נוצרים בין הנוירונים וסבכי טאו בתוכם, עד שהתאים מתים.') },
    tissue: { s: 'cortex', acts: ['Input vs output layers'], note: B('The cortex thins as neurons are lost.', 'הקליפה מצטמקת ככל שנוירונים אובדים.') },
    organ: { path: 'memory', regions: ['hippocampus'], note: B('The hippocampus and the acetylcholine neurons of the basal forebrain are hit early — new memories fail first.', 'ההיפוקמפוס ונוירוני האצטילכולין של המוח הקדמי הבסיסי נפגעים מוקדם — זיכרונות חדשים נכשלים ראשונים.') },
    organism: { s: 'memory', acts: ['Learn a fact'], note: B('Declarative memory (facts and events) declines first.', 'הזיכרון הדקלרטיבי (עובדות ואירועים) נפגע ראשון.') },
  }),
  E('ms', 'disease', '🧈', B('Multiple sclerosis', 'טרשת נפוצה'), B('The immune system attacks myelin in the brain and spinal cord.', 'מערכת החיסון תוקפת את המיאלין במוח ובחוט השדרה.'), [3, 15], {
    cell: { s: 'neuron', acts: ['Remove myelin', 'Fire an action potential'], note: B('Without myelin, signals slow down or fail.', 'בלי מיאלין אותות מואטים או נכשלים.') },
    tissue: { s: 'nerve', alone: 'myelinated', note: B('MS damages CNS myelin (made by oligodendrocytes); peripheral nerves like this are usually spared.', 'טרשת נפוצה פוגעת במיאלין של מערכת העצבים המרכזית (שמייצרים אוליגודנדרוציטים); עצבים היקפיים כמו זה בדרך כלל לא נפגעים.') },
    system: { s: 'nervous', acts: ['Central nervous system'], note: B('Patches of damage (plaques) appear in the brain and spinal cord, so symptoms vary between people.', 'כתמי נזק (פלאקים) מופיעים במוח ובחוט השדרה, ולכן התסמינים שונים מאדם לאדם.') },
  }),
  E('stroke', 'disease', '🩸', B('Stroke', 'שבץ'), B('A blocked or burst artery starves part of the brain of oxygen.', 'עורק חסום או קרוע מונע חמצן מחלק מהמוח.'), [15], {
    atom: { s: 'nmda', acts: ['Release glutamate', 'Depolarize the membrane'], note: B('Dying cells release masses of glutamate; NMDA channels let in too much Ca²⁺, which kills more neurons (excitotoxicity).', 'תאים גוססים משחררים כמויות גלוטמט; תעלות NMDA מכניסות יותר מדי Ca²⁺, וזה הורג נוירונים נוספים (אקסיטוטוקסיות).') },
    tissue: { s: 'bbb', alone: 'endothelium', note: B('Without blood flow, the tissue around the vessel gets no oxygen or glucose.', 'בלי זרימת דם, הרקמה סביב כלי הדם לא מקבלת חמצן או גלוקוז.') },
    organ: { path: 'language', regions: ['broca', 'wernicke'], note: B('Symptoms depend on where it happens — e.g. a left-hemisphere stroke can cause aphasia.', 'התסמינים תלויים במיקום — למשל שבץ בהמיספרה השמאלית יכול לגרום לאפזיה.') },
  }),
  E('epilepsy', 'disease', '🌩️', B('Epilepsy', 'אפילפסיה'), B('Groups of neurons fire together in abnormal bursts (seizures).', 'קבוצות נוירונים יורות יחד בפרצים חריגים (התקפים).'), [15], {
    cell: { s: 'neuron', acts: ['Over-excitation'], note: B('Too much excitation (or too little inhibition) makes neurons fire repeatedly.', 'עירור יתר (או עיכוב חסר) גורם לנוירונים לירות שוב ושוב.') },
    tissue: { s: 'cortex', acts: ['Follow a signal'], note: B('Activity spreads across the layers and to neighbouring cortex.', 'הפעילות מתפשטת בין השכבות ואל קליפה סמוכה.') },
    organ: { path: 'memory', regions: ['hippocampus', 'temporal'], note: B('The temporal lobe and hippocampus are common starting points.', 'האונה הרקתית וההיפוקמפוס הם נקודות מוצא נפוצות.') },
  }),
  E('myasthenia', 'disease', '😩', B('Myasthenia gravis', 'מיאסתניה גרביס'), B('Antibodies destroy ACh receptors on muscles: weakness that worsens with use.', 'נוגדנים הורסים קולטני ACh בשרירים: חולשה שמחמירה עם השימוש.'), [8, 15], {
    cell: { s: 'synapse', acts: ['Antagonist'], note: B('Fewer working receptors means a weaker response to the same ACh.', 'פחות קולטנים פעילים פירושם תגובה חלשה יותר לאותה כמות ACh.') },
    tissue: { s: 'nmj', acts: ['Curare', 'Send a nerve impulse'], note: B('Like a mild, permanent curare: muscle fibres respond weakly.', 'כמו קורארה קלה וקבועה: סיבי השריר מגיבים בחולשה.') },
  }),
  E('sci', 'disease', '🦽', B('Spinal cord injury', 'פגיעה בחוט השדרה'), B('Messages can no longer pass the damaged level.', 'מסרים כבר לא יכולים לעבור את הרמה הפגועה.'), [8, 15], {
    system: { s: 'nervous', acts: ['Feel your foot'], show: ['cord'], note: B('Below the injury, sensation and voluntary movement are lost; reflexes below it can still work.', 'מתחת לפגיעה אובדות התחושה והתנועה הרצונית; רפלקסים מתחת לה עדיין יכולים לפעול.') },
    organism: { s: 'stove', acts: ['Touch the hot stove'], note: B('A reflex arc only needs the cord segment at its own level — the brain is not required.', 'קשת רפלקס צריכה רק את מקטע חוט השדרה ברמה שלה — המוח לא נחוץ.') },
  }),
  // ---------------------------------------------------------------- body states
  E('stress', 'state', '😰', B('Acute stress', 'לחץ חריף'), B('A threat triggers the sympathetic system and the HPA hormone axis.', 'איום מפעיל את המערכת הסימפתטית ואת ציר ההורמונים HPA.'), [14], {
    molecule: { s: 'transmitters', alone: 'norepinephrine', note: B('Norepinephrine (and adrenaline) carry the alarm.', 'נוראפינפרין (ואדרנלין) נושאים את האזעקה.') },
    system: { s: 'hpa', acts: ['A stressor appears'], note: B('Hypothalamus → pituitary → adrenal cortex → cortisol, then feedback switches it off.', 'היפותלמוס ← יותרת המוח ← קליפת יותרת הכליה ← קורטיזול, ואז משוב מכבה את התגובה.') },
    organ: { path: 'stress', regions: ['hypothalamus', 'amygdala'], note: B('The amygdala and hypothalamus start the stress response.', 'האמיגדלה וההיפותלמוס מפעילים את תגובת הלחץ.') },
    organism: { s: 'homeostasis', acts: ['Skip a meal'], note: B('Stress hormones mobilise energy (they raise blood sugar).', 'הורמוני לחץ מגייסים אנרגיה (מעלים את רמת הסוכר בדם).') },
  }),
  E('chronicStress', 'state', '⏳', B('Chronic stress', 'לחץ כרוני'), B('Stress that never ends keeps cortisol high.', 'לחץ שלא נגמר שומר על קורטיזול גבוה.'), [14], {
    system: { s: 'hpa', acts: ['Chronic stress'], note: B('Feedback fails; long-term cortisol weakens immunity and may harm the hippocampus.', 'המשוב נכשל; קורטיזול ממושך מחליש את מערכת החיסון ועלול לפגוע בהיפוקמפוס.') },
    organism: { s: 'memory', acts: ['Learn a fact'], note: B('Memory can suffer when the hippocampus is exposed to cortisol for a long time.', 'הזיכרון עלול להיפגע כשההיפוקמפוס חשוף לקורטיזול לאורך זמן.') },
  }),
  E('sleepLoss', 'state', '🥱', B('Sleep deprivation', 'חוסר שינה'), B('Too little sleep impairs attention, mood and memory.', 'שינה מועטה פוגעת בקשב, במצב הרוח ובזיכרון.'), [11, 12], {
    organism: { s: 'day', acts: ['Bright screen in the evening', 'Play a day'], note: B('Light at night suppresses melatonin and pushes sleep later; adenosine keeps building up.', 'אור בלילה מדכא מלטונין ודוחה את השינה; אדנוזין ממשיך להצטבר.') },
    organ: { path: 'memory', regions: ['hippocampus'], note: B('Sleep helps consolidate memories; losing it weakens learning.', 'השינה עוזרת לגבש זיכרונות; אובדנה מחליש את הלמידה.') },
  }),
  E('fever', 'state', '🤒', B('Fever', 'חום'), B('The hypothalamus raises the temperature set point to fight infection.', 'ההיפותלמוס מעלה את נקודת הקביעה של הטמפרטורה כדי להילחם בזיהום.'), [9], {
    organism: { s: 'homeostasis', acts: ['A cold day'], note: B('With a higher set point, normal 37 °C suddenly feels "too cold": you shiver and feel chills until your temperature rises.', 'כשנקודת הקביעה גבוהה יותר, ‏37°C רגילים פתאום מרגישים "קר מדי": רועדים ומרגישים צמרמורת עד שהחום עולה.') },
    organ: { regions: ['hypothalamus'], note: B('The preoptic area of the hypothalamus is the thermostat that is reset.', 'האזור הפרה-אופטי של ההיפותלמוס הוא התרמוסטט שמכוונן מחדש.') },
  }),
  E('dehydration', 'state', '💧', B('Dehydration (thirst)', 'התייבשות (צמא)'), B('Salty, concentrated blood triggers thirst and water saving.', 'דם מלוח ומרוכז מעורר צמא וחיסכון במים.'), [9], {
    tissue: { s: 'bbb', acts: ['Oxygen'], note: B('Osmoreceptors near the third ventricle sit where the blood–brain barrier is leaky, so they can "taste" the blood.', 'אוסמורצפטורים ליד החדר השלישי יושבים במקום שבו מחסום הדם-מוח דולף, כך שהם יכולים "לטעום" את הדם.') },
    system: { s: 'hpa', alone: 'pituitary', note: B('The posterior pituitary releases ADH (vasopressin), so the kidneys keep more water.', 'האונה האחורית של יותרת המוח משחררת ADH (וזופרסין), ולכן הכליות שומרות יותר מים.') },
    organ: { regions: ['hypothalamus'], note: B('The hypothalamus creates the feeling of thirst.', 'ההיפותלמוס יוצר את תחושת הצמא.') },
  }),
  E('hunger', 'state', '🍽️', B('Hunger', 'רעב'), B('An empty stomach and falling energy signals make us want to eat.', 'קיבה ריקה ואותות אנרגיה יורדים גורמים לנו לרצות לאכול.'), [9], {
    organism: { s: 'homeostasis', acts: ['Skip a meal'], note: B('Ghrelin from the stomach signals the hypothalamus.', 'גרלין מהקיבה מאותת להיפותלמוס.') },
    organ: { regions: ['hypothalamus'], note: B('The arcuate nucleus of the hypothalamus weighs hunger and satiety signals.', 'הגרעין הקשתי בהיפותלמוס שוקל אותות רעב ושובע.') },
  }),
  // ---------------------------------------------------------------- stimuli
  E('light', 'stimulus', '💡', B('Bright light', 'אור חזק'), B('Photons hit the retina and start the visual pathway.', 'פוטונים פוגעים ברשתית ומפעילים את מסלול הראייה.'), [6, 11], {
    tissue: { s: 'retina', acts: ['Bright light'], note: B('Cones respond in bright light; the signal goes to bipolar and ganglion cells.', 'המדוכים מגיבים באור חזק; האות עובר לתאים דו-קוטביים ולתאי גנגליון.') },
    organ: { path: 'vision', regions: ['occipital', 'thalamus'], note: B('Retina → optic chiasm → thalamus (LGN) → visual cortex.', 'רשתית ← הצלבת הראייה ← תלמוס (LGN) ← קליפת הראייה.') },
    organism: { s: 'day', acts: ['Jump to 9 a.m.'], note: B('Light also resets the body clock (SCN) and stops melatonin.', 'האור גם מכוונן את השעון הביולוגי (SCN) ועוצר מלטונין.') },
  }),
  E('sound', 'stimulus', '🔊', B('A loud sound', 'צליל חזק'), B('Sound waves shake the basilar membrane in the cochlea.', 'גלי קול מרעידים את הממברנה הבזילרית בשבלול.'), [7], {
    tissue: { s: 'corti', acts: ['High tone'], note: B('Hair cells bend; very loud sounds can permanently damage them.', 'תאי השיער מתכופפים; צלילים חזקים מאוד יכולים להרוס אותם לצמיתות.') },
    organ: { path: 'hearing', regions: ['temporal', 'thalamus'], note: B('Cochlea → brainstem → thalamus (MGN) → auditory cortex.', 'שבלול ← גזע המוח ← תלמוס (MGN) ← קליפת השמיעה.') },
  }),
  E('touch', 'stimulus', '✋', B('A touch', 'מגע'), B('Skin receptors send signals up the spinal cord.', 'קולטני העור שולחים אותות במעלה חוט השדרה.'), [7], {
    system: { s: 'nervous', acts: ['Feel your foot'], note: B('Sensory (afferent) signals travel to the brain.', 'אותות תחושתיים (אפרנטיים) נעים אל המוח.') },
    organ: { path: 'touch', regions: ['parietal', 'thalamus'], note: B('The signal ends in the somatosensory cortex of the parietal lobe.', 'האות מסתיים בקליפה הסומטו-סנסורית באונה הקודקודית.') },
  }),
  E('pain', 'stimulus', '🔥', B('Painful heat', 'חום מכאיב'), B('Nociceptors fire; a reflex pulls you away before you feel pain.', 'נוציספטורים יורים; רפלקס מרחיק אותך עוד לפני שמרגישים כאב.'), [7, 8], {
    cell: { s: 'neuron', acts: ['Excitatory input', 'Fire an action potential'], note: B('Pain receptors are neurons whose endings respond to damaging heat.', 'קולטני כאב הם נוירונים שקצותיהם מגיבים לחום מזיק.') },
    organism: { s: 'stove', acts: ['Touch the hot stove'], note: B('Reflex first (spinal cord), pain second (brain).', 'קודם רפלקס (חוט השדרה), אחר כך כאב (המוח).') },
    organ: { path: 'pain', regions: ['thalamus', 'cingulate'], note: B('Pain reaches the thalamus, the somatosensory cortex and the cingulate cortex (its unpleasantness).', 'הכאב מגיע לתלמוס, לקליפה הסומטו-סנסורית ולקליפת החגורה (אי-הנעימות שלו).') },
  }),
  E('threat', 'stimulus', '🐍', B('A threat (fear)', 'איום (פחד)'), B('Seeing a snake triggers fear before you even think.', 'ראיית נחש מעוררת פחד עוד לפני שחושבים.'), [14], {
    organ: { path: 'fear', regions: ['amygdala'], note: B('A fast route from the thalamus to the amygdala starts fear quickly; a slower route goes through the cortex.', 'מסלול מהיר מהתלמוס לאמיגדלה מפעיל פחד במהירות; מסלול איטי יותר עובר דרך הקליפה.') },
    system: { s: 'ans', acts: ['Fight or flight'], note: B('Heart races, pupils widen — the body is ready to act.', 'הלב דוהר, האישונים מתרחבים — הגוף מוכן לפעולה.') },
    organism: { s: 'memory', acts: ['A frightening moment'], note: B('The amygdala makes frightening events memorable.', 'האמיגדלה הופכת אירועים מפחידים לזכירים.') },
  }),
];

export const effectById = Object.fromEntries(EFFECTS.map((e) => [e.id, e]));
