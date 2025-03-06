from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models.branch import OrganizationBranch
from ..models.organization import Organization
from ..serializers.organization_branch import OrganizationBranchSerializer
from ..permissions import IsOrganizationMember
import rest_framework.serializers as serializers

class OrganizationBranchViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationBranchSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.organization:
            raise serializers.ValidationError({"organization": "Aucune organisation n'est associée à cet utilisateur."})
        serializer.validated_data['organization'] = user.organization
        serializer.save()

    def get_queryset(self):
        user = self.request.user
        
        # Pour les requêtes avec le paramètre 'organization'
        organization_id = self.request.query_params.get('organization')
        
        if user.is_superuser:
            if organization_id:
                return OrganizationBranch.objects.filter(organization_id=organization_id)
            return OrganizationBranch.objects.all()
        
        # Pour les utilisateurs non-superutilisateurs
        return OrganizationBranch.objects.filter(organization=user.organization)

    @action(detail=False, methods=['get'], url_path='by-organization/(?P<org_id>[^/.]+)')
    def list_by_organization(self, request, org_id=None):
        """
        Liste les branches pour une organisation spécifique
        """
        # Gestion du cas 'new'
        if org_id == 'new':
            return Response([], status=status.HTTP_200_OK)
        
        try:
            organization = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier les permissions
        if not request.user.is_superuser and request.user.organization != organization:
            return Response(
                {"detail": "Vous n'avez pas la permission de voir ces branches"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        branches = OrganizationBranch.objects.filter(organization=organization)
        serializer = self.get_serializer(branches, many=True)
        return Response(serializer.data)
    