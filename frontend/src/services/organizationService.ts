// src/services/api/organizationService.ts
import api from '@/services/api';

export interface Organization {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  memberCount?: number;
  plan?: string;
  region?: string;
}
export const organizationService = {
    getMembers() {
      return Promise.resolve([]);
    },
    
    addMember(data: { email: string; user_type: string; }) {
      return Promise.resolve(null);
    },
    
    removeMember(data: { email: string; }) {
      return Promise.resolve(null);
    },
    
    async create(formData: Organization) {
      const response = await fetch('/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        throw new Error('Échec de la création de l\'organisation');
      }
  
      return response.json();
    },

  // Obtenir une organisation spécifique
    getById: async (id: string) => {
    const response = await api.get(`/organization/${id}/`);
    return response.data;
  },

  // Mettre à jour une organisation
  update: async (id: string, data: Partial<Organization>) => {
    const response = await api.patch(`/organization/${id}/`, data);
    return response.data;
  },

  // Supprimer une organisation
  delete: async (id: string) => {
    await api.delete(`/organization/${id}/`);
  }
};