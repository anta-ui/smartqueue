from django.db import models
from django.utils.translation import gettext_lazy as _


class DataRetentionPolicy(models.Model):
    """Politique de rétention des données"""
    organization = models.OneToOneField(
        'Organization',
        on_delete=models.CASCADE,
        related_name='data_retention_policy'
    )
    session_retention_days = models.IntegerField(
        _('session retention days'),
        default=90,
        help_text=_('Number of days to keep session data')
    )
    log_retention_days = models.IntegerField(
        _('log retention days'),
        default=365,
        help_text=_('Number of days to keep log data')
    )
    backup_retention_days = models.IntegerField(
        _('backup retention days'),
        default=730,
        help_text=_('Number of days to keep backup data')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('data retention policy')
        verbose_name_plural = _('data retention policies')

    def __str__(self):
        return f"{self.organization.name} data retention policy"
