from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from django_otp.plugins.otp_totp.models import TOTPDevice
from apps.core.models.auth import SecurityKey
from apps.core.models.consent import UserConsent

User = get_user_model()

class AuthenticationFlowTests(APITestCase):
    def setUp(self):
        self.organization = User.objects.create_user(
            email='org@example.com',
            first_name='Org',
            last_name='Admin',
            password='orgpass123',
            user_type=User.UserType.ADMIN
        ).organization

    def test_complete_auth_flow(self):
        # 1. Register new user
        register_url = reverse('core:register')
        register_data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123',
            'organization_name': 'New Org'
        }
        response = self.client.post(register_url, register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='newuser@example.com')

        # 2. Login and get tokens
        login_url = reverse('core:token_obtain_pair')
        login_data = {
            'email': 'newuser@example.com',
            'password': 'newpass123'
        }
        response = self.client.post(login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data['access']
        refresh_token = response.data['refresh']

        # 3. Setup 2FA
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # 3.1 Setup TOTP
        totp_url = reverse('core:totp_setup')
        response = self.client.post(totp_url, {'name': 'default'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        device = TOTPDevice.objects.get(user=user)

        # 3.2 Verify TOTP
        totp_token = device.generate_token()
        verify_url = reverse('core:totp_verify')
        response = self.client.post(verify_url, {'token': totp_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 4. Register security key
        key_url = reverse('core:register_security_key')
        key_data = {
            'name': 'Test Key',
            'credential_id': 'test_credential',
            'public_key': 'test_public_key'
        }
        response = self.client.post(key_url, key_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 5. Verify security key
        verify_key_url = reverse('core:verify_security_key')
        verify_data = {
            'credential_id': 'test_credential',
            'signature': 'test_signature'
        }
        response = self.client.post(verify_key_url, verify_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 6. Logout
        logout_url = reverse('core:logout')
        response = self.client.post(logout_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class OrganizationIntegrationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            password='adminpass123',
            user_type=User.UserType.ADMIN
        )
        self.organization = self.admin.organization
        self.client.force_authenticate(user=self.admin)

    def test_organization_member_management(self):
        # 1. Invite member
        invite_url = reverse('core:invite_member')
        invite_data = {
            'email': 'member@example.com',
            'role': 'member'
        }
        response = self.client.post(invite_url, invite_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Register member
        register_url = reverse('core:register')
        register_data = {
            'email': 'member@example.com',
            'first_name': 'Member',
            'last_name': 'User',
            'password': 'memberpass123',
            'organization_name': self.organization.name,
            'invitation_token': response.data['token']
        }
        response = self.client.post(register_url, register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        member = User.objects.get(email='member@example.com')
        self.assertEqual(member.organization, self.organization)


class SecurityIntegrationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123',
            user_type=User.UserType.ADMIN
        )
        self.organization = self.user.organization
        self.client.force_authenticate(user=self.user)

    def test_security_features(self):
        # 1. Create consent
        consent_url = reverse('core:user_consent')
        consent_data = {
            'type': 'privacy_policy',
            'version': '1.0',
            'accepted': True
        }
        response = self.client.post(consent_url, consent_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserConsent.objects.filter(user=self.user).exists())

        # 2. Setup TOTP
        totp_url = reverse('core:totp_setup')
        response = self.client.post(totp_url, {'name': 'default'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        device = TOTPDevice.objects.get(user=self.user)

        # 3. Register security key
        key_url = reverse('core:register_security_key')
        key_data = {
            'name': 'Test Key',
            'credential_id': 'test_credential',
            'public_key': 'test_public_key'
        }
        response = self.client.post(key_url, key_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(SecurityKey.objects.filter(user=self.user).exists())
