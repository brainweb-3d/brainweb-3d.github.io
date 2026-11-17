// What the AI does on this site: (1) answers questions in the 3D search box, (2) writes a test from a lecture.
// Works with whichever AI is connected (see providers.js).
import { askJSON } from './providers.js';
import { regions, allLessons } from '../../content/index.js';
import { PATHWAYS } from '../brain/pathways.js';

const REGION_IDS = regions.map((r) => r.id);
const PATHWAY_IDS = PATHWAYS.map((p) => p.id);
const LESSON_IDS = allLessons.map((l) => l.id);
// Structures large enough to click in the 3D brain
export const LABELABLE = ['frontal', 'motor', 'somatosensory', 'parietal', 'temporal', 'occipital', 'broca', 'wernicke', 'insula', 'cingulate',
  'thalamus', 'hypothalamus', 'pituitary', 'amygdala', 'hippocampus', 'basalGanglia', 'corpusCallosum', 'ventricles', 'fornix',
  'midbrain', 'pons', 'medulla', 'cerebellum', 'opticChiasm', 'spinalCord', 'pineal'];

const catalog = () => [
  'BRAIN PARTS (id: name):', ...regions.map((r) => `${r.id}: ${r.name.en}`),
  '', 'ANIMATED PATHWAYS (id: name):', ...PATHWAYS.map((p) => `${p.id}: ${p.name.en}`),
  '', 'BOOK SUBSECTIONS (id: title):', ...allLessons.map((l) => `${l.id}: ${l.title.en}`),
].join('\n');

const BASE_SYSTEM = `You are the tutor inside BrainWeb, an interactive 3D biological-psychology website based on the textbook
"Discovering Biological Psychology" (Freberg). Students are beginners: be clear and accurate, in plain language,
and stay within established neuroscience. Every text field has an English and a Hebrew version; the Hebrew must be natural,
fluent Hebrew with the English scientific term in brackets the first time it appears.`;

// ------------------------------------------------------------------ 1. Search assistant
const SEARCH_SCHEMA = {
  type: 'object',
  properties: {
    answer_en: { type: 'string' },
    answer_he: { type: 'string' },
    regionIds: { type: 'array', items: { type: 'string', enum: REGION_IDS } },
    lessonIds: { type: 'array', items: { type: 'string', enum: LESSON_IDS } },
    pathwayId: { type: 'string', enum: ['', ...PATHWAY_IDS] },
  },
  required: ['answer_en', 'answer_he', 'regionIds', 'lessonIds', 'pathwayId'],
  additionalProperties: false,
};

/** Answer a free question about the brain and point at the 3D parts and pathway that help. */
export async function askBrain(question) {
  const out = await askJSON({
    system: `${BASE_SYSTEM}

The student typed a question or search into the 3D brain's search box. Answer in 2–4 short sentences (each language).
Then choose up to 5 brain part ids to highlight in 3D, up to 3 book subsection ids, and one animated pathway id
if one illustrates the answer well (otherwise ""). Use only ids from this catalog:

${catalog()}`,
    user: question,
    schema: SEARCH_SCHEMA,
    maxTokens: 4000,
    effort: 'low',
  });
  return normalizeBrainAnswer(out);
}

/** Fill missing fields and drop unknown ids: loosely parsed answers (no-schema fallbacks) may omit or invent them. */
export function normalizeBrainAnswer(out) {
  const o = out && typeof out === 'object' ? out : {};
  const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
  const ids = (v, allowed) => (Array.isArray(v) ? v : []).map(str).filter((id) => allowed.includes(id));
  const en = str(o.answer_en || o.answer);
  return {
    answer_en: en,
    answer_he: str(o.answer_he) || en,
    regionIds: ids(o.regionIds, REGION_IDS).slice(0, 5),
    lessonIds: ids(o.lessonIds, LESSON_IDS).slice(0, 3),
    pathwayId: PATHWAY_IDS.includes(str(o.pathwayId)) ? str(o.pathwayId) : '',
  };
}

// ------------------------------------------------------------------ 2. Test from a lecture
const S = { type: 'string' };
export const TEST_SCHEMA = {
  type: 'object',
  properties: {
    title_en: S, title_he: S, summary_en: S, summary_he: S,
    multipleChoice: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { question_en: S, question_he: S, options_en: { type: 'array', items: S }, options_he: { type: 'array', items: S }, correct_index: { type: 'integer' }, explanation_en: S, explanation_he: S },
      required: ['question_en', 'question_he', 'options_en', 'options_he', 'correct_index', 'explanation_en', 'explanation_he'] } },
    matching: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { pairs: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { term_en: S, term_he: S, definition_en: S, definition_he: S }, required: ['term_en', 'term_he', 'definition_en', 'definition_he'] } } },
      required: ['pairs'] } },
    ordering: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { title_en: S, title_he: S, steps: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { en: S, he: S }, required: ['en', 'he'] } }, explanation_en: S, explanation_he: S },
      required: ['title_en', 'title_he', 'steps', 'explanation_en', 'explanation_he'] } },
    labeling: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { regionId: { type: 'string', enum: LABELABLE }, explanation_en: S, explanation_he: S },
      required: ['regionId', 'explanation_en', 'explanation_he'] } },
    relatedLessonIds: { type: 'array', items: { type: 'string', enum: LESSON_IDS } },
  },
  required: ['title_en', 'title_he', 'summary_en', 'summary_he', 'multipleChoice', 'matching', 'ordering', 'labeling', 'relatedLessonIds'],
  additionalProperties: false,
};

