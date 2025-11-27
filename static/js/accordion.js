/**
 * Логіка акордеонів для сторінки "Про нас"
 * HTMX-ready версія з підтримкою реініціалізації
 */

window.AccordionModule = (function() {
  'use strict';

  // Приватні змінні (доступні тільки всередині модуля)
  let accordions = [];
  let listeners = [];

  /**
   * Закриває всі акордеони
   */
  function closeAllAccordions() {
    accordions.forEach(function(accordion) {
      accordion.classList.remove('accordion--expanded');
      accordion.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Відкриває конкретний акордеон
   */
  function openAccordion(accordion) {
    accordion.classList.add('accordion--expanded');
    accordion.setAttribute('aria-expanded', 'true');
    
    // Плавний скрол до відкритого акордеона
    setTimeout(function() {
      accordion.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  }

  /**
   * Обробник кліку на header акордеона
   */
  function createHeaderClickHandler(accordion) {
    return function(e) {
      e.stopPropagation();
      
      const isExpanded = accordion.classList.contains('accordion--expanded');
      
      if (isExpanded) {
        closeAllAccordions();
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
  }

  // Публічний API модуля
  return {
    init: init
  };

})();
