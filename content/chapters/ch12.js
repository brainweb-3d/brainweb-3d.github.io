// Format explained at the top of ch01.js
export default {
  n: 12,
  icon: '📚',
  color: '#2d9cdb',
  title: { en: 'Learning and Memory', he: 'למידה וזיכרון' },
  intro: {
    en: 'How simple animals learn, which brain systems store different kinds of memory, and the cellular changes that make memories last.',
    he: 'איך בעלי חיים פשוטים לומדים, אילו מערכות מוח שומרות סוגים שונים של זיכרון, והשינויים בתאים שגורמים לזיכרונות להחזיק מעמד.',
  },
  lessons: [
    {
      title: { en: 'Types of learning and lessons from a sea slug', he: 'סוגי למידה ולקחים משבלול ים' },
      diagram: 'aplysia',
      regions: [],
      body: {
        en: [
          '**Learning** is a lasting change in behaviour due to experience. **Non-associative** learning involves one stimulus: **habituation** (responding less to a repeated harmless stimulus, like ignoring a ticking clock) and **sensitization** (responding more strongly after an intense or harmful stimulus). **Associative** learning links events: in **classical conditioning** (Pavlov), a neutral stimulus (bell) predicts a meaningful one (food) and comes to trigger a response (salivation); in **operant (instrumental) conditioning**, behaviour changes according to its consequences (rewards and punishments). Other forms include **observational learning**.',
          '## Aplysia',
          'Eric Kandel studied the sea slug **Aplysia**, which has large, identifiable neurons. When its siphon is touched, it withdraws its gill. With repeated touches, the response **habituates** because the sensory neurons release **less neurotransmitter** at their synapses. After a shock to the tail, the response is **sensitized**: interneurons release **serotonin**, which (through cAMP) makes the sensory neurons release **more** neurotransmitter. Long-term sensitization requires **new proteins** (via the transcription factor CREB) and even **new synapses**. Aplysia can also be classically conditioned. This work showed that learning works by changing the **strength of synapses** — and earned Kandel a Nobel Prize in 2000.',
        ],
        he: [
          '**למידה** היא שינוי מתמשך בהתנהגות בעקבות חוויה. למידה **לא אסוציאטיבית** כוללת גירוי אחד: **הרגלה (Habituation)** (תגובה פוחתת לגירוי לא מזיק שחוזר, כמו התעלמות משעון מתקתק) ו**רגישות (Sensitization)** (תגובה חזקה יותר לאחר גירוי עז או מזיק). למידה **אסוציאטיבית** מקשרת בין אירועים: ב**התניה קלאסית** (פבלוב), גירוי ניטרלי (פעמון) מנבא גירוי משמעותי (אוכל) ומתחיל לעורר תגובה (ריור); ב**התניה אופרנטית (אינסטרומנטלית)**, ההתנהגות משתנה לפי התוצאות שלה (תגמולים ועונשים). צורות נוספות כוללות **למידה מתצפית**.',
          '## אפליזיה',
          'אריק קנדל חקר את שבלול הים **אפליזיה (Aplysia)**, שיש לו נוירונים גדולים וניתנים לזיהוי. כשנוגעים בסיפון שלו, הוא מושך את הזימים. עם נגיעות חוזרות התגובה **מתרגלת**, כי הנוירונים התחושתיים משחררים **פחות מוליך עצבי** בסינפסות שלהם. לאחר מכה חשמלית בזנב התגובה **מתרגשת**: אינטרנוירונים משחררים **סרוטונין**, שגורם (דרך cAMP) לנוירונים התחושתיים לשחרר **יותר** מוליך עצבי. רגישות ארוכת טווח דורשת **חלבונים חדשים** (דרך גורם השעתוק CREB) ואפילו **סינפסות חדשות**. אפשר גם להתנות את האפליזיה בהתניה קלאסית. עבודה זו הראתה שלמידה פועלת על ידי שינוי **חוזק הסינפסות** — וזיכתה את קנדל בפרס נובל בשנת 2000.',
        ],
      },
      points: {
        en: ['Habituation = weaker response to repeated harmless stimuli; sensitization = stronger response.', 'Classical conditioning links stimuli; operant conditioning links behaviour and consequences.', 'In Aplysia, habituation reduces and sensitization increases neurotransmitter release.', 'Long-term memory needs new proteins (CREB) and new synapses.'],
        he: ['הרגלה = תגובה חלשה יותר לגירוי לא מזיק שחוזר; רגישות = תגובה חזקה יותר.', 'התניה קלאסית מקשרת גירויים; התניה אופרנטית מקשרת התנהגות לתוצאות.', 'באפליזיה, הרגלה מפחיתה ורגישות מגבירה את שחרור המוליך העצבי.', 'זיכרון ארוך טווח דורש חלבונים חדשים (CREB) וסינפסות חדשות.'],
      },
      terms: [
        ['Habituation', 'Decreased response to a repeated, harmless stimulus.', 'הרגלה', 'ירידה בתגובה לגירוי לא מזיק שחוזר על עצמו.'],
        ['Sensitization', 'Increased response to stimuli after an intense or harmful stimulus.', 'רגישות (Sensitization)', 'עלייה בתגובה לגירויים לאחר גירוי עז או מזיק.'],
        ['Classical conditioning', 'Learning that a neutral stimulus predicts a meaningful one.', 'התניה קלאסית', 'למידה שגירוי ניטרלי מנבא גירוי משמעותי.'],
        ['Operant conditioning', 'Learning in which behaviour is shaped by its consequences.', 'התניה אופרנטית', 'למידה שבה ההתנהגות מעוצבת על ידי תוצאותיה.'],
        ['Aplysia', 'A sea slug with large neurons, used by Kandel to study learning.', 'אפליזיה', 'שבלול ים עם נוירונים גדולים, ששימש את קנדל לחקר למידה.'],
      ],
      quiz: [
        ['In Aplysia, habituation is caused by…', 'באפליזיה, הרגלה נגרמת על ידי…', ['more neurotransmitter release', 'less neurotransmitter release', 'new neurons', 'damage to the gill'], ['שחרור מוגבר של מוליך עצבי', 'שחרור מופחת של מוליך עצבי', 'נוירונים חדשים', 'נזק לזימים'], 1, 'Sensory neurons release less neurotransmitter onto motor neurons.', 'הנוירונים התחושתיים משחררים פחות מוליך עצבי לנוירונים המוטוריים.'],
        ['You stop noticing the hum of the fridge. This is…', 'הפסקתם לשים לב לזמזום המקרר. זוהי…', ['sensitization', 'habituation', 'operant conditioning', 'classical conditioning'], ['רגישות', 'הרגלה', 'התניה אופרנטית', 'התניה קלאסית'], 1, 'A weaker response to a repeated, harmless stimulus.', 'תגובה חלשה יותר לגירוי לא מזיק שחוזר.'],
      ],
    },
    {
      title: { en: 'Classical conditioning in the brain', he: 'התניה קלאסית במוח' },
      diagram: null,
      regions: ['cerebellum', 'amygdala'],
      body: {
        en: [
          'Different kinds of conditioning depend on different brain circuits.',
          '## Eye-blink conditioning and the cerebellum',
          'If a tone is repeatedly followed by a puff of air to the eye, people and rabbits learn to blink when they hear the tone. Richard Thompson showed that this depends on the **cerebellum** — specifically the **interpositus nucleus**. Damaging it prevents the learning and abolishes an already learned response, while the unconditioned blink to the air puff remains. People with cerebellar damage have trouble with this kind of conditioning.',
          '## Fear conditioning and the amygdala',
          'When a tone is paired with a mild shock, animals learn to **freeze** at the sound of the tone. This depends on the **amygdala**: the tone and shock information converge in the lateral amygdala, and the central nucleus triggers fear responses (freezing, faster heart rate, stress hormones). The amygdala can be reached by a fast "low road" directly from the thalamus and a slower, more detailed "high road" via the cortex. Fear conditioning helps explain anxiety disorders such as phobias and PTSD; **extinction** (learning that the tone no longer predicts danger) depends on the prefrontal cortex and is the basis of exposure therapy.',
        ],
        he: [
          'סוגים שונים של התניה תלויים במעגלים מוחיים שונים.',
          '## התניית מצמוץ והמוח הקטן',
          'אם צליל מלווה שוב ושוב בנשיפת אוויר לעין, בני אדם וארנבים לומדים למצמץ כשהם שומעים את הצליל. ריצ\'רד תומפסון הראה שזה תלוי ב**מוח הקטן** — ובמיוחד ב**גרעין האינטרפוזיטוס**. פגיעה בו מונעת את הלמידה ומבטלת תגובה שכבר נלמדה, בעוד המצמוץ הלא-מותנה לנשיפה נשאר. אנשים עם נזק במוח הקטן מתקשים בסוג זה של התניה.',
          '## התניית פחד והאמיגדלה',
          'כשצליל מוצמד למכה חשמלית קלה, בעלי חיים לומדים **לקפוא** כשהם שומעים את הצליל. זה תלוי ב**אמיגדלה**: המידע על הצליל ועל המכה נפגש באמיגדלה הצידית, והגרעין המרכזי מפעיל תגובות פחד (קיפאון, קצב לב מהיר, הורמוני לחץ). אפשר להגיע לאמיגדלה ב"דרך נמוכה" מהירה ישירות מהתלמוס וב"דרך גבוהה" איטית ומפורטת יותר דרך הקליפה. התניית פחד עוזרת להסביר הפרעות חרדה כמו פוביות ו-PTSD; **הכחדה (Extinction)** (למידה שהצליל כבר אינו מנבא סכנה) תלויה בקליפה הקדם-מצחית והיא הבסיס לטיפול בחשיפה.',
        ],
      },
      points: {
        en: ['Eye-blink conditioning depends on the cerebellum (interpositus nucleus).', 'Fear conditioning depends on the amygdala.', 'A fast thalamus→amygdala route and a slower cortical route.', 'Extinction involves the prefrontal cortex; basis of exposure therapy.'],
        he: ['התניית מצמוץ תלויה במוח הקטן (גרעין האינטרפוזיטוס).', 'התניית פחד תלויה באמיגדלה.', 'מסלול מהיר תלמוס←אמיגדלה ומסלול איטי יותר דרך הקליפה.', 'הכחדה מערבת את הקליפה הקדם-מצחית; הבסיס לטיפול בחשיפה.'],
      },
      terms: [
        ['Interpositus nucleus', 'Cerebellar nucleus required for eye-blink conditioning.', 'גרעין האינטרפוזיטוס', 'גרעין במוח הקטן הנחוץ להתניית מצמוץ.'],
        ['Fear conditioning', 'Learning that a neutral stimulus predicts danger.', 'התניית פחד', 'למידה שגירוי ניטרלי מנבא סכנה.'],
        ['Extinction', 'Weakening of a conditioned response when the stimulus no longer predicts the outcome.', 'הכחדה', 'היחלשות של תגובה מותנית כשהגירוי כבר אינו מנבא את התוצאה.'],
      ],
      quiz: [
        ['Damage to which structure prevents eye-blink conditioning?', 'פגיעה באיזה מבנה מונעת התניית מצמוץ?', ['Amygdala', 'Cerebellum', 'Hippocampus', 'Occipital lobe'], ['האמיגדלה', 'המוח הקטן', 'ההיפוקמפוס', 'האונה העורפית'], 1, 'The interpositus nucleus of the cerebellum is essential.', 'גרעין האינטרפוזיטוס במוח הקטן הוא חיוני.'],
        ['A rat freezes when it hears a tone that was paired with shock. Which structure is essential?', 'חולדה קופאת כשהיא שומעת צליל שהוצמד למכה. איזה מבנה חיוני כאן?', ['Amygdala', 'Cerebellum', 'Pons', 'Corpus callosum'], ['האמיגדלה', 'המוח הקטן', 'הגשר', 'הכפיס'], 0, 'Fear conditioning depends on the amygdala.', 'התניית פחד תלויה באמיגדלה.'],
      ],
    },
    {
      title: { en: 'Types of memory and brain systems', he: 'סוגי זיכרון ומערכות מוח' },
      diagram: 'memorySystems',
      regions: ['hippocampus', 'frontal', 'temporal', 'basalGanglia', 'cerebellum', 'amygdala', 'thalamus'],
      body: {
        en: [
          'Memory moves through stages: brief **sensory memory**, **short-term / working memory** (holding a few items for seconds, like a phone number), and **long-term memory**. Long-term memory comes in two big families. **Declarative (explicit)** memory can be consciously recalled: **semantic** memory (facts) and **episodic** memory (personal events). **Nondeclarative (implicit)** memory shows in performance: **procedural** skills and habits, **priming**, and conditioned responses.',
          '## Patient H.M.',
          'In 1953, Henry Molaison (H.M.) had both medial temporal lobes — including most of the **hippocampus** — removed to stop severe epilepsy. Afterwards he could not form new declarative memories (**anterograde amnesia**), and lost some memories from the years before surgery (**retrograde amnesia**). Yet his working memory and older memories were intact, and he **could learn new skills** like mirror drawing — without remembering practising. H.M. showed that the hippocampus is needed to **consolidate** new declarative memories, but not to store old ones or learn procedures.',
          '## Other memory structures',
          'The hippocampus also builds spatial maps — **place cells** fire when an animal is in a particular location (and nearby **grid cells** form a coordinate system). London taxi drivers have enlarged posterior hippocampi. Long-term semantic memories are stored across the **cortex** (especially the temporal lobes). The **prefrontal cortex** supports working memory and the source and order of memories. The **basal ganglia** (striatum) store habits and procedures; the **cerebellum** stores motor timing; the **amygdala** strengthens emotional memories. Damage to the **diencephalon** (thalamus, mammillary bodies) in **Korsakoff\'s syndrome** — caused by thiamine (B1) deficiency in chronic alcoholism — also produces severe amnesia.',
        ],
        he: [
          'הזיכרון עובר דרך שלבים: **זיכרון חושי** קצר, **זיכרון קצר טווח / זיכרון עבודה** (החזקת פריטים ספורים לשניות, כמו מספר טלפון), ו**זיכרון ארוך טווח**. לזיכרון ארוך הטווח שתי משפחות גדולות. זיכרון **הצהרתי (מפורש)** אפשר לשלוף באופן מודע: זיכרון **סמנטי** (עובדות) וזיכרון **אפיזודי** (אירועים אישיים). זיכרון **לא-הצהרתי (משתמע)** מתבטא בביצוע: מיומנויות והרגלים **פרוצדורליים**, **טרימה (Priming)** ותגובות מותנות.',
          '## המטופל ה.מ.',
          'ב-1953 הוסרו להנרי מולייסון (ה.מ.) שתי האונות הרקתיות המדיאליות — כולל רוב **ההיפוקמפוס** — כדי לעצור אפילפסיה קשה. לאחר מכן הוא לא יכול היה ליצור זיכרונות הצהרתיים חדשים (**אמנזיה אנטרוגרדית**), ואיבד חלק מהזיכרונות מהשנים שלפני הניתוח (**אמנזיה רטרוגרדית**). ועדיין זיכרון העבודה והזיכרונות הישנים שלו נשמרו, והוא **יכול היה ללמוד מיומנויות חדשות** כמו ציור במראה — בלי לזכור שהתאמן. ה.מ. הראה שההיפוקמפוס נחוץ ל**קיבוע** זיכרונות הצהרתיים חדשים, אך לא לאחסון זיכרונות ישנים או ללמידת פרוצדורות.',
          '## מבני זיכרון נוספים',
          'ההיפוקמפוס בונה גם מפות מרחביות — **תאי מקום** יורים כשבעל החיים נמצא במיקום מסוים (ו**תאי רשת** סמוכים יוצרים מערכת קואורדינטות). אצל נהגי מוניות בלונדון ההיפוקמפוס האחורי מוגדל. זיכרונות סמנטיים ארוכי טווח מאוחסנים ברחבי **הקליפה** (במיוחד באונות הרקתיות). **הקליפה הקדם-מצחית** תומכת בזיכרון עבודה ובמקור ובסדר של זיכרונות. **הגרעינים הבסיסיים** (הסטריאטום) שומרים הרגלים ופרוצדורות; **המוח הקטן** שומר תזמון מוטורי; **האמיגדלה** מחזקת זיכרונות רגשיים. פגיעה ב**מוח הביניים** (תלמוס, גופים פטמתיים) ב**תסמונת קורסקוף** — הנגרמת מחסר בתיאמין (B1) באלכוהוליזם כרוני — גורמת גם היא לאמנזיה חמורה.',
        ],
      },
      points: {
        en: ['Declarative (semantic + episodic) vs nondeclarative (procedural, priming, conditioning).', 'H.M.: no new declarative memories, but could learn skills.', 'Hippocampus consolidates new declarative and spatial memories (place cells).', 'Basal ganglia = habits; cerebellum = motor timing; Korsakoff = thiamine deficiency.'],
        he: ['הצהרתי (סמנטי + אפיזודי) מול לא-הצהרתי (פרוצדורלי, טרימה, התניה).', 'ה.מ.: לא יצר זיכרונות הצהרתיים חדשים, אך יכול היה ללמוד מיומנויות.', 'ההיפוקמפוס מקבע זיכרונות הצהרתיים ומרחביים חדשים (תאי מקום).', 'גרעינים בסיסיים = הרגלים; מוח קטן = תזמון מוטורי; קורסקוף = חסר תיאמין.'],
      },
      terms: [
        ['Declarative memory', 'Memory for facts and events that can be consciously recalled.', 'זיכרון הצהרתי', 'זיכרון לעובדות ולאירועים שאפשר לשלוף באופן מודע.'],
        ['Procedural memory', 'Memory for skills and habits, shown through performance.', 'זיכרון פרוצדורלי', 'זיכרון למיומנויות והרגלים, המתבטא בביצוע.'],
        ['Anterograde amnesia', 'Inability to form new memories after brain damage.', 'אמנזיה אנטרוגרדית', 'חוסר יכולת ליצור זיכרונות חדשים לאחר נזק מוחי.'],
        ['Retrograde amnesia', 'Loss of memories formed before brain damage.', 'אמנזיה רטרוגרדית', 'אובדן זיכרונות שנוצרו לפני הנזק המוחי.'],
        ['Place cells', 'Hippocampal neurons that fire when an animal is in a specific location.', 'תאי מקום', 'נוירונים בהיפוקמפוס שיורים כשבעל החיים נמצא במיקום מסוים.'],
        ['Korsakoff\'s syndrome', 'Severe amnesia from thiamine deficiency, often in chronic alcoholism.', 'תסמונת קורסקוף', 'אמנזיה חמורה עקב חסר בתיאמין, לרוב באלכוהוליזם כרוני.'],
      ],
      quiz: [
        ['After surgery, H.M. could still…', 'אחרי הניתוח, ה.מ. עדיין יכול היה…', ['form new episodic memories', 'learn new motor skills like mirror drawing', 'remember new people he met', 'recall what he ate an hour ago'], ['ליצור זיכרונות אפיזודיים חדשים', 'ללמוד מיומנויות מוטוריות חדשות כמו ציור במראה', 'לזכור אנשים חדשים שפגש', 'לזכור מה אכל לפני שעה'], 1, 'Procedural learning does not depend on the hippocampus.', 'למידה פרוצדורלית אינה תלויה בהיפוקמפוס.'],
        ['Remembering your 10th birthday party is an example of…', 'לזכור את מסיבת יום ההולדת העשירי שלכם הוא דוגמה ל…', ['semantic memory', 'episodic memory', 'procedural memory', 'priming'], ['זיכרון סמנטי', 'זיכרון אפיזודי', 'זיכרון פרוצדורלי', 'טרימה'], 1, 'Episodic memory stores personal events in time and place.', 'זיכרון אפיזודי שומר אירועים אישיים בזמן ובמקום.'],
      ],
    },
    {
      title: { en: 'The biochemistry of memory, stress and aging', he: 'הביוכימיה של הזיכרון, לחץ והזדקנות' },
      diagram: 'ltp',
      regions: ['hippocampus', 'amygdala', 'frontal'],
      body: {
        en: [
          '## Long-term potentiation (LTP)',
          'In 1949 Donald Hebb proposed that when one neuron repeatedly helps fire another, the connection between them grows stronger — "cells that fire together wire together". **Long-term potentiation (LTP)**, discovered in the hippocampus, is just that: brief, high-frequency stimulation makes a synapse respond more strongly for hours, days or longer. The key is the **NMDA glutamate receptor**, a "coincidence detector": it opens only when glutamate is present **and** the postsynaptic cell is already depolarized (which pushes out a blocking magnesium ion). Calcium then flows in, triggering more **AMPA receptors** to be inserted into the membrane, so the synapse becomes stronger. Long-lasting LTP needs new protein synthesis, and the synapses may change shape and grow. The opposite process, **long-term depression (LTD)**, weakens synapses. Blocking NMDA receptors in rats impairs learning of the water maze.',
          '## Stress and memory',
          'Moderate arousal improves memory (emotional events are remembered well, via the amygdala and stress hormones like epinephrine). But very high or prolonged stress — and the hormone **cortisol** — impairs memory retrieval and, over time, can damage the hippocampus.',
          '## Aging and memory',
          'With age, working memory and episodic memory decline more than semantic knowledge and skills. Physical exercise, mental challenge, good sleep, social engagement and cardiovascular health are linked to better memory in later life.',
        ],
        he: [
          '## פוטנציאציה ארוכת טווח (LTP)',
          'ב-1949 הציע דונלד הב שכאשר נוירון אחד עוזר שוב ושוב לנוירון אחר לירות, הקשר ביניהם מתחזק — "תאים שיורים יחד מתחברים יחד". **פוטנציאציה ארוכת טווח (LTP)**, שהתגלתה בהיפוקמפוס, היא בדיוק זה: גירוי קצר בתדירות גבוהה גורם לסינפסה להגיב חזק יותר במשך שעות, ימים ויותר. המפתח הוא **קולטן הגלוטמט NMDA**, "גלאי צירופי מקרים": הוא נפתח רק כשיש גלוטמט **וגם** התא הפוסט-סינפטי כבר עבר דה-פולריזציה (מה שדוחף החוצה יון מגנזיום חוסם). אז זורם פנימה סידן, שמפעיל הכנסה של עוד **קולטני AMPA** לממברנה, וכך הסינפסה מתחזקת. LTP ממושך דורש ייצור חלבונים חדשים, והסינפסות עשויות לשנות צורה ולגדול. התהליך ההפוך, **דיכוי ארוך טווח (LTD)**, מחליש סינפסות. חסימת קולטני NMDA בחולדות פוגעת בלמידת מבוך המים.',
          '## לחץ וזיכרון',
          'עוררות מתונה משפרת זיכרון (אירועים רגשיים נזכרים היטב, דרך האמיגדלה והורמוני לחץ כמו אדרנלין). אבל לחץ גבוה מאוד או ממושך — וההורמון **קורטיזול** — פוגעים בשליפת זיכרונות, ולאורך זמן עלולים לפגוע בהיפוקמפוס.',
          '## הזדקנות וזיכרון',
          'עם הגיל, זיכרון העבודה והזיכרון האפיזודי יורדים יותר מאשר הידע הסמנטי והמיומנויות. פעילות גופנית, אתגר מנטלי, שינה טובה, מעורבות חברתית ובריאות לב וכלי דם קשורים לזיכרון טוב יותר בגיל מבוגר.',
        ],
      },
      points: {
        en: ['Hebb: cells that fire together wire together.', 'LTP strengthens synapses; NMDA receptors detect coincidence and let calcium in.', 'More AMPA receptors make the synapse stronger.', 'Moderate arousal helps memory; chronic stress and cortisol harm it.'],
        he: ['הב: תאים שיורים יחד מתחברים יחד.', 'LTP מחזק סינפסות; קולטני NMDA מזהים צירוף ומכניסים סידן.', 'יותר קולטני AMPA מחזקים את הסינפסה.', 'עוררות מתונה עוזרת לזיכרון; לחץ כרוני וקורטיזול מזיקים לו.'],
      },
      terms: [
        ['Long-term potentiation (LTP)', 'A long-lasting increase in synaptic strength after high-frequency stimulation.', 'פוטנציאציה ארוכת טווח (LTP)', 'עלייה ממושכת בחוזק הסינפסה לאחר גירוי בתדירות גבוהה.'],
        ['NMDA receptor', 'Glutamate receptor that opens only with glutamate plus depolarization; lets calcium in.', 'קולטן NMDA', 'קולטן גלוטמט שנפתח רק עם גלוטמט וגם דה-פולריזציה; מכניס סידן.'],
        ['AMPA receptor', 'Fast glutamate receptor; more are added to a synapse during LTP.', 'קולטן AMPA', 'קולטן גלוטמט מהיר; עוד קולטנים כאלה מתווספים לסינפסה ב-LTP.'],
        ['Hebb rule', 'When neurons fire together repeatedly, their connection strengthens.', 'כלל הב', 'כשנוירונים יורים יחד שוב ושוב, הקשר ביניהם מתחזק.'],
      ],
      quiz: [
        ['Why is the NMDA receptor called a "coincidence detector"?', 'מדוע קולטן ה-NMDA נקרא "גלאי צירופי מקרים"?', ['It opens only when glutamate is present AND the cell is depolarized', 'It responds to two different neurotransmitters', 'It fires only at night', 'It detects light and sound'], ['הוא נפתח רק כשיש גלוטמט וגם התא עבר דה-פולריזציה', 'הוא מגיב לשני מוליכים עצביים שונים', 'הוא יורה רק בלילה', 'הוא מזהה אור וקול'], 0, 'Depolarization removes the magnesium block, so both conditions are needed.', 'הדה-פולריזציה מסירה את חסימת המגנזיום, ולכן שני התנאים נחוצים.'],
      ],
    },
  ],
};
