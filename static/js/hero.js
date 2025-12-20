/**
 * Hero секція: HTMX-ready з parallax та sessionStorage
 * 100% кросплатформенне рішення (iOS, Android, OPPO, Windows, Mac)
 * 
 * Функціонал:
 * - Відео грає один раз за сесію браузера (sessionStorage)
 * - Після завершення зберігається на останньому кадрі
 * - HTMX cleanup та реініціалізація
 * - JS parallax через requestAnimationFrame
 * - Синхронізація тексту з відео (5 секунда)
 * - Retry механізм для надійності
 */

(function () {
  'use strict';

  let heroInstance = null;

  // ========================================================================
  // HERO CONTROLLER FACTORY
  // ========================================================================

  function createHeroController() {
    const controller = {
      video: null,
      videoWrapper: null,
      textElements: null,
      textAnimated: false,
      listeners: [],
      rafId: null,
      scrollTicking: false,
      initAttempts: 0,

      // Ініціалізація з retry
      init: function () {
        this.video = document.querySelector('.hero__video');
        this.videoWrapper = document.querySelector('.hero__video-wrapper');
        this.textElements = document.querySelectorAll('.hero__text');

        if (!this.video || !this.videoWrapper || !this.textElements.length) {
          // Retry якщо DOM ще не готовий
          if (this.initAttempts < 10) {
            this.initAttempts++;
            const self = this;
            setTimeout(() => { self.init(); }, 10);
          }
          return;
        }

        // Перевірити sessionStorage (відео завершено в поточній сесії)
        if (sessionStorage.getItem('heroVideoCompleted') === 'true') {
          this.setupStaticMode();
          return;
        }

        // Скинути стан тексту
        this.textElements.forEach((el) => {
          el.classList.remove('hero__text--visible');
          el.classList.remove('hero__text--static');
          el.classList.remove('hero__text--error');
        });

        // Відео видиме одразу після init (без затримки на canplay)
        this.video.classList.add('hero__video--visible');

        // Заборонити controls та loop
        this.video.controls = false;
        this.video.loop = false;

        this.setupVideoListeners();
        this.setupParallax();
      },

      // Налаштувати статичний режим (відео вже було відтворено)
      setupStaticMode: function () {
        const self = this;

        // КРИТИЧНО: Вимкнути autoplay ПЕРЕД будь-якими діями
        this.video.autoplay = false;
        this.video.pause();

        // Додати класи
        this.video.classList.add('hero__video--static', 'hero__video--ended', 'hero__video--visible');

        // Показати текст одразу
        this.textElements.forEach((el) => {
          el.classList.add('hero__text--static');
        });

        // Встановити на останній кадр
        function setLastFrame() {
          if (self.video.duration && !isNaN(self.video.duration)) {
            self.video.currentTime = self.video.duration - 0.1;
            return true;
          }
          return false;
        }

        // Спроба 1: синхронно (якщо metadata вже є)
        if (!setLastFrame()) {
          // Спроба 2: чекати loadedmetadata
          this.video.addEventListener('loadedmetadata', () => {
            setLastFrame();
          }, { once: true });

          // Спроба 3: fallback через 500ms
          setTimeout(() => {
            setLastFrame();
          }, 500);
        }

        // Parallax
        this.setupParallax();
      },

      // Відео listeners
      setupVideoListeners: function () {
        const self = this;

        const onTimeUpdate = function () {
          if (self.video.currentTime >= 5 && !self.textAnimated) {
            self.triggerTextAnimation();
          }
        };

        const onEnded = function () {
          self.video.classList.add('hero__video--ended');
          self.video.pause();

          // Встановити на останній кадр
          self.video.currentTime = self.video.duration - 0.1;

          // Заборонити controls
          self.video.controls = false;

          // Зберегти стан у sessionStorage
          sessionStorage.setItem('heroVideoCompleted', 'true');
        };

        const onError = function () {
          console.warn('Hero video load failed');

          // Показати текст при помилці (дати повторну спробу при наступному візиті)
          self.textElements.forEach((el) => {
            el.classList.add('hero__text--error');
          });
        };

        this.video.addEventListener('timeupdate', onTimeUpdate);
        this.video.addEventListener('ended', onEnded);
        this.video.addEventListener('error', onError);

        this.listeners.push(
          { el: this.video, event: 'timeupdate', fn: onTimeUpdate },
          { el: this.video, event: 'ended', fn: onEnded },
          { el: this.video, event: 'error', fn: onError }
        );
      },

      // Анімація тексту
      triggerTextAnimation: function () {
        if (this.textAnimated) {return;}
        this.textAnimated = true;

        const self = this;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            self.textElements.forEach((el) => {
              el.classList.add('hero__text--visible');
            });
          });
        });
      },

      // Parallax
      setupParallax: function () {
        const self = this;

        const onScroll = function () {
          if (!self.scrollTicking) {
            self.rafId = requestAnimationFrame(() => {
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
        if (!this.videoWrapper) {return;}

        const scrolled = window.pageYOffset;
        const heroHeight = this.videoWrapper.offsetHeight;

        if (scrolled < heroHeight) {
          const parallaxValue = scrolled * 0.5;
          // Використовуємо CSS змінну замість inline transform
          this.videoWrapper.style.setProperty('--parallax-offset', `${parallaxValue  }px`);
        }
      },

      // Cleanup
      destroy: function () {
        this.listeners.forEach((listener) => {
          listener.el.removeEventListener(listener.event, listener.fn);
        });
        this.listeners = [];

        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }

        if (this.video) {
          this.video.pause();

          // Видалити статичні класи при cleanup
          this.video.classList.remove('hero__video--static');

          this.video = null;
        }

        if (this.textElements) {
          this.textElements.forEach((el) => {
            el.classList.remove('hero__text--static');
            el.classList.remove('hero__text--error');
          });
        }

        this.videoWrapper = null;
        this.textElements = null;
        this.textAnimated = false;
        this.scrollTicking = false;
        this.initAttempts = 0;
      }
    };

    return controller;
  }

  // ========================================================================
  // HTMX INTEGRATION
  // ========================================================================
  // Примітка: HTMX listeners тепер централізовані в app-init.js
  // для уникнення race conditions. Hero cleanup та ініціалізація
  // виконуються через app-init.js

  // ========================================================================
  // ІНІЦІАЛІЗАЦІЯ
  // ========================================================================

  // Експортуємо createHeroController для використання в app-init.js
  window.createHeroController = createHeroController;

  function initOnLoad() {
    const heroSection = document.querySelector('[data-hero-section]');
    if (heroSection) {
      heroInstance = createHeroController();
      heroInstance.init();
      // Зберігаємо для cleanup в app-init.js
      window.heroInstance = heroInstance;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnLoad);
  } else {
    initOnLoad();
  }
})();
