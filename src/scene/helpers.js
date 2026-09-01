import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * Landmarks. One shared coordinate frame, in metres, for the whole
 * body: feet at y = -0.90, crown at y = +0.91 (≈1.8 m tall figure).
 * The body faces +Z, so the anatomical LEFT is on the +X side.
 * ------------------------------------------------------------------ */
export const LM = {
  height: 1.81,
  footBottom: -0.9,
  crown: 0.91,

  head: new THREE.Vector3(0, 0.79, 0),
  headR: 0.105,
  jaw: new THREE.Vector3(0, 0.73, 0.025),
  neck: new THREE.Vector3(0, 0.7, 0.0),
  neckTop: new THREE.Vector3(0, 0.75, 0.0),
  shoulderL: new THREE.Vector3(0.19, 0.555, 0),
  shoulderR: new THREE.Vector3(-0.19, 0.555, 0),
  elbowL: new THREE.Vector3(0.225, 0.29, 0.005),
  elbowR: new THREE.Vector3(-0.225, 0.29, 0.005),
  wristL: new THREE.Vector3(0.235, 0.045, 0.01),
  wristR: new THREE.Vector3(-0.235, 0.045, 0.01),
  handL: new THREE.Vector3(0.242, -0.005, 0.012),
  handR: new THREE.Vector3(-0.242, -0.005, 0.012),

  chest: new THREE.Vector3(0, 0.42, 0.02),
  waist: new THREE.Vector3(0, 0.15, 0.0),
  pelvis: new THREE.Vector3(0, -0.06, 0),
  hipL: new THREE.Vector3(0.085, -0.06, 0),
  hipR: new THREE.Vector3(-0.085, -0.06, 0),
  kneeL: new THREE.Vector3(0.092, -0.45, 0.005),
  kneeR: new THREE.Vector3(-0.092, -0.45, 0.005),
  ankleL: new THREE.Vector3(0.088, -0.83, -0.005),
  ankleR: new THREE.Vector3(-0.088, -0.83, -0.005),
  footL: new THREE.Vector3(0.088, -0.868, 0.045),
  footR: new THREE.Vector3(-0.088, -0.868, 0.045),
};

/** The vertebral column as a smooth curve (kyphosis + lordosis). */
export const SPINE_PATH = [
  new THREE.Vector3(0, 0.74, 0.012),
  new THREE.Vector3(0, 0.68, 0.012),
  new THREE.Vector3(0, 0.6, 0.005),
  new THREE.Vector3(0, 0.48, -0.028),
  new THREE.Vector3(0, 0.36, -0.042),
  new THREE.Vector3(0, 0.22, -0.048),
  new THREE.Vector3(0, 0.09, -0.038),
  new THREE.Vector3(0, 0.025, -0.02),
  new THREE.Vector3(0, -0.03, -0.012),
  new THREE.Vector3(0, -0.055, -0.026),
  new THREE.Vector3(0, -0.085, -0.048),
  new THREE.Vector3(0, -0.112, -0.062),
];

export const spineCurve = () => new THREE.CatmullRomCurve3(SPINE_PATH, false, 'catmullrom', 0.4);

/* ------------------------------------------------------------------ *
 * Materials
 * ------------------------------------------------------------------ */
const materialCache = new Map();

export function material(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (materialCache.has(key)) return materialCache.get(key);
  const Material = opts.physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const m = new Material({
    color: new THREE.Color(color),
    roughness: opts.roughness ?? 0.62,
    metalness: opts.metalness ?? 0.05,
    transparent: opts.opacity !== undefined && opts.opacity < 1,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    depthWrite: opts.depthWrite ?? true,
    emissive: new THREE.Color(opts.emissive ?? 0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    flatShading: opts.flatShading ?? false,
    ...(opts.physical ? {
      clearcoat: opts.clearcoat ?? 0,
      clearcoatRoughness: opts.clearcoatRoughness ?? 0.35,
      sheen: opts.sheen ?? 0,
      sheenColor: new THREE.Color(opts.sheenColor ?? 0x000000),
      sheenRoughness: opts.sheenRoughness ?? 0.5,
    } : {}),
  });
  materialCache.set(key, m);
  return m;
}

export function highlightMaterial(color) {
  return material(color, { emissive: 0xffcc55, emissiveIntensity: 0.55, roughness: 0.35 });
}

/* ------------------------------------------------------------------ *
 * Geometry helpers. Every helper returns pure geometry so builders can
 * position / rotate / scale freely.
 * ------------------------------------------------------------------ */

export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** Smooth tapered limb between two points (lathe based: no seams). */
export function limbGeometry(a, b, r1, r2, bulge = 1.06, seg = 20, steps = 14) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const profile = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const base = r1 + (r2 - r1) * t;
    const r = base * (1 + (bulge - 1) * Math.sin(Math.PI * t));
    profile.push(new THREE.Vector2(Math.max(r, 0.002), t * len));
  }
  const geo = new THREE.LatheGeometry(profile, seg);
  geo.translate(0, -len / 2, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  geo.applyQuaternion(q);
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  geo.translate(mid.x, mid.y, mid.z);
  return geo;
}

