from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QueueMetricsViewSet, AgentPerformanceViewSet,
    CustomerFeedbackViewSet
)

app_name = 'analytics'

router = DefaultRouter()
router.register(r'queue-metrics', QueueMetricsViewSet, basename='queue-metrics')
router.register(r'agent-performance', AgentPerformanceViewSet, basename='agent-performance')
router.register(r'customer-feedback', CustomerFeedbackViewSet, basename='customer-feedback')

urlpatterns = [
    path('', include(router.urls)),
]
