package com.marco.Simba_CTD.controler;

import com.marco.Simba_CTD.service.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/referentiels")
public class ReferentielController {

    private final JdbcTemplate jdbcTemplate;
    private final CurrentUserService currentUserService;

    public ReferentielController(JdbcTemplate jdbcTemplate, CurrentUserService currentUserService) {
        this.jdbcTemplate = jdbcTemplate;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/exercice-courant")
    @PreAuthorize("isAuthenticated()")
    public ExerciceResponse exerciceCourant() {
        UUID collectiviteId = currentUserService.requireTenantId();
        return jdbcTemplate.query(
                "SELECT id, annee FROM exercices_budgetaires WHERE collectivite_id = ? AND actif = TRUE AND cloture = FALSE ORDER BY annee DESC LIMIT 1",
                (resultSet, rowNum) -> new ExerciceResponse(
                        resultSet.getObject("id", UUID.class),
                        resultSet.getInt("annee")),
                collectiviteId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Aucun exercice budgétaire actif n'est configuré pour cette collectivité."));
    }

    @GetMapping("/fournisseurs")
    @PreAuthorize("hasAnyRole('SUPER_ADMINISTRATEUR', 'ADMINISTRATEUR', 'ORDONNATEUR', 'CHEF_SERVICE')")
    public List<FournisseurResponse> fournisseurs() {
        UUID collectiviteId = currentUserService.requireTenantId();
        return jdbcTemplate.query(
                "SELECT id, code, raison_sociale, numero_contribuable, compte_bancaire, actif FROM tiers WHERE collectivite_id = ? AND actif = TRUE ORDER BY raison_sociale",
                (resultSet, rowNum) -> new FournisseurResponse(
                        resultSet.getObject("id", UUID.class),
                    resultSet.getString("code"),
                        resultSet.getString("raison_sociale"),
                        resultSet.getString("numero_contribuable"),
                    resultSet.getString("compte_bancaire"),
                    resultSet.getBoolean("actif")),
                collectiviteId);
    }

            @GetMapping("/tiers")
            @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'SUPER_ADMINISTRATEUR') and hasAuthority('parametrage:lire')")
            public List<FournisseurResponse> tiers() {
            UUID collectiviteId = currentUserService.requireTenantId();
            return jdbcTemplate.query(
                "SELECT id, code, raison_sociale, numero_contribuable, compte_bancaire, actif FROM tiers WHERE collectivite_id = ? ORDER BY raison_sociale",
                (resultSet, rowNum) -> new FournisseurResponse(
                    resultSet.getObject("id", UUID.class),
                    resultSet.getString("code"),
                    resultSet.getString("raison_sociale"),
                    resultSet.getString("numero_contribuable"),
                    resultSet.getString("compte_bancaire"),
                    resultSet.getBoolean("actif")),
                collectiviteId);
            }

            @PatchMapping("/tiers/{id}/desactiver")
            @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'SUPER_ADMINISTRATEUR') and hasAuthority('parametrage:modifier')")
            public FournisseurResponse desactiverTiers(@PathVariable UUID id) {
            UUID collectiviteId = currentUserService.requireTenantId();
            int updated = jdbcTemplate.update(
                "UPDATE tiers SET actif = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND collectivite_id = ? AND actif = TRUE",
                id, collectiviteId);
            if (updated == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Le tiers est introuvable ou déjà désactivé.");
            }
            return jdbcTemplate.queryForObject(
                "SELECT id, code, raison_sociale, numero_contribuable, compte_bancaire, actif FROM tiers WHERE id = ? AND collectivite_id = ?",
                (resultSet, rowNum) -> new FournisseurResponse(
                    resultSet.getObject("id", UUID.class),
                    resultSet.getString("code"),
                    resultSet.getString("raison_sociale"),
                    resultSet.getString("numero_contribuable"),
                    resultSet.getString("compte_bancaire"),
                    resultSet.getBoolean("actif")),
                id, collectiviteId);
            }

