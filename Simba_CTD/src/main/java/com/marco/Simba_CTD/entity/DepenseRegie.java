package com.marco.Simba_CTD.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "depenses_regies")
public class DepenseRegie {

    @Id
@GeneratedValue(strategy = GenerationType.UUID)
@Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "regie_avances_id", nullable = false)
    private RegieAvances regieAvances;

    @Column(nullable = false, length = 100)
    private String nature;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false)
    private LocalDate dateDepense;

    @Column(length = 500)
    private String description;

    @Column
    private String urlJustificatifs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EtatDepense etat;

    public enum EtatDepense {
        SAISIE,
        VALIDEE,
        AUTORISEE,
        ORDONNANCEE,
        PAYEE
    }

    public DepenseRegie() {
    }

    // Getters & Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public RegieAvances getRegieAvances() {
        return regieAvances;
    }

    public void setRegieAvances(RegieAvances regieAvances) {
        this.regieAvances = regieAvances;
    }

    public String getNature() {
        return nature;
    }

    public void setNature(String nature) {
        this.nature = nature;
    }

    public BigDecimal getMontant() {
        return montant;
    }

    public void setMontant(BigDecimal montant) {
        this.montant = montant;
    }

    public LocalDate getDateDepense() {
        return dateDepense;
    }

    public void setDateDepense(LocalDate dateDepense) {
        this.dateDepense = dateDepense;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUrlJustificatifs() {
        return urlJustificatifs;
    }

    public void setUrlJustificatifs(String urlJustificatifs) {
        this.urlJustificatifs = urlJustificatifs;
    }

    public EtatDepense getEtat() {
        return etat;
    }

    public void setEtat(EtatDepense etat) {
        this.etat = etat;
    }
}