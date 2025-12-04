/**
 * Логіка акордеонів для сторінки "Про нас"
 * Elastic-анімація з динамічним розрахунком висоти
 * Оптимізовано для desktop, tablet, iOS
 * Включена анімація лічильників для статистики
 */

window.AccordionModule = (function() {
  'use strict';

  // Приватні змінні
  let accordions = [];
  let listeners = [];
  let activeAccordion = null;
  let countersAnimated = false;

  /**
   * Анімація лічильника для статистики (оптимізована з requestAnimationFrame)
   */
  function animateCounter(element, duration = 1500) {
    const text = element.textContent.trim();
    const target = parseInt(text, 10) || 0;
    if (target === 0) return;
    
    const start = 0;
    const startTime = performance.now();
    const isPercentage = text.includes('%');
    const suffix = isPercentage ? '%' : '+';
    
    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function для плавності
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target + suffix;
      }
    }
    
    requestAnimationFrame(updateCounter);
  }

  /**
   * Запуск анімації всіх лічильників
   */
  function animateAllCounters() {
    if (countersAnimated) return;
    countersAnimated = true;
    
    const counters = document.querySelectorAll('.accordion__stat-number');
    counters.forEach(function(counter) {
      animateCounter(counter, 2000);
    });
  }

  /**
   * Отримує точну висоту контенту акордеона (оптимізовано без reflow)
   */
  function getContentHeight(accordion) {
    const content = accordion.querySelector('.accordion__content');
    if (!content) return 0;
    
    // Використовуємо scrollHeight для точного вимірювання
    // Без зміни стилів - це швидше та не викликає reflow
    const wasExpanded = accordion.getAttribute('aria-expanded') === 'true';
    
    if (!wasExpanded) {
      // Тимчасово знімаємо обмеження для вимірювання
      const originalHeight = content.style.height;
      const originalMaxHeight = content.style.maxHeight;
      const originalOverflow = content.style.overflow;
      
      content.style.height = 'auto';
      content.style.maxHeight = 'none';
      content.style.overflow = 'visible';
      
      // Використовуємо scrollHeight для точного вимірювання
      const height = content.scrollHeight;
      
      // Повертаємо стилі
      content.style.height = originalHeight;
      content.style.maxHeight = originalMaxHeight;
      content.style.overflow = originalOverflow;
      
      return height;
    } else {
      // Якщо вже розгорнутий - просто повертаємо поточну висоту
      return content.scrollHeight;
    }
  }

  /**
   * Закриває всі акордеони
   */
  function closeAllAccordions() {
    accordions.forEach(function(accordion) {
      if (accordion.getAttribute('aria-expanded') === 'true') {
        closeAccordion(accordion);
      }
    });
  }

  /**
   * Відкриває конкретний акордеон з elastic анімацією
   */
  function openAccordion(accordion) {
    const content = accordion.querySelector('.accordion__content');
    if (!content) return;

    // Розраховуємо висоту контенту
    const height = getContentHeight(accordion);
    
    // Встановлюємо CSS змінну з висотою
    accordion.style.setProperty('--content-height', height + 'px');
    
    // Додаємо клас для анімації
    accordion.classList.add('accordion--opening');
    accordion.setAttribute('aria-expanded', 'true');
    
    // Запускаємо анімацію лічильників при відкритті першого акордеона
    if (activeAccordion === null) {
      animateAllCounters();
    }
    
    // Прибираємо will-change після завершення
    const handleTransitionEnd = function() {
      accordion.classList.remove('accordion--opening');
      accordion.classList.add('accordion--expanded');
      
      // Очищення will-change для економії GPU пам'яті
      requestAnimationFrame(function() {
        content.style.willChange = 'auto';
      });
      
      content.removeEventListener('transitionend', handleTransitionEnd);
    };
    
    content.addEventListener('transitionend', handleTransitionEnd, { once: true });
    
    // Плавний скрол (оптимізовано - один requestAnimationFrame)
    requestAnimationFrame(function() {
      accordion.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    });
    
    activeAccordion = accordion;
  }

  /**
   * Закриває конкретний акордеон з анімацією
   */
  function closeAccordion(accordion) {
    const content = accordion.querySelector('.accordion__content');
    if (!content) return;

    accordion.classList.remove('accordion--expanded');
    accordion.classList.add('accordion--closing');
    accordion.setAttribute('aria-expanded', 'false');
    
    const handleTransitionEnd = function() {
      accordion.classList.remove('accordion--closing');
      
      // Очищення will-change
      requestAnimationFrame(function() {
        content.style.willChange = 'auto';
      });
      
      content.removeEventListener('transitionend', handleTransitionEnd);
    };
    
    content.addEventListener('transitionend', handleTransitionEnd, { once: true });
    
    activeAccordion = null;
  }

  /**
   * Обробник кліку на header акордеона
   */
  function createHeaderClickHandler(accordion) {
    return function(e) {
      e.stopPropagation();
      
      const isExpanded = accordion.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        closeAccordion(accordion);
      } else {
        closeAllAccordions();
        openAccordion(accordion);
      }
    };
  }

  /**
   * Обробник клавіатури (Enter/Space)
   */
  function createHeaderKeydownHandler(header) {
    return function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    };
  }

  /**
   * Обробник кліку поза акордеонами
   */
  function createDocumentClickHandler() {
    return function(e) {
      const clickedInsideAccordion = e.target.closest('.accordion');
      
      if (!clickedInsideAccordion) {
        closeAllAccordions();
      }
    };
  }

  /**
   * Обробник Escape
   */
  function createDocumentKeydownHandler() {
    return function(e) {
      if (e.key === 'Escape') {
        closeAllAccordions();
      }
    };
  }

  /**
   * Ініціалізація модуля
   * Повертає об'єкт з методом destroy()
   */
  function init() {
    // Знаходимо всі акордеони на сторінці
    accordions = Array.from(document.querySelectorAll('.accordion'));
    
    if (accordions.length === 0) {
      console.log('[Accordion] No accordions found on page');
      return null;
    }

    console.log('[Accordion] Found', accordions.length, 'accordions');

    // Очищуємо старі listeners якщо є
    listeners = [];

    // Налаштовуємо обробники для кожного акордеона
    accordions.forEach(function(accordion) {
      const header = accordion.querySelector('.accordion__header');
      
      if (!header) {
        return;
      }

      const clickHandler = createHeaderClickHandler(accordion);
      const keydownHandler = createHeaderKeydownHandler(header);

      header.addEventListener('click', clickHandler);
      header.addEventListener('keydown', keydownHandler);

      // Зберігаємо посилання для cleanup
      listeners.push(
        { el: header, event: 'click', fn: clickHandler },
        { el: header, event: 'keydown', fn: keydownHandler }
      );
    });

    // Глобальні обробники
    const docClickHandler = createDocumentClickHandler();
    const docKeydownHandler = createDocumentKeydownHandler();

    document.addEventListener('click', docClickHandler);
    document.addEventListener('keydown', docKeydownHandler);

    listeners.push(
      { el: document, event: 'click', fn: docClickHandler },
      { el: document, event: 'keydown', fn: docKeydownHandler }
    );

    // Повертаємо об'єкт з методом destroy
    return {
      destroy: destroy
    };
  }

  /**
   * Очищення модуля
   * Видаляє всі event listeners
   */
  function destroy() {
    console.log('[Accordion] Destroying module, removing', listeners.length, 'listeners');

    // Видаляємо всі event listeners
    listeners.forEach(function(listener) {
      listener.el.removeEventListener(listener.event, listener.fn);
    });

    // Очищуємо масиви
    listeners = [];
    accordions = [];
    activeAccordion = null;
  }

  // Публічний API модуля
  return {
    init: init
  };

})();
