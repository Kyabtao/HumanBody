/**
 * anatomy.js — the measurement table behind the figure.
 *
 * Everything that makes the body look like a body lives here: the stacked
 * cross-sections of the torso, the profiles of the limbs, the skull, and the
 * skin palette. The 3D model lofts these sections into smooth surfaces and the
 * 2D plate projects them, so the picture and the model share one skeleton of
 * numbers and can never drift apart.
 *
 * Units are metres, y is up, +Z is the front of the body, +X is the body's own
 * left. Landmarks come from LM in helpers.js.
 */

/* ------------------------------------------------------------------ *
 * Skin tones. A handful of believable complexions so the atlas is not
 * stuck with one "default human".
 * ------------------------------------------------------------------ */
export const SKIN_TONES = [
  { id: 'porcelain', name: 'Porcelain', base: '#efd2bb', shade: '#dcae94', deep: '#c68f74', lips: '#c97b78', palm: '#f3ddd0' },
  { id: 'light', name: 'Light', base: '#e8b98f', shade: '#d09b6e', deep: '#b87e53', lips: '#bc6a63', palm: '#eecdb2' },
  { id: 'olive', name: 'Olive', base: '#d9a173', shade: '#bd8256', deep: '#a06a44', lips: '#a85f52', palm: '#e2b893' },
  { id: 'brown', name: 'Brown', base: '#b0764f', shade: '#945f3c', deep: '#7a4c2f', lips: '#8e4f43', palm: '#bd8b67' },
  { id: 'deep', name: 'Deep brown', base: '#7c4f34', shade: '#653e27', deep: '#503121', lips: '#71412f', palm: '#8b6046' },
];

export const DEFAULT_TONE = 'light';

/* ------------------------------------------------------------------ *
 * Proportions. Classical canon: 8 heads tall, the narrowest waist at
 * about 0.62 × the shoulder breadth for the female figure and 0.72 ×
 * for the male figure, the greatest hip width at the trochanters.
 * ------------------------------------------------------------------ */
export const PROPORTIONS = {
  female: {
    shoulder: 1.0, // reference multipliers, applied to the master table below
    chest: 1.0,
    waist: 0.9,
    hip: 1.08,
    bust: 1.0,
    muscle: 0.92,
    limb: 0.95,
    neck: 0.94,
  },
  male: {
    shoulder: 1.12,
    chest: 1.08,
    waist: 1.0,
    hip: 0.94,
    bust: 0.22,
    muscle: 1.16,
    limb: 1.06,
    neck: 1.1,
  },
};

/**
 * Trunk: one smooth sweep from the gluteal fold up to the base of the neck.
 * Each row is [y, halfWidth, frontDepth, backDepth, exponent].
 * The exponent bends the ellipse into a body: 2 is round, ~2.4 gives the
 * flatter abdominal wall and the broad, shallow back.
 */
export const TRUNK_SECTIONS = [
  [-0.200, 0.108, 0.082, 0.104, 2.15],
  [-0.160, 0.132, 0.096, 0.118, 2.2],
  [-0.115, 0.150, 0.102, 0.122, 2.2],
  [-0.070, 0.156, 0.099, 0.109, 2.15],
  [-0.025, 0.150, 0.096, 0.097, 2.1],
  [0.015, 0.147, 0.098, 0.090, 2.05],
  [0.060, 0.135, 0.100, 0.085, 2.0],
  [0.100, 0.126, 0.101, 0.082, 2.0],
  [0.140, 0.121, 0.100, 0.081, 2.0],
  [0.180, 0.126, 0.101, 0.084, 2.0],
  [0.225, 0.134, 0.104, 0.088, 2.0],
  [0.270, 0.142, 0.107, 0.091, 2.0],
  [0.320, 0.148, 0.109, 0.093, 2.0],
  [0.370, 0.152, 0.111, 0.094, 2.0],
  [0.415, 0.153, 0.112, 0.092, 2.0],
  [0.455, 0.151, 0.109, 0.089, 2.05],
  [0.495, 0.150, 0.104, 0.086, 2.1],
  [0.530, 0.153, 0.098, 0.083, 2.15],
  [0.565, 0.147, 0.092, 0.080, 2.2],
  [0.600, 0.143, 0.085, 0.076, 2.25],
  [0.630, 0.122, 0.076, 0.070, 2.35],
  [0.655, 0.101, 0.068, 0.064, 2.45],
  [0.678, 0.078, 0.062, 0.060, 2.55],
];

/** Which rows of TRUNK_SECTIONS belong to which clickable region. */
export const TRUNK_BANDS = [
  { part: 'hip', from: -0.205, to: 0.030 },
  { part: 'abdomen', from: 0.020, to: 0.290 },
  { part: 'chest', from: 0.280, to: 0.520 },
  { part: 'shoulder', from: 0.500, to: 0.678 },
];

