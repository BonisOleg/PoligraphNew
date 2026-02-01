"""
Views для сторінок сайту.
Кожен view перевіряє HX-Request header для підтримки HTMX навігації.
"""

import logging
import traceback
import json
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseServerError, JsonResponse
from django.utils import timezone
from .forms import ConsultationForm, CTAContactForm, InfidelityCheckForm, CorporateServicesForm
from .models import LeadSubmission
from .utils import get_client_ip
from .utils.telegram import (
    send_telegram_message,
    format_consultation_message,
    format_cta_message,
    format_infidelity_message,
    format_corporate_message,
)

logger = logging.getLogger(__name__)


def index_view(request):
    """Ознайомча сторінка"""
    try:
        context = {
            'title': 'Головна',
            'hero_title': 'Поліграф - Професійна перевірка на детекторі брехні',
            'hero_description': 'Сертифікований поліграфолог з багаторічним досвідом. Сучасне обладнання та науковий підхід.',
            'features': [
                {
                    'title': 'Професіоналізм',
                    'description': 'Досвід роботи понад 10 років',
                },
                {
                    'title': 'Сучасне обладнання',
                    'description': 'Новітні поліграфи світового стандарту',
                },
                {
                    'title': 'Конфіденційність',
                    'description': 'Повна анонімність та захист даних',
                },
            ],
        }
        
        # Обробка POST запиту від CTA форми
        if request.method == 'POST':
            form = CTAContactForm(request.POST)
            
            if form.is_valid():
                name = form.cleaned_data['name']
                phone = form.cleaned_data['phone']
                email = form.cleaned_data['email']
                message = form.cleaned_data.get('message', '')
                
                # Створюємо запис у БД
                lead = LeadSubmission.objects.create(
                    form_type='cta',
                    name=name,
                    phone=phone,
                    email=email,
                    message=message,
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                )
                
                # Форматуємо та відправляємо повідомлення в Telegram
                telegram_text = format_cta_message(name, phone, email, message)
                telegram_sent = send_telegram_message(telegram_text)
                
                if telegram_sent:
                    lead.telegram_sent = True
                    lead.telegram_sent_at = timezone.now()
                    lead.save()
                    logger.info(f'CTA форма отримана і відправлена в Telegram: {name}, {phone}, {email}')
                else:
                    logger.warning(f'Не вдалося відправити CTA форму в Telegram: {name}, {phone}, {email}')
                
                # Повертаємо успішне повідомлення (незалежно від результату Telegram)
                success_html = '''
                <div class="cta__form-success">
                    <strong>Дякуємо!</strong> Ваша заявка прийнята. Ми зв'яжемося з вами найближчим часом.
                </div>
                '''
                return HttpResponse(success_html, status=200)
            else:
                # Повертаємо помилки валідації
                errors_html = '<div class="cta__form-errors">'
                for field, errors in form.errors.items():
                    for error in errors:
                        errors_html += f'<p>{error}</p>'
                errors_html += '</div>'
                return HttpResponse(errors_html, status=422)
        
        # Перевірка HTMX запиту для навігації
        if request.headers.get('HX-Request'):
            return render(request, 'partials/index_content.html', context)
        
        return render(request, 'index.html', context)
    except Exception as e:
        logger.error(f'Error in index_view: {e}')
        logger.error(traceback.format_exc())
        # Повертаємо просту помилку замість 500
        return HttpResponseServerError(f'Server error: {str(e)}')


