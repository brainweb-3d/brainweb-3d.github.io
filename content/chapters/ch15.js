// Format explained at the top of ch01.js
export default {
  n: 15,
  icon: '🩺',
  color: '#56ccf2',
  title: { en: 'Neurological Disorders', he: 'הפרעות נוירולוגיות' },
  intro: {
    en: 'Strokes, head injuries, tumours, epilepsy, infections, prion diseases and migraine — plus how damage is assessed and treated.',
    he: 'שבץ, פגיעות ראש, גידולים, אפילפסיה, זיהומים, מחלות פריונים ומיגרנה — וגם איך מעריכים נזק ומטפלים בו.',
  },
  lessons: [
    {
      title: { en: 'Stroke, head injury and brain tumours', he: 'שבץ, פגיעות ראש וגידולי מוח' },
      diagram: 'stroke',
      regions: ['frontal', 'parietal', 'temporal', 'broca', 'motor'],
      body: {
        en: [
          '## Stroke',
          'A **stroke** happens when blood supply to part of the brain is interrupted. About 80% are **ischemic** (the course book; today the figure is often given as about 85%) — a blood vessel is blocked by a clot (a **thrombosis** forms in place; an **embolism** travels from elsewhere). The rest are **hemorrhagic** — a vessel bursts, often due to high blood pressure or a weak, ballooning vessel (**aneurysm**). Without oxygen, neurons die within minutes; glutamate floods out and over-excites neighbouring cells (**excitotoxicity**), spreading the damage. Warning signs (FAST): **F**ace drooping, **A**rm weakness, **S**peech difficulty — **T**ime to call emergency services. Clot-busting drugs (tPA) help ischemic stroke if given within a few hours — but would worsen a hemorrhagic stroke, so a scan is needed first.',
          '## Head injuries',
          '**Open** head injuries penetrate the skull; **closed** head injuries come from a blow or rapid acceleration that makes the brain hit the inside of the skull — often damaging the front and the opposite side (**coup–contrecoup**). A **concussion** is a mild traumatic brain injury that can cause headache, confusion and memory problems; repeated concussions in athletes can lead to **post-concussive syndrome** and **chronic traumatic encephalopathy (CTE)**.',
          '## Brain tumours',
          'Tumours are abnormal growths. **Gliomas** arise from glial cells and are often aggressive (glioblastoma); **meningiomas** grow from the meninges and are usually benign but can press on the brain. **Metastatic** tumours spread from cancers elsewhere (e.g. lung, breast). Symptoms depend on location and include headaches, seizures and personality changes.',
        ],
        he: [
          '## שבץ',
          '**שבץ** קורה כשאספקת הדם לחלק מהמוח נקטעת. כ-80% הם **איסכמיים** (לפי ספר הקורס; כיום מקובל לציין כ-85%) — כלי דם נחסם על ידי קריש (**פקקת** נוצרת במקום; **תסחיף** נודד ממקום אחר). השאר הם **דימומיים** — כלי דם מתפוצץ, לעיתים קרובות בגלל לחץ דם גבוה או כלי דם חלש ומתנפח (**מפרצת, Aneurysm**). ללא חמצן, נוירונים מתים תוך דקות; גלוטמט מציף את הסביבה ומעורר יתר על המידה תאים שכנים (**רעילות עירור**), כך שהנזק מתפשט. סימני אזהרה: **פ**נים נפולות, **י**ד חלשה, **ד**יבור משובש — **ז**מן להזעיק עזרה. תרופות ממיסות קרישים (tPA) עוזרות בשבץ איסכמי אם ניתנות תוך כמה שעות — אך היו מחמירות שבץ דימומי, ולכן נדרשת סריקה קודם.',
          '## פגיעות ראש',
          'פגיעות ראש **פתוחות** חודרות את הגולגולת; פגיעות ראש **סגורות** נגרמות ממכה או מתאוצה מהירה שגורמת למוח להיחבט בתוך הגולגולת — לעיתים קרובות עם נזק בצד הפגיעה ובצד הנגדי (**קו-קונטרקו**). **זעזוע מוח** הוא פגיעה מוחית טראומטית קלה שעלולה לגרום לכאב ראש, בלבול ובעיות זיכרון; זעזועי מוח חוזרים אצל ספורטאים עלולים להוביל ל**תסמונת שלאחר זעזוע מוח** ול**אנצפלופתיה טראומטית כרונית (CTE)**.',
          '## גידולי מוח',
          'גידולים הם צמיחה לא תקינה של תאים. **גליומות** נוצרות מתאי גליה ולרוב הן אגרסיביות (גליובלסטומה); **מנינגיומות** צומחות מקרומי המוח ובדרך כלל שפירות אך עלולות ללחוץ על המוח. גידולים **גרורתיים** מתפשטים מסרטן במקום אחר (למשל ריאות, שד). התסמינים תלויים במיקום וכוללים כאבי ראש, פרכוסים ושינויי אישיות.',
        ],
      },
      points: {
        en: ['Ischemic stroke = blocked vessel (about 80%); hemorrhagic = burst vessel.', 'Excitotoxicity spreads damage after stroke.', 'tPA helps ischemic stroke only if given early (scan first).', 'Repeated concussions can cause CTE.'],
        he: ['שבץ איסכמי = כלי דם חסום (כ-80%); דימומי = כלי דם שהתפוצץ.', 'רעילות עירור מפיצה את הנזק לאחר שבץ.', 'tPA עוזר בשבץ איסכמי רק אם ניתן מוקדם (סריקה קודם).', 'זעזועי מוח חוזרים עלולים לגרום ל-CTE.'],
      },
      terms: [
        ['Ischemic stroke', 'Stroke caused by a blocked blood vessel.', 'שבץ איסכמי', 'שבץ שנגרם מכלי דם חסום.'],
        ['Hemorrhagic stroke', 'Stroke caused by a ruptured blood vessel.', 'שבץ דימומי', 'שבץ שנגרם מכלי דם שנקרע.'],
        ['Excitotoxicity', 'Neuron death caused by excessive glutamate stimulation.', 'רעילות עירור', 'מוות נוירונים שנגרם מגירוי יתר של גלוטמט.'],
        ['Concussion', 'A mild traumatic brain injury from a blow to the head.', 'זעזוע מוח', 'פגיעה מוחית טראומטית קלה ממכה בראש.'],
        ['Glioma', 'Brain tumour arising from glial cells.', 'גליומה', 'גידול מוחי שנוצר מתאי גליה.'],
      ],
      quiz: [
        ['Most strokes are caused by…', 'רוב השבצים נגרמים על ידי…', ['bleeding in the brain', 'a blocked blood vessel', 'infection', 'tumours'], ['דימום במוח', 'כלי דם חסום', 'זיהום', 'גידולים'], 1, 'About 80% of strokes are ischemic (the course book\'s figure).', 'כ-80% מהשבצים הם איסכמיים.'],
        ['Why must doctors scan the brain before giving clot-busting drugs?', 'מדוע הרופאים חייבים לסרוק את המוח לפני מתן תרופות ממיסות קרישים?', ['To check for a hemorrhagic stroke', 'To find the hippocampus', 'To measure IQ', 'To check myelin'], ['כדי לבדוק אם זה שבץ דימומי', 'כדי למצוא את ההיפוקמפוס', 'כדי למדוד IQ', 'כדי לבדוק מיאלין'], 0, 'tPA would worsen bleeding.', 'tPA היה מחמיר את הדימום.'],
      ],
    },
    {
      title: { en: 'Seizures and epilepsy', he: 'פרכוסים ואפילפסיה' },
      diagram: 'seizure',
      regions: ['temporal', 'corpusCallosum', 'hippocampus'],
      body: {
        en: [
          'A **seizure** is a sudden burst of abnormal, synchronized electrical activity in the brain. **Epilepsy** is a condition of repeated, unprovoked seizures. Causes include genes, head injury, infection, tumours and fever in young children — but often no cause is found.',
          '## Types of seizures',
          '**Partial (focal)** seizures start in one area. In **simple partial** seizures, the person stays conscious and may experience twitching or strange sensations depending on the area; in **complex partial** seizures (often from the temporal lobe) awareness is impaired and the person may perform automatic movements. Many people sense an **aura** — a warning sensation — before a seizure. **Generalized** seizures involve both hemispheres: **tonic-clonic** (grand mal) seizures cause loss of consciousness, stiffening (tonic phase) and rhythmic jerking (clonic phase); **absence** (petit mal) seizures are brief lapses of awareness, mostly in children, with a characteristic 3-per-second spike-and-wave EEG pattern.',
          '## Treatment',
          'Most people are helped by **anticonvulsant** drugs, which typically boost GABA inhibition or reduce excitation by blocking sodium channels. When drugs fail, surgery can remove the seizure focus (as with patient H.M.) or cut the corpus callosum to stop spread. A high-fat **ketogenic diet** and vagus nerve stimulation help some patients.',
        ],
        he: [
          '**פרכוס** הוא פרץ פתאומי של פעילות חשמלית לא תקינה ומסונכרנת במוח. **אפילפסיה** היא מצב של פרכוסים חוזרים ללא גורם מעורר. הגורמים כוללים גנים, פגיעת ראש, זיהום, גידולים וחום אצל ילדים צעירים — אך לעיתים קרובות לא נמצא גורם.',
          '## סוגי פרכוסים',
          'פרכוסים **חלקיים (מוקדיים)** מתחילים באזור אחד. בפרכוסים **חלקיים פשוטים** האדם נשאר בהכרה ועשוי לחוות עוויתות או תחושות מוזרות בהתאם לאזור; בפרכוסים **חלקיים מורכבים** (לרוב מהאונה הרקתית) המודעות נפגעת והאדם עשוי לבצע תנועות אוטומטיות. אנשים רבים חשים **הילה (Aura)** — תחושת אזהרה — לפני הפרכוס. פרכוסים **כלליים** מערבים את שתי ההמיספרות: פרכוסים **טוניים-קלוניים** (גרנד מל) גורמים לאובדן הכרה, התקשחות (השלב הטוני) ופרכוסים קצביים (השלב הקלוני); פרכוסי **ניתוק (Absence, פטי מל)** הם הפסקות קצרות במודעות, בעיקר אצל ילדים, עם דפוס EEG אופייני של קוץ-גל שלוש פעמים בשנייה.',
          '## טיפול',
          'רוב האנשים נעזרים בתרופות **נוגדות פרכוסים**, שבדרך כלל מגבירות את העיכוב של GABA או מפחיתות עירור על ידי חסימת תעלות נתרן. כשהתרופות נכשלות, ניתוח יכול להסיר את מוקד הפרכוס (כמו אצל ה.מ.) או לחתוך את הכפיס כדי לעצור התפשטות. **דיאטה קטוגנית** עתירת שומן וגירוי העצב התועה עוזרים לחלק מהמטופלים.',
        ],
      },
      points: {
        en: ['Seizure = abnormal synchronized electrical activity; epilepsy = recurrent seizures.', 'Partial (focal) vs generalized seizures.', 'Tonic-clonic: stiffening then jerking; absence: brief lapses (3 Hz spike-and-wave).', 'Treated with anticonvulsants, surgery, ketogenic diet.'],
        he: ['פרכוס = פעילות חשמלית מסונכרנת לא תקינה; אפילפסיה = פרכוסים חוזרים.', 'פרכוסים חלקיים (מוקדיים) מול כלליים.', 'טוני-קלוני: התקשחות ואז פרכוס; ניתוק: הפסקות קצרות (קוץ-גל 3 הרץ).', 'מטופלים בנוגדי פרכוסים, ניתוח, דיאטה קטוגנית.'],
      },
      terms: [
        ['Seizure', 'A burst of abnormal, synchronized electrical activity in the brain.', 'פרכוס', 'פרץ של פעילות חשמלית לא תקינה ומסונכרנת במוח.'],
        ['Epilepsy', 'A condition of recurrent, unprovoked seizures.', 'אפילפסיה', 'מצב של פרכוסים חוזרים ללא גורם מעורר.'],
        ['Tonic-clonic seizure', 'Generalized seizure with stiffening followed by rhythmic jerking.', 'פרכוס טוני-קלוני', 'פרכוס כללי עם התקשחות ואחריה עוויתות קצביות.'],
        ['Absence seizure', 'Brief generalized lapse of awareness, common in children.', 'פרכוס ניתוק', 'הפסקה כללית קצרה במודעות, שכיחה בילדים.'],
        ['Aura', 'A warning sensation that comes before a seizure (or migraine).', 'הילה (Aura)', 'תחושת אזהרה שמגיעה לפני פרכוס (או מיגרנה).'],
      ],
      quiz: [
        ['A child repeatedly "blanks out" for a few seconds in class; EEG shows 3-per-second spike-and-wave. This is…', 'ילד "נעלם" שוב ושוב לכמה שניות בכיתה; ה-EEG מראה קוץ-גל שלוש פעמים בשנייה. זהו…', ['a tonic-clonic seizure', 'an absence seizure', 'a migraine', 'narcolepsy'], ['פרכוס טוני-קלוני', 'פרכוס ניתוק', 'מיגרנה', 'נרקולפסיה'], 1, 'Absence seizures are brief lapses with this classic EEG pattern.', 'פרכוסי ניתוק הם הפסקות קצרות עם דפוס EEG קלאסי זה.'],
      ],
    },
    {
      title: { en: 'MS, infections, prions and migraine', he: 'טרשת נפוצה, זיהומים, פריונים ומיגרנה' },
      diagram: null,
      regions: ['corpusCallosum', 'spinalCord', 'occipital'],
      body: {
        en: [
          '## Multiple sclerosis (MS)',
          'In **MS**, the immune system attacks **myelin** in the CNS, leaving hardened patches (plaques/scleroses). Nerve signals slow or fail, causing vision problems, weakness, numbness, fatigue and coordination problems that often come and go (relapsing–remitting). It is more common in women and in places farther from the equator, possibly related to vitamin D. Immune-modifying drugs reduce attacks.',
          '## Brain infections',
          '**Parasites** such as *Toxoplasma gondii* (carried by cats) can infect the brain and may subtly affect behaviour. **Bacterial meningitis** is a medical emergency. **Viral** infections include **herpes simplex encephalitis**, which can destroy temporal-lobe memory areas; **rabies**, which attacks the brain and is almost always fatal once symptoms begin; and **HIV**, which can cause dementia. Fungal infections affect mainly people with weak immune systems.',
          '## Prion diseases',
          '**Transmissible spongiform encephalopathies (TSEs)** are caused by **prions** — misfolded proteins that force normal proteins to misfold too, leaving the brain full of holes like a sponge. Examples: **Creutzfeldt–Jakob disease (CJD)** in humans; **mad cow disease** (BSE) and its human form, variant CJD, from eating infected beef; **kuru**, spread by ritual cannibalism in Papua New Guinea; and scrapie in sheep. Prions are very hard to destroy and the diseases are fatal.',
          '## Migraine',
          '**Migraine** is a severe, often one-sided, throbbing headache with nausea and sensitivity to light and sound. About a quarter of patients experience an **aura** first — often zigzag visual patterns — linked to a slowly spreading wave of depressed activity across the cortex. Triggers include stress, sleep changes, hormones and some foods. **Triptans**, which act on serotonin receptors, are commonly used.',
        ],
        he: [
          '## טרשת נפוצה (MS)',
          'ב**טרשת נפוצה**, מערכת החיסון תוקפת את **המיאלין** במערכת העצבים המרכזית ומשאירה כתמים מוקשים (רבדים/טרשות). האותות העצביים מאטים או נכשלים, מה שגורם לבעיות ראייה, חולשה, נימול, עייפות ובעיות קואורדינציה שלעיתים קרובות באות והולכות (התקפית-הפוגתית). היא שכיחה יותר בנשים ובמקומות רחוקים יותר מקו המשווה, אולי בקשר לוויטמין D. תרופות המווסתות את מערכת החיסון מפחיתות התקפים.',
          '## זיהומים במוח',
          '**טפילים** כמו *טוקסופלזמה גונדיי* (שנישאת על ידי חתולים) יכולים להדביק את המוח ואולי להשפיע מעט על התנהגות. **דלקת קרום המוח חיידקית** היא מצב חירום רפואי. זיהומים **נגיפיים** כוללים **דלקת מוח מנגיף ההרפס**, שעלולה להרוס אזורי זיכרון באונה הרקתית; **כלבת**, שתוקפת את המוח וקטלנית כמעט תמיד לאחר הופעת התסמינים; ו**HIV**, שעלול לגרום לדמנציה. זיהומים פטרייתיים פוגעים בעיקר באנשים עם מערכת חיסון חלשה.',
          '## מחלות פריונים',
          '**אנצפלופתיות ספוגיות מדבקות (TSE)** נגרמות על ידי **פריונים** — חלבונים שהתקפלו לא נכון וגורמים לחלבונים תקינים להתקפל לא נכון גם הם, כך שהמוח מתמלא חורים כמו ספוג. דוגמאות: **מחלת קרויצפלד-יעקב (CJD)** בבני אדם; **מחלת הפרה המשוגעת** (BSE) והצורה האנושית שלה, CJD וריאנטית, מאכילת בשר בקר נגוע; **קורו**, שהתפשטה בגלל קניבליזם טקסי בפפואה גינאה החדשה; וסקרייפי בכבשים. קשה מאוד להשמיד פריונים והמחלות קטלניות.',
          '## מיגרנה',
          '**מיגרנה** היא כאב ראש חמור ופועם, לעיתים קרובות חד-צדדי, עם בחילה ורגישות לאור ולרעש. כרבע מהמטופלים חווים קודם **הילה (Aura)** — לעיתים קרובות דפוסי זיגזג חזותיים — הקשורה לגל איטי של פעילות מדוכאת המתפשט על פני הקליפה. הגורמים המעוררים כוללים לחץ, שינויים בשינה, הורמונים ומזונות מסוימים. **טריפטנים**, הפועלים על קולטני סרוטונין, נמצאים בשימוש נפוץ.',
        ],
      },
      points: {
        en: ['MS: immune attack on CNS myelin; symptoms come and go.', 'Herpes encephalitis can destroy temporal-lobe memory areas.', 'Prions are misfolded proteins causing fatal "spongy" brain diseases (CJD, mad cow, kuru).', 'Migraine aura is linked to a spreading wave across the cortex.'],
        he: ['טרשת נפוצה: התקפה חיסונית על המיאלין במערכת המרכזית; תסמינים באים והולכים.', 'דלקת מוח מהרפס עלולה להרוס אזורי זיכרון באונה הרקתית.', 'פריונים הם חלבונים שהתקפלו לא נכון וגורמים למחלות מוח "ספוגיות" קטלניות (CJD, פרה משוגעת, קורו).', 'ההילה במיגרנה קשורה לגל המתפשט על פני הקליפה.'],
      },
      terms: [
        ['Multiple sclerosis', 'Autoimmune disease that destroys myelin in the CNS.', 'טרשת נפוצה', 'מחלה אוטואימונית שהורסת מיאלין במערכת העצבים המרכזית.'],
        ['Prion', 'A misfolded protein that causes other proteins to misfold.', 'פריון', 'חלבון שהתקפל לא נכון וגורם לחלבונים אחרים להתקפל לא נכון.'],
        ['Creutzfeldt–Jakob disease', 'A human prion disease causing rapid dementia.', 'מחלת קרויצפלד-יעקב', 'מחלת פריונים אנושית שגורמת לדמנציה מהירה.'],
        ['Migraine', 'Severe recurrent headache, sometimes preceded by an aura.', 'מיגרנה', 'כאב ראש חמור וחוזר, שלעיתים קודמת לו הילה.'],
      ],
      quiz: [
        ['Multiple sclerosis damages…', 'טרשת נפוצה פוגעת ב…', ['dopamine neurons', 'myelin in the CNS', 'the cochlea', 'muscle fibres'], ['נוירוני דופמין', 'מיאלין במערכת העצבים המרכזית', 'השבלול', 'סיבי שריר'], 1, 'The immune system attacks CNS myelin.', 'מערכת החיסון תוקפת את המיאלין במערכת המרכזית.'],
        ['Mad cow disease and kuru are caused by…', 'מחלת הפרה המשוגעת וקורו נגרמות על ידי…', ['bacteria', 'prions', 'viruses', 'parasites'], ['חיידקים', 'פריונים', 'נגיפים', 'טפילים'], 1, 'Both are transmissible spongiform encephalopathies caused by prions.', 'שתיהן אנצפלופתיות ספוגיות מדבקות שנגרמות על ידי פריונים.'],
      ],
    },
    {
      title: { en: 'Assessment, recovery and therapy', he: 'הערכה, החלמה וטיפול' },
      diagram: null,
      regions: ['frontal', 'hippocampus', 'motor'],
      body: {
        en: [
          '## Assessing damage',
          'Neurologists use imaging (CT, MRI), EEG and the neurological exam. **Neuropsychologists** use standardized tests of memory, language, attention, perception and executive function to find out which abilities are affected and to plan rehabilitation.',
          '## Recovery',
          'Some recovery happens quickly as swelling goes down and blood flow returns. Longer-term recovery relies on **plasticity**: nearby or opposite-hemisphere areas take over functions, and new connections form. Younger brains usually recover better (the **Kennard principle**), though early damage can sometimes have widespread effects. People with more education and mental activity may tolerate damage better — **cognitive reserve**.',
          '## Therapy',
          '**Rehabilitation** — physical, occupational and speech therapy — trains lost skills. **Constraint-induced movement therapy** restrains the healthy arm, forcing use of the weak one and driving brain reorganization. **Virtual reality** offers safe, motivating practice environments. **Drugs** may reduce damage soon after injury or support recovery. **Neural tissue transplants** and **stem cells** (for example to replace dopamine neurons in Parkinson\'s) are being investigated, with mixed results so far.',
        ],
        he: [
          '## הערכת נזק',
          'נוירולוגים משתמשים בדימות (CT, MRI), ב-EEG ובבדיקה נוירולוגית. **נוירופסיכולוגים** משתמשים במבחנים מתוקננים של זיכרון, שפה, קשב, תפיסה ותפקודים ניהוליים כדי לגלות אילו יכולות נפגעו ולתכנן שיקום.',
          '## החלמה',
          'חלק מההחלמה קורה מהר, כשהבצקת יורדת וזרימת הדם חוזרת. החלמה לטווח ארוך נשענת על **גמישות עצבית**: אזורים סמוכים או בהמיספרה הנגדית מקבלים על עצמם תפקודים, ונוצרים קשרים חדשים. מוחות צעירים בדרך כלל מחלימים טוב יותר (**עקרון קנארד**), אם כי נזק מוקדם עלול לפעמים להשפיע באופן נרחב. אנשים עם יותר השכלה ופעילות מנטלית עשויים לסבול נזק טוב יותר — **רזרבה קוגניטיבית**.',
          '## טיפול',
          '**שיקום** — פיזיותרפיה, ריפוי בעיסוק וקלינאות תקשורת — מאמן מיומנויות שאבדו. **טיפול בהגבלת תנועה (CIMT)** מגביל את היד הבריאה ומאלץ שימוש ביד החלשה, מה שמניע ארגון מחדש של המוח. **מציאות מדומה** מציעה סביבות תרגול בטוחות ומעוררות מוטיבציה. **תרופות** עשויות להפחית נזק זמן קצר אחרי הפגיעה או לתמוך בהחלמה. **השתלות רקמה עצבית** ו**תאי גזע** (למשל להחלפת נוירוני דופמין בפרקינסון) נחקרים, עם תוצאות מעורבות עד כה.',
        ],
      },
      points: {
        en: ['Neuropsychological tests identify which abilities are affected.', 'Recovery uses plasticity; younger brains usually recover better.', 'Cognitive reserve protects against the effects of damage.', 'Rehabilitation, constraint-induced therapy, VR, drugs and transplants.'],
        he: ['מבחנים נוירופסיכולוגיים מזהים אילו יכולות נפגעו.', 'ההחלמה נשענת על גמישות; מוחות צעירים בדרך כלל מחלימים טוב יותר.', 'רזרבה קוגניטיבית מגינה מפני השפעות הנזק.', 'שיקום, טיפול בהגבלת תנועה, מציאות מדומה, תרופות והשתלות.'],
      },
      terms: [
        ['Neuropsychologist', 'A psychologist who assesses how brain damage affects behaviour and thinking.', 'נוירופסיכולוג', 'פסיכולוג שמעריך כיצד נזק מוחי משפיע על התנהגות וחשיבה.'],
        ['Cognitive reserve', 'The brain\'s resilience to damage, built by education and mental activity.', 'רזרבה קוגניטיבית', 'עמידות המוח לנזק, הנבנית מהשכלה ופעילות מנטלית.'],
        ['Constraint-induced movement therapy', 'Restricting the healthy limb to force use of the impaired one.', 'טיפול בהגבלת תנועה', 'הגבלת האיבר הבריא כדי לאלץ שימוש באיבר הפגוע.'],
      ],
      quiz: [
        ['Restraining a stroke patient\'s healthy arm to force use of the weak arm is called…', 'הגבלת היד הבריאה של מטופל לאחר שבץ כדי לאלץ שימוש ביד החלשה נקראת…', ['cognitive reserve', 'constraint-induced movement therapy', 'the Wada test', 'deep brain stimulation'], ['רזרבה קוגניטיבית', 'טיפול בהגבלת תנועה', 'מבחן ואדה', 'גירוי מוחי עמוק'], 1, 'This forces practice and promotes brain reorganization.', 'זה מאלץ תרגול ומקדם ארגון מחדש של המוח.'],
      ],
    },
  ],
};
