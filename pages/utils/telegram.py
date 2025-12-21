"""
Утиліта для відправки повідомлень в Telegram.
"""
import os
import logging
import requests

logger = logging.getLogger(__name__)


def send_telegram_message(text: str) -> bool:
    """
    Відправляє повідомлення в Telegram через бота.
    
    Args:
        text: Текст повідомлення для відправки
        
    Returns:
        True якщо повідомлення відправлено успішно, False інакше
    """
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        logger.warning('TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID не налаштовані')
        return False
    
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
        logger.error(f'Помилка відправки повідомлення в Telegram: {e}')
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
    message = f'<b>Нова заявка на консультацію</b>\n\n'
    message += f'<b>Ім\'я:</b> {name}\n'
    message += f'<b>Контакт:</b> {contact}\n'
    
    if comment:
        message += f'\n<b>Питання:</b>\n{comment}'
    
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
    text = f'<b>Нова заявка з головної сторінки</b>\n\n'
    text += f'<b>Ім\'я:</b> {name}\n'
    text += f'<b>Телефон:</b> {phone}\n'
    text += f'<b>Email:</b> {email}\n'
    
    if message:
        text += f'\n<b>Повідомлення:</b>\n{message}'
    
    return text

