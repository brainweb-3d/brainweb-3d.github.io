// The Explore "world": one continuous 3D drill-down made of three views, each with its own transparent canvas over
// one CSS backdrop:
//   • the brain (BrainScene) — the root place "organ/brain";
//   • two Stage instances used ping-pong for every other place (the one that is not on screen builds the next place,
//     and afterwards keeps the previous one, so flying back out needs no rebuild).
// A dive flies the parent's camera into the clicked part (log-distance zoom, aim tied to zoom progress) while the
// child's camera is driven by the scale mapping, so the child appears exactly inside the part at the part's size.
// The two canvases crossfade (about 25–90 % of the move). Each scene keeps its own units, so nothing has to be
// re-normalised afterwards: when the dive ends the child's camera is exactly at its home view.
import * as THREE from 'three';
import { Stage, maxPixelRatio } from '../visual/Stage.js';
import { BrainScene } from '../brain/BrainScene.js';
import { levelById } from '../visual/levels/index.js';
import { getLang } from '../i18n.js';

export const ROOT_KEY = 'organ/brain';
const Y = new THREE.Vector3(0, 1, 0);
/** Dev only: ?slow=8 plays every transition 8× slower (to inspect a dive mid-flight). */
export const SLOW = import.meta.env.DEV ? Math.max(0.05, +new URLSearchParams(location.search).get('slow') || 1) : 1;
export const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const yawOf = (d) => Math.atan2(d.x, d.z);
const L = (en, he) => (getLang() === 'he' ? he : en);
/** How big (as a share of the parent's visible radius) the child may appear inside the clicked part. */
const CHILD_SHARE = 0.3;

function lerpDir(a, b, e, out) {
  out.copy(a).lerp(b, e);
  return out.lengthSq() < 1e-6 ? out.copy(b) : out.normalize();
}
/** Wait for a promise, but never longer than `ms`. */
const capped = (p, ms) => Promise.race([Promise.resolve(p).catch(() => {}), new Promise((r) => setTimeout(r, ms))]);

/** Load a place's scene definition (level module is downloaded once, then cached by the browser). */
export async function loadDef(key) {
  const [level, scene] = key.split('/');
  const lvl = levelById[level];
  if (!lvl?.load) throw new Error(`Unknown level ${level}`);
  const mod = (await lvl.load()).default;
  return mod.scenes.find((s) => s.id === scene) || mod.scenes[0];
}
export const preloadModule = (key) => { levelById[key.split('/')[0]]?.load?.().catch(() => {}); };

// ------------------------------------------------------------------ views
class View {
  constructor(world, kind) {
    this.world = world;
    this.kind = kind;
    this.layer = document.createElement('div');
    this.layer.className = `xw-layer xw-${kind}`;
    world.layers.appendChild(this.layer);
    this.version = 0; // bumps when the content changes (hotspot anchors are recomputed)
    this.setOpacity(0);
    this.setInteractive(false);
  }
  setOpacity(o) {
    // compositor-only writes, and only when the value changes
    const r = Math.round(o * 1000) / 1000;
    if (r === this.opacity) return;
    this.opacity = r;
    this.layer.style.opacity = String(r);
    // (no visibility toggling: a canvas that was hidden needs a new compositor layer the moment it shows — a hitch)
  }
  setFront(on) { this.layer.style.zIndex = on ? '2' : '1'; }
  setInteractive(on) { this.layer.style.pointerEvents = on ? 'auto' : 'none'; }
  get controls() { return this.engine.controls; }
  get camera() { return this.engine.camera; }
  setActive(on) { this.engine.setActive(on); }
  get active() { return !!this.engine.active; }
  frame() { this.engine.frame(); }
  set driven(on) { this.engine.driven = on; this.controls.enabled = !on; if (on) this.engine.tween = null; }
  /** Radius of what the home view shows (used to scale a child into a part). */
  visibleRadius() {
    const h = this.homeView();
    return h.position.distanceTo(h.target) * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * 0.9;
  }
  toHome() {
    const h = this.homeView();
    this.engine.tween = null;
    this.controls.target.copy(h.target);
    this.camera.position.copy(h.position);
    this.camera.lookAt(h.target);
    this.settleControls();
  }
  /** Forget leftover orbit momentum after the world has moved the camera. */
  settleControls() {
    const c = this.controls;
    c._sphericalDelta?.set(0, 0, 0);
    c._panOffset?.set(0, 0, 0);
    if ('_scale' in c) c._scale = 1;
    c.update();
  }
  /** Limits for orbit zoom: scrolling/pinching out past max distance goes up one level. */
  setZoomLimits() {
    const h = this.homeView();
    const d = h.position.distanceTo(h.target);
    this.controls.maxDistance = d * 1.9;
    this.controls.minDistance = d * (this.kind === 'brain' ? 0.18 : 0.06);
  }
}

