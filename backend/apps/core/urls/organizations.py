# apps/core/urls/organizations.py
from django.urls import path, re_path
from rest_framework.routers import DefaultRouter
from apps.core.views.organization import (
    OrganizationViewSet,
    OrganizationDetailView,
    OrganizationContactsView,
    # ... autres imports
)

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')

urlpatterns = [
    path('', include(router.urls)),
    
    # Utiliser re_path avec une regex pour s'assurer que pk est un nombre
    re_path(r'^organizations/(?P<pk>\d+)/$', 
            OrganizationDetailView.as_view(), 
            name='organization-detail'),
            
    # Autres routes avec validation des paramètres
    re_path(r'^organizations/(?P<organization_id>\d+)/contacts/$', 
            OrganizationContactsView.as_view(), 
            name='organization-contacts'),
    
    # ... autres routes
]