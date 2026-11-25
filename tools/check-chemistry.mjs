// Checks content/chemistry.js: every list refers to a real pathway/effect/messenger/role, pathway steps line up
// with the pathway's stages, and every item has a role note in English and Hebrew.
// Usage: node tools/check-chemistry.mjs
import { MESSENGERS, ROLES, PATHWAY_CHEM, EFFECT_CHEM, DIVE_CHEM } from '../content/chemistry.js';
import { pathwayById } from '../src/brain/pathways.js';
import { effectById } from '../content/effects.js';
import { PLACES } from '../src/explore/graph.js';

const bad = [];
const item = (where, [id, role, note]) => {
  if (!MESSENGERS[id]) bad.push(`${where}: unknown messenger ${id}`);
  if (!ROLES[role]) bad.push(`${where}: unknown role ${role}`);
  if (!note?.en || !note?.he) bad.push(`${where}: ${id} has no role note (EN + HE)`);
};
for (const [id, p] of Object.entries(PATHWAY_CHEM)) {
  const pw = pathwayById[id];
  if (!pw) { bad.push(`pathway ${id} does not exist`); continue; }
  if (p.steps.length !== pw.stages.length) bad.push(`pathway ${id}: ${p.steps.length} steps vs ${pw.stages.length} stages`);
  p.list.forEach((x) => item(`pathway ${id}`, x));
  p.steps.flat().forEach((m) => { if (!p.list.some((x) => x[0] === m)) bad.push(`pathway ${id}: step messenger ${m} not in its list`); });
}
for (const [id, list] of Object.entries(EFFECT_CHEM)) {
  if (!effectById[id]) bad.push(`effect ${id} does not exist`);
  list.forEach((x) => item(`effect ${id}`, x));
}
for (const [key, x] of Object.entries(DIVE_CHEM)) {
  const [from, hid] = key.split('>');
  const hs = PLACES[from]?.hotspots?.find((h) => h.id === hid);
  if (!hs) bad.push(`dive ${key}: no such dot`);
  else if (hs.alone !== x[0]) bad.push(`dive ${key}: the dot's "alone" is ${hs.alone}, not ${x[0]}`);
  item(`dive ${key}`, x);
}
const n = Object.values(PATHWAY_CHEM).reduce((a, p) => a + p.list.length, 0) + Object.values(EFFECT_CHEM).reduce((a, l) => a + l.length, 0) + Object.keys(DIVE_CHEM).length;
console.log(bad.length ? bad.join('\n') : `OK: ${n} messenger labels, each with a role note`);
process.exitCode = bad.length ? 1 : 0;
