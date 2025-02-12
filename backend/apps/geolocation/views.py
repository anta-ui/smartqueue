from django.shortcuts import render
from django.utils import timezone
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance
from django.db.models import F
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsOrganizationMember, IsOrganizationAdmin
from .models import (
    UserLocation, GeofencingZone, GeofencingEvent,
    LocationBasedService, ProximityAlert
)
from .serializers import (
    UserLocationSerializer, GeofencingZoneSerializer,
    GeofencingEventSerializer, LocationBasedServiceSerializer,
    ProximityAlertSerializer
)

class UserLocationViewSet(mixins.CreateModelMixin,
                         mixins.RetrieveModelMixin,
                         mixins.ListModelMixin,
                         viewsets.GenericViewSet):
    serializer_class = UserLocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserLocation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        location = serializer.save(user=self.request.user)
        
        # Vérifier les zones de géofencing
        zones = GeofencingZone.objects.filter(
            is_active=True,
            polygon__contains=location.location
        )
        
        for zone in zones:
            # Vérifier si l'utilisateur est déjà dans la zone
            last_event = GeofencingEvent.objects.filter(
                user=self.request.user,
                zone=zone
            ).order_by('-timestamp').first()
            
            if not last_event or last_event.event_type == GeofencingEvent.EventType.EXIT:
                # Créer un événement d'entrée
                GeofencingEvent.objects.create(
                    user=self.request.user,
                    zone=zone,
                    event_type=GeofencingEvent.EventType.ENTER,
                    location=location.location
                )
            elif (last_event.event_type == GeofencingEvent.EventType.ENTER and
                  zone.zone_type == GeofencingZone.ZoneType.DWELL):
                # Calculer le temps passé dans la zone
                dwell_time = (timezone.now() - last_event.timestamp).seconds
                if dwell_time >= zone.dwell_time:
                    GeofencingEvent.objects.create(
                        user=self.request.user,
                        zone=zone,
                        event_type=GeofencingEvent.EventType.DWELL,
                        location=location.location,
                        dwell_time=dwell_time
                    )
        
        # Vérifier les zones quittées
        active_zones = GeofencingEvent.objects.filter(
            user=self.request.user,
            event_type=GeofencingEvent.EventType.ENTER,
            zone__is_active=True
        ).exclude(
            zone__in=zones
        )
        
        for event in active_zones:
            GeofencingEvent.objects.create(
                user=self.request.user,
                zone=event.zone,
                event_type=GeofencingEvent.EventType.EXIT,
                location=location.location
            )
        
        # Vérifier les alertes de proximité
        alerts = ProximityAlert.objects.filter(
            user=self.request.user,
            is_active=True,
            resolved_at__isnull=True
        )
        
        for alert in alerts:
            service = alert.service
            if service.location.distance(location.location) * 100000 <= alert.radius:  # Convert to meters
                if not alert.triggered_at:
                    alert.triggered_at = timezone.now()
                    alert.save()
            elif alert.triggered_at:
                alert.resolved_at = timezone.now()
                alert.is_active = False
                alert.save()

class GeofencingZoneViewSet(viewsets.ModelViewSet):
    serializer_class = GeofencingZoneSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return GeofencingZone.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

class GeofencingEventViewSet(mixins.RetrieveModelMixin,
                            mixins.ListModelMixin,
                            viewsets.GenericViewSet):
    serializer_class = GeofencingEventSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.user_type in ['ADMIN', 'OWNER']:
            return GeofencingEvent.objects.filter(
                zone__organization=user.organization
            )
        return GeofencingEvent.objects.filter(user=user)

class LocationBasedServiceViewSet(viewsets.ModelViewSet):
    serializer_class = LocationBasedServiceSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        queryset = LocationBasedService.objects.filter(
            organization=self.request.user.organization
        )
        
        if self.action == 'list':
            # Filtrer par distance si la position est fournie
            latitude = self.request.query_params.get('latitude')
            longitude = self.request.query_params.get('longitude')
            radius = self.request.query_params.get('radius', 5000)  # Default 5km
            
            if latitude and longitude:
                user_location = Point(float(longitude), float(latitude))
                queryset = queryset.annotate(
                    distance=Distance('location', user_location)
                ).filter(
                    location__distance_lte=(user_location, D(m=radius))
                ).order_by('distance')
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def update_load(self, request, pk=None):
        service = self.get_object()
        current_load = request.data.get('current_load')
        
        if current_load is not None:
            service.current_load = max(0, min(current_load, service.capacity or float('inf')))
            service.save()
            return Response(LocationBasedServiceSerializer(service).data)
        
        return Response(
            {'error': 'current_load is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

class ProximityAlertViewSet(viewsets.ModelViewSet):
    serializer_class = ProximityAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProximityAlert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        alert = self.get_object()
        if not alert.resolved_at:
            alert.resolved_at = timezone.now()
            alert.is_active = False
            alert.save()
        return Response(ProximityAlertSerializer(alert).data)
