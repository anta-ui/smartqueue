import axios from 'axios';
import { api } from '@/services/api';

// Interfaces pour le typage
export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  is_active: boolean;
  organization: string | number;
}

export interface BranchFormData {
  name: string;
  code: string;
  address?: string;
  city: string;
  country: string;
  is_active?: boolean;
}

export interface BranchUpdateData extends BranchFormData {
  organization: number; // Changé en number explicitement
}

// Utilisation de l'export de type objet
export const branchService = {
  // Récupérer toutes les branches
  getAll: async (): Promise<Branch[]> => {
    const response = await api.get('/organization-branches/');
    return response.data;
  },

  // Récupérer les branches d'une organisation
  getByOrganization: async (organizationId: string | number): Promise<Branch[]> => {
    // Si l'ID est 'new', retourner un tableau vide
    if (organizationId === 'new') {
      return [];
    }
    
    try {
      // Essayer une autre URL qui pourrait avoir les permissions correctes
      const response = await api.get(`/organization-branches/?organization=${organizationId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des branches:", error);
      throw error;
    }
  },

  // Créer une nouvelle branche
  create: async (branchData: BranchUpdateData): Promise<Branch> => {
    try {
      console.log('Données envoyées pour création:', branchData, 'Type de organization:', typeof branchData.organization);
      const response = await api.post('/organization-branches/', branchData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Détails complets de l\'erreur:', {
          responseData: error.response?.data,
          responseStatus: error.response?.status,
          requestData: branchData, 
          message: error.message,
          organizationType: typeof branchData.organization,
          organizationValue: branchData.organization
        });
        
        const errorData = error.response?.data;
        let errorMessage = 'Une erreur est survenue';
        
        if (typeof errorData === 'object') {
          // Vérifier les différentes possibilités d'erreur
          if (errorData.code) {
            errorMessage = `Erreur de code: ${errorData.code}`;
          } else if (errorData.organization) {
            errorMessage = `Erreur d'organisation: ${errorData.organization}`;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          } else if (Object.keys(errorData).length > 0) {
            // S'il y a d'autres erreurs spécifiques à des champs
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${errors}`)
              .join(', ');
            errorMessage = `Erreurs de validation: ${fieldErrors}`;
          }
        }
        
        throw new Error(errorMessage);
      } else {
        console.error('Erreur inattendue:', error);
        throw new Error('Une erreur inattendue est survenue');
      }
    }
  },

  // Récupérer une branche par son ID
  getById: async (id: string): Promise<Branch> => {
    const response = await api.get(`/organization-branches/${id}/`);
    return response.data;
  },

  // Mettre à jour une branche
  update: async (id: string, data: BranchUpdateData): Promise<Branch> => {
    try {
      console.log('Données envoyées pour mise à jour:', data);
      const response = await api.patch(`/organization-branches/${id}/`, data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Détails complets de l\'erreur:', {
          responseData: error.response?.data,
          responseStatus: error.response?.status,
          requestData: data,
          message: error.message
        });
        
        const errorData = error.response?.data;
        let errorMessage = 'Une erreur est survenue';
        
        if (typeof errorData === 'object') {
          // Même logique que pour create
          if (errorData.code) {
            errorMessage = `Erreur de code: ${errorData.code}`;
          } else if (errorData.organization) {
            errorMessage = `Erreur d'organisation: ${errorData.organization}`;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          } else if (Object.keys(errorData).length > 0) {
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${errors}`)
              .join(', ');
            errorMessage = `Erreurs de validation: ${fieldErrors}`;
          }
        }
        
        throw new Error(errorMessage);
      } else {
        console.error('Erreur inattendue:', error);
        throw new Error('Une erreur inattendue est survenue');
      }
    }
  },

  // Supprimer une branche
  delete: async (id: string): Promise<void> => {
    await api.delete(`/organization-branches/${id}/`);
  }
};