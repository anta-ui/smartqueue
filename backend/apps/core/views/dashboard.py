from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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