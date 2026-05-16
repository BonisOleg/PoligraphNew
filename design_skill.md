# Design Skill — Система дизайну для веб-проектів

> Універсальний гайд для створення преміум інтерфейсів: лендінги, інтернет-магазини, корпоративні сайти.
> Базується на реальній реалізації у проекті PoligraphNew (unified landing).

---

## 1. Вибір стилю

Перед початком визнач стиль проекту:

| Стиль | Фон | Застосування |
|---|---|---|
| **Dark Premium** | `#080808` / `#0d0d0d` | Лендінги, SaaS, агентства, портфоліо |
| **Light Minimal** | `#ffffff` / `#f8fafc` | Інтернет-магазини, корпоративні, блоги |
| **Mixed** | Темний hero + світлі секції | Більшість комерційних сайтів |

**Правило:** вибери стиль один раз і дотримуйся його по всьому проекту. Не змішуй dark і light card-и в одній секції.

---

## 2. Кольорова система

### ⚡ Пріоритет кольорів

**Спочатку перевір що написав користувач.** Послідовність:

1. **Користувач вказав конкретні кольори** (hex, назву, бренд) — використай їх. Не замінюй, не "покращуй".
2. **Користувач вказав настрій / стиль** ("теплі тони", "мінімалізм", "як Apple") — підбери палітру під опис.
3. **Користувач нічого не вказав** — використовуй дефолти з таблиці нижче (розділ 1) залежно від типу сайту.

> Якщо є сумніви — **запитай** перед тим як генерувати CSS.

---

### 2.1 Структура CSS Custom Properties

Завжди оголошуй кольори через CSS змінні у `:root`. Ніколи не хардкодь кольори напряму у компоненти.

```css
:root {
  /* Фони — 2-3 рівні глибини */
  --bg:        #080808;   /* основний фон */
  --bg-2:      #0d0d0d;   /* другорядний фон (секції що чергуються) */
  --bg-card:   rgba(255, 255, 255, 0.04); /* glassmorphism картка */

  /* Межі */
  --border:       rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.18);

  /* Текст — 3 рівні ієрархії */
  --text:       #f1f5f9;  /* основний */
  --text-muted: #94a3b8;  /* другорядний */
  --text-dim:   #64748b;  /* третинний, підписи */

  /* Акценти — базовий + світлий варіант */
  --accent:       #7c3aed;
  --accent-light: #a855f7;
  --glow:         rgba(124, 58, 237, 0.35); /* для box-shadow */
}
```

### 2.2 Вибір акцентних кольорів

Використовуй **1 основний + 1-2 додаткових** акценти. Більше — хаос.

| Призначення | Колір | Використання |
|---|---|---|
| Основна дія (CTA) | `#7c3aed` violet | Primary кнопки, бейджі |
| Небезпека / емоція | `#dc2626` red | Попередження, емоційні секції |
| Преміум / знижка | `#d97706` gold | Ціни, промокоди, VIP |
| Успіх | `#059669` green | Тільки для success-станів форм |

### 2.3 Glow ефекти

```css
/* Кнопка з glow */
.btn--primary {
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.35);
}
.btn--primary:hover {
  box-shadow: 0 8px 40px rgba(124, 58, 237, 0.5);
}

/* Фоновий glow секції (абсолютний, pointer-events: none) */
.section::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: #7c3aed;
  filter: blur(120px);
  opacity: 0.08;
  pointer-events: none;
}
```

**Правило:** glow на темному фоні — opacity 0.06–0.15. Більше — виглядає дешево.

---

## 3. Типографіка

### 3.1 Пари шрифтів

| Тип сайту | Display (заголовки) | Body (текст) |
|---|---|---|
| Premium / Editorial | Playfair Display | Inter |
| Корпоративний | DM Sans / Outfit | Inter |
| Мінімалістичний | Inter (bold) | Inter |
| Технологічний | Space Grotesk | Inter |

**Правило:** ніколи не використовуй більше 2 шрифтових сімей.

### 3.2 Розмірна шкала

```css
/* Adaptive через clamp() — не потрібні media queries для шрифтів */
.hero-title    { font-size: clamp(32px, 6vw,  72px); }
.section-title { font-size: clamp(26px, 4vw,  42px); }
.card-title    { font-size: clamp(16px, 2vw,  20px); }
.body          { font-size: 16px; }
.caption       { font-size: 13px; }
.label         { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
```

### 3.3 Ієрархія

```
Hero H1       → font-family: display, font-weight: 700–800, line-height: 1.1
Section H2    → font-family: display, font-weight: 700, line-height: 1.2
Card H3       → font-family: body, font-weight: 700, line-height: 1.3
Subtitle p    → font-family: body, font-weight: 400, color: muted, line-height: 1.7
Label / badge → uppercase, letter-spacing: 0.08–0.12em, font-weight: 700
```

**Правило:** `line-height` для заголовків — 1.1–1.2. Для тексту — 1.6–1.7. Ніколи не застосовуй `line-height: 1` до параграфів.

---

## 4. Spacing (відступи)

Використовуй **шкалу кратну 8px**:

