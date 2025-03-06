from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from apps.core.views.auth import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    TOTPSetupView,
    TOTPVerifyView,
    BiometricRegistrationView,
    BiometricVerificationView,
    SecurityKeyViewSet,
    LogoutView,
)
from apps.core.views.dashboard import (
    ServiceStatusView,
    MetricsView,
    UsageView,
)
from apps.core.views import (
    DashboardStatsView,
    OrganizationLocationsView,
    AlertsView,
    InvoiceViewSet, 
    OrganizationCreditViewSet, 
    FinancialReportViewSet
)
from apps.core.views.consent import (
    UserConsentCreateView,
    UserConsentBulkUpdateView,
    UserConsentListView
)
from apps.core.views.organization import (
    OrganizationViewSet,
    OrganizationDetailView,
    OrganizationContactsView,
    OrganizationBranchesView,
    OrganizationApiKeysView,
    OrganizationWebhooksView,
    OrganizationLimitsView,
    OrganizationFinancialStatusView,
    OrganizationInvoicesView,
    OrganizationCreditsView,
    OrganizationDocumentsView,
    OrganizationHistoryView,
    OrganizationFinancialReportsView,
)
from apps.core.views.organization_branch import OrganizationBranchViewSet
from apps.core.views.technical import ApiKeyViewSet, WebhookViewSet

app_name = 'api'

# Router pour l'API principale
router = DefaultRouter()
router.register(r'security-keys', SecurityKeyViewSet, basename='security-key')
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'organization-branches', OrganizationBranchViewSet, basename='organization-branch')
router.register(r'api-keys', ApiKeyViewSet, basename='api-key')
router.register(r'webhooks', WebhookViewSet, basename='webhook')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'credits', OrganizationCreditViewSet, basename='credit')
router.register(r'financial-reports', FinancialReportViewSet, basename='financial-report')

urlpatterns = [
    # Authentication
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # TOTP
    path('auth/totp/setup/', TOTPSetupView.as_view(), name='totp_setup'),
    path('auth/totp/verify/', TOTPVerifyView.as_view(), name='totp_verify'),
    
    # Security Keys
    path('auth/security-key/register/', SecurityKeyViewSet.as_view({'post': 'create'}), name='security_key_register'),
    path('auth/security-keys/', SecurityKeyViewSet.as_view({'get': 'list'}), name='security_key_list'),
    
    # Biometric
    path('auth/biometric/register/', BiometricRegistrationView.as_view(), name='biometric_register'),
    path('auth/biometric/verify/', BiometricVerificationView.as_view(), name='biometric_verify'),
    
    # Consent
    path('consent/', UserConsentListView.as_view(), name='consent-list'),
    path('consent/create/', UserConsentCreateView.as_view(), name='consent-create'),
    path('consent/bulk-update/', UserConsentBulkUpdateView.as_view(), name='consent-bulk-update'),
    
    # Dashboard
    path('dashboard/organization-locations/', OrganizationLocationsView.as_view(), name='organization-locations'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/alerts/', AlertsView.as_view(), name='dashboard-alerts'),
    path('dashboard/services/status/', ServiceStatusView.as_view(), name='services-status'),
    path('dashboard/usage-trends/', UsageView.as_view(), name='usage-trends'),
    
    # Validation des IDs numériques pour les URIs d'organisation
    re_path(r'^organizations/(?P<pk>\d+)/$', OrganizationDetailView.as_view(), name='organization-detail'),
    re_path(r'^organizations/(?P<organization_id>\d+)/contacts/$', OrganizationContactsView.as_view(), name='organization-contacts'),
    re_path(r'^organizations/(?P<organization_id>\d+)/branches/$', OrganizationBranchesView.as_view(), name='organization-branches'),
    re_path(r'^organizations/(?P<organization_id>\d+)/api-keys/$', OrganizationApiKeysView.as_view(), name='organization-api-keys'),
    re_path(r'^organizations/(?P<organization_id>\d+)/webhooks/$', OrganizationWebhooksView.as_view(), name='organization-webhooks'),
    re_path(r'^organizations/(?P<organization_id>\d+)/limits/$', OrganizationLimitsView.as_view(), name='organization-limits'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/payment-status/$', OrganizationFinancialStatusView.as_view(), name='organization-financial-status'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/invoices/$', OrganizationInvoicesView.as_view(), name='organization-invoices'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/credits/$', OrganizationCreditsView.as_view(), name='organization-credits'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/reports/$', OrganizationFinancialReportsView.as_view(), name='organization-financial-reports'),
    re_path(r'^organizations/(?P<organization_id>\d+)/documents/$', OrganizationDocumentsView.as_view(), name='organization-documents'),
    re_path(r'^organizations/(?P<organization_id>\d+)/history/$', OrganizationHistoryView.as_view(), name='organization-history'),
    
    # Router APIs
    path('', include(router.urls)),
]