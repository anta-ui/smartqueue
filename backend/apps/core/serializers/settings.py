from rest_framework import serializers
from ..models import (
    OrganizationSettings,
    OrganizationFeature,
    DataRetentionPolicy,
)

class OrganizationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSettings
        fields = [
            'id', 'organization', 'language', 'timezone',
            'notification_email', 'enable_sms', 'enable_email',
            'enable_push', 'max_queue_size', 'auto_close_tickets',
            'ticket_expiry_minutes', 'require_verification',
            'allow_walk_in', 'enable_feedback', 'custom_settings',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']

class OrganizationFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationFeature
        fields = [
            'id', 'organization', 'feature_type', 'name',
            'description', 'is_enabled', 'configuration',
            'max_usage', 'current_usage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organization', 'current_usage', 'created_at', 'updated_at']

class DataRetentionPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = DataRetentionPolicy
        fields = [
            'id', 'organization', 'retention_period',
            'auto_delete', 'backup_retention',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']
