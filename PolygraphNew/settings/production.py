"""
Production settings for PolygraphNew project.
For deployment on Render.
"""

from .base import *
import os
import dj_database_url
import logging
import sys

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# ALLOWED_HOSTS
ALLOWED_HOSTS = [
    'poligraph-0yg0.onrender.com',
    'www.polygraph.website',
    'polygraph.website',
]

if DEBUG:
    ALLOWED_HOSTS.extend(['localhost', '127.0.0.1'])

# Database configuration
# Case-insensitive check for environment variables
# Render sets environment values as lowercase 'true'/'false'
USE_SQLITE = os.environ.get('USE_SQLITE', 'False').lower() == 'true'

if USE_SQLITE:
    # Використовуємо SQLite (ТІЛЬКИ ЯКЩО ЯВНО ВКАЗАНО)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Використовуємо PostgreSQL через DATABASE_URL
    # Render requires ssl_require=True for database connections
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url and os.environ.get('RENDER'):
        # Якщо ми на Render, але немає DATABASE_URL - це критична помилка
        # Ми ПОВИННІ впасти, щоб користувач побачив помилку і виправив її
        error_msg = (
            "CRITICAL ERROR: DATABASE_URL is missing on Render!\n"
            "You MUST set DATABASE_URL in Render Dashboard to use PostgreSQL.\n"
            "If you want to use ephemeral SQLite (NOT RECOMMENDED), set USE_SQLITE=true."
        )
        print(error_msg)
        # Якщо це не collectstatic, падаємо
        if 'collectstatic' not in sys.argv:
            raise ValueError(error_msg)
            
        # Для collectstatic можна тимчасово використати sqlite, щоб білд пройшов
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
    else:
        database_config = dj_database_url.config(
            default=database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
        
        # Add SSL requirement for Render (production PostgreSQL)
        if database_config:
            database_config['OPTIONS'] = {
                'sslmode': 'require',
            }
        
        DATABASES = {
            'default': database_config
        }

# WhiteNoise для статичних файлів
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Діагностичні middleware
MIDDLEWARE.insert(0, 'PolygraphNew.middleware.DiagnosticMiddleware')
MIDDLEWARE.append('PolygraphNew.middleware.ErrorLoggingMiddleware')

# Використовуємо CompressedStaticFilesStorage без manifest
# Це виключає потребу в manifest файлі, але все ще компресує файли
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

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

try:
    logger.info('=== Django Production Settings ===')
    logger.info(f'ALLOWED_HOSTS: {ALLOWED_HOSTS}')
    logger.info(f'DEBUG: {DEBUG}')
    logger.info(f'USE_SQLITE: {USE_SQLITE}')
    try:
        logger.info(f'Database engine: {DATABASES["default"]["ENGINE"]}')
    except (KeyError, NameError) as e:
        logger.error(f'DATABASES error: {e}')
    logger.info('==================================')
except Exception as e:
    print(f'Error in logging: {e}')
    print(traceback.format_exc())
