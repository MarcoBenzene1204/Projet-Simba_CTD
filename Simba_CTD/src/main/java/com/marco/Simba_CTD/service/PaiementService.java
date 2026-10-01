package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Mandat;
import com.marco.Simba_CTD.entity.Paiement;
import com.marco.Simba_CTD.repository.MandatRepository;
import com.marco.Simba_CTD.repository.PaiementRepository;
import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.config.TenantContext;
import com.marco.Simba_CTD.security.SecurityContextService;
import org.springframework.jdbc.core.JdbcTemplate;
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
        private final SecurityContextService securityContextService;
        private final NotificationService notificationService;
        private final JdbcTemplate jdbcTemplate;

        public PaiementService(
                        PaiementRepository paiementRepository,
                        MandatRepository mandatRepository,
                        SecurityContextService securityContextService,
                        NotificationService notificationService,
                        JdbcTemplate jdbcTemplate) {
                this.paiementRepository = paiementRepository;
                this.mandatRepository = mandatRepository;
                this.securityContextService = securityContextService;
                this.notificationService = notificationService;
                this.jdbcTemplate = jdbcTemplate;
        }

        public List<Mandat> listerMandatsAProgrammer(UUID collectiviteId) {
                return mandatRepository.findByCollectiviteIdAndEtat(
                                collectiviteId, Mandat.EtatMandat.TRANSMIS_RECEVEUR)
                                .stream()
                                .filter(mandat -> !paiementRepository.existsByMandatIdAndCollectiviteId(
                                                mandat.getId(), collectiviteId))
                                .toList();
        }

        public boolean mandatRequiertCosignature(Mandat mandat) {
                return montantExigeCosignature(mandat.getMontantTTCMandate())
                                || estInvestissement(mandat.getId(), mandat.getCollectiviteId());
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
                if (dateProgrammee == null) {
                        throw new IllegalArgumentException("La programmation du paiement est obligatoire.");
                }
                if (dateProgrammee.isBefore(LocalDate.now())) {
                        throw new IllegalArgumentException("La date programmée ne peut pas être passée.");
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

                verifierDateLimite(mandat);
                boolean investissement = estInvestissement(mandatId, collectiviteId);
                boolean cosignatureRequise = montantExigeCosignature(montantTTC) || investissement;
                if (modeReglement == Paiement.ModeReglement.CAISSE && cosignatureRequise) {
                        throw new IllegalStateException("Un paiement d'au moins 100 000 FCFA ou d'investissement doit être réglé par chèque/virement avec cosignature.");
                }
                if (!cosignatureRequise && modeReglement != Paiement.ModeReglement.CAISSE) {
                        throw new IllegalStateException("Un paiement de fonctionnement inférieur à 100 000 FCFA doit être réglé en caisse.");
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

                paiement.setMontantRetenues(calculerRetenuesDepuisLiasse(mandat));
                paiement.setDoubleSignatureRequise(cosignatureRequise);

                paiement.setDateProgrammee(
                                dateProgrammee);

                paiement.setStatut(
                                Paiement.StatutPaiement.PROGRAMME);

                // -----------------------------------------------------
                // CALCUL NET
                // -----------------------------------------------------

                paiement.calculerMontantNet();

                Paiement saved = paiementRepository.save(paiement);
                notificationService.notifierRoles(collectiviteId,
                                List.of(RoleApplication.COSIGNATAIRE),
                                securityContextService.getCurrentUserId(), "PAIEMENT_A_COSIGNER",
                                "Paiement à cosigner",
                                saved.getNumeroPaiement() + " est prêt pour la cosignature.",
                                "/dashboard/paiements");
                return saved;
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

                paiement.demarrerExecution(securityContextService.getCurrentUserId());
                return paiementRepository.save(paiement);
        }

        public Paiement cosignerPaiement(UUID paiementId, UUID collectiviteId) {
                Paiement paiement = obtenirPaiement(paiementId, collectiviteId);
                paiement.signerCosignataire(securityContextService.getCurrentUserId());
                Paiement saved = paiementRepository.save(paiement);
                notificationService.notifierUtilisateur(saved.getReceveurSignatureId(), collectiviteId,
                                "PAIEMENT_COSIGNE", "Cosignature reçue",
                                saved.getNumeroPaiement() + " a été cosigné et peut être exécuté.",
                                "/dashboard/paiements/" + saved.getId());
                return saved;
        }

        public Paiement differerPaiement(UUID paiementId, UUID collectiviteId, String justification) {
                Paiement paiement = obtenirPaiement(paiementId, collectiviteId);
                paiement.differer(justification);
                Paiement saved = paiementRepository.save(paiement);
                if (saved.getMandat() != null) {
                        notificationService.notifierUtilisateur(saved.getMandat().getOrdonnatorId(), collectiviteId,
                                        "PAIEMENT_DIFFERE", "Paiement différé",
                                        saved.getNumeroPaiement() + " a été différé. Motif : " + justification.trim(),
                                        "/dashboard/paiements/" + saved.getId());
                }
                return saved;
        }

        // =========================================================
        // EXECUTION DU PAIEMENT
        // =========================================================

        public Paiement executerPaiement(
                        UUID paiementId,
                        UUID collectiviteId,
                        String referenceBancaire,
                        String referenceCheque) {

                Paiement paiement = obtenirPaiement(
                                paiementId,
                                collectiviteId);

                paiement.setReferenceBancaire(referenceBancaire);
                paiement.setReferenceCheque(referenceCheque);
                if (paiement.getMandat() == null) throw new IllegalStateException("Le mandat du paiement est introuvable.");
                verifierDateLimite(paiement.getMandat());

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

                Paiement saved = paiementRepository.save(paiement);
                notificationService.notifierUtilisateur(mandat.getOrdonnatorId(), collectiviteId,
                                "PAIEMENT_EXECUTE", "Paiement exécuté",
                                saved.getNumeroPaiement() + " a été exécuté pour " + formatFcfa(saved.getMontantNetPaye()) + ".",
                                "/dashboard/paiements/" + saved.getId());
                return saved;
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
        public Paiement executerPaiement(UUID id, String referenceBancaire, String referenceCheque, Authentication ignored) { return executerPaiement(id, TenantContext.requireTenant(), referenceBancaire, referenceCheque); }
        public Paiement cosignerPaiement(UUID id, Authentication ignored) { return cosignerPaiement(id, TenantContext.requireTenant()); }
        public Paiement differerPaiement(UUID id, String justification, Authentication ignored) { return differerPaiement(id, TenantContext.requireTenant(), justification); }
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

        private boolean montantExigeCosignature(BigDecimal montant) {
                return montant != null && montant.compareTo(new BigDecimal("100000")) >= 0;
        }

        private boolean estInvestissement(UUID mandatId, UUID collectiviteId) {
                Boolean investment = jdbcTemplate.queryForObject(
                                "SELECT EXISTS (SELECT 1 FROM mandat_liquidations ml "
                                                + "JOIN liquidations l ON l.id = ml.liquidation_id "
                                                + "JOIN engagements e ON e.id = l.engagement_id "
                                                + "JOIN lignes_budgetaires lb ON lb.id = e.ligne_budgetaire_id "
                                                + "WHERE ml.mandat_id = ? AND l.collectivite_id = ? "
                                                + "AND lower(coalesce(lb.section, '')) LIKE '%invest%')",
                                Boolean.class, mandatId, collectiviteId);
                return Boolean.TRUE.equals(investment);
        }

        private BigDecimal calculerRetenuesDepuisLiasse(Mandat mandat) {
                if (mandat.getLignes() == null || mandat.getLignes().isEmpty()) {
                        throw new IllegalStateException("La liasse du mandat ne contient aucune liquidation.");
                }
                BigDecimal retenues = BigDecimal.ZERO;
                for (var ligne : mandat.getLignes()) {
                        var liquidation = ligne.getLiquidation();
                        if (liquidation == null || liquidation.getMontantTTC() == null || liquidation.getMontantNAP() == null) {
                                throw new IllegalStateException("Le NAP de chaque liquidation doit être calculé avant paiement.");
                        }
                        BigDecimal ecartFiscal = liquidation.getMontantTTC().subtract(liquidation.getMontantNAP());
                        BigDecimal ligneTtc = ligne.getMontant();
                        if (ligneTtc == null || ligneTtc.compareTo(BigDecimal.ZERO) <= 0 || liquidation.getMontantTTC().compareTo(BigDecimal.ZERO) <= 0) {
                                throw new IllegalStateException("Une ligne de la liasse comporte un montant invalide.");
                        }
                        retenues = retenues.add(ligneTtc.multiply(ecartFiscal)
                                        .divide(liquidation.getMontantTTC(), 2, java.math.RoundingMode.HALF_UP));
                }
                return retenues;
        }

        private void verifierDateLimite(Mandat mandat) {
                if (mandat.getDateMandatement() == null) return;
                LocalDate dateLimite = LocalDate.of(mandat.getDateMandatement().getYear() + 1, 1, 31);
                if (LocalDate.now().isAfter(dateLimite)) {
                        throw new IllegalStateException("La période complémentaire de paiement a pris fin le 31 janvier N+1.");
                }
        }

        private String formatFcfa(BigDecimal montant) {
                return new java.text.DecimalFormat("#,##0.##").format(montant == null ? BigDecimal.ZERO : montant) + " FCFA";
        }
}
