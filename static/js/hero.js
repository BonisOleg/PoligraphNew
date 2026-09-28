/**
 * Hero: статичне зображення з плавною появою + parallax
 * HTMX-ready
 */

(function () {
  'use strict';

  let heroInstance = null;

  function createHeroController() {
    const controller = {
      mediaPlane: null,
      media: null,
      content: null,
      listeners: [],
      rafId: null,
      scrollTicking: false,
      initAttempts: 0,

      init: function () {
        this.mediaPlane = document.querySelector('.hero__media-plane');
        this.media = document.querySelector('.hero__media');
        this.content = document.querySelector('.hero__content');

        if (!this.mediaPlane || !this.media || !this.content) {
          if (this.initAttempts < 10) {
            this.initAttempts++;
            const self = this;
            setTimeout(function () { self.init(); }, 10);
          }
          return;
        }

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reducedMotion) {
          this.content.classList.add('hero__content--visible');
          this.media.classList.add('hero__media--visible');
          return;
        }

        // Подвійний rAF: стартові стилі (opacity/scale) встигають застосуватись
        // до додавання --visible → плавне «вспливання», а не миттєвий кадр.
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            controller.content.classList.add('hero__content--visible');
            controller.media.classList.add('hero__media--visible');
          });
        });

        this.setupParallax();
      },

      setupParallax: function () {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        const self = this;
        const onScroll = function () {
          if (!self.scrollTicking) {
            self.rafId = requestAnimationFrame(function () {
              self.updateParallax();
              self.scrollTicking = false;
            });
            self.scrollTicking = true;
          }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        this.listeners.push({ el: window, event: 'scroll', fn: onScroll });
      },

      updateParallax: function () {
        if (!this.mediaPlane) { return; }
        const scrolled = window.pageYOffset || 0;
        const heroHeight = this.mediaPlane.offsetHeight || 1;
        if (scrolled < heroHeight) {
          this.mediaPlane.style.setProperty(
            '--parallax-offset',
            (scrolled * 0.35) + 'px'
          );
        }
      },

      destroy: function () {
        this.listeners.forEach(function (listener) {
          listener.el.removeEventListener(listener.event, listener.fn);
        });
        this.listeners = [];

        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }

        if (this.content) {
          this.content.classList.remove('hero__content--visible');
        }

        if (this.media) {
          this.media.classList.remove('hero__media--visible');
        }

        if (this.mediaPlane) {
          this.mediaPlane.style.removeProperty('--parallax-offset');
        }

        this.mediaPlane = null;
        this.media = null;
        this.content = null;
        this.scrollTicking = false;
        this.initAttempts = 0;
      }
    };

    return controller;
  }

  window.createHeroController = createHeroController;

  function initOnLoad() {
    const heroSection = document.querySelector('[data-hero-section]');
    if (heroSection) {
      heroInstance = createHeroController();
      heroInstance.init();
      window.heroInstance = heroInstance;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnLoad);
  } else {
    initOnLoad();
  }
})();