def about_view(request):
    """Сторінка про нас з 3 акордеон-блоками: Послуги, Поліграфолог, Обладнання"""
    try:
        context = {
        'title': 'Про нас',
        
        # БЛОК 1: Послуги
        'services_stats': [
            {'number': '150+', 'label': 'успішних перевірок'},
            {'number': '98%', 'label': 'точність результатів'},
            {'number': '100%', 'label': 'конфіденційність'},
        ],
        'services_list': [
            {
                'title': 'Перевірка подружжя на зраду',
                'price': '5000 грн',
                'discount': 'Знижка 50% на другого',
                'features': ['Конфіденційність 100%', 'Детальний звіт', 'Психологічна підтримка'],
            },
            {
                'title': 'Скринінг при працевлаштуванні',
                'price': '2500/4000 грн',
                'discount': '',
                'features': ['Базова - 2500 грн', 'Розширений - 4000 грн', 'Перевірка резюме'],
            },
            {
                'title': 'Перевірка діючого персоналу',
                'price': '2500/4000 грн',
                'discount': '',
                'features': ['Планові перевірки', 'Розслідування порушень', 'Захист від шахрайства'],
            },
            {
                'title': 'Приватні питання',
                'price': '5000 грн',
                'discount': '',
                'features': ['Повна конфіденційність', 'Індивідуальний підхід', 'Підтримка експерта'],
            },
            {
                'title': 'Розслідування крадіжок',
                'price': '5000 грн',
                'discount': '',
                'features': ['Швидке розслідування', 'Збір доказів', 'Співпраця з правоохоронцями'],
            },
            {
                'title': 'Пошуки матеріальних доказів',
                'price': '5000 грн',
                'discount': 'Знижка військовим 10%',
                'features': ['Юридична цінність', 'Експертні висновки', 'Підготовка до суду'],
            },
        ],
        'services_advantages': [
            {'title': 'Сертифікація', 'text': 'Офіційний член НАП України'},
            {'title': 'Сучасне обладнання', 'text': 'Поліграфи Rubicon з максимальною точністю'},
            {'title': 'Конфіденційність', 'text': 'Повна анонімність та захист даних'},
            {'title': 'Швидкий результат', 'text': 'Детальний звіт протягом 24 годин'},
            {'title': 'Висока точність', 'text': '98% точність результатів'},
            {'title': 'Виїзд до клієнта', 'text': 'Перевірки в зручному для вас місці'},
        ],
        
        # БЛОК 2: Поліграфолог
        'polygraphologist': {
            'name': 'Керезвас Юліана Георгіївна',
            'description': 'Керівниця представництва Національної асоціації поліграфологів України у Львівській області. Юрист-магістр з відзнакою, магістр з публічного управління.',
        },
        'about_stats': [
            {'number': '150+', 'label': 'проведених перевірок'},
            {'number': '98%', 'label': 'точність результатів'},
            {'number': '100%', 'label': 'конфіденційність'},
            {'number': '2', 'label': 'дипломи магістра'},
        ],
        'education': [
            {
                'year': '2014',
                'institution': 'Національний юридичний університет імені Ярослава Мудрого',
                'program': 'Правознавство',
                'degree': 'Диплом магістра з відзнакою',
            },
            {
                'year': '2020',
                'institution': 'Національна академія державного управління при Президентові України',
                'program': 'Публічне управління та адміністрування',
                'degree': 'Диплом магістра',
            },
            {
                'year': '2025',
                'institution': 'ДНП Державний університет «Київський авіаційний інститут»',
                'program': 'Проведення досліджень та експертиз із використанням поліграфа',
                'degree': 'Курси підвищення кваліфікації',
            },
            {
                'year': '2025',
                'institution': 'Національна асоціація поліграфологів України',
                'program': 'Керівниця представництва НАПУ у Львівській області',
                'degree': 'Офіційне представництво в регіоні',
            },
        ],
        'process_steps': [
            {
                'number': '01',
                'title': 'Попередня консультація',
                'description': 'Безкоштовно обговорюємо вашу ситуацію, пояснюю процедуру, відповідаю на всі питання.',
            },
            {
                'number': '02',
                'title': 'Підготовка до тестування',
                'description': 'Складаємо перелік питань, пояснюю принципи роботи поліграфа, створюю комфортні умови.',
            },
            {
                'number': '03',
                'title': 'Проведення тестування',
                'description': 'Використовую сучасне обладнання Rubicon. Тривалість 1-2 години. Можливість відеофіксації.',
            },
            {
                'number': '04',
                'title': 'Аналіз та звіт',
                'description': 'Детальний аналіз результатів, підготовка письмового висновку з рекомендаціями.',
            },
        ],
        'principles': [
            {
                'title': 'Незалежність',
                'description': 'Об\'єктивність та неупередженість у будь-якій справі.',
            },
            {
                'title': 'Етичність',
                'description': 'Дотримуюся найвищих етичних стандартів професії.',
            },
            {
                'title': 'Науковий підхід',
                'description': 'Використовую лише перевірені методики та сучасне обладнання.',
            },
        ],
        
        # БЛОК 3: Обладнання
        'equipment_hero': {
            'badge': 'Офіційний дилер в Україні',
            'title': 'Поліграф РУБІКОН',
            'subtitle': 'Професійний поліграф',
            'description': 'Сучасний український поліграф від офіційного дилера з надійними комплектуючими. Перевірені технології детекції брехні з точністю 95-98% та повною сертифікацією в Україні.',
        },
        'equipment_stats': [
            {'number': '95-98%', 'label': 'точність'},
            {'number': '7', 'label': 'каналів'},
            {'number': '3', 'label': 'роки гарантії'},
        ],
        'equipment_comparison': [
            {'characteristic': 'Точність', 'rubicon': '95-98%', 'others': '85-92%'},
            {'characteristic': 'Кількість каналів', 'rubicon': '7', 'others': '4-5'},
            {'characteristic': 'Швидкість обробки', 'rubicon': 'Реальний час', 'others': '2-5 хв'},
            {'characteristic': 'Гарантія', 'rubicon': 'До 3 років', 'others': '1 рік'},
        ],
        'equipment_certification': [
            {
                'title': 'APA Standards',
                'description': 'Відповідає стандартам Американської Асоціації Поліграфологів',
            },
            {
                'title': 'Сертифікат України',
                'description': 'Офіційно дозволено для використання в Україні',
            },
            {
                'title': 'ISO 9001',
                'description': 'Міжнародний стандарт якості виробництва',
            },
            {
                'title': 'Сертифікований дилер',
                'description': 'Офіційне дилерство та технічна підтримка в Україні',
            },
        ],
    }
    
        # Перевірка HTMX запиту
        if request.headers.get('HX-Request'):
            return render(request, 'partials/about_content.html', context)
        
        return render(request, 'about.html', context)
    except Exception as e:
        logger.error(f'Error in about_view: {e}')
        logger.error(traceback.format_exc())
        return HttpResponseServerError(f'Server error: {str(e)}')


