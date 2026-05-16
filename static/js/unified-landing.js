/* unified-landing.js */
'use strict';

/* ─── Scroll Animate (IntersectionObserver) ─────────────────────────── */
(function initScrollAnimate() {
  const els = document.querySelectorAll('.ul-animate');
  if (!els.length) {return;}

  const observer = new IntersectionObserver(
    ((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el) => { observer.observe(el); });
})();

/* ─── Stats Counter ──────────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) {return;}

  let started = false;

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    let startTime = null;

    function step(ts) {
      if (!startTime) {startTime = ts;}
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) {requestAnimationFrame(step);}
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !started) {
        started = true;
        counters.forEach((c) => { animateCount(c); });
        observer.disconnect();
      }
    });
  }), { threshold: 0.5 });

  if (counters[0]) {observer.observe(counters[0]);}
})();

/* ─── Phone Mask ────────────────────────────────────────────────────── */
(function initPhoneMask() {
  const inputs = document.querySelectorAll('input[type="tel"]');

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      let raw = input.value.replace(/\D/g, '');
      if (raw.startsWith('380')) {raw = raw.slice(2);}
      else if (raw.startsWith('38')) {raw = raw.slice(2);}
      raw = raw.slice(0, 10);
      if (!raw.length) { input.value = ''; return; }

      let r = '+38(';
      for (let i = 0; i < raw.length; i++) {
        if (i === 3) {r += ') ';}
        if (i === 6) {r += '-';}
        if (i === 8) {r += '-';}
        r += raw[i];
      }
      input.value = r;
    });

    input.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {return;}
      const nav = ['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','Home','End'];
      if (nav.indexOf(e.key) !== -1) {return;}
      if (e.key >= '0' && e.key <= '9') {
        const digits = input.value.replace(/\D/g, '');
        const d = digits.startsWith('38') ? digits.slice(2) : digits;
        if (d.length >= 10) {e.preventDefault();}
        return;
      }
      e.preventDefault();
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      let raw = text.replace(/\D/g, '');
      if (raw.startsWith('380')) {raw = raw.slice(2);}
      else if (raw.startsWith('38')) {raw = raw.slice(2);}
      if (raw.length === 9 && raw.charAt(0) !== '0') {raw = `0${  raw}`;}
      raw = raw.slice(0, 10);
      let r = '+38(';
      for (let i = 0; i < raw.length; i++) {
        if (i === 3) {r += ') ';}
        if (i === 6) {r += '-';}
        if (i === 8) {r += '-';}
        r += raw[i];
      }
      input.value = raw.length ? r : '';
    });
  });
})();

/* ─── Form Submit: Infidelity ────────────────────────────────────────── */
(function initInfidelityForm() {
  const form = document.getElementById('ul-form-infidelity');
  if (!form) {return;}

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const msgEl = document.getElementById('ul-messages-infidelity');
    const successEl = document.getElementById('ul-success-infidelity'); // eslint-disable-line no-unused-vars
    const originalText = btn ? btn.textContent : '';

    if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо…'; }
    if (msgEl) {msgEl.innerHTML = '';}

    const data = new FormData(form);
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {data.set('csrfmiddlewaretoken', csrfToken.getAttribute('content'));}

    fetch('/perevirka-na-zradu/submit/', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: data,
    })
      .then((res) => { return res.json().then((d) => { return { ok: res.ok, data: d }; }); })
      .then((res) => {
        if (res.ok && res.data.success) {
          window.location.href = '/poslugy/thank-you/';
        } else {
          let errorMsg = '';
          if (res.data.errors) {
            Object.values(res.data.errors).forEach((msg) => {
              errorMsg += `<p>${  msg  }</p>`;
            });
          } else {
            errorMsg = '<p>Сталася помилка. Спробуйте ще раз.</p>';
          }
          if (msgEl) {msgEl.innerHTML = `<div class="ul-form__error">${  errorMsg  }</div>`;}
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
      })
      .catch(() => {
        if (msgEl) {msgEl.innerHTML = '<div class="ul-form__error"><p>Помилка з\'єднання. Перевірте інтернет.</p></div>';}
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
      });
  });
})();

/* ─── Form Submit: Corporate ─────────────────────────────────────────── */
(function initCorporateForm() {
  const form = document.getElementById('ul-form-corporate');
  if (!form) {return;}

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const msgEl = document.getElementById('ul-messages-corporate');
    const successEl = document.getElementById('ul-success-corporate'); // eslint-disable-line no-unused-vars
    const originalText = btn ? btn.textContent : '';

    if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо…'; }
    if (msgEl) {msgEl.innerHTML = '';}

    const data = new FormData(form);
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {data.set('csrfmiddlewaretoken', csrfToken.getAttribute('content'));}

    fetch('/korporatyvni-poslugy/submit/', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: data,
    })
      .then((res) => { return res.json().then((d) => { return { ok: res.ok, data: d }; }); })
      .then((res) => {
        if (res.ok && res.data.success) {
          window.location.href = '/poslugy/thank-you/';
        } else {
          let errorMsg = '';
          if (res.data.errors) {
            Object.values(res.data.errors).forEach((msg) => {
              errorMsg += `<p>${  msg  }</p>`;
            });
          } else {
            errorMsg = '<p>Сталася помилка. Спробуйте ще раз.</p>';
          }
          if (msgEl) {msgEl.innerHTML = `<div class="ul-form__error">${  errorMsg  }</div>`;}
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
      })
      .catch(() => {
        if (msgEl) {msgEl.innerHTML = '<div class="ul-form__error"><p>Помилка з\'єднання. Перевірте інтернет.</p></div>';}
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
      });
  });
})();

/* ─── Promo Code Copy ────────────────────────────────────────────────── */
(function initPromoCopy() {
  const btn = document.getElementById('ul-promo-copy');
  const toast = document.getElementById('ul-toast');
  if (!btn || !toast) {return;}

  btn.addEventListener('click', () => {
    navigator.clipboard.writeText('PRAVDA').then(() => {
      toast.classList.add('is-visible');
      setTimeout(() => { toast.classList.remove('is-visible'); }, 2500);
    }).catch(() => {
      const input = document.createElement('input');
      input.value = 'PRAVDA';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      toast.classList.add('is-visible');
      setTimeout(() => { toast.classList.remove('is-visible'); }, 2500);
    });
  });
})();

/* ─── Smooth scroll for anchor links ────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) {return;}
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }
})();
