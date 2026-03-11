"""
Форми для сторінок сайту.
Спільні валідатори винесені на рівень модуля для уникнення дублювання.
"""

import re
from django import forms

_URL_RE = re.compile(r'https?://|www\.', re.IGNORECASE)
_HTML_RE = re.compile(r'<[a-zA-Z/]')


def _validate_no_spam(value):
    if _URL_RE.search(value):
        raise forms.ValidationError('Повідомлення не може містити посилання.')
    if _HTML_RE.search(value):
        raise forms.ValidationError('Повідомлення не може містити HTML.')


def _validate_ua_phone(value):
    digits = re.sub(r'\D', '', value)
    if len(digits) == 10 and digits.startswith('0'):
        digits = '38' + digits
    if not digits.startswith('380') or len(digits) != 12:
        raise forms.ValidationError(
            'Введіть коректний номер телефону: +38(0XX) XXX-XX-XX'
        )


def _honeypot_field(css_class):
    return forms.CharField(
        label="",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': css_class,
            'tabindex': '-1',
            'autocomplete': 'off',
            'aria-hidden': 'true',
        })
    )


class ConsultationForm(forms.Form):
    """Форма для запиту консультації в footer"""

    name = forms.CharField(
        label="Ім'я",
        max_length=100,
        required=True,
        validators=[_validate_no_spam],
        widget=forms.TextInput(attrs={
            'class': 'footer__form-input',
            'aria-required': 'true',
        })
    )

    contact = forms.CharField(
        label="Контакт (Telegram або номер телефону)",
        max_length=100,
        required=True,
        validators=[_validate_no_spam],
        widget=forms.TextInput(attrs={
            'class': 'footer__form-input',
            'aria-required': 'true',
        })
    )

    comment = forms.CharField(
        label="Ваше питання (опціонально)",
        required=False,
        validators=[_validate_no_spam],
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

    honeypot = _honeypot_field('footer__form-honeypot')

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('honeypot'):
            return cleaned_data
        return cleaned_data


class CTAContactForm(forms.Form):
    """Форма для CTA секції на головній сторінці"""

    name = forms.CharField(
        label="Ім'я",
        max_length=100,
        required=True,
        validators=[_validate_no_spam],
        widget=forms.TextInput(attrs={
            'class': 'cta__form-input',
            'aria-required': 'true',
        })
    )

    phone = forms.CharField(
        label="Телефон",
        max_length=20,
        required=True,
        validators=[_validate_ua_phone],
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
        validators=[_validate_no_spam],
        widget=forms.Textarea(attrs={
            'class': 'cta__form-textarea',
            'rows': 4,
        })
    )

    honeypot = _honeypot_field('cta__form-honeypot')

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('honeypot'):
            return cleaned_data
        return cleaned_data


class InfidelityCheckForm(forms.Form):
    """Форма для рекламного лендінгу - перевірка на зраду"""

    name = forms.CharField(
        label="Ім'я",
        max_length=100,
        required=True,
        validators=[_validate_no_spam],
        widget=forms.TextInput(attrs={
            'class': 'infidelity-form__input',
            'placeholder': "Введіть ваше ім'я",
            'aria-required': 'true',
        })
    )

    phone = forms.CharField(
        label="Номер телефону",
        max_length=20,
        required=True,
        validators=[_validate_ua_phone],
        widget=forms.TextInput(attrs={
            'class': 'infidelity-form__input',
            'type': 'tel',
            'placeholder': '+38(0__) ___-__-__',
            'inputmode': 'tel',
            'autocomplete': 'tel',
            'aria-required': 'true',
        })
    )

    honeypot = _honeypot_field('infidelity-form__honeypot')

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('honeypot'):
            return cleaned_data
        return cleaned_data


class CorporateServicesForm(forms.Form):
    """Форма для корпоративного лендінгу - професійні послуги"""

    name = forms.CharField(
        label="Ім'я",
        max_length=100,
        required=True,
        validators=[_validate_no_spam],
        widget=forms.TextInput(attrs={
            'class': 'corporate-form__input',
            'placeholder': "Введіть ваше ім'я",
            'aria-required': 'true',
        })
    )

    phone = forms.CharField(
        label="Номер телефону",
        max_length=20,
        required=True,
        validators=[_validate_ua_phone],
        widget=forms.TextInput(attrs={
            'class': 'corporate-form__input',
            'type': 'tel',
            'placeholder': '+38(0__) ___-__-__',
            'inputmode': 'tel',
            'autocomplete': 'tel',
            'aria-required': 'true',
        })
    )

    honeypot = _honeypot_field('corporate-form__honeypot')

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('honeypot'):
            return cleaned_data
        return cleaned_data
