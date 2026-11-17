// Guided-story engine: remembers which story/step is active, moves between steps, and draws the story box
// that sits at the top of the info dock (level pages and the brain explorer).
// Interactive steps (owner, 2026-11-15):
//   task: { act: '<button label, English, or part of it>' | part: '<part id>', prompt: B, done: B }
//         the learner does it in the 3D scene; Next unlocks once done (a small "skip" link is always there)
//   choices: [{ label: B, go: '<step id>' }]   branches: each choice jumps to the step with that id
//   next: '<step id>'   where Next goes (default: the following step);   end: true   this step finishes the story
// "Back" follows the path actually taken (state.hist).
import { STORIES, storyById } from '../../content/stories.js';
import { load, save } from '../store.js';
import { getLang } from '../i18n.js';
import { esc } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const T = (b) => (b ? L(b.en, b.he) : '');
let state = load('story', null); // { id, step, hist: [step…], done: bool }
if (state && !storyById[state.id]) state = null;
if (state) { state.hist ||= []; state.done ||= false; }
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(getStory()));
const indexOfId = (s, id) => s.steps.findIndex((x) => x.id === id);

export { STORIES };
export const onStoryChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export function getStory() {
  if (!state) return null;
  const s = storyById[state.id];
  return { story: s, index: state.step, step: s.steps[state.step], done: state.done };
}
/** Start a story (or jump to a step) and go to that step's page. `replace`: the address was a #/story/<id> link, so
 *  replace it (Back must not land on the link again, which would restart the story). `back`: going back along the
 *  path taken. Returns false for unknown ids. */
export function storyGo(id, step = 0, { replace = false, back = false } = {}) {
  const s = storyById[id];
  if (!s) return false;
  const to = Math.max(0, Math.min(s.steps.length - 1, step));
  const hist = state?.id === id ? state.hist || [] : [];
  if (back) hist.pop(); else if (state?.id === id && state.step !== to) hist.push(state.step);
  state = { id, step: to, hist, done: false };
  save('story', state);
  // change the address first, so the story box never flashes "you left the story" while the next page loads
  const href = s.steps[state.step].href;
  const same = location.hash === href;
  if (!same) { if (replace) location.replace(href); else location.hash = href; }
  notify();
  if (same) window.dispatchEvent(new HashChangeEvent('hashchange'));
  return true;
}
export function storyExit() { state = null; save('story', null); notify(); }
const nextIndex = (s, i) => { const st = s.steps[i]; return st.next ? indexOfId(s, st.next) : i + 1; };

/** The current step if the user is on that step's page (so its buttons should be pressed). */
export function storyStepHere(hash = location.hash) {
  const cur = getStory();
  return cur && cur.step.href === hash ? cur.step : null;
}
/** The learner did something in the scene (pressed a button: 'act', label; tapped a part: 'part', id). */
export function storyNote(kind, value) {
  const step = storyStepHere();
  const task = step?.task;
  if (!task || state.done) return;
  const hit = kind === 'act' ? task.act && value.includes(task.act) : task.part && value === task.part;
  if (!hit) return;
  state.done = true; save('story', state); notify();
}

export function storyBoxHtml() {
  const cur = getStory();
  if (!cur) return '';
  const { story, index, step, done } = cur;
  const here = step.href === location.hash;
  const n = story.steps.length;
  const last = step.end || nextIndex(story, index) >= n;
  const locked = step.task && !done;
  const task = step.task ? `<div class="story-task ${done ? 'done' : ''}">${done ? `✅ ${esc(T(step.task.done) || L('Done!', 'בוצע!'))}` : `👉 <b>${esc(L('Your turn', 'תורכם'))}:</b> ${esc(T(step.task.prompt))}`}</div>` : '';
  const choices = step.choices && (!step.task || done) ? `<div class="story-choices">${step.choices.map((c) => `<button class="btn sm" data-story-go="${esc(c.go)}">${esc(T(c.label))}</button>`).join('')}</div>` : '';
  const nav = step.choices ? '' : last
    ? `<button class="btn sm" data-story-exit ${locked ? 'disabled' : ''}>✓ ${esc(L('Finish', 'סיום'))}</button>`
    : `<button class="btn sm" data-story-step="${nextIndex(story, index)}" ${locked ? 'disabled' : ''}>${esc(L('Next', 'הבא'))} ▶</button>`;
  return `<div class="story-box">
    <div class="effect-head"><span class="effect-icon">${story.icon}</span><b>${esc(T(story.title))}</b><span class="spacer"></span>
      <button class="icon-btn" data-story-exit title="${esc(L('End the story', 'סיום הסיפור'))}">✕</button></div>
    <div class="story-dots">${story.steps.map((_, k) => `<button class="${k === index ? 'on' : (state.hist || []).includes(k) ? 'past' : ''}" data-story-step="${k}" aria-label="${k + 1}">${k + 1}</button>`).join('')}</div>
    ${here ? `<p class="effect-note">${esc(T(step.text))}</p>${task}${choices}` : `<p class="small muted">${esc(L('You left the story.', 'יצאתם מהסיפור.'))} <a href="${step.href}">${esc(L('Back to step', 'חזרה לשלב'))} ${index + 1} →</a></p>`}
    <div class="row story-nav">
      <button class="btn ghost sm" data-story-back ${(state.hist || []).length ? '' : 'disabled'}>◀ ${esc(L('Back', 'הקודם'))}</button>
      <span class="spacer"></span>
      ${locked && here ? `<button class="linkish small" data-story-skip>${esc(L('skip', 'דלגו'))}</button>` : ''}
      ${nav}
    </div>
  </div>`;
}
export function bindStoryBox(root) {
  const cur = getStory();
  if (!cur) return;
  root.querySelectorAll('[data-story-step]').forEach((b) => b.addEventListener('click', () => storyGo(cur.story.id, +b.dataset.storyStep)));
  root.querySelectorAll('[data-story-go]').forEach((b) => b.addEventListener('click', () => { const i = indexOfId(cur.story, b.dataset.storyGo); if (i >= 0) storyGo(cur.story.id, i); }));
  root.querySelectorAll('[data-story-back]').forEach((b) => b.addEventListener('click', () => { const h = state?.hist || []; if (h.length) storyGo(cur.story.id, h[h.length - 1], { back: true }); }));
  root.querySelectorAll('[data-story-skip]').forEach((b) => b.addEventListener('click', () => { state.done = true; save('story', state); notify(); }));
  root.querySelectorAll('[data-story-exit]').forEach((b) => b.addEventListener('click', () => storyExit()));
}

/** Story list for the picker / search. */
export function storyListHtml() {
  return `<div class="effect-grid">${STORIES.map((s) => `<a class="effect-opt" href="#/story/${s.id}"><span>${s.icon}</span> ${esc(T(s.title))} <small class="muted">· ${s.steps.length} ${esc(L('steps', 'שלבים'))}</small></a>`).join('')}</div>`;
}
