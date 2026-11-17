// Builds a forgiving search index (handles typos) over brain parts, lessons and terms, in both languages.
// This is the "smart search" without AI. Later, src/upload/aiHook.js shows where an AI model could be added.
import Fuse from 'fuse.js';
import { regions, allLessons, allCards, chapterByN } from '../../content/index.js';

let fuse = null;

function build() {
  const items = [];
  for (const r of regions) {
    items.push({
      type: 'region', id: r.id,
      name: `${r.name.en} ${r.name.he}`,
      keywords: r.keywords,
      functions: [...r.functions.en, ...r.functions.he].join(' '),
      desc: `${r.desc.en} ${r.desc.he}`,
    });
  }
  for (const l of allLessons) {
    items.push({
      type: 'lesson', id: l.id,
      name: `${l.title.en} ${l.title.he}`,
      keywords: `${chapterByN[l.chapter].title.en} ${chapterByN[l.chapter].title.he} ` + l.cards.map((c) => `${c.front.en} ${c.front.he}`).join(' '),
      functions: [...l.points.en, ...l.points.he].join(' '),
      desc: '',
    });
  }
  for (const c of allCards) {
    items.push({ type: 'term', id: c.id, lessonId: c.lessonId, name: `${c.front.en} ${c.front.he}`, keywords: '', functions: '', desc: `${c.back.en} ${c.back.he}` });
  }
  fuse = new Fuse(items, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.34,
    minMatchCharLength: 2,
    keys: [
      { name: 'name', weight: 3 },
      { name: 'keywords', weight: 2 },
      { name: 'functions', weight: 1.4 },
      { name: 'desc', weight: 0.4 },
    ],
  });
}

/**
 * Exact-word scoring for brain parts: counts how often the query words appear (as word starts)
 * in a region's name, functions, keywords and description. Precise for words like "fear" or "memory".
 */
function exactRegionMatches(q) {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
  if (!words.length) return [];
  const res = regions.map((r) => {
    let score = 0;
    for (const w of words) {
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(^|[^\\p{L}])[הבלומשכ]{0,2}${esc}`, 'giu');
      const count = (s) => (s.toLowerCase().match(re) || []).length;
      score += count(`${r.name.en} ${r.name.he}`) * 10
        + count([...r.functions.en, ...r.functions.he].join(' ')) * 3
        + count(r.keywords) * 2
        + count(`${r.desc.en} ${r.desc.he}`) * 0.5;
    }
    return { type: 'region', id: r.id, raw: score };
  }).filter((x) => x.raw > 0).sort((a, b) => b.raw - a.raw);
  const best = res[0]?.raw || 0;
  // Turn into a Fuse-like score (0 = perfect) and keep only strong matches
  return res.filter((x) => x.raw >= best * 0.3).slice(0, 6).map((x) => ({ ...x, score: 1 - x.raw / best }));
}

/** Search; returns { regions: [...], lessons: [...], terms: [...] } with best matches first. */
export function search(query) {
  if (!fuse) build();
  const q = query.trim();
  if (q.length < 2) return { regions: [], lessons: [], terms: [] };
  const res = fuse.search(q, { limit: 60 });
  const out = { regions: [], lessons: [], terms: [] };
  const bestOf = {};
  for (const r of res) {
    const type = r.item.type;
    bestOf[type] ??= r.score;
    // Drop weak fuzzy matches that are much worse than the best one
    if (r.score > Math.min(bestOf[type] + 0.2, 0.75)) continue;
    const list = out[type + 's'];
    if (list.length < (type === 'region' ? 6 : 5)) list.push({ ...r.item, score: r.score });
  }
  const exact = exactRegionMatches(q);
  if (exact.length) out.regions = exact; // precise word matches beat fuzzy ones; fuzzy stays for typos
  return out;
}

// ---------------------------------------------------------------- everything else: scenes, effects, methods, stories
import { SCENES } from '../../content/catalog.js';
import { EFFECTS } from '../../content/effects.js';
import { STORIES } from '../../content/stories.js';

let fuseMore = null;
function buildMore() {
  const items = [];
  for (const s of SCENES) {
    items.push({ type: s.level === 'methods' ? 'method' : 'scene', id: `${s.level}/${s.id}`, icon: s.icon, title: s.name, level: s.level,
      name: `${s.name.en} ${s.name.he}`, text: `${s.intro?.en || ''} ${s.intro?.he || ''}` });
  }
  for (const e of EFFECTS) items.push({ type: 'effect', id: e.id, icon: e.icon, title: e.name, name: `${e.name.en} ${e.name.he}`, text: `${e.desc.en} ${e.desc.he}` });
  for (const s of STORIES) items.push({ type: 'story', id: s.id, icon: s.icon, title: s.title, name: `${s.title.en} ${s.title.he}`, text: s.steps.map((x) => `${x.text.en} ${x.text.he}`).join(' ') });
  fuseMore = new Fuse(items, { includeScore: true, ignoreLocation: true, threshold: 0.3, minMatchCharLength: 2, keys: [{ name: 'name', weight: 3 }, { name: 'text', weight: 1 }] });
}

/** Scenes, effects, research methods and stories that match; { scenes, effects, methods, stories } (max 4 each). */
export function searchMore(query) {
  if (!fuseMore) buildMore();
  const q = query.trim();
  const out = { scenes: [], effects: [], methods: [], stories: [] };
  if (q.length < 2) return out;
  for (const r of fuseMore.search(q, { limit: 40 })) {
    if (r.score > 0.45) continue;
    const list = out[r.item.type === 'story' ? 'stories' : r.item.type + 's'];
    if (list.length < 4) list.push(r.item);
  }
  return out;
}
