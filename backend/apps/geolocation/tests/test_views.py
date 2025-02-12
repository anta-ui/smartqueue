from django.test import TestCase
from django.urls import reverse
from django.contrib.gis.geos import Point, Polygon
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.core.models import Organization
from ..models import (
    UserLocation, GeofencingZone, GeofencingEvent,
    LocationBasedService, ProximityAlert
)

User = get_user_model()

class GeolocationServiceTests(APITestCase):
    def setUp(self):
        # Créer une organisation
        self.organization = Organization.objects.create(
            name="Test Org",
            subscription_type=Organization.SubscriptionType.FREE
        )
        
        # Créer des utilisateurs
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            organization=self.organization,
            user_type=User.UserType.ADMIN
        )
        
        self.client_user = User.objects.create_user(
            username='client',
            email='client@example.com',
            password='clientpass123'
        )
        
        # Créer une zone de géofencing
        self.zone = GeofencingZone.objects.create(
            name="Test Zone",
            organization=self.organization,
            zone_type=GeofencingZone.ZoneType.ENTRY,
            polygon=Polygon([
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0]
            ])
        )
        
        # Créer un service basé sur la localisation
        self.service = LocationBasedService.objects.create(
            name="Test Service",
            organization=self.organization,
            service_type=LocationBasedService.ServiceType.QUEUE,
            location=Point(0.5, 0.5),
            radius=1000
        )

    def test_user_location_creation(self):
        self.client.force_authenticate(user=self.client_user)
        url = reverse('geolocation:location-list')
        data = {
            'latitude': 0.5,
            'longitude': 0.5,
            'accuracy': 10,
            'connection_type': 'wifi'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserLocation.objects.count(), 1)
        
        # Vérifier la création d'un événement de géofencing
        self.assertEqual(GeofencingEvent.objects.count(), 1)
        event = GeofencingEvent.objects.first()
        self.assertEqual(event.event_type, GeofencingEvent.EventType.ENTER)

    def test_geofencing_zone_creation(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('geolocation:zone-list')
        data = {
            'name': 'New Zone',
            'zone_type': GeofencingZone.ZoneType.ENTRY,
            'coordinates': [[[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]]]
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(GeofencingZone.objects.count(), 2)

    def test_geofencing_events_list(self):
        self.client.force_authenticate(user=self.client_user)
        
        # Créer un événement
        event = GeofencingEvent.objects.create(
            user=self.client_user,
            zone=self.zone,
            event_type=GeofencingEvent.EventType.ENTER,
            location=Point(0.5, 0.5)
        )
        
        url = reverse('geolocation:event-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_location_based_service_filtering(self):
        self.client.force_authenticate(user=self.client_user)
        url = reverse('geolocation:service-list')
        
        # Créer un autre service plus éloigné
        far_service = LocationBasedService.objects.create(
            name="Far Service",
            organization=self.organization,
            service_type=LocationBasedService.ServiceType.QUEUE,
            location=Point(10, 10),
            radius=1000
        )
        
        # Rechercher les services proches d'un point
        response = self.client.get(
            f"{url}?latitude=0.5&longitude=0.5&radius=2000"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Service')

    def test_proximity_alert_creation(self):
        self.client.force_authenticate(user=self.client_user)
        url = reverse('geolocation:alert-list')
        data = {
            'service': self.service.id,
            'alert_type': ProximityAlert.AlertType.QUEUE,
            'radius': 1000
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProximityAlert.objects.count(), 1)

    def test_proximity_alert_resolution(self):
        self.client.force_authenticate(user=self.client_user)
        
        # Créer une alerte
        alert = ProximityAlert.objects.create(
            user=self.client_user,
            service=self.service,
            alert_type=ProximityAlert.AlertType.QUEUE,
            radius=1000,
            is_active=True
        )
        
        url = reverse('geolocation:alert-resolve', args=[alert.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        alert.refresh_from_db()
        self.assertFalse(alert.is_active)
        self.assertIsNotNone(alert.resolved_at)

    def test_service_load_update(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('geolocation:service-update-load', args=[self.service.id])
        data = {'current_load': 5}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.service.refresh_from_db()
        self.assertEqual(self.service.current_load, 5)
