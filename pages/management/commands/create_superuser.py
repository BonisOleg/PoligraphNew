"""
Django management command для автоматичного створення суперюзера.
Команда не видаляється при редеплоях на Render, оскільки користувач зберігається в БД.

Використання:
    python manage.py create_superuser
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Створює суперюзера для адміністрування сайтом'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='Poliboss',
            help='Ім\'я користувача (за замовчуванням: Poliboss)',
        )
        parser.add_argument(
            '--password',
            type=str,
            default='Polizvas123',
            help='Пароль (за замовчуванням: Polizvas123)',
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@polygraph.local',
            help='Email адреса (за замовчуванням: admin@polygraph.local)',
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
