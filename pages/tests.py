"""
Тести для CTA-форми: захист від ботів (honeypot) та валідація UA-номера.
"""

from unittest.mock import patch

from django.test import Client, TestCase
from django.urls import reverse

from .forms import CTAContactForm
from .models import LeadSubmission


# ---------------------------------------------------------------------------
# CTAContactForm — unit тести
# ---------------------------------------------------------------------------

class CTAContactFormPhoneValidationTest(TestCase):
    """Валідація українського номера телефону."""

    BASE_DATA = {
        'name': 'Тест Користувач',
        'email': 'test@example.com',
        'message': '',
        'honeypot': '',
    }

    def _form(self, phone):
        return CTAContactForm(data={**self.BASE_DATA, 'phone': phone})

    # --- коректні формати ---

    def test_valid_full_format_plus(self):
        self.assertTrue(self._form('+380671234567').is_valid())

    def test_valid_full_format_no_plus(self):
        self.assertTrue(self._form('380671234567').is_valid())

    def test_valid_zero_prefix(self):
        """0671234567 → нормалізується до 380671234567."""
        self.assertTrue(self._form('0671234567').is_valid())

    def test_valid_with_dashes(self):
        self.assertTrue(self._form('+38(067)123-45-67').is_valid())

    def test_valid_with_spaces(self):
        self.assertTrue(self._form('+38 067 123 45 67').is_valid())

    def test_valid_vodafone(self):
        self.assertTrue(self._form('+380501234567').is_valid())

    def test_valid_lifecell(self):
        self.assertTrue(self._form('+380631234567').is_valid())

    # --- некоректні формати ---

    def test_invalid_too_short(self):
        self.assertFalse(self._form('067123').is_valid())

    def test_invalid_russian_number(self):
        self.assertFalse(self._form('+79161234567').is_valid())

    def test_invalid_us_number(self):
        self.assertFalse(self._form('+12125551234').is_valid())

    def test_invalid_letters(self):
        self.assertFalse(self._form('phone-number').is_valid())

    def test_invalid_empty_phone(self):
        self.assertFalse(self._form('').is_valid())

    def test_invalid_too_long(self):
        self.assertFalse(self._form('+3806712345678').is_valid())

    def test_invalid_wrong_prefix(self):
        """11 цифр, але не 380."""
        self.assertFalse(self._form('48123456789').is_valid())

    def test_error_message_ua(self):
        form = self._form('+79161234567')
        form.is_valid()
        self.assertIn('Введіть коректний номер телефону', str(form.errors))


class CTAContactFormRequiredFieldsTest(TestCase):
    """Обов'язкові поля."""

    def test_missing_name(self):
        form = CTAContactForm(data={
            'name': '', 'phone': '+380671234567',
            'email': 'test@example.com', 'honeypot': '',
        })
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)

    def test_missing_phone(self):
        form = CTAContactForm(data={
            'name': 'Тест', 'phone': '',
            'email': 'test@example.com', 'honeypot': '',
        })
        self.assertFalse(form.is_valid())

    def test_missing_email(self):
        form = CTAContactForm(data={
            'name': 'Тест', 'phone': '+380671234567',
            'email': '', 'honeypot': '',
        })
        self.assertFalse(form.is_valid())
        self.assertIn('email', form.errors)

    def test_invalid_email_format(self):
        form = CTAContactForm(data={
            'name': 'Тест', 'phone': '+380671234567',
            'email': 'not-an-email', 'honeypot': '',
        })
        self.assertFalse(form.is_valid())

    def test_message_optional(self):
        form = CTAContactForm(data={
            'name': 'Тест', 'phone': '+380671234567',
            'email': 'test@example.com',
            'message': '', 'honeypot': '',
        })
        self.assertTrue(form.is_valid())


class CTAContactFormHoneypotTest(TestCase):
    """Honeypot-логіка на рівні форми."""

    VALID_DATA = {
        'name': 'Бот Іванов',
        'phone': '+380671234567',
        'email': 'bot@spam.com',
        'message': 'buy cheap meds',
    }

    def test_honeypot_filled_form_still_valid(self):
        """Форма valid при заповненому honeypot — catch у view."""
        form = CTAContactForm(data={**self.VALID_DATA, 'honeypot': 'filled'})
        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data['honeypot'], 'filled')

    def test_honeypot_empty_does_not_block_real_user(self):
        form = CTAContactForm(data={**self.VALID_DATA, 'honeypot': ''})
        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data['honeypot'], '')


