package com.marco.Simba_CTD.security;

import com.marco.Simba_CTD.Enum.RoleApplication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
  Permet de déterminer les rôles métier présents
  dans le JWT Keycloak.
 
  IMPORTANT :
 
  Un utilisateur peut maintenant posséder PLUSIEURS
  rôles applicatifs.
 
  Exemple :
 
  ORDONNATEUR
  + COSIGNATAIRE
 
  est parfaitement valide.
 */

@Component
public class ApplicationRoleValidator {

     // Liste des rôles métier connus par Simba CTD.
    private static final List<String> APPLICATION_ROLES = Arrays.stream(RoleApplication.values())
            .map(role -> role.name())
            .toList();

    /*
      Retourne tous les rôles applicatifs de l'utilisateur.
      Exemple :
      [
      ORDONNATEUR,
      COSIGNATAIRE
      ]
     */
    public List<RoleApplication> resolveRoles(Jwt jwt) {

        List<String> roleNames = extractApplicationRoles(jwt);

        if (roleNames.isEmpty()) {
            throw new SecurityException(
                    "Aucun rôle applicatif SIMBA CTD "
                            + "n'est attribué à cet utilisateur.");
        }

        return roleNames.stream()
                .map(RoleApplication::valueOf)
                .toList();
    }

    /*
      Vérifie si l'utilisateur possède un rôle donné.
      Exemple :
      hasRole(jwt, RoleApplication.ORDONNATEUR)
     */
    public boolean hasRole(
            Jwt jwt,
            RoleApplication role) {

        return extractApplicationRoles(jwt)
                .contains(role.name());
    }

      //Extrait les Realm Roles Keycloak.
    private List<String> extractApplicationRoles(
            Jwt jwt) {

        Object realmAccessObject = jwt.getClaims().get("realm_access");

        if (!(realmAccessObject instanceof Map<?, ?> realmAccess)) {

            return List.of();
        }

        Object rolesObject = realmAccess.get("roles");

        if (!(rolesObject instanceof List<?> roles)) {

            return List.of();
        }

        return roles.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .filter(APPLICATION_ROLES::contains)
                .toList();
    }
}