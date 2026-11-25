// Explore: one continuous 3D drill-down that starts at the brain.
// Chrome (kept minimal on purpose): a breadcrumb (top, the one way back), a few in-scene dots (label on hover/tap),
// and a bottom bar: ▶ Watch (stories, pathways, effects, methods), ⓘ About this (a short card: name, a few
// sentences, "Go inside", animations, then "More"), and 🛠 Tools on the brain. Tapping a part opens its card.
//
// Routes (one history entry per place):
//   #/explore/<level>[/<scene>]                    a place ("<level>/<scene>", see ./graph.js)
//   #/explore/organ[/<ids> | /path/<pathway>]      the brain, with parts highlighted or a pathway playing
// Moving between places: a hotspot (or its sheet button) dives in; the breadcrumb, Esc, browser back and
// scrolling/pinching out past the farthest zoom fly back out. A direct link shows the place without a dive.
import { World, ROOT_KEY } from './World.js';
import { Hotspots, anchorFor } from './hotspots.js';
import { PLACES, ROOT, pathTo, placeFromRoute, hotspotTo, dotsOf } from './graph.js';
import { createBrainTools, shortName, firstSentences } from './brainTools.js';
import { onAiChange } from './ai.js';
import { MODELS, attachModel, setMode, tickModel, pruneModels } from './models.js';
import { regionById } from '../../content/index.js';
import { levelById } from '../visual/levels/index.js';
import { storyBoxHtml, bindStoryBox, storyStepHere, onStoryChange, getStory, storyNote } from '../visual/stories.js';
import { takeJustSet, getEffect, effectAt, effectBoxHtml, bindEffectBox, openEffectPicker, bestTarget, onEffectChange } from '../visual/effects.js';
import { openWatch } from './watch.js';
import { chemNow, chemCardHtml, bindChemCard } from './chemCard.js';
import { DIVE_CHEM } from '../../content/chemistry.js';
import { REAL_NOTES } from '../../content/modelNotes.js';
import { pathwayById } from '../brain/pathways.js';
import { load, save } from '../store.js';
import { t, getLang } from '../i18n.js';
import { esc, tt } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const isPhone = () => window.innerWidth <= 720;
export const routeOf = (key) => (key === ROOT ? '#/explore/organ' : `#/explore/${key}`);
const BRAIN_INTRO = {
  en: 'The whole brain. Tap any part to learn about it, or a glowing dot to fly inside.',
  he: 'המוח כולו. הקישו על חלק כדי ללמוד עליו, או על נקודה זוהרת כדי לטוס פנימה.',
};

let root = null, world = null, hots = null, brainTools = null;
const els = {};
let place = null;            // key of the place on screen
let sheetOpen = false, sheetBig = false, openAfterArrive = false;
let toolsOpen = false;       // the 🛠 tools menu (brain only)
let pendingAsk = null;       // a question from the search box, asked once the brain is on screen
let selected = null;         // tapped part (Stage part id, or brain region id)
let onlyDuringAnimation = false;
let pendingHot = null;       // the hotspot the user just clicked (exact anchor for the dive)
let latestReq = null, queue = Promise.resolve();
const trail = [];            // place keys of the history entries we know about (for breadcrumb → history.go)
let pendingGo = null;
let restSince = 0, prebuiltFor = null;

// ------------------------------------------------------------------ setup
function setup() {
  root = document.getElementById('explore');
  root.innerHTML = `
    <div class="xw-layers" id="xwLayers"></div>
    <div class="xw-hots" id="xwHots"></div>
    <nav class="xw-crumbs" id="xwCrumbs"></nav>
    <div class="xw-chem" id="xwChem" hidden></div>
    <div class="xw-label" id="xwLabel" hidden></div>
    <div class="xw-status" id="xwStatus" hidden></div>
    <p class="xw-hint" id="xwHint" hidden></p>
    <div class="xw-tools" id="xwTools" hidden></div>
    <div class="xw-bar" id="xwBar">
      <button class="xw-chip" id="xwWatch"></button>
      <button class="xw-chip" id="xwInfo" aria-expanded="false"></button>
      <button class="xw-chip" id="xwToolsBtn" aria-expanded="false" aria-controls="xwTools" hidden></button>
    </div>
    <aside class="xw-sheet" id="xwSheet" aria-hidden="true"></aside>`;
  for (const id of ['Layers', 'Hots', 'Crumbs', 'Chem', 'Label', 'Status', 'Hint', 'Tools', 'Bar', 'Watch', 'Info', 'ToolsBtn', 'Sheet']) els[id[0].toLowerCase() + id.slice(1)] = root.querySelector('#xw' + id);
  world = new World(els.layers, { say, readout, hover, select, model: () => updateStatus(), afterFrame, decorate: (v) => attachModel(v).then(() => { if (v === world.current) renderSheet(); }), tickModel });
  hots = new Hotspots(els.hots, { onDive: (hs, btn) => diveVia(hs, btn), onIntent: (hs) => { if (hs.to && !world.busy) world.prebuild(hs.to, PLACES[place]?.parent); }, onZoom: zoomTo });

  els.info.addEventListener('click', () => (sheetOpen ? closeSheet() : openSheet()));
  els.watch.addEventListener('click', () => openWatch({ onEffect: pickEffect }));
  els.toolsBtn.addEventListener('click', () => { toolsOpen = !toolsOpen; renderTools(); });
  bindZoomOut();
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', () => { if (!root.hidden) { renderCrumbs(); updateOffset(); } });
  onStoryChange(() => { if (!root.hidden) renderSheet(); });
  onEffectChange((e) => {
    if (root.hidden) return;
    const v = world.current;
    // removing the effect resets the scene (switches the effect had turned on go back to normal)
    if (!e && v?.kind === 'stage' && v.def) { v.build(place, v.def); world.show(v); world.hooks.decorate(v); hots.set(v, shownDots(place)); }
    renderSheet();
  });
  onAiChange(() => { if (!root.hidden && place === ROOT) renderSheet(); });
}

