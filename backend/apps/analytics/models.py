from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField

class QueueMetrics(models.Model):
    queue = models.ForeignKey('queues.Queue', on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    average_wait_time = models.DurationField()
    total_customers = models.IntegerField()
    served_customers = models.IntegerField()
    abandoned_customers = models.IntegerField()
    peak_hours = ArrayField(models.TimeField())
    service_efficiency = models.FloatField(help_text=_('Ratio of served to total customers'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('queue metrics')
        verbose_name_plural = _('queue metrics')
        unique_together = ['queue', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.queue.name} - {self.date}"

class AgentPerformance(models.Model):
    agent = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='performance_metrics'
    )
    date = models.DateField()
    customers_served = models.IntegerField()
    average_service_time = models.DurationField()
    service_rating = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('agent performance')
        verbose_name_plural = _('agent performances')
        unique_together = ['agent', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.agent.username} - {self.date}"

class CustomerFeedback(models.Model):
    class Rating(models.IntegerChoices):
        VERY_POOR = 1, _('Very Poor')
        POOR = 2, _('Poor')
        AVERAGE = 3, _('Average')
        GOOD = 4, _('Good')
        EXCELLENT = 5, _('Excellent')

    ticket = models.OneToOneField(
        'queues.Ticket',
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    rating = models.IntegerField(choices=Rating.choices)
    comment = models.TextField(blank=True)
    wait_time_satisfaction = models.IntegerField(choices=Rating.choices)
    service_satisfaction = models.IntegerField(choices=Rating.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('customer feedback')
        verbose_name_plural = _('customer feedback')
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for {self.ticket}"
