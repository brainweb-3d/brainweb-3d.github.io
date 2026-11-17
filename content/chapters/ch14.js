// Format explained at the top of ch01.js
export default {
  n: 14,
  icon: '❤️',
  color: '#eb5757',
  title: { en: 'Emotion, Reward, Aggression, and Stress', he: 'רגש, תגמול, תוקפנות ולחץ' },
  intro: {
    en: 'Where emotions come from, how the brain rewards us, the biology of aggression, and how stress affects body and mind.',
    he: 'מאיפה מגיעים הרגשות, איך המוח מתגמל אותנו, הביולוגיה של התוקפנות, ואיך לחץ משפיע על הגוף והנפש.',
  },
  lessons: [
    {
      title: { en: 'Expressing and recognizing emotion', he: 'הבעה וזיהוי של רגשות' },
      diagram: null,
      regions: ['amygdala', 'frontal', 'motor'],
      body: {
        en: [
          '**Emotions** are short, intense responses to events, combining a physical reaction, a behaviour and a subjective feeling. Darwin argued that emotional expressions evolved because they help survival and communication. Paul Ekman found that people in very different cultures — even isolated groups in New Guinea — recognize a small set of **basic emotions** from facial expressions: happiness, sadness, anger, fear, surprise and disgust (and perhaps contempt). Cultures differ in **display rules** — when it is acceptable to show an emotion.',
          'Facial expressions are produced by two systems: voluntary expressions controlled by the motor cortex, and spontaneous expressions from subcortical areas. That is why a forced smile looks different from a real **Duchenne smile**, which also involves the muscles around the eyes. Some stroke patients cannot smile on command but smile normally at a joke. People who are lying tend to "leak" brief **microexpressions**.',
          'The right hemisphere plays a larger role in expressing and recognizing emotions; the left side of the face (controlled by the right hemisphere) tends to be more expressive.',
        ],
        he: [
          '**רגשות** הם תגובות קצרות ועזות לאירועים, המשלבות תגובה גופנית, התנהגות ותחושה סובייקטיבית. דרווין טען שהבעות רגש התפתחו כי הן עוזרות להישרדות ולתקשורת. פול אקמן מצא שאנשים מתרבויות שונות מאוד — אפילו קבוצות מבודדות בגינאה החדשה — מזהים קבוצה קטנה של **רגשות בסיסיים** מהבעות פנים: שמחה, עצב, כעס, פחד, הפתעה וגועל (ואולי בוז). התרבויות נבדלות ב**כללי הצגה** — מתי מקובל להראות רגש.',
          'הבעות פנים נוצרות על ידי שתי מערכות: הבעות רצוניות הנשלטות על ידי הקליפה המוטורית, והבעות ספונטניות מאזורים תת-קליפתיים. לכן חיוך מאולץ נראה שונה מ**חיוך דושן** אמיתי, שכולל גם את השרירים סביב העיניים. חלק ממטופלי השבץ אינם מסוגלים לחייך לפי בקשה אך מחייכים כרגיל לבדיחה. אנשים שמשקרים נוטים "להדליף" **מיקרו-הבעות** קצרות.',
          'להמיספרה הימנית תפקיד גדול יותר בהבעה ובזיהוי של רגשות; הצד השמאלי של הפנים (שנשלט על ידי ההמיספרה הימנית) נוטה להיות אקספרסיבי יותר.',
        ],
      },
      points: {
        en: ['Basic emotions are recognized across cultures (Ekman).', 'Display rules vary by culture.', 'Voluntary and spontaneous expressions use different brain systems (Duchenne smile).', 'The right hemisphere is especially involved in emotion.'],
        he: ['רגשות בסיסיים מזוהים בכל התרבויות (אקמן).', 'כללי ההצגה משתנים בין תרבויות.', 'הבעות רצוניות וספונטניות משתמשות במערכות מוח שונות (חיוך דושן).', 'ההמיספרה הימנית מעורבת במיוחד ברגש.'],
      },
      terms: [
        ['Basic emotions', 'Emotions recognized across cultures from facial expressions (e.g. fear, anger, joy).', 'רגשות בסיסיים', 'רגשות המזוהים בכל התרבויות מהבעות פנים (למשל פחד, כעס, שמחה).'],
        ['Display rules', 'Cultural norms about when and how emotions may be shown.', 'כללי הצגה', 'נורמות תרבותיות לגבי מתי ואיך מותר להראות רגשות.'],
        ['Duchenne smile', 'A genuine smile that includes the muscles around the eyes.', 'חיוך דושן', 'חיוך אמיתי שכולל את השרירים סביב העיניים.'],
        ['Microexpression', 'A very brief facial expression revealing a concealed emotion.', 'מיקרו-הבעה', 'הבעת פנים קצרה מאוד שחושפת רגש מוסתר.'],
      ],
      quiz: [
        ['A genuine smile that involves the eye muscles is called a…', 'חיוך אמיתי שמערב את שרירי העיניים נקרא…', ['Duchenne smile', 'display rule', 'microexpression', 'Wada smile'], ['חיוך דושן', 'כלל הצגה', 'מיקרו-הבעה', 'חיוך ואדה'], 0, 'Duchenne smiles involve the orbicularis oculi muscles around the eyes.', 'חיוך דושן מערב את שרירי הטבעת סביב העיניים.'],
      ],
    },
    {
      title: { en: 'Theories and brain bases of emotion', he: 'תיאוריות רגש והבסיס המוחי שלו' },
      diagram: 'emotionTheories',
      regions: ['amygdala', 'frontal', 'cingulate', 'hypothalamus', 'thalamus'],
      body: {
        en: [
          '## Classic theories',
          '**James–Lange theory**: we feel an emotion **because** of our body\'s reaction — "we are afraid because we run". **Cannon–Bard theory**: the body reaction and the feeling happen **at the same time and independently**, both triggered by the thalamus. **Schachter–Singer two-factor theory**: emotion = physical arousal + a cognitive **label** based on the situation. Antonio Damasio\'s **somatic marker hypothesis** updates James–Lange: body signals ("gut feelings") guide decisions; patients with damage to the ventromedial prefrontal cortex make poor real-life choices despite normal intelligence. Making a facial expression can even slightly shift how we feel (the facial feedback effect).',
          '## The amygdala',
          'The **amygdala** is central to fear. Monkeys with the **Klüver–Bucy syndrome** (damage to the temporal lobes including the amygdala) become strangely tame and fearless. Patient **S.M.**, with damage to both amygdalae, does not feel fear and cannot recognize fear in faces. The amygdala responds to threatening faces even when they are shown too briefly to be seen consciously.',
          '## The prefrontal cortex and cingulate',
          'The famous case of **Phineas Gage** — an iron rod passed through his frontal lobes in 1848 — showed that the **prefrontal cortex** regulates emotion and social behaviour: he survived but became impulsive and unreliable. The prefrontal cortex helps reappraise and calm emotions coming from the amygdala; the **anterior cingulate** is involved in emotional conflict and social pain.',
        ],
        he: [
          '## תיאוריות קלאסיות',
          '**תיאוריית ג\'יימס-לנגה**: אנחנו חשים רגש **בגלל** התגובה של הגוף — "אנחנו מפחדים כי אנחנו בורחים". **תיאוריית קנון-בארד**: התגובה הגופנית והתחושה קורות **בו-זמנית ובאופן בלתי תלוי**, ושתיהן מופעלות על ידי התלמוס. **תיאוריית שני הגורמים של שכטר-סינגר**: רגש = עוררות גופנית + **תווית** קוגניטיבית המבוססת על המצב. **השערת הסמן הסומטי** של אנטוניו דמסיו מעדכנת את ג\'יימס-לנגה: אותות גוף ("תחושות בטן") מכוונים החלטות; מטופלים עם נזק בקליפה הקדם-מצחית הגחונית-מדיאלית מקבלים החלטות גרועות בחיים האמיתיים למרות אינטליגנציה תקינה. יצירת הבעת פנים יכולה אפילו לשנות מעט את מה שאנחנו מרגישים (אפקט המשוב הפנימי).',
          '## האמיגדלה',
          '**האמיגדלה** מרכזית לפחד. קופים עם **תסמונת קלובר-בוסי** (נזק לאונות הרקתיות כולל האמיגדלה) הופכים לרגועים וחסרי פחד באופן מוזר. המטופלת **S.M.**, עם נזק לשתי האמיגדלות, אינה חשה פחד ואינה מזהה פחד בפנים. האמיגדלה מגיבה לפנים מאיימות גם כשהן מוצגות לזמן קצר מכדי להיראות באופן מודע.',
          '## הקליפה הקדם-מצחית והחגורה',
          'המקרה המפורסם של **פיניאס גייג\'** — מוט ברזל שחדר דרך האונות המצחיות שלו ב-1848 — הראה ש**הקליפה הקדם-מצחית** מווסתת רגש והתנהגות חברתית: הוא שרד אך הפך לאימפולסיבי ולא אמין. הקליפה הקדם-מצחית עוזרת לפרש מחדש ולהרגיע רגשות שמגיעים מהאמיגדלה; **קליפת החגורה הקדמית** מעורבת בקונפליקט רגשי ובכאב חברתי.',
        ],
      },
      points: {
        en: ['James–Lange: body first, then feeling. Cannon–Bard: simultaneous. Schachter–Singer: arousal + label.', 'Somatic markers: body signals guide decisions (Damasio).', 'Amygdala damage → loss of fear (Klüver–Bucy, patient S.M.).', 'Prefrontal cortex regulates emotion (Phineas Gage).'],
        he: ['ג\'יימס-לנגה: קודם גוף, אחר כך תחושה. קנון-בארד: בו-זמנית. שכטר-סינגר: עוררות + תווית.', 'סמנים סומטיים: אותות גוף מכוונים החלטות (דמסיו).', 'נזק לאמיגדלה ← אובדן פחד (קלובר-בוסי, המטופלת S.M.).', 'הקליפה הקדם-מצחית מווסתת רגש (פיניאס גייג\').'],
      },
      terms: [
        ['James–Lange theory', 'Emotions result from perceiving our bodily responses.', 'תיאוריית ג\'יימס-לנגה', 'רגשות נובעים מתפיסת התגובות הגופניות שלנו.'],
        ['Cannon–Bard theory', 'Bodily response and emotional feeling occur simultaneously and independently.', 'תיאוריית קנון-בארד', 'התגובה הגופנית והתחושה הרגשית מתרחשות בו-זמנית ובאופן בלתי תלוי.'],
        ['Schachter–Singer theory', 'Emotion = physiological arousal + cognitive interpretation.', 'תיאוריית שכטר-סינגר', 'רגש = עוררות פיזיולוגית + פרשנות קוגניטיבית.'],
        ['Somatic marker hypothesis', 'Body-based emotional signals guide decision-making.', 'השערת הסמן הסומטי', 'אותות רגשיים מבוססי גוף מכוונים קבלת החלטות.'],
        ['Klüver–Bucy syndrome', 'Tameness and loss of fear after damage to the temporal lobes/amygdala.', 'תסמונת קלובר-בוסי', 'רוגע ואובדן פחד לאחר נזק לאונות הרקתיות/לאמיגדלה.'],
      ],
      quiz: [
        ['"We feel afraid because we tremble." Which theory is this?', '"אנחנו מפחדים כי אנחנו רועדים." איזו תיאוריה זו?', ['Cannon–Bard', 'James–Lange', 'Schachter–Singer', 'Activation-synthesis'], ['קנון-בארד', 'ג\'יימס-לנגה', 'שכטר-סינגר', 'הפעלה-סינתזה'], 1, 'James–Lange says the bodily response comes first.', 'ג\'יימס-לנגה אומרת שהתגובה הגופנית באה קודם.'],
        ['Phineas Gage\'s injury showed that the prefrontal cortex is important for…', 'הפציעה של פיניאס גייג\' הראתה שהקליפה הקדם-מצחית חשובה ל…', ['vision', 'regulating emotion and social behaviour', 'hearing', 'balance'], ['ראייה', 'ויסות רגש והתנהגות חברתית', 'שמיעה', 'שיווי משקל'], 1, 'Gage became impulsive and socially inappropriate.', 'גייג\' הפך לאימפולסיבי ולבלתי הולם חברתית.'],
      ],
    },
    {
      title: { en: 'Reward and aggression', he: 'תגמול ותוקפנות' },
      diagram: 'reward',
      regions: ['vta', 'nucleusAccumbens', 'frontal', 'amygdala', 'hypothalamus'],
      body: {
        en: [
          '## The reward system',
          'In 1954, James Olds and Peter Milner discovered that rats would press a lever thousands of times to receive electrical stimulation of certain brain areas. The core of this **reward system** is the **mesolimbic pathway**: dopamine neurons in the **ventral tegmental area (VTA)** projecting to the **nucleus accumbens**. Dopamine signals not pleasure itself but **"wanting"** and **prediction**: it fires when a reward is better than expected (a **reward prediction error**). The **orbitofrontal** and ventromedial prefrontal cortex weigh the value of options in decision-making.',
          '## Aggression',
          'Aggression has a genetic component: a variant of the **MAOA** gene (which breaks down monoamines) is linked with aggression, especially in people who suffered childhood maltreatment — a clear gene–environment interaction. In the brain, the **amygdala** and **hypothalamus** can trigger aggressive and defensive responses, while the **prefrontal cortex** normally restrains them; violent offenders often show reduced prefrontal activity.',
          'Biochemically, **testosterone** is linked with dominance and aggression (though the relationship is complex), and **low serotonin** activity is associated with impulsive aggression and violence. These findings raise difficult questions for the **criminal justice system** about responsibility when brain damage contributes to violent behaviour.',
        ],
        he: [
          '## מערכת התגמול',
          'ב-1954 גילו ג\'יימס אולדס ופיטר מילנר שחולדות לוחצות על ידית אלפי פעמים כדי לקבל גירוי חשמלי באזורי מוח מסוימים. הליבה של **מערכת התגמול** הזו היא **המסלול המזולימבי**: נוירוני דופמין ב**אזור הטגמנטלי הגחוני (VTA)** השולחים שלוחות ל**גרעין האקומבנס**. דופמין אינו מאותת על ההנאה עצמה אלא על **"רצייה"** ו**ניבוי**: הוא יורה כשתגמול טוב מהצפוי (**שגיאת ניבוי תגמול**). הקליפה **האורביטו-פרונטלית** והקליפה הקדם-מצחית הגחונית-מדיאלית שוקלות את ערך האפשרויות בקבלת החלטות.',
          '## תוקפנות',
          'לתוקפנות יש מרכיב גנטי: גרסה של הגן **MAOA** (שמפרק מונואמינים) קשורה לתוקפנות, במיוחד אצל אנשים שעברו התעללות בילדות — אינטראקציה ברורה בין גן לסביבה. במוח, **האמיגדלה** ו**ההיפותלמוס** יכולים להפעיל תגובות תוקפניות והגנתיות, ואילו **הקליפה הקדם-מצחית** בדרך כלל מרסנת אותן; עבריינים אלימים מראים לעיתים קרובות פעילות קדם-מצחית מופחתת.',
          'מבחינה ביוכימית, **טסטוסטרון** קשור לדומיננטיות ולתוקפנות (אם כי הקשר מורכב), ופעילות **סרוטונין נמוכה** קשורה לתוקפנות אימפולסיבית ולאלימות. ממצאים אלה מעלים שאלות קשות עבור **מערכת המשפט** לגבי אחריות כשנזק מוחי תורם להתנהגות אלימה.',
        ],
      },
      points: {
        en: ['Olds & Milner: rats self-stimulate reward areas.', 'VTA → nucleus accumbens dopamine signals wanting and prediction error.', 'MAOA variant + childhood maltreatment → higher aggression risk.', 'Prefrontal cortex restrains aggression; low serotonin is linked to impulsive violence.'],
        he: ['אולדס ומילנר: חולדות מגרות בעצמן אזורי תגמול.', 'דופמין מ-VTA לגרעין האקומבנס מאותת רצייה ושגיאת ניבוי.', 'גרסת MAOA + התעללות בילדות ← סיכון גבוה יותר לתוקפנות.', 'הקליפה הקדם-מצחית מרסנת תוקפנות; סרוטונין נמוך קשור לאלימות אימפולסיבית.'],
      },
      terms: [
        ['Reward prediction error', 'Dopamine signal when a reward is better or worse than expected.', 'שגיאת ניבוי תגמול', 'אות דופמין כשתגמול טוב או גרוע מהצפוי.'],
        ['Nucleus accumbens', 'Key reward area receiving dopamine from the VTA.', 'גרעין האקומבנס', 'אזור תגמול מרכזי שמקבל דופמין מה-VTA.'],
        ['MAOA gene', 'Gene for an enzyme that breaks down monoamines; a variant is linked to aggression.', 'הגן MAOA', 'גן לאנזים שמפרק מונואמינים; גרסה שלו קשורה לתוקפנות.'],
        ['Orbitofrontal cortex', 'Prefrontal area that evaluates rewards and guides decisions.', 'הקליפה האורביטו-פרונטלית', 'אזור קדם-מצחי שמעריך תגמולים ומכוון החלטות.'],
      ],
      quiz: [
        ['Dopamine neurons fire most strongly when a reward is…', 'נוירוני דופמין יורים בעוצמה הרבה ביותר כשתגמול…', ['exactly as expected', 'better than expected', 'absent as expected', 'repeated many times'], ['בדיוק כצפוי', 'טוב מהצפוי', 'חסר כצפוי', 'חוזר פעמים רבות'], 1, 'Dopamine codes reward prediction errors.', 'דופמין מקודד שגיאות ניבוי תגמול.'],
        ['Which neurotransmitter, when LOW, is linked with impulsive aggression?', 'איזה מוליך עצבי, כשרמתו נמוכה, קשור לתוקפנות אימפולסיבית?', ['Serotonin', 'Glutamate', 'Acetylcholine', 'Histamine'], ['סרוטונין', 'גלוטמט', 'אצטילכולין', 'היסטמין'], 0, 'Low serotonin activity is associated with impulsive violence.', 'פעילות סרוטונין נמוכה קשורה לאלימות אימפולסיבית.'],
      ],
    },
    {
      title: { en: 'Stress', he: 'לחץ' },
      diagram: 'hpa',
      regions: ['hypothalamus', 'pituitary', 'hippocampus', 'amygdala'],
      body: {
        en: [
          'Hans Selye described the **general adaptation syndrome**: the body\'s response to any stressor goes through **alarm** (immediate mobilization), **resistance** (coping with continued stress) and finally **exhaustion** (resources run out, illness becomes more likely).',
          '## Two stress systems',
          '1) The fast **sympathetic–adrenal medulla** system: the sympathetic nervous system makes the adrenal glands release **epinephrine (adrenaline)** and norepinephrine — heart racing, energy release, alertness. 2) The slower **HPA axis**: the **hypothalamus** releases **CRH**, which makes the **pituitary** release **ACTH**, which makes the **adrenal cortex** release **cortisol**. Cortisol raises blood sugar, suppresses non-urgent functions and inflammation, and feeds back to the brain (including the hippocampus) to turn the response off.',
          '## Stress and health',
          'Short-term stress is adaptive. But **chronic stress** keeps cortisol high, which can damage the hippocampus, impair memory, and weaken the **immune system** — wounds heal more slowly and people catch colds more easily. The field of **psychoneuroimmunology** studies these links. Chronic stress is also linked with heart disease, depression and anxiety. Social support, exercise, sleep and a sense of control help buffer stress.',
        ],
        he: [
          'הנס סלייה תיאר את **תסמונת ההסתגלות הכללית**: תגובת הגוף לכל גורם לחץ עוברת דרך **אזעקה** (גיוס מיידי), **התנגדות** (התמודדות עם לחץ מתמשך) ולבסוף **תשישות** (המשאבים אוזלים והסיכוי למחלה עולה).',
          '## שתי מערכות לחץ',
          '1) המערכת המהירה **הסימפתטית-לשד יותרת הכליה**: מערכת העצבים הסימפתטית גורמת לבלוטות יותרת הכליה להפריש **אפינפרין (אדרנלין)** ונוראפינפרין — דופק מואץ, שחרור אנרגיה, דריכות. 2) **ציר HPA** האיטי יותר: **ההיפותלמוס** מפריש **CRH**, שגורם ל**בלוטת יותרת המוח** להפריש **ACTH**, שגורם ל**קליפת יותרת הכליה** להפריש **קורטיזול**. קורטיזול מעלה את רמת הסוכר בדם, מדכא תפקודים לא דחופים ודלקת, ומחזיר משוב למוח (כולל להיפוקמפוס) כדי לכבות את התגובה.',
          '## לחץ ובריאות',
          'לחץ קצר טווח הוא מסתגל. אבל **לחץ כרוני** שומר על קורטיזול גבוה, מה שעלול לפגוע בהיפוקמפוס, לפגוע בזיכרון ולהחליש את **מערכת החיסון** — פצעים מחלימים לאט יותר ואנשים נדבקים בהצטננות בקלות רבה יותר. תחום ה**פסיכונוירואימונולוגיה** חוקר קשרים אלה. לחץ כרוני קשור גם למחלות לב, לדיכאון ולחרדה. תמיכה חברתית, פעילות גופנית, שינה ותחושת שליטה עוזרים לרכך את הלחץ.',
        ],
      },
      points: {
        en: ['General adaptation syndrome: alarm → resistance → exhaustion.', 'Fast system: sympathetic nervous system + epinephrine.', 'HPA axis: CRH → ACTH → cortisol.', 'Chronic cortisol harms the hippocampus and immune function.'],
        he: ['תסמונת ההסתגלות הכללית: אזעקה ← התנגדות ← תשישות.', 'מערכת מהירה: מערכת העצבים הסימפתטית + אפינפרין.', 'ציר HPA: ‏CRH ← ‏ACTH ← קורטיזול.', 'קורטיזול כרוני פוגע בהיפוקמפוס ובתפקוד החיסוני.'],
      },
      terms: [
        ['General adaptation syndrome', 'Selye\'s three-stage stress response: alarm, resistance, exhaustion.', 'תסמונת ההסתגלות הכללית', 'תגובת הלחץ בת שלושת השלבים של סלייה: אזעקה, התנגדות, תשישות.'],
        ['HPA axis', 'Hypothalamus–pituitary–adrenal stress system ending in cortisol release.', 'ציר HPA', 'מערכת הלחץ היפותלמוס-יותרת המוח-יותרת הכליה, המסתיימת בהפרשת קורטיזול.'],
        ['Cortisol', 'Stress hormone from the adrenal cortex.', 'קורטיזול', 'הורמון לחץ מקליפת יותרת הכליה.'],
        ['Psychoneuroimmunology', 'Study of links between the mind, nervous system and immune system.', 'פסיכונוירואימונולוגיה', 'חקר הקשרים בין הנפש, מערכת העצבים ומערכת החיסון.'],
      ],
      quiz: [
        ['Put the HPA axis in order:', 'סדרו את ציר ה-HPA:', ['ACTH → CRH → cortisol', 'CRH → ACTH → cortisol', 'cortisol → ACTH → CRH', 'CRH → cortisol → ACTH'], ['ACTH ← CRH ← קורטיזול', 'CRH ← ACTH ← קורטיזול', 'קורטיזול ← ACTH ← CRH', 'CRH ← קורטיזול ← ACTH'], 1, 'Hypothalamus (CRH) → pituitary (ACTH) → adrenal cortex (cortisol).', 'היפותלמוס (CRH) ← יותרת המוח (ACTH) ← קליפת יותרת הכליה (קורטיזול).'],
        ['Which brain structure is especially vulnerable to chronically high cortisol?', 'איזה מבנה מוחי פגיע במיוחד לקורטיזול גבוה באופן כרוני?', ['Hippocampus', 'Cerebellum', 'Occipital lobe', 'Olfactory bulb'], ['ההיפוקמפוס', 'המוח הקטן', 'האונה העורפית', 'פקעת הריח'], 0, 'The hippocampus has many cortisol receptors and can shrink under chronic stress.', 'בהיפוקמפוס יש קולטני קורטיזול רבים והוא עלול להצטמק בלחץ כרוני.'],
      ],
    },
  ],
};
