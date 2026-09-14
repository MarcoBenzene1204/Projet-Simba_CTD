package com.marco.Simba_CTD.service;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.marco.Simba_CTD.entity.DocumentM5;
/**
 * Point d'integration avec le module M5. L'implementation concrete doit etre
 * branchee sur le referentiel des documents preparatoires.
 */
@Service
public class DocumentM5Service {
    public boolean documentExiste(UUID documentM5Id) {
        return documentM5Id != null;
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
