from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class UserConsent(models.Model):
    """Consentement de l'utilisateur"""
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='consents'
    )
    consent_type = models.CharField(
        _('consent type'),
        max_length=50,
        choices=[
            ('terms', _('Terms of Service')),
            ('privacy', _('Privacy Policy')),
            ('cookies', _('Cookie Policy')),
            ('marketing', _('Marketing Communications')),
        ]
    )
    version = models.CharField(
        _('version'),
        max_length=10,
        default='1.0'
    )
    granted = models.BooleanField(_('granted'), default=True)
    ip_address = models.GenericIPAddressField(_('IP address'))
    user_agent = models.CharField(_('user agent'), max_length=255, blank=True)
    consented_at = models.DateTimeField(_('consented at'), default=timezone.now)
    revoked_at = models.DateTimeField(_('revoked at'), null=True, blank=True)
    is_active = models.BooleanField(_('active'), default=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('user consent')
        verbose_name_plural = _('user consents')
        unique_together = ['user', 'consent_type', 'version']

    def __str__(self):
        return f"{self.user.email} - {self.consent_type} - {self.version}"

    def save(self, *args, **kwargs):
        if not self._state.adding:  # Si c'est une mise à jour
            if self.granted != self.__class__.objects.get(pk=self.pk).granted:
                self.consented_at = timezone.now()
                if not self.granted:
                    self.revoked_at = timezone.now()
                else:
                    self.revoked_at = None
        super().save(*args, **kwargs)
