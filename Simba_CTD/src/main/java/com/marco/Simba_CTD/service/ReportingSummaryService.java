package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.entity.Liquidation;
import com.marco.Simba_CTD.entity.Mandat;
import com.marco.Simba_CTD.entity.Paiement;
import com.marco.Simba_CTD.repository.EngagementRepository;
import com.marco.Simba_CTD.repository.LiquidationRepository;
import com.marco.Simba_CTD.repository.MandatRepository;
import com.marco.Simba_CTD.repository.PaiementRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class ReportingSummaryService {

    private final EngagementRepository engagementRepository;
    private final LiquidationRepository liquidationRepository;
    private final MandatRepository mandatRepository;
    private final PaiementRepository paiementRepository;

    public ReportingSummaryService(
            EngagementRepository engagementRepository,
            LiquidationRepository liquidationRepository,
            MandatRepository mandatRepository,
            PaiementRepository paiementRepository) {
        this.engagementRepository = engagementRepository;
        this.liquidationRepository = liquidationRepository;
        this.mandatRepository = mandatRepository;
        this.paiementRepository = paiementRepository;
    }

    public ReportingSummary buildSummary(UUID collectiviteId) {
        return buildSummary(
                collectiviteId == null ? java.util.List.of() : engagementRepository.findByCollectiviteId(collectiviteId),
                collectiviteId == null ? java.util.List.of() : liquidationRepository.findByCollectiviteId(collectiviteId),
                collectiviteId == null ? java.util.List.of() : mandatRepository.findByCollectiviteId(collectiviteId),
                collectiviteId == null ? java.util.List.of() : paiementRepository.findByCollectiviteId(collectiviteId));
    }

    /** Vue consolidée, réservée au super-administrateur par le contrôleur. */
    public ReportingSummary buildGlobalSummary() {
        return buildSummary(
                engagementRepository.findAll(),
                liquidationRepository.findAll(),
                mandatRepository.findAll(),
                paiementRepository.findAll());
    }

    private ReportingSummary buildSummary(
            java.util.List<Engagement> engagements,
            java.util.List<Liquidation> liquidations,
            java.util.List<Mandat> mandats,
            java.util.List<Paiement> paiements) {

        BigDecimal montantEngages = engagements.stream()
                .map(Engagement::getMontantEngage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal montantLiquidations = liquidations.stream()
                .map(Liquidation::getMontantTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal montantMandats = mandats.stream()
                .map(Mandat::getMontantTTCMandate)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal montantPaiements = paiements.stream()
                .map(Paiement::getMontantTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int engagementsSoumis = (int) engagements.stream()
                .filter(e -> e.getEtat() == Engagement.EtatEngagement.SOUMIS_CF || e.getEtat() == Engagement.EtatEngagement.VISE)
                .count();

        int liquidationsValidees = (int) liquidations.stream()
                .filter(l -> l.getEtat() == Liquidation.EtatLiquidation.VALIDEE_CF || l.getEtat() == Liquidation.EtatLiquidation.PRETE_ORDONNANCEMENT)
                .count();

        int mandatsTransmis = (int) mandats.stream()
                .filter(m -> m.getEtat() == Mandat.EtatMandat.TRANSMIS_RECEVEUR || m.getEtat() == Mandat.EtatMandat.PAYE)
                .count();

        int paiementsExecutes = (int) paiements.stream()
                .filter(p -> p.getStatut() == Paiement.StatutPaiement.EXECUTE || p.getStatut() == Paiement.StatutPaiement.EN_COURS)
                .count();

        return new ReportingSummary(
                engagements.size(),
                liquidations.size(),
                mandats.size(),
                paiements.size(),
                montantEngages,
                montantLiquidations,
                montantMandats,
                montantPaiements,
                engagementsSoumis,
                liquidationsValidees,
                mandatsTransmis,
                paiementsExecutes
        );
    }
}
