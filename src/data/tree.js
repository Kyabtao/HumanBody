/**
 * tree.js — the body-part tree.
 *
 * The rest of the atlas is organised by *system* (skeletal, nervous, …), which
 * is how a textbook is written but not how a person points at a body: "what's
 * in my knee?", "show me everything in the head". This module files every part
 * of the atlas once — and only once — into a regional hierarchy:
 *
 *   region (Head & Neck)  →  branch (Brain & meninges)  →  part (Brain)
 *
 * Authoring rules
 * ---------------
 *  - a leaf is always an existing part id from `src/data/parts/*.js`;
 *  - each part appears in exactly one branch, so counts never double up;
 *  - anything not filed here is reported by `treeIssues()` and is shown in an
 *    automatic "Not filed yet" branch so content can never go missing.
 *
 * `npm run check` fails if an id is unknown, duplicated or missing, which keeps
 * this file honest as the atlas grows.
 */
import { ALL_PARTS, PART_BY_ID } from './index.js';

/** A region: top-level row with its own icon and one-line teaching summary. */
const R = (id, name, icon, blurb, children) => ({ id, name, icon, blurb, kind: 'region', children });
/** A branch: a named cluster of parts inside a region. */
const B = (id, name, parts, note) => ({ id, name, kind: 'branch', parts, note });

