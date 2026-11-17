// Builds public/models/brain-hq.glb from the NIH 3D detailed brain (assets-incoming/nih-brain-detailed-021161).
// Steps: weld → bake "cavity" vertex colours (sulci darker/redder, gyri paler) → simplify → quantise → meshopt.
// Usage: node tools/build-brain-hq.mjs [src.glb] [out.glb] [keepRatio]
//   desktop: … public/models/brain-hq.glb 1      phone: … public/models/brain-hq-lite.glb 0.35
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, dedup, prune, flatten, join } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const [src = 'assets-incoming/nih-brain-detailed-021161/brain_human-nih3d.glb', out = 'public/models/brain-hq.glb', ratio = '0.6'] = process.argv.slice(2);
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(src);
// The source's outer surface is split across 4 overlapping pieces (Object_2..5). Simplifying them separately opens
// cracks at the seams and the overlaps z-fight (visible triangles). So: flatten + join into ONE surface, weld the
// seams, and drop duplicate triangles before baking/simplifying.
await doc.transform(flatten(), join({ keepNamed: false }), prune(), dedup(), weld());
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
  const I = prim.getIndices().getArray(), seen = new Set(), keep = [];
  for (let f = 0; f < I.length; f += 3) {
    const t = [I[f], I[f + 1], I[f + 2]]; if (t[0] === t[1] || t[1] === t[2] || t[0] === t[2]) continue; // degenerate
    const k = [...t].sort((x, y) => x - y).join(','); if (seen.has(k)) continue; seen.add(k); keep.push(...t);
  }
  console.log('triangles', I.length / 3, '→ unique', keep.length / 3);
  prim.getIndices().setArray(new Uint32Array(keep));
}

const GYRUS = [0xf0, 0xc6, 0xba], SULCUS = [0x8a, 0x44, 0x44]; // sRGB
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };

for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
  const P = prim.getAttribute('POSITION').getArray(), I = prim.getIndices().getArray(), n = P.length / 3;
  // area-weighted vertex normals
  const N = new Float32Array(n * 3);
  for (let f = 0; f < I.length; f += 3) {
    const a = I[f] * 3, b = I[f + 1] * 3, c = I[f + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { N[k] += nx; N[k + 1] += ny; N[k + 2] += nz; }
  }
  for (let i = 0; i < n; i++) { const l = Math.hypot(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]) || 1; N[i * 3] /= l; N[i * 3 + 1] /= l; N[i * 3 + 2] /= l; }
  // neighbour lists from triangle edges
  const nb = Array.from({ length: n }, () => new Set());
  for (let f = 0; f < I.length; f += 3) for (let e = 0; e < 3; e++) { const a = I[f + e], b = I[f + (e + 1) % 3]; nb[a].add(b); nb[b].add(a); }
  const adj = nb.map((s) => [...s]);
  // concavity: neighbours above the tangent plane → the vertex sits in a groove
  let cav = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0, L = 0;
    for (const j of adj[i]) {
      const dx = P[j * 3] - P[i * 3], dy = P[j * 3 + 1] - P[i * 3 + 1], dz = P[j * 3 + 2] - P[i * 3 + 2];
      s += dx * N[i * 3] + dy * N[i * 3 + 1] + dz * N[i * 3 + 2]; L += Math.hypot(dx, dy, dz);
    }
    cav[i] = adj[i].length ? s / (L || 1) : 0;
  }
  // spread it over the width of a sulcus (Laplacian smoothing), keeping some fine detail
  const smooth = (src, iters) => { let a = src; for (let k = 0; k < iters; k++) { const b = new Float32Array(n); for (let i = 0; i < n; i++) { let s = a[i]; for (const j of adj[i]) s += a[j]; b[i] = s / (adj[i].length + 1); } a = b; } return a; };
  const fine = smooth(cav, 3), broad = smooth(cav, 25);
  const mix = fine.map((v, i) => 0.35 * v + 0.65 * broad[i]);
  const sorted = Float32Array.from(mix).sort(), lo = sorted[Math.floor(n * 0.05)], hi = sorted[Math.floor(n * 0.97)];
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = Math.min(1, Math.max(0, (mix[i] - lo) / (hi - lo))) ** 1.3;
    for (let k = 0; k < 3; k++) col[i * 3 + k] = lin(GYRUS[k] + (SULCUS[k] - GYRUS[k]) * t);
  }
  const acc = doc.createAccessor().setType('VEC3').setArray(col).setBuffer(doc.getRoot().listBuffers()[0]);
  prim.setAttribute('COLOR_0', acc);
}
for (const m of doc.getRoot().listMaterials()) m.setBaseColorFactor([1, 1, 1, 1]);

await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: +ratio, error: +ratio < 0.4 ? 0.004 : 0.0008 }), prune(), quantize({ quantizeNormal: 14, quantizeColor: 10 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await io.write(out, doc);
let t = 0; for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) t += p.getIndices().getCount() / 3;
console.log(out, 'triangles', t);
