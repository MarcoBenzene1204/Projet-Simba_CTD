package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.repository.EngagementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EngagementServiceTest {

    @Mock
    private EngagementRepository engagementRepository;

    @Mock
    private CurrentUserService currentUserService;

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
}
