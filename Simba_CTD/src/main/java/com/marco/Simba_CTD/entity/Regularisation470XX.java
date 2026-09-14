package com.marco.Simba_CTD.entity;

import com.marco.Simba_CTD.Enum.EtatRegularisation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "regularisations_470xx", uniqueConstraints = {
        @UniqueConstraint(name = "uk_regularisation_470xx_collectivite_numero", columnNames = { "collectivite_id",
                "numero" }),
        @UniqueConstraint(name = "uk_regularisation_470xx_collectivite_reference", columnNames = { "collectivite_id",
                "reference_paiement_detecte" })
}, indexes = {
        @Index(name = "idx_regularisation_470xx_collectivite", columnList = "collectivite_id"),
        @Index(name = "idx_regularisation_470xx_etat", columnList = "etat"),
        @Index(name = "idx_regularisation_470xx_echeance", columnList = "date_echeance_regularisation"),
        @Index(name = "idx_regularisation_470xx_collectivite_etat", columnList = "collectivite_id, etat")
})
public class Regularisation470XX {

    public Regularisation470XX() {
    }

    // =========================================================
    // IDENTIFICATION
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    /**
     * Numéro interne de la régularisation.
     *
     * Exemple :
     * REG-470XX-2026-000001
     */
    @Column(name = "numero", nullable = false, length = 100)
    private String numero;

    // =========================================================
    // DETECTION DU PAIEMENT
    // =========================================================

    @Column(name = "date_detection", nullable = false)
    private LocalDateTime dateDetection;

    /**
     * Référence bancaire / référence du paiement détecté.
     */
    @Column(name = "reference_paiement_detecte", nullable = false, length = 150)
    private String referencePaiementDetecte;

    /**
     * Montant effectivement détecté lors du rapprochement bancaire.
     */
    @Column(name = "montant_detecte", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantDetecte;

    // =========================================================
    // COLLECTIVITE
    // =========================================================

    @Column(name = "collectivite_id", nullable = false)
    private UUID collectiviteId;

    // =========================================================
    // IMPUTATION BUDGETAIRE
    // =========================================================

    /**
     * Exercice budgétaire dans lequel la dépense sera régularisée.
     */
    @Column(name = "exercice_id")
    private UUID exerciceId;

    /**
     * Ligne budgétaire utilisée pour l'engagement rétroactif.
     */
    @Column(name = "ligne_budgetaire_id")
    private UUID ligneBudgetaireId;

    /**
     * Tiers bénéficiaire de la dépense.
     */
    @Column(name = "tiers_id")
    private UUID tiersId;

    /**
     * Montant finalement imputé au budget.
     */
    @Column(name = "montant_imputation", precision = 19, scale = 2)
    private BigDecimal montantImputation;

    /**
     * Nature de la dépense.
     */
    @Column(name = "nature_depense", nullable = false, length = 255)
    private String natureDepense;

    /**
     * Description détaillée de la dépense.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // =========================================================
    // DOCUMENT M5
    // =========================================================

    /**
     * Référence éventuelle à un document préparatoire.
     *
     * IMPORTANT :
     * ce champ est facultatif dans FC-DEP-005.
     *
     * Une régularisation 470XX peut exister sans M5.
     */
    @Column(name = "document_m5_id")
    private UUID documentM5Id;

    // =========================================================
    // ENGAGEMENT RETROSPECTIF
    // =========================================================

    @OneToOne
    @JoinColumn(name = "engagement_id", foreignKey = @ForeignKey(name = "fk_regularisation_470xx_engagement"))
    private Engagement engagementRetrospectif;

    /**
     * Date de création de l'engagement rétroactif.
     */
    @Column(name = "date_creation_engagement")
    private LocalDateTime dateCreationEngagement;

    // =========================================================
    // ACTEURS
    // =========================================================

    /**
     * Ordonnateur responsable de la régularisation.
     */
    @Column(name = "ordonnateur_id")
    private UUID ordonnateurId;

    /**
     * Contrôleur financier ayant effectué le visa.
     */
    @Column(name = "controleur_financier_id")
    private UUID controleurFinancierId;

    /**
     * Receveur ayant pris en charge la dépense.
     */
    @Column(name = "receveur_id")
    private UUID receveurId;

    // =========================================================
    // NOTIFICATION ORDONNATEUR
    // =========================================================

    @Column(name = "ordonnateur_notifie", nullable = false)
    private boolean ordonnateurNotifie;

    @Column(name = "date_notification_ordonnateur")
    private LocalDateTime dateNotificationOrdonnateur;

    // =========================================================
    // CONTROLE FINANCIER
    // =========================================================

    @Column(name = "date_visa_cf")
    private LocalDateTime dateVisaCF;

    @Column(name = "motif_rejet_cf", columnDefinition = "TEXT")
    private String motifRejetCF;

    // =========================================================
    // LIQUIDATION
    // =========================================================

    @OneToOne
    @JoinColumn(name = "liquidation_regularisation_id", foreignKey = @ForeignKey(name = "fk_regularisation_470xx_liquidation"))
    private Liquidation liquidationRegularisation;

    // =========================================================
    // MANDAT
    // =========================================================

    @OneToOne
    @JoinColumn(name = "mandat_regularisation_id", foreignKey = @ForeignKey(name = "fk_regularisation_470xx_mandat"))
    private Mandat mandatRegularisation;

    // =========================================================
    // COMPTE 470XX
    // =========================================================

    /**
     * Indique que l'écriture provisoire a bien été enregistrée
     * sur le compte 470XX.
     */
    @Column(name = "comptabilisee_compte_470xx", nullable = false)
    private boolean comptabiliseeCompte470XX;

    /**
     * Numéro de l'écriture comptable provisoire.
     */
    @Column(name = "numero_ecriture_comptable_470xx", length = 150)
    private String numeroEcritureComptable470XX;

    /**
     * Indique que la contrepassation a été effectuée.
     */
    @Column(name = "contrepassation_470xx_auto_effectuee", nullable = false)
    private boolean contrepassation470XXAutoeffectuee;

    /**
     * Numéro de l'écriture de contrepassation.
     */
    @Column(name = "numero_ecriture_contrepassation", length = 150)
    private String numeroEcritureContrepassation;

    // =========================================================
    // DELAI DE REGULARISATION
    // =========================================================

    /**
     * Date limite = date de détection + 30 jours.
     */
    @Column(name = "date_echeance_regularisation", nullable = false)
    private LocalDate dateEcheanceRegularisation;

    @Column(name = "alerte_j15_declenchee", nullable = false)
    private boolean alerteJ15Declenchee;

    @Column(name = "alerte_j25_declenchee", nullable = false)
    private boolean alerteJ25Declenchee;

    @Column(name = "alerte_critique", nullable = false)
    private boolean alerteCritique;

    // =========================================================
    // ANOMALIES / TUTELLE
    // =========================================================

    @Column(name = "inscrit_registre_anomalies", nullable = false)
    private boolean inscritRegistreAnomalies;

    @Column(name = "notification_tutelle_envoyee", nullable = false)
    private boolean notificationTutelleEnvoyee;

    // =========================================================
    // ETAT
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "etat", nullable = false, length = 50)
    private EtatRegularisation etat;

