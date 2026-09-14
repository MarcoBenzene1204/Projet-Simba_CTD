package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.repository.RegieAvancesRepository;
import com.marco.Simba_CTD.repository.ApurementRegieRepository;
import com.marco.Simba_CTD.repository.DépenseRegieRepository;
import com.marco.Simba_CTD.entity.RegieAvances;
import com.marco.Simba_CTD.entity.DepenseRegie;
import com.marco.Simba_CTD.entity.ApurementRegie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service pour gérer les régies d'avances (FC-DEP-006)
 * 
 * Processus:
 * 1. Création régie avec délibération approuvée et plafond
 * 2. Saisie dépenses par régisseur (dans limite plafond)
 * 3. Justificatifs joints
 * 4. Apurement trimestriel/semestriel
 * 5. Visa CF
 * 6. Ordonnancement dépenses
 * 7. Receveur reconstitue avance
 * 8. Clôture en fin d'exercice
 * 9. Reversement solde
 * Contrôles continus:
 * - Plafond autorisé non dépassé (BLOQUANT - RG-DEP-025)
 * - Nature de dépenses autorisée (RG-DEP-026)
 * - Apurement obligatoire avant ordonnancement (RG-DEP-027)
 * - Clôture obligatoire fin d'exercice (RG-DEP-028)
 */
@Service
@Transactional
public class RegieAvancesService {

    @Autowired
    private RegieAvancesRepository regieAvancesRepository;

    @Autowired
    private ApurementRegieRepository apurementRegieRepository;

    @Autowired
    private DépenseRegieRepository dépenseRegieRepository;

    /**
     * Crée une nouvelle régie d'avances
     * 
     * Conditions:
     * - Délibération approuvée avec montant plafond
     * - Régisseur accrédité dans le système
     * @param regisseurId ID du régisseur
     * @param montantPlafond Montant plafond autorisé
     * @param naturesAutorisees Énumération des natures autorisées
     * @param numeroDeliberation Numéro de la délibération
     * @param dateDeliberation Date de la délibération
     * @return RegieAvances créée
     */
    public RegieAvances creerRegieAvances(UUID regisseurId, 
                                          BigDecimal montantPlafond,
                                          String naturesAutorisees,
                                          String numeroDeliberation,
                                          LocalDate dateDeliberation) {
        // Vérification que le régisseur est accrédité
        if (!estRegisseurAccredite(regisseurId)) {
            throw new IllegalStateException("Régisseur non accrédité dans le système");
        }
        
        // Vérification que la délibération existe et est approuvée
        if (!deliberationApprouvee(numeroDeliberation)) {
            throw new IllegalStateException("Délibération doit être approuvée avec montant plafond autorisé");
        }

        RegieAvances regieavances = new RegieAvances(regisseurId, montantPlafond, naturesAutorisees);
        regieavances.setNumeroDélibération(numeroDeliberation);
        regieavances.setDateDélibération(dateDeliberation);
        regieavances.setDateApprovalDélibération(LocalDate.now());
        regieavances.setNumeroRegie(genererNumeroRegie());
        regieavances.setPeriodicite(RegieAvances.PeriodiciteApurement.TRIMESTRIELLE);
        return regieAvancesRepository.save(regieavances);
    }