/** The posterior half of the trunk reads as "back" when you click it. */
export const BACK_BAND = { part: 'back', from: 0.020, to: 0.560 };

/** Neck: slight flare at the trapezius, narrower at the larynx, jaw above. */
export const NECK_SECTIONS = [
  [0.640, 0.062, 0.058, 0.060, 2.3],
  [0.665, 0.056, 0.053, 0.056, 2.2],
  [0.695, 0.049, 0.049, 0.052, 2.1],
  [0.720, 0.047, 0.048, 0.051, 2.1],
  [0.745, 0.046, 0.047, 0.050, 2.1],
  [0.762, 0.046, 0.047, 0.050, 2.1],
];

/**
 * Skull + face. The front of the head is not a ball: brow, cheekbone and jaw
 * carry the width while the occiput sits behind, so every row has its own
 * front and back depth.
 */
export const HEAD_SECTIONS = [
  [0.708, 0.044, 0.040, 0.046, 2.2], // under the jaw
  [0.724, 0.058, 0.052, 0.058, 2.15], // chin / jaw hinge
  [0.742, 0.070, 0.062, 0.068, 2.1], // jawline, masseter
  [0.762, 0.079, 0.072, 0.078, 2.05], // mouth / cheeks
  [0.782, 0.083, 0.079, 0.086, 2.0], // cheekbones
  [0.802, 0.082, 0.082, 0.090, 2.0], // eye level, widest
  [0.822, 0.080, 0.081, 0.090, 2.0], // brow
  [0.845, 0.077, 0.078, 0.087, 2.05], // forehead
  [0.868, 0.070, 0.071, 0.081, 2.15], // coronal
  [0.888, 0.056, 0.057, 0.066, 2.3],
  [0.903, 0.036, 0.037, 0.043, 2.5],
  [0.912, 0.014, 0.014, 0.017, 2.8],
];

/** Crown sits at 0.912 so the figure measures ≈1.81 m with the hair. */
export const HEAD_CENTER_Z = -0.004;

/* ------------------------------------------------------------------ *
 * Limbs. Profile tables for limbLoft: [t, halfWidth, frontBack, exponent].
 * The bulges are the anatomy: deltoid cap, biceps belly, the two heads of
 * the gastrocnemius, the narrow achilles, the wrist.
 * ------------------------------------------------------------------ */
export const LIMB_PROFILES = {
  // shoulder → elbow: round deltoid shelf, muscle belly, narrow above the elbow
  arm: [
    [0.00, 0.058, 0.056, 2.0],
    [0.10, 0.055, 0.054, 2.0],
    [0.28, 0.052, 0.051, 2.0],
    [0.42, 0.050, 0.049, 2.0],
    [0.62, 0.045, 0.044, 2.0],
    [0.82, 0.040, 0.039, 2.0],
    [1.00, 0.038, 0.037, 2.05],
  ],
  // elbow → wrist: fleshy proximal forearm, thin wrist
  forearm: [
    [0.00, 0.041, 0.040, 2.05],
    [0.12, 0.040, 0.039, 2.0],
    [0.32, 0.036, 0.035, 2.0],
    [0.55, 0.031, 0.030, 2.0],
    [0.78, 0.026, 0.025, 2.0],
    [0.92, 0.023, 0.022, 2.05],
    [1.00, 0.022, 0.021, 2.1],
  ],
  // hip → knee: broad thigh that tapers to the knee
  thigh: [
    [0.00, 0.086, 0.082, 2.0],
    [0.12, 0.084, 0.081, 2.0],
    [0.30, 0.077, 0.075, 2.0],
    [0.50, 0.068, 0.067, 2.0],
    [0.70, 0.059, 0.058, 2.0],
    [0.86, 0.052, 0.052, 2.0],
    [1.00, 0.048, 0.048, 2.05],
  ],
  // knee → ankle: calf belly high on the back, slim ankle
  leg: [
    [0.00, 0.052, 0.050, 2.05],
    [0.10, 0.055, 0.056, 2.0],
    [0.24, 0.053, 0.061, 2.0],
    [0.40, 0.047, 0.053, 2.0],
    [0.58, 0.039, 0.043, 2.0],
    [0.76, 0.031, 0.033, 2.0],
    [0.90, 0.026, 0.027, 2.05],
    [1.00, 0.024, 0.025, 2.1],
  ],
};

/** Hand: a flat, slightly cupped palm with the thenar eminence at the thumb. */
export const PALM_PROFILE = [
  [0.00, 0.023, 0.020, 2.4],
  [0.25, 0.026, 0.018, 2.6],
  [0.6, 0.027, 0.016, 2.8],
  [0.85, 0.026, 0.014, 2.9],
  [1.00, 0.023, 0.012, 3.0],
];

