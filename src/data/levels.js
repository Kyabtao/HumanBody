/**
 * Learning tiers. Everything in the atlas is tagged with the tier at which it
 * first becomes appropriate, so the same 3D scene can be read by a 6-year-old
 * and by a PhD candidate.
 */
export const LEVELS = [
  {
    id: 1,
    key: 'kids',
    title: 'Class 1 – 5',
    short: 'Class 1–5',
    subtitle: 'My Body',
    blurb:
      'Name the outside of your body, find where things are, and learn what each part does for you every day.',
    focus: [
      'External body regions (head, trunk, arms, legs)',
      'The five senses and what they do',
      'Big organs you can point to: heart, lungs, brain, stomach',
      'Healthy habits: food, sleep, exercise, hygiene',
    ],
  },
  {
    id: 2,
    key: 'middle',
    title: 'Class 6 – 8',
    short: 'Class 6–8',
    subtitle: 'Body Systems',
    blurb:
      'The body is built from teams of organs called systems. Learn the eleven systems and how they work together.',
    focus: [
      'All eleven organ systems and their jobs',
      'Major bones and muscle groups',
      'How blood travels around the body',
      'Breathing, digestion and waste removal',
    ],
  },
  {
    id: 3,
    key: 'high',
    title: 'Class 9 – 10',
    short: 'Class 9–10',
    subtitle: 'Organs in Depth',
    blurb:
      'Every organ has a shape, a blood supply, a nerve supply and a job. Start thinking like an anatomist.',
    focus: [
      'Organ structure, location and relations',
      'Bones of the full skeleton',
      'Heart chambers, valves and circulation circuits',
      'Nephron, alveolus, villus, osteon: functional units',
    ],
  },
  {
    id: 4,
    key: 'undergrad',
    title: 'Undergraduate / MBBS',
    short: 'Undergrad',
    subtitle: 'Gross Anatomy & Physiology',
    blurb:
      'Regional anatomy, origins and insertions, nerve and arterial supply, and the physiology behind the structure.',
    focus: [
      'Regional anatomy, fascial planes and relations',
      'Muscle origin, insertion, nerve supply and action',
      'Nerve pathways, dermatomes and myotomes',
      'Physiology: pressures, volumes, feedback loops',
    ],
  },
  {
    id: 5,
    key: 'phd',
    title: 'MD / PhD',
    short: 'PhD',
    subtitle: 'Microanatomy, Molecular & Research',
    blurb:
      'Histology, ultrastructure, molecular mechanisms, developmental origin and the open questions at the frontier.',
    focus: [
      'Histology and ultrastructure of every tissue',
      'Cell signalling, receptors, ion channels, gene regulation',
      'Embryological origin and congenital variants',
      'Imaging, biomarkers, pathological correlates and Frontiers',
    ],
  },
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

/** Pick the deepest tier whose content exists and is <= current level. */
export function bestDetailFor(part, level) {
  const tiers = ['phd', 'undergrad', 'high', 'middle', 'basic'];
  const allowed = {
    1: ['basic'],
    2: ['middle', 'basic'],
    3: ['high', 'middle', 'basic'],
    4: ['undergrad', 'high', 'middle', 'basic'],
    5: ['phd', 'undergrad', 'high', 'middle', 'basic'],
  }[level];
  for (const t of tiers) {
    if (allowed.includes(t) && part.details?.[t]) return t;
  }
  return 'basic';
}
