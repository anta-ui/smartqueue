class URLValidationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        
        # Vérifier si l'URL contient des segments problématiques
        problematic_segments = ['undefined', 'null', 'NaN']
        for segment in path.split('/'):
            if segment in problematic_segments:
                from django.http import HttpResponseBadRequest
                return HttpResponseBadRequest(f"Paramètre d'URL invalide: {segment}")
        
        return self.get_response(request)