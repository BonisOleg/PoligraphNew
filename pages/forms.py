"""
Форми для сторінок сайту.
"""

import re
from django import forms


class ConsultationForm(forms.Form):
    """Форма для запиту консультації в footer"""
    
    name = forms.CharField(
        label="Ім'я",
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'footer__form-input',
            'aria-required': 'true',
        })
    )
    
    contact = forms.CharField(
        label="Контакт (Telegram або номер телефону)",
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'footer__form-input',
            'aria-required': 'true',
        })
    )
    
    comment = forms.CharField(
        label="Ваше питання (опціонально)",
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'footer__form-textarea',
            'rows': 3,
        })
    )
    
    consent = forms.BooleanField(
        label="Даю згоду на обробку персональних даних",
        required=True,
        widget=forms.CheckboxInput(attrs={
            'class': 'footer__form-checkbox',
            'aria-required': 'true',
        })
    )


class CTAContactForm(forms.Form):
    """Форма для CTA секції на головній сторінці"""
    
    name = forms.CharField(
        label="Ім'я",
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'cta__form-input',
            'aria-required': 'true',
        })
    )
    
    phone = forms.CharField(
        label="Телефон",
        max_length=20,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'cta__form-input',
            'type': 'tel',
            'inputmode': 'tel',
            'autocomplete': 'tel',
            'aria-required': 'true',
        })
    )
    
    email = forms.EmailField(
        label="Email",
        max_length=254,
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'cta__form-input',
            'autocomplete': 'email',
            'aria-required': 'true',
        })
    )
    
    message = forms.CharField(
        label="Повідомлення",
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'cta__form-textarea',
            'rows': 4,
        })
    )


class InfidelityCheckForm(forms.Form):
    """Форма для рекламного лендінгу - перевірка на зраду"""
    
    name = forms.CharField(
        label="Ім'я",
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'infidelity-form__input',
            'placeholder': 'Введіть ваше ім\'я',
            'aria-required': 'true',
        })
    )
    
    phone = forms.CharField(
        label="Номер телефону",
        max_length=20,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'infidelity-form__input',
            'type': 'tel',
            'placeholder': '+38(0__) ___-__-__',
            'inputmode': 'tel',
            'autocomplete': 'tel',
            'aria-required': 'true',
        })
    )
    
    honeypot = forms.CharField(
        label="",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'style': 'display:none !important;',
            'tabindex': '-1',
            'autocomplete': 'off',
        })
    )
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Перевірка honeypot
        if cleaned_data.get('honeypot'):
            raise forms.ValidationError('Помилка валідації')
        
        # Валідація телефону
        phone = cleaned_data.get('phone', '')
        digits = re.sub(r'\D', '', phone)
        
        if not digits.startswith('38'):
            raise forms.ValidationError('Телефон повинен починатися з +38')
        
        if len(digits) != 12:
            raise forms.ValidationError('Невірний формат телефону. Очікується +38(0XX) XXX-XX-XX (всього 12 цифр)')
        
        return cleaned_data


class CorporateServicesForm(forms.Form):
    """Форма для корпоративного лендінгу - професійні послуги"""
    
    name = forms.CharField(
        label="Ім'я",
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'corporate-form__input',
            'placeholder': 'Введіть ваше ім\'я',
            'aria-required': 'true',
        })
    )
    
    phone = forms.CharField(
        label="Номер телефону",
        max_length=20,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'corporate-form__input',
            'type': 'tel',
            'placeholder': '+38(0__) ___-__-__',
            'inputmode': 'tel',
            'autocomplete': 'tel',
            'aria-required': 'true',
        })
    )
    
    honeypot = forms.CharField(
        label="",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'style': 'display:none !important;',
            'tabindex': '-1',
            'autocomplete': 'off',
        })
    )
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Перевірка honeypot
        if cleaned_data.get('honeypot'):
            raise forms.ValidationError('Помилка валідації')
        
        # Валідація телефону
        phone = cleaned_data.get('phone', '')
        digits = re.sub(r'\D', '', phone)
        
        if not digits.startswith('38'):
            raise forms.ValidationError('Телефон повинен починатися з +38')
        
        if len(digits) != 12:
            raise forms.ValidationError('Невірний формат телефону. Очікується +38(0XX) XXX-XX-XX (всього 12 цифр)')
        
        return cleaned_data

