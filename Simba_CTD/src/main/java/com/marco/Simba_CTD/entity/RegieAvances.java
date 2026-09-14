package com.marco.Simba_CTD.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Modèle de Régie d'avances (FC-DEP-006)
 * 
 * Gère les avances confiées à un régisseur avec plafond autorisé par délibération.
 * Apurement trimestriel ou semestriel obligatoire avant ordonnancement.
 */
@Entity
@Table(name = "regies_avances")
public class RegieAvances {
 
    @Id
@GeneratedValue(strategy = GenerationType.UUID)
@Column(columnDefinition = "uuid")
    private UUID id;
    
    // Informations générales
    @Column(nullable = false)
    private String numeroRegie;
    
    @Column(nullable = false)
    private LocalDate dateCreation;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PeriodiciteApurement periodicite; // TRIMESTRIELLE ou SEMESTRIELLE
    
    // Régisseur
    @Column(nullable = false)
    private UUID regisseurId;
    
    // Délibération
    @Column(name = "numero_deliberation", nullable = false)
    private String numeroDélibération;
    
    @Column(name = "date_deliberation", nullable = false)
    private LocalDate dateDélibération;
    
    @Column(name = "date_approval_deliberation", nullable = false)
    private LocalDate dateApprovalDélibération;
    
    // Plafond autorisé
    @Column(nullable = false)
    private BigDecimal montantPlafond; // RG-DEP-025
    
    // Suivi montants
    @Column(nullable = false)
    private BigDecimal montantTotal; // Total versé à la régie
    
    @Column(nullable = false)
    private BigDecimal montantEngages; // Total des dépenses engagées
    
    @Column(nullable = false)
    private BigDecimal montantAutorises; // Total des dépenses autorisées
    
    @Column(nullable = false)
    private BigDecimal montantOrdonnances; // Total des dépenses ordonnancées
    
    @Column(nullable = false)
    private BigDecimal montantPaye; // Total des dépenses payées
    
    @Column(nullable = false)
    private BigDecimal soldeDisponible; // Plafond - Total engagés
    
    // Natures de dépenses autorisées
    @Column(nullable = false)
    private String naturesAutorisees; // Énumération (ex: fournitures, déplacements, etc)
    
    // État
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EtatRegie etat;
    
    // Apurements
    @OneToMany(mappedBy = "regieavances", cascade = CascadeType.ALL)
    private List<ApurementRegie> apurements = new ArrayList<>();
    
    // Dépenses
    @OneToMany(mappedBy = "regieAvances", cascade = CascadeType.ALL)
    private List<DepenseRegie> depenses = new ArrayList<>();
    
    // Reconstitution
    @Column
    private BigDecimal montantDernierReconstitution;
    
    @Column
    private LocalDate dateDernierReconstitution;
    
    // Fin d'exercice
    @Column
    private Boolean regieClotureExercice;
    
    @Column
    private LocalDate dateClotureExercice;
    
    @Column
    private BigDecimal soldeReversement; // Solde à reverser au Receveur
    
    @Column
    private LocalDateTime dateReversementEffectuee;
    
    // Trace et audit
    @Column(nullable = false)
    private LocalDateTime dateModification;
    
    // ==================== Enums ====================
    public enum EtatRegie {
        ACTIVE,
        EN_APUREMENT,
        SUSPENDUE,
        CLOTUREEXERCICE,
        FERMEE
    }
    
    public enum PeriodiciteApurement {
        TRIMESTRIELLE,
        SEMESTRIELLE
    }
    
    // ==================== Constructeurs ====================
    public RegieAvances() {}
    
    public RegieAvances(UUID regisseurId, BigDecimal montantPlafond, String naturesAutorisees) {
        this.regisseurId = regisseurId;
        this.montantPlafond = montantPlafond;
        this.naturesAutorisees = naturesAutorisees;
        this.dateCreation = LocalDate.now();
        this.dateModification = LocalDateTime.now();
        this.etat = EtatRegie.ACTIVE;
        this.montantTotal = BigDecimal.ZERO;
        this.montantEngages = BigDecimal.ZERO;
        this.montantAutorises = BigDecimal.ZERO;
        this.montantOrdonnances = BigDecimal.ZERO;
        this.montantPaye = BigDecimal.ZERO;
        this.soldeDisponible = montantPlafond;
        this.regieClotureExercice = false;
    }
    
