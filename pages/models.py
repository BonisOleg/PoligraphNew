"""
Моделі для збереження заявок з форм.
"""

from django.db import models
from django.utils import timezone


class LeadSubmission(models.Model):
    """
    Модель для збереження всіх заявок з форм сайту.
    Єдина модель для всіх типів форм з гнучкою структурою.
    """
    
    FORM_TYPES = [
        ('corporate', 'Корпоративні послуги'),
        ('infidelity', 'Перевірка на зраду'),
        ('cta', 'CTA заявка'),
        ('consultation', 'Консультація'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'Нова'),
        ('contacted', 'Зв\'язалися'),
        ('in_progress', 'В роботі'),
        ('completed', 'Завершено'),
        ('cancelled', 'Скасовано'),
    ]
    
    # Мета-інформація
    form_type = models.CharField(
        max_length=20,
        choices=FORM_TYPES,
        db_index=True,
        help_text='Тип форми, з якої надійшла заявка'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new',
        db_index=True,
        help_text='Статус обробки заявки'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text='Дата та час отримання заявки'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Дата та час останньої зміни'
    )
    
    # Основні поля (спільні для всіх форм)
    name = models.CharField(
        max_length=100,
        db_index=True,
        help_text='Ім\'я клієнта'
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        db_index=True,
        help_text='Номер телефону'
    )
    email = models.EmailField(
        blank=True,
        db_index=True,
        help_text='Email адреса'
    )
    
    # Додаткові поля (опціональні)
    message = models.TextField(
        blank=True,
        help_text='Повідомлення або коментар'
    )
    contact = models.CharField(
        max_length=100,
        blank=True,
        help_text='Контакт (Telegram або телефон) для консультації'
    )
    
    # Технічні поля
    telegram_sent = models.BooleanField(
        default=False,
        db_index=True,
        help_text='Чи була заявка відправлена в Telegram'
    )
    telegram_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Дата та час відправки в Telegram'
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP адреса клієнта'
    )
    user_agent = models.TextField(
        blank=True,
        help_text='User-Agent браузера'
    )
    
    # Нотатки адміністратора
    admin_notes = models.TextField(
        blank=True,
        help_text='Внутрішні нотатки адміністратора'
    )
    
    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['form_type', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.name} ({self.get_form_type_display()}) - {self.created_at.strftime("%d.%m.%Y %H:%M")}'
    
    def mark_as_contacted(self):
        """Позначити заявку як 'Зв\'язалися'"""
        self.status = 'contacted'
        self.save()
    
    def mark_as_completed(self):
        """Позначити заявку як 'Завершено'"""
        self.status = 'completed'
        self.save()
    
    def mark_as_cancelled(self):
        """Позначити заявку як 'Скасовано'"""
        self.status = 'cancelled'
        self.save()
