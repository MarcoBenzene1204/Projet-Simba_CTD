package com.marco.Simba_CTD.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "mandats", uniqueConstraints = {
        @UniqueConstraint(name = "uq_mandat_collectivite_numero", columnNames = { "collectivite_id", "numero" })
})
public class Mandat {

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

    @Column(name = "numero", nullable = false, length = 100)
    private String numeroMandat;

    // =========================================================
    // TYPE
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "type_mandat", nullable = false)
    private TypeMandat typeMandat;

    // =========================================================
    // MONTANT
    // =========================================================

    @Column(name = "montant_total", nullable = false, precision = 19, scale = 2)
    private BigDecimal montantTTCMandate = BigDecimal.ZERO;

    // =========================================================
    // WORKFLOW
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private EtatMandat etat;

    @Column(name = "date_mandatement", nullable = false)
    private LocalDate dateMandatement;

    // =========================================================
    // ACTEURS
    // =========================================================

    @Column(name = "ordonnateur_id", nullable = false)
    private UUID ordonnatorId;

    @Column(name = "controleur_id")
    private UUID controllerFinancierVisaId;

    @Column(name = "receveur_id")
    private UUID receveId;

    // =========================================================
    // VALIDATION
    // =========================================================

    @Column(name = "bordereau_numero", length = 100)
    private String numeroBordereau;

    @Column(name = "depense_validee_at")
    private LocalDateTime dateValidationDepense;

    // =========================================================
    // DATES TECHNIQUES
    // =========================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime dateModification;

    // =========================================================
    // RELATION AVEC LES LIQUIDATIONS
    // =========================================================

    @OneToMany(mappedBy = "mandat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneMandat> lignes = new ArrayList<>();

    // =========================================================
    // ENUMS
    // =========================================================

    public enum TypeMandat {

        INDIVIDUEL,

        COLLECTIF,

        REGULARISATION,

        RETENUE_GARANTIE,

        REGLEMENT_OFFICE
    }

    public enum EtatMandat {

        BROUILLON,

        SOUMIS_CF,

        VISE_CF,

        REJETE_CF,

        TRANSMIS_RECEVEUR,

        PAYE,

        ANNULE
    }

    // =========================================================
    // CONSTRUCTEURS
    // =========================================================

    public Mandat() {
    }

    public Mandat(
            UUID collectiviteId,
            UUID exerciceId,
            UUID ordonnatorId,
            TypeMandat typeMandat) {
        this.collectiviteId = collectiviteId;
        this.exerciceId = exerciceId;
        this.ordonnatorId = ordonnatorId;
        this.typeMandat = typeMandat;

        this.montantTTCMandate = BigDecimal.ZERO;

        this.etat = EtatMandat.BROUILLON;

        this.dateMandatement = LocalDate.now();

        this.dateCreation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
    }

    // =========================================================
    // GESTION DES LIGNES
    // =========================================================

    /**
     * Ajoute une liquidation au mandat.
     */
    public void ajouterLigne(LigneMandat ligne) {

        if (ligne == null) {
            throw new IllegalArgumentException(
                    "La ligne du mandat ne peut pas être null.");
        }

        if (ligne.getLiquidation() == null) {
            throw new IllegalArgumentException(
                    "Une ligne de mandat doit être liée à une liquidation.");
        }

        if (etat != EtatMandat.BROUILLON) {
            throw new IllegalStateException(
                    "Les lignes ne peuvent être modifiées "
                            + "que lorsque le mandat est en brouillon.");
        }

        lignes.add(ligne);
        ligne.setMandat(this);
    }

    /**
     * Retire une ligne du mandat.
     */
    public void retirerLigne(LigneMandat ligne) {

        if (ligne == null) {
            return;
        }

        if (etat != EtatMandat.BROUILLON) {
            throw new IllegalStateException(
                    "Les lignes ne peuvent être modifiées "
                            + "que lorsque le mandat est en brouillon.");
        }

        lignes.remove(ligne);
        ligne.setMandat(null);
    }

    // =========================================================
    // CALCUL DU MONTANT TOTAL
    // =========================================================

    /**
     * Recalcule le montant total du mandat à partir
     * des montants des lignes.
     */
    public void calculerMontantTotal() {

        BigDecimal total = BigDecimal.ZERO;

        for (LigneMandat ligne : lignes) {

            if (ligne == null) {
                continue;
            }

            if (ligne.getMontant() == null) {
                throw new IllegalStateException(
                        "Toutes les lignes du mandat doivent "
                                + "posséder un montant.");
            }

            if (ligne.getMontant().signum() <= 0) {
                throw new IllegalStateException(
                        "Le montant d'une ligne de mandat "
                                + "doit être supérieur à zéro.");
            }

            total = total.add(ligne.getMontant());
        }

        this.montantTTCMandate = total;
    }

    /**
     * Met à jour le montant total du mandat.
     */
    public void mettreAJourMontantTotal() {
        calculerMontantTotal();
    }

    // =========================================================
    // VALIDATIONS
    // =========================================================

    /**
     * Vérifie qu'un mandat possède au moins une liquidation.
     */
    public boolean possedeDesLignes() {
        return lignes != null && !lignes.isEmpty();
    }

    /**
     * Vérifie que le mandat possède un montant valide.
     */
    public boolean montantValide() {

        return montantTTCMandate != null
                && montantTTCMandate.signum() > 0;
    }

    /**
     * Vérifie qu'un mandat peut être soumis au CF.
     */
    public boolean estPretPourSoumission() {

        return etat == EtatMandat.BROUILLON
                && possedeDesLignes()
                && montantValide();
    }

    // =========================================================
    // SOUMISSION AU CONTROLEUR FINANCIER
    // =========================================================

    public void soumettreAuControleurFinancier() {

        if (!estPretPourSoumission()) {
            throw new IllegalStateException(
                    "Le mandat n'est pas prêt pour être soumis "
                            + "au Contrôleur Financier.");
        }

        calculerMontantTotal();

        if (!montantValide()) {
            throw new IllegalStateException(
                    "Le montant total du mandat doit être "
                            + "supérieur à zéro.");
        }

        this.etat = EtatMandat.SOUMIS_CF;
        this.dateModification = LocalDateTime.now();
    }

    // =========================================================
    // VISA DU CONTROLEUR FINANCIER
    // =========================================================

    public void apposerVisaCFEtCachet(UUID controleurId) {

        if (this.etat != EtatMandat.SOUMIS_CF) {
            throw new IllegalStateException(
                    "Seul un mandat soumis au Contrôleur Financier "
                            + "peut recevoir le visa.");
        }

        if (controleurId == null) {
            throw new IllegalArgumentException(
                    "L'identifiant du Contrôleur Financier "
                            + "est obligatoire.");
        }

        if (!montantValide()) {
            throw new IllegalStateException(
                    "Le mandat doit avoir un montant valide.");
        }

        this.controllerFinancierVisaId = controleurId;

        this.dateValidationDepense = LocalDateTime.now();

        this.etat = EtatMandat.VISE_CF;

        this.dateModification = LocalDateTime.now();
    }

    // =========================================================
    // REJET
    // =========================================================

    public void rejeter() {

        if (this.etat != EtatMandat.SOUMIS_CF) {
            throw new IllegalStateException(
                    "Seul un mandat soumis peut être rejeté.");
        }

        this.etat = EtatMandat.REJETE_CF;

        this.dateModification = LocalDateTime.now();
    }

    // =========================================================
    // TRANSMISSION AU RECEVEUR
    // =========================================================

    public void transmettreAuReceveur(UUID receveurId) {

        if (this.etat != EtatMandat.VISE_CF) {
            throw new IllegalStateException(
                    "Le mandat doit être visé par le Contrôleur Financier "
                            + "avant sa transmission au Receveur.");
        }

        if (receveurId == null) {
            throw new IllegalArgumentException(
                    "L'identifiant du Receveur est obligatoire.");
        }

        if (controllerFinancierVisaId == null) {
            throw new IllegalStateException(
                    "Le mandat ne possède pas de visa du "
                            + "Contrôleur Financier.");
        }

        this.receveId = receveurId;

        this.etat = EtatMandat.TRANSMIS_RECEVEUR;

        this.dateModification = LocalDateTime.now();
    }

    // =========================================================
    // PAIEMENT
    // =========================================================

    /**
     * Vérifie que le mandat peut faire l'objet d'un paiement.
     */
    public boolean estValidePourPaiement() {

        return this.etat == EtatMandat.TRANSMIS_RECEVEUR
                && this.montantTTCMandate != null
                && this.montantTTCMandate.signum() > 0
                && this.receveId != null;
    }

    /**
     * Marque le mandat comme payé.
     */
    public void marquerCommePaye() {

        if (this.etat != EtatMandat.TRANSMIS_RECEVEUR) {
            throw new IllegalStateException(
                    "Seul un mandat transmis au Receveur "
                            + "peut être marqué comme payé.");
        }

        this.etat = EtatMandat.PAYE;

        this.dateModification = LocalDateTime.now();
    }

    // =========================================================
    // ANNULATION
    // =========================================================

    public void annuler() {

        if (this.etat == EtatMandat.PAYE) {
            throw new IllegalStateException(
                    "Un mandat déjà payé ne peut pas être annulé.");
        }

        this.etat = EtatMandat.ANNULE;

        this.dateModification = LocalDateTime.now();
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

    public String getNumeroMandat() {
        return numeroMandat;
    }

    public void setNumeroMandat(String numeroMandat) {
        this.numeroMandat = numeroMandat;
    }

    public TypeMandat getTypeMandat() {
        return typeMandat;
    }

    public void setTypeMandat(TypeMandat typeMandat) {
        this.typeMandat = typeMandat;
    }

    public BigDecimal getMontantTTCMandate() {
        return montantTTCMandate;
    }

    public void setMontantTTCMandate(
            BigDecimal montantTTCMandate) {
        this.montantTTCMandate = montantTTCMandate;
    }

    public EtatMandat getEtat() {
        return etat;
    }

    public void setEtat(EtatMandat etat) {
        this.etat = etat;
    }

    public LocalDate getDateMandatement() {
        return dateMandatement;
    }

    public void setDateMandatement(
            LocalDate dateMandatement) {
        this.dateMandatement = dateMandatement;
    }

    public UUID getOrdonnatorId() {
        return ordonnatorId;
    }

    public void setOrdonnatorId(UUID ordonnatorId) {
        this.ordonnatorId = ordonnatorId;
    }

    public UUID getControllerFinancierVisaId() {
        return controllerFinancierVisaId;
    }

    public UUID getReceveId() {
        return receveId;
    }

    public String getNumeroBordereau() {
        return numeroBordereau;
    }

    public void setNumeroBordereau(String numeroBordereau) {
        this.numeroBordereau = numeroBordereau;
    }

    public LocalDateTime getDateValidationDepense() {
        return dateValidationDepense;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public List<LigneMandat> getLignes() {
        return lignes;
    }

    public void setLignes(List<LigneMandat> lignes) {
        this.lignes = lignes;
    }
}