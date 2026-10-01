package com.marco.Simba_CTD.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Arrays;
import java.util.Locale;

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
        private final String backendClientId;
        private final List<String> permissionClientIds;

        public KeycloakJwtAuthenticationConverter(
                        @Value("${simba.keycloak.backend-client-id:simba-ctd-api}") String backendClientId,
                        @Value("${simba.keycloak.permission-client-ids:simba-ctd-api,simba-ctd-backend,simba-ctd-frontend}") String permissionClientIds) {
                this.backendClientId = backendClientId;
                this.permissionClientIds = Arrays.stream(permissionClientIds.split(","))
                                .map(clientId -> clientId.trim())
                                .filter(clientId -> !clientId.isBlank())
                                .distinct()
                                .toList();
        }

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

                // Fallback explicite : les rôles Keycloak peuvent être délivrés
                // sans leurs rôles composites client dans l'access token.
                authorities.addAll(
                                extractRoleDerivedPermissions(jwt));

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

                return extractRoleValues(realmAccess.get("roles")).stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                                        .flatMap(role -> {
                                                if (role.contains(":")) {
                                                        return java.util.stream.Stream.of(
                                                                        new SimpleGrantedAuthority(role));
                                                }
                                                return java.util.stream.Stream.of(
                                                                new SimpleGrantedAuthority("ROLE_" + role));
                                        })
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
            Set<String> clientIds = new LinkedHashSet<>();
            clientIds.add(backendClientId);
            clientIds.addAll(permissionClientIds);

            List<?> roleValues = clientIds.stream()
                    .map(resourceAccess::get)
                    .filter(Map.class::isInstance)
                    .map(Map.class::cast)
                    .map(client -> client.get("roles"))
                    .map(this::extractRoleValues)
                    .flatMap(roles -> roles.stream())
                    .toList();

                /*
                  Contrairement aux Realm Roles,
                  les permissions ne reçoivent PAS "ROLE_".
                 
                  Cela nous permettra d'utiliser :
                 
                  @PreAuthorize(
                  "hasAuthority('engagement:creer')"
                  )
                */
                return roleValues.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(SimpleGrantedAuthority::new)
                    .map(authority -> (GrantedAuthority) authority)
                    .toList();
        }

        private Collection<GrantedAuthority> extractRoleDerivedPermissions(Jwt jwt) {
                Map<String, Object> realmAccess = jwt.getClaim("realm_access");
                if (realmAccess == null) {
                        return List.of();
                }

                Set<String> permissions = new LinkedHashSet<>();
                for (Object roleValue : extractRoleValues(realmAccess.get("roles"))) {
                        if (!(roleValue instanceof String role)) {
                                continue;
                        }
                        permissions.addAll(permissionsForRole(role));
                }

                return permissions.stream()
                        .map(SimpleGrantedAuthority::new)
                        .map(authority -> (GrantedAuthority) authority)
                        .toList();
        }

        private List<String> permissionsForRole(String role) {
                return switch (role.toUpperCase(Locale.ROOT)) {
                        case "SUPER_ADMINISTRATEUR" -> List.of(
                                "collectivite:lire", "collectivite:creer", "collectivite:modifier",
                                "collectivite:supprimer", "parametrage:lire", "parametrage:creer",
                                "parametrage:modifier", "utilisateur:creer", "utilisateur:modifier",
                                "reporting:lire");
                        case "ADMINISTRATEUR", "ADMIN" -> List.of(
                                "parametrage:lire", "parametrage:creer", "parametrage:modifier",
                                "utilisateur:creer", "utilisateur:modifier", "reporting:lire");
                        case "ORDONNATEUR" -> List.of(
                                "engagement:lire", "engagement:creer", "engagement:soumettre",
                                "engagement:confirmer", "engagement:rejeter",
                                "liquidation:lire", "liquidation:creer", "liquidation:soumettre",
                                "liquidation:rejeter",
                                "mandat:lire", "mandat:creer", "mandat:soumettre", "mandat:valider",
                                "mandat:transmettre", "mandat:transmettre_receveur",
                                "regularisation:lire", "regularisation:creer");
                        case "CONTROLEUR_FINANCIER" -> List.of(
                                "engagement:lire", "engagement:valider", "engagement:rejeter",
                                "liquidation:lire", "liquidation:valider", "liquidation:rejeter",
                                "mandat:lire", "mandat:valider", "mandat:rejeter", "parametrage:lire",
                                "regularisation:lire", "regularisation:valider", "regularisation:rejeter",
                                "regie:apurer");
                        case "CHEF_SERVICE" -> List.of(
                                "engagement:lire", "liquidation:lire", "liquidation:attester_service_fait");
                        case "RECEVEUR" -> List.of(
                                "paiement:lire", "paiement:creer", "paiement:executer", "paiement:rejeter",
                                "regularisation:lire", "regularisation:notifier", "regularisation:comptabiliser");
                        case "COSIGNATAIRE" -> List.of("paiement:lire", "paiement:cosigner");
                        case "REGISSEUR" -> List.of("regularisation:lire", "regie:lire");
                        default -> List.of();
                };
        }

        private List<?> extractRoleValues(Object rolesObject) {
                if (rolesObject instanceof Collection<?> roles) {
                        return roles.stream().toList();
                }
                return List.of();
        }
}
