# Generated by Django 5.0.1 on 2025-02-08 05:52

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
        ("core", "0006_alter_securitykey_options_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="usersession",
            options={
                "verbose_name": "user session",
                "verbose_name_plural": "user sessions",
            },
        ),
        migrations.RemoveField(
            model_name="usersession",
            name="device_id",
        ),
        migrations.RemoveField(
            model_name="usersession",
            name="device_name",
        ),
        migrations.RemoveField(
            model_name="usersession",
            name="device_type",
        ),
        migrations.RemoveField(
            model_name="usersession",
            name="expires_at",
        ),
        migrations.RemoveField(
            model_name="usersession",
            name="location",
        ),
        migrations.AlterField(
            model_name="emailverificationtoken",
            name="ip_address",
            field=models.GenericIPAddressField(),
        ),
        migrations.AlterField(
            model_name="emailverificationtoken",
            name="token",
            field=models.UUIDField(default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name="passwordresettoken",
            name="ip_address",
            field=models.GenericIPAddressField(),
        ),
        migrations.AlterField(
            model_name="passwordresettoken",
            name="token",
            field=models.UUIDField(default=uuid.uuid4, editable=False),
        ),
        migrations.AlterField(
            model_name="usersession",
            name="ip_address",
            field=models.GenericIPAddressField(),
        ),
        migrations.AlterField(
            model_name="usersession",
            name="user_agent",
            field=models.TextField(),
        ),
        migrations.AlterModelTable(
            name="user",
            table="core_user",
        ),
        migrations.CreateModel(
            name="CoreUserGroup",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "group",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="auth.group"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "core_user_groups",
                "unique_together": {("user", "group")},
            },
        ),
        migrations.AlterField(
            model_name="user",
            name="groups",
            field=models.ManyToManyField(
                blank=True,
                help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                related_name="core_users",
                related_query_name="core_user",
                through="core.CoreUserGroup",
                to="auth.group",
                verbose_name="groups",
            ),
        ),
        migrations.CreateModel(
            name="CoreUserPermission",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "permission",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="auth.permission",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "core_user_permissions",
                "unique_together": {("user", "permission")},
            },
        ),
        migrations.AlterField(
            model_name="user",
            name="user_permissions",
            field=models.ManyToManyField(
                blank=True,
                help_text="Specific permissions for this user.",
                related_name="core_users",
                related_query_name="core_user",
                through="core.CoreUserPermission",
                to="auth.permission",
                verbose_name="user permissions",
            ),
        ),
    ]
