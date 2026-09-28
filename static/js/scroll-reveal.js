/**
 * Luxury scroll-reveal — IntersectionObserver (luxury_motion_skill)
 * One-shot · HTMX-ready · compositor-only CSS classes
 */

window.ScrollRevealModule = (function () {
  'use strict';

  let observer = null;
  let holdObserver = null;
  let observed = new Set();

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function markVisible(el, delayMs) {
    if (el.classList.contains('is-visible')) {
      return;
    }
    if (delayMs > 0 && !prefersReducedMotion()) {
      window.setTimeout(function () {
        el.classList.add('is-visible');
      }, delayMs);
      return;
    }
    el.classList.add('is-visible');
  }

  function revealAllImmediate(root) {
    const scope = root || document;
    scope.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  function observeEl(el) {
    if (!el || observed.has(el) || el.classList.contains('is-visible')) {
      return;
    }
    observed.add(el);
    if (el.hasAttribute('data-reveal-hold')) {
      if (holdObserver) {
        holdObserver.observe(el);
      }
      return;
    }
    if (observer) {
      observer.observe(el);
    }
  }

  function initIn(root) {
    const scope = root || document;

    if (prefersReducedMotion()) {
      revealAllImmediate(scope);
      return;
    }

    scope.querySelectorAll('.reveal:not(.is-visible)').forEach(observeEl);
  }

  function init() {
    destroy();

    if (prefersReducedMotion()) {
      revealAllImmediate(document);
      return {
        destroy: destroy,
        refresh: function (root) { revealAllImmediate(root || document); }
      };
    }

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        markVisible(entry.target, 0);
        observer.unobserve(entry.target);
        observed.delete(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -48px 0px' });

    holdObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        const el = entry.target;
        const delay = el.hasAttribute('data-reveal-delay')
          ? parseInt(el.getAttribute('data-reveal-delay'), 10) || 0
          : 200;
        markVisible(el, delay);
        holdObserver.unobserve(el);
        observed.delete(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -22% 0px' });

    initIn(document);

    return {
      destroy: destroy,
      refresh: initIn
    };
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (holdObserver) {
      holdObserver.disconnect();
      holdObserver = null;
    }
    observed.clear();
  }

  return {
    init: init
  };
})();
