from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

# Create your models here.

class SubscriptionPlan(models.Model):
    class PlanType(models.TextChoices):
        FREE = 'FR', _('Free')
        BASIC = 'BA', _('Basic')
        PROFESSIONAL = 'PR', _('Professional')
        ENTERPRISE = 'EN', _('Enterprise')
    
    name = models.CharField(max_length=255)
    plan_type = models.CharField(
        max_length=2,
        choices=PlanType.choices,
        default=PlanType.FREE
    )
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.IntegerField(help_text=_('Billing cycle in months'))
    max_queues = models.IntegerField()
    max_users = models.IntegerField()
    max_service_points = models.IntegerField()
    includes_analytics = models.BooleanField(default=False)
    includes_ar = models.BooleanField(default=False)
    includes_api_access = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('subscription plan')
        verbose_name_plural = _('subscription plans')

    def __str__(self):
        return f"{self.name} - {self.get_plan_type_display()}"

class Subscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'AC', _('Active')
        PENDING = 'PE', _('Pending')
        CANCELLED = 'CA', _('Cancelled')
        EXPIRED = 'EX', _('Expired')
    
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions'
    )
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.PENDING
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('subscription')
        verbose_name_plural = _('subscriptions')

    def __str__(self):
        return f"{self.organization.name} - {self.plan.name}"

class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DR', _('Draft')
        PENDING = 'PE', _('Pending')
        PAID = 'PA', _('Paid')
        CANCELLED = 'CA', _('Cancelled')
        REFUNDED = 'RE', _('Refunded')
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.DRAFT
    )
    due_date = models.DateField()
    paid_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('invoice')
        verbose_name_plural = _('invoices')

    def __str__(self):
        return f"Invoice #{self.invoice_number} - {self.subscription.organization.name}"

class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        CREDIT_CARD = 'CC', _('Credit Card')
        BANK_TRANSFER = 'BT', _('Bank Transfer')
        PAYPAL = 'PP', _('PayPal')
        MOBILE_MONEY = 'MM', _('Mobile Money')
        CASH = 'CA', _('Cash')
    
    class Status(models.TextChoices):
        PENDING = 'PE', _('Pending')
        COMPLETED = 'CO', _('Completed')
        FAILED = 'FA', _('Failed')
        REFUNDED = 'RE', _('Refunded')
    
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(
        max_length=2,
        choices=PaymentMethod.choices
    )
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.PENDING
    )
    transaction_id = models.CharField(max_length=255, blank=True)
    payment_date = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('payment')
        verbose_name_plural = _('payments')

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.invoice.invoice_number}"

class BillingContact(models.Model):
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='billing_contacts'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    is_primary = models.BooleanField(default=False)
    address = models.TextField()
    tax_id = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('billing contact')
        verbose_name_plural = _('billing contacts')

    def __str__(self):
        return f"{self.organization.name} - {self.name}"
