from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuditLogViewSet, AuditPolicyViewSet,
    AuditExportViewSet
)

app_name = 'audit'

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='log')
router.register(r'policies', AuditPolicyViewSet, basename='policy')
router.register(r'exports', AuditExportViewSet, basename='export')

urlpatterns = [
    path('', include(router.urls)),
]
