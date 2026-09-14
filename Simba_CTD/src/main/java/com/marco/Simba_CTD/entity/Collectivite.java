package com.marco.Simba_CTD.entity;

import com.marco.Simba_CTD.Enum.StatutCollectivite;
import com.marco.Simba_CTD.Enum.TypeCollectivite;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "collectivites")
public class Collectivite {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "code", length = 30, nullable = false, unique = true)
    private String code;

    @Column(name = "nom", length = 255, nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "type",
        nullable = false,
        columnDefinition = "type_collectivite"
    )
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private TypeCollectivite type;

    @Column(name = "region", length = 150)
    private String region;

    @Column(name = "departement", length = 150)
    private String departement;

    @Column(name = "arrondissement", length = 150)
    private String arrondissement;

    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;

    @Column(name = "telephone", length = 30)
    private String telephone;

    @Column(name = "email", columnDefinition = "citext")
    private String email;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "statut",
        nullable = false,
        columnDefinition = "statut_collectivite"
    )
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private StatutCollectivite statut = StatutCollectivite.ACTIVE;

    @Column(name = "fuseau_horaire", length = 80, nullable = false)
    private String fuseauHoraire = "Africa/Douala";

    @Column(name = "devise", length = 10, nullable = false)
    private String devise = "XAF";

    @Column(name = "couleur_principale", length = 7, nullable = false)
    private String couleurPrincipale = "#14532D";

    @Column(name = "couleur_accent", length = 7, nullable = false)
    private String couleurAccent = "#D9A441";

    @CreationTimestamp
    @Column(
        name = "created_at",
        nullable = false,
        updatable = false,
        columnDefinition = "TIMESTAMPTZ"
    )
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(
        name = "updated_at",
        nullable = false,
        columnDefinition = "TIMESTAMPTZ"
    )
    private OffsetDateTime updatedAt;


    // CONSTRUCTEUR
    public Collectivite() {
    }


    // ACCESSEURS DE LECTURE

    public UUID getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getNom() {
        return nom;
    }

    public TypeCollectivite getType() {
        return type;
    }

    public String getRegion() {
        return region;
    }

    public String getDepartement() {
        return departement;
    }

    public String getArrondissement() {
        return arrondissement;
    }

    public String getAdresse() {
        return adresse;
    }

    public String getTelephone() {
        return telephone;
    }

    public String getEmail() {
        return email;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public StatutCollectivite getStatut() {
        return statut;
    }

    public String getFuseauHoraire() {
        return fuseauHoraire;
    }

    public String getDevise() {
        return devise;
    }

    public String getCouleurPrincipale() {
        return couleurPrincipale;
    }

    public String getCouleurAccent() {
        return couleurAccent;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }


    // ACCESSEURS DE MODIFICATION

    public void setCode(String code) {
        this.code = code;
    }

    public void setCouleurPrincipale(String couleurPrincipale) {
        this.couleurPrincipale = couleurPrincipale;
    }

    public void setCouleurAccent(String couleurAccent) {
        this.couleurAccent = couleurAccent;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setType(TypeCollectivite type) {
        this.type = type;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public void setDepartement(String departement) {
        this.departement = departement;
    }

    public void setArrondissement(String arrondissement) {
        this.arrondissement = arrondissement;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public void setStatut(StatutCollectivite statut) {
        this.statut = statut;
    }

    public void setFuseauHoraire(String fuseauHoraire) {
        this.fuseauHoraire = fuseauHoraire;
    }

    public void setDevise(String devise) {
        this.devise = devise;
    }
}
