# smartqueue/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView, SpectacularSwaggerView,
    SpectacularRedocView
)
from rest_framework_simplejwt.views import TokenRefreshView
from apps.core.views.auth import CustomTokenObtainPairView
from apps.core.views.super_admin import (
    SuperAdminOrganizationDetailView, 
    SuperAdminOrganizationGeneralInfoView,
    OrganizationTechnicalConfigView
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Authentication
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Core API Routes
    path('api/', include('apps.core.urls.api', namespace='api')),
    
    # Super Admin API Routes (with consistent prefix)
    path('api/super-admin/', include('apps.core.urls.super_admin', namespace='api_super_admin')),
    
    # Other API modules
    path('api/support/', include('apps.support.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/queues/', include('apps.queues.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/geolocation/', include('apps.geolocation.urls')),
    
    # Route pour les détails de l'organisation
    path('api/super-admin/organizations/<int:pk>/', 
         SuperAdminOrganizationDetailView.as_view(), 
         name='super-admin-organization-detail'),
    
    # Route pour les informations générales
    path('api/super-admin/organizations/<int:organization_id>/general/', 
         SuperAdminOrganizationGeneralInfoView.as_view(), 
         name='super-admin-organization-general-info'),
    path('api/super-admin/organizations/<int:pk>/technical-config/', 
         OrganizationTechnicalConfigView.as_view(), 
         name='super-admin-organization-technical-config'),
    path('api/super-admin/organizations/<int:organization_id>/general-info/', 
         SuperAdminOrganizationGeneralInfoView.as_view(), 
         name='super-admin-organization-general-info'),
    
    # Route pour la configuration technique 
    path('api/super-admin/organizations/<int:organization_id>/technical-config/', OrganizationTechnicalConfigView.as_view(), name='organization-technical-config'),
    
    # Ajoutez cette URL pour les utilisateurs non super-admin
    path('api/organizations/<int:organization_id>/technical-config/', OrganizationTechnicalConfigView.as_view(), name='organization-technical-config-regular'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)