# HTMX Використання з Django

## Що таке HTMX

HTMX дозволяє додавати AJAX, WebSockets та інтерактивність через HTML-атрибути без написання JavaScript.

## Підключення

HTMX вже підключено в `templates/base.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js" 
        integrity="sha384-/TgkGk7p307TH7EXJDuUlgG3Ce1UVolAOFopFekQkkXihi5u/6OCvVKyz1W+idaz" 
        crossorigin="anonymous" 
        defer></script>
```

## CSRF Token для HTMX

У `base.html` вже налаштовано CSRF token:

```html
<meta name="csrf-token" content="{{ csrf_token }}">
```

HTMX автоматично використовує його для POST/PUT/DELETE запитів.

## Основні атрибути HTMX

### hx-get - GET запит

```html
<button hx-get="/api/data" hx-target="#result">
    Завантажити дані
</button>
<div id="result"></div>
```

### hx-post - POST запит (з CSRF)

```html
<form hx-post="/submit/" hx-target="#result">
    {% csrf_token %}
    <input type="text" name="name">
    <button type="submit">Відправити</button>
</form>
<div id="result"></div>
```

### hx-target - куди вставити результат

```html
<button hx-get="/content" hx-target="#container">
    Завантажити
</button>
```

### hx-swap - як вставити

- `innerHTML` (default) - замінити вміст
- `outerHTML` - замінити весь елемент
- `beforebegin` - перед елементом
- `afterbegin` - на початок вмісту
- `beforeend` - в кінець вмісту
- `afterend` - після елемента

```html
<button hx-get="/item" hx-target="#list" hx-swap="beforeend">
    Додати елемент
</button>
```

### hx-trigger - коли виконувати

```html
<!-- При кліку (default для button) -->
<button hx-get="/data">Клік</button>

<!-- При зміні input -->
<input hx-get="/search" hx-trigger="keyup changed delay:500ms" hx-target="#results">

<!-- При завантаженні сторінки -->
<div hx-get="/content" hx-trigger="load"></div>

<!-- При скролі -->
<div hx-get="/more" hx-trigger="revealed"></div>
```

## Django Views для HTMX

### Повертати HTML фрагменти

```python
# views.py
from django.shortcuts import render

def search_view(request):
    query = request.GET.get('q', '')
    results = Model.objects.filter(name__icontains=query)
    
    # Повертаємо тільки HTML фрагмент
    return render(request, 'partials/search_results.html', {
        'results': results
    })
```

### Перевірка HTMX запиту

```python
def my_view(request):
    if request.headers.get('HX-Request'):
        # Це HTMX запит - повертаємо partial
        return render(request, 'partials/content.html', context)
    else:
        # Звичайний запит - повертаємо повну сторінку
        return render(request, 'full_page.html', context)
```

### HTTP статуси для валідації

```python
from django.http import HttpResponse

def form_view(request):
    form = MyForm(request.POST)
    if form.is_valid():
        form.save()
        return render(request, 'partials/success.html')
    else:
        # 422 для помилок валідації
        return render(request, 'partials/form_errors.html', 
                     {'form': form}, status=422)
```

## Приклади компонентів

### Форма з валідацією

```html
<form hx-post="/submit/" hx-target="#form-container" hx-swap="outerHTML">
    {% csrf_token %}
    <input type="text" name="name" required>
    <button type="submit">Відправити</button>
</form>
<div id="form-errors"></div>
```

### Пошук в реальному часі

```html
<input type="text" 
       name="search"
       hx-get="/search/" 
       hx-trigger="keyup changed delay:300ms"
       hx-target="#search-results"
       placeholder="Пошук...">
<div id="search-results"></div>
```

### Ліниве завантаження (lazy loading)

```html
<div hx-get="/load-content/" 
     hx-trigger="revealed"
     hx-indicator="#spinner">
    <div id="spinner" class="htmx-indicator">Завантаження...</div>
</div>
```

### Infinite scroll

```html
<div id="content">
    <!-- Список елементів -->
</div>
<div hx-get="/more?page=2" 
     hx-trigger="revealed" 
     hx-swap="afterend"
     hx-target="#content">
    Завантаження...
</div>
```

### Модальне вікно

```html
<button hx-get="/modal-content/" 
        hx-target="#modal-container"
        hx-swap="innerHTML">
    Відкрити модальне вікно
</button>

<div id="modal-container"></div>
```

## Best Practices

1. **CSRF Token** - завжди використовувати для POST/PUT/DELETE
2. **HTTP методи** - GET для читання, POST для створення/зміни
3. **Partial templates** - повертати тільки потрібний HTML
4. **Індикатори** - показувати індикатори завантаження
5. **Помилки** - обробляти помилки валідації (422 status)
6. **Доступність** - використовувати semantic HTML
7. **Прогресивне покращення** - сайт має працювати без JavaScript

## Додаткова інформація

- Офіційна документація: https://htmx.org/docs/
- Приклади: https://htmx.org/examples/
- Django + HTMX: https://django-htmx.readthedocs.io/




