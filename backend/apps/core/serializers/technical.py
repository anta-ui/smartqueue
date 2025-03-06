# apps/core/serializers/technical.py
from rest_framework import serializers
from ..models.technical import ApiKey, Webhook
from apps.core.models import Organization

class ApiKeySerializer(serializers.ModelSerializer):
    permissions = serializers.JSONField(required=False)

    class Meta:
        model = ApiKey
        fields = [
            'id', 
            'name', 
            'key', 
            'permissions', 
            'created_at', 
            'last_used_at', 
            'expires_at', 
            'is_active'
        ]
        extra_kwargs = {
            'key': {'write_only': True}
        }

    def create(self, validated_data):
        # Générer une clé unique si non fournie
        if 'key' not in validated_data:
            import uuid
            validated_data['key'] = str(uuid.uuid4())
        
        # Définir des permissions par défaut si non spécifiées
        if 'permissions' not in validated_data:
            validated_data['permissions'] = [
                ApiKey.Permissions.READ.value
            ]
        
        return super().create(validated_data)

class WebhookSerializer(serializers.ModelSerializer):
    events = serializers.JSONField(required=False)

    class Meta:
        model = Webhook
        fields = [
            'id', 
            'url', 
            'events', 
            'active', 
            'created_at', 
            'last_triggered_at', 
            'success_rate'
        ]

    def validate_events(self, value):
        # Valider que les événements sont parmi les choix possibles
        valid_events = [event.value for event in Webhook.Events]
        for event in value:
            if event not in valid_events:
                raise serializers.ValidationError(f"Invalid event: {event}")
        return value

class OrganizationTechnicalConfigSerializer(serializers.ModelSerializer):
    api_keys = serializers.SerializerMethodField()
    webhooks = serializers.SerializerMethodField()
    limits = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Organization
        fields = ['id', 'api_keys', 'webhooks', 'limits']
    
    def get_api_keys(self, obj):
        # Logique pour récupérer les clés API
        return []
    
    def get_webhooks(self, obj):
        # Logique pour récupérer les webhooks
        return []
    
    def get_limits(self, obj):
        # Logique pour récupérer les limites
        return {
            "rate_limit": getattr(obj, 'rate_limit', None),
            "storage_limit": getattr(obj, 'storage_limit', None),
            "user_limit": getattr(obj, 'user_limit', None),
        }

    