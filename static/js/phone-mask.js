/**
 * Маска телефону +38(0XX) XXX-XX-XX
 * Vanilla JS, без залежностей
 * Автоматично прив'язується до всіх input[type="tel"]
 * HTMX-ready: реініціалізація після swap
 */

(function () {
  'use strict';

  var PREFIX = '+38(0';
  var MASK = '+38(0__) ___-__-__';
  var MAX_DIGITS = 9;
  var listeners = [];

  function getDigits(value) {
    var raw = value.replace(/\D/g, '');
    if (raw.startsWith('380')) {
      raw = raw.substring(3);
    } else if (raw.startsWith('80')) {
      raw = raw.substring(2);
    } else if (raw.startsWith('0')) {
      raw = raw.substring(1);
    }
    return raw.substring(0, MAX_DIGITS);
  }

  function formatPhone(digits) {
    if (!digits.length) return '';
    var result = PREFIX;
    for (var i = 0; i < digits.length && i < MAX_DIGITS; i++) {
      if (i === 2) result += ') ';
      if (i === 5) result += '-';
      if (i === 7) result += '-';
      result += digits[i];
    }
    return result;
  }

  function getCursorPosition(digits) {
    return formatPhone(digits).length;
  }

  function handleInput(e) {
    var input = e.target;
    var digits = getDigits(input.value);
    var formatted = formatPhone(digits);
    input.value = formatted;
    var pos = getCursorPosition(digits);
    input.setSelectionRange(pos, pos);
  }

  function handleFocus(e) {
    var input = e.target;
    if (!input.value) {
      input.value = PREFIX;
      var len = PREFIX.length;
      setTimeout(function () {
        input.setSelectionRange(len, len);
      }, 0);
    }
  }

  function handleKeydown(e) {
    var input = e.target;
    if (e.key === 'Backspace') {
      var digits = getDigits(input.value);
      if (digits.length === 0) {
        e.preventDefault();
        input.value = PREFIX;
        var len = PREFIX.length;
        input.setSelectionRange(len, len);
        return;
      }
      e.preventDefault();
      digits = digits.substring(0, digits.length - 1);
      var formatted = digits.length ? formatPhone(digits) : PREFIX;
      input.value = formatted;
      var pos = formatted.length;
      input.setSelectionRange(pos, pos);
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    var paste = (e.clipboardData || window.clipboardData).getData('text');
    var digits = getDigits(paste);
    var formatted = formatPhone(digits);
    e.target.value = formatted;
    var pos = getCursorPosition(digits);
    e.target.setSelectionRange(pos, pos);
  }

  function handleBlur(e) {
    var input = e.target;
    if (input.value === PREFIX || input.value === '+38(0') {
      input.value = '';
    }
  }

  function bindInput(input) {
    input.setAttribute('data-phone-mask', 'true');
    input.setAttribute('placeholder', MASK);
    input.setAttribute('maxlength', '18');

    var addListener = function (evt, fn) {
      input.addEventListener(evt, fn);
      listeners.push({ el: input, event: evt, fn: fn });
    };

    addListener('input', handleInput);
    addListener('focus', handleFocus);
    addListener('keydown', handleKeydown);
    addListener('paste', handlePaste);
    addListener('blur', handleBlur);
  }

  function initAll() {
    var inputs = document.querySelectorAll('input[type="tel"]:not([data-phone-mask])');
    inputs.forEach(bindInput);
  }

  function destroyAll() {
    listeners.forEach(function (l) {
      l.el.removeEventListener(l.event, l.fn);
      l.el.removeAttribute('data-phone-mask');
    });
    listeners = [];
  }

  window.PhoneMaskModule = {
    init: function () {
      initAll();
      return { destroy: destroyAll };
    }
  };

  function initOnLoad() {
    initAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnLoad);
  } else {
    initOnLoad();
  }
})();
