// "How to use" guide: a short 3-step introduction, opened from the ☰ menu. (First visits get a one-line hint on the
// brain instead; see src/explore/index.js.)
import { getLang } from '../i18n.js';
import { save } from '../store.js';
import { esc } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);

const STEPS = () => [
  {
    icon: '🔭',
    title: L('Fly into the brain', 'טוסו לתוך המוח'),
    text: L('Explore starts at the brain. Each glowing dot is a place you can fly into: brain → cortex → neuron → synapse → molecule → atom. The trail at the top shows where you are; tap any step in it to fly back.', 'החקירה מתחילה במוח. כל נקודה זוהרת היא מקום שאפשר לטוס אליו: מוח ← קליפה ← נוירון ← סינפסה ← מולקולה ← אטום. השביל למעלה מראה איפה אתם; הקישו על כל שלב בו כדי לטוס חזרה.'),
    tips: [L('Drag to turn, scroll or pinch to zoom. Point at (or tap) a dot to see where it leads.', 'גררו לסיבוב, גללו או צבטו לזום. הצביעו על נקודה (או הקישו) כדי לראות לאן היא מובילה.'), L('Tap a part to get a short card about it; “More” in the card has the rest.', 'הקישו על חלק כדי לקבל כרטיס קצר עליו; "עוד" בכרטיס מכיל את השאר.')],
  },
  {
    icon: '▶',
    title: L('Watch: stories, pathways, effects', 'צפייה: סיפורים, מסלולים, השפעות'),
    text: L('The ▶ Watch button holds guided stories, signals travelling through the brain (step by step, at your pace), effects of drugs, diseases and body states, and how scientists see the brain (MRI, EEG…). 🛠 on the brain opens the tools: see-through, slicing, skull, arteries…', 'כפתור ▶ צפייה מכיל סיפורים מודרכים, אותות שעוברים במוח (צעד אחר צעד, בקצב שלכם), השפעות של סמים, מחלות ומצבי גוף, ואיך מדענים רואים את המוח (MRI‏, EEG…). 🛠 במוח פותח את הכלים: שקיפות, חיתוך, גולגולת, עורקים…'),
    tips: [L('🔍 at the top finds anything: a brain part, a topic, a story, a book section.', '🔍 למעלה מוצא הכול: חלק במוח, נושא, סיפור, פרק בספר.')],
  },
  {
    icon: '📝',
    title: L('Test yourself', 'בחנו את עצמכם'),
    text: L('“Start a quick test” gives 10 questions from the whole book. You can also choose chapters, use flashcards, follow your progress, or upload a lecture and let the AI write a test about it (connect Claude, ChatGPT or Gemini in ☰ → Settings).', '"התחלת מבחן מהיר" נותן 10 שאלות מכל הספר. אפשר גם לבחור פרקים, להשתמש בכרטיסיות, לעקוב אחר ההתקדמות, או להעלות הרצאה ולתת ל-AI לכתוב עליה מבחן (חברו את Claude‏, ChatGPT או Gemini ב-☰ ← הגדרות).'),
    tips: [L('☰ holds the language, light/dark mode, this guide and the settings.', '☰ מכיל את השפה, מצב בהיר/כהה, המדריך הזה וההגדרות.')],
  },
];

export function openTour(start = 0) {
  document.querySelector('dialog.tour-dialog')?.remove();
  const d = document.createElement('dialog');
  d.className = 'tour-dialog card';
  let i = start;
  const close = () => { save('tourSeen', true); d.close(); d.remove(); };
  const draw = () => {
    const steps = STEPS();
    const s = steps[i];
    const last = i === steps.length - 1;
    d.innerHTML = `
      <div class="row"><span class="tour-count small muted">${i + 1} / ${steps.length}</span><span class="spacer"></span><button class="icon-btn" data-x aria-label="${esc(L('Close', 'סגירה'))}">✕</button></div>
      <div class="tour-icon">${s.icon}</div>
      <h2>${esc(s.title)}</h2>
      <p>${esc(s.text)}</p>
      <ul class="tour-tips">${s.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <div class="tour-dots">${steps.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('')}</div>
      <div class="row tour-actions">
        ${i > 0 ? `<button class="btn ghost" data-back>← ${esc(L('Back', 'הקודם'))}</button>` : `<button class="btn ghost" data-x>${esc(L('Skip', 'דילוג'))}</button>`}
        <span class="spacer"></span>
        ${last ? `<a class="btn ghost" href="#/story/coffee" data-x>📖 ${esc(L('Try a guided story', 'נסו סיפור מודרך'))}</a><button class="btn" data-x>${esc(L('Start exploring', 'בואו נתחיל'))}</button>` : `<button class="btn" data-next>${esc(L('Next', 'הבא'))} →</button>`}
      </div>`;
    d.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
    d.querySelector('[data-next]')?.addEventListener('click', () => { i++; draw(); });
    d.querySelector('[data-back]')?.addEventListener('click', () => { i--; draw(); });
  };
  draw();
  d.addEventListener('cancel', () => save('tourSeen', true));
  document.body.appendChild(d);
  d.showModal();
}
