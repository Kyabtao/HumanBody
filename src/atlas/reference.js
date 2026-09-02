/**
 * Licensed, source-authentic 2D anatomy plates.
 *
 * These are intentionally separate from the SVG projection mode. The latter
 * remains interactive and derives paths from the live teaching fallback mesh;
 * this mode shows a real medical illustration with its own clear attribution.
 * Full notices: ATTRIBUTION.md.
 */
export const REFERENCE_PLATES = {
  overview: {
    id: 'overview',
    src: './atlas/reference/clinical-overview.png',
    title: 'Clinical whole-body overview',
    description: 'Major organs, skeleton and body systems in one medical illustration.',
    attribution: 'Courtesy of NIAID · Ryan Kissinger · public domain',
    license: 'Public domain (U.S. federal work)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Human_Anatomy_(NIH_BioArt_519_-_657942).png',
    sourceLabel: 'NIAID BioArt / Wikimedia Commons',
  },
  skeletal: {
    id: 'skeletal',
    src: './atlas/reference/skeleton-front.png',
    title: 'Human skeleton — anterior',
    description: 'Whole-body skeletal reference diagram.',
    attribution: 'Database Center for Life Science (DBCLS)',
    license: 'CC BY 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:201805_human_skeleton.svg',
    sourceLabel: 'DBCLS / Wikimedia Commons',
  },
  muscular: {
    id: 'muscular',
    src: './atlas/reference/muscular-anterior.png',
    title: 'Superficial muscles — anterior',
    description: 'Whole-body anatomical muscle illustration.',
    attribution: 'Mikael Häggström; based on Gray’s Anatomy (1918)',
    license: 'Public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Muscles_anterior.png',
    sourceLabel: 'Wikimedia Commons source',
  },
};

/** Choose the most useful authentic 2D reference for the current layer. */
export function referencePlateFor({ activeSystem = null, selectedSystem = null, visibleSystems = new Set() } = {}) {
  const system = activeSystem || selectedSystem || (visibleSystems.size === 1 ? [...visibleSystems][0] : null);
  if (system === 'skeletal') return REFERENCE_PLATES.skeletal;
  if (system === 'muscular') return REFERENCE_PLATES.muscular;
  return REFERENCE_PLATES.overview;
}

export default REFERENCE_PLATES;
