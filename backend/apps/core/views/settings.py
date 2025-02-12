from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import (
    OrganizationSettings,
    OrganizationFeature,
    DataRetentionPolicy,
)
from ..serializers.settings import (
    OrganizationSettingsSerializer,
    OrganizationFeatureSerializer,
    DataRetentionPolicySerializer,
)

class OrganizationSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrganizationSettings.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

class OrganizationFeatureViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationFeatureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrganizationFeature.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        feature = self.get_object()
        feature.is_enabled = not feature.is_enabled
        feature.save()
        return Response(self.get_serializer(feature).data)

class DataRetentionPolicyViewSet(viewsets.ModelViewSet):
    serializer_class = DataRetentionPolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DataRetentionPolicy.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)
