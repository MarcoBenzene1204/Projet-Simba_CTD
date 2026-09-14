package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.entity.Liquidation;
import com.marco.Simba_CTD.repository.EngagementRepository;
import com.marco.Simba_CTD.repository.LiquidationRepository;
import com.marco.Simba_CTD.config.TenantContext;
import com.marco.Simba_CTD.security.SecurityContextService;
import org.springframework.security.core.Authentication;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class LiquidationService {

        private final LiquidationRepository liquidationRepository;
        private final EngagementRepository engagementRepository;
        private final SecurityContextService securityContextService;

        public LiquidationService(
                        LiquidationRepository liquidationRepository,
                        EngagementRepository engagementRepository,
                        SecurityContextService securityContextService) {
                this.liquidationRepository = liquidationRepository;
                this.engagementRepository = engagementRepository;
                this.securityContextService = securityContextService;
        }

        // =========================================================
        // CREATION
        // =========================================================

        /**
         * Crée une liquidation à partir d'un engagement confirmé.
         */
        public Liquidation creerLiquidation(
                        UUID collectiviteId,
                        UUID engagementId,
                        Liquidation liquidation) {

                if (collectiviteId == null) {
                        throw new IllegalArgumentException(
                                        "La collectivité est obligatoire.");
                }

                if (engagementId == null) {
                        throw new IllegalArgumentException(
                                        "L'engagement est obligatoire.");
                }

                verifierDonneesFacture(liquidation);

                Engagement engagement = engagementRepository
                                .findByIdAndCollectiviteId(
                                                engagementId,
                                                collectiviteId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Engagement introuvable."));

                // -----------------------------------------------------
                // L'engagement doit être confirmé
                // -----------------------------------------------------

                if (!engagement.estConfirmé()) {
                        throw new IllegalStateException(
                                        "La liquidation ne peut être créée que "
                                                        + "pour un engagement confirmé.");
                }

                // -----------------------------------------------------
                // Sécurité tenant
                // -----------------------------------------------------

                liquidation.setCollectiviteId(collectiviteId);

                // -----------------------------------------------------
                // Association engagement
                // -----------------------------------------------------

                liquidation.setEngagement(engagement);

                // -----------------------------------------------------
                // Valeurs par défaut
                // -----------------------------------------------------

                if (liquidation.getMontantTaxes() == null) {
                        liquidation.setMontantTaxes(BigDecimal.ZERO);
                }

                if (liquidation.getMontantTTC() == null) {
                        liquidation.calculerMontants();
                }

                // -----------------------------------------------------
                // Vérification numéro
                // -----------------------------------------------------

                if (liquidation.getNumero() == null
                                || liquidation.getNumero().isBlank()) {

                        throw new IllegalArgumentException(
                                        "Le numéro de liquidation est obligatoire.");
                }

                if (liquidationRepository
                                .existsByNumeroAndCollectiviteId(
                                                liquidation.getNumero(),
                                                collectiviteId)) {
                        throw new IllegalArgumentException(
                                        "Ce numéro de liquidation existe déjà.");
                }

                // -----------------------------------------------------
                // Vérification facture
                // -----------------------------------------------------

                if (liquidation.getNumeroFacture() != null
                                && liquidationRepository
                                                .existsByNumeroFactureAndCollectiviteId(
                                                                liquidation.getNumeroFacture(),
                                                                collectiviteId)) {

                        throw new IllegalArgumentException(
                                        "Le numéro de facture existe déjà "
                                                        + "dans cette collectivité.");
                }

                // -----------------------------------------------------
                // Calculs serveur
                // -----------------------------------------------------

                liquidation.calculerMontants();

                // -----------------------------------------------------
                // Vérification montant engagement
                // -----------------------------------------------------

                verifierMontantAvecEngagement(liquidation, collectiviteId, engagementId);

                return liquidationRepository.save(liquidation);
        }

        // =========================================================
        // VERIFICATION MONTANT
        // =========================================================

        private void verifierMontantAvecEngagement(
                        Liquidation liquidation,
                        UUID collectiviteId,
                        UUID engagementId) {

                Engagement engagement = liquidation.getEngagement();

                if (engagement == null) {
                        throw new IllegalStateException(
                                        "La liquidation n'est associée à aucun engagement.");
                }

                BigDecimal montantEngagement = engagement.getMontantTTC();

                BigDecimal montantLiquidation = liquidation.getMontantTTC();

                if (montantEngagement == null
                                || montantLiquidation == null) {

                        throw new IllegalStateException(
                                        "Les montants de l'engagement et de la liquidation "
                                                        + "doivent être renseignés.");
                }

                if (montantLiquidation.compareTo(
                                montantEngagement) > 0) {

                        BigDecimal difference = montantLiquidation.subtract(
                                        montantEngagement);

                        throw new IllegalStateException(
                                        "Le montant liquidé dépasse le montant engagé "
                                                        + "de " + difference + ".");
                }

                BigDecimal totalDejaLiquide = liquidationRepository
                                .findByCollectiviteIdAndEngagementId(
                                                collectiviteId,
                                                engagementId)
                                .stream()
                                .filter(existing -> existing.getEtat()
                                                != Liquidation.EtatLiquidation.REJETEE)
                                .map(Liquidation::getMontantTTC)
                                .filter(java.util.Objects::nonNull)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalApresCreation = totalDejaLiquide.add(montantLiquidation);
                if (totalApresCreation.compareTo(montantEngagement) > 0) {
                        BigDecimal difference = totalApresCreation.subtract(montantEngagement);
                        throw new IllegalStateException(
                                        "Le cumul des liquidations dépasse le montant engagé "
                                                        + "de " + difference + ".");
                }
        }

        private void verifierDonneesFacture(Liquidation liquidation) {
                if (liquidation == null) {
                        throw new IllegalArgumentException("La liquidation est obligatoire.");
                }
                if (liquidation.getTypeFacture() == null) {
                        throw new IllegalArgumentException("Le type de facture est obligatoire.");
                }
                if (liquidation.getNumeroFacture() == null
                                || liquidation.getNumeroFacture().isBlank()) {
                        throw new IllegalArgumentException("Le numéro de facture est obligatoire.");
                }
                if (liquidation.getDateFacture() == null) {
                        throw new IllegalArgumentException("La date de facture est obligatoire.");
                }
                if (liquidation.getMontantHT() == null
                                || liquidation.getMontantHT().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException(
                                        "Le montant HT de la facture doit être supérieur à zéro.");
                }
        }

        // =========================================================
        // SOUMISSION AU CONTROLEUR FINANCIER
        // =========================================================

        public Liquidation soumettreAuControleurFinancier(
                        UUID liquidationId,
                        UUID collectiviteId) {

                Liquidation liquidation = obtenirLiquidation(
                                liquidationId,
                                collectiviteId);

                liquidation.verifierAvantSoumission();

                liquidation.soumettreAuControleurFinancier();

                return liquidationRepository.save(liquidation);
        }

        // =========================================================
        // VALIDATION PAR LE CONTROLEUR FINANCIER
        // =========================================================

        public Liquidation validerParControleur(
                        UUID liquidationId,
                        UUID collectiviteId,
                        UUID controleurId) {

                Liquidation liquidation = obtenirLiquidation(
                                liquidationId,
                                collectiviteId);

                if (controleurId == null) {
                        throw new IllegalArgumentException(
                                        "Le contrôleur financier est obligatoire.");
                }

                liquidation.validerParControleur(controleurId);

                return liquidationRepository.save(liquidation);
        }

        // =========================================================
        // REJET
        // =========================================================

        public Liquidation rejeter(
                        UUID liquidationId,
                        UUID collectiviteId) {

                Liquidation liquidation = obtenirLiquidation(
                                liquidationId,
                                collectiviteId);

                liquidation.rejeter();

                return liquidationRepository.save(liquidation);
        }

        // =========================================================
        // PREPARATION ORDonnANCEMENT
        // =========================================================

        public Liquidation preparerPourOrdonnancement(
                        UUID liquidationId,
                        UUID collectiviteId) {

                Liquidation liquidation = obtenirLiquidation(
                                liquidationId,
                                collectiviteId);

                // -----------------------------------------------------
                // La liquidation doit être validée par le CF
                // -----------------------------------------------------

                if (liquidation.getEtat() != Liquidation.EtatLiquidation.VALIDEE_CF) {

                        throw new IllegalStateException(
                                        "Seule une liquidation validée par le "
                                                        + "Contrôleur Financier peut être préparée "
                                                        + "pour l'ordonnancement.");
                }

                // -----------------------------------------------------
                // Service fait obligatoire
                // -----------------------------------------------------

                if (!liquidation.serviceFaitEstAtteste()) {

                        throw new IllegalStateException(
                                        "Le service fait doit être attesté "
                                                        + "avant l'ordonnancement.");
                }

                // -----------------------------------------------------
                // Conformité fiscale obligatoire
                // -----------------------------------------------------

                if (!liquidation.conformiteFiscaleEstValide()) {

                        throw new IllegalStateException(
                                        "La conformité fiscale doit être validée "
                                                        + "avant l'ordonnancement.");
                }

                liquidation.preparerPourOrdonnancement();

                return liquidationRepository.save(liquidation);
        }

        // =========================================================
        // ATTESTATION SERVICE FAIT
        // =========================================================

        public Liquidation attesterServiceFait(
                        UUID liquidationId,
                        UUID collectiviteId) {

                Liquidation liquidation = obtenirLiquidation(
                                liquidationId,
                                collectiviteId);

                UUID agentId = securityContextService.getCurrentUserId();
                liquidation.attesterServiceFait(agentId);

                return liquidationRepository.save(liquidation);
        }

        // =========================================================
        // CONFORMITE FISCALE
        // =========================================================

        public Liquidation validerConformiteFiscale(
                        UUID liquidationId,
                        UUID collectiviteId) {

                Liquidation liquidation = obtenirLiquidation(
                                liquidationId,
                                collectiviteId);

                liquidation.setConformiteFiscale(true);

                return liquidationRepository.save(liquidation);
        }

        // =========================================================
        // OBTENIR UNE LIQUIDATION
        // =========================================================

        @Transactional
        public Liquidation obtenirLiquidation(
                        UUID liquidationId,
                        UUID collectiviteId) {

                return liquidationRepository
                                .findByIdAndCollectiviteId(
                                                liquidationId,
                                                collectiviteId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Liquidation introuvable."));
        }

        // =========================================================
        // LISTE
        // =========================================================

        @Transactional
        public List<Liquidation> listerLiquidations(
                        UUID collectiviteId) {

                return liquidationRepository
                                .findByCollectiviteId(
                                                collectiviteId);
        }

        // =========================================================
        // LIQUIDATIONS D'UN ENGAGEMENT
        // =========================================================

        @Transactional
        public List<Liquidation> listerParEngagement(
                        UUID engagementId,
                        UUID collectiviteId) {

                // Vérification tenant + existence
                engagementRepository
                                .findByIdAndCollectiviteId(
                                                engagementId,
                                                collectiviteId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Engagement introuvable."));

                return liquidationRepository
                                .findByCollectiviteIdAndEngagementId(
                                                collectiviteId,
                                                engagementId);
        }

        // =========================================================
        // SUPPRESSION
        // =========================================================

        public void supprimer(
                        UUID liquidationId,
                        UUID collectiviteId) {

                Liquidation liquidation = obtenirLiquidation(
                                liquidationId,
                                collectiviteId);

                if (!liquidation.estModifiable()) {

                        throw new IllegalStateException(
                                        "Cette liquidation ne peut plus être supprimée.");
                }

                liquidationRepository.delete(liquidation);
        }

        // Compatibility entry points for HTTP controllers. Tenant and actor are
        // resolved from the authenticated request, never from request payloads.
        public Liquidation creerLiquidation(UUID engagementId, Liquidation liquidation, Authentication ignored) { return creerLiquidation(TenantContext.requireTenant(), engagementId, liquidation); }
        public Liquidation attesterServiceFait(UUID id, Authentication ignored) {
                UUID tenant = TenantContext.requireTenant();
                Liquidation liquidation = obtenirLiquidation(id, tenant);
                UUID agentId = securityContextService.getCurrentUserId();
                liquidation.attesterServiceFait(agentId);
                return liquidationRepository.save(liquidation);
        }
        public Liquidation validerConformiteFiscale(UUID id, Authentication ignored) { return validerConformiteFiscale(id, TenantContext.requireTenant()); }
        public Liquidation soumettreAuControleurFinancier(UUID id, Authentication ignored) { return soumettreAuControleurFinancier(id, TenantContext.requireTenant()); }
        public Liquidation validerParControleur(UUID id, Authentication ignored) {
                return validerParControleur(id, TenantContext.requireTenant(), securityContextService.getCurrentUserId());
        }
        public Liquidation rejeter(UUID id, Authentication ignored) { return rejeter(id, TenantContext.requireTenant()); }
        public Liquidation preparerPourOrdonnancement(UUID id, Authentication ignored) { return preparerPourOrdonnancement(id, TenantContext.requireTenant()); }
        public Liquidation obtenirLiquidation(UUID id, Authentication ignored) { return obtenirLiquidation(id, TenantContext.requireTenant()); }
        public List<Liquidation> listerLiquidations(Authentication ignored) { return listerLiquidations(TenantContext.requireTenant()); }
        public List<Liquidation> listerParEngagement(UUID id, Authentication ignored) { return listerParEngagement(id, TenantContext.requireTenant()); }
        public void supprimer(UUID id, Authentication ignored) { supprimer(id, TenantContext.requireTenant()); }
}
