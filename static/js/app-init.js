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
    Object.keys(moduleRegistry).forEach((key) => {
      const module = moduleRegistry[key];
      if (module && typeof module.destroy === 'function') {
        module.destroy();
        console.log('[AppInit] Destroyed:', key);
      }
      moduleRegistry[key] = null;
    });
  }

  /**
   * Синхронізує body класи на основі main класів
   * Централізована функція для уникнення дублікатів
   */
  function syncBodyClasses() {
    const mainElement = document.getElementById('main');
    if (!mainElement) { return; }
    
    // Спочатку видаляємо всі body класи сторінок
    document.body.classList.remove('body--index', 'body--about');
    
    // Додаємо відповідний клас
    if (mainElement.classList.contains('main--index')) {
      document.body.classList.add('body--index');
      console.log('[AppInit] Added body--index class');
    } else if (mainElement.classList.contains('main--about')) {
      document.body.classList.add('body--about');
      console.log('[AppInit] Added body--about class');
    }
    // contacts не має body класу
  }

  /**
   * Оновлює активний стан навігації (aria-current="page")
   * на основі поточного URL після HTMX навігації
   */
  function updateNavigationActiveState() {
    const navLinks = document.querySelectorAll('.header__nav-link');
    if (navLinks.length === 0) { return; }
    
    // Отримуємо поточний шлях
    const currentPath = window.location.pathname;
    
    // Видаляємо aria-current з усіх посилань
    navLinks.forEach((link) => {
      link.removeAttribute('aria-current');
    });
    
    // Знаходимо посилання, яке відповідає поточному шляху
    navLinks.forEach((link) => {
      const linkPath = new URL(link.href).pathname;
      
      // Порівнюємо шляхи (з урахуванням trailing slash)
      const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';
      const normalizedLinkPath = linkPath.endsWith('/') ? linkPath : linkPath + '/';
      
      // Для головної сторінки перевіряємо обидва варіанти (/ та /index/)
      if (normalizedCurrentPath === '/' || normalizedCurrentPath === '/index/') {
        if (normalizedLinkPath === '/' || normalizedLinkPath === '/index/') {
          link.setAttribute('aria-current', 'page');
          console.log('[AppInit] Set aria-current="page" for:', link.textContent.trim());
          return;
        }
      }
      
      // Для інших сторінок порівнюємо точно
      if (normalizedCurrentPath === normalizedLinkPath) {
        link.setAttribute('aria-current', 'page');
        console.log('[AppInit] Set aria-current="page" for:', link.textContent.trim());
      }
    });
  }

  // ============================================================================
  // HTMX INTEGRATION
  // ============================================================================

  /**
   * Налаштовує HTMX event listeners
   * Централізована обробка всіх HTMX подій для уникнення race conditions
   */
  function setupHTMXListeners() {
    // Використовуємо утиліту для перевірки HTMX
    if (window.HTMXUtils) {
      window.HTMXUtils.waitForHTMX(initHTMXListeners);
    } else {
      // Fallback якщо утиліта не завантажена
      if (typeof htmx === 'undefined') {
        setTimeout(setupHTMXListeners, 100);
        return;
      }
      initHTMXListeners();
    }
  }

  /**
   * Ініціалізує HTMX listeners (викликається коли HTMX готовий)
   */
  function initHTMXListeners() {

    // ПЕРЕД заміною контенту - виконуємо всі cleanup операції в правильному порядку
    document.body.addEventListener('htmx:beforeSwap', (event) => {
      // Перевіряємо що swap відбувається для main контенту
      if (event.detail.target && event.detail.target.id === 'main') {
        console.log('[AppInit] beforeSwap - cleaning up modules');
        
        // КРОК 1: Очищаємо всі модулі
        cleanupAllModules();
        
        // КРОК 2: Hero cleanup (якщо існує)
        if (window.heroInstance) {
          if (typeof window.heroInstance.destroy === 'function') {
            window.heroInstance.destroy();
          }
          window.heroInstance = null;
        }
      }
    });

    // ПІСЛЯ заміни контенту - ініціалізуємо модулі заново
    document.body.addEventListener('htmx:afterSwap', (event) => {
      // Перевіряємо що swap відбувся для main контенту
      if (event.detail.target && event.detail.target.id === 'main') {
        console.log('[AppInit] afterSwap - reinitializing modules');
        
        // Оновлюємо клас на body на основі класу main
        syncBodyClasses();
        
        // Оновлюємо активний стан навігації
        updateNavigationActiveState();
        
        // Невелика затримка для гарантії що DOM готовий
        setTimeout(() => {
          initAllModules();
          
          // Ініціалізуємо hero якщо є секція
          const heroSection = document.querySelector('[data-hero-section]');
          if (heroSection && !window.heroInstance && window.createHeroController) {
            window.heroInstance = window.createHeroController();
            window.heroInstance.init();
          }
          
          // Обробка якорів після HTMX навігації
          if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            const targetElement = document.getElementById(hash);
            
            if (targetElement) {
              // Затримка для гарантії що акордеони ініціалізовані
              setTimeout(() => {
                // Якщо це акордеон - відкриваємо його
                if (targetElement.classList.contains('accordion')) {
                  const header = targetElement.querySelector('.accordion__header');
                  if (header) {
                    header.click();
                    
                    // Плавний скрол до акордеона
                    setTimeout(() => {
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

    // HTMX error handlers
    document.body.addEventListener('htmx:responseError', (event) => {
      console.error('[AppInit] HTMX response error:', event.detail);
      // Можна додати показ повідомлення користувачу
    });

    document.body.addEventListener('htmx:sendError', (event) => {
      console.error('[AppInit] HTMX send error:', event.detail);
      // Можна додати показ повідомлення користувачу
    });

    console.log('[AppInit] HTMX listeners set up');
  }

  /**
   * Обробка pageshow event для bfcache (back/forward cache)
   */
  function setupPageshowListener() {
    window.addEventListener('pageshow', (event) => {
      // Якщо сторінка завантажена з bfcache
      if (event.persisted) {
        console.log('[AppInit] Page loaded from bfcache - reinitializing');
        // Переініціалізуємо модулі
        initAllModules();
      }
    });
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
    setupPageshowListener();
    
    // Синхронізуємо body класи при першому завантаженні
    syncBodyClasses();
    
    // Оновлюємо активний стан навігації при першому завантаженні
    updateNavigationActiveState();
    
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

