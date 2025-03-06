# apps/core/models/technical.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from .organization import Organization

class ApiKey(models.Model):
    class Permissions(models.TextChoices):
        READ = 'read', _('Read')
        WRITE = 'write', _('Write')
        ADMIN = 'admin', _('Admin')

    organization = models.ForeignKey(
        'core.Organization', 
        on_delete=models.CASCADE, 
        related_name='api_keys'
    )
    name = models.CharField(_('name'), max_length=100)
    key = models.CharField(_('key'), max_length=255, unique=True)
    permissions = models.JSONField(
        _('permissions'),
        default=list,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('API Key')
        verbose_name_plural = _('API Keys')
        # Ajoutez cette ligne pour éviter les conflits
        db_table = 'core_technical_apikey'

    def __str__(self):
        return f"{self.name} - {self.organization.name}"

# Pour Webhook, faites de même
class Webhook(models.Model):
    class Events(models.TextChoices):
        ORGANIZATION_UPDATED = 'organization.updated', _('Organization Updated')
        MEMBER_ADDED = 'member.added', _('Member Added')
        MEMBER_REMOVED = 'member.removed', _('Member Removed')
        BRANCH_CREATED = 'branch.created', _('Branch Created')
        BRANCH_DELETED = 'branch.deleted', _('Branch Deleted')

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='webhooks'
    )
    url = models.URLField(_('webhook URL'))
    events = models.JSONField(
        _('events'),
        default=list,
        blank=True
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_triggered_at = models.DateTimeField(null=True, blank=True)
    success_rate = models.FloatField(
        _('success rate'),
        null=True,
        blank=True,
        default=None
    )

    class Meta:
        app_label = 'core'
        verbose_name = _('Webhook')
        verbose_name_plural = _('Webhooks')
        # Ajoutez cette ligne pour éviter les conflits
        db_table = 'core_technical_webhook'

    def __str__(self):
        return f"{self.url} - {self.organization.name}"