    // ==================== Méthodes métier ====================
    
    /**
     * Ajoute une dépense à la régie et met à jour les montants
     * Conforme à RG-DEP-025 (contrôle dépassement du plafond)
     */
    public void ajouterDepense(DepenseRegie depense) {
        if (depense == null) {
            throw new IllegalArgumentException("La dépense ne peut pas être nulle");
        }

        if (depense.getMontant() == null ||
                depense.getMontant().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Le montant de la dépense doit être positif");
        }

        if (!estNatureAutorisee(depense.getNature())) {
            throw new IllegalArgumentException(
                    "Nature de dépense non autorisée par la délibération - RG-DEP-026");
        }

        BigDecimal nouveauTotal = this.montantEngages.add(depense.getMontant());

        if (nouveauTotal.compareTo(this.montantPlafond) > 0) {
            throw new IllegalStateException(
                    "Dépassement du plafond de la régie : "
                            + this.montantPlafond
                            + " FCFA. Montant disponible : "
                            + this.soldeDisponible
                            + " FCFA");
        }

        depense.setRegieAvances(this);

        this.montantEngages = nouveauTotal;

        this.soldeDisponible = this.montantPlafond.subtract(this.montantEngages);

        this.depenses.add(depense);

        this.dateModification = LocalDateTime.now();
    }
    /**
     * Vérifie si une nature de dépense est autorisée
     * Conforme à RG-DEP-026
     */
    private boolean estNatureAutorisee(String nature) {
        if (this.naturesAutorisees == null || this.naturesAutorisees.isEmpty()) {
            return false;
        }
        
        String[] natures = this.naturesAutorisees.split(";");
        for (String n : natures) {
            if (n.trim().equalsIgnoreCase(nature.trim())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Effectue un apurement de la régie
     * Conforme à RG-DEP-027 (apurement trimestriel ou semestriel obligatoire)
     */
    public void effectuerApurement(ApurementRegie apurement) {
        if (this.etat != EtatRegie.ACTIVE) {
            throw new IllegalStateException("La régie doit être active pour un apurement");
        }
        
        apurement.setRegieavances(this);
        apurement.setEtat(ApurementRegie.EtatApurement.EN_COURS);
        
        this.apurements.add(apurement);
        this.dateModification = LocalDateTime.now();
    }
    
    /**
     * Reconstitue l'avance après ordonnancement visé
     */
    public void reconstituerAvance(BigDecimal montantReconstitution) {
        if (montantReconstitution == null || montantReconstitution.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Montant de reconstitution doit être positif");
        }
        
        this.montantTotal = this.montantTotal.add(montantReconstitution);
        this.montantDernierReconstitution = montantReconstitution;
        this.dateDernierReconstitution = LocalDate.now();
        this.dateModification = LocalDateTime.now();
    }
    
    /**
     * Clôt la régie en fin d'exercice
     * Conforme à RG-DEP-028 (clôture obligatoire en fin d'exercice)
     */
    public void clotureExercice() {
        if (this.etat == EtatRegie.FERMEE) {
            throw new IllegalStateException("La régie est déjà fermée");
        }
        
        // Calcul du solde à reverser
        this.soldeReversement = this.montantTotal.subtract(this.montantPaye);
        
        this.regieClotureExercice = true;
        this.dateClotureExercice = LocalDate.now();
        this.etat = EtatRegie.CLOTUREEXERCICE;
        this.dateModification = LocalDateTime.now();
    }
    
    /**
     * Effectue le versement du solde au Receveur
     */
    public void effectuerReversement() {
        if (!Boolean.TRUE.equals(this.regieClotureExercice)) {
            throw new IllegalStateException("La régie doit être clôturée avant le versement");
        }
        
        this.dateReversementEffectuee = LocalDateTime.now();
        this.etat = EtatRegie.FERMEE;
        this.dateModification = LocalDateTime.now();
    }
    
    // ==================== Getters & Setters ====================
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getNumeroRegie() { return numeroRegie; }
    public void setNumeroRegie(String numeroRegie) { this.numeroRegie = numeroRegie; }
    
    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }
    
    public PeriodiciteApurement getPeriodicite() { return periodicite; }
    public void setPeriodicite(PeriodiciteApurement periodicite) { this.periodicite = periodicite; }
    
    public UUID getRegisseurId() { return regisseurId; }
    public void setRegisseurId(UUID regisseurId) { this.regisseurId = regisseurId; }
    
    public String getNumeroDélibération() { return numeroDélibération; }
    public void setNumeroDélibération(String numeroDélibération) { this.numeroDélibération = numeroDélibération; }
    
    public LocalDate getDateDélibération() { return dateDélibération; }
    public void setDateDélibération(LocalDate dateDélibération) { this.dateDélibération = dateDélibération; }
    
    public LocalDate getDateApprovalDélibération() { return dateApprovalDélibération; }
    public void setDateApprovalDélibération(LocalDate dateApprovalDélibération) { this.dateApprovalDélibération = dateApprovalDélibération; }
    
    public BigDecimal getMontantPlafond() { return montantPlafond; }
    public void setMontantPlafond(BigDecimal montantPlafond) { this.montantPlafond = montantPlafond; }
    
    public BigDecimal getMontantTotal() { return montantTotal; }
    public void setMontantTotal(BigDecimal montantTotal) { this.montantTotal = montantTotal; }
    
    public BigDecimal getMontantEngages() { return montantEngages; }
    public void setMontantEngages(BigDecimal montantEngages) { this.montantEngages = montantEngages; }
    
    public BigDecimal getMontantAutorises() { return montantAutorises; }
    public void setMontantAutorises(BigDecimal montantAutorises) { this.montantAutorises = montantAutorises; }
    
    public BigDecimal getMontantOrdonnances() { return montantOrdonnances; }
    public void setMontantOrdonnances(BigDecimal montantOrdonnances) { this.montantOrdonnances = montantOrdonnances; }
    
    public BigDecimal getMontantPaye() { return montantPaye; }
    public void setMontantPaye(BigDecimal montantPaye) { this.montantPaye = montantPaye; }
    
    public BigDecimal getSoldeDisponible() { return soldeDisponible; }
    public void setSoldeDisponible(BigDecimal soldeDisponible) { this.soldeDisponible = soldeDisponible; }
    
    public String getNaturesAutorisees() { return naturesAutorisees; }
    public void setNaturesAutorisees(String naturesAutorisees) { this.naturesAutorisees = naturesAutorisees; }
    
    public EtatRegie getEtat() { return etat; }
    public void setEtat(EtatRegie etat) { this.etat = etat; }
    
    public List<ApurementRegie> getApurements() { return apurements; }
    public void setApurements(List<ApurementRegie> apurements) { this.apurements = apurements; }
    
    public List<DepenseRegie> getDepenses() { return depenses; }
    public void setDepenses(List<DepenseRegie> depenses) { this.depenses = depenses; }
    
    public BigDecimal getMontantDernierReconstitution() { return montantDernierReconstitution; }
    public void setMontantDernierReconstitution(BigDecimal montantDernierReconstitution) { this.montantDernierReconstitution = montantDernierReconstitution; }
    
    public LocalDate getDateDernierReconstitution() { return dateDernierReconstitution; }
    public void setDateDernierReconstitution(LocalDate dateDernierReconstitution) { this.dateDernierReconstitution = dateDernierReconstitution; }
    
    public Boolean getRegieClotureExercice() { return regieClotureExercice; }
    public void setRegieClotureExercice(Boolean regieClotureExercice) { this.regieClotureExercice = regieClotureExercice; }
    
    public LocalDate getDateClotureExercice() { return dateClotureExercice; }
    public void setDateClotureExercice(LocalDate dateClotureExercice) { this.dateClotureExercice = dateClotureExercice; }
    
    public BigDecimal getSoldeReversement() { return soldeReversement; }
    public void setSoldeReversement(BigDecimal soldeReversement) { this.soldeReversement = soldeReversement; }
    
    public LocalDateTime getDateReversementEffectuee() { return dateReversementEffectuee; }
    public void setDateReversementEffectuee(LocalDateTime dateReversementEffectuee) { this.dateReversementEffectuee = dateReversementEffectuee; }
    
    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }
}
