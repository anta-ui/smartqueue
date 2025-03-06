import axios from 'axios';
import Cookies from 'js-cookie';
import { authService } from './authService';

// Configuration des routes
export const DASHBOARD_ROUTES = {
  stats: '/dashboard/stats',
  usageTrends: '/dashboard/usage-trends',
  organizationLocations: '/dashboard/organization-locations',
  alerts: '/dashboard/alerts'
} as const;

// Création de l'instance axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Fonction pour obtenir le token actuel
const getToken = (): string | null => {
  // Côté serveur
  if (typeof window === 'undefined') {
    // Récupérer le token depuis les variables d'environnement ou autre source sécurisée
    return process.env.NEXT_PUBLIC_SERVER_ACCESS_TOKEN || null;
  }
  
  // Côté client
  return Cookies.get('access_token') || localStorage.getItem('access_token');
};

// Intercepteur unifié pour les requêtes
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log('Token being used:', token ? 'Present' : 'Missing');
    
    if (token) {
      const finalToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = finalToken;
    } else {
      console.warn('Aucun token trouvé');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour le rafraîchissement automatique du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Gestion côté client uniquement
        if (typeof window !== 'undefined') {
          const newToken = await authService.refreshToken();
          
          // Mettre à jour le token dans les cookies et localStorage
          Cookies.set('access_token', newToken, {
            expires: 1, // 1 jour
            path: '/',
            sameSite: 'lax'
          });
          localStorage.setItem('access_token', newToken);
          
          // Mettre à jour le header pour la nouvelle requête
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Gestion côté serveur si nécessaire
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Erreur de rafraîchissement du token:', refreshError);
        
        // Redirection côté client uniquement
        if (typeof window !== 'undefined') {
          await authService.logout();
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Modifier les chemins d'API pour le super-admin
export const getOrganizationDetails = async (id: number) => {
  try {
    console.log(`Appel API pour récupérer les détails de l'organisation: ${id}`);
    const response = await api.get(`/api/super-admin/organizations/${id}/`);
    console.log("Réponse API: ", response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails de l'organisation ${id}:`, error);
    throw error;
  }
};

export const getOrganizationGeneralInfo = async (id: number) => {
  try {
    console.log(`Appel API pour récupérer les informations générales de l'organisation: ${id}`);
    // Utiliser la même route que getOrganizationDetails au lieu de /general/
    const response = await api.get(`/api/super-admin/organizations/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des informations générales de l'organisation ${id} (${error.response?.status}):`, 
      error.response?.data);
    throw error;
  }
};

export const getOrganizationApiKeys = async (id: number) => {
  try {
    // Utiliser la route correcte selon les URLs disponibles dans votre backend
    const response = await api.get(`/api/organizations/${id}/api_keys/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des clés API de l'organisation ${id}:`, error);
    // Essayer une route alternative si la première échoue
    try {
      const response = await api.get(`/api/organizations/${id}/api-keys/`);
      return response.data;
    } catch (secondError) {
      console.error(`Deuxième tentative échouée:`, secondError);
      throw secondError;
    }
  }
};

export default api;