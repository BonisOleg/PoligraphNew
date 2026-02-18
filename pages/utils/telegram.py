"""
Утиліта для відправки повідомлень в Telegram.
"""
import os
import logging
import requests
import html

logger = logging.getLogger(__name__)


def send_telegram_message(text: str) -> bool:
    """
    Відправляє повідомлення в Telegram через бота.
    
    Args:
        text: Текст повідомлення для відправки
        
    Returns:
        True якщо повідомлення відправлено успішно, False інакше
    """
    raw_bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    raw_chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    if not raw_bot_token or not raw_chat_id:
        logger.warning('TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID не налаштовані')
        return False

    # Очищення від пробілів та лапок, які можуть потрапити з env
    bot_token = raw_bot_token.strip().replace('"', '').replace("'", "")
    chat_id = raw_chat_id.strip().replace('"', '').replace("'", "")
    
    # Додаткове логування для діагностики (тільки довжина та наявність дефіса)
    logger.info(f"DEBUG: Chat ID length: {len(chat_id)}, starts with '-': {chat_id.startswith('-')}")
    
    # Маскування для логів (показуємо перші 5 та останні 2 символи)
    masked_chat = f"{chat_id[:5]}***{chat_id[-2:]}" if len(chat_id) > 7 else "***"
    logger.info(f"Спроба відправки в Telegram. Chat ID: {masked_chat}")
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        logger.info('Повідомлення успішно відправлено в Telegram')
        return True
    except requests.exceptions.RequestException as e:
        error_msg = f'Помилка відправки повідомлення в Telegram: {e}'
        if hasattr(e, 'response') and e.response is not None:
            error_msg += f' Response: {e.response.text}'
        logger.error(error_msg)
        return False


def format_consultation_message(name: str, contact: str, comment: str = '') -> str:
    """
    Форматує повідомлення для форми консультації.
    
    Args:
        name: Ім'я клієнта
        contact: Контакт (Telegram або телефон)
        comment: Коментар/питання (опціонально)
        
    Returns:
        Відформатований текст повідомлення
    """
    # Екранування HTML тегів у вхідних даних
    safe_name = html.escape(name)
    safe_contact = html.escape(contact)
    
    message = f'<b>Нова заявка на консультацію</b>\n\n'
    message += f'<b>Ім\'я:</b> {safe_name}\n'
    message += f'<b>Контакт:</b> {safe_contact}\n'
    
    if comment:
        safe_comment = html.escape(comment)
        message += f'\n<b>Питання:</b>\n{safe_comment}'
    
    return message


def format_cta_message(name: str, phone: str, email: str, message: str = '') -> str:
    """
    Форматує повідомлення для CTA форми на головній сторінці.
    
    Args:
        name: Ім'я клієнта
        phone: Телефон
        email: Email
        message: Повідомлення (опціонально)
        
    Returns:
        Відформатований текст повідомлення
    """
    # Екранування HTML тегів у вхідних даних
    safe_name = html.escape(name)
    safe_phone = html.escape(phone)
    safe_email = html.escape(email)
    
    text = f'<b>Нова заявка з головної сторінки</b>\n\n'
    text += f'<b>Ім\'я:</b> {safe_name}\n'
    text += f'<b>Телефон:</b> {safe_phone}\n'
    text += f'<b>Email:</b> {safe_email}\n'
    
    if message:
        safe_message = html.escape(message)
        text += f'\n<b>Повідомлення:</b>\n{safe_message}'
    
    return text


def format_infidelity_message(name: str, phone: str) -> str:
    """
    Форматує повідомлення для рекламного лендінгу - перевірка на зраду.
    
    Args:
        name: Ім'я клієнта
        phone: Телефон
        
    Returns:
        Відформатований текст повідомлення
    """
    # Екранування HTML тегів у вхідних даних
    safe_name = html.escape(name)
    safe_phone = html.escape(phone)
    
    text = f'🚨 <b>РЕКЛАМНИЙ ЛЕНДІНГ - Зрада</b> 🚨\n\n'
    text += f'<b>Ім\'я:</b> {safe_name}\n'
    text += f'<b>Телефон:</b> {safe_phone}\n\n'
    text += f'<b>Джерело:</b> /perevirka-na-zradu/'
    
    return text


def format_corporate_message(name: str, phone: str) -> str:
    """
    Форматує повідомлення для корпоративного лендінгу - професійні послуги.
    
    Args:
        name: Ім'я клієнта
        phone: Телефон
        
    Returns:
        Відформатований текст повідомлення
    """
    # Екранування HTML тегів у вхідних даних
    safe_name = html.escape(name)
    safe_phone = html.escape(phone)
    
    text = f'🏢 <b>КОРПОРАТИВНИЙ ЛЕНДІНГ - Послуги</b> 🏢\n\n'
    text += f'<b>Ім\'я:</b> {safe_name}\n'
    text += f'<b>Телефон:</b> {safe_phone}\n\n'
    text += f'<b>Джерело:</b> /korporatyvni-poslugy/'
    
    return text
