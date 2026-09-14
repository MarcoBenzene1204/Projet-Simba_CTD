import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import keycloak from "./keycloak";
import { getCurrentUser } from "@/api/auth.api";
import type { RoleApplication } from "@/config/roleConfig";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // Pour verifier si l'authentification est en cours de chargement, 
  // afin d'éviter de rendre les routes protégées avant que l'état d'authentification ne soit déterminé.
  authError?: string;  // Pour stocker les messages d'erreur liés à l'authentification.

  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  telephone?: string;
  matricule?: string;
  collectiviteId?: string;
  collectiviteNom?: string;
  collectiviteLogoUrl?: string;
  collectiviteCouleurPrincipale?: string;
  collectiviteCouleurAccent?: string;
  statut?: string;
  permissions: string[];

  role?: RoleApplication;
  roles: RoleApplication[];

  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let keycloakInitPromise: Promise<boolean> | undefined;

function initializeKeycloak() {
  keycloakInitPromise ??= keycloak.init({
    // la ligne suivante permet de verifier si l'utilisateur est deja 
    //authentifié sur keycloak. Si oui, il est redirigé vers la page de dashboard. Sinon, il est redirigé vers la page de connexion.
    onLoad: "check-sso", 

    //la ligne suivante permet de forcer l'utilisation de la methode S256 
    // pour le PKCE (Proof key for Code Exchange) qui est une methode de 
    // sécurisation de l'authentification OAuth 2.0. 
    // Elle permet de protéger contre les attaques de type "code injection" en générant un code unique pour chaque requête d'authentification.
    pkceMethod: "S256",
    // la ligne suivante permet de désactiver la vérification de l'iframe de connexion.
    checkLoginIframe: false,
  });

  return keycloakInitPromise;
}

function clearAuthCallbackUrl() {
  if (window.location.hash.includes("code=") || window.location.hash.includes("error=")) {
    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    );
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [telephone, setTelephone] = useState<string>();
  const [matricule, setMatricule] = useState<string>();
  const [collectiviteId, setCollectiviteId] = useState<string>();
  const [collectiviteNom, setCollectiviteNom] = useState<string>();
  const [collectiviteLogoUrl, setCollectiviteLogoUrl] = useState<string>();
  const [collectiviteCouleurPrincipale, setCollectiviteCouleurPrincipale] = useState<string>();
  const [collectiviteCouleurAccent, setCollectiviteCouleurAccent] = useState<string>();
  const [statut, setStatut] = useState<string>();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<RoleApplication>();

  useEffect(() => {
    // Une seule initialisation empêche les routes de lire un token non prêt.
    let active = true;

    keycloak.onAuthSuccess = () => setIsAuthenticated(true);
    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false);
      setUsername(undefined);
      setEmail(undefined);
      setFirstName(undefined);
      setLastName(undefined);
      setTelephone(undefined);
      setMatricule(undefined);
      setCollectiviteId(undefined);
      setCollectiviteNom(undefined);
      setCollectiviteLogoUrl(undefined);
      setCollectiviteCouleurPrincipale(undefined);
      setCollectiviteCouleurAccent(undefined);
      setStatut(undefined);
      setPermissions([]);
      setRole(undefined);
    };
    keycloak.onTokenExpired = () => {
      void keycloak.updateToken(30).catch(() => keycloak.clearToken());
    };

    const initialize = async () => {
      try {
        const authenticated = await initializeKeycloak();

        if (!active) return;
        setIsAuthenticated(authenticated);
        setAuthError(undefined);

        if (authenticated) {
          const currentUser = await getCurrentUser();
          if (!active) return;

          setUsername(currentUser.username);
          setEmail(currentUser.email);
          setFirstName(currentUser.firstName);
          setLastName(currentUser.lastName);
          setTelephone(currentUser.telephone);
          setMatricule(currentUser.matricule);
          setCollectiviteId(currentUser.collectiviteId);
          setCollectiviteNom(currentUser.collectiviteNom);
          setCollectiviteLogoUrl(currentUser.collectiviteLogoUrl);
          setCollectiviteCouleurPrincipale(currentUser.collectiviteCouleurPrincipale);
          setCollectiviteCouleurAccent(currentUser.collectiviteCouleurAccent);
          setStatut(currentUser.statut);
          setPermissions(currentUser.permissions);
          //CurrentUser possede exactement un role valide
          setRole(currentUser.role);
        }
      } catch (error) {
        console.error(
          "Erreur lors de l'initialisation de la session",
          error,
        );

        if (active) {
          keycloak.clearToken();
          clearAuthCallbackUrl();

          setIsAuthenticated(false);
          setRole(undefined);
          setPermissions([]);

          const responseMessage = axiosErrorMessage(error);

          let message =
            responseMessage ??
            "Le profil Simba CTD est introuvable ou incomplet.";

          // if (
          //   error instanceof Error &&
          //   error.message.startsWith("SECURITY_MULTIPLE_ROLES")
          // ) {
          //   message =
          //     "Accès refusé : cet utilisateur possède plusieurs rôles. Un utilisateur SIMBA CTD ne peut posséder qu'un seul rôle.";
          // }

          if (
            error instanceof Error &&
            error.message.startsWith("SECURITY_NO_ROLE")
          ) {
            message =
              "Accès refusé : aucun rôle applicatif n'est attribué à cet utilisateur.";
          }

          if (
            error instanceof Error &&
            error.message.startsWith("SECURITY_INVALID_ROLE")
          ) {
            message =
              "Accès refusé : le rôle attribué à cet utilisateur est invalide.";
          }

          setAuthError(message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void initialize();
    return () => {
      active = false;
      keycloak.onAuthSuccess = undefined;
      keycloak.onAuthLogout = undefined;
      keycloak.onTokenExpired = undefined;
    };
  }, []);

  const login = async () => {
    await keycloak.login({
      redirectUri: `${window.location.origin}/dashboard`,
    });
  };

  const logout = async () => {
    await keycloak.logout({
      redirectUri: `${window.location.origin}/connexion`,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        authError,
        username,
        email,
        firstName,
        lastName,
        telephone,
        matricule,
        collectiviteId,
        collectiviteNom,
        collectiviteLogoUrl,
        collectiviteCouleurPrincipale,
        collectiviteCouleurAccent,
        statut,
        permissions,
        role,
        roles: role ? [role] : [],
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function axiosErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = error.response;
  if (typeof response !== "object" || response === null || !("data" in response)) return undefined;
  const data = response.data;
  if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") return data.message;
  return undefined;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
