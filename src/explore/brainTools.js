// The brain's tools: the ⓘ card's region info, pathway step player and AI answer, plus the 🛠 tools menu
// (see-through, split, colours, slicing, auto-rotate, skull / arteries / ventricles). Search lives in src/views/searchDialog.js.
import { REGION_COLORS } from '../brain/brainParts.js';
import { PATHWAYS, pathwayById } from '../brain/pathways.js';
import { regionById, GROUPS, allLessons, chapterByN, lessonById } from '../../content/index.js';
import { askBrain } from './ai.js';
import { ui, t, getLang } from '../i18n.js';
import { esc, tt } from '../util.js';
import { fullscreenButtonHtml, bindFullscreen } from '../visual/fullscreen.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
export const shortName = (r) => t(r.name).replace(/\s*\([^)]*\)\s*$/, '');
const swatch = (c) => `<span class="swatch" style="background:${c}"></span>`;
/** Split a text after its first `n` sentences → [first part, the rest ('' when nothing is left)]. */
export function firstSentences(text, n = 2) {
  const parts = String(text || '').split(/(?<=[.!?])\s+/);
  return [parts.slice(0, n).join(' '), parts.slice(n).join(' ')];
}

/** `ctx`: { rerender(), openSheet(), fullscreenEl } */
export function createBrainTools(scene, ctx) {
  const st = { seeThrough: false, split: false, rotate: false, color: 'natural', clip: 'none', clipPos: 0, skull: false, arteries: false, ventricles: false,
    pathway: null, stage: 0, ask: null, note: null };

  function playPathway(id) {
    const p = pathwayById[id];
    if (!p) return;
    st.pathway = id;
    st.stage = 0;
    scene.select(null);
    scene.pathways.stepMode = true;
    scene.playPathway(p, {
      onStage: (i) => { st.stage = i; ctx.rerender(); },
      onEnd: () => ctx.rerender(),
      onWait: () => ctx.rerender(),
    });
  }
  function stopPathway() {
    if (!st.pathway) return;
    st.pathway = null;
    scene.stopPathway();
  }
  function focusRegions(ids, { select = true } = {}) {
    stopPathway();
    scene.focus(ids);
    if (select && ids.length === 1) scene.select(ids[0]);
  }
  /** The organ route: #/explore/organ[/<ids> | /path/<id>]. */
  function applyRoute({ focus = [], pathway = null }) {
    if (pathway && pathwayById[pathway]) { if (st.pathway !== pathway) playPathway(pathway); return true; }
    if (focus.length) { focusRegions(focus.filter((id) => regionById[id])); return true; }
    if (st.pathway) { stopPathway(); }
    return false;
  }
  function reset() {
    stopPathway();
    st.ask = null; st.note = null;
    scene.select(null);
    scene.focus([], { fly: false });
    scene.resetView();
  }

  // ---------------------------------------------------------------- HTML
  /** The tapped region's card: name, short text, `primary` (e.g. the dive button), then everything else under "More". */
  const regionHtml = (id, primary = '') => {
    const r = regionById[id];
    if (!r) return '';
    const related = allLessons.filter((l) => (l.regions || []).includes(id));
    const paths = PATHWAYS.filter((p) => p.stages.some((s) => (s.regions || []).includes(id))).slice(0, 4);
    const [short, rest] = firstSentences(t(r.desc), 2); // the card shows two sentences; the rest is under "More about it"
    return `<section class="xs-part">
      <div class="row">${swatch(REGION_COLORS[id])}<h3>${tt(r.name)}</h3><span class="badge">${tt(GROUPS[r.group])}</span></div>
      <p>${esc(short)}</p>
      ${primary}
      <details class="xs-more"><summary>${esc(L('More about it', 'עוד על זה'))}</summary>
      ${rest ? `<p>${esc(rest)}</p>` : ''}
      <h4>${esc(ui('functions'))}</h4>
      <ul>${t(r.functions).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      ${paths.length ? `<h4>⚡ ${esc(ui('pathways'))}</h4><div class="chips">${paths.map((p) => `<a class="chip" href="#/explore/organ/path/${p.id}">${p.icon} ${tt(p.name)}</a>`).join('')}</div>` : ''}
      <h4>${esc(ui('relatedLessons'))}</h4>
      <div>${related.slice(0, 6).map((l) => `<a class="result" href="#/test/sub/${l.id}"><b>${l.id}</b> ${tt(l.title)}</a>`).join('') || r.chapters.map((n) => `<a class="result" href="#/test/ch/${n}">${esc(ui('chapter'))} ${n}: ${tt(chapterByN[n].title)}</a>`).join('')}</div>
      </details>
    </section>`;
  };

  const playerHtml = () => {
    const p = pathwayById[st.pathway];
    if (!p) return '';
    const s = p.stages[st.stage];
    const pw = scene.pathways;
    const last = st.stage === p.stages.length - 1;
    const ended = last && !pw.playing;
    const lessons = (p.lessons || []).map((id) => lessonById[id]).filter(Boolean);
    // learner-paced: each step draws once, then waits for "Next step" (one big button, the only primary one)
    const main = ended
      ? `<button class="btn" data-bt="play">↻ ${esc(ui('replay'))}</button>`
      : pw.playing
        ? `<button class="btn" disabled><span class="spinner"></span> ${esc(L('Drawing this step…', 'מצייר את השלב…'))}</button>`
        : `<button class="btn" data-bt="next">${esc(L('Next step', 'לשלב הבא'))} ${getLang() === 'he' ? '‹' : '›'}</button>`;
    return `<section class="xs-player">
      <div class="row">${swatch(p.color)}<h3>${p.icon} ${tt(p.name)}</h3><span class="spacer"></span><button class="icon-btn" data-bt="stopPath" aria-label="${esc(ui('close'))}">✕</button></div>
      ${p.stimulus ? `<div class="small">⚡ ${esc(ui('stimulus'))}: <b>${tt(p.stimulus)}</b></div>` : ''}
      <div class="steps">${p.stages.map((_, i) => `<button class="dot ${i === st.stage ? 'on' : i < st.stage ? 'past' : ''}" data-step="${i}" aria-label="${esc(ui('step'))} ${i + 1}">${i + 1}</button>`).join('')}</div>
      <p class="caption"><b>${esc(ui('step'))} ${st.stage + 1}/${p.stages.length}:</b> ${tt(s?.caption)}</p>
      <div class="row">
        <button class="btn ghost sm" data-bt="prev" ${st.stage === 0 ? 'disabled' : ''} aria-label="${esc(ui('prev'))}">${getLang() === 'he' ? '›' : '‹'}</button>
        ${main}
      </div>
      <details class="xs-more"><summary>${esc(L('More', 'עוד'))}</summary>
        <p class="small muted">${tt(p.desc)}</p>
        <div class="row"><button class="toggle sm" data-bt="playAll">▶ ${esc(L('Play all steps without stopping', 'הפעלת כל השלבים ברצף'))}</button>
        <label class="small muted">${esc(ui('speed'))} <select data-bt="speed">${[0.5, 1, 1.5, 2].map((x) => `<option ${pw.speed === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
        ${lessons.length ? `<div class="small">${esc(ui('relatedLessons'))}: ${lessons.map((l) => `<a href="#/test/sub/${l.id}">${l.id}</a>`).join(' · ')}</div>` : ''}
      </details>
    </section>`;
  };

  const askHtml = () => {
    if (!st.ask) return '';
    const { q, loading, answer: a, error } = st.ask;
    let body;
    if (loading) body = `<div class="row"><span class="spinner"></span><b>${esc(L('Thinking…', 'חושב…'))}</b></div>`;
    else if (error) body = `<p>⚠️ ${esc(error)}</p><a class="btn secondary sm" href="#/settings">⚙ ${esc(ui('settings'))}</a>`;
    else {
      // tolerate loose answers: missing lists or text never break the sheet
      const regionIds = Array.isArray(a?.regionIds) ? a.regionIds : [];
      const lessons = (Array.isArray(a?.lessonIds) ? a.lessonIds : []).map((id) => lessonById[id]).filter(Boolean);
      const p = a?.pathwayId && pathwayById[a.pathwayId];
      body = `<p>${esc(t({ en: a?.answer_en || a?.answer_he || '', he: a?.answer_he || a?.answer_en || '' }))}</p>
        ${regionIds.length ? `<div class="chips">${regionIds.filter((id) => regionById[id]).map((id) => `<button class="chip" data-region="${id}">${swatch(REGION_COLORS[id])} ${esc(shortName(regionById[id]))}</button>`).join('')}</div>` : ''}
        ${p ? `<a class="btn sm" href="#/explore/organ/path/${p.id}">⚡ ${esc(ui('playPathway'))}: ${tt(p.name)}</a>` : ''}
        ${lessons.length ? `<h4>${esc(ui('relatedLessons'))}</h4>${lessons.map((l) => `<a class="result" href="#/test/sub/${l.id}"><b>${l.id}</b> ${tt(l.title)}</a>`).join('')}` : ''}`;
    }
    return `<section class="xs-ask"><div class="row"><span class="badge">✨ AI</span><b>${esc(q)}</b><span class="spacer"></span><button class="icon-btn" data-bt="closeAsk" aria-label="${esc(ui('close'))}">✕</button></div>${body}</section>`;
  };

  const noteHtml = () => (st.note ? `<div class="caption-box"><b>${esc(st.note.title)}</b><br>${esc(st.note.text)}</div>` : '');

  const toolsHtml = () => {
    const tg = (id, on, label, title = '') => `<button class="toggle ${on ? 'on' : ''}" data-bt="${id}" aria-pressed="${on}" ${title ? `title="${esc(title)}"` : ''}>${label}</button>`;
    return `<section class="xs-tools">
      <h4>🛠 ${esc(L('Tools', 'כלים'))}</h4>
      <div class="xs-row">
        ${tg('see', st.seeThrough, `👁 ${esc(ui('seeThrough'))}`)}
        ${tg('split', st.split, `↔ ${esc(ui('splitHemis'))}`)}
        ${tg('color', st.color === 'atlas', `🎨 ${esc(ui(st.color === 'atlas' ? 'atlasColors' : 'naturalColors'))}`)}
        ${tg('rotate', st.rotate, `⟳ ${esc(ui('autoRotate'))}`)}
        ${tg('skull', st.skull, `💀 ${esc(L('Skull', 'גולגולת'))}`, L('The skull bones and the tentorium (a fold of the dura mater)', 'עצמות הגולגולת והטנטוריום (קפל של הקרום הקשה)'))}
        ${tg('arteries', st.arteries, `🩸 ${esc(L('Arteries', 'עורקים'))}`)}
        ${tg('ventricles', st.ventricles, `💧 ${esc(L('Ventricles', 'חדרי המוח'))}`)}
      </div>
      <label class="xs-slice">✂ ${esc(ui('slice'))}
        <select data-bt="clip">${['none', 'sagittal', 'coronal', 'horizontal'].map((m) => `<option value="${m}" ${st.clip === m ? 'selected' : ''}>${esc(ui('slice_' + m))}</option>`).join('')}</select>
        <input type="range" data-bt="clipPos" min="-1" max="1" step="0.02" value="${st.clipPos}" ${st.clip === 'none' ? 'hidden' : ''} aria-label="${esc(ui('slice'))}"/></label>
      <div class="xs-row">
        <button class="toggle" data-bt="reset">⌂ ${esc(ui('resetView'))}</button>
        ${fullscreenButtonHtml()}
      </div>
      ${noteHtml()}
      <p class="small muted">${esc(ui('modelCredit'))}</p>
    </section>`;
  };

  // ---------------------------------------------------------------- behaviour
  async function ask(q) {
    st.ask = { q, loading: true };
    ctx.rerender();
    try { st.ask = { q, answer: await askBrain(q) }; } catch (e) { st.ask = { q, error: e.message }; }
    const a = st.ask.answer;
    if (Array.isArray(a?.regionIds) && a.regionIds.length) { stopPathway(); scene.focus(a.regionIds.filter((id) => regionById[id])); }
    ctx.rerender();
  }

  function note(title, text) { st.note = { title, text }; }

  function bind(root) {
    const on = (sel, ev, fn) => root.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, fn));
    const flip = (key) => { st[key] = !st[key]; return st[key]; };
    const handlers = {
      see: () => scene.setSeeThrough(flip('seeThrough')),
      split: () => scene.setSplit(flip('split')),
      rotate: () => scene.setAutoRotate(flip('rotate')),
      color: () => { st.color = st.color === 'atlas' ? 'natural' : 'atlas'; scene.setColorMode(st.color); },
      skull: () => {
        const v = flip('skull');
        scene.setExtra('skull', v);
        st.note = v ? { title: '💀 ' + L('Skull & meninges', 'גולגולת וקרומי המוח'), text: L('The skull protects the brain. Under it lie three meninges (dura, arachnoid, pia); the grey sheet between the cerebrum and cerebellum is the tentorium, a fold of the dura.', 'הגולגולת מגינה על המוח. מתחתיה שלושה קרומי מוח (הקשה, העכבישי והרך); היריעה האפורה בין המוח הגדול למוח הקטן היא הטנטוריום, קפל של הקרום הקשה.') } : null;
      },
      arteries: () => {
        const v = flip('arteries');
        scene.setExtra('arteries', v);
        if (v) {
          st.seeThrough = true; scene.setSeeThrough(true);
          st.note = { title: '🩸 ' + L('Arteries of the brain', 'עורקי המוח'), text: L('The circle of Willis: the two internal carotid arteries and the basilar artery join in a ring under the brain, then branch into the anterior, middle and posterior cerebral arteries. A blocked branch causes a stroke.', 'מעגל ויליס: שני עורקי התרדמה הפנימיים והעורק הבזילרי מתחברים בטבעת מתחת למוח, ומשם מתפצלים לעורקי המוח הקדמי, האמצעי והאחורי. ענף חסום גורם לשבץ.') };
        } else st.note = null;
      },
      ventricles: () => {
        if (flip('ventricles')) { stopPathway(); scene.setSeeThrough(true); scene.focus(['ventricles']); scene.select('ventricles'); }
        else { scene.setSeeThrough(st.seeThrough); scene.focus([], { fly: false }); scene.select(null); }
      },
      reset: () => reset(),
      stopPath: () => { stopPathway(); history.replaceState(null, '', '#/explore/organ'); },
      prev: () => scene.pathways.prev(),
      next: () => scene.pathways.next(),
      play: () => { scene.pathways.stepMode = true; scene.pathways.replay(); },
      playAll: () => { const pw = scene.pathways; pw.stepMode = false; if (st.stage === pathwayById[st.pathway].stages.length - 1) pw.replay(); else pw.playing = true; },
      closeAsk: () => { st.ask = null; },
    };
    on('button[data-bt]', 'click', (e) => { const k = e.currentTarget.dataset.bt; handlers[k]?.(); ctx.rerender(); });
    on('select[data-bt="speed"]', 'change', (e) => { scene.pathways.speed = +e.target.value; });
    const clip = root.querySelector('select[data-bt="clip"]'), pos = root.querySelector('input[data-bt="clipPos"]');
    clip?.addEventListener('change', () => { st.clip = clip.value; pos.hidden = st.clip === 'none'; scene.setClip(st.clip, +pos.value); scene.refreshMaterials(); });
    pos?.addEventListener('input', () => { st.clipPos = +pos.value; scene.setClip(st.clip, st.clipPos); });
    on('[data-step]', 'click', (e) => { scene.pathways.showStage(+e.currentTarget.dataset.step); scene.pathways.playing = true; });
    on('.xs-tools [data-region], .xs-ask [data-region]', 'click', (e) => { focusRegions([e.currentTarget.dataset.region]); ctx.rerender(); });
    if (ctx.fullscreenEl) bindFullscreen(root, ctx.fullscreenEl, () => {});
  }

  return { st, scene, applyRoute, playPathway, stopPathway, reset, regionHtml, playerHtml, askHtml, noteHtml, toolsHtml, bind, note, ask, focusRegions };
}
