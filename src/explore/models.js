// Sourced 3D models shown at some places, with a "Real model / Interactive" switch in the ⓘ sheet.
//   Real model  = the sourced model, scaled and centred on the scene's home framing; the scene's own meshes are
//                 hidden but stay pickable (and hotspots keep their anchors, which land on the model's surface).
//   Interactive = the scene as built by its level file (needed by its buttons, effects and story steps).
// Files live in public/models/ (credits: docs/data-credits.md); phones get the "-lite" version.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/** place → sourced model file. "Real model" is the default wherever one exists; the switch goes back to the scene.
 *  (Molecules from PubChem and proteins from the PDB are real data already, so those scenes keep their own.) */
export const MODELS = {
  // neurons and cells
  // opens on the interactive layers (the dots are on real layers there); the model is one tap away
  'tissue/cortex': { file: 'neuronal-environment', real: false },
  // opens on the interactive neuron, whose soma, axon and terminals the dots sit on (the real CA1 cell has no
  // axon terminals, so the synapse dot floated beside it: owner, 2026-11-15); in model view its dots are hidden
  'cell/neuron': { file: 'ca1-pyramidal', real: false, dotAt: { soma: 'hide', axon: 'hide', terminals: 'hide' } },
  // real reconstructions, animated; opens showing the whole grid of cells (owner's picture, 2026-11-15)
  'cell/real': { file: 'neuron-firing', fitScale: 1.0, rot: [0, -0.75, 0] },
  // opens on the four drawn types (a lone Purkinje cell did not show "types"); the real cell is one tap away
  'cell/types': { file: 'purkinje-cell', real: false, dotAt: { pyramidal: [0.48, 0.55] } }, // dots: [x, y] of the model's on-screen box
  // the cell's pieces are linked to the scene's parts (by material name), so hovering names and highlights each
  // organelle on the model itself; its big blue DNA helix is hidden here: DNA belongs one level in, inside the nucleus
  'organelle/soma': { file: 'human-cell', real: false, rot: [Math.PI * 0.42, 0, 0], hide: ['Material.029'], noDot: ['Material.021'], parts: {
    'Material.021': 'membrane', 'Material.022': 'membrane', 'Material.001': 'cytoplasm',
    'Material.008': 'nucleus', 'Material.010': 'nucleus', 'Material.009': 'nucleolus',
    'Material.003': 'er', 'Material.028': 'ribosomes', 'Material.004': 'golgi',
    'Material.002': 'mito', 'Material.005': 'mito', 'Material': 'lysosome', 'Material.019': 'vesicle',
    'Material.006': 'centrosome',
  } },
  'organelle/vesicles': { file: 'membrane-vesicle', real: false }, // redrawn (cells.js): opens on the interactive view
  // membrane and molecules
  // redrawn textbook-style (src/visual/proteins.js), so these open on the interactive view; the model is one tap
  // away (owner, 2026-11-15)
  'atom/membrane': { file: 'plasma-membrane', real: false },
  'atom/nmda': { file: 'dendrite-spines', real: false },
  'macromolecule/receptors': { file: 'serotonin-receptor', real: false, rot: [-Math.PI / 2, 0, 0], dotAt: { iono: [0.5, 0.3], gpcr: [0.5, 0.62] } }, // membrane level, outside up
  'macromolecule/channels': { file: 'ion-channel', real: false, rot: [-Math.PI / 2, 0, 0] }, // pore upright, as it sits in the membrane
  'macromolecule/pump': { file: 'na-k-atpase', real: false },
  'macromolecule/transporter': { file: 'serotonin-transporter', real: false }, // redrawn (proteins.js transporter)
  'macromolecule/dna': { file: 'b-dna', real: false, dotAt: { dna: [0.5, 0.2], mrna: [0.5, 0.5], nucleosomes: [0.5, 0.8] } }, // three dots along the real helix
  // the model's pieces are linked to the parts; the scene animates it (heads cycle, actin slides): built.onModel
  // tissue and body
  'tissue/nerve': { file: 'nerve-cross-section', real: false, dotAt: { myelinated: [0.675, 0.23] } },
  'tissue/retina': { file: 'eye-anatomy', real: false, dotAt: { rods: [0.39, 0.53] } },
  'tissue/corti': { file: 'inner-ear', real: false, dotAt: { inner: [0.5, 0.5] } },
  'tissue/nmj': { file: 'neuromuscular-junction', real: false, dotAt: { fiber: [0.84, 0.74] } },
  'tissue/bbb': { file: 'blood-vessels', real: false },
  // fitted to the scene's real skeleton (height and feet), so dots placed on body parts (eyes, ear, fingertip) land
  // on the same spot of the model
  // the model has no face: the scene's sense-organ markers stay on show over it, each with its dot
  // its own brain is too big for the skull: it is cut out and the scene's anatomical brain shows instead
  'system/nervous': { file: 'nervous-system', fit: 'body', overlay: ['eye', 'ear', 'nose', 'tongue', 'skin', 'skull', 'brain'], cutAround: { part: 'brain', pad: [0.6, 0.02, 0.8, 0.35, 1.0] }, toHandTip: { part: 'skin', side: 1 }, dotAt: { intercostal: [0.66, 0.34] } }, // the nerve dot sits on the left ribs of the model (no blue overlay string: owner, 2026-11-15)
  'organism/memory': { file: 'limbic-system' },       // animated
  // research methods
  'methods/histology': { file: 'microscope' },
  'methods/mri': { file: 'mri-machine' },
  'methods/fmri': { file: 'mri-machine' },
  'methods/dti': { file: 'mri-machine' },
  'methods/knockout': { file: 'lab-mouse' },
  'methods/stemcells': { file: 'petri-dishes' },
  // added 2026-11-16 (owner: every place gets both kinds); these places keep opening on their drawn scenes, whose
  // buttons and readouts need them, and the downloaded model is one tap away (credits: docs/data-credits.md)
  'atom/ions': { file: 'salt-water', real: false },            // Na⁺ and Cl⁻ leaving a salt crystal into water, animated
  'macromolecule/rna': { file: 'trna', real: false },          // a transfer RNA's real structure
  'tissue/smell': { file: 'olfactory-bulb', real: false },     // real mitral, tufted and granule cells of the bulb
  'system/ans': { file: 'heart', real: false, fitScale: 0.85 },              // the organ the two systems speed up and slow down
  'system/hpa': { file: 'endocrine-system', real: false },     // the glands in a see-through body
  'organism/day': { file: 'bed', real: false, rot: [0, Math.PI + 0.6, 0] },
  'organism/homeostasis': { file: 'limbic-ap', real: false },  // the hypothalamus among the limbic structures
  'organism/stove': { file: 'stove', real: false, fitScale: 0.72, rot: [0, -0.45, 0] },
  'methods/microdialysis': { file: 'lab-rat', real: false },   // microdialysis is done in awake rats
  'methods/ct': { file: 'ct-scanner', real: false, fitScale: 0.72, rot: [0, 0.35, 0] },
  'methods/pet': { file: 'ct-scanner', real: false, fitScale: 0.72, rot: [0, 0.35, 0] },        // PET scanners look the same (and are often built with a CT)
  'methods/lesion': { file: 'human-skull', real: false, fitScale: 0.78, rot: [0, 0.5, 0] },      // Gage's injury, Broca's autopsies: the skull and the brain inside
  'tissue/taste': { file: 'mouth', real: false, fitScale: 0.8 },            // the tongue, where the taste buds sit
  'tissue/spinalcord': { file: 'spinal-cord-model', real: false, fitScale: 1.15, rot: [0.45, -0.35, 0] }, // a teaching model of a cord segment, cut across
  // models already in the project that show the same thing for real
  'molecule/nucleotides': { file: 'b-dna', real: false },      // the real double helix these nucleotides build
  'molecule/binding': { file: 'serotonin-receptor', real: false, rot: [-Math.PI / 2, 0, 0] }, // the outside (binding) domain up, like the drawing // a real receptor protein, the "lock"
  'cell/synapse': { file: 'dendrite-spines', real: false, dotAt: { vesicles: 'hide', receptors: 'hide', transporter: 'hide' } },    // spines traced from electron microscopy: real synapses' receiving side
};

