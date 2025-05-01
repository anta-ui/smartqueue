// src/services/api/usageApi.js
const BASE_URL = '/api/organization';

export const usageApi = {
  getStats: async (organizationId) => {
    const response = await fetch(`${BASE_URL}/${organizationId}/usage`);
    if (!response.ok) throw new Error('Failed to fetch usage stats');
    return response.json();
  },

  getDetails: async (organizationId, period) => {
    const response = await fetch(`${BASE_URL}/${organizationId}/usage/details?period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch usage details');
    return response.json();
  },
};