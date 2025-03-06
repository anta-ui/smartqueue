# apps/core/models/organization_history.py
from django.db import models
from django.conf import settings
from .organization import Organization
from django.contrib.auth import get_user_model
User = get_user_model()

class OrganizationHistory(models.Model):
    class ActionType(models.TextChoices):
        STATUS_CHANGED = 'status_changed', ('Statut modifié')
        PLAN_CHANGED = 'plan_changed', ('Plan modifié')
        MEMBER_ADDED = 'member_added', ('Membre ajouté')
        MEMBER_REMOVED = 'member_removed', ('Membre retiré')
        DELETED = 'deleted', ('Organisation supprimée')

    organization_name = models.CharField(max_length=255)  # Stocker le nom de l'organisation
    action = models.CharField(max_length=50, choices=ActionType.choices)
    from_value = models.CharField(max_length=255, null=True, blank=True)
    to_value = models.CharField(max_length=255, null=True, blank=True)
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['organization_name', 'created_at']),
        ]