    /**
     * Génère un numéro de régie unique
     */
    private String genererNumeroRegie() {
        return "REG-" + LocalDate.now().toString().replace("-", "") + "-" +
               UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    /**
     * Ajoute une dépense à la régie
     * Vérifications (RG-DEP-025 et RG-DEP-026):
     * - Nature autorisée par délibération
     * - Montant n'entraîne pas dépassement du plafond
     * @param regieId ID de la régie
     * @param nature Nature de la dépense
     * @param montant Montant de la dépense
     * @param description Description
     * @return DépenseRegie créée
     */
    public DepenseRegie ajouterDépense(UUID regieId, String nature, BigDecimal montant, String description) {
        RegieAvances regieavances = regieAvancesRepository.findById(regieId)
            .orElseThrow(() -> new IllegalArgumentException("Régie introuvable"));

        if (regieavances.getEtat() != RegieAvances.EtatRegie.ACTIVE) {
            throw new IllegalStateException("Régie doit être active pour ajouter des dépenses");
        }

        // Création de la dépense
        DepenseRegie dépense = new DepenseRegie();
        dépense.setRegieAvances(regieavances);
        dépense.setNature(nature);
        dépense.setMontant(montant);
        dépense.setDescription(description);
        dépense.setDateDepense(LocalDate.now());
        dépense.setEtat(DepenseRegie.EtatDepense.SAISIE);

        try {
            // Ajout à la régie (contrôle plafond et nature)
            regieavances.ajouterDepense(dépense);
            
            // Sauvegarde
            dépenseRegieRepository.save(dépense);
            regieAvancesRepository.save(regieavances);
            return dépense;
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        }
    }

    /**
     * Joint les justificatifs à une dépense
     * @param dépenseId ID de la dépense
     * @param urlJustificatifs URL des justificatifs (fichier uploadé)
     */
    public void joindreJustificatifs(UUID dépenseId, String urlJustificatifs) {
        DepenseRegie dépense = dépenseRegieRepository.findById(dépenseId)
            .orElseThrow(() -> new IllegalArgumentException("Dépense introuvable"));
        dépense.setUrlJustificatifs(urlJustificatifs);
        dépenseRegieRepository.save(dépense);
    }

    /**
     * Crée un apurement de la régie
     * Conforme à RG-DEP-027: Apurement trimestriel ou semestriel obligatoire avant ordonnancement
     * @param regieId ID de la régie
     * @param datePeriode Date de la période
     */
    public ApurementRegie creerApurement(UUID regieId, LocalDate datePeriode) {
        RegieAvances regieavances = regieAvancesRepository.findById(regieId)
            .orElseThrow(() -> new IllegalArgumentException("Régie introuvable"));

        if (regieavances.getEtat() != RegieAvances.EtatRegie.ACTIVE) {
            throw new IllegalStateException("Régie doit être active pour apurement");
        }

        // Calcul montant total des dépenses non encore apurées
        BigDecimal montantAPurer = regieavances.getMontantEngages()
            .subtract(regieavances.getMontantAutorises());

        ApurementRegie apurement = new ApurementRegie();
        apurement.setRegieavances(regieavances);
        apurement.setDatePeriode(datePeriode);
        apurement.setMontantSoumis(montantAPurer);
        apurement.setEtat(ApurementRegie.EtatApurement.EN_COURS);

        apurementRegieRepository.save(apurement);
        regieavances.setEtat(RegieAvances.EtatRegie.EN_APUREMENT);
        regieAvancesRepository.save(regieavances);
        return apurement;
    }

    /**
     * Appose le visa du CF sur l'apurement
     * Conforme à RG-DEP-027
     * @param apurementId ID de l'apurement
     * @param controllerFinancierVisaId ID du CF
     */
    public void apporterVisaCFApurement(UUID apurementId, UUID controllerFinancierVisaId) {
        ApurementRegie apurement = apurementRegieRepository.findById(apurementId)
            .orElseThrow(() -> new IllegalArgumentException("Apurement introuvable"));

        if (apurement.getEtat() != ApurementRegie.EtatApurement.EN_COURS) {
            throw new IllegalStateException("Apurement doit être en cours");
        }

        apurement.setControllerFinancierVisaId(controllerFinancierVisaId);
        apurement.setDateVisaCF(LocalDateTime.now());
        apurement.setEtat(ApurementRegie.EtatApurement.VISEE_CF);
        apurementRegieRepository.save(apurement);

        // Mise à jour régie
        RegieAvances regieavances = apurement.getRegieavances();
        BigDecimal montantAutorises = regieavances.getMontantAutorises()
            .add(apurement.getMontantSoumis());
        regieavances.setMontantAutorises(montantAutorises);
        regieavances.setEtat(RegieAvances.EtatRegie.ACTIVE);
        regieAvancesRepository.save(regieavances);
    }

    /**
     * Reconstitue l'avance après ordonnancement
     * @param regieId ID de la régie
     * @param montantReconstitution Montant à reconstituer
     */
    public void reconstituerAvance(UUID regieId, BigDecimal montantReconstitution) {
        RegieAvances regieavances = regieAvancesRepository.findById(regieId)
            .orElseThrow(() -> new IllegalArgumentException("Régie introuvable"));
        try {
            regieavances.reconstituerAvance(montantReconstitution);
            regieAvancesRepository.save(regieavances);
        } catch (IllegalArgumentException e) {
            throw e;
        }
    }

    /**
     * Contrôle que le plafond de la régie n'est pas dépassé
     * Effectué en continu lors de l'ajout de dépenses
     */
    public boolean verifierPlafondNonDepassé(UUID regieId) {
        RegieAvances regieavances = regieAvancesRepository.findById(regieId)
            .orElseThrow(() -> new IllegalArgumentException("Régie introuvable"));
        return regieavances.getMontantEngages().compareTo(regieavances.getMontantPlafond()) <= 0;
    }

    /**
     * Clôt la régie en fin d'exercice
     * Conforme à RG-DEP-028
     */
    public void clotureExercice(UUID regieId) {
        RegieAvances regieavances = regieAvancesRepository.findById(regieId)
            .orElseThrow(() -> new IllegalArgumentException("Régie introuvable"));

        if (regieavances.getEtat() == RegieAvances.EtatRegie.FERMEE) {
            throw new IllegalStateException("Régie est déjà fermée");
        }
        try {
            regieavances.clotureExercice();
            regieAvancesRepository.save(regieavances);
        } catch (IllegalStateException e) {
            throw e;
        }
    }

    /**
     * Effectue le reversement du solde au Receveur
     */
    public void effectuerReversement(UUID regieId) {
        RegieAvances regieavances = regieAvancesRepository.findById(regieId)
            .orElseThrow(() -> new IllegalArgumentException("Régie introuvable"));

        if (!Boolean.TRUE.equals(regieavances.getRegieClotureExercice())) {
            throw new IllegalStateException("Régie doit être clôturée avant reversement");
        }
        try {
            regieavances.effectuerReversement();
            regieAvancesRepository.save(regieavances);
        } catch (IllegalStateException e) {
            throw e;
        }
    }

    /**
     * Récupère une régie par son ID
     */
    public RegieAvances obtenirRegie(UUID regieId) {
        return regieAvancesRepository.findById(regieId)
                .orElseThrow(() -> new IllegalArgumentException("Régie introuvable"));
    }

    /**
     * Liste toutes les régies actives du régisseur
     */
    public List<RegieAvances> listerRegiesRegisseur(UUID regisseurId) {
        return regieAvancesRepository.findByRegisseurIdAndEtat(
            regisseurId, RegieAvances.EtatRegie.ACTIVE);
    }

    /*
     * Liste les régies à clôturer en fin d'exercice
     */
    public List<RegieAvances> listerRegiesClotureExercice() {
        return regieAvancesRepository.findByRegieClotureExerciceFalse();
    }

    /**
     * Gère les alertes de fin d'exercice
     * Conforme à RG-DEP-028
     */
    public void gererAlertesClotureExercice() {
        List<RegieAvances> regieNonClot = listerRegiesClotureExercice();
        LocalDate finExercice = LocalDate.of(LocalDate.now().getYear(), 12, 31);
        LocalDate alerteDate = finExercice.minusDays(15);
        if (LocalDate.now().isEqual(alerteDate) || LocalDate.now().isAfter(alerteDate)) {
            for (RegieAvances regieavances : regieNonClot) {
                System.out.println("ALERTE CLÔTURE: Régie " + regieavances.getNumeroRegie() +
                        " doit être clôturée avant fin d'exercice");
            }
        }
    }

    // Vérifie si un régisseur est accrédité
    private boolean estRegisseurAccredite(UUID regisseurId) {
        // À implémenter selon la base de données des utilisateurs
        return true;
    }

    /**
     * Vérifie si une délibération est approuvée
     */
    private boolean deliberationApprouvee(String numeroDeliberation) {
        // À implémenter selon la base de données des délibérations
        return true;
    }
}