export const BODY_TREE = [
  R('head-neck', 'Head & Neck', '🗣️', 'From the crown to the collarbone: the skull, the brain, the special senses and the gateway for air and food.', [
    B('hn-skull', 'Skull, face & jaw', ['head', 'face', 'skull', 'mandible'],
      'Bone, muscle and skin of the head — 22 bones, 8 of them cranium, 14 of them face.'),
    B('hn-brain', 'Brain & meninges', ['brain', 'cerebrum', 'cerebellum', 'brainstem', 'thalamus', 'hypothalamus', 'meninges', 'pituitary', 'pineal'],
      'The control room, its coverings and the two glands hanging from it.'),
    B('hn-senses', 'Eyes, ears, nose & mouth', ['eye', 'ear', 'nose', 'tongue', 'mouth', 'salivary-glands', 'nasal-cavity'],
      'The special senses plus the start of the digestive and respiratory tracts.'),
    B('hn-neck', 'Neck, throat & voice', ['neck', 'cervical-vertebrae', 'pharynx', 'larynx', 'thyroid', 'parathyroid'],
      'The busy corridor that carries air, food, blood and nerves between head and body.'),
  ]),
  R('upper-limb', 'Upper Limb', '💪', 'The free upper limb: shoulder girdle, arm, forearm and hand — built for reach and grip, not for weight.', [
    B('ul-shoulder', 'Shoulder & armpit', ['shoulder', 'clavicle', 'scapula', 'deltoid'],
      'A shallow ball-and-socket: the most mobile, least stable joint in the body.'),
    B('ul-arm', 'Arm & elbow', ['arm', 'humerus', 'elbow', 'biceps', 'triceps'],
      'One bone, two compartments — flexors in front, extensors behind.'),
    B('ul-forearm', 'Forearm & wrist', ['forearm', 'radius', 'ulna', 'forearm-muscles'],
      'Two bones that rotate round each other to turn the palm up and down.'),
    B('ul-hand', 'Hand & fingers', ['hand', 'hand-bones'],
      '27 bones per hand, half of them in the fingers; the thumb does the pinching.'),
  ]),
  R('thorax', 'Thorax & Breathing', '🫁', 'The bony barrel that protects heart and lungs and works as a bellows for breathing.', [
    B('thx-wall', 'Chest wall & breast', ['chest', 'ribs', 'sternum', 'pectoralis', 'mammary'],
      'Ribs, breastbone and the muscles over them — plus the mammary glands.'),
    B('thx-airway', 'Lungs & airways', ['lungs', 'trachea', 'bronchi', 'alveoli', 'pleura', 'diaphragm', 'respiratory-control'],
      'From the windpipe down to 300 million air sacs, and the pump that drives them.'),
    B('thx-heart', 'Heart & great vessels', ['heart', 'heart-chambers', 'heart-valves', 'aorta', 'vena-cava', 'coronary'],
      'Four chambers, four valves, and the two big pipes plus the heart’s own arteries.'),
    B('thx-flow', 'Vessels & circulation', ['arteries', 'veins', 'capillaries', 'spleen-vascular'],
      'The whole transport tree: pressures, valves and the exchange beds.'),
  ]),
  R('back-spine', 'Back & Spinal Cord', '🦴', 'The axial pillar seen from behind: vertebrae, the cord inside them and the muscles that hold you upright.', [
    B('bs-column', 'Vertebral column', ['back', 'thoracic-vertebrae', 'lumbar-vertebrae', 'sacrum'],
      '33 vertebrae in five regions, curved front-to-back for spring and balance.'),
    B('bs-cord', 'Spinal cord & reflexes', ['spinal-cord', 'reflex'],
      'The highway between body and brain, and the shortcuts that beat it.'),
    B('bs-muscles', 'Muscles of the back', ['trapezius', 'latissimus-dorsi'],
      'The flat sheets that move the shoulder blades and hold the trunk.'),
  ]),
  R('abdomen', 'Abdomen & Digestion', '🍽️', 'The chemical workshop: gut tube and its glands behind, kidneys at the back wall.', [
    B('ab-wall', 'Abdominal wall & lining', ['abdomen', 'abdominal-muscles', 'peritoneum'],
      'Four layered muscles in front, a slippery serous membrane inside.'),
    B('ab-gut', 'Stomach & intestines', ['oesophagus', 'stomach', 'small-intestine', 'large-intestine', 'gut-microbiome'],
      'A nine-metre tube: mixing, digesting, absorbing, and housing your microbes.'),
    B('ab-glands', 'Liver, gallbladder & pancreas', ['liver', 'gallbladder', 'pancreas', 'pancreas-islets'],
      'The gut’s accessory factories: bile, enzymes and the islets of Langerhans.'),
    B('ab-urinary', 'Kidneys, bladder & ureters', ['kidney', 'nephron', 'ureter', 'bladder', 'urethra', 'kidney-function', 'adrenal'],
      'Two million nephrons that set the composition of everything else.'),
  ]),
  R('pelvis', 'Pelvis & Reproduction', '🌱', 'The bony basin that carries the weight of the trunk and houses the reproductive organs.', [
    B('pv-bones', 'Pelvic girdle & hip', ['pelvis', 'hip', 'gluteal-muscles'],
      'A weight-bearing ring, fused to the spine, with the strongest muscles in the body.'),
    B('pv-repro', 'Reproductive organs', ['gonads', 'uterus', 'placenta', 'sperm-path', 'gametes', 'puberty', 'pregnancy-development'],
      'Gonads, ducts and the organs of pregnancy, in both female and male bodies.'),
  ]),
  R('lower-limb', 'Lower Limb', '🦵', 'The stiff, springy pillar that carries you: hip to toes, built for standing and walking.', [
    B('ll-thigh', 'Thigh & hip joint', ['thigh', 'femur', 'quadriceps', 'hamstrings'],
      'The longest bone and the biggest muscles, front and back of one joint.'),
    B('ll-knee', 'Knee', ['knee', 'patella'],
      'A hinge with menisci, bursae and a sesameoid bone in front of it.'),
    B('ll-leg', 'Leg & ankle', ['leg', 'tibia', 'fibula', 'calf-muscles'],
      'The weight-bearing tibia, a slender fibula, and the calf pump.'),
    B('ll-foot', 'Foot & toes', ['foot', 'foot-bones'],
      '26 bones per foot arranged as springs and arches, not a flat plank.'),
  ]),
  R('surface', 'Skin & Body Surface', '🧴', 'Everything you can see and touch — the covering organ and the sense organs in it.', [
    B('sv-covering', 'Skin & its layers', ['skin', 'epidermis', 'dermis'],
      'Your largest organ: a self-renewing waterproof barrier about 2 m².'),
    B('sv-appendages', 'Hair, nails & glands', ['hair', 'sweat-glands'],
      'Keratin appendages and the glands that open onto the surface.'),
    B('sv-sensing', 'Touch, temperature & repair', ['touch-receptors', 'wound-healing'],
      'Receptors in the dermis, and the orderly cascade that closes a wound.'),
  ]),
  R('movement', 'Movement: Bones, Joints & Muscles', '🦿', 'The general rules behind the parts — how bone, cartilage, tendon and muscle are built and work.', [
    B('mv-bone', 'Bone, cartilage & joints', ['joints', 'cartilage', 'bone-tissue'],
      'Living tissue under load: remodelling bone and the joints it forms.'),
    B('mv-muscle', 'Muscle & how it contracts', ['muscle-overview', 'smooth-muscle', 'tendon'],
      'Striated and involuntary muscle, and the cord that attaches it to bone.'),
  ]),
  R('blood-immunity', 'Blood, Lymph & Immunity', '🩸', 'The fluid and the defence network that run through every region above.', [
    B('bi-blood', 'Blood & its cells', ['blood', 'red-blood-cell', 'white-blood-cell', 'platelets', 'bone-marrow'],
      'A litre and a half of tissue that carries, defends and clots.'),
    B('bi-immune', 'Lymph nodes, spleen & defence', ['lymph-nodes', 'spleen', 'thymus', 'tonsils', 'lymph-vessels', 'immunity-innate', 'immunity-adaptive'],
      'The drainage network, its filter stations and the two arms of immunity.'),
  ]),
  R('control', 'Nerves & Control', '⚡', 'The wiring and the chemistry that coordinate the whole body at once.', [
    B('ct-nerves', 'Peripheral & autonomic nerves', ['peripheral-nerves', 'autonomic', 'neuron'],
      'Nerves outside the CNS, and the half you do not steer.'),
    B('ct-hormones', 'Hormones & feedback', ['hormones', 'growth-hormone', 'stress-response', 'homeostasis'],
      'Slow chemical messaging, its axes, and the set points it defends.'),
  ]),
  R('micro', 'Cells & Molecules', '🔬', 'Below the naked eye: the cell, the four tissues it makes, and the molecules that run it.', [
    B('mc-cell', 'The cell & its organelles', ['cell', 'nucleus', 'mitochondria', 'er-golgi', 'membrane'],
      'The unit of life and the compartments inside it.'),
    B('mc-tissue', 'The four basic tissues', ['epithelium', 'connective-tissue', 'muscle-tissue-types', 'nervous-tissue'],
      'Everything in the body is one of these four, or a mixture.'),
    B('mc-mol', 'Genes, stem cells & ageing', ['molecular', 'stem-cells', 'aging'],
      'Signalling, renewal and what happens when renewal falls behind.'),
  ]),
];

