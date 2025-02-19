import logging

logger = logging.getLogger(__name__)

class RequestLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        logger.info(f"Requête entrante: {request.method} {request.path}")
        logger.info(f"URLconf matchs: {request.resolver_match}")
        response = self.get_response(request)
        logger.info(f"Status code: {response.status_code}")
        return response