def contacts_view(request):
    """Сторінка контактів з контактною інформацією та Google картою (sticky overlay)"""
    try:
        context = {
        'title': 'Контакти',
        
        # Контактна інформація
        'contacts': {
            'phone': '+38 (067) 524-33-54',
            'whatsapp': '+38 (067) 524-33-54',
            'email': 'ulianakerezvas@gmail.com',
            'address': 'Львів, Україна',
            'travel': 'Виїзд до клієнта по всій Україні',
            'working_hours': 'Пн-Пт: 9:00-18:00, Сб: 10:00-15:00',
        },
        
        # Google карта
        'map': {
            'address': 'Львів, Україна',
            'lat': 49.8397,
            'lng': 24.0297,
        },
        
        # Сертифікати
        'certificates': [
            'Сертифікат поліграфолога міжнародного зразка (APA)',
            'Ліцензія на проведення поліграфних досліджень',
            'Сертифікат Lafayette Instrument Company',
            'Сертифікат підвищення кваліфікації (2024)',
        ],
    }
    
        # Перевірка HTMX запиту
        if request.headers.get('HX-Request'):
            return render(request, 'partials/contacts_content.html', context)
        
        return render(request, 'contacts.html', context)
    except Exception as e:
        logger.error(f'Error in contacts_view: {e}')
        logger.error(traceback.format_exc())
        return HttpResponseServerError(f'Server error: {str(e)}')


def consultation_view(request):
    """Обробка форми консультації з footer"""
    if request.method != 'POST':
        return HttpResponse('Method not allowed', status=405)
    
    form = ConsultationForm(request.POST)
    
    if form.is_valid():
        name = form.cleaned_data['name']
        contact = form.cleaned_data['contact']
        comment = form.cleaned_data.get('comment', '')
        
        # Створюємо запис у БД
        lead = LeadSubmission.objects.create(
            form_type='consultation',
            name=name,
            contact=contact,
            message=comment,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
        )
        
        # Форматуємо та відправляємо повідомлення в Telegram
        telegram_text = format_consultation_message(name, contact, comment)
        telegram_sent = send_telegram_message(telegram_text)
        
        if telegram_sent:
            lead.telegram_sent = True
            lead.telegram_sent_at = timezone.now()
            lead.save()
            logger.info(f'Консультація отримана і відправлена в Telegram: {name}, {contact}')
        else:
            logger.warning(f'Не вдалося відправити консультацію в Telegram: {name}, {contact}')
        
        # Повертаємо успішне повідомлення (незалежно від результату Telegram)
        success_html = '''
        <div class="footer__form-success">
            <strong>Дякуємо!</strong> Ваша заявка прийнята. Ми зв'яжемося з вами найближчим часом.
        </div>
        '''
        return HttpResponse(success_html, status=200)
    else:
        # Повертаємо помилки валідації
        errors_html = '<div class="footer__form-errors">'
        for field, errors in form.errors.items():
            for error in errors:
                errors_html += f'<p>{error}</p>'
        errors_html += '</div>'
        return HttpResponse(errors_html, status=422)


