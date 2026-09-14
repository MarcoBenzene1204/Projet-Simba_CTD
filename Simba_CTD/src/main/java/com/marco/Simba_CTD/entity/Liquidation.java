package com.marco.Simba_CTD.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "liquidations", uniqueConstraints = {
        @UniqueConstraint(name = "uq_liquidation_collectivite_numero", columnNames = { "collectivite_id", "numero" }),
        @UniqueConstraint(name = "uq_liquidation_collectivite_numero_facture", columnNames = { "collectivite_id",
                "numero_facture" })
})
public class Liquidation {

    // =========================================================
    // IDENTIFICATION
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "collectivite_id", nullable = false)
    private UUID collectiviteId;

    // =========================================================
    // ENGAGEMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "engagement_id", nullable = false)
    private Engagement engagement;

    // =========================================================
    // IDENTIFICATION DE LA LIQUIDATION
    // =========================================================

    @Column(name = "numero", nullable = false, length = 100)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_facture", nullable = false)
    private TypeFacture typeFacture;

    @Column(name = "numero_facture", nullable = false, length = 100)
    private String numeroFacture;

    @Column(name = "date_facture", nullable = false)
    private LocalDate dateFacture;

    // =========================================================
    // MONTANTS
    // =========================================================

    @Column(name = "montant_ht", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantHT;

    @Column(name = "montant_taxes", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantTaxes;

    @Column(name = "montant_ttc", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantTTC;

    @Column(name = "montant_nap", precision = 19, scale = 2)
    private BigDecimal montantNAP;

    // =========================================================
    // FISCALITE
    // =========================================================

    @Column(name = "taux_tva", precision = 10, scale = 4)
    private BigDecimal tauxTVA;

    @Column(name = "taux_impot_retenue", precision = 10, scale = 4)
    private BigDecimal tauxImpotRetenue;

    @Column(name = "montant_impot_retenue", precision = 19, scale = 2)
    private BigDecimal montantImpotRetenue;

    // =========================================================
    // PRESTATION
    // =========================================================

    @Column(name = "detail_prestations", columnDefinition = "TEXT")
    private String detailPrestations;

    // =========================================================
    // SERVICE FAIT
    // =========================================================

    /**
     * Date et heure à laquelle le service fait a été attesté.
     *
     * NULL = service fait non attesté.
     */
    @Column(name = "service_fait_at")
    private LocalDateTime serviceFaitAt;

    @Column(name = "agent_service_fait_id")
    private UUID agentServiceFaitId;

    // =========================================================
    // CONFORMITE FISCALE
    // =========================================================

    @Column(name = "conformite_fiscale", nullable = false)
    private Boolean conformiteFiscale = false;

    @Column(name = "url_attestation_fiscale")
    private String urlAttestationFiscale;

    @Column(name = "url_facture")
    private String urlFacture;

    // =========================================================
    // WORKFLOW
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private EtatLiquidation etat;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "ordonnator_id")
    private UUID ordonnatorId;

    @Column(name = "controller_financier_validation_id")
    private UUID controllerFinancierValidationId;

    // =========================================================
    // REGULARISATION
    // =========================================================

    @Column(name = "numero_liquidation_originale", length = 100)
    private String numeroLiquidationOriginale;

    @Column(name = "ecart_regularise", precision = 19, scale = 2)
    private BigDecimal ecartRegularise;

    // =========================================================
    // OBSERVATIONS
    // =========================================================

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    // =========================================================
    // ENUMS
    // =========================================================

    public enum TypeFacture {
        COMPLETE,
        PARTIELLE,
        PRO_FORMA,
        AVOIR,
        RECTIFICATIVE,
        REGULARISATION
    }

    public enum EtatLiquidation {
        BROUILLON,
        SOUMISE_CF,
        VALIDEE_CF,
        REJETEE,
        PRETE_ORDONNANCEMENT
    }

    // =========================================================
    // CONSTRUCTEURS
    // =========================================================

    public Liquidation() {
    }

    public Liquidation(
            UUID collectiviteId,
            Engagement engagement) {
        this.collectiviteId = collectiviteId;
        this.engagement = engagement;

        this.dateCreation = LocalDateTime.now();

        this.etat = EtatLiquidation.BROUILLON;

        this.conformiteFiscale = false;

        this.montantHT = BigDecimal.ZERO;
        this.montantTaxes = BigDecimal.ZERO;
        this.montantTTC = BigDecimal.ZERO;
        this.montantNAP = BigDecimal.ZERO;

        this.tauxTVA = BigDecimal.ZERO;
        this.tauxImpotRetenue = BigDecimal.ZERO;
        this.montantImpotRetenue = BigDecimal.ZERO;
    }

    // =========================================================
    // CALCUL DES MONTANTS
    // =========================================================

    public void calculerMontants() {

        if (montantHT == null) {
            throw new IllegalStateException(
                    "Le montant HT est obligatoire.");
        }

        if (tauxTVA == null) {
            tauxTVA = BigDecimal.ZERO;
        }

        if (tauxImpotRetenue == null) {
            tauxImpotRetenue = BigDecimal.ZERO;
        }

        // TVA
        montantTaxes = montantHT
                .multiply(tauxTVA)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP);

        // TTC
        montantTTC = montantHT
                .add(montantTaxes);

        // Retenue fiscale
        montantImpotRetenue = montantTTC
                .multiply(tauxImpotRetenue)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP);

        // Net à payer
        montantNAP = montantTTC
                .subtract(montantImpotRetenue);
    }

    // =========================================================
    // REGLES METIER
    // =========================================================

    /**
     * Vérifie si le service fait est attesté.
     */
    public boolean serviceFaitEstAtteste() {
        return serviceFaitAt != null;
    }

    /**
     * Vérifie si la conformité fiscale est présente.
     */
    public boolean conformiteFiscaleEstValide() {
        return Boolean.TRUE.equals(conformiteFiscale);
    }

    /**
     * Vérifie si la liquidation est encore modifiable.
     */
    public boolean estModifiable() {
        return etat == null || etat == EtatLiquidation.BROUILLON;
    }

    public void verifierModifiable() {

        if (!estModifiable()) {
            throw new IllegalStateException(
                    "Liquidation verrouillée : elle a déjà été soumise au Contrôleur Financier.");
        }
    }

    /**
     * Vérifie que la liquidation ne dépasse pas
     * le montant TTC de l'engagement.
     */
    public boolean verifierConsistanceAvecEngagement() {

        if (engagement == null) {
            return false;
        }

        if (engagement.getMontantTTC() == null) {
            return false;
        }

        if (montantTTC == null) {
            return false;
        }

        return montantTTC.compareTo(
                engagement.getMontantTTC()) <= 0;
    }

    /**
     * Vérifie les conditions minimales avant soumission.
     */
    public void verifierAvantSoumission() {

        if (!serviceFaitEstAtteste()) {
            throw new IllegalStateException(
                    "Impossible de soumettre la liquidation : " +
                            "le service fait n'est pas attesté.");
        }

        if (!conformiteFiscaleEstValide()) {
            throw new IllegalStateException(
                    "Impossible de soumettre la liquidation : " +
                            "l'attestation de conformité fiscale est absente.");
        }

        if (!verifierConsistanceAvecEngagement()) {
            throw new IllegalStateException(
                    "Le montant liquidé dépasse le montant de l'engagement.");
        }

        if (montantTTC == null ||
                montantTTC.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "Le montant TTC doit être supérieur à zéro.");
        }
    }

    /**
     * Soumet la liquidation au Contrôleur Financier.
     */
    public void soumettreAuControleurFinancier() {

        verifierModifiable();

        verifierAvantSoumission();

        this.etat = EtatLiquidation.SOUMISE_CF;
    }

    /**
     * Valide la liquidation après contrôle financier.
     */
    public void validerParControleur(UUID controleurId) {

        if (this.etat != EtatLiquidation.SOUMISE_CF) {
            throw new IllegalStateException(
                    "La liquidation doit être soumise au Contrôleur Financier.");
        }

        if (controleurId == null) {
            throw new IllegalArgumentException(
                    "L'identifiant du Contrôleur Financier est obligatoire.");
        }

        this.controllerFinancierValidationId = controleurId;
        this.dateValidation = LocalDateTime.now();

        this.etat = EtatLiquidation.VALIDEE_CF;
    }

    /**
     * Rejette la liquidation.
     */
    public void rejeter() {

        if (this.etat != EtatLiquidation.SOUMISE_CF) {
            throw new IllegalStateException(
                    "Seule une liquidation soumise peut être rejetée.");
        }

        this.etat = EtatLiquidation.REJETEE;
    }

    /**
     * Prépare la liquidation pour l'ordonnancement.
     */
    public void preparerPourOrdonnancement() {

        if (this.etat != EtatLiquidation.VALIDEE_CF) {
            throw new IllegalStateException(
                    "Seule une liquidation validée par le Contrôleur Financier "
                            + "peut être préparée pour l'ordonnancement.");
        }

        this.etat = EtatLiquidation.PRETE_ORDONNANCEMENT;
    }

    /**
     * Vérifie si la liquidation peut être intégrée
     * dans un mandat.
     */
    public boolean estPretePourOrdonnancement() {
        return this.etat == EtatLiquidation.PRETE_ORDONNANCEMENT;
    }

    // =========================================================
    // SERVICE FAIT
    // =========================================================

    public void attesterServiceFait(UUID agentId) {

        if (!estModifiable()) {
            throw new IllegalStateException(
                    "Le service fait ne peut être modifié "
                            + "après soumission de la liquidation.");
        }

        if (agentId == null) {
            throw new IllegalArgumentException(
                    "L'agent ayant attesté le service fait est obligatoire.");
        }

        this.agentServiceFaitId = agentId;
        this.serviceFaitAt = LocalDateTime.now();
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public UUID getId() {
        return id;
    }

    public UUID getCollectiviteId() {
        return collectiviteId;
    }

    public void setCollectiviteId(UUID collectiviteId) {
        this.collectiviteId = collectiviteId;
    }

    public Engagement getEngagement() {
        return engagement;
    }

    public void setEngagement(Engagement engagement) {
        this.engagement = engagement;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public TypeFacture getTypeFacture() {
        return typeFacture;
    }

    public void setTypeFacture(TypeFacture typeFacture) {
        this.typeFacture = typeFacture;
    }

    public String getNumeroFacture() {
        return numeroFacture;
    }

    public void setNumeroFacture(String numeroFacture) {
        this.numeroFacture = numeroFacture;
    }

    public LocalDate getDateFacture() {
        return dateFacture;
    }

    public void setDateFacture(LocalDate dateFacture) {
        this.dateFacture = dateFacture;
    }

    public BigDecimal getMontantHT() {
        return montantHT;
    }

    public void setMontantHT(BigDecimal montantHT) {
        this.montantHT = montantHT;
    }

    public BigDecimal getMontantTaxes() {
        return montantTaxes;
    }

    public void setMontantTaxes(BigDecimal montantTaxes) {
        this.montantTaxes = montantTaxes;
    }

    public BigDecimal getMontantTTC() {
        return montantTTC;
    }

    public void setMontantTTC(BigDecimal montantTTC) {
        this.montantTTC = montantTTC;
    }

    public BigDecimal getMontantNAP() {
        return montantNAP;
    }

    public void setMontantNAP(BigDecimal montantNAP) {
        this.montantNAP = montantNAP;
    }

    public BigDecimal getTauxTVA() {
        return tauxTVA;
    }

    public void setTauxTVA(BigDecimal tauxTVA) {
        this.tauxTVA = tauxTVA;
    }

    public BigDecimal getTauxImpotRetenue() {
        return tauxImpotRetenue;
    }

    public void setTauxImpotRetenue(BigDecimal tauxImpotRetenue) {
        this.tauxImpotRetenue = tauxImpotRetenue;
    }

    public BigDecimal getMontantImpotRetenue() {
        return montantImpotRetenue;
    }

    public void setMontantImpotRetenue(
            BigDecimal montantImpotRetenue) {
        this.montantImpotRetenue = montantImpotRetenue;
    }

    public String getDetailPrestations() {
        return detailPrestations;
    }

    public void setDetailPrestations(String detailPrestations) {
        this.detailPrestations = detailPrestations;
    }

    public LocalDateTime getServiceFaitAt() {
        return serviceFaitAt;
    }

    public UUID getAgentServiceFaitId() {
        return agentServiceFaitId;
    }

    public Boolean getConformiteFiscale() {
        return conformiteFiscale;
    }

    public void setConformiteFiscale(Boolean conformiteFiscale) {
        this.conformiteFiscale = conformiteFiscale;
    }

    public String getUrlAttestationFiscale() {
        return urlAttestationFiscale;
    }

    public void setUrlAttestationFiscale(String urlAttestationFiscale) {
        this.urlAttestationFiscale = urlAttestationFiscale;
    }

    public String getUrlFacture() {
        return urlFacture;
    }

    public void setUrlFacture(String urlFacture) {
        this.urlFacture = urlFacture;
    }

    public EtatLiquidation getEtat() {
        return etat;
    }

    public void setEtat(EtatLiquidation etat) {
        this.etat = etat;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateValidation() {
        return dateValidation;
    }

    public UUID getOrdonnatorId() {
        return ordonnatorId;
    }

    public void setOrdonnatorId(UUID ordonnatorId) {
        this.ordonnatorId = ordonnatorId;
    }

    public UUID getControllerFinancierValidationId() {
        return controllerFinancierValidationId;
    }

    public String getNumeroLiquidationOriginale() {
        return numeroLiquidationOriginale;
    }

    public void setNumeroLiquidationOriginale(
            String numeroLiquidationOriginale) {
        this.numeroLiquidationOriginale = numeroLiquidationOriginale;
    }

    public BigDecimal getEcartRegularise() {
        return ecartRegularise;
    }

    public void setEcartRegularise(
            BigDecimal ecartRegularise) {
        this.ecartRegularise = ecartRegularise;
    }

    public String getObservations() {
        return observations;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }
}