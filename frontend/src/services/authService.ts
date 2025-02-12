// authService.js
import axios from "axios";

export const authService = {
    login: async (data: { email: string, password: string }, csrfToken: string) => {
      try {
        const response = await axios.post(
          "/api/auth/login/",
          { email: data.email, password: data.password },
          {
            headers: {
              'X-CSRFToken': csrfToken,
            },
          }
        );
        return response.data;
      } catch (error: any) {
        if (error.response) {
          // Gérer les erreurs du serveur ici
          console.error("Erreur du serveur:", error.response.data);
        } else if (error.request) {
          // Gérer les erreurs liées à la requête (par exemple, problème de réseau)
          console.error("Problème avec la requête:", error.request);
        } else {
          // Gérer toute autre erreur
          console.error("Erreur inconnue:", error.message);
        }
        throw error; // Rejeter l'erreur après gestion
      }
    },
  };
  