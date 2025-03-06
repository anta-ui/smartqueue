# apps/core/serializers/financial.py
from rest_framework import serializers
from ..models.financial import (
    Invoice, 
    InvoiceItem, 
    OrganizationCredit, 
    FinancialReport
)

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['description', 'quantity', 'unit_price', 'total']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 
            'invoice_number', 
            'date', 
            'amount', 
            'status', 
            'items'
        ]

class OrganizationCreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationCredit
        fields = ['id', 'amount', 'reason', 'date', 'applied_to']

class FinancialReportSerializer(serializers.ModelSerializer):
    revenue_by_service = serializers.SerializerMethodField()

    class Meta:
        model = FinancialReport
        fields = [
            'date', 
            'monthly_revenue', 
            'monthly_expenses', 
            'net_profit', 
            'revenue_by_service'
        ]

    def get_revenue_by_service(self, obj):
        return [
            {'service': 'Abonnement', 'amount': obj.monthly_revenue * 0.7},
            {'service': 'Utilisateurs supplémentaires', 'amount': obj.monthly_revenue * 0.2},
            {'service': 'Stockage', 'amount': obj.monthly_revenue * 0.1}
        ]
    
# apps/core/serializers/financial.py
from rest_framework import serializers
from ..models.financial import (
    Invoice, 
    InvoiceItem, 
    OrganizationCredit, 
    FinancialReport
)

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['description', 'quantity', 'unit_price', 'total']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 
            'invoice_number', 
            'date', 
            'amount', 
            'status', 
            'items'
        ]

class OrganizationCreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationCredit
        fields = ['id', 'amount', 'reason', 'date', 'applied_to']

class FinancialReportSerializer(serializers.ModelSerializer):
    revenue_by_service = serializers.SerializerMethodField()

    class Meta:
        model = FinancialReport
        fields = [
            'date', 
            'monthly_revenue', 
            'monthly_expenses', 
            'net_profit', 
            'revenue_by_service'
        ]

    def get_revenue_by_service(self, obj):
        return [
            {'service': 'Abonnement', 'amount': obj.monthly_revenue * 0.7},
            {'service': 'Utilisateurs supplémentaires', 'amount': obj.monthly_revenue * 0.2},
            {'service': 'Stockage', 'amount': obj.monthly_revenue * 0.1}
        ]