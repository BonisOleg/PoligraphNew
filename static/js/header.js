/**
 * Header menu — Figma shell (desktop nav, mobile burger).
 * Public API kept for app-init.js: HeaderModule.init() → { destroy, close, open }
 */

window.HeaderModule = (function() {
  'use strict';

  const MQ = '(max-width: 1099px)';

  let header = null;
  let toggleButton = null;
  let nav = null;
  let listeners = [];

  function isMobile() {
    return window.matchMedia(MQ).matches;
  }

  function addListener(el, event, fn) {
    el.addEventListener(event, fn);
    listeners.push({ el: el, event: event, fn: fn });
  }

  function setOpen(open) {
    if (!header || !toggleButton || !nav) { return; }

    if (!isMobile()) {
      open = false;
    }

    header.classList.toggle('is-open', open);
    toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggleButton.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');

    if (isMobile()) {
      if (open) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
    } else {
      nav.removeAttribute('hidden');
    }
  }

  function openMenu() { setOpen(true); }
  function closeMenu() { setOpen(false); }

  function onToggle(event) {
    event.preventDefault();
    const open = header && header.classList.contains('is-open');
    setOpen(!open);
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  }

  function onResize() {
    setOpen(false);
  }

  function onNavClick(event) {
    const link = event.target.closest('.header__nav-link');
    if (link) {
      closeMenu();
    }
  }

  function init() {
    destroy();

    header = document.querySelector('.header');
    toggleButton = document.querySelector('.header__toggle');
    nav = document.getElementById('main-navigation');

    if (!header || !toggleButton || !nav) {
      return { destroy: destroy, close: closeMenu, open: openMenu };
    }

    addListener(toggleButton, 'click', onToggle);
    addListener(document, 'keydown', onKeydown);
    addListener(window, 'resize', onResize);
    addListener(nav, 'click', onNavClick);

    setOpen(false);

    return { destroy: destroy, close: closeMenu, open: openMenu };
  }

  function destroy() {
    listeners.forEach(function(listener) {
      listener.el.removeEventListener(listener.event, listener.fn);
    });
    listeners = [];
    header = null;
    toggleButton = null;
    nav = null;
  }

  return { init: init };
})();
