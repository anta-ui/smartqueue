// services/userService.js
import { api } from '@/services/api';

export const userService = {
  // Récupérer toutes les organisations de l'utilisateur
  getOrganizations: async () => {
    try {
      const response = await api.get('/organizations/');
      console.log('Organisations récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des organisations:', error);
      throw error;
    }
  },
  
  // Récupérer les branches d'une organisation
  getBranches: async (organizationId) => {
    try {
      // D'après vos indications, le chemin doit être basé sur /organizations/
      const response = await api.get(`/organizations/${organizationId}/branches/`);
      console.log(`Branches récupérées pour l'organisation ${organizationId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des branches pour l'organisation ${organizationId}:`, error);
      // En cas d'échec, retourner un tableau vide
      return [];
    }
  },
  
  // Récupérer toutes les branches (solution de secours)
  getAllBranches: async () => {
    try {
      // Essayer le chemin principal pour les branches
      const response = await api.get('/organization-branches/');
      console.log('Toutes les branches récupérées:', response.data);
      return response.data;
    } catch (error) {
      try {
        // Alternative: essayer un autre chemin possible
        console.log('Premier chemin échoué, essai du chemin /branches/');
        const response = await api.get('/branches/');
        console.log('Branches récupérées via chemin alternatif:', response.data);
        return response.data;
      } catch (secondError) {
        console.error('Impossible de récupérer les branches via les deux chemins:', secondError);
        return [];
      }
    }
  },
  
  // Récupérer l'organisation courante
  getCurrentOrganization: async () => {
    try {
      const response = await api.get('/users/me/');
      console.log('Utilisateur courant récupéré:', response.data);
      return response.data.organization;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur courant:', error);
      return null;
    }
  }
};