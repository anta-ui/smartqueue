from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportTemplateViewSet, ScheduledReportViewSet,
    GeneratedReportViewSet
)

app_name = 'reporting'

router = DefaultRouter()
router.register(r'templates', ReportTemplateViewSet, basename='template')
router.register(r'schedules', ScheduledReportViewSet, basename='schedule')
router.register(r'reports', GeneratedReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
