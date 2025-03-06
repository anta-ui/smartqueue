from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views.auth import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    TOTPSetupView,
    TOTPVerifyView,
    BiometricRegistrationView,
    BiometricVerificationView,
    SecurityKeyViewSet,
    LogoutView,
)
from .views.dashboard import (
    ServiceStatusView,
    MetricsView,
    UsageView,
    SuperAdminDashboardView
)
from .views import (
    DashboardStatsView,
    OrganizationLocationsView,
    AlertsView
)
from .views.consent import (
    UserConsentCreateView,
    UserConsentBulkUpdateView,
    UserConsentListView
)
from apps.core.views.organization import OrganizationViewSet,OrganizationDetailView
from apps.core.views.organization_branch import OrganizationBranchViewSet


app_name = 'core'
router = DefaultRouter()
router.register(r'security-keys', SecurityKeyViewSet, basename='security_key')
router.register(r'organizations', OrganizationViewSet, basename='organizations')
router.register(r'organization-branches', OrganizationBranchViewSet, basename='organizationbranch')

from .views import (
    InvoiceViewSet, 
    OrganizationCreditViewSet, 
    FinancialReportViewSet
)
from .views.technical import ApiKeyViewSet, WebhookViewSet
router = DefaultRouter()
router.register(r'api-keys', ApiKeyViewSet, basename='api-key')
router.register(r'webhooks', WebhookViewSet, basename='webhook')

router = DefaultRouter()
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
    path('super-admin/dashboard/', SuperAdminDashboardView.as_view(), name='super_admin_dashboard'),
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
    
    # Dashboard et API
    path('dashboard/organization-locations/', OrganizationLocationsView.as_view(), name='organization-locations'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/alerts', AlertsView.as_view(), name='dashboard-alerts'),
    path('dashboard/services/status', ServiceStatusView.as_view(), name='services-status'),
    path('dashboard/usage-trends', UsageView.as_view(), name='usage-trends'),
    path('organizations/<int:pk>/', OrganizationDetailView.as_view(), name='organization-detail'),

    
    # API Router
    path('', include(router.urls)),
]
print("Routes disponibles:", [str(url) for url in router.urls])

from .views.organization import (
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
    DashboardView,
    OrganizationListView,
    OrganizationGeneralView,
    OrganizationTechnicalConfigView,
    OrganizationUsageView,
    OrganizationFinancialView
)

# Création du routeur pour les vues basées sur ViewSet
router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')

# URLs pour les vues basées sur APIView
urlpatterns += [
    # Routes d'authentification
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Routes existantes
    path('', include(router.urls)),
    
    # Routes pour les organisations normales
    path('organizations/<int:pk>/', OrganizationDetailView.as_view(), name='organization-detail-normal'),
    path('organizations/<int:organization_id>/contacts/', OrganizationContactsView.as_view(), name='organization-contacts-normal'),
    path('organizations/<int:organization_id>/branches/', OrganizationBranchesView.as_view(), name='organization-branches-normal'),
    path('organizations/<int:organization_id>/api-keys/', OrganizationApiKeysView.as_view(), name='organization-api-keys-normal'),
    path('organizations/<int:organization_id>/webhooks/', OrganizationWebhooksView.as_view(), name='organization-webhooks-normal'),
    path('organizations/<int:organization_id>/limits/', OrganizationLimitsView.as_view(), name='organization-limits-normal'),
    path('organizations/<int:organization_id>/financial/payment-status/', OrganizationFinancialStatusView.as_view(), name='organization-financial-status-normal'),
    path('organizations/<int:organization_id>/financial/invoices/', OrganizationInvoicesView.as_view(), name='organization-invoices-normal'),
    path('organizations/<int:organization_id>/financial/credits/', OrganizationCreditsView.as_view(), name='organization-credits-normal'),
    path('organizations/<int:organization_id>/financial/reports/', OrganizationFinancialReportsView.as_view(), name='organization-financial-reports-normal'),
    path('organizations/<int:organization_id>/documents/', OrganizationDocumentsView.as_view(), name='organization-documents-normal'),
    path('organizations/<int:organization_id>/history/', OrganizationHistoryView.as_view(), name='organization-history-normal'),
    
    # Nouvelles routes pour le super-admin
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('organizations/', OrganizationListView.as_view(), name='organization-list'),
    path('organizations/<int:pk>/', OrganizationDetailView.as_view(), name='organization-detail'),
    
    # Routes pour les détails d'une organisation (super-admin)
    path('organizations/<int:organization_id>/contacts/', OrganizationContactsView.as_view(), name='organization-contacts'),
    path('organizations/<int:organization_id>/branches/', OrganizationBranchesView.as_view(), name='organization-branches'),
    path('organizations/<int:organization_id>/api-keys/', OrganizationApiKeysView.as_view(), name='organization-api-keys'),
    path('organizations/<int:organization_id>/webhooks/', OrganizationWebhooksView.as_view(), name='organization-webhooks'),
    path('organizations/<int:organization_id>/limits/', OrganizationLimitsView.as_view(), name='organization-limits'),
    path('organizations/<int:organization_id>/financial/payment-status/', OrganizationFinancialStatusView.as_view(), name='organization-financial-status'),
    path('organizations/<int:organization_id>/financial/invoices/', OrganizationInvoicesView.as_view(), name='organization-invoices'),
    path('organizations/<int:organization_id>/financial/credits/', OrganizationCreditsView.as_view(), name='organization-credits'),
    path('organizations/<int:organization_id>/financial/reports/', OrganizationFinancialReportsView.as_view(), name='organization-financial-reports'),
    path('organizations/<int:organization_id>/documents/', OrganizationDocumentsView.as_view(), name='organization-documents'),
    path('organizations/<int:organization_id>/history/', OrganizationHistoryView.as_view(), name='organization-history'),
    path('api/super-admin/organizations/<int:pk>/general/', OrganizationGeneralView.as_view(), name='organization-general'),
    path('api/super-admin/organizations/<int:pk>/technical-config/', OrganizationTechnicalConfigView.as_view(), name='organization-technical-config'),
    path('api/super-admin/organizations/<int:pk>/usage/', OrganizationUsageView.as_view(), name='organization-usage'),
    path('api/super-admin/organizations/<int:pk>/financial/', OrganizationFinancialView.as_view(), name='organization-financial'),
]