from django.db import models
from django.utils.translation import gettext_lazy as _
from .organization import Organization

class OrganizationFinancial(models.Model):
    class PaymentStatus(models.TextChoices):
        PAID = 'paid', _('Payé')
        PENDING = 'pending', _('En attente')
        OVERDUE = 'overdue', _('En retard')

    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name='financial_info'
    )
    current_balance = models.DecimalField(
        _('Solde actuel'),
        max_digits=10,
        decimal_places=2,
        default=0
    )
    next_billing_date = models.DateField(
        _('Prochaine date de facturation'),
        null=True,
        blank=True
    )
    payment_method = models.CharField(
        _('Méthode de paiement'),
        max_length=50,
        blank=True,
        null=True
    )
    payment_status = models.CharField(
        _('Statut de paiement'),
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    class Meta:
        verbose_name = _('Organisation Financière')
        verbose_name_plural = _('Organisations Financières')

    def __str__(self):
        return f"Finances de {self.organization.name}"

class Invoice(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    invoice_number = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Status(models.TextChoices):
        PAID = 'paid', _('Payé')
        PENDING = 'pending', _('En attente')
        OVERDUE = 'overdue', _('En retard')
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    class Meta:
        verbose_name = _('Facture')
        verbose_name_plural = _('Factures')

    def __str__(self):
        return f"Facture {self.invoice_number}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(
        Invoice, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_number}"

class OrganizationCredit(models.Model):
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='credits'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=255)
    date = models.DateField()
    applied_to = models.ForeignKey(
        Invoice, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='applied_credits'
    )

    def __str__(self):
        return f"Crédit de {self.amount}€ pour {self.organization.name}"

class FinancialReport(models.Model):
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='financial_reports'
    )
    date = models.DateField()
    monthly_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    monthly_expenses = models.DecimalField(max_digits=10, decimal_places=2)
    net_profit = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Rapport financier {self.date} - {self.organization.name}"