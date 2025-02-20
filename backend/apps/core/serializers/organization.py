from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from ..models.organization import Organization


User = get_user_model()

class OrganizationMemberSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les membres d'une organisation"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'user_type']
        read_only_fields = ['id', 'email', 'first_name', 'last_name']


class OrganizationAddMemberSerializer(serializers.Serializer):
    """Sérialiseur pour l'ajout d'un membre à une organisation"""
    email = serializers.EmailField()
    user_type = serializers.ChoiceField(choices=User.UserType.choices)

    def validate_user_type(self, value):
        if value == User.UserType.ADMIN:
            raise serializers.ValidationError(
                _('Cannot add a user as an administrator')
            )
        return value


class OrganizationRemoveMemberSerializer(serializers.Serializer):
    """Sérialiseur pour le retrait d'un membre d'une organisation"""
    email = serializers.EmailField()
class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'status', 'plan', 'region', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """
        Vérifier que le nom n'est pas déjà utilisé
        """
        if Organization.objects.filter(name=value).exists():
            raise serializers.ValidationError("Une organisation avec ce nom existe déjà.")
        return value

    def create(self, validated_data):
        """
        Créer une nouvelle organisation
        """
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        return super().create(validated_data)