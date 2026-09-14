package com.marco.Simba_CTD.Enum;

public enum EtatRegularisation {
    DETECTEE, // Dépense détectée mais pas encore notifiée
    NOTIFIEE, // Ordonnateur notifié
    ENGAGEMENT_CREE, // Engagement rétrospectif créé
    SOUMIS_CF, // Engagement soumis au CF
    VISE_CF, // Visé par le CF
    REJET_CF, // Rejeté par le CF
    LIQUIDEE, // Liquidation effectuée
    MANDATEE, // Mandat de régularisation créé
    CONTREPASSEE, // Contrepassation 470XX effectuée
    REGULARISEE, // Régularisée avec succès
    DEPASSEMENT_DELAI // Délai dépassé, anomalie
}
