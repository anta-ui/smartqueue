# apps/core/serializers/organization_history.py
from rest_framework import serializers
from ..models.organization_history import OrganizationHistory

class OrganizationHistorySerializer(serializers.ModelSerializer):
    action = serializers.CharField(source='get_action_display')
    performed_by = serializers.SerializerMethodField()
    
    class Meta:
        model = OrganizationHistory
        fields = [
            'id', 
            'action', 
            'from_value', 
            'to_value', 
            'performed_by', 
            'created_at'
        ]
    
    def get_performed_by(self, obj):
        return obj.performed_by.email if obj.performed_by else 'Système'