def legal_document_view(request, slug):
    """Універсальний view для правових документів (заглушки)"""
    try:
        # Мапінг slug → назва документа
        documents = {
            'public-offer': 'Публічна оферта',
            'privacy-policy': 'Політика конфіденційності',
            'cookie-policy': 'Політика використання cookies',
            'consent-pd': 'Згода на обробку персональних даних',
            'disclaimer': 'Відмова від відповідальності',
        }
        
        document_title = documents.get(slug, 'Правовий документ')
        
        context = {
            'title': document_title,
            'document_title': document_title,
            'slug': slug,
        }
        
        # Перевірка HTMX запиту
        if request.headers.get('HX-Request'):
            return render(request, 'partials/legal_document.html', context)
        
        return render(request, 'legal_document.html', context)
    except Exception as e:
        logger.error(f'Error in legal_document_view: {e}')
        logger.error(traceback.format_exc())
        return HttpResponseServerError(f'Server error: {str(e)}')


def health_check(request):
    """Простий health check для Render"""
    from django.http import JsonResponse
    return JsonResponse({'status': 'ok'}, status=200)


def favicon_view(request):
    """Редірект на іконку або порожня відповідь"""
    from django.http import HttpResponseRedirect
    return HttpResponseRedirect('/static/img/poli.png')


def robots_txt(request):
    """Повертає 404 для robots.txt (немає файлу)"""
    from django.http import HttpResponseNotFound
    return HttpResponseNotFound()


def sw_js(request):
    """Повертає 404 для sw.js (немає service worker)"""
    from django.http import HttpResponseNotFound
    return HttpResponseNotFound()


def infidelity_landing_view(request):
    """Рекламний лендінг - перевірка на зраду"""
    try:
        context = {
            'title': 'Перевірка на зраду | Детектор брехні Львів',
            'phone': '+38 (067) 524-33-54',
            'specialist_name': 'Керезвас Юліана Георгіївна',
            'specialist_title': 'Керівниця представництва Національної асоціації поліграфологів України у Львівській області',
        }
        return render(request, 'infidelity_landing.html', context)
    except Exception as e:
        logger.error(f'Error in infidelity_landing_view: {e}')
        logger.error(traceback.format_exc())
        return HttpResponseServerError(f'Server error: {str(e)}')


