from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.core.models import Organization, OrganizationBranch
from ..models import (
    QueueType, Queue, ServicePoint, Ticket,
    VehicleCategory, QueueAnalytics, QueueNotification
)

User = get_user_model()

class QueueServiceTests(APITestCase):
    def setUp(self):
        # Créer une organisation
        self.organization = Organization.objects.create(
            name="Test Org",
            subscription_type=Organization.SubscriptionType.FREE
        )
        
        # Créer une branche
        self.branch = OrganizationBranch.objects.create(
            name="Test Branch",
            organization=self.organization
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
        
        # Créer un type de file d'attente
        self.queue_type = QueueType.objects.create(
            name="Test Queue Type",
            organization=self.organization,
            branch=self.branch,
            category=QueueType.Category.PERSON
        )
        
        # Créer une file d'attente
        self.queue = Queue.objects.create(
            queue_type=self.queue_type,
            name="Test Queue",
            status=Queue.Status.ACTIVE
        )
        
        # Créer un point de service
        self.service_point = ServicePoint.objects.create(
            name="Test Service Point",
            branch=self.branch,
            status=ServicePoint.Status.AVAILABLE
        )
        self.service_point.assigned_queues.add(self.queue)

    def test_queue_type_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('queues:queue-type-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_queue_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('queues:queue-list')
        data = {
            'queue_type': self.queue_type.id,
            'name': 'New Queue',
            'status': Queue.Status.ACTIVE
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Queue.objects.count(), 2)

    def test_ticket_creation(self):
        self.client.force_authenticate(user=self.client_user)
        url = reverse('queues:ticket-list')
        data = {
            'queue': self.queue.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.count(), 1)

    def test_service_point_call_next(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un ticket en attente
        ticket = Ticket.objects.create(
            queue=self.queue,
            user=self.client_user,
            number='A001',
            status=Ticket.Status.WAITING
        )
        
        url = reverse('queues:service-point-call-next', args=[self.service_point.id])
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, Ticket.Status.CALLED)
        
        self.service_point.refresh_from_db()
        self.assertEqual(self.service_point.status, ServicePoint.Status.BUSY)
        self.assertEqual(self.service_point.current_ticket, ticket)

    def test_ticket_status_update(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un ticket
        ticket = Ticket.objects.create(
            queue=self.queue,
            user=self.client_user,
            number='A001',
            status=Ticket.Status.WAITING
        )
        
        url = reverse('queues:ticket-update-status', args=[ticket.id])
        data = {
            'status': Ticket.Status.SERVING,
            'notes': 'Started serving the customer'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, Ticket.Status.SERVING)
        self.assertIsNotNone(ticket.service_start_time)

    def test_queue_analytics(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer des données d'analyse
        QueueAnalytics.objects.create(
            queue=self.queue,
            date='2025-01-27',
            total_tickets=10,
            served_tickets=8,
            average_wait_time=15
        )
        
        url = reverse('queues:analytics-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['total_tickets'], 10)

    def test_queue_notifications(self):
        self.client.force_authenticate(user=self.client_user)
        
        # Créer un ticket
        ticket = Ticket.objects.create(
            queue=self.queue,
            user=self.client_user,
            number='A001',
            status=Ticket.Status.WAITING
        )
        
        # Créer une notification
        notification = QueueNotification.objects.create(
            ticket=ticket,
            notification_type=QueueNotification.NotificationType.TICKET_CREATED,
            message='Your ticket has been created',
            sent_via='push'
        )
        
        url = reverse('queues:notification-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['message'], 'Your ticket has been created')
