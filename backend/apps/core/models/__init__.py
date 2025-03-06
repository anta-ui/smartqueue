"""
Core app models
"""
from .user import User
from .organization import Organization, OrganizationSettings, OrganizationFeature
from .data_retention import DataRetentionPolicy
from .consent import UserConsent
from .branch import OrganizationBranch
from .auth import SecurityKey, UserSession
from .through import CoreUserGroup, CoreUserPermission
from .super_admin import SystemSetting, SystemAuditLog, SystemAlert, MaintenanceSchedule, SystemBackup

# Ajoutez ces imports si les fichiers existent
try:
    from .api_key import ApiKey
    from .webhook import Webhook
except ImportError:
    ApiKey = None
    Webhook = None

__all__ = [
    'User',
    'Organization',
    'OrganizationSettings',
    'OrganizationFeature',
    'DataRetentionPolicy',
    'UserConsent',
    'SecurityKey',
    'UserSession',
    'OrganizationBranch',
    'CoreUserGroup',
    'CoreUserPermission',
    'ApiKey',
    'Webhook',
]