# apps/core/views/technical.py
from django.utils import timezone
import requests
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models.technical import ApiKey, Webhook  # Assurez-vous que c'est le bon import
from ..serializers.technical import ApiKeySerializer, WebhookSerializer

class ApiKeyViewSet(viewsets.ModelViewSet):
    serializer_class = ApiKeySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ApiKey.objects.all()
        return ApiKey.objects.filter(organization=user.organization)

    def perform_create(self, serializer):
        # Associer automatiquement à l'organisation de l'utilisateur
        organization = self.request.user.organization
        serializer.save(organization=organization)

    @action(detail=False, methods=['post'], url_path='regenerate')
    def regenerate_key(self, request):
        try:
            key_id = request.data.get('key_id')
            api_key = ApiKey.objects.get(id=key_id, organization=request.user.organization)
            
            # Générer une nouvelle clé
            import uuid
            api_key.key = str(uuid.uuid4())
            api_key.save()

            serializer = self.get_serializer(api_key)
            return Response(serializer.data)
        except ApiKey.DoesNotExist:
            return Response(
                {'error': 'Clé API non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

class WebhookViewSet(viewsets.ModelViewSet):
    serializer_class = WebhookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Webhook.objects.all()
        return Webhook.objects.filter(organization=user.organization)

    def perform_create(self, serializer):
        # Associer automatiquement à l'organisation de l'utilisateur
        organization = self.request.user.organization
        serializer.save(organization=organization)

    @action(detail=True, methods=['post'], url_path='test')
    def test_webhook(self, request, pk=None):
        try:
            webhook = self.get_object()
            
            # Simulation d'un test de webhook
            try:
                response = requests.post(webhook.url, json={
                    'test': 'Webhook test',
                    'timestamp': timezone.now().isoformat()
                }, timeout=5)
                
                # Mettre à jour le taux de succès
                webhook.last_triggered_at = timezone.now()
                webhook.success_rate = 100 if response.status_code == 200 else 0
                webhook.save()

                return Response({
                    'status': 'success',
                    'response_code': response.status_code
                })
            except requests.RequestException as e:
                return Response({
                    'status': 'failed',
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        except Webhook.DoesNotExist:
            return Response(
                {'error': 'Webhook non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )