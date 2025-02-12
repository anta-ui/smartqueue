from rest_framework import permissions
from django.utils.translation import gettext_lazy as _

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
