from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from django_countries.fields import CountryField
User = get_user_model()

class Organization(models.Model):
    
    requests_per_minute = models.IntegerField(
        _('Requêtes par minute'), 
        default=60
    )
    requests_per_day = models.IntegerField(
        _('Requêtes par jour'), 
        default=10000
    )
    api_concurrent_calls = models.IntegerField(
        _('Appels API simultanés'), 
        default=5
    )
    storage_limit = models.IntegerField(
        _('Limite de stockage'), 
        default=5  # en GB
    )
    max_members = models.IntegerField(
        _('Nombre maximum de membres'), 
        default=25
    )
    max_branches = models.IntegerField(
        _('Nombre maximum de branches'), 
        default=5
    )
    is_active = models.BooleanField(_('Actif'), default=True)
    country = CountryField(blank_label='(Sélectionnez un pays)', null=True, blank=True)
    class Plan(models.TextChoices):
        BASIC = 'basic', _('Basique')
        PREMIUM = 'premium', _('Premium')
        
    
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Active')
        INACTIVE = 'inactive', _('Inactive')
        PENDING = 'pending', _('Pending')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    name = models.CharField(_('Nom'), max_length=255)
    
    plan = models.CharField(
        _('Plan'),
        max_length=20,
        choices=Plan.choices,
        default=Plan.BASIC
    )
    
    
    country = CountryField(
        _('country'),
        default='FR'
    )
    
    created_at = models.DateTimeField(_('Date de création'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Date de mise à jour'), auto_now=True)
    
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='created_organizations'
    )

    class Meta:
        app_label = 'core'
        verbose_name = _('Organisation')
        verbose_name_plural = _('Organisations')

    def __str__(self):
        return self.name

    def add_member(self, user, user_type):
        """Ajoute un membre à l'organisation"""
        user.organization = self
        user.user_type = user_type
        user.save()

    def remove_member(self, user):
        """Retire un membre de l'organisation"""
        user.organization = None
        user.save()

    def get_members(self):
        """Retourne tous les membres de l'organisation"""
        return self.members.all()

    def get_admins(self):
        """Retourne tous les administrateurs de l'organisation"""
        from .user import User
        return self.members.filter(user_type=User.UserType.ADMIN)

    def get_managers(self):
        """Retourne tous les managers de l'organisation"""
        from .user import User
        return self.members.filter(user_type=User.UserType.MANAGER)

    def get_regular_members(self):
        """Retourne tous les membres réguliers de l'organisation"""
        from .user import User
        return self.members.filter(user_type=User.UserType.MEMBER)

    def has_active_resources(self):
        """Vérifie les ressources actives de l'organisation"""
        relations_to_check = [
            'users',
            'user_set',
            'organization_users',
            'queues',
            'tickets'
        ]
        
        for relation in relations_to_check:
            try:
                related_objects = getattr(self, relation)
                if related_objects.exists():
                    return True
            except AttributeError:
                continue
        
        return False
    def delete(self, *args, **kwargs):
        """
        Méthode de suppression personnalisée
        Nettoie les ressources liées avant la suppression
        """
        # Importer les modèles au moment de la suppression
        from django.apps import apps
        
        # Récupérer dynamiquement les modèles
        try:
            Branch = apps.get_model('core', 'Branch')
            OrganizationSettings = apps.get_model('core', 'OrganizationSettings')
            OrganizationFeature = apps.get_model('core', 'OrganizationFeature')
        except LookupError:
            # Si les modèles ne sont pas trouvés, continuer
            Branch = OrganizationSettings = OrganizationFeature = None

        # Nettoyer les ressources liées
        if Branch:
            Branch.objects.filter(organization=self).delete()
        
        if OrganizationSettings:
            OrganizationSettings.objects.filter(organization=self).delete()
        
        if OrganizationFeature:
            OrganizationFeature.objects.filter(organization=self).delete()

        # Appeler la méthode de suppression parente
        super().delete(*args, **kwargs)

    def count_members(self):
        """
        Méthode pour compter les membres de l'organisation
        """
        return self.user_set.count()  # Utilise la relation inverse
    def can_be_deleted(self, user):
        """Vérifie si l'organisation peut être supprimée"""
        return (
            user.is_superuser or 
            user.has_perm('can_delete_organization', self)
        )

class Branch(models.Model):
    name = models.CharField(max_length=100)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

class OrganizationSettings(models.Model):
    """Paramètres de l'organisation"""
    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    max_users = models.IntegerField(_('maximum users'), default=5)
    max_sessions = models.IntegerField(_('maximum sessions'), default=5)
    session_duration = models.IntegerField(
        _('session duration'),
        help_text=_('Duration in days'),
        default=30
    )
    require_mfa = models.BooleanField(
        _('require MFA'),
        help_text=_('Require Multi-Factor Authentication'),
        default=False
    )

    class Meta:
        app_label = 'core'
        verbose_name = _('organization settings')
        verbose_name_plural = _('organization settings')

    def __str__(self):
        return f"{self.organization.name} settings"

class OrganizationFeature(models.Model):
    """Fonctionnalités de l'organisation"""
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='features'
    )
    name = models.CharField(_('name'), max_length=100)
    is_enabled = models.BooleanField(_('enabled'), default=True)
    config = models.JSONField(_('configuration'), default=dict, blank=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('organization feature')
        verbose_name_plural = _('organization features')
        unique_together = ['organization', 'name']

    def __str__(self):
        return f"{self.organization.name} - {self.name}"
    