/** Cylinder between two points (for bones). */
export function boneGeometry(a, b, r1, r2, seg = 12) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r1, r2, len, seg, 1, false);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  geo.applyQuaternion(q);
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  geo.translate(mid.x, mid.y, mid.z);
  return geo;
}

/** Tube along a list of points (vessels, ducts, gut). */
export function tubeGeometry(points, radius, tubularSegments = 64, radialSegments = 10, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => (p.isVector3 ? p : v3(...p))), closed, 'catmullrom', 0.5);
  return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed);
}

/** Ellipsoid / blob: organ-friendly, with optional organic displacement. */
export function blobGeometry(radius, detail = 3, wobble = 0, freq = 5, seed = 0) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  if (wobble > 0) {
    const pos = geo.attributes.position;
    const p = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i);
      const n = p.clone().normalize();
      const w =
        1 +
        wobble *
          (Math.sin(n.x * freq + seed) * Math.sin(n.y * freq * 1.3 + seed * 1.7) * Math.sin(n.z * freq * 0.9 + seed * 2.3));
      p.multiplyScalar(w);
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    geo.computeVertexNormals();
  }
  return geo;
}

export function ellipsoidGeometry(rx, ry, rz, detail = 24) {
  const geo = new THREE.SphereGeometry(1, detail, Math.max(8, detail / 2));
  geo.scale(rx, ry, rz);
  return geo;
}

/** Rounded box (nice for flat organs and bone plates). */
export function roundedBoxGeometry(w, h, d, r = 0.01, seg = 3) {
  const shape = new THREE.Shape();
  const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  shape.moveTo(-w / 2 + rr, -h / 2);
  shape.lineTo(w / 2 - rr, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr);
  shape.lineTo(w / 2, h / 2 - rr);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2);
  shape.lineTo(-w / 2 + rr, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr);
  shape.lineTo(-w / 2, -h / 2 + rr);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + rr);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - 2 * rr,
    bevelEnabled: true,
    bevelSize: rr,
    bevelThickness: rr,
    bevelSegments: seg,
    curveSegments: seg + 2,
  });
  geo.translate(0, 0, -(d - 2 * rr) / 2);
  geo.computeVertexNormals();
  return geo;
}

/** Partial torus arc (ribs, arches, rings). */
export function arcGeometry(radius, tube, arc = Math.PI, seg = 32, radialSeg = 8) {
  return new THREE.TorusGeometry(radius, tube, radialSeg, seg, arc);
}

/* ------------------------------------------------------------------ *
 * Lofted body solids.
 *
 * Real bodies are not a pile of ellipsoids: they are smooth surfaces
 * swept through a stack of cross-sections. `loftGeometry` takes those
 * sections (one per height) and produces a single closed surface, which
 * is what gives the figure its silhouette — waist pinch, chest flare,
 * ribcage taper, calf bulge. The 2D plate projects the very same
 * surfaces, so the picture and the model can never disagree.
 * ------------------------------------------------------------------ */

/** Lamé (super-ellipse) point: exp 2 = ellipse, 3 = rounded rectangle. */
function lamePoint(cos, sin, r, exp) {
  if (exp === 2 || !isFinite(exp)) return r * cos;
  const e = 2 / exp;
  return r * Math.sign(cos) * Math.pow(Math.abs(cos), e);
}

/**
 * Interpolate a cross-section profile given as [t, rx, rz, exp?, rzb?] stops.
 * Smooth-stepped so muscle bellies and taper read as curves, not facets.
 */
export function profileAt(stops, t) {
  if (t <= stops[0][0]) return stops[0];
  const last = stops[stops.length - 1];
  if (t >= last[0]) return last;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const k = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
      const s = k * k * (3 - 2 * k);
      const out = [a[0] + (b[0] - a[0]) * k];
      for (let c = 1; c < a.length; c++) out.push(a[c] + ((b[c] ?? a[c]) - a[c]) * s);
      return out;
    }
  }
  return last;
}

/**
 * Sweep a stack of elliptical / super-ellipse sections into a surface.
 * section = { x, y, z, rx, rz, rzb?, exp?, twist? }
 *   rx  half width (side to side), rz half depth towards +Z (front),
 *   rzb half depth towards -Z (back) for a flat-back / belly-front body,
 *   exp exponent, twist rotates the section (shoulder and ribcage twist).
 */