// ------------------------------------------------------------------ routes
export function showExplore(args = []) {
  if (!root) setup();
  root.hidden = false;
  world.start();
  const req = parseRoute(args);
  noteVisit(req.key);
  latestReq = req;
  queue = queue.then(() => (latestReq === req ? goTo(req) : null)).catch((e) => console.error(e));
}

export function hideExplore() {
  if (!root) return;
  root.hidden = true;
  world.stop();
  closeSheet();
  toolsOpen = false;
  renderTools();
  document.title = 'BrainWeb';
}

export function refreshExplore() {
  if (!root || root.hidden) return;
  renderCrumbs();
  hots.render();
  renderInfoChip();
  renderSheet();
  renderTools();
  renderHint();
}

function parseRoute(args) {
  let [level, ...rest] = args;
  if (!level || !levelById[level]) level = 'organ';
  if (level === 'organ') {
    const path = rest[0] === 'path';
    return { key: ROOT, pathway: path ? rest[1] : null, focus: !path && rest[0] ? decodeURIComponent(rest[0]).split(',') : [] };
  }
  // with an active effect and no scene in the address, open the scene where the effect shows at this level
  const scene = rest[0] || effectAt(level)?.s;
  return { key: placeFromRoute(level, scene) || placeFromRoute(level) || ROOT };
}

function noteVisit(key) {
  if (pendingGo != null) { trail.length = pendingGo + 1; pendingGo = null; return; }
  if (trail.length >= 2 && trail[trail.length - 2] === key) trail.pop();
  else if (trail[trail.length - 1] !== key) trail.push(key);
}

/** Go to a place: back through history when it is where we came from (keeps one entry per place), else a new entry. */
function navigateTo(key) {
  const i = trail.lastIndexOf(key), n = trail.length - 1;
  if (i >= 0 && i < n && trail.slice(i + 1).every((k) => pathTo(k).includes(key))) { pendingGo = i; history.go(i - n); }
  else location.hash = routeOf(key);
}
const goUp = () => { const p = PLACES[place]?.parent; if (p && !world.busy) navigateTo(p); };

function diveVia(hs, btn) {
  if (world.busy) return;
  btn?.classList.add('wait');
  dismissHint();
  pendingHot = { from: place, hs };
  // a dot about one transmitter: show it alone there, and say on the 🧪 card what it does in the place we come from
  const role = hs.alone && DIVE_CHEM[`${place}>${hs.id}`];
  if (role) { pendingAlone = hs.alone; chemContext = { place: hs.to, title: PLACES[place]?.name, icon: PLACES[place]?.icon, item: role }; }
  location.hash = routeOf(hs.to);
}

const fallbackAnchor = (view) => ({ point: view.homeView().target, radius: view.visibleRadius() * 0.3 });

async function goTo(req) {
  const from = world.current;
  if (!from) {
    // a direct link: show the place right away, no dive
    const v = await world.prepare(req.key, { wait: false });
    world.show(v);
    v.toHome();
    return arrive(req);
  }
  if (place === req.key) return arrive(req, { same: true });
  closeSheet();
  hideTransient();
  const fromKey = place;
  const ph = pendingHot && pendingHot.from === fromKey && pendingHot.hs.to === req.key ? pendingHot.hs : null;
  pendingHot = null;
  const hs = ph || hotspotTo(fromKey, req.key);
  try {
    if (hs && hs.kind !== 'out') {
      const a = anchorFor(from, hs) || fallbackAnchor(from);
      if (from.kind === 'brain') calmBrain(from);
      const to = await world.prepare(req.key, { keepKey: fromKey });
      await world.dive(from, to, a.point, a.radius);
    } else if (hs) {
      const to = await world.prepare(req.key, { keepKey: fromKey });
      await world.swap(from, to, 4, 0.3, 1000);
    } else {
      const path = pathTo(fromKey), idx = path.indexOf(req.key);
      if (idx >= 0) {
        // one jump straight out to the chosen level, landing on the spot that leads back toward where we were
        // (owner's choice: no stopping at each level in between)
        await riseOne(req.key, hotspotTo(req.key, path[idx + 1]), 1100);
      } else {
        const back = hotspotTo(req.key, fromKey);
        if (back) await riseOne(req.key, back, 1000);
        else { const to = await world.prepare(req.key, { keepKey: fromKey }); await world.swap(from, to, 1.35, 0.75, 750); }
      }
    }
  } catch (e) {
    console.error(e);
    const v = await world.prepare(req.key, { wait: false });
    world.busy = false;
    world.show(v);
  }
  arrive(req);
  if (ph?.focus) landOn(ph.focus); // only for the dot that was clicked, not for any route that happens to lead here
}

/**
 * After diving through a dot with `focus` (e.g. the nose on the body → the smell neuron): glide on to those parts,
 * dim the rest and open the first one's card, so the dot leads to that very cell, not to the whole place.
 */
function landOn(ids) {
  const v = world.current;
  if (v?.kind !== 'stage') return;
  const st = v.stage;
  const box = st.partBox(ids[0], true).clone();
  ids.slice(1).forEach((id) => box.union(st.partBox(id, true)));
  if (box.isEmpty()) return;
  const f = st.frameBox(box, st.homeDir(), 1.3);
  st.animateCamera(f.target, f.position, 1.0);
  selected = ids[0];
  onlyDuringAnimation = false;
  st.focus(ids);
  dismissHint();
  openSheet();
  announce();
}

