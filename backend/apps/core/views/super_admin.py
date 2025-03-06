# apps/core/views/super_admin.py
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db.models import Count, Sum, F, Q
from rest_framework import viewsets, status, views, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from ..models.super_admin import (
    SystemSetting,
    SystemAuditLog,
    SystemAlert,
    MaintenanceSchedule,
    SystemBackup
)
from ..models import Organization, User
from ..serializers.super_admin import (
    SystemSettingSerializer,
    SystemAuditLogSerializer,
    SystemAlertSerializer,
    MaintenanceScheduleSerializer,
    SystemBackupSerializer,
    OrganizationDetailSerializer
)
from ..permissions import IsSuperAdmin
from rest_framework.views import APIView
from apps.core.serializers.organization import OrganizationSerializer

class SuperAdminDashboardView(views.APIView):
    """Vue principale pour le tableau de bord Super Admin"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, format=None):
        """Obtenir les données du tableau de bord"""
        # Statistiques des organisations
        total_organizations = Organization.objects.count()
        active_organizations = Organization.objects.filter(status=Organization.Status.ACTIVE).count()
        
        # Utilisateurs
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Alertes actives
        active_alerts = SystemAlert.objects.filter(
            status__in=[SystemAlert.AlertStatus.ACTIVE, SystemAlert.AlertStatus.ACKNOWLEDGED]
        ).count()
        
        # Maintenances à venir
        upcoming_maintenance = MaintenanceSchedule.objects.filter(
            start_time__gt=timezone.now(),
            status=MaintenanceSchedule.MaintenanceStatus.SCHEDULED
        ).count()
        
        # Dernières sauvegardes
        last_backup = SystemBackup.objects.filter(
            status=SystemBackup.BackupStatus.COMPLETED
        ).order_by('-completed_at').first()
        
        # Statistiques par type d'abonnement (plan)
        subscription_stats = Organization.objects.values('plan').annotate(
            count=Count('id')
        ).order_by('plan')
        
        # Derniers logs d'audit
        recent_audit_logs = SystemAuditLogSerializer(
            SystemAuditLog.objects.all().order_by('-timestamp')[:5],
            many=True
        ).data
        
        return Response({
            'organization_stats': {
                'total': total_organizations,
                'active': active_organizations,
                'inactive': total_organizations - active_organizations,
            },
            'user_stats': {
                'total': total_users,
                'active': active_users,
                'inactive': total_users - active_users,
            },
            'system_health': {
                'active_alerts': active_alerts,
                'upcoming_maintenance': upcoming_maintenance,
                'last_backup': SystemBackupSerializer(last_backup).data if last_backup else None,
            },
            'subscription_stats': subscription_stats,
            'recent_audit_logs': recent_audit_logs,
        })

class OrganizationManagementViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des organisations (Super Admin)"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = OrganizationDetailSerializer
    queryset = Organization.objects.all()
    
    def get_queryset(self):
        """Filtrer les organisations en fonction des paramètres de requête"""
        queryset = Organization.objects.all()
        
        # Filtres
        status = self.request.query_params.get('status')
        plan = self.request.query_params.get('plan')
        country = self.request.query_params.get('country')
        search = self.request.query_params.get('search')
        
        if status:
            if status == 'active':
                queryset = queryset.filter(status=Organization.Status.ACTIVE)
            elif status == 'inactive':
                queryset = queryset.filter(status=Organization.Status.INACTIVE)
        
        if plan:
            queryset = queryset.filter(plan=plan)
        
        if country:
            queryset = queryset.filter(country=country)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(members__email__icontains=search) |
                Q(members__first_name__icontains=search) |
                Q(members__last_name__icontains=search)
            ).distinct()
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activer une organisation"""
        organization = self.get_object()
        organization.status = Organization.Status.ACTIVE
        organization.save()
        
        # Enregistrer dans le journal d'audit
        SystemAuditLog.objects.create(
            user=request.user,
            action=SystemAuditLog.ActionType.UPDATE,
            entity_type='Organization',
            entity_id=str(organization.id),
            details={'field': 'status', 'value': Organization.Status.ACTIVE},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'organization activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Désactiver une organisation"""
        organization = self.get_object()
        organization.status = Organization.Status.INACTIVE
        organization.save()
        
        # Enregistrer dans le journal d'audit
        SystemAuditLog.objects.create(
            user=request.user,
            action=SystemAuditLog.ActionType.UPDATE,
            entity_type='Organization',
            entity_id=str(organization.id),
            details={'field': 'status', 'value': Organization.Status.INACTIVE},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'organization deactivated'})
    
    @action(detail=True, methods=['post'])
    def change_plan(self, request, pk=None):
        """Modifier le plan d'abonnement d'une organisation"""
        organization = self.get_object()
        plan = request.data.get('plan')
        
        if not plan:
            return Response(
                {'error': 'plan is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si le type d'abonnement est valide
        if plan not in dict(Organization.SubscriptionType.choices):
            return Response(
                {'error': 'Invalid plan type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        organization.plan = plan
        organization.save()
        
        # Enregistrer dans le journal d'audit
        SystemAuditLog.objects.create(
            user=request.user,
            action=SystemAuditLog.ActionType.UPDATE,
            entity_type='Organization',
            entity_id=str(organization.id),
            details={'field': 'plan', 'value': plan},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'plan updated'})
    
    @action(detail=True, methods=['get'])
    def usage(self, request, pk=None):
        """Obtenir les données d'utilisation d'une organisation"""
        organization = self.get_object()
        
        # Exemple de données d'utilisation (à adapter selon votre logique métier)
        api_usage = {
            'current_month': 15000,
            'limit': 50000,
            'usage_percent': 30,
        }
        
        active_members = organization.members.filter(is_active=True).count()
        
        # Autres statistiques à ajouter selon les besoins
        
        return Response({
            'api_usage': api_usage,
            'active_members': active_members,
            # Autres statistiques...
        })

class SystemSettingViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des paramètres système"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = SystemSettingSerializer
    queryset = SystemSetting.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(last_modified_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(last_modified_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_key(self, request):
        """Obtenir un paramètre par sa clé"""
        key = request.query_params.get('key')
        
        if not key:
            return Response(
                {'error': 'key parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            setting = SystemSetting.objects.get(key=key)
            serializer = self.get_serializer(setting)
            return Response(serializer.data)
        except SystemSetting.DoesNotExist:
            return Response(
                {'error': 'Setting not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class SystemAlertViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des alertes système"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = SystemAlertSerializer
    queryset = SystemAlert.objects.all()
    
    def get_queryset(self):
        """Filtrer les alertes en fonction des paramètres de requête"""
        queryset = SystemAlert.objects.all()
        
        # Filtres
        status = self.request.query_params.get('status')
        level = self.request.query_params.get('level')
        organization_id = self.request.query_params.get('organization_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        is_global = self.request.query_params.get('is_global')
        
        if status:
            queryset = queryset.filter(status=status)
        
        if level:
            queryset = queryset.filter(level=level)
        
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        if is_global is not None:
            is_global_bool = is_global.lower() == 'true'
            queryset = queryset.filter(is_global=is_global_bool)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Marquer une alerte comme reconnue"""
        alert = self.get_object()
        alert.acknowledge(request.user)
        return Response({'status': 'alert acknowledged'})
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Marquer une alerte comme résolue"""
        alert = self.get_object()
        alert.resolve()
        return Response({'status': 'alert resolved'})
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Ignorer une alerte"""
        alert = self.get_object()
        alert.dismiss()
        return Response({'status': 'alert dismissed'})

class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des planifications de maintenance"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = MaintenanceScheduleSerializer
    queryset = MaintenanceSchedule.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        """Filtrer les maintenances en fonction des paramètres de requête"""
        queryset = MaintenanceSchedule.objects.all()
        
        # Filtres
        status = self.request.query_params.get('status')
        maintenance_type = self.request.query_params.get('type')
        upcoming = self.request.query_params.get('upcoming')
        
        if status:
            queryset = queryset.filter(status=status)
        
        if maintenance_type:
            queryset = queryset.filter(maintenance_type=maintenance_type)
        
        if upcoming == 'true':
            queryset = queryset.filter(
                start_time__gt=timezone.now(),
                status=MaintenanceSchedule.MaintenanceStatus.SCHEDULED
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Démarrer une maintenance planifiée"""
        maintenance = self.get_object()
        
        if maintenance.status != MaintenanceSchedule.MaintenanceStatus.SCHEDULED:
            return Response(
                {'error': 'Only scheduled maintenance can be started'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        maintenance.status = MaintenanceSchedule.MaintenanceStatus.IN_PROGRESS
        maintenance.save()
        
        # Enregistrer dans le journal d'audit
        SystemAuditLog.objects.create(
            user=request.user,
            action=SystemAuditLog.ActionType.UPDATE,
            entity_type='MaintenanceSchedule',
            entity_id=str(maintenance.id),
            details={'field': 'status', 'value': 'in_progress'},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'maintenance started'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Terminer une maintenance en cours"""
        maintenance = self.get_object()
        
        if maintenance.status != MaintenanceSchedule.MaintenanceStatus.IN_PROGRESS:
            return Response(
                {'error': 'Only in-progress maintenance can be completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        maintenance.status = MaintenanceSchedule.MaintenanceStatus.COMPLETED
        maintenance.save()
        
        # Enregistrer dans le journal d'audit
        SystemAuditLog.objects.create(
            user=request.user,
            action=SystemAuditLog.ActionType.UPDATE,
            entity_type='MaintenanceSchedule',
            entity_id=str(maintenance.id),
            details={'field': 'status', 'value': 'completed'},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'maintenance completed'})

class SystemBackupViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des sauvegardes système"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = SystemBackupSerializer
    queryset = SystemBackup.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(initiated_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def start_backup(self, request):
        """Démarrer une nouvelle sauvegarde"""
        name = request.data.get('name', f"backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}")
        backup_type = request.data.get('backup_type', 'full')
        retention_days = int(request.data.get('retention_days', 30))
        
        # Créer l'entrée de sauvegarde
        backup = SystemBackup.objects.create(
            name=name,
            path=f"/backups/{name}.zip",  # Chemin à adapter selon votre configuration
            backup_type=backup_type,
            retention_days=retention_days,
            status=SystemBackup.BackupStatus.IN_PROGRESS,
            initiated_by=request.user,
            is_automatic=False
        )
        
        # Enregistrer dans le journal d'audit
        SystemAuditLog.objects.create(
            user=request.user,
            action=SystemAuditLog.ActionType.CREATE,
            entity_type='SystemBackup',
            entity_id=str(backup.id),
            details={'backup_type': backup_type},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Dans un cas réel, vous lanceriez ici une tâche asynchrone pour effectuer la sauvegarde
        # Exemple : backup_task.delay(backup.id)
        
        return Response({
            'status': 'backup initiated',
            'backup_id': backup.id
        })
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Marquer une sauvegarde comme terminée (pour les tests)"""
        backup = self.get_object()
        size = request.data.get('size', 0)
        
        backup.mark_completed(size)
        
        return Response({'status': 'backup marked as completed'})
    
    @action(detail=True, methods=['post'])
    def mark_failed(self, request, pk=None):
        """Marquer une sauvegarde comme échouée (pour les tests)"""
        backup = self.get_object()
        
        backup.mark_failed()
        
        return Response({'status': 'backup marked as failed'})

class SystemAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour consulter les journaux d'audit (lecture seule)"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = SystemAuditLogSerializer
    queryset = SystemAuditLog.objects.all()
    
    def get_queryset(self):
        """Filtrer les journaux en fonction des paramètres de requête"""
        queryset = SystemAuditLog.objects.all()
        
        # Filtres
        action = self.request.query_params.get('action')
        entity_type = self.request.query_params.get('entity_type')
        user_id = self.request.query_params.get('user_id')
        organization_id = self.request.query_params.get('organization_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if action:
            queryset = queryset.filter(action=action)
        
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if organization_id:
            queryset = queryset.filter(organisation_id=organisation_id)
            
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
            
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
            
        return queryset

class SuperAdminOrganizationDetailView(APIView):
    permission_classes = [IsSuperAdmin]
    
    def get(self, request, pk):
        try:
            organization = Organization.objects.get(id=pk)
            serializer = OrganizationSerializer(organization)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {"error": f"Organisation avec ID {pk} non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

class SuperAdminOrganizationGeneralInfoView(APIView):
    permission_classes = [IsSuperAdmin]
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            serializer = OrganizationSerializer(organization)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {"error": f"Organisation avec ID {organization_id} non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

class OrganizationGeneralInfoView(APIView):
    """Vue pour récupérer les informations générales d'une organisation"""
    permission_classes = [IsSuperAdmin]
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            serializer = OrganizationSerializer(organization)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {"error": f"Organisation avec ID {organization_id} non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

class OrganizationTechnicalConfigView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response({"error": "Organisation non trouvée"}, status=status.HTTP_404_NOT_FOUND)
        
        # Créer manuellement la réponse sans utiliser de sérialiseur
        technical_config = {
            "id": organization.id,
            "api_keys": [],  # Implémentez la logique appropriée
            "webhooks": [],  # Implémentez la logique appropriée
            "limits": {
                "rate_limit": getattr(organization, 'rate_limit', None),
                "storage_limit": getattr(organization, 'storage_limit', None),
                "user_limit": getattr(organization, 'user_limit', None),
            }
        }
        
        return Response(technical_config)