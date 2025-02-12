from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class NotificationTemplate(models.Model):
    class TemplateType(models.TextChoices):
        EMAIL = 'EM', _('Email')
        SMS = 'SM', _('SMS')
        PUSH = 'PU', _('Push')
        WHATSAPP = 'WA', _('WhatsApp')
        IN_APP = 'IA', _('In-App')

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    template_type = models.CharField(
        max_length=2,
        choices=TemplateType.choices
    )
    subject = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Subject for email notifications')
    )
    content = models.TextField(
        help_text=_('Template content with placeholders')
    )
    html_content = models.TextField(
        blank=True,
        help_text=_('HTML content for email notifications')
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='notification_templates'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('notification template')
        verbose_name_plural = _('notification templates')
        unique_together = ['organization', 'name', 'template_type']

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"

class NotificationChannel(models.Model):
    class ChannelType(models.TextChoices):
        EMAIL = 'EM', _('Email')
        SMS = 'SM', _('SMS')
        PUSH = 'PU', _('Push')
        WHATSAPP = 'WA', _('WhatsApp')
        IN_APP = 'IA', _('In-App')

    name = models.CharField(max_length=255)
    channel_type = models.CharField(
        max_length=2,
        choices=ChannelType.choices
    )
    configuration = models.JSONField(
        help_text=_('Channel specific configuration')
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='notification_channels'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('notification channel')
        verbose_name_plural = _('notification channels')

    def __str__(self):
        return f"{self.name} ({self.get_channel_type_display()})"

class NotificationPreference(models.Model):
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    channel_type = models.CharField(
        max_length=2,
        choices=NotificationChannel.ChannelType.choices
    )
    is_enabled = models.BooleanField(default=True)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('notification preference')
        verbose_name_plural = _('notification preferences')
        unique_together = ['user', 'channel_type']

    def __str__(self):
        return f"{self.user.email} - {self.get_channel_type_display()}"

class Notification(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PE', _('Pending')
        SCHEDULED = 'SC', _('Scheduled')
        SENDING = 'SE', _('Sending')
        SENT = 'ST', _('Sent')
        DELIVERED = 'DE', _('Delivered')
        READ = 'RE', _('Read')
        FAILED = 'FA', _('Failed')

    class Priority(models.TextChoices):
        LOW = 'LO', _('Low')
        NORMAL = 'NO', _('Normal')
        HIGH = 'HI', _('High')
        URGENT = 'UR', _('Urgent')

    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.PROTECT,
        related_name='notifications'
    )
    channel = models.ForeignKey(
        NotificationChannel,
        on_delete=models.PROTECT,
        related_name='notifications'
    )
    recipient = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.PENDING
    )
    priority = models.CharField(
        max_length=2,
        choices=Priority.choices,
        default=Priority.NORMAL
    )
    subject = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    data = models.JSONField(
        help_text=_('Additional data for the notification'),
        default=dict,
        blank=True
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    scheduled_for = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        indexes = [
            models.Index(fields=['status', 'scheduled_for']),
            models.Index(fields=['recipient', 'created_at'])
        ]

    def __str__(self):
        return f"Notification to {self.recipient.email} - {self.get_status_display()}"

class NotificationBatch(models.Model):
    name = models.CharField(max_length=255)
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.PROTECT,
        related_name='batches'
    )
    channel = models.ForeignKey(
        NotificationChannel,
        on_delete=models.PROTECT,
        related_name='batches'
    )
    recipients_filter = models.JSONField(
        help_text=_('Filter criteria for recipients')
    )
    data = models.JSONField(
        help_text=_('Data for notification content'),
        default=dict
    )
    scheduled_for = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=2,
        choices=Notification.Status.choices,
        default=Notification.Status.PENDING
    )
    total_count = models.IntegerField(default=0)
    sent_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('notification batch')
        verbose_name_plural = _('notification batches')

    def __str__(self):
        return f"Batch: {self.name} ({self.get_status_display()})"
