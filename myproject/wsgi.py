"""
WSGI config для myproject (compatibility layer).
Перенаправляє на PolygraphNew.wsgi для сумісності з Render.
"""

import os
import sys

# Встановлюємо DJANGO_SETTINGS_MODULE якщо не встановлено
if 'DJANGO_SETTINGS_MODULE' not in os.environ:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PolygraphNew.settings.production')

# Імпортуємо application з PolygraphNew
try:
    from PolygraphNew.wsgi import application
except ImportError as e:
    # Якщо не вдалося імпортувати, спробуємо ініціалізувати Django
    import django
    from django.core.wsgi import get_wsgi_application
    django.setup()
    application = get_wsgi_application()

# Експортуємо для gunicorn
__all__ = ['application']

