import csv
import json
from datetime import timedelta
from django.http import HttpResponse, FileResponse
from django.db.models import Q
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsOrganizationMember, IsOrganizationAdmin
from .models import AuditLog, AuditPolicy, AuditExport
from .serializers import (
    AuditLogSerializer, AuditPolicySerializer,
    AuditExportSerializer, AuditSearchSerializer
)

class AuditLogViewSet(viewsets.ModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]
    http_method_names = ['get', 'head', 'options']  # Lecture seule

    def get_queryset(self):
        return AuditLog.objects.filter(
            organization=self.request.user.organization
        )

    @action(detail=False, methods=['post'])
    def search(self, request):
        serializer = AuditSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        queryset = self.get_queryset()
        
        # Appliquer les filtres
        if serializer.validated_data.get('date_from'):
            queryset = queryset.filter(
                created_at__gte=serializer.validated_data['date_from']
            )
            
        if serializer.validated_data.get('date_to'):
            queryset = queryset.filter(
                created_at__lte=serializer.validated_data['date_to']
            )
            
        if serializer.validated_data.get('action_types'):
            queryset = queryset.filter(
                action_type__in=serializer.validated_data['action_types']
            )
            
        if serializer.validated_data.get('categories'):
            queryset = queryset.filter(
                category__in=serializer.validated_data['categories']
            )
            
        if serializer.validated_data.get('severities'):
            queryset = queryset.filter(
                severity__in=serializer.validated_data['severities']
            )
            
        if serializer.validated_data.get('actor_id'):
            queryset = queryset.filter(
                actor_id=serializer.validated_data['actor_id']
            )
            
        if serializer.validated_data.get('content_type'):
            app_label, model = serializer.validated_data['content_type'].split('.')
            content_type = ContentType.objects.get(
                app_label=app_label,
                model=model
            )
            queryset = queryset.filter(content_type=content_type)
            
        if serializer.validated_data.get('object_id'):
            queryset = queryset.filter(
                object_id=serializer.validated_data['object_id']
            )
            
        if serializer.validated_data.get('search_term'):
            search_term = serializer.validated_data['search_term']
            queryset = queryset.filter(
                Q(description__icontains=search_term) |
                Q(details__icontains=search_term) |
                Q(changes__icontains=search_term)
            )
            
        return Response(
            self.get_serializer(queryset, many=True).data
        )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.get_queryset()
        
        # Résumé par type d'action
        action_summary = {
            action[0]: queryset.filter(action_type=action[0]).count()
            for action in AuditLog.ActionType.choices
        }
        
        # Résumé par catégorie
        category_summary = {
            category[0]: queryset.filter(category=category[0]).count()
            for category in AuditLog.Category.choices
        }
        
        # Résumé par sévérité
        severity_summary = {
            severity[0]: queryset.filter(severity=severity[0]).count()
            for severity in AuditLog.Severity.choices
        }
        
        return Response({
            'action_summary': action_summary,
            'category_summary': category_summary,
            'severity_summary': severity_summary,
            'total_logs': queryset.count()
        })

class AuditPolicyViewSet(viewsets.ModelViewSet):
    serializer_class = AuditPolicySerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return AuditPolicy.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def clean_old_logs(self, request, pk=None):
        policy = self.get_object()
        
        # Calculer la date limite selon la période de rétention
        if policy.retention_unit == AuditPolicy.RetentionUnit.DAYS:
            delta = timedelta(days=policy.retention_period)
        elif policy.retention_unit == AuditPolicy.RetentionUnit.WEEKS:
            delta = timedelta(weeks=policy.retention_period)
        elif policy.retention_unit == AuditPolicy.RetentionUnit.MONTHS:
            delta = timedelta(days=policy.retention_period * 30)
        else:  # YEARS
            delta = timedelta(days=policy.retention_period * 365)
            
        cutoff_date = timezone.now() - delta
        
        # Supprimer les anciens logs
        deleted_count = AuditLog.objects.filter(
            organization=policy.organization,
            created_at__lt=cutoff_date
        ).delete()[0]
        
        return Response({'deleted_count': deleted_count})

class AuditExportViewSet(viewsets.ModelViewSet):
    serializer_class = AuditExportSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return AuditExport.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        export = serializer.save(
            organization=self.request.user.organization,
            requested_by=self.request.user
        )
        
        try:
            self.generate_export(export)
        except Exception as e:
            export.status = AuditExport.Status.FAILED
            export.error_message = str(e)
            export.save()
            raise serializers.ValidationError(str(e))

    def generate_export(self, export):
        # Mettre à jour le statut
        export.status = AuditExport.Status.PROCESSING
        export.save()
        
        try:
            # Récupérer les logs selon les critères
            logs = AuditLog.objects.filter(
                organization=export.organization,
                created_at__range=[export.date_from, export.date_to],
                category__in=export.categories,
                severity__gte=export.min_severity
            )
            
            # Générer le fichier selon le format
            if export.format == AuditExport.Format.CSV:
                self.generate_csv_export(export, logs)
            elif export.format == AuditExport.Format.JSON:
                self.generate_json_export(export, logs)
            elif export.format == AuditExport.Format.EXCEL:
                self.generate_excel_export(export, logs)
            
            # Mettre à jour le statut
            export.status = AuditExport.Status.COMPLETED
            export.completed_at = timezone.now()
            export.save()
            
        except Exception as e:
            export.status = AuditExport.Status.FAILED
            export.error_message = str(e)
            export.save()
            raise

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        export = self.get_object()
        if export.file:
            return FileResponse(
                export.file,
                as_attachment=True,
                filename=f"audit_export_{export.created_at:%Y%m%d_%H%M}.{export.format.lower()}"
            )
        return Response(
            {'error': _('Export file not found.')},
            status=status.HTTP_404_NOT_FOUND
        )
