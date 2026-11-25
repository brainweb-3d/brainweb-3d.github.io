// In-scene "next step" hotspots: a DOM dot (44 px target) + short label, anchored on the part's visible surface.
// Anchor = where a ray from the home camera toward the part's centre first hits the visible surface (for the brain:
// the detailed skin; otherwise the part itself). Hidden when occluded, back-facing, off screen, or while moving.
import * as THREE from 'three';
import { getLang } from '../i18n.js';
import { esc } from '../util.js';
import { preloadModule } from './World.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const T = (b) => (b ? L(b.en, b.he) : '');
const KIND = {
  in: () => L('fly in ›', 'טסים פנימה ›'),
  out: () => L('zoom out ‹', 'זום החוצה ‹'),
  method: () => L('see the method ›', 'לשיטה ›'),
  side: () => L('go there ›', 'לשם ›'),
};
const ray = new THREE.Raycaster();
const v3 = new THREE.Vector3();

/** Anchor of a hotspot's part in a view: { point, normal, radius } or null when the part has no geometry yet. */
export function anchorFor(view, hs) {
  // a sourced model whose shape differs from the scene: `dotAt` pins the dot to a spot on the model itself, given as
  // a fraction [x, y] of the model's on-screen box in the home view ('hide': no dot while the model shows)
  const at = view.realMode && (hs.at || view.model?.spec.dotAt?.[hs.part]); // hs.at: a label-only mark on the model
  if (at === 'hide') return null;
  if (at) { const a = anchorOnModel(view, at); if (a) return a; }
  let part = view.partMeshes(hs.part, hs.side || 0);
  if (!part.length) return null;
  // a part made of separate pieces can mark the one piece its dot sits on (userData.dot): otherwise the box centre
  // of e.g. two transporters on either side of a synapse is the empty cleft between them
  const pinned = part.filter((m) => m.userData.dot);
  if (pinned.length) part = pinned;
  view.engine.scene.updateMatrixWorld(true);
  const box = new THREE.Box3();
  part.forEach((m) => box.expandByObject(m));
  if (box.isEmpty()) return null;
  const ctr = box.getCenter(new THREE.Vector3());
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
  const home = view.homeView().position;
  ray.set(home, ctr.clone().sub(home).normalize());
  ray.far = Infinity;
  const surf = view.surfaceMeshes?.() || [];
  // the part's own pieces are on the model (linked by name): put the dot on the piece itself — for a part made of
  // separate pieces (a ring-shaped membrane, two vesicles) the box centre is empty space, not the part
  if (part.some((m) => m.userData.onModel)) {
    const pieces = part.filter((m) => !m.userData.noDot);
    const own = ray.intersectObjects(pieces, false)[0] || nearestOnRay(pieces, ray.ray);
    if (own) {
      const point = own.point.clone();
      let normal = own.face ? own.face.normal.clone().transformDirection(own.object.matrixWorld) : home.clone().sub(point).normalize();
      if (normal.dot(home.clone().sub(point)) < 0) normal.negate();
      return { point, normal, radius };
    }
  }
  let hit = surf.length ? ray.intersectObjects(surf, false)[0] : null;
  // a thin sourced model (e.g. a neuron) may not lie on the ray: use the model point closest to it instead
  if (!hit && view.realMode && surf.length) hit = nearestOnRay(surf, ray.ray);
  // never let a dot land far from its own part (the ray can slip between a thin model's strands and pick a point
  // elsewhere, even behind the body): then use the part itself
  if (hit && view.realMode && hit.point.distanceTo(ctr) > Math.max(radius * 2, (view.visibleRadius?.() || 0) * 0.05)) hit = null;
  hit ||= ray.intersectObjects(part, false)[0];
  const point = hit ? hit.point.clone() : ctr;
  let normal = hit?.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : home.clone().sub(ctr).normalize();
  if (normal.dot(home.clone().sub(point)) < 0) normal.negate(); // double-sided surfaces: the side facing home
  return { point, normal, radius };
}

