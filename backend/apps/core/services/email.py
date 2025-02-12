from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service pour l'envoi d'emails"""

    @staticmethod
    def _send_email(subject, to_email, template_name, context):
        """
        Méthode utilitaire pour envoyer un email
        """
        try:
            # Ajouter des variables communes au contexte
            context.update({
                'year': timezone.now().year,
                'site_name': 'SmartQueue',
                'site_url': settings.FRONTEND_URL,
            })

            # Rendre le template HTML
            html_content = render_to_string(f'emails/{template_name}.html', context)
            text_content = strip_tags(html_content)  # Version texte de l'email

            # Créer le message
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[to_email]
            )
            msg.attach_alternative(html_content, "text/html")

            # Envoyer l'email
            msg.send()
            return True

        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de l'email à {to_email}: {str(e)}")
            return False

    @classmethod
    def send_password_reset(cls, user, token):
        """
        Envoie un email de réinitialisation de mot de passe
        """
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
        context = {
            'user': user,
            'reset_url': reset_url,
        }
        return cls._send_email(
            subject="Réinitialisation de votre mot de passe SmartQueue",
            to_email=user.email,
            template_name="password_reset",
            context=context
        )

    @classmethod
    def send_email_verification(cls, user, token):
        """
        Envoie un email de vérification
        """
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
        context = {
            'user': user,
            'verification_url': verification_url,
        }
        return cls._send_email(
            subject="Vérifiez votre adresse email SmartQueue",
            to_email=user.email,
            template_name="email_verification",
            context=context
        )

    @classmethod
    def send_session_notification(cls, user, session):
        """
        Envoie une notification de nouvelle connexion
        """
        context = {
            'user': user,
            'session': session,
            'date': timezone.now().strftime("%d/%m/%Y %H:%M"),
        }
        return cls._send_email(
            subject="Nouvelle connexion à votre compte SmartQueue",
            to_email=user.email,
            template_name="new_session",
            context=context
        )
