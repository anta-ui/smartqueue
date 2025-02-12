from django.db import models
from django.utils.translation import gettext_lazy as _

class MobileDevice(models.Model):
    class DeviceType(models.TextChoices):
        ANDROID = 'AN', _('Android')
        IOS = 'IO', _('iOS')
        HUAWEI = 'HU', _('Huawei')

    class DeviceStatus(models.TextChoices):
        ACTIVE = 'AC', _('Active')
        INACTIVE = 'IN', _('Inactive')
        BLOCKED = 'BL', _('Blocked')

    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='mobile_devices'
    )
    device_id = models.CharField(
        max_length=255,
        unique=True,
        help_text=_('Unique device identifier')
    )
    device_type = models.CharField(
        max_length=2,
        choices=DeviceType.choices
    )
    device_name = models.CharField(max_length=255)
    device_model = models.CharField(max_length=255)
    os_version = models.CharField(max_length=50)
    app_version = models.CharField(max_length=50)
    push_token = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Push notification token')
    )
    status = models.CharField(
        max_length=2,
        choices=DeviceStatus.choices,
        default=DeviceStatus.ACTIVE
    )
    last_login = models.DateTimeField(null=True, blank=True)
    last_location = models.ForeignKey(
        'geolocation.UserLocation',
        on_delete=models.SET_NULL,
        null=True,
        related_name='devices'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('mobile device')
        verbose_name_plural = _('mobile devices')

    def __str__(self):
        return f"{self.device_name} ({self.get_device_type_display()})"

class MobileSession(models.Model):
    device = models.ForeignKey(
        MobileDevice,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    session_id = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('mobile session')
        verbose_name_plural = _('mobile sessions')

    def __str__(self):
        return f"Session {self.session_id}"

class AppPreference(models.Model):
    user = models.OneToOneField(
        'core.User',
        on_delete=models.CASCADE,
        related_name='app_preferences'
    )
    language = models.CharField(
        max_length=10,
        default='fr'
    )
    theme = models.CharField(
        max_length=20,
        choices=[
            ('light', _('Light')),
            ('dark', _('Dark')),
            ('system', _('System'))
        ],
        default='system'
    )
    notifications_enabled = models.BooleanField(default=True)
    location_tracking = models.BooleanField(default=True)
    background_refresh = models.BooleanField(default=True)
    offline_mode = models.BooleanField(default=False)
    default_vehicle = models.JSONField(
        help_text=_('Default vehicle information'),
        null=True,
        blank=True
    )
    favorite_branches = models.ManyToManyField(
        'core.OrganizationBranch',
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('app preference')
        verbose_name_plural = _('app preferences')

    def __str__(self):
        return f"Preferences for {self.user.email}"

class OfflineData(models.Model):
    class DataType(models.TextChoices):
        QUEUE = 'QU', _('Queue')
        TICKET = 'TI', _('Ticket')
        BRANCH = 'BR', _('Branch')
        MAP = 'MA', _('Map')

    device = models.ForeignKey(
        MobileDevice,
        on_delete=models.CASCADE,
        related_name='offline_data'
    )
    data_type = models.CharField(
        max_length=2,
        choices=DataType.choices
    )
    data = models.JSONField()
    version = models.IntegerField(default=1)
    is_dirty = models.BooleanField(
        default=False,
        help_text=_('Indicates if data needs to be synced')
    )
    last_synced = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('offline data')
        verbose_name_plural = _('offline data')
        unique_together = ['device', 'data_type']

    def __str__(self):
        return f"{self.get_data_type_display()} for {self.device.device_name}"

class AppFeedback(models.Model):
    class FeedbackType(models.TextChoices):
        BUG = 'BU', _('Bug Report')
        FEATURE = 'FE', _('Feature Request')
        IMPROVEMENT = 'IM', _('Improvement')
        OTHER = 'OT', _('Other')

    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='app_feedback'
    )
    device = models.ForeignKey(
        MobileDevice,
        on_delete=models.SET_NULL,
        null=True,
        related_name='feedback'
    )
    feedback_type = models.CharField(
        max_length=2,
        choices=FeedbackType.choices
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    screenshot = models.ImageField(
        upload_to='feedback/screenshots/',
        null=True,
        blank=True
    )
    app_version = models.CharField(max_length=50)
    device_info = models.JSONField(
        help_text=_('Device information when feedback was submitted')
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('new', _('New')),
            ('in_progress', _('In Progress')),
            ('resolved', _('Resolved')),
            ('closed', _('Closed'))
        ],
        default='new'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('app feedback')
        verbose_name_plural = _('app feedback')

    def __str__(self):
        return f"{self.get_feedback_type_display()} - {self.title}"
