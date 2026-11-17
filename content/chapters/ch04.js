// Format explained at the top of ch01.js
export default {
  n: 4,
  icon: '💊',
  color: '#eb5757',
  title: { en: 'Psychopharmacology', he: 'פסיכופרמקולוגיה' },
  intro: {
    en: 'The brain\'s chemical messengers, how drugs act at synapses, and the effects of common psychoactive drugs.',
    he: 'השליחים הכימיים של המוח, איך תרופות וסמים פועלים בסינפסות, והשפעות של חומרים פסיכואקטיביים נפוצים.',
  },
  lessons: [
    {
      title: { en: 'Neurotransmitters and their jobs', he: 'מוליכים עצביים ותפקידיהם' },
      diagram: 'neurotransmitters',
      regions: ['substantiaNigra', 'vta', 'nucleusAccumbens'],
      body: {
        en: [
          'Chemical messengers come in three kinds: **neurotransmitters** act across a single synapse; **neuromodulators** spread more widely and tune the activity of many neurons; **neurohormones** are released into the blood and act far away. To count as a neurotransmitter, a chemical must be made in the neuron, released when it fires, act on receptors, and be removed afterwards.',
          '## The main groups',
          '**Acetylcholine (ACh)** makes skeletal muscles contract and, in the brain, supports attention, learning and memory (ACh neurons are lost in Alzheimer\'s). Its receptors are **nicotinic** (activated by nicotine) and **muscarinic**.',
          '**Monoamines**: **dopamine** (movement, reward, attention — linked to Parkinson\'s, addiction and schizophrenia), **norepinephrine** (arousal, vigilance), **serotonin** (mood, sleep, appetite, aggression — the target of many antidepressants), and **histamine** (wakefulness — which is why antihistamines make you sleepy).',
          '**Amino acids**: **glutamate** is the main **excitatory** neurotransmitter of the brain; **GABA** is the main **inhibitory** one (alcohol and anti-anxiety drugs like benzodiazepines enhance GABA); glycine is inhibitory in the spinal cord.',
          '**Neuropeptides** include the **endorphins** (the body\'s own opioids, which reduce pain) and **substance P** (pain signalling). Others: **gasotransmitters** such as nitric oxide, **ATP/adenosine** (adenosine builds sleep pressure; caffeine blocks it), and **endocannabinoids** such as anandamide, which travel backward across the synapse.',
        ],
        he: [
          'שליחים כימיים מגיעים בשלושה סוגים: **מוליכים עצביים** פועלים על פני סינפסה אחת; **נוירומודולטורים** מתפשטים רחב יותר ומכווננים את פעילותם של נוירונים רבים; **נוירו-הורמונים** משתחררים לדם ופועלים במקום רחוק. כדי להיחשב מוליך עצבי, חומר כימי חייב להיווצר בנוירון, להשתחרר כשהוא יורה, לפעול על קולטנים ולהיות מסולק לאחר מכן.',
          '## הקבוצות העיקריות',
          '**אצטילכולין (ACh)** גורם לשרירי השלד להתכווץ, ובמוח תומך בקשב, למידה וזיכרון (נוירוני ACh אובדים באלצהיימר). הקולטנים שלו הם **ניקוטיניים** (מופעלים על ידי ניקוטין) ו**מוסקריניים**.',
          '**מונואמינים**: **דופמין** (תנועה, תגמול, קשב — קשור לפרקינסון, להתמכרות ולסכיזופרניה), **נוראפינפרין** (עוררות, דריכות), **סרוטונין** (מצב רוח, שינה, תיאבון, תוקפנות — המטרה של תרופות נוגדות דיכאון רבות), ו**היסטמין** (ערנות — ולכן אנטי-היסטמינים מרדימים).',
          '**חומצות אמינו**: **גלוטמט** הוא המוליך העצבי **המעורר** העיקרי במוח; **GABA** הוא **המעכב** העיקרי (אלכוהול ותרופות נגד חרדה כמו בנזודיאזפינים מגבירים את GABA); גליצין מעכב בחוט השדרה.',
          '**נוירופפטידים** כוללים את **האנדורפינים** (האופיואידים של הגוף עצמו, שמפחיתים כאב) ו**חומר P** (העברת כאב). אחרים: **מוליכים גזיים** כמו תחמוצת החנקן, **ATP/אדנוזין** (אדנוזין בונה לחץ שינה; קפאין חוסם אותו), ו**אנדוקנבינואידים** כמו אננדמיד, שנעים לאחור על פני הסינפסה.',
        ],
      },
      points: {
        en: ['Glutamate = main excitatory; GABA = main inhibitory.', 'Dopamine: movement and reward. Serotonin: mood, sleep, appetite.', 'Acetylcholine: muscles, attention and memory.', 'Endorphins are natural painkillers; adenosine builds sleepiness.'],
        he: ['גלוטמט = המעורר העיקרי; GABA = המעכב העיקרי.', 'דופמין: תנועה ותגמול. סרוטונין: מצב רוח, שינה, תיאבון.', 'אצטילכולין: שרירים, קשב וזיכרון.', 'אנדורפינים הם משככי כאבים טבעיים; אדנוזין בונה ישנוניות.'],
      },
      terms: [
        ['Acetylcholine', 'Neurotransmitter for muscle contraction, attention and memory.', 'אצטילכולין', 'מוליך עצבי להתכווצות שרירים, קשב וזיכרון.'],
        ['Dopamine', 'Monoamine involved in movement, reward and motivation.', 'דופמין', 'מונואמין המעורב בתנועה, בתגמול ובמוטיבציה.'],
        ['Serotonin', 'Monoamine involved in mood, sleep, appetite and aggression.', 'סרוטונין', 'מונואמין המעורב במצב רוח, שינה, תיאבון ותוקפנות.'],
        ['Glutamate', 'The brain\'s main excitatory neurotransmitter.', 'גלוטמט', 'המוליך העצבי המעורר העיקרי במוח.'],
        ['GABA', 'The brain\'s main inhibitory neurotransmitter.', 'GABA', 'המוליך העצבי המעכב העיקרי במוח.'],
        ['Endorphins', 'The body\'s own opioid peptides that reduce pain.', 'אנדורפינים', 'פפטידים אופיואידיים של הגוף עצמו שמפחיתים כאב.'],
      ],
      quiz: [
        ['Which is the brain\'s main INHIBITORY neurotransmitter?', 'מהו המוליך העצבי המעכב העיקרי במוח?', ['Glutamate', 'GABA', 'Dopamine', 'Acetylcholine'], ['גלוטמט', 'GABA', 'דופמין', 'אצטילכולין'], 1, 'GABA inhibits; glutamate excites.', 'GABA מעכב; גלוטמט מעורר.'],
        ['Caffeine keeps you awake mainly by blocking receptors for…', 'קפאין שומר על ערנות בעיקר על ידי חסימת קולטנים ל…', ['serotonin', 'adenosine', 'histamine', 'GABA'], ['סרוטונין', 'אדנוזין', 'היסטמין', 'GABA'], 1, 'Adenosine builds up during waking and promotes sleep; caffeine blocks its receptors.', 'אדנוזין מצטבר בזמן ערות ומקדם שינה; קפאין חוסם את הקולטנים שלו.'],
      ],
    },
    {
      title: { en: 'How drugs act at the synapse', he: 'איך תרופות פועלות בסינפסה' },
      diagram: 'agonist',
      regions: [],
      body: {
        en: [
          'A drug that **boosts** the action of a neurotransmitter is an **agonist**; a drug that **reduces** it is an **antagonist**. Drugs can step in at every stage of synaptic communication:',
          '**Production** — giving a precursor (e.g. **L-DOPA**, which neurons convert to dopamine in Parkinson\'s disease) increases supply. **Storage** — reserpine prevents monoamines from being packed into vesicles. **Release** — black widow spider venom forces acetylcholine release; botulinum toxin (Botox) blocks it, paralysing muscles.',
          '**Receptors** — a drug may bind and activate the receptor (nicotine at nicotinic ACh receptors; morphine at opioid receptors) or bind and block it (curare at muscle ACh receptors; many antipsychotics at dopamine receptors). **Removal** — blocking **reuptake** keeps the neurotransmitter in the synapse longer: SSRIs (like Prozac) block serotonin reuptake, and cocaine blocks dopamine reuptake. Blocking the **enzymes** that break neurotransmitters down (e.g. MAO inhibitors, or acetylcholinesterase inhibitors used in Alzheimer\'s) has a similar effect.',
        ],
        he: [
          'תרופה ש**מגבירה** את פעולת המוליך העצבי היא **אגוניסט**; תרופה ש**מפחיתה** אותה היא **אנטגוניסט**. תרופות יכולות להתערב בכל שלב של התקשורת הסינפטית:',
          '**ייצור** — מתן חומר מוצא (למשל **L-DOPA**, שנוירונים הופכים לדופמין בטיפול בפרקינסון) מגדיל את האספקה. **אחסון** — רזרפין מונע אריזה של מונואמינים בשלפוחיות. **שחרור** — ארס עכביש האלמנה השחורה כופה שחרור של אצטילכולין; רעלן הבוטולינום (בוטוקס) חוסם אותו ומשתק שרירים.',
          '**קולטנים** — תרופה יכולה להיקשר לקולטן ולהפעיל אותו (ניקוטין בקולטני ACh ניקוטיניים; מורפיום בקולטנים לאופיואידים) או להיקשר ולחסום אותו (קורארה בקולטני ACh בשריר; תרופות אנטי-פסיכוטיות רבות בקולטני דופמין). **סילוק** — חסימת **ספיגה חוזרת** משאירה את המוליך העצבי בסינפסה זמן רב יותר: תרופות SSRI (כמו פרוזק) חוסמות ספיגה חוזרת של סרוטונין, וקוקאין חוסם ספיגה חוזרת של דופמין. חסימת **האנזימים** שמפרקים מוליכים עצביים (למשל מעכבי MAO, או מעכבי אצטילכולין-אסטראז המשמשים באלצהיימר) משפיעה באופן דומה.',
        ],
      },
      points: {
        en: ['Agonists boost, antagonists reduce neurotransmitter effects.', 'Drugs act on production, storage, release, receptors or removal.', 'SSRIs and cocaine block reuptake.', 'Botox blocks ACh release; curare blocks ACh receptors.'],
        he: ['אגוניסטים מגבירים, אנטגוניסטים מפחיתים את השפעת המוליך העצבי.', 'תרופות פועלות על ייצור, אחסון, שחרור, קולטנים או סילוק.', 'SSRI וקוקאין חוסמים ספיגה חוזרת.', 'בוטוקס חוסם שחרור ACh; קורארה חוסם קולטני ACh.'],
      },
      terms: [
        ['Agonist', 'A substance that enhances the action of a neurotransmitter.', 'אגוניסט', 'חומר שמגביר את פעולת המוליך העצבי.'],
        ['Antagonist', 'A substance that reduces or blocks the action of a neurotransmitter.', 'אנטגוניסט', 'חומר שמפחית או חוסם את פעולת המוליך העצבי.'],
        ['SSRI', 'Selective serotonin reuptake inhibitor — antidepressant that keeps serotonin in the synapse longer.', 'SSRI', 'מעכב ספיגה חוזרת סלקטיבי של סרוטונין — נוגד דיכאון שמשאיר סרוטונין בסינפסה זמן רב יותר.'],
        ['L-DOPA', 'A dopamine precursor used to treat Parkinson\'s disease.', 'L-DOPA', 'חומר מוצא של דופמין המשמש לטיפול בפרקינסון.'],
      ],
      quiz: [
        ['Cocaine increases dopamine in the synapse mainly by…', 'קוקאין מגדיל דופמין בסינפסה בעיקר על ידי…', ['blocking reuptake', 'blocking receptors', 'preventing release', 'destroying vesicles'], ['חסימת ספיגה חוזרת', 'חסימת קולטנים', 'מניעת שחרור', 'הרס שלפוחיות'], 0, 'Cocaine blocks the dopamine transporter, so dopamine stays longer.', 'קוקאין חוסם את מוביל הדופמין, ולכן הדופמין נשאר זמן רב יותר.'],
        ['Botox paralyses muscles because it…', 'בוטוקס משתק שרירים כי הוא…', ['activates GABA receptors', 'blocks acetylcholine release', 'increases dopamine', 'blocks sodium channels in the brain'], ['מפעיל קולטני GABA', 'חוסם שחרור אצטילכולין', 'מגביר דופמין', 'חוסם תעלות נתרן במוח'], 1, 'Without ACh release, muscles do not receive the signal to contract.', 'ללא שחרור ACh, השרירים לא מקבלים את האות להתכווץ.'],
      ],
    },
    {
      title: { en: 'Drug effects: tolerance, withdrawal and addiction', he: 'השפעות סמים: סבילות, גמילה והתמכרות' },
      diagram: 'reward',
      regions: ['vta', 'nucleusAccumbens', 'frontal'],
      body: {
        en: [
          '## Getting the drug to the brain',
          'How a drug is taken changes how fast and how strongly it acts. Intravenous injection and smoking (through the lungs) reach the brain within seconds; swallowing is slowest because of digestion and the liver. Individual differences — body size, sex, age, genes (for example, liver enzymes) and expectations — also matter. Even a **placebo** (an inactive substance) can produce real effects, partly through the brain\'s own opioids.',
          '## Tolerance and withdrawal',
          '**Tolerance** means needing more of a drug to get the same effect, as the body adapts (e.g. fewer receptors or faster breakdown). **Withdrawal** symptoms appear when the drug is stopped and are usually the opposite of the drug\'s effects. Tolerance is also partly learned: taking a drug in a familiar setting triggers compensating responses — so the same dose in a new environment can be more dangerous (overdose).',
          '## Addiction',
          '**Addiction** is compulsive drug use despite harm. Nearly all addictive drugs increase **dopamine** release in the **nucleus accumbens**, via the **mesolimbic pathway** from the VTA. Over time, the brain shifts from "liking" to "wanting", and the prefrontal cortex\'s control over impulses weakens. Genes account for a substantial part of the risk. Interestingly, some Parkinson\'s patients treated with dopamine agonists develop compulsive gambling or shopping.',
        ],
        he: [
          '## הדרך של הסם למוח',
          'אופן נטילת הסם משנה עד כמה מהר וחזק הוא פועל. הזרקה לווריד ועישון (דרך הריאות) מגיעים למוח תוך שניות; בליעה היא האיטית ביותר בגלל העיכול והכבד. הבדלים אישיים — גודל גוף, מין, גיל, גנים (למשל אנזימי כבד) וציפיות — משפיעים גם הם. אפילו **פלצבו** (חומר לא פעיל) יכול ליצור השפעות אמיתיות, בין השאר דרך האופיואידים של המוח עצמו.',
          '## סבילות וגמילה',
          '**סבילות (Tolerance)** פירושה צורך ביותר סם כדי לקבל אותה השפעה, כשהגוף מסתגל (למשל פחות קולטנים או פירוק מהיר יותר). **תסמיני גמילה (Withdrawal)** מופיעים כשמפסיקים את הסם, ובדרך כלל הם הפוכים להשפעות הסם. סבילות היא גם נלמדת בחלקה: נטילת סם בסביבה מוכרת מפעילה תגובות מפצות — ולכן אותה מנה בסביבה חדשה עלולה להיות מסוכנת יותר (מנת יתר).',
          '## התמכרות',
          '**התמכרות** היא שימוש כפייתי בסם למרות הנזק. כמעט כל הסמים הממכרים מגבירים שחרור **דופמין** ב**גרעין האקומבנס**, דרך **המסלול המזולימבי** מה-VTA. עם הזמן המוח עובר מ"לאהוב" ל"לרצות", והשליטה של הקליפה הקדם-מצחית בדחפים נחלשת. גנים אחראים לחלק ניכר מהסיכון. מעניין שחלק מחולי פרקינסון המטופלים באגוניסטים לדופמין מפתחים הימורים או קניות כפייתיים.',
        ],
      },
      points: {
        en: ['Injection and smoking reach the brain fastest.', 'Tolerance: more drug needed for the same effect; withdrawal: opposite effects when stopping.', 'Tolerance is partly conditioned to the environment.', 'Addictive drugs raise dopamine in the nucleus accumbens.'],
        he: ['הזרקה ועישון מגיעים למוח הכי מהר.', 'סבילות: צריך יותר סם לאותה השפעה; גמילה: השפעות הפוכות כשמפסיקים.', 'סבילות מותנית בחלקה בסביבה.', 'סמים ממכרים מעלים דופמין בגרעין האקומבנס.'],
      },
      terms: [
        ['Tolerance', 'Reduced response to a drug after repeated use.', 'סבילות', 'תגובה מופחתת לסם לאחר שימוש חוזר.'],
        ['Withdrawal', 'Unpleasant symptoms, often opposite to the drug\'s effects, when use stops.', 'גמילה (תסמיני)', 'תסמינים לא נעימים, לרוב הפוכים להשפעות הסם, כשהשימוש נפסק.'],
        ['Placebo', 'An inactive substance that can still produce effects through expectation.', 'פלצבו', 'חומר לא פעיל שבכל זאת יכול ליצור השפעות דרך ציפייה.'],
        ['Mesolimbic pathway', 'Dopamine pathway from the VTA to the nucleus accumbens; central to reward and addiction.', 'המסלול המזולימבי', 'מסלול דופמין מה-VTA לגרעין האקומבנס; מרכזי לתגמול ולהתמכרות.'],
      ],
      quiz: [
        ['Which route usually gets a drug to the brain most slowly?', 'איזו דרך נטילה בדרך כלל מביאה סם למוח הכי לאט?', ['Smoking', 'Intravenous injection', 'Swallowing', 'Inhaling'], ['עישון', 'הזרקה לווריד', 'בליעה', 'שאיפה'], 2, 'Swallowed drugs must pass through digestion and the liver first.', 'סם שנבלע חייב לעבור קודם דרך העיכול והכבד.'],
        ['Why can a usual dose cause overdose in an unfamiliar place?', 'מדוע מנה רגילה עלולה לגרום למנת יתר במקום לא מוכר?', ['The drug is stronger there', 'Learned compensatory responses are not triggered', 'Withdrawal is faster', 'Placebo effects increase'], ['הסם חזק יותר שם', 'תגובות מפצות נלמדות אינן מופעלות', 'הגמילה מהירה יותר', 'השפעות הפלצבו גדלות'], 1, 'Part of tolerance is conditioned to familiar cues.', 'חלק מהסבילות מותנה ברמזים מוכרים.'],
      ],
    },
    {
      title: { en: 'Psychoactive drugs', he: 'חומרים פסיכואקטיביים' },
      diagram: null,
      regions: ['nucleusAccumbens', 'pag', 'medulla', 'hippocampus', 'cerebellum'],
      body: {
        en: [
          '## Stimulants',
          '**Caffeine** blocks adenosine receptors. **Nicotine** activates nicotinic acetylcholine receptors and indirectly releases dopamine; it is extremely addictive. **Cocaine** blocks reuptake of dopamine (and serotonin and norepinephrine). **Amphetamine** and **methamphetamine** make neurons release dopamine and norepinephrine and also block reuptake; heavy use can damage dopamine neurons and cause psychosis. **MDMA (ecstasy)** releases large amounts of serotonin and may damage serotonin neurons.',
          '## Opiates',
          '**Opium, morphine and heroin** act on opioid receptors, mimicking endorphins. They relieve pain (partly via the periaqueductal gray), produce euphoria, and slow breathing — which makes overdose deadly. Tolerance and withdrawal are strong.',
          '## Marijuana and hallucinogens',
          '**THC**, the main active compound in marijuana, acts on **cannabinoid (CB1) receptors**, which are dense in the hippocampus, cerebellum and basal ganglia — explaining effects on memory, coordination and time perception. It has medical uses (nausea, appetite, pain). Classic hallucinogens like **LSD** and **psilocybin** act mainly on serotonin receptors; **PCP** and **ketamine** block glutamate NMDA receptors.',
          '## Depressants and herbs',
          '**Alcohol** enhances GABA and blocks glutamate receptors, acting as a depressant; heavy long-term use damages the brain, and drinking in pregnancy can cause **fetal alcohol syndrome**. **St. John\'s Wort**, an herbal remedy, has mild antidepressant effects but interacts dangerously with many medicines.',
        ],
        he: [
          '## ממריצים',
          '**קפאין** חוסם קולטני אדנוזין. **ניקוטין** מפעיל קולטני אצטילכולין ניקוטיניים ומשחרר דופמין בעקיפין; הוא ממכר מאוד. **קוקאין** חוסם ספיגה חוזרת של דופמין (וגם סרוטונין ונוראפינפרין). **אמפטמין** ו**מתאמפטמין** גורמים לנוירונים לשחרר דופמין ונוראפינפרין וגם חוסמים ספיגה חוזרת; שימוש כבד עלול לפגוע בנוירוני דופמין ולגרום לפסיכוזה. **MDMA (אקסטזי)** משחרר כמויות גדולות של סרוטונין ועלול לפגוע בנוירוני סרוטונין.',
          '## אופיאטים',
          '**אופיום, מורפיום והרואין** פועלים על קולטנים לאופיואידים ומחקים את האנדורפינים. הם משככים כאב (בין השאר דרך החומר האפור סביב אמת המים), גורמים לאופוריה ומאטים את הנשימה — מה שהופך מנת יתר לקטלנית. הסבילות והגמילה חזקות.',
          '## מריחואנה וחומרים הזייתיים',
          '**THC**, החומר הפעיל העיקרי במריחואנה, פועל על **קולטני קנבינואידים (CB1)**, הצפופים בהיפוקמפוס, במוח הקטן ובגרעינים הבסיסיים — מה שמסביר השפעות על זיכרון, קואורדינציה ותפיסת זמן. יש לו שימושים רפואיים (בחילה, תיאבון, כאב). חומרים הזייתיים קלאסיים כמו **LSD** ו**פסילוסיבין** פועלים בעיקר על קולטני סרוטונין; **PCP** ו**קטמין** חוסמים קולטני גלוטמט מסוג NMDA.',
          '## מדכאים וצמחים',
          '**אלכוהול** מגביר את GABA וחוסם קולטני גלוטמט, ופועל כמדכא; שימוש כבד לאורך זמן פוגע במוח, ושתייה בהיריון עלולה לגרום ל**תסמונת אלכוהול עוברית**. **היפריקום (St. John\'s Wort)**, תרופה צמחית, בעל השפעה נוגדת דיכאון קלה אך מגיב באופן מסוכן עם תרופות רבות.',
        ],
      },
      points: {
        en: ['Stimulants raise dopamine/norepinephrine activity.', 'Opiates mimic endorphins and can stop breathing in overdose.', 'THC acts on CB1 receptors in hippocampus, cerebellum and basal ganglia.', 'Alcohol enhances GABA and blocks glutamate.'],
        he: ['ממריצים מגבירים פעילות דופמין/נוראפינפרין.', 'אופיאטים מחקים אנדורפינים ועלולים לעצור נשימה במנת יתר.', 'THC פועל על קולטני CB1 בהיפוקמפוס, במוח הקטן ובגרעינים הבסיסיים.', 'אלכוהול מגביר GABA וחוסם גלוטמט.'],
      },
      terms: [
        ['Stimulant', 'A drug that increases alertness and arousal (e.g. caffeine, cocaine, amphetamine).', 'ממריץ', 'סם שמגביר ערנות ועוררות (למשל קפאין, קוקאין, אמפטמין).'],
        ['Opiates', 'Drugs from the opium poppy (morphine, heroin) acting on opioid receptors.', 'אופיאטים', 'סמים מפרג האופיום (מורפיום, הרואין) הפועלים על קולטנים לאופיואידים.'],
        ['THC', 'Main psychoactive compound in marijuana; acts on cannabinoid receptors.', 'THC', 'החומר הפסיכואקטיבי העיקרי במריחואנה; פועל על קולטני קנבינואידים.'],
        ['Fetal alcohol syndrome', 'Birth defects, including brain damage, caused by alcohol during pregnancy.', 'תסמונת אלכוהול עוברית', 'מומים מולדים, כולל נזק מוחי, שנגרמים מאלכוהול בזמן היריון.'],
      ],
      quiz: [
        ['Why is an opiate overdose often fatal?', 'מדוע מנת יתר של אופיאטים קטלנית לעיתים קרובות?', ['It stops the heart directly', 'It suppresses breathing', 'It causes seizures', 'It destroys the cerebellum'], ['הוא עוצר את הלב ישירות', 'הוא מדכא את הנשימה', 'הוא גורם לפרכוסים', 'הוא הורס את המוח הקטן'], 1, 'Opioid receptors in the brainstem slow respiration.', 'קולטנים לאופיואידים בגזע המוח מאטים את הנשימה.'],
        ['Marijuana affects memory because CB1 receptors are dense in the…', 'מריחואנה משפיעה על הזיכרון כי קולטני CB1 צפופים ב…', ['hippocampus', 'medulla', 'spinal cord', 'optic chiasm'], ['היפוקמפוס', 'מוח המוארך', 'חוט השדרה', 'מצטלבת הראייה'], 0, 'The hippocampus is key for forming new memories.', 'ההיפוקמפוס חיוני ליצירת זיכרונות חדשים.'],
      ],
    },
  ],
};
