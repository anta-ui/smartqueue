from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import EmailValidator
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog, AuditPolicy, AuditExport

class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    actor_email = serializers.EmailField(source='actor.email', read_only=True)
    content_type_name = serializers.CharField(
        source='content_type.model',
        read_only=True
    )
    organization_name = serializers.CharField(
        source='organization.name',
        read_only=True
    )

    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = [
            'actor', 'organization', 'ip_address',
            'user_agent', 'created_at'
        ]

    def validate_changes(self, value):
        if self.initial_data.get('action_type') == AuditLog.ActionType.UPDATE and not value:
            raise serializers.ValidationError(
                _('Changes are required for update actions.')
            )
        return value

class AuditPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditPolicy
        fields = '__all__'
        read_only_fields = ['organization']

    def validate_notification_emails(self, value):
        email_validator = EmailValidator()
        invalid_emails = []
        
        for email in value:
            try:
                email_validator(email)
            except:
                invalid_emails.append(email)
                
        if invalid_emails:
            raise serializers.ValidationError(
                _('Invalid email addresses: {}').format(', '.join(invalid_emails))
            )
        return value

    def validate_enabled_categories(self, value):
        valid_categories = dict(AuditLog.Category.choices).keys()
        invalid_categories = set(value) - set(valid_categories)
        
        if invalid_categories:
            raise serializers.ValidationError(
                _('Invalid categories: {}').format(', '.join(invalid_categories))
            )
        return value

    def validate(self, data):
        if data.get('retention_period', 0) <= 0:
            raise serializers.ValidationError(
                _('Retention period must be positive.')
            )
            
        min_severity = data.get('min_severity')
        notify_severity = data.get('notify_on_severity')
        severity_levels = {
            AuditLog.Severity.DEBUG: 0,
            AuditLog.Severity.INFO: 1,
            AuditLog.Severity.WARNING: 2,
            AuditLog.Severity.ERROR: 3,
            AuditLog.Severity.CRITICAL: 4
        }
        
        if (severity_levels[notify_severity] <
            severity_levels[min_severity]):
            raise serializers.ValidationError(
                _('Notification severity cannot be lower than minimum severity.')
            )
            
        return data

class AuditExportSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    requested_by_name = serializers.CharField(
        source='requested_by.get_full_name',
        read_only=True
    )

    class Meta:
        model = AuditExport
        fields = '__all__'
        read_only_fields = [
            'organization', 'requested_by', 'file',
            'status', 'error_message', 'completed_at'
        ]

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

    def validate(self, data):
        if data['date_from'] > data['date_to']:
            raise serializers.ValidationError(
                _('Start date must be before end date.')
            )
            
        if data['date_to'] > timezone.now():
            raise serializers.ValidationError(
                _('End date cannot be in the future.')
            )
            
        valid_categories = dict(AuditLog.Category.choices).keys()
        invalid_categories = set(data['categories']) - set(valid_categories)
        if invalid_categories:
            raise serializers.ValidationError(
                _('Invalid categories: {}').format(', '.join(invalid_categories))
            )
            
        return data

class AuditSearchSerializer(serializers.Serializer):
    date_from = serializers.DateTimeField(required=False)
    date_to = serializers.DateTimeField(required=False)
    action_types = serializers.MultipleChoiceField(
        choices=AuditLog.ActionType.choices,
        required=False
    )
    categories = serializers.MultipleChoiceField(
        choices=AuditLog.Category.choices,
        required=False
    )
    severities = serializers.MultipleChoiceField(
        choices=AuditLog.Severity.choices,
        required=False
    )
    actor_id = serializers.IntegerField(required=False)
    content_type = serializers.CharField(required=False)
    object_id = serializers.CharField(required=False)
    search_term = serializers.CharField(required=False)

    def validate(self, data):
        if data.get('date_from') and data.get('date_to'):
            if data['date_from'] > data['date_to']:
                raise serializers.ValidationError(
                    _('Start date must be before end date.')
                )
                
        if data.get('content_type'):
            try:
                app_label, model = data['content_type'].split('.')
                ContentType.objects.get(
                    app_label=app_label,
                    model=model
                )
            except (ValueError, ContentType.DoesNotExist):
                raise serializers.ValidationError(
                    _('Invalid content type format. Use "app_label.model".')
                )
                
        return data
