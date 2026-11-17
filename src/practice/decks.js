// Turns a flashcard "deck id" from the address bar into a list of lessons (subsections) and a title.
//   all        → every subsection
//   5          → chapter 5
//   lesson-5.2 → one subsection
import { allLessons, chapterByN, lessonById } from '../../content/index.js';
import { ui, t } from '../i18n.js';

export function resolveDeck(deck) {
  const back = '#/test/cards';
  if (/^\d+$/.test(deck)) {
    const c = chapterByN[+deck];
    if (c) return { lessons: c.lessons, title: `${c.icon} ${ui('chapter')} ${c.n}: ${t(c.title)}`, back };
  }
  if (deck.startsWith('lesson-')) {
    const l = lessonById[deck.slice(7)];
    if (l) return { lessons: [l], title: `${l.id} ${t(l.title)}`, back };
  }
  return { lessons: allLessons, title: ui('allChapters'), back };
}
