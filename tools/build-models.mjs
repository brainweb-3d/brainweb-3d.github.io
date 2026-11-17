// Converts downloaded 3D models (Sketchfab glTF zips in assets-incoming/sketchfab/, or a .glb/.gltf such as the NIH 3D
// downloads) into web-ready GLBs for the drill-down.
//
//   node tools/build-models.mjs <zip|glb> <outName> [desktopRatio=0.5] [liteRatio=0.2] [maxTex=2048] [maxError] [mode]
//     desktopRatio / liteRatio  share of triangles to keep (0 < r ≤ 1; 1 = no simplification)
//     maxTex                    largest texture side in px for the desktop file (the lite file uses ≤ 1024)
//     maxError                  relative simplify error, e.g. 0.02 for dense noisy meshes (0 or '-' = default)
//     mode                      'sloppy'   – for meshes made of thousands of tiny separate pieces (atoms, lipids)
//                               'renormal' – for exports with per-face normals (they block welding): drop normals,
//                                            weld, simplify, rebuild smooth normals
//
// Writes public/models/<outName>.glb (desktop) and public/models/<outName>-lite.glb (phones) — both or neither.
// Keeps animations and skins; removes flat floor/backdrop planes; converts spec-gloss materials to metal-rough
// (three.js no longer reads KHR_materials_pbrSpecularGlossiness); textures → WebP; quantise + meshopt compression.
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import JSZip from 'jszip';
import sharp from 'sharp';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, dedup, prune, resample, textureCompress, flatten, join, compactPrimitive, normals, metalRough } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const fail = (msg) => { console.error(`build-models: ${msg}`); process.exit(1); };
const [srcPath, outName, dRatioArg = '0.5', lRatioArg = '0.2', maxTexArg = '2048', errArg, mode = ''] = process.argv.slice(2);
if (!srcPath || !outName) fail('usage: node tools/build-models.mjs <zip|glb> <outName> [desktopRatio] [liteRatio] [maxTex] [maxError] [sloppy|renormal]');
if (!fs.existsSync(srcPath)) fail(`source not found: ${srcPath}`);
if (!/^[a-z0-9][a-z0-9-]*$/.test(outName)) fail(`outName must be lowercase letters, digits and dashes: ${outName}`);
const ratio = (s, name) => { const v = Number(s); if (!(v > 0 && v <= 1)) fail(`${name} must be in (0, 1]: ${s}`); return v; };
const dRatio = ratio(dRatioArg, 'desktopRatio'), lRatio = ratio(lRatioArg, 'liteRatio');
const maxTex = Number(maxTexArg); if (!(maxTex >= 64 && maxTex <= 8192)) fail(`maxTex must be 64–8192: ${maxTexArg}`);
const maxError = errArg && errArg !== '-' && Number(errArg) > 0 ? Number(errArg) : null;
if (mode && !['sloppy', 'renormal', '-'].includes(mode)) fail(`unknown mode: ${mode}`);
const SLOPPY = mode === 'sloppy', RENORMAL = mode === 'renormal';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const stats = (doc) => {
  let tris = 0; for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) tris += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
  return { tris: Math.round(tris), anims: doc.getRoot().listAnimations().length, skins: doc.getRoot().listSkins().length, textures: doc.getRoot().listTextures().length };
};

/** Unzip (data only — we read the .gltf, its .bin and textures; nothing is executed) or use the file directly. */
async function sourceFile(tmp) {
  if (!/\.zip$/i.test(srcPath)) return srcPath;
  const zip = await JSZip.loadAsync(fs.readFileSync(srcPath));
  for (const [name, f] of Object.entries(zip.files)) {
    if (f.dir) continue;
    const dest = path.resolve(tmp, name);
    if (!dest.startsWith(tmp + path.sep)) continue; // no path traversal out of the temp folder
    fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, await f.async('nodebuffer'));
  }
  const find = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { const r = find(p); if (r) return r; } else if (/\.gl(tf|b)$/i.test(e.name)) return p; } return null; };
  const found = find(tmp); if (!found) throw new Error('no .gltf/.glb inside the zip'); return found;
}

async function build(file, keep, tex, out) {
  const doc = await io.read(file);
  // drop presentation floors/backdrops: a flat mesh (thickness < 1 % of its size) that spans most of the scene
  const sb = getBounds(doc.getRoot().listScenes()[0]), sSize = Math.max(...sb.max.map((v, i) => v - sb.min[i]));
  for (const node of doc.getRoot().listNodes()) {
    if (!node.getMesh()) continue;
    const b = getBounds(node), d = b.max.map((v, i) => v - b.min[i]), big = Math.max(...d), thin = Math.min(...d);
    if (big > 0.6 * sSize && thin < 0.01 * big) { console.error('removed flat backdrop:', node.getName()); node.dispose(); }
  }
  const before = stats(doc);
  const animated = before.anims > 0 || before.skins > 0;
  const dropNormals = (d) => { for (const m of d.getRoot().listMeshes()) for (const p of m.listPrimitives()) p.setAttribute('NORMAL', null); };
  // 'sloppy' ignores topology, so it can merge many tiny disconnected pieces that the normal simplifier must keep
  const sloppy = (d) => { for (const m of d.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
    const idx = p.getIndices(); if (!idx || p.getMode() !== 4) continue;
    const I = Uint32Array.from(idx.getArray()), P = Float32Array.from(p.getAttribute('POSITION').getArray());
    const [kept] = MeshoptSimplifier.simplifySloppy(I, P, 3, null, Math.max(3, Math.floor(I.length * keep / 3) * 3), 1);
    idx.setArray(kept); compactPrimitive(p);
  } };
  // flatten/join only for static models (they would break node animation targets)
  const steps = [metalRough(), dedup(), ...(animated ? [] : [flatten(), join()]), ...(RENORMAL ? [dropNormals] : []), weld()];
  if (keep < 1 && SLOPPY) steps.push(sloppy);
  else if (keep < 1) steps.push(simplify({ simplifier: MeshoptSimplifier, ratio: keep, error: maxError ? maxError * (keep < 0.3 ? 2 : 1) : keep < 0.3 ? 0.01 : 0.002 }));
  if (RENORMAL) steps.push(normals({ overwrite: true }));
  if (before.anims) steps.push(resample());
  steps.push(prune(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [tex, tex], quality: 82 }), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await doc.transform(...steps);
  await io.write(out, doc);
  return { before, after: stats(doc), mb: +(fs.statSync(out).size / 1e6).toFixed(2) };
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bw-model-'));
const finalD = `public/models/${outName}.glb`, finalL = `public/models/${outName}-lite.glb`;
try {
  const file = await sourceFile(tmp);
  // build both into the temp folder first, then move them into place together (never a mismatched pair)
  const d = await build(file, dRatio, maxTex, path.join(tmp, 'out-desktop.glb'));
  const l = await build(file, lRatio, Math.min(1024, maxTex), path.join(tmp, 'out-lite.glb'));
  fs.copyFileSync(path.join(tmp, 'out-desktop.glb'), finalD);
  fs.copyFileSync(path.join(tmp, 'out-lite.glb'), finalL);
  console.log(JSON.stringify({ outName, source: d.before, desktop: { ...d.after, mb: d.mb }, lite: { ...l.after, mb: l.mb } }));
} catch (e) {
  console.error(`build-models: ${srcPath}: ${e.message}`); process.exitCode = 1; // (no process.exit: the finally must clean up)
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
