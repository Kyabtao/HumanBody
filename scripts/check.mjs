/**
 * Atlas self-check: `npm run check`
 *
 * Validates the content and the 3D model without a browser:
 *  - every entry has the five depth tiers and a resolvable level
 *  - every mesh, tour step, alias and search result resolves to a real part
 *  - every level shows something in 3D, and quizzes can be generated
 *  - geometry sanity: no broken numbers, and internal structures stay inside the body
 *
 * Exit code 1 on failure, so it can run in CI.
 */
import * as THREE from 'three';
import { buildHumanoid } from '../src/scene/humanoid.js';
import { ALL_PARTS, PART_BY_ID, SYSTEM_BY_ID, partsForLevel, searchParts, ATLAS_STATS } from '../src/data/index.js';
import { LEVELS, bestDetailFor } from '../src/data/levels.js';
import { SYSTEMS } from '../src/data/systems.js';
import { makeQuestions } from '../src/quiz.js';
import { TOURS } from '../src/data/tours.js';

let problems = 0;
const fail = (msg) => { console.log('  ✗ ' + msg); problems++; };
const pass = (msg, extra = '') => console.log(`  ✓ ${msg}${extra ? ' — ' + extra : ''}`);

const bboxOf = (meshes) => {
  const b = new THREE.Box3();
  for (const m of meshes) m.updateWorldMatrix(true, false), b.union(new THREE.Box3().setFromObject(m));
  return b;
};

console.log('\n📚 Content');
for (const p of ALL_PARTS) {
  if (!p.id || !p.name) fail('part missing id or name');
  if (!SYSTEM_BY_ID[p.system]) fail(`${p.id}: unknown system "${p.system}"`);
  if (!p.details?.basic) fail(`${p.id}: missing the basic (Class 1–5) tier`);
  for (const lvl of LEVELS) if (!bestDetailFor(p, lvl.id)) fail(`${p.id}: no text usable at level ${lvl.id}`);
}
const ids = ALL_PARTS.map((p) => p.id);
const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
if (dupes.length) fail(`duplicate part ids: ${dupes.join(', ')}`);
else pass(`${ATLAS_STATS.parts} entries across ${ATLAS_STATS.systems} systems, all with level-appropriate text`);

console.log('\n🔍 Search');
for (const q of ['heart', 'femur', 'nephron', 'mitochondria']) {
  const r = searchParts(q, 5);
  if (!r.length) fail(`search "${q}" found nothing`);
  else console.log(`  · "${q}" → ${r.slice(0, 3).map((p) => p.name).join(', ')}`);
}
pass('search returns hits for common terms');

console.log('\n🧍 3D model');
const human = buildHumanoid('female');
human.root.updateMatrixWorld(true);
const meshParts = new Set(human.allMeshes.map((m) => m.userData.partId));
for (const m of human.allMeshes) {
  if (!PART_BY_ID[m.userData.partId]) fail(`mesh points at unknown part "${m.userData.partId}"`);
  if (!SYSTEM_BY_ID[m.userData.system]) fail(`mesh part ${m.userData.partId}: unknown system ${m.userData.system}`);
}
let nan = 0;
human.root.traverse((m) => {
  if (!m.isMesh) return;
  const a = m.geometry.attributes.position.array;
  for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) { nan++; break; }
});
if (nan) fail(`${nan} meshes contain NaN vertices`);
pass(`${human.allMeshes.length} meshes covering ${meshParts.size} parts, no NaN geometry`);

const skin = bboxOf(human.byPart.get('skin') || []);
const outside = [];
for (const [id, meshes] of human.byPart) {
  const part = PART_BY_ID[id];
  if (!part || id === 'skin') continue;
  // microscopic models (cells, nephron, placenta …) are shown at their own magnified scale
  if (human.resolveMicroModel(id)) continue;
  const b = bboxOf(meshes);
  if (b.min.x < skin.min.x - 0.02 || b.max.x > skin.max.x + 0.02 ||
      b.min.y < skin.min.y - 0.02 || b.max.y > skin.max.y + 0.02 ||
      b.min.z < skin.min.z - 0.02 || b.max.z > skin.max.z + 0.02) outside.push(id);
}
if (outside.length) fail(`structures poking outside the skin: ${outside.join(', ')}`);
else pass('every internal structure sits inside the body envelope');

console.log('\n🔬 Micro view');
for (const p of ALL_PARTS.filter((p) => p.system === 'micro')) {
  if (!human.resolveMicroModel(p.id)) fail(`micro part "${p.id}" has no model`);
}
pass(`${human.microModels.size} microscopic models, all micro entries covered`);

console.log('\n🎓 Levels');
for (const lv of LEVELS) {
  const parts = partsForLevel(lv.id);
  const withMesh = parts.filter((p) => meshParts.has(p.id));
  if (!withMesh.length) fail(`level ${lv.id} would show an empty 3D scene`);
  else console.log(`  · ${lv.short.padEnd(10)} ${String(parts.length).padStart(3)} entries, ${withMesh.length} with 3D geometry`);
}

console.log('\n🎯 Quiz');
for (const lv of LEVELS) {
  const qs = makeQuestions({ level: lv.id, count: 8 });
  if (qs.length < 8) fail(`level ${lv.id}: only ${qs.length}/8 questions generated`);
  if (qs.some((q) => q.options.some((o) => !o || o === '—') || q.answer < 0)) fail(`level ${lv.id}: empty options or missing answer`);
}
pass('8 well-formed questions at every level');

console.log('\n🎒 Tours');
for (const [lvl, tour] of Object.entries(TOURS)) {
  for (const step of tour.steps) {
    if (step.partId && !PART_BY_ID[step.partId]) fail(`tour ${lvl}: unknown part ${step.partId}`);
    if (step.systems) for (const s of step.systems) if (!SYSTEM_BY_ID[s]) fail(`tour ${lvl}: unknown system ${s}`);
  }
  console.log(`  · level ${lvl}: ${tour.steps.length} steps`);
}

console.log(problems ? `\n❌ ${problems} problem(s) found\n` : '\n✅ All atlas checks passed\n');
process.exit(problems ? 1 : 0);
