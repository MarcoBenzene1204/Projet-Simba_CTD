package com.marco.Simba_CTD.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "engagements", uniqueConstraints = {
        @UniqueConstraint(name = "uq_engagement_collectivite_numero", columnNames = { "collectivite_id", "numero" })
})
public class Engagement {

    // =========================================================
    // IDENTIFICATION
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "collectivite_id", nullable = false)
    private UUID collectiviteId;

    @Column(name = "exercice_id", nullable = false)
    private UUID exerciceId;

    @Column(name = "ligne_budgetaire_id", nullable = false)
    private UUID ligneBudgetaireId;

    @Column(name = "tiers_id")
    private UUID tiersId;

    @Column(name = "document_preparatoire_id")
    private UUID documentPreparatoireId;

    @Column(name = "numero", nullable = false, length = 100)
    private String numeroEngagement;

    // =========================================================
    // TYPE ET OBJET
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "type_engagement", nullable = false)
    private TypeEngagement typeEngagement;

    @Column(name = "objet", nullable = false, columnDefinition = "TEXT")
    private String objet;

    // =========================================================
    // MONTANTS
    // =========================================================

    @Column(name = "montant_ht", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantHT = BigDecimal.ZERO;

    @Column(name = "montant_taxes", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantTVA = BigDecimal.ZERO;

    @Column(name = "montant_ttc", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantTTC = BigDecimal.ZERO;

    @Column(name = "montant_engage", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantEngage = BigDecimal.ZERO;

    @Column(name = "taux_tva", precision = 10, scale = 4)
    private BigDecimal tauxTVA = BigDecimal.ZERO;

    @Column(name = "taux_impot", precision = 10, scale = 4)
    private BigDecimal tauxImpot = BigDecimal.ZERO;

    @Column(name = "montant_impot", precision = 19, scale = 2)
    private BigDecimal montantImpot = BigDecimal.ZERO;

    // =========================================================
    // WORKFLOW
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private EtatEngagement etat;

    @Column(name = "date_engagement", nullable = false)
    private LocalDate dateEngagement;

    @Column(name = "soumis_cf_at")
    private LocalDateTime soumisCfAt;

    @Column(name = "vise_cf_at")
    private LocalDateTime viseCfAt;

    @Column(name = "controller_financier_visa_id")
    private UUID controllerFinancierVisaId;

    @Column(name = "date_visa")
    private LocalDateTime dateVisa;

    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    private String motifRejet;

    // =========================================================
    // CREATEUR / ORDONNATEUR
    // =========================================================

    @Column(name = "ordonnator_id")
    private UUID ordonnatorId;

    // =========================================================
    // INFORMATIONS COMPLEMENTAIRES
    // =========================================================

    @Column(name = "periodicite")
    private String periodicite;

    @Column(name = "contrat_service_id")
    private UUID contratServiceId;

    @Column(name = "depassement_credit_autorise")
    private Boolean depassementCreditAutorise = false;

    @Column(name = "credits_reserves", nullable = false)
    private Boolean creditsReserves = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    // =========================================================
    // DATES TECHNIQUES
    // =========================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime dateModification;

    // =========================================================
    // RELATIONS
    // =========================================================

    @OneToMany(mappedBy = "engagement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Liquidation> liquidations = new ArrayList<>();

    // =========================================================
    // ENUMS
    // =========================================================

    public enum TypeEngagement {

        BON_COMMANDE,

        LETTRE_COMMANDE,

        MARCHE,

        PROVISIONNEL,

        AUTRE,

        REGULARISATION_470XX
    }

    public enum EtatEngagement {

        BROUILLON,

        SOUMIS_CF,

        VISE,

        REJET,

        CONFIRME,

        CLOTURE_30_NOV
    }

    // =========================================================
    // CONSTRUCTEURS
    // =========================================================

    public Engagement() {
    }

    public Engagement(UUID documentM5Id, UUID ordonnatorId) {
        this();
        this.documentPreparatoireId = documentM5Id;
        this.ordonnatorId = ordonnatorId;
        this.dateCreation = LocalDateTime.now();
        this.dateModification = this.dateCreation;
        this.dateEngagement = LocalDate.now();
        this.etat = EtatEngagement.BROUILLON;
    }

    public Engagement(
            UUID collectiviteId,
            UUID exerciceId,
            UUID ligneBudgetaireId,
            UUID ordonnatorId) {
        this.collectiviteId = collectiviteId;
        this.exerciceId = exerciceId;
        this.ligneBudgetaireId = ligneBudgetaireId;
        this.ordonnatorId = ordonnatorId;

        this.dateCreation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
        this.dateEngagement = LocalDate.now();

        this.etat = EtatEngagement.BROUILLON;

        this.creditsReserves = false;
        this.depassementCreditAutorise = false;

        this.montantHT = BigDecimal.ZERO;
        this.montantTVA = BigDecimal.ZERO;
        this.montantTTC = BigDecimal.ZERO;
        this.montantEngage = BigDecimal.ZERO;

        this.tauxTVA = BigDecimal.ZERO;
        this.tauxImpot = BigDecimal.ZERO;
        this.montantImpot = BigDecimal.ZERO;

        this.metadata = Map.of();
    }

    // =========================================================
    // REGLES METIER
    // =========================================================

    /**
     * Un engagement n'est modifiable que lorsqu'il est encore
     * en brouillon.
     */
    public boolean estModifiable() {
        return this.etat == EtatEngagement.BROUILLON;
    }

    /**
     * Vérifie que l'engagement peut encore être modifié.
     */
    public void verifierModifiable() {

        if (!estModifiable()) {
            throw new IllegalStateException(
                    "Engagement verrouillé : il a déjà été transmis " +
                            "au Contrôleur Financier ou traité.");
        }
    }

    /**
     * Réserve les crédits de l'engagement.
     */
    public void reserverCredits() {

        verifierModifiable();

        if (montantTTC == null ||
                montantTTC.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "Le montant TTC de l'engagement doit être supérieur à zéro.");
        }

        this.creditsReserves = true;
        this.montantEngage = this.montantTTC;
    }

    /**
     * Soumet l'engagement au Contrôleur Financier.
     */
    public void soumettreAuControleurFinancier() {

        if (!Boolean.TRUE.equals(creditsReserves)) {
            throw new IllegalStateException(
                    "Les crédits doivent être réservés avant " +
                            "la transmission au Contrôleur Financier.");
        }

        if (this.etat != EtatEngagement.BROUILLON) {
            throw new IllegalStateException(
                    "Seul un engagement en brouillon peut être soumis.");
        }

        this.etat = EtatEngagement.SOUMIS_CF;
        this.soumisCfAt = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
    }

    /**
     * Appose le visa du Contrôleur Financier.
     */
    public void apposerVisa(UUID controleurId) {

        if (this.etat != EtatEngagement.SOUMIS_CF) {
            throw new IllegalStateException(
                    "L'engagement doit être soumis au Contrôleur Financier.");
        }

        if (controleurId == null) {
            throw new IllegalArgumentException(
                    "L'identifiant du Contrôleur Financier est obligatoire.");
        }

        this.controllerFinancierVisaId = controleurId;
        this.viseCfAt = LocalDateTime.now();
        this.dateVisa = this.viseCfAt;

        this.etat = EtatEngagement.VISE;

        this.dateModification = LocalDateTime.now();
    }

    /**
     * Rejette l'engagement.
     */
    public void rejeter(String motif) {

        if (this.etat != EtatEngagement.SOUMIS_CF) {
            throw new IllegalStateException(
                    "Seul un engagement soumis peut être rejeté.");
        }

        if (motif == null || motif.isBlank()) {
            throw new IllegalArgumentException(
                    "Le motif du rejet est obligatoire.");
        }

        this.motifRejet = motif;
        this.etat = EtatEngagement.REJET;

        this.dateModification = LocalDateTime.now();
    }

    /**
     * Confirme l'engagement après visa.
     */
    public void confirmer() {

        if (this.etat != EtatEngagement.VISE) {
            throw new IllegalStateException(
                    "Seul un engagement visé peut être confirmé.");
        }

        this.etat = EtatEngagement.CONFIRME;
        this.dateModification = LocalDateTime.now();
    }

    /**
     * Vérifie qu'un engagement peut donner lieu à une liquidation.
     */
    public boolean estConfirmé() {
        return this.etat == EtatEngagement.CONFIRME;
    }

    // =========================================================
    // CALCULS FINANCIERS
    // =========================================================

    public void calculerMontants() {

        if (montantHT == null) {
            throw new IllegalStateException(
                    "Le montant HT est obligatoire.");
        }

        if (tauxTVA == null) {
            tauxTVA = BigDecimal.ZERO;
        }

        if (tauxImpot == null) {
            tauxImpot = BigDecimal.ZERO;
        }

        montantTVA = montantHT
                .multiply(tauxTVA)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP);

        montantTTC = montantHT.add(montantTVA);

        montantImpot = montantTTC
                .multiply(tauxImpot)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP);

        montantEngage = montantTTC;
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

    public UUID getExerciceId() {
        return exerciceId;
    }

    public void setExerciceId(UUID exerciceId) {
        this.exerciceId = exerciceId;
    }

    public UUID getLigneBudgetaireId() {
        return ligneBudgetaireId;
    }

    public UUID getLignebudgetaireId() {
        return ligneBudgetaireId;
    }

    public void setLigneBudgetaireId(UUID ligneBudgetaireId) {
        this.ligneBudgetaireId = ligneBudgetaireId;
    }

    public void setLignebudgetaireId(UUID ligneBudgetaireId) {
        setLigneBudgetaireId(ligneBudgetaireId);
    }

    public UUID getTiersId() {
        return tiersId;
    }

    public void setTiersId(UUID tiersId) {
        this.tiersId = tiersId;
    }

    public UUID getDocumentPreparatoireId() {
        return documentPreparatoireId;
    }

    public UUID getDocumentM5Id() {
        return documentPreparatoireId;
    }

    public void setDocumentPreparatoireId(UUID documentPreparatoireId) {
        this.documentPreparatoireId = documentPreparatoireId;
    }

    public String getNumeroEngagement() {
        return numeroEngagement;
    }

    public void setNumeroEngagement(String numeroEngagement) {
        this.numeroEngagement = numeroEngagement;
    }

    public TypeEngagement getTypeEngagement() {
        return typeEngagement;
    }

    public void setTypeEngagement(TypeEngagement typeEngagement) {
        this.typeEngagement = typeEngagement;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public BigDecimal getMontantHT() {
        return montantHT;
    }

    public void setMontantHT(BigDecimal montantHT) {
        this.montantHT = montantHT;
    }

    public BigDecimal getMontantTVA() {
        return montantTVA;
    }

    public void setMontantTVA(BigDecimal montantTVA) {
        this.montantTVA = montantTVA;
    }

    public BigDecimal getMontantTTC() {
        return montantTTC;
    }

    public void setMontantTTC(BigDecimal montantTTC) {
        this.montantTTC = montantTTC;
    }

    public BigDecimal getMontantEngage() {
        return montantEngage;
    }

    public void setMontantEngage(BigDecimal montantEngage) {
        this.montantEngage = montantEngage;
    }

    public BigDecimal getTauxTVA() {
        return tauxTVA;
    }

    public void setTauxTVA(BigDecimal tauxTVA) {
        this.tauxTVA = tauxTVA;
    }

    public BigDecimal getTauxImpot() {
        return tauxImpot;
    }

    public void setTauxImpot(BigDecimal tauxImpot) {
        this.tauxImpot = tauxImpot;
    }

    public BigDecimal getMontantImpot() {
        return montantImpot;
    }

    public void setMontantImpot(BigDecimal montantImpot) {
        this.montantImpot = montantImpot;
    }

    public EtatEngagement getEtat() {
        return etat;
    }

    public void setEtat(EtatEngagement etat) {
        this.etat = etat;
    }

    public LocalDate getDateEngagement() {
        return dateEngagement;
    }

    public void setDateEngagement(LocalDate dateEngagement) {
        this.dateEngagement = dateEngagement;
    }

    public LocalDateTime getSoumisCfAt() {
        return soumisCfAt;
    }

    public void setSubmittedCfAt(LocalDateTime soumisCfAt) {
        this.soumisCfAt = soumisCfAt;
    }

    public LocalDateTime getViseCfAt() {
        return viseCfAt;
    }

    public UUID getControllerFinancierVisaId() {
        return controllerFinancierVisaId;
    }

    public void setControllerFinancierVisaId(UUID controllerFinancierVisaId) {
        this.controllerFinancierVisaId = controllerFinancierVisaId;
    }

    public LocalDateTime getDateVisa() {
        return dateVisa;
    }

    public void setDateVisa(LocalDateTime dateVisa) {
        this.dateVisa = dateVisa;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public void setMotifRejet(String motifRejet) {
        this.motifRejet = motifRejet;
    }

    public UUID getOrdonnatorId() {
        return ordonnatorId;
    }

    public void setOrdonnatorId(UUID ordonnatorId) {
        this.ordonnatorId = ordonnatorId;
    }

    public String getPeriodicite() {
        return periodicite;
    }

    public void setPeriodicite(String periodicite) {
        this.periodicite = periodicite;
    }

    public UUID getContratServiceId() {
        return contratServiceId;
    }

    public void setContratServiceId(UUID contratServiceId) {
        this.contratServiceId = contratServiceId;
    }

    public Boolean getDepassementCreditAutorise() {
        return depassementCreditAutorise;
    }

    public void setDepassementCreditAutorise(
            Boolean depassementCreditAutorise) {
        this.depassementCreditAutorise = depassementCreditAutorise;
    }

    public Boolean getCreditsReserves() {
        return creditsReserves;
    }

    public void setCreditsReserves(Boolean creditsReserves) {
        this.creditsReserves = creditsReserves;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public List<Liquidation> getLiquidations() {
        return liquidations;
    }

    public void setLiquidations(List<Liquidation> liquidations) {
        this.liquidations = liquidations;
    }

    public void ajouterLiquidation(Liquidation liquidation) {

        if (liquidation == null) {
            throw new IllegalArgumentException(
                    "La liquidation ne peut pas être null.");
        }

        liquidations.add(liquidation);
        liquidation.setEngagement(this);
    }

    public void retirerLiquidation(Liquidation liquidation) {

        if (liquidation == null) {
            return;
        }

        liquidations.remove(liquidation);
        liquidation.setEngagement(null);
    }
}
