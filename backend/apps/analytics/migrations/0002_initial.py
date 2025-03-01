# Generated by Django 5.0.1 on 2025-01-30 12:49

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("analytics", "0001_initial"),
        ("queues", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="agentperformance",
            name="agent",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="performance_metrics",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="customerfeedback",
            name="ticket",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="feedback",
                to="queues.ticket",
            ),
        ),
        migrations.AddField(
            model_name="queuemetrics",
            name="queue",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="metrics",
                to="queues.queue",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="agentperformance",
            unique_together={("agent", "date")},
        ),
        migrations.AlterUniqueTogether(
            name="queuemetrics",
            unique_together={("queue", "date")},
        ),
    ]
