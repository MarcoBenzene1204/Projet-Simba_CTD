package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.Enum.EtatRegularisation;
import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.entity.Regularisation470XX;
import com.marco.Simba_CTD.repository.EngagementRepository;
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

    private final EngagementRepository engagementRepository;
    private final CurrentUserService currentUserService;
    private final DocumentM5Service documentM5Service;

    public EngagementService(
            EngagementRepository engagementRepository,
            CurrentUserService currentUserService,
            DocumentM5Service documentM5Service) {
        this.engagementRepository = engagementRepository;
        this.currentUserService = currentUserService;
        this.documentM5Service = documentM5Service;
    }

    @PreAuthorize("hasAuthority('engagement:creer')")
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

    @PreAuthorize("hasAuthority('engagement:soumettre')")
    public Engagement soumettreAuControleurFinancier(UUID id, Authentication authentication) {
        Engagement engagement = obtenirDansTenant(id);
        verifierUtilisateurActif();
        validerReferenceM5Obligatoire(engagement);
        engagement.reserverCredits();
        engagement.soumettreAuControleurFinancier();
        return engagementRepository.save(engagement);
    }

    @PreAuthorize("hasAuthority('engagement:valider')")
    public Engagement apposerVisa(UUID id, Authentication authentication) {
        Engagement engagement = obtenirDansTenant(id);
        verifierUtilisateurActif();
        engagement.apposerVisa(currentUserService.getUtilisateur().getId());
        return engagementRepository.save(engagement);
    }

    @PreAuthorize("hasAuthority('engagement:rejeter')")
    public Engagement rejeter(UUID id, String motif, Authentication authentication) {
        Engagement engagement = obtenirDansTenant(id);
        verifierUtilisateurActif();
        engagement.rejeter(motif);
        return engagementRepository.save(engagement);
    }

    @PreAuthorize("hasAuthority('engagement:confirmer')")
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
        return engagementRepository.findByOrdonnatorIdAndCollectiviteId(
                currentUserService.getUtilisateur().getId(), collectiviteId);
    }

    public void validerEtRéserverCrédits(UUID id) {
        Engagement engagement = obtenirDansTenant(id);
        engagement.reserverCredits();
        engagementRepository.save(engagement);
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

        if (engagement.getDocumentM5Id() == null || !documentM5Service.documentExiste(engagement.getDocumentM5Id())) {
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
