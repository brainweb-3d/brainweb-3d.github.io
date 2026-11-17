// The real body (BodyParts3D) for the organ-system and organism levels: translucent skin, skeleton, organs,
// and the anatomical brain model (with its named regions) placed inside the skull.
// Units: decimetres, feet at y = 0, +z = front, +x = the body's LEFT side.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { mat, tube } from './build.js';
import { loadBody, makeRealBody, spinePath } from './data.js';

const BASE = import.meta.env?.BASE_URL || '/';
let brainPromise = null;
/** The anatomical brain (public/models/brain.glb): Map "region|side" → geometry. */
function loadBrainGeometries() {
  if (!brainPromise) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    brainPromise = new Promise((res, rej) => loader.load(BASE + 'models/brain.glb', res, undefined, rej)).then((gltf) => {
      const map = new Map();
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        const g = o.geometry.clone();
        const pos = g.attributes.position;
        if (pos.normalized || !(pos.array instanceof Float32Array)) {
          const arr = new Float32Array(pos.count * 3);
          for (let i = 0; i < pos.count; i++) { arr[i * 3] = pos.getX(i); arr[i * 3 + 1] = pos.getY(i); arr[i * 3 + 2] = pos.getZ(i); }
          g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        }
        g.applyMatrix4(o.matrixWorld);
        // brain.glb uses +x = the patient's RIGHT; the body uses +x = LEFT → mirror x and fix the triangle winding
        g.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
        if (g.index) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } g.index.needsUpdate = true; }
        g.computeVertexNormals();
        map.set(o.name, g);
      });
      return map;
    });
  }
  return brainPromise;
}

const REGION_COLOR = {
  hypothalamus: '#f97316', pituitary: '#a855f7', pineal: '#14b8a6', hippocampus: '#22c55e', amygdala: '#ef4444', basalGanglia: '#3b82f6',
  cerebellum: '#e59bb0', motor: '#f59e0b', frontal: '#8b5cf6', thalamus: '#06b6d4', medulla: '#e59bb0', pons: '#e59bb0', midbrain: '#e59bb0',
};

/**
 * Build the real body in the stage. opts:
 *   skin (opacity, 0 = none), skeleton (opacity, 0 = none), organs: list of body parts (heart, lungs, liver, stomach, gut,
 *   kidney, adrenal, bladder, spleen, pancreas, esophagus, diaphragm, eye),
 *   brain: 'whole' (one part) | 'regions' (list of region ids shown solid inside a see-through brain) | false,
 *   brainOpacity.
 * Returns { body, group, organ(name), brain, region(id), cord, vertebra(label), pt, landmarks }.
 */
export async function setupRealBody(stage, { skin = 0.16, skeleton = 0.35, organs = [], brain = 'whole', regions = [], brainOpacity = 1 } = {}) {
  const [{ parts, landmarks }, brainGeo] = await Promise.all([loadBody(), brain ? loadBrainGeometries() : Promise.resolve(null)]);
  const body = await makeRealBody({ skin, skeleton, organs: organs.filter((o) => o !== 'eye').concat(organs.includes('eye') ? ['eye'] : []) });
  stage.root.add(body.group);
  const group = body.group;

  /** Organ meshes (both sides) wrapped in a pivot group at their centre, so they can be scaled (heart beat, breathing). */
  const organCache = {};
  const organ = (name) => {
    if (organCache[name]) return organCache[name];
    const meshes = Object.entries(body.meshes).filter(([k]) => k.startsWith(name + '|')).map(([, m]) => m);
    if (!meshes.length) return null;
    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    const center = box.getCenter(new THREE.Vector3());
    const pivot = new THREE.Group();
    pivot.position.copy(center);
    group.add(pivot);
    meshes.forEach((m) => pivot.attach(m));
    organCache[name] = { pivot, meshes, center, box };
    return organCache[name];
  };

  // ---- brain inside the skull ----
  let brainGroup = null;
  const regionMeshes = {};
  if (brainGeo) {
    const skullGeo = parts.get('skull|mid')?.geometry;
    skullGeo.computeBoundingBox();
    const sb = skullGeo.boundingBox;
    const bb = new THREE.Box3();
    brainGeo.forEach((g) => { g.computeBoundingBox(); bb.union(g.boundingBox); });
    // brain length ≈ 82 % of the skull's front–back length; centred a little above and behind the skull's centre
    const scale = ((sb.max.z - sb.min.z) * 0.8) / (bb.max.z - bb.min.z);
    const sc = sb.getCenter(new THREE.Vector3());
    brainGroup = new THREE.Group();
    brainGroup.scale.setScalar(scale);
    const bc = bb.getCenter(new THREE.Vector3());
    brainGroup.position.set(sc.x - bc.x * scale, sb.max.y - (sb.max.y - sb.min.y) * 0.36 - bc.y * scale, sc.z - (sb.max.z - sb.min.z) * 0.06 - bc.z * scale);
    group.add(brainGroup);
    const shown = new Set(regions);
    const whole = [];
    brainGeo.forEach((g, name) => {
      const region = name.split('|')[0];
      if (shown.has(region)) {
        const m = new THREE.Mesh(g, mat(REGION_COLOR[region] || '#f2b8c6', { rough: 0.45 }));
        brainGroup.add(m);
        (regionMeshes[region] ||= []).push(m);
      } else {
        whole.push(g);
      }
    });
    if (brain === 'whole' || brain === 'regions') {
      const op = brain === 'regions' ? Math.min(brainOpacity, 0.22) : brainOpacity;
      for (const g of whole) {
        const m = new THREE.Mesh(g, mat('#f2b8c6', { rough: 0.55, opacity: op }));
        if (op < 1) { m.material.depthWrite = false; m.renderOrder = 4; }
        brainGroup.add(m);
        (regionMeshes._rest ||= []).push(m);
      }
    }
  }
  const region = (id) => {
    const list = regionMeshes[id];
    if (!list) return null;
    const box = new THREE.Box3();
    list.forEach((m) => box.expandByObject(m));
    return { meshes: list, center: box.getCenter(new THREE.Vector3()), box };
  };

  // ---- spinal cord along the real vertebral canal (it ends at about L1–L2) ----
  const verts = spinePath(landmarks);
  const labels = landmarks.vertebrae.map((v) => v.label);
  const vertebra = (label) => { const i = labels.indexOf(label); return i >= 0 ? verts[i].clone() : null; };
  const top = brainGroup ? (region('medulla')?.center || vertebra('C1').add(new THREE.Vector3(0, 0.6, 0))) : vertebra('C1').add(new THREE.Vector3(0, 0.6, 0));
  const cordEnd = labels.indexOf('L2');
  const cord = [top, ...verts.slice(0, Math.max(2, cordEnd))];
  return { body, group, organ, brain: brainGroup, regionMeshes, region, cord, verts, labels, vertebra, pt: body.pt, landmarks, limbs: body.limbs };
}

/** A nerve along points. */
export const nerveTube = (points, r = 0.04, color = '#facc15') => tube(points, r, color, undefined, Math.max(24, points.length * 14));
