# Логіка акордеонів для сторінки "Про нас"

## Загальний опис

Сторінка містить 3 акордеон-блоки, розміщені вертикально. Кожен блок може бути згорнутий або розгорнутий. Тільки один блок може бути відкритим одночасно.

## Поведінка

### Згорнутий стан (за замовчуванням)
- Блок показує тільки заголовок та підзаголовок
- Фонове зображення з градієнтом
- Фіксована висота
- Курсор вказівник (pointer)

### Розгорнутий стан
- Блок показує весь контент
- Висота збільшується автоматично під контент
- Фон змінюється на світлий

### Взаємодія
1. **Клік/тап на згорнутий блок:**
   - Закрити всі інші блоки
   - Розгорнути поточний блок

2. **Клік/тап на вже відкритий блок:**
   - Згорнути цей блок

3. **Клік/тап поза блоками:**
   - Згорнути всі блоки

---

## CSS Стилізація

### Файл: `static/css/components/accordion.css`

#### Базові стилі контейнера

```css
/* Контейнер для всіх акордеонів */
.about-accordions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
```

#### Акордеон (згорнутий стан)

```css
/* Базовий стан акордеона */
.accordion {
  width: 80%;
  height: 35vh;
  min-height: 300px;
  margin: 0 auto;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Фонове зображення (placeholder) */
.accordion::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(100, 80, 150, 0.8), rgba(70, 50, 120, 0.9));
  z-index: 0;
}
```

#### Заголовок акордеона

```css
/* Заголовок (завжди видимий) */
.accordion__header {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
  transition: all 0.4s ease;
}

.accordion__title {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.4s ease;
}

.accordion__subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-align: center;
  transition: all 0.4s ease;
}
```

#### Контент акордеона (прихований за замовчуванням)

```css
/* Контент (прихований у згорнутому стані) */
.accordion__content {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.4s ease,
              padding 0.4s ease;
  padding: 0 2rem;
  background: #ffffff;
}
```

#### Розгорнутий стан

```css
/* Розгорнутий акордеон */
.accordion--expanded {
  height: auto;
  min-height: 80vh;
  cursor: default;
}

.accordion--expanded::before {
  background: #ffffff;
}

.accordion--expanded .accordion__header {
  height: auto;
  padding: 3rem 2rem 2rem;
  background: linear-gradient(135deg, rgba(100, 80, 150, 0.1), rgba(70, 50, 120, 0.05));
  border-radius: 24px 24px 0 0;
}

.accordion--expanded .accordion__title {
  font-size: 2.5rem;
  color: #2c1654;
}

.accordion--expanded .accordion__subtitle {
  color: #5c4a7a;
}

.accordion--expanded .accordion__content {
  max-height: none;
  opacity: 1;
  padding: 2rem;
}
```

#### Hover ефекти

```css
/* Hover для згорнутого стану */
.accordion:not(.accordion--expanded):hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.accordion:not(.accordion--expanded):hover .accordion__title {
  transform: scale(1.05);
}
```

#### Внутрішні елементи контенту

```css
/* Загальні стилі секцій всередині контенту */
.accordion__stats,
.accordion__services,
.accordion__advantages,
.accordion__education,
.accordion__process,
.accordion__principles,
.accordion__comparison,
.accordion__certification {
  margin-bottom: 3rem;
}

.accordion__section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c1654;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Статистика */
.accordion__stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.accordion__stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f3ff, #e8e4ff);
  border-radius: 16px;
  min-width: 150px;
}

.accordion__stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #5c4a7a;
  margin-bottom: 0.5rem;
}

.accordion__stat-label {
  font-size: 1rem;
  color: #6b5b8a;
  text-align: center;
}

/* Сітки карток */
.accordion__services-grid,
.accordion__advantages-grid,
.accordion__principles-grid,
.accordion__certification-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Картки послуг */
.service-card {
  background: #ffffff;
  border: 2px solid #e8e4ff;
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.service-card:hover {
  border-color: #5c4a7a;
  box-shadow: 0 4px 20px rgba(92, 74, 122, 0.1);
  transform: translateY(-2px);
}

.service-card__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.service-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c1654;
  margin-bottom: 1rem;
}

.service-card__price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #5c4a7a;
  margin-bottom: 0.5rem;
}

.service-card__discount {
  font-size: 0.875rem;
  color: #8b7ba0;
  margin-bottom: 1rem;
}

.service-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.service-card__features li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  font-size: 0.9rem;
  color: #4a4a4a;
}

.service-card__features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #5c4a7a;
  font-weight: bold;
}

.service-card__button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #5c4a7a, #7a6a9a);
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
}

.service-card__button:hover {
  background: linear-gradient(135deg, #4a3a6a, #6a5a8a);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(92, 74, 122, 0.3);
}

/* Таблиця порівняння */
.comparison-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

.comparison-table th,
.comparison-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e8e4ff;
}

.comparison-table th {
  background: linear-gradient(135deg, #f5f3ff, #e8e4ff);
  font-weight: 600;
  color: #2c1654;
}

.comparison-table__highlight {
  font-weight: 700;
  color: #5c4a7a;
}
```

