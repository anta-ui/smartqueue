from django.db import models
from django.utils.translation import gettext_lazy as _


class OrganizationBranch(models.Model):
    """Succursale d'une organisation"""
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='branches'
    )
    name = models.CharField(_('name'), max_length=255, default='Unknown')
    code = models.CharField(_('code'), max_length=50, unique=True, default='Unknown')
    address = models.TextField(_('address'), blank=True)
    city = models.CharField(_('city'), max_length=100, default='Unknown')
    country = models.CharField(_('country'), max_length=100, default='Unknown')
    phone = models.CharField(_('phone'), max_length=20, blank=True)
    email = models.EmailField(_('email'), blank=True)
    latitude = models.DecimalField(
        _('latitude'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        _('longitude'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    timezone = models.CharField(
        _('timezone'),
        max_length=50,
        default='UTC'
    )
    opening_hours = models.JSONField(
        _('opening hours'),
        default=dict,
        help_text=_('Opening hours for each day of the week')
    )
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('organization branch')
        verbose_name_plural = _('organization branches')
        ordering = ['name']
        unique_together = ['organization', 'code']

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    @property
    def full_address(self):
        """Retourne l'adresse complète de la succursale"""
        parts = [self.address, self.city, self.country]
        return ', '.join(filter(None, parts))

    def get_opening_hours(self, day_of_week):
        """Retourne les heures d'ouverture pour un jour donné"""
        return self.opening_hours.get(str(day_of_week), {})

    def is_open(self, current_time=None):
        """Vérifie si la succursale est ouverte à un moment donné"""
        if not current_time:
            from django.utils import timezone
            current_time = timezone.localtime()

        # Si la succursale n'est pas active, elle est fermée
        if not self.is_active:
            return False

        # Récupérer les heures d'ouverture pour le jour actuel
        day_hours = self.get_opening_hours(current_time.weekday())
        if not day_hours:
            return False

        # Convertir l'heure actuelle en minutes depuis minuit
        current_minutes = current_time.hour * 60 + current_time.minute

        # Vérifier si l'heure actuelle est dans une des plages horaires
        for time_range in day_hours.get('ranges', []):
            start_minutes = self._time_to_minutes(time_range['start'])
            end_minutes = self._time_to_minutes(time_range['end'])
            
            if start_minutes <= current_minutes <= end_minutes:
                return True

        return False

    @staticmethod
    def _time_to_minutes(time_str):
        """Convertit une chaîne HH:MM en minutes depuis minuit"""
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes
