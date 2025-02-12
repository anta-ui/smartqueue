from django.contrib.auth import get_user_model
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field, extend_schema_serializer
from .models import SupportTicket, TicketMessage, FAQ, KnowledgeBase


class TicketMessageSerializer(serializers.ModelSerializer):
    """Serializer for ticket messages."""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_email = serializers.EmailField(source='sender.email', read_only=True)

    class Meta:
        model = TicketMessage
        fields = [
            'id', 'ticket', 'sender', 'sender_name', 'sender_email',
            'content', 'is_internal', 'attachments', 'created_at'
        ]
        read_only_fields = ['sender', 'created_at']


@extend_schema_serializer(
    component_name='SupportTicket'
)
class SupportTicketSerializer(serializers.ModelSerializer):
    """Serializer for support tickets."""
    messages = TicketMessageSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'reference_number', 'title', 'description', 'status',
            'status_display', 'priority', 'priority_display', 'category',
            'tags', 'created_by', 'created_by_name', 'assigned_to',
            'assigned_to_name', 'created_at', 'updated_at', 'closed_at',
            'satisfaction_rating', 'feedback', 'messages'
        ]
        read_only_fields = [
            'reference_number', 'created_by', 'assigned_to', 'created_at',
            'updated_at', 'closed_at', 'satisfaction_rating', 'feedback'
        ]


class TicketReplySerializer(serializers.Serializer):
    """Serializer for ticket replies."""
    content = serializers.CharField(help_text='Message content')
    is_internal = serializers.BooleanField(
        default=False,
        help_text='Whether this is an internal note visible only to staff'
    )
    attachments = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        help_text='List of files to attach to the message'
    )


class TicketAssignSerializer(serializers.Serializer):
    """Serializer for ticket assignment."""
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.filter(is_staff=True),
        help_text='ID of the staff member to assign the ticket to'
    )
    note = serializers.CharField(
        required=False,
        help_text='Optional internal note about the assignment'
    )


class TicketStatusUpdateSerializer(serializers.Serializer):
    """Serializer for ticket status updates."""
    status = serializers.ChoiceField(
        choices=SupportTicket.Status.choices,
        help_text='New status for the ticket'
    )
    note = serializers.CharField(
        required=False,
        help_text='Optional internal note about the status change'
    )


@extend_schema_serializer(
    component_name='FAQ'
)
class FAQSerializer(serializers.ModelSerializer):
    """Serializer for FAQs."""
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'category', 'tags',
            'is_published', 'helpful_count', 'not_helpful_count',
            'view_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'helpful_count', 'not_helpful_count', 'view_count',
            'created_at', 'updated_at'
        ]


class FAQFeedbackSerializer(serializers.Serializer):
    """Serializer for FAQ feedback."""
    is_helpful = serializers.BooleanField(
        help_text='Whether the FAQ was helpful'
    )
    comment = serializers.CharField(
        required=False,
        help_text='Optional feedback comment'
    )


@extend_schema_serializer(
    component_name='KnowledgeBase'
)
class KnowledgeBaseSerializer(serializers.ModelSerializer):
    """Serializer for knowledge base articles."""
    class Meta:
        model = KnowledgeBase
        fields = [
            'id', 'slug', 'title', 'content', 'category', 'tags',
            'is_published', 'helpful_count', 'not_helpful_count',
            'view_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'slug', 'helpful_count', 'not_helpful_count',
            'view_count', 'created_at', 'updated_at'
        ]


class KnowledgeBaseFeedbackSerializer(serializers.Serializer):
    """Serializer for knowledge base article feedback."""
    is_helpful = serializers.BooleanField(
        help_text='Whether the article was helpful'
    )
    comment = serializers.CharField(
        required=False,
        help_text='Optional feedback comment'
    )


@extend_schema_serializer(
    component_name='SupportSearch'
)
class SupportSearchSerializer(serializers.Serializer):
    """Serializer for support resource search."""
    query = serializers.CharField(
        required=False,
        help_text='Search query to filter results'
    )
    ticket_status = serializers.MultipleChoiceField(
        choices=SupportTicket.Status.choices,
        required=False,
        help_text='Filter tickets by status'
    )
    ticket_priority = serializers.MultipleChoiceField(
        choices=SupportTicket.Priority.choices,
        required=False,
        help_text='Filter tickets by priority'
    )
    ticket_category = serializers.MultipleChoiceField(
        choices=SupportTicket.Category.choices,
        required=False,
        help_text='Filter tickets by category'
    )
    faq_category = serializers.MultipleChoiceField(
        choices=FAQ.Category.choices,
        required=False,
        help_text='Filter FAQs by category'
    )
    kb_category = serializers.MultipleChoiceField(
        choices=KnowledgeBase.Category.choices,
        required=False,
        help_text='Filter knowledge base articles by category'
    )
    date_from = serializers.DateTimeField(
        required=False,
        help_text='Filter results created after this date'
    )
    date_to = serializers.DateTimeField(
        required=False,
        help_text='Filter results created before this date'
    )
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text='Filter results by tags'
    )
