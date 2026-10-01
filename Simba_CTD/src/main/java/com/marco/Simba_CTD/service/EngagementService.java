package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.Enum.EtatRegularisation;
import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.Enum.RoleApplication;
import com.marco.Simba_CTD.entity.Regularisation470XX;
import com.marco.Simba_CTD.repository.EngagementRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class EngagementService {

    private final JdbcTemplate jdbcTemplate;
    private final EngagementRepository engagementRepository;
    private final CurrentUserService currentUserService;
    private final DocumentM5Service documentM5Service;
    private final NotificationService notificationService;

    public EngagementService(
            JdbcTemplate jdbcTemplate,
            EngagementRepository engagementRepository,
            CurrentUserService currentUserService,
            DocumentM5Service documentM5Service,
            NotificationService notificationService) {
        this.jdbcTemplate = jdbcTemplate;
        this.engagementRepository = engagementRepository;
        this.currentUserService = currentUserService;
        this.documentM5Service = documentM5Service;
        this.notificationService = notificationService;
    }

    @PreAuthorize("hasRole('ORDONNATEUR') and hasAuthority('engagement:creer')")
    public Engagement creerEngagement(Engagement demande, Authentication authentication) {
        verifierUtilisateurActif();
        if (demande == null) {
            throw new IllegalArgumentException("L'engagement est obligatoire.");
        }
        if (demande.getExerciceId() == null || demande.getLigneBudgetaireId() == null
                || demande.getTypeEngagement() == null || demande.getObjet() == null
                || demande.getObjet().isBlank()) {
            throw new IllegalArgumentException(
                    "L'exercice, la ligne budgétaire, le type et l'objet sont obligatoires.");
        }
        validerReferenceM5Obligatoire(demande);

        UUID collectiviteId = currentUserService.requireTenantId();
        Engagement engagement = new Engagement();
        engagement.setCollectiviteId(collectiviteId);
        engagement.setExerciceId(demande.getExerciceId());
        engagement.setLigneBudgetaireId(demande.getLigneBudgetaireId());
        engagement.setTiersId(demande.getTiersId());
        engagement.setDocumentPreparatoireId(demande.getDocumentM5Id());
        engagement.setNumeroEngagement(genererNumero(collectiviteId));
        engagement.setTypeEngagement(demande.getTypeEngagement());
        engagement.setObjet(demande.getObjet().trim());
        engagement.setMontantHT(nonNullAmount(demande.getMontantHT()));
        engagement.setTauxTVA(nonNullAmount(demande.getTauxTVA()));
        engagement.setTauxImpot(nonNullAmount(demande.getTauxImpot()));
        engagement.calculerMontants();
        engagement.setDateEngagement(LocalDate.now());
        engagement.setOrdonnatorId(currentUserService.getUtilisateur().getId());
        engagement.setEtat(Engagement.EtatEngagement.BROUILLON);
        engagement.setMetadata(demande.getMetadata() == null
                ? Map.of() : new HashMap<>(demande.getMetadata()));
        return engagementRepository.save(engagement);
    }

    @PreAuthorize("hasAuthority('engagement:creer')")
    public Engagement creerEngagementRetrospectif(Regularisation470XX regularisation) {
        verifierUtilisateurActif();
        if (regularisation == null) {
            throw new IllegalArgumentException("La régularisation 470XX est obligatoire.");
        }
        UUID collectiviteId = currentUserService.requireTenantId();
        if (!collectiviteId.equals(regularisation.getCollectiviteId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "La régularisation appartient à une autre collectivité.");
        }
        if (regularisation.getEtat() != EtatRegularisation.NOTIFIEE) {
            throw new IllegalStateException("La régularisation doit être notifiée.");
        }
        if (regularisation.getExerciceId() == null || regularisation.getLigneBudgetaireId() == null
                || regularisation.getMontantImputation() == null
                || regularisation.getMontantImputation().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException(
                    "L'exercice, la ligne budgétaire et le montant d'imputation sont obligatoires.");
        }

        Engagement engagement = new Engagement();
        engagement.setCollectiviteId(collectiviteId);
        engagement.setExerciceId(regularisation.getExerciceId());
        engagement.setLigneBudgetaireId(regularisation.getLigneBudgetaireId());
        engagement.setTiersId(regularisation.getTiersId());
        engagement.setNumeroEngagement(genererNumero(collectiviteId));
        engagement.setTypeEngagement(Engagement.TypeEngagement.REGULARISATION_470XX);
        engagement.setObjet("Régularisation de la dépense sans ordonnancement préalable - compte 470XX");
        engagement.setMontantHT(regularisation.getMontantImputation());
        engagement.setMontantTVA(BigDecimal.ZERO);
        engagement.setMontantTTC(regularisation.getMontantImputation());
        engagement.setMontantEngage(regularisation.getMontantImputation());
        engagement.setDateEngagement(LocalDate.now());
        engagement.setOrdonnatorId(currentUserService.getUtilisateur().getId());
        engagement.setEtat(Engagement.EtatEngagement.BROUILLON);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("origine", "REGULARISATION_470XX");
        metadata.put("regularisation_470xx_id", regularisation.getId().toString());
        metadata.put("reference_paiement", regularisation.getReferencePaiementDetecte());
        engagement.setMetadata(metadata);
        return engagementRepository.save(engagement);
    }

    @PreAuthorize("hasRole('ORDONNATEUR') and hasAuthority('engagement:soumettre')")
    public Engagement soumettreAuControleurFinancier(UUID id, Authentication authentication) {
        Engagement engagement = obtenirDansTenant(id);
        verifierUtilisateurActif();
        validerReferenceM5Obligatoire(engagement);
        verifierAvisImpositionDgi(engagement);
        reserverCreditsDisponibles(engagement);
        engagement.soumettreAuControleurFinancier();
        Engagement saved = engagementRepository.save(engagement);
        notificationService.notifierRoles(saved.getCollectiviteId(),
            java.util.List.of(RoleApplication.CONTROLEUR_FINANCIER, RoleApplication.ADMINISTRATEUR),
            currentUserService.getUtilisateur().getId(), "ENGAGEMENT_SOUMIS",
            "Engagement soumis au contrôle",
            saved.getNumeroEngagement() + " a été soumis au contrôle financier.",
            "/dashboard/controleur/engagements");
        return saved;
    }

    @PreAuthorize("hasRole('CONTROLEUR_FINANCIER') and hasAuthority('engagement:valider')")
    public Engagement apposerVisa(UUID id, Authentication authentication) {
        return apposerVisa(id, "VISA", null, null, authentication);
    }

    @PreAuthorize("hasRole('CONTROLEUR_FINANCIER') and hasAuthority('engagement:valider')")
    public Engagement apposerVisa(UUID id, String typeAvis, String observations, String reserves,
            Authentication authentication) {
        String avis = typeAvis == null ? "VISA" : typeAvis.trim().toUpperCase(java.util.Locale.ROOT);
        if (!java.util.Set.of("VISA", "VISA_AVEC_OBSERVATIONS", "VISA_AVEC_RESERVES").contains(avis)) {
            throw new IllegalArgumentException("Le type d'avis financier est invalide.");
        }
        if ("VISA_AVEC_OBSERVATIONS".equals(avis) && (observations == null || observations.isBlank())) {
            throw new IllegalArgumentException("Les observations sont obligatoires pour ce visa.");
        }
        if ("VISA_AVEC_RESERVES".equals(avis) && (reserves == null || reserves.isBlank())) {
            throw new IllegalArgumentException("Les réserves sont obligatoires pour ce visa.");
        }
        Engagement engagement = obtenirDansTenant(id);
        verifierUtilisateurActif();
        UUID controleurId = currentUserService.getUtilisateur().getId();
        UUID collectiviteId = engagement.getCollectiviteId();
        jdbcTemplate.update(
                "INSERT INTO avis_controle_financier (collectivite_id, engagement_id, controleur_id, type_avis, observations, reserves, date_decision) "
                        + "VALUES (?, ?, ?, ?::type_avis_controle, ?, ?, CURRENT_TIMESTAMP)",
                collectiviteId, engagement.getId(), controleurId, avis, observations, reserves);
        engagement.apposerVisa(controleurId);
        Map<String, Object> metadata = engagement.getMetadata() == null
                ? new HashMap<>() : new HashMap<>(engagement.getMetadata());
        metadata.put("dernierAvisCF", avis);
        if (observations != null && !observations.isBlank()) metadata.put("observationsCF", observations.trim());
        if (reserves != null && !reserves.isBlank()) metadata.put("reservesCF", reserves.trim());
        engagement.setMetadata(metadata);
        Engagement saved = engagementRepository.save(engagement);
        String decision = switch (avis) {
            case "VISA_AVEC_OBSERVATIONS" -> "a reçu un visa avec observations";
            case "VISA_AVEC_RESERVES" -> "a reçu un visa avec réserves";
            default -> "a reçu le visa du contrôleur financier";
        };
        String details = "VISA_AVEC_OBSERVATIONS".equals(avis) ? " Observations : " + observations.trim()
                : "VISA_AVEC_RESERVES".equals(avis) ? " Réserves : " + reserves.trim() : "";
        notificationService.notifierUtilisateur(saved.getOrdonnatorId(), saved.getCollectiviteId(),
            "ENGAGEMENT_VISE", "Décision du contrôle financier",
            saved.getNumeroEngagement() + " " + decision + "." + details,
            "/dashboard/gestion-ordonnateur/engagement/" + saved.getId());
        return saved;
    }

    @PreAuthorize("hasRole('CONTROLEUR_FINANCIER') and hasAuthority('engagement:rejeter')")
    public Engagement rejeter(UUID id, String motif, Authentication authentication) {
        Engagement engagement = obtenirDansTenant(id);
        verifierUtilisateurActif();
        engagement.rejeter(motif);
        Engagement saved = engagementRepository.save(engagement);
        notificationService.notifierUtilisateur(saved.getOrdonnatorId(), saved.getCollectiviteId(),
            "ENGAGEMENT_REJETE", "Engagement rejeté",
            saved.getNumeroEngagement() + " a été rejeté par le contrôle financier. Motif : " + motif,
            "/dashboard/gestion-ordonnateur/engagement/" + saved.getId());
        return saved;
    }

    @PreAuthorize("hasRole('ORDONNATEUR') and hasAuthority('engagement:confirmer')")
    public Engagement confirmer(UUID id, Authentication authentication) {
        Engagement engagement = obtenirDansTenant(id);
        verifierUtilisateurActif();
        engagement.confirmer();
        return engagementRepository.save(engagement);
    }

    @Transactional(readOnly = true)
    public Engagement obtenirEngagement(UUID id, Authentication authentication) {
        return obtenirDansTenant(id);
    }

    @Transactional(readOnly = true)
    public Engagement obtenirEngagement(UUID id) {
        return obtenirDansTenant(id);
    }

    @Transactional(readOnly = true)
    public List<Engagement> listerEngagements(Authentication authentication) {
        UUID collectiviteId = currentUserService.requireTenantId();
        if ("CONTROLEUR_FINANCIER".equals(currentUserService.getApplicationRole())) {
            return engagementRepository.findByCollectiviteId(collectiviteId);
        }
        return engagementRepository.findByOrdonnatorIdAndCollectiviteId(
                currentUserService.getUtilisateur().getId(), collectiviteId);
    }

    public Engagement validerEtRéserverCrédits(UUID id) {
        Engagement engagement = obtenirDansTenant(id);
        reserverCreditsDisponibles(engagement);
        return engagementRepository.save(engagement);
    }

    private void verifierAvisImpositionDgi(Engagement engagement) {
        Object reference = engagement.getMetadata() == null
                ? null
                : engagement.getMetadata().get("avisImpositionDgi");
        if (!(reference instanceof String avis) || avis.isBlank()) {
            throw new IllegalStateException(
                    "La référence de l'avis d'imposition DGI est obligatoire avant la soumission au Contrôleur Financier.");
        }
    }

    private void reserverCreditsDisponibles(Engagement engagement) {
        if (Boolean.TRUE.equals(engagement.getCreditsReserves())) {
            return;
        }

        BigDecimal montantTTC = engagement.getMontantTTC();
        if (montantTTC == null || montantTTC.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Le montant TTC de l'engagement doit être supérieur à zéro.");
        }

        UUID collectiviteId = currentUserService.requireTenantId();
        BigDecimal creditsDisponibles;
        try {
            creditsDisponibles = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(credit_vote, 0) + COALESCE(credit_modifie, 0) - COALESCE(credit_engage, 0) "
                            + "FROM lignes_budgetaires WHERE id = ? AND collectivite_id = ? AND exercice_id = ? FOR UPDATE",
                    BigDecimal.class,
                    engagement.getLigneBudgetaireId(),
                    collectiviteId,
                    engagement.getExerciceId());
        } catch (EmptyResultDataAccessException exception) {
            throw new IllegalArgumentException("La ligne budgétaire de l'engagement est introuvable pour cet exercice.");
        }

        if (creditsDisponibles == null || creditsDisponibles.compareTo(montantTTC) < 0) {
            throw new IllegalStateException("Crédits budgétaires insuffisants. Solde disponible : "
                    + (creditsDisponibles == null ? BigDecimal.ZERO : creditsDisponibles).toPlainString() + " FCFA.");
        }

        int lignesMisesAJour = jdbcTemplate.update(
                "UPDATE lignes_budgetaires SET credit_engage = credit_engage + ?, updated_at = CURRENT_TIMESTAMP "
                        + "WHERE id = ? AND collectivite_id = ? AND exercice_id = ? "
                        + "AND credit_vote + credit_modifie - credit_engage >= ?",
                montantTTC,
                engagement.getLigneBudgetaireId(),
                collectiviteId,
                engagement.getExerciceId(),
                montantTTC);
        if (lignesMisesAJour != 1) {
            throw new IllegalStateException("Les crédits disponibles ont changé. Actualisez puis réessayez.");
        }

        engagement.reserverCredits();
    }

    private Engagement obtenirDansTenant(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("L'identifiant de l'engagement est obligatoire.");
        }
        return engagementRepository.findByIdAndCollectiviteId(
                id, currentUserService.requireTenantId())
                .orElseThrow(() -> new IllegalArgumentException("Engagement introuvable."));
    }

    private void verifierUtilisateurActif() {
        currentUserService.getUtilisateur();
    }

    private void validerReferenceM5Obligatoire(Engagement engagement) {
        if (engagement == null) {
            throw new IllegalArgumentException("L'engagement est obligatoire.");
        }

        if (engagement.getTypeEngagement() == Engagement.TypeEngagement.REGULARISATION_470XX) {
            return;
        }

        if (engagement.getDocumentM5Id() == null
            || !documentM5Service.documentExiste(
                engagement.getDocumentM5Id(), engagement.getTypeEngagement().name())) {
            throw new IllegalArgumentException("La référence M5 est obligatoire pour un engagement.");
        }
    }

    private BigDecimal nonNullAmount(BigDecimal montant) {
        return montant == null ? BigDecimal.ZERO : montant;
    }

    private String genererNumero(UUID collectiviteId) {
        String numero;
        do {
            numero = "ENG-" + LocalDate.now().getYear() + "-"
                    + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (engagementRepository.existsByNumeroEngagementAndCollectiviteId(numero, collectiviteId));
        return numero;
    }
}
