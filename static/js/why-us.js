/**
 * Why-us interaction controller
 * Desktop: Pure CSS (немає JS)
 * Tablet: Tap to expand
 * Mobile: Intersection Observer для fade-in ефекту
 */

(function() {
  'use strict';

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const isTablet = () => {
    return window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;
  };

  const isMobile = () => {
    return window.matchMedia('(max-width: 767px)').matches;
  };

  // ============================================================================
  // TABLET: TAP TO EXPAND
  // ============================================================================

  const initTabletExpand = () => {
    const slider = document.querySelector('.why-us__slider');
    const slides = document.querySelectorAll('.why-us__slide');
    
    if (!slider || slides.length === 0) return;

    const handleSlideClick = (event) => {
      if (!isTablet()) return;

      const clickedSlide = event.currentTarget;
      const isActive = clickedSlide.classList.contains('is-active');

      if (isActive) {
        // Деактивувати якщо клікнули на активну
        slider.classList.remove('has-active');
        clickedSlide.classList.remove('is-active');
      } else {
        // Активувати цю, деактивувати інші
        slider.classList.add('has-active');
        slides.forEach(slide => slide.classList.remove('is-active'));
        clickedSlide.classList.add('is-active');
      }
    };

    const resetOnResize = debounce(() => {
      if (!isTablet()) {
        slider.classList.remove('has-active');
        slides.forEach(slide => slide.classList.remove('is-active'));
      }
    }, 150);

    slides.forEach(slide => {
      slide.addEventListener('click', handleSlideClick);
    });

    window.addEventListener('resize', resetOnResize);
  };

  // ============================================================================
  // MOBILE: INTERSECTION OBSERVER для fade-in
  // ============================================================================

  const initMobileFadeIn = () => {
    if (!isMobile()) return;

    const slides = document.querySelectorAll('.why-us__slide');
    if (slides.length === 0) return;

    // Intersection Observer з оптимальними налаштуваннями
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px', /* Trigger трохи пізніше для кращого ефекту */
      threshold: [0, 0.3, 0.6, 1] /* Множинні пороги для плавності */
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        /* Додаємо клас коли картка >30% видима */
        if (entry.intersectionRatio > 0.3) {
          entry.target.classList.add('is-visible');
        } else {
          /* Опціонально: можна прибрати клас при виході */
          /* entry.target.classList.remove('is-visible'); */
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    slides.forEach(slide => {
      observer.observe(slide);
    });

    /* Cleanup при resize (якщо більше не mobile) */
    const cleanupOnResize = debounce(() => {
      if (!isMobile()) {
        observer.disconnect();
        slides.forEach(slide => slide.classList.remove('is-visible'));
      }
    }, 150);

    window.addEventListener('resize', cleanupOnResize);
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const init = () => {
    initTabletExpand();
    initMobileFadeIn();
  };

  /* Запуск після завантаження DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

