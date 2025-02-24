// services/queueService.ts
import { api } from '@/services/api';

// Types
export type QueueStatus = 'AC' | 'PA' | 'CL' | 'MA'; 

// Interface pour la création/mise à jour d'une file d'attente
interface QueueCreateUpdateData {
  name: string;
  queue_type: string;
  status?: QueueStatus;
  current_number?: number;
  current_wait_time?: number;
  location?: string;
  service_points?: string[];
  is_priority?: boolean;
}
export interface QueueType {
  id: string;
  name: string;
  category: 'VE' | 'PE' | 'MI';
}

export interface QueueCreateData {
  name: string;
  queue_type: string;
  status: QueueStatus;
  current_number?: number;
  current_wait_time?: number;
  is_priority?: boolean;
}

const statusMapping = {
  'ACTIVE': 'AC',
  'PAUSED': 'PA',
  'CLOSED': 'CL',
  'MAINTENANCE': 'MA'
} as const;
export interface Queue {
  id: string;
  name: string;
  status: QueueStatus;
  current_number?: number;
  current_wait_time?: number;
}



export const queueService = {
  // Créer une nouvelle file d'attente
  getQueueTypes: async (): Promise<QueueType[]> => {
    try {
      console.log('Envoi de la requête vers /queues/queue-types/');
      const response = await api.get('/queues/queue-types/');
      
      console.log('Réponse reçue:', response);
      console.log('Données:', response.data);
      
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.warn('La réponse est un tableau vide');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de files:', error);
      throw error;
    }
  },
  createQueue: async (data: QueueCreateData) => {
    const response = await api.post('/queues/', data);
    return response.data;
  },
  /**
   * Récupère toutes les files d'attente
   * @returns Promise<Queue[]>
   */

  updateQueueStatus: async (id: string, status: string): Promise<Queue> => {
    try {
      // Convertir le statut avant l'envoi
      const mappedStatus = statusMapping[status as keyof typeof statusMapping] || status;
      console.log('Envoi du statut mappé:', mappedStatus);
      
      const response = await api.post(`/queues/queues/${id}/update_status/`, { 
        status: mappedStatus 
      });
      return response.data;
    } catch (error: any) {
      console.error('Données envoyées:', { status: mappedStatus });
      console.error('Erreur complète:', error.response?.data);
      throw error;
    }
  },
  getQueues: async (): Promise<Queue[]> => {
    try {
      const response = await api.get('/queues/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des files d\'attente:', error);
      throw error;
    }
  },

  /**
   * Récupère une file d'attente par son ID
   * @param id Identifiant de la file d'attente
   * @returns Promise<Queue>
   */
  getQueueById: async (id: string): Promise<Queue> => {
    try {
      const response = await api.get(`/queues/queues/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la file d'attente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle file d'attente
   * @param queueData Données de la nouvelle file d'attente
   * @returns Promise<Queue>
   */
  

  /**
   * Met à jour une file d'attente existante
   * @param id Identifiant de la file d'attente
   * @param queueData Données à mettre à jour
   * @returns Promise<Queue>
   */
  updateQueue: async (id: string, queueData: QueueCreateUpdateData): Promise<Queue> => {
    try {
      const response = await api.patch(`/queues/queues/${id}/`, queueData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la file d'attente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une file d'attente
   * @param id Identifiant de la file d'attente à supprimer
   * @returns Promise<void>
   */
  deleteQueue: async (id: string): Promise<void> => {
    try {
      await api.delete(`/queues/queues/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la file d'attente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'une file d'attente
   * @param id Identifiant de la file d'attente
   * @param status Nouveau statut
   * @param reason Raison du changement de statut (optionnel)
   * @returns Promise<Queue>
   */
  

  /**
   * Récupère les types de files d'attente disponibles
   * @returns Promise<QueueType[]>
   */
  
};

// Export des types pour une utilisation cohérente
export type { 
  
  QueueCreateUpdateData 
};