from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

from .models import SupportTicket, TicketMessage


@receiver(post_save, sender=SupportTicket)
def handle_ticket_status_change(sender, instance, created, **kwargs):
    """
    Signal handler for ticket status changes.
    Sends notifications and updates related fields.
    """
    if created:
        # Send notification to support team
        subject = f'New Support Ticket: {instance.reference_number}'
        message = render_to_string('support/email/new_ticket.html', {
            'ticket': instance
        })
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [instance.organization.settings.notification_email],
            html_message=message
        )
    else:
        old_instance = SupportTicket.objects.get(pk=instance.pk)
        if old_instance.status != instance.status:
            # Status has changed
            if instance.status == SupportTicket.Status.RESOLVED:
                instance.resolved_at = timezone.now()
            elif instance.status == SupportTicket.Status.CLOSED:
                instance.closed_at = timezone.now()

            # Send status update notification
            subject = f'Ticket Status Updated: {instance.reference_number}'
            message = render_to_string('support/email/status_update.html', {
                'ticket': instance,
                'old_status': old_instance.get_status_display(),
                'new_status': instance.get_status_display()
            })
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [instance.created_by.email],
                html_message=message
            )


@receiver(post_save, sender=TicketMessage)
def handle_new_message(sender, instance, created, **kwargs):
    """
    Signal handler for new ticket messages.
    Updates ticket status and sends notifications.
    """
    if created and not instance.is_internal:
        ticket = instance.ticket
        
        # Update ticket status
        if instance.sender == ticket.created_by:
            if ticket.status == SupportTicket.Status.RESOLVED:
                ticket.status = SupportTicket.Status.PENDING
                ticket.save()
        else:
            if ticket.status in [SupportTicket.Status.NEW, SupportTicket.Status.PENDING]:
                ticket.status = SupportTicket.Status.IN_PROGRESS
                ticket.save()

        # Send notification
        subject = f'New Message on Ticket: {ticket.reference_number}'
        message = render_to_string('support/email/new_message.html', {
            'ticket': ticket,
            'message': instance
        })
        
        # Determine recipient
        if instance.sender == ticket.created_by:
            recipient = ticket.assigned_to.email if ticket.assigned_to else ticket.organization.settings.notification_email
        else:
            recipient = ticket.created_by.email

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            html_message=message
        )
