from django.urls import path, include, re_path
from apps.core.urls.super_admin import router, urlpatterns as super_admin_patterns
from apps.core.views.organization import (
    OrganizationContactsView,
    OrganizationBranchesView,
    OrganizationApiKeysView,
    OrganizationWebhooksView,
    OrganizationLimitsView,
    OrganizationFinancialStatusView,
    OrganizationInvoicesView,
    OrganizationCreditsView,
    OrganizationFinancialReportsView,
    OrganizationDocumentsView,
    OrganizationHistoryView,
)

app_name = 'api-super-admin'

# Réutiliser les patterns du super-admin mais avec validation des IDs
urlpatterns = super_admin_patterns + [
    # Routes pour les détails d'organisation (super-admin)
    re_path(r'^organizations/(?P<organization_id>\d+)/contacts/$', OrganizationContactsView.as_view(), name='organization-contacts'),
    re_path(r'^organizations/(?P<organization_id>\d+)/branches/$', OrganizationBranchesView.as_view(), name='organization-branches'),
    re_path(r'^organizations/(?P<organization_id>\d+)/api-keys/$', OrganizationApiKeysView.as_view(), name='organization-api-keys'),
    re_path(r'^organizations/(?P<organization_id>\d+)/webhooks/$', OrganizationWebhooksView.as_view(), name='organization-webhooks'),
    re_path(r'^organizations/(?P<organization_id>\d+)/limits/$', OrganizationLimitsView.as_view(), name='organization-limits'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/payment-status/$', OrganizationFinancialStatusView.as_view(), name='organization-financial-status'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/invoices/$', OrganizationInvoicesView.as_view(), name='organization-invoices'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/credits/$', OrganizationCreditsView.as_view(), name='organization-credits'),
    re_path(r'^organizations/(?P<organization_id>\d+)/financial/reports/$', OrganizationFinancialReportsView.as_view(), name='organization-financial-reports'),
    re_path(r'^organizations/(?P<organization_id>\d+)/documents/$', OrganizationDocumentsView.as_view(), name='organization-documents'),
    re_path(r'^organizations/(?P<organization_id>\d+)/history/$', OrganizationHistoryView.as_view(), name='organization-history'),
]