"""
Форми для сторінок сайту.
"""

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

