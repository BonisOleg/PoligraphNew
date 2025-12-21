"""
WSGI config для myproject (compatibility layer).
Перенаправляє на PolygraphNew.wsgi для сумісності з Render.
"""

# Імпортуємо application з PolygraphNew
from PolygraphNew.wsgi import application

# Експортуємо для gunicorn
__all__ = ['application']

