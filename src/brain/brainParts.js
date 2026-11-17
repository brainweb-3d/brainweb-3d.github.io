// Builds every 3D brain part out of simple shapes.
// Coordinates: x = left(-)/right(+), y = down(-)/up(+), z = back(-)/front(+).
// Each part becomes one or more meshes tagged with userData.regionId so clicks know what was hit.

import * as THREE from 'three';

export const REGION_COLORS = {
  frontal: '#5b8def',
  motor: '#2f55c9',
  somatosensory: '#e98f2e',
  parietal: '#f2c14e',
  temporal: '#3cb37a',
  occipital: '#e0607e',
  broca: '#8b5cf6',
  wernicke: '#14b8a6',
  cerebellum: '#c084fc',
  midbrain: '#f59e0b',
  pons: '#fb923c',
  medulla: '#f97316',
  spinalCord: '#fdba74',
  thalamus: '#60a5fa',
  hypothalamus: '#f472b6',
  pituitary: '#db2777',
  amygdala: '#ef4444',
  hippocampus: '#facc15',
  basalGanglia: '#22d3ee',
  nucleusAccumbens: '#10b981',
  corpusCallosum: '#d9dce6',
  ventricles: '#38bdf8',
  cingulate: '#a3e635',
  superiorColliculus: '#fde047',
  inferiorColliculus: '#fbbf24',
  substantiaNigra: '#3f3f46',
  vta: '#84cc16',
  pag: '#94a3b8',
  reticular: '#fb7185',
  olfactoryBulb: '#a78bfa',
  opticChiasm: '#fef08a',
  scn: '#f0abfc',
  insula: '#0ea5e9',
  pineal: '#e879f9',
  fornix: '#fca5a5',
  whiteMatter: '#e7e2d6',
  raphe: '#38bdf8',
  locusCoeruleus: '#2563eb',
  basalForebrain: '#a855f7',
};

// Parts that belong to the outer cerebral cortex (made see-through by the "see-through" toggle)
export const CORTEX_IDS = new Set(['frontal', 'motor', 'somatosensory', 'parietal', 'temporal', 'occipital', 'broca', 'wernicke']);

function material(id) {
  return new THREE.MeshStandardMaterial({
    color: REGION_COLORS[id],
    roughness: 0.55,
    metalness: 0.05,
    transparent: true,
    opacity: 1,
  });
}

function tag(mesh, id, side = 0) {
  mesh.userData.regionId = id;
  mesh.userData.side = side;
  mesh.userData.cortex = CORTEX_IDS.has(id);
  mesh.userData.basePos = mesh.position.clone();
  return mesh;
}

function ellipsoid(id, [x, y, z], [rx, ry, rz], side = 0, seg = 32) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)), material(id));
  m.scale.set(rx, ry, rz);
  m.position.set(x, y, z);
  return tag(m, id, side);
}

function tube(id, points, radius, side = 0, scale = null) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const geo = new THREE.TubeGeometry(curve, 64, radius, 16, false);
  const m = new THREE.Mesh(geo, material(id));
  if (scale) m.scale.set(...scale);
  return tag(m, id, side);
}

function cylinder(id, [x, y, z], rTop, rBottom, h, side = 0, rotX = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, 32), material(id));
  m.position.set(x, y, z);
  m.rotation.x = rotX;
  return tag(m, id, side);
}

/** Decide which cortical area a point of the (unit-sphere) hemisphere belongs to. */
function classify(nx, ny, nz, side) {
  const left = side < 0;
  if (nz < -0.62) return 'occipital';
  if (ny < -0.12 && nz > -0.58 && nz < 0.55 && nx > -0.15) {
    if (left && nz < -0.12 && nz > -0.48 && ny > -0.42 && nx > 0.55) return 'wernicke';
    return 'temporal';
  }
  // The central sulcus slants: further back at the top of the brain
  const q = nz + 0.2 * ny - 0.1;
  if (q > 0.11) {
    if (left && nz > 0.25 && nz < 0.5 && ny > -0.12 && ny < 0.22 && nx > 0.6) return 'broca';
    return 'frontal';
  }
  if (q > 0) return 'motor';
  if (q > -0.11) return 'somatosensory';
  return 'parietal';
}

/** One cerebral hemisphere, split into lobes/areas. side: -1 = left, +1 = right. */
function buildHemisphere(side) {
  const sphere = new THREE.SphereGeometry(1, 160, 120);
  const pos = sphere.attributes.position;
  const unit = new Float32Array(pos.array); // original unit-sphere coordinates, used for classification
  const cx = side * 0.18;
  const cy = 0.2;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const nx = x * side;
    // Flatten the inner (medial) face where the two hemispheres meet
    if (nx < 0) x *= 0.35;
    // Temporal lobe hangs lower at the sides
    if (y < -0.15 && z > -0.55 && z < 0.6 && nx > 0) y -= 0.18 * nx * Math.min(1, (-y - 0.15) * 3);
    // Wrinkles (gyri and sulci)
    const n = 1 + 0.03 * Math.sin(x * 15 + y * 4) * Math.sin(y * 14 + z * 5) * Math.sin(z * 13 + x * 3)
      + 0.012 * Math.sin(x * 31 + z * 27) * Math.sin(y * 29);
    pos.setXYZ(i, cx + x * 0.48 * n, cy + y * 0.58 * n, z * 0.85 * n);
  }
  sphere.computeVertexNormals();

  const flat = sphere.toNonIndexed();
  const fpos = flat.attributes.position.array;
  const fnorm = flat.attributes.normal.array;
  const index = sphere.index.array;

  const buckets = {};
  for (let tIdx = 0; tIdx < index.length; tIdx += 3) {
    let ux = 0, uy = 0, uz = 0;
    for (let k = 0; k < 3; k++) {
      const vi = index[tIdx + k];
      ux += unit[vi * 3]; uy += unit[vi * 3 + 1]; uz += unit[vi * 3 + 2];
    }
    const id = classify((ux / 3) * side, uy / 3, uz / 3, side);
    (buckets[id] ||= { p: [], n: [] });
    for (let k = 0; k < 9; k++) {
      buckets[id].p.push(fpos[tIdx * 3 + k]);
      buckets[id].n.push(fnorm[tIdx * 3 + k]);
    }
  }

  return Object.entries(buckets).map(([id, { p, n }]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
    return tag(new THREE.Mesh(g, material(id)), id, side);
  });
}

