from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupportTicketViewSet, FAQViewSet,
    KnowledgeBaseViewSet, SupportSearchViewSet
)

app_name = 'support'

router = DefaultRouter()
router.register(r'tickets', SupportTicketViewSet, basename='ticket')
router.register(r'faqs', FAQViewSet, basename='faq')
router.register(r'articles', KnowledgeBaseViewSet, basename='article')
router.register(r'search', SupportSearchViewSet, basename='search')

urlpatterns = [
    path('', include(router.urls)),
]
