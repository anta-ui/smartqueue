from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import EmailValidator
from .models import (
    SubscriptionPlan, Subscription, Invoice,
    Payment, BillingContact
)

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                _('Price cannot be negative.')
            )
        return value

    def validate_billing_cycle(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                _('Billing cycle must be positive.')
            )
        return value

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    organization_name = serializers.CharField(
        source='organization.name',
        read_only=True
    )
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['organization']

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError(
                    _('Start date must be before end date.')
                )
                
        if data.get('end_date') and data['end_date'] < timezone.now():
            raise serializers.ValidationError(
                _('End date cannot be in the past.')
            )
            
        return data

    def get_days_remaining(self, obj):
        if obj.end_date:
            delta = obj.end_date - timezone.now()
            return max(0, delta.days)
        return None

class InvoiceSerializer(serializers.ModelSerializer):
    subscription_plan = serializers.CharField(
        source='subscription.plan.name',
        read_only=True
    )
    organization_name = serializers.CharField(
        source='subscription.organization.name',
        read_only=True
    )

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['subscription']

    def validate(self, data):
        if data.get('total_amount', 0) != (
            data.get('amount', 0) + data.get('tax_amount', 0)
        ):
            raise serializers.ValidationError(
                _('Total amount must equal amount plus tax amount.')
            )
            
        if data.get('due_date') and data['due_date'] < timezone.now().date():
            raise serializers.ValidationError(
                _('Due date cannot be in the past.')
            )
            
        return data

class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(
        source='invoice.invoice_number',
        read_only=True
    )
    organization_name = serializers.CharField(
        source='invoice.subscription.organization.name',
        read_only=True
    )

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['invoice']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                _('Payment amount must be positive.')
            )
        return value

    def validate(self, data):
        if data.get('status') == Payment.Status.COMPLETED and not data.get('transaction_id'):
            raise serializers.ValidationError(
                _('Transaction ID is required for completed payments.')
            )
            
        if data.get('payment_date') and data['payment_date'] > timezone.now():
            raise serializers.ValidationError(
                _('Payment date cannot be in the future.')
            )
            
        return data

class BillingContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingContact
        fields = '__all__'
        read_only_fields = ['organization']

    def validate_email(self, value):
        email_validator = EmailValidator()
        try:
            email_validator(value)
        except:
            raise serializers.ValidationError(
                _('Invalid email address.')
            )
        return value

    def validate_phone(self, value):
        # Supprimer tous les caractères non numériques
        cleaned = ''.join(filter(str.isdigit, value))
        if len(cleaned) < 8:
            raise serializers.ValidationError(
                _('Phone number must have at least 8 digits.')
            )
        return value

class SubscriptionChangeSerializer(serializers.Serializer):
    new_plan = serializers.PrimaryKeyRelatedField(
        queryset=SubscriptionPlan.objects.all()
    )
    prorate = serializers.BooleanField(default=True)

class PaymentMethodSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(
        choices=Payment.PaymentMethod.choices
    )
    card_number = serializers.CharField(
        required=False,
        min_length=16,
        max_length=16
    )
    expiry_month = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=12
    )
    expiry_year = serializers.IntegerField(
        required=False,
        min_value=timezone.now().year
    )
    cvv = serializers.CharField(
        required=False,
        min_length=3,
        max_length=4
    )
    save_for_future = serializers.BooleanField(default=False)

    def validate(self, data):
        if data['payment_method'] == Payment.PaymentMethod.CREDIT_CARD:
            required_fields = [
                'card_number', 'expiry_month',
                'expiry_year', 'cvv'
            ]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({
                        field: _('This field is required for credit card payments.')
                    })
                    
            # Vérifier la date d'expiration
            expiry_date = timezone.datetime(
                data['expiry_year'],
                data['expiry_month'],
                1
            )
            if expiry_date < timezone.now():
                raise serializers.ValidationError(
                    _('Card has expired.')
                )
                
        return data

class InvoiceSearchSerializer(serializers.Serializer):
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    status = serializers.MultipleChoiceField(
        choices=Invoice.Status.choices,
        required=False
    )
    min_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )
    max_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )

    def validate(self, data):
        if data.get('date_from') and data.get('date_to'):
            if data['date_from'] > data['date_to']:
                raise serializers.ValidationError(
                    _('Start date must be before end date.')
                )
                
        if (data.get('min_amount') is not None and
            data.get('max_amount') is not None and
            data['min_amount'] > data['max_amount']):
            raise serializers.ValidationError(
                _('Minimum amount must be less than maximum amount.')
            )
            
        return data
