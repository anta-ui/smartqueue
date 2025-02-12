from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.queues.models import Queue, ServicePoint
from apps.ai.models import (
    WaitTimePrediction,
    ResourceOptimization,
    ChatSession,
    QueueAnomaly
)
from apps.ai.ml.wait_time.predictor import WaitTimePredictor
from apps.ai.ml.resource_opt.optimizer import ResourceOptimizer
from apps.ai.ml.anomaly.detector import AnomalyDetector
from apps.ai.ml.chatbot.assistant import AIAssistant


class AIViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='wait-time')
    def predict_wait_time(self, request, pk=None):
        """Prédit le temps d'attente pour une file donnée"""
        queue = get_object_or_404(Queue, pk=pk)
        predictor = WaitTimePredictor(queue.id)
        prediction = predictor.predict(queue)
        return Response(prediction)

    @action(detail=True, methods=['get'], url_path='resource-optimization')
    def optimize_resources(self, request, pk=None):
        """Génère des suggestions d'optimisation des ressources"""
        service_point = get_object_or_404(ServicePoint, pk=pk)
        optimizer = ResourceOptimizer(service_point.id)
        suggestions = optimizer.generate_suggestions()
        return Response(suggestions)

    @action(detail=False, methods=['post'], url_path='chat/session')
    def create_chat_session(self, request):
        """Crée une nouvelle session de chat"""
        assistant = AIAssistant()
        session = assistant.create_session(
            user_id=request.user.id,
            context=request.data.get('context', {})
        )
        return Response(session)

    @action(detail=True, methods=['post'], url_path='chat/message')
    def send_chat_message(self, request, pk=None):
        """Envoie un message dans une session de chat existante"""
        session = get_object_or_404(ChatSession, pk=pk)
        assistant = AIAssistant()
        response = assistant.process_message(
            session_id=session.id,
            message=request.data.get('message')
        )
        return Response(response)

    @action(detail=True, methods=['get'], url_path='anomalies')
    def detect_anomalies(self, request, pk=None):
        """Détecte les anomalies dans une file d'attente"""
        queue = get_object_or_404(Queue, pk=pk)
        detector = AnomalyDetector(queue.id)
        anomalies = detector.detect()
        return Response(anomalies)

    @action(detail=True, methods=['post'], url_path='anomalies/(?P<anomaly_id>[^/.]+)/investigate')
    def investigate_anomaly(self, request, pk=None, anomaly_id=None):
        """Lance une investigation sur une anomalie détectée"""
        anomaly = get_object_or_404(QueueAnomaly, pk=anomaly_id)
        detector = AnomalyDetector(anomaly.queue.id)
        investigation = detector.investigate(anomaly)
        return Response(investigation)

    @action(detail=True, methods=['post'], url_path='anomalies/(?P<anomaly_id>[^/.]+)/resolve')
    def resolve_anomaly(self, request, pk=None, anomaly_id=None):
        """Marque une anomalie comme résolue"""
        anomaly = get_object_or_404(QueueAnomaly, pk=anomaly_id)
        detector = AnomalyDetector(anomaly.queue.id)
        resolution = detector.resolve(
            anomaly,
            resolution_data=request.data
        )
        return Response(resolution)