# ---------------------------------------------------------------------------
# index_view — інтеграційні тести
# ---------------------------------------------------------------------------

class IndexViewCTAPostTest(TestCase):
    """POST на головну: реальні заявки та боти."""

    URL = '/'

    VALID_POST = {
        'name': 'Юлія Тест',
        'phone': '+380671234567',
        'email': 'yulia@example.com',
        'message': 'Хочу консультацію',
        'honeypot': '',
    }

    @patch('pages.views.send_telegram_message', return_value=True)
    def test_valid_submission_returns_200(self, _mock_tg):
        resp = self.client.post(self.URL, data=self.VALID_POST,
                                HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 200)

    @patch('pages.views.send_telegram_message', return_value=True)
    def test_valid_submission_saves_to_db(self, _mock_tg):
        self.client.post(self.URL, data=self.VALID_POST,
                         HTTP_HX_REQUEST='true')
        self.assertEqual(LeadSubmission.objects.filter(form_type='cta').count(), 1)
        lead = LeadSubmission.objects.get(form_type='cta')
        self.assertEqual(lead.name, 'Юлія Тест')
        self.assertEqual(lead.email, 'yulia@example.com')

    @patch('pages.views.send_telegram_message', return_value=True)
    def test_valid_submission_calls_telegram(self, mock_tg):
        self.client.post(self.URL, data=self.VALID_POST,
                         HTTP_HX_REQUEST='true')
        mock_tg.assert_called_once()

    @patch('pages.views.send_telegram_message', return_value=True)
    def test_success_html_in_response(self, _mock_tg):
        resp = self.client.post(self.URL, data=self.VALID_POST,
                                HTTP_HX_REQUEST='true')
        self.assertIn(b'cta__form-success', resp.content)

    # --- honeypot (боти) ---

    @patch('pages.views.send_telegram_message')
    def test_honeypot_filled_returns_200(self, mock_tg):
        """Бот отримує 200, але нічого не зберігається."""
        bot_data = {**self.VALID_POST, 'honeypot': 'http://spam.com'}
        resp = self.client.post(self.URL, data=bot_data,
                                HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 200)

    @patch('pages.views.send_telegram_message')
    def test_honeypot_filled_not_saved_to_db(self, mock_tg):
        bot_data = {**self.VALID_POST, 'honeypot': 'click here'}
        self.client.post(self.URL, data=bot_data, HTTP_HX_REQUEST='true')
        self.assertEqual(LeadSubmission.objects.count(), 0)

    @patch('pages.views.send_telegram_message')
    def test_honeypot_filled_telegram_not_called(self, mock_tg):
        bot_data = {**self.VALID_POST, 'honeypot': 'spam'}
        self.client.post(self.URL, data=bot_data, HTTP_HX_REQUEST='true')
        mock_tg.assert_not_called()

    @patch('pages.views.send_telegram_message')
    def test_honeypot_response_looks_like_success(self, _mock_tg):
        """Відповідь для бота містить той самий success HTML."""
        bot_data = {**self.VALID_POST, 'honeypot': 'bot'}
        resp = self.client.post(self.URL, data=bot_data,
                                HTTP_HX_REQUEST='true')
        self.assertIn(b'cta__form-success', resp.content)

    # --- невалідний телефон ---

    def test_invalid_ua_phone_returns_422(self):
        data = {**self.VALID_POST, 'phone': '+79161234567'}
        resp = self.client.post(self.URL, data=data, HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 422)

    def test_invalid_ua_phone_not_saved(self):
        data = {**self.VALID_POST, 'phone': '12345'}
        self.client.post(self.URL, data=data, HTTP_HX_REQUEST='true')
        self.assertEqual(LeadSubmission.objects.count(), 0)

    def test_error_html_on_invalid_phone(self):
        data = {**self.VALID_POST, 'phone': '+79161234567'}
        resp = self.client.post(self.URL, data=data, HTTP_HX_REQUEST='true')
        self.assertIn(b'cta__form-errors', resp.content)

    # --- GET залишається робочим ---

    def test_get_returns_200(self):
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, 200)

    def test_htmx_get_returns_partial(self):
        resp = self.client.get(self.URL, HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 200)


