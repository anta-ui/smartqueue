# apps/core/views/organization.py

from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import serializers
from ..models.organization import Organization
from ..serializers.organization import (
    OrganizationSerializer,
    OrganizationMemberSerializer,
    OrganizationAddMemberSerializer,
    OrganizationRemoveMemberSerializer
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from ..authentication import CustomSessionAuthentication
import logging  # Ajoutez cet import

# Configurez le logger
logger = logging.getLogger(__name__)

User = get_user_model()

class OrganizationViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication, CustomSessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        print("Action:", self.action)
        print("User:", self.request.user)
        print("Organization ID:", self.kwargs.get('pk'))
        
        # Si l'action est 'retrieve' et l'ID est 'new', renvoyer un queryset vide
        if self.action == 'retrieve' and self.kwargs.get('pk') == 'new':
            return Organization.objects.none()
        
        if self.action == 'list':
            return Organization.objects.filter(created_by=self.request.user)
        
        return Organization.objects.filter(
            id=self.kwargs.get('pk'),
            created_by=self.request.user
        )

    def retrieve(self, request, *args, **kwargs):
        # Gestion spéciale pour 'new'
        if kwargs.get('pk') == 'new':
            # Renvoyer une réponse vide ou avec des valeurs par défaut
            return Response({
                'id': 'new',
                'name': '',
                'status': 'active',
                'plan': 'standard'
            }, status=status.HTTP_200_OK)
        
        return super().retrieve(request, *args, **kwargs)
    def perform_create(self, serializer):
        """Crée une nouvelle organisation et l'assigne à l'utilisateur"""
        organization = serializer.save(created_by=self.request.user)
        self.request.user.organization = organization
        self.request.user.save()
    def update(self, request, *args, **kwargs):
        print("Données reçues dans la requête:", request.data)
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print("Erreur de mise à jour:", str(e))
            raise

    def perform_update(self, serializer):
        try:
            print("Données validées:", serializer.validated_data)
            serializer.save()
        except Exception as e:
            print("Erreur lors de la sauvegarde:", str(e))
            raise
    
    def perform_destroy(self, instance):
        try:
            # Log de la tentative de suppression
            logger.info(f"Tentative de suppression de l'organisation {instance.id}")

            # Dissocier les utilisateurs de l'organisation
            User.objects.filter(organization=instance).update(organization=None)

            # Suppression des ressources liées (gestion sécurisée)
            try:
                # Vérifier dynamiquement l'existence du modèle ReportTemplate
                from django.apps import apps
                
                try:
                    ReportTemplate = apps.get_model('reporting', 'ReportTemplate')
                    # Supprimer les templates de rapport si le modèle existe
                    ReportTemplate.objects.filter(organization=instance).delete()
                except LookupError:
                    # Le modèle n'existe pas, on log simplement
                    logger.warning("Modèle ReportTemplate non trouvé")
                
            except Exception as resource_error:
                logger.error(f"Erreur lors de la suppression des ressources : {resource_error}")
                # On continue malgré l'erreur

            # Suppression finale de l'organisation
            instance.delete()
            
            logger.info(f"Organisation {instance.id} supprimée avec succès")

        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'organisation : {e}")
            raise serializers.ValidationError({
                "detail": f"Impossible de supprimer l'organisation : {str(e)}"
            })
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Liste les membres d'une organisation"""
        organization = self.get_object()
        members = User.objects.filter(organization=organization)
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Ajoute un membre à l'organisation"""
        organization = self.get_object()
        serializer = OrganizationAddMemberSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user_type = serializer.validated_data['user_type']
            
            try:
                user = User.objects.get(email=email)
                if user.organization:
                    raise serializers.ValidationError(
                        'User already belongs to an organization'
                    )
                user.organization = organization
                user.user_type = user_type
                user.save()
                return Response({
                    'status': 'success',
                    'message': 'Member added successfully'
                })
            except User.DoesNotExist:
                raise serializers.ValidationError('User not found')
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Retire un membre de l'organisation"""
        organization = self.get_object()
        serializer = OrganizationRemoveMemberSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(
                    email=email,
                    organization=organization
                )
                if user == request.user:
                    raise serializers.ValidationError(
                        'Cannot remove yourself from the organization'
                    )
                user.organization = None
                user.save()
                return Response({
                    'status': 'success',
                    'message': 'Member removed successfully'
                })
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    'User not found in your organization'
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

