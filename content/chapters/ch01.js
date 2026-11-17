// HOW TO EDIT A CHAPTER (same format in every chapter file)
// lessons[]: one learning session each.
//   title   { en, he }
//   diagram id of an illustration (kept for reference; not shown on the site) — or null
//   regions ids of 3D brain parts for the "See it in 3D" button (see content/regions.js)
//   body    { en: [paragraphs], he: [paragraphs] } — a paragraph starting with "## " becomes a heading;
//           **double stars** make text bold
//   points  { en: [...], he: [...] } key points
//   terms   [ [English term, English definition, Hebrew term, Hebrew definition], ... ] → also used as flashcards
//   quiz    [ [question EN, question HE, [options EN], [options HE], index of correct option (0 = first),
//             explanation EN, explanation HE], ... ]

export default {
  n: 1,
  icon: '🔬',
  color: '#6c4cf5',
  title: { en: 'Introducing Biological Psychology', he: 'מבוא לפסיכולוגיה ביולוגית' },
  intro: {
    en: 'How do we study the link between the brain and behaviour? Meet the field, its history, its research tools, and its ethics.',
    he: 'איך חוקרים את הקשר בין המוח להתנהגות? נכיר את התחום, את ההיסטוריה שלו, את כלי המחקר ואת האתיקה שלו.',
  },
  lessons: [
    {
      title: { en: 'A field at the crossroads — and its history', he: 'תחום בצומת דרכים — וההיסטוריה שלו' },
      diagram: 'history',
      regions: [],
      body: {
        en: [
          '**Biological psychology** studies how the brain, nerves, hormones and genes produce our behaviour, thoughts and feelings. It is part of **neuroscience** and is truly interdisciplinary: it borrows from biology, chemistry, medicine, physics, computer science and psychology.',
          '## How ideas about the brain developed',
          'Ancient Egyptian doctors already noticed that head injuries could affect movement, yet they thought the heart was the seat of the mind. **Hippocrates** argued that the brain is the source of thought and emotion. **Galen** (2nd century) believed that fluid in the brain\'s hollow ventricles carried mental functions. **René Descartes** proposed that the mind and body are separate but interact — a position called **dualism** — and pointed to the pineal gland as the meeting point. Most neuroscientists today hold **monism**: the mind is what the brain does.',
          'In the 1800s **Franz Gall\'s phrenology** claimed that bumps on the skull revealed personality. It was wrong, but it planted the idea of **localization of function**: different brain areas do different jobs. **Paul Broca** proved this when he linked a damaged area of the left frontal lobe to the loss of speech. **Fritsch and Hitzig** then showed that electrically stimulating the cortex of a dog produced movement. Finally, **Santiago Ramón y Cajal** used **Camillo Golgi\'s** stain to show that the nervous system is made of separate cells — the **neuron doctrine** — and **Charles Sherrington** named the gap between them the **synapse**.',
        ],
        he: [
          '**פסיכולוגיה ביולוגית** חוקרת כיצד המוח, העצבים, ההורמונים והגנים יוצרים את ההתנהגות, המחשבות והרגשות שלנו. היא חלק מ**מדעי המוח (Neuroscience)** והיא בין-תחומית באמת: היא שואבת מביולוגיה, כימיה, רפואה, פיזיקה, מדעי המחשב ופסיכולוגיה.',
          '## איך התפתחו הרעיונות על המוח',
          'רופאים במצרים העתיקה כבר שמו לב שפגיעות ראש יכולות להשפיע על תנועה, אך הם חשבו שהלב הוא מקום התודעה. **היפוקרטס** טען שהמוח הוא מקור המחשבה והרגש. **גלנוס** (המאה ה-2) האמין שנוזל בחדרי המוח החלולים נושא את התפקודים הנפשיים. **רנה דקארט** הציע שהנפש והגוף נפרדים אך משפיעים זה על זה — עמדה הנקראת **דואליזם** — והצביע על בלוטת האצטרובל כנקודת המפגש. רוב חוקרי המוח כיום מחזיקים ב**מוניזם**: הנפש היא מה שהמוח עושה.',
          'במאה ה-19 טענה **הפרנולוגיה של פרנץ גאל** שבליטות בגולגולת חושפות את האישיות. היא הייתה שגויה, אבל זרעה את רעיון **מיקום התפקודים (Localization of function)**: לאזורי מוח שונים יש תפקידים שונים. **פול ברוקה** הוכיח זאת כשקישר אזור פגוע באונה המצחית השמאלית לאובדן הדיבור. **פריטש והיציג** הראו שגירוי חשמלי של קליפת המוח של כלב מייצר תנועה. לבסוף, **סנטיאגו רמון אי קחאל** השתמש בצביעה של **קמילו גולג\'י** כדי להראות שמערכת העצבים בנויה מתאים נפרדים — **דוקטרינת הנוירון** — ו**צ\'רלס שרינגטון** קרא לרווח ביניהם **סינפסה**.',
        ],
      },
      points: {
        en: ['Biological psychology links brain and body processes to behaviour.', 'Dualism separates mind and brain; monism (today\'s view) says the mind is brain activity.', 'Broca\'s discovery supported localization of function.', 'Cajal\'s neuron doctrine: the nervous system is made of separate cells that communicate at synapses.'],
        he: ['פסיכולוגיה ביולוגית מקשרת בין תהליכים במוח ובגוף לבין התנהגות.', 'דואליזם מפריד בין נפש למוח; מוניזם (העמדה המקובלת היום) רואה בנפש פעילות של המוח.', 'התגלית של ברוקה תמכה ברעיון מיקום התפקודים.', 'דוקטרינת הנוירון של קחאל: מערכת העצבים בנויה מתאים נפרדים שמתקשרים בסינפסות.'],
      },
      terms: [
        ['Neuroscience', 'The scientific study of the nervous system, combining many fields.', 'מדעי המוח', 'המחקר המדעי של מערכת העצבים, המשלב תחומים רבים.'],
        ['Dualism', 'The view that the mind and the body are separate things.', 'דואליזם', 'התפיסה שהנפש והגוף הם דברים נפרדים.'],
        ['Monism', 'The view that the mind is produced by the brain — they are one thing.', 'מוניזם', 'התפיסה שהנפש נוצרת על ידי המוח — הם דבר אחד.'],
        ['Localization of function', 'The idea that specific brain areas carry out specific functions.', 'מיקום תפקודים', 'הרעיון שאזורי מוח מסוימים מבצעים תפקודים מסוימים.'],
        ['Neuron doctrine', 'Cajal\'s idea that the nervous system is made of separate individual cells.', 'דוקטרינת הנוירון', 'הרעיון של קחאל שמערכת העצבים בנויה מתאים נפרדים.'],
      ],
      quiz: [
        ['Whose patient helped show that speech production depends on a specific area of the left frontal lobe?', 'המטופל של מי עזר להראות שהפקת דיבור תלויה באזור מסוים באונה המצחית השמאלית?', ['Paul Broca', 'Franz Gall', 'René Descartes', 'Galen'], ['פול ברוקה', 'פרנץ גאל', 'רנה דקארט', 'גלנוס'], 0, 'Broca studied patient "Tan", who lost fluent speech after damage to the left frontal lobe.', 'ברוקה חקר את המטופל "טאן", שאיבד את הדיבור השוטף בעקבות פגיעה באונה המצחית השמאלית.'],
        ['Which idea says that the mind is simply the activity of the brain?', 'איזה רעיון אומר שהנפש היא פשוט פעילות המוח?', ['Dualism', 'Monism', 'Phrenology', 'Ventricular theory'], ['דואליזם', 'מוניזם', 'פרנולוגיה', 'תורת החדרים'], 1, 'Monism treats mind and brain as one; this is the dominant view in neuroscience today.', 'מוניזם רואה בנפש ובמוח דבר אחד; זו העמדה המקובלת כיום במדעי המוח.'],
      ],
    },
    {
      title: { en: 'Looking at the brain: histology, autopsy and imaging', he: 'להסתכל על המוח: היסטולוגיה, נתיחה ודימות' },
      diagram: 'imaging',
      regions: [],
      body: {
        en: [
          '## Histology and autopsy',
          '**Histology** is the study of tissue under a microscope. Thin slices of brain are stained so that cells become visible: the **Golgi stain** colours a few whole neurons in black, the **Nissl stain** colours cell bodies, and other stains reveal myelin or trace connections between areas. **Autopsy** — examining the brain after death — let researchers connect damage they found with symptoms the person had in life, as Broca did.',
          '## Imaging the living brain',
          '**Computerized tomography (CT)** uses X-rays from many angles to build a picture of brain structure — fast and good for spotting bleeding or tumours. **Magnetic resonance imaging (MRI)** uses a strong magnetic field and radio waves to produce very detailed images of structure, without radiation. **Diffusion tensor imaging (DTI)**, a type of MRI, follows the movement of water along nerve fibres to map the brain\'s "wiring".',
          'To see the brain at **work**, **positron emission tomography (PET)** detects a slightly radioactive substance (such as a glucose-like tracer) that collects where neurons are most active. **Functional MRI (fMRI)** measures changes in blood oxygen (the **BOLD** signal): active areas receive more oxygenated blood. fMRI has excellent spatial detail but is slow, because blood flow changes take several seconds.',
        ],
        he: [
          '## היסטולוגיה ונתיחה',
          '**היסטולוגיה** היא חקר רקמות במיקרוסקופ. פרוסות דקות של מוח נצבעות כדי שהתאים ייראו: **צביעת גולג\'י** צובעת מספר קטן של נוירונים שלמים בשחור, **צביעת ניסל** צובעת את גופי התאים, וצביעות אחרות חושפות מיאלין או עוקבות אחר קשרים בין אזורים. **נתיחה** — בדיקת המוח לאחר המוות — אפשרה לחוקרים לקשר בין נזק שמצאו לבין תסמינים שהיו לאדם בחייו, כפי שעשה ברוקה.',
          '## דימות של המוח החי',
          '**טומוגרפיה ממוחשבת (CT)** משתמשת בקרני רנטגן מזוויות רבות כדי לבנות תמונה של מבנה המוח — מהירה וטובה לאיתור דימום או גידולים. **דימות תהודה מגנטית (MRI)** משתמש בשדה מגנטי חזק ובגלי רדיו כדי ליצור תמונות מפורטות מאוד של המבנה, ללא קרינה. **DTI** (דימות טנזור דיפוזיה), סוג של MRI, עוקב אחר תנועת מים לאורך סיבי עצב כדי למפות את "החיווט" של המוח.',
          'כדי לראות את המוח **בפעולה**, **טומוגרפיית פליטת פוזיטרונים (PET)** מזהה חומר רדיואקטיבי חלש (כמו חומר דמוי גלוקוז) שמצטבר במקום שבו הנוירונים פעילים ביותר. **MRI תפקודי (fMRI)** מודד שינויים בחמצן בדם (אות **BOLD**): אזורים פעילים מקבלים יותר דם מחומצן. ל-fMRI פירוט מרחבי מצוין אבל הוא איטי, כי שינויים בזרימת הדם לוקחים כמה שניות.',
        ],
      },
      points: {
        en: ['Histology stains thin tissue slices to reveal cells and pathways.', 'CT and MRI show brain structure.', 'PET and fMRI show brain activity.', 'fMRI measures blood oxygen (BOLD), so it is precise in space but slow in time.'],
        he: ['היסטולוגיה צובעת פרוסות רקמה דקות כדי לחשוף תאים ומסלולים.', 'CT ו-MRI מראים את מבנה המוח.', 'PET ו-fMRI מראים את פעילות המוח.', 'fMRI מודד חמצן בדם (BOLD), ולכן הוא מדויק במרחב אך איטי בזמן.'],
      },
      terms: [
        ['Histology', 'The microscopic study of tissue, using stains to reveal cells.', 'היסטולוגיה', 'חקר רקמות במיקרוסקופ, תוך שימוש בצביעות לחשיפת תאים.'],
        ['CT scan', 'Computerized tomography: X-rays from many angles combined into images of brain structure.', 'סריקת CT', 'טומוגרפיה ממוחשבת: קרני רנטגן מזוויות רבות שמשולבות לתמונות של מבנה המוח.'],
        ['MRI', 'Magnetic resonance imaging: detailed structural images made with magnets and radio waves.', 'MRI', 'דימות תהודה מגנטית: תמונות מבנה מפורטות שנוצרות בעזרת מגנטים וגלי רדיו.'],
        ['PET', 'Positron emission tomography: tracks a radioactive tracer to show active brain areas.', 'PET', 'טומוגרפיית פליטת פוזיטרונים: עוקבת אחר חומר מסומן רדיואקטיבית כדי להראות אזורים פעילים.'],
        ['fMRI', 'Functional MRI: shows activity by measuring changes in blood oxygen (BOLD signal).', 'fMRI', 'MRI תפקודי: מראה פעילות באמצעות מדידת שינויים בחמצן בדם (אות BOLD).'],
      ],
      quiz: [
        ['Which method shows brain ACTIVITY by measuring changes in blood oxygen?', 'איזו שיטה מראה את פעילות המוח באמצעות מדידת שינויים בחמצן בדם?', ['CT', 'Structural MRI', 'fMRI', 'Golgi stain'], ['CT', 'MRI מבני', 'fMRI', 'צביעת גולג\'י'], 2, 'fMRI tracks the BOLD signal — more oxygenated blood flows to active areas.', 'fMRI עוקב אחר אות ה-BOLD — יותר דם מחומצן זורם לאזורים פעילים.'],
        ['The Golgi stain is useful because it…', 'צביעת גולג\'י שימושית כי היא…', ['stains every cell body', 'stains a few whole neurons completely', 'shows activity in living people', 'uses X-rays'], ['צובעת כל גוף תא', 'צובעת מעט נוירונים שלמים במלואם', 'מראה פעילות באנשים חיים', 'משתמשת בקרני רנטגן'], 1, 'Because only a few cells are stained, each whole neuron — with all its branches — stands out.', 'מכיוון שרק מעט תאים נצבעים, כל נוירון שלם — על כל הסתעפויותיו — בולט לעין.'],
      ],
    },
    {
      title: { en: 'Recording, stimulating and changing the brain', he: 'הקלטה, גירוי ושינוי של המוח' },
      diagram: 'eeg',
      regions: ['frontal', 'parietal', 'occipital'],
      body: {
        en: [
          '## Recording',
          '**Electroencephalography (EEG)** records the brain\'s electrical activity through electrodes on the scalp. It is precise in time (milliseconds) but vague about location. Averaging the EEG response to a repeated stimulus gives an **event-related potential (ERP)**. **Magnetoencephalography (MEG)** records the tiny magnetic fields produced by active neurons. In animals and in some patients, **single-cell recording** with microelectrodes measures the firing of individual neurons.',
          '## Stimulation and lesions',
          '**Transcranial magnetic stimulation (TMS)** uses a magnetic coil over the head to briefly excite or disrupt a cortical area — a "temporary lesion" that shows what the area is needed for. **Deep brain stimulation** uses implanted electrodes, for example to treat Parkinson\'s disease. In a **lesion** study, a brain area is damaged (in animals, or by illness or injury in humans) and the resulting changes in behaviour are studied.',
          '## Chemistry, genes and stem cells',
          '**Microdialysis** samples the fluid around neurons to measure neurotransmitters in an awake animal. Genetic methods include **twin and adoption studies**, which estimate how much of a trait is inherited, and **knockout** animals, in which a single gene is switched off. **Stem cells** — cells that can still become many cell types — are studied as a possible way to repair damaged brains.',
        ],
        he: [
          '## הקלטה',
          '**אלקטרואנצפלוגרפיה (EEG)** מקליטה את הפעילות החשמלית של המוח באמצעות אלקטרודות על הקרקפת. היא מדויקת בזמן (אלפיות שנייה) אך לא מדויקת לגבי המיקום. מיצוע תגובת ה-EEG לגירוי שחוזר על עצמו נותן **פוטנציאל מעורר-אירוע (ERP)**. **מגנטואנצפלוגרפיה (MEG)** מקליטה את השדות המגנטיים הזעירים שנוצרים מנוירונים פעילים. בבעלי חיים ובחלק מהמטופלים, **הקלטה מתא בודד** בעזרת מיקרו-אלקטרודות מודדת את הירי של נוירונים בודדים.',
          '## גירוי ונגעים',
          '**גירוי מגנטי חוץ-גולגולתי (TMS)** משתמש בסליל מגנטי מעל הראש כדי לעורר או לשבש לזמן קצר אזור בקליפת המוח — "נגע זמני" שמראה לְמה האזור נחוץ. **גירוי מוחי עמוק** משתמש באלקטרודות מושתלות, למשל לטיפול במחלת פרקינסון. במחקר **נגע (Lesion)** אזור מוח נפגע (בבעלי חיים, או ממחלה או פציעה בבני אדם) ובודקים את השינויים בהתנהגות.',
          '## כימיה, גנים ותאי גזע',
          '**מיקרודיאליזה** דוגמת את הנוזל סביב הנוירונים כדי למדוד מוליכים עצביים בבעל חיים ער. שיטות גנטיות כוללות **מחקרי תאומים ואימוץ**, שמעריכים עד כמה תכונה עוברת בתורשה, ובעלי חיים **מנוטרלי גן (Knockout)**, שבהם גן אחד מושבת. **תאי גזע** — תאים שעדיין יכולים להפוך לסוגי תאים רבים — נחקרים כדרך אפשרית לתקן מוח פגוע.',
        ],
      },
      points: {
        en: ['EEG/ERP and MEG: excellent timing, weaker location.', 'TMS can create a safe, temporary "lesion" in the cortex.', 'Lesion studies ask: what is lost when this area is damaged?', 'Twin/adoption studies and knockout genes reveal genetic influences.'],
        he: ['EEG/ERP ו-MEG: תזמון מצוין, מיקום פחות מדויק.', 'TMS יכול ליצור "נגע" זמני ובטוח בקליפת המוח.', 'מחקרי נגע שואלים: מה אובד כשאזור זה נפגע?', 'מחקרי תאומים ואימוץ וניטרול גנים חושפים השפעות גנטיות.'],
      },
      terms: [
        ['EEG', 'Electroencephalography: recording of the brain\'s electrical activity from the scalp.', 'EEG', 'אלקטרואנצפלוגרפיה: הקלטה של הפעילות החשמלית של המוח מהקרקפת.'],
        ['ERP', 'Event-related potential: the averaged EEG response to a specific stimulus.', 'ERP', 'פוטנציאל מעורר-אירוע: תגובת EEG ממוצעת לגירוי מסוים.'],
        ['TMS', 'Transcranial magnetic stimulation: a magnetic coil briefly activates or disrupts cortex.', 'TMS', 'גירוי מגנטי חוץ-גולגולתי: סליל מגנטי מפעיל או משבש לזמן קצר את קליפת המוח.'],
        ['Lesion', 'Damage to a brain area, used to learn what that area does.', 'נגע (Lesion)', 'פגיעה באזור מוח, המשמשת ללמוד מה האזור עושה.'],
        ['Knockout', 'An animal in which a specific gene has been made inactive.', 'ניטרול גן (Knockout)', 'בעל חיים שבו גן מסוים הושבת.'],
      ],
      quiz: [
        ['Which technique has the best TIME precision?', 'לאיזו שיטה יש את הדיוק הטוב ביותר בזמן?', ['fMRI', 'EEG', 'CT', 'Autopsy'], ['fMRI', 'EEG', 'CT', 'נתיחה'], 1, 'EEG follows electrical changes millisecond by millisecond.', 'EEG עוקב אחר שינויים חשמליים ברזולוציה של אלפיות שנייה.'],
        ['TMS can be used to create a temporary, reversible "lesion".', 'ניתן להשתמש ב-TMS כדי ליצור "נגע" זמני והפיך.', ['True', 'False'], ['נכון', 'לא נכון'], 0, 'TMS briefly disrupts a cortical area, showing what it is needed for.', 'TMS משבש לזמן קצר אזור בקליפה ומראה לְמה הוא נחוץ.'],
      ],
    },
    {
      title: { en: 'Research ethics', he: 'אתיקה במחקר' },
      diagram: null,
      regions: [],
      body: {
        en: [
          'Research on people and animals must be done responsibly. For **human participants**, researchers obtain **informed consent** — people must understand the study and agree freely, and they may quit at any time. Their data are kept confidential, risks are minimized, and a review board (in the US, an Institutional Review Board) approves studies in advance. The tragic death of Jesse Gelsinger in a gene-therapy trial (1999) showed what can happen when warning signs and conflicts of interest are not taken seriously.',
          'For **animal subjects**, committees check that the research is important, that animals are housed and treated humanely, and that pain is minimized. A common guide is the **"three Rs"**: **replace** animals with other methods when possible, **reduce** the number of animals used, and **refine** procedures to reduce suffering.',
          'New tools raise new questions: Should brain scans be used as lie detectors in court? What if a scan finds an unexpected tumour (an **incidental finding**)? Should healthy people use drugs to boost thinking (**cognitive enhancement**)? The field of **neuroethics** discusses these issues.',
        ],
        he: [
          'מחקר בבני אדם ובבעלי חיים חייב להתבצע באחריות. עבור **משתתפים אנושיים**, החוקרים מקבלים **הסכמה מדעת** — האנשים חייבים להבין את המחקר ולהסכים מרצונם החופשי, והם רשאים לפרוש בכל עת. הנתונים שלהם נשמרים בסודיות, הסיכונים מצומצמים, וועדה (בישראל: ועדת הלסינקי) מאשרת מחקרים מראש. מותו הטרגי של ג\'סי גלסינגר בניסוי ריפוי גנטי (1999) הראה מה עלול לקרות כשלא מתייחסים ברצינות לסימני אזהרה ולניגודי עניינים.',
          'עבור **בעלי חיים**, ועדות בודקות שהמחקר חשוב, שבעלי החיים מוחזקים ומטופלים באופן הומני ושהכאב מצומצם. מדריך מקובל הוא **"שלושת ה-R"**: **להחליף (Replace)** בעלי חיים בשיטות אחרות כשאפשר, **לצמצם (Reduce)** את מספר בעלי החיים, ו**לעדן (Refine)** את ההליכים כדי להפחית סבל.',
          'כלים חדשים מעלים שאלות חדשות: האם סריקות מוח צריכות לשמש גלאי שקר בבית משפט? מה אם סריקה מגלה גידול בלתי צפוי (**ממצא מקרי**)? האם אנשים בריאים צריכים להשתמש בתרופות לשיפור החשיבה (**שיפור קוגניטיבי**)? תחום ה**נוירואתיקה** דן בשאלות האלה.',
        ],
      },
      points: {
        en: ['Informed consent and the right to withdraw protect human participants.', 'Review boards approve research before it starts.', 'Animal research follows the "three Rs": replace, reduce, refine.', 'Neuroethics deals with new issues such as brain-based lie detection and enhancement.'],
        he: ['הסכמה מדעת והזכות לפרוש מגינות על משתתפים אנושיים.', 'ועדות מאשרות מחקרים לפני שהם מתחילים.', 'מחקר בבעלי חיים פועל לפי "שלושת ה-R": להחליף, לצמצם, לעדן.', 'נוירואתיקה עוסקת בסוגיות חדשות כמו גילוי שקר מבוסס מוח ושיפור קוגניטיבי.'],
      },
      terms: [
        ['Informed consent', 'Agreeing to take part in research after understanding its purpose, risks and procedures.', 'הסכמה מדעת', 'הסכמה להשתתף במחקר לאחר הבנת מטרתו, סיכוניו והליכיו.'],
        ['Three Rs', 'Animal research guidelines: replace, reduce, refine.', 'שלושת ה-R', 'הנחיות למחקר בבעלי חיים: להחליף, לצמצם, לעדן.'],
        ['Neuroethics', 'The study of ethical questions raised by neuroscience.', 'נוירואתיקה', 'חקר השאלות האתיות שמעלים מדעי המוח.'],
      ],
      quiz: [
        ['Which is NOT one of the "three Rs" for animal research?', 'מה מהבאים אינו אחד מ"שלושת ה-R" במחקר בבעלי חיים?', ['Replace', 'Reduce', 'Refine', 'Reward'], ['להחליף (Replace)', 'לצמצם (Reduce)', 'לעדן (Refine)', 'לתגמל (Reward)'], 3, 'The three Rs are replace, reduce and refine.', 'שלושת ה-R הם להחליף, לצמצם ולעדן.'],
      ],
    },
  ],
};
