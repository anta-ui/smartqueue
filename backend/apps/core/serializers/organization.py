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