const LITE = window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768 || (navigator.deviceMemory || 8) <= 4;
// (MeshoptDecoder decodes in web workers: set up once in src/brain/BrainScene.js)
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder); // one shared loader
const cache = new Map();
// dev: ?nomodels (all) or ?nomodels=tissue/cortex,cell/neuron to compare without them
const NO_MODELS_Q = import.meta.env.DEV ? new URLSearchParams(location.search).get('nomodels') : null;
const noModel = (key) => NO_MODELS_Q != null && (NO_MODELS_Q === '' || NO_MODELS_Q.split(',').includes(key));
const urlOf = (file) => `${import.meta.env.BASE_URL}models/${file}${LITE ? '-lite' : ''}.glb`;

/** Start downloading a place's model (cached). Called while the place is prepared, i.e. before any dive into it. */
export function preloadModel(key) {
  const m = MODELS[key];
  if (!m) return null;
  if (!cache.has(m.file)) cache.set(m.file, loader.loadAsync(urlOf(m.file)).then(optimise).catch((e) => { console.warn('Model not available:', m.file, e); cache.delete(m.file); return null; }));
  return cache.get(m.file);
}

/**
 * Merge meshes (one material) into one plain-float geometry in world space. Typed arrays only, sized up front:
 * no big temporary JS arrays (they caused long garbage-collection pauses that could land in a later dive).
 */
