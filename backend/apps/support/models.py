from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.utils.text import slugify
import uuid


class SupportTicket(models.Model):
    class Status(models.TextChoices):
        NEW = 'NE', _('New')
        ASSIGNED = 'AS', _('Assigned')
        IN_PROGRESS = 'IP', _('In Progress')
        PENDING = 'PE', _('Pending')
        RESOLVED = 'RE', _('Resolved')
        CLOSED = 'CL', _('Closed')

    class Priority(models.TextChoices):
        LOW = 'LO', _('Low')
        MEDIUM = 'ME', _('Medium')
        HIGH = 'HI', _('High')
        URGENT = 'UR', _('Urgent')

    class Category(models.TextChoices):
        TECHNICAL = 'TE', _('Technical')
        BILLING = 'BI', _('Billing')
        ACCOUNT = 'AC', _('Account')
        FEATURE = 'FE', _('Feature Request')
        BUG = 'BU', _('Bug Report')
        OTHER = 'OT', _('Other')

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.NEW
    )
    priority = models.CharField(
        max_length=2,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    category = models.CharField(
        max_length=2,
        choices=Category.choices,
        default=Category.OTHER
    )
    tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list
    )
    reference_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='organization_support_tickets'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_support_tickets'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_support_tickets'
    )
    due_date = models.DateTimeField(null=True, blank=True)
    resolution = models.TextField(blank=True)
    satisfaction_rating = models.PositiveSmallIntegerField(
        choices=[(i, i) for i in range(1, 6)],
        null=True,
        blank=True
    )
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('support ticket')
        verbose_name_plural = _('support tickets')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['organization', 'created_at'])
        ]

    def __str__(self):
        return f"{self.reference_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = f"TIC-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class TicketMessage(models.Model):
    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_ticket_messages'
    )
    content = models.TextField()
    attachments = ArrayField(
        models.CharField(max_length=255),
        blank=True,
        default=list
    )
    is_internal = models.BooleanField(
        default=False,
        help_text=_('Internal note visible only to staff')
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('ticket message')
        verbose_name_plural = _('ticket messages')
        ordering = ['created_at']

    def __str__(self):
        return f"Message on {self.ticket.reference_number}"


class FAQ(models.Model):
    class Category(models.TextChoices):
        GENERAL = 'GE', _('General')
        TECHNICAL = 'TE', _('Technical')
        BILLING = 'BI', _('Billing')
        ACCOUNT = 'AC', _('Account')
        FEATURES = 'FE', _('Features')
        SECURITY = 'SE', _('Security')

    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='faqs'
    )
    category = models.CharField(
        max_length=2,
        choices=Category.choices,
        default=Category.GENERAL
    )
    question = models.CharField(max_length=500)
    answer = models.TextField()
    tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_faqs'
    )
    is_published = models.BooleanField(default=True)
    view_count = models.PositiveIntegerField(default=0)
    helpful_count = models.PositiveIntegerField(default=0)
    not_helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('FAQ')
        verbose_name_plural = _('FAQs')
        ordering = ['-view_count', 'question']
        indexes = [
            models.Index(fields=['organization', 'category']),
            models.Index(fields=['is_published', 'view_count'])
        ]

    def __str__(self):
        return self.question


class KnowledgeBase(models.Model):
    class Category(models.TextChoices):
        USER_GUIDE = 'GU', _('User Guide')
        TUTORIAL = 'TU', _('Tutorial')
        TROUBLESHOOTING = 'TR', _('Troubleshooting')
        BEST_PRACTICES = 'BP', _('Best Practices')
        RELEASE_NOTES = 'RN', _('Release Notes')
        API_DOCS = 'AP', _('API Documentation')

    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='knowledge_base'
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    category = models.CharField(max_length=2, choices=Category.choices)
    content = models.TextField()
    tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_articles'
    )
    is_published = models.BooleanField(default=True)
    view_count = models.PositiveIntegerField(default=0)
    helpful_count = models.PositiveIntegerField(default=0)
    not_helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('knowledge base article')
        verbose_name_plural = _('knowledge base articles')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'category']),
            models.Index(fields=['is_published', 'view_count'])
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
