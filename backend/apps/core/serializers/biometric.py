from rest_framework import serializers
from ..models.auth import SecurityKey

class BiometricRegistrationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'enregistrement d'une clé biométrique"""
    class Meta:
        model = SecurityKey
        fields = ['key_id', 'public_key']

class BiometricAuthenticationSerializer(serializers.Serializer):
    """Sérialiseur pour l'authentification biométrique"""
    key_id = serializers.CharField()
    signature = serializers.CharField()
