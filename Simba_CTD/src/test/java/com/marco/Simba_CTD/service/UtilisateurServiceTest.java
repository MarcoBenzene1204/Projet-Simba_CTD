package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Utilisateur;
import com.marco.Simba_CTD.repository.CollectiviteRepository;
import com.marco.Simba_CTD.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UtilisateurServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private CollectiviteRepository collectiviteRepository;

    @InjectMocks
    private UtilisateurService utilisateurService;

    @Test
    void refuseUnCompteKeycloakSansProfilProvisionne() {
        Jwt jwt = jwt("keycloak-sub-inconnu", "inconnu");
        when(utilisateurRepository.findByIdentifiantKeycloak("keycloak-sub-inconnu"))
                .thenReturn(Optional.empty());
        when(utilisateurRepository.findByNomUtilisateur("inconnu"))
                .thenReturn(Optional.empty());

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> utilisateurService.getOrCreateUser(jwt));

        assertEquals(
                "Le profil Simba CTD est introuvable ou n'est pas encore provisionné.",
                exception.getMessage());
    }

    @Test
    void synchroniseUnProfilExistantParSubSansModifierSonRole() {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setIdentifiantKeycloak("keycloak-sub");
        utilisateur.setNomUtilisateur("ancien");
        utilisateur.setStatut(com.marco.Simba_CTD.Enum.StatutUtilisateur.ACTIF);
        Jwt jwt = jwt("keycloak-sub", "nouveau");
        when(utilisateurRepository.findByIdentifiantKeycloak("keycloak-sub"))
                .thenReturn(Optional.of(utilisateur));
        when(utilisateurRepository.save(any(Utilisateur.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Utilisateur result = utilisateurService.getOrCreateUser(jwt);

        assertEquals("nouveau", result.getNomUtilisateur());
        assertEquals("keycloak-sub", result.getIdentifiantKeycloak());
        verify(utilisateurRepository).save(utilisateur);
    }

    private Jwt jwt(String subject, String username) {
        return Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject(subject)
                .claim("preferred_username", username)
                .claim("given_name", "Prenom")
                .claim("family_name", "Nom")
                .claim("email", "user@example.test")
                .build();
    }
}