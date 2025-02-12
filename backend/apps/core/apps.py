from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core'

    def ready(self):
        """
        Initialisation de l'application
        Cette méthode est appelée lorsque le registre d'applications est entièrement peuplé
        """
        try:
            # Import models explicitly to ensure proper registration
            from .models.user import User  # noqa
            from .models.organization import Organization, OrganizationSettings, OrganizationFeature  # noqa
            from .models.data_retention import DataRetentionPolicy  # noqa
            from .models.consent import UserConsent  # noqa
            from .models.branch import OrganizationBranch  # noqa
            from .models.auth import SecurityKey, UserSession  # noqa
            from .models.through import CoreUserGroup, CoreUserPermission  # noqa
        except Exception as e:
            print(f"Error loading core models: {e}")
            raise
