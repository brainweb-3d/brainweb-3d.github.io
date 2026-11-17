// Guided stories: one example followed step by step across the zoom levels.
// Each step: href (where to go), text (what to notice), and optionally the scene's own buttons to press (acts,
// matched on their English label), a part to show alone (alone) or two parts to compare (cmp: [a, b, layout]).
// Interactive steps (owner, 2026-11-15; engine: src/visual/stories.js):
//   task: T(act, prompt, done)   the learner presses that button (matched on its English label) — Next unlocks then
//   choices: [C(label, stepId)…]  branches;  id: names a step;  next: the step Next goes to;  end: finishes here
const B = (en, he) => ({ en, he });
const S = (href, text, extra = {}) => ({ href, text, ...extra });
const T = (act, prompt, done) => ({ act, prompt, done });
const C = (label, go) => ({ label, go });

export const STORIES = [
  // ------------------------------------------------------------------ the five first stories, now interactive
  {
    id: 'coffee', icon: '☕', title: B('A cup of coffee → feeling awake', 'כוס קפה ← להרגיש ער'),
    steps: [
      S('#/explore/molecule/drugs', B(`Adenosine builds up in the brain while we are awake and makes us sleepy. Caffeine has a very similar double ring.`, `אדנוזין מצטבר במוח בזמן הערות וגורם לישנוניות. לקפאין יש טבעת כפולה דומה מאוד.`),
        { task: T('Compare adenosine & caffeine', B(`Put the two molecules side by side.`, `הציבו את שתי המולקולות זו לצד זו.`), B(`See the shared double ring? That is why caffeine fits adenosine's receptor.`, `רואים את הטבעת הכפולה המשותפת? בגלל זה הקפאין מתאים לקולטן של האדנוזין.`)) }),
      S('#/explore/molecule/binding', B(`At the adenosine receptor, caffeine is a key that fits but does not turn: an antagonist.`, `בקולטן האדנוזין, הקפאין הוא מפתח שמתאים אבל לא מסתובב: אנטגוניסט.`),
        { task: T('An antagonist', B(`Try the antagonist.`, `נסו את האנטגוניסט.`), B(`The slot is taken, so adenosine's "I'm tired" signal cannot get through.`, `החריץ תפוס, ולכן אות ה"אני עייף" של האדנוזין לא עובר.`)) }),
      S('#/explore/system/ans', B(`Caffeine also nudges the sympathetic system: the heart beats a little faster and we feel more alert.`, `קפאין גם דוחף מעט את המערכת הסימפתטית: הלב פועם מעט מהר יותר ואנחנו מרגישים ערניים יותר.`), { acts: ['Fight or flight'] }),
      S('#/explore/organism/day', B(`It is 9 p.m. Caffeine stays in the blood for hours (half of it is still there after about 5 hours). Another cup?`, `השעה 21:00. הקפאין נשאר בדם שעות (מחציתו עדיין שם אחרי כ-5 שעות). עוד כוס?`),
        { choices: [C(B('☕ Yes, one more', '☕ כן, עוד אחת'), 'late'), C(B('🛌 No, time for bed', '🛌 לא, הולכים לישון'), 'bed')] }),
      S('#/explore/organism/day', B(`At 2 a.m. the caffeine is still blocking adenosine receptors: you lie awake, and your sleep is lighter and shorter.`, `ב-2 בלילה הקפאין עדיין חוסם את קולטני האדנוזין: אתם שוכבים ערים, והשינה קלה וקצרה יותר.`),
        { id: 'late', end: true, task: T('Jump to 2 a.m.', B(`Jump to 2 a.m.`, `קפצו ל-2 בלילה.`), B(`Melatonin is up, but adenosine can't make you sleepy.`, `המלטונין עלה, אבל האדנוזין לא מצליח לגרום לישנוניות.`)) }),
      S('#/explore/organism/day', B(`Without more caffeine, adenosine reaches its receptors again; with melatonin rising at night, you fall asleep — and sleep clears the adenosine away.`, `בלי עוד קפאין, האדנוזין מגיע שוב לקולטנים שלו; עם עליית המלטונין בלילה אתם נרדמים — והשינה מפנה את האדנוזין.`),
        { id: 'bed', end: true, acts: ['Play a day'] }),
    ],
  },
  {
    id: 'painkiller', icon: '💊', title: B('How a painkiller stops pain', 'איך משכך כאבים עוצר כאב'),
    steps: [
      S('#/explore/cell/sensory', B(`A cut: free nerve endings in the skin sense the damage.`, `חתך: קצות עצב חופשיים בעור חשים את הנזק.`),
        { task: T('Prick', B(`Prick the skin and watch the pain neuron fire.`, `דקרו את העור וצפו בנוירון הכאב יורה.`), B(`It keeps firing as long as the damage lasts.`, `הוא ממשיך לירות כל עוד הנזק נמשך.`)) }),
      S('#/explore/tissue/spinalcord', B(`The pain signal enters the spinal cord, crosses to the other side and climbs toward the brain.`, `אות הכאב נכנס לחוט השדרה, חוצה לצד השני ועולה לכיוון המוח.`),
        { task: T('Pain to the brain', B(`Follow the pain signal through the cord.`, `עקבו אחרי אות הכאב בחוט השדרה.`), B(`This crossing synapse is where opioids act in the cord.`, `הסינפסה הזאת היא מקום שבו אופיואידים פועלים בחוט השדרה.`)) }),
      S('#/explore/molecule/toxins', B(`Morphine, from the opium poppy, has a shape that fits the receptors for the body's own painkillers — the endorphins.`, `למורפין, מפרג האופיום, יש צורה שמתאימה לקולטנים של משככי הכאבים של הגוף עצמו — האנדורפינים.`), { alone: 'morphine' }),
      S('#/explore/molecule/binding', B(`At the opioid receptor morphine is an agonist: the right key.`, `בקולטן האופיואידים המורפין הוא אגוניסט: המפתח הנכון.`),
        { task: T('An agonist drug', B(`Put the agonist in the lock.`, `הכניסו את האגוניסט למנעול.`), B(`The receptor switches on, and the pain neurons are quieted.`, `הקולטן מופעל, ונוירוני הכאב משתתקים.`)) }),
      S('#/explore/organ/path/pain', B(`In the brain, opioids act in the periaqueductal gray and the spinal cord, blocking pain on its way up to the cortex.`, `במוח, אופיואידים פועלים בחומר האפור סביב אמת המים ובחוט השדרה, וחוסמים את הכאב בדרכו אל הקליפה.`)),
    ],
  },
  {
    id: 'parkinsons', icon: '🫨', title: B('What goes wrong in Parkinson\'s disease', 'מה משתבש במחלת פרקינסון'),
    steps: [
      S('#/explore/organ/path/dopamine', B(`Dopamine neurons of the substantia nigra send their axons to the basal ganglia, which help start and smooth movements.`, `נוירוני הדופמין של החומר השחור שולחים אקסונים לגרעינים הבסיסיים, שעוזרים להתחיל תנועות ולהחליק אותן.`)),
      S('#/explore/cell/synapse', B(`In Parkinson's these neurons die, so too little dopamine is released at their synapses.`, `בפרקינסון הנוירונים האלה מתים, ולכן משתחרר מעט מדי דופמין בסינפסות שלהם.`),
        { task: T('Release blocker', B(`Show what "too little release" looks like.`, `הראו איך נראה "שחרור מעט מדי".`), B(`Almost no transmitter reaches the receptors.`, `כמעט שום מוליך לא מגיע לקולטנים.`)) }),
      S('#/explore/molecule/toxins', B(`The main treatment is L-DOPA — dopamine with one extra carboxyl group. The brain turns it into dopamine.`, `הטיפול העיקרי הוא L-DOPA — דופמין עם קבוצת קרבוקסיל אחת נוספת. המוח הופך אותו לדופמין.`),
        { task: T('Compare dopamine & L-DOPA', B(`Compare dopamine with L-DOPA.`, `השוו בין דופמין ל-L-DOPA.`), B(`Just one extra group — but it changes everything at the blood–brain barrier.`, `רק קבוצה אחת נוספת — אבל היא משנה הכול במחסום הדם-מוח.`)) }),
      S('#/explore/tissue/bbb', B(`Why not just give dopamine? It cannot cross the blood–brain barrier, but L-DOPA is carried across by transporter proteins (like glucose).`, `למה לא פשוט לתת דופמין? הוא לא יכול לחצות את מחסום הדם-מוח, אבל L-DOPA מועבר דרכו בחלבוני הובלה (כמו גלוקוז).`), { acts: ['Glucose'] }),
      S('#/explore/organism/memory', B(`The same basal-ganglia circuits also learn habits and motor skills.`, `אותם מעגלים של הגרעינים הבסיסיים לומדים גם הרגלים ומיומנויות מוטוריות.`), { acts: ['Learn to ride a bike'] }),
    ],
  },
  {
    id: 'vision', icon: '👁️', title: B('From light to sight', 'מאור לראייה'),
    steps: [
      S('#/explore/tissue/retina', B(`Light passes through the whole retina to the rods and cones at the back.`, `האור עובר דרך כל הרשתית אל הקנים והמדוכים מאחור.`),
        { task: T('Bright light', B(`Turn on bright light.`, `הדליקו אור חזק.`), B(`The cones respond and pass the signal forward to bipolar and ganglion cells.`, `המדוכים מגיבים ומעבירים את האות קדימה לתאים דו-קוטביים ולתאי גנגליון.`)) }),
      S('#/explore/cell/photoreceptors', B(`Up close, a surprise: in the dark, rods and cones release glutamate all the time.`, `מקרוב, הפתעה: בחושך, קנים ומדוכים משחררים גלוטמט כל הזמן.`),
        { task: T('Dim light', B(`Now give them dim light.`, `עכשיו תנו להם אור עמום.`), B(`Only the rod reacts — by releasing LESS glutamate. That drop is the signal.`, `רק הקנה מגיב — בכך שהוא משחרר פחות גלוטמט. הירידה הזאת היא האות.`)) }),
      S('#/explore/organ/path/vision', B(`Ganglion-cell axons form the optic nerve → optic chiasm → thalamus → primary visual cortex at the back of the brain.`, `האקסונים של תאי הגנגליון יוצרים את עצב הראייה ← הצלבת הראייה ← התלמוס ← קליפת הראייה הראשונית בחלק האחורי של המוח.`)),
      S('#/explore/organism/day', B(`Some ganglion cells also tell the body clock (SCN) that it is day, which stops melatonin.`, `חלק מתאי הגנגליון גם מספרים לשעון הביולוגי (SCN) שעכשיו יום, וזה עוצר את המלטונין.`),
        { task: T('Bright screen in the evening', B(`What does a bright screen at night do?`, `מה עושה מסך בהיר בלילה?`), B(`The clock thinks it is still day: melatonin stays low.`, `השעון חושב שעדיין יום: המלטונין נשאר נמוך.`)) }),
      S('#/explore/methods/fmri', B(`How do scientists see this? With fMRI, looking at pictures makes the visual cortex light up a few seconds later.`, `איך מדענים רואים את זה? ב-fMRI, צפייה בתמונות גורמת לקליפת הראייה "להידלק" כמה שניות מאוחר יותר.`), { acts: ['Look at pictures'] }),
    ],
  },
  {
    id: 'fear', icon: '🐍', title: B('A scary moment', 'רגע מפחיד'),
    steps: [
      S('#/explore/organ/path/fear', B(`Something long and dark on the path! A fast route from the thalamus reaches the amygdala before you even think about it. Look closer: what is it?`, `משהו ארוך וכהה על השביל! מסלול מהיר מהתלמוס מגיע לאמיגדלה עוד לפני שאתם חושבים על זה. הסתכלו שוב: מה זה?`),
        { choices: [C(B('🐍 It is a snake!', '🐍 זה נחש!'), 'snake'), C(B('🪵 It is only a stick', '🪵 זה רק מקל'), 'stick')] }),
      S('#/explore/system/ans', B(`The amygdala triggers the sympathetic system: fight or flight — heart racing, pupils wide, digestion paused.`, `האמיגדלה מפעילה את המערכת הסימפתטית: הילחם או ברח — לב דוהר, אישונים רחבים, עיכול מושהה.`),
        { id: 'snake', task: T('Fight or flight', B(`Switch on fight or flight.`, `הפעילו הילחם או ברח.`), B(`Norepinephrine and adrenaline spread the alarm.`, `נוראפינפרין ואדרנלין מפיצים את האזעקה.`)) }),
      S('#/explore/system/hpa', B(`A slower hormone chain follows: hypothalamus → pituitary → adrenal glands → cortisol.`, `אחריה מגיעה שרשרת הורמונים איטית יותר: היפותלמוס ← יותרת המוח ← בלוטות יותרת הכליה ← קורטיזול.`), { acts: ['A stressor appears'] }),
      S('#/explore/organism/memory', B(`Afterwards, the amygdala makes this moment easy to remember — that is how fear memories form.`, `אחר כך, האמיגדלה הופכת את הרגע הזה לקל לזכירה — כך נוצרים זיכרונות פחד.`), { acts: ['A frightening moment'], end: true }),
      S('#/explore/system/ans', B(`The slower route through the visual cortex catches up: it is a stick. The prefrontal cortex calms the amygdala, and the parasympathetic system takes over again.`, `המסלול האיטי דרך קליפת הראייה משיג אותו: זה מקל. הקליפה הקדם-מצחית מרגיעה את האמיגדלה, והמערכת הפאראסימפתטית חוזרת לשלוט.`),
        { id: 'stick', end: true, task: T('Rest and digest', B(`Calm the body down.`, `הרגיעו את הגוף.`), B(`Heart slows, digestion resumes.`, `הלב מאט, העיכול חוזר.`)) }),
    ],
  },

  // ------------------------------------------------------------------ senses
  {
    id: 'hearing', icon: '🔔', title: B('Hearing a sound', 'שמיעת צליל'),
    steps: [
      S('#/explore/tissue/corti', B(`A bird sings. Its high notes reach the cochlea, where each pitch shakes the basilar membrane most at one place.`, `ציפור שרה. הצלילים הגבוהים שלה מגיעים לשבלול, שבו כל גובה צליל מרעיד את הממברנה הבזילרית בעיקר במקום אחד.`),
        { task: T('High tone', B(`Play a high tone: where does the membrane move most?`, `השמיעו צליל גבוה: היכן הממברנה זזה הכי הרבה?`), B(`Near the narrow, stiff base.`, `ליד הבסיס הצר והקשיח.`)) }),
      S('#/explore/cell/haircell', B(`At that place, hair cells feel the movement through their bundle of stiff hairs.`, `במקום הזה תאי שיער חשים את התנועה דרך צרור השערות הנוקשות שלהם.`),
        { task: T('Bend toward the tall row', B(`Bend the bundle toward its tallest row.`, `כופפו את הצרור לכיוון השורה הגבוהה.`), B(`Channels open, K⁺ flows in, the auditory nerve fires.`, `תעלות נפתחות, K⁺ זורם פנימה, עצב השמיעה יורה.`)) }),
      S('#/explore/organ/path/hearing', B(`The auditory nerve carries the sound through the brainstem and thalamus to the auditory cortex in the temporal lobe.`, `עצב השמיעה מוביל את הצליל דרך גזע המוח והתלמוס אל קליפת השמיעה באונה הרקתית.`),
        { choices: [C(B('🔊 Turn the music way up', '🔊 מגבירים את המוזיקה מאוד'), 'loud'), C(B('🎧 Keep it at a safe volume', '🎧 שומרים על עוצמה בטוחה'), 'safe')] }),
      S('#/explore/cell/haircell', B(`Very loud sound bends the hair bundles too far, too often. Hair cells can break and die — and in humans they never grow back. That is noise-induced hearing loss (and often ringing: tinnitus).`, `צליל חזק מאוד מכופף את צרורות השערות יותר מדי ולעיתים קרובות מדי. תאי שיער יכולים להישבר ולמות — ובבני אדם הם לעולם לא צומחים מחדש. זה אובדן שמיעה מרעש (ולעיתים קרובות צפצוף: טנטון).`), { id: 'loud', acts: ['Play a sound'], end: true }),
      S('#/explore/tissue/corti', B(`At a safe volume the hair cells recover between sounds. Protect them: once lost, they are gone.`, `בעוצמה בטוחה תאי השיער מתאוששים בין צלילים. שמרו עליהם: מה שאבד לא חוזר.`), { id: 'safe', acts: ['Middle tone'], end: true }),
    ],
  },
  {
    id: 'food', icon: '🍕', title: B('Smelling and tasting food', 'הרחה וטעימה של אוכל'),
    steps: [
      S('#/explore/tissue/smell', B(`A pizza comes out of the oven. Odour molecules float up into the roof of your nose.`, `פיצה יוצאת מהתנור. מולקולות ריח עולות אל תקרת האף.`),
        { task: T('Smell coffee', B(`Smell something (try coffee).`, `הריחו משהו (נסו קפה).`), B(`Only neurons with the matching receptor fire — all into one glomerulus.`, `רק נוירונים עם הקולטן המתאים יורים — כולם לגלומרולוס אחד.`)) }),
      S('#/explore/organ/path/smell', B(`Smell goes straight to the olfactory bulb and on to the cortex and the amygdala — the only sense that skips the thalamus, which is why smells bring back memories so strongly.`, `הריח הולך ישר לפקעת הריח והלאה לקליפה ולאמיגדלה — החוש היחיד שמדלג על התלמוס, ולכן ריחות מעוררים זיכרונות בעוצמה כזאת.`)),
      S('#/explore/tissue/taste', B(`First bite. Tomato sauce is full of glutamate.`, `ביס ראשון. רוטב העגבניות מלא בגלוטמט.`),
        { task: T('Umami', B(`Taste umami.`, `טעמו אומאמי.`), B(`Type II cells with the umami receptor respond.`, `תאים מסוג II עם קולטן האומאמי מגיבים.`)) }),
      S('#/explore/tissue/taste', B(`What if your nose were blocked (a cold)?`, `ומה אם האף היה סתום (הצטננות)?`),
        { choices: [C(B('🤧 Taste it with a blocked nose', '🤧 טועמים עם אף סתום'), 'blocked'), C(B('😋 Taste it normally', '😋 טועמים כרגיל'), 'normal')] }),
      S('#/explore/tissue/taste', B(`With a blocked nose only the five basic tastes are left: the tongue still says "salty, sweet, umami", but the "pizza" flavour is gone — most of flavour is smell.`, `עם אף סתום נשארים רק חמשת הטעמים הבסיסיים: הלשון עדיין אומרת "מלוח, מתוק, אומאמי", אבל טעם ה"פיצה" נעלם — רוב הטעם הוא בעצם ריח.`), { id: 'blocked', acts: ['Salty'], end: true }),
      S('#/explore/tissue/smell', B(`Normally, chewing pushes odours from the back of the mouth up into the nose: taste and smell join into flavour.`, `בדרך כלל, הלעיסה דוחפת ריחות מאחורי הפה אל האף: טעם וריח מתאחדים לטעם המלא.`), { id: 'normal', acts: ['Smell a rose'], end: true }),
    ],
  },
  {
    id: 'hot', icon: '🔥', title: B('Touching something hot', 'נגיעה במשהו חם'),
    steps: [
      S('#/explore/cell/sensory', B(`Your fingertip touches a hot pan.`, `קצה האצבע נוגע במחבת חמה.`),
        { task: T('Heat', B(`Heat the skin.`, `חממו את העור.`), B(`TRPV1 channels open in the free endings: the hotter, the faster they fire.`, `תעלות TRPV1 נפתחות בקצות החופשיים: ככל שחם יותר, הם יורים מהר יותר.`)) }),
      S('#/explore/tissue/spinalcord', B(`The signal reaches the spinal cord — and the cord answers on its own, before the brain knows.`, `האות מגיע לחוט השדרה — וחוט השדרה עונה בעצמו, עוד לפני שהמוח יודע.`),
        { task: T('A reflex', B(`Run the reflex.`, `הפעילו את הרפלקס.`), B(`In by the dorsal root, out by the ventral root.`, `פנימה בשורש הגבי, החוצה בשורש הבטני.`)) }),
      S('#/explore/organism/stove', B(`The whole reflex, slowed down: hand pulled back in a few tens of milliseconds.`, `הרפלקס כולו, בהילוך איטי: היד נמשכת לאחור תוך כמה עשרות אלפיות שנייה.`), { acts: ['Touch the hot stove'] }),
      S('#/explore/tissue/nmj', B(`The motor neuron reaches the arm muscle.`, `הנוירון המוטורי מגיע לשריר הזרוע.`),
        { task: T('Send a nerve impulse', B(`Send the impulse across.`, `שלחו את הדחף.`), B(`Acetylcholine crosses the gap and the muscle fibre fires.`, `אצטילכולין חוצה את המרווח וסיב השריר יורה.`)) }),
      S('#/explore/macromolecule/muscle', B(`Inside the muscle fibre, calcium is released.`, `בתוך סיב השריר משתחרר סידן.`),
        { task: T('Ca²⁺ arrives', B(`Let calcium in.`, `הכניסו סידן.`), B(`Myosin heads pull the actin: the muscle shortens and the hand jerks away.`, `ראשי המיוזין מושכים את האקטין: השריר מתקצר והיד נרתעת.`)) }),
      S('#/explore/organ/path/pain', B(`Only now does the pain reach the cortex — "ouch!" comes after the hand has already moved.`, `רק עכשיו הכאב מגיע לקליפה — ה"אאוץ'!" מגיע אחרי שהיד כבר זזה.`)),
    ],
  },

  // ------------------------------------------------------------------ learning & memory
  {
    id: 'learning', icon: '📚', title: B('Learning something new', 'ללמוד משהו חדש'),
    steps: [
      S('#/explore/organism/memory', B(`You learn a new fact in class. The hippocampus holds on to it first.`, `לומדים עובדה חדשה בכיתה. ההיפוקמפוס מחזיק בה קודם.`),
        { task: T('Learn a fact', B(`Learn a fact.`, `למדו עובדה.`), B(`Hippocampus active; the cortex will store it later.`, `ההיפוקמפוס פעיל; הקליפה תאחסן אותה מאוחר יותר.`)) }),
      S('#/explore/atom/nmda', B(`At the synapses that carry the fact, the NMDA receptor is the "coincidence detector". Glutamate alone is not enough: Mg²⁺ plugs the channel.`, `בסינפסות שנושאות את העובדה, קולטן NMDA הוא "גלאי הצירוף". גלוטמט לבדו לא מספיק: Mg²⁺ פוקק את התעלה.`),
        { acts: ['Release glutamate'], task: T('Depolarize', B(`Now depolarize the membrane at the same time.`, `עכשיו עשו דה-פולריזציה לממברנה באותו זמן.`), B(`Mg²⁺ pops out, Ca²⁺ floods in: the synapse grows stronger (LTP).`, `ה-Mg²⁺ יוצא, Ca²⁺ זורם פנימה: הסינפסה מתחזקת (LTP).`)) }),
      S('#/explore/organ/path/memory', B(`Night comes. Should you sleep after studying?`, `מגיע הלילה. כדאי לישון אחרי הלמידה?`),
        { choices: [C(B('😴 Sleep well', '😴 ישנים טוב'), 'sleep'), C(B('🌙 Stay up all night', '🌙 נשארים ערים כל הלילה'), 'noSleep')] }),
      S('#/explore/organism/day', B(`During deep sleep the hippocampus replays the day and the cortex rewrites it into long-term memory. You remember it next week.`, `בזמן שינה עמוקה ההיפוקמפוס משחזר את היום והקליפה כותבת אותו מחדש לזיכרון ארוך-טווח. תזכרו את זה גם בשבוע הבא.`), { id: 'sleep', acts: ['Jump to 2 a.m.'], end: true }),
      S('#/explore/organism/memory', B(`Without sleep the replay never happens: much of what you learned fades within days, and tomorrow it is harder to learn anything new.`, `בלי שינה השחזור לא קורה: הרבה ממה שלמדתם דוהה תוך ימים, ומחר קשה יותר ללמוד משהו חדש.`), { id: 'noSleep', end: true }),
    ],
  },

  // ------------------------------------------------------------------ body & drugs
  {
    id: 'alcohol', icon: '🍺', title: B('Alcohol in the brain', 'אלכוהול במוח'),
    steps: [
      S('#/explore/tissue/bbb', B(`Alcohol is small and dissolves in fat, so it slips straight through the blood–brain barrier.`, `אלכוהול קטן ומתמוסס בשומן, ולכן הוא חומק ישר דרך מחסום הדם-מוח.`),
        { task: T('Fat-soluble drug', B(`Send a fat-soluble molecule.`, `שלחו מולקולה מסיסה בשומן.`), B(`Straight through.`, `ישר דרכו.`)) }),
      S('#/explore/cell/neuron', B(`In the brain it boosts GABA, the main "brake" transmitter (and weakens glutamate, the "accelerator").`, `במוח הוא מחזק את GABA, מוליך ה"בלם" העיקרי (ומחליש את הגלוטמט, ה"מאיץ").`),
        { task: T('Extra inhibition', B(`Turn on the extra inhibition, then try to make the neuron fire.`, `הפעילו את העיכוב הנוסף, ואז נסו לגרום לנוירון לירות.`), B(`Each input now moves it much less: thinking and reacting slow down.`, `כל קלט מזיז אותו עכשיו הרבה פחות: החשיבה והתגובה מאטות.`)) }),
      S('#/explore/organ/cerebellum', B(`The cerebellum is especially sensitive: balance and coordination go first. Another drink?`, `המוח הקטן רגיש במיוחד: שיווי המשקל והקואורדינציה נפגעים ראשונים. עוד משקה?`),
        { choices: [C(B('🍺 Yes, and another…', '🍺 כן, ועוד אחד…'), 'more'), C(B('💧 Stop and drink water', '💧 עוצרים ושותים מים'), 'stop')] }),
      S('#/explore/organ/medulla', B(`At high levels the inhibition reaches the brainstem, which runs breathing. That is why too much alcohol at once can be deadly.`, `ברמות גבוהות העיכוב מגיע לגזע המוח, שמפעיל את הנשימה. בגלל זה יותר מדי אלכוהול בבת אחת יכול להיות קטלני.`), { id: 'more', end: true }),
      S('#/explore/organism/homeostasis', B(`The liver clears about one drink an hour. Alcohol also makes you pass more urine — which is why water helps.`, `הכבד מפנה בערך משקה אחד בשעה. אלכוהול גם גורם להפרשת יותר שתן — ולכן מים עוזרים.`), { id: 'stop', end: true }),
    ],
  },
  {
    id: 'nicotine', icon: '🚬', title: B('Nicotine and addiction', 'ניקוטין והתמכרות'),
    steps: [
      S('#/explore/molecule/drugs', B(`Nicotine has a shape close enough to acetylcholine to fool its receptors.`, `לניקוטין יש צורה קרובה מספיק לאצטילכולין כדי להטעות את הקולטנים שלו.`),
        { task: T('Compare ACh & nicotine', B(`Compare acetylcholine and nicotine.`, `השוו בין אצטילכולין לניקוטין.`), B(`A charged nitrogen in both — the part the receptor grips.`, `חנקן טעון בשניהם — החלק שהקולטן אוחז בו.`)) }),
      S('#/explore/macromolecule/receptors', B(`It switches on the nicotinic receptor, an ion channel.`, `הוא מפעיל את הקולטן הניקוטיני, תעלת יונים.`),
        { task: T('Fast: ACh', B(`Open the ionotropic receptor.`, `פתחו את הקולטן היוני.`), B(`The channel opens in a millisecond.`, `התעלה נפתחת תוך אלפית שנייה.`)) }),
      S('#/explore/organ/path/reward', B(`On dopamine neurons this releases dopamine in the reward circuit — the brain learns "do that again".`, `בנוירוני דופמין זה משחרר דופמין במעגל התגמול — המוח לומד "עשה את זה שוב".`)),
      S('#/explore/molecule/binding', B(`After a while receptors adapt, and without nicotine you feel worse: craving. Want to quit?`, `אחרי זמן מה הקולטנים מסתגלים, ובלי ניקוטין מרגישים רע יותר: חשק. רוצים להפסיק?`),
        { choices: [C(B('💊 Quit with a medicine', '💊 מפסיקים בעזרת תרופה'), 'quit'), C(B('🔁 Just one more', '🔁 רק עוד אחת'), 'again')] }),
      S('#/explore/molecule/binding', B(`Varenicline is a partial agonist at the same receptor: it eases craving (it turns the lock a little) and blocks nicotine from giving its full kick.`, `וארניקלין הוא אגוניסט חלקי באותו קולטן: הוא מקל על החשק (מסובב את המנעול מעט) וחוסם את הניקוטין מלתת את מלוא הבעיטה.`),
        { id: 'quit', end: true, task: T('A partial agonist', B(`Try the partial agonist.`, `נסו את האגוניסט החלקי.`), B(`The channel opens only a little.`, `התעלה נפתחת רק מעט.`)) }),
      S('#/explore/organ/path/reward', B(`Each cigarette teaches the reward circuit again — that loop is addiction.`, `כל סיגריה מלמדת שוב את מעגל התגמול — הלולאה הזאת היא התמכרות.`), { id: 'again', end: true }),
    ],
  },
  {
    id: 'dentist', icon: '🦷', title: B('A local anaesthetic at the dentist', 'הרדמה מקומית אצל רופא השיניים'),
    steps: [
      S('#/explore/cell/sensory', B(`The dentist's drill would excite pain endings in the tooth.`, `המקדחה של רופא השיניים הייתה מעוררת קצות כאב בשן.`),
        { task: T('Prick', B(`Show the pain neuron firing.`, `הראו את נוירון הכאב יורה.`), B(`Every impulse needs Na⁺ channels to open.`, `כל דחף צריך שתעלות Na⁺ ייפתחו.`)) }),
      S('#/explore/atom/membrane', B(`Lidocaine enters the nerve and plugs its voltage-gated Na⁺ channels from the inside.`, `לידוקאין נכנס לעצב ופוקק את תעלות ה-Na⁺ תלויות המתח שלו מבפנים.`),
        { task: T('Block Na⁺ channels', B(`Block the Na⁺ channels.`, `חסמו את תעלות ה-Na⁺.`), B(`Same idea as the pufferfish toxin TTX — but lidocaine wears off in an hour or two.`, `אותו רעיון כמו רעל דג הנפוחית TTX — אבל לידוקאין פג תוך שעה-שעתיים.`)) }),
      S('#/explore/cell/neuron', B(`Now the pain neuron cannot fire, however strong the input: no signal ever leaves the tooth.`, `עכשיו נוירון הכאב לא יכול לירות, לא משנה כמה הקלט חזק: שום אות לא יוצא מהשן.`),
        { acts: ['Block Na⁺ channels'], task: T('Fire an action potential', B(`Try to fire it anyway.`, `נסו לגרום לו לירות בכל זאת.`), B(`Threshold reached — but no action potential.`, `הסף הושג — אבל אין פוטנציאל פעולה.`)) }),
    ],
  },
  {
    id: 'botox', icon: '💉', title: B('Botox and curare at the muscle', 'בוטוקס וקורארה בשריר'),
    steps: [
      S('#/explore/tissue/nmj', B(`A motor neuron tells a muscle fibre to contract by releasing acetylcholine.`, `נוירון מוטורי אומר לסיב שריר להתכווץ על ידי שחרור אצטילכולין.`),
        { task: T('Send a nerve impulse', B(`Send a normal impulse.`, `שלחו דחף רגיל.`), B(`ACh crosses, the fibre twitches.`, `ACh חוצה, הסיב מתכווץ.`)) }),
      S('#/explore/tissue/nmj', B(`Two poisons stop this in two different ways. Which one?`, `שני רעלים עוצרים את זה בשתי דרכים שונות. איזה מהם?`),
        { choices: [C(B('💉 Botulinum toxin (Botox)', '💉 רעלן בוטולינום (בוטוקס)'), 'botox'), C(B('🏹 Curare (arrow poison)', '🏹 קורארה (רעל חצים)'), 'curare')] }),
      S('#/explore/tissue/nmj', B(`Botulinum toxin cuts the proteins that let vesicles fuse: no acetylcholine is released at all. Tiny doses relax wrinkles or overactive muscles for months.`, `רעלן הבוטולינום חותך את החלבונים שמאפשרים לשלפוחיות להתמזג: לא משתחרר אצטילכולין בכלל. מינונים זעירים מרפים קמטים או שרירים פעילים מדי לחודשים.`),
        { id: 'botox', next: 'relax', task: T('Botulinum toxin', B(`Apply Botox and send an impulse.`, `הפעילו בוטוקס ושלחו דחף.`), B(`The impulse arrives — and nothing is released.`, `הדחף מגיע — ושום דבר לא משתחרר.`)) }),
      S('#/explore/tissue/nmj', B(`With curare, acetylcholine is still released, but curare sits in its receptors without opening them (an antagonist).`, `עם קורארה האצטילכולין עדיין משתחרר, אבל הקורארה יושבת בקולטנים שלו בלי לפתוח אותם (אנטגוניסט).`),
        { id: 'curare', next: 'relax', task: T('Curare', B(`Apply curare.`, `הפעילו קורארה.`), B(`ACh arrives but finds every lock taken.`, `ה-ACh מגיע אבל מוצא את כל המנעולים תפוסים.`)) }),
      S('#/explore/macromolecule/muscle', B(`Either way, no signal reaches the fibre: no calcium, no grip, the muscle stays relaxed (paralysed).`, `בכל מקרה, שום אות לא מגיע לסיב: אין סידן, אין אחיזה, השריר נשאר רפוי (משותק).`), { id: 'relax', acts: ['Relax'] }),
    ],
  },

  // ------------------------------------------------------------------ diseases
  {
    id: 'ms', icon: '🧈', title: B('Multiple sclerosis', 'טרשת נפוצה'),
    steps: [
      S('#/explore/cell/oligo', B(`In the brain and spinal cord, oligodendrocytes wrap axons in myelin.`, `במוח ובחוט השדרה, אוליגודנדרוציטים עוטפים אקסונים במיאלין.`),
        { task: T('Race the two axons', B(`Race a myelinated axon against a bare one.`, `ערכו מרוץ בין אקסון עם מיאלין לאקסון חשוף.`), B(`Myelin makes the signal jump: about 120 m/s instead of about 5 m/s on a bare axon (the course book).`, `המיאלין גורם לאות לקפוץ: כ-120 מ׳/שנייה במקום כ-5 מ׳/שנייה באקסון חשוף (ספר הקורס).`)) }),
      S('#/explore/cell/microglia', B(`In MS the immune system mistakes myelin for an enemy. Immune cells and microglia attack it.`, `בטרשת נפוצה מערכת החיסון טועה ומזהה את המיאלין כאויב. תאי חיסון ומיקרוגליה תוקפים אותו.`), { acts: ['An injury'] }),
      S('#/explore/cell/oligo', B(`Patches of myelin are stripped away (the "plaques" seen on MRI).`, `כתמים של מיאלין מתקלפים (ה"פלאקים" שרואים ב-MRI).`),
        { task: T('Multiple sclerosis', B(`Show the damage.`, `הראו את הנזק.`), B(`The signal slows down and can fail halfway.`, `האות מאט ועלול להיכשל באמצע הדרך.`)) }),
      S('#/explore/cell/neuron', B(`For the person this means numbness, weak or clumsy limbs, blurred vision — depending on which axons are hit.`, `עבור האדם זה אומר נימול, גפיים חלשות או מגושמות, ראייה מטושטשת — לפי האקסונים שנפגעו.`),
        { task: T('Remove myelin', B(`Remove the myelin and fire the neuron.`, `הסירו את המיאלין וגרמו לנוירון לירות.`), B(`Continuous, slow conduction.`, `הולכה רציפה ואיטית.`)) }),
      S('#/explore/methods/mri', B(`MRI shows the plaques; treatments calm the immune attack, and some myelin can be repaired.`, `MRI מראה את הפלאקים; טיפולים מרגיעים את התקיפה החיסונית, וחלק מהמיאלין יכול להיות מתוקן.`)),
    ],
  },
  {
    id: 'epilepsy', icon: '⚡', title: B('An epileptic seizure', 'התקף אפילפטי'),
    steps: [
      S('#/explore/cell/neuron', B(`Normally excitation and inhibition are balanced.`, `בדרך כלל עירור ועיכוב מאוזנים.`),
        { task: T('Over-excitation', B(`Tip the balance: over-excite the neuron.`, `הטו את האיזון: עוררו את הנוירון יתר על המידה.`), B(`It fires again and again in bursts.`, `הוא יורה שוב ושוב בפרצים.`)) }),
      S('#/explore/tissue/cortex', B(`In a seizure, thousands of cortical neurons fire together and the activity spreads from layer to layer and area to area.`, `בהתקף, אלפי נוירונים בקליפה יורים יחד והפעילות מתפשטת משכבה לשכבה ומאזור לאזור.`), { acts: ['Follow a signal'] }),
      S('#/explore/methods/eeg', B(`On an EEG this shows as large, sharp, rhythmic spikes. What can stop it?`, `ב-EEG זה נראה כקוצים גדולים, חדים וקצביים. מה יכול לעצור את זה?`),
        { choices: [C(B('💊 A drug that boosts GABA', '💊 תרופה שמחזקת GABA'), 'gaba'), C(B('🔋 A drug that blocks Na⁺ channels', '🔋 תרופה שחוסמת תעלות Na⁺'), 'na')] }),
      S('#/explore/cell/neuron', B(`Benzodiazepines strengthen GABA-A inhibition: the runaway firing calms down. (Used to stop a long seizure.)`, `בנזודיאזפינים מחזקים את העיכוב של GABA-A: הירי המשתולל נרגע. (משמשים לעצירת התקף ממושך.)`),
        { id: 'gaba', end: true, task: T('Extra inhibition', B(`Add the extra inhibition.`, `הוסיפו את העיכוב הנוסף.`), B(`Inputs barely move the neuron now.`, `הקלטים כמעט לא מזיזים עכשיו את הנוירון.`)) }),
      S('#/explore/atom/membrane', B(`Many anti-seizure medicines (like carbamazepine) partly block Na⁺ channels, so neurons can't fire at very high rates.`, `תרופות רבות נגד התקפים (כמו קרבמזפין) חוסמות חלקית תעלות Na⁺, כך שנוירונים לא יכולים לירות בקצב גבוה מאוד.`),
        { id: 'na', end: true, task: T('Block Na⁺ channels', B(`Block the Na⁺ channels.`, `חסמו את תעלות ה-Na⁺.`), B(`No more action potentials.`, `אין יותר פוטנציאלי פעולה.`)) }),
    ],
  },
  {
    id: 'alzheimers', icon: '🧓', title: B('Alzheimer\'s disease', 'מחלת אלצהיימר'),
    steps: [
      S('#/explore/organ/path/memory', B(`Alzheimer's usually starts in the hippocampus and nearby cortex — the places that form new memories.`, `אלצהיימר מתחיל בדרך כלל בהיפוקמפוס ובקליפה הסמוכה — המקומות שיוצרים זיכרונות חדשים.`)),
      S('#/explore/organism/memory', B(`So new facts are the first to go, while old memories last longer.`, `לכן עובדות חדשות הולכות ראשונות, בעוד שזיכרונות ישנים מחזיקים מעמד יותר זמן.`),
        { task: T('Learn a fact', B(`Try to learn a new fact.`, `נסו ללמוד עובדה חדשה.`), B(`This is the step that fails first.`, `זה השלב שנכשל ראשון.`)) }),
      S('#/explore/cell/microglia', B(`Sticky amyloid plaques build up between neurons, and tangled tau inside them. Microglia try to clear the plaques — and the long fight inflames the tissue.`, `פלאקים דביקים של עמילואיד מצטברים בין הנוירונים, וסבכים של טאו בתוכם. המיקרוגליה מנסה לפנות את הפלאקים — והמאבק הממושך מדליק את הרקמה.`),
        { task: T('An injury', B(`Watch the microglia respond.`, `צפו במיקרוגליה מגיבה.`), B(`It swallows debris — but can't keep up.`, `היא בולעת פסולת — אבל לא עומדת בקצב.`)) }),
      S('#/explore/cell/synapse', B(`Synapses are lost first, then whole neurons; acetylcholine neurons are hit early.`, `סינפסות אובדות קודם, אחר כך נוירונים שלמים; נוירוני אצטילכולין נפגעים מוקדם.`)),
      S('#/explore/organ/path/acetylcholine', B(`Common drugs slow the breakdown of acetylcholine, so the remaining synapses work a little better. They ease symptoms but don't stop the disease.`, `תרופות נפוצות מאטות את פירוק האצטילכולין, כך שהסינפסות שנותרו עובדות קצת טוב יותר. הן מקלות על התסמינים אבל לא עוצרות את המחלה.`)),
    ],
  },
  {
    id: 'depression', icon: '🌧️', title: B('Depression and SSRIs', 'דיכאון ותרופות SSRI'),
    steps: [
      S('#/explore/organ/path/serotonin', B(`Serotonin neurons in the brainstem reach almost the whole brain and help set mood, sleep and appetite.`, `נוירוני סרוטונין בגזע המוח מגיעים כמעט לכל המוח ועוזרים לקבוע מצב רוח, שינה ותיאבון.`)),
      S('#/explore/system/hpa', B(`Long stress keeps cortisol high, which is one of the things linked to depression.`, `לחץ ממושך משאיר את הקורטיזול גבוה, וזה אחד הדברים שקשורים לדיכאון.`),
        { task: T('Chronic stress', B(`Show chronic stress.`, `הראו לחץ כרוני.`), B(`Cortisol stays up instead of switching off.`, `הקורטיזול נשאר גבוה במקום לרדת.`)) }),
      S('#/explore/macromolecule/transporter', B(`After release, transporters pull serotonin back into the terminal (reuptake), ending its signal.`, `אחרי השחרור, מובילים מחזירים את הסרוטונין לטרמינל (קליטה מחדש), וכך מסיימים את האות שלו.`),
        { task: T('Normal reuptake', B(`Watch normal reuptake.`, `צפו בקליטה מחדש רגילה.`), B(`The synapse is cleared within milliseconds.`, `הסינפסה מתפנה תוך אלפיות שנייה.`)) }),
      S('#/explore/cell/synapse', B(`An SSRI blocks the serotonin transporter, so serotonin lingers in the synapse.`, `SSRI חוסם את מוביל הסרוטונין, כך שהסרוטונין נשאר בסינפסה.`),
        { task: T('Reuptake blocker', B(`Apply the reuptake blocker (SSRI).`, `הפעילו את חוסם הקליטה מחדש (SSRI).`), B(`More transmitter, for longer.`, `יותר מוליך, לאורך זמן רב יותר.`)) }),
      S('#/explore/organ/path/serotonin', B(`The block happens in hours, yet mood improves only after weeks: the brain slowly adapts (receptors change, new synapses grow). Therapy, sleep and exercise help the same adaptation.`, `החסימה קורית תוך שעות, אבל מצב הרוח משתפר רק אחרי שבועות: המוח מסתגל לאט (קולטנים משתנים, סינפסות חדשות צומחות). טיפול, שינה ופעילות גופנית עוזרים לאותה הסתגלות.`)),
    ],
  },
];

export const storyById = Object.fromEntries(STORIES.map((s) => [s.id, s]));
