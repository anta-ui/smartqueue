# Generated by Django 5.0.1 on 2025-01-30 14:25

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0003_userconsent_granted_alter_userconsent_user_agent"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_organization_admin",
            field=models.BooleanField(default=False, verbose_name="organization admin"),
        ),
    ]
