// A reusable 3D "stage" used by every zoom level (atom … organism) and the research-methods scenes.
// It handles rendering, lights, camera controls, hovering/clicking parts, highlighting and per-frame animation.
// Each pickable mesh carries userData.partId; part metadata lives in stage.parts.
// The Explore world (src/explore/World.js) runs two of these ping-pong, each on its own transparent canvas:
//   new Stage(el, { autoLoop: false }) — the world calls frame() itself, so both cameras move in the same frame;
//   stage.driven = true                — the world flies the camera (a dive); the stage's own tween and orbit controls pause.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { dotTexture } from './build.js';

/** Pixel-ratio cap: 2 on desktop, 1.5 on touch devices (phones/tablets). */
const PR_OVERRIDE = import.meta.env?.DEV ? +new URLSearchParams(location.search).get('pr') : 0; // dev: ?pr=1 to test
export const maxPixelRatio = () => PR_OVERRIDE || Math.min(window.devicePixelRatio || 1, window.matchMedia?.('(pointer: coarse)').matches ? 1.5 : 2);

/** A small rounded name tag used under compared parts. */
function labelSprite(text, size = 0.4) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const font = '600 56px Rubik, sans-serif';
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 48;
  c.width = w; c.height = 84;
  g.font = font;
  g.fillStyle = 'rgba(15,23,42,.82)';
  g.beginPath(); g.roundRect(0, 0, w, 84, 30); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 44);
  const tex = new THREE.CanvasTexture(c);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  const h = Math.max(0.12, size);
  spr.scale.set(h * (w / 84), h, 1);
  spr.renderOrder = 30;
  return spr;
}

