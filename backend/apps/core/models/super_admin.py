# apps/core/models/super_admin.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone

class SystemSetting(models.Model):
    """Paramètres système globaux"""
    key = models.CharField(_('key'), max_length=100, unique=True)
    value = models.TextField(_('value'))
    description = models.TextField(_('description'), blank=True)
    is_sensitive = models.BooleanField(_('is sensitive'), default=False)
    last_modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='modified_settings'
    )
    last_modified_at = models.DateTimeField(_('last modified at'), auto_now=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('system setting')
        verbose_name_plural = _('system settings')

    def __str__(self):
        return self.key

class SystemAuditLog(models.Model):
    """Journal d'audit pour les actions système"""
    class ActionType(models.TextChoices):
        CREATE = 'create', _('Create')
        UPDATE = 'update', _('Update')
        DELETE = 'delete', _('Delete')
        LOGIN = 'login', _('Login')
        LOGOUT = 'logout', _('Logout')
        PASSWORD_RESET = 'password_reset', _('Password Reset')
        EMAIL_VERIFICATION = 'email_verification', _('Email Verification')
        PERMISSION_CHANGE = 'permission_change', _('Permission Change')
        SETTING_CHANGE = 'setting_change', _('Setting Change')
        OTHER = 'other', _('Other')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(_('action'), max_length=50, choices=ActionType.choices)
    entity_type = models.CharField(_('entity type'), max_length=100)
    entity_id = models.CharField(_('entity id'), max_length=100, blank=True, null=True)
    details = models.JSONField(_('details'), blank=True, null=True)
    ip_address = models.GenericIPAddressField(_('IP address'), blank=True, null=True)
    user_agent = models.TextField(_('user agent'), blank=True)
    timestamp = models.DateTimeField(_('timestamp'), default=timezone.now)
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )

    class Meta:
        app_label = 'core'
        verbose_name = _('system audit log')
        verbose_name_plural = _('system audit logs')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"

class SystemAlert(models.Model):
    """Alertes système pour le tableau de bord du super admin"""
    class AlertLevel(models.TextChoices):
        INFO = 'info', _('Info')
        WARNING = 'warning', _('Warning')
        ERROR = 'error', _('Error')
        CRITICAL = 'critical', _('Critical')

    class AlertStatus(models.TextChoices):
        ACTIVE = 'active', _('Active')
        ACKNOWLEDGED = 'acknowledged', _('Acknowledged')
        RESOLVED = 'resolved', _('Resolved')
        DISMISSED = 'dismissed', _('Dismissed')

    title = models.CharField(_('title'), max_length=255)
    message = models.TextField(_('message'))
    level = models.CharField(_('level'), max_length=20, choices=AlertLevel.choices, default=AlertLevel.INFO)
    status = models.CharField(_('status'), max_length=20, choices=AlertStatus.choices, default=AlertStatus.ACTIVE)
    created_at = models.DateTimeField(_('created at'), default=timezone.now)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts'
    )
    acknowledged_at = models.DateTimeField(_('acknowledged at'), null=True, blank=True)
    resolved_at = models.DateTimeField(_('resolved at'), null=True, blank=True)
    related_entity_type = models.CharField(_('related entity type'), max_length=100, blank=True)
    related_entity_id = models.CharField(_('related entity id'), max_length=100, blank=True, null=True)
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='alerts'
    )
    is_global = models.BooleanField(_('is global'), default=False)

    class Meta:
        app_label = 'core'
        verbose_name = _('system alert')
        verbose_name_plural = _('system alerts')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def acknowledge(self, user):
        """Marquer l'alerte comme reconnue"""
        self.status = self.AlertStatus.ACKNOWLEDGED
        self.acknowledged_by = user
        self.acknowledged_at = timezone.now()
        self.save()

    def resolve(self):
        """Marquer l'alerte comme résolue"""
        self.status = self.AlertStatus.RESOLVED
        self.resolved_at = timezone.now()
        self.save()

    def dismiss(self):
        """Ignorer l'alerte"""
        self.status = self.AlertStatus.DISMISSED
        self.save()

class MaintenanceSchedule(models.Model):
    """Planning des maintenances système"""
    class MaintenanceType(models.TextChoices):
        PLANNED = 'planned', _('Planned')
        EMERGENCY = 'emergency', _('Emergency')
        UPGRADE = 'upgrade', _('Upgrade')
        PATCH = 'patch', _('Patch')
        BACKUP = 'backup', _('Backup')

    class MaintenanceStatus(models.TextChoices):
        SCHEDULED = 'scheduled', _('Scheduled')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
        CANCELLED = 'cancelled', _('Cancelled')

    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'))
    maintenance_type = models.CharField(_('type'), max_length=20, choices=MaintenanceType.choices)
    status = models.CharField(_('status'), max_length=20, choices=MaintenanceStatus.choices, default=MaintenanceStatus.SCHEDULED)
    start_time = models.DateTimeField(_('start time'))
    end_time = models.DateTimeField(_('end time'))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_maintenances'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    affected_services = models.JSONField(_('affected services'), default=list)
    notify_users = models.BooleanField(_('notify users'), default=True)
    notes = models.TextField(_('notes'), blank=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('maintenance schedule')
        verbose_name_plural = _('maintenance schedules')
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.title} ({self.get_maintenance_type_display()}) - {self.start_time}"

class SystemBackup(models.Model):
    """Gestion des sauvegardes système"""
    class BackupStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')

    name = models.CharField(_('name'), max_length=255)
    path = models.CharField(_('path'), max_length=512)
    size = models.BigIntegerField(_('size in bytes'), default=0)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    status = models.CharField(_('status'), max_length=20, choices=BackupStatus.choices, default=BackupStatus.PENDING)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='initiated_backups'
    )
    notes = models.TextField(_('notes'), blank=True)
    is_automatic = models.BooleanField(_('is automatic'), default=False)
    backup_type = models.CharField(_('backup type'), max_length=50, default='full')
    retention_days = models.PositiveIntegerField(_('retention days'), default=30)
    expiry_date = models.DateField(_('expiry date'), null=True, blank=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('system backup')
        verbose_name_plural = _('system backups')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.created_at}"

    def mark_completed(self, size):
        """Marquer la sauvegarde comme terminée"""
        self.status = self.BackupStatus.COMPLETED
        self.completed_at = timezone.now()
        self.size = size
        self.save()

    def mark_failed(self):
        """Marquer la sauvegarde comme échouée"""
        self.status = self.BackupStatus.FAILED
        self.completed_at = timezone.now()
        self.save()