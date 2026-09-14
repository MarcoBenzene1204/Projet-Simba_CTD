package com.marco.Simba_CTD.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LignebudgetaireServiceTest {

    private final LignebudgetaireService lignebudgetaireService = new LignebudgetaireService();

    @Test
    void refuseUnEngagementQuandLesCreditsSontInsuffisants() {
        UUID ligneBudgetaireId = UUID.randomUUID();
        lignebudgetaireService.definirCreditsDisponibles(ligneBudgetaireId, new BigDecimal("1000.00"));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> lignebudgetaireService.verifierCreditsDisponibles(ligneBudgetaireId, new BigDecimal("1001.00")));

        assertEquals("Crédits insuffisants pour la ligne budgétaire demandée.", exception.getMessage());
    }
}
