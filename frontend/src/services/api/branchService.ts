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
  organization: string;
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
  organization: string | number;
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
    const response = await api.get(`/organizations/${organizationId}/branches/`);
    return response.data;
  },

  // Créer une nouvelle branche
  create: async (branchData: BranchUpdateData): Promise<Branch> => {
    try {
        const response = await api.post('/organization-branches/', branchData);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Détails complets de l\'erreur:', {
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                message: error.message
            });
            const errorData = error.response?.data;
            let errorMessage = 'Une erreur est survenue';
            if (typeof errorData === 'object') {
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.non_field_errors) {
                    errorMessage = errorData.non_field_errors[0];
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
        const response = await api.patch(`/organization-branches/${id}/`, data);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Détails complets de l\'erreur:', {
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                message: error.message
            });
            const errorData = error.response?.data;
            let errorMessage = 'Une erreur est survenue';
            if (typeof errorData === 'object') {
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.non_field_errors) {
                    errorMessage = errorData.non_field_errors[0];
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