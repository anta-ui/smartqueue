from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import EmailValidator
from .models import ReportTemplate, ScheduledReport, GeneratedReport

class ReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTemplate
        fields = '__all__'
        read_only_fields = ['organization']

    def validate_parameters(self, value):
        required_params = {
            ReportTemplate.ReportType.QUEUE_PERFORMANCE: ['queue_ids', 'date_range'],
            ReportTemplate.ReportType.AGENT_PERFORMANCE: ['agent_ids', 'metrics'],
            ReportTemplate.ReportType.CUSTOMER_SATISFACTION: ['date_range', 'include_comments'],
            ReportTemplate.ReportType.SYSTEM_USAGE: ['modules', 'date_range']
        }
        
        report_type = self.initial_data.get('report_type')
        if report_type in required_params:
            missing_params = [
                param for param in required_params[report_type]
                if param not in value
            ]
            if missing_params:
                raise serializers.ValidationError(
                    _('Missing required parameters: {}').format(', '.join(missing_params))
                )
        return value

class ScheduledReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledReport
        fields = '__all__'
        read_only_fields = ['next_run', 'last_run', 'created_by']

    def validate_recipients(self, value):
        email_validator = EmailValidator()
        invalid_emails = []
        
        for email in value:
            try:
                email_validator(email)
            except:
                invalid_emails.append(email)
                
        if invalid_emails:
            raise serializers.ValidationError(
                _('Invalid email addresses: {}').format(', '.join(invalid_emails))
            )
        return value

    def validate_parameters(self, value):
        template = self.initial_data.get('template')
        if template:
            template_obj = ReportTemplate.objects.get(id=template)
            required_params = template_obj.parameters.keys()
            missing_params = [
                param for param in required_params
                if param not in value
            ]
            if missing_params:
                raise serializers.ValidationError(
                    _('Missing required parameters: {}').format(', '.join(missing_params))
                )
        return value

    def validate_frequency(self, value):
        if value == ScheduledReport.Frequency.DAILY:
            self.calculate_next_run = lambda: timezone.now() + timezone.timedelta(days=1)
        elif value == ScheduledReport.Frequency.WEEKLY:
            self.calculate_next_run = lambda: timezone.now() + timezone.timedelta(weeks=1)
        elif value == ScheduledReport.Frequency.MONTHLY:
            self.calculate_next_run = lambda: (
                timezone.now().replace(day=1) + timezone.timedelta(days=32)
            ).replace(day=1)
        elif value == ScheduledReport.Frequency.QUARTERLY:
            self.calculate_next_run = lambda: (
                timezone.now().replace(day=1) + timezone.timedelta(days=95)
            ).replace(day=1)
        elif value == ScheduledReport.Frequency.YEARLY:
            self.calculate_next_run = lambda: timezone.now().replace(
                year=timezone.now().year + 1,
                month=1,
                day=1
            )
        return value

    def create(self, validated_data):
        validated_data['next_run'] = self.calculate_next_run()
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class GeneratedReportSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    template_name = serializers.CharField(source='template.name', read_only=True)
    generated_by_name = serializers.CharField(
        source='generated_by.get_full_name',
        read_only=True
    )

    class Meta:
        model = GeneratedReport
        fields = '__all__'
        read_only_fields = [
            'file', 'status', 'error_message',
            'generated_by', 'completed_at'
        ]

    def get_download_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

    def validate(self, data):
        template = data.get('template')
        if template:
            required_params = template.parameters.keys()
            provided_params = data.get('parameters', {}).keys()
            missing_params = set(required_params) - set(provided_params)
            
            if missing_params:
                raise serializers.ValidationError(
                    _('Missing required parameters: {}').format(', '.join(missing_params))
                )
        return data

class ReportPreviewSerializer(serializers.Serializer):
    template = serializers.PrimaryKeyRelatedField(
        queryset=ReportTemplate.objects.all()
    )
    parameters = serializers.JSONField(required=False, default=dict)

    def validate(self, data):
        template = data['template']
        required_params = template.parameters.keys()
        provided_params = data.get('parameters', {}).keys()
        missing_params = set(required_params) - set(provided_params)
        
        if missing_params:
            raise serializers.ValidationError(
                _('Missing required parameters: {}').format(', '.join(missing_params))
            )
        return data
