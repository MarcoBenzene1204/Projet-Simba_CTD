package com.marco.Simba_CTD.service;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.marco.Simba_CTD.entity.DocumentM5;
/**
 * Point d'integration avec le module M5. L'implementation concrete doit etre
 * branchee sur le referentiel des documents preparatoires.
 */
@Service
public class DocumentM5Service {
    private final JdbcTemplate jdbcTemplate;
    private final CurrentUserService currentUserService;

    public DocumentM5Service(JdbcTemplate jdbcTemplate, CurrentUserService currentUserService) {
        this.jdbcTemplate = jdbcTemplate;
        this.currentUserService = currentUserService;
    }

    public boolean documentExiste(UUID documentM5Id) {
        if (documentM5Id == null) {
            return false;
        }
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM documents_preparatoires WHERE id = ? AND collectivite_id = ?)",
                Boolean.class,
                documentM5Id,
                currentUserService.requireTenantId());
        return Boolean.TRUE.equals(exists);
    }

    public boolean documentExiste(UUID documentM5Id, String typeDocument) {
        if (documentM5Id == null || typeDocument == null || typeDocument.isBlank()) {
            return false;
        }
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM documents_preparatoires "
                        + "WHERE id = ? AND collectivite_id = ? AND type_document::text = ?)",
                Boolean.class,
                documentM5Id,
                currentUserService.requireTenantId(),
                typeDocument);
        return Boolean.TRUE.equals(exists);
    }
    public DocumentM5 obtenirDocument(UUID documentM5Id) {
        if (!documentExiste(documentM5Id)) {
            throw new IllegalArgumentException("Reference M5 obligatoire");
        }
        throw new UnsupportedOperationException(
            "L'integration du referentiel M5 doit fournir le document " + documentM5Id
        );
    }
}
