from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from ..models.organization import Organization
from ..models.auth import (
    SecurityKey,
    PasswordResetToken,
    EmailVerificationToken,
    UserSession
)
from ..models import User

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Sérialiseur pour l'obtention d'un token d'accès"""
    username_field = 'email'
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'user_type': self.user.user_type,
            'organization': self.user.organization_id,
            'has_totp': TOTPDevice.objects.filter(user=self.user, confirmed=True).exists(),
            'has_biometric': self.user.security_keys.filter(is_active=True).exists()
        }
        return data

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'subscription_type', 'is_active']
        read_only_fields = ['subscription_type', 'is_active']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'inscription d'un nouvel utilisateur"""
    organization_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'organization_name']

    def create(self, validated_data):
        organization_name = validated_data.pop('organization_name')
        password = validated_data.pop('password')

        organization = Organization.objects.create(
            name=organization_name,
            subscription_type=Organization.SubscriptionType.FREE
        )

        user = User.objects.create_user(
            **validated_data,
            organization=organization,
            user_type=User.UserType.ADMIN
        )
        user.set_password(password)
        user.save()

        return user

class TOTPDeviceSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les dispositifs TOTP"""
    secret = serializers.SerializerMethodField()
    qr_code = serializers.SerializerMethodField()

    class Meta:
        model = TOTPDevice
        fields = ['name', 'secret', 'qr_code']
        read_only_fields = ['secret', 'qr_code']

    def get_secret(self, obj):
        if isinstance(obj, TOTPDevice):
            return obj.bin_key
        return None

    def get_qr_code(self, obj):
        if isinstance(obj, TOTPDevice):
            return obj.config_url
        return None

class TOTPSetupSerializer(serializers.Serializer):
    """Sérialiseur pour la configuration TOTP"""
    name = serializers.CharField(required=False, default='default')

class TOTPVerifySerializer(serializers.Serializer):
    """Sérialiseur pour la vérification TOTP"""
    token = serializers.CharField(required=True)

class BiometricRegistrationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'enregistrement d'une clé biométrique"""
    class Meta:
        model = SecurityKey
        fields = ['key_id', 'public_key']

    def create(self, validated_data):
        return SecurityKey.objects.create(
            user=validated_data['user'],
            key_type=SecurityKey.KeyType.FIDO2,
            **validated_data
        )

class BiometricAuthenticationSerializer(serializers.Serializer):
    """Sérialiseur pour l'authentification biométrique"""
    key_id = serializers.CharField()
    signature = serializers.CharField()

    def validate(self, data):
        key_id = data.get('key_id')
        signature = data.get('signature')

        if not SecurityKey.objects.filter(key_id=key_id, is_active=True).exists():
            raise serializers.ValidationError(_('Security key not found or inactive'))

        # TODO: Implémenter la vérification de la signature

        return data

class SecurityKeySerializer(serializers.ModelSerializer):
    """Sérialiseur pour les clés de sécurité"""
    class Meta:
        model = SecurityKey
        fields = ['id', 'key_id', 'public_key', 'is_active', 'created_at', 'last_used_at']
        read_only_fields = ['id', 'created_at', 'last_used_at']

class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer pour la demande de réinitialisation de mot de passe"""
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(_("Aucun utilisateur trouvé avec cet email."))
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer pour la confirmation de réinitialisation de mot de passe"""
    token = serializers.UUIDField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': _("Les mots de passe ne correspondent pas.")
            })
        try:
            self.reset_token = PasswordResetToken.objects.get(token=attrs['token'])
            if not self.reset_token.is_valid:
                raise serializers.ValidationError({
                    'token': _("Ce lien de réinitialisation est invalide ou a expiré.")
                })
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({
                'token': _("Token de réinitialisation invalide.")
            })
        return attrs


class EmailVerificationRequestSerializer(serializers.Serializer):
    """Serializer pour la demande de vérification d'email"""
    email = serializers.EmailField()

    def validate_email(self, value):
        if User.objects.filter(email=value, is_verified=True).exists():
            raise serializers.ValidationError(_("Cet email est déjà vérifié."))
        return value


class EmailVerificationConfirmSerializer(serializers.Serializer):
    """Serializer pour la confirmation de vérification d'email"""
    token = serializers.UUIDField()

    def validate_token(self, value):
        try:
            self.verification_token = EmailVerificationToken.objects.get(token=value)
            if not self.verification_token.is_valid:
                raise serializers.ValidationError(_("Ce lien de vérification est invalide ou a expiré."))
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError(_("Token de vérification invalide."))
        return value


class UserSessionSerializer(serializers.ModelSerializer):
    """Serializer pour les sessions utilisateur"""
    class Meta:
        model = UserSession
        fields = [
            'id', 'device_type', 'device_name', 'ip_address',
            'location', 'last_activity', 'created_at', 'is_active'
        ]
        read_only_fields = [
            'id', 'ip_address', 'last_activity',
            'created_at', 'location'
        ]

    def validate(self, attrs):
        # Vérifier le nombre maximum de sessions actives
        user = self.context['request'].user
        max_sessions = user.organization.settings.max_sessions if user.organization else 5
        if (user.sessions.filter(is_active=True).count() >= max_sessions and
            not self.instance):
            raise serializers.ValidationError(_("Nombre maximum de sessions atteint."))
        return attrs
