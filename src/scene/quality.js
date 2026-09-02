/**
 * quality.js — one place that decides how hard we are allowed to push the GPU.
 *
 * A phone has to draw the same body as a workstation, on a battery, through a
 * tile-based GPU that hates big shadow maps and full-screen passes. Rather than
 * shipping a "low quality" build, the atlas measures the device once at boot and
 * picks a tier; every expensive feature (shadow resolution, post-processing,
 * texture size, pixel ratio) reads its budget from here.
 */

let cached = null;

function detectCoarsePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

function detectSmallScreen() {
  if (typeof window === 'undefined') return false;
  const w = Math.min(window.innerWidth, window.innerHeight);
  return w <= 820;
}

function detectMobileUA() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|Opera Mini/i.test(navigator.userAgent || '');
}

/**
 * Tier:
 *   'high'   — desktop / laptop with a real GPU: shadows, post-processing, big maps
 *   'medium' — tablets, small laptops, mobile flagships: shadows, no post
 *   'low'    — phones and anything reporting few cores / little memory
 */
export function deviceProfile() {
  if (cached) return cached;

  const touch = detectCoarsePointer() || detectMobileUA();
  const small = detectSmallScreen();
  const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
  const memory = (typeof navigator !== 'undefined' && navigator.deviceMemory) || 4;
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  let tier = 'high';
  if (touch || small) tier = 'medium';
  if ((touch && (cores <= 4 || memory <= 4)) || cores <= 2 || memory <= 2) tier = 'low';

  const profile = {
    tier,
    touch,
    small,
    mobile: touch || small,
    reducedMotion,
    // rendering budget
    maxPixelRatio: tier === 'high' ? 2 : tier === 'medium' ? Math.min(dpr, 1.75) : 1.35,
    shadows: tier !== 'low',
    shadowMapSize: tier === 'high' ? 2048 : 1024,
    softShadows: tier === 'high',
    postProcessing: tier === 'high',
    envResolution: tier === 'high' ? 0.04 : 0.08,
    // texture budget for the procedural skin maps
    skinMapSize: tier === 'high' ? 768 : tier === 'medium' ? 512 : 256,
    anisotropy: tier === 'high' ? 8 : 4,
    // geometry budget: a scale applied to segment counts in the builders
    detail: tier === 'high' ? 1 : tier === 'medium' ? 0.8 : 0.62,
  };

  cached = profile;
  return profile;
}

export default deviceProfile;
