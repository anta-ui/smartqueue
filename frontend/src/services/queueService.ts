// services/queue.service.ts
import {api} from './api';
import type { Queue, QueueStatus } from '@/types/queue';

export const queueService = {
  getQueues: async () => {
    try {
      const response = await api.get('/queues/queues/');
      console.log('Queues Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching queues:', error);
      throw error;
    }
  },

  getQueueById: async (id: string) => {
    try {
      const response = await api.get(`/queues/queues/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching queue:', error);
      throw error;
    }
  },

  updateQueueStatus: async (id: string, status: QueueStatus) => {
    try {
      const response = await api.post(`/queues/queues/${id}/update_status/`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating queue status:', error);
      throw error;
    }
  },
};