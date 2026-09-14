package com.marco.Simba_CTD.service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class LignebudgetaireService {

    private final Map<UUID, BigDecimal> creditsDisponiblesParLigne = new ConcurrentHashMap<>();

    public BigDecimal verifierCreditsDisponibles(UUID lignebudgetaireId, BigDecimal montantEngagement) {
        if (lignebudgetaireId == null) {
            throw new IllegalArgumentException("Ligne budgetaire obligatoire");
        }
        if (montantEngagement == null || montantEngagement.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant d'engagement doit être positif.");
        }

        BigDecimal creditsDisponibles = creditsDisponiblesParLigne.getOrDefault(lignebudgetaireId, BigDecimal.ZERO);

        if (creditsDisponibles.compareTo(montantEngagement) < 0) {
            throw new IllegalStateException("Crédits insuffisants pour la ligne budgétaire demandée.");
        }

        return creditsDisponibles.subtract(montantEngagement);
    }

    public void definirCreditsDisponibles(UUID lignebudgetaireId, BigDecimal creditsDisponibles) {
        if (lignebudgetaireId == null) {
            throw new IllegalArgumentException("Ligne budgetaire obligatoire");
        }
        if (creditsDisponibles == null || creditsDisponibles.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Le montant des crédits disponibles est invalide.");
        }
        creditsDisponiblesParLigne.put(lignebudgetaireId, creditsDisponibles);
    }

    public void reserverCredits(UUID lignebudgetaireId, BigDecimal montantEngagement) {
        BigDecimal nouveauxCredits = verifierCreditsDisponibles(lignebudgetaireId, montantEngagement);
        creditsDisponiblesParLigne.put(lignebudgetaireId, nouveauxCredits);
    }

    public BigDecimal getCreditsDisponibles(UUID lignebudgetaireId) {
        return creditsDisponiblesParLigne.getOrDefault(Objects.requireNonNull(lignebudgetaireId), BigDecimal.ZERO);
    }
}
