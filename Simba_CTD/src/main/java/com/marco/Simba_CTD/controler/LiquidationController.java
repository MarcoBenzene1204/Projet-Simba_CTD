package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.entity.Liquidation;
import com.marco.Simba_CTD.service.LiquidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/liquidations")
public class LiquidationController {

        private final LiquidationService liquidationService;

        public LiquidationController(
                        LiquidationService liquidationService) {
                this.liquidationService = liquidationService;
        }

        // =========================================================
        // CREATION
        // =========================================================

        @PostMapping("/engagement/{engagementId}")
        @PreAuthorize("hasAuthority('liquidation:creer')")
        public ResponseEntity<Liquidation> creer(
                        @PathVariable UUID engagementId,
                        @RequestBody Liquidation liquidation,
                        Authentication authentication) {

                Liquidation resultat = liquidationService.creerLiquidation(
                                engagementId,
                                liquidation,
                                authentication);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(resultat);
        }

        // =========================================================
        // ATTESTATION SERVICE FAIT
        // =========================================================

        @PostMapping("/{id}/service-fait")
        @PreAuthorize("hasAuthority('liquidation:attester_service_fait')")
        public ResponseEntity<Liquidation> attesterServiceFait(
                        @PathVariable UUID id,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.attesterServiceFait(
                                                id,
                                                authentication));
        }

        // =========================================================
        // CONFORMITE FISCALE
        // =========================================================

        @PostMapping("/{id}/conformite-fiscale")
        @PreAuthorize("hasAuthority('liquidation:valider_conformite')")
        public ResponseEntity<Liquidation> validerConformiteFiscale(
                        @PathVariable UUID id,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.validerConformiteFiscale(
                                                id,
                                                authentication));
        }

        // =========================================================
        // SOUMISSION CF
        // =========================================================

        @PostMapping("/{id}/soumettre")
        @PreAuthorize("hasAuthority('liquidation:soumettre')")
        public ResponseEntity<Liquidation> soumettre(
                        @PathVariable UUID id,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.soumettreAuControleurFinancier(
                                                id,
                                                authentication));
        }

        // =========================================================
        // VALIDATION CF
        // =========================================================

        @PostMapping("/{id}/valider")
        @PreAuthorize("hasAuthority('liquidation:valider')")
        public ResponseEntity<Liquidation> valider(
                        @PathVariable UUID id,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.validerParControleur(
                                                id,
                                                authentication));
        }

        // =========================================================
        // REJET
        // =========================================================

        @PostMapping("/{id}/rejeter")
        @PreAuthorize("hasAuthority('liquidation:rejeter')")
        public ResponseEntity<Liquidation> rejeter(
                        @PathVariable UUID id,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.rejeter(
                                                id,
                                                authentication));
        }

        // =========================================================
        // PREPARATION ORDONNANCEMENT
        // =========================================================

        @PostMapping("/{id}/preparer-ordonnancement")
        @PreAuthorize("hasAuthority('liquidation:preparer_ordonnancement')")
        public ResponseEntity<Liquidation> preparerOrdonnancement(
                        @PathVariable UUID id,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.preparerPourOrdonnancement(
                                                id,
                                                authentication));
        }

        // =========================================================
        // RECUPERATION
        // =========================================================

        @GetMapping("/{id}")
        @PreAuthorize("hasAuthority('liquidation:lire')")
        public ResponseEntity<Liquidation> obtenir(
                        @PathVariable UUID id,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.obtenirLiquidation(
                                                id,
                                                authentication));
        }

        // =========================================================
        // LISTE
        // =========================================================

        @GetMapping
        @PreAuthorize("hasAuthority('liquidation:lire')")
        public ResponseEntity<List<Liquidation>> lister(
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.listerLiquidations(
                                                authentication));
        }

        // =========================================================
        // LIQUIDATIONS D'UN ENGAGEMENT
        // =========================================================

        @GetMapping("/engagement/{engagementId}")
        @PreAuthorize("hasAuthority('liquidation:lire')")
        public ResponseEntity<List<Liquidation>> listerParEngagement(
                        @PathVariable UUID engagementId,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                liquidationService.listerParEngagement(
                                                engagementId,
                                                authentication));
        }

        // =========================================================
        // SUPPRESSION
        // =========================================================

        @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('liquidation:supprimer')")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void supprimer(
                        @PathVariable UUID id,
                        Authentication authentication) {

                liquidationService.supprimer(
                                id,
                                authentication);
        }
}