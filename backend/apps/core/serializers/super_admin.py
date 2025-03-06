# apps/core/serializers/super_admin.py
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from ..models.super_admin import (
    SystemSetting,
    SystemAuditLog,
    SystemAlert,
    MaintenanceSchedule,
    SystemBackup
)
from ..models import Organization, User

User = get_user_model()

class SystemSettingSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les paramètres système"""
    last_modified_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemSetting
        fields = [
            'id', 'key', 'value', 'description', 'is_sensitive',
            'last_modified_by', 'last_modified_by_name', 'last_modified_at'
        ]
        read_only_fields = ['last_modified_by', 'last_modified_at']
    
    def get_last_modified_by_name(self, obj):
        if obj.last_modified_by:
            return f"{obj.last_modified_by.first_name} {obj.last_modified_by.last_name}"
        return None
    
    def to_representation(self, instance):
        """Masquer les valeurs sensibles"""
        ret = super().to_representation(instance)
        if instance.is_sensitive:
            ret['value'] = '********'
        return ret

class SystemAuditLogSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les journaux d'audit système"""
    user_name = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemAuditLog
        fields = [
            'id', 'user', 'user_name', 'action', 'entity_type', 'entity_id',
            'details', 'ip_address', 'user_agent', 'timestamp',
            'organization', 'organization_name'
        ]
        read_only_fields = fields
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return None
    
    def get_organization_name(self, obj):
        if obj.organization:
            return obj.organization.name
        return None

class SystemAlertSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les alertes système"""
    acknowledged_by_name = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemAlert
        fields = [
            'id', 'title', 'message', 'level', 'status', 
            'created_at', 'updated_at', 'acknowledged_by', 'acknowledged_by_name',
            'acknowledged_at', 'resolved_at', 'related_entity_type',
            'related_entity_id', 'organization', 'organization_name', 'is_global'
        ]
        read_only_fields = [
            'acknowledged_by', 'acknowledged_at', 'resolved_at',
            'updated_at'
        ]
    
    def get_acknowledged_by_name(self, obj):
        if obj.acknowledged_by:
            return f"{obj.acknowledged_by.first_name} {obj.acknowledged_by.last_name}"
        return None
    
    def get_organization_name(self, obj):
        if obj.organization:
            return obj.organization.name
        return None

class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les planifications de maintenance"""
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceSchedule
        fields = [
            'id', 'title', 'description', 'maintenance_type', 'status',
            'start_time', 'end_time', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'affected_services', 'notify_users', 'notes'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return None
    
    def validate(self, data):
        """Valider les dates de début et de fin"""
        if 'start_time' in data and 'end_time' in data:
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError(
                    _("End time must be after start time")
                )
        return data

class SystemBackupSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les sauvegardes système"""
    initiated_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemBackup
        fields = [
            'id', 'name', 'path', 'size', 'created_at', 'status',
            'completed_at', 'initiated_by', 'initiated_by_name', 'notes',
            'is_automatic', 'backup_type', 'retention_days', 'expiry_date'
        ]
        read_only_fields = [
            'created_at', 'completed_at', 'initiated_by', 'size'
        ]
    
    def get_initiated_by_name(self, obj):
        if obj.initiated_by:
            return f"{obj.initiated_by.first_name} {obj.initiated_by.last_name}"
        return None

class OrganizationUserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les utilisateurs dans le contexte des organisations"""
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'user_type',
            'is_active', 'date_joined', 'last_login'
        ]

class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur détaillé pour les organisations"""
    admin_users = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    active_users = serializers.SerializerMethodField()
    inactive_users = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'plan', 'is_active',
            'created_at', 'admin_users', 'user_count',
            'active_users', 'inactive_users', 'subscription_status'
        ]
    
    def get_admin_users(self, obj):
        """Obtenir les administrateurs de l'organisation"""
        admin_users = obj.members.filter(user_type=User.UserType.ADMIN)
        return OrganizationUserSerializer(admin_users, many=True).data
    
    def get_user_count(self, obj):
        """Obtenir le nombre total d'utilisateurs"""
        return obj.members.count()
    
    def get_active_users(self, obj):
        """Obtenir le nombre d'utilisateurs actifs"""
        return obj.members.filter(is_active=True).count()
    
    def get_inactive_users(self, obj):
        """Obtenir le nombre d'utilisateurs inactifs"""
        return obj.members.filter(is_active=False).count()
    
    def get_subscription_status(self, obj):
        """Obtenir le statut de l'abonnement"""
        # À adapter selon votre logique métier pour les abonnements
        return {
            'type': obj.plan,
            'is_active': obj.is_active,
            'features': [
                # Liste des fonctionnalités incluses dans l'abonnement
                {'name': 'Feature 1', 'included': True},
                {'name': 'Feature 2', 'included': True},
                {'name': 'Feature 3', 'included': obj.plan != 'BASIC'},
                {'name': 'Feature 4', 'included': obj.plan == 'PREMIUM'},
            ]
        }

class DashboardOrganizationSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour les organisations dans le tableau de bord"""
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'plan', 'is_active',
            'created_at', 'user_count'
        ]
    
    def get_user_count(self, obj):
        return obj.members.count()

class DashboardStatsSerializer(serializers.Serializer):
    """Sérialiseur pour les statistiques du tableau de bord"""
    total_organizations = serializers.IntegerField()
    active_organizations = serializers.IntegerField()
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    subscription_distribution = serializers.DictField(
        child=serializers.IntegerField()
    )
    recent_activities = SystemAuditLogSerializer(many=True)