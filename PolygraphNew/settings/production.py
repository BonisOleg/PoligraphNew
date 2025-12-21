"""
Production settings for PolygraphNew project.
For deployment on Render.
"""

from .base import *
import os
import dj_database_url

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# ALLOWED_HOSTS для Render - максимальний fallback
ALLOWED_HOSTS = []

# 1. Додаємо з ALLOWED_HOSTS (якщо є)
allowed_hosts_env = os.environ.get('ALLOWED_HOSTS', '')
if allowed_hosts_env:
    ALLOWED_HOSTS.extend([host.strip() for host in allowed_hosts_env.split(',') if host.strip()])

# 2. Додаємо RENDER_EXTERNAL_HOSTNAME (якщо є)
render_hostname = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if render_hostname and render_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_hostname)

# 3. Додаємо RENDER_SERVICE_NAME (якщо є)
render_service = os.environ.get('RENDER_SERVICE_NAME')
if render_service:
    # Можливі варіанти доменів Render
    possible_hosts = [
        f'{render_service}.onrender.com',
        f'{render_service}.render.com',
    ]
    for host in possible_hosts:
        if host not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(host)

# 4. Fallback: якщо ALLOWED_HOSTS досі порожній
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ['polygraph.website', 'www.polygraph.website']
    if render_hostname:
        ALLOWED_HOSTS.append(render_hostname)
    # Додаємо всі можливі варіанти
    ALLOWED_HOSTS.extend([
        'localhost',
        '127.0.0.1',
    ])

# 5. DEBUG mode: додаємо localhost
if DEBUG:
    ALLOWED_HOSTS.extend(['localhost', '127.0.0.1', '0.0.0.0'])

# Видаляємо дублікати та порожні значення
ALLOWED_HOSTS = [h for h in list(set(ALLOWED_HOSTS)) if h and h.strip()]

# Database configuration
USE_SQLITE = os.environ.get('USE_SQLITE', 'False') == 'True'

if USE_SQLITE:
    # Використовуємо SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Використовуємо PostgreSQL через DATABASE_URL
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

# WhiteNoise для статичних файлів
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Діагностичні middleware
MIDDLEWARE.insert(0, 'PolygraphNew.middleware.DiagnosticMiddleware')
MIDDLEWARE.append('PolygraphNew.middleware.ErrorLoggingMiddleware')

# Використовуємо CompressedStaticFilesStorage без manifest
# Це виключає потребу в manifest файлі, але все ще компресує файли
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Security settings for production
if not DEBUG:
    # Render обробляє SSL на рівні load balancer
    # Тому не потрібно SECURE_SSL_REDIRECT
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# Logging для діагностики
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'detailed': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'pages': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'PolygraphNew': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Перевірка бази даних
if USE_SQLITE:
    db_path = DATABASES['default']['NAME']
    db_dir = db_path.parent
    # Створюємо директорію для бази даних, якщо не існує
    db_dir.mkdir(parents=True, exist_ok=True)

# Діагностика при старті (ПІСЛЯ всіх налаштувань)
import logging
import traceback
from pathlib import Path

logger = logging.getLogger(__name__)

# КРИТИЧНО: Якщо все ще порожній, використовуємо '*'
# (небезпечно, але краще ніж 400 помилки)
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ['*']

try:
    # Логуємо всі змінні оточення (без секретів)
    logger.info('=== Django Production Settings ===')
    logger.info(f'ALLOWED_HOSTS env: {os.environ.get("ALLOWED_HOSTS", "NOT SET")}')
    logger.info(f'RENDER_EXTERNAL_HOSTNAME: {os.environ.get("RENDER_EXTERNAL_HOSTNAME", "NOT SET")}')
    logger.info(f'RENDER_SERVICE_NAME: {os.environ.get("RENDER_SERVICE_NAME", "NOT SET")}')
    logger.info(f'Final ALLOWED_HOSTS: {ALLOWED_HOSTS}')
    logger.info(f'DEBUG: {DEBUG}')
    logger.info(f'USE_SQLITE: {USE_SQLITE}')
    
    try:
        logger.info(f'Database engine: {DATABASES["default"]["ENGINE"]}')
        logger.info(f'Database name: {DATABASES["default"].get("NAME", "NOT SET")}')
    except (KeyError, NameError) as e:
        logger.error(f'DATABASES error: {e}')
        logger.error(traceback.format_exc())
    
    logger.info(f'SECRET_KEY is set: {bool(SECRET_KEY)}')
    logger.info(f'STATIC_ROOT: {STATIC_ROOT}')
    logger.info(f'STATIC_URL: {STATIC_URL}')
    
    # Перевірка static files
    try:
        static_root_path = Path(STATIC_ROOT)
        if not static_root_path.exists():
            logger.warning(f'STATIC_ROOT directory does not exist: {STATIC_ROOT}')
            logger.warning('Run: python manage.py collectstatic --noinput')
        else:
            logger.info(f'STATIC_ROOT exists: {STATIC_ROOT}')
    except Exception as e:
        logger.error(f'Error checking STATIC_ROOT: {e}')
    
    # Критична перевірка
    if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['*']:
        if ALLOWED_HOSTS == ['*']:
            logger.warning('⚠️ ALLOWED_HOSTS is empty, using "*" as fallback (INSECURE!)')
        else:
            logger.error('⚠️ CRITICAL: ALLOWED_HOSTS is empty! All requests will be rejected with 400!')
    else:
        logger.info(f'✅ ALLOWED_HOSTS configured: {ALLOWED_HOSTS}')
    
    logger.info('==================================')
except Exception as e:
    # Якщо логування викликає помилку, не падаємо
    print(f'❌ Error in logging: {e}')
    print(traceback.format_exc())

