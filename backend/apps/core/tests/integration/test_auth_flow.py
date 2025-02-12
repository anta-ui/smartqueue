from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from django_otp.plugins.otp_totp.models import TOTPDevice
from apps.core.models.auth import SecurityKey
from apps.core.models.organization import Organization

User = get_user_model()

class AuthenticationFlowTests(APITestCase):
    """Tests d'intégration pour le flux complet d'authentification"""

    def setUp(self):
        """Configuration initiale pour les tests"""
        self.test_data = {
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'testpass123',
            'organization_name': 'Test Organization'
        }

    def test_complete_auth_flow(self):
        """Test du flux complet d'authentification"""
        # 1. Inscription d'un nouvel utilisateur
        url = reverse('core:register')
        response = self.client.post(url, self.test_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_id = response.data['user_id']
        user = User.objects.get(id=user_id)
        self.assertIsNotNone(user)

        # 2. Vérification de l'email (simulé pour les tests)
        user.email_verified = True
        user.save()

        # 3. Première connexion avec email/mot de passe
        url = reverse('core:token_obtain_pair')
        login_data = {
            'email': self.test_data['email'],
            'password': self.test_data['password']
        }
        response = self.client.post(url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        access_token = response.data['access']

        # Configurer le client avec le token d'accès
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # 4. Configuration de l'authentification à deux facteurs (TOTP)
        url = reverse('core:totp_setup')
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('device_id', response.data)

        # Vérifier que le dispositif TOTP a été créé
        device = TOTPDevice.objects.get(user=user)
        self.assertIsNotNone(device)

        # Simuler la vérification TOTP
        url = reverse('core:totp_verify')
        response = self.client.post(url, {'token': '123456'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 5. Déconnexion
        url = reverse('core:logout')
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Supprimer les credentials
        self.client.credentials()

        # 6. Nouvelle connexion avec email/mot de passe + TOTP
        # D'abord, obtenir un nouveau token
        url = reverse('core:token_obtain_pair')
        response = self.client.post(url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Vérifier le TOTP
        url = reverse('core:totp_verify')
        response = self.client.post(url, {'token': '123456'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 7. Configuration d'une clé de sécurité biométrique
        url = reverse('core:security_key_register')
        key_data = {
            'key_id': 'test-key-id',
            'public_key': 'test-public-key'
        }
        response = self.client.post(url, key_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Vérifier que la clé a été créée
        security_key = SecurityKey.objects.get(user=user)
        self.assertIsNotNone(security_key)

        # 8. Déconnexion
        url = reverse('core:logout')
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Supprimer les credentials
        self.client.credentials()

        # 9. Connexion avec la clé biométrique
        # Simuler une authentification biométrique réussie
        url = reverse('core:biometric_verify')
        auth_data = {
            'key_id': 'test-key-id',
            'signature': 'test-signature'
        }
        response = self.client.post(url, auth_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_failed_auth_attempts(self):
        """Test des tentatives d'authentification échouées"""
        # 1. Créer un utilisateur de test
        user = User.objects.create_user(
            email=self.test_data['email'],
            password=self.test_data['password'],
            first_name=self.test_data['first_name'],
            last_name=self.test_data['last_name']
        )
        Organization.objects.create(
            name=self.test_data['organization_name'],
            owner=user
        )

        # 2. Tentative de connexion avec un mauvais mot de passe
        url = reverse('core:token_obtain_pair')
        login_data = {
            'email': self.test_data['email'],
            'password': 'wrongpass'
        }
        response = self.client.post(url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 3. Tentative de connexion avec un email inexistant
        login_data = {
            'email': 'nonexistent@example.com',
            'password': self.test_data['password']
        }
        response = self.client.post(url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 4. Connexion réussie mais tentative d'accès sans TOTP
        login_data = {
            'email': self.test_data['email'],
            'password': self.test_data['password']
        }
        response = self.client.post(url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Créer un dispositif TOTP pour l'utilisateur
        device = TOTPDevice.objects.create(user=user, confirmed=True)

        # Tentative d'accès à une ressource protégée sans vérification TOTP
        url = reverse('core:security_key_list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 5. Tentative de vérification TOTP avec un mauvais token
        url = reverse('core:totp_verify')
        response = self.client.post(url, {'token': 'invalid'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_concurrent_sessions(self):
        """Test de la gestion des sessions concurrentes"""
        # 1. Créer un utilisateur de test
        user = User.objects.create_user(
            email=self.test_data['email'],
            password=self.test_data['password'],
            first_name=self.test_data['first_name'],
            last_name=self.test_data['last_name']
        )
        Organization.objects.create(
            name=self.test_data['organization_name'],
            owner=user
        )

        # 2. Créer plusieurs sessions
        url = reverse('core:token_obtain_pair')
        login_data = {
            'email': self.test_data['email'],
            'password': self.test_data['password']
        }

        # Première session
        response1 = self.client.post(url, login_data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        token1 = response1.data['access']

        # Deuxième session
        response2 = self.client.post(url, login_data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        token2 = response2.data['access']

        # 3. Vérifier que les deux sessions sont valides
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')
        url = reverse('core:security_key_list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 4. Déconnecter toutes les sessions
        url = reverse('core:logout')
        response = self.client.post(url, {'all_sessions': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 5. Vérifier que les deux sessions sont invalides
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')
        url = reverse('core:security_key_list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
