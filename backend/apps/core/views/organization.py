# apps/core/views/organization.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from ..models.organization import Organization
from ..serializers.organization import (
    OrganizationSerializer,
    OrganizationMemberSerializer,
    OrganizationAddMemberSerializer,
    OrganizationRemoveMemberSerializer
)

User = get_user_model()

class OrganizationMemberListView(generics.ListAPIView):
    """Liste des membres d'une organisation"""
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationMemberSerializer

    def get_queryset(self):
        return User.objects.filter(organization=self.request.user.organization)

class OrganizationAddMemberView(generics.CreateAPIView):
    """Ajouter un membre à l'organisation"""
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationAddMemberSerializer

    def perform_create(self, serializer):
        email = serializer.validated_data['email']
        user_type = serializer.validated_data['user_type']
        try:
            user = User.objects.get(email=email)
            if user.organization:
                raise serializers.ValidationError(
                    'User already belongs to an organization'
                )
            user.organization = self.request.user.organization
            user.user_type = user_type
            user.save()
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found')

class OrganizationRemoveMemberView(generics.GenericAPIView):
    """Retirer un membre de l'organisation"""
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationRemoveMemberSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(
                email=email,
                organization=request.user.organization
            )
            if user == request.user:
                raise serializers.ValidationError(
                    'Cannot remove yourself from the organization'
                )
            user.organization = None
            user.save()
            return Response({'status': 'success'})
        except User.DoesNotExist:
            raise serializers.ValidationError(
                'User not found in your organization'
            )

class OrganizationCreateView(generics.CreateAPIView):
    """Créer une nouvelle organisation"""
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def perform_create(self, serializer):
        organization = serializer.save()
        self.request.user.organization = organization
        self.request.user.save()

class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Obtenir, mettre à jour ou supprimer une organisation"""
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer
    
    def get_queryset(self):
        return Organization.objects.filter(id=self.request.user.organization.id)

    def perform_destroy(self, instance):
        # Supprimer l'association des utilisateurs avant de supprimer l'organisation
        User.objects.filter(organization=instance).update(organization=None)
        instance.delete()