function mergeMeshes(meshes, keep) {
  let verts = 0, idx = 0;
  for (const m of meshes) { const g = m.geometry; verts += g.attributes.position.count; idx += g.index ? g.index.count : g.attributes.position.count; }
  const out = new THREE.BufferGeometry();
  const arrays = keep.map((name) => new Float32Array(verts * meshes[0].geometry.attributes[name].itemSize));
  const index = verts > 65535 ? new Uint32Array(idx) : new Uint16Array(idx);
  const v = new THREE.Vector3(), nm = new THREE.Matrix3();
  let vo = 0, io = 0;
  for (const m of meshes) {
    const g = m.geometry, count = g.attributes.position.count;
    nm.getNormalMatrix(m.matrixWorld);
    keep.forEach((name, k) => {
      const a = g.attributes[name], n = a.itemSize, arr = arrays[k];
      for (let i = 0; i < count; i++) {
        if (name === 'position' || name === 'normal') {
          v.set(a.getX(i), a.getY(i), a.getZ(i));
          if (name === 'position') v.applyMatrix4(m.matrixWorld); else v.applyMatrix3(nm).normalize();
          arr[(vo + i) * 3] = v.x; arr[(vo + i) * 3 + 1] = v.y; arr[(vo + i) * 3 + 2] = v.z;
        } else for (let c = 0; c < n; c++) arr[(vo + i) * n + c] = a.getComponent(i, c);
      }
    });
    if (g.index) for (let i = 0; i < g.index.count; i++) index[io + i] = g.index.getX(i) + vo;
    else for (let i = 0; i < count; i++) index[io + i] = vo + i;
    io += g.index ? g.index.count : count;
    vo += count;
  }
  keep.forEach((name, k) => out.setAttribute(name, new THREE.BufferAttribute(arrays[k], meshes[0].geometry.attributes[name].itemSize)));
  out.setIndex(new THREE.BufferAttribute(index, 1));
  out.computeBoundingSphere();
  return out;
}

