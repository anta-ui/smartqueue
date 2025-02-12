from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.core.models import Organization
from ..models import (
    NotificationTemplate, NotificationChannel,
    NotificationPreference, Notification, NotificationBatch
)

User = get_user_model()

class NotificationServiceTests(APITestCase):
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
        
        self.client_user = User.objects.create_user(
            username='client',
            email='client@example.com',
            password='clientpass123'
        )
        
        # Créer un modèle de notification
        self.template = NotificationTemplate.objects.create(
            name="Test Template",
            organization=self.organization,
            template_type=NotificationTemplate.TemplateType.EMAIL,
            subject="Test Subject {name}",
            content="Hello {name}, this is a test notification."
        )
        
        # Créer un canal de notification
        self.channel = NotificationChannel.objects.create(
            name="Test Channel",
            organization=self.organization,
            channel_type=NotificationChannel.ChannelType.EMAIL,
            configuration={
                'smtp_host': 'smtp.test.com',
                'smtp_port': 587,
                'username': 'test',
                'password': 'test'
            }
        )

    def test_template_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('notifications:template-list')
        data = {
            'name': 'New Template',
            'template_type': NotificationTemplate.TemplateType.EMAIL,
            'subject': 'Welcome {name}',
            'content': 'Welcome to our platform, {name}!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(NotificationTemplate.objects.count(), 2)

    def test_template_preview(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('notifications:template-preview', args=[self.template.id])
        data = {'data': {'name': 'John'}}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject'], 'Test Subject John')
        self.assertEqual(response.data['content'], 'Hello John, this is a test notification.')

    def test_channel_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('notifications:channel-list')
        data = {
            'name': 'New Channel',
            'channel_type': NotificationChannel.ChannelType.SMS,
            'configuration': {
                'provider': 'twilio',
                'api_key': 'test_key'
            }
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(NotificationChannel.objects.count(), 2)

    def test_preference_management(self):
        self.client.force_authenticate(user=self.client_user)
        url = reverse('notifications:preference-list')
        data = {
            'channel_type': NotificationChannel.ChannelType.EMAIL,
            'is_enabled': True,
            'quiet_hours_start': '22:00:00',
            'quiet_hours_end': '08:00:00'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(NotificationPreference.objects.count(), 1)

    def test_notification_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('notifications:notification-list')
        data = {
            'template': self.template.id,
            'channel': self.channel.id,
            'recipient_email': self.client_user.email,
            'data': {'name': 'John'}
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.count(), 1)

    def test_notification_marking_as_read(self):
        self.client.force_authenticate(user=self.client_user)
        
        # Créer une notification
        notification = Notification.objects.create(
            template=self.template,
            channel=self.channel,
            recipient=self.client_user,
            status=Notification.Status.SENT
        )
        
        url = reverse('notifications:notification-mark-as-read', args=[notification.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        notification.refresh_from_db()
        self.assertIsNotNone(notification.read_at)

    def test_batch_notification_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('notifications:batch-list')
        data = {
            'name': 'Test Batch',
            'template': self.template.id,
            'channel': self.channel.id,
            'recipients_filter': {'is_active': True},
            'data': {'name': 'User'}
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(NotificationBatch.objects.count(), 1)

    def test_batch_processing(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un lot
        batch = NotificationBatch.objects.create(
            name='Test Batch',
            template=self.template,
            channel=self.channel,
            recipients_filter={'is_active': True},
            data={'name': 'User'},
            status=NotificationBatch.Status.PENDING
        )
        
        url = reverse('notifications:batch-process', args=[batch.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        batch.refresh_from_db()
        self.assertEqual(batch.status, NotificationBatch.Status.PROCESSING)
        self.assertTrue(Notification.objects.exists())
