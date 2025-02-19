import axios from 'axios';
import Cookies from 'js-cookie';
import { authService } from './authService';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
// Configuration des routes
const DASHBOARD_ROUTES = {
  stats: '/dashboard/stats',
  usageTrends: '/dashboard/usage-trends',
  organizationLocations: '/dashboard/organization-locations',
  alerts: '/dashboard/alerts'
};
// Fonction de vérification d'authentification
export const checkAuth = (): boolean => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token ? 'Present' : 'Missing');
  
  if (token) {
    try {
      // Vérifier si le token est un JWT valide
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
// services/api.ts
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('Token présent :', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Aucun token trouvé');
    }
    
    return config;
  }
);

// Intercepteur pour ajouter le token à toutes les requêtes
api.interceptors.request.use(
  (config) => {
    // Récupérer le token soit des cookies soit du localStorage
    const token = Cookies.get('token') || localStorage.getItem('token');
    console.log('Token being used:', token ? 'Present' : 'Missing'); // Debug log
    
    if (token) {
      // S'assurer que le token est préfixé par "Bearer"
      const finalToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = finalToken;
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
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
 
);

export default api;