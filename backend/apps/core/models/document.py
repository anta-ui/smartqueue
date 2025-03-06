# apps/core/models/document.py
from django.db import models
from .organization import Organization
from rest_framework import serializers
from django.conf import settings

class Document(models.Model):
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='documents'
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='organization_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True
    )
    
    def __str__(self):
        return self.title