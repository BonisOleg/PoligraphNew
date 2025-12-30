/**
 * Утиліта для перевірки завантаження HTMX
 * Використовується для уникнення дубльованого коду
 */

window.HTMXUtils = (function() {
  'use strict';

  /**
   * Перевіряє чи HTMX завантажений, якщо ні - повторює спробу
   * @param {Function} callback - функція яка викликається коли HTMX готовий
   * @param {number} delay - затримка між спробами в мс (за замовчуванням 100)
   * @param {number} maxAttempts - максимальна кількість спроб (за замовчуванням 50)
   */
  function waitForHTMX(callback, delay, maxAttempts) {
    delay = delay || 100;
    maxAttempts = maxAttempts || 50;
    
    let attempts = 0;
    
    function check() {
      attempts++;
      
      if (typeof htmx !== 'undefined') {
        callback();
      } else if (attempts < maxAttempts) {
        setTimeout(check, delay);
      } else {
        console.warn('[HTMXUtils] HTMX не завантажено після', attempts, 'спроб');
      }
    }
    
    check();
  }

  /**
   * Перевіряє чи HTMX завантажений (синхронно)
   * @returns {boolean}
   */
  function isHTMXLoaded() {
    return typeof htmx !== 'undefined';
  }

  return {
    waitForHTMX: waitForHTMX,
    isHTMXLoaded: isHTMXLoaded
  };
})();



