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
        fields = ['id', 'name', 'plan', 'status', 'region', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Récupérer l'utilisateur connecté
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)
    def validate(self, data):
        print("Données à valider:", data)
        return super().validate(data)

    def validate_name(self, value):
        """
        Vérifier que le nom n'est pas déjà utilisé par une autre organisation
        """
        instance = self.instance  # L'organisation en cours de modification
        exists = Organization.objects.filter(name=value).exclude(
            id=instance.id if instance else None
        ).exists()
        
        if exists:
            raise serializers.ValidationError("Une organisation avec ce nom existe déjà.")
        return value
    def validate_for_delete(self, instance):
        # Ajoutez des validations spécifiques à la suppression
        user = self.context['request'].user
        
        # Vérification des permissions
        if not user.has_perm('can_delete_organization', instance):
            raise serializers.ValidationError("Vous n'avez pas la permission de supprimer cette organisation")
        
        # Vérification des ressources actives
        if instance.has_active_resources():
            raise serializers.ValidationError("Impossible de supprimer une organisation avec des ressources actives")

