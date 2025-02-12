from datetime import datetime, timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.core.models import Organization
from apps.queues.models import Queue, Ticket
from ..models import QueueMetrics, AgentPerformance, CustomerFeedback

User = get_user_model()

class AnalyticsServiceTests(APITestCase):
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
        
        self.agent_user = User.objects.create_user(
            username='agent',
            email='agent@example.com',
            password='agentpass123',
            organization=self.organization,
            user_type=User.UserType.AGENT
        )
        
        # Créer une file d'attente
        self.queue = Queue.objects.create(
            name="Test Queue",
            organization=self.organization
        )
        
        # Créer des métriques de file d'attente
        self.queue_metrics = QueueMetrics.objects.create(
            queue=self.queue,
            date=timezone.now().date(),
            average_wait_time=timedelta(minutes=15),
            total_customers=100,
            served_customers=80,
            abandoned_customers=20,
            peak_hours=['09:00', '14:00', '17:00'],
            service_efficiency=0.8
        )
        
        # Créer des performances d'agent
        self.agent_performance = AgentPerformance.objects.create(
            agent=self.agent_user,
            date=timezone.now().date(),
            customers_served=50,
            average_service_time=timedelta(minutes=10),
            service_rating=4.5
        )
        
        # Créer un ticket
        self.ticket = Ticket.objects.create(
            queue=self.queue,
            customer=self.admin_user
        )
        
        # Créer un feedback client
        self.feedback = CustomerFeedback.objects.create(
            ticket=self.ticket,
            rating=4,
            comment="Good service",
            wait_time_satisfaction=3,
            service_satisfaction=4
        )

    def test_queue_metrics_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:queue-metrics-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_queue_metrics_aggregate(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:queue-metrics-aggregate')
        data = {
            'date_from': (timezone.now() - timedelta(days=7)).date().isoformat(),
            'date_to': timezone.now().date().isoformat(),
            'aggregate_by': 'day'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_queue_metrics_peak_hours(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:queue-metrics-peak-hours-analysis')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # 3 peak hours

    def test_agent_performance_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:agent-performance-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_agent_performance_aggregate(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:agent-performance-aggregate')
        data = {
            'date_from': (timezone.now() - timedelta(days=7)).date().isoformat(),
            'date_to': timezone.now().date().isoformat(),
            'aggregate_by': 'day',
            'metrics': ['customers_served', 'service_rating']
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_agent_performance_ranking(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:agent-performance-ranking')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('customers_served' in response.data)

    def test_customer_feedback_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:customer-feedback-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_customer_feedback_analyze(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:customer-feedback-analyze')
        data = {
            'date_from': (timezone.now() - timedelta(days=7)).date().isoformat(),
            'date_to': timezone.now().date().isoformat(),
            'group_by': 'rating',
            'include_comments': True
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_customer_feedback_summary(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('analytics:customer-feedback-summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('total_feedback' in response.data)
        self.assertTrue('average_rating' in response.data)

    def test_unauthorized_access(self):
        url = reverse('analytics:queue-metrics-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_agent_access_own_performance(self):
        self.client.force_authenticate(user=self.agent_user)
        url = reverse('analytics:agent-performance-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['agent'], self.agent_user.id)
