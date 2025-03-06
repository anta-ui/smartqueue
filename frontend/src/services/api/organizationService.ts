import axios, { AxiosError } from 'axios';

// Types pour les données d'organisation
export interface OrganizationFormData {
  name: string;
  plan: 'basic' | 'premium';
  status: 'active' | 'inactive' | 'pending';
  country: string;
  description?: string;
  website?: string;
  industry?: string;
  foundedYear?: string;
}

export interface Organization {
  id: number;
  name: string;
  plan: 'basic' | 'premium';
  status: 'active' | 'inactive' | 'pending';
  country: string;
  created_at: string;
  updated_at: string;
}

// Interface pour Contact
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

// Interface pour Document
export interface Document {
  id: number;
  name: string;
  file: string;
  uploaded_at: string;
}

// Interface pour ChangeHistoryItem
export interface ChangeHistoryItem {
  id: number;
  action: string;
  timestamp: string;
  user: string;
  details: any;
}

// Interface pour les erreurs personnalisées
interface CustomAxiosError extends Error {
  status?: number;
  originalError?: AxiosError;
  details?: any;
}

// Configuration de base pour axios
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Vérifier et uniformiser les noms de token
function getStoredToken() {
  // Essayer toutes les variables possibles
  return localStorage.getItem('access_token') || 
         localStorage.getItem('token') || 
         sessionStorage.getItem('access_token') || 
         sessionStorage.getItem('token');
}

// Fonction utilitaire de logging
function logError(context: string, error: any) {
  const errorDetails = {
    context,
    type: error.name,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
  };

  console.log(JSON.stringify(errorDetails, null, 2));
}

// Fonction de déconnexion
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('token');
  window.location.href = '/super-admin/login';
}

