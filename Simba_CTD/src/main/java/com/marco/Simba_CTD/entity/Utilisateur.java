package com.marco.Simba_CTD.entity;

import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.Enum.StatutUtilisateur;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "utilisateurs",
    indexes = {
        @Index(name = "idx_utilisateurs_collectivite", columnList = "collectivite_id"),
        @Index(name = "idx_utilisateurs_role", columnList = "role"),
        @Index(name = "idx_utilisateurs_keycloak", columnList = "identifiant_keycloak")
    }
)
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(
        name = "identifiant_keycloak",
        nullable = false,
        unique = true,
        length = 255
    )
    private String identifiantKeycloak;

    @Column(name = "nom_utilisateur", length = 100)
    private String nomUtilisateur;

    @Column(length = 100)
    private String prenom;

    @Column(length = 150)
    private String nom;

    @Column(
        columnDefinition = "citext"
    )
    private String email;

    @Column(length = 30)
    private String telephone;

    @Column(length = 100)
    private String matricule;

    /* Collectivité à laquelle appartient l'utilisateur.
     NULL uniquement pour SUPER_ADMINISTRATEUR.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "collectivite_id",
        foreignKey = @ForeignKey(name = "fk_utilisateur_collectivite")
    )
    private Collectivite collectivite;

    /**
     * Rôle métier de l'utilisateur.
     */
    @Enumerated(EnumType.STRING)
    @Column(
        name = "role",
        nullable = false,
        columnDefinition = "role_application"
    )
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private RoleApplication role;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "statut",
        nullable = false,
        columnDefinition = "statut_utilisateur"
    )
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private StatutUtilisateur statut = StatutUtilisateur.ACTIF;

    @Column(name = "dernier_acces")
    private OffsetDateTime dernierAcces;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // CONSTRUCTEURS
    public Utilisateur() {
    }

    public Utilisateur(
        String identifiantKeycloak,
        String nomUtilisateur,
        String prenom,
        String nom,
        String email,
        String telephone,
        String matricule,
        Collectivite collectivite,
        RoleApplication role,
        StatutUtilisateur statut
    ) {
        this.identifiantKeycloak = identifiantKeycloak;
        this.nomUtilisateur = nomUtilisateur;
        this.prenom = prenom;
        this.nom = nom;
        this.email = email;
        this.telephone = telephone;
        this.matricule = matricule;
        this.collectivite = collectivite;
        this.role = role;
        this.statut = statut;
    }

    // MÉTHODES JPA
    @PrePersist
    protected void onCreate() {

        OffsetDateTime now = OffsetDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = OffsetDateTime.now();
    }

    // ACCESSEURS
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getIdentifiantKeycloak() {
        return identifiantKeycloak;
    }

    public void setIdentifiantKeycloak(String identifiantKeycloak) {
        this.identifiantKeycloak = identifiantKeycloak;
    }

    public String getNomUtilisateur() {
        return nomUtilisateur;
    }

    public void setNomUtilisateur(String nomUtilisateur) {
        this.nomUtilisateur = nomUtilisateur;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public Collectivite getCollectivite() {
        return collectivite;
    }

    public void setCollectivite(Collectivite collectivite) {
        this.collectivite = collectivite;
    }

    public RoleApplication getRole() {
        return role;
    }

    public void setRole(RoleApplication role) {
        this.role = role;
    }

    public StatutUtilisateur getStatut() {
        return statut;
    }

    public void setStatut(StatutUtilisateur statut) {
        this.statut = statut;
    }

    public OffsetDateTime getDernierAcces() {
        return dernierAcces;
    }

    public void setDernierAcces(OffsetDateTime dernierAcces) {
        this.dernierAcces = dernierAcces;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
