# PolygraphNew

Django проект з оптимізованим стеком для максимальної продуктивності та крос-платформенності.

## Стек

- **Django** - backend framework
- **HTML + HTMX** - frontend інтерактивність
- **normalize.css v12.1.1** - CSS нормалізація
- **Vanilla CSS** - стилізація
- **Vanilla JavaScript** - мінімально, де необхідно

## Підтримувані браузери

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (2021+)

## Структура проекту

```
PolygraphNew/
├── static/
│   ├── css/
│   │   ├── normalize.css      # НЕДОТОРКАННИЙ
│   │   ├── base.css
│   │   ├── components/
│   │   └── utilities/
│   └── js/
├── templates/
│   ├── base.html              # Базовий шаблон
│   └── components/
├── .cursorrules               # Правила для Cursor AI
├── .gitattributes
├── CSS_STRUCTURE.md
├── HTMX_USAGE.md
├── README.md
└── QUICK_START.txt            # Швидкий старт
```

## Швидкий старт

1. Клонувати репозиторій
2. Встановити залежності: `pip install -r requirements.txt`
3. Налаштувати settings.py (див. settings_static_example.py)
4. Запустити: `python manage.py runserver`
5. Читати: QUICK_START.txt для повної інструкції

## Контроль якості коду

Проєкт використовує систему автоматичного контролю якості з 110+ правилами.

### Швидкий старт

```bash
# Встановлення (один раз)
npm install

# Перевірка коду
npm run check:rules

# Автоматичне виправлення
npm run fix:rules
npm run lint:fix

# Git commit (автоматична перевірка)
git add .
git commit -m "Your message"
```

### Що перевіряється

- ✅ HTML: viewport, inputmode, video, scripts, accessibility
- ✅ CSS: viewport units, safe-area, rem, flexbox, performance
- ✅ JavaScript: var/const, eval, HTMX, bfcache, events
- ✅ Django: теги не розриваються, CSRF, forms
- ✅ Accessibility: touch targets, alt, aria, focus
- ✅ Performance: lazy loading, animations, preconnect

Детальна документація: [scripts/README.md](scripts/README.md)

## Документація

- **CSS_STRUCTURE.md** - структура CSS, normalize.css, BEM
- **HTMX_USAGE.md** - використання HTMX з Django, приклади
- **QUICK_START.txt** - швидка інструкція з усіма посиланнями
- **.cursorrules** - правила для Cursor AI (не редагувати вручну)
- **scripts/README.md** - документація системи контролю якості

## Ключові особливості

✅ Мінімальний стек = максимальна продуктивність  
✅ normalize.css забезпечує 100% крос-платформенність  
✅ HTMX для інтерактивності без JavaScript  
✅ Жорсткі правила для безпомилкової розробки  
✅ Оптимізація завантаження (defer, preconnect)  
✅ БЕЗ jQuery, core-js, Bootstrap JS

## Продуктивність

- Lighthouse Performance: 95+
- First Contentful Paint: <1s
- Total Blocking Time: <100ms
- Загальний розмір: ~65KB

## Ліцензія

MIT




