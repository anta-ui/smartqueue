from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class AgentProfile(models.Model):
    class AgentStatus(models.TextChoices):
        AVAILABLE = 'AV', _('Available')
        BUSY = 'BY', _('Busy')
        BREAK = 'BR', _('Break')
        OFFLINE = 'OF', _('Offline')

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='agent_profile'
    )
    status = models.CharField(
        max_length=2,
        choices=AgentStatus.choices,
        default=AgentStatus.OFFLINE
    )
    specializations = models.ManyToManyField('AgentSpecialization')
    current_service_point = models.ForeignKey(
        'queues.ServicePoint',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_agents'
    )
    max_concurrent_customers = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('agent profile')
        verbose_name_plural = _('agent profiles')

    def __str__(self):
        return f"Agent: {self.user.username}"

class AgentSpecialization(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='specializations'
    )
    required_training = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('agent specialization')
        verbose_name_plural = _('agent specializations')

    def __str__(self):
        return self.name

class AgentSchedule(models.Model):
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_holiday = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('agent schedule')
        verbose_name_plural = _('agent schedules')
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.agent.username} - {self.date}"

class AgentBreak(models.Model):
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='breaks'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('agent break')
        verbose_name_plural = _('agent breaks')
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.agent.username} - {self.start_time}"
