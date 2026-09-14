package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.entity.Utilisateur;
import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.Enum.StatutUtilisateur;
import com.marco.Simba_CTD.repository.CollectiviteRepository;
import com.marco.Simba_CTD.repository.UtilisateurRepository;
import com.marco.Simba_CTD.request.UtilisateurRequest;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/*
  Service chargé de la gestion du profil métier d'un utilisateur.
  IMPORTANT :
 
  Keycloak est maintenant la source de vérité pour :
  utilisateur
  ↓
  Realm Roles
  ↓
  Composite Roles
  ↓
  Permissions
 
  PostgreSQL reste responsable de :
  utilisateur
  ↓
  collectivité
  ↓
  données métier
 */
@Service
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final CollectiviteRepository collectiviteRepository;
    
    public UtilisateurService(
            UtilisateurRepository utilisateurRepository,
            CollectiviteRepository collectiviteRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.collectiviteRepository = collectiviteRepository;
    }

    /*
      Récupère le profil Simba CTD correspondant au JWT Keycloak.
     
      Si le profil existe :
      → on le met à jour
     
      Si le profil n'existe pas mais qu'un profil porte encore
      le même username :
      → on rattache le profil à son "sub" Keycloak.
     
      Le profil n'est donc PAS créé arbitrairement :
      il doit avoir été préalablement provisionné dans Simba CTD.
     */
    @Transactional
    public Utilisateur getOrCreateUser(Jwt jwt) {

        String sub = jwt.getSubject();

        if (sub == null || sub.isBlank()) {
            throw new IllegalStateException(
                    "Le JWT Keycloak ne contient pas de 'sub'.");
        }

          //Première recherche : identifiant_keycloak = sub
        Utilisateur utilisateur = utilisateurRepository
            .findByIdentifiantKeycloak(sub)
            .orElseGet(() -> retrouverParNomKeycloakEtNormaliser(jwt, sub));

        /*
          Synchronisation des informations provenant
          de Keycloak.
         
          Exemple :
          username
          prénom
          nom
          email
         */
        mettreAJourDepuisKeycloak(utilisateur, jwt);

        /*
          Un utilisateur désactivé dans Simba CTD
          ne doit pas pouvoir utiliser l'application.
         */
        if (utilisateur.getStatut() != StatutUtilisateur.ACTIF) {

            throw new IllegalStateException(
                "Le compte Simba CTD est "
                    + utilisateur.getStatut().name().toLowerCase()
                    + ". Contactez votre administrateur.");
        }

         // Trace du dernier accès.
        utilisateur.setDernierAcces(
                OffsetDateTime.now());

        return utilisateurRepository.save(
                utilisateur);
    }

    /*
      Recherche un utilisateur par son username Keycloak
      lorsqu'il n'a pas encore été associé à son "sub".
     
      Cela permet notamment de rattacher un profil métier
      précréé dans PostgreSQL à son compte Keycloak lors
      de sa première connexion.
     */
    private Utilisateur retrouverParNomKeycloakEtNormaliser(
            Jwt jwt,
            String sub) {

        String username = jwt.getClaimAsString(
            "preferred_username");

        if (username == null || username.isBlank()) {
            throw new IllegalStateException("Aucun profil Simba CTD n'est associé "+"à ce compte Keycloak.");
        }

        Utilisateur utilisateur = utilisateurRepository
            .findByNomUtilisateur(username)
                .orElseThrow(() -> new IllegalStateException(
                "Le profil Simba CTD est introuvable ou n'est pas encore provisionné."
                ));

        //Protection contre le rattachement accidentel de deux profils au même compte Keycloak.
        if (!sub.equals(
                utilisateur.getIdentifiantKeycloak())
                && utilisateurRepository
                        .existsByIdentifiantKeycloak(sub)) {

            throw new IllegalStateException(
                    "Le compte Keycloak est déjà associé " + "à un autre profil Simba CTD.");
        }

        // On mémorise définitivement le "sub".
        utilisateur.setIdentifiantKeycloak(sub);

        return utilisateur;
    }

    /*
      Met à jour les informations personnelles provenant
      du JWT Keycloak.
     
      Keycloak reste la source de vérité pour ces informations.
     */
    private void mettreAJourDepuisKeycloak(
            Utilisateur utilisateur,
            Jwt jwt) {

        utilisateur.setNomUtilisateur(jwt.getClaimAsString("preferred_username"));

        utilisateur.setPrenom(jwt.getClaimAsString("given_name"));

        utilisateur.setNom(jwt.getClaimAsString("family_name"));

        utilisateur.setEmail(jwt.getClaimAsString("email"));
    }

    /*
      Provisionnement explicite depuis Keycloak.
     
      Cette méthode est conservée car elle peut être appelée
      par /api/auth/me ou un endpoint d'initialisation.
     */
    public Utilisateur provisionnerDepuisKeycloak(
            Jwt jwt) {

        return getOrCreateUser(jwt);
    }

    /*
      Récupère un utilisateur et sa collectivité.
     
      Utilisé notamment par le TenantFilter.
     */
    @Transactional(readOnly = true)
    public Utilisateur getUtilisateurAvecCollectivite(String keycloakId) {

        return utilisateurRepository
            .findByKeycloakIdWithCollectivite(keycloakId)
            .orElseThrow(() -> new IllegalStateException(
                "Aucun utilisateur Simba CTD "
                    + "associé au compte Keycloak : "
                    + keycloakId
                ));
    }

      //Récupère la collectivité d'un utilisateur.
     
    @Deprecated
    public Collectivite getCollectivite(
            Utilisateur utilisateur) {

        /*
          Compatibilité avec le modèle PostgreSQL actuel.
         
          Cette logique sera supprimée lorsque nous aurons
          définitivement retiré Utilisateur.role.
         */
        if (utilisateur.getRole() == RoleApplication.SUPER_ADMINISTRATEUR) {

            return null;
        }

        Collectivite collectivite = utilisateur.getCollectivite();

        if (collectivite == null) {

            throw new IllegalStateException(
                    "L'utilisateur "
                            + utilisateur.getNomUtilisateur()
                            + " n'est associé à aucune collectivité.");
        }

        return collectivite;
    }

    /**
      ANCIENNES MÉTHODES DE COMPATIBILITÉ
     
      Elles ne doivent plus servir à contrôler les permissions.
     
      Nous les conservons temporairement pour éviter de casser
      les classes existantes du projet.
     */

     // @deprecated Les rôles doivent être lus depuis Keycloak.
    @Deprecated
    public boolean estSuperAdministrateur(
            Utilisateur utilisateur) {

        return utilisateur.getRole() == RoleApplication.SUPER_ADMINISTRATEUR;
    }

     // @deprecated Les rôles doivent être lus depuis Keycloak.
    @Deprecated
    public boolean estAdministrateur(Utilisateur utilisateur) {
        return utilisateur.getRole() == RoleApplication.ADMINISTRATEUR;
    }

     // @deprecated Les rôles doivent être lus depuis Keycloak.
    @Deprecated
    public RoleApplication getRole(Utilisateur utilisateur) {
        return utilisateur.getRole();
    }

    /*
      Création manuelle d'un utilisateur métier.
     
      Cette méthode est conservée temporairement.
     
      À terme, le rôle transmis ici devra être remplacé
      par une gestion des rôles directement dans Keycloak.
     */
    public Utilisateur createUtilisateur(UtilisateurRequest request) {
        if (request.role() == null) {
            throw new IllegalArgumentException(
                "Un utilisateur doit obligatoirement "
                + "avoir un rôle."
            );
        }

        if (utilisateurRepository
                .findByIdentifiantKeycloak(
                        request.identifiantKeycloak())
                .isPresent()) {

            throw new IllegalStateException(
                    "Cet utilisateur Keycloak existe déjà.");
        }

        Collectivite collectivite = collectiviteRepository
                .findById(request.collectiviteId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Collectivité introuvable."));

        Utilisateur utilisateur = new Utilisateur(
                request.identifiantKeycloak().trim(),
                request.nomUtilisateur(),
                request.prenom(),
                request.nom(),
                request.email(),
                null,
                null,
                collectivite,
                request.role(),
                StatutUtilisateur.ACTIF);

        return utilisateurRepository.save(
                utilisateur);
    }
}