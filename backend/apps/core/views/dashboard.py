from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Log pour vérifier l'utilisateur authentifié
        print(f"Utilisateur connecté : {request.user}")
        
        try:
            stats = {
                'totalQueues': 0,
                'activeQueues': 0,
                'totalTickets': 0,
                'averageWaitTime': 0
            }
            return Response(stats)
        except Exception as e:
            print(f"Erreur lors de la récupération des stats : {e}")
            return Response({"error": "Impossible de récupérer les statistiques"}, status=500)
class OrganizationLocationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Exemple de données d'emplacement
            locations = [
                {
                    "id": 1,
                    "name": "Siège Social Paris",
                    "lat": 48.8566,
                    "lng": 2.3522
                },
                {
                    "id": 2,
                    "name": "Agence Lyon",
                    "lat": 45.7640,
                    "lng": 4.8357
                }
            ]
            return Response(locations)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class AlertsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Exemple d'alertes
            alerts = [
                "Ticket en attente depuis plus de 24h",
                "Charge de travail élevée dans la file d'attente Support",
                "Performance des agents en baisse cette semaine"
            ]
            return Response(alerts)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


logger = logging.getLogger(__name__)

class MetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.info("MetricsView GET called")
        print("MetricsView GET called") # Log console pour débogage immédiat
        try:
            metrics = {
                'system_metrics': {
                    'cpu_usage': 45.2,
                    'memory_usage': 68.7,
                    'disk_usage': 52.3
                },
                'application_metrics': {
                    'active_users': 156,
                    'requests_per_minute': 42,
                    'average_response_time': '125ms'
                },
                'timestamp': datetime.now().isoformat()
            }
            logger.info("Metrics data prepared successfully")
            return Response(metrics)
        except Exception as e:
            logger.error(f"Error in MetricsView: {str(e)}")
            return Response(
                {"error": "Internal server error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ServiceStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.info("ServiceStatusView GET called")
        print("ServiceStatusView GET called")
        try:
            services_status = {
                'status': 'healthy',
                'services': {
                    'database': {
                        'status': 'operational',
                        'latency': '20ms'
                    },
                    'queue_service': {
                        'status': 'operational',
                        'active_queues': 5
                    },
                    'notification_service': {
                        'status': 'operational',
                        'pending_notifications': 0
                    }
                },
                'last_updated': datetime.now().isoformat()
            }
            logger.info("Service status data prepared successfully")
            return Response(services_status)
        except Exception as e:
            logger.error(f"Error in ServiceStatusView: {str(e)}")
            return Response(
                {"error": "Internal server error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UsageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            period = request.query_params.get('period', 'month')
            usage_data = {
                'period': period,
                'total_requests': 15234,
                'unique_users': 427,
                'peak_concurrent_users': 89,
                'average_session_duration': '24m',
                'top_features': [
                    {'name': 'queue_management', 'usage_count': 5234},
                    {'name': 'notifications', 'usage_count': 3123},
                    {'name': 'analytics', 'usage_count': 2891}
                ],
                'generated_at': datetime.now().isoformat()
            }
            return Response(usage_data)
        except Exception as e:
            logger.error(f"Error in UsageView: {str(e)}")
            return Response(
                {"error": "Internal server error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )