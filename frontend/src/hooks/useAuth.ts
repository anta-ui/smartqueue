// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { authService } from '@/services/authService';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthError {
  message: string;
  field?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Vérifier l'authentification au montage
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (!isAuth && !window.location.pathname.includes('/login')) {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/token/", credentials, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      // Mise à jour du state d'authentification
      setIsAuthenticated(true);

      // Stocker les tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Configurer les headers axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      return response.data;
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue lors de la connexion";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      setError({ message: errorMessage });
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      
      // Nettoyage des tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Supprimer le header d'autorisation
      delete axios.defaults.headers.common['Authorization'];
      
      // Redirection vers la page de connexion
      router.replace('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('/auth/token/refresh/', {
        refresh: refreshToken
      });

      localStorage.setItem('access_token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.replace('/login');
      throw error;
    }
  };

  return {
    isAuthenticated,
    login,
    logout,
    refreshToken,
    loading,
    error
  };
};