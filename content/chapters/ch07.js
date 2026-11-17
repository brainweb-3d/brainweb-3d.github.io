// Format explained at the top of ch01.js
export default {
  n: 7,
  icon: '👂',
  color: '#00a8a8',
  title: { en: 'Nonvisual Sensation and Perception', he: 'חישה ותפיסה שאינן חזותיות' },
  intro: {
    en: 'Hearing, balance, touch, temperature, pain, smell and taste — how each sense turns the world into nerve signals.',
    he: 'שמיעה, שיווי משקל, מגע, טמפרטורה, כאב, ריח וטעם — איך כל חוש הופך את העולם לאותות עצביים.',
  },
  lessons: [
    {
      title: { en: 'Hearing (audition)', he: 'שמיעה' },
      diagram: 'ear',
      regions: ['temporal', 'inferiorColliculus', 'thalamus'],
      body: {
        en: [
          'Sound is a wave of pressure changes in the air. Its **frequency** (cycles per second, Hz) is heard as **pitch** — humans hear roughly 20 to 20,000 Hz. Its **amplitude** is heard as **loudness**, measured in decibels (dB); long exposure above ~85 dB can damage hearing. Complex mixtures of frequencies give each voice or instrument its **timbre**.',
          '## The ear',
          'The **outer ear** (pinna and canal) funnels sound to the **eardrum (tympanic membrane)**. In the **middle ear**, three tiny bones — the **malleus, incus and stapes** — amplify the vibration and pass it to the **oval window** of the **cochlea**, the fluid-filled, snail-shaped **inner ear**. Inside, the **basilar membrane** vibrates; high frequencies move its base and low frequencies its tip. On it sits the **organ of Corti**, with **hair cells** whose tiny hairs (stereocilia) bend against the tectorial membrane, opening ion channels — this is **transduction** of sound into nerve signals.',
          '## To the brain and pitch perception',
          'The auditory nerve carries signals through the brainstem (cochlear nuclei, superior olive), the **inferior colliculus** and the **medial geniculate nucleus** of the thalamus to the **primary auditory cortex** in the temporal lobe, which is organized by frequency (**tonotopic**). Pitch is coded by **place** (where the basilar membrane vibrates most — especially for high tones) and by **timing** (neurons firing in step with low-frequency sounds). We locate sounds by comparing the **timing** and **loudness** differences between the two ears.',
          '## Hearing loss',
          '**Conduction deafness** comes from problems in the outer or middle ear (e.g. infections), and is often treatable. **Sensorineural deafness** comes from damage to hair cells or the auditory nerve (loud noise, aging, some drugs); **cochlear implants** can bypass damaged hair cells. **Tinnitus** is a ringing in the ears.',
        ],
        he: [
          'קול הוא גל של שינויי לחץ באוויר. **התדירות** שלו (מחזורים בשנייה, הרץ) נשמעת כ**גובה הצליל** — בני אדם שומעים בערך 20 עד 20,000 הרץ. **המשרעת** שלו נשמעת כ**עוצמה**, ונמדדת בדציבלים; חשיפה ממושכת מעל כ-85 דציבל עלולה לפגוע בשמיעה. שילובים מורכבים של תדירויות נותנים לכל קול או כלי את **גוון הצליל (Timbre)**.',
          '## האוזן',
          '**האוזן החיצונית** (אפרכסת ותעלה) מתעלת את הקול ל**עור התוף**. ב**אוזן התיכונה**, שלוש עצמות זעירות — **הפטיש, הסדן והארכובה** — מגבירות את הרטט ומעבירות אותו ל**חלון הסגלגל** של **השבלול (Cochlea)**, **האוזן הפנימית** המלאה בנוזל ובצורת שבלול. בפנים **הממברנה הבזילרית** רוטטת; תדירויות גבוהות מזיזות את בסיסה ותדירויות נמוכות את קצהָ. עליה יושב **אבר קורטי**, עם **תאי שערה** שהשערות הזעירות שלהם מתכופפות מול הממברנה הטקטוריאלית ופותחות תעלות יונים — זוהי **התמרה** של קול לאותות עצביים.',
          '## אל המוח ותפיסת גובה צליל',
          'עצב השמע מעביר אותות דרך גזע המוח (גרעיני השבלול, הזית העליון), **הגבעון התחתון** ו**הגרעין הברכי האמצעי** שבתלמוס אל **קליפת השמע הראשונית** באונה הרקתית, המאורגנת לפי תדירות (**טונוטופית**). גובה הצליל מקודד לפי **מקום** (היכן הממברנה הבזילרית רוטטת הכי חזק — במיוחד לצלילים גבוהים) ולפי **תזמון** (נוירונים שיורים בקצב של צלילים נמוכים). אנחנו מאתרים צלילים על ידי השוואת הבדלי **הזמן** ו**העוצמה** בין שתי האוזניים.',
          '## אובדן שמיעה',
          '**חירשות הולכתית** נובעת מבעיות באוזן החיצונית או התיכונה (למשל דלקות), ולעיתים קרובות ניתנת לטיפול. **חירשות תחושתית-עצבית** נובעת מנזק לתאי השערה או לעצב השמע (רעש חזק, גיל, תרופות מסוימות); **שתל שבלול** יכול לעקוף תאי שערה פגועים. **טנטון** הוא צלצול באוזניים.',
        ],
      },
      points: {
        en: ['Frequency → pitch; amplitude → loudness.', 'Eardrum → ossicles → cochlea; hair cells transduce sound.', 'Auditory cortex in the temporal lobe is tonotopic.', 'Pitch coded by place and timing; sounds located by between-ear differences.'],
        he: ['תדירות ← גובה צליל; משרעת ← עוצמה.', 'עור התוף ← עצמות השמע ← השבלול; תאי השערה מתמירים את הקול.', 'קליפת השמע באונה הרקתית מאורגנת טונוטופית.', 'גובה צליל מקודד לפי מקום ותזמון; צלילים מאותרים לפי הבדלים בין האוזניים.'],
      },
      terms: [
        ['Cochlea', 'Fluid-filled, snail-shaped inner-ear structure containing the hearing receptors.', 'השבלול (Cochlea)', 'מבנה באוזן הפנימית, מלא נוזל ובצורת שבלול, המכיל את קולטני השמיעה.'],
        ['Hair cells', 'Auditory receptor cells on the basilar membrane.', 'תאי שערה', 'תאי קולטן שמיעתיים על הממברנה הבזילרית.'],
        ['Ossicles', 'Three middle-ear bones (malleus, incus, stapes) that amplify sound.', 'עצמות השמע', 'שלוש עצמות האוזן התיכונה (פטיש, סדן, ארכובה) שמגבירות את הקול.'],
        ['Tonotopic organization', 'Arrangement of neurons by the sound frequency they respond to.', 'ארגון טונוטופי', 'סידור נוירונים לפי תדירות הקול שהם מגיבים אליה.'],
        ['Sensorineural deafness', 'Hearing loss from damage to hair cells or the auditory nerve.', 'חירשות תחושתית-עצבית', 'אובדן שמיעה עקב נזק לתאי השערה או לעצב השמע.'],
      ],
      quiz: [
        ['Which feature of a sound wave is heard as pitch?', 'איזו תכונה של גל קול נשמעת כגובה צליל?', ['Amplitude', 'Frequency', 'Timbre', 'Duration'], ['משרעת', 'תדירות', 'גוון', 'משך'], 1, 'Higher frequency = higher pitch.', 'תדירות גבוהה יותר = צליל גבוה יותר.'],
        ['Where is the primary auditory cortex?', 'היכן נמצאת קליפת השמע הראשונית?', ['Occipital lobe', 'Temporal lobe', 'Frontal lobe', 'Cerebellum'], ['האונה העורפית', 'האונה הרקתית', 'האונה המצחית', 'המוח הקטן'], 1, 'It lies in the temporal lobe, near the ear.', 'היא נמצאת באונה הרקתית, ליד האוזן.'],
      ],
    },
    {
      title: { en: 'Balance and touch', he: 'שיווי משקל ומגע' },
      diagram: 'homunculus',
      regions: ['somatosensory', 'cerebellum', 'thalamus', 'spinalCord'],
      body: {
        en: [
          '## The vestibular system',
          'Next to the cochlea, the **vestibular system** senses head position and movement. Three fluid-filled **semicircular canals**, set at right angles, detect head rotation; the **otolith organs** (utricle and saccule) detect tilt and straight-line acceleration. Hair cells again do the sensing. Signals go to the brainstem and **cerebellum** to keep balance and stabilize the eyes. When the vestibular sense disagrees with vision, we may get **motion sickness**.',
          '## Touch',
          'The skin contains several types of **mechanoreceptors**: **Meissner\'s corpuscles** (light touch, in hairless skin), **Merkel\'s discs** (pressure and texture), **Pacinian corpuscles** (vibration, deep in the skin) and **Ruffini endings** (stretch). They adapt at different speeds — some respond only to change.',
          'Touch information travels up the spinal cord (crossing to the other side in the medulla), through the thalamus, to the **primary somatosensory cortex** in the parietal lobe. This cortex is a body map — the **somatosensory homunculus** — where the lips and fingers take up huge areas. The two-point test shows that fingertips can tell apart points only a few millimetres apart, while the back cannot. After amputation, the brain map reorganizes, which may contribute to **phantom limb** sensations. **Proprioception** — the sense of body position — comes from receptors in muscles and joints.',
        ],
        he: [
          '## המערכת הוסטיבולרית',
          'לצד השבלול, **המערכת הוסטיבולרית (מערכת שיווי המשקל)** חשה את מנח הראש ותנועתו. שלוש **תעלות חצי-מעגליות** מלאות נוזל, הממוקמות בזוויות ישרות זו לזו, מזהות סיבוב של הראש; **אברי האוטולית** (האוטריקולוס והסקולוס) מזהים הטיה ותאוצה בקו ישר. גם כאן תאי שערה עושים את החישה. האותות מגיעים לגזע המוח ול**מוח הקטן** כדי לשמור על שיווי משקל ולייצב את העיניים. כשחוש שיווי המשקל אינו מתאים לראייה, עלולה להופיע **מחלת תנועה**.',
          '## מגע',
          'בעור יש כמה סוגים של **קולטני מכניים**: **גופיפי מייסנר** (מגע קל, בעור ללא שיער), **דיסקיות מרקל** (לחץ ומרקם), **גופיפי פאצ\'יני** (רטט, עמוק בעור) ו**קצות רופיני** (מתיחה). הם מסתגלים במהירויות שונות — חלקם מגיבים רק לשינוי.',
          'מידע על מגע עולה בחוט השדרה (וחוצה לצד השני במוח המוארך), דרך התלמוס, אל **קליפת המוח הסומטו-סנסורית הראשונית** באונה הקודקודית. קליפה זו היא מפת גוף — **ההומונקולוס הסומטו-סנסורי** — שבה לשפתיים ולאצבעות יש אזורים ענקיים. מבחן שתי הנקודות מראה שקצות האצבעות מבחינים בין נקודות שמרוחקות מילימטרים ספורים, והגב לא. לאחר קטיעה, מפת המוח מתארגנת מחדש, מה שעשוי לתרום לתחושות **איבר פנטום**. **פרופריוצפציה** — תחושת מנח הגוף — מגיעה מקולטנים בשרירים ובמפרקים.',
        ],
      },
      points: {
        en: ['Semicircular canals detect rotation; otoliths detect tilt and acceleration.', 'Different skin receptors sense light touch, pressure, vibration and stretch.', 'The somatosensory cortex is a distorted body map (homunculus).', 'Phantom limbs relate to reorganization of that map.'],
        he: ['תעלות חצי-מעגליות מזהות סיבוב; אוטוליתים מזהים הטיה ותאוצה.', 'קולטני עור שונים חשים מגע קל, לחץ, רטט ומתיחה.', 'הקליפה הסומטו-סנסורית היא מפת גוף מעוותת (הומונקולוס).', 'איבר פנטום קשור לארגון מחדש של המפה הזו.'],
      },
      terms: [
        ['Semicircular canals', 'Three fluid-filled inner-ear canals that detect head rotation.', 'תעלות חצי-מעגליות', 'שלוש תעלות מלאות נוזל באוזן הפנימית שמזהות סיבוב ראש.'],
        ['Mechanoreceptor', 'A receptor that responds to physical pressure, stretch or vibration.', 'קולטן מכני', 'קולטן שמגיב ללחץ פיזי, מתיחה או רטט.'],
        ['Pacinian corpuscle', 'Deep skin receptor that responds to vibration.', 'גופיף פאצ\'יני', 'קולטן עמוק בעור שמגיב לרטט.'],
        ['Somatosensory homunculus', 'The body map in the somatosensory cortex, with large areas for sensitive parts.', 'הומונקולוס סומטו-סנסורי', 'מפת הגוף בקליפה הסומטו-סנסורית, עם אזורים גדולים לחלקים רגישים.'],
        ['Phantom limb', 'Sensations that seem to come from a missing body part.', 'איבר פנטום', 'תחושות שנדמה שמגיעות מאיבר חסר.'],
      ],
      quiz: [
        ['Which structures detect ROTATION of the head?', 'אילו מבנים מזהים סיבוב של הראש?', ['Otolith organs', 'Semicircular canals', 'Cochlea', 'Pacinian corpuscles'], ['אברי האוטולית', 'התעלות החצי-מעגליות', 'השבלול', 'גופיפי פאצ\'יני'], 1, 'The three canals detect rotation in three dimensions.', 'שלוש התעלות מזהות סיבוב בשלושה ממדים.'],
        ['Why do the lips and fingers have large areas in the somatosensory cortex?', 'מדוע לשפתיים ולאצבעות יש אזורים גדולים בקליפה הסומטו-סנסורית?', ['They are physically large', 'They have many receptors and need fine sensitivity', 'They are closest to the brain', 'They never adapt'], ['הן גדולות פיזית', 'יש בהן קולטנים רבים והן זקוקות לרגישות עדינה', 'הן הכי קרובות למוח', 'הן לעולם אינן מסתגלות'], 1, 'Cortical space reflects receptor density and importance, not size.', 'השטח בקליפה משקף צפיפות קולטנים וחשיבות, לא גודל.'],
      ],
    },
    {
      title: { en: 'Temperature and pain', he: 'טמפרטורה וכאב' },
      diagram: 'pain',
      regions: ['somatosensory', 'cingulate', 'pag', 'spinalCord', 'thalamus'],
      body: {
        en: [
          'Temperature is sensed by **free nerve endings** with separate "warm" and "cold" receptors. Some are activated by chemicals: the **TRPV1** receptor responds to heat and to **capsaicin** (from hot peppers), and the TRPM8 receptor responds to cold and to **menthol** — which is why chilli feels hot and mint feels cool.',
          '## Pain',
          'Pain is a warning system. **Nociceptors** (pain receptors) respond to damaging heat, pressure or chemicals. Fast, myelinated **Aδ fibres** carry sharp, first pain; slow, unmyelinated **C fibres** carry dull, aching second pain. Pain signals use glutamate and **substance P**, cross in the spinal cord and rise to the thalamus, then to the **somatosensory cortex** (where and how intense) and the **anterior cingulate cortex** (how unpleasant it feels). People born unable to feel pain often suffer serious injuries.',
          '## Controlling pain',
          'The **gate theory** (Melzack and Wall) suggests that touch signals can "close a gate" in the spinal cord, reducing pain — which is why rubbing a bump helps. The brain also sends signals down from the **periaqueductal gray** (PAG) that block pain, using **endorphins**; stress, acupuncture and placebos may activate this system. Opiates like morphine work on the same opioid receptors. Long-lasting **chronic pain** may involve changes in the spinal cord and brain that keep pain going after the injury has healed.',
        ],
        he: [
          'טמפרטורה נחושה על ידי **קצות עצב חופשיים** עם קולטנים נפרדים ל"חם" ול"קר". חלקם מופעלים על ידי חומרים כימיים: הקולטן **TRPV1** מגיב לחום ול**קפסאיצין** (מפלפל חריף), והקולטן TRPM8 מגיב לקור ול**מנתול** — ולכן צ\'ילי מרגיש חם ומנטה מרגישה קרירה.',
          '## כאב',
          'כאב הוא מערכת אזעקה. **נוסיצפטורים** (קולטני כאב) מגיבים לחום, ללחץ או לחומרים מזיקים. סיבי **Aδ** מהירים ועטופי מיאלין נושאים כאב חד וראשוני; סיבי **C** איטיים וללא מיאלין נושאים כאב עמום ומתמשך שני. אותות כאב משתמשים בגלוטמט וב**חומר P**, חוצים בחוט השדרה ועולים לתלמוס, ומשם ל**קליפה הסומטו-סנסורית** (היכן ובאיזו עוצמה) ול**קליפת החגורה הקדמית** (עד כמה זה לא נעים). אנשים שנולדו ללא יכולת לחוש כאב סובלים לעיתים קרובות מפציעות קשות.',
          '## שליטה בכאב',
          '**תיאוריית השער** (מלזאק וּוול) מציעה שאותות מגע יכולים "לסגור שער" בחוט השדרה ולהפחית כאב — ולכן שפשוף מכה עוזר. המוח גם שולח אותות כלפי מטה מ**החומר האפור סביב אמת המים** (PAG) שחוסמים כאב, בעזרת **אנדורפינים**; לחץ, דיקור ופלצבו עשויים להפעיל מערכת זו. אופיאטים כמו מורפיום פועלים על אותם קולטנים לאופיואידים. **כאב כרוני** ממושך עשוי לכלול שינויים בחוט השדרה ובמוח שמשאירים את הכאב פעיל גם לאחר שהפציעה החלימה.',
        ],
      },
      points: {
        en: ['Capsaicin activates heat receptors; menthol activates cold receptors.', 'Aδ fibres = fast sharp pain; C fibres = slow dull pain.', 'Somatosensory cortex: where/how strong; cingulate: how unpleasant.', 'Gate theory and the PAG–endorphin system reduce pain.'],
        he: ['קפסאיצין מפעיל קולטני חום; מנתול מפעיל קולטני קור.', 'סיבי Aδ = כאב חד ומהיר; סיבי C = כאב עמום ואיטי.', 'קליפה סומטו-סנסורית: איפה ובאיזו עוצמה; חגורה: עד כמה לא נעים.', 'תיאוריית השער ומערכת PAG-אנדורפינים מפחיתות כאב.'],
      },
      terms: [
        ['Nociceptor', 'A receptor that responds to potentially damaging stimuli (pain).', 'נוסיצפטור', 'קולטן שמגיב לגירויים שעלולים להזיק (כאב).'],
        ['Substance P', 'A neuropeptide involved in transmitting pain signals.', 'חומר P', 'נוירופפטיד המעורב בהעברת אותות כאב.'],
        ['Gate theory', 'The idea that spinal "gates" can be closed by touch input or brain signals to reduce pain.', 'תיאוריית השער', 'הרעיון ש"שערים" בחוט השדרה יכולים להיסגר על ידי מגע או אותות מהמוח ולהפחית כאב.'],
        ['Capsaicin', 'The chemical in chilli peppers that activates heat/pain receptors (TRPV1).', 'קפסאיצין', 'החומר בפלפל חריף שמפעיל קולטני חום/כאב (TRPV1).'],
      ],
      quiz: [
        ['Rubbing your elbow after banging it reduces pain. Which idea explains this?', 'שפשוף המרפק אחרי מכה מפחית את הכאב. איזה רעיון מסביר זאת?', ['Trichromatic theory', 'Gate theory', 'Place theory', 'Opponent process'], ['התיאוריה התלת-צבעית', 'תיאוריית השער', 'תיאוריית המקום', 'התהליכים המנוגדים'], 1, 'Touch input can close the spinal pain gate.', 'קלט מגע יכול לסגור את שער הכאב בחוט השדרה.'],
        ['Which brain area is most linked to the UNPLEASANTNESS of pain?', 'איזה אזור מוח קשור יותר מכול לאי-הנעימות של כאב?', ['Anterior cingulate cortex', 'Primary visual cortex', 'Cerebellum', 'Olfactory bulb'], ['קליפת החגורה הקדמית', 'קליפת הראייה הראשונית', 'המוח הקטן', 'פקעת הריח'], 0, 'The anterior cingulate processes the emotional side of pain.', 'קליפת החגורה הקדמית מעבדת את הצד הרגשי של הכאב.'],
      ],
    },
    {
      title: { en: 'Smell and taste', he: 'ריח וטעם' },
      diagram: 'chemicalSenses',
      regions: ['olfactoryBulb', 'amygdala', 'thalamus', 'frontal'],
      body: {
        en: [
          '## Olfaction (smell)',
          'Odour molecules dissolve in the mucus of the nose and bind to receptors on **olfactory receptor neurons**. According to Buck and Axel, we use about 1,000 types of olfactory receptors (today: about 1,000 receptor genes are known in mice, but only about 400 work in humans); each odour activates a pattern of receptors, letting us tell apart a huge number of smells. These neurons are replaced throughout life. Their axons go to the **olfactory bulb**, and from there — **without** a thalamic relay — to the **amygdala**, the **piriform cortex** and the orbitofrontal cortex. This direct link to emotion and memory is why smells can bring back vivid memories. Many animals use **pheromones** — chemical signals between members of a species — detected by the vomeronasal organ; their role in humans is debated. Loss of smell can be an early sign of Parkinson\'s and Alzheimer\'s diseases.',
          '## Taste (gustation)',
          'Taste buds on the tongue\'s **papillae** contain receptor cells for five basic tastes: **sweet, salty, sour, bitter** and **umami** (savoury, from glutamate). Bitter detection protects us from poisons; sweet and umami signal nutrients. Taste signals travel through cranial nerves to the medulla, the thalamus and the **gustatory cortex** (insula). Much of what we call "flavour" is actually smell. **Supertasters**, who have many taste buds, find bitter foods intensely unpleasant.',
          '**Synesthesia** — when one sense triggers another, such as seeing colours when hearing sounds — shows how senses can mix in the brain.',
        ],
        he: [
          '## ריח',
          'מולקולות ריח מתמוססות בריר שבאף ונקשרות לקולטנים על **נוירוני קולטן הריח**. לפי באק ואקסל, אנו משתמשים בכ-1,000 סוגים של קולטני ריח (כיום: בעכברים ידועים כ-1,000 גנים של קולטנים, אבל אצל בני אדם רק כ-400 פעילים); כל ריח מפעיל דפוס של קולטנים, וכך אנו מבחינים בין מספר עצום של ריחות. נוירונים אלה מתחלפים לאורך החיים. האקסונים שלהם מגיעים ל**פקעת הריח**, ומשם — **בלי** ממסר בתלמוס — ל**אמיגדלה**, ל**קליפה הפיריפורמית** ולקליפה האורביטו-פרונטלית. הקשר הישיר לרגש ולזיכרון מסביר מדוע ריחות יכולים להחזיר זיכרונות חיים. בעלי חיים רבים משתמשים ב**פרומונים** — אותות כימיים בין בני אותו מין — שמזוהים על ידי האיבר הוומרונזלי; תפקידם בבני אדם שנוי במחלוקת. אובדן חוש הריח יכול להיות סימן מוקדם לפרקינסון ולאלצהיימר.',
          '## טעם',
          'בלוטות טעם על **הפטמות (Papillae)** של הלשון מכילות תאי קולטן לחמישה טעמים בסיסיים: **מתוק, מלוח, חמוץ, מר** ו**אוּמאמי** (טעם עשיר, מגלוטמט). זיהוי טעם מר מגן עלינו מרעלים; מתוק ואומאמי מאותתים על חומרי מזון. אותות הטעם עוברים דרך עצבים גולגולתיים למוח המוארך, לתלמוס ול**קליפת הטעם** (האינסולה). חלק גדול ממה שאנו מכנים "טעם" הוא למעשה ריח. **"סופר-טועמים"**, שיש להם בלוטות טעם רבות, חווים מזונות מרים כלא נעימים במיוחד.',
          '**סינסתזיה** — כשחוש אחד מעורר חוש אחר, למשל ראיית צבעים בעת שמיעת צלילים — מראה כיצד חושים יכולים להתערבב במוח.',
        ],
      },
      points: {
        en: ['Each odour activates a pattern among ~1,000 receptor types.', 'Smell bypasses the thalamus and reaches emotional areas directly.', 'Five basic tastes: sweet, salty, sour, bitter, umami.', 'Much of flavour is smell.'],
        he: ['כל ריח מפעיל דפוס בין כ-1,000 סוגי קולטנים.', 'הריח עוקף את התלמוס ומגיע ישירות לאזורים רגשיים.', 'חמישה טעמים בסיסיים: מתוק, מלוח, חמוץ, מר, אומאמי.', 'חלק גדול מהטעם הוא ריח.'],
      },
      terms: [
        ['Olfactory bulb', 'Brain structure that receives smell information from the nose.', 'פקעת הריח', 'מבנה מוחי שמקבל מידע ריח מהאף.'],
        ['Pheromone', 'A chemical signal between members of the same species.', 'פרומון', 'אות כימי בין בני אותו מין.'],
        ['Umami', 'The savoury basic taste, triggered by glutamate.', 'אומאמי', 'הטעם הבסיסי העשיר, המופעל על ידי גלוטמט.'],
        ['Gustatory cortex', 'Cortex (in the insula) that processes taste.', 'קליפת הטעם', 'קליפה (באינסולה) שמעבדת טעם.'],
        ['Synesthesia', 'A condition where stimulation of one sense triggers experiences in another.', 'סינסתזיה', 'מצב שבו גירוי של חוש אחד מעורר חוויות בחוש אחר.'],
      ],
      quiz: [
        ['Which sense does NOT pass through the thalamus before reaching the cortex?', 'איזה חוש אינו עובר דרך התלמוס לפני שהוא מגיע לקליפה?', ['Taste', 'Hearing', 'Smell', 'Touch'], ['טעם', 'שמיעה', 'ריח', 'מגע'], 2, 'Smell goes from the olfactory bulb directly to limbic and cortical areas.', 'ריח עובר מפקעת הריח ישירות לאזורים לימביים ולקליפה.'],
        ['Umami taste is triggered by…', 'טעם אומאמי מופעל על ידי…', ['sugar', 'glutamate', 'acids', 'salt'], ['סוכר', 'גלוטמט', 'חומצות', 'מלח'], 1, 'Umami is the savoury taste of glutamate.', 'אומאמי הוא הטעם העשיר של גלוטמט.'],
      ],
    },
  ],
};
