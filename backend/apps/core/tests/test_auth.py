from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from django_otp.plugins.otp_totp.models import TOTPDevice
from apps.core.models.auth import SecurityKey

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.organization = User.objects.create_user(
            email='org@example.com',
            first_name='Org',
            last_name='Admin',
            password='orgpass123',
            user_type=User.UserType.ADMIN
        ).organization

        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123',
            organization=self.organization,
            user_type=User.UserType.ADMIN
        )
        self.client.force_authenticate(user=self.user)

    def test_user_registration(self):
        url = reverse('core:register')
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123',
            'organization_name': 'New Org'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_token_obtain(self):
        url = reverse('core:token_obtain_pair')
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_totp_setup(self):
        url = reverse('core:totp_setup')
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(TOTPDevice.objects.filter(user=self.user).exists())

    def test_totp_verify(self):
        # Créer un appareil TOTP pour le test
        device = TOTPDevice.objects.create(user=self.user, confirmed=False)
        totp_token = "123456"  # Token fictif pour le test
        
        url = reverse('core:totp_verify')
        data = {'token': totp_token}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_security_key_registration(self):
        url = reverse('core:security_key_register')
        data = {
            'key_id': 'test-key-id',
            'public_key': 'test-public-key'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(SecurityKey.objects.filter(user=self.user).exists())

    def test_security_key_list(self):
        # Créer une clé de sécurité pour le test
        SecurityKey.objects.create(
            user=self.user,
            key_id='test-key-id',
            public_key='test-public-key'
        )

        url = reverse('core:security_key_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
