// Format explained at the top of ch01.js
export default {
  n: 16,
  icon: '🧩',
  color: '#bb6bd9',
  title: { en: 'Psychological Disorders', he: 'הפרעות נפשיות' },
  intro: {
    en: 'The biology of schizophrenia, mood disorders, anxiety disorders, autism and ADHD — causes, brain differences and treatments.',
    he: 'הביולוגיה של סכיזופרניה, הפרעות מצב רוח, הפרעות חרדה, אוטיזם ו-ADHD — גורמים, הבדלים במוח וטיפולים.',
  },
  lessons: [
    {
      title: { en: 'Schizophrenia', he: 'סכיזופרניה' },
      diagram: 'twins',
      regions: ['ventricles', 'frontal', 'hippocampus', 'vta', 'basalGanglia', 'temporal'],
      body: {
        en: [
          '**Schizophrenia** affects about 0.5–1% of people in every nation and is usually first diagnosed between ages 18 and 25. **Positive symptoms** are additions to normal experience: **hallucinations** (usually hearing voices), **delusions** (firm false beliefs) and disorganized thinking and speech. **Negative symptoms** are losses: flat emotion, little speech, lack of motivation and social withdrawal. **Cognitive symptoms** include problems with attention and working memory.',
          '## Causes',
          '**Genes** play a large role: an identical twin of a person with schizophrenia has about a 50% chance of developing it, versus about 17% for a fraternal twin and 1% in the general population. Many genes each add a small risk. **Environmental** factors include prenatal problems (maternal infection such as influenza, malnutrition, birth complications), being born in late winter/spring, urban upbringing, an older father, and heavy cannabis use in adolescence.',
          '## Brain and biochemistry',
          'Many patients have **enlarged ventricles**, less gray matter, smaller hippocampi and reduced activity in the prefrontal cortex during tasks (**hypofrontality**); unusual eye movements (problems with smooth pursuit and saccades) are common. The **dopamine hypothesis** proposes overactive dopamine in the mesolimbic pathway (positive symptoms) — supported by the fact that antipsychotic drugs block D2 receptors, and that amphetamine can cause psychosis. The **glutamate hypothesis** proposes underactive NMDA receptors, since PCP and ketamine (NMDA blockers) produce both positive and negative symptoms.',
          '## Treatment',
          '**Typical (first-generation) antipsychotics** like chlorpromazine and haloperidol block D2 receptors and reduce positive symptoms but can cause movement side effects, including **tardive dyskinesia**. **Atypical (second-generation)** antipsychotics like clozapine also act on serotonin receptors, with fewer movement effects but risk of weight gain. Psychosocial support, family therapy and early intervention improve outcomes.',
        ],
        he: [
          '**סכיזופרניה** פוגעת בכ-0.5–1% מהאנשים בכל העמים ומאובחנת לרוב לראשונה בגילים 18–25. **תסמינים חיוביים** הם תוספות לחוויה הרגילה: **הזיות** (לרוב שמיעת קולות), **מחשבות שווא** (אמונות שגויות ונחרצות) וחשיבה ודיבור לא מאורגנים. **תסמינים שליליים** הם חסרים: רגש שטוח, מעט דיבור, חוסר מוטיבציה והסתגרות חברתית. **תסמינים קוגניטיביים** כוללים בעיות בקשב ובזיכרון עבודה.',
          '## גורמים',
          'ל**גנים** תפקיד גדול: לתאום זהה של אדם עם סכיזופרניה יש סיכוי של כ-50% לפתח אותה, לעומת כ-17% לתאום לא זהה ו-1% באוכלוסייה הכללית. גנים רבים מוסיפים כל אחד סיכון קטן. גורמים **סביבתיים** כוללים בעיות לפני הלידה (זיהום של האם כמו שפעת, תת-תזונה, סיבוכי לידה), לידה בסוף החורף/באביב, גדילה בעיר, אב מבוגר ושימוש כבד בקנאביס בגיל ההתבגרות.',
          '## מוח וביוכימיה',
          'אצל מטופלים רבים יש **חדרי מוח מוגדלים**, פחות חומר אפור, היפוקמפוסים קטנים יותר ופעילות מופחתת בקליפה הקדם-מצחית בזמן משימות (**היפופרונטליות**); תנועות עיניים חריגות (בעיות במעקב חלק ובסקדות) שכיחות. **השערת הדופמין** מציעה פעילות יתר של דופמין במסלול המזולימבי (תסמינים חיוביים) — ונתמכת בכך שתרופות אנטי-פסיכוטיות חוסמות קולטני D2, ושאמפטמין עלול לגרום לפסיכוזה. **השערת הגלוטמט** מציעה פעילות חסר של קולטני NMDA, שכן PCP וקטמין (חוסמי NMDA) יוצרים תסמינים חיוביים וגם שליליים.',
          '## טיפול',
          '**תרופות אנטי-פסיכוטיות טיפוסיות (דור ראשון)** כמו כלורפרומזין והלופרידול חוסמות קולטני D2 ומפחיתות תסמינים חיוביים, אך עלולות לגרום לתופעות לוואי תנועתיות, כולל **דיסקינזיה מאוחרת**. תרופות **לא טיפוסיות (דור שני)** כמו קלוזפין פועלות גם על קולטני סרוטונין, עם פחות תופעות תנועתיות אך סיכון לעלייה במשקל. תמיכה פסיכו-סוציאלית, טיפול משפחתי והתערבות מוקדמת משפרים את התוצאות.',
        ],
      },
      points: {
        en: ['Positive (hallucinations, delusions), negative (flat affect, withdrawal) and cognitive symptoms.', 'Identical twin concordance ~50% vs 1% in the population.', 'Enlarged ventricles and hypofrontality are common.', 'Dopamine (D2) and glutamate (NMDA) hypotheses; antipsychotics block D2.'],
        he: ['תסמינים חיוביים (הזיות, מחשבות שווא), שליליים (רגש שטוח, הסתגרות) וקוגניטיביים.', 'התאמה בתאומים זהים כ-50% לעומת 1% באוכלוסייה.', 'חדרי מוח מוגדלים והיפופרונטליות שכיחים.', 'השערות הדופמין (D2) והגלוטמט (NMDA); תרופות אנטי-פסיכוטיות חוסמות D2.'],
      },
      terms: [
        ['Positive symptoms', 'Abnormal additions to experience: hallucinations, delusions, disorganized thought.', 'תסמינים חיוביים', 'תוספות לא תקינות לחוויה: הזיות, מחשבות שווא, חשיבה לא מאורגנת.'],
        ['Negative symptoms', 'Losses of normal function: flat affect, poor speech, lack of motivation.', 'תסמינים שליליים', 'אובדן תפקוד תקין: רגש שטוח, דיבור דל, חוסר מוטיבציה.'],
        ['Dopamine hypothesis', 'Schizophrenia involves overactive dopamine transmission.', 'השערת הדופמין', 'סכיזופרניה כרוכה בפעילות יתר של העברת דופמין.'],
        ['Hypofrontality', 'Reduced activity of the frontal lobes.', 'היפופרונטליות', 'פעילות מופחתת של האונות המצחיות.'],
        ['Tardive dyskinesia', 'Involuntary movements caused by long-term use of typical antipsychotics.', 'דיסקינזיה מאוחרת', 'תנועות לא רצוניות הנגרמות משימוש ממושך בתרופות אנטי-פסיכוטיות טיפוסיות.'],
      ],
      quiz: [
        ['Hearing voices that others do not hear is a…', 'שמיעת קולות שאחרים אינם שומעים היא…', ['negative symptom', 'positive symptom', 'cognitive symptom', 'side effect'], ['תסמין שלילי', 'תסמין חיובי', 'תסמין קוגניטיבי', 'תופעת לוואי'], 1, 'Hallucinations are positive symptoms — additions to normal experience.', 'הזיות הן תסמינים חיוביים — תוספות לחוויה הרגילה.'],
        ['Typical antipsychotic drugs mainly…', 'תרופות אנטי-פסיכוטיות טיפוסיות בעיקר…', ['block dopamine D2 receptors', 'increase serotonin reuptake', 'activate NMDA receptors', 'release dopamine'], ['חוסמות קולטני דופמין D2', 'מגבירות ספיגה חוזרת של סרוטונין', 'מפעילות קולטני NMDA', 'משחררות דופמין'], 0, 'Their potency correlates with D2 blockade.', 'העוצמה שלהן מתואמת עם חסימת D2.'],
      ],
    },
    {
      title: { en: 'Mood disorders: depression and bipolar disorder', he: 'הפרעות מצב רוח: דיכאון והפרעה דו-קוטבית' },
      diagram: null,
      regions: ['frontal', 'cingulate', 'amygdala', 'hippocampus', 'hypothalamus'],
      body: {
        en: [
          '## Major depressive disorder (MDD)',
          '**Major depression** involves at least two weeks of depressed mood or loss of interest and pleasure (**anhedonia**), with changes in sleep, appetite and energy, feelings of worthlessness, poor concentration and sometimes thoughts of suicide. It is diagnosed nearly twice as often in women. Heredity matters, but less than in bipolar disorder: if one identical twin has major depression, the other has it in only about 33% of cases. Stressful life events, especially in combination with genetic risk, often trigger episodes.',
          'Biologically, depression is linked to an overactive **HPA stress axis** (high cortisol), a smaller hippocampus, reduced activity in the prefrontal cortex and overactivity in the amygdala and subgenual cingulate, disturbed sleep (early REM), and changes in circadian rhythms. The **monoamine hypothesis** proposes low serotonin and norepinephrine activity. Antidepressants — **MAO inhibitors**, **tricyclics**, and **SSRIs** such as Prozac — increase monoamines quickly, yet improvement takes weeks, suggesting slower changes such as increased **BDNF** and neurogenesis are important. **Cognitive-behavioural therapy** works as well as medication for many people. For severe, treatment-resistant depression, **electroconvulsive therapy (ECT)**, **rTMS** and deep brain stimulation can help; ketamine acts rapidly.',
          '## Bipolar disorder',
          '**Bipolar disorder** involves episodes of **mania** — elevated or irritable mood, little need for sleep, racing thoughts, grandiosity and risky behaviour — usually alternating with depression. It is strongly heritable: if one identical twin has bipolar disorder, the other is affected in about 71–77% of cases. **Lithium** is a classic mood stabilizer, alongside anticonvulsants and some antipsychotics.',
        ],
        he: [
          '## הפרעת דיכאון מז\'ורי (MDD)',
          '**דיכאון מז\'ורי** כולל לפחות שבועיים של מצב רוח ירוד או אובדן עניין והנאה (**אנהדוניה**), עם שינויים בשינה, בתיאבון ובאנרגיה, תחושות חוסר ערך, ריכוז ירוד ולעיתים מחשבות אובדניות. הוא מאובחן בנשים כמעט פי שניים. לתורשה יש תפקיד, אך קטן יותר מאשר בהפרעה דו-קוטבית: אם לתאום זהה אחד יש דיכאון מז\'ורי, לתאום השני יש אותו רק בכ-33% מהמקרים. אירועי חיים מלחיצים, במיוחד בשילוב עם סיכון גנטי, מעוררים לעיתים קרובות אפיזודות.',
          'מבחינה ביולוגית, דיכאון קשור ל**ציר לחץ HPA** פעיל מדי (קורטיזול גבוה), להיפוקמפוס קטן יותר, לפעילות מופחתת בקליפה הקדם-מצחית ולפעילות יתר באמיגדלה ובחגורה התת-ברכית, לשינה מופרעת (REM מוקדם) ולשינויים בקצבים הצירקדיים. **השערת המונואמינים** מציעה פעילות נמוכה של סרוטונין ונוראפינפרין. תרופות נוגדות דיכאון — **מעכבי MAO**, **טריציקליות** ו-**SSRI** כמו פרוזק — מעלות מונואמינים במהירות, אך השיפור לוקח שבועות, מה שמרמז ששינויים איטיים יותר כמו עלייה ב-**BDNF** ובנוירוגנזה חשובים. **טיפול קוגניטיבי-התנהגותי** יעיל כמו תרופות עבור אנשים רבים. בדיכאון חמור ועמיד לטיפול, **טיפול בנעזי חשמל (ECT)**, **rTMS** וגירוי מוחי עמוק יכולים לעזור; קטמין פועל במהירות.',
          '## הפרעה דו-קוטבית',
          '**הפרעה דו-קוטבית** כוללת אפיזודות של **מאניה** — מצב רוח מרומם או עצבני, צורך מועט בשינה, מחשבות דוהרות, גרנדיוזיות והתנהגות מסוכנת — בדרך כלל לסירוגין עם דיכאון. היא תורשתית מאוד: אם לתאום זהה אחד יש הפרעה דו-קוטבית, התאום השני חולה בכ-71–77% מהמקרים. **ליתיום** הוא מייצב מצב רוח קלאסי, לצד נוגדי פרכוסים וחלק מהתרופות האנטי-פסיכוטיות.',
        ],
      },
      points: {
        en: ['Depression: low mood/anhedonia ≥ 2 weeks; twice as common in women.', 'Linked to high cortisol, smaller hippocampus, low prefrontal and high amygdala activity.', 'SSRIs act fast chemically but help after weeks (BDNF, neurogenesis).', 'Bipolar: mania + depression; highly heritable; lithium.'],
        he: ['דיכאון: מצב רוח ירוד/אנהדוניה שבועיים לפחות; שכיח פי שניים בנשים.', 'קשור לקורטיזול גבוה, היפוקמפוס קטן, פעילות קדם-מצחית נמוכה ופעילות אמיגדלה גבוהה.', 'SSRI פועלות מהר כימית אך עוזרות אחרי שבועות (BDNF, נוירוגנזה).', 'דו-קוטבית: מאניה + דיכאון; תורשתית מאוד; ליתיום.'],
      },
      terms: [
        ['Anhedonia', 'Loss of the ability to feel pleasure.', 'אנהדוניה', 'אובדן היכולת לחוש הנאה.'],
        ['Monoamine hypothesis', 'Depression results from low serotonin and/or norepinephrine activity.', 'השערת המונואמינים', 'דיכאון נובע מפעילות נמוכה של סרוטונין ו/או נוראפינפרין.'],
        ['Electroconvulsive therapy (ECT)', 'Treatment for severe depression that induces a controlled seizure under anaesthesia.', 'טיפול בנעזי חשמל (ECT)', 'טיפול בדיכאון חמור שמשרה פרכוס מבוקר בהרדמה.'],
        ['Mania', 'A state of elevated mood, high energy, little sleep and impulsive behaviour.', 'מאניה', 'מצב של מצב רוח מרומם, אנרגיה גבוהה, שינה מועטה והתנהגות אימפולסיבית.'],
        ['Lithium', 'Classic mood-stabilizing drug for bipolar disorder.', 'ליתיום', 'תרופה קלאסית לייצוב מצב הרוח בהפרעה דו-קוטבית.'],
      ],
      quiz: [
        ['Why is the delay in SSRI effectiveness important for theories of depression?', 'מדוע העיכוב ביעילות SSRI חשוב לתיאוריות של דיכאון?', ['It shows serotonin is irrelevant', 'It suggests slower brain changes (e.g. BDNF, neurogenesis) are needed', 'It proves depression is genetic', 'It shows SSRIs are placebos'], ['הוא מראה שסרוטונין אינו רלוונטי', 'הוא מרמז שנדרשים שינויים איטיים יותר במוח (למשל BDNF, נוירוגנזה)', 'הוא מוכיח שדיכאון גנטי', 'הוא מראה ש-SSRI הן פלצבו'], 1, 'Chemistry changes in hours, but mood improves over weeks.', 'הכימיה משתנה תוך שעות, אך מצב הרוח משתפר במשך שבועות.'],
        ['Which drug is a classic treatment for bipolar disorder?', 'איזו תרופה היא טיפול קלאסי בהפרעה דו-קוטבית?', ['Lithium', 'L-DOPA', 'Haloperidol only', 'Caffeine'], ['ליתיום', 'L-DOPA', 'הלופרידול בלבד', 'קפאין'], 0, 'Lithium stabilizes mood and reduces manic episodes.', 'ליתיום מייצב את מצב הרוח ומפחית אפיזודות מאניות.'],
      ],
    },
    {
      title: { en: 'Anxiety disorders: OCD, panic and PTSD', he: 'הפרעות חרדה: OCD, פאניקה ו-PTSD' },
      diagram: null,
      regions: ['amygdala', 'hippocampus', 'frontal', 'cingulate', 'basalGanglia'],
      body: {
        en: [
          'Anxiety disorders are the most common psychological disorders. They often involve an overactive **amygdala** and weaker control from the **prefrontal cortex**, and many respond to **SSRIs**, **benzodiazepines** (which enhance GABA — effective but potentially addictive) and **cognitive-behavioural therapy** with exposure.',
          '## Obsessive-compulsive disorder (OCD)',
          '**OCD** involves intrusive, distressing thoughts (**obsessions**, e.g. fear of contamination) and repetitive behaviours performed to reduce the anxiety (**compulsions**, e.g. washing, checking). It is linked to overactivity in a loop connecting the **orbitofrontal cortex**, **anterior cingulate** and **caudate nucleus**. SSRIs and exposure with response prevention help; for severe cases, deep brain stimulation or surgery may be used.',
          '## Panic disorder',
          '**Panic disorder** involves sudden attacks of intense fear with pounding heart, breathlessness and a feeling of dying or losing control, plus worry about future attacks; it often leads to avoidance (agoraphobia). It may involve sensitivity in brainstem alarm systems (such as the locus coeruleus) and to signals of suffocation (CO₂).',
          '## Posttraumatic stress disorder (PTSD)',
          '**PTSD** can follow a traumatic event: intrusive memories and nightmares, avoidance, negative mood and constant alertness (hypervigilance, exaggerated startle). It is associated with an overactive amygdala, reduced prefrontal control and a **smaller hippocampus** — which may be a pre-existing risk factor, as twin studies suggest. Interestingly, cortisol levels are often lower than normal. Trauma-focused therapy is the main treatment.',
          '**Self-injury** (such as cutting) is often used to regulate overwhelming emotions and may involve the endogenous opioid system; it needs compassionate, professional help.',
        ],
        he: [
          'הפרעות חרדה הן ההפרעות הנפשיות השכיחות ביותר. הן כרוכות לעיתים קרובות ב**אמיגדלה** פעילה מדי ובשליטה חלשה יותר של **הקליפה הקדם-מצחית**, ורבות מהן מגיבות ל-**SSRI**, ל**בנזודיאזפינים** (שמגבירים GABA — יעילים אך עלולים להיות ממכרים) ול**טיפול קוגניטיבי-התנהגותי** עם חשיפה.',
          '## הפרעה טורדנית-כפייתית (OCD)',
          '**OCD** כוללת מחשבות חודרניות ומטרידות (**אובססיות**, למשל פחד מזיהום) והתנהגויות חוזרות שמבוצעות כדי להפחית את החרדה (**כפייתיות/קומפולסיות**, למשל רחצה, בדיקה). היא קשורה לפעילות יתר בלולאה המחברת את **הקליפה האורביטו-פרונטלית**, **קליפת החגורה הקדמית** ו**הגרעין הזנבי**. SSRI וחשיפה עם מניעת תגובה עוזרים; במקרים קשים עשויים להשתמש בגירוי מוחי עמוק או בניתוח.',
          '## הפרעת פאניקה',
          '**הפרעת פאניקה** כוללת התקפים פתאומיים של פחד עז עם דפיקות לב, קוצר נשימה ותחושת מוות או אובדן שליטה, יחד עם דאגה מהתקפים עתידיים; היא מובילה לעיתים קרובות להימנעות (אגורפוביה). ייתכן שהיא כרוכה ברגישות של מערכות אזעקה בגזע המוח (כמו הלוקוס צרולאוס) ולאותות של חנק (CO₂).',
          '## הפרעת דחק פוסט-טראומטית (PTSD)',
          '**PTSD** עלולה להופיע לאחר אירוע טראומטי: זיכרונות חודרניים וסיוטים, הימנעות, מצב רוח שלילי ודריכות מתמדת (ערנות יתר, תגובת בהלה מוגזמת). היא קשורה לאמיגדלה פעילה מדי, לשליטה קדם-מצחית מופחתת ול**היפוקמפוס קטן יותר** — שעשוי להיות גורם סיכון קיים מראש, כפי שמרמזים מחקרי תאומים. מעניין שרמות הקורטיזול נמוכות לעיתים קרובות מהרגיל. טיפול ממוקד טראומה הוא הטיפול העיקרי.',
          '**פגיעה עצמית** (כמו חתכים) משמשת לעיתים קרובות לוויסות רגשות מציפים ועשויה לערב את מערכת האופיואידים הפנימית; היא דורשת עזרה מקצועית ומלאת חמלה.',
        ],
      },
      points: {
        en: ['Anxiety disorders: overactive amygdala, weaker prefrontal control.', 'OCD: orbitofrontal–cingulate–caudate loop overactivity.', 'Panic disorder: sudden intense fear attacks; may lead to agoraphobia.', 'PTSD: smaller hippocampus, overactive amygdala, often low cortisol.'],
        he: ['הפרעות חרדה: אמיגדלה פעילה מדי, שליטה קדם-מצחית חלשה יותר.', 'OCD: פעילות יתר בלולאה אורביטו-פרונטלית–חגורה–גרעין זנבי.', 'הפרעת פאניקה: התקפי פחד עז פתאומיים; עלולה להוביל לאגורפוביה.', 'PTSD: היפוקמפוס קטן יותר, אמיגדלה פעילה מדי, לעיתים קורטיזול נמוך.'],
      },
      terms: [
        ['Obsessions', 'Intrusive, unwanted, distressing thoughts.', 'אובססיות', 'מחשבות חודרניות, לא רצויות ומטרידות.'],
        ['Compulsions', 'Repetitive behaviours performed to reduce anxiety.', 'קומפולסיות (כפייתיות)', 'התנהגויות חוזרות שמבוצעות כדי להפחית חרדה.'],
        ['Panic disorder', 'Recurrent unexpected panic attacks and fear of further attacks.', 'הפרעת פאניקה', 'התקפי פאניקה חוזרים ובלתי צפויים ופחד מהתקפים נוספים.'],
        ['PTSD', 'Posttraumatic stress disorder: intrusive memories, avoidance and hyperarousal after trauma.', 'PTSD', 'הפרעת דחק פוסט-טראומטית: זיכרונות חודרניים, הימנעות ועוררות יתר לאחר טראומה.'],
        ['Benzodiazepines', 'Anti-anxiety drugs that enhance GABA.', 'בנזודיאזפינים', 'תרופות נגד חרדה שמגבירות GABA.'],
      ],
      quiz: [
        ['Which brain loop is overactive in OCD?', 'איזו לולאה מוחית פעילה מדי ב-OCD?', ['Orbitofrontal cortex – cingulate – caudate', 'Cerebellum – pons', 'Occipital – parietal', 'Olfactory bulb – thalamus'], ['קליפה אורביטו-פרונטלית – חגורה – גרעין זנבי', 'מוח קטן – גשר', 'עורפית – קודקודית', 'פקעת הריח – תלמוס'], 0, 'This frontal–striatal loop is linked to repetitive thoughts and actions.', 'לולאה מצחית-סטריאטלית זו קשורה למחשבות ולפעולות חוזרות.'],
      ],
    },
    {
      title: { en: 'Autism and ADHD', he: 'אוטיזם ו-ADHD' },
      diagram: null,
      regions: ['frontal', 'basalGanglia', 'amygdala', 'cerebellum', 'temporal'],
      body: {
        en: [
          '## Autism spectrum disorder (ASD)',
          '**Autism** involves difficulties with social communication and interaction, together with restricted interests and repetitive behaviours, beginning in early childhood. It is a **spectrum** — from people who need substantial support to highly verbal, independent people. It is about four times more common in boys.',
          'Autism is strongly genetic: identical twins agree far more often than fraternal twins, and many genes and rare mutations are involved. Prenatal factors (such as an older parent or certain medications in pregnancy) add some risk; carefully conducted studies have found **no link with vaccines**. Brain findings include early brain overgrowth in some children, differences in connectivity (more local, less long-distance), and differences in social brain areas (amygdala, fusiform face area) and the cerebellum. The mirror-neuron and "theory of mind" ideas try to explain social difficulties. Early, intensive behavioural intervention is the most effective approach; medications can help with specific symptoms such as irritability.',
          '## Attention-deficit/hyperactivity disorder (ADHD)',
          '**ADHD** involves persistent **inattention** and/or **hyperactivity–impulsivity** beyond what is typical for age, interfering with school, work or relationships. It is highly heritable (estimated at about 80%), with genes related to **dopamine** (such as the dopamine transporter and D4 receptor). Brain studies show delayed maturation of the cortex (especially the prefrontal cortex), and differences in frontal–striatal circuits. Treatment includes **stimulants** such as methylphenidate (Ritalin) and amphetamines, which increase dopamine and norepinephrine in the prefrontal cortex and improve attention, along with behavioural support.',
        ],
        he: [
          '## הפרעת הספקטרום האוטיסטי (ASD)',
          '**אוטיזם** כולל קשיים בתקשורת ובאינטראקציה חברתית, יחד עם תחומי עניין מצומצמים והתנהגויות חוזרות, החל מהילדות המוקדמת. זהו **ספקטרום** — מאנשים שזקוקים לתמיכה משמעותית ועד אנשים מילוליים מאוד ועצמאיים. הוא שכיח בערך פי ארבעה בבנים.',
          'לאוטיזם בסיס גנטי חזק: תאומים זהים מתאימים הרבה יותר מתאומים לא זהים, וגנים רבים ומוטציות נדירות מעורבים. גורמים לפני הלידה (כמו הורה מבוגר או תרופות מסוימות בהיריון) מוסיפים סיכון מסוים; מחקרים קפדניים **לא מצאו קשר לחיסונים**. ממצאים במוח כוללים גדילת יתר מוקדמת של המוח אצל חלק מהילדים, הבדלים בקישוריות (יותר מקומית, פחות למרחק רב), והבדלים באזורי המוח החברתי (אמיגדלה, אזור הפנים הפוזיפורמי) ובמוח הקטן. רעיונות נוירוני המראה ו"תיאוריית התודעה" מנסים להסביר את הקשיים החברתיים. התערבות התנהגותית מוקדמת ואינטנסיבית היא הגישה היעילה ביותר; תרופות יכולות לעזור בתסמינים מסוימים כמו עצבנות.',
          '## הפרעת קשב וריכוז עם/בלי היפראקטיביות (ADHD)',
          '**ADHD** כוללת **חוסר קשב** ו/או **היפראקטיביות-אימפולסיביות** מתמשכים מעבר למקובל לגיל, הפוגעים בלימודים, בעבודה או במערכות יחסים. היא תורשתית מאוד (כ-80%), עם גנים הקשורים ל**דופמין** (כמו מוביל הדופמין וקולטן D4). מחקרי מוח מראים הבשלה מאוחרת של הקליפה (במיוחד הקליפה הקדם-מצחית), והבדלים במעגלים מצחיים-סטריאטליים. הטיפול כולל **ממריצים** כמו מתילפנידאט (ריטלין) ואמפטמינים, שמגבירים דופמין ונוראפינפרין בקליפה הקדם-מצחית ומשפרים את הקשב, לצד תמיכה התנהגותית.',
        ],
      },
      points: {
        en: ['Autism: social communication differences + repetitive behaviours; a spectrum.', 'Autism is strongly genetic; no link with vaccines.', 'ADHD: inattention and/or hyperactivity–impulsivity; ~80% heritable.', 'Stimulants increase prefrontal dopamine and norepinephrine, improving attention.'],
        he: ['אוטיזם: הבדלים בתקשורת חברתית + התנהגויות חוזרות; ספקטרום.', 'לאוטיזם בסיס גנטי חזק; אין קשר לחיסונים.', 'ADHD: חוסר קשב ו/או היפראקטיביות-אימפולסיביות; כ-80% תורשתיות.', 'ממריצים מגבירים דופמין ונוראפינפרין בקליפה הקדם-מצחית ומשפרים קשב.'],
      },
      terms: [
        ['Autism spectrum disorder', 'Developmental condition with social communication differences and repetitive behaviours.', 'הפרעת הספקטרום האוטיסטי', 'מצב התפתחותי עם הבדלים בתקשורת חברתית והתנהגויות חוזרות.'],
        ['Theory of mind', 'Understanding that others have thoughts and beliefs different from one\'s own.', 'תיאוריית התודעה', 'ההבנה שלאחרים יש מחשבות ואמונות שונות משלנו.'],
        ['ADHD', 'Attention-deficit/hyperactivity disorder.', 'ADHD', 'הפרעת קשב וריכוז עם/בלי היפראקטיביות.'],
        ['Methylphenidate (Ritalin)', 'A stimulant that blocks dopamine reuptake; used to treat ADHD.', 'מתילפנידאט (ריטלין)', 'ממריץ שחוסם ספיגה חוזרת של דופמין; משמש לטיפול ב-ADHD.'],
      ],
      quiz: [
        ['Large, careful studies of vaccines and autism found…', 'מחקרים גדולים וקפדניים על חיסונים ואוטיזם מצאו…', ['a strong link', 'no link', 'a link only in girls', 'that vaccines cure autism'], ['קשר חזק', 'אין קשר', 'קשר רק בבנות', 'שחיסונים מרפאים אוטיזם'], 1, 'There is no association between vaccines and autism.', 'אין קשר בין חיסונים לאוטיזם.'],
        ['Stimulant medications help ADHD mainly by increasing ____ in the prefrontal cortex.', 'תרופות ממריצות עוזרות ב-ADHD בעיקר על ידי הגברת ____ בקליפה הקדם-מצחית.', ['GABA', 'dopamine and norepinephrine', 'melatonin', 'acetylcholine only'], ['GABA', 'דופמין ונוראפינפרין', 'מלטונין', 'אצטילכולין בלבד'], 1, 'Boosting these catecholamines improves attention and control.', 'הגברת קטכולאמינים אלה משפרת קשב ושליטה.'],
      ],
    },
    {
      title: { en: 'Antisocial personality disorder and epigenetics', he: 'הפרעת אישיות אנטי-חברתית ואפיגנטיקה' },
      diagram: null,
      regions: ['frontal', 'amygdala', 'cingulate'],
      pathways: [],
      body: {
        en: [
          '**Antisocial personality disorder (APD)** is diagnosed in adults who show a long-lasting pattern of ignoring and violating the rights of others — breaking rules and laws, lying, impulsivity and aggression. About 3% of men and 1% of women meet the criteria. APD is not the same as **psychopathy**: APD describes antisocial *behaviour*, while psychopathy describes *personality* — a lack of guilt, empathy and normal emotion, combined with using others. Many prisoners meet APD criteria, but only a minority are psychopaths, and some psychopaths never break the law.',
          '## Genes and environment',
          'Antisocial behaviour runs in families, but genes and experience interact. In a well-known study, boys with a **low-activity version of the MAOA gene** who were severely mistreated in childhood were very likely to become antisocial, while boys with the high-activity version usually were not — even after similar mistreatment. Twin studies suggest that the core emotional traits of psychopathy (fearlessness, callousness) are substantially heritable.',
          '## The brain',
          'In the aggression model from chapter 14, the limbic system supplies aggressive drive and the **orbitofrontal cortex** and **anterior cingulate** hold it back. People with psychopathy show weaker limbic (especially **amygdala**) responses to emotional words and have trouble recognising fear in others. Early damage to the orbitofrontal cortex can lead to lying, stealing and aggression in adulthood, and some murderers show reduced frontal activity. Treatment is difficult; programmes work better for reactive (impulsive) aggression than for cold, planned aggression.',
          '## Epigenetics and psychopathology',
          '**Epigenetics** shows that nature works *through* nurture: experience can add chemical marks that switch genes on or off without changing the DNA. Rat pups that receive little maternal care develop different stress-response gene activity than well-cared-for pups, and early abuse and neglect in humans may leave similar marks — one way life experience can raise the risk of psychological disorders.',
        ],
        he: [
          '**הפרעת אישיות אנטי-חברתית (APD)** מאובחנת במבוגרים שמראים דפוס מתמשך של התעלמות מזכויות הזולת והפרתן — הפרת כללים וחוקים, שקרים, אימפולסיביות ותוקפנות. כ-3% מהגברים וכ-1% מהנשים עומדים בקריטריונים. APD אינה זהה ל**פסיכופתיה**: APD מתארת *התנהגות* אנטי-חברתית, ואילו פסיכופתיה מתארת *אישיות* — היעדר אשמה, אמפתיה ורגש תקין, יחד עם ניצול אחרים. אסירים רבים עומדים בקריטריונים ל-APD, אך רק מיעוטם פסיכופתים, ויש פסיכופתים שלעולם אינם עוברים על החוק.',
          '## גנים וסביבה',
          'התנהגות אנטי-חברתית עוברת במשפחות, אך גנים וחוויות פועלים יחד. במחקר ידוע, בנים עם **גרסה בעלת פעילות נמוכה של הגן MAOA** שסבלו מהתעללות קשה בילדות נטו מאוד להפוך לאנטי-חברתיים, ואילו בנים עם הגרסה בעלת הפעילות הגבוהה בדרך כלל לא — גם אחרי התעללות דומה. מחקרי תאומים מרמזים שתכונות הליבה הרגשיות של פסיכופתיה (חוסר פחד, קשיחות רגשית) תורשתיות במידה ניכרת.',
          '## המוח',
          'במודל התוקפנות מפרק 14, המערכת הלימבית מספקת את הדחף התוקפני, ו**הקליפה האורביטו-פרונטלית** ו**החגורה הקדמית** מרסנות אותו. אצל אנשים עם פסיכופתיה התגובות הלימביות (במיוחד של **האמיגדלה**) למילים רגשיות חלשות יותר, והם מתקשים לזהות פחד אצל אחרים. פגיעה מוקדמת בקליפה האורביטו-פרונטלית עלולה להוביל בבגרות לשקרים, גניבות ותוקפנות, ואצל חלק מהרוצחים נמצאה פעילות מצחית מופחתת. הטיפול קשה; תוכניות מצליחות יותר בתוקפנות תגובתית (אימפולסיבית) מאשר בתוקפנות קרה ומתוכננת.',
          '## אפיגנטיקה ופסיכופתולוגיה',
          '**אפיגנטיקה** מראה שהטבע פועל *דרך* הסביבה: חוויות יכולות להוסיף סימנים כימיים שמפעילים או משביתים גנים בלי לשנות את ה-DNA. גורי חולדות שקיבלו מעט טיפול אימהי מפתחים פעילות גנים שונה של מערכת הלחץ לעומת גורים מטופלים היטב, וייתכן שהתעללות והזנחה מוקדמות בבני אדם משאירות סימנים דומים — דרך אחת שבה חוויות חיים מעלות את הסיכון להפרעות נפשיות.',
        ],
      },
      points: {
        en: ['APD = pervasive disregard for others\' rights; ~3% of men, ~1% of women.', 'APD (behaviour) is not the same as psychopathy (personality: no guilt or empathy).', 'Low-activity MAOA + childhood maltreatment → much higher risk.', 'Weak amygdala responses and orbitofrontal problems are linked to antisocial behaviour.', 'Epigenetics: early care and stress can change how genes are expressed.'],
        he: ['APD = התעלמות מתמשכת מזכויות הזולת; כ-3% מהגברים, כ-1% מהנשים.', 'APD (התנהגות) אינה זהה לפסיכופתיה (אישיות: ללא אשמה או אמפתיה).', 'MAOA בפעילות נמוכה + התעללות בילדות ← סיכון גבוה בהרבה.', 'תגובות אמיגדלה חלשות ובעיות אורביטו-פרונטליות קשורות להתנהגות אנטי-חברתית.', 'אפיגנטיקה: טיפול ולחץ מוקדמים יכולים לשנות את ביטוי הגנים.'],
      },
      terms: [
        ['Antisocial personality disorder', 'Adult disorder marked by a pervasive disregard for and violation of the rights of others.', 'הפרעת אישיות אנטי-חברתית', 'הפרעה במבוגרים המאופיינת בהתעלמות מתמשכת מזכויות הזולת ובהפרתן.'],
        ['Psychopathy', 'Personality pattern of lacking remorse, empathy and normal emotion, often exploiting others.', 'פסיכופתיה', 'דפוס אישיות של היעדר חרטה, אמפתיה ורגש תקין, לעיתים קרובות תוך ניצול אחרים.'],
        ['Gene–environment interaction', 'When the effect of a gene depends on experience (e.g. MAOA and maltreatment).', 'אינטראקציה גן-סביבה', 'כשהשפעת גן תלויה בחוויה (למשל MAOA והתעללות).'],
      ],
      quiz: [
        ['Which finding illustrates a gene–environment interaction in antisocial behaviour?', 'איזה ממצא ממחיש אינטראקציה בין גן לסביבה בהתנהגות אנטי-חברתית?', ['Low-activity MAOA predicts antisocial behaviour mainly in boys who were maltreated', 'All prisoners are psychopaths', 'APD is equally common in men and women', 'Orbitofrontal damage improves behaviour'], ['MAOA בפעילות נמוכה מנבא התנהגות אנטי-חברתית בעיקר בבנים שסבלו מהתעללות', 'כל האסירים הם פסיכופתים', 'APD שכיחה באותה מידה בגברים ובנשים', 'פגיעה אורביטו-פרונטלית משפרת התנהגות'], 0, 'The gene mattered mostly when combined with severe childhood maltreatment.', 'הגן השפיע בעיקר בשילוב עם התעללות קשה בילדות.'],
        ['APD and psychopathy are exactly the same thing.', 'APD ופסיכופתיה הן בדיוק אותו דבר.', ['True', 'False'], ['נכון', 'לא נכון'], 1, 'APD is defined by behaviour; psychopathy by personality traits such as lack of empathy.', 'APD מוגדרת לפי התנהגות; פסיכופתיה לפי תכונות אישיות כמו היעדר אמפתיה.'],
      ],
    },
  ],
};
