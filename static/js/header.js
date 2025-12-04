/**
 * Header menu controller - капсула що розтягується
 * - CSS containment для iOS Safari перформансу
 * - GPU-прискорена анімація (width + opacity)
 * - Accessibility-compliant (WCAG 2.1 AA)
 * - HTMX-ready з правильним lifecycle
 * - iOS/Android оптимізована
 */

window.HeaderModule = (function() {
  'use strict';

  // ============================================================================
  // STATE
  // ============================================================================

  let capsule = null;
  let toggleButton = null;
  let nav = null;
  let listeners = [];
  let closeTimeout = null;

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  /**
   * Відкриває меню/капсулу з анімацією
   * 1. Капсула розтягується (0.7s - width анімація)
   * 2. MENU → X (0.3s - opacity)
   * 3. Посилання з'являються (затримка 0.7s, потім opacity 0→1 за 0.3s)
   */
  function openMenu() {
    if (!capsule || !toggleButton || !nav) return;
    
    // Очищаємо timeout якщо є
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    
    // КРОК 1: Розтягуємо капсулу (width 120px → 30vw/100vw)
    capsule.setAttribute('data-open', 'true');
    
    // КРОК 2: ARIA для accessibility
    toggleButton.setAttribute('aria-expanded', 'true');
    toggleButton.setAttribute('aria-label', 'Закрити меню');
    nav.removeAttribute('hidden');
    
    // КРОК 3: Focus на перший link після анімації капсули + появи контенту
    const firstLink = nav.querySelector('.header__nav-link');
    if (firstLink) {
      // 700ms (анімація розтягування) + 300ms (opacity появи) = 1000ms
      setTimeout(function() {
        firstLink.focus();
      }, 1000);
    }
  }

  /**
   * Закриває меню/капсулу з анімацією
   * 1. X → MENU (0.3s - opacity)
   * 2. Посилання зникають (0.3s - opacity)
   * 3. Капсула стискується (0.7s - width анімація)
   */
  function closeMenu() {
    if (!capsule || !toggleButton || !nav) return;
    
    // КРОК 1: Стискаємо капсулу (width 30vw/100vw → 120px)
    capsule.setAttribute('data-open', 'false');
    
    // КРОК 2: ARIA
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', 'Відкрити меню');
    
    // КРОК 3: Hidden атрибут після анімації стискання (700ms)
    closeTimeout = setTimeout(function() {
      nav.setAttribute('hidden', '');
    }, 700);
    
    // Focus повертаємо на кнопку
    toggleButton.focus();
  }

  /**
   * Toggle меню
   */
  function toggleMenu() {
    if (!capsule) return;
    
    const isOpen = capsule.getAttribute('data-open') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /**
   * Ініціалізація модуля
   */
  function init() {
    capsule = document.querySelector('.header__capsule');
    toggleButton = capsule ? capsule.querySelector('.header__toggle') : null;
    nav = capsule ? capsule.querySelector('.header__nav') : null;

    if (!capsule || !toggleButton || !nav) {
      console.log('[Header] Required elements not found');
      return null;
    }

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    // Toggle handler (натискання на кнопку)
    const handleToggle = function(e) {
      e.stopPropagation();
      toggleMenu();
    };

    // Close на outside click (клік поза капсулою)
    const handleDocumentClick = function(e) {
      if (capsule && !capsule.contains(e.target)) {
        closeMenu();
      }
    };

    // Close на Escape (клавіша Escape)
    const handleEscape = function(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeMenu();
      }
    };

    // Close на link click (натискання на посилання у меню)
    const navLinks = nav.querySelectorAll('.header__nav-link');
    const handleLinkClick = function(e) {
      // Затримка 50ms щоб HTMX встиг спрацювати перед закриттям
      setTimeout(function() {
        closeMenu();
      }, 50);
    };

    // ========================================================================
    // ADD LISTENERS
    // ========================================================================

    toggleButton.addEventListener('click', handleToggle);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    listeners.push(
      { el: toggleButton, event: 'click', fn: handleToggle },
      { el: document, event: 'click', fn: handleDocumentClick },
      { el: document, event: 'keydown', fn: handleEscape }
    );

    navLinks.forEach(function(link) {
      link.addEventListener('click', handleLinkClick);
      listeners.push({ el: link, event: 'click', fn: handleLinkClick });
    });

    console.log('[Header] Module initialized');

    return {
      destroy: destroy,
      close: closeMenu,
      open: openMenu
    };
  }

  /**
   * Cleanup (для HTMX afterSwap або при видаленні компонента)
   * Видаляє всі event listeners та очищує таймери
   */
  function destroy() {
    console.log('[Header] Destroying module');

    // Очищаємо таймер якщо є
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }

    // Видаляємо всі listeners
    listeners.forEach(function(listener) {
      listener.el.removeEventListener(listener.event, listener.fn);
    });

    // Очищаємо масив та змінні
    listeners = [];
    capsule = null;
    toggleButton = null;
    nav = null;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    init: init
  };

})();
