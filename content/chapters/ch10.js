// Format explained at the top of ch01.js
export default {
  n: 10,
  icon: '⚥',
  color: '#e2427f',
  title: { en: 'Sexual Behavior', he: 'התנהגות מינית' },
  intro: {
    en: 'How sex develops before birth and at puberty, how hormones shape behaviour and the brain, and the biology of orientation, attraction and love.',
    he: 'איך המין מתפתח לפני הלידה ובגיל ההתבגרות, איך הורמונים מעצבים התנהגות ומוח, והביולוגיה של נטייה מינית, משיכה ואהבה.',
  },
  lessons: [
    {
      title: { en: 'Sexual development', he: 'התפתחות מינית' },
      diagram: 'sexDevelopment',
      regions: ['hypothalamus', 'pituitary'],
      body: {
        en: [
          'Typically, females have two X chromosomes (XX) and males have an X and a Y (XY). **Sex chromosome variations** include **Turner syndrome** (a single X, "XO": female appearance, short stature, no puberty without treatment) and **Klinefelter syndrome** (XXY: male, often with small testes and reduced fertility).',
          '## Three prenatal stages',
          '1) **Gonads**: early embryos have identical, undifferentiated gonads. A gene on the Y chromosome, **SRY**, makes them become **testes**; without it, they become **ovaries**. 2) **Internal organs**: embryos have both the Wolffian (male) and Müllerian (female) duct systems. Testes produce **testosterone**, which builds the male internal organs, and **anti-Müllerian hormone**, which removes the female ducts. Without these hormones, female organs develop. 3) **External genitals**: a form of testosterone (DHT) produces male genitals; without it, female genitals form.',
          'When this process varies, people may be **intersex**. In **androgen insensitivity syndrome**, an XY person lacks working androgen receptors and develops a female body. In **congenital adrenal hyperplasia (CAH)**, an XX fetus is exposed to high androgens and may have masculinized genitals.',
          '## Puberty',
          'At **puberty**, the hypothalamus increases release of **GnRH**, which makes the pituitary release **LH and FSH**, which in turn drive the gonads to make **estrogen** or **testosterone**. These cause secondary sex characteristics: breast development and menstruation, or a deeper voice and facial hair. Puberty has been starting earlier over the last century, possibly due to better nutrition and higher body fat.',
        ],
        he: [
          'בדרך כלל לנקבות יש שני כרומוזומי X ‏(XX) ולזכרים X ו-Y ‏(XY). **וריאציות בכרומוזומי המין** כוללות את **תסמונת טרנר** (X יחיד, "XO": מראה נשי, קומה נמוכה, ללא התבגרות בלי טיפול) ואת **תסמונת קליינפלטר** (XXY: זכר, לעיתים קרובות עם אשכים קטנים ופוריות מופחתת).',
          '## שלושה שלבים לפני הלידה',
          '1) **בלוטות המין**: לעוברים מוקדמים יש בלוטות מין זהות ובלתי ממוינות. גן על כרומוזום Y, **SRY**, הופך אותן ל**אשכים**; בלעדיו הן הופכות ל**שחלות**. 2) **איברים פנימיים**: לעוברים יש גם את מערכת הצינורות של וולף (זכרית) וגם של מילר (נקבית). האשכים מייצרים **טסטוסטרון**, שבונה את האיברים הפנימיים הזכריים, ו**הורמון אנטי-מילריאני**, שמסלק את הצינורות הנקביים. ללא הורמונים אלה מתפתחים איברים נקביים. 3) **איברי מין חיצוניים**: צורה של טסטוסטרון (DHT) יוצרת איברי מין זכריים; בלעדיה נוצרים איברי מין נקביים.',
          'כשהתהליך הזה משתנה, אנשים עשויים להיות **אינטרסקס**. ב**תסמונת חוסר רגישות לאנדרוגנים**, לאדם XY אין קולטני אנדרוגנים תקינים והוא מפתח גוף נקבי. ב**היפרפלזיה מולדת של יותרת הכליה (CAH)**, עובר XX נחשף לרמות גבוהות של אנדרוגנים ועשוי להיוולד עם איברי מין בעלי מאפיינים זכריים.',
          '## התבגרות',
          'ב**גיל ההתבגרות** ההיפותלמוס מגביר הפרשת **GnRH**, שגורם לבלוטת יותרת המוח להפריש **LH ו-FSH**, שבתורם מניעים את בלוטות המין לייצר **אסטרוגן** או **טסטוסטרון**. אלה גורמים למאפייני מין משניים: התפתחות שדיים ווסת, או קול עמוק ושיער פנים. גיל ההתבגרות מתחיל מוקדם יותר במאה האחרונה, אולי בגלל תזונה טובה יותר ושיעור שומן גבוה יותר.',
        ],
      },
      points: {
        en: ['SRY on the Y chromosome turns gonads into testes.', 'Testosterone + anti-Müllerian hormone → male internal organs; default is female.', 'Intersex conditions: androgen insensitivity, CAH, Turner, Klinefelter.', 'Puberty: GnRH → LH/FSH → sex hormones.'],
        he: ['SRY על כרומוזום Y הופך את בלוטות המין לאשכים.', 'טסטוסטרון + הורמון אנטי-מילריאני ← איברים פנימיים זכריים; ברירת המחדל נקבית.', 'מצבי אינטרסקס: חוסר רגישות לאנדרוגנים, CAH, טרנר, קליינפלטר.', 'התבגרות: GnRH ← LH/FSH ← הורמוני מין.'],
      },
      terms: [
        ['SRY gene', 'Gene on the Y chromosome that causes gonads to become testes.', 'הגן SRY', 'גן על כרומוזום Y שגורם לבלוטות המין להפוך לאשכים.'],
        ['Androgen insensitivity syndrome', 'XY condition with non-working androgen receptors; female body develops.', 'תסמונת חוסר רגישות לאנדרוגנים', 'מצב XY עם קולטני אנדרוגנים לא תקינים; מתפתח גוף נקבי.'],
        ['Turner syndrome', 'Condition with a single X chromosome (XO).', 'תסמונת טרנר', 'מצב עם כרומוזום X יחיד (XO).'],
        ['GnRH', 'Gonadotropin-releasing hormone from the hypothalamus that starts puberty.', 'GnRH', 'הורמון משחרר גונדוטרופינים מההיפותלמוס שמתחיל את ההתבגרות.'],
      ],
      quiz: [
        ['What happens to an embryo\'s gonads if there is NO SRY gene?', 'מה קורה לבלוטות המין של עובר אם אין גן SRY?', ['They become testes', 'They become ovaries', 'They disappear', 'They become both'], ['הן הופכות לאשכים', 'הן הופכות לשחלות', 'הן נעלמות', 'הן הופכות לשניהם'], 1, 'Without SRY the default path produces ovaries.', 'ללא SRY, מסלול ברירת המחדל מייצר שחלות.'],
      ],
    },
    {
      title: { en: 'Hormones and sexual behaviour', he: 'הורמונים והתנהגות מינית' },
      diagram: 'menstrual',
      regions: ['hypothalamus', 'pituitary'],
      body: {
        en: [
          'The hypothalamus and pituitary control the gonads through a feedback loop — the **HPG axis**. In females this creates the roughly 28-day **menstrual cycle**: FSH helps a follicle mature in the ovary, which releases estrogen; a surge of LH triggers **ovulation**; the remaining follicle (corpus luteum) releases **progesterone** to prepare the uterus. If no pregnancy occurs, hormone levels fall and menstruation begins. Hormonal contraceptives work by keeping estrogen and progesterone levels steady to prevent ovulation.',
          '## Hormones and behaviour',
          'In many female mammals, sexual behaviour is tightly tied to ovulation (estrus). In women the link is weaker, but sexual interest and some preferences may shift slightly around ovulation. **Testosterone** contributes to sexual desire in both sexes. In men, removing the testes usually reduces — but does not always eliminate — sexual behaviour. Organizational effects of hormones before birth (shaping the brain) differ from activational effects in adulthood (switching behaviours on).',
          'Claims about sex differences in thinking are controversial: on average, males do slightly better on some spatial tasks (like mental rotation) and females on some verbal and perceptual-speed tasks, but the differences are small, overlap greatly and are shaped by experience and culture. **Anabolic steroids** (synthetic testosterone) increase muscle but can cause aggression, infertility, liver damage and heart problems.',
        ],
        he: [
          'ההיפותלמוס ובלוטת יותרת המוח שולטים בבלוטות המין דרך לולאת משוב — **ציר HPG**. בנשים הוא יוצר את **המחזור החודשי** בן כ-28 הימים: FSH עוזר לזקיק להבשיל בשחלה, והזקיק משחרר אסטרוגן; פרץ של LH מפעיל **ביוץ**; הזקיק שנותר (הגופיף הצהוב) משחרר **פרוגסטרון** כדי להכין את הרחם. אם אין היריון, רמות ההורמונים יורדות והווסת מתחילה. אמצעי מניעה הורמונליים פועלים על ידי שמירה על רמות יציבות של אסטרוגן ופרוגסטרון כדי למנוע ביוץ.',
          '## הורמונים והתנהגות',
          'אצל נקבות יונקים רבות, התנהגות מינית קשורה בחוזקה לביוץ (ייחום). אצל נשים הקשר חלש יותר, אך העניין המיני וחלק מההעדפות עשויים להשתנות מעט סביב הביוץ. **טסטוסטרון** תורם לחשק המיני בשני המינים. אצל גברים, הסרת האשכים מפחיתה בדרך כלל — אך לא תמיד מבטלת — התנהגות מינית. השפעות ארגוניות של הורמונים לפני הלידה (עיצוב המוח) שונות מהשפעות מפעילות בבגרות (הפעלת התנהגויות).',
          'טענות על הבדלים בין המינים בחשיבה שנויות במחלוקת: בממוצע, לגברים יתרון קטן בחלק מהמשימות המרחביות (כמו סיבוב מנטלי) ולנשים בחלק מהמשימות המילוליות ומשימות מהירות תפיסתית, אך ההבדלים קטנים, החפיפה גדולה, והם מעוצבים על ידי חוויה ותרבות. **סטרואידים אנבוליים** (טסטוסטרון סינתטי) מגדילים שריר אך עלולים לגרום לתוקפנות, אי-פוריות, נזק לכבד ובעיות לב.',
        ],
      },
      points: {
        en: ['HPG axis: hypothalamus → pituitary → gonads, with feedback.', 'LH surge triggers ovulation; progesterone prepares the uterus.', 'Testosterone supports desire in both sexes.', 'Organizational (prenatal) vs activational (adult) hormone effects.'],
        he: ['ציר HPG: היפותלמוס ← יותרת המוח ← בלוטות המין, עם משוב.', 'פרץ LH מפעיל ביוץ; פרוגסטרון מכין את הרחם.', 'טסטוסטרון תומך בחשק בשני המינים.', 'השפעות ארגוניות (לפני הלידה) מול מפעילות (בבגרות).'],
      },
      terms: [
        ['Ovulation', 'Release of an egg from the ovary, triggered by an LH surge.', 'ביוץ', 'שחרור ביצית מהשחלה, המופעל על ידי פרץ של LH.'],
        ['Progesterone', 'Ovarian hormone that prepares and maintains the uterus for pregnancy.', 'פרוגסטרון', 'הורמון שחלתי שמכין ושומר על הרחם להיריון.'],
        ['Organizational effects', 'Permanent effects of hormones on the developing brain and body.', 'השפעות ארגוניות', 'השפעות קבועות של הורמונים על המוח והגוף המתפתחים.'],
        ['Anabolic steroids', 'Synthetic testosterone-like drugs that build muscle but carry serious risks.', 'סטרואידים אנבוליים', 'תרופות סינתטיות דמויות טסטוסטרון שבונות שריר אך טומנות סיכונים חמורים.'],
      ],
      quiz: [
        ['What directly triggers ovulation?', 'מה מפעיל ישירות את הביוץ?', ['A surge of LH', 'A drop in testosterone', 'Melatonin', 'Oxytocin'], ['פרץ של LH', 'ירידה בטסטוסטרון', 'מלטונין', 'אוקסיטוצין'], 0, 'The mid-cycle LH surge releases the egg.', 'פרץ ה-LH באמצע המחזור משחרר את הביצית.'],
      ],
    },
    {
      title: { en: 'Sex differences in the brain and sexual orientation', he: 'הבדלים בין המינים במוח ונטייה מינית' },
      diagram: null,
      regions: ['hypothalamus', 'corpusCallosum', 'amygdala'],
      body: {
        en: [
          'On average, male brains are somewhat larger, roughly in step with their larger bodies, and some regions differ in size between the sexes. A well-studied example is in the hypothalamus: the **sexually dimorphic nucleus** of the preoptic area in rats is several times larger in males, and in humans **INAH-2 and INAH-3** are about twice as large in men (Allen et al., 1989). Some studies report sex differences in the amygdala and in the pattern of connections between hemispheres, but brains are best seen as a **mosaic** of features rather than two distinct types.',
          '## Sexual orientation',
          'Sexual orientation appears to be influenced by biology rather than chosen. Evidence includes: **twin studies** showing higher agreement in identical than in fraternal twins; the **fraternal birth order effect** — each older biological brother slightly increases the chance that a man is gay, possibly due to a maternal immune response during pregnancy; and **prenatal hormone** effects (e.g. women with CAH are somewhat more likely to be attracted to women). Simon LeVay reported that INAH-3 was smaller in gay men than in straight men, though this finding needs more replication. No single "gay gene" has been found; many genes each contribute a little.',
        ],
        he: [
          'בממוצע, מוחות של גברים גדולים במקצת, בערך בהתאם לגופם הגדול יותר, וחלק מהאזורים שונים בגודלם בין המינים. דוגמה שנחקרה היטב היא בהיפותלמוס: **הגרעין הדימורפי-מינית** באזור הפרה-אופטי בחולדות גדול פי כמה בזכרים, ובבני אדם **INAH-2 ו-INAH-3** גדולים אצל גברים בערך פי שניים (Allen ועמיתיו, 1989). מחקרים מסוימים מדווחים על הבדלים בין המינים באמיגדלה ובדפוס הקשרים בין ההמיספרות, אך מוטב לראות במוח **פסיפס** של מאפיינים ולא שני סוגים נפרדים.',
          '## נטייה מינית',
          'נראה שנטייה מינית מושפעת מהביולוגיה ואינה נבחרת. העדויות כוללות: **מחקרי תאומים** שמראים התאמה גבוהה יותר בתאומים זהים מאשר בתאומים לא זהים; **אפקט סדר הלידה של האחים** — כל אח ביולוגי מבוגר מגביר מעט את הסיכוי שגבר יהיה הומוסקסואל, אולי בגלל תגובה חיסונית של האם בהיריון; ו**השפעות הורמונים לפני הלידה** (למשל נשים עם CAH נמשכות מעט יותר לנשים). סיימון לוויי דיווח ש-INAH-3 קטן יותר אצל גברים הומוסקסואלים מאשר אצל גברים הטרוסקסואלים, אף שממצא זה זקוק לשחזור נוסף. לא נמצא "גן הומוסקסואליות" יחיד; גנים רבים תורמים כל אחד מעט.',
        ],
      },
      points: {
        en: ['The sexually dimorphic nucleus / INAH-3 is larger on average in males.', 'Brains are a mosaic of features, not two types.', 'Orientation is influenced by genes, prenatal hormones and birth order.', 'No single "gay gene" exists.'],
        he: ['הגרעין הדימורפי / INAH-3 גדול יותר בממוצע אצל זכרים.', 'המוח הוא פסיפס של מאפיינים, לא שני סוגים.', 'הנטייה המינית מושפעת מגנים, מהורמונים לפני הלידה ומסדר הלידה.', 'אין "גן הומוסקסואליות" יחיד.'],
      },
      terms: [
        ['Sexually dimorphic nucleus', 'A region of the preoptic hypothalamus that is larger in males.', 'הגרעין הדימורפי-מינית', 'אזור בהיפותלמוס הפרה-אופטי שגדול יותר בזכרים.'],
        ['INAH-3', 'A hypothalamic nucleus that is on average larger in men; linked by some studies to orientation.', 'INAH-3', 'גרעין בהיפותלמוס שגדול בממוצע אצל גברים; מחקרים מסוימים קשרו אותו לנטייה מינית.'],
        ['Fraternal birth order effect', 'Each older brother slightly raises the likelihood of a man being gay.', 'אפקט סדר הלידה של האחים', 'כל אח מבוגר מעלה מעט את הסבירות שגבר יהיה הומוסקסואל.'],
      ],
      quiz: [
        ['Which finding supports a biological influence on sexual orientation?', 'איזה ממצא תומך בהשפעה ביולוגית על נטייה מינית?', ['Higher agreement in identical than fraternal twins', 'Orientation changes with diet', 'Orientation is chosen in adolescence', 'No twin differences'], ['התאמה גבוהה יותר בתאומים זהים מאשר בלא זהים', 'הנטייה משתנה עם תזונה', 'הנטייה נבחרת בגיל ההתבגרות', 'אין הבדלים בין תאומים'], 0, 'Greater similarity in identical twins suggests a genetic contribution.', 'דמיון רב יותר בתאומים זהים מרמז על תרומה גנטית.'],
      ],
    },
    {
      title: { en: 'Attraction, love and parenting', he: 'משיכה, אהבה והורות' },
      diagram: null,
      regions: ['vta', 'nucleusAccumbens', 'pituitary', 'hypothalamus'],
      body: {
        en: [
          'Across cultures, people tend to find **symmetrical** faces attractive — symmetry may signal good genes and health. Features linked to **fertility** (such as a youthful look and certain waist-to-hip ratios) and to a strong **immune system** also play a role. Some studies suggest we prefer the scent of partners whose immune genes (MHC) differ from ours. People also often choose partners similar to themselves in background, education and attitudes (**assortative mating**).',
          '## Love and bonding',
          'Brain scans of people newly in love show activity in the **dopamine reward system** (VTA, caudate) — love resembles a powerful motivation. Long-term bonding involves **oxytocin** and **vasopressin**. In **prairie voles**, which form lifelong pairs, blocking these hormones prevents bonding, while closely related meadow voles, which do not pair-bond, have fewer of these receptors in reward areas. Oxytocin is also released during birth and breastfeeding and supports bonding between parents and infants.',
          '## Sexual dysfunction',
          'Common problems include low desire, erectile dysfunction (often due to blood-vessel problems, diabetes, or medications like SSRIs) and pain. Drugs like sildenafil (Viagra) increase blood flow by acting on the nitric oxide pathway.',
        ],
        he: [
          'בכל התרבויות, אנשים נוטים למצוא פנים **סימטריות** מושכות — סימטריה עשויה לאותת על גנים טובים ובריאות. גם מאפיינים הקשורים ל**פוריות** (כמו מראה צעיר ויחס מסוים בין המותניים לירכיים) ול**מערכת חיסון** חזקה משחקים תפקיד. מחקרים מסוימים מרמזים שאנו מעדיפים את הריח של בני זוג שגני החיסון שלהם (MHC) שונים משלנו. אנשים גם בוחרים לעיתים קרובות בני זוג הדומים להם ברקע, בהשכלה ובעמדות (**הזדווגות אסורטטיבית**).',
          '## אהבה וקשר',
          'סריקות מוח של אנשים שהתאהבו זה עתה מראות פעילות ב**מערכת התגמול של הדופמין** (VTA, הגרעין הזנבי) — אהבה דומה למוטיבציה עוצמתית. קשר לטווח ארוך כרוך ב**אוקסיטוצין** וב**וזופרסין**. אצל **נברני הערבה**, שיוצרים זוגות לכל החיים, חסימת הורמונים אלה מונעת יצירת קשר, ואילו נברני האחו הקרובים, שאינם יוצרים זוגות, מחזיקים פחות קולטנים כאלה באזורי התגמול. אוקסיטוצין משתחרר גם בלידה ובהנקה ותומך בקשר בין הורים לתינוקות.',
          '## הפרעות בתפקוד המיני',
          'בעיות נפוצות כוללות חשק נמוך, הפרעה בזקפה (לעיתים קרובות עקב בעיות בכלי דם, סוכרת או תרופות כמו SSRI) וכאב. תרופות כמו סילדנפיל (ויאגרה) מגבירות את זרימת הדם על ידי פעולה על מסלול תחמוצת החנקן.',
        ],
      },
      points: {
        en: ['Symmetry and signs of fertility and health increase attractiveness.', 'Romantic love activates the dopamine reward system.', 'Oxytocin and vasopressin support pair bonding (prairie voles).', 'Oxytocin supports parent–infant bonding.'],
        he: ['סימטריה וסימני פוריות ובריאות מגבירים משיכה.', 'אהבה רומנטית מפעילה את מערכת התגמול של הדופמין.', 'אוקסיטוצין ווזופרסין תומכים ביצירת זוגיות (נברני ערבה).', 'אוקסיטוצין תומך בקשר הורה-תינוק.'],
      },
      terms: [
        ['Oxytocin', 'Hormone involved in bonding, birth and breastfeeding.', 'אוקסיטוצין', 'הורמון המעורב בקשר רגשי, לידה והנקה.'],
        ['Assortative mating', 'Choosing partners who are similar to oneself.', 'הזדווגות אסורטטיבית', 'בחירת בני זוג הדומים לעצמנו.'],
        ['Prairie vole', 'A monogamous rodent used to study the biology of pair bonding.', 'נברן הערבה', 'מכרסם מונוגמי המשמש לחקר הביולוגיה של יצירת זוגיות.'],
      ],
      quiz: [
        ['Which hormone is most associated with bonding, birth and breastfeeding?', 'איזה הורמון קשור יותר מכול לקשר רגשי, לידה והנקה?', ['Cortisol', 'Oxytocin', 'Melatonin', 'Insulin'], ['קורטיזול', 'אוקסיטוצין', 'מלטונין', 'אינסולין'], 1, 'Oxytocin is released by the posterior pituitary.', 'אוקסיטוצין משתחרר מהאונה האחורית של בלוטת יותרת המוח.'],
      ],
    },
  ],
};
