// services/metricsService.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Metrics {
  activeOrgs: number;
  mrr: number;
  systemUsage: number;
  systemHealth: number;
}

export interface ServiceStatus {
  api: 'healthy' | 'degraded' | 'down';
  websocket: 'healthy' | 'degraded' | 'down';
  thirdParty: 'healthy' | 'degraded' | 'down';
}

export interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
}

export interface UsageData {
  date: string;
  value: number;
}

export const metricsService = {
  // Récupérer les métriques principales
  getMetrics: async (): Promise<Metrics> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  },

  // Récupérer le statut des services
  getServiceStatus: async (): Promise<ServiceStatus> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services/status`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut des services:', error);
      throw error;
    }
  },

  // Récupérer les alertes système
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  },

  // Récupérer les données d'utilisation pour le graphique
  getUsageData: async (period: 'day' | 'week' | 'month' = 'month'): Promise<UsageData[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/usage?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'utilisation:', error);
      throw error;
    }
  }
};