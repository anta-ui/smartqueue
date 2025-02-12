import io
import csv
import xlsxwriter
from django.http import HttpResponse, FileResponse
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsOrganizationMember, IsOrganizationAdmin
from .models import ReportTemplate, ScheduledReport, GeneratedReport
from .serializers import (
    ReportTemplateSerializer, ScheduledReportSerializer,
    GeneratedReportSerializer, ReportPreviewSerializer
)

class ReportTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return ReportTemplate.objects.filter(
            organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        template = self.get_object()
        serializer = ReportPreviewSerializer(data={
            'template': template.id,
            'parameters': request.data.get('parameters', {})
        })
        serializer.is_valid(raise_exception=True)
        
        try:
            # Générer un aperçu du rapport
            preview_data = self.generate_report_preview(
                template,
                serializer.validated_data['parameters']
            )
            return Response(preview_data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def generate_report_preview(self, template, parameters):
        # Logique de génération d'aperçu selon le type de rapport
        if template.report_type == ReportTemplate.ReportType.QUEUE_PERFORMANCE:
            return self.generate_queue_performance_preview(parameters)
        elif template.report_type == ReportTemplate.ReportType.AGENT_PERFORMANCE:
            return self.generate_agent_performance_preview(parameters)
        # ... autres types de rapports
        return {}

class ScheduledReportViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduledReportSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return ScheduledReport.objects.filter(
            template__organization=self.request.user.organization
        )

    @action(detail=True, methods=['post'])
    def run_now(self, request, pk=None):
        schedule = self.get_object()
        
        # Créer un rapport généré
        report = GeneratedReport.objects.create(
            template=schedule.template,
            schedule=schedule,
            name=f"{schedule.name} - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            parameters=schedule.parameters,
            generated_by=request.user
        )
        
        try:
            # Générer le rapport
            self.generate_report(report)
            return Response(GeneratedReportSerializer(report).data)
        except Exception as e:
            report.status = GeneratedReport.Status.FAILED
            report.error_message = str(e)
            report.save()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def generate_report(self, report):
        # Mettre à jour le statut
        report.status = GeneratedReport.Status.GENERATING
        report.save()
        
        try:
            # Générer le contenu selon le format
            if report.template.format == ReportTemplate.Format.PDF:
                self.generate_pdf_report(report)
            elif report.template.format == ReportTemplate.Format.EXCEL:
                self.generate_excel_report(report)
            elif report.template.format == ReportTemplate.Format.CSV:
                self.generate_csv_report(report)
            elif report.template.format == ReportTemplate.Format.HTML:
                self.generate_html_report(report)
            
            # Mettre à jour le statut
            report.status = GeneratedReport.Status.COMPLETED
            report.completed_at = timezone.now()
            report.save()
            
        except Exception as e:
            report.status = GeneratedReport.Status.FAILED
            report.error_message = str(e)
            report.save()
            raise

class GeneratedReportViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedReportSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        return GeneratedReport.objects.filter(
            template__organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        report = serializer.save(generated_by=self.request.user)
        try:
            # Générer le rapport
            self.generate_report(report)
        except Exception as e:
            report.status = GeneratedReport.Status.FAILED
            report.error_message = str(e)
            report.save()
            raise serializers.ValidationError(str(e))

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        report = self.get_object()
        if report.file:
            return FileResponse(
                report.file,
                as_attachment=True,
                filename=f"{report.name}.{report.template.format.lower()}"
            )
        return Response(
            {'error': _('Report file not found.')},
            status=status.HTTP_404_NOT_FOUND
        )

    def generate_report(self, report):
        # Mettre à jour le statut
        report.status = GeneratedReport.Status.GENERATING
        report.save()
        
        try:
            # Générer le contenu selon le format
            if report.template.format == ReportTemplate.Format.PDF:
                self.generate_pdf_report(report)
            elif report.template.format == ReportTemplate.Format.EXCEL:
                self.generate_excel_report(report)
            elif report.template.format == ReportTemplate.Format.CSV:
                self.generate_csv_report(report)
            elif report.template.format == ReportTemplate.Format.HTML:
                self.generate_html_report(report)
            
            # Mettre à jour le statut
            report.status = GeneratedReport.Status.COMPLETED
            report.completed_at = timezone.now()
            report.save()
            
        except Exception as e:
            report.status = GeneratedReport.Status.FAILED
            report.error_message = str(e)
            report.save()
            raise
