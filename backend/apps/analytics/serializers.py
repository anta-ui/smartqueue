from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import QueueMetrics, AgentPerformance, CustomerFeedback

class QueueMetricsSerializer(serializers.ModelSerializer):
    queue_name = serializers.CharField(source='queue.name', read_only=True)
    service_efficiency_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = QueueMetrics
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_service_efficiency_percentage(self, obj):
        return round(obj.service_efficiency * 100, 2)

    def validate(self, data):
        if data.get('served_customers', 0) > data.get('total_customers', 0):
            raise serializers.ValidationError(
                _('Served customers cannot exceed total customers.')
            )
        if data.get('abandoned_customers', 0) > data.get('total_customers', 0):
            raise serializers.ValidationError(
                _('Abandoned customers cannot exceed total customers.')
            )
        return data

class AgentPerformanceSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.get_full_name', read_only=True)
    agent_email = serializers.EmailField(source='agent.email', read_only=True)
    
    class Meta:
        model = AgentPerformance
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate_service_rating(self, value):
        if value is not None and (value < 0 or value > 5):
            raise serializers.ValidationError(
                _('Service rating must be between 0 and 5.')
            )
        return value

class CustomerFeedbackSerializer(serializers.ModelSerializer):
    ticket_number = serializers.CharField(source='ticket.number', read_only=True)
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomerFeedback
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_average_rating(self, obj):
        ratings = [
            obj.rating,
            obj.wait_time_satisfaction,
            obj.service_satisfaction
        ]
        return round(sum(ratings) / len(ratings), 2)

    def validate(self, data):
        for field in ['rating', 'wait_time_satisfaction', 'service_satisfaction']:
            if data.get(field) and (data[field] < 1 or data[field] > 5):
                raise serializers.ValidationError({
                    field: _('Rating must be between 1 and 5.')
                })
        return data

class QueueMetricsAggregateSerializer(serializers.Serializer):
    date_from = serializers.DateField()
    date_to = serializers.DateField()
    aggregate_by = serializers.ChoiceField(
        choices=['day', 'week', 'month'],
        default='day'
    )

    def validate(self, data):
        if data['date_from'] > data['date_to']:
            raise serializers.ValidationError(
                _('Start date must be before end date.')
            )
        return data

class AgentPerformanceAggregateSerializer(serializers.Serializer):
    date_from = serializers.DateField()
    date_to = serializers.DateField()
    aggregate_by = serializers.ChoiceField(
        choices=['day', 'week', 'month'],
        default='day'
    )
    metrics = serializers.MultipleChoiceField(
        choices=[
            'customers_served',
            'average_service_time',
            'service_rating'
        ]
    )

    def validate(self, data):
        if data['date_from'] > data['date_to']:
            raise serializers.ValidationError(
                _('Start date must be before end date.')
            )
        return data

class FeedbackAnalysisSerializer(serializers.Serializer):
    date_from = serializers.DateField()
    date_to = serializers.DateField()
    group_by = serializers.ChoiceField(
        choices=['rating', 'wait_time_satisfaction', 'service_satisfaction'],
        default='rating'
    )
    include_comments = serializers.BooleanField(default=False)

    def validate(self, data):
        if data['date_from'] > data['date_to']:
            raise serializers.ValidationError(
                _('Start date must be before end date.')
            )
        return data
