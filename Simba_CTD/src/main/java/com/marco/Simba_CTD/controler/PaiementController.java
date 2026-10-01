package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.entity.Paiement;
import com.marco.Simba_CTD.service.PaiementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/paiements")
public class PaiementController {

    private final PaiementService paiementService;

    public PaiementController(
            PaiementService paiementService) {
        this.paiementService = paiementService;
    }

    // =========================================================
    // CREATION
    // =========================================================

    @PostMapping("/mandat/{mandatId}")
        @PreAuthorize("hasRole('RECEVEUR') and hasAuthority('paiement:creer')")
    public ResponseEntity<Paiement> creer(
            @PathVariable UUID mandatId,
            @RequestParam Paiement.ModeReglement modeReglement,
            @RequestParam(required = false) LocalDate dateProgrammee,
            Authentication authentication) {

        Paiement paiement = paiementService.creerPaiement(
                mandatId,
                modeReglement,
                dateProgrammee,
                authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paiement);
    }

    @GetMapping("/mandats-a-payer")
    @PreAuthorize("hasRole('RECEVEUR') and hasAuthority('paiement:lire')")
    public List<MandatDisponibleResponse> mandatsAPayer(Authentication authentication) {
        UUID collectiviteId = securityContextCollectivite();
        return paiementService.listerMandatsAProgrammer(collectiviteId).stream()
                .map(mandat -> new MandatDisponibleResponse(mandat.getId(), mandat.getNumeroMandat(),
                        mandat.getTypeMandat().name(), mandat.getMontantTTCMandate(), mandat.getDateMandatement(),
                        paiementService.mandatRequiertCosignature(mandat)))
                .toList();
    }

    // =========================================================
    // DEMARRER EXECUTION
    // =========================================================

    @PostMapping("/{id}/demarrer")
        @PreAuthorize("hasRole('RECEVEUR') and hasAuthority('paiement:executer')")
    public ResponseEntity<Paiement> demarrer(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.demarrerExecution(
                        id,
                        authentication));
    }

        @PostMapping("/{id}/cosigner")
        @PreAuthorize("hasRole('COSIGNATAIRE') and hasAuthority('paiement:cosigner')")
        public ResponseEntity<Paiement> cosigner(@PathVariable UUID id, Authentication authentication) {
                return ResponseEntity.ok(paiementService.cosignerPaiement(id, authentication));
        }

    // =========================================================
    // EXECUTER
    // =========================================================

    @PostMapping("/{id}/executer")
    @PreAuthorize("hasRole('RECEVEUR') and hasAuthority('paiement:executer')")
    public ResponseEntity<Paiement> executer(
            @PathVariable UUID id,
            @RequestBody(required = false) PaiementExecutionRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.executerPaiement(
                        id,
                        request == null ? null : request.referenceBancaire(),
                        request == null ? null : request.referenceCheque(),
                        authentication));
    }

    @PostMapping("/{id}/differe")
    @PreAuthorize("hasRole('RECEVEUR') and hasAuthority('paiement:executer')")
    public ResponseEntity<Paiement> differer(
            @PathVariable UUID id,
            @RequestBody PaiementDifferementRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(paiementService.differerPaiement(id, request.justification(), authentication));
    }

    // =========================================================
    // ECHEC
    // =========================================================

    @PostMapping("/{id}/echec")
        @PreAuthorize("hasRole('RECEVEUR') and hasAuthority('paiement:rejeter')")
    public ResponseEntity<Paiement> echouer(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.echouerPaiement(
                        id,
                        authentication));
    }

        private UUID securityContextCollectivite() {
                return com.marco.Simba_CTD.config.TenantContext.requireTenant();
        }

        public record PaiementExecutionRequest(String referenceBancaire, String referenceCheque) {}

        public record PaiementDifferementRequest(String justification) {}

        public record MandatDisponibleResponse(UUID id, String numeroMandat, String typeMandat,
                        BigDecimal montantTTCMandate, LocalDate dateMandatement, boolean doubleSignatureRequise) {}

    // =========================================================
    // DETAIL
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('paiement:lire')")
    public ResponseEntity<Paiement> obtenir(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.obtenirPaiement(
                        id,
                        authentication));
    }

    // =========================================================
    // LISTE
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('paiement:lire')")
    public ResponseEntity<List<Paiement>> lister(
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.listerPaiements(
                        authentication));
    }

    // =========================================================
    // PAIEMENTS D'UN MANDAT
    // =========================================================

    @GetMapping("/mandat/{mandatId}")
    @PreAuthorize("hasAuthority('paiement:lire')")
    public ResponseEntity<List<Paiement>> listerParMandat(
            @PathVariable UUID mandatId,
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.listerPaiementsMandat(
                        mandatId,
                        authentication));
    }
}