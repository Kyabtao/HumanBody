/**
 * materials.js — skin, hair and nails with procedurally generated maps.
 *
 * Real skin is not one flat colour: it is mottled, it is oilier on the
 * forearms than on the palms, and it has a fine pebbled texture that catches
 * the light. Instead of shipping megabytes of photo textures, the maps are
 * synthesised into a canvas at load time from value-noise, so the figure stays
 * a self-contained file and still reads as skin rather than plastic.
 *
 * Works in Node too (the atlas self-check builds the model headlessly): with no
 * DOM the maps are simply skipped and the flat colour is used.
 */
import * as THREE from 'three';

const canMakeCanvas = typeof document !== 'undefined' && !!document.createElement('canvas').getContext;

/* ---------------- deterministic value noise ---------------- */
function hash2(x, y, seed) {
  let h = x * 374761393 + y * 668265263 + seed * 1442695040;
  h = (h ^ (h >> 13)) >>> 0;
  h = (h * 1274126177) >>> 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

function valueNoise(x, y, period, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = (ix, iy) => hash2(((ix % period) + period) % period, ((iy % period) + period) % period, seed);
  const a = w(xi, yi);
  const b = w(xi + 1, yi);
  const c = w(xi, yi + 1);
  const d = w(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

/** Tileable fbm: the lattice wraps every `freq` cells, so skin has no seam. */
function fbmTile(u, v, freq, octaves, seed) {
  let sum = 0;
  let amp = 0.5;
  let f = freq;
  for (let o = 0; o < octaves; o++) {
    sum += valueNoise(u * f, v * f, f, seed + o * 17) * amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum / 0.9375;
}

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

const mapCache = new Map();

/**
 * Skin map set for a tone: colour mottling + roughness + pore normal.
 * size 384 keeps generation around a frame of work on a laptop.
 */
export function skinMaps(tone, size = 384) {
  const key = `${tone.id}|${size}`;
  if (mapCache.has(key)) return mapCache.get(key);
  if (!canMakeCanvas) {
    mapCache.set(key, {});
    return {};
  }

  const base = new THREE.Color(tone.base);
  const deep = new THREE.Color(tone.deep);
  const shade = new THREE.Color(tone.shade);

  const colorC = makeCanvas(size);
  const roughC = makeCanvas(size);
  const height = new Float32Array(size * size);
  const cImg = colorC.getContext('2d').createImageData(size, size);
  const rImg = roughC.getContext('2d').createImageData(size, size);
  const seed = tone.id.length * 131 + 7;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const u = x / size;
      const v = y / size;
      const blotch = fbmTile(u, v, 3, 4, seed);
      const fine = fbmTile(u, v, 26, 3, seed + 91);
      const pores = fbmTile(u, v, 96, 2, seed + 4001);

      // colour: base tone darkened by the blotch, warmed where blood shows through
      const t = THREE.MathUtils.clamp(0.72 + blotch * 0.55, 0, 1);
      let r = THREE.MathUtils.lerp(shade.r, base.r, t);
      let g = THREE.MathUtils.lerp(shade.g, base.g, t);
      let b = THREE.MathUtils.lerp(shade.b, base.b, t);
      const flush = Math.max(0, fine - 0.55) * 0.16;
      r = THREE.MathUtils.lerp(r, deep.r, 0.18 + flush);
      g = THREE.MathUtils.lerp(g, deep.g, 0.22 + flush * 0.6);
      b = THREE.MathUtils.lerp(b, deep.b, 0.22 + flush * 0.5);
      const pOff = (pores - 0.5) * 0.05;
      const o = i * 4;
      cImg.data[o] = THREE.MathUtils.clamp((r + pOff) * 255, 0, 255);
      cImg.data[o + 1] = THREE.MathUtils.clamp((g + pOff * 0.8) * 255, 0, 255);
      cImg.data[o + 2] = THREE.MathUtils.clamp((b + pOff * 0.7) * 255, 0, 255);
      cImg.data[o + 3] = 255;

      // roughness: skin is matte with waxy shiny patches
      const rough = 0.52 + (fine - 0.5) * 0.34 + (blotch - 0.5) * 0.16;
      const rr = THREE.MathUtils.clamp(rough, 0.18, 0.95) * 255;
      rImg.data[o] = rr;
      rImg.data[o + 1] = rr;
      rImg.data[o + 2] = rr;
      rImg.data[o + 3] = 255;

      height[i] = fine * 0.6 + pores * 0.4;
    }
  }
  colorC.getContext('2d').putImageData(cImg, 0, 0);
  roughC.getContext('2d').putImageData(rImg, 0, 0);

  // normal map straight from the height field
  const normC = makeCanvas(size);
  const nImg = normC.getContext('2d').createImageData(size, size);
  const strength = 2.4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xm = (x + size - 1) % size;
      const xp = (x + 1) % size;
      const ym = (y + size - 1) % size;
      const yp = (y + 1) % size;
      const dx = (height[y * size + xp] - height[y * size + xm]) * strength;
      const dy = (height[yp * size + x] - height[ym * size + x]) * strength;
      let nx = -dx;
      let ny = -dy;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len; ny /= len; nz /= len;
      const o = (y * size + x) * 4;
      nImg.data[o] = (nx * 0.5 + 0.5) * 255;
      nImg.data[o + 1] = (ny * 0.5 + 0.5) * 255;
      nImg.data[o + 2] = (nz * 0.5 + 0.5) * 255;
      nImg.data[o + 3] = 255;
    }
  }
  normC.getContext('2d').putImageData(nImg, 0, 0);

  const tex = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const maps = { map: tex(colorC, true), roughnessMap: tex(roughC, false), normalMap: tex(normC, false) };
  mapCache.set(key, maps);
  return maps;
}

