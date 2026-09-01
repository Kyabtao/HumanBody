/**
 * stage2d.js — the flat, printable 2D view of the same body.
 *
 * The 3D canvas and this stage are two renderings of one model: switching to
 * 2D projects the visible systems into an SVG plate that you can zoom, pan,
 * hover and click exactly like the 3D figure, and export as an image. It also
 * keeps the atlas usable on machines where WebGL is not available.
 */
import { buildPlate, layoutLabels, plateLabels, DEFAULT_LABELS, cssSafe } from './plate.js';
import { PART_BY_ID } from '../data/index.js';

const VIEWBOX_H = 1000;
const GUTTER = 152;

export class PlateView {
  constructor(host, { onHover, onSelect, onLeave } = {}) {
    this.host = host;
    this.onHover = onHover || (() => {});
    this.onSelect = onSelect || (() => {});
    this.onLeave = onLeave || (() => {});
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.state = {};
    this.host.innerHTML = `
      <div class="plate-viewport">
        <div class="plate-canvas" data-role="canvas"></div>
        <div class="plate-hint">drag to pan · scroll to zoom · click a region to study it</div>
      </div>`;
    this.viewport = this.host.querySelector('.plate-viewport');
    this.canvas = this.host.querySelector('[data-role="canvas"]');
    this._bind();
  }

