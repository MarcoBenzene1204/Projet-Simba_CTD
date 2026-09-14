package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.entity.Liquidation;
import com.marco.Simba_CTD.entity.Mandat;
import com.marco.Simba_CTD.entity.Paiement;
import com.marco.Simba_CTD.entity.Utilisateur;
import com.marco.Simba_CTD.repository.EngagementRepository;
import com.marco.Simba_CTD.repository.LiquidationRepository;
import com.marco.Simba_CTD.repository.MandatRepository;
import com.marco.Simba_CTD.repository.PaiementRepository;
import com.marco.Simba_CTD.repository.UtilisateurRepository;
import com.marco.Simba_CTD.service.CurrentUserService;
import com.marco.Simba_CTD.service.ReportingSummary;
import com.marco.Simba_CTD.service.ReportingSummaryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reporting")
public class ReportingController {

    private final ReportingSummaryService reportingSummaryService;
    private final CurrentUserService currentUserService;
    private final UtilisateurRepository utilisateurRepository;
    private final EngagementRepository engagementRepository;
    private final LiquidationRepository liquidationRepository;
    private final MandatRepository mandatRepository;
    private final PaiementRepository paiementRepository;

    public ReportingController(
            ReportingSummaryService reportingSummaryService,
            CurrentUserService currentUserService,
            UtilisateurRepository utilisateurRepository,
            EngagementRepository engagementRepository,
            LiquidationRepository liquidationRepository,
            MandatRepository mandatRepository,
            PaiementRepository paiementRepository) {
        this.reportingSummaryService = reportingSummaryService;
        this.currentUserService = currentUserService;
        this.utilisateurRepository = utilisateurRepository;
        this.engagementRepository = engagementRepository;
        this.liquidationRepository = liquidationRepository;
        this.mandatRepository = mandatRepository;
        this.paiementRepository = paiementRepository;
    }

    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ReportingSummary summary() {
        UUID collectiviteId = resolveCollectiviteId();
        return currentUserService.isSuperAdministrateur()
                ? reportingSummaryService.buildGlobalSummary()
                : reportingSummaryService.buildSummary(collectiviteId);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> dashboard() {
        UUID collectiviteId = resolveCollectiviteId();
        boolean globalView = currentUserService.isSuperAdministrateur();
        String role = currentUserService.getRoles().stream().findFirst().orElse("UTILISATEUR");

        List<Utilisateur> users = globalView
                ? utilisateurRepository.findAllWithCollectivite()
                : (collectiviteId == null ? List.of() : utilisateurRepository.findAllByCollectiviteId(collectiviteId));
        List<Engagement> engagements = globalView
                ? engagementRepository.findAll()
                : (collectiviteId == null ? List.of() : engagementRepository.findByCollectiviteId(collectiviteId));
        List<Liquidation> liquidations = globalView
                ? liquidationRepository.findAll()
                : (collectiviteId == null ? List.of() : liquidationRepository.findByCollectiviteId(collectiviteId));
        List<Mandat> mandats = globalView
                ? mandatRepository.findAll()
                : (collectiviteId == null ? List.of() : mandatRepository.findByCollectiviteId(collectiviteId));
        List<Paiement> paiements = globalView
                ? paiementRepository.findAll()
                : (collectiviteId == null ? List.of() : paiementRepository.findByCollectiviteId(collectiviteId));

        long activeUsers = users.stream().filter(user -> user.getStatut() != null && "ACTIF".equalsIgnoreCase(user.getStatut().name())).count();
        long inactiveUsers = users.size() - activeUsers;
        long waiting = engagements.stream().filter(e -> e.getEtat() == Engagement.EtatEngagement.SOUMIS_CF || e.getEtat() == Engagement.EtatEngagement.VISE).count()
                + liquidations.stream().filter(l -> l.getEtat() == Liquidation.EtatLiquidation.SOUMISE_CF || l.getEtat() == Liquidation.EtatLiquidation.VALIDEE_CF).count()
                + mandats.stream().filter(m -> m.getEtat() == Mandat.EtatMandat.SOUMIS_CF || m.getEtat() == Mandat.EtatMandat.TRANSMIS_RECEVEUR).count();
        long anomalies = engagements.stream().filter(e -> e.getEtat() == Engagement.EtatEngagement.REJET).count()
                + liquidations.stream().filter(l -> l.getEtat() == Liquidation.EtatLiquidation.REJETEE).count()
                + mandats.stream().filter(m -> m.getEtat() == Mandat.EtatMandat.REJETE_CF).count()
                + paiements.stream().filter(p -> p.getStatut() == Paiement.StatutPaiement.ECHEC).count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("role", role);
        payload.put("globalView", globalView);
        payload.put("kpis", List.of(
                Map.of("title", "Utilisateurs actifs", "value", activeUsers, "detail", globalView ? "Tous les utilisateurs" : "Utilisateurs de la CTD"),
                Map.of("title", "Opérations", "value", engagements.size() + liquidations.size() + mandats.size() + paiements.size(), "detail", "Données disponibles"),
                Map.of("title", "Dossiers en attente", "value", waiting, "detail", "Transactions à traiter"),
                Map.of("title", "Anomalies", "value", anomalies, "detail", "Rejets et échecs détectés dans les données accessibles")
        ));
        payload.put("charts", List.of(
                Map.of("title", "Activité par module",
                        "type", "BAR",
                        "data", List.of(
                                Map.of("label", "Engagements", "value", engagements.size()),
                                Map.of("label", "Liquidations", "value", liquidations.size()),
                                Map.of("label", "Mandats", "value", mandats.size()),
                                Map.of("label", "Paiements", "value", paiements.size())
                        )),
                Map.of("title", "Utilisateurs",
                        "type", "BAR",
                        "data", List.of(
                                Map.of("label", "Actifs", "value", activeUsers),
                                Map.of("label", "Inactifs", "value", inactiveUsers)
                        ))
        ));
        payload.put("insights", List.of(
                "Synthèse : " + (engagements.size() + liquidations.size() + mandats.size() + paiements.size()) + " opérations suivies.",
                "Dossiers en attente : " + waiting + ".",
                "Anomalies détectées : " + anomalies + ".",
                "Utilisateurs actifs : " + activeUsers + ", inactifs : " + inactiveUsers + "."
        ));
        payload.put("note", globalView ? "Vue globale sur toutes les collectivités." : "Vue limitée à la collectivité courante.");
        return payload;
    }

    private UUID resolveCollectiviteId() {
        try {
            Collectivite collectivite = currentUserService.getCollectivite();
            return collectivite == null ? null : collectivite.getId();
        } catch (Exception ignored) {
            return null;
        }
    }
}
