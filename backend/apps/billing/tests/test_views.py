from datetime import timedelta
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.core.models import Organization
from ..models import (
    SubscriptionPlan, Subscription, Invoice,
    Payment, BillingContact
)

User = get_user_model()

class BillingServiceTests(APITestCase):
    def setUp(self):
        # Créer une organisation
        self.organization = Organization.objects.create(
            name="Test Org",
            subscription_type=Organization.SubscriptionType.FREE
        )
        
        # Créer des utilisateurs
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            organization=self.organization,
            user_type=User.UserType.ADMIN
        )
        
        self.staff_user = User.objects.create_user(
            username='staff',
            email='staff@example.com',
            password='staffpass123',
            organization=self.organization,
            user_type=User.UserType.STAFF
        )
        
        # Créer des plans d'abonnement
        self.basic_plan = SubscriptionPlan.objects.create(
            name="Basic Plan",
            plan_type=SubscriptionPlan.PlanType.BASIC,
            description="Basic features",
            price=Decimal('29.99'),
            billing_cycle=1,
            max_queues=5,
            max_users=10,
            max_service_points=3
        )
        
        self.pro_plan = SubscriptionPlan.objects.create(
            name="Pro Plan",
            plan_type=SubscriptionPlan.PlanType.PROFESSIONAL,
            description="Professional features",
            price=Decimal('99.99'),
            billing_cycle=1,
            max_queues=20,
            max_users=50,
            max_service_points=10,
            includes_analytics=True
        )

    def test_subscription_plan_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('billing:plan-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_subscribe_to_plan(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('billing:plan-subscribe', args=[self.basic_plan.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Subscription.objects.count(), 1)
        self.assertEqual(Invoice.objects.count(), 1)

    def test_change_subscription_plan(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un abonnement actif
        subscription = Subscription.objects.create(
            organization=self.organization,
            plan=self.basic_plan,
            status=Subscription.Status.ACTIVE,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30)
        )
        
        url = reverse('billing:subscription-change-plan', args=[subscription.id])
        data = {
            'new_plan': self.pro_plan.id,
            'prorate': True
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subscription.refresh_from_db()
        self.assertEqual(subscription.plan, self.pro_plan)

    def test_cancel_subscription(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un abonnement actif
        subscription = Subscription.objects.create(
            organization=self.organization,
            plan=self.basic_plan,
            status=Subscription.Status.ACTIVE,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30)
        )
        
        url = reverse('billing:subscription-cancel', args=[subscription.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subscription.refresh_from_db()
        self.assertEqual(subscription.status, Subscription.Status.CANCELLED)
        self.assertFalse(subscription.auto_renew)

    def test_pay_invoice(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un abonnement et une facture
        subscription = Subscription.objects.create(
            organization=self.organization,
            plan=self.basic_plan,
            status=Subscription.Status.PENDING,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30)
        )
        
        invoice = Invoice.objects.create(
            subscription=subscription,
            invoice_number="INV00000001",
            amount=self.basic_plan.price,
            tax_amount=self.basic_plan.price * Decimal('0.20'),
            total_amount=self.basic_plan.price * Decimal('1.20'),
            status=Invoice.Status.PENDING,
            due_date=timezone.now().date() + timedelta(days=7)
        )
        
        url = reverse('billing:invoice-pay', args=[invoice.id])
        data = {
            'payment_method': Payment.PaymentMethod.CREDIT_CARD,
            'card_number': '4111111111111111',
            'expiry_month': 12,
            'expiry_year': timezone.now().year + 1,
            'cvv': '123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, Invoice.Status.PAID)
        subscription.refresh_from_db()
        self.assertEqual(subscription.status, Subscription.Status.ACTIVE)

    def test_invoice_search(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer quelques factures
        subscription = Subscription.objects.create(
            organization=self.organization,
            plan=self.basic_plan,
            status=Subscription.Status.ACTIVE,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30)
        )
        
        Invoice.objects.create(
            subscription=subscription,
            invoice_number="INV00000001",
            amount=Decimal('100'),
            tax_amount=Decimal('20'),
            total_amount=Decimal('120'),
            status=Invoice.Status.PAID,
            due_date=timezone.now().date()
        )
        
        Invoice.objects.create(
            subscription=subscription,
            invoice_number="INV00000002",
            amount=Decimal('200'),
            tax_amount=Decimal('40'),
            total_amount=Decimal('240'),
            status=Invoice.Status.PENDING,
            due_date=timezone.now().date()
        )
        
        url = reverse('billing:invoice-search')
        data = {
            'status': [Invoice.Status.PENDING],
            'min_amount': 200,
            'max_amount': 300
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_billing_contact_management(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un contact
        url = reverse('billing:contact-list')
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '1234567890',
            'address': '123 Main St',
            'tax_id': 'TAX123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['is_primary'])
        
        # Créer un second contact
        data['name'] = 'Jane Doe'
        data['email'] = 'jane@example.com'
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data['is_primary'])
        
        # Définir le second contact comme principal
        url = reverse('billing:contact-set-primary', args=[response.data['id']])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_primary'])

    def test_unauthorized_access(self):
        url = reverse('billing:plan-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_cannot_manage_subscriptions(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('billing:subscription-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
