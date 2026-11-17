// Saves the user's progress in the browser (localStorage), so it survives page reloads.
// Everything is wrapped in try/catch so the site still works in private/incognito windows.

const PREFIX = 'brainweb.';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function resetAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX) && k !== PREFIX + 'lang' && k !== PREFIX + 'theme')
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// ---- Quiz results: { [deckId]: { best, last, wrongSections: [] } } ----
export const getQuizResults = () => load('quiz', {});
export function recordQuiz(deckId, score, wrongSectionIds) {
  const all = getQuizResults();
  const prev = all[deckId] || { best: 0 };
  all[deckId] = { best: Math.max(prev.best, score), last: score, wrongSections: wrongSectionIds, at: Date.now() };
  save('quiz', all);
  touchStreak();
}

// ---- Per-subsection test results: { [lessonId]: { right, total, last } } (cumulative) ----
export const getLessonStats = () => load('lessonStats', {});
export function recordLessonStats(entries) {
  const all = getLessonStats();
  for (const [id, s] of entries) {
    const prev = all[id] || { right: 0, total: 0 };
    all[id] = { right: prev.right + s.right, total: prev.total + s.total, last: Math.round((s.right / s.total) * 100), at: Date.now() };
  }
  save('lessonStats', all);
}

// ---- Study streak (days in a row with some activity) ----
export function touchStreak() {
  const today = new Date().toDateString();
  const s = load('streak', { last: null, count: 0 });
  if (s.last === today) return;
  const yesterday = new Date(Date.now() - 864e5).toDateString();
  s.count = s.last === yesterday ? s.count + 1 : 1;
  s.last = today;
  save('streak', s);
}
export function getStreak() {
  const s = load('streak', { last: null, count: 0 });
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 864e5).toDateString();
  return s.last === today || s.last === yesterday ? s.count : 0;
}