def infidelity_form_submit(request):
    """Обробка форми з рекламного лендінгу - перевірка на зраду"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    try:
        form = InfidelityCheckForm(request.POST)
        
        if form.is_valid():
            name = form.cleaned_data['name']
            phone = form.cleaned_data['phone']
            
            # Створюємо запис у БД
            lead = LeadSubmission.objects.create(
                form_type='infidelity',
                name=name,
                phone=phone,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            )
            
            # Форматуємо та відправляємо повідомлення в Telegram
            telegram_text = format_infidelity_message(name, phone)
            telegram_sent = send_telegram_message(telegram_text)
            
            if telegram_sent:
                lead.telegram_sent = True
                lead.telegram_sent_at = timezone.now()
                lead.save()
                logger.info(f'Заявка з лендінгу зради отримана і відправлена в Telegram: {name}, {phone}')
            else:
                logger.warning(f'Не вдалося відправити заявку з лендінгу в Telegram: {name}, {phone}')
            
            # Повертаємо успішне повідомлення (незалежно від результату Telegram)
            return JsonResponse({'success': True, 'message': 'Заявку отримано!'}, status=200)
        else:
            # Повертаємо помилки валідації
            errors = {}
            for field, field_errors in form.errors.items():
                if field != 'honeypot':
                    errors[field] = field_errors[0] if field_errors else 'Помилка валідації'
            
            return JsonResponse({'success': False, 'errors': errors}, status=422)
    
    except Exception as e:
        logger.error(f'Error in infidelity_form_submit: {e}')
        logger.error(traceback.format_exc())
        return JsonResponse({'success': False, 'error': 'Server error'}, status=500)


def corporate_landing_view(request):
    """Корпоративний лендінг - професійні послуги"""
    try:
        context = {
            'title': 'Поліграф Львів - Корпоративні послуги | Професійна перевірка',
            'phone': '+38 (067) 524-33-54',
            'specialist_name': 'Керезвас Юліана Георгіївна',
            'specialist_title': 'Поліграфолог, керівник представництва НАПУ',
        }
        return render(request, 'corporate_landing.html', context)
    except Exception as e:
        logger.error(f'Error in corporate_landing_view: {e}')
        logger.error(traceback.format_exc())
        return HttpResponseServerError(f'Server error: {str(e)}')


def corporate_form_submit(request):
    """Обробка форми з корпоративного лендінгу"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    try:
        form = CorporateServicesForm(request.POST)
        
        if form.is_valid():
            name = form.cleaned_data['name']
            phone = form.cleaned_data['phone']
            
            # Створюємо запис у БД
            lead = LeadSubmission.objects.create(
                form_type='corporate',
                name=name,
                phone=phone,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            )
            
            # Форматуємо та відправляємо повідомлення в Telegram
            telegram_text = format_corporate_message(name, phone)
            telegram_sent = send_telegram_message(telegram_text)
            
            if telegram_sent:
                lead.telegram_sent = True
                lead.telegram_sent_at = timezone.now()
                lead.save()
                logger.info(f'Заявка з корпоративного лендінгу отримана і відправлена в Telegram: {name}, {phone}')
            else:
                logger.warning(f'Не вдалося відправити корпоративну заявку в Telegram: {name}, {phone}')
            
            # Повертаємо успішне повідомлення (незалежно від результату Telegram)
            return JsonResponse({'success': True, 'message': 'Дякуємо! Ваша заявка успішно відправлена.'}, status=200)
        else:
            # Повертаємо помилки валідації
            errors = {}
            for field, field_errors in form.errors.items():
                if field != 'honeypot':
                    errors[field] = field_errors[0] if field_errors else 'Помилка валідації'
            
            return JsonResponse({'success': False, 'errors': errors}, status=422)
    
    except Exception as e:
        logger.error(f'Error in corporate_form_submit: {e}')
        logger.error(traceback.format_exc())
        return JsonResponse({'success': False, 'error': 'Server error'}, status=500)


def corporate_thanks_view(request):
    """Thank You сторінка після відправки форми з корпоративного лендінгу (для Google Analytics)."""
    try:
        context = {
            'title': 'Дякуємо за заявку | Поліграф Львів - Корпоративні послуги',
            'phone': '+38 (067) 524-33-54',
            'specialist_name': 'Керезвас Юліана Георгіївна',
            'specialist_title': 'Поліграфолог, керівник представництва НАПУ',
        }
        return render(request, 'corporate_thanks.html', context)
    except Exception as e:
        logger.error(f'Error in corporate_thanks_view: {e}')
        logger.error(traceback.format_exc())
        return HttpResponseServerError(f'Server error: {str(e)}')


def infidelity_thanks_view(request):
    """Thank You сторінка після відправки форми з лендінгу перевірки на зраду (для Google Analytics)."""
    try:
        context = {
            'title': 'Дякуємо за заявку | Перевірка на зраду | Детектор брехні Львів',
            'phone': '+38 (067) 524-33-54',
            'specialist_name': 'Керезвас Юліана Георгіївна',
            'specialist_title': 'Керівниця представництва Національної асоціації поліграфологів України у Львівській області',
        }
        return render(request, 'infidelity_thanks.html', context)
    except Exception as e:
        logger.error(f'Error in infidelity_thanks_view: {e}')
        logger.error(traceback.format_exc())
        return HttpResponseServerError(f'Server error: {str(e)}')

