package com.marco.Simba_CTD.service;

import java.math.BigDecimal;

public record ReportingSummary(
        int totalEngagements,
        int totalLiquidations,
        int totalMandats,
        int totalPaiements,
        BigDecimal montantEngages,
        BigDecimal montantLiquidations,
        BigDecimal montantMandats,
        BigDecimal montantPaiements,
        int engagementsSoumis,
        int liquidationsValidees,
        int mandatsTransmis,
        int paiementsExecutes
) {
    public ReportingSummary {
        montantEngages = montantEngages == null ? BigDecimal.ZERO : montantEngages;
        montantLiquidations = montantLiquidations == null ? BigDecimal.ZERO : montantLiquidations;
        montantMandats = montantMandats == null ? BigDecimal.ZERO : montantMandats;
        montantPaiements = montantPaiements == null ? BigDecimal.ZERO : montantPaiements;
    }
}
