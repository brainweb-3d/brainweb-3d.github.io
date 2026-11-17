// Plays a pathway (from pathways.js) inside the 3D brain: glowing tracts that grow stage by stage,
// with particles ("signals") streaming along them.
import * as THREE from 'three';

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

  /** Resolve a point spec from pathways.js into a 3D position. */
  point(spec) {
    if (spec && spec.v) return this.brain.virtualPoint(spec.v);
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
      return { def: st, paths };
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
    const st = this.stages[this.stageIndex];
    if (st) this.onStage(this.stageIndex, st.def);
  }

  setProgress(p, f) {
    const count = Math.floor(p.tube.geometry.index.count * f / 6) * 6;
    p.tube.geometry.setDrawRange(0, count);
    p.glow.geometry.setDrawRange(0, Math.floor(p.glow.geometry.index.count * f / 6) * 6);
    p.progress = f;
    p.dots.visible = f > 0.05;
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
          this.onStage(idx, this.stages[idx].def);
        }
      }
    }
    const local = Math.min(1, (this.time - this.stageIndex * STAGE_SECONDS) / (STAGE_SECONDS * 0.45));
    const st = this.stages[this.stageIndex];
    if (st) st.paths.forEach((p) => this.setProgress(p, Math.max(p.progress || 0, local)));
    // Move particles along the drawn part of every visible path
    const now = performance.now() / 1000;
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
      obj.geometry?.dispose();
      obj.material?.dispose();
      this.group.remove(obj);
    }
    this.pathway = null;
    this.stages = [];
    this.playing = false;
  }

  /** All regions involved in the pathway (used to fly the camera). */
  allRegions() {
    return [...new Set((this.pathway?.stages || []).flatMap((s) => s.regions || []))];
  }
}
