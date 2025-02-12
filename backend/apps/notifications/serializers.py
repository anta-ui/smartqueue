from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from .models import (
    NotificationTemplate, NotificationChannel,
    NotificationPreference, Notification, NotificationBatch
)

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        read_only_fields = ['organization']

    def validate(self, data):
        template_type = data.get('template_type')
        if template_type == NotificationTemplate.TemplateType.EMAIL and not data.get('subject'):
            raise serializers.ValidationError(
                {'subject': _('Subject is required for email templates.')}
            )
        return data

class NotificationChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationChannel
        fields = '__all__'
        read_only_fields = ['organization']

    def validate_configuration(self, value):
        channel_type = self.initial_data.get('channel_type')
        required_fields = {
            NotificationChannel.ChannelType.EMAIL: ['smtp_host', 'smtp_port', 'username', 'password'],
            NotificationChannel.ChannelType.SMS: ['provider', 'api_key'],
            NotificationChannel.ChannelType.PUSH: ['firebase_key'],
            NotificationChannel.ChannelType.WHATSAPP: ['account_sid', 'auth_token']
        }
        
        if channel_type in required_fields:
            missing_fields = [
                field for field in required_fields[channel_type]
                if field not in value
            ]
            if missing_fields:
                raise serializers.ValidationError(
                    _('Missing required fields: {}').format(', '.join(missing_fields))
                )
        return value

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, data):
        quiet_hours_start = data.get('quiet_hours_start')
        quiet_hours_end = data.get('quiet_hours_end')
        
        if (quiet_hours_start and not quiet_hours_end) or (quiet_hours_end and not quiet_hours_start):
            raise serializers.ValidationError(
                _('Both quiet hours start and end must be provided.')
            )
            
        if quiet_hours_start and quiet_hours_end and quiet_hours_start >= quiet_hours_end:
            raise serializers.ValidationError(
                _('Quiet hours end must be after start.')
            )
            
        return data

class NotificationSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        slug_field='model',
        queryset=ContentType.objects.all(),
        required=False
    )
    recipient_email = serializers.EmailField(write_only=True, required=False)
    template_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['status', 'sent_at', 'delivered_at', 'read_at', 'error_message']

    def validate(self, data):
        if self.context['request'].method == 'POST':
            if not data.get('template') and not data.get('template_name'):
                raise serializers.ValidationError(
                    _('Either template or template_name must be provided.')
                )
                
            if not data.get('recipient') and not data.get('recipient_email'):
                raise serializers.ValidationError(
                    _('Either recipient or recipient_email must be provided.')
                )
                
            if data.get('scheduled_for') and data['scheduled_for'] <= timezone.now():
                raise serializers.ValidationError(
                    _('Scheduled time must be in the future.')
                )
        return data

class NotificationBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationBatch
        fields = '__all__'
        read_only_fields = ['status', 'processed_count', 'failed_count']

    def validate(self, data):
        if data.get('scheduled_for') and data['scheduled_for'] <= timezone.now():
            raise serializers.ValidationError(
                _('Scheduled time must be in the future.')
            )
            
        if not isinstance(data.get('recipients_filter'), dict):
            raise serializers.ValidationError(
                _('Recipients filter must be a valid JSON object.')
            )
            
        return data

class NotificationPreviewSerializer(serializers.Serializer):
    template = serializers.PrimaryKeyRelatedField(
        queryset=NotificationTemplate.objects.all()
    )
    data = serializers.JSONField(required=False, default=dict)

    def validate(self, data):
        try:
            template = data['template']
            template.content.format(**data.get('data', {}))
            if template.html_content:
                template.html_content.format(**data.get('data', {}))
        except KeyError as e:
            raise serializers.ValidationError(
                _('Missing required placeholder: {}').format(str(e))
            )
        except ValueError as e:
            raise serializers.ValidationError(
                _('Invalid placeholder format: {}').format(str(e))
            )
        return data
