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