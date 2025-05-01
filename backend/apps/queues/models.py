from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.gis.db import models as gis_models

class QueueType(models.Model):
    class Category(models.TextChoices):
        VEHICLE = 'VE', _('Vehicle')
        PERSON = 'PE', _('Person')
        MIXED = 'MI', _('Mixed')

    name = models.CharField(max_length=255)
    category = models.CharField(
        max_length=2,
        choices=Category.choices,
        default=Category.PERSON
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='queue_types'
    )
    branch = models.ForeignKey(
        'core.OrganizationBranch',
        on_delete=models.CASCADE,
        related_name='queue_types'
    )
    description = models.TextField(blank=True)
    estimated_service_time = models.IntegerField(
        help_text=_('Estimated service time in minutes'),
        default=15
    )
    max_capacity = models.IntegerField(
        help_text=_('Maximum number of tickets allowed'),
        default=100
    )
    priority_levels = models.JSONField(
        help_text=_('Priority levels configuration'),
        default=dict
    )
    requires_vehicle_info = models.BooleanField(default=False)
    requires_identification = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('queue type')
        verbose_name_plural = _('queue types')

    def __str__(self):
        return f"{self.name} at {self.branch.name}"

class Queue(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'AC', _('Active')
        PAUSED = 'PA', _('Paused')
        CLOSED = 'CL', _('Closed')
        MAINTENANCE = 'MA', _('Maintenance')

    queue_type = models.ForeignKey(
        QueueType,
        on_delete=models.CASCADE,
        related_name='queues'
    )
    name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    current_number = models.IntegerField(default=0)
    current_wait_time = models.IntegerField(
        help_text=_('Current wait time in minutes'),
        default=0
    )
    location = models.ForeignKey(
        'geolocation.LocationBasedService',
        on_delete=models.SET_NULL,
        null=True,
        related_name='queues'
    )
    service_points = models.ManyToManyField(
        'ServicePoint',
        related_name='assigned_queues'
    )
    is_priority = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('queue')
        verbose_name_plural = _('queues')

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"

class ServicePoint(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'AV', _('Available')
        BUSY = 'BU', _('Busy')
        OFFLINE = 'OF', _('Offline')
        BREAK = 'BR', _('Break')

    name = models.CharField(max_length=255)
    branch = models.ForeignKey(
        'core.OrganizationBranch',
        on_delete=models.CASCADE,
        related_name='service_points'
    )
    location = models.ForeignKey(
        'geolocation.LocationBasedService',
        on_delete=models.SET_NULL,
        null=True,
        related_name='service_points'
    )
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.AVAILABLE
    )
    current_ticket = models.OneToOneField(
        'Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_service_point'
    )
    assigned_agent = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='service_points'
    )
    is_vehicle_compatible = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('service point')
        verbose_name_plural = _('service points')

    def __str__(self):
        return f"{self.name} at {self.branch.name}"

class Ticket(models.Model):
    class Status(models.TextChoices):
        WAITING = 'WA', _('Waiting')
        CALLED = 'CA', _('Called')
        SERVING = 'SE', _('Serving')
        COMPLETED = 'CO', _('Completed')
        CANCELLED = 'CN', _('Cancelled')
        NO_SHOW = 'NS', _('No Show')
        TRANSFERRED = 'TR', _('Transferred')

    queue = models.ForeignKey(
        Queue,
        on_delete=models.CASCADE,
        related_name='tickets'
    )
    number = models.CharField(max_length=20)
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='tickets'
    )
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.WAITING
    )
    priority_level = models.IntegerField(default=0)
    estimated_wait_time = models.IntegerField(
        help_text=_('Estimated wait time in minutes'),
        default=0
    )
    check_in_time = models.DateTimeField(auto_now_add=True)
    called_time = models.DateTimeField(null=True, blank=True)
    service_start_time = models.DateTimeField(null=True, blank=True)
    service_end_time = models.DateTimeField(null=True, blank=True)
    vehicle_info = models.JSONField(
        help_text=_('Vehicle information if applicable'),
        null=True,
        blank=True
    )
    identification_info = models.JSONField(
        help_text=_('Identification information if required'),
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    location = models.ForeignKey(
        'geolocation.UserLocation',
        on_delete=models.SET_NULL,
        null=True,
        related_name='tickets'
    )

    class Meta:
        verbose_name = _('ticket')
        verbose_name_plural = _('tickets')
        ordering = ['priority_level', 'check_in_time']

    def __str__(self):
        return f"Ticket {self.number} - {self.get_status_display()}"

class VehicleCategory(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    max_size = models.JSONField(
        help_text=_('Maximum vehicle dimensions (length, width, height) in meters'),
        default=dict
    )
    requires_special_handling = models.BooleanField(default=False)
    service_time_multiplier = models.FloatField(
        help_text=_('Multiplier for base service time'),
        default=1.0
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('vehicle category')
        verbose_name_plural = _('vehicle categories')

    def __str__(self):
        return self.name

class QueueAnalytics(models.Model):
    queue = models.ForeignKey(
        Queue,
        on_delete=models.CASCADE,
        related_name='analytics'
    )
    date = models.DateField()
    total_tickets = models.IntegerField(default=0)
    served_tickets = models.IntegerField(default=0)
    cancelled_tickets = models.IntegerField(default=0)
    no_shows = models.IntegerField(default=0)
    average_wait_time = models.IntegerField(
        help_text=_('Average wait time in minutes'),
        default=0
    )
    average_service_time = models.IntegerField(
        help_text=_('Average service time in minutes'),
        default=0
    )
    peak_hours = models.JSONField(
        help_text=_('Peak hours data'),
        default=dict
    )
    satisfaction_score = models.FloatField(
        help_text=_('Average satisfaction score (0-5)'),
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('queue analytics')
        verbose_name_plural = _('queue analytics')
        unique_together = ['queue', 'date']

    def __str__(self):
        return f"Analytics for {self.queue.name} on {self.date}"

class QueueNotification(models.Model):
    class NotificationType(models.TextChoices):
        TICKET_CREATED = 'TC', _('Ticket Created')
        QUEUE_UPDATE = 'QU', _('Queue Update')
        CALLED = 'CA', _('Called to Service')
        REMINDER = 'RE', _('Reminder')
        STATUS_CHANGE = 'SC', _('Status Change')
        EMERGENCY = 'EM', _('Emergency')

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=2,
        choices=NotificationType.choices
    )
    message = models.TextField()
    sent_via = models.CharField(
        max_length=10,
        choices=[
            ('sms', _('SMS')),
            ('email', _('Email')),
            ('push', _('Push Notification')),
            ('whatsapp', _('WhatsApp'))
        ]
    )
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        verbose_name = _('queue notification')
        verbose_name_plural = _('queue notifications')

    def __str__(self):
        return f"{self.get_notification_type_display()} for Ticket {self.ticket.number}"