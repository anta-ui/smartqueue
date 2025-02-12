from django.db.models import Q, F
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from apps.core.permissions import IsOrganizationMember, IsOrganizationAdmin
from .models import SupportTicket, TicketMessage, FAQ, KnowledgeBase
from .serializers import (
    SupportTicketSerializer, TicketMessageSerializer,
    TicketReplySerializer, TicketAssignSerializer,
    TicketStatusUpdateSerializer, FAQSerializer,
    FAQFeedbackSerializer, KnowledgeBaseSerializer,
    KnowledgeBaseFeedbackSerializer, SupportSearchSerializer
)


@extend_schema_view(
    list=extend_schema(
        summary="List support tickets",
        description="Returns a list of support tickets for the current organization.",
        tags=['support']
    ),
    create=extend_schema(
        summary="Create support ticket",
        description="Creates a new support ticket and initial message.",
        tags=['support']
    ),
    retrieve=extend_schema(
        summary="Get support ticket",
        description="Returns the details of a specific support ticket.",
        tags=['support']
    ),
    update=extend_schema(
        summary="Update support ticket",
        description="Updates all fields of an existing support ticket.",
        tags=['support']
    ),
    partial_update=extend_schema(
        summary="Partially update support ticket",
        description="Updates specific fields of an existing support ticket.",
        tags=['support']
    ),
    destroy=extend_schema(
        summary="Delete support ticket",
        description="Deletes a support ticket and all associated messages.",
        tags=['support']
    )
)
class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        return super().get_queryset().filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        ticket = serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user
        )
        
        # Create initial message
        TicketMessage.objects.create(
            ticket=ticket,
            sender=self.request.user,
            content=ticket.description
        )

    @extend_schema(
        summary="Reply to ticket",
        description="Adds a new message to the ticket and updates its status.",
        request=TicketReplySerializer,
        responses={201: TicketMessageSerializer},
        tags=['support']
    )
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        message = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            **serializer.validated_data
        )
        
        if ticket.status == SupportTicket.Status.NEW:
            ticket.status = SupportTicket.Status.IN_PROGRESS
            ticket.save()
            
        return Response(
            TicketMessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        summary="Assign ticket",
        description="Assigns the ticket to a staff member and optionally adds an internal note.",
        request=TicketAssignSerializer,
        responses={200: SupportTicketSerializer},
        tags=['support']
    )
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketAssignSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        ticket.assigned_to = serializer.validated_data['assigned_to']
        ticket.status = SupportTicket.Status.ASSIGNED
        ticket.save()
        
        if serializer.validated_data.get('note'):
            TicketMessage.objects.create(
                ticket=ticket,
                sender=request.user,
                content=serializer.validated_data['note'],
                is_internal=True
            )
            
        return Response(
            self.get_serializer(ticket).data
        )

    @extend_schema(
        summary="Update ticket status",
        description="Changes the ticket status and optionally adds an internal note.",
        request=TicketStatusUpdateSerializer,
        responses={200: SupportTicketSerializer},
        tags=['support']
    )
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        old_status = ticket.status
        ticket.status = serializer.validated_data['status']
        
        if ticket.status == SupportTicket.Status.CLOSED:
            ticket.closed_at = timezone.now()
            
        ticket.save()
        
        if serializer.validated_data.get('note'):
            TicketMessage.objects.create(
                ticket=ticket,
                sender=request.user,
                content=serializer.validated_data['note'],
                is_internal=True
            )
            
        return Response(
            self.get_serializer(ticket).data
        )


@extend_schema_view(
    list=extend_schema(
        summary="List FAQs",
        description="Returns a list of FAQs for the current organization.",
        tags=['faq']
    ),
    create=extend_schema(
        summary="Create FAQ",
        description="Creates a new FAQ entry.",
        tags=['faq']
    ),
    retrieve=extend_schema(
        summary="Get FAQ",
        description="Returns the details of a specific FAQ entry.",
        tags=['faq']
    ),
    update=extend_schema(
        summary="Update FAQ",
        description="Updates all fields of an existing FAQ entry.",
        tags=['faq']
    ),
    partial_update=extend_schema(
        summary="Partially update FAQ",
        description="Updates specific fields of an existing FAQ entry.",
        tags=['faq']
    ),
    destroy=extend_schema(
        summary="Delete FAQ",
        description="Deletes an FAQ entry.",
        tags=['faq']
    )
)
class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        return super().get_queryset().filter(
            organization=self.request.user.organization,
            is_published=True
        )

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user
        )

    @extend_schema(
        summary="Submit FAQ feedback",
        description="Submits feedback about whether an FAQ was helpful.",
        request=FAQFeedbackSerializer,
        responses={200: FAQSerializer},
        tags=['faq']
    )
    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        faq = self.get_object()
        serializer = FAQFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if serializer.validated_data['is_helpful']:
            faq.helpful_count = F('helpful_count') + 1
        else:
            faq.not_helpful_count = F('not_helpful_count') + 1
        faq.save()
        
        return Response(
            self.get_serializer(faq).data
        )

    @extend_schema(
        summary="Record FAQ view",
        description="Increments the view count for an FAQ entry.",
        responses={200: FAQSerializer},
        tags=['faq']
    )
    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        faq = self.get_object()
        faq.view_count = F('view_count') + 1
        faq.save()
        
        return Response(
            self.get_serializer(faq).data
        )


