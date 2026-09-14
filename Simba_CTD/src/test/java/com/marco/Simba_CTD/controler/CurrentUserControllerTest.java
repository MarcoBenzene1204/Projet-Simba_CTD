package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.dto.UtilisateurCurrentResponse;
import com.marco.Simba_CTD.entity.Utilisateur;
import com.marco.Simba_CTD.service.CurrentUserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CurrentUserControllerTest {

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private CurrentUserController controller;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void refuseQuandAucuneAuthentificationNExistePas() {
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> controller.me());

        assertEquals("Aucun utilisateur authentifié.", exception.getMessage());
    }

    @Test
    void retourneLesPermissionsSansRolePrefix() {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(UUID.randomUUID());
        utilisateur.setIdentifiantKeycloak("keycloak-123");
        utilisateur.setNomUtilisateur("alice");
        utilisateur.setPrenom("Alice");
        utilisateur.setNom("Martin");
        utilisateur.setEmail("alice@example.com");
        utilisateur.setRole(com.marco.Simba_CTD.Enum.RoleApplication.ORDONNATEUR);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "principal",
                "credentials",
                List.of(
                        new SimpleGrantedAuthority("ROLE_ORDONNATEUR"),
                        new SimpleGrantedAuthority("engagement:creer"),
                        new SimpleGrantedAuthority("ROLE_ADMINISTRATEUR"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(currentUserService.getUtilisateur()).thenReturn(utilisateur);

        UtilisateurCurrentResponse response = controller.me();

        assertEquals(List.of("engagement:creer"), response.permissions());
    }
}