/* ==================================================================== */
/*  Derived indexes                                                     */
/* ==================================================================== */

/** Every node in depth-first order, each carrying its `depth` and `parent`. */
export const TREE_NODES = [];
export const TREE_NODE_BY_ID = new Map();
export const PART_BRANCH = new Map(); // partId → branch node that files it
export const PART_BRANCHES = new Map(); // partId → every branch id naming it (>1 = filed twice)
export const BRANCH_PARENT = new Map(); // branchId → region node

(function indexTree(nodes, depth, parent) {
  for (const node of nodes) {
    const entry = { node, depth, parent };
    TREE_NODE_BY_ID.set(node.id, node);
    TREE_NODES.push(entry);
    if (node.kind === 'branch' && parent) BRANCH_PARENT.set(node.id, parent.node);
    for (const id of node.parts || []) {
      PART_BRANCH.set(id, node);
      const seen = PART_BRANCHES.get(id);
      if (seen) seen.push(node.id);
      else PART_BRANCHES.set(id, [node.id]);
    }
    indexTree(node.children || [], depth + 1, entry);
  }
})(BODY_TREE, 0, null);

/** Regions in declaration order. */
export const TREE_REGIONS = BODY_TREE;

/** Region → branch trail for a part, root first; empty when the part is unfiled. */
export function pathToPart(partId) {
  const branch = PART_BRANCH.get(partId);
  if (!branch) return [];
  const trail = [branch];
  const region = BRANCH_PARENT.get(branch.id);
  if (region) trail.unshift(region);
  return trail;
}

