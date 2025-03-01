# Generated by Django 5.0.1 on 2025-01-30 12:49

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="BillingContact",
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
                ("name", models.CharField(max_length=255)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(max_length=20)),
                ("is_primary", models.BooleanField(default=False)),
                ("address", models.TextField()),
                ("tax_id", models.CharField(blank=True, max_length=50)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "billing contact",
                "verbose_name_plural": "billing contacts",
            },
        ),
        migrations.CreateModel(
            name="Invoice",
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
                ("invoice_number", models.CharField(max_length=50, unique=True)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("tax_amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("total_amount", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("DR", "Draft"),
                            ("PE", "Pending"),
                            ("PA", "Paid"),
                            ("CA", "Cancelled"),
                            ("RE", "Refunded"),
                        ],
                        default="DR",
                        max_length=2,
                    ),
                ),
                ("due_date", models.DateField()),
                ("paid_date", models.DateTimeField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "invoice",
                "verbose_name_plural": "invoices",
            },
        ),
        migrations.CreateModel(
            name="Payment",
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
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "payment_method",
                    models.CharField(
                        choices=[
                            ("CC", "Credit Card"),
                            ("BT", "Bank Transfer"),
                            ("PP", "PayPal"),
                            ("MM", "Mobile Money"),
                            ("CA", "Cash"),
                        ],
                        max_length=2,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PE", "Pending"),
                            ("CO", "Completed"),
                            ("FA", "Failed"),
                            ("RE", "Refunded"),
                        ],
                        default="PE",
                        max_length=2,
                    ),
                ),
                ("transaction_id", models.CharField(blank=True, max_length=255)),
                ("payment_date", models.DateTimeField()),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "payment",
                "verbose_name_plural": "payments",
            },
        ),
        migrations.CreateModel(
            name="Subscription",
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
                    "status",
                    models.CharField(
                        choices=[
                            ("AC", "Active"),
                            ("PE", "Pending"),
                            ("CA", "Cancelled"),
                            ("EX", "Expired"),
                        ],
                        default="PE",
                        max_length=2,
                    ),
                ),
                ("start_date", models.DateTimeField()),
                ("end_date", models.DateTimeField()),
                ("auto_renew", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "subscription",
                "verbose_name_plural": "subscriptions",
            },
        ),
        migrations.CreateModel(
            name="SubscriptionPlan",
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
                ("name", models.CharField(max_length=255)),
                (
                    "plan_type",
                    models.CharField(
                        choices=[
                            ("FR", "Free"),
                            ("BA", "Basic"),
                            ("PR", "Professional"),
                            ("EN", "Enterprise"),
                        ],
                        default="FR",
                        max_length=2,
                    ),
                ),
                ("description", models.TextField()),
                ("price", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "billing_cycle",
                    models.IntegerField(help_text="Billing cycle in months"),
                ),
                ("max_queues", models.IntegerField()),
                ("max_users", models.IntegerField()),
                ("max_service_points", models.IntegerField()),
                ("includes_analytics", models.BooleanField(default=False)),
                ("includes_ar", models.BooleanField(default=False)),
                ("includes_api_access", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "subscription plan",
                "verbose_name_plural": "subscription plans",
            },
        ),
    ]
