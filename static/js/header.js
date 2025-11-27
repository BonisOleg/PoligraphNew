/**
 * Header menu controller
 * HTMX-ready версія
 */

window.HeaderModule = (function() {
  'use strict';

  let menuToggle = null;
  let menu = null;
  let listeners = [];

  function openMenu() {
    if (!menuToggle || !menu) return;
    menuToggle.setAttribute('data-menu-open', 'true');
    menu.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!menuToggle || !menu) return;
    menuToggle.setAttribute('data-menu-open', 'false');
    menu.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    const isOpen = menuToggle.getAttribute('data-menu-open') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function init() {
    menuToggle = document.querySelector('.header__menu-toggle');
    menu = document.querySelector('.header__menu');

    if (!menuToggle || !menu) {
      console.log('[Header] Elements not found');
      return null;
    }

    const toggleButton = menuToggle.querySelector('.header__toggle-button');
    if (!toggleButton) return null;

    // Toggle handler
    const handleToggle = function(e) {
      e.stopPropagation();
      toggleMenu();
    };

    // Close on outside click
    const handleDocumentClick = function(e) {
      if (!menuToggle.contains(e.target) && !menu.contains(e.target)) {
        closeMenu();
      }
    };

    // Close on Escape
    const handleEscape = function(e) {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    // Close on menu link click (HTMX navigation)
    const menuLinks = menu.querySelectorAll('.header__menu-link');
    const handleLinkClick = function() {
      closeMenu();
    };

    toggleButton.addEventListener('click', handleToggle);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    listeners.push(
      { el: toggleButton, event: 'click', fn: handleToggle },
      { el: document, event: 'click', fn: handleDocumentClick },
      { el: document, event: 'keydown', fn: handleEscape }
    );

    menuLinks.forEach(function(link) {
      link.addEventListener('click', handleLinkClick);
      listeners.push({ el: link, event: 'click', fn: handleLinkClick });
    });

    console.log('[Header] Module initialized');

    return {
      destroy: destroy
    };
  }

  function destroy() {
    console.log('[Header] Destroying module');

    listeners.forEach(function(listener) {
      listener.el.removeEventListener(listener.event, listener.fn);
    });

    listeners = [];
    menuToggle = null;
    menu = null;
  }

  return {
    init: init
  };

})();

