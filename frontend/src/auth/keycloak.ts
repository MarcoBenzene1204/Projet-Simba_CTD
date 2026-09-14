import Keycloak from "keycloak-js";

/*
 Instance unique de Keycloak utilisée par toute l'application.
  Elle contient les informations permettant à notre frontend
  de communiquer avec le serveur Keycloak.
 */
const keycloak = new Keycloak({
  // Ces valeurs peuvent être remplacées par .env.local selon l'environnement.
  url: import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "simba-ctd",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "simba-ctd-frontend",
});

export default keycloak;