@extend_schema_view(
    list=extend_schema(
        summary="List knowledge base articles",
        description="Returns a list of knowledge base articles for the current organization.",
        tags=['knowledge-base']
    ),
    create=extend_schema(
        summary="Create knowledge base article",
        description="Creates a new knowledge base article.",
        tags=['knowledge-base']
    ),
    retrieve=extend_schema(
        summary="Get knowledge base article",
        description="Returns the details of a specific knowledge base article.",
        tags=['knowledge-base']
    ),
    update=extend_schema(
        summary="Update knowledge base article",
        description="Updates all fields of an existing knowledge base article.",
        tags=['knowledge-base']
    ),
    partial_update=extend_schema(
        summary="Partially update knowledge base article",
        description="Updates specific fields of an existing knowledge base article.",
        tags=['knowledge-base']
    ),
    destroy=extend_schema(
        summary="Delete knowledge base article",
        description="Deletes a knowledge base article.",
        tags=['knowledge-base']
    )
)
class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeBase.objects.all()
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]
    lookup_field = 'slug'

    def get_queryset(self):
        return super().get_queryset().filter(
            organization=self.request.user.organization,
            is_published=True
        )

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user
        )

    @extend_schema(
        summary="Submit article feedback",
        description="Submits feedback about whether an article was helpful.",
        request=KnowledgeBaseFeedbackSerializer,
        responses={200: KnowledgeBaseSerializer},
        tags=['knowledge-base']
    )
    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        article = self.get_object()
        serializer = KnowledgeBaseFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if serializer.validated_data['is_helpful']:
            article.helpful_count = F('helpful_count') + 1
        else:
            article.not_helpful_count = F('not_helpful_count') + 1
        article.save()
        
        return Response(
            self.get_serializer(article).data
        )

    @extend_schema(
        summary="Record article view",
        description="Increments the view count for a knowledge base article.",
        responses={200: KnowledgeBaseSerializer},
        tags=['knowledge-base']
    )
    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        article = self.get_object()
        article.view_count = F('view_count') + 1
        article.save()
        
        return Response(
            self.get_serializer(article).data
        )


@extend_schema(
    tags=['search'],
    summary="Search support resources",
    description="Searches across tickets, FAQs, and knowledge base articles with various filters.",
    request=SupportSearchSerializer,
    responses={200: None}  # Custom response format
)
class SupportSearchViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def create(self, request):
        serializer = SupportSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Base querysets
        tickets = SupportTicket.objects.filter(
            organization=request.user.organization
        )
        faqs = FAQ.objects.filter(
            organization=request.user.organization,
            is_published=True
        )
        articles = KnowledgeBase.objects.filter(
            organization=request.user.organization,
            is_published=True
        )
        
        # Apply filters
        data = serializer.validated_data
        
        if data.get('query'):
            query = data['query']
            tickets = tickets.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(messages__content__icontains=query)
            ).distinct()
            
            faqs = faqs.filter(
                Q(question__icontains=query) |
                Q(answer__icontains=query)
            )
            
            articles = articles.filter(
                Q(title__icontains=query) |
                Q(content__icontains=query)
            )
        
        if data.get('ticket_status'):
            tickets = tickets.filter(status__in=data['ticket_status'])
            
        if data.get('ticket_priority'):
            tickets = tickets.filter(priority__in=data['ticket_priority'])
            
        if data.get('ticket_category'):
            tickets = tickets.filter(category__in=data['ticket_category'])
            
        if data.get('faq_category'):
            faqs = faqs.filter(category__in=data['faq_category'])
            
        if data.get('kb_category'):
            articles = articles.filter(category__in=data['kb_category'])
            
        if data.get('date_from'):
            tickets = tickets.filter(created_at__gte=data['date_from'])
            faqs = faqs.filter(created_at__gte=data['date_from'])
            articles = articles.filter(created_at__gte=data['date_from'])
            
        if data.get('date_to'):
            tickets = tickets.filter(created_at__lte=data['date_to'])
            faqs = faqs.filter(created_at__lte=data['date_to'])
            articles = articles.filter(created_at__lte=data['date_to'])
            
        if data.get('tags'):
            tickets = tickets.filter(tags__overlap=data['tags'])
            faqs = faqs.filter(tags__overlap=data['tags'])
            articles = articles.filter(tags__overlap=data['tags'])
        
        return Response({
            'tickets': SupportTicketSerializer(tickets, many=True).data,
            'faqs': FAQSerializer(faqs, many=True).data,
            'articles': KnowledgeBaseSerializer(articles, many=True).data
        })
