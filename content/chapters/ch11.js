// Format explained at the top of ch01.js
export default {
  n: 11,
  icon: '🌙',
  color: '#3b4cca',
  title: { en: 'Sleep and Waking', he: 'שינה וערות' },
  intro: {
    en: 'The body\'s 24-hour clock, the stages of sleep, why we sleep, how the brain switches between sleep and waking, and sleep disorders.',
    he: 'השעון של 24 שעות בגוף, שלבי השינה, למה אנחנו ישנים, איך המוח עובר בין שינה לערות, והפרעות שינה.',
  },
  lessons: [
    {
      title: { en: 'Circadian rhythms: the body clock', he: 'קצבים צירקדיים: השעון הביולוגי' },
      diagram: 'clock',
      regions: ['scn', 'hypothalamus', 'opticChiasm'],
      body: {
        en: [
          'Many body functions — sleepiness, body temperature, hormone levels — follow a roughly 24-hour cycle called a **circadian rhythm** ("about a day"). People kept in caves without time cues keep a rhythm slightly longer than 24 hours, showing that it is **internal**. Each day, cues called **zeitgebers** ("time givers"), especially **light**, reset the clock. People differ: "larks" prefer mornings, "owls" evenings; teenagers naturally shift later.',
          '**Shift work**, **jet lag** and even the change to **daylight saving time** force the body to run out of step with its clock, causing tiredness, poorer performance and more accidents. Flying east (which requires a **phase advance** — sleeping earlier) is usually harder than flying west.',
          '## The master clock',
          'The **suprachiasmatic nucleus (SCN)** of the hypothalamus is the master clock. Animals with SCN damage lose their rhythms, and transplanting an SCN transfers the donor\'s rhythm. Special retinal ganglion cells containing the pigment **melanopsin** send light information directly to the SCN. Inside each SCN cell, clock genes (such as **CLOCK, period and cryptochrome**) form a feedback loop: their proteins build up during the day and then switch off their own genes, a cycle lasting about 24 hours.',
          'The SCN tells the **pineal gland** to release **melatonin** at night (darkness), which promotes sleep. Light at night — **light pollution** and screens — suppresses melatonin. In **seasonal affective disorder (SAD)**, short winter days are linked with depression; bright light therapy helps.',
        ],
        he: [
          'תפקודי גוף רבים — ישנוניות, חום הגוף, רמות הורמונים — עוקבים אחר מחזור של כ-24 שעות הנקרא **קצב צירקדי** ("בערך יום"). אנשים שהוחזקו במערות ללא רמזי זמן שמרו על קצב ארוך מעט מ-24 שעות, מה שמראה שהוא **פנימי**. בכל יום, רמזים הנקראים **צייטגברים** ("נותני זמן"), במיוחד **אור**, מכוונים מחדש את השעון. אנשים שונים זה מזה: "עפרונים" מעדיפים בקרים, "ינשופים" ערבים; מתבגרים נוטים באופן טבעי להיות מאוחרים יותר.',
          '**עבודה במשמרות**, **יעפת (Jet lag)** ואפילו המעבר ל**שעון קיץ** מאלצים את הגוף לפעול שלא בתיאום עם השעון שלו, מה שגורם לעייפות, לביצועים ירודים ולתאונות רבות יותר. טיסה מזרחה (שדורשת **הקדמת שלב** — לישון מוקדם יותר) קשה בדרך כלל יותר מטיסה מערבה.',
          '## השעון הראשי',
          '**הגרעין העל-מצטלבי (SCN)** בהיפותלמוס הוא השעון הראשי. בעלי חיים עם נזק ל-SCN מאבדים את הקצבים שלהם, והשתלת SCN מעבירה את הקצב של התורם. תאי גנגליון מיוחדים ברשתית המכילים את הפיגמנט **מלנופסין** שולחים מידע על אור ישירות ל-SCN. בתוך כל תא של ה-SCN, גני שעון (כמו **CLOCK, period ו-cryptochrome**) יוצרים לולאת משוב: החלבונים שלהם מצטברים במשך היום ואז משביתים את הגנים של עצמם, במחזור של כ-24 שעות.',
          'ה-SCN מאותת ל**בלוטת האצטרובל** להפריש **מלטונין** בלילה (בחושך), מה שמקדם שינה. אור בלילה — **זיהום אור** ומסכים — מדכא מלטונין. ב**הפרעה רגשית עונתית (SAD)**, ימי חורף קצרים קשורים לדיכאון; טיפול באור בהיר עוזר.',
        ],
      },
      points: {
        en: ['Circadian rhythms are internal and reset daily by light.', 'The SCN is the master clock; it gets light info via melanopsin cells.', 'Clock genes form a ~24-hour molecular feedback loop.', 'The pineal gland releases melatonin in darkness.'],
        he: ['קצבים צירקדיים הם פנימיים ומכוונים מחדש כל יום על ידי אור.', 'ה-SCN הוא השעון הראשי; הוא מקבל מידע על אור דרך תאי מלנופסין.', 'גני שעון יוצרים לולאת משוב מולקולרית של כ-24 שעות.', 'בלוטת האצטרובל מפרישה מלטונין בחושך.'],
      },
      terms: [
        ['Circadian rhythm', 'A biological cycle of about 24 hours.', 'קצב צירקדי', 'מחזור ביולוגי של כ-24 שעות.'],
        ['Zeitgeber', 'An external cue, especially light, that resets the body clock.', 'צייטגבר', 'רמז חיצוני, במיוחד אור, שמכוון מחדש את השעון הביולוגי.'],
        ['Suprachiasmatic nucleus (SCN)', 'Hypothalamic nucleus that is the body\'s master clock.', 'הגרעין העל-מצטלבי (SCN)', 'גרעין בהיפותלמוס שהוא השעון הראשי של הגוף.'],
        ['Melatonin', 'Hormone released by the pineal gland at night that promotes sleep.', 'מלטונין', 'הורמון שמופרש מבלוטת האצטרובל בלילה ומקדם שינה.'],
        ['Seasonal affective disorder', 'Depression linked to the short days of winter.', 'הפרעה רגשית עונתית', 'דיכאון הקשור לימי החורף הקצרים.'],
      ],
      quiz: [
        ['Which structure is the body\'s master circadian clock?', 'איזה מבנה הוא השעון הצירקדי הראשי של הגוף?', ['Pineal gland', 'Suprachiasmatic nucleus', 'Pons', 'Hippocampus'], ['בלוטת האצטרובל', 'הגרעין העל-מצטלבי', 'הגשר', 'ההיפוקמפוס'], 1, 'The SCN drives rhythms; the pineal gland is one of its outputs.', 'ה-SCN מניע את הקצבים; בלוטת האצטרובל היא אחד הפלטים שלו.'],
        ['The most powerful zeitgeber for humans is…', 'הצייטגבר החזק ביותר לבני אדם הוא…', ['food', 'light', 'temperature', 'exercise'], ['אוכל', 'אור', 'טמפרטורה', 'פעילות גופנית'], 1, 'Light reaches the SCN via melanopsin ganglion cells.', 'האור מגיע ל-SCN דרך תאי גנגליון עם מלנופסין.'],
      ],
    },
    {
      title: { en: 'Stages of sleep and dreaming', he: 'שלבי השינה וחלימה' },
      diagram: 'sleepStages',
      regions: ['pons', 'thalamus', 'reticular'],
      body: {
        en: [
          'Sleep is studied with **EEG** (brain waves), plus recordings of eye movements and muscle tone. When awake and alert, the EEG shows fast, irregular **beta** waves; when relaxed with eyes closed, **alpha** waves.',
          '## NREM and REM',
          'Sleep has two main types. **NREM** (non-REM) sleep is divided into stages of deepening sleep: **Stage 1** is light, drifting sleep (theta waves); **Stage 2** shows **sleep spindles** and **K-complexes**; **Stages 3 and 4** together form **slow-wave sleep**, with large, slow **delta** waves (Stage 4 has the most delta) — the deepest sleep and the hardest to wake from. (Newer scoring systems merge Stages 3 and 4 into one stage, N3.) **REM sleep** (rapid eye movement) has a fast, wake-like EEG, rapid eye movements and vivid dreams, yet the body\'s muscles are almost completely paralysed (**atonia**) — that is why it is also called "paradoxical sleep".',
          'Through the night we cycle through these stages about every **90 minutes**. Slow-wave sleep dominates the first half of the night, and REM periods get longer toward morning.',
          '## Across the life span and dreaming',
          'Newborns sleep 16+ hours and spend about half of it in REM. Total sleep and slow-wave sleep decrease with age. Dreams in REM are vivid, story-like and emotional; NREM dreams are shorter and more thought-like. The **activation-synthesis** theory proposes that dreams are the cortex trying to make sense of random brainstem activity, while other views see dreams as related to emotional processing and memory.',
        ],
        he: [
          'שינה נחקרת בעזרת **EEG** (גלי מוח), יחד עם הקלטות של תנועות עיניים וטונוס שרירים. בערות ודריכות ה-EEG מראה גלי **בטא** מהירים ולא סדירים; ברגיעה עם עיניים עצומות, גלי **אלפא**.',
          '## NREM ו-REM',
          'לשינה שני סוגים עיקריים. שנת **NREM** (שאינה REM) מחולקת לשלבים של שינה המעמיקה בהדרגה: **שלב 1** הוא שינה קלה ומרחפת (גלי תטא); **שלב 2** מראה **כישורי שינה** ו**קומפלקסי K**; **שלבים 3 ו-4** יחד יוצרים את **שינת הגלים האיטיים**, עם גלי **דלתא** גדולים ואיטיים (בשלב 4 יש הכי הרבה דלתא) — השינה העמוקה ביותר, שממנה הכי קשה להעיר. (שיטות דירוג חדשות מאחדות את שלבים 3 ו-4 לשלב אחד, N3.) **שנת REM** (תנועות עיניים מהירות) מאופיינת ב-EEG מהיר הדומה לערות, תנועות עיניים מהירות וחלומות חיים, ובכל זאת שרירי הגוף משותקים כמעט לחלוטין (**אטוניה**) — ולכן היא נקראת גם "שינה פרדוקסלית".',
          'במהלך הלילה אנחנו עוברים בין השלבים במחזורים של כ-**90 דקות**. שינת גלים איטיים שולטת במחצית הראשונה של הלילה, ותקופות ה-REM מתארכות לקראת הבוקר.',
          '## לאורך החיים וחלימה',
          'יילודים ישנים 16 שעות ויותר ומבלים כמחציתן ב-REM. סך השינה ושינת הגלים האיטיים פוחתים עם הגיל. חלומות ב-REM חיים, סיפוריים ורגשיים; חלומות NREM קצרים יותר ודומים יותר למחשבות. תיאוריית **ההפעלה-סינתזה** מציעה שחלומות הם ניסיון של הקליפה למצוא משמעות בפעילות אקראית מגזע המוח, ואילו גישות אחרות רואות בחלומות חלק מעיבוד רגשי וזיכרון.',
        ],
      },
      points: {
        en: ['Awake: beta/alpha; Stage 1: theta; Stage 2: spindles & K-complexes; Stages 3–4: delta (slow-wave sleep).', 'REM: wake-like EEG, rapid eye movements, vivid dreams, muscle paralysis.', 'Cycles last ~90 minutes; REM increases toward morning.', 'Infants have much more REM; slow-wave sleep declines with age.'],
        he: ['ערות: בטא/אלפא; שלב 1: תטא; שלב 2: כישורים וקומפלקסי K; שלבים 3–4: דלתא (שינת גלים איטיים).', 'REM: EEG דמוי ערות, תנועות עיניים מהירות, חלומות חיים, שיתוק שרירים.', 'מחזורים נמשכים כ-90 דקות; ה-REM מתגבר לקראת הבוקר.', 'לתינוקות הרבה יותר REM; שינת גלים איטיים פוחתת עם הגיל.'],
      },
      terms: [
        ['REM sleep', 'Sleep with rapid eye movements, a wake-like EEG, vivid dreams and muscle paralysis.', 'שנת REM', 'שינה עם תנועות עיניים מהירות, EEG דמוי ערות, חלומות חיים ושיתוק שרירים.'],
        ['Slow-wave sleep', 'Deepest NREM sleep (Stages 3 and 4), with large slow delta waves.', 'שינת גלים איטיים', 'שנת ה-NREM העמוקה ביותר (שלבים 3 ו-4), עם גלי דלתא גדולים ואיטיים.'],
        ['Sleep spindles', 'Short bursts of EEG activity typical of Stage 2 sleep.', 'כישורי שינה', 'פרצים קצרים של פעילות EEG האופייניים לשלב 2.'],
        ['Activation-synthesis theory', 'Dreams are the cortex interpreting random brainstem signals.', 'תיאוריית ההפעלה-סינתזה', 'חלומות הם פרשנות של הקליפה לאותות אקראיים מגזע המוח.'],
      ],
      quiz: [
        ['Which sleep stage has large, slow delta waves?', 'באיזה שלב שינה יש גלי דלתא גדולים ואיטיים?', ['Stage 1', 'Stage 2', 'Stages 3–4 (slow-wave)', 'REM'], ['שלב 1', 'שלב 2', 'שלבים 3–4 (גלים איטיים)', 'REM'], 2, 'Delta waves define slow-wave sleep, the deepest stage.', 'גלי דלתא מגדירים את שינת הגלים האיטיים, השלב העמוק ביותר.'],
        ['Why is REM called "paradoxical sleep"?', 'מדוע REM נקראת "שינה פרדוקסלית"?', ['The brain looks awake but the muscles are paralysed', 'It happens only in the afternoon', 'There are no dreams', 'Breathing stops'], ['המוח נראה ער אך השרירים משותקים', 'היא קורית רק אחר הצהריים', 'אין חלומות', 'הנשימה נעצרת'], 0, 'The EEG resembles waking, while the body is in atonia.', 'ה-EEG דומה לערות, בעוד הגוף נמצא באטוניה.'],
      ],
    },
    {
      title: { en: 'Why we sleep and how the brain controls it', he: 'למה אנחנו ישנים ואיך המוח שולט בכך' },
      diagram: null,
      regions: ['reticular', 'pons', 'hypothalamus', 'thalamus', 'hippocampus'],
      body: {
        en: [
          '## Functions of sleep',
          'Several theories, each with support: sleep **keeps us safe** by keeping us still when activity would be dangerous or wasteful; sleep **restores** the body and brain (growth hormone is released in slow-wave sleep, and during sleep the brain clears waste products faster); and sleep **helps memory** — slow-wave sleep strengthens facts and events, REM may help skills and emotional memories. Sleep deprivation harms attention, mood, immunity and metabolism; short sleep is linked to **obesity**, partly via changes in leptin and ghrelin.',
          '## Brain mechanisms',
          '**Wakefulness** is maintained by arousal systems from the brainstem and hypothalamus: acetylcholine, norepinephrine (locus coeruleus), serotonin (raphe nuclei), histamine, and the hypothalamic peptide **orexin (hypocretin)**, which stabilizes waking. **NREM sleep** is promoted by the **ventrolateral preoptic area (VLPO)** of the hypothalamus, which releases GABA to switch off the arousal systems — like a flip-flop switch. Sleep pressure builds through the day as **adenosine** accumulates (caffeine blocks it).',
          '**REM sleep** is switched on by cholinergic "REM-on" cells in the **pons**, while norepinephrine and serotonin cells become silent. The pons also sends signals to the spinal cord that paralyse the muscles during REM.',
        ],
        he: [
          '## תפקידי השינה',
          'יש כמה תיאוריות, ולכל אחת תמיכה: השינה **שומרת עלינו** בכך שהיא משאירה אותנו דוממים כשפעילות הייתה מסוכנת או בזבזנית; השינה **משקמת** את הגוף והמוח (הורמון גדילה משתחרר בשינת גלים איטיים, ובזמן שינה המוח מפנה פסולת מהר יותר); והשינה **עוזרת לזיכרון** — שינת גלים איטיים מחזקת עובדות ואירועים, ו-REM עשויה לעזור למיומנויות ולזיכרונות רגשיים. מחסור בשינה פוגע בקשב, במצב הרוח, בחסינות ובחילוף החומרים; שינה קצרה קשורה ל**השמנה**, בין השאר דרך שינויים בלפטין ובגרלין.',
          '## מנגנונים מוחיים',
          '**ערות** נשמרת על ידי מערכות עוררות מגזע המוח ומההיפותלמוס: אצטילכולין, נוראפינפרין (הלוקוס צרולאוס), סרוטונין (גרעיני הרפה), היסטמין, והפפטיד ההיפותלמי **אורקסין (היפוקרטין)**, שמייצב ערות. **שנת NREM** מקודמת על ידי **האזור הפרה-אופטי הגחוני-צידי (VLPO)** בהיפותלמוס, שמשחרר GABA כדי לכבות את מערכות העוררות — כמו מתג דו-מצבי. לחץ השינה נבנה במהלך היום כש**אדנוזין** מצטבר (קפאין חוסם אותו).',
          '**שנת REM** מופעלת על ידי תאי "REM-on" כולינרגיים ב**גשר (Pons)**, בזמן שתאי הנוראפינפרין והסרוטונין משתתקים. הגשר גם שולח אותות לחוט השדרה שמשתקים את השרירים בזמן REM.',
        ],
      },
      points: {
        en: ['Sleep protects, restores and consolidates memory.', 'Orexin and monoamine systems keep us awake.', 'The VLPO uses GABA to switch on NREM sleep; adenosine builds sleep pressure.', 'REM is triggered by cholinergic cells in the pons.'],
        he: ['השינה מגינה, משקמת ומקבעת זיכרונות.', 'אורקסין ומערכות מונואמינים שומרים עלינו ערים.', 'ה-VLPO משתמש ב-GABA להפעלת שנת NREM; אדנוזין בונה לחץ שינה.', 'REM מופעלת על ידי תאים כולינרגיים בגשר.'],
      },
      terms: [
        ['Orexin (hypocretin)', 'Hypothalamic peptide that stabilises wakefulness; lost in narcolepsy.', 'אורקסין (היפוקרטין)', 'פפטיד היפותלמי שמייצב ערות; אובד בנרקולפסיה.'],
        ['VLPO', 'Ventrolateral preoptic area: hypothalamic region that promotes NREM sleep.', 'VLPO', 'האזור הפרה-אופטי הגחוני-צידי: אזור בהיפותלמוס שמקדם שנת NREM.'],
        ['Adenosine', 'Chemical that builds up during waking and increases sleep pressure.', 'אדנוזין', 'חומר שמצטבר בזמן ערות ומגביר את לחץ השינה.'],
        ['Locus coeruleus', 'Pontine nucleus that supplies norepinephrine for arousal; silent in REM.', 'הלוקוס צרולאוס', 'גרעין בגשר שמספק נוראפינפרין לעוררות; שקט ב-REM.'],
      ],
      quiz: [
        ['Which brain area triggers REM sleep?', 'איזה אזור מוח מפעיל שנת REM?', ['Pons', 'Occipital lobe', 'Amygdala', 'Corpus callosum'], ['הגשר', 'האונה העורפית', 'האמיגדלה', 'הכפיס'], 0, 'Cholinergic REM-on cells in the pons switch REM on.', 'תאי REM-on כולינרגיים בגשר מפעילים את ה-REM.'],
      ],
    },
    {
      title: { en: 'Sleep disorders', he: 'הפרעות שינה' },
      diagram: null,
      regions: ['hypothalamus', 'pons', 'medulla'],
      body: {
        en: [
          '## Dyssomnias (problems with the amount or timing of sleep)',
          '**Insomnia** — trouble falling or staying asleep — is the most common complaint. Causes include stress, anxiety, depression, pain, caffeine and irregular schedules. Sleeping pills can cause tolerance and rebound insomnia; **cognitive-behavioural therapy** (regular schedule, using the bed only for sleep) works well long-term.',
          '**Narcolepsy** involves overwhelming daytime sleepiness and sudden attacks of REM sleep, often with **cataplexy** — sudden muscle weakness triggered by strong emotion such as laughter. It results from loss of **orexin** neurons in the hypothalamus. **Sleep apnea** is repeated stopping of breathing during sleep, often due to a blocked airway in overweight people (or, less often, to brainstem problems). It causes loud snoring and daytime sleepiness and raises heart risks; a **CPAP** machine keeps the airway open. **Sudden infant death syndrome (SIDS)** risk falls when babies sleep on their backs.',
          '## Parasomnias (unusual behaviours during sleep)',
          '**Sleepwalking** and **night terrors** happen during slow-wave sleep and are common in children; the person usually does not remember them. **Nightmares** are frightening dreams in REM sleep. In **REM sleep behaviour disorder**, the normal paralysis fails, so people act out their dreams — sometimes violently; it can be an early sign of Parkinson\'s disease. **Restless legs syndrome** causes uncomfortable leg sensations and an urge to move, interfering with sleep.',
        ],
        he: [
          '## דיסומניות (בעיות בכמות או בתזמון השינה)',
          '**נדודי שינה (Insomnia)** — קושי להירדם או להישאר ישן — היא התלונה הנפוצה ביותר. הגורמים כוללים לחץ, חרדה, דיכאון, כאב, קפאין ולוח זמנים לא סדיר. כדורי שינה עלולים לגרום לסבילות ולנדודי שינה חוזרים; **טיפול קוגניטיבי-התנהגותי** (לוח זמנים קבוע, שימוש במיטה רק לשינה) יעיל בטווח הארוך.',
          '**נרקולפסיה** כוללת ישנוניות יום עזה והתקפים פתאומיים של שנת REM, לעיתים קרובות עם **קטפלקסיה** — חולשת שרירים פתאומית שמופעלת על ידי רגש חזק כמו צחוק. היא נובעת מאובדן נוירוני **אורקסין** בהיפותלמוס. **דום נשימה בשינה (Sleep apnea)** הוא הפסקות חוזרות בנשימה בזמן שינה, לרוב בגלל דרכי אוויר חסומות אצל אנשים עם עודף משקל (או, לעיתים רחוקות, בעיות בגזע המוח). הוא גורם לנחירות חזקות ולישנוניות יום ומעלה סיכונים ללב; מכשיר **CPAP** שומר על דרכי האוויר פתוחות. הסיכון ל**מוות בעריסה (SIDS)** יורד כשתינוקות ישנים על הגב.',
          '## פאראסומניות (התנהגויות חריגות בשינה)',
          '**הליכה בשינה** ו**ביעותי לילה** קורים בשינת גלים איטיים ושכיחים בילדים; האדם בדרך כלל אינו זוכר אותם. **סיוטים** הם חלומות מפחידים בשנת REM. ב**הפרעת התנהגות בשנת REM**, השיתוק הרגיל נכשל, ולכן אנשים "משחקים" את החלומות שלהם — לפעמים באלימות; זה יכול להיות סימן מוקדם לפרקינסון. **תסמונת הרגליים חסרות המנוחה** גורמת לתחושות לא נעימות ברגליים ולדחף להזיז אותן, ופוגעת בשינה.',
        ],
      },
      points: {
        en: ['Insomnia: CBT is an effective long-term treatment.', 'Narcolepsy: loss of orexin neurons; cataplexy triggered by emotion.', 'Sleep apnea: breathing stops repeatedly; treated with CPAP.', 'Sleepwalking/night terrors in slow-wave sleep; REM behaviour disorder = acting out dreams.'],
        he: ['נדודי שינה: טיפול קוגניטיבי-התנהגותי יעיל לטווח ארוך.', 'נרקולפסיה: אובדן נוירוני אורקסין; קטפלקסיה מופעלת על ידי רגש.', 'דום נשימה בשינה: הנשימה נעצרת שוב ושוב; מטופל ב-CPAP.', 'הליכה בשינה/ביעותי לילה בשינת גלים איטיים; הפרעת התנהגות ב-REM = "משחק" החלומות.'],
      },
      terms: [
        ['Insomnia', 'Difficulty falling asleep or staying asleep.', 'נדודי שינה', 'קושי להירדם או להישאר ישן.'],
        ['Narcolepsy', 'Disorder of excessive sleepiness and sudden REM attacks, linked to orexin loss.', 'נרקולפסיה', 'הפרעה של ישנוניות יתר והתקפי REM פתאומיים, הקשורה לאובדן אורקסין.'],
        ['Cataplexy', 'Sudden loss of muscle tone triggered by strong emotion.', 'קטפלקסיה', 'אובדן פתאומי של טונוס שרירים המופעל על ידי רגש חזק.'],
        ['Sleep apnea', 'Repeated pauses in breathing during sleep.', 'דום נשימה בשינה', 'הפסקות חוזרות בנשימה בזמן שינה.'],
        ['REM sleep behaviour disorder', 'Lack of REM paralysis, so dreams are acted out.', 'הפרעת התנהגות בשנת REM', 'היעדר שיתוק ב-REM, ולכן החלומות "משוחקים".'],
      ],
      quiz: [
        ['Narcolepsy is associated with the loss of which neurons?', 'נרקולפסיה קשורה לאובדן אילו נוירונים?', ['Dopamine neurons', 'Orexin neurons', 'Motor neurons', 'Hair cells'], ['נוירוני דופמין', 'נוירוני אורקסין', 'נוירונים מוטוריים', 'תאי שערה'], 1, 'Orexin neurons in the hypothalamus stabilise wakefulness.', 'נוירוני אורקסין בהיפותלמוס מייצבים ערות.'],
        ['Sleepwalking usually occurs during…', 'הליכה בשינה מתרחשת בדרך כלל בזמן…', ['REM sleep', 'slow-wave sleep', 'Stage 1', 'waking'], ['שנת REM', 'שינת גלים איטיים', 'שלב 1', 'ערות'], 1, 'Sleepwalking and night terrors arise from slow-wave sleep.', 'הליכה בשינה וביעותי לילה מופיעים בשינת גלים איטיים.'],
      ],
    },
  ],
};
