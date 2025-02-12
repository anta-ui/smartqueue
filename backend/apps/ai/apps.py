from django.apps import AppConfig


class AIConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ai'
    verbose_name = 'Intelligence Artificielle'

    def ready(self):
        """Initialisation de l'application"""
        try:
            # Import des tâches périodiques
            from .tasks import (
                train_wait_time_models,
                update_resource_optimization,
                check_for_anomalies
            )
            
            # Configuration des tâches Celery
            from django_celery_beat.models import PeriodicTask, IntervalSchedule
            
            # Entraînement des modèles (tous les jours à minuit)
            schedule, _ = IntervalSchedule.objects.get_or_create(
                every=1,
                period=IntervalSchedule.DAYS,
            )
            PeriodicTask.objects.get_or_create(
                name='train_wait_time_models',
                task='apps.ai.tasks.train_wait_time_models',
                interval=schedule,
            )
            
            # Optimisation des ressources (toutes les 15 minutes)
            schedule, _ = IntervalSchedule.objects.get_or_create(
                every=15,
                period=IntervalSchedule.MINUTES,
            )
            PeriodicTask.objects.get_or_create(
                name='update_resource_optimization',
                task='apps.ai.tasks.update_resource_optimization',
                interval=schedule,
            )
            
            # Détection d'anomalies (toutes les 5 minutes)
            schedule, _ = IntervalSchedule.objects.get_or_create(
                every=5,
                period=IntervalSchedule.MINUTES,
            )
            PeriodicTask.objects.get_or_create(
                name='check_for_anomalies',
                task='apps.ai.tasks.check_for_anomalies',
                interval=schedule,
            )
            
        except Exception as e:
            print(f"Erreur lors de l'initialisation des tâches AI : {e}")
            # Ne pas bloquer le démarrage de l'application
