// Plays a pathway (from pathways.js) inside the 3D brain: glowing tracts that grow stage by stage,
// with particles ("signals") streaming along them.
import * as THREE from 'three';
import { t, getLang } from '../i18n.js';

const STAGE_SECONDS = 4.5; // how long each stage lasts when playing
const PARTICLES_PER_PATH = 14;

let dotTexture = null;
function getDotTexture() {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}

/** A spot's name: a real HTML element over the 3D view (sharp at every size and zoom, unlike text drawn into a
 *  texture), placed every frame on the spot's screen position. */
function labelEl(text, color) {
  const el = document.createElement('div');
  el.className = 'pw-label';
  el.dir = 'auto';
  el.textContent = text;
  el.style.setProperty('--pw-c', '#' + color.getHexString());
  el.hidden = true;
  return el;
}

const v3 = new THREE.Vector3();

export class PathwayAnimator {
  /** @param brain BrainScene instance */
  constructor(brain) {
    this.brain = brain;
    this.group = new THREE.Group();
    this.group.renderOrder = 10;
    brain.scene.add(this.group);
    this.pathway = null;
    this.stages = [];
    this.stageIndex = 0;
    this.time = 0;
    this.playing = false;
    this.speed = 1;
    this.stepMode = true; // learner-paced: each stage plays once, then waits for "Next" (Mayer's segmenting principle)
    this.waiting = false; // a stage finished drawing and waits for "Next"
    this.onStage = () => {};
    this.onWait = () => {};
    this.onEnd = () => {};
  }

  /** Resolve a point spec from pathways.js into a 3D position. { s: [id, side, off] } = on the part's surface. */
  point(spec) {
    if (spec && spec.v) return this.brain.virtualPoint(spec.v);
    if (spec && spec.s) {
      const [id, s, off] = spec.s;
      return this.brain.surfacePoint(id, s === 'L' ? -1 : s === 'R' ? 1 : 0, off || [0, 0, 0]);
    }
    if (typeof spec === 'string') return this.brain.regionPoint(spec, 0, [0, 0, 0]);
    const [id, s, off] = spec;
    const side = s === 'L' ? -1 : s === 'R' ? 1 : 0;
    return this.brain.regionPoint(id, side, off || [0, 0, 0]);
  }

