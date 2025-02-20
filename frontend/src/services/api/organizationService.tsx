// src/services/api/organizationService.ts
import axios from 'axios';

export const organizationService = {
  // Liste des membres d'une organisation
  getMembers: async () => {
    const response = await axios.get('/organization/members/');
    return response.data;
  },

  // Ajouter un membre à l'organisation
  addMember: async (data: { email: string; user_type: string }) => {
    const response = await axios.post('/organization/members/add/', data);
    return response.data;
  },

  // Retirer un membre de l'organisation
  removeMember: async (data: { email: string }) => {
    const response = await axios.post('/organization/members/remove/', data);
    return response.data;
  },

  // Récupérer les statistiques du tableau de bord
  getDashboardStats: async () => {
    const response = await axios.get('/dashboard/stats/');
    return response.data;
  },

  // Récupérer l'état des services
  getServiceStatus: async () => {
    const response = await axios.get('/dashboard/services/status');
    return response.data;
  },

  // Récupérer les tendances d'utilisation
  getUsageTrends: async () => {
    const response = await axios.get('/dashboard/usage-trends');
    return response.data;
  },

  // Récupérer les emplacements des organisations
  getLocations: async () => {
    const response = await axios.get('/dashboard/organization-locations/');
    return response.data;
  }
};
