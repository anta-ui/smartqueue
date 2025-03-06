// services/superAdminService.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Configuration de base pour axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Créer une instance axios dédiée
const superAdminAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Fonction pour obtenir les headers d'authentification
const getAuthHeaders = (): AxiosRequestConfig => {
  const token = localStorage.getItem('access_token');
  
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    }
  };
};

// Intercepteur pour ajouter le token d'authentification à toutes les requêtes
superAdminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de token expiré
superAdminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 (Unauthorized) et que nous n'avons pas déjà essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // Rediriger vers la page de connexion si nous n'avons pas de refresh token
          window.location.href = '/super-admin/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        // Mettre à jour le token dans le localStorage
        localStorage.setItem('access_token', response.data.access);
        
        // Mettre à jour le header Authorization de la requête originale
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        // Réessayer la requête originale
        return superAdminAxios(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement du token échoue, rediriger vers la page de connexion
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/super-admin/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Fonction pour gérer les erreurs API
const handleApiError = (error: any, action: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error(`Erreur lors de ${action} (${axiosError.response?.status}):`, axiosError.response?.data);
  } else {
    console.error(`Erreur lors de ${action}:`, error);
  }
};

// Fonction pour vérifier si un ID est valide
const isValidId = (id: any): boolean => {
  // Si id est undefined ou null, retourner false
  if (id === undefined || id === null) {
    return false;
  }
  
  // Si id est une chaîne, vérifier qu'elle n'est pas vide et qu'elle peut être convertie en nombre
  if (typeof id === 'string') {
    return id !== '' && id !== 'undefined' && id !== 'null' && !isNaN(Number(id));
  }
  
  // Si id est un nombre, vérifier qu'il n'est pas NaN
  if (typeof id === 'number') {
    return !isNaN(id);
  }
  
  // Pour tout autre type, retourner false
  return false;
};

// Fonction pour essayer plusieurs URLs avec validation améliorée
const tryMultipleUrls = async (
  urls: string[], 
  config: AxiosRequestConfig = {}, 
  method: 'get' | 'post' | 'put' | 'delete' = 'get', 
  data?: any
): Promise<any> => {
  let lastError = null;
  
  for (const url of urls) {
    try {
      // Validation supplémentaire de l'URL
      if (url.includes('undefined')) {
        console.warn(`URL invalide détectée : ${url}`);
        continue; // Passer à l'URL suivante
      }

      let response;
      
      switch (method) {
        case 'get':
          response = await superAdminAxios.get(url, config);
          break;
        case 'post':
          response = await superAdminAxios.post(url, data, config);
          break;
        case 'put':
          response = await superAdminAxios.put(url, data, config);
          break;
        case 'delete':
          response = await superAdminAxios.delete(url, config);
          break;
        default:
          throw new Error(`Méthode HTTP non supportée : ${method}`);
      }
      
      return response.data;
    } catch (error) {
      lastError = error;
      console.warn(`Échec de la requête vers ${url}:`, error);
    }
  }
  
  // Si toutes les URLs ont échoué, lancer la dernière erreur
  if (lastError) {
    console.error('Toutes les tentatives de requête ont échoué', lastError);
  }
  throw lastError;
};

