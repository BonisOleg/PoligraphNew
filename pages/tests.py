"""
Тести для форм: захист від ботів (honeypot), валідація UA-номера, антиспам.
Покриття: CTAContactForm, ConsultationForm, InfidelityCheckForm, CorporateServicesForm.
"""

from unittest.mock import patch

from django.test import TestCase
from django.http import HttpResponse

from .forms import (
    CTAContactForm,
    ConsultationForm,
    InfidelityCheckForm,
    CorporateServicesForm,
)
from .models import LeadSubmission


# ---------------------------------------------------------------------------
# Shared UA phone validator
# ---------------------------------------------------------------------------

class UAPhoneValidatorTest(TestCase):
    """_validate_ua_phone працює однаково в усіх формах."""

    def _cta(self, phone):
        return CTAContactForm(data={
            'name': 'Тест', 'phone': phone,
            'email': 'a@b.com', 'message': '', 'honeypot': '',
        })

    def _inf(self, phone):
        return InfidelityCheckForm(data={
            'name': 'Тест', 'phone': phone, 'honeypot': '',
        })

    def _corp(self, phone):
        return CorporateServicesForm(data={
            'name': 'Тест', 'phone': phone, 'honeypot': '',
        })

    def test_valid_plus380(self):
        for fn in (self._cta, self._inf, self._corp):
            self.assertTrue(fn('+380671234567').is_valid(), fn.__name__)

    def test_valid_380(self):
        for fn in (self._cta, self._inf, self._corp):
            self.assertTrue(fn('380671234567').is_valid(), fn.__name__)

    def test_valid_zero_prefix(self):
        for fn in (self._cta, self._inf, self._corp):
            self.assertTrue(fn('0671234567').is_valid(), fn.__name__)

    def test_valid_with_formatting(self):
        for fn in (self._cta, self._inf, self._corp):
            self.assertTrue(fn('+38(067)123-45-67').is_valid(), fn.__name__)

    def test_invalid_russian(self):
        for fn in (self._cta, self._inf, self._corp):
            self.assertFalse(fn('+79161234567').is_valid(), fn.__name__)

    def test_invalid_short(self):
        for fn in (self._cta, self._inf, self._corp):
            self.assertFalse(fn('067123').is_valid(), fn.__name__)

    def test_invalid_empty(self):
        for fn in (self._cta, self._inf, self._corp):
            self.assertFalse(fn('').is_valid(), fn.__name__)

    def test_invalid_letters(self):
        for fn in (self._cta, self._inf, self._corp):
            self.assertFalse(fn('abcdef').is_valid(), fn.__name__)


# ---------------------------------------------------------------------------
# Spam content validator
# ---------------------------------------------------------------------------

class SpamContentValidatorTest(TestCase):
    """_validate_no_spam працює на name/message/contact."""

    VALID_CTA = {
        'name': 'Юлія', 'phone': '+380671234567',
        'email': 'a@b.com', 'message': '', 'honeypot': '',
    }

    VALID_CONSULT = {
        'name': 'Юлія', 'contact': '+380671234567',
        'comment': '', 'consent': True, 'honeypot': '',
    }

    def test_cta_url_in_message_rejected(self):
        d = {**self.VALID_CTA, 'message': 'visit https://spam.ru'}
        self.assertFalse(CTAContactForm(data=d).is_valid())

    def test_cta_html_in_name_rejected(self):
        d = {**self.VALID_CTA, 'name': '<script>alert(1)</script>'}
        self.assertFalse(CTAContactForm(data=d).is_valid())

    def test_cta_clean_text_accepted(self):
        d = {**self.VALID_CTA, 'message': 'Потрібна консультація'}
        self.assertTrue(CTAContactForm(data=d).is_valid())

    def test_consultation_url_in_contact_rejected(self):
        d = {**self.VALID_CONSULT, 'contact': 'http://evil.com'}
        self.assertFalse(ConsultationForm(data=d).is_valid())

    def test_consultation_html_in_comment_rejected(self):
        d = {**self.VALID_CONSULT, 'comment': '<a href="x">link</a>'}
        self.assertFalse(ConsultationForm(data=d).is_valid())

    def test_consultation_clean_accepted(self):
        self.assertTrue(ConsultationForm(data=self.VALID_CONSULT).is_valid())

    def test_infidelity_url_in_name_rejected(self):
        d = {'name': 'Bot https://x.ru', 'phone': '+380671234567', 'honeypot': ''}
        self.assertFalse(InfidelityCheckForm(data=d).is_valid())

    def test_corporate_html_in_name_rejected(self):
        d = {'name': '<td>spam</td>', 'phone': '+380671234567', 'honeypot': ''}
        self.assertFalse(CorporateServicesForm(data=d).is_valid())