/** A merged dot was tapped: fly toward its parts until their dots are far enough apart to pick one. */
function zoomTo(points, screen) {
  const v = world.current;
  if (!v || world.busy) return;
  const e = v.engine;
  const target = points.reduce((a, p) => a.add(p), points[0].clone().set(0, 0, 0)).divideScalar(points.length);
  let gap = Infinity;
  for (let i = 0; i < screen.length; i++) for (let j = i + 1; j < screen.length; j++) gap = Math.min(gap, Math.hypot(screen[i][0] - screen[j][0], screen[i][1] - screen[j][1]));
  // on screen, distances grow about inversely with camera distance: aim for ~110 px between the closest two, but
  // keep the whole group within the middle of the view (a phone is narrow)
  const cx = screen.reduce((a, s) => a + s[0], 0) / screen.length, cy = screen.reduce((a, s) => a + s[1], 0) / screen.length;
  const ex = Math.max(...screen.map((s) => Math.abs(s[0] - cx))), ey = Math.max(...screen.map((s) => Math.abs(s[1] - cy)));
  const r = root.getBoundingClientRect();
  const fit = Math.max(ex / (r.width * 0.36), ey / (r.height * 0.3));
  const k = Math.min(0.6, Math.max(0.1, fit, Math.max(gap, 4) / 110));
  const pos = target.clone().add(e.camera.position.clone().sub(e.controls.target).multiplyScalar(k));
  dismissHint();
  e.animateCamera(target, pos, 0.9);
}

async function riseOne(parentKey, hs, ms) {
  const child = world.current;
  const parent = await world.prepare(parentKey);
  if (parent === child) return;
  if (!hs) await world.swap(child, parent, 0.35, 2.5, ms);
  else if (hs.kind === 'out') await world.swap(child, parent, 0.3, 4, ms);
  else { const a = anchorFor(parent, hs) || fallbackAnchor(parent); await world.rise(child, parent, a.point, a.radius, ms); }
  place = parentKey;
}

/** The dive always starts from the resting, detailed brain. */
function calmBrain(view) {
  brainTools?.stopPathway();
  view.scene.select(null);
  view.scene.focus([], { fly: false });
  view.scene.showSkin();
}

function arrive(req, { same = false } = {}) {
  const v = world.current;
  const changed = place !== req.key || !same;
  place = req.key;
  if (changed && !same) { selected = null; onlyDuringAnimation = false; }
  renderCrumbs();
  if (!same) hots.set(v, shownDots(place));
  if (place === ROOT) {
    brainTools ||= createBrainTools(v.scene, { rerender: () => { renderSheet(); renderTools(); }, fullscreenEl: root });
    brainTools.applyRoute(req);
    if (req.focus?.length === 1 && regionById[req.focus[0]]) { selected = req.focus[0]; openAfterArrive = true; }
    if (req.pathway) openAfterArrive = true;
  } else if (!same) applyEffect(v);
  if (!same) {
    // keep only the parent and the likely next places built; free the rest
    const keep = [place, PLACES[place]?.parent, ...(PLACES[place]?.hotspots || []).map((h) => h.to)].filter(Boolean);
    world.trim(keep);
    pruneModels(keep);
    prebuiltFor = null;
  }
  // a story step or a just-applied effect opens the panel on "Always" (where their boxes are); a picked part on "This level"
  const storyOrEffect = !!storyStepHere() || takeJustSet();
  if (storyOrEffect || openAfterArrive) { openAfterArrive = false; openSheet(); } else renderSheet();
  if (place === ROOT) runPendingAsk();
  if (!same) { toolsOpen = false; renderTools(); }
  renderHint();
  renderInfoChip();
  updateStatus();
  document.title = `${t(PLACES[place]?.name) || 'Explore'} · BrainWeb`;
  announce();
}

// ------------------------------------------------------------------ context for the Claude extension
/** What the user is looking at: the place and the tapped part (English name). */
function context() {
  const v = world?.current;
  const part = v ? (v.kind === 'brain' ? v.scene.selectedId : selected) || null : null;
  return { place, part, name: part && v ? partNameEn(v, part) : (PLACES[place]?.name?.en || null), route: location.hash };
}
function partNameEn(v, id) {
  if (v.kind === 'brain') return regionById[id]?.name?.en?.replace(/\s*\([^)]*\)\s*$/, '') || id;
  return v.stage.parts.get(id)?.name?.en || id;
}
function announce() {
  const c = context();
  window.dispatchEvent(new CustomEvent('brainweb:select', { detail: { place: c.place, part: c.part, name: c.name } }));
}
window.brainweb = { ...(window.brainweb || {}), context };
if (import.meta.env.DEV) window.__bwWorld = () => world; // dev only: lets test scripts reach the 3D world

// ------------------------------------------------------------------ world hooks
function say(view, text) { view.ui.caption = text; if (view === world.current) renderSheet(); }
function readout(view, html) {
  if (html === view.ui.readout) return;
  view.ui.readout = html;
  if (view === world.current) { const el = els.sheet.querySelector('#xsReadout'); if (el) el.innerHTML = html; }
}
function partName(view, id) {
  if (view.kind === 'brain') return regionById[id] ? shortName(regionById[id]) : id;
  const p = view.stage.parts.get(id);
  return p ? t(p.name) : id;
}
function hover(view, id, e) {
  if (view !== world.current || world.busy || !id || !e) { els.label.hidden = true; return; }
  const r = root.getBoundingClientRect();
  els.label.hidden = false;
  els.label.textContent = partName(view, id);
  els.label.style.left = `${e.clientX - r.left}px`;
  els.label.style.top = `${e.clientY - r.top}px`;
}
function select(view, id) {
  if (view !== world.current) return;
  selected = id;
  onlyDuringAnimation = false;
  // dim everything else so the picked part stands out (the brain highlights its own selection)
  if (view.kind === 'stage' && !view.stage.isolated && !view.stage.comparing) view.stage.focus(id ? [id] : []);
  if (id) { dismissHint(); els.label.hidden = true; storyNote('part', id); openSheet(); } else if (sheetOpen) renderSheet();
  announce();
}
function hideTransient() { els.label.hidden = true; }

