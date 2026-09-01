/**
 * plate.js — the 2D atlas plate.
 *
 * A flat anatomical illustration rendered *from* the 3D model instead of
 * beside it: every mesh of every visible system is projected onto a view
 * plane, the camera-facing patches are traced into outlines and filled with
 * the material colour, shaded by how the surface faces the light. The picture
 * therefore can never disagree with the model, it scales to any size without
 * blurring, it stays a few tens of kilobytes, and every path carries its part
 * id — so the plate is as clickable as the 3D view.
 */
import * as THREE from 'three';
import { PART_BY_ID } from '../data/index.js';

const V3 = new THREE.Vector3();
const LIGHT = new THREE.Vector3(0.42, 0.78, 0.46).normalize();

/**
 * View planes. `sign` says which side of the body the camera is on, and also
 * mirrors the drawing so the anatomical left still reads on the left.
 */
export const PLATE_VIEWS = {
  front: { label: 'Anterior view', axis: 'z', sign: 1, name: 'front' },
  back: { label: 'Posterior view', axis: 'z', sign: -1, name: 'back' },
  left: { label: 'Left lateral', axis: 'x', sign: 1, name: 'left' },
  right: { label: 'Right lateral', axis: 'x', sign: -1, name: 'right' },
};

const Q = 1e-4; // 0.1 mm grid, used to weld duplicated vertices
const quant = (v) => Math.round(v / Q);
const f = (n) => (Math.round(n * 1000) / 1000).toString();

