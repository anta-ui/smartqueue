from django.db import models
from django.contrib.postgres.fields import ArrayField
from apps.queues.models import Queue, ServicePoint
from apps.core.models import BaseModel


class MLModel(BaseModel):
    """Modèle de base pour stocker les métadonnées des modèles ML"""
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    type = models.CharField(
        max_length=20,
        choices=[
            ('wait_time', 'Prédiction temps d\'attente'),
            ('resource_opt', 'Optimisation des ressources'),
            ('anomaly', 'Détection d\'anomalies'),
            ('nlp', 'Traitement du langage naturel'),
        ]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('training', 'En entraînement'),
            ('active', 'Actif'),
            ('inactive', 'Inactif'),
            ('failed', 'Échec'),
        ],
        default='inactive'
    )
    metrics = models.JSONField(default=dict)
    parameters = models.JSONField(default=dict)
    file_path = models.CharField(max_length=255)

    class Meta:
        ordering = ['-created_at']


class WaitTimePrediction(BaseModel):
    """Stockage des prédictions de temps d'attente"""
    queue = models.ForeignKey(Queue, on_delete=models.CASCADE)
    model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True)
    predicted_wait_time = models.IntegerField()  # en minutes
    actual_wait_time = models.IntegerField(null=True)  # pour le suivi
    confidence = models.FloatField()
    features_used = models.JSONField()
    prediction_factors = ArrayField(
        models.CharField(max_length=100),
        default=list
    )
    is_accurate = models.BooleanField(null=True)  # pour l'évaluation

    class Meta:
        ordering = ['-created_at']


class ResourceOptimization(BaseModel):
    """Suggestions d'optimisation des ressources"""
    service_point = models.ForeignKey(ServicePoint, on_delete=models.CASCADE)
    model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True)
    current_load = models.FloatField()
    suggested_action = models.CharField(
        max_length=20,
        choices=[
            ('add', 'Ajouter des ressources'),
            ('remove', 'Retirer des ressources'),
            ('reassign', 'Réassigner'),
        ]
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('high', 'Haute'),
            ('medium', 'Moyenne'),
            ('low', 'Basse'),
        ]
    )
    expected_impact = models.JSONField()
    was_applied = models.BooleanField(default=False)
    actual_impact = models.JSONField(null=True)  # pour le suivi

    class Meta:
        ordering = ['-created_at']


class ChatSession(BaseModel):
    """Sessions de chat avec l'assistant IA"""
    session_id = models.CharField(max_length=100, unique=True)
    user_id = models.CharField(max_length=100)
    context = models.JSONField(default=dict)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('resolved', 'Résolue'),
            ('escalated', 'Escaladée'),
        ],
        default='active'
    )
    metadata = models.JSONField(default=dict)

    class Meta:
        ordering = ['-created_at']


class ChatMessage(BaseModel):
    """Messages individuels dans une session de chat"""
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=20,
        choices=[
            ('user', 'Utilisateur'),
            ('assistant', 'Assistant'),
            ('system', 'Système'),
        ]
    )
    content = models.TextField()
    intent = models.CharField(max_length=100, null=True)
    confidence = models.FloatField(null=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        ordering = ['created_at']


class QueueAnomaly(BaseModel):
    """Anomalies détectées dans les files d'attente"""
    queue = models.ForeignKey(Queue, on_delete=models.CASCADE)
    model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True)
    type = models.CharField(
        max_length=20,
        choices=[
            ('wait_time', 'Temps d\'attente'),
            ('abandonment', 'Abandon'),
            ('service_time', 'Temps de service'),
            ('pattern', 'Motif inhabituel'),
        ]
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('critical', 'Critique'),
            ('high', 'Haute'),
            ('medium', 'Moyenne'),
            ('low', 'Basse'),
        ]
    )
    metrics = models.JSONField()
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('detected', 'Détectée'),
            ('investigating', 'En investigation'),
            ('resolved', 'Résolue'),
            ('false_positive', 'Faux positif'),
        ],
        default='detected'
    )
    resolution = models.JSONField(null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Queue anomalies'
