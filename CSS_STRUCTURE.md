# Структура CSS та правила роботи

## Мета

Забезпечити 100% крос-платформенність, відсутність конфліктів та оптимальну продуктивність через правильну структуру CSS.

## Стек CSS

- **normalize.css v12.1.1** - нормалізація браузерів (недоторканний)
- **Vanilla CSS** - всі стилі проекту
- **BEM методологія** - naming convention
- **CSS Custom Properties** - для змінних (кольори, відступи)

## Підтримувані браузери

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (2021+)

## Структура CSS файлів

```
static/css/
  ├── normalize.css          # НЕДОТОРКАННИЙ - тільки оновлення версії
  ├── base.css               # Базові стилі проекту (після normalize)
  ├── components/            # Компоненти (BEM методологія)
  │   └── *.css
  └── utilities/            # Утилітарні класи
      └── *.css
```

## Обов'язковий порядок підключення CSS

1. **normalize.css** - ЗАВЖДИ перший (через {% static %} в base.html)
2. **base.css** - базові стилі проекту
3. **components/*.css** - компоненти
4. **utilities/*.css** - утиліти
5. **page-specific.css** - стилі конкретних сторінок

## normalize.css - НЕДОТОРКАННИЙ ФАЙЛ

### ⚠️ КРИТИЧНО: ЦЕЙ ФАЙЛ НЕ МОЖНА ЗМІНЮВАТИ ⚠️

**АБСОЛЮТНА ЗАБОРОНА:**
- Змінювати
- Редагувати
- Коментувати
- Видаляти рядки
- Додавати нові правила

**ЄДИНА ДОЗВОЛЕНА ДІЯ:**
- Оновлення до нової версії (повна заміна вмісту файлу)

### Що робить normalize.css

normalize.css v12.1.1 забезпечує:
- Виправлення багів у різних браузерах
- Нормалізацію стилів для узгодженого відображення
- Підтримку всіх сучасних браузерів (Chrome, Edge, Firefox, Safari, Opera)

### Які стилі вже нормалізовані

normalize.css вже нормалізує:
- Line height та text size adjustment
- Font sizes для заголовків
- Margins та padding для списків
- Box sizing для різних елементів
- Form elements (button, input, select, textarea)
- Images та embedded content
- І багато іншого

**НЕ ДУБЛЮЙТЕ ЦІ ПРАВИЛА** в інших CSS файлах!

## Правила роботи з CSS

### Заборонено

1. ❌ Дублювати правила з normalize.css
2. ❌ Використовувати !important для перевизначення normalize
3. ❌ Inline styles (style="")
4. ❌ Глобальні селектори типу * { } після normalize
5. ❌ Використання ID для стилізації (тільки класи)

### Обов'язково

1. ✅ Використовувати специфічність замість !important
2. ✅ Використовувати BEM методологію для naming
3. ✅ Перевіряти на конфлікти перед додаванням нового CSS
4. ✅ Використовувати CSS custom properties для кольорів/відступів (DRY)
5. ✅ Всі CSS зміни ТІЛЬКИ в файлах після normalize.css

## BEM методологія

Використовуйте BEM (Block Element Modifier) для naming класів:

```css
/* Block */
.button { }

/* Block__Element */
.button__icon { }

/* Block--Modifier */
.button--primary { }
.button--disabled { }
```

## CSS Custom Properties

Використовуйте CSS custom properties для кольорів та відступів:

```css
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --spacing-small: 0.5rem;
  --spacing-medium: 1rem;
  --spacing-large: 2rem;
}

.button {
  background-color: var(--color-primary);
  padding: var(--spacing-medium);
}
```

## Перевірка перед додаванням CSS

Перед додаванням нового CSS правила:

1. Перевірте, чи не дублюється воно з normalize.css
2. Перевірте, чи немає конфліктів з існуючими стилями
3. Переконайтеся, що використовується правильна специфічність
4. Переконайтеся, що використовується BEM naming (якщо це компонент)

## Гарантії крос-платформенності

1. **normalize.css v12.1.1** - підтримує всі сучасні браузери
2. **Жорсткий порядок підключення** - гарантує коректну каскадність CSS
3. **Відсутність дублів** - через перевірки в .cursorrules та структуру файлів
4. **Відсутність конфліктів** - через BEM методологію та чітку структуру
5. **Автоматичні перевірки** - через .gitattributes та документацію

## Додаткова інформація

- Офіційна документація normalize.css: https://csstools.github.io/normalize.css/
- BEM методологія: http://getbem.com/
- CSS Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

