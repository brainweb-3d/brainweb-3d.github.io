// Loads all chapters and turns the compact authoring format into ready-to-use objects:
// lessons with ids, flashcards (from terms) and quiz questions.

import ch01 from './chapters/ch01.js';
import ch02 from './chapters/ch02.js';
import ch03 from './chapters/ch03.js';
import ch04 from './chapters/ch04.js';
import ch05 from './chapters/ch05.js';
import ch06 from './chapters/ch06.js';
import ch07 from './chapters/ch07.js';
import ch08 from './chapters/ch08.js';
import ch09 from './chapters/ch09.js';
import ch10 from './chapters/ch10.js';
import ch11 from './chapters/ch11.js';
import ch12 from './chapters/ch12.js';
import ch13 from './chapters/ch13.js';
import ch14 from './chapters/ch14.js';
import ch15 from './chapters/ch15.js';
import ch16 from './chapters/ch16.js';

export { regions, regionById, GROUPS } from './regions.js';

const raw = [ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10, ch11, ch12, ch13, ch14, ch15, ch16];

/** Turns a lesson in the authoring format (see ch01.js) into a ready-to-use lesson object. */
export function normalizeLesson(l, id, chapter, index) {
  return {
    ...l,
    id,
    chapter,
    index,
    regions: l.regions || [],
    pathways: l.pathways || [],
    sims: l.sims || [],
    cards: (l.terms || []).map(([enT, enD, heT, heD], k) => ({
      id: `${id}.c${k}`,
      lessonId: id,
      front: { en: enT, he: heT },
      back: { en: enD, he: heD },
    })),
    questions: (l.quiz || []).map(([qEn, qHe, oEn, oHe, answer, wEn, wHe], k) => ({
      id: `${id}.q${k}`,
      lessonId: id,
      q: { en: qEn, he: qHe },
      options: { en: oEn, he: oHe },
      answer,
      why: { en: wEn, he: wHe },
    })),
  };
}

export const chapters = raw.map((ch) => ({
  ...ch,
  lessons: ch.lessons.map((l, i) => normalizeLesson(l, `${ch.n}.${i + 1}`, ch.n, i)),
}));

export const allLessons = chapters.flatMap((c) => c.lessons);
export const lessonById = Object.fromEntries(allLessons.map((l) => [l.id, l]));
export const chapterByN = Object.fromEntries(chapters.map((c) => [c.n, c]));
export const allCards = allLessons.flatMap((l) => l.cards);

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
