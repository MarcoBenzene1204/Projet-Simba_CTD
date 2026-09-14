package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.entity.Engagement;
import com.marco.Simba_CTD.service.EngagementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/engagements")
public class EngagementController {

    private final EngagementService engagementService;

    public EngagementController(
            EngagementService engagementService) {
        this.engagementService = engagementService;
    }

    // =========================================================
    // CREATION
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('engagement:creer')")
    public ResponseEntity<Engagement> creer(
            @RequestBody Engagement engagement,
            Authentication authentication) {

        Engagement resultat = engagementService.creerEngagement(
                engagement,
                authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resultat);
    }

    // =========================================================
    // SOUMISSION AU CONTROLEUR FINANCIER
    // =========================================================

    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasAuthority('engagement:soumettre')")
    public ResponseEntity<Engagement> soumettre(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                engagementService.soumettreAuControleurFinancier(
                        id,
                        authentication));
    }

    // =========================================================
    // VISA DU CONTROLEUR FINANCIER
    // =========================================================

    @PostMapping("/{id}/visa")
    @PreAuthorize("hasAuthority('engagement:valider')")
    public ResponseEntity<Engagement> apposerVisa(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                engagementService.apposerVisa(
                        id,
                        authentication));
    }

    // =========================================================
    // REJET
    // =========================================================

    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAuthority('engagement:rejeter')")
    public ResponseEntity<Engagement> rejeter(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestParam String motif) {

        return ResponseEntity.ok(
                engagementService.rejeter(
                        id,
                        motif,
                        authentication));
    }

    // =========================================================
    // CONFIRMATION
    // =========================================================

    @PostMapping("/{id}/confirmer")
    @PreAuthorize("hasAuthority('engagement:confirmer')")
    public ResponseEntity<Engagement> confirmer(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                engagementService.confirmer(
                        id,
                        authentication));
    }

    // =========================================================
    // RECUPERATION
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('engagement:lire')")
    public ResponseEntity<Engagement> obtenir(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                engagementService.obtenirEngagement(
                        id,
                        authentication));
    }

    // =========================================================
    // LISTE
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('engagement:lire')")
    public ResponseEntity<List<Engagement>> lister(
            Authentication authentication) {

        return ResponseEntity.ok(
                engagementService.listerEngagements(
                        authentication));
    }
}