// services/queueTypeService.js
import { api } from './api';

// Exportation des constantes pour les catégories
export const QueueTypeCategories = {
  VEHICLE: 'VE',
  PERSON: 'PE',
  MIXED: 'MI'
};

// Exportation des fonctions du service
export const queueTypeService = {
  // Créer un nouveau type de file d'attente
  createQueueType: async (data) => {
    try {
      // Afficher les données complètes envoyées à l'API
      console.log('Données complètes envoyées à l\'API:', JSON.stringify(data));
      
      // Vérifier que tous les champs requis sont présents
      const requiredFields = ['name', 'category', 'organization', 'branch'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        console.error('Champs obligatoires manquants:', missingFields);
        throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
      }

      // Convertir explicitement les IDs en chaînes de caractères si ce sont des nombres
      const formattedData = {
        ...data,
        organization: String(data.organization),
        branch: String(data.branch)
      };

      // Envoi de la requête avec les données formatées
      const response = await api.post('/queues/queue-types/', formattedData);
      console.log('Réponse de création réussie:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du type de file:', error);
      
      // Affichage détaillé de l'erreur pour le débogage
      if (error.response) {
        console.error('Statut de l\'erreur:', error.response.status);
        console.error('En-têtes de la réponse:', error.response.headers);
        console.error('Données de la réponse:', error.response.data);
        
        // Tentative d'analyser le contenu de l'erreur s'il s'agit d'une chaîne
        if (typeof error.response.data === 'string') {
          try {
            const parsedError = JSON.parse(error.response.data);
            console.error('Erreur analysée:', parsedError);
          } catch (parseError) {
            console.error('Impossible d\'analyser l\'erreur en JSON:', error.response.data);
          }
        }
      } else if (error.request) {
        console.error('Aucune réponse reçue. Requête:', error.request);
      } else {
        console.error('Erreur de requête:', error.message);
      }
      
      throw error;
    }
  },
  
  // Récupérer tous les types de files d'attente
  getQueueTypes: async () => {
    try {
      console.log('Envoi de la requête vers /queues/queue-types/');
      const response = await api.get('/queues/queue-types/');
      
      console.log('Réponse reçue:', response);
      console.log('Données des types de file:', response.data);
      
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.warn('La réponse est un tableau vide');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de files:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
      }
      throw error;
    }
  },
  
  // Autres fonctions inchangées...
  getQueueTypeById: async (id) => {
    try {
      const response = await api.get(`/queues/queue-types/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du type de file ${id}:`, error);
      throw error;
    }
  },
  
  updateQueueType: async (id, data) => {
    try {
      const response = await api.patch(`/queues/queue-types/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du type de file ${id}:`, error);
      throw error;
    }
  },
  
  deleteQueueType: async (id) => {
    try {
      await api.delete(`/queues/queue-types/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du type de file ${id}:`, error);
      throw error;
    }
  }
};