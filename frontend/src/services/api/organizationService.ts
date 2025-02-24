import { api } from '@/services/api';

export interface OrganizationFormData {
  name: string;
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'inactive' | 'pending';
  region: 'north' | 'south' | 'east' | 'west' | 'central';
  createdAt?: string;
  memberCount?: number;
}


// Functions
const create = async (data: OrganizationFormData) => {
  console.log('Données envoyées à l\'API:', data);
  
  const response = await api.post('/organizations/', data);
  return response.data;
};

const getMembers = async () => {
  const response = await api.get('/organizations/members/');
  return response.data;
};

const addMember = async (data: { email: string; user_type: string }) => {
  const response = await api.post('/organizations/members/add/', data);
  return response.data;
};

const removeMember = async (data: { email: string }) => {
  const response = await api.post('/organizations/members/remove/', data);
  return response.data;
};
const getAll = async () => {
  try {
    const response = await api.get('/organizations/');
    console.log('Liste des organisations:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des organisations:', error);
    throw error;
  }
};
const getById = async (id: string) => {
  try {
    const response = await api.get(`/organizations/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'organisation ${id}:`, error);
    throw error;
  }
};
export const deleteOrganization = async (orgId: string) => {
  try {
    console.log(`API: Suppression de l'organisation ${orgId}`);
    const response = await api.delete(`/organizations/${orgId}/`);
    return response.data;
  } catch (error) {
    console.error('Erreur API de suppression:', error);
    throw error;
  }
};

export const update = async (id: string, data: any) => {
  try {
    console.log(`Mise à jour de l'organisation ${id}:`, data);
    const response = await api.put(`/organizations/${id}/`, data); // Notez la suppression du / à la fin
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'organisation ${id}:`, error);
    throw error;
  }
};

// Export simple object avec toutes les fonctions
export const organizationService = {
  create,
  getMembers,
  addMember,
  removeMember,
  getAll, // Ajoutez cette méthode
  getById ,//
  update,
  delete: deleteOrganization 
};