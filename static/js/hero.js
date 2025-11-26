/**
 * Hero секція: HTMX-ready з parallax
 * 100% кросплатформенне рішення
 * 
 * Функціонал:
 * - HTMX cleanup та реініціалізація
 * - JS parallax через requestAnimationFrame
 * - Синхронізація тексту з відео (5 секунда)
 * - Явна зупинка на останньому кадрі
 * - Повний cleanup без memory leaks
 * - Retry механізм для надійності
 */

(function() {
  'use strict';

  let heroInstance = null;

  // Window-based прапор (очищається при reload, зберігається при HTMX)
  if (typeof window.heroVideoPlayed === 'undefined') {
    window.heroVideoPlayed = false;
  }

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
      init: function() {
        this.video = document.querySelector('.hero__video');
        this.videoWrapper = document.querySelector('.hero__video-wrapper');
        this.textElements = document.querySelectorAll('.hero__text');

        if (!this.video || !this.videoWrapper || !this.textElements.length) {
          // Retry якщо DOM ще не готовий
          if (this.initAttempts < 10) {
            this.initAttempts++;
            const self = this;
            setTimeout(function() { self.init(); }, 50);
          }
          return;
        }

        // Перевірити window прапор
        if (window.heroVideoPlayed) {
          this.setupStaticMode();
          return;
        }

        // Скинути стан тексту
        this.textElements.forEach(function(el) {
          el.classList.remove('hero__text--visible');
          el.classList.remove('hero__text--static');
          el.classList.remove('hero__text--error');
        });

        this.setupVideoListeners();
        this.setupParallax();
        this.setupVisibilityListener();
        this.setupKeyboardControls();
        this.startVideo();
      },

      // Налаштувати статичний режим (відео вже було відтворено)
      setupStaticMode: function() {
        const self = this;
        
        // Вимкнути autoplay
        this.video.autoplay = false;
        this.video.removeAttribute('autoplay');
        
        // Додати класи
        this.video.classList.add('hero__video--static', 'hero__video--ended', 'hero__video--loaded');
        
        // Показати текст одразу
        this.textElements.forEach(function(el) {
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
          this.video.addEventListener('loadedmetadata', function() {
            setLastFrame();
          }, { once: true });
          
          // Спроба 3: fallback через 500ms
          setTimeout(function() {
            setLastFrame();
          }, 500);
        }
        
        // Parallax
        this.setupParallax();
      },

      // Відео listeners
      setupVideoListeners: function() {
        const self = this;

        const onCanPlay = function() {
          self.video.classList.add('hero__video--loaded');
          
          // Спробувати відтворити якщо autoplay не спрацював
          if (self.video.paused) {
            self.video.play().catch(function() {});
          }
        };

        const onTimeUpdate = function() {
          if (self.video.currentTime >= 5 && !self.textAnimated) {
            self.triggerTextAnimation();
          }
        };

        const onEnded = function() {
          self.video.classList.add('hero__video--ended');
          self.video.pause();
          
          // Встановити на останній кадр
          self.video.currentTime = self.video.duration - 0.1;
          
          // Заборонити controls
          self.video.removeAttribute('controls');
          self.video.controls = false;
          
          // Встановити window прапор
          window.heroVideoPlayed = true;
        };

        const onError = function() {
          console.warn('Hero video load failed');
          
          // Використовувати КЛАСИ замість inline styles
          self.textElements.forEach(function(el) {
            el.classList.add('hero__text--error');
          });
          
          // Встановити прапор щоб не грати повторно
          window.heroVideoPlayed = true;
        };

        // canplay замість loadedmetadata - надійніше для Safari
        this.video.addEventListener('canplay', onCanPlay);
        this.video.addEventListener('timeupdate', onTimeUpdate);
        this.video.addEventListener('ended', onEnded);
        this.video.addEventListener('error', onError);

        this.listeners.push(
          { el: this.video, event: 'canplay', fn: onCanPlay },
          { el: this.video, event: 'timeupdate', fn: onTimeUpdate },
          { el: this.video, event: 'ended', fn: onEnded },
          { el: this.video, event: 'error', fn: onError }
        );
      },

      // Запуск відео
      startVideo: function() {
        const self = this;
        
        // НЕ використовуємо load() - може спричинити миготіння
        // Просто пробуємо play() з retry
        const tryPlay = function() {
          if (!self.video) return;
          
          self.video.play().catch(function(err) {
            console.warn('Autoplay attempt failed:', err);
            // Retry через 200ms (для повільних пристроїв)
            setTimeout(tryPlay, 200);
          });
        };
        
        tryPlay();

        // Fallback для тексту
        setTimeout(function() {
          if (!self.textAnimated) {
            self.triggerTextAnimation();
          }
        }, 6000);
      },

      // Анімація тексту
      triggerTextAnimation: function() {
        if (this.textAnimated) return;
        this.textAnimated = true;

        const self = this;

        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            self.textElements.forEach(function(el) {
              el.classList.add('hero__text--visible');
            });
          });
        });
      },

      // Parallax
      setupParallax: function() {
        const self = this;

        const onScroll = function() {
          if (!self.scrollTicking) {
            self.rafId = requestAnimationFrame(function() {
              self.updateParallax();
              self.scrollTicking = false;
            });
            self.scrollTicking = true;
          }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        this.listeners.push({ el: window, event: 'scroll', fn: onScroll });
      },

      updateParallax: function() {
        if (!this.videoWrapper) return;
        
        const scrolled = window.pageYOffset;
        const heroHeight = this.videoWrapper.offsetHeight;

        if (scrolled < heroHeight) {
          const parallaxValue = scrolled * 0.5;
          this.videoWrapper.style.transform = 
            'translateX(-50%) translateY(' + parallaxValue + 'px)';
        }
      },

      // Visibility
      setupVisibilityListener: function() {
        const self = this;
        
        const onVisibilityChange = function() {
          if (!self.video) return;
          
          if (document.hidden) {
            self.video.pause();
          } else if (!self.video.ended && !self.video.classList.contains('hero__video--ended')) {
            self.video.play().catch(function() {});
          }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        this.listeners.push(
          { el: document, event: 'visibilitychange', fn: onVisibilityChange }
        );
      },

      // Keyboard
      setupKeyboardControls: function() {
        const self = this;
        
        const onKeyDown = function(event) {
          if (!self.video || self.video.classList.contains('hero__video--ended')) return;
          
          const activeTag = event.target.tagName;
          if (['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'].indexOf(activeTag) !== -1) {
            return;
          }

          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            
            if (self.video.paused) {
              self.video.play().catch(function() {});
            } else {
              self.video.pause();
            }
          }
        };

        document.addEventListener('keydown', onKeyDown);
        this.listeners.push({ el: document, event: 'keydown', fn: onKeyDown });
      },

      // Cleanup
      destroy: function() {
        this.listeners.forEach(function(listener) {
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
          this.textElements.forEach(function(el) {
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

  function setupHTMXListeners() {
    if (!document.body || typeof htmx === 'undefined') {
      setTimeout(setupHTMXListeners, 100);
      return;
    }

    document.body.addEventListener('htmx:beforeSwap', function(event) {
      if (event.detail.target.id === 'main' && heroInstance) {
        heroInstance.destroy();
        heroInstance = null;
      }
    });

    document.body.addEventListener('htmx:afterSwap', function(event) {
      if (event.detail.target.id === 'main') {
        // Затримка для повільних пристроїв
        setTimeout(function() {
          const heroSection = document.querySelector('[data-hero-section]');
          if (heroSection && !heroInstance) {
            heroInstance = createHeroController();
            heroInstance.init();
          }
        }, 150);
      }
    });
  }

  // ========================================================================
  // ІНІЦІАЛІЗАЦІЯ
  // ========================================================================

  function initOnLoad() {
    const heroSection = document.querySelector('[data-hero-section]');
    if (heroSection) {
      heroInstance = createHeroController();
      heroInstance.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupHTMXListeners();
      initOnLoad();
    });
  } else {
    setupHTMXListeners();
    initOnLoad();
  }
})();
