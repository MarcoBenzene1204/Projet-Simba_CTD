package com.marco.Simba_CTD.entity;
import java.math.BigDecimal;
import java.util.UUID;

public final class DocumentM5 {
    private final BigDecimal montantHT;
    private final UUID lignebudgetaireId;
    private final String objet;

    public DocumentM5(BigDecimal montantHT, UUID lignebudgetaireId, String objet) {
        this.montantHT = montantHT;
        this.lignebudgetaireId = lignebudgetaireId;
        this.objet = objet;
    }

    public BigDecimal getMontantHT() {
        return montantHT;
    }

    public UUID getLignebudgetaireId() {
        return lignebudgetaireId;
    }

    public String getObjet() {
        return objet;
    }
}