export class Stage {
  constructor(container, { autoLoop = true } = {}) {
    this.container = container;
    this.parts = new Map();      // id → { id, name, desc, color, … }
    this.meshes = [];            // pickable meshes
    this.updaters = new Set();   // per-frame callbacks (dt, time)
    this.focusIds = new Set();
    this.hoverId = null;
    this.selectedId = null;
    this.handlers = { hover: () => {}, select: () => {} };
    this.time = 0;
    this.roots = new Map();     // partId → objects passed to add()
    this.movers = new Set();    // wrapper groups used to move parts for compare
    this.hidden = [];           // objects hidden by isolate/compare
    this.htmlEls = [];          // HTML a scene put over the canvas (e.g. the cortex's layer ruler): removed by clear()

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(maxPixelRatio());
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.localClippingEnabled = true;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.5;
    // studio look: soft sky light, warm key from the upper left, cool rim from behind
    this.scene.add(new THREE.HemisphereLight(0xf2f5ff, 0x4a4458, 0.8));
    const key = new THREE.DirectionalLight(0xfff1e6, 1.9);
    key.position.set(-3, 4, 3);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fb0ff, 1.4);
    rim.position.set(3, 1, -3);
    this.scene.add(rim);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.01, 200);
    this.camera.position.set(0, 0, 6);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    // render on demand: the controls report every camera move (drag, damping, auto-rotate)
    this.needsRender = true;
    this.controls.addEventListener('change', () => { this.needsRender = true; });
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.overlay = new THREE.Group(); // compare labels (never hidden)
    this.root.add(this.overlay);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.bindEvents();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.clock = new THREE.Clock();
    if (autoLoop) this.renderer.setAnimationLoop(() => this.frame());
  }

  on(ev, fn) { this.handlers[ev] = fn; }

  /** Remove everything that a scene added. */
  clear() {
    const shared = dotTexture(); // one glow texture used by every scene's particles: kept
    this.root.traverse((o) => {
      o.geometry?.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (!m) return;
        for (const k in m) if (m[k]?.isTexture && m[k] !== shared) m[k].dispose(); // text-label canvases etc.
        m.dispose?.();
      });
    });
    this.scene.remove(this.root);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.overlay = new THREE.Group();
    this.root.add(this.overlay);
    this.roots = new Map();
    this.movers = new Set();
    this.hidden = [];
    this.moveTween = null;
    this.isolated = this.comparing = null;
    this.parts.clear();
    this.meshes = [];
    this.updaters.clear();
    this.focusIds.clear();
    this.hoverId = this.selectedId = null;
    this.tween = null;
    this.htmlEls.forEach((el) => el.remove());
    this.htmlEls = [];
  }

  /** Put an HTML element over this scene's canvas (removed with the scene). */
  addHtml(el) { this.container.appendChild(el); this.htmlEls.push(el); return el; }

  /** Register part metadata. */
  definePart(def) { this.parts.set(def.id, def); return def; }

  /** Add an object; meshes inside it become pickable as `partId` (if given). */
  add(obj, partId = null, parent = this.root) {
    parent.add(obj);
    if (partId) {
      if (!this.roots.has(partId)) this.roots.set(partId, []);
      this.roots.get(partId).push(obj);
      obj.traverse((o) => {
        if (!o.isMesh) return;
        o.userData.partId = partId;
        o.userData.baseOpacity = o.material.opacity ?? 1;
        o.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null;
        this.meshes.push(o);
      });
    }
    return obj;
  }

  /** Make the meshes inside an object (already in the scene) pickable as `partId`. */
  tag(obj, partId) {
    obj.traverse((o) => {
      if (!o.isMesh || o.userData.partId) return;
      o.userData.partId = partId;
      o.userData.baseOpacity = o.material.opacity ?? 1;
      o.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null;
      this.meshes.push(o);
    });
    return obj;
  }

  onUpdate(fn) { this.updaters.add(fn); return () => this.updaters.delete(fn); }

  setHome(position, target = new THREE.Vector3()) {
    this.home = { position: position.clone(), target: target.clone() };
  }

  resetView() { if (this.home) this.animateCamera(this.home.target.clone(), this.fitted(this.home.position), 0.9); }

  /** Step back (or in) along the home direction so the whole scene fits the current view size. */
  fitted(pos) {
    if (!this.home) return pos.clone();
    const box = new THREE.Box3();
    this.root.updateMatrixWorld(true);
    this.meshes.forEach((m) => { if (this.pickHidden || this.isVisible(m)) box.expandByObject(m); });
    if (box.isEmpty()) return pos.clone();
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const tanV = Math.tan(vfov / 2), tanH = tanV * this.camera.aspect;
    const dir = pos.clone().sub(this.home.target).normalize();
    // Camera basis: project the 8 box corners and find the distance at which all of them fit the view.
    const right = new THREE.Vector3().crossVectors(dir.clone().negate(), new THREE.Vector3(0, 1, 0));
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    const up = new THREE.Vector3().crossVectors(right, dir.clone().negate()).normalize();
    let need = 0;
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(this.home.target);
      const x = Math.abs(c.dot(right)), y = Math.abs(c.dot(up)), z = c.dot(dir);
      need = Math.max(need, (x * 1.1) / tanH + z, (y * 1.1) / tanV + z);
    }
    // portrait phones may need to step back further for the scene to fit the width
    const far = this.camera.aspect < 1 ? 4 : 2.5;
    const dist = Math.max(pos.distanceTo(this.home.target) * 0.5, Math.min(need, pos.distanceTo(this.home.target) * far));
    return this.home.target.clone().add(dir.multiplyScalar(dist));
  }

  animateCamera(target, position, duration = 1) {
    if (this.driven) return; // the world is flying the camera (a dive), which ends at the home view anyway
    this.tween = { t: 0, duration, fromT: this.controls.target.clone(), toT: target, fromP: this.camera.position.clone(), toP: position };
  }

  // ---------------------------------------------------------------- isolate / compare / arrange
  /** World bounding box of a part (all its meshes, ignoring hidden ones unless `all`). */
  partBox(id, all = false) {
    this.root.updateMatrixWorld(true); // parents may not have been rendered yet
    const box = new THREE.Box3();
    this.meshes.filter((m) => m.userData.partId === id && (all || this.isVisible(m))).forEach((m) => box.expandByObject(m));
    return box;
  }

  /** Camera target + position that frame `box`, looking from direction `dir` (from target to camera). */
  frameBox(box, dir = this.camera.position.clone().sub(this.controls.target).normalize(), margin = 1.15) {
    const target = box.getCenter(new THREE.Vector3());
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const tanV = Math.tan(vfov / 2), tanH = tanV * this.camera.aspect;
    const right = new THREE.Vector3().crossVectors(dir.clone().negate(), new THREE.Vector3(0, 1, 0));
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    const up = new THREE.Vector3().crossVectors(right, dir.clone().negate()).normalize();
    let need = 0.01;
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(target);
      need = Math.max(need, (Math.abs(c.dot(right)) * margin) / tanH + c.dot(dir), (Math.abs(c.dot(up)) * margin) / tanV + c.dot(dir));
    }
    return { target, position: target.clone().add(dir.clone().multiplyScalar(need)) };
  }

  /** Top-level objects that make up a part (what `add` received), so they can be moved as a unit. */
  partRoots(id) {
    const r = this.roots.get(id);
    if (r?.length) return r;
    return this.meshes.filter((m) => m.userData.partId === id);
  }

  /** Wrap an object in a "mover" group (once) so it can be shifted without fighting the scene's own animation. */
  mover(obj) {
    if (obj.userData.mover) return obj.userData.mover;
    const parent = obj.parent;
    const g = new THREE.Group();
    g.name = 'mover';
    parent.add(g);
    g.add(obj);
    obj.userData.mover = g;
    this.movers.add(g);
    return g;
  }

  /** Hide everything except the given parts (and whatever contains them). Remembers what it hid. */
  showOnly(ids) {
    this.unhide();
    const keep = new Set(ids.flatMap((id) => this.partRoots(id)));
    const containsKept = (o) => { let found = false; o.traverse((x) => { if (keep.has(x)) found = true; }); return found; };
    const hide = (o) => { if (o.visible) { o.visible = false; this.hidden.push(o); } };
    const walk = (node) => {
      for (const c of node.children) {
        if (c === this.overlay) continue;
        if (keep.has(c)) continue;
        if (containsKept(c)) { walk(c); continue; }
        // a pickable mesh of another part, or anything unrelated (labels, particles, other parts) → hide
        hide(c);
      }
    };
    walk(this.root);
    this.isolated = ids.slice();
  }

  unhide() {
    this.hidden.forEach((o) => { o.visible = true; });
    this.hidden = [];
    this.isolated = null;
  }

  /** Show ONE part alone and frame it. */
  isolate(id) {
    this.restore({ camera: false });
    this.showOnly([id]);
    this.focusIds.clear();
    this.select(id);
    const box = this.partBox(id);
    if (box.isEmpty()) return;
    const f = this.frameBox(box, this.homeDir());
    this.animateCamera(f.target, f.position, 0.9);
  }

  /**
   * Put two parts next to each other — 'side' (left/right) or 'stack' (above/below) — hide everything else,
   * label them, and frame both. Their own animations keep running inside the moved groups.
   */
  compare(a, b, { layout = 'side', gap = null, labels = true } = {}) {
    this.restore({ camera: false });
    this.showOnly([a, b]);
    this.focusIds.clear();
    this.select(null);
    const boxes = [a, b].map((id) => this.partBox(id, true));
    if (boxes.some((x) => x.isEmpty())) return;
    const sizes = boxes.map((bx) => bx.getSize(new THREE.Vector3()));
    const centers = boxes.map((bx) => bx.getCenter(new THREE.Vector3()));
    const dir = this.homeDir();
    const right = new THREE.Vector3().crossVectors(dir.clone().negate(), new THREE.Vector3(0, 1, 0)).normalize();
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    const up = new THREE.Vector3().crossVectors(right, dir.clone().negate()).normalize();
    const axis = layout === 'stack' ? up : right;
    const ext = (s) => Math.abs(s.x * axis.x) + Math.abs(s.y * axis.y) + Math.abs(s.z * axis.z);
    const g = gap ?? Math.max(ext(sizes[0]), ext(sizes[1])) * 0.35;
    const total = ext(sizes[0]) + ext(sizes[1]) + g;
    const mid = centers[0].clone().add(centers[1]).multiplyScalar(0.5);
    const sign = layout === 'stack' ? [1, -1] : [-1, 1]; // a on the left / on top
    const targets = [
      mid.clone().add(axis.clone().multiplyScalar(sign[0] * (total / 2 - ext(sizes[0]) / 2))),
      mid.clone().add(axis.clone().multiplyScalar(sign[1] * (total / 2 - ext(sizes[1]) / 2))),
    ];
    const moves = [];
    [a, b].forEach((id, k) => {
      const delta = targets[k].clone().sub(centers[k]);
      for (const r of this.partRoots(id)) {
        const m = this.mover(r);
        // convert the world delta into the mover's parent space
        const p0 = m.parent.worldToLocal(m.getWorldPosition(new THREE.Vector3()));
        const p1 = m.parent.worldToLocal(m.getWorldPosition(new THREE.Vector3()).add(delta));
        moves.push({ m, from: m.position.clone(), to: m.position.clone().add(p1.sub(p0)) });
      }
    });
    this.moveTween = { t: 0, duration: 0.8, moves };
    // final framing box
    const fbox = new THREE.Box3();
    boxes.forEach((bx, k) => { const s = sizes[k].clone().multiplyScalar(0.5); fbox.expandByPoint(targets[k].clone().sub(s)); fbox.expandByPoint(targets[k].clone().add(s)); });
    // parts that already carry their own name tag (a sprite inside them) don't get a second one
    const hasTag = (id) => this.partRoots(id).some((r) => { let f = false; r.traverse((o) => { if (o.isSprite) f = true; }); return f; });
    if (labels && !(hasTag(a) && hasTag(b))) {
      this.overlay.clear();
      [a, b].forEach((id, k) => {
        const p = this.parts.get(id);
        const name = p ? (this.lang?.() === 'he' ? p.name.he : p.name.en) : id;
        const spr = labelSprite(name, Math.max(sizes[0].length(), sizes[1].length()) * 0.07);
        const below = layout === 'stack' ? targets[k].clone().add(right.clone().multiplyScalar(-(ext(sizes[k]) / 2 + spr.scale.x * 0.6))) : targets[k].clone().add(up.clone().multiplyScalar(-(sizes[k].y / 2 + spr.scale.y * 1.2)));
        spr.position.copy(below);
        this.overlay.add(spr);
        fbox.expandByPoint(below);
      });
    }
    // margin 1.25: deep 3D parts (branching cells) poke out of a tighter frame because of perspective
    const f = this.frameBox(fbox, dir, 1.25);
    this.animateCamera(f.target, f.position, 0.9);
    this.comparing = [a, b];
  }

  /** Undo isolate/compare: everything visible again, moved parts glide home. */
  restore({ camera = true } = {}) {
    this.unhide();
    this.overlay?.clear();
    const moves = [...this.movers].filter((m) => m.position.lengthSq() > 1e-10).map((m) => ({ m, from: m.position.clone(), to: new THREE.Vector3() }));
    if (moves.length) this.moveTween = { t: 0, duration: 0.6, moves };
    this.comparing = null;
    if (camera) this.resetView();
  }

  /** Lay parts out on a grid (in the X–Y plane) using their real sizes, so none of them overlap. */
  arrange(ids, { cols = 3, gap = 0.6, center = new THREE.Vector3() } = {}) {
    const items = ids.map((id) => ({ id, roots: this.partRoots(id), box: this.partBox(id, true) })).filter((x) => !x.box.isEmpty());
    const size = items.map((x) => x.box.getSize(new THREE.Vector3()));
    const cw = Math.max(...size.map((s) => s.x)) + gap, ch = Math.max(...size.map((s) => s.y)) + gap;
    const rows = Math.ceil(items.length / cols);
    items.forEach((it, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const inRow = Math.min(cols, items.length - r * cols);
      const target = new THREE.Vector3(center.x + (c - (inRow - 1) / 2) * cw, center.y + ((rows - 1) / 2 - r) * ch, center.z);
      const delta = target.sub(it.box.getCenter(new THREE.Vector3()));
      it.roots.forEach((o) => o.position.add(o.parent.worldToLocal(o.getWorldPosition(new THREE.Vector3()).add(delta)).sub(o.position)));
    });
    return { cellW: cw, cellH: ch, rows };
  }

  homeDir() {
    return this.home ? this.home.position.clone().sub(this.home.target).normalize() : this.camera.position.clone().sub(this.controls.target).normalize();
  }

  focus(ids) { this.focusIds = new Set(ids || []); this.refresh(); }
  select(id) { this.selectedId = id; this.refresh(); }

  refresh() {
    this.needsRender = true;
    const hasFocus = this.focusIds.size > 0;
    for (const m of this.meshes) {
      const id = m.userData.partId;
      const mat = m.material;
      const on = this.focusIds.has(id) || id === this.selectedId;
      const base = m.userData.baseOpacity;
      const op = hasFocus && !this.focusIds.has(id) ? Math.min(base, 0.18) : base;
      mat.transparent = op < 1 || mat.transparent;
      mat.opacity = op;
      mat.depthWrite = op > 0.9;
      if (mat.emissive) {
        const glow = on ? 0.35 : id === this.hoverId ? 0.2 : 0;
        if (glow) mat.emissive.copy(mat.color).multiplyScalar(glow);
        else if (m.userData.baseEmissive) mat.emissive.copy(m.userData.baseEmissive);
      }
    }
  }

  bindEvents() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointermove', (e) => {
      const id = this.pick(e);
      if (id !== this.hoverId) { this.hoverId = id; el.style.cursor = id ? 'pointer' : 'grab'; this.refresh(); }
      this.handlers.hover(id, e);
    });
    el.addEventListener('pointerleave', () => { this.hoverId = null; this.refresh(); this.handlers.hover(null); });
    el.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const id = this.pick(e);
      // phones have no hover: a tap also shows the part's name for 2 seconds
      if (e.pointerType !== 'mouse' && id) { this.handlers.hover(id, e); clearTimeout(this.tapTimer); this.tapTimer = setTimeout(() => this.handlers.hover(null), 2000); }
      this.select(id);
      this.handlers.select(id);
    });
  }

  pick(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    // pickHidden: the scene is hidden under a sourced model (Explore's "Real model"), its parts still answer taps
    const targets = this.meshes.filter((m) => m.visible && m.material.opacity > 0.15 && (this.pickHidden || this.isVisible(m)));
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    return hit ? hit.object.userData.partId : null;
  }

  isVisible(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }

  resize() {
    this.needsRender = true;
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    // re-sizing the canvas clears and re-allocates it: only when the size really changed (no hitch at a dive start)
    if (this.sizeKey !== w + "x" + h) { this.sizeKey = w + "x" + h; this.renderer.setSize(w, h); }
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setActive(on) { this.active = on; if (on) { this.resize(); this.needsRender = true; } }

  frame() {
    if (!this.active) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    if (this.tween && !this.driven) {
      const tw = this.tween;
      tw.t += dt / tw.duration;
      const k = tw.t >= 1 ? 1 : 1 - Math.pow(1 - tw.t, 3);
      this.controls.target.lerpVectors(tw.fromT, tw.toT, k);
      this.camera.position.lerpVectors(tw.fromP, tw.toP, k);
      if (tw.t >= 1) this.tween = null;
    }
    if (this.moveTween) {
      const mt = this.moveTween;
      mt.t += dt / mt.duration;
      const k = mt.t >= 1 ? 1 : 1 - Math.pow(1 - mt.t, 3);
      for (const mv of mt.moves) mv.m.position.lerpVectors(mv.from, mv.to, k);
      if (mt.t >= 1) this.moveTween = null;
    }
    if (this.root.visible) for (const fn of this.updaters) fn(dt, this.time); // paused under a sourced model
    if (this.focusIds.size) {
      const pulse = 0.22 + 0.13 * Math.sin(this.time * 3.3);
      for (const m of this.meshes) if (this.focusIds.has(m.userData.partId) && m.material.emissive) m.material.emissive.copy(m.material.color).multiplyScalar(pulse);
    }
    if (!this.driven) this.controls.update();
    // Render only when something can have changed: camera flight/drag/damping, part moves, a pulse, or scene
    // animations (scene updaters run every frame, so a scene with updaters keeps rendering while shown).
    // (scene animations only count while the scene is shown: under a sourced model they cannot change the picture)
    if (this.needsRender || this.driven || this.tween || this.moveTween || (this.updaters.size && this.root.visible) || this.focusIds.size) {
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
    }
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.ro.disconnect();
    this.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