function atRest() {
  const v = world.current;
  if (!v || world.busy) return false;
  const e = v.engine;
  return !e.tween && !e.moveTween;
}
function afterFrame() {
  const rest = atRest();
  hots.update(rest);
  // once the camera has been still for a moment, build the most likely next place in the background
  if (!rest) { restSince = 0; return; }
  const now = performance.now();
  if (!restSince) { restSince = now; return; }
  if (now - restSince < 900 || prebuiltFor === place) return;
  prebuiltFor = place;
  const hs = hots.firstVisible();
  const parent = PLACES[place]?.parent;
  const idle = window.requestIdleCallback || setTimeout;
  // arrived by a direct link: get the parent ready first, so flying out never waits
  const parentReady = !parent || (parent === ROOT ? world.brain?.modelLoaded : world.stages.some((s) => s.key === parent));
  if (!parentReady) { idle(() => world.prepare(parent).then(() => { prebuiltFor = null; restSince = 0; }).catch(() => {})); return; }
  const free = world.stages.filter((s) => s !== world.current);
  if (hs && hs.to !== ROOT_KEY && free.some((s) => !s.key || s.key !== parent)) {
    idle(() => world.prebuild(hs.to, parent));
  }
}

function updateStatus() {
  const v = world.current;
  let msg = '';
  if (v?.kind === 'brain' && !v.modelLoaded) msg = L('Loading the anatomical brain model…', 'טוען את מודל המוח האנטומי…');
  else if (v?.kind === 'stage' && v.failed) msg = '⚠️ ' + L('Could not load this scene’s data. Check your internet connection and try again.', 'לא ניתן היה לטעון את נתוני הסצנה. בדקו את החיבור לאינטרנט ונסו שוב.');
  else if (v?.kind === 'stage' && v.built?.ready && !v.loaded) {
    msg = L('Loading real 3D data…', 'טוען נתונים תלת-ממדיים אמיתיים…');
    v.ready.then(() => { v.loaded = true; if (v === world.current) updateStatus(); });
  }
  els.status.hidden = !msg;
  els.status.innerHTML = msg ? `<span>${msg.startsWith('⚠️') ? '' : '<span class="spinner"></span> '}${esc(msg)}</span>` : '';
}

// ------------------------------------------------------------------ zoom out by scroll / pinch, Esc
function bindZoomOut() {
  const atMax = () => { const v = world.current; return v && v.camera.position.distanceTo(v.controls.target) >= v.controls.maxDistance * 0.97; };
  let acc = 0;
  root.addEventListener('wheel', (e) => {
    if (world.busy || e.target.closest('.xw-sheet')) return;
    if (e.deltaY > 0 && atMax()) { acc += e.deltaY; if (acc > 160) { acc = 0; goUp(); } } else acc = 0;
  }, { passive: true, capture: true });
  const ptrs = new Map();
  let pinch = null;
  const dist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  root.addEventListener('pointerdown', (e) => { ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptrs.size === 2) pinch = { atMaxD: null }; }, true);
  root.addEventListener('pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size !== 2 || !pinch || pinch.fired) return;
    const d = dist();
    if (!atMax()) { pinch.atMaxD = null; return; }
    if (pinch.atMaxD == null) pinch.atMaxD = d;
    else if (pinch.atMaxD - d > 60) { pinch.fired = true; goUp(); }
  }, true);
  const up = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; };
  root.addEventListener('pointerup', up, true);
  root.addEventListener('pointercancel', up, true);
}

function onKey(e) {
  if (e.key !== 'Escape' || !root || root.hidden) return;
  if (document.querySelector('dialog[open]') || e.target.closest?.('input, select, textarea')) return;
  if (toolsOpen) { toolsOpen = false; renderTools(); return; }
  if (sheetOpen) { closeSheet(); return; }
  const v = world.current;
  const picked = v?.kind === 'brain' ? v.scene.selectedId || v.scene.focusIds.size || brainTools?.st.pathway : selected || v?.stage?.isolated || v?.stage?.comparing;
  if (picked) { clearSelection(); return; }
  goUp();
}
function clearSelection() {
  const v = world.current;
  selected = null;
  hideTransient();
  if (v.kind === 'stage') { v.stage.select(null); v.stage.focus([]); if (v.stage.isolated || v.stage.comparing) v.stage.restore(); }
  else { brainTools?.stopPathway(); v.scene.select(null); v.scene.focus([], { fly: false }); }
  renderSheet();
}

