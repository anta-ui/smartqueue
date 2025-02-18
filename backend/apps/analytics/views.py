from django.db.models import Avg, Count, F, Sum, Q
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsOrganizationMember, IsOrganizationAdmin
from .models import QueueMetrics, AgentPerformance, CustomerFeedback
from .serializers import (
    QueueMetricsSerializer, AgentPerformanceSerializer,
    CustomerFeedbackSerializer, QueueMetricsAggregateSerializer,
    AgentPerformanceAggregateSerializer, FeedbackAnalysisSerializer
)

class QueueMetricsViewSet(viewsets.ModelViewSet):
    serializer_class = QueueMetricsSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        user = self.request.user
        print(f"User: {user}, User ID: {user.id}")
        organization = getattr(user, 'organization', None)
        print(f"Organization: {organization}")
        if not organization:
            print("No organization found for user")
            return QueueMetrics.objects.none()
        queryset = QueueMetrics.objects.filter(queue__queue_type__organization=organization)
        print(f"Queryset SQL: {queryset.query}")
        return queryset

    
        

    @action(detail=False, methods=['post'])
    def aggregate(self, request):
        serializer = QueueMetricsAggregateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        queryset = self.get_queryset().filter(
            date__range=[
                serializer.validated_data['date_from'],
                serializer.validated_data['date_to']
            ]
        )
        
        trunc_func = {
            'day': TruncDate,
            'week': TruncWeek,
            'month': TruncMonth
        }[serializer.validated_data['aggregate_by']]
        
        metrics = queryset.annotate(
            period=trunc_func('date')
        ).values('period').annotate(
            avg_wait_time=Avg('average_wait_time'),
            total_customers=Sum('total_customers'),
            served_customers=Sum('served_customers'),
            abandoned_customers=Sum('abandoned_customers'),
            avg_efficiency=Avg('service_efficiency')
        ).order_by('period')
        
        return Response(metrics)

    @action(detail=False, methods=['get'])
    def peak_hours_analysis(self, request):
        queryset = self.get_queryset()
        if 'queue' in request.query_params:
            queryset = queryset.filter(queue_id=request.query_params['queue'])
            
        peak_hours = {}
        for metric in queryset:
            for hour in metric.peak_hours:
                hour_str = hour.strftime('%H:00')
                peak_hours[hour_str] = peak_hours.get(hour_str, 0) + 1
                
        sorted_hours = dict(
            sorted(
                peak_hours.items(),
                key=lambda x: x[1],
                reverse=True
            )
        )
        return Response(sorted_hours)

class AgentPerformanceViewSet(viewsets.ModelViewSet):
    serializer_class = AgentPerformanceSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.user_type in ['ADMIN', 'OWNER']:
            return AgentPerformance.objects.filter(
                agent__organization=user.organization
            )
        return AgentPerformance.objects.filter(agent=user)

    @action(detail=False, methods=['post'])
    def aggregate(self, request):
        serializer = AgentPerformanceAggregateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        queryset = self.get_queryset().filter(
            date__range=[
                serializer.validated_data['date_from'],
                serializer.validated_data['date_to']
            ]
        )
        
        trunc_func = {
            'day': TruncDate,
            'week': TruncWeek,
            'month': TruncMonth
        }[serializer.validated_data['aggregate_by']]
        
        metrics = {}
        if 'customers_served' in serializer.validated_data['metrics']:
            metrics['customers_served'] = Sum('customers_served')
        if 'average_service_time' in serializer.validated_data['metrics']:
            metrics['avg_service_time'] = Avg('average_service_time')
        if 'service_rating' in serializer.validated_data['metrics']:
            metrics['avg_rating'] = Avg('service_rating')
            
        results = queryset.annotate(
            period=trunc_func('date')
        ).values('agent', 'period').annotate(**metrics).order_by('agent', 'period')
        
        return Response(results)

    @action(detail=False, methods=['get'])
    def ranking(self, request):
        date_from = request.query_params.get(
            'date_from',
            timezone.now().date().isoformat()
        )
        metrics = request.query_params.getlist('metrics', ['customers_served'])
        
        queryset = self.get_queryset().filter(date=date_from)
        
        rankings = {}
        for metric in metrics:
            if metric == 'customers_served':
                ranking = queryset.values(
                    'agent__username'
                ).annotate(
                    value=F('customers_served')
                ).order_by('-value')
            elif metric == 'service_rating':
                ranking = queryset.values(
                    'agent__username'
                ).annotate(
                    value=F('service_rating')
                ).order_by('-value')
                
            rankings[metric] = ranking
            
        return Response(rankings)

class CustomerFeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerFeedbackSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        user = self.request.user
        print(f"User: {user}, User ID: {user.id}")
        organization = getattr(user, 'organization', None)
        print(f"Organization: {organization}")
        if not organization:
            print("No organization found for user")
            return CustomerFeedback.objects.none()
        queryset = CustomerFeedback.objects.filter(
            ticket__queue__queue_type__organization=organization
        )
        print(f"Queryset SQL: {queryset.query}")
        return queryset

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        serializer = FeedbackAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        queryset = self.get_queryset().filter(
            created_at__date__range=[
                serializer.validated_data['date_from'],
                serializer.validated_data['date_to']
            ]
        )
        
        group_field = serializer.validated_data['group_by']
        analysis = queryset.values(
            group_field
        ).annotate(
            count=Count('id'),
            percentage=Count('id') * 100.0 / queryset.count()
        ).order_by(group_field)
        
        if serializer.validated_data['include_comments']:
            for item in analysis:
                item['comments'] = list(
                    queryset.filter(
                        **{group_field: item[group_field]},
                        comment__isnull=False
                    ).values_list('comment', flat=True)
                )
                
        return Response(analysis)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.get_queryset()
        
        summary = {
            'total_feedback': queryset.count(),
            'average_rating': queryset.aggregate(
                Avg('rating')
            )['rating__avg'],
            'average_wait_time_satisfaction': queryset.aggregate(
                Avg('wait_time_satisfaction')
            )['wait_time_satisfaction__avg'],
            'average_service_satisfaction': queryset.aggregate(
                Avg('service_satisfaction')
            )['service_satisfaction__avg'],
            'rating_distribution': queryset.values(
                'rating'
            ).annotate(
                count=Count('id')
            ).order_by('rating')
        }
        
        return Response(summary)