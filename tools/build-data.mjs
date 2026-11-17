// Converts downloaded scientific data into small JSON files for the site.
//   node tools/build-data.mjs <downloadFolder> <outFolder>
// <downloadFolder> must contain: pubchem/*.sdf (PubChem 3D conformers), pdb/*.cif.gz (RCSB PDB, mmCIF),
//                                neuro/*.swc (NeuroMorpho.org reconstructions, CNG version).
// Output: <out>/molecules.json, <out>/proteins/<ID>.json, <out>/neurons/<name>.json
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('usage: node tools/build-data.mjs <downloadFolder> <outFolder>'); process.exit(1); }
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
fs.mkdirSync(path.join(out, 'proteins'), { recursive: true });
fs.mkdirSync(path.join(out, 'neurons'), { recursive: true });

// ---------------------------------------------------------------- molecules (SDF V2000)
const molecules = {};
for (const f of fs.readdirSync(path.join(src, 'pubchem')).filter((x) => x.endsWith('.sdf'))) {
  const lines = fs.readFileSync(path.join(src, 'pubchem', f), 'utf8').split(/\r?\n/);
  const cid = +lines[0].trim();
  const counts = lines[3];
  const na = +counts.slice(0, 3), nb = +counts.slice(3, 6);
  const atoms = [], bonds = [];
  for (let i = 0; i < na; i++) {
    const l = lines[4 + i];
    atoms.push([l.slice(31, 34).trim(), +l.slice(0, 10), +l.slice(10, 20), +l.slice(20, 30)]);
  }
  for (let i = 0; i < nb; i++) {
    const l = lines[4 + na + i];
    bonds.push([+l.slice(0, 3) - 1, +l.slice(3, 6) - 1, +l.slice(6, 9)]);
  }
  // centre on heavy atoms
  const heavy = atoms.filter((a) => a[0] !== 'H');
  const c = [0, 1, 2].map((k) => heavy.reduce((s, a) => s + a[k + 1], 0) / heavy.length);
  molecules[f.replace('.sdf', '')] = { cid, atoms: atoms.map((a) => [a[0], r2(a[1] - c[0]), r2(a[2] - c[1]), r2(a[3] - c[2])]), bonds };
}
fs.writeFileSync(path.join(out, 'molecules.json'), JSON.stringify({ source: 'PubChem 3D conformers (NCBI, public domain)', molecules }));
console.log('molecules', Object.keys(molecules).length);

// ---------------------------------------------------------------- proteins (mmCIF)
function tokenize(line) {
  const t = [];
  const re = /'([^']*(?:'\S[^']*)*)'(?=\s|$)|"([^"]*)"(?=\s|$)|(\S+)/g;
  let m;
  while ((m = re.exec(line))) t.push(m[1] ?? m[2] ?? m[3]);
  return t;
}
// Channels whose file stores one or two subunits: chains to copy with the assembly operators (→ full tetramer).
const ASSEMBLE = { '2A79': ['A', 'B'], '3RVY': ['A', 'B'] };
/** _pdbx_struct_oper_list → { id: 3×4 matrix } (rows may wrap over several lines). */
function parseOperators(text) {
  const lines = text.split('\n');
  let i = lines.findIndex((l) => l.startsWith('_pdbx_struct_oper_list.'));
  const cols = [];
  while (lines[i].startsWith('_pdbx_struct_oper_list.')) cols.push(lines[i++].trim().slice(23));
  const toks = [];
  for (; i < lines.length && !lines[i].startsWith('#'); i++) toks.push(...tokenize(lines[i]));
  const ops = {};
  for (let k = 0; k + cols.length <= toks.length; k += cols.length) {
    const row = Object.fromEntries(cols.map((c, j) => [c, toks[k + j]]));
    ops[row.id] = [1, 2, 3].map((r) => [+row[`matrix[${r}][1]`], +row[`matrix[${r}][2]`], +row[`matrix[${r}][3]`], +row[`vector[${r}]`]]);
  }
  return ops;
}
const LIGANDS = { '4XP1': ['LDP'], '2BG9': [], '3SN6': [] }; // dopamine
for (const f of fs.readdirSync(path.join(src, 'pdb')).filter((x) => x.endsWith('.cif.gz'))) {
  const id = f.slice(0, 4).toUpperCase();
  const text = zlib.gunzipSync(fs.readFileSync(path.join(src, 'pdb', f))).toString('utf8');
  const title = (text.match(/_struct\.title\s+(?:'([^']*)'|"([^"]*)"|(.+))/) || []).slice(1).find(Boolean)?.trim() || id;
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.startsWith('_atom_site.'));
  const cols = [];
  let i = start;
  while (lines[i].startsWith('_atom_site.')) cols.push(lines[i++].trim().slice(11));
  const ix = (n) => cols.indexOf(n);
  const I = { grp: ix('group_PDB'), el: ix('type_symbol'), atom: ix('label_atom_id'), alt: ix('label_alt_id'), res: ix('label_comp_id'), chain: ix('auth_asym_id'), seq: ix('auth_seq_id'), x: ix('Cartn_x'), y: ix('Cartn_y'), z: ix('Cartn_z'), model: ix('pdbx_PDB_model_num') };
  const chains = new Map(), ligs = [];
  const isDNA = id === '1BNA';
  for (; i < lines.length && !lines[i].startsWith('#'); i++) {
    const t = tokenize(lines[i]);
    if (t.length < cols.length) continue;
    if (I.model >= 0 && t[I.model] !== '1') continue;
    if (t[I.alt] !== '.' && t[I.alt] !== 'A') continue;
    const xyz = [+t[I.x], +t[I.y], +t[I.z]];
    if (t[I.grp] === 'HETATM') {
      if ((LIGANDS[id] || []).includes(t[I.res])) ligs.push([t[I.el], ...xyz, t[I.res]]);
      continue;
    }
    const want = isDNA ? (t[I.atom] === 'P' || t[I.atom] === "C1'" || t[I.atom] === 'N1' || t[I.atom] === 'N3') : t[I.atom] === 'CA';
    if (!want) continue;
    const ch = t[I.chain];
    if (!chains.has(ch)) chains.set(ch, []);
    chains.get(ch).push({ a: t[I.atom], res: t[I.res], seq: +t[I.seq], p: xyz });
  }
  // Some crystal files hold only part of the channel: rebuild the biological assembly with its symmetry operators.
  if (ASSEMBLE[id]) {
    const ops = parseOperators(text);
    const expr = (text.match(/_pdbx_struct_assembly_gen\.oper_expression\s+'?([^\s']+)/) || [])[1] || '1';
    const opIds = expr.replace(/[()]/g, '').split(',').flatMap((x) => { const [a, b] = x.split('-').map(Number); return b ? Array.from({ length: b - a + 1 }, (_, k) => String(a + k)) : [String(a)]; });
    const base = new Map([...chains].filter(([ch]) => ASSEMBLE[id].includes(ch)));
    chains.clear();
    for (const op of opIds) {
      const M = ops[op];
      if (!M) continue;
      for (const [ch, list] of base) chains.set(`${ch}${op}`, list.map((x) => ({ ...x, p: [0, 1, 2].map((r) => M[r][0] * x.p[0] + M[r][1] * x.p[1] + M[r][2] * x.p[2] + M[r][3]) })));
    }
  }
  // centre on all trace atoms
  const all = [...chains.values()].flat();
  const c = [0, 1, 2].map((k) => all.reduce((s, a) => s + a.p[k], 0) / all.length);
  const sub = (p) => [r1(p[0] - c[0]), r1(p[1] - c[1]), r1(p[2] - c[2])];
  const outChains = [];
  for (const [ch, list] of chains) {
    if (isDNA) {
      outChains.push({ id: ch, backbone: list.filter((x) => x.a === 'P').map((x) => sub(x.p)), bases: list.filter((x) => x.a === "C1'").map((x) => ({ res: x.res.trim(), p: sub(x.p) })) });
      continue;
    }
    // split into continuous segments (gap when neighbouring Cα are > 4.5 Å apart)
    const segs = [];
    let cur = [];
    list.forEach((x, k) => {
      if (k && Math.hypot(x.p[0] - list[k - 1].p[0], x.p[1] - list[k - 1].p[1], x.p[2] - list[k - 1].p[2]) > 4.5) { if (cur.length > 2) segs.push(cur); cur = []; }
      cur.push(sub(x.p));
    });
    if (cur.length > 2) segs.push(cur);
    if (segs.length) outChains.push({ id: ch, segments: segs });
  }
  const data = { id, title, source: `RCSB PDB ${id} (CC0)`, units: 'angstrom', chains: outChains, ligands: ligs.map((l) => [l[0], ...sub(l.slice(1, 4)), l[4]]) };
  fs.writeFileSync(path.join(out, 'proteins', `${id}.json`), JSON.stringify(data));
  console.log('protein', id, outChains.length, 'chains', (JSON.stringify(data).length / 1024).toFixed(0) + 'KB', '| ligand atoms', ligs.length);
}