#### Responsive (мобільні пристрої)

```css
/* Мобільні пристрої */
@media (max-width: 768px) {
  .about-accordions {
    padding: 1rem;
    gap: 1.5rem;
  }

  .accordion {
    width: 90%;
    height: 50vh;
    min-height: 250px;
  }

  .accordion__title {
    font-size: 2rem;
  }

  .accordion__subtitle {
    font-size: 1.25rem;
  }

  .accordion--expanded .accordion__title {
    font-size: 1.75rem;
  }

  .accordion__stats {
    flex-direction: column;
    align-items: center;
  }

  .accordion__services-grid,
  .accordion__advantages-grid,
  .accordion__principles-grid,
  .accordion__certification-grid {
    grid-template-columns: 1fr;
  }

  .comparison-table {
    font-size: 0.875rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.75rem 0.5rem;
  }
}

/* Планшети */
@media (min-width: 769px) and (max-width: 1024px) {
  .accordion {
    width: 85%;
    height: 40vh;
  }

  .accordion__title {
    font-size: 2.5rem;
  }
}
```

---

## JavaScript Логіка

### Файл: `static/js/accordion.js`

```javascript
/**
 * Логіка акордеонів для сторінки "Про нас"
 * Vanilla JS без залежностей
 */

document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion');
  
  // Функція для закриття всіх акордеонів
  const closeAllAccordions = () => {
    accordions.forEach(accordion => {
      accordion.classList.remove('accordion--expanded');
      accordion.setAttribute('aria-expanded', 'false');
    });
  };
  
  // Функція для відкриття акордеона
  const openAccordion = (accordion) => {
    accordion.classList.add('accordion--expanded');
    accordion.setAttribute('aria-expanded', 'true');
    
    // Плавний скрол до відкритого акордеона
    setTimeout(() => {
      accordion.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };
  
  // Обробник кліку на акордеон
  accordions.forEach(accordion => {
    const header = accordion.querySelector('.accordion__header');
    
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const isExpanded = accordion.classList.contains('accordion--expanded');
      
      if (isExpanded) {
        // Якщо вже відкритий - закрити
        closeAllAccordions();
      } else {
        // Закрити всі інші та відкрити поточний
        closeAllAccordions();
        openAccordion(accordion);
      }
    });
    
    // Підтримка клавіатури (Enter/Space)
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });
  
  // Клік поза акордеонами - закрити всі
  document.addEventListener('click', (e) => {
    const clickedInsideAccordion = e.target.closest('.accordion');
    
    if (!clickedInsideAccordion) {
      closeAllAccordions();
    }
  });
  
  // Закриття при Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllAccordions();
    }
  });
});
```

---

## Підключення до проекту

### 1. Підключити CSS в `templates/about.html`

Вже підключено в блоці `component_css`:

```html
{% block component_css %}
<link rel="stylesheet" href="{% static 'css/components/nav.css' %}">
<link rel="stylesheet" href="{% static 'css/components/accordion.css' %}">
{% endblock %}
```

### 2. Підключити JS в `templates/base.html`

Додати в блок `scripts` (перед закриттям `</body>`):

```html
{% block scripts %}
<script src="{% static 'js/accordion.js' %}" defer></script>
{% endblock %}
```

---

## Accessibility (Доступність)

### ARIA атрибути

- `aria-expanded="false"` на `.accordion` - показує стан акордеона
- `role="button"` на `.accordion__header` - вказує що це інтерактивний елемент
- `tabindex="0"` на `.accordion__header` - дозволяє фокус з клавіатури
- `aria-label` - описові мітки для скрінрідерів
- `aria-hidden="true"` на іконках - приховує декоративні елементи

### Клавіатурна навігація

- `Tab` - переміщення між акордеонами
- `Enter` або `Space` - розгортання/згортання
- `Escape` - закриття всіх акордеонів

### Фокус

```css
.accordion__header:focus {
  outline: 3px solid #5c4a7a;
  outline-offset: 4px;
}
```

---

## Продуктивність

### Оптимізація анімацій

- Використання `transform` та `opacity` (GPU acceleration)
- `cubic-bezier()` для плавних переходів
- `will-change` для складних анімацій (використовувати обережно)

### Lazy loading зображень

```html
<img src="..." alt="..." loading="lazy">
```

---

## Тестування

### Браузери для тестування

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Пристрої

- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

### Перевірити

1. ✅ Розгортання/згортання працює плавно
2. ✅ Тільки один блок відкритий одночасно
3. ✅ Клік поза блоками закриває всі
4. ✅ Клавіатурна навігація працює
5. ✅ Анімації плавні без лагів
6. ✅ Responsive на всіх пристроях
7. ✅ Accessibility (скрінрідери)

---

## Примітки

- Весь контент завантажується одразу (швидко, без затримок)
- JS тільки керує класами (мінімальна логіка)
- CSS анімації (апаратне прискорення)
- Зображення для фону додати пізніше
- Кольори можна налаштувати під дизайн-систему