  load(pathway) {
    this.clear();
    this.pathway = pathway;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.stages = pathway.stages.map((st) => {
      const color = new THREE.Color(st.color || pathway.color);
      const paths = st.paths
        .map((pts) => pts.map((p) => this.point(p)).filter(Boolean))
        .filter((pts) => pts.length >= 2)
        .map((pts) => {
          // Lift straight segments into a gentle arc so tracts don't cut straight through tissue
          const ctrl = [];
          for (let i = 0; i < pts.length; i++) {
            ctrl.push(pts[i]);
            if (i < pts.length - 1 && pts.length === 2) {
              const mid = pts[i].clone().lerp(pts[i + 1], 0.5);
              mid.y += pts[i].distanceTo(pts[i + 1]) * 0.12;
              ctrl.push(mid);
            }
          }
          const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
          const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.0075, 8, false);
          const tube = new THREE.Mesh(tubeGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthTest: false, blending: THREE.AdditiveBlending }));
          tube.renderOrder = 11;
          tubeGeo.setDrawRange(0, 0);
          const glowGeo = new THREE.TubeGeometry(curve, 64, 0.02, 8, false);
          const glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, depthTest: false, blending: THREE.AdditiveBlending }));
          glow.renderOrder = 10;
          glowGeo.setDrawRange(0, 0);
          const n = reduced ? 3 : PARTICLES_PER_PATH;
          const pos = new Float32Array(n * 3);
          const pg = new THREE.BufferGeometry();
          pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          const dots = new THREE.Points(pg, new THREE.PointsMaterial({ color: color.clone().lerp(new THREE.Color('#ffffff'), 0.35), size: 0.05, map: getDotTexture(), transparent: true, depthTest: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
          dots.renderOrder = 12;
          dots.visible = false;
          this.group.add(glow, tube, dots);
          return { curve, tube, glow, dots, n, phase: Math.random() };
        });
      // Spots: small named areas without a part of their own (e.g. the frontal eye field), drawn as a glowing dot
      // with a label. They appear with their stage and stay, like the tracts.
      const spots = (st.spots || []).map((sp) => {
        const at = this.point(sp.at);
        if (!at) return null;
        const g = new THREE.Group();
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: getDotTexture(), color, transparent: true, depthTest: false, blending: THREE.AdditiveBlending }));
        glow.scale.setScalar(0.11);
        const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: getDotTexture(), color: color.clone().lerp(new THREE.Color('#ffffff'), 0.6), transparent: true, depthTest: false }));
        core.scale.setScalar(0.035);
        g.add(glow, core);
        g.position.copy(at);
        let label = null;
        if (sp.label) {
          // the label's anchor: pushed outward from the brain's centre so it sits beside the spot, not on top of it
          const out = at.clone().sub(this.brain.box().getCenter(new THREE.Vector3())).normalize();
          const anchor = at.clone().add(out.multiplyScalar(0.07)).add(new THREE.Vector3(0, sp.dy ?? 0.05, 0)); // dy: move a label up/down so neighbours don't overlap
          label = { el: labelEl(t(sp.label), color), anchor, text: sp.label };
          this.labelLayer().appendChild(label.el);
        }
        g.renderOrder = 13;
        g.traverse((o) => { o.renderOrder = 13; });
        g.visible = false;
        this.group.add(g);
        return { g, glow, label };
      }).filter(Boolean);
      return { def: st, paths, spots };
    });
    this.stageIndex = 0;
    this.time = 0;
    this.playing = true;
    this.showStage(0);
  }

  showStage(i) {
    this.waiting = false;
    this.stageIndex = Math.max(0, Math.min(i, this.stages.length - 1));
    this.time = this.stageIndex * STAGE_SECONDS;
    // Stages before the current one are fully drawn; later ones hidden
    this.stages.forEach((st, k) => st.paths.forEach((p) => this.setProgress(p, k < this.stageIndex ? 1 : 0)));
    this.showSpots();
    const st = this.stages[this.stageIndex];
    if (st) this.onStage(this.stageIndex, st.def);
  }

  /** Spots of this and earlier stages are shown; only the current stage's spots keep their labels (less clutter). */
  showSpots() {
    this.stages.forEach((st, k) => st.spots.forEach((s) => {
      s.g.visible = k <= this.stageIndex;
      if (s.label) s.label.el.hidden = k !== this.stageIndex;
    }));
  }

  setProgress(p, f) {
    const count = Math.floor(p.tube.geometry.index.count * f / 6) * 6;
    p.tube.geometry.setDrawRange(0, count);
    p.glow.geometry.setDrawRange(0, Math.floor(p.glow.geometry.index.count * f / 6) * 6);
    p.progress = f;
    p.dots.visible = f > 0.05;
  }

  /** The HTML layer for spot labels, over the brain's canvas (created on first use). */
  labelLayer() {
    if (!this.labels) {
      this.labels = document.createElement('div');
      this.labels.className = 'pw-labels';
      this.brain.container.appendChild(this.labels);
    }
    return this.labels;
  }

  /** Put each shown label on its spot's screen position (hidden when behind the camera). */
  placeLabels() {
    const c = this.brain.container, w = c.clientWidth, h = c.clientHeight;
    if (this.labelLang !== getLang()) { // the site's language was switched while the pathway plays
      this.labelLang = getLang();
      for (const st of this.stages) for (const s of st.spots) if (s.label) s.label.el.textContent = t(s.label.text);
    }
    for (const st of this.stages) for (const s of st.spots) {
      if (!s.label || s.label.el.hidden) continue;
      v3.copy(s.label.anchor).project(this.brain.camera);
      const off = v3.z > 1 || Math.abs(v3.x) > 1.2 || Math.abs(v3.y) > 1.2;
      s.label.el.style.visibility = off ? 'hidden' : '';
      if (!off) s.label.el.style.transform = `translate3d(${((v3.x + 1) / 2 * w).toFixed(1)}px,${((1 - v3.y) / 2 * h).toFixed(1)}px,0) translate(-50%,-50%)`;
    }
  }

  /** Next / previous stage: it draws itself, then waits again. */
  next() { if (this.stageIndex < this.stages.length - 1) { this.showStage(this.stageIndex + 1); this.playing = true; } }
  prev() { this.showStage(this.stageIndex - 1); this.playing = true; }
  replay() { this.showStage(0); this.playing = true; }
  toggle() { this.playing = !this.playing; return this.playing; }

  /** Called every frame by BrainScene. */
  update(dt) {
    if (!this.pathway) return;
    if (this.playing) {
      this.time += dt * this.speed;
      const idx = Math.floor(this.time / STAGE_SECONDS);
      if (idx > this.stageIndex && this.stepMode && idx < this.stages.length) {
        // stop at the end of this stage and wait for the learner
        this.time = (this.stageIndex + 1) * STAGE_SECONDS - 0.001;
        this.playing = false;
        this.waiting = true;
        this.onWait(this.stageIndex);
      } else if (idx > this.stageIndex) {
        if (idx >= this.stages.length) {
          this.time = this.stages.length * STAGE_SECONDS - 0.001;
          this.playing = false;
          this.onEnd();
        } else {
          this.stageIndex = idx;
          this.showSpots();
          this.onStage(idx, this.stages[idx].def);
        }
      }
    }
    const local = Math.min(1, (this.time - this.stageIndex * STAGE_SECONDS) / (STAGE_SECONDS * 0.45));
    const st = this.stages[this.stageIndex];
    if (st) st.paths.forEach((p) => this.setProgress(p, Math.max(p.progress || 0, local)));
    // Move particles along the drawn part of every visible path
    const now = performance.now() / 1000;
    // The current stage's spots pulse; earlier ones glow steadily
    this.stages.forEach((s, k) => s.spots.forEach((sp, j) => {
      sp.glow.scale.setScalar(k === this.stageIndex ? 0.11 * (1 + 0.28 * Math.sin(now * 4 + j)) : 0.09);
    }));
    this.placeLabels();
    for (const s of this.stages) {
      for (const p of s.paths) {
        if (!p.dots.visible) continue;
        const arr = p.dots.geometry.attributes.position.array;
        for (let k = 0; k < p.n; k++) {
          const t = ((now * 0.35 * this.speed + p.phase + k / p.n) % 1) * p.progress;
          const v = p.curve.getPointAt(t);
          arr[k * 3] = v.x; arr[k * 3 + 1] = v.y; arr[k * 3 + 2] = v.z;
        }
        p.dots.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  clear() {
    for (const obj of [...this.group.children]) {
      obj.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      this.group.remove(obj);
    }
    if (this.labels) this.labels.textContent = ''; // remove the spot labels
    this.pathway = null;
    this.stages = [];
    this.playing = false;
  }

  /** All regions involved in the pathway (used to fly the camera). */
  allRegions() {
    return [...new Set((this.pathway?.stages || []).flatMap((s) => s.regions || []))];
  }
}
