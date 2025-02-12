from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import GeneratedReport


@receiver(post_save, sender=GeneratedReport)
def handle_report_generation(sender, instance, created, **kwargs):
    """
    Signal handler for when a report is generated.
    This can be used to send notifications or trigger other actions.
    """
    if created:
        # Vous pouvez ajouter ici la logique pour envoyer des notifications
        # ou effectuer d'autres actions lorsqu'un rapport est généré
        pass


@receiver(post_delete, sender=GeneratedReport)
def handle_report_deletion(sender, instance, **kwargs):
    """
    Signal handler for when a report is deleted.
    This can be used to clean up associated files or perform other cleanup tasks.
    """
    # Supprimer le fichier physique si nécessaire
    if instance.file:
        instance.file.delete(save=False)
