// The 3D brain viewer: scene, camera, lights, mouse interaction, highlighting, camera "fly-to",
// the realistic anatomical model (BodyParts3D), slicing, and live pathway animations.
// In Explore it is one of the world's views (src/explore/World.js): new BrainScene(el, { autoLoop: false }) lets the
// world call frame() itself, and scene.driven = true hands the camera to the world during a dive.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
MeshoptDecoder.useWorkers?.(2); // decode the models off the main thread
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildBrain, REGION_COLORS, CORTEX_IDS } from './brainParts.js';
import { PathwayAnimator } from './PathwayAnimator.js';
import { maxPixelRatio } from '../visual/Stage.js';

export const BRAIN_CENTER = new THREE.Vector3(0, -0.05, 0);
// classic lateral view (front on the right), slightly from the front
export const HOME_CAM = BRAIN_CENTER.clone().add(new THREE.Vector3(-4.5, 1.0, 0.9).normalize().multiplyScalar(3.2));
// The anatomical brain model. One constant, so a better model can be swapped in here (same "<region>|<side>" mesh
// names as tools/build-brain-model.mjs writes). The skull/arteries file sits next to it.
export const BRAIN_MODEL_URL = `${import.meta.env?.BASE_URL}models/brain.glb`;
export const BRAIN_EXTRAS_URL = `${import.meta.env?.BASE_URL}models/brain-extras.glb`;
// The detailed sourced brain (NIH 3D, baked fold shading in its vertex colours). With { hq: true } it is the visible
// "skin"; the 39 named parts above stay underneath, hidden, for picking, part names and hotspot anchors.
// Phones and low-memory devices get the lighter version (83k instead of 208k triangles).
const LITE = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768 || (navigator.deviceMemory || 8) <= 4);
export const BRAIN_HQ_URL = `${import.meta.env?.BASE_URL}models/${LITE ? 'brain-hq-lite.glb' : 'brain-hq.glb'}`;
let hqPromise = null;
function loadHQ() {
  hqPromise ||= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(BRAIN_HQ_URL).then((g) => g.scene);
  return hqPromise;
}

/** Compressed glTF mesh → plain float geometry in world space, welded so normals are shared (smooth, not faceted). */
function plainGeometry(obj) {
  const src = obj.geometry.attributes.position;
  const arr = new Float32Array(src.count * 3);
  for (let i = 0; i < src.count; i++) { arr[i * 3] = src.getX(i); arr[i * 3 + 1] = src.getY(i); arr[i * 3 + 2] = src.getZ(i); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  if (obj.geometry.index) g.setIndex(new THREE.BufferAttribute(Uint32Array.from(obj.geometry.index.array), 1));
  g.applyMatrix4(obj.matrixWorld);
  // quantised positions leave split vertices along every seam: weld them, or each triangle is shaded flat
  const w = mergeVertices(g, 1e-4);
  w.computeVertexNormals();
  return w;
}

// Parts that form the outer "shell" (made see-through so deep structures show)
const SHELL_IDS = new Set([...CORTEX_IDS, 'insula', 'cingulate', 'whiteMatter']);
// Non-shell parts that sit on the outside anyway: selecting these does not pull the hemispheres apart
const OUTSIDE_IDS = new Set(['cerebellum', 'pons', 'medulla', 'spinalCord', 'pituitary', 'opticChiasm', 'olfactoryBulb']);
const isInternal = (id) => !!id && !SHELL_IDS.has(id) && !OUTSIDE_IDS.has(id);
const SPLIT_GAP = 0.25, AUTO_SPLIT = 1.7; // auto split (internal part picked) opens the hemispheres wider than the tool
// Natural tissue colours (for the realistic look)
const TISSUE = {
  cortex: '#c98f86', whiteMatter: '#eadccb', deep: '#b98178', stem: '#cfa594', cerebellum: '#b97a72',
  ventricles: '#8fb8d8', fibres: '#f1e8da', gland: '#d48c8c', chiasm: '#eee0c4', cord: '#e6cfbd',
};
function tissueColor(id) {
  if (CORTEX_IDS.has(id) || id === 'insula' || id === 'cingulate') return TISSUE.cortex;
  if (id === 'whiteMatter') return TISSUE.whiteMatter;
  if (id === 'cerebellum') return TISSUE.cerebellum;
  if (id === 'ventricles') return TISSUE.ventricles;
  if (['corpusCallosum', 'fornix'].includes(id)) return TISSUE.fibres;
  if (['pituitary', 'pineal'].includes(id)) return TISSUE.gland;
  if (id === 'opticChiasm') return TISSUE.chiasm;
  if (id === 'spinalCord') return TISSUE.cord;
  if (['midbrain', 'pons', 'medulla', 'superiorColliculus', 'inferiorColliculus'].includes(id)) return TISSUE.stem;
  if (['thalamus', 'hypothalamus', 'hippocampus', 'amygdala', 'basalGanglia'].includes(id)) return TISSUE.deep;
  return null; // small conceptual markers keep their atlas colour
}

function makeMaterial(id) {
  return new THREE.MeshPhysicalMaterial({
    color: REGION_COLORS[id] || '#cccccc',
    roughness: 0.62,
    metalness: 0.0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.55,
    sheen: 0.5,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#ffd9d0'),
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  });
}

// ---- Realistic model: loaded once, shared by every viewer on the page ----
let modelPromise = null;
function loadRealModel() {
  if (modelPromise) return modelPromise;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  modelPromise = loader.loadAsync(BRAIN_MODEL_URL).then((gltf) => {
    const parts = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const name = obj.name.includes('|') ? obj.name : obj.parent?.name || '';
      const [region, side] = name.split('|');
      if (!region) return;
      parts.push({ region, side: side === 'left' ? -1 : side === 'right' ? 1 : 0, geometry: plainGeometry(obj) });
    });
    return parts;
  });
  return modelPromise;
}

