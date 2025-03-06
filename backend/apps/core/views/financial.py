# apps/core/views/financial.py
from rest_framework import viewsets, permissions
from ..models.financial import (  # Changez le chemin d'importation
    Invoice, 
    OrganizationCredit, 
    FinancialReport
)
from ..serializers.financial import (  # Changez le chemin d'importation
    InvoiceSerializer, 
    OrganizationCreditSerializer, 
    FinancialReportSerializer
)

class FinancialViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return self.queryset
        return self.queryset.filter(organization=user.organization)

class InvoiceViewSet(FinancialViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class OrganizationCreditViewSet(FinancialViewSet):
    queryset = OrganizationCredit.objects.all()
    serializer_class = OrganizationCreditSerializer

class FinancialReportViewSet(FinancialViewSet):
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer