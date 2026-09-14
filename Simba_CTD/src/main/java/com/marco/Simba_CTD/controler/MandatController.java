package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.entity.Mandat;
import com.marco.Simba_CTD.service.MandatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mandats")
public class MandatController {

    private final MandatService mandatService;

    public MandatController(
            MandatService mandatService) {
        this.mandatService = mandatService;
    }

    // =========================================================
    // CREATION
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('mandat:creer')")
    public ResponseEntity<Mandat> creer(
            @RequestParam UUID exerciceId,
            @RequestParam Mandat.TypeMandat typeMandat,
            @RequestBody List<UUID> liquidationIds,
            Authentication authentication) {

        Mandat mandat = mandatService.creerMandat(
                exerciceId,
                typeMandat,
                liquidationIds,
                authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mandat);
    }

    // =========================================================
    // LISTE
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('mandat:lire')")
    public ResponseEntity<List<Mandat>> lister(
            Authentication authentication) {

        return ResponseEntity.ok(
                mandatService.listerMandats(
                        authentication));
    }

    // =========================================================
    // DETAIL
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('mandat:lire')")
    public ResponseEntity<Mandat> obtenir(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                mandatService.obtenirMandat(
                        id,
                        authentication));
    }

    // =========================================================
    // SOUMISSION CF
    // =========================================================

    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasAuthority('mandat:soumettre')")
    public ResponseEntity<Mandat> soumettre(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                mandatService.soumettreAuControleurFinancier(
                        id,
                        authentication));
    }

    // =========================================================
    // VISA CF
    // =========================================================

    @PostMapping("/{id}/visa")
    @PreAuthorize("hasAuthority('mandat:valider')")
    public ResponseEntity<Mandat> visa(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                mandatService.apposeVisaCFEtCachet(
                        id,
                        authentication));
    }

    // =========================================================
    // REJET
    // =========================================================

    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAuthority('mandat:rejeter')")
    public ResponseEntity<Mandat> rejeter(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                mandatService.rejeterMandat(
                        id,
                        authentication));
    }

    // =========================================================
    // TRANSMISSION RECEVEUR
    // =========================================================

    @PostMapping("/{id}/transmettre-receveur")
    @PreAuthorize("hasAuthority('mandat:transmettre_receveur')")
    public ResponseEntity<Mandat> transmettreReceveur(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                mandatService.transmettreAuReceveur(
                        id,
                        authentication));
    }
}