"""
Django admin налаштування для збереженої заявок.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import LeadSubmission


@admin.register(LeadSubmission)
class LeadSubmissionAdmin(admin.ModelAdmin):
    """
    Адмін-панель для управління заявками з форм.
    """
    
    list_display = (
        'colored_name',
        'form_type_badge',
        'phone_display',
        'status_badge',
        'telegram_sent_badge',
        'created_at_display'
    )
    list_filter = (
        'form_type',
        'status',
        'telegram_sent',
        ('created_at', admin.DateFieldListFilter),
    )
    search_fields = (
        'name',
        'phone',
        'email',
        'message',
        'contact',
        'ip_address',
    )
    readonly_fields = (
        'created_at',
        'updated_at',
        'telegram_sent_at',
        'ip_address',
        'user_agent',
        'created_at_display',
        'updated_at_display',
    )
    
    fieldsets = (
        ('Основна інформація', {
            'fields': ('form_type', 'status', 'created_at_display', 'updated_at_display')
        }),
        ('Контактні дані', {
            'fields': ('name', 'phone', 'email', 'contact')
        }),
        ('Деталі заявки', {
            'fields': ('message',)
        }),
        ('Статус Telegram', {
            'fields': ('telegram_sent', 'telegram_sent_at'),
            'classes': ('collapse',)
        }),
        ('Технічна інформація', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('Нотатки адміністратора', {
            'fields': ('admin_notes',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_contacted', 'mark_as_in_progress', 'mark_as_completed', 'mark_as_cancelled']
    
    def colored_name(self, obj):
        """Показує ім'я з кольором залежно від статусу"""
        colors = {
            'new': '#ff6b6b',           # red
            'contacted': '#ffd93d',     # yellow
            'in_progress': '#6bcf7f',   # green
            'completed': '#4d96ff',     # blue
            'cancelled': '#a0a0a0',     # gray
        }
        color = colors.get(obj.status, '#000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.name
        )
    colored_name.short_description = 'Ім\'я'
    
    def form_type_badge(self, obj):
        """Показує тип форми значком"""
        badges = {
            'corporate': ('🏢 Корпоративні послуги', '#0066cc'),
            'infidelity': ('💔 Перевірка на зраду', '#cc0066'),
            'cta': ('📝 CTA заявка', '#00cc66'),
            'consultation': ('💬 Консультація', '#cc6600'),
        }
        label, color = badges.get(obj.form_type, ('Unknown', '#666'))
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            label
        )
    form_type_badge.short_description = 'Тип форми'
    
    def phone_display(self, obj):
        """Показує телефон або контакт"""
        return obj.phone or obj.contact or '—'
    phone_display.short_description = 'Контакт'
    
    def status_badge(self, obj):
        """Показує статус значком"""
        badges = {
            'new': ('🆕 Нова', '#ff6b6b'),
            'contacted': ('📞 Зв\'язалися', '#ffd93d'),
            'in_progress': ('⚙️ В роботі', '#6bcf7f'),
            'completed': ('✅ Завершено', '#4d96ff'),
            'cancelled': ('❌ Скасовано', '#a0a0a0'),
        }
        label, color = badges.get(obj.status, ('Unknown', '#666'))
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            label
        )
    status_badge.short_description = 'Статус'
    
    def telegram_sent_badge(self, obj):
        """Показує статус відправки в Telegram"""
        if obj.telegram_sent:
            return format_html(
                '<span style="color: green; font-weight: bold;">✅ Відправлено</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">❌ Не відправлено</span>'
            )
    telegram_sent_badge.short_description = 'Telegram'
    
    def created_at_display(self, obj):
        """Красиво форматує дату створення"""
        return obj.created_at.strftime('%d.%m.%Y о %H:%M:%S')
    created_at_display.short_description = 'Отримана'
    created_at_display.admin_order_field = 'created_at'
    
    def updated_at_display(self, obj):
        """Красиво форматує дату оновлення"""
        return obj.updated_at.strftime('%d.%m.%Y о %H:%M:%S')
    updated_at_display.short_description = 'Оновлена'
    updated_at_display.admin_order_field = 'updated_at'
    
    # Actions
    @admin.action(description='Позначити як "Зв\'язалися"')
    def mark_as_contacted(self, request, queryset):
        """Позначити вибрані заявки як 'Зв\'язалися'"""
        count = queryset.update(status='contacted')
        self.message_user(request, f'{count} заявок позначено як "Зв\'язалися".')
    
    @admin.action(description='Позначити як "В роботі"')
    def mark_as_in_progress(self, request, queryset):
        """Позначити вибрані заявки як 'В роботі'"""
        count = queryset.update(status='in_progress')
        self.message_user(request, f'{count} заявок позначено як "В роботі".')
    
    @admin.action(description='Позначити як "Завершено"')
    def mark_as_completed(self, request, queryset):
        """Позначити вибрані заявки як 'Завершено'"""
        count = queryset.update(status='completed')
        self.message_user(request, f'{count} заявок позначено як "Завершено".')
    
    @admin.action(description='Позначити як "Скасовано"')
    def mark_as_cancelled(self, request, queryset):
        """Позначити вибрані заявки як 'Скасовано'"""
        count = queryset.update(status='cancelled')
        self.message_user(request, f'{count} заявок позначено як "Скасовано".')
