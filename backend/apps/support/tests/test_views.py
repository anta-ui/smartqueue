from datetime import timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.core.models import Organization
from ..models import SupportTicket, TicketMessage, FAQ, KnowledgeBase

User = get_user_model()

class SupportServiceTests(APITestCase):
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
        
        self.customer_user = User.objects.create_user(
            username='customer',
            email='customer@example.com',
            password='customerpass123',
            organization=self.organization,
            user_type=User.UserType.CUSTOMER
        )
        
        # Créer un ticket de support
        self.ticket = SupportTicket.objects.create(
            title="Test Ticket",
            description="Test description",
            organization=self.organization,
            created_by=self.customer_user,
            priority=SupportTicket.Priority.MEDIUM,
            category=SupportTicket.Category.TECHNICAL
        )
        
        # Créer une FAQ
        self.faq = FAQ.objects.create(
            organization=self.organization,
            question="Test Question",
            answer="Test Answer",
            category=FAQ.Category.GENERAL,
            created_by=self.admin_user
        )
        
        # Créer un article de base de connaissances
        self.article = KnowledgeBase.objects.create(
            organization=self.organization,
            title="Test Article",
            slug="test-article",
            category=KnowledgeBase.Category.GUIDE,
            content="Test content",
            created_by=self.admin_user
        )

    def test_ticket_creation(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('support:ticket-list')
        data = {
            'title': 'New Ticket',
            'description': 'New description',
            'priority': SupportTicket.Priority.HIGH,
            'category': SupportTicket.Category.TECHNICAL
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SupportTicket.objects.count(), 2)
        self.assertEqual(TicketMessage.objects.count(), 1)

    def test_ticket_reply(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('support:ticket-reply', args=[self.ticket.id])
        data = {
            'content': 'Staff reply',
            'is_internal': False
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TicketMessage.objects.count(), 1)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, SupportTicket.Status.IN_PROGRESS)

    def test_ticket_assignment(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('support:ticket-assign', args=[self.ticket.id])
        data = {
            'assigned_to': self.staff_user.id,
            'note': 'Please handle this ticket'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.assigned_to, self.staff_user)
        self.assertEqual(self.ticket.status, SupportTicket.Status.ASSIGNED)

    def test_ticket_status_update(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('support:ticket-change-status', args=[self.ticket.id])
        data = {
            'status': SupportTicket.Status.RESOLVED,
            'note': 'Issue has been resolved'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, SupportTicket.Status.RESOLVED)

    def test_ticket_rating(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('support:ticket-rate', args=[self.ticket.id])
        data = {
            'rating': 5,
            'feedback': 'Great service!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.satisfaction_rating, 5)
        self.assertEqual(self.ticket.feedback, 'Great service!')

    def test_faq_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('support:faq-list')
        data = {
            'question': 'New FAQ Question',
            'answer': 'New FAQ Answer',
            'category': FAQ.Category.TECHNICAL
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FAQ.objects.count(), 2)

    def test_faq_feedback(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('support:faq-feedback', args=[self.faq.id])
        data = {'is_helpful': True}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.faq.refresh_from_db()
        self.assertEqual(self.faq.helpful_count, 1)

    def test_knowledge_base_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('support:article-list')
        data = {
            'title': 'New Article',
            'category': KnowledgeBase.Category.TUTORIAL,
            'content': 'New article content'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(KnowledgeBase.objects.count(), 2)

    def test_knowledge_base_feedback(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('support:article-feedback', args=[self.article.slug])
        data = {'is_helpful': True}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.article.refresh_from_db()
        self.assertEqual(self.article.helpful_count, 1)

    def test_support_search(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('support:search-list')
        data = {
            'query': 'Test',
            'ticket_status': [SupportTicket.Status.NEW],
            'ticket_category': [SupportTicket.Category.TECHNICAL],
            'faq_category': [FAQ.Category.GENERAL],
            'kb_category': [KnowledgeBase.Category.GUIDE]
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['tickets']), 1)
        self.assertEqual(len(response.data['faqs']), 1)
        self.assertEqual(len(response.data['articles']), 1)

    def test_unauthorized_access(self):
        url = reverse('support:ticket-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_access_internal_notes(self):
        self.client.force_authenticate(user=self.staff_user)
        
        # Créer une note interne
        message = TicketMessage.objects.create(
            ticket=self.ticket,
            sender=self.staff_user,
            content="Internal note",
            is_internal=True
        )
        
        url = reverse('support:ticket-detail', args=[self.ticket.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['messages']), 1)

    def test_customer_cannot_see_internal_notes(self):
        self.client.force_authenticate(user=self.customer_user)
        
        # Créer une note interne
        message = TicketMessage.objects.create(
            ticket=self.ticket,
            sender=self.staff_user,
            content="Internal note",
            is_internal=True
        )
        
        url = reverse('support:ticket-detail', args=[self.ticket.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['messages']), 0)
