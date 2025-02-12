from django.utils.translation import gettext_lazy as _
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models.consent import UserConsent
from ..serializers.consent import (
    UserConsentSerializer,
    UserConsentBulkSerializer
)

class UserConsentListView(generics.ListAPIView):
    """Liste des consentements de l'utilisateur"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserConsentSerializer

    def get_queryset(self):
        return UserConsent.objects.filter(user=self.request.user)


class UserConsentCreateView(generics.CreateAPIView):
    """Création d'un consentement"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserConsentSerializer

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )


class UserConsentBulkUpdateView(generics.GenericAPIView):
    """Mise à jour en masse des consentements"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserConsentBulkSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        consents = serializer.validated_data['consents']
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        for consent_data in consents:
            consent_type = consent_data['consent_type']
            granted = consent_data['granted']

            consent, created = UserConsent.objects.get_or_create(
                user=request.user,
                consent_type=consent_type,
                defaults={
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'granted': granted
                }
            )

            if not created and consent.granted != granted:
                consent.granted = granted
                consent.ip_address = ip_address
                consent.user_agent = user_agent
                consent.save()

        return Response({'status': 'success'})