/** The point of the sourced model seen at fraction [fx, fy] of its on-screen box (from the home view), or null. */
function anchorOnModel(view, [fx, fy]) {
  const meshes = view.model.meshes;
  const h = view.homeView(), cam = view.camera.clone();
  cam.position.copy(h.position); cam.lookAt(h.target); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const box = new THREE.Box3(); meshes.forEach((m) => box.expandByObject(m));
  if (box.isEmpty()) return null;
  let x0 = 1, x1 = -1, y0 = 1, y1 = -1;
  for (let i = 0; i < 8; i++) {
    v3.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(cam);
    x0 = Math.min(x0, v3.x); x1 = Math.max(x1, v3.x); y0 = Math.min(y0, v3.y); y1 = Math.max(y1, v3.y);
  }
  ray.setFromCamera(new THREE.Vector2(x0 + (x1 - x0) * fx, y1 - (y1 - y0) * fy), cam); // fy from the top
  ray.far = Infinity;
  const hit = ray.intersectObjects(meshes, false)[0] || nearestOnRay(meshes, ray.ray);
  if (!hit) return null;
  const normal = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : h.position.clone().sub(hit.point).normalize();
  if (normal.dot(h.position.clone().sub(hit.point)) < 0) normal.negate();
  return { point: hit.point.clone(), normal, radius: box.getBoundingSphere(new THREE.Sphere()).radius * 0.15 };
}

/** The vertex of `meshes` closest to a ray (sampled; fine for placing a dot). */
function nearestOnRay(meshes, r) {
  let best = null, bestD = Infinity;
  const p = new THREE.Vector3();
  for (const m of meshes) {
    const pos = m.geometry.attributes.position;
    const step = Math.max(1, Math.floor(pos.count / 4000));
    for (let i = 0; i < pos.count; i += step) {
      p.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      const d = r.distanceSqToPoint(p);
      if (d < bestD) { bestD = d; best = p.clone(); }
    }
  }
  return best && { point: best, face: null };
}

export class Hotspots {
  constructor(el, { onDive, onIntent, onZoom }) {
    this.el = el;
    this.onDive = onDive;
    this.onIntent = onIntent;
    this.onZoom = onZoom;
    this.items = [];
    this.view = null;
    this.rr = 0;
    this.size = { w: el.clientWidth, h: el.clientHeight };
    new ResizeObserver(() => { this.size = { w: el.clientWidth, h: el.clientHeight }; }).observe(el); // one, for good
  }

  /** Hotspots of the place now on screen. */
  set(view, hotspots) {
    this.view = view;
    this.items = hotspots.map((hs, i) => ({ hs, i, anchor: undefined, version: -1, occluded: false, seen: false }));
    this.allHidden = false;
    this.render();
  }

  render() {
    this.items.forEach((it) => { it.shown = false; it.tf = null; it.dy = 0; it.seen = false; it.merged = false; it.members = null; it.mkey = ''; it.html = null; });
    this.el.innerHTML = this.items.map(({ hs, i }) => `
      <button tabindex="-1" aria-hidden="true" class="xw-hot hidden ${hs.kind === 'method' ? 'method' : ''} ${hs.kind === 'out' ? 'out' : ''} ${hs.kind === 'mark' ? 'mark' : ''}" data-h="${i}" aria-label="${esc(T(hs.label))}">
        <span class="dot" aria-hidden="true"></span><span class="lead" aria-hidden="true"></span>
        <span class="lab">${hs.group ? `<em>${esc(T(hs.group))}</em>` : ''}${esc(T(hs.label))}${hs.kind === 'mark' ? '' : `<small>${esc((KIND[hs.kind] || KIND.in)())}</small>`}</span>
      </button>`).join('');
    this.el.querySelectorAll('.xw-hot').forEach((b) => {
      const it = this.items[+b.dataset.h];
      it.btn = b;
      // labels show on hover/focus; on touch screens the first tap shows the label, the second one flies in
      let touch = false;
      b.addEventListener('pointerdown', (e) => { touch = e.pointerType === 'touch' || e.pointerType === 'pen'; });
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (it.hs.kind === 'mark') return; // a label on the real model ("one synapse is here"), not a way in
        if (touch && !b.classList.contains('peek')) {
          this.el.querySelectorAll('.xw-hot.peek').forEach((x) => x.classList.remove('peek'));
          b.classList.add('peek');
          return;
        }
        b.classList.remove('peek');
        // a merged dot (several parts too close to tell apart at this distance) zooms in until they separate
        if (it.members) { this.onZoom?.(it.members.map((m) => m.anchor.point), it.members.map((m) => [m.x, m.y])); return; }
        this.onDive(it.hs, b);
      });
      const intent = () => this.onIntent(it.hs);
      b.addEventListener('pointerenter', intent);
      b.addEventListener('focus', intent);
      b.addEventListener('pointerdown', intent);
    });
  }

  hideAll() {
    if (this.allHidden) return; // one DOM write, not one per frame
    this.allHidden = true;
    this.items.forEach((it) => { if (it.btn) this.setHidden(it.btn, true); it.shown = false; });
  }

  /** Hidden dots: invisible, not focusable, not announced. */
  setHidden(btn, hidden) {
    btn.classList.toggle('hidden', hidden);
    btn.tabIndex = hidden ? -1 : 0;
    btn.toggleAttribute('aria-hidden', hidden);
  }

  /** Per frame (at rest): place the dots (transform only), check one hotspot's occlusion, keep labels apart. */
  update(atRest) {
    const view = this.view;
    if (!view || !this.items.length) return;
    if (!atRest) { this.hideAll(); return; }
    this.allHidden = false;
    const { w, h } = this.size;
    const cam = view.camera;
    const rtl = getLang() === 'he';
    const check = this.items[this.rr++ % this.items.length];
    const camKey = `${cam.position.x.toFixed(3)},${cam.position.y.toFixed(3)},${cam.position.z.toFixed(3)}`;
    const shown = [];
    for (const it of this.items) {
      if (it.version !== view.version) { it.anchor = anchorFor(view, it.hs); it.version = view.version; it.occluded = false; it.camKey = null; }
      const a = it.anchor;
      let hidden = !a;
      if (a) {
        v3.copy(a.point).project(cam);
        it.x = (v3.x * 0.5 + 0.5) * w; it.y = (-v3.y * 0.5 + 0.5) * h;
        // off screen, or under the breadcrumb (top) or the bottom button bar, where it could not be pointed at
        if (v3.z > 1 || it.x < 4 || it.x > w - 4 || it.y < 58 || it.y > h - 80) hidden = true;
        // back-facing: the surface at the anchor turns away from the camera
        if (a.normal.dot(v3.copy(cam.position).sub(a.point)) < 0) hidden = true;
        // the part is hidden (show-alone / compare of another part)
        if (it.hs.kind !== 'mark' && !view.partMeshes(it.hs.part, it.hs.side || 0).some((m) => view.isShown(m))) hidden = true;
        // the brain's hemispheres are pulled apart (an internal part is picked): the dots' anchors are not there now
        if (view.engine?.split > 0.02) hidden = true;
        // occlusion: re-checked only after the camera moved (a ray against the detailed brain is not free)
        if (it === check && !hidden && it.camKey !== camKey) {
          it.camKey = camKey;
          const d = cam.position.distanceTo(a.point);
          ray.set(cam.position, v3.copy(a.point).sub(cam.position).normalize());
          ray.far = d;
          const hit = ray.intersectObjects(view.occluders(), false)[0];
          it.occluded = !!hit && hit.distance < d - Math.max(d * 0.03, a.radius * 0.04);
        }
        if (it.occluded) hidden = true;
      }
      if (hidden !== !it.shown) { this.setHidden(it.btn, hidden); it.shown = !hidden; it.merged = false; }
      if (!hidden) {
        shown.push(it);
        if (!it.seen) { it.seen = true; const lab = it.btn.querySelector('.lab'); it.lab = lab; it.lw = lab.offsetWidth; it.lh = lab.offsetHeight; if (it.hs.to) preloadModule(it.hs.to); }
      }
    }
    this.layout(this.merge(shown), w, h, rtl);
  }

  /**
   * Dots closer than a dot's width can't be told apart or tapped one by one (e.g. eye, ear, nose and tongue on a
   * whole body). They merge, like map markers: the first one stays, marked with a count, and its label lists them
   * all; tapping it zooms in until they separate. Each dot still sits exactly on its own part.
   */
  merge(shown) {
    const R = 46; // a little more than a dot's 44 px hit area: dots that would overlap merge, so a click never lands on a neighbour
    const groups = [];
    for (const it of shown) {
      const g = groups.find((gr) => gr.some((o) => Math.hypot(o.x - it.x, o.y - it.y) < R));
      if (g) g.push(it); else groups.push([it]);
    }
    const reps = [];
    for (const g of groups) {
      g.forEach((it, k) => { const m = k > 0; if (it.merged !== m) { it.merged = m; this.setHidden(it.btn, m); } });
      const rep = g[0], members = g.length > 1 ? g : null;
      const key = members ? members.map((m) => m.i).join(',') : '';
      if (key !== (rep.mkey || '')) {
        rep.mkey = key;
        rep.members = members;
        rep.btn.classList.toggle('cluster', !!members);
        if (!rep.html) rep.html = rep.lab.innerHTML;
        rep.lab.innerHTML = members
          ? `${members.map((m) => esc(T(m.hs.label))).join('<br>')}<small>${esc(L('zoom in to choose ›', 'זום פנימה כדי לבחור ›'))}</small>`
          : rep.html;
        rep.btn.setAttribute('aria-label', members ? `${L('Zoom in', 'זום פנימה')}: ${members.map((m) => T(m.hs.label)).join(', ')}` : T(rep.hs.label));
        const dot = rep.btn.querySelector('.dot'); if (members) dot.dataset.n = members.length; else delete dot.dataset.n;
        rep.lw = rep.lab.offsetWidth; rep.lh = rep.lab.offsetHeight; rep.dx = rep.dy = undefined;
      }
      reps.push(rep);
    }
    return reps;
  }

  /**
   * Each dot sits exactly on its part's anchor (never nudged, so hovering is accurate); its label takes the first
   * spot beside it (natural side, other side, below, above) that stays in view and covers no other dot.
   */
  layout(shown, w, h, rtl) {
    const GAP = 26, DOT = 22;
    for (const it of shown) { it.px = it.x; it.py = it.y; }
    // Only one label shows at a time (hover / focus / first tap), so a label only has to stay on screen and off the
    // other dots; it never has to make room for other labels, which kept it close to its own dot.
    const dots = shown.map((it) => ({ it, x0: it.px - DOT, x1: it.px + DOT, y0: it.py - DOT, y1: it.py + DOT }));
    const hits = (r) => dots.some((o) => r.x0 < o.x1 && r.x1 > o.x0 && r.y0 < o.y1 && r.y1 > o.y0);
    const inView = (r) => r.x0 >= 6 && r.x1 <= w - 6 && r.y0 >= 52 && r.y1 <= h - 70;
    shown.sort((p, q) => p.py - q.py);
    for (const it of shown) {
      const { px: x, py: y, lw, lh } = it;
      const box = (x0, yc) => { x0 = Math.max(8, Math.min(w - 8 - lw, x0)); return { x0, x1: x0 + lw, y0: yc - lh / 2, y1: yc + lh / 2 }; };
      const right = box(x + GAP, y), left = box(x - GAP - lw, y);
      const below = box(x - lw / 2, y + GAP + lh / 2), above = box(x - lw / 2, y - GAP - lh / 2);
      const order = rtl ? [left, right, below, above] : [right, left, below, above];
      // beside the dot, off the other dots; failing that, any side that fits on screen (a label over a dot is
      // better than a label far from its own dot)
      const r = order.find((c) => inView(c) && !hits(c)) || order.find(inView) || order[0];
      // the button is placed with its dot on (px, py); its label sits at (x + 26, y) unless moved
      const tf = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-22px,-50%)`;
      if (tf !== it.tf) { it.tf = tf; it.btn.style.transform = tf; }
      const dx = Math.round(r.x0 - (x + GAP)), dy = Math.round((r.y0 + r.y1) / 2 - y);
      if (dx !== it.dx || dy !== it.dy) {
        it.dx = dx; it.dy = dy;
        it.lab.style.transform = dx || dy ? `translate(${dx}px,${dy}px)` : '';
        // a label moved away from its dot gets a thin leader line back to it
        const nx = Math.max(r.x0, Math.min(x, r.x1)) - x, ny = Math.max(r.y0, Math.min(y, r.y1)) - y;
        const len = Math.hypot(nx, ny) - DOT;
        const lead = it.btn.querySelector('.lead');
        lead.style.display = len > 8 ? 'block' : 'none';
        if (len > 8) lead.style.transform = `rotate(${Math.atan2(ny, nx)}rad) translateX(${DOT}px) scaleX(${len})`;
      }
    }
  }

  /** The first visible hotspot that dives in (for background preloading). */
  firstVisible() { return this.items.find((it) => it.seen && !it.btn.classList.contains('hidden'))?.hs || null; }
  find(id) { return this.items.find((it) => it.hs.id === id); }
}
