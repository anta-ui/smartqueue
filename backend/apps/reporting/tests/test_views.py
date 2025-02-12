import os
from datetime import datetime, timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.core.models import Organization
from ..models import ReportTemplate, ScheduledReport, GeneratedReport

User = get_user_model()

class ReportingServiceTests(APITestCase):
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
        
        # Créer un modèle de rapport
        self.template = ReportTemplate.objects.create(
            name="Test Template",
            organization=self.organization,
            report_type=ReportTemplate.ReportType.QUEUE_PERFORMANCE,
            format=ReportTemplate.Format.PDF,
            parameters={
                'queue_ids': {'type': 'array', 'required': True},
                'date_range': {'type': 'object', 'required': True}
            }
        )
        
        # Créer un rapport programmé
        self.schedule = ScheduledReport.objects.create(
            template=self.template,
            name="Test Schedule",
            frequency=ScheduledReport.Frequency.DAILY,
            parameters={
                'queue_ids': [1, 2, 3],
                'date_range': {
                    'start': '2025-01-01',
                    'end': '2025-01-31'
                }
            },
            recipients=['test@example.com'],
            next_run=timezone.now() + timedelta(days=1),
            created_by=self.admin_user
        )

    def test_template_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('reporting:template-list')
        data = {
            'name': 'New Template',
            'report_type': ReportTemplate.ReportType.AGENT_PERFORMANCE,
            'format': ReportTemplate.Format.EXCEL,
            'parameters': {
                'agent_ids': {'type': 'array', 'required': True},
                'metrics': {'type': 'array', 'required': True}
            }
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ReportTemplate.objects.count(), 2)

    def test_template_preview(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('reporting:template-preview', args=[self.template.id])
        data = {
            'parameters': {
                'queue_ids': [1, 2, 3],
                'date_range': {
                    'start': '2025-01-01',
                    'end': '2025-01-31'
                }
            }
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_schedule_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('reporting:schedule-list')
        data = {
            'template': self.template.id,
            'name': 'New Schedule',
            'frequency': ScheduledReport.Frequency.WEEKLY,
            'parameters': {
                'queue_ids': [1, 2, 3],
                'date_range': {
                    'start': '2025-01-01',
                    'end': '2025-01-31'
                }
            },
            'recipients': ['test@example.com']
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ScheduledReport.objects.count(), 2)

    def test_schedule_run_now(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('reporting:schedule-run-now', args=[self.schedule.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(GeneratedReport.objects.exists())

    def test_report_generation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('reporting:report-list')
        data = {
            'template': self.template.id,
            'name': 'Test Report',
            'parameters': {
                'queue_ids': [1, 2, 3],
                'date_range': {
                    'start': '2025-01-01',
                    'end': '2025-01-31'
                }
            }
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(GeneratedReport.objects.count(), 1)

    def test_report_download(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un rapport généré avec un fichier
        report = GeneratedReport.objects.create(
            template=self.template,
            name="Test Report",
            parameters={},
            status=GeneratedReport.Status.COMPLETED,
            generated_by=self.admin_user,
            file=SimpleUploadedFile(
                "test_report.pdf",
                b"file_content",
                content_type="application/pdf"
            )
        )
        
        url = reverse('reporting:report-download', args=[report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.get('Content-Disposition'),
            f'attachment; filename="{report.name}.pdf"'
        )

    def test_unauthorized_access(self):
        url = reverse('reporting:template-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_access_reports(self):
        self.client.force_authenticate(user=self.staff_user)
        
        # Créer un rapport
        report = GeneratedReport.objects.create(
            template=self.template,
            name="Staff Report",
            parameters={},
            generated_by=self.staff_user
        )
        
        url = reverse('reporting:report-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def tearDown(self):
        # Nettoyer les fichiers créés pendant les tests
        for report in GeneratedReport.objects.all():
            if report.file:
                if os.path.exists(report.file.path):
                    os.remove(report.file.path)