class StageView extends View {
  constructor(world) {
    super(world, 'stage');
    this.engine = new Stage(this.layer, { autoLoop: false });
    this.engine.lang = getLang;
    this.key = null;
    this.ui = { acts: {}, caption: null, readout: '' };
    this.engine.on('hover', (id, e) => world.hooks.hover(this, id, e));
    this.engine.on('select', (id) => world.hooks.select(this, id));
  }
  get stage() { return this.engine; }
  homeView() {
    const s = this.engine;
    if (!s.home) return { target: s.controls.target.clone(), position: s.camera.position.clone() };
    return { target: s.home.target.clone(), position: s.fitted(s.home.position) };
  }
  partMeshes(part) {
    const all = this.engine.meshes.filter((m) => m.userData.partId === part);
    // a sourced model whose pieces are linked to the parts: dots sit on the model's piece, not the hidden scene's
    if (this.realMode) { const onModel = all.filter((m) => m.userData.onModel); if (onModel.length) return onModel; }
    return all;
  }
  // with a sourced model shown ("Real model"), the model is what you see: anchors sit on it and it hides things
  occluders() { return this.realMode ? this.model.meshes : this.engine.meshes.filter((m) => m.material.opacity >= 0.5 && this.engine.isVisible(m)); }
  surfaceMeshes() { return this.realMode ? this.model.meshes : []; }
  isShown(m) { return this.realMode || this.engine.isVisible(m); }
  /** Remove a sourced model left from the previous place (the model files themselves stay cached). */
  dropModel() {
    this.engine.scene.getObjectByName('sourced-model')?.removeFromParent();
    this.model = null;
    this.realMode = false;
    this.modeWanted = undefined;
    this.engine.root.visible = true;
    this.engine.pickHidden = false;
  }
  build(key, def) {
    const s = this.engine;
    this.dropModel();
    s.clear();
    s.home = null;
    s.camera.position.set(0, 0, 6);
    s.controls.target.set(0, 0, 0);
    this.key = key;
    this.def = def;
    this.ui = { acts: {}, caption: null, readout: '' };
    this.failed = false;
    try {
      this.built = def.build(s, {
        say: (text) => this.world.hooks.say(this, text),
        readout: (html) => this.world.hooks.readout(this, html),
        L,
      }) || {};
    } catch (e) {
      console.error(e);
      this.built = {};
      this.failed = true;
    }
    s.setHome(this.built.home?.pos || s.camera.position.clone(), this.built.home?.target);
    this.version++;
    this.ready = Promise.resolve(this.built.ready).then(() => { this.version++; }, (e) => { console.warn(e); this.failed = true; });
    this.toHome();
    this.setZoomLimits();
  }
}