function meshSilhouettes(mesh, view, hemi) {
  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  if (!pos || pos.count < 3) return [];
  mesh.updateWorldMatrix(true, false);
  const mat = mesh.matrixWorld;

  const n = pos.count;
  const wx = new Float64Array(n);
  const wy = new Float64Array(n);
  const wz = new Float64Array(n);
  const px = new Float64Array(n);
  const py = new Float64Array(n);
  const dp = new Float64Array(n);
  const ids = new Int32Array(n);
  const firstOf = new Int32Array(n).fill(-1);
  const weld = new Map();

  for (let i = 0; i < n; i++) {
    V3.fromBufferAttribute(pos, i).applyMatrix4(mat);
    wx[i] = V3.x;
    wy[i] = V3.y;
    wz[i] = V3.z;
    if (view.axis === 'z') {
      px[i] = V3.x * view.sign;
      py[i] = V3.y;
      dp[i] = -V3.z * view.sign;
    } else if (view.axis === 'x') {
      px[i] = -V3.z * view.sign;
      py[i] = V3.y;
      dp[i] = -V3.x * view.sign;
    } else {
      px[i] = V3.x;
      py[i] = V3.z * view.sign;
      dp[i] = -V3.y;
    }
    const key = `${quant(wx[i])}|${quant(wy[i])}|${quant(wz[i])}`;
    let id = weld.get(key);
    if (id === undefined) {
      id = weld.size;
      weld.set(key, id);
      firstOf[id] = i;
    }
    ids[i] = id;
  }

  const triCount = Math.floor((geo.index ? geo.index.count : n) / 3);
  const at = (t, c) => (geo.index ? geo.index.getX(t * 3 + c) : t * 3 + c);
  const edges = new Map();
  const GRAZE = -0.06; // facets a past grazing stay: the one on the silhouette has n ≈ 0
  for (let t = 0; t < triCount; t++) {
    const i0 = at(t, 0);
    const i1 = at(t, 1);
    const i2 = at(t, 2);
    const ux = wx[i1] - wx[i0];
    const uy = wy[i1] - wy[i0];
    const uz = wz[i1] - wz[i0];
    const vx = wx[i2] - wx[i0];
    const vy = wy[i2] - wy[i0];
    const vz = wz[i2] - wz[i0];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz);
    if (len < 1e-14) continue;
    nx /= len; ny /= len; nz /= len;
    if (view.axis === 'z' ? nz * view.sign <= GRAZE : view.axis === 'x' ? nx * view.sign <= GRAZE : ny <= GRAZE) continue;
    if (hemi) {
      const d =
        view.axis === 'z' ? ((wz[i0] + wz[i1] + wz[i2]) / 3) * view.sign
        : view.axis === 'x' ? ((wx[i0] + wx[i1] + wx[i2]) / 3) * view.sign
        : (wy[i0] + wy[i1] + wy[i2]) / 3;
      if (d < -0.02) continue;
    }
    for (let c = 0; c < 3; c++) {
      const a = ids[at(t, c)];
      const b = ids[at(t, (c + 1) % 3)];
      if (a === b) continue;
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      let e = edges.get(key);
      if (!e) {
        e = { a: Math.min(a, b), b: Math.max(a, b), count: 0, nx: 0, ny: 0, nz: 0, depth: 0 };
        edges.set(key, e);
      }
      e.count++;
      e.nx += nx;
      e.ny += ny;
      e.nz += nz;
      e.depth += (dp[i0] + dp[i1] + dp[i2]) / 3;
    }
  }

  const boundary = [];
  const adj = new Map();
  for (const e of edges.values()) {
    if (e.count !== 1) continue; // interior edge of the camera-facing set
    boundary.push(e);
    if (!adj.has(e.a)) adj.set(e.a, []);
    if (!adj.has(e.b)) adj.set(e.b, []);
    adj.get(e.a).push(e);
    adj.get(e.b).push(e);
  }
  if (!boundary.length) return [];

  const used = new Set();
  const out = [];
  for (const seed of boundary) {
    if (used.has(seed)) continue;
    const pts = [];
    const normals = [0, 0, 0];
    let depth = 0;
    let cur = seed;
    let from = seed.a;
    let guard = 0;
    while (cur && !used.has(cur) && guard++ < 6000) {
      used.add(cur);
      const to = cur.a === from ? cur.b : cur.a;
      const v = firstOf[to];
      const u = firstOf[from];
      pts.push([px[v], py[v]]);
      normals[0] += cur.nx;
      normals[1] += cur.ny;
      normals[2] += cur.nz;
      depth += cur.depth / cur.count;
      const dirx = px[v] - px[u];
      const diry = py[v] - py[u];
      const dl = Math.hypot(dirx, diry) || 1;
      let best = null;
      let bestScore = -1.1;
      for (const cand of adj.get(to) || []) {
        if (used.has(cand)) continue;
        const other = cand.a === to ? cand.b : cand.a;
        const ox = px[firstOf[other]] - px[v];
        const oy = py[firstOf[other]] - py[v];
        const ol = Math.hypot(ox, oy) || 1;
        const score = (ox / ol) * (dirx / dl) + (oy / ol) * (diry / dl);
        if (score > bestScore) {
          bestScore = score;
          best = { e: cand, from: to };
        }
      }
      if (!best) break;
      cur = best.e;
      from = best.from;
      if (cur === seed) break;
    }
    if (pts.length < 3) continue;
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    area = Math.abs(area / 2);
    if (!area) continue;
    out.push({ pts, nx: normals[0], ny: normals[1], nz: normals[2], depth: depth / pts.length, area });
  }
  return out;
}
/**
 * Project a set of meshes into plate regions.
 * @param {object} human humanoid (uses human.allMeshes)
 * @param {object} opts  { view, isVisible, hemi, minArea }
 * @returns {{ regions: Array, box: object, view: string }}
 */
