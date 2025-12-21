#!/usr/bin/env bash
set -o errexit

# Оновлюємо pip
python -m pip install --upgrade pip

# Встановлюємо залежності
pip install -r requirements.txt

# Видаляємо старі static files для чистого build
rm -rf staticfiles

# Збираємо static files
python manage.py collectstatic --noinput --clear

echo "✅ Static files collected successfully"

