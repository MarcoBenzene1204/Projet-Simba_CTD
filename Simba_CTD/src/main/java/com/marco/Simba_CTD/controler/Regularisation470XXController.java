package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.Enum.EtatRegularisation;
import com.marco.Simba_CTD.entity.Regularisation470XX;
import com.marco.Simba_CTD.service.Regularisation470XXService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/regularisations")
public class Regularisation470XXController {

    private final Regularisation470XXService service;

    public Regularisation470XXController(
            Regularisation470XXService service) {
        this.service = service;
    }

    // ============================================================
    // LECTURE
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAuthority('regularisation:lire')")
    public ResponseEntity<List<Regularisation470XX>> findAll() {

        return ResponseEntity.ok(
                service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('regularisation:lire')")
    public ResponseEntity<Regularisation470XX> findById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                service.findById(id));
    }

    @GetMapping("/etat/{etat}")
    @PreAuthorize("hasAuthority('regularisation:lire')")
    public ResponseEntity<List<Regularisation470XX>> findByEtat(
            @PathVariable EtatRegularisation etat) {

        return ResponseEntity.ok(
                service.findByEtat(etat));
    }

    // ============================================================
    // DETECTION
    // ============================================================

    @PostMapping
    @PreAuthorize("hasAuthority('regularisation:creer')")
    public ResponseEntity<Regularisation470XX> creer(
            @RequestBody Regularisation470XX regularisation) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.creerDetection(regularisation));
    }

    // ============================================================
    // NOTIFICATION
    // ============================================================

        @PostMapping("/{id}/comptabiliser-470xx")
        @PreAuthorize("hasAuthority('regularisation:comptabiliser')")
        public ResponseEntity<Regularisation470XX> comptabiliser(
                        @PathVariable UUID id,
                        @RequestParam String numeroEcriture) {

                return ResponseEntity.ok(
                                service.comptabiliserCompte470XX(id, numeroEcriture));
        }

    @PostMapping("/{id}/notifier-ordonnateur")
    @PreAuthorize("hasAuthority('regularisation:notifier')")
    public ResponseEntity<Regularisation470XX> notifierOrdonnateur(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                service.notifierOrdonnateur(id));
    }

    // ============================================================
    // ENGAGEMENT RETROSPECTIF
    // ============================================================

    @PostMapping("/{id}/engagement")
    @PreAuthorize("hasAuthority('regularisation:engager')")
    public ResponseEntity<Regularisation470XX> enregistrerEngagement(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                                service.creerEngagementRetrospectif(id));
    }

        @PostMapping("/{id}/reserver-credits")
        @PreAuthorize("hasAuthority('regularisation:engager')")
        public ResponseEntity<Regularisation470XX> reserverCredits(
                        @PathVariable UUID id) {

                return ResponseEntity.ok(service.reserverCreditsEngagement(id));
        }

    // ============================================================
    // SOUMISSION CF
    // ============================================================

    @PostMapping("/{id}/soumettre-cf")
    @PreAuthorize("hasAuthority('regularisation:soumettre')")
    public ResponseEntity<Regularisation470XX> soumettreCF(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                service.soumettreEngagementAuCF(id));
    }

    // ============================================================
    // VISA CF
    // ============================================================

    @PostMapping("/{id}/viser-cf")
    @PreAuthorize("hasAuthority('regularisation:valider')")
    public ResponseEntity<Regularisation470XX> viserCF(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                service.viserParCF(id));
    }

    // ============================================================
    // REJET CF
    // ============================================================

    @PostMapping("/{id}/rejeter-cf")
    @PreAuthorize("hasAuthority('regularisation:rejeter')")
    public ResponseEntity<Regularisation470XX> rejeterCF(
            @PathVariable UUID id,
            @RequestParam String motif) {

        return ResponseEntity.ok(
                service.rejeterParCF(id, motif));
    }

    // ============================================================
    // LIQUIDATION
    // ============================================================

    @PostMapping("/{id}/liquider")
    @PreAuthorize("hasAuthority('regularisation:liquider')")
    public ResponseEntity<Regularisation470XX> liquider(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                service.marquerCommeLiquidee(id));
    }

    // ============================================================
    // MANDAT
    // ============================================================

    @PostMapping("/{id}/mandater")
    @PreAuthorize("hasAuthority('regularisation:mandater')")
    public ResponseEntity<Regularisation470XX> mandater(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                service.marquerCommeMandatee(id));
    }

    // ============================================================
    // CONTREPASSATION
    // ============================================================

    @PostMapping("/{id}/contrepasser")
    @PreAuthorize("hasAuthority('regularisation:contrepasser')")
    public ResponseEntity<Regularisation470XX> contrepasser(
            @PathVariable UUID id,
            @RequestParam String numeroEcriture) {

        return ResponseEntity.ok(
                service.contrepasser(
                        id,
                        numeroEcriture));
    }

    // ============================================================
    // REGULARISATION FINALE
    // ============================================================

    @PostMapping("/{id}/regulariser")
    @PreAuthorize("hasAuthority('regularisation:regulariser')")
    public ResponseEntity<Regularisation470XX> regulariser(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                service.regulariser(id));
    }
}