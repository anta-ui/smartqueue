from django.shortcuts import render
from django.utils import timezone
from django.db.models import F, Q
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsOrganizationMember, IsOrganizationAdmin
from .models import (
    QueueType, Queue, ServicePoint, Ticket,
    VehicleCategory, QueueAnalytics, QueueNotification
)
from .serializers import (
    QueueTypeSerializer, QueueSerializer, ServicePointSerializer,
    TicketSerializer, VehicleCategorySerializer, QueueAnalyticsSerializer,
    QueueNotificationSerializer, QueueStatusUpdateSerializer,
    TicketStatusUpdateSerializer, ServicePointStatusUpdateSerializer
)

# Create your views here.

class QueueTypeViewSet(viewsets.ModelViewSet):
    serializer_class = QueueTypeSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return QueueType.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

class QueueViewSet(viewsets.ModelViewSet):
    serializer_class = QueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Queue.objects.filter(
            queue_type__organization=self.request.user.organization
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        queue = self.get_object()
        serializer = QueueStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            queue.status = serializer.validated_data['status']
            queue.save()
            
            # Notifier les utilisateurs du changement de statut
            active_tickets = queue.tickets.filter(
                status__in=[Ticket.Status.WAITING, Ticket.Status.CALLED]
            )
            for ticket in active_tickets:
                QueueNotification.objects.create(
                    ticket=ticket,
                    notification_type=QueueNotification.NotificationType.STATUS_CHANGE,
                    message=f"Queue status changed to {queue.get_status_display()}",
                    sent_via='push'
                )
            
            return Response(QueueSerializer(queue).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ServicePointViewSet(viewsets.ModelViewSet):
    serializer_class = ServicePointSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        return ServicePoint.objects.filter(
            branch__organization=self.request.user.organization
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        service_point = self.get_object()
        serializer = ServicePointStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            service_point.status = serializer.validated_data['status']
            if 'assigned_agent' in serializer.validated_data:
                service_point.assigned_agent = serializer.validated_data['assigned_agent']
            service_point.save()
            return Response(ServicePointSerializer(service_point).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def call_next(self, request, pk=None):
        service_point = self.get_object()
        
        if service_point.status != ServicePoint.Status.AVAILABLE:
            return Response(
                {'error': _('Service point is not available.')},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Trouver le prochain ticket
        next_ticket = Ticket.objects.filter(
            queue__in=service_point.assigned_queues.all(),
            status=Ticket.Status.WAITING
        ).order_by('-priority_level', 'check_in_time').first()
        
        if not next_ticket:
            return Response(
                {'message': _('No waiting tickets.')},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Mettre à jour le ticket
        next_ticket.status = Ticket.Status.CALLED
        next_ticket.called_time = timezone.now()
        next_ticket.save()
        
        # Mettre à jour le point de service
        service_point.status = ServicePoint.Status.BUSY
        service_point.current_ticket = next_ticket
        service_point.save()
        
        # Créer une notification
        QueueNotification.objects.create(
            ticket=next_ticket,
            notification_type=QueueNotification.NotificationType.CALLED,
            message=f"Please proceed to {service_point.name}",
            sent_via='push'
        )
        
        return Response(TicketSerializer(next_ticket).data)

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.user_type in ['ADMIN', 'OWNER']:
            return Ticket.objects.filter(
                queue__queue_type__organization=user.organization
            )
        return Ticket.objects.filter(user=user)

    def perform_create(self, serializer):
        queue = serializer.validated_data['queue']
        # Générer le numéro de ticket
        last_ticket = queue.tickets.order_by('-created_at').first()
        next_number = int(last_ticket.number) + 1 if last_ticket else 1
        
        serializer.save(
            user=self.request.user,
            number=f"{queue.queue_type.prefix}{next_number:04d}"
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            notes = serializer.validated_data.get('notes', '')
            
            # Mettre à jour les horodatages en fonction du statut
            if new_status == Ticket.Status.SERVING:
                ticket.service_start_time = timezone.now()
            elif new_status in [Ticket.Status.COMPLETED, Ticket.Status.CANCELLED, Ticket.Status.NO_SHOW]:
                ticket.service_end_time = timezone.now()
            
            ticket.status = new_status
            ticket.notes = notes
            ticket.save()
            
            # Mettre à jour le point de service si nécessaire
            if ticket.current_service_point:
                if new_status in [Ticket.Status.COMPLETED, Ticket.Status.CANCELLED, Ticket.Status.NO_SHOW]:
                    service_point = ticket.current_service_point
                    service_point.status = ServicePoint.Status.AVAILABLE
                    service_point.current_ticket = None
                    service_point.save()
            
            # Créer une notification
            QueueNotification.objects.create(
                ticket=ticket,
                notification_type=QueueNotification.NotificationType.STATUS_CHANGE,
                message=f"Ticket status changed to {ticket.get_status_display()}",
                sent_via='push'
            )
            
            return Response(TicketSerializer(ticket).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VehicleCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleCategorySerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]
    queryset = VehicleCategory.objects.all()

class QueueAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QueueAnalyticsSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        return QueueAnalytics.objects.filter(
            queue__queue_type__organization=self.request.user.organization
        )

class QueueNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QueueNotificationSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.user_type in ['ADMIN', 'OWNER']:
            return QueueNotification.objects.filter(
                ticket__queue__queue_type__organization=user.organization
            )
        return QueueNotification.objects.filter(ticket__user=user)