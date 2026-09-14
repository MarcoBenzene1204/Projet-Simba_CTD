import axios from "axios";
import keycloak from "@/auth/keycloak";

//Axios est un element qui permet de connecter notre backend Spring-boot à ce frontend react-typescript/Vite
// Axios relie le frontend React/TypeScript au backend Spring Boot.
const api = axios.create({
  // Le proxy Vite ou une URL d'environnement permet de changer de cible sans modifier le code.
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8082/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
      try {
        await keycloak.updateToken(30);

        if (keycloak.token) {
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
      } catch (error) {
        console.error("Impossible de rafraîchir le token Keycloak", error);
        keycloak.clearToken();
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expirée ou token invalide");
      keycloak.clearToken();
    }

    if (error.response?.status === 403) {
      console.warn("Accès refusé par le backend");
    }

    return Promise.reject(error);
  },
);

export default api;
