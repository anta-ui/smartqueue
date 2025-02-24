from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import authentication
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from .models import User, SecurityKey

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if not user.is_active:
            raise exceptions.AuthenticationFailed(_('User account is disabled.'))
        return user

class BiometricAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_X_BIOMETRIC_TOKEN')
        if not auth_header:
            return None

        try:
            security_key = SecurityKey.objects.get(
                public_key_hash=auth_header,
                user__is_active=True
            )
            return (security_key.user, None)
        except SecurityKey.DoesNotExist:
            raise exceptions.AuthenticationFailed(_('Invalid biometric credentials.'))

class MFAMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and not request.path.startswith('/api/auth/'):
            if request.user.mfa_required and not self._is_verified(request.user):
                raise exceptions.PermissionDenied(
                    _('Multi-factor authentication required.')
                )
        return self.get_response(request)

    def _is_verified(self, user):
        device = self._get_user_totp_device(user)
        return device and device.confirmed

    def _get_user_totp_device(self, user):
        devices = devices_for_user(user, confirmed=True)
        for device in devices:
            if isinstance(device, TOTPDevice):
                return device
        return None
# apps/core/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication

class CustomSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Désactive la vérification CSRF
        return