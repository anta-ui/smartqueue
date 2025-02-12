import axios from 'axios';

// Configurez Axios
axios.defaults.baseURL = "http://localhost:8000/api";
axios.defaults.withCredentials = true;

// Ajoutez un intercepteur pour ajouter le token dans l'en-tête Authorization
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});
