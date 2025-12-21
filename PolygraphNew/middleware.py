"""
Middleware для діагностики та обробки помилок.
"""
import logging
import traceback

logger = logging.getLogger(__name__)


class DiagnosticMiddleware:
    """Middleware для діагностики Host header та помилок"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Логуємо Host header для діагностики ALLOWED_HOSTS
        host = request.get_host()
        logger.info(f'Request Host header: {host}, Path: {request.path}')
        
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            # Логуємо всі необроблені помилки
            logger.error(f'Unhandled exception: {e}')
            logger.error(traceback.format_exc())
            raise


class ErrorLoggingMiddleware:
    """Middleware для логування помилок у відповідях"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Логуємо помилки 500
        if response.status_code == 500:
            logger.error(f'HTTP 500 error for {request.path}')
            logger.error(f'Host: {request.get_host()}')
        
        # Логуємо помилки 400 (ALLOWED_HOSTS)
        if response.status_code == 400:
            logger.warning(f'HTTP 400 error for {request.path}')
            logger.warning(f'Host: {request.get_host()}')
            logger.warning(f'ALLOWED_HOSTS should include: {request.get_host()}')
        
        return response

