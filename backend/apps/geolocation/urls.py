from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserLocationViewSet, GeofencingZoneViewSet,
    GeofencingEventViewSet, LocationBasedServiceViewSet,
    ProximityAlertViewSet
)

app_name = 'geolocation'

router = DefaultRouter()
router.register(r'locations', UserLocationViewSet, basename='location')
router.register(r'zones', GeofencingZoneViewSet, basename='zone')
router.register(r'events', GeofencingEventViewSet, basename='event')
router.register(r'services', LocationBasedServiceViewSet, basename='service')
router.register(r'alerts', ProximityAlertViewSet, basename='alert')

urlpatterns = [
    path('', include(router.urls)),
]
