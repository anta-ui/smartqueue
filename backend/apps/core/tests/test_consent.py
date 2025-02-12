from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.core.models.organization import Organization
from apps.core.models.consent import UserConsent
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

User = get_user_model()

class ConsentModelTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="Test Org",
            subscription_type=Organization.SubscriptionType.FREE
        )
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123',
            organization=self.organization
        )

    def test_consent_creation(self):
        consent = UserConsent.objects.create(
            user=self.user,
            consent_type='marketing',
            granted=True,
            ip_address='127.0.0.1',
            user_agent='Mozilla/5.0'
        )
        self.assertTrue(isinstance(consent, UserConsent))
        self.assertEqual(consent.user, self.user)
        self.assertEqual(consent.consent_type, 'marketing')
        self.assertTrue(consent.granted)
        self.assertIsNotNone(consent.consented_at)

    def test_consent_history(self):
        # Create initial consent
        consent = UserConsent.objects.create(
            user=self.user,
            consent_type='marketing',
            granted=True,
            ip_address='127.0.0.1',
            user_agent='Mozilla/5.0'
        )
        initial_consented_at = consent.consented_at

        # Update consent
        consent.granted = False
        consent.save()

        # Check that timestamp has been updated
        self.assertNotEqual(consent.consented_at, initial_consented_at)
        self.assertIsNotNone(consent.revoked_at)

    def test_multiple_consent_types(self):
        # Create marketing consent
        marketing_consent = UserConsent.objects.create(
            user=self.user,
            consent_type='marketing',
            granted=True,
            ip_address='127.0.0.1',
            user_agent='Mozilla/5.0'
        )

        # Create terms consent
        terms_consent = UserConsent.objects.create(
            user=self.user,
            consent_type='terms',
            granted=True,
            ip_address='127.0.0.1',
            user_agent='Mozilla/5.0'
        )

        self.assertEqual(UserConsent.objects.filter(user=self.user).count(), 2)
        self.assertEqual(UserConsent.objects.filter(consent_type='marketing').count(), 1)
        self.assertEqual(UserConsent.objects.filter(consent_type='terms').count(), 1)

class ConsentAPITests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="Test Org",
            subscription_type=Organization.SubscriptionType.FREE
        )
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123',
            organization=self.organization
        )
        self.client.force_authenticate(user=self.user)

    def test_consent_list(self):
        # Create some consents
        UserConsent.objects.create(
            user=self.user,
            consent_type='marketing',
            granted=True,
            ip_address='127.0.0.1',
            user_agent='Mozilla/5.0'
        )
        UserConsent.objects.create(
            user=self.user,
            consent_type='terms',
            granted=True,
            ip_address='127.0.0.1',
            user_agent='Mozilla/5.0'
        )

        url = reverse('core:consent-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_consent_bulk_update(self):
        url = reverse('core:consent-bulk-update')
        data = {
            'consents': [
                {'consent_type': 'marketing', 'granted': True},
                {'consent_type': 'terms', 'granted': True}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(UserConsent.objects.filter(user=self.user).count(), 2)

    def test_invalid_consent_type(self):
        url = reverse('core:consent-create')
        data = {
            'consent_type': 'invalid_type',
            'granted': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
