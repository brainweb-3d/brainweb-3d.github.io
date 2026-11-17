// Format explained at the top of ch01.js
export default {
  n: 6,
  icon: '👁️',
  color: '#9b51e0',
  title: { en: 'Vision', he: 'ראייה' },
  intro: {
    en: 'From light hitting the eye to seeing faces, colours and depth — and what happens when vision goes wrong.',
    he: 'מאור שפוגע בעין ועד ראיית פנים, צבעים ועומק — ומה קורה כשהראייה משתבשת.',
  },
  lessons: [
    {
      title: { en: 'Light, the eye and the retina', he: 'אור, העין והרשתית' },
      diagram: 'eye',
      regions: [],
      body: {
        en: [
          'Light is a small band of the **electromagnetic spectrum** — wavelengths from about 400 nm (violet) to 700 nm (red). Light travels fast and in straight lines, so it gives precise information about distant objects. Objects can absorb, reflect or bend (**refract**) light.',
          '## The eye',
          'Light passes through the clear **cornea** (which does most of the focusing), the **pupil** — an opening in the coloured **iris** that widens or narrows — and the **lens**, which changes shape to focus near or far (**accommodation**). It then reaches the **retina** at the back of the eye. Tears protect and clean the eye — and emotional tears contain different chemicals than irritation tears.',
          '## The retina',
          'Oddly, light must pass through several layers of cells before reaching the **photoreceptors** at the back of the retina. Photoreceptors pass signals to **bipolar cells**, which pass them to **ganglion cells**, whose axons form the **optic nerve**. Horizontal and amacrine cells connect sideways. Where the optic nerve leaves the eye there are no receptors — the **blind spot**.',
          '## Rods and cones',
          '**Rods** (about 120 million) are very sensitive to dim light, do not see colour, and dominate the periphery. **Cones** (about 6 million) work in bright light, provide colour and fine detail, and are packed into the **fovea**, the centre of gaze. In the dark, light-sensitive pigments (such as **rhodopsin** in rods) slowly rebuild — **dark adaptation**. Photoreceptors work in reverse: light **hyperpolarizes** them and reduces their neurotransmitter release.',
        ],
        he: [
          'אור הוא פס קטן של **הספקטרום האלקטרומגנטי** — אורכי גל מכ-400 ננומטר (סגול) ועד 700 ננומטר (אדום). האור נע מהר ובקווים ישרים, ולכן הוא נותן מידע מדויק על עצמים רחוקים. עצמים יכולים לבלוע, להחזיר או לשבור (**לשבור – Refract**) אור.',
          '## העין',
          'האור עובר דרך **הקרנית** השקופה (שעושה את רוב המיקוד), **האישון** — פתח ב**קשתית** הצבעונית שמתרחב או מצטמצם — ו**העדשה**, שמשנה את צורתה כדי למקד קרוב או רחוק (**הסתגלות, Accommodation**). לאחר מכן הוא מגיע ל**רשתית** בחלק האחורי של העין. דמעות מגינות על העין ומנקות אותה — ודמעות רגשיות מכילות חומרים שונים מדמעות גירוי.',
          '## הרשתית',
          'באופן מפתיע, האור חייב לעבור כמה שכבות של תאים לפני שהוא מגיע ל**קולטני האור (Photoreceptors)** בחלק האחורי של הרשתית. קולטני האור מעבירים אותות ל**תאים דו-קוטביים**, שמעבירים אותם ל**תאי גנגליון**, שהאקסונים שלהם יוצרים את **עצב הראייה**. תאים אופקיים ותאי אמקרין מחברים לרוחב. במקום שבו עצב הראייה יוצא מהעין אין קולטנים — **הנקודה העיוורת**.',
          '## קנים ומדוכים',
          '**קנים (Rods)** (כ-120 מיליון) רגישים מאוד לאור עמום, אינם רואים צבע ושולטים בפריפריה. **מדוכים (Cones)** (כ-6 מיליון) פועלים באור חזק, מספקים צבע ופרטים עדינים, וצפופים ב**גומה (Fovea)**, מרכז המבט. בחושך, פיגמנטים רגישים לאור (כמו **רודופסין** בקנים) נבנים מחדש לאט — **הסתגלות לחושך**. קולטני האור פועלים "הפוך": אור גורם להם **להיפר-פולריזציה** ומפחית את שחרור המוליך העצבי שלהם.',
        ],
      },
      points: {
        en: ['Visible light: ~400–700 nm.', 'Cornea and lens focus light on the retina.', 'Photoreceptors → bipolar cells → ganglion cells → optic nerve.', 'Rods: dim light, no colour. Cones: colour, detail, concentrated in the fovea.'],
        he: ['אור נראה: כ-400–700 ננומטר.', 'הקרנית והעדשה ממקדות את האור על הרשתית.', 'קולטני אור ← תאים דו-קוטביים ← תאי גנגליון ← עצב הראייה.', 'קנים: אור עמום, ללא צבע. מדוכים: צבע, פרטים, מרוכזים בגומה.'],
      },
      terms: [
        ['Retina', 'Light-sensitive layer at the back of the eye containing photoreceptors.', 'רשתית', 'שכבה רגישה לאור בחלק האחורי של העין המכילה קולטני אור.'],
        ['Fovea', 'Central pit of the retina packed with cones; gives the sharpest vision.', 'גומה (Fovea)', 'השקע המרכזי ברשתית, צפוף במדוכים; נותן את הראייה החדה ביותר.'],
        ['Rods', 'Photoreceptors for dim light; no colour vision.', 'קנים', 'קולטני אור לאור עמום; ללא ראיית צבעים.'],
        ['Cones', 'Photoreceptors for colour and fine detail in bright light.', 'מדוכים', 'קולטני אור לצבע ולפרטים עדינים באור חזק.'],
        ['Ganglion cells', 'Retinal neurons whose axons form the optic nerve.', 'תאי גנגליון', 'נוירונים ברשתית שהאקסונים שלהם יוצרים את עצב הראייה.'],
        ['Blind spot', 'Where the optic nerve leaves the eye; no photoreceptors there.', 'הנקודה העיוורת', 'המקום שבו עצב הראייה יוצא מהעין; אין שם קולטני אור.'],
      ],
      quiz: [
        ['Which photoreceptors are best in dim light?', 'אילו קולטני אור הכי טובים באור עמום?', ['Cones', 'Rods', 'Ganglion cells', 'Bipolar cells'], ['מדוכים', 'קנים', 'תאי גנגליון', 'תאים דו-קוטביים'], 1, 'Rods are extremely sensitive but do not see colour.', 'הקנים רגישים מאוד אך אינם רואים צבע.'],
        ['The axons of which cells form the optic nerve?', 'האקסונים של אילו תאים יוצרים את עצב הראייה?', ['Rods', 'Bipolar cells', 'Ganglion cells', 'Amacrine cells'], ['קנים', 'תאים דו-קוטביים', 'תאי גנגליון', 'תאי אמקרין'], 2, 'Ganglion cells are the output neurons of the retina.', 'תאי הגנגליון הם נוירוני הפלט של הרשתית.'],
      ],
    },
    {
      title: { en: 'From the eye to the cortex', he: 'מהעין לקליפת המוח' },
      diagram: 'visualPathway',
      regions: ['opticChiasm', 'thalamus', 'occipital', 'superiorColliculus', 'temporal', 'parietal'],
      body: {
        en: [
          'Ganglion cells have **receptive fields** — small areas of the visual world they respond to — with a **centre-surround** design: some fire when light hits the centre and not the surround (on-centre), others the opposite. This makes them excellent edge detectors. Different ganglion cells carry fine detail and colour (**parvocellular**) or motion and coarse shape (**magnocellular**).',
          '## The pathway',
          'The two optic nerves meet at the **optic chiasm**, where fibres from the nasal half of each retina cross. So the **left visual field** goes to the **right hemisphere**, and vice versa. Most fibres go to the **lateral geniculate nucleus (LGN)** of the thalamus, then to the **primary visual cortex (V1, striate cortex)** in the occipital lobe. Some go to the **superior colliculus** (eye-movement reflexes) and to the **suprachiasmatic nucleus** (resetting the body clock).',
          '## The visual cortex',
          'Hubel and Wiesel found that V1 neurons respond to lines and edges at particular **orientations**; **simple cells** prefer a line in one location, **complex cells** respond to it anywhere in their field, and many respond to movement in one direction. V1 is organized in columns, including **ocular dominance** columns for each eye.',
          'Beyond V1, information splits into two streams. The **ventral "what" stream** to the temporal lobe recognises objects and faces (the **fusiform face area**). The **dorsal "where/how" stream** to the parietal lobe handles location, motion (area MT/V5) and guiding actions.',
        ],
        he: [
          'לתאי גנגליון יש **שדות קולטים** — אזורים קטנים בעולם החזותי שהם מגיבים להם — במבנה **מרכז-היקף**: חלקם יורים כשאור פוגע במרכז ולא בהיקף (מרכז-ON), ואחרים להפך. זה הופך אותם לגלאי קצוות מצוינים. תאי גנגליון שונים נושאים פרטים עדינים וצבע (**פרבוצלולריים**) או תנועה וצורה גסה (**מגנוצלולריים**).',
          '## המסלול',
          'שני עצבי הראייה נפגשים ב**מצטלבת הראייה**, שם סיבים מהחצי האפי של כל רשתית חוצים. לכן **שדה הראייה השמאלי** מגיע ל**המיספרה הימנית**, ולהפך. רוב הסיבים מגיעים ל**גרעין הברכי הצידי (LGN)** שבתלמוס, ומשם ל**קליפת הראייה הראשונית (V1, הקליפה המפוספסת)** באונה העורפית. חלקם מגיעים ל**גבעון העליון** (רפלקסים של תנועות עיניים) ול**גרעין העל-מצטלבי** (כיוון השעון הביולוגי).',
          '## קליפת הראייה',
          'הובל וויזל גילו שנוירונים ב-V1 מגיבים לקווים ולקצוות ב**כיוונים** מסוימים; **תאים פשוטים** מעדיפים קו במיקום אחד, **תאים מורכבים** מגיבים אליו בכל מקום בשדה שלהם, ורבים מגיבים לתנועה בכיוון אחד. V1 מאורגנת בעמודות, כולל עמודות **דומיננטיות עינית** לכל עין.',
          'מעבר ל-V1, המידע מתפצל לשני זרמים. **הזרם הגחוני "מה"** לאונה הרקתית מזהה עצמים ופנים (**אזור הפנים הפוזיפורמי**). **הזרם הגבי "איפה/איך"** לאונה הקודקודית מטפל במיקום, בתנועה (אזור MT/V5) ובהכוונת פעולות.',
        ],
      },
      points: {
        en: ['Ganglion cells have centre-surround receptive fields.', 'At the optic chiasm, each visual field goes to the opposite hemisphere.', 'Eye → LGN (thalamus) → V1 (occipital).', 'Ventral stream = "what"; dorsal stream = "where/how".'],
        he: ['לתאי גנגליון שדות קולטים במבנה מרכז-היקף.', 'במצטלבת הראייה, כל שדה ראייה מגיע להמיספרה הנגדית.', 'עין ← LGN (תלמוס) ← V1 (עורפית).', 'זרם גחוני = "מה"; זרם גבי = "איפה/איך".'],
      },
      terms: [
        ['Receptive field', 'The area of the visual field to which a neuron responds.', 'שדה קולט', 'אזור בשדה הראייה שהנוירון מגיב אליו.'],
        ['Optic chiasm', 'Where the optic nerves meet and nasal fibres cross.', 'מצטלבת הראייה', 'המקום שבו עצבי הראייה נפגשים והסיבים האפיים חוצים.'],
        ['Lateral geniculate nucleus (LGN)', 'Thalamic nucleus relaying visual information to V1.', 'הגרעין הברכי הצידי (LGN)', 'גרעין בתלמוס שמעביר מידע חזותי ל-V1.'],
        ['Primary visual cortex (V1)', 'First cortical area for vision, in the occipital lobe; also called striate cortex.', 'קליפת הראייה הראשונית (V1)', 'אזור הקליפה הראשון לראייה, באונה העורפית; נקרא גם הקליפה המפוספסת.'],
        ['Ventral stream', 'Visual pathway to the temporal lobe for recognising objects ("what").', 'הזרם הגחוני', 'מסלול ראייה לאונה הרקתית לזיהוי עצמים ("מה").'],
        ['Dorsal stream', 'Visual pathway to the parietal lobe for location and action ("where/how").', 'הזרם הגבי', 'מסלול ראייה לאונה הקודקודית למיקום ופעולה ("איפה/איך").'],
      ],
      quiz: [
        ['Information from your LEFT visual field is processed first in…', 'מידע משדה הראייה השמאלי שלכם מעובד קודם ב…', ['the left occipital lobe', 'the right occipital lobe', 'both equally', 'the left temporal lobe'], ['האונה העורפית השמאלית', 'האונה העורפית הימנית', 'בשתיהן באותה מידה', 'האונה הרקתית השמאלית'], 1, 'Because of crossing at the optic chiasm, each visual field goes to the opposite hemisphere.', 'בגלל ההצטלבות, כל שדה ראייה מגיע להמיספרה הנגדית.'],
        ['Damage to the ventral "what" stream would most likely impair…', 'פגיעה בזרם הגחוני "מה" תפגע ככל הנראה ב…', ['reaching for a cup', 'recognising a friend\'s face', 'seeing in dim light', 'pupil reflexes'], ['הושטת יד לכוס', 'זיהוי פני חבר', 'ראייה באור עמום', 'רפלקסים של האישון'], 1, 'The ventral stream in the temporal lobe recognises objects and faces.', 'הזרם הגחוני באונה הרקתית מזהה עצמים ופנים.'],
      ],
    },
    {
      title: { en: 'Perceiving depth, colour and form', he: 'תפיסת עומק, צבע וצורה' },
      diagram: 'color',
      regions: ['occipital', 'temporal'],
      body: {
        en: [
          'Visual perception is built in **hierarchies**: simple features (edges) are combined into shapes, then objects. Another view says the visual system analyses images by **spatial frequency** — coarse patterns (low frequency) and fine detail (high frequency).',
          '## Depth',
          'Because our eyes are about 6 cm apart, each sees a slightly different image. The brain uses this **binocular disparity** (the basis of 3D movies) to judge depth. **Monocular cues** — such as size, overlap, perspective, shading and motion parallax — work even with one eye.',
          '## Colour',
          'Two theories, both correct at different levels. **Trichromatic theory**: there are three cone types, most sensitive to short (blue), medium (green) and long (red) wavelengths; colours are coded by their pattern of activity. **Opponent-process theory**: later cells code colours in opposing pairs — red vs green, blue vs yellow (and black vs white) — which explains coloured **afterimages**. Most colour "blindness" is really a missing or faulty cone type, often red–green and X-linked.',
          '## Development',
          'Newborns see blurry images and prefer faces and high-contrast patterns. Acuity, colour vision and binocular depth develop over the first months, and depend on normal visual experience during critical periods.',
        ],
        he: [
          'תפיסה חזותית נבנית ב**היררכיות**: מאפיינים פשוטים (קצוות) משתלבים לצורות, ואחר כך לעצמים. גישה נוספת אומרת שמערכת הראייה מנתחת תמונות לפי **תדירות מרחבית** — דפוסים גסים (תדירות נמוכה) ופרטים עדינים (תדירות גבוהה).',
          '## עומק',
          'מכיוון שהעיניים שלנו מרוחקות כ-6 ס"מ זו מזו, כל אחת רואה תמונה מעט שונה. המוח משתמש ב**פער בין-עיני (Binocular disparity)** זה (הבסיס לסרטי תלת-ממד) כדי לשפוט עומק. **רמזים חד-עיניים** — כמו גודל, הסתרה, פרספקטיבה, הצללה ותנועה יחסית — פועלים גם עם עין אחת.',
          '## צבע',
          'שתי תיאוריות, ושתיהן נכונות ברמות שונות. **התיאוריה התלת-צבעית**: יש שלושה סוגי מדוכים, הרגישים ביותר לאורכי גל קצרים (כחול), בינוניים (ירוק) וארוכים (אדום); צבעים מקודדים לפי דפוס הפעילות שלהם. **תיאוריית התהליכים המנוגדים**: תאים בשלבים מאוחרים יותר מקודדים צבעים בזוגות מנוגדים — אדום מול ירוק, כחול מול צהוב (ושחור מול לבן) — מה שמסביר **תמונות שיוריות** צבעוניות. רוב "עיוורון הצבעים" הוא למעשה סוג מדוך חסר או פגום, לרוב אדום-ירוק וקשור ל-X.',
          '## התפתחות',
          'תינוקות שזה עתה נולדו רואים תמונה מטושטשת ומעדיפים פנים ודפוסים בעלי ניגודיות גבוהה. חדות הראייה, ראיית הצבעים והעומק הדו-עיני מתפתחים בחודשים הראשונים, ותלויים בחוויה חזותית תקינה בתקופות הקריטיות.',
        ],
      },
      points: {
        en: ['Binocular disparity and monocular cues give depth.', 'Trichromatic: three cone types (short, medium, long wavelengths).', 'Opponent process: red–green, blue–yellow; explains afterimages.', 'Infant vision develops over months with experience.'],
        he: ['פער בין-עיני ורמזים חד-עיניים נותנים עומק.', 'תלת-צבעית: שלושה סוגי מדוכים (אורכי גל קצרים, בינוניים, ארוכים).', 'תהליכים מנוגדים: אדום-ירוק, כחול-צהוב; מסביר תמונות שיוריות.', 'ראיית התינוק מתפתחת במשך חודשים עם חוויה.'],
      },
      terms: [
        ['Binocular disparity', 'The difference between the two eyes\' images, used to judge depth.', 'פער בין-עיני', 'ההבדל בין התמונות של שתי העיניים, המשמש לשיפוט עומק.'],
        ['Trichromatic theory', 'Colour vision is based on three types of cones.', 'התיאוריה התלת-צבעית', 'ראיית צבעים מבוססת על שלושה סוגי מדוכים.'],
        ['Opponent-process theory', 'Colour is coded in opposing pairs: red/green, blue/yellow, black/white.', 'תיאוריית התהליכים המנוגדים', 'צבע מקודד בזוגות מנוגדים: אדום/ירוק, כחול/צהוב, שחור/לבן.'],
        ['Afterimage', 'An image seen after staring at a colour, appearing in the opponent colour.', 'תמונה שיורית', 'תמונה שנראית לאחר בהייה בצבע, ומופיעה בצבע המנוגד.'],
      ],
      quiz: [
        ['Staring at a green square and then looking at white produces a reddish afterimage. Which theory explains this?', 'בהייה בריבוע ירוק ואז הסתכלות על לבן יוצרת תמונה שיורית אדמדמה. איזו תיאוריה מסבירה זאת?', ['Trichromatic', 'Opponent-process', 'Spatial frequency', 'Hierarchical'], ['התלת-צבעית', 'התהליכים המנוגדים', 'התדירות המרחבית', 'ההיררכית'], 1, 'Green-tired cells rebound, signalling the opponent colour, red.', 'התאים "העייפים" מירוק מתאוששים ומאותתים את הצבע המנוגד, אדום.'],
      ],
    },
    {
      title: { en: 'Disorders of the visual system', he: 'הפרעות במערכת הראייה' },
      diagram: null,
      regions: ['occipital', 'temporal'],
      body: {
        en: [
          '**Amblyopia** ("lazy eye") develops when one eye is not used properly in childhood (for example because of a squint, **strabismus**); the brain learns to ignore it. Patching the strong eye during the critical period can help. **Cataracts** cloud the lens and are treated by replacing it.',
          '**Acuity problems**: in **myopia** (nearsightedness) the eyeball is too long, so distant objects are blurry; in **hyperopia** (farsightedness) it is too short; **presbyopia** is the age-related loss of near focus as the lens stiffens; **astigmatism** comes from an irregular cornea.',
          '**Blindness** can come from damage anywhere along the pathway — the eye (e.g. macular degeneration, glaucoma, diabetes), the optic nerve, or the visual cortex. Some people with V1 damage show **blindsight**: they say they see nothing but can point to objects, probably using the superior colliculus pathway.',
          '**Visual agnosias** are failures of recognition despite intact vision. People with **prosopagnosia** ("face blindness"), usually after damage to the fusiform face area, cannot recognize faces — even their own — but recognize people by voice. Damage to area MT can cause **akinetopsia**: seeing the world as a series of still frames.',
        ],
        he: [
          '**עין עצלה (Amblyopia)** מתפתחת כשעין אחת אינה בשימוש תקין בילדות (למשל בגלל פזילה, **סטרביזמוס**); המוח לומד להתעלם ממנה. כיסוי העין החזקה בתקופה הקריטית יכול לעזור. **קטרקט (ירוד)** מעכיר את העדשה ומטופל בהחלפתה.',
          '**בעיות חדות**: ב**קוצר ראייה (Myopia)** גלגל העין ארוך מדי, ולכן עצמים רחוקים מטושטשים; ב**רוחק ראייה (Hyperopia)** הוא קצר מדי; **פרסביופיה** היא אובדן המיקוד לקרוב עם הגיל כשהעדשה מתקשה; **אסטיגמטיזם** נגרם מקרנית לא סדירה.',
          '**עיוורון** יכול לנבוע מנזק בכל מקום לאורך המסלול — העין (למשל ניוון מקולרי, גלאוקומה, סוכרת), עצב הראייה או קליפת הראייה. חלק מהאנשים עם נזק ב-V1 מראים **ראייה עיוורת (Blindsight)**: הם אומרים שאינם רואים דבר אך מסוגלים להצביע על עצמים, כנראה באמצעות מסלול הגבעון העליון.',
          '**אגנוזיות חזותיות** הן כשל בזיהוי למרות ראייה תקינה. אנשים עם **פרוסופגנוזיה** ("עיוורון פנים"), לרוב לאחר נזק לאזור הפנים הפוזיפורמי, אינם מזהים פנים — אפילו את פניהם שלהם — אך מזהים אנשים לפי הקול. נזק לאזור MT עלול לגרום ל**אקינטופסיה**: ראיית העולם כסדרה של תמונות קפואות.',
        ],
      },
      points: {
        en: ['Amblyopia: an under-used eye in childhood is "ignored" by the brain.', 'Myopia = long eyeball; hyperopia = short eyeball.', 'Blindsight: responding to objects without conscious vision after V1 damage.', 'Prosopagnosia: inability to recognise faces.'],
        he: ['עין עצלה: עין שלא הייתה בשימוש בילדות "מוזנחת" על ידי המוח.', 'קוצר ראייה = גלגל עין ארוך; רוחק ראייה = גלגל עין קצר.', 'ראייה עיוורת: תגובה לעצמים בלי ראייה מודעת לאחר נזק ל-V1.', 'פרוסופגנוזיה: חוסר יכולת לזהות פנים.'],
      },
      terms: [
        ['Amblyopia', '"Lazy eye": reduced vision in an eye that was not used properly in childhood.', 'עין עצלה', 'ראייה מופחתת בעין שלא הייתה בשימוש תקין בילדות.'],
        ['Myopia', 'Nearsightedness: distant objects are blurry.', 'קוצר ראייה', 'עצמים רחוקים נראים מטושטשים.'],
        ['Blindsight', 'Responding to visual stimuli without being aware of seeing them.', 'ראייה עיוורת', 'תגובה לגירויים חזותיים בלי מודעות לראייתם.'],
        ['Prosopagnosia', 'Inability to recognise faces ("face blindness").', 'פרוסופגנוזיה', 'חוסר יכולת לזהות פנים ("עיוורון פנים").'],
      ],
      quiz: [
        ['A person cannot recognize their mother\'s face but knows her immediately by her voice. This is…', 'אדם אינו מזהה את פני אמו אך מזהה אותה מיד לפי קולה. זוהי…', ['amblyopia', 'prosopagnosia', 'myopia', 'akinetopsia'], ['עין עצלה', 'פרוסופגנוזיה', 'קוצר ראייה', 'אקינטופסיה'], 1, 'Prosopagnosia is a specific failure to recognise faces.', 'פרוסופגנוזיה היא כשל ספציפי בזיהוי פנים.'],
      ],
    },
  ],
};
