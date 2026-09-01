/**
 * mobile.js — the phone shell.
 *
 * On a desktop the atlas is a model with panels floating over it. On a phone
 * there is no room for that: the model needs the whole screen, and the panels
 * need to be reachable with a thumb. This module turns the same DOM into a
 * bottom-sheet interface driven by a tab bar, without duplicating any markup —
 * the left rail, the details panel, the toolbar and the search box are the very
 * same elements, just presented as sheets.
 *
 * Everything here is a no-op above the breakpoint, so the desktop layout is
 * untouched.
 */

const BREAKPOINT = 860;
const $ = (s) => document.querySelector(s);

export class MobileShell {
  constructor({ onSheetChange, actions = {} } = {}) {
    this.onSheetChange = onSheetChange || (() => {});
    this.actions = actions;
    this.open = null;

    this.bar = $('#mobileBar');
    this.scrim = $('#sheetScrim');
    this.sheets = {
      left: $('#leftPanel'),
      right: $('#rightPanel'),
      tools: $('#toolbar'),
      search: $('#searchSheet'),
      more: $('#moreSheet'),
    };

    this._wire();
    this.apply();
    window.addEventListener('resize', () => this.apply());
    window.addEventListener('orientationchange', () => setTimeout(() => this.apply(), 120));
  }

  get isMobile() {
    return window.innerWidth <= BREAKPOINT;
  }

  _wire() {
    this.bar?.querySelectorAll('.mb-btn').forEach((b) => {
      b.addEventListener('click', () => this.toggle(b.dataset.sheet));
    });
    this.scrim?.addEventListener('click', () => this.close());

    // swipe a sheet down to dismiss it — the gesture people already expect
    for (const [key, el] of Object.entries(this.sheets)) {
      if (!el) continue;
      let start = null;
      el.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        // only start a dismiss drag from the top strip of the sheet, so that
        // scrolling a long list of parts still scrolls
        const r = el.getBoundingClientRect();
        if (e.clientY - r.top > 44) return;
        start = { y: e.clientY, t: performance.now() };
      });
      el.addEventListener('pointermove', (e) => {
        if (!start) return;
        const dy = Math.max(0, e.clientY - start.y);
        el.style.transform = `translateY(${dy}px)`;
      });
      const end = (e) => {
        if (!start) return;
        const dy = Math.max(0, (e.clientY ?? start.y) - start.y);
        el.style.transform = '';
        if (dy > 70) this.close();
        start = null;
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    }

    $('#moreSheet')?.querySelectorAll('[data-more]').forEach((b) => {
      b.addEventListener('click', () => {
        const fn = this.actions[b.dataset.more];
        this.close();
        if (fn) fn();
      });
    });
  }

  /** Enter or leave the phone layout when the window crosses the breakpoint. */
  apply() {
    const on = this.isMobile;
    if (on === this._applied) {
      if (on) this._syncBar();
      return;
    }
    this._applied = on;
    document.body.classList.toggle('is-mobile', on);
    const toolbar = this.sheets.tools;

    if (on) {
      toolbar?.classList.add('as-sheet');
      // move the search field into its sheet so it gets the full width
      const wrap = document.querySelector('.search-wrap');
      const slot = $('#searchSlot');
      if (wrap && slot && wrap.parentElement !== slot) {
        this._searchHome = wrap.parentElement;
        slot.appendChild(wrap);
      }
      // panels start closed rather than covering the body
      this.close();
    } else {
      toolbar?.classList.remove('as-sheet');
      const wrap = document.querySelector('.search-wrap');
      if (wrap && this._searchHome) this._searchHome.insertBefore(wrap, this._searchHome.firstChild);
      for (const el of Object.values(this.sheets)) el?.classList.remove('open');
      if (this.scrim) this.scrim.hidden = true;
      // the details panel is driven by its own `hidden` flag on desktop
      if (this.sheets.left) this.sheets.left.hidden = false;
      if (this.sheets.more) this.sheets.more.hidden = true;
      if (this.sheets.search) this.sheets.search.hidden = true;
      this.open = null;
    }
    this.onSheetChange(this.open);
  }

  toggle(name) {
    if (this.open === name) this.close();
    else this.show(name);
  }

  show(name) {
    if (!this.isMobile) return;
    const el = this.sheets[name];
    if (!el) return;
    for (const [key, node] of Object.entries(this.sheets)) {
      if (!node || key === name) continue;
      node.classList.remove('open');
      if (key === 'more' || key === 'search') node.hidden = true;
      if (key === 'left') node.hidden = true;
    }
    el.hidden = false;
    // force a frame so the transform transition actually runs from off-screen
    requestAnimationFrame(() => el.classList.add('open'));
    if (this.scrim) this.scrim.hidden = false;
    this.open = name;
    this._syncBar();
    if (name === 'search') setTimeout(() => $('#search')?.focus(), 220);
    this.onSheetChange(name);
  }

  close() {
    for (const [key, el] of Object.entries(this.sheets)) {
      if (!el) continue;
      el.classList.remove('open');
      if (key !== 'tools') {
        // let the slide-out finish before the element leaves the layout
        setTimeout(() => {
          if (!el.classList.contains('open')) el.hidden = true;
        }, 260);
      }
    }
    if (this.scrim) this.scrim.hidden = true;
    this.open = null;
    this._syncBar();
    this.onSheetChange(null);
  }

  _syncBar() {
    this.bar?.querySelectorAll('.mb-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.sheet === this.open);
    });
  }

  /** Called when a part is selected: on a phone, show the reading sheet. */
  revealDetails() {
    if (!this.isMobile) return;
    this.show('right');
  }
}

export default MobileShell;
