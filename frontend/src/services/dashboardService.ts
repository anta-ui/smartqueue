import api from './api';
import  {API_ROUTES}  from '../constants/route';

export const dashboardService = {
    getMetrics: async () => {
        try {
            const response = await api.get(API_ROUTES.metrics);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des métriques:', error);
            throw error;
        }
    },

    getServiceStatus: async () => {
        try {
            const response = await api.get(API_ROUTES.services);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du statut des services:', error);
            throw error;
        }
    },

    getAlerts: async () => {
        try {
            const response = await api.get(API_ROUTES.alerts);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des alertes:', error);
            throw error;
        }
    },

    getUsage: async () => {
        try {
            const response = await api.get(API_ROUTES.usage);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des données d\'usage:', error);
            throw error;
        }
    }
};

export default dashboardService;