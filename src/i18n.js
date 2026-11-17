// Language handling: English / Hebrew.
// Every piece of bilingual content is an object like { en: '...', he: '...' }.
// t(obj) returns the text in the current language.

import { load, save } from './store.js';

let lang = load('lang', 'en');
const listeners = new Set();

export const getLang = () => lang;

export function setLang(next) {
  lang = next;
  save('lang', lang);
  applyDocumentDirection();
  listeners.forEach((fn) => fn(lang));
}

export const onLangChange = (fn) => listeners.add(fn);

export function applyDocumentDirection() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
}

/** Pick the current-language version of a bilingual value. */
export function t(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value;
  return value[lang] ?? value.en ?? '';
}

/** Interface words (buttons, menus, headings). */
const UI = {
  explore: { en: 'Explore 3D', he: 'מוח בתלת-ממד' },
  learn: { en: 'Learn', he: 'לימוד' },
  practice: { en: 'Practice', he: 'תרגול' },
  upload: { en: 'Upload Lecture', he: 'העלאת הרצאה' },
  progress: { en: 'My Progress', he: 'ההתקדמות שלי' },
  searchPlaceholder: { en: 'Search a brain part or a function (e.g. "fear", "memory", "hippocampus")', he: 'חיפוש חלק במוח או תפקוד (למשל "פחד", "זיכרון", "היפוקמפוס")' },
  regions: { en: 'Brain parts', he: 'חלקי מוח' },
  lessons: { en: 'Lessons', he: 'שיעורים' },
  terms: { en: 'Terms', he: 'מושגים' },
  noResults: { en: 'No matches. Try another word.', he: 'לא נמצאו תוצאות. נסו מילה אחרת.' },
  functions: { en: 'Main functions', he: 'תפקודים עיקריים' },
  relatedLessons: { en: 'Test yourself on', he: 'בחנו את עצמכם על' },
  close: { en: 'Close', he: 'סגירה' },
  seeThrough: { en: 'See-through cortex', he: 'קליפה שקופה' },
  splitHemis: { en: 'Split hemispheres', he: 'הפרדת המיספרות' },
  showLabels: { en: 'Labels', he: 'תוויות' },
  resetView: { en: 'Reset view', he: 'איפוס תצוגה' },
  autoRotate: { en: 'Auto-rotate', he: 'סיבוב אוטומטי' },
  brainHint: { en: 'Drag to rotate · scroll to zoom · click a part to learn about it', he: 'גררו לסיבוב · גללו להגדלה · לחצו על חלק כדי ללמוד עליו' },
  chapter: { en: 'Chapter', he: 'פרק' },
  chapters: { en: 'Chapters', he: 'פרקים' },
  start: { en: 'Start', he: 'התחלה' },
  continue: { en: 'Continue', he: 'המשך' },
  next: { en: 'Next', he: 'הבא' },
  prev: { en: 'Previous', he: 'הקודם' },
  markDone: { en: 'Mark as done', he: 'סימון כהושלם' },
  done: { en: 'Done ✓', he: 'הושלם ✓' },
  keyPoints: { en: 'Key points', he: 'נקודות מפתח' },
  keyTerms: { en: 'Key terms', he: 'מושגי מפתח' },
  quickCheck: { en: 'Quick check', he: 'בדיקה מהירה' },
  seeIn3D: { en: 'See it in 3D', he: 'צפייה בתלת-ממד' },
  flashcards: { en: 'Flashcards', he: 'כרטיסיות' },
  quiz: { en: 'Quiz', he: 'מבחן' },
  allChapters: { en: 'All chapters (mixed review)', he: 'כל הפרקים (חזרה מעורבת)' },
  dueToday: { en: 'due for review', he: 'לחזרה' },
  showAnswer: { en: 'Show answer', he: 'הצגת תשובה' },
  again: { en: 'Again', he: 'שוב' },
  hard: { en: 'Hard', he: 'קשה' },
  good: { en: 'Good', he: 'טוב' },
  easy: { en: 'Easy', he: 'קל' },
  deckDone: { en: 'Nice work! No more cards due in this deck right now.', he: 'כל הכבוד! אין כרגע כרטיסיות נוספות לחזרה בחפיסה זו.' },
  practiceAll: { en: 'Review all cards anyway', he: 'לחזור על כל הכרטיסיות בכל זאת' },
  questionOf: { en: 'Question', he: 'שאלה' },
  of: { en: 'of', he: 'מתוך' },
  correct: { en: 'Correct!', he: 'נכון!' },
  wrong: { en: 'Not quite.', he: 'לא בדיוק.' },
  yourScore: { en: 'Your score', he: 'הציון שלך' },
  tryAgain: { en: 'Try again', he: 'לנסות שוב' },
  reviewMistakes: { en: 'Review these topics', he: 'כדאי לחזור על הנושאים האלה' },
  trueLabel: { en: 'True', he: 'נכון' },
  falseLabel: { en: 'False', he: 'לא נכון' },
  uploadTitle: { en: 'Turn your lecture into a learning session', he: 'הפכו את ההרצאה שלכם למפגש לימוד' },
  uploadHelp: { en: 'Drop a PDF, Word (.docx), PowerPoint (.pptx) or text file. It is read inside your browser — the file never leaves your computer.', he: 'גררו לכאן קובץ PDF, וורד (‎.docx), פאוורפוינט (‎.pptx) או טקסט. הקובץ נקרא בתוך הדפדפן ולא יוצא מהמחשב שלכם.' },
  chooseFile: { en: 'Choose a file', he: 'בחירת קובץ' },
  orPaste: { en: 'Or paste lecture text here', he: 'או הדביקו כאן את טקסט ההרצאה' },
  build: { en: 'Build my session', he: 'בניית מפגש לימוד' },
  reading: { en: 'Reading your file…', he: 'קורא את הקובץ…' },
  mySessions: { en: 'My sessions', he: 'המפגשים שלי' },
  noMatch: { en: 'I could not find book topics in this text. Try a file with more neuroscience content.', he: 'לא נמצאו נושאים מהספר בטקסט הזה. נסו קובץ עם יותר תוכן במדעי המוח.' },
  lectureCovers: { en: 'Your lecture covers', he: 'ההרצאה שלכם עוסקת ב' },
  detectedTerms: { en: 'Key terms found in your lecture', he: 'מושגים שנמצאו בהרצאה' },
  studyPlan: { en: 'Your study plan', he: 'תוכנית הלימוד שלכם' },
  practiceSession: { en: 'Practice this session', he: 'תרגול המפגש' },
  delete: { en: 'Delete', he: 'מחיקה' },
  lessonsDone: { en: 'lessons done', he: 'שיעורים הושלמו' },
  quizAvg: { en: 'best quiz score', he: 'ציון מבחן הטוב ביותר' },
  weakTopics: { en: 'Topics to review', he: 'נושאים לחזרה' },
  noWeak: { en: 'Take a few quizzes and your weak spots will appear here.', he: 'פתרו כמה מבחנים והנושאים החלשים יופיעו כאן.' },
  resetProgress: { en: 'Reset all progress', he: 'איפוס כל ההתקדמות' },
  confirmReset: { en: 'Delete all your progress, cards and sessions?', he: 'למחוק את כל ההתקדמות, הכרטיסיות והמפגשים?' },
  streak: { en: 'day streak', he: 'ימים ברצף' },
  cardsDue: { en: 'cards due', he: 'כרטיסיות לחזרה' },
  heroTitle: { en: 'Discover how your brain works', he: 'גלו איך המוח שלכם עובד' },
  heroText: { en: '16 chapters of biological psychology, explained simply — with a 3D brain, illustrations, flashcards and quizzes.', he: '16 פרקים בפסיכולוגיה ביולוגית בהסבר פשוט — עם מוח בתלת-ממד, איורים, כרטיסיות ומבחנים.' },
  // ---- 3D brain v2 ----
  searchPlaceholderAI: { en: 'Search or ask Claude a question (e.g. "why do we feel fear?")', he: 'חפשו או שאלו את Claude שאלה (למשל "למה אנחנו מפחדים?")' },
  pathways: { en: 'Pathways', he: 'מסלולים' },
  naturalColors: { en: 'Natural colours', he: 'צבעים טבעיים' },
  atlasColors: { en: 'Atlas colours', he: 'צבעי אטלס' },
  slice: { en: 'Slice', he: 'חיתוך' },
  slice_none: { en: 'No slice', he: 'ללא חיתוך' },
  slice_sagittal: { en: 'Sagittal', he: 'סגיטלי' },
  slice_coronal: { en: 'Coronal', he: 'קורונלי' },
  slice_horizontal: { en: 'Horizontal', he: 'אופקי' },
  modelCredit: { en: '3D anatomy: BodyParts3D © The Database Center for Life Science, CC BY 4.0', he: 'אנטומיה תלת-ממדית: BodyParts3D © The Database Center for Life Science, CC BY 4.0' },
  modelLoaded: { en: 'Anatomical brain model loaded', he: 'המודל האנטומי של המוח נטען' },
  stimulus: { en: 'Stimulus', he: 'גירוי' },
  play: { en: 'Play', he: 'הפעלה' },
  pause: { en: 'Pause', he: 'השהיה' },
  replay: { en: 'Replay', he: 'שוב' },
  speed: { en: 'Speed', he: 'מהירות' },
  playPathway: { en: 'Play pathway', he: 'הפעלת מסלול' },
  askClaude: { en: 'Ask Claude:', he: 'לשאול את Claude:' },
  askClaudeHint: { en: 'Get an explanation and see the parts involved in 3D', he: 'קבלו הסבר וראו את החלקים המעורבים בתלת-ממד' },
  claudeThinking: { en: 'Claude is thinking…', he: 'Claude חושב…' },
  // ---- Settings / Claude ----
  settings: { en: 'Settings', he: 'הגדרות' },
  claudeTitle: { en: 'Connect Claude', he: 'חיבור ל-Claude' },
  claudeIntro: { en: 'With Claude connected, the 3D search box answers real questions, and uploaded lectures become custom lessons with explanations, flashcards and quizzes written for that lecture.', he: 'כש-Claude מחובר, תיבת החיפוש בתלת-ממד עונה על שאלות אמיתיות, והרצאות שמועלות הופכות לשיעורים מותאמים עם הסברים, כרטיסיות ומבחנים שנכתבו במיוחד להרצאה.' },
  claudeStep1: { en: 'Create an Anthropic account and an API key at', he: 'צרו חשבון Anthropic ומפתח API באתר' },
  claudeStep2: { en: 'Add a little credit (usage is pay-as-you-go; a search costs a fraction of a cent, a lecture typically a few cents).', he: 'הוסיפו מעט קרדיט (התשלום לפי שימוש; חיפוש עולה שבריר סנט, הרצאה בדרך כלל כמה סנטים).' },
  claudeStep3: { en: 'Paste the key below and press Save. A regular claude.ai subscription cannot be connected to other websites — an API key is needed.', he: 'הדביקו את המפתח למטה ולחצו שמירה. מנוי רגיל ל-claude.ai אינו ניתן לחיבור לאתרים אחרים — נדרש מפתח API.' },
  apiKey: { en: 'Anthropic API key', he: 'מפתח API של Anthropic' },
  saveKey: { en: 'Save', he: 'שמירה' },
  model: { en: 'Model', he: 'מודל' },
  testKey: { en: 'Test connection', he: 'בדיקת חיבור' },
  removeKey: { en: 'Remove key', he: 'הסרת מפתח' },
  keySaved: { en: 'Claude is connected.', he: 'Claude מחובר.' },
  noKey: { en: 'Not connected — the site works without Claude too.', he: 'לא מחובר — האתר עובד גם בלי Claude.' },
  keyPrivacy: { en: 'Your key is stored only in this browser and is sent only to Anthropic (api.anthropic.com). Don\'t use this on a shared computer, and remove the key when you are done.', he: 'המפתח נשמר רק בדפדפן הזה ונשלח רק ל-Anthropic (api.anthropic.com). אל תשתמשו בזה במחשב משותף, והסירו את המפתח בסיום.' },
  saved: { en: 'Saved', he: 'נשמר' },
  testing: { en: 'Testing…', he: 'בודק…' },
  keyWorks: { en: 'It works! Claude is ready.', he: 'עובד! Claude מוכן.' },
  aiUploadOn: { en: 'Claude is connected: it will write custom lessons for your lecture (takes about a minute).', he: 'Claude מחובר: הוא יכתוב שיעורים מותאמים להרצאה שלכם (לוקח כדקה).' },
  aiUploadOff: { en: 'Tip: connect Claude to get custom lessons written for your lecture instead of just matching book chapters.', he: 'טיפ: חברו את Claude כדי לקבל שיעורים שנכתבו במיוחד להרצאה, ולא רק התאמה לפרקי הספר.' },
  claudeWriting: { en: 'Claude is writing your lessons… (about a minute)', he: 'Claude כותב את השיעורים שלכם… (כדקה)' },
  aiTruncated: { en: 'This file was very long, so only its first part was sent to Claude. Split it into smaller files for full coverage.', he: 'הקובץ היה ארוך מאוד, ולכן רק החלק הראשון שלו נשלח ל-Claude. פצלו אותו לקבצים קטנים יותר לכיסוי מלא.' },
  aiFailed: { en: 'Claude could not write lessons this time; the keyword-based plan is shown instead.', he: 'Claude לא הצליח לכתוב שיעורים הפעם; מוצגת תוכנית מבוססת מילות מפתח.' },
  aiLessons: { en: 'Lessons written for your lecture', he: 'שיעורים שנכתבו עבור ההרצאה שלכם' },
  bookLessons: { en: 'Matching book lessons', he: 'שיעורים מתאימים מהספר' },
  // ---- Lesson visuals ----
  mini3d: { en: 'In the 3D brain', he: 'במוח התלת-ממדי' },
  open3d: { en: 'Open full 3D', he: 'פתיחה בתלת-ממד מלא' },
  stepBy: { en: 'Step by step', he: 'שלב אחר שלב' },
  step: { en: 'Step', he: 'שלב' },
  showAll: { en: 'Show all', he: 'הצג הכול' },
  tryIt: { en: 'Try it yourself', he: 'נסו בעצמכם' },
  hoverHint: { en: 'Tip: hover over a bold term to light it up in 3D.', he: 'טיפ: העבירו את העכבר על מושג מודגש כדי להאיר אותו בתלת-ממד.' },
  writtenByClaude: { en: 'Written by Claude for your lecture', he: 'נכתב על ידי Claude עבור ההרצאה שלכם' },
  checkAnswers: { en: 'Check', he: 'בדיקה' },
  reset: { en: 'Reset', he: 'איפוס' },
};

export const ui = (key) => t(UI[key]) || key;
