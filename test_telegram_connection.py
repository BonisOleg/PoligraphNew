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

def get_chat_id_updates():
    """Helper to find chat ID by checking bot updates"""
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        print("Error: TELEGRAM_BOT_TOKEN not set")
        return

    url = f'https://api.telegram.org/bot{bot_token}/getUpdates'
    print(f"\n--- Checking for recent messages to find Chat ID ---")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if not data.get('result'):
            print("No recent updates found. Send a message to the bot and run this script again.")
            return

        print("Found recent chats:")
        seen_chats = set()
        for update in data['result']:
            if 'message' in update and 'chat' in update['message']:
                chat = update['message']['chat']
                chat_id = chat['id']
                chat_type = chat['type']
                chat_title = chat.get('title', chat.get('username', 'Unknown'))
                
                if chat_id not in seen_chats:
                    print(f"ID: {chat_id} | Type: {chat_type} | Name: {chat_title}")
                    seen_chats.add(chat_id)
                    
    except Exception as e:
        print(f"Error getting updates: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == '--find-id':
        get_chat_id_updates()
    else:
        test_telegram_connection()