// ------------------------------------------------------------------ breadcrumb + ⓘ chip
function renderCrumbs() {
  if (!place) return;
  let path = pathTo(place);
  if (!path.length) path = [place];
  let items = path.map((k) => ({ k }));
  if (isPhone() && items.length > 3) items = [items[0], { k: path[path.length - 3], more: true }, ...items.slice(-2)];
  els.crumbs.setAttribute('aria-label', L('Where you are', 'איפה אתם נמצאים'));
  els.crumbs.innerHTML = items.map((it, i) => {
    const here = it.k === place;
    const p = PLACES[it.k];
    const label = it.more ? '…' : `<span aria-hidden="true">${p?.icon || ''}</span> ${tt(p?.name)}`;
    return `${i ? '<span class="sep" aria-hidden="true">›</span>' : ''}<button data-k="${it.k}" class="${here ? 'here' : ''}" ${here ? 'aria-current="location"' : ''} ${it.more ? `aria-label="${esc(t(p?.name))}"` : ''}>${label}</button>`;
  }).join('');
  els.crumbs.querySelectorAll('button:not(.here)').forEach((b) => b.addEventListener('click', () => navigateTo(b.dataset.k)));
  renderChem();
}
function renderInfoChip() {
  els.info.innerHTML = `<span class="i" aria-hidden="true">ⓘ</span> ${esc(L('About this', 'מידע'))}`;
  els.info.setAttribute('aria-expanded', String(sheetOpen));
  els.info.classList.toggle('busy', !!(getStory() || getEffect()));
  els.watch.innerHTML = `<span class="i" aria-hidden="true">▶</span> ${esc(L('Watch', 'צפייה'))}`;
  els.toolsBtn.hidden = place !== ROOT;
  els.toolsBtn.innerHTML = `<span class="i" aria-hidden="true">🛠</span> ${esc(L('Tools', 'כלים'))}`;
  root.classList.toggle('sheet-open', sheetOpen);
  renderChem();
}

// ------------------------------------------------------------------ 🧪 neurotransmitters involved (pathway or effect)
let chemHtml = null;
let pendingAlone = null; // 'See the molecule' / a dot with `alone`: the transmitter to show on its own in molecule/transmitters
// One transmitter's role in the place you came from, shown while you stay where it led: { place, title, icon, item }
let chemContext = null;
function renderChem(force = false) {
  if (!els.chem || !place) return;
  if (chemContext && place === chemContext.place) chemContext.seen = true;
  else if (chemContext?.seen) chemContext = null; // left that place: back to the pathway or effect
  const context = chemContext && place === chemContext.place ? chemContext : null;
  const atBrain = place === ROOT;
  const pid = atBrain ? brainTools?.st.pathway : null;
  const html = chemCardHtml(chemNow({ atBrain, pathway: pid ? pathwayById[pid] : null, stage: brainTools?.st.stage || 0, effect: getEffect(), context }));
  // just below the breadcrumb (which can wrap to two lines)
  els.chem.style.top = `${els.crumbs.offsetTop + els.crumbs.offsetHeight + 8}px`;
  if (html === chemHtml && !force) return;
  chemHtml = html;
  els.chem.hidden = !html;
  els.chem.innerHTML = html;
  if (html) bindChemCard(els.chem, { rerender: () => renderChem(true), onMolecule: showMolecule });
}
function showMolecule(id, context = null) {
  const key = 'molecule/transmitters';
  if (context) chemContext = { ...context, place: key };
  if (place === key && world.current?.kind === 'stage') { world.current.stage.isolate(id); selected = id; openSheet(); return; }
  pendingAlone = id;
  openAfterArrive = true;
  location.hash = routeOf(key);
}

// ------------------------------------------------------------------ first-visit hint (instead of a tour)
function renderHint() {
  const show = place === ROOT && !load('hintSeen', false);
  els.hint.hidden = !show;
  if (show) els.hint.textContent = L('Drag to turn · tap a glowing dot to go inside', 'גררו כדי לסובב · הקישו על נקודה זוהרת כדי להיכנס פנימה');
}
function dismissHint() { if (!load('hintSeen', false)) save('hintSeen', true); if (els.hint) els.hint.hidden = true; }

// ------------------------------------------------------------------ 🛠 tools menu (brain only)
function renderTools() {
  if (!els.tools) return;
  const open = toolsOpen && place === ROOT && !!brainTools;
  els.tools.hidden = !open;
  els.toolsBtn.setAttribute('aria-expanded', String(open));
  els.toolsBtn.classList.toggle('on', open);
  if (!open) { els.tools.innerHTML = ''; return; }
  els.tools.innerHTML = `<div class="row"><b>🛠 ${esc(L('Tools', 'כלים'))}</b><span class="spacer"></span><button class="icon-btn" data-tools-close aria-label="${esc(L('Close', 'סגירה'))}">✕</button></div>${brainTools.toolsHtml()}`;
  els.tools.querySelector('[data-tools-close]').addEventListener('click', () => { toolsOpen = false; renderTools(); });
  brainTools.bind(els.tools);
}

// ------------------------------------------------------------------ an AI question from the search box
export function exploreAsk(q) {
  pendingAsk = q;
  if (root && !root.hidden && place === ROOT && brainTools) runPendingAsk();
  else location.hash = '#/explore/organ';
}
function runPendingAsk() {
  if (!pendingAsk || !brainTools) return;
  const q = pendingAsk;
  pendingAsk = null;
  openSheet();
  brainTools.ask(q);
}

// ------------------------------------------------------------------ 🧪 effects (opened from ▶ Watch)
function pickEffect() {
  const v = world.current;
  const level = place.split('/')[0];
  openEffectPicker((e) => {
    const href = bestTarget(e, level);
    openAfterArrive = true;
    if (href && href !== location.hash) location.hash = href;
    else { if (v.kind === 'stage') { v.build(place, v.def); world.show(v); world.hooks.decorate(v); hots.set(v, shownDots(place)); applyEffect(v); } openSheet(); }
  });
}

/** In-scene dots of a place: only those that lead into the very part they sit on (see DOTS in ./graph.js). */
const hotsFor = (key) => dotsOf(key);
/** The dots drawn in the scene: the ways in, plus a label-only mark on the real model (e.g. "one synapse is here").
 *  A mark has no part of its own in the drawn view, so it only shows while the real model is on screen. */
const shownDots = (key) => {
  const m = REAL_NOTES[key]?.mark;
  return m ? [...hotsFor(key), { id: 'mark', part: '__mark', kind: 'mark', at: m.at, label: m.label }] : hotsFor(key);
};