export function buildPlate(human, opts = {}) {
  const { view = 'front', isVisible = () => true, hemi = true, minArea = 1.4e-4 } = opts;
  const v = PLATE_VIEWS[view] ?? PLATE_VIEWS.front;
  const regions = [];

  for (const mesh of human.allMeshes) {
    // microscopic / histology specimens are scaled models of a *sample*, not
    // anatomy in place, so they have no silhouette to contribute to a plate
    if (mesh.userData.system === 'micro' || mesh.userData.system === 'histology') continue;
    if (!isVisible(mesh)) continue;
    if (!mesh.visible) continue;
    const base = mesh.userData.baseMaterial || mesh.material;
    const color = base && base.color ? `#${base.color.getHexString()}` : '#c9a889';
    const rawOpacity = base ? (base.opacity ?? 1) : 1;
    const transparent = Boolean(base && (base.transparent || rawOpacity < 1));
    for (const patch of meshSilhouettes(mesh, v, hemi)) {
      if (patch.area < minArea) continue;
      const len = Math.hypot(patch.nx, patch.ny, patch.nz) || 1;
      const nx = patch.nx / len;
      const ny = patch.ny / len;
      const nz = patch.nz / len;
      const lambert = nx * LIGHT.x + ny * LIGHT.y + nz * LIGHT.z;
      const facing = v.axis === 'z' ? nz * v.sign : v.axis === 'x' ? nx * v.sign : ny;
      const rim = THREE.MathUtils.clamp((facing - 0.03) * 1.7, 0, 1);
      regions.push({
        d: smoothLoop(patch.pts),
        pts: patch.pts,
        partId: mesh.userData.partId,
        system: mesh.userData.system,
        fill: shade(color, lambert, rim),
        alpha:
          (transparent
            ? THREE.MathUtils.clamp(rawOpacity, 0.05, 0.92) // a see-through layer reads as it does in 3D
            : v.axis === 'z' && mesh.userData.system === 'surface'
              ? 1
              : 0.94) * (0.7 + 0.3 * rim),
        edge: 0.35 + 0.55 * rim,
        depth: patch.depth,
        centroid: centroid(patch.pts),
      });
    }
  }

  regions.sort((a, b) => a.depth - b.depth); // far first: nearer regions paint over them
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of regions) {
    for (const p of r.pts) {
      if (p[0] < x0) x0 = p[0];
      if (p[0] > x1) x1 = p[0];
      if (p[1] < y0) y0 = p[1];
      if (p[1] > y1) y1 = p[1];
    }
  }
  if (!isFinite(x0)) {
    x0 = -0.3; y0 = -0.9; x1 = 0.3; y1 = 0.95;
  }
  return { regions, box: { x0, y0, x1, y1 }, view: v.label, viewKey: v.name };
}

function centroid(pts) {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
  }
  return [x / pts.length, y / pts.length];
}

/** Turn a polygon into a flowing closed curve: quadratics through midpoints. */
function smoothLoop(pts) {
  const n = pts.length;
  if (n < 3) return '';
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = '';
  const m0 = mid(pts[n - 1], pts[0]);
  d += `M${f(m0[0])} ${f(m0[1])}`;
  for (let i = 0; i < n; i++) {
    const cur = pts[i];
    const nxt = pts[(i + 1) % n];
    const m = mid(cur, nxt);
    d += `Q${f(cur[0])} ${f(cur[1])} ${f(m[0])} ${f(m[1])}`;
  }
  return `${d}Z`;
}

/**
 * Keep the hue of the structure and move its lightness with the light, so the
 * plate still says "bone" or "muscle" at a glance.
 */
function shade(hex, lambert, rim) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  const lit = THREE.MathUtils.clamp(0.6 + 0.66 * THREE.MathUtils.clamp(lambert, 0, 1), 0.42, 1.28);
  c.setHSL(
    hsl.h,
    THREE.MathUtils.clamp(hsl.s * (0.88 + 0.28 * rim), 0, 1),
    THREE.MathUtils.clamp(hsl.l * lit + 0.05 * rim, 0.05, 0.95)
  );
  return `#${c.getHexString()}`;
}

/* ------------------------------------------------------------------ *
 * Labels
 * ------------------------------------------------------------------ */

/** Default label sets: the structures a learner looks for first in each layer. */
export const DEFAULT_LABELS = {
  surface: ['head', 'face', 'neck', 'shoulder', 'chest', 'abdomen', 'hip', 'arm', 'forearm', 'hand', 'thigh', 'knee', 'leg', 'foot'],
  skeletal: ['skull', 'spine', 'ribcage', 'pelvis', 'femur', 'tibia', 'humerus', 'radius'],
  muscular: ['pectoralis', 'biceps', 'deltoid', 'quadriceps', 'calf-muscles', 'trapezius'],
  nervous: ['brain', 'spinal-cord', 'eye'],
  cardiovascular: ['heart', 'aorta'],
  respiratory: ['lungs', 'trachea', 'diaphragm'],
  digestive: ['stomach', 'liver', 'small-intestine', 'large-intestine'],
  urinary: ['kidney', 'bladder'],
  endocrine: ['thyroid', 'adrenal', 'pituitary'],
  integumentary: ['skin', 'hair'],
  reproductive: ['uterus', 'gonads'],
  lymphatic: ['spleen', 'lymph-nodes'],
};

