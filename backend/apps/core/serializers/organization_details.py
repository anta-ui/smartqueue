from rest_framework import serializers
from ..models.organization import Branch, Organization
from ..models.technical import ApiKey, Webhook
from ..models.financial import OrganizationFinancial, Invoice
from ..models.organization_details import Contact

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'phone', 'role']

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'organization']

class ApiKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiKey
        fields = ['id', 'name', 'key', 'created_at', 'last_used_at', 'is_active']

class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webhook
        fields = ['id', 'url', 'events', 'active', 'created_at']

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'date', 'amount', 'status']

class FinancialStatusSerializer(serializers.ModelSerializer):
    invoices = InvoiceSerializer(source='organization.invoices', many=True, read_only=True)
    
    class Meta:
        model = OrganizationFinancial
        fields = [
            'current_balance',
            'next_billing_date',
            'payment_method',
            'payment_status',
            'invoices'
        ] 