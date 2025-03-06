# apps/core/serializers/organization.py
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from django_countries.serializers import CountryFieldMixin
from django.apps import apps
from apps.core.models import Organization

from ..models.organization import Organization
from ..models.technical import ApiKey, Webhook
from ..models.financial import OrganizationFinancial

User = get_user_model()

class OrganizationMemberSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les membres d'une organisation"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'user_type']
        read_only_fields = ['id', 'email', 'first_name', 'last_name']

class OrganizationAddMemberSerializer(serializers.Serializer):
    """Sérialiseur pour l'ajout d'un membre à une organisation"""
    email = serializers.EmailField()
    user_type = serializers.ChoiceField(choices=User.UserType.choices)

    def validate_user_type(self, value):
        if value == User.UserType.ADMIN:
            raise serializers.ValidationError(
                _('Cannot add a user as an administrator')
            )
        return value

class OrganizationRemoveMemberSerializer(serializers.Serializer):
    """Sérialiseur pour le retrait d'un membre d'une organisation"""
    email = serializers.EmailField()

class OrganizationFinancialStatusSerializer(serializers.ModelSerializer):
    """Sérialiseur pour le statut financier d'une organisation"""
    class Meta:
        model = OrganizationFinancial
        fields = [
            'current_balance', 
            'next_billing_date', 
            'payment_method', 
            'payment_status'
        ]

class OrganizationSerializer(CountryFieldMixin, serializers.ModelSerializer):
    admin_users = serializers.SerializerMethodField()
    user_count = serializers.IntegerField(read_only=True)
    active_users = serializers.IntegerField(read_only=True)
    inactive_users = serializers.IntegerField(read_only=True)
    members_count = serializers.IntegerField(read_only=True)
    subscription_status = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'plan', 'status', 'country', 'created_at', 
            'updated_at', 'is_active', 'admin_users', 'user_count', 'active_users',
            'inactive_users', 'members_count', 'subscription_status', 'financial_status',
            'technical_config'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_admin_users(self, obj):
        return [
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active
            }
            for user in obj.admin_users.all()
        ]

    def get_members_count(self, obj):
        User = apps.get_model('core', 'User')  # Remplacez 'core' par le nom de votre application si différent
        return User.objects.filter(organization=obj).count()

    def get_financial_status(self, obj):
        try:
            financial_info = obj.financial_info
            return OrganizationFinancialStatusSerializer(financial_info).data
        except OrganizationFinancial.DoesNotExist:
            return None
        
    def get_country_name(self, obj):
        """
        Méthode pour obtenir le nom complet du pays
        """
        try:
            from django_countries import countries
            return countries.name(obj.country) if obj.country else None
        except Exception:
            return str(obj.country) if obj.country else None

    def get_subscription_status(self, obj):
        # Votre logique existante
        return {}

    def validate_name(self, value):
        """
        Validation personnalisée pour le nom de l'organisation
        """
        # Supprimer les espaces
        value = value.strip()
        
        # Vérifier la longueur
        if len(value) < 3:
            raise serializers.ValidationError("Le nom doit contenir au moins 3 caractères.")
        
        # Vérifier les caractères
        if not all(char.isalnum() or char.isspace() for char in value):
            raise serializers.ValidationError("Le nom ne peut contenir que des lettres, chiffres et espaces.")
        
        # Vérifier l'unicité du nom
        instance = self.instance  # L'organisation en cours de modification
        exists = Organization.objects.filter(name=value).exclude(
            id=instance.id if instance else None
        ).exists()
        if exists:
            raise serializers.ValidationError("Une organisation avec ce nom existe déjà.")
        
        return value

    def validate(self, data):
        """
        Validation globale des données
        """
        # Vérifier que le plan est valide
        if 'plan' in data and data['plan'] not in dict(Organization._meta.get_field('plan').choices):
            raise serializers.ValidationError({
                'plan': "Plan invalide. Choix possibles : " + 
                        ", ".join(dict(Organization.plan.choices).keys())
            })
        
        # Vérifier que le statut est valide
        if 'status' in data and data['status'] not in dict(Organization.Status.choices):
            raise serializers.ValidationError({
                'status': "Statut invalide. Choix possibles : " + 
                          ", ".join(dict(Organization.Status.choices).keys())
            })
        
        return data

    def create(self, validated_data):
        """
        Personnalisation de la création
        """
        # Ajouter l'utilisateur connecté comme créateur
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        # Enregistrer avec des valeurs par défaut sécurisées
        validated_data.setdefault('plan', Organization.Plan.PREMIUM)
        validated_data.setdefault('status', Organization.Status.ACTIVE)
        validated_data.setdefault('country', 'FR')
        
        return super().create(validated_data)

class ApiKeySerializer(serializers.ModelSerializer):
    """Sérialiseur pour les clés API"""
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
        read_only_fields = ['id', 'key', 'created_at', 'last_used_at']
    
    def create(self, validated_data):
        """
        Générer une clé unique si non fournie
        """
        import uuid
        if 'key' not in validated_data:
            validated_data['key'] = str(uuid.uuid4())
        
        # Définir des permissions par défaut si non spécifiées
        if 'permissions' not in validated_data:
            validated_data['permissions'] = [
                ApiKey.Permissions.READ.value
            ]
        
        return super().create(validated_data)

class WebhookSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les webhooks"""
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
        read_only_fields = ['id', 'created_at', 'last_triggered_at']

    def validate_events(self, value):
        """
        Valider que les événements sont parmi les choix possibles
        """
        valid_events = [event.value for event in Webhook.Events]
        for event in value:
            if event not in valid_events:
                raise serializers.ValidationError(f"Événement non valide: {event}")
        return value

class OrganizationLimitsSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les limites d'une organisation"""
    class Meta:
        model = Organization
        fields = [
            'requests_per_minute',
            'requests_per_day',
            'api_concurrent_calls',
            'storage_limit',
            'max_members',
            'max_branches'
        ]

    def validate(self, data):
        """
        Validation des limites
        """
        for field, value in data.items():
            if value is not None and value < 0:
                raise serializers.ValidationError({
                    field: f"La valeur de {field} doit être positive."
                })
        return data
    
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