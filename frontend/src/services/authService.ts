// services/auth.service.ts
import { api } from './api';
import Cookies from 'js-cookie';
import axios from 'axios';

export const authService = {
  login: async (data: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/token/', data);
      if (response.data.access) {
        // Stocker les tokens
        const token = response.data.access;
        Cookies.set('access_token', token, {
          expires: 1, // 1 jour
          path: '/',
          sameSite: 'lax'
        });
        // Stocker aussi le refresh token
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        // Configurer le header Authorization
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post('/auth/token/refresh/', { refresh: refreshToken });
      const { access_token } = response.data;
      // Mettre à jour le token
      Cookies.set('access_token', access_token, {
        expires: 1,
        path: '/',
        sameSite: 'lax'
      });
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return access_token;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  logout: async () => {
    try {
      // Supprimer le cookie
      Cookies.remove('access_token', { path: '/' });
      // Supprimer le refresh token
      localStorage.removeItem('refresh_token');
      // Nettoyer le header
      delete api.defaults.headers.common['Authorization'];
      // Rediriger vers la page de login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  isAuthenticated: () => {
    const token = Cookies.get('access_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  // Nouvelles méthodes ajoutées
  setupInterceptors: () => {
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si l'erreur est 401 et qu'on n'a pas déjà essayé de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Tenter de rafraîchir le token
            const newToken = await authService.refreshToken();
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Si le refresh échoue, déconnecter l'utilisateur
            authService.logout();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  },

  getToken: () => {
    return Cookies.get('access_token');
  },

  getTokenExpiration: () => {
    const token = Cookies.get('access_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  },

  updateToken: (newToken: string) => {
    Cookies.set('access_token', newToken, {
      expires: 1,
      path: '/',
      sameSite: 'lax'
    });
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }
};