package com.marco.Simba_CTD.entity;

import com.marco.Simba_CTD.Enum.EtatRegularisation;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Regularisation470XXTest {

    @Test
    void documentM5ResteFacultatif() {
        Regularisation470XX regularisation = new Regularisation470XX(
            "REG-470XX-2026-000001",
            "REF-001",
            BigDecimal.valueOf(1250),
            "Fournitures");

        regularisation.setExerciceId(UUID.randomUUID());
        regularisation.setLigneBudgetaireId(UUID.randomUUID());
        regularisation.setMontantImputation(BigDecimal.valueOf(1250));

        assertTrue(regularisation.getDocumentM5Id() == null);
        assertTrue(regularisation.estDetectee());
    }

    @Test
    void contrepassationExigeUneEcritureProvisoire() {
        Regularisation470XX regularisation = nouvelleRegularisation();
        regularisation.setEtat(EtatRegularisation.MANDATEE);

        assertThrows(IllegalStateException.class,
                () -> regularisation.effectuerContrepassation470XX("CP-001"));

        regularisation.enregistrerEcriture470XX("470-001");
        regularisation.effectuerContrepassation470XX("CP-001");

        assertTrue(regularisation.isContrepassation470XXAutoeffectuee());
        assertTrue(regularisation.getEtat() == EtatRegularisation.CONTREPASSEE);
    }

    @Test
    void alertesRespectentLesEcheances() {
        Regularisation470XX regularisation = nouvelleRegularisation();
        regularisation.setDateDetection(LocalDateTime.now().minusDays(15));
        regularisation.setDateEcheanceRegularisation(LocalDate.now().plusDays(15));

        assertTrue(regularisation.doitDeclencherAlerteJ15());
        assertFalse(regularisation.doitDeclencherAlerteJ25());
    }

    private Regularisation470XX nouvelleRegularisation() {
        return new Regularisation470XX(
            "REG-470XX-2026-000002",
            "REF-002",
            BigDecimal.valueOf(500),
            "Prestations");
    }
}
