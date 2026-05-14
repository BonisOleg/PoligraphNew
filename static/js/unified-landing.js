/* unified-landing.js */
'use strict';

/* ─── Scroll Animate (IntersectionObserver) ─────────────────────────── */
(function initScrollAnimate() {
  const els = document.querySelectorAll('.ul-animate');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(function (el) { observer.observe(el); });
})();

/* ─── Stats Counter ──────────────────────────────────────────────────── */
(function initCounters() {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  var started = false;

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !started) {
        started = true;
        counters.forEach(function (c) { animateCount(c); });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  if (counters[0]) observer.observe(counters[0]);
})();

/* ─── Phone Mask ────────────────────────────────────────────────────── */
(function initPhoneMask() {
  var inputs = document.querySelectorAll('input[type="tel"]');

  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      if (digits.startsWith('380')) digits = digits.slice(3);
      else if (digits.startsWith('0')) digits = digits.slice(1);
      digits = digits.slice(0, 9);

      var parts = [];
      if (digits.length > 0) parts.push('+38 (0' + digits.slice(0, 2));
      if (digits.length >= 2) parts[0] += ')';
      if (digits.length > 2) parts.push(' ' + digits.slice(2, 5));
      if (digits.length > 5) parts.push('-' + digits.slice(5, 7));
      if (digits.length > 7) parts.push('-' + digits.slice(7, 9));

      input.value = parts.join('');
    });
  });
})();

/* ─── Form Submit: Infidelity ────────────────────────────────────────── */
(function initInfidelityForm() {
  var form = document.getElementById('ul-form-infidelity');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = form.querySelector('[type="submit"]');
    var msgEl = document.getElementById('ul-messages-infidelity');
    var successEl = document.getElementById('ul-success-infidelity');
    var originalText = btn ? btn.textContent : '';

    if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо…'; }
    if (msgEl) msgEl.innerHTML = '';

    var data = new FormData(form);
    var csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) data.set('csrfmiddlewaretoken', csrfToken.getAttribute('content'));

    fetch('/perevirka-na-zradu/submit/', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: data,
    })
      .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
      .then(function (res) {
        if (res.ok && res.data.success) {
          if (form) form.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
        } else {
          var errorMsg = '';
          if (res.data.errors) {
            Object.values(res.data.errors).forEach(function (msg) {
              errorMsg += '<p>' + msg + '</p>';
            });
          } else {
            errorMsg = '<p>Сталася помилка. Спробуйте ще раз.</p>';
          }
          if (msgEl) msgEl.innerHTML = '<div class="ul-form__error">' + errorMsg + '</div>';
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
      })
      .catch(function () {
        if (msgEl) msgEl.innerHTML = '<div class="ul-form__error"><p>Помилка з\'єднання. Перевірте інтернет.</p></div>';
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
      });
  });
})();

/* ─── Form Submit: Corporate ─────────────────────────────────────────── */
(function initCorporateForm() {
  var form = document.getElementById('ul-form-corporate');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = form.querySelector('[type="submit"]');
    var msgEl = document.getElementById('ul-messages-corporate');
    var successEl = document.getElementById('ul-success-corporate');
    var originalText = btn ? btn.textContent : '';

    if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо…'; }
    if (msgEl) msgEl.innerHTML = '';

    var data = new FormData(form);
    var csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) data.set('csrfmiddlewaretoken', csrfToken.getAttribute('content'));

    fetch('/korporatyvni-poslugy/submit/', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: data,
    })
      .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
      .then(function (res) {
        if (res.ok && res.data.success) {
          if (form) form.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
        } else {
          var errorMsg = '';
          if (res.data.errors) {
            Object.values(res.data.errors).forEach(function (msg) {
              errorMsg += '<p>' + msg + '</p>';
            });
          } else {
            errorMsg = '<p>Сталася помилка. Спробуйте ще раз.</p>';
          }
          if (msgEl) msgEl.innerHTML = '<div class="ul-form__error">' + errorMsg + '</div>';
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
      })
      .catch(function () {
        if (msgEl) msgEl.innerHTML = '<div class="ul-form__error"><p>Помилка з\'єднання. Перевірте інтернет.</p></div>';
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
      });
  });
})();

/* ─── Promo Code Copy ────────────────────────────────────────────────── */
(function initPromoCopy() {
  var btn = document.getElementById('ul-promo-copy');
  var toast = document.getElementById('ul-toast');
  if (!btn || !toast) return;

  btn.addEventListener('click', function () {
    navigator.clipboard.writeText('PRAVDA').then(function () {
      toast.classList.add('is-visible');
      setTimeout(function () { toast.classList.remove('is-visible'); }, 2500);
    }).catch(function () {
      var input = document.createElement('input');
      input.value = 'PRAVDA';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      toast.classList.add('is-visible');
      setTimeout(function () { toast.classList.remove('is-visible'); }, 2500);
    });
  });
})();

/* ─── Smooth scroll for anchor links ────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }
})();
