package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.repository.EngagementRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EngagementServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private EngagementRepository engagementRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private DocumentM5Service documentM5Service;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private EngagementService engagementService;

    @Test
    void refuseUnEngagementSansReferenceM5() {
        UUID exerciceId = UUID.randomUUID();
        UUID ligneBudgetaireId = UUID.randomUUID();

        Engagement demande = new Engagement();
        demande.setExerciceId(exerciceId);
        demande.setLigneBudgetaireId(ligneBudgetaireId);
        demande.setTypeEngagement(Engagement.TypeEngagement.MARCHE);
        demande.setObjet("Achat de fournitures");
        demande.setMontantHT(new BigDecimal("1500.00"));
        demande.setTauxTVA(BigDecimal.ZERO);
        demande.setTauxImpot(BigDecimal.ZERO);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> engagementService.creerEngagement(demande, null));

        assertEquals("La référence M5 est obligatoire pour un engagement.", exception.getMessage());
    }

    @Test
    void listeTousLesEngagementsDeLaCollectivitePourControleurFinancier() {
        UUID collectiviteId = UUID.randomUUID();
        List<Engagement> engagements = List.of(new Engagement());

        when(currentUserService.requireTenantId()).thenReturn(collectiviteId);
        when(currentUserService.getApplicationRole()).thenReturn("CONTROLEUR_FINANCIER");
        when(engagementRepository.findByCollectiviteId(collectiviteId)).thenReturn(engagements);

        assertEquals(engagements, engagementService.listerEngagements(null));
    }

        @Test
        void bloqueLaSoumissionSansReferenceDAvisDgi() {
        UUID tenantId = UUID.randomUUID();
        UUID engagementId = UUID.randomUUID();
        UUID documentM5Id = UUID.randomUUID();
        Engagement engagement = new Engagement();
        engagement.setDocumentPreparatoireId(documentM5Id);
        engagement.setTypeEngagement(Engagement.TypeEngagement.BON_COMMANDE);
        engagement.setMetadata(Map.of());

        when(currentUserService.requireTenantId()).thenReturn(tenantId);
        when(engagementRepository.findByIdAndCollectiviteId(engagementId, tenantId))
            .thenReturn(Optional.of(engagement));
        when(documentM5Service.documentExiste(documentM5Id, "BON_COMMANDE")).thenReturn(true);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
            () -> engagementService.soumettreAuControleurFinancier(engagementId, null));

        assertEquals("La référence de l'avis d'imposition DGI est obligatoire avant la soumission au Contrôleur Financier.",
            exception.getMessage());
        verify(jdbcTemplate, never()).queryForObject(anyString(), eq(BigDecimal.class), eq(engagement.getLigneBudgetaireId()), eq(tenantId), eq(engagement.getExerciceId()));
        }

        @Test
        void reserveLesCreditsEtMetAJourLaLigneBudgetaire() {
        UUID tenantId = UUID.randomUUID();
        UUID engagementId = UUID.randomUUID();
        UUID exerciceId = UUID.randomUUID();
        UUID ligneBudgetaireId = UUID.randomUUID();
        BigDecimal montantTTC = new BigDecimal("250.00");
        Engagement engagement = new Engagement();
        engagement.setExerciceId(exerciceId);
        engagement.setLigneBudgetaireId(ligneBudgetaireId);
        engagement.setMontantTTC(montantTTC);
        engagement.setEtat(Engagement.EtatEngagement.BROUILLON);

        when(currentUserService.requireTenantId()).thenReturn(tenantId);
        when(engagementRepository.findByIdAndCollectiviteId(engagementId, tenantId))
            .thenReturn(Optional.of(engagement));
        when(jdbcTemplate.queryForObject(anyString(), eq(BigDecimal.class), eq(ligneBudgetaireId), eq(tenantId), eq(exerciceId)))
            .thenReturn(new BigDecimal("500.00"));
        when(jdbcTemplate.update(anyString(), eq(montantTTC), eq(ligneBudgetaireId), eq(tenantId), eq(exerciceId), eq(montantTTC)))
            .thenReturn(1);
        when(engagementRepository.save(engagement)).thenReturn(engagement);

        Engagement result = engagementService.validerEtRéserverCrédits(engagementId);

        assertTrue(result.getCreditsReserves());
        assertEquals(montantTTC, result.getMontantEngage());
        verify(jdbcTemplate).update(anyString(), eq(montantTTC), eq(ligneBudgetaireId), eq(tenantId), eq(exerciceId), eq(montantTTC));
        }
}