    @GetMapping("/lignes-budgetaires")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'ORDONNATEUR', 'CONTROLEUR_FINANCIER', 'CHEF_SERVICE')")
    public List<LigneBudgetaireResponse> lignesBudgetaires() {
        UUID collectiviteId = currentUserService.requireTenantId();
        return jdbcTemplate.query(
                "SELECT id, code, libelle, credit_vote, credit_engage FROM lignes_budgetaires WHERE collectivite_id = ? ORDER BY code",
                (resultSet, rowNum) -> new LigneBudgetaireResponse(
                        resultSet.getObject("id", UUID.class),
                        resultSet.getString("code"),
                        resultSet.getString("libelle"),
                        resultSet.getBigDecimal("credit_vote"),
                        resultSet.getBigDecimal("credit_engage")),
                collectiviteId);
    }

            @GetMapping("/documents-m5")
            @PreAuthorize("hasAnyRole('SUPER_ADMINISTRATEUR', 'ADMINISTRATEUR', 'ORDONNATEUR', 'CHEF_SERVICE')")
            public List<DocumentM5Response> documentsM5(@RequestParam(required = false) String typeDocument) {
            UUID collectiviteId = currentUserService.requireTenantId();
            StringBuilder sql = new StringBuilder(
                "SELECT id, reference, type_document::text AS type_document, NULLIF(metadata ->> 'ligneBudgetaireId', '')::uuid AS ligne_budgetaire_id, tiers_id, objet, montant_ht, montant_taxes, montant_ttc, montant_restant, statut "
                    + "FROM documents_preparatoires WHERE collectivite_id = ?");
            List<Object> parameters = new ArrayList<>();
            parameters.add(collectiviteId);
            if (typeDocument != null && !typeDocument.isBlank()) {
                sql.append(" AND type_document::text = ?");
                parameters.add(typeDocument.trim());
            }
            sql.append(" ORDER BY date_document DESC NULLS LAST, reference");

            return jdbcTemplate.query(
                sql.toString(),
                (resultSet, rowNum) -> new DocumentM5Response(
                    resultSet.getObject("id", UUID.class),
                    resultSet.getString("reference"),
                    resultSet.getString("type_document"),
                    resultSet.getObject("ligne_budgetaire_id", UUID.class),
                        resultSet.getObject("tiers_id", UUID.class),
                    resultSet.getString("objet"),
                    resultSet.getBigDecimal("montant_ht"),
                        resultSet.getBigDecimal("montant_taxes"),
                        resultSet.getBigDecimal("montant_ttc"),
                    resultSet.getBigDecimal("montant_restant"),
                    resultSet.getString("statut")),
                parameters.toArray());
            }

    @PostMapping("/documents-m5")
    @PreAuthorize("hasAnyRole('SUPER_ADMINISTRATEUR', 'ADMINISTRATEUR') and hasAuthority('parametrage:creer')")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentM5Response creerDocumentM5(@RequestBody CreateDocumentM5Request request) {
        UUID collectiviteId = currentUserService.requireTenantId();
        requireText(request.reference(), "La référence M5 est obligatoire.");
        requireText(request.typeDocument(), "Le type de document M5 est obligatoire.");
        requireText(request.objet(), "L'objet du document M5 est obligatoire.");
            if (request.ligneBudgetaireId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La ligne budgétaire est obligatoire.");
        }
            if (!List.of("BON_COMMANDE", "LETTRE_COMMANDE", "MARCHE", "PROVISIONNEL", "AUTRE", "REGULARISATION_470XX")
                    .contains(request.typeDocument().trim())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le type de document M5 est invalide.");
            }
        if (request.montantHT() == null || request.montantHT().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le montant HT doit être positif.");
        }
        boolean ligneExiste = Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM lignes_budgetaires WHERE id = ? AND collectivite_id = ?)",
                Boolean.class, request.ligneBudgetaireId(), collectiviteId));
        if (!ligneExiste) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La ligne budgétaire n'appartient pas à la collectivité sélectionnée.");
        }
        if (request.tiersId() != null && !Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM tiers WHERE id = ? AND collectivite_id = ? AND actif = TRUE)",
                Boolean.class, request.tiersId(), collectiviteId))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le tiers est invalide ou inactif pour cette collectivité.");
        }
        boolean referenceExiste = Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM documents_preparatoires WHERE collectivite_id = ? AND reference = ?)",
                Boolean.class, collectiviteId, request.reference().trim()));
        if (referenceExiste) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette référence M5 existe déjà dans la collectivité.");
        }

        UUID id = UUID.randomUUID();
        BigDecimal taxes = request.montantTaxes() == null ? BigDecimal.ZERO : request.montantTaxes();
            if (taxes.signum() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le montant des taxes ne peut pas être négatif.");
            }
        BigDecimal montantTtc = request.montantHT().add(taxes);
        jdbcTemplate.update(
                "INSERT INTO documents_preparatoires (id, collectivite_id, reference, type_document, objet, tiers_id, montant_ht, montant_taxes, montant_ttc, date_document, montant_restant, statut, metadata) "
                        + "VALUES (?, ?, ?, ?::type_engagement, ?, ?, ?, ?, ?, CURRENT_DATE, ?, 'DISPONIBLE', jsonb_build_object('ligneBudgetaireId', ?))",
                id, collectiviteId, request.reference().trim(), request.typeDocument().trim(), request.objet().trim(),
                request.tiersId(), request.montantHT(), taxes, montantTtc, montantTtc, request.ligneBudgetaireId().toString());
        return new DocumentM5Response(id, request.reference().trim(), request.typeDocument().trim(),
                request.ligneBudgetaireId(), request.tiersId(), request.objet().trim(), request.montantHT(),
                taxes, montantTtc, montantTtc, "DISPONIBLE");
    }

    @PostMapping("/tiers")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'ORDONNATEUR')")
    @ResponseStatus(HttpStatus.CREATED)
    public FournisseurResponse creerTiers(@RequestBody CreateTiersRequest request) {
        UUID collectiviteId = currentUserService.requireTenantId();
        requireText(request.raisonSociale(), "La raison sociale est obligatoire.");
        requireText(request.code(), "Le code du tiers est obligatoire.");
        UUID id = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO tiers (id, collectivite_id, code, raison_sociale, numero_contribuable, compte_bancaire, actif) VALUES (?, ?, ?, ?, ?, ?, TRUE)",
                id, collectiviteId, request.code().trim(), request.raisonSociale().trim(), request.numeroContribuable(), request.compteBancaire());
        return new FournisseurResponse(id, request.code().trim(), request.raisonSociale().trim(), request.numeroContribuable(), request.compteBancaire(), true);
    }

    @PostMapping("/lignes-budgetaires")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'ORDONNATEUR')")
    @ResponseStatus(HttpStatus.CREATED)
    public LigneBudgetaireResponse creerLigne(@RequestBody CreateLigneRequest request) {
        UUID collectiviteId = currentUserService.requireTenantId();
        requireText(request.code(), "Le code budgétaire est obligatoire.");
        requireText(request.libelle(), "Le libellé budgétaire est obligatoire.");
        UUID exerciceId = request.exerciceId() == null ? exerciceCourant().id() : request.exerciceId();
        UUID budgetId = request.budgetId() == null ? findBudgetId(collectiviteId, exerciceId) : request.budgetId();
        UUID id = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO lignes_budgetaires (id, collectivite_id, exercice_id, budget_id, code, libelle, credit_vote, credit_modifie, credit_engage, credit_liquide, credit_mandate, credit_paye) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0)",
                id, collectiviteId, exerciceId, budgetId, request.code().trim(), request.libelle().trim(), request.creditVote() == null ? BigDecimal.ZERO : request.creditVote());
        return new LigneBudgetaireResponse(id, request.code().trim(), request.libelle().trim(), request.creditVote(), BigDecimal.ZERO);
    }

    private UUID findBudgetId(UUID collectiviteId, UUID exerciceId) {
        return jdbcTemplate.query(
                "SELECT id FROM budgets WHERE collectivite_id = ? AND exercice_id = ? ORDER BY created_at LIMIT 1",
                (resultSet, rowNum) -> resultSet.getObject("id", UUID.class), collectiviteId, exerciceId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Aucun budget n'est associé à cet exercice."));
    }

    private void requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    public record ExerciceResponse(UUID id, int annee) {}

    public record FournisseurResponse(UUID id, String code, String nom, String numeroContribuable, String compteBancaire, boolean actif) {}

    public record LigneBudgetaireResponse(UUID id, String code, String libelle, BigDecimal creditVote, BigDecimal creditEngage) {}

            public record DocumentM5Response(UUID id, String reference, String typeDocument, UUID ligneBudgetaireId, UUID tiersId,
                String objet, BigDecimal montantHT, BigDecimal montantTaxes, BigDecimal montantTTC,
                BigDecimal montantRestant, String statut) {}

    public record CreateTiersRequest(String code, String raisonSociale, String numeroContribuable, String compteBancaire) {}

    public record CreateLigneRequest(UUID exerciceId, UUID budgetId, String code, String libelle, BigDecimal creditVote) {}

    public record CreateDocumentM5Request(String reference, String typeDocument, UUID ligneBudgetaireId,
            UUID tiersId, String objet, BigDecimal montantHT, BigDecimal montantTaxes) {}
}