// ---- Extras (same frame as the brain): skull bones, tentorium, arteries of the circle of Willis ----
let extrasPromise = null;
function loadExtras() {
  if (extrasPromise) return extrasPromise;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  extrasPromise = loader.loadAsync(BRAIN_EXTRAS_URL).then((gltf) => {
    const out = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      out.push({ part: obj.name.split('|')[0], geometry: plainGeometry(obj) });
    });
    return out;
  });
  return extrasPromise;
}
const EXTRA_LOOK = {
  skull: { color: '#efe6d2', opacity: 0.28 },
  tentorium: { color: '#cbd5e1', opacity: 0.55 },
  arteries: { color: '#d4202a', opacity: 1 },
};

export class BrainScene {
  constructor(container, { mini = false, autoLoop = true, hq = false } = {}) {
    this.skin = 0;        // 0 = coloured parts model, 1 = the detailed HQ skin (only with { hq: true })
    this.hqMeshes = [];
    this.container = container;
    this.mini = mini;
    this.active = false;
    this.seeThrough = false;
    this.split = 0;
    this.splitTarget = 0;
    this.colorMode = 'natural';
    this.focusIds = new Set();
    this.hoverId = null;
    this.selectedId = null;
    this.handlers = { hover: () => {}, select: () => {}, model: () => {} };
    this.tween = null;
    this.realistic = false;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(mini ? Math.min(maxPixelRatio(), 1.5) : maxPixelRatio());
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.88;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.4;
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.05, 50);
    this.camera.position.copy(HOME_CAM);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(BRAIN_CENTER);
    this.controls.enableDamping = true;
    // render on demand: redraw only after a camera move (drag, damping, auto-rotate) or a visible change
    this.needsRender = true;
    this.controls.addEventListener('change', () => { this.needsRender = true; });
    this.controls.minDistance = 0.6;
    this.controls.maxDistance = 7;
    this.controls.autoRotateSpeed = 1.2;

