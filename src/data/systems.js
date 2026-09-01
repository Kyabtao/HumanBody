/**
 * The eleven organ systems (+ surface regions and the microscopic world).
 * `color` drives the 3D material tint so every system reads as one visual family.
 */
export const SYSTEMS = [
  {
    id: 'surface',
    name: 'Body Surface & Regions',
    icon: '🧍',
    color: '#e8b98f',
    accent: '#f6d7b0',
    summary:
      'The outside of the body: the regions we can see and touch, and the landmarks clinicians use to describe them.',
  },
  {
    id: 'skeletal',
    name: 'Skeletal System',
    icon: '🦴',
    color: '#e9e6dc',
    accent: '#fbf8f0',
    summary:
      '206 bones, cartilage and joints: the living scaffold that supports, protects, moves, makes blood and stores minerals.',
  },
  {
    id: 'muscular',
    name: 'Muscular System',
    icon: '💪',
    color: '#c2503f',
    accent: '#e07b64',
    summary:
      'Over 600 skeletal muscles plus cardiac and smooth muscle: the engines that turn chemical energy into movement and heat.',
  },
  {
    id: 'nervous',
    name: 'Nervous System',
    icon: '🧠',
    color: '#d7c78a',
    accent: '#f0e3ac',
    summary:
      'Brain, spinal cord, nerves and glia: the wiring that senses, decides, remembers and commands.',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular System',
    icon: '❤️',
    color: '#d6413c',
    accent: '#f2726c',
    summary:
      'Heart, blood and about 100,000 km of vessels: the transport network that delivers oxygen, fuel, hormones and immunity.',
  },
  {
    id: 'respiratory',
    name: 'Respiratory System',
    icon: '🫁',
    color: '#e2969a',
    accent: '#f7c3c6',
    summary:
      'Nose to alveoli: the gas-exchange plant that loads oxygen into blood and unloads carbon dioxide.',
  },
  {
    id: 'digestive',
    name: 'Digestive System',
    icon: '🍽️',
    color: '#c98a4b',
    accent: '#e8b078',
    summary:
      'A 9-metre tube plus liver, pancreas and gallbladder: it breaks food into molecules small enough to absorb.',
  },
  {
    id: 'urinary',
    name: 'Urinary System',
    icon: '💧',
    color: '#7fa8c9',
    accent: '#a9c9e2',
    summary:
      'Kidneys, ureters, bladder and urethra: the filtration plant that sets the composition of your internal sea.',
  },
  {
    id: 'endocrine',
    name: 'Endocrine System',
    icon: '🧬',
    color: '#b98ac9',
    accent: '#d9b4e4',
    summary:
      'Ductless glands releasing hormones into blood: slow, powerful, long-lasting chemical coordination.',
  },
  {
    id: 'lymphatic',
    name: 'Lymphatic & Immune System',
    icon: '🛡️',
    color: '#8fbf9a',
    accent: '#b8ddc0',
    summary:
      'Lymph, nodes, spleen, thymus and white cells: drainage plus the army that remembers every invader.',
  },
  {
    id: 'reproductive',
    name: 'Reproductive System',
    icon: '🌱',
    color: '#d68ba0',
    accent: '#efb2c2',
    summary:
      'Gonads, ducts and supporting organs: the system that makes gametes, hormones and new humans.',
  },
  {
    id: 'integumentary',
    name: 'Integumentary System',
    icon: '🧴',
    color: '#e0a882',
    accent: '#f3c9a6',
    summary:
      'Skin, hair, nails and glands: a 2 m² waterproof, self-repairing, sensing, immune-active organ.',
  },
  {
    id: 'micro',
    name: 'Cells & Tissues (Microscopic)',
    icon: '🔬',
    color: '#9fb4d4',
    accent: '#c6d5ea',
    summary:
      'Zoom past the naked eye: cells, organelles, the four basic tissues, and the molecules that run them.',
  },
];

export const SYSTEM_BY_ID = Object.fromEntries(SYSTEMS.map((s) => [s.id, s]));
