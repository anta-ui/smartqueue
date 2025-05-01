

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()

class Organization(models.Model):
    class SubscriptionType(models.TextChoices):
        FREE = 'free', _('Free')
        BASIC = 'basic', _('Basic')
        PREMIUM = 'premium', _('Premium')
    
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Active')
        INACTIVE = 'inactive', _('Inactive')
        PENDING = 'pending', _('Pending')
    
    class Region(models.TextChoices):
        NORTH = 'north', _('North')
        SOUTH = 'south', _('South')
        EAST = 'east', _('East')
        WEST = 'west', _('West')
        CENTRAL = 'central', _('Central')

    name = models.CharField(_('name'), max_length=255)
    plan = models.CharField(
        max_length=20,
        choices=SubscriptionType.choices,
        default=SubscriptionType.FREE
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    region = models.CharField(
        max_length=20,
        choices=Region.choices,
        default=Region.CENTRAL
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='created_organizations'
    )

    class Meta:
        app_label = 'core'
        verbose_name = _('organization')
        verbose_name_plural = _('organizations')

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
    # Vérifiez les relations disponibles
        print("Relations disponibles:", dir(self))
        
        # Vérifiez les différentes relations possibles
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
                print(f"Vérification de {relation}: {related_objects.exists()}")
            except AttributeError:
                print(f"Relation {relation} non trouvée")
        
        return False  # Ou gérez selon votre logique métier

    def can_be_deleted(self, user):
        # Logique de suppression plus complexe
        return (
            user.is_superuser or  # admin peut tout supprimer
            user.has_perm('can_delete_organization', self)  # permission spécifique
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
