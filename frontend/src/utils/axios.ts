import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Gestion des erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentative de rafraîchissement du token
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
          refresh: refreshToken
        });

        const { access } = response.data;
        
        // Mettre à jour les tokens
        localStorage.setItem('access_token', access);
        
        // Réessayer la requête originale
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Échec du rafraîchissement, déconnecter l'utilisateur
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;