class BrainView extends View {
  constructor(world) {
    super(world, 'brain');
    this.engine = new BrainScene(this.layer, { autoLoop: false, hq: true });
    this.key = ROOT_KEY;
    this.ui = { acts: {}, caption: null, readout: '' };
    this.built = { actions: [] };
    this.ready = new Promise((res) => {
      this.engine.on('model', (real) => { this.version++; this.modelLoaded = true; res(); world.hooks.model?.(real); });
    });
    this.engine.on('hover', (id, e) => world.hooks.hover(this, id, e));
    this.engine.on('select', (id) => world.hooks.select(this, id));
  }
  get scene() { return this.engine; }
  homeView() { return this.engine.homeView(); }
  partMeshes(part, side = 0) {
    let ms = this.engine.byRegion.get(part) || [];
    if (side) { const s = ms.filter((m) => m.userData.side === side); if (s.length) ms = s; }
    return ms;
  }
  /** What you see: the detailed skin while it is shown, else the coloured parts. */
  occluders() {
    const e = this.engine;
    if (e.hq && e.skin > 0.5) return e.hqMeshes;
    return e.meshes.filter((m) => (m.userData.op ?? m.material.opacity) >= 0.5);
  }
  /** Hotspot anchors sit on the visible skin (first hit), falling back to the hidden part itself. */
  surfaceMeshes() { return this.engine.hqMeshes; }
  isShown(m) { return (m.userData.op ?? m.material.opacity) > 0.05; }
}

// ------------------------------------------------------------------ the world
// Scratch vectors for the per-frame dive maths (no garbage in the hot loop).
const _t = new THREE.Vector3(), _d = new THREE.Vector3(), _p = new THREE.Vector3(), _q = new THREE.Vector3(), _sz = new THREE.Vector2();
const PERF = import.meta.env.DEV && new URLSearchParams(location.search).has('perf');
const GPU_SYNC = import.meta.env.DEV && new URLSearchParams(location.search).has('gpusync'); // dev: time each view's GPU work
/** renderer.compile, then wait until every program reports ready (KHR_parallel_shader_compile); gone = done. */
function compileSafe(renderer, scene, camera) {
  const materials = renderer.compile(scene, camera);
  return new Promise((resolve) => {
    const check = () => {
      for (const m of materials) if (renderer.properties.get(m).currentProgram?.isReady?.() !== false) materials.delete(m);
      if (!materials.size) resolve(scene); else setTimeout(check, 10);
    };
    check();
  });
}
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

/** Maps points between a parent's world and a child's world: child = C + R(-yaw)·(parent − A)/s. */
class ScaleMap {
  constructor(anchor, s, yaw, C) { this.A = anchor.clone(); this.s = s; this.yaw = yaw; this.C = C.clone(); }
  toChild(p, out) { return out.copy(p).sub(this.A).divideScalar(this.s).applyAxisAngle(Y, -this.yaw).add(this.C); }
  toParent(p, out) { return out.copy(p).sub(this.C).applyAxisAngle(Y, this.yaw).multiplyScalar(this.s).add(this.A); }
}

export class World {
  constructor(el, hooks) {
    this.el = el;
    this.hooks = hooks;
    this.layers = el;
    this.stages = [new StageView(this), new StageView(this)];
    this.brain = null;
    this.current = null;
    this.busy = false;
    this.anim = null;
    this.prepQ = Promise.resolve();
    this.offset = { x: 0, y: 0 };
    this.offsetTarget = { x: 0, y: 0 };
    this.running = false;
    this.last = performance.now();
    this.restTimes = [];
    this.restWork = [];
    if (PERF) {
      this.perfEl = document.createElement('div');
      this.perfEl.className = 'xw-perf';
      this.perfEl.textContent = 'perf: waiting for a dive…';
      document.body.appendChild(this.perfEl);
    }
    // when the window changes size (or the first layout lands), re-frame the place unless the user has moved
    new ResizeObserver(() => {
      const v = this.current;
      if (!v || this.busy) return;
      v.engine.resize?.();
      if (!v.userMoved) v.toHome();
      v.setZoomLimits();
    }).observe(el);
    if (import.meta.env.DEV) window.__world = this; // for debugging in the browser console (dev only)
  }

  get views() { return this.brain ? [this.brain, ...this.stages] : this.stages; }
  ensureBrain() { if (!this.brain) this.brain = new BrainView(this); return this.brain; }

