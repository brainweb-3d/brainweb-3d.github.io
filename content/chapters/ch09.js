// Format explained at the top of ch01.js
export default {
  n: 9,
  icon: '🌡️',
  color: '#f2994a',
  title: { en: 'Temperature Regulation, Thirst, and Hunger', he: 'ויסות טמפרטורה, צמא ורעב' },
  intro: {
    en: 'How the brain keeps the body\'s temperature, water and energy in balance — and what goes wrong in obesity and eating disorders.',
    he: 'איך המוח שומר על איזון בטמפרטורה, במים ובאנרגיה של הגוף — ומה משתבש בהשמנה ובהפרעות אכילה.',
  },
  lessons: [
    {
      title: { en: 'Homeostasis and body temperature', he: 'הומאוסטזיס וחום הגוף' },
      diagram: 'homeostasis',
      regions: ['hypothalamus'],
      body: {
        en: [
          '**Homeostasis** is the body\'s ability to keep internal conditions — temperature, fluid, nutrients — within a narrow healthy range around a **set point**. It works like a thermostat: sensors detect a change, a control centre compares it with the set point, and responses push it back (**negative feedback**). Motivated behaviours like drinking and eating are part of this system.',
          '## Regulating temperature',
          '**Ectotherms** (such as reptiles) depend on the environment for heat and regulate their temperature mainly by behaviour — basking or seeking shade. **Endotherms** (birds and mammals) generate their own heat, keeping a steady core of about 37°C in humans. This costs a lot of energy but allows activity in any weather.',
          'When cold, we shiver, narrow blood vessels in the skin, and fluff up hair (goose bumps); infants and some adults also burn **brown fat** for heat. When hot, we sweat, widen skin blood vessels and pant (in some animals). We also use behaviour: clothing, shelter, moving to the shade.',
          'The control centre is the **preoptic area** of the **hypothalamus**, which contains warm- and cold-sensitive neurons. A **fever** is a raised set point, triggered by immune signals (pyrogens) acting via prostaglandins — moderate fever helps fight infection. Too high a temperature (**hyperthermia**, heat stroke) or too low (**hypothermia**) can be deadly.',
        ],
        he: [
          '**הומאוסטזיס** היא היכולת של הגוף לשמור על תנאים פנימיים — טמפרטורה, נוזלים, חומרי מזון — בטווח בריא וצר סביב **נקודת קביעה (Set point)**. היא פועלת כמו תרמוסטט: חיישנים מזהים שינוי, מרכז בקרה משווה אותו לנקודת הקביעה, ותגובות מחזירות אותו (**משוב שלילי**). התנהגויות מונעות כמו שתייה ואכילה הן חלק ממערכת זו.',
          '## ויסות טמפרטורה',
          '**בעלי דם קר (Ectotherms)** (כמו זוחלים) תלויים בסביבה לקבלת חום ומווסתים את חום גופם בעיקר בהתנהגות — שיזוף או חיפוש צל. **בעלי דם חם (Endotherms)** (ציפורים ויונקים) מייצרים חום בעצמם ושומרים על חום ליבה יציב של כ-37°C בבני אדם. זה עולה הרבה אנרגיה אבל מאפשר פעילות בכל מזג אוויר.',
          'כשקר לנו, אנחנו רועדים, מצרים את כלי הדם בעור ומזקפים שערות ("עור ברווז"); תינוקות וחלק מהמבוגרים גם שורפים **שומן חום** להפקת חום. כשחם לנו, אנחנו מזיעים, מרחיבים את כלי הדם בעור ומתנשפים (בבעלי חיים מסוימים). אנחנו גם משתמשים בהתנהגות: בגדים, מחסה, מעבר לצל.',
          'מרכז הבקרה הוא **האזור הפרה-אופטי** של **ההיפותלמוס**, שמכיל נוירונים רגישים לחום ולקור. **חום (Fever)** הוא העלאה של נקודת הקביעה, המופעלת על ידי אותות חיסוניים (פירוגנים) הפועלים דרך פרוסטגלנדינים — חום מתון עוזר להילחם בזיהום. טמפרטורה גבוהה מדי (**היפרתרמיה**, מכת חום) או נמוכה מדי (**היפותרמיה**) עלולה להיות קטלנית.',
        ],
      },
      points: {
        en: ['Homeostasis uses negative feedback around a set point.', 'Ectotherms use behaviour; endotherms make their own heat.', 'Shivering, vasoconstriction and brown fat warm us; sweating cools us.', 'The preoptic hypothalamus is the thermostat; fever raises the set point.'],
        he: ['הומאוסטזיס משתמשת במשוב שלילי סביב נקודת קביעה.', 'בעלי דם קר משתמשים בהתנהגות; בעלי דם חם מייצרים חום בעצמם.', 'רעד, כיווץ כלי דם ושומן חום מחממים; הזעה מקררת.', 'ההיפותלמוס הפרה-אופטי הוא התרמוסטט; חום מעלה את נקודת הקביעה.'],
      },
      terms: [
        ['Homeostasis', 'Keeping internal conditions within a stable range.', 'הומאוסטזיס', 'שמירה על תנאים פנימיים בטווח יציב.'],
        ['Set point', 'The target value a homeostatic system tries to maintain.', 'נקודת קביעה', 'ערך המטרה שמערכת הומאוסטטית מנסה לשמור עליו.'],
        ['Endotherm', 'An animal that produces its own body heat (birds, mammals).', 'בעל דם חם', 'בעל חיים שמייצר את חום גופו בעצמו (ציפורים, יונקים).'],
        ['Brown fat', 'Fat tissue specialised for producing heat.', 'שומן חום', 'רקמת שומן המתמחה בהפקת חום.'],
        ['Preoptic area', 'Hypothalamic region that acts as the body\'s thermostat.', 'האזור הפרה-אופטי', 'אזור בהיפותלמוס שמשמש כתרמוסטט של הגוף.'],
      ],
      quiz: [
        ['Which brain area acts as the body\'s main thermostat?', 'איזה אזור מוח משמש כתרמוסטט הראשי של הגוף?', ['Preoptic area of the hypothalamus', 'Cerebellum', 'Occipital lobe', 'Amygdala'], ['האזור הפרה-אופטי בהיפותלמוס', 'המוח הקטן', 'האונה העורפית', 'האמיגדלה'], 0, 'Warm- and cold-sensitive neurons in the preoptic area control temperature.', 'נוירונים רגישים לחום ולקור באזור הפרה-אופטי שולטים בטמפרטורה.'],
        ['A fever is best described as…', 'חום (Fever) מתואר בצורה הטובה ביותר כ…', ['a failure of homeostasis', 'a raised temperature set point', 'too much brown fat', 'loss of sweating'], ['כשל של הומאוסטזיס', 'העלאה של נקודת הקביעה לטמפרטורה', 'יותר מדי שומן חום', 'אובדן הזעה'], 1, 'Immune signals raise the set point, so the body actively heats itself.', 'אותות חיסוניים מעלים את נקודת הקביעה, והגוף מחמם את עצמו באופן פעיל.'],
      ],
    },
    {
      title: { en: 'Thirst: regulating the body\'s fluids', he: 'צמא: ויסות נוזלי הגוף' },
      diagram: 'thirst',
      regions: ['hypothalamus', 'pituitary'],
      body: {
        en: [
          'About two-thirds of the body\'s water is **intracellular** (inside cells) and one-third **extracellular** (blood plasma and the fluid between cells). Water moves across cell membranes by **osmosis** — toward the side with more dissolved particles (solutes). The **kidneys** control how much water and salt we keep.',
          '## Two kinds of thirst',
          '**Osmotic thirst** happens when the extracellular fluid becomes too salty (for example, after eating salty food): water leaves the cells and they shrink. **Osmoreceptors** in areas near the third ventricle (such as the **OVLT**) detect this and trigger thirst and the release of **antidiuretic hormone (ADH, vasopressin)** from the posterior pituitary, which makes the kidneys save water.',
          '**Hypovolemic thirst** happens when the total volume of blood drops (bleeding, vomiting, diarrhoea, heavy sweating). Pressure receptors in the heart and blood vessels detect it, and the kidneys release **renin**, which leads to **angiotensin II**. Angiotensin narrows blood vessels, triggers thirst (via the subfornical organ), and stimulates **aldosterone**, which makes the kidneys keep sodium — which is why we also crave salt.',
          'We stop drinking long before water reaches the blood, thanks to signals from the mouth, throat and stomach. Drinking huge amounts of plain water too fast (for example during endurance events) can dilute blood sodium dangerously (**hyponatremia**); sports drinks with salt reduce this risk.',
        ],
        he: [
          'כשני שלישים מהמים בגוף הם **תוך-תאיים** (בתוך התאים) ושליש **חוץ-תאיים** (פלזמת הדם והנוזל שבין התאים). מים עוברים דרך ממברנות התאים ב**אוסמוזה** — לכיוון הצד שבו יש יותר חלקיקים מומסים. **הכליות** קובעות כמה מים ומלח נשמור.',
          '## שני סוגי צמא',
          '**צמא אוסמוטי** קורה כשהנוזל החוץ-תאי נעשה מלוח מדי (למשל אחרי אכילת מזון מלוח): מים יוצאים מהתאים והם מתכווצים. **אוסמורצפטורים** באזורים סביב החדר השלישי (כמו **OVLT**) מזהים זאת ומפעילים צמא ושחרור של **הורמון אנטי-דיורטי (ADH, וזופרסין)** מהאונה האחורית של בלוטת יותרת המוח, שגורם לכליות לחסוך מים.',
          '**צמא היפו-וולמי** קורה כשנפח הדם הכולל יורד (דימום, הקאות, שלשולים, הזעה כבדה). קולטני לחץ בלב ובכלי הדם מזהים זאת, והכליות משחררות **רנין**, שמוביל ל**אנגיוטנסין II**. אנגיוטנסין מצר כלי דם, מעורר צמא (דרך האיבר התת-פורניקלי) ומגרה הפרשת **אלדוסטרון**, שגורם לכליות לשמור נתרן — ולכן אנחנו גם משתוקקים למלח.',
          'אנחנו מפסיקים לשתות הרבה לפני שהמים מגיעים לדם, בזכות אותות מהפה, מהגרון ומהקיבה. שתיית כמויות עצומות של מים נקיים מהר מדי (למשל באירועי סיבולת) עלולה למהול את הנתרן בדם באופן מסוכן (**היפונתרמיה**); משקאות ספורט עם מלח מפחיתים סיכון זה.',
        ],
      },
      points: {
        en: ['Osmotic thirst: salty extracellular fluid shrinks cells.', 'ADH (vasopressin) makes the kidneys save water.', 'Hypovolemic thirst: low blood volume → renin → angiotensin II → thirst + aldosterone.', 'Drinking stops early due to mouth and stomach signals.'],
        he: ['צמא אוסמוטי: נוזל חוץ-תאי מלוח מכווץ את התאים.', 'ADH (וזופרסין) גורם לכליות לחסוך מים.', 'צמא היפו-וולמי: נפח דם נמוך ← רנין ← אנגיוטנסין II ← צמא + אלדוסטרון.', 'השתייה נפסקת מוקדם בזכות אותות מהפה ומהקיבה.'],
      },
      terms: [
        ['Osmotic thirst', 'Thirst caused by increased solute concentration outside cells.', 'צמא אוסמוטי', 'צמא שנגרם מעלייה בריכוז המומסים מחוץ לתאים.'],
        ['Hypovolemic thirst', 'Thirst caused by a loss of blood volume.', 'צמא היפו-וולמי', 'צמא שנגרם מאובדן נפח דם.'],
        ['Antidiuretic hormone (ADH)', 'Hormone (vasopressin) from the posterior pituitary that makes kidneys retain water.', 'הורמון אנטי-דיורטי (ADH)', 'הורמון (וזופרסין) מהאונה האחורית של יותרת המוח שגורם לכליות לשמור מים.'],
        ['Angiotensin II', 'Hormone that constricts blood vessels and triggers thirst.', 'אנגיוטנסין II', 'הורמון שמצר כלי דם ומעורר צמא.'],
        ['Osmoreceptor', 'A receptor that detects the solute concentration of body fluids.', 'אוסמורצפטור', 'קולטן שמזהה את ריכוז המומסים בנוזלי הגוף.'],
      ],
      quiz: [
        ['After eating very salty chips you feel thirsty. This is…', 'אחרי אכילת צ\'יפס מלוח מאוד אתם צמאים. זהו…', ['hypovolemic thirst', 'osmotic thirst', 'hyponatremia', 'a fever'], ['צמא היפו-וולמי', 'צמא אוסמוטי', 'היפונתרמיה', 'חום'], 1, 'Salt raises extracellular solute concentration, drawing water out of cells.', 'מלח מעלה את ריכוז המומסים החוץ-תאי ומושך מים מהתאים.'],
        ['Which hormone makes the kidneys save water?', 'איזה הורמון גורם לכליות לחסוך מים?', ['Insulin', 'ADH (vasopressin)', 'Leptin', 'Melatonin'], ['אינסולין', 'ADH (וזופרסין)', 'לפטין', 'מלטונין'], 1, 'ADH from the posterior pituitary reduces urine output.', 'ADH מבלוטת יותרת המוח מפחית את כמות השתן.'],
      ],
    },
    {
      title: { en: 'Hunger and satiety', he: 'רעב ושובע' },
      diagram: 'hunger',
      regions: ['hypothalamus'],
      body: {
        en: [
          'What we eat is shaped by culture as well as biology — but the body has strong systems to manage energy. Digestion breaks food into glucose, amino acids and fats. The pancreas releases **insulin** when blood glucose rises after a meal, helping cells take up glucose and store extra energy (as glycogen and fat). Between meals, **glucagon** releases stored energy. The brain depends almost entirely on glucose.',
          '## Starting a meal',
          'Hunger signals include low glucose availability, and the hormone **ghrelin**, released by an empty stomach, which rises before meals. Learning and habit matter a lot too — we often eat because it is "lunchtime" or because food is tasty and available.',
          '## Ending a meal (satiety)',
          'Stomach stretch and the gut hormone **CCK** (cholecystokinin) signal fullness in the short term. In the long term, fat cells release **leptin** in proportion to fat stores; leptin tells the brain how much energy is stored and reduces appetite.',
          '## The hypothalamus',
          'Early studies found that damage to the **lateral hypothalamus** made animals stop eating, while damage to the **ventromedial hypothalamus** made them overeat — leading to a "hunger centre / satiety centre" idea. Today we know the **arcuate nucleus** is the key hub: some of its neurons (NPY/AgRP) drive hunger, while others (POMC) reduce it; both respond to leptin, insulin and ghrelin and signal to the **paraventricular nucleus** and lateral hypothalamus.',
        ],
        he: [
          'מה שאנו אוכלים מעוצב על ידי התרבות וגם על ידי הביולוגיה — אבל לגוף יש מערכות חזקות לניהול אנרגיה. העיכול מפרק מזון לגלוקוז, חומצות אמינו ושומנים. הלבלב משחרר **אינסולין** כשרמת הגלוקוז בדם עולה אחרי ארוחה, ועוזר לתאים לקלוט גלוקוז ולאגור אנרגיה עודפת (כגליקוגן ושומן). בין ארוחות, **גלוקגון** משחרר אנרגיה אגורה. המוח תלוי כמעט לחלוטין בגלוקוז.',
          '## התחלת ארוחה',
          'אותות רעב כוללים זמינות נמוכה של גלוקוז, וההורמון **גרלין**, שמשתחרר מקיבה ריקה ועולה לפני ארוחות. גם למידה והרגל חשובים מאוד — לעיתים קרובות אנחנו אוכלים כי זו "שעת צהריים" או כי האוכל טעים וזמין.',
          '## סיום ארוחה (שובע)',
          'מתיחת הקיבה וההורמון **CCK** (כולציסטוקינין) ממערכת העיכול מאותתים על מלאות בטווח הקצר. בטווח הארוך, תאי שומן משחררים **לפטין** ביחס למאגרי השומן; לפטין אומר למוח כמה אנרגיה אגורה ומפחית את התיאבון.',
          '## ההיפותלמוס',
          'מחקרים מוקדמים מצאו שפגיעה ב**היפותלמוס הצידי** גרמה לבעלי חיים להפסיק לאכול, ואילו פגיעה ב**היפותלמוס הגחוני-מדיאלי** גרמה להם לאכול יותר מדי — מה שהוביל לרעיון של "מרכז רעב / מרכז שובע". היום אנו יודעים ש**הגרעין הקשתי (Arcuate nucleus)** הוא המוקד העיקרי: חלק מהנוירונים שלו (NPY/AgRP) מניעים רעב, ואחרים (POMC) מפחיתים אותו; שני הסוגים מגיבים ללפטין, לאינסולין ולגרלין ומאותתים ל**גרעין הפרה-ונטריקולרי** ולהיפותלמוס הצידי.',
        ],
      },
      points: {
        en: ['Insulin stores energy after meals; glucagon releases it between meals.', 'Ghrelin (stomach) increases hunger.', 'CCK and stomach stretch end meals; leptin signals long-term fat stores.', 'The arcuate nucleus integrates hunger and satiety signals.'],
        he: ['אינסולין אוגר אנרגיה אחרי ארוחות; גלוקגון משחרר אותה ביניהן.', 'גרלין (מהקיבה) מגביר רעב.', 'CCK ומתיחת הקיבה מסיימים ארוחות; לפטין מאותת על מאגרי שומן לטווח ארוך.', 'הגרעין הקשתי משלב אותות רעב ושובע.'],
      },
      terms: [
        ['Insulin', 'Pancreatic hormone that helps cells absorb glucose and store energy.', 'אינסולין', 'הורמון מהלבלב שעוזר לתאים לקלוט גלוקוז ולאגור אנרגיה.'],
        ['Ghrelin', 'Stomach hormone that increases hunger.', 'גרלין', 'הורמון מהקיבה שמגביר רעב.'],
        ['Leptin', 'Hormone from fat cells that signals energy stores and reduces appetite.', 'לפטין', 'הורמון מתאי שומן שמאותת על מאגרי אנרגיה ומפחית תיאבון.'],
        ['CCK (cholecystokinin)', 'Gut hormone released during a meal that promotes fullness.', 'CCK (כולציסטוקינין)', 'הורמון מערכת העיכול שמשתחרר בזמן ארוחה ומקדם תחושת מלאות.'],
        ['Arcuate nucleus', 'Hypothalamic nucleus that integrates hunger and satiety hormones.', 'הגרעין הקשתי', 'גרעין בהיפותלמוס שמשלב הורמוני רעב ושובע.'],
      ],
      quiz: [
        ['Which hormone, released by fat cells, signals long-term energy stores?', 'איזה הורמון, המשתחרר מתאי שומן, מאותת על מאגרי אנרגיה לטווח ארוך?', ['Ghrelin', 'Leptin', 'Glucagon', 'ADH'], ['גרלין', 'לפטין', 'גלוקגון', 'ADH'], 1, 'Leptin levels rise with fat stores and reduce appetite.', 'רמות הלפטין עולות עם מאגרי השומן ומפחיתות תיאבון.'],
        ['Ghrelin levels are highest…', 'רמות הגרלין הגבוהות ביותר הן…', ['right after a meal', 'just before a meal', 'during sleep only', 'never change'], ['מיד אחרי ארוחה', 'ממש לפני ארוחה', 'רק בזמן שינה', 'אינן משתנות'], 1, 'Ghrelin from the empty stomach rises before meals and drives hunger.', 'גרלין מקיבה ריקה עולה לפני ארוחות ומניע רעב.'],
      ],
    },
    {
      title: { en: 'Obesity and eating disorders', he: 'השמנה והפרעות אכילה' },
      diagram: null,
      regions: ['hypothalamus', 'nucleusAccumbens'],
      body: {
        en: [
          '**Body mass index (BMI)** — weight in kilograms divided by height in metres squared — is a rough measure: 18.5–25 is considered normal, 25–30 overweight, and over 30 obese. **Obesity** is influenced by genes (heritability is high), by abundant cheap, tasty, high-calorie food, by less physical activity, and by the brain\'s reward system. Most obese people produce plenty of leptin but respond to it poorly (**leptin resistance**). Some scientists argue obesity should be seen partly as a brain disorder. Diets often fail long-term because the body defends its weight by lowering metabolism.',
          '## Anorexia and bulimia',
          '**Anorexia nervosa** involves severe restriction of eating, very low body weight, an intense fear of gaining weight and a distorted body image. It has the highest death rate of any psychological disorder. **Bulimia nervosa** involves cycles of binge eating followed by purging (vomiting, laxatives) or extreme exercise, usually at a near-normal weight. Both are much more common in females and often begin in adolescence.',
          'Causes include genetics, perfectionist and anxious personality traits, cultural pressure toward thinness, and differences in serotonin and dopamine systems. Treatment combines nutritional rehabilitation, family-based and cognitive-behavioural therapy; SSRIs can help bulimia.',
        ],
        he: [
          '**מדד מסת הגוף (BMI)** — משקל בקילוגרמים חלקי הגובה במטרים בריבוע — הוא מדד גס: 18.5–25 נחשב תקין, 25–30 עודף משקל, ומעל 30 השמנה. **השמנה** מושפעת מגנים (התורשתיות גבוהה), משפע של מזון זול, טעים ועתיר קלוריות, מפחות פעילות גופנית וממערכת התגמול של המוח. רוב האנשים הסובלים מהשמנה מייצרים הרבה לפטין אך מגיבים אליו בצורה חלשה (**עמידות ללפטין**). יש מדענים שטוענים שיש לראות בהשמנה בחלקה הפרעה מוחית. דיאטות נכשלות לעיתים קרובות בטווח הארוך כי הגוף מגן על משקלו על ידי האטת חילוף החומרים.',
          '## אנורקסיה ובולימיה',
          '**אנורקסיה נרבוזה** כוללת הגבלה חמורה של אכילה, משקל גוף נמוך מאוד, פחד עז מעלייה במשקל ודימוי גוף מעוות. יש לה שיעור התמותה הגבוה ביותר מכל ההפרעות הנפשיות. **בולימיה נרבוזה** כוללת מחזורים של אכילה בולמוסית ואחריה התרוקנות (הקאות, משלשלים) או פעילות גופנית קיצונית, לרוב במשקל כמעט תקין. שתיהן שכיחות הרבה יותר בנשים ומתחילות לעיתים קרובות בגיל ההתבגרות.',
          'הגורמים כוללים גנטיקה, תכונות אישיות פרפקציוניסטיות וחרדתיות, לחץ תרבותי לרזון והבדלים במערכות הסרוטונין והדופמין. הטיפול משלב שיקום תזונתי, טיפול משפחתי וקוגניטיבי-התנהגותי; תרופות SSRI יכולות לעזור בבולימיה.',
        ],
      },
      points: {
        en: ['BMI over 30 = obese; obesity is highly heritable.', 'Many obese people are leptin resistant.', 'Anorexia: severe restriction and distorted body image; highest mortality.', 'Bulimia: binge–purge cycles at near-normal weight.'],
        he: ['BMI מעל 30 = השמנה; להשמנה תורשתיות גבוהה.', 'אנשים רבים עם השמנה עמידים ללפטין.', 'אנורקסיה: הגבלה חמורה ודימוי גוף מעוות; התמותה הגבוהה ביותר.', 'בולימיה: מחזורי בולמוס-התרוקנות במשקל כמעט תקין.'],
      },
      terms: [
        ['Body mass index (BMI)', 'Weight (kg) divided by height (m) squared.', 'מדד מסת הגוף (BMI)', 'משקל (ק"ג) חלקי גובה (מ\') בריבוע.'],
        ['Leptin resistance', 'Reduced brain response to leptin, common in obesity.', 'עמידות ללפטין', 'תגובה מוחית מופחתת ללפטין, נפוצה בהשמנה.'],
        ['Anorexia nervosa', 'Eating disorder of severe food restriction, low weight and fear of weight gain.', 'אנורקסיה נרבוזה', 'הפרעת אכילה של הגבלת מזון חמורה, משקל נמוך ופחד מעלייה במשקל.'],
        ['Bulimia nervosa', 'Eating disorder of binge eating followed by purging.', 'בולימיה נרבוזה', 'הפרעת אכילה של אכילה בולמוסית ואחריה התרוקנות.'],
      ],
      quiz: [
        ['Which eating disorder has the highest mortality rate?', 'לאיזו הפרעת אכילה שיעור התמותה הגבוה ביותר?', ['Bulimia nervosa', 'Anorexia nervosa', 'Binge eating', 'Obesity'], ['בולימיה נרבוזה', 'אנורקסיה נרבוזה', 'אכילה בולמוסית', 'השמנה'], 1, 'Anorexia has the highest mortality of any psychological disorder.', 'לאנורקסיה שיעור התמותה הגבוה ביותר מכל ההפרעות הנפשיות.'],
      ],
    },
  ],
};