  /* ---------------- interaction ---------------- */
  _bind() {
    const vp = this.viewport;
    // Pointer bookkeeping is shared by mouse, pen and touch: one active pointer
    // pans, two pinch-zoom around the midpoint between the fingers.
    const pointers = new Map();
    let drag = null;
    let pinch = null;
    let moved = 0;

    const center = () => {
      const pts = [...pointers.values()];
      return {
        x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
        y: pts.reduce((a, p) => a + p.y, 0) / pts.length,
      };
    };
    const spread = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    vp.addEventListener('pointerdown', (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      vp.setPointerCapture?.(e.pointerId);
      if (pointers.size === 1) {
        drag = { x: e.clientX, y: e.clientY, px: this.pan.x, py: this.pan.y };
        pinch = null;
        moved = 0;
        vp.classList.add('dragging');
      } else if (pointers.size === 2) {
        drag = null;
        const c = center();
        const r = vp.getBoundingClientRect();
        pinch = { dist: spread(), zoom: this.zoom, cx: c.x - r.left, cy: c.y - r.top, panX: this.pan.x, panY: this.pan.y };
        moved = 99; // a pinch is never a tap
      }
    });

    const onMove = (e) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size >= 2) {
        const f = spread() / Math.max(1, pinch.dist);
        const next = Math.min(9, Math.max(0.5, pinch.zoom * f));
        const k = next / pinch.zoom;
        this.pan.x = pinch.cx - (pinch.cx - pinch.panX) * k;
        this.pan.y = pinch.cy - (pinch.cy - pinch.panY) * k;
        this.zoom = next;
        this._applyTransform();
        return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      moved = Math.max(moved, Math.hypot(dx, dy));
      this.pan.x = drag.px + dx;
      this.pan.y = drag.py + dy;
      this._applyTransform();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const onUp = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) {
        drag = null;
        vp.classList.remove('dragging');
        this._moved = moved;
      } else if (pointers.size === 1) {
        // lifted one finger of a pinch: continue as a pan from where we are
        const [p] = [...pointers.values()];
        drag = { x: p.x, y: p.y, px: this.pan.x, py: this.pan.y };
      }
    };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    // double-tap / double-click to zoom in, and again to fit
    let lastTap = 0;
    vp.addEventListener('pointerup', (e) => {
      const now = performance.now();
      if (now - lastTap < 320 && moved < 12) {
        const r = vp.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        const next = this.zoom > 1.6 ? 1 : 2.6;
        const f = next / this.zoom;
        if (next === 1) {
          this.pan = { x: 0, y: 0 };
        } else {
          this.pan.x = px - (px - this.pan.x) * f;
          this.pan.y = py - (py - this.pan.y) * f;
        }
        this.zoom = next;
        this._applyTransform();
        moved = 99;
      }
      lastTap = now;
    });

    vp.addEventListener('wheel', (e) => {
      e.preventDefault();
      // zoom around the cursor, so the structure you aim at stays under it
      const r = vp.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const next = Math.min(9, Math.max(0.5, this.zoom * Math.exp(-e.deltaY * 0.0014)));
      const f = next / this.zoom;
      this.pan.x = px - (px - this.pan.x) * f;
      this.pan.y = py - (py - this.pan.y) * f;
      this.zoom = next;
      this._applyTransform();
    }, { passive: false });

    vp.addEventListener('pointerleave', () => {
      if (this._hoverId) {
        this._hoverId = null;
        this._paintHover();
        this.onLeave();
      }
    });

    this.canvas.addEventListener('pointerover', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return; // fingers tap, they do not hover
      const node = e.target.closest?.('[data-part]');
      const id = node?.dataset.part || null;
      if (id !== this._hoverId) {
        this._hoverId = id;
        this._paintHover();
      }
      if (!id) {
        this.onLeave();
        return;
      }
      const part = PART_BY_ID[id];
      const r = this.host.getBoundingClientRect();
      this.onHover({
        partId: id,
        part,
        screen: { x: e.clientX - r.left, y: e.clientY - r.top },
        platePoint: { x: e.clientX, y: e.clientY },
      });
    });
    this.canvas.addEventListener('click', (e) => {
      if (this._moved > 8) return; // that was a pan, not a pick
      const node = e.target.closest?.('[data-part]');
      if (!node) return;
      this.onSelect(node.dataset.part, { fromPlate: true });
    });
  }

  _applyTransform() {
    this.canvas.style.transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
  }

  _paintHover() {
    this.canvas.querySelectorAll('.hb-hover').forEach((n) => n.classList.remove('hb-hover'));
    if (!this._hoverId) return;
    this.canvas.querySelectorAll(`.${cssSafe(this._hoverId)}`).forEach((n) => n.classList.add('hb-hover'));
  }

  /* ---------------- build ---------------- */
  /**
   * Rebuild the plate from the current model + UI state.
   * @param {object} human humanoid (viewer.human)
   * @param {object} opts  { view, systems, level, isolate, xray, labels, selected }
   */
  render(human, opts = {}) {
    if (!human) return 0;
    this.state = opts;
    const {
      view = 'front', systems = new Set(), level = 1, isolate = null,
      xray = false, labels = true, selected = null,
    } = opts;
    const t0 = performance.now();
    const plate = buildPlate(human, {
      view,
      hemi: true,
      isVisible: (mesh) => {
        const sys = mesh.userData.system;
        if (isolate ? sys !== isolate : !systems.has(sys)) return false;
        const part = PART_BY_ID[mesh.userData.partId];
        if (part && (part.minLevel ?? 1) > level) return false;
        return true;
      },
    });
    this.plate = plate;

    const b = plate.box;
    const spanY = Math.max(1e-3, b.y1 - b.y0);
    const s = (VIEWBOX_H - 60) / spanY;
    const width = Math.max(380, Math.round((b.x1 - b.x0) * s + GUTTER * 2));
    const height = VIEWBOX_H;
    const tx = GUTTER + ((width - GUTTER * 2 - (b.x1 - b.x0) * s)) / 2 - b.x0 * s;
    const ty = height - 30 - b.y0 * s;
    const frame = { s, tx, ty, width, height, gutter: GUTTER, marginX: GUTTER * 0.6, lineH: 22, X: (x) => tx + x * s, Y: (y) => ty - y * s };
    this.frame = frame;

    const wanted = labels ? (isolate ? DEFAULT_LABELS[isolate] ?? [] : [...new Set([...systems].flatMap((k) => DEFAULT_LABELS[k] || []))]) : [];
    const marks = wanted.length ? layoutLabels(plateLabels(plate, { partIds: wanted }), frame) : [];

    const regions = plate.regions
      .map((r) => {
        const faded = xray && (r.system === 'surface' || r.system === 'integumentary');
        const op = faded ? 0.14 : r.alpha;
        const stroke = faded ? '#4b6b7d' : '#241a22';
        return (
          `<path class="hb-${cssSafe(r.partId)}" data-part="${r.partId}" data-system="${r.system}" d="${r.d}" ` +
          `fill="${r.fill}" fill-opacity="${op.toFixed(3)}" stroke="${stroke}" ` +
          `stroke-opacity="${(faded ? 0.45 : r.edge * 0.45).toFixed(2)}" stroke-width="${((0.6 + r.edge * 0.7) / s).toFixed(4)}" stroke-linejoin="round"/>`
        );
      })
      .join('\n');

    this.canvas.innerHTML =
      `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" class="plate-svg" role="img" aria-label="2D anatomical plate, ${plate.view}">
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(3)} ${(-s).toFixed(3)})">
${regions}
  </g>
  <g class="plate-labels">${marks.join('\n  ')}</g>
</svg>`;
    this.svg = this.canvas.firstElementChild;
    this.setSelected(selected);
    this.buildMs = Math.round(performance.now() - t0);
    return this.buildMs;
  }

  setSelected(partId) {
    this.currentSelected = partId || null;
    this.canvas.querySelectorAll('.hb-sel').forEach((n) => n.classList.remove('hb-sel'));
    this.canvas.querySelectorAll('.hb-label').forEach((n) => n.classList.remove('active'));
    if (!partId) return;
    this.canvas.querySelectorAll(`.${cssSafe(partId)}`).forEach((n) => n.classList.add('hb-sel'));
    this.canvas.querySelectorAll(`.hb-label[data-part="${partId}"]`).forEach((n) => n.classList.add('active'));
  }

  resetView() {
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this._applyTransform();
  }

  /** Frame one structure: zoom and pan the plate so that region fills the view. */
  zoomToPart(partId, { fill = 0.42, max = 4.5 } = {}) {
    if (!this.plate) return false;
    const regions = this.plate.regions.filter((r) => r.partId === partId);
    if (!regions.length) return false;
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const r of regions) {
      for (const p of r.pts) {
        x0 = Math.min(x0, p[0]);
        x1 = Math.max(x1, p[0]);
        y0 = Math.min(y0, p[1]);
        y1 = Math.max(y1, p[1]);
      }
    }
    const m = this._metrics();
    const cx = m.ox + (this.frame.tx + ((x0 + x1) / 2) * this.frame.s) * m.k;
    const cy = m.oy + (this.frame.ty - ((y0 + y1) / 2) * this.frame.s) * m.k;
    const wPx = Math.max(24, (x1 - x0) * this.frame.s * m.k);
    const hPx = Math.max(24, (y1 - y0) * this.frame.s * m.k);
    const target = Math.min(max, Math.max(1, Math.min(m.w * fill / wPx, m.h * fill / hPx)));
    this.zoom = target;
    this.pan.x = m.w / 2 - cx * target;
    this.pan.y = m.h / 2 - cy * target;
    this._applyTransform();
    return true;
  }

  /** Screen metrics of the svg inside the stage (the viewBox is "meet"-fitted). */
  _metrics() {
    const rect = this.viewport.getBoundingClientRect();
    const fw = this.frame ? this.frame.width : rect.width;
    const fh = this.frame ? this.frame.height : rect.height;
    const k = Math.min(rect.width / fw, rect.height / fh);
    return { w: rect.width, h: rect.height, k, ox: (rect.width - fw * k) / 2, oy: (rect.height - fh * k) / 2 };
  }

  /** Standalone SVG file for download / printing. */
  toSVGString({ title = 'HumanBody', subtitle = '' } = {}) {
    const plate = this.plate;
    if (!plate) return '<svg xmlns="http://www.w3.org/2000/svg"/>';
    const fr = this.frame;
    const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const wanted = this.state.labels === false ? [] : [...new Set([...(this.state.systems || [])].flatMap((k) => DEFAULT_LABELS[k] || []))];
    const marks = wanted.length ? layoutLabels(plateLabels(plate, { partIds: wanted }), fr) : [];
    const regions = plate.regions
      .map(
        (r) =>
          `<path data-part="${r.partId}" d="${r.d}" fill="${r.fill}" fill-opacity="${r.alpha.toFixed(3)}" stroke="#241a22" stroke-opacity="${(r.edge * 0.45).toFixed(2)}" stroke-width="${((0.6 + r.edge * 0.7) / fr.s).toFixed(4)}" stroke-linejoin="round"/>`
      )
      .join('\n  ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fr.width} ${fr.height}" width="${fr.width}" height="${fr.height}" font-family="Inter, 'Segoe UI', system-ui, sans-serif">
  <defs>
    <radialGradient id="stage" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="#17273e"/>
      <stop offset="100%" stop-color="#0b1220"/>
    </radialGradient>
  </defs>
  <rect width="${fr.width}" height="${fr.height}" fill="url(#stage)"/>
  <g transform="translate(${fr.tx.toFixed(2)} ${fr.ty.toFixed(2)}) scale(${fr.s.toFixed(3)} ${(-fr.s).toFixed(3)})">
  ${regions}
  </g>
  <g>${marks.join('\n  ')}</g>
  <text x="20" y="34" fill="#e8eef8" font-size="19" font-weight="700">${esc(title)}</text>
  <text x="20" y="54" fill="#8fa6c2" font-size="12.5">${esc(subtitle)}</text>
</svg>`;
  }

  /** Rasterise the current plate so it can be saved as a PNG image. */
  async toPNG(scale = 2) {
    const svg = this.toSVGString({ title: 'HumanBody · 2D plate', subtitle: `${this.plate?.view ?? ''}` });
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    const c = document.createElement('canvas');
    c.width = Math.round(this.frame.width * scale);
    c.height = Math.round(this.frame.height * scale);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((res) => c.toBlob(res, 'image/png'));
  }
}

export default PlateView;