  /** One rAF loop for every view: dive maths, then each active view renders (same frame, same timestamp). */
  start() {
    if (this.running) return;
    this.running = true;
    this.current?.setActive(true);
    const loop = (now) => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      this.tick(now);
    };
    requestAnimationFrame(loop);
  }
  stop() {
    this.running = false;
    this.views.forEach((v) => v.setActive(false));
  }

  tick(now) {
    const ms = now - this.last;
    const dt = Math.min(0.05, ms / 1000);
    this.last = now;
    if (this.anim) {
      const a = this.anim;
      // pre-roll: the first frames after both canvases wake up can be slow (GPU/compositor); render them at t = 0,
      // and start the clock only then, so the motion itself never stutters
      if (a.pre > 0) { a.pre--; a.fn(0, 0); a.t0 = now; a.preMs = performance.now() - a.started; for (const v of this.views) if (v.active) { this.applyOffset(v); const g0 = performance.now(); v.frame(); this.fence(v); if (GPU_SYNC) { const gl = v.engine.renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); (a.gpu ||= []).push(`pre ${v.key}:${(performance.now() - g0).toFixed(0)}`); } } return; }
      a.times.push(ms);
      (a.ts ||= []).push(Math.min(1, Math.max(0, (now - a.t0) / a.ms)));
      // progress comes from the timestamp, so a dropped frame never slows or jumps the motion
      const t = Math.min(1, Math.max(0, (now - a.t0) / a.ms));
      a.fn(ease(t), t);
      if (t >= 1) { this.anim = null; this.reportPerf(a); a.resolve(); }
    } else if (PERF) { this.restTimes.push(ms); if (this.restTimes.length > 240) this.restTimes.shift(); }
    // camera framing follows the info drawer / bottom sheet (the view's centre moves into the free space)
    const k = 1 - Math.exp(-dt * 12);
    this.offset.x += (this.offsetTarget.x - this.offset.x) * k;
    this.offset.y += (this.offsetTarget.y - this.offset.y) * k;
    for (const v of this.views) {
      if (!v.active) continue;
      this.applyOffset(v);
      if (this.anim && v.opacity <= 0.002) continue; // fully faded during a flight: nothing to draw
      if (v.model) this.hooks.tickModel?.(v, dt, this.busy);
      const g0 = GPU_SYNC && performance.now();
      if (!this.gpuReady(v)) {
        if (this.anim) {
          this.anim.skips = (this.anim.skips || 0) + 1;
          // still too much for this GPU: one more step down for the rest of the flight
          if (this.flightRes != null && this.flightRes > 0.75 && this.anim.skips >= 2) this.setFlightRes(0.75);
        }
        continue;
      } // the GPU is still behind on this view: drop this frame, never queue more
      const n0 = v.engine.renderer.info.render.frame;
      v.frame();
      if (v.engine.renderer.info.render.frame !== n0) this.fence(v);
      if (GPU_SYNC && this.anim) { const gl = v.engine.renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); (this.anim.gpu ||= []).push(`${v.key}@${this.anim.ts?.length || 0}:${(performance.now() - g0).toFixed(0)}`); }
    }
    this.hooks.afterFrame?.(dt);
    // CPU time of this frame (JS + WebGL calls); interval times above also include the browser's own waiting
    const work = performance.now() - now;
    if (this.anim) this.anim.work.push(work); else if (this.restWork) { this.restWork.push(work); if (this.restWork.length > 240) this.restWork.shift(); }
  }

  /** Frame times of the last transition (dev: also shown with ?perf, and kept in world.perfLog). */
  reportPerf(a) {
    const times = a.times.slice(1); // the first sample spans the click → first frame
    const work = a.work.slice(1);
    this.lastPerf = { label: a.label, median: median(times), max: Math.max(0, ...times), over33: times.filter((x) => x > 33.4).length, frames: times.length,
      maxIdx: times.indexOf(Math.max(...times)) + 1, maxAt: (a.ts?.[times.indexOf(Math.max(...times)) + 1] ?? 0).toFixed(2), workMedian: median(work), workMax: Math.max(0, ...work), restWorkMedian: median(this.restWork) };
    if (!PERF) return;
    const p = this.lastPerf;
    const line = `${p.label}: median ${p.median.toFixed(1)} ms, max ${p.max.toFixed(1)} ms, ${p.over33} frames > 33 ms (${p.frames} frames) · CPU work median ${p.workMedian.toFixed(1)} / max ${p.workMax.toFixed(1)} ms · slowest at t=${p.maxAt} (frame ${p.maxIdx}) · GPU-skipped renders ${a.skips || 0} · start latency ${((a.preMs || 0) + (this.resizeMs || 0)).toFixed(0)} ms (incl. ${(this.resizeMs || 0).toFixed(0)} ms switching to flight resolution) · at rest median ${median(this.restTimes).toFixed(1)} ms · dpr ${this.current?.engine.renderer.getPixelRatio()}`;
    if (GPU_SYNC) console.info('[gpu]', (a.gpu || []).slice(0, 10).join(' '));
    console.info('[perf]', line);
    this.perfLog = [...(this.perfLog || []), line];
    this.perfEl.textContent = line;
  }

  /**
   * GPU back-pressure. Browsers (headless ones especially) keep firing rAF even when the GPU cannot keep up, so the
   * GPU queue grew to ~0.7 s at places with animations, and the first frame of the next dive had to wait for all of it.
   * Each rendered frame drops a fence; a view never has more than two frames in flight.
   */
  gpuReady(v) {
    const gl = v.engine.renderer.getContext();
    const q = (v.fences ||= []);
    while (q.length && gl.getSyncParameter(q[0], gl.SYNC_STATUS) === gl.SIGNALED) gl.deleteSync(q.shift());
    return q.length < 2;
  }
  fence(v) {
    const gl = v.engine.renderer.getContext();
    if (!gl.fenceSync) return; // WebGL1: no fences
    (v.fences ||= []).push(gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0));
    gl.flush();
  }

  applyOffset(v) {
    const cam = v.camera;
    v.engine.renderer.getSize(_sz); // no DOM read
    const w = _sz.x || 1, h = _sz.y || 1;
    const ox = Math.round(this.offset.x), oy = Math.round(this.offset.y);
    const u = cam.userData;
    if (u.ow === w && u.oh === h && u.ox === ox && u.oy === oy) return;
    u.ow = w; u.oh = h; u.ox = ox; u.oy = oy;
    v.engine.needsRender = true;
    if (!ox && !oy) cam.clearViewOffset();
    else cam.setViewOffset(w, h, ox, oy, w, h);
  }
  setOffset(x, y) { this.offsetTarget = { x, y }; }

  /**
   * Adaptive flight resolution. While the cameras fly, detail is a blur anyway, so on high-density screens both
   * canvases render at 1 device pixel (and 0.75 if the GPU still falls behind); full resolution comes back once the
   * move has landed (re-sizing a canvas costs ~80 ms on a laptop GPU: done while the picture is still, it is invisible). A canvas that changes size is cleared, so each one is re-rendered in the same task: no blank frame.
   * `level` = a pixel ratio, or null for the normal one.
   */
  setFlightRes(level) {
    this.flightRes = level;
    for (const v of this.views) if (v.active) this.setRes(v, level);
  }
  /** Pixel ratio of one view: `level`, or null for full. Views off screen wait at flight resolution, so a flight only
   *  has to re-size the one canvas that was on screen. */
  setRes(v, level) {
    const full = maxPixelRatio();
    const pr = level == null ? full : Math.min(full, level);
    const r = v.engine.renderer;
    if (Math.abs(r.getPixelRatio() - pr) < 1e-3) return;
    r.setPixelRatio(pr);
    v.engine.needsRender = true;
    if (v.active) { r.render(v.engine.scene, v.engine.camera); this.fence(v); }
  }
  /** Flight resolution: 1 device pixel on high-density screens. */
  get flightLevel() { return window.devicePixelRatio > 1 ? 1 : null; }

  /** Free the stages that hold places other than `keep` (the parent and likely next places stay cached).
   *  Queued behind any build/compile in progress, so nothing is disposed while it is being prepared. */
  trim(keep) {
    this.prepQ = this.prepQ.then(() => this.trimNow(keep)).catch(() => {});
  }
  trimNow(keep) {
    for (const v of this.stages) {
      if (v === this.current || !v.key || keep.includes(v.key)) continue;
      v.dropModel();
      v.engine.clear();
      v.key = null;
      v.built = null;
      v.warm = false;
    }
  }

  /** Run fn(eased, t) every frame for ms (× the dev slow-motion factor), in step with rendering. */
  tween(ms, fn, label = 'transition') {
    return new Promise((resolve) => { this.anim = { t0: performance.now(), ms: ms * SLOW, fn, resolve, label, times: [], work: [], pre: 3, started: performance.now() }; });
  }

  // ---------------------------------------------------------------- building places
  /** The stage that should build `key`: one already holding it, else the one not on screen (prefer one not holding
   *  `keepKey`, the current place's parent, so a quick "back" stays instant). */
  stageFor(key, keepKey = null) {
    const free = this.stages.filter((v) => v !== this.current);
    return free.find((v) => v.key === key) || free.find((v) => !v.key) || free.find((v) => v.key !== keepKey) || free[0];
  }

  /**
   * Get a view holding `key`: built, data loaded, shaders compiled and buffers uploaded (one hidden render), so the
   * dive starts with no work left to do. Waits for data at most a few seconds.
   */
  prepare(key, { fresh = false, keepKey = null, wait = true } = {}) {
    const job = this.prepQ.then(async () => {
      if (key === ROOT_KEY) {
        const b = this.ensureBrain();
        if (wait) { await capped(b.ready, 6000); await this.warm(b); }
        return b;
      }
      const v = this.stageFor(key, keepKey);
      if (v.key !== key || fresh) {
        const def = await loadDef(key);
        v.build(key, def);
        v.warm = false;
        const deco = this.hooks.decorate?.(v); // e.g. a sourced model (loaded and compiled before any dive)
        if (wait) await capped(deco, 8000);
      }
      if (wait) {
        await capped(v.ready, 8000);
        // scenes often add the loaded meshes in a .then() after `ready`: let those run, so warm() compiles them too
        await new Promise((r) => setTimeout(r, 60));
        await this.warm(v);
      }
      return v;
    });
    this.prepQ = job.catch(() => {});
    return job;
  }

  /** Compile the view's shaders and upload its geometry with one hidden render (no hitch on its first visible frame). */
  async warm(v) {
    if (v === this.current || (v.warm && v.warmVersion === v.version)) return;
    const e = v.engine;
    this.setRes(v, this.flightLevel); // compiled and uploaded at the resolution it will fly at
    v.toHome();
    // capped, and our own wait instead of three's compileAsync: its poll throws (uncaught, in a timer) when a
    // material is disposed while it waits, e.g. after a quick jump to another place
    try { await capped(compileSafe(e.renderer, e.scene, e.camera), 3000); } catch { /* the render below compiles instead */ }
    if (v === this.current) return;
    e.renderer.render(e.scene, e.camera); // the layer is hidden: uploads buffers/textures without showing anything
    v.warm = true;
    v.warmVersion = v.version;
  }

  /** Build a likely next place in the background (the view stays hidden and paused). */
  prebuild(key, keepKey) {
    if (key === ROOT_KEY || this.busy) return;
    if (this.stages.some((v) => v.key === key && v !== this.current && v.warm)) return;
    this.prepare(key, { keepKey }).catch(() => {});
  }

  /** Remember whether the user has turned/zoomed this place since arriving (then a resize keeps their view). */
  watchUser(v) {
    v.userMoved = false;
    if (v.watching) return;
    v.watching = true;
    v.controls.addEventListener('start', () => { v.userMoved = true; });
  }

  /** Swap instantly (first load). */
  show(view) {
    this.watchUser(view);
    for (const v of this.views) {
      if (v === view) continue;
      v.setOpacity(0); v.setInteractive(false); v.setActive(false);
    }
    view.driven = false;
    view.setActive(true);
    view.setOpacity(1);
    view.setFront(true);
    view.setInteractive(true);
    view.setZoomLimits();
    this.current = view;
    this.setRes(view, null);
  }

  begin(from, to) {
    this.busy = true;
    from.setInteractive(false); to.setInteractive(false);
    from.setActive(true); to.setActive(true);
    from.driven = true; to.driven = true;
    const r0 = performance.now();
    if (this.flightLevel) this.setFlightRes(this.flightLevel);
    this.resizeMs = performance.now() - r0;
  }
  /**
   * While the parent's camera flies into a dense volume (e.g. a network of neurons), everything right in front of the
   * lens would cover the whole screen many times over (one frame took 1.3 s on a laptop GPU). Clip what is nearer
   * than a quarter of the distance to the target: it reads as flying through, and costs almost nothing.
   */
  nearClip(view, d) {
    const cam = view.camera;
    cam.userData.near0 ??= cam.near;
    const near = Math.max(cam.userData.near0, d * 0.25);
    if (Math.abs(near - cam.near) > 1e-6) { cam.near = near; cam.updateProjectionMatrix(); }
  }
  restoreNear(view) {
    const cam = view.camera;
    if (cam.userData.near0 == null) return;
    cam.near = cam.userData.near0;
    delete cam.userData.near0;
    cam.updateProjectionMatrix();
  }

  end(from, to) {
    this.restoreNear(from); this.restoreNear(to);
    from.driven = false; to.driven = false;
    from.setOpacity(0); from.setActive(false); from.setInteractive(false);
    to.setOpacity(1); to.setInteractive(true);
    to.setActive(this.running); // Explore may have been left mid-flight: stop() already paused everything
    to.settleControls();
    to.setZoomLimits();
    this.watchUser(to);
    this.current = to;
    this.busy = false;
    this.flightRes = null;
    this.setRes(to, null); // the place now on screen goes back to full resolution (the picture is still: invisible)
  }

  /** Reduced motion: a short crossfade, no camera flight. */
  async fade(from, to) {
    this.begin(from, to);
    to.toHome();
    to.setFront(true); from.setFront(false);
    await this.tween(300, (e) => { to.setOpacity(e); from.setOpacity(1 - e); }, 'fade');
    this.end(from, to);
  }

  /** Dive from `from` into a part at `anchor` (world point of `from`) whose radius is `partRadius`; `to` is prepared. */
  async dive(from, to, anchor, partRadius, ms = 1100) {
    if (reducedMotion()) return this.fade(from, to);
    const fromT = from.controls.target.clone();
    const fromD = Math.max(1e-6, from.camera.position.distanceTo(fromT));
    const fromDir = from.camera.position.clone().sub(fromT).normalize();
    const th = to.homeView();
    const C = th.target, Dc = th.position.distanceTo(C), homeDir = th.position.clone().sub(C).normalize();
    const rEff = Math.min(partRadius || Infinity, from.visibleRadius() * CHILD_SHARE);
    const s = rEff / to.visibleRadius();
    const yaw = yawOf(fromDir) - yawOf(homeDir); // the child faces where we look from (yaw only: "up" never rolls)
    const toDir = homeDir.clone().applyAxisAngle(Y, yaw), toD = Dc * s;
    const map = new ScaleMap(anchor, s, yaw, C);
    this.begin(from, to);
    to.setFront(true); from.setFront(false);
    to.setOpacity(0);
    await this.tween(ms, (e, t) => {
      const d = fromD * Math.pow(toD / fromD, e);
      // the aim follows the zoom (not the clock), so the part being entered stays centred the whole way
      const k = Math.abs(fromD - toD) > 1e-9 ? (fromD - d) / (fromD - toD) : e;
      _t.copy(fromT).lerp(anchor, k);
      this.aim(from, _t, lerpDir(fromDir, toDir, e, _d), d);
      this.nearClip(from, d);
      this.place(to, map.toChild(_t, _p), map.toChild(from.camera.position, _q));
      from.setOpacity(1 - smooth(0.45, 0.9, t));
      to.setOpacity(smooth(0.25, 0.75, t));
    }, `dive → ${to.key}`);
    this.place(to, th.target, th.position);
    this.end(from, to);
  }

  /** Fly back out of `child` into `parent` (prepared), where the child sits in the part at `anchor`. */
  async rise(child, parent, anchor, partRadius, ms = 1000) {
    if (reducedMotion()) return this.fade(child, parent);
    const ph = parent.homeView();
    const T = ph.target, Dp = ph.position.distanceTo(T), pDir = ph.position.clone().sub(T).normalize();
    const C = child.homeView().target;
    const rEff = Math.min(partRadius || Infinity, parent.visibleRadius() * CHILD_SHARE);
    const s = rEff / child.visibleRadius();
    const cDir = child.camera.position.clone().sub(child.controls.target).normalize();
    const map = new ScaleMap(anchor, s, yawOf(pDir) - yawOf(cDir), C);
    const t0 = map.toParent(child.controls.target, new THREE.Vector3()), p0 = map.toParent(child.camera.position, new THREE.Vector3());
    const d0 = Math.max(1e-6, p0.distanceTo(t0)), dir0 = p0.clone().sub(t0).normalize();
    this.begin(child, parent);
    child.setFront(true); parent.setFront(false);
    parent.setOpacity(0);
    await this.tween(ms, (e, t) => {
      const d = d0 * Math.pow(Dp / d0, e);
      const k = Math.abs(Dp - d0) > 1e-9 ? (d - d0) / (Dp - d0) : e;
      _t.copy(t0).lerp(T, k);
      this.aim(parent, _t, lerpDir(dir0, pDir, e, _d), d);
      this.nearClip(parent, d);
      this.place(child, map.toChild(_t, _p), map.toChild(parent.camera.position, _q));
      parent.setOpacity(smooth(0.05, 0.5, t));
      child.setOpacity(1 - smooth(0.25, 0.7, t));
    }, `rise → ${parent.key}`);
    this.place(parent, T, ph.position);
    parent.setFront(true);
    this.end(child, parent);
  }

  /**
   * Zoom both cameras along their own view lines while crossfading: fromFactor > 1 pulls `from` back, toFactor < 1
   * starts `to` close in. Used for "zoom out" (brain → body), its reverse, and jumps between unrelated places.
   */
  async swap(from, to, fromFactor, toFactor, ms = 900) {
    if (reducedMotion()) return this.fade(from, to);
    const fT = from.controls.target.clone(), fD = from.camera.position.distanceTo(fT), fDir = from.camera.position.clone().sub(fT).normalize();
    const th = to.homeView(), tD = th.position.distanceTo(th.target), tDir = th.position.clone().sub(th.target).normalize();
    this.begin(from, to);
    to.setFront(true); from.setFront(false);
    to.setOpacity(0);
    await this.tween(ms, (e, t) => {
      this.aim(from, fT, fDir, fD * Math.pow(fromFactor, e));
      this.aim(to, th.target, tDir, tD * Math.pow(toFactor, 1 - e));
      from.setOpacity(1 - smooth(0.2, 0.8, t));
      to.setOpacity(smooth(0.15, 0.7, t));
    }, `zoom → ${to.key}`);
    this.place(to, th.target, th.position);
    this.end(from, to);
  }

  aim(view, target, dir, dist) {
    view.controls.target.copy(target);
    view.camera.position.copy(target).addScaledVector(dir, dist);
    view.camera.lookAt(target);
  }
  place(view, target, position) {
    view.controls.target.copy(target);
    view.camera.position.copy(position);
    view.camera.lookAt(target);
  }
}
