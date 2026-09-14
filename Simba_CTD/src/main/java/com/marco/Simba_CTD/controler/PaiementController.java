package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.entity.Paiement;
import com.marco.Simba_CTD.service.PaiementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    @PreAuthorize("hasAuthority('paiement:creer')")
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

    // =========================================================
    // DEMARRER EXECUTION
    // =========================================================

    @PostMapping("/{id}/demarrer")
    @PreAuthorize("hasAuthority('paiement:executer')")
    public ResponseEntity<Paiement> demarrer(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.demarrerExecution(
                        id,
                        authentication));
    }

    // =========================================================
    // EXECUTER
    // =========================================================

    @PostMapping("/{id}/executer")
    @PreAuthorize("hasAuthority('paiement:executer')")
    public ResponseEntity<Paiement> executer(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.executerPaiement(
                        id,
                        authentication));
    }

    // =========================================================
    // ECHEC
    // =========================================================

    @PostMapping("/{id}/echec")
    @PreAuthorize("hasAuthority('paiement:echouer')")
    public ResponseEntity<Paiement> echouer(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                paiementService.echouerPaiement(
                        id,
                        authentication));
    }

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