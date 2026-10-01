package com.marco.Simba_CTD.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class KeycloakJwtAuthenticationConverterTest {

    @Test
    void extractsPermissionsFromConfiguredClientRoles() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("preferred_username", "marco")
                .claim("resource_access", Map.of(
                        "simba-ctd-api", Map.of("roles", List.of("engagement:lire"))))
                .build();

        var authentication = new KeycloakJwtAuthenticationConverter(
                "simba-ctd-api",
                "simba-ctd-api,simba-ctd-frontend").convert(jwt);

        assertTrue(AuthorityUtils.authorityListToSet(authentication.getAuthorities())
                .contains("engagement:lire"));
    }

    @Test
    void keepsColonNamedRealmRolesAsPermissions() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("realm_access", Map.of("roles", List.of("paiement:lire")))
                .build();

        var authentication = new KeycloakJwtAuthenticationConverter(
                "simba-ctd-api",
                "simba-ctd-api").convert(jwt);

        assertTrue(AuthorityUtils.authorityListToSet(authentication.getAuthorities())
                .contains("paiement:lire"));
    }

        @Test
        void ordonnateurNObtientPasLesPermissionsDePaiement() {
                Jwt jwt = Jwt.withTokenValue("token")
                                .header("alg", "none")
                                .claim("realm_access", Map.of("roles", List.of("ORDONNATEUR")))
                                .build();

                var authentication = new KeycloakJwtAuthenticationConverter(
                                "simba-ctd-api",
                                "simba-ctd-api").convert(jwt);

                var authorities = AuthorityUtils.authorityListToSet(authentication.getAuthorities());
                assertTrue(authorities.contains("mandat:lire"));
                assertFalse(authorities.contains("engagement:valider"));
                assertFalse(authorities.contains("paiement:lire"));
                assertFalse(authorities.contains("paiement:creer"));
        }

        @Test
        void controleurFinancierPeutViserLesRegularisationsEtApurements() {
                Jwt jwt = Jwt.withTokenValue("token")
                                .header("alg", "none")
                                .claim("realm_access", Map.of("roles", List.of("CONTROLEUR_FINANCIER")))
                                .build();

                var authentication = new KeycloakJwtAuthenticationConverter(
                                "simba-ctd-api",
                                "simba-ctd-api").convert(jwt);

                var authorities = AuthorityUtils.authorityListToSet(authentication.getAuthorities());
                assertTrue(authorities.contains("regularisation:lire"));
                assertTrue(authorities.contains("regularisation:valider"));
                assertTrue(authorities.contains("regularisation:rejeter"));
                assertTrue(authorities.contains("regie:apurer"));
                assertFalse(authorities.contains("regie:creer"));
                assertFalse(authorities.contains("paiement:executer"));
        }
}