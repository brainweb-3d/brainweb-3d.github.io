// Builds test questions from the book content. Four question types:
//   mc    — multiple choice / true-false     { q, options, answer, why }
//   match — match terms to definitions        { q, pairs: [{ a, b }] }
//   order — put steps in the correct order    { q, steps: [...correct order], why }
//   label — click a structure on the 3D brain { q, regionId, why }
import { allLessons, lessonById, regionById, shuffle } from '../../content/index.js';
import { SEQUENCES } from '../../content/sequences.js';

export const TYPES = ['mc', 'match', 'order', 'label'];
export const TYPE_NAMES = {
  mc: { en: 'Multiple choice & true/false', he: 'רב-ברירה ונכון/לא נכון' },
  match: { en: 'Matching', he: 'התאמה' },
  order: { en: 'Put in order', he: 'סידור לפי הסדר' },
  label: { en: 'Label the 3D brain', he: 'סימון במוח התלת-ממדי' },
};

// Small markers are hard to click, so labelling questions use the larger structures only
const LABEL_OK = new Set(['frontal', 'motor', 'somatosensory', 'parietal', 'temporal', 'occipital', 'broca', 'wernicke', 'insula', 'cingulate',
  'thalamus', 'hypothalamus', 'pituitary', 'amygdala', 'hippocampus', 'basalGanglia', 'corpusCallosum', 'ventricles', 'fornix',
  'midbrain', 'pons', 'medulla', 'cerebellum', 'opticChiasm', 'spinalCord', 'pineal']);

const L2 = (en, he) => ({ en, he });

function mcFromLesson(l) {
  const written = l.questions.map((q) => ({ ...q, type: 'mc', chapter: l.chapter }));
  // "Which term matches this definition?" with wrong options from the same chapter
  const pool = allLessons.filter((x) => x.chapter === l.chapter).flatMap((x) => x.cards);
  const termQs = l.cards.map((card) => {
    const wrong = shuffle(pool.filter((c) => c.id !== card.id)).slice(0, 3);
    const opts = shuffle([card, ...wrong]);
    return {
      id: card.id + '.tq', type: 'mc', lessonId: l.id, chapter: l.chapter,
      q: L2(`Which term matches: "${card.back.en}"`, `איזה מושג מתאים להגדרה: "${card.back.he}"`),
      options: { en: opts.map((o) => o.front.en), he: opts.map((o) => o.front.he) },
      answer: opts.indexOf(card),
      why: L2(`${card.front.en}: ${card.back.en}`, `${card.front.he}: ${card.back.he}`),
    };
  });
  return [...written, ...termQs];
}

function matchFromLessons(lessons) {
  // One matching question per lesson that has at least 3 terms
  return lessons.filter((l) => l.cards.length >= 3).map((l) => {
    const cards = shuffle(l.cards).slice(0, 4);
    return {
      id: `${l.id}.match`, type: 'match', lessonId: l.id, chapter: l.chapter,
      q: L2('Match each term to its definition.', 'התאימו כל מושג להגדרה שלו.'),
      pairs: cards.map((c) => ({ a: c.front, b: c.back })),
    };
  });
}

function orderFromLessons(lessons) {
  const ids = new Set(lessons.map((l) => l.id));
  return SEQUENCES.filter((s) => ids.has(s.lesson)).map((s, k) => ({
    id: `${s.lesson}.order${k}`, type: 'order', lessonId: s.lesson, chapter: lessonById[s.lesson]?.chapter,
    q: L2(`Put in the correct order: ${s.title.en}`, `סדרו בסדר הנכון: ${s.title.he}`),
    steps: s.steps, why: s.why,
  }));
}

function labelFromLessons(lessons) {
  const out = [];
  for (const l of lessons) {
    for (const r of (l.regions || []).filter((id) => LABEL_OK.has(id))) {
      const reg = regionById[r];
      const name = { en: reg.name.en.replace(/\s*\([^)]*\)/, ''), he: reg.name.he.replace(/\s*\([^)]*\)/, '') };
      out.push({
        id: `${l.id}.label.${r}`, type: 'label', lessonId: l.id, chapter: l.chapter, regionId: r,
        q: L2(`Click on the ${name.en} in the 3D brain.`, `לחצו על ${name.he} במוח התלת-ממדי.`),
        why: L2(`${reg.name.en}: ${reg.functions.en.slice(0, 2).join('; ')}.`, `${reg.name.he}: ${reg.functions.he.slice(0, 2).join('; ')}.`),
      });
    }
  }
  // One label question per region is enough
  const seen = new Set();
  return out.filter((q) => (seen.has(q.regionId) ? false : seen.add(q.regionId)));
}

/**
 * Build a test.
 * @param lessonIds  subsections to include
 * @param count      number of questions
 * @param types      subset of TYPES
 */
export function buildTest(lessonIds, count, types) {
  const lessons = lessonIds.map((id) => lessonById[id]).filter(Boolean);
  const pools = {
    mc: types.includes('mc') ? shuffle(lessons.flatMap(mcFromLesson)) : [],
    match: types.includes('match') ? shuffle(matchFromLessons(lessons)) : [],
    order: types.includes('order') ? shuffle(orderFromLessons(lessons)) : [],
    label: types.includes('label') ? shuffle(labelFromLessons(lessons)) : [],
  };
  // Prefer written questions first within the multiple-choice pool
  pools.mc.sort((a, b) => (a.id.endsWith('.tq') ? 1 : 0) - (b.id.endsWith('.tq') ? 1 : 0) || Math.random() - 0.5);
  // Mix: roughly 55% multiple choice, the rest shared by the other types
  const share = { mc: 0.55, match: 0.15, order: 0.15, label: 0.15 };
  const chosen = [];
  const active = types.filter((t) => pools[t].length);
  for (const t of active) {
    const total = active.reduce((s, x) => s + share[x], 0);
    const n = Math.max(1, Math.round((count * share[t]) / total));
    chosen.push(...pools[t].splice(0, n));
  }
  // Top up from whatever is left, keeping subsections balanced
  const rest = shuffle(active.flatMap((t) => pools[t]));
  while (chosen.length < count && rest.length) chosen.push(rest.shift());
  return shuffle(chosen.slice(0, count)).map(shuffleOptions);
}

/** Shuffle answer options (true/false keep their natural order). */
export function shuffleOptions(q) {
  if (q.type !== 'mc' || q.options.en.length <= 2) return q;
  const order = shuffle(q.options.en.map((_, i) => i));
  return { ...q, options: { en: order.map((i) => q.options.en[i]), he: order.map((i) => q.options.he[i]) }, answer: order.indexOf(q.answer) };
}

/** How many questions of each type a selection can produce (for the setup screen). */
export function availability(lessonIds) {
  const lessons = lessonIds.map((id) => lessonById[id]).filter(Boolean);
  return {
    mc: lessons.reduce((s, l) => s + l.questions.length + l.cards.length, 0),
    match: matchFromLessons(lessons).length,
    order: orderFromLessons(lessons).length,
    label: labelFromLessons(lessons).length,
  };
}