# ---------------------------------------------------------------------------
# Нормалізація номерів — edge cases
# ---------------------------------------------------------------------------

class PhoneNormalizationTest(TestCase):
    """Перевірка нормалізації 10-значного формату."""

    BASE = {'name': 'Тест', 'email': 't@t.com', 'message': '', 'honeypot': ''}

    def test_ten_digits_with_zero_prefix(self):
        form = CTAContactForm(data={**self.BASE, 'phone': '0671234567'})
        self.assertTrue(form.is_valid(), form.errors)

    def test_ten_digits_without_zero_prefix_invalid(self):
        """10 цифр без 0 — не UA-номер."""
        form = CTAContactForm(data={**self.BASE, 'phone': '1234567890'})
        self.assertFalse(form.is_valid())

    def test_formatted_plus38_parens(self):
        form = CTAContactForm(data={**self.BASE, 'phone': '+38(067)123-45-67'})
        self.assertTrue(form.is_valid(), form.errors)

    def test_formatted_spaces(self):
        form = CTAContactForm(data={**self.BASE, 'phone': '+38 067 123 45 67'})
        self.assertTrue(form.is_valid(), form.errors)


# ---------------------------------------------------------------------------
# Spam content — валідація вмісту полів name / message
# ---------------------------------------------------------------------------

class CTAContactFormSpamContentTest(TestCase):
    """Перевірка _validate_no_spam на полях name та message."""

    VALID_DATA = {
        'name': 'Юлія',
        'phone': '+380671234567',
        'email': 'test@example.com',
        'message': 'Хочу консультацію щодо перевірки',
        'honeypot': '',
    }

    def _with(self, **overrides):
        return CTAContactForm(data={**self.VALID_DATA, **overrides})

    # --- message з посиланнями ---

    def test_message_with_https_url_rejected(self):
        form = self._with(message='Купуйте тут https://spam.ru/abc')
        self.assertFalse(form.is_valid())

    def test_message_with_http_url_rejected(self):
        form = self._with(message='Заходьте http://evil.com')
        self.assertFalse(form.is_valid())

    def test_message_with_www_rejected(self):
        form = self._with(message='Деталі на www.spam.com')
        self.assertFalse(form.is_valid())

    # --- message з HTML ---

    def test_message_with_html_p_tag_rejected(self):
        form = self._with(message='<p>Spam text</p>')
        self.assertFalse(form.is_valid())

    def test_message_with_html_a_tag_rejected(self):
        form = self._with(message='<a href=https://spam.ru>click</a>')
        self.assertFalse(form.is_valid())

    def test_message_with_html_td_tag_rejected(self):
        form = self._with(message='<td>Fuel Type</td>')
        self.assertFalse(form.is_valid())

    # --- name з посиланнями ---

    def test_name_with_url_rejected(self):
        form = self._with(name='CharlesTef https://spam.ru')
        self.assertFalse(form.is_valid())

    def test_name_with_html_rejected(self):
        form = self._with(name='<script>alert(1)</script>')
        self.assertFalse(form.is_valid())

    # --- валідні дані проходять ---

    def test_clean_message_accepted(self):
        form = self._with(message='Потрібна перевірка на поліграфі, зателефонуйте')
        self.assertTrue(form.is_valid(), form.errors)

    def test_empty_message_accepted(self):
        form = self._with(message='')
        self.assertTrue(form.is_valid(), form.errors)

    def test_normal_name_accepted(self):
        form = self._with(name="Олександр Петренко")
        self.assertTrue(form.is_valid(), form.errors)

    def test_exact_spam_from_report_rejected(self):
        """Точна копія спам-заявки з звернення."""
        spam_msg = (
            '<p>Failure to tax your car can lead to severe penalties.</p>'
            '<a href=https://deroseproject.ru/BkRTcm9NG.html>link</a>'
        )
        form = self._with(name='CharlesTef', message=spam_msg)
        self.assertFalse(form.is_valid())
