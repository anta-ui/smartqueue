from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import ArrayField

class AuditLog(models.Model):
    class ActionType(models.TextChoices):
        CREATE = 'CR', _('Create')
        UPDATE = 'UP', _('Update')
        DELETE = 'DE', _('Delete')
        LOGIN = 'LI', _('Login')
        LOGOUT = 'LO', _('Logout')
        ACCESS = 'AC', _('Access')
        ERROR = 'ER', _('Error')
        SYSTEM = 'SY', _('System')

    class Category(models.TextChoices):
        AUTHENTICATION = 'AU', _('Authentication')
        AUTHORIZATION = 'AZ', _('Authorization')
        DATA = 'DA', _('Data')
        SYSTEM = 'SY', _('System')
        SECURITY = 'SE', _('Security')
        BUSINESS = 'BU', _('Business')

    class Severity(models.TextChoices):
        DEBUG = 'DE', _('Debug')
        INFO = 'IN', _('Info')
        WARNING = 'WA', _('Warning')
        ERROR = 'ER', _('Error')
        CRITICAL = 'CR', _('Critical')

    action_type = models.CharField(
        max_length=2,
        choices=ActionType.choices
    )
    category = models.CharField(
        max_length=2,
        choices=Category.choices
    )
    severity = models.CharField(
        max_length=2,
        choices=Severity.choices,
        default=Severity.INFO
    )
    actor = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    object_id = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    description = models.TextField()
    details = models.JSONField(default=dict)
    changes = models.JSONField(
        default=dict,
        help_text=_('Changes made in case of update action')
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action_type', 'category', 'severity']),
            models.Index(fields=['organization', 'created_at'])
        ]

    def __str__(self):
        return f"{self.get_action_type_display()} - {self.created_at}"

class AuditPolicy(models.Model):
    class RetentionUnit(models.TextChoices):
        DAYS = 'DA', _('Days')
        WEEKS = 'WE', _('Weeks')
        MONTHS = 'MO', _('Months')
        YEARS = 'YE', _('Years')

    organization = models.OneToOneField(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='audit_policy'
    )
    enabled_categories = ArrayField(
        models.CharField(
            max_length=2,
            choices=AuditLog.Category.choices
        ),
        default=list,
        help_text=_('Categories to audit')
    )
    min_severity = models.CharField(
        max_length=2,
        choices=AuditLog.Severity.choices,
        default=AuditLog.Severity.INFO,
        help_text=_('Minimum severity level to audit')
    )
    retention_period = models.PositiveIntegerField(
        default=90,
        help_text=_('How long to keep audit logs')
    )
    retention_unit = models.CharField(
        max_length=2,
        choices=RetentionUnit.choices,
        default=RetentionUnit.DAYS
    )
    notify_on_severity = models.CharField(
        max_length=2,
        choices=AuditLog.Severity.choices,
        default=AuditLog.Severity.ERROR,
        help_text=_('Minimum severity level for notifications')
    )
    notification_emails = ArrayField(
        models.EmailField(),
        default=list,
        help_text=_('Emails to notify on severe events')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('audit policy')
        verbose_name_plural = _('audit policies')

    def __str__(self):
        return f"Audit Policy for {self.organization.name}"

class AuditExport(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PE', _('Pending')
        PROCESSING = 'PR', _('Processing')
        COMPLETED = 'CO', _('Completed')
        FAILED = 'FA', _('Failed')

    class Format(models.TextChoices):
        CSV = 'CS', _('CSV')
        JSON = 'JS', _('JSON')
        EXCEL = 'EX', _('Excel')

    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='audit_exports'
    )
    requested_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_exports'
    )
    date_from = models.DateTimeField()
    date_to = models.DateTimeField()
    categories = ArrayField(
        models.CharField(
            max_length=2,
            choices=AuditLog.Category.choices
        ),
        help_text=_('Categories to include in export')
    )
    min_severity = models.CharField(
        max_length=2,
        choices=AuditLog.Severity.choices,
        default=AuditLog.Severity.INFO
    )
    format = models.CharField(
        max_length=2,
        choices=Format.choices,
        default=Format.CSV
    )
    file = models.FileField(
        upload_to='audit_exports/',
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.PENDING
    )
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('audit export')
        verbose_name_plural = _('audit exports')
        ordering = ['-created_at']

    def __str__(self):
        return f"Audit Export {self.created_at}"
