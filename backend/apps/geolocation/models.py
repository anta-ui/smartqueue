from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point

class UserLocation(models.Model):
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='locations'
    )
    location = gis_models.PointField(
        help_text=_('Location coordinates (longitude, latitude)')
    )
    accuracy = models.FloatField(
        help_text=_('Accuracy of the location in meters'),
        null=True,
        blank=True
    )
    altitude = models.FloatField(
        help_text=_('Altitude in meters'),
        null=True,
        blank=True
    )
    speed = models.FloatField(
        help_text=_('Speed in meters per second'),
        null=True,
        blank=True
    )
    heading = models.FloatField(
        help_text=_('Heading in degrees'),
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    is_moving = models.BooleanField(default=False)
    battery_level = models.FloatField(
        help_text=_('Device battery level (0-1)'),
        null=True,
        blank=True
    )
    connection_type = models.CharField(
        max_length=10,
        choices=[
            ('wifi', _('WiFi')),
            ('cellular', _('Cellular')),
            ('none', _('No Connection'))
        ],
        default='none'
    )

    class Meta:
        verbose_name = _('user location')
        verbose_name_plural = _('user locations')
        indexes = [
            models.Index(fields=['user', 'timestamp'])
        ]

    def __str__(self):
        return f"{self.user.email} at {self.timestamp}"

    def save(self, *args, **kwargs):
        if not self.location and hasattr(self, 'latitude') and hasattr(self, 'longitude'):
            self.location = Point(self.longitude, self.latitude)
        super().save(*args, **kwargs)

class GeofencingZone(models.Model):
    class ZoneType(models.TextChoices):
        ENTRY = 'EN', _('Entry')
        EXIT = 'EX', _('Exit')
        DWELL = 'DW', _('Dwell')
        PARKING = 'PA', _('Parking')
        SERVICE = 'SE', _('Service')
    
    name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='geofencing_zones'
    )
    zone_type = models.CharField(
        max_length=2,
        choices=ZoneType.choices
    )
    polygon = gis_models.PolygonField(
        help_text=_('Zone boundaries')
    )
    radius = models.FloatField(
        help_text=_('Buffer radius in meters'),
        default=0
    )
    is_active = models.BooleanField(default=True)
    notification_enabled = models.BooleanField(default=True)
    dwell_time = models.IntegerField(
        help_text=_('Minimum time in seconds to trigger dwell event'),
        default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('geofencing zone')
        verbose_name_plural = _('geofencing zones')

    def __str__(self):
        return f"{self.name} - {self.get_zone_type_display()}"

class GeofencingEvent(models.Model):
    class EventType(models.TextChoices):
        ENTER = 'EN', _('Enter')
        EXIT = 'EX', _('Exit')
        DWELL = 'DW', _('Dwell')
    
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='geofencing_events'
    )
    zone = models.ForeignKey(
        GeofencingZone,
        on_delete=models.CASCADE,
        related_name='events'
    )
    event_type = models.CharField(
        max_length=2,
        choices=EventType.choices
    )
    location = gis_models.PointField()
    timestamp = models.DateTimeField(auto_now_add=True)
    dwell_time = models.IntegerField(
        help_text=_('Time spent in zone in seconds'),
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = _('geofencing event')
        verbose_name_plural = _('geofencing events')
        indexes = [
            models.Index(fields=['user', 'zone', 'timestamp'])
        ]

    def __str__(self):
        return f"{self.user.email} {self.get_event_type_display()} {self.zone.name}"

class LocationBasedService(models.Model):
    class ServiceType(models.TextChoices):
        QUEUE = 'QU', _('Queue')
        PARKING = 'PA', _('Parking')
        INFORMATION = 'IN', _('Information')
        ASSISTANCE = 'AS', _('Assistance')
    
    name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='location_services'
    )
    service_type = models.CharField(
        max_length=2,
        choices=ServiceType.choices
    )
    location = gis_models.PointField()
    radius = models.FloatField(
        help_text=_('Service coverage radius in meters')
    )
    is_active = models.BooleanField(default=True)
    operating_hours = models.JSONField(
        help_text=_('Operating hours by day of week'),
        default=dict
    )
    capacity = models.IntegerField(
        help_text=_('Maximum number of users that can be served'),
        null=True,
        blank=True
    )
    current_load = models.IntegerField(
        help_text=_('Current number of users being served'),
        default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('location-based service')
        verbose_name_plural = _('location-based services')

    def __str__(self):
        return f"{self.name} - {self.get_service_type_display()}"

class ProximityAlert(models.Model):
    class AlertType(models.TextChoices):
        QUEUE = 'QU', _('Queue Alert')
        PARKING = 'PA', _('Parking Alert')
        SERVICE = 'SE', _('Service Alert')
        CUSTOM = 'CU', _('Custom Alert')
    
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='proximity_alerts'
    )
    alert_type = models.CharField(
        max_length=2,
        choices=AlertType.choices
    )
    target_location = gis_models.PointField()
    radius = models.FloatField(
        help_text=_('Alert radius in meters')
    )
    message = models.TextField()
    is_active = models.BooleanField(default=True)
    one_time = models.BooleanField(
        default=True,
        help_text=_('If True, alert will be deactivated after first trigger')
    )
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    triggered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('proximity alert')
        verbose_name_plural = _('proximity alerts')

    def __str__(self):
        return f"{self.user.email} - {self.get_alert_type_display()}"
