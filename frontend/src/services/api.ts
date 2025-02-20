// src/services/api.ts
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

// Fonction de vérification d'authentification
export const checkAuth = (): boolean => {
  const token = Cookies.get('access_token') || localStorage.getItem('access_token');
  console.log('Auth token:', token ? 'Present' : 'Missing');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = new Date(payload.exp * 1000);
      console.log('Token expiration:', expiration);
      console.log('Token valid:', expiration > new Date());
      return expiration > new Date();
    } catch (e) {
      console.error('Invalid token format:', e);
      return false;
    }
  }
  return false;
};

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
      } catch (refreshError) {
        console.error('Erreur de rafraîchissement du token:', refreshError);
        await authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;