// Finds which book lessons a lecture is about, by counting how often each lesson's key terms
// (and related brain parts) appear in the lecture text. Works for English and Hebrew.
import { allLessons, regions } from '../../content/index.js';

let index = null;

/** Turn a term like "Cerebrospinal fluid (CSF)" into search aliases: "cerebrospinal fluid", "csf". */
function aliases(term) {
  const out = new Set();
  const inner = [...term.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]);
  const base = term.replace(/\([^)]*\)/g, ' ');
  for (const part of [base, ...inner]) {
    for (const piece of part.split(/\s+\/\s+|\s+vs\.?\s+|,|\s+and\s+|\s+ו/)) {
      const s = piece.replace(/["'׳״]/g, '').replace(/[‐-―−]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
      if (s.length >= 3) out.add(s);
    }
  }
  return [...out];
}

function regexFor(alias) {
  const escd = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Hebrew words often carry one-letter prefixes (ה, ב, ל, ו, מ, ש, כ)
  const heb = /[֐-׿]/.test(alias) ? '[הבלומשכ]{0,2}' : '';
  return new RegExp(`(^|[^\\p{L}])${heb}${escd}(?=$|[^\\p{L}])`, 'giu');
}

function build() {
  index = allLessons.map((l) => {
    const terms = [];
    for (const c of l.cards) {
      for (const a of [...aliases(c.front.en), ...aliases(c.front.he)]) terms.push({ alias: a, re: regexFor(a), label: c.front, weight: 1 + Math.min(a.split(' ').length, 3) * 0.5 });
    }
    for (const rid of l.regions || []) {
      const r = regions.find((x) => x.id === rid);
      for (const a of [...aliases(r.name.en), ...aliases(r.name.he)]) terms.push({ alias: a, re: regexFor(a), label: { en: r.name.en, he: r.name.he }, weight: 0.4, region: rid });
    }
    return { lesson: l, terms };
  });
}

/**
 * @returns {{ lessons: {lesson, score, hits}[], terms: {label, count}[], regions: string[] }}
 */
export function matchTopics(text) {
  if (!index) build();
  const lower = text.toLowerCase().replace(/[‐-―−]/g, '-'); // treat all dash types alike
  const termCounts = new Map();
  const regionCounts = new Map();
  const scored = index.map(({ lesson, terms }) => {
    let score = 0;
    const hits = new Set();
    for (const tm of terms) {
      const n = (lower.match(tm.re) || []).length;
      if (!n) continue;
      score += Math.min(n, 6) * tm.weight;
      hits.add(tm.label.en);
      if (tm.region) regionCounts.set(tm.region, (regionCounts.get(tm.region) || 0) + n);
      else {
        const key = tm.label.en;
        const prev = termCounts.get(key);
        termCounts.set(key, { label: tm.label, count: Math.max(prev?.count || 0, n) });
      }
    }
    return { lesson, score, hits: [...hits] };
  });

  const max = Math.max(0, ...scored.map((s) => s.score));
  const lessons = scored
    .filter((s) => s.score >= 2 && s.score >= max * 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => ({ ...s, relevance: s.score / (max || 1) }));

  return {
    lessons,
    terms: [...termCounts.values()].sort((a, b) => b.count - a.count).slice(0, 24),
    regions: [...regionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id),
  };
}
