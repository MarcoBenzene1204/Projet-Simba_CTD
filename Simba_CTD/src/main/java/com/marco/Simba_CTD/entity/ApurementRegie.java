package com.marco.Simba_CTD.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modèle d'apurement de régie
 */
@Entity
@Table(name = "apurements_regies")
public class ApurementRegie {

    @Id
@GeneratedValue(strategy = GenerationType.UUID)
@Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "regieavances_id", nullable = false)
    private RegieAvances regieavances;

    @Column(nullable = false)
    private LocalDate datePeriode;

    @Column(nullable = false)
    private BigDecimal montantSoumis;

    @Column
    private UUID controllerFinancierVisaId;

    @Column(name = "date_visa_cf")
    private LocalDateTime dateVisaCF;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EtatApurement etat;

    public enum EtatApurement {
        EN_COURS, VISEE_CF, ORDONNANCEE, PAYEE
    }

    // Getters & Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public RegieAvances getRegieavances() {
        return regieavances;
    }

    public void setRegieavances(RegieAvances regieavances) {
        this.regieavances = regieavances;
    }

    public LocalDate getDatePeriode() {
        return datePeriode;
    }

    public void setDatePeriode(LocalDate datePeriode) {
        this.datePeriode = datePeriode;
    }

    public BigDecimal getMontantSoumis() {
        return montantSoumis;
    }

    public void setMontantSoumis(BigDecimal montantSoumis) {
        this.montantSoumis = montantSoumis;
    }

    public UUID getControllerFinancierVisaId() {
        return controllerFinancierVisaId;
    }

    public void setControllerFinancierVisaId(UUID controllerFinancierVisaId) {
        this.controllerFinancierVisaId = controllerFinancierVisaId;
    }

    public LocalDateTime getDateVisaCF() {
        return dateVisaCF;
    }

    public void setDateVisaCF(LocalDateTime dateVisaCF) {
        this.dateVisaCF = dateVisaCF;
    }

    public EtatApurement getEtat() {
        return etat;
    }

    public void setEtat(EtatApurement etat) {
        this.etat = etat;
    }
}
