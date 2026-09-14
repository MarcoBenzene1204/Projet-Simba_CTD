package com.marco.Simba_CTD.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/*
  Convertit le JWT fourni par Keycloak en objet Authentication
  compréhensible par Spring Security.
 
  Notre JWT contient deux informations importantes :
 
  Les REALM ROLES
  Les PERMISSIONS
  Les deux sont transformés en GrantedAuthority.
 */
@Component
public class KeycloakJwtAuthenticationConverter
                implements Converter<Jwt, AbstractAuthenticationToken> {

        /*
          Identifiant du client backend Keycloak.
         
          Les permissions que nous avons créées sont des
          Client Roles de ce client.
         */
        private static final String BACKEND_CLIENT_ID = "simba-ctd-backend";

        @Override
        public AbstractAuthenticationToken convert(@NonNull Jwt jwt) {

                /*
                  Collection finale des autorités Spring Security.
                 
                  Exemple :
                 
                  ROLE_ADMINISTRATEUR
                  ROLE_ORDONNATEUR
                  engagement:lire
                  engagement:creer
                  engagement:valider
                 */
                Collection<GrantedAuthority> authorities = extractAuthorities(jwt);

                /*
                  Création de l'objet Authentication.
                 
                  Cet objet sera ensuite disponible partout dans
                  Spring Security via SecurityContextHolder.
                 */
                return new JwtAuthenticationToken(
                                jwt,
                                authorities,
                                getPrincipalName(jwt));
        }

        /*
          Récupère le nom de l'utilisateur connecté.
          preferred_username vient normalement de Keycloak.
          Si absent, nous utilisons le "sub".
         */
        private String getPrincipalName(Jwt jwt) {

                String username = jwt.getClaimAsString("preferred_username");

                return username != null
                                ? username
                                : jwt.getSubject();
        }

         // Extrait toutes les autorités du JWT.
        private Collection<GrantedAuthority> extractAuthorities(
                        Jwt jwt) {

                List<GrantedAuthority> authorities = new ArrayList<>();

                /*
                  1. REALM ROLES
        
                  Keycloak :
                 
                  "realm_access": {
                  "roles": [
                  "ADMINISTRATEUR",
                  "ORDONNATEUR"
                  ]
                  }
                 
                  Spring Security attend :
                 
                  ROLE_ADMINISTRATEUR
                  ROLE_ORDONNATEUR
                 */
                authorities.addAll(
                                extractRealmRoles(jwt));

                //   2. PERMISSIONS
                authorities.addAll(
                                extractPermissions(jwt));

                return authorities;
        }

        /*
          Extrait les Realm Roles.
         
          Les Realm Roles sont préfixés par ROLE_
          car Spring Security utilise cette convention
          avec hasRole().
         */
        private Collection<GrantedAuthority> extractRealmRoles(
                        Jwt jwt) {

                Map<String, Object> realmAccess = jwt.getClaim("realm_access");

                if (realmAccess == null) {
                        return List.of();
                }

                Object rolesObject = realmAccess.get("roles");

                if (!(rolesObject instanceof List<?> roles)) {
                        return List.of();
                }

                return roles.stream()
                                .filter(String.class::isInstance)
                                .map(String.class::cast)
                                .map(role -> new SimpleGrantedAuthority(
                                                "ROLE_" + role))
                                .map(authority -> (GrantedAuthority) authority)
                                .toList();
        }

        /*
          Extrait les permissions du client
         simba-ctd-backend.
        
         Exemple de JWT :
        
         "resource_access": {
         "simba-ctd-backend": {
         "roles": [
         "utilisateur:lire",
         "engagement:creer"
         ]
         }
         }
         */
        private Collection<GrantedAuthority> extractPermissions(Jwt jwt) {

            Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
            
            if (resourceAccess == null) {
                    return List.of();
            }

                /*
                  On récupère uniquement les rôles
                  appartenant à notre backend.
                 */
                Object backendObject = resourceAccess.get(BACKEND_CLIENT_ID);

                if (!(backendObject instanceof Map<?, ?> backend)) {
                        return List.of();
                }

                Object rolesObject = backend.get("roles");

                if (!(rolesObject instanceof List<?> roles)) {
                        return List.of();
                }

                /*
                  Contrairement aux Realm Roles,
                  les permissions ne reçoivent PAS "ROLE_".
                 
                  Cela nous permettra d'utiliser :
                 
                  @PreAuthorize(
                  "hasAuthority('engagement:creer')"
                  )
                 */
                return roles.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(SimpleGrantedAuthority::new)
                    .map(authority -> (GrantedAuthority) authority)
                    .toList();
        }
}