// Récupérer l'en-tête d'authentification
function getAuthHeader() {
  const token = getStoredToken();
  if (!token) {
    console.warn('Aucun token d\'authentification trouvé');
    return { headers: { 'Content-Type': 'application/json' } };
  }
  
  // Log du token (masqué pour la sécurité)
  console.log('Token utilisé pour l\'authentification:', 
    token.substring(0, 10) + '...' + token.substring(token.length - 10));
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

// Fonction de création d'erreur personnalisée
function createCustomError(error: AxiosError, defaultMessage: string): CustomAxiosError {
  const errorMessage = 
    (error.response?.data as any)?.detail || 
    (error.response?.data as any)?.message || 
    defaultMessage;
  
  const customError: CustomAxiosError = {
    name: 'CustomAxiosError',
    message: errorMessage,
    status: error.response?.status,
    originalError: error,
    details: error.response?.data,
    
    toString() {
      return `${this.name}: ${this.message}`;
    }
  };

  Object.setPrototypeOf(customError, Error.prototype);
  return customError;
}

// Configuration des intercepteurs d'axios
axios.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data) {
      console.log('REQUÊTE AXIOS:', {
        url: config.url,
        method: config.method,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => {
    console.log('RÉPONSE AXIOS:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('Aucun token de rafraîchissement disponible');
        }

        let tokenResponse;
        try {
          tokenResponse = await axios.post('/api/auth/token/refresh/', { refresh: refreshToken });
        } catch (err) {
          console.log('Premier essai de rafraîchissement échoué, tentative avec un autre chemin');
          tokenResponse = await axios.post('/auth/token/refresh/', { refresh: refreshToken });
        }

        const { access } = tokenResponse.data;
        
        // Mettre à jour les deux emplacements possibles pour le token
        localStorage.setItem('access_token', access);
        localStorage.setItem('token', access);
        
        // Mettre à jour les en-têtes
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        if (originalRequest?.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
        }

        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Échec du rafraîchissement du token', refreshError);
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Function pour essayer plusieurs chemins d'API
async function tryMultiplePaths(paths: string[], method: 'get' | 'post' | 'put' | 'patch' | 'delete', data?: any) {
  let lastError = null;
  
  for (const path of paths) {
    try {
      if (method === 'get' || method === 'delete') {
        const response = await axios[method](path, getAuthHeader());
        return response.data;
      } else {
        const response = await axios[method](path, data, getAuthHeader());
        return response.data;
      }
    } catch (error: any) {
      lastError = error;
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`Chemin ${path} non trouvé, essai du suivant`);
        continue;
      }
      
      // Si l'erreur n'est pas un 404, propager immédiatement
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        throw error;
      }
    }
  }
  
  throw lastError || new Error('Tous les chemins ont échoué');
}

// Les données de mock pour le dashboard
const mockDashboardData = {
  globalMetrics: {
    organizations: {
      total: 150,
      active: 120,
      newThisMonth: 10,
      churnRate: 2.5
    },
    revenue: {
      mrr: 50000,
      arr: 600000,
      growth: 15,
      averageRevenue: 3500
    },
    usage: {
      totalRequests: 1500000,
      errorRate: 0.5,
      averageLatency: 250,
      p95Latency: 500
    },
    system: {
      uptime: 99.99,
      serviceHealth: {
        api: "healthy",
        websocket: "healthy",
        database: "healthy",
        cache: "healthy"
      },
      alerts: []
    }
  },
  usageTrends: [
    { 
      timestamp: new Date().toISOString(), 
      metrics: { 
        requests: 1000, 
        errors: 5, 
        latency: 200, 
        activeUsers: 80 
      } 
    }
  ],
  systemAlerts: [],
  recentLogs: []
};

// Service d'organisation
export const organizationService = {
  // Récupération des données du dashboard
  getDashboardData: async function() {
    try {
      const paths = [
        '/api/super-admin/dashboard/',
        '/super-admin/dashboard/',
        '/api/dashboard/stats/'
      ];
      
      for (const path of paths) {
        try {
          const response = await axios.get(path, getAuthHeader());
          console.log(`Succès avec le chemin ${path}:`, response.status);
          return response.data;
        } catch (error: any) {
          if (axios.isAxiosError(error)) {
            console.warn(`Erreur avec le chemin ${path}:`, error.response?.status);
            if (error.response?.status !== 404) {
              // Si l'erreur est autre que 404, essayer le prochain chemin
              continue;
            }
          }
        }
      }
      
      // Si aucun chemin ne fonctionne, retourner les données mockées
      console.log('Utilisation des données mockées pour le dashboard');
      return mockDashboardData;
    } catch (error: any) {
      logError('Récupération des données du dashboard', error);
      
      // Retourner les données mockées en cas d'erreur
      return mockDashboardData;
    }
  },

  // Création d'une organisation
  create: async function (data: OrganizationFormData) {
    try {
      if (!data.name || data.name.trim().length < 3) {
        throw new Error('Le nom de l\'organisation est requis et doit faire au moins 3 caractères');
      }

      const payload = {
        name: data.name.trim(),
        plan: data.plan || 'premium',
        status: data.status || 'active',
        country: data.country || 'FR',
      };

      const paths = [
        '/api/super-admin/organizations/', 
        '/super-admin/organizations/',
        '/api/organizations/'
      ];
      
      return await tryMultiplePaths(paths, 'post', payload);
    } catch (error: any) {
      logError('Création d\'organisation', error);
      if (axios.isAxiosError(error)) {
        throw createCustomError(error, 'Impossible de créer l\'organisation');
      }
      throw error;
    }
  },

  // Récupération de toutes les organisations
  getAll: async function (): Promise<Organization[]> {
    try {
      return await this.getOrganizations();
    } catch (error: any) {
      logError('Récupération des organisations', error);
      if (axios.isAxiosError(error)) {
        throw createCustomError(error, 'Impossible de récupérer les organisations');
      }
      throw error;
    }
  },

  // Alias de getAll pour la compatibilité
  getOrganizations: async function (filters = {}): Promise<Organization[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });

      const paths = [
        `/api/super-admin/organizations/?${params.toString()}`,
        `/super-admin/organizations/?${params.toString()}`,
        `/api/organizations/?${params.toString()}`
      ];
      
      for (const path of paths) {
        try {
          const response = await axios.get(path, getAuthHeader());
          
          if (Array.isArray(response.data)) {
            return response.data;
          }

          if (response.data?.results && Array.isArray(response.data.results)) {
            return response.data.results;
          }
          
          // Si le format de données est incorrect, essayer le prochain chemin
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            continue;
          }
          throw error;
        }
      }
      
      // Si aucun chemin n'a fonctionné, retourner un tableau vide
      return [];
    } catch (error: any) {
      logError('Récupération des organisations', error);
      return [];
    }
  },

  // Récupération d'une organisation par son ID
  getById: async function (id: number): Promise<Organization> {
    try {
      const paths = [
        `/api/super-admin/organizations/${id}/`,
        `/super-admin/organizations/${id}/`,
        `/api/organizations/${id}/`
      ];
      return await tryMultiplePaths(paths, 'get');
    } catch (error: any) {
      logError(`Récupération de l'organisation ${id}`, error);
      if (axios.isAxiosError(error)) {
        throw createCustomError(error, `Impossible de récupérer l'organisation ${id}`);
      }
      throw error;
    }
  },

  // Mise à jour d'une organisation
  update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    try {
      const paths = [
        `/api/super-admin/organizations/${id}/`,
        `/super-admin/organizations/${id}/`,
        `/api/organizations/${id}/`
      ];
      return await tryMultiplePaths(paths, 'patch', data);
    } catch (error: any) {
      logError(`Mise à jour de l'organisation ${id}`, error);
      if (axios.isAxiosError(error)) {
        throw createCustomError(error, `Impossible de mettre à jour l'organisation ${id}`);
      }
      throw error;
    }
  },

  // Suppression d'une organisation
  delete: async function(id: number) {
    try {
      const paths = [
        `/api/super-admin/organizations/${id}/`,
        `/super-admin/organizations/${id}/`,
        `/api/organizations/${id}/`
      ];
      return await tryMultiplePaths(paths, 'delete');
    } catch (error: any) {
      logError(`Suppression de l'organisation ${id}`, error);
      if (axios.isAxiosError(error)) {
        const customError = createCustomError(
          error, 
          `Impossible de supprimer l'organisation ${id}`
        );
        
        console.log('Détails de l\'erreur de suppression:', {
          message: customError.message,
          status: customError.status,
          details: customError.details
        });

        throw customError;
      }
      
      throw error;
    }
  },

  // Fonction de test pour déboguer les problèmes d'API
  testConnection: async function () {
    try {
      const paths = [
        '/api/super-admin/organizations/',
        '/super-admin/organizations/',
        '/api/organizations/'
      ];
      
      for (const path of paths) {
        try {
          const response = await axios.get(path, getAuthHeader());
          return {
            success: true,
            status: response.status,
            data: response.data,
            path: path
          };
        } catch (error: any) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            continue;
          }
          throw error;
        }
      }
      
      return {
        success: false,
        error: 'Tous les chemins ont échoué'
      };
    } catch (error: any) {
      logError('Test de connexion', error);

      return {
        success: false,
        status: error.response?.status,
        error: error.message,
        details: error.response?.data,
      };
    }
  },

  // Utilitaire pour tester l'authentification
  testAuth: async function() {
    const token = getStoredToken();
    let tokenInfo = null;
    
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = atob(parts[1]);
          tokenInfo = JSON.parse(payload);
        }
      } catch (e) {
        console.error('Erreur de décodage du token:', e);
      }
    }
    
    return {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenInfo: tokenInfo,
      tokenFirstChars: token ? token.substring(0, 10) + '...' : null
    };
  },
  
  // Récupérer l'utilisateur actuel
  getCurrentUser: async function() {
    try {
      const paths = [
        '/api/auth/me/',
        '/auth/me/',
        '/api/users/me/',
        '/users/me/'
      ];
      
      return await tryMultiplePaths(paths, 'get');
    } catch (error: any) {
      logError('Récupération de l\'utilisateur courant', error);
      return null;
    }
  },
  getContacts: async function(organizationId: string | number) {
    try {
      const paths = [
        `/api/super-admin/organizations/${organizationId}/contacts/`,
        `/api/organizations/${organizationId}/contacts/`
      ];
      
      for (const path of paths) {
        try {
          const response = await axios.get(path, getAuthHeader());
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            continue;
          }
          throw error;
        }
      }
      
      // Si aucun chemin n'a fonctionné, retourner un tableau vide
      return [];
    } catch (error: any) {
      logError(`Récupération des contacts de l'organisation ${organizationId}`, error);
      
      // Retourner un tableau vide en cas d'erreur
      return [];
    }
  },
  getDocuments: async function(organizationId: string | number) {
    try {
      const paths = [
        `/api/organizations/${organizationId}/documents/`,
        `/api/super-admin/organizations/${organizationId}/documents/`
      ];
      
      for (const path of paths) {
        try {
          const response = await axios.get(path, getAuthHeader());
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            continue;
          }
          throw error;
        }
      }
      
      return [];
    } catch (error: any) {
      logError(`Récupération des documents de l'organisation ${organizationId}`, error);
      return [];
    }
  },
  
  getContacts: async function(organizationId: string | number) {
    try {
      const paths = [
        `/api/organizations/${organizationId}/contacts/`,
        `/api/super-admin/organizations/${organizationId}/contacts/`
      ];
      
      for (const path of paths) {
        try {
          const response = await axios.get(path, getAuthHeader());
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            continue;
          }
          throw error;
        }
      }
      
      return [];
    } catch (error: any) {
      logError(`Récupération des contacts de l'organisation ${organizationId}`, error);
      return [];
    }
  },

  // Les autres méthodes de votre service...

  // Utilitaires exportés
  logout,
  getStoredToken
};

// Exporter le service comme objet par défaut pour être compatible avec l'importation
export default { ...organizationService };