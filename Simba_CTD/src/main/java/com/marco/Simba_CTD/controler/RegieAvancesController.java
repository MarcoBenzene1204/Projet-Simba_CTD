package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.entity.RegieAvances;
import com.marco.Simba_CTD.security.SecurityContextService;
import com.marco.Simba_CTD.service.RegieAvancesService;
import com.marco.Simba_CTD.entity.ApurementRegie;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/regies-avances")
public class RegieAvancesController {

    private final RegieAvancesService regieAvancesService;
    private final SecurityContextService securityContextService;

    public RegieAvancesController(
            RegieAvancesService regieAvancesService,
            SecurityContextService securityContextService) {
        this.regieAvancesService = regieAvancesService;
        this.securityContextService = securityContextService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('REGISSEUR', 'ORDONNATEUR', 'ADMINISTRATEUR')")
    public List<RegieResponse> listMyRegies() {
        return regieAvancesService.listerRegiesRegisseur(
          securityContextService.getCurrentUserId())
            .stream()
            .map(RegieResponse::from)
            .toList();
    }

    @GetMapping("/apurements")
    @PreAuthorize("hasRole('CONTROLEUR_FINANCIER') and hasAuthority('regie:apurer')")
    public List<ApurementResponse> listerApurements() {
        UUID collectiviteId = securityContextService.getCurrentCollectiviteId();
        return regieAvancesService.listerApurementsCollectivite(collectiviteId)
                .stream().map(ApurementResponse::from).toList();
    }

    @PutMapping("/apurements/{id}/visa-cf")
    @PreAuthorize("hasRole('CONTROLEUR_FINANCIER') and hasAuthority('regie:apurer')")
    public ApurementResponse viserApurement(@PathVariable UUID id) {
        ApurementRegie saved = regieAvancesService.apporterVisaCFApurement(
                id,
                securityContextService.getCurrentCollectiviteId(),
                securityContextService.getCurrentUserId());
        return ApurementResponse.from(saved);
    }

    public record RegieResponse(
            UUID id,
            String numeroRegie,
            LocalDate dateCreation,
            String periodicite,
            BigDecimal montantPlafond,
            BigDecimal montantEngages,
            BigDecimal montantAutorises,
            BigDecimal soldeDisponible,
            String naturesAutorisees,
            String etat,
            Boolean regieClotureExercice) {

        static RegieResponse from(RegieAvances regie) {
            return new RegieResponse(
                    regie.getId(),
                    regie.getNumeroRegie(),
                    regie.getDateCreation(),
                    regie.getPeriodicite().name(),
                    regie.getMontantPlafond(),
                    regie.getMontantEngages(),
                    regie.getMontantAutorises(),
                    regie.getSoldeDisponible(),
                    regie.getNaturesAutorisees(),
                    regie.getEtat().name(),
                    regie.getRegieClotureExercice());
        }
    }

    public record ApurementResponse(UUID id, UUID regieId, String numeroRegie, LocalDate datePeriode,
            BigDecimal montantSoumis, String etat, LocalDateTime dateVisaCF) {
        static ApurementResponse from(ApurementRegie apurement) {
            return new ApurementResponse(apurement.getId(), apurement.getRegieavances().getId(),
                    apurement.getRegieavances().getNumeroRegie(), apurement.getDatePeriode(),
                    apurement.getMontantSoumis(), apurement.getEtat().name(), apurement.getDateVisaCF());
        }
    }
}
