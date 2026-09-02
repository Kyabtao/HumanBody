/**
 * tree.js — the body-part tree in the left rail.
 *
 * A collapsible Region → Branch → Part browser, so a learner can work through
 * the atlas a body part at a time ("everything in the knee") instead of only
 * the whole body or one system at a time. The hierarchy itself lives in
 * `src/data/tree.js`; this file only draws and drives it.
 *
 * Each row does three things: open it to read the part, zoom the model to it,
 * or light up only the layers that branch needs. Branch and region rows can
 * also be quizzed as a set.
 */
import { PART_BY_ID, SYSTEM_BY_ID } from './data/index.js';
import {
  BODY_TREE, buildTree, trailLabel, TREE_NODE_BY_ID, BRANCH_PARENT, PART_BRANCH,
} from './data/tree.js';

const STORE_KEY = 'hb3d-tree-open';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** Part ids are plain slugs, but never let a future one break a selector. */
const cssId = (value) => String(value).replace(/["\\]/g, '\\$&');

/** Highlight the matching slice of a name while a filter is active. */
function marked(text, filter) {
  if (!filter) return esc(text);
  const at = String(text ?? '').toLowerCase().indexOf(filter.toLowerCase());
  if (at < 0) return esc(text);
  return `${esc(String(text).slice(0, at))}<mark>${esc(String(text).slice(at, at + filter.length))}</mark>${esc(String(text).slice(at + filter.length))}`;
}

export class PartTree {
  constructor(host, {
    onSelect = () => {},
    onZoom = () => false,
    onShowLayers = () => {},
    onQuizNode = () => {},
    isPartVisible = () => false,
    onFilterChange = () => {},
  } = {}) {
    this.host = host;
    this.onSelect = onSelect;
    this.onZoom = onZoom;
    this.onShowLayers = onShowLayers;
    this.onQuizNode = onQuizNode;
    this.isPartVisible = isPartVisible;
    this.onFilterChange = onFilterChange;
    this.level = 1;
    this.selectedPartId = null;
    this.filter = '';
    /** While a filter is active it decides what shows and what stays open. */
    this._view = null;
    this.open = new Set(this._load());
    this._wire();
  }

  /* ---------------------------------------------------------------- */
  /*  Open/closed memory                                              */
  /* ---------------------------------------------------------------- */
  _load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (Array.isArray(raw) && raw.length) return raw;
    } catch { /* private mode: fall through to the default */ }
    // a learner's first look should already show a handful of parts
    const first = BODY_TREE[0];
    return [first.id, ...(first.children?.[0] ? [first.children[0].id] : [])];
  }

  _save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...this.open])); } catch { /* ignore */ }
  }

  isOpen(id) {
    return this._view ? this._view.expanded.has(id) : this.open.has(id);
  }

  /** Open a node; opening a region also opens its first branch. */
  setOpen(id, on) {
    if (!on) {
      this.open.delete(id);
      this._save();
      return;
    }
    this.open.add(id);
    const node = TREE_NODE_BY_ID.get(id);
    const firstChild = node?.children?.[0];
    if (firstChild && !node.children.some((c) => this.open.has(c.id))) this.open.add(firstChild.id);
    this._save();
  }

  toggle(id) {
    this.setOpen(id, !this.open.has(id));
  }

  expandAll() {
    for (const node of BODY_TREE) {
      this.open.add(node.id);
      for (const child of node.children || []) this.open.add(child.id);
    }
    this._save();
    this.render();
  }

  collapseAll() {
    this.open.clear();
    this._save();
    this.render();
  }

  setFilter(text) {
    this.filter = (text || '').trim();
    this._view = this.filter ? this._filterState() : null;
    this.render();
  }

  /** Rows to keep and rows to hold open for the current filter. */
  _filterState() {
    const q = this.filter.toLowerCase();
    const hit = (text) => String(text ?? '').toLowerCase().includes(q);
    const visible = new Set();
    const expanded = new Set();
    const keepSubtree = (node) => {
      visible.add(node.id);
      expanded.add(node.id);
      for (const child of node.children || []) keepSubtree(child);
    };
    const keepTrail = (chain) => {
      for (const id of chain) { visible.add(id); expanded.add(id); }
    };
    const visit = (node, chain) => {
      let keep = false;
      if (hit(node.name) || hit(node.blurb) || hit(node.note)) {
        keepSubtree(node);
        keepTrail(chain);
        keep = true;
      }
      for (const id of node.parts || []) {
        const part = PART_BY_ID[id];
        if (!part) continue;
        const system = SYSTEM_BY_ID[part.system];
        if (hit(part.name) || hit(part.latin) || (part.tags || []).some(hit) || hit(system?.name)) {
          visible.add(node.id);
          expanded.add(node.id);
          keepTrail(chain);
          keep = true;
        }
      }
      for (const child of node.children || []) {
        if (visit(child, [...chain, node.id])) keep = true;
      }
      if (keep) visible.add(node.id);
      return keep;
    };
    for (const region of BODY_TREE) visit(region, []);
    return { visible, expanded };
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  refresh({ level = this.level, selectedPartId = this.selectedPartId } = {}) {
    this.level = level;
    this.selectedPartId = selectedPartId;
    this.render();
  }

  render() {
    if (!this.host) return;
    const tree = buildTree({ level: this.level });
    const total = tree.reduce((n, r) => n + r.count + r.lockedCount, 0);
    const shown = (id) => !this._view || this._view.visible.has(id);
    const rows = [];
    const walk = (node, depth) => {
      if (!shown(node.id)) return;
      const expanded = this.isOpen(node.id);
      rows.push(this._nodeRow(node, depth, expanded));
      if (!expanded) return;
      if (node.note && node.kind === 'branch') {
        rows.push(`<div class="tree-note" style="--d:${depth}">${esc(node.note)}</div>`);
      }
      if (!node.children.length && !node.parts.length) {
        rows.push(`<div class="tree-empty" style="--d:${depth + 1}">Nothing filed here yet.</div>`);
      }
      for (const child of node.children) walk(child, depth + 1);
      for (const part of node.parts) rows.push(this._partRow(part, depth + 1));
    };
    for (const region of tree) walk(region, 0);

    this.host.innerHTML = `<div class="tree-inner" role="tree" aria-label="Body parts by region">
        ${rows.join('') || '<div class="tree-empty">No part of the body matches that filter.</div>'}
      </div>
      <div class="tree-foot">${total} entries in ${tree.length} regions · click a part to study it</div>`;
  }

  _nodeRow(node, depth, expanded) {
    const region = node.kind === 'region';
    const locks = node.lockedCount
      ? `<span class="tree-locks" title="${node.lockedCount} more ${node.lockedCount === 1 ? 'entry' : 'entries'} here unlock at a higher level">+${node.lockedCount}🔒</span>`
      : '';
    const name = region
      ? `<span class="tree-ico" aria-hidden="true">${node.icon || '📁'}</span><span class="tree-name">${marked(node.name, this.filter)}</span>`
      : `<span class="tree-name">${marked(node.name, this.filter)}</span>`;
    return `<div class="tree-row ${region ? 'region' : 'branch'}${expanded ? ' open' : ''}"
        role="treeitem" tabindex="0" aria-level="${depth + 1}" aria-expanded="${expanded}"
        data-node="${node.id}" style="--d:${depth}">
        <span class="tree-caret" aria-hidden="true">${expanded ? '▾' : '▸'}</span>
        ${name}
        <span class="tree-count" title="${node.count} ${node.count === 1 ? 'entry' : 'entries'} open at this level">${node.count}</span>${locks}
        <span class="tree-tools">
          <button class="tree-btn" data-layers="${node.id}" tabindex="-1" title="Light up only the layers this ${region ? 'region' : 'branch'} needs">🛠</button>
          <button class="tree-btn" data-quiz="${node.id}" tabindex="-1" title="Quiz me on the ${esc(node.name)}">🎯</button>
        </span>
      </div>
      ${region && expanded && node.blurb ? `<div class="tree-note" style="--d:${depth}">${esc(node.blurb)}</div>` : ''}`;
  }

  _partRow(part, depth) {
    const sys = SYSTEM_BY_ID[part.system] || {};
    const locked = (part.minLevel ?? 1) > this.level;
    const active = part.id === this.selectedPartId;
    const focusable = !locked && this.isPartVisible(part.id);
    const trail = trailLabel(part.id);
    return `<div class="tree-row part${locked ? ' locked' : ''}${active ? ' active' : ''}"
        role="treeitem" tabindex="0" aria-level="${depth + 1}" aria-selected="${active}"
        data-part="${part.id}" style="--d:${depth};--sys:${sys.color || '#8aa'}"
        title="${esc(trail)}${locked ? ` · opens at level ${part.minLevel}` : ''}">
        <span class="tree-dot" aria-hidden="true"></span>
        <span class="tree-name">${marked(part.name, this.filter)}</span>
        ${part.latin ? `<span class="tree-latin">${marked(part.latin, this.filter)}</span>` : ''}
        ${locked ? '<span class="tree-lock" title="Text is readable now, the 3D shape opens higher up">🔒</span>' : ''}
        <span class="tree-tools">
          <button class="tree-btn" data-zoom="${part.id}" tabindex="-1" ${focusable ? '' : 'disabled'} title="Zoom the model to it">◎</button>
        </span>
      </div>`;
  }

  /* ---------------------------------------------------------------- */
  /*  Reveal: walk the tree to a part picked in 3D, 2D or search      */
  /* ---------------------------------------------------------------- */
  reveal(partId, { scroll = true } = {}) {
    if (!partId || !PART_BY_ID[partId] || !this.host) return;
    // "show me where this is" outranks a filter that would hide it
    if (this.filter) {
      this.onFilterChange('');
      this.setFilter('');
    }
    const branch = PART_BRANCH.get(partId);
    if (branch) {
      this.setOpen(branch.id, true);
      const region = BRANCH_PARENT.get(branch.id);
      if (region) this.setOpen(region.id, true);
      this._save();
    }
    this.render();
    if (scroll) {
      this.host.querySelector(`[data-part="${cssId(partId)}"]`)?.scrollIntoView({ block: 'nearest' });
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Interaction                                                     */
  /* ---------------------------------------------------------------- */
  _wire() {
    if (!this.host) return;

    this.host.addEventListener('click', (e) => {
      const zoom = e.target.closest('[data-zoom]');
      if (zoom) {
        e.stopPropagation();
        if (!zoom.disabled) this.onZoom(zoom.dataset.zoom);
        return;
      }
      const layers = e.target.closest('[data-layers]');
      if (layers) {
        e.stopPropagation();
        this.onShowLayers(layers.dataset.layers);
        return;
      }
      const quiz = e.target.closest('[data-quiz]');
      if (quiz) {
        e.stopPropagation();
        this.onQuizNode(quiz.dataset.quiz);
        return;
      }
      const partRow = e.target.closest('[data-part]');
      if (partRow) {
        this.onSelect(partRow.dataset.part);
        return;
      }
      const nodeRow = e.target.closest('[data-node]');
      if (nodeRow) {
        const id = nodeRow.dataset.node;
        if (this.filter) {
          this.onFilterChange('');
          this.setFilter('');
        }
        this.toggle(id);
        this.render();
        this.host.querySelector(`[data-node="${cssId(id)}"]`)?.focus();
      }
    });

    // roving keyboard navigation across the rows that are actually on screen
    this.host.addEventListener('keydown', (e) => {
      const row = e.target.closest('.tree-row');
      if (!row) return;
      const rows = [...this.host.querySelectorAll('.tree-row')];
      const i = rows.indexOf(row);
      const go = (n) => {
        const target = rows[Math.max(0, Math.min(rows.length - 1, n))];
        target?.focus();
        target?.scrollIntoView({ block: 'nearest' });
      };
      const refocus = (id) => this.host.querySelector(`[data-node="${cssId(id)}"]`)?.focus();
      if (e.key === 'ArrowDown') { e.preventDefault(); go(i + 1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); go(i - 1); return; }
      if (e.key === 'Home') { e.preventDefault(); go(0); return; }
      if (e.key === 'End') { e.preventDefault(); go(rows.length - 1); return; }
      if (row.dataset.part) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.onSelect(row.dataset.part); }
        if (e.key === 'ArrowRight') { e.preventDefault(); this.onZoom(row.dataset.part); }
        return;
      }
      const id = row.dataset.node;
      if (e.key === 'ArrowRight' && !this.isOpen(id)) {
        e.preventDefault();
        this.setOpen(id, true);
        this.render();
        refocus(id);
        return;
      }
      if (e.key === 'ArrowLeft' && this.isOpen(id)) {
        e.preventDefault();
        this.setOpen(id, false);
        this.render();
        refocus(id);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle(id);
        this.render();
        refocus(id);
      }
    });
  }
}

/** "Head & Neck › Brain & meninges" — for status lines and quiz titles. */
export function nodeTitle(nodeId) {
  const node = TREE_NODE_BY_ID.get(nodeId);
  if (!node) return 'Whole body';
  const region = BRANCH_PARENT.get(node.id);
  return region ? `${region.name} › ${node.name}` : node.name;
}

export default PartTree;
