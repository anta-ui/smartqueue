// src/services/api/organizationApi.js
const BASE_URL = '/api';

export const organizationApi = {
  // Liste des membres d'une organisation
  getMembers: async () => {
    const response = await fetch(`${BASE_URL}/organization/members/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  // Ajouter un membre à l'organisation
  addMember: async (data) => {
    const response = await fetch(`${BASE_URL}/organization/members/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add member');
    return response.json();
  },

  // Retirer un membre de l'organisation
  removeMember: async (data) => {
    const response = await fetch(`${BASE_URL}/organization/members/remove/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to remove member');
    return response.json();
  },

  // Récupérer les statistiques du tableau de bord
  getDashboardStats: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/stats/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  // Récupérer l'état des services
  getServiceStatus: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/services/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch service status');
    return response.json();
  },

  // Récupérer les tendances d'utilisation
  getUsageTrends: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/usage-trends`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch usage trends');
    return response.json();
  },

  // Récupérer les emplacements des organisations
  getLocations: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/organization-locations/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch organization locations');
    return response.json();
  }
};

// src/services/api/authApi.js
export const authApi = {
  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Failed to login');
    return response.json();
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem('refreshToken');
    const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) throw new Error('Failed to refresh token');
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!response.ok) throw new Error('Failed to logout');
    return response.json();
  }
};