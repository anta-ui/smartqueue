from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField

class ReportTemplate(models.Model):
    class ReportType(models.TextChoices):
        QUEUE_PERFORMANCE = 'QP', _('Queue Performance')
        AGENT_PERFORMANCE = 'AP', _('Agent Performance')
        CUSTOMER_SATISFACTION = 'CS', _('Customer Satisfaction')
        SYSTEM_USAGE = 'SU', _('System Usage')
        CUSTOM = 'CU', _('Custom')

    class Format(models.TextChoices):
        PDF = 'PD', _('PDF')
        EXCEL = 'EX', _('Excel')
        CSV = 'CS', _('CSV')
        HTML = 'HT', _('HTML')

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    report_type = models.CharField(
        max_length=2,
        choices=ReportType.choices
    )
    format = models.CharField(
        max_length=2,
        choices=Format.choices
    )
    template_file = models.FileField(
        upload_to='report_templates/',
        null=True,
        blank=True,
        help_text=_('Template file for custom reports')
    )
    parameters = models.JSONField(
        default=dict,
        help_text=_('Parameters required for the report')
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='report_templates'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('report template')
        verbose_name_plural = _('report templates')
        unique_together = ['organization', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"

class ScheduledReport(models.Model):
    class Frequency(models.TextChoices):
        DAILY = 'DA', _('Daily')
        WEEKLY = 'WE', _('Weekly')
        MONTHLY = 'MO', _('Monthly')
        QUARTERLY = 'QU', _('Quarterly')
        YEARLY = 'YE', _('Yearly')

    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    name = models.CharField(max_length=255)
    frequency = models.CharField(
        max_length=2,
        choices=Frequency.choices
    )
    parameters = models.JSONField(
        default=dict,
        help_text=_('Parameters for report generation')
    )
    recipients = ArrayField(
        models.EmailField(),
        help_text=_('Email addresses to receive the report')
    )
    next_run = models.DateTimeField()
    last_run = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='scheduled_reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('scheduled report')
        verbose_name_plural = _('scheduled reports')

    def __str__(self):
        return f"{self.name} ({self.get_frequency_display()})"

class GeneratedReport(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PE', _('Pending')
        GENERATING = 'GE', _('Generating')
        COMPLETED = 'CO', _('Completed')
        FAILED = 'FA', _('Failed')

    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='generated_reports'
    )
    schedule = models.ForeignKey(
        ScheduledReport,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_reports'
    )
    name = models.CharField(max_length=255)
    parameters = models.JSONField(
        default=dict,
        help_text=_('Parameters used for generation')
    )
    file = models.FileField(
        upload_to='generated_reports/',
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.PENDING
    )
    error_message = models.TextField(blank=True)
    generated_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('generated report')
        verbose_name_plural = _('generated reports')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"