export function loftGeometry(sections, opts = {}) {
  const { seg = 44, u0 = 0, u1 = 1, capStart = false, capEnd = false } = opts;
  const pos = [];
  const uv = [];
  const idx = [];
  const rings = [];

  for (let s = 0; s < sections.length; s++) {
    const sec = sections[s];
    const rx = sec.rx, rz = sec.rz, rzb = sec.rzb ?? sec.rz;
    const exp = sec.exp ?? 2;
    const twist = sec.twist ?? 0;
    const start = pos.length / 3;
    const closed = Math.abs(u1 - u0 - 1) < 1e-9;
    const count = closed ? seg : seg + 1;
    for (let i = 0; i < count; i++) {
      const u = closed ? i / seg : u0 + (u1 - u0) * (i / seg);
      const a = u * Math.PI * 2 + twist;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const r = sa >= 0 ? rz : rzb;
      pos.push(
        (sec.x ?? 0) + lamePoint(ca, sa, rx, exp),
        (sec.y ?? 0),
        (sec.z ?? 0) + Math.sign(sa) * r * Math.pow(Math.abs(sa), exp === 2 ? 1 : 2 / exp)
      );
      uv.push(u, s / (sections.length - 1));
    }
    rings.push({ start, count, closed });
  }

  // Decide the triangle order from the geometry itself: a loft swept down a
  // limb (shoulder → wrist) advances along -y, which would otherwise turn
  // every normal inwards and render the limb inside out.
  let flip = false;
  {
    const ra = rings[0];
    const rb = rings[1];
    if (ra && rb && ra.count > 1) {
      const at = (v) => [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
      const p0 = at(ra.start);
      const p1 = at(ra.start + 1);
      const q0 = at(rb.start);
      const ux = q0[0] - p0[0], uy = q0[1] - p0[1], uz = q0[2] - p0[2];
      const vx = p1[0] - p0[0], vy = p1[1] - p0[1], vz = p1[2] - p0[2];
      const nx = uy * vz - uz * vy;
      const nzx = uz * vx - ux * vz;
      const ox = p0[0] - (sections[0].x ?? 0);
      const oz = p0[2] - (sections[0].z ?? 0);
      flip = nx * ox + nzx * oz < 0;
    }
  }

  for (let s = 0; s < rings.length - 1; s++) {
    const a = rings[s];
    const b = rings[s + 1];
    for (let i = 0; i < a.count - 1; i++) {
      const a0 = a.start + i, a1 = a.start + i + 1;
      const b0 = b.start + i, b1 = b.start + i + 1;
      if (flip) idx.push(a0, a1, b0, a1, b1, b0);
      else idx.push(a0, b0, a1, a1, b0, b1);
    }
    if (a.closed) {
      const aN = a.start + a.count - 1;
      const bN = b.start + b.count - 1;
      if (flip) idx.push(aN, a.start, bN, a.start, b.start, bN);
      else idx.push(aN, bN, a.start, a.start, bN, b.start);
    }
  }

  // End caps use duplicated vertices so the side surface keeps smooth normals.
  const cap = (ringIdx, outward) => {
    const ring = rings[ringIdx];
    const cx = pos[ring.start * 3];
    const cy = pos[ring.start * 3 + 1];
    let cz = 0;
    for (let i = 0; i < ring.count; i++) cz += pos[(ring.start + i) * 3 + 2];
    cz /= ring.count;
    // sections that have already shrunk to nothing are closed naturally
    let spread = 0;
    for (let i = 0; i < ring.count; i++) {
      const dx = pos[(ring.start + i) * 3] - cx;
      const dz = pos[(ring.start + i) * 3 + 2] - cz;
      spread = Math.max(spread, Math.hypot(dx, dz));
    }
    if (spread < 1e-4) return;
    const base = pos.length / 3;
    const v = pos.length / 3;
    pos.push(cx, cy, cz);
    uv.push(0.5, ringIdx === 0 ? 0 : 1);
    for (let i = 0; i < ring.count; i++) {
      pos.push(pos[(ring.start + i) * 3], pos[(ring.start + i) * 3 + 1], pos[(ring.start + i) * 3 + 2]);
      uv.push(uv[(ring.start + i) * 2], ringIdx === 0 ? 0 : 1);
    }
    const o = flip ? -outward : outward;
    for (let i = 0; i < ring.count - 1; i++) {
      if (o > 0) idx.push(v, v + 1 + i, v + 2 + i);
      else idx.push(v, v + 2 + i, v + 1 + i);
    }
  };
  if (capStart) cap(0, -1);
  if (capEnd) cap(rings.length - 1, 1);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

const FRONT = new THREE.Vector3(0, 0, 1);
const TMP_A = new THREE.Vector3();
const TMP_B = new THREE.Vector3();

/**
 * Loft a limb along a curved path (shoulder → elbow → wrist), sizing each
 * section from a profile table. This is how you get a bicep belly, a narrow
 * wrist, a gastrocnemius bulge and a slight elbow bend in one smooth skin.
 *
 * limbLoft([p0, p1, p2], [[0,r0,r0], [0.5,r,r], [1,r,r]], { steps, exp })
 * The optional `offset(t)` returns a [side, up] nudge for things like the
 * forearm's carrying angle or the arch of a foot.
 */
export function limbLoft(points, stops, opts = {}) {
  const { steps = 26, seg = 24, exp = 2, capStart = false, capEnd = false, offset = null, twist = 0, k = 1, flat = 0 } = opts;
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.35);
  const sections = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = curve.getPointAt(t);
    const s = profileAt(stops, t);
    const ox = offset ? offset(t)[0] : 0;
    const oz = offset ? offset(t)[1] : 0;
    const tan = curve.getTangentAt(t);
    // Frame the section from the path tangent. Reference axis flips when a
    // limb runs front-to-back (feet) so the basis never degenerates.
    const ref = Math.abs(tan.z) > 0.85 ? UP : FRONT;
    const right = TMP_A.crossVectors(tan, ref).normalize().clone();
    const front = TMP_B.crossVectors(right, tan).normalize().clone();
    const c = p.clone().addScaledVector(right, ox).addScaledVector(front, oz);
    sections.push({
      x: c.x, y: c.y, z: c.z,
      rx: s[1] * k, rz: s[2] * k, rzb: (s[4] ?? s[2] * (1 - (flat ?? 0))) * k,
      exp: s[3] ?? exp, twist,
    });
  }
  return loftGeometry(sections, { seg, capStart, capEnd });
}