/**
 * Static models with many parts are merged into one mesh per material: thousands of draw calls (2,000+ nodes in
 * the neuronal environment) cost far more than the triangles, and made dives stutter. Animated models stay as is.
 */
function optimise(gltf) {
  let meshCount = 0;
  gltf.scene.traverse((o) => { if (o.isMesh) meshCount++; });
  const animated = gltf.animations?.some((a) => a.duration > 0 && a.tracks.length) && meshCount <= 64;
  if (animated || meshCount <= 8) return gltf;
  gltf.scene.updateMatrixWorld(true);
  const groups = new Map();
  gltf.scene.traverse((o) => { if (o.isMesh) { if (!groups.has(o.material)) groups.set(o.material, []); groups.get(o.material).push(o); } });
  const root = new THREE.Group();
  for (const [mat, meshes] of groups) {
    const keep = ['position', 'normal', 'uv', 'color'].filter((n) => meshes.every((m) => m.geometry.attributes[n]?.itemSize === meshes[0].geometry.attributes[n]?.itemSize && m.geometry.attributes[n]));
    root.add(new THREE.Mesh(mergeMeshes(meshes, keep), mat));
  }
  return { scene: root, animations: [] };
}

/**
 * Put the model into a freshly built Stage view (call after view.build). Resolves when it is in place.
 * The model is added to stage.scene (outside stage.root), so the scene's clear() does not touch the shared files;
 * detach() removes it when the place is rebuilt.
 */
export async function attachModel(view) {
  const key = view.key;
  const spec = noModel(key) ? null : MODELS[key];
  detachModel(view);
  if (!spec) return;
  const gltf = await preloadModel(key);
  if (!gltf || view.key !== key) return;
  const st = view.stage;
  const obj = gltf.scene.clone(true);
  if (spec.rot) { obj.rotation.set(...spec.rot); obj.updateMatrixWorld(true); } // e.g. turn a cut-open cell's open face to the camera
  // scale and centre onto the scene's home framing
  const box = new THREE.Box3().setFromObject(obj);
  // fit the outline seen from the front (width/height), not the bounding sphere, so thin models are not tiny
  const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  const r = Math.max(half.x, half.y, half.z * 0.5) || 1;
  const h = view.homeView();
  const want = view.visibleRadius() * 0.95;
  obj.position.sub(box.getCenter(new THREE.Vector3()));
  const holder = new THREE.Group();
  holder.name = 'sourced-model';
  holder.add(obj);
  holder.scale.setScalar((want / r) * (spec.fitScale ?? 1)); // fitScale: for a model whose box is not what it draws (e.g. animated)
  holder.position.copy(h.target);
  const meshes = [];
  obj.traverse((o) => {
    if (!o.isMesh) return;
    if (spec.hide?.includes(o.material?.name)) { o.visible = false; return; } // not shown, not hit by rays
    meshes.push(o);
    o.frustumCulled = true;
  });
  st.scene.add(holder);
  st.scene.updateMatrixWorld(true);
  const model = { holder, meshes, mixer: null, spec, tagged: false };
  // pieces linked to the scene's parts: hover / tap name and highlight them on the model itself
  if (spec.parts) {
    for (const m of meshes) {
      const id = spec.parts[m.material?.name];
      if (!id || !st.parts.has(id)) continue;
      m.material = m.material.clone(); // highlighting must not change the cached file's shared material
      m.userData.onModel = true;
      if (spec.noDot?.includes(m.material.name)) m.userData.noDot = true; // e.g. the cell's outer wall, behind everything
      st.tag(m, id);
      model.tagged = true;
    }
  }
  if (gltf.animations?.length) {
    model.mixer = new THREE.AnimationMixer(obj);
    gltf.animations.forEach((clip) => model.mixer.clipAction(clip).play());
  }
  view.model = model;
  if (spec.fit === 'body') await fitToBody(view, holder);
  // the scene can drive its sourced model (pieces it splits off, animations): built.onModel(model) → { tick(dt) }
  if (view.built?.onModel) { try { model.logic = view.built.onModel(model) || null; } catch (e) { console.warn('Model logic failed:', e); } }
  if (view.model !== model) return; // the place changed while the body loaded
  setMode(view, view.modeWanted ?? (spec.real === false ? 'interactive' : 'real'));
}

