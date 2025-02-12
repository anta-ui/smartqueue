from django.shortcuts import render
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsOrganizationMember, IsOrganizationAdmin
from .models import (
    NotificationTemplate, NotificationChannel,
    NotificationPreference, Notification, NotificationBatch
)
from .serializers import (
    NotificationTemplateSerializer, NotificationChannelSerializer,
    NotificationPreferenceSerializer, NotificationSerializer,
    NotificationBatchSerializer, NotificationPreviewSerializer
)

User = get_user_model()

class NotificationTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return NotificationTemplate.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        template = self.get_object()
        serializer = NotificationPreviewSerializer(data={
            'template': template.id,
            'data': request.data.get('data', {})
        })
        serializer.is_valid(raise_exception=True)
        
        preview_data = {
            'subject': template.subject.format(**request.data.get('data', {}))
            if template.subject else None,
            'content': template.content.format(**request.data.get('data', {})),
            'html_content': template.html_content.format(**request.data.get('data', {}))
            if template.html_content else None
        }
        return Response(preview_data)

class NotificationChannelViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationChannelSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return NotificationChannel.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        channel = self.get_object()
        try:
            # Logique de test du canal selon son type
            if channel.channel_type == NotificationChannel.ChannelType.EMAIL:
                # Test de connexion SMTP
                pass
            elif channel.channel_type == NotificationChannel.ChannelType.SMS:
                # Test d'envoi SMS
                pass
            # ... autres types de canaux
            
            return Response({'status': 'success'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NotificationPreference.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['put'])
    def bulk_update(self, request):
        preferences = request.data.get('preferences', [])
        updated = []
        
        for pref in preferences:
            instance = NotificationPreference.objects.filter(
                user=self.request.user,
                channel_type=pref['channel_type']
            ).first()
            
            if instance:
                serializer = self.get_serializer(
                    instance,
                    data=pref,
                    partial=True
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                updated.append(serializer.data)
        
        return Response(updated)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.user_type in ['ADMIN', 'OWNER']:
            return Notification.objects.filter(
                template__organization=user.organization
            )
        return Notification.objects.filter(recipient=user)

    def perform_create(self, serializer):
        if 'template_name' in self.request.data:
            template = NotificationTemplate.objects.get(
                organization=self.request.user.organization,
                name=self.request.data['template_name']
            )
            serializer.validated_data['template'] = template
            
        if 'recipient_email' in self.request.data:
            recipient = User.objects.get(email=self.request.data['recipient_email'])
            serializer.validated_data['recipient'] = recipient
            
        serializer.save()

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.read_at:
            notification.read_at = timezone.now()
            notification.save()
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().filter(
            read_at__isnull=True
        ).update(read_at=timezone.now())
        return Response({'status': 'success'})

class NotificationBatchViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationBatchSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return NotificationBatch.objects.filter(
            template__organization=self.request.user.organization
        )

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        batch = self.get_object()
        if batch.status == NotificationBatch.Status.PENDING:
            # Traiter le lot de notifications
            recipients = User.objects.filter(**batch.recipients_filter)
            
            for recipient in recipients:
                Notification.objects.create(
                    template=batch.template,
                    channel=batch.channel,
                    recipient=recipient,
                    data=batch.data,
                    scheduled_for=batch.scheduled_for
                )
            
            batch.status = NotificationBatch.Status.PROCESSING
            batch.save()
            
            return Response(self.get_serializer(batch).data)
        
        return Response(
            {'error': _('Batch is not in pending status.')},
            status=status.HTTP_400_BAD_REQUEST
        )
