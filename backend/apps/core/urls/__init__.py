# apps/core/urls/__init__.py
from django.urls import path,include
from django.http import HttpResponse

# Version temporaire simplifiée
urlpatterns = [
    path('test/', lambda request: HttpResponse("Test URL working!")),
    path('api/super-admin/', include('apps.core.urls.super_admin', namespace='api_super_admin')),
]