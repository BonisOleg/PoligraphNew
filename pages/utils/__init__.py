"""
Утиліти для pages app.
"""


def get_client_ip(request):
    """
    Отримати IP адресу клієнта з HTTP запиту.
    
    Враховує X-Forwarded-For заголовок для випадків коли запит проходить через proxy/load balancer.
    Це важливо для Render та інших хостингів.
    
    Args:
        request: Django HttpRequest об'єкт
        
    Returns:
        str: IP адреса клієнта або REMOTE_ADDR з request.META
    """
    # Перевіряємо X-Forwarded-For заголовок (для proxy/load balancer)
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Може бути кілька IP адрес, беремо першу
        return x_forwarded_for.split(',')[0].strip()
    
    # Fallback на REMOTE_ADDR
    return request.META.get('REMOTE_ADDR', '')