/** Match a whole-body model to the scene's own body (BodyParts3D skeleton): same height, feet on the same floor,
 *  centred on it. Waits for the scene's body to load. */
async function fitToBody(view, holder) {
  try { await view.ready; } catch { return; }
  const st = view.stage;
  const body = new THREE.Box3();
  st.root.updateMatrixWorld(true);
  st.meshes.filter((m) => !m.userData.onModel).forEach((m) => body.expandByObject(m));
  if (body.isEmpty()) return;
  holder.updateMatrixWorld(true);
  const mb = new THREE.Box3().setFromObject(holder);
  const k = (body.max.y - body.min.y) / Math.max(1e-6, mb.max.y - mb.min.y);
  holder.scale.multiplyScalar(k);
  holder.updateMatrixWorld(true);
  const nb = new THREE.Box3().setFromObject(holder);
  const bc = body.getCenter(new THREE.Vector3()), nc = nb.getCenter(new THREE.Vector3());
  holder.position.add(new THREE.Vector3(bc.x - nc.x, body.min.y - nb.min.y, bc.z - nc.z));
  holder.updateMatrixWorld(true);
  if (view.model?.spec.cutAround) cutAround(view, view.model.spec.cutAround);
  if (view.model?.spec.toHandTip) moveToHandTip(view, view.model.spec.toHandTip);
  view.version++; // dots re-anchor on the moved model
  st.needsRender = true;
}

/**
 * Cut the model's triangles out of the space a scene part fills (e.g. the nervous-system model's oversized brain,
 * which pokes out of the skull): the scene's own part, listed in `overlay`, shows there instead. `pad` grows the box:
 * [x, below, above, back, front].
 */
function cutAround(view, { part, pad = [0.25, 0.02, 0.6, 0.3, 0.5] }) {
  const st = view.stage, box = new THREE.Box3();
  st.meshes.filter((m) => m.userData.partId === part).forEach((m) => box.expandByObject(m));
  if (box.isEmpty()) return;
  box.min.x -= pad[0]; box.max.x += pad[0]; box.min.y -= pad[1]; box.max.y += pad[2]; box.min.z -= pad[3]; box.max.z += pad[4];
  const c = new THREE.Vector3(), p = new THREE.Vector3();
  for (const m of view.model.meshes) {
    const g = m.geometry.clone(); // the file's geometry is cached and shared: cut a copy
    const pos = g.attributes.position, idx = g.index ? g.index.array : Array.from({ length: pos.count }, (_, i) => i);
    const keep = [];
    for (let i = 0; i < idx.length; i += 3) {
      c.set(0, 0, 0);
      for (let k = 0; k < 3; k++) c.add(p.fromBufferAttribute(pos, idx[i + k]));
      if (!box.containsPoint(c.divideScalar(3).applyMatrix4(m.matrixWorld))) keep.push(idx[i], idx[i + 1], idx[i + 2]);
    }
    g.setIndex(keep);
    m.geometry = g;
  }
}

/**
 * The model's arms may hang wider than the scene's skeleton: move a scene part (e.g. the fingertip marker) onto the
 * model's own fingertip on that side (+x = the body's left): the lowest point of the most lateral strip of the model.
 */
