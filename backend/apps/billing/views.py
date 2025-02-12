from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsOrganizationMember, IsOrganizationAdmin
from .models import (
    SubscriptionPlan, Subscription, Invoice,
    Payment, BillingContact
)
from .serializers import (
    SubscriptionPlanSerializer, SubscriptionSerializer,
    InvoiceSerializer, PaymentSerializer,
    BillingContactSerializer, SubscriptionChangeSerializer,
    PaymentMethodSerializer, InvoiceSearchSerializer
)

class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated]
    queryset = SubscriptionPlan.objects.all()

    @action(detail=True, methods=['post'])
    def subscribe(self, request, pk=None):
        plan = self.get_object()
        organization = request.user.organization
        
        # Vérifier si l'organisation a déjà un abonnement actif
        active_subscription = Subscription.objects.filter(
            organization=organization,
            status=Subscription.Status.ACTIVE,
            end_date__gt=timezone.now()
        ).first()
        
        if active_subscription:
            return Response(
                {'error': _('Organization already has an active subscription.')},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Créer le nouvel abonnement
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=30*plan.billing_cycle)
        
        subscription = Subscription.objects.create(
            organization=organization,
            plan=plan,
            status=Subscription.Status.PENDING,
            start_date=start_date,
            end_date=end_date
        )
        
        # Créer la facture
        invoice = Invoice.objects.create(
            subscription=subscription,
            invoice_number=f"INV{subscription.id:08d}",
            amount=plan.price,
            tax_amount=plan.price * 0.20,  # 20% TVA
            total_amount=plan.price * 1.20,
            status=Invoice.Status.PENDING,
            due_date=timezone.now().date() + timezone.timedelta(days=7)
        )
        
        return Response({
            'subscription': SubscriptionSerializer(subscription).data,
            'invoice': InvoiceSerializer(invoice).data
        })

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return Subscription.objects.filter(
            organization=self.request.user.organization
        )

    @action(detail=True, methods=['post'])
    def change_plan(self, request, pk=None):
        subscription = self.get_object()
        serializer = SubscriptionChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_plan = serializer.validated_data['new_plan']
        prorate = serializer.validated_data['prorate']
        
        if subscription.plan == new_plan:
            return Response(
                {'error': _('Already subscribed to this plan.')},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Calculer le montant prorata si nécessaire
        amount = new_plan.price
        if prorate and subscription.status == Subscription.Status.ACTIVE:
            remaining_days = (subscription.end_date - timezone.now()).days
            total_days = (subscription.end_date - subscription.start_date).days
            credit = subscription.plan.price * (remaining_days / total_days)
            amount = max(0, new_plan.price - credit)
            
        # Créer une nouvelle facture pour la différence
        invoice = Invoice.objects.create(
            subscription=subscription,
            invoice_number=f"INV{subscription.id:08d}",
            amount=amount,
            tax_amount=amount * 0.20,  # 20% TVA
            total_amount=amount * 1.20,
            status=Invoice.Status.PENDING,
            due_date=timezone.now().date() + timezone.timedelta(days=7)
        )
        
        # Mettre à jour l'abonnement
        subscription.plan = new_plan
        subscription.save()
        
        return Response({
            'subscription': self.get_serializer(subscription).data,
            'invoice': InvoiceSerializer(invoice).data
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        subscription = self.get_object()
        
        if subscription.status != Subscription.Status.ACTIVE:
            return Response(
                {'error': _('Can only cancel active subscriptions.')},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        subscription.status = Subscription.Status.CANCELLED
        subscription.auto_renew = False
        subscription.save()
        
        return Response(self.get_serializer(subscription).data)

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        return Invoice.objects.filter(
            subscription__organization=self.request.user.organization
        )

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        invoice = self.get_object()
        serializer = PaymentMethodSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if invoice.status != Invoice.Status.PENDING:
            return Response(
                {'error': _('Invoice cannot be paid.')},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Créer le paiement
        payment = Payment.objects.create(
            invoice=invoice,
            amount=invoice.total_amount,
            payment_method=serializer.validated_data['payment_method'],
            payment_date=timezone.now(),
            transaction_id=f"TXN{invoice.id:08d}"
        )
        
        # Mettre à jour le statut de la facture
        invoice.status = Invoice.Status.PAID
        invoice.paid_date = timezone.now()
        invoice.save()
        
        # Activer l'abonnement si c'est la première facture
        subscription = invoice.subscription
        if subscription.status == Subscription.Status.PENDING:
            subscription.status = Subscription.Status.ACTIVE
            subscription.save()
            
        return Response({
            'invoice': self.get_serializer(invoice).data,
            'payment': PaymentSerializer(payment).data
        })

    @action(detail=False, methods=['post'])
    def search(self, request):
        serializer = InvoiceSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        queryset = self.get_queryset()
        
        if serializer.validated_data.get('date_from'):
            queryset = queryset.filter(
                created_at__date__gte=serializer.validated_data['date_from']
            )
            
        if serializer.validated_data.get('date_to'):
            queryset = queryset.filter(
                created_at__date__lte=serializer.validated_data['date_to']
            )
            
        if serializer.validated_data.get('status'):
            queryset = queryset.filter(
                status__in=serializer.validated_data['status']
            )
            
        if serializer.validated_data.get('min_amount'):
            queryset = queryset.filter(
                total_amount__gte=serializer.validated_data['min_amount']
            )
            
        if serializer.validated_data.get('max_amount'):
            queryset = queryset.filter(
                total_amount__lte=serializer.validated_data['max_amount']
            )
            
        return Response(self.get_serializer(queryset, many=True).data)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        return Payment.objects.filter(
            invoice__subscription__organization=self.request.user.organization
        )

class BillingContactViewSet(viewsets.ModelViewSet):
    serializer_class = BillingContactSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return BillingContact.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        # Si c'est le premier contact, le définir comme principal
        if not BillingContact.objects.filter(
            organization=self.request.user.organization
        ).exists():
            serializer.save(
                organization=self.request.user.organization,
                is_primary=True
            )
        else:
            serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        contact = self.get_object()
        
        # Mettre à jour tous les contacts
        BillingContact.objects.filter(
            organization=request.user.organization
        ).update(is_primary=False)
        
        contact.is_primary = True
        contact.save()
        
        return Response(self.get_serializer(contact).data)
