# apps/core/serializers/organization_branch.py
from rest_framework import serializers
from ..models.branch import OrganizationBranch
from ..models.organization import Organization

class OrganizationBranchSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(),
        required=True
    )

    class Meta:
        model = OrganizationBranch
        fields = [
            'id', 'name', 'code', 'organization', 
            'address', 'city', 'country', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


    def to_internal_value(self, data):
        # Validation préliminaire des données
        if not data.get('name'):
            raise serializers.ValidationError({'name': 'Le nom est obligatoire.'})
        
        if not data.get('code'):
            raise serializers.ValidationError({'code': 'Le code est obligatoire.'})
        
        if not data.get('organization'):
            raise serializers.ValidationError({'organization': 'L\'organisation est requise.'})
        
        return super().to_internal_value(data)

    def validate(self, data):
        if 'organization' not in data or not data['organization']:
            raise serializers.ValidationError({"organization": "L'organisation est requise."})
        try:
            organization = Organization.objects.get(id=data['organization'].id)
        except Organization.DoesNotExist:
            raise serializers.ValidationError({"organization": "Organisation invalide."})
        return data
    