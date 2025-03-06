# apps/core/serializers/document.py
from rest_framework import serializers
from ..models.document import Document

class DocumentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=255)
    type = serializers.CharField(max_length=50, required=False)
    size = serializers.IntegerField(required=False)
    uploaded_at = serializers.DateTimeField(read_only=True)
    uploaded_by = serializers.EmailField(required=False, allow_null=True)
    class Meta:
        model = Document
        fields = [
            'id', 
            'title', 
            'file', 
            'uploaded_at', 
            'uploaded_by'
        ]