/** How much the skin map is tiled per region (a palm needs more repeats). */
function retile(maps, rx, ry) {
  const clone = {};
  for (const [k, t] of Object.entries(maps)) {
    const c = t.clone();
    c.repeat.set(rx, ry);
    c.needsUpdate = true;
    clone[k] = c;
  }
  return clone;
}

const skinCache = new Map();

/**
 * Skin as a MeshPhysicalMaterial: soft sheen from the fine hairs, a thin
 * clearcoat of oil, and warm light bleeding through the ears and nostrils.
 */
export function skinMaterial(tone, opts = {}) {
  const key = `${tone.id}|${opts.variant ?? ''}|${opts.tint ?? ''}|${opts.retile ?? ''}|${opts.soft ?? 0}`;
  if (skinCache.has(key)) return skinCache.get(key);
  const maps = opts.noMaps ? {} : opts.retile ? retile(skinMaps(tone), ...opts.retile) : skinMaps(tone);
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(opts.tint || tone.base),
    roughness: opts.roughness ?? 0.68,
    metalness: 0,
    map: maps.map ?? null,
    roughnessMap: maps.roughnessMap ?? null,
    normalMap: maps.normalMap ?? null,
    normalScale: new THREE.Vector2(opts.normalScale ?? 0.55, opts.normalScale ?? 0.55),
    clearcoat: opts.clearcoat ?? 0.16,
    clearcoatRoughness: 0.62,
    sheen: opts.soft ? 0.7 : 0.45,
    sheenColor: new THREE.Color('#ffb99e'),
    sheenRoughness: 0.75,
    specularIntensity: 0.42,
    ior: 1.42,
    envMapIntensity: 0.55,
    // thin, well-perfused areas (ears, nostrils, lips) glow faintly from the
    // blood inside them; an emissive hint is far cheaper than real transmission
    emissive: new THREE.Color(opts.soft ? '#6a2317' : '#000000'),
    emissiveIntensity: opts.soft ? 0.16 : 0,
  });
  if (opts.opacity !== undefined && opts.opacity < 1) {
    m.transparent = true;
    m.opacity = opts.opacity;
    m.depthWrite = false;
  }
  skinCache.set(key, m);
  return m;
}

/** Hair: anisotropic, glossy, slightly translucent at the tips. */
export function hairMaterial(color = '#4a3227') {
  const key = `hair|${color}`;
  if (skinCache.has(key)) return skinCache.get(key);
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.34,
    metalness: 0.04,
    clearcoat: 0.75,
    clearcoatRoughness: 0.28,
    sheen: 0.9,
    sheenColor: new THREE.Color('#d9b9a2'),
    sheenRoughness: 0.4,
    anisotropy: 0.6,
    envMapIntensity: 0.9,
  });
  skinCache.set(key, m);
  return m;
}

/** Nails: keratin plate — hard, pale, a little glossy. */
export function nailMaterial(color = '#f0d7c6') {
  const key = `nail|${color}`;
  if (skinCache.has(key)) return skinCache.get(key);
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.22,
    metalness: 0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    envMapIntensity: 0.9,
  });
  skinCache.set(key, m);
  return m;
}

/** Lips: mucosa — wet, no hair follicles, visibly redder than surrounding skin. */
export function lipMaterial(tone) {
  const key = `lip|${tone.id}`;
  if (skinCache.has(key)) return skinCache.get(key);
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tone.lips),
    roughness: 0.36,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.3,
    sheen: 0.35,
    sheenColor: new THREE.Color('#ffc8b5'),
    envMapIntensity: 0.8,
  });
  skinCache.set(key, m);
  return m;
}
