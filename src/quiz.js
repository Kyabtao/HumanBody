import { ALL_PARTS, SYSTEMS, SYSTEM_BY_ID, partsForLevel } from './data/index.js';
import { bestDetailFor } from './data/levels.js';

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TIER_LABEL = {
  basic: 'simple terms',
  middle: 'school level',
  high: 'senior school',
  undergrad: 'undergraduate',
  phd: 'MD / PhD',
};

function clueFor(part, level) {
  const tier = bestDetailFor(part, level);
  const text = part.details?.[tier] || part.details?.basic || '';
  // use the first sentence or two as the clue
  const sentences = text.split(/(?<=\.)\s+/);
  let clue = sentences[0];
  if (clue.length < 90 && sentences[1]) clue += ' ' + sentences[1];
  return { clue: clue.replace(/\s+/g, ' ').trim(), tier };
}

function distractors(part, pool, n) {
  const sameSystem = pool.filter((p) => p.system === part.system && p.id !== part.id);
  const others = pool.filter((p) => p.system !== part.system);
  const out = [];
  for (const p of shuffle(sameSystem)) {
    if (out.length >= n) break;
    out.push(p);
  }
  for (const p of shuffle(others)) {
    if (out.length >= n) break;
    out.push(p);
  }
  return out.slice(0, n);
}

/**
 * Build a question set for the given level, optionally narrowed to one system
 * or to one node of the body-part tree (`partIds`).
 */
export function makeQuestions({ level = 2, systemId = null, partIds = null, count = 8 } = {}) {
  let pool = partsForLevel(level);
  if (partIds) {
    const wanted = partIds instanceof Set ? partIds : new Set(partIds);
    const scoped = pool.filter((p) => wanted.has(p.id));
    if (scoped.length >= 4) pool = scoped;
  } else if (systemId) {
    const scoped = pool.filter((p) => p.system === systemId);
    if (scoped.length >= 4) pool = scoped;
  }
  if (pool.length < 4) pool = partsForLevel(level);

  const questions = [];
  const used = new Set();
  const kinds = ['description', 'system', 'latin'];
  if (level >= 3) kinds.push('description');
  if (level >= 4) kinds.push('system');

  for (let i = 0; i < count; i++) {
    const kind = kinds[i % kinds.length];
    let q = null;
    for (let attempt = 0; attempt < 8 && !q; attempt++) {
      const part = pick(pool);
      if (used.has(part.id + kind)) continue;
      used.add(part.id + kind);
      q = buildQuestion(kind, part, pool, level);
    }
    if (q) questions.push(q);
  }
  return questions;
}

function buildQuestion(kind, part, pool, level) {
  if (kind === 'system') {
    const sys = SYSTEM_BY_ID[part.system];
    const opts = shuffle([sys, ...shuffle(SYSTEMS.filter((s) => s.id !== part.system)).slice(0, 3)]);
    return {
      kind: 'system',
      prompt: `Which body system includes the <b>${part.name}</b>?`,
      options: opts.map((s) => `${s.icon || ''} ${s.name}`.trim()),
      answer: opts.findIndex((s) => s.id === part.system),
      part,
    };
  }
  if (kind === 'latin') {
    const others = distractors(part, pool.filter((p) => p.latin), 3);
    if (others.length < 3) return null;
    const opts = shuffle([part, ...others]);
    return {
      kind: 'latin',
      prompt: `What is the anatomical (Latin) name of the <b>${part.name}</b>?`,
      options: opts.map((p) => p.latin || '—'),
      answer: opts.findIndex((p) => p.id === part.id),
      part,
    };
  }
  // description
  const { clue, tier } = clueFor(part, level);
  const others = distractors(part, pool, 3);
  if (others.length < 3) return null;
  const opts = shuffle([part, ...others]);
  return {
    kind: 'description',
    prompt: `<span class="q-note">Clue written in ${TIER_LABEL[tier]}:</span> ${clue}`,
    options: opts.map((p) => p.name),
    answer: opts.findIndex((p) => p.id === part.id),
    part,
    tier,
  };
}

export { shuffle };
export default makeQuestions;
