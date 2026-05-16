/**
 * Маска телефону +38(0XX) XXX-XX-XX
 * Vanilla JS, без залежностей
 * Автоматично прив'язується до всіх input[type="tel"]
 * HTMX-ready: реініціалізація через PhoneMaskModule
 */

(function () {
  'use strict';

  let listeners = [];

  function formatPhone(digits) {
    if (!digits.length) {return '';}
    let r = '+38(';
    for (let i = 0; i < digits.length && i < 10; i++) {
      if (i === 3) {r += ') ';}
      if (i === 6) {r += '-';}
      if (i === 8) {r += '-';}
      r += digits[i];
    }
    return r;
  }

  function extractDigits(value) {
    let raw = value.replace(/\D/g, '');
    if (raw.startsWith('38')) {raw = raw.substring(2);}
    return raw.substring(0, 10);
  }

  function setCursorEnd(input) {
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }

  function handleInput(e) {
    const input = e.target;
    const digits = extractDigits(input.value);
    input.value = formatPhone(digits);
    setCursorEnd(input);
  }

  function handleKeydown(e) {
    if (e.ctrlKey || e.metaKey || e.keyCode === 229) {return;}

    const nav = ['Backspace', 'Delete', 'Tab', 'Enter',
               'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (nav.indexOf(e.key) !== -1) {return;}

    if (e.key >= '0' && e.key <= '9') {
      const digits = extractDigits(e.target.value);
      if (digits.length >= 10) {e.preventDefault();}
      return;
    }

    e.preventDefault();
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    let raw = text.replace(/\D/g, '');
    if (raw.startsWith('380')) {raw = raw.substring(2);}
    else if (raw.startsWith('38')) {raw = raw.substring(2);}
    if (raw.length === 9 && raw.charAt(0) !== '0') {raw = `0${  raw}`;}
    raw = raw.substring(0, 10);
    e.target.value = formatPhone(raw);
    setCursorEnd(e.target);
  }

  function handleFocus(e) {
    const input = e.target;
    const digits = extractDigits(input.value);
    if (!digits.length) {
      input.value = '+38(0';
    }
    setCursorEnd(input);
  }

  function handleBlur(e) {
    const digits = extractDigits(e.target.value);
    // Очищуємо якщо введено тільки автоматичний префікс "0" без решти номеру
    if (digits.length <= 1) {e.target.value = '';}
  }

  function bindInput(input) {
    input.setAttribute('data-phone-mask', 'true');
    if (!input.getAttribute('placeholder')) {
      input.setAttribute('placeholder', '+38(0XX) XXX-XX-XX');
    }

    const add = function (evt, fn) {
      input.addEventListener(evt, fn);
      listeners.push({ el: input, event: evt, fn: fn });
    };

    add('input', handleInput);
    add('keydown', handleKeydown);
    add('paste', handlePaste);
    add('focus', handleFocus);
    add('blur', handleBlur);
  }

  function initAll() {
    const inputs = document.querySelectorAll('input[type="tel"]:not([data-phone-mask])');
    for (let i = 0; i < inputs.length; i++) {bindInput(inputs[i]);}
  }

  function destroyAll() {
    for (let i = 0; i < listeners.length; i++) {
      const l = listeners[i];
      l.el.removeEventListener(l.event, l.fn);
      l.el.removeAttribute('data-phone-mask');
    }
    listeners = [];
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