function buildCerebellum() {
  const geo = new THREE.SphereGeometry(1, 96, 64);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const folia = 1 + 0.035 * Math.sin(y * 38 + z * 10); // thin parallel ridges
    const midline = 1 - 0.12 * Math.exp(-x * x * 40); // groove between the two halves
    pos.setXYZ(i, x * 0.44 * folia, y * 0.2 * folia * midline, z * 0.25 * folia);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, material('cerebellum'));
  m.position.set(0, -0.36, -0.58);
  m.rotation.x = -0.25;
  return tag(m, 'cerebellum');
}

/** Returns every mesh of the brain. */
export function buildBrain() {
  const meshes = [];
  for (const side of [-1, 1]) {
    meshes.push(...buildHemisphere(side));
    const s = side;
    meshes.push(
      ellipsoid('thalamus', [s * 0.075, 0.0, -0.06], [0.07, 0.07, 0.12], s),
      ellipsoid('amygdala', [s * 0.3, -0.21, 0.2], [0.05, 0.045, 0.06], s),
      tube('hippocampus', [[s * 0.3, -0.2, 0.13], [s * 0.3, -0.16, -0.08], [s * 0.26, -0.05, -0.28], [s * 0.17, 0.08, -0.36]], 0.035, s),
      tube('basalGanglia', [[s * 0.14, 0.12, 0.36], [s * 0.16, 0.23, 0.12], [s * 0.18, 0.2, -0.15], [s * 0.25, 0.04, -0.3], [s * 0.3, -0.1, -0.15]], 0.035, s),
      ellipsoid('basalGanglia', [s * 0.26, 0.03, 0.1], [0.06, 0.12, 0.17], s),
      ellipsoid('nucleusAccumbens', [s * 0.09, -0.06, 0.27], [0.035, 0.03, 0.035], s),
      tube('ventricles', [[s * 0.07, 0.15, 0.32], [s * 0.09, 0.2, 0.05], [s * 0.11, 0.15, -0.25], [s * 0.2, -0.04, -0.22], [s * 0.26, -0.13, 0.03]], 0.022, s),
      tube('cingulate', [[s * 0.025, 0.02, 0.45], [s * 0.025, 0.3, 0.35], [s * 0.025, 0.4, 0.0], [s * 0.025, 0.36, -0.32], [s * 0.025, 0.12, -0.48]], 0.04, s, null),
      ellipsoid('superiorColliculus', [s * 0.04, -0.13, -0.21], [0.035, 0.03, 0.03], s),
      ellipsoid('inferiorColliculus', [s * 0.04, -0.22, -0.22], [0.03, 0.025, 0.028], s),
      ellipsoid('substantiaNigra', [s * 0.055, -0.22, -0.07], [0.045, 0.018, 0.03], s),
      ellipsoid('olfactoryBulb', [s * 0.06, -0.25, 0.6], [0.03, 0.022, 0.11], s),
    );
  }
  meshes.push(
    tube('corpusCallosum', [[0, 0.02, 0.38], [0, 0.2, 0.32], [0, 0.29, 0.0], [0, 0.26, -0.28], [0, 0.1, -0.4]], 0.035, 0, [3.6, 1, 1]),
    ellipsoid('hypothalamus', [0, -0.14, 0.12], [0.07, 0.05, 0.08]),
    ellipsoid('scn', [0, -0.2, 0.22], [0.025, 0.02, 0.02]),
    ellipsoid('pituitary', [0, -0.33, 0.17], [0.04, 0.035, 0.04]),
    cylinder('pituitary', [0, -0.25, 0.155], 0.012, 0.012, 0.12),
    ellipsoid('opticChiasm', [0, -0.25, 0.3], [0.09, 0.015, 0.035]),
    ellipsoid('vta', [0, -0.24, -0.04], [0.03, 0.02, 0.03]),
    cylinder('midbrain', [0, -0.21, -0.12], 0.1, 0.095, 0.2),
    cylinder('pag', [0, -0.18, -0.15], 0.03, 0.03, 0.16),
    ellipsoid('pons', [0, -0.41, -0.08], [0.13, 0.11, 0.12]),
    cylinder('medulla', [0, -0.62, -0.14], 0.09, 0.065, 0.28, 0, 0.12),
    cylinder('spinalCord', [0, -0.96, -0.18], 0.06, 0.055, 0.45, 0, 0.05),
    cylinder('reticular', [0, -0.4, -0.13], 0.035, 0.03, 0.55),
    buildCerebellum(),
  );
  return meshes;
}
