# Generated by Django 5.0.1 on 2025-01-30 12:49

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Organization",
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
                ("name", models.CharField(max_length=255, verbose_name="name")),
                (
                    "subscription_type",
                    models.CharField(
                        choices=[
                            ("free", "Free"),
                            ("basic", "Basic"),
                            ("premium", "Premium"),
                            ("enterprise", "Enterprise"),
                        ],
                        default="free",
                        max_length=20,
                        verbose_name="subscription type",
                    ),
                ),
                ("is_active", models.BooleanField(default=True, verbose_name="active")),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created at"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated at"),
                ),
            ],
            options={
                "verbose_name": "organization",
                "verbose_name_plural": "organizations",
            },
        ),
        migrations.CreateModel(
            name="User",
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
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "email",
                    models.EmailField(
                        max_length=254, unique=True, verbose_name="email address"
                    ),
                ),
                (
                    "first_name",
                    models.CharField(max_length=150, verbose_name="first name"),
                ),
                (
                    "last_name",
                    models.CharField(max_length=150, verbose_name="last name"),
                ),
                (
                    "password",
                    models.CharField(
                        default="", max_length=128, verbose_name="password"
                    ),
                ),
                ("is_active", models.BooleanField(default=True, verbose_name="active")),
                (
                    "is_staff",
                    models.BooleanField(default=False, verbose_name="staff status"),
                ),
                (
                    "is_superuser",
                    models.BooleanField(default=False, verbose_name="superuser status"),
                ),
                (
                    "is_verified",
                    models.BooleanField(default=False, verbose_name="verified"),
                ),
                (
                    "is_locked",
                    models.BooleanField(default=False, verbose_name="locked"),
                ),
                (
                    "mfa_required",
                    models.BooleanField(default=False, verbose_name="MFA required"),
                ),
                (
                    "failed_login_attempts",
                    models.PositiveIntegerField(
                        default=0, verbose_name="failed login attempts"
                    ),
                ),
                (
                    "last_login_attempt",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login attempt"
                    ),
                ),
                (
                    "last_password_change",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last password change"
                    ),
                ),
                (
                    "lock_expires_at",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="lock expires at"
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                (
                    "user_type",
                    models.CharField(
                        choices=[
                            ("AD", "Administrator"),
                            ("ST", "Staff"),
                            ("CU", "Customer"),
                        ],
                        default="CU",
                        max_length=2,
                        verbose_name="user type",
                    ),
                ),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
                (
                    "organization",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="users",
                        to="core.organization",
                    ),
                ),
            ],
            options={
                "verbose_name": "user",
                "verbose_name_plural": "users",
                "ordering": ["email"],
            },
        ),
        migrations.CreateModel(
            name="EmailVerificationToken",
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
                ("token", models.UUIDField(default=uuid.uuid4, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField()),
                ("is_verified", models.BooleanField(default=False)),
                (
                    "email",
                    models.EmailField(default="", max_length=254, verbose_name="email"),
                ),
                ("verified_at", models.DateTimeField(blank=True, null=True)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, max_length=255)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)ss",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "email verification token",
                "verbose_name_plural": "email verification tokens",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="DataRetentionPolicy",
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
                    "session_retention_days",
                    models.IntegerField(
                        default=90,
                        help_text="Number of days to keep session data",
                        verbose_name="session retention days",
                    ),
                ),
                (
                    "log_retention_days",
                    models.IntegerField(
                        default=365,
                        help_text="Number of days to keep log data",
                        verbose_name="log retention days",
                    ),
                ),
                (
                    "backup_retention_days",
                    models.IntegerField(
                        default=730,
                        help_text="Number of days to keep backup data",
                        verbose_name="backup retention days",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created at"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated at"),
                ),
                (
                    "organization",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="data_retention_policy",
                        to="core.organization",
                    ),
                ),
            ],
            options={
                "verbose_name": "data retention policy",
                "verbose_name_plural": "data retention policies",
            },
        ),
        migrations.CreateModel(
            name="OrganizationSettings",
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
                    "max_users",
                    models.IntegerField(default=5, verbose_name="maximum users"),
                ),
                (
                    "max_sessions",
                    models.IntegerField(default=5, verbose_name="maximum sessions"),
                ),
                (
                    "session_duration",
                    models.IntegerField(
                        default=30,
                        help_text="Duration in days",
                        verbose_name="session duration",
                    ),
                ),
                (
                    "require_mfa",
                    models.BooleanField(
                        default=False,
                        help_text="Require Multi-Factor Authentication",
                        verbose_name="require MFA",
                    ),
                ),
                (
                    "organization",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="settings",
                        to="core.organization",
                    ),
                ),
            ],
            options={
                "verbose_name": "organization settings",
                "verbose_name_plural": "organization settings",
            },
        ),
        migrations.CreateModel(
            name="PasswordResetToken",
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
                ("token", models.UUIDField(default=uuid.uuid4, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField()),
                ("is_verified", models.BooleanField(default=False)),
                (
                    "email",
                    models.EmailField(default="", max_length=254, verbose_name="email"),
                ),
                ("used_at", models.DateTimeField(blank=True, null=True)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, max_length=255)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)ss",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "password reset token",
                "verbose_name_plural": "password reset tokens",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="SecurityKey",
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
                    "name",
                    models.CharField(blank=True, max_length=255, verbose_name="name"),
                ),
                (
                    "key_id",
                    models.CharField(
                        default="TEMP",
                        max_length=255,
                        unique=True,
                        verbose_name="key ID",
                    ),
                ),
                (
                    "key_type",
                    models.CharField(
                        choices=[
                            ("FP", "Fingerprint"),
                            ("FC", "Face"),
                            ("SK", "Security Key"),
                            ("OT", "Other"),
                        ],
                        default="SK",
                        max_length=2,
                        verbose_name="key type",
                    ),
                ),
                ("public_key", models.TextField(default="", verbose_name="public key")),
                (
                    "sign_count",
                    models.PositiveIntegerField(default=0, verbose_name="sign count"),
                ),
                ("is_active", models.BooleanField(default=True, verbose_name="active")),
                (
                    "last_used",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last used"
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created at"),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="security_keys",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "security key",
                "verbose_name_plural": "security keys",
                "ordering": ["-last_used"],
            },
        ),
        migrations.CreateModel(
            name="UserSession",
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
                ("session_key", models.CharField(max_length=40, unique=True)),
                ("device_id", models.CharField(blank=True, max_length=255)),
                ("device_type", models.CharField(blank=True, max_length=50)),
                ("device_name", models.CharField(blank=True, max_length=100)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.TextField(blank=True)),
                ("location", models.CharField(blank=True, max_length=255)),
                ("last_activity", models.DateTimeField(auto_now=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField()),
                ("is_active", models.BooleanField(default=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sessions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "user session",
                "verbose_name_plural": "user sessions",
                "ordering": ["-last_activity"],
            },
        ),
        migrations.CreateModel(
            name="OrganizationBranch",
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
                    "name",
                    models.CharField(
                        default="Unknown", max_length=255, verbose_name="name"
                    ),
                ),
                (
                    "code",
                    models.CharField(
                        default="Unknown",
                        max_length=50,
                        unique=True,
                        verbose_name="code",
                    ),
                ),
                ("address", models.TextField(blank=True, verbose_name="address")),
                (
                    "city",
                    models.CharField(
                        default="Unknown", max_length=100, verbose_name="city"
                    ),
                ),
                (
                    "country",
                    models.CharField(
                        default="Unknown", max_length=100, verbose_name="country"
                    ),
                ),
                (
                    "phone",
                    models.CharField(blank=True, max_length=20, verbose_name="phone"),
                ),
                (
                    "email",
                    models.EmailField(blank=True, max_length=254, verbose_name="email"),
                ),
                (
                    "latitude",
                    models.DecimalField(
                        blank=True,
                        decimal_places=6,
                        max_digits=9,
                        null=True,
                        verbose_name="latitude",
                    ),
                ),
                (
                    "longitude",
                    models.DecimalField(
                        blank=True,
                        decimal_places=6,
                        max_digits=9,
                        null=True,
                        verbose_name="longitude",
                    ),
                ),
                (
                    "timezone",
                    models.CharField(
                        default="UTC", max_length=50, verbose_name="timezone"
                    ),
                ),
                (
                    "opening_hours",
                    models.JSONField(
                        default=dict,
                        help_text="Opening hours for each day of the week",
                        verbose_name="opening hours",
                    ),
                ),
                ("is_active", models.BooleanField(default=True, verbose_name="active")),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created at"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated at"),
                ),
                (
                    "organization",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="branches",
                        to="core.organization",
                    ),
                ),
            ],
            options={
                "verbose_name": "organization branch",
                "verbose_name_plural": "organization branches",
                "ordering": ["name"],
                "unique_together": {("organization", "code")},
            },
        ),
        migrations.CreateModel(
            name="OrganizationFeature",
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
                ("name", models.CharField(max_length=100, verbose_name="name")),
                (
                    "is_enabled",
                    models.BooleanField(default=True, verbose_name="enabled"),
                ),
                (
                    "config",
                    models.JSONField(
                        blank=True, default=dict, verbose_name="configuration"
                    ),
                ),
                (
                    "organization",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="features",
                        to="core.organization",
                    ),
                ),
            ],
            options={
                "verbose_name": "organization feature",
                "verbose_name_plural": "organization features",
                "unique_together": {("organization", "name")},
            },
        ),
        migrations.CreateModel(
            name="UserConsent",
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
                    "consent_type",
                    models.CharField(
                        choices=[
                            ("terms", "Terms of Service"),
                            ("privacy", "Privacy Policy"),
                            ("cookies", "Cookie Policy"),
                            ("marketing", "Marketing Communications"),
                        ],
                        max_length=50,
                        verbose_name="consent type",
                    ),
                ),
                (
                    "version",
                    models.CharField(
                        default="1.0", max_length=10, verbose_name="version"
                    ),
                ),
                ("ip_address", models.GenericIPAddressField(verbose_name="IP address")),
                (
                    "user_agent",
                    models.CharField(max_length=255, verbose_name="user agent"),
                ),
                (
                    "consented_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="consented at"
                    ),
                ),
                (
                    "revoked_at",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="revoked at"
                    ),
                ),
                ("is_active", models.BooleanField(default=True, verbose_name="active")),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="consents",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "user consent",
                "verbose_name_plural": "user consents",
                "unique_together": {("user", "consent_type", "version")},
            },
        ),
    ]