// ---------------------------------------------------------------- neurons (SWC)
for (const f of fs.readdirSync(path.join(src, 'neuro')).filter((x) => x.endsWith('.swc'))) {
  const rows = fs.readFileSync(path.join(src, 'neuro', f), 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/).map(Number));
  const byId = new Map(rows.map((r) => [r[0], { id: r[0], type: r[1], x: r[2], y: r[3], z: r[4], r: r[5], parent: r[6], kids: [] }]));
  for (const n of byId.values()) byId.get(n.parent)?.kids.push(n);
  const soma = [...byId.values()].filter((n) => n.type === 1);
  const c = soma.length ? [soma.reduce((s, n) => s + n.x, 0) / soma.length, soma.reduce((s, n) => s + n.y, 0) / soma.length, soma.reduce((s, n) => s + n.z, 0) / soma.length] : [rows[0][2], rows[0][3], rows[0][4]];
  // keep: roots, branch points, tips, soma points, and every point that bends or is ≥ 6 µm from the last kept one
  const keep = new Set();
  for (const n of byId.values()) {
    const p = byId.get(n.parent);
    if (!p || n.kids.length !== 1 || n.type === 1 || p.type !== n.type) { keep.add(n.id); continue; }
  }
  for (const n of byId.values()) {
    if (keep.has(n.id)) continue;
    let a = byId.get(n.parent);
    while (a && !keep.has(a.id)) a = byId.get(a.parent);
    if (a && Math.hypot(n.x - a.x, n.y - a.y, n.z - a.z) >= 6) keep.add(n.id);
  }
  const ids = [...byId.keys()].filter((k) => keep.has(k));
  const index = new Map(ids.map((k, i) => [k, i]));
  const points = ids.map((k) => {
    const n = byId.get(k);
    let a = byId.get(n.parent);
    while (a && !keep.has(a.id)) a = byId.get(a.parent);
    return [r2(n.x - c[0]), r2(n.y - c[1]), r2(n.z - c[2]), r2(n.r), n.type, a ? index.get(a.id) : -1];
  });
  const data = { name: f.replace('.swc', ''), source: 'NeuroMorpho.Org (CC BY 4.0)', units: 'micrometre', points };
  fs.writeFileSync(path.join(out, 'neurons', f.replace('.swc', '.json')), JSON.stringify(data));
  console.log('neuron', f, rows.length, '→', points.length, 'points', (JSON.stringify(data).length / 1024).toFixed(0) + 'KB');
}
