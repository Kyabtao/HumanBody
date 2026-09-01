import { SURFACE_PARTS } from './parts/surface.js';
import { SKELETAL_PARTS } from './parts/skeletal.js';
import { MUSCULAR_PARTS } from './parts/muscular.js';
import { NERVOUS_PARTS } from './parts/nervous.js';
import { CARDIOVASCULAR_PARTS } from './parts/cardiovascular.js';
import { RESPIRATORY_PARTS } from './parts/respiratory.js';
import { DIGESTIVE_PARTS } from './parts/digestive.js';
import { URINARY_PARTS } from './parts/urinary.js';
import { ENDOCRINE_PARTS } from './parts/endocrine.js';
import { LYMPHATIC_PARTS } from './parts/lymphatic.js';
import { REPRODUCTIVE_PARTS } from './parts/reproductive.js';
import { INTEGUMENTARY_PARTS } from './parts/integumentary.js';
import { MICRO_PARTS } from './parts/micro.js';
import { SYSTEMS, SYSTEM_BY_ID } from './systems.js';

export { SYSTEMS, SYSTEM_BY_ID };

export const ALL_PARTS = [
  ...SURFACE_PARTS,
  ...SKELETAL_PARTS,
  ...MUSCULAR_PARTS,
  ...NERVOUS_PARTS,
  ...CARDIOVASCULAR_PARTS,
  ...RESPIRATORY_PARTS,
  ...DIGESTIVE_PARTS,
  ...URINARY_PARTS,
  ...ENDOCRINE_PARTS,
  ...LYMPHATIC_PARTS,
  ...REPRODUCTIVE_PARTS,
  ...INTEGUMENTARY_PARTS,
  ...MICRO_PARTS,
];

export const PART_BY_ID = Object.fromEntries(ALL_PARTS.map((p) => [p.id, p]));

export function partsForSystem(systemId) {
  return ALL_PARTS.filter((p) => p.system === systemId);
}

/** Parts available at or below a given learning level. */
export function partsForLevel(level) {
  return ALL_PARTS.filter((p) => (p.minLevel ?? 1) <= level);
}

export function systemOf(part) {
  return SYSTEM_BY_ID[part.system];
}

/** Lightweight weighted search over name, latin, tags and body text. */
export function searchParts(query, level = 5) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return ALL_PARTS
    .filter((p) => (p.minLevel ?? 1) <= level)
    .map((p) => {
      const haystacks = [
        { t: p.name.toLowerCase(), w: 10 },
        { t: (p.latin || '').toLowerCase(), w: 6 },
        { t: (p.tags || []).join(' '), w: 3 },
        { t: Object.values(p.details || {}).join(' ').toLowerCase(), w: 1 },
        { t: (p.facts || []).join(' ').toLowerCase(), w: 1 },
      ];
      let score = 0;
      for (const term of terms) {
        let termScore = 0;
        for (const h of haystacks) {
          if (h.t.includes(term)) termScore += h.w;
        }
        if (!termScore) return { p, score: 0 };
        score += termScore;
      }
      if (p.name.toLowerCase().startsWith(q)) score += 15;
      return { p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
    .map((r) => r.p);
}

export const ATLAS_STATS = {
  parts: ALL_PARTS.length,
  systems: Object.keys(SYSTEM_BY_ID).length,
};
