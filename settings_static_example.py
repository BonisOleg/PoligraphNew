# Приклад налаштувань Django для static files
# Скопіюйте ці налаштування в ваш settings.py

import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/stable/howto/static-files/

STATIC_URL = '/static/'

# Для development
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Для production (Render)
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Static files finders
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# Важливо: Переконайтеся, що 'django.contrib.staticfiles' додано до INSTALLED_APPS
# INSTALLED_APPS = [
#     ...
#     'django.contrib.staticfiles',
#     ...
# ]




