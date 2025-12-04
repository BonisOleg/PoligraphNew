/**
 * Why-us module - пустий модуль для сумісності з app-init.js
 * Весь функціонал реалізований через чистий CSS
 */

window.WhyUsModule = (function() {
  'use strict';

  function init() {
    const whyUsSection = document.querySelector('.why-us');
    
    if (!whyUsSection) {
      console.log('[WhyUs] Section not found on page');
      return null;
    }

    console.log('[WhyUs] Initialized (no interactions needed)');

    return {
      destroy: destroy
    };
  }

  function destroy() {
    console.log('[WhyUs] Destroyed');
  }

  return {
    init: init
  };

})();
