// services/queueService.ts
import { api } from '@/services/api';

// Types
export type QueueStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

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


export interface Queue {
  id: string;
  name: string;
  status: QueueStatus;
  current_number?: number;
  current_wait_time?: number;
}

export interface QueueCreateData {
  name: string;
  status?: QueueStatus;
  current_number?: number;
  current_wait_time?: number;
}

export const queueService = {
  // Créer une nouvelle file d'attente
  createQueue: async (data: QueueCreateData): Promise<Queue> => {
    try {
      const response = await api.post('/queues/queues/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la file d\'attente:', error);
      throw error;
    }
  },
  /**
   * Récupère toutes les files d'attente
   * @returns Promise<Queue[]>
   */

  updateQueueStatus: async (id: string, status: QueueStatus): Promise<Queue> => {
    try {
      const response = await api.post(`/queues/queues/${id}/update_status/`, { status });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de la file d'attente ${id}:`, error);
      throw error;
    }
  },
  getQueues: async (): Promise<Queue[]> => {
    try {
      const response = await api.get('/queues/queues/');
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
  createQueue: async (queueData: QueueCreateUpdateData): Promise<Queue> => {
    try {
      const response = await api.post('/queues/queues/', queueData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la file d\'attente:', error);
      throw error;
    }
  },

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
  getQueueTypes: async () => {
    try {
      const response = await api.get('/queues/queue-types/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de files d\'attente:', error);
      throw error;
    }
  }
};

// Export des types pour une utilisation cohérente
export type { 
  Queue, 
  QueueStatus, 
  QueueCreateUpdateData 
};