from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QueueTypeViewSet, QueueViewSet, ServicePointViewSet,
    TicketViewSet, VehicleCategoryViewSet, QueueAnalyticsViewSet,
    QueueNotificationViewSet
)

app_name = 'queues'

router = DefaultRouter()
router.register(r'queue-types', QueueTypeViewSet, basename='queue-type')
router.register(r'queues', QueueViewSet, basename='queue')
router.register(r'service-points', ServicePointViewSet, basename='service-point')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'vehicle-categories', VehicleCategoryViewSet, basename='vehicle-category')
router.register(r'analytics', QueueAnalyticsViewSet, basename='analytics')
router.register(r'notifications', QueueNotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]