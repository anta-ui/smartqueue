import axios from 'axios';

// Configuration axios
axios.defaults.baseURL = "http://localhost:8000/api";
axios.defaults.withCredentials = true;

export const authService = {
  // Configure l'axios avec le token
  setAuthHeader: (token: string) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Supprime le header d'authentification
  removeAuthHeader: () => {
    delete axios.defaults.headers.common['Authorization'];
  },

  // Vérifie si l'utilisateur est authentifié
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Configuration des intercepteurs
  setupInterceptors: () => {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si l'erreur est 401 et qu'on n'a pas déjà essayé de refresh
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post('/auth/token/refresh/', { refresh: refreshToken });
            
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            authService.setAuthHeader(access);

            // Réessayer la requête originale avec le nouveau token
            return axios(originalRequest);
          } catch (refreshError) {
            // Si le refresh échoue, déconnecter l'utilisateur
            authService.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
};