    // =========================================================
    // AUDIT
    // =========================================================

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // =========================================================
    // ACCESSEURS EXPLICITES
    // =========================================================

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public LocalDateTime getDateDetection() { return dateDetection; }
    public void setDateDetection(LocalDateTime dateDetection) { this.dateDetection = dateDetection; }
    public String getReferencePaiementDetecte() { return referencePaiementDetecte; }
    public void setReferencePaiementDetecte(String referencePaiementDetecte) { this.referencePaiementDetecte = referencePaiementDetecte; }
    public BigDecimal getMontantDetecte() { return montantDetecte; }
    public void setMontantDetecte(BigDecimal montantDetecte) { this.montantDetecte = montantDetecte; }
    public UUID getCollectiviteId() { return collectiviteId; }
    public void setCollectiviteId(UUID collectiviteId) { this.collectiviteId = collectiviteId; }
    public UUID getExerciceId() { return exerciceId; }
    public void setExerciceId(UUID exerciceId) { this.exerciceId = exerciceId; }
    public UUID getLigneBudgetaireId() { return ligneBudgetaireId; }
    public void setLigneBudgetaireId(UUID ligneBudgetaireId) { this.ligneBudgetaireId = ligneBudgetaireId; }
    public UUID getTiersId() { return tiersId; }
    public void setTiersId(UUID tiersId) { this.tiersId = tiersId; }
    public BigDecimal getMontantImputation() { return montantImputation; }
    public void setMontantImputation(BigDecimal montantImputation) { this.montantImputation = montantImputation; }
    public String getNatureDepense() { return natureDepense; }
    public void setNatureDepense(String natureDepense) { this.natureDepense = natureDepense; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getDocumentM5Id() { return documentM5Id; }
    public void setDocumentM5Id(UUID documentM5Id) { this.documentM5Id = documentM5Id; }
    public Engagement getEngagementRetrospectif() { return engagementRetrospectif; }
    public void setEngagementRetrospectif(Engagement engagementRetrospectif) { this.engagementRetrospectif = engagementRetrospectif; }
    public LocalDateTime getDateCreationEngagement() { return dateCreationEngagement; }
    public void setDateCreationEngagement(LocalDateTime dateCreationEngagement) { this.dateCreationEngagement = dateCreationEngagement; }
    public UUID getOrdonnateurId() { return ordonnateurId; }
    public void setOrdonnateurId(UUID ordonnateurId) { this.ordonnateurId = ordonnateurId; }
    public UUID getControleurFinancierId() { return controleurFinancierId; }
    public void setControleurFinancierId(UUID controleurFinancierId) { this.controleurFinancierId = controleurFinancierId; }
    public UUID getReceveurId() { return receveurId; }
    public void setReceveurId(UUID receveurId) { this.receveurId = receveurId; }
    public boolean isOrdonnateurNotifie() { return ordonnateurNotifie; }
    public void setOrdonnateurNotifie(boolean ordonnateurNotifie) { this.ordonnateurNotifie = ordonnateurNotifie; }
    public LocalDateTime getDateNotificationOrdonnateur() { return dateNotificationOrdonnateur; }
    public void setDateNotificationOrdonnateur(LocalDateTime dateNotificationOrdonnateur) { this.dateNotificationOrdonnateur = dateNotificationOrdonnateur; }
    public LocalDateTime getDateVisaCF() { return dateVisaCF; }
    public void setDateVisaCF(LocalDateTime dateVisaCF) { this.dateVisaCF = dateVisaCF; }
    public String getMotifRejetCF() { return motifRejetCF; }
    public void setMotifRejetCF(String motifRejetCF) { this.motifRejetCF = motifRejetCF; }
    public Liquidation getLiquidationRegularisation() { return liquidationRegularisation; }
    public void setLiquidationRegularisation(Liquidation liquidationRegularisation) { this.liquidationRegularisation = liquidationRegularisation; }
    public Mandat getMandatRegularisation() { return mandatRegularisation; }
    public void setMandatRegularisation(Mandat mandatRegularisation) { this.mandatRegularisation = mandatRegularisation; }
    public boolean isComptabiliseeCompte470XX() { return comptabiliseeCompte470XX; }
    public void setComptabiliseeCompte470XX(boolean comptabiliseeCompte470XX) { this.comptabiliseeCompte470XX = comptabiliseeCompte470XX; }
    public String getNumeroEcritureComptable470XX() { return numeroEcritureComptable470XX; }
    public void setNumeroEcritureComptable470XX(String numeroEcritureComptable470XX) { this.numeroEcritureComptable470XX = numeroEcritureComptable470XX; }
    public boolean isContrepassation470XXAutoeffectuee() { return contrepassation470XXAutoeffectuee; }
    public void setContrepassation470XXAutoeffectuee(boolean contrepassation470XXAutoeffectuee) { this.contrepassation470XXAutoeffectuee = contrepassation470XXAutoeffectuee; }
    public String getNumeroEcritureContrepassation() { return numeroEcritureContrepassation; }
    public void setNumeroEcritureContrepassation(String numeroEcritureContrepassation) { this.numeroEcritureContrepassation = numeroEcritureContrepassation; }
    public LocalDate getDateEcheanceRegularisation() { return dateEcheanceRegularisation; }
    public void setDateEcheanceRegularisation(LocalDate dateEcheanceRegularisation) { this.dateEcheanceRegularisation = dateEcheanceRegularisation; }
    public boolean isAlerteJ15Declenchee() { return alerteJ15Declenchee; }
    public void setAlerteJ15Declenchee(boolean alerteJ15Declenchee) { this.alerteJ15Declenchee = alerteJ15Declenchee; }
    public boolean isAlerteJ25Declenchee() { return alerteJ25Declenchee; }
    public void setAlerteJ25Declenchee(boolean alerteJ25Declenchee) { this.alerteJ25Declenchee = alerteJ25Declenchee; }
    public boolean isAlerteCritique() { return alerteCritique; }
    public void setAlerteCritique(boolean alerteCritique) { this.alerteCritique = alerteCritique; }
    public boolean isInscritRegistreAnomalies() { return inscritRegistreAnomalies; }
    public void setInscritRegistreAnomalies(boolean inscritRegistreAnomalies) { this.inscritRegistreAnomalies = inscritRegistreAnomalies; }
    public boolean isNotificationTutelleEnvoyee() { return notificationTutelleEnvoyee; }
    public void setNotificationTutelleEnvoyee(boolean notificationTutelleEnvoyee) { this.notificationTutelleEnvoyee = notificationTutelleEnvoyee; }
    public EtatRegularisation getEtat() { return etat; }
    public void setEtat(EtatRegularisation etat) { this.etat = etat; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }

    // =========================================================
    // CONSTRUCTEUR METIER
    // =========================================================

    public Regularisation470XX(
            String numero,
            String referencePaiementDetecte,
            BigDecimal montantDetecte,
            String natureDepense) {

        this.numero = numero;
        this.referencePaiementDetecte = referencePaiementDetecte;
        this.montantDetecte = montantDetecte;
        this.natureDepense = natureDepense;

        LocalDateTime maintenant = LocalDateTime.now();

        this.dateDetection = maintenant;
        this.dateCreation = maintenant;
        this.dateModification = maintenant;

        this.dateEcheanceRegularisation = maintenant.toLocalDate().plusDays(30);

        this.etat = EtatRegularisation.DETECTEE;

        this.comptabiliseeCompte470XX = false;
        this.ordonnateurNotifie = false;

        this.contrepassation470XXAutoeffectuee = false;

        this.alerteJ15Declenchee = false;
        this.alerteJ25Declenchee = false;
        this.alerteCritique = false;

        this.inscritRegistreAnomalies = false;
        this.notificationTutelleEnvoyee = false;
    }

    // =========================================================
    // CYCLE DE VIE
    // =========================================================

    public boolean estDetectee() {
        return this.etat == EtatRegularisation.DETECTEE;
    }

    public boolean estNotifiee() {
        return this.etat == EtatRegularisation.NOTIFIEE;
    }

    public boolean estViseeCF() {
        return this.etat == EtatRegularisation.VISE_CF;
    }

    public boolean estLiquidee() {
        return this.etat == EtatRegularisation.LIQUIDEE;
    }

    public boolean estMandatee() {
        return this.etat == EtatRegularisation.MANDATEE;
    }

    public boolean estRegularisee() {
        return this.etat == EtatRegularisation.REGULARISEE;
    }

    // =========================================================
    // DELAIS
    // =========================================================

    public boolean doitDeclencherAlerteJ15() {

        LocalDate dateJ15 = dateDetection.toLocalDate().plusDays(15);

        return !alerteJ15Declenchee
                && !estRegularisee()
                && !LocalDate.now().isBefore(dateJ15);
    }

    public boolean doitDeclencherAlerteJ25() {

        LocalDate dateJ25 = dateDetection.toLocalDate().plusDays(25);

        return !alerteJ25Declenchee
                && !estRegularisee()
                && !LocalDate.now().isBefore(dateJ25);
    }

    public boolean delaiRegularisationDepasse() {

        return !estRegularisee()
                && !LocalDate.now()
                        .isBefore(dateEcheanceRegularisation);
    }

    // =========================================================
    // COMPTE 470XX
    // =========================================================

    public void enregistrerEcriture470XX(String numeroEcriture) {

        if (numeroEcriture == null
                || numeroEcriture.isBlank()) {

            throw new IllegalArgumentException(
                    "Le numéro de l'écriture 470XX est obligatoire.");
        }

        this.comptabiliseeCompte470XX = true;
        this.numeroEcritureComptable470XX = numeroEcriture;
        this.dateModification = LocalDateTime.now();
    }

    public void effectuerContrepassation470XX(
            String numeroEcritureContrepassation) {

        if (this.etat != EtatRegularisation.MANDATEE) {

            throw new IllegalStateException(
                    "La contrepassation 470XX ne peut être effectuée "
                            + "qu'après le mandatement.");
        }

        if (!this.comptabiliseeCompte470XX) {

            throw new IllegalStateException(
                    "Aucune écriture provisoire 470XX "
                            + "n'a été enregistrée.");
        }

        if (numeroEcritureContrepassation == null
                || numeroEcritureContrepassation.isBlank()) {

            throw new IllegalArgumentException(
                    "Le numéro de contrepassation est obligatoire.");
        }

        this.contrepassation470XXAutoeffectuee = true;
        this.numeroEcritureContrepassation = numeroEcritureContrepassation;

        this.etat = EtatRegularisation.CONTREPASSEE;

        this.dateModification = LocalDateTime.now();
    }

    // =========================================================
    // PREPARATION
    // =========================================================

    public void definirImputationBudgetaire(
            UUID exerciceId,
            UUID ligneBudgetaireId) {

        if (exerciceId == null) {
            throw new IllegalArgumentException(
                    "L'exercice budgétaire est obligatoire.");
        }

        if (ligneBudgetaireId == null) {
            throw new IllegalArgumentException(
                    "La ligne budgétaire est obligatoire.");
        }

        this.exerciceId = exerciceId;
        this.ligneBudgetaireId = ligneBudgetaireId;
        this.montantImputation = this.montantDetecte;

        this.dateModification = LocalDateTime.now();
    }
}