```
4px   — мікро (gap між іконкою і текстом)
8px   — малий (padding badge, border-radius-sm)
16px  — базовий (padding мобільний, gap у рядку)
24px  — стандартний (padding секцій mobile, gap грід)
32px  — середній
48px  — великий (gap між блоками)
56px  — padding секцій планшет
80px  — padding секцій десктоп
```

```css
/* Padding секцій */
.section         { padding: 80px 24px; }   /* desktop */
@media (max-width: 768px) {
  .section       { padding: 56px 16px; }   /* tablet/mobile */
}
```

**Правило:** `max-width` контейнера — 1100px для контенту, 1200px для nav. Завжди центруй через `margin: 0 auto`.

---

## 5. Компоненти

### 5.1 Картки (glassmorphism)

```css
.card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

/* Glassmorphism (тільки там де є backdrop-filter підтримка) */
@supports (backdrop-filter: blur(1px)) {
  .card--glass {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
}
```

### 5.2 Кнопки

```css
/* Базова кнопка */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  border-radius: 100px;   /* pill shape — для більшості CTA */
  padding: 14px 28px;
  transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
  white-space: nowrap;
}

/* Primary */
.btn--primary {
  background: linear-gradient(135deg, #7c3aed, #dc2626);
  color: #fff;
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.35);
}
.btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(124, 58, 237, 0.5); }

/* Secondary */
.btn--secondary {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
}
.btn--secondary:hover { border-color: rgba(255, 255, 255, 0.18); transform: translateY(-2px); }
```

**Правило:** `border-radius: 100px` (pill) — для CTA і nav. `border-radius: 10–16px` — для форм і карток.

