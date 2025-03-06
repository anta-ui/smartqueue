// src/utils/apiHelpers.js
import axios from 'axios';

// Fonction pour obtenir les headers d'authentification


// Fonction générique pour essayer plusieurs chemins d'API
export const fetchFromMultiplePaths = async (paths, defaultValue = []) => {
  for (const path of paths) {
    try {
      const response = await axios.get(path, getAuthHeader());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`Chemin ${path} non trouvé, essai du suivant`);
        continue;
      }
      console.error(`Erreur avec le chemin ${path}:`, error);
    }
  }
  
  console.log("Aucun chemin n'a fonctionné, retour à la valeur par défaut");
  return defaultValue;
};



// Autres fonctions utilitaires que vous pourriez avoir besoin
export const getOrganizationApiKeys = async (organizationId) => {
  const paths = [
    `/api/organizations/${organizationId}/api_keys/`,
    `/api/super-admin/organizations/${organizationId}/api_keys/`
  ];
  
  return fetchFromMultiplePaths(paths, []);
};

export const getOrganizationWebhooks = async (organizationId) => {
  const paths = [
    `/api/organizations/${organizationId}/webhooks/`,
    `/api/super-admin/organizations/${organizationId}/webhooks/`
  ];
  
  return fetchFromMultiplePaths(paths, []);
};
// Fonction pour obtenir les headers d'authentification
export const getAuthHeader = () => {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('access_token') || 
                  "super_admin_dev_token";
    
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };
  };
  
  // Fonction pour récupérer les contacts d'une organisation
  export const getOrganizationContacts = async (organizationId) => {
    try {
      const response = await axios.get(`/api/organizations/${organizationId}/contacts/`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des contacts:", error);
      return [];
    }
  };
  
  // Fonction pour récupérer les documents d'une organisation
  export const getOrganizationDocuments = async (organizationId) => {
    try {
      const response = await axios.get(`/api/organizations/${organizationId}/documents/`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      return [];
    }
  };
  
  // Fonction pour récupérer l'historique d'une organisation
  export const getOrganizationHistory = async (organizationId) => {
    try {
      const response = await axios.get(`/api/organizations/${organizationId}/history/`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      return [];
    }
  };
  
  // Fonction pour uploader un document
  export const uploadOrganizationDocument = async (organizationId, formData) => {
    try {
      const response = await axios.post(
        `/api/organizations/${organizationId}/documents/`, 
        formData,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'upload du document:", error);
      throw error;
    }
  };
  
  // Fonction pour ajouter un contact
  export const addOrganizationContact = async (organizationId, contactData) => {
    try {
      const response = await axios.post(
        `/api/organizations/${organizationId}/contacts/`,
        contactData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du contact:", error);
      throw error;
    }
  };
  export const getOrganizationLimits = async (organizationId) => {
    // Chemins possibles pour récupérer les limites
    const paths = [
      `/api/super-admin/organizations/${organizationId}/limits/`,
      `/api/organizations/${organizationId}/limits/`
    ];
  
    // Parcourir les chemins jusqu'à trouver une réponse valide
    for (const path of paths) {
      try {
        const response = await axios.get(path, getAuthHeader());
        
        // Si une réponse est obtenue, la retourner immédiatement
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        // Log des erreurs spécifiques
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            console.warn(`Chemin ${path} non trouvé`);
          } else {
            console.error(`Erreur lors de l'appel à ${path}:`, error.message);
          }
        }
      }
    }
  
    // Si aucun appel n'a réussi, retourner un objet vide ou null
    console.error("Impossible de récupérer les limites de l'organisation");
    return null;
  };