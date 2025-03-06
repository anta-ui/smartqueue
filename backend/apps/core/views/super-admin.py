from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsSuperAdmin
from backend.models import Organization
from backend.serializers import OrganizationSerializer
from apps.core.models import Organization 
class SuperAdminOrganizationGeneralInfoView(APIView):
    permission_classes = [IsSuperAdmin]  # Assurez-vous d'avoir la bonne permission
    
    def get(self, request, organization_id):
        try:
            # Récupérer l'organisation par ID
            organization = Organization.objects.get(id=organization_id)
            # Vous pouvez soit utiliser le même sérialiseur que pour les détails,
            # soit en créer un spécifique pour les informations générales
            serializer = OrganizationSerializer(organization)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {"error": f"Organisation avec ID {organization_id} non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )


class OrganizationTechnicalConfigView(APIView):
    permission_classes = [IsSuperAdmin]  # Assurez-vous que cette permission existe
    
    def get(self, request, pk):
        try:
            # Récupérer l'organisation
            organization = Organization.objects.get(id=pk)
            
            # Données de configuration technique
            # Vous pouvez adapter cela à vos besoins spécifiques
            config = {
                "api_version": "1.0",
                "features_enabled": ["feature1", "feature2"],
                "max_users": 100,
                "custom_domain": True,
                "integration_limits": {
                    "api_calls_per_day": 10000,
                    "webhooks_allowed": 5
                }
            }
            
            return Response(config)
        except Organization.DoesNotExist:
            return Response(
                {"error": f"Organisation avec ID {pk} non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )