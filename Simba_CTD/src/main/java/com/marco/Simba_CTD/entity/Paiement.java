package com.marco.Simba_CTD.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "paiements", uniqueConstraints = {
        @UniqueConstraint(name = "uk_paiements_collectivite_numero", columnNames = { "collectivite_id", "numero" })
})
public class Paiement {

    // =========================================================
    // IDENTIFIANT
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, columnDefinition = "uuid")
    private UUID id;

    // =========================================================
    // COLLECTIVITE / TENANT
    // =========================================================

    @Column(name = "collectivite_id", nullable = false, columnDefinition = "uuid")
    private UUID collectiviteId;

    // =========================================================
    // MANDAT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mandat_id", nullable = false)
    private Mandat mandat;

    // =========================================================
    // NUMERO
    // =========================================================

    @Column(name = "numero", nullable = false, length = 100)
    private String numeroPaiement;

    // =========================================================
    // MODE DE REGLEMENT
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_reglement", nullable = false)
    private ModeReglement modeReglement;

    // =========================================================
    // MONTANTS
    // =========================================================

    /**
     * Montant TTC correspondant au paiement.
     */
    @Column(name = "montant_ttc", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantTTC;

    /**
     * Total des retenues effectuées.
     */
    @Column(name = "montant_retenues", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantRetenues = BigDecimal.ZERO;

    /**
     * Montant effectivement payé.
     */
    @Column(name = "montant_net_paye", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantNetPaye;

    // =========================================================
    // DATES
    // =========================================================

    @Column(name = "date_programmee")
    private LocalDate dateProgrammee;

    @Column(name = "date_execution")
    private LocalDate dateExecution;

    // =========================================================
    // STATUT
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutPaiement statut = StatutPaiement.PROGRAMME;

    // =========================================================
    // REFERENCES DE REGLEMENT
    // =========================================================

    @Column(name = "reference_bancaire", length = 150)
    private String referenceBancaire;

    @Column(name = "reference_cheque", length = 150)
    private String referenceCheque;

    @Column(name = "cachet_vu_bonapayer", nullable = false)
    private boolean cachetVuBonAPayer;

    @Column(name = "receveur_signature_id")
    private UUID receveurSignatureId;

    @Column(name = "date_signature_receveur")
    private LocalDateTime dateSignatureReceveur;

    @Column(name = "cosignataire_signature_id")
    private UUID cosignataireSignatureId;

    @Column(name = "date_signature_cosignataire")
    private LocalDateTime dateSignatureCosignataire;

    @Column(name = "double_signature_requise", nullable = false)
    private boolean doubleSignatureRequise;

    @Column(name = "justification_differement", columnDefinition = "TEXT")
    private String justificationDifferement;

    // =========================================================
    // AUDIT
    // =========================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "updated_at")
    private LocalDateTime dateModification;

    // =========================================================
    // ENUMERATIONS
    // =========================================================

    public enum ModeReglement {

        CAISSE,

        CHEQUE,

        VIREMENT_BANCAIRE
    }

    public enum StatutPaiement {

        PROGRAMME,

        EN_COURS,

        DIFFERE,

        EXECUTE,

        ECHEC
    }

    // =========================================================
    // CONSTRUCTEURS
    // =========================================================

    public Paiement() {
    }

    public Paiement(
            UUID collectiviteId,
            Mandat mandat,
            String numeroPaiement,
            ModeReglement modeReglement,
            BigDecimal montantTTC) {
        this.collectiviteId = collectiviteId;
        this.mandat = mandat;
        this.numeroPaiement = numeroPaiement;
        this.modeReglement = modeReglement;
        this.montantTTC = montantTTC;
        this.montantRetenues = BigDecimal.ZERO;
        this.statut = StatutPaiement.PROGRAMME;
    }

    // =========================================================
    // CALCUL DU NET A PAYER
    // =========================================================

    /**
     * Calcule le montant net effectivement payé.
     *
     * NET = TTC - RETENUES
     */
    public void calculerMontantNet() {

        if (montantTTC == null) {
            throw new IllegalStateException(
                    "Le montant TTC du paiement est obligatoire.");
        }

        if (montantRetenues == null) {
            montantRetenues = BigDecimal.ZERO;
        }

        if (montantTTC.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException(
                    "Le montant TTC doit être supérieur à zéro.");
        }

        if (montantRetenues.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException(
                    "Le montant des retenues ne peut pas être négatif.");
        }

        if (montantRetenues.compareTo(montantTTC) > 0) {
            throw new IllegalStateException(
                    "Les retenues ne peuvent pas dépasser le montant TTC.");
        }

        montantNetPaye = montantTTC.subtract(montantRetenues);
    }

    // =========================================================
    // DEMARRAGE DE L'EXECUTION
    // =========================================================

    public void demarrerExecution(UUID receveurId) {

        if (statut != StatutPaiement.PROGRAMME && statut != StatutPaiement.DIFFERE
            && !(statut == StatutPaiement.EN_COURS && !cachetVuBonAPayer)) {
            throw new IllegalStateException(
                    "Seul un paiement programmé ou différé peut être mis en cours.");
        }

        if (receveurId == null) throw new IllegalArgumentException("Le receveur doit être identifié.");

        cachetVuBonAPayer = true;
        receveurSignatureId = receveurId;
        dateSignatureReceveur = LocalDateTime.now();
        justificationDifferement = null;

        statut = StatutPaiement.EN_COURS;
    }

    public void signerCosignataire(UUID cosignataireId) {
        if (statut != StatutPaiement.EN_COURS || !cachetVuBonAPayer || receveurSignatureId == null) {
            throw new IllegalStateException("Le receveur doit d'abord apposer le cachet et signer le paiement.");
        }
        if (!doubleSignatureRequise) throw new IllegalStateException("Ce paiement ne requiert pas de cosignature.");
        if (cosignataireId == null || cosignataireId.equals(receveurSignatureId)) {
            throw new IllegalArgumentException("La cosignature doit provenir d'un autre utilisateur.");
        }
        if (cosignataireSignatureId != null) throw new IllegalStateException("Le paiement est déjà cosigné.");
        cosignataireSignatureId = cosignataireId;
        dateSignatureCosignataire = LocalDateTime.now();
    }

    public void differer(String justification) {
        if (statut != StatutPaiement.PROGRAMME && statut != StatutPaiement.EN_COURS) {
            throw new IllegalStateException("Seul un paiement programmé ou en cours peut être différé.");
        }
        if (justification == null || justification.isBlank()) {
            throw new IllegalArgumentException("La justification du différé est obligatoire.");
        }
        justificationDifferement = justification.trim();
        statut = StatutPaiement.DIFFERE;
    }

    // =========================================================
    // EXECUTION
    // =========================================================

    public void executer() {

        if (statut != StatutPaiement.EN_COURS) {
            throw new IllegalStateException(
                    "Le paiement doit être en cours d'exécution.");
        }

        if (!cachetVuBonAPayer || receveurSignatureId == null || dateSignatureReceveur == null) {
            throw new IllegalStateException("Le cachet VU BON A PAYER et la signature du receveur sont obligatoires.");
        }
        if (doubleSignatureRequise && (cosignataireSignatureId == null || dateSignatureCosignataire == null
                || cosignataireSignatureId.equals(receveurSignatureId))) {
            throw new IllegalStateException("La cosignature d'un second utilisateur est obligatoire.");
        }

        if (modeReglement == null) {
            throw new IllegalStateException(
                    "Le mode de règlement est obligatoire.");
        }

        if (montantTTC == null
                || montantTTC.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "Le montant TTC doit être supérieur à zéro.");
        }

        if (montantNetPaye == null) {
            calculerMontantNet();
        }

        verifierReferenceReglement();

        statut = StatutPaiement.EXECUTE;
        dateExecution = LocalDate.now();
    }

    // =========================================================
    // ECHEC
    // =========================================================

    public void echouer() {

        if (statut == StatutPaiement.EXECUTE) {
            throw new IllegalStateException(
                    "Un paiement déjà exécuté ne peut pas être marqué en échec.");
        }

        statut = StatutPaiement.ECHEC;
    }

    // =========================================================
    // VALIDATION DES REFERENCES
    // =========================================================

    private void verifierReferenceReglement() {

        switch (modeReglement) {

            case VIREMENT_BANCAIRE:

                if (referenceBancaire == null
                        || referenceBancaire.isBlank()) {

                    throw new IllegalStateException(
                            "La référence bancaire est obligatoire "
                                    + "pour un virement bancaire.");
                }

                break;

            case CHEQUE:

                if (referenceCheque == null
                        || referenceCheque.isBlank()) {

                    throw new IllegalStateException(
                            "La référence du chèque est obligatoire "
                                    + "pour un règlement par chèque.");
                }

                break;

            case CAISSE:

                // Aucune référence externe obligatoire.
                break;
        }
    }

    // =========================================================
    // VALIDATION METIER
    // =========================================================

    public boolean estExecute() {
        return statut == StatutPaiement.EXECUTE;
    }

    public boolean estEnCours() {
        return statut == StatutPaiement.EN_COURS;
    }

    public boolean estProgramme() {
        return statut == StatutPaiement.PROGRAMME;
    }

    public boolean peutEtreExecute() {
        return statut == StatutPaiement.EN_COURS
            && cachetVuBonAPayer
            && receveurSignatureId != null
            && (!doubleSignatureRequise || cosignataireSignatureId != null);
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCollectiviteId() {
        return collectiviteId;
    }

    public void setCollectiviteId(UUID collectiviteId) {
        this.collectiviteId = collectiviteId;
    }

    @JsonIgnore
    public Mandat getMandat() {
        return mandat;
    }

    public void setMandat(Mandat mandat) {
        this.mandat = mandat;
    }

    public String getNumeroPaiement() {
        return numeroPaiement;
    }

    public void setNumeroPaiement(String numeroPaiement) {
        this.numeroPaiement = numeroPaiement;
    }

    public ModeReglement getModeReglement() {
        return modeReglement;
    }

    public void setModeReglement(ModeReglement modeReglement) {
        this.modeReglement = modeReglement;
    }

    public BigDecimal getMontantTTC() {
        return montantTTC;
    }

    public void setMontantTTC(BigDecimal montantTTC) {
        this.montantTTC = montantTTC;
    }

    public BigDecimal getMontantRetenues() {
        return montantRetenues;
    }

    public void setMontantRetenues(BigDecimal montantRetenues) {
        this.montantRetenues = montantRetenues;
    }

    public BigDecimal getMontantNetPaye() {
        return montantNetPaye;
    }

    public void setMontantNetPaye(BigDecimal montantNetPaye) {
        this.montantNetPaye = montantNetPaye;
    }

    public LocalDate getDateProgrammee() {
        return dateProgrammee;
    }

    public void setDateProgrammee(LocalDate dateProgrammee) {
        this.dateProgrammee = dateProgrammee;
    }

    public LocalDate getDateExecution() {
        return dateExecution;
    }

    public void setDateExecution(LocalDate dateExecution) {
        this.dateExecution = dateExecution;
    }

    public StatutPaiement getStatut() {
        return statut;
    }

    public void setStatut(StatutPaiement statut) {
        this.statut = statut;
    }

    public String getReferenceBancaire() {
        return referenceBancaire;
    }

    public void setReferenceBancaire(String referenceBancaire) {
        this.referenceBancaire = referenceBancaire;
    }

    public String getReferenceCheque() {
        return referenceCheque;
    }

    public void setReferenceCheque(String referenceCheque) {
        this.referenceCheque = referenceCheque;
    }

    public boolean isCachetVuBonAPayer() { return cachetVuBonAPayer; }
    public UUID getReceveurSignatureId() { return receveurSignatureId; }
    public LocalDateTime getDateSignatureReceveur() { return dateSignatureReceveur; }
    public UUID getCosignataireSignatureId() { return cosignataireSignatureId; }
    public LocalDateTime getDateSignatureCosignataire() { return dateSignatureCosignataire; }
    public boolean isDoubleSignatureRequise() { return doubleSignatureRequise; }
    public void setDoubleSignatureRequise(boolean doubleSignatureRequise) { this.doubleSignatureRequise = doubleSignatureRequise; }
    public String getJustificationDifferement() { return justificationDifferement; }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }
}