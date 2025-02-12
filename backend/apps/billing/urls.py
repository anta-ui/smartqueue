from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionPlanViewSet, SubscriptionViewSet,
    InvoiceViewSet, PaymentViewSet, BillingContactViewSet
)

app_name = 'billing'

router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='plan')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'contacts', BillingContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
