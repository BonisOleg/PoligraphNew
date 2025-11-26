# Налаштування normalize.css для крос-платформенності

## Що вже налаштовано

✅ Структура CSS файлів створена
✅ normalize.css v12.1.1 завантажено та захищено
✅ Базовий шаблон з правильним порядком підключення
✅ .cursorrules з жорсткими правилами для агента
✅ .gitattributes для захисту normalize.css
✅ Документація CSS_STRUCTURE.md

## Налаштування Django

### 1. Додайте налаштування static files в settings.py

Відкрийте файл `settings_static_example.py` та скопіюйте налаштування в ваш `settings.py`:

```python
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

### 2. Переконайтеся, що 'django.contrib.staticfiles' в INSTALLED_APPS

```python
INSTALLED_APPS = [
    ...
    'django.contrib.staticfiles',
    ...
]
```

### 3. У шаблонах використовуйте base.html

```django
{% extends 'base.html' %}

{% block title %}Моя сторінка{% endblock %}

{% block content %}
    <!-- Ваш контент тут -->
{% endblock %}
```

## Структура проекту

```
PolygraphNew/
├── static/
│   └── css/
│       ├── normalize.css      # НЕДОТОРКАННИЙ
│       ├── base.css           # Базові стилі
│       ├── components/        # Компоненти
│       └── utilities/         # Утиліти
├── templates/
│   └── base.html              # Базовий шаблон
├── .cursorrules               # Правила для Cursor AI
├── .gitattributes             # Захист normalize.css
├── CSS_STRUCTURE.md           # Документація
└── settings_static_example.py # Приклад налаштувань
```

## Важливі правила

1. **normalize.css - НЕДОТОРКАННИЙ** - не змінюйте цей файл
2. **Порядок підключення CSS** - normalize.css завжди перший
3. **Всі CSS зміни** - тільки в файлах після normalize.css
4. **BEM методологія** - для naming класів
5. **CSS custom properties** - для кольорів/відступів

## Детальна документація

Дивіться `CSS_STRUCTURE.md` для детальної інформації про:
- Структуру CSS файлів
- Правила роботи з CSS
- BEM методологію
- Гарантії крос-платформенності

## Підтримка

Якщо виникли питання або проблеми, зверніться до документації:
- normalize.css: https://csstools.github.io/normalize.css/
- Django static files: https://docs.djangoproject.com/en/stable/howto/static-files/




