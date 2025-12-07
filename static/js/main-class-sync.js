/**
 * HTMX Main Class Synchronization
 * Копіює класи <main> з відповіді сервера після HTMX beforeSwap
 * 
 * Проблема: HTMX з hx-swap="innerHTML" замінює тільки вміст,
 * але класи main елемента залишаються старі (main--index)
 * 
 * Рішення: Синхронізуємо класи <main> перед innerHTML заміною
 */

(function() {
  'use strict';

  function setupMainClassSync() {
    if (typeof htmx === 'undefined') {
      setTimeout(setupMainClassSync, 100);
      return;
    }

    document.body.addEventListener('htmx:beforeSwap', function(event) {
      if (event.detail.target && event.detail.target.id === 'main') {
        try {
          // Парсимо відповідь сервера щоб отримати новий <main> елемент
          const parser = new DOMParser();
          const doc = parser.parseFromString(event.detail.xhr.responseText, 'text/html');
          const newMain = doc.querySelector('main');
          const currentMain = document.getElementById('main');
          
          if (newMain && currentMain) {
            // Копіюємо ВСІ класи з нового main на існуючий
            // Це робиться ПЕРЕД innerHTML заміною, тому CSS правила застосовуються одразу
            currentMain.className = newMain.className;
            console.log('[MainSync] Classes updated:', currentMain.className);
          }
        } catch (err) {
          console.warn('[MainSync] Error syncing classes:', err);
        }
      }
    });
  }

  setupMainClassSync();
})();




