from rest_framework import permissions
from django.utils.translation import gettext_lazy as _
from rest_framework.permissions import BasePermission

class IsOrganizationMember(permissions.BasePermission):
    message = _('You must be a member of the organization.')

    def has_permission(self, request, view):
        
        return bool(request.user and request.user.is_authenticated and request.user.organization)

    def has_object_permission(self, request, view, obj):
        return bool(request.user.organization == getattr(obj, 'organization', None))

class IsOrganizationAdmin(permissions.BasePermission):
    message = _('You must be an administrator of the organization.')

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.organization and 
            request.user.user_type == request.user.UserType.ADMIN
        )

class IsOrganizationOwner(permissions.BasePermission):
    message = _('You must be the owner of the organization.')

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.organization and 
            request.user.user_type == request.user.UserType.OWNER
        )

class HasRequiredFeature(permissions.BasePermission):
    def __init__(self, feature_code):
        self.feature_code = feature_code
        self.message = _('Your organization does not have access to this feature.')

    def has_permission(self, request, view):
        if not request.user.is_authenticated or not request.user.organization:
            return False
        return request.user.organization.has_feature(self.feature_code)

class HasBiometricEnabled(permissions.BasePermission):
    message = _('Biometric authentication is required for this action.')

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.security_keys.filter(is_active=True).exists()
        )
# Dans vos réglages de permissions
PERMISSIONS = {
    'can_delete_organization': [
        'is_superuser',
        'is_staff',
        # Autres conditions spécifiques
    ]
}


# apps/core/permissions.py
from rest_framework import permissions
from django.utils.translation import gettext_lazy as _

class IsSuperAdmin(BasePermission):
    """
    Permission pour vérifier si l'utilisateur est un super administrateur.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser

class IsSystemAdministrator(permissions.BasePermission):
    """
    Permission permettant uniquement aux administrateurs système d'accéder à une vue.
    Les super-administrateurs et les utilisateurs ayant le groupe 'system_admin' sont autorisés.
    """
    message = _("Vous devez être un administrateur système pour effectuer cette action.")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super-administrateurs
        if request.user.is_superuser:
            return True
        
        # Administrateurs système (utilisateurs dans le groupe 'system_admin')
        return request.user.groups.filter(name='system_admin').exists()

class CanManageOrganizations(permissions.BasePermission):
    """
    Permission permettant à un utilisateur de gérer les organisations.
    """
    message = _("Vous n'avez pas les droits pour gérer les organisations.")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super-administrateurs
        if request.user.is_superuser:
            return True
        
        # Vérifier les permissions spécifiques
        return request.user.has_perm('core.add_organization') and \
               request.user.has_perm('core.change_organization') and \
               request.user.has_perm('core.view_organization')

class CanViewSystemSettings(permissions.BasePermission):
    """
    Permission permettant à un utilisateur de consulter les paramètres système.
    """
    message = _("Vous n'avez pas les droits pour consulter les paramètres système.")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super-administrateurs
        if request.user.is_superuser:
            return True
        
        # Vérifier les permissions spécifiques
        return request.user.has_perm('core.view_systemsetting')

class CanChangeSystemSettings(permissions.BasePermission):
    """
    Permission permettant à un utilisateur de modifier les paramètres système.
    """
    message = _("Vous n'avez pas les droits pour modifier les paramètres système.")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super-administrateurs
        if request.user.is_superuser:
            return True
        
        # Méthodes de lecture seule
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('core.view_systemsetting')
        
        # Vérifier les permissions spécifiques pour les modifications
        return request.user.has_perm('core.change_systemsetting')

class CanManageSystemAlerts(permissions.BasePermission):
    """
    Permission permettant à un utilisateur de gérer les alertes système.
    """
    message = _("Vous n'avez pas les droits pour gérer les alertes système.")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super-administrateurs
        if request.user.is_superuser:
            return True
        
        # Méthodes de lecture seule
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('core.view_systemalert')
        
        # Vérifier les permissions spécifiques pour les modifications
        return request.user.has_perm('core.change_systemalert') and \
               request.user.has_perm('core.add_systemalert')

class CanManageMaintenanceSchedule(permissions.BasePermission):
    """
    Permission permettant à un utilisateur de gérer les planifications de maintenance.
    """
    message = _("Vous n'avez pas les droits pour gérer les planifications de maintenance.")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super-administrateurs
        if request.user.is_superuser:
            return True
        
        # Méthodes de lecture seule
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('core.view_maintenanceschedule')
        
        # Vérifier les permissions spécifiques pour les modifications
        return request.user.has_perm('core.change_maintenanceschedule') and \
               request.user.has_perm('core.add_maintenanceschedule')

class CanManageSystemBackups(permissions.BasePermission):
    """
    Permission permettant à un utilisateur de gérer les sauvegardes système.
    """
    message = _("Vous n'avez pas les droits pour gérer les sauvegardes système.")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super-administrateurs
        if request.user.is_superuser:
            return True
        
        # Méthodes de lecture seule
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('core.view_systembackup')
        
        # Vérifier les permissions spécifiques pour les modifications
        return request.user.has_perm('core.change_systembackup') and \
               request.user.has_perm('core.add_systembackup')

class CanViewAuditLogs(permissions.BasePermission):
    """
    Permission permettant à un utilisateur de consulter les journaux d'audit.
    """
    message = _("Vous n'avez pas les droits pour consulter les journaux d'audit.")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super-administrateurs
        if request.user.is_superuser:
            return True
        
        # Vérifier les permissions spécifiques
        return request.user.has_perm('core.view_systemauditlog')