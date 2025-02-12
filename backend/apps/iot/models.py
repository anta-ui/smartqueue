from django.db import models
from django.utils.translation import gettext_lazy as _

class IoTDevice(models.Model):
    class DeviceType(models.TextChoices):
        SENSOR = 'SE', _('Sensor')
        DISPLAY = 'DI', _('Display')
        COUNTER = 'CO', _('Counter')
        BEACON = 'BE', _('Beacon')
        OTHER = 'OT', _('Other')
    
    class Status(models.TextChoices):
        ACTIVE = 'AC', _('Active')
        INACTIVE = 'IN', _('Inactive')
        MAINTENANCE = 'MA', _('Maintenance')
        ERROR = 'ER', _('Error')
    
    name = models.CharField(max_length=255)
    device_type = models.CharField(
        max_length=2,
        choices=DeviceType.choices
    )
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='iot_devices'
    )
    location = models.ForeignKey(
        'ar.Venue',
        on_delete=models.CASCADE,
        related_name='iot_devices'
    )
    mac_address = models.CharField(max_length=17, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    firmware_version = models.CharField(max_length=50)
    last_seen = models.DateTimeField(null=True, blank=True)
    battery_level = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('IoT device')
        verbose_name_plural = _('IoT devices')

    def __str__(self):
        return f"{self.name} - {self.get_device_type_display()}"

class DeviceReading(models.Model):
    device = models.ForeignKey(
        IoTDevice,
        on_delete=models.CASCADE,
        related_name='readings'
    )
    timestamp = models.DateTimeField()
    value = models.JSONField()
    is_anomaly = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('device reading')
        verbose_name_plural = _('device readings')
        indexes = [
            models.Index(fields=['device', 'timestamp'])
        ]

    def __str__(self):
        return f"{self.device.name} - {self.timestamp}"

class SmartDisplay(models.Model):
    device = models.OneToOneField(
        IoTDevice,
        on_delete=models.CASCADE,
        related_name='smart_display'
    )
    screen_size = models.CharField(max_length=50)
    resolution = models.CharField(max_length=50)
    orientation = models.CharField(
        max_length=1,
        choices=[('P', _('Portrait')), ('L', _('Landscape'))]
    )
    current_content = models.TextField(null=True, blank=True)
    last_content_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('smart display')
        verbose_name_plural = _('smart displays')

    def __str__(self):
        return f"Display for {self.device.name}"

class ARMarker(models.Model):
    class MarkerType(models.TextChoices):
        QR = 'QR', _('QR Code')
        IMAGE = 'IM', _('Image')
        OBJECT = 'OB', _('3D Object')
    
    name = models.CharField(max_length=255)
    marker_type = models.CharField(
        max_length=2,
        choices=MarkerType.choices
    )
    location = models.ForeignKey(
        'ar.Venue',
        on_delete=models.CASCADE,
        related_name='ar_markers'
    )
    content = models.FileField(upload_to='ar/markers/')
    position_x = models.FloatField()
    position_y = models.FloatField()
    position_z = models.FloatField()
    rotation = models.FloatField(default=0)
    scale = models.FloatField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('AR marker')
        verbose_name_plural = _('AR markers')

    def __str__(self):
        return f"{self.name} - {self.get_marker_type_display()}"

class NavigationPath(models.Model):
    name = models.CharField(max_length=255)
    start_point = models.ForeignKey(
        ARMarker,
        on_delete=models.CASCADE,
        related_name='paths_from'
    )
    end_point = models.ForeignKey(
        ARMarker,
        on_delete=models.CASCADE,
        related_name='paths_to'
    )
    waypoints = models.JSONField(default=list)
    distance = models.FloatField()
    estimated_time = models.IntegerField(help_text=_('Estimated time in seconds'))
    is_accessible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('navigation path')
        verbose_name_plural = _('navigation paths')

    def __str__(self):
        return f"Path from {self.start_point.name} to {self.end_point.name}"

class EnvironmentalMetric(models.Model):
    class MetricType(models.TextChoices):
        ENERGY = 'EN', _('Energy Consumption')
        CARBON = 'CA', _('Carbon Footprint')
        WATER = 'WA', _('Water Usage')
        WASTE = 'WS', _('Waste')
    
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='environmental_metrics'
    )
    metric_type = models.CharField(
        max_length=2,
        choices=MetricType.choices
    )
    value = models.FloatField()
    unit = models.CharField(max_length=50)
    timestamp = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('environmental metric')
        verbose_name_plural = _('environmental metrics')
        indexes = [
            models.Index(fields=['organization', 'metric_type', 'timestamp'])
        ]

    def __str__(self):
        return f"{self.organization.name} - {self.get_metric_type_display()}"
