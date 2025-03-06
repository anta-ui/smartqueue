# Créez un nouveau fichier, par exemple apps/core/middleware/request_validation.py

class InvalidPathMiddleware:
    """Middleware pour bloquer les requêtes avec des chemins problématiques"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        path = request.path_info
        
        # Bloquer les chemins contenant 'undefined' ou 'null' comme segments d'URL
        if '/undefined/' in path or '/null/' in path:
            from django.http import HttpResponseBadRequest
            return HttpResponseBadRequest("Chemin d'URL invalide")
            
        return self.get_response(request)