    // studio look (as in the approved prototype): soft sky light, warm key from the front-left, cool rim from behind
    this.scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2030, 0.6));
    const key = new THREE.DirectionalLight(0xfff1e6, 2.1);
    key.position.set(-3, 4, 3);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x7fa6ff, 2.0);
    rim.position.set(3, 1.5, -4);
    this.scene.add(rim);

    this.clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 10);
    this.clipMode = 'none';

    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.setMeshes(buildBrain());

    this.pathways = new PathwayAnimator(this);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.bindEvents();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.clock = new THREE.Clock();
    if (autoLoop) this.renderer.setAnimationLoop(() => this.frame());

    // Swap in the realistic anatomical model when it has loaded (the coded brain stays as a fallback)
    loadRealModel()
      .then((parts) => {
        if (this.disposed) return;
        const meshes = parts.map(({ region, side, geometry }) => {
          const m = new THREE.Mesh(geometry, makeMaterial(region));
          m.userData.sharedGeometry = true; // from the cached model load
          return this.tag(m, region, side);
        });
        const outer = new THREE.Box3();
        meshes.forEach((m) => { if (!['ventricles', 'whiteMatter'].includes(m.userData.regionId)) outer.expandByObject(m); });
        this.setMeshes(meshes);
        this.addMarkers();
        this.realistic = true;
        if (this.pathways.pathway) this.pathways.load(this.pathways.pathway);
        return hq ? this.addHQ(outer).catch((e) => console.warn('Detailed brain not available, showing the parts model.', e)) : null;
      })
      .then(() => { if (!this.disposed && this.realistic) this.handlers.model(true); })
      .catch((e) => {
        console.warn('Realistic brain model not available, using the simplified model.', e);
        this.addMarkers();
        this.handlers.model(false);
      });
  }

  on(event, fn) { this.handlers[event] = fn; }

  tag(mesh, id, side = 0) {
    mesh.userData.regionId = id;
    mesh.userData.side = side;
    mesh.userData.cortex = CORTEX_IDS.has(id);
    mesh.userData.shell = SHELL_IDS.has(id);
    mesh.userData.basePos = mesh.position.clone();
    return mesh;
  }

  setMeshes(meshes) {
    for (const m of this.meshes || []) { this.group.remove(m); m.geometry.dispose(); m.material.dispose(); }
    this.meshes = [];
    this.byRegion = new Map();
    for (const m of meshes) this.addMesh(m);
    this.applyClip();
    this.computeAnchors();
    this.refreshMaterials();
  }

  addMesh(m) {
    if (!(m.material instanceof THREE.MeshPhysicalMaterial)) {
      const old = m.material;
      m.material = makeMaterial(m.userData.regionId);
      old.dispose();
    }
    m.userData.shell = SHELL_IDS.has(m.userData.regionId);
    this.group.add(m);
    this.meshes.push(m);
    if (!this.byRegion.has(m.userData.regionId)) this.byRegion.set(m.userData.regionId, []);
    this.byRegion.get(m.userData.regionId).push(m);
  }

  /** Small nuclei that are not separate meshes in the model are drawn as markers at their anatomical position. */
  addMarkers() {
    const L = (this.box().getSize(new THREE.Vector3()).z || 1.75) / 1.75;
    const m = 0.03 * L;
    const add = (id, side, pos, scale, geo = 'sphere') => {
      if (!pos || geo === null || (this.byRegion.get(id) || []).some((x) => x.userData.side === side || side === 0)) return;
      const mesh = new THREE.Mesh(geo === 'sphere' ? new THREE.SphereGeometry(1, 24, 16) : geo, makeMaterial(id));
      if (geo === 'sphere') mesh.scale.set(...scale);
      mesh.position.copy(pos);
      this.addMesh(this.tag(mesh, id, side));
    };
    const tube = (a, b, r) => (a && b ? new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 8, r, 10, false) : null);
    const rp = (...args) => this.regionPoint(...args);
    for (const s of [-1, 1]) {
      add('substantiaNigra', s, rp('midbrain', 0, [0.45 * s, -0.25, 0.3]), [m * 1.2, m * 0.45, m * 0.7]);
      add('locusCoeruleus', s, rp('pons', 0, [0.3 * s, 0.6, -0.6]), [m * 0.45, m * 0.45, m * 0.45]);
      add('nucleusAccumbens', s, rp('basalGanglia', s, [-0.35 * s, -0.55, 0.55]), [m * 0.8, m * 0.65, m * 0.8]);
      add('basalForebrain', s, rp('basalGanglia', s, [-0.45 * s, -0.95, 0.3]), [m * 0.7, m * 0.5, m * 0.7]);
      const bulb = rp('frontal', s, [0, -1, 0.7]);
      if (bulb) { bulb.x = s * 0.05 * L; bulb.y -= 0.015 * L; }
      add('olfactoryBulb', s, bulb, [m * 0.6, m * 0.45, m * 2]);
    }
    add('vta', 0, rp('midbrain', 0, [0, -0.35, 0.45]), [m * 0.7, m * 0.5, m * 0.7]);
    add('scn', 0, rp('hypothalamus', 0, [0, -0.6, 0.6]), [m * 0.4, m * 0.35, m * 0.4]);
    add('pag', 0, rp('midbrain', 0, [0, 0.3, -0.35]), [m * 0.55, m * 1.3, m * 0.55]);
    const mid = rp('midbrain'), med = rp('medulla');
    add('reticular', 0, new THREE.Vector3(), null, tube(rp('midbrain', 0, [0, 0, -0.25]), rp('medulla', 0, [0, 0, -0.25]), m * 0.45));
    add('raphe', 0, new THREE.Vector3(), null, tube(rp('midbrain', 0, [0, -0.2, 0.05]), rp('medulla', 0, [0, 0.2, 0.15]), m * 0.3));
    if (mid && med && !(this.byRegion.get('spinalCord') || []).length) {
      const top = rp('medulla', 0, [0, -0.9, -0.1]);
      const bottom = top.clone().add(new THREE.Vector3(0, -0.32 * L, -0.04 * L));
      const r = (this.regionBox('medulla').getSize(new THREE.Vector3()).x || 0.12) * 0.2;
      add('spinalCord', 0, new THREE.Vector3(), null, tube(top, bottom, r));
    }
    this.applyClip();
    this.computeAnchors();
    this.refreshMaterials();
  }

  box() {
    const b = new THREE.Box3();
    for (const m of this.meshes) if (m.userData.regionId !== 'spinalCord') b.expandByObject(m);
    return b;
  }

  regionBox(id, side = 0) {
    let meshes = this.byRegion.get(id) || [];
    if (side) { const s = meshes.filter((m) => m.userData.side === side); if (s.length) meshes = s; }
    const b = new THREE.Box3();
    meshes.forEach((m) => b.expandByObject(m));
    return b;
  }

  /** A point inside a part: centre + offset given as fractions of its half-size. */
  regionPoint(id, side = 0, off = [0, 0, 0]) {
    const b = this.regionBox(id, side);
    if (b.isEmpty()) return null;
    const c = b.getCenter(new THREE.Vector3());
    const h = b.getSize(new THREE.Vector3()).multiplyScalar(0.5);
    return c.add(new THREE.Vector3(off[0] * h.x, off[1] * h.y, off[2] * h.z));
  }

  /** Points outside the brain, used as start/end of sensory and motor pathways. */
  virtualPoint(name) {
    const B = this.box();
    const S = B.getSize(new THREE.Vector3());
    const chiasm = this.regionPoint('opticChiasm') || new THREE.Vector3(0, B.min.y + S.y * 0.3, B.max.z - S.z * 0.25);
    const temporal = (s) => this.regionPoint('temporal', s) || new THREE.Vector3(s * S.x * 0.45, chiasm.y, 0);
    const cordBottom = this.regionPoint('spinalCord', 0, [0, -1, 0]) || new THREE.Vector3(0, B.min.y - 0.4, -0.15);
    const eyeY = chiasm.y + S.y * 0.05;
    switch (name) {
      case 'eyeL': return new THREE.Vector3(-S.x * 0.2, eyeY, B.max.z + S.z * 0.06);
      case 'eyeR': return new THREE.Vector3(S.x * 0.2, eyeY, B.max.z + S.z * 0.06);
      case 'earL': return temporal(-1).setX(B.min.x - S.x * 0.12);
      case 'earR': return temporal(1).setX(B.max.x + S.x * 0.12);
      case 'nose': return new THREE.Vector3(0, eyeY - S.y * 0.18, B.max.z + S.z * 0.1);
      case 'tongue': return new THREE.Vector3(0, eyeY - S.y * 0.42, B.max.z - S.z * 0.02);
      case 'handR': return new THREE.Vector3(S.x * 0.7, cordBottom.y + S.y * 0.05, cordBottom.z + S.z * 0.2);
      case 'handL': return new THREE.Vector3(-S.x * 0.7, cordBottom.y + S.y * 0.05, cordBottom.z + S.z * 0.2);
      case 'adrenal': return new THREE.Vector3(S.x * 0.18, cordBottom.y - S.y * 0.2, cordBottom.z + S.z * 0.1);
      default: return null;
    }
  }

  /** A point on/in each region used to place labels and aim the camera. */
  computeAnchors() {
    this.anchors = new Map();
    const C = this.box().getCenter(new THREE.Vector3());
    for (const [id, meshes] of this.byRegion) {
      if (meshes[0].userData.cortex) {
        // Cortical areas: one surface point per hemisphere; the label uses whichever side faces the camera
        const pts = [];
        for (const m of meshes) {
          const p = m.geometry.attributes.position;
          const avg = new THREE.Vector3();
          for (let i = 0; i < p.count; i++) avg.add(new THREE.Vector3().fromBufferAttribute(p, i));
          avg.divideScalar(p.count);
          const dir = avg.clone().sub(C).normalize();
          let best = avg, bestDot = -Infinity;
          for (let i = 0; i < p.count; i += 3) {
            const v = new THREE.Vector3().fromBufferAttribute(p, i);
            const d = v.clone().sub(C).normalize().dot(dir);
            if (d > bestDot) { bestDot = d; best = v; }
          }
          pts.push(best.clone());
        }
        this.anchors.set(id, pts);
      } else {
        this.anchors.set(id, [this.regionBox(id).getCenter(new THREE.Vector3())]);
      }
    }
  }

  anchorOf(id) {
    const pts = this.anchors.get(id);
    if (!pts?.length) return null;
    if (pts.length === 1) return pts[0].clone();
    const cam = this.camera.position;
    return pts.reduce((a, b) => (a.distanceTo(cam) <= b.distanceTo(cam) ? a : b)).clone();
  }

  bindEvents() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointermove', (e) => {
      const hit = this.pick(e);
      const id = hit?.object.userData.regionId ?? null;
      if (id !== this.hoverId) {
        this.hoverId = id;
        el.style.cursor = id ? 'pointer' : 'grab';
        this.refreshMaterials();
      }
      this.handlers.hover(id, e);
    });
    el.addEventListener('pointerleave', () => { this.hoverId = null; this.refreshMaterials(); this.handlers.hover(null); });
    el.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const hit = this.pick(e);
      const id = hit?.object.userData.regionId ?? null;
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
    const hasFocus = this.focusIds.size > 0;
    const targets = this.meshes.filter((m) => {
      if ((m.userData.op ?? m.material.opacity) < 0.3) return hasFocus && this.focusIds.has(m.userData.regionId);
      return true;
    });
    const hits = this.raycaster.intersectObjects(targets, false);
    // Ignore the hidden half of sliced meshes
    return hits.find((h) => this.clipMode === 'none' || this.clipPlane.distanceToPoint(h.point) >= 0) || null;
  }

  select(id) { this.selectedId = id; this.refreshMaterials(); }

  /** Highlight a set of regions; everything else fades. Empty array = show everything normally. */
  focus(ids, { fly = true } = {}) {
    this.focusIds = new Set(ids || []);
    this.refreshMaterials();
    if (fly && ids && ids.length) this.flyTo(ids);
  }

  setSeeThrough(on) { this.seeThrough = on; this.refreshMaterials(); }
  setSplit(on) { this.splitTarget = on ? 1 : 0; }
  /** An internal part is picked (selected, or the only highlighted part): the hemispheres slide apart to show it. */
  autoSplit() {
    if (this.pathways?.pathway || this.driven) return false;
    if (isInternal(this.selectedId)) return true;
    return this.focusIds.size === 1 && isInternal([...this.focusIds][0]);
  }
  splitWant() { return this.autoSplit() ? AUTO_SPLIT : this.splitTarget; }
  /** The hemispheres part left/right, so look into the gap: from the front and above, a little to the part's side. */
  viewIntoSplit() {
    const id = isInternal(this.selectedId) ? this.selectedId : [...this.focusIds][0];
    const p = this.anchorOf(id);
    if (!p) return;
    const side = Math.sign(p.x - BRAIN_CENTER.x) || 1;
    const dir = new THREE.Vector3(0.28 * side, 0.75, 1).normalize();
    const target = p.clone().lerp(BRAIN_CENTER, 0.3);
    this.animateCamera(target, target.clone().add(dir.multiplyScalar(2.5)), 1.3);
  }
  setAutoRotate(on) { this.controls.autoRotate = on; }
  setColorMode(mode) { this.colorMode = mode; this.refreshMaterials(); }

  /** Slice the brain: mode = 'none' | 'sagittal' | 'coronal' | 'horizontal'; pos from -1 to 1 across the brain. */
  setClip(mode, pos = 0) {
    this.clipMode = mode;
    const B = this.box();
    const c = B.getCenter(new THREE.Vector3());
    const h = B.getSize(new THREE.Vector3()).multiplyScalar(0.5);
    if (mode === 'sagittal') this.clipPlane.set(new THREE.Vector3(-1, 0, 0), c.x + pos * h.x);
    else if (mode === 'coronal') this.clipPlane.set(new THREE.Vector3(0, 0, -1), c.z + pos * h.z);
    else if (mode === 'horizontal') this.clipPlane.set(new THREE.Vector3(0, -1, 0), c.y + pos * h.y);
    this.applyClip();
  }

  applyClip() {
    this.needsRender = true;
    const planes = this.clipMode === 'none' ? [] : [this.clipPlane];
    for (const m of this.meshes || []) m.material.clippingPlanes = planes;
    for (const m of this.extraMeshes || []) m.material.clippingPlanes = planes;
  }

  /**
   * Show/hide extra anatomy around the brain: 'skull' (cranium + the tentorium, a fold of the dura) or 'arteries'
   * (circle of Willis). Not pickable, so clicks still reach the brain parts. Resolves when shown.
   */
  async setExtra(name, on) {
    this.extraOn = { ...(this.extraOn || {}), [name]: on };
    if (on && !this.extraMeshes) {
      const parts = await loadExtras();
      if (this.disposed || this.extraMeshes) return this.setExtra(name, this.extraOn[name]);
      this.extraMeshes = parts.map(({ part, geometry }) => {
        const look = EXTRA_LOOK[part] || { color: '#cbd5e1', opacity: 1 };
        const mat = new THREE.MeshPhysicalMaterial({ color: look.color, roughness: part === 'arteries' ? 0.35 : 0.7, transparent: look.opacity < 1, opacity: look.opacity, side: THREE.DoubleSide, depthWrite: look.opacity >= 1 });
        const m = new THREE.Mesh(geometry, mat);
        m.userData.extra = part === 'tentorium' ? 'skull' : part;
        m.renderOrder = look.opacity < 1 ? 3 : 1;
        this.group.add(m);
        return m;
      });
      this.applyClip();
    }
    for (const m of this.extraMeshes || []) m.visible = !!this.extraOn[m.userData.extra];
    this.needsRender = true;
  }

  resetView() {
    this.focus([], { fly: false });
    this.select(null);
    this.animateCamera(BRAIN_CENTER.clone(), HOME_CAM.clone());
  }

  flyTo(ids, distance = null) {
    const pts = ids.map((id) => this.anchorOf(id)).filter(Boolean);
    if (!pts.length) return;
    const target = pts.reduce((a, b) => a.add(b), new THREE.Vector3()).divideScalar(pts.length);
    const camDir = this.camera.position.clone().sub(this.controls.target).normalize();
    let dir = target.clone().sub(BRAIN_CENTER);
    dir = dir.length() < 0.15 ? camDir : dir.normalize().multiplyScalar(0.55).add(camDir.multiplyScalar(0.45));
    dir.y = Math.max(dir.y, 0.15);
    dir.normalize();
    const dist = distance || (pts.length > 1 || ids.some((i) => ['cerebellum', 'corpusCallosum', 'ventricles', 'whiteMatter'].includes(i)) ? 2.6 : 2.1);
    this.animateCamera(target.clone().lerp(BRAIN_CENTER, 0.35), target.clone().add(dir.multiplyScalar(dist)));
  }

  /** The home view (target + camera position), stepped back on narrow (portrait) screens so the brain fits. */
  homeView() {
    const fit = this.camera.aspect < 1 ? Math.min(2.8, 1.15 / this.camera.aspect) : 1;
    return { target: BRAIN_CENTER.clone(), position: BRAIN_CENTER.clone().add(HOME_CAM.clone().sub(BRAIN_CENTER).multiplyScalar(fit)) };
  }

  animateCamera(toTarget, toPos, duration = 1.1) {
    if (this.driven) return; // the world is flying the camera (a dive)
    // On narrow (portrait) screens step back so the whole brain fits the width
    const fit = this.camera.aspect < 1 ? Math.min(2.8, 1.15 / this.camera.aspect) : 1;
    if (fit > 1) toPos = toTarget.clone().add(toPos.clone().sub(toTarget).multiplyScalar(fit));
    this.tween = { t: 0, duration, fromTarget: this.controls.target.clone(), toTarget, fromPos: this.camera.position.clone(), toPos };
  }

  // ---- Pathways ----
  playPathway(pathway, { onStage, onEnd, onWait } = {}) {
    this.pathways.onStage = (i, st) => {
      this.focus(st.regions || [], { fly: false });
      onStage?.(i, st);
    };
    this.pathways.onEnd = () => onEnd?.();
    this.pathways.onWait = (i) => onWait?.(i);
    this.pathways.load(pathway);
    const all = this.pathways.allRegions();
    this.seeThroughForPathway = true;
    this.refreshMaterials();
    if (all.length) this.flyTo(all, 2.9);
  }

  stopPathway() {
    this.pathways.clear();
    this.seeThroughForPathway = false;
    this.focus([], { fly: false });
  }

  /** Load the detailed skin and fit its box (centre + per-axis size) onto the parts model's box. */
  async addHQ(target) {
    const src = await loadHQ();
    if (this.disposed) return;
    const hq = src.clone(true);
    hq.rotation.y = Math.PI;
    hq.updateMatrixWorld(true);
    const tb = new THREE.Box3().setFromObject(hq);
    const ts = target.getSize(new THREE.Vector3()), hs = tb.getSize(new THREE.Vector3());
    hq.position.sub(tb.getCenter(new THREE.Vector3()));
    const holder = new THREE.Group();
    holder.add(hq);
    holder.scale.set(ts.x / hs.x, ts.y / hs.y, ts.z / hs.z);
    holder.position.copy(target.getCenter(new THREE.Vector3()));
    // baked fold shading + damp clear coat + warm tissue sheen (approved look)
    const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.32, sheen: 0.6, sheenColor: 0xff9f8f, sheenRoughness: 0.55, specularIntensity: 0.6, transparent: true });
    hq.traverse((o) => { if (o.isMesh) { o.material = mat; this.hqMeshes.push(o); } });
    this.hqMaterial = mat;
    this.hq = holder;
    this.group.add(holder);
    this.group.updateMatrixWorld(true);
    this.skin = this.partMode() ? 0 : 1;
    this.applySkin();
  }

  /** Anything that needs the coloured, named parts (highlight, select, see-through, slice, pathways, extras). */
  partMode() {
    return this.focusIds.size > 0 || !!this.selectedId || this.seeThrough || this.clipMode !== 'none' || this.splitTarget > 0
      || this.colorMode === 'atlas' || !!this.pathways?.pathway || Object.values(this.extraOn || {}).some(Boolean);
  }
  /** Show the resting skin right away (e.g. when a dive starts from the brain). */
  showSkin() { if (this.hq && !this.partMode()) { this.skin = 1; this.applySkin(); } }

  applySkin() {
    if (this.hqMaterial) {
      this.hqMaterial.opacity = this.skin;
      this.hqMaterial.depthWrite = this.skin > 0.98;
      this.hq.visible = this.skin > 0.01;
    }
    this.refreshMaterials();
  }

  refreshMaterials() {
    this.needsRender = true;
    const partsShown = 1 - (this.hq ? this.skin : 0);
    const hasFocus = this.focusIds.size > 0;
    const focusDeep = [...this.focusIds].some((id) => !SHELL_IDS.has(id));
    const pathwayMode = !!this.seeThroughForPathway && !!this.pathways?.pathway;
    const selInternal = isInternal(this.selectedId) && !hasFocus && !pathwayMode;
    for (const m of this.meshes) {
      const id = m.userData.regionId;
      const mat = m.material;
      const isFocus = this.focusIds.has(id);
      const atlas = new THREE.Color(REGION_COLORS[id] || '#cccccc');
      const natural = tissueColor(id);
      const base = this.colorMode === 'atlas' || !natural ? atlas : new THREE.Color(natural);
      const highlighted = isFocus || id === this.selectedId || id === this.hoverId;
      mat.color.copy(highlighted && this.colorMode !== 'atlas' ? base.clone().lerp(atlas, 0.75) : base);

      let opacity = id === 'ventricles' ? 0.6 : 1;
      if (m.userData.shell && (this.seeThrough || focusDeep || pathwayMode) && !isFocus) opacity = id === 'whiteMatter' ? 0.04 : 0.1;
      if (hasFocus && !isFocus && !m.userData.shell) opacity = Math.min(opacity, pathwayMode ? 0.3 : 0.2);
      if (hasFocus && !isFocus && m.userData.shell && !focusDeep && !pathwayMode) opacity = 0.5;
      if (id === 'whiteMatter' && this.clipMode === 'none' && !this.seeThrough && !hasFocus) opacity = 1;
      // an internal part picked by a click: the hemispheres move aside; the deep parts around it fade so it shows
      if (selInternal && !m.userData.shell && id !== this.selectedId && isInternal(id)) opacity = Math.min(opacity, 0.1);
      m.userData.op = opacity; // opacity in the parts model (picking uses this even while the skin is shown)
      mat.opacity = opacity * partsShown;
      m.visible = partsShown > 0.01;
      mat.depthWrite = mat.opacity > 0.9;
      const glow = id === this.selectedId || isFocus ? 0.35 : id === this.hoverId ? 0.22 : 0;
      mat.emissive.copy(atlas).multiplyScalar(glow);
      m.renderOrder = opacity < 1 ? 2 : 1;
    }
  }

  resize() {
    this.needsRender = true;
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    // re-sizing the canvas clears and re-allocates it: only when the size really changed (no hitch at a dive start)
    if (this.sizeKey !== w + "x" + h) { this.sizeKey = w + "x" + h; this.renderer.setSize(w, h); }
    this.camera.aspect = w / h;
    this.camera.fov = 40;
    this.camera.updateProjectionMatrix();
    if (!this.fitted && w > 1) {
      this.fitted = true;
      if (this.camera.aspect < 1) this.animateCamera(this.controls.target.clone(), this.camera.position.clone(), 0.01);
    }
  }

  setActive(on) {
    this.active = on;
    if (on) this.resize();
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.pathways.clear();
    // materials are this viewer's own; the loaded geometries are shared by every viewer on the page (cached loads),
    // so only geometry made here (markers) is freed
    for (const m of this.meshes) { m.material.dispose(); if (!m.userData.sharedGeometry) m.geometry.dispose(); }
    for (const m of this.extraMeshes || []) m.material.dispose();
    this.hqMaterial?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss(); // give the WebGL context back now, not whenever the GC gets to it
    this.renderer.domElement.remove();
  }

  frame() {
    if (!this.active) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.tween && !this.driven) {
      const tw = this.tween;
      tw.t += dt / tw.duration;
      const k = tw.t >= 1 ? 1 : 1 - Math.pow(1 - tw.t, 3);
      this.controls.target.lerpVectors(tw.fromTarget, tw.toTarget, k);
      this.camera.position.lerpVectors(tw.fromPos, tw.toPos, k);
      if (tw.t >= 1) this.tween = null;
    }

    const splitWant = this.splitWant();
    const auto = splitWant === AUTO_SPLIT;
    if (auto && !this.autoSplitOn) this.viewIntoSplit();
    this.autoSplitOn = auto;
    if (Math.abs(this.split - splitWant) > 0.001) {
      const k = Math.min(1, dt * 4);
      this.split = Math.abs(splitWant - this.split) < 0.002 ? splitWant : this.split + (splitWant - this.split) * k;
      this.needsRender = true;
      for (const m of this.meshes) {
        if (m.userData.shell && m.userData.side) m.position.x = m.userData.basePos.x + m.userData.side * SPLIT_GAP * this.split;
      }
    }

    if (this.focusIds.size) {
      const pulse = 0.25 + 0.15 * Math.sin(performance.now() / 300);
      for (const id of this.focusIds) {
        for (const m of this.byRegion.get(id) || []) m.material.emissive.set(REGION_COLORS[id] || '#ffffff').multiplyScalar(pulse);
      }
    }

    if (this.hq) {
      const want = this.partMode() ? 0 : 1;
      if (Math.abs(this.skin - want) > 0.001) {
        this.skin += Math.sign(want - this.skin) * Math.min(Math.abs(want - this.skin), dt * 2.5);
        this.applySkin();
      }
    }
    this.pathways.update(dt);
    if (!this.driven) this.controls.update();
    const moving = this.needsRender || this.driven || this.tween || this.focusIds.size || this.pathways.pathway || Math.abs(this.split - splitWant) > 0.001;
    if (!moving) return;
    this.needsRender = false;
    this.renderer.render(this.scene, this.camera);
  }
}
