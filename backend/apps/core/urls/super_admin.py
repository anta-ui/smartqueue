# apps/core/urls/super_admin.py
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from ..views.super_admin import (
    SuperAdminDashboardView,
    OrganizationManagementViewSet,
    SystemSettingViewSet,
    SystemAlertViewSet,
    MaintenanceScheduleViewSet,
    SystemBackupViewSet,
    SystemAuditLogViewSet
)
from ..views.organization import (
    OrganizationContactsView,
    OrganizationBranchesView,
    OrganizationApiKeysView,
    OrganizationWebhooksView,
    OrganizationLimitsView,
    OrganizationFinancialStatusView,
    OrganizationInvoicesView,
    OrganizationCreditsView,
    OrganizationFinancialReportsView,
    OrganizationDocumentsView,
    OrganizationHistoryView,
    OrganizationApiKeysView
)
from ..views.organization import (
    OrganizationViewSet, 
    OrganizationApiKeysView
)
from ..views.organization import OrganizationTechnicalConfigView
# Namespace for super admin routes
app_name = 'api_super_admin'

# Router for viewsets
router = DefaultRouter()
router.register(r'organizations', OrganizationManagementViewSet, basename='super-admin-organization')
router.register(r'settings', SystemSettingViewSet, basename='system-setting')
router.register(r'alerts', SystemAlertViewSet, basename='system-alert')
router.register(r'maintenance', MaintenanceScheduleViewSet, basename='maintenance-schedule')
router.register(r'backups', SystemBackupViewSet, basename='system-backup')
router.register(r'audit-logs', SystemAuditLogViewSet, basename='system-audit-log')

urlpatterns = [
    # Dashboard
    path('dashboard/', SuperAdminDashboardView.as_view(), name='super-admin-dashboard'),
    
    # Router URLs
    path('', include(router.urls)),
    
    # Organization-specific routes with consistent prefix
    re_path(r'^organizations/(?P<organization_id>\d+)/contacts/$', 
            OrganizationContactsView.as_view(), name='organization-contacts'),
    re_path(r'^organizations/(?P<organization_id>\d+)/branches/$', 
            OrganizationBranchesView.as_view(), name='organization-branches'),
    re_path(
        r'^organizations/(?P<organization_id>\d+)/api-keys/$', 
        OrganizationApiKeysView.as_view(), 
        name='organization-api-keys'
    ),
    
    # Routes pour les webhooks
    re_path(
        r'^organizations/(?P<organization_id>\d+)/webhooks/$', 
        OrganizationWebhooksView.as_view(), 
        name='organization-webhooks'
    ),
    
    # Routes pour les limites
    re_path(
        r'^organizations/(?P<organization_id>\d+)/limits/$', 
        OrganizationLimitsView.as_view(), 
        name='organization-limits'
    ),
    re_path(
        r'^organizations/(?P<organization_id>\d+)/technical-config/$', 
        OrganizationTechnicalConfigView.as_view(), 
        name='organization-technical-config'
    ),
    
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/payment-status/$', 
            OrganizationFinancialStatusView.as_view(), name='organization-financial-status'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/invoices/$', 
            OrganizationInvoicesView.as_view(), name='organization-invoices'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/credits/$', 
            OrganizationCreditsView.as_view(), name='organization-credits'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/reports/$', 
            OrganizationFinancialReportsView.as_view(), name='organization-financial-reports'),
    re_path(r'^organizations/(?P<organization_id>\d+)/documents/$', 
            OrganizationDocumentsView.as_view(), name='organization-documents'),
    re_path(r'^organizations/(?P<organization_id>\d+)/history/$', 
            OrganizationHistoryView.as_view(), name='organization-history'),
    
]