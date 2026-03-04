# Django проект PolygraphNew - Інструкція з запуску

## ✅ Що створено

### Структура проекту
```
PolygraphNew/
├── manage.py                    # Django management
├── requirements.txt             # Залежності
├── PolygraphNew/               # Головний модуль
│   ├── settings/               # Split settings
│   │   ├── base.py            # Базові налаштування
│   │   ├── develop.py         # Development
│   │   └── production.py      # Production (Render)
│   ├── urls.py                # Головні URL
│   └── wsgi.py                # WSGI для Render
├── pages/                      # App для сторінок
│   ├── views.py               # Views з HX-Request перевіркою
│   └── urls.py                # URL маршрути
├── templates/                  # HTML шаблони
│   ├── base.html              # Базовий шаблон (з навігацією)
│   ├── index.html             # Головна сторінка
│   ├── about.html             # Про нас
│   ├── contacts.html          # Контакти
│   └── partials/              # Partial для HTMX
│       ├── index_content.html
│       ├── about_content.html
│       └── contacts_content.html
└── static/css/                 # CSS стилі
    ├── normalize.css          # НЕДОТОРКАННИЙ
    ├── base.css               # Базові стилі
    └── components/            # BEM компоненти
        ├── nav.css            # Навігація
        └── page.css           # Сторінки
```

## 🚀 Як запустити (Development)

### 1. Встановити залежності
```bash
pip install -r requirements.txt
```

### 2. Виконати міграції (вже виконано)
```bash
python manage.py migrate
```

### 3. Запустити сервер
```bash
python manage.py runserver
```

### 4. Відкрити браузер
```
http://127.0.0.1:8000/
```

## 🌐 Сторінки сайту

- **Головна** - `/` - Ознайомча сторінка з описом послуг
- **Про нас** - `/about/` - Інформація про поліграфолога та обладнання
- **Контакти** - `/contacts/` - Контактна інформація та сертифікати

## ⚡ HTMX навігація

Навігація працює без перезавантаження сторінки через HTMX:
- Клік на посилання → HTMX запит → Оновлення контенту
- URL оновлюється через history API
- Views перевіряють `HX-Request` header і повертають partial/full page

## 🎨 CSS структура

### Порядок підключення (НЕ ЗМІНЮВАТИ!)
1. normalize.css (недоторканний)
2. base.css (CSS variables)
3. components/nav.css (BEM: .nav, .nav__list, .nav__item, .nav__link)
4. components/page.css (BEM: .page, .page__header, .page__content)

### BEM методологія
- `.nav` - блок навігації
- `.nav__list` - елемент списку
- `.nav__link` - елемент посилання
- `.nav__link--active` - модифікатор активного стану

## 📦 Деплой на Render

### 1. Environment Variables
```
DJANGO_SETTINGS_MODULE=PolygraphNew.settings.production
SECRET_KEY=ваш-секретний-ключ
ALLOWED_HOSTS=ваш-домен.onrender.com
```

### 2. Build Command
```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input
```

### 3. Start Command
```bash
gunicorn PolygraphNew.wsgi:application
```

**Примітка:** Додайте `gunicorn` в requirements.txt для production:
```
Django>=4.2,<5.0
gunicorn>=20.1.0
```

## ✅ Відповідність правилам

### CSS
- ✅ normalize.css недоторканний, завжди перший
- ✅ BEM методологія для всіх класів
- ✅ CSS variables з base.css
- ✅ Немає inline styles, !important

### HTMX
- ✅ HTMX 2.0.8 з defer, після CSS
- ✅ CSRF token в meta tag
- ✅ Перевірка HX-Request в views
- ✅ Правильні HTTP методи (GET)

### Django
- ✅ Split settings (base/develop/production)
- ✅ STATIC_URL, STATICFILES_DIRS, STATIC_ROOT
- ✅ Прогресивне покращення (працює без JS)

### Безпека
- ✅ CSRF middleware
- ✅ SECRET_KEY з environment
- ✅ DEBUG=False в production
- ✅ Integrity hash для CDN

## 🔧 Налаштування

### Development
За замовчуванням використовується `develop.py`:
- DEBUG = True
- ALLOWED_HOSTS = ['localhost', '127.0.0.1']

### Production
Для Render використовується `production.py`:
- DEBUG = False
- ALLOWED_HOSTS з environment variable
- HTTPS налаштування

## 📝 Мок дані

Всі мок дані знаходяться в `pages/views.py`:
- Ім'я поліграфолога: Іванов Іван Іванович
- Обладнання: Rubicon, Stoelting CPS
- Контакти: +380 (67) 123-45-67, info@polygraph.example.com
- Сертифікати: 4 сертифікати та ліцензії

## 🎯 Що далі

1. Замінити мок дані на реальні в `pages/views.py`
2. Додати реальні зображення в `static/images/`
3. Додати favicon
4. Додати Google Analytics (якщо потрібно)
5. Налаштувати production домен на Render
6. Додати gunicorn в requirements.txt для production

## 📚 Документація

- **CSS_STRUCTURE.md** - структура CSS, normalize.css, BEM
- **HTMX_USAGE.md** - використання HTMX з Django
- **README.md** - загальний опис проекту

---

**Проект готовий до використання та деплою! 🎉**




