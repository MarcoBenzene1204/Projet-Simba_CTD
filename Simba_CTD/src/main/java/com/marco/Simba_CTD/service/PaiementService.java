package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Mandat;
import com.marco.Simba_CTD.entity.Paiement;
import com.marco.Simba_CTD.repository.MandatRepository;
import com.marco.Simba_CTD.repository.PaiementRepository;
import com.marco.Simba_CTD.config.TenantContext;
import org.springframework.security.core.Authentication;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PaiementService {

        private final PaiementRepository paiementRepository;
        private final MandatRepository mandatRepository;

        public PaiementService(
                        PaiementRepository paiementRepository,
                        MandatRepository mandatRepository) {
                this.paiementRepository = paiementRepository;
                this.mandatRepository = mandatRepository;
        }

        // =========================================================
        // CREATION DU PAIEMENT
        // =========================================================

        /**
         * Crée un paiement à partir d'un mandat transmis au receveur.
         *
         * Le montant du paiement est déterminé côté serveur
         * à partir du montant total du mandat.
         */
        public Paiement creerPaiement(
                        UUID mandatId,
                        UUID collectiviteId,
                        Paiement.ModeReglement modeReglement,
                        LocalDate dateProgrammee) {

                // -----------------------------------------------------
                // VALIDATIONS
                // -----------------------------------------------------

                if (mandatId == null) {
                        throw new IllegalArgumentException(
                                        "Le mandat est obligatoire.");
                }

                if (collectiviteId == null) {
                        throw new IllegalArgumentException(
                                        "La collectivité est obligatoire.");
                }

                if (modeReglement == null) {
                        throw new IllegalArgumentException(
                                        "Le mode de règlement est obligatoire.");
                }

                // -----------------------------------------------------
                // RECUPERATION TENANT-AWARE
                // -----------------------------------------------------

                Mandat mandat = mandatRepository
                                .findByIdAndCollectiviteId(
                                                mandatId,
                                                collectiviteId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Mandat introuvable."));

                // -----------------------------------------------------
                // LE MANDAT DOIT ETRE TRANSMIS AU RECEVEUR
                // -----------------------------------------------------

                if (mandat.getEtat() != Mandat.EtatMandat.TRANSMIS_RECEVEUR) {

                        throw new IllegalStateException(
                                        "Le paiement ne peut être créé que pour "
                                                        + "un mandat transmis au receveur.");
                }

                // -----------------------------------------------------
                // UN SEUL PAIEMENT PAR MANDAT
                // -----------------------------------------------------

                if (paiementRepository
                                .existsByMandatIdAndCollectiviteId(
                                                mandatId,
                                                collectiviteId)) {

                        throw new IllegalStateException(
                                        "Un paiement existe déjà pour ce mandat.");
                }

                // -----------------------------------------------------
                // MONTANT SERVEUR
                // -----------------------------------------------------

                BigDecimal montantTTC = mandat.getMontantTTCMandate();

                if (montantTTC == null
                                || montantTTC.compareTo(BigDecimal.ZERO) <= 0) {

                        throw new IllegalStateException(
                                        "Le montant du mandat est invalide.");
                }

                // -----------------------------------------------------
                // CREATION
                // -----------------------------------------------------

                Paiement paiement = new Paiement();

                paiement.setCollectiviteId(
                                collectiviteId);

                paiement.setMandat(mandat);

                paiement.setNumeroPaiement(
                                genererNumeroPaiement(
                                                collectiviteId));

                paiement.setModeReglement(
                                modeReglement);

                paiement.setMontantTTC(
                                montantTTC);

                paiement.setMontantRetenues(
                                BigDecimal.ZERO);

                paiement.setDateProgrammee(
                                dateProgrammee);

                paiement.setStatut(
                                Paiement.StatutPaiement.PROGRAMME);

                // -----------------------------------------------------
                // CALCUL NET
                // -----------------------------------------------------

                paiement.calculerMontantNet();

                return paiementRepository.save(
                                paiement);
        }

        // =========================================================
        // DEMARRAGE DE L'EXECUTION
        // =========================================================

        public Paiement demarrerExecution(
                        UUID paiementId,
                        UUID collectiviteId) {

                Paiement paiement = obtenirPaiement(
                                paiementId,
                                collectiviteId);

                paiement.demarrerExecution();

                return paiementRepository.save(
                                paiement);
        }

        // =========================================================
        // EXECUTION DU PAIEMENT
        // =========================================================

        public Paiement executerPaiement(
                        UUID paiementId,
                        UUID collectiviteId) {

                Paiement paiement = obtenirPaiement(
                                paiementId,
                                collectiviteId);

                // -----------------------------------------------------
                // EXECUTION DU PAIEMENT
                // -----------------------------------------------------

                paiement.executer();

                // -----------------------------------------------------
                // MISE A JOUR DU MANDAT
                // -----------------------------------------------------

                Mandat mandat = paiement.getMandat();

                if (mandat == null) {
                        throw new IllegalStateException(
                                        "Le paiement n'est associé à aucun mandat.");
                }

                if (!collectiviteId.equals(
                                mandat.getCollectiviteId())) {

                        throw new IllegalStateException(
                                        "Le mandat n'appartient pas "
                                                        + "à la collectivité courante.");
                }

                mandat.marquerCommePaye();

                // -----------------------------------------------------
                // PERSISTENCE
                // -----------------------------------------------------

                mandatRepository.save(mandat);

                return paiementRepository.save(
                                paiement);
        }

        // =========================================================
        // ECHEC DU PAIEMENT
        // =========================================================

        public Paiement echouerPaiement(
                        UUID paiementId,
                        UUID collectiviteId) {

                Paiement paiement = obtenirPaiement(
                                paiementId,
                                collectiviteId);

                paiement.echouer();

                return paiementRepository.save(
                                paiement);
        }

        // =========================================================
        // RECUPERER UN PAIEMENT
        // =========================================================

        @Transactional
        public Paiement obtenirPaiement(
                        UUID paiementId,
                        UUID collectiviteId) {

                return paiementRepository
                                .findByIdAndCollectiviteId(
                                                paiementId,
                                                collectiviteId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Paiement introuvable."));
        }

        // =========================================================
        // LISTE DES PAIEMENTS
        // =========================================================

        @Transactional
        public List<Paiement> listerPaiements(
                        UUID collectiviteId) {

                return paiementRepository
                                .findByCollectiviteId(
                                                collectiviteId);
        }

        // HTTP-controller adapters resolve the tenant from the authenticated request.
        public Paiement creerPaiement(UUID mandatId, Paiement.ModeReglement mode, LocalDate date, Authentication ignored) { return creerPaiement(mandatId, TenantContext.requireTenant(), mode, date); }
        public Paiement demarrerExecution(UUID id, Authentication ignored) { return demarrerExecution(id, TenantContext.requireTenant()); }
        public Paiement executerPaiement(UUID id, Authentication ignored) { return executerPaiement(id, TenantContext.requireTenant()); }
        public Paiement echouerPaiement(UUID id, Authentication ignored) { return echouerPaiement(id, TenantContext.requireTenant()); }
        public Paiement obtenirPaiement(UUID id, Authentication ignored) { return obtenirPaiement(id, TenantContext.requireTenant()); }
        public List<Paiement> listerPaiements(Authentication ignored) { return listerPaiements(TenantContext.requireTenant()); }
        public List<Paiement> listerPaiementsMandat(UUID mandatId, Authentication ignored) { return listerPaiementsMandat(mandatId, TenantContext.requireTenant()); }

        // =========================================================
        // PAIEMENTS D'UN MANDAT
        // =========================================================

        @Transactional
        public List<Paiement> listerPaiementsMandat(
                        UUID mandatId,
                        UUID collectiviteId) {

                // Vérification que le mandat appartient bien
                // à la collectivité courante.
                mandatRepository
                                .findByIdAndCollectiviteId(
                                                mandatId,
                                                collectiviteId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Mandat introuvable."));

                return paiementRepository
                                .findByMandatIdAndCollectiviteId(
                                                mandatId,
                                                collectiviteId);
        }

        // =========================================================
        // PAIEMENTS PAR STATUT
        // =========================================================

        @Transactional
        public List<Paiement> listerParStatut(
                        UUID collectiviteId,
                        Paiement.StatutPaiement statut) {

                if (statut == null) {
                        throw new IllegalArgumentException(
                                        "Le statut est obligatoire.");
                }

                return paiementRepository
                                .findByCollectiviteIdAndStatut(
                                                collectiviteId,
                                                statut);
        }

        // =========================================================
        // GENERATION NUMERO
        // =========================================================

        private String genererNumeroPaiement(
                        UUID collectiviteId) {

                String numero;

                do {

                        numero = "PAIEMENT-"
                                        + LocalDate.now().getYear()
                                        + "-"
                                        + UUID.randomUUID()
                                                        .toString()
                                                        .substring(0, 8)
                                                        .toUpperCase();

                } while (paiementRepository
                                .existsByNumeroPaiementAndCollectiviteId(
                                                numero,
                                                collectiviteId));

                return numero;
        }
}