/** Chain small meshes' geometries into one after applying a transform. */
export function placed(geo, { position, rotation, scale } = {}) {
  const g = geo.clone();
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  if (rotation) q.setFromEuler(new THREE.Euler(...rotation));
  const s = scale == null ? new THREE.Vector3(1, 1, 1)
    : Array.isArray(scale) ? new THREE.Vector3(...scale) : new THREE.Vector3().setScalar(scale);
  m.compose(position instanceof THREE.Vector3 ? position : v3(...(position || [0, 0, 0])), q, s);
  g.applyMatrix4(m);
  return g;
}

/* ------------------------------------------------------------------ *
 * Mesh assembly
 * ------------------------------------------------------------------ */
export function add(group, geometry, partId, system, matOrColor, opts = {}) {
  const m =
    typeof matOrColor === 'string' || typeof matOrColor === 'number'
      ? material(matOrColor, opts.materialOpts)
      : matOrColor;
  const mesh = new THREE.Mesh(geometry, m);
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? false;
  if (opts.position) mesh.position.copy(opts.position.isVector3 ? opts.position : v3(...opts.position));
  if (opts.rotation) mesh.rotation.set(...opts.rotation);
  if (opts.scale) {
    if (Array.isArray(opts.scale)) mesh.scale.set(...opts.scale);
    else mesh.scale.setScalar(opts.scale);
  }
  mesh.userData = {
    partId,
    system,
    partName: opts.partName ?? partId,
    pickable: opts.pickable ?? true,
    baseMaterial: m,
    isHighlightable: opts.isHighlightable ?? true,
    // Preserve authored transforms so animation never drifts the anatomy.
    basePosition: mesh.position.clone(),
    baseScale: mesh.scale.clone(),
  };
  group.add(mesh);
  return mesh;
}

/** Merge several geometries into one mesh (keeps the draw-call count sane). */
export function mergeGeometries(geometries) {
  const nonIndexed = geometries.map((g) => {
    const c = g.index ? g.toNonIndexed() : g;
    if (!c.attributes.normal) c.computeVertexNormals();
    if (!c.attributes.uv) {
      const n = c.attributes.position.count;
      c.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
    }
    return c;
  });
  let total = 0;
  for (const g of nonIndexed) total += g.attributes.position.count;
  const position = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  let offset = 0;
  for (const g of nonIndexed) {
    position.set(g.attributes.position.array.slice(0, g.attributes.position.count * 3), offset * 3);
    normal.set(g.attributes.normal.array.slice(0, g.attributes.normal.count * 3), offset * 3);
    uv.set(g.attributes.uv.array.slice(0, g.attributes.uv.count * 2), offset * 2);
    offset += g.attributes.position.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.computeBoundingSphere();
  return geo;
}

export const UP = new THREE.Vector3(0, 1, 0);

export function midpoint(a, b) {
  return new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
}
