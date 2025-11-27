/**
 * Логіка акордеонів для footer
 * HTMX-ready версія
 */

window.FooterAccordionModule = (function() {
  'use strict';

  let footerAccordions = [];
  let listeners = [];

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function closeAccordion(accordion) {
    accordion.setAttribute('aria-expanded', 'false');
  }

  function openAccordion(accordion) {
    accordion.setAttribute('aria-expanded', 'true');
  }

  function createClickHandler(accordion, header) {
    return function(e) {
      if (!isMobile()) {
        return;
      }

      e.stopPropagation();
      
      const isExpanded = accordion.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        closeAccordion(accordion);
      } else {
        openAccordion(accordion);
      }
    };
  }

  function createKeydownHandler(header) {
    return function(e) {
      if (!isMobile()) {
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    };
  }

  function createEscapeHandler() {
    return function(e) {
      if (e.key === 'Escape' && isMobile()) {
        footerAccordions.forEach(function(accordion) {
          closeAccordion(accordion);
        });
      }
    };
  }

  function updateAccordionState(accordion) {
    if (!isMobile()) {
      // Desktop: акордеон завжди відкритий, додаємо клас
      accordion.classList.add('footer__accordion--desktop');
      openAccordion(accordion);
    } else {
      // Mobile: акордеон керується JS
      accordion.classList.remove('footer__accordion--desktop');
    }
  }

  function init() {
    footerAccordions = Array.from(document.querySelectorAll('.footer__accordion'));
    
    if (footerAccordions.length === 0) {
      console.log('[FooterAccordion] No accordions found');
      return null;
    }

    console.log('[FooterAccordion] Found', footerAccordions.length, 'accordions');

    listeners = [];

    footerAccordions.forEach(function(accordion) {
      const header = accordion.querySelector('.footer__accordion-header');
      
      if (!header) {
        return;
      }

      updateAccordionState(accordion);

      const clickHandler = createClickHandler(accordion, header);
      const keydownHandler = createKeydownHandler(header);
      const resizeHandler = function() {
        updateAccordionState(accordion);
      };

      header.addEventListener('click', clickHandler);
      header.addEventListener('keydown', keydownHandler);
      window.addEventListener('resize', resizeHandler);

      listeners.push(
        { el: header, event: 'click', fn: clickHandler },
        { el: header, event: 'keydown', fn: keydownHandler },
        { el: window, event: 'resize', fn: resizeHandler }
      );
    });

    const escapeHandler = createEscapeHandler();
    document.addEventListener('keydown', escapeHandler);
    listeners.push({ el: document, event: 'keydown', fn: escapeHandler });

    return {
      destroy: destroy
    };
  }

  function destroy() {
    console.log('[FooterAccordion] Destroying module, removing', listeners.length, 'listeners');

    listeners.forEach(function(listener) {
      listener.el.removeEventListener(listener.event, listener.fn);
    });

    listeners = [];
    footerAccordions = [];
  }

  return {
    init: init
  };

})();
