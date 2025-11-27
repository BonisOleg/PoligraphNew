/**
 * Централізована система ініціалізації JavaScript модулів
 * Підтримує HTMX навігацію та звичайне завантаження сторінок
 * 
 * ПРАВИЛА:
 * - НЕ використовувати eval або динамічне виконання коду
 * - Використовувати тільки const/let (ніколи var)
 * - Всі обробники подій мають cleanup функції
 */

(function() {
  'use strict';

  // ============================================================================
  // РЕЄСТР МОДУЛІВ
  // ============================================================================
  
  // Тут зберігаються всі ініціалізовані модулі
  const moduleRegistry = {
    header: null,
    accordion: null,
    whyUs: null,
    footerAccordion: null
  };

  // ============================================================================
  // ФУНКЦІЇ ІНІЦІАЛІЗАЦІЇ ТА ОЧИЩЕННЯ
  // ============================================================================

  /**
   * Ініціалізує всі модулі залежно від того, які є на сторінці
   */
  function initAllModules() {
    // Header є на всіх сторінках
    if (window.HeaderModule) {
      moduleRegistry.header = window.HeaderModule.init();
    }

    // Перевіряємо чи є акордеони на сторінці (для "Про нас")
    const accordions = document.querySelectorAll('.accordion');
    if (accordions.length > 0 && window.AccordionModule) {
      moduleRegistry.accordion = window.AccordionModule.init();
    }

    // Перевіряємо чи є секція "Чому ми" (для головної)
    const whyUsSection = document.querySelector('.why-us');
    if (whyUsSection && window.WhyUsModule) {
      moduleRegistry.whyUs = window.WhyUsModule.init();
    }

    // Footer акордеони є на всіх сторінках
    if (window.FooterAccordionModule) {
      moduleRegistry.footerAccordion = window.FooterAccordionModule.init();
    }

    console.log('[AppInit] Modules initialized:', Object.keys(moduleRegistry).filter(k => moduleRegistry[k]));
  }

  /**
   * Очищує всі модулі перед HTMX swap
   */
  function cleanupAllModules() {
    // Викликаємо destroy() для кожного активного модуля
    Object.keys(moduleRegistry).forEach(function(key) {
      const module = moduleRegistry[key];
      if (module && typeof module.destroy === 'function') {
        module.destroy();
        console.log('[AppInit] Destroyed:', key);
      }
      moduleRegistry[key] = null;
    });
  }

  // ============================================================================
  // HTMX INTEGRATION
  // ============================================================================

  /**
   * Налаштовує HTMX event listeners
   */
  function setupHTMXListeners() {
    // Перевіряємо чи HTMX завантажений
    if (typeof htmx === 'undefined') {
      // Якщо ні - спробуємо ще раз через 100ms
      setTimeout(setupHTMXListeners, 100);
      return;
    }

    // ПЕРЕД заміною контенту - очищуємо старі модулі
    document.body.addEventListener('htmx:beforeSwap', function(event) {
      // Перевіряємо що swap відбувається для main контенту
      if (event.detail.target && event.detail.target.id === 'main') {
        console.log('[AppInit] beforeSwap - cleaning up modules');
        cleanupAllModules();
      }
    });

    // ПІСЛЯ заміни контенту - ініціалізуємо модулі заново
    document.body.addEventListener('htmx:afterSwap', function(event) {
      // Перевіряємо що swap відбувся для main контенту
      if (event.detail.target && event.detail.target.id === 'main') {
        console.log('[AppInit] afterSwap - reinitializing modules');
        
        // Невелика затримка для гарантії що DOM готовий
        setTimeout(function() {
          initAllModules();
        }, 50);
      }
    });

    console.log('[AppInit] HTMX listeners set up');
  }

  // ============================================================================
  // ПОЧАТКОВА ІНІЦІАЛІЗАЦІЯ
  // ============================================================================

  /**
   * Запускається при першому завантаженні сторінки
   */
  function init() {
    console.log('[AppInit] Initial page load - initializing');
    setupHTMXListeners();
    initAllModules();
  }

  // Запускаємо після завантаження DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Якщо DOM вже завантажений (наприклад, скрипт defer)
    init();
  }

})();