/** Finger lengths relative to the middle finger (index ≈ 0.94 … V ≈ 0.76). */
export const FINGER_LENGTHS = [0.90, 1.0, 0.95, 0.80];

/* ------------------------------------------------------------------ *
 * Region palette for the surface system. The tones are close but not
 * identical, which is what real skin does over bone and muscle.
 * ------------------------------------------------------------------ */
export function surfaceColors(tone = SKIN_TONES[1]) {
  return {
    torso: tone.base,
    front: tone.base,
    back: tone.shade,
    limb: tone.base,
    palm: tone.palm,
    sole: tone.palm,
    lips: tone.lips,
    areola: tone.deep,
    ear: tone.shade,
    nose: tone.base,
    scalp: tone.deep,
  };
}

/** Turn a table row into a loft section object. */
export function sectionFromRow(row, opts = {}) {
  const [y, rx, rz, rzb, exp] = row;
  const s = opts.scale ?? 1;
  return {
    x: (opts.x ?? 0) + (opts.dx ?? 0) * s,
    y,
    z: (opts.z ?? 0) + (opts.dz ?? 0) * s,
    rx: rx * s,
    rz: rz * s,
    rzb: rzb * s,
    exp,
    twist: opts.twist ?? 0,
  };
}

/** Linear look-up over [y, value] stops, clamped at both ends. */
function lookUp(stops, y) {
  if (y <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (y >= last[0]) return last[1];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (y >= a[0] && y <= b[0]) {
      const k = (y - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * k;
    }
  }
  return last[1];
}

/**
 * Reshape the trunk tables for a body type. Widths are keyed to anatomical
 * landmarks (iliac crest, narrowest waist, ribcage, shoulder girdle) so the
 * female figure keeps a pinched waist and a wider pelvis while the male
 * figure gets a V-taper: broad shoulders over a straighter trunk. Nothing
 * slides along y, so the skin stays locked to the bones and organs.
 */
export function trunkSections(p) {
  const widthStops = [
    [-0.24, p.hip * 0.98],
    [-0.06, p.hip],
    [0.03, p.hip * 0.97],
    [0.14, p.waist],
    [0.30, (p.waist + p.chest) / 2],
    [0.44, p.chest],
    [0.53, p.chest * 1.01],
    [0.60, p.shoulder * 0.94],
    [0.68, p.shoulder * 0.86],
  ];
  const depthStops = [
    [-0.24, (p.hip + p.waist) / 2],
    [-0.06, p.hip],
    [0.14, p.waist],
    [0.42, p.chest],
    [0.60, p.shoulder * 0.95],
  ];
  return TRUNK_SECTIONS.map(([y, rx, rz, rzb, exp]) => {
    const w = lookUp(widthStops, y);
    const d = lookUp(depthStops, y);
    // breasts are drawn as their own teardrops; the chest wall only deepens a little
    const bust = p.bust * 0.014 * Math.exp(-Math.pow((y - 0.415) / 0.10, 2));
    return [y, rx * w, rz * d + bust, rzb * d, exp];
  });
}

/** Reshape the head/neck tables: a thicker neck and jaw for the male figure. */
export function headNeckSections(p) {
  const neckScale = [
    [0.64, 0.9 + p.neck * 0.12],
    [0.70, 0.92 + p.neck * 0.1],
    [0.762, 0.94 + p.neck * 0.08],
  ];
  const neck = NECK_SECTIONS.map(([y, rx, rz, rzb, exp]) => {
    const k = lookUp(neckScale, y);
    return [y, rx * k, rz * k, rzb * k, exp];
  });
  const jaw = 0.94 + p.muscle * 0.07;
  const head = HEAD_SECTIONS.map(([y, rx, rz, rzb, exp]) => {
    // widen the jaw and brow a touch on a more muscular build, leave the cranium
    const jawWeight = Math.exp(-Math.pow((y - 0.75) / 0.05, 2));
    const k = 1 + (jaw - 1) * jawWeight;
    return [y, rx * k, rz * (1 + (k - 1) * 0.6), rzb, exp];
  });
  return { head, neck };
}

/** Limb radii for a body type: muscle bulk fattens the belly, not the wrist. */
export function limbProfile(stops, p) {
  return stops.map(([t, rx, rz, exp]) => {
    const belly = Math.sin(Math.PI * Math.min(1, t * 1.15));
    const k = 1 + (p.muscle - 1) * 0.55 * belly + (p.limb - 1) * 0.8;
    return [t, rx * k, rz * k, exp];
  });
}