// Service principal pour les opérations super admin
export const superAdminService = {
  // Récupération des données du tableau de bord
  getDashboardData: async () => {
    try {
      const urls = [
        '/api/super-admin/dashboard/',
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, "la récupération des données du tableau de bord");
      throw error;
    }
  },

  // Récupération de la liste des organisations
  getOrganizations: async () => {
    try {
      const urls = [
        '/api/super-admin/organizations/',
        '/api/organizations/',
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, "la récupération de la liste des organisations");
      throw error;
    }
  },

  // Récupération des détails d'une organisation
  getOrganizationDetails: async (id: number) => {
    try {
      console.log("Appel API pour récupérer les détails de l'organisation:", id);
      
      if (!isValidId(id)) {
        console.error("ID d'organisation invalide:", id);
        throw new Error("ID d'organisation invalide");
      }
      
      const response = await superAdminAxios.get(`/api/super-admin/organizations/${id}/`, getAuthHeaders());
      console.log("Réponse API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur API:", error);
      handleApiError(error, `la récupération des détails de l'organisation ${id}`);
      throw error;
    }
  },

  // Méthodes pour différentes ressources d'une organisation
  getOrganizationContacts: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/contacts/`,
        `/api/organizations/${id}/contacts/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des contacts de l'organisation ${id}`);
      throw error;
    }
  },

  getOrganizationBranches: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/branches/`,
        `/api/organizations/${id}/branches/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des succursales de l'organisation ${id}`);
      throw error;
    }
  },
  getOrganizationApiKeys: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/api-keys/`,
        `/api/organizations/${id}/api-keys/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des clés API de l'organisation ${id}`);
      throw error;
    }
  },
  
  getOrganizationWebhooks: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/webhooks/`,
        `/api/organizations/${id}/webhooks/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des webhooks de l'organisation ${id}`);
      throw error;
    }
  },
  
  getOrganizationLimits: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/limits/`,
        `/api/organizations/${id}/limits/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des limites de l'organisation ${id}`);
      throw error;
    }
  },

  

  getOrganizationFinancialStatus: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/financial/payment-status/`,
        `/api/organizations/${id}/financial/payment-status/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération du statut financier de l'organisation ${id}`);
      throw error;
    }
  },

  getOrganizationInvoices: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/financial/invoices/`,
        `/api/organizations/${id}/financial/invoices/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des factures de l'organisation ${id}`);
      throw error;
    }
  },

  getOrganizationCredits: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/financial/credits/`,
        `/api/organizations/${id}/financial/credits/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des crédits de l'organisation ${id}`);
      throw error;
    }
  },

  getOrganizationDocuments: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/documents/`,
        `/api/organizations/${id}/documents/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des documents de l'organisation ${id}`);
      throw error;
    }
  },

  getOrganizationHistory: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/history/`,
        `/api/organizations/${id}/history/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération de l'historique de l'organisation ${id}`);
      throw error;
    }
  },

  getOrganizationFinancialReports: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/financial/reports/`,
        `/api/organizations/${id}/financial/reports/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération des rapports financiers de l'organisation ${id}`);
      throw error;
    }
  },

  // Méthodes de modification des organisations
  updateOrganization: async (id: any, data: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/`,
        `/api/organizations/${id}/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders(), 'put', data);
    } catch (error) {
      handleApiError(error, `la mise à jour de l'organisation ${id}`);
      throw error;
    }
  },

  createOrganization: async (data: any) => {
    try {
      const urls = [
        `/api/super-admin/organizations/`,
        `/api/organizations/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders(), 'post', data);
    } catch (error) {
      handleApiError(error, `la création d'une nouvelle organisation`);
      throw error;
    }
  },
  deleteOrganization: async (id: any) => {
    try {
      if (!isValidId(id)) {
        console.error(`ID d'organisation invalide : ${id}`);
        return null;
      }
      
      const urls = [
        `/api/super-admin/organizations/${id}/`,
        `/api/organizations/${id}/`,
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders(), 'delete');
    } catch (error) {
      handleApiError(error, `la suppression de l'organisation ${id}`);
      throw error;
    }
  },
  getOrganizationTechnicalConfig: async (id: number) => {
    try {
      const urls = [
        `/api/super-admin/organizations/${id}/technical-config/`,
        `/api/organizations/${id}/technical-config/`
      ];
      
      return await tryMultipleUrls(urls, getAuthHeaders());
    } catch (error) {
      handleApiError(error, `la récupération de la configuration technique de l'organisation ${id}`);
      throw error;
    }
  },
  

  // Fonction de déconnexion
  logout: async () => {
    try {
      // Optionnel : Appel API pour invalider le token côté serveur
      const urls = [
        '/api/auth/logout/',
        '/logout/'
      ];

      try {
        await tryMultipleUrls(urls, getAuthHeaders(), 'post');
      } catch (logoutError) {
        console.warn('Erreur lors de la déconnexion côté serveur', logoutError);
      }

      // Nettoyer le localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');

      // Redirection vers la page de connexion
      window.location.href = '/super-admin/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
      
      // Forcer la déconnexion même en cas d'erreur
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      window.location.href = '/super-admin/login';
    }
  },

  // Ajoutez ces fonctions à votre service
  getOrganizationGeneral: async (id: number) => {
    try {
      console.log("Appel API pour récupérer les informations générales de l'organisation:", id);
      
      if (!isValidId(id)) {
        console.error("ID d'organisation invalide:", id);
        throw new Error("ID d'organisation invalide");
      }
      
      const response = await superAdminAxios.get(`/api/super-admin/organizations/${id}/general/`, getAuthHeaders());
      console.log("Réponse API (général):", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur API (général):", error);
      handleApiError(error, `la récupération des informations générales de l'organisation ${id}`);
      throw error;
    }
  },

  

  getOrganizationUsage: async (id: number) => {
    try {
      console.log("Appel API pour récupérer les données d'utilisation de l'organisation:", id);
      
      if (!isValidId(id)) {
        console.error("ID d'organisation invalide:", id);
        throw new Error("ID d'organisation invalide");
      }
      
      const response = await superAdminAxios.get(`/api/super-admin/organizations/${id}/usage/`, getAuthHeaders());
      console.log("Réponse API (utilisation):", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur API (utilisation):", error);
      handleApiError(error, `la récupération des données d'utilisation de l'organisation ${id}`);
      throw error;
    }
  },
  

  getOrganizationFinancial: async (id: number) => {
    try {
      console.log("Appel API pour récupérer les données financières de l'organisation:", id);
      
      if (!isValidId(id)) {
        console.error("ID d'organisation invalide:", id);
        throw new Error("ID d'organisation invalide");
      }
      
      const response = await superAdminAxios.get(`/api/super-admin/organizations/${id}/financial/`, getAuthHeaders());
      console.log("Réponse API (financier):", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur API (financier):", error);
      handleApiError(error, `la récupération des données financières de l'organisation ${id}`);
      throw error;
    }
  }
};

// Export par défaut pour compatibilité
export default { ...superAdminService };
  