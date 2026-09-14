package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.Enum.EtatRegularisation;
import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.entity.Regularisation470XX;
import com.marco.Simba_CTD.repository.Regularisation470XXRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class Regularisation470XXService {

    private final Regularisation470XXRepository repository;
    private final CurrentUserService currentUserService;
    private final EngagementService engagementService;

    public Regularisation470XXService(
            Regularisation470XXRepository repository,
            EngagementService engagementService,
            CurrentUserService currentUserService) {

        this.repository = repository;
        this.engagementService = engagementService;
        this.currentUserService = currentUserService;
    }

    // ============================================================
    // LECTURE
    // ============================================================

    @Transactional(readOnly = true)
    public List<Regularisation470XX> findAll() {

        UUID collectiviteId = currentUserService.requireTenantId();

        return repository.findByCollectiviteId(collectiviteId);
    }

    @Transactional(readOnly = true)
    public Regularisation470XX findById(UUID id) {

        UUID collectiviteId = currentUserService.requireTenantId();

        return repository.findByIdAndCollectiviteId(
                id,
                collectiviteId).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Régularisation 470XX introuvable : " + id));
    }

    @Transactional(readOnly = true)
    public List<Regularisation470XX> findByEtat(
            EtatRegularisation etat) {

        UUID collectiviteId = currentUserService.requireTenantId();

        return repository.findByEtatAndCollectiviteId(
                etat,
                collectiviteId);
    }

    // DETECTION
    public Regularisation470XX creerDetection(
            Regularisation470XX regularisation) {

        UUID collectiviteId = currentUserService.requireTenantId();

        if (regularisation == null
                || regularisation.getReferencePaiementDetecte() == null
                || regularisation.getReferencePaiementDetecte().isBlank()
                || regularisation.getNatureDepense() == null
                || regularisation.getNatureDepense().isBlank()
                || regularisation.getMontantDetecte() == null
                || regularisation.getMontantDetecte().signum() <= 0) {
            throw new IllegalArgumentException(
                    "La référence, la nature et un montant positif sont obligatoires.");
        }

        if (repository.existsByReferencePaiementDetecteAndCollectiviteId(
                regularisation.getReferencePaiementDetecte(), collectiviteId)) {
            throw new IllegalArgumentException(
                    "Ce paiement est déjà enregistré pour cette collectivité.");
        }

        regularisation.setId(null);

        regularisation.setCollectiviteId(collectiviteId);

        if (regularisation.getNumero() == null
                || regularisation.getNumero().isBlank()) {
            regularisation.setNumero(genererNumero(collectiviteId));
        }

        regularisation.setDateDetection(
                LocalDateTime.now());

        regularisation.setDateCreation(
                LocalDateTime.now());

        regularisation.setEtat(
                EtatRegularisation.DETECTEE);

        regularisation.setComptabiliseeCompte470XX(false);
        regularisation.setOrdonnateurNotifie(false);
        regularisation.setContrepassation470XXAutoeffectuee(false);

        regularisation.setAlerteJ15Declenchee(false);
        regularisation.setAlerteJ25Declenchee(false);
        regularisation.setAlerteCritique(false);

        regularisation.setInscritRegistreAnomalies(false);
        regularisation.setNotificationTutelleEnvoyee(false);

        regularisation.setDateEcheanceRegularisation(
                LocalDate.now().plusDays(30));

        return repository.save(regularisation);
    }

        @PreAuthorize("hasAuthority('regularisation:comptabiliser')")
        public Regularisation470XX comptabiliserCompte470XX(
                        UUID id,
                        String numeroEcriture) {
                Regularisation470XX regularisation = findById(id);
                verifierEtat(regularisation, EtatRegularisation.DETECTEE);
                regularisation.enregistrerEcriture470XX(numeroEcriture);
                return repository.save(regularisation);
        }

    // NOTIFICATION ORDONNATEUR
    public Regularisation470XX notifierOrdonnateur(UUID id) {

        Regularisation470XX regularisation = findById(id);

        verifierEtat(
                regularisation,
                EtatRegularisation.DETECTEE);

        if (!regularisation.isComptabiliseeCompte470XX()) {
            throw new IllegalStateException(
                    "L'écriture provisoire 470XX doit être enregistrée avant la notification.");
        }

        regularisation.setOrdonnateurNotifie(true);

        regularisation.setDateNotificationOrdonnateur(
                LocalDateTime.now());

        regularisation.setEtat(
                EtatRegularisation.NOTIFIEE);

        return repository.save(regularisation);
    }

    @PreAuthorize("hasAuthority('regularisation:engager')")
    public Regularisation470XX creerEngagementRetrospectif(
            UUID regularisationId) {

        Regularisation470XX regularisation =
                findById(regularisationId);

        verifierEtat(
                regularisation,
                EtatRegularisation.NOTIFIEE
        );

        if (!Boolean.TRUE.equals(
                regularisation.isOrdonnateurNotifie())) {

            throw new IllegalStateException(
                    "L'ordonnateur doit être notifié avant "
                    + "la création de l'engagement rétrospectif."
            );
        }

        Engagement engagement = engagementService
                .creerEngagementRetrospectif(regularisation);

        //  Association à la régularisation.
        regularisation.setEngagementRetrospectif(
                engagement
        );

        regularisation.setDateCreationEngagement(
                LocalDateTime.now()
        );

        regularisation.setEtat(
                EtatRegularisation.ENGAGEMENT_CREE
        );

        return repository.save(
                regularisation
        );
    }

    //Reserver les credits
    @PreAuthorize("hasAuthority('regularisation:engager')")
    public Regularisation470XX reserverCreditsEngagement(
            UUID regularisationId) {

        Regularisation470XX regularisation = findById(regularisationId);

        verifierEtat(
                regularisation,
                EtatRegularisation.ENGAGEMENT_CREE);

        Engagement engagement = regularisation.getEngagementRetrospectif();

        if (engagement == null) {
            throw new IllegalStateException(
                    "Aucun engagement rétrospectif associé.");
        }

        engagementService.validerEtRéserverCrédits(
                engagement.getId());

        return repository.save(
                regularisation);
    }

    @PreAuthorize("hasAuthority('regularisation:soumettre')")
    public Regularisation470XX soumettreEngagementAuCF(
            UUID regularisationId) {

        Regularisation470XX regularisation = findById(regularisationId);

        verifierEtat(
                regularisation,
                EtatRegularisation.ENGAGEMENT_CREE);

        Engagement engagement = regularisation.getEngagementRetrospectif();

        if (engagement == null) {
            throw new IllegalStateException(
                    "Aucun engagement rétrospectif associé.");
        }

        if (!Boolean.TRUE.equals(
                engagement.getCreditsReserves())) {

            throw new IllegalStateException(
                    "Les crédits doivent être réservés.");
        }

        engagementService.soumettreAuControleurFinancier(
                engagement.getId(),
                null);

        regularisation.setEtat(
                EtatRegularisation.SOUMIS_CF);

        return repository.save(
                regularisation);
    }

    @PreAuthorize("hasAuthority('regularisation:valider')")
    public Regularisation470XX viserEngagement(
            UUID regularisationId,
            UUID controllerFinancierId) {

        Regularisation470XX regularisation = findById(regularisationId);

        verifierEtat(
                regularisation,
                EtatRegularisation.SOUMIS_CF);

        Engagement engagement = regularisation.getEngagementRetrospectif();

        if (engagement == null) {
            throw new IllegalStateException(
                    "Engagement rétrospectif absent.");
        }

        engagementService.apposerVisa(engagement.getId(), null);

        /*
         * À ce stade l'engagement est VISE,
         * mais pas encore CONFIRME.
         */
        return repository.save(
                regularisation);
    }

    // VISA CONTROLEUR FINANCIER

    public Regularisation470XX viserParCF(UUID id) {

        Regularisation470XX regularisation = findById(id);

        verifierEtat(
                regularisation,
                EtatRegularisation.SOUMIS_CF);

        UUID utilisateurId = currentUserService
                .getUtilisateur()
                .getId();

        regularisation.setControleurFinancierId(
                utilisateurId);

        regularisation.setDateVisaCF(
                LocalDateTime.now());

        regularisation.setEtat(
                EtatRegularisation.VISE_CF);

        return repository.save(regularisation);
    }

    // REJET CF
    public Regularisation470XX rejeterParCF(
            UUID id,
            String motif) {

        Regularisation470XX regularisation = findById(id);

        verifierEtat(
                regularisation,
                EtatRegularisation.SOUMIS_CF);

        if (motif == null || motif.isBlank()) {
            throw new IllegalArgumentException(
                    "Le motif du rejet est obligatoire.");
        }

        regularisation.setMotifRejetCF(motif);

        regularisation.setEtat(
                EtatRegularisation.REJET_CF);

        return repository.save(regularisation);
    }

    // LIQUIDATION
    public Regularisation470XX marquerCommeLiquidee(
            UUID id) {

        Regularisation470XX regularisation = findById(id);

        verifierEtat(
                regularisation,
                EtatRegularisation.VISE_CF);

        regularisation.setEtat(
                EtatRegularisation.LIQUIDEE);

        return repository.save(regularisation);
    }


    // Contrepassation du compte 470XX
    @PreAuthorize("hasAuthority('regularisation:contrepasser')")
    public Regularisation470XX contrepasserCompte470XX(
            UUID regularisationId,
            String numeroEcriture) {

        Regularisation470XX regularisation = findById(regularisationId);

        verifierEtat(
                regularisation,
                EtatRegularisation.MANDATEE);

        if (numeroEcriture == null ||
                numeroEcriture.isBlank()) {

            throw new IllegalArgumentException(
                    "Numéro d'écriture obligatoire.");
        }

        regularisation.setNumeroEcritureContrepassation(
                numeroEcriture);

        regularisation.effectuerContrepassation470XX(numeroEcriture);

        return repository.save(
                regularisation);
    }


    //Régularisation finale
    @PreAuthorize("hasAuthority('regularisation:regulariser')")
    public Regularisation470XX finaliserRegularisation(
            UUID regularisationId) {

        Regularisation470XX regularisation = findById(regularisationId);

        verifierEtat(
                regularisation,
                EtatRegularisation.CONTREPASSEE);

        if (!Boolean.TRUE.equals(
                regularisation
                        .isContrepassation470XXAutoeffectuee())) {

            throw new IllegalStateException(
                    "La contrepassation 470XX doit être effectuée.");
        }

        regularisation.setEtat(
                EtatRegularisation.REGULARISEE);

        return repository.save(
                regularisation);
    }


    // MANDATEMENT
    public Regularisation470XX marquerCommeMandatee(
            UUID id) {

        Regularisation470XX regularisation = findById(id);

        verifierEtat(
                regularisation,
                EtatRegularisation.LIQUIDEE);

        if (regularisation.getMandatRegularisation() == null) {
            throw new IllegalStateException(
                    "Un mandat de régularisation doit être associé.");
        }

        regularisation.setEtat(
                EtatRegularisation.MANDATEE);

        return repository.save(regularisation);
    }

    // CONTREPASSATION 470XX
    public Regularisation470XX contrepasser(
            UUID id,
            String numeroEcriture) {

        Regularisation470XX regularisation = findById(id);

        verifierEtat(
                regularisation,
                EtatRegularisation.MANDATEE);

        if (numeroEcriture == null ||
                numeroEcriture.isBlank()) {

            throw new IllegalArgumentException(
                    "Le numéro d'écriture de contrepassation "
                            + "est obligatoire.");
        }

        regularisation.setNumeroEcritureContrepassation(
                numeroEcriture);

        regularisation.setContrepassation470XXAutoeffectuee(
                true);

        regularisation.setEtat(
                EtatRegularisation.CONTREPASSEE);

        return repository.save(regularisation);
    }

    // REGULARISATION FINALE
    public Regularisation470XX regulariser(
            UUID id) {

        Regularisation470XX regularisation = findById(id);

        verifierEtat(
                regularisation,
                EtatRegularisation.CONTREPASSEE);

        regularisation.setEtat(
                EtatRegularisation.REGULARISEE);

        return repository.save(regularisation);
    }

    // ALERTES
    public void traiterAlertes() {

        UUID collectiviteId = currentUserService.requireTenantId();

        LocalDate aujourdHui = LocalDate.now();

        // J+15
        List<Regularisation470XX> alertesJ15 = repository
                .findByAlerteJ15DeclencheeFalseAndDateDetectionLessThanEqualAndCollectiviteId(
                        LocalDateTime.now().minusDays(15),
                        collectiviteId);

        for (Regularisation470XX r : alertesJ15) {

            if (r.doitDeclencherAlerteJ15()) {

                r.setAlerteJ15Declenchee(true);

                repository.save(r);
            }
        }

        // J+25
        List<Regularisation470XX> alertesJ25 = repository
                .findByAlerteJ25DeclencheeFalseAndDateDetectionLessThanEqualAndCollectiviteId(
                        LocalDateTime.now().minusDays(25),
                        collectiviteId);

        for (Regularisation470XX r : alertesJ25) {

            if (r.doitDeclencherAlerteJ25()) {

                r.setAlerteJ25Declenchee(true);
                r.setAlerteCritique(true);

                repository.save(r);
            }
        }

        // J+30 dépassé
        List<Regularisation470XX> depassements = repository
                .findByInscritRegistreAnomaliesFalseAndDateEcheanceRegularisationBeforeAndCollectiviteId(
                        aujourdHui,
                        collectiviteId);

        for (Regularisation470XX r : depassements) {

            if (r.delaiRegularisationDepasse()) {

                r.setAlerteCritique(true);
                r.setInscritRegistreAnomalies(true);

                repository.save(r);
            }
        }
    }

    // UTILITAIRE
    private void verifierEtat(
            Regularisation470XX regularisation,
            EtatRegularisation etatAttendu) {

        if (regularisation.getEtat() != etatAttendu) {

            throw new IllegalStateException(
                    "Transition impossible. État actuel : "
                            + regularisation.getEtat()
                            + ", état attendu : "
                            + etatAttendu);
        }
    }

        private String genererNumero(UUID collectiviteId) {
                String numero;
                do {
                        numero = "REG-470XX-" + LocalDate.now().getYear() + "-"
                                        + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                } while (repository.existsByNumeroAndCollectiviteId(numero, collectiviteId));
                return numero;
        }
}
