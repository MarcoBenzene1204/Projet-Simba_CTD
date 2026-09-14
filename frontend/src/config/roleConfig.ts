
export const ROLES = {
    SUPER_ADMINISTRATEUR: "SUPER_ADMINISTRATEUR",
    ADMINISTRATEUR: "ADMINISTRATEUR",
    CONTROLEUR_FINANCIER: "CONTROLEUR_FINANCIER",
    ORDONNATEUR: "ORDONNATEUR",
    REGISSEUR: "REGISSEUR",
    COSIGNATAIRE: "COSIGNATAIRE",
    CHEF_SERVICE: "CHEF_SERVICE",
    RECEVEUR: "RECEVEUR",
} as const;

export type RoleApplication = (typeof ROLES)[keyof typeof ROLES];

/**
 * Ordre de priorité utilisé lorsqu'un utilisateur possède
 * plusieurs rôles applicatifs.
 */
export const ROLE_PRIORITY: RoleApplication[] = [
    ROLES.SUPER_ADMINISTRATEUR,
    ROLES.ADMINISTRATEUR,
    ROLES.CONTROLEUR_FINANCIER,
    ROLES.ORDONNATEUR,
    ROLES.CHEF_SERVICE,
    ROLES.COSIGNATAIRE,
    ROLES.REGISSEUR,
    ROLES.RECEVEUR,
];

/**
 * Retourne le rôle principal à utiliser pour l'affichage
 * lorsque plusieurs rôles sont attribués à l'utilisateur.
 */
export function getPrimaryRole(
    roles: string[],
): RoleApplication | undefined {
    return ROLE_PRIORITY.find((role) => roles.includes(role));
}