function moveToHandTip(view, { part, side = 1 }) {
  const st = view.stage, p = new THREE.Vector3();
  const box = new THREE.Box3(); view.model.meshes.forEach((m) => box.expandByObject(m));
  const edge = side > 0 ? box.max.x : box.min.x, half = (box.max.x - box.min.x) / 2;
  let tip = null;
  for (const m of view.model.meshes) {
    const pos = m.geometry.attributes.position, step = Math.max(1, Math.floor(pos.count / 60000));
    for (let i = 0; i < pos.count; i += step) {
      p.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      if (Math.abs(edge - p.x) < half * 0.22 && (!tip || p.y < tip.y)) tip = p.clone();
    }
  }
  if (!tip) return;
  const roots = st.roots.get(part) || [];
  const pb = new THREE.Box3(); roots.forEach((r) => pb.expandByObject(r));
  if (pb.isEmpty()) return;
  const d = tip.clone().add(new THREE.Vector3(0, 0.06, 0)).sub(pb.getCenter(new THREE.Vector3()));
  roots.forEach((r) => r.position.add(r.parent.worldToLocal(r.getWorldPosition(new THREE.Vector3()).add(d)).sub(r.position)));
  st.root.updateMatrixWorld(true);
}

/** A material and every texture it uses. */
function disposeMaterial(m) {
  if (!m) return;
  for (const k in m) if (m[k]?.isTexture) m[k].dispose();
  m.dispose();
}

/** Free the models of places that are not `keep` (current, parent, next steps): geometry + materials, all contexts. */
export function pruneModels(keep) {
  const files = new Set(keep.map((k) => MODELS[k]?.file).filter(Boolean));
  for (const [file, p] of cache) {
    if (files.has(file)) continue;
    cache.delete(file);
    p.then((g) => g?.scene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); [].concat(o.material).forEach(disposeMaterial); } }));
  }
}

export function detachModel(view) {
  const m = view.model;
  if (!m) return;
  m.mixer?.stopAllAction();
  m.holder.removeFromParent();
  if (m.tagged) {
    view.stage.meshes = view.stage.meshes.filter((x) => !x.userData.onModel);
    m.meshes.forEach((x) => { if (x.userData.onModel) x.material.dispose(); });
  }
  view.model = null;
  setMode(view, 'interactive');
}

/** 'real' | 'interactive' */
export function setMode(view, mode) {
  const st = view.stage;
  const real = mode === 'real' && !!view.model;
  view.realMode = real;
  st.realShown = real;
  st.htmlEls?.forEach((el) => { el.style.visibility = real ? 'hidden' : ''; }); // a scene's HTML over the canvas (e.g. the cortex ruler) belongs to the drawn view
  st.root.visible = !real;
  // `overlay`: scene parts that stay on show over the model (sense-organ markers the model lacks), dots on them
  const overlay = new Set(MODELS[view.key]?.overlay || []);
  if (overlay.size) {
    st.root.visible = true;
    st.root.traverse((o) => {
      if (o === st.root || !(o.isMesh || o.isPoints || o.isSprite || o.isLine)) return;
      if (o.userData.preReal === undefined) o.userData.preReal = o.visible;
      const kept = overlay.has(o.userData.partId);
      if (kept) o.userData.onModel = true;
      o.visible = real ? kept && o.userData.preReal : o.userData.preReal;
      if (!real) delete o.userData.preReal;
    });
  }
  // taps find the scene's parts under the model, unless the model's own pieces are linked to the parts
  st.pickHidden = real && !view.model?.tagged;
  if (view.model) view.model.holder.visible = real;
  st.needsRender = true;
  view.version++; // hotspot anchors move to the visible surface
}

/** Per frame (from the world loop): play the model's glTF animation only while the place is shown and at rest. */
export function tickModel(view, dt, paused) {
  const m = view.model;
  if (!m || !view.realMode || paused) return;
  if (m.mixer) m.mixer.update(dt);
  if (m.logic?.tick) m.logic.tick(dt); // the scene animates its own sourced model (built.onModel)
  if (m.mixer || m.logic?.tick) view.stage.needsRender = true;
}
