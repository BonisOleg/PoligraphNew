/**
 * Phone input helper
 * Встановлює placeholder якщо не заданий в HTML.
 * Без авто-форматування — користувач вводить вільно.
 * HTMX-ready: реініціалізація через PhoneMaskModule
 */

(function () {
  'use strict';

  function bindInput(input) {
    if (input.getAttribute('data-phone-mask')) {return;}
    input.setAttribute('data-phone-mask', 'true');
    if (!input.getAttribute('placeholder')) {
      input.setAttribute('placeholder', '+38 (096) 123-45-67');
    }
  }

  function initAll() {
    const inputs = document.querySelectorAll('input[type="tel"]:not([data-phone-mask])');
    for (let i = 0; i < inputs.length; i++) {bindInput(inputs[i]);}
  }

  function destroyAll() {
    document.querySelectorAll('input[type="tel"][data-phone-mask]').forEach(function (el) {
      el.removeAttribute('data-phone-mask');
    });
  }

  window.PhoneMaskModule = {
    init: function () {
      initAll();
      return { destroy: destroyAll };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
