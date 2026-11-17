// Format explained at the top of ch01.js
export default {
  n: 3,
  icon: '⚡',
  color: '#f2994a',
  title: { en: 'Cells of the Nervous System', he: 'תאי מערכת העצבים' },
  intro: {
    en: 'Neurons and glia, and how neurons send electrical signals and talk to each other at synapses.',
    he: 'נוירונים ותאי גליה, ואיך נוירונים שולחים אותות חשמליים ומדברים זה עם זה בסינפסות.',
  },
  lessons: [
    {
      title: { en: 'The structure of a neuron', he: 'מבנה הנוירון' },
      diagram: 'neuron',
      regions: [],
      body: {
        en: [
          'The nervous system has two main cell types: **neurons**, which send and receive information, and **glia**, which support them. A typical neuron has three parts.',
          'The **cell body (soma)** contains the **nucleus** with the cell\'s DNA, plus machinery that makes proteins and energy (**mitochondria**). **Dendrites** are branching extensions that receive input from other neurons; many are covered with tiny **dendritic spines** where synapses form. The **axon** is a single long fibre that carries the signal away from the cell body. It begins at the **axon hillock**, where the decision to fire is made, and ends in **axon terminals** that release chemical messengers.',
          'Many axons are wrapped in **myelin**, a fatty insulating layer, with small bare gaps called **nodes of Ranvier**. A neuron keeps its shape thanks to an internal skeleton (the **cytoskeleton**) of microtubules and neurofilaments, which also act as "train tracks" to transport materials along the axon. In Alzheimer\'s disease, the protein **tau** that stabilizes microtubules forms tangles inside neurons.',
        ],
        he: [
          'במערכת העצבים יש שני סוגי תאים עיקריים: **נוירונים**, ששולחים ומקבלים מידע, ו**תאי גליה**, שתומכים בהם. לנוירון טיפוסי שלושה חלקים.',
          '**גוף התא (סומה)** מכיל את **הגרעין** עם ה-DNA של התא, וכן מנגנונים שמייצרים חלבונים ואנרגיה (**מיטוכונדריה**). **הדנדריטים** הם שלוחות מסתעפות שמקבלות קלט מנוירונים אחרים; רבים מהם מכוסים ב**קוצים דנדריטיים** זעירים שבהם נוצרות סינפסות. **האקסון** הוא סיב ארוך יחיד שמוליך את האות הרחק מגוף התא. הוא מתחיל ב**גבעת האקסון**, שבה מתקבלת ההחלטה אם לירות, ומסתיים ב**כפתורי האקסון (Axon terminals)** שמשחררים שליחים כימיים.',
          'אקסונים רבים עטופים ב**מיאלין**, שכבה שומנית מבודדת, עם מרווחים חשופים קטנים הנקראים **צמתי רנבייה**. הנוירון שומר על צורתו בזכות שלד פנימי (**ציטוסקלטון**) של מיקרוטובולים ונוירופילמנטים, שמשמשים גם "מסילות רכבת" להובלת חומרים לאורך האקסון. במחלת אלצהיימר, החלבון **טאו** שמייצב את המיקרוטובולים יוצר סבכים בתוך הנוירונים.',
        ],
      },
      points: {
        en: ['Dendrites receive, the soma integrates, the axon sends.', 'The axon hillock is where action potentials begin.', 'Myelin insulates axons; nodes of Ranvier are the gaps.', 'The cytoskeleton gives shape and transports materials.'],
        he: ['דנדריטים מקבלים, גוף התא משלב, האקסון שולח.', 'גבעת האקסון היא המקום שבו מתחילים פוטנציאלי פעולה.', 'מיאלין מבודד את האקסונים; צמתי רנבייה הם המרווחים.', 'הציטוסקלטון נותן צורה ומוביל חומרים.'],
      },
      terms: [
        ['Dendrite', 'Branch of a neuron that receives input from other cells.', 'דנדריט', 'שלוחה של נוירון שמקבלת קלט מתאים אחרים.'],
        ['Axon', 'Long fibre that carries the neural signal away from the cell body.', 'אקסון', 'סיב ארוך שמוליך את האות העצבי הרחק מגוף התא.'],
        ['Axon hillock', 'Cone-shaped start of the axon where action potentials are triggered.', 'גבעת האקסון', 'תחילת האקסון דמוית החרוט, שבה מופעלים פוטנציאלי פעולה.'],
        ['Myelin', 'Fatty insulation around axons that speeds up signals.', 'מיאלין', 'בידוד שומני סביב אקסונים שמאיץ את האותות.'],
        ['Node of Ranvier', 'A small bare gap between segments of myelin.', 'צומת רנבייה', 'מרווח חשוף קטן בין מקטעי מיאלין.'],
      ],
      quiz: [
        ['Which part of the neuron mainly RECEIVES messages from other neurons?', 'איזה חלק בנוירון בעיקר מקבל מסרים מנוירונים אחרים?', ['Axon', 'Dendrites', 'Myelin', 'Axon terminal'], ['אקסון', 'דנדריטים', 'מיאלין', 'כפתור האקסון'], 1, 'Dendrites (and their spines) are the main input zone.', 'הדנדריטים (והקוצים שלהם) הם אזור הקלט העיקרי.'],
        ['Where is the action potential usually triggered?', 'היכן בדרך כלל מופעל פוטנציאל הפעולה?', ['Dendritic spine', 'Nucleus', 'Axon hillock', 'Node of Ranvier'], ['קוץ דנדריטי', 'הגרעין', 'גבעת האקסון', 'צומת רנבייה'], 2, 'The axon hillock adds up incoming signals and fires if threshold is reached.', 'גבעת האקסון מסכמת את האותות הנכנסים ויורה אם מגיעים לסף.'],
      ],
    },
    {
      title: { en: 'Types of neurons and glia', he: 'סוגי נוירונים ותאי גליה' },
      diagram: 'glia',
      regions: [],
      body: {
        en: [
          '## Neurons come in different shapes',
          'By structure, neurons can be **unipolar** (one extension that splits — typical of touch and pain sensory neurons), **bipolar** (one axon and one dendrite — found in the retina and smell system) or **multipolar** (one axon and many dendrites — the most common type, including motor neurons and pyramidal cells of the cortex). By function, **sensory neurons** carry information from the body to the CNS, **motor neurons** carry commands to muscles and glands, and **interneurons** connect neurons with each other inside the CNS.',
          '## Glia — much more than glue',
          'Glia (Greek for "glue") are at least as numerous as neurons. **Astrocytes** (star-shaped) supply nutrients, control the chemical environment, help form the blood–brain barrier, clean up neurotransmitters and help regulate synapses. **Oligodendrocytes** make myelin in the CNS (one cell can myelinate segments of many axons), while **Schwann cells** make myelin in the PNS (one cell per segment) and help damaged peripheral nerves regrow. **Microglia** are the brain\'s immune cells: they remove debris and dead cells. Damage to myelin causes diseases such as **multiple sclerosis**.',
        ],
        he: [
          '## לנוירונים יש צורות שונות',
          'לפי מבנה, נוירונים יכולים להיות **חד-קוטביים** (שלוחה אחת שמתפצלת — אופייני לנוירוני תחושה של מגע וכאב), **דו-קוטביים** (אקסון אחד ודנדריט אחד — נמצאים ברשתית ובמערכת הריח) או **רב-קוטביים** (אקסון אחד ודנדריטים רבים — הסוג הנפוץ ביותר, כולל נוירונים מוטוריים ותאי פירמידה בקליפה). לפי תפקוד, **נוירונים תחושתיים** מעבירים מידע מהגוף למערכת העצבים המרכזית, **נוירונים מוטוריים** מעבירים פקודות לשרירים ולבלוטות, ו**אינטרנוירונים** מחברים בין נוירונים בתוך מערכת העצבים המרכזית.',
          '## גליה — הרבה יותר מ"דבק"',
          'תאי הגליה ("דבק" ביוונית) רבים לפחות כמו הנוירונים. **אסטרוציטים** (בצורת כוכב) מספקים חומרי מזון, שולטים בסביבה הכימית, עוזרים ליצור את מחסום הדם-מוח, מפנים מוליכים עצביים ומסייעים בוויסות סינפסות. **אוליגודנדרוציטים** מייצרים מיאלין במערכת העצבים המרכזית (תא אחד יכול לעטוף מקטעים של אקסונים רבים), ואילו **תאי שוואן** מייצרים מיאלין במערכת ההיקפית (תא אחד לכל מקטע) ועוזרים לעצבים היקפיים פגועים לצמוח מחדש. **מיקרוגליה** הם תאי מערכת החיסון של המוח: הם מסלקים פסולת ותאים מתים. פגיעה במיאלין גורמת למחלות כמו **טרשת נפוצה**.',
        ],
      },
      points: {
        en: ['Structural types: unipolar, bipolar, multipolar.', 'Functional types: sensory, motor, interneurons.', 'Astrocytes support and regulate; microglia defend and clean.', 'Myelin: oligodendrocytes in the CNS, Schwann cells in the PNS.'],
        he: ['סוגים מבניים: חד-קוטבי, דו-קוטבי, רב-קוטבי.', 'סוגים תפקודיים: תחושתיים, מוטוריים, אינטרנוירונים.', 'אסטרוציטים תומכים ומווסתים; מיקרוגליה מגינים ומנקים.', 'מיאלין: אוליגודנדרוציטים במערכת המרכזית, תאי שוואן בהיקפית.'],
      },
      terms: [
        ['Interneuron', 'A neuron that connects other neurons within the CNS.', 'אינטרנוירון', 'נוירון שמחבר בין נוירונים אחרים בתוך מערכת העצבים המרכזית.'],
        ['Astrocyte', 'Star-shaped glial cell that supports neurons and regulates their environment.', 'אסטרוציט', 'תא גליה בצורת כוכב שתומך בנוירונים ומווסת את סביבתם.'],
        ['Oligodendrocyte', 'Glial cell that forms myelin in the central nervous system.', 'אוליגודנדרוציט', 'תא גליה שיוצר מיאלין במערכת העצבים המרכזית.'],
        ['Schwann cell', 'Glial cell that forms myelin in the peripheral nervous system.', 'תא שוואן', 'תא גליה שיוצר מיאלין במערכת העצבים ההיקפית.'],
        ['Microglia', 'Small glial cells that act as the brain\'s immune system.', 'מיקרוגליה', 'תאי גליה קטנים שמשמשים כמערכת החיסון של המוח.'],
      ],
      quiz: [
        ['Which cell forms myelin in the brain and spinal cord?', 'איזה תא יוצר מיאלין במוח ובחוט השדרה?', ['Schwann cell', 'Oligodendrocyte', 'Microglia', 'Astrocyte'], ['תא שוואן', 'אוליגודנדרוציט', 'מיקרוגליה', 'אסטרוציט'], 1, 'Oligodendrocytes myelinate in the CNS; Schwann cells in the PNS.', 'אוליגודנדרוציטים יוצרים מיאלין במערכת המרכזית; תאי שוואן בהיקפית.'],
        ['Which glial cells are the brain\'s immune cells?', 'אילו תאי גליה הם תאי החיסון של המוח?', ['Microglia', 'Astrocytes', 'Schwann cells', 'Pyramidal cells'], ['מיקרוגליה', 'אסטרוציטים', 'תאי שוואן', 'תאי פירמידה'], 0, 'Microglia remove debris and respond to injury and infection.', 'מיקרוגליה מסלקים פסולת ומגיבים לפציעה ולזיהום.'],
      ],
    },
    {
      title: { en: 'The resting potential', he: 'פוטנציאל המנוחה' },
      diagram: 'ions',
      regions: [],
      body: {
        en: [
          'Neurons communicate with electricity carried by **ions** — charged atoms dissolved in the fluid inside the cell (**intracellular fluid**) and outside it (**extracellular fluid**). Inside, there is a lot of **potassium (K⁺)** and large negatively charged proteins; outside, there is a lot of **sodium (Na⁺)** and **chloride (Cl⁻)**.',
          'Two forces move ions: **diffusion** (moving from high to low concentration) and **electrostatic pressure** (opposite charges attract, like charges repel). Ions can only cross the membrane through **ion channels** — protein pores that may be always open or that open only in response to voltage or chemicals.',
          'At rest, the inside of a neuron is about **−70 millivolts** compared with the outside: this is the **resting potential**. It exists because the membrane lets K⁺ leak out more easily than Na⁺ can leak in, and because the **sodium-potassium pump** constantly pushes 3 Na⁺ out for every 2 K⁺ it brings in, using energy. This "charged battery" is ready to fire. (Lethal injection uses a high dose of potassium chloride, which destroys the resting potential of heart cells and stops the heart.)',
        ],
        he: [
          'נוירונים מתקשרים באמצעות חשמל שנישא על ידי **יונים** — אטומים טעונים המומסים בנוזל בתוך התא (**נוזל תוך-תאי**) ומחוצה לו (**נוזל חוץ-תאי**). בפנים יש הרבה **אשלגן (K⁺)** וחלבונים גדולים בעלי מטען שלילי; בחוץ יש הרבה **נתרן (Na⁺)** ו**כלוריד (Cl⁻)**.',
          'שני כוחות מזיזים יונים: **דיפוזיה** (תנועה מריכוז גבוה לנמוך) ו**לחץ אלקטרוסטטי** (מטענים הפוכים נמשכים, מטענים זהים נדחים). יונים יכולים לחצות את הממברנה רק דרך **תעלות יונים** — נקבוביות חלבוניות שיכולות להיות פתוחות תמיד או להיפתח רק בתגובה למתח חשמלי או לחומרים כימיים.',
          'במנוחה, פנים הנוירון טעון בכ-**‎−70 מיליוולט** ביחס לחוץ: זהו **פוטנציאל המנוחה**. הוא קיים כי הממברנה מאפשרת לאשלגן לדלוף החוצה בקלות רבה יותר מאשר לנתרן לדלוף פנימה, וכי **משאבת הנתרן-אשלגן** דוחפת כל הזמן 3 יוני נתרן החוצה על כל 2 יוני אשלגן שהיא מכניסה, תוך שימוש באנרגיה. "סוללה טעונה" זו מוכנה לירי.',
        ],
      },
      points: {
        en: ['Inside: lots of K⁺ and negative proteins. Outside: lots of Na⁺ and Cl⁻.', 'Diffusion and electrostatic pressure move ions through channels.', 'Resting potential ≈ −70 mV (inside negative).', 'The sodium-potassium pump moves 3 Na⁺ out for 2 K⁺ in.'],
        he: ['בפנים: הרבה K⁺ וחלבונים שליליים. בחוץ: הרבה Na⁺ ו-Cl⁻.', 'דיפוזיה ולחץ אלקטרוסטטי מזיזים יונים דרך תעלות.', 'פוטנציאל מנוחה ≈ ‎−70 מ"ו (פנים שלילי).', 'משאבת הנתרן-אשלגן מוציאה 3 Na⁺ ומכניסה 2 K⁺.'],
      },
      terms: [
        ['Ion', 'An atom or molecule with an electrical charge (e.g. Na⁺, K⁺, Cl⁻).', 'יון', 'אטום או מולקולה בעלי מטען חשמלי (למשל Na⁺, K⁺, Cl⁻).'],
        ['Resting potential', 'The neuron\'s voltage at rest, about −70 mV inside.', 'פוטנציאל מנוחה', 'המתח של הנוירון במנוחה, כ-‎−70 מ"ו בפנים.'],
        ['Diffusion', 'Movement of molecules from areas of high to low concentration.', 'דיפוזיה', 'תנועת מולקולות מאזור של ריכוז גבוה לאזור של ריכוז נמוך.'],
        ['Sodium-potassium pump', 'Membrane protein that pumps 3 Na⁺ out and 2 K⁺ in, using energy.', 'משאבת נתרן-אשלגן', 'חלבון ממברנה שמוציא 3 Na⁺ ומכניס 2 K⁺, תוך שימוש באנרגיה.'],
        ['Ion channel', 'A protein pore in the membrane that lets specific ions through.', 'תעלת יונים', 'נקבובית חלבונית בממברנה שמאפשרת מעבר ליונים מסוימים.'],
      ],
      quiz: [
        ['Which ion is found in high concentration INSIDE a neuron at rest?', 'איזה יון נמצא בריכוז גבוה בתוך הנוירון במנוחה?', ['Sodium (Na⁺)', 'Potassium (K⁺)', 'Chloride (Cl⁻)', 'Calcium (Ca²⁺)'], ['נתרן (Na⁺)', 'אשלגן (K⁺)', 'כלוריד (Cl⁻)', 'סידן (Ca²⁺)'], 1, 'Potassium is concentrated inside; sodium outside.', 'אשלגן מרוכז בפנים; נתרן בחוץ.'],
        ['The resting potential of a typical neuron is about…', 'פוטנציאל המנוחה של נוירון טיפוסי הוא בערך…', ['+40 mV', '0 mV', '−70 mV', '−200 mV'], ['‎+40 מ"ו', '0 מ"ו', '‎−70 מ"ו', '‎−200 מ"ו'], 2, 'About −70 mV — the inside is negative relative to the outside.', 'כ-‎−70 מ"ו — הפנים שלילי ביחס לחוץ.'],
      ],
    },
    {
      title: { en: 'The action potential and how it travels', he: 'פוטנציאל הפעולה ואיך הוא מתקדם' },
      diagram: 'actionPotential',
      regions: [],
      body: {
        en: [
          'Inputs from other neurons slightly change the membrane voltage. When the axon hillock is **depolarized** (made less negative) to the **threshold** — about −65 mV — an **action potential** fires: a rapid electrical spike. (This is the course book\'s figure: a depolarization of 5–10 mV from rest. Today: many other textbooks give about −55 mV; the exact value differs between neurons.)',
          '## The steps',
          '1) **Voltage-gated sodium channels** open and Na⁺ rushes in, so the inside quickly becomes positive (up to about +40 mV). 2) The sodium channels close and become inactive, while **voltage-gated potassium channels** open and K⁺ flows out — **repolarization**. 3) The potassium channels close slowly, so the voltage briefly dips below rest — **hyperpolarization**. During the **absolute refractory period** the neuron cannot fire again at all; during the **relative refractory period** it needs a stronger push.',
          'The action potential is **all-or-none**: it either happens fully or not at all, and its size does not change. Neurons signal stronger stimuli by firing **more often**, not with bigger spikes.',
          '## Propagation',
          'The spike regenerates itself along the axon, like a row of falling dominoes, and refractory periods keep it moving in one direction. In **myelinated** axons it jumps from node to node — **saltatory conduction** — which is much faster (up to about 120 m/s) and saves energy. Thicker axons also conduct faster.',
        ],
        he: [
          'קלטים מנוירונים אחרים משנים מעט את מתח הממברנה. כשגבעת האקסון עוברת **דה-פולריזציה** (נעשית פחות שלילית) עד ל**סף** — כ-‎−65 מ"ו — נורה **פוטנציאל פעולה**: קוץ חשמלי מהיר. (זה הנתון של ספר הקורס: דה-פולריזציה של 5–10 מ"ו ממצב המנוחה. כיום: ספרים רבים אחרים מציינים כ-‎−55 מ"ו; הערך המדויק משתנה בין נוירונים.)',
          '## השלבים',
          '1) **תעלות נתרן תלויות-מתח** נפתחות ו-Na⁺ זורם פנימה, כך שהפנים הופך מהר לחיובי (עד כ-‎+40 מ"ו). 2) תעלות הנתרן נסגרות ומשותקות, ובמקביל **תעלות אשלגן תלויות-מתח** נפתחות ו-K⁺ זורם החוצה — **רה-פולריזציה**. 3) תעלות האשלגן נסגרות לאט, ולכן המתח יורד לזמן קצר מתחת למנוחה — **היפר-פולריזציה**. במהלך **התקופה הרפרקטורית המוחלטת** הנוירון אינו יכול לירות שוב בכלל; במהלך **התקופה הרפרקטורית היחסית** הוא זקוק לדחיפה חזקה יותר.',
          'פוטנציאל הפעולה הוא **"הכול או לא כלום"**: הוא קורה במלואו או לא קורה, וגודלו אינו משתנה. נוירונים מאותתים על גירוי חזק יותר באמצעות ירי **בתדירות גבוהה יותר**, ולא באמצעות קוצים גדולים יותר.',
          '## הולכה',
          'הקוץ משחזר את עצמו לאורך האקסון, כמו שורה של אבני דומינו נופלות, והתקופות הרפרקטוריות שומרות על תנועה בכיוון אחד. באקסונים **עטופי מיאלין** הוא קופץ מצומת לצומת — **הולכה מדלגת (Saltatory)** — שהיא מהירה הרבה יותר (עד כ-120 מ\'/שנייה) וחוסכת אנרגיה. גם אקסונים עבים יותר מוליכים מהר יותר.',
        ],
      },
      points: {
        en: ['Threshold ≈ −65 mV triggers the spike.', 'Na⁺ in = rising phase; K⁺ out = falling phase.', 'All-or-none: intensity is coded by firing rate.', 'Myelin enables fast saltatory conduction between nodes.'],
        he: ['סף ≈ ‎−65 מ"ו מפעיל את הקוץ.', 'Na⁺ נכנס = שלב העלייה; K⁺ יוצא = שלב הירידה.', '"הכול או לא כלום": עוצמה מקודדת בקצב הירי.', 'מיאלין מאפשר הולכה מדלגת מהירה בין צמתים.'],
      },
      terms: [
        ['Threshold', 'The voltage (about −65 mV) at which an action potential is triggered.', 'סף', 'המתח (כ-‎−65 מ"ו) שבו מופעל פוטנציאל פעולה.'],
        ['Action potential', 'A brief all-or-none electrical spike that travels down the axon.', 'פוטנציאל פעולה', 'קוץ חשמלי קצר מסוג "הכול או לא כלום" שעובר לאורך האקסון.'],
        ['Depolarization', 'A change making the inside of the cell less negative.', 'דה-פולריזציה', 'שינוי שהופך את פנים התא לפחות שלילי.'],
        ['Refractory period', 'Time after a spike when the neuron cannot fire, or needs a stronger stimulus.', 'תקופה רפרקטורית', 'זמן לאחר קוץ שבו הנוירון אינו יכול לירות, או זקוק לגירוי חזק יותר.'],
        ['Saltatory conduction', 'Action potentials "jumping" from node to node along a myelinated axon.', 'הולכה מדלגת', 'פוטנציאלי פעולה ש"קופצים" מצומת לצומת לאורך אקסון עטוף מיאלין.'],
      ],
      quiz: [
        ['What causes the RISING phase of the action potential?', 'מה גורם לשלב העלייה של פוטנציאל הפעולה?', ['K⁺ flowing out', 'Na⁺ flowing in', 'Cl⁻ flowing in', 'The sodium-potassium pump'], ['K⁺ יוצא', 'Na⁺ נכנס', 'Cl⁻ נכנס', 'משאבת הנתרן-אשלגן'], 1, 'Voltage-gated sodium channels open and positive Na⁺ rushes in.', 'תעלות נתרן תלויות-מתח נפתחות ו-Na⁺ החיובי זורם פנימה.'],
        ['How does a neuron signal a STRONGER stimulus?', 'איך נוירון מאותת על גירוי חזק יותר?', ['Bigger action potentials', 'Firing more often', 'Reversing direction', 'Slower conduction'], ['פוטנציאלי פעולה גדולים יותר', 'ירי בתדירות גבוהה יותר', 'היפוך כיוון', 'הולכה איטית יותר'], 1, 'Spikes are all-or-none, so intensity is coded by rate.', 'הקוצים הם "הכול או לא כלום", ולכן העוצמה מקודדת בקצב.'],
      ],
    },
    {
      title: { en: 'The synapse', he: 'הסינפסה' },
      diagram: 'synapse',
      regions: [],
      body: {
        en: [
          'A **synapse** is the point where one neuron passes a message to another. In rare **electrical synapses** (gap junctions), current flows directly between cells — very fast, useful for synchronizing groups of cells. Most synapses are **chemical**.',
          '## Steps at a chemical synapse',
          '1) The action potential reaches the **axon terminal** and opens voltage-gated **calcium (Ca²⁺)** channels. 2) Calcium entry causes **synaptic vesicles** filled with **neurotransmitter** to fuse with the membrane and release their contents into the **synaptic gap** (exocytosis). 3) The neurotransmitter binds to **receptors** on the next (postsynaptic) cell. **Ionotropic** receptors are themselves ion channels and act quickly; **metabotropic** receptors work through G-proteins and second messengers — slower but longer-lasting effects.',
          '4) The result is a small voltage change: an **EPSP** (excitatory — depolarizing, making firing more likely) or an **IPSP** (inhibitory — hyperpolarizing, making firing less likely). The postsynaptic neuron **sums** thousands of these inputs over space (**spatial summation**) and time (**temporal summation**). 5) The signal ends when the neurotransmitter is taken back into the terminal (**reuptake**), broken down by **enzymes**, or diffuses away.',
          'In **neuromodulation**, substances such as neuropeptides change how strongly a whole group of neurons responds, rather than sending a simple point-to-point message. Tetanus toxin shows how vital inhibition is: by blocking inhibitory neurotransmitter release, it causes uncontrolled muscle spasms.',
        ],
        he: [
          '**סינפסה** היא הנקודה שבה נוירון אחד מעביר מסר לנוירון אחר. ב**סינפסות חשמליות** הנדירות (צמתי פער), זרם עובר ישירות בין התאים — מהיר מאוד, שימושי לסנכרון קבוצות תאים. רוב הסינפסות הן **כימיות**.',
          '## השלבים בסינפסה כימית',
          '1) פוטנציאל הפעולה מגיע ל**כפתור האקסון** ופותח תעלות **סידן (Ca²⁺)** תלויות-מתח. 2) כניסת הסידן גורמת ל**שלפוחיות סינפטיות** המלאות ב**מוליך עצבי** להתמזג עם הממברנה ולשחרר את תוכנן ל**מרווח הסינפטי** (אקסוציטוזה). 3) המוליך העצבי נקשר ל**קולטנים** בתא הבא (הפוסט-סינפטי). קולטנים **יונוטרופיים** הם בעצמם תעלות יונים ופועלים מהר; קולטנים **מטבוטרופיים** פועלים דרך חלבוני G ושליחים שניים — השפעות איטיות יותר אך ממושכות יותר.',
          '4) התוצאה היא שינוי מתח קטן: **EPSP** (מעורר — דה-פולריזציה, מגביר את הסיכוי לירי) או **IPSP** (מעכב — היפר-פולריזציה, מקטין את הסיכוי לירי). הנוירון הפוסט-סינפטי **מסכם** אלפי קלטים כאלה במרחב (**סכימה מרחבית**) ובזמן (**סכימה זמנית**). 5) האות מסתיים כשהמוליך העצבי נלקח בחזרה לכפתור (**ספיגה חוזרת, Reuptake**), מפורק על ידי **אנזימים**, או מתפזר.',
          'ב**נוירומודולציה**, חומרים כמו נוירופפטידים משנים את עוצמת התגובה של קבוצה שלמה של נוירונים, במקום לשלוח מסר פשוט מנקודה לנקודה. רעלן הטטנוס מראה עד כמה עיכוב חיוני: הוא חוסם שחרור של מוליך עצבי מעכב וגורם להתכווצויות שרירים בלתי נשלטות.',
        ],
      },
      points: {
        en: ['Calcium entry triggers neurotransmitter release.', 'Ionotropic = fast channels; metabotropic = slower, via second messengers.', 'EPSPs excite, IPSPs inhibit; the neuron sums them.', 'Signals end by reuptake, enzymatic breakdown or diffusion.'],
        he: ['כניסת סידן מפעילה שחרור של מוליך עצבי.', 'יונוטרופי = תעלות מהירות; מטבוטרופי = איטי, דרך שליחים שניים.', 'EPSP מעורר, IPSP מעכב; הנוירון מסכם ביניהם.', 'האות מסתיים בספיגה חוזרת, בפירוק אנזימטי או בדיפוזיה.'],
      },
      terms: [
        ['Synapse', 'The junction where one neuron communicates with another.', 'סינפסה', 'נקודת המפגש שבה נוירון אחד מתקשר עם אחר.'],
        ['Neurotransmitter', 'A chemical messenger released at a synapse.', 'מוליך עצבי', 'שליח כימי המשתחרר בסינפסה.'],
        ['EPSP', 'Excitatory postsynaptic potential: a small depolarization making firing more likely.', 'EPSP', 'פוטנציאל פוסט-סינפטי מעורר: דה-פולריזציה קטנה שמגבירה את הסיכוי לירי.'],
        ['IPSP', 'Inhibitory postsynaptic potential: a small hyperpolarization making firing less likely.', 'IPSP', 'פוטנציאל פוסט-סינפטי מעכב: היפר-פולריזציה קטנה שמקטינה את הסיכוי לירי.'],
        ['Reuptake', 'Return of released neurotransmitter into the presynaptic terminal.', 'ספיגה חוזרת', 'החזרת המוליך העצבי ששוחרר אל הכפתור הפרה-סינפטי.'],
        ['Metabotropic receptor', 'A receptor that acts through G-proteins and second messengers.', 'קולטן מטבוטרופי', 'קולטן שפועל דרך חלבוני G ושליחים שניים.'],
      ],
      quiz: [
        ['Which ion entering the axon terminal triggers neurotransmitter release?', 'כניסת איזה יון לכפתור האקסון מפעילה שחרור של מוליך עצבי?', ['Sodium', 'Potassium', 'Calcium', 'Chloride'], ['נתרן', 'אשלגן', 'סידן', 'כלוריד'], 2, 'Calcium entry causes vesicles to fuse and release their contents.', 'כניסת סידן גורמת לשלפוחיות להתמזג ולשחרר את תוכנן.'],
        ['An IPSP makes the postsynaptic neuron…', 'IPSP גורם לנוירון הפוסט-סינפטי…', ['more likely to fire', 'less likely to fire', 'release calcium', 'grow myelin'], ['לירות בסבירות גבוהה יותר', 'לירות בסבירות נמוכה יותר', 'לשחרר סידן', 'לגדל מיאלין'], 1, 'IPSPs are inhibitory — they move the cell away from threshold.', 'IPSP הוא מעכב — הוא מרחיק את התא מהסף.'],
      ],
    },
  ],
};
