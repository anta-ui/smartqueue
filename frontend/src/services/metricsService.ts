
// src/services/metricsService.ts
import axios from 'axios';
import api from './api';
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
};

export const MetricsService = {
  getMetrics: async (): Promise<Metrics> => {
    try {
      const response = await api.get('/dashboard/stats');  // Changé
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  },

  getServiceStatus: async (): Promise<ServiceStatus> => {
    try {
      const response = await api.get('/dashboard/services/status');  // Changé
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut des services:', error);
      throw error;
    }
  },

  getAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await api.get('/dashboard/alerts');  // Changé
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  },

  getUsageData: async (): Promise<UsageData[]> => {
    try {
      const response = await api.get('/dashboard/usage-trends');  // Changé
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'usage:', error);
      throw error;
    }
  }
};