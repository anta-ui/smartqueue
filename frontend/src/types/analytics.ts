// services/analytics.service.ts
import { api } from '@/services/api';
import Cookies from 'js-cookie';
interface QueueMetric {
  id: number;
  date: string;
  total_tickets: number;
  served_tickets: number;
  cancelled_tickets: number;
  no_shows: number;
  average_wait_time: number;
  average_service_time: number;
  peak_hours: { [hour: string]: number };
  satisfaction_score: number;
}

interface AgentMetric {
  id: number;
  agent: {
    id: number;
    name: string;
    email: string;
  };
  customers_served: number;
  average_service_time: number;
  service_rating: number;
}

interface FeedbackSummary {
    total_feedback: number;
    average_rating: number | null;
    average_wait_time_satisfaction: number | null;
    average_service_satisfaction: number | null;
    rating_distribution: Array<{
      rating: number;
      count: number;
    }>;
  }



const getAuthHeaders = () => {
  const token = Cookies.get('access_token') || localStorage.getItem('access_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const analyticsService = {
    getQueueMetrics: async () => {
      try {
        const response = await api.get('/analytics/queue-metrics/', {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        console.error('Erreur lors de la récupération des métriques de la file d\'attente :', error);
        return [];
      }
    },
  
    getAgentPerformance: async () => {
      try {
        const response = await api.get('/analytics/agent-performance/', {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        console.error('Erreur lors de la récupération des performances des agents :', error);
        return [];
      }
    },
  
    getFeedbackSummary: async () => {
      try {
        const response = await api.get('/analytics/customer-feedback/summary/', {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        console.error('Erreur lors de la récupération du résumé des retours :', error);
        return {
          total_feedback: 0,
          average_rating: 0,
          average_wait_time_satisfaction: 0,
          average_service_satisfaction: 0,
          rating_distribution: []
        };
      }
    }
  };
  
  // Fonction utilitaire pour récupérer le token
  function getToken() {
    return Cookies.get('access_token') || localStorage.getItem('access_token');
  }