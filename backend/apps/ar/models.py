from django.db import models
from django.utils.translation import gettext_lazy as _

class ARMarker(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='ar_markers'
    )
    marker_image = models.ImageField(upload_to='ar/markers/')
    marker_data = models.JSONField(help_text=_('AR marker recognition data'))
    location_x = models.FloatField(help_text=_('X coordinate in the venue'))
    location_y = models.FloatField(help_text=_('Y coordinate in the venue'))
    location_z = models.FloatField(help_text=_('Z coordinate in the venue'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('AR marker')
        verbose_name_plural = _('AR markers')

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

class ARContent(models.Model):
    class ContentType(models.TextChoices):
        TEXT = 'TX', _('Text')
        IMAGE = 'IM', _('Image')
        VIDEO = 'VD', _('Video')
        MODEL_3D = '3D', _('3D Model')
        ANIMATION = 'AN', _('Animation')

    marker = models.ForeignKey(
        ARMarker,
        on_delete=models.CASCADE,
        related_name='contents'
    )
    content_type = models.CharField(
        max_length=2,
        choices=ContentType.choices
    )
    content = models.FileField(upload_to='ar/contents/')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    scale_x = models.FloatField(default=1.0)
    scale_y = models.FloatField(default=1.0)
    scale_z = models.FloatField(default=1.0)
    rotation_x = models.FloatField(default=0.0)
    rotation_y = models.FloatField(default=0.0)
    rotation_z = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('AR content')
        verbose_name_plural = _('AR contents')

    def __str__(self):
        return f"{self.marker.name} - {self.title}"

class Venue(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='venues'
    )
    floor_plan = models.ImageField(upload_to='ar/floor_plans/')
    width = models.FloatField(help_text=_('Venue width in meters'))
    length = models.FloatField(help_text=_('Venue length in meters'))
    height = models.FloatField(help_text=_('Venue height in meters'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('venue')
        verbose_name_plural = _('venues')

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

class NavigationPath(models.Model):
    venue = models.ForeignKey(
        Venue,
        on_delete=models.CASCADE,
        related_name='navigation_paths'
    )
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
    path_points = models.JSONField(help_text=_('List of coordinates forming the path'))
    distance = models.FloatField(help_text=_('Path length in meters'))
    estimated_time = models.DurationField(help_text=_('Estimated walking time'))
    is_accessible = models.BooleanField(default=True, help_text=_('Wheelchair accessible'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('navigation path')
        verbose_name_plural = _('navigation paths')

    def __str__(self):
        return f"{self.venue.name} - {self.start_point.name} to {self.end_point.name}"