// ------------------------------------------------------------------ the ⓘ card
// Same layout on every level: name → short text → the main action ("Go inside") → animations → "More".
function openSheet() { sheetOpen = true; hideTransient(); renderSheet(); }
function closeSheet() {
  if (!els.sheet || !sheetOpen) return;
  sheetOpen = false;
  sheetBig = false;
  els.sheet.classList.remove('open', 'big');
  els.sheet.setAttribute('aria-hidden', 'true');
  renderInfoChip();
  updateOffset();
}
function updateOffset() {
  if (!world) return;
  if (!sheetOpen) return world.setOffset(0, 0);
  if (isPhone()) world.setOffset(0, Math.min(els.sheet.offsetHeight, root.clientHeight * 0.6) / 2);
  else world.setOffset((getLang() === 'he' ? -1 : 1) * els.sheet.offsetWidth / 2, 0);
}

function renderSheet() {
  if (!root || !sheetOpen || !world.current || !place) { renderInfoChip(); return; }
  const v = world.current;
  const p = PLACES[place] || {};
  const [level, sceneId] = place.split('/');
  const brain = v.kind === 'brain';
  const def = v.def;
  const actions = v.built?.actions || [];
  const hsList = p.hotspots || [];
  const goList = hotsFor(place);
  const hsFor = (id) => goList.find((h) => h.part === id);
  const intro = brain ? BRAIN_INTRO : def?.intro;
  const chapters = def?.chapters;
  const arrow = (h) => (h.kind === 'method' ? '🔬' : h.kind === 'out' ? '↗' : '↘');
  const diveBtn = (h) => `<button class="btn xs-divein" data-go="${h.id}">${arrow(h)} ${esc(L('Go inside', 'כניסה פנימה'))}: ${tt(h.label)}</button>`;
  let partHtml = '';
  const sel = brain ? v.scene.selectedId : selected; // brain tools (search, ventricles…) select regions too
  if (sel && brain) { const h = hsFor(sel); partHtml = brainTools.regionHtml(sel, h ? diveBtn(h) : ''); }
  else if (!brain && selected && v.stage.parts.get(selected)) partHtml = stagePartHtml(v, v.stage.parts.get(selected), hsFor(selected));
  const goHtml = goList.length ? `<div class="xs-go">${goList.map((h, i) => `<button class="${i ? 'btn ghost' : 'btn'}" data-go="${h.id}">${arrow(h)} ${tt(h.label)}</button>`).join('')}</div>` : '';
  const modeHtml = MODELS[place] && v.model ? `<div class="seg xs-mode" role="group" aria-label="${esc(L('View', 'תצוגה'))}">
      <button class="toggle ${v.realMode ? 'on' : ''}" data-mode="real" aria-pressed="${!!v.realMode}">🔬 ${esc(L('Real model', 'מודל אמיתי'))}</button>
      <button class="toggle ${v.realMode ? '' : 'on'}" data-mode="interactive" aria-pressed="${!v.realMode}">🧩 ${esc(L('Interactive', 'אינטראקטיבי'))}</button></div>` : '';
  // "More": only what belongs to this place (other places live in ▶ Watch → All places and in 🔍 search)
  const moreInner = [
    modeHtml,
    chapters ? `<p class="small muted">📚 ${esc(L('Book chapters', 'פרקים בספר'))}: ${chapters.join(', ')}</p>` : '',
  ].join('');

  // animations: the first 3 in view, the rest one tap away (open when one of them is running)
  const actBtn = (a, i) => `<button class="toggle action ${v.ui.acts[i] ? 'on' : ''}" data-act="${i}" ${a.toggle || a.radio ? `aria-pressed="${!!v.ui.acts[i]}"` : ''}>${a.icon || '▶'} ${tt(a.label)}</button>`;
  const extraOn = actions.slice(3).some((_, j) => v.ui.acts[j + 3]);
  const animHtml = actions.length ? `<section><h4>▶ ${esc(L('Animations', 'אנימציות'))}</h4><div class="xs-row">${actions.slice(0, 3).map(actBtn).join('')}</div>${actions.length > 3 ? `<details class="xs-more-anim" ${extraOn ? 'open' : ''}><summary>${esc(L('More animations', 'עוד אנימציות'))} (${actions.length - 3})</summary><div class="xs-row">${actions.slice(3).map((a, j) => actBtn(a, j + 3)).join('')}</div></details>` : ''}</section>` : '';

  // an action with `choose` opens a row of choices: pick one (or two, to compare) instead of stepping through them
  const pk = v.ui.picker, pa = pk && actions[pk.i];
  const pickHtml = pa?.choose ? `<div class="xs-pick" role="group" aria-label="${esc(tt(pa.label))}"><p class="small muted">${pa.choose.n === 2 ? esc(L('Choose two to compare:', 'בחרו שניים להשוואה:')) : esc(L('Choose one:', 'בחרו אחד:'))}</p><div class="xs-row">${pa.choose.options.map((o) => `<button class="toggle sm ${pk.sel.includes(o.id) ? 'on' : ''}" data-pick="${o.id}" aria-pressed="${pk.sel.includes(o.id)}">${tt(o.label)}</button>`).join('')}</div></div>` : '';

  els.sheet.innerHTML = `
    <div class="xs-grab" aria-hidden="true"></div>
    <div class="xs-head">
      <span class="xs-icon" aria-hidden="true">${p.icon || ''}</span><h2>${tt(p.name)}</h2><span class="spacer"></span>
      <button class="icon-btn xs-grow" data-sheet="grow" aria-label="${esc(sheetBig ? L('Smaller', 'הקטנה') : L('Bigger', 'הגדלה'))}">${sheetBig ? '▾' : '▴'}</button>
      <button class="icon-btn" data-sheet="close" aria-label="${esc(L('Close', 'סגירה'))}">✕</button>
    </div>
    ${storyBoxHtml()}
    ${level !== 'methods' ? effectBoxHtml(level, brain ? 'brain' : sceneId) : ''}
    ${brain ? brainTools.playerHtml() + brainTools.askHtml() : ''}
    ${v.realMode && REAL_NOTES[place] ? `<section class="xs-real"><h4>🔬 ${esc(L('What you\'re seeing', 'מה רואים כאן'))}</h4><p>${tt(REAL_NOTES[place].note)}</p><button class="btn ghost sm" data-mode="interactive">🧩 ${esc(L('Show the drawn view', 'להציג את התצוגה המצוירת'))}</button></section>` : ''}
    ${partHtml || `${intro ? `<p class="xs-intro">${tt(intro)}</p>` : ''}${goHtml}`}
    ${animHtml}
    ${pickHtml}
    ${v.ui.caption ? `<div class="caption-box">${tt(v.ui.caption)}</div>` : ''}
    <div id="xsReadout" class="readout">${v.ui.readout || ''}</div>
    <div id="xsExtra"></div>
    ${moreInner ? `<details class="xs-more"><summary>${esc(L('More', 'עוד'))}</summary>${moreInner}</details>` : ''}`;

  els.sheet.classList.add('open');
  els.sheet.classList.toggle('big', sheetBig);
  els.sheet.setAttribute('aria-hidden', 'false');
  const s = els.sheet;
  s.querySelector('[data-sheet="close"]').addEventListener('click', closeSheet);
  s.querySelector('[data-sheet="grow"]').addEventListener('click', () => { sheetBig = !sheetBig; renderSheet(); });
  bindSheetDrag(s);
  s.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => runAction(v, +b.dataset.act)));
  s.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => pickChoice(v, b.dataset.pick)));
  s.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { v.modeWanted = b.dataset.mode; setMode(v, b.dataset.mode); renderSheet(); }));
  s.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { const h = hsList.find((x) => x.id === b.dataset.go); if (h) { closeSheet(); diveVia(h, hots.find(h.id)?.btn); } }));
  bindEffectBox(s);
  bindStoryBox(s);
  if (selected && !brain) bindPartTools(s, v, selected);
  s.querySelector('[data-back]')?.addEventListener('click', clearSelection);
  if (brain) brainTools.bind(s);
  if (!partHtml && v.built?.dock) v.built.dock(s.querySelector('#xsExtra'));
  renderInfoChip();
  requestAnimationFrame(updateOffset);
}