/** "Head & Neck › Brain & meninges" for the details panel. */
export function trailLabel(partId) {
  const trail = pathToPart(partId);
  return trail.map((n) => n.name).join(' › ');
}

/** Every part id filed under a node (its own parts plus all descendants). */
export function partIdsUnder(nodeId) {
  const node = TREE_NODE_BY_ID.get(nodeId);
  if (!node) return [];
  const out = [];
  const seen = new Set();
  const visit = (n) => {
    for (const id of n.parts || []) if (!seen.has(id)) { seen.add(id); out.push(id); }
    for (const c of n.children || []) visit(c);
  };
  visit(node);
  return out;
}

/** Parts filed under a node, as atlas entries. */
export function partsUnder(nodeId) {
  return partIdsUnder(nodeId).map((id) => PART_BY_ID[id]).filter(Boolean);
}

/** The atlas systems a node’s parts belong to — the layers it needs on. */
export function systemsUnder(nodeId) {
  const out = new Set();
  for (const p of partsUnder(nodeId)) out.add(p.system);
  return out;
}

/** Branch ids a region contains. */
export function childBranches(nodeId) {
  const node = TREE_NODE_BY_ID.get(nodeId);
  return (node?.children || []).map((c) => c.id);
}

/**
 * Sanity report used by `npm run check` and by the UI fallback branch.
 * `unknown`  — the tree names an id that does not exist
 * `duplicates` — a part filed in more than one branch
 * `unfiled`  — an atlas part the tree does not mention
 */
export function treeIssues() {
  const unknown = [];
  const duplicates = [];
  for (const [partId, branchIds] of PART_BRANCHES) {
    if (!PART_BY_ID[partId]) unknown.push(partId);
    if (branchIds.length > 1) duplicates.push(`${partId} (${branchIds.join(', ')})`);
  }
  const unfiled = ALL_PARTS.filter((p) => !PART_BRANCH.has(p.id)).map((p) => p.id);
  return { unknown, duplicates, unfiled };
}

/** Parts not yet filed anywhere — the tree shows them rather than hiding them. */
export function unfiledParts() {
  const { unfiled } = treeIssues();
  return unfiled.map((id) => PART_BY_ID[id]).filter(Boolean);
}

/**
 * A rendering-ready copy of the tree for one learning level.
 *
 * Each node gains: `parts` (resolved entries), `children` (branches), `count`
 * (entries you can open at this level), `lockedCount` (entries above it) and
 * `systems`. Anything unfiled is appended as a "Not filed yet" branch so the
 * tree always accounts for every entry in the atlas.
 */
export function buildTree({ level = 5, includeUnfiled = true } = {}) {
  const decorate = (node, depth) => {
    const parts = (node.parts || []).map((id) => PART_BY_ID[id]).filter(Boolean);
    const children = (node.children || []).map((c) => decorate(c, depth + 1));
    const leaves = [...parts, ...children.flatMap((c) => c.all)];
    const open = leaves.filter((p) => (p.minLevel ?? 1) <= level);
    return {
      id: node.id,
      name: node.name,
      icon: node.icon,
      blurb: node.blurb,
      note: node.note,
      kind: node.kind,
      depth,
      parts,
      children,
      all: leaves,
      count: open.length,
      lockedCount: leaves.length - open.length,
      systems: [...new Set(leaves.map((p) => p.system))],
    };
  };
  const tree = BODY_TREE.map((r) => decorate(r, 0));
  if (includeUnfiled) {
    const orphans = unfiledParts();
    if (orphans.length) {
      tree.push({
        id: 'unfiled',
        name: 'Not filed yet',
        icon: '🗂️',
        blurb: 'Entries that the regional tree has not been given a home for. Add them in src/data/tree.js.',
        kind: 'region',
        depth: 0,
        parts: orphans,
        children: [],
        all: orphans,
        count: orphans.filter((p) => (p.minLevel ?? 1) <= level).length,
        lockedCount: orphans.filter((p) => (p.minLevel ?? 1) > level).length,
        systems: [...new Set(orphans.map((p) => p.system))],
      });
    }
  }
  return tree;
}

export default BODY_TREE;
