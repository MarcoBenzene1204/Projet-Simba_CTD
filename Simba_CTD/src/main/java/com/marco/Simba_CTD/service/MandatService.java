package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.LigneMandat;
import com.marco.Simba_CTD.entity.Liquidation;
import com.marco.Simba_CTD.entity.Mandat;
import com.marco.Simba_CTD.repository.LigneMandatRepository;
import com.marco.Simba_CTD.repository.LiquidationRepository;
import com.marco.Simba_CTD.repository.MandatRepository;
import com.marco.Simba_CTD.config.TenantContext;
import com.marco.Simba_CTD.security.SecurityContextService;
import org.springframework.security.core.Authentication;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class MandatService {

        private final MandatRepository mandatRepository;
        private final LiquidationRepository liquidationRepository;
        private final LigneMandatRepository ligneMandatRepository;
        private final SecurityContextService securityContextService;

        public MandatService(
                        MandatRepository mandatRepository,
                        LiquidationRepository liquidationRepository,
                        LigneMandatRepository ligneMandatRepository,
                        SecurityContextService securityContextService) {
                this.mandatRepository = mandatRepository;
                this.liquidationRepository = liquidationRepository;
                this.ligneMandatRepository = ligneMandatRepository;
                this.securityContextService = securityContextService;
        }

        // =========================================================
        // CREATION DU MANDAT
        // =========================================================

        /**
         * Crée un mandat à partir d'une ou plusieurs liquidations
         * prêtes pour l'ordonnancement.
         */
        public Mandat creerMandat(
                        UUID collectiviteId,
                        UUID exerciceId,
                        Mandat.TypeMandat typeMandat,
                        List<UUID> liquidationIds,
                        UUID ordonnatorId) {

                // -----------------------------------------------------
                // VALIDATIONS DE BASE
                // -----------------------------------------------------

                if (collectiviteId == null) {
                        throw new IllegalArgumentException(
                                        "La collectivité est obligatoire.");
                }

                if (exerciceId == null) {
                        throw new IllegalArgumentException(
                                        "L'exercice budgétaire est obligatoire.");
                }

                if (typeMandat == null) {
                        throw new IllegalArgumentException(
                                        "Le type de mandat est obligatoire.");
                }

                if (ordonnatorId == null) {
                        throw new IllegalArgumentException(
                                        "L'ordonnateur est obligatoire.");
                }

                if (liquidationIds == null || liquidationIds.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "Au moins une liquidation est nécessaire "
                                                        + "pour créer un mandat.");
                }

                // -----------------------------------------------------
                // EVITER LES DOUBLONS DANS LA REQUETE
                // -----------------------------------------------------

                Set<UUID> idsUniques = new HashSet<>(liquidationIds);

                if (idsUniques.size() != liquidationIds.size()) {
                        throw new IllegalArgumentException(
                                        "Une même liquidation ne peut pas apparaître "
                                                        + "plusieurs fois dans un mandat.");
                }

                // -----------------------------------------------------
                // RECUPERATION TENANT-AWARE
                // -----------------------------------------------------

                List<Liquidation> liquidations = liquidationRepository
                                .findAllByIdInAndCollectiviteId(
                                                liquidationIds,
                                                collectiviteId);

                // -----------------------------------------------------
                // VERIFICATION DE L'INTEGRALITE
                // -----------------------------------------------------

                if (liquidations.size() != liquidationIds.size()) {

                        throw new IllegalArgumentException(
                                        "Une ou plusieurs liquidations sont introuvables "
                                                        + "ou n'appartiennent pas à cette collectivité.");
                }

                // -----------------------------------------------------
                // CREATION DU MANDAT
                // -----------------------------------------------------

                Mandat mandat = new Mandat();

                mandat.setCollectiviteId(collectiviteId);
                mandat.setExerciceId(exerciceId);
                mandat.setTypeMandat(typeMandat);
                mandat.setOrdonnatorId(ordonnatorId);
                mandat.setDateMandatement(LocalDate.now());

                mandat.setNumeroMandat(
                                genererNumeroMandat(collectiviteId));

                mandat.setEtat(
                                Mandat.EtatMandat.BROUILLON);

                // -----------------------------------------------------
                // AJOUT DES LIQUIDATIONS
                // -----------------------------------------------------

                for (Liquidation liquidation : liquidations) {

                        verifierLiquidationPourMandatement(
                                        liquidation,
                                        collectiviteId);

                        // -------------------------------------------------
                        // Une liquidation ne peut être mandatée
                        // qu'une seule fois.
                        // -------------------------------------------------

                        if (ligneMandatRepository
                                        .existsByLiquidationIdAndCollectiviteId(
                                                        liquidation.getId(),
                                                        collectiviteId)) {

                                throw new IllegalStateException(
                                                "La liquidation "
                                                                + liquidation.getNumero()
                                                                + " est déjà rattachée à un mandat.");
                        }

                        BigDecimal montant = liquidation.getMontantTTC();

                        if (montant == null
                                        || montant.compareTo(BigDecimal.ZERO) <= 0) {

                                throw new IllegalStateException(
                                                "La liquidation "
                                                                + liquidation.getNumero()
                                                                + " possède un montant invalide.");
                        }

                        LigneMandat ligne = new LigneMandat(
                                        mandat,
                                        liquidation,
                                        montant);

                        mandat.ajouterLigne(ligne);
                }

                // -----------------------------------------------------
                // CALCUL DU TOTAL
                // -----------------------------------------------------

                mandat.calculerMontantTotal();

                if (!mandat.montantValide()) {
                        throw new IllegalStateException(
                                        "Le montant total du mandat est invalide.");
                }

                // -----------------------------------------------------
                // PERSISTENCE
                // -----------------------------------------------------

                Mandat mandatSauvegarde = mandatRepository.save(mandat);

                /*
                 * Les UUID du mandat sont maintenant disponibles.
                 *
                 * Les LigneMandat doivent disposer de leur clé
                 * composée mandat_id + liquidation_id.
                 */
                for (LigneMandat ligne : mandatSauvegarde.getLignes()) {

                        if (ligne.getId() == null) {

                                ligne.setId(
                                                new LigneMandat.LigneMandatId(
                                                                mandatSauvegarde.getId(),
                                                                ligne.getLiquidation().getId()));
                        }
                }

                return mandatRepository.save(mandatSauvegarde);
        }

        // =========================================================
        // VALIDATION LIQUIDATION
        // =========================================================

        private void verifierLiquidationPourMandatement(
                        Liquidation liquidation,
                        UUID collectiviteId) {

                if (liquidation == null) {
                        throw new IllegalArgumentException(
                                        "La liquidation est obligatoire.");
                }

                // -----------------------------------------------------
                // TENANT
                // -----------------------------------------------------

                if (!collectiviteId.equals(
                                liquidation.getCollectiviteId())) {

                        throw new IllegalStateException(
                                        "La liquidation n'appartient pas "
                                                        + "à la collectivité courante.");
                }

                // -----------------------------------------------------
                // ETAT
                // -----------------------------------------------------

                if (liquidation.getEtat() != Liquidation.EtatLiquidation.PRETE_ORDONNANCEMENT) {

                        throw new IllegalStateException(
                                        "La liquidation "
                                                        + liquidation.getNumero()
                                                        + " n'est pas prête pour l'ordonnancement.");
                }

                // -----------------------------------------------------
                // SERVICE FAIT
                // -----------------------------------------------------

                if (!liquidation.serviceFaitEstAtteste()) {

                        throw new IllegalStateException(
                                        "Le service fait de la liquidation "
                                                        + liquidation.getNumero()
                                                        + " n'est pas attesté.");
                }

                // -----------------------------------------------------
                // CONFORMITE FISCALE
                // -----------------------------------------------------

                if (!liquidation.conformiteFiscaleEstValide()) {

                        throw new IllegalStateException(
                                        "La conformité fiscale de la liquidation "
                                                        + liquidation.getNumero()
                                                        + " n'est pas validée.");
                }
        }

        // =========================================================
        // SOUMISSION AU CONTROLEUR FINANCIER
        // =========================================================

        public Mandat soumettreAuControleurFinancier(
                        UUID mandatId,
                        UUID collectiviteId) {

                Mandat mandat = obtenirMandat(
                                mandatId,
                                collectiviteId);

                mandat.soumettreAuControleurFinancier();

                return mandatRepository.save(mandat);
        }

        // =========================================================
        // VISA DU CONTROLEUR FINANCIER
        // =========================================================

        public Mandat apposeVisaCFEtCachet(
                        UUID mandatId,
                        UUID collectiviteId,
                        UUID controleurId) {

                if (controleurId == null) {
                        throw new IllegalArgumentException(
                                        "Le contrôleur financier est obligatoire.");
                }

                Mandat mandat = obtenirMandat(
                                mandatId,
                                collectiviteId);

                mandat.apposerVisaCFEtCachet(controleurId);

                return mandatRepository.save(mandat);
        }

        // =========================================================
        // REJET
        // =========================================================

        public Mandat rejeterMandat(
                        UUID mandatId,
                        UUID collectiviteId) {

                Mandat mandat = obtenirMandat(
                                mandatId,
                                collectiviteId);

                mandat.rejeter();

                return mandatRepository.save(mandat);
        }

        // =========================================================
        // TRANSMISSION AU RECEVEUR
        // =========================================================

        public Mandat transmettreAuReceveur(
                        UUID mandatId,
                        UUID collectiviteId,
                        UUID receveurId) {

                if (receveurId == null) {
                        throw new IllegalArgumentException(
                                        "Le receveur est obligatoire.");
                }

                Mandat mandat = obtenirMandat(
                                mandatId,
                                collectiviteId);

                mandat.transmettreAuReceveur(receveurId);

                return mandatRepository.save(mandat);
        }

        // =========================================================
        // RECUPERATION
        // =========================================================

        @Transactional
        public Mandat obtenirMandat(
                        UUID mandatId,
                        UUID collectiviteId) {

                return mandatRepository
                                .findByIdAndCollectiviteId(
                                                mandatId,
                                                collectiviteId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Mandat introuvable."));
        }

        // =========================================================
        // LISTE
        // =========================================================

        @Transactional
        public List<Mandat> listerMandats(
                        UUID collectiviteId) {

                return mandatRepository
                                .findByCollectiviteId(
                                                collectiviteId);
        }

        // =========================================================
        // LISTE PAR ETAT
        // =========================================================

        @Transactional
        public List<Mandat> listerParEtat(
                        UUID collectiviteId,
                        Mandat.EtatMandat etat) {

                if (etat == null) {
                        throw new IllegalArgumentException(
                                        "L'état du mandat est obligatoire.");
                }

                return mandatRepository
                                .findByCollectiviteIdAndEtat(
                                                collectiviteId,
                                                etat);
        }

        // =========================================================
        // LISTE PAR ORDONNATEUR
        // =========================================================

        @Transactional
        public List<Mandat> listerParOrdonnator(
                        UUID collectiviteId,
                        UUID ordonnatorId) {

                if (ordonnatorId == null) {
                        throw new IllegalArgumentException(
                                        "L'ordonnateur est obligatoire.");
                }

                return mandatRepository
                                .findByCollectiviteIdAndOrdonnatorId(
                                                collectiviteId,
                                                ordonnatorId);
        }

        // HTTP-controller adapters: tenant/actor values are derived from the request context.
        public Mandat creerMandat(UUID exerciceId, Mandat.TypeMandat type, List<UUID> liquidations, Authentication auth) {
                return creerMandat(TenantContext.requireTenant(), exerciceId, type, liquidations, actorId(auth));
        }
        public List<Mandat> listerMandats(Authentication ignored) { return listerMandats(TenantContext.requireTenant()); }
        public Mandat obtenirMandat(UUID id, Authentication ignored) { return obtenirMandat(id, TenantContext.requireTenant()); }
        public Mandat soumettreAuControleurFinancier(UUID id, Authentication ignored) { return soumettreAuControleurFinancier(id, TenantContext.requireTenant()); }
        public Mandat apposeVisaCFEtCachet(UUID id, Authentication auth) { return apposeVisaCFEtCachet(id, TenantContext.requireTenant(), actorId(auth)); }
        public Mandat rejeterMandat(UUID id, Authentication ignored) { return rejeterMandat(id, TenantContext.requireTenant()); }
        public Mandat transmettreAuReceveur(UUID id, Authentication auth) { return transmettreAuReceveur(id, TenantContext.requireTenant(), actorId(auth)); }

        private UUID actorId(Authentication auth) {
                return securityContextService.getCurrentUserId();
        }

        // =========================================================
        // GENERATION NUMERO
        // =========================================================

        private String genererNumeroMandat(
                        UUID collectiviteId) {

                String numero;

                do {

                        numero = "MANDAT-"
                                        + LocalDate.now().getYear()
                                        + "-"
                                        + UUID.randomUUID()
                                                        .toString()
                                                        .substring(0, 8)
                                                        .toUpperCase();

                } while (mandatRepository
                                .existsByNumeroMandatAndCollectiviteId(
                                                numero,
                                                collectiviteId));

                return numero;
        }

        // =========================================================
        // ECRITURES COMPTABLES
        // =========================================================

        public void genererEcrituresComptables(
                        UUID mandatId,
                        UUID collectiviteId) {

                obtenirMandat(
                                mandatId,
                                collectiviteId);

                /*
                 * TODO :
                 * intégrer ici le module comptable lorsque
                 * les règles d'imputation seront finalisées.
                 */
        }
}
