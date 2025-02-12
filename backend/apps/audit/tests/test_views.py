import os
from datetime import datetime, timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.contenttypes.models import ContentType
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.core.models import Organization
from ..models import AuditLog, AuditPolicy, AuditExport

User = get_user_model()

class AuditServiceTests(APITestCase):
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
        
        # Créer une politique d'audit
        self.policy = AuditPolicy.objects.create(
            organization=self.organization,
            enabled_categories=[
                AuditLog.Category.AUTHENTICATION,
                AuditLog.Category.DATA
            ],
            min_severity=AuditLog.Severity.INFO,
            retention_period=90,
            retention_unit=AuditPolicy.RetentionUnit.DAYS,
            notify_on_severity=AuditLog.Severity.ERROR,
            notification_emails=['admin@example.com']
        )
        
        # Créer des logs d'audit
        self.audit_log = AuditLog.objects.create(
            action_type=AuditLog.ActionType.CREATE,
            category=AuditLog.Category.DATA,
            severity=AuditLog.Severity.INFO,
            actor=self.admin_user,
            organization=self.organization,
            description="Test audit log",
            details={'key': 'value'}
        )

    def test_audit_log_list(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('audit:log-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_audit_log_search(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('audit:log-search')
        data = {
            'date_from': (timezone.now() - timedelta(days=1)).isoformat(),
            'date_to': timezone.now().isoformat(),
            'action_types': [AuditLog.ActionType.CREATE],
            'categories': [AuditLog.Category.DATA],
            'severities': [AuditLog.Severity.INFO]
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_audit_log_summary(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('audit:log-summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_logs'], 1)
        self.assertEqual(
            response.data['action_summary'][AuditLog.ActionType.CREATE],
            1
        )

    def test_audit_policy_update(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('audit:policy-detail', args=[self.policy.id])
        data = {
            'enabled_categories': [
                AuditLog.Category.AUTHENTICATION,
                AuditLog.Category.SECURITY
            ],
            'min_severity': AuditLog.Severity.WARNING,
            'retention_period': 180,
            'retention_unit': AuditPolicy.RetentionUnit.DAYS,
            'notify_on_severity': AuditLog.Severity.ERROR,
            'notification_emails': ['admin@example.com', 'security@example.com']
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.policy.refresh_from_db()
        self.assertEqual(self.policy.retention_period, 180)

    def test_audit_policy_clean_old_logs(self):
        # Créer un vieux log
        old_log = AuditLog.objects.create(
            action_type=AuditLog.ActionType.CREATE,
            category=AuditLog.Category.DATA,
            severity=AuditLog.Severity.INFO,
            actor=self.admin_user,
            organization=self.organization,
            description="Old audit log",
            details={'key': 'value'}
        )
        old_log.created_at = timezone.now() - timedelta(days=100)
        old_log.save()
        
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('audit:policy-clean-old-logs', args=[self.policy.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 1)

    def test_audit_export_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('audit:export-list')
        data = {
            'date_from': (timezone.now() - timedelta(days=1)).isoformat(),
            'date_to': timezone.now().isoformat(),
            'categories': [AuditLog.Category.DATA],
            'min_severity': AuditLog.Severity.INFO,
            'format': AuditExport.Format.CSV
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AuditExport.objects.count(), 1)

    def test_audit_export_download(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Créer un export avec un fichier
        export = AuditExport.objects.create(
            organization=self.organization,
            requested_by=self.admin_user,
            date_from=timezone.now() - timedelta(days=1),
            date_to=timezone.now(),
            categories=[AuditLog.Category.DATA],
            min_severity=AuditLog.Severity.INFO,
            format=AuditExport.Format.CSV,
            status=AuditExport.Status.COMPLETED,
            file=SimpleUploadedFile(
                "audit_export.csv",
                b"test,data\n1,2",
                content_type="text/csv"
            )
        )
        
        url = reverse('audit:export-download', args=[export.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.get('Content-Disposition'),
            f'attachment; filename="audit_export_{export.created_at:%Y%m%d_%H%M}.csv"'
        )

    def test_unauthorized_access(self):
        url = reverse('audit:log-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_access_logs(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('audit:log-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_staff_cannot_modify_policy(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('audit:policy-detail', args=[self.policy.id])
        data = {'retention_period': 180}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def tearDown(self):
        # Nettoyer les fichiers créés pendant les tests
        for export in AuditExport.objects.all():
            if export.file:
                if os.path.exists(export.file.path):
                    os.remove(export.file.path)
