from rest_framework import serializers
from ..models.consent import UserConsent

class UserConsentSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les consentements utilisateur"""
    class Meta:
        model = UserConsent
        fields = ['id', 'consent_type', 'version', 'granted', 'consented_at', 'revoked_at']
        read_only_fields = ['id', 'consented_at', 'revoked_at']


class UserConsentBulkSerializer(serializers.Serializer):
    """Sérialiseur pour la mise à jour en masse des consentements"""
    consents = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(),
            allow_empty=False
        ),
        allow_empty=False
    )

    def validate_consents(self, value):
        """Valide la liste des consentements"""
        valid_consent_types = dict(UserConsent._meta.get_field('consent_type').choices)
        
        for consent in value:
            if 'consent_type' not in consent:
                raise serializers.ValidationError(
                    "Le champ 'consent_type' est requis pour chaque consentement"
                )
            if 'granted' not in consent:
                raise serializers.ValidationError(
                    "Le champ 'granted' est requis pour chaque consentement"
                )
            if not isinstance(consent['granted'], bool):
                raise serializers.ValidationError(
                    "Le champ 'granted' doit être un booléen"
                )
            if consent['consent_type'] not in valid_consent_types:
                raise serializers.ValidationError(
                    f"Type de consentement invalide : {consent['consent_type']}"
                )
        return value