export function plateLabels(plate, { partIds, systems, view } = {}) {
  const wanted = partIds ?? Object.values(DEFAULT_LABELS).flat();
  const byPart = new Map();
  for (const r of plate.regions) {
    const part = PART_BY_ID[r.partId];
    if (!part || !wanted.includes(r.partId)) continue;
    if (systems && !systems.has(part.system)) continue;
    // only label what a learner can actually see in this layer/view
    if (part.minLevel > 5) continue;
    const prev = byPart.get(r.partId);
    const xs = r.pts.map((p) => p[0]);
    const ys = r.pts.map((p) => p[1]);
    if (prev) {
      prev.bbox.x0 = Math.min(prev.bbox.x0, ...xs);
      prev.bbox.x1 = Math.max(prev.bbox.x1, ...xs);
      prev.bbox.y0 = Math.min(prev.bbox.y0, ...ys);
      prev.bbox.y1 = Math.max(prev.bbox.y1, ...ys);
      for (const p of r.pts) prev.bbox.pts.push(p);
    } else {
      byPart.set(r.partId, {
        partId: r.partId,
        part,
        bbox: {
          x0: Math.min(...xs),
          x1: Math.max(...xs),
          y0: Math.min(...ys),
          y1: Math.max(...ys),
          pts: [...r.pts],
        },
      });
    }
  }
  void view;

  const bodyMid = (plate.box.x0 + plate.box.x1) / 2;
  const halfW = Math.max(1e-6, (plate.box.x1 - plate.box.x0) / 2);
  const entries = [...byPart.values()].map((e) => {
    const cy = (e.bbox.y0 + e.bbox.y1) / 2;
    const cx = (e.bbox.x0 + e.bbox.x1) / 2;
    return {
      partId: e.partId,
      name: e.part.name,
      latin: e.part.latin || '',
      system: e.part.system,
      ax: cx >= bodyMid ? e.bbox.x1 : e.bbox.x0,
      ay: cy,
      cx,
      side: cx >= bodyMid ? 1 : -1,
      area: loopArea(e.bbox.pts),
      midline: Math.abs(cx - bodyMid) < halfW * 0.35,
    };
  });

  // a crowded layer (every system on) would otherwise stack thirty leader
  // lines on one another: keep the biggest structures and split them evenly
  entries.sort((a, b) => b.area - a.area);
  const keep = entries.slice(0, 20);
  const perSide = { '-1': 0, 1: 0 };
  for (const e of keep) {
    if (e.midline && perSide[String(e.side)] > perSide[String(-e.side)]) e.side = -e.side;
    perSide[String(e.side)] += 1;
    e.ax = e.side > 0 ? byPart.get(e.partId).bbox.x1 : byPart.get(e.partId).bbox.x0;
  }
  return keep.sort((a, b) => a.ay - b.ay);
}

/** Shoelace |area| of a polygon in body space — used to rank label priority. */
function loopArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a) / 2;
}

/**
 * Place the labels in the two side gutters, de-collided, each with a leader
 * line back to the structure it names. Shared by the SVG export and the live
 * 2D stage, so both look identical.
 */
