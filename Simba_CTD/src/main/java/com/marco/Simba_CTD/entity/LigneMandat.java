package com.marco.Simba_CTD.entity;

import jakarta.persistence.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "mandat_liquidations")
public class LigneMandat {

    // =========================================================
    // CLE COMPOSEE
    // =========================================================

    @EmbeddedId
    private LigneMandatId id;

    // =========================================================
    // MANDAT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("mandatId")
    @JoinColumn(name = "mandat_id", nullable = false)
    private Mandat mandat;

    // =========================================================
    // LIQUIDATION
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("liquidationId")
    @JoinColumn(name = "liquidation_id", nullable = false)
    private Liquidation liquidation;

    // =========================================================
    // MONTANT
    // =========================================================
    //
    // C'est le montant réellement mandaté pour cette
    // liquidation.
    //
    // Il NE faut PAS automatiquement retourner
    // liquidation.getMontantTTC().
    // =========================================================

    @Column(name = "montant", nullable = false, precision = 19, scale = 2)
    private BigDecimal montant;

    // =========================================================
    // CONSTRUCTEURS
    // =========================================================

    public LigneMandat() {
    }

    public LigneMandat(
            Mandat mandat,
            Liquidation liquidation,
            BigDecimal montant) {
        this.mandat = mandat;
        this.liquidation = liquidation;
        this.montant = montant;

        /*
         * L'identifiant réel est construit lorsque les UUID
         * des deux entités sont disponibles.
         */
        if (mandat != null && mandat.getId() != null
                && liquidation != null && liquidation.getId() != null) {

            this.id = new LigneMandatId(
                    mandat.getId(),
                    liquidation.getId());
        }
    }

    // =========================================================
    // VALIDATION METIER
    // =========================================================

    /**
     * Vérifie que le montant mandaté est valide.
     */
    public boolean montantValide() {

        return montant != null
                && montant.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Vérifie que le montant mandaté ne dépasse pas
     * le montant TTC de la liquidation.
     */
    public boolean montantCorrespondALiquidation() {

        if (liquidation == null
                || liquidation.getMontantTTC() == null
                || montant == null) {

            return false;
        }

        return montant.compareTo(
                liquidation.getMontantTTC()) <= 0;
    }

    /**
     * Validation complète de la ligne.
     */
    public void verifierValidite() {

        if (mandat == null) {
            throw new IllegalStateException(
                    "La ligne doit être associée à un mandat.");
        }

        if (liquidation == null) {
            throw new IllegalStateException(
                    "La ligne doit être associée à une liquidation.");
        }

        if (!montantValide()) {
            throw new IllegalStateException(
                    "Le montant de la ligne doit être supérieur à zéro.");
        }

        if (!montantCorrespondALiquidation()) {
            throw new IllegalStateException(
                    "Le montant mandaté ne peut pas dépasser "
                            + "le montant TTC de la liquidation.");
        }

        if (!liquidation.estPretePourOrdonnancement()) {
            throw new IllegalStateException(
                    "La liquidation n'est pas prête pour l'ordonnancement.");
        }
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public LigneMandatId getId() {
        return id;
    }

    public void setId(LigneMandatId id) {
        this.id = id;
    }

    public Mandat getMandat() {
        return mandat;
    }

    public void setMandat(Mandat mandat) {
        this.mandat = mandat;
    }

    public Liquidation getLiquidation() {
        return liquidation;
    }

    public void setLiquidation(Liquidation liquidation) {
        this.liquidation = liquidation;
    }

    public BigDecimal getMontant() {
        return montant;
    }

    public void setMontant(BigDecimal montant) {
        this.montant = montant;
    }

    // =========================================================
    // CLE COMPOSEE
    // =========================================================

    @Embeddable
    public static class LigneMandatId
            implements Serializable {

        @Column(name = "mandat_id", nullable = false)
        private UUID mandatId;

        @Column(name = "liquidation_id", nullable = false)
        private UUID liquidationId;

        public LigneMandatId() {
        }

        public LigneMandatId(
                UUID mandatId,
                UUID liquidationId) {
            this.mandatId = mandatId;
            this.liquidationId = liquidationId;
        }

        public UUID getMandatId() {
            return mandatId;
        }

        public void setMandatId(UUID mandatId) {
            this.mandatId = mandatId;
        }

        public UUID getLiquidationId() {
            return liquidationId;
        }

        public void setLiquidationId(UUID liquidationId) {
            this.liquidationId = liquidationId;
        }

        @Override
        public boolean equals(Object o) {

            if (this == o) {
                return true;
            }

            if (!(o instanceof LigneMandatId that)) {
                return false;
            }

            return Objects.equals(
                    mandatId,
                    that.mandatId)
                    && Objects.equals(
                            liquidationId,
                            that.liquidationId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(
                    mandatId,
                    liquidationId);
        }
    }
}