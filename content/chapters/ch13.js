// Format explained at the top of ch01.js
export default {
  n: 13,
  icon: '🗣️',
  color: '#6fcf97',
  title: { en: 'Lateralization, Language, and Intelligence', he: 'צידיות, שפה ואינטליגנציה' },
  intro: {
    en: 'How the two hemispheres differ, how the brain produces and understands language, and what biology tells us about intelligence.',
    he: 'במה שונות שתי ההמיספרות, איך המוח מפיק ומבין שפה, ומה הביולוגיה מספרת לנו על אינטליגנציה.',
  },
  lessons: [
    {
      title: { en: 'Two hemispheres: lateralization and the split brain', he: 'שתי המיספרות: צידיות והמוח המפוצל' },
      diagram: 'splitBrain',
      regions: ['corpusCallosum', 'broca', 'wernicke', 'parietal'],
      body: {
        en: [
          '**Lateralization** means that some functions rely more on one hemisphere. In most people, **language** is handled mainly by the **left** hemisphere, while the **right** hemisphere is better at spatial tasks, face recognition, the emotional tone of speech (prosody) and attention to the whole scene.',
          'Remarkably, children who have an entire hemisphere removed (**hemispherectomy**) to treat severe seizures can recover a lot of function, including language — showing the young brain\'s plasticity.',
          '## The split brain',
          'To stop severe epilepsy from spreading, some patients had their **corpus callosum** cut. Roger Sperry and Michael Gazzaniga studied them by flashing images to one visual field. When a word was shown to the **right visual field** (left hemisphere), the patient could say it. When it was shown to the **left visual field** (right hemisphere), the patient said "nothing" — yet the left hand (controlled by the right hemisphere) could pick out the matching object. The left hemisphere often invents explanations for the right hemisphere\'s actions — Gazzaniga called it the **"interpreter"**.',
          '## Handedness and asymmetry',
          'About 90% of people are right-handed. Most right-handers (about 95%) and most left-handers (about 70%) have language in the left hemisphere. The **Wada test** — anaesthetizing one hemisphere with a drug injected into one carotid artery — is used before surgery to find which side handles language. The **planum temporale**, a language area, is usually larger on the left.',
        ],
        he: [
          '**צידיות (Lateralization)** פירושה שתפקודים מסוימים נשענים יותר על המיספרה אחת. אצל רוב האנשים, **השפה** מטופלת בעיקר על ידי ההמיספרה **השמאלית**, ואילו ההמיספרה **הימנית** טובה יותר במשימות מרחביות, בזיהוי פנים, בטון הרגשי של הדיבור (פרוזודיה) ובקשב לתמונה הכוללת.',
          'באופן מפתיע, ילדים שהוסרה להם המיספרה שלמה (**המיספרקטומיה**) לטיפול בפרכוסים קשים יכולים לשחזר תפקוד רב, כולל שפה — מה שמראה את הגמישות של המוח הצעיר.',
          '## המוח המפוצל',
          'כדי לעצור התפשטות של אפילפסיה קשה, לחלק מהמטופלים נחתך **הכפיס**. רוג\'ר ספרי ומייקל גזניגה חקרו אותם על ידי הצגת תמונות לשדה ראייה אחד. כשמילה הוצגה ל**שדה הראייה הימני** (ההמיספרה השמאלית), המטופל יכול היה לומר אותה. כשהיא הוצגה ל**שדה הראייה השמאלי** (ההמיספרה הימנית), המטופל אמר "כלום" — ובכל זאת היד השמאלית (שנשלטת על ידי ההמיספרה הימנית) יכלה לבחור את החפץ המתאים. ההמיספרה השמאלית ממציאה לעיתים קרובות הסברים לפעולות של ההמיספרה הימנית — גזניגה כינה אותה **"המפרש"**.',
          '## יד דומיננטית ואסימטריה',
          'כ-90% מהאנשים ימניים. אצל רוב הימניים (כ-95%) ורוב השמאליים (כ-70%) השפה נמצאת בהמיספרה השמאלית. **מבחן ואדה** — הרדמת המיספרה אחת בתרופה המוזרקת לעורק תרדמה אחד — משמש לפני ניתוח כדי לגלות איזה צד מטפל בשפה. **הפלנום טמפורלה**, אזור שפה, גדול בדרך כלל בצד שמאל.',
        ],
      },
      points: {
        en: ['Left hemisphere: language in most people. Right: spatial, faces, prosody.', 'Split-brain patients cannot name objects seen only by the right hemisphere.', 'The left hemisphere acts as an "interpreter".', 'The Wada test identifies the language hemisphere.'],
        he: ['ההמיספרה השמאלית: שפה אצל רוב האנשים. הימנית: מרחב, פנים, פרוזודיה.', 'מטופלי מוח מפוצל אינם יכולים לשיים חפצים שראתה רק ההמיספרה הימנית.', 'ההמיספרה השמאלית פועלת כ"מפרש".', 'מבחן ואדה מזהה את המיספרת השפה.'],
      },
      terms: [
        ['Lateralization', 'Specialization of each hemisphere for certain functions.', 'צידיות', 'התמחות של כל המיספרה בתפקודים מסוימים.'],
        ['Split brain', 'The result of cutting the corpus callosum, separating the hemispheres.', 'מוח מפוצל', 'התוצאה של חיתוך הכפיס, שמפריד בין ההמיספרות.'],
        ['Wada test', 'Anaesthetizing one hemisphere to find which side controls language.', 'מבחן ואדה', 'הרדמת המיספרה אחת כדי לגלות איזה צד שולט בשפה.'],
        ['Hemispherectomy', 'Surgical removal of one cerebral hemisphere.', 'המיספרקטומיה', 'הסרה כירורגית של המיספרה אחת.'],
      ],
      quiz: [
        ['A split-brain patient sees a picture of a key in the LEFT visual field. What happens?', 'מטופל מוח מפוצל רואה תמונה של מפתח בשדה הראייה השמאלי. מה קורה?', ['He names it easily', 'He cannot name it but can pick it with his left hand', 'He cannot see it at all', 'He picks it with his right hand'], ['הוא משיים אותו בקלות', 'הוא אינו יכול לשיים אותו אך יכול לבחור אותו ביד שמאל', 'הוא אינו רואה אותו כלל', 'הוא בוחר אותו ביד ימין'], 1, 'The right hemisphere saw it; it controls the left hand but usually cannot speak.', 'ההמיספרה הימנית ראתה אותו; היא שולטת ביד שמאל אך בדרך כלל אינה יכולה לדבר.'],
      ],
    },
    {
      title: { en: 'The origins of language', he: 'מקורות השפה' },
      diagram: null,
      regions: ['broca', 'wernicke', 'temporal'],
      body: {
        en: [
          'Language lets us combine a limited set of sounds and words into an unlimited number of meanings using **grammar**. Some researchers see it as an evolved instinct with dedicated brain circuits (Noam Chomsky\'s idea of a universal grammar); others see it as emerging from general learning abilities. The **FOXP2** gene, mutated in a family with severe speech and grammar problems, influences the brain circuits for fine mouth movements and language.',
          'Can animals learn real language? Chimpanzees and bonobos (like **Kanzi**) have learned hundreds of symbols or signs and can combine them, and dolphins and parrots show impressive comprehension. But they rarely use grammar to create long, novel sentences, so most researchers think full human language is unique.',
          '## Multilingualism and sign language',
          'People who learn a second language early process both in overlapping brain areas; late learners use somewhat wider areas. Bilingualism may improve some executive control abilities. **Sign languages** such as American Sign Language are full languages with grammar — and they rely on the **left hemisphere** just like spoken language: deaf signers with left-hemisphere damage develop sign-language aphasias, showing that the left hemisphere is specialized for language itself, not just for sound.',
        ],
        he: [
          'שפה מאפשרת לנו לשלב מערך מוגבל של צלילים ומילים למספר בלתי מוגבל של משמעויות בעזרת **דקדוק**. יש חוקרים שרואים בה אינסטינקט שהתפתח באבולוציה עם מעגלי מוח ייעודיים (הרעיון של נועם חומסקי על דקדוק אוניברסלי); אחרים רואים בה תוצר של יכולות למידה כלליות. הגן **FOXP2**, שעבר מוטציה במשפחה עם בעיות דיבור ודקדוק חמורות, משפיע על מעגלי המוח לתנועות פה עדינות ולשפה.',
          'האם בעלי חיים יכולים ללמוד שפה אמיתית? שימפנזים ובונובו (כמו **קנזי**) למדו מאות סמלים או סימנים ויכולים לשלב ביניהם, ודולפינים ותוכים מראים הבנה מרשימה. אבל הם כמעט אינם משתמשים בדקדוק כדי ליצור משפטים ארוכים וחדשים, ולכן רוב החוקרים סבורים שהשפה האנושית המלאה ייחודית.',
          '## רב-לשוניות ושפת סימנים',
          'אנשים שלומדים שפה שנייה מוקדם מעבדים את שתיהן באזורי מוח חופפים; לומדים מאוחרים משתמשים באזורים רחבים יותר במקצת. דו-לשוניות עשויה לשפר כמה יכולות של שליטה ניהולית. **שפות סימנים** כמו שפת הסימנים האמריקאית הן שפות מלאות עם דקדוק — והן נשענות על **ההמיספרה השמאלית** בדיוק כמו שפה מדוברת: חירשים המשתמשים בשפת סימנים ונפגעו בהמיספרה השמאלית מפתחים אפזיות בשפת הסימנים, מה שמראה שההמיספרה השמאלית מתמחה בשפה עצמה, ולא רק בצליל.',
        ],
      },
      points: {
        en: ['Grammar allows infinite meanings from finite elements.', 'FOXP2 affects speech and language circuits.', 'Apes learn symbols but rarely use grammar like humans.', 'Sign language depends on the left hemisphere, like speech.'],
        he: ['דקדוק מאפשר אינסוף משמעויות מרכיבים סופיים.', 'FOXP2 משפיע על מעגלי דיבור ושפה.', 'קופי אדם לומדים סמלים אך כמעט אינם משתמשים בדקדוק כמו בני אדם.', 'שפת סימנים תלויה בהמיספרה השמאלית, כמו דיבור.'],
      },
      terms: [
        ['FOXP2', 'A gene linked to speech and language development.', 'FOXP2', 'גן הקשור להתפתחות דיבור ושפה.'],
        ['Universal grammar', 'Chomsky\'s idea that humans are born with a capacity for grammar.', 'דקדוק אוניברסלי', 'הרעיון של חומסקי שבני אדם נולדים עם יכולת לדקדוק.'],
        ['American Sign Language', 'A full visual language with its own grammar.', 'שפת הסימנים האמריקאית', 'שפה חזותית מלאה עם דקדוק משלה.'],
      ],
      quiz: [
        ['Deaf signers with LEFT hemisphere damage typically…', 'משתמשי שפת סימנים חירשים עם נזק בהמיספרה השמאלית בדרך כלל…', ['sign normally', 'develop sign-language aphasia', 'lose vision', 'start speaking'], ['מסמנים כרגיל', 'מפתחים אפזיה בשפת הסימנים', 'מאבדים ראייה', 'מתחילים לדבר'], 1, 'The left hemisphere handles language regardless of modality.', 'ההמיספרה השמאלית מטפלת בשפה בלי קשר לאופן ההבעה.'],
      ],
    },
    {
      title: { en: 'Aphasia and disorders of reading, writing and speech', he: 'אפזיה והפרעות קריאה, כתיבה ודיבור' },
      diagram: 'languageModel',
      regions: ['broca', 'wernicke', 'motor', 'temporal', 'occipital', 'parietal'],
      body: {
        en: [
          'In 1861 Paul Broca examined a patient nicknamed "Tan" (the only syllable he could say) and found damage in the left frontal lobe — now **Broca\'s area**. Carl Wernicke later described patients with damage in the left temporal lobe — **Wernicke\'s area**.',
          '## Aphasias',
          '**Broca\'s (expressive) aphasia**: slow, effortful, "telegraphic" speech with few grammar words, while comprehension is relatively good. Patients are aware of their difficulties and often frustrated. **Wernicke\'s (receptive) aphasia**: fluent speech with normal rhythm, but full of wrong words and invented words, making little sense ("word salad"), and poor comprehension; patients are often unaware of the problem. **Conduction aphasia** results from damage to the **arcuate fasciculus** connecting the two areas: comprehension and speech are fairly good, but repeating what was heard is very hard. **Global aphasia** affects all language abilities.',
          'The **Wernicke–Geschwind model** describes a pathway: to repeat a heard word, sound goes from auditory cortex to Wernicke\'s area (meaning), through the arcuate fasciculus to Broca\'s area (speech plan), then to the motor cortex. To read aloud, visual information first goes to the **angular gyrus**. The model is simplified — language uses wider networks — but still useful.',
          '## Reading, writing and stuttering',
          '**Alexia** (loss of reading) and **agraphia** (loss of writing) can follow brain damage. **Dyslexia** is a developmental difficulty learning to read despite normal intelligence, often linked to problems processing speech sounds (phonology) and to differences in left temporal–parietal areas. **Stuttering** involves repetitions and blocks in speech; it is partly genetic, more common in boys, and has been linked to differences in left-hemisphere speech-motor pathways and dopamine.',
        ],
        he: [
          'ב-1861 בדק פול ברוקה מטופל שכונה "טאן" (ההברה היחידה שיכול היה לומר) ומצא נזק באונה המצחית השמאלית — כיום **אזור ברוקה**. קרל ורניקה תיאר מאוחר יותר מטופלים עם נזק באונה הרקתית השמאלית — **אזור ורניקה**.',
          '## אפזיות',
          '**אפזיה של ברוקה (הבעתית)**: דיבור איטי, מאומץ ו"טלגרפי" עם מעט מילות דקדוק, בעוד ההבנה טובה יחסית. המטופלים מודעים לקשיים שלהם ולעיתים קרובות מתוסכלים. **אפזיה של ורניקה (קליטתית)**: דיבור שוטף עם קצב תקין, אך מלא במילים שגויות ומומצאות ובעל מעט משמעות ("סלט מילים"), והבנה ירודה; המטופלים לרוב אינם מודעים לבעיה. **אפזיית הולכה** נובעת מנזק ל**אלומה הקשתית** המחברת בין שני האזורים: ההבנה והדיבור טובים למדי, אך חזרה על מה שנשמע קשה מאוד. **אפזיה גלובלית** פוגעת בכל יכולות השפה.',
          '**מודל ורניקה-גשווינד** מתאר מסלול: כדי לחזור על מילה שנשמעה, הצליל עובר מקליפת השמע לאזור ורניקה (משמעות), דרך האלומה הקשתית לאזור ברוקה (תוכנית דיבור), ואז לקליפה המוטורית. כדי לקרוא בקול, המידע החזותי עובר תחילה ל**פיתול הזוויתי (Angular gyrus)**. המודל מפושט — השפה משתמשת ברשתות רחבות יותר — אך עדיין שימושי.',
          '## קריאה, כתיבה וגמגום',
          '**אלקסיה** (אובדן הקריאה) ו**אגרפיה** (אובדן הכתיבה) יכולות להופיע לאחר נזק מוחי. **דיסלקציה** היא קושי התפתחותי ללמוד לקרוא למרות אינטליגנציה תקינה, הקשור לעיתים קרובות לבעיות בעיבוד צלילי הדיבור (פונולוגיה) ולהבדלים באזורים רקתיים-קודקודיים שמאליים. **גמגום** כולל חזרות וחסימות בדיבור; הוא תורשתי בחלקו, שכיח יותר בבנים, וקושר להבדלים במסלולי הדיבור-מוטוריים בהמיספרה השמאלית ולדופמין.',
        ],
      },
      points: {
        en: ['Broca\'s aphasia: effortful, telegraphic speech; comprehension fairly good.', 'Wernicke\'s aphasia: fluent but meaningless speech; poor comprehension.', 'Conduction aphasia: arcuate fasciculus damage; poor repetition.', 'Dyslexia is linked to phonological processing problems.'],
        he: ['אפזיה של ברוקה: דיבור מאומץ וטלגרפי; הבנה טובה למדי.', 'אפזיה של ורניקה: דיבור שוטף אך חסר משמעות; הבנה ירודה.', 'אפזיית הולכה: נזק לאלומה הקשתית; חזרה ירודה.', 'דיסלקציה קשורה לבעיות בעיבוד פונולוגי.'],
      },
      terms: [
        ['Aphasia', 'A language disorder caused by brain damage.', 'אפזיה', 'הפרעת שפה הנגרמת מנזק מוחי.'],
        ['Broca\'s aphasia', 'Expressive aphasia: slow, effortful speech with relatively good comprehension.', 'אפזיה של ברוקה', 'אפזיה הבעתית: דיבור איטי ומאומץ עם הבנה טובה יחסית.'],
        ['Wernicke\'s aphasia', 'Receptive aphasia: fluent, meaningless speech and poor comprehension.', 'אפזיה של ורניקה', 'אפזיה קליטתית: דיבור שוטף וחסר משמעות והבנה ירודה.'],
        ['Arcuate fasciculus', 'Fibre bundle linking Wernicke\'s and Broca\'s areas.', 'האלומה הקשתית', 'צרור סיבים המחבר בין אזור ורניקה לאזור ברוקה.'],
        ['Dyslexia', 'A developmental difficulty in learning to read despite normal intelligence.', 'דיסלקציה', 'קושי התפתחותי ללמוד לקרוא למרות אינטליגנציה תקינה.'],
      ],
      quiz: [
        ['A patient speaks fluently but says "the glimper went to the store to fid the sandal pot." Which aphasia?', 'מטופל מדבר בשטף אך אומר משפטים מלאים במילים מומצאות וחסרי משמעות. איזו אפזיה?', ['Broca\'s', 'Wernicke\'s', 'Conduction', 'None'], ['של ברוקה', 'של ורניקה', 'הולכה', 'אף אחת'], 1, 'Fluent but meaningless speech with invented words is typical of Wernicke\'s aphasia.', 'דיבור שוטף אך חסר משמעות עם מילים מומצאות אופייני לאפזיה של ורניקה.'],
        ['Difficulty REPEATING sentences with fairly good speech and comprehension suggests damage to…', 'קושי בחזרה על משפטים עם דיבור והבנה טובים למדי מרמז על נזק ל…', ['Broca\'s area', 'the arcuate fasciculus', 'the occipital lobe', 'the cerebellum'], ['אזור ברוקה', 'האלומה הקשתית', 'האונה העורפית', 'המוח הקטן'], 1, 'This is conduction aphasia.', 'זוהי אפזיית הולכה.'],
      ],
    },
    {
      title: { en: 'Intelligence', he: 'אינטליגנציה' },
      diagram: null,
      regions: ['frontal', 'parietal'],
      body: {
        en: [
          'Intelligence is usually measured with **IQ tests** such as the Wechsler scales. Scores on very different tests tend to correlate — Charles Spearman called this shared factor **g (general intelligence)**. Others proposed specific abilities: Howard Gardner\'s **multiple intelligences** (linguistic, musical, spatial, interpersonal and more) and Raymond Cattell\'s distinction between **fluid intelligence** (reasoning about new problems, declines with age) and **crystallized intelligence** (accumulated knowledge, stays stable).',
          '## Genes and environment',
          'Twin and adoption studies estimate the heritability of IQ at roughly 50%, rising with age. But the environment matters a lot: nutrition, education, and family income all affect IQ, and average IQ scores rose substantially over the 20th century (the **Flynn effect**) — far too fast for genetic change.',
          '## Biological correlates',
          'Brain size correlates modestly with IQ (around 0.3–0.4). More important seem to be the efficiency and integrity of **white-matter connections**, and a network linking the **frontal and parietal** cortex (the **parieto-frontal integration theory**). Smarter brains may also work more efficiently — using less energy on easy tasks. Albert Einstein\'s brain was of average size but had an unusual parietal lobe, an area linked to mathematical and spatial thinking.',
        ],
        he: [
          'אינטליגנציה נמדדת בדרך כלל ב**מבחני IQ** כמו סולמות וקסלר. ציונים במבחנים שונים מאוד נוטים להיות מתואמים — צ\'רלס ספירמן קרא לגורם המשותף הזה **g (אינטליגנציה כללית)**. אחרים הציעו יכולות ספציפיות: **האינטליגנציות המרובות** של הווארד גרדנר (לשונית, מוזיקלית, מרחבית, בין-אישית ועוד) וההבחנה של ריימונד קטל בין **אינטליגנציה נזילה** (חשיבה על בעיות חדשות, יורדת עם הגיל) ל**אינטליגנציה מגובשת** (ידע מצטבר, נשארת יציבה).',
          '## גנים וסביבה',
          'מחקרי תאומים ואימוץ מעריכים את התורשתיות של IQ בכ-50%, והיא עולה עם הגיל. אבל לסביבה חשיבות רבה: תזונה, חינוך והכנסת המשפחה משפיעים כולם על IQ, וציוני IQ ממוצעים עלו משמעותית במאה ה-20 (**אפקט פלין**) — מהר מדי בשביל שינוי גנטי.',
          '## מתאמים ביולוגיים',
          'גודל המוח מתואם במידה מתונה עם IQ (כ-0.3–0.4). חשובים יותר, כך נראה, היעילות והשלמות של **קשרי החומר הלבן**, ורשת המחברת בין קליפת **המצח והקודקוד** (**תיאוריית האינטגרציה הקודקודית-מצחית**). ייתכן שמוחות חכמים יותר גם עובדים ביעילות רבה יותר — וצורכים פחות אנרגיה במשימות קלות. המוח של אלברט איינשטיין היה בגודל ממוצע, אך הייתה לו אונה קודקודית יוצאת דופן, אזור הקשור לחשיבה מתמטית ומרחבית.',
        ],
      },
      points: {
        en: ['g = general intelligence underlying many tests.', 'Fluid (reasoning) vs crystallized (knowledge) intelligence.', 'IQ heritability ~50%, but the Flynn effect shows strong environmental influence.', 'Fronto-parietal networks and white-matter efficiency relate to intelligence.'],
        he: ['g = אינטליגנציה כללית העומדת בבסיס מבחנים רבים.', 'אינטליגנציה נזילה (חשיבה) מול מגובשת (ידע).', 'תורשתיות IQ כ-50%, אך אפקט פלין מראה השפעה סביבתית חזקה.', 'רשתות מצחיות-קודקודיות ויעילות החומר הלבן קשורות לאינטליגנציה.'],
      },
      terms: [
        ['g factor', 'General intelligence: the shared ability behind performance on many tests.', 'גורם g', 'אינטליגנציה כללית: היכולת המשותפת שמאחורי ביצוע במבחנים רבים.'],
        ['Fluid intelligence', 'Ability to reason and solve new problems.', 'אינטליגנציה נזילה', 'היכולת לחשוב ולפתור בעיות חדשות.'],
        ['Crystallized intelligence', 'Accumulated knowledge and skills.', 'אינטליגנציה מגובשת', 'ידע ומיומנויות מצטברים.'],
        ['Flynn effect', 'The large rise in average IQ scores over the 20th century.', 'אפקט פלין', 'העלייה הגדולה בציוני IQ ממוצעים במאה ה-20.'],
      ],
      quiz: [
        ['The steady rise in IQ scores across generations is called…', 'העלייה המתמדת בציוני IQ לאורך הדורות נקראת…', ['the g factor', 'the Flynn effect', 'crystallized intelligence', 'the Wada effect'], ['גורם g', 'אפקט פלין', 'אינטליגנציה מגובשת', 'אפקט ואדה'], 1, 'The rise is too fast to be genetic, highlighting environmental effects.', 'העלייה מהירה מדי מכדי להיות גנטית, מה שמדגיש השפעות סביבתיות.'],
      ],
    },
  ],
};
