// Format explained at the top of ch01.js
export default {
  n: 5,
  icon: '🧬',
  color: '#27ae60',
  title: { en: 'Genetics and the Development of the Human Brain', he: 'גנטיקה והתפתחות המוח האנושי' },
  intro: {
    en: 'How genes build proteins, how heredity and environment interact, and how the brain grows, changes and ages.',
    he: 'איך גנים בונים חלבונים, איך תורשה וסביבה משפיעות זו על זו, ואיך המוח גדל, משתנה ומזדקן.',
  },
  lessons: [
    {
      title: { en: 'Genes, proteins and heredity', he: 'גנים, חלבונים ותורשה' },
      diagram: 'dna',
      regions: [],
      body: {
        en: [
          'Each human cell (except eggs and sperm) contains **23 pairs of chromosomes** — one of each pair from each parent. Chromosomes are long strands of **DNA**, and a **gene** is a section of DNA that holds the recipe for a protein. Proteins do almost everything in a cell: they build structures, act as enzymes, receptors and channels.',
          'To make a protein, the gene is copied into **messenger RNA** (**transcription**), which travels out of the nucleus to a ribosome where it is read in three-letter codes to string together amino acids (**translation**). Genes can be switched on or off; **epigenetics** studies chemical marks (like methylation) that change gene activity without changing the DNA sequence — and these can be influenced by experience such as stress or diet.',
          '## Genetic diversity',
          'Different versions of a gene are **alleles**. A **dominant** allele shows its effect even with one copy; a **recessive** allele needs two copies (as in phenylketonuria, PKU). Diversity comes from mixing of chromosomes during sex-cell formation (crossing over), from **mutations**, and from sex-linked genes on the X chromosome (which is why X-linked conditions like colour-blindness are more common in males).',
          '## Heredity and environment',
          '**Heritability** estimates how much of the variation of a trait in a population is due to genes. It is studied with **twin** and **adoption** studies. Genes and environment always work together: for example, the effect of PKU is prevented by a special diet.',
        ],
        he: [
          'כל תא אנושי (חוץ מביציות וזרע) מכיל **23 זוגות כרומוזומים** — אחד מכל זוג מכל הורה. כרומוזומים הם גדילים ארוכים של **DNA**, ו**גן** הוא קטע DNA שמכיל את "המתכון" לחלבון. חלבונים עושים כמעט הכול בתא: הם בונים מבנים ומשמשים כאנזימים, קולטנים ותעלות.',
          'כדי לייצר חלבון, הגן מועתק ל**RNA שליח** (**שעתוק**), שיוצא מהגרעין לריבוזום שבו הוא נקרא בקודים של שלוש אותיות כדי לשרשר חומצות אמינו (**תרגום**). גנים יכולים להיות מופעלים או מושבתים; **אפיגנטיקה** חוקרת סימנים כימיים (כמו מתילציה) שמשנים את פעילות הגנים בלי לשנות את רצף ה-DNA — ואלה יכולים להיות מושפעים מחוויות כמו לחץ או תזונה.',
          '## מגוון גנטי',
          'גרסאות שונות של גן הן **אללים**. אלל **דומיננטי** מראה את השפעתו אפילו בעותק אחד; אלל **רצסיבי** זקוק לשני עותקים (כמו בפנילקטונוריה, PKU). המגוון נוצר מערבוב כרומוזומים ביצירת תאי המין (שחלוף), מ**מוטציות** ומגנים הקשורים למין על כרומוזום X (ולכן מצבים הקשורים ל-X כמו עיוורון צבעים נפוצים יותר בזכרים).',
          '## תורשה וסביבה',
          '**תורשתיות** מעריכה איזה חלק מהשונות בתכונה באוכלוסייה נובע מגנים. היא נחקרת באמצעות מחקרי **תאומים** ו**אימוץ**. גנים וסביבה תמיד פועלים יחד: למשל, נזקי PKU נמנעים בעזרת דיאטה מיוחדת.',
        ],
      },
      points: {
        en: ['23 chromosome pairs; genes are recipes for proteins.', 'DNA → mRNA (transcription) → protein (translation).', 'Dominant vs recessive alleles; X-linked traits are more common in males.', 'Epigenetics: experience can change how genes are expressed.'],
        he: ['23 זוגות כרומוזומים; גנים הם מתכונים לחלבונים.', 'DNA ← RNA שליח (שעתוק) ← חלבון (תרגום).', 'אללים דומיננטיים מול רצסיביים; תכונות הקשורות ל-X נפוצות יותר בזכרים.', 'אפיגנטיקה: חוויות יכולות לשנות את ביטוי הגנים.'],
      },
      terms: [
        ['Gene', 'A segment of DNA that codes for a protein.', 'גן', 'קטע DNA שמקודד לחלבון.'],
        ['Allele', 'One of the alternative versions of a gene.', 'אלל', 'אחת הגרסאות האפשריות של גן.'],
        ['Transcription', 'Copying a gene\'s DNA into messenger RNA.', 'שעתוק', 'העתקת ה-DNA של גן ל-RNA שליח.'],
        ['Epigenetics', 'Changes in gene activity that do not alter the DNA sequence.', 'אפיגנטיקה', 'שינויים בפעילות גנים שאינם משנים את רצף ה-DNA.'],
        ['Heritability', 'The proportion of variation in a trait within a population due to genetic differences.', 'תורשתיות', 'החלק מהשונות בתכונה באוכלוסייה שנובע מהבדלים גנטיים.'],
      ],
      quiz: [
        ['A recessive trait appears when a person has…', 'תכונה רצסיבית מופיעה כשלאדם יש…', ['one copy of the allele', 'two copies of the allele', 'any mutation', 'an extra chromosome'], ['עותק אחד של האלל', 'שני עותקים של האלל', 'מוטציה כלשהי', 'כרומוזום נוסף'], 1, 'Recessive alleles need two copies to be expressed.', 'אללים רצסיביים צריכים שני עותקים כדי להתבטא.'],
        ['Why are X-linked conditions such as red-green colour blindness more common in males?', 'מדוע מצבים הקשורים ל-X, כמו עיוורון צבעים, נפוצים יותר בזכרים?', ['Males have one X chromosome', 'Males have two X chromosomes', 'The Y chromosome causes them', 'Hormones cause them'], ['לזכרים כרומוזום X אחד', 'לזכרים שני כרומוזומי X', 'כרומוזום Y גורם להם', 'הורמונים גורמים להם'], 0, 'With only one X, there is no second copy to compensate.', 'עם X אחד בלבד, אין עותק שני שיפצה.'],
      ],
    },
    {
      title: { en: 'How the nervous system is built', he: 'איך נבנית מערכת העצבים' },
      diagram: 'development',
      regions: [],
      body: {
        en: [
          'About three weeks after conception, a flat plate of cells (the **neural plate**) folds into the **neural tube**. Its front end becomes the brain — first three swellings (forebrain, midbrain, hindbrain) — and the rest becomes the spinal cord. If the tube does not close properly, defects such as **spina bifida** result; folic acid in the mother\'s diet lowers this risk.',
          '## Six stages of brain building',
          '1) **Neurogenesis** — new neurons are born from progenitor cells lining the ventricles, at an astonishing rate (up to about 250,000 per minute at peak). 2) **Migration** — young neurons travel to their final positions, often climbing along **radial glia** like ropes; the cortex is built inside-out. 3) **Differentiation** — neurons become specific types. 4) **Axon growth and synapse formation** — axon tips (**growth cones**) are guided by chemical attractants and repellents to their targets. 5) **Cell death (apoptosis)** — about half of the neurons produced die; those that receive enough **neurotrophins** (such as nerve growth factor) from their targets survive. 6) **Synaptic pruning** — extra synapses are removed according to use, and **myelination** continues into the twenties, with the prefrontal cortex finishing last.',
        ],
        he: [
          'כשלושה שבועות לאחר ההפריה, לוח שטוח של תאים (**הלוח העצבי**) מתקפל ל**צינור העצבי**. הקצה הקדמי שלו הופך למוח — תחילה שלוש התנפחויות (מוח קדמי, אמצעי ואחורי) — והשאר הופך לחוט השדרה. אם הצינור לא נסגר כראוי נוצרים מומים כמו **ספינה ביפידה (שדרה שסועה)**; חומצה פולית בתזונת האם מפחיתה סיכון זה.',
          '## שישה שלבים בבניית המוח',
          '1) **נוירוגנזה** — נוירונים חדשים נולדים מתאי אב שמרפדים את החדרים, בקצב מדהים (עד כ-250,000 בדקה בשיא). 2) **נדידה** — נוירונים צעירים נודדים למקומם הסופי, לרוב כשהם מטפסים לאורך **גליה רדיאלית** כמו על חבלים; הקליפה נבנית מבפנים החוצה. 3) **התמיינות** — הנוירונים הופכים לסוגים מסוימים. 4) **צמיחת אקסונים ויצירת סינפסות** — קצות האקסונים (**חרוטי גדילה**) מונחים על ידי חומרים כימיים מושכים ודוחים אל מטרותיהם. 5) **מוות תאים (אפופטוזיס)** — כמחצית מהנוירונים שנוצרים מתים; אלה שמקבלים מספיק **נוירוטרופינים** (כמו גורם גדילה עצבי) ממטרותיהם שורדים. 6) **גיזום סינפטי** — סינפסות עודפות מוסרות בהתאם לשימוש, ו**מיאלינציה** נמשכת עד שנות העשרים, כשהקליפה הקדם-מצחית מסיימת אחרונה.',
        ],
      },
      points: {
        en: ['Neural plate → neural tube → brain and spinal cord.', 'Neurogenesis, migration, differentiation, axon growth, apoptosis, pruning.', 'Neurotrophins decide which neurons survive.', 'Myelination of the prefrontal cortex continues into the 20s.'],
        he: ['לוח עצבי ← צינור עצבי ← מוח וחוט שדרה.', 'נוירוגנזה, נדידה, התמיינות, צמיחת אקסונים, אפופטוזיס, גיזום.', 'נוירוטרופינים קובעים אילו נוירונים ישרדו.', 'המיאלינציה של הקליפה הקדם-מצחית נמשכת עד שנות ה-20.'],
      },
      terms: [
        ['Neural tube', 'Embryonic tube that develops into the brain and spinal cord.', 'הצינור העצבי', 'צינור עוברי שמתפתח למוח ולחוט השדרה.'],
        ['Neurogenesis', 'The birth of new neurons.', 'נוירוגנזה', 'היווצרות נוירונים חדשים.'],
        ['Radial glia', 'Glial cells that act as guide ropes for migrating neurons.', 'גליה רדיאלית', 'תאי גליה שמשמשים כחבלי הנחיה לנוירונים נודדים.'],
        ['Apoptosis', 'Programmed cell death.', 'אפופטוזיס', 'מוות תאים מתוכנת.'],
        ['Neurotrophins', 'Chemicals (e.g. nerve growth factor) that help neurons survive and grow.', 'נוירוטרופינים', 'חומרים (למשל גורם גדילה עצבי) שעוזרים לנוירונים לשרוד ולגדול.'],
        ['Synaptic pruning', 'Removal of unused synapses during development.', 'גיזום סינפטי', 'הסרת סינפסות שאינן בשימוש במהלך ההתפתחות.'],
      ],
      quiz: [
        ['Roughly what proportion of neurons produced during development die?', 'בערך איזה חלק מהנוירונים שנוצרים בהתפתחות מתים?', ['Almost none', 'About half', 'All but 1%', 'Exactly 10%'], ['כמעט אף אחד', 'כמחצית', 'כולם חוץ מ-1%', 'בדיוק 10%'], 1, 'Around 50% die by apoptosis — those without enough neurotrophins.', 'כ-50% מתים באפופטוזיס — אלה שלא קיבלו מספיק נוירוטרופינים.'],
        ['Which brain region is among the LAST to finish myelination?', 'איזה אזור מוח מסיים מיאלינציה בין האחרונים?', ['Medulla', 'Prefrontal cortex', 'Spinal cord', 'Primary visual cortex'], ['המוח המוארך', 'הקליפה הקדם-מצחית', 'חוט השדרה', 'קליפת הראייה הראשונית'], 1, 'The prefrontal cortex matures into the twenties.', 'הקליפה הקדם-מצחית מבשילה עד שנות העשרים.'],
      ],
    },
    {
      title: { en: 'Experience, developmental disorders and repair', he: 'חוויה, הפרעות התפתחותיות ותיקון' },
      diagram: null,
      regions: ['occipital', 'hippocampus'],
      body: {
        en: [
          '## Experience shapes the brain',
          'Some abilities depend on input during a **critical (sensitive) period**. Hubel and Wiesel showed that if one eye of a kitten is kept closed early in life, the visual cortex is rewired to respond almost only to the open eye — permanently. Rats raised in **enriched environments** (toys, companions, space) develop thicker cortex and more synapses. Children severely deprived early in life (such as in poorly run orphanages) may show lasting effects.',
          '## Disorders of brain development',
          'Genetic causes include **Down syndrome** (an extra chromosome 21), **fragile X syndrome**, and PKU. Environmental causes include **fetal alcohol syndrome**, infections (such as rubella), and toxins such as lead. Autism and schizophrenia are also seen as developmental disorders (see chapter 16).',
          '## Responding to damage',
          'Damaged axons in the PNS can regrow, guided by Schwann cells. In the CNS, regrowth is much more limited, partly because of inhibitory molecules and scar tissue. Yet the brain can **reorganize** — undamaged areas can take over some functions, especially in children (**neural plasticity**).',
        ],
        he: [
          '## חוויה מעצבת את המוח',
          'יכולות מסוימות תלויות בקלט במהלך **תקופה קריטית (רגישה)**. הובל ויזל הראו שאם עין אחת של גור חתולים נשמרת סגורה בתחילת החיים, קליפת הראייה מתחווטת מחדש כך שהיא מגיבה כמעט רק לעין הפתוחה — לצמיתות. חולדות שגדלו ב**סביבה מועשרת** (צעצועים, חברים, מרחב) מפתחות קליפה עבה יותר ויותר סינפסות. ילדים שחוו קיפוח קשה בתחילת החיים (למשל בבתי יתומים מוזנחים) עלולים להראות השפעות מתמשכות.',
          '## הפרעות בהתפתחות המוח',
          'גורמים גנטיים כוללים **תסמונת דאון** (כרומוזום 21 נוסף), **תסמונת X שביר** ו-PKU. גורמים סביבתיים כוללים **תסמונת אלכוהול עוברית**, זיהומים (כמו אדמת) ורעלנים כמו עופרת. אוטיזם וסכיזופרניה נחשבים גם הם להפרעות התפתחותיות (ראו פרק 16).',
          '## תגובה לנזק',
          'אקסונים פגועים במערכת העצבים ההיקפית יכולים לצמוח מחדש בהנחיית תאי שוואן. במערכת העצבים המרכזית הצמיחה מחדש מוגבלת הרבה יותר, בין השאר בגלל מולקולות מעכבות ורקמת צלקת. ועדיין המוח יכול **להתארגן מחדש** — אזורים שלא נפגעו יכולים לקבל על עצמם חלק מהתפקודים, במיוחד אצל ילדים (**גמישות עצבית, Plasticity**).',
        ],
      },
      points: {
        en: ['Critical periods: input at the right time is needed (Hubel & Wiesel).', 'Enriched environments increase synapses and cortical thickness.', 'Down syndrome = extra chromosome 21.', 'PNS axons regrow better than CNS axons; the brain can reorganize (plasticity).'],
        he: ['תקופות קריטיות: נדרש קלט בזמן הנכון (הובל וויזל).', 'סביבה מועשרת מגדילה מספר סינפסות ועובי קליפה.', 'תסמונת דאון = כרומוזום 21 נוסף.', 'אקסונים היקפיים צומחים מחדש טוב יותר ממרכזיים; המוח יכול להתארגן מחדש (גמישות).'],
      },
      terms: [
        ['Critical period', 'A time window when specific experience is needed for normal development.', 'תקופה קריטית', 'חלון זמן שבו חוויה מסוימת נחוצה להתפתחות תקינה.'],
        ['Enriched environment', 'Housing with toys, companions and space that increases brain growth in animals.', 'סביבה מועשרת', 'סביבת מחיה עם צעצועים, חברים ומרחב שמגבירה גדילת מוח בבעלי חיים.'],
        ['Down syndrome', 'A condition caused by an extra copy of chromosome 21.', 'תסמונת דאון', 'מצב שנגרם מעותק נוסף של כרומוזום 21.'],
        ['Neural plasticity', 'The nervous system\'s ability to change with experience or after damage.', 'גמישות עצבית', 'יכולתה של מערכת העצבים להשתנות בעקבות חוויה או לאחר נזק.'],
      ],
      quiz: [
        ['Hubel and Wiesel\'s kitten studies showed that…', 'מחקרי הגורים של הובל וויזל הראו ש…', ['vision is fully innate', 'early visual experience shapes the visual cortex', 'adult cats grow new eyes', 'neurons never die'], ['הראייה מולדת לחלוטין', 'חוויה חזותית מוקדמת מעצבת את קליפת הראייה', 'חתולים בוגרים מצמיחים עיניים חדשות', 'נוירונים לעולם אינם מתים'], 1, 'Closing one eye during the critical period rewired the cortex permanently.', 'סגירת עין אחת בתקופה הקריטית חיווטה מחדש את הקליפה לצמיתות.'],
      ],
    },
    {
      title: { en: 'The adult and aging brain', he: 'המוח הבוגר והמזדקן' },
      diagram: null,
      regions: ['hippocampus', 'frontal'],
      body: {
        en: [
          'For a long time scientists believed adults could not grow new neurons. We now know that **adult neurogenesis** occurs, especially in the **hippocampus** (and in animals, in the olfactory bulb). Exercise and learning increase it, while stress reduces it. (Today: how much of it continues in adult humans is debated: some studies of human brains find very few new neurons after childhood, others find many.)',
          'With normal aging, the brain loses some volume — especially in the frontal lobes and hippocampus — and processing slows, while knowledge and vocabulary are often preserved. Staying physically active, mentally engaged and socially connected, and controlling blood pressure, are linked to healthier brain aging. Calorie restriction lengthens life in some animals, but whether it works in humans is uncertain.',
          '## Alzheimer\'s disease',
          '**Alzheimer\'s disease** is the most common cause of **dementia**. The brain develops **amyloid plaques** (clumps of beta-amyloid protein between cells) and **neurofibrillary tangles** (twisted tau protein inside cells), and acetylcholine neurons are lost. Memory problems come first, as the hippocampus and nearby cortex are affected early. Current drugs (such as acetylcholinesterase inhibitors) slow symptoms only slightly; researchers are working on treatments aimed at amyloid and tau.',
        ],
        he: [
          'במשך זמן רב מדענים האמינו שמבוגרים אינם יכולים לייצר נוירונים חדשים. היום אנו יודעים ש**נוירוגנזה בבגרות** מתרחשת, במיוחד ב**היפוקמפוס** (ובבעלי חיים, בפקעת הריח). פעילות גופנית ולמידה מגבירות אותה, ואילו לחץ מפחית אותה. (כיום: עד כמה היא נמשכת אצל בני אדם בוגרים שנוי במחלוקת: חלק מהמחקרים על מוחות אנושיים מוצאים מעט מאוד נוירונים חדשים אחרי הילדות, ואחרים מוצאים רבים.)',
          'בהזדקנות רגילה המוח מאבד מעט נפח — במיוחד באונות המצחיות ובהיפוקמפוס — והעיבוד מאט, אך הידע ואוצר המילים נשמרים לעיתים קרובות. פעילות גופנית, מעורבות מנטלית וחברתית ושליטה בלחץ הדם קשורות להזדקנות מוחית בריאה יותר. הגבלת קלוריות מאריכה חיים אצל בעלי חיים מסוימים, אך לא ברור אם היא פועלת בבני אדם.',
          '## מחלת אלצהיימר',
          '**מחלת אלצהיימר** היא הגורם השכיח ביותר ל**דמנציה (שיטיון)**. במוח מתפתחים **רבדים עמילואידיים** (גושים של חלבון בטא-עמילואיד בין התאים) ו**סבכים נוירופיברילריים** (חלבון טאו מפותל בתוך התאים), ונוירוני אצטילכולין אובדים. בעיות זיכרון מופיעות ראשונות, כי ההיפוקמפוס והקליפה הסמוכה נפגעים מוקדם. התרופות הקיימות (כמו מעכבי אצטילכולין-אסטראז) מאטות את התסמינים רק במעט; חוקרים עובדים על טיפולים המכוונים לעמילואיד ולטאו.',
        ],
      },
      points: {
        en: ['Adults grow new neurons in the hippocampus; exercise helps, stress hurts.', 'Normal aging: some volume loss and slower processing.', 'Alzheimer\'s: amyloid plaques + tau tangles + loss of ACh neurons.', 'Memory is affected first in Alzheimer\'s.'],
        he: ['מבוגרים מייצרים נוירונים חדשים בהיפוקמפוס; פעילות גופנית עוזרת, לחץ מזיק.', 'הזדקנות רגילה: אובדן נפח מסוים ועיבוד איטי יותר.', 'אלצהיימר: רבדים עמילואידיים + סבכי טאו + אובדן נוירוני ACh.', 'הזיכרון נפגע ראשון באלצהיימר.'],
      },
      terms: [
        ['Adult neurogenesis', 'The birth of new neurons in the adult brain, mainly in the hippocampus.', 'נוירוגנזה בבגרות', 'היווצרות נוירונים חדשים במוח הבוגר, בעיקר בהיפוקמפוס.'],
        ['Dementia', 'Serious decline in memory and thinking that interferes with daily life.', 'דמנציה (שיטיון)', 'ירידה חמורה בזיכרון ובחשיבה שפוגעת בחיי היומיום.'],
        ['Amyloid plaques', 'Clumps of beta-amyloid protein between neurons, typical of Alzheimer\'s.', 'רבדים עמילואידיים', 'גושים של חלבון בטא-עמילואיד בין נוירונים, אופייניים לאלצהיימר.'],
        ['Neurofibrillary tangles', 'Twisted tau protein inside neurons, typical of Alzheimer\'s.', 'סבכים נוירופיברילריים', 'חלבון טאו מפותל בתוך נוירונים, אופייני לאלצהיימר.'],
      ],
      quiz: [
        ['Where does adult neurogenesis mainly occur in humans?', 'היכן מתרחשת בעיקר נוירוגנזה בבגרות בבני אדם?', ['Cerebellum', 'Hippocampus', 'Medulla', 'Corpus callosum'], ['המוח הקטן', 'ההיפוקמפוס', 'המוח המוארך', 'הכפיס'], 1, 'The hippocampus continues to produce new neurons throughout life.', 'ההיפוקמפוס ממשיך לייצר נוירונים חדשים לאורך החיים.'],
        ['Which two abnormalities are hallmarks of Alzheimer\'s disease?', 'אילו שתי חריגות הן סימני ההיכר של מחלת אלצהיימר?', ['Plaques and tangles', 'Lewy bodies and prions', 'Extra chromosome and tumours', 'Strokes and bleeding'], ['רבדים וסבכים', 'גופיפי לואי ופריונים', 'כרומוזום נוסף וגידולים', 'שבצים ודימומים'], 0, 'Amyloid plaques and tau tangles.', 'רבדים עמילואידיים וסבכי טאו.'],
      ],
    },
  ],
};
