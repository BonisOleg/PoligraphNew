"""
Django management command для автоматичного створення суперюзера.
Команда використовує змінні оточення для налаштування облікових даних.

Використання:
    python manage.py create_superuser
"""

import os
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Створює суперюзера для адміністрування сайтом'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default=os.environ.get('DJANGO_SUPERUSER_USERNAME', 'Poliboss'),
            help='Ім\'я користувача (за замовчуванням: з ENV або Poliboss)',
        )
        parser.add_argument(
            '--password',
            type=str,
            default=os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Polizvas123'),
            help='Пароль (за замовчуванням: з ENV або Polizvas123)',
        )
        parser.add_argument(
            '--email',
            type=str,
            default=os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@polygraph.local'),
            help='Email адреса (за замовчуванням: з ENV або admin@polygraph.local)',
        )

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        email = options['email']

        # Перевіряємо, чи користувач вже існує
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Суперюзер "{username}" вже існує. Пропускаємо створення.'
                )
            )
            return

        try:
            # Створюємо суперюзера
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Суперюзер "{username}" успішно створений!\n'
                    f'  URL адміністрування: /admin/\n'
                    f'  Логін: {username}\n'
                    f'  Email: {email}'
                )
            )
        except Exception as e:
            raise CommandError(f'Помилка при створенні суперюзера: {str(e)}')