### 5.3 Бейджі / лейбли

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Animated dot у badge */
.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}
```

### 5.4 Sticky Навігація

```css
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(8, 8, 8, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* iOS Safari: враховує dynamic address bar */
@supports (-webkit-touch-callout: none) {
  .nav {
    position: -webkit-sticky;
    position: sticky;
    top: env(safe-area-inset-top, 0px);
  }
}
```

### 5.5 Роздільники секцій (Dividers)

```css
/* Gradient line divider */
.divider {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.divider__line {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(600px, 90vw);
  height: 1px;
  background: linear-gradient(90deg, transparent, #7c3aed, #dc2626, transparent);
  opacity: 0.6;
}

.divider__label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 8px 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

---

## 6. Анімації

### 6.1 Scroll-triggered (IntersectionObserver)

```css
/* CSS частина */
.animate {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Затримки для послідовної появи */
.animate--delay-1 { transition-delay: 0.1s; }
.animate--delay-2 { transition-delay: 0.2s; }
.animate--delay-3 { transition-delay: 0.3s; }
.animate--delay-4 { transition-delay: 0.4s; }
```

```javascript
// JS частина
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // fire once
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate').forEach((el) => observer.observe(el));
```

### 6.2 Числові лічильники

```javascript
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  let startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
```

### 6.3 Правила анімацій

- Тривалість hover: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Тривалість появи: `0.5–0.7s ease`
- Тривалість лічильника: `1400–1800ms cubic ease-out`
- Hover transform: тільки `translateY(-2px)` або `translateY(-4px)` — без scale на картках
- Ніколи не анімуй `width`, `height`, `top`, `left` — тільки `transform` і `opacity`
- `will-change: transform` — тільки якщо є performance проблема, не превентивно

---

## 7. Форми

```css
/* Поле вводу */
.form__input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  color: #f1f5f9;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  -webkit-appearance: none; /* iOS reset */
}

.form__input:focus {
  border-color: rgba(124, 58, 237, 0.6);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.form__input--error { border-color: rgba(220, 38, 38, 0.6); }
```

**Правила форм:**
- Завжди `inputmode="tel"` для телефонних полів (правильна клавіатура на iOS)
- Завжди `autocomplete="name"` / `autocomplete="tel"` / `autocomplete="email"`
- Honeypot поле для захисту від спаму: `position: absolute; left: -9999px; width: 1px; height: 1px`
- CSRF token обов'язковий для POST (Django: `{% csrf_token %}` + meta tag)
- Phone mask через JS — тільки на події `input`, не `keydown`

---

## 8. Layouts / Сітки

### 8.1 Split layout (контент + форма)

```css
.split {
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 56px;
  align-items: start;
}

.split--reverse { grid-template-columns: 480px 1fr; }

@media (max-width: 1024px) {
  .split,
  .split--reverse { grid-template-columns: 1fr; }
}
```

### 8.2 Картки у рядок

```css
/* 4 картки */
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* 3 картки */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

@media (max-width: 768px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .grid-4,
  .grid-3 { grid-template-columns: 1fr; }
}
```

### 8.3 Stats row

```css
.stats {
  display: flex;
  align-items: center;
  gap: 48px;
  flex-wrap: wrap;
  padding: 28px 32px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

/* Вертикальний роздільник між стат */
.stats__sep {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
```

---

## 9. Адаптив і мобільна версія

### 9.1 Breakpoints

```css
/* Mobile first */
/* Base:      < 480px  — малий мобільний */
/* 480px+     — мобільний */
/* 768px+     — планшет */
/* 1024px+    — ноутбук */
/* 1280px+    — десктоп */
```

### 9.2 iOS Safari критичні правила

```css
/* Safe area для контенту біля країв */
.footer        { padding-bottom: calc(24px + env(safe-area-inset-bottom)); }
.phone-float   { bottom: calc(24px + env(safe-area-inset-bottom)); }

/* Viewport height — не використовуй 100vh, використовуй 100svh */
.hero { min-height: 100svh; }

/* Sticky nav */
@supports (-webkit-touch-callout: none) {
  .nav {
    position: -webkit-sticky;
    position: sticky;
    top: env(safe-area-inset-top, 0px);
  }
}

/* Прокрутка всередині контейнера */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Reset для input на iOS */
input, select, textarea {
  -webkit-appearance: none;
  border-radius: 0; /* iOS округляє само — скидаємо */
}

/* Забороняємо zoom при фокусі на input (font-size >= 16px) */
input { font-size: 16px; } /* або через meta viewport */
```

### 9.3 Floating CTA кнопка (мобільна)

```css
.phone-float {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  right: 20px;
  z-index: 200;
  border-radius: 100px;
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.35);
}
```

---

## 10. Iconography

- Використовуй **inline SVG** — не шрифтові іконки, не PNG
- Розміри: `14px` (nav), `16px` (кнопки), `20–22px` (картки), `24px` (секції)
- `aria-hidden="true"` для декоративних іконок
- `currentColor` для stroke/fill — дозволяє керувати кольором через CSS

```html
<svg width="20" height="20" fill="none" stroke="currentColor"
     viewBox="0 0 24 24" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="..." />
</svg>
```

---

## 11. Топбар акції

```css
.topbar {
  background: linear-gradient(90deg, #dc2626 0%, #7c3aed 100%);
  padding: 10px 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: #fff;
}
```

**Правило:** топбар — тільки для важливих акцій. Завжди зверху, завжди full-width. Максимум 1 рядок тексту.

---

## 12. BEM Naming

```
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

**Приклади:**
```css
.card {}              /* блок */
.card__title {}       /* елемент */
.card__icon {}        /* елемент */
.card--featured {}    /* модифікатор */
.card--dark {}        /* модифікатор */
.card__title--large {}/* модифікатор елемента */
```

**Правила BEM:**
- Ніколи не стилізуй через ID
- Ніколи не використовуй `!important`
- Максимум 2 рівні вкладеності у BEM (block\_\_element, не block\_\_el1\_\_el2)
- Утилітарні класи (`.is-visible`, `.is-active`) — не BEM, це state-класи

---

## 13. CSS архітектура файлів

```
static/css/
  normalize.css          ← недоторканний, завжди перший
  base.css               ← :root змінні, типографіка, reset
  components/
    nav.css
    hero.css
    cards.css
    forms.css
    footer.css
  utilities/
    animations.css
    grid.css
  pages/
    landing.css          ← page-specific стилі
```

**Правило розміру:** кожен CSS файл — максимум 500 рядків. Якщо більше — ділити на `_1.css`, `_2.css`.

**Порядок підключення:**
1. `normalize.css`
2. `base.css`
3. `components/*.css`
4. `utilities/*.css`
5. `pages/page-specific.css`

---

## 14. Загальні антипаттерни (що НЕ робити)

| Антипатерн | Правильно |
|---|---|
| `!important` | Підвищуй специфічність класом |
| `style="..."` inline | Завжди зовнішній CSS |
| `* { margin: 0; padding: 0; }` після normalize | normalize вже це робить |
| Анімація `width`/`height` | Тільки `transform`/`opacity` |
| `100vh` на мобільному | `100svh` або `min-height` |
| `font-size < 16px` у input | Зум Safari — мінімум `16px` |
| ID для стилізації | Класи (BEM) |
| Більше 2 шрифтів | Максимум 2 family |
| Більше 3 акцентних кольорів | 1 основний + 1-2 додаткових |
| `backdrop-filter` без `@supports` | Перевіряй підтримку |
| `position: fixed` без safe-area | `env(safe-area-inset-*)` |

---

## 15. Checklist перед здачею

- [ ] Всі кольори через CSS custom properties
- [ ] Шрифти завантажуються з `preconnect` до Google Fonts
- [ ] `clamp()` для розмірів заголовків замість media queries
- [ ] `100svh` замість `100vh` для hero
- [ ] `env(safe-area-inset-bottom)` для fixed/sticky елементів
- [ ] `inputmode="tel"` на всіх phone полях
- [ ] `autocomplete` атрибути на всіх input
- [ ] `aria-hidden="true"` на декоративних SVG
- [ ] `role="alert" aria-live="polite"` на error контейнерах форм
- [ ] Honeypot поле у всіх формах
- [ ] Анімації тільки через `transform`/`opacity`
- [ ] BEM naming без ID і `!important`
- [ ] CSS файли < 500 рядків
- [ ] Перевірено на iPhone Safari (мінімум в DevTools)
- [ ] Floating CTA кнопка видима на мобільному
