package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.entity.Utilisateur;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
/*
  Service donnant accès aux informations de l'utilisateur
  actuellement authentifié.
 
  Cette classe devient le point central permettant aux services
  métier d'obtenir :
 
  - l'utilisateur PostgreSQL ;
  - le JWT Keycloak ;
  - les Realm Roles ;
  - les permissions ;
  - la collectivité courante.
 */
@Service
@Transactional(readOnly = true)
public class CurrentUserService {

    private final UtilisateurService utilisateurService;

    public CurrentUserService(UtilisateurService utilisateurService) {

        this.utilisateurService = utilisateurService;
    }

      //Retourne le profil métier Simba CTD de l'utilisateur connecté.
    @Transactional
    public Utilisateur getUtilisateur() {

        JwtAuthenticationToken authentication = getJwtAuthentication();

        return utilisateurService.getOrCreateUser(
                authentication.getToken());
    }

      //Retourne le JWT Keycloak courant.
    public Jwt getJwt() {

        return getJwtAuthentication()
                .getToken();
    }

    public String getUsername() {

        return getJwtAuthentication()
                .getToken()
                .getClaimAsString(
                        "preferred_username");
    }

     // KEYCLOAK SUB
    public String getKeycloakId() {

        return getJwtAuthentication()
                .getToken()
                .getSubject();
    }

    /**
      COLLECTIVITÉ
     
      Retourne la collectivité de l'utilisateur courant.
     
      SUPER_ADMINISTRATEUR :
      → null
                                                                                                                                                                                                                                                                       
      Autres utilisateurs :
      → collectivité obligatoire
     */
    @Transactional
    public Collectivite getCollectivite() {

        /*
          Le SUPER_ADMINISTRATEUR est global.
         
          Cette information provient maintenant de Keycloak,
          et non plus de Utilisateur.role.
         */
        if (isSuperAdministrateur()) {
            return null;
        }

        Utilisateur utilisateur = getUtilisateur();

        Collectivite collectivite = utilisateur.getCollectivite();

        if (collectivite == null) {

            throw new IllegalStateException(
                "L'utilisateur "
                    + utilisateur.getNomUtilisateur()
                    + " n'est associé à aucune collectivité."
                );
        }

        return collectivite;
    }

    /**
      COLLECTIVITÉ OBLIGATOIRE
                                                                                                                                                                                                                                                                                                        
      À utiliser dans les opérations qui doivent obligatoirement
      être exécutées dans le contexte d'une CTD.
     */
    @Transactional
    public Collectivite requireCollectivite() {

        Collectivite collectivite = getCollectivite();

        if (collectivite == null) {

            throw new IllegalStateException(
                "Cette opération nécessite "
                    + "une collectivité.");
        }

        return collectivite;
    }

     // TENANT ID
    @Transactional
    public UUID requireTenantId() {

        return requireCollectivite()
                .getId();
    }

    //   Retourne TOUS les Realm Roles Simba CTD.
    public List<String> getRoles() {

        return getAuthorities()
            .stream()
            /*
              On conserve uniquement les authorities
              représentant des Realm Roles.
             */
            .map(authority -> authority.getAuthority())
            .filter(authority -> authority.startsWith("ROLE_"))

                /*
                  Suppression du préfixe Spring.
                 
                  ROLE_ORDONNATEUR
                  devient
                  ORDONNATEUR
                 */
                .map(authority -> authority.substring(
                    "ROLE_".length()
                ))
                .toList();
    }

    //  Vérifie si l'utilisateur possède un Realm Role.
    public boolean hasRole(String role) {
        return hasAuthority("ROLE_" + role);
    }

    //   SUPER ADMINISTRATEUR
    public boolean isSuperAdministrateur() {
        return hasRole("SUPER_ADMINISTRATEUR");
    }

    //  ADMINISTRATEUR
    public boolean isAdministrateur() {
        return hasRole("ADMINISTRATEUR");
    }

    /*
      PERMISSIONS
     
      Exemple :
     
      hasPermission("engagement:creer")
      retourne true si cette permission est présente
      dans les Composite Roles Keycloak.
     */
    public boolean hasPermission(String permission) {
        return hasAuthority(permission);
    }

    /*
        Vérifie plusieurs permissions.
     
      Au moins une permission doit être présente.
     */
    public boolean hasAnyPermission(String... permissions) {
        for (String permission : permissions) {
            if (hasPermission(permission)) {
                return true;
            }
        }
        return false;
    }

    //  Vérifie que toutes les permissions sont présentes.
    public boolean hasAllPermissions(String... permissions) {
        for (String permission : permissions) {
            if (!hasPermission(permission)) {
                return false;
            }
        }
        return true;
    }

    //  AUTHORITIES SPRING
    public List<GrantedAuthority> getAuthorities() {
        return getJwtAuthentication()
            .getAuthorities()
            .stream()
            .toList();
    }

    //   Vérifie l'existence d'une authority.
    private boolean hasAuthority(String authority) {
        return getAuthorities()
            .stream()
            .anyMatch(grantedAuthority -> grantedAuthority
                .getAuthority()
                .equals(authority)
            );
    }

    //  AUTHENTICATION JWT
    private JwtAuthenticationToken getJwtAuthentication() {
        Authentication authentication = SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
            throw new IllegalStateException("Aucune authentification JWT valide.");
        }
        return jwtAuthentication;
    }
}
