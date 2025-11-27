/**
 * Why-us interaction controller
 * HTMX-ready версія
 * 
 * Desktop: Pure CSS hover
 * Tablet: Tap to expand
 * Mobile: Intersection Observer для fade-in
 * Кнопки: Перехід на /about/ з якорем
 */

window.WhyUsModule = (function() {
  'use strict';

  // ============================================================================
  // ПРИВАТНІ ЗМІННІ
  // ============================================================================

  let listeners = [];
  let observer = null;

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function debounce(fn, delay) {
    let timeoutId;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  function isTablet() {
    return window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;
  }

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  // ============================================================================
  // КНОПКИ "ДІЗНАТИСЯ БІЛЬШЕ"
  // ============================================================================

  /**
   * Налаштовує кнопки для переходу на сторінку "Про нас"
   */
  function setupButtonHandlers() {
    const buttons = document.querySelectorAll('.why-us__slide-button');
    
    if (buttons.length === 0) {
      return;
    }

    buttons.forEach(function(button, index) {
      const slide = button.closest('.why-us__slide');
      if (!slide) return;

      // Визначаємо індекс картки (0, 1, 2)
      const slideIndex = slide.getAttribute('data-slide-index') || index;

      function handleButtonClick(e) {
        e.preventDefault();
        e.stopPropagation();

        // HTMX навігація на сторінку "Про нас"
        // Після завантаження - скрол до відповідного акордеона
        const targetUrl = '/about/';
        const anchorId = '#service-' + slideIndex;

        // Використовуємо HTMX для переходу
        if (typeof htmx !== 'undefined') {
          const mainElement = document.getElementById('main');
          if (mainElement) {
            htmx.ajax('GET', targetUrl, {
              target: '#main',
              swap: 'innerHTML',
              pushUrl: targetUrl
            }).then(function() {
              // Після swap - скролимо до потрібного акордеона
              setTimeout(function() {
                const targetElement = document.querySelector(anchorId);
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  
                  // Відкриваємо акордеон якщо є
                  if (targetElement.classList.contains('accordion')) {
                    const header = targetElement.querySelector('.accordion__header');
                    if (header) {
                      header.click();
                    }
                  }
                }
              }, 300);
            });
          }
        } else {
          // Fallback: звичайний перехід з якорем
          window.location.href = targetUrl + anchorId;
        }
      }

      button.addEventListener('click', handleButtonClick);
      listeners.push({ el: button, event: 'click', fn: handleButtonClick });
    });

    console.log('[WhyUs] Button handlers set up for', buttons.length, 'buttons');
  }

  // ============================================================================
  // TABLET: TAP TO EXPAND
  // ============================================================================

  function initTabletExpand() {
    const slider = document.querySelector('.why-us__slider');
    const slides = document.querySelectorAll('.why-us__slide');
    
    if (!slider || slides.length === 0) {
      return;
    }

    function handleSlideClick(event) {
      if (!isTablet()) return;

      // Ігноруємо клік на кнопку (вона має свій обробник)
      if (event.target.closest('.why-us__slide-button')) {
        return;
      }

      const clickedSlide = event.currentTarget;
      const isActive = clickedSlide.classList.contains('is-active');

      if (isActive) {
        slider.classList.remove('has-active');
        clickedSlide.classList.remove('is-active');
      } else {
        slider.classList.add('has-active');
        slides.forEach(function(slide) {
          slide.classList.remove('is-active');
        });
        clickedSlide.classList.add('is-active');
      }
    }

    const resetOnResize = debounce(function() {
      if (!isTablet()) {
        slider.classList.remove('has-active');
        slides.forEach(function(slide) {
          slide.classList.remove('is-active');
        });
      }
    }, 150);

    slides.forEach(function(slide) {
      slide.addEventListener('click', handleSlideClick);
      listeners.push({ el: slide, event: 'click', fn: handleSlideClick });
    });

    window.addEventListener('resize', resetOnResize);
    listeners.push({ el: window, event: 'resize', fn: resetOnResize });
  }

  // ============================================================================
  // MOBILE: INTERSECTION OBSERVER
  // ============================================================================

  function initMobileFadeIn() {
    if (!isMobile()) {
      return;
    }

    const slides = document.querySelectorAll('.why-us__slide');
    if (slides.length === 0) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px',
      threshold: [0, 0.3, 0.6, 1]
    };

    const observerCallback = function(entries) {
      entries.forEach(function(entry) {
        if (entry.intersectionRatio > 0.3) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    observer = new IntersectionObserver(observerCallback, observerOptions);

    slides.forEach(function(slide) {
      observer.observe(slide);
    });

    const cleanupOnResize = debounce(function() {
      if (!isMobile() && observer) {
        observer.disconnect();
        observer = null;
        slides.forEach(function(slide) {
          slide.classList.remove('is-visible');
        });
      }
    }, 150);

    window.addEventListener('resize', cleanupOnResize);
    listeners.push({ el: window, event: 'resize', fn: cleanupOnResize });
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  function init() {
    const whyUsSection = document.querySelector('.why-us');
    
    if (!whyUsSection) {
      console.log('[WhyUs] Section not found on page');
      return null;
    }

    console.log('[WhyUs] Initializing');

    listeners = [];
    
    setupButtonHandlers();
    initTabletExpand();
    initMobileFadeIn();

    return {
      destroy: destroy
    };
  }

  function destroy() {
    console.log('[WhyUs] Destroying module, removing', listeners.length, 'listeners');

    listeners.forEach(function(listener) {
      listener.el.removeEventListener(listener.event, listener.fn);
    });

    if (observer) {
      observer.disconnect();
      observer = null;
    }

    listeners = [];
  }

  return {
    init: init
  };

})();