/** Phones: drag the handle up for more, down to shrink or close; a tap toggles the size. */
function bindSheetDrag(s) {
  if (!isPhone()) return;
  const grab = s.querySelector('.xs-grab');
  let y0 = null;
  grab.addEventListener('pointerdown', (e) => { y0 = e.clientY; grab.setPointerCapture(e.pointerId); });
  grab.addEventListener('pointerup', (e) => {
    if (y0 == null) return;
    const dy = e.clientY - y0;
    y0 = null;
    if (Math.abs(dy) < 8) { sheetBig = !sheetBig; renderSheet(); }
    else if (dy < -40) { sheetBig = true; renderSheet(); }
    else if (dy > 40) { if (sheetBig) { sheetBig = false; renderSheet(); } else closeSheet(); }
  });
  grab.addEventListener('pointercancel', () => { y0 = null; });
}

function stagePartHtml(v, p, h) {
  const st = v.stage;
  const others = [...st.parts.values()].filter((x) => x.id !== p.id && !st.partBox(x.id, true).isEmpty());
  const alone = st.isolated?.length === 1 && st.isolated[0] === p.id;
  const [short, rest] = firstSentences(t(p.desc), 2);
  return `<section class="xs-part">
    <div class="row"><span class="swatch" style="background:${p.color || '#888'}"></span><h3>${tt(p.name)}</h3></div>
    <p>${esc(short)}</p>
    ${onlyDuringAnimation ? `<p class="caption-box">▶ ${esc(L('This part appears only while an animation runs — press an animation below to see it.', 'החלק הזה מופיע רק בזמן שאנימציה פועלת — הפעילו אנימציה למטה כדי לראות אותו.'))}</p>` : ''}
    ${h ? `<button class="btn xs-divein" data-go="${h.id}">↘ ${esc(L('Go inside', 'כניסה פנימה'))}: ${tt(h.label)}</button>` : p.link ? `<a class="btn xs-divein" href="${p.link.href}">${p.link.icon || '↘'} ${tt(p.link.label)}</a>` : ''}
    <details class="xs-more" ${alone || st.comparing ? 'open' : ''}><summary>${esc(L('More about it', 'עוד על זה'))}</summary>
      ${rest ? `<p>${esc(rest)}</p>` : ''}
      <div class="xs-row">${alone ? `<button class="btn ghost sm" data-pt="all">🌐 ${esc(L('Show everything', 'הצגת הכול'))}</button>` : `<button class="btn ghost sm" data-pt="alone">🔍 ${esc(L('Show it alone', 'הצגה לבד'))}</button>`}</div>
      ${others.length ? `<div class="compare-row"><label>⚖️ ${esc(L('Compare with', 'השוואה עם'))}
        <select data-pt="with"><option value="">—</option>${others.map((o) => `<option value="${o.id}" ${st.comparing?.[1] === o.id ? 'selected' : ''}>${esc(t(o.name))}</option>`).join('')}</select></label>
        <span class="seg"><button class="toggle sm on" data-lay="side" aria-label="${esc(L('Side by side', 'זה לצד זה'))}">⇆</button><button class="toggle sm" data-lay="stack" aria-label="${esc(L('Above and below', 'זה מעל זה'))}">⇅</button></span></div>` : ''}
      ${p.chapters ? `<p class="small muted">📚 ${esc(L('Book chapters', 'פרקים בספר'))}: ${p.chapters.join(', ')}</p>` : ''}
    </details>
    <button class="btn ghost sm" data-back>← ${esc(L('Back to this level', 'חזרה לרמה הזו'))}</button>
  </section>`;
}
function bindPartTools(s, v, id) {
  const st = v.stage;
  const scene = () => { v.modeWanted = 'interactive'; if (v.realMode) setMode(v, 'interactive'); }; // show-alone / compare work on the scene's parts
  s.querySelector('[data-pt="alone"]')?.addEventListener('click', () => {
    scene();
    st.isolate(id);
    // some parts exist only while an animation runs (e.g. a released molecule): explain instead of an empty view
    onlyDuringAnimation = st.partBox(id).isEmpty();
    if (onlyDuringAnimation) st.restore({ camera: false });
    renderSheet();
  });
  s.querySelector('[data-pt="all"]')?.addEventListener('click', () => { st.restore(); renderSheet(); });
  let layout = 'side';
  const go = () => { const w = s.querySelector('[data-pt="with"]')?.value; if (w) { scene(); st.compare(id, w, { layout }); } };
  s.querySelector('[data-pt="with"]')?.addEventListener('change', go);
  s.querySelectorAll('[data-lay]').forEach((b) => b.addEventListener('click', () => {
    layout = b.dataset.lay;
    s.querySelectorAll('[data-lay]').forEach((x) => x.classList.toggle('on', x === b));
    go();
  }));
}