// About 100k tokens of lecture text; longer files are cut and the user is told so.
export const MAX_LECTURE_CHARS = 400000;

/**
 * Write a test about a lecture.
 * @param counts { mc, match, order, label } how many of each to write
 * @returns { title, summary, questions, related, truncated }
 */
export async function generateLectureTest(text, counts) {
  const truncated = text.length > MAX_LECTURE_CHARS;
  const lecture = truncated ? text.slice(0, MAX_LECTURE_CHARS) : text;
  const out = await askJSON({
    system: `${BASE_SYSTEM}

A student uploaded lecture material and wants a test on exactly what THIS lecture teaches. Write:
- multipleChoice: ${counts.mc} questions (4 options each; you may include true/false questions with exactly 2 options "True"/"False" — Hebrew "נכון"/"לא נכון"); correct_index is 0-based; vary which option is correct; explanations say why.
- matching: ${counts.match} sets, each with 4 term–definition pairs from the lecture.
- ordering: ${counts.order} processes or sequences from the lecture, each with 3–7 steps in the CORRECT order.
- labeling: ${counts.label} brain structures from the lecture that the student should find in a 3D brain (only ids from the allowed list).
If the lecture has no material for a type (e.g. no brain structures, no processes), return fewer or none of that type.
Test understanding, not trivia; do not copy long passages. relatedLessonIds: the textbook subsections that cover this lecture.
Catalog for reference:

${catalog()}`,
    user: `Lecture material:\n\n${lecture}`,
    schema: TEST_SCHEMA,
    maxTokens: 64000,
    effort: 'medium',
  });

  return testFromModel(out, truncated);
}

/** Turn the AI's JSON (TEST_SCHEMA) into the site's question format. Malformed items are dropped, missing fields filled. */
export function testFromModel(raw, truncated = false) {
  const out = raw && typeof raw === 'object' ? raw : {};
  const str = (v) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
  const B = (en, he) => { const e = str(en); return { en: e, he: str(he) || e }; };
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => x != null) : []);
  const obj = (v) => v && typeof v === 'object';
  const topic = B(out.title_en || 'Lecture test', out.title_he || 'מבחן מהרצאה');

  const mc = arr(out.multipleChoice).filter(obj).map((q) => {
    const en = arr(q.options_en).map(str);
    const he = arr(q.options_he).map(str);
    const answer = Number(q.correct_index);
    const options = { en, he: he.length === en.length && he.every(Boolean) ? he : en };
    const ok = str(q.question_en) && en.length >= 2 && en.every(Boolean) && Number.isInteger(answer) && answer >= 0 && answer < en.length;
    return ok ? { q: B(q.question_en, q.question_he), options, answer, why: B(q.explanation_en, q.explanation_he) } : null;
  }).filter(Boolean);
  const match = arr(out.matching).filter(obj).map((m) => arr(m.pairs).filter(obj)
    .map((p) => ({ a: B(p.term_en, p.term_he), b: B(p.definition_en, p.definition_he) }))
    .filter((p) => p.a.en && p.b.en).slice(0, 5)).filter((pairs) => pairs.length >= 2);
  const order = arr(out.ordering).filter(obj).map((o) => {
    const steps = arr(o.steps).map((x) => (typeof x === 'string' ? B(x, x) : obj(x) ? B(x.en, x.he) : null)).filter((x) => x && x.en);
    return steps.length >= 3 ? { title: B(o.title_en, o.title_he), steps, why: B(o.explanation_en, o.explanation_he) } : null;
  }).filter(Boolean);
  const label = arr(out.labeling).filter((l) => obj(l) && LABELABLE.includes(l.regionId) && regions.some((x) => x.id === l.regionId));

  const questions = [
    ...mc.map((q, i) => ({ id: `ai.mc${i}`, type: 'mc', topic, ...q })),
    ...match.map((pairs, i) => ({ id: `ai.match${i}`, type: 'match', topic, q: B('Match each term to its definition.', 'התאימו כל מושג להגדרה שלו.'), pairs })),
    ...order.map((o, i) => ({ id: `ai.order${i}`, type: 'order', topic, q: B(`Put in the correct order: ${o.title.en}`, `סדרו בסדר הנכון: ${o.title.he}`), steps: o.steps, why: o.why })),
    ...label.map((l, i) => {
      const r = regions.find((x) => x.id === l.regionId);
      const name = B(r.name.en.replace(/\s*\([^)]*\)/, ''), r.name.he.replace(/\s*\([^)]*\)/, ''));
      return { id: `ai.label${i}`, type: 'label', topic, regionId: l.regionId, q: B(`Click on the ${name.en} in the 3D brain.`, `לחצו על ${name.he} במוח התלת-ממדי.`), why: B(l.explanation_en, l.explanation_he) };
    }),
  ];
  return { title: topic, summary: B(out.summary_en, out.summary_he), questions, related: arr(out.relatedLessonIds).map(str).filter((id) => LESSON_IDS.includes(id)), truncated };
}
