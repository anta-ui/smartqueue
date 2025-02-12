from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import QueueType, Queue, ServicePoint, Ticket, VehicleCategory, QueueAnalytics, QueueNotification

class VehicleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleCategory
        fields = '__all__'

class QueueTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueType
        fields = '__all__'

class ServicePointSerializer(serializers.ModelSerializer):
    assigned_agent_name = serializers.SerializerMethodField()
    current_ticket_number = serializers.SerializerMethodField()

    class Meta:
        model = ServicePoint
        fields = '__all__'

    def get_assigned_agent_name(self, obj):
        return obj.assigned_agent.get_full_name() if obj.assigned_agent else None

    def get_current_ticket_number(self, obj):
        return obj.current_ticket.number if obj.current_ticket else None

class QueueSerializer(serializers.ModelSerializer):
    service_points = ServicePointSerializer(many=True, read_only=True)
    active_tickets_count = serializers.SerializerMethodField()
    estimated_wait_time = serializers.SerializerMethodField()

    class Meta:
        model = Queue
        fields = '__all__'

    def get_active_tickets_count(self, obj):
        return obj.tickets.filter(
            status__in=[Ticket.Status.WAITING, Ticket.Status.CALLED]
        ).count()

    def get_estimated_wait_time(self, obj):
        active_tickets = self.get_active_tickets_count(obj)
        avg_service_time = obj.queue_type.estimated_service_time
        active_service_points = obj.service_points.filter(
            status=ServicePoint.Status.AVAILABLE
        ).count()
        
        if active_service_points == 0:
            return None
            
        return (active_tickets * avg_service_time) // active_service_points

class TicketSerializer(serializers.ModelSerializer):
    position = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    queue_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['number', 'check_in_time', 'called_time', 
                          'service_start_time', 'service_end_time']

    def get_position(self, obj):
        if obj.status != Ticket.Status.WAITING:
            return None
        return obj.queue.tickets.filter(
            status=Ticket.Status.WAITING,
            priority_level__gte=obj.priority_level,
            check_in_time__lt=obj.check_in_time
        ).count() + 1

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def get_queue_name(self, obj):
        return obj.queue.name

    def validate(self, data):
        queue = data.get('queue')
        if queue and queue.status != Queue.Status.ACTIVE:
            raise serializers.ValidationError(
                _('Cannot create ticket for inactive queue.')
            )
            
        if queue.queue_type.requires_vehicle_info and not data.get('vehicle_info'):
            raise serializers.ValidationError(
                _('Vehicle information is required for this queue.')
            )
            
        if queue.queue_type.requires_identification and not data.get('identification_info'):
            raise serializers.ValidationError(
                _('Identification information is required for this queue.')
            )
            
        return data

class QueueAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueAnalytics
        fields = '__all__'
        read_only_fields = ['created_at']

class QueueNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueNotification
        fields = '__all__'
        read_only_fields = ['sent_at', 'delivered_at', 'read_at']

class QueueStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Queue.Status.choices)
    reason = serializers.CharField(required=False, allow_blank=True)

class TicketStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Ticket.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    service_point = serializers.PrimaryKeyRelatedField(
        queryset=ServicePoint.objects.all(),
        required=False
    )

class ServicePointStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ServicePoint.Status.choices)
    assigned_agent = serializers.PrimaryKeyRelatedField(
        queryset=ServicePoint.objects.all(),
        required=False,
        allow_null=True
    )
