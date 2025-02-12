from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'test_smartqueue',
        'USER': 'youssoupha',
        'PASSWORD': 'youssoupha',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Disable GeoDjango features for testing
INSTALLED_APPS = [
    'apps.core.apps.CoreConfig',  # Move core app to the top
    'apps.support.apps.SupportConfig',  # Add support app
    'apps.analytics.apps.AnalyticsConfig',  # Add analytics app
    'apps.queues.apps.QueuesConfig',  # Add queues app
    'apps.geolocation.apps.GeolocationConfig',  # Add geolocation app
    'apps.billing.apps.BillingConfig',  # Add billing app
    'apps.notifications.apps.NotificationsConfig',  # Add notifications app
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',  # Add GIS support
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    'graphene_django',
    'django_filters',
    'channels',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'django_otp.plugins.otp_static',
]

# Auth settings
AUTH_USER_MODEL = 'core.User'

# Test settings
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# Disable migrations for testing
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()
