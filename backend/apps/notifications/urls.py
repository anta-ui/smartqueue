from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationTemplateViewSet, NotificationChannelViewSet,
    NotificationPreferenceViewSet, NotificationViewSet,
    NotificationBatchViewSet
)

app_name = 'notifications'

router = DefaultRouter()
router.register(r'templates', NotificationTemplateViewSet, basename='template')
router.register(r'channels', NotificationChannelViewSet, basename='channel')
router.register(r'preferences', NotificationPreferenceViewSet, basename='preference')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'batches', NotificationBatchViewSet, basename='batch')

urlpatterns = [
    path('', include(router.urls)),
]