export function layoutLabels(labels, { X, Y, width, height = 900, lineH = 20, marginX = 14 }) {
  if (!labels.length) return [];
  const out = [];
  for (const side of [-1, 1]) {
    const list = labels.filter((l) => Math.sign(l.side) === side).sort((a, b) => Y(a.ay) - Y(b.ay));
    if (!list.length) continue;
    const ys = list.map((l) => Y(l.ay));
    // forward/backward relaxation keeps the leader lines apart, then the whole
    // stack is nudged back inside the plate if it ran off the top or bottom
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + lineH);
    for (let i = ys.length - 2; i >= 0; i--) ys[i] = Math.min(ys[i], ys[i + 1] - lineH);
    const shift = Math.max(0, ys[ys.length - 1] - (height - 40));
    const up = Math.max(0, 40 - ys[0]);
    const dy = shift - up;
    if (dy) for (let i = 0; i < ys.length; i++) ys[i] += dy;
    const textX = side > 0 ? width - marginX : marginX;
    list.forEach((l, i) => {
      const y = ys[i];
      const ax = X(l.ax);
      const ay = Y(l.ay);
      const elbow = textX - side * 54;
      out.push(
        `<g class="hb-label" data-part="${l.partId}">` +
          `<path d="M${f(ax)} ${f(ay)} L${f(elbow)} ${f(y)} L${f(textX - side * 5)} ${f(y)}" fill="none" stroke="#7fb7c9" stroke-opacity="0.45" stroke-width="1"/>` +
          `<circle cx="${f(ax)}" cy="${f(ay)}" r="2.2" fill="#9fe8dd"/>` +
          `<text x="${f(textX)}" y="${f(y - 1.5)}" text-anchor="${side > 0 ? 'end' : 'start'}" font-size="12.5" font-weight="600" fill="#e8eef8">${esc(l.name)}</text>` +
          (l.latin ? `<text x="${f(textX)}" y="${f(y + 11.5)}" text-anchor="${side > 0 ? 'end' : 'start'}" font-size="9.5" font-style="italic" fill="#8fa6c2">${esc(l.latin)}</text>` : '') +
        `</g>`
      );
    });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Serialisation
 * ------------------------------------------------------------------ */

/**
 * Standalone SVG string. Also used by `npm run plate`, which prints static
 * plates into public/atlas/ for the README and to hand out as images.
 */
export function plateToSVG(plate, opts = {}) {
  const {
    height = 900, background = '#0b1220', stroke = '#241a22',
    labels = [], title = '', subtitle = '', showGrid = true, gutter = 190,
  } = opts;
  const b = plate.box;
  const span = Math.max(b.x1 - b.x0, b.y1 - b.y0) || 1;
  const pad = span * 0.05;
  const x0 = b.x0 - pad;
  const x1 = b.x1 + pad;
  const y0 = b.y0 - pad;
  const y1 = b.y1 + pad;
  const scale = (height - 2 * pad * 0.2 - 40) / (y1 - y0);
  const bodyW = (x1 - x0) * scale;
  const gut = labels.length ? gutter : 24;
  const w = Math.round(bodyW + gut * 2);
  const h = Math.round(height);
  const offX = gut + (w - gut * 2 - bodyW) / 2;
  const X = (x) => offX + (x - x0) * scale;
  const Y = (y) => h - 20 - (y - y0) * scale;

  const paths = plate.regions
    .map(
      (r) =>
        `<path class="hb-region hb-${cssSafe(r.partId)}" data-part="${r.partId}" data-system="${r.system}" d="${r.d}" ` +
        `fill="${r.fill}" fill-opacity="${f(r.alpha)}" stroke="${stroke}" stroke-opacity="${f(r.edge * 0.5)}" ` +
        `stroke-width="${f((0.5 + r.edge * 0.7) / scale)}" stroke-linejoin="round"/>`
    )
    .join('\n    ');

  const labelSvg = layoutLabels(labels, { X, Y, width: w, height: h, marginX: gut * 0.55 }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Inter, 'Segoe UI', system-ui, sans-serif">
  <defs>
    <radialGradient id="hb-stage" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="#17273e"/>
      <stop offset="100%" stop-color="${background}"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#hb-stage)"/>
  ${showGrid ? `<g stroke="#22384c" stroke-opacity="0.3" stroke-width="1">${gridLines(w, h, 60)}</g>` : ''}
  <g transform="translate(${f(X(0))} ${f(Y(0))}) scale(${f(scale)} ${f(-scale)})">
    ${paths}
  </g>
  <g>${labelSvg}</g>
  ${title ? `<text x="18" y="34" fill="#e8eef8" font-size="19" font-weight="700">${esc(title)}</text>` : ''}
  ${subtitle ? `<text x="18" y="54" fill="#8fa6c2" font-size="12.5">${esc(subtitle)}</text>` : ''}
</svg>`;
}

function gridLines(w, h, step) {
  const out = [];
  for (let x = step; x < w; x += step) out.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`);
  for (let y = step; y < h; y += step) out.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`);
  return out.join('');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function cssSafe(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '-');
}

export default buildPlate;