// ------------------------------------------------------------------ scene buttons, effects and stories
function runAction(v, i, { auto = false } = {}) {
  const a = v.built?.actions?.[i];
  if (!a) return;
  if (!auto) storyNote('act', a.label.en); // a story step that asks the learner to press this button
  const st = v.stage;
  st.focus([]);
  if (st.isolated || st.comparing) st.restore({ camera: false });
  // the scene's buttons need its own parts (also if the model is still arriving), unless the button works on the
  // sourced model itself (`onModel`, e.g. the actin–myosin model contracting)
  if (!(a.onModel && v.model?.logic)) { v.modeWanted = 'interactive'; if (v.realMode) setMode(v, 'interactive'); }
  const acts = v.ui.acts;
  if (a.choose) {
    // open (or close) the row of choices; nothing runs until the user picks
    const open = v.ui.picker?.i === i;
    v.ui.picker = open ? null : { i, sel: [] };
    v.built.actions.forEach((x, j) => { if (x.choose) acts[j] = false; });
    acts[i] = !open;
  } else if (a.radio) {
    // one-of-many modes
    v.built.actions.forEach((x, j) => { if (x.radio) acts[j] = j === i; });
    a.run?.();
  } else if (a.toggle) {
    // independent on/off switch; run receives the new state
    acts[i] = !acts[i];
    const res = a.run?.(acts[i]);
    if (typeof res === 'boolean') acts[i] = res;
  } else a.run?.();
  st.needsRender = true;
  if (a.caption) v.ui.caption = a.caption;
  if (v === world.current) renderSheet();
}

/** A choice in an action's picker: one → run at once; two → run when two are picked (a third replaces the oldest). */
function pickChoice(v, id) {
  const pk = v.ui.picker, a = pk && v.built?.actions?.[pk.i];
  if (!a?.choose) return;
  const n = a.choose.n || 1;
  if (pk.sel.includes(id)) pk.sel = pk.sel.filter((x) => x !== id);
  else { pk.sel.push(id); if (pk.sel.length > n) pk.sel.shift(); }
  const st = v.stage;
  st.focus([]);
  if (st.isolated || st.comparing) st.restore({ camera: false });
  if (pk.sel.length === n) a.choose.run(n === 1 ? pk.sel[0] : [...pk.sel]);
  st.needsRender = true;
  if (v === world.current) renderSheet();
}

/** Press the scene's own buttons (and isolate/compare parts) to show the active story step or effect here. */
let effectRun = 0;
async function applyEffect(v) {
  const run = ++effectRun;
  if (pendingAlone && place === 'molecule/transmitters') {
    // 'See the molecule' from the 🧪 card wins over a story step or effect here
    const id = pendingAlone;
    pendingAlone = null;
    try { await v.ready; } catch { /* the card's sentence still explains it */ }
    if (run !== effectRun || world.current !== v) return;
    v.stage.isolate(id); selected = id; renderSheet();
    return;
  }
  const [level, sceneId] = place.split('/');
  const step = storyStepHere();
  const entry = step || effectAt(level);
  if (!entry || (!step && entry.s !== sceneId)) return;
  v.modeWanted = 'interactive'; // also wins over a model that is still loading (first visit by a direct link)
  if (v.realMode) { setMode(v, 'interactive'); renderSheet(); }
  // scenes that load real data (molecules, proteins, neurons, body) expose a `ready` promise
  try { await v.ready; } catch { /* data failed: the note still explains the effect */ }
  const live = () => run === effectRun && world.current === v;
  if (!live()) return;
  const actions = v.built?.actions || [];
  let delay = 350;
  for (const sub of entry.acts || []) {
    const i = actions.findIndex((a) => a.label.en.includes(sub));
    if (i < 0) continue;
    setTimeout(() => { if (live() && !((actions[i].toggle || actions[i].radio) && v.ui.acts[i])) runAction(v, i, { auto: true }); }, delay);
    delay += 700;
  }
  setTimeout(() => {
    if (!live()) return;
    const st = v.stage;
    if (entry.alone) { st.isolate(entry.alone); selected = entry.alone; }
    else if (entry.cmp) st.compare(entry.cmp[0], entry.cmp[1], { layout: entry.cmp[2] || 'side' });
    else if (entry.show) st.focus(entry.show);
    renderSheet();
  }, delay);
}
