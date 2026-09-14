package com.marco.Simba_CTD.security;

import com.marco.Simba_CTD.entity.Utilisateur;
import com.marco.Simba_CTD.service.UtilisateurService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SecurityContextService {

        private final UtilisateurService utilisateurService;

    public SecurityContextService(
                        UtilisateurService utilisateurService) {
                this.utilisateurService = utilisateurService;
    }

    // =========================================================
    // AUTHENTIFICATION
    // =========================================================

    public Authentication getAuthentication() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new SecurityException(
                    "Aucun utilisateur authentifié.");
        }

        return authentication;
    }

    // =========================================================
    // JWT
    // =========================================================

    public Jwt getJwt() {

        Authentication authentication = getAuthentication();

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof Jwt jwt)) {

            throw new SecurityException(
                    "Le principal courant n'est pas un JWT.");
        }

        return jwt;
    }

    // =========================================================
    // KEYCLOAK ID
    // =========================================================

    /**
     * Retourne le "sub" fourni par Keycloak.
     *
     * Dans notre modèle :
     *
     * JWT.sub
     * =
     * utilisateurs.identifiant_keycloak
     */
    public String getKeycloakSubject() {

        return getJwt().getSubject();
    }

    // =========================================================
    // UTILISATEUR COURANT
    // =========================================================

    public Utilisateur getCurrentUser() {

        return utilisateurService.getOrCreateUser(getJwt());
    }

    // =========================================================
    // ID UTILISATEUR
    // =========================================================

    public UUID getCurrentUserId() {

        return getCurrentUser()
                .getId();
    }

    // =========================================================
    // COLLECTIVITE COURANTE
    // =========================================================

    public UUID getCurrentCollectiviteId() {

        Utilisateur utilisateur = getCurrentUser();

        /*
         * Le SUPER_ADMINISTRATEUR peut ne pas
         * posséder de collectivité.
         */
        if (utilisateur.getCollectivite() == null) {

            if (isSuperAdministrateur()) {
                return null;
            }

            throw new SecurityException(
                    "Aucune collectivité n'est associée "
                            + "à l'utilisateur courant.");
        }

        return utilisateur
                .getCollectivite()
                .getId();
    }

        public boolean isSuperAdministrateur() {
                return getCurrentUser().getRole() == com.marco.Simba_CTD.Enum.RoleApplication.SUPER_ADMINISTRATEUR;
        }

    // =========================================================
    // ROLE METIER
    // =========================================================

    public String getCurrentRole() {

        Utilisateur utilisateur = getCurrentUser();

        if (utilisateur.getRole() == null) {

            throw new SecurityException(
                    "L'utilisateur courant ne possède "
                            + "aucun rôle métier.");
        }

        return utilisateur
                .getRole()
                .name();
    }

    // =========================================================
    // VERIFICATION UTILISATEUR ACTIF
    // =========================================================

    public void verifierUtilisateurActif() {

        Utilisateur utilisateur = getCurrentUser();

        if (utilisateur.getStatut() == null) {

            throw new SecurityException(
                    "Le statut de l'utilisateur est invalide.");
        }

        if (!utilisateur.getStatut().name().equals("ACTIF")) {

            throw new SecurityException(
                    "L'utilisateur courant n'est pas actif.");
        }
    }

    // =========================================================
    // PERMISSION
    // =========================================================

    public boolean hasPermission(
            String permission) {

        return getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority()
                        .equals(permission));
    }

    // =========================================================
    // ROLE
    // =========================================================

    public boolean hasRole(
            String role) {

        return getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority()
                        .equals("ROLE_" + role));
    }
}