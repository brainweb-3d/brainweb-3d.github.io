// Format explained at the top of ch01.js
export default {
  n: 8,
  icon: '🏃',
  color: '#f2c94c',
  title: { en: 'Movement', he: 'תנועה' },
  intro: {
    en: 'How muscles contract, how the spinal cord and brain control them, and what happens in movement disorders.',
    he: 'איך שרירים מתכווצים, איך חוט השדרה והמוח שולטים בהם, ומה קורה בהפרעות תנועה.',
  },
  lessons: [
    {
      title: { en: 'Muscles and how they contract', he: 'שרירים ואיך הם מתכווצים' },
      diagram: 'muscle',
      regions: [],
      body: {
        en: [
          'There are three kinds of muscle: **smooth** muscle (in blood vessels and the gut, controlled automatically), **cardiac** muscle (the heart) and **skeletal** muscle (attached to bones, under voluntary control).',
          'A skeletal muscle is made of long **muscle fibres**, each containing **myofibrils** built from repeating units. Inside, thin **actin** filaments and thick **myosin** filaments overlap. When a motor neuron releases **acetylcholine** at the **neuromuscular junction**, the fibre fires an action potential, which releases **calcium** inside the fibre. Calcium lets the myosin heads grab the actin and pull, sliding the filaments past each other — the **sliding filament** model. Energy comes from ATP.',
          '**Fast-twitch** fibres contract quickly and powerfully but tire fast (sprinting); **slow-twitch** fibres are slower but resist fatigue (marathon running). Exercise increases muscle size and efficiency; aging leads to gradual muscle loss. Muscles work in opposing pairs at a joint: **flexors** bend it, **extensors** straighten it.',
        ],
        he: [
          'יש שלושה סוגי שריר: שריר **חלק** (בכלי הדם ובמערכת העיכול, נשלט אוטומטית), שריר **הלב**, ושריר **השלד** (מחובר לעצמות, בשליטה רצונית).',
          'שריר שלד בנוי מ**סיבי שריר** ארוכים, שכל אחד מהם מכיל **מיופיברילים** הבנויים מיחידות חוזרות. בפנים חופפים חוטים דקים של **אקטין** וחוטים עבים של **מיוזין**. כשנוירון מוטורי משחרר **אצטילכולין** ב**צומת העצב-שריר**, הסיב יורה פוטנציאל פעולה, שמשחרר **סידן** בתוך הסיב. הסידן מאפשר לראשי המיוזין לתפוס את האקטין ולמשוך, כך שהחוטים מחליקים זה על פני זה — **מודל החוטים המחליקים**. האנרגיה מגיעה מ-ATP.',
          'סיבי **התכווצות מהירה** מתכווצים מהר ובעוצמה אך מתעייפים מהר (ריצה קצרה); סיבי **התכווצות איטית** איטיים יותר אך עמידים לעייפות (ריצת מרתון). אימון מגדיל את גודל השריר ויעילותו; הזדקנות מובילה לאובדן הדרגתי של שריר. שרירים פועלים בזוגות מנוגדים סביב מפרק: **כופפים (Flexors)** מכופפים אותו, **פושטים (Extensors)** מיישרים אותו.',
        ],
      },
      points: {
        en: ['Smooth, cardiac and skeletal muscle.', 'ACh at the neuromuscular junction → action potential → calcium release.', 'Myosin pulls actin: the sliding filament model.', 'Fast-twitch = powerful but tiring; slow-twitch = enduring.'],
        he: ['שריר חלק, שריר הלב ושריר השלד.', 'ACh בצומת העצב-שריר ← פוטנציאל פעולה ← שחרור סידן.', 'מיוזין מושך אקטין: מודל החוטים המחליקים.', 'התכווצות מהירה = חזק אך מתעייף; איטית = עמיד.'],
      },
      terms: [
        ['Neuromuscular junction', 'The synapse between a motor neuron and a muscle fibre.', 'צומת עצב-שריר', 'הסינפסה בין נוירון מוטורי לסיב שריר.'],
        ['Actin and myosin', 'Thin and thick protein filaments that slide past each other to contract muscle.', 'אקטין ומיוזין', 'חוטי חלבון דקים ועבים שמחליקים זה על פני זה כדי לכווץ את השריר.'],
        ['Fast-twitch fibre', 'Muscle fibre that contracts rapidly and powerfully but fatigues quickly.', 'סיב התכווצות מהירה', 'סיב שריר שמתכווץ מהר ובעוצמה אך מתעייף מהר.'],
        ['Flexor / extensor', 'Muscles that bend / straighten a joint.', 'כופף / פושט', 'שרירים שמכופפים / מיישרים מפרק.'],
      ],
      quiz: [
        ['Which neurotransmitter is released at the neuromuscular junction?', 'איזה מוליך עצבי משתחרר בצומת העצב-שריר?', ['Dopamine', 'Acetylcholine', 'GABA', 'Serotonin'], ['דופמין', 'אצטילכולין', 'GABA', 'סרוטונין'], 1, 'ACh at nicotinic receptors on the muscle triggers contraction.', 'ACh בקולטנים ניקוטיניים על השריר מפעיל התכווצות.'],
        ['A marathon runner relies mostly on…', 'רץ מרתון מסתמך בעיקר על…', ['fast-twitch fibres', 'slow-twitch fibres', 'smooth muscle', 'cardiac muscle only'], ['סיבי התכווצות מהירה', 'סיבי התכווצות איטית', 'שריר חלק', 'שריר הלב בלבד'], 1, 'Slow-twitch fibres resist fatigue.', 'סיבי התכווצות איטית עמידים לעייפות.'],
      ],
    },
    {
      title: { en: 'Neural control and reflexes', he: 'שליטה עצבית ורפלקסים' },
      diagram: 'reflexArc',
      regions: ['spinalCord'],
      body: {
        en: [
          'Skeletal muscles are controlled by **alpha motor neurons**, whose cell bodies lie in the ventral spinal cord (or brainstem, for the head). One motor neuron and all the muscle fibres it controls form a **motor unit**. Muscles needing fine control (eye, fingers) have small motor units — a few fibres each; large muscles (thigh) have units of hundreds or thousands. The force of a contraction increases by firing faster and by **recruiting** more motor units.',
          'Muscles also contain sensors. **Muscle spindles** detect stretch, and **Golgi tendon organs** detect tension, protecting against tearing.',
          '## Reflexes',
          'In the **monosynaptic stretch reflex** — the **knee-jerk** — a tap stretches the muscle spindle, the sensory neuron synapses directly on the motor neuron in the spinal cord, and the muscle contracts. **Polysynaptic reflexes** involve interneurons; for example, the **withdrawal reflex** pulls your hand from a hot stove, while the opposite leg stiffens to support you (crossed extension). Newborns show special reflexes (such as grasping and the rooting reflex) that disappear as the cortex matures; if they return in adults, it can be a sign of brain damage.',
        ],
        he: [
          'שרירי השלד נשלטים על ידי **נוירונים מוטוריים מסוג אלפא**, שגופי התאים שלהם נמצאים בחלק הגחוני של חוט השדרה (או בגזע המוח, עבור הראש). נוירון מוטורי אחד וכל סיבי השריר שהוא שולט בהם יוצרים **יחידה מוטורית**. לשרירים שדורשים שליטה עדינה (עין, אצבעות) יש יחידות מוטוריות קטנות — סיבים ספורים כל אחת; לשרירים גדולים (ירך) יש יחידות של מאות או אלפים. כוח ההתכווצות גדל על ידי ירי מהיר יותר ו**גיוס** של יותר יחידות מוטוריות.',
          'בשרירים יש גם חיישנים. **כישורי שריר** מזהים מתיחה, ו**אברי גידי גולג\'י** מזהים מתח, ומגינים מפני קריעה.',
          '## רפלקסים',
          'ב**רפלקס המתיחה החד-סינפטי** — **רפלקס הברך** — מכה קלה מותחת את כישור השריר, הנוירון התחושתי יוצר סינפסה ישירות על הנוירון המוטורי בחוט השדרה, והשריר מתכווץ. **רפלקסים רב-סינפטיים** כוללים אינטרנוירונים; למשל, **רפלקס הנסיגה** מושך את היד מכיריים חמות, בזמן שהרגל הנגדית מתקשחת כדי לתמוך בכם (הפשטה מוצלבת). ליילודים יש רפלקסים מיוחדים (כמו אחיזה ורפלקס חיפוש הפטמה) שנעלמים כשהקליפה מבשילה; אם הם חוזרים אצל מבוגרים, זה יכול להיות סימן לנזק מוחי.',
        ],
      },
      points: {
        en: ['Motor unit = one motor neuron + its muscle fibres.', 'Small motor units allow fine control.', 'Muscle spindles sense stretch; Golgi tendon organs sense tension.', 'Knee-jerk = monosynaptic; withdrawal = polysynaptic.'],
        he: ['יחידה מוטורית = נוירון מוטורי אחד + סיבי השריר שלו.', 'יחידות מוטוריות קטנות מאפשרות שליטה עדינה.', 'כישורי שריר חשים מתיחה; אברי גידי גולג\'י חשים מתח.', 'רפלקס הברך = חד-סינפטי; נסיגה = רב-סינפטי.'],
      },
      terms: [
        ['Alpha motor neuron', 'Spinal neuron that directly controls skeletal muscle fibres.', 'נוירון מוטורי אלפא', 'נוירון בחוט השדרה ששולט ישירות בסיבי שריר השלד.'],
        ['Motor unit', 'A motor neuron together with all the muscle fibres it controls.', 'יחידה מוטורית', 'נוירון מוטורי יחד עם כל סיבי השריר שהוא שולט בהם.'],
        ['Muscle spindle', 'Receptor within a muscle that detects stretch.', 'כישור שריר', 'קולטן בתוך השריר שמזהה מתיחה.'],
        ['Monosynaptic reflex', 'A reflex with one synapse between sensory and motor neuron (e.g. knee-jerk).', 'רפלקס חד-סינפטי', 'רפלקס עם סינפסה אחת בין נוירון תחושתי למוטורי (למשל רפלקס הברך).'],
        ['Withdrawal reflex', 'A polysynaptic reflex that pulls a limb away from a painful stimulus.', 'רפלקס נסיגה', 'רפלקס רב-סינפטי שמושך איבר הרחק מגירוי מכאיב.'],
      ],
      quiz: [
        ['The knee-jerk reflex involves how many synapses in the spinal cord?', 'בכמה סינפסות בחוט השדרה מעורב רפלקס הברך?', ['None', 'One', 'Two', 'Hundreds'], ['אף אחת', 'אחת', 'שתיים', 'מאות'], 1, 'It is monosynaptic: sensory neuron → motor neuron directly.', 'הוא חד-סינפטי: נוירון תחושתי ← נוירון מוטורי ישירות.'],
        ['Muscles used for fine control, such as eye muscles, have…', 'לשרירים המשמשים לשליטה עדינה, כמו שרירי העין, יש…', ['large motor units', 'small motor units', 'no motor units', 'only smooth muscle'], ['יחידות מוטוריות גדולות', 'יחידות מוטוריות קטנות', 'אין יחידות מוטוריות', 'רק שריר חלק'], 1, 'Few fibres per neuron = precise control.', 'מעט סיבים לכל נוירון = שליטה מדויקת.'],
      ],
    },
    {
      title: { en: 'Motor systems of the brain', he: 'מערכות התנועה של המוח' },
      diagram: 'motorPathway',
      regions: ['motor', 'frontal', 'basalGanglia', 'cerebellum', 'substantiaNigra', 'spinalCord'],
      body: {
        en: [
          '## Pathways down the spinal cord',
          'The **lateral corticospinal tract** (pyramidal tract) runs from the motor cortex, crosses in the medulla, and controls fine voluntary movements, especially of the hands and fingers. Other pathways from the brainstem (**ventromedial** pathways) control posture, balance and the trunk.',
          '## The cerebellum',
          'The cerebellum compares the movement you intended with what is actually happening and corrects errors, making movement smooth and well-timed. It is key for learning motor skills. Damage causes clumsy, shaky movement (ataxia) and problems with balance — similar to being drunk.',
          '## The basal ganglia',
          'The basal ganglia form loops with the cortex and thalamus that help **select and start** wanted movements and **suppress** unwanted ones. Dopamine from the **substantia nigra** is essential for these loops to work.',
          '## The motor cortex',
          'The **primary motor cortex** (precentral gyrus) is a body map — the **motor homunculus** — with large areas for the hands and mouth. In front of it, the **premotor cortex** and **supplementary motor area** plan and sequence movements; activity there can begin before we are aware of deciding to move (Libet\'s experiments). **Mirror neurons** in premotor areas fire both when we perform an action and when we watch someone else do it — possibly helping imitation and understanding others. **Brain–computer interfaces** now let paralysed people move cursors or robotic arms with signals recorded from motor cortex.',
        ],
        he: [
          '## מסלולים במורד חוט השדרה',
          '**המסלול הקורטיקו-ספינלי הצידי** (המסלול הפירמידלי) יוצא מהקליפה המוטורית, חוצה במוח המוארך ושולט בתנועות רצוניות עדינות, במיוחד של כפות הידיים והאצבעות. מסלולים אחרים מגזע המוח (**מסלולים גחוניים-מדיאליים**) שולטים ביציבה, בשיווי המשקל ובגו.',
          '## המוח הקטן',
          'המוח הקטן משווה בין התנועה שהתכוונתם לבצע לבין מה שקורה בפועל ומתקן שגיאות, וכך הופך את התנועה לחלקה ומתוזמנת. הוא חיוני ללמידת מיומנויות מוטוריות. פגיעה בו גורמת לתנועה מגושמת ורועדת (אטקסיה) ולבעיות בשיווי משקל — בדומה לשכרות.',
          '## הגרעינים הבסיסיים',
          'הגרעינים הבסיסיים יוצרים לולאות עם הקליפה והתלמוס שעוזרות **לבחור ולהתחיל** תנועות רצויות ו**לדכא** תנועות לא רצויות. דופמין מ**החומר השחור** חיוני לפעולת הלולאות האלה.',
          '## הקליפה המוטורית',
          '**הקליפה המוטורית הראשונית** (הפיתול הקדם-מרכזי) היא מפת גוף — **ההומונקולוס המוטורי** — עם אזורים גדולים לידיים ולפה. לפניה, **הקליפה הקדם-מוטורית** ו**האזור המוטורי המשלים** מתכננים ומסדרים רצפי תנועה; פעילות שם יכולה להתחיל עוד לפני שאנחנו מודעים להחלטה לזוז (ניסויי ליבט). **נוירוני מראה** באזורים הקדם-מוטוריים יורים גם כשאנחנו מבצעים פעולה וגם כשאנחנו צופים במישהו אחר מבצע אותה — ואולי מסייעים לחיקוי ולהבנת אחרים. **ממשקי מוח-מחשב** מאפשרים כיום לאנשים משותקים להזיז סמן או זרוע רובוטית בעזרת אותות שמוקלטים מהקליפה המוטורית.',
        ],
      },
      points: {
        en: ['Corticospinal tract: fine voluntary movement, crosses in the medulla.', 'Cerebellum: timing, smoothness, error correction, motor learning.', 'Basal ganglia: selecting and starting movements; need dopamine.', 'Premotor/supplementary areas plan; mirror neurons respond to observed actions.'],
        he: ['המסלול הקורטיקו-ספינלי: תנועה רצונית עדינה, חוצה במוח המוארך.', 'המוח הקטן: תזמון, חלקות, תיקון שגיאות, למידה מוטורית.', 'הגרעינים הבסיסיים: בחירה והתחלה של תנועות; זקוקים לדופמין.', 'אזורים קדם-מוטוריים מתכננים; נוירוני מראה מגיבים לפעולות נצפות.'],
      },
      terms: [
        ['Corticospinal tract', 'Pathway from motor cortex to spinal cord for voluntary movement.', 'המסלול הקורטיקו-ספינלי', 'מסלול מהקליפה המוטורית לחוט השדרה לתנועה רצונית.'],
        ['Motor homunculus', 'The body map in primary motor cortex.', 'הומונקולוס מוטורי', 'מפת הגוף בקליפה המוטורית הראשונית.'],
        ['Premotor cortex', 'Frontal area in front of the motor cortex that plans movements.', 'קליפה קדם-מוטורית', 'אזור מצחי לפני הקליפה המוטורית שמתכנן תנועות.'],
        ['Mirror neurons', 'Neurons active both when performing and when observing an action.', 'נוירוני מראה', 'נוירונים שפעילים גם בביצוע פעולה וגם בצפייה בה.'],
        ['Ataxia', 'Loss of coordination, often due to cerebellar damage.', 'אטקסיה', 'אובדן קואורדינציה, לרוב עקב נזק למוח הקטן.'],
      ],
      quiz: [
        ['Which structure is most responsible for smooth, well-timed movement and motor learning?', 'איזה מבנה אחראי יותר מכול לתנועה חלקה ומתוזמנת וללמידה מוטורית?', ['Cerebellum', 'Hippocampus', 'Occipital lobe', 'Amygdala'], ['המוח הקטן', 'ההיפוקמפוס', 'האונה העורפית', 'האמיגדלה'], 0, 'The cerebellum corrects movement errors and learns skills.', 'המוח הקטן מתקן שגיאות תנועה ולומד מיומנויות.'],
        ['Neurons that fire both when you act and when you watch someone act are called…', 'נוירונים שיורים גם כשאתם פועלים וגם כשאתם צופים במישהו פועל נקראים…', ['place cells', 'mirror neurons', 'grid cells', 'motor units'], ['תאי מקום', 'נוירוני מראה', 'תאי רשת', 'יחידות מוטוריות'], 1, 'Mirror neurons were first found in monkey premotor cortex.', 'נוירוני מראה התגלו לראשונה בקליפה הקדם-מוטורית של קופים.'],
      ],
    },
    {
      title: { en: 'Disorders of movement', he: 'הפרעות תנועה' },
      diagram: null,
      regions: ['substantiaNigra', 'basalGanglia', 'spinalCord', 'motor'],
      body: {
        en: [
          '**Toxins** can block movement: curare and botulinum toxin block the neuromuscular junction. In **myasthenia gravis**, the immune system attacks acetylcholine receptors on muscles, causing weakness that worsens with use; drugs that slow ACh breakdown help. **Muscular dystrophy** (e.g. Duchenne, X-linked) is a genetic weakening of the muscles themselves. **Polio** is a virus that destroys motor neurons in the spinal cord; vaccination has nearly eliminated it.',
          '**Spinal cord injury** causes paralysis and loss of sensation below the damaged level — the higher the injury, the more of the body is affected. **ALS** (amyotrophic lateral sclerosis, Lou Gehrig\'s disease) destroys motor neurons in the brain and spinal cord, leading to progressive paralysis while thinking is usually spared.',
          '## Parkinson\'s and Huntington\'s diseases',
          '**Parkinson\'s disease** results from the death of dopamine neurons in the **substantia nigra**. Symptoms include **tremor at rest**, rigidity, slowness (**bradykinesia**) and difficulty starting movements. Treatments include **L-DOPA**, dopamine agonists, and **deep brain stimulation**. Genes, toxins (such as the drug contaminant MPTP and some pesticides) and aging contribute.',
          '**Huntington\'s disease** is caused by a single **dominant** gene with an expanded repeat (CAG). It destroys neurons in the **caudate nucleus** and putamen, producing uncontrolled jerky movements (**chorea**), along with mood and cognitive changes, usually starting in mid-life. A genetic test can tell people whether they will develop it — a difficult choice, since there is no cure.',
        ],
        he: [
          '**רעלנים** יכולים לחסום תנועה: קורארה ורעלן הבוטולינום חוסמים את צומת העצב-שריר. ב**מיאסתניה גרביס**, מערכת החיסון תוקפת את קולטני האצטילכולין בשרירים וגורמת לחולשה שמחמירה עם השימוש; תרופות שמאטות את פירוק ה-ACh עוזרות. **ניוון שרירים** (למשל דושן, הקשור ל-X) הוא היחלשות גנטית של השרירים עצמם. **פוליו (שיתוק ילדים)** הוא נגיף שהורס נוירונים מוטוריים בחוט השדרה; חיסונים כמעט חיסלו אותו.',
          '**פגיעה בחוט השדרה** גורמת לשיתוק ולאובדן תחושה מתחת לרמת הפגיעה — ככל שהפגיעה גבוהה יותר, חלק גדול יותר מהגוף מושפע. **ALS** (טרשת אמיוטרופית צידית, מחלת לו גריג) הורסת נוירונים מוטוריים במוח ובחוט השדרה ומובילה לשיתוק מתקדם, בעוד שהחשיבה בדרך כלל נשמרת.',
          '## מחלות פרקינסון והנטינגטון',
          '**מחלת פרקינסון** נובעת ממות נוירוני הדופמין ב**חומר השחור**. התסמינים כוללים **רעד במנוחה**, נוקשות, איטיות (**ברדיקינזיה**) וקושי להתחיל תנועות. הטיפולים כוללים **L-DOPA**, אגוניסטים לדופמין ו**גירוי מוחי עמוק**. גנים, רעלנים (כמו המזהם MPTP וחומרי הדברה מסוימים) והזדקנות תורמים למחלה.',
          '**מחלת הנטינגטון** נגרמת מגן **דומיננטי** יחיד עם חזרה מוארכת (CAG). היא הורסת נוירונים ב**גרעין הזנבי** ובפוטמן, ויוצרת תנועות קופצניות בלתי נשלטות (**כוריאה**), יחד עם שינויים במצב הרוח ובחשיבה, לרוב באמצע החיים. בדיקה גנטית יכולה לומר לאנשים אם יפתחו את המחלה — בחירה קשה, כי אין לה מרפא.',
        ],
      },
      points: {
        en: ['Myasthenia gravis: immune attack on muscle ACh receptors.', 'ALS: death of motor neurons; polio: virus kills spinal motor neurons.', 'Parkinson\'s: loss of substantia nigra dopamine → tremor, rigidity, slowness.', 'Huntington\'s: dominant gene, caudate damage → chorea.'],
        he: ['מיאסתניה גרביס: התקפה חיסונית על קולטני ACh בשריר.', 'ALS: מוות של נוירונים מוטוריים; פוליו: נגיף הורג נוירונים מוטוריים בחוט השדרה.', 'פרקינסון: אובדן דופמין בחומר השחור ← רעד, נוקשות, איטיות.', 'הנטינגטון: גן דומיננטי, נזק לגרעין הזנבי ← כוריאה.'],
      },
      terms: [
        ['Myasthenia gravis', 'Autoimmune disease attacking ACh receptors on muscles, causing weakness.', 'מיאסתניה גרביס', 'מחלה אוטואימונית שתוקפת קולטני ACh בשרירים וגורמת לחולשה.'],
        ['ALS', 'Amyotrophic lateral sclerosis: progressive death of motor neurons.', 'ALS', 'טרשת אמיוטרופית צידית: מוות מתקדם של נוירונים מוטוריים.'],
        ['Parkinson\'s disease', 'Movement disorder from loss of dopamine neurons in the substantia nigra.', 'מחלת פרקינסון', 'הפרעת תנועה כתוצאה מאובדן נוירוני דופמין בחומר השחור.'],
        ['Huntington\'s disease', 'Inherited (dominant) disorder damaging the caudate; causes chorea.', 'מחלת הנטינגטון', 'הפרעה תורשתית (דומיננטית) שפוגעת בגרעין הזנבי; גורמת לכוריאה.'],
        ['Bradykinesia', 'Slowness of movement, typical of Parkinson\'s disease.', 'ברדיקינזיה', 'איטיות בתנועה, אופיינית לפרקינסון.'],
      ],
      quiz: [
        ['Parkinson\'s disease is caused by loss of dopamine neurons in the…', 'מחלת פרקינסון נגרמת מאובדן נוירוני דופמין ב…', ['hippocampus', 'substantia nigra', 'cerebellum', 'motor cortex'], ['היפוקמפוס', 'חומר השחור', 'מוח הקטן', 'קליפה המוטורית'], 1, 'The nigra supplies dopamine to the basal ganglia.', 'החומר השחור מספק דופמין לגרעינים הבסיסיים.'],
        ['Huntington\'s disease is inherited as a…', 'מחלת הנטינגטון עוברת בתורשה כ…', ['recessive trait', 'dominant trait', 'X-linked trait', 'it is not inherited'], ['תכונה רצסיבית', 'תכונה דומיננטית', 'תכונה הקשורה ל-X', 'היא אינה תורשתית'], 1, 'One copy of the faulty gene is enough.', 'עותק אחד של הגן הפגום מספיק.'],
      ],
    },
  ],
};
