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
    LogoutView
)
from .views.organization import (
    OrganizationMemberListView,
    OrganizationAddMemberView,
    OrganizationRemoveMemberView
)
from .views.dashboard import (  # Nouveau import
    ServiceStatusView,
    MetricsView,
    UsageView
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


app_name = 'core'

router = DefaultRouter()
router.register(r'security-keys', SecurityKeyViewSet, basename='security_key')

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
    
    # Organization
    path('organization/members/', OrganizationMemberListView.as_view(), name='organization-members'),
    path('organization/members/add/', OrganizationAddMemberView.as_view(), name='organization-add-member'),
    path('organization/members/remove/', OrganizationRemoveMemberView.as_view(), name='organization-remove-member'),
    
    # Consent
    path('consent/', UserConsentListView.as_view(), name='consent-list'),
    path('consent/create/', UserConsentCreateView.as_view(), name='consent-create'),
    path('consent/bulk-update/', UserConsentBulkUpdateView.as_view(), name='consent-bulk-update'),
    
    # Dashboard et API
    
    path('dashboard/organization-locations/', OrganizationLocationsView.as_view(), name='organization-locations'),
    path('dashboard/stats', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/alerts', AlertsView.as_view(), name='dashboard-alerts'),
    path('dashboard/services/status', ServiceStatusView.as_view(), name='services-status'),
    path('dashboard/usage-trends', UsageView.as_view(), name='usage-trends'),
    # API Router
    path('', include(router.urls)),
     
]
