# apps/core/middleware/audit.py
from django.utils import timezone
from ..models.super_admin import SystemAuditLog

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Enregistrer les actions importantes dans le journal d'audit
        if request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.user_type == 'admin'
        ):
            if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
                self._log_action(request, response)
                
        return response
    
    def _log_action(self, request, response):
        # Déterminer le type d'action
        if request.method == 'POST':
            action = SystemAuditLog.ActionType.CREATE
        elif request.method in ['PUT', 'PATCH']:
            action = SystemAuditLog.ActionType.UPDATE
        elif request.method == 'DELETE':
            action = SystemAuditLog.ActionType.DELETE
        else:
            return
        
        # Extraire les informations sur l'entité à partir de l'URL
        entity_type = self._extract_entity_type(request.path)
        entity_id = self._extract_entity_id(request.path)
        
        # Créer l'entrée de journal
        try:
            SystemAuditLog.objects.create(
                user=request.user,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                details=request.data if hasattr(request, 'data') else None,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                organization=getattr(request.user, 'organization', None)
            )
        except Exception as e:
            # Gérer silencieusement les erreurs pour éviter que le middleware ne perturbe l'application
            print(f"Erreur lors de la journalisation d'audit: {e}")
    
    def _extract_entity_type(self, path):
        # Logique pour extraire le type d'entité de l'URL
        # Exemple : '/api/organizations/1/' -> 'Organization'
        parts = path.strip('/').split('/')
        if len(parts) >= 2:
            # Convertir en singulier et en majuscule
            entity = parts[-2]
            if entity.endswith('s'):
                entity = entity[:-1]
            return entity.capitalize()
        return 'Unknown'
    
    def _extract_entity_id(self, path):
        # Logique pour extraire l'ID de l'entité de l'URL
        # Exemple : '/api/organizations/1/' -> '1'
        parts = path.strip('/').split('/')
        if len(parts) >= 3 and parts[-1].isdigit():
            return parts[-1]
        return None