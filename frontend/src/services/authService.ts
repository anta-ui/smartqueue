// services/auth.service.ts
import {api} from './api';
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
      localStorage.setItem('token', access_token);
      Cookies.set('token', access_token, { secure: true, sameSite: 'strict' });
      
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
  }
};