import os
import requests
import sys

# Try to load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("Loaded .env file")
except ImportError:
    print("python-dotenv not installed, skipping .env load")

def test_telegram_connection():
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')

    print(f"DEBUG: TELEGRAM_BOT_TOKEN present: {bool(bot_token)}")
    print(f"DEBUG: TELEGRAM_CHAT_ID present: {bool(chat_id)}")

    if not bot_token or not chat_id:
        print("ERROR: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not found in environment variables.")
        return

    url = f'https://api.telegram.org/bot{bot_token}/getMe'
    print(f"Testing bot token with getMe...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        bot_info = response.json()
        print(f"SUCCESS: Bot found: {bot_info.get('result', {}).get('username')}")
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Failed to connect to Telegram API (getMe): {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"Response content: {e.response.text}")
        return

    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    payload = {
        'chat_id': chat_id,
        'text': 'Test message from PoligraphNew diagnostic script',
        'parse_mode': 'HTML',
    }
    
    print(f"Testing sendMessage to chat_id: {chat_id}...")
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        print("SUCCESS: Test message sent successfully!")
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Failed to send message: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"Response content: {e.response.text}")

if __name__ == "__main__":
    test_telegram_connection()
