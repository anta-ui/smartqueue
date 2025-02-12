# Generated by Django 5.0.1 on 2025-01-30 12:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("ar", "0001_initial"),
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="armarker",
            name="organization",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="ar_markers",
                to="core.organization",
            ),
        ),
        migrations.AddField(
            model_name="arcontent",
            name="marker",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="contents",
                to="ar.armarker",
            ),
        ),
        migrations.AddField(
            model_name="navigationpath",
            name="end_point",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="paths_to",
                to="ar.armarker",
            ),
        ),
        migrations.AddField(
            model_name="navigationpath",
            name="start_point",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="paths_from",
                to="ar.armarker",
            ),
        ),
        migrations.AddField(
            model_name="venue",
            name="organization",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="venues",
                to="core.organization",
            ),
        ),
        migrations.AddField(
            model_name="navigationpath",
            name="venue",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="navigation_paths",
                to="ar.venue",
            ),
        ),
    ]
