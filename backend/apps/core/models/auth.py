from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
import uuid


class BaseToken(models.Model):
    """Modèle de base pour les tokens"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='%(class)ss'
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    email = models.EmailField(_('email'), default='')

    class Meta:
        abstract = True
        app_label = 'core'

    @property
    def is_expired(self):
        """Vérifie si le token a expiré"""
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        """Vérifie si le token est valide"""
        return not self.is_verified and not self.is_expired


class PasswordResetToken(BaseToken):
    """Token de réinitialisation de mot de passe"""
    used_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=255, blank=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('password reset token')
        verbose_name_plural = _('password reset tokens')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.token}"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)


class EmailVerificationToken(BaseToken):
    """Token de vérification d'email"""
    verified_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=255, blank=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('email verification token')
        verbose_name_plural = _('email verification tokens')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.token}"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=72)
        super().save(*args, **kwargs)


class SecurityKey(models.Model):
    """Modèle pour les clés de sécurité biométriques"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='security_keys'
    )
    key_id = models.CharField(max_length=255, unique=True)
    public_key = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('security key')
        verbose_name_plural = _('security keys')

    def __str__(self):
        return f"{self.user.email} - {self.key_id}"


class UserSession(models.Model):
    """Modèle pour les sessions utilisateur"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('user session')
        verbose_name_plural = _('user sessions')

    def __str__(self):
        return f"{self.user.email} - {self.session_key}"
