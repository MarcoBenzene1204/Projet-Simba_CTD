package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.entity.Utilisateur;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {
    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private CurrentUserService currentUserService;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(jdbcTemplate, currentUserService);
    }

    @Test
    void envoieAuxUtilisateursActifsDuRoleSansNotifierAuteur() {
        UUID collectiviteId = UUID.randomUUID();
        UUID auteurId = UUID.randomUUID();
        UUID destinataireId = UUID.randomUUID();
        RoleApplication role = RoleApplication.CONTROLEUR_FINANCIER;

        doReturn(List.of(destinataireId, auteurId)).when(jdbcTemplate)
            .query(anyString(), any(RowMapper.class), eq(collectiviteId), eq(role.name()));

        notificationService.notifierRoles(collectiviteId, List.of(role), auteurId,
                "ENGAGEMENT_SOUMIS", "Engagement soumis", "ENG-001 est soumis.", "/dashboard/controleur/engagements");

        verify(jdbcTemplate).query(contains("statut::text = 'ACTIF'"), any(RowMapper.class), eq(collectiviteId), eq(role.name()));
        verify(jdbcTemplate).update(contains("INSERT INTO simba_notifications"), eq(destinataireId), eq(collectiviteId),
                eq("ENGAGEMENT_SOUMIS"), eq("Engagement soumis"), eq("ENG-001 est soumis."), eq("/dashboard/controleur/engagements"));
        verify(jdbcTemplate, never()).update(contains("INSERT INTO simba_notifications"), eq(auteurId), eq(collectiviteId),
                anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void marquageLuEstLimiteAuUtilisateurConnecte() {
        UUID notificationId = UUID.randomUUID();
        UUID currentUserId = UUID.randomUUID();
        Utilisateur currentUser = new Utilisateur();
        currentUser.setId(currentUserId);
        when(currentUserService.getUtilisateur()).thenReturn(currentUser);
        when(jdbcTemplate.update(anyString(), eq(notificationId), eq(currentUserId))).thenReturn(1);

        assertTrue(notificationService.marquerLue(notificationId));

        verify(jdbcTemplate).update(contains("AND destinataire_id = ?"), eq(notificationId), eq(currentUserId));
    }
}