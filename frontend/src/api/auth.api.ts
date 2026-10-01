import api from "./axios";
import keycloak from "@/auth/keycloak";
import type { RoleApplication } from "@/config/roleConfig";

export interface CurrentUser {
  id: string;
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  telephone?: string;
  matricule?: string;
  collectiviteNom?: string;
  collectiviteLogoUrl?: string;
  collectiviteCouleurPrincipale?: string;
  collectiviteCouleurAccent?: string;
  statut: string;
  permissions: string[];

   // Un utilisateur SIMBA CTD possède exactement un rôle.
  role: RoleApplication;

  collectiviteId?: string;
}

interface CurrentUserApiResponse {
  id: string;
  identifiantKeycloak: string;
  nomUtilisateur?: string;
  email: string;

  prenom?: string;
  nom?: string;

   // Format historique du backend.
  role: string;
  telephone?: string;
  matricule?: string;
  collectiviteNom?: string;
  collectiviteLogoUrl?: string;
  collectiviteCouleurPrincipale?: string;
  collectiviteCouleurAccent?: string;
  statut: string;
  permissions?: string[];

  // Plusieurs rôles sont interdits.

  // roles?: string[];

  collectiviteId?: string;
}

function tokenPermissions(): string[] {
  const resourceAccess = keycloak.tokenParsed?.resource_access;
  const permissions = new Set<string>();

  if (resourceAccess && typeof resourceAccess === "object") {
    for (const client of Object.values(resourceAccess as Record<string, unknown>)) {
      if (!client || typeof client !== "object") continue;
      const roles = (client as { roles?: unknown }).roles;
      if (Array.isArray(roles)) {
        roles.filter((role): role is string => typeof role === "string")
          .filter((role) => role.includes(":"))
          .forEach((role) => permissions.add(role));
      }
    }
  }

  const realmRoles = keycloak.tokenParsed?.realm_access?.roles;
  if (Array.isArray(realmRoles)) {
    realmRoles.filter((role): role is string => typeof role === "string")
      .filter((role) => role.includes(":"))
      .forEach((role) => permissions.add(role));
  }

  return [...permissions];
}

const VALID_ROLES: RoleApplication[] = [
  "SUPER_ADMINISTRATEUR",
  "ADMINISTRATEUR",
  "CONTROLEUR_FINANCIER",
  "ORDONNATEUR",
  "REGISSEUR",
  "COSIGNATAIRE",
  "CHEF_SERVICE",
  "RECEVEUR",
];

function isValidRole(role: string): role is RoleApplication {
  return VALID_ROLES.includes(role as RoleApplication);
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await api.get<CurrentUserApiResponse>("/auth/me");

  const user = response.data;

  let resolvedRole: string | undefined;

   // Priorité au champ role.
  if (user.role) {
    resolvedRole = user.role;
  }

  if (!resolvedRole) {
    throw new Error(
      "SECURITY_NO_ROLE: aucun rôle applicatif n'est attribué à cet utilisateur.",
    );
  }

  if (!isValidRole(resolvedRole)) {
    throw new Error(
      `SECURITY_INVALID_ROLE: rôle applicatif inconnu "${resolvedRole}".`,
    );
  }

  const permissions = new Set([
    ...(user.permissions ?? []),
    ...tokenPermissions(),
  ]);

  return {
    id: user.id,
    keycloakId: user.identifiantKeycloak,
    username: user.nomUtilisateur ?? "",
    email: user.email,
    firstName: user.prenom ?? "",
    lastName: user.nom ?? "",
    telephone: user.telephone,
    matricule: user.matricule,
    collectiviteNom: user.collectiviteNom,
    collectiviteLogoUrl: user.collectiviteLogoUrl,
    collectiviteCouleurPrincipale: user.collectiviteCouleurPrincipale,
    collectiviteCouleurAccent: user.collectiviteCouleurAccent,
    statut: user.statut,
    permissions: [...permissions],
    role: resolvedRole,
    collectiviteId: user.collectiviteId,
  };
}