# ---------------------------------------------------------------------------
# Honeypot — form level
# ---------------------------------------------------------------------------

class HoneypotFormTest(TestCase):
    """Honeypot: форма valid при заповненому honeypot (catch у view)."""

    def test_cta_honeypot_valid(self):
        form = CTAContactForm(data={
            'name': 'Bot', 'phone': '+380671234567',
            'email': 'b@b.com', 'message': '', 'honeypot': 'spam',
        })
        self.assertTrue(form.is_valid())

    def test_consultation_honeypot_valid(self):
        form = ConsultationForm(data={
            'name': 'Bot', 'contact': 'tg', 'comment': '',
            'consent': True, 'honeypot': 'spam',
        })
        self.assertTrue(form.is_valid())

    def test_infidelity_honeypot_valid(self):
        form = InfidelityCheckForm(data={
            'name': 'Bot', 'phone': '+380671234567', 'honeypot': 'spam',
        })
        self.assertTrue(form.is_valid())

    def test_corporate_honeypot_valid(self):
        form = CorporateServicesForm(data={
            'name': 'Bot', 'phone': '+380671234567', 'honeypot': 'spam',
        })
        self.assertTrue(form.is_valid())


# ---------------------------------------------------------------------------
# CTA view — integration
# ---------------------------------------------------------------------------

class IndexViewCTAPostTest(TestCase):
    """POST на головну: реальні заявки та боти."""

    VALID_POST = {
        'name': 'Юлія Тест', 'phone': '+380671234567',
        'email': 'yulia@example.com', 'message': 'Консультація',
        'honeypot': '',
    }

    @patch('pages.views.send_telegram_message', return_value=True)
    def test_valid_returns_200(self, _m):
        resp = self.client.post('/', data=self.VALID_POST, HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 200)

    @patch('pages.views.send_telegram_message', return_value=True)
    def test_valid_saves_to_db(self, _m):
        self.client.post('/', data=self.VALID_POST, HTTP_HX_REQUEST='true')
        self.assertEqual(LeadSubmission.objects.filter(form_type='cta').count(), 1)

    @patch('pages.views.send_telegram_message')
    def test_honeypot_not_saved(self, mock_tg):
        d = {**self.VALID_POST, 'honeypot': 'bot'}
        resp = self.client.post('/', data=d, HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(LeadSubmission.objects.count(), 0)
        mock_tg.assert_not_called()

    def test_invalid_phone_422(self):
        d = {**self.VALID_POST, 'phone': '+79161234567'}
        resp = self.client.post('/', data=d, HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 422)

    def test_spam_message_422(self):
        d = {**self.VALID_POST, 'message': '<a href="https://spam.ru">x</a>'}
        resp = self.client.post('/', data=d, HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 422)

    def test_get_returns_200(self):
        self.assertEqual(self.client.get('/').status_code, 200)


# ---------------------------------------------------------------------------
# Consultation view — integration
# ---------------------------------------------------------------------------

class ConsultationViewPostTest(TestCase):
    """POST на /consultation/: реальні заявки та боти."""

    URL = '/consultation/'
    VALID_POST = {
        'name': 'Марія', 'contact': '@maria_tg',
        'comment': '', 'consent': 'on', 'honeypot': '',
    }

    @patch('pages.views.send_telegram_message', return_value=True)
    def test_valid_returns_200(self, _m):
        resp = self.client.post(self.URL, data=self.VALID_POST,
                                HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'footer__form-success', resp.content)

    @patch('pages.views.send_telegram_message', return_value=True)
    def test_valid_saves_to_db(self, _m):
        self.client.post(self.URL, data=self.VALID_POST,
                         HTTP_HX_REQUEST='true')
        self.assertEqual(LeadSubmission.objects.filter(form_type='consultation').count(), 1)

    @patch('pages.views.send_telegram_message')
    def test_honeypot_silent_success(self, mock_tg):
        d = {**self.VALID_POST, 'honeypot': 'bot'}
        resp = self.client.post(self.URL, data=d, HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(LeadSubmission.objects.count(), 0)
        mock_tg.assert_not_called()

    def test_spam_contact_422(self):
        d = {**self.VALID_POST, 'contact': 'https://evil.com'}
        resp = self.client.post(self.URL, data=d, HTTP_HX_REQUEST='true')
        self.assertEqual(resp.status_code, 422)

    def test_get_returns_405(self):
        self.assertEqual(self.client.get(self.URL).status_code, 405)
