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
        
        // Оновлюємо клас на body на основі класу main
        const mainElement = document.getElementById('main');
        if (mainElement) {
          // Спочатку видаляємо всі body класи сторінок
          document.body.classList.remove('body--index', 'body--about');
          
          // Додаємо відповідний клас
          if (mainElement.classList.contains('main--index')) {
            document.body.classList.add('body--index');
            console.log('[AppInit] Added body--index class after HTMX swap');
          } else if (mainElement.classList.contains('main--about')) {
            document.body.classList.add('body--about');
            console.log('[AppInit] Added body--about class after HTMX swap');
          }
          // contacts не має body класу
        }
        
        // Невелика затримка для гарантії що DOM готовий
        setTimeout(function() {
          initAllModules();
          
          // Обробка якорів після HTMX навігації
          if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            const targetElement = document.getElementById(hash);
            
            if (targetElement) {
              // Затримка для гарантії що акордеони ініціалізовані
              setTimeout(function() {
                // Якщо це акордеон - відкриваємо його
                if (targetElement.classList.contains('accordion')) {
                  const header = targetElement.querySelector('.accordion__header');
                  if (header) {
                    header.click();
                    
                    // Плавний скрол до акордеона
                    setTimeout(function() {
                      targetElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }, 100);
                  }
                } else {
                  // Якщо не акордеон - просто скрол
                  targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }
              }, 200); // Затримка після ініціалізації модулів
            }
          }
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
    
    // Fallback: додаємо клас на body для сторінки "про нас" якщо його немає
    // Це потрібно для старих браузерів без підтримки :has()
    const mainElement = document.getElementById('main');
    if (mainElement && mainElement.classList.contains('main--about')) {
      if (!document.body.classList.contains('body--about')) {
        document.body.classList.add('body--about');
        console.log('[AppInit] Added body--about class as fallback');
      }
    }
  }

  // Запускаємо після завантаження DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Якщо DOM вже завантажений (наприклад, скрипт defer)
    init();
  }

})();

